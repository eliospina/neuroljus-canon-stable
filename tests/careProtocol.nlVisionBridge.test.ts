import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseNlVisionLocalSamples,
  readLatestLocalVisionSnapshot,
  visionSnapshotFromLocalRow,
} from "../src/lib/careProtocol/nlVisionBridge";

test("parseNlVisionLocalSamples returns empty array on bad JSON", () => {
  assert.deepEqual(parseNlVisionLocalSamples(""), []);
  assert.deepEqual(parseNlVisionLocalSamples("{"), []);
  assert.deepEqual(parseNlVisionLocalSamples("null"), []);
});

test("visionSnapshotFromLocalRow maps aggregated NL-VISION row", () => {
  const snapshot = visionSnapshotFromLocalRow({
    hasFace: true,
    handsAvg: 1.5,
    handNearPct: 0.4,
    faceMoveAvg: 0.01,
    handsMoveAvg: 0.02,
    blinksPerMin: 12,
  });

  assert.deepEqual(snapshot, {
    faceDetected: true,
    handsAvg: 1.5,
    handNearPct: 0.4,
    movement: 0.03,
    blinksPerMin: 12,
  });
});

test("readLatestLocalVisionSnapshot uses the last storage row", () => {
  const storage = {
    getItem() {
      return JSON.stringify([
        { hasFace: false, handsAvg: 0, handNearPct: 0, faceMoveAvg: 0, handsMoveAvg: 0, blinksPerMin: 0 },
        { hasFace: true, handsAvg: 2, handNearPct: 0.2, faceMoveAvg: 0.1, handsMoveAvg: 0.1, blinksPerMin: 8 },
      ]);
    },
  };

  const snapshot = readLatestLocalVisionSnapshot(storage);
  assert.equal(snapshot?.faceDetected, true);
  assert.equal(snapshot?.handsAvg, 2);
  assert.equal(snapshot?.blinksPerMin, 8);
  assert.equal(snapshot?.movement, 0.2);
});
