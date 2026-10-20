/**
 * Protocol 1 — Physical danger (running toward the street, climbing, water,
 * dangerous objects, leaving the house without warning). Safety and the
 * emergency line come first.
 */

import { tri, type CrisisProtocol } from "./types";

export const physicalDanger: CrisisProtocol = {
  id: "physical_danger",
  number: 1,
  title: tri("Peligro físico", "Physical danger", "Fysisk fara"),
  recognize: [
    tri(
      "¿La persona corre hacia la calle, trepa a un lugar alto, se acerca al agua o tiene algo que corta o quema?",
      "Is the person running toward the street, climbing somewhere high, going near water or holding something that cuts or burns?",
      "Springer personen mot gatan, klättrar högt, går mot vatten eller håller något som skär eller bränner?"
    ),
    tri(
      "¿Puede hacerse daño en los próximos segundos si nadie actúa?",
      "Could they get hurt in the next few seconds if no one acts?",
      "Kan personen skadas inom några sekunder om ingen agerar?"
    ),
  ],
  safetyFirst: true,
  opening: tri(
    "Primero la seguridad: aparta a la persona del peligro o aparta el peligro de la persona.",
    "Safety first: move the person away from the danger, or the danger away from the person.",
    "Säkerheten först: flytta personen från faran, eller faran från personen."
  ),
  phases: {
    agitation: {
      goal: tri("Ver el riesgo antes de que ocurra.", "See the risk before it happens.", "Se risken innan den inträffar."),
      steps: [
        tri(
          "Fíjate en las señales que suelen venir antes: mirar la puerta, inquietud, buscar un objeto concreto.",
          "Notice the signs that usually come first: looking at the door, restlessness, searching for one object.",
          "Lägg märke till tecknen som brukar komma först: blickar mot dörren, rastlöshet, letande efter ett visst föremål."
        ),
        tri(
          "Ponte entre la persona y la salida o el peligro, con calma, sin bloquear de golpe.",
          "Place yourself between the person and the exit or the danger, calmly, without blocking suddenly.",
          "Ställ dig mellan personen och utgången eller faran, lugnt, utan att plötsligt spärra vägen."
        ),
        tri(
          "Ofrece algo que le atraiga más que el peligro: su objeto favorito, una actividad, salir juntos por la puerta correcta.",
          "Offer something more appealing than the danger: their favourite object, an activity, going out together through the right door.",
          "Erbjud något mer lockande än faran: favoritföremålet, en aktivitet, att gå ut tillsammans genom rätt dörr."
        ),
        tri("Quita de la vista lo que corta, quema o pesa.", "Take out of sight what cuts, burns or is heavy.", "Ta bort det som skär, bränner eller är tungt ur sikte."),
      ],
      say: [tri("Ven conmigo.", "Come with me.", "Kom med mig."), tri("Por aquí.", "This way.", "Den här vägen."), tri("Mira esto.", "Look at this.", "Titta här.")],
    },
    peak: {
      goal: tri("Que no se haga daño ahora.", "No harm right now.", "Ingen skada just nu."),
      steps: [
        tri(
          "Actúa primero, habla después: toma su mano o su brazo con firmeza suave solo lo necesario para alejarla del peligro inmediato, y suelta en cuanto esté a salvo.",
          "Act first, talk later: take their hand or arm, firmly but gently, only as much as needed to move them away from the immediate danger, and let go as soon as they are safe.",
          "Agera först, prata sedan: ta personens hand eller arm, bestämt men varsamt, bara så mycket som behövs för att föra bort från den omedelbara faran, och släpp så snart det är säkert."
        ),
        tri(
          "Si no puedes alcanzarla, llama su nombre una sola vez con voz baja y firme, y muéstrale algo que le interese.",
          "If you cannot reach them, say their name once, low and firm, and show them something they like.",
          "Om du inte når personen, säg namnet en gång, lågt och bestämt, och visa något som intresserar."
        ),
        tri(
          "Si está en un lugar alto o en el agua, no la asustes: acércate despacio, habla poco, pide ayuda a quien esté cerca.",
          "If they are somewhere high or in water, do not startle them: approach slowly, speak little, ask anyone nearby for help.",
          "Om personen är högt uppe eller i vatten: skräm inte, närma dig långsamt, prata lite, be de som är nära om hjälp."
        ),
        tri(
          "Si no logras ponerla a salvo, llama al número de emergencias de tu país mientras sigues a su lado.",
          "If you cannot make them safe, call your country's emergency number while staying by their side.",
          "Om du inte får personen i säkerhet, ring ditt lands nödnummer medan du stannar vid personens sida."
        ),
      ],
      say: [tri("Para. Conmigo.", "Stop. With me.", "Stanna. Med mig."), tri("Estoy aquí.", "I'm here.", "Jag är här."), tri("Dame la mano.", "Give me your hand.", "Ge mig handen.")],
    },
    descent: {
      goal: tri("Volver a un lugar seguro y bajar la activación.", "Return to a safe place and bring activation down.", "Tillbaka till en säker plats och sänk aktiveringen."),
      steps: [
        tri(
          "Llévala a un sitio cerrado al tráfico y al agua; quédate entre ella y la salida sin agarrarla.",
          "Take them to a place closed off from traffic and water; stay between them and the exit without holding on.",
          "Ta personen till en plats avskild från trafik och vatten; stanna mellan personen och utgången utan att hålla i."
        ),
        tri("Revisa si tiene heridas, golpes o quemaduras.", "Check for cuts, bumps or burns.", "Kolla efter sår, bulor eller brännskador."),
        tri("Baja tu propia voz y tu ritmo; tu calma marca la suya.", "Lower your own voice and pace; your calm sets theirs.", "Sänk din egen röst och ditt tempo; ditt lugn styr personens."),
        tri("Ofrece agua o su objeto de calma.", "Offer water or their calming object.", "Erbjud vatten eller tröstobjektet."),
      ],
      say: [tri("Ya estás a salvo.", "You're safe now.", "Nu är du trygg."), tri("Respiramos.", "We breathe.", "Vi andas."), tri("Aquí estoy.", "I'm here.", "Jag är här.")],
    },
    recovery: {
      goal: tri("Evitar la próxima vez.", "Prevent the next time.", "Förebygg nästa gång."),
      steps: [
        tri(
          "Anota qué buscaba la persona: salir, un objeto, agua, altura. Eso dice qué ofrecer la próxima vez de forma segura.",
          "Write down what the person was after: going out, an object, water, height. That tells you what to offer safely next time.",
          "Skriv ner vad personen var ute efter: att gå ut, ett föremål, vatten, höjd. Det säger vad du kan erbjuda på ett säkert sätt nästa gång."
        ),
        tri(
          "Asegura el entorno: cierres altos en puertas a la calle, ventanas y balcones; objetos que cortan o queman fuera de alcance; agua vigilada.",
          "Make the environment safe: high latches on doors to the street, windows and balconies; cutting or burning objects out of reach; water supervised.",
          "Säkra miljön: höga spärrar på dörrar mot gatan, fönster och balkonger; föremål som skär eller bränner utom räckhåll; vatten under uppsikt."
        ),
        tri(
          "Prepara una tarjeta con el nombre, un teléfono de contacto y cómo se comunica la persona, por si sale sola.",
          "Prepare a card with the name, a contact phone number and how the person communicates, in case they leave alone.",
          "Förbered ett kort med namn, ett kontaktnummer och hur personen kommunicerar, om personen går ut ensam."
        ),
        tri("Rellena el registro ABC cuando estés en calma.", "Fill in the ABC log when you are calm.", "Fyll i ABC-loggen när du är lugn."),
      ],
      say: [tri("Ya pasó.", "It's over.", "Det är över."), tri("Vamos a casa.", "Let's go home.", "Vi går hem."), tri("Estás bien.", "You're okay.", "Du är okej.")],
    },
  },
  never: [
    tri(
      "Castigar por haber corrido o trepado: no grites, no amenaces, no quites lo que le gusta. El miedo no enseña seguridad.",
      "Punish for running or climbing: no shouting, no threats, no taking away what they like. Fear does not teach safety.",
      "Straffa för att personen sprang eller klättrade: inget skrik, inga hot, inga indragna favoritsaker. Rädsla lär inte säkerhet."
    ),
    tri(
      "Encerrar a la persona sola en una habitación con llave para que no salga: el entorno se asegura, la persona no se encierra.",
      "Lock the person alone in a room so they cannot leave: the environment is secured, the person is not locked in.",
      "Stänga in personen ensam i ett låst rum så att den inte går ut: miljön säkras, personen stängs inte in."
    ),
    tri(
      "Sujetar más de lo imprescindible: apartar del peligro sí; inmovilizar, atar o tumbar en el suelo, nunca.",
      "Restrain beyond what is essential: moving away from danger yes; pinning, tying or taking to the floor, never.",
      "Hålla fast mer än nödvändigt: att föra bort från faran ja; att hålla fast, binda eller lägga på golvet, aldrig."
    ),
    tri("No persigas corriendo si puedes cortar el paso por delante: la persecución acelera.", "Do not chase at a run if you can cut across ahead: a chase speeds things up.", "Jaga inte springande om du kan gena framför: en jakt ökar tempot."),
  ],
  escalate: {
    callWhen: [
      tri("La persona está en el agua, en altura o en la vía y no logras alcanzarla.", "The person is in water, up high or on the road and you cannot reach them.", "Personen är i vatten, högt uppe eller på vägen och du når inte fram."),
      tri("Ha salido de casa y no sabes dónde está.", "They have left the house and you do not know where they are.", "Personen har lämnat hemmet och du vet inte var den är."),
      tri("Hay un golpe en la cabeza, una quemadura grande, un corte profundo, pérdida de conciencia o dificultad para respirar.", "There is a blow to the head, a large burn, a deep cut, loss of consciousness or trouble breathing.", "Det finns ett slag mot huvudet, en stor brännskada, ett djupt sår, medvetslöshet eller andningssvårigheter."),
    ],
    contactWhen: [
      tri("Las salidas o las subidas peligrosas son nuevas o cada vez más frecuentes: pide una evaluación funcional a un profesional de apoyo conductual.", "Running off or dangerous climbing is new or more and more frequent: ask a behaviour support professional for a functional assessment.", "Rymningar eller farligt klättrande är nytt eller allt vanligare: be en yrkesperson inom beteendestöd om en funktionell bedömning."),
      tri("Necesitas adaptar la casa y no sabes cómo: pregunta a terapia ocupacional o a tu servicio social.", "You need to adapt the home and do not know how: ask occupational therapy or your social service.", "Du behöver anpassa hemmet och vet inte hur: fråga arbetsterapeut eller socialtjänsten."),
    ],
  },
  log: {
    kind: "abc",
    antecedent: tri(
      "¿Qué pasó justo antes? (una puerta abierta, algo que vio, un ruido, una espera, que se le negó algo)",
      "What happened right before? (an open door, something they saw, a noise, waiting, being told no)",
      "Vad hände precis innan? (en öppen dörr, något personen såg, ett ljud, väntan, ett nej)"
    ),
    behavior: tri("¿Hacia dónde fue o qué buscó, y a qué velocidad?", "Where did they head or what did they seek, and how fast?", "Vart gick personen eller vad sökte den, och hur snabbt?"),
    consequence: tri("¿Qué pasó después? ¿Consiguió salir, el objeto o el agua? ¿Qué hiciste tú?", "What happened next? Did they get out, get the object or the water? What did you do?", "Vad hände sedan? Kom personen ut, fick föremålet eller vattnet? Vad gjorde du?"),
    hypotheses: [
      { fn: "escape", check: tri("¿Huía de algo: ruido, gente, una tarea?", "Were they getting away from something: noise, people, a task?", "Flydde personen från något: ljud, människor, en uppgift?") },
      { fn: "request", check: tri("¿Iba hacia algo que quería y no podía pedir: un lugar, un objeto, una persona?", "Were they heading for something they wanted and could not ask for: a place, an object, a person?", "Var personen på väg mot något den ville ha och inte kunde be om: en plats, ett föremål, en person?") },
      { fn: "sensory", check: tri("¿Busca sensaciones: altura, agua, movimiento, el brillo de algo?", "Are they seeking sensations: height, water, movement, something shiny?", "Söker personen sinnesintryck: höjd, vatten, rörelse, något som glittrar?") },
    ],
    note: tri(
      "Son hipótesis para mirar el patrón, no una explicación ni un diagnóstico. Varias pueden ser ciertas a la vez.",
      "These are hypotheses for looking at the pattern, not an explanation or a diagnosis. Several can be true at once.",
      "Det här är hypoteser för att se mönstret, inte en förklaring eller en diagnos. Flera kan stämma samtidigt."
    ),
  },
  evidence: [
    {
      id: "GUIDE:nice-ng11",
      level: "guideline",
      supports: tri(
        "Entender la función de la conducta y reducir al mínimo las medidas restrictivas. Respalda asegurar el entorno en lugar de encerrar o sujetar.",
        "Understand the function of the behaviour and keep restrictive measures to a minimum. Backs securing the environment instead of locking in or restraining.",
        "Förstå beteendets funktion och håll begränsande åtgärder till ett minimum. Stöder att säkra miljön i stället för att stänga in eller hålla fast."
      ),
    },
    {
      id: "PMC13211944",
      level: "trial",
      supports: tri(
        "Diseño de un ensayo que nombra las salidas sin aviso entre las conductas que ponen en peligro a la persona y propone entrenar a cuidadores tras una evaluación funcional. Sin resultados en el resumen.",
        "Trial design that names running off among the behaviours that endanger the person and proposes coaching caregivers after a functional assessment. No results in the abstract.",
        "Studieupplägg som nämner rymningar bland beteenden som utsätter personen för fara och föreslår coachning av vårdare efter en funktionell bedömning. Inga resultat i sammanfattningen."
      ),
    },
    {
      id: "PMC13469127",
      level: "systematic_review",
      supports: tri(
        "Revisión sistemática sobre la atención en urgencias a personas autistas: entorno, comunicación y preparación mejoran la seguridad y la comodidad. Respalda preparar la información para una emergencia.",
        "Systematic review of emergency department care for autistic people: environment, communication and preparation improve safety and comfort. Backs preparing information for an emergency.",
        "Systematisk översikt om akutvård för autistiska personer: miljö, kommunikation och förberedelse förbättrar säkerhet och trygghet. Stöder att ha information redo för en nödsituation."
      ),
    },
    {
      id: "PMC4922773",
      level: "review",
      supports: tri(
        "Revisión sobre evaluación funcional y entrenamiento en comunicación funcional. Respalda el registro ABC y buscar qué quería la persona.",
        "Review on functional assessment and functional communication training. Backs the ABC log and finding out what the person was after.",
        "Översikt om funktionell bedömning och funktionell kommunikationsträning. Stöder ABC-loggen och att ta reda på vad personen ville."
      ),
    },
  ],
  evidenceNote: tri(
    "La biblioteca no tiene estudios sobre el momento mismo del peligro físico. Respalda el enfoque: entender la función, asegurar el entorno, no encerrar ni sujetar más de lo imprescindible. Los pasos de la escena son práctica.",
    "The library has no studies on the moment of physical danger itself. It backs the approach: understand the function, secure the environment, do not lock in or restrain beyond what is essential. The steps at the scene are practice.",
    "Biblioteket har inga studier om själva ögonblicket av fysisk fara. Det stöder angreppssättet: förstå funktionen, säkra miljön, inte stänga in eller hålla fast mer än nödvändigt. Stegen på plats är praktik."
  ),
};
