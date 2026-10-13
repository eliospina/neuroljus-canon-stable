import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PlannedStep, PlannerInput, PlannerResult, ScenarioId, VisionSnapshot } from "@/lib/careProtocol/types";
import { readLatestLocalVisionSnapshot } from "@/lib/careProtocol/nlVisionBridge";
import { useLang } from "@/components/SiteLayout";
import {
  phoneMapping,
  phoneStateAt,
  SECONDS_PER_MINUTE,
  totalMinutes,
  type PhoneState,
  type RunSpeed,
} from "@/lib/companion/phoneBody";
import { BrownNoise, requestWakeLock, softVibrate } from "@/lib/companion/phoneRuntime";
import { addRun, type RunEnd } from "@/lib/companion/runLog";
import {
  CARD_PICTOS,
  COMMAND_LABELS,
  EXAMPLES,
  fill,
  PHONE_ACTION_TEXT,
  SCENARIO_NAMES,
  UI,
  VISUAL_CARDS,
  type CompanionLang,
} from "@/lib/companion/i18n";

type AgentResponse = {
  ok: true;
  source: "claude" | "fallback" | "risk_screen";
  notice: string | null;
  escalate: boolean;
  escalationMessage: string | null;
  interpretation: string;
  confidence: "low" | "medium" | "high";
  scenario: ScenarioId;
  plannerInput: PlannerInput;
  plan: PlannerResult;
};

type RunPhase = "idle" | "running" | "paused" | "done" | "stopped";

const MAX_CHARS = 500;

function mmss(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function CompanionPage() {
  const [lang, setLang] = useLang("en");
  const copy = UI[lang];

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [vision, setVision] = useState<VisionSnapshot | null>(null);
  const [speed, setSpeed] = useState<RunSpeed>("real");

  const [phase, setPhase] = useState<RunPhase>("idle");
  const [minute, setMinute] = useState(0);
  const [audioOk, setAudioOk] = useState(true);

  const elapsedBefore = useRef(0); // ms accumulated before the current segment
  const segmentStart = useRef(0);
  const timer = useRef<number | null>(null);
  const noise = useRef<BrownNoise | null>(null);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  const notifiedOnce = useRef(false);

  useEffect(() => {
    try {
      setVision(readLatestLocalVisionSnapshot(window.localStorage));
    } catch {
      setVision(null);
    }
  }, []);

  const steps = useMemo<PlannedStep[]>(() => result?.plan.steps ?? [], [result]);
  const env = result?.plannerInput.environment;
  const total = totalMinutes(steps);
  const secPerMin = SECONDS_PER_MINUTE[speed];

  const state: PhoneState | null = useMemo(
    () => (env && phase !== "idle" ? phoneStateAt(steps, env, minute, { noise: true }) : null),
    [env, steps, minute, phase]
  );

  const clearTimer = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };

  const releaseBody = useCallback(() => {
    clearTimer();
    noise.current?.stop();
    noise.current = null;
    void wakeLock.current?.release().catch(() => undefined);
    wakeLock.current = null;
  }, []);

  useEffect(() => releaseBody, [releaseBody]);

  const logRun = useCallback(
    (ended: RunEnd) => {
      if (!result) return;
      try {
        addRun(window.localStorage, {
          scenario: result.scenario,
          commands: steps.map((s) => s.command),
          ended,
        });
      } catch {
        /* storage unavailable */
      }
    },
    [result, steps]
  );

  const tick = useCallback(() => {
    const ms = elapsedBefore.current + (performance.now() - segmentStart.current);
    setMinute(Math.min(total, ms / 1000 / secPerMin));
  }, [total, secPerMin]);

  const startTicking = useCallback(() => {
    segmentStart.current = performance.now();
    clearTimer();
    timer.current = window.setInterval(tick, 250);
  }, [tick]);

  const start = useCallback(async () => {
    if (!result || result.escalate || total <= 0) return;
    // Audio must start inside the tap so mobile browsers allow it.
    const engine = new BrownNoise();
    setAudioOk(engine.start());
    noise.current = engine;
    notifiedOnce.current = false;
    elapsedBefore.current = 0;
    setMinute(0);
    setPhase("running");
    startTicking();
    wakeLock.current = await requestWakeLock();
  }, [result, total, startTicking]);

  const pause = useCallback(() => {
    if (phase !== "running") return;
    elapsedBefore.current += performance.now() - segmentStart.current;
    clearTimer();
    noise.current?.setGain(0);
    setPhase("paused");
  }, [phase]);

  const resume = useCallback(() => {
    if (phase !== "paused") return;
    setPhase("running");
    startTicking();
  }, [phase, startTicking]);

  const stop = useCallback(() => {
    if (phase !== "running" && phase !== "paused") return;
    releaseBody();
    logRun("caregiver_pause");
    setPhase("stopped");
  }, [phase, releaseBody, logRun]);

  const close = useCallback(() => {
    releaseBody();
    setPhase("idle");
    setMinute(0);
  }, [releaseBody]);

  // Drive the body from the deterministic phone state.
  useEffect(() => {
    if (!state) return;
    if (phase === "running") noise.current?.setGain(state.noiseGain);
    if (state.notified && !notifiedOnce.current) {
      notifiedOnce.current = true;
      softVibrate();
    }
    if (state.done && phase === "running") {
      releaseBody();
      softVibrate();
      logRun("completed");
      setPhase("done");
    }
  }, [state, phase, releaseBody, logRun]);

  // Wake Lock is dropped when the tab is hidden; take it back on return.
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState === "visible" && phase === "running" && !wakeLock.current) {
        wakeLock.current = await requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [phase]);

  const prepare = useCallback(
    async (input?: string) => {
      const value = (input ?? text).trim();
      if (!value || busy) return;
      setBusy(true);
      setError(null);
      setPhase("idle");
      try {
        const r = await fetch("/api/protocol-from-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: value, lang, visionContext: vision }),
        });
        const j = (await r.json()) as AgentResponse | { ok: false; error?: string };
        if (!r.ok || !j.ok) {
          setError((j as { error?: string }).error || copy.error);
          setResult(null);
        } else {
          setResult(j);
          window.setTimeout(() => document.getElementById("plan")?.scrollIntoView({ block: "start" }), 50);
        }
      } catch {
        setError(copy.error);
        setResult(null);
      } finally {
        setBusy(false);
      }
    },
    [text, busy, lang, vision, copy.error]
  );

  const actionText = (step: PlannedStep) => {
    const m = phoneMapping[step.command];
    return fill(PHONE_ACTION_TEXT[lang][m.action], {
      light: env?.light ?? 0,
      sound: env?.sound ?? 0,
      distance: env ? env.distance.toFixed(1) : "",
    });
  };

  const cardKey: ScenarioId | "escalated" = result?.escalate ? "escalated" : result?.scenario ?? "sensory_overload";
  const running = phase === "running" || phase === "paused";
  const activeStep = state && state.activeStep >= 0 && state.activeStep < steps.length ? steps[state.activeStep] : null;
  const remaining = (total - minute) * secPerMin;

  return (
    <>
      <Head>
        <title>NeuroLjus Companion — a care robot that starts on your phone</title>
        <meta
          name="description"
          content="Describe what is happening. Claude interprets, a deterministic planner decides, the caregiver presses Start. Today the body is a phone; tomorrow a ROS2 robot."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#efe9df" />
      </Head>

      <div className="page">
        <header className="top">
          <Link href="/" className="brand">
            NeuroLjus <span>Companion</span>
          </Link>
          <div className="lang" role="group" aria-label="Language">
            {(["es", "en", "sv"] as CompanionLang[]).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <main>
          <section className="hero">
            <p className="bodyTag">
              <span aria-hidden="true">📱</span> {copy.body}
            </p>
            <h1>{copy.heroTitle}</h1>
            <p className="sub">{copy.heroSub}</p>
            <ol className="how">
              <li>
                <b>1</b>
                {copy.how1}
              </li>
              <li>
                <b>2</b>
                {copy.how2}
              </li>
              <li>
                <b>3</b>
                {copy.how3}
              </li>
            </ol>
          </section>

          <section className="card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void prepare();
              }}
            >
              <label htmlFor="what" className="label">
                {copy.label}
              </label>
              <textarea
                id="what"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder={copy.placeholder}
                rows={3}
                maxLength={MAX_CHARS}
                enterKeyHint="go"
              />
              <p className="hint">
                <span aria-hidden="true">🎙️</span> {copy.dictate} <span className="count">{text.length}/{MAX_CHARS}</span>
              </p>
              <button type="submit" className="primary wide" disabled={busy || !text.trim()}>
                {busy ? copy.planning : copy.plan}
              </button>
            </form>

            <p className="label small">{copy.examples}</p>
            <div className="examples">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.lang}
                  type="button"
                  className={`example ${ex.escalation ? "warn" : ""}`}
                  disabled={busy}
                  onClick={() => {
                    setText(ex.text);
                    void prepare(ex.text);
                  }}
                >
                  <b>{ex.lang.toUpperCase()}</b>
                  <span>{ex.text}</span>
                </button>
              ))}
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </section>

          {result && (
            <section id="plan" className="results" aria-live="polite">
              {!(result.escalate && result.interpretation === result.escalationMessage) && (
              <div className="card">
                <p className="label small">{copy.interpretation}</p>
                <p className="interp">{result.interpretation}</p>
                <p className="meta">
                  <span>
                    {copy.confidence}: {copy[`conf_${result.confidence}`]}
                  </span>
                  <span>{copy[`source_${result.source}`]}</span>
                  {!result.escalate && <span>{SCENARIO_NAMES[lang][result.scenario]}</span>}
                </p>
                {result.notice && !result.escalate && <p className="notice">{result.notice}</p>}
              </div>
              )}

              {result.escalate ? (
                <div className="card escalation" role="alert">
                  <p className="big">{result.escalationMessage}</p>
                  <p>{copy.noAuto}</p>
                  <p className="only">
                    {steps.map((s) => COMMAND_LABELS[lang][s.command]).join(" · ")}
                  </p>
                  <a className="call" href="tel:112">
                    {copy.call112}
                  </a>
                </div>
              ) : (
                <>
                  <div className="card">
                    <div className="planHead">
                      <h2>{copy.planTitle}</h2>
                      <span>
                        {total} {copy.minutes}
                      </span>
                    </div>
                    {env && (
                      <dl className="targets">
                        <div>
                          <dt>{copy.light}</dt>
                          <dd>{env.light}%</dd>
                        </div>
                        <div>
                          <dt>{copy.sound}</dt>
                          <dd>{env.sound}%</dd>
                        </div>
                        <div>
                          <dt>{copy.distance}</dt>
                          <dd>{env.distance.toFixed(1)} m</dd>
                        </div>
                      </dl>
                    )}
                    <ol className="timeline">
                      {steps.map((step, i) => (
                        <li key={`${step.command}-${i}`}>
                          <span className="min">+{step.offsetMinutes}′</span>
                          <div>
                            <strong>{COMMAND_LABELS[lang][step.command]}</strong>
                            <p>
                              <em className={phoneMapping[step.command].onPhone ? "who phone" : "who you"}>
                                {phoneMapping[step.command].onPhone ? copy.phone : copy.you}
                              </em>
                              {actionText(step)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="startBar">
                    <div className="speed" role="group" aria-label="Speed">
                      {(["real", "demo"] as RunSpeed[]).map((s) => (
                        <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>
                          {s === "real" ? copy.speedReal : copy.speedDemo}
                        </button>
                      ))}
                    </div>
                    <button type="button" className="primary start" onClick={() => void start()}>
                      ▶ {copy.start}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          <footer className="foot">
            <p>{copy.rules}</p>
            <p>{copy.privacy}</p>
            <p>{copy.bodyNote}</p>
            <nav>
              <Link href="/care-agent">{copy.navAgent}</Link>
              <Link href="/labs/robot-interface">{copy.navWorkspace}</Link>
              <Link href="/">{copy.navHome}</Link>
            </nav>
          </footer>
        </main>
      </div>

      {phase !== "idle" && result && (
        <div className="runner" role="dialog" aria-modal="true" aria-label={copy.title}>
          {running && state && (
            <>
              <div className="runTop">
                <span>
                  {activeStep
                    ? `${copy.step} ${state.activeStep + 1} ${copy.of} ${steps.length} · ${COMMAND_LABELS[lang][activeStep.command]}`
                    : ""}
                </span>
                <span>
                  {phase === "paused" ? copy.paused : `${mmss(remaining)} ${copy.left}`}
                </span>
              </div>

              <div className="stage">
                {state.card ? (
                  <div className="visualCard">
                    <div className="pictos" aria-hidden="true">
                      {CARD_PICTOS[cardKey].map((p) => (
                        <span key={p}>{p}</span>
                      ))}
                    </div>
                    <p>{VISUAL_CARDS[lang][cardKey]}</p>
                  </div>
                ) : (
                  <div className="calm">
                    <svg viewBox="0 0 120 120" aria-hidden="true">
                      <circle cx="60" cy="60" r="52" className="ringBg" />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        className="ring"
                        strokeDasharray={`${(total > 0 ? minute / total : 0) * 326.7} 326.7`}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <p>{state.quiet ? copy.quiet : mmss(remaining)}</p>
                  </div>
                )}
                {state.caregiverHints.includes("step_back") && env && (
                  <p className="youHint">
                    <b>{copy.you}:</b> {fill(PHONE_ACTION_TEXT[lang].caregiver_hint, { distance: env.distance.toFixed(1) })}
                  </p>
                )}
                {!audioOk && <p className="youHint">{copy.soundOff}</p>}
              </div>
            </>
          )}

          {(phase === "done" || phase === "stopped") && (
            <div className="stage end">
              <h2>{phase === "done" ? copy.doneTitle : copy.stoppedTitle}</h2>
              <p>{phase === "done" ? copy.doneSub : copy.stoppedSub}</p>
              <button type="button" className="primary wide" onClick={close}>
                {copy.back}
              </button>
            </div>
          )}

          {state && <div className="dim" style={{ opacity: phase === "running" || phase === "paused" ? state.dim : 0 }} aria-hidden="true" />}

          {running && (
            <div className="controls">
              {phase === "running" ? (
                <button type="button" className="ctl" onClick={pause}>
                  ⏸ {copy.pause}
                </button>
              ) : (
                <button type="button" className="ctl" onClick={resume}>
                  ▶ {copy.resume}
                </button>
              )}
              <button type="button" className="ctl stop" onClick={stop}>
                ■ {copy.stop}
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #efe9df;
          color: #2c3532;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          line-height: 1.5;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          max-width: 640px;
          margin: 0 auto;
        }
        .top :global(.brand) {
          color: #2c3532;
          text-decoration: none;
          font-weight: 700;
          font-size: 17px;
        }
        .top :global(.brand span) {
          font-weight: 400;
          color: #5c6b66;
        }
        .lang {
          display: flex;
          gap: 4px;
        }
        .lang button,
        .speed button {
          min-height: 40px;
          min-width: 44px;
          border: 1px solid #cfc6b8;
          background: transparent;
          color: #3e4a46;
          border-radius: 10px;
          font: inherit;
          font-size: 14px;
        }
        .lang button[aria-pressed="true"],
        .speed button[aria-pressed="true"] {
          background: #3f5f57;
          border-color: #3f5f57;
          color: #f6f2ea;
        }
        main {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 16px 48px;
        }
        .hero {
          padding: 8px 2px 18px;
        }
        .bodyTag {
          display: inline-block;
          margin: 0 0 10px;
          padding: 6px 12px;
          border-radius: 999px;
          background: #dfe7e1;
          color: #2f4d45;
          font-size: 14px;
          font-weight: 600;
        }
        h1 {
          font-size: 28px;
          line-height: 1.2;
          margin: 0 0 10px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .sub {
          margin: 0 0 14px;
          font-size: 16px;
          color: #46524e;
        }
        .how {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .how li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          background: #f7f3ec;
          border: 1px solid #ddd4c6;
          border-radius: 999px;
          padding: 6px 12px 6px 6px;
        }
        .how b {
          display: inline-grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #3f5f57;
          color: #f6f2ea;
          font-size: 12px;
        }
        .card {
          background: #f8f5ef;
          border: 1px solid #ddd4c6;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 14px;
        }
        .label {
          display: block;
          font-weight: 600;
          margin: 0 0 8px;
          font-size: 16px;
        }
        .label.small {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6b7772;
          margin-top: 14px;
        }
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cfc6b8;
          border-radius: 12px;
          padding: 12px;
          font: inherit;
          font-size: 17px;
          background: #fffdf9;
          color: #2c3532;
          resize: vertical;
        }
        textarea:focus,
        button:focus-visible,
        a:focus-visible {
          outline: 3px solid #8fb3a7;
          outline-offset: 2px;
        }
        .hint {
          display: flex;
          gap: 6px;
          align-items: baseline;
          font-size: 13px;
          color: #6b7772;
          margin: 6px 0 12px;
        }
        .count {
          margin-left: auto;
          font-variant-numeric: tabular-nums;
        }
        .primary {
          min-height: 52px;
          border: 0;
          border-radius: 14px;
          background: #3f5f57;
          color: #f6f2ea;
          font: inherit;
          font-size: 17px;
          font-weight: 600;
          padding: 0 20px;
        }
        .primary:disabled {
          opacity: 0.5;
        }
        .wide {
          width: 100%;
        }
        .examples {
          display: grid;
          gap: 8px;
        }
        .example {
          display: flex;
          gap: 10px;
          text-align: left;
          align-items: flex-start;
          min-height: 48px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #ddd4c6;
          background: #fffdf9;
          color: #2c3532;
          font: inherit;
          font-size: 15px;
        }
        .example b {
          font-size: 12px;
          color: #3f5f57;
          padding-top: 2px;
        }
        .example.warn {
          border-color: #e2c9a4;
          background: #fbf3e6;
        }
        .error {
          color: #8a3b2e;
          margin: 10px 0 0;
        }
        .interp {
          font-size: 18px;
          margin: 0 0 8px;
        }
        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 0;
        }
        .meta span {
          font-size: 13px;
          background: #ebe5da;
          border-radius: 999px;
          padding: 3px 10px;
          color: #46524e;
        }
        .notice {
          font-size: 14px;
          color: #7a5a2a;
          margin: 10px 0 0;
        }
        .escalation {
          background: #fbf0e3;
          border-color: #e2c9a4;
        }
        .only {
          font-size: 14px;
          color: #6d4d1f;
          margin: 0;
        }
        .escalation .big {
          font-size: 19px;
          font-weight: 600;
          margin: 0 0 6px;
        }
        .call {
          display: block;
          text-align: center;
          margin-top: 12px;
          min-height: 52px;
          line-height: 52px;
          border-radius: 14px;
          background: #9a4a36;
          color: #fff8f2;
          font-weight: 700;
          font-size: 18px;
          text-decoration: none;
        }
        .planHead {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .planHead h2 {
          margin: 0;
          font-size: 20px;
        }
        .planHead span {
          color: #6b7772;
        }
        .targets {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 12px 0;
        }
        .targets div {
          background: #ebe5da;
          border-radius: 12px;
          padding: 8px 10px;
        }
        .targets dt {
          font-size: 12px;
          color: #6b7772;
        }
        .targets dd {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        .timeline {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .timeline li {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-top: 1px solid #e6dfd3;
        }
        .min {
          min-width: 44px;
          font-variant-numeric: tabular-nums;
          color: #3f5f57;
          font-weight: 600;
        }
        .timeline strong {
          display: block;
          font-size: 16px;
        }
        .timeline p {
          margin: 2px 0 0;
          font-size: 14px;
          color: #4f5b57;
        }
        .who {
          font-style: normal;
          font-size: 12px;
          font-weight: 700;
          border-radius: 6px;
          padding: 1px 6px;
          margin-right: 6px;
        }
        .who.phone {
          background: #dfe7e1;
          color: #2f4d45;
        }
        .who.you {
          background: #f1e3cd;
          color: #6d4d1f;
        }
        .startBar {
          position: sticky;
          bottom: 0;
          background: #efe9df;
          padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
          display: grid;
          gap: 8px;
        }
        .speed {
          display: flex;
          gap: 6px;
        }
        .speed button {
          flex: 1;
        }
        .start {
          min-height: 60px;
          font-size: 20px;
        }
        .foot {
          margin-top: 18px;
          font-size: 13px;
          color: #6b7772;
        }
        .foot p {
          margin: 0 0 6px;
        }
        .foot nav {
          display: flex;
          gap: 14px;
          margin-top: 10px;
        }
        .foot :global(a) {
          color: #3f5f57;
        }

        .runner {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: #e8e1d5;
          color: #2c3532;
          display: flex;
          flex-direction: column;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }
        .runTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: calc(14px + env(safe-area-inset-top)) 18px 0;
          font-size: 15px;
          color: #4f5b57;
          font-variant-numeric: tabular-nums;
        }
        .stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 16px 20px 150px;
          text-align: center;
        }
        .visualCard {
          width: 100%;
          max-width: 520px;
          background: #fbf8f2;
          border-radius: 24px;
          padding: 28px 20px;
          border: 1px solid #d9cfbf;
        }
        .pictos {
          display: flex;
          justify-content: center;
          gap: 14px;
          font-size: 52px;
          margin-bottom: 14px;
        }
        .visualCard p {
          font-size: 26px;
          line-height: 1.3;
          margin: 0;
          font-weight: 600;
        }
        .calm svg {
          width: 220px;
          height: 220px;
        }
        .ringBg {
          fill: none;
          stroke: #d6cdbf;
          stroke-width: 6;
        }
        .ring {
          fill: none;
          stroke: #6f9488;
          stroke-width: 6;
          stroke-linecap: round;
          transition: stroke-dasharray 1s linear;
        }
        .calm p {
          font-size: 26px;
          margin: 8px 0 0;
          font-variant-numeric: tabular-nums;
        }
        .youHint {
          margin: 18px 0 0;
          font-size: 17px;
          background: #f1e3cd;
          border-radius: 14px;
          padding: 10px 14px;
          max-width: 520px;
        }
        .end h2 {
          font-size: 26px;
          margin: 0 0 8px;
        }
        .end p {
          margin: 0 0 20px;
          font-size: 17px;
        }
        .dim {
          position: fixed;
          inset: 0;
          background: #000;
          pointer-events: none;
          z-index: 60;
          transition: opacity 2s linear;
        }
        .controls {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 70;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px 16px calc(16px + env(safe-area-inset-bottom));
        }
        .ctl {
          min-height: 72px;
          border-radius: 18px;
          border: 0;
          font: inherit;
          font-size: 22px;
          font-weight: 700;
          background: #f6f2ea;
          color: #2c3532;
        }
        .ctl.stop {
          background: #9a4a36;
          color: #fff8f2;
        }
        @media (min-width: 720px) {
          h1 {
            font-size: 36px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .dim,
          .ring {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
