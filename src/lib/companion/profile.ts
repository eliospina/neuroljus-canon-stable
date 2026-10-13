/**
 * Companion — the person's sensory profile, and its deterministic fusion
 * with a plan.
 *
 * The profile is made with the person, or by the person (tapping pictograms
 * works for non-speaking people). It is a hard limit: whatever Claude or a
 * preset proposes, the profile wins. The fusion only ever removes stimulation
 * or adds safety; it never adds an action, never removes notify_caregiver or
 * log_observation, never removes a safety exception. Pure and deterministic.
 *
 * The profile lives only on the device (localStorage) and is never sent to
 * the server.
 */

import type { Command, PlannerInput, SafetyException } from "../careProtocol/types";

export type CalmingSound = "soft_noise" | "silence";
export type BotheringSound = "voices" | "music" | "loud_sudden" | "hum";
export type LightPreference = "very_soft" | "soft" | "normal";
export type PauseVoice = "silence" | "soft_voice";
export type SpacePreference = "more_space" | "close_ok";
export type CalmItem =
  | "headphones"
  | "soft_toy"
  | "blanket"
  | "water"
  | "window"
  | "music"
  | "tablet"
  | "fidget";

export type SensoryProfile = {
  version: 1;
  /** Shown only on this device. Never sent anywhere. */
  name: string;
  calmingSound: CalmingSound;
  botheringSounds: BotheringSound[];
  light: LightPreference;
  pauseVoice: PauseVoice;
  space: SpacePreference;
  visualCards: boolean;
  calmItem: CalmItem | null;
};

export const CALMING_SOUNDS: CalmingSound[] = ["soft_noise", "silence"];
export const BOTHERING_SOUNDS: BotheringSound[] = ["voices", "music", "loud_sudden", "hum"];
export const LIGHT_PREFERENCES: LightPreference[] = ["very_soft", "soft", "normal"];
export const PAUSE_VOICES: PauseVoice[] = ["silence", "soft_voice"];
export const SPACE_PREFERENCES: SpacePreference[] = ["more_space", "close_ok"];
export const CALM_ITEMS: CalmItem[] = [
  "headphones",
  "soft_toy",
  "blanket",
  "water",
  "window",
  "music",
  "tablet",
  "fidget",
];

/** Light ceilings (percent) for each preference. */
export const LIGHT_CEILING: Record<LightPreference, number> = { very_soft: 20, soft: 45, normal: 100 };
/** Minimum distance (meters) when the person wants more space. */
export const MORE_SPACE_MIN_DISTANCE = 2;

export const PROFILE_KEY = "neuroljus.companion.profile.v1";
const MAX_NAME = 40;

export function defaultProfile(): SensoryProfile {
  return {
    version: 1,
    name: "",
    calmingSound: "soft_noise",
    botheringSounds: [],
    light: "soft",
    pauseVoice: "silence",
    space: "more_space",
    visualCards: true,
    calmItem: null,
  };
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Validate anything (localStorage, an imported JSON file). Unknown values fall back to defaults. */
export function sanitizeProfile(raw: unknown): SensoryProfile | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const d = defaultProfile();
  const bothering = Array.isArray(o.botheringSounds)
    ? BOTHERING_SOUNDS.filter((s) => (o.botheringSounds as unknown[]).includes(s))
    : [];
  return {
    version: 1,
    name: typeof o.name === "string" ? o.name.replace(/[\u0000-\u001f]/g, "").trim().slice(0, MAX_NAME) : "",
    calmingSound: pick(o.calmingSound, CALMING_SOUNDS, d.calmingSound),
    botheringSounds: bothering,
    light: pick(o.light, LIGHT_PREFERENCES, d.light),
    pauseVoice: pick(o.pauseVoice, PAUSE_VOICES, d.pauseVoice),
    space: pick(o.space, SPACE_PREFERENCES, d.space),
    visualCards: typeof o.visualCards === "boolean" ? o.visualCards : d.visualCards,
    calmItem: typeof o.calmItem === "string" ? pick(o.calmItem, CALM_ITEMS, "headphones") : null,
  };
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readProfile(storage: StorageLike): SensoryProfile | null {
  try {
    return sanitizeProfile(JSON.parse(storage.getItem(PROFILE_KEY) || "null"));
  } catch {
    return null;
  }
}

export function writeProfile(storage: StorageLike, profile: SensoryProfile): void {
  storage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function deleteProfile(storage: StorageLike): void {
  storage.removeItem(PROFILE_KEY);
}

/** One reason the profile changed (or annotated) the plan. Rendered per language in the UI. */
export type ProfileConstraint =
  | { kind: "light_capped"; from: number; to: number }
  | { kind: "more_space"; from: number; to: number }
  | { kind: "no_noise"; because: "silence" | "hum" }
  | { kind: "no_cards" }
  | { kind: "no_voice" }
  | { kind: "avoid_sounds"; sounds: BotheringSound[] }
  | { kind: "calm_item"; item: CalmItem }
  | { kind: "rejection_stops" };

export type ProfileFusion = {
  input: PlannerInput;
  constraints: ProfileConstraint[];
  /** What the phone body may do under this profile. */
  phone: { noise: boolean };
};

const PROTECTED_COMMANDS: Command[] = ["notify_caregiver", "log_observation"];
const PROFILE_EXCEPTIONS: SafetyException[] = ["rejection_signal", "caregiver_pause"];

/**
 * Fuse a profile into a planner input. The profile always wins: it can only
 * lower stimulation, add distance, drop commands it rules out and add safety
 * exceptions. Same input → same output.
 */
export function applyProfile(input: PlannerInput, profile: SensoryProfile | null): ProfileFusion {
  if (!profile) return { input, constraints: [], phone: { noise: true } };

  const constraints: ProfileConstraint[] = [];
  const environment = { ...input.environment };

  const ceiling = LIGHT_CEILING[profile.light];
  if (environment.light > ceiling) {
    constraints.push({ kind: "light_capped", from: environment.light, to: ceiling });
    environment.light = ceiling;
  }

  if (profile.space === "more_space" && environment.distance < MORE_SPACE_MIN_DISTANCE) {
    constraints.push({ kind: "more_space", from: environment.distance, to: MORE_SPACE_MIN_DISTANCE });
    environment.distance = MORE_SPACE_MIN_DISTANCE;
  }

  let noise = true;
  if (profile.calmingSound === "silence") {
    noise = false;
    constraints.push({ kind: "no_noise", because: "silence" });
  } else if (profile.botheringSounds.includes("hum")) {
    noise = false;
    constraints.push({ kind: "no_noise", because: "hum" });
  }

  let allowedCommands = [...input.allowedCommands];
  if (!profile.visualCards && allowedCommands.includes("offer_visual_card")) {
    allowedCommands = allowedCommands.filter((c) => c !== "offer_visual_card");
    constraints.push({ kind: "no_cards" });
  }
  // The profile may remove stimulation, never the caregiver notice or the record.
  for (const c of PROTECTED_COMMANDS) {
    if (input.allowedCommands.includes(c) && !allowedCommands.includes(c)) allowedCommands.push(c);
  }

  if (profile.pauseVoice === "silence") constraints.push({ kind: "no_voice" });
  const avoid = profile.botheringSounds.filter((s) => s !== "hum");
  if (avoid.length > 0) constraints.push({ kind: "avoid_sounds", sounds: avoid });
  if (profile.calmItem) constraints.push({ kind: "calm_item", item: profile.calmItem });

  // The person's "no" always stops the routine.
  const safetyExceptions = [...input.safetyExceptions];
  for (const e of PROFILE_EXCEPTIONS) {
    if (!safetyExceptions.includes(e)) {
      safetyExceptions.push(e);
      if (e === "rejection_signal") constraints.push({ kind: "rejection_stops" });
    }
  }

  return {
    input: { ...input, environment, allowedCommands, safetyExceptions },
    constraints,
    phone: { noise },
  };
}
