# Claim Audit

Date: 2026-06-27

This audit reviews public-facing and user-facing claims across the repository for language that could imply:

- AI understands autistic inner states
- AI translates non-verbal autistic language
- health-signal interpretation
- clinical readiness
- institutional readiness
- product launch readiness
- validated research evidence

## Summary

Neuroljus should preserve the mission while avoiding claims that exceed current evidence. The safe public framing is:

Neuroljus is a paused research/portfolio prototype exploring privacy-first AI support for caregiver observation, communication support, and long-horizon care intelligence in non-speaking autism.

## README

| Claim or area | Risk | Classification | Action |
| --- | --- | --- | --- |
| "Paused as an active product and maintained as a research/portfolio prototype" | Low | Keep | Keep. |
| "Privacy-first AI tools for caregiver observation and communication support" | Low | Keep | Keep. |
| "Prototype camera metrics" | Low | Keep | Keep as prototype language. |
| "Experimental caregiver-support chat for notes and prototype metrics" | Low | Keep | Keep. |
| Any active launch or production app framing | High | Remove | Removed from active status language. |

## Homepage

| Claim or area | Risk | Classification | Action |
| --- | --- | --- | --- |
| "Independent research and prototype project" | Low | Keep | Keep. |
| "Observation and communication support" | Low | Keep | Keep. |
| "Future care robotics" | Medium | Bound | Keep only as a long-horizon research frame, not a current product or pilot claim. |
| "Long-term horizon" | Low | Keep | Keep when clearly framed as research direction. |
| "Paused as an active product" | Low | Keep | Keep. |
| "For collaborators, researchers, and institutions" | Medium | Keep | Keep only with explicit non-clinical, non-production disclaimer. |
| Claims of understanding, translating, or health-signal interpretation | High | Remove | Removed from homepage language. |

## About Page

| Claim or area | Risk | Classification | Action |
| --- | --- | --- | --- |
| Founder lived-experience and dignity framing | Low | Keep | Keep. |
| "Know what the autistic person needs" | High | Soften | Softened to supporting observations and conversations about what a person may be communicating. |
| "Understand those who don't speak" | Medium | Soften | Softened to careful support for people who do not speak but have something to express. |
| AI "translate the non-verbal into understanding" | High | Soften | Softened to organizing observations when words are not enough. |
| AI "observe, analyze, and translate signals" | High | Soften | Softened to reflection on notes, context, and observable signals. |
| "Every signal is interpreted" | High | Soften | Softened to treating observations with care. |

## NL-VISION Lab

| Claim or area | Risk | Classification | Action |
| --- | --- | --- | --- |
| "Observation prototype" | Low | Keep | Keep. |
| "Face + Hands + On-device metrics" | Low | Keep | Keep as metric description. |
| "Live analytics" | Medium | Soften | Acceptable internally, but public subtitle softened to observation prototype. |
| "speaking/stress" comment near mouth openness | Medium | Soften | Softened to prototype mouth openness ratio. |
| Any claim that NL-VISION interprets emotion, pain, or communication | High | Remove | No such public claim should remain. |

## CareChat and API Prompt

| Claim or area | Risk | Classification | Action |
| --- | --- | --- | --- |
| Non-diagnostic assistant framing | Low | Keep | Keep. |
| "Could this be pain?" quick prompt | Medium | Soften | Softened to "What should I observe if I suspect pain?" |
| Assistant specialized in helping caregivers understand non-verbal autistic individuals | High | Soften | Softened to observation and reflection support. |
| "Analyze camera metrics" | Medium | Soften | Softened to organizing notes, context, and optional prototype metrics. |
| "Interpret live signals contextually" | High | Soften | Replaced with uncertainty-bound observation language. |

## Beta / Protected Pages

| Claim or area | Risk | Classification | Action |
| --- | --- | --- | --- |
| "Beta" access language | High | Soften | Softened to archived prototype access. |
| "NeuroSignals beta" | High | Soften | Softened to archived prototype. |
| Secret-code profiles | Medium | Move to research/future language | Kept as experimental access only, with no active beta or institutional readiness implication. |
| Clinical/research profile names in profile data | Medium | Move to research/future language | Kept as prototype data, not public readiness claims. Future cleanup may rename roles if these profiles become public product surfaces. |

## Privacy Page

| Claim or area | Risk | Classification | Action |
| --- | --- | --- | --- |
| Data minimization and on-device processing where possible | Low | Keep | Keep. |
| "GDPR compliance" | High | Soften | Softened to prototype privacy approach; full policy required before pilot or active product use. |
| "Before public pilots" | Medium | Soften | Softened to before any pilot or active product use. |

## Accessibility Page

| Claim or area | Risk | Classification | Action |
| --- | --- | --- | --- |
| Commitment to WCAG 2.2 AA | Medium | Soften | Softened to accessibility aim; validation required before pilot or active product use. |
| Screen-light experience intent | Low | Keep | Keep as design intent. |

## Remaining Risks

- Profile metadata and future external materials may still need review before any public pilot.
- The About page still carries visionary language; it is now softened but still emotionally strong.
- NL-VISION still displays metrics that users may overinterpret without careful context.
- The existence of beta/profile files can still suggest more maturity than exists if discovered directly.
- Full privacy, consent, and accessibility documentation is still not complete.
- Long-horizon robotics language could be misread as an active robotics product if repeated without the research/prototype boundary.

## Rule For Future Claims

Public and product language may describe:

- research prototype
- caregiver observation
- optional visual signals
- non-diagnostic reflection
- privacy-first exploration
- communication support
- long-horizon care intelligence
- future care robotics as a research horizon
- future research collaboration if evidence supports it

Public and product language must not claim:

- AI understands inner states
- AI translates non-verbal communication as fact
- metrics indicate pain, emotion, needs, or health status
- robots can replace caregivers
- robotics is currently validated or ready for care deployment
- clinical readiness
- institutional readiness
- active product launch
- validated research evidence
