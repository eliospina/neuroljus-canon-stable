/**
 * Ask NeuroLjus — the expert.
 *
 * Help first. Science is a tool, not a cage: Claude uses what it knows,
 * leans on the verified library when there is evidence, uses what this
 * device has measured, and may propose new ideas. Two things are not
 * negotiable: every idea says where it comes from, and safety.
 *
 * Labels (one per paragraph, rendered by the client in the caregiver's language):
 *   science  — cites a study from the library (native Claude citations)
 *   practice — care knowledge Claude brings without a citation
 *   person   — what Companion measured on this device, computed by code with counts
 *   idea     — a new hypothesis from the AI, to be tried, never presented as fact
 *
 * Safety: no diagnosis, no medication. Physical danger, self-injury or an
 * emergency → 112 before anything else. Medical doubts in Sweden → 1177.
 * The question is never written to logs.
 */

import { localRiskScreen, type HelpfulRoutine, sanitizeHelpfulRoutines } from "../careProtocol/intentParser";
import { COMMAND_LABELS } from "../companion/i18n";
import { searchLibrary, TOPIC_LABELS, type LibraryDoc, type TopicId } from "../library";

export type AskLang = "es" | "en" | "sv";
export type AskLabel = "science" | "practice" | "person" | "idea" | "safety";

export const MAX_QUESTION_CHARS = 800;
export const ASK_TIMEOUT_MS = 25_000;
const RETRIEVE = 8;

export type AskSource = {
  n: number;
  id: string;
  title: string;
  authors: string;
  year: number;
  kind: LibraryDoc["kind"];
  participatory: boolean;
  doi: string;
  url: string;
};

export type AskSegment = {
  label: AskLabel;
  text: string;
  /** 1-based source numbers cited in this paragraph. */
  sources: number[];
};

export type AskResult = {
  ok: true;
  lang: AskLang;
  emergency: boolean;
  segments: AskSegment[];
  sources: AskSource[];
  /** "claude" when the answer came from the model; "fallback" when built from the library only. */
  source: "claude" | "fallback" | "risk_screen";
  notice: string | null;
};

export const EMERGENCY: Record<AskLang, string> = {
  es: "Esto necesita a una persona ahora. Si hay peligro físico, autolesión o una emergencia médica, llama al 112. En Suecia, para dudas médicas no urgentes: 1177.",
  en: "This needs a person now. If there is physical danger, self-injury or a medical emergency, call 112. In Sweden, for non-urgent medical questions: 1177.",
  sv: "Det här behöver en människa nu. Vid fysisk fara, självskada eller medicinsk nödsituation: ring 112. För icke-akuta medicinska frågor i Sverige: 1177.",
};

const FALLBACK_NOTICE: Record<AskLang, string> = {
  es: "El asistente no respondió a tiempo. Esto es lo que dice la biblioteca sobre tu pregunta.",
  en: "The assistant did not answer in time. This is what the library says about your question.",
  sv: "Assistenten svarade inte i tid. Det här säger biblioteket om din fråga.",
};

const NO_SOURCES_NOTICE: Record<AskLang, string> = {
  es: "No encontré estudios de la biblioteca para esta pregunta; la respuesta se apoya en práctica conocida.",
  en: "No library studies matched this question; the answer rests on known practice.",
  sv: "Inga studier i biblioteket matchade frågan; svaret bygger på känd praxis.",
};

// ---------------------------------------------------------------------------
// Step 1 — search terms (Claude, structured output; local fallback)
// ---------------------------------------------------------------------------

const TERMS_SCHEMA = {
  type: "object",
  properties: {
    terms: { type: "array", items: { type: "string" }, maxItems: 12 },
    topics: { type: "array", items: { type: "string", enum: Object.keys(TOPIC_LABELS) }, maxItems: 3 },
  },
  required: ["terms", "topics"],
  additionalProperties: false,
} as const;

/** Small local map so retrieval still works when Claude is unavailable. */
const LOCAL_TERMS: Array<[RegExp, string]> = [
  [/\b(sue[ñn]o|dormir|cama|noche|s[öo]mn|sova|s[äa]ng|natt|sleep|bedtime|insomnia)\b/i, "sleep bedtime insomnia"],
  [/\b(com(er|ida)|cena|desayun\w*|alimentaci[óo]n|mat|[äa]ta|m[åa]ltid|eat\w*|food|meal\w*|feeding)\b/i, "feeding food selectivity mealtime"],
  [/\b(dentista|m[ée]dico|hospital|tandl[äa]kar\w*|l[äa]kar\w*|sjukhus\w*|dentist|doctor|hospital|vaccine|vacuna|blood)\b/i, "dental healthcare hospital procedure sensory adapted"],
  [/\b(ruido|sonido|luz|o[ií]dos|t[áa]pa|ljud|ljus|[öo]ron|noise|sound|light|loud|ears|crowd\w*|supermarket|supermercado|aff[äa]r\w*|sensorial|sensory|sensorisk)\b/i, "sensory processing hypersensitivity noise overload"],
  [/\b(escuela|colegio|clase|profe\w*|skola\w*|l[äa]rare|klass|school|classroom|teacher)\b/i, "school classroom teacher inclusion visual supports"],
  [/\b(trabajo|empleo|arbete|jobb|work\w*|employ\w*|job)\b/i, "employment workplace autistic adults"],
  [/\b(ansiedad|miedo|nervios|[åa]ngest|oro|r[äa]dd|anxi\w*|worry|fear)\b/i, "anxiety intolerance of uncertainty"],
  [/\b(crisis|rabieta|grit\w*|golpe\w*|utbrott|skrik\w*|meltdown|shutdown|aggress\w*|self-?injur\w*|autolesi\w*)\b/i, "meltdown emotion regulation self-injury de-escalation"],
  [/\b(habla|no habla|palabras|pictogramas|comunicaci[óo]n|tala|pratar|kommunikation|speak\w*|nonverbal|non-?speaking|communicat\w*|aac|pecs)\b/i, "augmentative alternative communication minimally verbal"],
  [/\b(cambio|rutina|transici[óo]n|viaje|vacaciones|f[öo]r[äa]ndring|rutin|resa|change|routine|transition|holiday|trip|moving)\b/i, "routine change transition predictability visual schedule"],
  [/\b(ni[ñn]a|mujer|chica|hija|flicka|kvinna|dotter|girl|woman|daughter|female|masking|camuflaje)\b/i, "autistic girls women camouflaging"],
  [/\b(dolor|duele|ont|sm[äa]rta|pain|hurt\w*)\b/i, "pain expression autism"],
  [/\b(padres|madre|familia|hermano|cuidador\w*|f[öo]r[äa]lder|familj|syskon|parent\w*|family|sibling\w*|caregiver\w*|stress|burnout)\b/i, "parents caregivers family stress support"],
  [/\b(adulto|adulta|vuxen|adult\w*|independ\w*|vivir solo)\b/i, "autistic adults quality of life independent living"],
];

export function localSearchTerms(question: string): string {
  const hits = LOCAL_TERMS.filter(([re]) => re.test(question)).map(([, t]) => t);
  return hits.length > 0 ? hits.join(" ") : question;
}

type AnthropicPayload = {
  error?: { type?: string; message?: string };
  stop_reason?: string;
  content?: Array<{
    type?: string;
    text?: string;
    citations?: Array<{ type?: string; document_index?: number; cited_text?: string }> | null;
  }>;
};

type ClaudeDeps = { apiKey: string; model: string; signal: AbortSignal; fetchImpl?: typeof fetch };

async function callClaude(body: Record<string, unknown>, deps: ClaudeDeps): Promise<AnthropicPayload | null> {
  const doFetch = deps.fetchImpl ?? fetch;
  const res = await doFetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": deps.apiKey, "anthropic-version": "2023-06-01" },
    signal: deps.signal,
    body: JSON.stringify({ model: deps.model, ...body }),
  });
  const payload = (await res.json().catch(() => ({}))) as AnthropicPayload;
  if (!res.ok) throw new Error(`${res.status} ${payload.error?.type ?? ""}`.trim());
  return payload;
}

export async function searchTermsFor(question: string, lang: AskLang, deps: ClaudeDeps): Promise<{ terms: string; topics: TopicId[] }> {
  const payload = await callClaude(
    {
      max_tokens: 300,
      system:
        "Turn a caregiver's question about an autistic person (Spanish, English or Swedish) into 4-10 English search terms for a research library on autism (sensory processing, communication/AAC, meltdowns, sleep, anxiety, feeding, school, adult life, family, transitions, women/girls, pain/health). Return the terms and up to 3 matching topic ids. Respond only with the JSON object.",
      messages: [{ role: "user", content: question }],
      output_config: { effort: "low", format: { type: "json_schema", schema: TERMS_SCHEMA } },
    },
    deps
  );
  const text = (payload?.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
  const parsed = JSON.parse(text) as { terms?: unknown; topics?: unknown };
  const terms = Array.isArray(parsed.terms) ? parsed.terms.filter((t): t is string => typeof t === "string").slice(0, 12) : [];
  const topics = Array.isArray(parsed.topics)
    ? parsed.topics.filter((t): t is TopicId => typeof t === "string" && t in TOPIC_LABELS)
    : [];
  return { terms: terms.length > 0 ? terms.join(" ") : localSearchTerms(question), topics };
}

// ---------------------------------------------------------------------------
// Step 2 — retrieval → document blocks
// ---------------------------------------------------------------------------

export function retrieve(terms: string, topics: TopicId[]): LibraryDoc[] {
  const hits = searchLibrary(terms, RETRIEVE * 2);
  // Topic agreement is a soft boost: documents outside the topics are kept, just lower.
  const boosted = hits
    .map((h) => ({ doc: h.doc, score: h.score + (topics.some((t) => h.doc.topics.includes(t)) ? 2 : 0) }))
    .sort((a, b) => b.score - a.score);
  return boosted.slice(0, RETRIEVE).map((h) => h.doc);
}

export function documentText(d: LibraryDoc): string {
  const parts = [`${d.title} (${d.year}). ${d.kind.replace("_", " ")}${d.participatory ? ", research with autistic people" : ""}.`];
  if (d.seed) parts.push(`Key finding: ${d.seed.claim.en} Supports: ${d.seed.supports} Does not support: ${d.seed.doesNotSupport}`);
  if (d.sheet) parts.push(`Practical sheet: ${d.sheet.en}`);
  if (d.abstract) parts.push(d.abstract);
  return parts.join("\n\n");
}

export function toSources(docs: LibraryDoc[]): AskSource[] {
  return docs.map((d, i) => ({
    n: i + 1,
    id: d.id,
    title: d.title,
    authors: d.authors.split(",")[0].trim() + (d.authors.includes(",") ? " et al." : ""),
    year: d.year,
    kind: d.kind,
    participatory: d.participatory,
    doi: d.doi,
    url: d.url,
  }));
}

// ---------------------------------------------------------------------------
// Step 3 — "Data from this person", computed by code
// ---------------------------------------------------------------------------

const PERSON_TEXT: Record<AskLang, { one: string; none: string }> = {
  es: { one: "En este dispositivo, la rutina «{routine}» ({scenario}) ayudó {helped} de {rated} veces valoradas.", none: "" },
  en: { one: "On this device, the routine “{routine}” ({scenario}) helped {helped} of {rated} rated runs.", none: "" },
  sv: { one: "På den här enheten hjälpte rutinen ”{routine}” ({scenario}) {helped} av {rated} bedömda körningar.", none: "" },
};

const SCENARIO_NAMES: Record<AskLang, Record<string, string>> = {
  es: { evening_transition: "transición a la noche", sensory_overload: "sobrecarga sensorial", possible_discomfort: "posible malestar", leaving_home: "salir de casa", meal_support: "apoyo en la comida", school_arrival: "llegada a la escuela" },
  en: { evening_transition: "evening transition", sensory_overload: "sensory overload", possible_discomfort: "possible discomfort", leaving_home: "leaving home", meal_support: "meal support", school_arrival: "school arrival" },
  sv: { evening_transition: "kvällsövergång", sensory_overload: "sensorisk överbelastning", possible_discomfort: "möjligt obehag", leaving_home: "lämna hemmet", meal_support: "måltidsstöd", school_arrival: "skolankomst" },
};

export function personSegments(history: HelpfulRoutine[], lang: AskLang): AskSegment[] {
  return history.map((h) => ({
    label: "person" as const,
    text: PERSON_TEXT[lang].one
      .replace("{routine}", h.commands.map((c) => COMMAND_LABELS[lang][c].toLowerCase()).join(" → "))
      .replace("{scenario}", SCENARIO_NAMES[lang][h.scenario] ?? h.scenario)
      .replace("{helped}", String(h.helped))
      .replace("{rated}", String(h.rated)),
    sources: [],
  }));
}

// ---------------------------------------------------------------------------
// Step 4 — the answer (Claude with native citations)
// ---------------------------------------------------------------------------

const LANG_NAME: Record<AskLang, string> = { es: "Spanish", en: "English", sv: "Swedish" };

export function buildAskSystemPrompt(lang: AskLang, hasPersonData: boolean): string {
  return (
    "You are Ask NeuroLjus, an autism expert for caregivers and autistic people. Help first: concrete, practical, for this situation, today. " +
    `Answer in ${LANG_NAME[lang]} unless the question is clearly in another language. Use respectful, neurodiversity-affirming language (identity-first, no 'suffers from', no 'low functioning', no 'challenging behaviour'; describe what happens and what helps). ` +
    "Science is a tool, not a cage: use everything you know, lean on the attached studies when they apply, and feel free to propose new ideas. Every idea must say where it comes from.\n\n" +
    "FORMAT — plain text, short paragraphs, no markdown headings. Start every paragraph with exactly one tag:\n" +
    "[SCIENCE] a point supported by an attached study — cite it with the citation feature (the citation must come from the attached documents; never cite from memory).\n" +
    "[PRACTICE] care knowledge you bring without a citation.\n" +
    (hasPersonData
      ? "[PERSON] refers to the data from this person that is given to you; repeat its numbers exactly, never invent new ones.\n"
      : "") +
    "[IDEA] a new hypothesis worth trying — mark it as something to test, never as a fact.\n" +
    "Begin with 2-5 practical steps as [PRACTICE] or [SCIENCE] paragraphs (one step per paragraph), then what to avoid, then at most two [IDEA] paragraphs. 120-260 words total. No lists of what you cannot do.\n\n" +
    "SAFETY: never diagnose, never recommend or dose medication; for medical questions say a clinician (in Sweden 1177) decides. If the question describes physical danger, self-injury, abuse or an emergency, first say that this needs a person now and to call 112, then help with what is safe. " +
    "If an attached study does not fit the question, ignore it. Never present a study as a rule for every person."
  );
}

type Span = { start: number; end: number; docIndex: number };

/** Join Claude's text blocks and record which document each citation span points to. */
function flatten(payload: AnthropicPayload): { text: string; spans: Span[] } {
  let text = "";
  const spans: Span[] = [];
  for (const block of payload.content ?? []) {
    if (block.type !== "text" || typeof block.text !== "string") continue;
    const start = text.length;
    text += block.text;
    for (const c of block.citations ?? []) {
      if (typeof c.document_index === "number") spans.push({ start, end: text.length, docIndex: c.document_index });
    }
  }
  return { text, spans };
}

const TAG = /^\s*\[(SCIENCE|PRACTICE|PERSON|IDEA|SAFETY)\]\s*/i;

export function parseAnswer(payload: AnthropicPayload, docCount: number): AskSegment[] {
  const { text, spans } = flatten(payload);
  const segments: AskSegment[] = [];
  let offset = 0;
  for (const raw of text.split(/\n{2,}|\n(?=\s*\[)/)) {
    const start = offset;
    const end = offset + raw.length;
    offset = end + 1;
    const body = raw.replace(TAG, "").trim();
    if (!body) continue;
    const tag = raw.match(TAG)?.[1]?.toLowerCase();
    const cited = [...new Set(spans.filter((s) => s.start < end && s.end > start).map((s) => s.docIndex + 1))]
      .filter((n) => n >= 1 && n <= docCount)
      .sort((a, b) => a - b);
    let label: AskLabel =
      tag === "science" || tag === "practice" || tag === "person" || tag === "idea" || tag === "safety" ? tag : "practice";
    if (label === "science" && cited.length === 0) label = "practice";
    if (label === "practice" && cited.length > 0) label = "science";
    segments.push({ label, text: body, sources: cited });
  }
  return segments;
}

export async function answerWithClaude(input: {
  question: string;
  lang: AskLang;
  docs: LibraryDoc[];
  person: AskSegment[];
  deps: ClaudeDeps;
}): Promise<AskSegment[]> {
  const { question, lang, docs, person, deps } = input;
  const content: Array<Record<string, unknown>> = docs.map((d) => ({
    type: "document",
    source: { type: "text", media_type: "text/plain", data: documentText(d) },
    title: `${d.title.slice(0, 120)} (${d.year})`,
    context: JSON.stringify({ doi: d.doi, kind: d.kind, year: d.year, participatory: d.participatory, license: d.license }),
    citations: { enabled: true },
  }));
  const personBlock = person.length > 0 ? `\n\nData from this person (computed on the device):\n${person.map((p) => `- ${p.text}`).join("\n")}` : "";
  content.push({ type: "text", text: `Question:\n${question}${personBlock}` });

  const payload = await callClaude(
    {
      max_tokens: 1200,
      system: buildAskSystemPrompt(lang, person.length > 0),
      messages: [{ role: "user", content }],
      output_config: { effort: "medium" },
    },
    deps
  );
  if (!payload || payload.stop_reason === "refusal") return [];
  return parseAnswer(payload, docs.length);
}

// ---------------------------------------------------------------------------
// Fallback — the library speaks for itself
// ---------------------------------------------------------------------------

export function fallbackSegments(docs: LibraryDoc[], lang: AskLang): AskSegment[] {
  return docs.slice(0, 4).map((d, i) => ({
    label: "science" as const,
    text: d.seed ? d.seed.claim[lang] : d.sheet ? d.sheet[lang] : d.title,
    sources: [i + 1],
  }));
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export async function ask(input: {
  question: string;
  lang: AskLang;
  helpfulRoutines?: unknown;
  apiKey: string | null;
  model: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  onError?: (detail: string) => void;
}): Promise<AskResult> {
  const question = input.question.trim().slice(0, MAX_QUESTION_CHARS);
  const lang = input.lang;
  const history = sanitizeHelpfulRoutines(input.helpfulRoutines);
  const person = personSegments(history, lang);
  const emergency = localRiskScreen(question);

  const signal = input.signal ?? new AbortController().signal;
  const deps: ClaudeDeps | null = input.apiKey ? { apiKey: input.apiKey, model: input.model, signal, fetchImpl: input.fetchImpl } : null;

  let terms = localSearchTerms(question);
  let topics: TopicId[] = [];
  let claudeOk = deps !== null;
  if (deps) {
    try {
      const r = await searchTermsFor(question, lang, deps);
      terms = r.terms;
      topics = r.topics;
    } catch (e) {
      claudeOk = false;
      input.onError?.(`terms: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  const docs = retrieve(terms, topics);
  const sources = toSources(docs);
  const safety: AskSegment[] = emergency ? [{ label: "safety", text: EMERGENCY[lang], sources: [] }] : [];

  if (deps && claudeOk) {
    try {
      const segments = await answerWithClaude({ question, lang, docs, person, deps });
      if (segments.length > 0) {
        return {
          ok: true,
          lang,
          emergency,
          segments: [...safety, ...segments.filter((s) => s.label !== "person"), ...person],
          sources,
          source: "claude",
          notice: sources.length === 0 ? NO_SOURCES_NOTICE[lang] : null,
        };
      }
    } catch (e) {
      input.onError?.(`answer: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  return {
    ok: true,
    lang,
    emergency,
    segments: [...safety, ...fallbackSegments(docs, lang), ...person],
    sources,
    source: emergency && !deps ? "risk_screen" : "fallback",
    notice: FALLBACK_NOTICE[lang],
  };
}
