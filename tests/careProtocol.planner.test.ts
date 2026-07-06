import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCarePlan } from "../src/lib/careProtocol/planner";
import type { PlannerInput, VisionSnapshot } from "../src/lib/careProtocol/types";

function baseInput(overrides: Partial<PlannerInput> = {}): PlannerInput {
  return {
    scenario: "evening_transition",
    routineName: "Evening transition",
    careGoal: "Move from activity to rest with a predictable, low-stimulus routine.",
    visualCard: "Now: quiet room. Next: sleep routine.",
    durationMinutes: 20,
    environment: { light: 35, sound: 25, distance: 1.5, pace: "slow" },
    allowedCommands: [
      "lower_light",
      "reduce_sound",
      "step_back",
      "pause_interaction",
      "offer_visual_card",
      "notify_caregiver",
      "log_observation",
    ],
    safetyExceptions: ["rejection_signal", "caregiver_pause", "timeout", "unknown_event"],
    visionContext: null,
    ...overrides,
  };
}

const calmVision: VisionSnapshot = {
  faceDetected: true,
  handsAvg: 1,
  handNearPct: 0.05,
  movement: 0.004,
  blinksPerMin: 14,
};

const elevatedVision: VisionSnapshot = {
  faceDetected: true,
  handsAvg: 2,
  handNearPct: 0.6,
  movement: 0.05,
  blinksPerMin: 30,
};

test("planner is deterministic for the same input", () => {
  const first = buildCarePlan(baseInput());
  const second = buildCarePlan(baseInput());
  assert.deepEqual(first, second);
});

test("plan uses the canonical care order without elevated vision context", () => {
  const plan = buildCarePlan(baseInput({ visionContext: calmVision }));
  assert.deepEqual(
    plan.steps.map((step) => step.command),
    [
      "reduce_sound",
      "lower_light",
      "step_back",
      "pause_interaction",
      "offer_visual_card",
      "notify_caregiver",
      "log_observation",
    ]
  );
});

test("elevated vision context moves space and pause first and adds a warning", () => {
  const plan = buildCarePlan(baseInput({ visionContext: elevatedVision }));
  assert.deepEqual(plan.steps.slice(0, 2).map((step) => step.command), [
    "step_back",
    "pause_interaction",
  ]);
  assert.ok(
    plan.attentionFlags.some(
      (flag) => flag.severity === "warning" && flag.message.includes("NL-VISION")
    )
  );
});

test("step durations fill the routine duration", () => {
  const plan = buildCarePlan(baseInput());
  const total = plan.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
  assert.ok(Math.abs(total - 20) < 0.5, `expected ~20 minutes, got ${total}`);
  const lastStep = plan.steps[plan.steps.length - 1];
  assert.ok(lastStep.offsetMinutes < 20);
});

test("validation flags empty commands, empty exceptions, and bad duration", () => {
  const plan = buildCarePlan(
    baseInput({ allowedCommands: [], safetyExceptions: [], durationMinutes: 0 })
  );
  assert.equal(plan.validation.valid, false);
  assert.equal(plan.validation.issues.length >= 3, true);
  assert.equal(plan.steps.length, 0);
});

test("missing rejection signal exception raises a warning flag", () => {
  const plan = buildCarePlan(baseInput({ safetyExceptions: ["timeout"] }));
  assert.ok(
    plan.attentionFlags.some(
      (flag) => flag.severity === "warning" && flag.message.includes("Rejection signal")
    )
  );
});

test("valid baseline configuration passes validation", () => {
  const plan = buildCarePlan(baseInput());
  assert.equal(plan.validation.valid, true);
  assert.deepEqual(plan.validation.issues, []);
});

test("adapter packets exist for all four targets with correct routes", () => {
  const plan = buildCarePlan(baseInput());
  assert.deepEqual(Object.keys(plan.adapterPackets).sort(), ["http", "mqtt", "offline", "ros2"]);
  assert.equal(plan.adapterPackets.ros2.route, "/neuroljus/care_command");
  assert.equal(plan.adapterPackets.mqtt.route, "neuroljus/care/command");
  assert.equal(plan.adapterPackets.http.route, "POST http://localhost:8787/care-command");
  assert.equal(plan.adapterPackets.offline.route, "offline-json-playbook");
  for (const packet of Object.values(plan.adapterPackets)) {
    assert.equal(packet.envelope, "neuroljus.care_command.v0");
    assert.equal(packet.audit_required, true);
    assert.equal(packet.planned_sequence.length, plan.steps.length);
  }
});

test("protocol document preserves caregiver-authored settings", () => {
  const input = baseInput();
  const plan = buildCarePlan(input);
  assert.equal(plan.protocol.contract, "care_command_protocol_v0");
  assert.equal(plan.protocol.care_goal, input.careGoal);
  assert.deepEqual(plan.protocol.environment, input.environment);
  assert.deepEqual(plan.protocol.allowed_commands, input.allowedCommands);
  assert.deepEqual(plan.protocol.safety_exceptions, input.safetyExceptions);
  assert.equal(plan.protocol.audit_policy.local_only, true);
});

test("explanation and reflection questions are present and human-readable", () => {
  const plan = buildCarePlan(baseInput({ visionContext: calmVision }));
  assert.ok(plan.explanation.length >= 4);
  assert.ok(plan.explanation[0].includes("Evening transition"));
  assert.ok(plan.reflectionQuestions.length >= 4);
});
