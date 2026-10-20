/**
 * Protocol 9 — Possible pain or physical discomfort: a change in behaviour
 * with no clear trigger, in someone who may not be able to say what hurts.
 */

import { tri, type CrisisProtocol } from "./types";

export const possiblePain: CrisisProtocol = {
  id: "possible_pain",
  number: 9,
  title: tri("Posible dolor o malestar físico", "Possible pain or physical discomfort", "Möjlig smärta eller kroppsligt obehag"),
  recognize: [
    tri(
      "¿Hay un cambio sin motivo claro: más irritable, más crisis, menos apetito, duerme peor, se toca o se golpea una zona, camina distinto?",
      "Is there a change with no clear reason: more irritable, more crises, less appetite, sleeping worse, touching or hitting one area, walking differently?",
      "Finns en förändring utan tydlig orsak: mer irriterad, fler kriser, sämre aptit, sämre sömn, tar sig på eller slår mot ett ställe, går annorlunda?"
    ),
    tri("¿La persona no puede decir con palabras qué le pasa o dónde le duele?", "Can the person not say in words what is wrong or where it hurts?", "Kan personen inte säga med ord vad som är fel eller var det gör ont?"),
  ],
  safetyFirst: false,
  phases: {
    agitation: {
      goal: tri("Sospechar dolor antes que mala conducta.", "Suspect pain before misbehaviour.", "Misstänk smärta före dåligt uppförande."),
      steps: [
        tri("Mira el cuerpo de arriba abajo: oídos, boca y dientes, garganta, barriga, piel, pies, uñas, zona genital.", "Look over the body from top to bottom: ears, mouth and teeth, throat, belly, skin, feet, nails, genital area.", "Gå igenom kroppen uppifrån och ner: öron, mun och tänder, hals, mage, hud, fötter, naglar, underliv."),
        tri("Pregunta por lo que no se ve: ¿cuándo fue la última vez que hizo caca? ¿come y bebe como siempre? ¿tiene fiebre?", "Ask about what cannot be seen: when did they last poo? Are they eating and drinking as usual? Is there a fever?", "Fråga om det som inte syns: när bajsade personen senast? Äter och dricker den som vanligt? Har den feber?"),
        tri("Baja las exigencias y el ruido mientras averiguas.", "Lower demands and noise while you find out.", "Sänk krav och ljud medan du tar reda på det."),
        tri("Ofrece lo que suele aliviar sin medicar: calor local, frío, postura cómoda, agua, ir al baño.", "Offer what usually eases without giving anything to take: local warmth, cold, a comfortable position, water, going to the toilet.", "Erbjud det som brukar lindra utan preparat: lokal värme, kyla, en bekväm ställning, vatten, att gå på toaletten."),
      ],
      sayToPerson: [tri("¿Te duele aquí?", "Does it hurt here?", "Gör det ont här?"), tri("Te reviso con cuidado.", "I'll check you gently.", "Jag tittar försiktigt."), tri("Estoy aquí.", "I'm here.", "Jag är här.")],
    },
    peak: {
      goal: tri("Aliviar y decidir si necesita un médico hoy.", "Ease it and decide whether a doctor is needed today.", "Lindra och avgör om läkare behövs i dag."),
      steps: [
        tri("Si se golpea o aprieta una zona, protégela con algo blando y toma nota de cuál es.", "If they hit or press one area, protect it with something soft and note which one it is.", "Om personen slår eller trycker på ett ställe, skydda det med något mjukt och skriv ner vilket."),
        tri("Toma la temperatura si puedes; mira si hay vómito, diarrea, sangre, hinchazón o una postura encogida.", "Take the temperature if you can; look for vomiting, diarrhoea, blood, swelling or a curled-up posture.", "Ta temperaturen om du kan; titta efter kräkning, diarré, blod, svullnad eller en hopkrupen ställning."),
        tri("Llama al servicio de salud o al médico si algo de eso aparece o si el malestar es intenso.", "Call the health service or the doctor if any of that appears or the discomfort is intense.", "Ring vården eller läkaren om något av det visar sig eller om obehaget är kraftigt."),
        tri("Mientras tanto: poca luz, poco ruido, posición cómoda, tu presencia.", "Meanwhile: low light, low noise, a comfortable position, your presence.", "Under tiden: lågt ljus, lågt ljud, bekväm ställning, din närvaro."),
      ],
      sayToPerson: [tri("Te creo.", "I believe you.", "Jag tror dig."), tri("Vamos a aliviarlo.", "We'll ease it.", "Vi ska lindra det."), tri("Estoy contigo.", "I'm with you.", "Jag är med dig.")],
    },
    descent: {
      goal: tri("Observar si el alivio cambia la conducta.", "Watch whether relief changes the behaviour.", "Se om lindringen förändrar beteendet."),
      steps: [
        tri("Si tras el baño, el agua o el calor la persona se calma, anótalo: es una pista fuerte.", "If the person settles after the toilet, water or warmth, write it down: it is a strong clue.", "Om personen lugnar sig efter toaletten, vattnet eller värmen, skriv ner det: det är en stark ledtråd."),
        tri("Mantén el día ligero y vigila si vuelve.", "Keep the day light and watch whether it returns.", "Håll dagen lätt och håll koll på om det kommer tillbaka."),
      ],
      sayToPerson: [tri("¿Mejor así?", "Better like this?", "Bättre så?"), tri("Descansamos.", "We rest.", "Vi vilar."), tri("Aquí estoy.", "I'm here.", "Jag är här.")],
    },
    recovery: {
      goal: tri("Llevar la pista al médico.", "Take the clue to the doctor.", "Ta ledtråden till läkaren."),
      steps: [
        tri("Anota qué cambió, desde cuándo, a qué horas y qué alivió. Llévalo escrito a la consulta.", "Write down what changed, since when, at what times and what eased it. Bring it written to the appointment.", "Skriv ner vad som förändrades, sedan när, vid vilka tider och vad som lindrade. Ta med det skrivet till besöket."),
        tri("Prepara la visita: avisa que la persona es autista, qué le molesta de una consulta y cómo se comunica; pide la primera hora o una sala tranquila.", "Prepare the visit: say that the person is autistic, what bothers them at an appointment and how they communicate; ask for the first slot or a quiet room.", "Förbered besöket: säg att personen är autistisk, vad som stör vid ett besök och hur den kommunicerar; be om första tiden eller ett lugnt rum."),
        tri("Pide que revisen dientes, oídos, estómago y estreñimiento aunque no haya quejas claras.", "Ask for teeth, ears, stomach and constipation to be checked even without clear complaints.", "Be om att tänder, öron, mage och förstoppning kontrolleras även utan tydliga klagomål."),
        tri("Acuerda con la persona una forma de señalar dolor: una imagen, una escala de caras, un gesto.", "Agree with the person on a way to signal pain: a picture, a faces scale, a gesture.", "Kom överens med personen om ett sätt att visa smärta: en bild, en skala med ansikten, en gest."),
      ],
      sayToPerson: [tri("Vamos a que te vean.", "Let's get you seen.", "Vi ska låta någon titta."), tri("Te creo.", "I believe you.", "Jag tror dig."), tri("Estás bien.", "You're okay.", "Du är okej.")],
    },
  },
  never: [
    tri("Castigar una conducta que puede ser dolor: nunca se castiga a quien no puede decir que le duele.", "Punish a behaviour that may be pain: never punish someone who cannot say they are hurting.", "Straffa ett beteende som kan vara smärta: man straffar aldrig någon som inte kan säga att det gör ont."),
    tri("Encerrar o aislar a la persona «hasta que se le pase».", "Lock away or isolate the person 'until it passes'.", "Stänga in eller isolera personen 'tills det går över'."),
    tri("Sujetar para examinar a la fuerza: si no se deja, lo hace un profesional con calma y preparación.", "Restrain to examine by force: if they will not allow it, a professional does it calmly and with preparation.", "Hålla fast för att undersöka med våld: om personen inte går med på det gör en yrkesperson det lugnt och med förberedelse."),
    tri("No des analgésicos ni otros remedios por tu cuenta: la causa y qué dar lo decide un médico.", "Do not give painkillers or other remedies on your own: a doctor decides the cause and what to give.", "Ge inte smärtstillande eller andra preparat på egen hand: en läkare avgör orsaken och vad som ska ges."),
    tri("No asumas que «no siente dolor» porque no llora: puede expresarlo de otra forma.", "Do not assume they 'feel no pain' because they do not cry: they may express it differently.", "Anta inte att personen 'inte känner smärta' för att den inte gråter: den kan uttrycka det på ett annat sätt."),
  ],
  escalate: {
    callWhen: [
      tri("Dificultad para respirar, labios azulados, convulsión, pérdida de conciencia o un golpe fuerte en la cabeza.", "Trouble breathing, bluish lips, a seizure, loss of consciousness or a hard blow to the head.", "Andningssvårigheter, blåaktiga lippar, anfall, medvetslöshet eller ett hårt slag mot huvudet."),
      tri("Dolor intenso que no cede, barriga dura e hinchada, vómito con sangre o sangrado que no para.", "Intense pain that does not ease, a hard swollen belly, vomiting blood or bleeding that does not stop.", "Kraftig smärta som inte går över, hård och svullen mage, blodiga kräkningar eller blödning som inte slutar."),
      tri("Fiebre alta con somnolencia, rigidez de cuello o manchas en la piel.", "High fever with drowsiness, a stiff neck or spots on the skin.", "Hög feber med dåsighet, stel nacke eller utslag på huden."),
    ],
    contactWhen: [
      tri("El cambio dura más de unos días, hay fiebre, vómito, diarrea o deja de comer o beber: médico el mismo día.", "The change lasts more than a few days, there is fever, vomiting, diarrhoea, or they stop eating or drinking: a doctor the same day.", "Förändringen varar mer än några dagar, det finns feber, kräkning, diarré, eller personen slutar äta eller dricka: läkare samma dag."),
      tri("Se golpea siempre la misma zona o no ha ido al dentista en mucho tiempo: cita de revisión.", "They always hit the same area or have not seen a dentist in a long time: a check-up appointment.", "Personen slår alltid mot samma ställe eller har inte varit hos tandläkaren på länge: boka en kontroll."),
    ],
  },
  log: {
    kind: "abc",
    antecedent: tri("¿Desde cuándo cambió? ¿Qué más cambió esos días: comida, caca, sueño, ropa, clima, regla?", "Since when did it change? What else changed those days: food, poo, sleep, clothing, weather, period?", "Sedan när förändrades det? Vad mer ändrades de dagarna: mat, bajs, sömn, kläder, väder, mens?"),
    behavior: tri("¿Qué hace el cuerpo: tocarse, golpearse, encogerse, cojear, rechazar comida? ¿A qué horas?", "What does the body do: touching, hitting, curling up, limping, refusing food? At what times?", "Vad gör kroppen: tar sig, slår sig, kryper ihop, haltar, vägrar mat? Vid vilka tider?"),
    consequence: tri("¿Qué alivió: baño, agua, calor, acostarse, quitar una prenda? ¿Qué no cambió nada?", "What eased it: toilet, water, warmth, lying down, removing a garment? What changed nothing?", "Vad lindrade: toalett, vatten, värme, att ligga ner, att ta av ett plagg? Vad ändrade inget?"),
    hypotheses: [
      { fn: "pain", check: tri("¿La conducta baja cuando se alivia algo del cuerpo? ¿Hay fiebre, estreñimiento, dientes, oídos?", "Does the behaviour ease when something in the body is relieved? Is there fever, constipation, teeth, ears?", "Minskar beteendet när något i kroppen lindras? Finns feber, förstoppning, tänder, öron?") },
      { fn: "sensory", check: tri("¿Molesta una prenda, una etiqueta, un zapato, el calor o el frío?", "Is a garment, a label, a shoe, heat or cold bothersome?", "Stör ett plagg, en lapp, en sko, värme eller kyla?") },
      { fn: "request", check: tri("¿Intenta pedir algo que calme: agua, baño, acostarse, quitarse ropa?", "Are they trying to ask for something that soothes: water, toilet, lying down, taking clothes off?", "Försöker personen be om något som lindrar: vatten, toalett, att ligga ner, att ta av kläder?") },
    ],
    note: tri(
      "Son hipótesis para mirar el patrón, no una explicación ni un diagnóstico. Solo un médico confirma la causa; tu registro le ahorra tiempo.",
      "These are hypotheses for looking at the pattern, not an explanation or a diagnosis. Only a doctor confirms the cause; your log saves them time.",
      "Det här är hypoteser för att se mönstret, inte en förklaring eller en diagnos. Bara en läkare bekräftar orsaken; din logg spar tid för läkaren."
    ),
  },
  evidence: [
    { id: "GUIDE:nice-ng11", level: "guideline", supports: tri("Revisar la salud física y el dolor antes de interpretar una conducta. Es la base de este protocolo.", "Check physical health and pain before interpreting a behaviour. It is the basis of this protocol.", "Kontrollera kroppslig hälsa och smärta innan ett beteende tolkas. Det är grunden för det här protokollet.") },
    {
      id: "PMC3697411",
      level: "review",
      supports: tri(
        "Revisión sistemática: la idea de que las personas autistas son insensibles al dolor no se sostiene; muchas lo expresan de forma distinta. Respalda no asumir que «no le duele».",
        "Systematic review: the idea that autistic people are insensitive to pain does not hold up; many express it differently. Backs not assuming 'it does not hurt'.",
        "Systematisk översikt: idén att autistiska personer är okänsliga för smärta håller inte; många uttrycker den annorlunda. Stöder att inte anta att 'det inte gör ont'."
      ),
    },
    {
      id: "PMC9352888",
      level: "review",
      supports: tri(
        "Revisión: el dolor crónico es frecuente en autismo y suele tratarse mal porque es difícil de evaluar. Respalda registrar y llevar la pista al médico.",
        "Review: chronic pain is common in autism and is often poorly managed because it is hard to assess. Backs logging and taking the clue to the doctor.",
        "Översikt: kronisk smärta är vanlig vid autism och hanteras ofta dåligt eftersom den är svår att bedöma. Stöder att logga och ta ledtråden till läkaren."
      ),
    },
    {
      id: "PMC10103503",
      level: "trial",
      supports: tri(
        "Diseño de un ensayo que usa la frecuencia cardiaca para detectar dolor en personas autistas que no se comunican con palabras. Respalda que las señales del cuerpo cuentan cuando faltan las palabras; sin resultados en el resumen.",
        "Design of a trial using heart rate to detect pain in autistic people who do not communicate with words. Backs that body signals count when words are missing; no results in the abstract.",
        "Upplägg för en studie som använder hjärtfrekvens för att upptäcka smärta hos autistiska personer som inte kommunicerar med ord. Stöder att kroppens signaler räknas när orden saknas; inga resultat i sammanfattningen."
      ),
    },
    {
      id: "PMC12979319",
      level: "systematic_review",
      supports: tri(
        "Revisión de alcance sobre apoyos para niños neurodivergentes durante procedimientos médicos. Respalda preparar la visita y pedir adaptaciones.",
        "Scoping review on supports for neurodivergent children during medical procedures. Backs preparing the visit and asking for adaptations.",
        "Kartläggande översikt om stöd för neurodivergenta barn vid vårdingrepp. Stöder att förbereda besöket och be om anpassningar."
      ),
    },
    {
      id: "PMC9074276",
      level: "systematic_review",
      supports: tri(
        "Revisión sistemática de técnicas psicológicas para la atención dental de niños autistas. Respalda preparar la visita al dentista con apoyos visuales y gradualidad.",
        "Systematic review of psychological techniques for dental care in autistic children. Backs preparing the dental visit with visual supports and gradual steps.",
        "Systematisk översikt av psykologiska tekniker vid tandvård för autistiska barn. Stöder att förbereda tandläkarbesöket med visuella stöd och stegvis tillvänjning."
      ),
    },
  ],
  evidenceNote: tri(
    "La biblioteca respalda con fuerza la idea central: el dolor se expresa distinto y se pasa por alto. La lista de qué revisar en casa es práctica de cuidado; la causa la confirma un médico.",
    "The library strongly backs the central idea: pain is expressed differently and gets missed. The list of what to check at home is care practice; a doctor confirms the cause.",
    "Biblioteket stöder starkt den centrala idén: smärta uttrycks annorlunda och missas. Listan över vad man kollar hemma är omsorgspraktik; orsaken bekräftas av en läkare."
  ),
};
