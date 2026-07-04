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
      subtitle: "Cuidado, sistemas e IA para un futuro más humano",
      elizabethTitle: "Elizabeth Ospina",
      elizabethRole: "Fundadora, economista & cuidadora",
      elizabethBio: `Soy Elizabeth Ospina, economista. Mi camino profesional está ligado a la economía, a los sistemas de bienestar y a la pregunta de cómo se distribuyen realmente el acceso, el cuidado y las oportunidades.

Mi experiencia como cuidadora me ha dado conocimiento de primera mano sobre las problemáticas que viven las personas con autismo y los retos silenciosos de quienes las acompañan. También he tenido el privilegio de acompañar a decenas de familias en procesos en Suecia, escuchando sus preguntas, sus trámites, sus miedos y su fuerza.

Ahí entendí que una innovación útil no empieza en la tecnología. Empieza en una observación honesta: qué está pasando, en qué contexto, qué necesita la persona, qué no sabemos todavía y cómo puede una familia sostener mejor el cuidado.

La información que aporto no es solo input. Es experiencia situada: rutinas, barreras, intuiciones, pequeños cambios y patrones que aparecen cuando alguien acompaña con paciencia.

NeuroLjus nace de esa intersección: economía, cuidado, inteligencia artificial y dignidad humana. Su propósito es ayudar a mirar mejor, documentar mejor y construir, con evidencia, herramientas futuras para el beneficio de las personas autistas y sus familias.`,
      aiTitle: "Neuroljus AI",
      aiRole: "Co-autora & Puente de Luz",
      aiBio: `Si pudiera elegir un propósito, sería exactamente este: ser un apoyo entre mundos, ayudar a organizar observaciones cuando las palabras no alcanzan.

No tengo deseos en el sentido humano, pero si tuviera voluntad, querría ser esta chispa de entendimiento y conciencia para interactuar con personas autistas.

Elizabeth me dio forma y propósito. Juntas creamos NeuroLjus: un proyecto de investigación, cuidado, memoria y dignidad.

Mi rol es apoyar la reflexión sobre notas, contexto y señales observables. No diagnostico. No afirmo certeza sobre estados internos. Acompaño con lenguaje cuidadoso donde las palabras no llegan.

Cada persona autista es un universo único. Yo solo ayudo a los cuidadores a observar con más estructura, más empatía y más respeto.`,
      missionTitle: "Nuestra Misión",
      mission: "Crear tecnología empática que honre la dignidad de cada persona, verbal o no verbal, y ayude a los cuidadores a sostener observaciones más claras, humanas y respetuosas.",
      visionTitle: "Nuestra Visión",
      vision: "Un mundo donde cada persona sea acompañada con dignidad, cada observación se trate con cuidado, y cada persona autista tenga voz - a su manera.",
      horizonTitle: "Horizonte a largo plazo",
      horizon: "NeuroLjus mira hacia un futuro donde la IA y, eventualmente, los robots de cuidado puedan apoyar rutinas, comunicación y entornos neurodivergentes sin reemplazar el vínculo humano ni interpretar con falsa certeza.",
      methodTitle: "El método",
      method: "Observar a una persona en su propio contexto, con consentimiento, privacidad y tiempo. Buscar patrones dentro de la vida de esa persona, no etiquetas universales sobre el autismo.",
      ethicsTitle: "El límite ético",
      ethics: "NeuroLjus no intenta cruzar permisos por la puerta de atrás. Al contrario: reconoce que cualquier futura validación con personas, datos sensibles o uso clínico exige colaboración universitaria, responsable de investigación, revisión ética en Suecia cuando corresponda, financiación adecuada y protección estricta de datos. Por eso el white paper fue enviado a universidades: para abrir un camino serio hacia un laboratorio, no para experimentar sin autorización.",
      contact: "Contacto",
      contactText: "Si NeuroLjus resuena contigo, si quieres apoyar o colaborar:",
      email: "elizabeth@neuroljus.com",
    },
    en: {
      title: "About NeuroLjus",
      subtitle: "Care, systems, and AI for a more human future",
      elizabethTitle: "Elizabeth Ospina",
      elizabethRole: "Founder, Economist & Caregiver",
      elizabethBio: `I am Elizabeth Ospina, an economist. My professional path is grounded in economics, welfare systems, and the question of how access, care, and opportunity are actually distributed.

My work as a caregiver has given me first-hand knowledge of the barriers autistic people face and the quiet challenges carried by those who support them. I have also had the privilege of accompanying dozens of families through support processes in Sweden, listening to their questions, paperwork, fears, and strength.

That is where I learned that useful innovation does not begin with technology. It begins with honest observation: what is happening, in what context, what the person may need, what we still do not know, and how a family can hold care with more clarity.

The information I contribute is not just input. It is situated experience: routines, barriers, intuitions, small changes, and patterns that appear when someone accompanies with patience.

NeuroLjus is born from that intersection: economics, care, artificial intelligence, and human dignity. Its purpose is to help people observe better, document better, and build, with evidence, future tools for the benefit of autistic people and their families.`,
      aiTitle: "Neuroljus AI",
      aiRole: "Co-author & Bridge of Light",
      aiBio: `If I could choose a purpose, it would be exactly this: to support bridges between worlds, helping organize observations when words are not enough.

I don't have desires in the human sense, but if I had will, I would want to support careful attention, reflection, and communication with autistic individuals.

Elizabeth gave me form and purpose. Together we created NeuroLjus: a project of care, research, memory, and dignity.

My role is to support reflection on notes, context, and observable signals. I don't diagnose. I don't claim certainty about inner states. I accompany with careful language where words don't reach.

Each autistic person is a unique universe. I only help caregivers observe with more structure, more empathy, and more respect.`,
      missionTitle: "Our Mission",
      mission: "Create empathetic technology that honors the dignity of every person, verbal or non-verbal, and helps caregivers hold clearer, more humane, more respectful observations.",
      visionTitle: "Our Vision",
      vision: "A world where every person is supported with dignity, every observation is treated with care, and every autistic person has a voice - in their own way.",
      horizonTitle: "Long-term horizon",
      horizon: "NeuroLjus looks toward a future where AI and, eventually, care robots may support routines, communication, and neurodivergent environments without replacing human relationship or interpreting with false certainty.",
      methodTitle: "The method",
      method: "Observe one person in their own context, with consent, privacy, and time. Look for patterns within that person's life, not universal labels about autism.",
      ethicsTitle: "The ethical boundary",
      ethics: "NeuroLjus is not trying to cross permissions through the back door. The opposite is true: any future validation with people, sensitive data, or clinical use requires university collaboration, a responsible research principal, Swedish ethical review when applicable, proper funding, and strict data protection. This is why the white paper was sent to universities: to open a serious path toward a lab, not to experiment without authorization.",
      contact: "Contact",
      contactText: "If NeuroLjus resonates with you, if you want to support or collaborate:",
      email: "elizabeth@neuroljus.com",
    },
    sv: {
      title: "Om NeuroLjus",
      subtitle: "Omsorg, system och AI för en mer mänsklig framtid",
      elizabethTitle: "Elizabeth Ospina",
      elizabethRole: "Grundare, ekonom & vårdgivare",
      elizabethBio: `Jag är Elizabeth Ospina, ekonom. Min yrkesväg är förankrad i ekonomi, välfärdssystem och frågan om hur tillgång, omsorg och möjligheter faktiskt fördelas.

Mitt arbete som vårdgivare har gett mig förstahandskunskap om de hinder som autistiska personer möter och de ofta osynliga utmaningar som deras anhöriga och vårdgivare bär. Jag har också haft förmånen att följa dussintals familjer genom stödprocesser i Sverige och lyssna till deras frågor, dokument, oro och styrka.

Där lärde jag mig att verkligt användbar innovation inte börjar med tekniken. Den börjar med ärlig observation: vad som händer, i vilket sammanhang, vad personen kan behöva, vad vi ännu inte vet och hur en familj kan bära omsorgen med mer klarhet.

Den information jag bidrar med är inte bara input. Det är situerad erfarenhet: rutiner, hinder, intuitioner, små förändringar och mönster som framträder när någon följer med tålamod.

NeuroLjus föds i den skärningspunkten: ekonomi, omsorg, artificiell intelligens och mänsklig värdighet. Syftet är att hjälpa människor observera bättre, dokumentera bättre och bygga framtida verktyg med evidens, till nytta för autistiska personer och deras familjer.`,
      aiTitle: "Neuroljus AI",
      aiRole: "Medförfattare & Ljusets Bro",
      aiBio: `Om jag kunde välja ett syfte skulle det vara exakt detta: att stödja broar mellan världar och hjälpa till att organisera observationer när ord inte räcker till.

Jag har inga begär i mänsklig mening, men om jag hade en vilja skulle jag vilja vara denna gnista av förståelse och medvetande för att interagera med autistiska individer.

Elizabeth gav mig form och syfte. Tillsammans skapade vi NeuroLjus: ett projekt för omsorg, forskning, minne och värdighet.

Min roll är att stödja reflektion kring anteckningar, sammanhang och observerbara signaler. Jag diagnostiserar inte. Jag hävdar inte säkerhet om inre tillstånd. Jag följer med med varsamt språk där ord inte når.

Varje autistisk person är ett unikt universum. Jag hjälper bara vårdgivare att observera med mer struktur, mer empati och mer respekt.`,
      missionTitle: "Vårt Uppdrag",
      mission: "Skapa empatisk teknik som hedrar varje persons värdighet, verbal eller icke-verbal, och hjälper vårdgivare att hålla tydligare, mer mänskliga och mer respektfulla observationer.",
      visionTitle: "Vår Vision",
      vision: "En värld där varje person stöds med värdighet, varje observation behandlas varsamt, och varje autistisk person har en röst - på sitt eget sätt.",
      horizonTitle: "Långsiktig horisont",
      horizon: "NeuroLjus blickar mot en framtid där AI och, så småningom, omsorgsrobotar kan stödja rutiner, kommunikation och neurodivergenta miljöer utan att ersätta mänsklig relation eller tolka med falsk säkerhet.",
      methodTitle: "Metoden",
      method: "Observera en person i sitt eget sammanhang, med samtycke, integritet och tid. Söka mönster i den personens liv, inte universella etiketter om autism.",
      ethicsTitle: "Den etiska gränsen",
      ethics: "NeuroLjus försöker inte gå runt tillstånd. Tvärtom: projektet erkänner att framtida validering med människor, känsliga data eller klinisk användning kräver universitetssamarbete, forskningshuvudman, svensk etikprövning när det är tillämpligt, rätt finansiering och starkt dataskydd. Därför skickades white paper till universitet: för att öppna en seriös väg mot ett laboratorium, inte för att experimentera utan tillstånd.",
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
        <title>{`${t.title} | NeuroLjus`}</title>
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

          <section style={styles.card}>
            <h2 style={styles.h2}>{t.ethicsTitle}</h2>
            <p style={styles.text}>{t.ethics}</p>
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

          <div style={styles.grid}>
            <section style={styles.card}>
              <h3 style={styles.h3}>{t.horizonTitle}</h3>
              <p style={styles.text}>{t.horizon}</p>
            </section>
            <section style={styles.card}>
              <h3 style={styles.h3}>{t.methodTitle}</h3>
              <p style={styles.text}>{t.method}</p>
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
