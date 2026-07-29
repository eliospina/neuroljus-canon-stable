import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lang = "sv" | "en" | "es";

const modules = [
  {
    id: "MOD.CARE_ROOM",
    href: "/labs/future-care-room",
    path: "/labs/future-care-room",
  },
  {
    id: "MOD.PROTOCOL_WS",
    href: "/labs/robot-interface",
    path: "/labs/robot-interface",
  },
  {
    id: "MOD.VISION",
    href: "/labs/nl-vision",
    path: "/labs/nl-vision",
  },
  {
    id: "MOD.OBSERVATION",
    href: "/observation-method",
    path: "/observation-method",
  },
  {
    id: "MOD.PATTERNS",
    href: "/labs/pattern-notebook",
    path: "/labs/pattern-notebook",
  },
] as const;

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
        seoTitle: "Neuroljus — omsorgsintelligens som infrastruktur",
        seoDesc:
          "Levd omsorg blir strukturerade protokoll. Lokalt, deterministiskt, adapter-klart. Vårdgivaren behåller alltid kontrollen.",
        statusRight: "latency 0ms · deterministiskt · caregiver_authority=true",
        platform: "Omsorgsintelligensplattform",
        navLabs: "Labs",
        navVision: "NL-VISION",
        navProtocol: "Protokoll",
        navAbout: "Om",
        navContact: "Kontakt",
        pillRuntime: "runtime",
        pillProtocol: "protocol",
        pillAdapters: "adapters",
        pillAudit: "audit",
        cli: "neuroljus status --all",
        heroTitle: "Omsorgsintelligens",
        heroDim: "som distribuerbar infrastruktur.",
        heroSub:
          "Levda protokoll. Lokal körning. Adapter-klar export. Vårdgivaren behåller root-access hela tiden.",
        m1: "scenariopresets",
        m2: "kommandotyper",
        m3: "adaptermål",
        m4: "externa API-anrop",
        streamLabel: "protocol_stream",
        streamMeta: "evening_transition · presence=nearby · status=ready",
        sideSequence: "planned_sequence",
        sideExceptions: "safety_exceptions",
        sideAdapters: "adapter_packets",
        sideAudit: "audit_trail",
        sideValidation: "validation",
        lineProtocol: "protocol:",
        lineAuthored: "caregiver_authored:",
        lineTrue: "true",
        line1: "+0.0m  reduce_sound",
        line1note: "// sensorisk belastning först",
        line2: "+2.9m  lower_light",
        line2note: "// mål 35%",
        line3: "+5.7m  step_back",
        line3note: "// håll 1,5 m avstånd",
        line4: "+8.6m  offer_visual_card",
        ex1: "rejection_signal → STOP · notify_caregiver",
        ex2: "caregiver_pause → STOP · hand_back",
        modulesTitle: "Distribuerade moduler",
        modCareTitle: "Care Room",
        modCareBody: "Interaktiv miljösimulering + Story Mode. Ljus, ljud, avstånd → levande protokoll.",
        modProtoTitle: "Protocol Workspace",
        modProtoBody: "Bygg, validera, exportera. Fullt care_command_protocol_v0-kuvert.",
        modVisionTitle: "NL-VISION",
        modVisionBody: "Lokalt observationslager. Valfria visuella signaler. Integritet först.",
        modObsTitle: "Observation Method",
        modObsBody: "Struktur för vad som hände, sammanhang, tolkning och osäkerhet.",
        modPatTitle: "Mönsteranteckningar",
        modPatBody: "Lokala anteckningar om gester, lindring och osäkerhet — vårdgivarvittne.",
        principlesTitle: "Designprinciper",
        principles: [
          "Vårdgivaren författar rutiner, sammanhang och mål — som ansvar för personen, inte som personalens ego.",
          "Den neurodivergenta personen rankas inte under personalens bekvämlighet eller neurotypisk ”förmåga”.",
          "Knuff, slag och förnedring är aldrig vård — vittna, skydda, rapportera. Neuroljus upptäcker inte våld via kamera.",
          "Lokala observationer prioriterar integritet och kontroll nära personen.",
          "Osäkerhet sparas som data — systemet låtsas inte veta mer än det vet.",
          "Kliniska lager utvecklas med kvalificerade forsknings- och vårdpartners.",
        ],
        pathTitle: "Börja här — tre steg",
        pathSub:
          "Icke-talande personer uttrycker sig på andra sätt. Vi gör vården mer synlig — utan att låtsas läsa tankar.",
        path1Title: "1 · Se signaler",
        path1Body: "NL-VISION: lokala landmarks. Vad kameran spårar — inte vad personen ”känner”.",
        path1Href: "/labs/nl-vision",
        path1Cta: "Öppna NL-VISION",
        path2Title: "2 · Forma omsorg",
        path2Body:
          "Care Room: lev en övergång eller ”Possible discomfort”. Story Mode. Du behåller kontrollen.",
        path2Href: "/labs/future-care-room",
        path2Cta: "Öppna Care Room",
        path3Title: "3 · Exportera protokoll",
        path3Body: "Samma kuvert till människa, hem eller robot. Deterministiskt. Lokal körning.",
        path3Href: "/labs/robot-interface",
        path3Cta: "Öppna protokoll",
        pathCompanion:
          "Mellan stegen: spara lokala anteckningar om gester → lindring i Mönsteranteckningar.",
        pathCompanionCta: "Öppna mönsteranteckningar",
        pathCompanionHref: "/labs/pattern-notebook",
        ctaTitle: "Distribuera ett protokoll.",
        ctaSub: "Ingen registrering. Inget moln. Öppna workspace och exportera.",
        ctaBtn: "ÖPPNA WORKSPACE",
        ctaHref: "/labs/robot-interface",
        ctaVision: "Öppna NL-VISION",
        whitepaper: "White paper",
        whitepaperHref: "https://doi.org/10.5281/zenodo.20775583",
        footer: "Neuroljus — oberoende forsknings- och portfolioprojekt av Elizabeth Ospina.",
      },
      en: {
        seoTitle: "Neuroljus — care intelligence as infrastructure",
        seoDesc:
          "Lived care becomes structured protocols. Local, deterministic, adapter-ready. The caregiver always retains control.",
        statusRight: "latency 0ms · deterministic · caregiver_authority=true",
        platform: "Care Intelligence Platform",
        navLabs: "Labs",
        navVision: "NL-VISION",
        navProtocol: "Protocol",
        navAbout: "About",
        navContact: "Contact",
        pillRuntime: "runtime",
        pillProtocol: "protocol",
        pillAdapters: "adapters",
        pillAudit: "audit",
        cli: "neuroljus status --all",
        heroTitle: "Care intelligence",
        heroDim: "as deployable infrastructure.",
        heroSub:
          "Lived protocols. Local execution. Adapter-ready output. The caregiver retains root access at all times.",
        m1: "scenario presets",
        m2: "command types",
        m3: "adapter targets",
        m4: "external API calls",
        streamLabel: "protocol_stream",
        streamMeta: "evening_transition · presence=nearby · status=ready",
        sideSequence: "planned_sequence",
        sideExceptions: "safety_exceptions",
        sideAdapters: "adapter_packets",
        sideAudit: "audit_trail",
        sideValidation: "validation",
        lineProtocol: "protocol:",
        lineAuthored: "caregiver_authored:",
        lineTrue: "true",
        line1: "+0.0m  reduce_sound",
        line1note: "// sensory load first",
        line2: "+2.9m  lower_light",
        line2note: "// target 35%",
        line3: "+5.7m  step_back",
        line3note: "// hold 1.5m space",
        line4: "+8.6m  offer_visual_card",
        ex1: "rejection_signal → STOP · notify_caregiver",
        ex2: "caregiver_pause → STOP · hand_back",
        modulesTitle: "Deployed modules",
        modCareTitle: "Care Room",
        modCareBody: "Interactive environment simulation + Story Mode. Light, sound, distance → live protocol.",
        modProtoTitle: "Protocol Workspace",
        modProtoBody: "Build, validate, export. Full care_command_protocol_v0 envelope.",
        modVisionTitle: "NL-VISION",
        modVisionBody: "Local observation layer. Optional visual signals. Privacy-first.",
        modObsTitle: "Observation Method",
        modObsBody: "Structure for what happened, context, interpretation, and uncertainty.",
        modPatTitle: "Pattern Notebook",
        modPatBody: "Local notes on gestures, relief, and uncertainty — caregiver witness.",
        principlesTitle: "Design principles",
        principles: [
          "The caregiver authors routines, context, and goals — as responsibility for the person, not staff ego.",
          "The neurodivergent person is never ranked below staff convenience or neurotypical “capability.”",
          "Pushing, hitting, and humiliation are never care — witness, protect, report. Neuroljus does not detect violence via camera.",
          "Local observations prioritize privacy and control near the person.",
          "Uncertainty is preserved as data — the system never pretends to know more than it knows.",
          "Clinical layers are developed with qualified research and care partners.",
        ],
        pathTitle: "Start here — three steps",
        pathSub:
          "Non-speaking people express themselves differently. We make care more visible — without pretending to read minds.",
        path1Title: "1 · See signals",
        path1Body: "NL-VISION: local landmarks. What the camera tracks — not what the person “feels”.",
        path1Href: "/labs/nl-vision",
        path1Cta: "Open NL-VISION",
        path2Title: "2 · Shape care",
        path2Body:
          "Care Room: live a transition or Possible discomfort. Story Mode. You keep authority.",
        path2Href: "/labs/future-care-room",
        path2Cta: "Open Care Room",
        path3Title: "3 · Export protocol",
        path3Body: "The same envelope for a person, a home, or a robot. Deterministic. Local.",
        path3Href: "/labs/robot-interface",
        path3Cta: "Open protocol",
        pathCompanion:
          "Between steps: save local gesture → relief notes in the Pattern Notebook.",
        pathCompanionCta: "Open Pattern Notebook",
        pathCompanionHref: "/labs/pattern-notebook",
        ctaTitle: "Deploy a protocol.",
        ctaSub: "No signup. No cloud. Open the workspace and export.",
        ctaBtn: "OPEN WORKSPACE",
        ctaHref: "/labs/robot-interface",
        ctaVision: "Open NL-VISION",
        whitepaper: "White paper",
        whitepaperHref: "https://doi.org/10.5281/zenodo.20775583",
        footer: "Neuroljus — independent research and portfolio project by Elizabeth Ospina.",
      },
      es: {
        seoTitle: "Neuroljus — inteligencia del cuidado como infraestructura",
        seoDesc:
          "El cuidado vivido se convierte en protocolos estructurados. Local, determinista, listo para adaptadores. La cuidadora siempre retiene el control.",
        statusRight: "latency 0ms · determinista · caregiver_authority=true",
        platform: "Plataforma de inteligencia del cuidado",
        navLabs: "Labs",
        navVision: "NL-VISION",
        navProtocol: "Protocolo",
        navAbout: "Sobre",
        navContact: "Contacto",
        pillRuntime: "runtime",
        pillProtocol: "protocol",
        pillAdapters: "adapters",
        pillAudit: "audit",
        cli: "neuroljus status --all",
        heroTitle: "Inteligencia del cuidado",
        heroDim: "como infraestructura desplegable.",
        heroSub:
          "Protocolos vividos. Ejecución local. Salida lista para adaptadores. La cuidadora retiene acceso root en todo momento.",
        m1: "presets de escenario",
        m2: "tipos de comando",
        m3: "destinos adaptador",
        m4: "llamadas API externas",
        streamLabel: "protocol_stream",
        streamMeta: "evening_transition · presence=nearby · status=ready",
        sideSequence: "planned_sequence",
        sideExceptions: "safety_exceptions",
        sideAdapters: "adapter_packets",
        sideAudit: "audit_trail",
        sideValidation: "validation",
        lineProtocol: "protocol:",
        lineAuthored: "caregiver_authored:",
        lineTrue: "true",
        line1: "+0.0m  reduce_sound",
        line1note: "// carga sensorial primero",
        line2: "+2.9m  lower_light",
        line2note: "// objetivo 35%",
        line3: "+5.7m  step_back",
        line3note: "// mantener 1,5 m",
        line4: "+8.6m  offer_visual_card",
        ex1: "rejection_signal → STOP · notify_caregiver",
        ex2: "caregiver_pause → STOP · hand_back",
        modulesTitle: "Módulos desplegados",
        modCareTitle: "Care Room",
        modCareBody: "Simulación interactiva + Story Mode. Luz, sonido, distancia → protocolo vivo.",
        modProtoTitle: "Protocol Workspace",
        modProtoBody: "Construir, validar, exportar. Sobre completo care_command_protocol_v0.",
        modVisionTitle: "NL-VISION",
        modVisionBody: "Capa local de observación. Señales visuales opcionales. Privacidad primero.",
        modObsTitle: "Observation Method",
        modObsBody: "Estructura para qué pasó, contexto, interpretación e incertidumbre.",
        modPatTitle: "Cuaderno de patrones",
        modPatBody: "Notas locales sobre gestos, alivio e incertidumbre — testigo cuidador.",
        principlesTitle: "Principios de diseño",
        principles: [
          "La cuidadora define rutinas, contexto y objetivos — como responsabilidad por la persona, no como ego del personal.",
          "La persona neurodivergente no se rankea debajo de la comodidad del personal ni de la “capacidad” neurotípica.",
          "Empujar, pegar y humillar nunca es cuidado — testimonio, proteger, reportar. Neuroljus no detecta violencia por cámara.",
          "Las observaciones locales priorizan privacidad y control cerca de la persona.",
          "La incertidumbre se conserva como dato — el sistema no finge saber más de lo que sabe.",
          "Las capas clínicas se desarrollan con aliados cualificados de investigación y cuidado.",
        ],
        pathTitle: "Empieza aquí — tres pasos",
        pathSub:
          "Quienes no hablan se expresan de otra forma. Hacemos el cuidado más visible — sin fingir leer la mente.",
        path1Title: "1 · Ver señales",
        path1Body: "NL-VISION: landmarks locales. Lo que la cámara rastrea — no lo que la persona “siente”.",
        path1Href: "/labs/nl-vision",
        path1Cta: "Abrir NL-VISION",
        path2Title: "2 · Dar forma al cuidado",
        path2Body:
          "Care Room: vive una transición o Possible discomfort. Story Mode. Tú mantienes el control.",
        path2Href: "/labs/future-care-room",
        path2Cta: "Abrir Care Room",
        path3Title: "3 · Exportar protocolo",
        path3Body: "El mismo sobre para una persona, un hogar o un robot. Determinista. Local.",
        path3Href: "/labs/robot-interface",
        path3Cta: "Abrir protocolo",
        pathCompanion:
          "Entre pasos: guarda notas locales gesto → alivio en el Cuaderno de patrones.",
        pathCompanionCta: "Abrir Cuaderno de patrones",
        pathCompanionHref: "/labs/pattern-notebook",
        ctaTitle: "Despliega un protocolo.",
        ctaSub: "Sin registro. Sin nube. Abre el workspace y exporta.",
        ctaBtn: "ABRIR WORKSPACE",
        ctaHref: "/labs/robot-interface",
        ctaVision: "Abrir NL-VISION",
        whitepaper: "White paper",
        whitepaperHref: "https://doi.org/10.5281/zenodo.20775583",
        footer: "Neuroljus — proyecto independiente de investigación y portafolio de Elizabeth Ospina.",
      },
    }),
    []
  );

  const copy = T[lang];

  const moduleCopy = [
    { title: copy.modCareTitle, body: copy.modCareBody },
    { title: copy.modProtoTitle, body: copy.modProtoBody },
    { title: copy.modVisionTitle, body: copy.modVisionBody },
    { title: copy.modObsTitle, body: copy.modObsBody },
    { title: copy.modPatTitle, body: copy.modPatBody },
  ];

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

          <nav className="navLinks" aria-label="Primary">
            <Link href="/labs/future-care-room">{copy.navLabs}</Link>
            <Link href="/labs/nl-vision">{copy.navVision}</Link>
            <Link href="/labs/robot-interface">{copy.navProtocol}</Link>
            <Link href="/about">{copy.navAbout}</Link>
            <Link href="/contact">{copy.navContact}</Link>
          </nav>

          <div className="navRight">
            <div className="pills" role="group" aria-label="Platform layers">
              <span className="pill on">{copy.pillRuntime}</span>
              <span className="pill">{copy.pillProtocol}</span>
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

        <main>
          <section className="shell hero" aria-labelledby="hero-title">
            <p className="cli">{copy.cli}</p>
            <h1 id="hero-title">
              {copy.heroTitle}
              <br />
              <span>{copy.heroDim}</span>
            </h1>
            <p className="heroSub">{copy.heroSub}</p>
          </section>

          <section className="shell metrics" aria-label="Platform metrics">
            <div>
              <b>5</b>
              <span>{copy.m1}</span>
            </div>
            <div>
              <b>7</b>
              <span>{copy.m2}</span>
            </div>
            <div>
              <b>4</b>
              <span>{copy.m3}</span>
            </div>
            <div>
              <b>0</b>
              <span>{copy.m4}</span>
            </div>
          </section>

          <section className="shell path" aria-labelledby="path-title">
            <h2 id="path-title">{copy.pathTitle}</h2>
            <p className="pathSub">{copy.pathSub}</p>
            <div className="pathGrid">
              <article className="pathCard">
                <h3>{copy.path1Title}</h3>
                <p>{copy.path1Body}</p>
                <Link href={copy.path1Href}>{copy.path1Cta}</Link>
              </article>
              <article className="pathCard">
                <h3>{copy.path2Title}</h3>
                <p>{copy.path2Body}</p>
                <Link href={copy.path2Href}>{copy.path2Cta}</Link>
              </article>
              <article className="pathCard">
                <h3>{copy.path3Title}</h3>
                <p>{copy.path3Body}</p>
                <Link href={copy.path3Href}>{copy.path3Cta}</Link>
              </article>
            </div>
            <p className="pathCompanion">
              {copy.pathCompanion}{" "}
              <Link href={copy.pathCompanionHref}>{copy.pathCompanionCta}</Link>
            </p>
          </section>

          <section className="shell console" aria-label="Protocol stream preview">
            <div className="consoleHead">
              <b>{copy.streamLabel}</b>
              <span>{copy.streamMeta}</span>
            </div>
            <div className="consoleBody">
              <div className="sidebar">
                <div className="side on">{copy.sideSequence}</div>
                <div className="side">{copy.sideExceptions}</div>
                <div className="side">{copy.sideAdapters}</div>
                <div className="side">{copy.sideAudit}</div>
                <div className="side">{copy.sideValidation}</div>
              </div>
              <div className="stream">
                <div>
                  <span className="k">{copy.lineProtocol}</span>{" "}
                  <span className="v">care_command_protocol_v0</span>
                </div>
                <div>
                  <span className="k">{copy.lineAuthored}</span>{" "}
                  <span className="g">{copy.lineTrue}</span>
                </div>
                <div className="gap" />
                <div>
                  <span className="g">✓</span> <span className="v">{copy.line1}</span>{" "}
                  <span className="k">{copy.line1note}</span>
                </div>
                <div>
                  <span className="g">✓</span> <span className="v">{copy.line2}</span>{" "}
                  <span className="k">{copy.line2note}</span>
                </div>
                <div>
                  <span className="g">▸</span> <span className="v">{copy.line3}</span>{" "}
                  <span className="k">{copy.line3note}</span>
                </div>
                <div>
                  <span className="k">·</span> <span className="v">{copy.line4}</span>
                </div>
                <div className="gap" />
                <div>
                  <span className="a">◦</span> <span className="v">{copy.ex1}</span>
                </div>
                <div>
                  <span className="a">◦</span> <span className="v">{copy.ex2}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="shell modules" aria-labelledby="modules-title">
            <h2 id="modules-title">{copy.modulesTitle}</h2>
            <div className="modGrid">
              {modules.map((mod, index) => (
                <Link key={mod.id} href={mod.href} className="modCard">
                  <span className="modId">{mod.id}</span>
                  <h3>{moduleCopy[index].title}</h3>
                  <p>{moduleCopy[index].body}</p>
                  <span className="modGo">{mod.path} →</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="shell principles" aria-labelledby="principles-title">
            <h2 id="principles-title">{copy.principlesTitle}</h2>
            <ul>
              {copy.principles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="shell ctaBand">
            <div>
              <h2>{copy.ctaTitle}</h2>
              <p>{copy.ctaSub}</p>
            </div>
            <div className="ctaActions">
              <a className="ctaBtn" href={copy.ctaHref}>
                {copy.ctaBtn}
              </a>
              <a className="ctaSecondary" href="/labs/nl-vision">
                {copy.ctaVision}
              </a>
            </div>
          </section>
        </main>

        <footer className="shell foot" role="contentinfo">
          <p>{copy.footer}</p>
          <a href={copy.whitepaperHref}>{copy.whitepaper}</a>
        </footer>
      </div>

      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }
        .page {
          min-height: 100dvh;
          background: #09090b;
          color: #fafafa;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }
        .shell {
          width: min(1100px, calc(100% - 48px));
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
        .hero {
          padding: 64px 0 40px;
        }
        .cli {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
          color: #3ecf9a;
          margin-bottom: 20px;
        }
        h1 {
          margin: 0;
          font-size: clamp(40px, 6vw, 56px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
        }
        h1 span {
          color: #52525b;
        }
        .heroSub {
          margin-top: 16px;
          max-width: 560px;
          font-size: 16px;
          line-height: 1.6;
          color: #a1a1aa;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: #27272a;
          margin-bottom: 32px;
        }
        .metrics div {
          background: #09090b;
          padding: 20px 0;
        }
        .metrics b {
          display: block;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 28px;
          margin-bottom: 4px;
        }
        .metrics span {
          font-size: 11px;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .path {
          margin: 0 0 40px;
        }
        .path h2 {
          margin: 0;
          font-size: 18px;
        }
        .pathSub {
          margin: 8px 0 0;
          color: #a1a1aa;
          max-width: 64ch;
          line-height: 1.55;
          font-size: 14px;
        }
        .pathGrid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .pathCard {
          border: 1px solid #27272a;
          border-radius: 6px;
          background: #0c0c0e;
          padding: 18px;
          display: grid;
          gap: 10px;
          align-content: start;
        }
        .pathCard h3 {
          margin: 0;
          font-size: 15px;
        }
        .pathCard p {
          margin: 0;
          color: #a1a1aa;
          font-size: 13px;
          line-height: 1.5;
        }
        .pathCard :global(a) {
          color: #3ecf9a;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }
        .pathCompanion {
          margin: 14px 0 0;
          color: #8aa0b8;
          font-size: 13px;
          line-height: 1.5;
          max-width: 70ch;
        }
        .pathCompanion :global(a) {
          color: #3ecf9a;
          font-weight: 700;
          text-decoration: none;
        }
        .console {
          border: 1px solid #27272a;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 48px;
        }
        .consoleHead {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          padding: 10px 16px;
          background: #18181b;
          border-bottom: 1px solid #27272a;
          color: #71717a;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .consoleHead :global(b) {
          color: #a1a1aa;
        }
        .consoleBody {
          display: grid;
          grid-template-columns: 200px 1fr;
          min-height: 260px;
        }
        .sidebar {
          background: #0c0c0e;
          border-right: 1px solid #27272a;
          padding: 12px 0;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
        }
        .side {
          padding: 8px 16px;
          color: #71717a;
          border-left: 2px solid transparent;
        }
        .side.on {
          color: #3ecf9a;
          border-left-color: #3ecf9a;
          background: rgba(62, 207, 154, 0.06);
        }
        .stream {
          padding: 20px;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
          line-height: 1.8;
        }
        .stream .gap {
          height: 8px;
        }
        .k {
          color: #71717a;
        }
        .v {
          color: #e4e4e7;
        }
        .g {
          color: #3ecf9a;
        }
        .a {
          color: #fbbf24;
        }
        .modules {
          margin-bottom: 40px;
        }
        .modules h2,
        .principles h2 {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #71717a;
          margin-bottom: 24px;
        }
        .modGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .modCard {
          border: 1px solid #27272a;
          border-radius: 6px;
          padding: 20px;
          background: #0c0c0e;
          text-decoration: none;
          color: inherit;
          display: grid;
          gap: 8px;
          transition: border-color 200ms ease;
        }
        .modCard:hover {
          border-color: #3ecf9a;
        }
        .modId {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 10px;
          color: #3ecf9a;
        }
        .modCard h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
        }
        .modCard p {
          margin: 0;
          font-size: 12px;
          color: #71717a;
          line-height: 1.5;
        }
        .modGo {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          font-weight: 800;
          color: #fafafa;
        }
        .principles {
          margin-bottom: 40px;
          border-top: 1px solid #27272a;
          padding-top: 40px;
        }
        .principles ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 10px;
        }
        .principles li {
          font-size: 14px;
          color: #a1a1aa;
          line-height: 1.55;
          padding-left: 16px;
          border-left: 2px solid #27272a;
        }
        .ctaBand {
          margin-bottom: 48px;
          padding: 32px;
          border: 1px solid #3ecf9a;
          border-radius: 6px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .ctaBand h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }
        .ctaBand p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #a1a1aa;
        }
        .ctaBtn {
          background: #3ecf9a;
          color: #09090b;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }
        .ctaActions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .ctaSecondary {
          display: inline-flex;
          align-items: center;
          border: 1px solid #3f3f46;
          color: #fafafa;
          padding: 12px 18px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
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
            width: min(100% - 28px, 1100px);
          }
          .navRight {
            width: 100%;
            margin-left: 0;
            justify-content: space-between;
          }
          .metrics {
            grid-template-columns: repeat(2, 1fr);
          }
          .pathGrid {
            grid-template-columns: 1fr;
          }
          .consoleBody {
            grid-template-columns: 1fr;
          }
          .sidebar {
            display: flex;
            flex-wrap: wrap;
            border-right: 0;
            border-bottom: 1px solid #27272a;
            padding: 8px;
          }
          .side {
            padding: 6px 10px;
            border-left: 0;
            border-bottom: 2px solid transparent;
          }
          .side.on {
            border-bottom-color: #3ecf9a;
          }
          .modGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
