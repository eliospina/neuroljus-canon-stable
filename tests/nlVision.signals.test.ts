import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aggregateSamples,
  computeEAR,
  computeMouthOpen,
  dist,
  isHandNearFace,
} from "../src/lib/nlVision/signals";

test("dist and near-face threshold", () => {
  assert.equal(dist({ x: 0, y: 0 }, { x: 0.3, y: 0.4 }), 0.5);
  assert.equal(isHandNearFace({ x: 0.5, y: 0.5 }, { x: 0.55, y: 0.55 }, undefined), true);
  assert.equal(isHandNearFace({ x: 0.5, y: 0.5 }, { x: 0.9, y: 0.9 }, undefined), false);
});

test("EAR and mouth require enough landmarks", () => {
  assert.equal(computeEAR([]), undefined);
  assert.equal(computeMouthOpen([]), undefined);
  const landmarks = Array.from({ length: 400 }, (_, i) => ({ x: i * 0.001, y: i * 0.001 }));
  landmarks[159] = { x: 0.1, y: 0.1 };
  landmarks[145] = { x: 0.1, y: 0.12 };
  landmarks[33] = { x: 0.08, y: 0.11 };
  landmarks[133] = { x: 0.12, y: 0.11 };
  landmarks[386] = { x: 0.2, y: 0.1 };
  landmarks[374] = { x: 0.2, y: 0.12 };
  landmarks[362] = { x: 0.18, y: 0.11 };
  landmarks[263] = { x: 0.22, y: 0.11 };
  landmarks[13] = { x: 0.15, y: 0.2 };
  landmarks[14] = { x: 0.15, y: 0.25 };
  landmarks[61] = { x: 0.1, y: 0.22 };
  landmarks[291] = { x: 0.2, y: 0.22 };
  assert.ok((computeEAR(landmarks) ?? 0) > 0);
  assert.ok((computeMouthOpen(landmarks) ?? 0) > 0);
});

test("aggregateSamples preserves bridge-compatible fields", () => {
  const row = aggregateSamples(
    [
      {
        t: 1,
        hasFace: true,
        leftHand: true,
        rightHand: false,
        handsCount: 1,
        faceMove: 0.01,
        handsMove: 0.02,
        handNearFace: true,
        ear: 0.3,
        mouthOpen: 0.2,
      },
    ],
    1000,
    8
  );
  assert.equal(row?.engine, "tasks_vision_v2");
  assert.equal(row?.hasFace, true);
  assert.equal(row?.blinksPerMin, 8);
  assert.equal(row?.handNearPct, 1);
});
