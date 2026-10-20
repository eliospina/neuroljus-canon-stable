/**
 * Speech guard: the clinical rules applied in code to what the model says,
 * sentence by sentence, while it streams. The model is asked to follow the
 * same rules; the guard makes sure.
 *
 * - emergency wording is never a reason to drop a sentence: the model decides
 *   what to say about emergencies (the prompt carries the clinical rule); the
 *   cap and the repeat rule spare a sentence that gives the emergency number
 * - never medication, never a diagnosis verdict
 * - no emotional filler aimed at the caller
 * - never a sentence already said in this call
 * - at most N sentences (2 when the autistic person is calling, else 4)
 * - plain speech: no markdown, no citation brackets, no URLs
 */

import type { EmergencyLang } from "../emergency";
import { MEDICATION_ASK, claimsDiagnosis, plainSpeech } from "./spoken";

const L = "(?<![\\p{L}\\p{N}])";
const R = "(?![\\p{L}\\p{N}])";
const w = (alts: string) => new RegExp(`${L}(?:${alts})${R}`, "iu");

export const EMERGENCY_WORDS = w("emergencias?|ambulancia|urgencias|112|911|123|999|000|192|131|106|emergency|ambulance|paramedic\\p{L}*|larmnum\\p{L}*|n[öo]dnum\\p{L}*|ambulans\\p{L}*|akuten");

/** Emotional filler the line never says to the caller. */
export const FILLER = w(
  "lo siento( mucho)?|debe ser (agotador|muy duro|dif[ií]cil|duro)|te entiendo|entiendo c[oó]mo te sientes|estoy contigo|no te dejo sol[ao]|no est[áa]s sol[ao]|hiciste bien|lo est[áa]s haciendo (muy )?bien|qu[ée] dif[ií]cil|tranquil[ao],? (respira|todo)|" +
    "i'?m (so )?sorry|that must be (exhausting|hard|so hard|difficult)|i understand( how you feel)?|i'?m (here )?with you|you'?re not alone|i won'?t leave you|you did (well|the right thing|great)|you'?re doing great|" +
    "jag f[öo]rst[åa]r|det m[åa]ste vara (utmattande|sv[åa]rt|tungt)|jag [äa]r (h[äa]r )?med dig|du [äa]r inte ensam|du gjorde r[äa]tt|du g[öo]r det bra"
);

/** Putting means out of reach, allowed to name pills or blades when the intent is suicidal. */
export const MEANS_REMOVAL = w("retira\\p{L}*|guarda\\p{L}*|fuera de (su |tu )?alcance|aleja\\p{L}*|esconde\\p{L}*|bajo llave|remove|take (them |it )?(away|out)|out of (her|his|their|your) reach|lock (them |it )?(away|up)|put (them |it )?away|has (she|he) taken|taken any|ta bort|l[åa]s in|utom r[äa]ckh[åa]ll|g[öo]m|tagit n[åa]gra");

/** Stage directions some voice prompts use. Never spoken. */
const TAGS = /\[(slow|warm|calm|pause|soft|gentle|whisper)\]/gi;
/** Leaked reasoning tags are never spoken. */
const THINKING = /<\/?thinking>[\s\S]*?(<\/thinking>|$)/gi;

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+(?=[^\s])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function normalizeSentence(s: string): string {
  return s.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();
}

export type GuardRules = {
  lang: EmergencyLang;
  /** Triage found a severe signal (kept for callers' information; no longer gates any rule). */
  severe: boolean;
  /** Suicidal intent in the call: removing means (pills, blades) is a safety step, not medication advice. */
  suicidal?: boolean;
  /** Sentences said earlier in this call. */
  previous: string[];
  maxSentences: number;
};

const prevCache = new WeakMap<GuardRules, Set<string>>();
function previousSentences(rules: GuardRules): Set<string> {
  let set = prevCache.get(rules);
  if (!set) {
    set = new Set(rules.previous.flatMap((p) => splitSentences(p).map(normalizeSentence)));
    prevCache.set(rules, set);
  }
  return set;
}

export type GuardDecision = { keep: boolean; reason?: "medication" | "diagnosis" | "filler" | "repeat" | "limit" | "empty" };

export function judgeSentence(sentence: string, rules: GuardRules, emittedSoFar: number, saidInThisTurn: Set<string>): GuardDecision {
  const s = plainSpeech(sentence.replace(TAGS, "").replace(THINKING, "")).trim();
  if (!s) return { keep: false, reason: "empty" };
  // A sentence that gives the emergency number is never cut by the cap.
  const emergencyKept = EMERGENCY_WORDS.test(s);
  if (emittedSoFar >= rules.maxSentences && !emergencyKept) return { keep: false, reason: "limit" };
  if (MEDICATION_ASK.test(s) && !(rules.suicidal && MEANS_REMOVAL.test(s))) return { keep: false, reason: "medication" };
  if (claimsDiagnosis(s)) return { keep: false, reason: "diagnosis" };
  if (FILLER.test(s)) return { keep: false, reason: "filler" };
  const n = normalizeSentence(s);
  // The emergency number may be said again on a later turn (the caller may ask for it again).
  const emergencyAgain = EMERGENCY_WORDS.test(s) && !saidInThisTurn.has(n);
  if (!emergencyAgain && n.length >= 12 && (saidInThisTurn.has(n) || previousSentences(rules).has(n))) return { keep: false, reason: "repeat" };
  return { keep: true };
}

/**
 * Streaming guard: feed text deltas, get back complete sentences that pass the
 * rules. Call `flush()` at the end for the trailing sentence.
 */
export class SpeechGuard {
  private buffer = "";
  private emitted = 0;
  private said = new Set<string>();
  readonly dropped: Array<{ sentence: string; reason: NonNullable<GuardDecision["reason"]> }> = [];

  constructor(private rules: GuardRules) {}

  push(delta: string): string[] {
    this.buffer += delta;
    const out: string[] = [];
    // Emit every complete sentence; keep the tail in the buffer.
    let m: RegExpExecArray | null;
    const re = /^([\s\S]*?[.!?…])(?:\s+|$)(?=[^\s]|$)/u;
    while ((m = re.exec(this.buffer)) && m[0].length < this.buffer.length) {
      const sentence = m[1];
      this.buffer = this.buffer.slice(m[0].length);
      const kept = this.judge(sentence);
      if (kept) out.push(kept);
    }
    return out;
  }

  flush(): string[] {
    const rest = this.buffer.trim();
    this.buffer = "";
    if (!rest) return [];
    const out: string[] = [];
    for (const s of splitSentences(rest)) {
      const kept = this.judge(s);
      if (kept) out.push(kept);
    }
    return out;
  }

  get count(): number {
    return this.emitted;
  }

  /** A sentence already spoken by code this turn: counts toward the cap and is not repeated. */
  markSaid(sentence: string): void {
    this.emitted += 1;
    this.said.add(normalizeSentence(sentence));
  }

  private judge(sentence: string): string | null {
    const d = judgeSentence(sentence, this.rules, this.emitted, this.said);
    const clean = plainSpeech(sentence.replace(TAGS, "").replace(THINKING, "")).trim();
    if (!d.keep) {
      if (d.reason && d.reason !== "empty") this.dropped.push({ sentence: clean, reason: d.reason });
      return null;
    }
    this.emitted += 1;
    this.said.add(normalizeSentence(clean));
    return clean;
  }
}
