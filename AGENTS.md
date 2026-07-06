# Neuroljus — Agent Context

## What this project is

Neuroljus (neuroljus.com) turns lived caregiving knowledge — especially around non-verbal autistic individuals — into structured routines, local observations, and open protocols for future health, research, and assistive robotics. Positioning: **care intelligence infrastructure**, not a chatbot or a toy demo.

Core sentence: *Neuroljus turns lived care into structured intelligence for future assistive systems.*

## Stack

Next.js 15 (Pages Router) · React 19 · TypeScript · styled-jsx for page styles · deployed on Vercel. OpenAI is used server-side only in `src/pages/api/chat.ts`.

Commands: `npm run dev` · `npm run build` · `npm run smoke` (tsc) · `npm test` (planner tests via tsx) · `npm run lint`.

## Key architecture

- `src/lib/careProtocol/` — the protocol engine (pure, deterministic, no network):
  - `types.ts` — Command, SafetyException, Environment, ScenarioId, PlannerInput/Result, CareCommandProtocolV0, AdapterPacket, etc.
  - `planner.ts` — `buildCarePlan()`: ordered/timed steps, human explanation, validation, attention flags, reflection questions, adapter packets (ROS2/MQTT/HTTP/offline). Also exports shared label maps.
  - `scenarios.ts` — shared scenario presets (evening transition, sensory overload, leaving home, meal support, school arrival).
- `tests/careProtocol.planner.test.ts` — 10 tests, run with `npm test`.
- `src/pages/labs/robot-interface.tsx` — technical protocol workspace (builder, simulator, audit trail, protocol intelligence panel).
- `src/pages/labs/future-care-room.tsx` — the public-facing interactive experience (care room scene, live controls, protocol layer, timeline). Linked from the landing page hero and labs cards.
- `src/pages/index.tsx` — trilingual landing (Swedish/English/Spanish); all copy changes must be made in all three languages.

## Current state (July 2026)

Active branch: `lab/robot-interface` (ahead of `main`). It contains the care protocol engine, both lab pages, landing reframe, and strategy/board docs. Pending decisions:

- Open PR `lab/robot-interface` → `main` to publish (review full diff — it includes landing copy changes, not just the labs).
- Untracked local files not yet in git: `LICENSE`, `CITATION.cff`, `VALIDATION.md`, and `docs/` (PhD proposal, white papers, PDFs). The owner decides if/when to commit these.

## Rules and tone

- **No external APIs in the labs**: everything runs locally in the browser; protocol generation must stay deterministic (same input → same output).
- **No medical or diagnostic claims.** Neuroljus observes and structures; caregivers decide. The caregiver is always in charge; safety exceptions pause or escalate.
- **Tone**: confident, humane, infrastructure-minded. No defensive language, no toy-demo language.
- Protocol contract is `care_command_protocol_v0`; adapters must preserve caregiver settings, allowed commands, safety exceptions, and the local audit trail.
- `.github/workflows/protect-nlvision.yml` guards NL-VISION files; commits touching them may need `[ALLOW-NLVISION-EDIT]` in the message.
- Verify with `npm test && npm run smoke && npm run build` before pushing.

## Owner

Elizabeth Ospina (GitHub: eliospina). Works in Spanish; site copy is Swedish/English/Spanish.
