# Honesty audit and intelligence path

**Date:** 2026-07-29  
**Branch:** `lab/robot-interface`  
**Owner:** Elizabeth Ospina  

This note answers two founder questions:

1. What is honest / not honest in Neuroljus right now?
2. What should replace or de-center OpenAI (ChatGPT) as the “intelligence inside”?

---

## 1. First principles

Neuroljus’s real physics is **not** a chatbot.

It is:

> caregiver observation → structured notes / signals → portable protocol → human override

The deterministic engine (`careProtocol`) already does that **without any LLM**.  
That is the honest core. Everything else is optional assistance.

---

## 2. Honesty audit (current surface)

### Honest (keep)

| Claim / behavior | Why it is honest |
| --- | --- |
| Lived care → structured routines / open protocols | Matches what the planner and labs actually do |
| Local, deterministic protocol generation | Same input → same output; no network in labs |
| Caregiver always in charge / safety exceptions pause | Coded behavior + copy |
| NL-VISION: raw landmarks + numeric signals | MediaPipe metrics; no emotion labels in the bridge |
| “Not emotion AI / not diagnosis” on signal bridge | Explicit boundary |
| Chat system prompt: no inference of inner states from camera | Strong guardrails in `api/chat.ts` |
| Decision 002: diagnostic support only as **future horizon with partners** | Horizon language, not present capability |

### Borderline (soften or rename)

| Location | Issue | Preferred fix |
| --- | --- | --- |
| Care Room: “Machine layer · **live translation**” | “Translation” sounds like decoding a person | Prefer **mapping** / **structuring** (“same moment → protocol lines”) |
| Path label “Care interpretation” | OK if clearly **caregiver** interpretation; risky if read as AI | Keep, but pair with “caregiver authors” |
| “Neuroljus AI” branding on chat | Implies a proprietary mind; today it is OpenAI with a prompt | Prefer **Care reflection assistant** + show provider |
| LiveVitals movement **score** (Calm / Elevated / High) | Easy to read as affective state | Label as **movement index** only; never calm/stress |
| About / Decision 002 “validated diagnostic support” horizon | Allowed as future-with-partners; easy to over-read as near-term | Keep horizon wording; never present tense |

### Not honest (do not claim)

- The model “understands” autistic people or their language
- Camera signals = emotion, pain, intent, communication
- ChatGPT / any cloud LLM is the care intelligence
- Neuroljus is clinically validated or ready for institutional care
- Labs need the cloud to work (they do not)

---

## 3. Opinion on OpenAI / ChatGPT

Doubt about corporate policy is rational for a **privacy-first care** project.

Practical risks:

- Sensitive caregiver notes leaving the device
- Provider policy / model changes without Neuroljus control
- Brand association: “ChatGPT understands autism” (false and harmful)
- Dependency: if the key fails, chat dies; **protocols should not**

**Recommendation:** treat OpenAI as an **optional, replaceable reflection layer**, not the product brain.

The brain stays:

1. Observation Method (human structure)
2. NL-VISION local signals (optional numbers)
3. `buildCarePlan()` (deterministic protocol)
4. Adapters + audit trail

Chat is a side panel, not the engine.

---

## 4. Intelligence options (evolution path)

Ordered by fit with Neuroljus DNA:

### A. No-LLM first (default for honesty)

- Labs and protocol work with **zero** cloud AI
- Chat can be disabled or “coming later”
- Highest trust for LSS / research narrative

### B. Provider-agnostic reflection API

Keep `/api/chat` but abstract the backend:

| Provider | Fit | Notes |
| --- | --- | --- |
| Current OpenAI | Works today | Keep as one adapter only |
| Anthropic Claude | Strong safety culture; good for careful language | Easy second adapter |
| Open-source via API (e.g. Together / Fireworks / Groq) | Less Big Tech lock-in | Still cloud |
| Local (Ollama / llama.cpp in browser later) | Best privacy story | Harder UX; Phase later |

Contract for any provider:

- Same system boundaries (no diagnosis, no inner-state inference)
- Metrics described as prototype signals only
- UI shows **which engine** is active
- Env switch: `CARE_REFLECTION_PROVIDER=openai|anthropic|none`
- Anthropic uses `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_MODEL`)

### C. Structured reflection without free chat

Instead of open chat, generate:

- reflection questions (already in planner)
- observation checklist
- protocol explanation

This can stay **deterministic** or use a small local model later.

---

## 5. What to build next (priority)

1. **Copy honesty pass** — remove “translation” framing; rename chat branding.
2. **`CARE_REFLECTION_PROVIDER`** stub — `none` | `openai` first; Anthropic second.
3. **Story Mode** in Care Room — prove the thesis without any LLM.
4. **NL-VISION Care OS chrome + clearer landmarks** — with `[ALLOW-NLVISION-EDIT]` when intentional.
5. Only then: second cloud provider or local model experiment.

---

## 6. What Elizabeth needs for unattended agent work

So Cursor can keep working while the Mac lid is closed:

1. Install / enable **Amphetamine** (or Caffeinated) → “Allow system sleep: never” / “while app is open”.
2. Leave **Cursor open** on this chat; do not quit the app.
3. Prefer **power adapter** plugged in.
4. Lid closed is OK **only if** Amphetamine (or similar) prevents sleep.
5. When back: review commits / PR; do not assume merge without her OK.

If the machine sleeps, the agent stops.

---

## 7. Bottom line

**Honest Neuroljus** = care intelligence as **protocol infrastructure**, with optional reflection assistants that never claim to speak for an autistic person.

**Dishonest Neuroljus** = “our AI understands them.”

Evolve the project by strengthening the protocol spine and making cloud AI **optional, labeled, and swappable** — not by deepening ChatGPT dependency.
