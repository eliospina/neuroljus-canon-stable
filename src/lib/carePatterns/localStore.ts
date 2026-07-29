/**
 * Local-only caregiver pattern notes.
 * Never leave the browser. Never claim diagnosis or inner pain certainty.
 */

export type PatternNote = {
  id: string;
  createdAt: string;
  /** Observed gesture / posture / sound — what was seen, not what was "felt". */
  gesture: string;
  context: string;
  eased: string;
  worsened: string;
  uncertainty: string;
  /** Optional: "I've seen a similar pattern with this person before." */
  seenBefore: boolean;
};

const STORAGE_KEY = "neuroljus.care_patterns.v0";

export function readPatternNotes(): PatternNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PatternNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePatternNotes(notes: PatternNote[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function addPatternNote(
  input: Omit<PatternNote, "id" | "createdAt">
): PatternNote[] {
  const note: PatternNote = {
    ...input,
    id: `pat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const next = [note, ...readPatternNotes()].slice(0, 100);
  writePatternNotes(next);
  return next;
}

export function deletePatternNote(id: string): PatternNote[] {
  const next = readPatternNotes().filter((note) => note.id !== id);
  writePatternNotes(next);
  return next;
}
