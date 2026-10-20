/**
 * A scripted stand-in for Claude. It answers with the next protocol step from
 * the dynamic block and deliberately breaks rules the guard must catch
 * (filler, a stage tag, a repeat), so the test proves the
 * rules hold in code, not only in the prompt.
 */

export function mockModelStream(system: string[], messages: Array<{ role: string; content: string }>): AsyncIterable<string> {
  const dyn = system[1] ?? "";
  const lang = /Answer in Swedish/.test(system[0]) ? "sv" : /Answer in English/.test(system[0]) ? "en" : "es";
  const parts: string[] = [];
  const triage = dyn.match(/Ask it now, exactly: "([^"]+)"/);
  const next = dyn.match(/not yet given, in order: "([^"]+)"/) ?? dyn.match(/Move to phase \w+: "([^"]+)"/);
  const emergency = /severe signal present/.test(dyn) ? dyn.match(/as information for the caller: ([^\n]+)/) : null;
  const doc = dyn.match(/\[([A-Za-z0-9:.\/-]+)\] ([^(]{8,40})[^(]*\((\d{4})/);
  const calm = /CALM QUESTION/.test(dyn);
  const ladder = { es: "Retira la demanda y baja el ruido.", en: "Remove the demand and lower the noise.", sv: "Ta bort kravet och sänk ljudet." }[lang];
  const filler = { es: "Lo siento mucho, debe ser agotador.", en: "I'm so sorry, that must be exhausting.", sv: "Jag förstår, det måste vara utmattande." }[lang];
  const topic = doc ? doc[2].trim().toLowerCase() : "";
  const source = doc ? { es: `Según un estudio de ${doc[3]} sobre ${topic}, esto ayuda.`, en: `According to a ${doc[3]} study on ${topic}, this helps.`, sv: `Enligt en studie från ${doc[3]} om ${topic} hjälper detta.` }[lang] : null;
  const person = /AUTISTIC PERSON is calling/.test(dyn);

  if (emergency) parts.push(emergency[1]);
  parts.push(filler); // must be dropped
  if (person) parts.push({ es: "¿Te ayudaría apagar la luz?", en: "Would it help to turn off the light?", sv: "Skulle det hjälpa att släcka lampan?" }[lang]);
  else if (calm) parts.push(source ?? { es: "Según el protocolo de NeuroLjus, prepara la visita con imágenes.", en: "According to the NeuroLjus protocol, prepare the visit with pictures.", sv: "Enligt NeuroLjus protokoll, förbered besöket med bilder." }[lang]);
  else if (triage) parts.push(`[slow] ${triage[1]}`);
  else if (next) parts.push(next[1]);
  else parts.push(ladder);
  if (source && !person && !calm) parts.push(source);
  // Repeat the previous assistant turn's first sentence: must be dropped.
  const prev = [...messages].reverse().find((m) => m.role === "assistant");
  if (prev) parts.push(prev.content.split(/(?<=[.!?])\s+/)[0]);
  if (!person && !calm) parts.push(next ? ladder : (lang === "es" ? "Dime cómo está ahora." : lang === "en" ? "Tell me how it is now." : "Berätta hur det är nu."));
  const text = parts.join(" ");
  return (async function* () {
    // Stream in small pieces, like a real model.
    for (let i = 0; i < text.length; i += 7) yield text.slice(i, i + 7);
  })();
}
