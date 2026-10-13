/**
 * Companion — the house as a body (Home Assistant).
 *
 * Turns a planned care_command_protocol_v0 routine into a Home Assistant
 * script the caregiver pastes into scripts.yaml. Same sequence, same timing.
 * Generated locally: no tokens are stored and the web page never calls the
 * house. The caregiver runs the script by hand and stops it with
 * script.turn_off. The house never touches anyone: it dims, lowers volume,
 * notifies and logs.
 */

import type { Command, Environment, PlannedStep, ScenarioId } from "../careProtocol/types";

export type HomeEntities = {
  light: string;
  mediaPlayer: string;
  /** Notify service, e.g. notify.mobile_app_caregiver_phone */
  notify: string;
};

export const DEFAULT_ENTITIES: HomeEntities = {
  light: "light.living_room",
  mediaPlayer: "media_player.living_room",
  notify: "notify.mobile_app_caregiver_phone",
};

/** Warm white for low-stimulus light. */
export const WARM_KELVIN = 2200;

const ENTITY_RE = /^[a-z_]+\.[a-z0-9_]+$/;

/** Keep only well-formed entity ids; anything else falls back to the default. */
export function sanitizeEntities(input: Partial<HomeEntities>): HomeEntities {
  const pick = (value: string | undefined, domain: string, fallback: string) => {
    const v = (value || "").trim().toLowerCase();
    return ENTITY_RE.test(v) && v.startsWith(`${domain}.`) ? v : fallback;
  };
  return {
    light: pick(input.light, "light", DEFAULT_ENTITIES.light),
    mediaPlayer: pick(input.mediaPlayer, "media_player", DEFAULT_ENTITIES.mediaPlayer),
    notify: pick(input.notify, "notify", DEFAULT_ENTITIES.notify),
  };
}

export type HomeScriptInput = {
  routine: string;
  scenario: ScenarioId;
  environment: Environment;
  steps: PlannedStep[];
  entities: HomeEntities;
  /** Message the caregiver's phone receives at notify_caregiver. */
  notifyMessage: string;
  /** Logbook lines for steps the house cannot do itself (step_back, card, pause). */
  caregiverNotes: Partial<Record<Command, string>>;
};

/** YAML double-quoted scalar (JSON strings are valid YAML). */
const q = (s: string) => JSON.stringify(s);

function hms(minutes: number): string {
  const total = Math.max(0, Math.round(minutes * 60));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function stepYaml(step: PlannedStep, input: HomeScriptInput): string[] {
  const { entities, environment } = input;
  const label = `+${step.offsetMinutes} min · ${step.command}`;
  const seconds = Math.max(1, Math.round(step.durationMinutes * 60));
  const logbook = (message: string) => [
    `    - alias: ${q(label)}`,
    `      action: logbook.log`,
    `      data:`,
    `        name: "NeuroLjus"`,
    `        message: ${q(message)}`,
  ];

  switch (step.command) {
    case "lower_light":
      return [
        `    - alias: ${q(`${label} → ${environment.light}%`)}`,
        `      action: light.turn_on`,
        `      target:`,
        `        entity_id: ${entities.light}`,
        `      data:`,
        `        brightness_pct: ${environment.light}`,
        `        color_temp_kelvin: ${WARM_KELVIN}`,
        `        transition: ${seconds}`,
      ];
    case "reduce_sound":
      return [
        `    - alias: ${q(`${label} → ${environment.sound}%`)}`,
        `      action: media_player.volume_set`,
        `      target:`,
        `        entity_id: ${entities.mediaPlayer}`,
        `      data:`,
        `        volume_level: ${Math.round(environment.sound) / 100}`,
      ];
    case "notify_caregiver":
      return [
        `    - alias: ${q(label)}`,
        `      action: ${entities.notify}`,
        `      data:`,
        `        title: "NeuroLjus"`,
        `        message: ${q(input.notifyMessage)}`,
      ];
    case "log_observation":
      return logbook(`${input.routine} (${input.scenario}): routine completed. care_command_protocol_v0`);
    default:
      return logbook(input.caregiverNotes[step.command] ?? step.reason);
  }
}

/** Deterministic Home Assistant script for one planned routine. */
export function homeAssistantScript(input: HomeScriptInput): string {
  const id = `neuroljus_${input.scenario}`;
  const lines: string[] = [
    `# NeuroLjus Companion · care_command_protocol_v0`,
    `# ${input.routine} (${input.scenario})`,
    `# Paste into scripts.yaml. Generated locally: no tokens, the web never calls your house.`,
    `# Run it by hand; stop it any time with script.turn_off (caregiver_pause).`,
    `${id}:`,
    `  alias: ${q(`NeuroLjus · ${input.routine}`)}`,
    `  mode: single`,
    `  sequence:`,
  ];

  let clock = 0;
  for (const step of input.steps) {
    const wait = step.offsetMinutes - clock;
    if (wait > 0) lines.push(`    - delay: ${q(hms(wait))}`);
    clock = Math.max(clock, step.offsetMinutes);
    lines.push(...stepYaml(step, input));
  }
  return lines.join("\n") + "\n";
}
