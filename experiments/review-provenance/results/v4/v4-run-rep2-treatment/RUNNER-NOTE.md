# Runner intervention — v4 pair 2 treatment

- **What happened:** the arm produced a complete, model-ended result (final
  assistant turn `stopReason: "stop"`). The runner's completion detector then
  spun: the `agent_status` probe added in the pair-1 repair had a missing `os`
  import in its inline python, so it always reported `absent`, `wait_idle` never
  returned, and the arm's record was never written.
- **What was done:** the stuck pair-2 runner was stopped and `finish.py` was
  invoked directly for this arm with the arguments the runner itself passes,
  read from this run's `.state` and `launch.json`. `finish.py` is byte-identical
  to the one the runner calls; no evaluation, scoring or recording code differs.
- **Scope:** harness plumbing only. Model, effort, prompt, task, fixture,
  evaluator, exposure method and outcome are unchanged. The probe's missing
  import was fixed in the runner immediately afterwards.
- **Exposure signal for this arm is `false`** — the treatment skill was listed
  by the door and its body was never read in the session. Per the v3 exposure
  definition that is *listed-but-not-loaded*, which is not exposure.
