import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AdapterTarget,
  AttentionFlagSeverity,
  Command,
  Environment,
  PlannerResult,
  SafetyException,
  ScenarioId,
  ScenarioPreset,
  VisionSnapshot,
} from "@/lib/careProtocol/types";
import {
  adapterLabels,
  adapterTransports,
  buildCarePlan,
  commandLabels,
  exceptionLabels,
} from "@/lib/careProtocol/planner";

type SimStatus = "idle" | "running" | "paused" | "completed" | "escalated";

type AuditEntry = {
  id: number;
  time: string;
  actor: "caregiver" | "neuroljus" | "protocol" | "system";
  command: string;
  reason: string;
};

const commandNotes: Record<Command, string> = {
  lower_light: "Ambient adjustment",
  reduce_sound: "Sensory load reduction",
  step_back: "Increase personal space",
  pause_interaction: "Hold interaction",
  offer_visual_card: "Routine support",
  notify_caregiver: "Escalation channel",
  log_observation: "Local audit record",
};

const eventToException: Record<string, SafetyException> = {
  "person rejects": "rejection_signal",
  "noise increases": "unknown_event",
  "caregiver pauses": "caregiver_pause",
  "unusual movement": "unusual_movement",
  "timeout reached": "timeout",
};

const defaultCommands: Command[] = [
  "lower_light",
  "reduce_sound",
  "step_back",
  "pause_interaction",
  "offer_visual_card",
  "notify_caregiver",
  "log_observation",
];

const scenarioOrder: ScenarioId[] = [
  "evening_transition",
  "sensory_overload",
  "leaving_home",
  "meal_support",
  "school_arrival",
];

const scenarioPresets: Record<ScenarioId, ScenarioPreset> = {
  evening_transition: {
    id: "evening_transition",
    name: "Evening transition",
    careGoal: "Move from activity to rest with a predictable, low-stimulus routine.",
    visualCard: "Now: quiet room. Next: sleep routine.",
    duration: 20,
    environment: { light: 35, sound: 25, distance: 1.5, pace: "slow" },
    commands: defaultCommands,
    exceptions: ["rejection_signal", "caregiver_pause", "timeout", "unknown_event"],
  },
  sensory_overload: {
    id: "sensory_overload",
    name: "Sensory overload support",
    careGoal: "Reduce sensory load and increase personal space before adding new demands.",
    visualCard: "Pause. Less light. Less sound. More space.",
    duration: 12,
    environment: { light: 22, sound: 12, distance: 2.4, pace: "slow" },
    commands: ["reduce_sound", "lower_light", "step_back", "pause_interaction", "notify_caregiver", "log_observation"],
    exceptions: ["rejection_signal", "unusual_movement", "caregiver_pause", "unknown_event"],
  },
  leaving_home: {
    id: "leaving_home",
    name: "Leaving home",
    careGoal: "Make a transition visible, paced, and repeatable before going outside.",
    visualCard: "Shoes. Jacket. Door. Outside.",
    duration: 18,
    environment: { light: 48, sound: 30, distance: 1.8, pace: "steady" },
    commands: ["offer_visual_card", "pause_interaction", "step_back", "notify_caregiver", "log_observation"],
    exceptions: ["rejection_signal", "caregiver_pause", "timeout"],
  },
  meal_support: {
    id: "meal_support",
    name: "Meal support",
    careGoal: "Support a meal routine with predictable steps and low interaction pressure.",
    visualCard: "Table. Food. Drink. Finished.",
    duration: 30,
    environment: { light: 45, sound: 20, distance: 1.6, pace: "adaptive" },
    commands: ["offer_visual_card", "pause_interaction", "reduce_sound", "notify_caregiver", "log_observation"],
    exceptions: ["rejection_signal", "unusual_movement", "caregiver_pause", "timeout"],
  },
  school_arrival: {
    id: "school_arrival",
    name: "School arrival",
    careGoal: "Support handoff from family to school with context, pacing, and audit record.",
    visualCard: "Arrive. Quiet corner. Teacher. First task.",
    duration: 15,
    environment: { light: 55, sound: 35, distance: 1.9, pace: "steady" },
    commands: ["offer_visual_card", "step_back", "pause_interaction", "notify_caregiver", "log_observation"],
    exceptions: ["rejection_signal", "caregiver_pause", "timeout", "unknown_event"],
  },
};

const commandEffects: Record<Command, string> = {
  lower_light: "Room light moves toward the caregiver target.",
  reduce_sound: "Sound load moves toward the caregiver target.",
  step_back: "Robot increases personal space.",
  pause_interaction: "Interaction pressure pauses.",
  offer_visual_card: "Visual support card becomes available.",
  notify_caregiver: "Caregiver receives a protocol notice.",
  log_observation: "The event is preserved in the local audit trail.",
};

const pad = (value: number) => String(value).padStart(2, "0");

function nowStamp() {
  const date = new Date();
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function commandReason(command: Command) {
  if (command === "lower_light") return "preauthorized routine step: light target";
  if (command === "reduce_sound") return "preauthorized routine step: sound target";
  if (command === "step_back") return "preauthorized routine step: distance target";
  if (command === "pause_interaction") return "preauthorized routine step: quiet interval";
  if (command === "offer_visual_card") return "preauthorized routine step: routine support";
  if (command === "notify_caregiver") return "preauthorized completion notice";
  return "preauthorized local record";
}

export default function RobotInterfaceLab() {
  const initialScenario = scenarioPresets.evening_transition;
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>(initialScenario.id);
  const [routineName, setRoutineName] = useState(initialScenario.name);
  const [careGoal, setCareGoal] = useState(initialScenario.careGoal);
  const [visualCard, setVisualCard] = useState(initialScenario.visualCard);
  const [duration, setDuration] = useState(initialScenario.duration);
  const [environment, setEnvironment] = useState<Environment>(initialScenario.environment);
  const [commands, setCommands] = useState<Command[]>(initialScenario.commands);
  const [exceptions, setExceptions] = useState<SafetyException[]>(initialScenario.exceptions);
  const [adapterTarget, setAdapterTarget] = useState<AdapterTarget>("ros2");
  const [visionSnapshot, setVisionSnapshot] = useState<VisionSnapshot | null>(null);
  const [status, setStatus] = useState<SimStatus>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [plan, setPlan] = useState<PlannerResult | null>(null);
  const [planGeneratedAt, setPlanGeneratedAt] = useState<string | null>(null);
  const [packetCopied, setPacketCopied] = useState(false);
  const [log, setLog] = useState<AuditEntry[]>([
    {
      id: 1,
      time: "ready",
      actor: "system",
      command: "lab_ready",
      reason: "protocol workspace initialized for future adapter work",
    },
  ]);

  const nextId = useRef(2);
  const activeCommands = commands;

  const protocol = useMemo(
    () => ({
      name: routineName || "Untitled routine",
      scenario: selectedScenario,
      care_goal: careGoal,
      visual_card: visualCard,
      autonomy_level: 2,
      mode: "protocol_first",
      duration_minutes: duration,
      environment,
      vision_context: visionSnapshot
        ? {
            source: "nlvision_holistic_v1",
            latest_local_snapshot: visionSnapshot,
          }
        : {
            source: "manual_context",
            latest_local_snapshot: null,
          },
      allowed_commands: commands,
      safety_exceptions: exceptions,
      audit_policy: {
        local_only: true,
        records: ["timestamp", "actor", "command", "reason"],
        sensitive_personal_data: false,
      },
      open_integration: {
        contract: "care_command_protocol_v0",
        adapter_target: adapterTarget,
        adapter_label: adapterLabels[adapterTarget],
        transport_note: adapterTransports[adapterTarget],
        adapter_must_preserve: [
          "caregiver-authored routine settings",
          "allowed command list",
          "safety exception list",
          "local audit trail",
        ],
      },
      integration_adapter: {
        stage: "contract_design",
        readiness: "ready_for_local_adapter_work",
      },
    }),
    [
      adapterTarget,
      careGoal,
      commands,
      duration,
      environment,
      exceptions,
      routineName,
      selectedScenario,
      visionSnapshot,
      visualCard,
    ]
  );

  function addLog(actor: AuditEntry["actor"], command: string, reason: string) {
    setLog((current) =>
      [
        {
          id: nextId.current++,
          time: nowStamp(),
          actor,
          command,
          reason,
        },
        ...current,
      ].slice(0, 200)
    );
  }

  function toggleCommand(command: Command) {
    setCommands((current) =>
      current.includes(command)
        ? current.filter((item) => item !== command)
        : [...current, command]
    );
  }

  function toggleException(exception: SafetyException) {
    setExceptions((current) =>
      current.includes(exception)
        ? current.filter((item) => item !== exception)
        : [...current, exception]
    );
  }

  function applyScenario(id: ScenarioId) {
    const preset = scenarioPresets[id];
    setSelectedScenario(id);
    setRoutineName(preset.name);
    setCareGoal(preset.careGoal);
    setVisualCard(preset.visualCard);
    setDuration(preset.duration);
    setEnvironment(preset.environment);
    setCommands(preset.commands);
    setExceptions(preset.exceptions);
    setStatus("idle");
    setStepIndex(0);
    addLog("caregiver", "load_scenario", `${preset.name} scenario loaded`);
  }

  function importVisionSignals() {
    try {
      const raw = window.localStorage.getItem("nlvision_holistic_v1") || "[]";
      const arr = JSON.parse(raw) as Array<Record<string, unknown>>;
      const latest = arr[arr.length - 1];

      if (!latest) {
        addLog("system", "vision_context_empty", "no NL-VISION local samples available yet");
        return;
      }

      const snapshot: VisionSnapshot = {
        faceDetected: latest.hasFace === true,
        handsAvg: typeof latest.handsAvg === "number" ? latest.handsAvg : 0,
        handNearPct: typeof latest.handNearPct === "number" ? latest.handNearPct : 0,
        movement:
          (typeof latest.faceMoveAvg === "number" ? latest.faceMoveAvg : 0) +
          (typeof latest.handsMoveAvg === "number" ? latest.handsMoveAvg : 0),
        blinksPerMin: typeof latest.blinksPerMin === "number" ? latest.blinksPerMin : 0,
      };

      setVisionSnapshot(snapshot);
      addLog("caregiver", "import_nlvision_signal", "latest local NL-VISION snapshot attached");
    } catch {
      addLog("system", "vision_context_failed", "could not read local NL-VISION samples");
    }
  }

  function startRoutine() {
    if (activeCommands.length === 0) {
      addLog("system", "routine_blocked", "at least one allowed command is required");
      return;
    }

    setStepIndex(0);
    setStatus("running");
    addLog("caregiver", "start_routine", `${routineName || "Untitled routine"} started`);
  }

  function pauseRoutine() {
    setStatus("paused");
    addLog("caregiver", "pause_routine", "caregiver paused the routine manually");
  }

  function resetRoutine() {
    setStatus("idle");
    setStepIndex(0);
    addLog("caregiver", "reset_protocol_run", "routine returned to idle state");
  }

  function completeRoutine(reason = "routine completed inside protocol") {
    setStatus("completed");
    setStepIndex(activeCommands.length);
    addLog("protocol", "routine_complete", reason);
  }

  function injectEvent(
    label:
      | "person rejects"
      | "noise increases"
      | "caregiver pauses"
      | "unusual movement"
      | "timeout reached"
      | "routine completes"
  ) {
    if (label === "routine completes") {
      completeRoutine("manual completion event added to protocol run");
      return;
    }

    const exception = eventToException[label];
    const command = exception ? exception : "event";

    addLog("protocol", command, `${label} event added`);

    if (exception && exceptions.includes(exception)) {
      setStatus(exception === "caregiver_pause" ? "paused" : "escalated");
      addLog(
        "neuroljus",
        exception === "caregiver_pause" ? "pause_routine" : "safety_exception",
        `${exceptionLabels[exception]} matched configured safety exception`
      );
    } else {
      addLog("neuroljus", "continue_routine", "event logged outside configured safety exceptions");
    }
  }

  async function copyProtocol() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(protocol, null, 2));
      setCopied(true);
      addLog("caregiver", "copy_protocol", "open protocol copied for adaptation");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      addLog("system", "copy_failed", "browser clipboard was unavailable");
    }
  }

  function downloadJson(payload: unknown, filenameBase: string) {
    const slug = (routineName || "untitled-routine")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filenameBase}-${slug || "routine"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadProtocol() {
    downloadJson(protocol, "neuroljus-protocol");
    addLog("caregiver", "download_protocol", "open protocol downloaded as JSON file");
  }

  function generatePlan() {
    const result = buildCarePlan({
      scenario: selectedScenario,
      routineName,
      careGoal,
      visualCard,
      durationMinutes: duration,
      environment,
      allowedCommands: commands,
      safetyExceptions: exceptions,
      visionContext: visionSnapshot,
    });
    setPlan(result);
    setPlanGeneratedAt(nowStamp());
    addLog(
      "neuroljus",
      "generate_protocol",
      result.validation.valid
        ? "protocol plan generated locally from caregiver settings"
        : `protocol plan generated with ${result.validation.issues.length} validation issue(s)`
    );
  }

  function exportPlan() {
    if (!plan) return;
    downloadJson(plan.protocol, "neuroljus-care-protocol-v0");
    addLog("caregiver", "export_protocol", "care_command_protocol_v0 exported for adapter work");
  }

  async function copyAdapterPacket() {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(plan.adapterPackets[adapterTarget], null, 2)
      );
      setPacketCopied(true);
      addLog("caregiver", "copy_adapter_packet", `${adapterLabels[adapterTarget]} packet copied`);
      window.setTimeout(() => setPacketCopied(false), 1500);
    } catch {
      addLog("system", "copy_failed", "browser clipboard was unavailable");
    }
  }

  function replayPlan() {
    if (!plan || plan.steps.length === 0) return;
    setCommands(plan.steps.map((step) => step.command));
    setStepIndex(0);
    setStatus("running");
    addLog("caregiver", "replay_plan", "generated protocol sequence replayed in the simulator");
  }

  useEffect(() => {
    if (status !== "running") return;

    if (stepIndex >= activeCommands.length) {
      completeRoutine();
      return;
    }

    const timer = window.setTimeout(() => {
      const command = activeCommands[stepIndex];
      addLog("neuroljus", command, commandReason(command));
      setStepIndex((current) => current + 1);
    }, 900);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCommands, status, stepIndex]);

  const completedCommands = useMemo(
    () => new Set(activeCommands.slice(0, stepIndex)),
    [activeCommands, stepIndex]
  );
  const currentCommand =
    status === "running" && stepIndex < activeCommands.length ? activeCommands[stepIndex] : undefined;
  const sceneLight = completedCommands.has("lower_light") ? environment.light : Math.min(82, environment.light + 36);
  const sceneSound = completedCommands.has("reduce_sound") ? environment.sound : Math.min(78, environment.sound + 38);
  const robotDistance = completedCommands.has("step_back") ? environment.distance : Math.max(0.7, environment.distance - 0.7);
  const robotTravel = Math.min(188, Math.round(robotDistance * 48));
  const cardVisible = completedCommands.has("offer_visual_card") || currentCommand === "offer_visual_card";
  const caregiverNotified =
    completedCommands.has("notify_caregiver") || status === "escalated" || status === "completed";
  const roomStyle = {
    "--light-level": `${sceneLight}%`,
    "--sound-level": `${sceneSound}%`,
    "--light-opacity": `${0.2 + sceneLight / 150}`,
    "--sound-opacity": `${Math.max(0.12, sceneSound / 100)}`,
    "--robot-travel": `${robotTravel}px`,
  } as React.CSSProperties;
  const activeEffect = currentCommand
    ? commandEffects[currentCommand]
    : status === "completed"
      ? "Routine complete. The audit trail and protocol export are ready."
      : status === "escalated"
        ? "Safety exception active. The protocol is waiting for caregiver direction."
        : status === "paused"
          ? "Routine paused by configured rule."
          : "Choose a scenario or start the current routine.";
  const adapterEnvelope = useMemo(
    () => ({
      envelope: "neuroljus.care_command.v0",
      target: adapterTarget,
      route:
        adapterTarget === "ros2"
          ? "/neuroljus/care_command"
          : adapterTarget === "mqtt"
            ? "neuroljus/care/command"
            : adapterTarget === "http"
              ? "POST http://localhost:8787/care-command"
              : "offline-json-playbook",
      command: currentCommand || "idle",
      scenario: selectedScenario,
      routine: routineName || "Untitled routine",
      care_goal: careGoal,
      environment_targets: environment,
      safety_exceptions: exceptions,
      audit_required: true,
    }),
    [adapterTarget, careGoal, currentCommand, environment, exceptions, routineName, selectedScenario]
  );

  const progress =
    activeCommands.length === 0 ? 0 : Math.min(100, Math.round((stepIndex / activeCommands.length) * 100));

  const statusLabel: Record<SimStatus, string> = {
    idle: "Idle",
    running: "Running",
    paused: "Paused",
    completed: "Completed",
    escalated: "Safety exception",
  };

  const severityLabels: Record<AttentionFlagSeverity, string> = {
    warning: "Review",
    advice: "Consider",
    info: "Note",
  };

  return (
    <>
      <Head>
        <title>Robot Care Interface Lab - Neuroljus</title>
        <meta
          name="description"
          content="Protocol-first workspace for Neuroljus care command protocols, preauthorized routines, safety exceptions, audit trails, and future adapter work."
        />
      </Head>

      <main className="page">
        <header className="topbar">
          <Link href="/" className="brand">
            Neuroljus
          </Link>
          <div>
            <p className="kicker">Local prototype · open protocol · adapter-ready</p>
            <h1>Robot Care Interface</h1>
          </div>
          <div className={`status ${status}`} role="status" aria-live="polite">
            {statusLabel[status]}
          </div>
        </header>

        <section className="summary" aria-label="Protocol summary">
          <div>
            <span>Core</span>
            <strong>Preauthorized autonomy</strong>
            <p>Configured routines execute from caregiver-authored settings.</p>
          </div>
          <div>
            <span>Exception</span>
            <strong>Pause or escalate</strong>
            <p>Only configured safety exceptions interrupt the routine.</p>
          </div>
          <div>
            <span>Record</span>
            <strong>Audit trail</strong>
            <p>Every command and event is logged locally with a reason.</p>
          </div>
          <div>
            <span>Open</span>
            <strong>Portable protocol</strong>
            <p>Generated JSON can later map to ROS2, MQTT, HTTP, or offline care tools.</p>
          </div>
          <div>
            <span>Adapter</span>
            <strong>Integration-ready contract</strong>
            <p>Future devices attach by preserving commands, exceptions, and audit records.</p>
          </div>
        </section>

        <section className="experience" aria-label="Robot care protocol live demo">
          <div className="experienceIntro">
            <p className="kicker">Live care protocol</p>
            <h2>Observe, structure, run, record</h2>
            <p>
              This demo shows how a caregiver-authored routine can move from context
              to action: environment targets, personal space, visual support, pause
              rules, caregiver notice, and local audit.
            </p>
          </div>

          <div className="careRoom" style={roomStyle}>
            <div className="roomHeader">
              <span>Care room</span>
              <strong>{statusLabel[status]}</strong>
            </div>
            <div className="environmentMeters">
              <div>
                <span>Light</span>
                <b>{sceneLight}%</b>
              </div>
              <div>
                <span>Sound</span>
                <b>{sceneSound}%</b>
              </div>
              <div>
                <span>Distance</span>
                <b>{robotDistance.toFixed(1)}m</b>
              </div>
            </div>

            <div className="roomCanvas" aria-label="Care room visual simulation">
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
              <div className="robotUnit">
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
                  <strong>{visualCard}</strong>
                </div>
              )}
              {caregiverNotified && (
                <div className="noticeCard">
                  <span>Caregiver notice</span>
                  <strong>{status === "completed" ? "Routine complete" : "Review requested"}</strong>
                </div>
              )}
            </div>

            <div className="activeEffect" aria-live="polite">
              <span>Now</span>
              <strong>{currentCommand ? commandLabels[currentCommand] : statusLabel[status]}</strong>
              <p>{activeEffect}</p>
            </div>
          </div>

          <aside className="signalPanel" aria-label="NL-VISION signal bridge">
            <p className="kicker">Signal bridge</p>
            <h2>NL-VISION context</h2>
            <p>
              Attach the latest local NL-VISION sample to the protocol context. It
              remains local and becomes structured context for the routine.
            </p>
            <button onClick={importVisionSignals}>Import local signal</button>
            {visionSnapshot ? (
              <div className="visionGrid">
                <div>
                  <span>Face signal</span>
                  <strong>{visionSnapshot.faceDetected ? "Available" : "Unavailable"}</strong>
                </div>
                <div>
                  <span>Hands avg</span>
                  <strong>{visionSnapshot.handsAvg.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Near face</span>
                  <strong>{Math.round(visionSnapshot.handNearPct * 100)}%</strong>
                </div>
                <div>
                  <span>Movement</span>
                  <strong>{visionSnapshot.movement.toFixed(4)}</strong>
                </div>
              </div>
            ) : (
              <p className="empty">No imported local signal yet.</p>
            )}
          </aside>

          <aside className="adapterPanel" aria-label="Adapter packet">
            <p className="kicker">Open adapter packet</p>
            <h2>{adapterLabels[adapterTarget]}</h2>
            <p>{adapterTransports[adapterTarget]}.</p>
            <pre>{JSON.stringify(adapterEnvelope, null, 2)}</pre>
          </aside>
        </section>

        <div className="layout">
          <section className="panel builder" aria-labelledby="builder-title">
            <div className="panelHeader">
              <p className="kicker">01 · Routine builder</p>
              <h2 id="builder-title">Care command protocol</h2>
            </div>

            <div className="presetSection">
              <h3>Care scenarios</h3>
              <div className="presetGrid">
                {scenarioOrder.map((id) => (
                  <button
                    key={id}
                    onClick={() => applyScenario(id)}
                    className={selectedScenario === id ? "preset activePreset" : "preset"}
                    aria-pressed={selectedScenario === id}
                  >
                    {scenarioPresets[id].name}
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              Routine name
              <input
                value={routineName}
                onChange={(event) => setRoutineName(event.target.value)}
                maxLength={80}
              />
            </label>

            <label className="field">
              Care goal
              <textarea
                value={careGoal}
                onChange={(event) => setCareGoal(event.target.value)}
                maxLength={220}
              />
            </label>

            <label className="field">
              Visual support card
              <input
                value={visualCard}
                onChange={(event) => setVisualCard(event.target.value)}
                maxLength={120}
              />
            </label>

            <div className="fieldGrid">
              <label className="field">
                Duration
                <div className="inlineInput">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={duration}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setDuration(Number.isFinite(value) ? Math.min(120, Math.max(1, Math.round(value))) : 1);
                    }}
                  />
                  <span>minutes</span>
                </div>
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
            </div>

            <label className="field adapterField">
              Future adapter
              <select
                value={adapterTarget}
                onChange={(event) => setAdapterTarget(event.target.value as AdapterTarget)}
              >
                {(Object.keys(adapterLabels) as AdapterTarget[]).map((target) => (
                  <option key={target} value={target}>
                    {adapterLabels[target]}
                  </option>
                ))}
              </select>
              <span className="note">{adapterTransports[adapterTarget]}</span>
            </label>

            <div className="sliders">
              <label>
                <span>
                  Light target <b>{environment.light}%</b>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={environment.light}
                  onChange={(event) =>
                    setEnvironment((current) => ({
                      ...current,
                      light: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label>
                <span>
                  Sound target <b>{environment.sound}%</b>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={environment.sound}
                  onChange={(event) =>
                    setEnvironment((current) => ({
                      ...current,
                      sound: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label>
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
                    setEnvironment((current) => ({
                      ...current,
                      distance: Number(event.target.value),
                    }))
                  }
                />
              </label>
            </div>

            <div className="optionSection">
              <h3>Allowed actions</h3>
              <div className="checks">
                {(Object.keys(commandLabels) as Command[]).map((command) => (
                  <label key={command} className="check">
                    <input
                      type="checkbox"
                      checked={commands.includes(command)}
                      onChange={() => toggleCommand(command)}
                    />
                    <span>
                      <b>{commandLabels[command]}</b>
                      <small>{commandNotes[command]}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="optionSection">
              <h3>Safety exceptions</h3>
              <div className="checks compact">
                {(Object.keys(exceptionLabels) as SafetyException[]).map((exception) => (
                  <label key={exception} className="check">
                    <input
                      type="checkbox"
                      checked={exceptions.includes(exception)}
                      onChange={() => toggleException(exception)}
                    />
                    <span>{exceptionLabels[exception]}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="panel simulator" aria-labelledby="sim-title">
            <div className="panelHeader">
              <p className="kicker">02 · Protocol panel</p>
              <h2 id="sim-title">Preauthorized routine</h2>
            </div>

            <div className="scenario">
              <div>
                <span>Scenario</span>
                <strong>{routineName || "Untitled routine"}</strong>
                <p>
                  {careGoal}
                </p>
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
              <p className="stepText">
                Step {Math.min(stepIndex + (status === "running" ? 1 : 0), activeCommands.length)} of{" "}
                {activeCommands.length || 0}
              </p>
            </div>

            <div className="simButtons">
              <button onClick={startRoutine} disabled={status === "running"}>
                Start routine
              </button>
              <button onClick={pauseRoutine} disabled={status !== "running"}>
                Pause
              </button>
              <button onClick={() => setStatus("running")} disabled={status !== "paused"}>
                Resume
              </button>
              <button onClick={resetRoutine}>Reset</button>
            </div>

            <div className="injectors" aria-label="Inject protocol events">
              <button onClick={() => injectEvent("person rejects")}>Person rejects</button>
              <button onClick={() => injectEvent("noise increases")}>Noise increases</button>
              <button onClick={() => injectEvent("caregiver pauses")}>Caregiver pauses</button>
              <button onClick={() => injectEvent("unusual movement")}>Unusual movement</button>
              <button onClick={() => injectEvent("timeout reached")}>Timeout</button>
              <button onClick={() => injectEvent("routine completes")}>Routine completes</button>
            </div>

            <div className="commandStack">
              {activeCommands.length === 0 ? (
                <p className="empty">Select at least one allowed command.</p>
              ) : (
                activeCommands.map((command, index) => (
                  <div
                    key={`${command}-${index}`}
                    className={index < stepIndex ? "command done" : index === stepIndex ? "command active" : "command"}
                  >
                    <span>{index + 1}</span>
                    <div>
                      <strong>{commandLabels[command]}</strong>
                      <small>{commandReason(command)}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel intelligence" aria-labelledby="intelligence-title">
            <div className="panelHeader">
              <p className="kicker">03 · Protocol intelligence</p>
              <h2 id="intelligence-title">Generate, validate, explain, export</h2>
            </div>
            <p className="intelligenceIntro">
              The local planner turns the current routine settings into an
              ordered, timed care protocol with adapter packets for future
              devices. It runs entirely on this device: no external API, and
              the same settings always produce the same plan.
            </p>
            <div className="intelligenceActions">
              <button className="primaryAction" onClick={generatePlan}>
                Generate protocol
              </button>
              <button onClick={exportPlan} disabled={!plan}>
                Export protocol
              </button>
              <button onClick={copyAdapterPacket} disabled={!plan}>
                {packetCopied ? "Copied" : "Copy adapter packet"}
              </button>
              <button onClick={replayPlan} disabled={!plan || plan.steps.length === 0}>
                Replay in simulator
              </button>
            </div>

            {plan ? (
              <div className="intelligenceBody">
                <div className="intelligenceColumn">
                  <h3>Plan explanation</h3>
                  {planGeneratedAt && (
                    <p className="planMeta">
                      Generated at {planGeneratedAt} from the routine settings at that moment.
                    </p>
                  )}
                  {plan.explanation.map((paragraph, index) => (
                    <p key={index} className="planParagraph">
                      {paragraph}
                    </p>
                  ))}

                  <h3>Planned sequence</h3>
                  <div className="planSteps">
                    {plan.steps.length === 0 ? (
                      <p className="empty">No allowed commands, so the plan has no steps.</p>
                    ) : (
                      plan.steps.map((step, index) => (
                        <div key={`${step.command}-${index}`} className="planStep">
                          <span>
                            {step.offsetMinutes} min
                          </span>
                          <div>
                            <strong>{commandLabels[step.command]}</strong>
                            <small>
                              {step.reason} · about {step.durationMinutes} min
                            </small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="intelligenceColumn">
                  <h3>Validation</h3>
                  <p className={plan.validation.valid ? "validationOk" : "validationIssues"}>
                    {plan.validation.valid
                      ? "The configuration is complete enough for adapter work."
                      : "The configuration needs attention before adapter work:"}
                  </p>
                  {plan.validation.issues.length > 0 && (
                    <ul className="issueList">
                      {plan.validation.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  )}

                  <h3>Attention flags</h3>
                  {plan.attentionFlags.length === 0 ? (
                    <p className="empty">No attention flags for this configuration.</p>
                  ) : (
                    <ul className="flagList">
                      {plan.attentionFlags.map((flag) => (
                        <li key={flag.message} className={`flag ${flag.severity}`}>
                          <span>{severityLabels[flag.severity]}</span>
                          <p>{flag.message}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <h3>Reflection for the caregiver</h3>
                  <ul className="questionList">
                    {plan.reflectionQuestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>

                <div className="intelligenceColumn">
                  <div className="packetHead">
                    <h3>Adapter packet</h3>
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
                  <pre>{JSON.stringify(plan.adapterPackets[adapterTarget], null, 2)}</pre>
                </div>
              </div>
            ) : (
              <p className="empty">
                No protocol generated yet. Configure the routine above, then generate a plan.
              </p>
            )}
          </section>

          <section className="panel audit" aria-labelledby="audit-title">
            <div className="panelHeader">
              <p className="kicker">04 · Audit trail</p>
              <h2 id="audit-title">Local event log</h2>
            </div>
            <div className="logList">
              {log.map((entry) => (
                <article key={entry.id} className="logItem">
                  <time>{entry.time}</time>
                  <div>
                    <strong>{entry.command}</strong>
                    <p>{entry.reason}</p>
                  </div>
                  <span>{entry.actor}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel protocol" aria-labelledby="protocol-title">
            <div className="panelHeader">
              <p className="kicker">05 · Protocol export</p>
              <h2 id="protocol-title">Generated JSON</h2>
            </div>
            <div className="exportButtons">
              <button className="copyButton" onClick={copyProtocol}>
                {copied ? "Copied" : "Copy JSON"}
              </button>
              <button className="copyButton" onClick={downloadProtocol}>
                Download JSON
              </button>
            </div>
            <pre>{JSON.stringify(protocol, null, 2)}</pre>
          </section>
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100dvh;
          padding: 22px;
          color: #17202f;
          background: #f4f7f6;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }
        .topbar {
          max-width: 1360px;
          margin: 0 auto 16px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 18px;
          align-items: center;
        }
        .brand {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          color: #245b62;
          font-weight: 800;
          text-decoration: none;
        }
        h1,
        h2,
        h3,
        p {
          margin: 0;
          overflow-wrap: anywhere;
        }
        h1 {
          font-size: 30px;
          line-height: 1.05;
          letter-spacing: 0;
        }
        h2 {
          font-size: 20px;
          line-height: 1.18;
        }
        h3 {
          font-size: 14px;
        }
        .kicker {
          margin-bottom: 4px;
          color: #637085;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        .status {
          min-width: 152px;
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #cbd8d5;
          border-radius: 8px;
          background: #ffffff;
          color: #263140;
          font-weight: 800;
        }
        .status.running {
          background: #17202f;
          color: #f8fffb;
        }
        .status.paused,
        .status.escalated {
          border-color: #d8b15f;
          background: #fff7e2;
        }
        .status.completed {
          border-color: #8fc4aa;
          background: #e6f7ef;
        }
        .summary {
          max-width: 1360px;
          margin: 0 auto 16px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 10px;
        }
        .summary div,
        .panel {
          border: 1px solid #d8e1df;
          border-radius: 8px;
          background: #ffffff;
        }
        .summary div {
          padding: 14px;
        }
        .summary span {
          display: block;
          margin-bottom: 6px;
          color: #637085;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .summary strong {
          display: block;
          margin-bottom: 6px;
        }
        .summary p {
          color: #566477;
          font-size: 13px;
          line-height: 1.45;
        }
        .experience {
          max-width: 1360px;
          margin: 0 auto 16px;
          display: grid;
          grid-template-columns: minmax(260px, 0.8fr) minmax(420px, 1.35fr) minmax(260px, 0.9fr);
          gap: 16px;
          align-items: stretch;
        }
        .experienceIntro,
        .careRoom,
        .signalPanel,
        .adapterPanel {
          border: 1px solid #d8e1df;
          border-radius: 8px;
          background: #ffffff;
          padding: 18px;
        }
        .experienceIntro {
          display: grid;
          align-content: center;
        }
        .experienceIntro h2,
        .signalPanel h2,
        .adapterPanel h2 {
          margin-bottom: 10px;
        }
        .experienceIntro p,
        .signalPanel p,
        .adapterPanel p {
          color: #566477;
          line-height: 1.55;
        }
        .careRoom {
          grid-row: span 2;
          display: grid;
          gap: 12px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, var(--light-opacity)), rgba(240, 247, 244, 0.96)),
            #eef5f2;
        }
        .roomHeader,
        .environmentMeters {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .roomHeader span,
        .environmentMeters span,
        .activeEffect span,
        .visionGrid span,
        .visualCard span,
        .noticeCard span {
          color: #637085;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .roomHeader strong {
          color: #245b62;
        }
        .environmentMeters {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .environmentMeters div,
        .visionGrid div {
          border: 1px solid #d8e1df;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.72);
          padding: 10px;
        }
        .environmentMeters b,
        .visionGrid strong {
          display: block;
          margin-top: 4px;
        }
        .roomCanvas {
          position: relative;
          min-height: 340px;
          overflow: hidden;
          border: 1px solid #cbd8d5;
          border-radius: 8px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, var(--light-opacity)), rgba(221, 235, 232, 0.96)),
            linear-gradient(90deg, #dfece8, #f6fbf8);
        }
        .windowGlow {
          position: absolute;
          top: 22px;
          left: 22px;
          width: 128px;
          height: 88px;
          border: 1px solid rgba(36, 91, 98, 0.18);
          border-radius: 8px;
          background: rgba(255, 246, 210, var(--light-opacity));
          box-shadow: 0 0 38px rgba(255, 230, 150, var(--light-opacity));
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
          border: 2px solid rgba(36, 91, 98, 0.38);
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
          left: 68px;
          bottom: 34px;
          display: grid;
          gap: 8px;
          justify-items: center;
          color: #405064;
          font-weight: 800;
        }
        .personMarker {
          width: 92px;
          height: 92px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(36, 91, 98, 0.28);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 0 0 28px rgba(36, 91, 98, 0.07);
        }
        .personMarker span {
          width: 38px;
          height: 52px;
          border-radius: 999px 999px 12px 12px;
          background: #245b62;
        }
        .robotUnit {
          position: absolute;
          left: calc(178px + var(--robot-travel));
          bottom: 34px;
          display: grid;
          gap: 7px;
          justify-items: center;
          color: #17202f;
          font-size: 12px;
          font-weight: 800;
          transition: left 240ms ease;
        }
        .robotHead {
          width: 76px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 2px solid #17202f;
          border-radius: 8px;
          background: #ffffff;
        }
        .robotHead span {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #245b62;
        }
        .robotBody {
          width: 58px;
          height: 46px;
          border: 2px solid #17202f;
          border-radius: 8px;
          background: #e6f7ef;
        }
        .visualCard,
        .noticeCard {
          position: absolute;
          max-width: 230px;
          border: 1px solid rgba(23, 32, 47, 0.14);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.92);
          padding: 12px;
          box-shadow: 0 16px 30px rgba(23, 32, 47, 0.12);
        }
        .visualCard {
          left: 34px;
          top: 128px;
        }
        .noticeCard {
          right: 28px;
          bottom: 34px;
        }
        .visualCard strong,
        .noticeCard strong {
          display: block;
          margin-top: 5px;
          line-height: 1.25;
        }
        .activeEffect {
          border: 1px solid #d8e1df;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.76);
          padding: 12px;
        }
        .activeEffect strong {
          display: block;
          margin: 4px 0;
        }
        .activeEffect p {
          color: #566477;
          line-height: 1.45;
        }
        .signalPanel,
        .adapterPanel {
          display: grid;
          align-content: start;
          gap: 10px;
        }
        .signalPanel button {
          justify-self: start;
          background: #17202f;
          color: #ffffff;
        }
        .visionGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .adapterPanel pre {
          max-height: 310px;
        }
        .layout {
          max-width: 1360px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(320px, 0.9fr) minmax(360px, 1.1fr);
          gap: 16px;
          align-items: start;
        }
        .panel {
          padding: 18px;
        }
        .panelHeader {
          margin-bottom: 16px;
        }
        .presetSection {
          margin-bottom: 14px;
        }
        .presetSection h3 {
          margin-bottom: 10px;
        }
        .presetGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
          gap: 8px;
        }
        .preset {
          min-height: 44px;
          padding: 0 10px;
          text-align: left;
          background: #fbfdfc;
        }
        .activePreset {
          border-color: #245b62;
          background: #e6f7ef;
          color: #245b62;
        }
        .field {
          display: grid;
          gap: 7px;
          color: #3d4959;
          font-size: 13px;
          font-weight: 800;
        }
        .field + .field,
        .fieldGrid,
        .sliders,
        .optionSection {
          margin-top: 14px;
        }
        .adapterField {
          margin-top: 14px;
        }
        .note {
          color: #637085;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
        }
        .fieldGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        input,
        select,
        textarea {
          width: 100%;
          min-height: 40px;
          border: 1px solid #cbd8d5;
          border-radius: 8px;
          background: #fbfdfc;
          color: #17202f;
          font: inherit;
        }
        input,
        select,
        textarea {
          padding: 0 10px;
        }
        textarea {
          min-height: 86px;
          padding-top: 10px;
          resize: vertical;
          line-height: 1.45;
        }
        input:focus,
        select:focus,
        textarea:focus,
        button:focus {
          outline: 2px solid #245b62;
          outline-offset: 2px;
        }
        .inlineInput {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
        }
        .inlineInput span {
          color: #637085;
          font-size: 13px;
          font-weight: 700;
        }
        .sliders {
          display: grid;
          gap: 12px;
        }
        .sliders label {
          display: grid;
          gap: 8px;
        }
        .sliders span {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #3d4959;
          font-size: 13px;
          font-weight: 800;
        }
        input[type="range"] {
          padding: 0;
          accent-color: #245b62;
        }
        .optionSection {
          padding-top: 14px;
          border-top: 1px solid #edf1f0;
        }
        .checks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }
        .checks.compact {
          grid-template-columns: 1fr;
        }
        .check {
          min-height: 48px;
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          border: 1px solid #d8e1df;
          border-radius: 8px;
          padding: 10px;
          background: #fbfdfc;
          font-size: 13px;
        }
        .check input {
          min-height: auto;
          width: 16px;
          accent-color: #245b62;
        }
        .check b,
        .check small {
          display: block;
        }
        .check small {
          margin-top: 2px;
          color: #637085;
          line-height: 1.25;
        }
        .scenario {
          border: 1px solid #d8e1df;
          border-radius: 8px;
          padding: 14px;
          background: #fbfdfc;
        }
        .scenario span {
          color: #637085;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .scenario strong {
          display: block;
          margin: 5px 0;
          font-size: 18px;
        }
        .scenario p {
          color: #566477;
          line-height: 1.45;
        }
        .progressWrap {
          height: 10px;
          margin: 14px 0 8px;
          overflow: hidden;
          border-radius: 999px;
          background: #e5ecea;
        }
        .progressWrap div {
          height: 100%;
          border-radius: inherit;
          background: #245b62;
          transition: width 180ms ease;
        }
        .stepText {
          font-size: 13px;
          font-weight: 800;
        }
        .simButtons,
        .injectors {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        button {
          min-height: 40px;
          border: 1px solid #cbd8d5;
          border-radius: 8px;
          background: #ffffff;
          color: #17202f;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
          padding: 0 12px;
        }
        button:hover:not(:disabled) {
          border-color: #245b62;
          color: #245b62;
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .exportButtons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .copyButton {
          margin-bottom: 0;
        }
        .simButtons button:first-child {
          background: #17202f;
          color: #ffffff;
        }
        .commandStack {
          display: grid;
          gap: 8px;
          margin-top: 14px;
        }
        .command {
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          border: 1px solid #d8e1df;
          border-radius: 8px;
          padding: 10px;
          background: #ffffff;
        }
        .command span {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #edf1f0;
          font-weight: 800;
        }
        .command small {
          display: block;
          margin-top: 2px;
          color: #637085;
        }
        .command.active {
          border-color: #245b62;
        }
        .command.done {
          background: #eef8f3;
        }
        .empty {
          color: #637085;
          font-weight: 700;
        }
        .audit,
        .protocol {
          grid-column: span 1;
        }
        .intelligence {
          grid-column: 1 / -1;
        }
        .intelligenceIntro {
          max-width: 760px;
          color: #566477;
          line-height: 1.55;
        }
        .intelligenceActions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 14px 0;
        }
        .primaryAction {
          background: #17202f;
          color: #ffffff;
        }
        .intelligenceBody {
          display: grid;
          grid-template-columns: minmax(280px, 1.1fr) minmax(280px, 1fr) minmax(280px, 1fr);
          gap: 16px;
          align-items: start;
          padding-top: 14px;
          border-top: 1px solid #edf1f0;
        }
        .intelligenceColumn {
          display: grid;
          gap: 10px;
          align-content: start;
        }
        .intelligenceColumn h3 {
          margin-top: 6px;
        }
        .planMeta {
          color: #637085;
          font-size: 12px;
          font-weight: 700;
        }
        .planParagraph {
          color: #566477;
          font-size: 13px;
          line-height: 1.5;
        }
        .planSteps {
          display: grid;
          gap: 8px;
        }
        .planStep {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          border: 1px solid #d8e1df;
          border-radius: 8px;
          padding: 10px;
          background: #fbfdfc;
        }
        .planStep span {
          color: #245b62;
          font-size: 12px;
          font-weight: 800;
        }
        .planStep small {
          display: block;
          margin-top: 2px;
          color: #637085;
          line-height: 1.35;
        }
        .validationOk {
          color: #1f6b46;
          font-size: 13px;
          font-weight: 800;
        }
        .validationIssues {
          color: #8a5a12;
          font-size: 13px;
          font-weight: 800;
        }
        .issueList,
        .questionList {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 6px;
          color: #566477;
          font-size: 13px;
          line-height: 1.45;
        }
        .flagList {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 8px;
        }
        .flag {
          display: grid;
          grid-template-columns: 72px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          border: 1px solid #d8e1df;
          border-radius: 8px;
          padding: 10px;
          background: #fbfdfc;
        }
        .flag span {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #637085;
        }
        .flag.warning {
          border-color: #d8b15f;
          background: #fff7e2;
        }
        .flag.warning span {
          color: #8a5a12;
        }
        .flag p {
          color: #566477;
          font-size: 13px;
          line-height: 1.4;
        }
        .packetHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .packetHead select {
          max-width: 240px;
        }
        .intelligence pre {
          max-height: 420px;
        }
        .logList {
          display: grid;
          gap: 8px;
          max-height: 520px;
          overflow: auto;
          padding-right: 4px;
        }
        .logItem {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr) auto;
          gap: 10px;
          align-items: start;
          border: 1px solid #d8e1df;
          border-radius: 8px;
          padding: 10px;
          background: #fbfdfc;
        }
        .logItem time,
        .logItem span {
          color: #637085;
          font-size: 12px;
          font-weight: 800;
        }
        .logItem p {
          margin-top: 3px;
          color: #566477;
          font-size: 13px;
          line-height: 1.35;
        }
        pre {
          max-height: 520px;
          margin: 0;
          overflow: auto;
          border-radius: 8px;
          background: #17202f;
          color: #e9f5f1;
          font-size: 12px;
          line-height: 1.55;
          padding: 14px;
          white-space: pre-wrap;
        }
        @media (max-width: 980px) {
          .topbar,
          .layout,
          .summary,
          .experience,
          .intelligenceBody {
            grid-template-columns: 1fr;
          }
          .careRoom {
            grid-row: auto;
          }
          .status {
            justify-self: start;
          }
        }
        @media (max-width: 640px) {
          .page {
            padding: 14px;
          }
          h1 {
            font-size: 26px;
          }
          .fieldGrid,
          .checks,
          .environmentMeters,
          .visionGrid {
            grid-template-columns: 1fr;
          }
          .roomCanvas {
            min-height: 300px;
          }
          .robotUnit {
            left: min(calc(110px + var(--robot-travel)), calc(100% - 118px));
          }
          .noticeCard,
          .visualCard {
            position: static;
            margin: 12px;
          }
          .logItem {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
