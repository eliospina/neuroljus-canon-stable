import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ask,
  buildAskSystemPrompt,
  documentText,
  fallbackSegments,
  localSearchTerms,
  parseAnswer,
  personSegments,
  retrieve,
  toSources,
} from "../src/lib/ask/expert";

function claudeJson(json: unknown) {
  return new Response(JSON.stringify({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(json) }] }), { status: 200 });
}

function answerPayload(blocks: Array<{ text: string; cite?: number }>) {
  return {
    stop_reason: "end_turn",
    content: blocks.map((b) => ({
      type: "text",
      text: b.text,
      citations: b.cite === undefined ? null : [{ type: "char_location", document_index: b.cite, cited_text: "x" }],
    })),
  };
}

function claudeAnswer(blocks: Array<{ text: string; cite?: number }>) {
  return new Response(JSON.stringify(answerPayload(blocks)), { status: 200 });
}

test("local search terms map es/en/sv day-to-day words to English library terms", () => {
  assert.match(localSearchTerms("Leo no duerme y grita por la noche"), /sleep/);
  assert.match(localSearchTerms("Hur förbereder jag Elias för tandläkaren?"), /dental/);
  assert.match(localSearchTerms("She covers her ears in the supermarket"), /sensory/);
  assert.equal(localSearchTerms("xyz"), "xyz");
});

test("retrieval returns library documents with sources numbered from 1", () => {
  const docs = retrieve("sleep insomnia bedtime autism", ["sleep"]);
  assert.ok(docs.length >= 4);
  const sources = toSources(docs);
  assert.equal(sources[0].n, 1);
  assert.ok(sources.every((s) => s.doi && s.url.startsWith("https://")));
  assert.ok(documentText(docs[0]).includes(docs[0].title));
});

test("parseAnswer labels paragraphs, attaches citations by span, and fixes mismatched tags", () => {
  const payload = answerPayload([
    { text: "[PRACTICE] Dim the lights before the routine.\n\n[SCIENCE] " },
    { text: "Sleep problems are common in autistic children.", cite: 2 },
    { text: "\n\n[SCIENCE] No study here really.\n\n[IDEA] Try a sound cue that marks the end of play.\n\nUntagged line with a citation " },
    { text: "from study one.", cite: 0 },
  ]);
  const segs = parseAnswer(payload, 3);
  assert.deepEqual(
    segs.map((s) => [s.label, s.sources]),
    [
      ["practice", []],
      ["science", [3]],
      ["practice", []], // claimed science without a citation → practice
      ["idea", []],
      ["science", [1]], // untagged but cited → science
    ]
  );
  assert.equal(segs[1].text, "Sleep problems are common in autistic children.");
});

test("data from this person is computed by code with counts, never by the model", () => {
  const segs = personSegments([{ scenario: "sensory_overload", commands: ["reduce_sound", "lower_light"], helped: 3, rated: 4 }], "es");
  assert.equal(segs.length, 1);
  assert.equal(segs[0].label, "person");
  assert.match(segs[0].text, /3 de 4/);
  assert.match(segs[0].text, /suavizar el sonido → bajar la luz/);
  assert.match(buildAskSystemPrompt("es", true), /\[PERSON\]/);
  assert.doesNotMatch(buildAskSystemPrompt("es", false), /\[PERSON\]/);
});

test("ask: emergency wording comes first, Claude answer is labelled, person data appended", async () => {
  const calls: any[] = [];
  const fetchImpl = (async (_url: any, init: any) => {
    const body = JSON.parse(init.body);
    calls.push(body);
    if (body.output_config?.format) return claudeJson({ terms: ["self-injury", "de-escalation"], topics: ["crisis_regulation"] });
    return claudeAnswer([{ text: "[PRACTICE] Reduce demands and give space.\n\n[SCIENCE] " }, { text: "Stimming is self-regulation.", cite: 0 }]);
  }) as typeof fetch;

  const r = await ask({
    question: "Mi hijo se golpea la cabeza contra la pared",
    lang: "es",
    apiKey: "k",
    model: "m",
    fetchImpl,
    helpfulRoutines: [{ scenario: "sensory_overload", commands: ["step_back"], helped: 2, rated: 2, name: "Leo" }],
  });
  assert.equal(r.emergency, true);
  assert.equal(r.source, "claude");
  assert.equal(r.segments[0].label, "safety");
  assert.match(r.segments[0].text, /112/);
  assert.ok(r.segments.some((s) => s.label === "science" && s.sources.length === 1));
  assert.equal(r.segments[r.segments.length - 1].label, "person");
  assert.doesNotMatch(JSON.stringify(calls), /Leo/, "names never reach the model");
  // documents carry citations enabled; no structured output on the answer call
  const answerCall = calls[1];
  assert.ok(answerCall.messages[0].content.some((c: any) => c.type === "document" && c.citations?.enabled));
  assert.equal(answerCall.output_config.format, undefined);
});

test("ask: without Claude the library still answers, with a notice", async () => {
  const r = await ask({ question: "How do I prepare Mia for the dentist?", lang: "en", apiKey: null, model: "m" });
  assert.equal(r.source, "fallback");
  assert.ok(r.notice);
  assert.ok(r.segments.length >= 1);
  assert.ok(r.segments.every((s) => s.label === "science" && s.sources.length === 1));
  assert.deepEqual(fallbackSegments([], "sv"), []);
});
