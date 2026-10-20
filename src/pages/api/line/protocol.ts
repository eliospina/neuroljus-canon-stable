// src/pages/api/line/protocol.ts
//
// Voice line tool: crisis protocol. Deterministic, no network. The risk screen
// puts the country's emergency line first. The situation is never logged.

import { parseCountry, parseLang, lineEndpoint, MAX_SITUATION_CHARS, textField } from "@/lib/line/http";
import { buildLineProtocol } from "@/lib/line/protocol";
import { PHASE_IDS, PROTOCOL_IDS, type PhaseId, type ProtocolId } from "@/lib/protocols";

export const config = { maxDuration: 10, api: { bodyParser: { sizeLimit: "16kb" } } };

export default lineEndpoint("protocol", { env: "LINE_RATE_LIMIT_PER_MIN", fallback: 60 }, async (body, req, res) => {
  const situation = textField(body, "situation");
  if (!situation) return void res.status(400).json({ ok: false, error: "situation is required." });
  if (situation.length > MAX_SITUATION_CHARS) return void res.status(400).json({ ok: false, error: "situation is too long." });

  const phase = PHASE_IDS.find((p) => p === body.phase) as PhaseId | undefined;
  const protocolId = PROTOCOL_IDS.find((p) => p === body.protocol) as ProtocolId | undefined;
  const result = buildLineProtocol({ situation, lang: parseLang(body.lang), country: parseCountry(body.country, req), phase, protocolId });
  res.status(200).json(result);
});
