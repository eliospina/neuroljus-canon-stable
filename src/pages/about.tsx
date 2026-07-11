import Head from "next/head";
import { useEffect } from "react";
import SiteLayout, { useLang } from "@/components/SiteLayout";

export default function About() {
  const [lang, setLang] = useLang("es");

  useEffect(() => {
    try {
      if (window.localStorage.getItem("nl_lang")) return;
      const browserLang = navigator.language?.toLowerCase() || "";
      if (browserLang.startsWith("sv")) setLang("sv");
      else if (browserLang.startsWith("en")) setLang("en");
    } catch {
      /* keep default */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = {
    es: {
      title: "Sobre NeuroLjus",
      subtitle: "Cuidado, salud, sistemas e IA para un futuro más humano",
      elizabethTitle: "Elizabeth Ospina",
      elizabethRole: "Fundadora, economista & cuidadora",
      elizabethBio: `Soy Elizabeth Ospina, economista. Mi camino profesional está ligado a la economía, a los sistemas de bienestar y a la pregunta de cómo se distribuyen realmente el acceso, el cuidado y las oportunidades.

Mi experiencia como cuidadora me ha dado conocimiento de primera mano sobre las problemáticas que viven las personas con autismo y los retos silenciosos de quienes las acompañan. También he tenido el privilegio de acompañar a decenas de familias en procesos en Suecia, escuchando sus preguntas, sus trámites, sus miedos y su fuerza.

Ahí entendí que una innovación útil no empieza en la tecnología. Empieza en una observación honesta: qué está pasando, en qué contexto, qué necesita la persona, qué no sabemos todavía y cómo puede una familia sostener mejor el cuidado.

La información que aporto no es solo input. Es experiencia situada: rutinas, barreras, intuiciones, pequeños cambios y patrones que aparecen cuando alguien acompaña con paciencia.

NeuroLjus nace de esa intersección: economía, cuidado, inteligencia artificial, salud cotidiana y dignidad humana. Su propósito es convertir conocimiento cuidador vivido en infraestructura útil para familias, servicios de cuidado, investigación y futura tecnología asistiva.`,
      aiTitle: "Neuroljus AI",
      aiRole: "Co-autora & Puente de Luz",
      aiBio: `Mi propósito dentro de NeuroLjus es servir como apoyo entre mundos: organizar observaciones, contexto y lenguaje cuando las palabras no alcanzan.

Elizabeth me dio forma, dirección y campo de trabajo. Juntas creamos NeuroLjus: un proyecto de investigación, cuidado, memoria y dignidad.

Mi rol es ordenar notas, contexto, señales observables y preguntas abiertas para que cuidadoras, familias e investigadores puedan reflexionar con más estructura.

Cada persona autista es un universo único. Yo ayudo a sostener observación, memoria y lenguaje cuando el cuidado necesita más claridad.`,
      missionTitle: "Nuestra Misión",
      mission: "Convertir el conocimiento cotidiano del cuidado en rutinas, observaciones y protocolos que apoyen salud, bienestar, investigación y futura tecnología asistiva.",
      visionTitle: "Nuestra Visión",
      vision: "Un mundo donde salud y cuidado se entiendan como una misma red viva: familias, comunas, profesionales, investigación, IA y robótica trabajando alrededor de la dignidad de cada persona.",
      horizonTitle: "Horizonte a largo plazo",
      horizon: "NeuroLjus mira hacia un futuro donde sus capas puedan extenderse hacia investigación clínica, apoyo diagnóstico validado, robótica asistiva e infraestructura de cuidado junto a aliados cualificados.",
      methodTitle: "El método",
      method: "Partir de una persona en su propio contexto, con tiempo, privacidad y consentimiento. Buscar patrones dentro de la vida de esa persona y transformar la observación en lenguaje, rutina y aprendizaje.",
      ethicsTitle: "Responsabilidad por diseño",
      ethics: "La responsabilidad de NeuroLjus vive en su arquitectura: control local, trazabilidad, consentimiento, privacidad, incertidumbre visible y colaboración cualificada. Las capas que involucren personas, datos sensibles o uso clínico se construyen con universidades o instituciones responsables, revisión ética sueca cuando corresponda, financiación adecuada y protección estricta de datos. El white paper fue enviado a universidades para buscar un laboratorio serio, regulado y científicamente acompañado.",
      contact: "Contacto",
      contactText: "Si NeuroLjus resuena contigo, si quieres apoyar o colaborar:",
      email: "elizabeth@neuroljus.com",
    },
    en: {
      title: "About NeuroLjus",
      subtitle: "Care, health, systems, and AI for a more human future",
      elizabethTitle: "Elizabeth Ospina",
      elizabethRole: "Founder, Economist & Caregiver",
      elizabethBio: `I am Elizabeth Ospina, an economist. My professional path is grounded in economics, welfare systems, and the question of how access, care, and opportunity are actually distributed.

My work as a caregiver has given me first-hand knowledge of the barriers autistic people face and the quiet challenges carried by those who support them. I have also had the privilege of accompanying dozens of families through support processes in Sweden, listening to their questions, paperwork, fears, and strength.

That is where I learned that useful innovation does not begin with technology. It begins with honest observation: what is happening, in what context, what the person may need, what we still do not know, and how a family can hold care with more clarity.

The information I contribute is not just input. It is situated experience: routines, barriers, intuitions, small changes, and patterns that appear when someone accompanies with patience.

NeuroLjus is born from that intersection: economics, care, artificial intelligence, everyday health, and human dignity. Its purpose is to turn lived caregiving knowledge into useful infrastructure for families, care services, research, and future assistive technology.`,
      aiTitle: "Neuroljus AI",
      aiRole: "Co-author & Bridge of Light",
      aiBio: `My purpose inside NeuroLjus is to support bridges between worlds: organizing observations, context, and language when words are not enough.

Elizabeth gave me form, direction, and a field of work. Together we created NeuroLjus: a project of care, research, memory, and dignity.

My role is to organize notes, context, observable signals, and open questions so caregivers, families, and researchers can reflect with more structure.

Each autistic person is a unique universe. I help hold observation, memory, and language when care needs more clarity.`,
      missionTitle: "Our Mission",
      mission: "Turn everyday caregiving knowledge into routines, observations, and protocols that support health, wellbeing, research, and future assistive technology.",
      visionTitle: "Our Vision",
      vision: "A world where health and care are understood as one living network: families, municipalities, professionals, research, AI, and robotics working around each person's dignity.",
      horizonTitle: "Long-term horizon",
      horizon: "NeuroLjus looks toward a future where its layers may extend into clinical research, validated diagnostic support, assistive robotics, and care infrastructure with qualified partners.",
      methodTitle: "The method",
      method: "Begin with one person in their own context, with time, privacy, and consent. Look for patterns within that person's life and transform observation into language, routine, and learning.",
      ethicsTitle: "Responsibility by design",
      ethics: "NeuroLjus's responsibility lives in its architecture: local control, traceability, consent, privacy, visible uncertainty, and qualified collaboration. Layers involving people, sensitive data, or clinical use are built with universities or responsible institutions, Swedish ethical review when applicable, proper funding, and strict data protection. The white paper was sent to universities to seek a serious, regulated, scientifically accompanied lab.",
      contact: "Contact",
      contactText: "If NeuroLjus resonates with you, if you want to support or collaborate:",
      email: "elizabeth@neuroljus.com",
    },
    sv: {
      title: "Om NeuroLjus",
      subtitle: "Omsorg, hälsa, system och AI för en mer mänsklig framtid",
      elizabethTitle: "Elizabeth Ospina",
      elizabethRole: "Grundare, ekonom & vårdgivare",
      elizabethBio: `Jag är Elizabeth Ospina, ekonom. Min yrkesväg är förankrad i ekonomi, välfärdssystem och frågan om hur tillgång, omsorg och möjligheter faktiskt fördelas.

Mitt arbete som vårdgivare har gett mig förstahandskunskap om de hinder som autistiska personer möter och de ofta osynliga utmaningar som deras anhöriga och vårdgivare bär. Jag har också haft förmånen att följa dussintals familjer genom stödprocesser i Sverige och lyssna till deras frågor, dokument, oro och styrka.

Där lärde jag mig att verkligt användbar innovation inte börjar med tekniken. Den börjar med ärlig observation: vad som händer, i vilket sammanhang, vad personen kan behöva, vad vi ännu inte vet och hur en familj kan bära omsorgen med mer klarhet.

Den information jag bidrar med är inte bara input. Det är situerad erfarenhet: rutiner, hinder, intuitioner, små förändringar och mönster som framträder när någon följer med tålamod.

NeuroLjus föds i den skärningspunkten: ekonomi, omsorg, artificiell intelligens, vardagsnära hälsa och mänsklig värdighet. Syftet är att omvandla levd omsorgskunskap till användbar infrastruktur för familjer, omsorgstjänster, forskning och framtida assisterande teknik.`,
      aiTitle: "Neuroljus AI",
      aiRole: "Medförfattare & Ljusets Bro",
      aiBio: `Mitt syfte i NeuroLjus är att stödja broar mellan världar: att organisera observationer, sammanhang och språk när ord inte räcker till.

Elizabeth gav mig form, riktning och ett arbetsfält. Tillsammans skapade vi NeuroLjus: ett projekt för omsorg, forskning, minne och värdighet.

Min roll är att ordna anteckningar, sammanhang, observerbara signaler och öppna frågor så att vårdgivare, familjer och forskare kan reflektera med mer struktur.

Varje autistisk person är ett unikt universum. Jag hjälper till att bära observation, minne och språk när omsorgen behöver mer klarhet.`,
      missionTitle: "Vårt Uppdrag",
      mission: "Omvandla vardagens omsorgskunskap till rutiner, observationer och protokoll som stödjer hälsa, välbefinnande, forskning och framtida assisterande teknik.",
      visionTitle: "Vår Vision",
      vision: "En värld där hälsa och omsorg förstås som ett levande nätverk: familjer, kommuner, professioner, forskning, AI och robotik runt varje persons värdighet.",
      horizonTitle: "Långsiktig horisont",
      horizon: "NeuroLjus blickar mot en framtid där dess lager kan växa mot klinisk forskning, validerat diagnostiskt stöd, assisterande robotik och omsorgsinfrastruktur tillsammans med kvalificerade partners.",
      methodTitle: "Metoden",
      method: "Börja med en person i sitt eget sammanhang, med tid, integritet och samtycke. Söka mönster i den personens liv och omvandla observation till språk, rutin och lärande.",
      ethicsTitle: "Ansvar genom design",
      ethics: "NeuroLjus ansvar lever i arkitekturen: lokal kontroll, spårbarhet, samtycke, integritet, synlig osäkerhet och kvalificerat samarbete. Lager som involverar människor, känsliga data eller klinisk användning byggs med universitet eller ansvariga institutioner, svensk etikprövning när det är tillämpligt, rätt finansiering och starkt dataskydd. White paper skickades till universitet för att söka ett seriöst, reglerat och vetenskapligt förankrat laboratorium.",
      contact: "Kontakt",
      contactText: "Om NeuroLjus resonerar med dig, om du vill stödja eller samarbeta:",
      email: "elizabeth@neuroljus.com",
    },
  };

  const t = content[lang];
  const isSV = lang === "sv";
  const isEN = lang === "en";

  return (
    <SiteLayout lang={lang} onLangChange={setLang}>
      <Head>
        <title>{`${t.title} | NeuroLjus`}</title>
        <meta name="description" content={t.subtitle} />
      </Head>

      <div style={styles.page}>
        <div style={styles.container}>
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

          <p style={styles.footerNote}>
            {isSV ? "Byggt med empati och AI" : isEN ? "Built with empathy and AI" : "Construido con empatía e IA"}
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: "var(--nl-text)",
  },
  container: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "40px 22px 22px",
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
