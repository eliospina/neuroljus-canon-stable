# Neuroljus — Landing (Next.js + Tailwind)

Empathic AI for sensory understanding. Specialized assistant for caregivers of non-verbal autistic individuals.

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
1. Push this repo to GitHub (e.g., `neuroljus-site`).
2. Create a project on https://vercel.com and import the repo.
3. Framework preset: **Next.js**.
4. **Add Environment Variable**: 
   - Go to Project Settings → Environment Variables
   - Add `OPENAI_API_KEY` with your OpenAI API key
5. Redeploy after adding the environment variable.
6. After first deploy, set a custom domain when ready (e.g., `neuroljus.ai`).

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
