/**
 * Library topics — labels only, safe to import in client components
 * (no JSON data behind this module).
 */

export type TopicId =
  | "sensory"
  | "communication_aac"
  | "crisis_regulation"
  | "sleep"
  | "anxiety"
  | "feeding"
  | "school"
  | "adult_life"
  | "family_caregivers"
  | "transitions"
  | "women_girls"
  | "pain_health";

export const TOPIC_LABELS: Record<TopicId, { es: string; en: string; sv: string }> = {
  sensory: { es: "Procesamiento sensorial", en: "Sensory processing", sv: "Sensorisk bearbetning" },
  communication_aac: { es: "Comunicación y CAA", en: "Communication and AAC", sv: "Kommunikation och AKK" },
  crisis_regulation: { es: "Crisis y regulación", en: "Meltdowns and regulation", sv: "Utbrott och reglering" },
  sleep: { es: "Sueño", en: "Sleep", sv: "Sömn" },
  anxiety: { es: "Ansiedad", en: "Anxiety", sv: "Ångest" },
  feeding: { es: "Alimentación", en: "Feeding and eating", sv: "Mat och ätande" },
  school: { es: "Escuela", en: "School", sv: "Skola" },
  adult_life: { es: "Empleo y vida adulta", en: "Employment and adult life", sv: "Arbete och vuxenliv" },
  family_caregivers: { es: "Familia y cuidadores", en: "Family and caregivers", sv: "Familj och vårdgivare" },
  transitions: { es: "Cambios de rutina y transiciones", en: "Routine changes and transitions", sv: "Rutinförändringar och övergångar" },
  women_girls: { es: "Autismo en mujeres", en: "Autism in women and girls", sv: "Autism hos kvinnor och flickor" },
  pain_health: { es: "Dolor y salud", en: "Pain and health", sv: "Smärta och hälsa" },
};

export const TOPIC_ORDER: TopicId[] = [
  "sensory",
  "communication_aac",
  "crisis_regulation",
  "transitions",
  "sleep",
  "anxiety",
  "feeding",
  "school",
  "adult_life",
  "women_girls",
  "pain_health",
  "family_caregivers",
];
