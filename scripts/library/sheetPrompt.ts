/**
 * Practical sheets — the prompts and checks shared by sheets.ts (one request
 * at a time) and sheetsBatch.ts (Message Batches API).
 *
 * A sheet says what one study means for a caregiver tomorrow morning, in
 * es/en/sv, from the study's open-licence abstract only. Every sheet is
 * checked twice before it stays in the library: by code (no medication or
 * diagnosis wording, no number that is not in the abstract) and by a second
 * model pass that reads the sheet against its abstract.
 */

import type Anthropic from "@anthropic-ai/sdk";
import type { LibraryDoc } from "./lib";

export const SHEET_SCHEMA = {
  type: "object",
  properties: {
    es: { type: "string" },
    en: { type: "string" },
    sv: { type: "string" },
  },
  required: ["es", "en", "sv"],
  additionalProperties: false,
} as const;

export const SHEET_SYSTEM =
  "You write practical sheets for a library of autism research used by caregivers and autistic people (Neuroljus). " +
  "Given one study's title, type and abstract, write what it means for a caregiver tomorrow morning: concrete, calm, respectful, neurodiversity-affirming (identity-first language, no 'suffers from', no 'low functioning', no 'challenging behaviour'). " +
  "Rules: 60-110 words per language. Start with the practical takeaway, then one sentence on the evidence (type of study, who took part) and one on its limits. " +
  "Never diagnose, never recommend medication or doses, never present the study as a rule for every person. Write the same content in Spanish (es), English (en) and Swedish (sv). " +
  "Use only what the abstract says: no numbers, names or findings that are not in it. If the study tested a medicine, say only that it was a medical study and that medical decisions belong to a clinician. " +
  "Respond only with the JSON object.";

export function sheetUserMessage(doc: LibraryDoc): string {
  return (
    `Title: ${doc.title}\nYear: ${doc.year}\nType: ${doc.kind.replace("_", " ")}${doc.participatory ? " (research with autistic people)" : ""}\n` +
    `Journal: ${doc.journal}\n\nAbstract:\n${doc.abstract}`
  );
}

/** Request body for one sheet. Thinking stays adaptive at low effort; max_tokens leaves room for it. */
export function sheetParams(doc: LibraryDoc, model: string): Anthropic.MessageCreateParamsNonStreaming {
  return {
    model,
    max_tokens: 4000,
    system: SHEET_SYSTEM,
    messages: [{ role: "user", content: sheetUserMessage(doc) }],
    output_config: { effort: "low", format: { type: "json_schema", schema: SHEET_SCHEMA } },
  };
}

type Tri = { es: string; en: string; sv: string };

function messageText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** The sheet in a model reply, or null when the reply is a refusal, truncated or malformed. */
export function parseSheet(message: Anthropic.Message): Tri | null {
  if (message.stop_reason !== "end_turn") return null;
  try {
    const parsed = JSON.parse(messageText(message)) as Partial<Tri>;
    if (!parsed.es?.trim() || !parsed.en?.trim() || !parsed.sv?.trim()) return null;
    return { es: parsed.es.trim(), en: parsed.en.trim(), sv: parsed.sv.trim() };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Check 1 — by code
// ---------------------------------------------------------------------------

/** Unambiguous only: a dose, or a named medicine or supplement. Wording about medicine in general goes to the model check. */
const MEDICATION =
  /(\d+(?:[.,]\d+)?\s?(mg|mcg|µg|ml)\b|\b(risperidon\p{L}*|aripiprazol\p{L}*|melatonin\p{L}*|metilfenidat\p{L}*|methylphenidat\p{L}*|metylfenidat\p{L}*|fluoxetin\p{L}*|sertralin\p{L}*|oxytocin\p{L}*|oxitocin\p{L}*|bumetanid\p{L}*|cannabidiol|cbd|omega-3|vitamin\p{L}*|probiotic\p{L}*|probiótic\p{L}*|probiotik\p{L}*))\b/iu;
/** Telling a reader what a person has. Conditional or explanatory phrasing is left to the model check. */
const DIAGNOSIS = /\b(diagnos(e|ing) (your|the|a) (child|person)|diagnosticar a (tu|su|la)|ställa diagnos på (ditt|ert))\b/iu;

/**
 * Numeric values in a text. "48,000", "48.000" and "48 000" are thousands;
 * "82,5" and "82.5" are decimals. Single digits are ignored (sheets may say
 * "one or two steps").
 */
function numbersIn(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(/\d{1,3}(?:[ .,\u00a0\u202f]\d{3})+(?![.,]?\d)|\d+(?:[.,]\d+)?/g)) {
    const raw = m[0];
    const thousands = /^\d{1,3}(?:[ .,\u00a0\u202f]\d{3})+$/.test(raw);
    const value = thousands ? Number(raw.replace(/\D/g, "")) : Number(raw.replace(",", "."));
    if (Number.isFinite(value) && raw.replace(/\D/g, "").length >= 2) out.push(value);
  }
  return out;
}

/** A sheet number is fine when it equals a source number, rounds it (within 3%) or adds two of them. */
function supportedNumber(n: number, source: number[]): boolean {
  if (source.some((m) => m === n || (m > 0 && Math.abs(m - n) / m <= 0.03))) return true;
  return source.some((a, i) => source.some((b, j) => i !== j && a + b === n));
}

export type SheetScreen = {
  /** Breaks a rule outright: the sheet is not kept. */
  reject: string[];
  /** Needs a second look: passed to the model check, which decides. */
  review: string[];
};

/**
 * Deterministic screen against the text the model was given (title, year,
 * journal, abstract: see sheetUserMessage). A dose or a named medicine or
 * supplement rejects the sheet; numbers the code cannot trace, diagnostic
 * phrasing and odd lengths go to the model check with the sheet.
 */
export function localSheetScreen(sheet: Tri, source: string): SheetScreen {
  const reject: string[] = [];
  const review: string[] = [];
  const known = numbersIn(source);
  for (const lang of ["es", "en", "sv"] as const) {
    const text = sheet[lang];
    const words = text.trim().split(/\s+/).length;
    if (words < 30 || words > 170) review.push(`${lang}: ${words} words`);
    if (DIAGNOSIS.test(text)) review.push(`${lang}: diagnostic wording`);
    const med = text.match(MEDICATION);
    if (med) reject.push(`${lang}: names a dose or medicine ("${med[0]}")`);
    for (const n of numbersIn(text)) {
      if (!supportedNumber(n, known)) review.push(`${lang}: number ${n} is not found in the source as written`);
    }
  }
  return { reject, review };
}

// ---------------------------------------------------------------------------
// Check 2 — a second model pass, sheet against abstract
// ---------------------------------------------------------------------------

export const VERIFY_SCHEMA = {
  type: "object",
  properties: {
    supported: { type: "boolean" },
    unsupported_claims: { type: "array", items: { type: "string" } },
    diagnosis_or_medication: { type: "boolean" },
    languages_match: { type: "boolean" },
    verdict: { type: "string", enum: ["pass", "fail"] },
  },
  required: ["supported", "unsupported_claims", "diagnosis_or_medication", "languages_match", "verdict"],
  additionalProperties: false,
} as const;

export const VERIFY_SYSTEM =
  "You check practical sheets in an autism research library against the study abstract they were written from. " +
  "Fail the sheet if any of these is true: it states a finding, number, population, setting or effect that the abstract does not support; " +
  "it diagnoses anyone or tells a reader what a person has; it recommends, names or doses a medication, supplement or diet; " +
  "the Spanish, English and Swedish versions do not say the same thing; or it presents the study as a rule for every person. " +
  "Practical advice that follows reasonably from the abstract is allowed. List each unsupported claim briefly in English. " +
  "Respond only with the JSON object.";

export type SheetVerdict = {
  supported: boolean;
  unsupported_claims: string[];
  diagnosis_or_medication: boolean;
  languages_match: boolean;
  verdict: "pass" | "fail";
};

export function verifyParams(doc: LibraryDoc, model: string, flags: string[] = []): Anthropic.MessageCreateParamsNonStreaming {
  const sheet = doc.sheet!;
  const flagText = flags.length > 0 ? `\n\n--- Check these points specifically ---\n${flags.map((f) => `- ${f}`).join("\n")}` : "";
  return {
    model,
    max_tokens: 4000,
    system: VERIFY_SYSTEM,
    messages: [
      {
        role: "user",
        content:
          `${sheetUserMessage(doc)}\n\n--- Sheet to check ---\n` +
          `ES: ${sheet.es}\n\nEN: ${sheet.en}\n\nSV: ${sheet.sv}${flagText}`,
      },
    ],
    output_config: { effort: "medium", format: { type: "json_schema", schema: VERIFY_SCHEMA } },
  };
}

export function parseVerdict(message: Anthropic.Message): SheetVerdict | null {
  if (message.stop_reason !== "end_turn") return null;
  try {
    const v = JSON.parse(messageText(message)) as SheetVerdict;
    return typeof v.verdict === "string" ? v : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cost
// ---------------------------------------------------------------------------

/**
 * USD per million tokens for claude-sonnet-5-5 (Anthropic first-party
 * pricing, models table cached 2026-10-06): $2 input, $10 output, $0.20
 * cache reads. The Message Batches API bills 50% of these.
 */
export const SONNET_5_5_PRICE = { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 } as const;

export type UsageTotals = { requests: number; input: number; output: number; cacheRead: number; cacheWrite: number };

export function emptyUsage(): UsageTotals {
  return { requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
}

export function addUsage(t: UsageTotals, u: Anthropic.Usage): void {
  t.requests += 1;
  t.input += u.input_tokens ?? 0;
  t.output += u.output_tokens ?? 0;
  t.cacheRead += u.cache_read_input_tokens ?? 0;
  t.cacheWrite += u.cache_creation_input_tokens ?? 0;
}

export function usageCostUsd(t: UsageTotals, batch: boolean): number {
  const p = SONNET_5_5_PRICE;
  const full = (t.input * p.input + t.output * p.output + t.cacheRead * p.cacheRead + t.cacheWrite * p.cacheWrite) / 1_000_000;
  return batch ? full / 2 : full;
}
