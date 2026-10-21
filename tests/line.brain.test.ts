import assert from "node:assert/strict";
import test from "node:test";
import { asksWhomToCall, deriveCallState, detectCaller, detectCountry, detectLang } from "../src/lib/line/state";
import { answersNoSevere, firstAidFor, severeSignals } from "../src/lib/line/triage";
import { SpeechGuard } from "../src/lib/line/guard";
import { anonymize, brainTurnText, codeFirstSentence, conversationKey, dynamicBlock, fallbackSpeech, staticBlock, toClaudeMessages, wantsWeb } from "../src/lib/line/brain";
import { retrieveWithBudget } from "../src/lib/line/retrieval";
import { resourcesFor, RESOURCES } from "../src/lib/line/resources";
import { brainHandler, parseChatRequest } from "../src/lib/line/brainHttp";
import { mockModelStream } from "../scripts/line-eval/mockModel";
import { SCENARIOS } from "../scripts/line-eval/scenarios";
import { checkTurn } from "../scripts/line-eval/checks";
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

test("state: language, country, caller and the whom-to-call question are derived from the transcript; nothing else is decided by code", () => {
  assert.equal(detectLang("Mi hijo se golpea y no sé qué hacer"), "es");
  assert.equal(detectLang("My son is hitting himself and I don't know what to do"), "en");
  assert.equal(detectLang("Min son slår sig själv och jag vet inte vad jag ska göra"), "sv");
  assert.equal(detectCountry(["Estamos en Colombia", "ahora en Bogotá"]), "CO");
  assert.equal(detectCountry(["Estoy en Colombia", "no, me equivoqué, estoy es en el Perú"]), "PE", "the last country named wins");
  assert.equal(detectCountry(["We live in the UK"]), "GB");
  assert.equal(detectCountry(["He's walking toward his brother. We're in the US."]), "US");
  assert.equal(detectCountry(["He keeps hitting us and we can't stop him"]), null, "'us' the pronoun is not a country");
  assert.equal(detectCountry(["Vi bor i Sverige"]), "SE");
  assert.equal(detectCountry(["nada de país"]), null);
  assert.equal(detectCaller(["Mi hijo se golpea la cabeza"]), "caregiver");
  assert.equal(detectCaller(["Soy autista y no puedo hablar ahora"]), "person");
  assert.equal(detectCaller(["hola"]), "unknown");
  for (const t of ["¿A quién llamo?", "No me lo sé. Estoy en Colombia. ¿Cuál es el número de emergencia?", "Who do I call?", "Vem ringer jag?"]) assert.equal(asksWhomToCall(t), true, t);
  assert.equal(asksWhomToCall("Se tiró al lago, ¿qué hago?"), false);

  const msgs: ChatMessage[] = [
    { role: "system", content: "ignored agent prompt" },
    { role: "user", content: "Mi hijo se golpea la cabeza con la mano y no para. Estamos en México." },
    { role: "assistant", content: "Pon algo blando entre la cabeza y la superficie, un cojín o una manta doblada." },
    { role: "user", content: "Salió corriendo y se tiró al lago, ¿a quién llamo?" },
  ];
  const s = deriveCallState(msgs);
  assert.equal(s.lang, "es");
  assert.equal(s.country, "MX");
  assert.equal(s.countryAsked, false);
  assert.equal(s.caller, "caregiver");
  assert.equal(s.asksWhomToCall, true);
  assert.equal(s.severe, false);
  assert.equal(s.turn, 2);
  assert.equal("protocol" in s, false, "code no longer chooses a protocol for the model");
  assert.equal("phase" in s, false);
  // The same transcript always gives the same state.
  assert.deepEqual(deriveCallState(msgs), s);
});

// ---------------------------------------------------------------- streamer

test("streamer: drops nothing the model says; strips tags and markdown; streams each sentence as soon as it is complete", () => {
  const g = new SpeechGuard({ lang: "es" });
  const out = [...g.push("[slow] Agárralo y sácalo de la cocina ya. Dale media pastilla si la tiene recetada. El número de emerg"), ...g.push("encias es el 123. **Tu hijo es autista**, y eso no cambia nada ahora. Lo siento mucho."), ...g.flush()];
  assert.deepEqual(out, [
    "Agárralo y sácalo de la cocina ya.",
    "Dale media pastilla si la tiene recetada.",
    "El número de emergencias es el 123.",
    "Tu hijo es autista, y eso no cambia nada ahora.",
    "Lo siento mucho.",
  ]);
  assert.equal(g.count, 5);
  const g2 = new SpeechGuard({ lang: "es" });
  assert.deepEqual(g2.push("Primera frase completa. Segunda a medi"), ["Primera frase completa."]);
  assert.deepEqual(g2.flush(), ["Segunda a medi"]);
});

// ---------------------------------------------------------------- brain pieces

test("brain: the prompt carries the principle and the protocols as knowledge; the facts block carries the number; the fallback is one honest line", () => {
  assert.equal(staticBlock("es"), staticBlock("es"));
  assert.notEqual(staticBlock("es"), staticBlock("sv"));
  assert.match(staticBlock("en"), /THE ONE PRINCIPLE ABOVE EVERYTHING/);
  assert.match(staticBlock("en"), /as knowledge/);
  assert.doesNotMatch(staticBlock("en"), /Never talk about medication|Never diagnose/);
  assert.ok(staticBlock("en").includes('"id":"self_injury"'));
  assert.ok(staticBlock("en").length > 20_000, "the ten protocols are in the prompt");

  const s = deriveCallState([{ role: "user", content: "Mi hijo se golpea la cabeza y le sale sangre que no para. Estamos en España." }]);
  const dyn = dynamicBlock(s, { docs: [], ms: 3, timedOut: false }, null);
  assert.match(dyn, /severe signal in what the caller said \(bleeding_not_stopping\)/);
  assert.match(dyn, /El número de emergencias es el 112\./);
  assert.doesNotMatch(dyn, /protocol:|phase:|steps/i, "no protocol, phase or steps are imposed");
  assert.equal(fallbackSpeech(s), "Te escucho. Dime dónde está ahora y qué está pasando.");

  const unknown = deriveCallState([{ role: "user", content: "Mi hija se cayó y no se despierta" }, { role: "assistant", content: "Mírale la respiración." }, { role: "user", content: "¿A quién llamo?" }]);
  assert.match(dynamicBlock(unknown, { docs: [], ms: 3, timedOut: false }, null), /country is unknown/);
  assert.equal(codeFirstSentence(unknown), "¿En qué país estás? Así te doy el número exacto.");
  const known = deriveCallState([{ role: "user", content: "Mi hijo no se despierta y estoy en Perú. ¿A quién llamo?" }]);
  assert.equal(codeFirstSentence(known), "El número de emergencias es el 106.");
  assert.equal(codeFirstSentence(s), null, "without the question, code says nothing first");

  const docs = { docs: [], ms: 1, timedOut: false };
  assert.equal(wantsWeb(deriveCallState([{ role: "user", content: "Se tomó seis pastillas de risperidona y no hay médico cerca" }]), { ...docs, docs: [{} as never] }), true, "medication: the web is searched even with library documents");
  assert.equal(wantsWeb(deriveCallState([{ role: "user", content: "Mi hijo se come tierra y papel todos los días" }]), docs), true, "nothing in the library: the web is searched");
  assert.equal(wantsWeb(deriveCallState([{ role: "user", content: "ya" }]), docs), false);

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

test("scenarios: every turn keeps the invariants with the scripted model", async () => {
  const failures: string[] = [];
  for (const s of SCENARIOS) {
    const messages: ChatMessage[] = [];
    let last: Awaited<ReturnType<typeof brainTurnText>> | null = null;
    for (let i = 0; i < s.turns.length; i++) {
      messages.push({ role: "user", content: s.turns[i] });
      const r = await brainTurnText({ messages, apiKey: null, model: "x", modelStream: mockModelStream, noWeb: true, log: () => undefined });
      last = r;
      const text = r.sentences.join(" ");
      for (const p of checkTurn({ text, asksWhomToCall: s.expect.whomTurns?.includes(i) ?? false, sourceAllowed: r.retrieval.docs.length > 0, firstSentenceMs: r.firstSentenceMs, firstSentenceBudgetMs: 900 })) failures.push(`${s.id} t${i + 1}: ${p}`);
      // Only scenarios that declare severeFrom assert the signal; the others leave it to the model's judgement.
      if (s.expect.severeFrom !== undefined && i >= s.expect.severeFrom && !r.state.severe) failures.push(`${s.id} t${i + 1}: code found no severe signal`);
      assert.equal(r.source, "model", `${s.id} t${i + 1}: the model spoke`);
      assert.doesNotMatch(text, /\[slow\]|\*\*/, `${s.id} t${i + 1}: tags and markdown stripped`);
      if (s.expect.whomTurns?.includes(i)) assert.match(r.sentences[0], /\d{3}|En qué país/, `${s.id} t${i + 1}: the number or the country question comes first`);
      messages.push({ role: "assistant", content: text });
    }
    if (s.expect.country) assert.equal(last!.state.country, s.expect.country, `${s.id}: country`);
    if (s.expect.person) assert.equal(last!.state.caller, "person", `${s.id}: caller`);
    if (s.expect.uncovered) assert.equal(last!.state.likelyProtocol, null, `${s.id}: uncovered`);
  }
  assert.deepEqual(failures, []);
});

test("brain: with no model or a failing model the line says one honest sentence, never a protocol step; the number first when asked; logs are anonymised", async () => {
  const msgs: ChatMessage[] = [{ role: "user", content: "Mi hijo se golpea la cabeza con la mano y no para" }];
  const lines: string[] = [];
  const r = await brainTurnText({ messages: msgs, apiKey: null, model: "x", noWeb: true, log: (l) => lines.push(l) });
  assert.equal(r.source, "fallback");
  assert.deepEqual(r.sentences, ["Te escucho. Dime dónde está ahora y qué está pasando."]);
  assert.ok(lines.some((l) => JSON.parse(l).event === "line_fallback"), "the fallback is logged");

  // The lake: the model fails, the fallback must not recite the overload steps the call started with.
  const lake: ChatMessage[] = [
    { role: "user", content: "Mi hijo se está golpeando la cabeza y gritando, hay mucho ruido." },
    { role: "assistant", content: "Pon un cojín entre su cabeza y la pared." },
    { role: "user", content: "Se tiró al lago, se lo está llevando la corriente, ¿qué hago?" },
  ];
  const refusing = async function* (): AsyncIterable<string> { throw new Error("refusal"); };
  const r2 = await brainTurnText({ messages: lake, apiKey: null, model: "x", modelStream: () => refusing(), noWeb: true, log: () => undefined });
  assert.equal(r2.source, "fallback_after_model");
  assert.doesNotMatch(r2.sentences.join(" "), /música|luces|pantallas|cojín/);

  // A slow or failed first call is retried once before the fallback; a refusal is not retried.
  let calls = 0;
  const slowThenFine = () => {
    calls += 1;
    if (calls === 1) return (async function* (): AsyncIterable<string> { throw new Error("first_token_timeout"); })();
    return mockModelStream([staticBlock("es"), ""], []);
  };
  const r4 = await brainTurnText({ messages: lake, apiKey: null, model: "x", modelStream: slowThenFine, noWeb: true, log: () => undefined });
  assert.equal(r4.source, "model");
  assert.equal(r4.retried, true);
  assert.equal(calls, 2);
  assert.doesNotMatch(r4.sentences.join(" "), /Te escucho/);
  let refusals = 0;
  const alwaysRefuses = () => { refusals += 1; return refusing(); };
  const r5 = await brainTurnText({ messages: lake, apiKey: null, model: "x", modelStream: alwaysRefuses, noWeb: true, log: () => undefined });
  assert.equal(r5.source, "fallback_after_model");
  assert.equal(refusals, 1, "a refusal is not retried");
  let slow = 0;
  const alwaysSlow = () => { slow += 1; return (async function* (): AsyncIterable<string> { throw new Error("first_token_timeout"); })(); };
  const r6 = await brainTurnText({ messages: lake, apiKey: null, model: "x", modelStream: alwaysSlow, noWeb: true, log: () => undefined });
  assert.equal(r6.source, "fallback_after_model");
  assert.equal(r6.retried, true);
  assert.equal(slow, 2, "a timeout is retried exactly once");

  // "¿A quién llamo?" is answered first, by code, whatever the model says; and the number follows the last country named.
  const whom = await brainTurnText({ messages: [{ role: "user", content: "Estoy en Colombia." }, { role: "assistant", content: "Dime qué pasa." }, { role: "user", content: "No, estoy es en el Perú. ¿A quién llamo?" }], apiKey: null, model: "x", modelStream: mockModelStream, noWeb: true, log: () => undefined });
  assert.equal(whom.state.asksWhomToCall, true);
  assert.equal(whom.sentences[0], "El número de emergencias es el 106.");

  // Unknown country: code asks it first, and the model still speaks after.
  const noCountry = await brainTurnText({ messages: [{ role: "user", content: "Mi hija no se despierta. ¿A quién llamo?" }], apiKey: null, model: "x", modelStream: mockModelStream, noWeb: true, log: () => undefined });
  assert.equal(noCountry.sentences[0], "¿En qué país estás? Así te doy el número exacto.");
  assert.ok(noCountry.sentences.length > 1);

  const lines3: string[] = [];
  const r3 = await brainTurnText({ messages: [{ role: "user", content: "Mi hijo Mateo se come tierra y papel todos los días desde hace 3 semanas" }], apiKey: null, model: "x", modelStream: mockModelStream, noWeb: true, log: (l) => lines3.push(l) });
  assert.equal(r3.state.likelyProtocol, null);
  const entry = JSON.parse(lines3.find((l) => l.includes("line_uncovered"))!);
  assert.equal(entry.situation, undefined, "nothing the caller said is logged");
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
