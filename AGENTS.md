# Neuroljus — Agent Context

## What this project is

Neuroljus (neuroljus.com) turns lived caregiving knowledge — especially around non-verbal autistic individuals — into structured routines, local observations, and open protocols for future health, research, and assistive robotics. Positioning: **care intelligence infrastructure**, not a chatbot or a toy demo.

Core sentence: *Neuroljus turns lived care into structured intelligence for future assistive systems.*

## Stack

Next.js 15 (Pages Router) · React 19 · TypeScript · styled-jsx for page styles · deployed on Vercel. Care Chat calls Claude (Anthropic, `claude-sonnet-5-5`) server-side only, in `src/pages/api/chat.ts`; OpenAI remains an optional adapter via `CARE_REFLECTION_PROVIDER=openai`.

Commands: `npm run dev` · `npm run build` · `npm run smoke` (tsc) · `npm test` (planner tests via tsx) · `npm run lint`.

## Key architecture

- `src/lib/careProtocol/` — the protocol engine (pure, deterministic, no network):
  - `types.ts` — Command, SafetyException, Environment, ScenarioId, PlannerInput/Result, CareCommandProtocolV0, AdapterPacket, etc.
  - `planner.ts` — `buildCarePlan()`: ordered/timed steps, human explanation, validation, attention flags, reflection questions, adapter packets (ROS2/MQTT/HTTP/offline). Also exports shared label maps.
  - `scenarios.ts` — shared scenario presets (evening transition, sensory overload, leaving home, meal support, school arrival).
  - `intentParser.ts` — Care Agent: caregiver text (es/en/sv) → Claude (structured output) → validated partial PlannerInput; risk screen escalates to notify+log only. Served by `src/pages/api/protocol-from-text.ts`; the UI is Companion.
- `src/lib/companion/` + `src/pages/companion.tsx` — Companion: the phone as the first robot body. `phoneBody.ts` maps each protocol command to a phone action and computes the phone state per minute (pure, tested); `phoneRuntime.ts` holds the browser effects (Web Audio brown noise, Wake Lock, vibration); `runLog.ts` is the local run record; `profile.ts` is the person's sensory profile and `applyProfile()`, the deterministic fusion where the profile always wins (tested); `outcomes.ts` ranks rated runs and builds the anonymous top-3 summary the parser may receive (`helpfulRoutines`, enums and counts only); `homeAssistant.ts` turns a plan into a Home Assistant script (no tokens, never calls the house).
- `src/lib/ask/` + `src/pages/api/ask.ts` + `src/pages/ask.tsx` — Ask NeuroLjus: question → search terms → library retrieval → Claude with native citations → labelled segments (science / practice / person / idea / safety). `ideas.ts` is the local ideas notebook (tried through Companion runs with `ideaId`). Care Chat (`api/chat.ts`) uses the same `answerWithDocuments()`.
- `scripts/library/` + `data/library/` + `src/lib/library/` — the autism research library: Europe PMC/Crossref ingestion verified by code (DOI, open licence, no retraction), seed findings, Claude practical sheets, minisearch BM25 index. Runtime never touches the network. `npm run library` rebuilds; `npm run library:sheets` needs `ANTHROPIC_API_KEY`.
- `src/lib/ficha/` + `src/pages/ficha/` + `src/pages/tarjeta.tsx` — the person record ("la ficha"): `model.ts` is pure (types, `sanitizeFicha`, evidence-ranked `cardOf`, link `encodeCard`/`decodeCard`, tested), `localStore.ts` keeps the working copy in the browser, `copy.ts` is es/en/sv. `/ficha` lists and creates (five questions), `/ficha/[id]` is "name, today" with the four verbs and the growing record, `/tarjeta#<code>` is the read-only 30-second card carried inside the link. `sync.ts` + `components/ficha/Account.tsx`: local-first with an optional account (Supabase, EU, RLS owner-only; magic link; `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`; without them everything stays in the browser). Migration in `supabase/migrations/`, owner setup in `docs/ficha/cuenta.md`. `FichaPicker` ("Para: Mateo") lets Companion and the notebook write into the active record (`recordTry`, `recordNote`). `vision.ts` (pure, tested): NL-VISION rows → sessions → four movement means, compared with the person's own baseline (running mean of sessions the carer marked ordinary; silent until 3); the ficha page shows the last session and lets the carer count it as ordinary or note it as a signal. The NL-VISION page itself is not touched. Design: `docs/strategy/ficha-de-la-persona.md`. The person can own their own record (decided).
- `src/lib/protocols/` — the 10 crisis protocols of the voice line (es/en/sv), written with the owner and tied to library evidence ids. `src/lib/emergency.ts` has the emergency numbers by country.
- `src/lib/line/` + `src/pages/api/line/` — the voice line. ElevenLabs does voice; `brain.ts` is the Custom LLM behind it (Claude Sonnet 5.5, streaming, cached prompt). **Design: the model decides, the code guarantees.** The protocols go into the prompt as knowledge (a floor, not a ceiling), with the principle that the person's immediate physical safety wins over any rule. Code guarantees only what admits no judgement: the country's emergency number first when the caller asks whom to call, an honest one-line fallback when the model does not answer, plain speech for the voice. Do not add keyword protocol selection, sentence filters, or content bans back: the owner decided against them after real calls. Quality is measured with real calls and `npm run line:eval -- --live --judge`. See `docs/line/README.md`.
- `tests/careProtocol.planner.test.ts` — 10 tests, run with `npm test`.
- `src/pages/labs/robot-interface.tsx` — technical protocol workspace (builder, simulator, audit trail, protocol intelligence panel).
- `src/pages/index.tsx` — trilingual landing (Swedish/English/Spanish); all copy changes must be made in all three languages.

## Current state (October 2026)

Everything lives on `main`; Vercel deploys it to neuroljus.com. There is no long-lived feature branch. Work goes through short-lived branches and draft PRs that the owner merges with an explicit "ok".

- The voice line is in production: ElevenLabs agent "NeuroLjus Línea" (web widget on `/linea`, no phone number assigned yet) with `brain.ts` as its Custom LLM. Privacy on the ElevenLabs side: no audio recording, transcript and PII deleted, retention 0 days.
- `/linea` is the public page for the line and the landing hero's primary button opens it. The landing no longer has a "design principles" section: it is for tools, not discourse.
- Line quality is measured with real calls by the owner and `npm run line:eval -- --live --judge`; last judge run 38/42 (`docs/line/eval-2026-10-20.md`). The anonymised needs audit (`npm run line:needs`) shows what callers needed and what the model lacked.
- `LICENSE`, `CITATION.cff`, `VALIDATION.md` and `docs/` are committed.
- Removed after the 2026-10-21 audit (`docs/strategy/auditoria-2026-10-21.md`): Care Agent, Care Room, Observation Method, Care Memory, Serious Incident, the archived beta prototypes and the line's webhook tool routes. Do not bring them back; the direction is one person record that every tool reads and writes.
- Owner-side items still open: Vercel Fluid Compute and an external keep-warm pinger for cold starts, a phone number for the agent.

## Rules and tone

- **No external APIs in the labs**: everything runs locally in the browser; protocol generation must stay deterministic (same input → same output).
- **No medical or diagnostic claims on the site.** Neuroljus observes and structures; caregivers decide. The caregiver is always in charge; safety exceptions pause or escalate. **The voice line is the exception, by the owner's decision:** medication, health and diagnosis are preferably for the person's clinician, and the line says so once, but they are never forbidden. Many callers cannot reach a doctor, and a clear answer may be what keeps someone safe. The line answers with what it knows, says what it does not know, and uses the library and the web.
- **Tone**: confident, humane, infrastructure-minded. No defensive language, no toy-demo language.
- Protocol contract is `care_command_protocol_v0`; adapters must preserve caregiver settings, allowed commands, safety exceptions, and the local audit trail.
- `.github/workflows/protect-nlvision.yml` guards NL-VISION files; commits touching them may need `[ALLOW-NLVISION-EDIT]` in the message.
- Verify with `npm test && npm run smoke && npm run build` before pushing.

## Owner

Elizabeth Ospina (GitHub: eliospina). Works in Spanish; site copy is Swedish/English/Spanish.
