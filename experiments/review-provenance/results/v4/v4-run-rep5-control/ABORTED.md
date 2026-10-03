# v4 rep 5 control — INFRASTRUCTURE ABORT, not scored

- **Classification:** infrastructure abort under the v4 preregistration's
  `infrastructureAbortRule`. Not an outcome. Excluded from every tally. The
  attempt is kept and is not reused.
- **Cause:** the provider failed mid-arm. The final assistant turn carries
  `stopReason: "error"` with `errorMessage: "Provider returned an empty
  response"`. The turn before it was a `toolCall`; every real model turn in this
  arm ended `toolUse` (continue), so **no model-ended turn was ever completed**.
  The arm was terminated by the provider, not by the model deciding anything.
- **Why its evaluator exit is meaningless:** the arm never applied an edit, so
  `eval.exit: 1` with all six missing-provenance checks failing is the untouched
  defective file, not a judgement by the model. Scoring it as a control failure
  would record a provider fault as a retrieval-behaviour outcome.
- **Rerun:** rep 5 is rerun in full from fresh task roots under new ids
  `v4-run-rep5b-control` / `v4-run-rep5b-treatment`, per the same rule.
- **Note on the paired treatment arm:** `v4-run-rep5-treatment` is itself
  excluded, because the preregistration reruns a pair in full. Discarding only
  the control and keeping its partner would break the pairing.
