# Opus 5 vs. Fable 5: Rumination, Overthinking, and the Hidden Cost of Being Half the Price

*August 1, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

Two models. Same task. One loops. The other moves.

**Opus 5** costs half of **Fable 5** per million input/output tokens (illustrative pricing: ~$5/$25 vs. ~$10/$50). The benchmark numbers are close. The behavior is not.

Opus 5 re-reads context, re-verifies tool outputs, and asks for confirmation it already has. Fable 5 acts. The difference is not capability — both are powerful. It's a difference in *when* each model chooses to act versus verify, and that difference has a name.

Psychology calls this **rumination** — a passive, repetitive focus on distress and its causes.

![Artificial Analysis Intelligence Index showing Opus 5 and Fable 5](/assets/rumination-index-aa.webp)
*Artificial Analysis Intelligence Index — Opus 5 scores near the top, but the chart measures capability, not the willingness to act on it. Source: [artificialanalysis.ai/#intelligence](https://artificialanalysis.ai/#intelligence)*

---

## Rumination is a response style, not a metaphor

Susan Nolen-Hoeksema's definition is tight: rumination is a *passive, repetitive focus on distress and its causes*. Three features carry directly into agent behavior:

1. **Repetitive without progress.** The same question, re-asked in new words. The same context block, re-read.
2. **Passive processing instead of action.** The model stays in the verification loop rather than committing to a next step.
3. **Triggered by ambiguity.** Noisy tool outputs or vague instructions invite rumination. Clear goals tend to short-circuit it.

These are observable from harness logs — no model self-report required.

---

## BIS and BAS: the calibration axis

Jeffrey Gray's **Behavioral Inhibition System (BIS)** and **Behavioral Activation System (BAS)** explain why the two models diverge.

- **High BIS** — heightened sensitivity to error, uncertainty, or ambiguity. The agent re-verifies before acting. Observable consequence: repeated tool calls on already-confirmed outputs.
- **High BAS** — drive toward reward, exploration, and forward motion. The agent commits and course-corrects. Observable consequence: actions issued quickly, errors caught and fixed in the next turn.

Opus 5's behavior — re-reading context, re-asking for confirmation it already has — is a high-BIS profile. Fable 5 commits and adjusts. Both have tradeoffs: high BIS avoids errors but stalls progress; high BAS moves fast but may miss edge cases. Better calibration means knowing which situation calls for which.

[[BIS_BAS]]

## Proposed Rumination Index signals

A paper proposal, not a shipped product. The goal is a validated instrument, not a marketing metric.

### Input signals (observable from harness logs)

[[RUMINATION_SIGNALS]]

A task that completes in three turns with a single tool call scores low. A task that loops five times on the same verification scores high.

The index measures excess verification relative to task complexity and information sufficiency. It does not judge whether verification was good. The output is the delta, not the absolute score: between a task run clean and the same task under rumination triggers.

### Matched baseline arm

A matched placebo arm — the same task on the same model without rumination-triggering ambiguity — is the baseline. The delta between the two runs is the measure.

---

## Three claims that would sink the instrument

This post proposes a framework. It presents no measured results. If the Rumination Index becomes a paper, its core claims should be falsifiable:

1. **Rumination is detectable without model cooperation.** Harness-side logs capture the behavioral signatures; the model does not need to self-report.
2. **Rumination scores differ systematically between models on the same task.** Opus 5 and Fable 5 on the same harness should produce different distributions, and that distribution shift should correlate with BIS/BAS calibration scores measured independently.
3. **Excess rumination predicts token waste without predicting success.** Tasks with high rumination scores should consume more tokens but not produce measurably better outcomes, once baseline model capability is controlled for.

If any of these fail, the instrument needs to be revised or retired.

---

## Rumination is a per-model calibration problem

Most prompt engineering advice treats all models as if they respond to context identically. They do not.

A worked example that prevents rumination in a weaker model can become a ceiling artifact in a stronger one: the model pattern-matches against the example rather than reasoning about the task. A "do not" rule designed for Opus 5 may trigger Fable 5 to treat the rule as a constraint to obey literally, not a goal to reason toward. These are not tuning problems — they are per-model calibration problems, and rumination is one axis to measure.

The price gap makes calibration a cost problem, not just a behavior problem. Opus 5 at $5/$25 per million tokens is exactly half of Fable 5's $10/$50. If Opus 5 loops twice as often on the same task, the token-price savings disappear in wall-clock time and context re-ingestion.

Run a model on its **"max"** or equivalent mode — highest reasoning depth, longest context, most tool calls — and performance drops. The model overthinks: re-verifying known facts, asking for information already in context, producing longer outputs that are not better outputs.

This is the overthinking tax. High-BIS agents spend the extra capacity by default instead of reserving it. If Fable 5 has higher EQ calibration, it may resist — it holds capacity until a situation warrants it.

---

## One log line to add today

If you run agents, add one log line today: **count how many times the model re-reads or re-asks about the same context block within a single task.** You do not need a full Rumination Index to know whether the number is zero.

That number is the seed.

---

**Sources:** S. Nolen-Hoeksema, *Response Styles Theory of Depression* (multiple papers, foundational psych literature); J. A. Gray, *Reinforcement Sensitivity Theory* (BIS/BAS); Thariq Shihipar, Anthropic, *"The new rules of context engineering for Claude 5 generation models"* (2026-07-24).
