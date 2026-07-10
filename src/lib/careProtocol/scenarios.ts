/**
 * Shared caregiver-authored scenario presets used by the robot
 * interface lab and the Future Care Room experience.
 */

import type { Command, ScenarioId, ScenarioPreset } from "./types";

export const defaultCommands: Command[] = [
  "lower_light",
  "reduce_sound",
  "step_back",
  "pause_interaction",
  "offer_visual_card",
  "notify_caregiver",
  "log_observation",
];

export const scenarioOrder: ScenarioId[] = [
  "evening_transition",
  "sensory_overload",
  "leaving_home",
  "meal_support",
  "school_arrival",
];

export const scenarioPresets: Record<ScenarioId, ScenarioPreset> = {
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
