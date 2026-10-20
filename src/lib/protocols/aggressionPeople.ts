/**
 * Protocol 3 — Aggression toward people (hitting, biting, pushing, kicking).
 *
 * The library backs the approach (understand the function, train whoever
 * cares, keep restrictive measures to a minimum). The individual phrases and
 * steps are practice and are labelled as such in `evidenceNote`.
 */

import { tri, type CrisisProtocol } from "./types";

export const aggressionPeople: CrisisProtocol = {
  id: "aggression_people",
  number: 3,
  title: tri("Agresión contra personas", "Aggression toward people", "Aggression mot andra människor"),
  recognize: [
    tri(
      "¿La persona golpea, muerde, empuja, patea o tira del pelo a otra persona, o lo intenta?",
      "Is the person hitting, biting, pushing, kicking or pulling hair, or trying to?",
      "Slår, biter, knuffar, sparkar eller drar personen i hår, eller försöker?"
    ),
    tri(
      "¿Hay alguien en riesgo ahora mismo, incluida la propia persona?",
      "Is anyone at risk right now, including the person themself?",
      "Är någon i fara just nu, även personen själv?"
    ),
  ],
  safetyFirst: false,
  phases: {
    agitation: {
      goal: tri(
        "Bajar la tensión antes de que llegue el pico.",
        "Bring the tension down before it peaks.",
        "Sänk spänningen innan den når toppen."
      ),
      steps: [
        tri("Pide menos: deja de hacer peticiones y de explicar.", "Ask for less: stop making requests and explaining.", "Be om mindre: sluta ställa krav och förklara."),
        tri("Baja el ruido, la luz y la cantidad de gente alrededor.", "Turn down noise, light and the number of people around.", "Sänk ljud, ljus och antalet personer i närheten."),
        tri("Da espacio: colócate de lado, justo fuera de su alcance.", "Give space: stand to the side, just out of reach.", "Ge utrymme: stå på sidan, strax utom räckhåll."),
        tri(
          "Ofrece algo conocido: su objeto de calma, su sitio tranquilo o una pausa.",
          "Offer something familiar: their calming object, their quiet place or a break.",
          "Erbjud något bekant: tröstobjektet, den lugna platsen eller en paus."
        ),
        tri("Mira lo básico: dolor, hambre, sed, baño, sueño.", "Check the basics: pain, hunger, thirst, toilet, sleep.", "Kolla grunderna: smärta, hunger, törst, toalett, sömn."),
      ],
      sayToPerson: [
        tri("Estoy aquí.", "I'm here.", "Jag är här."),
        tri("Vamos a parar.", "Let's stop.", "Vi tar en paus."),
        tri("Te doy espacio.", "I'm giving you space.", "Du får utrymme."),
      ],
    },
    peak: {
      goal: tri("Que nadie se haga daño.", "No one gets hurt.", "Ingen ska skadas."),
      steps: [
        tri(
          "Aparta a las demás personas, sobre todo a los niños, y ponte tú a salvo.",
          "Move other people away, especially children, and get yourself to safety.",
          "För bort andra personer, särskilt barn, och ta dig själv i säkerhet."
        ),
        tri(
          "Aumenta la distancia; si hace falta, pon una mesa o un cojín entre ustedes.",
          "Increase the distance; if needed, put a table or cushion between you.",
          "Öka avståndet; vid behov, ställ ett bord eller en kudde mellan er."
        ),
        tri(
          "Deja una salida libre para ti y para la persona; no te quedes en un rincón.",
          "Keep a way out free for you and for the person; do not stay in a corner.",
          "Håll en utväg fri för dig och för personen; stanna inte i ett hörn."
        ),
        tri(
          "Protege tu cabeza y tu cara; mantén las manos abiertas y a la vista.",
          "Protect your head and face; keep your hands open and visible.",
          "Skydda huvud och ansikte; håll händerna öppna och synliga."
        ),
        tri(
          "Habla poco, bajo y despacio. Sin preguntas, sin peticiones.",
          "Speak little, low and slow. No questions, no requests.",
          "Tala lite, lågt och långsamt. Inga frågor, inga krav."
        ),
        tri(
          "Retira los objetos que puedan hacer daño. No persigas ni acorrales.",
          "Remove objects that could hurt. Do not chase or corner.",
          "Ta bort föremål som kan skada. Jaga inte och driv inte in personen i ett hörn."
        ),
      ],
      sayToPerson: [
        tri("Estás a salvo.", "You're safe.", "Du är trygg."),
        tri("Me aparto.", "I'm stepping back.", "Jag backar."),
        tri("No hay prisa.", "No rush.", "Ingen brådska."),
      ],
    },
    descent: {
      goal: tri("Dejar que el cuerpo se calme.", "Let the body settle.", "Låt kroppen landa."),
      steps: [
        tri(
          "Espera en silencio a una distancia segura; no hables de lo que pasó.",
          "Wait quietly at a safe distance; do not talk about what happened.",
          "Vänta tyst på säkert avstånd; prata inte om det som hände."
        ),
        tri(
          "Ofrece agua o su objeto de calma, sin esperar que lo tome.",
          "Offer water or their calming object without expecting them to take it.",
          "Erbjud vatten eller tröstobjektet utan att vänta dig att personen tar det."
        ),
        tri(
          "Mantén poca luz, poco ruido y pocas personas.",
          "Keep light low, noise low and few people around.",
          "Håll ljuset lågt, ljudet lågt och få personer i närheten."
        ),
        tri(
          "Acércate solo cuando el cuerpo esté más suelto: hombros bajos, respiración más lenta.",
          "Come closer only when the body has softened: shoulders down, breathing slower.",
          "Kom närmare först när kroppen har lugnat sig: axlarna nere, andningen långsammare."
        ),
      ],
      sayToPerson: [
        tri("Respira a tu ritmo.", "Breathe at your pace.", "Andas i din takt."),
        tri("Aquí estoy.", "I'm here.", "Jag är här."),
        tri("Sin prisa.", "No hurry.", "Ingen brådska."),
      ],
    },
    recovery: {
      goal: tri(
        "Volver a la calma y aprender del patrón.",
        "Return to calm and learn the pattern.",
        "Tillbaka till lugn och lär dig mönstret."
      ),
      steps: [
        tri(
          "Deja que descanse, beba o coma si quiere. Sin peticiones.",
          "Let them rest, drink or eat if they want. No requests.",
          "Låt personen vila, dricka eller äta om den vill. Inga krav."
        ),
        tri(
          "Revisa si alguien está herido, la persona y las demás, y atiende eso primero.",
          "Check whether anyone is hurt, the person and others, and see to that first.",
          "Kolla om någon är skadad, personen och andra, och ta hand om det först."
        ),
        tri(
          "No le pidas que pida perdón ni expliques consecuencias ahora: hablar no ayuda en este momento.",
          "Do not ask them to say sorry or explain consequences now: talking does not help at this moment.",
          "Be inte personen säga förlåt och förklara inga konsekvenser nu: samtal hjälper inte just då."
        ),
        tri("Más tarde, con calma, rellena el registro ABC.", "Later, when calm, fill in the ABC log.", "Fyll i ABC-loggen senare, när det är lugnt."),
        tri("Cuida también de quien recibió el golpe y de ti.", "Look after whoever was hit, and yourself.", "Ta hand om den som blev slagen, och om dig själv."),
      ],
      sayToPerson: [
        tri("Ya pasó.", "It's over.", "Det är över."),
        tri("Estás bien.", "You're okay.", "Du är okej."),
        tri("Descansamos.", "We rest.", "Vi vilar."),
      ],
    },
  },
  never: [
    tri(
      "Castigar: no grites, no amenaces, no quites cosas que le gustan ni pongas consecuencias durante la crisis ni justo después.",
      "Punish: no shouting, no threats, no taking away things they enjoy, no consequences during the crisis or right after.",
      "Straffa: inget skrik, inga hot, inga indragna favoritsaker och inga konsekvenser under krisen eller direkt efter."
    ),
    tri(
      "Encerrar: no dejes a la persona sola tras una puerta cerrada o con llave, ni en una habitación aislada.",
      "Lock in: do not leave the person alone behind a closed or locked door, or in an isolated room.",
      "Stänga in: lämna inte personen ensam bakom en stängd eller låst dörr, eller i ett avskilt rum."
    ),
    tri(
      "Sujetar: no la agarres, no la inmovilices ni la tumbes en el suelo; puede hacer daño a las dos partes.",
      "Restrain: do not grab, pin or take the person to the floor; it can hurt both of you.",
      "Hålla fast: ta inte tag i personen, håll inte fast och lägg inte personen på golvet; det kan skada er båda."
    ),
    tri(
      "No discutas ni razones en el pico, y no le digas que se calme.",
      "Do not argue or reason at the peak, and do not tell the person to calm down.",
      "Argumentera eller resonera inte på toppen, och säg inte åt personen att lugna sig."
    ),
    tri(
      "No conviertas la crisis en un espectáculo: pocas personas y sin grabar.",
      "Do not turn the crisis into a show: few people and no filming.",
      "Gör inte krisen till en föreställning: få personer och ingen filmning."
    ),
  ],
  escalate: {
    callWhen: [
      tri(
        "Alguien está en peligro serio y no puedes ponerlo a salvo.",
        "Someone is in serious danger and you cannot make them safe.",
        "Någon är i allvarlig fara och du kan inte få personen i säkerhet."
      ),
      tri(
        "Hay un golpe en la cabeza, un sangrado que no para, pérdida de conciencia o dificultad para respirar.",
        "There is a blow to the head, bleeding that does not stop, loss of consciousness or trouble breathing.",
        "Det finns ett slag mot huvudet, blödning som inte stannar, medvetslöshet eller andningssvårigheter."
      ),
      tri(
        "La agresión no baja y tú no estás a salvo.",
        "The aggression does not ease and you are not safe.",
        "Aggressionen minskar inte och du är inte säker."
      ),
      tri(
        "La persona tiene en la mano un objeto peligroso.",
        "The person is holding a dangerous object.",
        "Personen håller i ett farligt föremål."
      ),
    ],
    contactWhen: [
      tri(
        "La agresión es nueva, aparece de golpe o viene con señales de enfermedad: llama a un médico o a tu servicio de salud el mismo día.",
        "The aggression is new, sudden or comes with signs of illness: call a doctor or your health service the same day.",
        "Aggressionen är ny, plötslig eller kommer med tecken på sjukdom: kontakta läkare eller vården samma dag."
      ),
      tri(
        "Se repite o va a más: pide a un profesional de apoyo conductual una evaluación funcional.",
        "It keeps happening or is getting worse: ask a behaviour support professional for a functional assessment.",
        "Den fortsätter eller blir värre: be en yrkesperson inom beteendestöd om en funktionell bedömning."
      ),
      tri(
        "Alguien resultó herido: cuéntalo a tu equipo de apoyo, aunque ya haya pasado.",
        "Someone was hurt: tell your support team, even if it is over.",
        "Någon blev skadad: berätta för ert stödteam, även om det är över."
      ),
    ],
  },
  log: {
    kind: "abc",
    antecedent: tri(
      "¿Qué pasó justo antes? (una petición, un cambio, ruido, una espera, algo que se quitó)",
      "What happened right before? (a request, a change, noise, waiting, something taken away)",
      "Vad hände precis innan? (ett krav, en förändring, ljud, väntan, något som togs bort)"
    ),
    behavior: tri(
      "¿Qué hizo exactamente, a quién y durante cuánto tiempo?",
      "What exactly did the person do, to whom, and for how long?",
      "Vad gjorde personen exakt, mot vem och hur länge?"
    ),
    consequence: tri(
      "¿Qué pasó después? ¿Se retiró la petición? ¿Recibió atención o un objeto? ¿Se calmó sola?",
      "What happened next? Was the request dropped? Did they get attention or an object? Did it ease on its own?",
      "Vad hände sedan? Drogs kravet tillbaka? Fick personen uppmärksamhet eller ett föremål? Lugnade det sig av sig självt?"
    ),
    hypotheses: [
      {
        fn: "escape",
        check: tri(
          "¿Terminó la petición o la situación después de la conducta?",
          "Did the demand or situation end after the behaviour?",
          "Tog kravet eller situationen slut efter beteendet?"
        ),
      },
      {
        fn: "request",
        check: tri(
          "¿Ocurrió cuando quería algo o atención y no tenía una forma de pedirlo?",
          "Did it happen when they wanted something or attention and had no way to ask?",
          "Hände det när personen ville ha något eller uppmärksamhet och inte kunde be om det?"
        ),
      },
      {
        fn: "sensory",
        check: tri(
          "¿Había ruido, luz, contacto o multitud? ¿Se calmó al bajar el estímulo?",
          "Was there noise, light, touch or a crowd? Did it ease when the stimulus went down?",
          "Fanns det ljud, ljus, beröring eller folkmassa? Lugnade det sig när intrycken minskade?"
        ),
      },
      {
        fn: "pain",
        check: tri(
          "¿Hay señales de dolor o malestar (sueño, hambre, estreñimiento, dientes)? ¿Hay algo nuevo?",
          "Any signs of pain or discomfort (sleep, hunger, constipation, teeth)? Anything new?",
          "Finns tecken på smärta eller obehag (sömn, hunger, förstoppning, tänder)? Är något nytt?"
        ),
      },
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
        "Pide entender la función de la conducta, revisar dolor y salud, y reducir al mínimo las medidas restrictivas. Respalda no sujetar, no encerrar y no castigar.",
        "Asks to understand the function of the behaviour, check pain and health, and keep restrictive measures to a minimum. Backs not restraining, not locking in and not punishing.",
        "Säger att man ska förstå beteendets funktion, kontrollera smärta och hälsa och hålla begränsande åtgärder till ett minimum. Stöder att inte hålla fast, stänga in eller straffa."
      ),
    },
    {
      id: "PMC4922773",
      level: "review",
      supports: tri(
        "Revisión que describe la evaluación funcional, el refuerzo y el entrenamiento en comunicación funcional contra la agresión. Respalda el registro ABC y las hipótesis de función.",
        "Review describing functional assessment, reinforcement and functional communication training against aggression. Backs the ABC log and the function hypotheses.",
        "Översikt som beskriver funktionell bedömning, förstärkning och funktionell kommunikationsträning mot aggression. Stöder ABC-loggen och funktionshypoteserna."
      ),
    },
    {
      id: "PMC12864344",
      level: "trial",
      supports: tri(
        "Ensayo aleatorizado: el entrenamiento presencial para madres y padres mejoró el cumplimiento de peticiones y la irritabilidad, y la mejora continuó después. Respalda formar a quien cuida; no prueba los pasos de una crisis.",
        "Randomised trial: face-to-face parent training improved following requests and irritability, and the gains lasted. Backs training whoever cares; it does not test the steps of a crisis.",
        "Randomiserad studie: föräldrautbildning på plats förbättrade följsamhet och irritabilitet, och förbättringen höll i sig. Stöder utbildning av den som vårdar; den prövar inte stegen i en kris."
      ),
    },
    {
      id: "PMC13211944",
      level: "trial",
      supports: tri(
        "Diseño de un ensayo que compara entrenar a cuidadores, en persona o a distancia, tras una evaluación funcional práctica. El resumen no da resultados: respalda que las personas cuidadoras pueden aplicar un plan, no cada paso.",
        "Design of a trial comparing caregiver coaching, in person or by telehealth, after a practical functional assessment. The abstract gives no results: it backs that caregivers can carry out a plan, not each step.",
        "Upplägg för en studie som jämför coachning av vårdare, på plats eller på distans, efter en praktisk funktionell bedömning. Sammanfattningen ger inga resultat: den stöder att vårdare kan genomföra en plan, inte varje steg."
      ),
    },
    {
      id: "PMC7303837",
      level: "trial",
      supports: tri(
        "Ensayo piloto de entrenamiento con simulaciones para el personal que atiende agresión; el resumen describe el diseño, sin resultados. Respalda ensayar la respuesta antes de que ocurra.",
        "Pilot trial of simulation training for staff who face aggression; the abstract describes the design, without results. Backs rehearsing the response before it happens.",
        "Pilotstudie av simuleringsträning för personal som möter aggression; sammanfattningen beskriver upplägget, utan resultat. Stöder att öva responsen innan den behövs."
      ),
    },
  ],
  evidenceNote: tri(
    "La biblioteca respalda el enfoque: entender la función, formar a quien cuida y reducir las medidas restrictivas. No prueba cada frase ni cada paso de una crisis: son práctica, para que la persona cuidadora los adapte.",
    "The library backs the approach: understand the function, train whoever cares and keep restrictive measures down. It does not test each phrase or step of a crisis: those are practice, for the caregiver to adapt.",
    "Biblioteket stöder angreppssättet: förstå funktionen, utbilda den som vårdar och minska begränsande åtgärder. Det prövar inte varje fras eller steg i en kris: de är praktik, som vårdaren anpassar."
  ),
};
