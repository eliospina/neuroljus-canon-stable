/**
 * NL-VISION PROTECTED FILE
 * This file is part of the stable, polished NL-VISION demo (CareChat + LiveVitals + Holistic).
 * Do not modify unless you *intentionally* update the demo.
 * If you need to change it, include the commit message token: [ALLOW-NLVISION-EDIT]
 * Frozen baseline tag: v1.0-nlvision-stable → evolving on lab/nl-vision-v2 (Tasks Vision)
 */

// src/components/LiveVitals.tsx
import { useEffect, useState } from "react";

type Row = {
  t0: number; t1: number;
  hasFace: boolean;
  handsAvg: number;
  faceMoveAvg: number;
  handsMoveAvg: number;
  handNearPct: number;
  earAvg: number | null;
  mouthOpenAvg: number | null;
  blinksPerMin: number;
  engine?: string;
};

export default function LiveVitals() {
  const [last, setLast] = useState<Partial<Row> | null>(null);
  const [status, setStatus] = useState<{score:number;text:string}>({score:100,text:"Baseline"});

  useEffect(() => {
    const id = setInterval(() => {
      try {
        const raw = localStorage.getItem("nlvision_holistic_v1") || "[]";
        const arr = JSON.parse(raw) as Row[];
        const l = arr[arr.length - 1];
        if (!l) return;
        setLast(l);
        setStatus(computeStatus(l));
      } catch {
        // ignore malformed data
      }
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={box} aria-label="Live vitals dashboard">
      <div style={header}>
        <div style={{fontWeight:700}}>Live Dashboard</div>
        <div>Signal level: <b>{status.text}</b></div>
      </div>

      <Bar label="Hands activity" value={fmt(last?.handsMoveAvg, 4)} raw={last?.handsMoveAvg ?? null} max={0.06} />
      <Bar label="Near face (%)" value={pct(last?.handNearPct)} raw={last?.handNearPct ?? null} max={1} />
      <Bar label="Mouth open (%)" value={pct(last?.mouthOpenAvg)} raw={last?.mouthOpenAvg ?? null} max={1} />
      <Bar label="Blinks / min" value={fmt(last?.blinksPerMin, 0)} raw={last?.blinksPerMin ?? null} max={40} />

      <div style={hint}>
        Movement index only (not emotion). Engine: {(last as { engine?: string } | null)?.engine || "local sample"}.
        Does not infer pain, diagnosis, or inner state.
      </div>
    </div>
  );
}

function computeStatus(l: Partial<Row>) {
  let score = 100;
  if ((l.mouthOpenAvg ?? 0) > 0.38) score -= 15;
  if ((l.handsMoveAvg ?? 0) > 0.02) score -= 20;
  if ((l.handNearPct ?? 0) > 0.35) score -= 15;
  const text = score>=75 ? "Baseline" : score>=55 ? "More activity" : "High activity";
  return { score, text };
}

function fmt(n: number | null | undefined, digits = 2) {
  if (n == null || !isFinite(n)) return null;
  return Number(n).toFixed(digits);
}

function pct(n: number | null | undefined) {
  if (n == null || !isFinite(n)) return null;
  return Math.round(n * 100);
}

function Bar({label, value, raw, max}:{label:string; value:number|string|null; raw:number|null; max:number}) {
  // raw is the 0..max value; value is the display number
  const pctFill = raw==null ? 0 : Math.max(0, Math.min(100, Math.round((raw/max)*100)));
  return (
    <div style={{margin:"6px 0"}} aria-label={label}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,opacity:.9}}>
        <span>{label}</span>
        <span>{value==null ? "–" : value}</span>
      </div>
      <div style={track}>
        <div style={{...fill, width: `${pctFill}%`}} />
      </div>
    </div>
  );
}

const box: React.CSSProperties = {
  background:"rgba(255,255,255,0.06)",
  border:"1px solid rgba(255,255,255,0.12)",
  borderRadius:14, padding:12, width:"min(92vw, 960px)", margin:"14px auto"
};
const header: React.CSSProperties = { display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 };
const track: React.CSSProperties = { height:8, background:"rgba(255,255,255,0.12)", borderRadius:6, overflow:"hidden" };
const fill: React.CSSProperties = { height:"100%", background:"linear-gradient(135deg,#5EE6A4,#7CE3F7)" };
const hint: React.CSSProperties = { marginTop:8, fontSize:11, opacity:.8 };
