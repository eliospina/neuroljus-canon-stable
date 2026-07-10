# NeuroLjus (NL-VISION) — Scientific Validation Plan

> **Status:** Draft v0.1 — pre-data. Defines *how* the NL-VISION signal pipeline
> could be validated scientifically, and — just as important — **what must NOT be
> claimed**. This is not a psychometric scale; it is an **automated measurement /
> behavioral-signal system used with a vulnerable population** (non-verbal autistic
> individuals). The validation framework and the ethical bar are therefore different
> from a self-report instrument.
>
> **Standards / lenses:** TRIPOD+AI (reporting for prediction/AI models),
> agreement statistics vs. a human reference standard (κ, ICC, Bland–Altman,
> sensitivity/specificity), and the critical literature on automated affect
> recognition in autism.

---

## 0. The honest framing (read this first)

NL-VISION extracts motion/landmark signals from a webcam via MediaPipe Holistic and
maps them to a coarse state. The scientific literature is blunt about the danger zone:

- Automated **emotion/affect recognition in autistic people is largely unvalidated**;
  models trained on neurotypical faces misfire on autistic expressions (which are
  more variable/atypical), and a serious strand of the field questions whether
  inferring emotion from the face is scientifically sound *at all*.
- Facial/landmark detection carries **bias by skin tone and lighting**.

**Therefore the validatable claim is the narrow one, and the product already states it:**

> *"supportive, non-diagnostic feedback based on on-device signals."* — `LiveVitals.tsx`

NL-VISION should be validated as a **reproducible movement-signal monitor** that
surfaces observable signals to a caregiver who interprets them — **not** as an
emotion/affect detector. Keep that line bright. It is both more honest and more
defensible (scientifically, ethically, and legally).

---

## 1. What the system actually computes (the measurement claims)

Source: `src/pages/labs/nl-vision.tsx`, `src/components/LiveVitals.tsx`.

**Layer 1 — raw per-frame signals** (each is a measurement claim to validate):

| Signal | Definition in code | Implicit claim |
|---|---|---|
| `hasFace` / `handsCount` | MediaPipe Holistic landmark presence | presence detection is accurate |
| `faceMove`, `handsMove` | inter-frame landmark displacement | tracks real movement magnitude |
| `handNearFace` | hand-center↔face-center distance `< 0.12` | proxies hand-to-face behavior |
| `ear` (eye aspect ratio) | `computeEAR`; "closed ≈ `< 0.24`" | proxies eye closure |
| `blinksPerMin` | EAR crosses `0.24` with 250 ms debounce, 60 s window | counts blinks |
| `mouthOpen` | `computeMouthOpen`; "speaking/stress ≈ `> 0.35`" | proxies mouth opening |

**Layer 2 — derived "state"** (`computeStatus` in `LiveVitals.tsx`):
score starts at 100; **`mouthOpen > 0.38` → −15**, **`handsMove > 0.02` → −20**,
**`handNearPct > 0.35` → −15**; then **Calm ≥ 75 / Elevated ≥ 55 / High < 55**.

> ⚠️ **Scientific gap #1:** those thresholds (`0.38`, `0.02`, `0.35`) and the weights
> (`15/20/15`) are **hardcoded, not derived from data**. Today they are assertions,
> not measurements. The single most important validation task is to **replace them
> with data-derived, ground-truth-anchored values** — or to stop reporting a "state"
> until they are.

---

## 2. Validation plan (in priority order)

### Phase 1 — Signal accuracy (the solid, publishable, non-contested part)
Validate Layer 1 against an external reference. This stands on its own and avoids
the affect-recognition minefield entirely.

| Signal | Reference standard | Statistic | Pre-spec criterion |
|---|---|---|---|
| `blinksPerMin` | Frame-by-frame human count (2 annotators) | Bland–Altman bias + limits of agreement; ICC | ICC ≥ .75 |
| `ear` / eye-closure events | Human-coded closure on video | Sensitivity/specificity, Cohen's κ | κ ≥ .60 |
| `mouthOpen` events | Human-coded mouth-open on video | Sensitivity/specificity | report ROC/AUC |
| `handNearFace` | Human-coded hand-to-face contact | κ, precision/recall | κ ≥ .60 |
| `handsMove` / `faceMove` | (optional) IMU / accelerometer reference | correlation + Bland–Altman | report r, CI |

- **Inter-annotator reliability first:** ≥2 coders, report κ/ICC for the *humans*.
  That sets the ceiling — the algorithm can't beat the reference's own noise.
- **Latency & sampling:** the 400 ms `LiveVitals` poll and 60 s blink window are
  measurement-design choices → document and justify them.

### Phase 2 — Bias / fairness audit (mandatory, not optional)
Because the users are a vulnerable population and the literature flags demographic bias:
- Stratify all Phase-1 metrics by **skin tone** (e.g., Monk Skin Tone scale) and by
  **lighting** (the existing `mono` / `lowLight` toggles operationalize this).
- Report per-stratum performance and the **performance gap**. A signal that only
  works on light skin in good light is not validated.

### Phase 3 — Threshold derivation (fix the hardcoded numbers)
- Collect labeled episodes; derive `computeStatus` cut-points and weights from data
  (e.g., logistic regression / ROC-optimal cuts) **with held-out validation**.
- Report calibration, discrimination (AUC), and uncertainty — per **TRIPOD+AI**.
- Until then, consider hiding Layer 2 or relabeling it explicitly as a movement index.

### Phase 4 (far future, optional, high-bar) — state correspondence
ONLY if Phases 1–3 succeed and ethics allow: test whether the movement index
corresponds to a **caregiver-reported, individualized** state — *never* a generic
emotion label, and *per-person* (no neurotypical norm imposed). Frame as
hypothesis-testing construct validity, with explicit acknowledgment of the
contested science. Many credible projects will choose to **stop at Phase 3**.

---

## 3. Ethics — central, because the population is vulnerable

This is not a closing caveat; it gates the whole project.

- **Consent / assent:** non-verbal autistic individuals may be unable to consent.
  Require **guardian consent + participant assent procedures**, and an **opt-out
  any time**. Camera-based monitoring of people who can't refuse is the core risk.
- **Ethics committee / IRB determination** before any human data collection.
- **Privacy-by-design (already partly true):** processing is **on-device**
  (`localStorage['nlvision_holistic_v1']`); keep raw video off any server; store
  derived signals, not faces; document retention & deletion. Align with **GDPR**
  (biometric data = special category, Art. 9).
- **Anti-surveillance stance:** state explicitly that NL-VISION is a *support tool
  for the caregiver*, not a compliance/monitoring tool used *on* the autistic person.
- **No neurotypical norm:** any state model must be individualized; do not score an
  autistic person against neurotypical expression baselines.

## 4. What you can claim now vs. after each phase

| Claim | Allowed when |
|---|---|
| "On-device signals, non-diagnostic" | **Now** (current honest framing — keep it) |
| "Validated blink/eye-closure/hand-to-face measurement" | After Phase 1 + Phase 2 pass |
| "Works fairly across skin tones / lighting" | After Phase 2 reports acceptable gaps |
| "Reports a data-derived movement index" | After Phase 3 |
| "Detects emotional/affective state" | **Avoid** — not scientifically supportable for this population |

## 5. Open-science deliverables
- [ ] Preregister Phase 1–2 on **OSF** before data collection.
- [ ] `CITATION.cff` + **Zenodo↔GitHub** DOI (FAIR4RS) — pin the MediaPipe model version.
- [ ] Public annotation protocol + inter-rater results; **synthetic/consented** demo clips only.
- [ ] Report under **TRIPOD+AI** (the 27-item checklist) for any state model.

---

### References
- Collins et al. — TRIPOD+AI, *BMJ* (2024). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11019967/
- "Not in My Face" — ethics of automatic face emotion recognition, *MAKE* (2024). https://www.mdpi.com/2504-4990/6/4/109
- Sensing tech & ML for emotion recognition in autism — systematic review (2024). https://www.sciencedirect.com/science/article/pii/S1386505624001321
- Katirai — Autism & emotion-recognition technologies in the workplace, *Autism* (2025). https://journals.sagepub.com/doi/10.1177/13623613241279704
- OSF preregistration templates — Center for Open Science. https://www.cos.io/blog/choosing-preregistration-template-guide-for-researchers
