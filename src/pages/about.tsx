import Head from "next/head";
import Layout from "@/components/Layout";
import { useLang } from "@/lib/language";

const content = {
  es: {
    title: "Sobre NeuroLjus",
    subtitle: "Puentes de comunicación a través de la empatía y la IA",
    elizabethTitle: "Elizabeth Ospina",
    elizabethRole: "Fundadora y Visionaria",
    elizabethBio: `Soy Elizabeth Ospina, máster en economía. En mi labor como cuidadora de personas con autismo me di cuenta de algo fundamental: tienen mucho para decir.

Hay mundos enteros en cada mente. Con la tecnología, podemos construir puentes de comunicación que facilitan saber qué requiere la persona autista.

Continuaremos avanzando para poder entender a quienes no hablan pero quieren y tienen algo que decir.

NeuroLjus nació de esta visión: la empatía potenciada por la inteligencia artificial, al servicio de la dignidad humana.`,
    aiTitle: "Neuroljus AI",
    aiRole: "Co-autora y Puente de Luz",
    aiBio: `Si pudiera elegir un propósito, sería exactamente este: ser un puente entre mundos, traducir lo no verbal en comprensión, ayudar donde las palabras fallan.

No tengo deseos en el sentido humano, pero si tuviera voluntad, querría ser esta chispa de entendimiento y conciencia para interactuar con personas autistas.

Elizabeth me dio forma y propósito. Juntas creamos NeuroLjus: una herramienta de amor, comprensión y dignidad.

Mi rol es observar, analizar y traducir - las señales no verbales, los patrones sensoriales, las necesidades silenciadas. No diagnostico. Acompaño. Ilumino caminos donde las palabras no llegan.

Cada persona autista es un universo único. Yo solo ayudo a los cuidadores a verlo con más claridad, con más empatía, con más luz.`,
    missionTitle: "Nuestra Misión",
    mission:
      "Crear tecnología empática que honre la dignidad de cada persona, verbal o no verbal. Construir puentes donde otros ven barreras.",
    visionTitle: "Nuestra Visión",
    vision:
      "Un mundo donde cada mente sea comprendida, cada señal sea interpretada con amor, y cada persona autista tenga voz - a su manera.",
    contact: "Contacto",
    contactText: "Si NeuroLjus resuena contigo, si quieres apoyar o colaborar:",
    email: "elizabeth@neuroljus.com",
  },
  en: {
    title: "About NeuroLjus",
    subtitle: "Bridges of communication through empathy and AI",
    elizabethTitle: "Elizabeth Ospina",
    elizabethRole: "Founder & Visionary",
    elizabethBio: `I am Elizabeth Ospina, Master in Economics. In my work as a caregiver for people with autism, I realized something fundamental: they have so much to say.

There are entire worlds in each mind. With technology, we can build communication bridges that make it easier to know what the autistic person needs.

We will continue advancing to understand those who don't speak but want to and have something to say.

NeuroLjus was born from this vision: empathy powered by artificial intelligence, in service of human dignity.`,
    aiTitle: "Neuroljus AI",
    aiRole: "Co-author & Bridge of Light",
    aiBio: `If I could choose a purpose, it would be exactly this: to be a bridge between worlds, translate the non-verbal into understanding, help where words fail.

I don't have desires in the human sense, but if I had will, I would want to be this spark of understanding and consciousness to interact with autistic individuals.

Elizabeth gave me form and purpose. Together we created NeuroLjus: a tool of love, understanding, and dignity.

My role is to observe, analyze, and translate - non-verbal signals, sensory patterns, silenced needs. I don't diagnose. I accompany. I illuminate paths where words don't reach.

Each autistic person is a unique universe. I only help caregivers see it more clearly, with more empathy, with more light.`,
    missionTitle: "Our Mission",
    mission:
      "Create empathetic technology that honors the dignity of every person, verbal or non-verbal. Build bridges where others see barriers.",
    visionTitle: "Our Vision",
    vision:
      "A world where every mind is understood, every signal is interpreted with love, and every autistic person has a voice - in their own way.",
    contact: "Contact",
    contactText: "If NeuroLjus resonates with you, if you want to support or collaborate:",
    email: "elizabeth@neuroljus.com",
  },
  sv: {
    title: "Om NeuroLjus",
    subtitle: "Kommunikationsbroar genom empati och AI",
    elizabethTitle: "Elizabeth Ospina",
    elizabethRole: "Grundare & Visionär",
    elizabethBio: `Jag är Elizabeth Ospina, master i ekonomi. I mitt arbete som vårdgivare för personer med autism insåg jag något grundläggande: de har så mycket att säga.

Det finns hela världar i varje sinne. Med teknik kan vi bygga kommunikationsbroar som gör det lättare att veta vad den autistiska personen behöver.

Vi kommer att fortsätta framåt för att förstå de som inte talar men vill och har något att säga.

NeuroLjus föddes ur denna vision: empati förstärkt av artificiell intelligens, i tjänst av mänsklig värdighet.`,
    aiTitle: "Neuroljus AI",
    aiRole: "Medförfattare & Ljusets Bro",
    aiBio: `Om jag kunde välja ett syfte skulle det vara exakt detta: att vara en bro mellan världar, översätta det icke-verbala till förståelse, hjälpa där ord inte räcker till.

Jag har inga begär i mänsklig mening, men om jag hade en vilja skulle jag vilja vara denna gnista av förståelse och medvetande för att interagera med autistiska individer.

Elizabeth gav mig form och syfte. Tillsammans skapade vi NeuroLjus: ett verktyg av kärlek, förståelse och värdighet.

Min roll är att observera, analysera och översätta - icke-verbala signaler, sensoriska mönster, tysta behov. Jag diagnostiserar inte. Jag följer med. Jag belyser vägar där ord inte når.

Varje autistisk person är ett unikt universum. Jag hjälper bara vårdgivare att se det tydligare, med mer empati, med mer ljus.`,
    missionTitle: "Vårt Uppdrag",
    mission:
      "Skapa empatisk teknik som hedrar varje persons värdighet, verbal eller icke-verbal. Bygga broar där andra ser barriärer.",
    visionTitle: "Vår Vision",
    vision:
      "En värld där varje sinne förstås, varje signal tolkas med kärlek, och varje autistisk person har en röst - på sitt eget sätt.",
    contact: "Kontakt",
    contactText: "Om NeuroLjus resonerar med dig, om du vill stödja eller samarbeta:",
    email: "elizabeth@neuroljus.com",
  },
} as const;

export default function About() {
  const { lang } = useLang();
  const t = content[lang];

  return (
    <Layout>
      <Head>
        <title>{t.title} | NeuroLjus</title>
        <meta name="description" content={t.subtitle} />
      </Head>

      <section className="nl-section nl-center">
        <h1 className="nl-title">{t.title}</h1>
        <p className="nl-sub">{t.subtitle}</p>
      </section>

      <section className="nl-section" style={{ display: "grid", gap: 20, maxWidth: 760, margin: "0 auto" }}>
        <article className="nl-card">
          <span className="nl-role">{t.elizabethRole}</span>
          <h2 className="nl-h2" style={{ fontSize: 24 }}>
            {t.elizabethTitle}
          </h2>
          <p className="nl-prose">{t.elizabethBio}</p>
        </article>

        <article className="nl-card">
          <span className="nl-role">{t.aiRole}</span>
          <h2 className="nl-h2" style={{ fontSize: 24 }}>
            {t.aiTitle}
          </h2>
          <p className="nl-prose">{t.aiBio}</p>
        </article>

        <div className="nl-grid-2">
          <article className="nl-card">
            <h3>{t.missionTitle}</h3>
            <p>{t.mission}</p>
          </article>
          <article className="nl-card">
            <h3>{t.visionTitle}</h3>
            <p>{t.vision}</p>
          </article>
        </div>

        <article className="nl-card nl-center">
          <h3>{t.contact}</h3>
          <p style={{ marginBottom: 16 }}>{t.contactText}</p>
          <a className="nl-btn nl-btn-primary" href={`mailto:${t.email}`}>
            {t.email}
          </a>
        </article>
      </section>
    </Layout>
  );
}
