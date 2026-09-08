# The Context Compaction Curve

*September 08, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

> You step back into a coding session after a ten-minute coffee break. The context sits at 105,000 tokens. Because you were gone longer than the provider's 5-minute cache window, your prompt cache has expired — every token must be re-ingested at full price. Do you compact now, or push through and hope the next few turns are fast enough to re-warm the cache? Here is the math that should replace the gut feel.

---

## How Prompt Caching Actually Works

Every coding agent accumulates history: file reads, diffs, tool outputs, test traces. Each turn adds tokens. At some threshold the harness can *compact*: summarise the history, discard the raw transcript, and continue with a smaller context.

The compaction decision is a caching decision. Compact too early and the agent re-reads files it just threw away. Compact too late and three costs compound:

1. **Cache miss penalties grow linearly with context size.** A cold 200k context costs 4× more to re-warm than a 50k one.
2. **Reasoning tokens inflate.** Stale history widens the model's internal search tree, generating more thinking tokens — billed at output rates.
3. **Retrieval accuracy degrades.** The "Lost in the Middle" effect (Liu et al., 2024) means instructions buried deep in a long context are less likely to be followed.

**Anthropic's prompt cache** stores a prefix of the conversation. Subsequent turns sharing that prefix read it at **0.10× base input price** — a 90% discount. But the cache has a **5-minute TTL**. If more than 5 minutes elapse between turns — a test run, a code review, a coffee break — the cache evicts. The next turn re-writes the prefix at **1.25× base price**.

| Event | Cost multiplier | Example at 100k tokens (Sonnet 4.6, $3.00/M base) |
| :--- | :---: | ---: |
| Cache hit (Δt < 5 min) | 0.10× | $0.030 |
| Normal input (no cache) | 1.00× | $0.300 |
| Cache write (miss) | 1.25× | $0.375 |

The gap between a hit and a miss at 100k tokens is **$0.345 per turn**. At 200k it is $0.69. At 50k it is $0.17.

---

## The Cache-Cold Return Problem

Back to the coffee break. Your 105k session has gone cold. Two paths:

**Option A: Push through without compacting.**

Your next turn pays the full cache write on 105k tokens:

$$105\text{k} \times 3.75 / 1\text{M} = \$0.394$$

If that turn finishes in under 5 minutes, the *following* turn gets the cache hit discount. But if it is slow — a test suite, a build, another pause — you pay the write penalty again. And as context grows toward 200k, each miss costs more:

$$200\text{k} \times 3.75 / 1\text{M} = \$0.750$$

**Option B: Compact to 50k, then continue.**

The compaction itself costs one cache write at 105k ($0.39) plus a summary output (~2,000 tokens at $15/M = $0.03). Total: **~$0.42**.

But every subsequent cache miss is now on 50k:

$$50\text{k} \times 3.75 / 1\text{M} = \$0.188$$

Turn 1 costs roughly $0.40 either way. The difference is what turns 2 through 10 cost. Each subsequent miss saves $0.21 after compaction. The compaction pays for itself after **two cache misses** — two turns where Δt > 5 minutes.

---

## The Compaction Curve

Model the total cost of a 30-turn session against the compaction threshold and the curve forms an asymmetric U:

[[COMPACTION_CURVE]]

**Left (<25k) — thrashing.** The agent compacts so aggressively it re-reads files every few turns. Reacquisition cost dominates.

**Right (>100k) — bloat.** Cold cache penalties and thinking token inflation compound unchecked.

**The valley (40k–65k).** Cache writes amortise across enough turns to pay off, while keeping miss penalties and reasoning noise low. This is the modeled sweet spot — projected from published pricing curves, not yet validated by controlled benchmarks.

---

## The Reasoning Token Multiplier

The cache penalty is the visible cost. The reasoning inflation is the hidden one.

When a prompt carries 150k+ tokens of stale terminal output and completed diffs, reasoning models (Claude with extended thinking, OpenAI o3/o4-mini, Gemini with thinking) expand their internal search tree to navigate the clutter. Extending the findings of Snell et al. (2024) — who showed test-time compute scales with task complexity — prompt bloat introduces distractors that widen the model's deliberation. You pay for that in output tokens, the most expensive category.

| Context size | Est. thinking tokens/turn | Output cost at $15/M |
| :--- | ---: | ---: |
| 30k (clean) | ~1,200 | $0.018 |
| 50k (compact) | ~1,500 | $0.023 |
| 100k (moderate) | ~4,000 | $0.060 |
| 200k (bloated) | ~8,000 | $0.120 |

*Illustrative projections from published pricing, not empirical measurements.*

At 200k you pay **over 5× more in thinking tokens** per turn than at 50k — on top of the 4× cache miss penalty. The two costs compound.

---

## The Rule of Thumb

**If your cache is cold and your context is above 80k tokens, compact.**

The break-even is ~2 cache misses. Any session with human pauses, test runs, or subagent handoffs will hit that within 10 turns.

**When NOT to compact:**

- You are mid-refactor and the agent is holding 6+ file paths and their interdependencies. Compaction loses the dependency graph; re-reading costs more than the cache misses.
- Your next 5–10 turns will be rapid-fire (< 5 min each). The cache stays warm.
- Context is already below 50k. Compacting 40k to 20k saves ~$0.08 per miss — not worth the reacquisition risk.

---

## What to Actually Set

**Claude Code.** Trigger `/compact` at structural phase boundaries — after planning settles, after test scaffolding lands, after a large refactor. The critical habit: **compact when you return from a break.** If Δt > 5 minutes, your cache is cold. Compact *before* the next prompt, not after. Store persistent invariants in `CLAUDE.md` — they survive compaction as system context.

**Pi / multi-agent frameworks.** Set worker subagent context ceilings to 40k–50k tokens. Spawn fresh leaf agents for discovery rather than dragging the parent's full history into a child.

---

*Next in this series: the 272k pricing cliff — the step function that makes million-token context windows a billing trap. [Issue #220.]*

---

## Sources

- **Anthropic.** *Prompt Caching.* Claude Platform Docs. [platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- **Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P.** (2024). *Lost in the Middle: How Language Models Use Long Contexts.* Transactions of the ACL, 12, 157–173. [arXiv:2307.03172](https://arxiv.org/abs/2307.03172) · [DOI:10.1162/tacl_a_00638](https://doi.org/10.1162/tacl_a_00638)
- **Snell, C., Lee, J., Xu, K., & Kumar, A.** (2024). *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.* [arXiv:2408.03314](https://arxiv.org/abs/2408.03314)
