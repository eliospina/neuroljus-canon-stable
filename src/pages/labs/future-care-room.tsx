import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AdapterTarget,
  Command,
  Environment,
  ScenarioId,
} from "@/lib/careProtocol/types";
import {
  adapterLabels,
  adapterTransports,
  buildCarePlan,
  commandLabels,
} from "@/lib/careProtocol/planner";
import { scenarioOrder, scenarioPresets } from "@/lib/careProtocol/scenarios";

type RoomStatus = "idle" | "playing" | "paused" | "escalated" | "completed";

type CueType = "now_next" | "step_sequence" | "calm_image" | "none";

type SupportLevel = "hands_on" | "nearby" | "remote";

type TimelineEntry = {
  id: number;
  time: string;
  actor: "caregiver" | "neuroljus" | "robot" | "protocol";
  label: string;
  detail: string;
};

const cueLabels: Record<CueType, string> = {
  now_next: "Now / Next card",
  step_sequence: "Step sequence",
  calm_image: "Calm image",
  none: "No visual cue",
};

const stepSequenceCards: Record<ScenarioId, string> = {
  evening_transition: "1 Bath · 2 Pyjamas · 3 Story · 4 Sleep",
  sensory_overload: "1 Pause · 2 Breathe · 3 Quiet corner",
  leaving_home: "1 Shoes · 2 Jacket · 3 Door · 4 Outside",
  meal_support: "1 Table · 2 Food · 3 Drink · 4 Finished",
  school_arrival: "1 Arrive · 2 Quiet corner · 3 Teacher · 4 First task",
};

const supportLabels: Record<SupportLevel, string> = {
  hands_on: "Hands-on, beside the person",
  nearby: "Nearby, in the same room",
  remote: "Remote, notified by protocol",
};

const supportInterpretation: Record<SupportLevel, string> = {
  hands_on: "The caregiver is hands-on beside the person; the interface follows their lead.",
  nearby: "The caregiver is nearby; the interface carries the routine and reports back.",
  remote: "The caregiver is remote; every routine must close with a caregiver notice.",
};

const statusLabels: Record<RoomStatus, string> = {
  idle: "Room ready",
  playing: "Routine running",
  paused: "Paused by caregiver",
  escalated: "Safety exception",
  completed: "Routine complete",
};

const STEP_INTERVAL_MS = 2200;

const pad = (value: number) => String(value).padStart(2, "0");

function nowStamp() {
  const date = new Date();
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function FutureCareRoom() {
  const [scenario, setScenario] = useState<ScenarioId>("evening_transition");
  const [environment, setEnvironment] = useState<Environment>(
    scenarioPresets.evening_transition.environment
  );
  const [cueType, setCueType] = useState<CueType>("now_next");
  const [supportLevel, setSupportLevel] = useState<SupportLevel>("nearby");
  const [adapterTarget, setAdapterTarget] = useState<AdapterTarget>("ros2");
  const [status, setStatus] = useState<RoomStatus>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [protocolOpen, setProtocolOpen] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [packetCopied, setPacketCopied] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const protocolRef = useRef<HTMLDivElement | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([
    {
      id: 1,
      time: "ready",
      actor: "neuroljus",
      label: "Care room open",
      detail: "Choose a situation, shape the room, and watch the protocol form.",
    },
  ]);
  const nextId = useRef(2);

  const preset = scenarioPresets[scenario];

  const cueText = useMemo(() => {
    if (cueType === "none") return "";
    if (cueType === "now_next") return preset.visualCard;
    if (cueType === "step_sequence") return stepSequenceCards[scenario];
    return "Calm image: slow waves, soft light.";
  }, [cueType, preset, scenario]);

  const allowedCommands = useMemo(() => {
    let commands: Command[] = preset.commands;
    if (cueType === "none") {
      commands = commands.filter((command) => command !== "offer_visual_card");
    }
    if (supportLevel === "remote" && !commands.includes("notify_caregiver")) {
      commands = [...commands, "notify_caregiver"];
    }
    return commands;
  }, [preset, cueType, supportLevel]);

  const plan = useMemo(
    () =>
      buildCarePlan({
        scenario,
        routineName: preset.name,
        careGoal: preset.careGoal,
        visualCard: cueText,
        durationMinutes: preset.duration,
        environment,
        allowedCommands,
        safetyExceptions: preset.exceptions,
        visionContext: null,
      }),
    [scenario, preset, cueText, environment, allowedCommands]
  );

  const steps = plan.steps;

  const exportDocument = useMemo(
    () => ({
      ...plan.protocol,
      experience_context: {
        source: "future_care_room",
        visual_cue: cueType,
        caregiver_support: supportLevel,
      },
    }),
    [plan.protocol, cueType, supportLevel]
  );

  function addTimeline(actor: TimelineEntry["actor"], label: string, detail: string) {
    setTimeline((current) =>
      [
        { id: nextId.current++, time: nowStamp(), actor, label, detail },
        ...current,
      ].slice(0, 120)
    );
  }

  function applyScenario(id: ScenarioId) {
    const next = scenarioPresets[id];
    setScenario(id);
    setEnvironment(next.environment);
    setStatus("idle");
    setStepIndex(0);
    addTimeline("caregiver", `${next.name} chosen`, next.careGoal);
  }

  function playRoutine() {
    if (steps.length === 0) return;
    setStepIndex(0);
    setStatus("playing");
    addTimeline("caregiver", "Routine started", `${preset.name} plays through ${steps.length} preauthorized steps`);
  }

  function togglePause() {
    if (status === "playing") {
      setStatus("paused");
      addTimeline("caregiver", "Routine paused", "caregiver paused the routine manually");
    } else if (status === "paused") {
      setStatus("playing");
      addTimeline("caregiver", "Routine resumed", "caregiver resumed the routine");
    }
  }

  function resetRoom() {
    setStatus("idle");
    setStepIndex(0);
    addTimeline("caregiver", "Room reset", "the room returned to its ready state");
  }

  function personRejects() {
    if (status !== "playing" && status !== "paused") return;
    setStatus("escalated");
    addTimeline(
      "protocol",
      "Person rejects",
      "rejection signal matched a configured safety exception; the routine stopped and the caregiver was notified"
    );
  }

  function caregiverPauses() {
    if (status !== "playing") return;
    setStatus("paused");
    addTimeline("protocol", "Caregiver pause", "caregiver pause matched a configured safety exception");
  }

  function generateProtocol() {
    setProtocolOpen(true);
    setGeneratedAt(nowStamp());
    setJustGenerated(true);
    window.setTimeout(() => setJustGenerated(false), 1800);
    window.setTimeout(() => {
      protocolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    addTimeline(
      "neuroljus",
      "Protocol generated",
      plan.validation.valid
        ? "care_command_protocol_v0 built locally from the room settings"
        : `protocol built with ${plan.validation.issues.length} validation issue(s)`
    );
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportDocument, null, 2));
      setCopied(true);
      addTimeline("caregiver", "Protocol copied", "care_command_protocol_v0 copied to the clipboard");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      addTimeline("neuroljus", "Copy failed", "browser clipboard was unavailable");
    }
  }

  async function copyPacket() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(plan.adapterPackets[adapterTarget], null, 2)
      );
      setPacketCopied(true);
      addTimeline("caregiver", "Adapter packet copied", `${adapterLabels[adapterTarget]} packet copied`);
      window.setTimeout(() => setPacketCopied(false), 1500);
    } catch {
      addTimeline("neuroljus", "Copy failed", "browser clipboard was unavailable");
    }
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(exportDocument, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `neuroljus-future-care-room-${scenario}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    addTimeline("caregiver", "Protocol downloaded", "care_command_protocol_v0 exported as a JSON file");
  }

  useEffect(() => {
    if (status !== "playing") return;

    if (stepIndex >= steps.length) {
      setStatus("completed");
      addTimeline("protocol", "Routine complete", "every preauthorized step executed inside the protocol");
      return;
    }

    const timer = window.setTimeout(() => {
      const step = steps[stepIndex];
      addTimeline("robot", commandLabels[step.command], step.reason);
      setStepIndex((current) => current + 1);
    }, STEP_INTERVAL_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, stepIndex, steps]);

  const completedCommands = useMemo(
    () => new Set(steps.slice(0, stepIndex).map((step) => step.command)),
    [steps, stepIndex]
  );
  const currentCommand =
    status === "playing" && stepIndex < steps.length ? steps[stepIndex].command : undefined;

  const sceneLight = completedCommands.has("lower_light")
    ? environment.light
    : Math.min(82, environment.light + 36);
  const sceneSound = completedCommands.has("reduce_sound")
    ? environment.sound
    : Math.min(78, environment.sound + 38);
  const robotDistance = completedCommands.has("step_back")
    ? environment.distance
    : Math.max(0.7, environment.distance - 0.7);
  const cardVisible =
    cueType !== "none" &&
    (completedCommands.has("offer_visual_card") || currentCommand === "offer_visual_card");
  const caregiverNotified =
    completedCommands.has("notify_caregiver") || status === "escalated" || status === "completed";

  // Scene geometry: person stands at x=185; the robot keeps its distance to the right.
  const robotX = Math.min(615, 275 + robotDistance * 85);
  const dimOpacity = ((100 - sceneLight) / 100) * 0.38;
  const glowOpacity = 0.15 + (sceneLight / 100) * 0.8;
  const soundOpacity = 0.12 + (sceneSound / 100) * 0.78;
  const robotActing = Boolean(currentCommand);
  const activeStepIndex =
    (status === "playing" || status === "paused") && stepIndex < steps.length ? stepIndex : -1;

  const observationText = `Light at ${sceneLight}%, sound at ${sceneSound}%, interface holding ${robotDistance.toFixed(
    1
  )} m of space at a ${environment.pace} pace.`;

  const suggestedStep = currentCommand
    ? steps[stepIndex]
    : steps.length > 0
      ? steps[0]
      : undefined;

  const actionText =
    status === "completed"
      ? "Routine complete. The protocol, timeline, and adapter packets are ready."
      : status === "escalated"
        ? "Safety exception active. The room is waiting for the caregiver."
        : status === "paused"
          ? "Routine paused. The caregiver decides when it continues."
          : suggestedStep
            ? `${commandLabels[suggestedStep.command]} — ${suggestedStep.reason}.`
            : "No preauthorized steps for this configuration.";

  const progress = steps.length === 0 ? 0 : Math.min(100, Math.round((stepIndex / steps.length) * 100));

  const pathStages = ["Observation", "Care interpretation", "Protocol", "Robot adapter"];
  const activeStage =
    status === "playing" || status === "paused" || status === "escalated" || status === "completed"
      ? 3
      : protocolOpen
        ? 2
        : 0;

  return (
    <>
      <Head>
        <title>Future Care Room - Neuroljus</title>
        <meta
          name="description"
          content="An interactive care room where lived care becomes structured intelligence: shape a real situation, watch Neuroljus form a protocol, and see how an assistive robot receives it."
        />
        <meta name="theme-color" content="#09090b" />
      </Head>

      <div className="page">
        <div className="statusbar" aria-hidden="true">
          <span>
            neuroljus://local · <b>care_command_protocol_v0</b> · audit=on · network=off
          </span>
          <span>latency 0ms · deterministic · caregiver_authority=true</span>
        </div>

        <header className="shell topnav" role="banner">
          <div className="brandRow">
            <Link href="/" className="logo">
              Neuroljus
            </Link>
            <span className="sep">/</span>
            <span className="platform">Care Room</span>
          </div>
          <nav className="navLinks" aria-label="Labs">
            <Link href="/labs/robot-interface">Protocol Workspace</Link>
            <Link href="/">Platform</Link>
          </nav>
          <div className="navRight">
            <div className="pills" role="group" aria-label="Platform layers">
              <span className="pill on">runtime</span>
              <span className="pill">protocol</span>
              <span className="pill">adapters</span>
              <span className="pill">audit</span>
            </div>
            <div className={`simStatus ${status}`} role="status" aria-live="polite">
              {statusLabels[status]}
            </div>
          </div>
        </header>

        <main className="workspace">
          <div className="pageIntro shell">
            <p className="cli">$ neuroljus care-room --live</p>
            <h1>Future Care Room</h1>
            <p className="crossLink">
              Want the full protocol workspace?{" "}
              <Link href="/labs/robot-interface">Open the Robot Care Interface</Link>
            </p>
          </div>

        <section className="hero">
          <h2>Neuroljus turns lived care into structured intelligence for assistive systems.</h2>
          <div className="pathRibbon" aria-label="How the room works">
            {pathStages.map((stage, index) => (
              <span key={stage} className="pathStage">
                <b className={index === activeStage ? "active" : ""}>{stage}</b>
                {index < pathStages.length - 1 && <i aria-hidden="true">→</i>}
              </span>
            ))}
          </div>
        </section>

        <section className="scenarioRow" aria-label="Care situations">
          <span className="scenarioLabel">Choose a situation</span>
          {scenarioOrder.map((id) => (
            <button
              key={id}
              onClick={() => applyScenario(id)}
              className={scenario === id ? "scenarioChip active" : "scenarioChip"}
              aria-pressed={scenario === id}
              title={scenarioPresets[id].careGoal}
            >
              {scenarioPresets[id].name}
            </button>
          ))}
        </section>

        <section className="stage">
          <aside className="panel controls" aria-label="Room controls">
            <p className="kicker">Shape the room</p>
            <h3>Care controls</h3>

            <label className="slider">
              <span>
                Light <b>{environment.light}%</b>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={environment.light}
                onChange={(event) =>
                  setEnvironment((current) => ({ ...current, light: Number(event.target.value) }))
                }
              />
            </label>
            <label className="slider">
              <span>
                Sound <b>{environment.sound}%</b>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={environment.sound}
                onChange={(event) =>
                  setEnvironment((current) => ({ ...current, sound: Number(event.target.value) }))
                }
              />
            </label>
            <label className="slider">
              <span>
                Robot distance <b>{environment.distance.toFixed(1)}m</b>
              </span>
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.1}
                value={environment.distance}
                onChange={(event) =>
                  setEnvironment((current) => ({ ...current, distance: Number(event.target.value) }))
                }
              />
            </label>

            <label className="field">
              Pace
              <select
                value={environment.pace}
                onChange={(event) =>
                  setEnvironment((current) => ({
                    ...current,
                    pace: event.target.value as Environment["pace"],
                  }))
                }
              >
                <option value="slow">Slow</option>
                <option value="steady">Steady</option>
                <option value="adaptive">Adaptive</option>
              </select>
            </label>

            <label className="field">
              Visual cue
              <select value={cueType} onChange={(event) => setCueType(event.target.value as CueType)}>
                {(Object.keys(cueLabels) as CueType[]).map((cue) => (
                  <option key={cue} value={cue}>
                    {cueLabels[cue]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Caregiver presence
              <select
                value={supportLevel}
                onChange={(event) => setSupportLevel(event.target.value as SupportLevel)}
              >
                {(Object.keys(supportLabels) as SupportLevel[]).map((level) => (
                  <option key={level} value={level}>
                    {supportLabels[level]}
                  </option>
                ))}
              </select>
              <span className="fieldHint">{supportInterpretation[supportLevel]}</span>
            </label>

            <div className="actions">
              <button className="primaryAction" onClick={playRoutine} disabled={status === "playing" || steps.length === 0}>
                Play routine
              </button>
              <button onClick={togglePause} disabled={status !== "playing" && status !== "paused"}>
                {status === "paused" ? "Resume" : "Pause"}
              </button>
              <button onClick={resetRoom}>Reset</button>
            </div>
            <div className="actions">
              <button onClick={personRejects} disabled={status !== "playing" && status !== "paused"}>
                Person rejects
              </button>
              <button onClick={caregiverPauses} disabled={status !== "playing"}>
                Caregiver pauses
              </button>
            </div>
          </aside>

          <div className="room" aria-label="Care room scene">
            <div className="roomTop">
              <div>
                <span>Situation</span>
                <strong>{preset.name}</strong>
                <p className="goal">{preset.careGoal}</p>
              </div>
              <div className="meters">
                <div>
                  <span>Light</span>
                  <b>{sceneLight}%</b>
                </div>
                <div>
                  <span>Sound</span>
                  <b>{sceneSound}%</b>
                </div>
                <div>
                  <span>Space</span>
                  <b>{robotDistance.toFixed(1)}m</b>
                </div>
              </div>
            </div>

            <div className="roomCanvas">
              <svg
                className="sceneSvg"
                viewBox="0 0 760 400"
                preserveAspectRatio="xMidYMax meet"
                role="img"
                aria-label={observationText}
              >
                <defs>
                  <linearGradient id="fcrWall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eef5ee" />
                    <stop offset="100%" stopColor="#dce9df" />
                  </linearGradient>
                  <linearGradient id="fcrFloor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e3d4b4" />
                    <stop offset="100%" stopColor="#d7c4a0" />
                  </linearGradient>
                  <radialGradient id="fcrWindowGlow">
                    <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="fcrLampGlow">
                    <stop offset="0%" stopColor="#ffe3a1" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#ffe3a1" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* room */}
                <rect x="0" y="0" width="760" height="300" fill="url(#fcrWall)" />
                <rect x="0" y="300" width="760" height="100" fill="url(#fcrFloor)" />
                <line x1="0" y1="300" x2="760" y2="300" stroke="#c3ae87" strokeWidth="2" />

                {/* window with daylight that follows the light level */}
                <circle
                  cx="120"
                  cy="112"
                  r="150"
                  fill="url(#fcrWindowGlow)"
                  style={{ opacity: glowOpacity, transition: "opacity 500ms ease" }}
                />
                <rect x="62" y="48" width="116" height="128" rx="8" fill="#fff8e6" stroke="#d8c39a" strokeWidth="2" />
                <line x1="120" y1="50" x2="120" y2="174" stroke="#d8c39a" strokeWidth="2" />
                <line x1="64" y1="112" x2="176" y2="112" stroke="#d8c39a" strokeWidth="2" />
                <rect x="54" y="176" width="132" height="8" rx="3" fill="#d8c39a" />

                {/* pendant lamp */}
                <line x1="430" y1="0" x2="430" y2="40" stroke="#9aa8a4" strokeWidth="2" />
                <path d="M 412 40 L 448 40 L 440 58 L 420 58 Z" fill="#b89a6a" />
                <circle
                  cx="430"
                  cy="64"
                  r="6"
                  fill="#ffe3a1"
                  style={{ opacity: 0.25 + (sceneLight / 100) * 0.75, transition: "opacity 500ms ease" }}
                />
                <ellipse
                  cx="430"
                  cy="330"
                  rx="92"
                  ry="16"
                  fill="url(#fcrLampGlow)"
                  style={{ opacity: (sceneLight / 100) * 0.5, transition: "opacity 500ms ease" }}
                />

                {/* ambient sound source */}
                <g
                  transform="translate(664, 84)"
                  style={{ opacity: soundOpacity, transition: "opacity 500ms ease" }}
                >
                  <circle cx="0" cy="0" r="4" fill="#6b7f92" />
                  <path d="M 10 -12 a 16 16 0 0 1 0 24" fill="none" stroke="#6b7f92" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 20 -22 a 30 30 0 0 1 0 44" fill="none" stroke="#6b7f92" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 30 -32 a 44 44 0 0 1 0 64" fill="none" stroke="#6b7f92" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* dusk overlay: the room darkens as light goes down */}
                <rect
                  x="0"
                  y="0"
                  width="760"
                  height="400"
                  fill="#242b3d"
                  pointerEvents="none"
                  style={{ opacity: dimOpacity, transition: "opacity 500ms ease" }}
                />

                {/* person */}
                <g transform="translate(185, 0)">
                  <circle className="breatheHalo" cx="0" cy="286" r="54" fill="rgba(36, 91, 98, 0.14)" />
                  <ellipse cx="0" cy="328" rx="42" ry="8" fill="rgba(45, 62, 58, 0.14)" />
                  <circle cx="0" cy="252" r="15" fill="#245b62" />
                  <rect x="-19" y="270" width="38" height="54" rx="17" fill="#245b62" />
                  <text className="sceneLabel" x="0" y="356" textAnchor="middle">
                    Person
                  </text>
                </g>

                {/* caregiver: position follows the presence setting */}
                {supportLevel === "remote" ? (
                  <g transform="translate(668, 190)">
                    <rect x="-44" y="-34" width="88" height="74" rx="10" fill="rgba(255, 255, 255, 0.85)" stroke="#7c8ca1" strokeDasharray="5 4" strokeWidth="1.5" />
                    <circle cx="0" cy="-12" r="9" fill="#405064" />
                    <rect x="-11" y="0" width="22" height="26" rx="9" fill="#405064" />
                    <text className="sceneLabel" x="0" y="54" textAnchor="middle">
                      Caregiver · remote
                    </text>
                  </g>
                ) : (
                  <g
                    style={{
                      transform:
                        supportLevel === "hands_on"
                          ? "translate(104px, 0px) scale(1)"
                          : "translate(66px, -40px) scale(0.85)",
                      transition: "transform 400ms ease",
                    }}
                  >
                    <ellipse cx="0" cy="328" rx="34" ry="7" fill="rgba(45, 62, 58, 0.12)" />
                    <circle cx="0" cy="258" r="13" fill="#405064" />
                    <rect x="-16" y="274" width="32" height="50" rx="14" fill="#405064" />
                    <text className="sceneLabel" x="0" y="356" textAnchor="middle">
                      Caregiver
                    </text>
                  </g>
                )}

                {/* robot: keeps the preauthorized distance */}
                <g style={{ transform: `translateX(${robotX}px)`, transition: "transform 600ms ease" }}>
                  <g className={robotActing ? "robotFigure acting" : "robotFigure"}>
                    {robotActing && (
                      <circle className="robotPulse" cx="0" cy="288" r="54" fill="none" stroke="#245b62" strokeWidth="2" />
                    )}
                    <ellipse cx="0" cy="330" rx="34" ry="7" fill="rgba(45, 62, 58, 0.14)" />
                    <line x1="0" y1="250" x2="0" y2="236" stroke="#182231" strokeWidth="3" />
                    <circle className={robotActing ? "robotBeacon on" : "robotBeacon"} cx="0" cy="231" r="5" fill="#3ecf9a" />
                    <rect x="-26" y="250" width="52" height="34" rx="10" fill="#182231" />
                    <circle className="robotEye" cx="-10" cy="267" r="5" fill="#5fe0b7" />
                    <circle className="robotEye" cx="10" cy="267" r="5" fill="#5fe0b7" />
                    <rect x="-22" y="288" width="44" height="36" rx="12" fill="#223047" />
                    <rect x="-8" y="296" width="16" height="6" rx="3" fill="#3ecf9a" opacity="0.85" />
                    <circle cx="-13" cy="327" r="6" fill="#182231" />
                    <circle cx="13" cy="327" r="6" fill="#182231" />
                    <text className="sceneLabel" x="0" y="356" textAnchor="middle">
                      Robot · care interface
                    </text>
                  </g>
                </g>
              </svg>

              {cardVisible && (
                <div className="visualCard">
                  <span>Visual support</span>
                  <strong>{cueText}</strong>
                </div>
              )}
              {caregiverNotified && (
                <div className="noticeCard">
                  <span>Caregiver notice</span>
                  <strong>{status === "completed" ? "Routine complete" : "Review requested"}</strong>
                </div>
              )}
            </div>

            <div className="nowBar" aria-live="polite">
              <span>Now</span>
              <div>
                <strong>{currentCommand ? commandLabels[currentCommand] : statusLabels[status]}</strong>
                <p>{actionText}</p>
              </div>
              {steps.length > 0 && (
                <b className="stepCount">
                  {Math.min(stepIndex + (status === "playing" ? 1 : 0), steps.length)}/{steps.length}
                </b>
              )}
            </div>

            <div
              className="progressWrap"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Routine progress"
            >
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>

          <aside className="machinePanel" aria-label="Machine layer" aria-live="polite">
            <p className="mKicker">Machine layer · live translation</p>
            <h3 className="mTitle">What the machine receives</h3>
            <p className="mIntro">
              The warm room on the left is what the caregiver shapes. This is the
              same moment, translated — as the routine plays, each action lights
              up its line.
            </p>

            <div className="mMeta">
              <span>protocol</span>
              <b>care_command_protocol_v0</b>
              <span>scenario</span>
              <b>{scenario}</b>
              <span>plan</span>
              <b>
                {steps.length} steps · {preset.duration} min
              </b>
              <span>presence</span>
              <b>{supportLevel}</b>
            </div>

            <div className="streamBlock">
              <p className="mLabel">planned_sequence</p>
              {steps.map((step, index) => {
                const state =
                  index < stepIndex ? "done" : index === activeStepIndex ? "active" : "pending";
                return (
                  <div key={step.command} className={`mLine ${state}`}>
                    <i>{state === "done" ? "✓" : state === "active" ? "▸" : "·"}</i>
                    <code>
                      +{step.offsetMinutes}m {step.command}
                    </code>
                    <span>{step.durationMinutes}m</span>
                  </div>
                );
              })}
            </div>

            <div className="streamBlock">
              <p className="mLabel">safety_exceptions · always win</p>
              {preset.exceptions.map((exception) => (
                <div
                  key={exception}
                  className={
                    status === "escalated" && exception === "rejection_signal"
                      ? "mLine exception fired"
                      : "mLine exception"
                  }
                >
                  <i>{status === "escalated" && exception === "rejection_signal" ? "!!" : "◦"}</i>
                  <code>{exception} → stop, hand back to caregiver</code>
                </div>
              ))}
            </div>

            <div className="mFoot">
              <span>
                status: <b>{status}</b>
              </span>
              <span>
                caregiver_notified: <b>{caregiverNotified ? "true" : "false"}</b>
              </span>
            </div>
            {plan.attentionFlags.some((flag) => flag.severity === "warning") && (
              <p className="mWarn">
                ⚠ {plan.attentionFlags.find((flag) => flag.severity === "warning")?.message}
              </p>
            )}

            <button className="generateBtn" onClick={generateProtocol}>
              {protocolOpen ? "Regenerate full protocol" : "Generate full protocol"}
            </button>
          </aside>
        </section>

        <section className="whyRow" aria-label="Why this matters">
          <div>
            <strong>Care knowledge becomes protocol</strong>
            <p>What a caregiver knows about one person becomes a structured, repeatable routine.</p>
          </div>
          <div>
            <strong>Protocols travel</strong>
            <p>The same envelope can support families, municipalities, research, and assistive robots.</p>
          </div>
          <div>
            <strong>Local and open</strong>
            <p>Everything runs in your browser and exports adapter-ready JSON. No external API, no personal data.</p>
          </div>
        </section>

        <section className="lower">
          <div className="panel timeline" aria-label="Timeline of actions">
            <p className="kicker">Timeline</p>
            <h3>What just happened in the room</h3>
            <div className="timelineList">
              {timeline.map((entry) => (
                <article key={entry.id} className={`timelineItem ${entry.actor}`}>
                  <time>{entry.time}</time>
                  <div>
                    <strong>{entry.label}</strong>
                    <p>{entry.detail}</p>
                  </div>
                  <span>{entry.actor}</span>
                </article>
              ))}
            </div>
          </div>

          <div
            ref={protocolRef}
            className={justGenerated ? "protocolLayer generated" : "protocolLayer"}
            aria-label="Protocol layer"
          >
            <p className="kicker">Protocol layer</p>
            <h3>What the robot receives</h3>

            {protocolOpen ? (
              <>
                <div className="readyRow">
                  <span className={plan.validation.valid ? "readyChip ok" : "readyChip warn"}>
                    {plan.validation.valid ? "Protocol ready" : "Needs attention"}
                  </span>
                  {generatedAt && (
                    <p className="planMeta">Generated at {generatedAt} from the room as configured.</p>
                  )}
                </div>
                {plan.explanation.map((paragraph, index) => (
                  <p key={index} className="planParagraph">
                    {paragraph}
                  </p>
                ))}

                {plan.reflectionQuestions.length > 0 && (
                  <>
                    <h4>Reflection for the caregiver</h4>
                    <ul className="questionList">
                      {plan.reflectionQuestions.slice(0, 3).map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="exportRow">
                  <button onClick={copyJson}>{copied ? "Copied" : "Copy JSON"}</button>
                  <button onClick={downloadJson}>Download JSON</button>
                  <button onClick={copyPacket}>{packetCopied ? "Copied" : "Copy adapter packet"}</button>
                  <select
                    value={adapterTarget}
                    onChange={(event) => setAdapterTarget(event.target.value as AdapterTarget)}
                    aria-label="Adapter packet target"
                  >
                    {(Object.keys(adapterLabels) as AdapterTarget[]).map((target) => (
                      <option key={target} value={target}>
                        {adapterLabels[target]}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="soft">{adapterTransports[adapterTarget]}.</p>
                <pre>{JSON.stringify(plan.adapterPackets[adapterTarget], null, 2)}</pre>
              </>
            ) : (
              <p className="emptyState">
                Generate the protocol to see the exact JSON this room produces —
                the same envelope a ROS2, MQTT, HTTP, or offline adapter would
                receive, with the caregiver&apos;s settings preserved.
              </p>
            )}
          </div>
        </section>

        <footer className="foot">
          <p>
            Everything on this page runs locally in your browser: no external API,
            no personal data. This is how Neuroljus works — lived care, structured
            into protocols that people, researchers, and assistive systems
            can trust.
          </p>
        </footer>
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100dvh;
          background: #09090b;
          color: #fafafa;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }
        .shell {
          width: min(1360px, calc(100% - 44px));
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
        .simStatus {
          min-width: 168px;
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          background: #0c0c0e;
          color: #a1a1aa;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          font-weight: 700;
          padding: 0 10px;
        }
        .simStatus.playing {
          border-color: #3ecf9a;
          color: #3ecf9a;
          background: rgba(62, 207, 154, 0.08);
        }
        .simStatus.paused,
        .simStatus.escalated {
          border-color: #fbbf24;
          color: #fbbf24;
          background: rgba(251, 191, 36, 0.08);
        }
        .simStatus.completed {
          border-color: #3ecf9a;
          color: #3ecf9a;
        }
        .workspace {
          padding: 22px 0 40px;
        }
        .pageIntro {
          margin-bottom: 18px;
        }
        .cli {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 12px;
          color: #3ecf9a;
          margin-bottom: 10px;
        }
        .crossLink {
          margin-top: 8px;
          color: #71717a;
          font-size: 13px;
          font-weight: 600;
        }
        .crossLink :global(a) {
          color: #3ecf9a;
          font-weight: 700;
        }
        h1,
        h2,
        h3,
        h4,
        p {
          margin: 0;
          overflow-wrap: anywhere;
        }
        h1 {
          font-size: 30px;
          line-height: 1.05;
        }
        h2 {
          font-size: 24px;
          line-height: 1.25;
        }
        h3 {
          font-size: 16px;
        }
        h4 {
          margin-top: 6px;
          font-size: 13px;
          text-transform: uppercase;
          color: #637085;
        }
        .kicker {
          margin-bottom: 4px;
          color: #3ecf9a;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .hero {
          max-width: 1360px;
          margin: 0 auto 14px;
          border: 1px solid #27272a;
          border-radius: 6px;
          background: #0c0c0e;
          padding: 18px 22px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          width: min(1360px, calc(100% - 44px));
        }
        .hero h2 {
          max-width: 720px;
          color: #fafafa;
          font-size: 20px;
        }
        .pathRibbon {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }
        .pathStage {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .pathStage b {
          border: 1px solid #3f3f46;
          border-radius: 999px;
          background: #18181b;
          color: #a1a1aa;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          white-space: nowrap;
          transition: all 220ms ease;
        }
        .pathStage b.active {
          border-color: #3ecf9a;
          background: rgba(62, 207, 154, 0.1);
          color: #3ecf9a;
        }
        .pathStage i {
          color: #52525b;
          font-style: normal;
          font-weight: 800;
        }
        .scenarioRow {
          max-width: 1360px;
          margin: 0 auto 16px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 0 22px;
        }
        .scenarioLabel {
          color: #71717a;
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          margin-right: 4px;
        }
        .scenarioChip {
          border: 1px solid #3f3f46;
          border-radius: 999px;
          background: #18181b;
          padding: 10px 16px;
          cursor: pointer;
          font: inherit;
          font-weight: 700;
          font-size: 13px;
          color: #a1a1aa;
          min-height: 40px;
        }
        .scenarioChip.active {
          border-color: #3ecf9a;
          background: #3ecf9a;
          color: #09090b;
        }
        .stage {
          max-width: 1360px;
          margin: 0 auto 16px;
          display: grid;
          grid-template-columns: minmax(260px, 0.85fr) minmax(420px, 1.5fr) minmax(280px, 0.95fr);
          gap: 16px;
          align-items: stretch;
          padding: 0 22px;
        }
        .panel {
          border: 1px solid #27272a;
          border-radius: 6px;
          background: #0c0c0e;
          padding: 18px;
        }
        .controls {
          display: grid;
          gap: 12px;
          align-content: start;
        }
        .slider {
          display: grid;
          gap: 8px;
        }
        .slider span {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #a1a1aa;
          font-size: 13px;
          font-weight: 700;
        }
        .field {
          display: grid;
          gap: 7px;
          color: #a1a1aa;
          font-size: 13px;
          font-weight: 700;
        }
        .fieldHint {
          color: #71717a;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.4;
        }
        input[type="range"] {
          width: 100%;
          padding: 0;
          accent-color: #3ecf9a;
        }
        select {
          width: 100%;
          min-height: 40px;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          background: #18181b;
          color: #fafafa;
          font: inherit;
          padding: 0 10px;
        }
        select:focus,
        button:focus,
        input:focus {
          outline: 2px solid #3ecf9a;
          outline-offset: 2px;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        button {
          min-height: 40px;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          background: #18181b;
          color: #fafafa;
          cursor: pointer;
          font: inherit;
          font-weight: 700;
          padding: 0 12px;
        }
        button:hover:not(:disabled) {
          border-color: #3ecf9a;
          color: #3ecf9a;
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .primaryAction {
          background: #3ecf9a;
          border-color: #3ecf9a;
          color: #09090b;
        }
        .primaryAction:hover:not(:disabled) {
          color: #09090b;
          border-color: #3ecf9a;
          opacity: 0.92;
        }
        .room {
          border: 1px solid #27272a;
          border-radius: 6px;
          padding: 18px;
          display: grid;
          gap: 12px;
          background: #ffffff;
          color: #17202f;
        }
        .roomTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .roomTop span,
        .meters span,
        .visualCard span,
        .noticeCard span {
          color: #637085;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .roomTop strong {
          display: block;
          color: #245b62;
        }
        .goal {
          margin-top: 3px;
          max-width: 380px;
          color: #637085;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.4;
        }
        .meters {
          display: grid;
          grid-template-columns: repeat(3, auto);
          gap: 8px;
        }
        .meters div {
          border: 1px solid #d8e1df;
          border-radius: 8px;
          background: #fbfdfc;
          padding: 8px 12px;
        }
        .meters b {
          display: block;
          margin-top: 2px;
        }
        .roomCanvas {
          position: relative;
          overflow: hidden;
          border: 1px solid #cbd8d5;
          border-radius: 8px;
          background: #dce9df;
        }
        .sceneSvg {
          display: block;
          width: 100%;
          height: auto;
        }
        .sceneSvg :global(.sceneLabel) {
          fill: #3d4959;
          font-size: 12px;
          font-weight: 700;
        }
        .sceneSvg :global(.breatheHalo) {
          animation: breathe 5s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }
        .sceneSvg :global(.robotEye) {
          animation: blink 6s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes blink {
          0%,
          46%,
          52%,
          100% {
            transform: scaleY(1);
          }
          49% {
            transform: scaleY(0.15);
          }
        }
        .sceneSvg :global(.robotFigure.acting) {
          animation: bob 1.1s ease-in-out infinite;
        }
        @keyframes bob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .sceneSvg :global(.robotPulse) {
          animation: pulse 1.6s ease-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.15);
            opacity: 0;
          }
        }
        .sceneSvg :global(.robotBeacon) {
          opacity: 0.35;
        }
        .sceneSvg :global(.robotBeacon.on) {
          opacity: 1;
          animation: breathe 1.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sceneSvg :global(.breatheHalo),
          .sceneSvg :global(.robotEye),
          .sceneSvg :global(.robotFigure.acting),
          .sceneSvg :global(.robotPulse),
          .sceneSvg :global(.robotBeacon.on) {
            animation: none;
          }
        }
        .visualCard,
        .noticeCard {
          position: absolute;
          max-width: 230px;
          border: 1px solid rgba(23, 32, 47, 0.14);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.94);
          padding: 12px;
          box-shadow: 0 16px 30px rgba(23, 32, 47, 0.12);
        }
        .visualCard {
          left: 30px;
          top: 30px;
        }
        .noticeCard {
          right: 24px;
          bottom: 30px;
        }
        .visualCard strong,
        .noticeCard strong {
          display: block;
          margin-top: 5px;
          line-height: 1.3;
        }
        .nowBar {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          border: 1px solid #d8e1df;
          border-radius: 8px;
          background: #fbfdfc;
          padding: 10px 14px;
        }
        .nowBar span {
          color: #637085;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .nowBar strong {
          display: block;
        }
        .nowBar p {
          color: #566477;
          font-size: 13px;
          line-height: 1.4;
        }
        .stepCount {
          color: #245b62;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }
        .progressWrap {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: #e5ecea;
        }
        .progressWrap div {
          height: 100%;
          border-radius: inherit;
          background: #245b62;
          transition: width 300ms ease;
        }
        .machinePanel {
          display: grid;
          gap: 12px;
          align-content: start;
          border: 1px solid #1e2c40;
          border-radius: 8px;
          background: linear-gradient(180deg, #0c1524, #0a111d);
          padding: 18px;
          color: #d9e6f2;
          font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
        }
        .mKicker {
          color: #6e87a3;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .mTitle {
          color: #f2f7fb;
          font-size: 15px;
        }
        .mIntro {
          color: #8fa6bd;
          font-size: 12px;
          line-height: 1.55;
        }
        .mMeta {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 4px 12px;
          border: 1px solid #1e2c40;
          border-radius: 8px;
          background: rgba(20, 32, 50, 0.55);
          padding: 10px 12px;
          font-size: 12px;
        }
        .mMeta span {
          color: #6e87a3;
        }
        .mMeta b {
          color: #d9e6f2;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        .streamBlock {
          display: grid;
          gap: 3px;
        }
        .mLabel {
          margin-bottom: 3px;
          color: #6e87a3;
          font-size: 11px;
          letter-spacing: 0.06em;
        }
        .mLine {
          display: grid;
          grid-template-columns: 16px minmax(0, 1fr) auto;
          gap: 8px;
          align-items: baseline;
          border-left: 2px solid transparent;
          border-radius: 4px;
          padding: 4px 8px 4px 6px;
          font-size: 12px;
          color: #8fa6bd;
          transition: background 250ms ease, color 250ms ease;
        }
        .mLine i {
          font-style: normal;
          text-align: center;
        }
        .mLine code {
          font-family: inherit;
          overflow-wrap: anywhere;
        }
        .mLine span {
          color: #56718c;
        }
        .mLine.done {
          color: #7fd6b6;
        }
        .mLine.done i {
          color: #3ecf9a;
        }
        .mLine.active {
          border-left-color: #3ecf9a;
          background: rgba(62, 207, 154, 0.12);
          color: #eafff7;
        }
        .mLine.active i {
          color: #3ecf9a;
          animation: streamTick 1s steps(2, start) infinite;
        }
        @keyframes streamTick {
          to {
            opacity: 0.25;
          }
        }
        .mLine.exception {
          color: #d9b16b;
        }
        .mLine.exception.fired {
          border-left-color: #ff8f6b;
          background: rgba(255, 143, 107, 0.14);
          color: #ffd3c2;
        }
        .mFoot {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 16px;
          border-top: 1px solid #1e2c40;
          padding-top: 10px;
          font-size: 12px;
          color: #6e87a3;
        }
        .mFoot b {
          color: #d9e6f2;
          font-weight: 600;
        }
        .mWarn {
          color: #e0b566;
          font-size: 12px;
          line-height: 1.5;
        }
        .generateBtn {
          border: 1px solid #2c8f6d;
          border-radius: 8px;
          background: #16543f;
          color: #d9fff0;
          font-family: inherit;
        }
        .generateBtn:hover:not(:disabled) {
          border-color: #3ecf9a;
          color: #eafff7;
        }
        @media (prefers-reduced-motion: reduce) {
          .mLine.active i {
            animation: none;
          }
        }
        .whyRow {
          max-width: 1360px;
          margin: 0 auto 16px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 10px;
        }
        .whyRow div {
          border: 1px solid #d8e1df;
          border-radius: 8px;
          background: #ffffff;
          padding: 14px;
        }
        .whyRow strong {
          display: block;
          margin-bottom: 5px;
          color: #17202f;
        }
        .whyRow p {
          color: #566477;
          font-size: 13px;
          line-height: 1.5;
        }
        .lower {
          max-width: 1360px;
          margin: 0 auto 16px;
          display: grid;
          grid-template-columns: minmax(320px, 0.9fr) minmax(360px, 1.1fr);
          gap: 16px;
          align-items: start;
        }
        .timeline h3,
        .protocolLayer h3 {
          margin: 4px 0 12px;
        }
        .timelineList {
          display: grid;
          gap: 8px;
          max-height: 480px;
          overflow: auto;
          padding-right: 4px;
        }
        .timelineItem {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr) auto;
          gap: 10px;
          align-items: start;
          border: 1px solid #d8e1df;
          border-radius: 8px;
          padding: 10px;
          background: #fbfdfc;
        }
        .timelineItem.robot {
          border-left: 3px solid #245b62;
        }
        .timelineItem.protocol {
          border-left: 3px solid #d8b15f;
        }
        .timelineItem time,
        .timelineItem span {
          color: #637085;
          font-size: 12px;
          font-weight: 800;
        }
        .timelineItem p {
          margin-top: 3px;
          color: #566477;
          font-size: 13px;
          line-height: 1.35;
        }
        .protocolLayer {
          border: 1px solid #1e2c40;
          border-radius: 8px;
          background: linear-gradient(180deg, #0c1524, #0a111d);
          padding: 18px;
          color: #d9e6f2;
        }
        .protocolLayer .kicker {
          color: #6e87a3;
        }
        .protocolLayer h3 {
          color: #f2f7fb;
        }
        .protocolLayer h4 {
          color: #6e87a3;
        }
        .protocolLayer button {
          border-color: #2a3b52;
          background: #12203a;
          color: #d9e6f2;
        }
        .protocolLayer button:hover:not(:disabled) {
          border-color: #3ecf9a;
          color: #eafff7;
        }
        .protocolLayer select {
          border-color: #2a3b52;
          background: #12203a;
          color: #d9e6f2;
        }
        .protocolLayer.generated {
          animation: settle 1.6s ease;
        }
        @keyframes settle {
          0% {
            border-color: #3ecf9a;
            box-shadow: 0 0 0 4px rgba(62, 207, 154, 0.25);
          }
          100% {
            border-color: #1e2c40;
            box-shadow: 0 0 0 0 rgba(62, 207, 154, 0);
          }
        }
        .readyRow {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .readyChip {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          padding: 5px 12px;
        }
        .readyChip.ok {
          border: 1px solid #2c8f6d;
          background: rgba(62, 207, 154, 0.14);
          color: #7fd6b6;
        }
        .readyChip.warn {
          border: 1px solid #b98c3f;
          background: rgba(224, 181, 102, 0.14);
          color: #e0b566;
        }
        .planMeta {
          color: #6e87a3;
          font-size: 12px;
          font-weight: 700;
        }
        .planParagraph {
          color: #b9c9d9;
          font-size: 13px;
          line-height: 1.55;
          margin-bottom: 8px;
        }
        .questionList {
          margin: 6px 0 0;
          padding-left: 18px;
          display: grid;
          gap: 6px;
          color: #b9c9d9;
          font-size: 13px;
          line-height: 1.45;
        }
        .exportRow {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin: 14px 0 8px;
        }
        .exportRow select {
          max-width: 240px;
          width: auto;
        }
        .soft {
          color: #637085;
          font-size: 13px;
          font-weight: 600;
        }
        .protocolLayer .soft {
          color: #8fa6bd;
        }
        .emptyState {
          color: #8fa6bd;
          font-size: 14px;
          line-height: 1.55;
        }
        pre {
          max-height: 420px;
          margin: 10px 0 0;
          overflow: auto;
          border: 1px solid #1e2c40;
          border-radius: 8px;
          background: #060d16;
          color: #cde8dd;
          font-size: 12px;
          line-height: 1.55;
          padding: 14px;
          white-space: pre-wrap;
        }
        .foot {
          max-width: 1360px;
          margin: 0 auto;
          border-top: 1px solid #27272a;
          padding: 16px 22px 0;
        }
        .foot p {
          max-width: 860px;
          color: #71717a;
          font-size: 13px;
          line-height: 1.6;
        }
        @media (max-width: 1100px) {
          .stage {
            grid-template-columns: 1fr;
          }
          .room {
            order: -1;
          }
        }
        @media (max-width: 980px) {
          .topnav,
          .lower {
            grid-template-columns: 1fr;
          }
          .navRight {
            width: 100%;
            margin-left: 0;
            justify-content: space-between;
          }
        }
        @media (max-width: 640px) {
          .shell,
          .hero,
          .scenarioRow,
          .stage {
            width: min(100% - 28px, 1360px);
            padding-left: 0;
            padding-right: 0;
          }
          .workspace {
            padding: 14px 0 32px;
          }
          h1 {
            font-size: 26px;
          }
          h2 {
            font-size: 20px;
          }
          .visualCard,
          .noticeCard {
            position: static;
            margin: 12px;
          }
          .timelineItem,
          .nowBar {
            grid-template-columns: 1fr;
          }
          .nowBar {
            gap: 4px;
          }
          .hero {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
}
