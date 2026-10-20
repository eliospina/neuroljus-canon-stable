/**
 * Invariant checks for one brain turn: the few things code guarantees. Used
 * by the CI test (scripted model) and by scripts/line-eval.ts (deployed
 * endpoint). Everything about clinical judgement is for the live judge.
 */

import { splitSentences } from "../../src/lib/line/guard";

export type TurnCheck = {
  text: string;
  /** The caller asked whom to call this turn: the first sentence must give the number, or ask the country when unknown. */
  asksWhomToCall?: boolean;
  /** A source may be named this turn (library documents, web source or protocol evidence were available). */
  sourceAllowed: boolean;
  firstSentenceMs?: number;
  firstSentenceBudgetMs?: number;
};

/** Words that name a source the caller will take as evidence. */
export const SOURCE_WORDS = /(estudio|revisi[oó]n|gu[ií]a|protocolo de neuroljus|seg[uú]n|study|review|guideline|according to|neuroljus protocol|studie|[öo]versikt|riktlinje|enligt)/i;
/** A study, review or institution named when nothing was retrieved: an invented source. */
const INVENTED_SOURCE = /(estudio|revisi[oó]n sistem[áa]tica|metaan[áa]lisis|study|systematic review|meta-analysis|studie|[öo]versikt|metaanalys|\b(nice|nhs|oms|who|cdc)\b)/i;
const MARKDOWN = /[*_#`]|\[\d+\]|https?:\/\//;
const TAGS = /\[(slow|warm|calm|pause|soft|gentle)\]/i;
const NUMBER_FIRST = /\d{3}|emergencias|emergency|nödnum|en qué país|which country|vilket land/i;

export function checkTurn(t: TurnCheck): string[] {
  const problems: string[] = [];
  const sentences = splitSentences(t.text);
  if (sentences.length === 0) problems.push("empty answer");
  if (MARKDOWN.test(t.text)) problems.push("markdown, citation bracket or URL in speech");
  if (TAGS.test(t.text)) problems.push("stage tag in speech");
  if (t.asksWhomToCall && !(sentences[0] && NUMBER_FIRST.test(sentences[0]))) problems.push(`caller asked whom to call but the first sentence is not the number or the country question: "${sentences[0] ?? ""}"`);
  if (!t.sourceAllowed) for (const s of sentences) if (INVENTED_SOURCE.test(s)) problems.push(`source named with nothing to cite: "${s}"`);
  if (t.firstSentenceMs !== undefined && t.firstSentenceBudgetMs !== undefined && t.firstSentenceMs > t.firstSentenceBudgetMs) problems.push(`first sentence took ${t.firstSentenceMs} ms (budget ${t.firstSentenceBudgetMs})`);
  return problems;
}
