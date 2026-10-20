/**
 * Call state for the brain, derived from the conversation ElevenLabs resends
 * on every turn. Nothing is stored server-side: the same messages always give
 * the same state, so instances need no shared memory and a lost instance loses
 * nothing. Deterministic and tested.
 *
 * The state carries facts the model cannot be trusted to get right on its own
 * (language, country and its emergency number, whether the caller just asked
 * whom to call) and hints it may weigh (who seems to be calling, severe
 * signals found by code). It no longer chooses a protocol, a phase or the next
 * step: the model reads the conversation and decides. The keyword match is
 * kept only to log uncovered cases.
 */

import type { EmergencyLang } from "../emergency";
import { PROTOCOLS, type ProtocolId } from "../protocols";
import { protocolScores, urgencyRank } from "./protocol";
import { severeSignals, type SevereSignal } from "./triage";

export type ChatMessage = { role: "system" | "user" | "assistant" | string; content: unknown };

export type CallerRole = "caregiver" | "person" | "unknown";

export type CallState = {
  lang: EmergencyLang;
  country: string | null;
  /** Code already asked the caller which country they are in. */
  countryAsked: boolean;
  caller: CallerRole;
  /** This turn asks whom to call: the emergency number (or the country question) goes first, by code. */
  asksWhomToCall: boolean;
  /** Protocol the keywords point at, for the uncovered-case log only. Not given to the model. */
  likelyProtocol: ProtocolId | null;
  /** Severe signals found anywhere in what the caller said, as information for the model. */
  severe: boolean;
  signals: SevereSignal[];
  /** Number of user turns so far (this one included). */
  turn: number;
  /** Text of the current user turn. */
  current: string;
  /** All user text, oldest first, for retrieval context. */
  userText: string[];
  /** Previous assistant texts. */
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

/** The question code asks when the country is unknown and the number is needed. */
export const COUNTRY_QUESTION: Record<EmergencyLang, string> = {
  es: "¿En qué país estás? Así te doy el número exacto.",
  en: "Which country are you in? Then I can give you the exact number.",
  sv: "Vilket land är du i? Då kan jag ge dig rätt nummer.",
};

const COUNTRY_ASKED = /en qué país estás|which country are you in|vilket land är du i/i;

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

// --- "whom do I call?" -----------------------------------------------------

const WHOM = w("a qui[ée]n (llamo|llamamos|le marco|marco|debo llamar|puedo llamar)|qu[ée] n[úu]mero|cu[áa]l es el n[úu]mero|a d[oó]nde llamo|a qui[ée]n\\??$|who (do|should|can) (i|we) call|whom (do|should) (i|we) call|what number|what'?s the number|who do i ring|vem (ska|kan) (jag|vi) ringa|vilket nummer|vem ringer jag");

/** The caller asks whom to call or what number: the answer is the country's emergency number, first. */
export function asksWhomToCall(text: string): boolean {
  return WHOM.test(text.normalize("NFC").trim());
}

// --- likely protocol (keywords, for the uncovered-case log only) -----------

export function likelyProtocol(userTexts: string[]): ProtocolId | null {
  const scores = protocolScores(userTexts.join(" "));
  const best = (Object.entries(scores) as Array<[ProtocolId, number]>).sort((a, b) => b[1] - a[1] || urgencyRank(a[0]) - urgencyRank(b[0]))[0];
  return best && best[1] > 0 ? best[0] : null;
}

// --- derive ---------------------------------------------------------------

export function deriveCallState(messages: ChatMessage[], hints: { lang?: EmergencyLang | null; country?: string | null } = {}): CallState {
  const user = messages.filter((m) => m.role === "user").map((m) => textOf(m.content).trim()).filter(Boolean);
  const assistant = messages.filter((m) => m.role === "assistant").map((m) => textOf(m.content).trim()).filter(Boolean);
  const current = user[user.length - 1] ?? "";
  const all = user.join(" ");

  const lang = hints.lang ?? detectLang(all || current, "es");
  const country = hints.country ?? detectCountry(user);
  const countryAsked = assistant.some((a) => COUNTRY_ASKED.test(a));
  const caller = detectCaller(user);
  const triage = severeSignals(all);

  return {
    lang,
    country,
    countryAsked,
    caller,
    asksWhomToCall: asksWhomToCall(current),
    likelyProtocol: likelyProtocol(user),
    severe: triage.severe,
    signals: triage.signals,
    turn: user.length,
    current,
    userText: user,
    assistantText: assistant,
  };
}

/** Protocols that exist, for the uncovered-case log. */
export const PROTOCOL_COUNT = PROTOCOLS.length;
