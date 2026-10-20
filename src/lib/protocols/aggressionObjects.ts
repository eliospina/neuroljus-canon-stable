/**
 * Protocol 2 — Aggression toward objects (throwing, breaking, slamming, tearing).
 */

import { tri, type CrisisProtocol } from "./types";

export const aggressionObjects: CrisisProtocol = {
  id: "aggression_objects",
  number: 2,
  title: tri("Agresión contra objetos", "Aggression toward objects", "Aggression mot föremål"),
  recognize: [
    tri(
      "¿La persona tira, rompe, golpea o patea cosas: muebles, puertas, pantallas, platos?",
      "Is the person throwing, breaking, hitting or kicking things: furniture, doors, screens, plates?",
      "Kastar, slår sönder, slår eller sparkar personen på saker: möbler, dörrar, skärmar, tallrikar?"
    ),
    tri("¿Lo que rompe o tira puede herir a alguien?", "Could what they break or throw hurt someone?", "Kan det som går sönder eller kastas skada någon?"),
  ],
  safetyFirst: false,
  phases: {
    agitation: {
      goal: tri("Bajar la tensión antes del pico.", "Bring the tension down before it peaks.", "Sänk spänningen innan toppen."),
      steps: [
        tri("Retira las peticiones y las explicaciones.", "Drop the requests and the explanations.", "Ta bort krav och förklaringar."),
        tri("Pon fuera de alcance lo que pesa, corta o se rompe en pedazos filosos.", "Put out of reach what is heavy, cuts or breaks into sharp pieces.", "Ställ undan det som är tungt, skär eller går sönder i vassa bitar."),
        tri("Ofrece algo que sí se pueda golpear o tirar: un cojín, una pelota blanda, una caja de cartón.", "Offer something that can be hit or thrown: a cushion, a soft ball, a cardboard box.", "Erbjud något som får slås på eller kastas: en kudde, en mjuk boll, en kartong."),
        tri("Baja el ruido y la luz. Menos gente en la habitación.", "Lower noise and light. Fewer people in the room.", "Sänk ljud och ljus. Färre personer i rummet."),
      ],
      say: [tri("Esto sí se puede tirar.", "This one you can throw.", "Den här får du kasta."), tri("Estoy aquí.", "I'm here.", "Jag är här."), tri("Sin prisa.", "No rush.", "Ingen brådska.")],
    },
    peak: {
      goal: tri("Que los objetos no hieran a nadie.", "No one gets hurt by the objects.", "Ingen skadas av föremålen."),
      steps: [
        tri("Apártate tú y aparta a las demás personas de la trayectoria.", "Move yourself and others out of the path.", "Flytta dig själv och andra ur vägen."),
        tri("Deja que rompa lo que no hiere: una cosa rota se repone, una persona no.", "Let them break what does not hurt: a broken thing can be replaced, a person cannot.", "Låt personen ha sönder det som inte skadar: en trasig sak kan ersättas, en människa inte."),
        tri("Retira lo peligroso solo si puedes hacerlo sin forcejear.", "Remove what is dangerous only if you can do it without a struggle.", "Ta bort det farliga bara om du kan göra det utan kamp."),
        tri("No des órdenes ni razones. Voz baja, pocas palabras.", "No orders, no reasons. Low voice, few words.", "Inga order, inga argument. Låg röst, få ord."),
      ],
      say: [tri("Me aparto.", "I'm stepping back.", "Jag backar."), tri("Estás a salvo.", "You're safe.", "Du är trygg."), tri("Espero aquí.", "I'll wait here.", "Jag väntar här.")],
    },
    descent: {
      goal: tri("Dejar que el cuerpo se calme.", "Let the body settle.", "Låt kroppen landa."),
      steps: [
        tri("No recojas ni limpies todavía: el movimiento puede reactivar.", "Do not pick up or clean yet: movement can set it off again.", "Plocka inte upp eller städa ännu: rörelse kan trigga igen."),
        tri("Espera en silencio a distancia. Ofrece agua.", "Wait quietly at a distance. Offer water.", "Vänta tyst på avstånd. Erbjud vatten."),
        tri("Acércate cuando los hombros bajen y la respiración sea más lenta.", "Come closer when the shoulders drop and breathing slows.", "Kom närmare när axlarna sjunker och andningen blir långsammare."),
      ],
      say: [tri("Ya está.", "It's done.", "Det är klart."), tri("Respira.", "Breathe.", "Andas."), tri("Aquí estoy.", "I'm here.", "Jag är här.")],
    },
    recovery: {
      goal: tri("Reparar sin culpa y entender el patrón.", "Repair without blame and understand the pattern.", "Återställ utan skuld och förstå mönstret."),
      steps: [
        tri("Recoge cuando esté en calma; si quiere ayudar, deja que ayude sin exigirlo.", "Tidy up when calm; if they want to help, let them, without demanding it.", "Städa när det är lugnt; om personen vill hjälpa, låt den, utan att kräva det."),
        tri("No le pidas que pida perdón ni hables de lo roto ahora.", "Do not ask them to say sorry or talk about what broke now.", "Be inte personen säga förlåt och prata inte om det trasiga nu."),
        tri("Piensa qué objetos pueden vivir en otro sitio y qué se puede ofrecer para tirar o golpear sin peligro.", "Think about which objects could live elsewhere and what could be offered to throw or hit safely.", "Fundera på vilka föremål som kan stå någon annanstans och vad som kan erbjudas att kasta eller slå på utan fara."),
        tri("Rellena el registro ABC más tarde.", "Fill in the ABC log later.", "Fyll i ABC-loggen senare."),
      ],
      say: [tri("Ya pasó.", "It's over.", "Det är över."), tri("Lo arreglamos juntos.", "We'll fix it together.", "Vi fixar det tillsammans."), tri("Estás bien.", "You're okay.", "Du är okej.")],
    },
  },
  never: [
    tri("Castigar: no grites, no quites lo que le gusta, no cobres lo roto con amenazas.", "Punish: no shouting, no taking away what they like, no making them pay for what broke with threats.", "Straffa: inget skrik, inga indragna favoritsaker, inga hot för det som gick sönder."),
    tri("Encerrar a la persona en una habitación para que rompa allí.", "Lock the person in a room so they break things there.", "Stänga in personen i ett rum så att den har sönder saker där."),
    tri("Sujetar los brazos o inmovilizar para salvar un objeto: ningún objeto vale una lesión.", "Restrain the arms or pin the person to save an object: no object is worth an injury.", "Hålla fast armarna eller personen för att rädda ett föremål: inget föremål är värt en skada."),
    tri("No le arranques el objeto de las manos en el pico.", "Do not snatch the object from their hands at the peak.", "Ryck inte föremålet ur händerna på toppen."),
  ],
  escalate: {
    callWhen: [
      tri("Hay vidrio roto o un objeto pesado y alguien está herido o no puede apartarse.", "There is broken glass or a heavy object and someone is hurt or cannot get away.", "Det finns krossat glas eller ett tungt föremål och någon är skadad eller kan inte komma undan."),
      tri("Hay un corte profundo, un golpe en la cabeza o pérdida de conciencia.", "There is a deep cut, a blow to the head or loss of consciousness.", "Det finns ett djupt sår, ett slag mot huvudet eller medvetslöshet."),
    ],
    contactWhen: [
      tri("Romper cosas es nuevo o aparece con señales de dolor o enfermedad: habla con un médico.", "Breaking things is new or comes with signs of pain or illness: talk to a doctor.", "Att ha sönder saker är nytt eller kommer med tecken på smärta eller sjukdom: prata med en läkare."),
      tri("Se repite varias veces por semana: pide una evaluación funcional a un profesional de apoyo conductual.", "It happens several times a week: ask a behaviour support professional for a functional assessment.", "Det händer flera gånger i veckan: be en yrkesperson inom beteendestöd om en funktionell bedömning."),
    ],
  },
  abc: {
    antecedent: tri("¿Qué pasó justo antes? (una petición, un no, un cambio, ruido, una espera)", "What happened right before? (a request, a no, a change, noise, waiting)", "Vad hände precis innan? (ett krav, ett nej, en förändring, ljud, väntan)"),
    behavior: tri("¿Qué tiró o rompió, hacia dónde y cuánto duró?", "What did they throw or break, in which direction, and how long did it last?", "Vad kastade eller hade personen sönder, i vilken riktning, och hur länge?"),
    consequence: tri("¿Qué pasó después? ¿Se retiró la petición? ¿Hubo atención, ayuda, silencio?", "What happened next? Was the request dropped? Was there attention, help, silence?", "Vad hände sedan? Drogs kravet tillbaka? Blev det uppmärksamhet, hjälp, tystnad?"),
    hypotheses: [
      { fn: "escape", check: tri("¿La tarea o la situación terminó después?", "Did the task or situation end afterwards?", "Tog uppgiften eller situationen slut efteråt?") },
      { fn: "request", check: tri("¿Quería algo que no podía pedir con palabras o signos?", "Did they want something they could not ask for with words or signs?", "Ville personen något som den inte kunde be om med ord eller tecken?") },
      { fn: "sensory", check: tri("¿Le atrae el ruido o la sensación de romper? ¿Pasa con objetos concretos?", "Do the noise or the feel of breaking attract them? Does it happen with specific objects?", "Lockar ljudet eller känslan av att ha sönder? Händer det med vissa föremål?") },
      { fn: "pain", check: tri("¿Hay señales de dolor, cansancio o enfermedad esos días?", "Any signs of pain, tiredness or illness those days?", "Finns tecken på smärta, trötthet eller sjukdom de dagarna?") },
    ],
    note: tri(
      "Son hipótesis para mirar el patrón, no una explicación ni un diagnóstico. Varias pueden ser ciertas a la vez.",
      "These are hypotheses for looking at the pattern, not an explanation or a diagnosis. Several can be true at once.",
      "Det här är hypoteser för att se mönstret, inte en förklaring eller en diagnos. Flera kan stämma samtidigt."
    ),
  },
  evidence: [
    { id: "GUIDE:nice-ng11", level: "guideline", supports: tri("Entender la función antes de actuar y reducir al mínimo las medidas restrictivas.", "Understand the function before acting and keep restrictive measures to a minimum.", "Förstå funktionen innan man agerar och hålla begränsande åtgärder till ett minimum.") },
    {
      id: "PMC10920481",
      level: "meta_analysis",
      supports: tri(
        "Revisión sistemática con metaanálisis sobre prácticas de crianza y conductas externalizantes en niños autistas. Respalda que la forma de responder de la familia se relaciona con estas conductas; no indica qué hacer en el momento.",
        "Systematic review and meta-analysis on parenting practices and externalising behaviours in autistic children. Backs that how the family responds relates to these behaviours; it does not say what to do in the moment.",
        "Systematisk översikt med metaanalys om föräldrapraktiker och utagerande beteenden hos autistiska barn. Stöder att familjens sätt att svara hänger ihop med beteendena; den säger inte vad man ska göra i stunden."
      ),
    },
    {
      id: "PMC9889513",
      level: "trial",
      supports: tri(
        "Ensayo aleatorizado de terapia de interacción padres-hijo para conductas disruptivas en niños autistas sin discapacidad intelectual. Respalda formar a la familia.",
        "Randomised trial of parent-child interaction therapy for disruptive behaviours in autistic children without intellectual disability. Backs training the family.",
        "Randomiserad studie av föräldra-barn-interaktionsterapi för utagerande beteenden hos autistiska barn utan intellektuell funktionsnedsättning. Stöder att utbilda familjen."
      ),
    },
    {
      id: "PMC13337588",
      level: "trial",
      supports: tri(
        "Resultados secundarios de un ensayo: el entrenamiento presencial a madres y padres mejoró el cumplimiento y la irritabilidad frente a la lista de espera.",
        "Secondary outcomes of a trial: face-to-face parent training improved compliance and irritability compared with a waitlist.",
        "Sekundära utfall från en studie: föräldrautbildning på plats förbättrade följsamhet och irritabilitet jämfört med väntelista."
      ),
    },
    {
      id: "PMC12864344",
      level: "trial",
      supports: tri(
        "Ensayo aleatorizado en salud mental habitual: la formación presencial a madres y padres mejoró el cumplimiento y la irritabilidad, y la mejora se mantuvo.",
        "Randomised trial in routine mental health care: face-to-face parent training improved compliance and irritability, and the gains lasted.",
        "Randomiserad studie i ordinarie psykiatrisk vård: föräldrautbildning på plats förbättrade följsamhet och irritabilitet, och förbättringen höll i sig."
      ),
    },
  ],
  evidenceNote: tri(
    "La biblioteca respalda formar a la familia y entender la función. No estudia qué hacer mientras la persona rompe algo: esos pasos son práctica.",
    "The library backs training the family and understanding the function. It does not study what to do while the person is breaking something: those steps are practice.",
    "Biblioteket stöder att utbilda familjen och förstå funktionen. Det studerar inte vad man gör medan personen har sönder något: de stegen är praktik."
  ),
};
