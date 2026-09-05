# Agentic-EQ-Aware Descaffolding — The Rumination Guard

- **Rank:** 15 (tied with Random Forest SHAP)
- **Status:** IDEA — unratified, in ideation
- **Viability:** Medium-High
- **Potential:** High

## The observation

Anthropic's Thariq Shihipar observed that cutting **>80% of Claude Code's
system prompt** for Claude 5-generation models produced no measurable loss on
coding evals. The standard frame is *descaffolding*: removing worked examples
and "do not" rules that became ceilings rather than floors for a more capable
model.

A sharper, underexplained sub-observation is **model-specific EQ variance**:

- **Opus 5** — powerful but prone to *constant rumination* when left without
  explicit agentic discipline. The model compensates by looping: re-reading
  context, re-verifying tool outputs, re-asking for confirmation. The
  "do not" rules in a harness may not just be ceiling-artifacts; for Opus 5
  they may be the only thing that stops the model from spinning.
- **Fable 5 / Mythos class** — described as having **higher EQ** than Opus 5.
  Higher EQ here means better calibration of *when* to act vs. when to verify,
  and a stronger prior that "I already have enough context; I should proceed."
  Fable 5 descaffolds more aggressively because it hurts itself less by
  ruminating.

This means the 80% figure is not a universal constant — it is a **function of
the probe model's EQ profile**. Descaffolding for Opus 5 may stop at 60%;
descaffolding for Fable 5 may reach 90%; descaffolding for a weaker model
may require *adding* scaffolding, not removing it.

## The idea — an EQ-aware descaffolding matrix

Extend the per-model measurement discipline (D12, Rank 2) to include a
**Rumination Index** alongside token counts:

1. **Instrument the harness** to detect rumination loops:
   - Repeated identical/paraphrased tool calls within a short window.
   - Context re-reads (tokens spent re-ingesting already-processed blocks).
   - Self-confirmation spirals ("Let me verify..." → "Let me double-check...").
2. **Classify each scaffold block** as:
   - **Repo-invariant policy** — keep on every model.
   - **EQ-supplemental** — prevents rumination for low-EQ models but is
     overhead for high-EQ models.
   - **Ceiling-artifact** — the standard descaffolding candidate.
3. **Measure per model**: run the same task with the full prompt, then with
   each class removed. Plot:
   - Token count delta
   - Success rate delta
   - Rumination Index delta
4. **Output**: a *per-model prompt footprint* — the minimal effective harness
   for each model, not a single "lean" prompt.

## Why now

- The Fable 5 / Opus 5 EQ distinction is fresh, named, and testable.
- Our existing `scripts/hell-heaven-bench/` and D12 infrastructure already
  capture token counts and success rates; rumination detection is a logging
  layer on top, not new infrastructure.
- If verified, this reframes "prompt shrink" from a one-size-fits-all hygiene
  practice into a **model-specific calibration problem** — exactly the kind of
  per-model-per-harness thinking that Rank 2 was built to support.

## What to research / measure (if this graduates)

- Can rumination be reliably detected from harness-side logs without model
  cooperation?
- Does Fable 5 actually exhibit lower rumination than Opus 5 on the same task
  with the same scaffold, or is the EQ difference domain-specific?
- Is there a class of scaffold that *reduces* rumination for Opus 5 but
  *increases* it for Fable 5 (e.g., overly prescriptive "do not" lists that
  trigger Fable 5's pattern-matching against rules rather than goals)?

## Open questions

- Is "EQ" the right operational term, or is it more like *agentic
  conscientiousness* — a specific axis of model behavior rather than emotional
  intelligence?
- Does the Rumination Index generalize beyond coding tasks to the broader
  agentic surfaces (telemetry ingestion, skill execution, registry sync) that
  Gaia Research actually runs?

## What this is NOT

- Not a claim that Fable 5 is universally better; it is a claim that Fable 5
  and Opus 5 have different harness-sensitivity profiles.
- Not a ratification of the 80% figure for our own harness.
- Not a commitment to cut anything without measurement.

## Sources

- Thariq Shihipar (Anthropic), *"The new rules of context engineering for
  Claude 5 generation models"* (2026-07-24) — the >80% system-prompt cut claim.
- Thariq Shihipar, *"Field Guide to Fable,"* AI Engineer World's Fair (July
  2026) — the "capability overhang" framing and the Fable 5 / Mythos-class
  positioning.
- `platform.claude.com` Opus 5 model documentation — model-family context.
- Rank 14 idea (`claude-5-system-prompt-shrink-audit.md`) — the parent
  descaffolding audit concept.
