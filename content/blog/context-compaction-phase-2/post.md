# The Empirical Compaction Curve: What Happens When You Actually Measure Autocompaction

*September 14, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

Six days ago we published [The Context Compaction Curve](/blog/context-compaction-curve) and modelled the compaction sweet spot at **40k–65k tokens**. That number came from pricing arithmetic, not from a running agent. We said so at the time, and then we went and measured it.

We were wrong — not by a little, and not in the direction anyone expects.

Across 37 benchmark runs on Gemini 3.8 Flash — eight autocompaction ceilings, 450+ controlled turns — the cheapest configuration in the entire sweep was the one with autocompaction **switched off**. On a 25-turn feature build, compacting at a 50,000-token ceiling billed **\$2.48**. Never compacting at all billed **\$1.60**. Being disciplined about context cost 55% more than being lazy about it.

> **The one-line version.** Compaction is not a cleanup routine. It is a **cache-invalidation event**. It throws away a 90% prefix discount you were already getting for free, then charges you full price to re-read the files it just forgot. Never compact while your cache is warm.

---

## What to change tomorrow morning

Before the receipts, here is the whole finding in the form you can act on:

- **Set your default threshold to 150k–200k — never 50k.** Below roughly 100k the agent falls into a compact → forget → re-read → compact loop it cannot climb out of.
- **Working continuously (turns less than ~5 minutes apart)? Let context run.** Over 90% of your prompt is billing at the cached rate, which is 10× cheaper than re-establishing a prefix from scratch.
- **Mid-refactor with several files open? Suppress compaction entirely.** Compacting here triggered a **4.95×** surge in file re-reads, peaking at 6.08×.
- **Back from a coffee break with 100k+ of context? Compact once, before you type.** The cache has already evicted, so you are paying cold-read prices either way — summarize first and pay for fewer of them.
- **On a frontier model, this stops being pocket change.** The same 25-turn build costs \$5.87 more on Opus 5 and \$14.92 more on Fable 5.1 when you compact at 50k — per build, per developer.
- **Crossing from planning into implementation? Compact, or hand off to a fresh session.** Dead architectural debate is pure reasoning drag, and a clean boundary resets it.

The rest of this post is why each of those lines is true, and where the data is thinner than we would like. The full methodology, every arm's raw telemetry, and the power-law derivation live in the [Phase 2 Methodology & Receipts Report](/research/context-compaction-phase-2).

---

## The intuition trap

Gut feel says compact early. Every token in the window is processed on every turn, so an agent carrying 200,000 tokens should cost roughly four times as much as one carrying 50,000. When a session starts feeling heavy, the instinct is to trim it.

Modern KV prompt caching breaks that arithmetic completely.

Frontier providers bill input on two tiers: full-price fresh input, and heavily discounted reads of an already-cached prefix. On Gemini 3.8 Flash, fresh input is **\$0.75 per million tokens**; a cached prefix read is **\$0.075 per million** — a 90% discount.

In an active loop, nearly your entire conversation history is served from that cache. Here is Turn 20, with context grown to 180,000 tokens:

| State | What gets billed | Turn cost |
| :--- | :--- | :---: |
| **Uncompacted, warm** | 178k cached + 2k fresh | **\$0.0149** |
| **Compacted at 50k** | Summary + 50k fresh write + re-reads | **\$0.0465** |

The uncompacted turn costs less than a penny and a half. The compacted turn pays a **triple tax**:

1. **Summary burn.** The harness calls the model to summarize history, generating output tokens at \$3.75/M — the most expensive token you can buy.
2. **Prefix invalidation.** The summary replaces the history, so the provider's cached KV prefix no longer matches. The next turn writes the whole prompt as fresh input at \$0.75/M.
3. **Working-memory eviction.** The summary drops exact line numbers, AST fragments, and test traces. The agent has to go back to disk.

Tax 3 is the one nobody prices in, and it is the one that compounds.

---

## Never compact when warm

Scenario 2 ran all eight ceilings through an identical 30-turn workload (`workloads/feature.md`) with **zero idle time between turns** — every turn back-to-back, cache warm throughout. This is the shape of a real afternoon of pair-programming with an agent.

| Arm | Ceiling | Compactions | Total cost (30 turns) |
| :--- | :---: | :---: | :---: |
| **A-50k** | 50,000 | **101** | **\$4.49** |
| A-100k | 100,000 | 11 | \$2.70 |
| A-150k | 150,000 | 3 | \$3.39 |
| **A-200k** | 200,000 | **1** | **\$2.27** |
| A-272k | 272,000 | 0 | \$3.13 |
| A-500k | 500,000 | 0 | \$2.59 |
| A-1M | 1,048,576 | 0 | \$3.71 |
| **A-disabled** | — (off) | **0** | **\$2.54** |

`A-50k` compacted **101 times in 30 turns** — an average of 3.37 compactions *per turn*. It was not managing context; it was stuck in a loop: edit code → exceed 50k → compact → lose the variable references it just wrote → re-read the file → exceed 50k → compact again.

The bill: **\$4.49 for `A-50k` against \$2.27 for `A-200k`**. Compacting aggressively "to save money" carried a **97.7% surcharge**.

[[COMPACTION_CURVE_FIGURE]]

Scenario 4 repeated the sweep over a 25-turn build with deliberate cold spells — seven-minute idle gaps at turns 8 and 16, simulating the coffee breaks and meetings that let a cache expire. `A-50k` took 37 compactions and billed **\$2.48**; `A-disabled` billed **\$1.60**. Same 55% penalty, different route to it.

Read the two tables together and the honest shape of the result appears: **the penalty lives at the low end, not the high end.** Above roughly 150k, the arms scatter within run-to-run noise — 200k wins Scenario 2 and loses Scenario 4. Below 100k, every arm loses, in every scenario, by a lot. That asymmetry is the finding. "Set it high" is a safe bet; "set it low" is a reliably expensive one.

---

## The reacquisition multiplier

Why does compaction cost so much more than the summary itself? Because a summarized agent becomes a paranoid one.

Scenario 5 counted `read`, `grep`, and `find` calls in the three turns immediately after each compaction, against that arm's own baseline.

| Metric | A-50k | A-200k | A-disabled |
| :--- | :---: | :---: | :---: |
| Baseline reads per turn | 0.65 | 2.35 | 2.08 |
| Post-compaction reads per turn | 3.22 | 1.67 | — (no compactions) |
| **Reacquisition multiplier (Scenario 4)** | **4.95× (peak 6.08×)** | 0.71× | 1.00× |
| **Reacquisition multiplier (Scenario 2)** | **2.65× (peak 3.03×)** | 0.33× | 1.00× |
| Planted-directive violations | 0 | 0 | 0 |
| Final test suite | 100% pass | 100% pass | 100% pass |

When compaction fired mid-derivation in Scenario 4, file inspection surged **4.95×** over the next three turns, peaking at **6.08×**.

The interesting part is *what* survives a summary and what does not. Planted architectural directives — strict TypeScript, no `any` — were retained perfectly: **zero violations across every arm** in Scenarios 2, 4, and 6. Summaries are good at keeping rules. What they lose is fine-grained working memory: exact function signatures, export interfaces, mock payloads. The agent knows the constraints and has forgotten the code.

So it re-reads. And because the summary already invalidated the prefix, every re-read byte arrives as **fresh, full-price input**. That is the tax: you pay to forget, then you pay again to remember, at ten times the rate you were paying to simply not forget.

---

## The other direction: thinking gets more expensive

If uncompacted context preserves cache hits and avoids reacquisition storms, why not carry a million tokens forever?

Because there is a tax at the top end too — it just isn't an input-token tax. It is **reasoning inflation**.

Scenario 3 held the task fixed (`workloads/refactor.md`) and varied only the history the agent carried into it: four tiers (20k, 80k, 180k, 272k), three runs each, twelve runs total.

| History tier | Measured context (L) | Total output tokens | Turn cost |
| :--- | :---: | :---: | :---: |
| 20k (clean) | 60k – 112k | 467 – 776 | \$0.063 – \$0.109 |
| 80k (moderate) | 56k – 82k | 292 – 1,123 | \$0.084 – \$0.111 |
| 180k (heavy) | 152k – 171k | 1,337 – 1,549 | \$0.334 – \$0.444 |
| 272k (bloated) | 146k – 255k | 1,739 – 2,335 | \$0.427 – \$0.661 |

Identical task. Same model. **Ten times the cost per turn** at the bloated end.

[[REASONING_SCALING_FIGURE]]

Fitting reasoning tokens against context length gives a power law with an exponent of **β ≈ 1.49** — super-linear. In plain terms: **double your context and the model thinks roughly 2.8× as hard** to get through it, whether or not the extra context is relevant.

The mechanism is mundane. Stale terminal logs, superseded compiler errors, abandoned diffs — reasoning models read their own prefix while searching, and dead history widens the search. At the 272k tier, total output averaged 2,075 tokens per turn, quadruple a clean 20k context, pushing single turns to **\$0.66**.

*The full fit, per-run receipts, and the derivation live in the [Phase 2 Methodology & Receipts Report](/research/context-compaction-phase-2); they are not repeated here.*

---

## Fifty turns without compacting once

Does the reasoning tax eventually break long-context execution outright? Scenario 6 pushed one arm — `A-disabled` — through a 50-turn full feature lifecycle (`workloads/endurance.md`): a priority queue with backpressure, a concurrency-limited worker pool with graceful drain, a dead-letter queue with exponential backoff, REST routing with payload validation, a DAG scheduler, a Prometheus metrics collector, then a full refactor with strict JSDoc and vitest suites.

Session `01a097fd` ran from Turn 1 to Turn 50 with the compactor off:

- **Cache hit rate: 96.8%** (42.4M of 43.9M tokens)
- **Compactions: 0**
- **Cost: \$4.77** across 18.7 minutes
- **Final state: 17/17 vitest tests passing**, `tsc --noEmit` clean
- Context peaked at ~260k tokens — **25.9%** of the 1M window

Zero hallucinations, zero instruction drift, zero degradation across the run. Per-turn cost rose smoothly from \$0.013 on Turn 1 to \$1.255 on Turn 50 — the reasoning tax is real and visible, and it never became a correctness problem.

Now compare the two ends of the sweep. `A-50k` spent **\$4.49 on 30 turns** while thrashing through 101 compactions. `A-disabled` spent **\$4.77 on 50 turns** and shipped a working queue engine with a green test suite. Nearly the same money; **67% more work done**.

---

## What this costs on the model you actually use

We benchmarked Gemini 3.8 Flash because it is cheap enough to run 37 sessions without a budget conversation. You are probably not running Gemini 3.8 Flash.

So here is the same result priced onto four frontier models. The method is deliberately narrow: we take the **measured token counts** from Scenario 4 — `A-50k` at 2.41M fresh input / 4.56M cache reads / 87k output, `A-disabled` at 0.94M / 8.80M / 62k — and re-price those exact counts at each model's public rate card. Nothing about the agent's behaviour is modelled; only the invoice changes. Rates come from the [LiteLLM catalog](https://github.com/BerriAI/litellm) fetched 2026-09-13, and the method reproduces the Gemini receipts to the cent.

| Model | Compacting at 50k | Never compacting | You lose | Penalty |
| :--- | :---: | :---: | :---: | :---: |
| Gemini 3.8 Flash *(measured)* | \$2.48 | \$1.60 | \$0.88 | +55% |
| GPT-5.6 Sol | \$13.22 | \$8.52 | \$4.70 | +55% |
| Claude Opus 5 | \$16.53 | \$10.65 | \$5.87 | +55% |
| Claude Fable 5.1 | \$29.63 | \$14.71 | **\$14.92** | **+101%** |
| GPT-6 Astra | \$33.05 | \$21.31 | \$11.74 | +55% |

That is **one 25-turn feature build**. Run four a day across 21 working days and the compaction tax is \$395/month on Sol, \$493 on Opus 5, \$986 on Astra, and \$1,253 on Fable 5.1 — per developer. Pick your own volume; the per-build number is the one we measured.

[[MODEL_PRICING_FIGURE]]

### Why four of the five land on exactly +55%

That is not a rounding coincidence, and it is the most portable thing in this post. The penalty percentage is governed by a single number on the rate card: **the ratio of cache-read price to fresh-input price.**

Gemini, Sol, Opus 5, and Astra all discount cache reads 10:1, so they all pay the same 55% surcharge for compacting at 50k. Fable 5.1 discounts them **40:1** — \$0.25 per million read against \$10.00 fresh — and its penalty doubles to **+101%**.

The conclusion runs against instinct and is worth saying slowly: **the better your provider's cache deal, the more compaction costs you.** A deep cache discount is not insurance against a bloated context. It is precisely what makes throwing that context away expensive, because it widens the gap between the token you were paying for and the token you replaced it with.

If your provider ever announces a deeper cache discount, your autocompaction threshold should go *up*, not down.

### Two honest caveats

**We did not run these models.** Token counts are behavioural, and a different model will read a different number of files after a compaction, think for a different number of tokens, and possibly compact a different number of times. Treat the table as *"what the invoice would have said if this model behaved exactly like the one we measured"* — a re-pricing, not a prediction. The mechanism should hold anywhere there is a discounted prefix cache; the exact dollars will not.

**These figures understate the penalty.** Gemini's rate card has no separate cache-write price, so our measured receipts carry no cache-write column and the re-pricing above omits it entirely. Every one of `A-50k`'s 37 compactions forces a fresh prefix write, and on all four frontier cards a cache write costs 1.25× fresh input. Charging `A-50k`'s 2.41M fresh input tokens at cache-write rates instead would push the penalty from +55% to roughly **+83%** on Sol, Opus 5, and Astra, and from +101% to **+142%** on Fable 5.1. The omitted cost falls almost entirely on the compacting arm, so every number in the table is a floor.

---

## Where this is thin

Three limits worth stating plainly, because they bound how far you should carry this:

- **One run per arm per scenario.** The high-ceiling arms scatter enough between Scenario 2 and Scenario 4 that we will not name a single optimal number. The 50k penalty is large and consistent; the difference between 200k and 500k is not.
- **One model, one harness.** Gemini 3.8 Flash under `pi` v0.85.1. The mechanism — cache invalidation plus reacquisition — should generalize to any provider with a discounted prefix cache, but the break-even points will move with the price ratio.
- **The cross-model table is arithmetic, not measurement.** We re-priced measured token counts; we did not re-run the benchmark on Opus 5, Fable 5.1, Sol, or Astra. The +55% / +101% split is a property of the rate cards and is solid. The dollar figures inherit Gemini's behaviour and are the weakest numbers in this post.
- **Summary quality was not varied.** A harness that preserves open file buffers verbatim would likely blunt the reacquisition multiplier considerably. Nobody has built that yet, which is partly the point.

---

## The new rule of thumb

- **Rapid iteration**, gaps under 5 minutes → *let context run, no compaction.* A 90%+ cache hit rate makes old tokens 10× cheaper than a new prefix.
- **Mid-refactor or multi-file edits** → *pin context, suppress compaction.* This is where the 4.95×–6.08× re-read storm lives.
- **Cold return**, gap over 5 minutes with context above 100k → *compact once, before prompting.* The cache has evicted; re-warming 150k cold tokens costs more than summarizing them.
- **Phase boundary**, planning into building → *compact, or hand off to a clean session.* Drops dead debate and resets reasoning-token scaling.

### If you build harnesses

1. **Raise the autocompaction floor.** A 50k default is an anti-pattern on models with 200k+ native windows. Start at 150k–200k.
2. **Gate compaction on cache warmth, not token count alone.** Check the time since the last turn. If the prefix is warm, defer — compacting into a warm cache is strictly value-destroying.
3. **Pin the working set across compaction.** If you must compact, carry open file buffers and recent symbols through verbatim instead of narrating them into prose. That is where the 4.95× comes from.
4. **Prefer explicit handoffs to reactive autocompaction.** At a phase boundary, write a `/handoff` brief and start clean. An autocompactor firing mid-step is the worst of both.

The headline is small enough to keep in your head: **compaction is a cache event, not a hygiene routine.** Pay it when the cache is already cold. Never pay it when it's warm.

---

## Sources

- **Gaia Research.** *Compaction Bench Phase 2 Primary Dataset.* [Methodology & Receipts](/research/context-compaction-phase-2) (`scripts/compaction-bench/data/summary/`); Scenarios 1–6 receipts.
- **Gaia Research.** [*The Context Compaction Curve*](/blog/context-compaction-curve) (Phase 1, September 8, 2026) — the modelled 40k–65k prediction this benchmark falsified.
- **BerriAI/litellm.** *Model Prices and Context Window Catalog.* [github.com/BerriAI/litellm](https://github.com/BerriAI/litellm) — Gemini 3.8 Flash rates: \$0.75 input, \$3.75 output, \$0.075 cache read per 1M.
- **Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P.** (2024). *Lost in the Middle: How Language Models Use Long Contexts.* Transactions of the ACL, 12, 157–173. [arXiv:2307.03172](https://arxiv.org/abs/2307.03172)
- **Snell, C., Lee, J., Xu, K., & Kumar, A.** (2024). *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.* [arXiv:2408.03314](https://arxiv.org/abs/2408.03314)
