/**
 * NL-VISION PROTECTED FILE
 * This file is part of the stable, polished NL-VISION demo (CareChat + LiveVitals + Vision).
 * Do not modify unless you *intentionally* update the demo.
 * If you need to change it, include the commit message token: [ALLOW-NLVISION-EDIT]
 * Engine: MediaPipe Tasks Vision (FaceLandmarker + HandLandmarker) — v2
 */

import Link from "next/link";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import {
  DrawingUtils,
  FaceLandmarker,
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import LiveVitals from "../../components/LiveVitals";
import CareChat from "../../components/CareChat";
import {
  appendLocalSample,
  averagePoint,
  computeEAR,
  computeMouthOpen,
  dist,
  isHandNearFace,
  type FrameSample,
  type Point2,
  aggregateSamples,
} from "@/lib/nlVision/signals";

const WASM_ROOT = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.0/wasm";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

function toPoints(landmarks: Array<{ x: number; y: number; z?: number }> | undefined): Point2[] {
  if (!landmarks?.length) return [];
  return landmarks.map((p) => ({ x: p.x, y: p.y }));
}

export default function NLVisionTasksPage() {
  return (
    <>
      <Head>
        <title>NL-VISION v2 — Neuroljus</title>
        <meta
          name="description"
          content="On-device MediaPipe Tasks Vision lab: raw face and hand landmarks as local care signals — not emotion AI."
        />
        <meta name="theme-color" content="#09090b" />
      </Head>
      <NLVisionTasks />
      <div className="below">
        <LiveVitals />
        <div style={{ marginTop: 24 }}>
          <CareChat />
        </div>
      </div>
      <style jsx>{`
        .below {
          width: min(960px, calc(100% - 32px));
          margin: 0 auto 48px;
        }
      `}</style>
    </>
  );
}

function NLVisionTasks() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopRef = useRef<() => void>(() => {});
  const faceRef = useRef<FaceLandmarker | null>(null);
  const handRef = useRef<HandLandmarker | null>(null);
  const showPreviewRef = useRef(true);
  const lowStimRef = useRef(false);

  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [lowStim, setLowStim] = useState(false);
  const [dbg, setDbg] = useState({ fps: 0, hands: 0, face: 0 });

  const metricsRef = useRef<FrameSample[]>([]);
  const lastPtsRef = useRef<{ face?: Point2; lh?: Point2; rh?: Point2 }>({});
  const blinkTimesRef = useRef<number[]>([]);
  const lastBlinkTsRef = useRef(0);
  const lastEarRef = useRef(1);

  useEffect(() => {
    showPreviewRef.current = showPreview;
  }, [showPreview]);
  useEffect(() => {
    lowStimRef.current = lowStim;
  }, [lowStim]);

  useEffect(() => () => stopRef.current(), []);

  async function ensureModels() {
    if (faceRef.current && handRef.current) return;
    setLoadingModels(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
      faceRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
      handRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 2,
      });
    } catch (gpuError) {
      // CPU fallback for machines without WebGL / GPU delegate
      console.warn("GPU delegate failed, falling back to CPU", gpuError);
      const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
      faceRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: "CPU" },
        runningMode: "VIDEO",
        numFaces: 1,
      });
      handRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate: "CPU" },
        runningMode: "VIDEO",
        numHands: 2,
      });
    } finally {
      setLoadingModels(false);
    }
  }

  async function start() {
    setErr(null);
    try {
      await ensureModels();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const drawing = new DrawingUtils(ctx);

      let alive = true;
      let lastTs = performance.now();

      const tick = window.setInterval(() => {
        const buf = metricsRef.current;
        if (!buf.length) return;
        const until = Date.now();
        const slice = buf.splice(0, buf.length);
        blinkTimesRef.current = blinkTimesRef.current.filter((ts) => ts >= until - 60_000);
        const row = aggregateSamples(slice, until, blinkTimesRef.current.length);
        if (row && typeof window !== "undefined") {
          try {
            appendLocalSample(window.localStorage, row);
          } catch {
            /* quota */
          }
        }
      }, 1000);

      const loop = () => {
        if (!alive || !videoRef.current || !faceRef.current || !handRef.current) return;
        const v = videoRef.current;
        const c = canvasRef.current!;
        if (v.videoWidth) {
          c.width = v.videoWidth;
          c.height = v.videoHeight;
        }

        const now = performance.now();
        const faceResult = faceRef.current.detectForVideo(v, now);
        const handResult = handRef.current.detectForVideo(v, now);

        ctx.save();
        ctx.clearRect(0, 0, c.width, c.height);
        if (showPreviewRef.current) {
          ctx.drawImage(v, 0, 0, c.width, c.height);
        } else {
          ctx.fillStyle = "#09090b";
          ctx.fillRect(0, 0, c.width, c.height);
        }

        const faceLm = toPoints(faceResult.faceLandmarks?.[0]);
        const hands = handResult.landmarks || [];
        const leftHand = toPoints(hands[0]);
        const rightHand = toPoints(hands[1]);

        const lineW = lowStimRef.current ? 1.5 : 2.5;
        const faceColor = lowStimRef.current ? "#86efac" : "#3ecf9a";
        const handColor = lowStimRef.current ? "#93c5fd" : "#7dd3fc";

        if (faceLm.length && faceResult.faceLandmarks?.[0]) {
          drawing.drawConnectors(
            faceResult.faceLandmarks[0],
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: faceColor, lineWidth: lineW * 0.35 }
          );
          drawing.drawConnectors(
            faceResult.faceLandmarks[0],
            FaceLandmarker.FACE_LANDMARKS_CONTOURS,
            { color: faceColor, lineWidth: lineW }
          );
        }
        hands.forEach((hand) => {
          drawing.drawConnectors(hand, HandLandmarker.HAND_CONNECTIONS, {
            color: handColor,
            lineWidth: lineW,
          });
          drawing.drawLandmarks(hand, { color: "#fafafa", lineWidth: 1, radius: lowStimRef.current ? 2 : 3 });
        });
        ctx.restore();

        const fC = averagePoint(faceLm);
        const lC = averagePoint(leftHand);
        const rC = averagePoint(rightHand);
        const last = lastPtsRef.current;
        const faceMove = dist(fC, last.face);
        const handsMove = dist(lC, last.lh) + dist(rC, last.rh);
        lastPtsRef.current = { face: fC, lh: lC, rh: rC };

        const ear = computeEAR(faceLm);
        const mouthOpen = computeMouthOpen(faceLm);
        const t = Date.now();
        if (ear !== undefined) {
          const th = 0.24;
          if (lastEarRef.current >= th && ear < th && t - lastBlinkTsRef.current > 250) {
            blinkTimesRef.current.push(t);
            lastBlinkTsRef.current = t;
          }
          lastEarRef.current = ear;
        }

        metricsRef.current.push({
          t,
          hasFace: faceLm.length > 0,
          leftHand: leftHand.length > 0,
          rightHand: rightHand.length > 0,
          handsCount: (leftHand.length ? 1 : 0) + (rightHand.length ? 1 : 0),
          faceMove,
          handsMove,
          handNearFace: isHandNearFace(fC, lC, rC),
          ear,
          mouthOpen,
        });

        const fps = 1000 / Math.max(1, now - lastTs);
        lastTs = now;
        setDbg({
          fps: Math.round(fps),
          hands: (leftHand.length ? 1 : 0) + (rightHand.length ? 1 : 0),
          face: faceLm.length ? 1 : 0,
        });

        requestAnimationFrame(loop);
      };

      const stop = () => {
        alive = false;
        clearInterval(tick);
        try {
          (video.srcObject as MediaStream | null)?.getTracks().forEach((track) => track.stop());
        } catch {
          /* ignore */
        }
        video.srcObject = null;
      };
      stopRef.current = stop;
      setRunning(true);
      setReady(true);
      requestAnimationFrame(loop);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Cannot access camera. Check browser & system permissions.";
      setErr(message);
      setRunning(false);
    }
  }

  function stop() {
    try {
      stopRef.current();
    } catch {
      /* ignore */
    }
    setRunning(false);
  }

  function exportCSV() {
    const raw = window.localStorage.getItem("nlvision_holistic_v1") || "[]";
    let arr: Array<Record<string, unknown>> = [];
    try {
      arr = JSON.parse(raw);
    } catch {
      arr = [];
    }
    const header = [
      "t0",
      "t1",
      "hasFace",
      "handsAvg",
      "faceMoveAvg",
      "handsMoveAvg",
      "handNearPct",
      "earAvg",
      "mouthOpenAvg",
      "blinksPerMin",
      "engine",
    ];
    const lines = [header.join(",")].concat(
      arr.map((row) => header.map((key) => String(row[key] ?? "")).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nlvision_tasks_v2_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <div className="statusbar" aria-hidden="true">
        <span>
          neuroljus://local · <b>nl_vision_tasks_v2</b> · network=off · video=on-device
        </span>
        <span>latency local · caregiver_authority=true</span>
      </div>

      <header className="topnav">
        <div className="brand">
          <Link href="/">Neuroljus</Link>
          <span>/</span>
          <b>NL-VISION</b>
        </div>
        <nav>
          <Link href="/labs/future-care-room">Care Room</Link>
          <Link href="/labs/robot-interface">Protocol Workspace</Link>
        </nav>
      </header>

      <main className="shell">
        <p className="cli">$ neuroljus vision --engine tasks-vision@1.0.0</p>
        <h1>NL-VISION · Tasks v2</h1>
        <p className="lede">
          Raw on-device landmarks (face + hands). Numbers for caregiver reflection —
          not emotion, not diagnosis, not a translation of a person.
        </p>

        <div className="legend" aria-label="Signal legend">
          <span>
            <i className="face" /> face mesh
          </span>
          <span>
            <i className="hand" /> hand skeleton
          </span>
          <span>signals → localStorage → Care Room / Robot Lab</span>
        </div>

        <div className="actions">
          {!running ? (
            <button type="button" className="primary" onClick={start} disabled={loadingModels}>
              {loadingModels ? "Loading models…" : "Start camera"}
            </button>
          ) : (
            <button type="button" className="primary" onClick={stop}>
              Stop
            </button>
          )}
          <button type="button" className="ghost" onClick={exportCSV}>
            Export CSV
          </button>
          <label className="toggle">
            <input
              type="checkbox"
              checked={showPreview}
              onChange={(e) => setShowPreview(e.target.checked)}
            />
            Show camera
          </label>
          <label className="toggle">
            <input type="checkbox" checked={lowStim} onChange={(e) => setLowStim(e.target.checked)} />
            Low-stimulus draw
          </label>
        </div>

        <div className="stage">
          <video ref={videoRef} playsInline muted preload="auto" className="video" />
          <canvas ref={canvasRef} className="canvas" />
          <div className="hud">
            <div>FPS {dbg.fps}</div>
            <div>face {dbg.face ? "yes" : "—"}</div>
            <div>hands {dbg.hands}</div>
          </div>
        </div>

        {!ready && !err && (
          <p className="hint">Allow camera access. Prefer Chrome/Edge on a well-lit desk.</p>
        )}
        {err && <p className="error">{err}</p>}
      </main>

      <style jsx>{`
        .page {
          min-height: 100dvh;
          background: #09090b;
          color: #fafafa;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        }
        .statusbar {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 8px 20px;
          border-bottom: 1px solid #27272a;
          color: #71717a;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
        }
        .statusbar :global(b) {
          color: #3ecf9a;
        }
        .topnav {
          width: min(960px, calc(100% - 32px));
          margin: 0 auto;
          padding: 16px 0;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          border-bottom: 1px solid #27272a;
        }
        .brand {
          display: flex;
          gap: 8px;
          align-items: center;
          font-weight: 700;
        }
        .brand :global(a) {
          color: #fafafa;
          text-decoration: none;
        }
        .brand span {
          color: #52525b;
        }
        .brand b {
          color: #a1a1aa;
          font-weight: 600;
        }
        nav {
          display: flex;
          gap: 14px;
        }
        nav :global(a) {
          color: #3ecf9a;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }
        .shell {
          width: min(960px, calc(100% - 32px));
          margin: 0 auto;
          padding: 28px 0 20px;
        }
        .cli {
          margin: 0 0 8px;
          color: #3ecf9a;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
        }
        h1 {
          margin: 0;
          font-size: 28px;
        }
        .lede {
          margin: 10px 0 0;
          color: #a1a1aa;
          max-width: 62ch;
          line-height: 1.55;
        }
        .legend {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          color: #71717a;
          font-size: 12px;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
        }
        .legend i {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 2px;
          margin-right: 6px;
        }
        .legend i.face {
          background: #3ecf9a;
        }
        .legend i.hand {
          background: #7dd3fc;
        }
        .actions {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .primary,
        .ghost {
          min-height: 40px;
          padding: 0 14px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }
        .primary {
          border: 1px solid #3ecf9a;
          background: #3ecf9a;
          color: #09090b;
        }
        .primary:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .ghost {
          border: 1px solid #3f3f46;
          background: transparent;
          color: #fafafa;
        }
        .toggle {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          color: #a1a1aa;
          font-size: 12px;
        }
        .stage {
          position: relative;
          margin-top: 16px;
          border: 1px solid #27272a;
          border-radius: 6px;
          overflow: hidden;
          background: #000;
          aspect-ratio: 16 / 9;
        }
        .video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          position: absolute;
          inset: 0;
        }
        .canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        .hud {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 8px 10px;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          background: rgba(9, 9, 11, 0.72);
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          color: #e4e4e7;
          display: grid;
          gap: 2px;
        }
        .hint {
          margin-top: 12px;
          color: #71717a;
          font-size: 13px;
        }
        .error {
          margin-top: 12px;
          color: #f87171;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
