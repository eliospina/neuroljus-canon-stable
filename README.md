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

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Server-side key used by `/api/chat`. |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Yes (for contact form) | Public Web3Forms access key. If unset, the contact form is disabled and shows a fallback email. |

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
├─ .env.example           # Template for environment variables
├─ .env.local             # Your secrets (not in git)
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
├─ public/
│  ├─ brand/              # Logo and brand assets
│  └─ beta/               # Static beta gate (legacy)
└─ src/
   ├─ lib/
   │  └─ language.tsx     # Language context (ES/EN/SV) + persistence
   ├─ components/
   │  ├─ Layout.tsx       # Shared header/footer shell (accessible)
   │  ├─ CareChat.tsx     # AI chat with Neuroljus AI
   │  ├─ LiveVitals.tsx   # Real-time metrics dashboard
   │  └─ ContactForm.tsx  # Web3Forms contact form
   ├─ pages/
   │  ├─ _app.tsx
   │  ├─ index.tsx        # main landing
   │  ├─ api/
   │  │  └─ chat.ts       # OpenAI GPT-4o-mini integration
   │  ├─ labs/
   │  │  └─ nl-vision.tsx # Vision + AI chat demo
   │  ├─ about.tsx
   │  ├─ contact.tsx
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
- Content is multilingual (ES/EN/SV) with a shared language switcher (persisted in `localStorage`)
- Camera metrics stay on device unless explicitly shared with AI
- All AI responses require valid OpenAI API key

## Operations & Security

### Domain (`neuroljus.com`)
Registered via Vercel (registrar: Tucows).

| Event | Date |
| --- | --- |
| Registered | 2025-08-15 |
| Last updated | 2026-04-23 |
| **Expires / renew by** | **2026-08-15** |

> ⚠️ Renew the domain before **2026-08-15** to avoid downtime. Check auto-renew in the Vercel domain settings.

### Rotating API tokens
The previous Web3Forms key was committed to source history and must be considered compromised.

1. **Web3Forms**: generate a new access key at https://web3forms.com, then set `NEXT_PUBLIC_WEB3FORMS_KEY` in Vercel → Project Settings → Environment Variables. The old key is no longer in source.
2. **OpenAI**: rotate `OPENAI_API_KEY` at https://platform.openai.com/api-keys if there is any chance of exposure, and update it in Vercel.
3. Redeploy after updating environment variables.

Tokens are never hardcoded in source anymore — both keys come from environment variables.
