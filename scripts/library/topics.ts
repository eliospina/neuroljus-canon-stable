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
    terms: '("augmentative and alternative communication" OR AAC OR "minimally verbal" OR nonverbal OR "non-speaking" OR "nonspeaking" OR "picture exchange" OR "speech-generating" OR "functional communication training" OR "functional communication")',
    target: 70,
  },
  {
    id: "crisis_regulation",
    label: { es: "Crisis y regulación", en: "Meltdowns and regulation", sv: "Utbrott och reglering" },
    terms: '(meltdown* OR "emotion regulation" OR "emotional regulation" OR "emotion dysregulation" OR irritability OR "self-injur*" OR shutdown* OR "autistic burnout" OR "de-escalation" OR "low arousal")',
    target: 90,
  },
  {
    id: "sleep",
    label: { es: "Sueño", en: "Sleep", sv: "Sömn" },
    terms: '(sleep OR insomnia OR bedtime OR "night waking" OR "sleep problems" OR "behavioral sleep")',
    target: 55,
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
    terms: '(parent* OR caregiver* OR family OR sibling* OR "parent training" OR "parent-mediated" OR respite OR "caregiver burden" OR "parenting stress" OR burnout)',
    target: 70,
  },
  {
    id: "transitions",
    label: { es: "Cambios de rutina y transiciones", en: "Routine changes and transitions", sv: "Rutinförändringar och övergångar" },
    terms: '(routine* OR transition* OR predictab* OR "insistence on sameness" OR "change" OR "social stories" OR "video modeling" OR "visual support*" OR "visual schedule*" OR "demand avoidance")',
    target: 55,
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
    terms: '(pain OR "health care" OR healthcare OR dental OR hospital OR "emergency department" OR interoception OR gastrointestinal OR constipation OR "medical comorbid*")',
    target: 60,
  },
  {
    id: "challenging_behavior",
    label: { es: "Agresión, autolesión y crisis graves", en: "Aggression, self-injury and severe distress", sv: "Aggression, självskada och svåra kriser" },
    terms: '("challenging behavio*" OR "problem behavio*" OR "behavio* problems" OR aggress* OR "self-injur*" OR "self-harm*" OR suicid* OR "disruptive behavio*" OR tantrum* OR meltdown* OR anger OR outburst* OR "behavio* that challenges" OR "property destruction" OR elopement OR "restraint" OR "seclusion")',
    target: 160,
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

/** Randomized and controlled trials (prioritised next to reviews). */
export const TRIAL_QUERY = '(PUB_TYPE:"Randomized Controlled Trial" OR PUB_TYPE:"Controlled Clinical Trial" OR TITLE:"randomized" OR TITLE:"randomised")';

/**
 * Focused query packs for crisis, aggression and their causes. Each pack runs
 * through the same tiers and filter as a topic and tags its documents with
 * the listed topics. Queries are in English (Europe PMC).
 */
export type QueryPack = { id: string; terms: string; topics: TopicId[] };

export const QUERY_PACKS: QueryPack[] = [
  { id: "fba", terms: '("functional behavior assessment" OR "functional behaviour assessment" OR "functional analysis" OR "functional assessment")', topics: ["challenging_behavior"] },
  { id: "fct", terms: '("functional communication training" OR "functional communication")', topics: ["challenging_behavior", "communication_aac"] },
  { id: "pbs", terms: '("positive behavior support" OR "positive behaviour support" OR "positive behavioral support" OR PBS) AND (autis* OR "intellectual disabilit*" OR "developmental disabilit*")', topics: ["challenging_behavior"] },
  { id: "parent_mediated", terms: '("parent-mediated" OR "parent training" OR "parent management training" OR "behavioral parent training") AND (behavio* OR aggress* OR tantrum* OR disruptive)', topics: ["challenging_behavior", "family_caregivers"] },
  { id: "aggression_sib", terms: '(aggress* OR "self-injur*" OR "self-harm*") AND (prevalence OR "risk factor*" OR intervention* OR treatment)', topics: ["challenging_behavior"] },
  { id: "meltdown_irritability", terms: '(meltdown* OR "emotion regulation" OR "emotion dysregulation" OR irritability OR "anger outburst*")', topics: ["crisis_regulation", "challenging_behavior"] },
  { id: "cps_low_arousal", terms: '("collaborative and proactive solutions" OR "collaborative problem solving" OR "low arousal" OR "low-arousal" OR "de-escalation")', topics: ["crisis_regulation", "challenging_behavior"] },
  { id: "medical_causes", terms: '(pain OR gastrointestinal OR constipation OR dental OR "sleep problem*" OR "medical condition*") AND ("challenging behavio*" OR "problem behavio*" OR aggress* OR "self-injur*" OR irritability)', topics: ["pain_health", "challenging_behavior"] },
  { id: "restraint_seclusion", terms: '(restraint OR seclusion OR "restrictive practice*" OR "restrictive intervention*")', topics: ["challenging_behavior"] },
  { id: "caregiver_stress", terms: '("caregiver stress" OR "parenting stress" OR "caregiver burden" OR "parental stress" OR burnout OR respite)', topics: ["family_caregivers"] },
  { id: "visual_transitions_pda", terms: '("visual support*" OR "visual schedule*" OR transition* OR "demand avoidance" OR "pathological demand avoidance")', topics: ["transitions"] },
];
