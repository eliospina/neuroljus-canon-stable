/**
 * HTTP shape of the brain: OpenAI Chat Completions, streaming SSE, as the
 * ElevenLabs Custom LLM expects. Auth: x-line-secret or Authorization: Bearer
 * with LINE_API_SECRET. GET answers a health check (for a keep-warm ping) with
 * the same secret or Vercel's CRON_SECRET. Nothing from the call is logged.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getAnthropicModel } from "../careReflection/provider";
import { brainTurn, type BrainTurn } from "./brain";
import { LINE_SECRET_HEADER, limitFromEnv, rateLimited, secretMatches } from "./http";
import type { ChatMessage } from "./state";
import type { EmergencyLang } from "../emergency";

/** Mirror of the inline `config` in each route file (Next.js needs the literal there). */
export const brainRouteConfig = { maxDuration: 30, supportsResponseStreaming: true, api: { bodyParser: { sizeLimit: "256kb" } } };

function bearer(req: NextApiRequest): string | null {
  const h = req.headers.authorization;
  const v = Array.isArray(h) ? h[0] : h;
  const m = v?.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export function authorized(req: NextApiRequest, secret: string): boolean {
  return secretMatches(req.headers[LINE_SECRET_HEADER], secret) || secretMatches(bearer(req), secret);
}

export type ChatCompletionRequest = {
  messages: ChatMessage[];
  stream?: boolean;
  model?: string;
  elevenlabs_extra_body?: Record<string, unknown>;
  user_id?: string;
};

export function parseChatRequest(body: unknown): ChatCompletionRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.messages) || b.messages.length === 0) return null;
  const messages = b.messages.filter((m): m is ChatMessage => !!m && typeof m === "object" && typeof (m as ChatMessage).role === "string");
  if (messages.length === 0) return null;
  const extra = b.elevenlabs_extra_body && typeof b.elevenlabs_extra_body === "object" ? (b.elevenlabs_extra_body as Record<string, unknown>) : undefined;
  return { messages, stream: b.stream !== false, model: typeof b.model === "string" ? b.model : undefined, elevenlabs_extra_body: extra, user_id: typeof b.user_id === "string" ? b.user_id : undefined };
}

function hintsFrom(extra: Record<string, unknown> | undefined): { lang?: EmergencyLang | null; country?: string | null } {
  if (!extra) return {};
  const lang = typeof extra.lang === "string" && ["es", "en", "sv"].includes(extra.lang) ? (extra.lang as EmergencyLang) : null;
  const country = typeof extra.country === "string" && /^[A-Za-z]{2}$/.test(extra.country) ? extra.country.toUpperCase() : null;
  return { lang, country };
}

const chunk = (id: string, model: string, delta: Record<string, unknown>, finish: string | null) =>
  `data: ${JSON.stringify({ id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`;

export async function brainHandler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  const secret = (process.env.LINE_API_SECRET || "").trim();
  if (!secret) {
    console.error("line/brain: LINE_API_SECRET not configured");
    res.status(503).json({ ok: false, error: "Not configured." });
    return;
  }
  if (req.method === "GET") {
    const cron = (process.env.CRON_SECRET || "").trim();
    if (!authorized(req, secret) && !(cron && secretMatches(bearer(req), cron))) {
      res.status(401).json({ ok: false, error: "Unauthorized." });
      return;
    }
    // Touching the brain module already built the index: this is the keep-warm ping.
    res.status(200).json({ ok: true, warm: true });
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }
  if (!authorized(req, secret)) {
    if (rateLimited("brain:unauth", limitFromEnv("LINE_UNAUTH_LIMIT_PER_MIN", 20))) {
      res.setHeader("Retry-After", "30");
      res.status(429).json({ ok: false, error: "Too many requests." });
      return;
    }
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }
  if (rateLimited("brain", limitFromEnv("LINE_BRAIN_RATE_LIMIT_PER_MIN", 240))) {
    res.setHeader("Retry-After", "10");
    res.status(429).json({ ok: false, error: "Too many requests." });
    return;
  }
  const parsed = parseChatRequest(req.body);
  if (!parsed) {
    res.status(400).json({ error: { message: "messages is required.", type: "invalid_request_error" } });
    return;
  }

  const id = `chatcmpl-nl-${Date.now().toString(36)}`;
  const model = getAnthropicModel();
  const controller = new AbortController();
  req.on?.("close", () => controller.abort());
  const result: Partial<BrainTurn> = {};
  const turn = brainTurn(
    { messages: parsed.messages, extra: parsed.elevenlabs_extra_body, hints: hintsFrom(parsed.elevenlabs_extra_body), apiKey: process.env.ANTHROPIC_API_KEY || null, model, signal: controller.signal },
    result
  );

  if (!parsed.stream) {
    const parts: string[] = [];
    for await (const s of turn) parts.push(s);
    res.status(200).json({ id, object: "chat.completion", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, message: { role: "assistant", content: parts.join(" ") }, finish_reason: "stop" }], usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } });
    return;
  }

  res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  res.write(chunk(id, model, { role: "assistant", content: "" }, null));
  try {
    let first = true;
    for await (const s of turn) {
      res.write(chunk(id, model, { content: (first ? "" : " ") + s }, null));
      first = false;
    }
  } catch (error) {
    // Error class only: never the transcript.
    console.error("line/brain: turn error", error instanceof Error ? error.name : "unknown");
  }
  res.write(chunk(id, model, {}, "stop"));
  res.write("data: [DONE]\n\n");
  res.end();
  // Operational line, no text: how long the first sentence took and where the words came from.
  if (result.firstSentenceMs !== undefined) console.info(JSON.stringify({ event: "line_brain_turn", source: result.source, firstSentenceMs: result.firstSentenceMs, totalMs: result.totalMs, retrievalMs: result.retrieval?.ms, dropped: result.dropped?.map((d) => d.reason), protocol: result.state?.protocol, phase: result.state?.phase, severe: result.state?.severe }));
}
