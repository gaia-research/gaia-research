# Claude 5 System-Prompt Shrink — Harness Descaffolding Audit

- **Rank:** 14
- **Status:** Idea / LEANING — **not ratified**. Nothing below overrides `founder/RATIFICATION.md`.
- **Viability:** Medium-High (the audit is a one-off review pass; the payoff depends on how much of our scaffolding turns out to be model-compensating rather than repo-invariant)
- **Potential:** High

## The observation this starts from

Anthropic's Thariq Shihipar described removing **over 80% of Claude Code's
system prompt** for advanced Claude 5-generation models such as **Opus 5 and
Fable 5**, with no measurable loss on Anthropic's coding evaluations. The stated
rationale: worked examples and "do not" rules that helped an earlier
generation *constrain* a more capable one — the examples become a ceiling the
model reads as the intended range, not a floor. The steering that survives is
contextual ("here is the situation, here are the tools") rather than
prescriptive ("here is the one right way; do not deviate").

**The 80% figure is Anthropic's, for Anthropic's own harness. It is not a
Gaia measurement and it does not transfer to our repo by assumption.** The
idea here is not "cut 80% of our prompts"; it is "run the same *kind* of audit
on our own scaffolding and measure what actually happens."

## The three-era arc (as described, not as measured by us)

1. **Sonnet 3.5 era** — small system prompt, many worked examples. The model
   needed to be shown.
2. **Mid-generation Opus era** — the system prompt grew large. More rules,
   more guardrails, more "do not."
3. **Opus 5 / Claude 5-generation era** — the prompt shrinks again. The claim is that a
   more capable model is *hobbled* by the scaffolding built for a weaker one —
   the "capability overhang" / "unhobbling" framing: capability was already
   there; the scaffolding was hiding it.

This arc is the frame, not our finding. We would be testing whether it
reproduces on our surfaces.

## The idea — a descaffolding audit

Separate our harness instructions into two piles and treat them differently:

- **Model-compensating scaffolding** — text that exists because an earlier
  model needed to be shown or fenced in: worked examples of the "one right
  way," long "do not" lists, defensive restatements. **Candidate to cut** on
  the newer-model surfaces, *and measured before/after*, never cut on faith.
- **Repo-invariant policy** — text that encodes a fact about *this repo* that
  no model can infer from capability alone: the Node 22 CI contract, the
  three-source-of-truth doc system, the lexicon gate, the repository-boundary
  flow (`gaia-research → marketing-tasks → gaia-skill-tree`), the
  `gpt-image-2`-only asset rule. **Keep** — a smarter model does not know our
  CI pins Node 22; that is not a capability question.

The audit's whole value is in *not* conflating the two. "The model is smarter
so we can delete rules" is only true for the first pile.

## Why now

- The claim is fresh and specific (a named speaker, a named number, a named
  model family), so it is testable rather than folklore.
- We already run per-model / per-harness measurement discipline
  (`scripts/hell-heaven-bench/`, D12's `--output-format json` token counts),
  so a before/after prompt-shrink measurement slots into machinery that
  already exists rather than needing new infrastructure.
- Our own CLAUDE.md and skill files have grown their own "do not" lists over
  many small PRs — exactly the kind of accretion the audit is designed to find.

## What to research / measure (if this graduates past idea)

- Pick one or two of our own scaffolds (a SKILL.md, a section of CLAUDE.md).
- Classify each block as model-compensating vs. repo-invariant.
- On a Claude 5 model, run the task with and without the model-compensating
  blocks, measured the same way every time (D12 discipline: token counts via
  `--output-format json`, N repeats, own-placebo floor). Keep only what the
  measurement shows earns its tokens.
- Report per-model — a shrink that helps Opus 5 may not help Haiku 4.5; that
  is the whole lesson of the per-model matrix idea (Rank 2), and it applies
  here too.

## Open questions

- Does the arc reproduce on *our* surfaces at all, or is 80% specific to
  Anthropic's harness and its specific accretion history?
- Where exactly is the model-compensating / repo-invariant line for ambiguous
  cases (e.g. a worked example that also encodes a repo convention)?
- Is there a class of scaffolding that helps a weaker probe model and hurts a
  stronger target model, so the "right" prompt is genuinely model-dependent
  and there is no single lean version to converge on?

## What this is NOT

- Not a commitment to cut anything. It is a proposal to *audit and measure*.
- Not a ratified method. It does not change D12, P1, P2, or any LOCKED item;
  it rides on top of them.
- Not a claim that our prompts are 80% removable. That number is Anthropic's,
  about Anthropic's harness.

## Sources

- **Primary:** Thariq Shihipar (Anthropic), *"The new rules of context
  engineering for Claude 5 generation models"* (2026-07-24) —
  https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models.
  States the over-80% system-prompt cut, the no-measurable-loss coding-evaluation
  result, and the operational changes to rules, examples, and context loading.
- **Primary talk:** Thariq Shihipar (Anthropic), *"Field Guide to Fable,"* AI
  Engineer World's Fair (talk video, July 2026) —
  https://www.youtube.com/watch?v=9fubhllmsBU. Supplies the "capability
  overhang" and examples-as-constraints framing.
- Simon Willison, *"A Fireside Chat with Cat and Thariq from the Claude Code
  team"* (2026-07-21) — corroborates the 80% reduction and the code-owner
  review process for the system prompt.
- The Decoder, *"Anthropic says it cut 80 percent of Claude Code's system
  prompt…"* (2026-07-02) — secondary coverage; ties the change to the Fable 5
  / "Mythos" class and quotes the "want a smaller system prompt" line.
- `platform.claude.com` Opus 5 model documentation (model-family context).

The over-80% figure and evaluation result are Anthropic's, verified against
Shihipar's official article. The three-era framing comes from his primary talk.
