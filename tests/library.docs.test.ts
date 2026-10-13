import assert from "node:assert/strict";
import { test } from "node:test";
import { LIBRARY_DOCS, searchLibrary, TOPIC_LABELS, type TopicId } from "../src/lib/library";

const OPEN = /^(cc|public domain)/i;
const DOI = /^10\.\d{4,9}\/\S+$/;

test("the library has a real number of verified, non-retracted documents with DOIs", () => {
  assert.ok(LIBRARY_DOCS.length >= 300, `expected ≥ 300 documents, got ${LIBRARY_DOCS.length}`);
  const dois = new Set<string>();
  for (const d of LIBRARY_DOCS) {
    assert.match(d.doi, DOI, `${d.id} has a malformed DOI`);
    assert.ok(!dois.has(d.doi), `duplicate DOI ${d.doi}`);
    dois.add(d.doi);
    assert.equal(d.verified.crossref, true, `${d.doi} not verified in Crossref`);
    assert.equal(d.verified.retracted, false);
    assert.ok(d.year >= 2008, `${d.doi} year ${d.year}`);
    assert.ok(d.title.length > 10);
    assert.ok(d.url.startsWith("https://"));
    assert.ok(d.topics.length > 0, `${d.doi} has no topic`);
    for (const t of d.topics) assert.ok(TOPIC_LABELS[t as TopicId], `unknown topic ${t}`);
  }
});

test("abstract text is stored only under an open licence", () => {
  for (const d of LIBRARY_DOCS) {
    if (d.abstract) assert.ok(OPEN.test(d.license), `${d.doi} stores text under licence "${d.license}"`);
    if (d.openText) assert.ok(OPEN.test(d.license));
    if (d.sheet) assert.ok(d.openText, `${d.doi} has a sheet without open text`);
  }
});

test("evidence mix: reviews and research with autistic people are well represented", () => {
  const strong = LIBRARY_DOCS.filter((d) => d.kind === "systematic_review" || d.kind === "meta_analysis").length;
  const reviews = LIBRARY_DOCS.filter((d) => d.kind === "review").length;
  const participatory = LIBRARY_DOCS.filter((d) => d.participatory).length;
  assert.ok(strong / LIBRARY_DOCS.length >= 0.3, `only ${strong} systematic reviews / meta-analyses`);
  assert.ok((strong + reviews) / LIBRARY_DOCS.length >= 0.55, `only ${strong + reviews} reviews of any kind`);
  assert.ok(participatory >= 100, `only ${participatory} participatory documents`);
});

test("seed findings are present, trilingual and carry their limits", () => {
  const seeds = LIBRARY_DOCS.filter((d) => d.seed);
  assert.ok(seeds.length >= 18, `only ${seeds.length} seeds`);
  for (const d of seeds) {
    assert.ok(d.seed!.claim.es && d.seed!.claim.en && d.seed!.claim.sv);
    assert.ok(d.seed!.doesNotSupport.length > 10);
    assert.doesNotMatch(d.seed!.claim.en, /\b(cure|diagnos(e|is) (your|the) child)\b/i);
  }
});

test("search returns relevant documents, deterministically", () => {
  const a = searchLibrary("sensory overload noise hypersensitivity", 6);
  const b = searchLibrary("sensory overload noise hypersensitivity", 6);
  assert.ok(a.length >= 3);
  assert.deepEqual(a.map((h) => h.doc.id), b.map((h) => h.doc.id));
  assert.ok(a.some((h) => h.doc.topics.includes("sensory")));
  const sleep = searchLibrary("sleep insomnia bedtime", 6);
  assert.ok(sleep.some((h) => h.doc.topics.includes("sleep")));
  assert.deepEqual(searchLibrary("   "), []);
});
