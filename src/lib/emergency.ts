/**
 * Emergency number by country.
 *
 * The country comes from the request (Vercel's x-vercel-ip-country header);
 * when unknown, the message says "call your country's emergency number".
 * 1177 (non-urgent medical advice) is only mentioned in Sweden.
 */

export type EmergencyLang = "es" | "en" | "sv";

export type EmergencyInfo = {
  country: string | null;
  /** Dialable number, or null when the country is unknown. */
  number: string | null;
  /** Non-urgent medical line, only in Sweden. */
  medical: string | null;
  /** "If there is danger, call 112." — localised, with the right number. */
  text: string;
  /** Short label for a call button, e.g. "Llamar al 112". */
  call: string | null;
};

const EU_112 = new Set([
  "SE", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "NO", "IS", "CH", "LI", "UA", "MD", "RS", "ME", "MK", "BA", "AL", "XK", "TR", "AD", "MC", "SM", "VA",
]);

export function emergencyNumber(country: string | null | undefined): string | null {
  const c = (country || "").toUpperCase();
  if (!c) return null;
  if (EU_112.has(c)) return "112";
  if (c === "US" || c === "MX" || c === "CA" || c === "PH") return "911";
  if (c === "CO") return "123";
  if (c === "GB") return "999";
  if (c === "AU") return "000";
  if (c === "NZ") return "111";
  // AR: 911 is the national line for ambulance and police (107 SAME only covers Buenos Aires).
  if (c === "AR" || c === "UY" || c === "EC") return "911";
  // No national 911 here: the ambulance line, since escalations are falls, seizures, self-injury.
  if (c === "BR") return "192"; // SAMU (police 190, fire 193)
  if (c === "CL") return "131"; // SAMU (Carabineros 133, Bomberos 132)
  if (c === "PE") return "106"; // SAMU (police 105, Bomberos 116; 911 only piloted in Lima)
  return null;
}

const DANGER: Record<EmergencyLang, { known: string; unknown: string; call: string; medical: string }> = {
  es: {
    known: "Esto necesita a una persona. Si hay peligro, llama al {n}.",
    unknown: "Esto necesita a una persona. Si hay peligro, llama al número de emergencias de tu país.",
    call: "Llamar al {n}",
    medical: " Para dudas médicas no urgentes en Suecia: 1177.",
  },
  en: {
    known: "This needs a person. If there is danger, call {n}.",
    unknown: "This needs a person. If there is danger, call your country's emergency number.",
    call: "Call {n}",
    medical: " For non-urgent medical questions in Sweden: 1177.",
  },
  sv: {
    known: "Det här behöver en människa. Vid fara, ring {n}.",
    unknown: "Det här behöver en människa. Vid fara, ring ditt lands nödnummer.",
    call: "Ring {n}",
    medical: " För icke-akuta medicinska frågor i Sverige: 1177.",
  },
};

export function emergencyInfo(country: string | null | undefined, lang: EmergencyLang, withMedical = false): EmergencyInfo {
  const c = (country || "").toUpperCase() || null;
  const number = emergencyNumber(c);
  const medical = c === "SE" ? "1177" : null;
  const d = DANGER[lang];
  const base = number ? d.known.replace("{n}", number) : d.unknown;
  return {
    country: c,
    number,
    medical,
    text: base + (withMedical && medical ? d.medical : ""),
    call: number ? d.call.replace("{n}", number) : null,
  };
}

/** Country from a request's headers (Vercel sets x-vercel-ip-country). */
export function countryFromHeaders(headers: Record<string, string | string[] | undefined>): string | null {
  const raw = headers["x-vercel-ip-country"];
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && /^[A-Za-z]{2}$/.test(v) ? v.toUpperCase() : null;
}
