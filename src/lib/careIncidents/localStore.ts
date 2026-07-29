/**
 * Local-only serious incident witness notes.
 *
 * Intended for caregivers and staff who are authorized — and often obligated —
 * to document and report mistreatment under local law.
 * Example (Sweden): Lex Sarah pathways and, when needed, IVO.
 * Neuroljus is international; jurisdiction is chosen by the witness.
 * Structuring that testimony locally is legitimate care labor.
 * Never cloud upload by default. Never AI / camera abuse detection.
 */

export type IncidentKind =
  | "violence"
  | "psychological"
  | "neglect"
  | "self_harm_allowed"
  | "speech_cycle"
  | "other";

export type SeriousIncident = {
  id: string;
  createdAt: string;
  kind: IncidentKind;
  /** Country / region — international project; local law differs. */
  jurisdiction: string;
  /** Approximate when it happened (free text). */
  whenApprox: string;
  /** Where / setting. */
  setting: string;
  /** Who did what — roles preferred; names only if the witness chooses. */
  whoWhat: string;
  /** Who else was present. */
  othersPresent: string;
  /** What the person did afterward. */
  personAfter: string;
  /** What the witness did to protect the person. */
  protectionActs: string;
  /** Repeated phrases as spoken, if any. */
  speechCycles: string;
  /** Uncertainty remaining. */
  uncertainty: string;
  /** Reporting pathway planned or used (local duty / inspectorate / counsel). */
  reporting: string;
};

export const INCIDENT_KIND_LABELS: Record<
  IncidentKind,
  { en: string; sv: string; es: string }
> = {
  violence: {
    en: "Physical violence / rough handling",
    sv: "Fysiskt våld / hård hantering",
    es: "Violencia física / trato brusco",
  },
  psychological: {
    en: "Psychological mistreatment",
    sv: "Psykiskt övergrepp",
    es: "Maltrato psicológico",
  },
  neglect: {
    en: "Neglect / soiled environment / hygiene",
    sv: "Försummelse / smutsig miljö / hygien",
    es: "Negligencia / entorno sucio / higiene",
  },
  self_harm_allowed: {
    en: "Self-harm allowed to continue",
    sv: "Självskada tilläts fortsätta",
    es: "Autoagresión permitida a continuar",
  },
  speech_cycle: {
    en: "Repeated phrases / cycles (witness)",
    sv: "Upprepade fraser / cykler (vittne)",
    es: "Frases / ciclos repetidos (testigo)",
  },
  other: {
    en: "Other serious concern",
    sv: "Annan allvarlig oro",
    es: "Otra preocupación grave",
  },
};

const STORAGE_KEY = "neuroljus.serious_incidents.v0";

export function readSeriousIncidents(): SeriousIncident[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SeriousIncident[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSeriousIncidents(incidents: SeriousIncident[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
}

export function addSeriousIncident(
  input: Omit<SeriousIncident, "id" | "createdAt">
): SeriousIncident[] {
  const incident: SeriousIncident = {
    ...input,
    id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const next = [incident, ...readSeriousIncidents()].slice(0, 50);
  writeSeriousIncidents(next);
  return next;
}

export function deleteSeriousIncident(id: string): SeriousIncident[] {
  const next = readSeriousIncidents().filter((item) => item.id !== id);
  writeSeriousIncidents(next);
  return next;
}

/** Plain-text packet for Lex Sarah / IVO / lawyer — human witness only. */
export function formatIncidentExportText(
  incident: SeriousIncident,
  lang: "en" | "sv" | "es" = "en"
): string {
  const kind = INCIDENT_KIND_LABELS[incident.kind][lang];
  const headers =
    lang === "sv"
      ? {
          title: "NEUROLJUS — Allvarlig händelse (behörigt lokalt vittnesmål)",
          notice:
            "Internationellt projekt. Detta är ett strukturerat vittnesmål från en människa som har rätt — och ofta skyldighet — att dokumentera och anmäla enligt lokal lag. Neuroljus hjälper dig strukturera under din behörighet, lokalt. Exempel Sverige: Lex Sarah / IVO. Neuroljus upptäcker inte våld via kamera och ersätter inte någon tillsynsmyndighet.",
          recorded: "Registrerad (webbläsare)",
          kind: "Typ",
          jurisdiction: "Jurisdiktion / land",
          when: "När (ungefär)",
          setting: "Plats / miljö",
          who: "Vem gjorde vad",
          others: "Andra närvarande",
          after: "Vad personen gjorde efteråt",
          protect: "Vad vittnet gjorde för att skydda",
          speech: "Upprepade fraser (som de sades)",
          uncertainty: "Osäkerhet",
          reporting: "Rapportering (lokal skyldighet / tillsyn / advokat)",
          next: "Nästa steg för vittnet",
          nextBody:
            "Skydda personen. Dokumentera under din behörighet. Följ lokal anmälningsplikt. Sök juridisk rådgivning vid behov.",
        }
      : lang === "es"
        ? {
            title: "NEUROLJUS — Incidente grave (testimonio local autorizado)",
            notice:
              "Proyecto internacional. Esto es un testimonio estructurado de una persona autorizada — y a menudo obligada — a documentar y denunciar según la ley local. Neuroljus te ayuda a estructurarlo bajo tu autoridad, en local. Ejemplo Suecia: Lex Sarah / IVO. Neuroljus no detecta violencia por cámara y no sustituye a ninguna inspección.",
            recorded: "Registrado (navegador)",
            kind: "Tipo",
            jurisdiction: "Jurisdicción / país",
            when: "Cuándo (aprox.)",
            setting: "Lugar / entorno",
            who: "Quién hizo qué",
            others: "Otras personas presentes",
            after: "Qué hizo la persona después",
            protect: "Qué hizo el testigo para proteger",
            speech: "Frases repetidas (como se dijeron)",
            uncertainty: "Incertidumbre",
            reporting: "Reporte (deber local / inspección / abogado)",
            next: "Siguiente paso del testigo",
            nextBody:
              "Protege a la persona. Documenta bajo tu autorización. Cumple el deber de denuncia local. Busca consejo jurídico si hace falta.",
          }
        : {
            title: "NEUROLJUS — Serious incident (authorized local witness)",
            notice:
              "International project. This is a structured witness note from a person who is authorized — and often obligated — to document and report under local law. Neuroljus helps you structure it under your authority, locally. Example Sweden: Lex Sarah / IVO. Neuroljus does not detect violence via camera and does not replace any inspectorate.",
            recorded: "Recorded (browser)",
            kind: "Kind",
            jurisdiction: "Jurisdiction / country",
            when: "When (approx.)",
            setting: "Setting",
            who: "Who did what",
            others: "Others present",
            after: "What the person did afterward",
            protect: "What the witness did to protect",
            speech: "Repeated phrases (as spoken)",
            uncertainty: "Uncertainty",
            reporting: "Reporting (local duty / inspectorate / lawyer)",
            next: "Witness next steps",
            nextBody:
              "Protect the person. Document under your authorization. Follow local reporting duties. Seek legal counsel if needed.",
          };

  const lines = [
    headers.title,
    headers.notice,
    "",
    `${headers.recorded}: ${incident.createdAt}`,
    `ID: ${incident.id}`,
    `${headers.kind}: ${kind}`,
    `${headers.jurisdiction}: ${incident.jurisdiction || "—"}`,
    "",
    `${headers.when}:`,
    incident.whenApprox || "—",
    "",
    `${headers.setting}:`,
    incident.setting || "—",
    "",
    `${headers.who}:`,
    incident.whoWhat || "—",
    "",
    `${headers.others}:`,
    incident.othersPresent || "—",
    "",
    `${headers.after}:`,
    incident.personAfter || "—",
    "",
    `${headers.protect}:`,
    incident.protectionActs || "—",
    "",
    `${headers.speech}:`,
    incident.speechCycles || "—",
    "",
    `${headers.uncertainty}:`,
    incident.uncertainty || "—",
    "",
    `${headers.reporting}:`,
    incident.reporting || "—",
    "",
    `${headers.next}:`,
    headers.nextBody,
    "",
    "Envelope: neuroljus.serious_incident.v0 · storage=browser · network=off · international=true",
  ];

  return lines.join("\n");
}

export function formatIncidentExportJson(incident: SeriousIncident): string {
  return JSON.stringify(
    {
      envelope: "neuroljus.serious_incident.v0",
      network: "off",
      camera_abuse_detection: false,
      replaces_lex_sarah_or_ivo_as_institution: false,
      intended_for_authorized_witness_under_reporting_duty: true,
      incident,
    },
    null,
    2
  );
}
