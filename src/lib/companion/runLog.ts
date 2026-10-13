/**
 * Companion — local run log (log_observation on the phone body).
 *
 * Only structured fields: scenario, commands, how the run ended, the caregiver's
 * one-tap outcome. Never the
 * caregiver's text, never names. Lives in this browser only.
 */

import type { Command, ScenarioId } from "../careProtocol/types";

export type RunEnd = "completed" | "caregiver_pause";
/** The caregiver's one-tap rating after the run. */
export type RunOutcome = "helped" | "no_change" | "worse";

export type CompanionRun = {
  id: string;
  at: string;
  scenario: ScenarioId;
  commands: Command[];
  ended: RunEnd;
  outcome?: RunOutcome;
};

export const RUN_LOG_KEY = "neuroljus.companion.runs.v0";
const MAX_RUNS = 200;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function readRuns(storage: StorageLike): CompanionRun[] {
  try {
    const parsed = JSON.parse(storage.getItem(RUN_LOG_KEY) || "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as CompanionRun[]) : [];
  } catch {
    return [];
  }
}

export function addRun(
  storage: StorageLike,
  run: Omit<CompanionRun, "id" | "at">,
  now: Date = new Date()
): CompanionRun {
  const entry: CompanionRun = {
    ...run,
    id: `run_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
    at: now.toISOString(),
  };
  try {
    storage.setItem(RUN_LOG_KEY, JSON.stringify([entry, ...readRuns(storage)].slice(0, MAX_RUNS)));
  } catch {
    /* storage full or private mode: the run still happened */
  }
  return entry;
}
