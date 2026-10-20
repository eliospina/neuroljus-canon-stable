/**
 * Library retrieval for the brain, on every turn, with an explicit time budget.
 * The BM25 index is built when this module loads (not on the first request), so
 * a warm instance answers in milliseconds and a cold one pays the cost at boot.
 */

import { localSearchTerms, retrieve } from "../ask/expert";
import { searchLibrary, type LibraryDoc } from "../library";
import type { EmergencyLang } from "../emergency";

/** Build the index now. Measured: ~200 ms once, then 3-6 ms per query. */
export function warmLibrary(): void {
  searchLibrary("autism", 1);
}
warmLibrary();

export const RETRIEVAL_BUDGET_MS = 800;
export const RETRIEVAL_DOCS = 4;

export type Retrieved = { docs: LibraryDoc[]; ms: number; timedOut: boolean };

/**
 * Terms from the current turn plus the last two user turns of context. Local
 * term mapping only (no model round trip): deterministic and instant.
 */
export function retrievalQuery(current: string, context: string[]): string {
  const tail = context.slice(-2).join(" ");
  const terms = localSearchTerms(`${current} ${tail}`);
  // localSearchTerms returns the raw text when nothing mapped; keep it short then.
  return terms.length > 300 ? terms.slice(0, 300) : terms;
}

/** Resolves with the docs, or with an empty list if the budget runs out (it never throws). */
export async function retrieveWithBudget(current: string, context: string[], budgetMs = RETRIEVAL_BUDGET_MS): Promise<Retrieved> {
  const t0 = performance.now();
  const work = new Promise<LibraryDoc[]>((resolve) => {
    // setImmediate keeps a slow index build from blocking the timer below.
    setImmediate(() => {
      try {
        resolve(retrieve(retrievalQuery(current, context), []).slice(0, RETRIEVAL_DOCS));
      } catch {
        resolve([]);
      }
    });
  });
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), budgetMs));
  const result = await Promise.race([work, timeout]);
  const ms = Math.round(performance.now() - t0);
  return result === null ? { docs: [], ms, timedOut: true } : { docs: result, ms, timedOut: false };
}

/** One document as the model should see it: what it backs, in the caller's language, plus title and year. */
export function docForPrompt(d: LibraryDoc, lang: EmergencyLang): string {
  const body = d.seed ? d.seed.claim[lang] : d.sheet ? d.sheet[lang] : d.abstract ? d.abstract.slice(0, 400) : "";
  return `[${d.id}] ${d.title} (${d.year}, ${d.kind.replace("_", " ")}): ${body}`;
}
