import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [lang, setLang] = useState<"sv" | "en">("sv");

  // Detect browser language once
  useEffect(() => {
    try {
      const l = navigator.language?.toLowerCase().startsWith("sv") ? "sv" : "en";
      setLang(l as "sv" | "en");
    } catch {
      setLang("sv");
    }
  }, []);

  // Bilingual texts
  const T = useMemo(
    () => ({
      titleSV: "Ljus som gör det osynliga begripligt",
      titleEN: "Light that makes the invisible understandable",
      subSV:
        "En empatisk, lokal AI-följeslagare som hjälper familjer och vårdgivare att förstå sensoriska mönster och hälsosignaler – i din takt.",
      subEN:
        "An empathic, on-device AI companion that helps families and caregivers understand sensory patterns and health signals — at your pace.",
      ctaSV: "Utforska NeuroLjus",
      ctaEN: "Explore NeuroLjus",
      tagSV: "Empatisk AI för sensorisk förståelse",
      tagEN: "Empathic AI for Sensory Understanding",
      p1SVTitle: "Öppen för förtroende",
      p1SV: "Gränssnitt och flöden kan granskas. Transparent och inkluderande.",
      p1ENTitle: "Open for Trust",
      p1EN: "Interfaces and flows are auditable. Transparent and inclusive.",
      p2SVTitle: "Drivs av GPT (valfritt)",
      p2SV: "Avancerat resonemang när det behövs. Alltid integritet först.",
      p2ENTitle: "Powered by GPT (optional)",
      p2EN: "Advanced reasoning when needed. Always privacy-first.",
      p3SVTitle: "Skyddad kärna",
      p3SV: "Personliga mönster och signaler behandlas lokalt och säkert.",
      p3ENTitle: "Protected Core",
      p3EN: "Personal patterns and signals are processed locally and safely.",
      footSV:
        "NeuroLjus är ett experimentellt projekt. All data stannar på din enhet om du inte uttryckligen samtycker till annat.",
      footEN:
        "NeuroLjus is an experimental project. All data stays on your device unless you explicitly consent otherwise.",
    }),
    []
  );

  const isSV = lang === "sv";

  // SEO dynamic
  const seoTitle = isSV
    ? "NeuroLjus – Empatisk AI för sensorisk förståelse"
    : "NeuroLjus – Empathic AI for Sensory Understanding";
  const seoDesc = isSV
    ? "En empatisk, lokal AI-följeslagare som hjälper familjer och vårdgivare att förstå sensoriska mönster och hälsosignaler."
    : "An empathic, on-device AI companion that helps families and caregivers understand sensory patterns and health signals.";

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/brand/neuroljus-logo.svg" />
        <meta name="theme-color" content="#1E1F3B" />
      </Head>

      <div className="page">
        <div className="container">
          {/* Header */}
          <header className="header" role="banner">
            <a className="brand" href="/" aria-label="NeuroLjus home">
              <Image
                src="/brand/neuroljus-logo.svg"
                alt="NeuroLjus logo – protected core with aurora"
                width={36}
                height={36}
                priority
                className="brandLogo"
              />
              <div>
                <div className="brandName">NeuroLjus</div>
                <div className="tagline">{isSV ? T.tagSV : T.tagEN}</div>
              </div>
            </a>

            <nav className="nav" aria-label={isSV ? "Primär" : "Primary"}>
              <a href="/labs/nl-vision">Demo</a>
              <a href="/about">{isSV ? "Om" : "About"}</a>
            </nav>

            <div className="langToggle" role="group" aria-label="Language switch">
              <button
                onClick={() => setLang("sv")}
                aria-label="Byt språk till svenska"
                aria-pressed={isSV}
              >
                SV
              </button>
              <button
                onClick={() => setLang("en")}
                aria-label="Switch language to English"
                aria-pressed={!isSV}
              >
                EN
              </button>
            </div>
          </header>

          {/* Hero */}
          <main className="hero" role="main">
            <section className="card">
              <h1 className="title">{isSV ? T.titleSV : T.titleEN}</h1>
              <p className="subtitle">{isSV ? T.subSV : T.subEN}</p>

              <a className="cta" href="/labs/nl-vision">
                {isSV ? T.ctaSV : T.ctaEN}
              </a>

              <p className="note">
                {isSV
                  ? "Data stannar på enheten. Inget skickas utan ditt samtycke."
                  : "Data stays on device. Nothing is sent without your consent."}
              </p>
            </section>

            <section className="card">
              <Image
                src="/brand/neuroljus-logo.svg"
                alt="NeuroLjus logo large"
                width={800}
                height={800}
                className="logoLarge"
                priority
              />
            </section>
          </main>

          {/* Pillars */}
          <section id="pillars" className="pillars" aria-label="Pillars">
            <div className="pillar">
              <h3>{isSV ? T.p1SVTitle : T.p1ENTitle}</h3>
              <p>{isSV ? T.p1SV : T.p1EN}</p>
            </div>
            <div className="pillar">
              <h3>{isSV ? T.p2SVTitle : T.p2ENTitle}</h3>
              <p>{isSV ? T.p2SV : T.p2EN}</p>
            </div>
            <div className="pillar">
              <h3>{isSV ? T.p3SVTitle : T.p3ENTitle}</h3>
              <p>{isSV ? T.p3SV : T.p3EN}</p>
            </div>
          </section>


          <footer className="footer" role="contentinfo">
            {isSV ? T.footSV : T.footEN}
          </footer>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }
        .page {
          min-height: 100dvh;
          color: #fff;
          background:
            radial-gradient(1200px 700px at 20% 10%, rgba(94,230,164,0.18), transparent 60%),
            radial-gradient(900px 600px at 80% 20%, rgba(124,227,247,0.18), transparent 60%),
            radial-gradient(1200px 900px at 50% 120%, rgba(166,133,247,0.18), transparent 60%),
            #1e1f3b;
          display: flex;
          flex-direction: column;
        }
        .container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 22px;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #fff;
        }
        .brandLogo {
          filter: drop-shadow(0 0 10px rgba(124, 227, 247, 0.25));
        }
        .brandName {
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .tagline {
          font-size: 12px;
          opacity: 0.8;
        }
        .nav {
          margin-left: auto;
          display: flex;
          gap: 14px;
        }
        .nav a {
          color: #cfe7ff;
          text-decoration: none;
          font-size: 14px;
        }
        .langToggle {
          display: flex;
          gap: 8px;
          margin-left: 8px;
        }
        .langToggle button {
          background: transparent;
          color: #cfe7ff;
          border: 1px solid #4a507e;
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
        }
        .hero {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 26px;
          align-items: center;
        }
        .card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          padding: 22px;
        }
        .title {
          font-size: 40px;
          margin: 6px 0;
        }
        .subtitle {
          color: #cbd5e1;
          margin: 0 0 14px;
        }
        .cta {
          display: inline-block;
          padding: 12px 18px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          color: #0b1220;
          background-image: linear-gradient(135deg, #5ee6a4 0%, #7ce3f7 100%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 6px 20px rgba(94, 230, 164, 0.25);
        }
        .note {
          opacity: 0.85;
          margin-top: 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono",
            monospace;
          font-size: 12px;
        }
        .logoLarge {
          width: 100%;
          height: auto;
          display: block;
        }
        .pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 22px;
        }
        .pillar {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 18px;
        }
        .pillar p {
          color: #d7deea;
          margin: 0;
          font-size: 14px;
          line-height: 1.45;
        }
        .footer {
          text-align: center;
          color: #b8c1d6;
          font-size: 12px;
          padding: 18px 22px;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
          }
          .title {
            font-size: 32px;
          }
          .nav {
            display: none;
          }
        }

        /* Smooth hover */
        @media (prefers-reduced-motion: no-preference) {
          .cta {
            transition: transform 200ms ease, box-shadow 200ms ease;
          }
          .cta:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 22px rgba(94, 230, 164, 0.3);
          }
        }
      `}</style>
    </>
  );
}