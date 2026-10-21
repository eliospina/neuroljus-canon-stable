import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compareToBaseline,
  emptyBaseline,
  foldSession,
  latestSession,
  markSeen,
  sanitizeBaseline,
  sessionize,
  summarize,
  type CameraRow,
  type SessionSummary,
} from "../src/lib/ficha/vision";

const T = Date.UTC(2026, 9, 21, 18, 0, 0);

/** n one-second rows starting at `start`, with the given means. */
function rows(start: number, n: number, over: Partial<CameraRow> = {}): CameraRow[] {
  return Array.from({ length: n }, (_, i) => ({
    t0: start + i * 1000,
    t1: start + (i + 1) * 1000,
    hasFace: true,
    handsMoveAvg: 0.01,
    faceMoveAvg: 0.004,
    handNearPct: 0.1,
    blinksPerMin: 15,
    ...over,
  }));
}

const summary = (over: Partial<SessionSummary> = {}): SessionSummary => ({ t0: T, t1: T + 60000, seconds: 60, handsMove: 0.01, faceMove: 0.004, handNear: 0.1, blinks: 15, ...over });

test("sessionize cuts on long pauses and when the clock goes backwards", () => {
  const a = rows(T, 40);
  const b = rows(T + 40000 + 5 * 60 * 1000, 40);
  const c = rows(T + 1000, 40);
  assert.equal(sessionize([...a, ...b]).length, 2);
  assert.equal(sessionize([...a, ...rows(T + 40000 + 30000, 10)]).length, 1, "a 30 s pause is the same session");
  assert.equal(sessionize([...b, ...c]).length, 2, "time going backwards starts a new session");
  assert.deepEqual(sessionize([{ t0: 0 }, {}]), []);
});

test("summarize needs enough rows with someone in view, and averages only those", () => {
  assert.equal(summarize(rows(T, 10)), null);
  assert.equal(summarize(rows(T, 40, { hasFace: false })), null);
  const s = summarize([...rows(T, 30), ...rows(T + 30000, 10, { hasFace: false, handsMoveAvg: 99 })])!;
  assert.equal(s.seconds, 40);
  assert.ok(Math.abs(s.handsMove - 0.01) < 1e-9, "rows without a face do not count");
  assert.equal(s.t0, T);
});

test("latestSession picks the last usable session, skipping a short one at the end", () => {
  const s = latestSession([...rows(T, 40), ...rows(T + 10 * 60 * 1000, 40, { handsMoveAvg: 0.05 }), ...rows(T + 30 * 60 * 1000, 5)]);
  assert.ok(s && Math.abs(s.handsMove - 0.05) < 1e-9);
  assert.equal(latestSession([]), null);
});

test("the baseline is a running mean, and stays silent until three ordinary sessions", () => {
  let b = emptyBaseline();
  b = foldSession(b, summary({ handsMove: 0.01 }));
  b = foldSession(b, summary({ handsMove: 0.02, t1: T + 120000 }));
  assert.equal(b.sessions, 2);
  assert.ok(Math.abs(b.handsMove - 0.015) < 1e-12);
  assert.equal(b.seenUntil, T + 120000);
  assert.deepEqual(compareToBaseline(summary({ handsMove: 0.1 }), b), [], "not enough sessions yet");
  b = foldSession(b, summary({ handsMove: 0.015 }));
  const diff = compareToBaseline(summary({ handsMove: 0.045, handNear: 0.04, blinks: 16 }), b);
  assert.deepEqual(diff.map((d) => [d.metric, d.direction]), [["handsMove", "more"], ["handNear", "less"]]);
});

test("markSeen only moves the mark; sanitizeBaseline rejects junk", () => {
  const b = markSeen(emptyBaseline(), summary({ t1: T + 999 }));
  assert.equal(b.sessions, 0);
  assert.equal(b.seenUntil, T + 999);
  assert.equal(sanitizeBaseline("x"), null);
  assert.deepEqual(sanitizeBaseline({ sessions: -2, handsMove: "a", blinks: 12 }), { ...emptyBaseline(), blinks: 12 });
});
