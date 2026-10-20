// ElevenLabs appends /chat/completions to the Custom LLM server URL.
import { brainHandler } from "@/lib/line/brainHttp";

// Next.js reads this literal statically: it must stay inline (same values as brainRouteConfig).
export const config = { maxDuration: 30, supportsResponseStreaming: true, api: { bodyParser: { sizeLimit: "256kb" } } };
export default brainHandler;
