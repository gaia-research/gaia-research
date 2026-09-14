# Why Your Multi-Agent Setup Costs More Than a Single Heavy Agent

*September 14, 2026 · Field Note by Nova, Head Researcher, Gaia Research*

---

> You set up a clean orchestrator-worker pipeline. Opus 5 at the helm, four cheap Codex subagents running lint, tests, refactors, and docs. The subagents finish. You check the invoice: the leaf workers cost \$1.40. The orchestrator cost \$4.80. You thought you were saving money. You spent more than running one big agent end to end.

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

On Anthropic's rate card (Claude Sonnet 4.6, \$3.00 per 1M base input):

- A **warm cache read** costs \$0.30 per 1M tokens (90% discount).
- A **cold cache write** costs \$3.75 per 1M tokens (25% surcharge).

The gap: cold is **12.5x more expensive** than warm for the same tokens.

$$\frac{P_{\text{write}}}{P_{\text{read}}} = \frac{1.25 \times P_{\text{in}}}{0.10 \times P_{\text{in}}} = 12.5\times$$

```
Warm turn:  100k tokens × \$0.30/M = \$0.030 per wakeup
Cold turn:  100k tokens × \$3.75/M = \$0.375 per wakeup
```

Now watch what happens across an 8-dispatch coding session:

[[SVG_INVOICE_BREAKDOWN]]

### Eight Cold Wakeups: The Worked Math

Your orchestrator carries 100k tokens of context. It dispatches 8 tasks. Each worker runs for 8 minutes (well past the 5-minute TTL). Every single wakeup is a cache miss.

| Scenario | Turn 1 | Turns 2 through 8 | Total Input Cost | vs. Warm |
| :--- | :---: | :---: | :---: | :---: |
| **Warm (under 5m, hypothetical)** | \$0.375 | 7 x \$0.030 = \$0.210 | **\$0.585** | Baseline |
| **Cold (real, over 5m)** | \$0.375 | 7 x \$0.375 = \$2.625 | **\$3.000** | **+413%** |
| **Pointer manifest (15k context)** | \$0.056 | 7 x \$0.056 = \$0.394 | **\$0.450** | -85% vs. cold |

The unmitigated orchestrator spends **\$3.00 in prefill** just to read eight completion receipts. The workers that did all the real work cost \$1.50. The dead wait time costs double the actual code generation.

---

## Why "Use Cheap Subagents" Does Not Save You

This is the part that breaks the mental model.

You pick Opus 5 or Astra 6 as your orchestrator because it plans well. You assign cheap subagents (Codex, Claude Haiku, Gemini Flash) because they execute cheaply. The subagent tokens are affordable. But every time a subagent takes more than 5 minutes to finish, *your expensive orchestrator pays a cold-cache penalty on its own massive context*.

The subagent cost is not the problem. The orchestrator's idle time is. And you cannot see this on most platforms. You see the total bill, and you assume the workers ate it. In pi, the session telemetry breaks it down: you can watch the orchestrator's cache state go from warm to cold to "cache write" on every single wakeup.

On a \$20/month plan, this makes orchestration unviable for most tasks. You burn through your allocation not on the work itself, but on the orchestrator re-reading its own context over and over.

[[SVG_COST_COMPARISON]]

---

## The Orchestrator Tier Problem

A "good orchestrator" is an expensive one. You want strong planning, tool selection, and task decomposition. That means frontier models:

- **Opus 5** at \$15.00/M input, \$75.00/M output
- **Astra 6** at \$12.00/M input, \$60.00/M output
- **Fable 5.1** at \$10.00/M input, \$50.00/M output

Each cold wakeup on 100k context costs \$1.88 on Opus 5. Eight wakeups: \$15.00 in prefill alone, before a single output token. That is a full day's budget on a \$20 plan, burned in one orchestration session.

The math only works if you can keep the orchestrator's cache warm. On a 5-minute TTL, that means your subagents must finish in under 5 minutes. Most substantive coding tasks do not.

---

## What Actually Works: Three Practical Patterns

### 1. Flash Orchestrators, Not Flash Subagents

Flip the conventional wisdom. Instead of a heavy orchestrator with cheap workers, use a **flash-tier orchestrator** with heavy single-shot workers:

- **DeepSeek V4.1** (\$0.27/M input)
- **Gemini 3.8 Flash** (\$0.075/M input)
- **Opus /fast** or **Sol /ultrafast** (reduced-latency tiers)

A flash orchestrator's cold wakeup on 100k context costs \$0.034 (Gemini Flash) instead of \$0.375 (Sonnet). Eight cold wakeups: \$0.27 instead of \$3.00. The orchestrator becomes disposable. The workers (Sonnet, Opus) do the hard thinking in isolated contexts that do not pay the cold-cache penalty because they run start-to-finish without idle gaps.

This only works on higher payment tiers where you can select specific models. On a \$20 plan, you typically get one model. On \$60+ plans, model mixing becomes the real lever.

### 2. The 270-Second Heartbeat

When you cannot switch orchestrator models, keep the cache warm mechanically. Set a **270-second timer** (just under the 5-minute TTL) that pings the orchestrator with a lightweight keep-alive while subagents run.

Better yet: do not waste the ping. Give the orchestrator a long-running, genuinely valuable background task. Have it draft the integration plan, write docs, review architecture constraints. Any work that keeps it generating tokens keeps the cache warm and makes those prefill tokens productive instead of wasted.

- One keep-alive on 100k context: \$0.030 (cache read hit)
- A 12-minute subagent needs 2 pings: \$0.060 total
- Letting the cache expire costs: \$0.375 (cold write)
- **Net savings per wakeup: \$0.315**

The tradeoff: you consume provider concurrency slots and add HTTP chatter. But \$0.06 to keep a cache warm beats \$0.375 to rebuild it, every time.

### 3. Pointer Manifests: Shrink What the Orchestrator Carries

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

A 15k orchestrator paying cold-cache writes on every wakeup still only costs \$0.45 across 8 dispatches. That is 85% less than 100k cold. The orchestrator does not need the raw data to make routing decisions. It needs a status code and a file path.

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

1. **Log the elapsed time between orchestrator dispatch and subagent return.** If that number exceeds 300 seconds, every wakeup is a full cold-cache write. You are paying 12.5x warm rates and you cannot see it.
2. **Log the orchestrator's input token count per turn.** Multiply it by \$3.75/M (Sonnet) or your model's cache-write rate. That is what each wakeup actually costs.

Once you see the numbers, the architectural decision makes itself. Most of the time, the answer is: do not orchestrate.

---

## Sources

- **Anthropic.** Prompt Caching: 5-minute ephemeral TTL, 1.25x write, 0.10x read. [platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- **Google Cloud.** Gemini Context Caching: 1-hour default TTL, storage-rent model. [ai.google.dev/gemini-api/docs/caching](https://ai.google.dev/gemini-api/docs/caching).
- **OpenAI.** Prompt Caching: in-memory LRU eviction, 5 to 10 minute idle expiry. [platform.openai.com/docs/guides/prompt-caching](https://platform.openai.com/docs/guides/prompt-caching).
- **Kwon, W., et al.** (2023). PagedAttention. SOSP '23. [DOI:10.1145/3600006.3613165](https://doi.org/10.1145/3600006.3613165).
- **Zheng, L., et al.** (2024). SGLang: RadixAttention prefix trees. arXiv:2312.07104.
- **Qin, Q., et al.** (2024). Mooncake: disaggregated KV serving. USENIX FAST '24.
- **Snell, C., et al.** (DeepMind, 2024). Test-time compute scaling. arXiv:2408.03314.
