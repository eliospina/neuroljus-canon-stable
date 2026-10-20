import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import protocolRoute from "../src/pages/api/line/protocol";
import { resetLineRateLimits, secretMatches } from "../src/lib/line/http";
import { SECRET, mockReq, mockRes } from "./helpers/lineHttp";

const OLD = { ...process.env };
beforeEach(() => {
  process.env.LINE_API_SECRET = SECRET;
  resetLineRateLimits();
});
afterEach(() => {
  process.env = { ...OLD };
});

const body = { situation: "se golpea la cabeza", lang: "es", country: "SE" };

test("secretMatches compares exact secrets only", () => {
  assert.equal(secretMatches("abc", "abc"), true);
  assert.equal(secretMatches("abd", "abc"), false);
  assert.equal(secretMatches("", "abc"), false);
  assert.equal(secretMatches(undefined, "abc"), false);
  assert.equal(secretMatches(["abc", "x"], "abc"), true);
});

test("only POST is accepted", async () => {
  const res = mockRes();
  await protocolRoute(mockReq(body, { method: "GET" }), res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers_["allow"], "POST");
});

test("missing or wrong secret is 401, and the body is never looked at", async () => {
  for (const secret of [null, "wrong", ""]) {
    const res = mockRes();
    await protocolRoute(mockReq(body, { secret }), res);
    assert.equal(res.statusCode, 401, String(secret));
    assert.deepEqual(res.json_, { ok: false, error: "Unauthorized." });
  }
});

test("without LINE_API_SECRET configured every request is refused", async () => {
  delete process.env.LINE_API_SECRET;
  const errors: unknown[][] = [];
  const orig = console.error;
  console.error = (...a: unknown[]) => void errors.push(a);
  try {
    const res = mockRes();
    await protocolRoute(mockReq(body), res);
    assert.equal(res.statusCode, 503);
  } finally {
    console.error = orig;
  }
});

test("rate limit answers 429 after the per-minute budget", async () => {
  process.env.LINE_RATE_LIMIT_PER_MIN = "3";
  const codes: number[] = [];
  for (let i = 0; i < 5; i++) {
    const res = mockRes();
    await protocolRoute(mockReq(body), res);
    codes.push(res.statusCode);
  }
  assert.deepEqual(codes, [200, 200, 200, 429, 429]);
});

test("responses are never cached", async () => {
  const res = mockRes();
  await protocolRoute(mockReq(body), res);
  assert.equal(res.headers_["cache-control"], "no-store");
});

test("failed secrets are limited in their own bucket and do not use up the agent's budget", async () => {
  process.env.LINE_UNAUTH_LIMIT_PER_MIN = "3";
  const codes: number[] = [];
  for (let i = 0; i < 5; i++) {
    const res = mockRes();
    await protocolRoute(mockReq(body, { secret: "wrong" }), res);
    codes.push(res.statusCode);
  }
  assert.deepEqual(codes, [401, 401, 401, 429, 429]);
  const ok = mockRes();
  await protocolRoute(mockReq(body), ok);
  assert.equal(ok.statusCode, 200);
});
