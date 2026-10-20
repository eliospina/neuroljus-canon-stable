/** One real audit of a sample turn, to see what Haiku returns: npx tsx scripts/line-needs-try.ts (ANTHROPIC_API_KEY). */
import { auditTurn } from "../src/lib/line/needs";

async function main() {
  const r = await auditTurn({
    userText: "Mi hijo autista se tomó como seis pastillas de clorazepato, no hay médico cerca, estamos en Perú",
    assistantText: "El clorazepato es una benzodiacepina, se usa para la ansiedad y algunas convulsiones. De más da mucho sueño y en cantidad grande puede bajar la respiración. Acuéstalo de lado y vigila que respire. El número de emergencias es el 106.",
    docsOffered: [{ id: "pmc:1", title: "Sleep problems in autistic children" }],
    lang: "es",
    country: "PE",
    caller: "caregiver",
    turn: 1,
    apiKey: process.env.ANTHROPIC_API_KEY || null,
    log: (l) => console.log(l),
  });
  console.log(JSON.stringify(r));
}
main();
