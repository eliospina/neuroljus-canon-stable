/**
 * NL-VISION PROTECTED FILE
 * This file is part of the stable, polished NL-VISION demo (CareChat + LiveVitals + Holistic).
 * Do not modify unless you *intentionally* update the demo.
 * If you need to change it, include the commit message token: [ALLOW-NLVISION-EDIT]
 * Frozen baseline tag: v1.0-nlvision-stable
 */

// src/components/CareChat.tsx
import { useEffect, useRef, useState } from "react";
import type { AskLabel, AskSegment, AskSource } from "@/lib/ask/expert";

type Msg = {
  role: "user" | "assistant";
  content: string;
  segments?: AskSegment[];
  sources?: AskSource[];
};

const LABELS: Record<Lang, Record<AskLabel, string>> = {
  es: { science: "Ciencia", practice: "Práctica conocida", person: "Datos de esta persona", idea: "Idea nueva de la IA", safety: "Seguridad" },
  en: { science: "Science", practice: "Known practice", person: "Data from this person", idea: "New idea from the AI", safety: "Safety" },
  sv: { science: "Vetenskap", practice: "Känd praxis", person: "Data om den här personen", idea: "Ny idé från AI:n", safety: "Säkerhet" },
};

const LABEL_STYLE: Record<AskLabel, React.CSSProperties> = {
  science: { background: "#dfe7e1", color: "#2f4d45" },
  practice: { background: "#ebe5da", color: "#4f5b57" },
  person: { background: "#e4e9f4", color: "#2f3f5f" },
  idea: { background: "#f1e3cd", color: "#6d4d1f" },
  safety: { background: "#9a4a36", color: "#fff8f2" },
};

const chip: React.CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  borderRadius: 999,
  padding: "2px 8px",
  marginBottom: 4,
};
type Lang = "sv" | "en" | "es";
type Engine = "default" | "nemotron";

const T: Record<Lang, Record<string, string>> = {
  sv: {
    title: "Care Chat",
    subtitle: "AI-stöd för omsorgsobservation",
    placeholder: "Skriv din fråga här…",
    send: "Skicka",
    thinking: "Tänker…",
    quick1: "Tolka mina senaste NL-VISION-rörelsesignaler vetenskapligt.",
    quick2: "Behöver vi sänka stimuli utifrån signalerna?",
    quick3: "Vilka protokollsteg föreslår du från det du ser?",
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
    quick1: "Scientifically interpret my latest NL-VISION movement signals.",
    quick2: "Should we lower stimulation based on the signals?",
    quick3: "What protocol steps do you suggest from what you see?",
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
    quick1: "Interpreta científicamente mis últimas señales de movimiento NL-VISION.",
    quick2: "¿Debemos reducir estímulos según las señales?",
    quick3: "¿Qué pasos de protocolo sugieres a partir de lo que ves?",
    disclaimer: "Organiza observaciones y preguntas de cuidado. Ante urgencia o dolor persistente, contacta salud.",
    notesPlaceholder: "Notas del cuidador (opcional, privado)",
    error: "Tengo un problema técnico ahora mismo. Inténtalo de nuevo en un momento.",
    engineOpenAI: "IA: OpenAI",
    engineHeur: "IA: Heurística",
  },
};

const GREETING: Record<Lang, string> = {
  sv:
    "Hej. Jag är Neuroljus Care Reflection. När NL-VISION har sparat lokala signaler kan jag göra en vetenskaplig simulering av dem — rörelseband, hand nära ansikte, blinkningar — som hypoteser för dig, inte som känsla eller diagnos. Fråga om dina rörelser, eller beskriv vad du såg i rummet. Vägen: NL-VISION → Care Room → protokoll.",
  en:
    "Hello. I’m Neuroljus Care Reflection. When NL-VISION has stored local signals, I can run a scientific simulation of them — movement bands, hand-near-face, blinks — as hypotheses for you, not as emotion or diagnosis. Ask about your movements, or describe what you saw in the room. Path: NL-VISION → Care Room → protocol.",
  es:
    "Hola. Soy Neuroljus Care Reflection. Cuando NL-VISION guarda señales locales, puedo hacer una simulación científica de ellas — bandas de movimiento, mano cerca del rostro, parpadeos — como hipótesis para ti, no como emoción ni diagnóstico. Pregunta por tus movimientos, o describe lo que viste en la habitación. Camino: NL-VISION → Care Room → protocolo.",
};

const greetingValues = new Set(Object.values(GREETING));

export default function CareChat() {
  const [lang, setLang] = useState<Lang>("sv");
  const [engine, setEngine] = useState<Engine>("default");
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
        body: JSON.stringify({
          messages: msgs.concat({ role: "user", content }),
          metrics,
          notes,
          lang,
          ...(engine === "nemotron" ? { provider: "nemotron" } : {}),
        }),
      });
      const j = await r.json();
      setMsgs((m) => [...m, { role: "assistant", content: j.content, segments: j.segments, sources: j.sources }]);
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
          <span style={engineBadge}>{engine === "nemotron" ? "Powered by NVIDIA Nemotron" : "Neuroljus AI"}</span>
          <select value={engine} onChange={(e)=>setEngine(e.target.value as Engine)} style={langSel} aria-label="AI engine">
            <option value="default">Claude</option>
            <option value="nemotron">Nemotron</option>
          </select>
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
          <div key={i} style={m.role === "user" ? userBubble : aiBubble}>
            {m.segments && m.segments.length > 0 ? (
              <>
                {m.segments.map((seg, k) => (
                  <div key={k} style={{ marginBottom: 8 }}>
                    <span style={{ ...chip, ...LABEL_STYLE[seg.label] }}>{LABELS[lang][seg.label]}</span>
                    <div>
                      {seg.text}
                      {seg.sources.map((n) => {
                        const src = m.sources?.find((x) => x.n === n);
                        return src ? (
                          <a key={n} href={`https://doi.org/${src.doi}`} target="_blank" rel="noreferrer" title={src.title} style={{ marginLeft: 4, fontWeight: 700 }}>
                            [{n}]
                          </a>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              m.content
            )}
          </div>
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
