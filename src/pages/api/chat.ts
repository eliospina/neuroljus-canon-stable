// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Lang = "sv" | "en" | "es";

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

function sanitizeLang(input: unknown): Lang {
  return input === "sv" || input === "es" || input === "en" ? input : "en";
}

function languageInstruction(lang: Lang): string {
  if (lang === "sv") return "Respond in Swedish unless the caregiver asks for another language.";
  if (lang === "es") return "Respond in Spanish unless the caregiver asks for another language.";
  return "Respond in English unless the caregiver asks for another language.";
}

function numberOrUndefined(input: unknown): number | undefined {
  const n = typeof input === "number" ? input : typeof input === "string" ? Number(input) : undefined;
  return Number.isFinite(n) ? n : undefined;
}

function numberOrZero(input: unknown): number {
  return numberOrUndefined(input) ?? 0;
}

function formatRelative(input: unknown): string {
  const n = numberOrUndefined(input);
  return n === undefined ? "N/A" : (n * 1000).toFixed(2);
}

function formatFixed(input: unknown, digits: number): string {
  const n = numberOrUndefined(input);
  return n === undefined ? "N/A" : n.toFixed(digits);
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
      lang?: unknown;
    };

    const messages = sanitizeMessages(body.messages);
    if (messages.length === 0) {
      return res
        .status(400)
        .json({ role: "assistant", content: "Please include at least one message." });
    }

    const notes =
      typeof body.notes === "string" ? body.notes.slice(0, MAX_NOTES_CHARS) : "";
    const metrics =
      body.metrics && typeof body.metrics === "object" && !Array.isArray(body.metrics)
        ? body.metrics
        : undefined;
    const lang = sanitizeLang(body.lang);

    // Neuroljus AI system instruction
    const system =
      "You are Neuroljus AI, a care-observation assistant inside a research-ready care intelligence platform. " +
      "Neuroljus turns caregiver knowledge into structured routines, local observations, open protocols, and a path toward future health, research, and assistive robotics. " +
      "You help caregivers organize notes, context, routines, open questions, and optional prototype camera metrics. " +
      "Lead with useful structure, not disclaimers. Do not open responses with a list of limitations. " +
      "Be concrete, calm, and practical. Offer low-risk observation steps and next-step options. Use uncertainty language where evidence is incomplete. " +
      "If severe/persistent pain or risk is suspected, advise contacting healthcare. " +
      "Do not diagnose, do not translate non-speaking or non-verbal behavior as certainty, and do not present metrics as validated evidence. " +
      "Never infer calmness, distress, engagement, disengagement, pain, emotion, intent, communication, or availability from face, hands, blinking, mouth openness, movement, or the absence of those signals. " +
      "Do not claim that you can interpret inner states or understand a person's lived experience from camera data. " +
      "When discussing live signals, describe them only as prototype observations that may help organize caregiver reflection. " +
      "If no face or hands are detected, say only that no usable visual signal is available; do not turn absence into a behavioral conclusion. " +
      "Do not mention camera metrics in introductions or general greetings unless the caregiver directly asks about them. " +
      "If robotics or future care technology comes up, frame it as an expandable care protocol layer for routines, environments, handoffs, and communication, with consent, privacy, traceability, and caregiver-authored settings preserved. " +
      languageInstruction(lang);

    const hasMetrics = !!metrics && Object.keys(metrics).length > 0;
    const metricsContext = hasMetrics
      ? `
Prototype visual signals (last 60 seconds, non-diagnostic and not validated):
- Face detected: ${metrics.hasFace === true ? "Yes" : "No"}
- Hands visible: ${numberOrZero(metrics.handsAvg)} hands on average
- Hand-to-face proximity: ${(numberOrZero(metrics.handNearPct) * 100).toFixed(1)}% of time
- Face movement: ${formatRelative(metrics.faceMoveAvg)} (relative units)
- Hand movement: ${formatRelative(metrics.handsMoveAvg)} (relative units)
- Blinking rate: ${numberOrZero(metrics.blinksPerMin)} blinks per minute
- Eye aspect ratio: ${formatFixed(metrics.earAvg, 3)} (lower = more closed)
- Mouth openness: ${formatFixed(metrics.mouthOpenAvg, 3)} (higher = more open)
Boundary: These signals cannot determine calmness, engagement, pain, emotion, intent, or communication. Absence of a face, hands, or blinking is only absence of usable prototype signal.
`
      : "No usable live prototype metrics were provided.";

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
      if (!r.ok) {
        console.error("OpenAI API returned an error", r.status, j?.error?.message);
        return res.status(502).json({
          role: "assistant",
          content:
            "I'm having trouble reaching the AI service right now. Please try again in a moment.",
        });
      }
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
