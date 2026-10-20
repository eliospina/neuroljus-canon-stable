/**
 * Voice line: Ask NeuroLjus in spoken form. Same engine as /api/ask (BM25
 * retrieval over the verified library, then Claude with native citations via
 * answerWithDocuments), but with local search terms (no extra round trip), a
 * short spoken prompt and at most three sentences and two sources.
 */

import { severeSignals } from "./triage";
import { dangerSentence, type EmergencyLang } from "../emergency";
import { answerWithDocuments, fallbackSegments, localSearchTerms, retrieve, toSources, type AskSegment, type AskSource } from "../ask/expert";
import { clinicianSentence, firstSentences, MEDICATION_ASK, claimsDiagnosis } from "./spoken";

export const LINE_ASK_TIMEOUT_MS = 2_800;
const MAX_SENTENCES = 3;
const MAX_SOURCES = 2;
const LANG_NAME: Record<EmergencyLang, string> = { es: "Spanish", en: "English", sv: "Swedish" };

export type LineSource = { title: string; year: number };

export type LineAskResult = {
  ok: true;
  /** "risk" and "medication" mean no search was done; "library" is the library alone, "claude" the model on top of it. */
  mode: "claude" | "library" | "risk" | "medication";
  risk: boolean;
  /** Set when the caller should switch to the protocol tool. */
  use_tool: "protocol" | null;
  /** At most three short sentences, plain text. */
  speech: string;
  /** Empty when the answer is practice without a study. */
  sources: LineSource[];
  /** True when the library had nothing, or no study backed the answer: the agent may try the search tool. */
  library_empty: boolean;
};

function spokenSystemPrompt(lang: EmergencyLang): string {
  return (
    "You are the voice of NeuroLjus, speaking on a phone line with a caregiver of an autistic person. " +
    `Answer in ${LANG_NAME[lang]}. Reply with ONE paragraph of at most three short sentences, plain spoken words: no lists, no markdown, no numbers in brackets. ` +
    "Start the paragraph with [SCIENCE] if it rests on an attached study (cite it with the citation feature, never from memory) or [PRACTICE] if it is care knowledge without a study. " +
    "Be concrete: what to do now. Respectful, neurodiversity-affirming language. " +
    "Never diagnose. Never mention medication or doses: a clinician decides. If an attached study does not fit, ignore it."
  );
}

type Deps = { apiKey: string; model: string; signal: AbortSignal; fetchImpl?: typeof fetch };

/** Titles that read badly aloud get shortened at a word. */
function spokenTitle(title: string): string {
  const t = title.replace(/\s+/g, " ").replace(/[.:]\s*$/, "").trim();
  if (t.length <= 90) return t;
  const cut = t.slice(0, 90);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 40)).trim();
}

function pickSources(segments: AskSegment[], sources: AskSource[]): LineSource[] {
  const cited = new Set<number>();
  for (const s of segments) for (const n of s.sources) cited.add(n);
  return sources
    .filter((s) => cited.has(s.n))
    .slice(0, MAX_SOURCES)
    .map((s) => ({ title: spokenTitle(s.title), year: s.year }));
}

export async function buildLineAsk(input: {
  question: string;
  lang: EmergencyLang;
  country: string | null;
  apiKey: string | null;
  model: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  onError?: (stage: string) => void;
}): Promise<LineAskResult> {
  const { question, lang, country } = input;

  if (severeSignals(question).severe) {
    return { ok: true, mode: "risk", risk: true, use_tool: "protocol", speech: dangerSentence(country, lang), sources: [], library_empty: false };
  }
  if (MEDICATION_ASK.test(question)) {
    return { ok: true, mode: "medication", risk: false, use_tool: null, speech: clinicianSentence(lang), sources: [], library_empty: false };
  }

  const docs = retrieve(localSearchTerms(question), []);
  const sources = toSources(docs);
  const libraryEmpty = docs.length === 0;

  const signal = input.signal ?? new AbortController().signal;
  if (input.apiKey && docs.length > 0) {
    const deps: Deps = { apiKey: input.apiKey, model: input.model, signal, fetchImpl: input.fetchImpl };
    try {
      const segments = await answerWithDocuments({
        system: spokenSystemPrompt(lang),
        userText: `Question:\n${question}`,
        docs,
        deps,
        maxTokens: 220,
      });
      const speech = firstSentences(segments.map((s) => s.text).join(" "), MAX_SENTENCES);
      // A medication mention that slipped through the model is not read aloud.
      if (speech && !MEDICATION_ASK.test(speech) && !claimsDiagnosis(speech)) {
        const cited = pickSources(segments, sources);
        // No study cited: the library did not back this answer, so the agent may try the search tool.
        return { ok: true, mode: "claude", risk: false, use_tool: null, speech, sources: cited, library_empty: cited.length === 0 };
      }
    } catch (e) {
      input.onError?.(e instanceof Error && e.name === "AbortError" ? "timeout" : "upstream");
    }
  }

  // Library only: the finding text of the best documents, never the question.
  const segments = fallbackSegments(docs, lang).slice(0, 2);
  const speech = firstSentences(segments.map((s) => s.text).join(" "), MAX_SENTENCES);
  return {
    ok: true,
    mode: "library",
    risk: false,
    use_tool: null,
    speech,
    sources: pickSources(segments, sources),
    library_empty: libraryEmpty || !speech,
  };
}
