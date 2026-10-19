/**
 * Practical sheets at scale — Message Batches API (50% of standard price).
 *
 *   npx tsx scripts/library/sheetsBatch.ts sample [--topic challenging_behavior] [--n 5]
 *       Writes N sheets right away (standard API) to data/library/sheet-samples.json
 *       for review. Nothing enters docs.json.
 *   npx tsx scripts/library/sheetsBatch.ts plan
 *       Counts the sheets still to write, per tranche, with an estimated cost.
 *   npx tsx scripts/library/sheetsBatch.ts submit
 *       One batch per tranche for every document with open-licence text and no sheet:
 *       1 aggression / self-injury (meta-analyses, systematic reviews and trials first),
 *       2 crisis_regulation, pain_health, family_caregivers, 3 everything else.
 *   npx tsx scripts/library/sheetsBatch.ts verify
 *       One batch that reads every sheet against its abstract (after the code screen).
 *   npx tsx scripts/library/sheetsBatch.ts collect
 *       Fetches every ended batch, applies sheets and verdicts to docs.json, and
 *       records the real token usage. Re-run until nothing is pending.
 *   npx tsx scripts/library/sheetsBatch.ts review
 *       Writes data/library/sheet-review-list.json: every document whose sheet failed a
 *       check (with the rejected text and the reasons) or has no sheet. Failed sheets
 *       are never published; the owner decides on each one.
 *   npx tsx scripts/library/sheetsBatch.ts cost
 *       Real cost so far, from the usage the API reported.
 *
 * Model: ANTHROPIC_MODEL, default claude-sonnet-5-5. Key: ANTHROPIC_API_KEY or
 * .env.local (never committed). State lives in data/library/batches.json:
 * batch ids, which document each request belongs to, usage and verdicts.
 * Sheets that fail either check are removed and listed, so the next submit
 * writes them again.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { readDocs, writeDocs, type LibraryDoc, type TopicId } from "./lib";
import {
  addUsage,
  emptyUsage,
  localSheetScreen,
  needsHelpLine,
  parseSheet,
  parseVerdict,
  sheetParams,
  sheetUserMessage,
  usageCostUsd,
  verifyParams,
  type UsageTotals,
} from "./sheetPrompt";

const STATE_PATH = path.resolve(process.cwd(), "data/library/batches.json");
const SAMPLES_PATH = path.resolve(process.cwd(), "data/library/sheet-samples.json");
const REVIEW_PATH = path.resolve(process.cwd(), "data/library/sheet-review-list.json");

type BatchKind = "sheets" | "verify";
type BatchRecord = {
  id: string;
  kind: BatchKind;
  tranche: string;
  createdAt: string;
  /** custom_id → document id (custom_id must match ^[a-zA-Z0-9_-]{1,64}$). */
  requests: Record<string, string>;
  status: "pending" | "collected";
  usage?: UsageTotals;
  outcome?: Record<string, number>;
};
type Verification = {
  verdict: "pass" | "fail";
  issues: string[];
  checkedAt: string;
  /** The sheet that failed, kept here for the owner's review (never published). */
  rejectedSheet?: { es: string; en: string; sv: string };
};
type State = {
  batches: BatchRecord[];
  /** Per document: the last verification result. */
  verification: Record<string, Verification>;
  sampleUsage?: UsageTotals;
};

function readState(): State {
  return existsSync(STATE_PATH) ? (JSON.parse(readFileSync(STATE_PATH, "utf8")) as State) : { batches: [], verification: {} };
}
function writeState(s: State): void {
  writeFileSync(STATE_PATH, JSON.stringify(s, null, 1) + "\n");
}

function loadEnvLocal(): void {
  if (process.env.ANTHROPIC_API_KEY || !existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const model = () => (process.env.ANTHROPIC_MODEL || "").trim() || "claude-sonnet-5-5";
const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

// ---------------------------------------------------------------------------
// Tranches
// ---------------------------------------------------------------------------

const STRONG = new Set<LibraryDoc["kind"]>(["meta_analysis", "systematic_review", "trial"]);
const TRANCHE_2: TopicId[] = ["crisis_regulation", "pain_health", "family_caregivers"];

/** Documents that need a sheet: open-licence abstract and no sheet yet. */
export function needsSheet(d: LibraryDoc): boolean {
  return d.openText && !!d.abstract && !d.sheet;
}

export function tranches(docs: LibraryDoc[]): Array<{ name: string; docs: LibraryDoc[] }> {
  const todo = docs.filter(needsSheet);
  const t1 = todo
    .filter((d) => d.topics.includes("challenging_behavior"))
    .sort((a, b) => Number(STRONG.has(b.kind)) - Number(STRONG.has(a.kind)) || b.year - a.year || a.id.localeCompare(b.id));
  const in1 = new Set(t1.map((d) => d.id));
  const t2 = todo.filter((d) => !in1.has(d.id) && d.topics.some((t) => TRANCHE_2.includes(t)));
  const in2 = new Set(t2.map((d) => d.id));
  const t3 = todo.filter((d) => !in1.has(d.id) && !in2.has(d.id));
  return [
    { name: "1-aggression-self-injury", docs: t1 },
    { name: "2-crisis-pain-family", docs: t2 },
    { name: "3-rest", docs: t3 },
  ];
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function sample(client: Anthropic) {
  const topic = (arg("--topic") ?? "challenging_behavior") as TopicId;
  const n = Number(arg("--n")) || 5;
  const docs = readDocs()
    .filter((d) => needsSheet(d) && d.topics.includes(topic))
    .sort((a, b) => Number(STRONG.has(b.kind)) - Number(STRONG.has(a.kind)) || b.year - a.year)
    .slice(0, n);
  const state = readState();
  const usage = state.sampleUsage ?? emptyUsage();
  const out: Array<Record<string, unknown>> = [];
  for (const d of docs) {
    const msg = await client.messages.create(sheetParams(d, model()));
    addUsage(usage, msg.usage);
    const sheet = parseSheet(msg);
    const screen = sheet ? localSheetScreen(sheet, sheetUserMessage(d), { requireHelp: needsHelpLine(d) }) : { reject: ["no sheet returned"], review: [] };
    out.push({ id: d.id, doi: d.doi, title: d.title, year: d.year, kind: d.kind, sheet, screen, usage: msg.usage });
    console.log(`\n=== ${d.title} (${d.year}, ${d.kind}) ===`);
    if (sheet) for (const l of ["es", "en", "sv"] as const) console.log(`[${l}] ${sheet[l]}\n`);
    console.log(screen.reject.length ? `code screen REJECT: ${screen.reject.join("; ")}` : "code screen: no rule broken");
    if (screen.review.length) console.log(`for the model check: ${screen.review.join("; ")}`);
  }
  writeFileSync(SAMPLES_PATH, JSON.stringify(out, null, 1) + "\n");
  state.sampleUsage = usage;
  writeState(state);
  const per = usage.requests ? usageCostUsd(usage, false) / usage.requests : 0;
  console.log(`\n${docs.length} samples → data/library/sheet-samples.json`);
  console.log(`Usage: ${usage.input} input / ${usage.output} output tokens · $${usageCostUsd(usage, false).toFixed(4)} at standard price · about $${(per / 2).toFixed(4)} per sheet by batch`);
}

function plan() {
  const docs = readDocs();
  const state = readState();
  const s = state.sampleUsage;
  const perIn = s?.requests ? s.input / s.requests : null;
  const perOut = s?.requests ? s.output / s.requests : null;
  for (const t of tranches(docs)) {
    const est = perIn !== null && perOut !== null ? usageCostUsd({ requests: t.docs.length, input: perIn * t.docs.length, output: perOut * t.docs.length, cacheRead: 0, cacheWrite: 0 }, true) : null;
    console.log(`${t.name}: ${t.docs.length} sheets${est !== null ? ` · ≈ $${est.toFixed(2)} by batch (from the samples' real usage)` : ""}`);
  }
}

async function submit(client: Anthropic) {
  const state = readState();
  const pendingIds = new Set(
    state.batches.filter((b) => b.kind === "sheets" && b.status === "pending").flatMap((b) => Object.values(b.requests))
  );
  for (const t of tranches(readDocs())) {
    const docs = t.docs.filter((d) => !pendingIds.has(d.id));
    if (docs.length === 0) continue;
    const requests: Record<string, string> = {};
    const batch = await client.messages.batches.create({
      requests: docs.map((d, i) => {
        const customId = `s${String(i).padStart(5, "0")}`;
        requests[customId] = d.id;
        return { custom_id: customId, params: sheetParams(d, model()) };
      }),
    });
    state.batches.push({ id: batch.id, kind: "sheets", tranche: t.name, createdAt: new Date().toISOString(), requests, status: "pending" });
    writeState(state);
    console.log(`${t.name}: batch ${batch.id} with ${docs.length} sheets`);
  }
}

async function verify(client: Anthropic) {
  const state = readState();
  const docs = readDocs();
  const failedByCode: string[] = [];
  const toCheck: Array<{ doc: LibraryDoc; flags: string[] }> = [];
  for (const d of docs) {
    if (!d.sheet || !d.abstract) continue;
    if (state.verification[d.id]?.verdict === "pass") continue;
    const screen = localSheetScreen(d.sheet, sheetUserMessage(d), { requireHelp: needsHelpLine(d) });
    if (screen.reject.length > 0) {
      state.verification[d.id] = { verdict: "fail", issues: screen.reject.map((i) => `code: ${i}`), checkedAt: new Date().toISOString().slice(0, 10), rejectedSheet: d.sheet };
      d.sheet = null;
      failedByCode.push(d.id);
    } else toCheck.push({ doc: d, flags: screen.review });
  }
  writeDocs(docs);
  writeState(state);
  console.log(`Code screen: ${failedByCode.length} sheets removed, ${toCheck.length} go to the model check.`);
  if (toCheck.length === 0) return;
  const requests: Record<string, string> = {};
  const batch = await client.messages.batches.create({
    requests: toCheck.map(({ doc, flags }, i) => {
      const customId = `v${String(i).padStart(5, "0")}`;
      requests[customId] = doc.id;
      return { custom_id: customId, params: verifyParams(doc, model(), flags) };
    }),
  });
  state.batches.push({ id: batch.id, kind: "verify", tranche: "all", createdAt: new Date().toISOString(), requests, status: "pending" });
  writeState(state);
  console.log(`verify: batch ${batch.id} with ${toCheck.length} checks`);
}

async function collect(client: Anthropic) {
  const state = readState();
  const docs = readDocs();
  const byId = new Map(docs.map((d) => [d.id, d]));
  for (const b of state.batches.filter((x) => x.status === "pending")) {
    const info = await client.messages.batches.retrieve(b.id);
    if (info.processing_status !== "ended") {
      console.log(`${b.kind} ${b.tranche}: ${info.processing_status} (${info.request_counts.succeeded} done, ${info.request_counts.processing} processing)`);
      continue;
    }
    const usage = emptyUsage();
    const outcome: Record<string, number> = {};
    const bump = (k: string) => (outcome[k] = (outcome[k] ?? 0) + 1);
    for await (const r of await client.messages.batches.results(b.id)) {
      const doc = byId.get(b.requests[r.custom_id]);
      if (r.result.type !== "succeeded") {
        bump(r.result.type);
        continue;
      }
      addUsage(usage, r.result.message.usage);
      if (!doc) {
        bump("document gone");
        continue;
      }
      const today = new Date().toISOString().slice(0, 10);
      if (b.kind === "sheets") {
        const sheet = parseSheet(r.result.message);
        if (!sheet) {
          const why = r.result.message.stop_reason === "refusal" ? "refused" : "unparseable";
          state.verification[doc.id] = { verdict: "fail", issues: [`no sheet: model reply ${why}`], checkedAt: today };
          bump(why);
          continue;
        }
        const screen = localSheetScreen(sheet, sheetUserMessage(doc), { requireHelp: needsHelpLine(doc) });
        if (screen.reject.length > 0) {
          state.verification[doc.id] = { verdict: "fail", issues: screen.reject.map((i) => `code: ${i}`), checkedAt: today, rejectedSheet: sheet };
          bump("rejected by code screen");
          continue;
        }
        doc.sheet = sheet;
        delete state.verification[doc.id];
        bump("written");
      } else {
        const v = parseVerdict(r.result.message);
        if (!v) {
          // No verdict means no proof: the sheet is not published.
          state.verification[doc.id] = { verdict: "fail", issues: ["verification returned no verdict"], checkedAt: today, rejectedSheet: doc.sheet ?? undefined };
          doc.sheet = null;
          bump("no verdict (sheet removed)");
          continue;
        }
        const pass = v.verdict === "pass" && v.supported && !v.diagnosis_or_medication && v.languages_match;
        state.verification[doc.id] = {
          verdict: pass ? "pass" : "fail",
          issues: pass
            ? []
            : [
                ...v.unsupported_claims.map((c) => `unsupported: ${c}`),
                ...(v.diagnosis_or_medication ? ["diagnosis or medication"] : []),
                ...(v.languages_match ? [] : ["languages differ"]),
              ],
          checkedAt: today,
          ...(pass || !doc.sheet ? {} : { rejectedSheet: doc.sheet }),
        };
        if (!pass) doc.sheet = null;
        bump(pass ? "pass" : "fail (sheet removed)");
      }
    }
    b.status = "collected";
    b.usage = usage;
    b.outcome = outcome;
    console.log(`${b.kind} ${b.tranche}: ${JSON.stringify(outcome)} · $${usageCostUsd(usage, true).toFixed(2)}`);
    writeDocs(docs);
    writeState(state);
  }
  cost();
}

/** The owner's review list: every failed sheet with its text and reasons, plus documents still without a sheet. */
function review() {
  const state = readState();
  const docs = readDocs();
  const failed = docs
    .filter((d) => state.verification[d.id]?.verdict === "fail")
    .map((d) => ({
      id: d.id,
      doi: d.doi,
      url: d.url,
      title: d.title,
      year: d.year,
      kind: d.kind,
      topics: d.topics,
      issues: state.verification[d.id].issues,
      rejectedSheet: state.verification[d.id].rejectedSheet ?? null,
    }));
  const unverified = docs.filter((d) => d.sheet && state.verification[d.id]?.verdict !== "pass").map((d) => d.id);
  writeFileSync(REVIEW_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), failed, publishedWithoutPass: unverified }, null, 1) + "\n");
  console.log(`Review list: ${failed.length} failed sheets, ${unverified.length} published sheets without a pass → data/library/sheet-review-list.json`);
}

function cost() {
  const state = readState();
  let total = 0;
  for (const b of state.batches.filter((x) => x.usage)) {
    const c = usageCostUsd(b.usage!, true);
    total += c;
    console.log(`  ${b.kind} ${b.tranche} (${b.id}): ${b.usage!.requests} requests · ${b.usage!.input} in / ${b.usage!.output} out · $${c.toFixed(2)}`);
  }
  if (state.sampleUsage) {
    const c = usageCostUsd(state.sampleUsage, false);
    total += c;
    console.log(`  samples (standard API): ${state.sampleUsage.requests} requests · $${c.toFixed(4)}`);
  }
  console.log(`Real cost so far: $${total.toFixed(2)} (Sonnet 5.5: $2 / $10 per MTok, batches at 50%)`);
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === "plan") return plan();
  if (cmd === "cost") return cost();
  if (cmd === "review") return review();
  loadEnvLocal();
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set (environment or .env.local). Nothing done.");
    process.exit(2);
  }
  const client = new Anthropic();
  if (cmd === "sample") return sample(client);
  if (cmd === "submit") return submit(client);
  if (cmd === "verify") return verify(client);
  if (cmd === "collect") return collect(client);
  console.error("Usage: sheetsBatch.ts sample|plan|submit|verify|collect|review|cost");
  process.exit(2);
}

if (process.argv[1]?.endsWith("sheetsBatch.ts")) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
