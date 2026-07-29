/**
 * Optional care-reflection providers.
 * Labs and the protocol engine do not depend on these.
 */

export type ReflectionProvider = "none" | "openai";

export function getReflectionProvider(): ReflectionProvider {
  const raw = (process.env.CARE_REFLECTION_PROVIDER || "openai").trim().toLowerCase();
  if (raw === "none") return "none";
  return "openai";
}

export function offlineReflectionReply(lang: "sv" | "en" | "es"): string {
  if (lang === "sv") {
    return (
      "Molnbaserad reflektionsassistent är avstängd (CARE_REFLECTION_PROVIDER=none). " +
      "Neuroljus kärna är lokal: Observation Method, NL-VISION-signaler och care_command_protocol_v0. " +
      "Skriv anteckningar i metoden, bifoga lokala signaler om du vill, och bygg protokollet i labs — utan att skicka vårdanteckningar till en extern modell."
    );
  }
  if (lang === "es") {
    return (
      "El asistente de reflexión en la nube está desactivado (CARE_REFLECTION_PROVIDER=none). " +
      "El núcleo de Neuroljus es local: Observation Method, señales NL-VISION y care_command_protocol_v0. " +
      "Escribe notas en el método, adjunta señales locales si quieres, y construye el protocolo en los labs — sin enviar notas de cuidado a un modelo externo."
    );
  }
  return (
    "Cloud reflection assistant is off (CARE_REFLECTION_PROVIDER=none). " +
    "Neuroljus core is local: Observation Method, NL-VISION signals, and care_command_protocol_v0. " +
    "Write notes in the method, attach local signals if useful, and build the protocol in the labs — without sending care notes to an external model."
  );
}
