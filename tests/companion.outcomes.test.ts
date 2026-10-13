import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildIntentUserMessage,
  parseCareIntent,
  sanitizeHelpfulRoutines,
} from "../src/lib/careProtocol/intentParser";
import { helpfulSummary, rankRoutines, setRunOutcome } from "../src/lib/companion/outcomes";
import { addRun, readRuns, type CompanionRun } from "../src/lib/companion/runLog";

function memoryStorage() {
  const mem = new Map<string, string>();
  return {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
  };
}

const OVERLOAD = ["reduce_sound", "lower_light", "step_back", "notify_caregiver", "log_observation"] as const;
const EVENING = ["lower_light", "offer_visual_card", "notify_caregiver", "log_observation"] as const;

function run(scenario: CompanionRun["scenario"], commands: readonly string[], outcome?: CompanionRun["outcome"]): CompanionRun {
  return {
    id: Math.random().toString(36),
    at: "2026-10-13T10:00:00.000Z",
    scenario,
    commands: [...commands] as CompanionRun["commands"],
    ended: "completed",
    outcome,
  };
}

test("one-tap outcome is stored on the logged run, locally", () => {
  const storage = memoryStorage();
  const entry = addRun(storage, { scenario: "sensory_overload", commands: [...OVERLOAD], ended: "completed" });
  assert.equal(setRunOutcome(storage, entry.id, "helped")?.outcome, "helped");
  assert.equal(readRuns(storage)[0].outcome, "helped");
  assert.equal(setRunOutcome(storage, "missing", "worse"), null);
});

test("routines are ranked deterministically: most helped, least worsened; unrated runs ignored", () => {
  const runs = [
    run("evening_transition", EVENING, "helped"),
    run("sensory_overload", OVERLOAD, "helped"),
    run("sensory_overload", [...OVERLOAD].reverse(), "helped"), // same routine, other order
    run("sensory_overload", OVERLOAD, "worse"),
    run("meal_support", ["offer_visual_card", "notify_caregiver"], "worse"),
    run("leaving_home", ["offer_visual_card"]),
  ];
  const ranked = rankRoutines(runs);
  assert.equal(ranked.length, 3);
  assert.equal(ranked[0].scenario, "sensory_overload");
  assert.deepEqual([ranked[0].helped, ranked[0].worse, ranked[0].rated], [2, 1, 3]);
  assert.equal(ranked[2].scenario, "meal_support");
  assert.deepEqual(rankRoutines(runs), rankRoutines([...runs]));
});

test("the summary for the parser is anonymous: top 3 that helped, enums and counts only", () => {
  const runs = [
    run("sensory_overload", OVERLOAD, "helped"),
    run("evening_transition", EVENING, "helped"),
    run("school_arrival", ["offer_visual_card", "step_back"], "helped"),
    run("leaving_home", ["offer_visual_card", "pause_interaction"], "helped"),
    run("meal_support", ["offer_visual_card"], "worse"),
  ];
  const summary = helpfulSummary(runs);
  assert.equal(summary.length, 3);
  assert.ok(summary.every((s) => s.helped > 0));
  assert.ok(!summary.some((s) => s.scenario === "meal_support"));
  for (const s of summary) assert.deepEqual(Object.keys(s).sort(), ["commands", "helped", "rated", "scenario"]);
});

test("the server drops anything in the summary that is not an enum or a count", () => {
  const clean = sanitizeHelpfulRoutines([
    { scenario: "sensory_overload", commands: ["reduce_sound", "say hello to Leo"], helped: 2, rated: 3, name: "Leo" },
    { scenario: "unknown", commands: ["reduce_sound"], helped: 1, rated: 1 },
    { scenario: "meal_support", commands: [], helped: 1, rated: 1 },
    { scenario: "evening_transition", commands: ["lower_light"], helped: 5, rated: 2 },
    "Leo had a bad day",
    { scenario: "school_arrival", commands: ["step_back"], helped: 1, rated: 1 },
    { scenario: "leaving_home", commands: ["step_back"], helped: 1, rated: 1 },
    { scenario: "possible_discomfort", commands: ["step_back"], helped: 1, rated: 1 },
  ]);
  assert.deepEqual(clean, [
    { scenario: "sensory_overload", commands: ["reduce_sound"], helped: 2, rated: 3 },
    { scenario: "school_arrival", commands: ["step_back"], helped: 1, rated: 1 },
    { scenario: "leaving_home", commands: ["step_back"], helped: 1, rated: 1 },
  ]);
  assert.deepEqual(sanitizeHelpfulRoutines("nope"), []);
});

test("Claude receives the history summary next to the description, and nothing else", async () => {
  const calls: any[] = [];
  const fetchImpl = (async (_url: any, init: any) => {
    calls.push(JSON.parse(init.body));
    return new Response(
      JSON.stringify({
        stop_reason: "end_turn",
        content: [
          {
            type: "text",
            text: JSON.stringify({
              scenario: "sensory_overload",
              escalate: false,
              confidence: "high",
              interpretation: "Sobrecarga en la cocina.",
              environment: { light: 22, sound: 12, distance: 2.4, pace: "slow" },
              allowed_commands: ["reduce_sound", "step_back", "notify_caregiver", "log_observation"],
              safety_exceptions: ["rejection_signal"],
              duration_minutes: 12,
            }),
          },
        ],
      }),
      { status: 200 }
    );
  }) as typeof fetch;

  const history = [{ scenario: "sensory_overload" as const, commands: ["reduce_sound" as const], helped: 3, rated: 4 }];
  const result = await parseCareIntent({ text: "Hay mucho ruido en la cocina.", lang: "es", apiKey: "k", fetchImpl, history });
  assert.equal(result.source, "claude");
  const content: string = calls[0].messages[0].content;
  assert.equal(content, buildIntentUserMessage("Hay mucho ruido en la cocina.", history));
  assert.match(content, /sensory_overload with \[reduce_sound\]: helped 3 of 4/);

  assert.equal(buildIntentUserMessage("x"), "Caregiver description:\nx");
});
