// src/pages/api/ask.ts
//
// Ask NeuroLjus: question (es/en/sv) → search terms → verified library →
// Claude answer with native citations and source labels. The question is
// never written to logs.

import type { NextApiRequest, NextApiResponse } from "next";
import { ask, ASK_TIMEOUT_MS, MAX_QUESTION_CHARS, type AskLang } from "@/lib/ask/expert";
import { getAnthropicModel, getReflectionProvider } from "@/lib/careReflection/provider";

export const config = { maxDuration: 30 };

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextApiRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0];
  return req.socket?.remoteAddress || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  e.count += 1;
  return e.count > RATE_LIMIT_MAX_REQUESTS;
}

function lang(input: unknown): AskLang {
  return input === "es" || input === "sv" || input === "en" ? input : "en";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }
  if (rateLimited(clientIp(req))) return res.status(429).json({ ok: false, error: "Too many requests. Please wait a moment." });

  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question) return res.status(400).json({ ok: false, error: "Please write a question." });
    if (question.length > MAX_QUESTION_CHARS) {
      return res.status(400).json({ ok: false, error: `Keep the question under ${MAX_QUESTION_CHARS} characters.` });
    }

    const provider = getReflectionProvider();
    const apiKey = provider === "none" ? null : process.env.ANTHROPIC_API_KEY || null;
    if (provider !== "none" && !apiKey) console.error("ANTHROPIC_API_KEY not configured (ask)");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ASK_TIMEOUT_MS);
    try {
      const result = await ask({
        question,
        lang: lang(body.lang),
        helpfulRoutines: body.helpfulRoutines,
        apiKey,
        model: getAnthropicModel(),
        signal: controller.signal,
        // Status and stage only: never the question.
        onError: (detail) => console.error("Ask upstream error", detail),
      });
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(result);
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    console.error("Ask handler error:", error instanceof Error ? error.name : "unknown");
    return res.status(500).json({ ok: false, error: "Technical difficulties. Please try again in a moment." });
  }
}
