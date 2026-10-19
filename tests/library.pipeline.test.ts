import assert from "node:assert/strict";
import { test } from "node:test";
import { epmcKind, type EpmcResult } from "../scripts/library/lib";
import { QUERY_PACKS, TOPICS } from "../scripts/library/topics";
import { expertToDoc, validateExpertPractice, type ExpertPractice } from "../scripts/library/expertSchema";
import { TOPIC_LABELS, TOPIC_ORDER } from "../src/lib/library/topics";

const KNOWN = TOPICS.map((t) => t.id);

function entry(over: Partial<ExpertPractice> = {}): ExpertPractice {
  return {
    slug: "low-arousal-fewer-demands",
    title: "Lower demands and arousal before anything else",
    topics: ["crisis_regulation"],
    citation: { author: "Author Name", book: "Book Title", year: 2014, locator: "ch. 3" },
    practice: {
      es: "Cuando sube la tensión, primero bajar exigencias y estímulos, y hablar menos.",
      en: "When tension rises, first lower demands and stimulation, and talk less.",
      sv: "När spänningen stiger, sänk först krav och stimulans, och prata mindre.",
    },
    when: { es: "Al inicio de la agitación.", en: "At the start of agitation.", sv: "I början av oro." },
    limits: { es: "No sustituye un plan individual.", en: "It does not replace an individual plan.", sv: "Ersätter inte en individuell plan." },
    writtenBy: "NeuroLjus",
    addedAt: "2026-10-19",
    ...over,
  };
}

test("every ingestion topic has trilingual labels on the site, and packs use known topics", () => {
  for (const t of TOPICS) {
    assert.ok(TOPIC_LABELS[t.id], `no site label for ${t.id}`);
    assert.ok(TOPIC_ORDER.includes(t.id), `${t.id} missing from TOPIC_ORDER`);
    assert.ok(t.label.es && t.label.en && t.label.sv);
  }
  assert.equal(TOPICS.length, Object.keys(TOPIC_LABELS).length);
  assert.ok(KNOWN.includes("challenging_behavior"));
  assert.ok(QUERY_PACKS.length >= 11);
  for (const p of QUERY_PACKS) for (const t of p.topics) assert.ok(KNOWN.includes(t), `${p.id}: unknown topic ${t}`);
});

test("ingestion never searches for medication", () => {
  for (const q of [...TOPICS.map((t) => t.terms), ...QUERY_PACKS.map((p) => p.terms)]) {
    assert.doesNotMatch(q, /melatonin|medicat|pharmac|antipsychotic|risperidone|aripiprazole|supplement|diet/i, q);
  }
});

test("Europe PMC records are classified, with controlled trials as their own kind", () => {
  const r = (pubType: string[], title = "A study"): EpmcResult => ({ id: "1", source: "MED", title, pubTypeList: { pubType } });
  assert.equal(epmcKind(r(["Meta-Analysis", "Review"])), "meta_analysis");
  assert.equal(epmcKind(r(["Systematic Review"])), "systematic_review");
  assert.equal(epmcKind(r(["Randomized Controlled Trial", "Journal Article"])), "trial");
  assert.equal(epmcKind(r(["Journal Article"], "A randomised controlled trial of parent training")), "trial");
  assert.equal(epmcKind(r(["Review"])), "review");
  assert.equal(epmcKind(r(["Journal Article"])), "study");
});

test("expert practice notes need a citation, three languages and the project's own words", () => {
  assert.deepEqual(validateExpertPractice(entry(), KNOWN), []);
  const quoted = entry({
    practice: {
      ...entry().practice,
      en: 'The book says "when the child is in chaos the adult must stay calm and lower every demand straight away no matter what"',
    },
  });
  assert.ok(validateExpertPractice(quoted, KNOWN).some((i) => /quotes more than/.test(i)));
  assert.ok(validateExpertPractice(entry({ citation: { author: "A", book: "B", year: 2014, locator: "" } }), KNOWN).some((i) => /citation/.test(i)));
  assert.ok(validateExpertPractice(entry({ when: { ...entry().when, sv: "" } }), KNOWN).some((i) => /when\.sv/.test(i)));
  assert.ok(validateExpertPractice(entry({ topics: ["astrology" as never] }), KNOWN).some((i) => /unknown topic/.test(i)));
  const med = entry({ practice: { ...entry().practice, en: "Give the medication early in the evening." } });
  assert.ok(validateExpertPractice(med, KNOWN).some((i) => /medication/.test(i)));
  assert.ok(validateExpertPractice(entry({ slug: "Bad Slug" }), KNOWN).some((i) => /slug/.test(i)));
});

test("an expert note becomes a library document labelled as practice, with no stored text", () => {
  const d = expertToDoc(entry());
  assert.equal(d.id, "EXPERT:low-arousal-fewer-demands");
  assert.equal(d.kind, "expert_practice");
  assert.equal(d.doi, "");
  assert.equal(d.abstract, null);
  assert.equal(d.verified.source, "expert_citation");
  assert.equal(d.seed?.claim.en, entry().practice.en);
  assert.equal(d.citation?.locator, "ch. 3");
  assert.ok(d.url.startsWith("https://"));
});

test("the sheet screen accepts faithful numbers and rejects named medicines", async () => {
  const { localSheetScreen, usageCostUsd } = await import("../scripts/library/sheetPrompt");
  const words = "This practical sheet repeats the study in calm and simple words for caregivers and keeps every claim close to the abstract it came from today.";
  const source = "Results. Data from 48,186 autistic people. Most adults (68.3%) and parents (82.5%) agreed. 22 infants with and 19 without family history.";
  const ok = localSheetScreen({ es: `${words} Más de 48.000 personas; 68 %.`, en: `${words} Over 48,000 people; 82.5%; 41 infants.`, sv: `${words} Över 48 000 autistiska personer deltog.` }, source);
  assert.deepEqual(ok, { reject: [], review: [] });
  const invented = localSheetScreen({ es: `${words} 75 %.`, en: words, sv: words }, source);
  assert.deepEqual(invented.reject, []);
  assert.ok(invented.review.some((r) => /number 75/.test(r)), "an untraceable number goes to the model check");
  const med = localSheetScreen({ es: words, en: `${words} Melatonin can help.`, sv: words }, source);
  assert.ok(med.reject.some((r) => /melatonin/i.test(r)));
  // Sonnet 5.5: $2 / $10 per MTok, batches at half price.
  assert.equal(usageCostUsd({ requests: 1, input: 1_000_000, output: 100_000, cacheRead: 0, cacheWrite: 0 }, false), 3);
  assert.equal(usageCostUsd({ requests: 1, input: 1_000_000, output: 100_000, cacheRead: 0, cacheWrite: 0 }, true), 1.5);
});

test("sheet tranches: aggression first with the strongest evidence first, then crisis, pain and family, then the rest", async () => {
  const { tranches } = await import("../scripts/library/sheetsBatch");
  const base = { pmid: null, pmcid: null, doi: "10.1/x", authors: "", journal: "", participatory: false, license: "CC BY", openText: true, citedBy: 0, url: "https://x", abstract: "text", sheet: null, verified: { crossref: true, retracted: false as const, checkedAt: "2026-10-19" } };
  const doc = (id: string, kind: string, topics: string[], year = 2020) => ({ ...base, id, title: id, kind, topics, year }) as never;
  const t = tranches([
    doc("cb-study", "study", ["challenging_behavior"], 2024),
    doc("cb-meta", "meta_analysis", ["challenging_behavior"], 2015),
    doc("pain", "review", ["pain_health"]),
    doc("sleep", "review", ["sleep"]),
    { ...(doc("done", "review", ["sleep"]) as object), sheet: { es: "a", en: "b", sv: "c" } } as never,
  ]);
  assert.deepEqual(t.map((x) => x.docs.map((d) => d.id)), [["cb-meta", "cb-study"], ["pain"], ["sleep"]]);
});

test("ingestion leaves out medicines, supplements, diets and other biomedical treatments", async () => {
  const { isBiomedical } = await import("../scripts/library/ingest");
  for (const t of [
    "Effects of Probiotics on Autism Spectrum Disorder in Children: A Systematic Review",
    "Aripiprazole for irritability in autistic children: a randomized controlled trial",
    "A ketogenic diet in autism",
    "Transcranial direct current stimulation in autistic children",
    "Melatonin for sleep problems in autism",
  ]) assert.equal(isBiomedical(t), true, t);
  for (const t of [
    "Non-pharmacological interventions for aggression in autistic adults: a systematic review",
    "Parent training for disruptive behavior in autism: a randomized trial",
    "Functional communication training to reduce self-injury",
  ]) assert.equal(isBiomedical(t), false, t);
});
