/**
 * Protocol 8 — Sleep: refusing to go to bed, long time falling asleep, waking
 * in the night, very early mornings. The phases follow one night.
 */

import { tri, type CrisisProtocol } from "./types";

export const sleep: CrisisProtocol = {
  id: "sleep",
  number: 8,
  title: tri("Sueño", "Sleep", "Sömn"),
  recognize: [
    tri(
      "¿La persona tarda mucho en dormirse, se despierta de noche, se levanta muy temprano o se niega a ir a la cama, y eso pasa varias noches por semana?",
      "Does the person take a long time to fall asleep, wake in the night, get up very early or refuse to go to bed, several nights a week?",
      "Tar det lång tid för personen att somna, vaknar den på natten, går upp mycket tidigt eller vägrar gå och lägga sig, flera nätter i veckan?"
    ),
    tri("¿Al día siguiente hay más irritabilidad, más crisis o más cansancio en toda la casa?", "Is there more irritability, more crises or more tiredness in the whole house the next day?", "Blir det mer irritation, fler kriser eller mer trötthet i hela hemmet dagen efter?"),
  ],
  safetyFirst: false,
  phases: {
    agitation: {
      goal: tri("Preparar el cuerpo para dormir.", "Prepare the body for sleep.", "Förbered kroppen för sömn."),
      steps: [
        tri("La misma secuencia cada noche, en el mismo orden, mostrada con imágenes si ayuda.", "The same sequence every night, in the same order, shown with pictures if that helps.", "Samma sekvens varje kväll, i samma ordning, visad med bilder om det hjälper."),
        tri("Pantallas apagadas un buen rato antes; luz baja y cálida; menos ruido en la casa.", "Screens off a good while before; low, warm light; less noise in the house.", "Skärmar av en bra stund innan; lågt, varmt ljus; mindre ljud i hemmet."),
        tri("Lo que calma a esta persona: peso de una manta, presión, un sonido constante, un objeto.", "What calms this person: the weight of a blanket, pressure, a steady sound, an object.", "Det som lugnar den här personen: tyngden av en filt, tryck, ett jämnt ljud, ett föremål."),
        tri("Revisa hambre, sed, baño, dolor, ropa que molesta, temperatura.", "Check hunger, thirst, toilet, pain, bothersome clothing, temperature.", "Kolla hunger, törst, toalett, smärta, kläder som stör, temperatur."),
      ],
      say: [tri("Pijama, dientes, cama.", "Pyjamas, teeth, bed.", "Pyjamas, tänder, säng."), tri("Ya es hora de descansar.", "Time to rest now.", "Nu är det dags att vila."), tri("Estoy cerca.", "I'm nearby.", "Jag är nära.")],
    },
    peak: {
      goal: tri("Pasar la noche con el menor estímulo posible.", "Get through the night with as little stimulation as possible.", "Ta er genom natten med så lite stimulans som möjligt."),
      steps: [
        tri("Si se levanta o se despierta, acompaña de vuelta a la cama con pocas palabras, siempre las mismas, sin encender luces fuertes.", "If they get up or wake, walk them back to bed with few words, always the same ones, without turning on bright lights.", "Om personen går upp eller vaknar: följ tillbaka till sängen med få ord, alltid samma, utan att tända starkt ljus."),
        tri("No empieces juegos, comida ni pantallas de noche: la noche se vuelve interesante.", "Do not start games, food or screens at night: the night becomes interesting.", "Starta inte lek, mat eller skärmar på natten: natten blir intressant."),
        tri("Si llora o está angustiada, quédate cerca en silencio hasta que baje, sin sacarla de la habitación.", "If they cry or are distressed, stay nearby in silence until it eases, without taking them out of the room.", "Om personen gråter eller är upprörd: stanna nära i tystnad tills det släpper, utan att ta personen ut ur rummet."),
        tri("Si tú necesitas dormir, túrnense; nadie aguanta noches seguidas.", "If you need sleep, take turns; no one lasts night after night.", "Om du behöver sova, turas om; ingen håller natt efter natt."),
      ],
      say: [tri("Es de noche. A dormir.", "It's night. Sleep time.", "Det är natt. Dags att sova."), tri("Estoy aquí.", "I'm here.", "Jag är här."), tri("Shh.", "Shh.", "Sch.")],
    },
    descent: {
      goal: tri("Volver a dormir sin reiniciar la noche.", "Get back to sleep without restarting the night.", "Somna om utan att starta om natten."),
      steps: [
        tri("Mismo ritual corto que al acostarse, en versión mínima.", "The same short ritual as at bedtime, in a minimal version.", "Samma korta ritual som vid läggdags, i minimal version."),
        tri("Retírate poco a poco: primero al lado, luego a la puerta, luego fuera.", "Withdraw gradually: first beside, then at the door, then outside.", "Dra dig tillbaka stegvis: först intill, sedan vid dörren, sedan utanför."),
        tri("Si se despertó muy temprano y ya no duerme, actividad tranquila con poca luz hasta la hora acordada.", "If they woke very early and will not sleep, quiet activity in low light until the agreed time.", "Om personen vaknade mycket tidigt och inte sover mer: lugn aktivitet i svagt ljus fram till den överenskomna tiden."),
      ],
      say: [tri("Todavía es noche.", "It's still night.", "Det är fortfarande natt."), tri("Yo me quedo un poco.", "I'll stay a little.", "Jag stannar en stund."), tri("Hasta mañana.", "See you in the morning.", "Vi ses i morgon.")],
    },
    recovery: {
      goal: tri("Cuidar el día para cuidar la noche.", "Look after the day to look after the night.", "Ta hand om dagen för att ta hand om natten."),
      steps: [
        tri("Luz natural y movimiento por la mañana; mismas horas de levantarse y acostarse también el fin de semana.", "Natural light and movement in the morning; the same getting-up and bedtime hours at the weekend too.", "Dagsljus och rörelse på morgonen; samma tider för att gå upp och lägga sig även på helgen."),
        tri("Siestas cortas y no tarde, si las hay.", "Short naps, and not late, if any.", "Korta tupplurar, och inte sena, om några."),
        tri("Lleva un diario de sueño sencillo: hora de acostarse, de dormirse, despertares, hora de levantarse. Dos semanas bastan para ver un patrón.", "Keep a simple sleep diary: bedtime, time of falling asleep, wakings, getting-up time. A couple of weeks is enough to see a pattern.", "För en enkel sömndagbok: läggtid, insomningstid, uppvaknanden, uppstigningstid. Ett par veckor räcker för att se ett mönster."),
        tri("Baja las exigencias del día siguiente a una mala noche; para la persona y para ti.", "Lower the demands the day after a bad night; for the person and for you.", "Sänk kraven dagen efter en dålig natt; för personen och för dig."),
      ],
      say: [tri("Hoy vamos despacio.", "Today we go slow.", "I dag tar vi det lugnt."), tri("Mañana otra vez.", "Tomorrow again.", "I morgon igen."), tri("Lo estás haciendo bien.", "You're doing well.", "Du gör det bra.")],
    },
  },
  never: [
    tri("Castigar por no dormir o por despertarse: ni regaños ni perder cosas al día siguiente.", "Punish for not sleeping or for waking: no scolding, no losing things the next day.", "Straffa för att personen inte sover eller vaknar: inga tillsägelser, inget som dras in dagen efter."),
    tri("Encerrar a la persona en su habitación con llave para que no salga de noche: se asegura la casa, no se encierra a la persona.", "Lock the person in their room so they do not come out at night: the house is made safe, the person is not locked in.", "Låsa in personen i sitt rum så att den inte går ut på natten: hemmet säkras, personen stängs inte in."),
    tri("Sujetar en la cama o atar para que se quede acostada.", "Restrain in bed or tie down so they stay lying.", "Hålla fast i sängen eller binda så att personen ligger kvar."),
    tri("No cambies el ritual cada noche buscando «el truco»: la repetición es el truco.", "Do not change the ritual every night looking for 'the trick': repetition is the trick.", "Byt inte ritual varje kväll i jakt på 'knepet': upprepningen är knepet."),
    tri("No des nada para dormir sin que lo haya indicado un médico.", "Do not give anything to help sleep unless a doctor has prescribed it.", "Ge inget för att sova utan att en läkare har ordinerat det."),
  ],
  escalate: {
    callWhen: [
      tri("Durante la noche sale de casa o se pone en peligro y no logras ponerla a salvo.", "During the night they leave the house or put themself in danger and you cannot make them safe.", "På natten går personen ut ur huset eller utsätter sig för fara och du får inte den i säkerhet."),
      tri("Deja de respirar unos segundos repetidamente mientras dormía, se pone azulada o tiene una convulsión.", "They repeatedly stop breathing for seconds while asleep, turn bluish or have a seizure.", "Personen slutar upprepade gånger andas några sekunder i sömnen, blir blåaktig eller får ett anfall."),
    ],
    contactWhen: [
      tri("Ronca fuerte, respira con pausas, se mueve sin parar o parece tener dolor de noche: consulta médica.", "Loud snoring, pauses in breathing, constant movement or signs of pain at night: see a doctor.", "Högt snarkande, andningspauser, ständig rörelse eller tecken på smärta på natten: kontakta läkare."),
      tri("Tras semanas de rutina estable sigue sin dormir y el día se desmorona: pide un programa de sueño conductual a un profesional.", "After weeks of a stable routine they still do not sleep and the day falls apart: ask a professional for a behavioural sleep programme.", "Efter veckor med stabil rutin sover personen fortfarande inte och dagen rasar: be en yrkesperson om ett beteendeinriktat sömnprogram."),
      tri("Tú llevas semanas sin dormir: dilo a tu médico y a tu red; es parte del cuidado.", "You have gone weeks without sleep: tell your doctor and your network; it is part of the care.", "Du har inte sovit på veckor: säg det till din läkare och ditt nätverk; det är en del av omsorgen."),
    ],
  },
  abc: {
    antecedent: tri("¿Cómo fue el día: siesta, pantallas, actividad, comida tarde, cambios, enfermedad?", "What was the day like: nap, screens, activity, late food, changes, illness?", "Hur var dagen: tupplur, skärmar, aktivitet, sen mat, förändringar, sjukdom?"),
    behavior: tri("¿Qué pasó de noche: no dormirse, despertares, levantarse, llorar? ¿A qué horas?", "What happened at night: not falling asleep, wakings, getting up, crying? At what times?", "Vad hände på natten: inte somna, uppvaknanden, gå upp, gråta? Vid vilka tider?"),
    consequence: tri("¿Qué pasó después? ¿Hubo juego, comida, pantalla, compañía en otra cama?", "What happened next? Was there play, food, a screen, company in another bed?", "Vad hände sedan? Blev det lek, mat, skärm, sällskap i en annan säng?"),
    hypotheses: [
      { fn: "sensory", check: tri("¿Molesta algo del cuarto: luz, ruido, etiqueta, temperatura, textura de la cama?", "Is something in the room bothersome: light, noise, a label, temperature, the feel of the bed?", "Stör något i rummet: ljus, ljud, en lapp, temperatur, sängens känsla?") },
      { fn: "pain", check: tri("¿Hay señales de dolor, reflujo, estreñimiento, picor, dientes, congestión?", "Any signs of pain, reflux, constipation, itching, teeth, congestion?", "Finns tecken på smärta, reflux, förstoppning, klåda, tänder, täppt näsa?") },
      { fn: "request", check: tri("¿Busca compañía, un objeto o una pantalla y lo consigue al despertarse?", "Are they seeking company, an object or a screen and getting it when they wake?", "Söker personen sällskap, ett föremål eller en skärm och får det när den vaknar?") },
      { fn: "escape", check: tri("¿Evita la cama o el cuarto por algo que pasó allí o por la oscuridad?", "Are they avoiding the bed or the room because of something that happened there or the dark?", "Undviker personen sängen eller rummet på grund av något som hänt där eller mörkret?") },
    ],
    note: tri(
      "Son hipótesis para mirar el patrón, no una explicación ni un diagnóstico. El sueño depende de muchas cosas del día; el diario ayuda más que la memoria.",
      "These are hypotheses for looking at the pattern, not an explanation or a diagnosis. Sleep depends on many things in the day; the diary helps more than memory.",
      "Det här är hypoteser för att se mönstret, inte en förklaring eller en diagnos. Sömnen beror på mycket under dagen; dagboken hjälper mer än minnet."
    ),
  },
  evidence: [
    {
      id: "PMC6705823",
      level: "meta_analysis",
      supports: tri(
        "Revisión sistemática de ensayos sobre intervenciones conductuales para el insomnio en niños autistas. Respalda rutinas y estrategias conductuales como primera línea.",
        "Systematic review of trials on behavioural interventions for insomnia in autistic children. Backs routines and behavioural strategies as the first line.",
        "Systematisk översikt av studier om beteendeinriktade insatser mot sömnlöshet hos autistiska barn. Stöder rutiner och beteendestrategier som första steg."
      ),
    },
    {
      id: "PMC9790415",
      level: "trial",
      supports: tri(
        "Ensayo aleatorizado de una intervención conductual breve para el sueño en niños autistas, con resultados también para el estrés de la familia. Respalda que un programa corto y estructurado puede ayudar.",
        "Randomised trial of a brief behavioural sleep intervention for autistic children, with outcomes also for family stress. Backs that a short structured programme can help.",
        "Randomiserad studie av en kort beteendeinriktad sömninsats för autistiska barn, med utfall även för familjens stress. Stöder att ett kort strukturerat program kan hjälpa."
      ),
    },
    {
      id: "PMC12651674",
      level: "systematic_review",
      supports: tri(
        "Revisión sistemática: los problemas de sueño se asocian de forma constante con más dificultades de conducta de día, incluida la agresión. Respalda tratar el sueño como parte de la prevención de crisis.",
        "Systematic review: sleep problems are consistently associated with more daytime behavioural difficulties, including aggression. Backs treating sleep as part of crisis prevention.",
        "Systematisk översikt: sömnproblem hänger genomgående ihop med fler beteendesvårigheter på dagen, inklusive aggression. Stöder att se sömnen som en del av krisförebyggande."
      ),
    },
    {
      id: "PMC9152214",
      level: "systematic_review",
      supports: tri(
        "Revisión de alcance sobre la relación entre sueño y procesamiento sensorial en autismo. Respalda revisar luz, ruido, texturas y presión en el cuarto.",
        "Scoping review on the relationship between sleep and sensory processing in autism. Backs checking light, noise, textures and pressure in the room.",
        "Kartläggande översikt om sambandet mellan sömn och sensorisk bearbetning vid autism. Stöder att se över ljus, ljud, texturer och tryck i rummet."
      ),
    },
  ],
  evidenceNote: tri(
    "Es el protocolo con más respaldo de la biblioteca: hay ensayos y revisiones sobre rutinas conductuales de sueño. Los detalles de cada ritual son práctica y deben ajustarse a la persona.",
    "This is the protocol with the most backing in the library: there are trials and reviews on behavioural sleep routines. The details of each ritual are practice and must be adjusted to the person.",
    "Det här är protokollet med mest stöd i biblioteket: det finns studier och översikter om beteendeinriktade sömnrutiner. Detaljerna i varje ritual är praktik och måste anpassas till personen."
  ),
};
