/**
 * A scripted stand-in for Claude for CI: it cannot reason about the scene, so
 * it only proves the plumbing. It reads the facts block, says the emergency
 * number when code found a severe signal, names the library document when one
 * was given, and deliberately writes a stage tag and markdown that the
 * streamer must strip before the voice.
 */

export function mockModelStream(system: string[], messages: Array<{ role: string; content: string }>): AsyncIterable<string> {
  const dyn = system[1] ?? "";
  const lang = /Answer in Swedish/.test(system[0]) ? "sv" : /Answer in English/.test(system[0]) ? "en" : "es";
  const parts: string[] = [];
  const emergency = /severe signal/.test(dyn) ? dyn.match(/emergency number for this country: ([^\n]+)/) : null;
  const doc = dyn.match(/\[([A-Za-z0-9:.\/-]+)\] ([^(]{8,40})[^(]*\((\d{4})/);
  const person = /AUTISTIC PERSON seems to be calling/.test(dyn);
  const turns = messages.filter((m) => m.role === "user").length;
  const topic = doc ? doc[2].trim().toLowerCase() : "";
  const source = doc ? { es: `Según un estudio de ${doc[3]} sobre ${topic}, esto ayuda.`, en: `According to a ${doc[3]} study on ${topic}, this helps.`, sv: `Enligt en studie från ${doc[3]} om ${topic} hjälper detta.` }[lang] : null;

  if (emergency) parts.push(emergency[1]);
  if (person) parts.push({ es: "¿Te ayudaría apagar la luz?", en: "Would it help to turn off the light?", sv: "Skulle det hjälpa att släcka lampan?" }[lang]);
  else {
    parts.push(`[slow] ${{ es: `Paso ${turns}: ponte entre la persona y el peligro.`, en: `Step ${turns}: get between the person and the danger.`, sv: `Steg ${turns}: ställ dig mellan personen och faran.` }[lang]}`);
    if (source) parts.push(source);
    parts.push({ es: "**Dime** cómo está ahora.", en: "**Tell me** how it is now.", sv: "**Berätta** hur det är nu." }[lang]);
  }
  const text = parts.join(" ");
  return (async function* () {
    // Stream in small pieces, like a real model.
    for (let i = 0; i < text.length; i += 7) yield text.slice(i, i + 7);
  })();
}
