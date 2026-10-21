/** Trilingual copy for the ficha pages. One object per language, same keys. */

import type { AgeBand, FichaLang, Speech } from "./model";

export type FichaCopy = {
  seoTitle: string;
  kicker: string;
  listTitle: string;
  listSub: string;
  create: string;
  none: string;
  open: string;
  q: { name: string; age: string; speech: string; calms: string; triggers: string; owner: string };
  ages: Record<AgeBand, string>;
  speeches: Record<Speech, string>;
  /** As a sentence fragment: "no habla". */
  speechLine: Record<Speech, string>;
  owners: { carer: string; person: string };
  placeholder: { name: string; list: string; words: string; sign: string; meaning: string; help: string; avoid: string; step: string; whom: string; medication: string; clinician: string };
  save: string;
  cancel: string;
  add: string;
  remove: string;
  today: string;
  verbs: { talk: string; look: string; act: string; note: string };
  verbsSub: { talk: string; look: string; act: string; note: string };
  sections: { words: string; signals: string; helps: string; avoid: string; crisis: string; card: string; data: string };
  wordsHint: string;
  signalsHint: string;
  helpsHint: string;
  counts: { tried: string; helped: string; worsened: string; confirmed: string };
  crisisHint: string;
  optional: string;
  cardTitle: (name: string) => string;
  cardHint: string;
  cardLink: string;
  copyLink: string;
  copied: string;
  openCard: string;
  exportJson: string;
  deleteFicha: string;
  deleteConfirm: string;
  storedHere: string;
  vision: {
    title: string;
    hint: string;
    none: string;
    last: (minutes: number, when: string) => string;
    learning: (n: number, of: number) => string;
    usual: string;
    metrics: Record<"handsMove" | "faceMove" | "handNear" | "blinks", string>;
    more: (metric: string) => string;
    less: (metric: string) => string;
    ordinary: string;
    asSignal: string;
    meaning: string;
    seen: string;
    open: string;
  };
  cardPage: { title: string; sub: string; words: string; signals: string; do: string; dont: string; steps: string; whom: string; medication: string; clinician: string; empty: string; none: string; makeOwn: string };
};

export const FICHA_COPY: Record<FichaLang, FichaCopy> = {
  es: {
    seoTitle: "Ficha — Neuroljus",
    kicker: "La ficha de la persona",
    listTitle: "Lo que se sabe de una persona, en un solo sitio.",
    listSub: "Cinco preguntas y la ficha existe. Después crece con lo que pasa. Se entrega en treinta segundos a quien llega nuevo. Hoy vive solo en este navegador.",
    create: "Crear una ficha",
    none: "Todavía no hay ninguna ficha.",
    open: "Abrir",
    q: {
      name: "¿Cómo se llama, o cómo lo llamamos?",
      age: "¿Qué edad tiene, más o menos?",
      speech: "¿Habla?",
      calms: "¿Qué tres cosas lo calman?",
      triggers: "¿Qué tres cosas lo disparan?",
      owner: "¿Quién crea esta ficha?",
    },
    ages: { child: "Niño o niña", teen: "Adolescente", adult: "Adulto" },
    speeches: { yes: "Sí", some: "Algunas palabras", no: "No" },
    speechLine: { yes: "habla", some: "dice algunas palabras", no: "no habla" },
    owners: { carer: "Alguien que cuida", person: "La propia persona" },
    placeholder: { name: "Un nombre o un apodo", list: "Escribe una y pulsa añadir", words: "Lo que quiero que sepas de mí antes de hablarme.", sign: "Lo que hace (tararea más fuerte)", meaning: "Lo que significa (viene sobrecarga)", help: "Algo que se probó (ruido marrón)", avoid: "Algo que nunca hacer", step: "Un paso corto", whom: "Nombre y teléfono", medication: "Medicación, si quieres ponerla", clinician: "Médico o clínica, si quieres ponerlo" },
    save: "Guardar",
    cancel: "Cancelar",
    add: "Añadir",
    remove: "Quitar",
    today: "hoy",
    verbs: { talk: "Hablar", look: "Mirar", act: "Hacer", note: "Anotar" },
    verbsSub: { talk: "La Línea, a cualquier hora", look: "La cámara que ve señales", act: "Una rutina para ahora", note: "Lo que acaba de pasar" },
    sections: { words: "En sus palabras", signals: "Cómo se comunica", helps: "Qué ayuda y qué empeora", avoid: "Nunca", crisis: "En crisis", card: "Entregar la ficha", data: "Tus datos" },
    wordsHint: "Escrito por la persona, o recogido por quien la conoce. Es lo primero que ve quien recibe la ficha.",
    signalsHint: "Una señal y lo que significa en esta persona. Cada vez que se confirme, súmale uno.",
    helpsHint: "Lo que se ha probado, con cuentas. Las cuentas son la evidencia: lo que más ayudó sube; lo que empeoró pasa a \"nunca\".",
    counts: { tried: "probado", helped: "ayudó", worsened: "empeoró", confirmed: "confirmado" },
    crisisHint: "Tres líneas que alguien lee en treinta segundos, y a quién llamar.",
    optional: "Opcional. Solo si quien cuida quiere ponerlo.",
    cardTitle: (name) => `${name} en 30 segundos`,
    cardHint: "Un enlace de solo lectura para la suplente, la abuela, la profesora nueva. El enlace lleva la tarjeta dentro: quien lo tenga puede leerla, y hoy no caduca. No compartas más de lo que pondrías en un papel.",
    cardLink: "Crear enlace",
    copyLink: "Copiar enlace",
    copied: "Copiado",
    openCard: "Ver la tarjeta",
    exportJson: "Descargar la ficha (JSON)",
    deleteFicha: "Borrar esta ficha",
    deleteConfirm: "¿Borrar la ficha de este navegador? No se puede deshacer.",
    vision: {
      title: "Lo que vio la cámara",
      hint: "Mirar compara cada rato de cámara con lo normal en esta persona: movimiento de manos y de cabeza, manos cerca de la cara, parpadeo. Solo movimiento: nunca emociones ni diagnósticos. Tú decides qué significa.",
      none: "Todavía no hay ningún rato de cámara en este navegador.",
      last: (m, when) => `Último rato: ${m} min, ${when}.`,
      learning: (n, of) => `Aprendiendo lo normal: ${n} de ${of} ratos.`,
      usual: "Nada fuera de lo habitual.",
      metrics: { handsMove: "movimiento de manos", faceMove: "movimiento de cabeza", handNear: "manos cerca de la cara", blinks: "parpadeo" },
      more: (m) => `Más ${m} de lo habitual`,
      less: (m) => `Menos ${m} de lo habitual`,
      ordinary: "Fue un rato normal",
      asSignal: "Anotar como señal",
      meaning: "Qué crees que significó (opcional)",
      seen: "Anotado.",
      open: "Abrir la cámara",
    },
    storedHere: "La ficha vive solo en este navegador. Nada se envía a ningún servidor. Si borras los datos del navegador, se pierde: descárgala si quieres guardarla.",
    cardPage: { title: "en 30 segundos", sub: "Lee esto antes de hablarle o tocarle.", words: "En sus palabras", signals: "Si hace esto, significa", do: "Qué ayuda", dont: "Nunca", steps: "En crisis", whom: "A quién llamar", medication: "Medicación", clinician: "Médico", empty: "Este enlace no lleva ninguna tarjeta.", none: "(sin datos)", makeOwn: "Crear una ficha" },
  },
  en: {
    seoTitle: "Profile — Neuroljus",
    kicker: "The person's profile",
    listTitle: "What is known about one person, in one place.",
    listSub: "Five questions and the profile exists. Then it grows with what happens. Hand it to whoever is new in thirty seconds. Today it lives only in this browser.",
    create: "Create a profile",
    none: "No profiles yet.",
    open: "Open",
    q: {
      name: "What is their name, or what do we call them?",
      age: "Roughly how old are they?",
      speech: "Do they speak?",
      calms: "Which three things calm them?",
      triggers: "Which three things set them off?",
      owner: "Who is creating this profile?",
    },
    ages: { child: "Child", teen: "Teenager", adult: "Adult" },
    speeches: { yes: "Yes", some: "Some words", no: "No" },
    speechLine: { yes: "speaks", some: "says some words", no: "does not speak" },
    owners: { carer: "Someone who cares for them", person: "The person themselves" },
    placeholder: { name: "A name or a nickname", list: "Type one and press add", words: "What I want you to know about me before you talk to me.", sign: "What they do (hums louder)", meaning: "What it means (overload is coming)", help: "Something that was tried (brown noise)", avoid: "Something never to do", step: "One short step", whom: "Name and phone", medication: "Medication, if you want it here", clinician: "Doctor or clinic, if you want it here" },
    save: "Save",
    cancel: "Cancel",
    add: "Add",
    remove: "Remove",
    today: "today",
    verbs: { talk: "Talk", look: "Look", act: "Do", note: "Note" },
    verbsSub: { talk: "The Line, at any hour", look: "The camera that sees signals", act: "A routine for now", note: "What just happened" },
    sections: { words: "In their words", signals: "How they communicate", helps: "What helps and what makes it worse", avoid: "Never", crisis: "In a crisis", card: "Hand over the profile", data: "Your data" },
    wordsHint: "Written by the person, or gathered by whoever knows them. It is the first thing whoever receives the profile sees.",
    signalsHint: "A signal and what it means in this person. Each time it holds, add one.",
    helpsHint: "What was tried, with counts. The counts are the evidence: what helped most rises; what made it worse moves to \"never\".",
    counts: { tried: "tried", helped: "helped", worsened: "worse", confirmed: "confirmed" },
    crisisHint: "Three lines someone reads in thirty seconds, and whom to call.",
    optional: "Optional. Only if the carer wants it here.",
    cardTitle: (name) => `${name} in 30 seconds`,
    cardHint: "A read-only link for the stand-in, the grandmother, the new teacher. The link carries the card inside it: anyone holding it can read it, and today it does not expire. Share no more than you would put on paper.",
    cardLink: "Create link",
    copyLink: "Copy link",
    copied: "Copied",
    openCard: "View the card",
    exportJson: "Download the profile (JSON)",
    deleteFicha: "Delete this profile",
    deleteConfirm: "Delete the profile from this browser? This cannot be undone.",
    vision: {
      title: "What the camera saw",
      hint: "Look compares each stretch of camera time with what is usual for this person: hand and head movement, hands near the face, blinking. Movement only: never emotions or diagnoses. You decide what it means.",
      none: "No camera time in this browser yet.",
      last: (m, when) => `Last stretch: ${m} min, ${when}.`,
      learning: (n, of) => `Learning what is usual: ${n} of ${of} stretches.`,
      usual: "Nothing out of the ordinary.",
      metrics: { handsMove: "hand movement", faceMove: "head movement", handNear: "hands near the face", blinks: "blinking" },
      more: (m) => `More ${m} than usual`,
      less: (m) => `Less ${m} than usual`,
      ordinary: "It was an ordinary stretch",
      asSignal: "Note it as a signal",
      meaning: "What you think it meant (optional)",
      seen: "Noted.",
      open: "Open the camera",
    },
    storedHere: "The profile lives only in this browser. Nothing is sent to any server. If you clear the browser's data it is gone: download it if you want to keep it.",
    cardPage: { title: "in 30 seconds", sub: "Read this before you talk to them or touch them.", words: "In their words", signals: "If they do this, it means", do: "What helps", dont: "Never", steps: "In a crisis", whom: "Whom to call", medication: "Medication", clinician: "Doctor", empty: "This link carries no card.", none: "(no data)", makeOwn: "Create a profile" },
  },
  sv: {
    seoTitle: "Profil — Neuroljus",
    kicker: "Personens profil",
    listTitle: "Det som är känt om en person, på ett ställe.",
    listSub: "Fem frågor och profilen finns. Sedan växer den med det som händer. Lämnas över på trettio sekunder till den som är ny. I dag finns den bara i den här webbläsaren.",
    create: "Skapa en profil",
    none: "Inga profiler ännu.",
    open: "Öppna",
    q: {
      name: "Vad heter personen, eller vad kallar vi hen?",
      age: "Ungefär hur gammal?",
      speech: "Talar personen?",
      calms: "Vilka tre saker lugnar?",
      triggers: "Vilka tre saker utlöser?",
      owner: "Vem skapar profilen?",
    },
    ages: { child: "Barn", teen: "Tonåring", adult: "Vuxen" },
    speeches: { yes: "Ja", some: "Några ord", no: "Nej" },
    speechLine: { yes: "talar", some: "säger några ord", no: "talar inte" },
    owners: { carer: "Någon som vårdar", person: "Personen själv" },
    placeholder: { name: "Ett namn eller smeknamn", list: "Skriv en och tryck lägg till", words: "Det jag vill att du vet om mig innan du pratar med mig.", sign: "Vad hen gör (nynnar högre)", meaning: "Vad det betyder (överbelastning på väg)", help: "Något som prövats (brunt brus)", avoid: "Något att aldrig göra", step: "Ett kort steg", whom: "Namn och telefon", medication: "Medicin, om du vill ha det här", clinician: "Läkare eller mottagning, om du vill ha det här" },
    save: "Spara",
    cancel: "Avbryt",
    add: "Lägg till",
    remove: "Ta bort",
    today: "i dag",
    verbs: { talk: "Prata", look: "Titta", act: "Göra", note: "Anteckna" },
    verbsSub: { talk: "Linjen, när som helst", look: "Kameran som ser signaler", act: "En rutin för nu", note: "Det som just hände" },
    sections: { words: "Med egna ord", signals: "Hur hen kommunicerar", helps: "Vad som hjälper och vad som förvärrar", avoid: "Aldrig", crisis: "I kris", card: "Lämna över profilen", data: "Dina data" },
    wordsHint: "Skrivet av personen, eller samlat av den som känner hen. Det är det första den som får profilen ser.",
    signalsHint: "En signal och vad den betyder hos den här personen. Varje gång det stämmer, lägg till ett.",
    helpsHint: "Det som prövats, med räkning. Räkningen är evidensen: det som hjälpt mest stiger; det som förvärrat flyttas till \"aldrig\".",
    counts: { tried: "prövat", helped: "hjälpte", worsened: "förvärrade", confirmed: "bekräftat" },
    crisisHint: "Tre rader någon läser på trettio sekunder, och vem man ringer.",
    optional: "Valfritt. Bara om den som vårdar vill ha det här.",
    cardTitle: (name) => `${name} på 30 sekunder`,
    cardHint: "En läsbar länk för vikarien, mormor, den nya läraren. Länken bär kortet i sig: den som har länken kan läsa det, och i dag går den inte ut. Dela inte mer än du skulle skriva på ett papper.",
    cardLink: "Skapa länk",
    copyLink: "Kopiera länk",
    copied: "Kopierad",
    openCard: "Visa kortet",
    exportJson: "Ladda ner profilen (JSON)",
    deleteFicha: "Radera profilen",
    deleteConfirm: "Radera profilen från den här webbläsaren? Det går inte att ångra.",
    vision: {
      title: "Det kameran såg",
      hint: "Titta jämför varje stund med kameran med det som är vanligt för den här personen: hand- och huvudrörelser, händer nära ansiktet, blinkningar. Bara rörelse: aldrig känslor eller diagnoser. Du avgör vad det betyder.",
      none: "Ingen tid med kameran i den här webbläsaren ännu.",
      last: (m, when) => `Senaste stunden: ${m} min, ${when}.`,
      learning: (n, of) => `Lär sig det vanliga: ${n} av ${of} stunder.`,
      usual: "Inget utöver det vanliga.",
      metrics: { handsMove: "handrörelser", faceMove: "huvudrörelser", handNear: "händer nära ansiktet", blinks: "blinkningar" },
      more: (m) => `Mer ${m} än vanligt`,
      less: (m) => `Mindre ${m} än vanligt`,
      ordinary: "Det var en vanlig stund",
      asSignal: "Anteckna som signal",
      meaning: "Vad du tror att det betydde (valfritt)",
      seen: "Antecknat.",
      open: "Öppna kameran",
    },
    storedHere: "Profilen finns bara i den här webbläsaren. Inget skickas till någon server. Rensar du webbläsarens data försvinner den: ladda ner den om du vill behålla den.",
    cardPage: { title: "på 30 sekunder", sub: "Läs detta innan du pratar med eller rör personen.", words: "Med egna ord", signals: "Gör hen så här, betyder det", do: "Vad som hjälper", dont: "Aldrig", steps: "I kris", whom: "Vem man ringer", medication: "Medicin", clinician: "Läkare", empty: "Den här länken bär inget kort.", none: "(inga data)", makeOwn: "Skapa en profil" },
  },
};
