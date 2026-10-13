/**
 * Seed findings — about twenty key, peer-reviewed results that ground the
 * library from day one. Each seed is resolved against Europe PMC by title,
 * its DOI is checked in Crossref (exists, not retracted) and it is merged
 * into data/library/docs.json with a hand-written claim and limits.
 *
 *   npx tsx scripts/library/seeds.ts
 *
 * A seed that cannot be resolved or verified is reported and left out:
 * nothing enters the library on memory alone.
 */

import {
  crossrefCheck,
  epmcIsRetracted,
  epmcKind,
  epmcParticipatory,
  epmcSearch,
  isOpenLicense,
  normalizeDoi,
  readDocs,
  sleep,
  stripHtml,
  writeDocs,
  type EpmcResult,
  type LibraryDoc,
  type TopicId,
} from "./lib";

const STOP = new Set(["with", "from", "that", "this", "their", "about", "among", "individuals", "children", "autism", "spectrum", "disorder", "disorders", "autistic", "study", "review"]);

type Seed = {
  /** Title (or distinctive fragment) used to find the record in Europe PMC. */
  title: string;
  year: number;
  topics: TopicId[];
  claim: { es: string; en: string; sv: string };
  supports: { es: string; en: string; sv: string };
  doesNotSupport: { es: string; en: string; sv: string };
};

export const SEEDS: Seed[] = [
  {
    title: "A meta-analysis of sensory modulation symptoms in individuals with autism spectrum disorders",
    year: 2009,
    topics: ["sensory"],
    claim: {
      es: "Las diferencias sensoriales (hiper e hiporreactividad, búsqueda sensorial) son muy frecuentes en autismo y mayores que en otros grupos.",
      en: "Sensory differences (over- and under-responsivity, sensory seeking) are very common in autism and larger than in other groups.",
      sv: "Sensoriska skillnader (över- och underreaktivitet, sensoriskt sökande) är mycket vanliga vid autism och större än i andra grupper.",
    },
    supports: {
      es: "Tomar en serio la carga de sonido, luz y tacto como primer paso del cuidado.",
      en: "Taking sound, light and touch load seriously as a first step in care.",
      sv: "Att ta ljud-, ljus- och beröringsbelastning på allvar som ett första steg i omsorgen.",
    },
    doesNotSupport: {
      es: "Que todas las personas autistas tengan el mismo perfil sensorial; los perfiles son individuales.",
      en: "That every autistic person has the same sensory profile; profiles are individual.",
      sv: "Att alla autistiska personer har samma sensoriska profil; profilerna är individuella.",
    },
  },
  {
    title: "Sensory perception in autism",
    year: 2017,
    topics: ["sensory"],
    claim: {
      es: "La percepción sensorial atípica es un rasgo central del autismo y se relaciona con el bienestar diario, no un detalle secundario.",
      en: "Atypical sensory perception is a core feature of autism tied to daily wellbeing, not a side detail.",
      sv: "Avvikande sensorisk perception är ett centralt drag vid autism kopplat till dagligt välbefinnande, inte en bisak.",
    },
    supports: {
      es: "Adaptar el entorno (ruido, luz, gente) antes de añadir exigencias.",
      en: "Adapting environments (noise, light, crowds) before adding demands.",
      sv: "Att anpassa miljön (ljud, ljus, folkmängd) innan man ställer krav.",
    },
    doesNotSupport: {
      es: "Un único mecanismo o una «cura» de las diferencias sensoriales.",
      en: "A single mechanism or 'cure' for sensory differences.",
      sv: "En enda mekanism eller ett «botemedel» för sensoriska skillnader.",
    },
  },
  {
    title: "The Current View on the Paradox of Pain in Autism Spectrum Disorders",
    year: 2022,
    topics: ["pain_health", "sensory"],
    claim: {
      es: "La vieja idea de 'indiferencia al dolor' en autismo es errónea: el dolor se expresa de forma atípica y a menudo se pasa por alto.",
      en: "The old idea of 'pain indifference' in autism is wrong: pain is expressed atypically and often missed.",
      sv: "Den gamla idén om 'smärtokänslighet' vid autism är fel: smärta uttrycks annorlunda och missas ofta.",
    },
    supports: {
      es: "Tratar un cambio de conducta como posible señal de dolor que merece comprobarse.",
      en: "Treating a change in behaviour as a possible pain signal worth checking.",
      sv: "Att se en beteendeförändring som en möjlig smärtsignal värd att kontrollera.",
    },
    doesNotSupport: {
      es: "Que cuidadores o cámaras puedan medir el dolor; el dolor sigue siendo una hipótesis que se comprueba con sanidad.",
      en: "That caregivers or cameras can measure pain; pain remains a hypothesis to check with healthcare.",
      sv: "Att vårdgivare eller kameror kan mäta smärta; smärta förblir en hypotes att kontrollera med vården.",
    },
  },
  {
    title: "Indifference or hypersensitivity? Solving the riddle of the pain profile in individuals with autism",
    year: 2023,
    topics: ["pain_health"],
    claim: {
      es: "Adultos autistas puntuaron más alto el dolor por calor y mostraron un perfil pronociceptivo: más sensibilidad, no menos.",
      en: "Autistic adults rated heat pain higher and showed a pronociceptive profile: more sensitivity, not less.",
      sv: "Autistiska vuxna skattade värmesmärta högre och visade en pronociceptiv profil: mer känslighet, inte mindre.",
    },
    supports: {
      es: "No dar por hecho que a la persona «no le importa» un procedimiento o una lesión.",
      en: "Not assuming a person 'doesn't mind' a procedure or an injury.",
      sv: "Att inte anta att en person «inte bryr sig» om ett ingrepp eller en skada.",
    },
    doesNotSupport: {
      es: "Una regla universal para todas las personas; el dolor experimental no es el dolor cotidiano.",
      en: "A universal rule for every person; experimental pain differs from daily pain.",
      sv: "En universell regel för alla; experimentell smärta skiljer sig från vardaglig smärta.",
    },
  },
  {
    title: "Effects of augmentative and alternative communication intervention on speech production in children with autism: a systematic review",
    year: 2008,
    topics: ["communication_aac"],
    claim: {
      es: "La comunicación aumentativa y alternativa (pictogramas, dispositivos) no frena el habla; en varios casos la favorece.",
      en: "Augmentative and alternative communication (pictures, devices) does not hold back speech; in several cases it helps it.",
      sv: "Alternativ och kompletterande kommunikation (bilder, hjälpmedel) hindrar inte talet; i flera fall hjälper den.",
    },
    supports: {
      es: "Ofrecer CAA pronto y sin esperar al habla.",
      en: "Offering AAC early and without waiting for speech.",
      sv: "Att erbjuda AKK tidigt och utan att vänta på tal.",
    },
    doesNotSupport: {
      es: "Que la CAA por sí sola produzca habla, o que un solo sistema sirva para todos.",
      en: "That AAC alone produces speech, or that one system suits everyone.",
      sv: "Att AKK i sig ger tal, eller att ett system passar alla.",
    },
  },
  {
    title: "A meta-analysis of single case research studies on aided augmentative and alternative communication systems with individuals with autism spectrum disorders",
    year: 2012,
    topics: ["communication_aac"],
    claim: {
      es: "Los sistemas de CAA con apoyos (PECS, dispositivos de voz) tienen efectos positivos en comunicación para personas autistas.",
      en: "Aided AAC systems (PECS, speech-generating devices) have positive effects on communication for autistic people.",
      sv: "Hjälpmedelsbaserad AKK (PECS, talhjälpmedel) har positiva effekter på kommunikation för autistiska personer.",
    },
    supports: {
      es: "Dar a una persona no hablante una forma fiable de pedir, rechazar y comentar.",
      en: "Giving a non-speaking person a reliable way to request, refuse and comment.",
      sv: "Att ge en icke-talande person ett pålitligt sätt att be om, avböja och kommentera.",
    },
    doesNotSupport: {
      es: "Que la comunicación solo cuente cuando es habla.",
      en: "That communication only counts when it is speech.",
      sv: "Att kommunikation bara räknas när den är tal.",
    },
  },
  {
    title: "People should be allowed to do what they like: Autistic adults' views and experiences of stimming",
    year: 2019,
    topics: ["crisis_regulation", "sensory"],
    claim: {
      es: "Adultos autistas describen el stimming (movimientos repetitivos) como una forma de regularse ante sobrecarga; suprimirlo hace daño.",
      en: "Autistic adults describe stimming (repetitive movement) as a way to self-regulate under overload; suppressing it is harmful.",
      sv: "Autistiska vuxna beskriver stimming (repetitiva rörelser) som ett sätt att reglera sig vid överbelastning; att stoppa det skadar.",
    },
    supports: {
      es: "Dejar espacio a la autorregulación en vez de «manos quietas».",
      en: "Leaving room for self-regulation instead of 'quiet hands'.",
      sv: "Att ge utrymme för självreglering i stället för «stilla händer».",
    },
    doesNotSupport: {
      es: "Ignorar movimientos que lesionan a la persona; la seguridad sigue siendo lo primero.",
      en: "Ignoring movement that injures the person; safety still comes first.",
      sv: "Att ignorera rörelser som skadar personen; säkerheten kommer fortfarande först.",
    },
  },
  {
    title: "The 'double empathy problem': Ten years on",
    year: 2022,
    topics: ["communication_aac", "family_caregivers"],
    claim: {
      es: "La dificultad de entenderse es mutua: las personas no autistas también fallan al leer a las autistas. No es un déficit de un solo lado.",
      en: "Misunderstanding runs both ways: non-autistic people also struggle to read autistic people. It is not a one-sided deficit.",
      sv: "Missförstånd går åt båda hållen: icke-autistiska personer har också svårt att läsa autistiska. Det är inte en ensidig brist.",
    },
    supports: {
      es: "Que los cuidadores adapten su propia comunicación, no solo la de la persona.",
      en: "Caregivers adapting their own communication, not only the person's.",
      sv: "Att vårdgivare anpassar sin egen kommunikation, inte bara personens.",
    },
    doesNotSupport: {
      es: "Que el apoyo a la comunicación sea innecesario.",
      en: "That communication support is unnecessary.",
      sv: "Att kommunikationsstöd är onödigt.",
    },
  },
  {
    title: "Autistic peer-to-peer information transfer is highly effective",
    year: 2020,
    topics: ["communication_aac", "adult_life"],
    claim: {
      es: "Entre personas autistas la información fluye tan bien como entre no autistas; se pierde en los grupos mixtos.",
      en: "Information flows between autistic people as well as between non-autistic people; it breaks down in mixed groups.",
      sv: "Information flödar lika bra mellan autistiska personer som mellan icke-autistiska; den bryts i blandade grupper.",
    },
    supports: {
      es: "Valorar a iguales autistas y autodefensores como un recurso.",
      en: "Valuing autistic peers and self-advocates as a resource.",
      sv: "Att värdera autistiska jämlikar och självförespråkare som en resurs.",
    },
    doesNotSupport: {
      es: "Que las personas autistas carezcan de capacidad social.",
      en: "That autistic people lack social ability.",
      sv: "Att autistiska personer saknar social förmåga.",
    },
  },
  {
    title: "Making the future together: Shaping autism research through meaningful participation",
    year: 2019,
    topics: ["adult_life", "family_caregivers"],
    claim: {
      es: "La investigación en autismo es más útil y respetuosa cuando las personas autistas participan en diseñarla.",
      en: "Autism research is more useful and respectful when autistic people take part in designing it.",
      sv: "Autismforskning blir mer användbar och respektfull när autistiska personer deltar i utformningen.",
    },
    supports: {
      es: "Construir herramientas con personas autistas, no solo para ellas.",
      en: "Building tools with autistic people, not only for them.",
      sv: "Att bygga verktyg tillsammans med autistiska personer, inte bara för dem.",
    },
    doesNotSupport: {
      es: "Ninguna intervención concreta; trata de cómo se construye el conocimiento.",
      en: "Any specific intervention; this is about how knowledge is made.",
      sv: "Ingen specifik insats; det handlar om hur kunskap skapas.",
    },
  },
  {
    title: "Avoiding Ableist Language: Suggestions for Autism Researchers",
    year: 2021,
    topics: ["family_caregivers", "adult_life"],
    claim: {
      es: "El lenguaje que usamos sobre el autismo importa: términos como 'conducta desafiante' o 'bajo funcionamiento' estigmatizan.",
      en: "The words we use about autism matter: terms like 'challenging behaviour' or 'low functioning' stigmatise.",
      sv: "Orden vi använder om autism spelar roll: uttryck som 'utmanande beteende' eller 'lågfungerande' stigmatiserar.",
    },
    supports: {
      es: "Describir qué pasó y qué ayudó, sin etiquetar a la persona.",
      en: "Describing what happened and what helped, not labelling the person.",
      sv: "Att beskriva vad som hände och vad som hjälpte, inte att etikettera personen.",
    },
    doesNotSupport: {
      es: "Que todos deban usar las mismas palabras; las preferencias varían y hay que preguntarlas.",
      en: "That everyone must use identical words; preferences vary and should be asked.",
      sv: "Att alla måste använda samma ord; preferenser varierar och bör efterfrågas.",
    },
  },
  {
    title: "Anxiety disorders in children and adolescents with autistic spectrum disorders: a meta-analysis",
    year: 2011,
    topics: ["anxiety"],
    claim: {
      es: "Cerca del 40 % de niños y adolescentes autistas tienen al menos un trastorno de ansiedad; la ansiedad es común, no rara.",
      en: "About 40% of autistic children and adolescents have at least one anxiety disorder; anxiety is common, not rare.",
      sv: "Omkring 40 % av autistiska barn och ungdomar har minst ett ångestsyndrom; ångest är vanligt, inte ovanligt.",
    },
    supports: {
      es: "Leer la agitación o el rechazo como posible ansiedad y reducir la incertidumbre.",
      en: "Reading agitation or refusal as possible anxiety and reducing uncertainty.",
      sv: "Att tolka oro eller vägran som möjlig ångest och minska osäkerheten.",
    },
    doesNotSupport: {
      es: "Diagnosticar ansiedad en casa; eso es cosa de profesionales clínicos.",
      en: "Diagnosing anxiety at home; that is for clinicians.",
      sv: "Att diagnostisera ångest hemma; det är klinikers sak.",
    },
  },
  {
    title: "Feeding problems and nutrient intake in children with autism spectrum disorders: a meta-analysis and comprehensive review",
    year: 2013,
    topics: ["feeding"],
    claim: {
      es: "Los niños autistas tienen muchas más dificultades de alimentación (selectividad, rechazo) que otros niños.",
      en: "Autistic children have far more feeding difficulties (selectivity, refusal) than other children.",
      sv: "Autistiska barn har betydligt fler svårigheter med mat (selektivitet, vägran) än andra barn.",
    },
    supports: {
      es: "Bajar la presión en las comidas y respetar los límites sensoriales con la comida.",
      en: "Lowering pressure at meals and respecting sensory limits around food.",
      sv: "Att sänka pressen vid måltider och respektera sensoriska gränser kring mat.",
    },
    doesNotSupport: {
      es: "Forzar alimentos; las dudas de nutrición van a un profesional.",
      en: "Forcing foods; nutrition concerns go to a clinician.",
      sv: "Att tvinga i mat; näringsfrågor går till en kliniker.",
    },
  },
  {
    title: "The impact of parenting stress: a meta-analysis of studies comparing the experience of parenting stress in parents of children with and without autism spectrum disorder",
    year: 2013,
    topics: ["family_caregivers"],
    claim: {
      es: "Los padres y madres de niños autistas presentan niveles de estrés claramente más altos que otros padres; el apoyo al cuidador es parte del cuidado.",
      en: "Parents of autistic children show clearly higher stress than other parents; caregiver support is part of care.",
      sv: "Föräldrar till autistiska barn visar tydligt högre stress än andra föräldrar; stöd till vårdgivaren är en del av omsorgen.",
    },
    supports: {
      es: "Planificar descanso y apoyo para quien cuida, no solo rutinas para la persona.",
      en: "Planning rest and support for the caregiver, not only routines for the person.",
      sv: "Att planera vila och stöd för vårdgivaren, inte bara rutiner för personen.",
    },
    doesNotSupport: {
      es: "Culpar al niño o la niña del estrés familiar.",
      en: "Blaming the child for family stress.",
      sv: "Att skylla familjens stress på barnet.",
    },
  },
  {
    title: "What is the male-to-female ratio in autism spectrum disorder? A systematic review and meta-analysis",
    year: 2017,
    topics: ["women_girls"],
    claim: {
      es: "La proporción real hombre:mujer en autismo es cercana a 3:1, no 4:1: muchas niñas y mujeres quedan sin identificar.",
      en: "The true male-to-female ratio in autism is closer to 3:1, not 4:1: many girls and women go unidentified.",
      sv: "Den verkliga könsfördelningen vid autism är närmare 3:1, inte 4:1: många flickor och kvinnor förblir oidentifierade.",
    },
    supports: {
      es: "Tomar en serio las necesidades de una niña o mujer aunque no tenga una presentación «típica».",
      en: "Taking a girl's or woman's needs seriously even without a 'typical' presentation.",
      sv: "Att ta en flickas eller kvinnas behov på allvar även utan en «typisk» bild.",
    },
    doesNotSupport: {
      es: "Ningún diagnóstico; la identificación es clínica.",
      en: "Any diagnosis; identification is clinical.",
      sv: "Ingen diagnos; identifiering är klinisk.",
    },
  },
  {
    title: "Putting on My Best Normal: Social Camouflaging in Adults with Autism Spectrum Conditions",
    year: 2017,
    topics: ["women_girls", "anxiety"],
    claim: {
      es: "Muchos adultos autistas, y en especial mujeres, camuflan sus rasgos para encajar; lo describen como agotador y con coste para la salud mental.",
      en: "Many autistic adults, especially women, camouflage their traits to fit in; they describe it as exhausting and costly for mental health.",
      sv: "Många autistiska vuxna, särskilt kvinnor, kamouflerar sina drag för att passa in; de beskriver det som utmattande och kostsamt för den psykiska hälsan.",
    },
    supports: {
      es: "Permitir descanso y tiempo «sin máscara» en casa y en la escuela.",
      en: "Allowing rest and 'unmasked' time at home and school.",
      sv: "Att tillåta vila och tid «utan mask» hemma och i skolan.",
    },
    doesNotSupport: {
      es: "Que el camuflaje sea solo un fenómeno femenino.",
      en: "That camouflaging is only a female phenomenon.",
      sv: "Att kamouflering bara är ett kvinnligt fenomen.",
    },
  },
  {
    title: "Having All of Your Internal Resources Exhausted Beyond Measure and Being Left with No Clean-Up Crew",
    year: 2020,
    topics: ["crisis_regulation", "adult_life"],
    claim: {
      es: "El 'burnout autista' —agotamiento profundo, pérdida de habilidades, menos tolerancia a estímulos— lo describen adultos autistas como resultado de exigencias sostenidas sin apoyo.",
      en: "'Autistic burnout' — deep exhaustion, loss of skills, less tolerance to stimuli — is described by autistic adults as the result of sustained demands without support.",
      sv: "'Autistisk utmattning' — djup trötthet, förlust av färdigheter, mindre tolerans för stimuli — beskrivs av autistiska vuxna som följden av ihållande krav utan stöd.",
    },
    supports: {
      es: "Reducir exigencias y carga sensorial cuando baja la capacidad, en vez de forzar.",
      en: "Reducing demands and sensory load when capacity drops, instead of pushing through.",
      sv: "Att minska krav och sensorisk belastning när kapaciteten sjunker, i stället för att pressa på.",
    },
    doesNotSupport: {
      es: "Un diagnóstico clínico; es una definición desde la experiencia vivida.",
      en: "A clinical diagnosis; this is a lived-experience definition.",
      sv: "En klinisk diagnos; det här är en definition utifrån levd erfarenhet.",
    },
  },
  {
    title: "Sleep problems in autism spectrum disorders: prevalence, nature, & possible biopsychosocial aetiologies",
    year: 2009,
    topics: ["sleep"],
    claim: {
      es: "Los problemas de sueño afectan a una gran parte de los niños autistas (a menudo 40-80 %) y agravan el día siguiente.",
      en: "Sleep problems affect a large share of autistic children (often 40-80%) and make the next day harder.",
      sv: "Sömnproblem drabbar en stor andel autistiska barn (ofta 40-80 %) och gör nästa dag svårare.",
    },
    supports: {
      es: "Una rutina de noche predecible y de baja estimulación como primera medida.",
      en: "A predictable, low-stimulus evening routine as a first measure.",
      sv: "En förutsägbar kvällsrutin med låg stimulans som första åtgärd.",
    },
    doesNotSupport: {
      es: "Decisiones sobre medicación; la melatonina y otros tratamientos son cosa de profesionales.",
      en: "Medication decisions; melatonin and other treatments are for clinicians.",
      sv: "Beslut om medicinering; melatonin och andra behandlingar är klinikers sak.",
    },
  },
  {
    title: "Evidence-Based Practices for Children, Youth, and Young Adults with Autism Spectrum Disorder: A Comprehensive Review",
    year: 2015,
    topics: ["transitions", "school"],
    claim: {
      es: "Una revisión de 29 000 artículos identificó 27 prácticas con evidencia, entre ellas apoyos visuales, modelado en vídeo, historias sociales y enseñanza de comunicación aumentativa.",
      en: "A review of 29,000 articles identified 27 evidence-based practices, including visual supports, video modelling, social narratives and augmentative communication instruction.",
      sv: "En genomgång av 29 000 artiklar identifierade 27 evidensbaserade metoder, bland dem visuellt stöd, videomodellering, sociala berättelser och undervisning i alternativ kommunikation.",
    },
    supports: {
      es: "Preparar transiciones (dentista, escuela, salidas) con imágenes, vídeo o una historia corta de lo que va a pasar.",
      en: "Preparing transitions (dentist, school, outings) with pictures, video or a short story of what will happen.",
      sv: "Att förbereda övergångar (tandläkare, skola, utflykter) med bilder, video eller en kort berättelse om vad som ska hända.",
    },
    doesNotSupport: {
      es: "Que una práctica funcione para todos o sustituya escuchar a la persona en el momento.",
      en: "That a practice works for everyone or replaces listening to the person in the moment.",
      sv: "Att en metod fungerar för alla eller ersätter att lyssna på personen i stunden.",
    },
  },
  {
    title: "Evaluating visual activity schedules as evidence-based practice for individuals with autism spectrum disorders",
    year: 2015,
    topics: ["transitions", "school"],
    claim: {
      es: "Los horarios visuales (secuencias de imágenes de lo que viene) son una práctica con evidencia para transiciones y autonomía.",
      en: "Visual activity schedules (picture sequences of what comes next) are an evidence-based practice for transitions and independence.",
      sv: "Visuella scheman (bildsekvenser av vad som kommer) är en evidensbaserad metod för övergångar och självständighet.",
    },
    supports: {
      es: "La tarjeta visual de cada rutina de Companion.",
      en: "The visual card in every Companion routine.",
      sv: "Bildkortet i varje Companion-rutin.",
    },
    doesNotSupport: {
      es: "Que los horarios eliminen la necesidad de escuchar el «no» de la persona.",
      en: "That schedules remove the need to listen to the person's refusal.",
      sv: "Att scheman tar bort behovet av att lyssna på personens nej.",
    },
  },
  {
    title: "Sensory adapted dental environments to enhance oral care for children with autism spectrum disorders",
    year: 2015,
    topics: ["pain_health", "sensory"],
    claim: {
      es: "Un entorno dental adaptado (luz baja, menos ruido, presión profunda) redujo el estrés y el malestar de niños autistas durante la limpieza.",
      en: "A sensory-adapted dental environment (dim light, less noise, deep pressure) reduced stress and discomfort for autistic children during cleaning.",
      sv: "En sensoriskt anpassad tandvårdsmiljö (dämpat ljus, mindre ljud, djupt tryck) minskade stress och obehag hos autistiska barn vid rengöring.",
    },
    supports: {
      es: "Pedir a la clínica menos luz y sonido y una secuencia predecible.",
      en: "Asking a clinic for lower light and sound and a predictable sequence.",
      sv: "Att be kliniken om mindre ljus och ljud och en förutsägbar ordning.",
    },
    doesNotSupport: {
      es: "Que la adaptación elimine la necesidad de consentimiento y pausas.",
      en: "That adaptation removes the need for consent and pauses.",
      sv: "Att anpassning tar bort behovet av samtycke och pauser.",
    },
  },
  {
    title: "Comparison of healthcare experiences in autistic and non-autistic adults: a cross-sectional online survey",
    year: 2013,
    topics: ["pain_health", "adult_life"],
    claim: {
      es: "Adultos autistas informan peor comunicación con profesionales sanitarios y más necesidades no atendidas que adultos no autistas.",
      en: "Autistic adults report worse communication with healthcare providers and more unmet needs than non-autistic adults.",
      sv: "Autistiska vuxna rapporterar sämre kommunikation med vårdpersonal och fler ouppfyllda behov än icke-autistiska vuxna.",
    },
    supports: {
      es: "Llevar a las citas un resumen escrito y las preferencias de comunicación de la persona.",
      en: "Bringing a written summary and the person's communication preferences to appointments.",
      sv: "Att ta med en skriftlig sammanfattning och personens kommunikationspreferenser till besök.",
    },
    doesNotSupport: {
      es: "Que haya que evitar la sanidad; significa que debe hacerse accesible.",
      en: "That healthcare should be avoided; it means it must be made accessible.",
      sv: "Att vården ska undvikas; det betyder att den måste göras tillgänglig.",
    },
  },
  {
    title: "Employment and post-secondary educational activities for young adults with autism spectrum disorders during the transition to adulthood",
    year: 2012,
    topics: ["adult_life"],
    claim: {
      es: "Tras la escuela, una gran parte de jóvenes autistas queda sin empleo ni formación, sobre todo quienes necesitan más apoyo: la transición a la vida adulta exige planificación.",
      en: "After school, a large share of autistic young adults have no job or training, especially those needing more support: the transition to adulthood needs planning.",
      sv: "Efter skolan saknar en stor andel autistiska unga vuxna arbete eller utbildning, särskilt de med större stödbehov: övergången till vuxenlivet kräver planering.",
    },
    supports: {
      es: "Empezar a planificar la transición años antes de que acabe la escuela.",
      en: "Starting transition planning years before school ends.",
      sv: "Att börja planera övergången flera år innan skolan tar slut.",
    },
    doesNotSupport: {
      es: "Que los resultados estén fijados; los apoyos los cambian.",
      en: "That outcomes are fixed; supports change them.",
      sv: "Att utfallen är givna; stöd förändrar dem.",
    },
  },
];

function similarity(a: string, b: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2);
  const A = new Set(norm(a));
  const B = new Set(norm(b));
  let hit = 0;
  for (const w of A) if (B.has(w)) hit += 1;
  return hit / Math.max(1, A.size);
}

async function main() {
  const docs = readDocs();
  const byDoi = new Map(docs.map((d) => [d.doi, d]));
  let ok = 0;
  for (const seed of SEEDS) {
    // Exact phrase first; then the distinctive words of the title. A match needs
    // ≥ 70 % of the seed's words in the record title and the right year (±1).
    const words = seed.title.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w));
    const queries = [`TITLE:"${seed.title.replace(/"/g, "")}"`, `TITLE:(${words.slice(0, 8).join(" AND ")})`];
    let best: { r: EpmcResult; sim: number } | undefined;
    for (const q of queries) {
      const results = await epmcSearch(q, { max: 10 });
      await sleep(300);
      best = results
        .map((r) => ({ r, sim: similarity(seed.title, r.title ?? "") }))
        .filter((x) => x.sim >= 0.7 && normalizeDoi(x.r.doi) && Math.abs((Number(x.r.pubYear) || 0) - seed.year) <= 1)
        .sort((a, b) => b.sim - a.sim || (Number(b.r.citedByCount) || 0) - (Number(a.r.citedByCount) || 0))[0];
      if (best) break;
    }
    if (!best) {
      console.log(`✗ not found: ${seed.title}`);
      continue;
    }
    const r = best.r;
    const doi = normalizeDoi(r.doi)!;
    if (epmcIsRetracted(r)) {
      console.log(`✗ retracted (Europe PMC): ${seed.title}`);
      continue;
    }
    const check = await crossrefCheck(doi);
    await sleep(150);
    if (!check.exists || check.retracted) {
      console.log(`✗ Crossref ${check.exists ? "retracted" : "missing"}: ${seed.title}`);
      continue;
    }
    const prev = byDoi.get(doi);
    const openText = isOpenLicense(r.license);
    const pmcid = r.pmcid ?? null;
    const pmid = r.pmid ?? null;
    const doc: LibraryDoc = {
      id: pmcid ?? (pmid ? `MED${pmid}` : `DOI:${doi}`),
      pmid,
      pmcid,
      doi,
      title: stripHtml(r.title ?? ""),
      authors: (r.authorString ?? "").replace(/\.$/, "").slice(0, 200),
      journal: r.journalTitle ?? r.journalInfo?.journal?.title ?? "",
      year: Number(r.pubYear) || seed.year,
      kind: epmcKind(r),
      participatory: epmcParticipatory(r),
      license: (r.license ?? "").trim() || "unknown",
      openText,
      citedBy: r.citedByCount ?? 0,
      topics: [...new Set([...(prev?.topics ?? []), ...seed.topics])].sort() as TopicId[],
      url: pmcid ? `https://europepmc.org/article/PMC/${pmcid}` : pmid ? `https://europepmc.org/article/MED/${pmid}` : `https://doi.org/${doi}`,
      abstract: openText && r.abstractText ? stripHtml(r.abstractText) : prev?.abstract ?? null,
      sheet: prev?.sheet ?? null,
      seed: { claim: seed.claim, supports: seed.supports, doesNotSupport: seed.doesNotSupport },
      verified: { crossref: true, retracted: false, checkedAt: new Date().toISOString().slice(0, 10) },
    };
    byDoi.set(doi, doc);
    ok += 1;
    console.log(`✓ ${doi} · ${doc.year} · ${doc.license || "no licence"} · ${doc.title.slice(0, 70)}`);
  }
  writeDocs([...byDoi.values()]);
  console.log(`\n${ok}/${SEEDS.length} seeds verified and merged.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
