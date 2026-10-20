/**
 * Protocol 7 — Transitions and refusal: changing activity, leaving a place,
 * stopping a screen, a plan that changes, "no" to a request.
 */

import { tri, type CrisisProtocol } from "./types";

export const transitionsRefusal: CrisisProtocol = {
  id: "transitions_refusal",
  number: 7,
  title: tri("Transiciones y rechazo", "Transitions and refusal", "Övergångar och vägran"),
  recognize: [
    tri(
      "¿Hay que cambiar de actividad, salir de un lugar, apagar una pantalla o seguir un plan que cambió, y la persona se niega, se tira al suelo o se aferra a lo que hacía?",
      "Do you need to change activity, leave a place, turn off a screen or follow a changed plan, and the person refuses, drops to the floor or clings to what they were doing?",
      "Behöver ni byta aktivitet, lämna en plats, stänga av en skärm eller följa en ändrad plan, och personen vägrar, lägger sig på golvet eller klamrar sig fast vid det den gjorde?"
    ),
    tri("¿Avisaste con tiempo y de una forma que la persona entiende?", "Did you give warning in time and in a way the person understands?", "Förvarnade du i tid och på ett sätt som personen förstår?"),
  ],
  safetyFirst: false,
  phases: {
    agitation: {
      goal: tri("Hacer el cambio previsible.", "Make the change predictable.", "Gör förändringen förutsägbar."),
      steps: [
        tri("Avisa antes, con lo que la persona entienda: una imagen, un objeto, un reloj visual, una frase siempre igual.", "Warn ahead, in what the person understands: a picture, an object, a visual timer, a phrase that is always the same.", "Förvarna i förväg, med det personen förstår: en bild, ett föremål, en visuell timer, en fras som alltid är likadan."),
        tri("Muestra qué viene después y, si es posible, algo bueno al otro lado.", "Show what comes next and, if possible, something good on the other side.", "Visa vad som kommer sedan och, om möjligt, något bra på andra sidan."),
        tri("Deja que termine algo pequeño: la última pieza, el final de la canción.", "Let them finish something small: the last piece, the end of the song.", "Låt personen avsluta något litet: sista biten, slutet på låten."),
        tri("Ofrece una elección pequeña dentro del cambio: qué llevar, por dónde ir.", "Offer a small choice within the change: what to bring, which way to go.", "Erbjud ett litet val inom förändringen: vad som ska med, vilken väg."),
      ],
      sayToPerson: [tri("Primero esto, luego aquello.", "First this, then that.", "Först det här, sedan det."), tri("Una más y vamos.", "One more, then we go.", "En till, sedan går vi."), tri("Tú eliges: esto o esto.", "You choose: this or this.", "Du väljer: detta eller detta.")],
    },
    peak: {
      goal: tri("No convertirlo en una lucha.", "Do not turn it into a fight.", "Gör det inte till en kamp."),
      steps: [
        tri("Deja de repetir la orden. Espera en silencio, cerca.", "Stop repeating the instruction. Wait quietly, close by.", "Sluta upprepa uppmaningen. Vänta tyst, nära."),
        tri("Si está en el suelo, no la levantes a la fuerza: siéntate cerca y espera.", "If they are on the floor, do not pull them up by force: sit nearby and wait.", "Om personen ligger på golvet: dra inte upp med våld, sätt dig nära och vänta."),
        tri("Baja la exigencia a un paso mínimo: solo ponerse de pie, solo tomar la mochila.", "Lower the demand to one minimal step: just standing up, just picking up the bag.", "Sänk kravet till ett minimalt steg: bara ställa sig upp, bara ta väskan."),
        tri("Si el cambio puede esperar, que espere. Si no, hazlo tú con calma y pocas palabras, llevando lo que la persona quiere llevar.", "If the change can wait, let it wait. If not, do it yourself calmly and with few words, carrying what the person wants to bring.", "Om förändringen kan vänta, låt den vänta. Om inte, gör den själv lugnt och med få ord, och ta med det personen vill ha med."),
      ],
      sayToPerson: [tri("Te espero.", "I'll wait for you.", "Jag väntar på dig."), tri("Solo un paso.", "Just one step.", "Bara ett steg."), tri("Lo llevamos.", "We'll take it with us.", "Vi tar det med oss.")],
    },
    descent: {
      goal: tri("Cerrar el cambio sin castigo.", "Close the change without punishment.", "Avsluta förändringen utan straff."),
      steps: [
        tri("Cuando se mueva, acompaña sin comentar la resistencia.", "When they move, go along without commenting on the resistance.", "När personen rör sig, följ med utan att kommentera motståndet."),
        tri("Cumple lo que mostraste que venía después.", "Deliver what you showed would come next.", "Leverera det du visade skulle komma sedan."),
        tri("Deja un rato de calma antes de la siguiente petición.", "Leave a calm stretch before the next request.", "Lämna en lugn stund innan nästa krav."),
      ],
      sayToPerson: [tri("Ya estamos.", "Here we are.", "Nu är vi här."), tri("Lo hiciste.", "You did it.", "Du gjorde det."), tri("Ahora tranquilos.", "Now we rest.", "Nu tar vi det lugnt.")],
    },
    recovery: {
      goal: tri("Preparar mejor la próxima transición.", "Prepare the next transition better.", "Förbered nästa övergång bättre."),
      steps: [
        tri("Anota qué cambios cuestan más y en qué momento del día.", "Note which changes are hardest and at what time of day.", "Skriv ner vilka förändringar som är svårast och vid vilken tid på dagen."),
        tri("Haz un horario visual del día, con los cambios marcados; úsalo siempre, no solo los días difíciles.", "Make a visual schedule of the day with the changes marked; use it always, not only on hard days.", "Gör ett visuellt dagsschema med förändringarna markerade; använd det alltid, inte bara svåra dagar."),
        tri("Acuerda con la persona una forma de pedir «un minuto más» que puedas aceptar.", "Agree with the person on a way to ask for 'one more minute' that you can accept.", "Kom överens med personen om ett sätt att be om 'en minut till' som du kan gå med på."),
        tri("Rellena el registro ABC cuando estés en calma.", "Fill in the ABC log when you are calm.", "Fyll i ABC-loggen när du är lugn."),
      ],
      sayToPerson: [tri("Mañana avisamos antes.", "Tomorrow we warn earlier.", "I morgon förvarnar vi tidigare."), tri("Lo planeamos juntos.", "We plan it together.", "Vi planerar det tillsammans."), tri("Estás bien.", "You're okay.", "Du är okej.")],
    },
  },
  never: [
    tri("Castigar la negativa: no quites lo que le gusta ni amenaces con perder algo.", "Punish the refusal: no taking away what they like, no threats of losing something.", "Straffa vägran: inga indragna favoritsaker, inga hot om att förlora något."),
    tri("Encerrar a la persona en el lugar nuevo o en el viejo «hasta que coopere».", "Lock the person in the new or the old place 'until they cooperate'.", "Stänga in personen på den nya eller den gamla platsen 'tills den samarbetar'."),
    tri("Sujetar, arrastrar o cargar a la fuerza a quien se resiste, salvo peligro inmediato.", "Restrain, drag or carry by force someone who resists, except in immediate danger.", "Hålla fast, släpa eller bära någon som gör motstånd med våld, utom vid omedelbar fara."),
    tri("No apagues la pantalla o quites el objeto de golpe y sin aviso.", "Do not turn off the screen or take the object away suddenly and without warning.", "Stäng inte av skärmen eller ta bort föremålet plötsligt och utan förvarning."),
    tri("No cambies el plan sin decirlo, aunque sea para algo mejor.", "Do not change the plan without saying so, even for something better.", "Ändra inte planen utan att säga det, även om det är till något bättre."),
  ],
  escalate: {
    callWhen: [
      tri("La negativa ocurre en un lugar peligroso (la calle, un estacionamiento, cerca del agua) y no logras moverla a un sitio seguro.", "The refusal happens somewhere dangerous (the street, a car park, near water) and you cannot move them to safety.", "Vägran sker på en farlig plats (gatan, en parkering, nära vatten) och du får inte personen till en säker plats."),
      tri("Pasa a agresión o autolesión con riesgo serio.", "It turns into aggression or self-injury with serious risk.", "Det övergår i aggression eller självskada med allvarlig risk."),
    ],
    contactWhen: [
      tri("El rechazo a cualquier petición es nuevo o repentino: revisión médica, por si hay dolor, sueño o enfermedad.", "Refusing any request is new or sudden: a medical check, in case of pain, sleep problems or illness.", "Vägran mot alla krav är ny eller plötslig: läkarundersökning, i fall det är smärta, sömn eller sjukdom."),
      tri("Las transiciones bloquean la escuela o la salida de casa casi a diario: pide apoyo para un plan de transiciones a terapia ocupacional o a un profesional de apoyo conductual.", "Transitions block school or leaving the house almost daily: ask occupational therapy or a behaviour support professional for help with a transition plan.", "Övergångarna blockerar skolan eller att komma ut nästan dagligen: be arbetsterapeut eller en yrkesperson inom beteendestöd om hjälp med en övergångsplan."),
    ],
  },
  log: {
    kind: "abc",
    antecedent: tri("¿Qué cambio se pedía, con cuánto aviso y de qué actividad venía?", "What change was asked, with how much warning, and from what activity?", "Vilken förändring begärdes, med hur mycket förvarning, och från vilken aktivitet?"),
    behavior: tri("¿Cómo fue la negativa: palabras, suelo, aferrarse, correr? ¿Cuánto duró?", "What did the refusal look like: words, floor, clinging, running? How long did it last?", "Hur såg vägran ut: ord, golv, klamra sig fast, springa? Hur länge?"),
    consequence: tri("¿Qué pasó después? ¿Se pospuso el cambio? ¿Se hizo igual? ¿Qué llegó al otro lado?", "What happened next? Was the change postponed? Done anyway? What came on the other side?", "Vad hände sedan? Sköts förändringen upp? Gjordes den ändå? Vad kom på andra sidan?"),
    hypotheses: [
      { fn: "escape", check: tri("¿Lo que venía después es algo que la persona evita (ruido, gente, una tarea difícil)?", "Is what comes next something the person avoids (noise, people, a hard task)?", "Är det som kommer sedan något personen undviker (ljud, folk, en svår uppgift)?") },
      { fn: "request", check: tri("¿Quería seguir con algo o pedir más tiempo y no tenía cómo decirlo?", "Did they want to continue with something or ask for more time and had no way to say so?", "Ville personen fortsätta med något eller be om mer tid och kunde inte säga det?") },
      { fn: "sensory", check: tri("¿El lugar nuevo o el camino tiene algo que molesta: luz, ruido, olor, ropa?", "Does the new place or the way there have something bothersome: light, noise, smell, clothing?", "Har den nya platsen eller vägen dit något som stör: ljus, ljud, lukt, kläder?") },
      { fn: "pain", check: tri("¿Hay cansancio, hambre, sueño o señales de dolor?", "Is there tiredness, hunger, sleepiness or any sign of pain?", "Finns trötthet, hunger, sömnighet eller tecken på smärta?") },
    ],
    note: tri(
      "Son hipótesis para mirar el patrón, no una explicación ni un diagnóstico. Varias pueden ser ciertas a la vez.",
      "These are hypotheses for looking at the pattern, not an explanation or a diagnosis. Several can be true at once.",
      "Det här är hypoteser för att se mönstret, inte en förklaring eller en diagnos. Flera kan stämma samtidigt."
    ),
  },
  evidence: [
    { id: "GUIDE:nice-ng11", level: "guideline", supports: tri("Entender la función de la conducta y reducir al mínimo las medidas restrictivas.", "Understand the function of the behaviour and keep restrictive measures to a minimum.", "Förstå beteendets funktion och håll begränsande åtgärder till ett minimum.") },
    {
      id: "PMC9914931",
      level: "review",
      supports: tri(
        "Revisión que subraya que un entorno previsible y estable es central para niños y adolescentes autistas, y que romper la rutina tiene consecuencias. Respalda avisar, mostrar y mantener rutinas.",
        "Review stressing that a predictable, stable environment is central for autistic children and adolescents, and that breaking routine has consequences. Backs warning, showing and keeping routines.",
        "Översikt som betonar att en förutsägbar och stabil miljö är central för autistiska barn och ungdomar, och att brutna rutiner får konsekvenser. Stöder att förvarna, visa och hålla rutiner."
      ),
    },
    {
      id: "PMC5632603",
      level: "systematic_review",
      supports: tri(
        "Revisión sistemática sobre el inicio escolar en niños autistas: la preparación y la coordinación entre familia y escuela favorecen una buena transición. Respalda preparar las transiciones grandes.",
        "Systematic review on the start of school for autistic children: preparation and coordination between family and school favour a good transition. Backs preparing the big transitions.",
        "Systematisk översikt om skolstart för autistiska barn: förberedelse och samordning mellan familj och skola gynnar en bra övergång. Stöder att förbereda de stora övergångarna."
      ),
    },
    {
      id: "PMC11972019",
      level: "trial",
      supports: tri(
        "Ensayo aleatorizado de un programa que entrena a las familias para la transición a una escuela nueva. Respalda que preparar a la familia ayuda en las transiciones grandes; no estudia las pequeñas del día.",
        "Randomised trial of a programme coaching families for the transition to a new school. Backs that preparing the family helps with big transitions; it does not study the small daily ones.",
        "Randomiserad studie av ett program som coachar familjer inför övergången till en ny skola. Stöder att förberedelse av familjen hjälper vid stora övergångar; den studerar inte de små dagliga."
      ),
    },
    {
      id: "PMC12864344",
      level: "trial",
      supports: tri(
        "Ensayo aleatorizado: la formación presencial a madres y padres mejoró el cumplimiento de peticiones. Respalda formar a quien cuida.",
        "Randomised trial: face-to-face parent training improved following requests. Backs training whoever cares.",
        "Randomiserad studie: föräldrautbildning på plats förbättrade följsamhet vid uppmaningar. Stöder att utbilda den som vårdar."
      ),
    },
  ],
  evidenceNote: tri(
    "La biblioteca respalda la previsibilidad, la preparación y formar a la familia. No tiene ensayos sobre los apoyos visuales o las transiciones pequeñas del día: esos pasos son práctica.",
    "The library backs predictability, preparation and training the family. It has no trials on visual supports or the small daily transitions: those steps are practice.",
    "Biblioteket stöder förutsägbarhet, förberedelse och att utbilda familjen. Det har inga studier med kontrollgrupp om visuella stöd eller de små dagliga övergångarna: de stegen är praktik."
  ),
};
