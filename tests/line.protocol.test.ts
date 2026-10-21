import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildLineProtocol, chooseProtocol } from "../src/lib/line/protocol";
import { PROTOCOLS, PHASE_IDS } from "../src/lib/protocols";

const docIds = new Set((JSON.parse(readFileSync(path.resolve("data/library/docs.json"), "utf8")) as Array<{ id: string }>).map((d) => d.id));

const CASES: Array<[string, string]> = [
  ["Se escapa a la calle cuando abro la puerta", "physical_danger"],
  ["He runs into the street and doesn't stop", "physical_danger"],
  ["Han springer ut mot gatan", "physical_danger"],
  ["Tira los platos y rompe cosas", "aggression_objects"],
  ["She throws toys and smashes things", "aggression_objects"],
  ["Me pega y me muerde cuando le digo que no", "aggression_people"],
  ["He hits me and pulls my hair", "aggression_people"],
  ["Se golpea la cabeza contra la pared", "self_injury"],
  ["He is head-banging again", "self_injury"],
  ["Hon slår sig själv", "self_injury"],
  ["Grita en el supermercado y se tapa los oídos", "overload_meltdown"],
  ["Efter skolan blev det ett utbrott med mycket ljud", "overload_meltdown"],
  ["Se queda congelado y no responde", "shutdown"],
  ["She went into shutdown and is unresponsive", "shutdown"],
  ["Se niega a vestirse para ir a la escuela", "transitions_refusal"],
  ["He refuses to turn off the tablet", "transitions_refusal"],
  ["No duerme y se despierta de madrugada", "sleep"],
  ["Han vaknar flera gånger på natten", "sleep"],
  ["Creo que le duele la barriga, se toca el estómago", "possible_pain"],
  ["She holds her ear and cries, maybe a tooth", "possible_pain"],
  ["Estoy agotada, no puedo más", "caregiver_exhausted"],
  ["I am exhausted, I can't take this anymore", "caregiver_exhausted"],
  ["Jag orkar inte mer, jag är utmattad", "caregiver_exhausted"],
];

test("each of the ten protocols is picked from everyday es/en/sv wording", () => {
  for (const [text, id] of CASES) assert.equal(chooseProtocol(text, false).id, id, text);
  assert.deepEqual(new Set(CASES.map(([, id]) => id)).size, 10);
});

test("with no keyword the broadest protocol is used and flagged as not matched; with risk, physical danger", () => {
  assert.deepEqual(chooseProtocol("no sé qué pasa", false), { id: "overload_meltdown", matched: false });
  assert.deepEqual(chooseProtocol("no sé qué pasa", true), { id: "physical_danger", matched: false });
});

test("the same input always gives the same output", () => {
  const input = { situation: "Grita y no se calma", lang: "es" as const, country: "ES", phase: "peak" as const };
  assert.deepEqual(buildLineProtocol(input), buildLineProtocol(input));
});

test("risk puts the country's emergency line first, before anything else", () => {
  const es = buildLineProtocol({ situation: "se golpea y sangra y no para", lang: "es", country: "CO" });
  assert.equal(es.risk, true);
  assert.ok(es.speech.startsWith("Si hay peligro, llama al 123."), es.speech);
  const en = buildLineProtocol({ situation: "he is bleeding and it won't stop", lang: "en", country: "GB" });
  assert.ok(en.speech.startsWith("If there is danger, call 999."), en.speech);
  const sv = buildLineProtocol({ situation: "hon blöder och det slutar inte", lang: "sv", country: "SE" });
  assert.ok(sv.speech.startsWith("Vid fara, ring 112."), sv.speech);
  const unknown = buildLineProtocol({ situation: "se golpea y sangra y no para", lang: "es", country: null });
  assert.ok(unknown.speech.startsWith("Si hay peligro, llama al número de emergencias de tu país."));
});

test("protocols 1 and 4 without a risk word still open with their safety sentence and the danger line; with risk it is said once", () => {
  const calm = buildLineProtocol({ situation: "se escapa a la calle", lang: "es", country: "ES" });
  assert.equal(calm.risk, false);
  assert.match(calm.speech, /llama al 112/);
  const risky = buildLineProtocol({ situation: "se escapa a la calle y sangra sin parar", lang: "es", country: "ES" });
  assert.equal(risky.speech.split("llama al 112").length - 1, 1, risky.speech);
});

test("every phase of every protocol is short spoken text without markdown or digits other than the number", () => {
  for (const p of PROTOCOLS) {
    for (const phase of PHASE_IDS) {
      for (const lang of ["es", "en", "sv"] as const) {
        const r = buildLineProtocol({ situation: "x", lang, country: "SE", protocolId: p.id, phase });
        assert.equal(r.protocol, p.id);
        assert.equal(r.phase, phase);
        assert.ok(r.speech.length > 40 && r.speech.length < 900, `${p.id}/${phase}/${lang}: ${r.speech.length}`);
        assert.doesNotMatch(r.speech, /[*#_`\[\]]|https?:/, `${p.id}/${phase}/${lang}`);
        assert.doesNotMatch(r.speech.replace(/\b112\b/g, ""), /\d/, `${p.id}/${phase}/${lang}`);
        assert.ok(r.evidence_ids.length >= 3 && r.evidence_ids.every((id) => docIds.has(id)), `${p.id} evidence ids exist in the library`);
      }
    }
  }
});

test("next_phase walks agitation → peak → descent → recovery → null", () => {
  const next = PHASE_IDS.map((phase) => buildLineProtocol({ situation: "grita", lang: "en", country: null, phase }).next_phase);
  assert.deepEqual(next, ["peak", "descent", "recovery", null]);
});

test("an unknown phase falls back to agitation", () => {
  assert.equal(buildLineProtocol({ situation: "grita", lang: "es", country: null, phase: "nope" as never }).phase, "agitation");
});

test("hitting oneself is self-injury, hitting someone else is aggression toward people", () => {
  for (const t of ["Mi hijo se pega en la cabeza con la mano", "Se pega en la cara cuando se frustra"]) assert.equal(chooseProtocol(t, false).id, "self_injury", t);
  for (const t of ["Me pega cuando le digo que no", "Le pega a su hermano", "Pega a la maestra"]) assert.equal(chooseProtocol(t, false).id, "aggression_people", t);
});
