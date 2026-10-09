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
