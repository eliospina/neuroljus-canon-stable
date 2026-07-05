import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Command =
  | "lower_light"
  | "reduce_sound"
  | "step_back"
  | "pause_interaction"
  | "offer_visual_card"
  | "notify_caregiver"
  | "log_observation";

type SafetyException =
  | "rejection_signal"
  | "unusual_movement"
  | "caregiver_pause"
  | "timeout"
  | "unknown_event";

type Environment = {
  light: number;
  sound: number;
  distance: number;
  pace: "slow" | "steady" | "adaptive";
};

type AdapterTarget = "ros2" | "mqtt" | "http" | "offline";

type SimStatus = "idle" | "running" | "paused" | "completed" | "escalated";

type AuditEntry = {
  id: number;
  time: string;
  actor: "caregiver" | "neuroljus" | "simulator" | "system";
  command: string;
  reason: string;
};

const commandLabels: Record<Command, string> = {
  lower_light: "Lower light",
  reduce_sound: "Reduce sound",
  step_back: "Step back",
  pause_interaction: "Pause interaction",
  offer_visual_card: "Offer visual card",
  notify_caregiver: "Notify caregiver",
  log_observation: "Log observation",
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

const exceptionLabels: Record<SafetyException, string> = {
  rejection_signal: "Person rejects",
  unusual_movement: "Unusual movement",
  caregiver_pause: "Caregiver pauses",
  timeout: "Timeout",
  unknown_event: "Unknown event",
};

const eventToException: Record<string, SafetyException> = {
  "person rejects": "rejection_signal",
  "noise increases": "unknown_event",
  "caregiver pauses": "caregiver_pause",
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

const defaultExceptions: SafetyException[] = [
  "rejection_signal",
  "caregiver_pause",
  "timeout",
  "unknown_event",
];

const adapterLabels: Record<AdapterTarget, string> = {
  ros2: "ROS2 robot middleware",
  mqtt: "MQTT care device broker",
  http: "Local HTTP command bridge",
  offline: "Offline JSON playbook",
};

const adapterTransports: Record<AdapterTarget, string> = {
  ros2: "publish command envelopes to a local ROS2 node",
  mqtt: "publish command envelopes to a private MQTT topic",
  http: "send command envelopes to a local HTTP adapter",
  offline: "export command envelopes for human review and field adaptation",
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
  const [routineName, setRoutineName] = useState("Evening transition");
  const [duration, setDuration] = useState(20);
  const [environment, setEnvironment] = useState<Environment>({
    light: 35,
    sound: 25,
    distance: 1.5,
    pace: "slow",
  });
  const [commands, setCommands] = useState<Command[]>(defaultCommands);
  const [exceptions, setExceptions] = useState<SafetyException[]>(defaultExceptions);
  const [adapterTarget, setAdapterTarget] = useState<AdapterTarget>("ros2");
  const [status, setStatus] = useState<SimStatus>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [log, setLog] = useState<AuditEntry[]>([
    {
      id: 1,
      time: nowStamp(),
      actor: "system",
      command: "lab_ready",
      reason: "local simulator initialized; no hardware adapter attached",
    },
  ]);

  const nextId = useRef(2);
  const activeCommands = useMemo(() => commands, [commands]);

  const protocol = useMemo(
    () => ({
      name: routineName || "Untitled routine",
      autonomy_level: 2,
      mode: "simulator_first",
      duration_minutes: duration,
      environment,
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
      hardware_adapter: {
        attached: false,
        status: "simulation_only",
      },
    }),
    [adapterTarget, commands, duration, environment, exceptions, routineName]
  );

  function addLog(actor: AuditEntry["actor"], command: string, reason: string) {
    setLog((current) => [
      {
        id: nextId.current++,
        time: nowStamp(),
        actor,
        command,
        reason,
      },
      ...current,
    ]);
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

  function startRoutine() {
    if (activeCommands.length === 0) {
      addLog("system", "routine_blocked", "at least one allowed command is required");
      return;
    }

    setStepIndex(0);
    setStatus("running");
    addLog("caregiver", "start_routine", `${routineName || "Untitled routine"} started`);
  }

  function resetRoutine() {
    setStatus("idle");
    setStepIndex(0);
    addLog("caregiver", "reset_simulator", "routine returned to idle state");
  }

  function completeRoutine(reason = "routine completed within protocol") {
    setStatus("completed");
    setStepIndex(activeCommands.length);
    addLog("simulator", "routine_complete", reason);
  }

  function injectEvent(label: "person rejects" | "noise increases" | "caregiver pauses" | "routine completes") {
    if (label === "routine completes") {
      completeRoutine("manual completion event injected in simulator");
      return;
    }

    const exception = eventToException[label];
    const command = exception ? exception : "event";

    addLog("simulator", command, `${label} event injected`);

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

  const progress =
    activeCommands.length === 0 ? 0 : Math.min(100, Math.round((stepIndex / activeCommands.length) * 100));

  const statusLabel: Record<SimStatus, string> = {
    idle: "Idle",
    running: "Running",
    paused: "Paused",
    completed: "Completed",
    escalated: "Safety exception",
  };

  return (
    <>
      <Head>
        <title>Robot Care Interface Lab - Neuroljus</title>
        <meta
          name="description"
          content="Local simulator for Neuroljus care command protocols, preauthorized routines, safety exceptions, and audit trails."
        />
      </Head>

      <main className="page">
        <header className="topbar">
          <Link href="/" className="brand">
            Neuroljus
          </Link>
          <div>
            <p className="kicker">Local prototype · open protocol · simulator first</p>
            <h1>Robot Care Interface</h1>
          </div>
          <div className={`status ${status}`}>{statusLabel[status]}</div>
        </header>

        <section className="summary" aria-label="Protocol summary">
          <div>
            <span>Core</span>
            <strong>Preauthorized autonomy</strong>
            <p>Configured routines execute without asking at every step.</p>
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
            <strong>Simulation only</strong>
            <p>Today it designs the contract. Devices can attach after the contract is sound.</p>
          </div>
        </section>

        <div className="layout">
          <section className="panel builder" aria-labelledby="builder-title">
            <div className="panelHeader">
              <p className="kicker">01 · Routine builder</p>
              <h2 id="builder-title">Care command protocol</h2>
            </div>

            <label className="field">
              Routine name
              <input
                value={routineName}
                onChange={(event) => setRoutineName(event.target.value)}
                maxLength={80}
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
                    onChange={(event) => setDuration(Number(event.target.value))}
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
              <p className="kicker">02 · Simulator panel</p>
              <h2 id="sim-title">Preauthorized routine</h2>
            </div>

            <div className="scenario">
              <div>
                <span>Scenario</span>
                <strong>{routineName || "Untitled routine"}</strong>
                <p>
                  A transition routine runs with configured environment targets and
                  allowed commands. Exceptions interrupt the run.
                </p>
              </div>
              <div className="progressWrap" aria-label={`Progress ${progress}%`}>
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
              <button onClick={() => setStatus("running")} disabled={status !== "paused"}>
                Resume
              </button>
              <button onClick={resetRoutine}>Reset</button>
            </div>

            <div className="injectors" aria-label="Inject simulator events">
              <button onClick={() => injectEvent("person rejects")}>Person rejects</button>
              <button onClick={() => injectEvent("noise increases")}>Noise increases</button>
              <button onClick={() => injectEvent("caregiver pauses")}>Caregiver pauses</button>
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

          <section className="panel audit" aria-labelledby="audit-title">
            <div className="panelHeader">
              <p className="kicker">03 · Audit trail</p>
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
              <p className="kicker">04 · Protocol export</p>
              <h2 id="protocol-title">Generated JSON</h2>
            </div>
            <button className="copyButton" onClick={copyProtocol}>
              {copied ? "Copied" : "Copy JSON"}
            </button>
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
        select {
          width: 100%;
          min-height: 40px;
          border: 1px solid #cbd8d5;
          border-radius: 8px;
          background: #fbfdfc;
          color: #17202f;
          font: inherit;
        }
        input,
        select {
          padding: 0 10px;
        }
        input:focus,
        select:focus,
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
        .copyButton {
          margin-bottom: 12px;
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
          .summary {
            grid-template-columns: 1fr;
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
          .checks {
            grid-template-columns: 1fr;
          }
          .logItem {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
