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
  supports: string;
  doesNotSupport: string;
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
    supports: "Taking sound, light and touch load seriously as a first step in care.",
    doesNotSupport: "That every autistic person has the same sensory profile; profiles are individual.",
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
    supports: "Adapting environments (noise, light, crowds) before adding demands.",
    doesNotSupport: "A single mechanism or 'cure' for sensory differences.",
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
    supports: "Treating a change in behaviour as a possible pain signal worth checking.",
    doesNotSupport: "That caregivers or cameras can measure pain; pain remains a hypothesis to check with healthcare.",
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
    supports: "Not assuming a person 'doesn't mind' a procedure or an injury.",
    doesNotSupport: "A universal rule for every person; experimental pain differs from daily pain.",
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
    supports: "Offering AAC early and without waiting for speech.",
    doesNotSupport: "That AAC alone produces speech, or that one system suits everyone.",
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
    supports: "Giving a non-speaking person a reliable way to request, refuse and comment.",
    doesNotSupport: "That communication only counts when it is speech.",
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
    supports: "Leaving room for self-regulation instead of 'quiet hands'.",
    doesNotSupport: "Ignoring movement that injures the person; safety still comes first.",
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
    supports: "Caregivers adapting their own communication, not only the person's.",
    doesNotSupport: "That communication support is unnecessary.",
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
    supports: "Valuing autistic peers and self-advocates as a resource.",
    doesNotSupport: "That autistic people lack social ability.",
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
    supports: "Building tools with autistic people, not only for them.",
    doesNotSupport: "Any specific intervention; this is about how knowledge is made.",
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
    supports: "Describing what happened and what helped, not labelling the person.",
    doesNotSupport: "That everyone must use identical words; preferences vary and should be asked.",
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
    supports: "Reading agitation or refusal as possible anxiety and reducing uncertainty.",
    doesNotSupport: "Diagnosing anxiety at home; that is for clinicians.",
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
    supports: "Lowering pressure at meals and respecting sensory limits around food.",
    doesNotSupport: "Forcing foods; nutrition concerns go to a clinician.",
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
    supports: "Planning rest and support for the caregiver, not only routines for the person.",
    doesNotSupport: "Blaming the child for family stress.",
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
    supports: "Taking a girl's or woman's needs seriously even without a 'typical' presentation.",
    doesNotSupport: "Any diagnosis; identification is clinical.",
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
    supports: "Allowing rest and 'unmasked' time at home and school.",
    doesNotSupport: "That camouflaging is only a female phenomenon.",
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
    supports: "Reducing demands and sensory load when capacity drops, instead of pushing through.",
    doesNotSupport: "A clinical diagnosis; this is a lived-experience definition.",
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
    supports: "A predictable, low-stimulus evening routine as a first measure.",
    doesNotSupport: "Medication decisions; melatonin and other treatments are for clinicians.",
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
    supports: "Preparing transitions (dentist, school, outings) with pictures, video or a short story of what will happen.",
    doesNotSupport: "That a practice works for everyone or replaces listening to the person in the moment.",
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
    supports: "The visual card in every Companion routine.",
    doesNotSupport: "That schedules remove the need to listen to the person's refusal.",
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
    supports: "Asking a clinic for lower light and sound and a predictable sequence.",
    doesNotSupport: "That adaptation removes the need for consent and pauses.",
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
    supports: "Bringing a written summary and the person's communication preferences to appointments.",
    doesNotSupport: "That healthcare should be avoided; it means it must be made accessible.",
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
    supports: "Starting transition planning years before school ends.",
    doesNotSupport: "That outcomes are fixed; supports change them.",
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
