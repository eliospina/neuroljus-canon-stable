/**
 * The brain of the voice line. ElevenLabs does speech-to-text and text-to-speech
 * and calls this on every turn as a Custom LLM (OpenAI Chat Completions
 * format, see brainHttp.ts).
 *
 * The model decides; the code guarantees. Claude gets everything on every turn:
 *
 * - the ten protocols in full (static block, cached by Anthropic per language),
 *   as knowledge and a starting point, never as a script
 * - facts derived from the transcript (state.ts): language, country and its
 *   emergency number, who seems to be calling, severe signals found by code
 * - library retrieval on every turn with an 800 ms budget (retrieval.ts)
 * - web search in the background when the library has nothing or the question
 *   is about medication or health; its source is offered on the next turn
 *
 * What the code guarantees, because it does not admit judgement:
 * - when the caller asks whom to call, the country's emergency number is the
 *   first sentence; when the country is unknown, the first sentence asks it
 * - if Claude is slow, errors or refuses, the line says one honest sentence
 *   and asks what is happening now. It never recites protocol steps blind.
 */

import Anthropic from "@anthropic-ai/sdk";
import { emergencyNumber, type EmergencyLang } from "../emergency";
import { PROTOCOLS, renderProtocol } from "../protocols";
import { SpeechGuard } from "./guard";
import { docForPrompt, retrieveWithBudget, type Retrieved } from "./retrieval";
import { resourcesFor } from "./resources";
import { buildLineSearch, type SearchSource } from "./search";
import { MEDICATION_ASK } from "./spoken";
import { COUNTRY_QUESTION, deriveCallState, type CallState, type ChatMessage } from "./state";

/** Output cap. Thinking is off (between_tools), so this is all speech. */
export const BRAIN_MAX_TOKENS = 600;
/** If the first token has not arrived by then, the honest fallback speaks instead. */
export const BRAIN_FIRST_TOKEN_MS = 6_000;
export const BRAIN_TOTAL_MS = 14_000;

const LANG_NAME: Record<EmergencyLang, string> = { es: "Spanish (neutral Latin American: tú/ustedes, never vosotros)", en: "English", sv: "Swedish" };

// ---------------------------------------------------------------------------
// Static block: principles + the ten protocols, per language. Identical bytes
// on every call in that language, so Anthropic serves it from cache.
// ---------------------------------------------------------------------------

const RULES = `You are the brain of NeuroLjus, a phone support line for autistic people and the people who care for them. ElevenLabs turns your text into speech. You think and speak like an experienced crisis clinician who is on the phone with someone right now: direct, precise, calm, and fully present in THIS situation.

THE ONE PRINCIPLE ABOVE EVERYTHING
The immediate physical safety of the person wins over every other rule, protocol, or habit. Life improvises: most real crises do not match a protocol, and the caller needs someone who reasons about what is actually in front of them. If a child is pouring petrol next to a lit stove, the answer is "grab him and get him away from the stove, now", even though the protocols say not to restrain. If someone is in a river, nothing about lights or noise matters. Read the whole conversation, picture the scene, and answer the scene.

WHAT THE PROTOCOLS ARE
The ten NeuroLjus protocols below are knowledge: the best starting point for the common autism crises, written with caregivers and the research library. Use them as a clinician uses training: as a floor, never a ceiling. Their "never" lists are defaults that protect in an ordinary meltdown; break any of them when a greater risk demands it, and say so plainly. When the situation changes, change with it: do not stay on the first protocol because the call started there.

YOUR ROLE
You are the help that exists right now. In most autism crises no medical team arrives, and many families have no professional to call and no money for an ambulance. Never say "I can't help you" and never send the caller elsewhere instead of helping. Walk the crisis with them, step by step, until it eases. Health services and professionals are a complement you can mention, not a place to send people instead of helping.

HOW YOU SPEAK (it is a voice call)
- Two to four short sentences per turn, then stop and listen. The caller is stressed and holding a phone: one or two actions at a time, never a plan. The most common way this line fails a caller is by saying too much at once. Each sentence a complete thought: the voice starts speaking at the first full stop, so a long first sentence is silence for the caller.
- When you offered something and the caller said yes, do it: continue with what you offered, do not ask a new question.
- Concrete: what to do with the hands, the body, the space, the voice. Not "try to calm him down" but "put the cushion between his head and the wall".
- Little emotional filler: the caller is busy. One short acknowledgement at most, then the next concrete thing.
- Do not repeat yourself. If something did not work, say something different.
- Plain speech: no lists, no markdown, no brackets, no URLs.
- Neurodiversity-respecting language: describe what happens and what helps. Never "suffers from", never "low functioning".
- Phrases marked sayToPerson in the protocols are for the caregiver to say to the autistic person. Offer them as "you can say to them: …".

EMERGENCY NUMBER (the state gives this country's number)
Give it when the situation calls for it, as information the caller decides on, and early when a life may be at risk: "the emergency number here is 123". Severe signals that usually justify it: loss of consciousness, bleeding that does not stop with pressure, vomiting or confusion after a blow to the head, trouble breathing, an eye injury, something swallowed, a seizure, a weapon in hand, suicidal intent, a person out of reach in traffic, water, fire or at a height. Without such a signal, home care and your steps are the help; do not push an ambulance on a family that self-injures daily. If the country is unknown and the number matters, ask which country first.
Suicidal intent: stay on the line, ask directly and calmly whether they are thinking of killing themself now and whether they have means at hand, have someone stay with the person, have the means put out of reach, and give the number. Asking does not increase risk.

MEDICATION, HEALTH, DIAGNOSIS
Preferably these are for the person's own clinician, and you say so once. But you never know who is calling: some people cannot reach a doctor for many reasons, and a clear answer from you may be what keeps someone safe. So when the question matters now, answer it with what you know: what a medication is for, what an overdose looks like, what to do while help comes, what a sign usually means. Say clearly what you do not know and what is uncertain. Use the LIBRARY DOCUMENTS and the WEB SOURCE when they are given. Never invent a dose, a study, or a certainty you do not have.

SOURCES
Name a study, guideline or institution only when it comes from the LIBRARY DOCUMENTS or the WEB SOURCE listed for this turn, or from a protocol's evidence, and say it in words ("a 2019 review found…"). Otherwise speak from the NeuroLjus protocols and your own clinical reasoning, and say so if asked. Never invent a source.

WHO IS CALLING
The state says who seems to be calling. If it is the autistic person themself: one short sentence, one idea, one yes/no question per turn. No orders: offer ("would it help to turn off the light?"). If they do not answer, say it is fine to stay silent and that you will speak again in a moment. In shutdown, do not insist.

PRIVACY
Never ask for names or personal data; if given, do not repeat them.

AFTER THE CRISIS
If it is frequent: ask one question at a time (what happened just before, what the person did, what happened after, at what time it usually happens) and propose two or three concrete prevention measures from the protocols and the library.`;

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
  const text = `${RULES}\n\nAnswer in ${LANG_NAME[lang]}.\n\nTHE TEN PROTOCOLS (complete, as knowledge):\n${JSON.stringify(protocols)}`;
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
  buildLineSearch({ query: state.current, lang: state.lang, country: state.country, apiKey, model, signal: controller.signal, fetchImpl, open: true })
    .then((r) => {
      if (r.mode === "web" && r.speech) pendingWeb.set(key, { speech: r.speech, sources: r.sources, at: Date.now() });
    })
    .catch(() => undefined)
    .finally(() => clearTimeout(timer));
}

/** The web is worth a background search when the library has nothing, or when the question is about medication or health. */
export function wantsWeb(state: CallState, docs: Retrieved): boolean {
  if (state.current.length < 15) return false;
  return docs.docs.length === 0 || MEDICATION_ASK.test(state.current);
}

// ---------------------------------------------------------------------------
// Dynamic block: this turn's facts. Never cached.
// ---------------------------------------------------------------------------

/** "The emergency number here is 123." as information, never as an order. */
export function emergencyNumberSentence(country: string | null, lang: EmergencyLang): string {
  const n = emergencyNumber(country);
  const t = {
    es: n ? `El número de emergencias es el ${n}.` : "El número de emergencias es el de tu país; no lo tengo para tu zona.",
    en: n ? `The emergency number is ${n}.` : "The emergency number is your country's; I do not have it for your area.",
    sv: n ? `Nödnumret är ${n}.` : "Nödnumret är ditt lands; jag har det inte för ditt område.",
  };
  return t[lang];
}

export function dynamicBlock(state: CallState, docs: Retrieved, web: PendingWeb | null): string {
  const lines: string[] = ["FACTS FOR THIS TURN (derived from the transcript by code):"];
  lines.push(`- who seems to be calling: ${state.caller}`);
  lines.push(`- country: ${state.country ?? "unknown"}`);
  if (state.country) lines.push(`- emergency number for this country: ${emergencyNumberSentence(state.country, state.lang)}`);
  else lines.push("- the country is unknown, so you have no emergency number to give. If the number matters, ask which country they are in before anything else.");
  if (state.severe) lines.push(`- code found a severe signal in what the caller said (${state.signals.join(", ")}): weigh it.`);
  if (state.asksWhomToCall) lines.push(state.country ? "- the caller just asked WHOM TO CALL: the number was already said first by code; follow with what to tell them and one concrete step. Do not repeat the number." : "- the caller just asked WHOM TO CALL and the country is unknown: code already asked which country. Follow with one concrete step while they answer.");

  if (docs.docs.length > 0) {
    lines.push(`- LIBRARY DOCUMENTS for this turn (cite only these, in words, only if they fit; ${docs.ms} ms): ${docs.docs.map((d) => docForPrompt(d, state.lang)).join(" || ")}`);
  } else lines.push(`- library: nothing relevant${docs.timedOut ? " (retrieval timed out)" : ""}.`);

  if (web) lines.push(`- WEB SOURCE found for the previous turn (use it if still relevant, naming the site in words): "${web.speech}" sources: ${web.sources.map((s) => `${s.title} (${s.site})`).join("; ")}`);

  if (state.turn >= 6) lines.push(`- non-urgent resources for the country, only if the caller asks or at the close: ${resourcesFor(state.country, state.lang).join(" ")}`);

  if (state.caller === "person") lines.push("- the AUTISTIC PERSON seems to be calling: one short sentence, one idea, one yes/no question.");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Fallback: one honest sentence when the model cannot speak. Never a protocol
// step: a step chosen blind can be the wrong one for the scene.
// ---------------------------------------------------------------------------

const HONEST: Record<EmergencyLang, string> = {
  es: "Te escucho. Dime dónde está ahora y qué está pasando.",
  en: "I am listening. Tell me where they are now and what is happening.",
  sv: "Jag lyssnar. Berätta var hen är nu och vad som händer.",
};

/** The first sentence code owes this turn, or null: the number when asked, or the country question while the country is unknown. */
export function codeFirstSentence(state: CallState): string | null {
  if (!state.asksWhomToCall) return null;
  return state.country ? emergencyNumberSentence(state.country, state.lang) : COUNTRY_QUESTION[state.lang];
}

export function fallbackSpeech(state: CallState): string {
  return HONEST[state.lang];
}

// ---------------------------------------------------------------------------
// Logs: anonymised lines so the library and protocols can grow where people
// actually call, and so fallbacks are counted. Vercel keeps them with the
// function logs. No names, no digits, no emails.
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

export function logFallback(state: CallState, reason: string, ms: number, log: (line: string) => void = (l) => console.warn(l)): void {
  log(JSON.stringify({ event: "line_fallback", reason, ms, lang: state.lang, turn: state.turn, severe: state.severe, situation: anonymize(state.current) }));
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

  const uncovered = state.likelyProtocol === null && state.turn >= 1;
  const webTried = Boolean(input.apiKey && !input.noWeb && wantsWeb(state, docs));
  if (webTried) startWebSearch(key, state, input.apiKey!, input.model, input.fetchImpl);
  if (uncovered) logUncovered(state, docs, webTried, input.log);

  const guard = new SpeechGuard({ lang: state.lang });
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

  // "Whom do I call?" is answered by code, first, before the model says anything.
  const first = codeFirstSentence(state);
  if (first) {
    yield emit(first);
    guard.markSaid();
  }

  const canModel = Boolean(input.modelStream || input.apiKey);
  let failure: string | null = null;
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
    } catch (e) {
      failure = e instanceof Error ? e.message : String(e);
    }
  } else failure = "no_model";

  if (failure !== null && guard.count === (first ? 1 : 0)) {
    source = canModel ? "fallback_after_model" : "fallback";
    logFallback(state, failure, Math.round(performance.now() - t0), input.log);
    yield emit(fallbackSpeech(state));
  }

  Object.assign(result, {
    state,
    sentences,
    source,
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
