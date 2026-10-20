/**
 * The four possible functions of a behaviour, as labels for the ABC log.
 * They are hypotheses to look at a pattern, never an explanation or a diagnosis.
 */

import { tri, type FunctionHypothesis, type Tri } from "./types";

export const FUNCTION_LABELS: Record<FunctionHypothesis, Tri> = {
  escape: tri("Podría ser escapar de algo", "Could be escaping something", "Kan vara att undkomma något"),
  request: tri("Podría ser pedir algo", "Could be asking for something", "Kan vara att be om något"),
  sensory: tri("Podría ser sensorial", "Could be sensory", "Kan vara sensoriskt"),
  pain: tri("Podría ser dolor o malestar", "Could be pain or discomfort", "Kan vara smärta eller obehag"),
};
