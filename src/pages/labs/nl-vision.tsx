/**
 * NL-VISION PROTECTED FILE
 * This file is part of the stable, polished NL-VISION demo (CareChat + LiveVitals + Holistic).
 * Do not modify unless you *intentionally* update the demo.
 * If you need to change it, include the commit message token: [ALLOW-NLVISION-EDIT]
 * Frozen baseline tag: v1.0-nlvision-stable
 */

/* ---------- DEMO: Holistic + live analytics ---------- */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import LiveVitals from "../../components/LiveVitals";
import CareChat   from "../../components/CareChat";
import Script     from "next/script";


/* ---------- PAGE (scripts loading + Holistic component) ---------- */
export default function NLVisionHolisticPage() {
  return (
    <>
      {/* MediaPipe Holistic from CDN */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js"
        strategy="afterInteractive"
      />

      {/* Optional Firebase (safe to keep even if unused) */}
      <Script
        src="https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore-compat.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://www.gstatic.com/firebasejs/10.12.3/firebase-auth-compat.js"
        strategy="afterInteractive"
      />

      {/* Vision UI */}
      <NLVisionHolistic />

      {/* Dashboard below camera */}
      <div style={{ marginTop: 16 }}>
        <LiveVitals />
      </div>

      {/* Caregiver Chat below dashboard */}
      <div style={{ marginTop: 24 }}>
        <CareChat />
      </div>
    </>
  );
}
type MetricSample = {
  t: number;
  hasFace: boolean;
  leftHand: boolean;
  rightHand: boolean;
  handsCount: number;
  faceMove: number;
  handsMove: number;
  handNearFace: boolean;
  ear?: number;        // eye aspect ratio
  mouthOpen?: number;  // mouth open ratio
};

function NLVisionHolistic() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopRef = useRef<() => void>(() => {});

  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // UI toggles
  const [showPreview, setShowPreview] = useState(false);
  const [lowStim, setLowStim] = useState(false);
  const [mono, setMono] = useState(false);
  const [lowLight, setLowLight] = useState(false);

  // Chat empathetic toggle
  const [showChat, setShowChat] = useState(false);

  // small debug badge
  const [dbg, setDbg] = useState({ fps: 0, hands: 0, face: 0 });

  // metrics buffers
  const metricsRef = useRef<MetricSample[]>([]);
  const lastPtsRef = useRef<{ face?: {x:number;y:number}; lh?: {x:number;y:number}; rh?: {x:number;y:number} }>({});
  const blinkTimesRef = useRef<number[]>([]);
  const lastBlinkTsRef = useRef<number>(0);
  const lastEarRef = useRef<number>(1);

  const fitCanvas = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth || 1280;
    c.height = v.videoHeight || 720;
  };

  const bgFilter = () => {
    const f: string[] = [];
    if (mono) f.push("grayscale(100%)");
    if (lowLight) f.push("brightness(70%)");
    return f.length ? f.join(" ") : "none";
  };

  // utils
  const dist = (a?: {x:number;y:number}, b?: {x:number;y:number}) =>
    (!a || !b) ? 0 : Math.hypot(a.x - b.x, a.y - b.y);
  const pt = (lm: any[], i: number) => (lm && lm[i]) ? { x: lm[i].x, y: lm[i].y } : undefined;

  const computeEAR = (faceLm: any[]): number | undefined => {
    // left eye
    const L_up = pt(faceLm, 159), L_down = pt(faceLm, 145);
    const L_l  = pt(faceLm, 33),  L_r    = pt(faceLm, 133);
    // right eye
    const R_up = pt(faceLm, 386), R_down = pt(faceLm, 374);
    const R_l  = pt(faceLm, 362), R_r    = pt(faceLm, 263);
    const left = (dist(L_up, L_down) / (dist(L_l, L_r) || 1e-6));
    const right= (dist(R_up, R_down) / (dist(R_l, R_r) || 1e-6));
    if (!isFinite(left) || !isFinite(right)) return undefined;
    return (left + right) / 2;
  };

  const computeMouthOpen = (faceLm: any[]): number | undefined => {
    const up = pt(faceLm, 13), down = pt(faceLm, 14);
    const l = pt(faceLm, 61),  r    = pt(faceLm, 291);
    const ratio = dist(up, down) / (dist(l, r) || 1e-6);
    return isFinite(ratio) ? ratio : undefined;
  };

  const start = async () => {
    setErr(null);
    try {
      // 1) camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const v = videoRef.current!;
      v.srcObject = stream;
      await new Promise<void>((res) => (v.onloadedmetadata = () => res()));
      await v.play();
      fitCanvas();

      // 2) holistic availability
      const w = window as any;
      if (!w.Holistic || !w.drawConnectors || !w.drawLandmarks) {
        setErr("MediaPipe Holistic is still loading. Wait 1–2s and try again.");
        return;
      }

      // 3) model
      const holistic = new w.Holistic({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${f}`,
      });
      holistic.setOptions({
        selfieMode: true,
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const c = canvasRef.current!;
      const ctx = c.getContext("2d");

      holistic.onResults((res: any) => {
        if (!ctx) return;
        ctx.save();
        ctx.clearRect(0, 0, c.width, c.height);

        // background
        if (showPreview) {
          ctx.filter = bgFilter();
          ctx.drawImage(videoRef.current!, 0, 0, c.width, c.height);
          ctx.filter = "none";
        } else {
          ctx.fillStyle = "rgba(0,0,0,0.78)";
          ctx.fillRect(0, 0, c.width, c.height);
        }

        // landmarks
        const faceLm = res.faceLandmarks || [];
        const lhLm   = res.leftHandLandmarks || [];
        const rhLm   = res.rightHandLandmarks || [];

        const lineW = lowStim ? 2 : 3;
        const dotR  = lowStim ? 1.2 : 1.6;
        const colFace   = mono ? "#d9d0f5" : (lowStim ? "#c7b7f6" : "#A685F7");
        const colHand   = mono ? "#cfd5dc" : (lowStim ? "#9bdff0" : "#7CE3F7");
        const colHandPt = mono ? "#e3e7ee" : (lowStim ? "#88dcb0" : "#5EE6A4");

        if (faceLm.length) (window as any).drawLandmarks(ctx, faceLm, { color: colFace, radius: dotR });
        if (lhLm.length) {
          (window as any).drawConnectors(ctx, lhLm, (window as any).HAND_CONNECTIONS, { color: colHand, lineWidth: lineW });
          (window as any).drawLandmarks(ctx, lhLm, { color: colHandPt, radius: dotR });
        }
        if (rhLm.length) {
          (window as any).drawConnectors(ctx, rhLm, (window as any).HAND_CONNECTIONS, { color: colHand, lineWidth: lineW });
          (window as any).drawLandmarks(ctx, rhLm, { color: colHandPt, radius: dotR });
        }

        // per-frame analytics
        const t = Date.now();
        const avg = (lm: any[]) => {
          if (!lm.length) return undefined;
          const x = lm.reduce((a: number, p: any) => a + p.x, 0) / lm.length;
          const y = lm.reduce((a: number, p: any) => a + p.y, 0) / lm.length;
          return { x, y };
        };
        const fC = avg(faceLm);
        const lC = avg(lhLm);
        const rC = avg(rhLm);
        const last = lastPtsRef.current;

        const faceMove  = dist(fC, last.face);
        const lhMove    = dist(lC, last.lh);
        const rhMove    = dist(rC, last.rh);
        const handsMove = lhMove + rhMove;

        const nearFace = (lC && fC && dist(lC, fC) < 0.12) || (rC && fC && dist(rC, fC) < 0.12) ? true : false;

        lastPtsRef.current = { face: fC, lh: lC, rh: rC };

        const ear = computeEAR(faceLm) ?? undefined;             // closed eyes ~ < 0.24
        const mouthOpen = computeMouthOpen(faceLm) ?? undefined; // prototype mouth openness ratio

        // blink detection (simple)
        if (ear !== undefined) {
          const th = 0.24;
          const now = t;
          if (lastEarRef.current >= th && ear < th && now - lastBlinkTsRef.current > 250) {
            blinkTimesRef.current.push(now);
            lastBlinkTsRef.current = now;
            const cutoff = now - 60_000;
            blinkTimesRef.current = blinkTimesRef.current.filter(ts => ts >= cutoff);
          }
          lastEarRef.current = ear;
        }

        metricsRef.current.push({
          t,
          hasFace: !!faceLm.length,
          leftHand: !!lhLm.length,
          rightHand: !!rhLm.length,
          handsCount: (lhLm.length ? 1 : 0) + (rhLm.length ? 1 : 0),
          faceMove,
          handsMove,
          handNearFace: nearFace,
          ear,
          mouthOpen,
        });

        setDbg((d) => ({
          ...d,
          hands: (lhLm.length ? 1 : 0) + (rhLm.length ? 1 : 0),
          face: faceLm.length ? 1 : 0,
        }));

        ctx.restore();
      });

      // render loop + fps
      let alive = true;
      let lastTs = performance.now();
      const loop = async () => {
        if (!alive) return;
        fitCanvas();
        await holistic.send({ image: videoRef.current! });
        const now = performance.now();
        const fps = 1000 / (now - lastTs);
        lastTs = now;
        setDbg((d) => ({ ...d, fps: Math.round(fps) }));
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      // aggregate once per second
      const tick = setInterval(() => {
        const buf = metricsRef.current;
        if (!buf.length) return;
        const until = Date.now();
        const slice = buf.splice(0, buf.length);

        const hasFace = slice.some((s) => s.hasFace);
        const handsAvg = slice.reduce((a, s) => a + s.handsCount, 0) / slice.length;
        const faceMoveAvg = slice.reduce((a, s) => a + s.faceMove, 0) / slice.length;
        const handsMoveAvg = slice.reduce((a, s) => a + s.handsMove, 0) / slice.length;
        const handNearPct = slice.filter((s) => s.handNearFace).length / slice.length;

        const earAvg = avgOrUndef(slice.map(s => s.ear).filter(isNum));
        const mouthAvg = avgOrUndef(slice.map(s => s.mouthOpen).filter(isNum));

        const now = until;
        blinkTimesRef.current = blinkTimesRef.current.filter(ts => ts >= now - 60_000);
        const blinksPerMin = blinkTimesRef.current.length;

        const row = {
          t0: slice[0].t,
          t1: until,
          hasFace,
          handsAvg: +handsAvg.toFixed(3),
          faceMoveAvg: +faceMoveAvg.toFixed(5),
          handsMoveAvg: +handsMoveAvg.toFixed(5),
          handNearPct: +handNearPct.toFixed(3),
          earAvg: earAvg !== undefined ? +earAvg.toFixed(4) : null,
          mouthOpenAvg: mouthAvg !== undefined ? +mouthAvg.toFixed(4) : null,
          blinksPerMin,
        };

        const key = "nlvision_holistic_v1";
        const prev = (typeof window !== "undefined" && window.localStorage.getItem(key)) || "[]";
        let arr: any[] = [];
        try { arr = JSON.parse(prev); } catch {}
        arr.push(row);
        try { window.localStorage.setItem(key, JSON.stringify(arr)); } catch {}
      }, 1000);

      const stop = () => {
        try { clearInterval(tick); } catch {}
        try { (videoRef.current?.srcObject as MediaStream | null)?.getTracks()?.forEach((t) => t.stop()); } catch {}
        if (videoRef.current) videoRef.current.srcObject = null;
        alive = false;
      };
      stopRef.current = stop;

      setRunning(true);
      setReady(true);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Cannot access camera. Check browser & system permissions.");
    }
  };

  const stop = () => { try { stopRef.current(); } catch {} setRunning(false); };
  useEffect(() => () => stop(), []);

  const exportCSV = () => {
    const key = "nlvision_holistic_v1";
    const raw = (typeof window !== "undefined" && window.localStorage.getItem(key)) || "[]";
    let arr: any[] = [];
    try { arr = JSON.parse(raw); } catch {}
    const header = [
      "t0","t1","hasFace","handsAvg","faceMoveAvg","handsMoveAvg",
      "handNearPct","earAvg","mouthOpenAvg","blinksPerMin"
    ];
    const lines = [header.join(",")].concat(arr.map((r) => header.map((h) => r[h]).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `nlvision_metrics_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- UI ----
  return (
    <div style={S.page}>
      <h1 style={S.h1}>NL-VISION · Holistic</h1>
      <p style={S.sub}>Observation prototype · Face + Hands · On-device metrics</p>

      <section style={S.robotCard} aria-label="Robot Care Interface demo">
        <div>
          <p style={S.robotKicker}>Next lab · care robotics</p>
          <h2 style={S.robotTitle}>From observation to care protocol</h2>
          <p style={S.robotText}>
            NL-VISION explores local observation signals. Robot Care Interface turns
            caregiver-authored routines into an open protocol for future robots,
            devices, and care environments.
          </p>
        </div>
        <div style={S.robotActions}>
          <a href="/labs/robot-interface" style={S.robotPrimary}>
            Open Robot Demo
          </a>
          <a href="/" style={S.robotSecondary}>
            View public vision
          </a>
        </div>
      </section>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        {!running ? <button onClick={start} style={S.btn}>Start Camera</button>
                  : <button onClick={stop}  style={S.btn}>Stop</button>}
        <button onClick={exportCSV} style={S.btn}>Export CSV</button>
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <label style={S.toggle}><input type="checkbox" checked={showPreview} onChange={e=>setShowPreview(e.target.checked)} /> Show preview</label>
        <label style={S.toggle}><input type="checkbox" checked={lowStim} onChange={e=>setLowStim(e.target.checked)} /> Low-stimulus</label>
        <label style={S.toggle}><input type="checkbox" checked={mono} onChange={e=>setMono(e.target.checked)} /> Monochrome</label>
        <label style={S.toggle}><input type="checkbox" checked={lowLight} onChange={e=>setLowLight(e.target.checked)} /> Low-light</label>
      </div>

      <div style={S.stage}>
        <video ref={videoRef} playsInline muted preload="auto"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", background:"#000" }} />
        <canvas ref={canvasRef} style={S.canvas} />

        <div style={{
          position:"absolute", top:8, left:8, padding:"6px 8px",
          background:"rgba(0,0,0,.45)", border:"1px solid rgba(255,255,255,.2)",
          borderRadius:8, fontSize:12, color:"#e9f2ff"
        }}>
          <div>FPS: {dbg.fps}</div>
          <div>Hands: {dbg.hands}</div>
          <div>Face: {dbg.face}</div>
        </div>
      </div>

      {!ready && !err && <p style={{ ...S.sub, marginTop: 10 }}>Click “Start Camera” and allow access.</p>}
      {err && <p style={{ color:"#ffb4b4", marginTop:10 }}>{err}</p>}
    </div>
  );
}

/* ---------- helpers ---------- */
const isNum = (n:any)=> typeof n==="number" && isFinite(n);
const avgOrUndef = (arr:any[]) => arr.length ? arr.reduce((a:number,b:number)=>a+b,0)/arr.length : undefined;

/* ---------- styles ---------- */
const S: Record<string, any> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 700px at 20% 10%, rgba(94,230,164,0.18), transparent 60%)," +
      "radial-gradient(900px 600px at 80% 20%, rgba(124,227,247,0.18), transparent 60%)," +
      "radial-gradient(1200px 900px at 50% 120%, rgba(166,133,247,0.18), transparent 60%)," +
      "#1E1F3B",
    color: "#fff",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
    display: "flex", flexDirection: "column", alignItems: "center", padding: 18,
  },
  h1: { fontSize: 26, margin: "8px 0 0" },
  sub: { fontSize: 14, opacity: 0.9, margin: "6px 0 12px" },
  robotCard: {
    width: "min(92vw, 960px)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.07)",
    padding: 16,
    margin: "2px 0 14px",
  },
  robotKicker: {
    margin: "0 0 5px",
    color: "#9fe8cf",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  robotTitle: { margin: "0 0 6px", fontSize: 18, lineHeight: 1.2 },
  robotText: { margin: 0, color: "#d9e5f2", fontSize: 14, lineHeight: 1.5 },
  robotActions: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  robotPrimary: {
    minHeight: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 13px",
    borderRadius: 10,
    background: "linear-gradient(135deg,#5EE6A4,#7CE3F7)",
    color: "#0b1220",
    fontWeight: 800,
    textDecoration: "none",
  },
  robotSecondary: {
    minHeight: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 13px",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: 10,
    color: "#cfe7ff",
    fontWeight: 800,
    textDecoration: "none",
  },
  btn: {
    padding: 12, background: "linear-gradient(135deg,#5EE6A4,#7CE3F7)",
    border: "none", borderRadius: 10, color: "#0b1220", fontWeight: 700, cursor: "pointer",
  },
  toggle: { fontSize: 13, opacity: 0.9, display: "flex", gap: 6, alignItems: "center" },
  stage: {
    width: "min(92vw, 960px)", aspectRatio: "16 / 9", borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.2)",
    overflow: "hidden", position: "relative",
  },
  canvas: { width: "100%", height: "100%", display: "block" },
};
