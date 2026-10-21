// src/pages/api/protocol-from-text.ts
//
// Care Agent endpoint: caregiver text (es/en/sv) → validated intent → deterministic
// care_command_protocol_v0 plan with adapter packets.
//
// Claude interprets; buildCarePlan() decides. The caregiver text is never logged.

import type { NextApiRequest, NextApiResponse } from "next";
import { clientIp, rateLimited } from "@/lib/line/http";
import { buildCarePlan } from "@/lib/careProtocol/planner";
import type { VisionSnapshot } from "@/lib/careProtocol/types";
import {
  INTENT_TIMEOUT_MS,
  MAX_INTENT_TEXT_CHARS,
  parseCareIntent,
  plannerInputFromIntent,
  sanitizeHelpfulRoutines,
  type IntentLang,
} from "@/lib/careProtocol/intentParser";
import { getReflectionProvider } from "@/lib/careReflection/provider";
import { countryFromHeaders, emergencyInfo } from "@/lib/emergency";

export const config = { maxDuration: 20 };

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const isRateLimited = (ip: string) => rateLimited(`protocol:${ip}`, RATE_LIMIT_MAX_REQUESTS);
const getClientIp = clientIp;

function sanitizeLang(input: unknown): IntentLang {
  return input === "sv" || input === "es" || input === "en" ? input : "en";
}

function num(input: unknown): number | null {
  return typeof input === "number" && Number.isFinite(input) ? input : null;
}

/** Only numeric NL-VISION signals cross the wire, same shape Care Room uses. */
function sanitizeVision(input: unknown): VisionSnapshot | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const v = input as Record<string, unknown>;
  const handsAvg = num(v.handsAvg);
  const handNearPct = num(v.handNearPct);
  const movement = num(v.movement);
  const blinksPerMin = num(v.blinksPerMin);
  if (handsAvg === null && handNearPct === null && movement === null && blinksPerMin === null) return null;
  return {
    faceDetected: v.faceDetected === true,
    handsAvg: handsAvg ?? 0,
    handNearPct: handNearPct ?? 0,
    movement: movement ?? 0,
    blinksPerMin: blinksPerMin ?? 0,
  };
}

function firstString(input: unknown): string {
  if (typeof input === "string") return input;
  if (Array.isArray(input) && typeof input[0] === "string") return input[0];
  return "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: "Too many requests. Please wait a moment." });
  }

  try {
    const body = req.method === "POST" ? ((req.body ?? {}) as Record<string, unknown>) : {};
    const text =
      (req.method === "POST" ? firstString(body.text) : firstString(req.query.text)).trim();
    const lang = sanitizeLang(req.method === "POST" ? body.lang : firstString(req.query.lang));
    const visionContext = req.method === "POST" ? sanitizeVision(body.visionContext) : null;
    // Anonymous on-device summary of what helped before: enums and counts only.
    const history = req.method === "POST" ? sanitizeHelpfulRoutines(body.helpfulRoutines) : [];
    const country = countryFromHeaders(req.headers);
    const emergency = emergencyInfo(country, lang);

    if (!text) {
      return res.status(400).json({ ok: false, error: "Please describe what is happening." });
    }
    if (text.length > MAX_INTENT_TEXT_CHARS) {
      return res
        .status(400)
        .json({ ok: false, error: `Keep the description under ${MAX_INTENT_TEXT_CHARS} characters.` });
    }

    const provider = getReflectionProvider();
    const apiKey = provider === "none" ? null : process.env.ANTHROPIC_API_KEY || null;
    if (provider !== "none" && !apiKey) console.error("ANTHROPIC_API_KEY not configured (care agent)");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), INTENT_TIMEOUT_MS);
    let result;
    try {
      result = await parseCareIntent({
        text,
        lang,
        apiKey,
        signal: controller.signal,
        history,
        country,
        // Status and API error type only: never the caregiver text.
        onError: (status, detail) => console.error("Care agent upstream error", status, detail),
      });
    } finally {
      clearTimeout(timeout);
    }

    const plannerInput = plannerInputFromIntent(result.intent, visionContext);
    const plan = buildCarePlan(plannerInput);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      ok: true,
      source: result.source,
      notice: result.notice ?? null,
      escalate: result.intent.escalate,
      escalationMessage: result.intent.escalate ? emergency.text : null,
      emergency: { number: emergency.number, call: emergency.call, text: emergency.text },
      interpretation: result.intent.interpretation,
      confidence: result.intent.confidence,
      discarded: result.intent.discarded,
      scenario: result.intent.scenario,
      lang,
      plannerInput,
      plan,
    });
  } catch (error) {
    console.error("Care agent handler error:", error instanceof Error ? error.name : "unknown");
    return res.status(500).json({ ok: false, error: "Technical difficulties. Please try again in a moment." });
  }
}
