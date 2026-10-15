import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: projectRoot,
  // Care Chat's Nemotron provider reads its system prompt from disk.
  outputFileTracingIncludes: { "/api/chat": ["./care_agent/PROMPT.md"] },
};
export default nextConfig;
