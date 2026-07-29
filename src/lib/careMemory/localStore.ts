/**
 * Local-only care memory notes for project learning.
 * Lived experience → short structured memory. Not a protocol. Not a legal filing.
 */

export type CareMemory = {
  id: string;
  createdAt: string;
  title: string;
  /** What happened — witness language, not diagnosis. */
  whatHappened: string;
  /** What this taught Neuroljus / care systems. */
  whatItTaught: string;
  /** Free tags, e.g. pain, neglect, gesture, robotics, speech-cycle. */
  tags: string;
  /** Country / region of the experience, if relevant. */
  place: string;
};

const STORAGE_KEY = "neuroljus.care_memory.v0";

export function readCareMemories(): CareMemory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CareMemory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCareMemories(memories: CareMemory[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

export function addCareMemory(
  input: Omit<CareMemory, "id" | "createdAt">
): CareMemory[] {
  const memory: CareMemory = {
    ...input,
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const next = [memory, ...readCareMemories()].slice(0, 200);
  writeCareMemories(next);
  return next;
}

export function deleteCareMemory(id: string): CareMemory[] {
  const next = readCareMemories().filter((item) => item.id !== id);
  writeCareMemories(next);
  return next;
}
