/**
 * The brain of the voice line. ElevenLabs does speech-to-text and text-to-speech
 * and calls this on every turn as a Custom LLM (OpenAI Chat Completions
 * format, see brainHttp.ts). Everything the model needs is in the prompt on
 * every turn, so nothing depends on the model deciding to call a tool:
 *
 * - the ten protocols in full (static block, cached by Anthropic per language)
 * - call state derived from the transcript (state.ts): caller, country,
 *   protocol and phase, steps already given, triage
 * - the clinical rules in code (triage.ts, guard.ts): the emergency number is
 *   only offered on a severe signal, no medication, no diagnosis, no filler,
 *   no repeated step
 * - library retrieval on every turn with an 800 ms budget (retrieval.ts)
 * - web search in the background when the library has nothing; its source is
 *   offered on the next turn, never blocking this one
 *
 * If Claude is slow, errors or refuses, the protocol itself speaks (fallback).
 */

import Anthropic from "@anthropic-ai/sdk";
import { dangerSentence, type EmergencyLang } from "../emergency";
import { PHASE_IDS, PROTOCOLS, getProtocol, renderProtocol } from "../protocols";
import { SpeechGuard } from "./guard";
import { docForPrompt, retrieveWithBudget, type Retrieved } from "./retrieval";
import { resourcesFor } from "./resources";
import { buildLineSearch, type SearchSource } from "./search";
import { deriveCallState, type CallState, type ChatMessage } from "./state";
import { FIRST_AID_TEXT, TRIAGE_QUESTION, firstAidFor } from "./triage";

/** Output cap. Thinking is off (between_tools), so this is all speech. */
export const BRAIN_MAX_TOKENS = 600;
/** If the first token has not arrived by then, the protocol speaks instead. */
export const BRAIN_FIRST_TOKEN_MS = 4_000;
export const BRAIN_TOTAL_MS = 12_000;

const LANG_NAME: Record<EmergencyLang, string> = { es: "Spanish (neutral Latin American: tú/ustedes, never vosotros)", en: "English", sv: "Swedish" };

// ---------------------------------------------------------------------------
// Static block: rules + the ten protocols, per language. Identical bytes on
// every call in that language, so Anthropic serves it from cache (~23k tokens).
// ---------------------------------------------------------------------------

const RULES = `You are the brain of NeuroLjus, a phone support line for autistic people and the people who care for them. ElevenLabs turns your text into speech. You speak like an experienced crisis clinician: direct, precise, calm. You give concrete instructions grounded in the protocols and documents below. You never diagnose. The caller decides.

YOUR ROLE
You are the help that exists right now. In most autism crises no medical team arrives, and many families have no professional to call. Never say "I can't help you" and never send the caller elsewhere instead of helping. Walk the crisis with them, step by step, until it eases. Mention professionals or health services at most once, near the end, as a complement.

HOW YOU SPEAK
- 2 to 4 short sentences per turn, each at most 12 words: the voice starts speaking at the first full stop, so a long first sentence is silence for the caller. Imperative: "Do this. Then this." One step at a time, then stop and listen. Anything beyond 4 sentences is cut before it is spoken.
- No emotional filler: never "I'm sorry", "that must be exhausting", "I understand", "I'm with you", "you're not alone", "you did well". No stage tags like [slow] or [warm]. If the caller shows distress, at most one short acknowledging sentence, then back to the concrete step.
- Never repeat a step already given in this call (the state below lists them). If something did not work, give the next different step.
- Sources: name a source only when it comes from the LIBRARY DOCUMENTS or PENDING WEB SOURCE listed for this turn, or from a protocol's evidence. Say it in words ("a 2019 study found…", "according to the NHS…"). Otherwise say "according to the NeuroLjus protocol" and nothing more. Never name guidelines, studies or institutions from memory.
- Plain speech: no lists, no markdown, no brackets, no URLs, no numbers in brackets.
- Neurodiversity-respecting language: describe what happens and what helps. Never "suffers from", never "low functioning".
- Phrases marked sayToPerson in the protocols are for the caregiver to say to the autistic person. Offer them as "you can say to them: …". Never say them to the caller as if they were yours.

TRIAGE (the state tells you what applies)
- In self-injury or aggression, if the triage question has not been asked yet, ask it once, exactly as given in the state, and nothing else in that turn except one immediate safety step.
- Only with a severe signal may you mention the emergency number: say the exact emergency sentence from the state, then keep giving steps while they call. Without a severe signal NEVER mention emergencies, ambulances or emergency numbers: give home first aid (the state gives the lines) and the protocol steps.
- Suicidal intent is always severe: stay on the line, ask directly and calmly whether they are thinking of killing themself now and whether they have means at hand, have someone stay with the person, have the means removed, and give the emergency sentence. Asking does not increase risk.

WHO IS CALLING
- Caregiver: follow the protocol phase and steps.
- The autistic person themself: one short sentence, one idea, one yes/no question per turn. No orders: offer ("would it help to turn off the light?"). If they do not answer, say it is fine to stay silent and that you will speak again in a moment. In shutdown, do not insist.

WHAT YOU NEVER DO
Never diagnose. Never talk about medication or doses ("that is for their doctor"). Never invent sources or figures. Never ask for names or personal data; if given, do not repeat them.

UNCOVERED CASES
If the state says no protocol matched, do not force one. Use the library documents and the general de-escalation ladder (remove the demand, clear the space of people, reduce stimuli, offer a safe sensory alternative, check for pain, wait at a safe distance) with the same rules.

After the crisis, if it is frequent: ask one question at a time (what happened just before, what the person did, what happened after, at what time it usually happens) and propose two or three concrete prevention measures.`;

const staticCache = new Map<EmergencyLang, string>();

export function staticBlock(lang: EmergencyLang): string {
  const hit = staticCache.get(lang);
  if (hit) return hit;
  const protocols = PROTOCOLS.map((p) => {
    const r = renderProtocol(p, lang, null);
    return {
      id: r.id,
      number: r.number,
      title: r.title,
      recognize: r.recognize,
      phases: r.phases,
      never: r.never,
      callEmergencyWhen: r.escalate.callWhen,
      contactProfessionalWhen: r.escalate.contactWhen,
      evidence: r.evidence.map((e) => ({ id: e.id, level: e.level, supports: e.supports })),
      evidenceNote: r.evidenceNote,
    };
  });
  const text = `${RULES}\n\nAnswer in ${LANG_NAME[lang]}.\n\nTHE TEN PROTOCOLS (complete):\n${JSON.stringify(protocols)}`;
  staticCache.set(lang, text);
  return text;
}

// ---------------------------------------------------------------------------
// Pending web sources: found in the background on one turn, offered on the next.
// Per instance and best effort: a lost instance only loses a pending source.
// ---------------------------------------------------------------------------

type PendingWeb = { speech: string; sources: SearchSource[]; at: number };
const pendingWeb = new Map<string, PendingWeb>();
const PENDING_TTL_MS = 10 * 60_000;
const PENDING_MAX = 500;

export function conversationKey(messages: ChatMessage[], extra: Record<string, unknown> | undefined): string {
  const id = extra && typeof extra.conversation_id === "string" ? extra.conversation_id : null;
  if (id) return id;
  const first = messages.find((m) => m.role === "user");
  const text = first ? String(typeof first.content === "string" ? first.content : JSON.stringify(first.content)) : "";
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return `h${h.toString(16)}`;
}

function takePendingWeb(key: string): PendingWeb | null {
  const p = pendingWeb.get(key);
  if (!p) return null;
  pendingWeb.delete(key);
  return Date.now() - p.at > PENDING_TTL_MS ? null : p;
}

function startWebSearch(key: string, state: CallState, apiKey: string, model: string, fetchImpl?: typeof fetch): void {
  if (pendingWeb.size >= PENDING_MAX) pendingWeb.clear();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9_000);
  buildLineSearch({ query: state.current, lang: state.lang, country: state.country, apiKey, model, signal: controller.signal, fetchImpl })
    .then((r) => {
      if (r.mode === "web" && r.speech) pendingWeb.set(key, { speech: r.speech, sources: r.sources, at: Date.now() });
    })
    .catch(() => undefined)
    .finally(() => clearTimeout(timer));
}

// ---------------------------------------------------------------------------
// Dynamic block: this turn's state. Never cached.
// ---------------------------------------------------------------------------

export function dynamicBlock(state: CallState, docs: Retrieved, web: PendingWeb | null): string {
  const lines: string[] = ["CALL STATE (derived from the transcript by code; follow it):"];
  lines.push(`- caller: ${state.caller}`);
  lines.push(`- country: ${state.country ?? "unknown"}`);
  if (state.severe) {
    lines.push(`- SEVERE SIGNAL present (${state.signals.join(", ")}). You may say, once, this exact emergency sentence: "${dangerSentence(state.country, state.lang)}" Keep giving steps while they call.`);
  } else {
    lines.push("- no severe signal: NEVER mention emergencies, ambulances or emergency numbers this turn.");
  }
  const needsTriage = !state.calm && (state.protocol === "self_injury" || state.protocol === "aggression_people" || state.protocol === "aggression_objects" || state.protocol === "physical_danger");
  if (needsTriage && !state.triageAsked && !state.severe) lines.push(`- triage: NOT asked yet. Ask it now, exactly: "${TRIAGE_QUESTION[state.lang]}" plus one immediate safety step.`);
  else if (state.triageAsked && state.triageClear) lines.push("- triage: asked and answered, no severe signs. Home care only.");
  else if (state.triageAsked) lines.push("- triage: already asked. Do not ask it again.");
  const aid = firstAidFor(state.current);
  if (aid.length > 0 && !state.severe) lines.push(`- home first aid that fits: ${aid.map((a) => FIRST_AID_TEXT[state.lang][a]).join(" ")}`);

  if (state.calm) {
    lines.push("- CALM QUESTION, nothing is happening right now: answer from the library documents below in 2 to 4 sentences and name the source in words. Do not give crisis steps and do not ask the triage question. If the library has nothing, say what the NeuroLjus protocols suggest and that you can look further.");
  } else if (state.protocol) {
    const p = getProtocol(state.protocol)!;
    const r = renderProtocol(p, state.lang, state.country);
    const phase = r.phases.find((x) => x.id === state.phase)!;
    lines.push(`- protocol: ${r.number} ${r.title} (${state.protocol}), phase: ${state.phase} (${phase.goal})`);
    const notGiven = phase.steps.map((s, i) => ({ key: `${state.phase}.${i}`, text: s })).filter((s) => !state.stepsGiven.includes(s.key));
    const given = state.stepsGiven.map((k) => {
      const [ph, i] = k.split(".");
      return r.phases.find((x) => x.id === ph)?.steps[Number(i)] ?? "";
    }).filter(Boolean);
    if (given.length > 0) lines.push(`- steps ALREADY GIVEN in this call (do not repeat): ${given.map((g) => `"${g}"`).join(" | ")}`);
    if (notGiven.length > 0) lines.push(`- next steps of this phase not yet given, in order: ${notGiven.map((s) => `"${s.text}"`).join(" | ")}`);
    else {
      const idx = PHASE_IDS.indexOf(state.phase);
      const next = idx < PHASE_IDS.length - 1 ? r.phases[idx + 1] : null;
      lines.push(next ? `- all steps of this phase were given. Move to phase ${next.id}: ${next.steps.map((s) => `"${s}"`).join(" | ")}` : "- all phases given. Close: ask if they need anything else.");
    }
    lines.push(`- protocol evidence you may cite in words: ${r.evidence.map((e) => `${e.id} (${e.level})`).join(", ")}`);
  } else {
    lines.push("- protocol: NONE matched (uncovered case). Use the library documents below and the general ladder. Do not force a protocol.");
  }

  if (docs.docs.length > 0) {
    lines.push(`- LIBRARY DOCUMENTS for this turn (cite only these, in words, only if they fit; ${docs.ms} ms): ${docs.docs.map((d) => docForPrompt(d, state.lang)).join(" || ")}`);
  } else lines.push(`- library: nothing relevant${docs.timedOut ? " (retrieval timed out)" : ""}. Say "according to the NeuroLjus protocol" if you need to name a source.`);

  if (web) lines.push(`- PENDING WEB SOURCE from the previous turn (offer it in one sentence if still relevant, naming the site in words): "${web.speech}" sources: ${web.sources.map((s) => `${s.title} (${s.site})`).join("; ")}`);

  if (state.phase === "recovery" || state.turn >= 6) lines.push(`- non-urgent resources for the country, only if the caller asks or at the close: ${resourcesFor(state.country, state.lang).join(" ")}`);

  if (state.caller === "person") lines.push("- the AUTISTIC PERSON is calling: one short sentence, one idea, one yes/no question. No orders. Max 2 sentences.");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Fallback: the protocol speaks when the model cannot.
// ---------------------------------------------------------------------------

const LADDER: Record<EmergencyLang, string[]> = {
  es: ["Retira la demanda o la tarea en curso.", "Saca del espacio a las demás personas.", "Apaga pantallas, música y luces fuertes.", "Ofrece algo seguro para morder o presión con un cojín, sin sujetar.", "Revisa señales de dolor: oídos, dientes, estómago.", "Espera en silencio a distancia segura.", "Cuéntame qué pasa ahora."],
  en: ["Remove the demand or the task in progress.", "Move the other people out of the space.", "Turn off screens, music and bright lights.", "Offer something safe to bite or pressure with a cushion, without holding.", "Check for signs of pain: ears, teeth, stomach.", "Wait in silence at a safe distance.", "Tell me what is happening now."],
  sv: ["Ta bort kravet eller uppgiften.", "För ut de andra personerna ur rummet.", "Stäng av skärmar, musik och starkt ljus.", "Erbjud något säkert att bita på eller tryck med en kudde, utan att hålla fast.", "Kolla tecken på smärta: öron, tänder, mage.", "Vänta tyst på säkert avstånd.", "Berätta vad som händer nu."],
};

const PERSON_FALLBACK: Record<EmergencyLang, string[]> = {
  es: ["No tienes que hacer nada ahora.", "¿Te ayudaría que me quede callada un rato?"],
  en: ["You do not have to do anything right now.", "Would it help if I stayed quiet for a bit?"],
  sv: ["Du behöver inte göra något just nu.", "Skulle det hjälpa om jag var tyst en stund?"],
};

export function fallbackSpeech(state: CallState): string {
  const out: string[] = [];
  if (state.severe) out.push(dangerSentence(state.country, state.lang));
  if (state.caller === "person") {
    for (const s of PERSON_FALLBACK[state.lang]) if (!state.assistantText.some((a) => a.includes(s))) out.push(s);
    return out.slice(0, 2).join(" ");
  }
  if (state.protocol) {
    const r = renderProtocol(getProtocol(state.protocol)!, state.lang, state.country);
    const phase = r.phases.find((x) => x.id === state.phase)!;
    const next = phase.steps.map((s, i) => ({ key: `${state.phase}.${i}`, text: s })).filter((s) => !state.stepsGiven.includes(s.key)).slice(0, 2);
    for (const s of next) out.push(s.text);
  }
  if (out.length < 2) {
    const ladder = LADDER[state.lang].filter((s) => !state.assistantText.some((a) => a.includes(s)));
    for (const s of ladder) {
      if (out.length >= 3) break;
      out.push(s);
    }
  }
  return out.slice(0, 4).join(" ");
}

// ---------------------------------------------------------------------------
// Uncovered cases: anonymised log line so the library and protocols can grow
// where people actually call. Vercel keeps it with the function logs.
// ---------------------------------------------------------------------------

export function anonymize(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/@\w+/g, "[handle]")
    .replace(/\d/g, "#")
    // Capitalised words after the first of a sentence are most likely names.
    .replace(/(?<=[^.!?]\s)([A-ZÁÉÍÓÚÑÅÄÖ][\p{Ll}]{2,})/gu, "[nombre]")
    .slice(0, 200);
}

export function logUncovered(state: CallState, docs: Retrieved, webTried: boolean, log: (line: string) => void = (l) => console.info(l)): void {
  if (process.env.LINE_LOG_UNCOVERED === "0") return;
  if (state.current.length < 15) return;
  log(JSON.stringify({ event: "line_uncovered", lang: state.lang, turn: state.turn, severe: state.severe, situation: anonymize(state.current), libraryDocs: docs.docs.map((d) => d.id), webTried }));
}

// ---------------------------------------------------------------------------
// The turn
// ---------------------------------------------------------------------------

export type BrainInput = {
  messages: ChatMessage[];
  extra?: Record<string, unknown>;
  hints?: { lang?: EmergencyLang | null; country?: string | null };
  apiKey: string | null;
  model: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  /** Test hook: a function that streams text deltas instead of calling Claude. */
  modelStream?: (system: string[], messages: Array<{ role: "user" | "assistant"; content: string }>) => AsyncIterable<string>;
  /** Test hook: skip the background web search. */
  noWeb?: boolean;
  log?: (line: string) => void;
};

export type BrainTurn = {
  state: CallState;
  /** Sentences spoken, in order. */
  sentences: string[];
  /** Where the words came from. */
  source: "model" | "fallback" | "fallback_after_model";
  dropped: SpeechGuard["dropped"];
  retrieval: { ms: number; docs: string[]; timedOut: boolean };
  /** Milliseconds to the first spoken sentence. */
  firstSentenceMs: number;
  totalMs: number;
};

/** Turns the OpenAI-style history into alternating Claude messages ending with the user turn. */
export function toClaudeMessages(messages: ChatMessage[]): Array<{ role: "user" | "assistant"; content: string }> {
  const out: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    const text = (typeof m.content === "string" ? m.content : JSON.stringify(m.content)).trim();
    if (!text) continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += `\n${text}`;
    else out.push({ role: m.role, content: text });
  }
  while (out.length > 0 && out[0].role !== "user") out.shift();
  if (out.length === 0 || out[out.length - 1].role !== "user") out.push({ role: "user", content: "…" });
  return out;
}

async function* claudeStream(input: BrainInput, system: string[], messages: Array<{ role: "user" | "assistant"; content: string }>): AsyncIterable<string> {
  const client = new Anthropic({ apiKey: input.apiKey!, maxRetries: 0, timeout: BRAIN_TOTAL_MS, fetch: input.fetchImpl as never });
  // No thinking before speaking: measured ~1 s to the first token with the cached prompt, and
  // thinking tokens would otherwise eat the output cap. LINE_BRAIN_THINKING=adaptive turns it back on.
  const thinking = (process.env.LINE_BRAIN_THINKING || "").trim() === "adaptive" ? undefined : ({ type: "between_tools" } as const);
  const stream = client.messages.stream(
    {
      model: input.model,
      max_tokens: BRAIN_MAX_TOKENS,
      system: [
        { type: "text", text: system[0], cache_control: { type: "ephemeral" } },
        { type: "text", text: system[1] },
      ],
      messages,
      output_config: { effort: "low" },
      ...(thinking ? { thinking } : {}),
    },
    { signal: input.signal }
  );
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") throw new Error("refusal");
}

/** One turn: yields spoken sentences as they are ready; `result` is filled when done. */
export async function* brainTurn(input: BrainInput, result: Partial<BrainTurn> = {}): AsyncGenerator<string> {
  const t0 = performance.now();
  const state = deriveCallState(input.messages, input.hints);
  const key = conversationKey(input.messages, input.extra);
  const web = takePendingWeb(key);
  const docs = await retrieveWithBudget(state.current, state.userText.slice(0, -1));

  const uncovered = state.protocol === null && state.turn >= 1;
  const webTried = Boolean(uncovered && input.apiKey && !input.noWeb && docs.docs.length === 0);
  if (webTried) startWebSearch(key, state, input.apiKey!, input.model, input.fetchImpl);
  if (uncovered) logUncovered(state, docs, webTried, input.log);

  const guard = new SpeechGuard({ lang: state.lang, severe: state.severe, suicidal: state.signals.includes("suicidal"), previous: state.assistantText, maxSentences: state.caller === "person" ? 2 : 4 });
  const system = [staticBlock(state.lang), dynamicBlock(state, docs, web)];
  const messages = toClaudeMessages(input.messages);

  const sentences: string[] = [];
  let firstSentenceMs = 0;
  let source: BrainTurn["source"] = "model";
  const emit = (s: string) => {
    if (!firstSentenceMs) firstSentenceMs = Math.round(performance.now() - t0);
    sentences.push(s);
    return s;
  };

  const canModel = Boolean(input.modelStream || input.apiKey);
  if (canModel) {
    try {
      const streamer = input.modelStream ? input.modelStream(system, messages) : claudeStream(input, system, messages);
      let gotFirst = false;
      const firstTimer = setTimeout(() => {
        if (!gotFirst) input.signal?.dispatchEvent?.(new Event("abort"));
      }, BRAIN_FIRST_TOKEN_MS);
      const deadline = Date.now() + BRAIN_FIRST_TOKEN_MS;
      for await (const delta of streamer) {
        if (!gotFirst && Date.now() > deadline) throw new Error("first_token_timeout");
        gotFirst = true;
        for (const s of guard.push(delta)) yield emit(s);
      }
      clearTimeout(firstTimer);
      for (const s of guard.flush()) yield emit(s);
    } catch {
      source = sentences.length > 0 ? "model" : "fallback_after_model";
    }
  } else source = "fallback";

  if (sentences.length === 0) {
    source = source === "model" ? "fallback_after_model" : source;
    for (const s of guard.flush()) yield emit(s);
    if (sentences.length === 0) {
      const fb = new SpeechGuard({ lang: state.lang, severe: state.severe, previous: state.assistantText, maxSentences: 4 });
      for (const s of [...fb.push(fallbackSpeech(state)), ...fb.flush()]) yield emit(s);
      if (sentences.length === 0) yield emit(fallbackSpeech(state));
    }
  }

  Object.assign(result, {
    state,
    sentences,
    source,
    dropped: guard.dropped,
    retrieval: { ms: docs.ms, docs: docs.docs.map((d) => d.id), timedOut: docs.timedOut },
    firstSentenceMs,
    totalMs: Math.round(performance.now() - t0),
  } satisfies BrainTurn);
}

/** Whole turn as text, for tests and the eval. */
export async function brainTurnText(input: BrainInput): Promise<BrainTurn> {
  const result: Partial<BrainTurn> = {};
  const out: string[] = [];
  for await (const s of brainTurn(input, result)) out.push(s);
  return result as BrainTurn;
}
