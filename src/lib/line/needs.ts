/**
 * What the caller needed: an anonymised audit of each turn, so the library
 * and the protocols can grow from what people actually ask for. Runs after
 * the voice has the answer, with a small model, and logs tags only: topics,
 * where the answer came from, which library documents were used, and the
 * knowledge the model wished it had. Never the words of the call.
 *
 * `npm run line:needs -- <log export>` turns the log lines into a report.
 * LINE_NEEDS_LOG=0 turns it off; LINE_NEEDS_MODEL changes the model.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { EmergencyLang } from "../emergency";
import type { LibraryDoc } from "../library";

export const NEEDS_MODEL_DEFAULT = "claude-haiku-5-5";

export type NeedsAudit = {
  topics: string[];
  answerSource: Array<"library" | "protocol" | "memory" | "web">;
  libraryUsed: string[];
  gaps: string[];
};

export type NeedsInput = {
  userText: string;
  assistantText: string;
  docsOffered: Array<Pick<LibraryDoc, "id" | "title">>;
  lang: EmergencyLang;
  country: string | null;
  caller: string;
  turn: number;
  apiKey: string | null;
  model?: string;
  fetchImpl?: typeof fetch;
  log?: (line: string) => void;
  /** Test hook: returns the audit instead of calling the model. */
  audit?: (input: NeedsInput) => Promise<NeedsAudit>;
};

const SYSTEM = `You audit one turn of a phone support line for autistic people and their caregivers, so its owners can see what callers need and what knowledge the line lacks. You see the caller's words, the line's answer, and the library documents the line was offered. Answer with JSON only:
{"topics": ["up to 3 short English tags of what the caller needed, e.g. 'benzodiazepine overdose', 'pica', 'night elopement', 'kitchen safety at home'"],
 "answerSource": ["one or more of: library, protocol, memory, web — where the answer's substance came from; 'library' only if a listed document clearly shaped it, 'protocol' for NeuroLjus crisis steps, 'memory' for the model's own knowledge"],
 "libraryUsed": ["ids of listed documents the answer actually used, else empty"],
 "gaps": ["up to 3 short English phrases of knowledge that would have made the answer better and was not in front of the line, e.g. 'clorazepate overdose signs', 'home kitchen adaptations for autistic adults'; empty if nothing was missing"]}
Tags only: never names, places, ages, numbers or quotes from the call.`;

/** Tags only: strips anything that could identify a person, keeps short lowercase phrases. */
export function cleanTag(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const t = s
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\d+/g, "")
    .replace(/["'“”]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .slice(0, 60);
  return t.length >= 3 ? t : null;
}

const SOURCES = new Set(["library", "protocol", "memory", "web"]);

export function parseAudit(text: string, offered: string[]): NeedsAudit {
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) return { topics: [], answerSource: [], libraryUsed: [], gaps: [] };
  let v: Partial<Record<keyof NeedsAudit, unknown>>;
  try {
    v = JSON.parse(json);
  } catch {
    return { topics: [], answerSource: [], libraryUsed: [], gaps: [] };
  }
  const list = (x: unknown, max: number) => (Array.isArray(x) ? x.map(cleanTag).filter((t): t is string => t !== null).slice(0, max) : []);
  const offeredSet = new Set(offered);
  return {
    topics: list(v.topics, 3),
    answerSource: (Array.isArray(v.answerSource) ? v.answerSource : []).map((s) => String(s).toLowerCase()).filter((s): s is NeedsAudit["answerSource"][number] => SOURCES.has(s)).slice(0, 4),
    libraryUsed: (Array.isArray(v.libraryUsed) ? v.libraryUsed : []).map(String).filter((id) => offeredSet.has(id)),
    gaps: list(v.gaps, 3),
  };
}

async function askModel(input: NeedsInput): Promise<NeedsAudit> {
  const client = new Anthropic({ apiKey: input.apiKey!, maxRetries: 0, timeout: 8_000, fetch: input.fetchImpl as never });
  const offered = input.docsOffered.map((d) => `${d.id}: ${d.title}`).join("\n") || "(none)";
  const res = await client.messages.create({
    model: input.model || process.env.LINE_NEEDS_MODEL || NEEDS_MODEL_DEFAULT,
    max_tokens: 400,
    // No thinking: the output is four short lists, and thinking tokens would eat the cap.
    thinking: { type: "disabled" },
    system: SYSTEM,
    messages: [{ role: "user", content: `CALLER: ${input.userText}\n\nLINE: ${input.assistantText}\n\nLIBRARY DOCUMENTS OFFERED:\n${offered}` }],
  });
  const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  return parseAudit(text, input.docsOffered.map((d) => d.id));
}

/**
 * Audits one turn and logs a `line_needs` line. Never throws and never logs
 * the call's words. Returns the audit for tests.
 */
export async function auditTurn(input: NeedsInput): Promise<NeedsAudit | null> {
  if (process.env.LINE_NEEDS_LOG === "0") return null;
  if (!input.audit && !input.apiKey) return null;
  if (input.userText.trim().length < 15 || !input.assistantText.trim()) return null;
  const log = input.log ?? ((l: string) => console.info(l));
  try {
    const audit = input.audit ? await input.audit(input) : await askModel(input);
    log(
      JSON.stringify({
        event: "line_needs",
        lang: input.lang,
        country: input.country,
        caller: input.caller,
        turn: input.turn,
        topics: audit.topics,
        answerSource: audit.answerSource,
        libraryOffered: input.docsOffered.map((d) => d.id),
        libraryUsed: audit.libraryUsed,
        gaps: audit.gaps,
      })
    );
    return audit;
  } catch (e) {
    // Error class only: never the text.
    log(JSON.stringify({ event: "line_needs_error", error: e instanceof Error ? e.name : "unknown" }));
    return null;
  }
}
