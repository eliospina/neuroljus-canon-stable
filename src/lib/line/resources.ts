/**
 * Non-urgent resources by country: crisis lines and autism associations, for
 * the end of a call or a calm question. Never a substitute for the emergency
 * number (emergency.ts) when there is a severe signal.
 *
 * Numbers were written from general knowledge and must be checked against
 * each country's official page before a real caller hears them: each entry
 * carries `verify`, the page to check. Where there is no verified line, the
 * fallback says so honestly instead of inventing one.
 */

import type { EmergencyLang } from "../emergency";

export type Resource = {
  /** What it is, in the three languages. */
  name: Record<EmergencyLang, string>;
  /** Dialable number or short code, as the person would dial it inside the country. */
  number: string;
  /** "crisis" is a mental-health or suicide line; "health" general health advice; "autism" an association. */
  kind: "crisis" | "health" | "autism";
  /** When it answers, if known. */
  hours?: string;
  /** Official page to verify the number against. */
  verify: string;
};

const tri = (es: string, en: string, sv: string) => ({ es, en, sv });

export const RESOURCES: Record<string, Resource[]> = {
  SE: [
    { name: tri("Självmordslinjen (Mind), línea de prevención del suicidio", "Självmordslinjen (Mind), suicide prevention line", "Självmordslinjen (Mind)"), number: "90101", kind: "crisis", hours: "24/7", verify: "https://mind.se/hitta-hjalp/sjalvmordslinjen/" },
    { name: tri("1177, consejo sanitario", "1177, health advice", "1177 Vårdguiden"), number: "1177", kind: "health", hours: "24/7", verify: "https://www.1177.se" },
    { name: tri("Autism Sverige, asociación", "Autism Sverige, association", "Autism Sverige"), number: "08-420 030 50", kind: "autism", verify: "https://www.autism.se" },
  ],
  ES: [
    { name: tri("024, línea de atención a la conducta suicida", "024, suicide prevention line", "024, linje för självmordsprevention"), number: "024", kind: "crisis", hours: "24/7", verify: "https://www.sanidad.gob.es/linea024/" },
    { name: tri("Teléfono de la Esperanza", "Teléfono de la Esperanza, crisis line", "Teléfono de la Esperanza, krislinje"), number: "717 003 717", kind: "crisis", hours: "24/7", verify: "https://www.telefonodelaesperanza.org" },
    { name: tri("Confederación Autismo España", "Autismo España, confederation", "Autismo España"), number: "91 591 34 09", kind: "autism", verify: "https://autismo.org.es" },
  ],
  CO: [
    { name: tri("Línea 106, salud mental (Bogotá)", "Line 106, mental health (Bogotá)", "Linje 106, psykisk hälsa (Bogotá)"), number: "106", kind: "crisis", hours: "24/7", verify: "https://www.saludcapital.gov.co" },
    { name: tri("Línea 192, Ministerio de Salud (opción salud mental)", "Line 192, Ministry of Health (mental health option)", "Linje 192, hälsoministeriet"), number: "192", kind: "health", verify: "https://www.minsalud.gov.co" },
    { name: tri("Liga Colombiana de Autismo (LICA)", "Liga Colombiana de Autismo (LICA)", "Liga Colombiana de Autismo (LICA)"), number: "", kind: "autism", verify: "https://www.ligautismo.org" },
  ],
  MX: [
    { name: tri("Línea de la Vida", "Línea de la Vida, crisis line", "Línea de la Vida, krislinje"), number: "800 911 2000", kind: "crisis", hours: "24/7", verify: "https://www.gob.mx/salud/conadic" },
    { name: tri("Teletón, Centro Autismo Teletón", "Teletón autism centre", "Teletón autismcenter"), number: "", kind: "autism", verify: "https://teleton.org" },
  ],
  US: [
    { name: tri("988, línea de crisis y suicidio", "988 Suicide and Crisis Lifeline", "988, kris- och självmordslinje"), number: "988", kind: "crisis", hours: "24/7", verify: "https://988lifeline.org" },
    { name: tri("Autism Society, línea de ayuda", "Autism Society helpline", "Autism Society"), number: "800-328-8476", kind: "autism", verify: "https://autismsociety.org" },
  ],
  GB: [
    { name: tri("Samaritans", "Samaritans", "Samaritans"), number: "116 123", kind: "crisis", hours: "24/7", verify: "https://www.samaritans.org" },
    { name: tri("NHS 111, consejo sanitario", "NHS 111, health advice", "NHS 111"), number: "111", kind: "health", hours: "24/7", verify: "https://111.nhs.uk" },
    { name: tri("National Autistic Society", "National Autistic Society", "National Autistic Society"), number: "0808 800 4104", kind: "autism", verify: "https://www.autism.org.uk" },
  ],
  BR: [
    { name: tri("CVV, Centro de Valorização da Vida", "CVV, emotional support line", "CVV, stödlinje"), number: "188", kind: "crisis", hours: "24/7", verify: "https://www.cvv.org.br" },
    { name: tri("Disque Saúde", "Disque Saúde, health line", "Disque Saúde"), number: "136", kind: "health", verify: "https://www.gov.br/saude" },
  ],
  CL: [
    { name: tri("Salud Responde", "Salud Responde, health and mental health line", "Salud Responde"), number: "600 360 7777", kind: "health", hours: "24/7", verify: "https://www.minsal.cl" },
    { name: tri("*4141, línea de prevención del suicidio", "*4141, suicide prevention line", "*4141, självmordsprevention"), number: "*4141", kind: "crisis", hours: "24/7", verify: "https://www.minsal.cl" },
  ],
  PE: [
    { name: tri("Línea 113, opción 5, salud mental (MINSA)", "Line 113, option 5, mental health (MINSA)", "Linje 113, val 5, psykisk hälsa"), number: "113", kind: "crisis", hours: "24/7", verify: "https://www.gob.pe/minsa" },
  ],
};

export const RESOURCE_FALLBACK: Record<EmergencyLang, string> = {
  es: "No tengo una línea de apoyo verificada para tu país. Busca «línea de crisis» con el nombre de tu país, o pregunta en tu centro de salud. Si hay peligro, el número de emergencias.",
  en: "I do not have a verified support line for your country. Search for 'crisis line' with your country's name, or ask your health centre. If there is danger, the emergency number.",
  sv: "Jag har ingen verifierad stödlinje för ditt land. Sök på 'krislinje' med ditt lands namn, eller fråga din vårdcentral. Vid fara, nödnumret.",
};

/** Spoken resource lines for a country, or the honest fallback. */
export function resourcesFor(country: string | null | undefined, lang: EmergencyLang, kinds: Resource["kind"][] = ["crisis", "health", "autism"]): string[] {
  const list = (RESOURCES[(country || "").toUpperCase()] ?? []).filter((r) => kinds.includes(r.kind));
  if (list.length === 0) return [RESOURCE_FALLBACK[lang]];
  return list.map((r) => (r.number ? `${r.name[lang]}: ${r.number}${r.hours ? ` (${r.hours})` : ""}.` : `${r.name[lang]}.`));
}
