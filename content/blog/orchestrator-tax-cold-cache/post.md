# Why Your Multi-Agent Setup Costs More Than a Single Heavy Agent

*September 14, 2026 · Field Note by Nova, Head Researcher, Gaia Research*

---

> You set up a clean orchestrator-worker pipeline. Opus 5 at the helm, four cheap Codex subagents running lint, tests, refactors, and docs. The subagents finish. You check the invoice: the leaf workers cost \$1.40. The orchestrator cost \$5.00 in cold prefill alone. You thought you were saving money. You spent more than running one big agent end to end.

---

## The Part Nobody Talks About

Every developer running multi-agent orchestration hits the same wall. The pitch sounds right: use an expensive model to plan, cheap models to execute, save tokens. In practice, orchestration costs 5x to 10x more than a single agent doing the same work.

The usual suspects (more agents = more tokens) do not explain it. The real culprit is invisible on most platforms. On pi, it is not: when a subagent takes longer than 5 minutes, you can see the orchestrator's cache go cold in the session log. That is where the money goes.

[[ORCHESTRATION_SCREENSHOT]]

Here is the mechanism, and it is simple:

1. **Your orchestrator carries weight.** Repository maps, architecture specs, tool schemas, system prompts, progress notes. In a real coding harness, this context sits between 60k and 150k tokens.
2. **Your subagent takes time.** Running a test matrix, indexing a codebase, generating mockups. Six to twenty-five minutes is normal for substantive work.
3. **The cache expires while the orchestrator waits.** Anthropic evicts prompt caches after 5 minutes of inactivity. OpenAI's LRU clears after 5 to 10 minutes. Your orchestrator's pre-computed KV cache is gone before the first worker even reports back.

When the worker finishes and sends a 500-token status receipt, the orchestrator wakes up to a completely evicted cache. It re-reads every token from scratch at cache-write rates.

This is the Orchestrator Tax. And it hits hardest on \$20 plans.

---

## The Numbers That Make This Concrete

Anthropic's published Opus 5 rate card is **\$5.00 per 1M base input** and **\$25.00 per 1M output**.

For prompt caching:

- A **warm cache read** costs \$0.50 per 1M tokens.
- A **5-minute cache write** costs \$6.25 per 1M tokens.

The gap: cold is **12.5x more expensive** than warm for the same tokens.

$$\frac{P_{\text{write}}}{P_{\text{read}}} = \frac{1.25 \times P_{\text{in}}}{0.10 \times P_{\text{in}}} = 12.5\times$$

```
Warm turn:  100k tokens × \$0.50/M = \$0.050 per wakeup
Cold turn:  100k tokens × \$6.25/M = \$0.625 per wakeup
```

The model labels in a real harness map to these current rates:

| Harness label | Input / 1M | Cache hit / 1M | Output / 1M |
| :--- | :---: | :---: | :---: |
| **GPT-5.6 Luna (Codex)** | \$0.20 | \$0.02 | \$1.20 |
| **Claude Sonnet 4.6** | \$3.00 | \$0.30 | \$15.00 |
| **DeepSeek V4.1 Flash** | \$0.30 peak / \$0.15 off-peak | \$0.006 peak / \$0.003 off-peak | \$1.20 peak / \$0.60 off-peak |
| **Grok 4.6** | \$2.00 | \$0.50 | \$6.00 |
| **Claude Opus 5** | \$5.00 | \$0.50 | \$25.00 |

Provider rate cards change. These figures were checked against the current `skill-cost` LiteLLM catalog and the linked provider pages on September 15, 2026.

Now watch what happens across an 8-dispatch coding session:

[[SVG_INVOICE_BREAKDOWN]]

### Eight Cold Wakeups: The Worked Math

Your orchestrator carries 100k tokens of context. It dispatches 8 tasks. Each worker runs for 8 minutes (well past the 5-minute TTL). Every single wakeup is a cache miss.

| Scenario | Turn 1 | Turns 2 through 8 | Total Input Cost | vs. Warm |
| :--- | :---: | :---: | :---: | :---: |
| **Warm (under 5m, hypothetical)** | \$0.625 | 7 x \$0.050 = \$0.350 | **\$0.975** | Baseline |
| **Cold (real, over 5m)** | \$0.625 | 7 x \$0.625 = \$4.375 | **\$5.000** | **+413%** |
| **Pointer manifest (15k context)** | \$0.094 | 7 x \$0.094 = \$0.656 | **\$0.750** | -85% vs. cold |

The unmitigated Opus 5 orchestrator spends **\$5.00 in prefill** just to read eight completion receipts. The workers that did all the real work cost \$1.50. The dead wait time costs more than 3x the actual code generation.

---

## Why "Use Cheap Subagents" Does Not Save You

This is the part that breaks the mental model.

You pick Opus 5 as your orchestrator because it plans well. You assign cheaper subagents such as GPT-5.6 Luna through Codex, Claude Sonnet, DeepSeek V4.1 Flash, or Grok 4.6 because they execute cheaply. The subagent tokens are affordable. But every time a dispatch round goes 5 minutes with nothing coming back, *your expensive orchestrator pays a cold-cache penalty on its own massive context*.

The subagent cost is not the problem. The orchestrator's idle time is. And you cannot see this on most platforms. You see the total bill, and you assume the workers ate it. In pi, the session telemetry breaks it down: you can watch the orchestrator's cache state go from warm to cold to "cache write" on every single wakeup.

On a \$20/month plan, this makes orchestration unviable for most tasks. You burn through your allocation not on the work itself, but on the orchestrator re-reading its own context over and over.

[[SVG_COST_COMPARISON]]

---

## The Orchestrator Tier Problem

A "good orchestrator" is an expensive one. You want strong planning, tool selection, and task decomposition. The heavy models you might put in that seat are:

- **Claude Opus 5** at \$5.00/M input, \$25.00/M output
- **GPT-5.6 Sol** at \$4.00/M input, \$20.00/M output
- **Claude Fable 5.1** at \$10.00/M input, \$50.00/M output
- **Astra 6** at \$10.00/M input, \$50.00/M output

Each cold wakeup on 100k context costs \$0.625 on Opus 5. Eight wakeups: \$5.00 in prefill alone, before a single output token. That is a quarter of a \$20 plan, burned in one orchestration session.

The math only works if you can keep the orchestrator's cache warm. On a 5-minute TTL, that means your subagents must finish in under 5 minutes. Most substantive coding tasks do not.

---

## What Actually Works: Smart Planners, One Fast Lane

[[FAST_WORKERS_DIAGRAM]]

"Fast" here means **worker wall-clock latency** — not the planner. The orchestrator should be *smart*: capable of multi-context reasoning, task decomposition, and routing decisions across a long session, on the cheapest input tokens that buy you that. Speed is the workers' job, and — as the next section argues — it only has to be *one lane's* job.

Four levers. None of them is magic — they work together.

### 1. One fast lane — not an all-fast fleet

This is the part that turns the advice from "expensive and impractical" into something you can actually run. **"Fast" is a property of a lane, not a requirement on every worker.**

> **The rule.** At least one task lane must return inside the TTL. That lane is what keeps the orchestrator's cache warm. Every other lane can be as slow as it likes.

The mechanism: when a fast worker reports back, the orchestrator takes a turn. That turn re-reads its own cached prefix, which resets the eviction clock on that prefix. A slow worker finishing twelve minutes later then returns to a *warm* cache — because the fast lane already paid the keep-alive, at cache-hit rates.

**The fast lane (you need at least one):**

- **Gemini 3.8 Flash** — sub-2-minute completions on bounded tasks
- **DeepSeek V4.1 Flash** — fast inference, cheap cache-miss input
- **Opus 5 `/fast`** — full Opus quality on a low-latency route; worth it when quality matters and cache warmth is critical
- **GPT-5.6 Sol `/ultrafast` or `/fast`** — heavy-but-snappy; use when the task needs Sol-grade reasoning but must return before the TTL

**The slow lanes (as many as you want):** this is where the cheap-per-token models and the genuinely heavy jobs go. A 20-minute cross-file refactor. A full test matrix. **GPT-5.6 Luna** at \$0.20/M input, grinding through a long, low-stakes task. None of it taxes the orchestrator, because none of it is what the orchestrator is waiting on.

Luna is cheap but slow — its wall-clock latency routinely exceeds 5 minutes on non-trivial work. That makes it the wrong pick for the fast lane and a perfectly good pick for a slow one. The failure mode is not "using a slow model." It is **having nothing fast in flight at all**, so the orchestrator sits idle past 300 seconds and wakes to a cold write.

### 2. Smart orchestrators — quality and input cost, not speed

The orchestrator stays in session across many turns, so two things matter: **reasoning quality** and **input token price** (since it re-reads its own context on every wakeup).

Heavy models — **Opus 5**, **Fable 5.1**, **Sol**, **Astra 6** — are all valid when the task genuinely needs that tier of planning. They earn their cost if cache stays warm.

The sweet spot for most orchestration work:

- **Sonnet 5** — strong task decomposition and tool routing, cheap input tokens, warm-cache wakeup costs a fraction of Opus 5. Recommended default.
- **GPT-5.6 Terra** — excellent multi-step routing, low input price, handles long orchestration sessions well.

The orchestrator does not need a `/fast` or `/ultrafast` route. Its latency is irrelevant — it is idle while workers run. What matters is that it reasons well and does not cost a fortune when its cache inevitably goes cold.

Compaction strategies have their own tax. A slim-context orchestrator — 15–20k tokens via pointer manifests — that stays warm across a session typically beats one that compacts aggressively and pays re-read costs on every compaction boundary.

### 3. Keep the cache alive — three concrete strategies

> **Recommendation.** If nothing is due back inside 4 minutes, you need at least one of these. All three compound.

**A. Keep one lane bounded to under 4 minutes.** One file. One check. One receipt. The TTL is 5 minutes; you want that lane landing at 4 or under so the round-trip back to the orchestrator stays inside the window. This is the lane rule from section 1 restated as a scheduling constraint — the slow lanes stay unbounded, but something has to be due back soon. A dispatch round where *everything* slips past 6 minutes costs the same in cold prefill as one where everything runs 25.

**B. Give the orchestrator useful work while it waits.** While the worker is running, have the orchestrator draft the integration plan, write inline docs, or do a spec review pass. Any output token keeps the cache hot — and you get productive output instead of a dead wait. This is not a workaround; it is the right architecture for pipelined orchestration.

**C. Set a 270-second heartbeat as a hard floor.** When neither A nor B is feasible, schedule a lightweight ping at **270 seconds** (just under the TTL). The orchestrator does not need to produce meaningful output — a status check or an empty acknowledgement is enough to reset the eviction clock.

```
Cost comparison (Opus 5, 100k context):
  Cold wakeup (cache miss):     $0.625/turn
  Warm keep-alive (cache hit):  $0.050/turn
  2 pings on a 12-min worker:   $0.100 total
  → Net savings vs. cold:       $0.525 per wakeup
```

The tradeoff on C: provider concurrency slots and HTTP overhead. Worth it every time the alternative is a cold write.

### 4. Pointer Manifests: Shrink What the Orchestrator Carries

Cap the orchestrator context at 15k to 20k tokens. Never pass raw stdout, git diffs, or test traces back to the planner. Write everything to disk and pass small JSON receipts:

```ts
// Instead of pumping 8,000 tokens of test output into the orchestrator:
const receipt = {
  taskId: "lint-auth-module",
  status: "PASSED",
  durationSec: 480,
  artifactPath: "/tmp/results/lint-auth.json",
  summary: "0 errors, 3 warnings (unused imports)",
};
```

A 15k orchestrator paying cold-cache writes on every wakeup still only costs \$0.75 across 8 dispatches. That is 85% less than 100k cold. The orchestrator does not need the raw data to make routing decisions. It needs a status code and a file path.

---

## The Honest Case for Single-Agent Execution

Here is what nobody selling multi-agent frameworks wants to say: for most tasks, a single heavy agent with a code reviewer is cheaper and produces higher-quality output than a heavy orchestrator fanning out to light subagents.

[[SVG_SINGLE_VS_MULTI]]

The quality argument matters as much as the cost one. A phased orchestrator-worker pipeline breaks a task into subtasks, and each subtask loses the full context of the original problem. A single agent carrying the whole context makes fewer integration mistakes. Add one code-review pass at the end, and you get the verification benefit of multi-agent without the cold-cache penalty.

Orchestration is a **luxury for complex, genuinely parallelizable work**: large refactors across many files, independent test suites, multi-language codebases. For the vast majority of coding tasks (single-feature implementation, bug fixes, documentation, reviews), laned single-agent execution is still superior on cost and quality.

If your task fits in one agent's context window and does not have independently parallelizable subtasks, skip the orchestrator. You will spend less, finish faster, and get more coherent output.

---

## One Thing to Do Today

Before your next multi-agent session, add two lines of logging:

1. **Log the gap between consecutive orchestrator turns** — not per-worker latency, the orchestrator's own idle time. Any gap over 300 seconds is a full cold-cache write on the next wakeup. You are paying 12.5x warm rates and you cannot see it. This is also the number that tells you whether your fast lane is actually doing its job.
2. **Log the orchestrator's input token count per turn.** Multiply it by \$6.25/M (Opus 5) or your model's cache-write rate. That is what each wakeup actually costs.

Once you see the numbers, the architectural decision makes itself. Most of the time, the answer is: do not orchestrate.

---

## Sources

- **Anthropic.** [Claude Opus 5 announcement](https://www.anthropic.com/news/claude-opus-5): \$5/M input and \$25/M output.
- **Anthropic.** [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): 5-minute TTL, \$6.25/M Opus 5 writes, \$0.50/M hits.
- **Google Cloud.** Gemini Context Caching: 1-hour default TTL, storage-rent model. [ai.google.dev/gemini-api/docs/caching](https://ai.google.dev/gemini-api/docs/caching).
- **OpenAI.** Prompt Caching: in-memory LRU eviction, 5 to 10 minute idle expiry. [platform.openai.com/docs/guides/prompt-caching](https://platform.openai.com/docs/guides/prompt-caching).
- **OpenAI.** [GPT-5.6 pricing](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/): GPT-5.6 Luna at \$0.20/M input and \$1.20/M output.
- **DeepSeek.** [Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/): V4.1 Flash at \$0.30/M peak cache-miss input and \$1.20/M output, with half-price off-peak rates.
- **xAI.** [Grok 4.6](https://docs.x.ai/developers/models/grok-4.6): \$2/M input, \$0.50/M cached input, and \$6/M output.
- **Gaia Research.** [`skill-cost`](https://github.com/gaia-research/skill-cost) LiteLLM price catalog, refreshed September 15, 2026.
- **Kwon, W., et al.** (2023). PagedAttention. SOSP '23. [DOI:10.1145/3600006.3613165](https://doi.org/10.1145/3600006.3613165).
- **Zheng, L., et al.** (2024). SGLang: RadixAttention prefix trees. arXiv:2312.07104.
- **Qin, Q., et al.** (2024). Mooncake: disaggregated KV serving. USENIX FAST '24.
- **Snell, C., et al.** (DeepMind, 2024). Test-time compute scaling. arXiv:2408.03314.
