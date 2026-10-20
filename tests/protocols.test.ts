import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { PROTOCOLS, PROTOCOL_IDS, PHASE_IDS, FUNCTIONS, getProtocol, newAbcRecord, newCaregiverLogRecord, renderProtocol, type CrisisProtocol, type Tri } from "../src/lib/protocols";
import { emergencyNumber } from "../src/lib/emergency";

const LANGS = ["es", "en", "sv"] as const;
const docs = new Map((JSON.parse(readFileSync(path.resolve("data/library/docs.json"), "utf8")) as Array<{ id: string; kind: string }>).map((d) => [d.id, d]));

/** Every Tri in a protocol, with where it sits, so each rule can be checked on all of them. */
function texts(p: CrisisProtocol): Array<{ where: string; value: Tri; kind: "step" | "say" | "never" | "other" }> {
  const out: Array<{ where: string; value: Tri; kind: "step" | "say" | "never" | "other" }> = [];
  const add = (where: string, value: Tri, kind: "step" | "say" | "never" | "other" = "other") => out.push({ where: `${p.id}.${where}`, value, kind });
  add("title", p.title);
  p.recognize.forEach((q, i) => add(`recognize[${i}]`, q));
  if (p.opening) add("opening", p.opening);
  for (const ph of PHASE_IDS) {
    add(`${ph}.goal`, p.phases[ph].goal);
    p.phases[ph].steps.forEach((s, i) => add(`${ph}.steps[${i}]`, s, "step"));
    p.phases[ph].say.forEach((s, i) => add(`${ph}.say[${i}]`, s, "say"));
  }
  p.never.forEach((n, i) => add(`never[${i}]`, n, "never"));
  p.escalate.callWhen.forEach((c, i) => add(`callWhen[${i}]`, c));
  p.escalate.contactWhen.forEach((c, i) => add(`contactWhen[${i}]`, c));
  if (p.log.kind === "abc") {
    add("log.antecedent", p.log.antecedent);
    add("log.behavior", p.log.behavior);
    add("log.consequence", p.log.consequence);
    p.log.hypotheses.forEach((h, i) => add(`log.hypotheses[${i}]`, h.check));
  } else {
    add("log.exhausted", p.log.exhausted);
    add("log.signs", p.log.signs);
    add("log.helped", p.log.helped);
  }
  add("log.note", p.log.note);
  p.evidence.forEach((e, i) => add(`evidence[${i}]`, e.supports));
  add("evidenceNote", p.evidenceNote);
  return out;
}

test("the registry holds the ten protocols of the line, in order, without repeats", () => {
  const ids = PROTOCOLS.map((p) => p.id);
  assert.deepEqual(ids, [...PROTOCOL_IDS], "all ten, in line order");
  for (const p of PROTOCOLS) {
    assert.ok(PROTOCOL_IDS.includes(p.id), p.id);
    assert.equal(p.number, PROTOCOL_IDS.indexOf(p.id) + 1, `${p.id} keeps its number in the line`);
  }
  assert.deepEqual(PROTOCOLS.map((p) => p.number), [...PROTOCOLS.map((p) => p.number)].sort((a, b) => a - b));
  assert.equal(getProtocol("aggression_people")?.number, 3);
});

test("every protocol is complete in es, en and sv", () => {
  for (const p of PROTOCOLS) {
    for (const { where, value } of texts(p)) for (const l of LANGS) assert.ok(value[l]?.trim().length > 0, `${where} [${l}]`);
    assert.ok(p.recognize.length >= 1 && p.recognize.length <= 2, `${p.id} has one or two recognition questions`);
    for (const ph of PHASE_IDS) {
      assert.ok(p.phases[ph].steps.length >= 1, `${p.id}.${ph} has steps`);
      assert.ok(p.phases[ph].say.length >= 1, `${p.id}.${ph} has phrases to say`);
    }
    assert.ok(p.never.length >= 3, `${p.id} lists what never to do`);
    assert.ok(p.escalate.callWhen.length >= 1 && p.escalate.contactWhen.length >= 1, `${p.id} says when to escalate`);
  }
});

test("Spanish is neutral Latin American: no peninsular forms", () => {
  // vosotros/os, -áis/-éis endings, plural imperatives in -ad/-ed/-id, Spain-only vocabulary and the
  // interjection "vale". Word edges are Unicode lookarounds: JavaScript's \b treats "ñ" as a boundary.
  const L = "[\\p{L}\\p{N}]";
  const peninsular = new RegExp(
    `(?<!${L})(vosotr[oa]s|os|coger|cog(e|é|ed|ió|en|erlo|erla)|ordenador|móvil|coche|piso|tenéis|habéis|sois|estáis|pod[ée]is|quer[ée]is|buscad|llamad|pensad|mirad|hablad|poned|haced|salid|venid)(?!${L})` +
      `|\\p{L}+(áis|éis)(?!${L})|(?<!${L})vale\\s*[,.!?]`,
    "iu"
  );
  for (const p of PROTOCOLS) for (const { where, value } of texts(p)) {
    const m = value.es.match(peninsular);
    assert.equal(m, null, `${where} [es] uses a peninsular form: "${m?.[0]}" in "${value.es}"`);
  }
});

test("phrases to say aloud are short", () => {
  for (const p of PROTOCOLS) {
    for (const { where, value, kind } of texts(p)) {
      if (kind !== "say") continue;
      for (const l of LANGS) assert.ok(value[l].trim().split(/\s+/).length <= 6, `${where} [${l}] is a few words`);
    }
  }
});

test("no digits, no medication, no restraint or punishment advice in the steps", () => {
  const medication = {
    es: /(medicaci|medicament|f[aá]rmaco|pastilla|dosis|melaton|risperid|aripipra|\bmg\b)/i,
    en: /(medicat|medicine|\bdrugs?\b|\bpills?\b|\bdoses?\b|melaton|risperid|aripipra|\bmg\b)/i,
    sv: /(läkemedel|medicin|tablett|\bdos\b|doser|melaton|risperid|aripipra|\bmg\b)/i,
  };
  const restraintAdvice = {
    es: /(sujet|inmoviliz|encierr|castig|grit(a|es|ar)\b)/i,
    en: /(restrain|pin (him|her|them|the)|lock (him|her|them|the)|punish|shout)/i,
    sv: /(fasthåll|hålla fast|stäng(a|er) in|straff|skrik)/i,
  };
  for (const p of PROTOCOLS) {
    for (const { where, value, kind } of texts(p)) {
      for (const l of LANGS) {
        assert.ok(!/\d/.test(value[l]), `${where} [${l}] has no digits: "${value[l]}"`);
        assert.ok(!medication[l].test(value[l]), `${where} [${l}] has no medication wording`);
        if (kind === "step" || kind === "say") assert.ok(!restraintAdvice[l].test(value[l]), `${where} [${l}] does not advise restraint or punishment: "${value[l]}"`);
      }
    }
  }
});

test("never lists cover punishment, locking in and restraint", () => {
  const needs = {
    es: [/castig/i, /encerr/i, /sujet/i],
    en: [/punish/i, /lock/i, /restrain/i],
    sv: [/straff/i, /stäng/i, /hålla fast/i],
  };
  for (const p of PROTOCOLS) for (const l of LANGS) {
    const all = p.never.map((n) => n[l]).join(" | ");
    needs[l].forEach((re) => assert.ok(re.test(all), `${p.id} [${l}] never-list misses ${re}`));
  }
});

test("ABC logs use only the four allowed functions, framed as hypotheses; the caregiver's log has neither", () => {
  for (const p of PROTOCOLS) {
    if (p.id === "caregiver_exhausted") {
      assert.equal(p.log.kind, "caregiver", "the caregiver protocol keeps a simple log");
      for (const l of LANGS) assert.ok(!/hip[oó]tesis|hypothes|hypotes|funci[oó]n|function|funktion/i.test(Object.values(p.log).filter((v): v is Tri => typeof v === "object").map((v) => v[l]).join(" ")), `${l}: no functions or hypotheses in the caregiver log`);
      continue;
    }
    assert.equal(p.log.kind, "abc", `${p.id} keeps an ABC log`);
    assert.ok(p.log.hypotheses.length >= 2, `${p.id} offers at least two functions to check`);
    for (const h of p.log.hypotheses) assert.ok(FUNCTIONS.includes(h.fn), `${p.id} ${h.fn}`);
    assert.equal(new Set(p.log.hypotheses.map((h) => h.fn)).size, p.log.hypotheses.length, `${p.id} repeats a function`);
    assert.match(p.log.note.es, /hip[oó]tesis/i);
    assert.match(p.log.note.en, /hypothes/i);
    assert.match(p.log.note.sv, /hypotes/i);
  }
});

test("evidence: 3 to 6 documents, every id exists in docs.json with the stated level", () => {
  for (const p of PROTOCOLS) {
    assert.ok(p.evidence.length >= 3 && p.evidence.length <= 6, `${p.id} has ${p.evidence.length} documents`);
    assert.equal(new Set(p.evidence.map((e) => e.id)).size, p.evidence.length, `${p.id} repeats a document`);
    for (const e of p.evidence) {
      const doc = docs.get(e.id);
      assert.ok(doc, `${p.id}: ${e.id} is not in docs.json`);
      assert.equal(doc!.kind, e.level, `${p.id}: ${e.id} is a ${doc!.kind}, not ${e.level}`);
    }
  }
});

test("protocols 1 and 4 start with safety and the emergency line; the others do not claim to", () => {
  for (const p of PROTOCOLS) {
    const first = renderProtocol(p, "es", "SE");
    if (p.id === "physical_danger" || p.id === "self_injury") {
      assert.equal(p.safetyFirst, true);
      assert.ok(p.opening, `${p.id} has an opening`);
      for (const l of LANGS) {
        const first = renderProtocol(p, l, "SE").emergencyFirst ?? "";
        assert.match(first, /112/, `${p.id} [${l}] opens with the number`);
        assert.doesNotMatch(first, /necesita a una persona|needs a person|behöver en människa/, `${p.id} [${l}] opens without the Ask preface`);
      }
    } else {
      assert.equal(p.safetyFirst, false);
      assert.equal(first.emergencyFirst, null);
    }
  }
});

test("the emergency number comes from emergency.ts, for any country", () => {
  const p = getProtocol("aggression_people")!;
  for (const country of ["SE", "ES", "US", "CO", "BR", "CL", "PE", "GB"]) {
    const r = renderProtocol(p, "en", country);
    assert.equal(r.escalate.number, emergencyNumber(country));
    assert.ok(r.escalate.callLine.includes(emergencyNumber(country)!), `${country}: ${r.escalate.callLine}`);
  }
  const unknown = renderProtocol(p, "es", null);
  assert.equal(unknown.escalate.number, null);
  assert.match(unknown.escalate.callLine, /número de emergencias de tu país/);
  assert.doesNotMatch(unknown.escalate.callLine, /necesita a una persona/);
  assert.equal(renderProtocol(p, "sv", "SE").escalate.callLine, "Vid fara, ring 112.");
  // No number is ever written into the protocol itself.
  for (const { where, value } of texts(p)) for (const l of LANGS) assert.ok(!/\b(112|911|123|999|192|131|106)\b/.test(value[l]), where);
});

test("rendering is deterministic and covers the four phases in order", () => {
  const p = getProtocol("aggression_people")!;
  assert.deepEqual(renderProtocol(p, "sv", "SE"), renderProtocol(p, "sv", "SE"));
  assert.deepEqual(renderProtocol(p, "en", "US").phases.map((x) => x.id), ["agitation", "peak", "descent", "recovery"]);
  const r = renderProtocol(p, "es", "BR");
  assert.equal(r.title, "Agresión contra personas");
  assert.equal(r.log.kind === "abc" ? r.log.hypotheses.map((h) => h.fn).join() : "", "escape,request,sensory,pain");
  const c = renderProtocol(getProtocol("caregiver_exhausted")!, "es", "CO");
  assert.equal(c.log.kind, "caregiver");
  assert.match(c.log.kind === "caregiver" ? c.log.exhausted : "", /agotó/);
});

test("a blank ABC record holds no case data", () => {
  const rec = newAbcRecord("aggression_people", "2026-01-01T00:00:00.000Z");
  assert.deepEqual(rec, { protocolId: "aggression_people", recordedAt: "2026-01-01T00:00:00.000Z", antecedent: "", behavior: "", consequence: "", hypotheses: [] });
  assert.deepEqual(newCaregiverLogRecord("caregiver_exhausted", "2026-01-01T00:00:00.000Z"), { protocolId: "caregiver_exhausted", recordedAt: "2026-01-01T00:00:00.000Z", exhausted: "", signs: "", helped: "" });
});
