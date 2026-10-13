# NeuroLjus — [neuroljus.com](https://neuroljus.com)

Neuroljus is an independent research project by Elizabeth Ospina: a research-ready care intelligence platform that turns lived caregiving knowledge — especially around non-speaking autism — into structured routines, local observations, and open protocols for future health, research, and assistive robotics.

Focused development (website, local labs, protocol engine, research materials) is active under [Board Decision 002](docs/board/decision-002-adopt-care-intelligence-positioning.md). Institutional pilots, clinical workflows, and human validation still require the evidence and approvals in [Reopen Criteria](docs/board/reopen-criteria.md).

**Stack:** Next.js 15 · React 19 · Claude by Anthropic (Care Chat, server-side) · deployed on Vercel.

## Strategic Status Documents

- [Board Decision 002: Adopt Care Intelligence Positioning](docs/board/decision-002-adopt-care-intelligence-positioning.md)
- [Board Decision 001: Pause Active Product Development (historical)](docs/board/decision-001-pause-active-product.md)
- [Founder Context and Project Thesis](docs/strategy/founder-context-and-project-thesis.md)
- [Near-Term Action Vision](docs/strategy/near-term-action-vision.md)
- [Offer Map](docs/strategy/offer-map.md)
- [Long-Horizon Care Intelligence](docs/strategy/long-horizon-care-intelligence.md)
- [Reopen Criteria](docs/board/reopen-criteria.md)
- [Claim Audit](docs/board/claim-audit.md)

## Project DNA

Neuroljus is built from caregiver witness, not abstract AI ambition. Elizabeth's lived care context is treated as situated knowledge: observations, routines, uncertainty, ethical pressure, and respect for communication that may not arrive through speech.

The long-horizon question is:

> How can future AI and care robotics support neurodivergent people without replacing relationship, consent, privacy, or human dignity?

That horizon does **not** mean the current repository is a robotics product, medical device, clinical workflow, or validated assistive technology. It means present-day decisions should remain compatible with a future where AI and robots may be present in care environments.

The short-term action principle is:

> Better observations first. Future care intelligence later.

The next useful work is not more feature expansion. It is a narrow evidence cycle: define one caregiver user, one repeated situation, one observation template, and test whether structured notes plus optional local signals improve reflection over time.

Near-term research tools:

- [Caregiver Interview Guide v0](docs/research/caregiver-interview-guide-v0.md)
- [Observation Template v0](docs/research/observation-template-v0.md)

## What Neuroljus Offers Now

- **Caregiver interviews** to learn how observation, handoffs, uncertainty, and respectful language work in real care settings.
- **Observation Method v0** (`/observation-method`) to test structured caregiver notes over time.
- **NL-VISION Lab** (`/labs/nl-vision`) as a local observation layer for optional visual signals, with live pattern-identification overlays.
- **Future Care Room** (`/labs/future-care-room`) — an interactive care-room simulation where caregiver settings become a living care protocol.
- **Robot Care Interface** (`/labs/robot-interface`) — the technical protocol workspace: routine builder, simulator, audit trail, adapter packets (ROS2/MQTT/HTTP/offline).
- **Care protocol engine** (`src/lib/careProtocol/`) — deterministic, local, tested (`npm test`).
- **Ask NeuroLjus** (`/ask`) — practical, labelled answers: science cited from the verified library, known practice, data from this person (by code), new ideas to try.
- **Autism library** (`/library`) — 500+ open-access studies verified by code (DOI, licence, retraction), with key findings and practical sheets in three languages.
- **Companion** (`/companion`) — the care robot that starts on a phone: describe the situation, press Start, and the phone itself runs the plan. The same plan exports to Home Assistant, ROS2, MQTT, HTTP or an offline playbook.
- **Care Agent** (`/care-agent`) — natural-language description → Claude interprets → the deterministic planner emits the protocol and adapter packets.
- **Research collaboration** for ethics, privacy, accessibility, validation design, and future evidence-building.

Neuroljus does not currently offer diagnosis, medical advice, clinical deployment, institutional pilots, or automated interpretation of autistic communication. Diagnostic support is a future horizon to be built only with qualified research and care partners.

## Quick start
```bash
# 1) Install
npm install

# 2) Create .env.local file in project root (Care Chat runs on Claude)
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local

# 3) Dev server
npm run dev

# 4) Build & run
npm run build && npm start
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Care Chat engine (/api/chat): Claude by Anthropic, model claude-sonnet-5-5
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Optional overrides
# ANTHROPIC_MODEL=claude-sonnet-5-5       # default; claude-sonnet-4-20250514 was retired 2026-06-15
# CARE_REFLECTION_PROVIDER=anthropic      # anthropic (default) | openai | none
# OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx    # only with CARE_REFLECTION_PROVIDER=openai (gpt-4o-mini)
```

`CARE_REFLECTION_PROVIDER=none` keeps the chat fully local: the deterministic NL-VISION signal simulation still runs and no care notes leave the browser.

**Important**: Never commit `.env.local` to git (already in `.gitignore`)

## Deploy on Vercel
This site is live at **[neuroljus.com](https://neuroljus.com)** and **auto-deploys from the `main` branch** via the Vercel GitHub integration.

To set it up on a fresh Vercel project:
1. Import this repo on https://vercel.com (Framework preset: **Next.js**).
2. Add the environment variable in Project Settings → Environment Variables:
   - `ANTHROPIC_API_KEY` — your Anthropic API key (server-side only; required for Care Chat). Optional: `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`).
   - Alternative engine: `CARE_REFLECTION_PROVIDER=openai` + `OPENAI_API_KEY`.
3. Deploy. Pushes to `main` then deploy automatically.

## Structure
```
.
├─ next.config.mjs
├─ package.json
├─ .env.local              # Anthropic API key (not in git)
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
├─ public/
│  ├─ favicon.svg
│  └─ labs/
│     └─ nl-vision/        # observation prototype
└─ src/
   ├─ components/
   │  ├─ CareChat.tsx      # non-diagnostic caregiver-support chat
   │  ├─ LiveVitals.tsx    # prototype observation dashboard
   │  └─ NeuroljusLanding.tsx
   ├─ pages/
   │  ├─ _app.tsx
   │  ├─ index.tsx         # main landing
   │  ├─ api/
   │  │  └─ chat.ts        # Care Chat endpoint → Claude (claude-sonnet-5-5)
   │  ├─ labs/
   │  │  └─ nl-vision.tsx  # Vision + Care Chat demo
   │  ├─ privacy.tsx
   │  └─ accessibility.tsx
   ├─ lib/
   │  ├─ careProtocol/    # deterministic protocol engine (no network)
   │  ├─ careReflection/  # Care Chat providers: anthropic (default) · openai · none
   │  └─ nlVision/        # on-device signal simulation
   └─ styles/
      └─ globals.css
```

## Current Prototype Assets

### NL-Vision Lab (`/labs/nl-vision`)
- **Prototype camera metrics**: Face detection, hand tracking, blinking rate, eye aspect ratio
- **Care Chat**: Experimental caregiver-support chat for notes and prototype metrics, powered by Claude
- **Privacy-first**: Camera video and landmarks processed on device; only summarized metrics reach the chat, and only when you use it
- **Sensory-friendly**: Low-stimulus mode, monochrome option, adjustable settings

### Care Chat (Neuroljus AI)
- Powered by Claude (Anthropic), model `claude-sonnet-5-5`, called server-side from `src/pages/api/chat.ts`
- Sends the caregiver's messages, optional notes, and the last local NL-VISION metrics window as context; never video or images
- Provides supportive, non-diagnostic reflection; the caregiver decides
- OpenAI (`gpt-4o-mini`) remains an optional adapter; `none` keeps everything local

### Long-Horizon Care Intelligence
- Frames future AI and care robotics as a research horizon, not a current product claim
- Keeps caregiver knowledge, consent, privacy, and human override central
- Prioritizes within-person longitudinal observations over universal claims about autism
- Rejects claims that AI or robots can understand, translate, or infer inner states with certainty

## Care Agent (`/care-agent`)

A caregiver describes what is happening in Spanish, English or Swedish ("Leo se tapa los oídos, hay mucha gente en la cocina"). Three layers, in this order:

1. **Claude interprets.** `src/lib/careProtocol/intentParser.ts` sends the text to Claude with a strict JSON schema and gets back only protocol settings: scenario, light/sound/distance targets, allowed commands, a one-sentence interpretation and a confidence level. Unknown or out-of-range values are discarded and the closest scenario preset fills the gap.
2. **The deterministic planner decides.** `buildCarePlan()` turns those settings into the timed `planned_sequence`, the `care_command_protocol_v0` document and the four adapter packets (ROS2, MQTT, HTTP, offline). Claude never writes an envelope.
3. **Safety exceptions cannot be skipped.** The preset's exceptions are a floor the model can only extend. A description of physical risk, self-injury or a medical emergency is caught locally before any network call (and by Claude as a second check): no automatic action is planned, only `notify_caregiver` and `log_observation`, with the message "This needs a person. If there is danger, call 112."

Endpoint: `POST /api/protocol-from-text` with `{ text, lang, visionContext? }` (max 500 characters, 15 s timeout, the text is never logged). If Claude is unreachable the endpoint still answers from the presets and says so (`source: "fallback"`). The latest local NL-VISION snapshot is attached exactly as in the Care Room.

## Companion (`/companion`)

The robot is only a body. Neuroljus is the brain and the ethics. Today the body is the caregiver's phone; tomorrow a ROS2 robot receives the same `care_command_protocol_v0` under the same rules.

- **Claude interprets, the deterministic planner decides, the caregiver presses Start.** Nothing runs on its own. Pause and a large Stop (`caregiver_pause`) stay on screen for the whole run.
- **Body: this phone.** Each command maps to something the phone really does (`src/lib/companion/phoneBody.ts`): `lower_light` dims the screen progressively (overlay capped at 60 %, never black), `reduce_sound` plays soft brown noise generated with Web Audio (no files, gain capped, fade in/out), `pause_interaction` shows a quiet timer, `offer_visual_card` shows the routine card full screen, `notify_caregiver` vibrates and shows a notice, `log_observation` stores a structured local record (no text, no names). `step_back` is something a phone cannot do, so it becomes an instruction for the caregiver. The screen stays on with Wake Lock where available.
- **The body never touches anyone.** It only steps back, lowers stimuli, offers visual support and notifies.
- **The person has a voice.** A sensory profile, made with the person or by them by tapping pictograms (which sounds calm or bother them, preferred light, voice or silence during the pause, how much space, picture cards, their calm object), is a hard limit. `applyProfile()` in `src/lib/companion/profile.ts` fuses it into the plan in code, never in Claude: it can only lower light, add distance, turn the phone's noise off, drop visual cards and add `rejection_signal`/`caregiver_pause`; it never adds an action and never removes the caregiver notice, the record or a safety exception. The plan is then rebuilt locally with `buildCarePlan()` and shows "Respects Leo's profile: …". The profile lives in `localStorage`, exportable/importable as JSON, and is never sent to the server.
- **It learns what helps this person.** After each run the caregiver taps "Helped / No change / Worse". The rating is stored on the local run record and as a note in the existing Pattern Notebook; "What helps" ranks the routines deterministically (`src/lib/companion/outcomes.ts`). When planning, the parser only receives an anonymous summary of the 3 routines that helped most — scenario, commands and counts, no names, no free text — validated again on the server (`sanitizeHelpfulRoutines()`) and offered to Claude as a preference, never against safety rules.
- **More bodies: the house today, the robot tomorrow.** A body selector — Phone, Home (Home Assistant), Robot (ROS2), MQTT, HTTP, Offline — shows the exact package for the same plan with a copy button. "Home" generates a ready-to-paste Home Assistant script (`src/lib/companion/homeAssistant.ts`): `light.turn_on` with `brightness_pct`, warm `color_temp_kelvin` and a transition, `media_player.volume_set`, a `notify` to the caregiver's phone and `logbook.log` for what the house cannot do, with `delay`s that follow the planned timing. No tokens are stored and the page never calls the house; the caregiver runs the script and stops it with `script.turn_off`.
- **Escalation.** Physical risk, self-injury, a medical emergency or anything that does not fit: no Start button, only `notify_caregiver` + `log_observation`, the message "This needs a person. If there is danger, call 112." and a call button.
- **Local-first, low stimulation.** History stays on the device; the caregiver text is never logged. Soft colours, no flashing, large buttons, `prefers-reduced-motion` respected.

## Ask NeuroLjus (`/ask`)

An autism expert for caregivers and autistic people. Help first; science is a tool, not a cage. Every idea says where it comes from:

- **Ciencia / Science** — cites a verified study from the library through Claude's native citations (`document` blocks with `citations: {enabled: true}`); a "science" paragraph without a citation is downgraded by code.
- **Práctica conocida / Known practice** — care knowledge Claude brings without a citation.
- **Datos de esta persona / Data from this person** — what Companion measured on this device, computed **by code** with counts (the model only repeats the numbers). Only an anonymous summary (scenario, commands, counts) leaves the device.
- **Idea nueva de la IA / New idea** — a hypothesis to try, never a fact. Ideas can be saved on the device (`src/lib/ask/ideas.ts`) and tried as a Companion routine (`/companion?idea=…`); each "Helped / No change / Worse" is counted by code, and after three rated runs the idea becomes data about this person — measured, not invented.

Pipeline (`src/lib/ask/expert.ts`): question (ES/EN/SV, max 800 chars) → Claude turns it into English search terms (local keyword map as fallback) → 8 documents from the library (BM25, evidence and seed boost) → Claude answers with citations. Local risk screen puts the emergency message first; no diagnosis, no medication; the question is never logged. Care Chat uses the same expert and labels. `npm run eval:ask` runs 30 real everyday questions (`tests/ask/questions.json`) against the deployed endpoint and checks citations, labels, emergencies, diagnosis verdicts and dosing.

## Autism library (`/library`)

The science NeuroLjus grounds its answers on, verified by code rather than by trust:

- `scripts/library/ingest.ts` pulls open-access autism studies from the **Europe PMC** API (PubMed records included) across twelve practical topics — sensory processing, communication and AAC, meltdowns and regulation, sleep, anxiety, feeding, school, employment and adult life, family and caregivers, routine changes, autism in women and girls, pain and health. Systematic reviews and meta-analyses rank first; research done with autistic people (participatory, lived experience) is prioritised. Each topic fills with its own documents.
- Every document must: be open access, have an abstract, be from 2010 or later, have a DOI that resolves in **Crossref**, and carry no retraction (Europe PMC publication types and Crossref retraction notices). Abstract text is stored only under an open (CC) licence; otherwise metadata and link only. No full texts in the repo.
- `scripts/library/seeds.ts` adds ~20 hand-picked key findings, resolved by title and verified the same way, with a trilingual claim and an explicit "supports / does not support".
- `scripts/library/sheets.ts` writes a practical sheet per open document with Claude ("what this means for a caregiver tomorrow morning", ES/EN/SV). `scripts/library/build.ts` builds the BM25 index (minisearch) and `docs/library/SOURCES.md`.
- `npm run library` re-runs ingestion, seeds and build; the library grows, it never silently shrinks. `npm run library:sheets` needs `ANTHROPIC_API_KEY`.
- Data lives in `data/library/` and is read at runtime by `src/lib/library` (no network). `/library` lists everything with its DOI, licence and sheet.

The library does not diagnose or prescribe. If there is danger: 112. Medical questions in Sweden: 1177.

## Product Status

Focused development is active for the website, the local labs (NL-VISION, Robot Care Interface, Future Care Room), the care protocol engine, and research materials, under [Board Decision 002](docs/board/decision-002-adopt-care-intelligence-positioning.md).

Institutional pilots, clinical workflows, server-side features beyond the existing chat endpoint, and human validation remain gated by the evidence and approvals in `docs/board/reopen-criteria.md`.

## For Collaborators, Researchers, and Institutions

Neuroljus is open to conversations with collaborators, researchers, and institutions interested in privacy-first caregiver observation, communication support, accessibility, and non-speaking autism.

The project is not currently offered as a clinical product, diagnostic tool, institutional platform, or production care app.

Future robotics or institutional work requires evidence, consent models, privacy review, accessibility validation, and explicit reopening approval.

## Optional: Analytics (Plausible)
Add the Plausible script to `_app.tsx` or `_document.tsx` once the domain is live.

## Notes
- Content is multilingual (EN/SV/ES)
- Camera video and NL-VISION landmarks stay on device; Care Chat sends summarized metrics and notes to Claude only when you use it
- Care Chat responses require a valid `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY` with `CARE_REFLECTION_PROVIDER=openai`)
