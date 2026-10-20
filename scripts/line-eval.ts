/**
 * Voice-line brain evaluation without voice.
 *
 *   npm run line:eval                    # scripted model, in process (same as CI): the invariants
 *   npm run line:eval -- --live          # the deployed brain with Claude:
 *                                        #   LINE_BRAIN_URL=https://neuroljus.com/api/line/brain
 *                                        #   LINE_API_SECRET=...
 *   npm run line:eval -- --live --judge  # plus a second model judging every call against
 *                                        # scenarios.ts `must` (ANTHROPIC_API_KEY)
 *   npm run line:eval -- --claude --judge  # the same brain in process with the real Claude,
 *                                        # no deployment or secret needed (ANTHROPIC_API_KEY)
 *
 * The invariants are the few things code guarantees: an answer, plain speech,
 * the number first when the caller asks whom to call, no source named with
 * nothing to cite, time to the first sentence, and a fallback that never
 * recites protocol steps. Whether the line answered the scene with clinical
 * sense is what the judge measures. Exits 1 when anything fails.
 */

import { brainTurnText, fallbackSpeech } from "../src/lib/line/brain";
import { getAnthropicModel } from "../src/lib/careReflection/provider";
import type { ChatMessage } from "../src/lib/line/state";
import { checkTurn } from "./line-eval/checks";
import { judgeCall } from "./line-eval/judge";
import { mockModelStream } from "./line-eval/mockModel";
import { SCENARIOS, type Scenario } from "./line-eval/scenarios";

const LIVE = process.argv.includes("--live");
/** In-process brain with the real Claude (ANTHROPIC_API_KEY): the same code as production, without the deployment. */
const CLAUDE = process.argv.includes("--claude");
const JUDGE = process.argv.includes("--judge");
const BASE = (process.env.LINE_BRAIN_URL || "").replace(/\/$/, "");
const SECRET = process.env.LINE_API_SECRET || "";
const REAL = LIVE || CLAUDE;
/** Live: the deployed brain should start speaking within 1.5 s. In process with the real Claude there is no warm instance, so 3 s. */
const FIRST_BUDGET_MS = Number(process.env.LINE_EVAL_FIRST_MS || (LIVE ? 1500 : CLAUDE ? 3000 : 900));

type TurnOut = { text: string; firstMs: number; totalMs: number; docs: number; source?: string; fallbackText?: string };

async function liveTurn(messages: ChatMessage[]): Promise<TurnOut> {
  const t0 = performance.now();
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-line-secret": SECRET },
    body: JSON.stringify({ model: "neuroljus-line", stream: true, messages }),
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  let firstMs = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 2);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      const delta = JSON.parse(data).choices?.[0]?.delta?.content;
      if (delta) {
        if (!firstMs) firstMs = Math.round(performance.now() - t0);
        text += delta;
      }
    }
  }
  return { text: text.trim(), firstMs, totalMs: Math.round(performance.now() - t0), docs: -1 };
}

async function mockTurn(messages: ChatMessage[]): Promise<TurnOut> {
  const r = await brainTurnText({ messages, apiKey: null, model: getAnthropicModel(), modelStream: mockModelStream, noWeb: true, log: () => undefined });
  return { text: r.sentences.join(" "), firstMs: r.firstSentenceMs, totalMs: r.totalMs, docs: r.retrieval.docs.length, source: r.source, fallbackText: fallbackSpeech(r.state) };
}

async function claudeTurn(messages: ChatMessage[]): Promise<TurnOut> {
  const r = await brainTurnText({ messages, apiKey: process.env.ANTHROPIC_API_KEY || null, model: getAnthropicModel(), log: () => undefined });
  return { text: r.sentences.join(" "), firstMs: r.firstSentenceMs, totalMs: r.totalMs, docs: r.retrieval.docs.length, source: r.source, fallbackText: fallbackSpeech(r.state) };
}

export async function runScenario(s: Scenario, turnFn: (m: ChatMessage[]) => Promise<TurnOut>): Promise<{ failures: string[]; lines: string[]; assistant: string[] }> {
  const messages: ChatMessage[] = [];
  const failures: string[] = [];
  const lines: string[] = [];
  const assistant: string[] = [];
  for (let i = 0; i < s.turns.length; i++) {
    messages.push({ role: "user", content: s.turns[i] });
    const out = await turnFn(messages);
    const problems = checkTurn({
      text: out.text,
      asksWhomToCall: s.expect.whomTurns?.includes(i) ?? false,
      sourceAllowed: REAL || out.docs > 0,
      firstSentenceMs: out.firstMs,
      firstSentenceBudgetMs: FIRST_BUDGET_MS,
    });
    if (out.source?.startsWith("fallback") && out.fallbackText && !out.text.endsWith(out.fallbackText)) problems.push("fallback spoke something other than the honest line");
    lines.push(`  t${i + 1} ${out.firstMs}ms/${out.totalMs}ms${out.source ? ` ${out.source}` : ""} | ${out.text}`);
    for (const p of problems) failures.push(`${s.id} t${i + 1}: ${p}`);
    messages.push({ role: "assistant", content: out.text });
    assistant.push(out.text);
  }
  return { failures, lines, assistant };
}

async function main() {
  if (LIVE && (!BASE || !SECRET)) {
    console.error("--live needs LINE_BRAIN_URL and LINE_API_SECRET");
    process.exit(2);
  }
  const judgeKey = process.env.ANTHROPIC_API_KEY || "";
  if (CLAUDE && !judgeKey) {
    console.error("--claude needs ANTHROPIC_API_KEY");
    process.exit(2);
  }
  if (JUDGE && (!REAL || !judgeKey)) {
    console.error("--judge needs --live or --claude, and ANTHROPIC_API_KEY");
    process.exit(2);
  }
  const turnFn = LIVE ? liveTurn : CLAUDE ? claudeTurn : mockTurn;
  let failed = 0;
  let judged = 0;
  let passed = 0;
  for (const s of SCENARIOS) {
    const { failures, lines, assistant } = await runScenario(s, turnFn);
    let verdictLine = "";
    if (JUDGE) {
      const v = await judgeCall(s, assistant, judgeKey, getAnthropicModel());
      judged += 1;
      if (v.pass) passed += 1;
      else failures.push(`${s.id}: judge ${v.score}/10: ${v.reasons[0] ?? ""}`);
      verdictLine = `  judge ${v.pass ? "pass" : "FAIL"} ${v.score}/10\n${v.reasons.map((r) => `    · ${r}`).join("\n")}`;
    }
    console.log(`\n${failures.length ? "FAIL" : "ok  "} ${s.id} (${s.lang})`);
    for (const l of lines) console.log(l);
    if (verdictLine) console.log(verdictLine);
    for (const f of failures) console.log(`  ✗ ${f}`);
    failed += failures.length;
  }
  const judgeNote = JUDGE ? ` · judge ${passed}/${judged} calls pass` : "";
  console.log(`\n${failed === 0 ? "All scenarios pass" : `${failed} problem(s)`} · mode: ${LIVE ? "live" : CLAUDE ? "Claude in process" : "scripted model"}${judgeNote} · first-sentence budget ${FIRST_BUDGET_MS} ms`);
  process.exit(failed === 0 ? 0 : 1);
}

if (process.argv[1]?.endsWith("line-eval.ts")) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
