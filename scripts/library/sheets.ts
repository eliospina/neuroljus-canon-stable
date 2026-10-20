/**
 * Practical sheets: for every document with open-licence abstract text and no
 * sheet yet, ask Claude "what does this mean for a caregiver tomorrow
 * morning?" in es/en/sv. Resumable: progress is written to docs.json as it
 * goes, so a stopped run continues where it left off.
 *
 *   ANTHROPIC_API_KEY=... npx tsx scripts/library/sheets.ts [--limit N] [--concurrency 4]
 *
 * Reads ANTHROPIC_API_KEY from the environment or from .env.local (never
 * committed). Uses ANTHROPIC_MODEL when set, otherwise claude-opus-5-5.
 * For the whole library, sheetsBatch.ts does the same through the Message
 * Batches API at half the price, and verifies every sheet.
 */

import { existsSync, readFileSync } from "node:fs";
import { readDocs, sleep, writeDocs, type LibraryDoc } from "./lib";
import { SHEET_SCHEMA, SHEET_SYSTEM as SYSTEM, sheetUserMessage } from "./sheetPrompt";

const args = process.argv.slice(2);
const LIMIT = Number(args[args.indexOf("--limit") + 1]) || Infinity;
const CONCURRENCY = Number(args[args.indexOf("--concurrency") + 1]) || 4;

function loadEnvLocal(): void {
  if (process.env.ANTHROPIC_API_KEY || !existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

type Payload = { error?: { message?: string; type?: string }; stop_reason?: string; content?: Array<{ type?: string; text?: string }> };

async function makeSheet(doc: LibraryDoc, apiKey: string, model: string): Promise<LibraryDoc["sheet"]> {
  const user = sheetUserMessage(doc);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        system: SYSTEM,
        messages: [{ role: "user", content: user }],
        output_config: { effort: "low", format: { type: "json_schema", schema: SHEET_SCHEMA } },
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as Payload;
    if (res.status === 429 || res.status >= 500) {
      await sleep(3000 * attempt);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${payload.error?.type ?? ""}: ${payload.error?.message ?? "request failed"}`);
    if (payload.stop_reason === "refusal") return null;
    const text = (payload.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
    const parsed = JSON.parse(text) as { es: string; en: string; sv: string };
    if (parsed.es && parsed.en && parsed.sv) return { es: parsed.es.trim(), en: parsed.en.trim(), sv: parsed.sv.trim() };
    return null;
  }
  return null;
}

async function main() {
  loadEnvLocal();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set (environment or .env.local). Nothing done.");
    process.exit(2);
  }
  const model = (process.env.ANTHROPIC_MODEL || "").trim() || "claude-opus-5-5";
  const docs = readDocs();
  const todo = docs.filter((d) => d.openText && d.abstract && !d.sheet).slice(0, LIMIT);
  console.log(`${todo.length} sheets to write with ${model} (${docs.filter((d) => d.sheet).length} already done)`);

  let done = 0;
  let failed = 0;
  const queue = [...todo];
  const worker = async () => {
    while (queue.length > 0) {
      const doc = queue.shift()!;
      try {
        const sheet = await makeSheet(doc, apiKey, model);
        if (sheet) {
          doc.sheet = sheet;
          done += 1;
        } else failed += 1;
      } catch (e) {
        failed += 1;
        console.error(`  ${doc.doi}: ${e instanceof Error ? e.message : "error"}`);
      }
      if ((done + failed) % 10 === 0) {
        writeDocs(docs);
        console.log(`  ${done} written, ${failed} failed, ${queue.length} left`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  writeDocs(docs);
  console.log(`Done: ${done} sheets written, ${failed} failed. Run scripts/library/build.ts to refresh the index.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
