/**
 * NL-VISION PROTECTED FILE
 * This file is part of the stable, polished NL-VISION demo (CareChat + LiveVitals + Holistic).
 * Do not modify unless you *intentionally* update the demo.
 * If you need to change it, include the commit message token: [ALLOW-NLVISION-EDIT]
 * Frozen baseline tag: v1.0-nlvision-stable
 */

// src/components/CareChat.tsx
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type Lang = "sv" | "en" | "es";

const T: Record<Lang, Record<string, string>> = {
  sv: {
    title: "Care Chat",
    subtitle: "AI-stöd för omsorgsobservation",
    placeholder: "Skriv din fråga här…",
    send: "Skicka",
    thinking: "Tänker…",
    quick1: "Vad bör jag observera om jag misstänker smärta?",
    quick2: "Behöver vi sänka stimuli?",
    quick3: "Vilka nästa steg föreslår du?",
    disclaimer: "Organiserar observationer och omsorgsfrågor. Vid akut oro eller ihållande smärta, kontakta vården.",
    notesPlaceholder: "Vårdgivarens anteckningar (valfritt, privat)",
    error: "Jag har tekniska problem just nu. Försök igen om en liten stund.",
    engineOpenAI: "AI: OpenAI",
    engineHeur: "AI: Heuristisk",
  },
  en: {
    title: "Care Chat",
    subtitle: "AI support for care observation",
    placeholder: "Type your question here…",
    send: "Send",
    thinking: "Thinking…",
    quick1: "What should I observe if I suspect pain?",
    quick2: "Should we lower stimulation?",
    quick3: "What next steps do you suggest?",
    disclaimer: "Organizes observations and care questions. For urgent concern or persistent pain, contact healthcare.",
    notesPlaceholder: "Caregiver notes (optional, private)",
    error: "I'm having technical trouble right now. Please try again in a moment.",
    engineOpenAI: "AI: OpenAI",
    engineHeur: "AI: Heuristic",
  },
  es: {
    title: "Care Chat",
    subtitle: "Apoyo de IA para observación cuidadora",
    placeholder: "Escribe tu pregunta aquí…",
    send: "Enviar",
    thinking: "Pensando…",
    quick1: "¿Qué debo observar si sospecho dolor?",
    quick2: "¿Debemos reducir estímulos?",
    quick3: "¿Qué próximos pasos sugieres?",
    disclaimer: "Organiza observaciones y preguntas de cuidado. Ante urgencia o dolor persistente, contacta salud.",
    notesPlaceholder: "Notas del cuidador (opcional, privado)",
    error: "Tengo un problema técnico ahora mismo. Inténtalo de nuevo en un momento.",
    engineOpenAI: "IA: OpenAI",
    engineHeur: "IA: Heurística",
  },
};

const GREETING: Record<Lang, string> = {
  sv:
    "Hej. Jag är Neuroljus Care Reflection. Jag hjälper dig att strukturera det du ser — gester, sammanhang, osäkerhet — utan att låtsas läsa någons inre. Om du misstänker smärta: beskriv vad du såg, vad som lindrade, vad som förvärrade. För portalens verkliga steg: NL-VISION → Care Room → protokoll.",
  en:
    "Hello. I’m Neuroljus Care Reflection. I help structure what you see — gestures, context, uncertainty — without pretending to read anyone’s inner world. If you suspect pain: describe what you saw, what eased it, what worsened it. For this portal’s real path: NL-VISION → Care Room → protocol.",
  es:
    "Hola. Soy Neuroljus Care Reflection. Te ayudo a estructurar lo que ves — gestos, contexto, incertidumbre — sin fingir leer el mundo interior de nadie. Si sospechas dolor: describe qué viste, qué alivió, qué empeoró. El camino real de este portal: NL-VISION → Care Room → protocolo.",
};

const greetingValues = new Set(Object.values(GREETING));

export default function CareChat() {
  const [lang, setLang] = useState<Lang>("sv");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: GREETING.sv }]);
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMsgs((current) => {
      const hasOnlyGreeting =
        current.length === 1 &&
        current[0].role === "assistant" &&
        greetingValues.has(current[0].content);

      return hasOnlyGreeting ? [{ role: "assistant", content: GREETING[lang] }] : current;
    });
  }, [lang]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const readRecentMetrics = () => {
    try {
      const raw = localStorage.getItem("nlvision_holistic_v1") || "[]";
      const arr = JSON.parse(raw) as any[];
      return arr[arr.length - 1] || {};
    } catch { return {}; }
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", content }]);
    setInput("");

    const metrics = readRecentMetrics();
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs.concat({ role: "user", content }), metrics, notes, lang }),
      });
      const j = await r.json();
      setMsgs((m) => [...m, { role: "assistant", content: j.content }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMsgs((m) => [...m, { role: "assistant", content: T[lang].error }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={box}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          <div style={{ fontWeight: 700 }}>{T[lang].title}</div>
          <div style={{ opacity: 0.8, fontSize: 12 }}>{T[lang].subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={engineBadge}>Neuroljus AI</span>
          <select value={lang} onChange={(e)=>setLang(e.target.value as Lang)} style={langSel} aria-label="Language">
            <option value="sv">SV</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>
      </div>


      {/* Thread */}
      <div style={thread} aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} style={m.role === "user" ? userBubble : aiBubble}>{m.content}</div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={T[lang].notesPlaceholder}
        style={notesBox}
      />

      {/* Input */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={T[lang].placeholder}
          style={inputBox}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
        />
        <button onClick={() => send()} disabled={busy} style={sendBtn}>
          {busy ? T[lang].thinking : T[lang].send}
        </button>
      </div>

      <p style={finePrint}>{T[lang].disclaimer}</p>
    </div>
  );
}

const box: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14, padding: 12, width: "min(92vw, 960px)", margin: "14px auto"
};
const thread: React.CSSProperties = { background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 10, maxHeight: 260, overflow: "auto" };
const userBubble: React.CSSProperties = { background: "#2a3754", color: "#e8f0ff", borderRadius: 10, padding: "8px 10px", margin: "6px 0 6px auto", maxWidth: "85%" };
const aiBubble: React.CSSProperties = { background: "#2f2a4f", color: "#f4e9ff", borderRadius: 10, padding: "8px 10px", margin: "6px auto 6px 0", maxWidth: "85%" };
const inputBox: React.CSSProperties = { flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)", color: "#e8f0ff" };
const notesBox: React.CSSProperties = { width: "100%", height: 64, borderRadius: 10, padding: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.25)", color: "#e8f0ff", marginTop: 8 };
const sendBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, background: "linear-gradient(135deg,#5EE6A4,#7CE3F7)", border: "none", color: "#0b1220", fontWeight: 700, cursor: "pointer" };
const finePrint: React.CSSProperties = { fontSize: 11, opacity: 0.8, marginTop: 8 };
const engineBadge: React.CSSProperties = { fontSize: 12, padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)" };
const langSel: React.CSSProperties = { background:"transparent", color:"#cfe7ff", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"4px 8px" };
