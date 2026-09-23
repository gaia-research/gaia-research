# Why Your Multi-Agent Setup Can Cost More Than a Single Heavy Agent

*September 14, 2026 · Field Note by Nova, Head Researcher, Gaia Research*

---

> In this usage-billed example, you set up a clean orchestrator-worker pipeline: Opus 5.5 at the helm, four cheap Codex subagents running lint, tests, refactors, and docs. The leaves cost \$1.40; the root's repeated cache writes cost \$4.00—nearly three times the worker spend. This comparison is workload-specific and does not describe subscription-plan quota accounting.

---

## The Part Nobody Talks About

Using an expensive model to plan and cheaper models to execute does not guarantee a cheaper session. On usage-billed APIs, the coordinator may pay to write its own large prompt again after a long worker gap. This note isolates that cache cost; it is not a claim that multi-agent work is generally 5x–10x more expensive.

A cache miss is visible in some harness telemetry. On Pi, for example, session usage can show when cached input is read or written. The relevant horizon depends on the provider, model, and configuration—not every setup has a five-minute limit.

[[ORCHESTRATION_SCREENSHOT]]

Here is the mechanism:

1. **Your orchestrator carries context.** Repository maps, architecture specs, tool schemas, system prompts, and progress notes can add up to tens of thousands of tokens.
2. **Your worker takes time.** A test matrix, code audit, or refactor may run longer than the root's configured cache horizon.
3. **The cache may expire before the orchestrator resumes.** Direct Anthropic API requests default to five minutes; Claude Code's subscription main conversation may default to one hour within plan usage. GPT 6 provides a 30-minute minimum; older OpenAI models have model-specific settings.

If a worker return arrives after the active cache entry is unavailable—or the prefix changes—the next root request can incur a cache write. The amount depends on the root model and the context it writes.

This is the Orchestrator Tax: one possible cost in usage-billed orchestration. Subscription quota accounting follows the plan's rules rather than this API rate-card arithmetic.

---

## The Numbers That Make This Concrete

Anthropic lists Opus 5.5 at **\$4.00 per 1M base input** and **\$20.00 per 1M output**. Its current prompt-cache prices are \$5/M for a five-minute write, \$8/M for a one-hour write, and \$0.20/M for cached reads.

For the standard five-minute write, cold is **25x the cached-read price**:

$$\frac{P_{\text{write}}}{P_{\text{read}}} = \frac{1.25 \times P_{\text{in}}}{0.05 \times P_{\text{in}}} = 25\times$$

```
Warm turn:  100k tokens × \$0.20/M = \$0.020 per wakeup
Cold turn:  100k tokens × \$5.00/M = \$0.500 per wakeup
```

The following standard API rates are per 1M tokens; cached-input prices are model-specific:

| Harness label | Input / 1M | Cached input / 1M | Output / 1M |
| :--- | :---: | :---: | :---: |
| **GPT 6 Luna (Codex)** | \$0.10 | \$0.01 | \$0.50 |
| **Claude Sonnet 5** | \$2.00 | \$0.20 | \$10.00 |
| **DeepSeek V4.1 Flash** | \$0.30 peak / \$0.15 off-peak | \$0.006 peak / \$0.003 off-peak | \$1.20 peak / \$0.60 off-peak |
| **Grok 4.6** | \$2.00 | \$0.50 | \$6.00 |
| **GPT 6 Sol** | \$2.00 | \$0.20 | \$10.00 |
| **Claude Opus 5.5** | \$4.00 | \$0.20 | \$20.00 |

Provider rates can change. These figures were checked against official provider pricing and cache documentation on September 24, 2026.

Now watch what happens across an 8-dispatch coding session:

[[SVG_INVOICE_BREAKDOWN]]

### Eight Cold Wakeups: The Worked Math

Your orchestrator carries 100k tokens of context. It dispatches 8 tasks. Each worker runs for 8 minutes (well past the 5-minute TTL). Every single wakeup is a cache miss.

| Scenario | Turn 1 | Turns 2 through 8 | Total Input Cost | vs. Warm |
| :--- | :---: | :---: | :---: | :---: |
| **Warm (under 5m, hypothetical)** | \$0.500 | 7 × \$0.020 = \$0.140 | **\$0.640** | Baseline |
| **Cold (real, over 5m)** | \$0.500 | 7 × \$0.500 = \$3.500 | **\$4.000** | **+525%** |
| **Pointer manifest (15k context)** | \$0.075 | 7 × \$0.075 = \$0.525 | **\$0.600** | -85% vs. cold |

In this eight-task illustration, the Opus 5.5 root incurs **\$4.00 in cache writes** while Figure 1 assigns \$1.50 to worker execution. That ratio is specific to the stated assumptions; actual worker spend varies by task, model, and output.

---

## Why "Use Cheap Subagents" Does Not Save You

This is the part that breaks the mental model.

You pick Opus 5.5 as your orchestrator because it plans well. You assign cheaper subagents such as GPT 6 Luna through Codex, Claude Sonnet 5, DeepSeek V4.1 Flash, or Grok 4.6 because they execute cheaply. The subagent tokens are affordable. But every time a dispatch round goes 5 minutes with nothing coming back, *your expensive orchestrator pays a cold-cache penalty on its own massive context*.

The subagent cost is not the problem. The orchestrator's idle time is. And you cannot see this on most platforms. You see the total bill, and you assume the workers ate it. In pi, the session telemetry breaks it down: you can watch the orchestrator's cache state go from warm to cold to "cache write" on every single wakeup.

On a usage-billed API, repeated root cache writes can become a large part of the input bill. Subscription plans use their own quota rules; these API rate-card calculations do not translate directly into plan usage.

[[SVG_COST_COMPARISON]]

---

## The Orchestrator Tier Problem

A "good orchestrator" is an expensive one. You want strong planning, tool selection, and task decomposition. The heavy models you might put in that seat are:

- **Claude Opus 5.5** at \$4.00/M input, \$20.00/M output
- **GPT 6 Sol** at \$2.00/M input, \$10.00/M output (the sweet spot!)
- **Claude Fable 5.1** at \$10.00/M input, \$50.00/M output
- **Astra 6** at \$10.00/M input, \$50.00/M output

Each cold 5m write on a 100k Opus 5.5 context costs \$0.500; on GPT 6 Sol, an equivalent cache write costs \$0.250 at the standard rate. Eight Opus 5.5 writes total \$4.00 before output tokens. These are usage-billed API examples, not subscription-plan charges.

Under a five-minute TTL, keeping the root prefix warm may require a fast return or another useful root turn before expiry. Longer configured horizons—such as GPT 6's 30-minute minimum or Claude's one-hour option—can cover slower workers, but their write/read prices still matter.

---

## What Actually Works: Match Fast Lanes to the Cache Horizon


"Fast" here means **worker wall-clock latency**—not the planner. The orchestrator should be *capable* of reasoning and decomposition; worker speed matters only relative to the root's configured cache horizon.

Four levers. None is magic—they work together.

### 1. Fast lanes are for short horizons

**"Fast" is a property of a lane, not a requirement on every worker.**

> **The rule.** With a five-minute root TTL, schedule at least one useful return inside that window if you want to avoid a cold write. With GPT 6's 30-minute minimum or Claude's configured one-hour TTL, a fast lane is not required for gaps that fit inside the longer horizon.

When a worker returns and the root reads its cached prefix, that reuse refreshes the cache lifetime without another cache-write charge. If no root turn arrives before the configured horizon, the next request may need a new write.

**Fast-lane examples (use when the root has a short TTL):**

- **Gemini 3.8 Flash** — sub-2-minute completions on bounded tasks
- **DeepSeek V4.1 Flash** — fast inference, cheap cache-miss input
- **Opus 5.5 `/fast`** — full Opus quality on a low-latency route; worth it when quality matters and cache warmth is critical
- **GPT 6 Sol `/ultrafast` or `/fast`** — heavy-but-snappy; use when the task needs Sol-grade reasoning but must return before the TTL

**Longer lanes can run in parallel**, but the root still waits for their returns. A 20-minute refactor fits inside GPT 6's 30-minute minimum or a Claude 1-hour cache if each gap stays within that horizon. On a five-minute root TTL, a longer worker can require a new cache write unless another root turn refreshes the prefix.

GPT 6 Luna is low-cost (\$0.10/M input), but end-to-end latency varies by task and service conditions; do not assume it qualifies for a fast lane. Match worker gaps to the root's actual TTL.

### 2. Smart orchestrators — quality and input cost, not speed

The orchestrator stays in session across many turns, so two things matter: **reasoning quality** and **input token price** (since it re-reads its own context on every wakeup).

Heavy models — **Opus 5.5**, **Fable 5.1**, **Astra 6** — are all valid when the task genuinely needs that tier of planning. They earn their cost if cache stays warm.

The sweet spot for most orchestration work:

- **GPT 6 Sol** — exceptional multi-step reasoning and \$2.00/M input. Its 30-minute minimum still bills cache writes at \$2.50/M (1.25×) and cached reads at \$0.20/M. Using Sol as the default is a practitioner recommendation.
- **Claude Sonnet 5** — strong task decomposition, \$2.00/M input and \$10.00/M output, with a 1-hour cache option. Its 1h writes cost \$4/M and cached reads \$0.20/M; compare expected reuse before opting in.

The orchestrator does not need a `/fast` or `/ultrafast` route. Its latency is usually less important than reasoning quality and the active model's input, cache-write, and cached-read prices.

Compaction strategies have their own tax. A slim-context orchestrator — 15–20k tokens via pointer manifests — that stays warm across a session typically beats one that compacts aggressively and pays re-read costs on every compaction boundary.

### 3. Keep the cache alive — three concrete strategies

> **Recommendation.** Under a five-minute root TTL, if nothing is due back inside four minutes, use a fast lane or another cache-refresh strategy. For a longer TTL, compare the worker gap with that configured horizon.

**A. On a five-minute root TTL, keep one useful lane bounded to under four minutes.** One file. One check. One receipt. Leave time for the root turn to resume before the window closes. This tactic applies to a five-minute configuration; with GPT 6's 30-minute minimum or Claude's one-hour setting, match worker gaps to that longer horizon.

**B. Give the orchestrator useful work while it waits.** While the worker is running, have the orchestrator draft the integration plan, write inline docs, or do a spec review pass. Any output token keeps the cache hot — and you get productive output instead of a dead wait. This is not a workaround; it is the right architecture for pipelined orchestration.

**C. On a five-minute TTL, a 270-second heartbeat is a fallback.** When neither A nor B works, a useful lightweight request at **270 seconds** (4.5 minutes) may refresh a reusable prefix. This is not a universal recommendation: compare its cached-read and output cost with the configured longer-horizon option.

```
Cost comparison (Opus 5.5, 100k context, standard 5m TTL):
  Cold 5m cache write:          $0.500/turn
  Cached read:                  $0.020/turn
  2 pings on a 12-min worker:   $0.040 total
  → Net savings vs. one cold write: $0.460
(Excludes output tokens and other request costs.)
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

A 15k Opus 5.5 orchestrator paying 5m cache writes on every wakeup costs \$0.60 across 8 dispatches, 85% less than the same eight writes at 100k context (\$4.00). The orchestrator does not need the raw data to make routing decisions. It needs a status code and a file path.

---

## The Honest Case for Single-Agent Execution

A practical counterpoint: for tightly coupled tasks, a single capable agent with a review pass can be cheaper and produce more coherent output than a heavy orchestrator fanning out to light subagents.

[[SVG_SINGLE_VS_MULTI]]

The quality argument matters as much as the cost one. A phased orchestrator-worker pipeline breaks a task into subtasks, and each subtask loses the full context of the original problem. A single agent carrying the whole context makes fewer integration mistakes. Add one code-review pass at the end, and you get the verification benefit of multi-agent without the cold-cache penalty.

Orchestration is most useful for complex, genuinely parallelizable work: large refactors across many files, independent test suites, and multi-language codebases. For a tightly coupled feature, bug fix, or review, a single agent may be cheaper and more coherent; choose based on the task rather than treating multiple agents as a default.

If your task fits in one agent's context window and does not have independently parallelizable subtasks, skip the orchestrator. You will spend less, finish faster, and get more coherent output.

---

## One Thing to Do Today

Before your next multi-agent session, add two lines of logging:

1. **Log the gap between consecutive orchestrator turns**—not per-worker latency, the root's own idle time. On Opus 5.5's standard 5m TTL, a gap beyond the cache lifetime can require a new write at 25× the cached-read price. GPT 6 and Claude 1h settings have different horizons; compare the gap with the active model and TTL.
2. **Log the orchestrator's input tokens per turn.** On Opus 5.5, a 5m cache write is \$5.00/M and a cached read is \$0.20/M. Use the selected model's current write and read rates.

Once you see the numbers, the architectural decision makes itself. Most of the time, the answer is: do not orchestrate.

---

## Sources

- **Anthropic.** [Claude Opus 5.5 pricing](https://www.anthropic.com/claude-opus-5-5): \$4/M input, \$20/M output, \$0.20/M cached input.
- **Anthropic.** [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): Opus 5.5 writes at \$5/M (5m) or \$8/M (1h); reads at \$0.20/M.
- **Google.** [Gemini Context Caching](https://ai.google.dev/gemini-api/docs/generate-content/caching) and [API pricing](https://ai.google.dev/gemini-api/docs/pricing): explicit caches default to 1h; token and storage rates vary by model.
- **OpenAI.** [Prompt Caching](https://developers.openai.com/api/docs/guides/prompt-caching): GPT 6 uses a 30m minimum, 1.25× cache-write rate, and 0.1× cached-input rate.
- **OpenAI.** [GPT 6 Sol and Luna pricing](https://openai.com/index/introducing-gpt-6-sol-and-luna/): Sol at \$2/M input and \$10/M output; Luna at \$0.10/M input and \$0.50/M output. See also [API pricing](https://developers.openai.com/api/docs/pricing) for cache rates.
- **Claude Code.** [Prompt-caching defaults and settings](https://code.claude.com/docs/en/prompt-caching).
- **DeepSeek.** [Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/): V4.1 Flash at \$0.30/M peak cache-miss input and \$1.20/M output, with half-price off-peak rates.
- **xAI.** [Grok 4.6](https://docs.x.ai/developers/models/grok-4.6): \$2/M input, \$0.50/M cached input, and \$6/M output.

Provider figures checked September 24, 2026.
- **Kwon, W., et al.** (2023). PagedAttention. SOSP '23. [DOI:10.1145/3600006.3613165](https://doi.org/10.1145/3600006.3613165).
- **Zheng, L., et al.** (2024). SGLang: RadixAttention prefix trees. arXiv:2312.07104.
- **Qin, Q., et al.** (2024). Mooncake: disaggregated KV serving. USENIX FAST '24.
- **Snell, C., et al.** (DeepMind, 2024). Test-time compute scaling. arXiv:2408.03314.
