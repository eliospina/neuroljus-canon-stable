import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatIncidentExportJson,
  formatIncidentExportText,
  type SeriousIncident,
} from "../src/lib/careIncidents/localStore";

const sample: SeriousIncident = {
  id: "inc_test",
  createdAt: "2026-07-29T12:00:00.000Z",
  kind: "neglect",
  jurisdiction: "Sweden",
  whenApprox: "Afternoon shift",
  setting: "Common room floor soiled",
  whoWhat: "Staff did not clean; person ate from the floor",
  othersPresent: "Two staff present",
  personAfter: "Continued eating from floor",
  protectionActs: "Interrupted, cleaned, documented, escalated",
  speechCycles: "Yo te quiero mucho",
  uncertainty: "Cannot know inner meaning of the phrase",
  reporting: "Escalation noted locally",
};

test("serious incident text export names witness limits and reporting path", () => {
  const text = formatIncidentExportText(sample, "en");
  assert.ok(text.includes("Witness notes (internal)"));
  assert.ok(text.includes("does not detect violence via camera"));
  assert.ok(text.includes("Yo te quiero mucho"));
  assert.ok(text.includes("reporting_adapters=off") || text.includes("adapters stay off"));
  assert.ok(text.includes("neuroljus.witness_notes.v0"));
});

test("serious incident JSON export keeps reporting adapters off", () => {
  const parsed = JSON.parse(formatIncidentExportJson(sample));
  assert.equal(parsed.envelope, "neuroljus.witness_notes.v0");
  assert.equal(parsed.camera_abuse_detection, false);
  assert.equal(parsed.reporting_adapters_enabled, false);
  assert.equal(parsed.ai_report_draft_enabled, false);
  assert.equal(parsed.auto_alert_enabled, false);
  assert.equal(parsed.incident.kind, "neglect");
});

test("Spanish export keeps internal witness framing", () => {
  const text = formatIncidentExportText(sample, "es");
  assert.ok(text.includes("interno") || text.includes("Interno") || text.includes("testimonio"));
  assert.ok(text.includes("no detecta violencia por cámara"));
});
