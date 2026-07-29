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
  whenApprox: "Afternoon shift",
  setting: "Common room floor soiled",
  whoWhat: "Staff did not clean; person ate from the floor",
  othersPresent: "Two staff present",
  personAfter: "Continued eating from floor",
  protectionActs: "Interrupted, cleaned, documented, escalated",
  speechCycles: "Yo te quiero mucho",
  uncertainty: "Cannot know inner meaning of the phrase",
  reporting: "Planning Lex Sarah and IVO letter",
};

test("serious incident text export names witness limits and reporting path", () => {
  const text = formatIncidentExportText(sample, "en");
  assert.ok(text.includes("authorized local witness"));
  assert.ok(text.includes("does not detect violence via camera"));
  assert.ok(text.includes("Lex Sarah"));
  assert.ok(text.includes("Yo te quiero mucho"));
  assert.ok(text.includes("neuroljus.serious_incident.v0"));
  assert.ok(text.includes("authorized") || text.includes("obligated"));
});

test("serious incident JSON export refuses camera abuse detection claims", () => {
  const parsed = JSON.parse(formatIncidentExportJson(sample));
  assert.equal(parsed.envelope, "neuroljus.serious_incident.v0");
  assert.equal(parsed.camera_abuse_detection, false);
  assert.equal(parsed.replaces_lex_sarah_or_ivo_as_institution, false);
  assert.equal(parsed.intended_for_authorized_witness_under_reporting_duty, true);
  assert.equal(parsed.incident.kind, "neglect");
});

test("Spanish export keeps authorized-witness framing", () => {
  const text = formatIncidentExportText(sample, "es");
  assert.ok(text.includes("testimonio local autorizado") || text.includes("autorizada"));
  assert.ok(text.includes("no detecta violencia por cámara"));
});
