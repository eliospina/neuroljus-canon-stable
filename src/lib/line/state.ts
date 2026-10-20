/**
 * Call state for the brain, derived from the conversation ElevenLabs resends
 * on every turn. Nothing is stored server-side: the same messages always give
 * the same state, so instances need no shared memory and a lost instance loses
 * nothing. Deterministic and tested.
 */

import type { EmergencyLang } from "../emergency";
import { PHASE_IDS, PROTOCOLS, getProtocol, type PhaseId, type ProtocolId } from "../protocols";
import { chooseProtocol, protocolScores, urgencyRank } from "./protocol";
import { TRIAGE_QUESTION, answersNoSevere, severeSignals, type SevereSignal } from "./triage";

export type ChatMessage = { role: "system" | "user" | "assistant" | string; content: unknown };

export type CallerRole = "caregiver" | "person" | "unknown";

export type CallState = {
  lang: EmergencyLang;
  country: string | null;
  caller: CallerRole;
  /** A calm question (nothing happening now): answer from the library, no protocol steps. */
  calm: boolean;
  /** Chosen protocol, or null when nothing matched (an uncovered case: library and web instead). */
  protocol: ProtocolId | null;
  /** True when a keyword matched; false when the fallback protocol would have been used. */
  matched: boolean;
  phase: PhaseId;
  /** Severe signals found anywhere in what the caller said. */
  severe: boolean;
  signals: SevereSignal[];
  /** The triage question was already asked by the assistant. */
  triageAsked: boolean;
  /** The caller answered the triage question with "no severe signs". */
  triageClear: boolean;
  /** Protocol steps already given, as "phase.index" keys. */
  stepsGiven: string[];
  /** Number of user turns so far (this one included). */
  turn: number;
  /** Text of the current user turn. */
  current: string;
  /** All user text, oldest first, for retrieval context. */
  userText: string[];
  /** Previous assistant texts, for the repeat guard. */
  assistantText: string[];
};

export function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((c) => (typeof c === "string" ? c : typeof c?.text === "string" ? c.text : "")).join(" ");
  return "";
}

const L = "(?<![\\p{L}\\p{N}])";
const R = "(?![\\p{L}\\p{N}])";
const w = (alts: string, flags = "iu") => new RegExp(`${L}(?:${alts})${R}`, flags);

// --- language -------------------------------------------------------------

const STOP: Record<EmergencyLang, RegExp> = {
  es: w("el|la|los|las|de|que|y|no|mi|hijo|hija|se|es|un|una|con|por|para|est[áa]|pero|qu[ée]|c[oó]mo|hago|tiene|puedo|muy|ya|le|lo|me", "giu"),
  en: w("the|and|my|is|he|she|it|not|to|of|in|on|with|what|do|i|can'?t|won'?t|don'?t|his|her|son|daughter|are|was|have|has|just|now|keeps", "giu"),
  sv: w("och|att|det|är|inte|min|mitt|han|hon|jag|vad|ska|g[öo]r|med|p[åa]|i|en|ett|som|har|kan|nu|bara|sig|sin|sitt|hela|f[öo]r|till|den", "giu"),
};

export function detectLang(text: string, fallback: EmergencyLang = "es"): EmergencyLang {
  const t = text.normalize("NFC");
  if (/[åäö]/i.test(t)) return "sv";
  const score = (Object.keys(STOP) as EmergencyLang[]).map((l) => [l, (t.match(STOP[l]) ?? []).length] as const);
  score.sort((a, b) => b[1] - a[1]);
  return score[0][1] === 0 ? fallback : score[0][0];
}

// --- country --------------------------------------------------------------

const COUNTRIES: Array<[string, RegExp]> = [
  ["SE", w("suecia|sweden|sverige|estocolmo|stockholm|g[öo]teborg|malm[öo]|svensk\\p{L}*|swedish")],
  ["ES", w("espa[ñn]a|spain|spanien|madrid|barcelona|valencia|sevilla|espa[ñn]ol(a)?s?")],
  ["CO", w("colombia|colombian\\p{L}*|bogot[áa]|medell[ií]n|cali|kolumbien")],
  ["MX", w("m[ée]xico|mexico|mexikan\\p{L}*|mexican\\p{L}*|cdmx|guadalajara|monterrey")],
  ["US", w("estados unidos|united states|usa|u\\.s\\.|eeuu|ee\\.uu\\.|america|new york|california|texas|florida|usa:s")],
  ["GB", w("reino unido|inglaterra|united kingdom|england|britain|uk|london|londres|storbritannien|england")],
  ["BR", w("brasil|brazil|brasilien|s[ãa]o paulo|rio de janeiro")],
  ["CL", w("chile|chilen\\p{L}*|santiago de chile")],
  ["PE", w("per[úu]|peru|lima|peruan\\p{L}*")],
  ["AR", w("argentina|buenos aires|argentin\\p{L}*")],
  ["UY", w("uruguay|montevideo")],
  ["EC", w("ecuador|quito|guayaquil")],
  ["CA", w("canad[áa]|canada|toronto|montreal|vancouver")],
  ["AU", w("australia|sydney|melbourne")],
  ["DE", w("alemania|germany|deutschland|berl[ií]n|tyskland")],
  ["FR", w("francia|france|par[ií]s|frankrike")],
  ["NO", w("noruega|norway|norge|oslo")],
  ["DK", w("dinamarca|denmark|danmark|k[öo]penhamn|copenhague")],
  ["FI", w("finlandia|finland|helsinki|helsingfors")],
];

/** Last country named by the caller, as an ISO code; null when none. */
export function detectCountry(userTexts: string[]): string | null {
  for (let i = userTexts.length - 1; i >= 0; i--) {
    const t = userTexts[i].normalize("NFC");
    for (const [code, re] of COUNTRIES) if (re.test(t)) return code;
  }
  return null;
}

// --- caller ---------------------------------------------------------------

const PERSON = w("soy autista|yo soy|me quiero morir|no puedo hablar|no puedo moverme|estoy en bloqueo|estoy bloquead\\p{L}*|me estoy|me siento|i'?m autistic|i am autistic|i can'?t (speak|talk|move)|i'?m (shutting down|frozen|overwhelmed)|i want to die|i feel|jag [äa]r autistisk|jag kan inte (prata|r[öo]ra mig)|jag vill d[öo]|jag k[äa]nner|jag m[åa]r");
const CAREGIVER = w("mi (hijo|hija|ni[ñn]o|ni[ñn]a|hermano|hermana|pareja|alumno|alumna|paciente|beb[ée])|la persona que cuido|cuido a|my (son|daughter|child|kid|brother|sister|partner|student|patient)|i care for|the person i care for|min (son|dotter|bror|syster|partner|elev)|mitt barn|han sl[åa]r|hon sl[åa]r|se golpea|se pega|se muerde|me pega|he hits|she hits|he bangs|she bangs|dunkar|sl[åa]r sig");

export function detectCaller(userTexts: string[]): CallerRole {
  const t = userTexts.join(" ").normalize("NFC");
  const p = (t.match(new RegExp(PERSON.source, "giu")) ?? []).length;
  const c = (t.match(new RegExp(CAREGIVER.source, "giu")) ?? []).length;
  if (p === 0 && c === 0) return "unknown";
  return p > c ? "person" : "caregiver";
}

// --- phase ----------------------------------------------------------------

const PHASE_SIGNAL: Array<[PhaseId, RegExp]> = [
  ["recovery", w("ya (est[áa]|se) (tranquil\\p{L}*|calm\\p{L}*|dormid\\p{L}*)|ya pas[oó]|se durmi[oó]|est[áa] bien ya|calm now|it'?s over|asleep now|settled|lugn nu|det [äa]r [öo]ver|sover nu|har lugnat sig")],
  ["descent", w("se est[áa] calmando|est[áa] bajando|va bajando|m[áa]s tranquil\\p{L}*|menos|ya no (grita|pega|se golpea)|par[oó] de|dej[oó] de|calming down|easing|less|stopped (hitting|screaming|crying)|quieter|lugnar sig|b[öo]rjar lugna|mindre|slutade")],
  ["peak", w("ahora (me pega|est[áa] pegando|se golpea|est[áa] en el suelo|est[áa] peor)|peor|no para|m[áa]s fuerte|sangre|est[áa] en el suelo|worse|won'?t stop|harder|on the floor|right now|blood|v[äa]rre|slutar inte|h[åa]rdare|p[åa] golvet|blod")],
];

export function detectPhaseSignal(text: string): PhaseId | null {
  const t = text.normalize("NFC");
  for (const [phase, re] of PHASE_SIGNAL) if (re.test(t)) return phase;
  return null;
}

// --- steps already given --------------------------------------------------

function contentWords(text: string): string[] {
  return (text.normalize("NFC").toLowerCase().match(/[\p{L}]{4,}/gu) ?? []).filter((x, i, a) => a.indexOf(x) === i);
}

/** A step counts as given when most of its content words appear in one previous assistant turn. */
export function stepWasGiven(step: string, assistantTexts: string[]): boolean {
  const words = contentWords(step);
  if (words.length === 0) return false;
  for (const a of assistantTexts) {
    const bag = new Set(contentWords(a));
    const hit = words.filter((x) => bag.has(x)).length;
    if (hit / words.length >= 0.6) return true;
  }
  return false;
}

// --- calm question ---------------------------------------------------------

const CALM = w("nada urgente|no es urgente|sin urgencia|una pregunta|quer[ií]a preguntar|c[oó]mo (preparo|preparar|puedo preparar|le explico|hago para que)|la (pr[oó]xima|semana que viene)|nothing urgent|not urgent|no rush|a question|how (do|can|should) i (prepare|explain|get him|get her|help him|help her)|next (week|month)|inget akut|inte br[åa]ttom|en fr[åa]ga|hur (f[öo]rbereder|kan jag f[öo]rbereda|f[öo]rklarar) jag|n[äa]sta (vecka|m[åa]nad)");

export function isCalmQuestion(text: string): boolean {
  return CALM.test(text.normalize("NFC"));
}

// --- protocol, sticky across turns -----------------------------------------

export function stickyProtocol(userTexts: string[], severe: boolean): { id: ProtocolId; matched: boolean } {
  let chosen: ProtocolId | null = null;
  for (const text of userTexts) {
    const scores = protocolScores(text);
    const best = (Object.entries(scores) as Array<[ProtocolId, number]>).sort((a, b) => b[1] - a[1] || urgencyRank(a[0]) - urgencyRank(b[0]))[0];
    if (!chosen) {
      if (best[1] > 0) chosen = best[0];
    } else if (best[0] !== chosen && best[1] >= 2 && best[1] > scores[chosen]) chosen = best[0];
  }
  if (chosen) return { id: chosen, matched: true };
  return chooseProtocol(userTexts.join(" "), severe);
}

// --- derive ---------------------------------------------------------------

export function deriveCallState(messages: ChatMessage[], hints: { lang?: EmergencyLang | null; country?: string | null } = {}): CallState {
  const user = messages.filter((m) => m.role === "user").map((m) => textOf(m.content).trim()).filter(Boolean);
  const assistant = messages.filter((m) => m.role === "assistant").map((m) => textOf(m.content).trim()).filter(Boolean);
  const current = user[user.length - 1] ?? "";
  const all = user.join(" ");

  const lang = hints.lang ?? detectLang(all || current, "es");
  const country = hints.country ?? detectCountry(user);
  const caller = detectCaller(user);

  const triage = severeSignals(all);
  const triageAsked = assistant.some((a) => /señal grave|severe sign|allvarligt tecken/i.test(a));
  // The answer to the triage question is the user turn right after it was asked.
  let triageClear = false;
  if (triageAsked) {
    const idx = messages.findIndex((m) => m.role === "assistant" && /señal grave|severe sign|allvarligt tecken/i.test(textOf(m.content)));
    const answer = messages.slice(idx + 1).find((m) => m.role === "user");
    if (answer && answersNoSevere(textOf(answer.content))) triageClear = true;
  }

  // Protocol: chosen on the first turn that matches and kept for the rest of the
  // call (no protocol change mid-crisis), unless the current turn on its own
  // points clearly (two or more keywords) at a different one.
  // Suicidal intent always runs on protocol 4 (self-injury): its escalation and evidence cover it.
  const choice = triage.signals.includes("suicidal") ? { id: "self_injury" as ProtocolId, matched: true } : stickyProtocol(user, triage.severe);
  const protocol = choice.matched ? choice.id : null;
  const calm = !triage.severe && isCalmQuestion(current);

  // Phase advances monotonically with the caller's signals.
  let phase: PhaseId = "agitation";
  for (const u of user) {
    const s = detectPhaseSignal(u);
    if (s && PHASE_IDS.indexOf(s) > PHASE_IDS.indexOf(phase)) phase = s;
  }

  const stepsGiven: string[] = [];
  if (protocol) {
    const p = getProtocol(protocol)!;
    for (const ph of PHASE_IDS) p.phases[ph].steps.forEach((s, i) => { if (stepWasGiven(s[lang], assistant)) stepsGiven.push(`${ph}.${i}`); });
  }

  return { lang, country, caller, calm, protocol, matched: choice.matched, phase, severe: triage.severe, signals: triage.signals, triageAsked, triageClear, stepsGiven, turn: user.length, current, userText: user, assistantText: assistant };
}

/** Protocols that exist, for the uncovered-case log. */
export const PROTOCOL_COUNT = PROTOCOLS.length;
export { TRIAGE_QUESTION };
