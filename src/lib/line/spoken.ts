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

/**
 * Medication wording, es/en/sv. Bare "dos" is left out on purpose ("dos años",
 * "a las dos" are not medication) and so is "receta" alone ("receta de cocina").
 */
export const MEDICATION_ASK =
  /(?<![\p{L}\p{N}])(medicament\p{L}*|medicaci[oó]n|medicin(a|as|e)|dosis|dosificar|dosering\p{L}*|doser|dosen|dose|dosage|receta m[ée]dica|prescri\p{L}*|pastillas?|pills?|tabletter|medication\p{L}*|l[äa]kemedel|melatonin\p{L}*|risperidon\p{L}*|aripiprazol\p{L}*|metilfenidat\p{L}*|methylphenidat\p{L}*|metylfenidat\p{L}*|fluoxetin\p{L}*|sertralin\p{L}*)(?![\p{L}\p{N}])/iu;

const DIAGNOSIS_VERDICT = /(?<![\p{L}\p{N}])(s[ií],? (tiene|es) autis\p{L}*|(tu|su) (hij[oa]|hermano|hermana|pareja) (es|tiene) autis\p{L}*|your (son|daughter|child|partner|brother|sister) (is|has) autis\p{L}*|(din|ditt) (son|dotter|barn) (har|[äa]r) autis\p{L}*)(?![\p{L}\p{N}])/iu;

/** A sentence that tells the caller their relative is autistic: not ours to say, so it is never read aloud. */
export function claimsDiagnosis(text: string): boolean {
  return DIAGNOSIS_VERDICT.test(text);
}

const CLINICIAN: Record<EmergencyLang, string> = {
  es: "De medicamentos y dosis no puedo hablar. Eso lo decide su médico o su médica. Si quieres, te ayudo con lo que sí puedes hacer hoy.",
  en: "I can't talk about medication or doses. Their doctor decides that. If you like, I can help with what you can do today.",
  sv: "Jag kan inte prata om läkemedel eller doser. Det bestämmer läkaren. Vill du kan jag hjälpa dig med vad du kan göra i dag.",
};

export function clinicianSentence(lang: EmergencyLang): string {
  return CLINICIAN[lang];
}
