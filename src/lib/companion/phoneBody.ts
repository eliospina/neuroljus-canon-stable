/**
 * Companion — the phone as the first body.
 *
 * Maps each care_command_protocol_v0 command to what a phone can actually do,
 * and computes the phone's state at any minute of a planned routine. Pure and
 * deterministic: the browser runner only renders this state (screen dim
 * overlay, brown-noise gain, visual card, caregiver hints).
 *
 * The body never touches anyone. A phone cannot move, so step_back becomes an
 * instruction for the caregiver. The screen is never fully dark and the sound
 * is always soft.
 */

import type { Command, Environment, PlannedStep } from "../careProtocol/types";

export type PhoneAction =
  | "dim_screen"
  | "brown_noise"
  | "caregiver_hint"
  | "quiet_screen"
  | "visual_card"
  | "vibrate_notify"
  | "local_log";

export type PhoneMapping = {
  action: PhoneAction;
  /** false: the phone cannot do it; the caregiver is asked to. */
  onPhone: boolean;
};

export const phoneMapping: Record<Command, PhoneMapping> = {
  lower_light: { action: "dim_screen", onPhone: true },
  reduce_sound: { action: "brown_noise", onPhone: true },
  step_back: { action: "caregiver_hint", onPhone: false },
  pause_interaction: { action: "quiet_screen", onPhone: true },
  offer_visual_card: { action: "visual_card", onPhone: true },
  notify_caregiver: { action: "vibrate_notify", onPhone: true },
  log_observation: { action: "local_log", onPhone: true },
};

/** Maximum overlay opacity: the screen dims, it never goes black. */
export const MAX_SCREEN_DIM = 0.6;
/** Maximum Web Audio gain for brown noise: soft, never loud. */
export const MAX_NOISE_GAIN = 0.12;
/** Minutes over which the noise fades in once reduce_sound starts. */
const NOISE_FADE_MINUTES = 0.5;

/** Overlay opacity for a light target (0-100). Lower light → dimmer screen. */
export function screenDimForLight(light: number): number {
  const l = Math.min(100, Math.max(0, light));
  return Math.round(MAX_SCREEN_DIM * (1 - l / 100) * 100) / 100;
}

/** Brown-noise gain for a sound target (0-100). Lower target → softer noise. */
export function noiseGainForSound(sound: number): number {
  const s = Math.min(100, Math.max(0, sound));
  return Math.round(MAX_NOISE_GAIN * (0.35 + 0.65 * (s / 100)) * 1000) / 1000;
}

export type PhoneOptions = {
  /** false when the person's profile rules out noise; the phone stays silent. */
  noise: boolean;
};

export type PhoneState = {
  /** Overlay opacity, 0 … MAX_SCREEN_DIM. */
  dim: number;
  /** Brown-noise gain, 0 … MAX_NOISE_GAIN. */
  noiseGain: number;
  quiet: boolean;
  card: boolean;
  /** Commands the caregiver is currently asked to do by hand. */
  caregiverHints: Command[];
  notified: boolean;
  logged: boolean;
  /** Index of the running step; -1 before the first; steps.length when done. */
  activeStep: number;
  done: boolean;
};

export function totalMinutes(steps: PlannedStep[]): number {
  if (steps.length === 0) return 0;
  const last = steps[steps.length - 1];
  return Math.round((last.offsetMinutes + last.durationMinutes) * 10) / 10;
}

/** Phone state at a minute of the routine. Same input → same state. */
export function phoneStateAt(
  steps: PlannedStep[],
  environment: Environment,
  minute: number,
  options: PhoneOptions = { noise: true }
): PhoneState {
  const total = totalMinutes(steps);
  const done = steps.length > 0 && minute >= total;
  const state: PhoneState = {
    dim: 0,
    noiseGain: 0,
    quiet: false,
    card: false,
    caregiverHints: [],
    notified: false,
    logged: false,
    activeStep: -1,
    done,
  };

  steps.forEach((step, index) => {
    const start = step.offsetMinutes;
    if (minute < start) return;
    const end = start + step.durationMinutes;
    if (minute < end) state.activeStep = index;
    const progress = step.durationMinutes > 0 ? Math.min(1, (minute - start) / step.durationMinutes) : 1;

    switch (step.command) {
      case "lower_light":
        state.dim = Math.round(screenDimForLight(environment.light) * progress * 100) / 100;
        break;
      case "reduce_sound":
        if (options.noise) {
          const fade = Math.min(1, (minute - start) / NOISE_FADE_MINUTES);
          state.noiseGain = Math.round(noiseGainForSound(environment.sound) * fade * 1000) / 1000;
        }
        break;
      case "step_back":
        state.caregiverHints.push("step_back");
        break;
      case "pause_interaction":
        state.quiet = true;
        break;
      case "offer_visual_card":
        state.card = true;
        break;
      case "notify_caregiver":
        state.notified = true;
        break;
      case "log_observation":
        state.logged = true;
        break;
    }
  });

  if (done) {
    state.activeStep = steps.length;
    // Sound fades out at the end; the dim stays until the caregiver closes.
    state.noiseGain = 0;
  }
  return state;
}

/** Seconds of wall-clock time per routine minute. */
export const SECONDS_PER_MINUTE = { real: 60, demo: 2 } as const;
export type RunSpeed = keyof typeof SECONDS_PER_MINUTE;
