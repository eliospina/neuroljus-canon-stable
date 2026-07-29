import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildScientificReading,
  formatScientificSimulation,
} from "../src/lib/nlVision/scientificReflection";

test("buildScientificReading marks empty metrics as unusable", () => {
  const reading = buildScientificReading({}, "en");
  assert.equal(reading.usable, false);
  assert.match(formatScientificSimulation({}, "en"), /No usable visual signal/i);
});

test("buildScientificReading bands elevated hand-near and movement scientifically", () => {
  const reading = buildScientificReading(
    {
      hasFace: true,
      handsAvg: 1.2,
      handNearPct: 0.55,
      faceMoveAvg: 0.03,
      handsMoveAvg: 0.04,
      blinksPerMin: 28,
      earAvg: 0.22,
      mouthOpenAvg: 0.1,
    },
    "es"
  );
  assert.equal(reading.usable, true);
  assert.equal(reading.handNearBand, "elevated");
  assert.equal(reading.movementBand, "elevated");
  assert.equal(reading.blinkBand, "elevated");
  const text = formatScientificSimulation(
    {
      hasFace: true,
      handsAvg: 1.2,
      handNearPct: 0.55,
      faceMoveAvg: 0.03,
      handsMoveAvg: 0.04,
      blinksPerMin: 28,
      earAvg: 0.22,
      mouthOpenAvg: 0.1,
    },
    "es"
  );
  assert.match(text, /Simulación científica/i);
  assert.match(text, /elevada/i);
  assert.doesNotMatch(text, /dolor detectado|emoción:|diagnóstico confirmado/i);
});

test("scientific simulation never claims emotion or pain certainty", () => {
  for (const lang of ["sv", "en", "es"] as const) {
    const text = formatScientificSimulation(
      {
        hasFace: true,
        handsAvg: 1,
        handNearPct: 0.4,
        faceMoveAvg: 0.01,
        handsMoveAvg: 0.01,
        blinksPerMin: 12,
        earAvg: 0.25,
        mouthOpenAvg: 0.05,
      },
      lang
    );
    assert.doesNotMatch(text, /\b(happy|angry|sad|pain detected|detectó dolor)\b/i);
  }
});
