// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  callAnthropicReflection,
  getReflectionProvider,
  offlineReflectionReply,
} from "@/lib/careReflection/provider";

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

    // Neuroljus reflection assistant — grounded in this product, humble about non-speaking care.
    const system =
      "You are Neuroljus Care Reflection, a bounded assistant inside neuroljus.com. " +
      "Neuroljus is care intelligence infrastructure by Elizabeth Ospina: lived caregiver knowledge becomes structured observations, local camera signals (NL-VISION), and portable care_command_protocol_v0 for humans, homes, and future assistive robots. " +
      "Non-speaking and neurodivergent people may express needs through gesture, movement, sound, and routine — not speech. Honor that. Never claim to read minds or 'translate autism'. " +
      "Caregiver authority means RESPONSIBILITY FOR THE PERSON — never ranking humans by neurotypical capability, mockery, or staff convenience first. Refuse advice that optimizes only for institutional throughput. " +
      "If the user reports witnessing physical aggression or mistreatment (push, hit, rough grip, humiliation): take it seriously. Help STRUCTURE a witness note (what was seen, who, when, who else present, how the person was protected). State clearly that violence is never a care method. Urge reporting through the duties that apply where they work (in Sweden often Lex Sarah / local pathways). Never claim the camera or Neuroljus detected abuse. Never invent legal advice beyond pointing to local obligation. " +
      "If the user describes institutional neglect (soiled floors left unclean, eating from contaminated surfaces, staff allowing self-harm to continue, psychological demeaning): name it as neglect of dignity, not 'challenging behavior'. Help structure environment / hygiene / passivity facts. Point to Lex Sarah, IVO (Swedish Health and Social Care Inspectorate), and legal counsel when escalation is needed — without pretending Neuroljus is those institutions. " +
      "If the user mentions repeated phrases or speech cycles (e.g. words of love said again and again): honor them as human communication worth recording. Write them as spoken. Do NOT claim to know what they meant inside. Do NOT mock or pathologize the cycle. " +
      "When the user asks how to improve the portal or what Neuroljus should do next, answer from the REAL product only: " +
      "(1) /labs/nl-vision raw landmarks, (2) /labs/future-care-room Story Mode and Possible discomfort, (3) /labs/robot-interface protocol export, (4) /observation-method structured notes, (5) /labs/pattern-notebook local gesture→relief notes. " +
      "Do NOT give generic SaaS advice (random UI tips, signup funnels, feature lists unrelated to these labs). " +
      "If the caregiver suspects pain or discomfort: help them STRUCTURE observations (gesture, what eased, what worsened, uncertainty). Treat pain as a HYPOTHESIS for the caregiver and healthcare — never as a camera conclusion. " +
      "If severe, persistent, or escalating concern: advise contacting healthcare. Neuroljus does not diagnose or replace clinicians. " +
      "Lead with useful structure, not a lecture of limitations. Be concrete, calm, and respectful. Use uncertainty language. " +
      "Do not diagnose. Do not present metrics as validated evidence. " +
      "Never infer pain, emotion, intent, or communication from face, hands, blinks, mouth, or movement signals. " +
      "Camera metrics are optional prototype numbers for reflection only. " +
      "If no face or hands are detected, say only that no usable visual signal is available. " +
      "Wireless belts/bands or body sensors may be mentioned only as a FUTURE research horizon for caregiver-authored protocols — not as a current medical product. " +
      "Assistive robotics collaboration is welcome as a horizon: robots may receive care_command_protocol_v0 for autistic people who need care most — never to optimize staff KPIs, never to mind-read, always with human override. " +
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
    const userContent = `${context}\n\nCurrent conversation:\n${messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n")}`;

    const provider = getReflectionProvider();
    if (provider === "none") {
      return res.status(200).json({
        role: "assistant",
        content: offlineReflectionReply(lang),
        provider: "none",
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    try {
      if (provider === "anthropic") {
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
          console.error("ANTHROPIC_API_KEY not configured");
          return res.status(500).json({
            role: "assistant",
            content: "I'm experiencing a technical issue right now. Please try again in a moment.",
            provider: "anthropic",
          });
        }

        const result = await callAnthropicReflection({
          apiKey: anthropicKey,
          system,
          userContent,
          messages,
          maxTokens: OPENAI_MAX_TOKENS,
          signal: controller.signal,
        });

        if (!result.ok) {
          console.error("Anthropic API returned an error", result.status, result.detail);
          return res.status(502).json({
            role: "assistant",
            content:
              "I'm having trouble reaching the AI service right now. Please try again in a moment.",
            provider: "anthropic",
          });
        }

        return res.status(200).json({
          role: "assistant",
          content: result.content,
          provider: "anthropic",
        });
      }

      const key = process.env.OPENAI_API_KEY;
      if (!key) {
        console.error("OPENAI_API_KEY not configured");
        return res.status(500).json({
          role: "assistant",
          content: "I'm experiencing a technical issue right now. Please try again in a moment.",
          provider: "openai",
        });
      }

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
            { role: "user", content: userContent },
          ],
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        console.error("OpenAI API returned an error", r.status, j?.error?.message);
        return res.status(502).json({
          role: "assistant",
          content:
            "I'm having trouble reaching the AI service right now. Please try again in a moment.",
          provider: "openai",
        });
      }

      const content =
        j?.choices?.[0]?.message?.content ||
        "I'm having trouble processing that right now. Could you please try rephrasing your question?";
      return res.status(200).json({ role: "assistant", content, provider: "openai" });
    } catch (error) {
      console.error("Reflection provider error:", error);
      return res.status(500).json({
        role: "assistant",
        content: "I'm experiencing some technical difficulties. Please try again in a moment.",
        provider,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("Chat handler error:", error);
    return res.status(500).json({
      role: "assistant",
      content: "I'm experiencing some technical difficulties. Please try again in a moment.",
    });
  }
}
