/**
 * Library topics — practical, day-to-day themes for caregivers and autistic
 * people. Each topic has Europe PMC query terms and labels in es/en/sv.
 */

import type { TopicId } from "./lib";

export type Topic = {
  id: TopicId;
  label: { es: string; en: string; sv: string };
  /** Europe PMC boolean query fragment (title/abstract terms). */
  terms: string;
  /** How many documents to keep for this topic. */
  target: number;
};

export const TOPICS: Topic[] = [
  {
    id: "sensory",
    label: { es: "Procesamiento sensorial", en: "Sensory processing", sv: "Sensorisk bearbetning" },
    terms: '(sensory OR "sensory processing" OR hypersensitivity OR hyporeactivity OR "sensory over-responsivity" OR noise OR "auditory")',
    target: 50,
  },
  {
    id: "communication_aac",
    label: { es: "Comunicación y CAA", en: "Communication and AAC", sv: "Kommunikation och AKK" },
    terms: '("augmentative and alternative communication" OR AAC OR "minimally verbal" OR nonverbal OR "non-speaking" OR "nonspeaking" OR "picture exchange" OR "speech-generating")',
    target: 45,
  },
  {
    id: "crisis_regulation",
    label: { es: "Crisis y regulación", en: "Meltdowns and regulation", sv: "Utbrott och reglering" },
    terms: '(meltdown* OR "emotion regulation" OR "emotional regulation" OR "self-injur*" OR "challenging behavio*" OR shutdown* OR "autistic burnout" OR "de-escalation")',
    target: 45,
  },
  {
    id: "sleep",
    label: { es: "Sueño", en: "Sleep", sv: "Sömn" },
    terms: '(sleep OR insomnia OR melatonin OR bedtime)',
    target: 35,
  },
  {
    id: "anxiety",
    label: { es: "Ansiedad", en: "Anxiety", sv: "Ångest" },
    terms: '(anxiety OR "intolerance of uncertainty" OR worry OR "cognitive behavio*")',
    target: 40,
  },
  {
    id: "feeding",
    label: { es: "Alimentación", en: "Feeding and eating", sv: "Mat och ätande" },
    terms: '(feeding OR "food selectivity" OR "eating" OR mealtime* OR "picky eating" OR ARFID OR "gastrointestinal")',
    target: 35,
  },
  {
    id: "school",
    label: { es: "Escuela", en: "School", sv: "Skola" },
    terms: '(school OR classroom OR teacher* OR "inclusive education" OR "visual schedule*" OR "visual support*")',
    target: 40,
  },
  {
    id: "adult_life",
    label: { es: "Empleo y vida adulta", en: "Employment and adult life", sv: "Arbete och vuxenliv" },
    terms: '(employment OR workplace OR "autistic adults" OR "independent living" OR "transition to adulthood" OR "quality of life" OR "older autistic")',
    target: 45,
  },
  {
    id: "family_caregivers",
    label: { es: "Familia y cuidadores", en: "Family and caregivers", sv: "Familj och vårdgivare" },
    terms: '(parent* OR caregiver* OR family OR sibling* OR "parent training" OR "parent-mediated" OR respite)',
    target: 45,
  },
  {
    id: "transitions",
    label: { es: "Cambios de rutina y transiciones", en: "Routine changes and transitions", sv: "Rutinförändringar och övergångar" },
    terms: '(routine* OR transition* OR predictab* OR "insistence on sameness" OR "change" OR "social stories" OR "video modeling")',
    target: 35,
  },
  {
    id: "women_girls",
    label: { es: "Autismo en mujeres", en: "Autism in women and girls", sv: "Autism hos kvinnor och flickor" },
    terms: '(women OR girls OR female* OR camouflag* OR masking OR "sex differences" OR "gender differences")',
    target: 40,
  },
  {
    id: "pain_health",
    label: { es: "Dolor y salud", en: "Pain and health", sv: "Smärta och hälsa" },
    terms: '(pain OR "health care" OR healthcare OR dental OR hospital OR "emergency department" OR interoception)',
    target: 40,
  },
];

/** Shared filter: autism in title/abstract, open access, abstract present, not retracted, 2010+. */
export const BASE_QUERY =
  '(TITLE:autis* OR ABSTRACT:autis*) AND OPEN_ACCESS:y AND HAS_ABSTRACT:y ' +
  'AND NOT PUB_TYPE:"Retracted Publication" AND NOT PUB_TYPE:"Retraction of Publication" ' +
  'AND FIRST_PDATE:[2010-01-01 TO 2026-12-31] AND (SRC:MED OR SRC:PMC) AND LANG:eng';

export const EVIDENCE_QUERY = '(PUB_TYPE:"systematic-review" OR PUB_TYPE:"Review" OR PUB_TYPE:"Meta-Analysis" OR TITLE:"meta-analysis" OR TITLE:"systematic review" OR TITLE:"scoping review")';

export const PARTICIPATORY_QUERY =
  '(ABSTRACT:"autistic adults" OR ABSTRACT:"autistic people" OR ABSTRACT:participatory OR ABSTRACT:"co-produced" OR ABSTRACT:"co-designed" OR ABSTRACT:"lived experience" OR ABSTRACT:"autistic community")';
