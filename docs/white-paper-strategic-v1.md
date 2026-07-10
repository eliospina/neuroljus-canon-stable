# NeuroLjus: Empathic, Privacy-First Technology for Sensory Understanding and Caregiver Support

**Strategic White Paper v1.0**

| | |
|---|---|
| **Version** | 1.0-draft |
| **Date** | 19 June 2026 |
| **Author** | Elizabeth Ospina |
| **ORCID** | [0009-0004-7291-3340](https://orcid.org/0009-0004-7291-3340) |
| **Affiliation** | NeuroLjus (independent researcher, Sweden) |
| **Product** | [neuroljus.com](https://neuroljus.com) |
| **Status** | Strategic overview — experimental product; no diagnostic or clinical efficacy claims |
| **Companion documents** | `docs/white-paper-v1.md` (NL-VISION technical architecture); `VALIDATION.md` (scientific validation protocol); `NEUROLJUS_CORE_SPEC.md` (N-of-1 research specification) |

> **How to cite (draft):** Ospina, E. (2026). *NeuroLjus: Empathic, Privacy-First Technology for Sensory Understanding and Caregiver Support* (Strategic White Paper v1.0). NeuroLjus. https://neuroljus.com

> **Document classification:** This white paper distinguishes **Current Functionality** (features deployed or demonstrable in the repository and at neuroljus.com as of June 2026) from **Roadmap & Future Vision** (planned capabilities documented in project specifications, prototypes, or strategic intent but not yet implemented as production features). Items marked **[CURRENT]**, **[BETA / PROTOTYPE]**, or **[ROADMAP]** throughout.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [The NeuroLjus Solution](#4-the-neuroljus-solution)
5. [Core Features](#5-core-features)
6. [Technology Architecture](#6-technology-architecture)
7. [Ethical AI Principles](#7-ethical-ai-principles)
8. [Social Impact Framework](#8-social-impact-framework)
9. [Future Vision](#9-future-vision)
10. [Business Model](#10-business-model)
11. [Roadmap (2026–2031)](#11-roadmap-20262031)
12. [Research and Innovation Opportunities](#12-research-and-innovation-opportunities)
13. [Conclusion](#13-conclusion)

---

## 1. Executive Summary

### 1.1 Overview

**NeuroLjus** (Swedish: *neuro light*) is an independent social-innovation initiative and experimental technology platform dedicated to one of the most underserved intersections in digital health: **supporting caregivers of non-verbal autistic individuals** through empathic, privacy-preserving artificial intelligence and on-device sensing. Founded by Elizabeth Ospina—a Master of Economics and experienced caregiver—the project translates lived experience into technology that honors dignity, rejects surveillance, and refuses the false promises of generic "emotion AI."

The platform is live at **[neuroljus.com](https://neuroljus.com)**, deployed on modern cloud infrastructure (Vercel) with a **Next.js 15 / React 19** web application. Its flagship demonstration, **NL-VISION**, runs entirely in the user's browser: a standard webcam feeds a **MediaPipe Holistic** vision pipeline that extracts reproducible movement signals—blink rate, mouth opening, hand-to-face proximity, and motion magnitude—without ever transmitting raw video off the device. A companion **Care Chat** assistant, powered optionally by **OpenAI GPT-4o-mini**, helps caregivers interpret these signals and formulate gentle, low-risk next steps. The system is explicitly **non-diagnostic**; it measures observable movement, not internal emotional states.

NeuroLjus operates at the intersection of assistive technology, neurodiversity advocacy, and responsible AI. It is designed for multilingual audiences (Swedish, English, and Spanish content is present across the site) and grounded in European privacy law, with **GDPR privacy-by-design** as an architectural constraint rather than a compliance afterthought.

### 1.2 Mission

> *Create empathetic technology that honors the dignity of every person, verbal or non-verbal. Build bridges where others see barriers.*

This mission, stated on the project's About page, reflects a person-first philosophy: technology must serve the autistic individual and their circle, not extract data from them or impose neurotypical norms.

### 1.3 Vision

> *A world where every mind is understood, every signal is interpreted with love, and every autistic person has a voice—in their own way.*

The long-term vision extends beyond any single product feature. NeuroLjus aspires to become a **digital and physical ecosystem** connecting families, care professionals, municipalities, and researchers—always with the autistic individual's agency at the center.

### 1.4 Problem Being Solved

Globally, an estimated **[STATISTIC: prevalence of autism spectrum conditions]** individuals live with autism, and a significant subset communicate primarily or exclusively through non-verbal channels [Reference]. Their caregivers—parents, support workers, residential staff—must continuously interpret subtle behavioral cues under cognitive load, often without objective reference, peer community, or transparent information about available support services.

Existing technological responses fail this population in predictable ways:

- **Cloud "emotion recognition"** streams video to remote servers, imposes neurotypical affect models, and is scientifically contested for autistic expression [Reference].
- **Generic wellness wearables** measure physiology but not the situated behaviors caregivers actually respond to.
- **Care navigation systems**—where they exist—are fragmented, opaque, and rarely designed with sensory accessibility or neurodiversity expertise.

NeuroLjus addresses the **immediate, tractable gap**: giving caregivers real-time, privacy-preserving movement signals and empathic AI guidance, while laying foundations for broader ecosystem services described in this document's roadmap.

### 1.5 Expected Impact

| Stakeholder | Near-term impact (current product) | Long-term impact (roadmap) |
|---|---|---|
| **Autistic individuals** | Reduced misinterpretation risk through caregiver support tools; sensory-friendly interfaces | Personalized N-of-1 communication support; co-designed expression tools |
| **Families & caregivers** | Objective movement signals; AI-assisted interpretation; reduced isolation through future community features | Peer knowledge networks; structured care navigation |
| **Care providers** | Non-diagnostic observational support; multilingual access | Workforce training integration; interoperable documentation |
| **Municipalities** | Evidence-based pilot partnerships; GDPR-aligned design | Population-level care transparency; service gap mapping |
| **Researchers** | Open validation protocol; reproducible on-device pipeline | Federated, privacy-preserving neurodiversity datasets |
| **Investors & partners** | Defensible technical niche; ethical AI positioning | Scalable freemium + institutional revenue model |

NeuroLjus does not claim clinical efficacy today. Expected impact is framed as **caregiver empowerment, transparency, and inclusion**—outcomes that will be measured through co-designed studies as the platform matures.

### 1.6 Document Scope and Honesty Commitment

This strategic white paper differs from the companion **technical white paper** (`docs/white-paper-v1.md`), which focuses narrowly on NL-VISION architecture, signal definitions, and validation methodology. Here, the scope is broader: mission, ecosystem vision, stakeholder impact, business model, and multi-year roadmap. Throughout, features are labeled **[CURRENT]**, **[BETA / PROTOTYPE]**, or **[ROADMAP]** so that investors, municipalities, and families can distinguish what they can use today from what requires partnership and development investment to realize.

NeuroLjus will not overstate capabilities. Care location mapping, community forums, resource libraries, Neuroljus House, and Neuroljus AR are **strategic directions** documented because they respond to real stakeholder needs identified in caregiver practice and disability policy literature—but they are **not present in the production codebase** as of June 2026. This transparency is itself a product value: the same honesty applied to movement-signal interpretation applies to product communication.

---

## 2. Introduction

### 2.1 Global Challenges Faced by Autistic Individuals and Their Families

Autism spectrum conditions affect an estimated **[STATISTIC: global prevalence]** people worldwide, with substantial heterogeneity in communication style, sensory processing, and support needs [Reference]. For individuals who are non-verbal or minimally verbal, daily life involves navigating environments designed for neurotypical communication—spoken language, eye contact norms, and implicit social rules that may cause distress rather than connection [Reference].

Families report chronic stress related to:

- **Communication barriers**, where needs for pain relief, sensory regulation, or emotional connection go unrecognized [Reference].
- **Diagnostic and support delays**, with average wait times of **[STATISTIC: regional diagnostic wait times]** in many European healthcare systems [Reference].
- **Financial burden**, as private therapies, adaptive equipment, and respite care strain household resources [Reference].
- **Stigma and isolation**, as public misunderstanding of autistic behavior leads to exclusion from community life [Reference].

These challenges are not uniformly distributed. Immigrant families, single caregivers, and rural households face compounded barriers to information and services [Reference]. NeuroLjus originates in Sweden—a country with comparatively strong social welfare infrastructure—yet even here, caregivers describe fragmentation, opacity, and a lack of tools designed *with* rather than *for* autistic individuals.

### 2.2 Difficulties Finding Suitable Care, Support, and Community Resources

The process of identifying appropriate residential care, day programs, respite services, or therapeutic support resembles a maze more than a marketplace:

- **Information asymmetry**: Families do not know what options exist, what quality looks like, or how to compare providers [Reference].
- **Geographic mismatch**: Suitable placements may be hundreds of kilometers away, separating individuals from familiar environments [Reference].
- **Institutional silos**: Municipal social services, healthcare, education, and disability agencies operate with separate databases and eligibility criteria [Reference].
- **Language and cultural gaps**: Migrants and multilingual families struggle to navigate Swedish-language-only portals [Reference].

NeuroLjus's **[ROADMAP]** care navigation and community features (Section 5.1 and 5.2) are designed to address these structural failures. The **current product** does not yet offer care location mapping or community forums; this white paper documents that gap explicitly so stakeholders can align expectations with development reality.

### 2.3 Fragmentation of Information and Services

Digital tools for disability support have proliferated, yet they rarely integrate:

| Domain | Typical tools | Integration gap |
|---|---|---|
| Clinical records | Electronic health records (EHR) | Not accessible to families; not designed for sensory profiles |
| Social care | Municipal case management systems | Opaque to caregivers; no comparison functionality |
| Peer support | Facebook groups, informal networks | Unmoderated; no quality signals; privacy risks |
| Assistive tech | AAC apps, wearables | Siloed; no shared baseline or signal fusion |
| AI assistants | Generic chatbots | No autism specialization; cloud video analysis |

NeuroLjus proposes a **unifying design philosophy**—privacy-first, non-diagnostic, person-centered—even before it achieves full platform integration. The architectural separation between on-device sensing (NL-VISION) and optional cloud language assistance (Care Chat) is intentional: it demonstrates how a future ecosystem can combine capabilities without collapsing privacy boundaries.

### 2.4 Why Now

Three converging trends create a window for NeuroLjus:

1. **On-device AI maturity**: Browser-based inference (MediaPipe, WebAssembly, WebGPU) enables vision processing without cloud egress [Reference].
2. **Regulatory pressure**: GDPR, the EU AI Act, and growing scrutiny of biometric surveillance create demand for privacy-by-design alternatives [Reference].
3. **Neurodiversity movement**: Autistic self-advocacy has shifted public discourse toward acceptance and away from "normalization" [Reference].
4. **Caregiver workforce crisis**: Staffing shortages in disability services increase the need for decision-support tools that reduce cognitive load without replacing human judgment [Reference].

NeuroLjus is positioned to contribute evidence, tools, and ethical frameworks at this intersection—not as a replacement for human care, but as *light that makes the invisible understandable*.

### 2.5 Founder's Perspective: From Caregiving to Code

NeuroLjus did not originate in a technology incubator or university spin-out. Elizabeth Ospina—a Master of Economics working as a caregiver—recognized that non-verbal autistic individuals *"have so much to say"* and that existing tools failed to bridge the gap between silent expression and caregiver understanding. The About page describes Neuroljus AI as a *"Bridge of Light"* co-created with this purpose: observe, analyze, and translate non-verbal signals without diagnosing, without surveilling, and without imposing neurotypical communication norms.

This origin story matters for stakeholders evaluating authenticity and sustainability. The product's first use case is not hypothetical; it emerges from daily interpretation of hand movements, mouth patterns, and proximity behaviors—the same signals NL-VISION now measures reproducibly on-device. The roadmap extends this foundation outward to institutional and community scales, but the ethical core remains anchored in lived caregiving experience.

### 2.6 Relationship to the Neurodiversity Paradigm

NeuroLjus aligns with the **neurodiversity paradigm**, which understands autism as a natural variation in human neurology rather than a defect to be normalized [Reference]. This alignment is operational, not rhetorical:

- The system does not score autistic individuals against neurotypical baselines.
- It rejects universal emotion labels in favor of person-specific signal patterns.
- It prioritizes sensory-friendly design (low-stimulus modes, optional preview hiding).
- It positions AI as accompaniment for caregivers, not correction for autistic behavior.

Future community and educational modules will be developed with autistic advisors to avoid the common failure mode of "about us without us" disability technology [Reference].

---

## 3. Problem Statement

### 3.1 Current Limitations in Care Discovery

Families searching for residential care, supported living, or specialized day programs encounter:

- **No centralized, accessible registry** of providers filtered by support model, sensory environment, staffing ratios, or geographic proximity **[ROADMAP — not yet built]**.
- **Word-of-mouth dependence**, where quality information travels through private networks and excludes marginalized communities [Reference].
- **Crisis-driven decision-making**, where placements are accepted under time pressure without adequate comparison [Reference].

The NeuroLjus **[ROADMAP]** care location mapping module (Section 5.1) aims to address discovery. Today, the live product focuses on **in-home caregiver support** via NL-VISION rather than facility search.

### 3.2 Lack of Transparency

Transparency deficits affect every stakeholder:

- **Families** cannot easily verify staffing qualifications, incident histories, or sensory environment policies [Reference].
- **Municipalities** lack real-time visibility into service capacity and outcome indicators across providers [Reference].
- **Care providers** struggle to communicate their specialized competencies to referring agencies [Reference].

NeuroLjus's response begins with **product transparency**: open documentation of what the system measures, how signals are derived, and what is *not* claimed (see `VALIDATION.md` and `docs/white-paper-v1.md`). Broader institutional transparency features remain on the roadmap.

### 3.3 Difficulty Comparing Support Options

Comparison requires structured data—accommodation types, communication support levels, cost models, waiting lists—that rarely exists in machine-readable form [Reference]. Without standard schemas, even well-intentioned portals devolve into unstructured brochures.

**[ROADMAP]** NeuroLjus intends to introduce structured provider profiles and comparison views. No such functionality exists in the current codebase.

### 3.4 Social Isolation Among Families

Caregiver burnout is endemic. Studies report that **[STATISTIC: caregiver depression/anxiety rates among autism parents]** experience clinically significant stress [Reference]. Isolation is amplified when:

- Stigma discourages open conversation about behavioral crises [Reference].
- Online communities lack moderation, evidence quality, or privacy safeguards [Reference].
- Professional support ( respite, counseling) is unavailable or unaffordable [Reference].

The **[ROADMAP]** community platform (Section 5.2) targets peer connection among families, care professionals, and support workers. The **current product** offers a contact form and About page but no forum, messaging, or social graph.

### 3.5 Challenges for Municipalities and Care Providers

Public institutions face structural pressures:

| Challenge | Description | NeuroLjus relevance |
|---|---|---|
| **Aging workforce** | Recruitment and retention in disability services [Reference] | **[CURRENT]** Caregiver decision-support reduces cognitive load |
| **Budget constraints** | Flat or declining per-capita social care funding [Reference] | **[ROADMAP]** Efficiency through better matching and prevention |
| **Regulatory compliance** | GDPR, documentation, incident reporting [Reference] | **[CURRENT]** Privacy-by-design architecture; **[ROADMAP]** interoperable exports |
| **Quality assurance** | Difficulty measuring person-centered outcomes [Reference] | **[ROADMAP]** Co-designed metrics; open validation protocol **[CURRENT]** |
| **Innovation procurement** | Slow adoption of assistive technology [Reference] | Pilot partnerships; evidence generation pathway |

Municipalities need solutions that are **legally defensible, ethically grounded, and pilot-ready**. NeuroLjus's current NL-VISION demo provides a concrete entry point for supervised pilots without requiring integration into legacy systems.

### 3.6 The Scientific Problem with "Emotion AI"

A distinct but related problem undermines much of the assistive AI market: the claim that cameras can infer emotional states. For autistic individuals, this claim is especially problematic:

- Training datasets skew neurotypical [Reference].
- Autistic facial expressions are more variable and less mapped to assumed affect categories [Reference].
- A substantial literature questions whether emotion can be validly inferred from the face at all [Reference].

NeuroLjus explicitly rejects this paradigm. NL-VISION measures **movement signals**, not emotions—a narrower, more honest, and more defensible scientific claim detailed in the companion technical white paper.

---

## 4. The Neuroljus Solution

### 4.1 Platform Overview

NeuroLjus is conceived as a **layered platform** whose first layer is already operational:

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEUROLJUS PLATFORM (conceptual)               │
├─────────────────────────────────────────────────────────────────┤
│  [ROADMAP] Care Navigation │ Community │ Resource Library        │
├─────────────────────────────────────────────────────────────────┤
│  [CURRENT]  Neuroljus AI (Care Chat) — optional cloud LLM       │
├─────────────────────────────────────────────────────────────────┤
│  [CURRENT]  NL-VISION — on-device movement-signal sensing       │
├─────────────────────────────────────────────────────────────────┤
│  [BETA]     NeuroSignals — role-based profile access scaffold     │
├─────────────────────────────────────────────────────────────────┤
│  [LAB]      Sensors Hub — Web Bluetooth HRV (experimental)      │
├─────────────────────────────────────────────────────────────────┤
│  Privacy Core: local-first processing · consent · data minimization │
└─────────────────────────────────────────────────────────────────┘
```

**Diagram description (Figure 1):** A stacked architecture diagram showing roadmap layers (care navigation, community, resources) above the current operational core (Care Chat + NL-VISION), with beta/lab modules and a privacy foundation spanning all layers. Arrows indicate that only derived signals—not raw video—cross the boundary to optional cloud AI when the caregiver explicitly engages Care Chat.

### 4.2 Digital Ecosystem Vision

The long-term ecosystem connects:

- **Families** seeking understanding and community.
- **Care professionals** needing observational support and knowledge exchange.
- **Municipalities** requiring transparency and capacity planning tools.
- **Researchers** pursuing privacy-preserving neurodiversity science.
- **Technology partners** integrating wearables, AAC devices, and environmental sensors.

The **current implementation** delivers the caregiver-facing sensing and AI layer. Ecosystem features are specified in `NEUROLJUS_CORE_SPEC.md` (N-of-1 personalization, multi-signal fusion) and in beta access profiles (`neuroljus_beta_bundle_v2/beta/profiles.js`) that define roles—founder, caregiver, family, clinician, research partner—but the integrated app shell remains a placeholder.

### 4.3 User-Centered Design

Design principles observable in the current product:

| Principle | Implementation **[CURRENT]** |
|---|---|
| **Sensory-friendly UI** | Low-stimulus mode, monochrome filter, low-light adjustment in NL-VISION |
| **Multilingual access** | Swedish, English, Spanish across About and Care Chat |
| **Caregiver-first framing** | Tool supports the person holding the device, not surveillance of the autistic individual |
| **Progressive disclosure** | Camera preview optional; AI chat optional; metrics shared with AI only when caregiver sends a message |
| **Plain language** | Non-diagnostic disclaimers; movement index labeled honestly as heuristic |

Co-design with autistic individuals and caregivers is identified as **required future work** in `VALIDATION.md` and the technical white paper. The current demo reflects founder-caregiver expertise and engineering iteration; formal participatory design processes are planned for validation phases.

### 4.4 Accessibility-First Approach

NeuroLjus commits to **WCAG 2.2 AA** conformance (`src/pages/accessibility.tsx`). Current status:

- Semantic HTML landmarks on main pages.
- Aria labels on LiveVitals dashboard and language toggles.
- Reduced-motion-aware hover states on landing page.
- **Gap acknowledged**: Full WCAG audit not yet completed; accessibility page states iterative improvement with user feedback.

Future accessibility work includes screen-reader optimization of real-time signal dashboards, high-contrast themes beyond monochrome camera filter, and cognitive accessibility patterns for crisis-mode interfaces **[ROADMAP]**.

---

## 5. Core Features

This section uses explicit status labels. **Do not interpret roadmap items as shipped product capabilities.**

### 5.1 Care Location Mapping **[ROADMAP — NOT YET IMPLEMENTED]**

#### Planned capabilities

- Search and discover care facilities, supported living, and day programs.
- Structured provider profiles: support model, sensory environment, languages spoken, accessibility features.
- Community-contributed reviews and insights with moderation.
- Map-based and list-based views with municipality filters.

#### Current status

No care mapping, geolocation, provider database, or review system exists in the neuroljus-canon-stable repository or live site. This module is a **strategic roadmap item** responsive to the fragmentation problems described in Section 3. Implementation will require partnerships with municipalities and data governance frameworks not yet established.

#### Why it remains on the roadmap

Elizabeth Ospina's founding experience as a caregiver exposed the opacity of care navigation firsthand. A future NeuroLjus care map would prioritize **transparency and comparison** over commercial placement—a design constraint that will differentiate it from generic directory services when built.

---

### 5.2 Community Platform **[ROADMAP — NOT YET IMPLEMENTED]**

#### Planned capabilities

- Moderated spaces for families, care professionals, and support workers.
- Knowledge sharing: strategies, sensory profiles, regulatory guidance.
- Role-based access aligned with beta profile concepts (family, caregiver, clinician, researcher).
- Privacy-preserving identity options; no requirement to expose clinical data.

#### Current status

The **beta bundle** (`neuroljus_beta_bundle_v2`) implements a **role-based access gate** with six profile types (founder, care team, family, clinic partner, research partner, public demo) stored in `localStorage['nl_profile_v1']`. This is an authentication scaffold, not a community platform. The embedded NeuroSignals app is explicitly a **placeholder** stating: *"aquí irá tu UI real"* (the real UI will go here).

There are no forums, posts, comments, direct messages, or user-generated content features in production.

#### Related current features

- **Contact form** (`/contact`): Web3Forms integration for inbound collaboration inquiries.
- **About page** (`/about`): Mission, vision, and founder narrative in three languages.

---

### 5.3 AI-Powered Assistance **[CURRENT — OPERATIONAL]**

#### 5.3.1 NL-VISION: On-Device Movement-Signal Sensing **[CURRENT]**

NL-VISION is the flagship **[CURRENT]** capability, accessible at `/labs/nl-vision` on neuroljus.com.

**What it does:**

1. Captures webcam video locally in the browser.
2. Runs **MediaPipe Holistic** (CDN-loaded, WASM/GPU) for face and hand landmarks.
3. Extracts per-frame signals:

| Signal | Definition | Storage |
|---|---|---|
| `hasFace`, `handsCount` | Landmark presence | Derived numeric only |
| `faceMove`, `handsMove` | Inter-frame displacement | Derived numeric only |
| `handNearFace` | Hand-center ↔ face-center distance < 0.12 (normalized) | Derived numeric only |
| `ear` | Eye aspect ratio; closure threshold ≈ 0.24 | Derived numeric only |
| `blinksPerMin` | EAR crossings, 250 ms debounce, 60 s window | Derived numeric only |
| `mouthOpen` | Mouth-open ratio | Derived numeric only |

4. Aggregates signals into rolling windows stored in `localStorage['nlvision_holistic_v1']`.
5. Displays a **Live Dashboard** (`LiveVitals.tsx`) with bars for hands activity, hand-to-face proximity, mouth opening, and blink rate.
6. Computes a coarse **movement index** (Calm / Elevated / High) via heuristic thresholds—explicitly **not** validated as affective state.

**Privacy guarantee:** Raw video never leaves the device. Only derived numeric signals are persisted locally.

**Sensory accommodations:** Low-stimulus mode, monochrome filter, low-light adjustment, optional hidden camera preview.

#### 5.3.2 Neuroljus AI — Care Chat **[CURRENT]**

Care Chat (`CareChat.tsx`, `/api/chat.ts`) provides an **optional**, server-side language assistant:

- **Model**: OpenAI GPT-4o-mini (requires `OPENAI_API_KEY` on server).
- **Role**: Specialized caregiver support for non-verbal autistic individuals.
- **Inputs**: Caregiver text, optional caregiver notes, and **derived metrics only** (if caregiver sends a message—metrics are read from localStorage and included in the API request).
- **Outputs**: Empathic, concrete, non-diagnostic guidance with uncertainty language.
- **Languages**: Swedish, English, Spanish.
- **Safeguards**: Rate limiting (15 requests/minute/IP), message length caps, 25 s timeout, no raw video transmission.

**Quick prompts** include: *"Could this be pain?"*, *"Should we lower stimulation?"*, *"What next steps do you suggest?"*

**Important limitation:** Cloud AI processes **text and numeric metrics**, not images. The architectural separation between on-device vision and server-side language is a core privacy design choice.

#### 5.3.3 Intelligent Recommendations **[PARTIAL — CURRENT + ROADMAP]**

| Capability | Status |
|---|---|
| Contextual AI responses based on live metrics | **[CURRENT]** |
| Heuristic movement index (Calm/Elevated/High) | **[CURRENT]** — thresholds hand-coded, not data-derived |
| N-of-1 personalized baselines | **[ROADMAP]** — specified in `NEUROLJUS_CORE_SPEC.md` |
| Anomaly detection vs. personal baseline | **[ROADMAP]** |
| Multi-signal fusion (vision + HRV + ambient) | **[ROADMAP]** — Sensors Hub lab prototype exists |
| Proactive alerts with caregiver confirmation | **[ROADMAP]** |

---

### 5.4 Resource Library **[ROADMAP — NOT YET IMPLEMENTED]**

#### Planned capabilities

- Curated educational materials on autism, sensory processing, and caregiver wellbeing.
- Best-practice guides co-developed with practitioners and autistic advisors.
- Downloadable tools: communication boards, crisis planning templates, observation logs.

#### Current status

No resource library, CMS, document repository, or downloadable assets module exists in the production codebase. Educational content is limited to:

- About page narrative.
- Privacy and accessibility statements (privacy policy marked as pre-pilot draft).
- Technical documentation (`README.md`, white papers, `VALIDATION.md`).

#### Related design artifact **[ROADMAP]**

The file `Neuroljus_42_signaler.csv` in project materials defines **42 Swedish communication button labels** (e.g., *"Jag har ont"* / "I am in pain") with caregiver guidance notes—a conceptual foundation for a future AAC-style quick communication module. This is **not implemented** in the live web app.

---

### 5.5 Feature Summary Table

| Feature | Status | Location / evidence |
|---|---|---|
| NL-VISION on-device sensing | **[CURRENT]** | `/labs/nl-vision`, `src/pages/labs/nl-vision.tsx` |
| LiveVitals dashboard | **[CURRENT]** | `src/components/LiveVitals.tsx` |
| Care Chat (Neuroljus AI) | **[CURRENT]** | `src/components/CareChat.tsx`, `src/pages/api/chat.ts` |
| Multilingual site (SV/EN/ES) | **[CURRENT]** | `src/pages/about.tsx`, Care Chat |
| Landing & About pages | **[CURRENT]** | `src/pages/index.tsx`, `src/pages/about.tsx` |
| Contact form | **[CURRENT]** | `src/pages/contact.tsx` |
| Privacy & accessibility pages | **[CURRENT — draft policy]** | `src/pages/privacy.tsx`, `src/pages/accessibility.tsx` |
| Beta profile access gate | **[BETA scaffold]** | `neuroljus_beta_bundle_v2/` |
| Sensors Hub (Bluetooth HRV) | **[LAB prototype]** | `neuroljus-sensors-lab` repository |
| Dashboard prototype (simulated biometrics) | **[PROTOTYPE only]** | `.gemini/antigravity/scratch/neuroljus-prototype` |
| Care location mapping | **[ROADMAP]** | Not in codebase |
| Community platform | **[ROADMAP]** | Not in codebase |
| Resource library | **[ROADMAP]** | Not in codebase |
| 42-signal communication board | **[ROADMAP]** | Design artifact only |
| N-of-1 personalization engine | **[ROADMAP]** | `NEUROLJUS_CORE_SPEC.md` |

---

## 6. Technology Architecture

### 6.1 Modern Cloud Architecture **[CURRENT]**

The production web application follows a **Jamstack / serverless** pattern:

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 15, React 19, TypeScript | Pages router; static generation + API routes |
| Styling | Tailwind CSS 3.4, inline JSX styles | Dark theme; gradient brand aesthetic |
| Vision inference | MediaPipe Holistic (browser CDN) | Client-side only |
| AI inference | OpenAI API (GPT-4o-mini) | Server-side API route; optional |
| Hosting | Vercel | Auto-deploy from `main` branch |
| Contact | Web3Forms | External form handler |
| Local persistence | `localStorage` | Derived signals only |

**Diagram description (Figure 2):** Deployment diagram showing user browser (camera → MediaPipe → localStorage → LiveVitals UI) connected optionally via HTTPS POST to Vercel serverless function `/api/chat`, which calls OpenAI. A red boundary line encloses all video processing inside the browser; only text and numeric metrics cross the boundary.

### 6.2 Scalability

The current architecture scales horizontally for **web traffic and AI chat requests** via Vercel's serverless model. Vision processing scales **per device** (client-side)—there is no central vision compute cluster, which eliminates a entire class of infrastructure costs and privacy risks.

Future roadmap modules (care database, community) will require:

- Managed database (PostgreSQL or similar) with row-level security.
- CDN for static resources.
- Background jobs for search indexing and notifications.
- Geographic replication for international expansion **[ROADMAP]**.

### 6.3 Security

**Current measures:**

- API rate limiting and input sanitization on `/api/chat`.
- OpenAI API key stored as server environment variable only (`OPENAI_API_KEY`).
- No authentication system in production (beta gate is separate bundle).
- HTTPS enforced via Vercel.
- `.env.local` excluded from git.

**Planned measures [ROADMAP]:**

- OAuth 2.0 / passkey authentication for community and care modules.
- End-to-end encryption for sensitive caregiver notes.
- Security audits prior to public pilots involving identifiable data.
- Bug bounty program at scale.

### 6.4 Privacy by Design

Privacy is architectural, not policy-only:

1. **Local processing default**: Video processed in-browser; raw frames never stored or transmitted.
2. **Data minimization**: `localStorage` holds numeric aggregates, not images or identifiers.
3. **Purpose limitation**: Signals support caregiver interpretation, not profiling or automated decisions about the autistic individual.
4. **Consent granularity**: AI chat is opt-in per message; metrics shared only when caregiver sends a query.
5. **Revocation**: User can stop camera, clear localStorage, or disengage AI at any time.
6. **User data ownership**: Users retain control of locally stored signals; no account system yet means no vendor lock-in of personal data **[CURRENT]**. Future accounts will export/delete under GDPR rights **[ROADMAP]**.

### 6.5 GDPR Compliance

NL-VISION processes data likely falling under **GDPR Article 9 (special categories)** when behavioral/biometric signals relate to health context. Current alignment:

| Requirement | Status |
|---|---|
| Privacy-by-design (Art. 25) | **[CURRENT]** — on-device architecture |
| Data minimization (Art. 5(1)(c)) | **[CURRENT]** — numeric signals only |
| Purpose limitation | **[CURRENT]** — caregiver support |
| DPIA | **[ROADMAP]** — recommended before human-subjects validation |
| Legal basis documentation | **[ROADMAP]** — required before public pilots |
| Etikprövningsmyndigheten review | **[ROADMAP]** — required for validation studies in Sweden |

The privacy page (`/privacy`) states that a full policy will be published before public pilots—a honest acknowledgment of current maturity.

### 6.6 AI Integration

NeuroLjus integrates AI at two levels:

1. **On-device computer vision** (deterministic signal extraction)—no ML training in production; MediaPipe pretrained models.
2. **Cloud large language model** (generative caregiver guidance)—temperature 0.3, max 500 tokens, system prompt constraining non-diagnostic role.

Future AI integration **[ROADMAP]** per `NEUROLJUS_CORE_SPEC.md`:

- Self/weakly-supervised multimodal representation learning.
- Temporal models (Transformer/S4) fusing vision, HRV, ambient sensors.
- Personal adapters (LoRA/PEFT) for N-of-1 few-shot learning.
- Federated/on-device training with anonymized summary export only.

### 6.7 Future Interoperability with Healthcare Systems **[ROADMAP]**

Planned integration points:

- **HL7 FHIR** resources for observation signals (with explicit non-diagnostic coding).
- **OpenEHR** templates for person-centered sensory profiles.
- Municipal case management exports (Swedish *LSS* context).
- Wearable APIs (Apple HealthKit, Google Health Connect, Polar BLE).

No interoperability adapters exist today. The signal schema in `LiveVitals.tsx` and `nl-vision.tsx` is a precursor whose field definitions will inform future FHIR Observation mappings.

---

## 7. Ethical AI Principles

NeuroLjus adopts ethical principles that are **operationalized in code and documentation**, not merely aspirational.

### 7.1 Transparency

- Signal definitions, thresholds, and code paths are documented in `VALIDATION.md` and the technical white paper.
- LiveVitals displays explicit disclaimer: *"supportive, non-diagnostic feedback based on on-device signals."*
- Layer-2 movement index thresholds are acknowledged as **hand-coded, not data-derived**—an unusual but necessary honesty in AI product communication.

### 7.2 Explainability

- Each dashboard bar maps to a named, measurable signal (blinks/min, hand-to-face proximity, etc.).
- Care Chat system prompt instructs the model to use uncertainty language and avoid diagnostic claims.
- **[ROADMAP]** Future N-of-1 models will surface "I don't know" states and active-learning questions per `NEUROLJUS_CORE_SPEC.md`.

### 7.3 Human Oversight

- AI suggests; caregiver decides. No automated actions on the autistic individual.
- No alerts fire without caregiver engagement in the current product.
- **[ROADMAP]** Proactive hints will require explicit opt-in and confirmation.

### 7.4 Data Ownership

- Users retain ownership and control of locally stored derived signals.
- No user accounts or cloud storage of personal signals in the current product.
- **[ROADMAP]** Account holders will have export, portability, and deletion rights under GDPR.

### 7.5 User Consent

- Camera access requires browser permission.
- AI chat requires deliberate message submission.
- Beta profiles use consent via secret code entry with 24-hour session memory.
- **[ROADMAP]** Guardian consent + participant assent procedures for validation studies involving non-verbal individuals who cannot independently consent.

### 7.6 Responsible AI Usage

NeuroLjus explicitly commits to **not**:

- Train on universal "emotion" datasets and apply to autism.
- Force eye contact or aversive stimuli "for the data."
- Optimize aggregate accuracy across subjects (violates N-of-1 principle).
- Gamify emotional or movement states.
- Make clinical claims without evidence.

These commitments appear in `NEUROLJUS_CORE_SPEC.md` and `VALIDATION.md`.

### 7.7 Ethical AI Principles Summary Table

| Principle | Current implementation | Future enhancement |
|---|---|---|
| Transparency | Open signal documentation | Public algorithm audit reports |
| Explainability | Named signals + disclaimers | SHAP/feature attribution for N-of-1 models |
| Human oversight | Manual caregiver interpretation | Confirmed-action alert workflow |
| Data ownership | Local-only storage | GDPR data portability API |
| Consent | Browser + per-message AI consent | Granular consent dashboard |
| Non-diagnosis | System prompt + UI disclaimers | Clinical boundary monitoring |
| Fairness | Mono/low-light modes | Monk Skin Tone stratified validation |
| Anti-surveillance | Caregiver-device framing | Institutional use policy enforcement |

---

## 8. Social Impact Framework

### 8.1 Benefits for Autistic Individuals

**Near-term [CURRENT]:**

- Reduced risk of misinterpreted distress when caregivers have objective movement signals alongside subjective observation.
- Sensory-friendly interface options (low-stimulus, monochrome) demonstrate design respect for autistic sensory profiles—even in a caregiver-facing tool.

**Long-term [ROADMAP]:**

- N-of-1 communication support honoring each person's unique expression language.
- Co-designed micro-decision tools (comfort scales, AAC integration).
- Reduced institutional placement driven by crisis rather than informed choice.

*Impact metrics to be defined with autistic co-researchers; no efficacy claims at this stage.*

### 8.2 Benefits for Families

**Near-term [CURRENT]:**

- Reduced cognitive load through real-time signal dashboard.
- AI-assisted interpretation available in three languages.
- Contact pathway for collaboration and support.

**Long-term [ROADMAP]:**

- Peer community reducing isolation.
- Care navigation transparency.
- Shared observation logs across family care networks.

Estimated addressable caregiver stress reduction: **[STATISTIC: target outcome measure TBD with pilot partners]**.

### 8.3 Benefits for Care Providers

**Near-term [CURRENT]:**

- Non-diagnostic observational support during shifts.
- Structured signal vocabulary for handover communication.
- Training artifact potential via open validation protocol.

**Long-term [ROADMAP]:**

- Workforce onboarding modules in resource library.
- Integration with documentation systems.
- Quality indicators based on person-centered outcomes, not compliance metrics.

### 8.4 Benefits for Municipalities

**Near-term [CURRENT]:**

- Pilot-ready technology aligned with GDPR privacy-by-design expectations.
- Evidence-generation pathway (validation protocol, Zenodo publication intent).
- Swedish-language and multilingual accessibility.

**Long-term [ROADMAP]:**

- Care capacity mapping and service gap analysis.
- Procurement framework for ethical assistive AI.
- Cross-municipal benchmarking with anonymized aggregate data (opt-in only).

Sweden's **LSS (Lagen om stöd och service till vissa funktionshindrade)** framework provides a policy context for future institutional partnerships [Reference].

### 8.5 Long-Term Societal Impact

If NeuroLjus achieves its roadmap while maintaining ethical boundaries, societal effects may include:

1. **Norm shift** away from neurotypical emotion AI toward person-specific signal understanding.
2. **Digital inclusion** models reusable across neurodivergent populations beyond autism.
3. **Research contribution** to privacy-preserving assistive sensing literature.
4. **Policy influence** on EU AI Act implementation for vulnerable populations.
5. **Economic efficiency** through better care matching and reduced crisis intervention—*contingent on validated outcomes*.

### 8.6 Stakeholder Impact Matrix

| Stakeholder | Primary pain | Current NeuroLjus response | Roadmap response |
|---|---|---|---|
| Autistic individual | Misunderstood needs | Sensory-friendly design; caregiver support | N-of-1 expression tools |
| Family caregiver | Isolation; interpretation burden | NL-VISION + Care Chat | Community; care map |
| Support worker | Shift documentation; training gaps | Signal dashboard | Resource library; FHIR export |
| Clinician | No objective behavioral reference | Validation protocol | Research partnerships |
| Municipality | Opaque service landscape | Pilot partnership entry | Capacity mapping |
| Researcher | Lack of ethical datasets | Open methods; preregistration plan | Federated learning |
| Investor | Market trust in AI ethics | Defensible niche; live product | Scalable platform layers |

### 8.7 Theory of Change

NeuroLjus's theory of change links inputs, activities, outputs, and long-term outcomes:

**Inputs:** Caregiver expertise; on-device AI engineering; open validation methodology; multilingual design; GDPR-aligned architecture.

**Activities:** Deploy NL-VISION demo; publish white papers; pursue ethics-approved validation; co-design future modules with stakeholders; build municipal and research partnerships.

**Outputs:** Caregivers access real-time movement signals; optional AI guidance; open documentation; pilot datasets (future); community connections (future).

**Short-term outcomes:** Reduced caregiver uncertainty during interpretation; increased awareness of privacy-preserving alternatives to emotion AI; institutional pilot adoption.

**Long-term outcomes:** Improved care matching transparency; reduced family isolation; validated N-of-1 personalization; policy influence on assistive AI standards.

**Assumptions:** Caregivers want non-diagnostic support; municipalities will fund ethical pilots; validation evidence can be generated without compromising vulnerable participants; roadmap modules can be built without abandoning the privacy core.

**External risks:** Regulatory changes; cloud LLM dependency; landmark detection bias; insufficient funding for validation studies; community platform moderation costs.

This framework will be refined with stakeholders during pilot partnerships and included in grant applications to Swedish and EU funders.

---

## 9. Future Vision

The following sections describe **strategic vision and roadmap items not yet implemented**. They represent intended direction, subject to co-design, funding, regulatory approval, and validation evidence.

### 9.1 Neuroljus House **[ROADMAP — CONCEPTUAL]**

**Neuroljus House** is envisioned as a **digital and physical ecosystem hub** connecting care stakeholders:

**Digital dimension:**

- Unified portal integrating NL-VISION, community, care navigation, and resource library.
- Role-based workspaces (family, caregiver, clinician, municipal officer, researcher)—extending the beta profile scaffold.
- Shared "living room" metaphor: a calm, sensory-safe digital space for coordinated care planning.

**Physical dimension (aspirational):**

- Demonstration and co-design spaces where families, autistic advisors, and technologists iterate together.
- Training venues for municipalities and care organizations.
- Potential linkage to residential care environments as sensory observation labs—not surveillance installations.

**Current status:** No Neuroljus House module, branding page, or physical facility program exists in the codebase. The beta bundle's NeuroSignals placeholder references future HRV, NL-VISION, and ambient sensor integration as the intended unified app shell.

**Diagram description (Figure 3):** A hub-and-spoke diagram with "Neuroljus House" at center, connected to Family Portal, Care Provider Workspace, Municipal Dashboard, Research Lab, and Physical Co-Design Space. The current NL-VISION demo occupies one spoke labeled "Phase 1 — operational."

### 9.2 Neuroljus AR — Immersive Empathy **[ROADMAP — CONCEPTUAL]**

**Neuroljus AR** (working title) describes a **future immersive experience** allowing neurotypical individuals—caregivers, educators, municipal staff, family members—to better understand sensory experiences associated with autism:

**Planned experience elements:**

- Simulated sensory overload scenarios (auditory, visual, tactile) in AR/VR.
- Educational modules on stimming, sensory seeking/avoiding, and communication differences.
- Inclusion-focused debrief facilitating discussion, not pity or "simulation heroism" [Reference].

**Ethical constraints (pre-specified):**

- Autistic co-designers must lead scenario authenticity review.
- No gamification of distress; no competitive scoring.
- Clear framing as *approximation*, not "knowing what autism feels like."
- Accessibility alternatives for users who cannot tolerate immersive media.

**Current status:** No AR/VR code, Unity project, WebXR module, or immersive media assets exist in any NeuroLjus repository. This remains a **research and partnership opportunity** (Section 12), not a product announcement.

### 9.3 N-of-1 Personalization Engine **[ROADMAP — SPECIFIED]**

`NEUROLJUS_CORE_SPEC.md` defines the research-grade personalization model:

- **Personal baseline + dynamics** per individual—not population norms.
- **Optional signals**: HRV, EDA, respiration, ambient light/noise/temperature, micro-gestures, caregiver comfort markers.
- **Modeling**: Self-supervised multimodal learning, temporal fusion, anomaly detection, personal adapters (LoRA/PEFT).
- **Phased protocol**: Pilot (N=5–10) → Language (N=20–40) → Co-regulation → Federated generalization without universal labels.

The **Sensors Hub** lab component (`neuroljus-sensors-lab`) demonstrates Web Bluetooth connection to Polar H10 heart rate monitors; other metrics (HRV, stress, movement, temperature) remain simulated. Fusion with NL-VISION is listed as "next integration" in the core spec but is not built.

---

## 10. Business Model

NeuroLjus is at **pre-revenue, experimental stage**. The following model describes intended sustainability pathways aligned with social innovation and healthcare technology norms.

### 10.1 Sustainable Growth Philosophy

Revenue must not compromise:

- Privacy-by-design architecture.
- Non-diagnostic ethical boundaries.
- Accessibility for underserved families.

Growth prioritizes **institutional partnerships and freemium consumer access** over surveillance advertising or data brokerage—business models incompatible with NeuroLjus values.

### 10.2 Freemium Services **[ROADMAP]**

| Tier | Intended audience | Planned features | Price |
|---|---|---|---|
| **Free** | Families, individual caregivers | NL-VISION basic; limited Care Chat queries; resource library access | €0 |
| **Plus** | Active care households | Unlimited AI; signal history; export; multi-caregiver profiles | **[TBD]** |
| **Pro** | Care organizations | Team dashboards; training modules; priority support | Subscription |
| **Research** | Universities | Anonymized aggregate analytics; validation toolkit | Grant-funded / academic pricing |

**Current status:** All features are free; no payment system exists. OpenAI API costs are borne by project operator.

### 10.3 Institutional Collaboration **[ROADMAP]**

Target partners:

- **Municipalities** (Swedish *kommun* LSS departments): pilot contracts, co-design funding.
- **Care providers**: organizational licenses, staff training bundles.
- **Research institutions**: joint grant applications (Horizon Europe, Vinnova, FORTE).
- **Technology partners**: wearable OEMs, AAC vendors, cloud infrastructure sponsors.

Pilot pricing model: **fixed-fee pilot + outcome evaluation** rather than per-user surveillance pricing.

### 10.4 Partnerships

Current partnership mechanisms:

- Contact form and email (`elizabeth@neuroljus.com`).
- Open documentation inviting replication and validation.

**[ROADMAP]** Formal partner program, MOU templates, and municipal procurement guides.

### 10.5 Revenue Diversification (Long-Term)

- Institutional subscriptions (primary).
- Training and certification for care staff.
- Licensed validation toolkit for researchers.
- EU public funding for social innovation and digital inclusion.
- **Explicitly excluded**: sale of personal data, targeted advertising, emotion AI licensing.

### 10.6 Competitive Positioning

NeuroLjus occupies a differentiated niche compared to adjacent categories:

| Category | Typical approach | NeuroLjus differentiation |
|---|---|---|
| Emotion AI vendors | Cloud video; affect labels | On-device movement signals only; no affect claims |
| Generic AI chatbots | General-purpose LLM | Caregiver-specialized prompt; metrics context; non-diagnostic guardrails |
| AAC apps | Symbol boards; speech output | Complementary roadmap (42-signal design); current focus on observation not expression |
| Care directories | Commercial listings | **[ROADMAP]** Transparency-first; municipal partnership model |
| Clinical monitoring | FDA/CE regulated devices | Explicitly non-diagnostic; experimental status; open validation |
| Social media groups | Unmoderated peer support | **[ROADMAP]** Moderated, privacy-preserving community |

Competitive advantage in the near term rests on **ethical credibility and working technology**, not feature breadth. NL-VISION is deployable today without integration projects—a significant advantage for pilot partnerships compared to roadmap-heavy competitors.

### 10.7 Funding Pathway

Near-term funding needs include:

1. **Validation study costs**: annotation, ethics review, participant compensation.
2. **OpenAI API and Vercel infrastructure**: modest at current scale; scales with Care Chat usage.
3. **Part-time engineering and design**: community platform, auth, care map modules.
4. **Legal and compliance**: DPIA, privacy policy finalization, partnership MOUs.

Funding sources under exploration: Vinnova innovation grants, Horizon Europe disability and digital health calls, FORTE social research funding, municipal pilot contracts, angel investment aligned with impact thesis, and academic doctoral employment (host institution).

---

## 11. Roadmap (2026–2031)

The roadmap below integrates **verified current state** with **planned milestones**. Dates are indicative and subject to funding, ethics approval, and co-design timelines.

### 11.1 Product Milestones

| Phase | Period | Milestone | Status |
|---|---|---|---|
| **P0 — Foundation** | 2024–2025 | Landing site, NL-VISION demo, Care Chat, multilingual About | **Complete [CURRENT]** |
| **P1 — Validation prep** | 2026 H1 | On-device vs. cloud benchmarking; reproducibility tests; DPIA draft | In progress |
| **P1b — Scientific validation** | 2026 H2–2027 | Phase 1 signal accuracy study (consented); fairness audit | Planned |
| **P2 — Personalization** | 2027–2028 | N-of-1 baseline store; HRV + vision fusion; data-derived thresholds | **[ROADMAP]** |
| **P3 — Platform** | 2028–2029 | Community MVP; resource library; beta → production auth | **[ROADMAP]** |
| **P4 — Navigation** | 2029–2030 | Care location mapping (Sweden pilot region) | **[ROADMAP]** |
| **P5 — Ecosystem** | 2030–2031 | Neuroljus House portal; FHIR interoperability; Neuroljus AR research pilot | **[ROADMAP]** |

### 11.2 Community Growth

| Period | Target | Notes |
|---|---|---|
| 2026 | 50–100 pilot caregivers (informal) | Via neuroljus.com demo; no community platform yet |
| 2027 | 500 registered users | Requires auth system **[ROADMAP]** |
| 2028 | 5,000 community members | Moderated forums launch |
| 2029 | Municipal partnership cohorts | 3–5 Swedish municipalities |
| 2031 | 25,000+ multi-stakeholder users | International expansion begins |

*User targets are aspirational placeholders pending pilot data.*

### 11.3 Research Partnerships

| Period | Activity |
|---|---|
| 2026 | Zenodo publication of technical white paper; OSF preregistration of validation study |
| 2026–2027 | University supervisor identification (Swedish HCI / digital health / cognitive science) |
| 2027 | Etikprövningsmyndigheten-approved Phase 1 validation |
| 2028 | Joint grant applications (Horizon Europe, Vinnova) |
| 2029–2031 | Doctoral research program; federated learning pilot |

### 11.4 International Expansion

| Period | Geography | Strategy |
|---|---|---|
| 2026–2027 | Sweden | Primary market; Swedish/English content |
| 2028 | Nordics | Scandinavian language expansion; regional care partnerships |
| 2029 | EU | GDPR-native expansion; EU AI Act compliance certification |
| 2030–2031 | Global (selective) | Spanish-language markets (content foundation exists); partnership-led entry |

### 11.5 Roadmap Visualization

**Diagram description (Figure 4):** Gantt-style timeline 2026–2031 with swim lanes for Product, Research, Community, and Policy. Current position marker at P1 (2026 H1). Dependencies shown: community platform blocked on auth; care map blocked on municipal data partnerships; AR blocked on co-design + ethics review.

---

## 12. Research and Innovation Opportunities

NeuroLjus is designed as a **research-amenable platform**, not only a commercial product.

### 12.1 Collaboration with Universities

Opportunity areas for academic partners:

- **Human-computer interaction**: Co-design methods with non-verbal autistic individuals and caregivers.
- **Digital health informatics**: FHIR signal schemas; privacy-preserving observational data models.
- **Machine learning**: On-device efficiency; personal adapters; federated learning.
- **Disability studies**: Critical analysis of assistive AI power dynamics.
- **Health economics**: Cost-effectiveness of caregiver decision-support tools.

**Current assets for collaborators:**

- Open validation protocol (`VALIDATION.md`).
- Technical white paper with benchmarking methodology.
- Live reproducible demo at neuroljus.com.
- ORCID-linked authorship for citation integrity.

### 12.2 AI for Accessibility

Research questions:

- Can movement-signal dashboards be adapted for cognitive accessibility without losing precision?
- How should AI language models be fine-tuned on caregiver-autism interaction patterns without violating privacy?
- What active-learning question formats minimize burden on non-verbal individuals?

NeuroLjus invites proposals aligned with **FAIR4RS** (Findable, Accessible, Interoperable, Reusable research software) principles, including Zenodo DOI pinning and `CITATION.cff` adoption listed in `VALIDATION.md` open-science deliverables.

### 12.3 Neurodiversity Research

The N-of-1 framework challenges population-normative AI:

- **Within-subject metrics** (AUC/PR, false alarms/hour, useful lead time) replace aggregate accuracy.
- **Co-created meanings** replace imposed emotion labels.
- **Personal adapters** replace universal classifiers.

This represents a methodological contribution to neurodiversity-affirming computational research independent of product revenue.

### 12.4 Data Ethics and Digital Inclusion

Priority research topics:

- Consent/assent frameworks for non-verbal participants in sensing studies.
- GDPR Article 9 compliance patterns for browser-based biometric inference.
- Algorithmic fairness auditing stratified by Monk Skin Tone and lighting conditions (protocol pre-specified in technical white paper).
- Anti-surveillance governance for institutional deployment.

NeuroLjus will not collect human-subjects validation data without **Etikprövningsmyndigheten** approval and preregistration—a commitment stated in both white papers.

### 12.5 Innovation Partnership Opportunities

| Partner type | Collaboration model |
|---|---|
| Wearable OEM (e.g., Polar) | BLE integration; validation studies |
| AAC vendor | 42-signal communication board integration |
| Cloud provider (Vercel) | Credits; edge compute research |
| Municipal LSS department | Care map pilot; real-world deployment |
| AR/VR studio | Neuroljus AR co-design (autistic-led review) |
| Open-source community | MediaPipe signal extraction libraries |

---

## 13. Conclusion

### 13.1 Long-Term Vision

NeuroLjus exists because a caregiver saw entire worlds in minds that the world too often ignores—and asked what technology would look like if it were built from **love, dignity, and honesty** rather than surveillance, normalization, and false certainty.

The long-term vision is a **connected ecosystem**:

- Families who no longer navigate care alone.
- Caregivers equipped with objective signals and empathic AI—not replacing judgment, but supporting it.
- Municipalities with transparent, comparable service information.
- Researchers advancing privacy-preserving, neurodiversity-affirming methods.
- Autistic individuals whose unique languages are learned—not overridden.

That vision is **not fully realized today**. What exists is a working, privacy-first demonstration—NL-VISION and Care Chat—that proves a different approach is technically and ethically possible.

### 13.2 What NeuroLjus Is Today (Honest Summary)

**[CURRENT — June 2026]:**

- A live web platform at neuroljus.com.
- On-device webcam movement-signal extraction (NL-VISION).
- Real-time caregiver dashboard (LiveVitals).
- Optional multilingual AI caregiver assistant (Care Chat / Neuroljus AI).
- Open validation and technical documentation.
- Experimental sensors lab and beta access scaffold.

**[ROADMAP]:**

- Care location mapping, community platform, resource library.
- N-of-1 personalization and multi-signal fusion.
- Neuroljus House ecosystem hub.
- Neuroljus AR immersive empathy research program.
- Institutional partnerships, freemium model, international expansion.

### 13.3 Call to Action

NeuroLjus invites engagement from every audience described in this document:

| Audience | Action |
|---|---|
| **Investors** | Support ethical assistive AI with defensible technology and clear non-diagnostic boundaries. |
| **Municipalities** | Partner on supervised pilots; co-design care transparency tools. |
| **Care providers** | Test NL-VISION in controlled settings; provide feedback on signal utility. |
| **Families** | Try the demo; share context via contact form; join future co-design cohorts. |
| **Researchers** | Cite open protocols; propose collaborations; supervise doctoral development. |
| **Strategic partners** | Integrate wearables, AAC, and interoperability standards. |

Contact: **elizabeth@neuroljus.com** · Web: **https://neuroljus.com**

### 13.4 The Future of Inclusive Technology

The assistive technology field stands at a fork. One path continues cloud surveillance, neurotypical emotion models, and opaque institutional systems. The other—exemplified by NeuroLjus's current architecture—demands **local processing, person-specific understanding, caregiver empowerment, and scientific humility**.

NeuroLjus chooses the second path. The work ahead is substantial: validation studies, co-design cohorts, platform modules, and ecosystem partnerships. But the foundation is laid—not in marketing claims, but in code that keeps video on the device, documentation that states what is not known, and a mission that puts dignity before data extraction.

> *Light that makes the invisible understandable—at your pace, with your consent, in your language.*

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **NL-VISION** | On-device webcam movement-signal sensing module using MediaPipe Holistic |
| **Care Chat / Neuroljus AI** | Server-side GPT-4o-mini caregiver assistant |
| **LiveVitals** | Real-time dashboard displaying derived movement signals |
| **Movement index** | Heuristic Calm/Elevated/High score; not validated affective state |
| **N-of-1** | Personalization framework building individual baselines, not population norms |
| **Special category data** | GDPR Article 9 data (health, biometric) requiring enhanced protection |
| **Neuroljus House** | **[ROADMAP]** Digital/physical ecosystem hub concept |
| **Neuroljus AR** | **[ROADMAP]** Immersive empathy education concept |

## Appendix B: Current Technology Stack (Verified)

```
Production (neuroljus-canon-stable):
  Next.js 15.5 · React 19 · TypeScript 5.4
  Tailwind CSS 3.4 · MediaPipe Holistic (CDN)
  OpenAI GPT-4o-mini (server API route)
  Vercel hosting · Web3Forms contact

Lab (neuroljus-sensors-lab):
  Web Bluetooth (Polar H10 heart rate)
  Simulated HRV/stress/movement/temperature metrics
```

## Appendix C: Suggested Statistics for Completion

The following placeholder statistics should be replaced with peer-reviewed citations before Zenodo publication:

1. Global autism prevalence and non-verbal subset estimates.
2. Caregiver stress, depression, and isolation rates.
3. Regional diagnostic and placement wait times (Sweden/EU).
4. Social care spending and workforce vacancy rates.
5. Market size for assistive technology and disability services.
6. User adoption targets validated against pilot enrollment data.

## Appendix D: References (Placeholder Index)

- [Reference] — Autism prevalence (e.g., CDC, WHO, or systematic review).
- [Reference] — Non-verbal communication rates in autism.
- [Reference] — Caregiver burden meta-analyses.
- [Reference] — Automated emotion recognition critique ("Not in My Face," MDPI 2024).
- [Reference] — Emotion recognition in autism systematic review (Int J Med Inform 2024).
- [Reference] — GDPR Articles 5, 9, 25, 35 (Official Journal of the European Union).
- [Reference] — EU AI Act high-risk AI provisions for biometrics.
- [Reference] — MediaPipe Holistic (Lugaresi et al., 2019).
- [Reference] — TRIPOD+AI reporting guideline (Collins et al., BMJ 2024).
- [Reference] — Monk Skin Tone scale for fairness auditing.
- [Reference] — Swedish LSS legislation and disability policy context.
- [Reference] — Neurodiversity paradigm (autistic self-advocacy literature).
- [Reference] — Immersive disability simulation ethics critique.
- [Reference] — Swedish Ethical Review Authority (Etikprövningsmyndigheten) requirements.

---

*Document prepared based on analysis of the neuroljus-canon-stable repository, neuroljus-sensors-lab laboratory code, NEUROLJUS_CORE_SPEC.md, VALIDATION.md, docs/white-paper-v1.md, and live product at neuroljus.com. Roadmap items are clearly distinguished from implemented functionality throughout.*

*NeuroLjus — supportive, non-diagnostic signals. The caregiver interprets.*
