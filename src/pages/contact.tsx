import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ContactForm from "../components/ContactForm";

type Lang = "sv" | "en" | "es";

export default function ContactPage() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const browserLang = navigator.language?.toLowerCase() || "";
      if (browserLang.startsWith("sv")) setLang("sv");
      else if (browserLang.startsWith("es")) setLang("es");
      else setLang("en");
    } catch {
      setLang("en");
    }
  }, []);

  const T = useMemo(
    () => ({
      sv: {
        seoTitle: "Kontakt — Neuroljus",
        seoDesc:
          "Kontakta Neuroljus om forskning, samarbete, etik, tillgänglighet och integritetsfokuserad omsorgsobservation.",
        statusRight: "latency 0ms · deterministiskt · caregiver_authority=true",
        platform: "Kontakt",
        navLabs: "Labs",
        navAbout: "Om",
        navContact: "Kontakt",
        pillRuntime: "runtime",
        pillProtocol: "protocol",
        pillAdapters: "adapters",
        pillAudit: "audit",
        cli: "$ neuroljus contact --open",
        heroTitle: "Kontakt",
        heroSub:
          "Samtal med vårdgivare, feedback om observationsmetoden, forskningssamarbete, etik och tillgänglighet.",
      },
      en: {
        seoTitle: "Contact — Neuroljus",
        seoDesc:
          "Contact Neuroljus about research, collaboration, ethics, accessibility, and privacy-first caregiver observation.",
        statusRight: "latency 0ms · deterministic · caregiver_authority=true",
        platform: "Contact",
        navLabs: "Labs",
        navAbout: "About",
        navContact: "Contact",
        pillRuntime: "runtime",
        pillProtocol: "protocol",
        pillAdapters: "adapters",
        pillAudit: "audit",
        cli: "$ neuroljus contact --open",
        heroTitle: "Contact",
        heroSub:
          "Caregiver conversations, observation-method feedback, research collaboration, ethics, and accessibility inquiries.",
      },
      es: {
        seoTitle: "Contacto — Neuroljus",
        seoDesc:
          "Contacta Neuroljus sobre investigación, colaboración, ética, accesibilidad y observación del cuidado con privacidad primero.",
        statusRight: "latency 0ms · determinista · caregiver_authority=true",
        platform: "Contacto",
        navLabs: "Labs",
        navAbout: "Sobre",
        navContact: "Contacto",
        pillRuntime: "runtime",
        pillProtocol: "protocol",
        pillAdapters: "adapters",
        pillAudit: "audit",
        cli: "$ neuroljus contact --open",
        heroTitle: "Contacto",
        heroSub:
          "Conversaciones con cuidadoras, feedback del método de observación, colaboración en investigación, ética y accesibilidad.",
      },
    }),
    []
  );

  const copy = T[lang];

  return (
    <>
      <Head>
        <title>{copy.seoTitle}</title>
        <meta name="description" content={copy.seoDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#09090b" />
      </Head>

      <div className="page">
        <div className="statusbar" aria-hidden="true">
          <span>
            neuroljus://local · <b>care_command_protocol_v0</b> · audit=on · network=off
          </span>
          <span>{copy.statusRight}</span>
        </div>

        <header className="shell topnav" role="banner">
          <div className="brandRow">
            <Link href="/" className="logo">
              Neuroljus
            </Link>
            <span className="sep">/</span>
            <span className="platform">{copy.platform}</span>
          </div>

          <nav className="navLinks" aria-label={copy.navLabs}>
            <Link href="/labs/future-care-room">{copy.navLabs}</Link>
            <Link href="/about">{copy.navAbout}</Link>
            <Link href="/contact">{copy.navContact}</Link>
          </nav>

          <div className="navRight">
            <div className="pills" role="group" aria-label="Platform layers">
              <span className="pill">{copy.pillRuntime}</span>
              <span className="pill">{copy.pillProtocol}</span>
              <span className="pill">{copy.pillAdapters}</span>
              <span className="pill on">{copy.pillAudit}</span>
            </div>
            <div className="langToggle" role="group" aria-label="Language">
              <button onClick={() => setLang("es")} aria-pressed={lang === "es"}>
                ES
              </button>
              <button onClick={() => setLang("en")} aria-pressed={lang === "en"}>
                EN
              </button>
              <button onClick={() => setLang("sv")} aria-pressed={lang === "sv"}>
                SV
              </button>
            </div>
          </div>
        </header>

        <main className="shell content">
          <p className="cli">{copy.cli}</p>
          <h1>{copy.heroTitle}</h1>
          <p className="heroSub">{copy.heroSub}</p>
          <div className="formPanel">
            <ContactForm lang={lang} />
          </div>
        </main>

        <footer className="shell foot" role="contentinfo">
          <p>
            Neuroljus —{" "}
            {lang === "sv"
              ? "oberoende forsknings- och portfolioprojekt av Elizabeth Ospina."
              : lang === "es"
                ? "proyecto independiente de investigación y portafolio de Elizabeth Ospina."
                : "independent research and portfolio project by Elizabeth Ospina."}
          </p>
          <Link href="/">neuroljus.com</Link>
        </footer>
      </div>

      <style jsx>{`
        .page {
          min-height: 100dvh;
          background: #09090b;
          color: #fafafa;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }
        .shell {
          width: min(720px, calc(100% - 48px));
          margin: 0 auto;
        }
        .statusbar {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding: 8px 24px;
          border-bottom: 1px solid #27272a;
          color: #71717a;
        }
        .statusbar :global(b) {
          color: #3ecf9a;
          font-weight: 600;
        }
        .topnav {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #27272a;
          max-width: min(1100px, calc(100% - 48px));
        }
        .brandRow {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fafafa;
          text-decoration: none;
        }
        .sep {
          color: #3f3f46;
        }
        .platform {
          font-size: 13px;
          color: #a1a1aa;
        }
        .navLinks {
          display: flex;
          gap: 20px;
          font-size: 13px;
        }
        .navLinks :global(a) {
          color: #a1a1aa;
          text-decoration: none;
          font-weight: 600;
        }
        .navLinks :global(a:hover) {
          color: #3ecf9a;
        }
        .navRight {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pill {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          color: #a1a1aa;
        }
        .pill.on {
          border-color: #3ecf9a;
          color: #3ecf9a;
        }
        .langToggle {
          display: flex;
          gap: 4px;
        }
        .langToggle button {
          min-width: 36px;
          min-height: 30px;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          background: transparent;
          color: #a1a1aa;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }
        .langToggle button[aria-pressed="true"] {
          border-color: #3ecf9a;
          background: #3ecf9a;
          color: #09090b;
        }
        .content {
          padding: 48px 0 40px;
        }
        .cli {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
          color: #3ecf9a;
          margin-bottom: 16px;
        }
        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .heroSub {
          margin-top: 12px;
          max-width: 560px;
          font-size: 15px;
          line-height: 1.6;
          color: #a1a1aa;
        }
        .formPanel {
          margin-top: 32px;
          border: 1px solid #27272a;
          border-radius: 6px;
          background: #0c0c0e;
          padding: 28px;
        }
        .foot {
          padding: 24px 0 40px;
          border-top: 1px solid #27272a;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 12px;
          font-size: 12px;
          color: #71717a;
        }
        .foot :global(a) {
          color: #3ecf9a;
          font-weight: 700;
          text-decoration: none;
        }
        @media (max-width: 900px) {
          .shell {
            width: min(100% - 28px, 720px);
          }
          .topnav {
            max-width: min(100% - 28px, 1100px);
          }
          .navRight {
            width: 100%;
            margin-left: 0;
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
}
