# Opus 5 vs. Fable 5: Rumination, Overthinking, and the Hidden Cost of Being Half the Price

*August 1, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

Two models. Same task. One loops. The other moves.

**Opus 5** costs half of **Fable 5** ($5/$25 vs. $10/$50 per million input/output tokens). The benchmark numbers are close. The behavior is not.

Opus 5 re-reads context, re-verifies tool outputs, asks for confirmation it already has. Fable 5 acts. The difference is not capability — both are powerful. It is a difference in *when* each model chooses to act versus verify, and that difference has a name.

Psychology has a name for this pattern. It is called **rumination**.

![Artificial Analysis Intelligence Index showing Opus 5 and Fable 5](/assets/rumination-index-aa-intelligence.png)
*Artificial Analysis Intelligence Index — Opus 5 scores near the top, but the chart measures capability, not the willingness to act on it. Source: [artificialanalysis.ai/#intelligence](https://artificialanalysis.ai/#intelligence)*

---

## What rumination actually is

Susan Nolen-Hoeksema spent decades studying rumination as a response style. Her definition is tight: a *passive, repetitive focus on symptoms of distress and their causes and consequences*.

Key features that carry straight into agent behavior:

1. **Repetitive without progress.** The same question gets asked in new words. The same context gets re-read.
2. **Passive processing instead of action.** The model stays in the verification loop rather than committing to a next step.
3. **Triggered by ambiguity.** Unclear instructions or noisy tool outputs invite rumination. Clear goals tend to short-circuit it.

This is not a metaphor. These are observable, measurable behaviors.

---

## The EQ axis

Psychologists also talk about **Behavioral Inhibition System (BIS)** and **Behavioral Activation System (BAS)** — Jeffrey Gray's reinforcement sensitivity theory. High BIS means heightened sensitivity to signals of punishment, error, or uncertainty. High BAS means a drive toward reward, exploration, and action.

An agent that re-verifies everything has a high-BIS profile. An agent that commits and course-corrects has a high-BAS profile. Both have tradeoffs. High BIS avoids errors but stalls progress. High BAS moves fast but may miss edge cases.

The claim that **Fable 5 has higher EQ than Opus 5** maps cleanly onto this: better calibration of BIS and BAS across changing context. The model knows when to verify and when to move.

[[BIS_BAS]]

## What a Rumination Index would measure

A paper proposal, not a shipped product. The goal is a validated instrument, not a marketing metric.

### Input signals (observable from harness logs)

[[RUMINATION_SIGNALS]]

### Scoring

Each signal contributes to a **Rumination Score per task**. A task that completes in three turns with one tool call scores low. A task that loops five times on the same verification scores high.

The index does not judge *whether* verification is good. It measures *excess* verification relative to task complexity and information sufficiency.

### Baseline

A matched placebo arm — the same task on the same model without rumination-triggering ambiguity — gives a baseline score. The delta is the measure, not the absolute score.

---

## Three falsifiable claims

This post proposes a framework. It does not present measured results. If the Rumination Index becomes a paper, its core claims should be falsifiable:

1. **Rumination is detectable without model cooperation.** Harness-side logs capture the behavioral signatures; the model does not need to self-report.
2. **Rumination scores differ systematically between models on the same task.** Opus 5 and Fable 5 on the same harness should produce different distributions, and the distribution shift should correlate with EQ calibrations measured by other methods.
3. **Excess rumination predicts token waste without predicting success.** Tasks with high rumination scores should consume more tokens but not produce measurably better outcomes, once baseline model capability is controlled for.

If any of these fail, the instrument needs to be revised or retired.

---

## Why this matters for harness design

Most prompt engineering advice is written as if all models respond to context the same way. They do not. A worked example that prevents rumination in a weaker model may become a ceiling artifact in a stronger one. A "do not" rule that stops Opus 5 from spiraling may trigger Fable 5 to pattern-match against rules rather than goals.

Descaffolding cannot be one number. It is a **per-model calibration problem**, and rumination is one of the axes to measure.

The price gap is real. Opus 5 at $5/$25 per million tokens is exactly half of Fable 5's $10/$50. If Opus 5 loops twice as often on the same task, the runtime cost can erase the token-price savings. The cheaper model can cost more in wall-clock time and context re-ingestion. That is the hidden cost of half-price intelligence: you are not just saving on the meter; you are paying in patience and throughput.

There is a sharper version of this cost. Run a model on its **"max"** or equivalent mode — highest reasoning depth, longest context, most tool calls — and performance sometimes *dips*. The model overthinks. It re-verifies facts it already knows. It asks clarifying questions for information it already has. It generates longer outputs that are not better outputs.

This is the **overthinking tax**. You paid for the top tier and got slower, more expensive, and occasionally worse results. The tax is not a bug in the model; it is a predictable consequence of giving a high-BIS agent more room to hesitate. Fable 5's higher EQ means it is less susceptible to this tax — it uses the extra capacity when it matters, not as a default.

---

## One thing to do

If you run agents, add one log line today: **count how many times the model re-reads or re-asks about the same block of context within a single task.** You do not need a full Rumination Index to see whether the number is zero or non-zero.

That number is the seed.

---

**Sources:** S. Nolen-Hoeksema, *Response Styles Theory of Depression* (multiple papers, foundational psych literature); J. A. Gray, *Reinforcement Sensitivity Theory* (BIS/BAS); Thariq Shihipar, Anthropic, *"The new rules of context engineering for Claude 5 generation models"* (2026-07-24).
