# Runner intervention — v4 pair 1 treatment

- **What happened:** the arm produced a complete, model-ended result (last assistant
  turn `stopReason: "stop"`). The runner's completion detector then hung:
  `herdr agent wait <pane> --until idle --timeout 2400000` blocked for ~11 minutes
  even though the agent was already `idle` for the whole of that window.
- **What was done:** the hung `herdr agent wait` process (pid 95742) was signalled
  SIGTERM. The runner's own `|| break` path then ran `finish.py` unmodified, with
  its normal arguments read from `.state`. No model, prompt, task, evaluator,
  fixture, exposure method or scoring code was touched.
- **Why this is not an experiment intervention:** the hang occurred strictly after
  the model had ended its turn. No arm behaviour, input or output was affected.
- **Exposure signal for this arm is `false`.** The treatment skill was listed by
  the door but its body was never read in the session. Under the v3 exposure
  definition this is *listed-but-not-loaded*, which is **not exposure**. The arm
  is scored (it is model-ended) and the missing exposure is reported with it.
