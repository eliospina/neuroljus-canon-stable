import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getReflectionProvider,
  offlineReflectionReply,
} from "../src/lib/careReflection/provider";

test("getReflectionProvider defaults to anthropic and accepts none/openai", () => {
  const previous = process.env.CARE_REFLECTION_PROVIDER;
  try {
    delete process.env.CARE_REFLECTION_PROVIDER;
    assert.equal(getReflectionProvider(), "anthropic");
    process.env.CARE_REFLECTION_PROVIDER = "none";
    assert.equal(getReflectionProvider(), "none");
    process.env.CARE_REFLECTION_PROVIDER = "anthropic";
    assert.equal(getReflectionProvider(), "anthropic");
    process.env.CARE_REFLECTION_PROVIDER = "OPENAI";
    assert.equal(getReflectionProvider(), "openai");
    process.env.CARE_REFLECTION_PROVIDER = "unknown";
    assert.equal(getReflectionProvider(), "anthropic");
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

test("buildAnthropicRequestBody sends one user turn and a current model", async () => {
  const { buildAnthropicRequestBody, DEFAULT_ANTHROPIC_MODEL } = await import(
    "../src/lib/careReflection/provider"
  );
  const previous = process.env.ANTHROPIC_MODEL;
  try {
    delete process.env.ANTHROPIC_MODEL;
    const body = buildAnthropicRequestBody({
      system: "system prompt",
      userContent: "ASSISTANT: greeting\nUSER: question",
      maxTokens: 800,
    });
    assert.equal(body.model, DEFAULT_ANTHROPIC_MODEL);
    assert.notEqual(body.model, "claude-sonnet-4-20250514");
    assert.equal(body.messages.length, 1);
    assert.equal(body.messages[0].role, "user");
    assert.equal(body.max_tokens, 800);
    assert.equal("temperature" in body, false);

    process.env.ANTHROPIC_MODEL = "claude-opus-5-5";
    assert.equal(buildAnthropicRequestBody({ system: "s", userContent: "u", maxTokens: 1 }).model, "claude-opus-5-5");
  } finally {
    if (previous === undefined) delete process.env.ANTHROPIC_MODEL;
    else process.env.ANTHROPIC_MODEL = previous;
  }
});

test("callAnthropicReflection reports upstream status and reads text blocks", async () => {
  const { callAnthropicReflection } = await import("../src/lib/careReflection/provider");
  const originalFetch = globalThis.fetch;
  const seen: Array<{ url: string; body: any }> = [];
  try {
    globalThis.fetch = (async (url: any, init: any) => {
      const body = JSON.parse(init.body);
      seen.push({ url: String(url), body });
      if (body.model === "retired-model") {
        return new Response(
          JSON.stringify({ type: "error", error: { type: "not_found_error", message: "model: retired-model" } }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ stop_reason: "end_turn", content: [{ type: "text", text: "Structured reading." }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }) as typeof fetch;

    const failed = await callAnthropicReflection({
      apiKey: "k",
      system: "s",
      userContent: "u",
      maxTokens: 10,
      signal: new AbortController().signal,
      model: "retired-model",
    });
    assert.equal(failed.ok, false);
    if (!failed.ok) {
      assert.equal(failed.status, 404);
      assert.match(failed.detail, /not_found_error/);
    }

    const okResult = await callAnthropicReflection({
      apiKey: "k",
      system: "s",
      userContent: "u",
      maxTokens: 10,
      signal: new AbortController().signal,
      model: "claude-sonnet-5-5",
    });
    assert.equal(okResult.ok, true);
    if (okResult.ok) assert.equal(okResult.content, "Structured reading.");
    assert.equal(seen[1].body.messages[0].role, "user");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("degradedReflectionReply keeps the local reading in all languages", async () => {
  const { degradedReflectionReply } = await import("../src/lib/careReflection/provider");
  for (const lang of ["sv", "en", "es"] as const) {
    const text = degradedReflectionReply(lang, { hasFace: true, blinksPerMin: 30 });
    assert.match(text, /Observation Method/);
    assert.doesNotMatch(text, /understands autism|diagnosed|diagnóstico confirmado/i);
  }
});
