/**
 * Bridge from local NL-VISION samples (browser localStorage) into Care Protocol
 * VisionSnapshot context. Numeric signals only — no emotion labels, no video.
 */

import type { VisionSnapshot } from "./types";

export const NLVISION_STORAGE_KEY = "nlvision_holistic_v1";

export type NlVisionLocalRow = {
  hasFace?: boolean;
  handsAvg?: number;
  handNearPct?: number;
  faceMoveAvg?: number;
  handsMoveAvg?: number;
  blinksPerMin?: number;
};

export function parseNlVisionLocalSamples(raw: string): NlVisionLocalRow[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as NlVisionLocalRow[]) : [];
  } catch {
    return [];
  }
}

export function visionSnapshotFromLocalRow(
  latest: NlVisionLocalRow | null | undefined
): VisionSnapshot | null {
  if (!latest) return null;

  return {
    faceDetected: latest.hasFace === true,
    handsAvg: typeof latest.handsAvg === "number" ? latest.handsAvg : 0,
    handNearPct: typeof latest.handNearPct === "number" ? latest.handNearPct : 0,
    movement:
      (typeof latest.faceMoveAvg === "number" ? latest.faceMoveAvg : 0) +
      (typeof latest.handsMoveAvg === "number" ? latest.handsMoveAvg : 0),
    blinksPerMin: typeof latest.blinksPerMin === "number" ? latest.blinksPerMin : 0,
  };
}

/** Read the latest aggregated NL-VISION row from a Storage-like object. */
export function readLatestLocalVisionSnapshot(
  storage: Pick<Storage, "getItem"> | null | undefined
): VisionSnapshot | null {
  if (!storage) return null;
  const raw = storage.getItem(NLVISION_STORAGE_KEY) || "[]";
  const samples = parseNlVisionLocalSamples(raw);
  return visionSnapshotFromLocalRow(samples[samples.length - 1]);
}
