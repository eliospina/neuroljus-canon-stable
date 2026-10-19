/**
 * Library ingestion: Europe PMC → filter → verify (Crossref) → data/library/docs.json
 *
 *   npx tsx scripts/library/ingest.ts            # full run (re-executable, merges with existing docs)
 *   npx tsx scripts/library/ingest.ts --max 3000 # cap on total documents (default 3000)
 *   npx tsx scripts/library/ingest.ts --dry      # search and rank only, write nothing
 *
 * Rules applied by code, per document:
 *   - open access in Europe PMC, abstract present, English, 2010 or later
 *   - not retracted (Europe PMC publication types + Crossref retraction notices)
 *   - DOI present and resolving in Crossref
 *   - abstract text is stored only under an open (CC) licence; otherwise metadata and link only
 *   - systematic reviews, meta-analyses, controlled trials and participatory research with autistic people rank first
 *
 * Every run writes data/library/ingest-report.json: candidates, selected
 * documents, and every rejection with its reason.
 *
 * No API keys are used. Practical sheets are added later by sheets.ts.
 */

import {
  crossrefCheck,
  epmcIsRetracted,
  epmcKind,
  epmcParticipatory,
  epmcSearch,
  isOpenLicense,
  normalizeDoi,
  readDocs,
  sleep,
  stripHtml,
  writeDocs,
  type EpmcResult,
  type LibraryDoc,
  type TopicId,
} from "./lib";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { BASE_QUERY, EVIDENCE_QUERY, PARTICIPATORY_QUERY, QUERY_PACKS, TOPICS, TRIAL_QUERY } from "./topics";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const MAX_TOTAL = Number(args[args.indexOf("--max") + 1]) || 3000;
const REPORT_PATH = path.resolve(process.cwd(), "data/library/ingest-report.json");
const MIN_ABSTRACT_CHARS = 400;

type Candidate = { r: EpmcResult; doi: string; topics: Set<TopicId>; score: number };

function score(r: EpmcResult, participatoryTier: boolean): number {
  const kind = epmcKind(r);
  const year = Number(r.pubYear) || 2010;
  const cited = Math.log1p(r.citedByCount ?? 0);
  let s = cited;
  if (kind === "meta_analysis") s += 6;
  else if (kind === "systematic_review") s += 5;
  else if (kind === "trial") s += 4;
  else if (kind === "review") s += 3;
  if (epmcParticipatory(r)) s += 3;
  if (participatoryTier) s += 1;
  s += Math.max(0, year - 2015) * 0.25; // recent evidence gets a small nudge
  if (isOpenLicense(r.license)) s += 1;
  return s;
}

/** Off-topic guard: the abstract must actually be about autistic people, not a passing mention. */
function aboutAutism(r: EpmcResult): boolean {
  const text = `${r.title ?? ""} ${r.abstractText ?? ""}`.toLowerCase();
  const hits = (text.match(/autis/g) ?? []).length;
  return hits >= 2 || /autis/.test((r.title ?? "").toLowerCase());
}

function eligible(r: EpmcResult): string | null {
  if (!r.title || !r.abstractText) return "no title/abstract";
  if (stripHtml(r.abstractText).length < MIN_ABSTRACT_CHARS) return "abstract too short";
  if (r.isOpenAccess !== "Y") return "not open access";
  if (epmcIsRetracted(r)) return "retracted (Europe PMC)";
  if (!normalizeDoi(r.doi)) return "no DOI";
  if ((Number(r.pubYear) || 0) < 2010) return "before 2010";
  if (!aboutAutism(r)) return "not about autism";
  const types = (r.pubTypeList?.pubType ?? []).map((t) => t.toLowerCase());
  if (types.some((t) => /erratum|correction|comment|letter|editorial|case reports|news|published erratum/.test(t))) return "not a study";
  return null;
}

async function main() {
  const existing = readDocs();
  const byDoi = new Map<string, Candidate>();
  const rejected = new Map<string, number>();

  // Collect ranked candidates per topic, then assign round-robin so each topic
  // fills with documents of its own instead of the same highly cited reviews.
  const perTopic = new Map<TopicId, Candidate[]>(TOPICS.map((t) => [t.id, []]));
  // Topics first, then the focused packs; a pack's documents queue under its
  // first topic and are tagged with all of its topics.
  const sources = [
    ...TOPICS.map((t) => ({ id: t.id, terms: t.terms, topics: [t.id] as TopicId[] })),
    ...QUERY_PACKS.map((p) => ({ id: `pack:${p.id}`, terms: p.terms, topics: p.topics })),
  ];
  const seenBySource = new Map<string, Set<string>>();
  for (const src of sources) {
    const tiers: Array<{ q: string; sort: string; max: number; participatory: boolean }> = [
      { q: `${BASE_QUERY} AND ${EVIDENCE_QUERY} AND ${src.terms}`, sort: "CITED desc", max: 300, participatory: false },
      { q: `${BASE_QUERY} AND ${EVIDENCE_QUERY} AND ${src.terms}`, sort: "FIRST_PDATE desc", max: 150, participatory: false },
      { q: `${BASE_QUERY} AND ${TRIAL_QUERY} AND ${src.terms}`, sort: "CITED desc", max: 200, participatory: false },
      { q: `${BASE_QUERY} AND ${PARTICIPATORY_QUERY} AND ${src.terms}`, sort: "CITED desc", max: 200, participatory: true },
    ];
    const primary = src.topics[0];
    const seen = seenBySource.get(primary) ?? new Set<string>();
    seenBySource.set(primary, seen);
    const list = perTopic.get(primary)!;
    let added = 0;
    for (const tier of tiers) {
      const results = await epmcSearch(tier.q, { sort: tier.sort, max: tier.max });
      for (const r of results) {
        const doi = normalizeDoi(r.doi);
        const why = eligible(r);
        if (why || !doi) {
          rejected.set(why ?? "no DOI", (rejected.get(why ?? "no DOI") ?? 0) + 1);
          continue;
        }
        const already = list.find((c) => c.doi === doi);
        if (already) {
          for (const t of src.topics) already.topics.add(t);
          continue;
        }
        if (seen.has(doi)) continue;
        seen.add(doi);
        list.push({ r, doi, topics: new Set(src.topics), score: score(r, tier.participatory) });
        added += 1;
      }
      await sleep(400);
    }
    console.log(`${src.id}: +${added} candidates`);
  }
  for (const list of perTopic.values()) list.sort((a, b) => b.score - a.score);

  const taken = new Map<TopicId, number>(TOPICS.map((t) => [t.id, 0]));
  let progress = true;
  while (progress) {
    progress = false;
    for (const topic of TOPICS) {
      if ((taken.get(topic.id) ?? 0) >= topic.target) continue;
      const list = perTopic.get(topic.id) ?? [];
      while (list.length > 0) {
        const c = list.shift()!;
        const prev = byDoi.get(c.doi);
        if (prev) {
          // Already in the library through another topic: tag it, it does not count here.
          for (const t of c.topics) prev.topics.add(t);
          continue;
        }
        byDoi.set(c.doi, c);
        taken.set(topic.id, (taken.get(topic.id) ?? 0) + 1);
        progress = true;
        break;
      }
    }
  }
  for (const topic of TOPICS) console.log(`  ${topic.id}: ${taken.get(topic.id)} own documents`);

  // Keep previously ingested docs too (re-runs extend the library; they never silently drop).
  for (const d of existing) {
    if (d.doi && !byDoi.has(d.doi)) {
      byDoi.set(d.doi, {
        r: { id: d.id, source: "", doi: d.doi, title: d.title, abstractText: d.abstract ?? "", pmid: d.pmid ?? undefined, pmcid: d.pmcid ?? undefined, pubYear: String(d.year), citedByCount: d.citedBy, license: d.license, isOpenAccess: "Y", authorString: d.authors, journalTitle: d.journal },
        doi: d.doi,
        topics: new Set(d.topics),
        score: 0,
      });
    }
  }

  // What the topic targets left unused (eligible, but beyond each topic's quota).
  const leftOver = [...perTopic.values()].reduce((n, l) => n + l.filter((c) => !byDoi.has(c.doi)).length, 0);
  const ranked = [...byDoi.values()].sort((a, b) => b.score - a.score).slice(0, MAX_TOTAL);
  console.log(`\n${ranked.length} unique documents selected (cap ${MAX_TOTAL}). Rejections:`, Object.fromEntries(rejected));
  const writeReport = (extra: Record<string, unknown>) =>
    writeFileSync(
      REPORT_PATH,
      JSON.stringify(
        {
          ranAt: new Date().toISOString().slice(0, 10),
          cap: MAX_TOTAL,
          previousDocuments: existing.length,
          selectedBeforeVerification: ranked.length,
          eligibleBeyondTopicTargets: leftOver,
          // Counted per search hit: one record can be rejected by several queries.
          rejectedSearchHits: Object.fromEntries([...rejected.entries()].sort((a, b) => b[1] - a[1])),
          ...extra,
        },
        null,
        2
      ) + "\n"
    );
  if (DRY) {
    writeReport({ dry: true });
    return;
  }

  const existingById = new Map(existing.map((d) => [d.doi, d]));
  const crossrefRejected = new Map<string, number>();
  const docs: LibraryDoc[] = [];
  let i = 0;
  for (const c of ranked) {
    i += 1;
    const prev = existingById.get(c.doi);
    const check = await crossrefCheck(c.doi);
    await sleep(120);
    if (!check.exists) {
      console.log(`  skip ${c.doi}: DOI not found in Crossref`);
      crossrefRejected.set("DOI not found in Crossref", (crossrefRejected.get("DOI not found in Crossref") ?? 0) + 1);
      continue;
    }
    if (check.retracted || check.isRetractionNotice) {
      console.log(`  skip ${c.doi}: retracted (Crossref)`);
      crossrefRejected.set("retracted (Crossref)", (crossrefRejected.get("retracted (Crossref)") ?? 0) + 1);
      continue;
    }
    const r = c.r;
    const license = (r.license ?? prev?.license ?? "").trim();
    const openText = isOpenLicense(license);
    const abstract = openText ? stripHtml(r.abstractText ?? prev?.abstract ?? "") : null;
    const pmcid = r.pmcid ?? prev?.pmcid ?? null;
    const pmid = r.pmid ?? prev?.pmid ?? null;
    const id = pmcid ?? (pmid ? `MED${pmid}` : `DOI:${c.doi}`);
    docs.push({
      id,
      pmid,
      pmcid,
      doi: c.doi,
      title: stripHtml(r.title ?? prev?.title ?? ""),
      authors: (r.authorString ?? prev?.authors ?? "").replace(/\.$/, "").slice(0, 200),
      journal: r.journalTitle ?? r.journalInfo?.journal?.title ?? prev?.journal ?? "",
      year: Number(r.pubYear) || prev?.year || 0,
      kind: r.pubTypeList ? epmcKind(r) : prev?.kind ?? "study",
      participatory: r.abstractText ? epmcParticipatory(r) : prev?.participatory ?? false,
      license: license || "unknown",
      openText,
      citedBy: r.citedByCount ?? prev?.citedBy ?? 0,
      topics: [...c.topics].sort(),
      url: pmcid ? `https://europepmc.org/article/PMC/${pmcid}` : pmid ? `https://europepmc.org/article/MED/${pmid}` : `https://doi.org/${c.doi}`,
      abstract,
      sheet: prev?.sheet ?? null,
      seed: prev?.seed,
      verified: { crossref: true, retracted: false, checkedAt: new Date().toISOString().slice(0, 10), source: prev?.verified.source ?? "europepmc" },
      ...(prev?.citation ? { citation: prev.citation } : {}),
    });
    if (i % 25 === 0) console.log(`  verified ${i}/${ranked.length}`);
  }

  // Seeds, guidelines and expert notes are not Europe PMC search results: keep them as they are.
  const kept = new Set(docs.map((d) => d.doi || d.id));
  for (const d of existing) {
    if (!d.doi && !kept.has(d.id)) docs.push(d);
  }

  writeDocs(docs);
  const added = docs.filter((d) => !existingById.has(d.doi)).length;
  writeReport({
    written: docs.length,
    added,
    rejectedAtVerification: Object.fromEntries(crossrefRejected),
  });
  const withText = docs.filter((d) => d.openText).length;
  console.log(`\nWrote ${docs.length} documents (${withText} with open-licence abstract text) → data/library/docs.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
