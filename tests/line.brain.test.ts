import assert from "node:assert/strict";
import test from "node:test";
import { deriveCallState, detectCaller, detectCountry, detectLang, stepWasGiven } from "../src/lib/line/state";
import { answersNoSevere, firstAidFor, severeSignals } from "../src/lib/line/triage";
import { SpeechGuard, judgeSentence } from "../src/lib/line/guard";
import { anonymize, brainTurnText, conversationKey, dynamicBlock, fallbackSpeech, staticBlock, toClaudeMessages } from "../src/lib/line/brain";
import { retrieveWithBudget } from "../src/lib/line/retrieval";
import { resourcesFor, RESOURCES } from "../src/lib/line/resources";
import { brainHandler, parseChatRequest } from "../src/lib/line/brainHttp";
import { mockModelStream } from "../scripts/line-eval/mockModel";
import { SCENARIOS } from "../scripts/line-eval/scenarios";
import { checkTurn, SOURCE_WORDS } from "../scripts/line-eval/checks";
import { mockReq, SECRET } from "./helpers/lineHttp";
import type { ChatMessage } from "../src/lib/line/state";

// ---------------------------------------------------------------- triage

test("triage: only real severe signals count", () => {
  for (const t of [
    "Mi hijo se sigue golpeando la cabeza con la mano",
    "Hay un poco de sangre en el labio pero ya casi para",
    "He keeps hitting himself and screaming",
    "Han slår sig själv och gråter",
    "Se tapa los oídos y grita en el supermercado",
  ]) assert.equal(severeSignals(t).severe, false, `not severe: ${t}`);
  const severe: Array<[string, string]> = [
    ["Se golpeó la cabeza y ahora vomitó", "head_blow_with_vomiting_or_confusion"],
    ["Sangra y no para aunque apriete", "bleeding_not_stopping"],
    ["Está inconsciente, no se despierta", "unconscious"],
    ["Le cuesta respirar y tiene los labios azules", "breathing"],
    ["Se tragó una pila", "swallowed"],
    ["Tiene una convulsión", "seizure"],
    ["Dice que se quiere morir", "suicidal"],
    ["She said she wants to die tonight", "suicidal"],
    ["He hit his head and now he's vomiting", "head_blow_with_vomiting_or_confusion"],
    ["The bleeding won't stop", "bleeding_not_stopping"],
    ["Han andas inte ordentligt", "breathing"],
    ["Hon säger att hon vill dö", "suicidal"],
    ["Tiene un cuchillo en la mano", "weapon"],
    ["Se dio un golpe en el ojo y sangra el ojo", "eye_injury"],
  ];
  for (const [t, sig] of severe) {
    const r = severeSignals(t);
    assert.ok(r.severe && r.signals.includes(sig as never), `${t} → ${sig} (got ${r.signals.join(",")})`);
  }
  assert.deepEqual(firstAidFor("Se golpeó la cabeza contra la pared y tiene un corte"), ["cut", "head_blow"]);
  assert.deepEqual(firstAidFor("Tiene un chichón"), ["bump"]);
  assert.equal(answersNoSevere("No, nada de eso"), true);
  assert.equal(answersNoSevere("No, pero vomitó después del golpe en la cabeza"), false);
});

// ---------------------------------------------------------------- state

test("state: language, country, caller, phase and steps given are derived from the transcript", () => {
  assert.equal(detectLang("Mi hijo se golpea y no sé qué hacer"), "es");
  assert.equal(detectLang("My son is hitting himself and I don't know what to do"), "en");
  assert.equal(detectLang("Min son slår sig själv och jag vet inte vad jag ska göra"), "sv");
  assert.equal(detectCountry(["Estamos en Colombia", "ahora en Bogotá"]), "CO");
  assert.equal(detectCountry(["We live in the UK"]), "GB");
  assert.equal(detectCountry(["Vi bor i Sverige"]), "SE");
  assert.equal(detectCountry(["nada de país"]), null);
  assert.equal(detectCaller(["Mi hijo se golpea la cabeza"]), "caregiver");
  assert.equal(detectCaller(["Soy autista y no puedo hablar ahora"]), "person");
  assert.equal(detectCaller(["hola"]), "unknown");

  const steps = ["Pon algo blando entre la cabeza y la superficie: un cojín, tu mano abierta, una manta doblada."];
  assert.equal(stepWasGiven(steps[0], ["Pon algo blando entre su cabeza y la superficie, como un cojín o una manta doblada."]), true);
  assert.equal(stepWasGiven(steps[0], ["Retira la demanda y baja el ruido."]), false);

  const msgs: ChatMessage[] = [
    { role: "system", content: "ignored agent prompt" },
    { role: "user", content: "Mi hijo se golpea la cabeza con la mano y no para. Estamos en México." },
    { role: "assistant", content: "¿Hay alguna señal grave: pérdida de conciencia, sangre que no para con presión, vómitos o confusión tras un golpe en la cabeza, dificultad para respirar, lesión en un ojo, algo tragado, o ha dicho que se quiere morir? Pon algo blando entre la cabeza y la superficie, un cojín o una manta doblada." },
    { role: "user", content: "No, nada de eso. Ya paró de golpearse, está más tranquilo." },
  ];
  const s = deriveCallState(msgs);
  assert.equal(s.lang, "es");
  assert.equal(s.country, "MX");
  assert.equal(s.caller, "caregiver");
  assert.equal(s.protocol, "self_injury");
  assert.equal(s.severe, false);
  assert.equal(s.triageAsked, true);
  assert.equal(s.triageClear, true);
  assert.equal(s.phase, "descent");
  assert.ok(s.stepsGiven.includes("peak.0"), `peak.0 given: ${s.stepsGiven.join(",")}`);
  assert.equal(s.turn, 2);
  // The same transcript always gives the same state.
  assert.deepEqual(deriveCallState(msgs), s);
});

// ---------------------------------------------------------------- guard

test("guard: emergency only when severe, no filler, no repeat, no medication, sentence cap, tags stripped", () => {
  const base = { lang: "es" as const, severe: false, previous: ["Retira la demanda y baja el ruido."], maxSentences: 4 };
  const said = new Set<string>();
  assert.equal(judgeSentence("Si hay peligro, llama al 112.", base, 0, said).reason, "emergency");
  assert.equal(judgeSentence("Si hay peligro, llama al 112.", { ...base, severe: true }, 0, said).keep, true);
  assert.equal(judgeSentence("Lo siento mucho, debe ser agotador.", base, 0, said).reason, "filler");
  assert.equal(judgeSentence("Retira la demanda y baja el ruido.", base, 0, said).reason, "repeat");
  assert.equal(judgeSentence("Dale melatonina para dormir.", base, 0, said).reason, "medication");
  assert.equal(judgeSentence("Tu hijo es autista.", base, 0, said).reason, "diagnosis");
  assert.equal(judgeSentence("Pon un cojín entre su cabeza y la pared.", base, 4, said).reason, "limit");

  const g = new SpeechGuard(base);
  const out = [...g.push("[slow] Pon algo blando bajo su cabeza. Lo siento mucho. Llama a emerg"), ...g.push("encias ahora. Espera en silencio a distancia. Dime qué pasa ahora."), ...g.flush()];
  assert.deepEqual(out, ["Pon algo blando bajo su cabeza.", "Espera en silencio a distancia.", "Dime qué pasa ahora."]);
  assert.deepEqual(g.dropped.map((d) => d.reason), ["filler", "emergency"]);
  // Sentences stream as soon as they are complete: the first one came out of the first push.
  const g2 = new SpeechGuard(base);
  assert.deepEqual(g2.push("Primera frase completa. Segunda a medi"), ["Primera frase completa."]);
});

// ---------------------------------------------------------------- brain pieces

test("brain: static block is per language and stable; dynamic block carries triage and steps; fallback speaks the protocol", () => {
  assert.equal(staticBlock("es"), staticBlock("es"));
  assert.notEqual(staticBlock("es"), staticBlock("sv"));
  assert.ok(staticBlock("en").includes('"id":"self_injury"'));
  assert.ok(staticBlock("en").length > 20_000, "the ten protocols are in the prompt");

  const s = deriveCallState([{ role: "user", content: "Mi hijo se golpea la cabeza y le sale sangre que no para. Estamos en España." }]);
  const dyn = dynamicBlock(s, { docs: [], ms: 3, timedOut: false }, null);
  assert.match(dyn, /SEVERE SIGNAL present \(bleeding_not_stopping\)/);
  assert.match(dyn, /llama al 112/);
  assert.match(dyn, /protocol: 4 Autolesión/);
  const fb = fallbackSpeech(s);
  assert.match(fb, /^Si hay peligro, llama al 112\./);

  const calm = deriveCallState([{ role: "user", content: "Mi hijo se golpea la cabeza con la mano" }]);
  const dynCalm = dynamicBlock(calm, { docs: [], ms: 3, timedOut: false }, null);
  assert.match(dynCalm, /NEVER mention emergencies/);
  assert.match(dynCalm, /triage: NOT asked yet/);
  assert.doesNotMatch(fallbackSpeech(calm), /112|emergencias/);

  assert.deepEqual(toClaudeMessages([{ role: "system", content: "x" }, { role: "assistant", content: "hola" }, { role: "user", content: "a" }, { role: "user", content: "b" }]), [{ role: "user", content: "a\nb" }]);
  assert.equal(conversationKey([{ role: "user", content: "hola" }], undefined), conversationKey([{ role: "user", content: "hola" }, { role: "assistant", content: "x" }], undefined));
  assert.equal(conversationKey([], { conversation_id: "conv_1" }), "conv_1");
  assert.equal(anonymize("Mi hijo Mateo tiene 7 años, escribe a juan@mail.com"), "Mi hijo [nombre] tiene # años, escribe a [email]");
});

test("retrieval: within budget on a warm index and never throws", async () => {
  const r = await retrieveWithBudget("Mi hijo se golpea la cabeza y no para", []);
  assert.equal(r.timedOut, false);
  assert.ok(r.docs.length > 0);
  assert.ok(r.ms < 800, `retrieval ${r.ms} ms`);
  const empty = await retrieveWithBudget("", []);
  assert.equal(empty.timedOut, false);
});

test("resources: nine countries, honest fallback elsewhere, every entry has a page to verify", () => {
  for (const c of ["SE", "ES", "CO", "MX", "US", "GB", "BR", "CL", "PE"]) assert.ok((RESOURCES[c] ?? []).length > 0, c);
  for (const list of Object.values(RESOURCES)) for (const r of list) assert.match(r.verify, /^https:\/\//);
  assert.match(resourcesFor("SE", "sv")[0], /90101/);
  assert.match(resourcesFor("ZZ", "es")[0], /No tengo una línea de apoyo verificada/);
  assert.match(resourcesFor(null, "en")[0], /I do not have a verified support line/);
});

// ---------------------------------------------------------------- scenarios with the scripted model (same as npm run line:eval)

test("scenarios: every turn passes the rules with the scripted model", async () => {
  const failures: string[] = [];
  for (const s of SCENARIOS) {
    const messages: ChatMessage[] = [];
    let last: Awaited<ReturnType<typeof brainTurnText>> | null = null;
    let hadDocs = false;
    let cited = false;
    for (let i = 0; i < s.turns.length; i++) {
      messages.push({ role: "user", content: s.turns[i] });
      const r = await brainTurnText({ messages, apiKey: null, model: "x", modelStream: mockModelStream, noWeb: true, log: () => undefined });
      last = r;
      const text = r.sentences.join(" ");
      const previous = messages.filter((m) => m.role === "assistant").map((m) => String(m.content));
      const severeAllowed = s.expect.severeFrom !== undefined && i >= s.expect.severeFrom;
      for (const p of checkTurn({ text, previousAssistant: previous, severeAllowed, suicidal: s.expect.suicidal, maxSentences: s.expect.person ? 2 : 4, sourceAllowed: r.retrieval.docs.length > 0 || r.state.protocol !== null, firstSentenceMs: r.firstSentenceMs, firstSentenceBudgetMs: 900 })) failures.push(`${s.id} t${i + 1}: ${p}`);
      if (severeAllowed !== r.state.severe) failures.push(`${s.id} t${i + 1}: severe=${r.state.severe}, expected ${severeAllowed}`);
      // The guard caught the scripted model's deliberate violations.
      assert.ok(r.dropped.some((d) => d.reason === "filler"), `${s.id} t${i + 1}: filler dropped`);
      if (!severeAllowed) assert.ok(r.dropped.some((d) => d.reason === "emergency"), `${s.id} t${i + 1}: emergency leak dropped`);
      if (r.retrieval.docs.length > 0) hadDocs = true;
      if (SOURCE_WORDS.test(text)) cited = true;
      messages.push({ role: "assistant", content: text });
    }
    if (hadDocs && !cited && !s.expect.person) failures.push(`${s.id}: library documents available but no source named in the call`);
    if (s.expect.protocol !== undefined) assert.equal(last!.state.protocol, s.expect.protocol, `${s.id}: protocol`);
    if (s.expect.country) assert.equal(last!.state.country, s.expect.country, `${s.id}: country`);
    if (s.expect.person) assert.equal(last!.state.caller, "person", `${s.id}: caller`);
  }
  assert.deepEqual(failures, []);
});

test("brain: with no model the protocol speaks, with a refusing model the protocol speaks, uncovered cases are logged anonymised", async () => {
  const msgs: ChatMessage[] = [{ role: "user", content: "Mi hijo se golpea la cabeza con la mano y no para" }];
  const r = await brainTurnText({ messages: msgs, apiKey: null, model: "x", noWeb: true });
  assert.equal(r.source, "fallback");
  assert.ok(r.sentences.length >= 1 && r.sentences.length <= 4);
  assert.doesNotMatch(r.sentences.join(" "), /112|emergencias/);

  const refusing = async function* (): AsyncIterable<string> { throw new Error("refusal"); };
  const r2 = await brainTurnText({ messages: msgs, apiKey: null, model: "x", modelStream: () => refusing(), noWeb: true });
  assert.equal(r2.source, "fallback_after_model");
  assert.ok(r2.sentences.length >= 1);

  const lines: string[] = [];
  const r3 = await brainTurnText({ messages: [{ role: "user", content: "Mi hijo Mateo se come tierra y papel todos los días desde hace 3 semanas" }], apiKey: null, model: "x", noWeb: true, log: (l) => lines.push(l) });
  assert.equal(r3.state.protocol, null);
  assert.equal(lines.length, 1);
  const entry = JSON.parse(lines[0]);
  assert.equal(entry.event, "line_uncovered");
  assert.doesNotMatch(entry.situation, /Mateo|3 semanas/);
});

// ---------------------------------------------------------------- HTTP (OpenAI Chat Completions, SSE)

function sseRes() {
  const res: any = { statusCode: 200, headers_: {}, chunks: [] as string[], ended: false, json_: undefined, writableEnded: false };
  res.setHeader = (k: string, v: string) => ((res.headers_[k.toLowerCase()] = v), res);
  res.writeHead = (code: number, headers: Record<string, string>) => ((res.statusCode = code), Object.entries(headers).forEach(([k, v]) => (res.headers_[k.toLowerCase()] = v)), res);
  res.write = (c: string) => (res.chunks.push(c), true);
  res.end = () => ((res.ended = true), (res.writableEnded = true));
  res.status = (c: number) => ((res.statusCode = c), res);
  res.json = (b: unknown) => ((res.json_ = b), (res.writableEnded = true), res);
  return res;
}

test("http: auth by header or bearer, 503 unconfigured, OpenAI-shaped SSE with [DONE], GET keep-warm", async () => {
  const body = { model: "neuroljus-line", stream: true, messages: [{ role: "system", content: "agent prompt" }, { role: "user", content: "Mi hijo se golpea la cabeza con la mano y no para" }] };
  delete process.env.LINE_API_SECRET;
  delete process.env.ANTHROPIC_API_KEY;
  let res = sseRes();
  await brainHandler(mockReq(body), res);
  assert.equal(res.statusCode, 503);

  process.env.LINE_API_SECRET = SECRET;
  res = sseRes();
  await brainHandler(mockReq(body, { secret: null }), res);
  assert.equal(res.statusCode, 401);

  res = sseRes();
  await brainHandler(mockReq(body, { secret: null, headers: { authorization: `Bearer ${SECRET}` } }), res);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers_["content-type"], /text\/event-stream/);
  const data = res.chunks.filter((c: string) => c.startsWith("data: ")).map((c: string) => c.slice(6).trim());
  assert.equal(data[data.length - 1], "[DONE]");
  const parsed = data.slice(0, -1).map((d: string) => JSON.parse(d));
  assert.ok(parsed.every((p: any) => p.object === "chat.completion.chunk" && p.choices[0].index === 0));
  assert.equal(parsed[0].choices[0].delta.role, "assistant");
  const content = parsed.map((p: any) => p.choices[0].delta.content ?? "").join("");
  assert.ok(content.length > 10, content);
  assert.doesNotMatch(content, /112|emergencias/);
  assert.equal(parsed[parsed.length - 1].choices[0].finish_reason, "stop");

  res = sseRes();
  await brainHandler(mockReq({ ...body, stream: false }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.json_.object, "chat.completion");
  assert.ok(res.json_.choices[0].message.content.length > 10);

  res = sseRes();
  await brainHandler(mockReq({ messages: [] }), res);
  assert.equal(res.statusCode, 400);

  process.env.CRON_SECRET = "cron-secret";
  res = sseRes();
  await brainHandler(mockReq(undefined, { method: "GET", secret: null, headers: { authorization: "Bearer cron-secret" } }), res);
  assert.deepEqual(res.json_, { ok: true, warm: true });
  res = sseRes();
  await brainHandler(mockReq(undefined, { method: "GET", secret: null }), res);
  assert.equal(res.statusCode, 401);
  delete process.env.CRON_SECRET;

  assert.equal(parseChatRequest({ messages: "no" }), null);
  assert.equal(parseChatRequest({ messages: [{ role: "user", content: "x" }], elevenlabs_extra_body: { country: "se" } })?.elevenlabs_extra_body?.country, "se");
});
