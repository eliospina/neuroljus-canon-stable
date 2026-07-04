import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Lang = "sv" | "en" | "es";

export default function Home() {
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
        seoTitle: "NeuroLjus - icke-diagnostisk forskning för framtidens omsorg",
        seoDesc:
          "Neuroljus är ett integritetsförst, icke-diagnostiskt forskningsprojekt som söker klinisk-vetenskaplig förankring för framtidens omsorgsteknik.",
        primaryNav: "Primär",
        coreKicker: "Kärna",
        horizonAria: "Forskningshorisont",
        collabKicker: "Samarbete",
        eyebrow: "Icke-diagnostiskt · integritet · vetenskap före produkt",
        title: "Neuroljus",
        subtitle:
          "Ett oberoende projekt fött ur verklig omsorg, byggt för att hjälpa människor observera bättre, dokumentera bättre och skapa en etisk väg mot framtida AI och omsorgsrobotik.",
        cta: "Öppna NL-VISION",
        whitepaperCta: "Läs white paper",
        whitepaperHref: "https://doi.org/10.5281/zenodo.20775583",
        secondaryCta: "Läs projektets historia",
        status:
          "Neuroljus passerar inte den kliniska gränsen på egen hand: ingen diagnos, ingen säker tolkning av inre tillstånd och ingen oberoende mänsklig validering med känsliga data utan rätt forskningshuvudman, etikprövning när den krävs och starkt dataskydd.",
        navDemo: "Demo",
        navAbout: "Om",
        navOffer: "Nu",
        navContact: "Kontakt",
        offerKicker: "Vad som finns idag",
        offerTitle: "Ett smalt, ärligt erbjudande",
        offers: [
          {
            title: "Varsamma vårdgivarsamtal",
            body:
              "Korta samtal om vardagens observationer, överlämningar och osäkerhet. Inte klinisk validering, inte insamling av känsliga vårddata.",
            action: "Starta samtal",
            href: "/contact",
          },
          {
            title: "Observationsmetod v0",
            body:
              "En enkel struktur för att skilja vad som hände, sammanhanget, vårdgivarens tolkning, osäkerhet och vad som faktiskt hjälpte.",
            action: "Testa mallen",
            href: "/observation-method",
          },
          {
            title: "NL-VISION-labb",
            body:
              "Ett lokalt prototyplabb för valfria visuella signaler. Det används för reflektion och teknisk demonstration, inte för diagnos eller säker tolkning.",
            action: "Öppna labbet",
            href: "/labs/nl-vision",
          },
          {
            title: "Klinisk-vetenskaplig förankring",
            body:
              "Samtal med universitet, forskare, kliniska miljöer och etiska samarbetspartners som kan hjälpa Neuroljus bli granskat på rätt sätt.",
            action: "Starta dialog",
            href: "/contact",
          },
        ],
        offerFoot:
          "Dagens erbjudande är medvetet begränsat: språk, observation, teknisk prototyp och forskningsdialog. Neuroljus är inte en klinisk produkt, inte en diagnos och inte ett automatiserat tolkningssystem.",
        thesisTitle: "Fött ur verklig omsorg",
        thesis:
          "Elizabeths erfarenhet som ekonom och vårdgivare är inte bakgrundsdekoration. Den är källan: noggrann observation, systemförståelse, omsorgsarbete och respekt för det som inte alltid uttrycks genom tal.",
        horizonTitle: "Den långsiktiga frågan",
        horizon:
          "Om framtidens omsorg en dag inkluderar AI och robotar, vem lär dem vad värdighet betyder? Neuroljus börjar där ansvaret är minst och störst: en person, ett sammanhang, en observation, en gräns.",
        modelTitle: "Inom-person över tid",
        model:
          "Neuroljus söker inte universella svar om autism. Det utforskar hur strukturerade observationer över tid kan hjälpa vårdgivare se individuella mönster med mer omsorg och mindre gissning.",
        robotTitle: "Robotik som horisont",
        robot:
          "Framtida robotar kan en dag stödja rutiner, miljö, trygg överföring och kommunikation. I Neuroljus får tekniken bara växa där samtycke, integritet, evidens och mänsklig närvaro följer med.",
        actionKicker: "Vägen framåt",
        actionTitle: "Bygg bara där tillstånd, evidens och värdighet bär",
        actionIntro:
          "Nästa steg är inte att skala en produkt. Nästa steg är att hitta rätt institutionellt hem, rätt vetenskapliga ankare och rätt skydd innan Neuroljus närmar sig mänsklig validering.",
        actionSteps: [
          "Hålla NL-VISION lokalt, frivilligt, icke-diagnostiskt och tydligt märkt som prototyp.",
          "Dela white paper med universitet och forskare som kan ge klinisk-vetenskaplig förankring.",
          "Förbereda dataskydd, samtycke, riskanalys och etikprövning innan känslig mänsklig validering.",
          "Låta evidens avgöra vad Neuroljus får bli, även om svaret blir smalare än visionen.",
        ],
        boundariesTitle: "Det Neuroljus inte påstår idag",
        boundaries: [
          "Ingen diagnos och inga medicinska råd idag.",
          "Ingen säker tolkning av inre tillstånd från kamera eller AI.",
          "Ingen oberoende klinisk studie eller validering med känsliga persondata.",
          "Ingen ersättning av vårdgivare, familj eller professionell omsorg.",
          "Alla framtida kliniska eller diagnostiska vägar kräver evidens, forskningsansvar, etik, dataskydd och reglering.",
        ],
        labTitle: "Nuvarande tekniska artefakt",
        lab:
          "NL-VISION är ett lokalt observationsdemo för ansikte, händer och enkla signaler. Det är inte validerat för att tolka smärta, känslor, behov eller kommunikation.",
        collabTitle: "För universitet, forskare och etiska samarbetspartners",
        collab:
          "Neuroljus söker en klinisk-vetenskaplig ankare: en miljö där levd erfarenhet, teknik, autismforskning, dataskydd och etik kan mötas utan att gå före människorna projektet vill tjäna.",
        footer:
          "Neuroljus är ett oberoende forsknings- och portfolioprojekt av Elizabeth Ospina.",
      },
      en: {
        seoTitle: "NeuroLjus - non-diagnostic research for future care",
        seoDesc:
          "Neuroljus is a privacy-first, non-diagnostic research project seeking a clinical-science anchor for humane future care technology.",
        primaryNav: "Primary",
        coreKicker: "Core",
        horizonAria: "Research horizon",
        collabKicker: "Collaboration",
        eyebrow: "Non-diagnostic · privacy · science before product",
        title: "Neuroljus",
        subtitle:
          "An independent project born from real care, built to help people observe better, document better, and create an ethical path toward future AI and care robotics.",
        cta: "Open NL-VISION",
        whitepaperCta: "Read the white paper",
        whitepaperHref: "https://doi.org/10.5281/zenodo.20775583",
        secondaryCta: "Read the origin story",
        status:
          "Neuroljus does not cross the clinical line on its own: no diagnosis, no certainty about inner states, and no independent human validation with sensitive data without the right research principal, ethical review when required, and strong data protection.",
        navDemo: "Demo",
        navAbout: "About",
        navOffer: "Now",
        navContact: "Contact",
        offerKicker: "What exists today",
        offerTitle: "A narrow, honest offer",
        offers: [
          {
            title: "Careful caregiver conversations",
            body:
              "Short conversations about daily observation, handoffs, and uncertainty. Not clinical validation, and not collection of sensitive care data.",
            action: "Start a conversation",
            href: "/contact",
          },
          {
            title: "Observation method v0",
            body:
              "A simple structure for separating what happened, the context, caregiver interpretation, uncertainty, and what actually helped.",
            action: "Try the template",
            href: "/observation-method",
          },
          {
            title: "NL-VISION lab",
            body:
              "A local prototype lab for optional visual signals. It is for reflection and technical demonstration, not diagnosis or certain interpretation.",
            action: "Open the lab",
            href: "/labs/nl-vision",
          },
          {
            title: "Clinical-science anchor",
            body:
              "Dialogue with universities, researchers, clinical environments, and ethical collaborators who can help Neuroljus be evaluated properly.",
            action: "Start a dialogue",
            href: "/contact",
          },
        ],
        offerFoot:
          "Today's offer is intentionally limited: language, observation, technical prototype, and research dialogue. Neuroljus is not a clinical product, diagnosis, or automated interpretation system.",
        thesisTitle: "Born from real care",
        thesis:
          "Elizabeth's caregiver experience is not background decoration. It is the source material: careful observation, systems knowledge, care work, and respect for what is not always expressed through speech.",
        horizonTitle: "The long-term question",
        horizon:
          "If future care one day includes AI and robots, who teaches them what dignity means? Neuroljus begins where responsibility is smallest and largest: one person, one context, one observation, one boundary.",
        modelTitle: "Within-person, over time",
        model:
          "Neuroljus is not searching for universal answers about autism. It explores whether structured observations over time can help caregivers see individual patterns with more care and less guesswork.",
        robotTitle: "Robotics as a horizon",
        robot:
          "Future robots may one day support routines, environment, safe handoffs, and communication. In Neuroljus, technology may only grow where consent, privacy, evidence, and human presence grow with it.",
        actionKicker: "The path forward",
        actionTitle: "Build only where permission, evidence, and dignity can hold",
        actionIntro:
          "The next step is not scaling a product. The next step is finding the right institutional home, scientific anchor, and protections before Neuroljus approaches human validation.",
        actionSteps: [
          "Keep NL-VISION local, optional, non-diagnostic, and clearly marked as a prototype.",
          "Share the white paper with universities and researchers who can provide clinical-science grounding.",
          "Prepare data protection, consent, risk review, and ethical review before sensitive human validation.",
          "Let evidence decide what Neuroljus is allowed to become, even if the answer is narrower than the vision.",
        ],
        boundariesTitle: "What Neuroljus does not claim today",
        boundaries: [
          "No diagnosis and no medical advice today.",
          "No certainty about inner states from cameras or AI.",
          "No independent clinical study or validation with sensitive personal data.",
          "No replacement of caregivers, family, or professional care.",
          "Any future clinical or diagnostic path requires evidence, research responsibility, ethics, data protection, and regulation.",
        ],
        labTitle: "Current technical artifact",
        lab:
          "NL-VISION is a local observation demo for face, hands, and simple signals. It is not validated to interpret pain, emotion, needs, or communication.",
        collabTitle: "For universities, researchers, and ethical collaborators",
        collab:
          "Neuroljus is seeking a clinical-science anchor: a place where lived experience, technology, autism research, data protection, and ethics can meet without moving faster than the people this project exists to serve.",
        footer:
          "Neuroljus is an independent research and portfolio project by Elizabeth Ospina.",
      },
      es: {
        seoTitle: "NeuroLjus - investigación no diagnóstica para el cuidado futuro",
        seoDesc:
          "Neuroljus es un proyecto independiente, no diagnóstico y centrado en privacidad que busca anclaje clínico-científico para tecnología humana de cuidado.",
        primaryNav: "Principal",
        coreKicker: "Núcleo",
        horizonAria: "Horizonte de investigación",
        collabKicker: "Colaboración",
        eyebrow: "No diagnóstico · privacidad · ciencia antes que producto",
        title: "Neuroljus",
        subtitle:
          "Un proyecto independiente nacido del cuidado real, construido para observar mejor, documentar mejor y abrir un camino ético hacia futura IA y robótica de cuidado.",
        cta: "Abrir NL-VISION",
        whitepaperCta: "Leer el white paper",
        whitepaperHref: "https://doi.org/10.5281/zenodo.20775583",
        secondaryCta: "Leer la historia",
        status:
          "Neuroljus no cruza por cuenta propia la frontera clínica: no diagnostica, no afirma certeza sobre estados internos y no hace validación humana independiente con datos sensibles sin responsable de investigación, revisión ética cuando corresponda y protección estricta de datos.",
        navDemo: "Demo",
        navAbout: "Sobre",
        navOffer: "Ahora",
        navContact: "Contacto",
        offerKicker: "Lo que existe hoy",
        offerTitle: "Una oferta estrecha y honesta",
        offers: [
          {
            title: "Conversaciones cuidadosas con cuidadores",
            body:
              "Diálogos breves sobre observación diaria, traspasos e incertidumbre. No son validación clínica ni recolección de datos sensibles de cuidado.",
            action: "Iniciar conversación",
            href: "/contact",
          },
          {
            title: "Método de observación v0",
            body:
              "Una estructura simple para separar qué pasó, el contexto, la interpretación del cuidador, la incertidumbre y qué ayudó realmente.",
            action: "Probar la plantilla",
            href: "/observation-method",
          },
          {
            title: "Laboratorio NL-VISION",
            body:
              "Un prototipo local para señales visuales opcionales. Sirve para reflexión y demostración técnica, no para diagnóstico ni interpretación segura.",
            action: "Abrir el laboratorio",
            href: "/labs/nl-vision",
          },
          {
            title: "Anclaje clínico-científico",
            body:
              "Diálogo con universidades, investigadores, entornos clínicos y aliados éticos que puedan ayudar a evaluar Neuroljus correctamente.",
            action: "Iniciar diálogo",
            href: "/contact",
          },
        ],
        offerFoot:
          "La oferta de hoy es intencionalmente limitada: lenguaje, observación, prototipo técnico y diálogo de investigación. Neuroljus no es un producto clínico, diagnóstico ni sistema de interpretación automática.",
        thesisTitle: "Nacido del cuidado real",
        thesis:
          "La experiencia de Elizabeth como cuidadora no es decoración de fondo. Es la fuente: observación cuidadosa, conocimiento de sistemas, trabajo de cuidado y respeto por lo que no siempre se expresa con palabras.",
        horizonTitle: "La pregunta a largo plazo",
        horizon:
          "Si el cuidado del futuro algún día incluye IA y robots, ¿quién les enseña lo que significa dignidad? Neuroljus empieza donde la responsabilidad es pequeña y enorme: una persona, un contexto, una observación, un límite.",
        modelTitle: "Dentro de una persona, a través del tiempo",
        model:
          "Neuroljus no busca respuestas universales sobre el autismo. Explora si las observaciones estructuradas en el tiempo pueden ayudar a cuidadores a ver patrones individuales con más cuidado y menos suposición.",
        robotTitle: "La robótica como horizonte",
        robot:
          "Los robots futuros podrían apoyar rutinas, ambiente, traspasos seguros y comunicación. En Neuroljus, la tecnología solo debe crecer donde también crezcan el consentimiento, la privacidad, la evidencia y la presencia humana.",
        actionKicker: "El camino ahora",
        actionTitle: "Construir solo donde permiso, evidencia y dignidad puedan sostenerlo",
        actionIntro:
          "El próximo paso no es escalar un producto. El próximo paso es encontrar el hogar institucional correcto, el anclaje científico y las protecciones necesarias antes de acercarse a una validación humana.",
        actionSteps: [
          "Mantener NL-VISION local, opcional, no diagnóstico y claramente marcado como prototipo.",
          "Compartir el white paper con universidades e investigadores que puedan dar base clínico-científica.",
          "Preparar protección de datos, consentimiento, análisis de riesgos y revisión ética antes de una validación humana sensible.",
          "Dejar que la evidencia decida en qué puede convertirse Neuroljus, incluso si la respuesta es más estrecha que la visión.",
        ],
        boundariesTitle: "Lo que Neuroljus no afirma hoy",
        boundaries: [
          "No diagnóstico y no consejo médico hoy.",
          "No certeza sobre estados internos a partir de cámaras o IA.",
          "No estudio clínico independiente ni validación con datos personales sensibles.",
          "No reemplazo de cuidadores, familia ni atención profesional.",
          "Cualquier camino clínico o diagnóstico futuro exige evidencia, responsabilidad investigadora, ética, protección de datos y regulación.",
        ],
        labTitle: "Artefacto técnico actual",
        lab:
          "NL-VISION es una demo local de observación de rostro, manos y señales simples. No está validada para interpretar dolor, emociones, necesidades o comunicación.",
        collabTitle: "Para universidades, investigadores y aliados éticos",
        collab:
          "Neuroljus busca un anclaje clínico-científico: un lugar donde experiencia vivida, tecnología, investigación en autismo, protección de datos y ética puedan encontrarse sin ir más rápido que las personas a quienes este proyecto quiere servir.",
        footer:
          "Neuroljus es un proyecto independiente de investigación y portafolio de Elizabeth Ospina.",
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
        <meta property="og:title" content={copy.seoTitle} />
        <meta property="og:description" content={copy.seoDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/brand/neuroljus-logo.svg" />
        <meta name="theme-color" content="#f5faf7" />
      </Head>

      <div className="page">
        <header className="shell header" role="banner">
          <a className="brand" href="/" aria-label="NeuroLjus home">
            <Image
              src="/brand/neuroljus-logo.svg"
              alt="NeuroLjus"
              width={42}
              height={42}
              priority
              className="brandLogo"
            />
            <span className="brandName">NeuroLjus</span>
          </a>

          <nav className="nav" aria-label={copy.primaryNav}>
            <a href="/labs/nl-vision">{copy.navDemo}</a>
            <a href="/about">{copy.navAbout}</a>
            <a href="#offer">{copy.navOffer}</a>
            <a href="/contact">{copy.navContact}</a>
          </nav>

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
        </header>

        <main>
          <section className="hero shell" aria-labelledby="hero-title">
            <div className="heroCopy">
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1 id="hero-title">{copy.title}</h1>
              <p className="subtitle">{copy.subtitle}</p>
              <div className="actions">
                <a className="primaryCta" href="/labs/nl-vision">
                  {copy.cta}
                </a>
                <a className="textCta" href="/about">
                  {copy.secondaryCta}
                </a>
                <a className="textCta" href={copy.whitepaperHref}>
                  {copy.whitepaperCta}
                </a>
              </div>
              <p className="status">{copy.status}</p>
            </div>

            <div className="heroMark" aria-hidden="true">
              <Image
                src="/brand/neuroljus-logo.svg"
                alt=""
                width={720}
                height={720}
                priority
                className="markImage"
              />
            </div>
          </section>

          <section className="shell thesisBand" aria-labelledby="thesis-title">
            <div>
              <p className="sectionKicker">{copy.coreKicker}</p>
              <h2 id="thesis-title">{copy.thesisTitle}</h2>
            </div>
            <p>{copy.thesis}</p>
          </section>

          <section className="shell horizon" aria-label={copy.horizonAria}>
            <article>
              <span>01</span>
              <h3>{copy.modelTitle}</h3>
              <p>{copy.model}</p>
            </article>
            <article>
              <span>02</span>
              <h3>{copy.horizonTitle}</h3>
              <p>{copy.horizon}</p>
            </article>
            <article>
              <span>03</span>
              <h3>{copy.robotTitle}</h3>
              <p>{copy.robot}</p>
            </article>
          </section>

          <section className="shell actionBand" aria-labelledby="action-title">
            <div>
              <p className="sectionKicker">{copy.actionKicker}</p>
              <h2 id="action-title">{copy.actionTitle}</h2>
              <p>{copy.actionIntro}</p>
            </div>
            <ol>
              {copy.actionSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section id="offer" className="shell offerSection" aria-labelledby="offer-title">
            <div className="offerIntro">
              <p className="sectionKicker">{copy.offerKicker}</p>
              <h2 id="offer-title">{copy.offerTitle}</h2>
              <p>{copy.offerFoot}</p>
            </div>
            <div className="offerGrid">
              {copy.offers.map((offer) => (
                <article key={offer.title} className="offerCard">
                  <h3>{offer.title}</h3>
                  <p>{offer.body}</p>
                  <a className="textCta" href={offer.href}>
                    {offer.action}
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className="shell evidenceGrid">
            <div className="labPanel">
              <p className="sectionKicker">NL-VISION</p>
              <h2>{copy.labTitle}</h2>
              <p>{copy.lab}</p>
              <a className="textCta" href="/labs/nl-vision">
                {copy.cta}
              </a>
            </div>

            <div className="boundaryPanel">
              <h2>{copy.boundariesTitle}</h2>
              <ul>
                {copy.boundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="shell collaborators" aria-labelledby="collab-title">
            <p className="sectionKicker">{copy.collabKicker}</p>
            <h2 id="collab-title">{copy.collabTitle}</h2>
            <p>{copy.collab}</p>
            <div className="collabActions">
              <a className="primaryCta" href="/contact">
                {copy.navContact}
              </a>
              <a className="textCta" href={copy.whitepaperHref}>
                {copy.whitepaperCta}
              </a>
            </div>
          </section>
        </main>

        <footer className="shell footer" role="contentinfo">
          {copy.footer}
        </footer>
      </div>

      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }
        .page {
          min-height: 100dvh;
          color: #17202f;
          background:
            linear-gradient(145deg, rgba(245, 250, 247, 0.96), rgba(235, 245, 245, 0.92)),
            linear-gradient(90deg, #f5faf7 0%, #eef7f2 44%, #f3f0fb 100%);
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }
        .shell {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
        }
        .header {
          min-height: 76px;
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: inherit;
          text-decoration: none;
        }
        .brandLogo {
          filter: drop-shadow(0 8px 22px rgba(31, 111, 111, 0.18));
        }
        .brandName {
          font-size: 18px;
          font-weight: 760;
        }
        .nav {
          margin-left: auto;
          display: flex;
          gap: 20px;
          font-size: 14px;
        }
        .nav a,
        .textCta {
          color: #245b62;
          font-weight: 700;
          text-decoration: none;
        }
        .nav a:hover,
        .textCta:hover {
          text-decoration: underline;
        }
        .langToggle {
          display: flex;
          gap: 6px;
        }
        .langToggle button {
          min-width: 42px;
          min-height: 34px;
          border: 1px solid rgba(36, 91, 98, 0.22);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.72);
          color: #245b62;
          cursor: pointer;
          font-weight: 700;
        }
        .langToggle button[aria-pressed="true"] {
          background: #17202f;
          color: #f7fbf8;
        }
        .hero {
          position: relative;
          min-height: 64vh;
          display: grid;
          grid-template-columns: minmax(0, 0.98fr) minmax(280px, 0.72fr);
          gap: 42px;
          align-items: center;
          padding: 44px 0 32px;
          overflow: hidden;
        }
        .heroCopy {
          position: relative;
          z-index: 1;
        }
        .eyebrow,
        .sectionKicker {
          margin: 0 0 12px;
          color: #6b4ea4;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        h1,
        h2,
        h3,
        p {
          overflow-wrap: anywhere;
        }
        h1 {
          margin: 0;
          max-width: 720px;
          font-size: clamp(48px, 8vw, 102px);
          line-height: 0.92;
          letter-spacing: 0;
        }
        .subtitle {
          max-width: 720px;
          margin: 22px 0 0;
          color: #405064;
          font-size: 21px;
          line-height: 1.45;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px;
          margin-top: 28px;
        }
        .primaryCta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border: 1px solid rgba(23, 32, 47, 0.14);
          border-radius: 8px;
          background: #17202f;
          color: #f8fffb;
          box-shadow: 0 10px 26px rgba(23, 32, 47, 0.16);
          font-weight: 800;
          text-decoration: none;
        }
        .status {
          max-width: 680px;
          margin: 22px 0 0;
          color: #5a6678;
          font-size: 14px;
        }
        .heroMark {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 360px;
        }
        .markImage {
          width: min(100%, 480px);
          height: auto;
          filter: drop-shadow(0 22px 48px rgba(31, 111, 111, 0.18));
        }
        .thesisBand {
          display: grid;
          grid-template-columns: 0.74fr 1.26fr;
          gap: 38px;
          padding: 34px 0;
          border-top: 1px solid rgba(23, 32, 47, 0.12);
          border-bottom: 1px solid rgba(23, 32, 47, 0.12);
        }
        .thesisBand h2,
        .offerIntro h2,
        .labPanel h2,
        .boundaryPanel h2,
        .collaborators h2 {
          margin: 0;
          font-size: 28px;
          line-height: 1.12;
        }
        .thesisBand p,
        .offerIntro p,
        .offerCard p,
        .labPanel p,
        .collaborators p {
          margin: 0;
          color: #405064;
          font-size: 17px;
          line-height: 1.62;
        }
        .horizon {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 28px 0;
        }
        .actionBand {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 24px;
          align-items: start;
          margin-bottom: 16px;
          border: 1px solid rgba(23, 32, 47, 0.12);
          border-radius: 8px;
          background: #17202f;
          color: #f8fffb;
          padding: 26px;
        }
        .actionBand h2 {
          margin: 0;
          font-size: 28px;
          line-height: 1.12;
        }
        .actionBand p {
          margin: 12px 0 0;
          color: #dbe8e3;
          line-height: 1.58;
        }
        .actionBand .sectionKicker {
          color: #9fe8cf;
        }
        .actionBand ol {
          display: grid;
          gap: 12px;
          margin: 0;
          padding-left: 20px;
          color: #eef8f3;
          line-height: 1.5;
        }
        .horizon article,
        .offerCard,
        .labPanel,
        .boundaryPanel {
          border: 1px solid rgba(23, 32, 47, 0.12);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.64);
          padding: 22px;
        }
        .horizon span {
          color: #2f7f6f;
          font-weight: 800;
          font-size: 13px;
        }
        .horizon h3 {
          margin: 14px 0 10px;
          font-size: 21px;
        }
        .horizon p {
          margin: 0;
          color: #4f5f70;
          line-height: 1.55;
        }
        .evidenceGrid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 16px;
        }
        .offerSection {
          padding: 14px 0 28px;
        }
        .offerIntro {
          max-width: 760px;
          margin-bottom: 18px;
        }
        .offerGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .offerCard {
          display: flex;
          flex-direction: column;
          min-height: 260px;
        }
        .offerCard h3 {
          margin: 0 0 10px;
          font-size: 20px;
          line-height: 1.15;
        }
        .offerCard p {
          margin-bottom: 18px;
          font-size: 15px;
        }
        .offerCard .textCta {
          margin-top: auto;
        }
        .labPanel p {
          margin: 12px 0 18px;
        }
        .boundaryPanel ul {
          display: grid;
          gap: 10px;
          padding-left: 20px;
          margin: 16px 0 0;
          color: #405064;
          line-height: 1.5;
        }
        .collaborators {
          padding: 38px 0 32px;
        }
        .collaborators p {
          max-width: 820px;
          margin: 12px 0 22px;
        }
        .collabActions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px;
        }
        .footer {
          padding: 24px 0 34px;
          color: #667286;
          font-size: 13px;
        }
        @media (max-width: 900px) {
          .shell {
            width: min(100% - 28px, 1120px);
          }
          .header {
            flex-wrap: wrap;
            padding: 12px 0;
          }
          .nav {
            order: 3;
            width: 100%;
            margin-left: 0;
          }
          .langToggle {
            margin-left: auto;
          }
          .hero,
          .thesisBand,
          .horizon,
          .actionBand,
          .offerGrid,
          .evidenceGrid {
            grid-template-columns: 1fr;
          }
          .offerCard {
            min-height: auto;
          }
          .hero {
            min-height: auto;
            gap: 8px;
            padding-top: 22px;
          }
          .subtitle {
            font-size: 18px;
          }
          .heroMark {
            min-height: 180px;
            justify-content: flex-start;
          }
          .markImage {
            width: min(260px, 70vw);
          }
        }
      `}</style>
    </>
  );
}
