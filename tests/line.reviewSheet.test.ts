import assert from "node:assert/strict";
import { test } from "node:test";
import { reviewSheet } from "../scripts/line-eval";
import { MUST_ES } from "../scripts/line-eval/mustEs";
import { SCENARIOS } from "../scripts/line-eval/scenarios";

test("every scenario has its criteria in Spanish, one for one", () => {
  for (const s of SCENARIOS) {
    assert.ok(MUST_ES[s.id], `missing Spanish criteria for ${s.id}`);
    assert.equal(MUST_ES[s.id].length, s.must.length, `${s.id}: Spanish criteria count differs`);
  }
  const ids = new Set(SCENARIOS.map((s) => s.id));
  for (const id of Object.keys(MUST_ES)) assert.ok(ids.has(id), `Spanish criteria for unknown scenario ${id}`);
});

test("the review sheet shows the Spanish criteria, every turn, and the blanks", () => {
  const s = SCENARIOS[0];
  const sheet = reviewSheet(s, s.turns.map((_, i) => `respuesta ${i + 1}`), { score: 8, reasons: ["bien"] });
  for (const m of MUST_ES[s.id]) assert.ok(sheet.includes(m));
  for (const t of s.turns) assert.ok(sheet.includes(t));
  assert.ok(sheet.includes("Juez automático: 8/10"));
  assert.ok(sheet.includes("Tu nota (1 a 10)"));
});
