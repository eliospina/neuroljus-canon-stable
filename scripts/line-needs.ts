/**
 * What the line's callers needed, from the anonymised `line_needs` log lines
 * (src/lib/line/needs.ts). Reads one or more files exported from Vercel's
 * logs (JSON lines, or Vercel's export where each line holds a `message`)
 * and prints: topics by frequency, where the answers came from, how often the
 * library was used, and the knowledge gaps the model reported. The gaps are
 * the list to grow the library and the protocols from.
 *
 *   npm run line:needs -- logs/vercel-2026-10.jsonl [more files]
 */

import { readFileSync } from "node:fs";

type Needs = { event: "line_needs"; lang?: string; country?: string | null; caller?: string; topics?: string[]; answerSource?: string[]; libraryOffered?: string[]; libraryUsed?: string[]; gaps?: string[] };

export function parseNeedsLines(text: string): Needs[] {
  const out: Needs[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    let obj: unknown;
    try {
      obj = JSON.parse(line);
    } catch {
      const m = line.match(/\{"event":"line_needs".*\}/);
      if (!m) continue;
      try {
        obj = JSON.parse(m[0]);
      } catch {
        continue;
      }
    }
    // Vercel log exports wrap our JSON in a `message` field.
    const rec = obj as { message?: unknown; event?: unknown };
    if (rec && typeof rec.message === "string" && rec.message.includes("line_needs")) {
      try {
        obj = JSON.parse(rec.message);
      } catch {
        continue;
      }
    }
    const n = obj as Needs;
    if (n && n.event === "line_needs") out.push(n);
  }
  return out;
}

function count(items: string[]): Array<[string, number]> {
  const m = new Map<string, number>();
  for (const i of items) m.set(i, (m.get(i) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export function needsReport(records: Needs[]): string {
  if (records.length === 0) return "No line_needs records found.";
  const lines: string[] = [];
  lines.push(`${records.length} turns audited`);
  lines.push(`languages: ${count(records.map((r) => r.lang ?? "?")).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  lines.push(`countries: ${count(records.map((r) => r.country ?? "unknown")).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  lines.push(`callers: ${count(records.map((r) => r.caller ?? "?")).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  const offered = records.filter((r) => (r.libraryOffered ?? []).length > 0).length;
  const used = records.filter((r) => (r.libraryUsed ?? []).length > 0).length;
  lines.push(`library: offered in ${offered} turns, used in ${used} (${offered ? Math.round((100 * used) / offered) : 0}% of the turns it was offered)`);
  lines.push(`answer source: ${count(records.flatMap((r) => r.answerSource ?? [])).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  lines.push("");
  lines.push("TOPICS (what callers needed)");
  for (const [t, n] of count(records.flatMap((r) => r.topics ?? [])).slice(0, 40)) lines.push(`  ${String(n).padStart(4)}  ${t}`);
  lines.push("");
  lines.push("LIBRARY DOCUMENTS USED");
  for (const [d, n] of count(records.flatMap((r) => r.libraryUsed ?? [])).slice(0, 30)) lines.push(`  ${String(n).padStart(4)}  ${d}`);
  lines.push("");
  lines.push("KNOWLEDGE GAPS (what the model wished it had in front of it): the list to grow the library and protocols from");
  for (const [g, n] of count(records.flatMap((r) => r.gaps ?? [])).slice(0, 40)) lines.push(`  ${String(n).padStart(4)}  ${g}`);
  return lines.join("\n");
}

if (process.argv[1]?.endsWith("line-needs.ts")) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("usage: npm run line:needs -- <vercel log export> [more files]");
    process.exit(2);
  }
  const records = files.flatMap((f) => parseNeedsLines(readFileSync(f, "utf8")));
  console.log(needsReport(records));
}
