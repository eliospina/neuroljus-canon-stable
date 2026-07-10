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
        seoTitle: "NeuroLjus - omsorgsintelligens för framtidens hälsa och omsorg",
        seoDesc:
          "Neuroljus är en forskningsförberedd plattform för omsorgsintelligens, vardagsobservation, öppna protokoll och framtida AI- och robotikstöd inom vård och omsorg.",
        primaryNav: "Primär",
        coreKicker: "Kärna",
        horizonAria: "Forskningshorisont",
        collabKicker: "Samarbete",
        eyebrow: "Omsorgsintelligens · svensk omsorgslogik · framtida hälsoteknik",
        title: "Neuroljus",
        subtitle:
          "Neuroljus omvandlar levd omsorgskunskap till strukturerade rutiner, lokala observationer och öppna protokoll för framtida hälsa, forskning och assisterande robotik.",
        cta: "Öppna NL-VISION",
        futureRoomCta: "Gå in i Future Care Room",
        whitepaperCta: "Läs white paper",
        whitepaperHref: "https://doi.org/10.5281/zenodo.20775583",
        secondaryCta: "Läs projektets historia",
        status:
          "Vi bygger de första lagren: språk, metod, lokal prototyp, öppna protokoll och forskningsväg. Visionen är större än en app: omsorgskunskap som en del av framtidens hälsoinfrastruktur.",
        navDemo: "Demo",
        navAbout: "Om",
        navOffer: "Nu",
        navContact: "Kontakt",
        offerKicker: "Vad vi designar nu",
        offerTitle: "Första lagret i framtidens omsorgsintelligens",
        offers: [
          {
            title: "Vårdgivarintelligens",
            body:
              "Vardagens omsorg innehåller expertis. Neuroljus gör observationer, överlämningar och osäkerhet till strukturerat designmaterial.",
            action: "Starta samtal",
            href: "/contact",
          },
          {
            title: "Observationsmetod v0",
            body:
              "En första struktur för att skilja vad som hände, sammanhanget, vårdgivarens tolkning, osäkerhet och vad som faktiskt hjälpte.",
            action: "Testa mallen",
            href: "/observation-method",
          },
          {
            title: "NL-VISION-labb",
            body:
              "Ett lokalt observationslager för valfria visuella signaler, byggt för integritet och framtida forskningsanknytning från första raden kod.",
            action: "Öppna labbet",
            href: "/labs/nl-vision",
          },
          {
            title: "Future Care Room",
            body:
              "En interaktiv vårdrumssimulering där ljus, ljud, avstånd och rytm blir ett levande omsorgsprotokoll för framtida robot- och adapterarbete.",
            action: "Gå in i rummet",
            href: "/labs/future-care-room",
          },
          {
            title: "Klinisk-vetenskaplig förankring",
            body:
              "Dialog med universitet, forskare och kliniska miljöer som kan hjälpa Neuroljus växa mot validerade lager för forskning, diagnostiskt stöd och omsorgsinfrastruktur.",
            action: "Starta dialog",
            href: "/contact",
          },
        ],
        offerFoot:
          "Neuroljus börjar i vardagens omsorg och bygger för större integration: forskning, klinisk vetenskap, välfärdssystem, öppna protokoll och assisterande teknik.",
        thesisTitle: "Fött ur verklig omsorg",
        thesis:
          "Elizabeths erfarenhet som ekonom och vårdgivare är projektets grund: noggrann observation, systemförståelse, omsorgsarbete och respekt för det som inte alltid uttrycks genom tal.",
        horizonTitle: "Den långsiktiga frågan",
        horizon:
          "När framtidens omsorg inkluderar AI, sensorer och robotar behöver de lära sig från verklig omsorg: en person, ett sammanhang, en rutin, ett nästa steg.",
        modelTitle: "Inom-person över tid",
        model:
          "Neuroljus börjar med individuella mönster före universella svar om autism. Det utforskar hur strukturerade observationer över tid kan hjälpa vårdgivare se mer med omsorg och mindre gissning.",
        robotTitle: "Robotik som horisont",
        robot:
          "Assisterande robotik kan stödja rutiner, miljö, överföringar och kommunikation. Neuroljus bygger protokollen som gör sådant stöd begripligt, spårbart och anpassningsbart.",
        actionKicker: "Vägen framåt",
        actionTitle: "Från vardagsomsorg till hälsoinfrastruktur",
        actionIntro:
          "Arbetet nu är att bygga de lager som gör omsorgskunskap användbar för familjer, kommuner, forskning, kliniska partners och framtida omsorgsteknik.",
        actionSteps: [
          "Utveckla observations- och rutinverktyg som passar vardagens omsorg.",
          "Göra protokoll portabla så att forskare, öppna projekt och framtida enheter kan bygga vidare.",
          "Söka universitet och kliniska partners för lager som kräver validering, evidens och forskningsansvar.",
          "Bygga integritet, samtycke, spårbarhet och lokal kontroll som tekniska egenskaper från början.",
        ],
        boundariesTitle: "Designprinciper",
        boundaries: [
          "Vårdgivaren författar rutiner, sammanhang och mål.",
          "Lokala observationer prioriterar integritet och kontroll nära personen.",
          "Osäkerhet sparas som data så att systemet kan lära utan att låtsas veta mer än det vet.",
          "Kliniska och diagnostiska lager utvecklas tillsammans med kvalificerade forsknings- och vårdpartners.",
          "Familj, vårdgivare, professionell omsorg och framtida teknik ingår i samma stödnätverk.",
        ],
        labTitle: "Aktuellt tekniskt lager",
        lab:
          "NL-VISION är ett lokalt observationslager för ansikte, händer och enkla signaler. Det visar hur vardagsnära tekniska signaler kan struktureras för reflektion, forskning och framtida integration.",
        collabTitle: "För universitet, forskare och etiska samarbetspartners",
        collab:
          "Neuroljus söker klinisk-vetenskapliga ankare: miljöer där levd erfarenhet, teknik, autismforskning, dataskydd och svensk omsorgslogik kan bli framtida hälsa- och omsorgsinfrastruktur.",
        footer:
          "Neuroljus är ett oberoende forsknings- och portfolioprojekt av Elizabeth Ospina.",
      },
      en: {
        seoTitle: "NeuroLjus - care intelligence for future health and care",
        seoDesc:
          "Neuroljus is a research-ready care intelligence platform for everyday observation, open protocols, and future AI and robotics support in health and care.",
        primaryNav: "Primary",
        coreKicker: "Core",
        horizonAria: "Research horizon",
        collabKicker: "Collaboration",
        eyebrow: "Care intelligence · Swedish care logic · future health technology",
        title: "Neuroljus",
        subtitle:
          "Neuroljus transforms lived caregiving knowledge into structured routines, local observations, and open protocols for future health, research, and assistive robotics.",
        cta: "Open NL-VISION",
        futureRoomCta: "Enter the Future Care Room",
        whitepaperCta: "Read the white paper",
        whitepaperHref: "https://doi.org/10.5281/zenodo.20775583",
        secondaryCta: "Read the origin story",
        status:
          "We are building the first layers: language, method, local prototype, open protocols, and research path. The vision is larger than an app: caregiving knowledge as part of future health infrastructure.",
        navDemo: "Demo",
        navAbout: "About",
        navOffer: "Now",
        navContact: "Contact",
        offerKicker: "What we design now",
        offerTitle: "The first layer of future care intelligence",
        offers: [
          {
            title: "Caregiver intelligence",
            body:
              "Everyday care contains expertise. Neuroljus turns observations, handoffs, and uncertainty into structured design material.",
            action: "Start a conversation",
            href: "/contact",
          },
          {
            title: "Observation method v0",
            body:
              "A first structure for separating what happened, the context, caregiver interpretation, uncertainty, and what actually helped.",
            action: "Try the template",
            href: "/observation-method",
          },
          {
            title: "NL-VISION lab",
            body:
              "A local observation layer for optional visual signals, built for privacy and future research connection from the first line of code.",
            action: "Open the lab",
            href: "/labs/nl-vision",
          },
          {
            title: "Future Care Room",
            body:
              "An interactive care-room simulation where light, sound, distance, and rhythm become a living care protocol for future robot and adapter work.",
            action: "Enter the room",
            href: "/labs/future-care-room",
          },
          {
            title: "Clinical-science anchor",
            body:
              "Dialogue with universities, researchers, and clinical environments that can help Neuroljus grow toward validated layers for research, diagnostic support, and care infrastructure.",
            action: "Start a dialogue",
            href: "/contact",
          },
        ],
        offerFoot:
          "Neuroljus begins in everyday care and builds toward larger integration: research, clinical science, welfare systems, open protocols, and assistive technology.",
        thesisTitle: "Born from real care",
        thesis:
          "Elizabeth's experience as an economist and caregiver is the project's foundation: careful observation, systems knowledge, care work, and respect for what is not always expressed through speech.",
        horizonTitle: "The long-term question",
        horizon:
          "When future care includes AI, sensors, and robots, they need to learn from real care: one person, one context, one routine, one next step.",
        modelTitle: "Within-person, over time",
        model:
          "Neuroljus begins with individual patterns before universal answers about autism. It explores whether structured observations over time can help caregivers see with more care and less guesswork.",
        robotTitle: "Robotics as a horizon",
        robot:
          "Assistive robotics can support routines, environments, handoffs, and communication. Neuroljus builds the protocols that make that support understandable, traceable, and adaptable.",
        actionKicker: "The path forward",
        actionTitle: "From everyday care to health infrastructure",
        actionIntro:
          "The work now is to build the layers that make caregiving knowledge useful for families, municipalities, research, clinical partners, and future care technology.",
        actionSteps: [
          "Develop observation and routine tools that fit everyday care.",
          "Make protocols portable so researchers, open projects, and future devices can build on them.",
          "Seek university and clinical partners for layers that require validation, evidence, and research responsibility.",
          "Build privacy, consent, traceability, and local control as technical properties from the beginning.",
        ],
        boundariesTitle: "Design principles",
        boundaries: [
          "The caregiver authors routines, context, and goals.",
          "Local observations prioritize privacy and control near the person.",
          "Uncertainty is preserved as data so the system can learn without pretending to know more than it knows.",
          "Clinical and diagnostic layers are developed with qualified research and care partners.",
          "Family, caregivers, professional care, and future technology belong to the same support network.",
        ],
        labTitle: "Current technical layer",
        lab:
          "NL-VISION is a local observation layer for face, hands, and simple signals. It shows how everyday technical signals can be structured for reflection, research, and future integration.",
        collabTitle: "For universities, researchers, and ethical collaborators",
        collab:
          "Neuroljus is seeking clinical-science anchors: environments where lived experience, technology, autism research, data protection, and Swedish care logic can become future health and care infrastructure.",
        footer:
          "Neuroljus is an independent research and portfolio project by Elizabeth Ospina.",
      },
      es: {
        seoTitle: "NeuroLjus - inteligencia de cuidado para salud y cuidado futuro",
        seoDesc:
          "Neuroljus es una plataforma de inteligencia del cuidado preparada para investigación, observación cotidiana, protocolos abiertos y futura IA y robótica al servicio de la salud y el cuidado.",
        primaryNav: "Principal",
        coreKicker: "Núcleo",
        horizonAria: "Horizonte de investigación",
        collabKicker: "Colaboración",
        eyebrow: "Inteligencia del cuidado · lógica sueca de cuidado · salud futura",
        title: "Neuroljus",
        subtitle:
          "Neuroljus transforma conocimiento cuidador vivido en rutinas estructuradas, observaciones locales y protocolos abiertos para futura salud, investigación y robótica asistiva.",
        cta: "Abrir NL-VISION",
        futureRoomCta: "Entrar a Future Care Room",
        whitepaperCta: "Leer el white paper",
        whitepaperHref: "https://doi.org/10.5281/zenodo.20775583",
        secondaryCta: "Leer la historia",
        status:
          "Estamos construyendo las primeras capas: lenguaje, método, prototipo local, protocolos abiertos y camino de investigación. La visión es más grande que una app: conocimiento cuidador como parte de la infraestructura futura de salud.",
        navDemo: "Demo",
        navAbout: "Sobre",
        navOffer: "Ahora",
        navContact: "Contacto",
        offerKicker: "Lo que diseñamos ahora",
        offerTitle: "La primera capa de la inteligencia de cuidado futura",
        offers: [
          {
            title: "Inteligencia cuidadora",
            body:
              "El cuidado cotidiano contiene experticia. Neuroljus convierte observaciones, traspasos e incertidumbre en material de diseño estructurado.",
            action: "Iniciar conversación",
            href: "/contact",
          },
          {
            title: "Método de observación v0",
            body:
              "Una primera estructura para separar qué pasó, el contexto, la interpretación del cuidador, la incertidumbre y qué ayudó realmente.",
            action: "Probar la plantilla",
            href: "/observation-method",
          },
          {
            title: "Laboratorio NL-VISION",
            body:
              "Una capa local de observación para señales visuales opcionales, construida con privacidad y conexión futura a investigación desde la primera línea de código.",
            action: "Abrir el laboratorio",
            href: "/labs/nl-vision",
          },
          {
            title: "Future Care Room",
            body:
              "Una simulación interactiva de una sala de cuidado donde luz, sonido, distancia y ritmo se convierten en un protocolo vivo para futuros robots y adaptadores.",
            action: "Entrar a la sala",
            href: "/labs/future-care-room",
          },
          {
            title: "Anclaje clínico-científico",
            body:
              "Diálogo con universidades, investigadores y entornos clínicos que puedan ayudar a Neuroljus a crecer hacia capas validadas de investigación, apoyo diagnóstico e infraestructura de cuidado.",
            action: "Iniciar diálogo",
            href: "/contact",
          },
        ],
        offerFoot:
          "Neuroljus empieza en el cuidado cotidiano y construye hacia una integración mayor: investigación, ciencia clínica, sistemas de bienestar, protocolos abiertos y tecnología asistiva.",
        thesisTitle: "Nacido del cuidado real",
        thesis:
          "La experiencia de Elizabeth como economista y cuidadora es el fundamento del proyecto: observación cuidadosa, conocimiento de sistemas, trabajo de cuidado y respeto por lo que no siempre se expresa con palabras.",
        horizonTitle: "La pregunta a largo plazo",
        horizon:
          "Cuando el cuidado del futuro incluya IA, sensores y robots, tendrán que aprender del cuidado real: una persona, un contexto, una rutina, un siguiente paso.",
        modelTitle: "Dentro de una persona, a través del tiempo",
        model:
          "Neuroljus empieza con patrones individuales antes que respuestas universales sobre el autismo. Explora si las observaciones estructuradas en el tiempo pueden ayudar a cuidadores a mirar con más cuidado y menos suposición.",
        robotTitle: "La robótica como horizonte",
        robot:
          "La robótica asistiva puede apoyar rutinas, entornos, traspasos y comunicación. Neuroljus construye los protocolos para que ese apoyo sea comprensible, trazable y adaptable.",
        actionKicker: "El camino ahora",
        actionTitle: "Del cuidado cotidiano a infraestructura de salud",
        actionIntro:
          "El trabajo ahora es construir las capas que vuelven útil el conocimiento cuidador para familias, comunas, investigación, aliados clínicos y futura tecnología de cuidado.",
        actionSteps: [
          "Desarrollar herramientas de observación y rutina que encajen en el cuidado cotidiano.",
          "Hacer protocolos portables para que investigadores, proyectos abiertos y futuros dispositivos puedan construir encima.",
          "Buscar universidades y aliados clínicos para capas que requieran validación, evidencia y responsabilidad investigadora.",
          "Construir privacidad, consentimiento, trazabilidad y control local como propiedades técnicas desde el inicio.",
        ],
        boundariesTitle: "Principios de diseño",
        boundaries: [
          "La cuidadora define rutinas, contexto y objetivos.",
          "Las observaciones locales priorizan privacidad y control cerca de la persona.",
          "La incertidumbre se conserva como dato para que el sistema aprenda sin fingir más certeza de la que tiene.",
          "Las capas clínicas y diagnósticas se desarrollan con aliados cualificados de investigación y cuidado.",
          "Familia, cuidadores, atención profesional y futura tecnología pertenecen a una misma red de apoyo.",
        ],
        labTitle: "Capa técnica actual",
        lab:
          "NL-VISION es una capa local de observación de rostro, manos y señales simples. Muestra cómo señales técnicas de la vida cotidiana pueden estructurarse para reflexión, investigación e integración futura.",
        collabTitle: "Para universidades, investigadores y aliados éticos",
        collab:
          "Neuroljus busca anclajes clínico-científicos: entornos donde experiencia vivida, tecnología, investigación en autismo, protección de datos y lógica sueca de cuidado puedan convertirse en infraestructura futura de salud y cuidado.",
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
                <a className="textCta" href="/labs/future-care-room">
                  {copy.futureRoomCta}
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
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
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
