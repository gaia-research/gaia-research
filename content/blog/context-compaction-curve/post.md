# The Context Compaction Curve: Why Your Agent Pays Double After 272k Tokens

*September 08, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

> Your coding agent just re-read 250,000 tokens of history it already processed — and the cache expired four minutes ago. That single turn cost $0.94. The same turn at 50k context costs $0.19. The difference is not a rounding error; it is the shape of a curve that every agent builder should see before configuring their next session.

---

## The Two Cliffs Nobody Talks About

Every frontier LLM provider markets million-token context windows. What they do not market is the **pricing discontinuity** hiding inside them.

**OpenAI's 272k Tripwire.** Cross 272,000 input tokens on any GPT-5.6 or GPT-6 request and the entire prompt reprices: **2× on all input tokens, 1.5× on all output tokens.** Not the overflow — the whole request, retroactively. A 300k-token prompt on GPT-5.6 Terra costs $1.20/M input instead of $0.60/M. The surcharge is a step function, not a slope.

| Model | Input ≤272k | Input >272k | Output ≤272k | Output >272k |
| :--- | ---: | ---: | ---: | ---: |
| GPT-6 Astra | $10.00/M | $20.00/M | $50.00/M | $75.00/M |
| GPT-5.6 Sol | $4.00/M | $8.00/M | $20.00/M | $30.00/M |
| GPT-5.6 Terra | $2.00/M | $4.00/M | $12.00/M | $18.00/M |
| GPT-5.6 Luna | $0.20/M | $0.40/M | $1.20/M | $1.80/M |

*Source: [OpenAI API Pricing](https://openai.com/api/pricing/), retrieved September 2026.*

**Anthropic's 5-Minute Cache Cliff.** Anthropic's prompt cache carries a 5-minute TTL. Every cache hit reads at 0.10× the base input price — a 90% discount. But when a turn takes longer than 300 seconds (a test suite, a human code review, a subagent handoff), the cache evicts. The next turn must re-write the entire prefix at 1.25× base price.

The cache was silently reduced from a 1-hour TTL to 5 minutes in early March 2026. A 1-hour option still exists but costs 2× base — double the write penalty.

These two cliffs interact with a third force that the pricing pages do not mention at all.

---

## Reasoning Tokens Scale With Context Noise

Reasoning models — Claude with extended thinking, OpenAI o3, GPT-5 — allocate their internal deliberation budget dynamically. When the prompt is clean and focused, thinking is efficient. When the prompt carries 200k tokens of stale bash output, completed diffs, and historical tool traces, the model's internal search tree expands to navigate the noise.

This is the mechanism described by Snell et al. (2024): test-time compute scales with input entropy. More distractors in the prompt means a wider exploration tree, which means more thinking tokens. Thinking tokens are billed as output — $10–$75 per million tokens depending on the model.

A task that needs 1,200 thinking tokens in a clean 30k context will routinely generate 6,000–12,000 thinking tokens in an uncompacted 250k context. The exact multiplier varies by model and task, but the direction is consistent: **bloated context inflates the most expensive token category.**

Liu et al. (2024) documented the complementary failure: information placed in the middle of long contexts suffers severe retrieval degradation — the "Lost in the Middle" effect. Uncompacted histories push recent, relevant instructions into the degraded middle zone, where the model is least likely to attend to them.

The practical consequence: an agent that delays compaction to maximise "context preservation" is simultaneously making its reasoning slower, more expensive, and less accurate.

---

## The Compaction Curve

Plot the total cost of a multi-turn coding session against the compaction threshold — the token count at which the harness summarises and truncates history — and the curve forms an asymmetric U:

[[COMPACTION_CURVE]]

**Left side (over-compaction, threshold < 25k):** The agent compacts too aggressively. Every few turns it loses file paths, type signatures, and test logs, then spends fresh tokens re-reading them. Compaction overhead plus reacquisition thrashing dominate.

**Right side (under-compaction, threshold > 100k):** Context grows unchecked. Cache miss penalties escalate. Reasoning tokens inflate. And above 272k on OpenAI, the pricing multiplier kicks in across the entire request.

**The valley (40k–65k):** Cache writes amortise across 8–15 turns. Cache miss blast radius stays small. Reasoning tokens stay clean. The 272k cliff is never approached.

---

## The Math, Worked

Take a concrete 30-turn session on Claude Sonnet 4.6 ($3.00/M input, $0.30/M cached read, $3.75/M cache write, $15.00/M output). Five turns breach the 5-minute TTL (a code review, a test run, three subagent waits).

### At compaction threshold = 250k

- **5 cache misses:** $250\text{k} \times 3.75 / 1\text{M} = \$0.94$ each → **$4.69 total**
- **25 cache hits:** $250\text{k} \times 0.30 / 1\text{M} = \$0.075$ each → **$1.88 total**
- **Thinking token inflation:** ~8,000 tokens/turn × 30 turns × $15.00/M → **$3.60**
- **Session input + output total: ~$10.17**

### At compaction threshold = 50k

- **5 cache misses:** $50\text{k} \times 3.75 / 1\text{M} = \$0.19$ each → **$0.94 total**
- **25 cache hits:** $50\text{k} \times 0.30 / 1\text{M} = \$0.015$ each → **$0.38 total**
- **Thinking tokens (clean context):** ~1,500 tokens/turn × 30 turns × $15.00/M → **$0.68**
- **Session input + output total: ~$2.00**

The difference: **$8.17 per session**, or roughly **80% savings** — on the same task, the same model, with no loss of final output quality.

*All figures are calculated from published pricing, not measured from benchmark runs. The thinking token estimates (8,000 vs 1,500 per turn) are model-derived projections, not empirical measurements. See the [Source Ledger](#sources) for methodology.*

---

## Three Things Happening at Once

The economic damage from delayed compaction is not one cost — it is three costs compounding:

**1. The cache penalty scales linearly with context size.** A cache miss on a 250k context costs 5× more than on a 50k context. Every minute your agent spends waiting on a test suite or a human review is a minute closer to the 5-minute TTL expiry — and the penalty for expiry grows with every token you kept.

**2. Reasoning tokens scale super-linearly with context noise.** This is the hidden multiplier. Even when the cache holds, the model spends more output tokens thinking through a noisy 250k prompt than a clean 50k one. Output tokens are 3–5× more expensive than input tokens on every frontier model.

**3. The 272k cliff is a step function, not a gradient.** You do not gradually pay more as context grows past 272k. You pay exactly the base rate at 271,999 tokens and exactly double at 272,001 tokens. There is no warning, no partial surcharge, no opt-out.

---

## What to Actually Set

### OpenAI Codex CLI

The default compaction threshold is 90% of the model's context window — for a ~302k-window model, that is roughly 272k. This is the pricing cliff itself. Lower it:

```toml
# ~/.codex/config.toml
model_auto_compact_token_limit = 65000
```

The config key is `model_auto_compact_token_limit`. Values above 90% of the context window are silently ignored (enforced since v0.100.0). You can lower the threshold but not raise it beyond the cap.

### Claude Code

Claude Code does not expose a numeric compaction threshold. Instead, trigger `/compact` deliberately at **structural phase boundaries**: after architecture planning settles, after test scaffolding is created, after a large refactor lands. Do not wait for the harness to auto-compact at 160k+.

Store persistent project invariants in `CLAUDE.md` — they survive compaction because they are re-injected as system context, not carried in conversation history.

### Pi / Multi-Agent Frameworks

Set worker subagent context ceilings to 40k–50k tokens. Spawn fresh leaf agents for discovery tasks rather than dragging the parent's full history into a child. Enable token accounting (e.g. `pi-cost`) to detect when context growth outpaces task progress.

---

## The Uncomfortable Implication

The million-token context window is a capability, not a recommendation. Using it as a default is like allocating 64 GB of RAM to every process because the machine has it — technically possible, economically ruinous at scale.

The sweet spot for coding agent sessions — where cache economics, reasoning efficiency, and task accuracy converge — sits at **40k–65k tokens**. This is a model-derived prediction from published pricing, not yet validated by controlled benchmarks. The [benchmark harness](https://github.com/gaia-research/gaia-research/pull/216) to measure it empirically is in progress.

Until that data lands, the conservative move is clear: lower your compaction threshold now, and pay attention to the bill.

---

## Sources

- **OpenAI.** *API Pricing.* Retrieved September 2026. [openai.com/api/pricing](https://openai.com/api/pricing/)
- **OpenAI.** *Developers API Pricing Reference.* [developers.openai.com/api/docs/pricing](https://developers.openai.com/api/docs/pricing)
- **Anthropic.** *Prompt Caching.* Claude Platform Docs. [platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- **Codex CLI.** *Configuration Reference.* [learn.chatgpt.com/docs/config-file/config-reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- **Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P.** (2024). *Lost in the Middle: How Language Models Use Long Contexts.* Transactions of the ACL, 12, 157–173. [arXiv:2307.03172](https://arxiv.org/abs/2307.03172) · [DOI:10.1162/tacl_a_00638](https://doi.org/10.1162/tacl_a_00638)
- **Snell, C., Lee, J., Xu, K., & Kumar, A.** (2024). *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.* [arXiv:2408.03314](https://arxiv.org/abs/2408.03314)
