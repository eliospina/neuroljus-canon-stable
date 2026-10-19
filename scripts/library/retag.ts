/**
 * Re-classify the library's topics by code (see topicMatch.ts) and drop what
 * no longer fits.
 *
 *   npx tsx scripts/library/retag.ts [--dry]
 *
 * - Seeds, guidelines and expert notes keep their hand-chosen topics.
 * - Every other document gets the topics its title and abstract support.
 * - A document with a practical sheet was curated before: it keeps its
 *   topics, and only the code decides whether it carries the aggression topic.
 * - Any other document gets the topics its title and abstract support, and
 *   leaves the library when it fits none.
 * - Studies of medicines, supplements, diets and other biomedical treatments
 *   without a sheet leave the library (sheeted ones are listed for review).
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { readDocs, writeDocs, type TopicId } from "./lib";
import { classifyTopics } from "./topicMatch";
import { isBiomedical } from "./ingest";

const DRY = process.argv.includes("--dry");

function main() {
  const docs = readDocs();
  const kept = [];
  const dropped = { noTopic: 0, biomedical: 0 };
  const flagged: string[] = [];
  const before: Record<string, number> = {};
  const after: Record<string, number> = {};
  for (const d of docs) for (const t of d.topics) before[t] = (before[t] ?? 0) + 1;
  for (const d of docs) {
    if (d.seed || d.kind === "guideline" || d.kind === "expert_practice") {
      kept.push(d);
      continue;
    }
    if (isBiomedical(d.title)) {
      if (!d.sheet) {
        dropped.biomedical += 1;
        continue;
      }
      flagged.push(`${d.year} ${d.title}`);
    }
    const classified = classifyTopics(d);
    let topics: TopicId[];
    if (d.sheet) {
      // Curated before: keep its topics; only the code assigns the aggression topic.
      topics = [...d.topics.filter((t) => t !== "challenging_behavior"), ...classified.filter((t) => t === "challenging_behavior")];
      if (topics.length === 0) topics = classified.length > 0 ? classified : d.topics;
    } else {
      if (classified.length === 0) {
        dropped.noTopic += 1;
        continue;
      }
      topics = classified;
    }
    kept.push({ ...d, topics: [...new Set(topics)].sort() });
  }
  for (const d of kept) for (const t of d.topics) after[t] = (after[t] ?? 0) + 1;
  console.log(`${docs.length} → ${kept.length} documents. Dropped: ${dropped.noTopic} fit no topic, ${dropped.biomedical} biomedical.`);
  for (const t of Object.keys({ ...before, ...after }).sort()) console.log(`  ${t}: ${before[t] ?? 0} → ${after[t] ?? 0}`);
  if (flagged.length) console.log(`Biomedical documents with sheets, kept for review: ${flagged.length}`);
  if (DRY) return;
  writeDocs(kept);
  const report = path.resolve(process.cwd(), "data/library/ingest-report.json");
  if (existsSync(report)) {
    const r = JSON.parse(readFileSync(report, "utf8")) as Record<string, unknown>;
    r.retag = { ranAt: new Date().toISOString().slice(0, 10), before: docs.length, after: kept.length, droppedNoTopic: dropped.noTopic, droppedBiomedical: dropped.biomedical, topicsBefore: before, topicsAfter: after };
    writeFileSync(report, JSON.stringify(r, null, 2) + "\n");
  }
}

main();
