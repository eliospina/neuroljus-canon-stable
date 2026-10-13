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

export type TopicId =
  | "sensory"
  | "communication_aac"
  | "crisis_regulation"
  | "sleep"
  | "anxiety"
  | "feeding"
  | "school"
  | "adult_life"
  | "family_caregivers"
  | "transitions"
  | "women_girls"
  | "pain_health";

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
  seed?: { claim: { es: string; en: string; sv: string }; supports: string; doesNotSupport: string };
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

export const TOPIC_LABELS: Record<TopicId, { es: string; en: string; sv: string }> = {
  sensory: { es: "Procesamiento sensorial", en: "Sensory processing", sv: "Sensorisk bearbetning" },
  communication_aac: { es: "Comunicación y CAA", en: "Communication and AAC", sv: "Kommunikation och AKK" },
  crisis_regulation: { es: "Crisis y regulación", en: "Meltdowns and regulation", sv: "Utbrott och reglering" },
  sleep: { es: "Sueño", en: "Sleep", sv: "Sömn" },
  anxiety: { es: "Ansiedad", en: "Anxiety", sv: "Ångest" },
  feeding: { es: "Alimentación", en: "Feeding and eating", sv: "Mat och ätande" },
  school: { es: "Escuela", en: "School", sv: "Skola" },
  adult_life: { es: "Empleo y vida adulta", en: "Employment and adult life", sv: "Arbete och vuxenliv" },
  family_caregivers: { es: "Familia y cuidadores", en: "Family and caregivers", sv: "Familj och vårdgivare" },
  transitions: { es: "Cambios de rutina y transiciones", en: "Routine changes and transitions", sv: "Rutinförändringar och övergångar" },
  women_girls: { es: "Autismo en mujeres", en: "Autism in women and girls", sv: "Autism hos kvinnor och flickor" },
  pain_health: { es: "Dolor y salud", en: "Pain and health", sv: "Smärta och hälsa" },
};

export const TOPIC_ORDER: TopicId[] = [
  "sensory",
  "communication_aac",
  "crisis_regulation",
  "transitions",
  "sleep",
  "anxiety",
  "feeding",
  "school",
  "adult_life",
  "women_girls",
  "pain_health",
  "family_caregivers",
];
