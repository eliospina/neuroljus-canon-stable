/**
 * Protocol 6 — Shutdown: the person goes quiet, still, unresponsive; may not
 * speak, move or react. Looks like refusal but is a system that has stopped.
 */

import { tri, type CrisisProtocol } from "./types";

export const shutdown: CrisisProtocol = {
  id: "shutdown",
  number: 6,
  title: tri("Bloqueo o shutdown", "Shutdown", "Blockering eller shutdown"),
  recognize: [
    tri(
      "¿La persona se queda quieta, en silencio, sin responder, con la mirada perdida o escondida bajo algo, y no reacciona a lo que le dices?",
      "Has the person gone still, silent, unresponsive, staring or hiding under something, and not reacting to what you say?",
      "Har personen blivit stilla, tyst, utan att svara, med tom blick eller gömd under något, och reagerar inte på det du säger?"
    ),
    tri("¿Venía de mucha carga: ruido, gente, exigencias, poco sueño?", "Did it follow a lot of load: noise, people, demands, little sleep?", "Kom det efter mycket belastning: ljud, folk, krav, lite sömn?"),
  ],
  safetyFirst: false,
  phases: {
    agitation: {
      goal: tri("Notar el apagado que empieza.", "Notice the switching-off as it starts.", "Märk avstängningen när den börjar."),
      steps: [
        tri("Fíjate en las señales: respuestas más cortas, mirada baja, movimientos lentos, buscar un rincón.", "Notice the signs: shorter answers, lowered gaze, slow movements, seeking a corner.", "Lägg märke till tecknen: kortare svar, sänkt blick, långsamma rörelser, letande efter ett hörn."),
        tri("Quita exigencias y preguntas. Ofrece una pausa y un lugar tranquilo.", "Drop demands and questions. Offer a break and a quiet place.", "Ta bort krav och frågor. Erbjud en paus och en lugn plats."),
        tri("Ofrece una forma de comunicar sin hablar: señalar, escribir, un gesto acordado.", "Offer a way to communicate without speaking: pointing, writing, an agreed gesture.", "Erbjud ett sätt att kommunicera utan tal: peka, skriva, en överenskommen gest."),
      ],
      say: [tri("Podemos parar.", "We can stop.", "Vi kan stanna."), tri("No hace falta hablar.", "No need to talk.", "Du behöver inte prata."), tri("Estoy aquí.", "I'm here.", "Jag är här.")],
    },
    peak: {
      goal: tri("Acompañar sin exigir nada.", "Stay alongside without asking anything.", "Finnas med utan att kräva något."),
      steps: [
        tri("Quédate cerca, en silencio, sin mirar fijamente. Tu presencia tranquila es la ayuda.", "Stay close, quietly, without staring. Your calm presence is the help.", "Stanna nära, tyst, utan att stirra. Din lugna närvaro är hjälpen."),
        tri("Baja luz y ruido. Aparta a los demás.", "Lower light and noise. Move others away.", "Sänk ljus och ljud. För bort andra."),
        tri("Deja agua, una manta o su objeto al alcance, sin ponerlo en sus manos.", "Leave water, a blanket or their object within reach, without putting it in their hands.", "Lämna vatten, en filt eller personens föremål inom räckhåll, utan att lägga det i händerna."),
        tri("Si debes comprobar que está bien, usa una pregunta de sí o no que pueda responder con un gesto.", "If you must check they are okay, use a yes or no question they can answer with a gesture.", "Om du måste kolla att personen är okej, ställ en ja- eller nej-fråga som går att svara på med en gest."),
      ],
      say: [tri("Estoy aquí. Sin prisa.", "I'm here. No rush.", "Jag är här. Ingen brådska."), tri("No tienes que hablar.", "You don't have to talk.", "Du behöver inte prata."), tri("Tómate el tiempo.", "Take your time.", "Ta din tid.")],
    },
    descent: {
      goal: tri("Dejar que vuelva a su ritmo.", "Let them come back at their pace.", "Låt personen komma tillbaka i sin takt."),
      steps: [
        tri("Cuando se mueva o te mire, no celebres ni preguntes. Sigue tranquila.", "When they move or look at you, do not celebrate or ask. Stay calm.", "När personen rör sig eller tittar på dig: fira inte och fråga inte. Håll dig lugn."),
        tri("Ofrece algo sencillo y sin palabras: agua, salir a un lugar más tranquilo.", "Offer something simple and wordless: water, moving to a quieter place.", "Erbjud något enkelt utan ord: vatten, att gå till en lugnare plats."),
        tri("Acepta que la voz puede tardar más en volver que el movimiento.", "Accept that speech may take longer to return than movement.", "Acceptera att talet kan ta längre tid att komma tillbaka än rörelsen."),
      ],
      say: [tri("Aquí estoy.", "I'm here.", "Jag är här."), tri("Todo bien.", "All good.", "Allt är bra."), tri("Cuando quieras.", "Whenever you're ready.", "När du vill.")],
    },
    recovery: {
      goal: tri("Recuperar energía y bajar la carga de los próximos días.", "Recover energy and lower the load for the next days.", "Återhämta energi och sänk belastningen de kommande dagarna."),
      steps: [
        tri("Permite descanso real: menos planes, menos gente, tiempo a solas si lo pide.", "Allow real rest: fewer plans, fewer people, time alone if they ask for it.", "Tillåt verklig vila: färre planer, färre människor, tid ensam om personen ber om det."),
        tri("Pregunta después, sin presión, qué ayudó y qué sobró.", "Ask afterwards, without pressure, what helped and what was too much.", "Fråga efteråt, utan press, vad som hjälpte och vad som var för mycket."),
        tri("Acuerden una señal para pedir pausa antes de llegar al apagado.", "Agree on a signal to ask for a break before reaching shutdown.", "Kom överens om en signal för att be om paus innan avstängningen."),
        tri("Rellena el registro ABC: qué se acumuló los días anteriores.", "Fill in the ABC log: what piled up over the previous days.", "Fyll i ABC-loggen: vad som staplades upp de föregående dagarna."),
      ],
      say: [tri("Descansamos.", "We rest.", "Vi vilar."), tri("Hoy menos cosas.", "Fewer things today.", "Färre saker i dag."), tri("Estás bien.", "You're okay.", "Du är okej.")],
    },
  },
  never: [
    tri("Castigar el silencio o tratarlo como desobediencia o mala educación.", "Punish the silence or treat it as disobedience or rudeness.", "Straffa tystnaden eller se den som olydnad eller oförskämdhet."),
    tri("Encerrar a la persona o dejarla sola largo tiempo sin comprobar que está bien.", "Lock the person away or leave them alone for a long time without checking they are okay.", "Stänga in personen eller lämna den ensam länge utan att kolla att den är okej."),
    tri("Sujetar, sacudir, levantar a la fuerza o forzar el contacto visual.", "Restrain, shake, pull up by force or force eye contact.", "Hålla fast, skaka, dra upp med våld eller tvinga till ögonkontakt."),
    tri("No insistas con preguntas ni subas la voz para «sacarla».", "Do not keep asking questions or raise your voice to 'bring them out'.", "Fortsätt inte fråga och höj inte rösten för att 'få ut' personen."),
  ],
  escalate: {
    callWhen: [
      tri("No responde a nada, está rígida o flácida, y no sabes si está consciente.", "They respond to nothing, are rigid or limp, and you do not know if they are conscious.", "Personen svarar inte på något, är stel eller slapp, och du vet inte om den är vid medvetande."),
      tri("Le cuesta respirar, tiene los labios azulados o ha dejado de beber durante muchas horas.", "They have trouble breathing, bluish lips, or have not drunk anything for many hours.", "Personen har svårt att andas, blåaktiga lippar, eller har inte druckit på många timmar."),
    ],
    contactWhen: [
      tri("Los bloqueos duran horas, se repiten cada semana o van con dejar de comer, beber o moverse: revisión médica.", "Shutdowns last hours, happen every week or come with not eating, drinking or moving: a medical check.", "Blockeringarna varar i timmar, återkommer varje vecka eller kommer med att personen slutar äta, dricka eller röra sig: läkarundersökning."),
      tri("Sospechas agotamiento prolongado: habla con un profesional que conozca el autismo.", "You suspect prolonged exhaustion: talk to a professional who understands autism.", "Du misstänker långvarig utmattning: prata med en yrkesperson som förstår autism."),
    ],
  },
  log: {
    kind: "abc",
    antecedent: tri("¿Qué se acumuló los días u horas antes? (gente, ruido, exigencias, cambios, poco sueño, enmascarar)", "What piled up in the days or hours before? (people, noise, demands, changes, little sleep, masking)", "Vad staplades upp dagarna eller timmarna innan? (folk, ljud, krav, förändringar, lite sömn, maskering)"),
    behavior: tri("¿Cómo fue el apagado: quieta, escondida, sin voz? ¿Cuánto duró?", "What was the shutdown like: still, hidden, voiceless? How long did it last?", "Hur var avstängningen: stilla, gömd, utan röst? Hur länge?"),
    consequence: tri("¿Qué pasó después? ¿Bajaron las exigencias? ¿Cuánto tardó en volver la voz y la energía?", "What happened next? Did demands go down? How long until voice and energy came back?", "Vad hände sedan? Sjönk kraven? Hur lång tid tills rösten och energin kom tillbaka?"),
    hypotheses: [
      { fn: "sensory", check: tri("¿Venía de un lugar o un día con mucho estímulo?", "Did it follow a place or a day with a lot of stimulation?", "Kom det efter en plats eller en dag med mycket intryck?") },
      { fn: "escape", check: tri("¿Las exigencias cesaron al apagarse? ¿Pasa más en ciertas tareas o con ciertas personas?", "Did demands stop once they shut down? Does it happen more with certain tasks or people?", "Upphörde kraven när personen stängde av? Händer det mer vid vissa uppgifter eller med vissa personer?") },
      { fn: "pain", check: tri("¿Hay señales de dolor, enfermedad o falta de sueño?", "Any signs of pain, illness or lack of sleep?", "Finns tecken på smärta, sjukdom eller sömnbrist?") },
    ],
    note: tri(
      "Son hipótesis para mirar el patrón, no una explicación ni un diagnóstico. El bloqueo suele ser el final de una carga larga, no una reacción a una sola cosa.",
      "These are hypotheses for looking at the pattern, not an explanation or a diagnosis. A shutdown is usually the end of a long load, not a reaction to one thing.",
      "Det här är hypoteser för att se mönstret, inte en förklaring eller en diagnos. En shutdown är oftast slutet på en lång belastning, inte en reaktion på en enda sak."
    ),
  },
  evidence: [
    {
      id: "PMC8595127",
      level: "study",
      supports: tri(
        "Entrevistas con jóvenes autistas sobre burnout, inercia, meltdown y shutdown, y sobre qué hacen los demás que ayuda o empeora. Respalda acompañar sin exigir y preguntar después.",
        "Interviews with autistic youth about burnout, inertia, meltdown and shutdown, and about what others do that helps or makes it worse. Backs staying alongside without demands and asking afterwards.",
        "Intervjuer med autistiska unga om burnout, tröghet, meltdown och shutdown, och om vad andra gör som hjälper eller förvärrar. Stöder att finnas med utan krav och fråga efteråt."
      ),
    },
    {
      id: "PMC13315293",
      level: "study",
      supports: tri(
        "Análisis de las metáforas con que adultos autistas describen sus shutdowns, en investigación participativa. Respalda entender el bloqueo como un sistema que se detiene, no como una negativa.",
        "Analysis of the metaphors autistic adults use to describe their shutdowns, in participatory research. Backs understanding the shutdown as a system that has stopped, not a refusal.",
        "Analys av de metaforer autistiska vuxna använder för att beskriva sina shutdowns, i deltagande forskning. Stöder att förstå blockeringen som ett system som stannat, inte en vägran."
      ),
    },
    {
      id: "PMC7313636",
      level: "study",
      supports: tri(
        "Estudio participativo que caracteriza el burnout autista a partir de entrevistas y textos de adultos autistas. Respalda que el apagado puede ser el final de una carga larga y que el descanso es parte de la ayuda.",
        "Participatory study characterising autistic burnout from interviews and texts by autistic adults. Backs that switching off can be the end of a long load and that rest is part of the help.",
        "Deltagande studie som beskriver autistisk burnout utifrån intervjuer och texter av autistiska vuxna. Stöder att avstängningen kan vara slutet på en lång belastning och att vila är en del av hjälpen."
      ),
    },
    {
      id: "PMC13294714",
      level: "study",
      supports: tri(
        "Entrevistas con adultos autistas sobre por qué necesitan tiempo a solas y cómo lo usan para regularse y reconectar. Respalda permitir tiempo a solas en la recuperación.",
        "Interviews with autistic adults on why they need time alone and how they use it to regulate and reconnect. Backs allowing time alone in recovery.",
        "Intervjuer med autistiska vuxna om varför de behöver tid ensamma och hur de använder den för att reglera sig och återknyta. Stöder att tillåta ensamtid i återhämtningen."
      ),
    },
    {
      id: "PMC8792870",
      level: "meta_analysis",
      supports: tri(
        "Revisión sistemática con metaanálisis: pueden aparecer rasgos catatónicos en personas autistas. Respalda consultar a un médico cuando la inmovilidad dura mucho o se repite; no describe el bloqueo cotidiano.",
        "Systematic review and meta-analysis: catatonic features can appear in autistic people. Backs seeing a doctor when immobility lasts long or recurs; it does not describe everyday shutdown.",
        "Systematisk översikt med metaanalys: katatona drag kan förekomma hos autistiska personer. Stöder att kontakta läkare när orörligheten varar länge eller återkommer; den beskriver inte vardaglig shutdown."
      ),
    },
  ],
  evidenceNote: tri(
    "Casi toda la evidencia de la biblioteca sobre el shutdown son relatos de personas autistas, no ensayos. Es la mejor fuente que hay para saber qué ayuda; los pasos son práctica construida sobre esos relatos.",
    "Almost all the library's evidence on shutdown is autistic people's own accounts, not trials. It is the best source there is on what helps; the steps are practice built on those accounts.",
    "Nästan all evidens i biblioteket om shutdown är autistiska personers egna berättelser, inte studier med kontrollgrupp. Det är den bästa källan som finns till vad som hjälper; stegen är praktik byggd på de berättelserna."
  ),
};
