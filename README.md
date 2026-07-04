# NeuroLjus — [neuroljus.com](https://neuroljus.com)

Neuroljus is currently paused as an active product and maintained as a research/portfolio prototype.

Neuroljus is an independent research and technical portfolio project by Elizabeth Ospina exploring privacy-first AI tools for caregiver observation, communication support, and long-horizon care intelligence in non-speaking autism.

See [Board Decision 001](docs/board/decision-001-pause-active-product.md) for the active status.

**Stack:** Next.js 15 · React 19 · OpenAI (server-side) · deployed on Vercel.

## Strategic Status Documents

- [Board Decision 001: Pause Active Product Development](docs/board/decision-001-pause-active-product.md)
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
- **Observation Method v0** (`/observation-method`) to test structured, non-diagnostic caregiver notes over time.
- **NL-VISION Lab** as a local prototype for optional visual signals and reflection, not interpretation.
- **Research collaboration** for ethics, privacy, accessibility, validation design, and future evidence-building.

Neuroljus does not currently offer diagnosis, medical advice, clinical deployment, institutional pilots, robotics prototypes, or automated interpretation of autistic communication.

## Quick start
```bash
# 1) Install
npm install

# 2) Create .env.local file in project root
echo "OPENAI_API_KEY=your-key-here" > .env.local

# 3) Dev server
npm run dev

# 4) Build & run
npm run build && npm start
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Important**: Never commit `.env.local` to git (already in `.gitignore`)

## Deploy on Vercel
This site is live at **[neuroljus.com](https://neuroljus.com)** and **auto-deploys from the `main` branch** via the Vercel GitHub integration.

To set it up on a fresh Vercel project:
1. Import this repo on https://vercel.com (Framework preset: **Next.js**).
2. Add the environment variable in Project Settings → Environment Variables:
   - `OPENAI_API_KEY` — your OpenAI API key (server-side only; required for the AI chat).
3. Deploy. Pushes to `main` then deploy automatically.

## Structure
```
.
├─ next.config.mjs
├─ package.json
├─ .env.local              # OpenAI API key (not in git)
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
   │  │  └─ chat.ts        # OpenAI GPT-4o-mini integration
   │  ├─ labs/
   │  │  └─ nl-vision.tsx  # Vision + AI chat demo
   │  ├─ privacy.tsx
   │  └─ accessibility.tsx
   └─ styles/
      └─ globals.css
```

## Current Prototype Assets

### NL-Vision Lab (`/labs/nl-vision`)
- **Prototype camera metrics**: Face detection, hand tracking, blinking rate, eye aspect ratio
- **Neuroljus AI Chat**: Experimental caregiver-support chat for notes and prototype metrics
- **Privacy-first**: Camera metrics processed locally, AI analysis optional
- **Sensory-friendly**: Low-stimulus mode, monochrome option, adjustable settings

### Neuroljus AI
- Powered by OpenAI GPT-4o-mini
- Uses caregiver input and optional prototype metrics as context
- Provides supportive, non-diagnostic reflection
- Non-diagnostic support for caregivers

### Long-Horizon Care Intelligence
- Frames future AI and care robotics as a research horizon, not a current product claim
- Keeps caregiver knowledge, consent, privacy, and human override central
- Prioritizes within-person longitudinal observations over universal claims about autism
- Rejects claims that AI or robots can understand, translate, or infer inner states with certainty

## Product Status

Active product/app development is paused. No new feature development should continue until the board reopens product development under the criteria in `docs/board/decision-001-pause-active-product.md`.

The repository, website, NL-VISION prototype, and contact page remain available as research/portfolio assets.

## For Collaborators, Researchers, and Institutions

Neuroljus is open to conversations with collaborators, researchers, and institutions interested in privacy-first caregiver observation, communication support, accessibility, and non-speaking autism.

The project is not currently offered as a clinical product, diagnostic tool, institutional platform, or production care app.

Future robotics or institutional work requires evidence, consent models, privacy review, accessibility validation, and explicit reopening approval.

## Optional: Analytics (Plausible)
Add the Plausible script to `_app.tsx` or `_document.tsx` once the domain is live.

## Notes
- Content is multilingual (EN/SV/ES)
- Camera metrics stay on device unless explicitly shared with AI
- All AI responses require valid OpenAI API key
