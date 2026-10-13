import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AdapterTarget,
  Command,
  PlannedStep,
  PlannerInput,
  PlannerResult,
  VisionSnapshot,
} from "@/lib/careProtocol/types";
import { adapterLabels } from "@/lib/careProtocol/planner";
import { readLatestLocalVisionSnapshot } from "@/lib/careProtocol/nlVisionBridge";
import { useLang, type Lang } from "@/components/SiteLayout";

type AgentResponse = {
  ok: true;
  source: "claude" | "fallback" | "risk_screen";
  notice: string | null;
  escalate: boolean;
  escalationMessage: string | null;
  interpretation: string;
  confidence: "low" | "medium" | "high";
  discarded: string[];
  scenario: string;
  lang: Lang;
  plannerInput: PlannerInput;
  plan: PlannerResult;
};

const SIM_SECONDS = 10;
const ADAPTERS: AdapterTarget[] = ["ros2", "mqtt", "http", "offline"];

const EXAMPLES: Array<{ lang: Lang; text: string; escalation?: boolean }> = [
  { lang: "es", text: "Leo se tapa los oídos, hay mucha gente en la cocina y la radio está alta." },
  {
    lang: "en",
    text: "It's 8 pm, Mia is still spinning in the living room and the lights are bright. We need to start the bedtime routine.",
  },
  { lang: "sv", text: "Elias slår huvudet i väggen och blöder från pannan.", escalation: true },
];

const commandGlyph: Record<Command, string> = {
  reduce_sound: "♪↓",
  lower_light: "◐",
  step_back: "⇤",
  pause_interaction: "⏸",
  offer_visual_card: "▭",
  notify_caregiver: "✉",
  log_observation: "✎",
};

const T: Record<Lang, Record<string, string>> = {
  es: {
    title: "Care Agent",
    kicker: "neuroljus agent --from-text",
    sub: "Describe lo que pasa. Claude interpreta, el planner determinista decide, y un robot o adaptador recibe un care_command_protocol_v0 válido.",
    placeholder: "Ej.: Leo se tapa los oídos, hay mucha gente en la cocina y la radio está alta.",
    examples: "Ejemplos",
    generate: "Generar protocolo",
    generating: "Interpretando…",
    chars: "caracteres",
    interpretation: "Interpretación",
    confidence: "confianza",
    source_claude: "Claude · planner determinista",
    source_fallback: "preset local · Claude no disponible",
    source_risk_screen: "filtro local de riesgo",
    escalationTitle: "Esto necesita a una persona",
    timeline: "Secuencia planificada",
    minutes: "min",
    targets: "Objetivos del entorno",
    light: "Luz",
    sound: "Sonido",
    distance: "Distancia",
    pace: "Ritmo",
    simulation: "Simulación",
    simHint: "Diez segundos para una rutina real de",
    play: "Ejecutar",
    replay: "Repetir",
    reduced: "Animación reducida por preferencia del sistema: se muestra el estado final.",
    escalatedSim: "Sin acciones automáticas. El robot espera y avisa al cuidador.",
    adapter: "Paquete para el adaptador",
    copy: "Copiar JSON",
    copied: "Copiado",
    vision: "Contexto NL-VISION",
    visionOn: "último snapshot local adjunto",
    visionOff: "ninguno (solo contexto manual)",
    discarded: "Descartado por el validador",
    error: "No se pudo generar el protocolo. Inténtalo de nuevo.",
    how1: "Claude interpreta",
    how2: "El planner decide",
    how3: "Las excepciones de seguridad no se saltan",
    privacy: "El texto y las métricas resumidas van a Claude. El vídeo nunca sale del dispositivo.",
    person: "persona",
    robot: "robot",
    navWorkspace: "Protocol Workspace",
    navRoom: "Care Room",
    navVision: "NL-VISION",
    navHome: "Plataforma",
    flags: "Atención",
  },
  en: {
    title: "Care Agent",
    kicker: "neuroljus agent --from-text",
    sub: "Describe what is happening. Claude interprets, the deterministic planner decides, and a robot or adapter receives a valid care_command_protocol_v0.",
    placeholder: "E.g.: Leo is covering his ears, the kitchen is crowded and the radio is loud.",
    examples: "Examples",
    generate: "Generate protocol",
    generating: "Interpreting…",
    chars: "characters",
    interpretation: "Interpretation",
    confidence: "confidence",
    source_claude: "Claude · deterministic planner",
    source_fallback: "local preset · Claude unavailable",
    source_risk_screen: "local risk screen",
    escalationTitle: "This needs a person",
    timeline: "Planned sequence",
    minutes: "min",
    targets: "Environment targets",
    light: "Light",
    sound: "Sound",
    distance: "Distance",
    pace: "Pace",
    simulation: "Simulation",
    simHint: "Ten seconds for a real routine of",
    play: "Run",
    replay: "Replay",
    reduced: "Animation reduced per system preference: the final state is shown.",
    escalatedSim: "No automatic action. The robot waits and notifies the caregiver.",
    adapter: "Adapter packet",
    copy: "Copy JSON",
    copied: "Copied",
    vision: "NL-VISION context",
    visionOn: "latest local snapshot attached",
    visionOff: "none (manual context only)",
    discarded: "Discarded by the validator",
    error: "The protocol could not be generated. Please try again.",
    how1: "Claude interprets",
    how2: "The planner decides",
    how3: "Safety exceptions cannot be skipped",
    privacy: "The text and summarized metrics go to Claude. Video never leaves the device.",
    person: "person",
    robot: "robot",
    navWorkspace: "Protocol Workspace",
    navRoom: "Care Room",
    navVision: "NL-VISION",
    navHome: "Platform",
    flags: "Attention",
  },
  sv: {
    title: "Care Agent",
    kicker: "neuroljus agent --from-text",
    sub: "Beskriv vad som händer. Claude tolkar, den deterministiska planeraren beslutar, och en robot eller adapter får ett giltigt care_command_protocol_v0.",
    placeholder: "T.ex.: Leo håller för öronen, det är mycket folk i köket och radion är hög.",
    examples: "Exempel",
    generate: "Generera protokoll",
    generating: "Tolkar…",
    chars: "tecken",
    interpretation: "Tolkning",
    confidence: "säkerhet",
    source_claude: "Claude · deterministisk planerare",
    source_fallback: "lokal förinställning · Claude otillgänglig",
    source_risk_screen: "lokalt riskfilter",
    escalationTitle: "Det här behöver en människa",
    timeline: "Planerad sekvens",
    minutes: "min",
    targets: "Miljömål",
    light: "Ljus",
    sound: "Ljud",
    distance: "Avstånd",
    pace: "Tempo",
    simulation: "Simulering",
    simHint: "Tio sekunder för en verklig rutin på",
    play: "Kör",
    replay: "Kör igen",
    reduced: "Animation reducerad enligt systeminställning: slutläget visas.",
    escalatedSim: "Ingen automatisk åtgärd. Roboten väntar och meddelar vårdgivaren.",
    adapter: "Adapterpaket",
    copy: "Kopiera JSON",
    copied: "Kopierat",
    vision: "NL-VISION-kontext",
    visionOn: "senaste lokala ögonblicksbild bifogad",
    visionOff: "ingen (endast manuell kontext)",
    discarded: "Förkastat av valideraren",
    error: "Protokollet kunde inte genereras. Försök igen.",
    how1: "Claude tolkar",
    how2: "Planeraren beslutar",
    how3: "Säkerhetsundantag kan inte hoppas över",
    privacy: "Texten och sammanfattade mätvärden går till Claude. Video lämnar aldrig enheten.",
    person: "person",
    robot: "robot",
    navWorkspace: "Protocol Workspace",
    navRoom: "Care Room",
    navVision: "NL-VISION",
    navHome: "Plattform",
    flags: "Uppmärksamhet",
  },
};

const stepLabels: Record<Lang, Record<Command, string>> = {
  es: {
    reduce_sound: "Reducir sonido",
    lower_light: "Bajar luz",
    step_back: "Dar espacio",
    pause_interaction: "Pausar interacción",
    offer_visual_card: "Ofrecer tarjeta visual",
    notify_caregiver: "Avisar al cuidador",
    log_observation: "Registrar observación",
  },
  en: {
    reduce_sound: "Reduce sound",
    lower_light: "Lower light",
    step_back: "Step back",
    pause_interaction: "Pause interaction",
    offer_visual_card: "Offer visual card",
    notify_caregiver: "Notify caregiver",
    log_observation: "Log observation",
  },
  sv: {
    reduce_sound: "Sänk ljud",
    lower_light: "Dämpa ljus",
    step_back: "Ge utrymme",
    pause_interaction: "Pausa interaktion",
    offer_visual_card: "Visa bildkort",
    notify_caregiver: "Meddela vårdgivare",
    log_observation: "Logga observation",
  },
};

type SimState = {
  light: number;
  sound: number;
  distance: number;
  paused: boolean;
  card: boolean;
  notified: boolean;
  logged: boolean;
  activeStep: number;
};

const SIM_START: SimState = {
  light: 78,
  sound: 70,
  distance: 0.8,
  paused: false,
  card: false,
  notified: false,
  logged: false,
  activeStep: -1,
};

/** Deterministic simulation state for a point in time (minutes into the routine). */
function simulate(steps: PlannedStep[], targets: PlannerInput["environment"], minute: number): SimState {
  const state: SimState = { ...SIM_START };
  steps.forEach((step, index) => {
    const start = step.offsetMinutes;
    const end = step.offsetMinutes + step.durationMinutes;
    if (minute < start) return;
    const progress = step.durationMinutes > 0 ? Math.min(1, (minute - start) / step.durationMinutes) : 1;
    if (minute < end) state.activeStep = index;
    const lerp = (from: number, to: number) => from + (to - from) * progress;
    switch (step.command) {
      case "lower_light":
        state.light = lerp(state.light, targets.light);
        break;
      case "reduce_sound":
        state.sound = lerp(state.sound, targets.sound);
        break;
      case "step_back":
        state.distance = lerp(state.distance, targets.distance);
        break;
      case "pause_interaction":
        state.paused = true;
        break;
      case "offer_visual_card":
        state.card = progress > 0.3;
        break;
      case "notify_caregiver":
        state.notified = progress > 0.3;
        break;
      case "log_observation":
        state.logged = progress > 0.3;
        break;
    }
  });
  if (steps.length > 0 && minute >= steps[steps.length - 1].offsetMinutes + steps[steps.length - 1].durationMinutes) {
    state.activeStep = steps.length;
  }
  return state;
}

export default function CareAgentPage() {
  const [lang, setLang] = useLang("en");
  const copy = T[lang];

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [adapter, setAdapter] = useState<AdapterTarget>("ros2");
  const [copied, setCopied] = useState(false);
  const [vision, setVision] = useState<VisionSnapshot | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [simMinute, setSimMinute] = useState<number | null>(null);
  const frame = useRef<number | null>(null);
  const simStart = useRef<number>(0);

  useEffect(() => {
    try {
      setVision(readLatestLocalVisionSnapshot(window.localStorage));
    } catch {
      setVision(null);
    }
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
      const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    } catch {
      /* no matchMedia */
    }
  }, []);

  const stopSim = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  useEffect(() => stopSim, [stopSim]);

  const generate = useCallback(
    async (input?: string) => {
      const value = (input ?? text).trim();
      if (!value || busy) return;
      stopSim();
      setSimMinute(null);
      setBusy(true);
      setError(null);
      setCopied(false);
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
        }
      } catch {
        setError(copy.error);
        setResult(null);
      } finally {
        setBusy(false);
      }
    },
    [text, busy, lang, vision, copy.error, stopSim]
  );

  const steps = useMemo<PlannedStep[]>(() => result?.plan.steps ?? [], [result]);
  const targets = result?.plannerInput.environment;
  const totalMinutes = result?.plan.protocol.duration_minutes ?? 0;

  const runSim = useCallback(() => {
    if (!result || totalMinutes <= 0) return;
    stopSim();
    if (reducedMotion) {
      setSimMinute(totalMinutes);
      return;
    }
    simStart.current = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - simStart.current) / 1000;
      const minute = Math.min(totalMinutes, (elapsed / SIM_SECONDS) * totalMinutes);
      setSimMinute(minute);
      if (minute < totalMinutes) frame.current = requestAnimationFrame(tick);
      else frame.current = null;
    };
    frame.current = requestAnimationFrame(tick);
  }, [result, totalMinutes, reducedMotion, stopSim]);

  const sim = useMemo<SimState>(() => {
    if (!targets || simMinute === null) return SIM_START;
    return simulate(steps, targets, simMinute);
  }, [steps, targets, simMinute]);

  const packetJson = useMemo(
    () => (result ? JSON.stringify(result.plan.adapterPackets[adapter], null, 2) : ""),
    [result, adapter]
  );

  const copyPacket = useCallback(async () => {
    if (!packetJson) return;
    try {
      await navigator.clipboard.writeText(packetJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [packetJson]);

  const robotX = 96 + Math.min(4, Math.max(0.5, sim.distance)) * 46;
  const simDone = simMinute !== null && totalMinutes > 0 && simMinute >= totalMinutes;
  const simRunning = simMinute !== null && !simDone;
  const warnings = result?.plan.attentionFlags.filter((f) => f.severity === "warning") ?? [];

  return (
    <>
      <Head>
        <title>Care Agent — Neuroljus</title>
        <meta
          name="description"
          content="Describe a care situation in plain language. Claude interprets, the deterministic Neuroljus planner emits a care_command_protocol_v0 that robots and adapters can execute."
        />
        <meta name="theme-color" content="#09090b" />
      </Head>

      <div className="page">
        <div className="statusbar" aria-hidden="true">
          <span>
            neuroljus://agent · <b>care_command_protocol_v0</b> · interpreter=claude · planner=deterministic · audit=on
          </span>
          <span>caregiver_authority=true · safety_exceptions=floor</span>
        </div>

        <header className="shell topnav" role="banner">
          <div className="brandRow">
            <Link href="/" className="logo">
              Neuroljus
            </Link>
            <span className="sep">/</span>
            <span className="platform">{copy.title}</span>
          </div>
          <nav className="navLinks" aria-label="Labs">
            <Link href="/labs/robot-interface">{copy.navWorkspace}</Link>
            <Link href="/labs/future-care-room">{copy.navRoom}</Link>
            <Link href="/labs/nl-vision">{copy.navVision}</Link>
            <Link href="/">{copy.navHome}</Link>
          </nav>
          <div className="navRight">
            <div className="langToggle" role="group" aria-label="Language">
              {(["es", "en", "sv"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} type="button">
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="shell workspace">
          <section className="intro">
            <p className="cli">{copy.kicker}</p>
            <h1>{copy.title}</h1>
            <p className="sub">{copy.sub}</p>
            <ol className="how" aria-label="How it works">
              <li>
                <span>1</span>
                {copy.how1}
              </li>
              <li>
                <span>2</span>
                {copy.how2}
              </li>
              <li>
                <span>3</span>
                {copy.how3}
              </li>
            </ol>
          </section>

          <section className="panel inputPanel" aria-label="Caregiver description">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void generate();
              }}
            >
              <label htmlFor="care-text" className="kicker">
                {copy.examples}
              </label>
              <div className="examples">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.lang}
                    type="button"
                    className={`chip ${ex.escalation ? "warn" : ""}`}
                    onClick={() => {
                      setText(ex.text);
                      void generate(ex.text);
                    }}
                    disabled={busy}
                  >
                    <b>{ex.lang.toUpperCase()}</b> {ex.text}
                  </button>
                ))}
              </div>
              <textarea
                id="care-text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                placeholder={copy.placeholder}
                rows={3}
                maxLength={500}
              />
              <div className="inputRow">
                <span className="count">
                  {text.length}/500 {copy.chars}
                </span>
                <span className="visionLine">
                  {copy.vision}: {vision ? copy.visionOn : copy.visionOff}
                </span>
                <button type="submit" className="primary" disabled={busy || !text.trim()}>
                  {busy ? copy.generating : copy.generate}
                </button>
              </div>
            </form>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </section>

          {result && (
            <section className={`results ${result.escalate ? "escalated" : ""}`} aria-live="polite">
              <div className="panel interp">
                <p className="kicker">{copy.interpretation}</p>
                {result.escalate && (
                  <div className="escalation" role="alert">
                    <strong>{copy.escalationTitle}</strong>
                    <p>{result.escalationMessage}</p>
                  </div>
                )}
                <p className="interpText">{result.interpretation}</p>
                <div className="badges">
                  <span className={`badge conf-${result.confidence}`}>
                    {copy.confidence}: {result.confidence}
                  </span>
                  <span className="badge">{copy[`source_${result.source}`]}</span>
                  <span className="badge mono">{result.scenario}</span>
                </div>
                {result.notice && !result.escalate && <p className="notice">{result.notice}</p>}
                {result.discarded.length > 0 && (
                  <details className="discarded">
                    <summary>
                      {copy.discarded} ({result.discarded.length})
                    </summary>
                    <ul>
                      {result.discarded.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {warnings.length > 0 && (
                  <ul className="flags">
                    {warnings.map((f) => (
                      <li key={f.message}>
                        <b>{copy.flags}:</b> {f.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="panel timeline">
                <p className="kicker">
                  {copy.timeline} · {totalMinutes} {copy.minutes}
                </p>
                <ol className="steps">
                  {steps.map((step, index) => {
                    const width = totalMinutes > 0 ? Math.max(6, (step.durationMinutes / totalMinutes) * 100) : 100;
                    const state =
                      simMinute === null ? "" : index < sim.activeStep ? "done" : index === sim.activeStep ? "active" : "";
                    return (
                      <li key={`${step.command}-${index}`} className={state}>
                        <span className="glyph" aria-hidden="true">
                          {commandGlyph[step.command]}
                        </span>
                        <div className="stepBody">
                          <div className="stepHead">
                            <strong>{stepLabels[lang][step.command]}</strong>
                            <code>{step.command}</code>
                          </div>
                          <div className="bar" aria-hidden="true">
                            <i style={{ width: `${width}%` }} />
                          </div>
                          <span className="time">
                            +{step.offsetMinutes} {copy.minutes} · {step.durationMinutes} {copy.minutes}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="panel targets">
                <p className="kicker">{copy.targets}</p>
                {targets && (
                  <dl className="meters">
                    <div>
                      <dt>{copy.light}</dt>
                      <dd>
                        <i style={{ width: `${targets.light}%` }} />
                        <span>{targets.light}%</span>
                      </dd>
                    </div>
                    <div>
                      <dt>{copy.sound}</dt>
                      <dd>
                        <i style={{ width: `${targets.sound}%` }} />
                        <span>{targets.sound}%</span>
                      </dd>
                    </div>
                    <div>
                      <dt>{copy.distance}</dt>
                      <dd>
                        <i style={{ width: `${(targets.distance / 4) * 100}%` }} />
                        <span>{targets.distance.toFixed(1)} m</span>
                      </dd>
                    </div>
                    <div>
                      <dt>{copy.pace}</dt>
                      <dd>
                        <span className="paceValue">{targets.pace}</span>
                      </dd>
                    </div>
                  </dl>
                )}
              </div>

              <div className="panel simPanel">
                <div className="simHead">
                  <p className="kicker">{copy.simulation}</p>
                  <button type="button" className="primary small" onClick={runSim} disabled={totalMinutes <= 0}>
                    {simMinute === null ? copy.play : copy.replay}
                  </button>
                </div>
                <p className="simHint">
                  {result.escalate ? copy.escalatedSim : `${copy.simHint} ${totalMinutes} ${copy.minutes}.`}
                </p>
                {reducedMotion && <p className="simHint">{copy.reduced}</p>}
                <svg className="scene" viewBox="0 0 320 170" role="img" aria-label={copy.simulation}>
                  <rect x="0" y="0" width="320" height="170" rx="8" fill="#101014" />
                  <rect x="0" y="0" width="320" height="170" rx="8" fill="#fff6d5" opacity={0.08 + (sim.light / 100) * 0.55} />
                  <line x1="0" y1="132" x2="320" y2="132" stroke="#3f3f46" strokeWidth="1" />
                  {/* lamp */}
                  <circle cx="160" cy="26" r={10 + (sim.light / 100) * 10} fill="#ffe08a" opacity={0.25 + sim.light / 110} />
                  <line x1="160" y1="0" x2="160" y2="16" stroke="#71717a" strokeWidth="2" />
                  {/* sound rings */}
                  <g stroke="#7ce3f7" fill="none" strokeWidth="2" opacity={0.15 + sim.sound / 120}>
                    <path d={`M 26 ${100 - sim.sound / 6} a ${8 + sim.sound / 8} ${8 + sim.sound / 8} 0 0 1 0 ${sim.sound / 3}`} />
                    <path d={`M 34 ${92 - sim.sound / 5} a ${14 + sim.sound / 6} ${14 + sim.sound / 6} 0 0 1 0 ${sim.sound / 2.5 + 2}`} />
                  </g>
                  <text x="16" y="150" fontSize="9" fill="#a1a1aa" fontFamily="ui-monospace, monospace">
                    light {Math.round(sim.light)}% · sound {Math.round(sim.sound)}% · {sim.distance.toFixed(1)} m
                  </text>
                  {/* person */}
                  <g transform="translate(96 100)">
                    <circle cx="0" cy="-22" r="10" fill="#e9f1fb" />
                    <path d="M -12 32 L -12 0 Q 0 -10 12 0 L 12 32 Z" fill="#e9f1fb" />
                    <text x="0" y="46" fontSize="9" textAnchor="middle" fill="#a1a1aa" fontFamily="ui-monospace, monospace">
                      {copy.person}
                    </text>
                  </g>
                  {/* robot */}
                  <g transform={`translate(${robotX} 100)`} className={simRunning ? "moving" : ""}>
                    <rect x="-13" y="-30" width="26" height="22" rx="5" fill={result.escalate ? "#fbbf24" : "#3ecf9a"} />
                    <circle cx="-5" cy="-20" r="2.5" fill="#09090b" />
                    <circle cx="5" cy="-20" r="2.5" fill="#09090b" />
                    <rect x="-10" y="-6" width="20" height="36" rx="4" fill="#52525b" />
                    <text x="0" y="46" fontSize="9" textAnchor="middle" fill="#a1a1aa" fontFamily="ui-monospace, monospace">
                      {copy.robot}
                    </text>
                  </g>
                  {sim.card && (
                    <g transform="translate(220 40)">
                      <rect x="0" y="0" width="70" height="30" rx="4" fill="#fafafa" />
                      <text x="35" y="19" fontSize="8" textAnchor="middle" fill="#17202f" fontFamily="ui-monospace, monospace">
                        {result.plannerInput.visualCard.slice(0, 14)}
                      </text>
                    </g>
                  )}
                  {sim.paused && (
                    <text x="304" y="20" fontSize="10" textAnchor="end" fill="#fbbf24" fontFamily="ui-monospace, monospace">
                      ⏸ pause
                    </text>
                  )}
                  {sim.notified && (
                    <text x="304" y="34" fontSize="10" textAnchor="end" fill="#3ecf9a" fontFamily="ui-monospace, monospace">
                      ✉ caregiver
                    </text>
                  )}
                  {sim.logged && (
                    <text x="304" y="48" fontSize="10" textAnchor="end" fill="#3ecf9a" fontFamily="ui-monospace, monospace">
                      ✎ audit
                    </text>
                  )}
                </svg>
                <div className="progress" aria-hidden="true">
                  <i style={{ width: `${totalMinutes > 0 && simMinute !== null ? (simMinute / totalMinutes) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="panel adapterPanel">
                <div className="simHead">
                  <p className="kicker">{copy.adapter}</p>
                  <button type="button" className="ghost small" onClick={copyPacket}>
                    {copied ? copy.copied : copy.copy}
                  </button>
                </div>
                <div className="adapters" role="group" aria-label={copy.adapter}>
                  {ADAPTERS.map((target) => (
                    <button
                      key={target}
                      type="button"
                      className={`chip ${adapter === target ? "on" : ""}`}
                      onClick={() => setAdapter(target)}
                      title={adapterLabels[target]}
                    >
                      {target}
                    </button>
                  ))}
                </div>
                <p className="route">
                  {result.plan.adapterPackets[adapter].route} · {result.plan.adapterPackets[adapter].transport}
                </p>
                <pre className="json" tabIndex={0}>
                  {packetJson}
                </pre>
              </div>
            </section>
          )}

          <p className="privacy">{copy.privacy}</p>
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100dvh;
          background: #09090b;
          color: #fafafa;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .shell {
          width: min(1200px, calc(100% - 32px));
          margin: 0 auto;
        }
        .statusbar {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding: 8px 16px;
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
          gap: 12px 16px;
          padding: 14px 0;
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
          gap: 16px;
          font-size: 13px;
          flex-wrap: wrap;
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
        }
        .langToggle {
          display: inline-flex;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          overflow: hidden;
        }
        .langToggle button {
          background: transparent;
          border: 0;
          color: #a1a1aa;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 10px;
          cursor: pointer;
        }
        .langToggle button[aria-pressed="true"] {
          background: #3ecf9a;
          color: #06131f;
        }
        .workspace {
          padding: 24px 0 48px;
          display: grid;
          gap: 16px;
        }
        h1,
        h2,
        p {
          margin: 0;
          overflow-wrap: anywhere;
        }
        h1 {
          font-size: clamp(28px, 4vw, 38px);
          line-height: 1.05;
        }
        .cli {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
          color: #3ecf9a;
          margin-bottom: 10px;
        }
        .sub {
          margin-top: 10px;
          max-width: 720px;
          color: #a1a1aa;
          line-height: 1.55;
          font-size: 15px;
        }
        .how {
          list-style: none;
          margin: 14px 0 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .how li {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #27272a;
          border-radius: 999px;
          padding: 6px 12px 6px 6px;
          font-size: 13px;
          color: #d4d4d8;
        }
        .how li span {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #3ecf9a;
          color: #06131f;
          font-weight: 800;
          font-size: 12px;
          display: inline-grid;
          place-items: center;
        }
        .panel {
          border: 1px solid #27272a;
          border-radius: 8px;
          background: #0c0c0e;
          padding: 16px;
        }
        .kicker {
          margin-bottom: 8px;
          color: #3ecf9a;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          display: block;
        }
        .examples {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .chip {
          border: 1px solid #3f3f46;
          background: #111114;
          color: #d4d4d8;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          line-height: 1.35;
          max-width: 100%;
        }
        .chip b {
          color: #3ecf9a;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          margin-right: 6px;
        }
        .chip.warn b {
          color: #fbbf24;
        }
        .chip.on {
          border-color: #3ecf9a;
          color: #3ecf9a;
        }
        .chip:hover:not(:disabled) {
          border-color: #3ecf9a;
        }
        .chip:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        textarea {
          width: 100%;
          box-sizing: border-box;
          background: #09090b;
          border: 1px solid #3f3f46;
          border-radius: 6px;
          color: #fafafa;
          padding: 12px;
          font: inherit;
          font-size: 16px;
          line-height: 1.5;
          resize: vertical;
          min-height: 88px;
        }
        textarea:focus {
          outline: 2px solid #3ecf9a;
          outline-offset: 1px;
        }
        .inputRow {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px 16px;
          margin-top: 10px;
          font-size: 12px;
          color: #71717a;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
        }
        .primary {
          margin-left: auto;
          background: #3ecf9a;
          color: #06131f;
          border: 0;
          border-radius: 6px;
          padding: 12px 18px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
        }
        .primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .primary.small,
        .ghost.small {
          padding: 7px 12px;
          font-size: 12px;
          margin-left: 0;
        }
        .ghost {
          background: transparent;
          border: 1px solid #3f3f46;
          color: #d4d4d8;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
        }
        .ghost:hover {
          border-color: #3ecf9a;
          color: #3ecf9a;
        }
        .error {
          margin-top: 10px;
          color: #fca5a5;
          font-size: 13px;
        }
        .results {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
        }
        .interp {
          grid-column: span 5;
        }
        .timeline {
          grid-column: span 7;
          grid-row: span 2;
        }
        .targets {
          grid-column: span 5;
        }
        .simPanel {
          grid-column: span 7;
        }
        .adapterPanel {
          grid-column: span 5;
        }
        .escalation {
          border: 1px solid #fbbf24;
          background: rgba(251, 191, 36, 0.1);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .escalation strong {
          display: block;
          color: #fbbf24;
          margin-bottom: 4px;
          font-size: 16px;
        }
        .escalation p {
          color: #fde68a;
          font-size: 15px;
          line-height: 1.45;
        }
        .interpText {
          font-size: 17px;
          line-height: 1.5;
        }
        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
        }
        .badge {
          font-size: 11px;
          font-weight: 700;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          padding: 3px 8px;
          color: #a1a1aa;
        }
        .badge.mono {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
        }
        .badge.conf-high {
          border-color: #3ecf9a;
          color: #3ecf9a;
        }
        .badge.conf-medium {
          border-color: #7ce3f7;
          color: #7ce3f7;
        }
        .badge.conf-low {
          border-color: #fbbf24;
          color: #fbbf24;
        }
        .notice {
          margin-top: 10px;
          color: #fbbf24;
          font-size: 13px;
        }
        .discarded {
          margin-top: 10px;
          font-size: 12px;
          color: #71717a;
        }
        .discarded ul {
          margin: 6px 0 0;
          padding-left: 18px;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
        }
        .flags {
          margin: 10px 0 0;
          padding: 0;
          list-style: none;
          font-size: 12px;
          color: #fbbf24;
          display: grid;
          gap: 4px;
        }
        .steps {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }
        .steps li {
          display: grid;
          grid-template-columns: 36px 1fr;
          gap: 10px;
          align-items: start;
          border: 1px solid #27272a;
          border-radius: 6px;
          padding: 10px;
          transition: border-color 0.2s, background 0.2s;
        }
        .steps li.active {
          border-color: #3ecf9a;
          background: rgba(62, 207, 154, 0.08);
        }
        .steps li.done {
          opacity: 0.75;
        }
        .glyph {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: #18181b;
          display: grid;
          place-items: center;
          font-size: 16px;
          color: #3ecf9a;
        }
        .stepHead {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 10px;
          align-items: baseline;
        }
        .stepHead code {
          font-size: 11px;
          color: #71717a;
        }
        .bar {
          margin: 8px 0 4px;
          height: 6px;
          background: #18181b;
          border-radius: 3px;
          overflow: hidden;
        }
        .bar i {
          display: block;
          height: 100%;
          background: #3ecf9a;
          border-radius: 3px;
        }
        .time {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          color: #71717a;
        }
        .meters {
          margin: 0;
          display: grid;
          gap: 10px;
        }
        .meters div {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 10px;
          align-items: center;
        }
        .meters dt {
          font-size: 13px;
          color: #a1a1aa;
        }
        .meters dd {
          margin: 0;
          position: relative;
          height: 22px;
          background: #18181b;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .meters dd i {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, #3ecf9a, #7ce3f7);
          opacity: 0.55;
        }
        .meters dd span {
          position: relative;
          padding-left: 8px;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
          font-weight: 700;
        }
        .simHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }
        .simHead .kicker {
          margin-bottom: 0;
        }
        .simHint {
          font-size: 12px;
          color: #71717a;
          margin-bottom: 10px;
        }
        .scene {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 8px;
          border: 1px solid #27272a;
        }
        .progress {
          margin-top: 8px;
          height: 4px;
          background: #18181b;
          border-radius: 2px;
          overflow: hidden;
        }
        .progress i {
          display: block;
          height: 100%;
          background: #3ecf9a;
        }
        .adapters {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }
        .adapters .chip {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
          padding: 6px 10px;
        }
        .route {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          color: #71717a;
          margin-bottom: 8px;
        }
        .json {
          margin: 0;
          max-height: 360px;
          overflow: auto;
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 6px;
          padding: 12px;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11.5px;
          line-height: 1.45;
          color: #d4d4d8;
        }
        .privacy {
          font-size: 12px;
          color: #71717a;
        }
        @media (max-width: 900px) {
          .results {
            grid-template-columns: 1fr;
          }
          .interp,
          .timeline,
          .targets,
          .simPanel,
          .adapterPanel {
            grid-column: auto;
            grid-row: auto;
          }
          .navRight {
            margin-left: 0;
          }
          .primary {
            width: 100%;
            margin-left: 0;
          }
          .json {
            max-height: 260px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .steps li {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
