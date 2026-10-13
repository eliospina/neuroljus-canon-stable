import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCarePlan } from "../src/lib/careProtocol/planner";
import { scenarioPresets } from "../src/lib/careProtocol/scenarios";
import type { Command, PlannerInput } from "../src/lib/careProtocol/types";
import {
  MAX_NOISE_GAIN,
  MAX_SCREEN_DIM,
  noiseGainForSound,
  phoneMapping,
  phoneStateAt,
  screenDimForLight,
  totalMinutes,
} from "../src/lib/companion/phoneBody";

function overloadPlan() {
  const p = scenarioPresets.sensory_overload;
  const input: PlannerInput = {
    scenario: p.id,
    routineName: p.name,
    careGoal: p.careGoal,
    visualCard: p.visualCard,
    durationMinutes: p.duration,
    environment: { ...p.environment },
    allowedCommands: [...p.commands],
    safetyExceptions: [...p.exceptions],
    visionContext: null,
  };
  return { input, plan: buildCarePlan(input) };
}

test("every protocol command maps to a phone action; only step_back is left to the caregiver", () => {
  const all: Command[] = [
    "lower_light",
    "reduce_sound",
    "step_back",
    "pause_interaction",
    "offer_visual_card",
    "notify_caregiver",
    "log_observation",
  ];
  for (const command of all) assert.ok(phoneMapping[command], command);
  assert.deepEqual(
    all.filter((c) => !phoneMapping[c].onPhone),
    ["step_back"]
  );
  assert.equal(phoneMapping.lower_light.action, "dim_screen");
  assert.equal(phoneMapping.reduce_sound.action, "brown_noise");
});

test("screen never goes black and noise never gets loud", () => {
  assert.equal(screenDimForLight(0), MAX_SCREEN_DIM);
  assert.ok(MAX_SCREEN_DIM < 1);
  assert.equal(screenDimForLight(100), 0);
  assert.ok(screenDimForLight(-50) <= MAX_SCREEN_DIM);
  assert.ok(noiseGainForSound(100) <= MAX_NOISE_GAIN);
  assert.ok(noiseGainForSound(500) <= MAX_NOISE_GAIN);
  assert.ok(noiseGainForSound(10) < noiseGainForSound(60), "quieter target → softer noise");
});

test("phone state is deterministic and dims progressively", () => {
  const { input, plan } = overloadPlan();
  const lower = plan.steps.find((s) => s.command === "lower_light")!;
  const at = (m: number) => phoneStateAt(plan.steps, input.environment, m);

  assert.deepEqual(at(3.3), at(3.3));
  assert.equal(at(0).dim, 0);
  const mid = at(lower.offsetMinutes + lower.durationMinutes / 2).dim;
  const end = at(lower.offsetMinutes + lower.durationMinutes).dim;
  assert.ok(mid > 0 && mid < end, `mid ${mid} < end ${end}`);
  assert.equal(end, screenDimForLight(input.environment.light));
});

test("step_back becomes a caregiver hint, card and notice appear, sound fades out at the end", () => {
  const { input, plan } = overloadPlan();
  const total = totalMinutes(plan.steps);
  const back = plan.steps.find((s) => s.command === "step_back")!;

  assert.deepEqual(phoneStateAt(plan.steps, input.environment, back.offsetMinutes + 0.1).caregiverHints, ["step_back"]);
  const sound = plan.steps.find((s) => s.command === "reduce_sound")!;
  assert.ok(phoneStateAt(plan.steps, input.environment, sound.offsetMinutes + 1).noiseGain > 0);

  const done = phoneStateAt(plan.steps, input.environment, total);
  assert.equal(done.done, true);
  assert.equal(done.card, true);
  assert.equal(done.notified, true);
  assert.equal(done.logged, true);
  assert.equal(done.noiseGain, 0);
  assert.equal(done.activeStep, plan.steps.length);
});

test("noise stays off when the options rule it out", () => {
  const { input, plan } = overloadPlan();
  const sound = plan.steps.find((s) => s.command === "reduce_sound")!;
  const s = phoneStateAt(plan.steps, input.environment, sound.offsetMinutes + 1, { noise: false });
  assert.equal(s.noiseGain, 0);
});
