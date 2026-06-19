# NeuroLjus — [neuroljus.com](https://neuroljus.com)

Empathic, privacy-first AI for sensory understanding — a specialized assistant for caregivers of non-verbal autistic individuals.

**Stack:** Next.js 15 · React 19 · OpenAI (server-side) · deployed on Vercel.

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
│     └─ nl-vision/        # Vision AI demo
└─ src/
   ├─ components/
   │  ├─ CareChat.tsx      # AI chat with Neuroljus AI
   │  ├─ LiveVitals.tsx    # Real-time metrics dashboard
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

## Features

### NL-Vision Lab (`/labs/nl-vision`)
- **Live camera analysis**: Face detection, hand tracking, blinking rate, eye aspect ratio
- **Neuroljus AI Chat**: Specialized AI assistant for understanding non-verbal autistic individuals
- **Privacy-first**: Camera metrics processed locally, AI analysis optional
- **Sensory-friendly**: Low-stimulus mode, monochrome option, adjustable settings

### Neuroljus AI
- Powered by OpenAI GPT-4o-mini
- Analyzes live camera metrics and caregiver input
- Provides empathetic, concrete guidance
- Non-diagnostic support for caregivers

## Optional: Analytics (Plausible)
Add the Plausible script to `_app.tsx` or `_document.tsx` once the domain is live.

## Notes
- Content is multilingual (EN/SV/ES)
- Camera metrics stay on device unless explicitly shared with AI
- All AI responses require valid OpenAI API key
