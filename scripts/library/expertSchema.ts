/**
 * Expert practice notes — schema and validation.
 *
 * Practice notes are written by the project from books it has read
 * (Hejlskov Elvén, Greene, Durand, Prizant…): ideas in the project's own
 * words plus the citation (author, book, year, chapter or page). Never text
 * copied from a book. They live in data/library/expert_practice.json and are
 * merged into docs.json by scripts/library/expert.ts.
 */

import type { BookCitation, LibraryDoc, TopicId } from "./lib";

type Tri = { es: string; en: string; sv: string };

export type ExpertPractice = {
  /** Lower-case slug, e.g. "hejlskov-elven-low-arousal-demands". */
  slug: string;
  title: string;
  topics: TopicId[];
  citation: BookCitation;
  /** The idea, in the project's own words. */
  practice: Tri;
  /** When it helps. */
  when: Tri;
  /** Limits: what it does not claim, who it may not fit. */
  limits: Tri;
  /** Who wrote the note (the project, never the book's author). */
  writtenBy: string;
  addedAt: string;
};

export const EXPERT_PATH_REL = "data/library/expert_practice.json";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_TEXT = 700;
/** A quoted passage longer than this many words looks copied, not paraphrased. */
const MAX_QUOTED_WORDS = 12;
const BLOCKED = /\b(medicat\w*|medicament\w*|läkemedel|dos(e|is|ering)|supplement\w*|suplement\w*|diet(a|ary)?\b|diagnos\w*)\b/i;

function quotedRuns(text: string): number {
  let longest = 0;
  for (const m of text.matchAll(/["“”«»„]([^"“”«»„]+)["“”«»„]/g)) {
    longest = Math.max(longest, m[1].trim().split(/\s+/).length);
  }
  return longest;
}

/** Returns the problems with one entry; empty when it may enter the library. */
export function validateExpertPractice(e: ExpertPractice, knownTopics: readonly string[]): string[] {
  const issues: string[] = [];
  const where = e?.slug || "(no slug)";
  if (!e || typeof e !== "object") return ["entry is not an object"];
  if (!SLUG.test(e.slug ?? "")) issues.push(`${where}: slug must be lower-case words joined by "-"`);
  if (!e.title || e.title.length < 10) issues.push(`${where}: title missing`);
  if (!Array.isArray(e.topics) || e.topics.length === 0) issues.push(`${where}: at least one topic`);
  for (const t of e.topics ?? []) if (!knownTopics.includes(t)) issues.push(`${where}: unknown topic ${t}`);
  const c = e.citation;
  if (!c || !c.author?.trim() || !c.book?.trim() || !c.locator?.trim() || !Number.isInteger(c.year) || c.year < 1900) {
    issues.push(`${where}: citation needs author, book, year and chapter/page`);
  }
  for (const field of ["practice", "when", "limits"] as const) {
    for (const lang of ["es", "en", "sv"] as const) {
      const text = e[field]?.[lang]?.trim() ?? "";
      if (!text) issues.push(`${where}: ${field}.${lang} is empty`);
      if (text.length > MAX_TEXT) issues.push(`${where}: ${field}.${lang} is over ${MAX_TEXT} characters`);
      if (quotedRuns(text) > MAX_QUOTED_WORDS) issues.push(`${where}: ${field}.${lang} quotes more than ${MAX_QUOTED_WORDS} words; write the idea in your own words`);
      if (field !== "limits" && BLOCKED.test(text)) issues.push(`${where}: ${field}.${lang} mentions medication, diet, supplements or diagnosis`);
    }
  }
  if (!e.writtenBy?.trim()) issues.push(`${where}: writtenBy missing`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.addedAt ?? "")) issues.push(`${where}: addedAt must be YYYY-MM-DD`);
  return issues;
}

/** The library document an expert note becomes (searchable like a seed). */
export function expertToDoc(e: ExpertPractice): LibraryDoc {
  const id = `EXPERT:${e.slug}`;
  return {
    id,
    pmid: null,
    pmcid: null,
    doi: "",
    title: e.title,
    authors: e.citation.author,
    journal: `${e.citation.book}, ${e.citation.locator}`,
    year: e.citation.year,
    kind: "expert_practice",
    participatory: false,
    license: "unknown",
    openText: false,
    citedBy: 0,
    topics: [...e.topics].sort(),
    url: `https://neuroljus.com/library#${encodeURIComponent(id)}`,
    abstract: null,
    sheet: null,
    seed: { claim: e.practice, supports: e.when, doesNotSupport: e.limits },
    citation: e.citation,
    verified: { crossref: false, retracted: false, checkedAt: e.addedAt, source: "expert_citation" },
  };
}
