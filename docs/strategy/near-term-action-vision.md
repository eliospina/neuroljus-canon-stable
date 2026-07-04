# Near-Term Action Vision

This document translates the Neuroljus thesis into a practical short-term path. It does not reopen active product development. It defines what should be learned next.

## Strategic Judgment

The long horizon matters, but Neuroljus should not lead with robotics as if that is the current product.

The near-term priority is simpler and stronger:

Can structured caregiver observation, supported by careful AI reflection, help one trusted care circle notice useful within-person patterns over time?

If the answer is no, robotics is premature.

If the answer is yes, Neuroljus gains the evidence base needed for future assistive technology, research partnerships, and eventually embodied care interfaces.

## 90-Day Focus

Neuroljus should spend the next phase proving the observation loop, not expanding the feature set.

### 1. Define one first user

Choose one primary user for the first evidence cycle:

- family caregiver
- LSS caregiver
- school/support staff
- researcher working with caregivers

Do not try to serve all of them at once.

### 2. Define one repeated situation

Pick one concrete situation where observation could matter, for example:

- transition after school or activity
- suspected discomfort without clear speech
- sensory overload recovery
- sleep/routine disruption
- repeated hand-to-face or movement pattern that a caregiver wants to contextualize

The first use case should be boring, repeated, and ethically safe.

### 3. Create one observation template

The first template should capture:

- what happened
- time and setting
- sensory context
- routine or transition
- caregiver interpretation
- uncertainty
- what helped or did not help
- optional local NL-VISION metrics if used

The template should avoid diagnostic or emotion-label language.

Start from `docs/research/observation-template-v0.md`.

### 4. Interview 5-10 caregivers or relevant support people

The interviews should test:

- whether caregivers already track patterns
- what they forget or miss
- what language feels respectful
- what data they would never want collected
- whether AI summaries would help or feel risky
- what a safe first workflow could be

Start from `docs/research/caregiver-interview-guide-v0.md`.

### 5. Run a tiny evidence cycle

Before building a full product, test whether structured notes over several days create value.

Success could mean:

- caregiver reports clearer reflection
- fewer vague notes
- better handoff language
- better questions for professionals
- clearer uncertainty, not false certainty

Failure could mean:

- too much burden
- privacy discomfort
- no useful pattern found
- AI summaries feel generic or intrusive
- workflow increases stress

## What Not To Build Yet

Do not build:

- robotics prototypes
- institutional dashboards
- clinician workflows
- automated interpretation
- emotion or pain detection
- more beta gates
- broad user roles
- large feature surfaces

These may become relevant later, but only after the observation loop is valuable.

## Near-Term Public Positioning

Safe public positioning:

Neuroljus is a research prototype testing whether structured caregiver observation and non-diagnostic AI reflection can help document within-person communication and care patterns over time.

Short version:

Better observations first. Future care intelligence later.

## Decision Checkpoint

After the near-term cycle, Elizabeth should decide:

- keep paused and continue research
- narrow into a caregiver observation prototype
- seek a research collaborator
- redesign the thesis
- stop product direction and preserve the project as portfolio/research work

The decision should be recorded in `docs/board/`.
