/**
 * Crisis protocols ("la línea") — pure data, deterministic, no network.
 *
 * Each protocol is one everyday crisis situation written for the caregiver in
 * es/en/sv: how to recognise it, what to do in each phase with short phrases
 * to say aloud, what never to do, when to escalate (the number comes from
 * emergency.ts), an ABC log with the possible functions as hypotheses only, and
 * the library documents that back the approach.
 *
 * Rules: no diagnosis, no medication, no real cases, no invented figures
 * (a protocol text contains no digits). Every evidence id must exist in
 * data/library/docs.json with the same kind (checked in tests/protocols.test.ts).
 */

import type { EmergencyLang } from "../emergency";

export type ProtocolLang = EmergencyLang;
/** One text in the three languages of the site. */
export type Tri = Record<ProtocolLang, string>;

export const PROTOCOL_IDS = [
  "physical_danger",
  "aggression_objects",
  "aggression_people",
  "self_injury",
  "overload_meltdown",
  "shutdown",
  "transitions_refusal",
  "sleep",
  "possible_pain",
  "caregiver_exhausted",
] as const;
export type ProtocolId = (typeof PROTOCOL_IDS)[number];

export const PHASE_IDS = ["agitation", "peak", "descent", "recovery"] as const;
export type PhaseId = (typeof PHASE_IDS)[number];

export type ProtocolPhase = {
  /** What this phase is for, in one sentence. */
  goal: Tri;
  /** What to do, in order. Nothing here may be a prohibition: those go in `never`. */
  steps: Tri[];
  /** Short phrases to say aloud (a few words each). */
  say: Tri[];
};

/** Possible functions of a behaviour. Always hypotheses, never an explanation. */
export const FUNCTIONS = ["escape", "request", "sensory", "pain"] as const;
export type FunctionHypothesis = (typeof FUNCTIONS)[number];

/** Evidence level of a library document: its `kind` in docs.json. */
export type EvidenceLevel = "guideline" | "meta_analysis" | "systematic_review" | "trial" | "review" | "study";

export type ProtocolEvidence = {
  /** Document id in data/library/docs.json. */
  id: string;
  /** Must equal the document's kind in docs.json. */
  level: EvidenceLevel;
  /** What this document backs, and what it does not. */
  supports: Tri;
};

export type CrisisProtocol = {
  id: ProtocolId;
  /** 1 to 10, as in the line. */
  number: number;
  title: Tri;
  /** One or two short questions to recognise the situation. */
  recognize: Tri[];
  /** Protocols 1 and 4: safety and the emergency line come first. */
  safetyFirst: boolean;
  /** Required with safetyFirst: the safety sentence shown before anything else. */
  opening?: Tri;
  phases: Record<PhaseId, ProtocolPhase>;
  /** What to never do (punishment, locking in, restraint…). */
  never: Tri[];
  escalate: {
    /** Situations that need the emergency number now. */
    callWhen: Tri[];
    /** Situations that need a professional soon (same day or a planned visit). */
    contactWhen: Tri[];
  };
  abc: {
    antecedent: Tri;
    behavior: Tri;
    consequence: Tri;
    /** Functions worth checking for this situation, each with the question that tests it. */
    hypotheses: Array<{ fn: FunctionHypothesis; check: Tri }>;
    /** Says these are hypotheses, not an explanation or a diagnosis. */
    note: Tri;
  };
  /** 3 to 6 library documents that back the approach. */
  evidence: ProtocolEvidence[];
  /** Says what the evidence covers and what is practice. */
  evidenceNote: Tri;
};

/** A blank ABC record to fill in after a crisis. Nothing is stored here. */
export type AbcRecord = {
  protocolId: ProtocolId;
  /** ISO date-time, supplied by the caller (this module never reads the clock). */
  recordedAt: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  /** Functions the caregiver finds plausible. Hypotheses only. */
  hypotheses: FunctionHypothesis[];
};

export function newAbcRecord(protocolId: ProtocolId, recordedAt: string): AbcRecord {
  return { protocolId, recordedAt, antecedent: "", behavior: "", consequence: "", hypotheses: [] };
}

/** Shorthand for writing a Tri. */
export const tri = (es: string, en: string, sv: string): Tri => ({ es, en, sv });
