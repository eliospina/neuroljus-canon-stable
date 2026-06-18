// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ChatMessage = { role: "user" | "assistant"; content: string };

// --- Basic abuse protection (defense-in-depth for a public endpoint) ---
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15; // per IP per window
const MAX_MESSAGES = 20; // cap conversation history
const MAX_MESSAGE_CHARS = 2_000; // cap each message
const MAX_NOTES_CHARS = 2_000;
const OPENAI_MAX_TOKENS = 500; // cap model output (cost control)

// In-memory store. Note: on serverless this is per-instance, not global,
// but it still meaningfully slows down abuse from a single source.
const hits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextApiRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0];
  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ role: "assistant", content: "Method not allowed." });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({
      role: "assistant",
      content: "Too many requests. Please wait a moment before trying again.",
    });
  }

  try {
    const body = (req.body ?? {}) as {
      messages?: unknown;
      metrics?: any;
      notes?: unknown;
    };

    const messages = sanitizeMessages(body.messages);
    if (messages.length === 0) {
      return res
        .status(400)
        .json({ role: "assistant", content: "Please include at least one message." });
    }

    const notes =
      typeof body.notes === "string" ? body.notes.slice(0, MAX_NOTES_CHARS) : "";
    const metrics = body.metrics;

    // Neuroljus AI system instruction
    const system =
      "You are Neuroljus AI, an assistant specialized in helping caregivers understand non-verbal autistic individuals. " +
      "You analyze camera metrics and user input with empathy and provide clear, supportive communication. " +
      "Be concrete and gentle. Offer low-risk next steps. Use uncertainty language. " +
      "If severe/persistent pain or risk is suspected, advise contacting healthcare. " +
      "Interpret live signals contextually - hands near face may indicate self-soothing or discomfort, " +
      "elevated blinking may suggest stress or fatigue, mouth opening patterns may relate to breathing or communication attempts.";

    const metricsContext = metrics
      ? `
Live Camera Metrics (last 60 seconds):
- Face detected: ${metrics.hasFace ? "Yes" : "No"}
- Hands visible: ${metrics.handsAvg || 0} hands on average
- Hand-to-face proximity: ${((metrics.handNearPct || 0) * 100).toFixed(1)}% of time
- Face movement: ${metrics.faceMoveAvg ? (metrics.faceMoveAvg * 1000).toFixed(2) : "N/A"} (relative units)
- Hand movement: ${metrics.handsMoveAvg ? (metrics.handsMoveAvg * 1000).toFixed(2) : "N/A"} (relative units)
- Blinking rate: ${metrics.blinksPerMin || 0} blinks per minute
- Eye aspect ratio: ${metrics.earAvg ? metrics.earAvg.toFixed(3) : "N/A"} (lower = more closed)
- Mouth openness: ${metrics.mouthOpenAvg ? metrics.mouthOpenAvg.toFixed(3) : "N/A"} (higher = more open)
`
      : "No live metrics available.";

    const context = metricsContext + `\nCaregiver notes: ${notes || "None provided"}`;

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      console.error("OPENAI_API_KEY not configured");
      return res.status(500).json({
        role: "assistant",
        content: "I'm experiencing a technical issue right now. Please try again in a moment.",
      });
    }

    // Abort if OpenAI is slow, to avoid hanging the serverless function.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    let j: any;
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: OPENAI_MAX_TOKENS,
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `${context}\n\nCurrent conversation:\n${messages
                .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
                .join("\n")}`,
            },
          ],
        }),
      });
      j = await r.json();
    } finally {
      clearTimeout(timeout);
    }

    const content =
      j?.choices?.[0]?.message?.content ||
      "I'm having trouble processing that right now. Could you please try rephrasing your question?";
    res.status(200).json({ role: "assistant", content });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      role: "assistant",
      content: "I'm experiencing some technical difficulties. Please try again in a moment.",
    });
  }
}
