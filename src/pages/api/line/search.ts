// src/pages/api/line/search.ts
//
// Voice line tool: web search about autism on an allowlist of international
// domains, at most three searches per call. Blocked on crisis. Key from
// ANTHROPIC_API_KEY in Vercel. The query is never logged.

import { getAnthropicModel } from "@/lib/careReflection/provider";
import { lineEndpoint, MAX_SITUATION_CHARS, parseCountry, parseLang, textField } from "@/lib/line/http";
import { LINE_SEARCH_TIMEOUT_MS, buildLineSearch } from "@/lib/line/search";

export const config = { maxDuration: 15, api: { bodyParser: { sizeLimit: "16kb" } } };

export default lineEndpoint("search", { env: "LINE_SEARCH_RATE_LIMIT_PER_MIN", fallback: 10 }, async (body, _req, res) => {
  const query = textField(body, "query");
  if (!query) return void res.status(400).json({ ok: false, error: "query is required." });
  if (query.length > MAX_SITUATION_CHARS) return void res.status(400).json({ ok: false, error: "query is too long." });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINE_SEARCH_TIMEOUT_MS);
  try {
    const result = await buildLineSearch({
      query,
      lang: parseLang(body.lang),
      country: parseCountry(body.country),
      apiKey: process.env.ANTHROPIC_API_KEY || null,
      model: getAnthropicModel(),
      signal: controller.signal,
      onError: (stage) => console.error("line/search upstream", stage),
    });
    res.status(200).json(result);
  } finally {
    clearTimeout(timer);
  }
});
