/**
 * Library ingestion — shared types and helpers.
 *
 * Sources: Europe PMC REST API (search, metadata, licence, retraction flags)
 * and Crossref (DOI existence and retraction notices). No keys needed.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

export const DATA_DIR = path.resolve(process.cwd(), "data/library");
export const DOCS_PATH = path.join(DATA_DIR, "docs.json");
export const INDEX_PATH = path.join(DATA_DIR, "index.json");
export const SOURCES_PATH = path.resolve(process.cwd(), "docs/library/SOURCES.md");

export const USER_AGENT = "neuroljus-library/0.1 (https://neuroljus.com; mailto:hello@neuroljus.com)";

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
  | "pain_health"
  | "challenging_behavior";

/**
 * trial: randomized or controlled trial. guideline: clinical guidance from a
 * public body (e.g. NICE). expert_practice: practice notes written by the
 * project from a published book, in its own words, with the citation.
 */
export type EvidenceKind =
  | "systematic_review"
  | "meta_analysis"
  | "review"
  | "trial"
  | "study"
  | "guideline"
  | "expert_practice";

/** How the record was verified by code. */
export type VerifiedSource = "europepmc" | "crossref_only" | "official_url" | "expert_citation";

/** Book citation for expert_practice entries (never a quotation). */
export type BookCitation = { author: string; book: string; year: number; locator: string };

export type LibraryDoc = {
  /** Europe PMC id: PMCID when available, else PMID; DOI:…, GUIDE:… or EXPERT:… otherwise. */
  id: string;
  pmid: string | null;
  pmcid: string | null;
  /** Empty only for guideline and expert_practice entries, which link by url. */
  doi: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  kind: EvidenceKind;
  /** Participatory / autistic-led / lived-experience signals in the abstract. */
  participatory: boolean;
  license: string;
  /** True only when the licence is an open (CC) licence; otherwise no text is stored. */
  openText: boolean;
  citedBy: number;
  topics: TopicId[];
  url: string;
  /** Abstract text — only stored when openText is true. */
  abstract: string | null;
  /** Practical sheet made with Claude: "what this means for a caregiver tomorrow morning". */
  sheet: { es: string; en: string; sv: string } | null;
  /** Hand-curated key finding (seed entries only). */
  seed?: {
    claim: { es: string; en: string; sv: string };
    supports: { es: string; en: string; sv: string };
    doesNotSupport: { es: string; en: string; sv: string };
  };
  /** expert_practice only: where the idea comes from. */
  citation?: BookCitation;
  verified: {
    crossref: boolean;
    retracted: false;
    checkedAt: string;
    /** Absent on documents ingested before this field existed (all from Europe PMC). */
    source?: VerifiedSource;
  };
};

export function readDocs(): LibraryDoc[] {
  if (!existsSync(DOCS_PATH)) return [];
  return JSON.parse(readFileSync(DOCS_PATH, "utf8")) as LibraryDoc[];
}

export function writeDocs(docs: LibraryDoc[]): void {
  mkdirSync(DATA_DIR, { recursive: true });
  const sorted = [...docs].sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(DOCS_PATH, JSON.stringify(sorted, null, 1) + "\n");
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchJson<T>(url: string, tries = 3): Promise<T | null> {
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) {
        await sleep(1500 * attempt);
        continue;
      }
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      await sleep(1000 * attempt);
    }
  }
  return null;
}

/**
 * Stop before doing anything if a source cannot be reached. fetchJson treats a
 * failure as "no record", so without this a network problem would look like
 * "nothing found" and every DOI would fail Crossref. Node's fetch ignores
 * HTTPS_PROXY unless NODE_USE_ENV_PROXY=1.
 */
export async function assertReachable(): Promise<void> {
  const probes = [
    `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=autism&format=json&pageSize=1`,
    `https://api.crossref.org/works/10.1177/1098300712458324`,
  ];
  for (const url of probes) {
    let ok = false;
    try {
      ok = (await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } })).ok;
    } catch {
      ok = false;
    }
    if (!ok) {
      throw new Error(
        `Cannot reach ${new URL(url).host}. Nothing was changed. Behind a proxy, run with NODE_USE_ENV_PROXY=1.`
      );
    }
  }
}

/** Normalise a DOI: lower-case, no URL prefix, no trailing punctuation. */
export function normalizeDoi(input: string | null | undefined): string | null {
  if (!input) return null;
  const d = input
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .replace(/[.,;)\]]+$/, "")
    .toLowerCase();
  return /^10\.\d{4,9}\/\S+$/.test(d) ? d : null;
}

/** Open licences under which we may store the abstract text. */
export function isOpenLicense(license: string | null | undefined): boolean {
  const l = (license || "").toLowerCase().replace(/\s+/g, " ").trim();
  return l.startsWith("cc") || l === "public domain" || l === "cc0";
}

export function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Europe PMC
// ---------------------------------------------------------------------------

export type EpmcResult = {
  id: string;
  source: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title?: string;
  authorString?: string;
  journalTitle?: string;
  journalInfo?: { journal?: { title?: string; medlineAbbreviation?: string } };
  pubYear?: string;
  abstractText?: string;
  isOpenAccess?: string;
  license?: string;
  citedByCount?: number;
  pubTypeList?: { pubType: string[] };
  keywordList?: { keyword: string[] };
  commentCorrectionList?: { commentCorrection: Array<{ type?: string; reference?: string }> };
};

const EPMC = "https://www.ebi.ac.uk/europepmc/webservices/rest";

export async function epmcSearch(query: string, opts: { pageSize?: number; sort?: string; max?: number } = {}): Promise<EpmcResult[]> {
  const pageSize = opts.pageSize ?? 100;
  const max = opts.max ?? pageSize;
  const out: EpmcResult[] = [];
  let cursor = "*";
  while (out.length < max) {
    const url =
      `${EPMC}/search?query=${encodeURIComponent(query)}&format=json&resultType=core` +
      `&pageSize=${Math.min(pageSize, max - out.length)}&cursorMark=${encodeURIComponent(cursor)}` +
      (opts.sort ? `&sort=${encodeURIComponent(opts.sort)}` : "");
    const page = await fetchJson<{ nextCursorMark?: string; resultList?: { result: EpmcResult[] } }>(url);
    const results = page?.resultList?.result ?? [];
    out.push(...results);
    if (!page?.nextCursorMark || page.nextCursorMark === cursor || results.length === 0) break;
    cursor = page.nextCursorMark;
    await sleep(350);
  }
  return out;
}

export function epmcIsRetracted(r: EpmcResult): boolean {
  const types = (r.pubTypeList?.pubType ?? []).map((t) => t.toLowerCase());
  if (types.some((t) => t.includes("retract"))) return true;
  const comments = r.commentCorrectionList?.commentCorrection ?? [];
  return comments.some((c) => /retraction in|retracted/i.test(c.type ?? ""));
}

export function epmcKind(r: EpmcResult): EvidenceKind {
  const types = (r.pubTypeList?.pubType ?? []).map((t) => t.toLowerCase());
  const title = (r.title ?? "").toLowerCase();
  if (types.some((t) => t.includes("meta-analysis")) || /meta-analy/.test(title)) return "meta_analysis";
  if (types.some((t) => t.includes("systematic")) || /systematic review|scoping review|umbrella review/.test(title)) return "systematic_review";
  if (types.some((t) => t === "review")) return "review";
  if (types.some((t) => /randomi[sz]ed controlled trial|controlled clinical trial|clinical trial/.test(t)) || /randomi[sz]ed (controlled |clinical )?trial/.test(title)) return "trial";
  return "study";
}

const PARTICIPATORY = /\b(participatory|co-?produc\w*|co-?design\w*|autistic (adults|people|participants|researchers|community|voices|perspectives|women|men|students)|lived experience|first-?person|self-?advoca\w*|neurodiversity|community-based)\b/i;

export function epmcParticipatory(r: EpmcResult): boolean {
  return PARTICIPATORY.test(`${r.title ?? ""} ${r.abstractText ?? ""}`);
}

// ---------------------------------------------------------------------------
// Crossref
// ---------------------------------------------------------------------------

type CrossrefWork = {
  message?: {
    DOI?: string;
    type?: string;
    title?: string[];
    "updated-by"?: Array<{ type?: string; label?: string }>;
    "update-to"?: Array<{ type?: string }>;
    author?: Array<{ family?: string; given?: string }>;
    "container-title"?: string[];
    issued?: { "date-parts"?: number[][] };
    "published-print"?: { "date-parts"?: number[][] };
    "published-online"?: { "date-parts"?: number[][] };
  };
};

export type CrossrefMeta = { title: string; authors: string; journal: string; year: number | null };

export type CrossrefCheck = { exists: boolean; retracted: boolean; isRetractionNotice: boolean; meta: CrossrefMeta | null };

export function crossrefMeta(m: NonNullable<CrossrefWork["message"]>): CrossrefMeta {
  const year = m.issued?.["date-parts"]?.[0]?.[0] ?? m["published-print"]?.["date-parts"]?.[0]?.[0] ?? m["published-online"]?.["date-parts"]?.[0]?.[0] ?? null;
  const authors = (m.author ?? []).map((a) => [a.family, a.given?.[0]].filter(Boolean).join(" ")).filter(Boolean).join(", ");
  return { title: stripHtml(m.title?.[0] ?? ""), authors: authors.slice(0, 200), journal: m["container-title"]?.[0] ?? "", year };
}

export async function crossrefCheck(doi: string): Promise<CrossrefCheck> {
  const j = await fetchJson<CrossrefWork>(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const m = j?.message;
  if (!m?.DOI) return { exists: false, retracted: false, isRetractionNotice: false, meta: null };
  const retracted = (m["updated-by"] ?? []).some((u) => /retract/i.test(`${u.type ?? ""} ${u.label ?? ""}`));
  const isRetractionNotice = (m["update-to"] ?? []).some((u) => /retract/i.test(u.type ?? ""));
  return { exists: true, retracted, isRetractionNotice, meta: crossrefMeta(m) };
}

/** True when an official page answers 200 (guidelines without a DOI). */
export async function officialUrlResolves(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": USER_AGENT } });
    return res.ok;
  } catch {
    return false;
  }
}
