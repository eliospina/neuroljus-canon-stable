/**
 * Triage for the voice line, in code: which signals are severe enough to
 * mention the emergency number, and which home first aid applies otherwise.
 *
 * `severeSignals` is deliberately narrower than `localRiskScreen` (used by
 * Ask and the Care Agent): "se sigue golpeando" or "hay sangre" alone are a
 * crisis to work through at home, not a reason to say "call 112". Only the
 * signals Elizabeth listed count: loss of consciousness, bleeding that does
 * not stop, vomiting or confusion after a head blow, trouble breathing, an eye
 * injury, something swallowed, a seizure, a weapon in hand, or suicidal
 * intent. Word edges are Unicode lookarounds (\b is ASCII-only in JavaScript).
 */

import type { EmergencyLang } from "../emergency";

const L = "(?<![\\p{L}\\p{N}])";
const R = "(?![\\p{L}\\p{N}])";
const w = (alts: string) => new RegExp(`${L}(?:${alts})${R}`, "iu");

export type SevereSignal =
  | "unconscious"
  | "bleeding_not_stopping"
  | "head_blow_with_vomiting_or_confusion"
  | "breathing"
  | "eye_injury"
  | "swallowed"
  | "seizure"
  | "weapon"
  | "suicidal";

const SEVERE: Array<[SevereSignal, RegExp]> = [
  ["unconscious", w("inconsciente|p[ée]rdida de (la )?conciencia|perdi[oó] (la|el) conocimiento|desmay\\p{L}*|no se despierta|unconscious|passed out|lost consciousness|won'?t wake|medvetsl[öo]s|svimma\\p{L}*|vaknar inte")],
  ["bleeding_not_stopping", w("(sangra|sangrado|sangre|hemorragia)[^.!?]{0,30}(no para|no se detiene|sin parar|a chorros|mucha|much[ií]simo|no deja)|no (para|deja) de sangrar|hemorragia|bleed\\p{L}*[^.!?]{0,30}(won'?t stop|doesn'?t stop|not stopping|a lot|heavily|gushing)|(bl[öo]der|blodet)[^.!?]{0,30}(slutar inte|stannar inte|mycket|kraftigt)")],
  ["head_blow_with_vomiting_or_confusion", w("(cabeza|head|huvud\\p{L}*)[^.!?]{0,80}(v[oó]mit\\p{L}*|confus\\p{L}*|somnolient\\p{L}*|adormilad\\p{L}*|no reconoce|vomit\\p{L}*|confused|drowsy|kr[äa]k\\p{L}*|f[öo]rvirrad|d[åa]sig)|(v[oó]mit\\p{L}*|vomit\\p{L}*|kr[äa]k\\p{L}*)[^.!?]{0,80}(golpe|cabeza|hit (his|her|their) head|head|huvud\\p{L}*|slag)")],
  ["breathing", w("no respira|le cuesta respirar|dificultad para respirar|no puede respirar|labios (azules|morados|azulados)|not breathing|can'?t breathe|trouble breathing|difficulty breathing|struggling to breathe|lips (are )?(blue|bluish|purple)|andas inte|sv[åa]rt att andas|kan inte andas|bl[åa](aktiga)? l[äa]ppar")],
  ["eye_injury", w("(ojo|ojos)[^.!?]{0,30}(da[ñn]o|golpe|sangr\\p{L}*|herid\\p{L}*|clavad\\p{L}*)|(da[ñn]o|golpe|herida) en (el|un|los) ojos?|(eye|eyes)[^.!?]{0,30}(injur\\p{L}*|hurt|bleed\\p{L}*|hit|cut)|(injur\\p{L}*|hit|cut)[^.!?]{0,20}(the |his |her |their )?eyes?|([öo]ga|[öo]gat|[öo]gon)[^.!?]{0,30}(skad\\p{L}*|slag|bl[öo]d\\p{L}*)")],
  ["swallowed", w("se (ha )?trag[oó]\\p{L}*|trag[oó] (algo|una|un)|atragant\\p{L}*|se ahog\\p{L}*|swallowed|chok\\p{L}*|svalt|satt i halsen|s[äa]tter i halsen|kv[äa]v\\p{L}*")],
  ["seizure", w("convulsi\\p{L}*|ataque epil[ée]ptico|seizure\\p{L}*|convulsing|fitting|kramp\\p{L}*|anfall|epileptisk\\p{L}*")],
  ["weapon", w("cuchillo|navaja|tijeras en la mano|arma|knife|blade|scissors in (his|her|their) hand|weapon|kniv|rakblad|vapen")],
  ["suicidal", w("(se |me )?quiere morir|quiero morir(me)?|matar(se|me)|suicid\\p{L}*|quitarse la vida|quitarme la vida|acabar con (su|mi) vida|wants? to die|want to die|kill (him|her|them|my)self|end (his|her|their|my) life|suicid\\p{L}*|vill d[öo]|ta sitt liv|ta mitt liv|sj[äa]lvmord\\p{L}*|d[öo]da sig|d[öo]da mig")],
];

export type Triage = { severe: boolean; signals: SevereSignal[] };

/** Severe signals in a text. Empty means: work through it at home, no emergency mention. */
export function severeSignals(text: string): Triage {
  const t = text.normalize("NFC");
  const signals = SEVERE.filter(([, re]) => re.test(t)).map(([id]) => id);
  return { severe: signals.length > 0, signals };
}

export type FirstAid = "cut" | "bump" | "head_blow";

const FIRST_AID: Array<[FirstAid, RegExp]> = [
  ["cut", w("corte|cortad\\p{L}*|herida|sangr\\p{L}*|rasgu[ñn]\\p{L}*|cut|wound|bleed\\p{L}*|blood|scratch\\p{L}*|s[åa]r|skuren|bl[öo]d\\p{L}*|rivs[åa]r")],
  ["head_blow", w("(golpe|golpe[oó]|golpea|se dio|se peg[oó])[^.!?]{0,30}cabeza|cabeza[^.!?]{0,30}(golpe|pared|suelo|piso)|(hit|banged|bangs|knocked)[^.!?]{0,20}head|head[^.!?]{0,20}(wall|floor|blow)|(slog|dunkar|dunkade|slag)[^.!?]{0,20}huvud\\p{L}*|huvud\\p{L}*[^.!?]{0,20}(v[äa]gg|golv)")],
  ["bump", w("golpe|chich[oó]n|moret[oó]n|hinchaz[oó]n|se peg[oó]|bump|bruise|swelling|lump|bula|bl[åa]m[äa]rke|svullnad|slag")],
];

/** Home first aid that fits the text, in priority order. Only used when no severe signal is present. */
export function firstAidFor(text: string): FirstAid[] {
  const t = text.normalize("NFC");
  const out: FirstAid[] = [];
  for (const [id, re] of FIRST_AID) if (re.test(t) && !out.includes(id)) out.push(id);
  // A head blow already covers the generic bump advice.
  return out.includes("head_blow") ? out.filter((x) => x !== "bump") : out;
}

export const FIRST_AID_TEXT: Record<EmergencyLang, Record<FirstAid, string>> = {
  es: {
    cut: "En un corte: presiona con un paño limpio hasta que pare de sangrar.",
    bump: "En un golpe: frío envuelto en tela, diez a quince minutos.",
    head_blow: "Tras un golpe en la cabeza: frío envuelto en tela y vigila en las próximas horas somnolencia, vómitos o confusión; si aparecen, entonces sí llama a emergencias.",
  },
  en: {
    cut: "For a cut: press with a clean cloth until the bleeding stops.",
    bump: "For a bump: something cold wrapped in cloth, ten to fifteen minutes.",
    head_blow: "After a blow to the head: cold wrapped in cloth, and watch over the next hours for drowsiness, vomiting or confusion; if they appear, then call emergency services.",
  },
  sv: {
    cut: "Vid ett sår: tryck med en ren duk tills det slutar blöda.",
    bump: "Vid ett slag: något kallt inlindat i tyg, tio till femton minuter.",
    head_blow: "Efter ett slag mot huvudet: kyla inlindad i tyg, och håll koll de närmaste timmarna på dåsighet, kräkningar eller förvirring; kommer de, ring då larmnumret.",
  },
};

/** The one triage question, asked once per call in self-injury or aggression. */
export const TRIAGE_QUESTION: Record<EmergencyLang, string> = {
  es: "¿Hay alguna señal grave: pérdida de conciencia, sangre que no para con presión, vómitos o confusión tras un golpe en la cabeza, dificultad para respirar, lesión en un ojo, algo tragado, o ha dicho que se quiere morir?",
  en: "Is there any severe sign: loss of consciousness, bleeding that does not stop with pressure, vomiting or confusion after a blow to the head, trouble breathing, an eye injury, something swallowed, or has the person said they want to die?",
  sv: "Finns något allvarligt tecken: medvetslöshet, blödning som inte slutar med tryck, kräkningar eller förvirring efter ett slag mot huvudet, andningssvårigheter, en ögonskada, något som svalts, eller har personen sagt att den vill dö?",
};

/** Did the caller answer the triage question with "no" (no severe signs)? */
export function answersNoSevere(text: string): boolean {
  return w("no|nada de eso|ninguna|ninguno|no hay|nope|none|nothing like that|no signs|nej|inget|inga|inget s[åa]dant").test(text.trim()) && !severeSignals(text).severe;
}
