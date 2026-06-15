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
    tagSV: "Empatisk AI för sensorisk förståelse",
    tagEN: "Empathic AI for Sensory Understanding",
    titleSV: "Ljus som gör det osynliga begripligt",
    titleEN: "Light that makes the invisible understandable",
    subSV:
      "En empatisk, lokal AI-följeslagare som hjälper familjer och vårdgivare att förstå sensoriska mönster och hälsosignaler – i din takt.",
    subEN:
      "An empathic, on-device AI companion that helps families and caregivers understand sensory patterns and health signals — at your pace.",
    ctaSV: "Öppna NL-VISION (demo)",
    ctaEN: "Open NL-VISION (demo)",
    p1SV: "Granskningsbart, transparent och inkluderande.",
    p1EN: "Auditable, transparent, and inclusive.",
    p2SV: "GPT-stöd valfritt, integritet först.",
    p2EN: "GPT support optional, privacy first.",
    p3SV: "Skyddad kärna: data stannar lokalt.",
    p3EN: "Protected core: data stays local.",
    footSV:
      "NeuroLjus är experimentellt. Ingen data lämnar din enhet utan uttryckligt samtycke.",
    footEN:
      "NeuroLjus is experimental. No data leaves your device without explicit consent.",
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
            <p style={note}>
              {isSV
                ? "Data stannar på enheten. Inget skickas utan ditt samtycke."
                : "Data stays on device. Nothing is sent without your consent."}
            </p>
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
          <div style={pill}><h3>Open for Trust</h3><p style={pillText}>{isSV ? T.p1SV : T.p1EN}</p></div>
          <div style={pill}><h3>Powered by GPT (optional)</h3><p style={pillText}>{isSV ? T.p2SV : T.p2EN}</p></div>
          <div style={pill}><h3>Protected Core</h3><p style={pillText}>{isSV ? T.p3SV : T.p3EN}</p></div>
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