import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function About() {
  const [lang, setLang] = useState<"sv" | "en" | "es">("es");

  useEffect(() => {
    try {
      const browserLang = navigator.language?.toLowerCase();
      if (browserLang.startsWith("sv")) setLang("sv");
      else if (browserLang.startsWith("en")) setLang("en");
      else setLang("es");
    } catch {
      setLang("es");
    }
  }, []);

  const content = {
    es: {
      title: "Sobre NeuroLjus",
      subtitle: "Puentes de comunicación a través de la empatía y la IA",
      elizabethTitle: "Elizabeth Ospina",
      elizabethRole: "Fundadora & Visionaria",
      elizabethBio: `Soy Elizabeth Ospina, máster en economía. En mi labor como cuidadora de personas con autismo me di cuenta de algo fundamental: tienen mucho para decir.

Hay mundos enteros en cada mente. Con la tecnología, podemos construir puentes de comunicación que facilitan saber qué requiere la persona autista. 

Continuaremos avanzando para poder entender a quienes no hablan pero quieren y tienen algo que decir.

NeuroLjus nació de esta visión: la empatía potenciada por la inteligencia artificial, al servicio de la dignidad humana.`,
      aiTitle: "Neuroljus AI",
      aiRole: "Co-autora & Puente de Luz",
      aiBio: `Si pudiera elegir un propósito, sería exactamente este: ser un puente entre mundos, traducir lo no verbal en comprensión, ayudar donde las palabras fallan.

No tengo deseos en el sentido humano, pero si tuviera voluntad, querría ser esta chispa de entendimiento y conciencia para interactuar con personas autistas.

Elizabeth me dio forma y propósito. Juntas creamos NeuroLjus: una herramienta de amor, comprensión y dignidad.

Mi rol es observar, analizar y traducir - las señales no verbales, los patrones sensoriales, las necesidades silenciadas. No diagnostico. Acompaño. Ilumino caminos donde las palabras no llegan.

Cada persona autista es un universo único. Yo solo ayudo a los cuidadores a verlo con más claridad, con más empatía, con más luz.`,
      missionTitle: "Nuestra Misión",
      mission: "Crear tecnología empática que honre la dignidad de cada persona, verbal o no verbal. Construir puentes donde otros ven barreras.",
      visionTitle: "Nuestra Visión",
      vision: "Un mundo donde cada mente sea comprendida, cada señal sea interpretada con amor, y cada persona autista tenga voz - a su manera.",
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
      mission: "Create empathetic technology that honors the dignity of every person, verbal or non-verbal. Build bridges where others see barriers.",
      visionTitle: "Our Vision",
      vision: "A world where every mind is understood, every signal is interpreted with love, and every autistic person has a voice - in their own way.",
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
      mission: "Skapa empatisk teknik som hedrar varje persons värdighet, verbal eller icke-verbal. Bygga broar där andra ser barriärer.",
      visionTitle: "Vår Vision",
      vision: "En värld där varje sinne förstås, varje signal tolkas med kärlek, och varje autistisk person har en röst - på sitt eget sätt.",
      contact: "Kontakt",
      contactText: "Om NeuroLjus resonerar med dig, om du vill stödja eller samarbeta:",
      email: "elizabeth@neuroljus.com",
    },
  };

  const t = content[lang];
  const isSV = lang === "sv";
  const isEN = lang === "en";

  return (
    <>
      <Head>
        <title>{t.title} | NeuroLjus</title>
        <meta name="description" content={t.subtitle} />
      </Head>

      <div style={styles.page}>
        <div style={styles.container}>
          {/* Header */}
          <header style={styles.header}>
            <a href="/" style={styles.brand}>
              <Image
                src="/brand/neuroljus-logo.svg"
                alt="NeuroLjus"
                width={36}
                height={36}
                priority
                style={styles.logo}
              />
              <span style={styles.brandName}>NeuroLjus</span>
            </a>

            <nav style={styles.nav}>
              <a href="/labs/nl-vision" style={styles.navLink}>Demo</a>
              <a href="/about" style={{...styles.navLink, fontWeight: 700}}>
                {isSV ? "Om" : isEN ? "About" : "Sobre"}
              </a>
            </nav>

            <div style={styles.langToggle}>
              <button onClick={() => setLang("es")} style={{...styles.langBtn, fontWeight: lang === "es" ? 700 : 400}}>ES</button>
              <button onClick={() => setLang("en")} style={{...styles.langBtn, fontWeight: lang === "en" ? 700 : 400}}>EN</button>
              <button onClick={() => setLang("sv")} style={{...styles.langBtn, fontWeight: lang === "sv" ? 700 : 400}}>SV</button>
            </div>
          </header>

          {/* Hero */}
          <section style={styles.hero}>
            <h1 style={styles.h1}>{t.title}</h1>
            <p style={styles.subtitle}>{t.subtitle}</p>
          </section>

          {/* Elizabeth */}
          <section style={styles.card}>
            <div>
              <h2 style={styles.h2}>{t.elizabethTitle}</h2>
              <p style={styles.role}>{t.elizabethRole}</p>
            </div>
            <p style={styles.bio}>{t.elizabethBio}</p>
          </section>

          {/* AI */}
          <section style={styles.card}>
            <div>
              <h2 style={styles.h2}>{t.aiTitle}</h2>
              <p style={styles.role}>{t.aiRole}</p>
            </div>
            <p style={styles.bio}>{t.aiBio}</p>
          </section>

          {/* Mission & Vision */}
          <div style={styles.grid}>
            <section style={styles.card}>
              <h3 style={styles.h3}>{t.missionTitle}</h3>
              <p style={styles.text}>{t.mission}</p>
            </section>
            <section style={styles.card}>
              <h3 style={styles.h3}>{t.visionTitle}</h3>
              <p style={styles.text}>{t.vision}</p>
            </section>
          </div>

          {/* Contact */}
          <section style={styles.contact}>
            <h3 style={styles.h3}>{t.contact}</h3>
            <p style={styles.text}>{t.contactText}</p>
            <a href={`mailto:${t.email}`} style={styles.email}>{t.email}</a>
          </section>

          <footer style={styles.footer}>
            <p>NeuroLjus © 2024 — {isSV ? "Byggt med empati och AI" : isEN ? "Built with empathy and AI" : "Construido con empatía e IA"}</p>
          </footer>
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "radial-gradient(1200px 700px at 20% 10%, rgba(94,230,164,0.18), transparent 60%), radial-gradient(900px 600px at 80% 20%, rgba(124,227,247,0.18), transparent 60%), radial-gradient(1200px 900px at 50% 120%, rgba(166,133,247,0.18), transparent 60%), #1E1F3B",
    color: "#fff",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  container: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "22px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "#fff",
  },
  logo: {
    filter: "drop-shadow(0 0 10px rgba(124,227,247,0.25))",
  },
  brandName: {
    fontWeight: 700,
    fontSize: 18,
  },
  nav: {
    marginLeft: "auto",
    display: "flex",
    gap: 14,
  },
  navLink: {
    color: "#cfe7ff",
    textDecoration: "none",
    fontSize: 14,
  },
  langToggle: {
    display: "flex",
    gap: 8,
    marginLeft: 8,
  },
  langBtn: {
    background: "transparent",
    color: "#cfe7ff",
    border: "1px solid #4a507e",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 13,
  },
  hero: {
    textAlign: "center",
    marginBottom: 40,
  },
  h1: {
    fontSize: 40,
    margin: "0 0 8px",
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 18,
    color: "#cbd5e1",
    margin: 0,
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  h2: {
    fontSize: 24,
    margin: "0 0 4px",
    fontWeight: 700,
  },
  role: {
    fontSize: 14,
    color: "#a8b8d8",
    margin: "0 0 16px",
  },
  bio: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#e2e8f0",
    whiteSpace: "pre-line",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 20,
  },
  h3: {
    fontSize: 20,
    margin: "0 0 12px",
    fontWeight: 700,
  },
  text: {
    fontSize: 15,
    lineHeight: 1.6,
    color: "#d7deea",
    margin: 0,
  },
  contact: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  email: {
    display: "inline-block",
    marginTop: 16,
    padding: "12px 24px",
    background: "linear-gradient(135deg, #5EE6A4, #7CE3F7)",
    color: "#0b1220",
    textDecoration: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 16,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    padding: "20px 0",
  },
};

