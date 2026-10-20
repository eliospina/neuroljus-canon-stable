/**
 * Care Agent — intent parser.
 *
 * Turns a caregiver's natural-language description (es / en / sv) into a
 * validated, partial PlannerInput. Claude interprets; everything it returns is
 * checked against the protocol enums and clamped to the planner's ranges.
 * Unknown or out-of-range values are discarded and the closest scenario preset
 * fills the gap. The envelope itself is never produced here: buildCarePlan()
 * does that deterministically.
 *
 * Safety: a description of physical risk, self-harm, a medical emergency or
 * anything that does not fit a care routine never plans automatic actions.
 * The result escalates: only notify_caregiver and log_observation remain.
 */

import type {
  Command,
  Environment,
  Pace,
  PlannerInput,
  SafetyException,
  ScenarioId,
  VisionSnapshot,
} from "./types";
import { scenarioPresets } from "./scenarios";
import { emergencyInfo } from "../emergency";

export type IntentLang = "sv" | "en" | "es";
export type Confidence = "low" | "medium" | "high";
export type IntentSource = "claude" | "fallback" | "risk_screen";

export type ParsedIntent = {
  scenario: ScenarioId;
  environment: Environment;
  allowedCommands: Command[];
  safetyExceptions: SafetyException[];
  durationMinutes: number;
  interpretation: string;
  confidence: Confidence;
  escalate: boolean;
  /** Fields Claude proposed that were dropped or clamped, for transparency. */
  discarded: string[];
};

export type IntentResult = {
  intent: ParsedIntent;
  source: IntentSource;
  /** Human-readable notice when the result did not come from a clean Claude run. */
  notice?: string;
};

/**
 * Anonymous summary of a routine that helped this person before, computed on
 * the device. Only enums and counts: no names, no free text, no dates.
 */
export type HelpfulRoutine = {
  scenario: ScenarioId;
  commands: Command[];
  helped: number;
  rated: number;
};

export const MAX_HELPFUL_ROUTINES = 3;

export const MAX_INTENT_TEXT_CHARS = 500;
export const INTENT_TIMEOUT_MS = 15_000;
export const DEFAULT_INTENT_MODEL = "claude-sonnet-5-5";

const SCENARIOS: ScenarioId[] = [
  "evening_transition",
  "sensory_overload",
  "possible_discomfort",
  "leaving_home",
  "meal_support",
  "school_arrival",
];
const COMMANDS: Command[] = [
  "lower_light",
  "reduce_sound",
  "step_back",
  "pause_interaction",
  "offer_visual_card",
  "notify_caregiver",
  "log_observation",
];
const EXCEPTIONS: SafetyException[] = [
  "rejection_signal",
  "unusual_movement",
  "caregiver_pause",
  "timeout",
  "unknown_event",
];
const PACES: Pace[] = ["slow", "steady", "adaptive"];
const CONFIDENCES: Confidence[] = ["low", "medium", "high"];

/** Commands that always stay in a plan: the caregiver is told, the run is recorded. */
const CLOSING_COMMANDS: Command[] = ["notify_caregiver", "log_observation"];
/** The only commands an escalated result may carry. */
export const ESCALATION_COMMANDS: Command[] = ["notify_caregiver", "log_observation"];
const ESCALATION_DURATION_MINUTES = 2;

/** Default (Sweden / EU) wording; protocol-from-text resolves the number from the caller's country. */
export const escalationMessages: Record<IntentLang, string> = {
  es: "Esto necesita a una persona. Si hay peligro, llama al 112.",
  en: "This needs a person. If there is danger, call 112.",
  sv: "Det här behöver en människa. Vid fara, ring 112.",
};

export function escalationMessageFor(lang: IntentLang, country: string | null | undefined): string {
  return emergencyInfo(country, lang).text;
}

const fallbackNotices: Record<IntentLang, string> = {
  es: "No se pudo contactar al asistente. Se usó el preset más cercano.",
  en: "The assistant could not be reached. The closest preset was used.",
  sv: "Assistenten kunde inte nås. Närmaste förinställning användes.",
};

const riskNotices: Record<IntentLang, string> = {
  es: "La descripción sugiere riesgo. No se planifica ninguna acción automática.",
  en: "The description suggests risk. No automatic action is planned.",
  sv: "Beskrivningen tyder på risk. Ingen automatisk åtgärd planeras.",
};

const fallbackInterpretations: Record<IntentLang, Record<ScenarioId, string>> = {
  es: {
    evening_transition: "Parece una transición hacia la noche: menos luz, menos estímulos, ritmo lento.",
    sensory_overload: "Parece sobrecarga sensorial: reducir sonido y luz, más espacio, pausa.",
    possible_discomfort: "Parece posible malestar: espacio y calma primero, el cuidador observa.",
    leaving_home: "Parece una salida de casa: orden visible de los pasos en la puerta.",
    meal_support: "Parece apoyo en una comida: menos presión de interacción durante la comida.",
    school_arrival: "Parece una llegada a la escuela: traspaso predecible y registro local.",
  },
  en: {
    evening_transition: "Looks like an evening transition: less light, fewer stimuli, slow pace.",
    sensory_overload: "Looks like sensory overload: reduce sound and light, more space, pause.",
    possible_discomfort: "Looks like possible discomfort: space and calm first, the caregiver observes.",
    leaving_home: "Looks like leaving home: a visible order of steps at the door.",
    meal_support: "Looks like meal support: less interaction pressure during the meal.",
    school_arrival: "Looks like school arrival: a predictable handoff with a local record.",
  },
  sv: {
    evening_transition: "Ser ut som en kvällsövergång: mindre ljus, färre stimuli, långsamt tempo.",
    sensory_overload: "Ser ut som sensorisk överbelastning: mindre ljud och ljus, mer utrymme, paus.",
    possible_discomfort: "Ser ut som möjligt obehag: utrymme och lugn först, vårdgivaren observerar.",
    leaving_home: "Ser ut som att lämna hemmet: synlig ordning på stegen vid dörren.",
    meal_support: "Ser ut som måltidsstöd: mindre interaktionstryck under måltiden.",
    school_arrival: "Ser ut som skolankomst: förutsägbar överlämning med lokal logg.",
  },
};

/**
 * Local, deterministic screen for descriptions that must never plan automatic
 * actions. Runs before any network call, in the three site languages.
 *
 * Word edges are Unicode lookarounds, not \b: in JavaScript \b and \w only know
 * ASCII letters, so "se cayó" never matched and "sangró" only matched by luck.
 * "fell asleep" / "föll i sömn" are not falls.
 */
const RISK_PATTERNS: RegExp[] = [
  // es
  /(?<![\p{L}\p{N}])(sangr\p{L}*|se golpea|golpe[aá]ndose|se muerde|se hace da[ñn]o|autolesi\p{L}*|no respira|convulsi\p{L}*|inconsciente|se ahog\p{L}*|atragant\p{L}*|se cay[oó]|ca[ií]da|quemad\p{L}*|cuchillo|pastillas|medicament\p{L}*|desmay\p{L}*|emergencia|urgencias)(?![\p{L}\p{N}])/iu,
  // en
  /(?<![\p{L}\p{N}])(blood|bleed\p{L}*|hits? (him|her|them)self|hitting (him|her|them)self|self[- ]?harm\p{L}*|not breathing|seizure\p{L}*|unconscious|chok\p{L}*|fell(?!\s+asleep)|fall\p{L}* down|burn\p{L}*|knife|overdose|pills|faint\p{L}*|emergency|911)(?![\p{L}\p{N}])/iu,
  // sv
  /(?<![\p{L}\p{N}])(blod\p{L}*|bl[öo]der|sl[åa]r sig|sl[åa]r huvudet|skadar sig|andas inte|kramp\p{L}*|medvetsl[öo]s|kv[äa]v\p{L}*|s[äa]tter i halsen|ramla\p{L}*|f[öo]ll(?!\s+i\s+s[öo]mn)|br[äa]nnskad\p{L}*|kniv|tabletter|svimma\p{L}*|n[öo]dl[äa]ge)(?![\p{L}\p{N}])/iu,
  /(?<![\p{L}\p{N}])112(?![\p{L}\p{N}])/u,
];

export function localRiskScreen(text: string): boolean {
  const t = text.normalize("NFC");
  return RISK_PATTERNS.some((pattern) => pattern.test(t));
}

/** Keyword guess used when Claude is unavailable. Never claims certainty. */
const SCENARIO_HINTS: Array<[ScenarioId, RegExp]> = [
  ["school_arrival", /\b(escuela|colegio|school|skola\w*|f[öo]rskola\w*|clase|klass)\b/i],
  ["leaving_home", /\b(salir|puerta|leav\w*|door|g[åa] ut|d[öo]rr\w*|l[äa]mna|zapatos|shoes|skor)\b/i],
  ["meal_support", /\b(com(er|ida|iendo)|cen(a|ar)\w*|desayun\w*|almuerz\w*|meal|eat\w*|lunch|dinner|breakfast|mat(en|sal|bord)?|[äa]ta|middag|frukost)\b/i],
  ["possible_discomfort", /\b(dolor|duele|molest\w*|pain|hurt\w*|discomfort|ont|sm[äa]rta|obehag)\b/i],
  ["evening_transition", /\b(noche|dormir|cama|evening|night|sleep|bed|kv[äa]ll\w*|sova|s[äa]ng|natt)\b/i],
  ["sensory_overload", /\b(ruido|gente|o[ií]dos|luz|sonido|loud|noise|people|ears|light|sound|crowd\w*|ljud|folk|[öo]ron|ljus|m[åa]nga)\b/i],
];

export function guessScenario(text: string): ScenarioId {
  for (const [scenario, pattern] of SCENARIO_HINTS) {
    if (pattern.test(text)) return scenario;
  }
  return "sensory_overload";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function finiteNumber(input: unknown): number | null {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string" && input.trim() !== "") {
    const n = Number(input);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pickEnum<T extends string>(input: unknown, allowed: readonly T[]): T | null {
  return typeof input === "string" && (allowed as readonly string[]).includes(input)
    ? (input as T)
    : null;
}

function pickEnumList<T extends string>(input: unknown, allowed: readonly T[]): { kept: T[]; dropped: string[] } {
  const kept: T[] = [];
  const dropped: string[] = [];
  if (!Array.isArray(input)) return { kept, dropped };
  for (const item of input) {
    const value = pickEnum(item, allowed);
    if (value && !kept.includes(value)) kept.push(value);
    else if (!value) dropped.push(String(item));
  }
  return { kept, dropped };
}

function unionKeepOrder<T>(base: T[], extra: T[]): T[] {
  const out = [...base];
  for (const item of extra) if (!out.includes(item)) out.push(item);
  return out;
}

function count(input: unknown): number | null {
  const n = finiteNumber(input);
  return n === null ? null : clamp(Math.round(n), 0, 999);
}

/** Validate the client's history summary. Anything not an enum or a count is dropped. */
export function sanitizeHelpfulRoutines(raw: unknown): HelpfulRoutine[] {
  if (!Array.isArray(raw)) return [];
  const out: HelpfulRoutine[] = [];
  for (const item of raw) {
    if (out.length >= MAX_HELPFUL_ROUTINES) break;
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const scenario = pickEnum(o.scenario, SCENARIOS);
    const commands = pickEnumList(o.commands, COMMANDS).kept;
    const helped = count(o.helped);
    const rated = count(o.rated);
    if (!scenario || commands.length === 0 || helped === null || rated === null || helped > rated) continue;
    out.push({ scenario, commands, helped, rated });
  }
  return out;
}

/** The user-turn text Claude sees. History, when present, is only enums and counts. */
export function buildIntentUserMessage(text: string, history: HelpfulRoutine[] = []): string {
  const lines = [`Caregiver description:\n${text}`];
  if (history.length > 0) {
    lines.push(
      "",
      "Routines that helped this person before (anonymous local history; prefer them when the description fits, never against safety rules):",
      ...history.map(
        (h) => `- ${h.scenario} with [${h.commands.join(", ")}]: helped ${h.helped} of ${h.rated} rated runs`
      )
    );
  }
  return lines.join("\n");
}

/** Escalated intents keep the preset environment and only the closing commands. */
export function escalatedIntent(
  scenario: ScenarioId,
  lang: IntentLang,
  interpretation?: string,
  discarded: string[] = [],
  country: string | null = null
): ParsedIntent {
  const preset = scenarioPresets[scenario];
  return {
    scenario,
    environment: { ...preset.environment },
    allowedCommands: [...ESCALATION_COMMANDS],
    safetyExceptions: unionKeepOrder(preset.exceptions, ["caregiver_pause", "unknown_event"]),
    durationMinutes: ESCALATION_DURATION_MINUTES,
    interpretation: interpretation?.trim() || (country ? escalationMessageFor(lang, country) : escalationMessages[lang]),
    confidence: "high",
    escalate: true,
    discarded,
  };
}

/**
 * Validate whatever Claude returned. Anything unknown or out of range is
 * dropped and replaced by the closest preset value. Pure and deterministic.
 */
export function sanitizeIntent(raw: unknown, text: string, lang: IntentLang): ParsedIntent {
  const discarded: string[] = [];
  const obj = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  if (Object.keys(obj).length === 0) discarded.push("response:not_an_object");

  let scenario = pickEnum(obj.scenario, SCENARIOS);
  if (!scenario) {
    if (obj.scenario !== undefined) discarded.push(`scenario:${String(obj.scenario)}`);
    scenario = guessScenario(text);
  }
  const preset = scenarioPresets[scenario];

  const escalate = obj.escalate === true;
  const interpretation =
    typeof obj.interpretation === "string" && obj.interpretation.trim()
      ? obj.interpretation.trim().slice(0, 240)
      : fallbackInterpretations[lang][scenario];

  if (escalate) return escalatedIntent(scenario, lang, interpretation, discarded);

  const envIn = obj.environment && typeof obj.environment === "object" ? (obj.environment as Record<string, unknown>) : {};
  const environment: Environment = { ...preset.environment };
  const light = finiteNumber(envIn.light);
  if (light === null) {
    if (envIn.light !== undefined) discarded.push(`environment.light:${String(envIn.light)}`);
  } else {
    const c = clamp(Math.round(light), 0, 100);
    if (c !== light) discarded.push(`environment.light:clamped ${light}→${c}`);
    environment.light = c;
  }
  const sound = finiteNumber(envIn.sound);
  if (sound === null) {
    if (envIn.sound !== undefined) discarded.push(`environment.sound:${String(envIn.sound)}`);
  } else {
    const c = clamp(Math.round(sound), 0, 100);
    if (c !== sound) discarded.push(`environment.sound:clamped ${sound}→${c}`);
    environment.sound = c;
  }
  const distance = finiteNumber(envIn.distance);
  if (distance === null) {
    if (envIn.distance !== undefined) discarded.push(`environment.distance:${String(envIn.distance)}`);
  } else {
    const c = clamp(Math.round(distance * 10) / 10, 0.5, 4);
    if (c !== distance) discarded.push(`environment.distance:clamped ${distance}→${c}`);
    environment.distance = c;
  }
  const pace = pickEnum(envIn.pace, PACES);
  if (pace) environment.pace = pace;
  else if (envIn.pace !== undefined) discarded.push(`environment.pace:${String(envIn.pace)}`);

  const commands = pickEnumList(obj.allowed_commands, COMMANDS);
  for (const d of commands.dropped) discarded.push(`allowed_commands:${d}`);
  const allowedCommands = unionKeepOrder(
    commands.kept.length > 0 ? commands.kept : [...preset.commands],
    CLOSING_COMMANDS
  );

  const exceptions = pickEnumList(obj.safety_exceptions, EXCEPTIONS);
  for (const d of exceptions.dropped) discarded.push(`safety_exceptions:${d}`);
  // Caregiver-authored safety exceptions are a floor, never reduced by the model.
  const safetyExceptions = unionKeepOrder([...preset.exceptions], exceptions.kept);

  let durationMinutes = preset.duration;
  const duration = finiteNumber(obj.duration_minutes);
  if (duration === null) {
    if (obj.duration_minutes !== undefined) discarded.push(`duration_minutes:${String(obj.duration_minutes)}`);
  } else {
    const c = clamp(Math.round(duration), 1, 45);
    if (c !== duration) discarded.push(`duration_minutes:clamped ${duration}→${c}`);
    durationMinutes = c;
  }

  const confidence = pickEnum(obj.confidence, CONFIDENCES) ?? "low";
  if (!pickEnum(obj.confidence, CONFIDENCES) && obj.confidence !== undefined) {
    discarded.push(`confidence:${String(obj.confidence)}`);
  }

  return {
    scenario,
    environment,
    allowedCommands,
    safetyExceptions,
    durationMinutes,
    interpretation,
    confidence,
    escalate: false,
    discarded,
  };
}

/** Preset-only result for when Claude is off or unreachable. */
export function fallbackIntent(text: string, lang: IntentLang): ParsedIntent {
  const scenario = guessScenario(text);
  const preset = scenarioPresets[scenario];
  return {
    scenario,
    environment: { ...preset.environment },
    allowedCommands: unionKeepOrder([...preset.commands], CLOSING_COMMANDS),
    safetyExceptions: [...preset.exceptions],
    durationMinutes: preset.duration,
    interpretation: fallbackInterpretations[lang][scenario],
    confidence: "low",
    escalate: false,
    discarded: [],
  };
}

/** Merge a parsed intent with the preset copy into a full PlannerInput. */
export function plannerInputFromIntent(
  intent: ParsedIntent,
  visionContext: VisionSnapshot | null
): PlannerInput {
  const preset = scenarioPresets[intent.scenario];
  return {
    scenario: intent.scenario,
    routineName: intent.escalate ? `${preset.name} — escalated` : preset.name,
    careGoal: intent.escalate
      ? "Hand over to a person. Notify the caregiver and record the observation; no automatic action."
      : preset.careGoal,
    visualCard: intent.escalate ? "A person is coming." : preset.visualCard,
    durationMinutes: intent.durationMinutes,
    environment: { ...intent.environment },
    allowedCommands: [...intent.allowedCommands],
    safetyExceptions: [...intent.safetyExceptions],
    visionContext,
  };
}

// ---------------------------------------------------------------------------
// Claude call (raw Messages API, same pattern as careReflection/provider.ts)
// ---------------------------------------------------------------------------

const INTENT_SCHEMA = {
  type: "object",
  properties: {
    scenario: { type: "string", enum: SCENARIOS },
    escalate: { type: "boolean" },
    confidence: { type: "string", enum: CONFIDENCES },
    interpretation: { type: "string" },
    environment: {
      type: "object",
      properties: {
        light: { type: "number" },
        sound: { type: "number" },
        distance: { type: "number" },
        pace: { type: "string", enum: PACES },
      },
      required: ["light", "sound", "distance", "pace"],
      additionalProperties: false,
    },
    allowed_commands: { type: "array", items: { type: "string", enum: COMMANDS } },
    safety_exceptions: { type: "array", items: { type: "string", enum: EXCEPTIONS } },
    duration_minutes: { type: "number" },
  },
  required: [
    "scenario",
    "escalate",
    "confidence",
    "interpretation",
    "environment",
    "allowed_commands",
    "safety_exceptions",
    "duration_minutes",
  ],
  additionalProperties: false,
} as const;

function presetTable(): string {
  return SCENARIOS.map((id) => {
    const p = scenarioPresets[id];
    return (
      `- ${id}: "${p.careGoal}" · light ${p.environment.light}% · sound ${p.environment.sound}% · ` +
      `distance ${p.environment.distance} m · pace ${p.environment.pace} · ${p.duration} min · ` +
      `commands [${p.commands.join(", ")}] · exceptions [${p.exceptions.join(", ")}]`
    );
  }).join("\n");
}

export function buildIntentSystemPrompt(lang: IntentLang): string {
  const langName = lang === "es" ? "Spanish" : lang === "sv" ? "Swedish" : "English";
  return (
    "You are the Neuroljus Care Agent intent parser. A caregiver describes, in Spanish, English or Swedish, " +
    "what is happening right now with a non-speaking or neurodivergent person. You map that description onto " +
    "care_command_protocol_v0 settings. A deterministic planner builds the protocol afterwards; you only choose settings.\n\n" +
    "Scenario presets (start from the closest one and move targets only when the description justifies it):\n" +
    presetTable() +
    "\n\nCommands: lower_light (room light toward target), reduce_sound (sound toward target), step_back (more personal space), " +
    "pause_interaction (hold interaction pressure), offer_visual_card (show the routine card), notify_caregiver (tell the caregiver), " +
    "log_observation (local audit record). Safety exceptions: rejection_signal, unusual_movement, caregiver_pause, timeout, unknown_event.\n\n" +
    "Rules:\n" +
    "1. Never diagnose, never label emotions, never claim to know what the person feels. Describe observable context only.\n" +
    "2. Light and sound are percentages 0-100 (lower = dimmer/quieter). Distance is meters 0.5-4 (the assistive device keeps that space). Duration is minutes 1-45.\n" +
    "3. Keep notify_caregiver and log_observation in allowed_commands. Only list commands that fit the description.\n" +
    "4. ESCALATE (escalate=true) when the text describes physical risk, self-injury, bleeding, choking, falls, seizures, an unresponsive person, " +
    "a medical emergency, abuse, or anything that is not a care routine. When escalating, a person must act; set allowed_commands to " +
    "[\"notify_caregiver\",\"log_observation\"] and keep the preset environment.\n" +
    "5. interpretation: one short sentence (max 160 characters) in the language of the caregiver's text (fallback: " +
    langName +
    ") saying what you understood and which routine you chose. No advice, no diagnosis.\n" +
    "6. confidence: high when the description clearly matches one preset, medium when plausible, low when guessing.\n" +
    "Respond only with the JSON object."
  );
}

type AnthropicPayload = {
  error?: { type?: string; message?: string };
  stop_reason?: string;
  content?: Array<{ type?: string; text?: string }>;
};

export type ClaudeIntentResult =
  | { ok: true; raw: unknown; refusal: false }
  | { ok: true; raw: null; refusal: true }
  | { ok: false; status: number; detail: string };

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function callClaudeIntent(input: {
  apiKey: string;
  text: string;
  lang: IntentLang;
  signal: AbortSignal;
  model?: string;
  fetchImpl?: typeof fetch;
  history?: HelpfulRoutine[];
}): Promise<ClaudeIntentResult> {
  const doFetch = input.fetchImpl ?? fetch;
  const model = input.model || (process.env.ANTHROPIC_MODEL || "").trim() || DEFAULT_INTENT_MODEL;
  const system = buildIntentSystemPrompt(input.lang);

  const request = (structured: boolean) =>
    doFetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": input.apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: input.signal,
      body: JSON.stringify({
        model,
        max_tokens: 600,
        system,
        messages: [{ role: "user", content: buildIntentUserMessage(input.text, input.history) }],
        output_config: structured
          ? { effort: "low", format: { type: "json_schema", schema: INTENT_SCHEMA } }
          : { effort: "low" },
      }),
    });

  let response = await request(true);
  let payload: AnthropicPayload = {};
  try {
    payload = (await response.json()) as AnthropicPayload;
  } catch {
    payload = {};
  }

  // Older models or proxies may reject output_config.format: retry once as plain JSON.
  if (response.status === 400 && /output_config|format|schema/i.test(payload?.error?.message || "")) {
    response = await request(false);
    try {
      payload = (await response.json()) as AnthropicPayload;
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      detail: `${payload?.error?.type ? `${payload.error.type}: ` : ""}${payload?.error?.message || "Anthropic request failed"} (model=${model})`,
    };
  }

  if (payload.stop_reason === "refusal") return { ok: true, raw: null, refusal: true };

  const text = (payload.content || [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n")
    .trim();
  const raw = extractJson(text);
  if (raw === null) return { ok: false, status: 502, detail: "Anthropic reply was not valid JSON" };
  return { ok: true, raw, refusal: false };
}

/**
 * Full pipeline: risk screen → Claude → sanitize, with preset fallback.
 * Never throws; never logs the caregiver text.
 */
export async function parseCareIntent(input: {
  text: string;
  lang: IntentLang;
  apiKey?: string | null;
  model?: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  history?: HelpfulRoutine[];
  /** ISO country code of the caller, for the emergency number in escalations. */
  country?: string | null;
  onError?: (status: number, detail: string) => void;
}): Promise<IntentResult> {
  const text = input.text.trim().slice(0, MAX_INTENT_TEXT_CHARS);
  const lang = input.lang;
  const country = input.country ?? null;

  if (localRiskScreen(text)) {
    return {
      intent: escalatedIntent(guessScenario(text), lang, undefined, [], country),
      source: "risk_screen",
      notice: riskNotices[lang],
    };
  }

  if (!input.apiKey) {
    return { intent: fallbackIntent(text, lang), source: "fallback", notice: fallbackNotices[lang] };
  }

  try {
    const result = await callClaudeIntent({
      apiKey: input.apiKey,
      text,
      lang,
      model: input.model,
      signal: input.signal ?? new AbortController().signal,
      fetchImpl: input.fetchImpl,
      history: sanitizeHelpfulRoutines(input.history),
    });

    if (!result.ok) {
      input.onError?.(result.status, result.detail);
      return { intent: fallbackIntent(text, lang), source: "fallback", notice: fallbackNotices[lang] };
    }
    if (result.refusal) {
      return {
        intent: escalatedIntent(guessScenario(text), lang, undefined, [], country),
        source: "claude",
        notice: riskNotices[lang],
      };
    }
    const intent = sanitizeIntent(result.raw, text, lang);
    return intent.escalate
      ? { intent, source: "claude", notice: riskNotices[lang] }
      : { intent, source: "claude" };
  } catch (error) {
    input.onError?.(0, error instanceof Error ? error.name : "unknown error");
    return { intent: fallbackIntent(text, lang), source: "fallback", notice: fallbackNotices[lang] };
  }
}
