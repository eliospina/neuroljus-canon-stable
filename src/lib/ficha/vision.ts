/**
 * "Mirar" writes into the ficha: what the camera saw, against what is usual
 * for this person. Pure, tested.
 *
 * NL-VISION keeps one aggregated row per second in the browser (see
 * src/lib/nlVision/signals.ts). Here those rows are cut into sessions, each
 * session is summarised in four numbers (hand movement, head movement, hands
 * near the face, blinking), and the summary is compared with the person's own
 * baseline, a running mean of the sessions the carer marked as ordinary.
 * Numbers about movement only: never an emotion, a pain level or a diagnosis.
 */

export type CameraRow = {
  t0?: number;
  t1?: number;
  hasFace?: boolean;
  handsMoveAvg?: number;
  faceMoveAvg?: number;
  handNearPct?: number;
  blinksPerMin?: number;
};

export type VisionMetric = "handsMove" | "faceMove" | "handNear" | "blinks";
export const VISION_METRICS: VisionMetric[] = ["handsMove", "faceMove", "handNear", "blinks"];

export type SessionSummary = { t0: number; t1: number; seconds: number } & Record<VisionMetric, number>;

/** What is usual for this person: a running mean over the sessions marked ordinary. */
export type VisionBaseline = { sessions: number; seenUntil: number } & Record<VisionMetric, number>;

export type Difference = { metric: VisionMetric; direction: "more" | "less"; ratio: number };

/** A pause longer than this starts a new session. */
export const SESSION_GAP_MS = 2 * 60 * 1000;
/** Shorter sessions are noise (rows are ~1 per second). */
export const MIN_SESSION_ROWS = 30;
/** The baseline speaks only after this many ordinary sessions. */
export const MIN_BASELINE_SESSIONS = 3;
/** "More than usual" from 1.5x, "less than usual" from 0.5x. */
export const MORE = 1.5;
export const LESS = 0.5;

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);

/** Cut rows into sessions: a new one after a long pause or when time goes backwards. */
export function sessionize(rows: CameraRow[]): CameraRow[][] {
  const out: CameraRow[][] = [];
  let cur: CameraRow[] = [];
  let lastEnd = -Infinity;
  for (const r of rows) {
    const t0 = num(r.t0);
    if (!t0) continue;
    if (cur.length && (t0 - lastEnd > SESSION_GAP_MS || t0 < lastEnd - 1000)) {
      out.push(cur);
      cur = [];
    }
    cur.push(r);
    lastEnd = Math.max(num(r.t1), t0);
  }
  if (cur.length) out.push(cur);
  return out;
}

/** Four means over the rows where a face was in view. Null when the session is too short or nobody was in view. */
export function summarize(session: CameraRow[]): SessionSummary | null {
  const seen = session.filter((r) => r.hasFace !== false);
  if (session.length < MIN_SESSION_ROWS || seen.length < MIN_SESSION_ROWS / 2) return null;
  const mean = (pick: (r: CameraRow) => number) => seen.reduce((a, r) => a + pick(r), 0) / seen.length;
  return {
    t0: num(session[0].t0),
    t1: num(session[session.length - 1].t1) || num(session[session.length - 1].t0),
    seconds: session.length,
    handsMove: mean((r) => num(r.handsMoveAvg)),
    faceMove: mean((r) => num(r.faceMoveAvg)),
    handNear: mean((r) => num(r.handNearPct)),
    blinks: mean((r) => num(r.blinksPerMin)),
  };
}

/** The latest usable session in the stored rows, or null. */
export function latestSession(rows: CameraRow[]): SessionSummary | null {
  const sessions = sessionize(rows);
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = summarize(sessions[i]);
    if (s) return s;
  }
  return null;
}

export function emptyBaseline(): VisionBaseline {
  return { sessions: 0, seenUntil: 0, handsMove: 0, faceMove: 0, handNear: 0, blinks: 0 };
}

/** Count a session as ordinary for this person: the running mean moves toward it. */
export function foldSession(b: VisionBaseline, s: SessionSummary): VisionBaseline {
  const n = b.sessions;
  const next = { ...b, sessions: n + 1, seenUntil: Math.max(b.seenUntil, s.t1) };
  for (const m of VISION_METRICS) next[m] = (b[m] * n + s[m]) / (n + 1);
  return next;
}

/** Mark a session as seen without counting it as ordinary (it was noted as a signal instead). */
export function markSeen(b: VisionBaseline, s: SessionSummary): VisionBaseline {
  return { ...b, seenUntil: Math.max(b.seenUntil, s.t1) };
}

/** What was different from usual. Empty until the baseline has enough sessions. */
export function compareToBaseline(s: SessionSummary, b: VisionBaseline): Difference[] {
  if (b.sessions < MIN_BASELINE_SESSIONS) return [];
  const out: Difference[] = [];
  for (const m of VISION_METRICS) {
    const base = b[m];
    if (base <= 0) continue;
    const ratio = s[m] / base;
    if (ratio >= MORE) out.push({ metric: m, direction: "more", ratio });
    else if (ratio <= LESS) out.push({ metric: m, direction: "less", ratio });
  }
  return out.sort((a, b) => Math.abs(Math.log(b.ratio)) - Math.abs(Math.log(a.ratio)));
}

export function sanitizeBaseline(v: unknown): VisionBaseline | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const b = emptyBaseline();
  b.sessions = Math.floor(Math.min(num(o.sessions), 100000));
  b.seenUntil = num(o.seenUntil);
  for (const m of VISION_METRICS) b[m] = num(o[m]);
  return b;
}
