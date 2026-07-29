/**
 * Pure NL-VISION signal math — reusable by Tasks Vision and tests.
 * Numeric observations only; never emotion or diagnosis.
 */

export type Point2 = { x: number; y: number };

export type FrameSample = {
  t: number;
  hasFace: boolean;
  leftHand: boolean;
  rightHand: boolean;
  handsCount: number;
  faceMove: number;
  handsMove: number;
  handNearFace: boolean;
  ear?: number;
  mouthOpen?: number;
};

export type AggregatedRow = {
  t0: number;
  t1: number;
  hasFace: boolean;
  handsAvg: number;
  faceMoveAvg: number;
  handsMoveAvg: number;
  handNearPct: number;
  earAvg: number | null;
  mouthOpenAvg: number | null;
  blinksPerMin: number;
  engine: "tasks_vision_v2";
};

export const NLVISION_STORAGE_KEY = "nlvision_holistic_v1";

export function dist(a?: Point2, b?: Point2): number {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function averagePoint(points: Point2[]): Point2 | undefined {
  if (!points.length) return undefined;
  const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  return { x, y };
}

/** Eye aspect ratio from MediaPipe face landmark indices (left eye). */
export function computeEAR(landmarks: Point2[]): number | undefined {
  if (landmarks.length < 387) return undefined;
  const L_up = landmarks[159];
  const L_down = landmarks[145];
  const L_l = landmarks[33];
  const L_r = landmarks[133];
  const R_up = landmarks[386];
  const R_down = landmarks[374];
  const R_l = landmarks[362];
  const R_r = landmarks[263];
  if (!L_up || !L_down || !L_l || !L_r || !R_up || !R_down || !R_l || !R_r) return undefined;
  const left = dist(L_up, L_down) / Math.max(1e-6, dist(L_l, L_r));
  const right = dist(R_up, R_down) / Math.max(1e-6, dist(R_l, R_r));
  return (left + right) / 2;
}

export function computeMouthOpen(landmarks: Point2[]): number | undefined {
  if (landmarks.length < 292) return undefined;
  const up = landmarks[13];
  const down = landmarks[14];
  const left = landmarks[61];
  const right = landmarks[291];
  if (!up || !down || !left || !right) return undefined;
  return dist(up, down) / Math.max(1e-6, dist(left, right));
}

export function isHandNearFace(
  faceCenter: Point2 | undefined,
  leftHand: Point2 | undefined,
  rightHand: Point2 | undefined,
  threshold = 0.12
): boolean {
  if (!faceCenter) return false;
  return (
    (Boolean(leftHand) && dist(leftHand, faceCenter) < threshold) ||
    (Boolean(rightHand) && dist(rightHand, faceCenter) < threshold)
  );
}

export function aggregateSamples(
  samples: FrameSample[],
  until: number,
  blinksPerMin: number
): AggregatedRow | null {
  if (!samples.length) return null;
  const handsAvg = samples.reduce((a, s) => a + s.handsCount, 0) / samples.length;
  const faceMoveAvg = samples.reduce((a, s) => a + s.faceMove, 0) / samples.length;
  const handsMoveAvg = samples.reduce((a, s) => a + s.handsMove, 0) / samples.length;
  const handNearPct = samples.filter((s) => s.handNearFace).length / samples.length;
  const ears = samples.map((s) => s.ear).filter((n): n is number => typeof n === "number");
  const mouths = samples.map((s) => s.mouthOpen).filter((n): n is number => typeof n === "number");

  return {
    t0: samples[0].t,
    t1: until,
    hasFace: samples.some((s) => s.hasFace),
    handsAvg: +handsAvg.toFixed(3),
    faceMoveAvg: +faceMoveAvg.toFixed(5),
    handsMoveAvg: +handsMoveAvg.toFixed(5),
    handNearPct: +handNearPct.toFixed(3),
    earAvg: ears.length ? +(ears.reduce((a, b) => a + b, 0) / ears.length).toFixed(4) : null,
    mouthOpenAvg: mouths.length
      ? +(mouths.reduce((a, b) => a + b, 0) / mouths.length).toFixed(4)
      : null,
    blinksPerMin,
    engine: "tasks_vision_v2",
  };
}

export function appendLocalSample(storage: Pick<Storage, "getItem" | "setItem">, row: AggregatedRow) {
  const prev = storage.getItem(NLVISION_STORAGE_KEY) || "[]";
  let arr: unknown[] = [];
  try {
    const parsed = JSON.parse(prev) as unknown;
    arr = Array.isArray(parsed) ? parsed : [];
  } catch {
    arr = [];
  }
  arr.push(row);
  // Keep last ~30 minutes of 1 Hz rows
  if (arr.length > 1800) arr = arr.slice(arr.length - 1800);
  storage.setItem(NLVISION_STORAGE_KEY, JSON.stringify(arr));
}
