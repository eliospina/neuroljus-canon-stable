# Care OS — handoff for next agent session

**Date:** July 10, 2026  
**Branch:** `lab/robot-interface` (clean vs remote; local uncommitted work below)  
**Owner:** Elizabeth Ospina — works in Spanish; site copy is SV/EN/ES.

## What we decided

Elizabeth chose **Proposal C — Care OS** (dark console / deployable infrastructure aesthetic, inspired by Palantir + Neuralink gravity, not their literal colors).

Core idea:
- Public site = **platform**, not marketing brochure
- Present tense: "the robot receives" — no far-future dates or "future robot would"
- **Two worlds** in labs: warm care scene inside, dark machine/protocol layer outside
- Trilingual everywhere user-facing strings are touched

## Done this session (uncommitted)

### 1. `src/pages/index.tsx` — landing redesigned Care OS
- Black `#09090b`, status bar, nav pills (runtime/protocol/adapters/audit)
- Hero: `$ neuroljus status --all` + headline + metrics (5/7/4/0)
- Live protocol console preview (evening_transition stream)
- 4 module cards: Care Room, Protocol Workspace, NL-VISION, Observation Method
- Design principles + CTA "OPEN WORKSPACE" → `/labs/robot-interface`
- Full SV / EN / ES copy
- Removed old hero logo, 6-card grid, purple kickers, light gradient

### 2. `src/pages/labs/future-care-room.tsx` — two-worlds visual
- SVG warm scene (person, caregiver, robot, light/sound响应)
- Right panel = dark **machine layer** with live `planned_sequence` lines lighting up during play
- Copy: removed "future" from robot/protocol language
- Palette aligned to Neuroljus (not warm cream/Claude-like)

### 3. `.cursor/rules/design-system.mdc`
- Care OS tokens and rules for future page work

### 4. `public/design-previews/`
- Static mockups + `index.html` gallery (proposals A/B/C, pioneer, palette)
- Not part of product — reference only; OK to delete before merge or keep for design review

## Verified green (after landing rewrite)

```bash
npm test && npm run smoke && npm run build
```

All pass. Dev server: `npm run dev` → http://localhost:3000

## NOT done yet — priority order for next session

### Phase 1 — Coherence (high impact, lower risk)
1. **`src/pages/labs/robot-interface.tsx`** — wrap in Care OS chrome (match landing: status bar, dark bg, mono accents). Engine unchanged.
2. **`src/pages/contact.tsx`** + **`src/pages/observation-method.tsx`** — migrate off generic Tailwind (black buttons, slate) to Care OS tokens.
3. **`future-care-room.tsx`** — optional: align page chrome (nav/top) to Care OS while keeping warm SVG scene inside.

### Phase 2 — Story Mode (product, not just skin)
Shipped on Care Room (`future-care-room.tsx`):
- Spine: evening transition as caregiver
- Climax: "you are the robot" — locked controls; safety exceptions remain
- Closing: one protocol → substitute caregiver / smart home / assistive robot
- No 2026→2035 time slider

### Phase 3 — Hard pages (separate session)
- **`about.tsx`** + **`labs/nl-vision.tsx`** — old dark gradient family `#1E1F3B` / mint-cyan; full redesign to Care OS
- **NL-VISION files are protected** — commits may need `[ALLOW-NLVISION-EDIT]` in message (see `.github/workflows/protect-nlvision.yml`)

### Phase 4 — Naming (Elizabeth decides)
- "Future Care Room" name + route `/labs/future-care-room` still use "Future"
- Landing trilingual strings still say "Future Care Room" in module card
- If renaming: update `index.tsx`, `about`, labs cross-links, all 3 languages

## Design tokens (Care OS)

| Role | Value |
|------|-------|
| Page bg | `#09090b` |
| Panel | `#0c0c0e` |
| Console header | `#18181b` |
| Border | `#27272a` |
| Text | `#fafafa` / `#a1a1aa` / `#71717a` |
| Accent | `#3ecf9a` |
| Warning | `#fbbf24` |
| Mono | `ui-monospace, "SF Mono", Menlo, Consolas` |

Care Room **scene** inside lab may stay warm (SVG); frame should be Care OS.

## Copy rules

- No medical/diagnostic claims; caregiver always in charge
- No external APIs in labs; protocol engine deterministic
- Every copy change on public pages: **SV + EN + ES**
- Avoid Anthropic-like warm cream page backgrounds

## Git note

Changes are **local uncommitted**. Elizabeth decides when to commit. Do not push unless asked.

Suggested commit split (if she asks):
1. `feat: Care OS landing and design system rule`
2. `feat: Future Care Room two-worlds visual + machine layer`
3. `chore: design preview assets` (optional, or omit from PR)

## First message for next agent

> Continue Care OS from `docs/CARE-OS-HANDOFF.md`. Start Phase 1: apply Care OS chrome to `robot-interface.tsx`, then `contact.tsx` and `observation-method.tsx`. Run `npm test && npm run smoke && npm run build` before finishing. Elizabeth chose Proposal C; keep trilingual copy and present-tense robot language.
