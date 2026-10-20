/**
 * Voice line: pick one of the ten protocols for a spoken situation and render
 * one phase as short text to read aloud. Pure and deterministic: the same
 * situation, language, country and phase always give the same answer.
 */

import { severeSignals } from "./triage";
import { dangerSentence, type EmergencyLang } from "../emergency";
import { PHASE_IDS, PROTOCOLS, getProtocol, renderProtocol, type PhaseId, type ProtocolId } from "../protocols";
import { plainSpeech, stop } from "./spoken";

const EDGE_L = "(?<![\\p{L}\\p{N}])";
const EDGE_R = "(?![\\p{L}\\p{N}])";
const words = (alternatives: string) => new RegExp(`${EDGE_L}(?:${alternatives})${EDGE_R}`, "giu");

/** Keywords per protocol (es / en / sv). Each distinct keyword found adds one point. */
const KEYWORDS: Record<ProtocolId, RegExp[]> = {
  physical_danger: [
    words("peligro|se escap\\p{L}*|escap[oó]|huy\\p{L}*|corre a la calle|la calle|tr[aá]fico|coches?|ventana|balc[oó]n|fuego|incendio|piscina|r[ií]o|se pierde|perdid\\p{L}*"),
    words("danger\\p{L}*|runs? (off|away|out|into the street)|bolt\\p{L}*|elope\\p{L}*|wander\\p{L}*|traffic|street|road|window|balcony|fire|pool|river|drown\\p{L}*|lost|missing"),
    words("fara|farlig\\p{L}*|springer (ut|iväg|i väg)|rymmer|rymt|gatan|trafik\\p{L}*|f[öo]nster|balkong|brand|pool|vattnet|drunkn\\p{L}*|borta"),
  ],
  aggression_objects: [
    words("tira\\p{L}* (cosas|objetos|platos|juguetes)|rompe\\p{L}*|romp[ií]\\p{L}*|lanza\\p{L}*|golpea (la )?(puerta|pared|mesa|objetos)|destroz\\p{L}*|patea (la )?(puerta|pared|mesa)"),
    words("throw\\p{L}*|thrown|smash\\p{L}*|break\\p{L}* (things|objects|plates|toys|stuff)|destroy\\p{L}*|kicks? (the )?(door|wall|table)|slams?"),
    words("kastar|kastade|sl[åa]r s[oö]nder|krossar|f[öo]rst[öo]r\\p{L}*|sparkar (p[åa] )?(d[öo]rren|v[äa]ggen|bordet)|slamrar"),
  ],
  aggression_people: [
    words("(me|te|le|nos|les) pega\\p{L}*|pega (a|al|a la)|golpea (a|al|a la)|muerde (a|al)|empuja\\p{L}*|araña|ara[ñn]a\\p{L}*|patea (a|al)|agrede\\p{L}*|agresi[oó]n|pelea\\p{L}*|tira del pelo"),
    words("hits? (me|him|her|us|his|my|the)|hitting (me|him|her|us)|bit(es|ing)? (me|him|her)|push\\p{L}*|scratch\\p{L}*|kick(s|ing)? (me|him|her)|aggress\\p{L}*|attack\\p{L}*|fight\\p{L}*|pulls? (my |his |her )?hair"),
    words("sl[åa]r (mig|honom|henne|oss|mamma|pappa|syskon\\p{L}*)|bits? (mig|honom|henne)|knuffar|rivs?|sparkar (mig|honom|henne)|aggressiv\\p{L}*|attackerar|sl[åa]ss|sl[åa]ss|sl[åa]r andra|dra[r]? h[åa]r"),
  ],
  self_injury: [
    words("se golpea|se muerde|se pega|se araña|se hace da[ñn]o|autolesi\\p{L}*|se da golpes|golpe[aá]ndose|se arranca|se rasca hasta|cabeza contra"),
    words("hits? (him|her|them)self|hitting (him|her|them)self|bit(es|ing)? (him|her|them)self|self[- ]?(injur|harm)\\p{L}*|head[- ]?bang\\p{L}*|bangs? (his|her|their) head|scratch\\p{L}* (him|her|them)self|picks? (at )?(his|her|their) skin"),
    words("sl[åa]r sig|bits? sig|skadar sig|sj[äa]lvskad\\p{L}*|sl[åa]r huvudet|huvudet (i|mot)|rivs? sig|pillar s[öo]nder"),
  ],
  overload_meltdown: [
    words("meltdown|rabieta|sobrecarga|ruido|grita\\p{L}*|llora\\p{L}*|gritos|se descontrola|no se calma|se tapa (los )?o[ií]dos|supermercado|mucha gente|luz(es)? fuerte"),
    words("melt\\p{L}*|overload\\p{L}*|overwhelm\\p{L}*|noise|loud|scream\\p{L}*|cry(ing)?|tantrum|can'?t calm|covers? (his|her|their) ears|supermarket|crowd\\p{L}*"),
    words("utbrott|[öo]verbelast\\p{L}*|ljud|skriker|skrik\\p{L}*|gr[åa]ter|lugnar sig inte|h[åa]ller f[öo]r [öo]ronen|mataff[äa]r|mycket folk|starkt ljus"),
  ],
  shutdown: [
    words("shutdown|bloqueo|bloquead\\p{L}*|se queda (quiet\\p{L}*|inm[óo]vil|callad\\p{L}*|congelad\\p{L}*)|congelad\\p{L}*|no responde|no reacciona|se apaga|ausente|desconect\\p{L}*|no puedo (hablar|moverme)|no puede (hablar|moverse)"),
    words("shut ?down|shuts? down|frozen|freeze|freezes|unresponsive|doesn'?t respond|not responding|withdrawn|zones? out|blank|spaced out|can'?t (speak|talk|move)|locked up"),
    words("blockerad\\p{L}*|blockering|fryser|frusen|svarar inte|reagerar inte|st[äa]ngd|st[äa]nger av|frånvarande|dragit sig undan|helt l[åa]st|kan inte (prata|tala|r[öo]ra (mig|sig))"),
  ],
  transitions_refusal: [
    words("transici[oó]n|cambio|se niega|no quiere (ir|salir|parar|vestirse|ba[ñn]arse|comer|entrar|apagar|cambiar)|rechaza\\p{L}*|negativa|se resiste|salir de casa|apagar la (tele|tablet)|vestirse|ba[ñn]o|cambiar de actividad"),
    words("transition\\p{L}*|refus\\p{L}*|won'?t (go|leave|stop|get dressed|eat|come|turn off)|doesn'?t want to (go|leave|stop|get dressed|eat|come|turn off|bathe|change)|resist\\p{L}*|change of plan|leaving the house|turn(ing)? off the (tv|tablet)|get(ting)? dressed|bath"),
    words("[öo]verg[åa]ng\\p{L}*|f[öo]r[äa]ndring|v[äa]grar|vill inte (g[åa]|sluta|kl[äa] p[åa] sig|ata|komma|st[äa]nga)|nekar|motsätter sig|l[äa]mna hemmet|st[äa]nga av|kl[äa] p[åa] sig|bad"),
  ],
  sleep: [
    words("sue[ñn]o|dormir|duerme|dorm[ií]\\p{L}*|insomnio|cama|noche|madrug\\p{L}*|despierta|despertar\\p{L}*|acostar\\p{L}*|no se duerme|pesadillas"),
    words("sleep\\p{L}*|asleep|insomnia|bed(time)?|night|awake|wakes?|waking|nightmare\\p{L}*|early morning|falling asleep"),
    words("s[öo]mn|sova|sover|somna|s[äa]ng|natt\\p{L}*|vaken|vaknar|l[äa]ggdags|l[äa]gga sig|mardr[öo]mm\\p{L}*|tidigt p[åa] morgonen"),
  ],
  possible_pain: [
    words("dolor|duele|le duele|molestia|malestar|dientes|muela|o[ií]do|barriga|est[oó]mago|estre[ñn]imiento|fiebre|v[oó]mit\\p{L}*|diarrea|se toca (el|la)|se agarra"),
    words("pain\\p{L}*|hurt\\p{L}*|ache\\p{L}*|sore|discomfort|tooth|teeth|ear|stomach|tummy|constipat\\p{L}*|fever|vomit\\p{L}*|diarrh\\p{L}*|holds? (his|her|their) (head|ear|belly|stomach)"),
    words("sm[äa]rta\\p{L}*|ont (i|p[åa])|g[öo]r ont|obehag|tand\\p{L}*|[öo]ra|[öo]rat|mage\\p{L}*|f[öo]rstoppning|feber|kr[äa]ks\\p{L}*|diarr[ée]\\p{L}*|h[åa]ller sig om"),
  ],
  caregiver_exhausted: [
    words("agotad\\p{L}*|no puedo m[aá]s|estoy cansad\\p{L}*|al l[ií]mite|no aguanto|quemad[oa]|burnout|estr[eé]s|sin fuerzas|me supera|desbordad\\p{L}*|necesito ayuda|llorando yo"),
    words("exhaust\\p{L}*|can'?t (take|cope|do) (it|this)( any ?more)?|at my limit|burn(ed|t)? ?out|burnout|stress\\p{L}*|overwhelmed|i need (a break|help)|worn out|drained"),
    words("utmattad\\p{L}*|orkar inte|orkar inte mer|slutk[öo]rd|utbr[äa]nd\\p{L}*|stress\\p{L}*|vid min gr[äa]ns|[öo]verv[äa]ldigad|behöver hj[äa]lp|slut p[åa] krafterna"),
  ],
};

const DEFAULT_PROTOCOL: ProtocolId = "overload_meltdown";

/** Tie-break order: clinical urgency, not the number in the line. */
export const URGENCY: ProtocolId[] = ["physical_danger", "self_injury", "aggression_people", "aggression_objects", "overload_meltdown", "shutdown", "possible_pain", "transitions_refusal", "sleep", "caregiver_exhausted"];
export const urgencyRank = (id: ProtocolId): number => URGENCY.indexOf(id);

/** Number of distinct keywords of the protocol found in the text. */
function score(text: string, id: ProtocolId): number {
  const found = new Set<string>();
  for (const re of KEYWORDS[id]) for (const m of text.matchAll(re)) found.add(m[0].toLowerCase());
  return found.size;
}

export type ProtocolChoice = { id: ProtocolId; matched: boolean };

/** Keyword score of every protocol for a text (distinct keywords found). */
export function protocolScores(text: string): Record<ProtocolId, number> {
  const t = text.normalize("NFC");
  return Object.fromEntries(PROTOCOLS.map((p) => [p.id, score(t, p.id)])) as Record<ProtocolId, number>;
}

/**
 * Picks one protocol. Highest keyword score wins; ties go to the more urgent
 * protocol (URGENCY order: self-injury before aggression toward objects). With a risk signal and no keyword match, protocol
 * 1 (physical danger); with no signal at all, protocol 5 (sensory overload),
 * the broadest one, flagged `matched: false` so the agent can ask one question.
 */
export function chooseProtocol(situation: string, risk: boolean): ProtocolChoice {
  const text = situation.normalize("NFC");
  let best: ProtocolChoice | null = null;
  let bestScore = 0;
  for (const p of [...PROTOCOLS].sort((a, b) => urgencyRank(a.id) - urgencyRank(b.id))) {
    const s = score(text, p.id);
    if (s > bestScore) {
      best = { id: p.id, matched: true };
      bestScore = s;
    }
  }
  if (best) return best;
  return { id: risk ? "physical_danger" : DEFAULT_PROTOCOL, matched: false };
}

export type LineProtocolResult = {
  ok: true;
  /** true when the risk screen fired: the emergency line is the first sentence of `speech`. */
  risk: boolean;
  protocol: ProtocolId;
  number: number;
  title: string;
  phase: PhaseId;
  next_phase: PhaseId | null;
  /** false when no keyword matched and the broadest protocol was used: ask one clarifying question. */
  matched: boolean;
  /** The emergency sentence for the country, present when `risk` is true. */
  emergency: string | null;
  /** Everything to read aloud, in order. */
  speech: string;
  evidence_ids: string[];
};

const STEP_LIMIT = 3;
const SAY_LIMIT = 2;

const CONNECT: Record<EmergencyLang, { protocol: string; say: string }> = {
  es: { protocol: "Vamos con", say: "Puedes decir" },
  en: { protocol: "Let's go with", say: "You can say" },
  sv: { protocol: "Vi tar", say: "Du kan säga" },
};

export function buildLineProtocol(input: {
  situation: string;
  lang: EmergencyLang;
  country: string | null;
  phase?: PhaseId;
  protocolId?: ProtocolId;
}): LineProtocolResult {
  const { situation, lang, country } = input;
  const risk = severeSignals(situation).severe;
  const chosen = input.protocolId && getProtocol(input.protocolId) ? { id: input.protocolId, matched: true } : chooseProtocol(situation, risk);
  const rendered = renderProtocol(getProtocol(chosen.id)!, lang, country);
  const phase = input.phase && PHASE_IDS.includes(input.phase) ? input.phase : "agitation";
  const ph = rendered.phases.find((p) => p.id === phase)!;
  const emergency = risk ? dangerSentence(country, lang) : null;

  const parts: string[] = [];
  // Emergency first, before anything else, whenever the risk screen fires.
  if (emergency) parts.push(emergency);
  // Protocols 1 and 4 open with their own safety sentence plus the danger sentence; when the risk screen already said it, do not repeat it.
  if (rendered.emergencyFirst && phase === "agitation") {
    parts.push(emergency ? rendered.emergencyFirst.replace(emergency, "").trim() : rendered.emergencyFirst);
  }
  parts.push(`${CONNECT[lang].protocol} ${rendered.title.toLowerCase()}.`);
  parts.push(stop(ph.goal));
  for (const s of ph.steps.slice(0, STEP_LIMIT)) parts.push(stop(s));
  const say = ph.sayToPerson.slice(0, SAY_LIMIT).map((s) => s.replace(/[.!?]+$/, ""));
  if (say.length > 0) parts.push(`${CONNECT[lang].say}: ${say.map((s) => `«${s}»`).join(", ")}.`);
  // At the peak, remind when to call, once.
  if (phase === "peak" && !risk) parts.push(rendered.escalate.callLine);

  const i = PHASE_IDS.indexOf(phase);
  const speech = parts
    .map((t) => plainSpeech(t))
    .filter(Boolean)
    .join(" ");

  return {
    ok: true,
    risk,
    protocol: chosen.id,
    number: rendered.number,
    title: rendered.title,
    phase,
    next_phase: i < PHASE_IDS.length - 1 ? PHASE_IDS[i + 1] : null,
    matched: chosen.matched,
    emergency,
    speech,
    evidence_ids: rendered.evidence.map((e) => e.id),
  };
}
