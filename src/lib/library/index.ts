/**
 * Library — runtime access to the verified autism research library.
 *
 * data/library/docs.json and index.json are built offline by scripts/library
 * (Europe PMC + Crossref, DOI / licence / retraction checked by code). This
 * module only loads them and searches; it never calls the network.
 */

import MiniSearch, { type Options } from "minisearch";
import docsJson from "../../../data/library/docs.json";
import indexJson from "../../../data/library/index.json";
import { SEARCH_OPTIONS } from "./searchOptions";

export type { TopicId } from "./topics";
import type { TopicId } from "./topics";

export type EvidenceKind = "systematic_review" | "meta_analysis" | "review" | "study";

export type LibraryDoc = {
  id: string;
  pmid: string | null;
  pmcid: string | null;
  doi: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  kind: EvidenceKind;
  participatory: boolean;
  license: string;
  openText: boolean;
  citedBy: number;
  topics: TopicId[];
  url: string;
  abstract: string | null;
  sheet: { es: string; en: string; sv: string } | null;
  seed?: { claim: { es: string; en: string; sv: string }; supports: { es: string; en: string; sv: string }; doesNotSupport: { es: string; en: string; sv: string } };
  verified: { crossref: boolean; retracted: false; checkedAt: string };
};

export const LIBRARY_DOCS = docsJson as LibraryDoc[];
const BY_ID = new Map(LIBRARY_DOCS.map((d) => [d.id, d]));

let mini: MiniSearch | null = null;
function index(): MiniSearch {
  if (!mini) mini = MiniSearch.loadJS(indexJson as unknown as Parameters<typeof MiniSearch.loadJS>[0], SEARCH_OPTIONS as Options);
  return mini;
}

export type SearchHit = { doc: LibraryDoc; score: number };

/** BM25 search over title, abstract, seed claim and practical sheet (English terms). */
export function searchLibrary(query: string, limit = 8): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  return index()
    .search(q)
    .slice(0, limit * 2)
    .map((r) => ({ doc: BY_ID.get(String(r.id))!, score: r.score }))
    .filter((h) => h.doc)
    .sort((a, b) => b.score + kindBoost(b.doc) - (a.score + kindBoost(a.doc)))
    .slice(0, limit);
}

/** Small deterministic nudge toward stronger evidence and seeds at equal relevance. */
function kindBoost(d: LibraryDoc): number {
  let b = d.seed ? 2 : 0;
  if (d.kind === "meta_analysis") b += 1.5;
  else if (d.kind === "systematic_review") b += 1.2;
  else if (d.kind === "review") b += 0.5;
  if (d.participatory) b += 0.5;
  return b;
}

export function getDoc(id: string): LibraryDoc | undefined {
  return BY_ID.get(id);
}

export { TOPIC_LABELS, TOPIC_ORDER } from "./topics";
