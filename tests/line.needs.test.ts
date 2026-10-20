import assert from "node:assert/strict";
import test from "node:test";
import { auditTurn, cleanTag, parseAudit } from "../src/lib/line/needs";
import { needsReport, parseNeedsLines } from "../scripts/line-needs";

test("needs: the audit logs tags only, never the words of the call; the model's output is cleaned and bounded", async () => {
  const lines: string[] = [];
  const audit = await auditTurn({
    userText: "Mi hijo Mateo de 7 años se tomó seis pastillas de clorazepato, estamos en Perú",
    assistantText: "El clorazepato es una benzodiacepina. Vigila que respire normal. El número de emergencias es el 106.",
    docsOffered: [{ id: "pmc:123", title: "Benzodiazepine overdose in adolescents" }, { id: "pmc:456", title: "Sleep in autism" }],
    lang: "es",
    country: "PE",
    caller: "caregiver",
    turn: 2,
    apiKey: null,
    log: (l) => lines.push(l),
    audit: async () => parseAudit('{"topics":["Benzodiazepine overdose","Mateo 7 years","kitchen medication safety"],"answerSource":["memory","library","nonsense"],"libraryUsed":["pmc:123","pmc:999"],"gaps":["clorazepate overdose signs by weight 20kg"]}', ["pmc:123", "pmc:456"]),
  });
  assert.ok(audit);
  assert.deepEqual(audit!.topics, ["benzodiazepine overdose", "mateo years", "kitchen medication safety"]);
  assert.deepEqual(audit!.answerSource, ["memory", "library"]);
  assert.deepEqual(audit!.libraryUsed, ["pmc:123"], "only documents that were offered");
  assert.deepEqual(audit!.gaps, ["clorazepate overdose signs by weight kg"]);
  assert.equal(lines.length, 1);
  const entry = JSON.parse(lines[0]);
  assert.equal(entry.event, "line_needs");
  assert.equal(entry.country, "PE");
  assert.deepEqual(entry.libraryOffered, ["pmc:123", "pmc:456"]);
  assert.doesNotMatch(lines[0], /clorazepato|pastillas|respire|106|\b7\b/, "no words of the call in the log");

  // Nothing to audit without a model or on tiny turns; errors are logged by class only.
  assert.equal(await auditTurn({ userText: "ya", assistantText: "Bien.", docsOffered: [], lang: "es", country: null, caller: "unknown", turn: 1, apiKey: "k", audit: async () => { throw new Error("boom"); }, log: () => undefined }), null);
  const errLines: string[] = [];
  assert.equal(await auditTurn({ userText: "Mi hijo se golpea la cabeza y no para", assistantText: "Pon un cojín.", docsOffered: [], lang: "es", country: null, caller: "caregiver", turn: 1, apiKey: "k", audit: async () => { throw new Error("secret text"); }, log: (l) => errLines.push(l) }), null);
  assert.match(errLines[0], /line_needs_error/);
  assert.doesNotMatch(errLines[0], /secret text/);

  assert.equal(cleanTag("  Night Elopement 3am, juan@mail.com "), "night elopement am,");
  assert.equal(cleanTag("ok"), null);
  assert.deepEqual(parseAudit("no json here", []), { topics: [], answerSource: [], libraryUsed: [], gaps: [] });
});

test("needs: the report aggregates topics, sources, library use and gaps from plain or Vercel-wrapped log lines", () => {
  const a = JSON.stringify({ event: "line_needs", lang: "es", country: "PE", caller: "caregiver", topics: ["benzodiazepine overdose"], answerSource: ["memory"], libraryOffered: ["pmc:1"], libraryUsed: [], gaps: ["clorazepate overdose signs"] });
  const b = JSON.stringify({ event: "line_needs", lang: "es", country: "CO", caller: "caregiver", topics: ["pica", "button battery"], answerSource: ["library", "protocol"], libraryOffered: ["pmc:2"], libraryUsed: ["pmc:2"], gaps: [] });
  const wrapped = JSON.stringify({ timestamp: 1, level: "info", message: a });
  const text = [a, wrapped, b, '{"event":"line_brain_turn","source":"model"}', "not json"].join("\n");
  const records = parseNeedsLines(text);
  assert.equal(records.length, 3);
  const report = needsReport(records);
  assert.match(report, /3 turns audited/);
  assert.match(report, /library: offered in 3 turns, used in 1/);
  assert.match(report, /2  benzodiazepine overdose/);
  assert.match(report, /2  clorazepate overdose signs/);
  assert.match(report, /1  pmc:2/);
  assert.equal(needsReport([]), "No line_needs records found.");
});
