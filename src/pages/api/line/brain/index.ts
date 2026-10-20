// src/pages/api/line/brain/index.ts
//
// The brain of the voice line (ElevenLabs Custom LLM). POST = Chat Completions,
// GET = keep-warm health check. See src/lib/line/brainHttp.ts.

import { brainHandler } from "@/lib/line/brainHttp";

// Next.js reads this literal statically: it must stay inline (same values as brainRouteConfig).
export const config = { maxDuration: 30, supportsResponseStreaming: true, api: { bodyParser: { sizeLimit: "256kb" } } };
export default brainHandler;
