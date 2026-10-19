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
