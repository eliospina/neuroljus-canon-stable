# Board Decision 002: Adopt Care Intelligence Positioning and Reopen Focused Development

Date: 2026-07-10

## Decision

Neuroljus adopts the "care intelligence infrastructure" positioning introduced on the
`lab/robot-interface` branch and reopens focused development limited to the public
website, the local labs, and the research narrative.

This decision was taken by the founder (Elizabeth Ospina) after reviewing the full
diff of that branch, including the copy changes that Decision 001 would otherwise
have blocked.

## What changes with respect to Decision 001

Decision 001 (2026-06-27) paused active product development and prohibited new
features and diagnostic-adjacent language. Decision 002 updates that frame:

- **Positioning**: Neuroljus presents itself as a research-ready care intelligence
  platform — structured routines, local observations, and open protocols that could
  extend, with qualified partners, toward clinical research, validated diagnostic
  support, assistive robotics, and care infrastructure.
- **Language**: the public site may describe validated diagnostic support as a
  *future horizon built with qualified research and care partners*. It still may
  not claim any present diagnostic, medical, or interpretive capability.
- **Features**: local, deterministic, browser-only labs (Future Care Room, Robot
  Care Interface, NL-VISION) are in scope. Server-side features beyond the existing
  chat endpoint remain out of scope.
- **Development**: focused development is reopened for the website, labs, protocol
  engine, and research materials. Institutional pilots, clinical workflows, and
  human validation still require the evidence and approvals listed in
  `reopen-criteria.md`.

## What does not change

- No claims that Neuroljus understands, translates, or interprets autistic inner
  states with certainty.
- No present-tense medical, diagnostic, or health-signal interpretation claims.
- Camera signals remain technical observations processed locally.
- Validation with people or sensitive data still belongs inside an approved
  research framework (see `VALIDATION.md`).
- The caregiver remains the author and the authority in every protocol.

## Record

- Decision 001 remains in the repository as the historical record of the pause.
- The README and public site copy are updated in the same change set as this
  decision so the repository and the site tell one consistent story.
