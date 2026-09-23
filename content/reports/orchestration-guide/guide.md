# The Orchestration Guide
## How to run more than one agent without setting money on fire.

## Start here: the short version

A **cache horizon** is how long the coordinator's context stays warm while workers run.

1. **Don't orchestrate** unless the work splits into independent lanes that justify coordination; use the [Step 0 checklist](#step-0-first-decide-not-to-orchestrate).
2. **Match that warm window to worker wait times:** under 5 minutes, use the short window; for 5–25 minutes, use GPT 6's 30-minute floor; for 20–60 minutes, use Claude's 1-hour option or Gemini; beyond an hour, collect worker manifests and resume in a fresh session. See the [decision tree](#the-cache-horizon-decision-tree).
3. **Choose a fitting root and worker:** GPT 6 Sol coordinates mid-length work, with Luna as a slow, low-cost worker; see the [provider matrix](#the-provider-cache-horizon-matrix). For Claude, follow the [1-hour setup](#claude-configure-a-1-hour-root-cache) when expected reuse justifies the write premium.
4. **Keep worker returns small and the root setup stable:** save logs and diffs to disk; return a compact [pointer manifest](#step-5-make-workers-report-back-small-the-pointer-manifest)—a short receipt that points to the files.
5. **Measure the gaps:** track inter-turn time plus cache-read and cache-creation tokens with [gap telemetry](#step-6-look-at-the-bill-gap-telemetry). Treat model pairings and scheduling rules as practitioner hypotheses, not measured conclusions.

---

## Who this is for

You have used an AI coding agent. It worked. Then you read that you can run *several* agents at once — one "orchestrator" that plans and delegates, and a fleet of "workers" that execute in parallel — and you want that.

You do not need to have written a custom scheduler or distributed systems runtime. If you can describe a task in a prompt and coordinate agent tasks, you can follow this.

Vocabulary used throughout:

- **Orchestrator** (also: planner, lead, coordinator). The root agent holding the top-level session context, task decomposition, repository map, and lane tracking. **One per session.**
- **Worker** (also: subagent, leaf agent, lane). An agent dispatched to do one scoped job (write tests, refactor a module, search an API, run a build), emit a receipt, and terminate.
- **Cache Horizon** (also: retention window, TTL). The period of idle inactivity during which a provider guarantees (or probabilistically keeps) an orchestrator's pre-computed KV context warm before evicting it.

---

## The one thing you have to understand

Skip this and nothing else in the guide will make sense.

**Your orchestrator pays to reuse its own memory, and the available cache window depends on the provider, model, and configuration.**

Here is the arithmetic that breaks naive budgets. An orchestrator coordinates substantive work: it holds your repository layout, task requirements, active tickets, worker assignments, and linting rules. That context easily spans 100,000 tokens. Every single time the orchestrator wakes up to inspect a worker's return or dispatch the next task, the model provider must process that context.

Modern providers maintain a prefilled KV cache so that subsequent turns can reuse pre-computed attention states. On Claude Opus 5.5 (\$4.00 per million base input):
- A **warm cache read** costs **\$0.20 per million tokens** (0.05× base).
- A **5-minute cache write** costs **\$5.00 per million tokens** (1.25× base); a **1-hour cache write** costs **\$8.00 per million tokens** (2.0× base).

> **That is a 25× difference on the standard 5m cache (\$5.00 write vs \$0.20 read).** For a 100,000-token context on Opus 5.5, a warm turn costs \$0.020; an evicted cold 5m turn costs \$0.500 (or \$0.800 on a 1h write). Eight cold 5m writes cost \$4.00 before output tokens; the worker cost depends on the task and its output.

### The New Reality: The Clock Got Bigger

Many agent workflows have used a **5-minute cache window** as their working assumption. That still applies to some provider paths, but it is no longer a safe universal rule: workers may fit a 30-minute or 1-hour horizon depending on model and configuration.

That single five-minute assumption no longer fits the provider landscape:

1. **OpenAI GPT 6:** Provides at least **30 minutes of cache eligibility after the last write or reuse**. Writes are billed at 1.25× base input; cached reads cost 0.1×. Terra is superseded by Sol and Luna.
2. **Anthropic Claude:** The API offers an explicit **1-hour cache option** (`ttl: '1h'`) beside its standard 5-minute TTL. Claude Code's defaults vary by billing mode and request bucket.
3. **Google Gemini:** Implicit caching is enabled by default on Gemini 2.5 and newer models. Explicit `CachedContent` objects default to a 1-hour TTL; cached-token and storage prices depend on the model.
4. **Earlier OpenAI API models:** Retention controls and cache prices vary by model. Some support 24-hour retention; GPT 6 does not expose that setting. `prompt_cache_key` is not needed for GPT 6 cache routing.

**The orchestrator tax didn't disappear. The clock got bigger.**

If you understand the new cache horizons, you can drastically reduce cold wakeups without resorting to brittle hacks. If you ignore them, you will pay double the write price for caches you abandon, or let slow models trigger cold wakeups that wipe out all your savings.

> ### The North-Star Rule
> **Match the root cache horizon to the wall-clock distribution of your workers.**

---

## The Provider Cache-Horizon Matrix

Different providers and model families approach prompt caching through fundamentally distinct economic and architectural primitives. To design an affordable orchestration swarm, you must know what each provider actually promises.

> **Evidence boundary:** Provider cache mechanics and published rates are sourced. Model pairings and worker-duration bands are practitioner hypotheses; savings figures are illustrative rate-card arithmetic, not controlled benchmark results.

### The Four-Tier Capability Distinction

Before looking at the matrix, understand where caching controls live. Confusion happens when developers conflate four distinct layers:

1. **Provider API Capability:** What the raw inference endpoint supports (e.g., Anthropic's `cache_control`, Google's `CachedContent`, or OpenAI Responses API cache options).
2. **Model Support:** Which checkpoints support each feature and price (e.g., GPT 6 uses a 30-minute minimum and 1.25× write rate; earlier OpenAI models and Claude models have different retention and cache prices).
3. **Product / CLI Exposure:** How first-party tools expose those controls (e.g., Claude Code uses `promptCacheTtl` in settings or environment variables, not a `--prompt-cache-ttl` CLI flag). An API capability does not imply every CLI or harness exposes it.
4. **Harness Exposure:** How agent harnesses (Pi, Herdr, Codex CLI, custom scripts) configure cache headers on orchestrator vs. worker sessions.

### The Matrix

| Provider / Model Family | Cache Mechanism | Default / Min Horizon | Longest Documented Horizon | Write Premium / Storage Cost Model | Configurable in API? | Configurable in Harness? | Best Orchestration Fit |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **Anthropic Claude** *(Opus 5.5, Sonnet 5)* | Automatic or explicit `cache_control` breakpoints | API default: 5m; Claude Code main-conversation defaults vary by billing mode | 1h (`ttl: '1h'`) | **Opus 5.5** (\$4 in / \$20 out): 5m write \$5/M; 1h write \$8/M; read \$0.20/M. **Sonnet 5** (\$2 in / \$10 out): 5m write \$2.50/M; 1h write \$4/M; read \$0.20/M. | Yes (`ttl`) | Yes in Claude Code v2.1.242+ settings / env vars; harness-dependent elsewhere | Root sessions with 5–55m gaps when reuse justifies the 1h write |
| **OpenAI GPT 6** *(Sol, Luna)* | Automatic or explicit breakpoints; 1,024-token visible-prefix minimum | At least 30m after write or reuse; API default is `30m` | OpenAI may retain longer; no GPT 6 24h setting | **Sol** (\$2 in / \$10 out): write \$2.50/M, read \$0.20/M. **Luna** (\$0.10 in / \$0.50 out): write \$0.125/M, read \$0.01/M. Both: 1.25× write, 0.1× read. | Yes (Responses API `prompt_cache_options`) | Depends on the API integration; do not assume every CLI exposes these options | Worker gaps comfortably below 30m; Sol root / Luna workers is a practitioner pairing |
| **Earlier OpenAI API models** *(pre-GPT-5.6)* | Model-specific implicit caching, `prompt_cache_retention`; stable `prompt_cache_key` can aid routing | Model- and organization-specific; `in_memory` is typically 5–10m inactive | Up to 24h on listed models | Model-specific read prices; some earlier models have no added write charge. Check the exact model rate card. | Yes, where supported | Varies by model and harness | Use only after checking the selected model's retention and pricing |
| **Google Gemini** *(Gemini 2.5+)* | Implicit caching is on by default; explicit `CachedContent` is also available | Implicit: provider-managed; explicit: 1h default | Explicit TTL is configurable; limits and pricing are model-specific | Cached-input tokens plus storage rent for the TTL; both prices vary by model | Yes (REST / SDK) | Only when the harness integrates the Gemini API | Stable shared context when the model's cache and storage costs fit the workload |
| **xAI Grok** *(Grok 4.6)* | Provider-managed cached input | No guaranteed cache horizon established from the linked model pricing page | Not documented in the linked rate card | \$2/M input, \$0.50/M cached input, \$6/M output | Provider-managed | Depends on provider integration | Treat cache reuse as opportunistic unless a current TTL contract is documented |

---

## The Cache-Horizon Decision Tree

When building a multi-agent system, do not guess how long tasks will take. Categorize your worker tasks by their **wall-clock duration band**, then align your orchestrator's cache configuration to that band.

```
                  What is the wall-clock duration of your workers?
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
     < 5 Minutes                   5 – 25 Minutes                  20 – 60 Minutes
  (Fast Lanes / Tight)         (Asynchronous Sweet Spot)       (Deep Work / Heavy Builds)
         │                               │                               │
         ▼                               ▼                               ▼
  Standard 5m TTL                 GPT 6 Family                    Claude 1h TTL
  (or implicit LRU)             (30m minimum)                  (or Gemini CachedContent)
  • 1.25× write rate              • 1.25× write / 0.1× read       • 2.0× write surcharge
  • Rapid interactive loops       • Sol default ($2/M in)         • Break-even on Turn 2
  • Match gaps to TTL              • Luna workers ($0.10/M in)     • Subagents stay on 5m
                                  • No keepalives under 30m
                                                                         │
                                                                         ▼
                                                                   > 60 Minutes
                                                               (Multi-Hour Epics)
                                                                         │
                                                                         ▼
                                                                Barrier Aggregation &
                                                                  Pointer Manifests
                                                                • Fresh continuation
                                                                • <20k context resets
```

### Band 1: Under 5 Minutes (Interactive Loops & Fast Lanes)
- **Workload:** Fast code lookups, syntax verifications, schema checks, single-function unit test runs.
- **Cache Strategy:** Standard **5-minute TTL** on the Anthropic API, or the active model's provider-managed cache. GPT 6, for example, has a 30-minute minimum; do not infer another model's horizon from the provider name alone.
- **Rule:** Do *not* enable 1-hour extended caching. Because consecutive turns return within 3–4 minutes, the sliding 5-minute window resets for free. Paying Anthropic's 2.0× write surcharge here is completely wasted money.

### Band 2: 5 to 25 Minutes (The Asynchronous Sweet Spot)
- **Workload:** Multi-file refactors, standard test suite passes, documentation generation, competitive code exploration.
- **Cache Strategy:** **OpenAI GPT 6 Family (Sol orchestrator, Luna workers; Terra is superseded)**.
- **Why this works:** GPT 6 provides at least **30 minutes of cache eligibility after each write or reuse**, so you need not manufacture sub-4-minute worker tasks for gaps inside that window. GPT 6 Luna costs \$0.10/M input and \$0.50/M output; its 15–25-minute worker duration is a practitioner observation, not a service guarantee. GPT 6 Sol costs \$2/M input and \$10/M output. Both models bill cache writes at 1.25× base input (Sol \$2.50/M, Luna \$0.125/M); cached reads cost 0.1× (Sol \$0.20/M, Luna \$0.01/M). Choosing Sol as root and Luna for workers remains a practitioner recommendation.

### Band 3: 20 to 60 Minutes (Deep Work & Heavy Subagents)
- **Workload:** Full end-to-end integration test runs, compiler builds, deep vulnerability scanning, multi-subagent swarms.
- **Cache Strategy:** **Anthropic Claude with `ttl: '1h'`** on the root orchestrator, or **Google Gemini `CachedContent`**.
- **Economics:** Because worker durations comfortably exceed 5 minutes, every wakeup under a 5-minute configuration would be a 100% cold prefill eviction. As proved below, a single pause greater than 5 minutes completely amortizes Claude's 2.0× write surcharge on Turn 2.

### Band 4: Over 60 Minutes (Multi-Hour Epics & Autonomous Shifts)
- **Workload:** Whole-codebase migrations, large matrix test executions, multi-hour autonomous worker shifts.
- **Cache Strategy:** **Barrier Aggregation & Pointer Manifest Continuation**.
- **Rule:** Do not attempt to hold a warm GPU KV cache idle for 3 hours while waiting for a single monolithic worker. Instead:
  1. Have long workers execute detached under autonomous supervision.
  2. Workers deposit results into disk manifests.
  3. When all workers clear the barrier, spin up a **fresh orchestrator session** initialized from a compact pointer manifest (<15,000 tokens).

---

## Claude: Configure a 1-Hour Root Cache

When coordinating asynchronous swarms with Anthropic Claude (Opus 5.5 or Sonnet 5), configuring an extended 1-hour cache on your root orchestrator turns multi-agent economics right-side up.

### The Core Economics: 5-Minute vs. 1-Hour TTL

| Metric | Standard 5-Minute TTL | Extended 1-Hour TTL (`ttl: '1h'`) |
| :--- | :---: | :---: |
| **Initial Cache Write Surcharge** | **1.25×** base input tokens | **2.00×** base input tokens |
| **Subsequent Cache Read (Hit)** | Model-specific: Sonnet 5 **0.10×**, Opus 5.5 **0.05×** | Model-specific: Sonnet 5 **0.10×**, Opus 5.5 **0.05×** |
| **Retention Window** | 5 minutes (sliding from last turn) | 60 minutes (sliding from last turn) |
| **Write Multiplier Premium** | Baseline | +60% over 5m write rate |

At first glance, paying $2.00\times P_{\text{in}}$ to write a cache sounds steep. But look at the break-even mathematics.

### The Break-Even Math

Let $P_{\text{in}}$ be base input token price and $L$ be context length (e.g., 100,000 tokens = $0.1\text{M}$). The examples below use Claude Sonnet 5's 0.10× cached-read price; Claude Opus 5.5 reads at 0.05×, so its break-even differs.

#### Case 1: The Single Pause ($>5$ Minutes)
Suppose your orchestrator initializes Turn 1, dispatches a task that takes 8 minutes, and wakes up on Turn 2.
- **Under 5-Minute TTL:**
  - Turn 1 write: $1.25 \times P_{\text{in}} \times L$
  - Minute 5: Cache expires.
  - Turn 2 cold prefill: $1.25 \times P_{\text{in}} \times L$
  - Total Cost: $1.25 + 1.25 = \mathbf{2.50 \times P_{\text{in}} \times L}$
- **Under 1-Hour TTL:**
  - Turn 1 write: $2.00 \times P_{\text{in}} \times L$
  - Turn 2 warm hit: $0.10 \times P_{\text{in}} \times L$
  - Total Cost: $2.00 + 0.10 = \mathbf{2.10 \times P_{\text{in}} \times L}$

$$\text{Savings on Turn 2} = \frac{2.50 - 2.10}{2.50} = \mathbf{16.0\% \text{ net savings}}$$

> **The Single-Pause Break-Even:** Under this rate-card model, a single pause $>5$ minutes during a 1-hour session makes the 1-hour cache cheaper on Turn 2 than two cold 5-minute writes ($2.10\times$ vs $2.50\times P_{\text{in}}$). You do not need dozens of turns. Avoiding a single cold eviction amortizes the 2× write surcharge immediately.

#### Case 2: The 8-Turn Orchestration Swarm (Illustrative Model)
Consider an illustrative 8-turn session: an orchestrator holding 100,000 tokens on **Claude Sonnet 5** ($P_{\text{in}} = \$2.00/\text{M}$). Turn 1 is the initial prompt and task dispatch. Turns 2 through 8 are seven worker returns arriving after 7.5-minute worker gaps (52.5 minutes total flight duration, comfortably within the 60-minute window).

```
Timeline (8 turns, 7 gaps @ 7.5m = 52.5 minutes):
Turn 1 ───[7.5m worker]───► Turn 2 ───[7.5m worker]───► Turn 3 ───...───► Turn 8
```

- **Under 5-Minute TTL (Default):**
  Every worker return arrives after the 5-minute timer. The orchestrator gets **0 cache hits**. It pays a cold prefill write on every single turn (8 cold prefill writes @ 1.25× base rate):
  $$\text{Cost} = 8 \times (1.25 \times \$2.00 \times 0.1\text{M}) = 8 \times \$0.250 = \mathbf{\$2.000}$$
- **Under 1-Hour TTL:**
  Turn 1 writes the 1-hour cache ($2.00\times$). Turns 2 through 8 (7 returns) hit the warm cache ($0.10\times$):
  $$\text{Cost} = (2.00 \times \$2.00 \times 0.1\text{M}) + 7 \times (0.10 \times \$2.00 \times 0.1\text{M})$$
  $$\text{Cost} = \$0.400 + 7 \times \$0.020 = \$0.400 + \$0.140 = \mathbf{\$0.540}$$

> **Result:** Under this rate-card model, 1-hour TTL costs **\$0.540 vs \$2.000** — **73% less prefill spend** across the 8 turns. The comparison excludes output tokens and any changing suffix content; those costs depend on the workload.

---

### Verified Anthropic API Syntax

To enable 1-hour caching at the raw API or SDK layer, attach `cache_control: {"type": "ephemeral", "ttl": "1h"}` to the stable context boundary (system prompt or tools array).

```python
import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# Schematic context definitions (typically 50k-120k tokens in production):
STABLE_REPO_SPEC = "SYSTEM SPEC: Complete architecture, rules, schemas..."
ORCHESTRATION_TOOLS = [
    {
        "name": "dispatch_lane",
        "description": "Dispatch an isolated worker subagent",
        "input_schema": {
            "type": "object",
            "properties": {
                "lane_id": {"type": "string"},
                "command": {"type": "string"},
            },
            "required": ["lane_id", "command"],
        },
    }
]

# 1. Initialize root orchestrator with explicit 1-hour TTL on the stable prefix
# Note: For production caching, stable prefixes must meet minimum token thresholds
# (1,024 tokens for Sonnet 5 / Opus 5.5; 2,048 tokens for Haiku).
response = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=2048,
    system=[
        {
            "type": "text",
            "text": "You are the root orchestrator managing a codebase refactor...\n" + STABLE_REPO_SPEC,
            "cache_control": {"type": "ephemeral", "ttl": "1h"}  # <-- Explicit 1-hour horizon breakpoint
        }
    ],
    tools=ORCHESTRATION_TOOLS,
    messages=[
        {"role": "user", "content": "Begin orchestration. Plan Phase 1 lanes."}
    ],
)

# Inspect usage telemetry:
usage = response.usage
print(f"Cache Creation Tokens (1h): {usage.cache_creation_input_tokens}")
print(f"Cache Read Tokens:          {usage.cache_read_input_tokens}")
print(f"Regular Input Tokens:       {usage.input_tokens}")

# 2. Worker executes detached for 18 minutes...
# 3. Worker reports back. Turn 2 reuses the warm 1-hour cache:
turn_2_response = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=2048,
    system=[
        {
            "type": "text",
            "text": "You are the root orchestrator managing a codebase refactor...\n" + STABLE_REPO_SPEC,
            "cache_control": {"type": "ephemeral", "ttl": "1h"}
        }
    ],
    tools=ORCHESTRATION_TOOLS,
    messages=[
        {"role": "user", "content": "Begin orchestration. Plan Phase 1 lanes."},
        {"role": "assistant", "content": response.content},
        {"role": "user", "content": "Worker Lane 1 finished: /tmp/results/auth-tests.json"}
    ],
)

# Telemetry on Turn 2 confirms:
# Sonnet 5 cached reads bill at 0.10x base input (Opus 5.5: 0.05x).
# cache_creation_input_tokens is 0
# input_tokens accounts only for the new receipt delta
```

---

### Claude Code & CLI Harness Configuration

In the Claude Code CLI (v2.1.242+) and related harnesses, developers often hunt for command-line flags that do not exist.

> ⚠️ **Configuration Reality:** There is **NO `--prompt-cache-ttl=1h` CLI flag** in Claude Code. Do not attempt to pass it to the binary.

Configure 1-hour caching through `settings.json` or system environment variables:

#### In `~/.claude/settings.json` (or project `.claude/settings.json`):
```json
{
  "promptCacheTtl": "1h",
  "subagentPromptCacheTtl": "5m"
}
```

#### Via Environment Variables:
```bash
# Set 1-hour cache for the root session
export CLAUDE_CODE_PROMPT_CACHE_TTL="1h"

# Keep leaf subagents on cheap 5-minute sliding cache
export CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL="5m"
```

#### Verifying Active Cache Telemetry in Claude Code
To confirm that 1-hour caching is active in your terminal, run a test prompt with JSON output:
```bash
claude -p "ping" --output-format json
```
Check the emitted usage block: if `usage.cache_creation.ephemeral_1h_input_tokens` is populated, the 1-hour cache lease was successfully written.

#### Subscription Defaults vs. Direct API Billing
- **Claude Pro, Team, and Max Subscriptions:** Within included plan usage, Claude Code defaults the main conversation to a 1-hour cache and most other requests, including subagents, to 5 minutes. The plan's quota accounting is separate from the API rate-card examples here. Once usage credits apply, the main conversation defaults back to 5 minutes unless you choose the TTL yourself.
- **Direct API Keys & Bedrock / Vertex / GCP / Headless CI:** Default to **5 minutes** unless explicitly configured with `promptCacheTtl: "1h"` or the `CLAUDE_CODE_PROMPT_CACHE_TTL="1h"` environment variable. Headless CI runs and automated scripts using API keys must inject the environment variable explicitly at process startup.

#### What Alters or Invalidates the Cached Prefix?
A longer TTL only protects you from **time elapsed**. It does not protect against **prefix mutation**. Any of the following will alter the prefix hash:
- **Switching Models:** Changing models (e.g. from Opus 5.5 to Sonnet 5) targets a different KV cache pool.
- **Reasoning Effort Adjustments:** Modifying `/effort` modifies configuration tokens in the prefix on models that support it.
- **Dynamic MCP Tool Changes:** Adding, removing, or re-ordering MCP servers changes the tool schema block within the prefix.
- **Manual `/compact` Operations:** Summarization rebuilds the conversation layer, writing a new summary context.

---

### What Belongs in the 1-Hour Cache Prefix?

To extract maximum ROI from the 2.0× write surcharge, structure your prompt into **Static Anchor** vs. **Volatile Dynamic** zones:

```
┌─────────────────────────────────────────────────────────────┐
│ 1-HOUR CACHED ROOT PREFIX (Warm for 60 Minutes)            │
│ 1. System Prompt & Orchestration Instructions               │
│ 2. Tool Definitions & Execution Schemas                     │
│ 3. Pinned Repository Tree & Architecture Specifications     │
│ 4. Coding Standards, Guidelines, & Test Conventions         │
│ 5. High-Level Master Plan (Lanes, Objectives, Contracts)    │
├─────────────────────────────────────────────────────────────┤
│ ◄── Breakpoint: cache_control {"type": "ephemeral", "ttl": "1h"}
├─────────────────────────────────────────────────────────────┤
│ VOLATILE DYNAMIC SUFFIX (Appended Turn-by-Turn)             │
│ • Worker dispatch events                                    │
│ • Worker receipt JSONs (< 500 tokens each)                  │
│ • Active turn decisions & next-step instructions            │
└─────────────────────────────────────────────────────────────┘
```

Everything above the breakpoint stays warm for 60 minutes. As workers report back, newly appended receipts incur standard input token pricing, avoiding the 2.0× write surcharge.

---

### The 8-Step Orchestration Workflow

When operating an orchestration swarm with 1-hour caching, follow this operational sequence:

1. **Pre-flight Spec Freezing:** Lock the repo context, tool set, and instructions before starting. Never mutate tools or system prompts mid-flight.
2. **Anchor Write:** Launch the orchestrator with `ttl: '1h'` on the stable prefix. Pay the 2.0× write fee once on Turn 1.
3. **Partitioned Delegation:** Break work into self-contained lanes producing output files on disk.
4. **Subagent Scoping:** Dispatch workers configured with standard **5-minute sliding TTL** (subagents rarely benefit from 1-hour TTL unless they are themselves nested sub-orchestrators).
5. **Asynchronous Sleep:** Let workers run for 5 to 45 minutes without artificial heartbeat pings. The orchestrator rests idle while provider KV retention remains active.
6. **Receipt Ingestion:** Workers return concise 4-line JSON receipts rather than full stdout dumps.
7. **Warm Wakeup & Telemetry Inspection:** The orchestrator wakes up and reads the stable prefix at the model's cached-read rate (0.10× for Sonnet 5; 0.05× for Opus 5.5). Verify cache reads in the usage metadata; a new cache write may be expected when the conversation grows.
8. **Barrier Closeout & >60m Fallback:** Once all lanes complete, summarize deliverables and shut down before the 60-minute window closes. If an upcoming phase is predicted to idle for $>60$ minutes, commit state to disk and exit (or trigger `/compact`) rather than drifting into a cold expiration.

---

### When NOT to Use 1-Hour TTL

1. **Tight Interactive Loops (<5m):** If you or your agents interact every 45 seconds, the 5m cache never expires. Paying 2.0× write instead of 1.25× is pure waste.
2. **Ephemeral Leaf Subagents:** Leaf workers execute quick focused scripts. In almost all cases, keep them on standard 5-minute TTL.
3. **High-Mutation Contexts:** If your orchestrator repeatedly edits its own system prompt or tool schemas, the prefix changes, discarding the cache.
4. **Gaps Exceeding 60 Minutes:** If workers take 90 minutes, a 1-hour cache will expire anyway, costing you an expensive 2.0× write on eviction. Use Barrier Aggregation instead.

> ⚠️ **Caution Box: The 2.0× Write Surcharge**
> Extended 1-hour caching is an investment that pays off only if you hit the warm cache on subsequent turns. If you write a 1-hour cache and then terminate the session or invalidate the prefix, you paid an unnecessary 60% premium over standard 5m caching. See research issues [#247](https://github.com/gaia-research/gaia-research/issues/247), [#251](https://github.com/gaia-research/gaia-research/issues/251), and [#256](https://github.com/gaia-research/gaia-research/issues/256).

---

## Step 0 — First, decide not to orchestrate

**This is the most valuable step in the guide, and it is the one everyone skips.**

Most coding tasks should be given to one capable agent, end to end. Not because orchestration is difficult to configure, but because partitioning a cohesive task introduces coordination overhead: worker agents lose global context, assumptions drift, and you pay orchestrator overhead for inferior code.

Run this updated pre-flight checklist. **Orchestrate only if you can honestly say yes to all four:**

| # | Question | If no… |
| :--- | :--- | :--- |
| 1 | Does the work genuinely split into disjoint pieces that do not depend on each other? | Use one agent. |
| 2 | Is the total context too large to fit in a single agent's window without degraded reasoning? | Use one agent. |
| 3 | Would you parallelize these across separate engineers if human developers were doing it? | Use one agent. |
| 4 | **Does your expected worker duration match your root cache horizon?** *(On GPT 6 30m or Claude 1h, will workers return inside those windows? On 5m default TTL, can at least one finish under 4m?)* | Align horizons first — see Step 3. |

**Good candidates:** "audit 14 API routes for missing RBAC checks," "generate unit tests for 8 independent utility libraries," "translate documentation into 5 languages."

**Bad candidates — do these with one agent:** "build user authentication," "refactor the payment engine," "fix this flaky WebSocket race condition." These sound complex, but they are architecturally unified.

---

## Step 1 — Pick your orchestrator: smart, not fast

The instinct is to put your fastest model in charge. That is backwards.

**Your orchestrator's speed is often less important than its reasoning and input economics.** In a multi-agent session, it may spend substantial time waiting for workers; the share depends on the task. What matters is:

1. **Reasoning and decomposition power:** Bad architectural routing ruins everything downstream.
2. **Input and cache economics:** It re-evaluates context on every turn. Input pricing determines your bill.

| Tier | Models | When to use it |
| :--- | :--- | :--- |
| **Orchestrator of Choice (Practitioner Default)** ⭐ | **GPT 6 Sol** | Strong multi-step reasoning at **\$2.00 / 1M input** and **\$10.00 / 1M output**. GPT 6's 30m minimum can fit mid-length worker gaps; cached reads cost **\$0.20/M** and cache writes **\$2.50/M** (1.25× input). Choosing Sol as the default is a practitioner judgment, not a benchmark result. |
| **Claude Balanced** | **Claude Sonnet 5** | **\$2.00 / 1M input**, **\$10.00 / 1M output**. Cache reads are **\$0.20/M**; 5m writes are **\$2.50/M** and 1h writes **\$4/M**. Use `ttl: '1h'` when expected reuse justifies the higher first write. |
| **Heavy Architectural** | **Claude Opus 5.5** | **\$4.00 / 1M input**, **\$20.00 / 1M output**. Cache reads are **\$0.20/M**; 5m writes are **\$5/M** and 1h writes **\$8/M**. Whether its reasoning quality justifies the price depends on the task. |
| **Deliberate Worker / Budget Orchestrator** | **GPT 6 Luna** | **\$0.10 / 1M input**, **\$0.50 / 1M output**, **\$0.01/M cached input**, and **\$0.125/M cache writes**. Primarily a low-cost worker; suitability as an orchestrator is a task-specific judgment. |
| **Never** | Low-reasoning models chosen solely for speed | The orchestrator is idle by design. Paying for rapid token throughput at the expense of reasoning is a structural mistake. |

---

## Step 2 — Cut the work into lanes

A **lane** is one worker performing one bounded job. Define them cleanly before dispatching:

```
LANE 1  →  Audit src/auth/*.ts for session token leaks
LANE 2  →  Write unit tests for src/billing/*.ts
LANE 3  →  Verify OpenAPI documentation schemas against routes
LANE 4  →  Execute TypeScript typecheck and compile error manifest
```

Two strict lane rules:

**Rule 1 — Zero Inter-Lane Dependencies.** If Lane 2 cannot start until Lane 1 finishes, they are not two parallel lanes. They are a sequential chain. If you find yourself passing worker outputs between workers, collapse them into a single agent.

**Rule 2 — Workers Emit Receipts, Not Dumps.** Workers deposit their exhaustive output on disk and send back a compact manifest (see Step 5).

---

## Step 3 — Match your cache horizon to worker duration (and when to use fast lanes)

In earlier iterations of this guide, our primary recommendation was the **Fast Lane Rule**: force at least one worker to report back within 4 minutes to artificially keep a 5-minute cache alive.

With modern provider cache horizons, that rule evolves:

> ### The Modern Rule
> **Fast lanes are a provider-agnostic tactic for 5-minute horizons, not a universal mandate for 30-minute or 1-hour horizons.**

### When You Have a 30-Minute or 1-Hour Horizon
If your orchestrator runs on **GPT 6 Sol (30m minimum)** or **Claude with `ttl: '1h'`**, you do *not* need to manufacture artificial 3-minute sub-tasks for gaps inside those horizons.
- GPT 6 Luna costs \$0.10/M input and \$0.50/M output; a 15–25-minute worker duration is a practitioner observation, not a service guarantee.
- Heavy test runners can take 25 minutes when the selected horizon supports it.
- Cached reads remain billable: GPT 6 Sol is \$0.20/M; Claude Sonnet 5 is \$0.20/M (90% below base), and Opus 5.5 is \$0.20/M (95% below base).

### When You Are Constrained to a 5-Minute Horizon
If your provider or harness only supports a standard 5-minute sliding TTL, the Fast Lane Rule remains essential:

**At least one lane must report back in under 4 minutes.** That lane wakes the orchestrator up before the 5-minute timer expires, touching memory at the cheap warm rate ($0.10\times$) and extending the timer for slower lanes.

- **Fast Lane Models:** Gemini 3.8 Flash, DeepSeek V4.1 Flash, Opus 5.5 `/fast`, GPT 6 Sol `/ultrafast`.
- **Manufactured Fast Lane:** If all work is slow, peel off an inspection task:
  ```
  LANE 1 (Fast, ~30s)  →  Count occurrences of deprecated API calls in src/
  LANE 2 (Slow, ~15m)  →  Refactor all deprecated calls across src/
  ```

---

## Step 4 — Never let the orchestrator sit idle past its cache horizon

When worker tasks threaten to exceed your orchestrator's cache horizon, you have three options to prevent cold evictions:

### Strategy A: Configure a Native Longer Horizon
If using Claude, set `ttl: '1h'` when expected reuse warrants its 2× write rate. GPT 6 offers a 30m minimum with 1.25× cache writes; use the Responses API cache controls and include that cost. GPT 6 does not require `prompt_cache_key` for cache routing.
- **Less orchestration overhead:** Avoids synthetic API traffic for gaps that fit the configured horizon.
- **Tradeoff:** The initial cache write still has a premium; compare expected reuse with the model's current rate card.

### Strategy B: Give the Orchestrator Productive In-Flight Work
While workers execute, have the orchestrator perform useful single-turn tasks:
- Draft the final PR description.
- Review recent commit diffs.
- Synthesize architectural documentation.
Every turn resets the cache timer while producing tangible project deliverables.

### Strategy C: Synthetic Keepalive Heartbeats vs. Native Long Horizons
If locked into a 5-minute window without native extended TTLs, an agent harness can issue a synthetic ping every **270 seconds** (4.5 minutes).

However, consider the economics:

```
Illustrative input-cache cost only on 100k context (Claude Sonnet 5, 8 turns across seven 15-minute worker gaps):
  • 5m Synthetic Heartbeats:
      - 3 pings per gap × 7 gaps = 21 pings
      - 21 pings × ($0.20/M × 0.1M) = $0.42 in cached reads
      - Initial write ($0.25) + 7 receipt reads ($0.14) = $0.81 total
  • Native 1-Hour TTL:
      - Turn 1 write (2.0× = $0.40) + 7 receipt reads ($0.14) = $0.54 total
  → Under these assumptions, native 1-hour TTL costs one-third less than synthetic 5-minute heartbeats.
  (For Opus 5.5, the same assumptions yield $1.06 with heartbeats vs. $0.94 with native 1h TTL, about 11% less).
```

*Note on sliding lease renewal:* Each legitimate warm cache hit touches the prefix and refreshes the 1-hour lease window forward from that turn, which is why a 1-hour TTL comfortably spans a 105-minute multi-turn session as long as each inter-turn gap stays under 60 minutes.

A native horizon also avoids depending on synthetic pings succeeding. GPT 6's minimum 30-minute eligibility can remove the need for keepalives when gaps fit, but cache writes still cost 1.25× base input (Sol: $2.50/M) and reads cost $0.20/M. No retention setting guarantees a hit if the model, prefix, routing, or timing changes.

---

## Step 5 — Make workers report back small: The Pointer Manifest

The most common way developers destroy their context budget is by allowing workers to return raw terminal logs, full compiler stack traces, or entire file diffs back to the orchestrator.

**Every token returned by a worker becomes permanent orchestrator context.** If an orchestrator ingests an 8,000-token test log on Turn 2, you re-read those 8,000 tokens on Turns 3 through 20.

### The Pointer Manifest Pattern

Workers must write exhaustive logs and artifacts to disk and report back with a structured **Pointer Manifest**:

```json
{
  "task": "unit-tests-billing",
  "status": "PASSED",
  "durationSec": 412,
  "artifacts": {
    "logFile": "/tmp/results/billing-test.log",
    "diffFile": "/tmp/results/billing-patch.diff"
  },
  "summary": "142 passed, 0 failed, 3 skipped. Coverage: 94.2% (+1.1%).",
  "requiresAction": false
}
```

The orchestrator inspects the summary. If and only if a task fails does it read the specific lines from `/tmp/results/billing-test.log`. Never paste 2,000 lines of terminal stdout directly into the conversation.

**Target: Keep your orchestrator under 15,000–20,000 tokens.**
At 15k context, even if each of eight turns writes the full prefix, the illustrative 5m cost is **\$0.60 instead of \$4.00** on Opus 5.5. On GPT 6 Sol, the same eight-write comparison is **\$0.30 instead of \$2.00**. These totals exclude output tokens and assume every turn writes the full prefix.

**Add this instruction to every worker prompt:**
```
Workers: Write all detailed logs, diffs, and diagnostics to /tmp/results/<task-id>.json.
Report back ONLY a JSON manifest: task, status, durationSec, artifacts, summary.
Never paste raw command stdout, logs, or large diffs into the conversation.
```

---

## Step 6 — Look at the bill: Gap Telemetry

You cannot optimize what you do not observe. Most agent platforms present a single aggregated dollar total at the end of a run, leading developers to incorrectly blame leaf workers for high costs.

Monitor two specific metrics in your harness telemetry:

1. **Orchestrator Idle Gaps ($\Delta t$):** Measure time between turns and compare it with the selected cache horizon. A gap beyond 5m, 30m, or 1h makes reuse less likely or ineligible under those settings; it does not by itself prove why a miss occurred.
2. **Cache Writes vs. Reads:** Inspect provider-specific response metadata:
   - **Anthropic:** `cache_read_input_tokens` reports reused tokens; `cache_creation_input_tokens` reports cache writes. A write on a later turn may be an expected new suffix, not necessarily a cache failure.
   - **OpenAI Responses API:** `usage.input_tokens_details.cached_tokens` reports reused tokens and `usage.input_tokens_details.cache_write_tokens` reports newly written tokens. See the model-specific cache controls and pricing.
   - **Claude Code:** `usage.cache_creation.ephemeral_1h_input_tokens` and `ephemeral_5m_input_tokens` distinguish cache-write TTLs in `claude -p --output-format json` output.

In the Pi harness, session telemetry displays real-time cache state transitions (`warm → cold → cache write`). If your harness lacks this, log timestamps and token categories per turn.

---

## A worked example, start to finish

**Task:** "Migrate database queries across 16 API endpoints to the new Prisma schema, with tests."

**Step 0 — Pre-flight Check:**
- 16 disjoint endpoints? Yes.
- Too large for one context? Yes (~120k tokens total).
- Independent workers? Yes.
- Worker duration fits cache horizon? Yes (Lanes will take 12–20 minutes; comfortably inside GPT 6 Sol's native 30m retention floor or Claude Sonnet 5 with `ttl: '1h'`).

**Step 1 — Orchestrator Selection:**
- For this illustration, choose **GPT 6 Sol** as root (\$2.00/M input, \$2.50/M cache write, \$0.20/M cached input; 30m minimum). Choose **GPT 6 Luna** workers (\$0.10/M input, \$0.50/M output, \$0.125/M write, \$0.01/M cached input). These are current standard API rates; the model pairing is a practitioner choice. Alternative: **Claude Sonnet 5** with `ttl: '1h'`.

**Step 2 — Lane Partitioning:**
```
LANE 1  →  Migrate & test endpoints 1–4  (src/api/users/*)
LANE 2  →  Migrate & test endpoints 5–8  (src/api/billing/*)
LANE 3  →  Migrate & test endpoints 9–12 (src/api/projects/*)
LANE 4  →  Migrate & test endpoints 13–16 (src/api/reports/*)
```

**Step 3 & 4 — Horizon Management:**
- Root orchestrator (GPT 6 Sol) registers repo specifications (native 30m retention floor).
- 4 GPT 6 Luna workers execute in parallel, grinding on refactoring and test execution for 15 to 20 minutes.
- Each worker gap is assumed to stay below Sol's 30-minute minimum, so the example sends no synthetic keepalive. The initial cache write still carries the 1.25× rate.

**Step 5 — Pointer Manifests:**
- Each worker deposits its patch and test output into `/tmp/results/lane-N.json`.
- Each worker returns a 5-line status JSON.

**Step 6 — Bill Verification:**
- Orchestrator context: 18,000 tokens (0.018M).
- Turn 1 Sol write: $2.50/M × 0.018M = **\$0.045**.
- Turns 2 through 5: 4 warm hits × (\$0.20/M × 0.018M) = **\$0.0144**.
- Sol orchestrator cache subtotal: **\$0.0594**.
- For a transparent worker estimate, assume each Luna worker uses 50k input and 10k output tokens: (0.05M × \$0.10/M) + (0.01M × \$0.50/M) = **\$0.01 each**, or \$0.04 for four.
- Illustrative subtotal for those tokens: **about \$0.10**, excluding any additional context, retries, tools, or other charges.
*(With Claude Sonnet 5 at 18k context, a 1h write is \$0.072; four reads at \$0.20/M total \$0.0144, for \$0.0864 root-cache spend. Worker costs are separate.)*

The orchestrator accounts for barely 25% of an already tiny spend on Sol/Luna (or 11% on Sonnet 5). The budget went directly into generating working code.

---

## Mistakes we keep making

| Mistake | What it actually costs | Fix |
| :--- | :--- | :--- |
| **Worker duration exceeds cache horizon** | Evicts cache on every turn; forces full-price cold re-reads | Configure Claude `ttl: '1h'`, use GPT 6 Sol 30m floor, or manufacture fast lanes ([#255](https://github.com/gaia-research/gaia-research/issues/255)) |
| **Enabling 1h TTL on leaf subagents** | Pays 2.0× write surcharge on ephemeral 45-second workers | Keep leaf subagents on standard 5m sliding cache ([#254](https://github.com/gaia-research/gaia-research/issues/254)) |
| **Workers paste full stdout / diffs** | Permanently pollutes orchestrator context for all subsequent turns | Enforce Pointer Manifests (< 200 tokens) writing to disk ([#242](https://github.com/gaia-research/gaia-research/issues/242)) |
| **Selecting fastest model as orchestrator** | Paying a throughput premium for an agent that sits idle | Select smart reasoning with low input pricing (GPT 6 Sol default, Sonnet 5; Terra is superseded) ([#245](https://github.com/gaia-research/gaia-research/issues/245)) |
| **Mutating tools or system prompts mid-session** | Modifies prefix tokens, forcing new cache creation | Keep system prompt and tool definitions stable throughout active phases ([#256](https://github.com/gaia-research/gaia-research/issues/256)) |
| **Running 5m synthetic heartbeats when a longer horizon fits** | Adds requests and failure modes; cost depends on cached-read prices and ping frequency | Compare pings against Claude's 1h option or GPT 6's 30m minimum, including each cache-write premium ([#247](https://github.com/gaia-research/gaia-research/issues/247)) |
| **Aggressive mid-session context compaction** | Compaction boundaries force new cache creation writes | Keep context slim (<20k) from the start so compaction is rarely needed ([#251](https://github.com/gaia-research/gaia-research/issues/251)) |

---

## Take this page and make it yours

The fastest way to internalize orchestration economics is to encode these rules directly into your agent harness or pre-flight prompt. Copy this markdown and ask your agent to build a custom orchestrator prompt:

```
Turn this orchestration guide into an executable system prompt for my coordinator:
1. Run the Step 0 checklist and refuse to orchestrate if a single agent suffices.
2. Check worker duration against provider cache horizons (5m, 30m, 1h).
3. If using OpenAI GPT 6, account for the 30m minimum, 1.25× write rate, and 0.1× cached-read rate; choose Sol or Luna based on the task and current rate card.
4. If using Claude, compare the 1.25× 5m and 2× 1h write rates before setting root `ttl: '1h'`; choose subagent TTLs separately.
5. Enforce disk-based pointer manifests on all worker responses.
6. Alert me if root orchestrator context exceeds 20,000 tokens.
```

Tailor it to your environment:
- If running on OpenAI GPT 6, the 30m minimum uses a 1.25× write rate and a 0.1× cached-read rate; `prompt_cache_key` is not needed for routing. Earlier OpenAI models have different, model-specific retention and cache controls.
- If your harness uses Claude Code, set `promptCacheTtl: "1h"` in `.claude/settings.json`.
- If building on Gemini, configure explicit `CachedContent` objects for static context.

---

## What is unverified here

Because this research is actively advancing across our benchmarking infrastructure, we distinguish verified telemetry from operational heuristics:

- **Verified Pricing & Rate Cards:** Prices were checked against official provider pages on September 24, 2026. Write and cached-read rates are model-specific; see the matrix and the linked cards rather than applying one multiplier to every model ([#247](https://github.com/gaia-research/gaia-research/issues/247)).
- **Documented Cache Mechanics:**
  - Anthropic [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) and Claude Code [Prompt Caching](https://code.claude.com/docs/en/prompt-caching)
  - OpenAI [API Pricing](https://developers.openai.com/api/docs/pricing) and [Prompt Caching](https://developers.openai.com/api/docs/guides/prompt-caching)
  - Google [Gemini Context Caching](https://ai.google.dev/gemini-api/docs/generate-content/caching) and [API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
  - DeepSeek [Pricing](https://api-docs.deepseek.com/quick_start/pricing/) and xAI [Grok 4.6 pricing](https://docs.x.ai/developers/models/grok-4.6)
  - Technical tracking issues: [#254](https://github.com/gaia-research/gaia-research/issues/254) and [#255](https://github.com/gaia-research/gaia-research/issues/255).
- **Mathematical Break-Even Models:** The 16% single-pause savings and 73% eight-turn savings are arithmetic under the stated Sonnet 5 rate-card assumptions, not measured session results ([#256](https://github.com/gaia-research/gaia-research/issues/256)).
- **Heuristic Advice:** Recommended model pairings (e.g. GPT 6 Sol for orchestration, Sonnet 5 with 1h TTL, Luna for slow-lane workers) and the 15k–20k token context target are practitioner rules of thumb, not controlled benchmark results.
- **Related Tracking Issues:** For deep-dive research notes and live benchmarks, track issues [#242](https://github.com/gaia-research/gaia-research/issues/242), [#245](https://github.com/gaia-research/gaia-research/issues/245), [#247](https://github.com/gaia-research/gaia-research/issues/247), [#251](https://github.com/gaia-research/gaia-research/issues/251), [#252](https://github.com/gaia-research/gaia-research/issues/252), [#254](https://github.com/gaia-research/gaia-research/issues/254), [#255](https://github.com/gaia-research/gaia-research/issues/255), and [#256](https://github.com/gaia-research/gaia-research/issues/256).
