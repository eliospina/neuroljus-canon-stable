import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lang = "sv" | "en" | "es";

const sectionKeys = ["basic", "happened", "context", "interpretation", "response"] as const;

export default function ObservationMethod() {
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
        seoTitle: "Observation Method v0 — Neuroljus",
        seoDesc:
          "En vårdgivarobservationsmetod för att dokumentera sammanhang, osäkerhet, respons och mönster över tid.",
        statusRight: "latency 0ms · deterministiskt · caregiver_authority=true",
        platform: "Observation Method",
        navLabs: "Labs",
        navAbout: "Om",
        navContact: "Kontakt",
        pillRuntime: "runtime",
        pillProtocol: "protocol",
        pillAdapters: "adapters",
        pillAudit: "audit",
        modId: "MOD.OBSERVATION",
        cli: "$ neuroljus observation --method v0",
        kicker: "Observation Method v0",
        heroTitle: "Omsorgsobservationer som kan bli kunskap",
        heroSub:
          "En enkel struktur för att dokumentera vad som hände, sammanhanget, vårdgivarens tolkning, osäkerhet och vad som hjälpte.",
        frameTitle: "Omsorgsram",
        frameBody:
          "Metoden håller observation, tolkning och osäkerhet åtskilda så att daglig omsorg kan bli tydligare över tid. Upprepade poster hjälper vårdgivare, familjer och framtida forskningspartners att granska mönster med mer sammanhang och mindre brus.",
        sections: {
          basic: {
            title: "1. Grundpost",
            items: ["Datum", "Ungefärlig tid", "Observatörsroll", "Miljö", "Rutin eller övergång"],
          },
          happened: {
            title: "2. Vad som hände",
            items: [
              "Observerat beteende",
              "Varaktighet",
              "Vad som hände omedelbart före",
              "Vad som hände omedelbart efter",
            ],
          },
          context: {
            title: "3. Sammanhang",
            items: [
              "Ljus, ljud, personer i närheten, rörelse eller trängsel",
              "Förväntad aktivitet",
              "Senaste övergång",
              "Avvikelse från normal rutin",
            ],
          },
          interpretation: {
            title: "4. Vårdgivarens tolkning",
            items: [
              "Vad som kan ha hänt",
              "Säkerhetsnivå: låg, medel eller hög",
              "Andra möjliga förklaringar",
              "Vilken osäkerhet som kvarstår",
            ],
          },
          response: {
            title: "5. Respons och mönstergranskning",
            items: [
              "Vad vårdgivaren försökte",
              "Vad som verkade hjälpa",
              "Vad som inte hjälpte",
              "Vad att bevaka nästa gång",
            ],
          },
        },
        testTitle: "Så testar du",
        testSteps: [
          "Välj en upprepad situation.",
          "Skriv tre till fem poster med samma struktur.",
          "Granska endast vad som upprepas, förändras, hjälper och förblir osäkert.",
          "Låt upprepade mönster, sammanhang och professionellt omdöme bära slutsatsen.",
        ],
        ctaFeedback: "Dela feedback",
        ctaVision: "Utforska NL-VISION",
      },
      en: {
        seoTitle: "Observation Method v0 — Neuroljus",
        seoDesc:
          "A caregiver observation method for documenting context, uncertainty, responses, and within-person patterns over time.",
        statusRight: "latency 0ms · deterministic · caregiver_authority=true",
        platform: "Observation Method",
        navLabs: "Labs",
        navAbout: "About",
        navContact: "Contact",
        pillRuntime: "runtime",
        pillProtocol: "protocol",
        pillAdapters: "adapters",
        pillAudit: "audit",
        modId: "MOD.OBSERVATION",
        cli: "$ neuroljus observation --method v0",
        kicker: "Observation Method v0",
        heroTitle: "Care observations that can become knowledge",
        heroSub:
          "A simple structure for documenting what happened, the surrounding context, the caregiver's interpretation, uncertainty, and what helped.",
        frameTitle: "Care frame",
        frameBody:
          "This method keeps observation, interpretation, and uncertainty separate so daily care can become clearer over time. Repeated entries help caregivers, families, and future research partners review patterns with more context and less noise.",
        sections: {
          basic: {
            title: "1. Basic entry",
            items: ["Date", "Approximate time", "Observer role", "Setting", "Routine or transition"],
          },
          happened: {
            title: "2. What happened",
            items: [
              "Observed behavior",
              "Duration",
              "What happened immediately before",
              "What happened immediately after",
            ],
          },
          context: {
            title: "3. Context",
            items: [
              "Light, sound, people nearby, movement or crowding",
              "Expected activity",
              "Recent transition",
              "Change from normal routine",
            ],
          },
          interpretation: {
            title: "4. Caregiver interpretation",
            items: [
              "What may have been happening",
              "Certainty level: low, medium, or high",
              "Other possible explanations",
              "What uncertainty remains",
            ],
          },
          response: {
            title: "5. Response and pattern review",
            items: [
              "What the caregiver tried",
              "What seemed to help",
              "What did not help",
              "What to watch for next time",
            ],
          },
        },
        testTitle: "How to test it",
        testSteps: [
          "Choose one repeated situation.",
          "Write three to five entries using the same structure.",
          "Review only what repeats, what changes, what helps, and what remains uncertain.",
          "Let repeated patterns, context, and professional judgment carry the conclusion.",
        ],
        ctaFeedback: "Share feedback",
        ctaVision: "Explore NL-VISION",
      },
      es: {
        seoTitle: "Observation Method v0 — Neuroljus",
        seoDesc:
          "Un método de observación para cuidadoras que documenta contexto, incertidumbre, respuestas y patrones dentro de la persona a lo largo del tiempo.",
        statusRight: "latency 0ms · determinista · caregiver_authority=true",
        platform: "Observation Method",
        navLabs: "Labs",
        navAbout: "Sobre",
        navContact: "Contacto",
        pillRuntime: "runtime",
        pillProtocol: "protocol",
        pillAdapters: "adapters",
        pillAudit: "audit",
        modId: "MOD.OBSERVATION",
        cli: "$ neuroljus observation --method v0",
        kicker: "Observation Method v0",
        heroTitle: "Observaciones del cuidado que pueden convertirse en conocimiento",
        heroSub:
          "Una estructura simple para documentar qué pasó, el contexto, la interpretación de la cuidadora, la incertidumbre y qué ayudó.",
        frameTitle: "Marco de cuidado",
        frameBody:
          "Este método mantiene separados la observación, la interpretación y la incertidumbre para que el cuidado diario se aclare con el tiempo. Las entradas repetidas ayudan a cuidadoras, familias y futuros aliados de investigación a revisar patrones con más contexto y menos ruido.",
        sections: {
          basic: {
            title: "1. Entrada básica",
            items: ["Fecha", "Hora aproximada", "Rol del observador", "Entorno", "Rutina o transición"],
          },
          happened: {
            title: "2. Qué pasó",
            items: [
              "Comportamiento observado",
              "Duración",
              "Qué pasó inmediatamente antes",
              "Qué pasó inmediatamente después",
            ],
          },
          context: {
            title: "3. Contexto",
            items: [
              "Luz, sonido, personas cerca, movimiento o aglomeración",
              "Actividad esperada",
              "Transición reciente",
              "Cambio respecto a la rutina normal",
            ],
          },
          interpretation: {
            title: "4. Interpretación de la cuidadora",
            items: [
              "Qué pudo estar pasando",
              "Nivel de certeza: bajo, medio o alto",
              "Otras explicaciones posibles",
              "Qué incertidumbre permanece",
            ],
          },
          response: {
            title: "5. Respuesta y revisión de patrones",
            items: [
              "Qué intentó la cuidadora",
              "Qué pareció ayudar",
              "Qué no ayudó",
              "Qué vigilar la próxima vez",
            ],
          },
        },
        testTitle: "Cómo probarlo",
        testSteps: [
          "Elige una situación repetida.",
          "Escribe tres a cinco entradas con la misma estructura.",
          "Revisa solo lo que se repite, cambia, ayuda y permanece incierto.",
          "Deja que los patrones repetidos, el contexto y el juicio profesional sostengan la conclusión.",
        ],
        ctaFeedback: "Compartir feedback",
        ctaVision: "Explorar NL-VISION",
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
              <span className="pill on">{copy.pillProtocol}</span>
              <span className="pill">{copy.pillAdapters}</span>
              <span className="pill">{copy.pillAudit}</span>
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
          <span className="modId">{copy.modId}</span>
          <p className="cli">{copy.cli}</p>
          <p className="kicker">{copy.kicker}</p>
          <h1>{copy.heroTitle}</h1>
          <p className="heroSub">{copy.heroSub}</p>

          <section className="frame" aria-labelledby="frame-title">
            <h2 id="frame-title">{copy.frameTitle}</h2>
            <p>{copy.frameBody}</p>
          </section>

          <div className="sectionGrid">
            {sectionKeys.map((key) => (
              <section key={key} className="sectionCard">
                <h2>{copy.sections[key].title}</h2>
                <ul>
                  {copy.sections[key].items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className="testCard" aria-labelledby="test-title">
            <h2 id="test-title">{copy.testTitle}</h2>
            <ol>
              {copy.testSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <div className="ctaRow">
            <Link href="/contact" className="ctaPrimary">
              {copy.ctaFeedback}
            </Link>
            <Link href="/labs/nl-vision" className="ctaSecondary">
              {copy.ctaVision}
            </Link>
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
          width: min(900px, calc(100% - 48px));
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
        .modId {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 10px;
          color: #3ecf9a;
          display: block;
          margin-bottom: 12px;
        }
        .cli {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
          color: #3ecf9a;
          margin-bottom: 12px;
        }
        .kicker {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #71717a;
          margin-bottom: 10px;
        }
        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 42px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .heroSub {
          margin-top: 14px;
          max-width: 640px;
          font-size: 16px;
          line-height: 1.6;
          color: #a1a1aa;
        }
        .frame {
          margin-top: 32px;
          border: 1px solid #27272a;
          border-radius: 6px;
          background: #0c0c0e;
          padding: 24px;
        }
        .frame h2,
        .sectionCard h2,
        .testCard h2 {
          margin: 0 0 12px;
          font-size: 15px;
          font-weight: 700;
        }
        .frame p {
          margin: 0;
          color: #a1a1aa;
          line-height: 1.6;
        }
        .sectionGrid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .sectionCard {
          border: 1px solid #27272a;
          border-radius: 6px;
          background: #0c0c0e;
          padding: 20px;
        }
        .sectionCard ul,
        .testCard ol {
          margin: 0;
          padding-left: 18px;
          color: #a1a1aa;
          line-height: 1.65;
        }
        .sectionCard li + li,
        .testCard li + li {
          margin-top: 6px;
        }
        .testCard {
          margin-top: 16px;
          border: 1px solid #27272a;
          border-radius: 6px;
          background: #0c0c0e;
          padding: 24px;
        }
        .ctaRow {
          margin-top: 28px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .ctaPrimary,
        .ctaSecondary {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          padding: 0 20px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }
        .ctaPrimary {
          background: #3ecf9a;
          color: #09090b;
        }
        .ctaSecondary {
          border: 1px solid #3f3f46;
          color: #fafafa;
        }
        .ctaSecondary:hover {
          border-color: #3ecf9a;
          color: #3ecf9a;
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
            width: min(100% - 28px, 900px);
          }
          .topnav {
            max-width: min(100% - 28px, 1100px);
          }
          .navRight {
            width: 100%;
            margin-left: 0;
            justify-content: space-between;
          }
          .sectionGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
