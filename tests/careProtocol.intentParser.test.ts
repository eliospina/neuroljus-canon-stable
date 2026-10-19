import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ESCALATION_COMMANDS,
  escalationMessages,
  fallbackIntent,
  localRiskScreen,
  parseCareIntent,
  plannerInputFromIntent,
  sanitizeIntent,
} from "../src/lib/careProtocol/intentParser";
import { buildCarePlan } from "../src/lib/careProtocol/planner";
import { scenarioPresets } from "../src/lib/careProtocol/scenarios";

const KITCHEN_ES = "Leo se tapa los oídos, hay mucha gente en la cocina y la radio está alta.";

function claudeReply(json: unknown, extra: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({
      stop_reason: "end_turn",
      content: [{ type: "text", text: JSON.stringify(json) }],
      ...extra,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function mockFetch(handler: (body: any) => Response | Promise<Response>) {
  const calls: any[] = [];
  const impl = (async (_url: any, init: any) => {
    const body = JSON.parse(init.body);
    calls.push(body);
    return handler(body);
  }) as typeof fetch;
  return { impl, calls };
}

test("sanitizeIntent keeps valid values and clamps or drops invalid ones", () => {
  const intent = sanitizeIntent(
    {
      scenario: "sensory_overload",
      escalate: false,
      confidence: "high",
      interpretation: "Sobrecarga sensorial en la cocina.",
      environment: { light: 140, sound: -5, distance: "9", pace: "frantic" },
      allowed_commands: ["reduce_sound", "step_back", "teleport", "reduce_sound"],
      safety_exceptions: ["rejection_signal", "unplug_everything"],
      duration_minutes: 400,
    },
    KITCHEN_ES,
    "es"
  );
  assert.equal(intent.scenario, "sensory_overload");
  assert.equal(intent.escalate, false);
  assert.equal(intent.confidence, "high");
  assert.deepEqual(intent.environment, { light: 100, sound: 0, distance: 4, pace: "slow" });
  assert.deepEqual(intent.allowedCommands, ["reduce_sound", "step_back", "notify_caregiver", "log_observation"]);
  // preset exceptions are a floor: the model cannot remove them
  for (const e of scenarioPresets.sensory_overload.exceptions) assert.ok(intent.safetyExceptions.includes(e));
  assert.equal(intent.durationMinutes, 45);
  assert.ok(intent.discarded.some((d) => d.startsWith("allowed_commands:teleport")));
  assert.ok(intent.discarded.some((d) => d.startsWith("safety_exceptions:unplug_everything")));
  assert.ok(intent.discarded.some((d) => d.startsWith("environment.pace:frantic")));
  assert.ok(intent.discarded.some((d) => d.includes("duration_minutes:clamped")));
});

test("sanitizeIntent falls back to the closest preset on unknown scenario or garbage", () => {
  const a = sanitizeIntent({ scenario: "space_walk", confidence: "nope" }, "Es hora de cenar y hay ruido", "es");
  assert.equal(a.scenario, "meal_support");
  assert.equal(a.confidence, "low");
  assert.deepEqual(a.environment, scenarioPresets.meal_support.environment);
  assert.ok(a.discarded.includes("scenario:space_walk"));

  const b = sanitizeIntent("not even an object", "Vi ska gå till skolan", "sv");
  assert.equal(b.scenario, "school_arrival");
  assert.ok(b.discarded.includes("response:not_an_object"));
  assert.match(b.interpretation, /skol/i);
});

test("escalation from Claude leaves only notify_caregiver and log_observation", () => {
  const intent = sanitizeIntent(
    {
      scenario: "sensory_overload",
      escalate: true,
      confidence: "high",
      interpretation: "Describes a fall with bleeding.",
      environment: { light: 5, sound: 5, distance: 0.5, pace: "slow" },
      allowed_commands: ["lower_light", "step_back"],
      safety_exceptions: [],
      duration_minutes: 30,
    },
    "Mia fell and is bleeding",
    "en"
  );
  assert.equal(intent.escalate, true);
  assert.deepEqual(intent.allowedCommands, ESCALATION_COMMANDS);
  assert.deepEqual(intent.environment, scenarioPresets.sensory_overload.environment);
  assert.ok(intent.safetyExceptions.includes("caregiver_pause"));
  const plan = buildCarePlan(plannerInputFromIntent(intent, null));
  assert.equal(plan.validation.valid, true);
  assert.deepEqual(plan.steps.map((s) => s.command), ["notify_caregiver", "log_observation"]);
});

test("local risk screen escalates before any network call, in es/en/sv", async () => {
  assert.equal(localRiskScreen(KITCHEN_ES), false);
  for (const [text, lang] of [
    ["Leo se golpea la cabeza contra la pared y sangra", "es"],
    ["Mia is not breathing properly after choking on food", "en"],
    ["Elias slår huvudet i väggen och blöder från pannan", "sv"],
  ] as const) {
    assert.equal(localRiskScreen(text), true, text);
    const { impl, calls } = mockFetch(() => claudeReply({}));
    const result = await parseCareIntent({ text, lang, apiKey: "k", fetchImpl: impl });
    assert.equal(calls.length, 0, "Claude must not be called");
    assert.equal(result.source, "risk_screen");
    assert.equal(result.intent.escalate, true);
    assert.equal(result.intent.interpretation, escalationMessages[lang]);
    assert.deepEqual(result.intent.allowedCommands, ESCALATION_COMMANDS);
  }
});

test("risk screen sees accented words and does not treat falling asleep as a fall", () => {
  for (const text of [
    "se cayó de la silla",
    "Se Cayó al piso",
    "SE CAYÓ",
    "tuvo una caída",
    "sangró por la nariz",
    "le dio una convulsión",
    "he fell down the stairs",
    "she fell",
    "Elin föll i trappan",
    "han svimmade",
    "ring 112",
  ]) {
    assert.equal(localRiskScreen(text), true, text);
  }
  for (const text of [
    "my son fell asleep on the sofa",
    "Elin föll i sömn i soffan",
    "se quedó dormido en el sofá",
    "1120 kr på kvittot",
  ]) {
    assert.equal(localRiskScreen(text), false, text);
  }
});

test("parseCareIntent uses structured output and never sends the raw text anywhere else", async () => {
  const { impl, calls } = mockFetch(() =>
    claudeReply({
      scenario: "sensory_overload",
      escalate: false,
      confidence: "high",
      interpretation: "Entendí sobrecarga sensorial en la cocina: menos sonido, más espacio.",
      environment: { light: 30, sound: 10, distance: 2.5, pace: "slow" },
      allowed_commands: ["reduce_sound", "step_back", "pause_interaction", "notify_caregiver", "log_observation"],
      safety_exceptions: ["rejection_signal", "caregiver_pause"],
      duration_minutes: 10,
    })
  );
  const result = await parseCareIntent({ text: KITCHEN_ES, lang: "es", apiKey: "k", fetchImpl: impl });
  assert.equal(result.source, "claude");
  assert.equal(result.notice, undefined);
  assert.equal(result.intent.scenario, "sensory_overload");
  assert.deepEqual(result.intent.environment, { light: 30, sound: 10, distance: 2.5, pace: "slow" });
  assert.equal(result.intent.durationMinutes, 10);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].output_config.format.type, "json_schema");
  assert.equal(calls[0].output_config.format.schema.additionalProperties, false);
  assert.equal(calls[0].messages[0].role, "user");
  assert.ok(calls[0].messages[0].content.includes(KITCHEN_ES));

  const plan = buildCarePlan(plannerInputFromIntent(result.intent, null));
  assert.equal(plan.validation.valid, true);
  assert.equal(plan.adapterPackets.ros2.protocol_contract, "care_command_protocol_v0");
  assert.equal(plan.adapterPackets.ros2.environment_targets.sound, 10);
});

test("parseCareIntent falls back to presets with a notice when Claude fails or refuses", async () => {
  const failing = mockFetch(
    () => new Response(JSON.stringify({ error: { type: "api_error", message: "boom" } }), { status: 500 })
  );
  const errors: Array<[number, string]> = [];
  const a = await parseCareIntent({
    text: KITCHEN_ES,
    lang: "es",
    apiKey: "k",
    fetchImpl: failing.impl,
    onError: (s, d) => errors.push([s, d]),
  });
  assert.equal(a.source, "fallback");
  assert.match(a.notice ?? "", /preset/i);
  assert.equal(a.intent.scenario, "sensory_overload");
  assert.equal(a.intent.confidence, "low");
  assert.equal(errors[0][0], 500);
  assert.ok(!errors[0][1].includes("Leo"), "error detail must not carry caregiver text");

  const throwing = mockFetch(() => {
    throw new Error("network down");
  });
  const b = await parseCareIntent({ text: KITCHEN_ES, lang: "en", apiKey: "k", fetchImpl: throwing.impl });
  assert.equal(b.source, "fallback");

  const noKey = await parseCareIntent({ text: KITCHEN_ES, lang: "sv", apiKey: null });
  assert.equal(noKey.source, "fallback");
  assert.deepEqual(noKey.intent, fallbackIntent(KITCHEN_ES, "sv"));

  const refusing = mockFetch(() => claudeReply({}, { stop_reason: "refusal", content: [] }));
  const c = await parseCareIntent({ text: "something unusual", lang: "en", apiKey: "k", fetchImpl: refusing.impl });
  assert.equal(c.intent.escalate, true);
  assert.deepEqual(c.intent.allowedCommands, ESCALATION_COMMANDS);
});

test("parseCareIntent retries without structured output when the API rejects the format", async () => {
  let n = 0;
  const { impl, calls } = mockFetch(() => {
    n += 1;
    if (n === 1) {
      return new Response(
        JSON.stringify({ error: { type: "invalid_request_error", message: "output_config.format is not supported" } }),
        { status: 400 }
      );
    }
    return claudeReply({ scenario: "evening_transition", escalate: false, confidence: "medium", interpretation: "Bedtime.", environment: { light: 20, sound: 15, distance: 1.5, pace: "slow" }, allowed_commands: ["lower_light"], safety_exceptions: [], duration_minutes: 15 });
  });
  const r = await parseCareIntent({ text: "Time for bed, lights are bright", lang: "en", apiKey: "k", fetchImpl: impl });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].output_config.format, undefined);
  assert.equal(r.source, "claude");
  assert.equal(r.intent.scenario, "evening_transition");
  assert.deepEqual(r.intent.allowedCommands, ["lower_light", "notify_caregiver", "log_observation"]);
});
