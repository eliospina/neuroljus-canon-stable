/**
 * Care Protocol Intelligence — deterministic local planner.
 *
 * Takes caregiver-authored routine settings (plus optional local
 * NL-VISION context) and produces an ordered, timed, explained,
 * validated care_command_protocol_v0 plan with adapter packets.
 *
 * No network, no external API: every output is a pure function of
 * the input, so the same configuration always yields the same plan.
 */

import type {
  AdapterPacket,
  AdapterTarget,
  AttentionFlag,
  CareCommandProtocolV0,
  Command,
  Environment,
  PlannedStep,
  PlannerInput,
  PlannerResult,
  ProtocolValidation,
  SafetyException,
  ScenarioId,
  VisionSnapshot,
} from "./types";

export const commandLabels: Record<Command, string> = {
  lower_light: "Lower light",
  reduce_sound: "Reduce sound",
  step_back: "Step back",
  pause_interaction: "Pause interaction",
  offer_visual_card: "Offer visual card",
  notify_caregiver: "Notify caregiver",
  log_observation: "Log observation",
};

export const exceptionLabels: Record<SafetyException, string> = {
  rejection_signal: "Person rejects",
  unusual_movement: "Unusual movement",
  caregiver_pause: "Caregiver pauses",
  timeout: "Timeout",
  unknown_event: "Unknown event",
};

export const adapterLabels: Record<AdapterTarget, string> = {
  ros2: "ROS2 robot middleware",
  mqtt: "MQTT care device broker",
  http: "Local HTTP command bridge",
  offline: "Offline JSON playbook",
};

export const adapterTransports: Record<AdapterTarget, string> = {
  ros2: "publish command envelopes to a local ROS2 node",
  mqtt: "publish command envelopes to a private MQTT topic",
  http: "send command envelopes to a local HTTP adapter",
  offline: "export command envelopes for human review and field adaptation",
};

const adapterRoutes: Record<AdapterTarget, string> = {
  ros2: "/neuroljus/care_command",
  mqtt: "neuroljus/care/command",
  http: "POST http://localhost:8787/care-command",
  offline: "offline-json-playbook",
};

const adapterMustPreserve = [
  "caregiver-authored routine settings",
  "allowed command list",
  "safety exception list",
  "local audit trail",
];

/**
 * Canonical care sequence: reduce sensory load first, then adjust
 * space and pacing, then offer structure, then close with notice
 * and record.
 */
const canonicalOrder: Command[] = [
  "reduce_sound",
  "lower_light",
  "step_back",
  "pause_interaction",
  "offer_visual_card",
  "notify_caregiver",
  "log_observation",
];

/**
 * When recent local vision context suggests elevated arousal, space
 * and pause come before ambient adjustments.
 */
const settleFirstOrder: Command[] = [
  "step_back",
  "pause_interaction",
  "reduce_sound",
  "lower_light",
  "offer_visual_card",
  "notify_caregiver",
  "log_observation",
];

const HIGH_MOVEMENT_THRESHOLD = 0.02;
const HIGH_HAND_NEAR_THRESHOLD = 0.35;

/** Closing commands are brief; the routine time lives in the care steps. */
const briefCommands = new Set<Command>(["notify_caregiver", "log_observation"]);
const BRIEF_STEP_MINUTES = 1;

const stepReasons: Record<Command, string> = {
  lower_light: "move room light toward the caregiver target",
  reduce_sound: "reduce sound load toward the caregiver target",
  step_back: "increase personal space before adding demands",
  pause_interaction: "hold interaction pressure for a quiet interval",
  offer_visual_card: "make the routine visible and predictable",
  notify_caregiver: "close the routine with a caregiver notice",
  log_observation: "preserve the run in the local audit trail",
};

const scenarioQuestions: Record<ScenarioId, string> = {
  evening_transition:
    "Is the light target low enough for how the evening routine usually ends?",
  sensory_overload:
    "Which single step reduces load fastest when overload starts in this room?",
  possible_discomfort:
    "What eased or worsened last time you witnessed a similar gesture — and what remains uncertain?",
  leaving_home:
    "Does the visual card show the real order of steps used at the door?",
  meal_support:
    "Where in the meal does interaction pressure usually need to drop?",
  school_arrival:
    "Who at school needs to see the audit record after the handoff?",
};

function isElevatedArousal(vision: VisionSnapshot | null): boolean {
  if (!vision) return false;
  return (
    vision.movement > HIGH_MOVEMENT_THRESHOLD ||
    vision.handNearPct > HIGH_HAND_NEAR_THRESHOLD
  );
}

function orderCommands(
  allowed: Command[],
  vision: VisionSnapshot | null,
  scenario?: ScenarioId
): Command[] {
  const settleFirst = isElevatedArousal(vision) || scenario === "possible_discomfort";
  const order = settleFirst ? settleFirstOrder : canonicalOrder;
  return order.filter((command) => allowed.includes(command));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildSteps(commands: Command[], durationMinutes: number): PlannedStep[] {
  const briefCount = commands.filter((command) => briefCommands.has(command)).length;
  const careCount = commands.length - briefCount;
  const briefTotal = Math.min(briefCount * BRIEF_STEP_MINUTES, durationMinutes / 2);
  const perCareStep = careCount > 0 ? (durationMinutes - briefTotal) / careCount : 0;
  const perBriefStep = briefCount > 0 ? briefTotal / briefCount : 0;

  let offset = 0;
  return commands.map((command) => {
    const stepDuration = briefCommands.has(command) ? perBriefStep : perCareStep;
    const step: PlannedStep = {
      command,
      offsetMinutes: round1(offset),
      durationMinutes: round1(stepDuration),
      reason: stepReasons[command],
    };
    offset += stepDuration;
    return step;
  });
}

function validate(input: PlannerInput): ProtocolValidation {
  const issues: string[] = [];

  if (input.allowedCommands.length === 0) {
    issues.push("At least one allowed command is required.");
  }
  if (!input.careGoal.trim()) {
    issues.push("A care goal is required so adapters can preserve intent.");
  }
  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes < 1 || input.durationMinutes > 120) {
    issues.push("Duration must be between 1 and 120 minutes.");
  }
  if (input.environment.light < 0 || input.environment.light > 100) {
    issues.push("Light target must be between 0 and 100 percent.");
  }
  if (input.environment.sound < 0 || input.environment.sound > 100) {
    issues.push("Sound target must be between 0 and 100 percent.");
  }
  if (input.environment.distance < 0.5 || input.environment.distance > 4) {
    issues.push("Robot distance must be between 0.5 and 4 meters.");
  }
  if (input.safetyExceptions.length === 0) {
    issues.push("At least one safety exception is required before adapter work.");
  }

  return { valid: issues.length === 0, issues };
}

function buildAttentionFlags(input: PlannerInput): AttentionFlag[] {
  const flags: AttentionFlag[] = [];
  const { allowedCommands, safetyExceptions, environment, visionContext } = input;

  if (!safetyExceptions.includes("rejection_signal")) {
    flags.push({
      severity: "warning",
      message:
        "Rejection signal is not a configured exception. The routine would continue even if the person rejects it.",
    });
  }
  if (!safetyExceptions.includes("caregiver_pause")) {
    flags.push({
      severity: "warning",
      message:
        "Caregiver pause is not a configured exception. The caregiver could not interrupt through the protocol.",
    });
  }
  if (!safetyExceptions.includes("unknown_event")) {
    flags.push({
      severity: "advice",
      message:
        "Unknown event is not configured. Unclassified events would be logged but would not pause the routine.",
    });
  }
  if (!allowedCommands.includes("notify_caregiver")) {
    flags.push({
      severity: "advice",
      message: "The routine ends without a caregiver notice. Consider allowing notify_caregiver.",
    });
  }
  if (!allowedCommands.includes("log_observation")) {
    flags.push({
      severity: "advice",
      message: "log_observation is not allowed, so runs leave a thinner local audit trail.",
    });
  }
  if (input.durationMinutes > 45) {
    flags.push({
      severity: "advice",
      message: "Routines over 45 minutes are hard to keep predictable. Consider splitting the routine.",
    });
  }
  if (environment.distance < 1) {
    flags.push({
      severity: "advice",
      message: "Target distance is under 1 meter. Close approach should usually stay a caregiver decision.",
    });
  }
  if (input.scenario === "sensory_overload" && (environment.light > 50 || environment.sound > 40)) {
    flags.push({
      severity: "advice",
      message: "Light or sound targets look high for a sensory overload scenario.",
    });
  }
  if (
    input.scenario === "possible_discomfort" &&
    (environment.light > 40 || environment.sound > 30 || environment.pace !== "slow")
  ) {
    flags.push({
      severity: "advice",
      message:
        "For possible discomfort, keep light/sound low and pace slow unless the caregiver chooses otherwise.",
    });
  }
  if (!visionContext) {
    flags.push({
      severity: "info",
      message: "No NL-VISION context attached. The plan is based on manual context only.",
    });
  } else if (isElevatedArousal(visionContext)) {
    flags.push({
      severity: "warning",
      message:
        "The latest local NL-VISION sample suggests elevated movement or hands near the face. Space and pause steps were moved first.",
    });
  }

  return flags;
}

function buildExplanation(input: PlannerInput, steps: PlannedStep[]): string[] {
  const paragraphs: string[] = [];
  const settleFirst =
    isElevatedArousal(input.visionContext) || input.scenario === "possible_discomfort";
  const routine = input.routineName.trim() || "Untitled routine";

  paragraphs.push(
    `${routine} runs for about ${input.durationMinutes} minutes with the goal: ${
      input.careGoal.trim() || "no care goal set"
    }`
  );

  paragraphs.push(
    `The environment moves toward ${input.environment.light}% light, ${input.environment.sound}% sound, and ${input.environment.distance.toFixed(
      1
    )} m of personal space at a ${input.environment.pace} pace.`
  );

  if (steps.length > 0) {
    const sequence = steps.map((step) => commandLabels[step.command].toLowerCase()).join(", then ");
    paragraphs.push(
      settleFirst
        ? input.scenario === "possible_discomfort"
          ? `Because this scenario prioritizes possible discomfort as a caregiver witness, the plan settles space and pacing first: ${sequence}.`
          : `Because the attached local vision sample suggests elevated arousal, the plan settles space and pacing first: ${sequence}.`
        : `The plan reduces sensory load first, then adjusts space and structure, and closes with notice and record: ${sequence}.`
    );
  }

  const exceptionNames = input.safetyExceptions
    .map((exception) => exceptionLabels[exception].toLowerCase())
    .join(", ");
  paragraphs.push(
    input.safetyExceptions.length > 0
      ? `Only these configured signals interrupt the routine: ${exceptionNames}. Everything else is logged and the routine continues.`
      : `No safety exceptions are configured, so nothing would interrupt this routine. This must be fixed before adapter work.`
  );

  paragraphs.push(
    "Every command and event is recorded locally with a timestamp, actor, and reason. Adapters must preserve the routine settings, the allowed command list, the safety exceptions, and the audit trail."
  );

  return paragraphs;
}

function buildReflectionQuestions(input: PlannerInput): string[] {
  const questions = [
    "Does this order match how the person usually settles in this scenario?",
    "Which step would you remove first if the person shows discomfort?",
    "Is the caregiver notice arriving at the right moment, or should it come earlier?",
    scenarioQuestions[input.scenario],
  ];
  if (input.visionContext) {
    questions.push("Does the attached NL-VISION sample match what you observed in the room?");
  }
  return questions;
}

function buildAdapterPackets(
  input: PlannerInput,
  steps: PlannedStep[]
): Record<AdapterTarget, AdapterPacket> {
  const targets: AdapterTarget[] = ["offline", "http", "mqtt", "ros2"];
  const packets = {} as Record<AdapterTarget, AdapterPacket>;

  for (const target of targets) {
    packets[target] = {
      envelope: "neuroljus.care_command.v0",
      target,
      route: adapterRoutes[target],
      transport: adapterTransports[target],
      protocol_contract: "care_command_protocol_v0",
      routine: input.routineName.trim() || "Untitled routine",
      scenario: input.scenario,
      care_goal: input.careGoal,
      environment_targets: input.environment,
      planned_sequence: steps.map((step) => ({
        command: step.command,
        offset_minutes: step.offsetMinutes,
        duration_minutes: step.durationMinutes,
        reason: step.reason,
      })),
      safety_exceptions: input.safetyExceptions,
      audit_required: true,
      adapter_must_preserve: adapterMustPreserve,
    };
  }

  return packets;
}

function buildProtocol(input: PlannerInput, steps: PlannedStep[]): CareCommandProtocolV0 {
  return {
    contract: "care_command_protocol_v0",
    name: input.routineName.trim() || "Untitled routine",
    scenario: input.scenario,
    care_goal: input.careGoal,
    visual_card: input.visualCard,
    autonomy_level: 2,
    mode: "protocol_first",
    duration_minutes: input.durationMinutes,
    environment: input.environment,
    vision_context: input.visionContext
      ? { source: "nlvision_holistic_v1", latest_local_snapshot: input.visionContext }
      : { source: "manual_context", latest_local_snapshot: null },
    allowed_commands: input.allowedCommands,
    planned_sequence: steps,
    safety_exceptions: input.safetyExceptions,
    audit_policy: {
      local_only: true,
      records: ["timestamp", "actor", "command", "reason"],
      sensitive_personal_data: false,
    },
  };
}

/** Build a complete, deterministic care protocol plan from caregiver settings. */
export function buildCarePlan(input: PlannerInput): PlannerResult {
  const orderedCommands = orderCommands(
    input.allowedCommands,
    input.visionContext,
    input.scenario
  );
  const steps = buildSteps(orderedCommands, input.durationMinutes);

  return {
    explanation: buildExplanation(input, steps),
    protocol: buildProtocol(input, steps),
    steps,
    adapterPackets: buildAdapterPackets(input, steps),
    reflectionQuestions: buildReflectionQuestions(input),
    attentionFlags: buildAttentionFlags(input),
    validation: validate(input),
  };
}
