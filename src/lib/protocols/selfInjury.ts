/**
 * Protocol 4 — Self-injury (head banging, biting or hitting oneself,
 * scratching, pulling hair). Safety and the emergency line come first.
 */

import { tri, type CrisisProtocol } from "./types";

export const selfInjury: CrisisProtocol = {
  id: "self_injury",
  number: 4,
  title: tri("Autolesión", "Self-injury", "Självskada"),
  recognize: [
    tri(
      "¿La persona se golpea la cabeza, se muerde, se pega, se rasca hasta sangrar o se tira del pelo?",
      "Is the person banging their head, biting or hitting themself, scratching until they bleed or pulling their hair?",
      "Dunkar personen huvudet, biter eller slår sig själv, river sig tills det blöder eller drar sig i håret?"
    ),
    tri("¿Hay sangre, un golpe fuerte en la cabeza o algo con lo que pueda hacerse más daño?", "Is there blood, a hard blow to the head or something they could hurt themself more with?", "Finns det blod, ett hårt slag mot huvudet eller något som personen kan skada sig mer med?"),
  ],
  safetyFirst: true,
  opening: tri(
    "Primero la seguridad: si hay sangre que no para, un golpe fuerte en la cabeza o pérdida de conciencia, pide ayuda ahora.",
    "Safety first: if there is bleeding that does not stop, a hard blow to the head or loss of consciousness, get help now.",
    "Säkerheten först: om det blöder utan att sluta, om det är ett hårt slag mot huvudet eller medvetslöshet, hämta hjälp nu."
  ),
  phases: {
    agitation: {
      goal: tri("Reducir lo que empuja hacia el daño.", "Reduce what pushes toward harm.", "Minska det som driver mot skada."),
      steps: [
        tri("Mira primero lo básico: dolor, dientes, oídos, estómago, hambre, sueño.", "Check the basics first: pain, teeth, ears, stomach, hunger, sleep.", "Kolla grunderna först: smärta, tänder, öron, mage, hunger, sömn."),
        tri("Baja el ruido, la luz y las peticiones.", "Lower noise, light and requests.", "Sänk ljud, ljus och krav."),
        tri("Ofrece una forma segura de la misma sensación: algo para morder, presión con un cojín, un paño frío.", "Offer a safe form of the same sensation: something to bite, pressure with a cushion, a cool cloth.", "Erbjud en säker form av samma känsla: något att bita på, tryck med en kudde, en sval duk."),
        tri("Pon cerca lo que suele calmar y aleja lo duro y lo filoso.", "Bring what usually calms within reach and move hard and sharp things away.", "Ha det som brukar lugna nära och flytta bort det hårda och vassa."),
      ],
      say: [tri("Estoy aquí.", "I'm here.", "Jag är här."), tri("Te cuido.", "I've got you.", "Jag tar hand om dig."), tri("Toma esto.", "Take this.", "Ta den här.")],
    },
    peak: {
      goal: tri("Reducir el daño sin forcejear.", "Reduce the harm without a struggle.", "Minska skadan utan kamp."),
      steps: [
        tri("Pon algo blando entre la cabeza y la superficie: un cojín, tu mano abierta, una manta doblada.", "Put something soft between the head and the surface: a cushion, your open hand, a folded blanket.", "Lägg något mjukt mellan huvudet och ytan: en kudde, din öppna hand, en vikt filt."),
        tri("Aleja los objetos duros; si está en el suelo, despeja alrededor.", "Move hard objects away; if they are on the floor, clear the space around.", "Flytta bort hårda föremål; om personen ligger på golvet, röj runt om."),
        tri("Quédate cerca, de lado, voz baja. Nada de órdenes.", "Stay close, to the side, low voice. No orders.", "Stanna nära, på sidan, låg röst. Inga order."),
        tri("Si se muerde, ofrece algo seguro para morder en lugar de apartar la mano.", "If they bite themself, offer something safe to bite instead of pulling the hand away.", "Om personen biter sig, erbjud något säkert att bita på i stället för att dra bort handen."),
        tri("Si hay sangre o un golpe fuerte en la cabeza, llama al número de emergencias de tu país.", "If there is blood or a hard blow to the head, call your country's emergency number.", "Om det blöder eller är ett hårt slag mot huvudet, ring ditt lands nödnummer."),
      ],
      say: [tri("Estoy contigo.", "I'm with you.", "Jag är med dig."), tri("Aquí hay blando.", "Here, something soft.", "Här är något mjukt."), tri("Despacio.", "Slowly.", "Lugnt.")],
    },
    descent: {
      goal: tri("Dejar que baje y revisar el cuerpo.", "Let it ease and check the body.", "Låt det klinga av och kolla kroppen."),
      steps: [
        tri("Sigue cerca, en silencio. Ofrece agua o su objeto de calma.", "Stay close, quietly. Offer water or their calming object.", "Stanna nära, tyst. Erbjud vatten eller tröstobjektet."),
        tri("Cuando lo permita, mira heridas, hinchazón y los ojos.", "When they allow it, check for wounds, swelling and the eyes.", "När personen tillåter, titta efter sår, svullnad och ögonen."),
        tri("Limpia y cubre los rasguños sin comentarlos.", "Clean and cover scratches without commenting on them.", "Rengör och täck rivsår utan att kommentera dem."),
      ],
      say: [tri("Ya baja.", "It's easing.", "Det släpper."), tri("Te cuido.", "I've got you.", "Jag tar hand om dig."), tri("Respiramos.", "We breathe.", "Vi andas.")],
    },
    recovery: {
      goal: tri("Entender qué pedía el cuerpo.", "Understand what the body was asking for.", "Förstå vad kroppen bad om."),
      steps: [
        tri("Anota dónde se golpeó: la misma zona repetida puede señalar dolor allí (oído, muela, cabeza).", "Note where they hit themself: the same spot repeated can point to pain there (ear, tooth, head).", "Skriv ner var personen slog sig: samma ställe upprepat kan peka på smärta där (öra, tand, huvud)."),
        tri("Pide una revisión médica si es nuevo, va a más o se concentra en una zona.", "Ask for a medical check if it is new, getting worse or focused on one area.", "Be om en läkarundersökning om det är nytt, ökar eller koncentreras till ett ställe."),
        tri("Busca con la persona formas seguras de la misma sensación y una manera de pedir pausa.", "Find with the person safe forms of the same sensation and a way to ask for a break.", "Hitta tillsammans med personen säkra former av samma känsla och ett sätt att be om paus."),
        tri("Rellena el registro ABC cuando estés en calma.", "Fill in the ABC log when you are calm.", "Fyll i ABC-loggen när du är lugn."),
      ],
      say: [tri("Ya pasó.", "It's over.", "Det är över."), tri("Estás bien.", "You're okay.", "Du är okej."), tri("Descansamos.", "We rest.", "Vi vilar.")],
    },
  },
  never: [
    tri("Castigar: no grites, no regañes, no quites lo que le gusta por hacerse daño.", "Punish: no shouting, no scolding, no taking away what they like for hurting themself.", "Straffa: inget skrik, inga tillsägelser, inga indragna favoritsaker för att personen skadade sig."),
    tri("Encerrar a la persona sola para que no la veas hacerse daño.", "Lock the person alone so you do not see them hurt themself.", "Stänga in personen ensam så att du inte ser den skada sig."),
    tri("Sujetar las manos o inmovilizar el cuerpo: aumenta el pánico y el daño. Interponer algo blando sí; agarrar, no.", "Restrain the hands or pin the body: it raises panic and harm. Putting something soft in between yes; holding on, no.", "Hålla fast händerna eller kroppen: det ökar paniken och skadan. Att lägga något mjukt emellan ja; att hålla fast, nej."),
    tri("No uses cascos ni guantes atados como castigo o sin un profesional que lo haya indicado.", "Do not use helmets or tied gloves as punishment or without a professional having advised it.", "Använd inte hjälm eller fastbundna handskar som straff eller utan att en yrkesperson har rekommenderat det."),
  ],
  escalate: {
    callWhen: [
      tri("Sangra y no para, hay un golpe fuerte en la cabeza, vomita, pierde la conciencia o le cuesta respirar.", "Bleeding does not stop, there is a hard blow to the head, vomiting, loss of consciousness or trouble breathing.", "Blödningen slutar inte, det är ett hårt slag mot huvudet, kräkning, medvetslöshet eller andningssvårigheter."),
      tri("Se ha tragado algo o se ha hecho daño en los ojos.", "They have swallowed something or hurt their eyes.", "Personen har svalt något eller skadat ögonen."),
      tri("Expresa ideas de suicidio y hay riesgo inmediato.", "They express suicidal thoughts and there is immediate risk.", "Personen uttrycker självmordstankar och det finns omedelbar risk."),
    ],
    contactWhen: [
      tri("Es nuevo, va a más o se concentra en una zona del cuerpo: revisión médica pronto, descartando dolor.", "It is new, getting worse or focused on one part of the body: a medical check soon, ruling out pain.", "Det är nytt, ökar eller koncentreras till en kroppsdel: läkarundersökning snart, för att utesluta smärta."),
      tri("Se repite: pide una evaluación funcional a un profesional de apoyo conductual.", "It keeps happening: ask a behaviour support professional for a functional assessment.", "Det fortsätter: be en yrkesperson inom beteendestöd om en funktionell bedömning."),
      tri("Habla de hacerse daño a propósito o de no querer vivir: busca ayuda en salud mental o un servicio de crisis hoy.", "They talk about hurting themself on purpose or not wanting to live: seek mental health help or a crisis service today.", "Personen talar om att skada sig med avsikt eller att inte vilja leva: sök hjälp hos psykiatrin eller en krisjour i dag."),
    ],
  },
  abc: {
    antecedent: tri("¿Qué pasó justo antes? (una petición, ruido, espera, un cambio, una comida, la hora de dormir)", "What happened right before? (a request, noise, waiting, a change, a meal, bedtime)", "Vad hände precis innan? (ett krav, ljud, väntan, en förändring, en måltid, läggdags)"),
    behavior: tri("¿Cómo se hizo daño, en qué parte del cuerpo y durante cuánto tiempo?", "How did they hurt themself, on which part of the body, and for how long?", "Hur skadade personen sig, på vilken kroppsdel, och hur länge?"),
    consequence: tri("¿Qué pasó después? ¿Se retiró la petición? ¿Recibió atención o un objeto? ¿Bajó solo?", "What happened next? Was the request dropped? Did they get attention or an object? Did it ease on its own?", "Vad hände sedan? Drogs kravet tillbaka? Fick personen uppmärksamhet eller ett föremål? Släppte det av sig självt?"),
    hypotheses: [
      { fn: "pain", check: tri("¿Se golpea siempre en la misma zona? ¿Hay señales de oído, muelas, estómago, estreñimiento, regla?", "Do they always hit the same spot? Any signs from ear, teeth, stomach, constipation, period?", "Slår personen alltid samma ställe? Finns tecken från öra, tänder, mage, förstoppning, mens?") },
      { fn: "sensory", check: tri("¿Busca presión o una sensación fuerte? ¿Baja si se ofrece algo parecido y seguro?", "Are they seeking pressure or a strong sensation? Does it ease if something similar and safe is offered?", "Söker personen tryck eller en stark känsla? Släpper det om något liknande och säkert erbjuds?") },
      { fn: "escape", check: tri("¿Terminó la petición o la situación después?", "Did the demand or situation end afterwards?", "Tog kravet eller situationen slut efteråt?") },
      { fn: "request", check: tri("¿Quería algo o atención y no tenía forma de pedirlo?", "Did they want something or attention and had no way to ask?", "Ville personen något eller uppmärksamhet och kunde inte be om det?") },
    ],
    note: tri(
      "Son hipótesis para mirar el patrón, no una explicación ni un diagnóstico. El dolor se revisa primero porque es lo más fácil de pasar por alto.",
      "These are hypotheses for looking at the pattern, not an explanation or a diagnosis. Pain is checked first because it is the easiest to miss.",
      "Det här är hypoteser för att se mönstret, inte en förklaring eller en diagnos. Smärta kontrolleras först eftersom den är lättast att missa."
    ),
  },
  evidence: [
    { id: "GUIDE:nice-ng11", level: "guideline", supports: tri("Revisar salud física y dolor antes de actuar, entender la función y reducir al mínimo las medidas restrictivas.", "Check physical health and pain before acting, understand the function and keep restrictive measures to a minimum.", "Kontrollera kroppslig hälsa och smärta innan man agerar, förstå funktionen och hålla begränsande åtgärder till ett minimum.") },
    {
      id: "PMC7557528",
      level: "meta_analysis",
      supports: tri(
        "Metaanálisis de prevalencia: la autolesión es frecuente en autismo y golpearse con la mano es la forma más común. Respalda tomarla en serio como algo habitual, no como algo raro.",
        "Prevalence meta-analysis: self-injury is common in autism and hand-hitting is the most frequent form. Backs taking it seriously as something usual, not rare.",
        "Metaanalys av förekomst: självskada är vanligt vid autism och att slå sig med handen är den vanligaste formen. Stöder att ta det på allvar som något vanligt, inte ovanligt."
      ),
    },
    {
      id: "PMC12898455",
      level: "systematic_review",
      supports: tri(
        "Revisión sistemática que vincula la autolesión con regulación emocional, factores sensoriales, comunicación y factores médicos. Respalda las cuatro hipótesis de función y revisar el dolor.",
        "Systematic review linking self-injury to emotion regulation, sensory factors, communication and medical factors. Backs the four function hypotheses and checking for pain.",
        "Systematisk översikt som kopplar självskada till känsloreglering, sensoriska faktorer, kommunikation och kroppsliga faktorer. Stöder de fyra funktionshypoteserna och att kontrollera smärta."
      ),
    },
    {
      id: "PMC12468596",
      level: "review",
      supports: tri(
        "Revisión narrativa de intervenciones conductuales, educativas y ambientales para la autolesión en niños y adolescentes autistas. Respalda el enfoque basado en la función.",
        "Narrative review of behavioural, educational and environmental interventions for self-injury in autistic children and adolescents. Backs the function-based approach.",
        "Berättande översikt av beteendeinriktade, pedagogiska och miljöinriktade insatser mot självskada hos autistiska barn och ungdomar. Stöder det funktionsbaserade angreppssättet."
      ),
    },
    {
      id: "PMC5704147",
      level: "review",
      supports: tri(
        "Revisión sobre el papel de la reactividad al dolor y a lo sensorial en la autolesión. Respalda mirar el dolor y la sensación antes que la intención.",
        "Review on the role of reactivity to pain and sensory input in self-injury. Backs looking at pain and sensation before intention.",
        "Översikt om vilken roll reaktivitet för smärta och sinnesintryck spelar vid självskada. Stöder att titta på smärta och känsla före avsikt."
      ),
    },
    {
      id: "PMC11165343",
      level: "trial",
      supports: tri(
        "Ensayo piloto de planes de seguridad adaptados al autismo para adultos con autolesión o ideas de suicidio: factible y aceptable. Respalda tener un plan escrito antes de la crisis; no cubre a niños.",
        "Pilot trial of autism-adapted safety plans for adults with self-harm or suicidal thoughts: feasible and acceptable. Backs having a written plan before the crisis; it does not cover children.",
        "Pilotstudie av autismanpassade säkerhetsplaner för vuxna med självskada eller självmordstankar: genomförbart och accepterat. Stöder att ha en skriven plan före krisen; den täcker inte barn."
      ),
    },
  ],
  evidenceNote: tri(
    "La biblioteca respalda revisar el dolor, buscar la función y no sujetar. Los gestos concretos del pico, como interponer algo blando, son práctica de cuidado, no resultado de un estudio.",
    "The library backs checking for pain, finding the function and not restraining. The specific moves at the peak, such as putting something soft in between, are care practice, not the result of a study.",
    "Biblioteket stöder att kontrollera smärta, hitta funktionen och inte hålla fast. De konkreta handgreppen på toppen, som att lägga något mjukt emellan, är omsorgspraktik, inte resultatet av en studie."
  ),
};
