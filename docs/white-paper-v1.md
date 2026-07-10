# NeuroLjus NL-VISION: Privacy-First, On-Device Movement-Signal Sensing to Support Caregivers of Non-Verbal Autistic Individuals

**White Paper v1 — Technical Architecture, Benchmarking & Privacy Analysis**

| | |
|---|---|
| **Version** | 1.0-draft |
| **Date** | 2026-06-19 |
| **Author** | Elizabeth Ospina |
| **ORCID** | [0009-0004-7291-3340](https://orcid.org/0009-0004-7291-3340) |
| **Affiliation** | NeuroLjus (independent researcher, Sweden) |
| **Product** | [neuroljus.com](https://neuroljus.com) |
| **Status** | Technical concept & evaluation protocol — not a diagnostic or efficacy claim |
| **Companion docs** | `VALIDATION.md` |

> **How to cite (draft):** Ospina, E. (2026). *NeuroLjus NL-VISION: Privacy-First, On-Device Movement-Signal Sensing to Support Caregivers of Non-Verbal Autistic Individuals* (White Paper v1). NeuroLjus. https://neuroljus.com

---

## Abstract

Caregivers of non-verbal autistic individuals often lack objective, real-time signals to support attentive care, yet existing "emotion AI" approaches are both scientifically contested and privacy-invasive — they typically stream video to the cloud and impose neurotypical affect models on a population whose expressions differ systematically. **NeuroLjus NL-VISION** takes a deliberately narrower and more defensible stance: it extracts **reproducible movement signals** from a standard webcam **entirely on-device** (using MediaPipe Holistic in the browser), surfaces them to a caregiver as **supportive, non-diagnostic** feedback, and never transmits raw video off the device. This white paper documents the system architecture, the per-frame signals it derives (eye-aspect-ratio–based blink rate, mouth-open ratio, hand-to-face proximity, and motion magnitude), and a rigorous evaluation protocol covering (1) **signal accuracy** against human-annotated ground truth, (2) **bias auditing** across skin tone and lighting, (3) **on-device vs. cloud benchmarking** (latency, memory, energy), and (4) a **GDPR/privacy analysis** appropriate to special-category data and a vulnerable population. We explicitly do **not** claim to infer emotional or affective states; the load-bearing claim is the measurement of observable, reproducible movement signals that a caregiver interprets. We position this work as the technical foundation for doctoral research in privacy-preserving, on-device assistive sensing for neurodivergent communication.

**Keywords:** on-device computer vision, MediaPipe, assistive technology, autism, privacy-by-design, GDPR, edge AI, non-diagnostic sensing, algorithmic fairness

---

## 1. Introduction

### 1.1 The gap

Caregivers of non-verbal autistic individuals continuously interpret subtle behavioral cues — hand-to-face contact, motor activity, gaze and mouth movement — often under cognitive load and without any objective reference. Two classes of technology claim to help and both fall short:

1. **Cloud "emotion recognition"** streams camera data to remote servers to infer affect. This is privacy-invasive (raw video leaves the device), legally fraught for health-adjacent data in Europe, and **scientifically contested**: automated facial-emotion models are trained predominantly on neurotypical faces, misclassify the more variable expressions of autistic individuals, and a substantial strand of the literature questions whether inferring emotion from the face is valid at all.
2. **Generic wellness wearables** measure the body but not the situated, observable behaviors a caregiver actually responds to, and are often impractical for non-verbal autistic users.

### 1.2 The NeuroLjus stance

NL-VISION reframes the problem to the part that is **technically tractable, ethically defensible, and privacy-preserving**:

> *"Supportive, non-diagnostic feedback based on on-device signals."*

Rather than claiming to detect an autistic person's emotion (an over-reach), NL-VISION measures **reproducible movement signals** and reports them to the **caregiver**, who interprets them in context. This is both more honest and more useful, and it sidesteps the central failure mode of the field — imposing a neurotypical affect model on a population it does not fit.

### 1.3 Scope of this document

This white paper covers the system architecture, the signal-processing pipeline, an evaluation/benchmarking protocol, and a privacy/ethics analysis. It makes **no diagnostic or efficacy claims**; it defines the technical claims and the evidence required to support them.

---

## 2. Design Principles

Five principles constrain the design (not merely position it):

1. **On-device by default.** All vision processing runs locally in the browser; raw video never leaves the device. Only derived numeric signals are retained (`localStorage`).
2. **Non-diagnostic.** Outputs are observable signals, not clinical inferences. No diagnosis, no affect label, no verdict.
3. **Support the caregiver, not surveil the person.** NL-VISION is a tool *for* the caregiver, not a compliance/monitoring tool used *on* the autistic individual.
4. **No neurotypical norm.** Signals are described per-person and descriptively; the system does not score an autistic person against neurotypical baselines.
5. **Privacy-by-design (GDPR Art. 25).** Data minimization, local processing, and special-category-data handling are built in, not bolted on.

---

## 3. System Architecture

### 3.1 Overview

NL-VISION is a web application (Next.js 15 / React 19) that runs a vision pipeline **client-side** and presents two surfaces:

```
 Webcam ──▶ MediaPipe Holistic (in-browser, WASM/GPU) ──▶ landmark stream
                                   │
                                   ▼
                 Signal extraction (per frame, on-device)
                                   │
            ┌──────────────────────┼───────────────────────┐
            ▼                      ▼                        ▼
   LiveVitals dashboard   localStorage buffer        CareChat (caregiver
   (real-time signals)    (derived signals only)     assistant, server-side LLM)
```

- **Vision:** MediaPipe Holistic loaded from CDN; face + hand landmarks at interactive frame rates (`minDetectionConfidence = minTrackingConfidence = 0.5`).
- **No raw video egress:** frames are processed in-browser; only numeric signals are buffered locally (`localStorage["nlvision_holistic_v1"]`).
- **Caregiver assistant (CareChat):** a separate text assistant (server-side LLM) for caregiver Q&A — textual, not vision data — kept architecturally distinct from the on-device sensing.

### 3.2 Derived signals (Layer 1)

Each is an explicit, testable measurement claim:

| Signal | Definition | Observable referent |
|---|---|---|
| `hasFace`, `handsCount` | Landmark presence | Face/hand visibility |
| `faceMove`, `handsMove` | Inter-frame landmark displacement | Motion magnitude |
| `handNearFace` | Hand-center ↔ face-center distance `< 0.12` (normalized) | Hand-to-face proximity |
| `ear` | Eye-aspect-ratio; eye-closure threshold `< 0.24` | Eye closure |
| `blinksPerMin` | EAR threshold crossings, 250 ms debounce, 60 s window | Blink rate |
| `mouthOpen` | Mouth-open ratio (open `> ~0.35`) | Mouth opening |

### 3.3 Derived index (Layer 2) — stated honestly

A `computeStatus()` routine maps signals to a coarse state (Calm / Elevated / High) using current heuristic thresholds and weights. **These thresholds are presently hand-set, not data-derived.** This white paper treats deriving them from annotated data (Section 4.3) as required work, and recommends that until then the Layer-2 index be presented explicitly as a **movement index**, not an affective state.

---

## 4. Technical Evaluation Protocol

The evaluation is structured to produce credible, publishable evidence **without** entering the contested affect-recognition space and **without** collecting sensitive data prematurely (see §6).

### 4.1 On-device vs. cloud benchmarking (no human subjects required)

Quantify the privacy/performance advantage of local processing using **synthetic or open video** — no participant data needed:

| Metric | Method | Hypothesis |
|---|---|---|
| **Latency** | End-to-end per-frame processing time (on-device) vs. round-trip to a cloud vision API | On-device lower and jitter-free |
| **Throughput (FPS)** | Sustained frames/sec on representative devices (low-end phone, laptop) | Interactive (≥ 15 FPS) on-device |
| **Memory** | Peak heap / WASM memory during a session | Bounded, no leak over time |
| **Energy** | Battery drain per 10-min session, on-device vs. continuous upload | On-device lower (no radio/upload) |
| **Privacy surface** | Bytes of raw imagery leaving the device | On-device = 0 |

### 4.2 Reproducibility (no human subjects required)

Demonstrate that, given identical input video, the pipeline yields **stable, consistent signals** across runs and devices (deterministic within tolerance). Report run-to-run variance and cross-device agreement on a fixed open clip.

### 4.3 Signal accuracy vs. ground truth (requires consented data → ethics)

Validate Layer-1 signals against human annotation (the **defensible, non-contested** core):

| Signal | Reference standard | Statistic | Pre-spec target |
|---|---|---|---|
| `blinksPerMin` | Frame-by-frame human blink count (≥2 annotators) | Bland–Altman + ICC | ICC ≥ .75 |
| Eye-closure / `ear` events | Human-coded closures | Sensitivity/specificity, Cohen's κ | κ ≥ .60 |
| `mouthOpen` events | Human-coded mouth-open | ROC / AUC | report |
| `handNearFace` | Human-coded contact | Precision/recall, κ | κ ≥ .60 |

Inter-annotator reliability is reported first (it sets the ceiling).

### 4.4 Bias / fairness audit (mandatory)

Because landmark detection is known to vary by demographic and lighting, stratify every §4.3 metric by **skin tone** (e.g., Monk Skin Tone scale) and **lighting** (the existing low-light / mono modes operationalize this). Report per-stratum performance and the **performance gap**; a signal that works only on light skin in good light is not validated.

### 4.5 Reporting

Any Layer-2 (state/index) model is reported under **TRIPOD+AI** (calibration, discrimination, uncertainty). Layer-1 signal validation is reported with agreement statistics and the fairness audit.

---

## 5. Privacy & Security Analysis (GDPR)

### 5.1 Why this is special-category data

Behavioral/biometric signals about a person's body and a possible health context fall under **GDPR Article 9 (special categories)**. NL-VISION's design directly minimizes risk:

- **Local processing:** raw video is processed in-browser and not transmitted; only derived numeric signals persist on-device (`localStorage`).
- **Data minimization (Art. 5(1)(c)):** no faces, no frames, no identifiers stored — numeric signals only.
- **Purpose limitation:** signals support a caregiver, not profiling or automated decision-making about the autistic individual.
- **Vulnerable data subjects:** processing concerns people who may not be able to consent → guardian consent + assent procedures and an always-available opt-out are required.

### 5.2 Recommended formal steps

- A **Data Protection Impact Assessment (DPIA)** given special-category data + vulnerable subjects.
- A documented **legal basis** and roles (controller/processor).
- For any human-subjects evaluation (§4.3–4.4): prior approval by the **Swedish Ethical Review Authority (Etikprövningsmyndigheten)**, since health/biometric data triggers mandatory review.

---

## 6. Ethics

NL-VISION sits in contested territory; ethics gate the project, not footnote it.

- **No emotion claims.** The system measures movement signals, not affect. This is the single most important guardrail — scientifically and ethically.
- **No neurotypical norm.** Signals are per-person and descriptive; no scoring against neurotypical baselines.
- **Consent/assent for a vulnerable population.** Guardian consent plus participant assent procedures; clear, ongoing opt-out.
- **Anti-surveillance posture.** Explicitly a caregiver-support tool, not a monitoring/compliance tool used on the person.
- **Honest engagement with the literature.** The contested status of automated affect recognition in autism is acknowledged directly and is the reason for the narrowed, signal-only framing.

---

## 7. Limitations (Stated Up Front)

1. **Layer-2 thresholds are heuristic**, not yet data-derived — the priority technical gap.
2. **Demographic/lighting bias** in landmark detection is unquantified until §4.4 is run.
3. **Signal ≠ state.** Observable movement does not entail an internal/affective state; the system deliberately stops at the signal.
4. **Webcam dependence.** Performance varies with camera quality, framing, occlusion, and motion.
5. **No efficacy claim.** Whether the tool improves caregiving outcomes is an open, separate question.

---

## 8. Future Work — Toward Doctoral Research

This white paper establishes the technical and ethical foundation for a doctoral program in **privacy-preserving, on-device assistive sensing for neurodivergent communication**, plausibly within Swedish HCI / cognitive-science / digital-health groups. Concrete threads:

- Derive Layer-2 thresholds from annotated, consented data under ethics approval (TRIPOD+AI).
- A full fairness audit across skin tone and lighting, with mitigation.
- Co-design with caregivers and (where possible) autistic individuals, centering their agency.
- On-device model efficiency research (latency/energy) for low-end devices.

---

## References

- Christoff, K., et al. (2016). Mind-wandering as spontaneous thought: A dynamic framework. *Nature Reviews Neuroscience*, 17(11), 718–731.
- Collins, G. S., et al. (2024). TRIPOD+AI statement. *BMJ*, 385, e078378.
- European Parliament & Council (2016). General Data Protection Regulation (EU) 2016/679, Arts. 5, 9, 25, 35.
- Katirai, A. (2025). Autism and emotion recognition technologies in the workplace. *Autism*. https://doi.org/10.1177/13623613241279704
- Lugaresi, C., et al. (2019). MediaPipe: A framework for building perception pipelines. *arXiv:1906.08172*.
- "Not in My Face": Challenges and ethical considerations in automatic face emotion recognition technology (2024). *Machine Learning and Knowledge Extraction*, 6(4). https://www.mdpi.com/2504-4990/6/4/109
- Sensing technologies and machine-learning methods for emotion recognition in autism: A systematic review (2024). *International Journal of Medical Informatics*. https://www.sciencedirect.com/science/article/pii/S1386505624001321
- Swedish Ethical Review Authority (Etikprövningsmyndigheten). https://etikprovningsmyndigheten.se/en/

---

## Appendix A — Relationship to the Repository

| Component | File |
|---|---|
| Vision pipeline + signal extraction | `src/pages/labs/nl-vision.tsx` |
| Live signals dashboard + `computeStatus` | `src/components/LiveVitals.tsx` |
| Caregiver assistant | `src/components/CareChat.tsx`, `src/pages/api/chat.ts` |
| Validation rationale | `VALIDATION.md` |

## Appendix B — Checklist Before Empirical Work

- [ ] Run §4.1 benchmarking (on-device vs cloud) on synthetic/open video — no ethics needed
- [ ] Run §4.2 reproducibility on a fixed open clip — no ethics needed
- [ ] Draft the DPIA (special-category data + vulnerable subjects)
- [ ] Identify a Swedish research host / supervisor (HCI / cognitive science / digital health)
- [ ] Apply to Etikprövningsmyndigheten before any §4.3–4.4 human data
- [ ] Publish this white paper to OSF Preprints / Zenodo → DOI → link to ORCID

---

*NeuroLjus — supportive, non-diagnostic signals. The caregiver interprets.*
