import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useLang } from "@/lib/language";

const T = {
  es: {
    seoTitle: "NeuroLjus — IA empática para la comprensión sensorial",
    seoDesc:
      "Una organización dedicada a tender puentes de comunicación para personas autistas no verbales, con tecnología empática y respeto por la dignidad humana.",
    eyebrow: "Cuidado de personas autistas",
    title: "Luz que hace comprensible lo invisible",
    lead: "NeuroLjus acompaña a familias y cuidadores de personas autistas no verbales. Una IA empática y local ayuda a interpretar señales sensoriales y necesidades silenciadas, a tu ritmo y con tu consentimiento.",
    ctaPrimary: "Conocer la demo NL-Vision",
    ctaSecondary: "Sobre nuestra misión",
    note: "Los datos permanecen en tu dispositivo. Nada se envía sin tu consentimiento.",
    pillarsTitle: "Cómo cuidamos",
    pillarsSub:
      "Tecnología pensada desde la empatía, la accesibilidad y la privacidad de cada persona.",
    p1Title: "Comunicación sin palabras",
    p1: "Interpretamos señales no verbales y patrones sensoriales para ayudar a entender qué necesita la persona.",
    p2Title: "Privacidad primero",
    p2: "El análisis ocurre localmente siempre que es posible. Tus datos son tuyos.",
    p3Title: "Dignidad y acompañamiento",
    p3: "No diagnosticamos: acompañamos. Cada persona autista es un universo único.",
    forTitle: "Para quién es NeuroLjus",
    forSub: "Construimos puentes donde otros ven barreras.",
    f1: "Familias que conviven con personas autistas no verbales.",
    f2: "Cuidadores y profesionales del acompañamiento.",
    f3: "Organizaciones que buscan herramientas inclusivas y accesibles.",
    closingTitle: "¿Quieres apoyar o colaborar?",
    closingText: "Si esta misión resuena contigo, escríbenos. Estamos construyendo esto en comunidad.",
    closingCta: "Contáctanos",
  },
  en: {
    seoTitle: "NeuroLjus — Empathic AI for Sensory Understanding",
    seoDesc:
      "An organization dedicated to building communication bridges for non-verbal autistic individuals, with empathic technology and respect for human dignity.",
    eyebrow: "Care for autistic people",
    title: "Light that makes the invisible understandable",
    lead: "NeuroLjus supports families and caregivers of non-verbal autistic individuals. An empathic, on-device AI helps interpret sensory signals and silenced needs — at your pace and with your consent.",
    ctaPrimary: "Explore the NL-Vision demo",
    ctaSecondary: "About our mission",
    note: "Data stays on your device. Nothing is sent without your consent.",
    pillarsTitle: "How we care",
    pillarsSub: "Technology designed around empathy, accessibility and the privacy of each person.",
    p1Title: "Communication beyond words",
    p1: "We interpret non-verbal signals and sensory patterns to help understand what a person needs.",
    p2Title: "Privacy first",
    p2: "Analysis happens locally whenever possible. Your data is yours.",
    p3Title: "Dignity and accompaniment",
    p3: "We don't diagnose: we accompany. Every autistic person is a unique universe.",
    forTitle: "Who NeuroLjus is for",
    forSub: "We build bridges where others see barriers.",
    f1: "Families living with non-verbal autistic individuals.",
    f2: "Caregivers and accompaniment professionals.",
    f3: "Organizations seeking inclusive, accessible tools.",
    closingTitle: "Want to support or collaborate?",
    closingText: "If this mission resonates with you, reach out. We're building this as a community.",
    closingCta: "Contact us",
  },
  sv: {
    seoTitle: "NeuroLjus — Empatisk AI för sensorisk förståelse",
    seoDesc:
      "En organisation som bygger kommunikationsbroar för icke-verbala autistiska personer, med empatisk teknik och respekt för mänsklig värdighet.",
    eyebrow: "Omsorg för autistiska personer",
    title: "Ljus som gör det osynliga begripligt",
    lead: "NeuroLjus stödjer familjer och vårdgivare till icke-verbala autistiska personer. En empatisk, lokal AI hjälper till att tolka sensoriska signaler och tysta behov — i din takt och med ditt samtycke.",
    ctaPrimary: "Utforska NL-Vision-demon",
    ctaSecondary: "Om vårt uppdrag",
    note: "Data stannar på din enhet. Inget skickas utan ditt samtycke.",
    pillarsTitle: "Hur vi värnar",
    pillarsSub: "Teknik som utgår från empati, tillgänglighet och varje persons integritet.",
    p1Title: "Kommunikation bortom ord",
    p1: "Vi tolkar icke-verbala signaler och sensoriska mönster för att förstå vad en person behöver.",
    p2Title: "Integritet först",
    p2: "Analys sker lokalt när det är möjligt. Dina data är dina.",
    p3Title: "Värdighet och närvaro",
    p3: "Vi diagnostiserar inte: vi följer med. Varje autistisk person är ett unikt universum.",
    forTitle: "Vem NeuroLjus är till för",
    forSub: "Vi bygger broar där andra ser barriärer.",
    f1: "Familjer som lever med icke-verbala autistiska personer.",
    f2: "Vårdgivare och stödprofessionella.",
    f3: "Organisationer som söker inkluderande, tillgängliga verktyg.",
    closingTitle: "Vill du stödja eller samarbeta?",
    closingText: "Om detta uppdrag berör dig, hör av dig. Vi bygger detta tillsammans.",
    closingCta: "Kontakta oss",
  },
} as const;

export default function Home() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <Layout>
      <Head>
        <title>{t.seoTitle}</title>
        <meta name="description" content={t.seoDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={t.seoTitle} />
        <meta property="og:description" content={t.seoDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/brand/neuroljus-logo.svg" />
        <meta name="theme-color" content="#2e6b5e" />
      </Head>

      {/* Hero */}
      <section className="nl-hero nl-section">
        <div>
          <span className="nl-eyebrow">{t.eyebrow}</span>
          <h1 className="nl-title">{t.title}</h1>
          <p className="nl-lead">{t.lead}</p>
          <div className="nl-actions">
            <Link className="nl-btn nl-btn-primary" href="/labs/nl-vision">
              {t.ctaPrimary}
            </Link>
            <Link className="nl-btn nl-btn-ghost" href="/about">
              {t.ctaSecondary}
            </Link>
          </div>
          <p className="nl-footer-fine" style={{ marginTop: 18 }}>
            {t.note}
          </p>
        </div>
        <div className="nl-hero-art">
          <Image
            src="/brand/neuroljus-logo.svg"
            alt="NeuroLjus"
            width={320}
            height={320}
            priority
          />
        </div>
      </section>

      {/* Pillars */}
      <section className="nl-section" aria-labelledby="pillars-title">
        <h2 className="nl-h2" id="pillars-title">
          {t.pillarsTitle}
        </h2>
        <p className="nl-sub">{t.pillarsSub}</p>
        <div className="nl-grid-3">
          <article className="nl-card">
            <span className="nl-icon" aria-hidden>
              <DotIcon />
            </span>
            <h3>{t.p1Title}</h3>
            <p>{t.p1}</p>
          </article>
          <article className="nl-card">
            <span className="nl-icon" aria-hidden>
              <ShieldIcon />
            </span>
            <h3>{t.p2Title}</h3>
            <p>{t.p2}</p>
          </article>
          <article className="nl-card">
            <span className="nl-icon" aria-hidden>
              <HeartIcon />
            </span>
            <h3>{t.p3Title}</h3>
            <p>{t.p3}</p>
          </article>
        </div>
      </section>

      {/* Who it's for */}
      <section className="nl-section" aria-labelledby="for-title">
        <h2 className="nl-h2" id="for-title">
          {t.forTitle}
        </h2>
        <p className="nl-sub">{t.forSub}</p>
        <div className="nl-grid-3">
          <article className="nl-card">
            <p>{t.f1}</p>
          </article>
          <article className="nl-card">
            <p>{t.f2}</p>
          </article>
          <article className="nl-card">
            <p>{t.f3}</p>
          </article>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="nl-section">
        <div className="nl-card nl-center" style={{ padding: "40px 28px" }}>
          <h2 className="nl-h2">{t.closingTitle}</h2>
          <p className="nl-sub">{t.closingText}</p>
          <div className="nl-actions" style={{ justifyContent: "center" }}>
            <Link className="nl-btn nl-btn-primary" href="/contact">
              {t.closingCta}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function DotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.3-7-9.3A3.7 3.7 0 0112 8a3.7 3.7 0 017 2.7c0 5-7 9.3-7 9.3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
