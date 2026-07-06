/**
 * Care Command Protocol v0 — shared types.
 *
 * These types describe caregiver-authored care routines and the
 * portable command envelopes that future adapters (ROS2, MQTT, HTTP,
 * offline review tools) must preserve.
 */

export type Command =
  | "lower_light"
  | "reduce_sound"
  | "step_back"
  | "pause_interaction"
  | "offer_visual_card"
  | "notify_caregiver"
  | "log_observation";

export type SafetyException =
  | "rejection_signal"
  | "unusual_movement"
  | "caregiver_pause"
  | "timeout"
  | "unknown_event";

export type Pace = "slow" | "steady" | "adaptive";

export type Environment = {
  light: number;
  sound: number;
  distance: number;
  pace: Pace;
};

export type AdapterTarget = "ros2" | "mqtt" | "http" | "offline";

export type ScenarioId =
  | "evening_transition"
  | "sensory_overload"
  | "leaving_home"
  | "meal_support"
  | "school_arrival";

export type VisionSnapshot = {
  faceDetected: boolean;
  handsAvg: number;
  handNearPct: number;
  movement: number;
  blinksPerMin: number;
};

export type ScenarioPreset = {
  id: ScenarioId;
  name: string;
  careGoal: string;
  visualCard: string;
  duration: number;
  environment: Environment;
  commands: Command[];
  exceptions: SafetyException[];
};

/** Input the planner needs to produce a full care protocol plan. */
export type PlannerInput = {
  scenario: ScenarioId;
  routineName: string;
  careGoal: string;
  visualCard: string;
  durationMinutes: number;
  environment: Environment;
  allowedCommands: Command[];
  safetyExceptions: SafetyException[];
  visionContext: VisionSnapshot | null;
};

/** One ordered, timed step of a planned routine. */
export type PlannedStep = {
  command: Command;
  offsetMinutes: number;
  durationMinutes: number;
  reason: string;
};

export type AttentionFlagSeverity = "info" | "advice" | "warning";

export type AttentionFlag = {
  severity: AttentionFlagSeverity;
  message: string;
};

export type ProtocolValidation = {
  valid: boolean;
  issues: string[];
};

/** Portable envelope one adapter target receives. */
export type AdapterPacket = {
  envelope: "neuroljus.care_command.v0";
  target: AdapterTarget;
  route: string;
  transport: string;
  protocol_contract: "care_command_protocol_v0";
  routine: string;
  scenario: ScenarioId;
  care_goal: string;
  environment_targets: Environment;
  planned_sequence: Array<{
    command: Command;
    offset_minutes: number;
    duration_minutes: number;
    reason: string;
  }>;
  safety_exceptions: SafetyException[];
  audit_required: true;
  adapter_must_preserve: string[];
};

/** The generated care_command_protocol_v0 document. */
export type CareCommandProtocolV0 = {
  contract: "care_command_protocol_v0";
  name: string;
  scenario: ScenarioId;
  care_goal: string;
  visual_card: string;
  autonomy_level: 2;
  mode: "protocol_first";
  duration_minutes: number;
  environment: Environment;
  vision_context: {
    source: "nlvision_holistic_v1" | "manual_context";
    latest_local_snapshot: VisionSnapshot | null;
  };
  allowed_commands: Command[];
  planned_sequence: PlannedStep[];
  safety_exceptions: SafetyException[];
  audit_policy: {
    local_only: true;
    records: ["timestamp", "actor", "command", "reason"];
    sensitive_personal_data: false;
  };
};

/** Everything the protocol intelligence layer returns for one plan. */
export type PlannerResult = {
  explanation: string[];
  protocol: CareCommandProtocolV0;
  steps: PlannedStep[];
  adapterPackets: Record<AdapterTarget, AdapterPacket>;
  reflectionQuestions: string[];
  attentionFlags: AttentionFlag[];
  validation: ProtocolValidation;
};
