import assert from "node:assert/strict";
import { beforeEach, afterEach, test } from "node:test";
import askRoute from "../src/pages/api/line/ask";
import { buildLineAsk } from "../src/lib/line/ask";
import { resetLineRateLimits } from "../src/lib/line/http";
import { SECRET, mockReq, mockRes } from "./helpers/lineHttp";

const OLD = { ...process.env };
const realFetch = globalThis.fetch;
beforeEach(() => {
  process.env.LINE_API_SECRET = SECRET;
  delete process.env.ANTHROPIC_API_KEY;
  resetLineRateLimits();
});
afterEach(() => {
  process.env = { ...OLD };
  globalThis.fetch = realFetch;
});

function claude(blocks: Array<{ text: string; cite?: number }>): typeof fetch {
  return (async () =>
    new Response(
      JSON.stringify({
        stop_reason: "end_turn",
        content: blocks.map((b) => ({
          type: "text",
          text: b.text,
          citations: b.cite === undefined ? null : [{ type: "char_location", document_index: b.cite, cited_text: "x" }],
        })),
      }),
      { status: 200 }
    )) as typeof fetch;
}

const base = { lang: "es" as const, country: "SE", apiKey: "k", model: "m" };

test("risk in the question: emergency line only, no search, points to the protocol tool", async () => {
  const fetchImpl = (async () => assert.fail("must not call the network")) as unknown as typeof fetch;
  const r = await buildLineAsk({ ...base, question: "se golpea y sangra", fetchImpl });
  assert.equal(r.mode, "risk");
  assert.equal(r.use_tool, "protocol");
  assert.equal(r.speech, "Si hay peligro, llama al 112.");
});

test("medication questions get the clinician sentence, with no network", async () => {
  const fetchImpl = (async () => assert.fail("must not call the network")) as unknown as typeof fetch;
  for (const q of ["¿Qué dosis de melatonina le doy?", "Which medication helps with sleep?", "Vilket läkemedel hjälper?"]) {
    const r = await buildLineAsk({ ...base, question: q, fetchImpl });
    assert.equal(r.mode, "medication", q);
    assert.equal(r.sources.length, 0);
  }
});

test("claude answer: at most three sentences and two sources with title and year", async () => {
  const fetchImpl = claude([
    { text: "[SCIENCE] Una rutina fija ayuda a dormir. ", cite: 0 },
    { text: "Baja la luz una hora antes. Evita las pantallas. Mantén la misma hora cada noche. Y una cuarta frase. ", cite: 1 },
    { text: "Una quinta más. ", cite: 2 },
  ]);
  const r = await buildLineAsk({ ...base, question: "Mi hijo no duerme por la noche", fetchImpl });
  assert.equal(r.mode, "claude");
  assert.equal(r.speech.split(/(?<=[.!?])\s+/).length, 3);
  assert.doesNotMatch(r.speech, /\[|\]|\*/);
  assert.ok(r.sources.length >= 1 && r.sources.length <= 2);
  for (const s of r.sources) {
    assert.ok(s.title.length > 0 && s.title.length <= 90);
    assert.ok(Number.isInteger(s.year) && s.year > 1990);
  }
  assert.equal(r.library_empty, false);
});

test("claude answer without a citation is practice: no sources and library_empty so the agent may search", async () => {
  const r = await buildLineAsk({ ...base, question: "Mi hijo no duerme por la noche", fetchImpl: claude([{ text: "[PRACTICE] Mantén la misma rutina cada noche." }]) });
  assert.equal(r.mode, "claude");
  assert.deepEqual(r.sources, []);
  assert.equal(r.library_empty, true);
});

test("an answer that mentions medication is not read aloud: falls back to the library", async () => {
  const r = await buildLineAsk({ ...base, question: "Mi hijo no duerme por la noche", fetchImpl: claude([{ text: "[PRACTICE] Dale una pastilla de melatonina." }]) });
  assert.equal(r.mode, "library");
  assert.doesNotMatch(r.speech, /pastilla|melatonina/i);
});

test("upstream failure or no key falls back to the library with a source", async () => {
  const failing = (async () => new Response("{}", { status: 500 })) as typeof fetch;
  const errors: string[] = [];
  const a = await buildLineAsk({ ...base, question: "Mi hijo no duerme por la noche", fetchImpl: failing, onError: (s) => errors.push(s) });
  assert.equal(a.mode, "library");
  assert.ok(a.speech.length > 0 && a.sources.length >= 1);
  assert.deepEqual(errors, ["upstream"]);
  const b = await buildLineAsk({ ...base, apiKey: null, question: "Mi hijo no duerme por la noche" });
  assert.equal(b.mode, "library");
});

test("a timeout is reported as such and the library still answers", async () => {
  const aborting = (async () => {
    throw Object.assign(new Error("aborted"), { name: "AbortError" });
  }) as unknown as typeof fetch;
  const errors: string[] = [];
  const r = await buildLineAsk({ ...base, question: "Mi hijo no duerme por la noche", fetchImpl: aborting, onError: (s) => errors.push(s) });
  assert.equal(r.mode, "library");
  assert.deepEqual(errors, ["timeout"]);
});

test("endpoint: validation, auth and a library answer without a key", async () => {
  let res = mockRes();
  await askRoute(mockReq({ lang: "es" }), res);
  assert.equal(res.statusCode, 400);

  res = mockRes();
  await askRoute(mockReq({ question: "Mi hijo no duerme" }, { secret: "nope" }), res);
  assert.equal(res.statusCode, 401);

  res = mockRes();
  await askRoute(mockReq({ question: "Mi hijo no duerme por la noche", lang: "es" }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.json_.ok, true);
  assert.equal(res.json_.mode, "library");
  assert.ok(res.json_.sources.length <= 2);
});

test("endpoint: never logs the question", async () => {
  const logged: string[] = [];
  const o = [console.error, console.log, console.warn];
  console.error = console.log = console.warn = (...a: unknown[]) => void logged.push(a.join(" "));
  globalThis.fetch = (async () => new Response("{}", { status: 500 })) as typeof fetch;
  process.env.ANTHROPIC_API_KEY = "k";
  try {
    const res = mockRes();
    await askRoute(mockReq({ question: "Mi hijo Leo no duerme por la noche", lang: "es" }), res);
  } finally {
    [console.error, console.log, console.warn] = o;
  }
  assert.ok(!logged.join("\n").includes("Leo"));
});
