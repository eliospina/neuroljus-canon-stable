import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCarePlan } from "../src/lib/careProtocol/planner";
import { scenarioPresets } from "../src/lib/careProtocol/scenarios";
import type { PlannerInput } from "../src/lib/careProtocol/types";
import { escalatedIntent, plannerInputFromIntent } from "../src/lib/careProtocol/intentParser";
import {
  applyProfile,
  defaultProfile,
  readProfile,
  sanitizeProfile,
  writeProfile,
  type SensoryProfile,
} from "../src/lib/companion/profile";

/** What Claude might propose: bright, close, card on, a thin exception list. */
function claudeProposal(): PlannerInput {
  const p = scenarioPresets.evening_transition;
  return {
    scenario: p.id,
    routineName: p.name,
    careGoal: p.careGoal,
    visualCard: p.visualCard,
    durationMinutes: 20,
    environment: { light: 70, sound: 40, distance: 0.8, pace: "slow" },
    allowedCommands: ["lower_light", "reduce_sound", "offer_visual_card", "notify_caregiver", "log_observation"],
    safetyExceptions: ["timeout"],
    visionContext: null,
  };
}

function profile(over: Partial<SensoryProfile> = {}): SensoryProfile {
  return { ...defaultProfile(), name: "Leo", ...over };
}

test("no profile: the plan passes through unchanged", () => {
  const input = claudeProposal();
  const fused = applyProfile(input, null);
  assert.deepEqual(fused.input, input);
  assert.deepEqual(fused.constraints, []);
  assert.equal(fused.phone.noise, true);
});

test("the profile wins over Claude: light capped, distance raised, cards removed, noise off", () => {
  const fused = applyProfile(
    claudeProposal(),
    profile({ light: "very_soft", space: "more_space", visualCards: false, calmingSound: "silence" })
  );
  assert.equal(fused.input.environment.light, 20);
  assert.equal(fused.input.environment.distance, 2);
  assert.ok(!fused.input.allowedCommands.includes("offer_visual_card"));
  assert.equal(fused.phone.noise, false);
  const kinds = fused.constraints.map((c) => c.kind);
  for (const k of ["light_capped", "more_space", "no_cards", "no_noise", "no_voice"]) assert.ok(kinds.includes(k as never), k);

  const plan = buildCarePlan(fused.input);
  assert.ok(plan.steps.every((s) => s.command !== "offer_visual_card"));
  assert.equal(plan.protocol.environment.light, 20);
  assert.equal(plan.validation.valid, true);
});

test("the profile never raises stimulation and never removes notice, record or safety", () => {
  const input = { ...claudeProposal(), environment: { light: 10, sound: 5, distance: 3, pace: "slow" as const } };
  const fused = applyProfile(input, profile({ light: "normal", space: "close_ok" }));
  assert.equal(fused.input.environment.light, 10);
  assert.equal(fused.input.environment.distance, 3);
  assert.equal(fused.input.environment.sound, 5);
  assert.ok(fused.input.allowedCommands.includes("notify_caregiver"));
  assert.ok(fused.input.allowedCommands.includes("log_observation"));
  for (const e of input.safetyExceptions) assert.ok(fused.input.safetyExceptions.includes(e));
  assert.ok(fused.input.safetyExceptions.includes("rejection_signal"), "the person's no stops the routine");
  assert.ok(fused.input.safetyExceptions.includes("caregiver_pause"));
  for (const c of fused.input.allowedCommands) assert.ok(input.allowedCommands.includes(c), `added ${c}`);
});

test("a hum-sensitive profile turns brown noise off; other sounds are listed to avoid", () => {
  const fused = applyProfile(claudeProposal(), profile({ botheringSounds: ["hum", "voices"] }));
  assert.equal(fused.phone.noise, false);
  assert.deepEqual(fused.constraints.find((c) => c.kind === "avoid_sounds"), { kind: "avoid_sounds", sounds: ["voices"] });
});

test("escalated plans stay notify + log only under any profile", () => {
  const input = plannerInputFromIntent(escalatedIntent("sensory_overload", "es"), null);
  const fused = applyProfile(input, profile({ visualCards: false, light: "very_soft" }));
  assert.deepEqual(fused.input.allowedCommands, ["notify_caregiver", "log_observation"]);
});

test("fusion is deterministic", () => {
  const p = profile({ light: "soft", calmItem: "headphones" });
  assert.deepEqual(applyProfile(claudeProposal(), p), applyProfile(claudeProposal(), p));
});

test("imported profiles are validated: unknown values fall back, junk is rejected", () => {
  assert.equal(sanitizeProfile("nope"), null);
  assert.equal(sanitizeProfile([1, 2]), null);
  const s = sanitizeProfile({
    name: "  Leo\u0007 ",
    light: "laser",
    botheringSounds: ["voices", "explosions"],
    calmItem: "dragon",
    visualCards: "yes",
  })!;
  assert.equal(s.name, "Leo");
  assert.equal(s.light, defaultProfile().light);
  assert.deepEqual(s.botheringSounds, ["voices"]);
  assert.equal(s.calmItem, "headphones");
  assert.equal(s.visualCards, true);
});

test("profile round-trips through storage", () => {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  };
  assert.equal(readProfile(storage), null);
  const p = profile({ calmItem: "blanket", botheringSounds: ["music"] });
  writeProfile(storage, p);
  assert.deepEqual(readProfile(storage), p);
});
