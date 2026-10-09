/**
 * Optional care-reflection providers.
 * Labs and the protocol engine do not depend on these.
 */

import {
  formatScientificSimulation,
  type VisionMetricsInput,
} from "@/lib/nlVision/scientificReflection";

export type ReflectionProvider = "none" | "openai" | "anthropic";
export type ReflectionLang = "sv" | "en" | "es";

/**
 * Default Anthropic model. The previous default (claude-sonnet-4-20250514) was
 * retired by Anthropic on 2026-06-15 and now answers every request with 404,
 * which the chat route surfaced as a 502. Override with ANTHROPIC_MODEL.
 */
export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5-5";

/**
 * Care Chat engine. Claude (Anthropic) is the default; OpenAI stays available
 * as an alternative adapter; "none" keeps the chat fully local.
 */
export function getReflectionProvider(): ReflectionProvider {
  const raw = (process.env.CARE_REFLECTION_PROVIDER || "anthropic").trim().toLowerCase();
  if (raw === "none") return "none";
  if (raw === "openai") return "openai";
  return "anthropic";
}

export function getAnthropicModel(): string {
  const raw = (process.env.ANTHROPIC_MODEL || "").trim();
  return raw || DEFAULT_ANTHROPIC_MODEL;
}

export function offlineReflectionReply(
  lang: ReflectionLang,
  metrics?: VisionMetricsInput | null
): string {
  const simulation = formatScientificSimulation(metrics, lang);
  if (lang === "sv") {
    return (
      `${simulation}\n\n` +
      "Molnbaserad reflektionsassistent är avstängd (CARE_REFLECTION_PROVIDER=none). " +
      "Den lokala vetenskapliga signalsimuleringen ovan körs ändå. " +
      "Fortsätt i Observation Method, NL-VISION och care_command_protocol_v0 — utan att skicka vårdanteckningar till en extern modell."
    );
  }
  if (lang === "es") {
    return (
      `${simulation}\n\n` +
      "El asistente de reflexión en la nube está desactivado (CARE_REFLECTION_PROVIDER=none). " +
      "La simulación científica local de señales de arriba sigue activa. " +
      "Continúa en Observation Method, NL-VISION y care_command_protocol_v0 — sin enviar notas de cuidado a un modelo externo."
    );
  }
  return (
    `${simulation}\n\n` +
    "Cloud reflection assistant is off (CARE_REFLECTION_PROVIDER=none). " +
    "The local scientific signal simulation above still runs. " +
    "Continue in Observation Method, NL-VISION, and care_command_protocol_v0 — without sending care notes to an external model."
  );
}

/**
 * Reply used when the cloud provider is configured but unreachable or erroring.
 * The caregiver still gets the deterministic local reading instead of a bare error.
 */
export function degradedReflectionReply(
  lang: ReflectionLang,
  metrics?: VisionMetricsInput | null
): string {
  const simulation = formatScientificSimulation(metrics, lang);
  if (lang === "sv") {
    return (
      `${simulation}\n\n` +
      "Molnassistenten svarar inte just nu. Den lokala signalsimuleringen ovan gäller ändå — " +
      "fortsätt gärna i Observation Method och försök igen om en stund."
    );
  }
  if (lang === "es") {
    return (
      `${simulation}\n\n` +
      "El asistente en la nube no responde ahora mismo. La simulación local de señales de arriba sigue siendo válida — " +
      "continúa en Observation Method e inténtalo de nuevo en un momento."
    );
  }
  return (
    `${simulation}\n\n` +
    "The cloud assistant is not responding right now. The local signal simulation above still stands — " +
    "continue in Observation Method and try again in a moment."
  );
}

export type ReflectionChatMessage = { role: "user" | "assistant"; content: string };

export type AnthropicRequestBody = {
  model: string;
  max_tokens: number;
  system: string;
  messages: Array<{ role: "user"; content: string }>;
  output_config: { effort: "low" };
};

/**
 * Builds the Messages API body. The whole conversation is already rendered
 * inside `userContent` (same shape the OpenAI adapter sends), so it travels as
 * a single user turn. Sending the raw history as well used to put the chat's
 * assistant greeting first, which the API rejects with 400.
 */
export function buildAnthropicRequestBody(input: {
  system: string;
  userContent: string;
  maxTokens: number;
  model?: string;
}): AnthropicRequestBody {
  return {
    model: input.model || getAnthropicModel(),
    max_tokens: input.maxTokens,
    system: input.system,
    messages: [{ role: "user", content: input.userContent }],
    // Short caregiver chat: keep reasoning light so the output budget goes to the reply.
    output_config: { effort: "low" },
  };
}

type AnthropicResponsePayload = {
  error?: { type?: string; message?: string };
  stop_reason?: string;
  content?: Array<{ type?: string; text?: string }>;
};

export async function callAnthropicReflection(input: {
  apiKey: string;
  system: string;
  userContent: string;
  messages?: ReflectionChatMessage[];
  maxTokens: number;
  signal: AbortSignal;
  model?: string;
}): Promise<{ ok: true; content: string } | { ok: false; status: number; detail: string }> {
  const body = buildAnthropicRequestBody({
    system: input.system,
    userContent: input.userContent,
    maxTokens: input.maxTokens,
    model: input.model,
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
    },
    signal: input.signal,
    body: JSON.stringify(body),
  });

  let payload: AnthropicResponsePayload = {};
  try {
    payload = (await response.json()) as AnthropicResponsePayload;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const type = payload?.error?.type ? `${payload.error.type}: ` : "";
    return {
      ok: false,
      status: response.status,
      detail: `${type}${payload?.error?.message || "Anthropic request failed"} (model=${body.model})`,
    };
  }

  const text = (payload.content || [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return {
    ok: true,
    content:
      text ||
      "I'm having trouble processing that right now. Could you please try rephrasing your question?",
  };
}
