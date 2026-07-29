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
    assert.match(text, /care_command_protocol_v0|Observation Method|NL-VISION/i);
    assert.doesNotMatch(text, /diagnos|emotion|understands autism/i);
  }
});
