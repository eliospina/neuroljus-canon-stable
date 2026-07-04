import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Lang = "sv" | "en";

export default function Home() {
  const [lang, setLang] = useState<Lang>("sv");

  useEffect(() => {
    try {
      setLang(navigator.language?.toLowerCase().startsWith("sv") ? "sv" : "en");
    } catch {
      setLang("sv");
    }
  }, []);

  const T = useMemo(
    () => ({
      sv: {
        seoTitle: "NeuroLjus - forskningsprototyp för framtidens omsorg",
        seoDesc:
          "Neuroljus är ett integritetsförst forsknings- och prototypprojekt om vårdgivarobservation, kommunikationsstöd och framtida human omsorgsteknik.",
        eyebrow: "Forskningsprototyp · integritet · värdighet",
        title: "Neuroljus",
        subtitle:
          "Ett praktiskt forskningsprojekt för bättre vårdgivarobservation, kommunikationsstöd och etisk AI i icke-talande autism.",
        cta: "Öppna NL-VISION",
        secondaryCta: "Läs projektets historia",
        status:
          "Neuroljus är ett levande forskningsfönster: lyssnar på vårdgivare, formar en observationsmetod och bygger förtroende innan större påståenden.",
        navDemo: "Demo",
        navAbout: "Om",
        navOffer: "Erbjudande",
        navContact: "Kontakt",
        offerKicker: "Vad vi erbjuder nu",
        offerTitle: "Fyra sätt att arbeta med Neuroljus idag",
        offers: [
          {
            title: "Vårdgivarintervjuer",
            body:
              "Korta, varsamma samtal med vårdgivare och stödpersoner om hur observationer, överlämningar och osäkerhet fungerar i verkliga omsorgsmiljöer.",
            action: "Delta i en intervju",
            href: "/contact",
          },
          {
            title: "Observationsmetod v0",
            body:
              "En enkel mall för att dokumentera vad som hände, sammanhanget, vårdgivarens tolkning, osäkerhet och vad som hjälpte.",
            action: "Testa mallen",
            href: "/observation-method",
          },
          {
            title: "NL-VISION-labb",
            body:
              "Ett lokalt prototyplabb för frivilliga visuella signaler. Det används för reflektion, inte för diagnos eller säker tolkning.",
            action: "Öppna labbet",
            href: "/labs/nl-vision",
          },
          {
            title: "Forskningssamarbete",
            body:
              "Samtal med forskare, institutioner och etiska samarbetspartners som vill bygga evidens innan produktutveckling.",
            action: "Starta dialog",
            href: "/contact",
          },
        ],
        offerFoot:
          "Dagens erbjudande är medvetet smalt: lärande, observation och evidens först. Neuroljus är ännu ingen klinisk produkt, ingen diagnos och ingen automatiserad tolkning.",
        thesisTitle: "Fött ur verklig omsorg",
        thesis:
          "Elizabeths erfarenhet som ekonom och vårdgivare är där Neuroljus börjar: förstahandskunskap om hinder som autistiska personer möter, vårdgivares ansvar och förmånen att ha följt dussintals familjer genom stödprocesser i Sverige.",
        horizonTitle: "Långsiktig horisont",
        horizon:
          "Inte framtid som fantasi, utan som ansvar: hur kan AI, robotik och omsorgssystem utvecklas utan att förlora samtycke, relation, evidens eller människan i centrum?",
        modelTitle: "Inom-person över tid",
        model:
          "Neuroljus söker inte universella svar om autism. Det utforskar hur strukturerade observationer över tid kan hjälpa vårdgivare se individuella mönster med mer omsorg och mindre gissning.",
        robotTitle: "Robotik som horisont",
        robot:
          "Framtida robotar kan en dag stödja rutin, miljö, trygg överföring och kommunikation. I Neuroljus måste varje sådant steg bygga på samtycke, integritet, evidens och mänsklig närvaro.",
        actionKicker: "Arbetet nu",
        actionTitle: "Från bättre observation till bättre omsorg",
        actionIntro:
          "Neuroljus ska inte låtsas vara färdigt innan det har förtjänat förtroende. Det offentliga arbetet nu är att lyssna, testa varsamt och låta evidens avgöra vad projektet får bli.",
        actionSteps: [
          "Lyssna på vårdgivare och familjer som känner vardagens verklighet.",
          "Omvandla levd erfarenhet till en tydlig observationsmetod.",
          "Testa om strukturerade anteckningar och frivilliga lokala signaler hjälper reflektion över tid.",
          "Bygga varje framtida steg på integritet, samtycke, professionell granskning och mänsklig närvaro.",
        ],
        boundariesTitle: "Det Neuroljus inte påstår idag",
        boundaries: [
          "Ingen diagnos och inga medicinska råd idag.",
          "Ingen säker tolkning av inre tillstånd från kamera eller AI.",
          "Ingen ersättning av vårdgivare, familj eller professionell omsorg.",
          "Alla framtida kliniska eller diagnostiska vägar kräver evidens, professionell granskning och reglering.",
        ],
        labTitle: "Nuvarande tekniska artefakt",
        lab:
          "NL-VISION är ett lokalt observationsdemo för ansikte, händer och enkla signaler. Det är inte validerat för att tolka smärta, känslor, behov eller kommunikation.",
        collabTitle: "För forskare, institutioner och samarbetspartners",
        collab:
          "Neuroljus är öppet för samtal om etik, observation, neurodivergens, omsorgsteknik och framtida validering. Den aktiva produktutvecklingen förblir pausad tills tydliga kriterier är uppfyllda.",
        footer:
          "Neuroljus är ett oberoende forsknings- och portfolioprojekt av Elizabeth Ospina.",
      },
      en: {
        seoTitle: "NeuroLjus - research prototype for future care",
        seoDesc:
          "Neuroljus is a privacy-first research and prototype project for caregiver observation, communication support, and humane future care technology.",
        eyebrow: "Research prototype · privacy · dignity",
        title: "Neuroljus",
        subtitle:
          "A practical research project for better caregiver observation, communication support, and ethical AI in non-speaking autism.",
        cta: "Open NL-VISION",
        secondaryCta: "Read the origin story",
        status:
          "Neuroljus is a living research window: listening to caregivers, shaping an observation method, and earning trust before making larger claims.",
        navDemo: "Demo",
        navAbout: "About",
        navOffer: "Offer",
        navContact: "Contact",
        offerKicker: "What we offer now",
        offerTitle: "Four ways to work with Neuroljus today",
        offers: [
          {
            title: "Caregiver interviews",
            body:
              "Short, careful conversations with caregivers and support people about how observation, handoffs, and uncertainty work in real care settings.",
            action: "Join an interview",
            href: "/contact",
          },
          {
            title: "Observation method v0",
            body:
              "A simple template for documenting what happened, the context, caregiver interpretation, uncertainty, and what helped.",
            action: "Try the template",
            href: "/observation-method",
          },
          {
            title: "NL-VISION lab",
            body:
              "A local prototype lab for optional visual signals. It is used for reflection, not for diagnosis or certain interpretation.",
            action: "Open the lab",
            href: "/labs/nl-vision",
          },
          {
            title: "Research collaboration",
            body:
              "Conversations with researchers, institutions, and ethical collaborators who want to build evidence before product development.",
            action: "Start a dialogue",
            href: "/contact",
          },
        ],
        offerFoot:
          "Today's offer is intentionally narrow: learning, observation, and evidence first. Neuroljus is not yet a clinical product, diagnosis, or automated interpretation system.",
        thesisTitle: "Born from real care",
        thesis:
          "Neuroljus begins where Elizabeth's work as an economist and caregiver meet: first-hand knowledge of the barriers autistic people face, the pressure carried by caregivers, and the privilege of accompanying dozens of families through support processes in Sweden.",
        horizonTitle: "Long-term horizon",
        horizon:
          "Not the future as fantasy, but as responsibility: how can AI, robotics, and care systems evolve without losing consent, relationship, evidence, or the human at the center?",
        modelTitle: "Within-person, over time",
        model:
          "Neuroljus is not searching for universal answers about autism. It explores whether structured observations over time can help caregivers see individual patterns with more care and less guesswork.",
        robotTitle: "Robotics as a horizon",
        robot:
          "Future robots may one day support routine, environment, safe handoffs, and communication. In Neuroljus, every such step must be grounded in consent, privacy, evidence, and human presence.",
        actionKicker: "The work now",
        actionTitle: "From better observation to better care",
        actionIntro:
          "Neuroljus should not pretend to be finished before it has earned trust. The public work now is to listen, test carefully, and let evidence decide what the project is allowed to become.",
        actionSteps: [
          "Listen to caregivers and families who know the daily reality.",
          "Turn lived experience into a clear observation method.",
          "Test whether structured notes and optional local signals improve reflection over time.",
          "Build every future step on privacy, consent, professional review, and human presence.",
        ],
        boundariesTitle: "What Neuroljus does not claim today",
        boundaries: [
          "No diagnosis and no medical advice today.",
          "No certainty about inner states from cameras or AI.",
          "No replacement of caregivers, family, or professional care.",
          "Any future clinical or diagnostic path requires evidence, professional review, and regulation.",
        ],
        labTitle: "Current technical artifact",
        lab:
          "NL-VISION is a local observation demo for face, hands, and simple signals. It is not validated to interpret pain, emotion, needs, or communication.",
        collabTitle: "For researchers, institutions, and collaborators",
        collab:
          "Neuroljus is open to conversations about ethics, observation, neurodivergence, care technology, and future validation. Active product development remains paused until clear criteria are met.",
        footer:
          "Neuroljus is an independent research and portfolio project by Elizabeth Ospina.",
      },
    }),
    []
  );

  const isSV = lang === "sv";
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

          <nav className="nav" aria-label={isSV ? "Primär" : "Primary"}>
            <a href="/labs/nl-vision">{copy.navDemo}</a>
            <a href="/about">{copy.navAbout}</a>
            <a href="#offer">{copy.navOffer}</a>
            <a href="/contact">{copy.navContact}</a>
          </nav>

          <div className="langToggle" role="group" aria-label="Language">
            <button onClick={() => setLang("sv")} aria-pressed={isSV}>
              SV
            </button>
            <button onClick={() => setLang("en")} aria-pressed={!isSV}>
              EN
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
              <p className="sectionKicker">{isSV ? "Kärna" : "Core"}</p>
              <h2 id="thesis-title">{copy.thesisTitle}</h2>
            </div>
            <p>{copy.thesis}</p>
          </section>

          <section className="shell horizon" aria-label={isSV ? "Forskningshorisont" : "Research horizon"}>
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
            <p className="sectionKicker">{isSV ? "Samarbete" : "Collaboration"}</p>
            <h2 id="collab-title">{copy.collabTitle}</h2>
            <p>{copy.collab}</p>
            <a className="primaryCta" href="/contact">
              {copy.navContact}
            </a>
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
