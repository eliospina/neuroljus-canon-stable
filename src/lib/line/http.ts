/**
 * Shared plumbing for the voice-line endpoints (/api/line/*), called by the
 * ElevenLabs agent as webhook tools.
 *
 * - Auth: a shared secret in the x-line-secret header (LINE_API_SECRET), compared
 *   in constant time. Without the variable the endpoints refuse everything.
 * - Rate limit: fixed window per endpoint, in memory (per serverless instance).
 * - No transcripts in logs: handlers log a stage code, never request text.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import type { EmergencyLang } from "../emergency";

export const LINE_SECRET_HEADER = "x-line-secret";
export const MAX_SITUATION_CHARS = 800;

const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

/** Test hook: forget all rate-limit state. */
export function resetLineRateLimits(): void {
  buckets.clear();
}

function sha(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function secretMatches(provided: unknown, expected: string): boolean {
  const given = Array.isArray(provided) ? provided[0] : provided;
  if (typeof given !== "string" || !given) return false;
  return timingSafeEqual(sha(given), sha(expected));
}

export function limitFromEnv(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function rateLimited(key: string, max: number, now = Date.now()): boolean {
  const e = buckets.get(key);
  if (!e || now > e.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  e.count += 1;
  return e.count > max;
}

export function parseLang(input: unknown): EmergencyLang {
  return input === "es" || input === "sv" || input === "en" ? input : "en";
}

/**
 * Country from the body (two letters), else null. Never from x-vercel-ip-country:
 * calls come from the ElevenLabs servers, so that header is the datacenter's
 * country, not the caller's. Null gives the generic "your country's emergency number".
 */
export function parseCountry(input: unknown): string | null {
  return typeof input === "string" && /^[A-Za-z]{2}$/.test(input.trim()) ? input.trim().toUpperCase() : null;
}

/** Text field from the body, trimmed; null when missing or empty. */
export function textField(body: Record<string, unknown>, key: string): string | null {
  const v = body[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

type LineHandler = (body: Record<string, unknown>, req: NextApiRequest, res: NextApiResponse) => Promise<void>;

/** Wraps a handler with method, auth, rate limit and error handling. */
export function lineEndpoint(name: string, perMinute: { env: string; fallback: number }, handler: LineHandler) {
  return async function route(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed." });
    }
    const secret = (process.env.LINE_API_SECRET || "").trim();
    if (!secret) {
      console.error(`line/${name}: LINE_API_SECRET not configured`);
      return res.status(503).json({ ok: false, error: "Not configured." });
    }
    if (!secretMatches(req.headers[LINE_SECRET_HEADER], secret)) {
      // Failed attempts have their own bucket, so a flood without the secret cannot use up the agent's budget.
      if (rateLimited(`${name}:unauth`, limitFromEnv("LINE_UNAUTH_LIMIT_PER_MIN", 20))) {
        res.setHeader("Retry-After", "30");
        return res.status(429).json({ ok: false, error: "Too many requests." });
      }
      return res.status(401).json({ ok: false, error: "Unauthorized." });
    }
    if (rateLimited(name, limitFromEnv(perMinute.env, perMinute.fallback))) {
      res.setHeader("Retry-After", "30");
      return res.status(429).json({ ok: false, error: "Too many requests." });
    }
    try {
      const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
      await handler(body, req, res);
    } catch (error) {
      // Error class only: never the message, which could echo the request.
      console.error(`line/${name}: handler error`, error instanceof Error ? error.name : "unknown");
      if (!res.writableEnded) res.status(500).json({ ok: false, error: "Technical difficulties." });
    }
  };
}
