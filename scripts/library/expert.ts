/**
 * Merge expert practice notes into the library.
 *
 *   npx tsx scripts/library/expert.ts
 *
 * Reads data/library/expert_practice.json, validates every entry (citation,
 * three languages, no long quotations, no medication or diagnosis) and
 * replaces the EXPERT:* documents in docs.json. Any invalid entry stops the
 * run: nothing half-checked enters the library.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { readDocs, writeDocs } from "./lib";
import { TOPICS } from "./topics";
import { EXPERT_PATH_REL, expertToDoc, validateExpertPractice, type ExpertPractice } from "./expertSchema";

function main() {
  const file = path.resolve(process.cwd(), EXPERT_PATH_REL);
  const entries = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as ExpertPractice[]) : [];
  const known = TOPICS.map((t) => t.id);
  const issues = entries.flatMap((e) => validateExpertPractice(e, known));
  const slugs = entries.map((e) => e.slug);
  for (const s of new Set(slugs)) if (slugs.filter((x) => x === s).length > 1) issues.push(`duplicate slug ${s}`);
  if (issues.length > 0) {
    console.error(issues.map((i) => `✗ ${i}`).join("\n"));
    process.exit(1);
  }
  const docs = readDocs().filter((d) => d.kind !== "expert_practice");
  writeDocs([...docs, ...entries.map(expertToDoc)]);
  console.log(`${entries.length} expert practice notes merged.`);
}

main();
