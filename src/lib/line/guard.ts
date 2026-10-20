/**
 * Speech streamer: turns the model's text deltas into complete sentences for
 * the voice, as soon as each one is ready. It drops nothing the model decided
 * to say. It only strips what a voice cannot speak: markdown, citation
 * brackets, stage tags, leaked reasoning tags.
 */

import type { EmergencyLang } from "../emergency";
import { plainSpeech } from "./spoken";

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

export function cleanSentence(sentence: string): string {
  return plainSpeech(sentence.replace(TAGS, "").replace(THINKING, "")).trim();
}

export type GuardRules = { lang: EmergencyLang };

export class SpeechGuard {
  private buffer = "";
  private emitted = 0;

  constructor(readonly rules: GuardRules) {}

  push(delta: string): string[] {
    this.buffer += delta;
    const out: string[] = [];
    // Emit every complete sentence; keep the tail in the buffer.
    let m: RegExpExecArray | null;
    const re = /^([\s\S]*?[.!?…])(?:\s+|$)(?=[^\s]|$)/u;
    while ((m = re.exec(this.buffer)) && m[0].length < this.buffer.length) {
      const sentence = m[1];
      this.buffer = this.buffer.slice(m[0].length);
      const clean = cleanSentence(sentence);
      if (clean) {
        this.emitted += 1;
        out.push(clean);
      }
    }
    return out;
  }

  flush(): string[] {
    const rest = this.buffer.trim();
    this.buffer = "";
    if (!rest) return [];
    const out: string[] = [];
    for (const s of splitSentences(rest)) {
      const clean = cleanSentence(s);
      if (clean) {
        this.emitted += 1;
        out.push(clean);
      }
    }
    return out;
  }

  get count(): number {
    return this.emitted;
  }

  /** A sentence already spoken by code this turn. */
  markSaid(): void {
    this.emitted += 1;
  }
}
