# v4 pair 3 — INFRASTRUCTURE ABORT, not scored

- **Classification:** infrastructure abort under the v4 preregistration's
  `infrastructureAbortRule`. Neither arm is an outcome; neither is scored; both
  are excluded from every tally.
- **Cause:** an orchestration collision, not a model or provider failure. Two
  driver scripts were running the pair sequence against the same two herdr panes
  at the same time. The second script's own rep 3 attempt refused immediately
  (its run id already existed) and exited without touching the panes, but the
  pane reset issued between the two scripts sent `/quit`/ctrl-C/ctrl-D to both
  panes while this pair's arms were still live, ending them before evaluation.
- **State on disk:** `launch.json`, `prompt.txt`, `.state` and a partial
  `session/` exist. No `result.ts`, no `eval.json`, no `record.json`. Nothing
  was evaluated.
- **Not rerunnable under this id.** `pair-interactive.sh` refuses an existing
  run id by design, so the rerun carries its own ids.
- **Nothing about the treatment changed.** The prompt, task, fixture, evaluator,
  exposure method, model and effort for a rerun are the committed ones.
