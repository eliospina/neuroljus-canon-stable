// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: { sizeLimit: "32kb" },
  },
};

type ChatMessage = { role: "user" | "assistant"; content: string };
type Lang = "sv" | "en" | "es";

const LANG_INSTRUCTION: Record<Lang, string> = {
  sv: "Always respond in Swedish.",
  en: "Always respond in English.",
  es: "Always respond in Spanish.",
};

const MAX_MESSAGES = 40;
const MAX_CONTENT_CHARS = 4000;

// Simple in-memory rate limiting (per server instance). Good enough to stop
// casual abuse of this public OpenAI proxy; use a shared store for multi-instance.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextApiRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0];
  return req.socket?.remoteAddress ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ role: "assistant", content: "Method not allowed." });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ role: "assistant", content: "Too many requests. Please wait a moment and try again." });
  }

  try {
    const body = (req.body ?? {}) as {
      messages?: unknown;
      metrics?: any;
      notes?: unknown;
      lang?: unknown;
    };

    // Validate and sanitize messages
    if (!Array.isArray(body.messages)) {
      return res.status(400).json({ role: "assistant", content: "Invalid request: messages must be an array." });
    }

    const messages: ChatMessage[] = body.messages
      .slice(-MAX_MESSAGES)
      .filter(
        (m): m is ChatMessage =>
          !!m &&
          typeof m === "object" &&
          (m as any).role &&
          ((m as any).role === "user" || (m as any).role === "assistant") &&
          typeof (m as any).content === "string"
      )
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) }));

    if (messages.length === 0) {
      return res.status(400).json({ role: "assistant", content: "Invalid request: no valid messages provided." });
    }

    const lang: Lang = body.lang === "en" || body.lang === "es" || body.lang === "sv" ? body.lang : "sv";
    const notes = typeof body.notes === "string" ? body.notes.slice(0, MAX_CONTENT_CHARS) : "";
    const metrics = body.metrics;

    // Neuroljus AI system instruction
    const system =
      "You are Neuroljus AI, an assistant specialized in helping caregivers understand non-verbal autistic individuals. " +
      "You analyze camera metrics and user input with empathy and provide clear, supportive communication. " +
      "Be concrete and gentle. Offer low-risk next steps. Use uncertainty language. " +
      "If severe/persistent pain or risk is suspected, advise contacting healthcare. " +
      "Interpret live signals contextually - hands near face may indicate self-soothing or discomfort, " +
      "elevated blinking may suggest stress or fatigue, mouth opening patterns may relate to breathing or communication attempts. " +
      LANG_INSTRUCTION[lang];

    // Enhanced context with human-readable metrics interpretation
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

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
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

    if (!r.ok) {
      console.error("OpenAI API responded with status", r.status);
      return res.status(502).json({
        role: "assistant",
        content: "I'm having trouble reaching the AI service right now. Please try again in a moment.",
      });
    }

    const j = await r.json();
    const content =
      j?.choices?.[0]?.message?.content ||
      "I'm having trouble processing that right now. Could you please try rephrasing your question?";
    res.status(200).json({ role: "assistant", content });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res
      .status(500)
      .json({ role: "assistant", content: "I'm experiencing some technical difficulties. Please try again in a moment." });
  }
}
