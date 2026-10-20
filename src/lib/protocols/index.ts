/**
 * Crisis protocols: registry and rendering for one language and one country.
 * Pure and deterministic: the same protocol, language and country always give
 * the same text. The emergency number comes from emergency.ts.
 */

import { dangerSentence, emergencyInfo } from "../emergency";
import { FUNCTION_LABELS } from "./functions";
import { physicalDanger } from "./physicalDanger";
import { aggressionObjects } from "./aggressionObjects";
import { aggressionPeople } from "./aggressionPeople";
import { selfInjury } from "./selfInjury";
import { overloadMeltdown } from "./overloadMeltdown";
import { shutdown } from "./shutdown";
import { transitionsRefusal } from "./transitionsRefusal";
import { sleep } from "./sleep";
import { possiblePain } from "./possiblePain";
import { caregiverExhausted } from "./caregiverExhausted";
import {
  PHASE_IDS,
  type CrisisProtocol,
  type EvidenceLevel,
  type FunctionHypothesis,
  type PhaseId,
  type ProtocolId,
  type ProtocolLang,
} from "./types";

export * from "./types";
export { FUNCTION_LABELS } from "./functions";

/** The ten protocols of the line, in order. */
export const PROTOCOLS: CrisisProtocol[] = [
  physicalDanger,
  aggressionObjects,
  aggressionPeople,
  selfInjury,
  overloadMeltdown,
  shutdown,
  transitionsRefusal,
  sleep,
  possiblePain,
  caregiverExhausted,
].sort((a, b) => a.number - b.number);

export function getProtocol(id: ProtocolId): CrisisProtocol | undefined {
  return PROTOCOLS.find((p) => p.id === id);
}

export type RenderedProtocol = {
  id: ProtocolId;
  number: number;
  title: string;
  /** Protocols 1 and 4 only: the safety sentence and the emergency line, shown before anything else. */
  emergencyFirst: string | null;
  recognize: string[];
  phases: Array<{ id: PhaseId; goal: string; steps: string[]; sayToPerson: string[] }>;
  never: string[];
  escalate: {
    callWhen: string[];
    /** "If there is danger, call 112." with the number of the country, or the generic line when unknown. */
    callLine: string;
    /** The dialable number, or null when the country is unknown. */
    number: string | null;
    contactWhen: string[];
  };
  log:
    | { kind: "abc"; antecedent: string; behavior: string; consequence: string; hypotheses: Array<{ fn: FunctionHypothesis; label: string; check: string }>; note: string }
    | { kind: "caregiver"; exhausted: string; signs: string; helped: string; note: string };
  evidence: Array<{ id: string; level: EvidenceLevel; supports: string }>;
  evidenceNote: string;
};

export function renderProtocol(p: CrisisProtocol, lang: ProtocolLang, country?: string | null): RenderedProtocol {
  const emergency = emergencyInfo(country, lang);
  // Protocols use the danger sentence alone: "This needs a person" confuses a caller mid-crisis.
  const danger = dangerSentence(country, lang);
  return {
    id: p.id,
    number: p.number,
    title: p.title[lang],
    emergencyFirst: p.safetyFirst && p.opening ? `${p.opening[lang]} ${danger}` : null,
    recognize: p.recognize.map((q) => q[lang]),
    phases: PHASE_IDS.map((id) => ({
      id,
      goal: p.phases[id].goal[lang],
      steps: p.phases[id].steps.map((s) => s[lang]),
      sayToPerson: p.phases[id].sayToPerson.map((s) => s[lang]),
    })),
    never: p.never.map((n) => n[lang]),
    escalate: {
      callWhen: p.escalate.callWhen.map((c) => c[lang]),
      callLine: danger,
      number: emergency.number,
      contactWhen: p.escalate.contactWhen.map((c) => c[lang]),
    },
    log:
      p.log.kind === "abc"
        ? {
            kind: "abc",
            antecedent: p.log.antecedent[lang],
            behavior: p.log.behavior[lang],
            consequence: p.log.consequence[lang],
            hypotheses: p.log.hypotheses.map((h) => ({ fn: h.fn, label: FUNCTION_LABELS[h.fn][lang], check: h.check[lang] })),
            note: p.log.note[lang],
          }
        : { kind: "caregiver", exhausted: p.log.exhausted[lang], signs: p.log.signs[lang], helped: p.log.helped[lang], note: p.log.note[lang] },
    evidence: p.evidence.map((e) => ({ id: e.id, level: e.level, supports: e.supports[lang] })),
    evidenceNote: p.evidenceNote[lang],
  };
}
