/**
 * Voice line: web search restricted to autism and to a list of international
 * health and research domains. Uses Anthropic's server-side web search tool
 * (the key comes from ANTHROPIC_API_KEY in Vercel, never from the repo).
 * Blocked whenever the local risk screen detects a crisis.
 */

import { localRiskScreen } from "../careProtocol/intentParser";
import { dangerSentence, type EmergencyLang } from "../emergency";
import { clinicianSentence, firstSentences, MEDICATION_ASK } from "./spoken";

export const LINE_SEARCH_TIMEOUT_MS = 9_000;
export const MAX_SEARCHES = 3;
const MAX_SENTENCES = 3;
const MAX_SOURCES = 2;

/**
 * Allowed domains (subdomains included). Public health bodies, clinical
 * guideline makers, autism charities with research arms, and the main
 * research indexes. Commercial, forum and social domains are left out.
 */
export const ALLOWED_DOMAINS = [
  "who.int",
  "paho.org",
  "nice.org.uk",
  "cdc.gov",
  "nih.gov",
  "pubmed.ncbi.nlm.nih.gov",
  "pmc.ncbi.nlm.nih.gov",
  "europepmc.org",
  "cochranelibrary.com",
  "nhs.uk",
  "autistica.org.uk",
  "autism.org.uk",
  "aacap.org",
  "healthychildren.org",
  "1177.se",
  "socialstyrelsen.se",
  "sbu.se",
] as const;

const LANG_NAME: Record<EmergencyLang, string> = { es: "Spanish", en: "English", sv: "Swedish" };

export type SearchSource = { title: string; site: string };

export type LineSearchResult = {
  ok: true;
  mode: "web" | "risk" | "medication" | "none";
  risk: boolean;
  use_tool: "protocol" | null;
  /** At most three short sentences, plain text. */
  speech: string;
  /** One or two sources: page title and site. */
  sources: SearchSource[];
};

function searchSystemPrompt(lang: EmergencyLang): string {
  return (
    "You answer a caregiver's question about autism by voice, using ONLY what the web search returns from the allowed sites. " +
    `Answer in ${LANG_NAME[lang]}, in at most three short sentences of plain spoken words: no lists, no markdown, no links. ` +
    `Search at most ${MAX_SEARCHES} times and only about autism or autistic people; if the question is not about autism, say you can only help with autism. ` +
    "Never diagnose. Never mention medication or doses: a clinician decides. If the results do not answer the question, say so in one sentence and suggest asking a professional. " +
    "Say where it comes from in words (for example 'according to the NHS')."
  );
}

type WebBlock = {
  type?: string;
  text?: string;
  citations?: Array<{ type?: string; url?: string; title?: string }> | null;
};

function siteOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function parseSearch(content: WebBlock[]): { text: string; sources: SearchSource[] } {
  let text = "";
  const seen = new Set<string>();
  const sources: SearchSource[] = [];
  for (const b of content) {
    if (b.type !== "text" || typeof b.text !== "string") continue;
    text += b.text;
    for (const c of b.citations ?? []) {
      if (!c.url) continue;
      const site = siteOf(c.url);
      const allowed = ALLOWED_DOMAINS.some((d) => site === d || site.endsWith(`.${d}`));
      if (!site || !allowed || seen.has(c.url)) continue;
      seen.add(c.url);
      sources.push({ title: (c.title || site).replace(/\s+/g, " ").trim().slice(0, 90), site });
    }
  }
  return { text, sources: sources.slice(0, MAX_SOURCES) };
}

export async function buildLineSearch(input: {
  query: string;
  lang: EmergencyLang;
  country: string | null;
  apiKey: string | null;
  model: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  onError?: (stage: string) => void;
}): Promise<LineSearchResult> {
  const { query, lang, country } = input;
  if (localRiskScreen(query)) {
    return { ok: true, mode: "risk", risk: true, use_tool: "protocol", speech: dangerSentence(country, lang), sources: [] };
  }
  if (MEDICATION_ASK.test(query)) {
    return { ok: true, mode: "medication", risk: false, use_tool: null, speech: clinicianSentence(lang), sources: [] };
  }
  if (!input.apiKey) {
    input.onError?.("no_key");
    return { ok: true, mode: "none", risk: false, use_tool: null, speech: "", sources: [] };
  }

  const doFetch = input.fetchImpl ?? fetch;
  try {
    const res = await doFetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": input.apiKey, "anthropic-version": "2023-06-01" },
      signal: input.signal,
      body: JSON.stringify({
        model: input.model,
        max_tokens: 400,
        system: searchSystemPrompt(lang),
        messages: [{ role: "user", content: `Autism question: ${query}` }],
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: MAX_SEARCHES, allowed_domains: [...ALLOWED_DOMAINS] }],
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { content?: WebBlock[]; error?: { type?: string } };
    // Status and error type only: never the query.
    if (!res.ok) {
      input.onError?.(`${res.status} ${payload.error?.type ?? ""}`.trim());
      return { ok: true, mode: "none", risk: false, use_tool: null, speech: "", sources: [] };
    }
    const { text, sources } = parseSearch(payload.content ?? []);
    const speech = firstSentences(text, MAX_SENTENCES);
    if (!speech || MEDICATION_ASK.test(speech)) return { ok: true, mode: "none", risk: false, use_tool: null, speech: "", sources: [] };
    return { ok: true, mode: "web", risk: false, use_tool: null, speech, sources };
  } catch (e) {
    input.onError?.(e instanceof Error && e.name === "AbortError" ? "timeout" : "upstream");
    return { ok: true, mode: "none", risk: false, use_tool: null, speech: "", sources: [] };
  }
}
