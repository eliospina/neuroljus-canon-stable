# NeuroLjus: Illuminating Understanding — An Empathic, Privacy-First Platform for Autism Care Discovery, Community, and Caregiver Support

**Strategic White Paper v2.0.1**

| | |
|---|---|
| **Version** | 2.0.1 |
| **Date** | 20 June 2026 |
| **Author** | Elizabeth Ospina |
| **ORCID** | [0009-0004-7291-3340](https://orcid.org/0009-0004-7291-3340) |
| **Affiliation** | NeuroLjus (independent social-innovation initiative, Sweden) |
| **Product** | [neuroljus.com](https://neuroljus.com) |
| **Status** | Strategic overview — experimental platform; no diagnostic or clinical-efficacy claims |
| **License** | Creative Commons Attribution 4.0 International (CC BY 4.0) |
| **DOI** | [10.5281/zenodo.20775583](https://doi.org/10.5281/zenodo.20775583) — Zenodo, linked to author ORCID |
| **Companion documents** | `docs/white-paper-v1.md` (NL-VISION technical architecture) · `docs/white-paper-strategic-v1.md` (honesty-audit edition) · `VALIDATION.md` (validation protocol) · `NEUROLJUS_CORE_SPEC.md` (N-of-1 research specification) |

> **How to cite:** Ospina, E. (2026). *NeuroLjus: Illuminating Understanding — An Empathic, Privacy-First Platform for Autism Care Discovery, Community, and Caregiver Support* (Strategic White Paper v2.0.1). NeuroLjus. https://doi.org/10.5281/zenodo.20775583

> **Development-status legend.** To keep this document both *visionary and realistic*, every major capability is marked with its maturity: **[Live]** — deployed and demonstrable at neuroljus.com today; **[In Development]** — prototyped, specified, or partially built; **[Planned]** — designed and on the roadmap, not yet built. NeuroLjus treats honest product communication as a core value: the same scientific humility applied to movement-signal interpretation is applied to the claims in this paper.

> **Keywords:** autism, neurodiversity, assistive technology, privacy by design, on-device AI, caregiver support, care navigation, digital inclusion, GDPR, ethical AI, data sovereignty, social innovation

> **Revision note (v2.0.1).** Adds §4.3 "The Roadmap as a Value Sequence" — a non-hype narrative bridge; the subsequent §4 subsections are renumbered accordingly. All other v2.0 content is unchanged.

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
- Appendices:
  - [A — Glossary](#appendix-a--glossary)
  - [B — Figures Deferred to a Future Version](#appendix-b--figures-deferred-to-a-future-version)
  - [C — References](#appendix-c--references)
  - [D — Suggested Figures](#appendix-d--suggested-figures)

---

## 1. Executive Summary

### 1.1 Overview

**NeuroLjus** (Swedish: *neuro* + *ljus*, "neuro light") is an independent social-innovation initiative building an empathic, privacy-first digital platform at one of the most underserved intersections in health technology: **helping autistic individuals, their families, and their caregivers find suitable care, connect with community, and be understood**. Founded by Elizabeth Ospina — a Master of Economics and an active caregiver — NeuroLjus translates lived caregiving experience into technology designed around dignity, transparency, and consent rather than surveillance or false certainty.

NeuroLjus is conceived as a connected ecosystem with four pillars: **(1) Care Location Mapping** — a transparent way to discover and compare care facilities and support services; **(2) a Community Platform** — moderated spaces where families, care professionals, and support workers share knowledge; **(3) AI-Powered Assistance** — privacy-preserving, non-diagnostic support that helps caregivers interpret what they observe and find relevant information; and **(4) a Resource Library** — curated educational materials, best practices, and practical tools.

The platform's first pillar is already operational. Its flagship capability, **NL-VISION** **[Live]**, runs entirely in the browser: a standard webcam feeds a MediaPipe Holistic vision pipeline that extracts reproducible *movement signals* — blink rate, mouth opening, hand-to-face proximity, and motion magnitude — without ever transmitting raw video off the device. A companion **Care Chat** assistant **[Live]** helps caregivers reason about those signals and next steps in Swedish, English, or Spanish. NeuroLjus is explicitly **non-diagnostic**: it measures observable movement, never inferred emotion.

NeuroLjus is built in Sweden, grounded in European privacy law, and architected so that **users retain ownership and control of their data** by default. It is designed to grow from a caregiver tool today into a multi-stakeholder ecosystem serving families, municipalities, care providers, researchers, and strategic partners.

### 1.2 Mission

> *Create empathetic technology that honors the dignity of every person, verbal or non-verbal. Build bridges where others see barriers.*

### 1.3 Vision

> *A world where every mind is understood, every signal is interpreted with care, and every autistic person has a voice — in their own way.*

### 1.4 The Problem Being Solved

An estimated 1 in 100 children worldwide — and as many as 1 in 36 among 8-year-olds in recent U.S. surveillance — live with autism spectrum conditions [1, 2], and a significant subset (around 30%) remain non-verbal or minimally verbal [3]. The systems meant to support them are fragmented and opaque. Families searching for residential care, day programs, or respite services navigate a maze of disconnected municipal, clinical, and educational silos with no neutral way to discover, compare, or trust their options [5]. Caregivers interpret subtle behavioral cues under chronic cognitive load, often in isolation and without objective reference. Meanwhile, the dominant technological response — cloud-based "emotion recognition" — streams video to remote servers, imposes neurotypical affect models, and rests on a scientifically contested premise [6].

NeuroLjus addresses the gap directly: **discovery without opacity, community without surveillance, and AI assistance without diagnosis** — built on an architecture where personal data stays under the user's control.

### 1.5 Expected Impact

| Stakeholder | Near-term impact | Long-term impact |
|---|---|---|
| **Autistic individuals** | Sensory-friendly design; reduced misinterpretation of distress | Person-specific (N-of-1) expression and communication support |
| **Families & caregivers** | Objective movement signals; AI-assisted interpretation; reduced isolation | Peer community; transparent care navigation; shared observation logs |
| **Care providers** | Non-diagnostic observational support; multilingual access | Workforce training; interoperable, person-centered documentation |
| **Municipalities** | Pilot-ready, GDPR-aligned technology | Population-level service transparency and capacity mapping |
| **Researchers & universities** | Open, reproducible methods; preregistration intent | Privacy-preserving, neurodiversity-affirming datasets |
| **Investors & partners** | Defensible technical niche; credible ethics positioning | Scalable freemium + institutional ecosystem |

NeuroLjus makes no clinical-efficacy claims today. Expected impact is framed as **caregiver empowerment, transparency, community, and inclusion** — outcomes to be measured through co-designed studies as the platform matures (Section 12).

### 1.6 Why This Document Exists

This white paper sets out the full platform vision for the audiences NeuroLjus must align: investors, municipalities and public institutions, care providers, families, researchers, and strategic partners. It is written to be adapted into an open, citable publication (Zenodo DOI, ORCID linkage) and uses academic-style references throughout, with any figures not yet sourced (e.g., regional wait times, market size) flagged in Appendix B. Throughout, capabilities are labeled **[Live]**, **[In Development]**, or **[Planned]** so that no reader confuses ambition with current functionality.

---

## 2. Introduction

### 2.1 Global Challenges Faced by Autistic Individuals and Their Families

Autism spectrum conditions affect an estimated 1 in 100 children worldwide, with profound heterogeneity in communication style, sensory processing, and support needs [2]; recent U.S. surveillance reports a markedly higher identified prevalence of 1 in 36 [1]. For individuals who are non-verbal or minimally verbal — roughly 30% of autistic children [3] — everyday life means navigating environments designed for neurotypical communication, where the mismatch in mutual understanding runs in both directions rather than residing in the autistic person alone [13].

Families carry a disproportionate and chronic burden. A 2025 systematic review and meta-analysis of nearly 14,000 caregivers found a pooled depression prevalence of 45% — rising to roughly 54% in European studies [4] — driven by communication barriers, lengthy diagnostic and support delays, financial strain from private therapies and adaptive equipment, and social stigma that narrows community participation. These burdens are unevenly distributed: immigrant families, single caregivers, and rural households face compounded barriers to information and services [5]. NeuroLjus originates in Sweden — a country with comparatively strong welfare infrastructure — yet even here, caregivers describe fragmentation, opacity, and a shortage of tools designed *with* rather than merely *for* autistic individuals.

### 2.2 Difficulties Finding Suitable Care, Support, and Community Resources

Finding appropriate residential care, supported living, day programs, respite, or therapy resembles a maze more than a marketplace — a pattern documented in studies of fragmented services and unmet need among families of children with special health-care needs [5]:

- **Information asymmetry** — families rarely know what options exist, what quality looks like, or how to compare providers.
- **Geographic mismatch** — suitable placements may be far from familiar environments and support networks.
- **Institutional silos** — social services, healthcare, education, and disability agencies operate with separate databases and eligibility rules.
- **Language and cultural gaps** — multilingual and migrant families struggle to navigate single-language official portals.

The result is that decisions affecting a vulnerable person's entire daily life are frequently made under time pressure, without adequate comparison, and on the strength of private word-of-mouth that excludes the most marginalized families.

### 2.3 Fragmentation of Information and Services

Digital tools for disability support have proliferated, yet they rarely interoperate. The table below illustrates the structural disconnection NeuroLjus is designed to bridge:

| Domain | Typical tools today | Integration gap |
|---|---|---|
| Clinical records | Electronic health records | Inaccessible to families; not designed for sensory profiles |
| Social care | Municipal case-management systems | Opaque to caregivers; no comparison functionality |
| Peer support | Social-media groups, informal networks | Unmoderated; no quality signal; privacy risk |
| Assistive technology | AAC apps, wearables | Siloed; no shared baseline or signal fusion |
| AI assistants | Generic chatbots | No autism specialization; often cloud video analysis |

Each tool solves a slice of the problem and none speaks to the others. Families become the human integration layer — manually carrying context between systems that were never built to connect.

### 2.4 Why Now

Four converging trends create the window for NeuroLjus:

1. **On-device AI maturity.** Browser-based inference (MediaPipe, WebAssembly, WebGPU) makes meaningful vision processing possible without sending data to the cloud [9].
2. **Regulatory momentum.** GDPR and the EU AI Act, alongside growing scrutiny of biometric surveillance, are creating real demand for privacy-by-design alternatives [16, 17].
3. **The neurodiversity movement.** Autistic self-advocacy has shifted public discourse toward acceptance and away from "normalization," changing what good assistive technology is expected to be [11, 12].
4. **A caregiver-workforce crisis.** Staffing shortages across disability services raise the value of decision-support tools that reduce cognitive load without replacing human judgment.

### 2.5 From Caregiving to Code: The Founder's Perspective

NeuroLjus did not begin in a technology incubator. Elizabeth Ospina — a Master of Economics working as a caregiver — recognized that non-verbal autistic individuals have a great deal to express, and that existing tools failed to bridge silent expression and caregiver understanding. The first use case is not hypothetical: it emerges from the daily interpretation of hand movements, mouth patterns, and proximity behaviors — the very signals NL-VISION now measures reproducibly and on-device. The platform extends that foundation outward toward community and institutional scales, while keeping its ethical core anchored in lived experience.

### 2.6 Alignment with the Neurodiversity Paradigm

NeuroLjus is built on the **neurodiversity paradigm**, which understands autism as a natural variation in human neurology rather than a deficit to be corrected [11, 12]. This alignment is operational, not rhetorical: the system does not score autistic individuals against neurotypical baselines, it rejects universal emotion labels in favor of person-specific patterns, it prioritizes sensory-friendly design, and it positions AI as accompaniment for caregivers — never correction of autistic behavior. Community, educational, and future immersive modules will be co-designed with autistic advisors to avoid the well-documented failure mode of "about us, without us" disability technology [14].

---

## 3. Problem Statement

### 3.1 Current Limitations in Care Discovery

There is no neutral, accessible, structured registry through which a family can discover providers filtered by support model, sensory environment, staffing ratios, languages spoken, or proximity. In its absence, three failure patterns dominate:

- **Word-of-mouth dependence**, where quality information travels through private networks and excludes those without them [5].
- **Crisis-driven decisions**, where placements are accepted under acute time pressure with little comparison.
- **Commercial opacity**, where the few directories that exist optimize for listing fees rather than family outcomes.

### 3.2 Lack of Transparency

Transparency deficits affect every stakeholder simultaneously. Families cannot easily verify staffing qualifications, incident histories, or sensory-environment policies. Municipalities lack real-time visibility into capacity and person-centered outcomes across providers. Providers themselves struggle to communicate specialized competencies to referring agencies [5]. The information that would allow trust to form simply is not collected, structured, or shared.

### 3.3 Difficulty Comparing Support Options

Meaningful comparison requires structured, machine-readable data — accommodation types, communication-support levels, cost models, waiting lists. This data rarely exists in standardized form. Without shared schemas, even well-intentioned portals degrade into unstructured brochures, and families are left comparing incommensurable descriptions written by providers about themselves.

### 3.4 Social Isolation Among Families

Caregiver burnout is endemic. A pooled prevalence of roughly 45% for clinically significant depressive symptoms has been reported among caregivers of autistic children [4]. Isolation is amplified when stigma discourages open conversation about behavioral crises, when online communities lack moderation and privacy safeguards, and when professional respite or counseling is unavailable or unaffordable [5]. The people most in need of connection are often the least able to seek it.

### 3.5 Challenges for Municipalities and Care Providers

Public institutions and providers face their own structural pressures:

| Challenge | Description | NeuroLjus relevance |
|---|---|---|
| **Aging / strained workforce** | Recruitment and retention difficulties in disability services | Caregiver decision-support reduces cognitive load **[Live / In Development]** |
| **Budget constraints** | Flat or declining per-capita social-care funding | Better matching and prevention reduce costly crisis interventions **[Planned]** |
| **Regulatory compliance** | GDPR, documentation, incident reporting [16] | Privacy-by-design architecture; interoperable exports **[Live / Planned]** |
| **Quality assurance** | Hard to measure person-centered outcomes | Co-designed metrics; open validation methodology **[In Development]** |
| **Slow innovation procurement** | Cautious adoption of assistive technology | Pilot-ready demo; no legacy integration required **[Live]** |

Municipalities need solutions that are **legally defensible, ethically grounded, and pilot-ready**. A tool that runs in the browser, keeps data local, and makes no diagnostic claims is an unusually low-risk entry point for supervised public-sector pilots.

### 3.6 The Scientific Problem With "Emotion AI"

A distinct but related problem pervades the assistive-AI market: the claim that cameras can infer internal emotional states. For autistic individuals this claim is especially fragile. Training datasets skew neurotypical; autistic facial expressions are more variable and less reliably mapped to assumed affect categories; and a substantial literature questions whether emotion can be validly inferred from the face at all [6, 7]. NeuroLjus rejects this paradigm outright. Its sensing layer measures **movement signals**, not emotions — a narrower, more honest, and more defensible scientific claim, detailed in the companion technical white paper.

---

## 4. The NeuroLjus Solution

### 4.1 Platform Overview

NeuroLjus is a **layered platform** whose foundation is already operational and whose upper layers are designed to be built with municipal, clinical, and community partners. The four user-facing pillars sit on a privacy core that is common to every layer.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          NEUROLJUS PLATFORM                          │
├──────────────────────────────────────────────────────────────────────┤
│  FOUR USER-FACING PILLARS                                            │
│    1. Care Location Mapping ............................... [Planned]│
│    2. Community Platform .................................. [Planned]│
│    3. AI-Powered Assistance .................................. [Live]│
│    4. Resource Library ............................. [In Development]│
├──────────────────────────────────────────────────────────────────────┤
│  OPERATIONAL ENGINES                                                 │
│    NL-VISION — on-device movement-signal sensing ............. [Live]│
│    Care Chat — non-diagnostic multilingual assistant ......... [Live]│
├──────────────────────────────────────────────────────────────────────┤
│  PRIVACY CORE: local-first processing · consent · data minimization  │
│                · user data ownership · GDPR by design                │
└──────────────────────────────────────────────────────────────────────┘
```

**Diagram description (Figure 1).** A stacked architecture diagram. The top band shows the four user-facing pillars with status badges. The middle band shows the two operational engines (NL-VISION sensing and Care Chat assistance). The bottom band is a privacy core spanning the full width, signaling that every higher layer inherits the same data-sovereignty guarantees. A single bold boundary line around the sensing engine indicates that raw video never crosses it — only derived numeric signals do, and only when the user chooses.

### 4.2 The Digital Ecosystem

The long-term ecosystem connects the people who today operate in isolation:

- **Families** seeking understanding, options, and community.
- **Care professionals and support workers** needing observational support and shared knowledge.
- **Municipalities** requiring transparency and capacity-planning tools.
- **Researchers** pursuing privacy-preserving neurodiversity science.
- **Technology partners** integrating wearables, AAC devices, and environmental sensors.

The current implementation delivers the caregiver-facing sensing and assistance engines. The four pillars extend that core into discovery, connection, and learning — without ever collapsing the privacy boundaries that make the platform trustworthy.

### 4.3 The Roadmap as a Value Sequence

The capabilities described in this paper are not a feature wishlist. They are ordered deliberately: each layer is *made possible* by the trust, knowledge, and relationships built by the layer before it, and in turn *makes the next layer more valuable*. The roadmap is therefore a cumulative **value sequence** rather than a set of parallel bets — and it is designed to be **built in Sweden and adapted globally**.

The sequence runs:

**NL-VISION → Resource Library → Community → Care Mapping → Municipal Partnerships → NeuroLjus House**

This build order is distinct from the pillar numbering in Section 4.1 (which lists the platform's components) and maps onto the phased timeline in Section 11; the concern here is *why this order creates value*, not when each stage ships.

| # | Stage | Status | What it establishes | What it makes possible next |
|---|---|---|---|---|
| 1 | NL-VISION + Care Chat | **[Live]** | A working, privacy-first, non-diagnostic tool — the credibility anchor and a reason for families and institutions to engage today | A trusted point of entry and the first supervised pilot relationships |
| 2 | Resource Library | **[In Development]** | Curated, source-cited knowledge that deepens engagement without requiring identifiable data | A reason to return, and the first co-design relationships with autistic advisors and practitioners |
| 3 | Community | **[Planned]** | Connection among families and professionals — the first network effects and lived-experience signal no directory can purchase | Verified, real-world insight a care directory needs to be trustworthy |
| 4 | Care Mapping | **[Planned]** | A structured, comparable, community-verified view of the care landscape | The largest-surface problem addressed, and a two-sided network effect (providers ↔ families) |
| 5 | Municipal Partnerships | **[Planned]** | Public-sector legitimacy, authoritative data, and a sustainable, non-surveillance revenue path under the LSS framework | Institutional anchoring and the data relationships the ecosystem layer requires |
| 6 | NeuroLjus House | **[Planned]** | An integration layer unifying tools, knowledge, community, directory, and institutional relationships | A coordinated digital-and-physical ecosystem — the consequence of the prior layers, not a leap beyond them |

Three things compound across this sequence. **Trust** compounds: a non-diagnostic tool that a municipality can adopt without legal risk earns the relationships on which the later, higher-stakes layers depend. **Data** compounds: community insight makes the directory credible, and the directory makes municipal capacity-mapping possible. **Relationships** compound: each autistic advisor, caregiver, provider, and municipal partner makes the next layer easier to co-design and to validate. Removing any earlier layer weakens every layer after it — which is why the *order*, not only the contents, is load-bearing.

**Built in Sweden, designed for global adaptation.** Sweden is a demanding proving ground rather than a niche market: it is GDPR-native, governed by the LSS disability-rights framework, subject to formal ethics review (Etikprövningsmyndigheten), and served by comparatively strong municipal data infrastructure. A platform that satisfies those constraints has, in effect, been stress-tested against some of the strictest privacy and public-sector requirements anywhere. The underlying *problem*, however, is not Swedish: caregiver distress is documented globally [4], and the scientific fragility of inferring emotion from the face is well established [6]. Validating the *method* under Swedish conditions therefore yields a model built to transfer.

The architecture is designed for that transfer rather than retrofitted to it. On-device, local-first processing means there is no central data gravity binding the system to one jurisdiction; the structured care-data schema (Section 5.1) is re-pointable to other regions' provider landscapes; content is multilingual from the outset (Swedish, English, Spanish today); and the N-of-1 personalization approach (Section 9.3) avoids dependence on any single national dataset. Geographic adaptation is therefore closer to a configuration-and-partnership exercise than a rebuild.

This sequence is a falsifiable hypothesis about value creation, not a promise of inevitability. Every stage beyond the operational engines is **[In Development]** or **[Planned]**; each is gated on co-design, funding, ethics approval, and evidence (Section 11); and any stage may be revised as the prior one is validated. The claim is deliberately narrow: *if* the earlier layers earn trust and generate data, *then* the later layers become both more feasible and more valuable than they would be if attempted cold.

### 4.4 User-Centered Design

NeuroLjus design principles are concrete and, where live, already visible in the product:

| Principle | Implementation |
|---|---|
| **Sensory-friendly UI** | Low-stimulus mode, monochrome filter, low-light adjustment, optional hidden camera preview **[Live]** |
| **Multilingual access** | Swedish, English, and Spanish content across the site and assistant **[Live]** |
| **Caregiver-first framing** | Tools support the person holding the device — not surveillance of the autistic individual **[Live]** |
| **Progressive disclosure** | Camera optional; AI optional; signals shared with AI only on an explicit message **[Live]** |
| **Plain-language honesty** | Non-diagnostic disclaimers; the movement index is labeled as a heuristic, not a verdict **[Live]** |

Formal participatory co-design with autistic individuals and caregivers is identified as required work for the validation phases (Section 12); the current product reflects founder-caregiver expertise and engineering iteration.

### 4.5 Accessibility-First Approach

Accessibility is treated as a design constraint, not a late-stage audit. NeuroLjus commits to **WCAG 2.2 AA** as a target standard, with semantic landmarks, ARIA labeling on interactive dashboards and language toggles, and reduced-motion-aware interactions already present **[Live]**. A full conformance audit, screen-reader optimization of real-time dashboards, high-contrast themes, and cognitive-accessibility patterns for crisis-mode interfaces are scoped as near-term work **[In Development / Planned]**. Accessibility extends to *cognitive* and *sensory* access — not only motor and visual — which is why low-stimulus modes are first-class features rather than settings buried in a menu.

---

## 5. Core Features

The four pillars below describe the **designed platform**. Status badges indicate maturity. Roadmap pillars are presented in full because they respond to documented stakeholder needs and define the partnerships NeuroLjus is building toward — but readers should not interpret **[Planned]** capabilities as shipped functionality.

### 5.1 Care Location Mapping **[Planned]**

**Purpose.** Replace word-of-mouth and commercial directories with a transparent, structured, comparison-first way to discover care.

**Search and discovery.** Families and case workers will search facilities, supported-living arrangements, day programs, and respite services by location, support model, sensory environment, languages spoken, age range, and accessibility features. Results will be available in both map and list views, filterable by municipality, so that proximity to family and familiar environments is a first-class criterion rather than an afterthought.

**Structured information.** Each provider will have a structured profile built on a shared, machine-readable schema — accommodation type, communication-support level, staffing model, sensory-environment policy, cost/funding model, and current waiting-list status. Structured data is what makes genuine comparison possible; unstructured brochures are not. Where available and consented, structured data will be cross-checked against municipal records to reduce self-reporting bias.

**Reviews and community insights.** Moderated, verified reviews from families and professionals will surface lived-experience signals that official descriptions omit — sensory environment in practice, responsiveness during crises, communication culture. Moderation and verification are essential to prevent both astroturfing and the privacy harms of unmoderated forums.

**Design commitment.** Care mapping will prioritize *transparency and family outcomes* over paid placement. This is a deliberate differentiator from commercial directories whose incentives favor providers who pay, not families who choose.

**Diagram description (Figure 2).** A two-panel mockup: left, a filter rail (support model, sensory environment, language, distance, availability) over a map with clustered provider pins; right, a structured comparison view placing two providers side-by-side across standardized fields, with a clearly labeled "community insights" section beneath verified facts.

### 5.2 Community Platform **[Planned]**

**Purpose.** End the isolation that defines so much of the caregiving experience by connecting families, care professionals, and support workers in moderated, privacy-preserving spaces.

**Who it serves.**

- **Families** — peer support, practical strategies, and the reassurance of shared experience.
- **Care professionals** — exchange of observational techniques, de-escalation strategies, and sensory-accommodation practices.
- **Support workers** — handover knowledge, shift-level insight, and onboarding support.

**Knowledge sharing.** The platform will host structured knowledge — sensory profiles, communication strategies, regulatory guidance — alongside open discussion. Role-based spaces (family, caregiver, clinician, researcher) will let participants find relevant peers without exposing clinical data they would rather keep private.

**Empowerment, not extraction.** Community is where NeuroLjus most directly enacts its value of **community empowerment**: participants own their contributions, control their visibility, and are never the product. Identity options will be privacy-preserving by default, and no participant will be required to disclose a diagnosis or clinical detail to take part.

**Safety and moderation.** Unmoderated peer groups carry real risks — misinformation, privacy breaches, and harassment. NeuroLjus will invest in human-supported moderation, clear community guidelines co-authored with autistic advisors, and reporting tools, treating moderation cost as a core operating expense rather than an externality.

### 5.3 AI-Powered Assistance **[Live]**

This pillar is **operational today** and anchors the platform's credibility. It comprises two engines: on-device sensing and an optional, non-diagnostic language assistant.

#### 5.3.1 NL-VISION — On-Device Movement-Signal Sensing **[Live]**

NL-VISION is accessible at `/labs/nl-vision` on neuroljus.com. It captures webcam video **locally in the browser**, runs a MediaPipe Holistic pipeline for face and hand landmarks, and extracts reproducible per-frame signals:

| Signal | Definition | Storage |
|---|---|---|
| Face / hand presence | Landmark presence and count | Derived numeric only |
| Face / hand motion | Inter-frame displacement (motion magnitude) | Derived numeric only |
| Hand-to-face proximity | Normalized hand-center ↔ face-center distance | Derived numeric only |
| Eye aspect ratio / blink rate | EAR crossings within a rolling window | Derived numeric only |
| Mouth opening | Mouth-open ratio | Derived numeric only |

Signals are aggregated into rolling windows and displayed on a live dashboard. A coarse **movement index** (Calm / Elevated / High) is computed from heuristic thresholds and is explicitly **not** validated as an affective state — a limitation NeuroLjus states openly rather than obscures.

**Privacy guarantee.** Raw video never leaves the device. Only derived numeric signals are persisted, locally, under the user's control. There is no central vision-compute cluster and therefore no class of cloud privacy risk associated with it.

#### 5.3.2 Care Chat — Non-Diagnostic Multilingual Assistant **[Live]**

Care Chat is an **optional** server-side assistant that helps caregivers reason about what they observe and find relevant information. It accepts caregiver text and, *only when the caregiver chooses to send a message*, the derived numeric signals — never images. It responds with empathic, concrete, non-diagnostic guidance that uses explicit uncertainty language, in Swedish, English, or Spanish. Safeguards include per-user rate limiting, message-length caps, request timeouts, and a system prompt that constrains the assistant to a supportive, non-diagnostic role.

#### 5.3.3 Intelligent Recommendations, Information Discovery, and Personalization

| Capability | Status |
|---|---|
| Contextual assistance based on live signals | **[Live]** |
| Heuristic movement index (Calm/Elevated/High) | **[Live]** — thresholds hand-coded, to be data-derived |
| Information discovery across the resource library and care map | **[Planned]** — depends on Pillars 1 & 4 |
| Personalized N-of-1 baselines (per-individual norms) | **[In Development]** — specified in `NEUROLJUS_CORE_SPEC.md` |
| Anomaly detection vs. a personal baseline | **[Planned]** |
| Multi-signal fusion (vision + HRV + ambient) | **[In Development]** — Sensors Hub prototype exists |

The trajectory is from generic heuristics toward **person-specific** intelligence: recommendations grounded in an individual's own baseline, never in a population average imposed from outside.

### 5.4 Resource Library **[In Development]**

**Purpose.** Curate trustworthy, accessible knowledge so that families and professionals are not left to assemble it from scattered, uneven sources.

**Educational materials.** Plain-language explainers on autism, sensory processing, communication differences, and caregiver wellbeing — written with, and reviewed by, autistic advisors and practitioners.

**Best practices.** De-escalation, sensory accommodation, and crisis-planning guidance translated from research and practitioner expertise into usable form, each item carrying its source citation.

**Guides and tools.** Downloadable, practical artifacts — communication boards, observation logs, crisis-planning templates. A concrete foundation already exists in a **42-signal Swedish communication board** design (e.g., *"Jag har ont"* / "I am in pain") with caregiver guidance, intended as the basis for a future AAC-style quick-communication module.

**Status.** Educational content today is limited to the About narrative, the white papers, and policy pages; a structured, searchable library with a content-management workflow is in early development. The 42-signal artifact is a design asset, not yet an in-app feature.

### 5.5 Feature Summary

| Pillar / capability | Status | Notes |
|---|---|---|
| NL-VISION on-device sensing | **[Live]** | `/labs/nl-vision` |
| Live signal dashboard | **[Live]** | Real-time derived signals |
| Care Chat (non-diagnostic AI) | **[Live]** | SV / EN / ES |
| Multilingual site | **[Live]** | Swedish, English, Spanish |
| Resource library | **[In Development]** | 42-signal board as seed asset |
| N-of-1 personalization | **[In Development]** | `NEUROLJUS_CORE_SPEC.md` |
| Care location mapping | **[Planned]** | Requires municipal data partnerships |
| Community platform | **[Planned]** | Requires auth + moderation investment |

---

## 6. Technology Architecture

### 6.1 Modern Cloud Architecture **[Live]**

The production application follows a **Jamstack / serverless** pattern that keeps the heaviest and most sensitive processing on the client:

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 15, React 19, TypeScript | Static generation + serverless API routes |
| Styling | Tailwind CSS | Accessible, themeable design system |
| Vision inference | MediaPipe Holistic (browser) | Client-side only; no cloud egress of video |
| Language inference | Cloud LLM via server API route | Optional; text and numeric metrics only |
| Hosting | Vercel | Continuous deployment from `main` |
| Local persistence | Browser local storage | Derived signals only — never raw video |

**Diagram description (Figure 3).** A deployment diagram: the user's browser contains the full vision pipeline (camera → landmarks → derived signals → local storage → dashboard), enclosed in a bold privacy boundary. A single optional arrow crosses that boundary — an HTTPS request to a serverless function — carrying *only* text and numeric metrics to the language model when the caregiver explicitly sends a message. Raw frames never cross the line.

### 6.2 Scalability

The architecture scales along two independent axes. **Web and assistant traffic** scale horizontally through the serverless platform. **Vision processing scales per device** — each browser does its own inference — which eliminates an entire category of central infrastructure cost and privacy exposure. Roadmap pillars (care database, community) will introduce a managed PostgreSQL database with row-level security, a content delivery network, background indexing and notification jobs, and, for international expansion, geographic replication **[Planned]**.

### 6.3 Security

Current measures include API rate limiting and input sanitization, server-side secrets management (API keys never reach the browser), enforced HTTPS, and exclusion of secrets from version control **[Live]**. As identifiable data enters with the community and care pillars, NeuroLjus will add standards-based authentication (OAuth 2.0 / passkeys), end-to-end encryption for sensitive caregiver notes, independent security audits before any pilot involving identifiable data, and a coordinated vulnerability-disclosure process **[Planned]**.

### 6.4 Privacy by Design

Privacy is architectural, not a policy bolt-on. Six commitments define it:

1. **Local processing by default** — video is processed in-browser; raw frames are never stored or transmitted.
2. **Data minimization** — only numeric aggregates are persisted, never images or identifiers.
3. **Purpose limitation** — signals support caregiver interpretation, never profiling or automated decisions about the autistic individual.
4. **Granular consent** — sensing, AI assistance, and any data sharing are independently opt-in.
5. **Revocation** — the user can stop the camera, clear local data, or disengage the assistant at any moment.
6. **User data ownership** — *users retain ownership and control of their data.* With no mandatory account, there is no vendor lock-in of personal data today; future accounts will ship with export, portability, and deletion as first-class rights (Section 7.4).

### 6.5 GDPR Compliance

NeuroLjus is built natively under European law. Behavioral or biometric signals tied to a health context may fall under **GDPR Article 9 (special-category data)**, and the architecture is designed to honor that from the outset:

| Requirement | Status |
|---|---|
| Privacy by design and by default (Art. 25) | **[Live]** — on-device architecture |
| Data minimization (Art. 5(1)(c)) | **[Live]** — numeric signals only |
| Purpose limitation | **[Live]** — caregiver support only |
| Data Protection Impact Assessment (Art. 35) | **[Planned]** — before human-subjects validation |
| Documented legal basis | **[Planned]** — before public pilots with identifiable data |
| Swedish ethics review (Etikprövningsmyndigheten) | **[Planned]** — required for validation studies with sensitive data |

### 6.6 AI Integration

AI appears at two clearly separated levels. On-device **computer vision** performs deterministic signal extraction with pretrained models and no production training on user data. An optional **cloud language model** generates caregiver guidance under a tightly constrained, non-diagnostic system prompt, with conservative generation settings. Future AI integration — self-/weakly-supervised multimodal representation learning, temporal fusion across vision and physiological signals, and **personal adapters** for N-of-1 few-shot learning, with federated or on-device training that exports only anonymized summaries — is specified in `NEUROLJUS_CORE_SPEC.md` **[In Development / Planned]**.

### 6.7 Future Interoperability With Healthcare Systems **[Planned]**

To participate responsibly in the wider care ecosystem, NeuroLjus plans standards-based interoperability: **HL7 FHIR** resources for observation signals (explicitly coded as non-diagnostic), **openEHR** templates for person-centered sensory profiles, exports compatible with Swedish municipal case management under the **LSS** framework, and connectors to wearable APIs (Apple HealthKit, Google Health Connect, Polar BLE). Today's signal schema is a deliberate precursor whose field definitions are designed to map cleanly onto future FHIR observations.

---

## 7. Ethical AI Principles

NeuroLjus operationalizes ethics in code and documentation, not only in mission statements. Each principle below is paired with how it is enforced today and how it will deepen.

### 7.1 Transparency

Signal definitions, thresholds, and limitations are documented openly (`VALIDATION.md`, technical white paper). The live dashboard carries an explicit non-diagnostic disclaimer, and the movement-index thresholds are openly acknowledged as hand-coded heuristics rather than data-derived truths — an unusual but deliberate honesty in AI product communication.

### 7.2 Explainability

Every dashboard indicator maps to a named, measurable signal (blink rate, hand-to-face proximity, mouth opening), so a caregiver can always trace *what* produced a reading. The assistant is instructed to use uncertainty language and to avoid diagnostic claims. Future N-of-1 models will be required to surface "I don't know" states and to expose feature attributions rather than opaque scores **[Planned]**.

### 7.3 Human Oversight

The AI suggests; the human decides. No automated action is ever taken on the autistic individual, and no alert fires without caregiver engagement. Any future proactive prompts will require explicit opt-in and human confirmation **[Planned]**.

### 7.4 Data Ownership

**Users retain ownership and control of their data.** Today, local-only storage means there is no cloud copy of personal signals to surrender. As accounts arrive, NeuroLjus commits to GDPR-grade **export, portability, and deletion** as built-in rights, not support-ticket favors — and to never selling personal data under any circumstances.

### 7.5 User Consent

Camera access requires explicit browser permission; AI assistance requires a deliberate message; data sharing will be independently consented. For validation studies involving non-verbal individuals who cannot independently consent, NeuroLjus will implement **guardian consent plus participant assent** procedures co-developed with ethicists and autistic advisors **[Planned]**.

### 7.6 Responsible AI Usage

NeuroLjus explicitly commits **not** to: train on universal "emotion" datasets and apply them to autistic people; induce eye contact or aversive stimuli "for the data"; optimize aggregate accuracy in ways that erase individual difference (violating the N-of-1 principle); gamify emotional or movement states; or make clinical claims without evidence.

### 7.7 Ethical Principles Summary

| Principle | Current implementation | Planned enhancement |
|---|---|---|
| Transparency | Open signal documentation; visible disclaimers | Public algorithm-audit reports |
| Explainability | Named signals; uncertainty language | Feature attribution for N-of-1 models |
| Human oversight | Manual caregiver interpretation | Confirmed-action alert workflow |
| Data ownership | Local-only storage; no lock-in | GDPR export/portability/deletion API |
| Consent | Browser + per-message consent | Granular consent dashboard; guardian/assent model |
| Non-diagnosis | System prompt + UI disclaimers | Clinical-boundary monitoring |
| Fairness | Low-light / monochrome modes | Skin-tone- and lighting-stratified validation |
| Anti-surveillance | Caregiver-device framing | Enforced institutional-use policy |

---

## 8. Social Impact Framework

### 8.1 Benefits for Autistic Individuals

Near term, autistic individuals benefit indirectly but materially: caregivers equipped with objective movement signals are less likely to misread distress, and sensory-friendly interface options model respect for autistic sensory profiles even in a caregiver-facing tool. Long term, the N-of-1 direction promises **communication support that honors each person's unique expression**, co-designed micro-decision tools, and — by improving informed choice — fewer placements driven by crisis rather than fit. Impact metrics will be defined *with* autistic co-researchers; no efficacy is claimed at this stage.

### 8.2 Benefits for Families

Families gain reduced cognitive load through the real-time signal dashboard, AI-assisted interpretation in three languages, and — as the community and care pillars arrive — **reduced isolation** and **transparent navigation** of an otherwise opaque system. The platform is designed so that a family's data and contributions remain theirs, reinforcing trust precisely where trust has been scarce.

### 8.3 Benefits for Care Providers

Providers gain non-diagnostic observational support during shifts, a structured signal vocabulary that improves handover communication, and, via the resource library, workforce-onboarding material. Over time, interoperable documentation and **person-centered quality indicators** (rather than mere compliance metrics) can help good providers demonstrate the quality that opaque markets currently hide.

### 8.4 Benefits for Municipalities

Municipalities gain a **pilot-ready, GDPR-aligned** technology that requires no legacy integration, a credible evidence-generation pathway (open methods, preregistration intent, Zenodo deposit), and multilingual accessibility for diverse populations. Long term, care-capacity mapping and service-gap analysis can support planning, and opt-in anonymized aggregates can enable cross-municipal benchmarking. Sweden's **LSS** framework provides a natural policy context for institutional partnership [18].

### 8.5 Long-Term Societal Impact

If NeuroLjus realizes its roadmap within its ethical boundaries, the societal effects compound: a **norm shift** away from neurotypical emotion AI toward person-specific understanding; reusable **digital-inclusion** models across neurodivergent populations; a research contribution to privacy-preserving assistive sensing; and potential **policy influence** on how the EU AI Act is implemented for vulnerable populations. Economic efficiency — through better matching and reduced crisis intervention — is plausible but explicitly *contingent on validated outcomes*.

### 8.6 Stakeholder Impact Matrix

| Stakeholder | Primary pain | Near-term response | Long-term response |
|---|---|---|---|
| Autistic individual | Misunderstood needs | Sensory-friendly design; better caregiver reads | N-of-1 expression tools |
| Family caregiver | Isolation; interpretation burden | NL-VISION + Care Chat | Community; transparent care map |
| Support worker | Handover and training gaps | Signal dashboard | Resource library; interoperable exports |
| Clinician | No objective behavioral reference | Open validation methodology | Research partnerships |
| Municipality | Opaque service landscape | Low-risk pilot entry | Capacity mapping; benchmarking |
| Researcher | Lack of ethical datasets | Open, reproducible methods | Privacy-preserving / federated data |
| Investor / partner | Trust in AI ethics | Defensible niche; live product | Scalable ecosystem |

### 8.7 Theory of Change

**Inputs:** caregiver expertise; on-device AI engineering; open validation methodology; multilingual, accessible design; GDPR-aligned architecture. **Activities:** operate the sensing + assistant engines; publish open white papers; pursue ethics-approved validation; co-design pillars with stakeholders; build municipal and research partnerships. **Outputs:** caregivers access real-time signals and optional guidance; open documentation; pilot datasets and community connections (future). **Short-term outcomes:** reduced caregiver uncertainty; greater awareness of privacy-preserving alternatives; institutional pilot adoption. **Long-term outcomes:** transparent care matching; reduced isolation; validated personalization; influence on assistive-AI standards. **Assumptions and external risks** (regulatory change, model dependency, funding, moderation cost) are tracked openly and will be refined with partners and in grant applications.

---

## 9. Future Vision

The following describe **strategic direction**, subject to co-design, funding, regulatory approval, and validation evidence. They are presented in full because they define the partnerships NeuroLjus is building toward — not because they are shipped.

### 9.1 NeuroLjus House **[Planned — Conceptual]**

**NeuroLjus House** is the vision of a **digital and physical ecosystem hub** that connects every care stakeholder around the autistic individual.

In its **digital dimension**, it is a unified portal integrating all four pillars with role-based workspaces — family, caregiver, clinician, municipal officer, researcher — organized around a calm, sensory-safe "living room" metaphor for coordinated care planning. In its **physical dimension** (aspirational), it is a network of demonstration and co-design spaces where families, autistic advisors, and technologists iterate together, and where municipalities and care organizations can train staff — explicitly co-design and learning venues, never surveillance installations.

**Diagram description (Figure 4).** A hub-and-spoke diagram with "NeuroLjus House" at the center connected to a Family Portal, a Care-Provider Workspace, a Municipal Dashboard, a Research Lab, and a Physical Co-Design Space. The operational sensing/assistant engines occupy one spoke labeled "Phase 1 — live," making clear that the hub grows out of a working foundation rather than a blank slate.

### 9.2 NeuroLjus AR — Immersive Empathy **[Planned — Conceptual]**

**NeuroLjus AR** describes a future **AR/VR experience** that lets neurotypical people — caregivers, educators, municipal staff, family members — better understand sensory experiences associated with autism. Planned elements include carefully designed simulations of sensory overload (auditory, visual, tactile), educational modules on stimming and sensory seeking/avoiding, and facilitated debriefs that build understanding rather than pity.

Because immersive "disability simulation" can do harm if done carelessly — controlled studies find simulations can increase discomfort and pity without improving attitudes [15] — NeuroLjus pre-commits to ethical constraints: **autistic co-designers lead authenticity review**; there is no gamification of distress and no competitive scoring; the experience is always framed as an *approximation*, never a claim to "know what autism feels like"; and accessible alternatives are provided for users who cannot tolerate immersive media. NeuroLjus AR is a **research and partnership opportunity** (Section 12), not a product announcement.

### 9.3 N-of-1 Personalization Engine **[In Development — Specified]**

`NEUROLJUS_CORE_SPEC.md` defines a research-grade personalization model built on **personal baselines and dynamics** rather than population norms. It accepts optional signals (HRV, EDA, respiration, ambient light/noise/temperature, micro-gestures, caregiver comfort markers), uses self-supervised multimodal learning, temporal fusion, anomaly detection, and personal adapters, and follows a phased protocol from a small pilot through language and co-regulation studies toward federated generalization that never imposes universal labels. A Sensors Hub prototype already demonstrates Bluetooth connection to a heart-rate monitor; fusion with NL-VISION is the next integration milestone.

---

## 10. Business Model

NeuroLjus is at a **pre-revenue, experimental stage**. Its sustainability model is drawn from social-innovation and healthcare-technology norms, and is constrained by its values: revenue must never compromise privacy-by-design, non-diagnostic boundaries, or accessibility for underserved families.

### 10.1 Sustainable Growth Philosophy

Growth prioritizes **institutional partnerships and freemium consumer access** over surveillance advertising or data brokerage — business models that are categorically incompatible with NeuroLjus. The most defensible asset is **trust**, and trust is destroyed the moment a user's data becomes the product.

### 10.2 Freemium Services **[Planned]**

| Tier | Audience | Planned features | Price |
|---|---|---|---|
| **Free** | Families, individual caregivers | On-device sensing; limited AI queries; resource-library access | €0 |
| **Plus** | Active care households | Unlimited AI; signal history; export; multi-caregiver profiles | Subscription (pricing TBD) |
| **Pro** | Care organizations | Team dashboards; training modules; priority support | Subscription |
| **Research** | Universities | Anonymized aggregate analytics; validation toolkit | Grant-funded / academic |

A meaningful free tier is a mission requirement, not a marketing tactic: families in crisis must never be paywalled out of basic support.

### 10.3 Institutional Collaboration **[Planned]**

Target partners include Swedish municipalities (LSS departments) for pilot contracts and co-design funding, care providers for organizational licenses and staff training, research institutions for joint grant applications (Horizon Europe, Vinnova, FORTE), and technology partners (wearable and AAC vendors, cloud sponsors). Pilots will use a **fixed-fee + outcome-evaluation** model rather than per-user surveillance pricing.

### 10.4 Partnerships

Today, partnership runs through an open contact channel and openly published documentation that invites replication and validation. A formal partner program, MOU templates, and a municipal procurement guide are planned as institutional interest matures.

### 10.5 Competitive Positioning

| Category | Typical approach | NeuroLjus differentiation |
|---|---|---|
| Emotion-AI vendors | Cloud video; affect labels | On-device movement signals only; no affect claims |
| Generic AI chatbots | General-purpose LLM | Caregiver-specialized, non-diagnostic, signal-aware |
| AAC apps | Symbol boards; speech output | Complementary (42-signal design); observation-first today |
| Care directories | Paid commercial listings | Transparency-first; municipal-partnership model |
| Clinical monitoring | Regulated devices | Explicitly non-diagnostic; experimental; openly validated |
| Social-media groups | Unmoderated peer support | Moderated, privacy-preserving community |

Near-term advantage rests on **ethical credibility plus working technology**: the sensing and assistant engines are deployable today without integration projects — a real edge over roadmap-heavy competitors when courting cautious public-sector pilots.

### 10.6 Funding Pathway

Near-term needs are modest and concrete: validation-study costs (annotation, ethics review, participant compensation), infrastructure (which scales gently with usage), part-time engineering and design for the community and care pillars, and legal/compliance work (DPIA, privacy-policy finalization, MOUs). Sources under exploration include Vinnova innovation grants, Horizon Europe disability and digital-health calls, FORTE social-research funding, municipal pilot contracts, impact-aligned angel investment, and academic doctoral employment at a host institution.

---

## 11. Roadmap (2026–2031)

Dates are indicative and depend on funding, ethics approval, and co-design timelines.

### 11.1 Product Milestones

| Phase | Period | Milestone | Status |
|---|---|---|---|
| **P0 — Foundation** | 2024–2025 | Landing site; NL-VISION; Care Chat; multilingual content | **Complete [Live]** |
| **P1 — Validation prep** | 2026 H1 | On-device vs. cloud benchmarking; reproducibility tests; DPIA draft | **[In Development]** — in progress |
| **P1b — Scientific validation** | 2026 H2–2027 | Signal-accuracy study (consented); fairness audit | **[Planned]** |
| **P2 — Personalization** | 2027–2028 | N-of-1 baselines; vision + HRV fusion; data-derived thresholds | **[In Development]** |
| **P3 — Platform** | 2028–2029 | Resource library (full searchable build-out); community MVP; production authentication | **[Planned]** |
| **P4 — Navigation** | 2029–2030 | Care location mapping (Swedish pilot region) | **[Planned]** |
| **P5 — Ecosystem** | 2030–2031 | NeuroLjus House portal; FHIR interoperability; NeuroLjus AR research pilot | **[Planned]** |

### 11.2 Community Growth

| Period | Target | Notes |
|---|---|---|
| 2026 | 50–100 pilot caregivers (informal) | Via live demo; no community platform yet |
| 2027 | ~500 registered users | Requires authentication **[Planned]** |
| 2028 | ~5,000 community members | Moderated spaces launch |
| 2029 | 3–5 Swedish municipal partnership cohorts | LSS-context pilots |
| 2031 | 25,000+ multi-stakeholder users | International expansion begins |

*User targets are aspirational placeholders pending pilot data.*

### 11.3 Research Partnerships

| Period | Activity |
|---|---|
| 2026 | Zenodo deposit of white papers; preregistration of validation study |
| 2026–2027 | Identify university supervisor (HCI / digital health / cognitive science) |
| 2027 | Ethics-approved Phase 1 validation |
| 2028 | Joint grant applications (Horizon Europe, Vinnova) |
| 2029–2031 | Doctoral research program; federated-learning pilot |

### 11.4 International Expansion

| Period | Geography | Strategy |
|---|---|---|
| 2026–2027 | Sweden | Primary market; Swedish/English content |
| 2028 | Nordics | Scandinavian-language expansion; regional partnerships |
| 2029 | EU | GDPR-native expansion; EU AI Act alignment |
| 2030–2031 | Selective global | Spanish-language markets (content foundation exists); partner-led |

**Diagram description (Figure 5).** A Gantt-style timeline (2026–2031) with swim lanes for Product, Research, Community, and Policy, a "you are here" marker at P1 (2026 H1), and dependency arrows showing that the community pillar is blocked on authentication, care mapping is blocked on municipal data partnerships, and NeuroLjus AR is blocked on co-design and ethics review.

---

## 12. Research and Innovation Opportunities

NeuroLjus is designed as a **research-amenable platform**, not only a product, and actively invites academic collaboration.

### 12.1 Collaboration With Universities

Opportunity areas span **human-computer interaction** (co-design with non-verbal autistic individuals and caregivers), **digital-health informatics** (FHIR signal schemas; privacy-preserving observational models), **machine learning** (on-device efficiency; personal adapters; federated learning), **disability studies** (critical analysis of assistive-AI power dynamics), and **health economics** (cost-effectiveness of caregiver decision-support). Current assets for collaborators include an open validation protocol, a technical white paper whose benchmarking methodology is designed to follow TRIPOD+AI reporting guidance [10], a live reproducible demo, and ORCID-linked authorship for citation integrity.

### 12.2 AI for Accessibility

Open research questions include: Can real-time signal dashboards be adapted for cognitive accessibility without losing precision? How can language models be tuned on caregiver–autism interaction patterns without violating privacy? What active-learning question formats minimize burden on non-verbal individuals? NeuroLjus invites proposals aligned with **FAIR4RS** principles — Findable, Accessible, Interoperable, Reusable research software — including Zenodo DOI pinning and a `CITATION.cff` in the repository.

### 12.3 Neurodiversity Research

The N-of-1 framework is itself a methodological contribution: **within-subject metrics** (e.g., per-person precision/recall, false alarms per hour, useful lead time) replace aggregate accuracy; **co-created meanings** replace imposed emotion labels; and **personal adapters** replace universal classifiers. This reframes what "good performance" means for neurodiversity-affirming computational research, independent of any product revenue.

### 12.4 Data Ethics and Digital Inclusion

Priority topics include consent/assent frameworks for non-verbal participants in sensing studies, GDPR Article 9 compliance patterns for browser-based inference, algorithmic-fairness auditing stratified by skin tone and lighting condition — following the intersectional-bias methodology established for commercial facial-analysis systems [8] — and anti-surveillance governance for institutional deployment. NeuroLjus commits not to collect human-subjects validation data without ethics approval under the Swedish Ethical Review Authority (Etikprövningsmyndigheten) [19] and preregistration — a commitment repeated across its documentation.

### 12.5 Innovation Partnership Opportunities

| Partner type | Collaboration model |
|---|---|
| Wearable OEM | BLE integration; validation studies |
| AAC vendor | 42-signal communication-board integration |
| Cloud / infrastructure provider | Credits; edge-compute research |
| Municipal LSS department | Care-map pilot; real-world deployment |
| AR/VR studio | NeuroLjus AR co-design (autistic-led review) |
| Open-source community | Reusable on-device signal-extraction libraries |

---

## 13. Conclusion

### 13.1 Long-Term Vision

NeuroLjus exists because a caregiver saw entire worlds in minds the world too often overlooks — and asked what technology would look like if it were built from **dignity, transparency, and honesty** rather than surveillance, normalization, and false certainty. The long-term vision is a connected ecosystem: families who no longer navigate care alone; caregivers equipped with objective signals and empathic AI that supports rather than replaces their judgment; municipalities with transparent, comparable service information; researchers advancing privacy-preserving, neurodiversity-affirming methods; and autistic individuals whose unique languages are *learned*, never overridden.

### 13.2 What NeuroLjus Is Today (Honest Summary)

Today, NeuroLjus is a live web platform with **on-device movement-signal sensing (NL-VISION)**, a **real-time caregiver dashboard**, an **optional multilingual non-diagnostic AI assistant (Care Chat)**, open validation and technical documentation, and an experimental sensors lab — all built on an architecture where **users keep ownership and control of their data**. Care location mapping, the community platform, and the resource library are in development or planned; the N-of-1 personalization engine is specified and partially prototyped. This paper labels each capability honestly so that ambition is never mistaken for delivery.

### 13.3 Call to Action

| Audience | Action |
|---|---|
| **Investors** | Back ethical, defensible assistive AI with clear non-diagnostic boundaries and a credible path to an institutional ecosystem. |
| **Municipalities & public institutions** | Partner on supervised, GDPR-aligned pilots; co-design care-transparency tools. |
| **Care providers** | Test the sensing engine in controlled settings; shape the signal vocabulary that improves handover and training. |
| **Families** | Try the demo; share context; join future co-design cohorts as expert partners. |
| **Researchers & universities** | Cite the open protocols; propose collaborations; supervise doctoral development. |
| **Strategic partners** | Integrate wearables, AAC, and interoperability standards on privacy-preserving terms. |

Contact: **elizabeth@neuroljus.com** · Web: **https://neuroljus.com**

### 13.4 The Future of Inclusive Technology

Assistive technology stands at a fork. One path continues cloud surveillance, neurotypical emotion models, and opaque institutional systems. The other — the one NeuroLjus has already begun to build — insists on **local processing, person-specific understanding, caregiver empowerment, transparent community, and scientific humility**. The work ahead is substantial: validation studies, co-design cohorts, platform pillars, and ecosystem partnerships. But the foundation is real — not in marketing claims, but in code that keeps video on the device, documentation that states what is *not* known, and a mission that puts dignity before data.

> *Light that makes the invisible understandable — at your pace, with your consent, in your language.*

---

## Appendix A — Glossary

| Term | Definition |
|---|---|
| **NeuroLjus** | "Neuro light" (Swedish *ljus*, "light"); the platform and initiative described here |
| **NL-VISION** | On-device webcam movement-signal sensing using MediaPipe Holistic |
| **Care Chat** | Optional, server-side, non-diagnostic multilingual caregiver assistant |
| **Movement index** | Heuristic Calm/Elevated/High indicator; *not* a validated affective state |
| **N-of-1** | Personalization framework using individual baselines rather than population norms |
| **AAC** | Augmentative and alternative communication |
| **LSS** | *Lagen om stöd och service till vissa funktionshindrade* — Swedish disability-support law |
| **Special-category data** | GDPR Article 9 data (health, biometric) requiring enhanced protection |
| **FAIR4RS** | Findable, Accessible, Interoperable, Reusable principles for research software |
| **NeuroLjus House / AR** | Planned ecosystem hub / immersive-empathy education concepts |

## Appendix B — Figures Deferred to a Future Version

Prevalence and caregiver mental-health figures are now cited in-body (references [1]–[4]). The following are deferred to a future version (likely v3.0), to be sourced then with peer-reviewed or official citations:

1. Caregiver anxiety and stress rates (the depression component is already cited via [4]).
2. Regional diagnostic and placement wait times (Sweden / EU).
3. Social-care spending and workforce-vacancy rates.
4. Market size for assistive technology and disability services.
5. Adoption and outcome targets, to be validated against pilot enrollment data.

## Appendix C — References

Full citations verified June 2026; author lists and DOIs confirmed via PubMed/CrossRef. Numbered markers in the body (`[n]`) refer to this list.

1. Maenner, M. J., Warren, Z., Williams, A. R., et al. (2023). *Prevalence and Characteristics of Autism Spectrum Disorder Among Children Aged 8 Years — Autism and Developmental Disabilities Monitoring Network, 11 Sites, United States, 2020.* MMWR Surveillance Summaries, 72(SS-2), 1–14. https://doi.org/10.15585/mmwr.ss7202a1
2. World Health Organization (2023). *Autism — Fact sheet.* https://www.who.int/news-room/fact-sheets/detail/autism-spectrum-disorders
3. Tager-Flusberg, H., & Kasari, C. (2013). *Minimally Verbal School-Aged Children with Autism Spectrum Disorder: The Neglected End of the Spectrum.* Autism Research, 6(6), 468–478. https://doi.org/10.1002/aur.1329
4. Lam, X. R., Cheng, L. J., Leo, C. S. Y., Toh, Z. A., & He, H. G. (2025). *Global prevalence of depression in caregivers of children with autism: A systematic review and meta-analysis.* Journal of Pediatric Nursing, 80, e74–e85. https://doi.org/10.1016/j.pedn.2024.11.020
5. Graaf, G., & Gigli, K. (2022). *Care coordination and unmet need for specialised health services among children with special healthcare needs in the USA: results from a cross-sectional analysis of the National Survey of Children with Special Health Care Needs.* BMJ Open, 12(11), e063373. https://doi.org/10.1136/bmjopen-2022-063373
6. Barrett, L. F., Adolphs, R., Marsella, S., Martinez, A. M., & Pollak, S. D. (2019). *Emotional Expressions Reconsidered: Challenges to Inferring Emotion From Human Facial Movements.* Psychological Science in the Public Interest, 20(1), 1–68. https://doi.org/10.1177/1529100619832930
7. Banos, O., Comas-González, Z., Medina, J., Polo-Rodríguez, A., Gil, D., Peral, J., Amador, S., & Villalonga, C. (2024). *Sensing technologies and machine learning methods for emotion recognition in autism: Systematic review.* International Journal of Medical Informatics, 187, 105469. https://doi.org/10.1016/j.ijmedinf.2024.105469
8. Buolamwini, J., & Gebru, T. (2018). *Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification.* Proceedings of Machine Learning Research (Conference on Fairness, Accountability and Transparency), 81, 77–91. https://proceedings.mlr.press/v81/buolamwini18a.html
9. Lugaresi, C., Tang, J., Nash, H., et al. (2019). *MediaPipe: A Framework for Building Perception Pipelines.* arXiv:1906.08172. https://arxiv.org/abs/1906.08172
10. Collins, G. S., Moons, K. G. M., Dhiman, P., et al. (2024). *TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods.* BMJ, 385, e078378. https://doi.org/10.1136/bmj-2023-078378
11. Kapp, S. K., Gillespie-Lynch, K., Sherman, L. E., & Hutman, T. (2013). *Deficit, difference, or both? Autism and neurodiversity.* Developmental Psychology, 49(1), 59–71. https://doi.org/10.1037/a0028353
12. den Houting, J. (2019). *Neurodiversity: An insider's perspective.* Autism, 23(2), 271–273. https://doi.org/10.1177/1362361318820762
13. Milton, D. E. M. (2012). *On the ontological status of autism: the 'double empathy problem'.* Disability & Society, 27(6), 883–887. https://doi.org/10.1080/09687599.2012.710008
14. Charlton, J. I. (1998). *Nothing About Us Without Us: Disability Oppression and Empowerment.* University of California Press. https://doi.org/10.1525/9780520925441
15. Nario-Redmond, M. R., Gospodinov, D., & Cobb, A. (2017). *Crip for a Day: The Unintended Negative Consequences of Disability Simulations.* Rehabilitation Psychology, 62(3), 324–333. https://doi.org/10.1037/rep0000127
16. European Parliament and Council of the European Union (2016). *Regulation (EU) 2016/679 (General Data Protection Regulation).* Official Journal of the EU, L 119, 4 May 2016. https://eur-lex.europa.eu/eli/reg/2016/679/oj
17. European Parliament and Council of the European Union (2024). *Regulation (EU) 2024/1689 (Artificial Intelligence Act).* Official Journal of the EU, 12 July 2024. https://eur-lex.europa.eu/eli/reg/2024/1689/oj
18. *Lag (1993:387) om stöd och service till vissa funktionshindrade (LSS).* Sveriges riksdag. https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1993387-om-stod-och-service-till-vissa_sfs-1993-387/
19. *Lag (2003:460) om etikprövning av forskning som avser människor (Etikprövningslagen).* Etikprövningsmyndigheten (Swedish Ethical Review Authority). https://etikprovningsmyndigheten.se/

> **Deferred to a future version (likely v3.0):** regional diagnostic/placement wait times (Sweden/EU); social-care workforce-vacancy and per-capita funding figures; assistive-technology market size — all listed in Appendix B. The body no longer contains any unfilled placeholders.

## Appendix D — Suggested Figures

| Figure | Content |
|---|---|
| Figure 1 | Layered platform architecture with status badges and privacy core |
| Figure 2 | Care Location Mapping — filter/map + structured comparison mockup |
| Figure 3 | Deployment diagram with on-device privacy boundary |
| Figure 4 | NeuroLjus House hub-and-spoke ecosystem |
| Figure 5 | 2026–2031 roadmap Gantt with dependency arrows |

---

*Prepared for adaptation into an open, citable publication (Zenodo DOI; ORCID-linked). Capabilities are labeled [Live], [In Development], or [Planned] throughout; roadmap items are not shipped functionality. NeuroLjus — supportive, non-diagnostic signals. The human interprets.*
