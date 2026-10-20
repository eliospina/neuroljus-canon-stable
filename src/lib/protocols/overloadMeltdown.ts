/**
 * Protocol 5 — Sensory overload or meltdown: too much input, the body cannot
 * take more, and it comes out as crying, screaming, running or collapsing.
 */

import { tri, type CrisisProtocol } from "./types";

export const overloadMeltdown: CrisisProtocol = {
  id: "overload_meltdown",
  number: 5,
  title: tri("Sobrecarga sensorial o meltdown", "Sensory overload or meltdown", "Sensorisk överbelastning eller meltdown"),
  recognize: [
    tri(
      "¿Hay mucho ruido, luz, gente, olores o cambios, y la persona se tapa los oídos, llora, grita o quiere irse?",
      "Is there a lot of noise, light, people, smells or change, and the person covers their ears, cries, screams or wants to leave?",
      "Är det mycket ljud, ljus, folk, lukter eller förändringar, och personen håller för öronen, gråter, skriker eller vill därifrån?"
    ),
    tri("¿Parece que no puede parar aunque quiera?", "Does it look like they cannot stop even if they wanted to?", "Ser det ut som att personen inte kan sluta även om den vill?"),
  ],
  safetyFirst: false,
  phases: {
    agitation: {
      goal: tri("Quitar entrada antes de que desborde.", "Remove input before it overflows.", "Ta bort intryck innan det rinner över."),
      steps: [
        tri("Baja o apaga lo que puedas: música, luces, pantallas, campanas extractoras.", "Turn down or off what you can: music, lights, screens, fans.", "Sänk eller stäng av det du kan: musik, lampor, skärmar, fläktar."),
        tri("Ofrece la salida: a un lugar más tranquilo, al auto, al baño, afuera.", "Offer the way out: to a quieter place, the car, the bathroom, outside.", "Erbjud vägen ut: till en lugnare plats, bilen, toaletten, utomhus."),
        tri("Dale sus protecciones si las usa: auriculares, gorra, lentes oscuros, su objeto.", "Give them their protections if they use them: headphones, cap, dark glasses, their object.", "Ge personen sina skydd om den använder dem: hörlurar, keps, mörka glasögon, sitt föremål."),
        tri("Deja de hablar y de preguntar. Una sola persona a cargo.", "Stop talking and asking. One person in charge.", "Sluta prata och fråga. En enda person ansvarar."),
      ],
      say: [tri("Nos vamos.", "We're leaving.", "Vi går."), tri("Más tranquilo por aquí.", "Quieter this way.", "Lugnare här."), tri("Ya está, salimos.", "Done, we're out.", "Klart, vi går ut.")],
    },
    peak: {
      goal: tri("Menos de todo. Esperar.", "Less of everything. Wait.", "Mindre av allt. Vänta."),
      steps: [
        tri("Reduce lo que llega: distancia de la gente, luz baja, silencio tuyo.", "Reduce what comes in: distance from people, low light, your own silence.", "Minska det som kommer in: avstånd från folk, lågt ljus, din egen tystnad."),
        tri("No toques si no sabes que el contacto ayuda. Si ayuda, presión firme y quieta, no caricias.", "Do not touch unless you know touch helps. If it helps, firm still pressure, not stroking.", "Rör inte om du inte vet att beröring hjälper. Om det hjälper: fast, stilla tryck, inte smek."),
        tri("Deja que el cuerpo haga lo que necesita: balancearse, taparse, tirarse al suelo, siempre que no se dañe.", "Let the body do what it needs: rocking, covering up, dropping to the floor, as long as it is not harmed.", "Låt kroppen göra vad den behöver: gunga, täcka sig, lägga sig på golvet, så länge den inte skadas."),
        tri("Aparta a quien mire o comente. Protege de las miradas.", "Move away anyone who stares or comments. Shield from onlookers.", "För bort den som stirrar eller kommenterar. Skydda från blickar."),
      ],
      say: [tri("Estoy aquí.", "I'm here.", "Jag är här."), tri("No hablo más.", "No more talking.", "Jag säger inget mer."), tri("Tómate el tiempo.", "Take your time.", "Ta din tid.")],
    },
    descent: {
      goal: tri("No reiniciar la carga.", "Do not restart the load.", "Starta inte om belastningen."),
      steps: [
        tri("Sigue con poca luz y poco ruido. No preguntes qué pasó.", "Keep light and noise low. Do not ask what happened.", "Fortsätt med lågt ljus och lågt ljud. Fråga inte vad som hände."),
        tri("Ofrece agua y algo de peso o calor si le ayuda: manta, cojín.", "Offer water and something heavy or warm if it helps: blanket, cushion.", "Erbjud vatten och något tungt eller varmt om det hjälper: filt, kudde."),
        tri("No vuelvas al lugar o la tarea de antes todavía.", "Do not go back to the place or task from before yet.", "Gå inte tillbaka till platsen eller uppgiften ännu."),
      ],
      say: [tri("Sin prisa.", "No hurry.", "Ingen brådska."), tri("Aquí estamos bien.", "We're fine here.", "Här är det bra."), tri("Respiramos.", "We breathe.", "Vi andas.")],
    },
    recovery: {
      goal: tri("Descansar y aprender los límites.", "Rest and learn the limits.", "Vila och lär dig gränserna."),
      steps: [
        tri("Cuenta con horas de cansancio después; baja las exigencias del resto del día.", "Expect hours of tiredness afterwards; lower the demands for the rest of the day.", "Räkna med timmar av trötthet efteråt; sänk kraven resten av dagen."),
        tri("Anota qué se acumuló: lugar, ruido, gente, horas sin pausa, hambre, sueño.", "Note what piled up: place, noise, people, hours without a break, hunger, sleep.", "Skriv ner vad som staplades upp: plats, ljud, folk, timmar utan paus, hunger, sömn."),
        tri("Pregunta a la persona, cuando esté bien, qué ayudó y qué empeoró. Su respuesta manda.", "Ask the person, when they are well, what helped and what made it worse. Their answer leads.", "Fråga personen, när den mår bra, vad som hjälpte och vad som gjorde det värre. Svaret styr."),
        tri("Planea la próxima vez: horario con menos gente, salida acordada, protecciones a mano.", "Plan next time: a time with fewer people, an agreed exit, protections at hand.", "Planera nästa gång: en tid med färre människor, en överenskommen utväg, skydd till hands."),
      ],
      say: [tri("Ya pasó.", "It's over.", "Det är över."), tri("Hiciste lo que pudiste.", "You did what you could.", "Du gjorde vad du kunde."), tri("Descansamos.", "We rest.", "Vi vilar.")],
    },
  },
  never: [
    tri("Castigar o regañar por el meltdown: no es una rabieta ni una elección.", "Punish or scold for the meltdown: it is not a tantrum or a choice.", "Straffa eller skälla för meltdownen: det är inte ett utbrott av vilja eller ett val."),
    tri("Encerrar a la persona sola para que no se oiga.", "Lock the person alone so they are not heard.", "Stänga in personen ensam så att den inte hörs."),
    tri("Sujetar o abrazar a la fuerza para que pare: más contacto es más carga.", "Restrain or hug by force to make it stop: more contact is more load.", "Hålla fast eller krama med våld för att få det att sluta: mer kontakt är mer belastning."),
    tri("No le pidas que se calme, que mire a los ojos o que explique.", "Do not ask them to calm down, make eye contact or explain.", "Be inte personen lugna sig, titta i ögonen eller förklara."),
    tri("No lo sigas intentando donde empezó: la salida es parte de la ayuda.", "Do not keep trying where it started: leaving is part of the help.", "Fortsätt inte där det började: att gå därifrån är en del av hjälpen."),
  ],
  escalate: {
    callWhen: [
      tri("Se hace daño o daña a otra persona y no puedes impedirlo.", "They hurt themself or someone else and you cannot prevent it.", "Personen skadar sig själv eller någon annan och du kan inte hindra det."),
      tri("Le cuesta respirar, pierde la conciencia o tiene una convulsión.", "They have trouble breathing, lose consciousness or have a seizure.", "Personen får svårt att andas, förlorar medvetandet eller får ett anfall."),
    ],
    contactWhen: [
      tri("Los meltdowns son más frecuentes o más largos sin un cambio claro alrededor: revisión médica, por si hay dolor o enfermedad.", "Meltdowns are more frequent or longer without a clear change around: a medical check, in case of pain or illness.", "Meltdownerna blir vanligare eller längre utan en tydlig förändring runt omkring: läkarundersökning, i fall det är smärta eller sjukdom."),
      tri("Quieres un plan sensorial para casa y escuela: pregunta a terapia ocupacional.", "You want a sensory plan for home and school: ask occupational therapy.", "Du vill ha en sensorisk plan för hem och skola: fråga en arbetsterapeut."),
    ],
  },
  abc: {
    antecedent: tri("¿Qué se acumuló antes? (ruido, luz, gente, cambio de plan, horas sin pausa, hambre, poco sueño)", "What piled up before? (noise, light, people, a change of plan, hours without a break, hunger, little sleep)", "Vad staplades upp innan? (ljud, ljus, folk, ändrad plan, timmar utan paus, hunger, lite sömn)"),
    behavior: tri("¿Qué hizo el cuerpo: taparse, llorar, correr, caer, golpear? ¿Cuánto duró?", "What did the body do: cover up, cry, run, drop, hit? How long did it last?", "Vad gjorde kroppen: täcka sig, gråta, springa, falla, slå? Hur länge?"),
    consequence: tri("¿Qué pasó después? ¿Salieron del lugar? ¿Bajó la carga? ¿Cuánto tardó en recuperarse?", "What happened next? Did you leave the place? Did the load go down? How long did recovery take?", "Vad hände sedan? Lämnade ni platsen? Sjönk belastningen? Hur lång tid tog återhämtningen?"),
    hypotheses: [
      { fn: "sensory", check: tri("¿Coincide con lugares o estímulos concretos? ¿Baja al quitarlos?", "Does it match specific places or stimuli? Does it ease when they are removed?", "Sammanfaller det med vissa platser eller intryck? Släpper det när de tas bort?") },
      { fn: "escape", check: tri("¿Terminó la situación o la tarea después?", "Did the situation or task end afterwards?", "Tog situationen eller uppgiften slut efteråt?") },
      { fn: "pain", check: tri("¿Hay señales de dolor, enfermedad, hambre o falta de sueño esos días?", "Any signs of pain, illness, hunger or lack of sleep those days?", "Finns tecken på smärta, sjukdom, hunger eller sömnbrist de dagarna?") },
    ],
    note: tri(
      "Son hipótesis para mirar el patrón, no una explicación ni un diagnóstico. En la sobrecarga suele haber varias causas sumadas.",
      "These are hypotheses for looking at the pattern, not an explanation or a diagnosis. In overload there are usually several causes added together.",
      "Det här är hypoteser för att se mönstret, inte en förklaring eller en diagnos. Vid överbelastning är det oftast flera orsaker som läggs ihop."
    ),
  },
  evidence: [
    {
      id: "PMC9651035",
      level: "systematic_review",
      supports: tri(
        "Síntesis cualitativa sobre la vida familiar de niños autistas con diferencias sensoriales: las familias adaptan rutinas y entornos para que la participación funcione. Respalda planear el entorno y la salida.",
        "Qualitative synthesis on family life with autistic children with sensory differences: families adapt routines and environments so participation works. Backs planning the environment and the exit.",
        "Kvalitativ syntes om familjeliv med autistiska barn med sensoriska skillnader: familjer anpassar rutiner och miljöer så att deltagandet fungerar. Stöder att planera miljön och utvägen."
      ),
    },
    {
      id: "PMC8595127",
      level: "study",
      supports: tri(
        "Entrevistas con jóvenes autistas sobre burnout, inercia, meltdown y shutdown: qué hacen los demás que ayuda o empeora. Respalda preguntar a la persona y seguir su respuesta.",
        "Interviews with autistic youth about burnout, inertia, meltdown and shutdown: what others do that helps or makes it worse. Backs asking the person and following their answer.",
        "Intervjuer med autistiska unga om burnout, tröghet, meltdown och shutdown: vad andra gör som hjälper eller förvärrar. Stöder att fråga personen och följa svaret."
      ),
    },
    {
      id: "PMC12801607",
      level: "systematic_review",
      supports: tri(
        "Revisión sistemática: los adolescentes autistas presentan más dificultades de regulación emocional que sus pares. Respalda tratar el meltdown como desregulación, no como mala conducta.",
        "Systematic review: autistic adolescents show more emotion regulation difficulties than their peers. Backs treating the meltdown as dysregulation, not misbehaviour.",
        "Systematisk översikt: autistiska ungdomar har mer svårigheter med känsloreglering än jämnåriga. Stöder att se meltdownen som dysregulering, inte dåligt uppförande."
      ),
    },
    {
      id: "PMC6220772",
      level: "trial",
      supports: tri(
        "Ensayo aleatorizado de terapia cognitivo-conductual para la regulación emocional en niños autistas. Respalda trabajar la regulación fuera de la crisis; no prueba qué hacer durante ella.",
        "Randomised trial of cognitive behaviour therapy for emotion regulation in autistic children. Backs working on regulation outside the crisis; it does not test what to do during one.",
        "Randomiserad studie av kognitiv beteendeterapi för känsloreglering hos autistiska barn. Stöder att arbeta med reglering utanför krisen; den prövar inte vad man gör under den."
      ),
    },
    {
      id: "PMC9544248",
      level: "systematic_review",
      supports: tri(
        "Revisión sistemática sobre cómo las intervenciones mediadas por la familia miden la regulación emocional en niños pequeños. Respalda que la familia puede apoyar la regulación desde temprano.",
        "Systematic review of how parent-mediated interventions measure emotion regulation in young children. Backs that the family can support regulation from early on.",
        "Systematisk översikt om hur föräldraledda insatser mäter känsloreglering hos små barn. Stöder att familjen kan stödja regleringen tidigt."
      ),
    },
  ],
  evidenceNote: tri(
    "La biblioteca respalda ver el meltdown como desregulación, adaptar el entorno y escuchar a la persona. No hay estudios sobre qué hacer en el pico: esos pasos son práctica y relatos de personas autistas.",
    "The library backs seeing the meltdown as dysregulation, adapting the environment and listening to the person. There are no studies on what to do at the peak: those steps are practice and autistic people's accounts.",
    "Biblioteket stöder att se meltdownen som dysregulering, anpassa miljön och lyssna på personen. Det finns inga studier om vad man gör på toppen: de stegen är praktik och autistiska personers berättelser."
  ),
};
