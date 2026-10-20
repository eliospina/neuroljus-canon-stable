import assert from "node:assert/strict";
import { beforeEach, afterEach, test } from "node:test";
import searchRoute from "../src/pages/api/line/search";
import { ALLOWED_DOMAINS, MAX_SEARCHES, buildLineSearch, parseSearch } from "../src/lib/line/search";
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

const base = { lang: "en" as const, country: "GB", apiKey: "k", model: "m" };

function webResponse(): typeof fetch {
  return (async () =>
    new Response(
      JSON.stringify({
        content: [
          { type: "server_tool_use", name: "web_search" },
          { type: "web_search_tool_result", content: [] },
          {
            type: "text",
            text: "According to the NHS, a visual timetable can help. Keep it simple. Use it every day. A fourth sentence.",
            citations: [
              { type: "web_search_result_location", url: "https://www.nhs.uk/conditions/autism/support/", title: "Autism support - NHS" },
              { type: "web_search_result_location", url: "https://evil.example.com/x", title: "Not allowed" },
              { type: "web_search_result_location", url: "https://www.nice.org.uk/guidance/cg170", title: "Autism spectrum disorder in under 19s" },
              { type: "web_search_result_location", url: "https://www.cdc.gov/autism/", title: "Autism - CDC" },
            ],
          },
        ],
      }),
      { status: 200 }
    )) as typeof fetch;
}

test("the allowlist holds the international sources and nothing commercial", () => {
  for (const d of ["who.int", "nice.org.uk", "cdc.gov", "nhs.uk", "autistica.org.uk", "pubmed.ncbi.nlm.nih.gov"]) assert.ok(ALLOWED_DOMAINS.includes(d as never), d);
  assert.ok(ALLOWED_DOMAINS.every((d) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) && !d.startsWith("http")));
  assert.equal(MAX_SEARCHES, 3);
});

test("crisis blocks the search: emergency line, no network, protocol tool", async () => {
  const fetchImpl = (async () => assert.fail("must not call the network")) as unknown as typeof fetch;
  const r = await buildLineSearch({ ...base, query: "he is bleeding and hitting himself", fetchImpl });
  assert.equal(r.mode, "risk");
  assert.equal(r.use_tool, "protocol");
  assert.equal(r.speech, "If there is danger, call 999.");
  assert.deepEqual(r.sources, []);
});

test("medication queries are refused locally", async () => {
  const fetchImpl = (async () => assert.fail("must not call the network")) as unknown as typeof fetch;
  const r = await buildLineSearch({ ...base, query: "melatonin dose for children", fetchImpl });
  assert.equal(r.mode, "medication");
});

test("the request to Anthropic carries the allowlist, max three searches and the key only in the header", async () => {
  let seen: { headers: Record<string, string>; body: any } | null = null;
  const fetchImpl = (async (_url: string, init: RequestInit) => {
    seen = { headers: init.headers as Record<string, string>, body: JSON.parse(String(init.body)) };
    return webResponse()(_url, init);
  }) as typeof fetch;
  await buildLineSearch({ ...base, query: "visual timetable for autistic child", fetchImpl });
  const tool = seen!.body.tools[0];
  assert.equal(tool.name, "web_search");
  assert.equal(tool.max_uses, 3);
  assert.deepEqual(tool.allowed_domains, [...ALLOWED_DOMAINS]);
  assert.equal(seen!.headers["x-api-key"], "k");
  assert.ok(!JSON.stringify(seen!.body).includes('"k"'));
  assert.match(seen!.body.system, /autism/i);
});

test("result: at most three sentences, at most two sources, only from allowed domains", async () => {
  const r = await buildLineSearch({ ...base, query: "visual timetable for autistic child", fetchImpl: webResponse() });
  assert.equal(r.mode, "web");
  assert.equal(r.speech.split(/(?<=[.!?])\s+/).length, 3);
  assert.deepEqual(r.sources.map((s) => s.site), ["nhs.uk", "nice.org.uk"]);
});

test("parseSearch drops sources outside the allowlist and duplicates", () => {
  const { sources } = parseSearch([
    { type: "text", text: "a", citations: [{ url: "https://spam.com/a", title: "x" }, { url: "https://www.who.int/a", title: "WHO" }, { url: "https://www.who.int/a", title: "WHO" }] },
  ]);
  assert.deepEqual(sources, [{ title: "WHO", site: "who.int" }]);
});

test("failures return mode none so the agent can say it found nothing", async () => {
  const failing = (async () => new Response("{}", { status: 529 })) as typeof fetch;
  const errors: string[] = [];
  const a = await buildLineSearch({ ...base, query: "visual timetable", fetchImpl: failing, onError: (s) => errors.push(s) });
  assert.equal(a.mode, "none");
  assert.deepEqual(errors, ["529"]);
  const b = await buildLineSearch({ ...base, apiKey: null, query: "visual timetable" });
  assert.equal(b.mode, "none");
});

test("endpoint: validation, auth, key from the environment and no logging of the query", async () => {
  let res = mockRes();
  await searchRoute(mockReq({}), res);
  assert.equal(res.statusCode, 400);

  res = mockRes();
  await searchRoute(mockReq({ query: "visual timetable" }, { secret: null }), res);
  assert.equal(res.statusCode, 401);

  process.env.ANTHROPIC_API_KEY = "env-key";
  let key = "";
  globalThis.fetch = (async (u: string, init: RequestInit) => {
    key = (init.headers as Record<string, string>)["x-api-key"];
    return webResponse()(u, init);
  }) as typeof fetch;
  const logged: string[] = [];
  const o = [console.error, console.log, console.warn];
  console.error = console.log = console.warn = (...a: unknown[]) => void logged.push(a.join(" "));
  try {
    res = mockRes();
    await searchRoute(mockReq({ query: "visual timetable for Leo", lang: "en" }), res);
  } finally {
    [console.error, console.log, console.warn] = o;
  }
  assert.equal(res.statusCode, 200);
  assert.equal(res.json_.mode, "web");
  assert.equal(key, "env-key");
  assert.ok(!logged.join("\n").includes("Leo"));
});

test("endpoint: search has its own, tighter rate limit", async () => {
  process.env.LINE_SEARCH_RATE_LIMIT_PER_MIN = "2";
  const codes: number[] = [];
  for (let i = 0; i < 3; i++) {
    const res = mockRes();
    await searchRoute(mockReq({ query: "visual timetable" }), res);
    codes.push(res.statusCode);
  }
  assert.deepEqual(codes, [200, 200, 429]);
});
