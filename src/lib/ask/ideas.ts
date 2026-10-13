/**
 * Ideas notebook — the AI builds its own knowledge, measured, not invented.
 *
 * A "new idea from the AI" can be saved on this device and tried as a
 * Companion routine. Every run started from an idea carries its ideaId; each
 * "Helped / No change / Worse" rating is counted by code. With enough rated
 * runs the idea becomes "Data from this person", with its numbers. The idea
 * text never leaves the device.
 */

import type { CompanionRun } from "../companion/runLog";

export type Idea = {
  id: string;
  text: string;
  lang: "es" | "en" | "sv";
  createdAt: string;
};

export type IdeaStatus = "untested" | "testing" | "person_data" | "not_helping";

export type IdeaStats = {
  idea: Idea;
  helped: number;
  noChange: number;
  worse: number;
  rated: number;
  status: IdeaStatus;
};

export const IDEAS_KEY = "neuroljus.ask.ideas.v0";
/** Rated runs needed before an idea counts as data about this person. */
export const MIN_RATED_RUNS = 3;
const MAX_IDEAS = 100;
const MAX_TEXT = 400;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function readIdeas(storage: StorageLike): Idea[] {
  try {
    const parsed = JSON.parse(storage.getItem(IDEAS_KEY) || "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as Idea[]).filter((i) => i && typeof i.id === "string" && typeof i.text === "string") : [];
  } catch {
    return [];
  }
}

export function saveIdea(storage: StorageLike, text: string, lang: Idea["lang"], now: Date = new Date()): Idea {
  const clean = text.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
  const existing = readIdeas(storage);
  const same = existing.find((i) => i.text === clean);
  if (same) return same;
  const idea: Idea = { id: `idea_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`, text: clean, lang, createdAt: now.toISOString() };
  try {
    storage.setItem(IDEAS_KEY, JSON.stringify([idea, ...existing].slice(0, MAX_IDEAS)));
  } catch {
    /* storage unavailable */
  }
  return idea;
}

export function deleteIdea(storage: StorageLike, id: string): Idea[] {
  const next = readIdeas(storage).filter((i) => i.id !== id);
  try {
    storage.setItem(IDEAS_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  return next;
}

/** Deterministic status from the rated runs that carry this idea's id. */
export function ideaStats(idea: Idea, runs: CompanionRun[]): IdeaStats {
  let helped = 0;
  let noChange = 0;
  let worse = 0;
  for (const r of runs) {
    if (r.ideaId !== idea.id || !r.outcome) continue;
    if (r.outcome === "helped") helped += 1;
    else if (r.outcome === "worse") worse += 1;
    else noChange += 1;
  }
  const rated = helped + noChange + worse;
  let status: IdeaStatus = "untested";
  if (rated > 0 && rated < MIN_RATED_RUNS) status = "testing";
  else if (rated >= MIN_RATED_RUNS) status = helped > worse && helped >= rated / 2 ? "person_data" : "not_helping";
  return { idea, helped, noChange, worse, rated, status };
}

export function allIdeaStats(storage: StorageLike, runs: CompanionRun[]): IdeaStats[] {
  return readIdeas(storage).map((idea) => ideaStats(idea, runs));
}
