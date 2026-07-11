# Co-Designing Non-Diagnostic, On-Device Movement Signals with Non-Speaking Autistic People and Their Care Networks

### Participatory design and within-person (idiographic) evaluation · PhD research proposal (outline)

**Elizabeth Ospina** · Independent researcher & caregiver, Sweden · ORCID [0009-0004-7291-3340](https://orcid.org/0009-0004-7291-3340)
Companion white paper (open, CC BY 4.0): https://doi.org/10.5281/zenodo.20775582

---

## 1. Background and problem

A substantial minority of autistic people, often estimated at around a quarter to a third depending on age, definition and support needs, are non-speaking or minimally speaking (Tager-Flusberg & Kasari, 2013). In daily life, the people around them, their families, partners and support workers, often rely on subtle bodily cues: a hand moving toward the face, a change in how often they blink, an unusual stillness, a repeated movement, a shift in bodily rhythm. These cues can matter a great deal, yet they are usually read under pressure, without systematic support, and with no shared way to record uncertainty.

A common technological response to this kind of problem has been to classify internal states from external behaviour. Cloud-based emotion-recognition systems are a clear case: they may transmit private video to remote servers, apply assumptions about how a face should express feeling, and infer categories such as anger, sadness or fear. This is questionable on both scientific and ethical grounds. The evidence that facial configurations correspond reliably to discrete emotions is contested (Barrett et al., 2019), and the assumption is weaker still for autistic expression, where behaviour may not follow neurotypical expectations.

More broadly, work on AI and autism has often prioritised prediction, classification or alerts. Less attention has gone to a narrower and more careful question: whether non-diagnostic, on-device movement features can be co-designed with non-speaking autistic people and their care networks, interpreted only against each person's own baseline, and governed transparently in everyday care.

This project addresses that gap. It does not set out to read emotion, diagnose autism or predict behaviour at population level. Instead it asks whether a small set of observable movement features can be measured reliably enough to support interpretation by people who already know the individual.

## 2. Aim and research questions

The aim of this PhD is to investigate whether non-diagnostic, on-device movement features can be co-designed, technically evaluated and ethically governed as support for non-speaking autistic people and their care networks.

The project is deliberately idiographic: its primary unit of analysis is the individual over time, not the comparison of autistic people against a normative group. It would begin with participatory design and move toward a small-sample, within-person longitudinal evaluation, rather than a population-level clinical trial.

RQ1. Which observable movement features do non-speaking autistic people and their care networks find meaningful, acceptable and useful to surface, and under what conditions of consent, transparency and control?

RQ2. Can a small set of co-selected features, for example blink-rate change, mouth opening, hand-to-face proximity and motion magnitude, be extracted reliably on-device under realistic conditions, including variation in lighting, posture, camera angle, occlusion and movement?

RQ3. For each participant, can these features be modelled against their own baseline over time, and what are the error rates, failure modes and interpretation limits across different bodies, environments and care contexts?

RQ4. In everyday use, does the resulting research prototype support caregiver confidence and shared interpretation without adding burden, surveillance or miscalibrated trust, and do participating autistic people and their care networks find it acceptable?

## 3. Approach

The work is organised in four packages.

**WP1 (participatory design and governance).** The project would begin with non-speaking autistic collaborators, supported through AAC, trusted communication partners and proxies where appropriate, together with families and support workers. The goal is not to decide in advance what should be measured, but to identify which movement features are meaningful, which should be excluded, and what forms of consent, control and withdrawal are needed. This package sets the advisory structure and governance principles for the rest of the project (RQ1).

**WP2 (on-device feature extraction).** The current NL-VISION prototype demonstrates extraction of candidate movement features in the browser. The doctoral work would evaluate whether these features can be extracted reliably enough under realistic conditions, including technical failure modes, sensitivity to environmental variation, and the limits of camera-based measurement. Hand-set thresholds would be replaced, where appropriate, by within-person baseline models and pre-specified change-detection rules (RQ2).

**WP3 (within-person longitudinal evaluation).** For each participant, the selected features would be evaluated against that person's own baseline over time. The analysis would report error rates, missing data, instability, false positives, false negatives and condition-level performance against relevant sources of variation, including lighting, camera angle, occlusion, skin tone, posture and movement profile. Where the work involves a predictive or risk-modelling component, reporting would follow TRIPOD+AI where applicable; the participatory and field-evaluation components would follow established HCI, participatory-design and digital-health standards. No group-level, diagnostic or emotional claims would be made (RQ3).

**WP4 (everyday use and care-oriented evaluation).** The final phase would examine how the research prototype behaves in ordinary care settings, focusing on whether it supports confidence, reduces uncertainty and improves shared documentation, or instead creates new burdens and risks. Measures would be co-designed and might include caregiver confidence, perceived burden, trust calibration, acceptability and qualitative accounts of use. Clear procedures for consent, withdrawal, non-use and data deletion would be maintained throughout (RQ4).

## 4. Ethics and data governance

Because the project involves people and sensitive personal data, it would undergo review by Etikprövningsmyndigheten, the Swedish Ethics Review Authority, before any research data is collected. Within a Swedish PhD, the host university would act as research principal, and the ethics application would be prepared with the supervisor, the relevant data-protection expertise and care partners.

Privacy is addressed through the architecture as well as through governance. Raw video is not intended to leave the device. The project does not, however, treat the derived movement features as harmless: in context they can still support inferences about disability, distress, routines, support needs or care practices, so they would be handled as sensitive research data.

Research consent is kept separate from any product or prototype terms, and is treated as continuous and situated rather than a single act. Particular attention would go to supported decision-making, the involvement of proxies, withdrawal, data deletion, and the risk that care-oriented technology shifts power toward observers rather than toward the autistic person. For that reason, autistic involvement in governance is not an optional addition but a condition of the research design.

## 5. Feasibility

This project does not start from a blank page. NL-VISION already runs as a browser-based, on-device prototype that extracts candidate movement features, documented in the open companion white paper. This existing work demonstrates technical feasibility and gives the research a concrete starting point.

The doctoral contribution is not the existence of the prototype. It is the systematic investigation of whether such features can be participatorily selected, reliably extracted, idiographically interpreted and responsibly used in real care contexts. The scope is deliberately limited to a small number of movement features and a small-sample longitudinal evaluation, which makes the project feasible within four years.

The candidate's background as a caregiver and independent prototype-builder is relevant to access, problem framing and design sensitivity. The project would, however, require supervisory support in HCI, participatory methods, digital-health evaluation and applied data analysis.

## 6. Expected contribution

The project is expected to make three contributions. The first is a documented method for co-selecting, extracting and evaluating non-diagnostic, on-device movement features for use in disability and care contexts. The second is participatory evidence on what non-speaking autistic people and their care networks consider acceptable to measure, how that measurement should be governed, and where the limits should be drawn. The third is a concrete case of responsible AI that does less rather than more: a system that avoids diagnosis, avoids emotional inference, avoids group-level claims, and concentrates on transparent, person-specific support.

## 7. Fit and funding

The strongest academic home for this project is human-computer interaction, participatory design, disability technology or digital health, with the technical component scoped as applied on-device signal extraction rather than core computer vision.

In Sweden, the closest funding fit is likely Forte, given the connection to welfare, disability, care and health. Vinnova may be relevant for social innovation and implementation-oriented development. WASP-HS is relevant only where the project is framed around the social, ethical and human implications of AI, not as product development. Vetenskapsrådet could fit if the proposal is developed further around a strong basic-research contribution with an established academic PI/research environment.

I would be glad to develop this into a full doctoral or project proposal together with a supervisor whose research direction matches this combination of participatory disability technology, digital health and responsible AI.

---

### Selected references

Barrett, L. F., et al. (2019). Emotional expressions reconsidered. *Psychological Science in the Public Interest*, 20(1), 1–68.
Collins, G. S., et al. (2024). TRIPOD+AI statement. *BMJ*, 385, e078378.
Frauenberger, C., Good, J., & Keay-Bright, W. (2011). Designing technology for children with special needs: bridging perspectives through participatory design. *CoDesign*, 7(1), 1–28.
Tager-Flusberg, H., & Kasari, C. (2013). Minimally verbal school-aged children with autism spectrum disorder: the neglected end of the spectrum. *Autism Research*, 6(6), 468–478.

*Full reference list in the companion white paper:* https://doi.org/10.5281/zenodo.20775582
