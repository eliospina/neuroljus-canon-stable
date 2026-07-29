/**
 * Optional care-reflection providers.
 * Labs and the protocol engine do not depend on these.
 */

export type ReflectionProvider = "none" | "openai" | "anthropic";

export function getReflectionProvider(): ReflectionProvider {
  const raw = (process.env.CARE_REFLECTION_PROVIDER || "openai").trim().toLowerCase();
  if (raw === "none") return "none";
  if (raw === "anthropic") return "anthropic";
  return "openai";
}

export function offlineReflectionReply(lang: "sv" | "en" | "es"): string {
  if (lang === "sv") {
    return (
      "Molnbaserad reflektionsassistent är avstängd (CARE_REFLECTION_PROVIDER=none). " +
      "Neuroljus kärna är lokal: Observation Method, NL-VISION-signaler och care_command_protocol_v0. " +
      "Skriv anteckningar i metoden, bifoga lokala signaler om du vill, och bygg protokollet i labs — utan att skicka vårdanteckningar till en extern modell."
    );
  }
  if (lang === "es") {
    return (
      "El asistente de reflexión en la nube está desactivado (CARE_REFLECTION_PROVIDER=none). " +
      "El núcleo de Neuroljus es local: Observation Method, señales NL-VISION y care_command_protocol_v0. " +
      "Escribe notas en el método, adjunta señales locales si quieres, y construye el protocolo en los labs — sin enviar notas de cuidado a un modelo externo."
    );
  }
  return (
    "Cloud reflection assistant is off (CARE_REFLECTION_PROVIDER=none). " +
    "Neuroljus core is local: Observation Method, NL-VISION signals, and care_command_protocol_v0. " +
    "Write notes in the method, attach local signals if useful, and build the protocol in the labs — without sending care notes to an external model."
  );
}

export type ReflectionChatMessage = { role: "user" | "assistant"; content: string };

export async function callAnthropicReflection(input: {
  apiKey: string;
  system: string;
  userContent: string;
  messages: ReflectionChatMessage[];
  maxTokens: number;
  signal: AbortSignal;
}): Promise<{ ok: true; content: string } | { ok: false; status: number; detail: string }> {
  const history = input.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
    },
    signal: input.signal,
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: input.maxTokens,
      temperature: 0.3,
      system: input.system,
      messages: [
        ...history,
        {
          role: "user",
          content: input.userContent,
        },
      ],
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    content?: Array<{ type?: string; text?: string }>;
  };

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      detail: payload?.error?.message || "Anthropic request failed",
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
