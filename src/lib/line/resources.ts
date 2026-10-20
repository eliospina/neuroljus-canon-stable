/**
 * Non-urgent resources by country: crisis lines and autism associations, for
 * the end of a call or a calm question. Never a substitute for the emergency
 * number (emergency.ts) when there is a severe signal.
 *
 * Every number was checked against the official page named in `verify` on
 * 2026-10-20 (see docs/line/README.md, "Números verificados"). Where there is
 * no verified line, the fallback says so honestly instead of inventing one.
 * Re-check once a year: helplines close (the National Autistic Society's did
 * in 2021) and menus change.
 */

import type { EmergencyLang } from "../emergency";

export type Resource = {
  /** What it is, in the three languages. */
  name: Record<EmergencyLang, string>;
  /** Dialable number or short code, as the person would dial it inside the country. Empty when the association has no public line. */
  number: string;
  /** "crisis" is a mental-health or suicide line; "health" general health advice; "autism" an association. */
  kind: "crisis" | "health" | "autism";
  /** When it answers, if known. */
  hours?: string;
  /** Official page the number was verified against. */
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
    // National mental-health teleorientation line since 2025 (MinSalud directory, Aug 2025); also Bogotá's line.
    { name: tri("Línea 106, salud mental", "Line 106, mental health", "Linje 106, psykisk hälsa"), number: "106", kind: "crisis", hours: "24/7", verify: "https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/VS/PP/ENT/directorio-salud-mental-prevencion-suicidio-minsalud.pdf" },
    { name: tri("Liga Colombiana de Autismo (LICA)", "Liga Colombiana de Autismo (LICA)", "Liga Colombiana de Autismo (LICA)"), number: "601 357 5260", kind: "autism", verify: "https://www.ligautismo.org" },
  ],
  MX: [
    { name: tri("Línea de la Vida", "Línea de la Vida, crisis line", "Línea de la Vida, krislinje"), number: "800 911 2000", kind: "crisis", hours: "24/7", verify: "https://www.gob.mx/lineadelavida" },
    { name: tri("Centro Autismo Teletón", "Teletón autism centre", "Teletón autismcenter"), number: "55 5699 2122", kind: "autism", hours: "lunes a sábado, 7:30 a 18:00", verify: "https://teleton.org/cat" },
  ],
  US: [
    { name: tri("988, línea de crisis y suicidio", "988 Suicide and Crisis Lifeline", "988, kris- och självmordslinje"), number: "988", kind: "crisis", hours: "24/7", verify: "https://988lifeline.org" },
    { name: tri("Autism Society, línea de ayuda", "Autism Society helpline", "Autism Society"), number: "800-328-8476", kind: "autism", hours: "Mon–Fri 9–19 ET", verify: "https://autismsociety.org/contact-us/" },
  ],
  GB: [
    { name: tri("Samaritans", "Samaritans", "Samaritans"), number: "116 123", kind: "crisis", hours: "24/7", verify: "https://www.samaritans.org" },
    { name: tri("NHS 111, consejo sanitario", "NHS 111, health advice", "NHS 111"), number: "111", kind: "health", hours: "24/7", verify: "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/" },
    // The NAS helpline closed in June 2021: the association is named, with no number to dial.
    { name: tri("National Autistic Society (autism.org.uk)", "National Autistic Society (autism.org.uk)", "National Autistic Society (autism.org.uk)"), number: "", kind: "autism", verify: "https://www.autism.org.uk/contact-us" },
  ],
  BR: [
    { name: tri("CVV, Centro de Valorização da Vida", "CVV, emotional support line", "CVV, stödlinje"), number: "188", kind: "crisis", hours: "24/7", verify: "https://www.cvv.org.br" },
    { name: tri("Disque Saúde, información del Ministerio de Salud", "Disque Saúde, Ministry of Health information line", "Disque Saúde, hälsoministeriets informationslinje"), number: "136", kind: "health", hours: "seg–sex 8–20, sáb 8–18", verify: "https://www.gov.br/saude/pt-br/canais-de-atendimento" },
  ],
  CL: [
    { name: tri("Salud Responde, opción 2 salud mental", "Salud Responde, option 2 mental health", "Salud Responde, val 2 psykisk hälsa"), number: "600 360 7777", kind: "health", hours: "24/7", verify: "https://saludresponde.minsal.cl" },
    { name: tri("*4141, línea de prevención del suicidio (desde celular)", "*4141, suicide prevention line (from a mobile)", "*4141, självmordsprevention (från mobil)"), number: "*4141", kind: "crisis", hours: "24/7", verify: "https://www.minsal.cl/ministerio-de-salud-anuncio-fono-4141-de-prevencion-del-suicidio/" },
  ],
  PE: [
    // The IVR option for mental health has changed over time (5, then 3 and 5): the line is named without the option.
    { name: tri("Línea 113, opción salud mental (MINSA)", "Line 113, mental health option (MINSA)", "Linje 113, val psykisk hälsa (MINSA)"), number: "113", kind: "crisis", hours: "24/7", verify: "https://www.gob.pe/555-linea-113-salud-recibir-orientacion-e-informacion-en-salud" },
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
