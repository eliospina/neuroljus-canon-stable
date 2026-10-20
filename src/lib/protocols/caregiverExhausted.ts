/**
 * Protocol 10 — The caregiver is exhausted. The person in crisis here is the
 * one who cares; the phases follow their own limit.
 */

import { tri, type CrisisProtocol } from "./types";

export const caregiverExhausted: CrisisProtocol = {
  id: "caregiver_exhausted",
  number: 10,
  title: tri("Cuidador agotado", "Exhausted caregiver", "Utmattad vårdare"),
  recognize: [
    tri(
      "¿Duermes poco, lloras o te enojas con facilidad, no recuerdas la última pausa real y sientes que no puedes más?",
      "Are you sleeping little, crying or getting angry easily, unable to remember your last real break, and feeling you cannot go on?",
      "Sover du lite, gråter eller blir arg lätt, minns inte din senaste riktiga paus och känner att du inte orkar mer?"
    ),
    tri("¿Has pensado en hacer daño a la persona, a ti o en desaparecer?", "Have you thought about hurting the person, yourself, or disappearing?", "Har du tänkt på att skada personen, dig själv eller på att försvinna?"),
  ],
  safetyFirst: false,
  phases: {
    agitation: {
      goal: tri("Reconocer el límite antes de llegar a él.", "Recognise the limit before reaching it.", "Känn igen gränsen innan du når den."),
      steps: [
        tri("Nombra lo que sientes, aunque sea solo para ti: «estoy al límite». Nombrarlo ya baja un poco.", "Name what you feel, even just to yourself: 'I am at my limit'. Naming it already lowers it a little.", "Sätt ord på vad du känner, om så bara för dig själv: 'jag är vid min gräns'. Att sätta ord sänker det redan lite."),
        tri("Baja hoy las exigencias: menos planes, comida sencilla, lo imprescindible.", "Lower today's demands: fewer plans, simple food, only the essentials.", "Sänk dagens krav: färre planer, enkel mat, bara det nödvändiga."),
        tri("Avisa a alguien: un mensaje a una persona de confianza diciendo cómo estás.", "Tell someone: a message to a trusted person saying how you are.", "Säg till någon: ett meddelande till en person du litar på om hur du mår."),
        tri("Haz la pausa más pequeña posible ahora: agua, cinco respiraciones lentas, salir a la puerta.", "Take the smallest possible break now: water, a few slow breaths, stepping to the door.", "Ta minsta möjliga paus nu: vatten, några långsamma andetag, gå till dörren."),
      ],
      say: [tri("Estoy al límite.", "I'm at my limit.", "Jag är vid min gräns."), tri("Hoy hago lo mínimo.", "Today I do the minimum.", "I dag gör jag det minsta."), tri("Necesito una pausa.", "I need a break.", "Jag behöver en paus.")],
    },
    peak: {
      goal: tri("Que nadie salga herido, tampoco tú.", "No one gets hurt, you included.", "Ingen skadas, inte du heller."),
      steps: [
        tri("Si sientes que vas a perder el control o a hacer daño, aléjate unos pasos o sal de la habitación dejando a la persona en un lugar seguro.", "If you feel you are about to lose control or do harm, step back a few paces or leave the room, leaving the person somewhere safe.", "Om du känner att du håller på att tappa kontrollen eller göra skada: ta några steg bakåt eller lämna rummet och lämna personen på en säker plats."),
        tri("Llama a alguien ahora: familia, vecino, amistad, línea de apoyo. Pide que venga o que te escuche.", "Call someone now: family, a neighbour, a friend, a support line. Ask them to come or to listen.", "Ring någon nu: familj, granne, vän, stödlinje. Be dem komma eller lyssna."),
        tri("Haz solo lo que mantenga a la persona segura; todo lo demás puede esperar.", "Do only what keeps the person safe; everything else can wait.", "Gör bara det som håller personen säker; allt annat kan vänta."),
        tri("Si has pensado en hacer daño o en no seguir, busca ayuda profesional hoy o llama al número de emergencias de tu país.", "If you have thought about doing harm or not going on, seek professional help today or call your country's emergency number.", "Om du har tänkt på att göra skada eller att inte orka vidare: sök professionell hjälp i dag eller ring ditt lands nödnummer."),
      ],
      say: [tri("Me aparto un momento.", "I'm stepping away a moment.", "Jag går undan en stund."), tri("Necesito ayuda ahora.", "I need help now.", "Jag behöver hjälp nu."), tri("Esto es demasiado.", "This is too much.", "Det här är för mycket.")],
    },
    descent: {
      goal: tri("Recuperar el aliento sin culpa.", "Catch your breath without guilt.", "Hämta andan utan skuld."),
      steps: [
        tri("Come algo, bebe agua, siéntate. El cuerpo primero.", "Eat something, drink water, sit down. Body first.", "Ät något, drick vatten, sätt dig. Kroppen först."),
        tri("No te juzgues por lo que sentiste: el agotamiento no es falta de amor.", "Do not judge yourself for what you felt: exhaustion is not a lack of love.", "Döm inte dig själv för det du kände: utmattning är inte brist på kärlek."),
        tri("Si alguien vino, deja que haga algo concreto: la cena, un paseo, una hora de relevo.", "If someone came, let them do something concrete: dinner, a walk, an hour of relief.", "Om någon kom, låt den göra något konkret: maten, en promenad, en timmes avlösning."),
      ],
      say: [tri("Ya pasó lo peor.", "The worst is over.", "Det värsta är över."), tri("Hice lo que pude.", "I did what I could.", "Jag gjorde vad jag kunde."), tri("Ahora descanso.", "Now I rest.", "Nu vilar jag.")],
    },
    recovery: {
      goal: tri("Construir relevo y apoyo que duren.", "Build relief and support that last.", "Bygg avlösning och stöd som håller."),
      steps: [
        tri("Pide ayuda formal: descanso o relevo (respiro familiar), apoyo psicológico, grupos de familias. Es parte del cuidado, no un lujo.", "Ask for formal help: respite or relief care, psychological support, family groups. It is part of the care, not a luxury.", "Be om formell hjälp: avlösning eller korttidsvistelse, psykologiskt stöd, föräldragrupper. Det är en del av omsorgen, inte en lyx."),
        tri("Reparte tareas y escríbelo: quién hace qué y cuándo descansas tú. Una pausa fija a la semana, aunque sea corta.", "Share out tasks and write it down: who does what and when you rest. One fixed break a week, even a short one.", "Dela upp uppgifter och skriv ner det: vem gör vad och när du vilar. En fast paus i veckan, om än kort."),
        tri("Cuida tu sueño como cuidas el de la persona.", "Look after your sleep as you look after the person's.", "Ta hand om din sömn som du tar hand om personens."),
        tri("Rellena el registro ABC de tus propios límites: qué los dispara y qué los alivia.", "Fill in the ABC log of your own limits: what triggers them and what eases them.", "Fyll i ABC-loggen över dina egna gränser: vad som utlöser dem och vad som lindrar."),
      ],
      say: [tri("Pido ayuda.", "I'm asking for help.", "Jag ber om hjälp."), tri("Esta semana descanso.", "This week I rest.", "Den här veckan vilar jag."), tri("No estoy sola en esto.", "I'm not alone in this.", "Jag är inte ensam.")],
    },
  },
  never: [
    tri("Castigarte por sentir rabia, culpa o ganas de huir: son señales de carga, no de fracaso.", "Punish yourself for feeling anger, guilt or the urge to run: they are signs of load, not failure.", "Straffa dig själv för att du känner ilska, skuld eller vill fly: det är tecken på belastning, inte misslyckande."),
    tri("Encerrarte: aislarte de amistades, familia y servicios «porque nadie entiende».", "Lock yourself away: isolating from friends, family and services 'because no one understands'.", "Stänga in dig själv: isolera dig från vänner, familj och stöd 'för att ingen förstår'."),
    tri("Sujetar, zarandear o actuar físicamente con la persona cuando estás al límite: apártate primero.", "Restrain, shake or act physically with the person when you are at your limit: step away first.", "Hålla fast, skaka eller agera fysiskt mot personen när du är vid din gräns: gå undan först."),
    tri("No esperes a «estar peor» para pedir ayuda.", "Do not wait to 'be worse' before asking for help.", "Vänta inte på att 'bli sämre' innan du ber om hjälp."),
  ],
  escalate: {
    callWhen: [
      tri("Has pensado en hacer daño a la persona o a ti, y sientes que podrías hacerlo.", "You have thought about hurting the person or yourself, and feel you might do it.", "Du har tänkt på att skada personen eller dig själv, och känner att du skulle kunna göra det."),
      tri("No puedes garantizar la seguridad de la persona ahora y no hay nadie más.", "You cannot guarantee the person's safety right now and there is no one else.", "Du kan inte garantera personens säkerhet just nu och det finns ingen annan."),
    ],
    contactWhen: [
      tri("Duermes mal desde hace semanas, lloras a menudo o has perdido el interés por todo: habla con tu médico o con salud mental esta semana.", "You have slept badly for weeks, cry often or have lost interest in everything: talk to your doctor or mental health service this week.", "Du har sovit dåligt i veckor, gråter ofta eller har tappat intresset för allt: prata med din läkare eller psykiatrin den här veckan."),
      tri("No tienes ningún relevo: pide a servicios sociales o a tu asociación información sobre respiro y apoyo a familias.", "You have no relief at all: ask social services or your association about respite and family support.", "Du har ingen avlösning alls: fråga socialtjänsten eller din förening om avlösning och familjestöd."),
    ],
  },
  abc: {
    antecedent: tri("¿Qué pasó antes de llegar al límite: noches sin dormir, varias crisis seguidas, soledad, una mala noticia?", "What happened before you reached the limit: sleepless nights, several crises in a row, loneliness, bad news?", "Vad hände innan du nådde gränsen: sömnlösa nätter, flera kriser i rad, ensamhet, dåliga nyheter?"),
    behavior: tri("¿Qué hiciste o sentiste: gritar, llorar, quedarte en blanco, querer irte?", "What did you do or feel: raise your voice, cry, go blank, want to leave?", "Vad gjorde eller kände du: höja rösten, gråta, bli tom, vilja gå?"),
    consequence: tri("¿Qué pasó después? ¿Alguien te relevó? ¿Dormiste? ¿Qué ayudó de verdad?", "What happened next? Did someone relieve you? Did you sleep? What really helped?", "Vad hände sedan? Avlöste någon dig? Sov du? Vad hjälpte på riktigt?"),
    hypotheses: [
      { fn: "escape", check: tri("¿Necesitabas salir de la situación y no había forma? ¿Qué relevo faltó?", "Did you need to get out of the situation and there was no way? What relief was missing?", "Behövde du komma ur situationen och det fanns ingen väg? Vilken avlösning saknades?") },
      { fn: "request", check: tri("¿Necesitabas ayuda y no sabías a quién o cómo pedirla?", "Did you need help and not know whom or how to ask?", "Behövde du hjälp och visste inte vem eller hur du skulle fråga?") },
      { fn: "sensory", check: tri("¿Llevabas horas de ruido, gritos o contacto sin pausa?", "Had you had hours of noise, screaming or contact without a break?", "Hade du haft timmar av ljud, skrik eller kontakt utan paus?") },
      { fn: "pain", check: tri("¿Tu cuerpo pedía algo: dormir, comer, moverte, un dolor tuyo sin atender?", "Was your body asking for something: sleep, food, movement, a pain of your own left unattended?", "Bad din kropp om något: sömn, mat, rörelse, en egen smärta som inte tagits om hand?") },
    ],
    note: tri(
      "Son hipótesis para mirar tu patrón, no un diagnóstico ni un juicio. El agotamiento de quien cuida es frecuente y tiene remedio con apoyo.",
      "These are hypotheses for looking at your pattern, not a diagnosis or a judgement. Caregiver exhaustion is common and has a remedy with support.",
      "Det här är hypoteser för att se ditt mönster, inte en diagnos eller en dom. Utmattning hos den som vårdar är vanlig och går att avhjälpa med stöd."
    ),
  },
  evidence: [
    {
      id: "MED22790429",
      level: "meta_analysis",
      supports: tri(
        "Metaanálisis: madres y padres de niños autistas presentan niveles de estrés claramente más altos que otros padres. Respalda tratar el apoyo al cuidador como parte del cuidado.",
        "Meta-analysis: parents of autistic children show clearly higher stress than other parents. Backs treating caregiver support as part of the care.",
        "Metaanalys: föräldrar till autistiska barn visar tydligt högre stress än andra föräldrar. Stöder att se stöd till vårdaren som en del av omsorgen."
      ),
    },
    {
      id: "PMC12245922",
      level: "meta_analysis",
      supports: tri(
        "Revisión sistemática con metaanálisis de ensayos sobre intervenciones basadas en mindfulness para niños autistas y sus padres. Respalda que practicar la atención plena puede ayudar al cuidador.",
        "Systematic review and meta-analysis of trials on mindfulness-based interventions for autistic children and their parents. Backs that mindfulness practice can help the caregiver.",
        "Systematisk översikt med metaanalys av studier om mindfulnessbaserade insatser för autistiska barn och deras föräldrar. Stöder att mindfulness kan hjälpa vårdaren."
      ),
    },
    {
      id: "PMC12900424",
      level: "meta_analysis",
      supports: tri(
        "Revisión sistemática con metaanálisis sobre el respiro familiar y la calidad de vida de cuidadores de niños autistas. Respalda pedir relevo formal.",
        "Systematic review and meta-analysis on respite care and the quality of life of caregivers of autistic children. Backs asking for formal relief.",
        "Systematisk översikt med metaanalys om avlösning och livskvalitet hos vårdare till autistiska barn. Stöder att be om formell avlösning."
      ),
    },
    {
      id: "PMC7243332",
      level: "systematic_review",
      supports: tri(
        "Revisión sistemática de las experiencias de padres al buscar respiro: el acceso es difícil y a veces llegan a urgencias en crisis. Respalda pedir relevo antes de llegar al límite.",
        "Systematic review of parents' experiences seeking respite: access is hard and some end up in emergency services in crisis. Backs asking for relief before reaching the limit.",
        "Systematisk översikt av föräldrars erfarenheter av att söka avlösning: tillgången är svår och vissa hamnar på akuten i kris. Stöder att be om avlösning innan gränsen nås."
      ),
    },
    {
      id: "PMC12784228",
      level: "trial",
      supports: tri(
        "Ensayo aleatorizado de un programa para padres basado en terapia de aceptación y compromiso, con medida del estrés parental. Respalda que el apoyo psicológico estructurado para el cuidador puede estudiarse y ofrecerse.",
        "Randomised trial of a parenting programme based on acceptance and commitment therapy, measuring parental stress. Backs that structured psychological support for the caregiver can be studied and offered.",
        "Randomiserad studie av ett föräldraprogram baserat på acceptans- och åtagandeterapi, med mätning av föräldrastress. Stöder att strukturerat psykologiskt stöd till vårdaren kan studeras och erbjudas."
      ),
    },
    {
      id: "PMC9306249",
      level: "trial",
      supports: tri(
        "Diseño de un ensayo de apoyo posdiagnóstico centrado en la salud mental del cuidador. Respalda que la salud mental de quien cuida es un objetivo de atención por sí mismo; sin resultados en el resumen.",
        "Design of a trial of post-diagnostic support focused on caregiver mental health. Backs that the carer's mental health is a care goal in itself; no results in the abstract.",
        "Upplägg för en studie av stöd efter diagnos med fokus på vårdarens psykiska hälsa. Stöder att vårdarens psykiska hälsa är ett eget mål för omsorgen; inga resultat i sammanfattningen."
      ),
    },
  ],
  evidenceNote: tri(
    "La biblioteca respalda bien lo central: el estrés de quien cuida es alto, y el respiro y el apoyo psicológico ayudan. Los pasos del momento límite son práctica; la línea de emergencia se incluye porque el agotamiento puede volverse peligroso.",
    "The library backs the core well: caregiver stress is high, and respite and psychological support help. The steps at the breaking point are practice; the emergency line is included because exhaustion can become dangerous.",
    "Biblioteket stöder kärnan väl: stressen hos den som vårdar är hög, och avlösning och psykologiskt stöd hjälper. Stegen vid gränsen är praktik; nödlinjen finns med eftersom utmattning kan bli farlig."
  ),
};
