/**
 * Helpers that turn written text into short spoken text: no markdown, no
 * citation markers, no list symbols, a hard cap on sentences.
 */

import type { EmergencyLang } from "../emergency";

export function plainSpeech(text: string): string {
  return text
    .replace(/\[(?:SCIENCE|PRACTICE|PERSON|IDEA|SAFETY)\]/gi, "")
    .replace(/\[\d+\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>|]/g, "")
    .replace(/^\s*[-•·]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sentences(text: string): string[] {
  return plainSpeech(text)
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** At most `max` sentences, joined with a space. */
export function firstSentences(text: string, max: number): string {
  return sentences(text).slice(0, max).join(" ");
}

/** Makes sure a spoken fragment ends with a full stop. */
export function stop(text: string): string {
  const t = text.trim();
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

export const MEDICATION_ASK = /(?<![\p{L}\p{N}])(medicament\p{L}*|medicaci[oó]n|medicin(a|as|e)\b|dosis|dosificar|receta\p{L}*|pastillas?|medication\p{L}*|medicine|dose|dosage|prescri\p{L}*|pills?|l[äa]kemedel|medicin\p{L}*|dos(er|en)?\b|tabletter)(?![\p{L}\p{N}])/iu;

const CLINICIAN: Record<EmergencyLang, string> = {
  es: "De medicamentos y dosis no puedo hablar. Eso lo decide su médico o su médica. Si quieres, te ayudo con lo que sí puedes hacer hoy.",
  en: "I can't talk about medication or doses. Their doctor decides that. If you like, I can help with what you can do today.",
  sv: "Jag kan inte prata om läkemedel eller doser. Det bestämmer läkaren. Vill du kan jag hjälpa dig med vad du kan göra i dag.",
};

export function clinicianSentence(lang: EmergencyLang): string {
  return CLINICIAN[lang];
}
