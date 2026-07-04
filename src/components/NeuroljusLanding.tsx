// src/components/neuroljusLanding.tsx
/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useEffect, useState } from "react";

export default function NeuroljusLanding() {
  const [lang, setLang] = useState<"sv" | "en">("sv");
  useEffect(() => {
    try {
      const l = navigator.language?.toLowerCase().startsWith("sv") ? "sv" : "en";
      setLang(l as "sv" | "en");
    } catch {}
  }, []);

  const T = {
    tagSV: "Forsknings- och portfolio-prototyp",
    tagEN: "Research and portfolio prototype",
    titleSV: "Neuroljus",
    titleEN: "Neuroljus",
    subSV:
      "Ett oberoende forsknings- och prototypprojekt som utforskar integritetsförst AI för observation och kommunikationsstöd i icke-talande autism.",
    subEN:
      "An independent research and prototype project exploring privacy-first AI tools for caregiver observation and communication support in non-speaking autism.",
    ctaSV: "Visa NL-VISION-prototypen",
    ctaEN: "View NL-VISION prototype",
    p1SV: "Pausad som aktiv produkt; bevarad som forsknings- och portfolio-prototyp.",
    p1EN: "Paused as an active product; maintained as a research and portfolio prototype.",
    p2SV: "NL-VISION är en teknisk prototyp för lokala observationssignaler.",
    p2EN: "NL-VISION is a technical prototype for local observation signals.",
    p3SV: "Integritetsförst: inga produkt- eller kliniska claims utan evidens.",
    p3EN: "Privacy-first: no product or clinical claims without evidence.",
    footSV:
      "Neuroljus är pausat som aktiv produkt och underhålls som forsknings- och portfolio-prototyp.",
    footEN:
      "Neuroljus is paused as an active product and maintained as a research and portfolio prototype.",
  };

  const isSV = lang === "sv";

  return (
    <div style={bg}>
      <div style={wrap}>
        <header style={head}>
          <a href="/" style={brand}>
            <Image
              src="/brand/neuroljus-logo.svg"
              alt="NeuroLjus logo"
              width={36}
              height={36}
              priority
              style={{ filter: "drop-shadow(0 0 10px rgba(124,227,247,.25))" }}
            />
            <div>
              <div style={{ fontWeight: 700, letterSpacing: 0.3 }}>NeuroLjus</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                {isSV ? T.tagSV : T.tagEN}
              </div>
            </div>
          </a>

          <nav style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
            <a href="/labs/nl-vision" style={navLink}>
              NL-VISION
            </a>
            <a href="#about" style={navLink}>{isSV ? "Om" : "About"}</a>
          </nav>

          <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            <button onClick={() => setLang("sv")} style={btn}>SV</button>
            <button onClick={() => setLang("en")} style={btn}>EN</button>
          </div>
        </header>

        <main style={mainGrid}>
          <section style={card}>
            <h1 style={{ fontSize: 40, margin: "6px 0" }}>
              {isSV ? T.titleSV : T.titleEN}
            </h1>
            <p style={{ color: "#cbd5e1", margin: "0 0 14px" }}>
              {isSV ? T.subSV : T.subEN}
            </p>
            <a href="/labs/nl-vision" style={cta}>
              {isSV ? T.ctaSV : T.ctaEN}
            </a>
            <p style={note}>{isSV ? "Status: pausad som aktiv produkt." : "Status: paused as an active product."}</p>
          </section>

          <section style={card}>
            <Image
              src="/brand/neuroljus-logo.svg"
              alt="NeuroLjus mark"
              width={820}
              height={820}
              style={{ width: "100%", height: "auto" }}
              priority
            />
          </section>
        </main>

        <section id="about" style={pillGrid}>
          <div style={pill}><h3>{isSV ? "Pausad som produkt" : "Paused as a product"}</h3><p style={pillText}>{isSV ? T.p1SV : T.p1EN}</p></div>
          <div style={pill}><h3>{isSV ? "Observationsprototyp" : "Observation prototype"}</h3><p style={pillText}>{isSV ? T.p2SV : T.p2EN}</p></div>
          <div style={pill}><h3>{isSV ? "Integritetsförst" : "Privacy-first"}</h3><p style={pillText}>{isSV ? T.p3SV : T.p3EN}</p></div>
        </section>

        <footer style={{ textAlign: "center", color: "#b8c1d6", fontSize: 12, padding: "18px 22px" }}>
          {isSV ? T.footSV : T.footEN}
        </footer>
      </div>
    </div>
  );
}

const bg: React.CSSProperties = {
  minHeight: "100dvh",
  color: "#fff",
  background:
    "radial-gradient(1200px 700px at 20% 10%, rgba(94,230,164,0.18), transparent 60%)," +
    "radial-gradient(900px 600px at 80% 20%, rgba(124,227,247,0.18), transparent 60%)," +
    "radial-gradient(1200px 900px at 50% 120%, rgba(166,133,247,0.18), transparent 60%)," +
    "#1E1F3B",
};
const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: 22 };
const head: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 };
const brand: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#fff" };
const navLink: React.CSSProperties = { color: "#cfe7ff", textDecoration: "none" };
const btn: React.CSSProperties = { background: "transparent", color: "#cfe7ff", border: "1px solid #4a507e", borderRadius: 10, padding: "6px 10px", cursor: "pointer" };
const mainGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 26, alignItems: "center" };
const card: React.CSSProperties = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: 22 };
const cta: React.CSSProperties = {
  display: "inline-block", padding: "12px 18px", borderRadius: 12, fontWeight: 600,
  textDecoration: "none", color: "#0b1220",
  backgroundImage: "linear-gradient(135deg, #5EE6A4 0%, #7CE3F7 100%)",
  border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 6px 20px rgba(94,230,164,0.25)",
};
const note: React.CSSProperties = {
  opacity: 0.8, marginTop: 10,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  fontSize: 12,
};
const pillGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 22 };
const pill: React.CSSProperties = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 18 };
const pillText: React.CSSProperties = { color: "#d7deea", margin: 0, fontSize: 14, lineHeight: 1.45 };
