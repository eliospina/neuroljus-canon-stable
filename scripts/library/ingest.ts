/**
 * Library ingestion: Europe PMC → filter → verify (Crossref) → data/library/docs.json
 *
 *   npx tsx scripts/library/ingest.ts            # full run (re-executable, merges with existing docs)
 *   npx tsx scripts/library/ingest.ts --max 3000 # cap on total documents (default 3000)
 *   npx tsx scripts/library/ingest.ts --dry      # search and rank only, write nothing
 *   npx tsx scripts/library/ingest.ts --all      # no per-topic targets: every eligible document (up to --max)
 *   Behind an HTTPS proxy (cloud sessions) prefix with NODE_USE_ENV_PROXY=1.
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
  assertReachable,
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
import { classifyTopics } from "./topicMatch";
import { BASE_QUERY, EVIDENCE_QUERY, PARTICIPATORY_QUERY, QUERY_PACKS, TOPICS, TRIAL_QUERY } from "./topics";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const MAX_TOTAL = Number(args[args.indexOf("--max") + 1]) || 3000;
const ALL = args.includes("--all");
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

/**
 * Out of scope: studies of medicines, supplements, diets and other biomedical
 * treatments (brain stimulation, microbiota transplants, acupuncture…).
 * Neuroljus never covers them; caregivers take those questions to a
 * clinician. Non-pharmacological and drug-free work stays in.
 */
export const BIOMEDICAL =
  /\b(?<!non-)(?<!non )(?<!drug-free )(risperidon\w*|aripiprazol\w*|antipsychotic\w*|melatonin|methylphenidate|atomoxetine|guanfacine|clonidine|fluoxetine|sertraline|citalopram|ssris?|oxytocin|vasopressin|bumetanide|memantine|cannabi\w*|cbd|probiotic\w*|prebiotic\w*|omega-3|fatty acids?|vitamin\w*|supplement\w*|diet|diets|dietary|gluten|casein|ketogenic|microbiota transfer\w*|f(a)?ecal|stem cells?|drugs?|pharmacotherap\w*|pharmacolog\w*|psychopharmacolog\w*|medications?|placebo|sulforaphane|n-acetylcysteine|folinic|propranolol|ketamine|midazolam|suramin|transcranial|tms|tdcs|neurofeedback|deep brain stimulation|brain stimulation|mood stabili[sz]ers?|psychotropic\w*|anticonvulsant\w*|antiepileptic\w*|antidepressant\w*|stimulants?|acupuncture|hyperbaric|chelation|lithium|valproate|naltrexone|arbaclofen|balovaptan)\b/i;

/** More titles that are about a treatment or a biological route to one: gut microbiota, folate, B12, complementary medicine. */
const BIOMEDICAL_TITLE_EXTRA =
  /\b(microbiota|microbiome|microbial interventions?|gut[- ]brain|leaky gut|intestinal microb\w*|folic acid|folate|cobalamin|b12|complementary and alternative medicine)\b/i;

/**
 * Named medicines and supplements. The title may not name them, so the abstract
 * is checked too, from three mentions up: a study that tests, reviews or
 * recommends one is out of scope, while one or two passing mentions (a
 * prevalence paper citing the approved drugs) are not.
 */
const NAMED_AGENTS =
  /\b(?<!non-)(risperidon\w*|aripiprazol\w*|melatonin|methylphenidate|atomoxetine|fluoxetine|sertraline|oxytocin|bumetanide|cannabidiol|cbd|probiotic\w*|omega-3|vitamin\w*|folic acid|folate|cobalamin|sulforaphane|n-acetylcysteine)\b/gi;
const NAMED_AGENTS_MIN = 3;

export function isBiomedical(title: string, abstract = ""): boolean {
  const clean = title.replace(/\bnon-?pharmacological\b/gi, "").replace(/\bdrug-free\b/gi, "");
  return BIOMEDICAL.test(clean) || BIOMEDICAL_TITLE_EXTRA.test(clean) || (abstract.match(NAMED_AGENTS) ?? []).length >= NAMED_AGENTS_MIN;
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
  if (isBiomedical(r.title, stripHtml(r.abstractText))) return "medicine, supplement, diet or other biomedical treatment (out of scope)";
  const types = (r.pubTypeList?.pubType ?? []).map((t) => t.toLowerCase());
  if (types.some((t) => /erratum|correction|comment|letter|editorial|case reports|news|published erratum/.test(t))) return "not a study";
  return null;
}

async function main() {
  await assertReachable();
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
      if (!ALL && (taken.get(topic.id) ?? 0) >= topic.target) continue;
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
          perTopicTargets: ALL ? "off (--all)" : "on",
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
    // Topics come from the title and abstract, not from which search found it
    // (Europe PMC also matches full text). Curated documents keep theirs.
    const classified = classifyTopics({ title: r.title ?? prev?.title ?? "", abstract: r.abstractText ?? prev?.abstract ?? null });
    const topics = prev?.sheet
      ? [...new Set([...prev.topics.filter((t) => t !== "challenging_behavior"), ...classified.filter((t) => t === "challenging_behavior")])].sort()
      : classified;
    if (topics.length === 0) {
      crossrefRejected.set("fits no topic (title and abstract)", (crossrefRejected.get("fits no topic (title and abstract)") ?? 0) + 1);
      continue;
    }
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
      topics,
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

  // Re-runs extend the library; they never shrink it by surprise.
  const lost = existing.filter((d) => !docs.some((x) => (x.doi || x.id) === (d.doi || d.id)));
  if (lost.length > 0 && !args.includes("--allow-drop")) {
    writeReport({ aborted: `would drop ${lost.length} existing documents`, wouldDrop: lost.map((d) => d.doi || d.id) });
    throw new Error(`${lost.length} existing documents would be dropped (see ingest-report.json). Nothing written. Use --allow-drop to accept.`);
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

if (process.argv[1]?.endsWith("ingest.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
