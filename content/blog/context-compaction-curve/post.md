# The Context Compaction Curve

*September 08, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

> You step back into a coding session after a ten-minute coffee break. The context sits at 105,000 tokens. The cache is cold. Do you compact now — losing context but shrinking the blast radius — or push through, hoping the next few turns are fast enough to keep the cache warm? Every agent user makes this call by gut feel. Here is the math that should replace the gut.

---

## The Decision Nobody Has a Framework For

Every coding agent harness — Claude Code, Codex CLI, Pi, Aider, Cursor — accumulates conversation history: tool outputs, file reads, diffs, test logs, bash traces. Each turn adds tokens. At some threshold the harness can *compact*: summarise the history, discard the raw transcript, and continue with a smaller context.

The question is *when.*

Compact too early and the agent loses file paths, type signatures, and test output it will immediately re-read — spending fresh tokens to reacquire what it just threw away. Compact too late and three costs compound silently:

1. **Cache miss penalties grow linearly with context size.** A cold cache on a 200k-token context costs 4× more to re-warm than on a 50k context.
2. **Reasoning tokens inflate with context noise.** More stale history means a wider internal search tree, which means more thinking tokens — billed at output rates.
3. **Retrieval accuracy degrades.** The "Lost in the Middle" effect (Liu et al., 2024) means instructions buried in a 200k context are less likely to be followed than in a 50k one.

There is a valley between these two failure modes. This post finds it.

---

## How Prompt Caching Actually Works

The compaction decision is fundamentally a caching decision, so the cache mechanics matter.

**Anthropic's prompt cache** stores a prefix of the conversation. When the next turn shares the same prefix, the cached portion is read at **0.10× the base input price** — a 90% discount. But the cache carries a **5-minute TTL**. If more than 300 seconds elapse between turns — a test suite, a human review, a subagent handoff, a coffee break — the cache evicts. The next turn must *re-write* the entire prefix at **1.25× base price** (a 25% surcharge over normal input).

| Event | Cost multiplier | Example at 100k tokens (Sonnet 4.6, $3.00/M base) |
| :--- | :---: | ---: |
| Cache hit (Δt < 5 min) | 0.10× | $0.030 |
| Normal input (no cache) | 1.00× | $0.300 |
| Cache write (miss) | 1.25× | $0.375 |

The gap between a cache hit and a cache miss at 100k tokens is **$0.345 per turn**. At 200k it is $0.69. At 50k it is $0.17.

This is why context size and cache state interact multiplicatively: a cold cache on a large context is the worst-case scenario, and it is exactly the scenario you face when you return to an old session.

**The 1-hour TTL option.** Anthropic offers an extended 1-hour cache TTL, but it costs **2× base price** to write — double the standard write penalty. For contexts that are frequently cold for 5–15 minutes, compacting below 50k is cheaper than paying the 2× extended-write premium.

---

## The Cache-Cold Return Problem

Here is the concrete scenario. You have a Claude Code session at 105k tokens. You stepped away for 12 minutes. The cache is cold. What happens next?

**Option A: Push through without compacting.**

Your next turn pays the cache write penalty on the full 105k context:

$$105\text{k} \times 3.75 / 1\text{M} = \$0.394$$

If your next turn is fast (under 5 minutes), the *following* turn gets the cache hit discount. But if it is slow — a test run, a build, another pause — you pay the write penalty *again*. Each cache miss at 105k costs $0.39.

As the session continues and context grows to 150k, 200k, each miss costs proportionally more. By 200k:

$$200\text{k} \times 3.75 / 1\text{M} = \$0.750$$

**Option B: Compact to 50k, then continue.**

The compaction turn itself costs one cache write at 105k ($0.39) plus a normal output for the summary (~2,000 tokens at $15/M = $0.03). Total compaction cost: **~$0.42**.

But every subsequent cache miss is now on 50k, not 105k+:

$$50\text{k} \times 3.75 / 1\text{M} = \$0.188$$

The compaction pays for itself after **two cache misses** — two turns where Δt > 5 minutes. In a typical session with human pauses, subagent waits, and test runs, this happens routinely.

---

## The Compaction Curve

Plot the total cost of a 30-turn session against the compaction threshold — the token count at which the harness summarises and truncates — and the curve forms an asymmetric U:

[[COMPACTION_CURVE]]

**Left side (over-compaction, threshold < 25k):** The agent compacts too aggressively. Every few turns it loses file paths, type signatures, and test logs, then spends fresh tokens re-reading them. Compaction overhead plus reacquisition thrashing dominate.

**Right side (under-compaction, threshold > 100k):** Context grows unchecked. Cache miss penalties escalate linearly. Reasoning tokens inflate super-linearly. Retrieval accuracy drops as relevant instructions drift into the degraded middle zone.

**The valley (40k–65k):** Cache writes amortise across 8–15 turns. Cache miss blast radius stays small. Reasoning tokens stay clean. The sweet spot.

---

## The Reasoning Token Multiplier

The cache penalty is the visible cost. The reasoning token inflation is the hidden one.

Reasoning models — Claude with extended thinking, OpenAI o3/o4, Gemini with thinking — allocate their internal deliberation budget dynamically. When the prompt is clean and focused, thinking is efficient. When it carries 200k tokens of stale bash output, completed diffs, and historical traces, the model's search tree expands to navigate the noise.

This is the mechanism described by Snell et al. (2024): test-time compute scales with input entropy. More distractors means a wider exploration tree, which means more thinking tokens — billed as *output*, the most expensive token category.

| Context size | Estimated thinking tokens/turn | Output cost at $15/M |
| :--- | ---: | ---: |
| 30k (clean) | ~1,200 | $0.018 |
| 50k (compact) | ~1,500 | $0.023 |
| 100k (moderate) | ~4,000 | $0.060 |
| 200k (bloated) | ~8,000 | $0.120 |

*These are model-derived projections, not empirical measurements. The direction is consistent across models; the exact multipliers will vary.*

At 200k context, you are paying **6.5× more in thinking tokens** per turn than at 50k — on top of the 4× cache miss penalty. The two costs compound.

---

## The Rule of Thumb

**If your cache is cold and your context is above 80k tokens, compact.**

The math:

1. Compaction cost: one cache write at current size + summary output tokens. At 100k ≈ $0.42.
2. Savings per cache miss avoided: proportional to the tokens shed. Dropping from 100k to 50k saves $0.19 per miss.
3. Break-even: ~2 cache misses (i.e., two turns with Δt > 5 minutes).
4. Reasoning token savings: immediate and compounding — 2–4× fewer thinking tokens per turn.

In practice, any session with human-in-the-loop pauses, test suite runs, or subagent handoffs will hit 2+ cache misses within the next 10 turns. The compaction almost always pays for itself.

**When NOT to compact:**

- You are mid-refactor and the agent is holding 6+ file paths and their interdependencies in context. Compaction will lose the dependency graph, and re-reading costs more than the cache misses.
- Your next 5–10 turns will be rapid-fire (< 5 min each). The cache will stay warm, and the hit discount offsets the large context.
- The context is already below 50k. Compacting a 40k context to 20k saves $0.07 per miss — not worth the reacquisition risk.

---

## What to Actually Set

### Claude Code

Claude Code does not expose a numeric compaction threshold. Trigger `/compact` deliberately at **structural phase boundaries**: after architecture planning settles, after test scaffolding is created, after a large refactor lands. Do not wait for the harness to auto-compact at 160k+.

The critical habit: **compact when you return from a break.** If Δt > 5 minutes, your cache is cold. Compact before the next prompt, not after.

Store persistent project invariants in `CLAUDE.md` — they survive compaction because they are re-injected as system context, not carried in conversation history.

### Pi / Multi-Agent Frameworks

Set worker subagent context ceilings to 40k–50k tokens. Spawn fresh leaf agents for discovery tasks rather than dragging the parent's full history into a child. Enable token accounting (e.g. `pi-cost`) to detect when context growth outpaces task progress.

### The General Principle

The right compaction threshold is not a function of the model's context window. It is a function of three things:

1. **Your turn cadence** — how often Δt > 5 minutes (or whatever your provider's cache TTL is).
2. **Your context quality** — how much of the accumulated history is still relevant to the current task.
3. **Your model's output pricing** — how expensive thinking tokens are relative to input tokens.

For most coding agent sessions, the convergence point is **40k–65k tokens**.

---

## What This Does Not Cover

This post focuses on the cache-cold compaction decision — the behavioral question you face every time you return to a session. There is a second, steeper curve that emerges when agents run uncompacted on models with million-token context windows: OpenAI's 272k pricing cliff, where input costs double as a step function. That is a different post with different math. Coming next.

---

## Sources

- **Anthropic.** *Prompt Caching.* Claude Platform Docs. [platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- **Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P.** (2024). *Lost in the Middle: How Language Models Use Long Contexts.* Transactions of the ACL, 12, 157–173. [arXiv:2307.03172](https://arxiv.org/abs/2307.03172) · [DOI:10.1162/tacl_a_00638](https://doi.org/10.1162/tacl_a_00638)
- **Snell, C., Lee, J., Xu, K., & Kumar, A.** (2024). *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.* [arXiv:2408.03314](https://arxiv.org/abs/2408.03314)
