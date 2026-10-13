/**
 * Companion — what helps this person.
 *
 * After each run the caregiver taps one outcome. Ranking is deterministic and
 * local. The only thing that may leave the device is an anonymous summary of
 * the routines that helped most: scenario, commands and counts. No names, no
 * free text, no dates.
 */

import type { Command, ScenarioId } from "../careProtocol/types";
import type { HelpfulRoutine } from "../careProtocol/intentParser";
import { RUN_LOG_KEY, readRuns, type CompanionRun, type RunOutcome } from "./runLog";

export type Outcome = RunOutcome;
export const OUTCOMES: Outcome[] = ["helped", "no_change", "worse"];

type StorageLike = Pick<Storage, "getItem" | "setItem">;

/** Record the caregiver's one-tap rating on a logged run. */
export function setRunOutcome(storage: StorageLike, runId: string, outcome: Outcome): CompanionRun | null {
  const runs = readRuns(storage);
  const run = runs.find((r) => r.id === runId);
  if (!run) return null;
  run.outcome = outcome;
  try {
    storage.setItem(RUN_LOG_KEY, JSON.stringify(runs));
  } catch {
    /* storage unavailable */
  }
  return run;
}

export type RoutineStats = {
  key: string;
  scenario: ScenarioId;
  commands: Command[];
  helped: number;
  noChange: number;
  worse: number;
  rated: number;
};

export function routineKey(scenario: ScenarioId, commands: Command[]): string {
  return `${scenario}:${[...commands].sort().join(",")}`;
}

/** Group rated runs by routine and rank: most helped, least worsened. Deterministic. */
export function rankRoutines(runs: CompanionRun[]): RoutineStats[] {
  const byKey = new Map<string, RoutineStats>();
  for (const run of runs) {
    if (!run.outcome) continue;
    const key = routineKey(run.scenario, run.commands);
    let s = byKey.get(key);
    if (!s) {
      s = { key, scenario: run.scenario, commands: [...run.commands], helped: 0, noChange: 0, worse: 0, rated: 0 };
      byKey.set(key, s);
    }
    s.rated += 1;
    if (run.outcome === "helped") s.helped += 1;
    else if (run.outcome === "worse") s.worse += 1;
    else s.noChange += 1;
  }
  return [...byKey.values()].sort(
    (a, b) =>
      b.helped - b.worse - (a.helped - a.worse) ||
      b.helped - a.helped ||
      a.worse - b.worse ||
      b.rated - a.rated ||
      a.key.localeCompare(b.key)
  );
}

/** The anonymous summary sent to the parser: top routines that helped more than they worsened. */
export function helpfulSummary(runs: CompanionRun[], limit = 3): HelpfulRoutine[] {
  return rankRoutines(runs)
    .filter((s) => s.helped > 0 && s.helped > s.worse)
    .slice(0, limit)
    .map((s) => ({ scenario: s.scenario, commands: [...s.commands], helped: s.helped, rated: s.rated }));
}
