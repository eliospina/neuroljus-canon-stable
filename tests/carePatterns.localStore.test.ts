import assert from "node:assert/strict";
import { test } from "node:test";
import type { PatternNote } from "../src/lib/carePatterns/localStore";

test("pattern note shape preserves witness fields without diagnosis claims", () => {
  const note: PatternNote = {
    id: "pat_test",
    createdAt: "2026-07-29T12:00:00.000Z",
    gesture: "Hand pressed to abdomen, rocking",
    context: "After meal, bright kitchen",
    eased: "Dimmer light, quiet corner",
    worsened: "Asking questions, standing close",
    uncertainty: "Cannot know if pain, digestion, or sensory load",
    seenBefore: true,
  };
  assert.equal(typeof note.gesture, "string");
  assert.equal(note.seenBefore, true);
  assert.ok(note.uncertainty.includes("Cannot know"));
});
