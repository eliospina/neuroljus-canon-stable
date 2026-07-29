import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getReflectionProvider,
  offlineReflectionReply,
} from "../src/lib/careReflection/provider";

test("getReflectionProvider defaults to openai and accepts none/anthropic", () => {
  const previous = process.env.CARE_REFLECTION_PROVIDER;
  try {
    delete process.env.CARE_REFLECTION_PROVIDER;
    assert.equal(getReflectionProvider(), "openai");
    process.env.CARE_REFLECTION_PROVIDER = "none";
    assert.equal(getReflectionProvider(), "none");
    process.env.CARE_REFLECTION_PROVIDER = "anthropic";
    assert.equal(getReflectionProvider(), "anthropic");
    process.env.CARE_REFLECTION_PROVIDER = "OPENAI";
    assert.equal(getReflectionProvider(), "openai");
  } finally {
    if (previous === undefined) delete process.env.CARE_REFLECTION_PROVIDER;
    else process.env.CARE_REFLECTION_PROVIDER = previous;
  }
});

test("offlineReflectionReply stays non-diagnostic in all languages", () => {
  for (const lang of ["sv", "en", "es"] as const) {
    const text = offlineReflectionReply(lang);
    assert.match(text, /care_command_protocol_v0|Observation Method|NL-VISION|signalsimulering|simulación científica|scientific signal simulation/i);
    assert.doesNotMatch(text, /understands autism|diagnosed|diagnóstico confirmado/i);
  }
});

test("offlineReflectionReply includes scientific simulation when metrics exist", () => {
  const text = offlineReflectionReply("en", {
    hasFace: true,
    handsAvg: 1,
    handNearPct: 0.5,
    faceMoveAvg: 0.03,
    handsMoveAvg: 0.02,
    blinksPerMin: 30,
    earAvg: 0.2,
    mouthOpenAvg: 0.1,
  });
  assert.match(text, /Scientific signal simulation/i);
  assert.match(text, /elevated/i);
  assert.match(text, /CARE_REFLECTION_PROVIDER=none/);
});
