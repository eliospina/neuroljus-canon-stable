/**
 * Topic classification by code, on title and abstract only.
 *
 * Europe PMC matches query terms anywhere in the indexed record, full text
 * included, so a microbiome review that mentions "aggression" once on page
 * 12 comes back for the aggression topic. A document keeps a topic only when
 * that topic's own terms appear in its title or abstract. Aggression,
 * self-injury and severe distress is stricter (see severeTopic).
 */

import type { LibraryDoc, TopicId } from "./lib";
import { TOPICS } from "./topics";

/**
 * Turn a Europe PMC terms fragment ('("a b" OR c* OR d)') into a regex that
 * matches any of its phrases. AND-joined groups must all match.
 */
export function termsToMatcher(terms: string): (text: string) => number {
  const groups = splitTopLevelAnd(terms).map((group) => {
    const tokens = [...group.matchAll(/"([^"]+)"|([A-Za-z][\w-]*\*?)/g)]
      .map((m) => (m[1] ?? m[2]).trim())
      .filter((t) => !/^(AND|OR|NOT)$/.test(t));
    const alt = tokens
      .map((t) => t.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[\\p{L}-]*").replace(/\s+/g, "[\\s-]+"))
      .join("|");
    return new RegExp(`(?<![\\p{L}])(?:${alt})(?![\\p{L}])`, "giu");
  });
  return (text: string) => {
    let hits = Infinity;
    for (const re of groups) hits = Math.min(hits, (text.match(re) ?? []).length);
    return groups.length === 0 ? 0 : hits;
  };
}

function splitTopLevelAnd(terms: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < terms.length; i += 1) {
    const c = terms[i];
    if (c === "(") depth += 1;
    else if (c === ")") depth -= 1;
    else if (depth === 0 && terms.startsWith(" AND ", i)) {
      parts.push(terms.slice(start, i));
      start = i + 5;
    }
  }
  parts.push(terms.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Aggression, self-injury and severe distress: its own vocabulary, because
 * the Europe PMC terms also catch studies that list aggression among many
 * co-occurring traits. A document qualifies when a term is in the title, or
 * when the abstract mentions the topic at least three times and already in
 * its first two sentences (the topic is what the study is about).
 */
const SEVERE =
  /(?<![\p{L}])(challenging behaviou?rs?|behaviou?rs? that challenges?|problem behaviou?rs?|behaviou?ral problems?|behaviou?r problems?|disruptive behaviou?r\p{L}*|aggressi(on|ve)\p{L}*|self-?injur\p{L}*|self-?harm\p{L}*|suicid\p{L}*|tantrums?|meltdowns?|anger|outbursts?|property destruction|elopement|severe behaviou?r\p{L}*|restrictive (practices?|interventions?)|restraint|seclusion)(?![\p{L}])/giu;

function severeTopic(d: Pick<LibraryDoc, "title" | "abstract">): boolean {
  if ((d.title.match(SEVERE) ?? []).length > 0) return true;
  const abstract = (d.abstract ?? "").replace(/^lay abstract\s*/i, "");
  const lead = abstract.split(/(?<=\.)\s/).slice(0, 2).join(" ");
  return (abstract.match(SEVERE) ?? []).length >= 3 && (lead.match(SEVERE) ?? []).length > 0;
}

const MATCHERS = TOPICS.filter((t) => t.id !== "challenging_behavior").map((t) => ({ id: t.id, count: termsToMatcher(t.terms) }));

/** Topics a document's title and abstract support. */
export function classifyTopics(d: Pick<LibraryDoc, "title" | "abstract">): TopicId[] {
  const out: TopicId[] = [];
  for (const m of MATCHERS) {
    if (m.count(d.title) > 0 || (d.abstract ? m.count(d.abstract) : 0) >= 1) out.push(m.id);
  }
  if (severeTopic(d)) out.push("challenging_behavior");
  return out.sort();
}
