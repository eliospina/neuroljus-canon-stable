import assert from "node:assert/strict";
import { test } from "node:test";
import { allIdeaStats, deleteIdea, ideaStats, MIN_RATED_RUNS, readIdeas, saveIdea } from "../src/lib/ask/ideas";
import { addRun, readRuns } from "../src/lib/companion/runLog";
import { setRunOutcome } from "../src/lib/companion/outcomes";
import { segmentsToText } from "../src/lib/ask/expert";

function memoryStorage() {
  const mem = new Map<string, string>();
  return { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
}

test("ideas are saved locally, deduplicated and deletable", () => {
  const storage = memoryStorage();
  const a = saveIdea(storage, "  Try a short visit   to the dentist chair only. ", "es");
  const b = saveIdea(storage, "Try a short visit to the dentist chair only.", "es");
  assert.equal(a.id, b.id, "same text → same idea");
  assert.equal(readIdeas(storage).length, 1);
  deleteIdea(storage, a.id);
  assert.equal(readIdeas(storage).length, 0);
});

test("an idea becomes data about this person only after enough rated runs, counted by code", () => {
  const storage = memoryStorage();
  const idea = saveIdea(storage, "Play the drill sound softly at home first.", "en");
  const run = (outcome?: "helped" | "no_change" | "worse") => {
    const r = addRun(storage, { scenario: "sensory_overload", commands: ["reduce_sound"], ended: "completed", ideaId: idea.id });
    if (outcome) setRunOutcome(storage, r.id, outcome);
  };
  assert.equal(ideaStats(idea, readRuns(storage)).status, "untested");
  run("helped");
  assert.equal(ideaStats(idea, readRuns(storage)).status, "testing");
  run("helped");
  run("no_change");
  const s = ideaStats(idea, readRuns(storage));
  assert.equal(s.rated, MIN_RATED_RUNS);
  assert.equal(s.status, "person_data");
  assert.deepEqual([s.helped, s.noChange, s.worse], [2, 1, 0]);
  // runs without the idea's id never count
  const other = addRun(storage, { scenario: "sensory_overload", commands: ["reduce_sound"], ended: "completed" });
  setRunOutcome(storage, other.id, "worse");
  assert.equal(ideaStats(idea, readRuns(storage)).worse, 0);
  assert.equal(allIdeaStats(storage, readRuns(storage))[0].status, "person_data");
});

test("an idea that keeps worsening things is marked as not helping", () => {
  const storage = memoryStorage();
  const idea = saveIdea(storage, "Louder music during meals.", "sv");
  for (const o of ["worse", "worse", "helped"] as const) {
    const r = addRun(storage, { scenario: "meal_support", commands: ["offer_visual_card"], ended: "completed", ideaId: idea.id });
    setRunOutcome(storage, r.id, o);
  }
  assert.equal(ideaStats(idea, readRuns(storage)).status, "not_helping");
});

test("labelled segments flatten to plain text with [n] markers for text-only clients", () => {
  const text = segmentsToText([
    { label: "practice", text: "Dim the lights.", sources: [] },
    { label: "science", text: "Sleep problems are common.", sources: [2, 5] },
  ]);
  assert.equal(text, "Dim the lights.\n\nSleep problems are common. [2][5]");
});
