import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCarePlan } from "../src/lib/careProtocol/planner";
import { scenarioPresets } from "../src/lib/careProtocol/scenarios";
import type { PlannerInput } from "../src/lib/careProtocol/types";
import {
  DEFAULT_ENTITIES,
  homeAssistantScript,
  sanitizeEntities,
  WARM_KELVIN,
} from "../src/lib/companion/homeAssistant";

function overload() {
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

function script(entities = DEFAULT_ENTITIES) {
  const { input, plan } = overload();
  return homeAssistantScript({
    routine: input.routineName,
    scenario: input.scenario,
    environment: input.environment,
    steps: plan.steps,
    entities,
    notifyMessage: "La rutina ha terminado.",
    caregiverNotes: { step_back: "Da espacio: unos 2.4 m." },
  });
}

test("Home Assistant script follows the plan: warm dim light, volume, notify, timed delays", () => {
  const yaml = script();
  assert.match(yaml, /^neuroljus_sensory_overload:$/m);
  assert.match(yaml, /action: light\.turn_on[\s\S]*brightness_pct: 22[\s\S]*color_temp_kelvin: 2200/);
  assert.ok(yaml.includes(`color_temp_kelvin: ${WARM_KELVIN}`));
  assert.match(yaml, /action: media_player\.volume_set[\s\S]*volume_level: 0\.12/);
  assert.match(yaml, /action: notify\.mobile_app_caregiver_phone[\s\S]*message: "La rutina ha terminado\."/);
  assert.match(yaml, /message: "Da espacio: unos 2\.4 m\."/);
  // reduce_sound at +0, lower_light at +2 → one 2-minute delay between them.
  assert.ok(yaml.indexOf("volume_set") < yaml.indexOf('delay: "00:02:00"'));
  assert.ok(yaml.indexOf('delay: "00:02:00"') < yaml.indexOf("light.turn_on"));
});

test("the house never gets a token, a URL or a movement command", () => {
  const body = script()
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n");
  assert.doesNotMatch(body, /token|password|http:|https:|webhook/i);
  assert.doesNotMatch(body, /vacuum|cover\.|lock\.|climate\./);
});

test("script is deterministic and preserves the step order", () => {
  assert.equal(script(), script());
  const { plan } = overload();
  const yaml = script();
  let last = -1;
  for (const step of plan.steps) {
    const at = yaml.indexOf(`· ${step.command}`, last + 1);
    assert.ok(at > last, `${step.command} in order`);
    last = at;
  }
});

test("entity ids are validated per domain; bad input falls back to defaults", () => {
  assert.deepEqual(
    sanitizeEntities({ light: "light.kitchen", mediaPlayer: "media_player.radio", notify: "notify.mobile_app_ana" }),
    { light: "light.kitchen", mediaPlayer: "media_player.radio", notify: "notify.mobile_app_ana" }
  );
  assert.deepEqual(
    sanitizeEntities({ light: "switch.kitchen", mediaPlayer: "media_player.radio\n  evil: yes", notify: "" }),
    DEFAULT_ENTITIES
  );
});
