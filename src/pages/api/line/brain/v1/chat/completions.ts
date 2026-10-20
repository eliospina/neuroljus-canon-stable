// Same brain when the server URL is given with /v1 (OpenAI style).
import { brainHandler } from "@/lib/line/brainHttp";

// Next.js reads this literal statically: it must stay inline (same values as brainRouteConfig).
export const config = { maxDuration: 30, supportsResponseStreaming: true, api: { bodyParser: { sizeLimit: "256kb" } } };
export default brainHandler;
