import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import SiteLayout from "@/components/SiteLayout";
import type {
  AdapterTarget,
  Command,
  Environment,
  PlannedStep,
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
  // The sequence is frozen when Play is pressed so live control changes
  // cannot stall the run timer or fabricate completed steps in the timeline.
  const [runSteps, setRunSteps] = useState<PlannedStep[] | null>(null);
  const protocolRef = useRef<HTMLDivElement | null>(null);
  const copiedTimer = useRef<number | null>(null);
  const packetCopiedTimer = useRef<number | null>(null);
  const generatedTimer = useRef<number | null>(null);
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
    setRunSteps(null);
    setStatus("idle");
    setStepIndex(0);
    addTimeline("caregiver", `${next.name} chosen`, next.careGoal);
  }

  function playRoutine() {
    if (steps.length === 0) return;
    setRunSteps(steps);
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
    setRunSteps(null);
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
    if (generatedTimer.current) window.clearTimeout(generatedTimer.current);
    generatedTimer.current = window.setTimeout(() => setJustGenerated(false), 1800);
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
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1500);
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
      if (packetCopiedTimer.current) window.clearTimeout(packetCopiedTimer.current);
      packetCopiedTimer.current = window.setTimeout(() => setPacketCopied(false), 1500);
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

  const activeSteps = runSteps ?? steps;

  useEffect(() => {
    if (status !== "playing") return;

    if (stepIndex >= activeSteps.length) {
      setStatus("completed");
      addTimeline("protocol", "Routine complete", "every preauthorized step executed inside the protocol");
      return;
    }

    const timer = window.setTimeout(() => {
      const step = activeSteps[stepIndex];
      addTimeline("robot", commandLabels[step.command], step.reason);
      setStepIndex((current) => current + 1);
    }, STEP_INTERVAL_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, stepIndex, activeSteps]);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      if (packetCopiedTimer.current) window.clearTimeout(packetCopiedTimer.current);
      if (generatedTimer.current) window.clearTimeout(generatedTimer.current);
    };
  }, []);

  const completedCommands = useMemo(
    () => new Set(activeSteps.slice(0, stepIndex).map((step) => step.command)),
    [activeSteps, stepIndex]
  );
  const currentCommand =
    status === "playing" && stepIndex < activeSteps.length
      ? activeSteps[stepIndex].command
      : undefined;

  // The "before" state is clamped so it never crosses the target:
  // lowering light/sound must never display an increase, and stepping
  // back must never display the robot moving closer.
  const sceneLight = completedCommands.has("lower_light")
    ? environment.light
    : Math.max(environment.light, Math.min(82, environment.light + 36));
  const sceneSound = completedCommands.has("reduce_sound")
    ? environment.sound
    : Math.max(environment.sound, Math.min(78, environment.sound + 38));
  const robotDistance = completedCommands.has("step_back")
    ? environment.distance
    : Math.min(environment.distance, Math.max(0.7, environment.distance - 0.7));
  const robotTravel = Math.min(168, Math.round(robotDistance * 44));
  const cardVisible =
    cueType !== "none" &&
    (completedCommands.has("offer_visual_card") || currentCommand === "offer_visual_card");
  const caregiverNotified =
    completedCommands.has("notify_caregiver") || status === "escalated" || status === "completed";

  const roomStyle = {
    "--light-level": `${sceneLight}%`,
    "--light-opacity": `${0.2 + sceneLight / 150}`,
    "--sound-opacity": `${Math.max(0.12, sceneSound / 100)}`,
    "--robot-travel": `${robotTravel}px`,
  } as CSSProperties;

  const observationText = `Light at ${sceneLight}%, sound at ${sceneSound}%, interface holding ${robotDistance.toFixed(
    1
  )} m of space at a ${environment.pace} pace.`;

  const suggestedStep = currentCommand
    ? activeSteps[stepIndex]
    : activeSteps.length > 0
      ? activeSteps[0]
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

  const progress =
    activeSteps.length === 0 ? 0 : Math.min(100, Math.round((stepIndex / activeSteps.length) * 100));

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
          content="An interactive care room where lived care becomes structured intelligence: shape a real situation, watch Neuroljus form a protocol, and see how a future assistive robot would receive it."
        />
      </Head>

      <SiteLayout>
        <div className="page">
          <header className="pageHead">
            <div>
              <p className="kicker">Interactive experience · local protocol engine · adapter-ready</p>
              <h1>Future Care Room</h1>
              <p className="crossLink">
                Want the full protocol workspace?{" "}
                <Link href="/labs/robot-interface">Open the Robot Care Interface</Link>
              </p>
            </div>
            <div className={`status ${status}`} role="status" aria-live="polite">
              {statusLabels[status]}
            </div>
          </header>

          <section className="hero">
            <h2>Neuroljus turns lived care into structured intelligence for future assistive systems.</h2>
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

            <div className="room" style={roomStyle} aria-label="Care room scene">
              <div className="roomTop">
                <div>
                  <span>Situation</span>
                  <strong>{preset.name}</strong>
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
                <div className="windowGlow" />
                <div className="soundField">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="personSpace">
                  <div className="personMarker">
                    <span />
                  </div>
                  <p>Person</p>
                </div>

                <div className={`caregiverUnit ${supportLevel}`}>
                  <div className="caregiverMarker">
                    <span />
                  </div>
                  <p>{supportLevel === "remote" ? "Caregiver · remote" : "Caregiver"}</p>
                </div>

                <div className={currentCommand ? "robotUnit acting" : "robotUnit"}>
                  <div className="robotHead">
                    <span />
                    <span />
                  </div>
                  <div className="robotBody" />
                  <p>Care interface</p>
                </div>

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
                    {Math.min(stepIndex + (status === "playing" ? 1 : 0), activeSteps.length)}/{activeSteps.length}
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

            <aside className="panel liveFlow" aria-label="Live care intelligence" aria-live="polite">
              <p className="kicker">Live care intelligence</p>
              <div className="flowCard">
                <span>1 · Observation</span>
                <p>{observationText}</p>
              </div>
              <div className="flowCard">
                <span>2 · Care interpretation</span>
                <p>{preset.careGoal}</p>
                <p className="soft">{supportInterpretation[supportLevel]}</p>
              </div>
              <div className="flowCard">
                <span>3 · Protocol</span>
                <p>
                  {steps.length} preauthorized steps over {preset.duration} minutes ·{" "}
                  {preset.exceptions.length} safety exceptions · local audit trail.
                </p>
                {plan.attentionFlags.some((flag) => flag.severity === "warning") && (
                  <p className="warn">
                    {plan.attentionFlags.find((flag) => flag.severity === "warning")?.message}
                  </p>
                )}
              </div>
              <div className="flowCard">
                <span>4 · Robot adapter</span>
                <p>
                  The same protocol maps to ROS2, MQTT, HTTP, or offline review —
                  adapter-ready JSON that preserves the caregiver&apos;s settings.
                </p>
              </div>
              <button className="primaryAction" onClick={generateProtocol}>
                {protocolOpen ? "Regenerate protocol" : "Generate protocol"}
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
              <p>The same envelope can support families, municipalities, research, and future assistive robots.</p>
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
              className={justGenerated ? "panel protocolLayer generated" : "panel protocolLayer"}
              aria-label="Protocol layer"
            >
              <p className="kicker">Protocol layer</p>
              <h3>What a future robot would receive</h3>

              {protocolOpen ? (
                <>
                  <div className="readyRow">
                    <span className={plan.validation.valid ? "readyChip ok" : "readyChip warn"}>
                      {plan.validation.valid ? "Protocol ready" : "Needs attention"}
                    </span>
                    {generatedAt && (
                      <p className="planMeta">
                        Last generated at {generatedAt}. The protocol below follows the room live as
                        you shape it.
                      </p>
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
        </div>
      </SiteLayout>

      <style jsx>{`
        .page {
          padding: 26px 22px 8px;
          color: var(--nl-text);
          font-family: var(--nl-font);
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
          letter-spacing: -0.01em;
          color: var(--nl-text);
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
          letter-spacing: 0.08em;
          color: var(--nl-text-faint);
        }
        .kicker {
          margin-bottom: 4px;
          color: var(--nl-aurora-a);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .pageHead {
          max-width: 1360px;
          margin: 0 auto 18px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: center;
        }
        .crossLink {
          margin-top: 6px;
          color: var(--nl-text-dim);
          font-size: 13px;
          font-weight: 700;
        }
        .crossLink :global(a) {
          color: var(--nl-aurora-b);
          text-decoration: none;
          border-bottom: 1px solid rgba(124, 227, 247, 0.4);
        }
        .crossLink :global(a:hover) {
          border-bottom-color: var(--nl-aurora-b);
        }
        .status {
          min-width: 168px;
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--nl-border-strong);
          border-radius: 999px;
          background: var(--nl-surface-strong);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          color: var(--nl-text);
          font-weight: 800;
          padding: 0 14px;
        }
        .status.playing {
          border-color: transparent;
          background: var(--nl-aurora-grad);
          color: var(--nl-on-aurora);
          box-shadow: 0 8px 28px rgba(94, 230, 164, 0.25);
        }
        .status.paused {
          border-color: rgba(247, 201, 110, 0.5);
          background: rgba(247, 201, 110, 0.12);
          color: #ffd89a;
        }
        .status.escalated {
          border-color: rgba(255, 138, 122, 0.55);
          background: rgba(255, 120, 100, 0.13);
          color: #ffb3a6;
        }
        .status.completed {
          border-color: rgba(94, 230, 164, 0.5);
          background: rgba(94, 230, 164, 0.12);
          color: #8ef0bf;
        }
        .hero {
          max-width: 1360px;
          margin: 0 auto 14px;
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius);
          background: var(--nl-surface);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 18px 22px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }
        .hero h2 {
          max-width: 720px;
          color: var(--nl-text);
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
          border: 1px solid var(--nl-border);
          border-radius: 999px;
          background: var(--nl-surface);
          color: var(--nl-text-dim);
          font-size: 12px;
          font-weight: 800;
          padding: 6px 12px;
          white-space: nowrap;
          transition: all 220ms ease;
        }
        .pathStage b.active {
          border-color: rgba(94, 230, 164, 0.55);
          background: rgba(94, 230, 164, 0.14);
          color: #8ef0bf;
        }
        .pathStage i {
          color: var(--nl-text-faint);
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
        }
        .scenarioLabel {
          color: var(--nl-text-faint);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-right: 4px;
        }
        .scenarioChip {
          border: 1px solid var(--nl-border-strong);
          border-radius: 999px;
          background: var(--nl-surface);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 10px 16px;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
          font-size: 13px;
          color: var(--nl-text);
          min-height: 40px;
          transition: border-color 160ms ease, background 160ms ease;
        }
        .scenarioChip:hover {
          border-color: var(--nl-aurora-b);
          background: var(--nl-surface-strong);
        }
        .scenarioChip.active {
          border-color: transparent;
          background: var(--nl-aurora-grad);
          color: var(--nl-on-aurora);
          box-shadow: 0 8px 28px rgba(94, 230, 164, 0.22);
        }
        .stage {
          max-width: 1360px;
          margin: 0 auto 16px;
          display: grid;
          grid-template-columns: minmax(260px, 0.85fr) minmax(420px, 1.5fr) minmax(280px, 0.95fr);
          gap: 16px;
          align-items: stretch;
        }
        .panel {
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius);
          background: var(--nl-surface);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
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
          color: var(--nl-text-dim);
          font-size: 13px;
          font-weight: 800;
        }
        .slider b {
          color: var(--nl-text);
        }
        .field {
          display: grid;
          gap: 7px;
          color: var(--nl-text-dim);
          font-size: 13px;
          font-weight: 800;
        }
        input[type="range"] {
          width: 100%;
          padding: 0;
          accent-color: var(--nl-aurora-b);
        }
        select {
          width: 100%;
          min-height: 40px;
          border: 1px solid var(--nl-border-strong);
          border-radius: var(--nl-radius-sm);
          background: var(--nl-bg-raised);
          color: var(--nl-text);
          font: inherit;
          padding: 0 10px;
        }
        select:focus,
        button:focus,
        input:focus {
          outline: 2px solid var(--nl-aurora-b);
          outline-offset: 2px;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        button {
          min-height: 40px;
          border: 1px solid var(--nl-border-strong);
          border-radius: 999px;
          background: var(--nl-surface);
          color: var(--nl-text);
          cursor: pointer;
          font: inherit;
          font-weight: 800;
          padding: 0 14px;
          transition: border-color 160ms ease, background 160ms ease;
        }
        button:hover:not(:disabled) {
          border-color: var(--nl-aurora-b);
          background: var(--nl-surface-strong);
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }
        .primaryAction {
          border-color: transparent;
          background: var(--nl-aurora-grad);
          color: var(--nl-on-aurora);
        }
        .primaryAction:hover:not(:disabled) {
          border-color: transparent;
          background: var(--nl-aurora-grad);
          box-shadow: 0 10px 30px rgba(94, 230, 164, 0.25);
        }
        .room {
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius);
          padding: 18px;
          display: grid;
          gap: 12px;
          background:
            radial-gradient(
              540px 320px at 20% 0%,
              rgba(255, 199, 120, calc(var(--light-opacity) * 0.12)),
              transparent 70%
            ),
            var(--nl-bg-raised);
          box-shadow: var(--nl-shadow);
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
        .flowCard span,
        .visualCard span,
        .noticeCard span {
          color: var(--nl-text-faint);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .roomTop strong {
          display: block;
          color: var(--nl-aurora-b);
        }
        .meters {
          display: grid;
          grid-template-columns: repeat(3, auto);
          gap: 8px;
        }
        .meters div {
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius-sm);
          background: var(--nl-surface);
          padding: 8px 12px;
        }
        .meters b {
          display: block;
          margin-top: 2px;
          color: var(--nl-text);
        }
        .roomCanvas {
          position: relative;
          min-height: 360px;
          overflow: hidden;
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius-sm);
          background:
            radial-gradient(
              420px 300px at 16% 20%,
              rgba(255, 196, 110, calc(var(--light-opacity) * 0.28)),
              transparent 65%
            ),
            linear-gradient(180deg, rgba(148, 184, 224, 0.06), rgba(2, 8, 20, 0.4)),
            var(--nl-bg-raised);
        }
        .windowGlow {
          position: absolute;
          top: 22px;
          left: 22px;
          width: 128px;
          height: 88px;
          border: 1px solid rgba(255, 214, 150, 0.35);
          border-radius: var(--nl-radius-sm);
          background: rgba(255, 205, 125, calc(var(--light-opacity) * 0.55));
          box-shadow: 0 0 48px rgba(255, 186, 100, calc(var(--light-opacity) * 0.6));
        }
        .soundField {
          position: absolute;
          right: 22px;
          top: 28px;
          width: 112px;
          height: 80px;
          opacity: var(--sound-opacity);
        }
        .soundField span {
          position: absolute;
          right: 0;
          border: 2px solid rgba(124, 227, 247, 0.55);
          border-left: 0;
          border-radius: 0 999px 999px 0;
        }
        .soundField span:nth-child(1) {
          width: 34px;
          height: 28px;
          top: 26px;
        }
        .soundField span:nth-child(2) {
          width: 62px;
          height: 52px;
          top: 14px;
        }
        .soundField span:nth-child(3) {
          width: 94px;
          height: 76px;
          top: 2px;
        }
        .personSpace {
          position: absolute;
          left: 64px;
          bottom: 34px;
          display: grid;
          gap: 8px;
          justify-items: center;
          color: var(--nl-text-dim);
          font-weight: 800;
          font-size: 12px;
        }
        .personMarker {
          width: 88px;
          height: 88px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(94, 230, 164, 0.4);
          border-radius: 999px;
          background: var(--nl-surface-strong);
          box-shadow: 0 0 0 26px rgba(94, 230, 164, 0.06);
          animation: breathe 5s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,
          100% {
            box-shadow: 0 0 0 22px rgba(94, 230, 164, 0.05);
          }
          50% {
            box-shadow: 0 0 0 30px rgba(94, 230, 164, 0.09);
          }
        }
        .personMarker span {
          width: 36px;
          height: 50px;
          border-radius: 999px 999px 12px 12px;
          background: var(--nl-aurora-grad);
        }
        .caregiverUnit {
          position: absolute;
          display: grid;
          gap: 6px;
          justify-items: center;
          color: var(--nl-text-dim);
          font-weight: 800;
          font-size: 12px;
          transition: left 300ms ease, top 300ms ease, opacity 300ms ease;
        }
        .caregiverUnit.hands_on {
          left: 158px;
          bottom: 44px;
        }
        .caregiverUnit.nearby {
          left: 44px;
          top: 138px;
        }
        .caregiverUnit.remote {
          right: 24px;
          top: 128px;
          opacity: 0.75;
        }
        .caregiverMarker {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border: 1px solid var(--nl-border-strong);
          border-radius: 999px;
          background: var(--nl-surface-strong);
        }
        .caregiverUnit.remote .caregiverMarker {
          border-style: dashed;
        }
        .caregiverMarker span {
          width: 24px;
          height: 34px;
          border-radius: 999px 999px 10px 10px;
          background: var(--nl-text-dim);
        }
        .robotUnit {
          position: absolute;
          left: calc(200px + var(--robot-travel));
          bottom: 34px;
          display: grid;
          gap: 7px;
          justify-items: center;
          color: var(--nl-text-dim);
          font-size: 12px;
          font-weight: 800;
          transition: left 400ms ease;
        }
        .robotHead {
          width: 72px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 2px solid var(--nl-border-strong);
          border-radius: var(--nl-radius-sm);
          background: var(--nl-bg-raised);
        }
        .robotHead span {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: var(--nl-aurora-b);
          box-shadow: 0 0 10px rgba(124, 227, 247, 0.7);
          animation: blink 6s ease-in-out infinite;
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
        .robotUnit.acting .robotHead {
          border-color: rgba(124, 227, 247, 0.7);
          box-shadow: 0 0 0 4px rgba(124, 227, 247, 0.14);
        }
        .robotUnit.acting {
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
        @media (prefers-reduced-motion: reduce) {
          .personMarker,
          .robotHead span,
          .robotUnit.acting,
          .protocolLayer.generated {
            animation: none;
          }
        }
        .robotBody {
          width: 54px;
          height: 44px;
          border: 2px solid var(--nl-border-strong);
          border-radius: var(--nl-radius-sm);
          background: rgba(94, 230, 164, 0.12);
        }
        .visualCard,
        .noticeCard {
          position: absolute;
          max-width: 230px;
          border: 1px solid var(--nl-border-strong);
          border-radius: var(--nl-radius-sm);
          background: rgba(11, 20, 36, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 12px;
          box-shadow: var(--nl-shadow);
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
          color: var(--nl-text);
        }
        .nowBar {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius-sm);
          background: var(--nl-surface);
          padding: 10px 14px;
        }
        .nowBar span {
          color: var(--nl-aurora-a);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .nowBar strong {
          display: block;
          color: var(--nl-text);
        }
        .nowBar p {
          color: var(--nl-text-dim);
          font-size: 13px;
          line-height: 1.4;
        }
        .stepCount {
          color: var(--nl-aurora-b);
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }
        .progressWrap {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: var(--nl-surface-strong);
          border: 1px solid var(--nl-border);
        }
        .progressWrap div {
          height: 100%;
          border-radius: inherit;
          background: var(--nl-aurora-grad);
          box-shadow: 0 0 14px rgba(94, 230, 164, 0.4);
          transition: width 300ms ease;
        }
        .liveFlow {
          display: grid;
          gap: 10px;
          align-content: start;
        }
        .flowCard {
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius-sm);
          background: var(--nl-surface);
          padding: 12px;
        }
        .flowCard p {
          margin-top: 5px;
          color: var(--nl-text-dim);
          font-size: 13px;
          line-height: 1.5;
          font-weight: 600;
        }
        .flowCard .soft {
          color: var(--nl-text-faint);
          font-weight: 600;
        }
        .flowCard .warn {
          color: #ffd89a;
          font-weight: 700;
        }
        .whyRow {
          max-width: 1360px;
          margin: 0 auto 16px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 10px;
        }
        .whyRow div {
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius);
          background: var(--nl-surface);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 14px;
        }
        .whyRow strong {
          display: block;
          margin-bottom: 5px;
          color: var(--nl-text);
        }
        .whyRow p {
          color: var(--nl-text-dim);
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
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius-sm);
          padding: 10px;
          background: var(--nl-surface);
        }
        .timelineItem strong {
          color: var(--nl-text);
        }
        .timelineItem.robot {
          border-left: 3px solid var(--nl-aurora-b);
        }
        .timelineItem.protocol {
          border-left: 3px solid rgba(247, 201, 110, 0.75);
        }
        .timelineItem time,
        .timelineItem span {
          color: var(--nl-text-faint);
          font-size: 12px;
          font-weight: 800;
        }
        .timelineItem p {
          margin-top: 3px;
          color: var(--nl-text-dim);
          font-size: 13px;
          line-height: 1.35;
        }
        .protocolLayer.generated {
          animation: settle 1.6s ease;
        }
        @keyframes settle {
          0% {
            border-color: var(--nl-aurora-b);
            box-shadow: 0 0 0 4px rgba(124, 227, 247, 0.22);
          }
          100% {
            border-color: var(--nl-border);
            box-shadow: 0 0 0 0 rgba(124, 227, 247, 0);
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
          border: 1px solid rgba(94, 230, 164, 0.5);
          background: rgba(94, 230, 164, 0.12);
          color: #8ef0bf;
        }
        .readyChip.warn {
          border: 1px solid rgba(247, 201, 110, 0.5);
          background: rgba(247, 201, 110, 0.12);
          color: #ffd89a;
        }
        .planMeta {
          color: var(--nl-text-faint);
          font-size: 12px;
          font-weight: 700;
        }
        .planParagraph {
          color: var(--nl-text-dim);
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .questionList {
          margin: 6px 0 0;
          padding-left: 18px;
          display: grid;
          gap: 6px;
          color: var(--nl-text-dim);
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
          color: var(--nl-text-faint);
          font-size: 13px;
          font-weight: 600;
        }
        .emptyState {
          color: var(--nl-text-dim);
          font-size: 14px;
          line-height: 1.55;
        }
        pre {
          max-height: 420px;
          margin: 10px 0 0;
          overflow: auto;
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius-sm);
          background: rgba(2, 8, 20, 0.72);
          color: #d5e8f5;
          font-family: var(--nl-font-mono);
          font-size: 12px;
          line-height: 1.55;
          padding: 14px;
          white-space: pre-wrap;
        }
        @media (max-width: 1100px) {
          .stage {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 980px) {
          .pageHead,
          .lower {
            grid-template-columns: 1fr;
          }
          .status {
            justify-self: start;
          }
        }
        @media (max-width: 640px) {
          .page {
            padding: 18px 14px 4px;
          }
          h1 {
            font-size: 26px;
          }
          h2 {
            font-size: 20px;
          }
          .roomCanvas {
            min-height: 320px;
          }
          .robotUnit {
            left: min(calc(140px + var(--robot-travel)), calc(100% - 110px));
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
