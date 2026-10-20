// src/pages/api/line/ask.ts
//
// Voice line tool: Ask NeuroLjus in spoken form (BM25 library + Claude citations).
// The question is never logged.

import { getAnthropicModel } from "@/lib/careReflection/provider";
import { LINE_ASK_TIMEOUT_MS, buildLineAsk } from "@/lib/line/ask";
import { lineEndpoint, MAX_SITUATION_CHARS, parseCountry, parseLang, textField } from "@/lib/line/http";

export const config = { maxDuration: 10, api: { bodyParser: { sizeLimit: "16kb" } } };

export default lineEndpoint("ask", { env: "LINE_RATE_LIMIT_PER_MIN", fallback: 30 }, async (body, req, res) => {
  const question = textField(body, "question");
  if (!question) return void res.status(400).json({ ok: false, error: "question is required." });
  if (question.length > MAX_SITUATION_CHARS) return void res.status(400).json({ ok: false, error: "question is too long." });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINE_ASK_TIMEOUT_MS);
  try {
    const result = await buildLineAsk({
      question,
      lang: parseLang(body.lang),
      country: parseCountry(body.country, req),
      apiKey: process.env.ANTHROPIC_API_KEY || null,
      model: getAnthropicModel(),
      signal: controller.signal,
      onError: (stage) => console.error("line/ask upstream", stage),
    });
    res.status(200).json(result);
  } finally {
    clearTimeout(timer);
  }
});
