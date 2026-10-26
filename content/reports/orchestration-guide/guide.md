# The Orchestration Guide
## What is the least expensive coordination architecture that reliably completes the work?

## Start here: the short version

Most multi-agent setups fail an elementary economic test: they spend more tokens coordinating work than completing it. Before spawning subagents, tuning prompt caches, or adopting a workflow runtime, ask one question:

> **What is the least expensive coordination architecture that reliably completes the work?**

1. **Default to a single agent ([Level A](#the-coordination-decision-framework)).** Do not orchestrate unless the task genuinely splits into independent lanes or exceeds a single context window without degraded recall.
2. **Optimize expected cost per verified outcome ($$C_{\text{verified}}$$), not raw token price ([The Economics of Agentic Work](#the-economics-of-agentic-work)).** Account for worker execution, coordination overhead, verification cost, and pass probability—or, on \$20/month subscriptions, verified tasks completed per quota window.
3. **Separate intelligent reasoning from deterministic coordination ([Reasoning vs. Coordination](#separate-reasoning-from-deterministic-coordination)).** Use models for ambiguity, synthesis, and code generation; use deterministic software (scripts, queues, git worktrees, test runners, state files) for scheduling, polling, retries, and context transport.
4. **Climb the coordination ladder only as far as needed ([Levels A–E](#the-coordination-decision-framework)).** Prefer existing skills and bounded subagents (**Level B**) or established workflow tools (**Level C**) before considering a thin economic scheduler (**Level D**). Keep humans in control (**Level E**) when authority, safety, or missing verification requires judgment.
5. **Match root cache horizons to worker duration and return pointer manifests ([Provider Matrix](#the-provider-cache-horizon-matrix), [Manifests & Telemetry](#task-envelopes-pointer-manifests-and-gap-telemetry)).** Align worker wait times with 5-minute, 30-minute (GPT 6), or 1-hour (Claude/Gemini) cache windows, keep leaf workers on short caches, and return compact disk pointers (<200 tokens) instead of raw stdout.
6. **Consent before configuration ([Agent Assessment Contract](#agent-consumable-assessment-contract)).** Reading or copying this guide never authorizes an agent to modify a repository, override model preferences, or install orchestration tooling without explicit owner approval.

---

## The Coordination Decision Framework

Every coordination layer adds latency, state transitions, and failure modes. Evaluate your workload against five progressive levels (**A through E**) and choose the **lowest level** that reliably passes verification:

| Level | Architecture | When It Fits | What to Use |
| :--- | :--- | :--- | :--- |
| **A. No Orchestration** *(Default)* | Single agent loop + domain skills + local verifiers | Coherent features, bug fixes, refactors with shared state, or work across tightly coupled files | One capable model in a single session (`CLAUDE.md`, `SKILL.md`, compiler/test loop). Zero subagents. |
| **B. Lightweight Orchestration** | Prompt & skill discipline + bounded harness subagents | 2–4 genuinely disjoint tasks (parallel scouting, isolated module tests, independent route audits) | Native harness subagents (`subagent` in Pi, Claude Code subagents), task envelopes, and disk pointer manifests (<200 tokens). **No new runtime.** |
| **C. Existing Workflow Infrastructure** | Deterministic state machine or compiled background workflow | Recurring multi-stage pipelines requiring durable retries, checkpointing, or strict lifecycle gates | Existing stack tools: CI matrices, `codemode` scripts, [Claude Dynamic Workflows](https://code.claude.com/docs/en/workflows), [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview), [Temporal](https://docs.temporal.io/), [Ray](https://docs.ray.io/), or [Auto Office](https://github.com/Hikari9/auto-office). |
| **D. Thin Economic Scheduling** *(Optional)* | Deterministic cost/verification router over existing harness tools | High-frequency dispatch across mixed-cost models where coordination overhead is measurable, verifiers are fast, and the owner explicitly wants economic routing | A thin adapter implementing structured task envelopes, shared state by reference, deterministic retries, and verification-aware escalation (see exploratory pilot [`gaia-skill-tree#2158`](https://github.com/gaia-research/gaia-skill-tree/issues/2158)). |
| **E. Human-Controlled Execution** | Human operator at the wheel; read-only agent assistance | Irreversible production deploys, schema/data migrations, permission or billing changes, or tasks lacking a reliable verification oracle | Agent prepares diffs or analysis only; human reviews, approves, and executes every consequential step. |

### The Step 0 Pre-Flight Checklist (Gate for Levels B–D)

Most coding tasks—building authentication, fixing a race condition, refactoring a shared payment module—are architecturally unified and belong at **Level A**. Move to **Level B or higher** only if you can answer **yes** to all four checks:

1. **Zero inter-lane dependencies:** Does the work split into disjoint pieces that do not depend on each other's in-flight output? *(If Lane 2 needs Lane 1's output, run them sequentially in one agent.)*
2. **Context isolation value:** Would keeping all exploration, logs, or file reads in one context window degrade recall or exceed ~20,000 root tokens?
3. **Explicit verification contract:** Does each lane have a clear, checkable completion gate (test suite, typecheck, schema validator, or bounded review rubric)?
4. **Cache-horizon alignment:** Does expected worker duration fit your root coordinator's cache retention window (5m, 30m on GPT 6, or 1h on Claude/Gemini), or will workers run detached and report via disk manifests?

---

## The Economics of Agentic Work

Asking *"Can this task be parallelized?"* is the wrong economic question. Parallel execution is not cheap execution. The right question—developed in [*The Economics of Agentic Work*](https://github.com/gaia-research/gaia-research/issues/304)—is how to minimize **Total Expected Cost per Verified Deliverable ($$C_{\text{verified}}$$)** subject to latency, quota, and safety constraints:

$$C_{\text{verified}} = \frac{\mathbb{E}[C_{\text{execution}}] + \mathbb{E}[C_{\text{orchestration}}] + \mathbb{E}[C_{\text{verification}}]}{P(\text{verified})}$$

Unfinished code has zero value; unverified code carries negative value because a human or frontier model must untangle it. Every architectural choice moves one of the four terms in that equation:

- **$$\mathbb{E}[C_{\text{execution}}]$$ (Worker inference):** Model rate cards span nearly two orders of magnitude—from compact workers like **GPT 6 Luna** (\$0.10/M input, \$0.50/M output) or **Gemini 3.8 Flash** to workhorses like **GPT 6 Sol** and **Claude Sonnet 5** (\$2.00/M input, \$10.00/M output) and flagships like **Claude Opus 5.5** (\$4.00/M input, \$20.00/M output). Under rate-card arithmetic, three failed attempts plus a fourth passing run on a \$0.10/M worker still cost a small fraction of a single frontier run—*if and only if* verification is deterministic and failed attempts are discarded cleanly in isolated git worktrees.
- **$$\mathbb{E}[C_{\text{orchestration}}]$$ (The Orchestrator Tax):** A root orchestrator holding 100,000 tokens of repo specifications, tool schemas, and task history pays to process that prefix on every turn ([#242](https://github.com/gaia-research/gaia-research/issues/242)). On Claude Opus 5.5 (\$4.00/M base input), a warm cache read costs **\$0.20/M** (0.05×), a 5-minute cache write costs **\$5.00/M** (1.25×), and a 1-hour cache write costs **\$8.00/M** (2.0×). That is a **25× gap** between a warm read and a cold 5-minute write (\$0.02 vs. \$0.50 per 100k-token turn). When worker runs outlast the cache TTL—or when a coordinator wakes up repeatedly to read verbose status chatter—orchestration tokens and enlarged reasoning trees (Snell et al., [arXiv:2408.03314](https://arxiv.org/abs/2408.03314)) can cost more than the workers themselves.
- **$$\mathbb{E}[C_{\text{verification}}]$$ and $$P(\text{verified})$$ (The Domain Harness Multiplier):** Small models often fail in bare shells because of environmental ambiguity, not reasoning ceilings. One-time investments in a **domain harness**—reusable `SKILL.md` playbooks, AST-aware search, compiler/typecheck feedback loops, and deterministic test gates—raise $P(\text{verified})$ for every subsequent run ([#304](https://github.com/gaia-research/gaia-research/issues/304)).
- **Subscription Quota Economics (\$20/Month Tiers):** On fixed-quota plans (Claude Pro/Max, ChatGPT Plus/Team), the binding constraint is **verified deliverables completed per rolling quota window**, not API cents. Conversational multi-agent ceremony can consume 30–60% of a 5-hour quota window on delegation chatter alone.

### Four Execution Regimes (Before You Build a Swarm)

Instead of defaulting to a heavy conversational manager, match task structure and verifier speed to one of four execution regimes ([#304](https://github.com/gaia-research/gaia-research/issues/304)):

1. **Single Capable Agent:** Best when requirements are novel, files are tightly coupled, or no automated verifier exists. Paying for strong reasoning once beats unguided small-model thrashing.
2. **Bounded Cheap Retries:** Best when scope is local and a fast deterministic verifier (`tsc`, `vitest`, `pytest`, `cargo check`) returns binary pass/fail diagnostics. Run 1–3 sequential attempts with compiler errors piped back.
3. **Speculative Hedged Racing:** Best when wall-clock latency matters and verification is binary and cheap. Run 2–3 isolated worktree attempts in parallel and keep the first verified pass, truncating tail latency ([Dean & Barroso, *The Tail at Scale*, 2013](https://research.google/pubs/the-tail-at-scale/)).
4. **Adaptive Cascade:** Start with a low-cost model plus domain skill; if verification fails after a strict turn ceiling (e.g., $$\le 3$$ turns), preserve the diagnostic receipt and escalate to a stronger model ([Chen et al., *FrugalGPT*, 2023](https://arxiv.org/abs/2305.05176)).

### Classical Laws That Govern Agent Swarms

| Precedent | Core Mechanism | Agentic Consequence |
| :--- | :--- | :--- |
| **Amdahl's Law** ([1967](https://doi.org/10.1145/1465482.1465560)) | Parallel speedup is capped by the serial fraction $$s$$: $$S(N) \le 1/s$$. | Serial planning, git merge resolution, and integration testing bound fleet speedup regardless of worker count. |
| **Brooks's Law** (*Mythical Man-Month*, 1975) & **Swarm Scaling** (Toby Ord) | Communication channels grow as $$n(n-1)/2$$; uncoordinated swarms scale sub-linearly ($$\sim N^{0.57}$$). | Multi-hop agent chains ("planner → coder → reviewer → integrator") suffer lossy summarization and quadratic token overhead. |
| **Conway's Law** & **The Ticket Trap** ([Ray Amjad, 2026](https://youtu.be/ybx0mmd22pQ)) | Systems mirror organizational charts; developers split small tasks into micro-tickets across role-playing agents (18:33). | [Anthropic's engineering guidance](https://www.anthropic.com/research/building-effective-agents) and [multi-agent research notes](https://www.anthropic.com/engineering/multi-agent-research-system) warn against role-play ceremony when a single loop with progressive skills suffices. |

---

## Separate Reasoning from Deterministic Coordination

The most expensive architectural mistake in agent engineering is using a non-deterministic frontier LLM as a message broker, cron daemon, and state database ([#306](https://github.com/gaia-research/gaia-research/issues/306)).

```
┌─────────────────────────────────────────┐      ┌─────────────────────────────────────────┐
│      INTELLIGENT REASONING (LLM)        │      │   DETERMINISTIC COORDINATION (CODE)     │
│ • Decompose ambiguous requirements      │      │ • Task queues & dependency readiness    │
│ • Write & refactor non-trivial code     │      │ • Isolated git worktree lifecycle       │
│ • Interpret novel failures & edge cases │ ───► │ • Timeouts, backoff & bounded retries   │
│ • Perform semantic architectural review │ ◄─── │ • Shared state & artifact pointers      │
│ • Decide when to escalate to human/peer │      │ • Compiler, linter & test gate execution│
└─────────────────────────────────────────┘      └─────────────────────────────────────────┘
        Invoke only when judgment is needed             Zero tokens · repeatable · auditable
```

### How Existing Coordination Runtimes Compare

When a workload outgrows single-session subagents (**Level C**), reuse deterministic software patterns rather than prompting an LLM to poll workers in chat ([#306](https://github.com/gaia-research/gaia-research/issues/306)):

| Platform / Pattern | Primary Mechanism | State & Isolation | What It Solves (and What It Leaves Open) |
| :--- | :--- | :--- | :--- |
| **[Claude Dynamic Workflows](https://code.claude.com/docs/en/workflows)** | Lead agent compiles an executable script to run subagent phases in a background sandbox | Sandboxed child processes; only consolidated output returns to root | Eliminates intermediate chat bloat; does not optimize cross-provider model routing or quota cliffs. |
| **[LangGraph](https://docs.langchain.com/oss/python/langgraph/overview)** | Directed cyclical state graphs with conditional edges | Checkpointers (in-memory, SQLite, Postgres) with replay and human-in-the-loop seams | Explicit control flow and state persistence; routing logic remains manual or LLM-driven. |
| **[Temporal](https://docs.temporal.io/)** | Durable distributed workflow-as-code execution | Event-sourced transaction log, activity heartbeats, automatic retry policies | Fault-tolerant long-running execution; infrastructure-level with no native token or cache awareness. |
| **[Ray](https://docs.ray.io/)** | Distributed dynamic task graphs and actors | Zero-copy shared memory (Plasma object store) and resource-aware scheduling | High-throughput parallel compute and shared object references; schedules CPUs/GPUs rather than LLM verifiers. |
| **[Rico's Auto Office](https://github.com/Hikari9/auto-office)** | Opinionated deterministic SDLC runtime (`discover → plan → route → produce → review → land`) | SQLite WAL (`runs.db`), isolated git worktrees, immutable worker submissions | Separates engineering lifecycle state and review authority from prompts; uses fixed role routing. |

### Where Thin Economic Scheduling Fits (Level D Hypothesis)

Workflow engines reliably execute a graph you define, but they do not decide *which execution strategy is most economical* for a given task. A **thin economic scheduler**—explored conceptually in [#306](https://github.com/gaia-research/gaia-research/issues/306) and piloted for Pi in [`gaia-research/gaia-skill-tree#2158`](https://github.com/gaia-research/gaia-skill-tree/issues/2158)—adds a lightweight deterministic adapter over existing harness primitives:

$$\min_{\pi} \mathbb{E}\left[ C_{\text{total}}(\tau) \mid \text{verified}(\tau) = 1 \right] \quad \text{s.t.} \quad \mathbb{E}[\text{Latency}(\tau)] \le L_{\max}, \quad P(\text{safety violation}) = 0$$

1. **Route before reasoning:** Choose single agent, bounded cheap worker, small parallel fan-out, or strong-model escalation using task scope, risk, and available verifiers.
2. **Structured task envelopes & shared state by reference:** Pass scoped file pointers, canonical skill paths, and artifact hashes instead of re-briefing raw conversation history.
3. **Deterministic dispatch & verification-aware escalation:** Run one focused verification pass and at most one targeted repair before escalating genuine ambiguity to a stronger model or human operator.

> **Status boundary:** [`gaia-skill-tree#2158`](https://github.com/gaia-research/gaia-skill-tree/issues/2158) is an **exploratory RFC and Pi-first pilot**, not a finished dependency or validated cost-saving package. Do not install custom scheduling infrastructure unless recurring coordination overhead and owner priorities explicitly justify **Level D**.

---

## The Provider Cache-Horizon Matrix

Whenever you operate at **Level B, C, or D** with a root coordinator that waits for workers, **match the root cache horizon to the wall-clock distribution of your workers.**

> **Evidence boundary:** Provider cache mechanics and published rate cards are sourced (verified September 24, 2026). Model pairings and worker-duration bands are practitioner hypotheses; savings figures are illustrative rate-card arithmetic, not controlled benchmark trials.

### Four Capability Layers (Do Not Conflate Them)

1. **Provider API Capability:** Raw endpoint primitives (Anthropic `cache_control`, OpenAI Responses API cache options, Google `CachedContent`).
2. **Model Support:** Checkpoint-specific retention and pricing (e.g., GPT 6 provides a 30-minute minimum at 1.25× write / 0.1× read; earlier OpenAI and Claude models differ).
3. **Product / CLI Exposure:** First-party tool configuration (e.g., Claude Code uses `promptCacheTtl` in `settings.json` or `CLAUDE_CODE_PROMPT_CACHE_TTL`—there is **no `--prompt-cache-ttl` CLI flag**).
4. **Harness Exposure:** How multi-agent harnesses (Pi, Claude Code, Codex CLI, custom scripts) set cache policies separately on root coordinators versus leaf workers.

### Provider Rate Cards & Retention Windows

| Provider / Model Family | Cache Mechanism | Default / Min Horizon | Longest Documented Horizon | Write Premium / Read & Storage Model | Configurable in API? | Configurable in Harness? | Best Coordination Fit |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **Anthropic Claude** *(Opus 5.5, Sonnet 5)* | Automatic or explicit `cache_control` breakpoints | API default: 5m; Claude Code main-session defaults vary by billing mode | 1h (`ttl: '1h'`) | **Opus 5.5** (\$4 in / \$20 out): 5m write \$5/M; 1h write \$8/M; read \$0.20/M. **Sonnet 5** (\$2 in / \$10 out): 5m write \$2.50/M; 1h write \$4/M; read \$0.20/M. | Yes (`ttl`) | Yes in Claude Code v2.1.242+ settings / env vars; harness-dependent elsewhere | Root coordinators with 5–55m worker gaps when reuse justifies the 1h write |
| **OpenAI GPT 6** *(Sol, Luna)* | Automatic or explicit breakpoints; 1,024-token visible-prefix minimum | At least 30m after write or reuse; API default is `30m` | OpenAI may retain longer; no GPT 6 24h setting | **Sol** (\$2 in / \$10 out): write \$2.50/M, read \$0.20/M. **Luna** (\$0.10 in / \$0.50 out): write \$0.125/M, read \$0.01/M. Both: 1.25× write, 0.1× read. | Yes (Responses API `prompt_cache_options`) | Depends on API integration; do not assume every CLI exposes these options | Worker gaps under 30m; Sol root / Luna workers is a common practitioner pairing |
| **Earlier OpenAI API models** *(pre-GPT-5.6)* | Model-specific implicit caching, `prompt_cache_retention`; stable `prompt_cache_key` aids routing | Model- and org-specific; `in_memory` is typically 5–10m inactive | Up to 24h on listed models | Model-specific read discounts; some earlier models have no added write charge. Check the exact model rate card. | Yes, where supported | Varies by model and harness | Use only after verifying the selected model's retention and rate card |
| **Google Gemini** *(Gemini 2.5+)* | Implicit caching on by default; explicit `CachedContent` available | Implicit: provider-managed; explicit: 1h default | Explicit TTL is configurable; limits and pricing are model-specific | Cached-input tokens plus hourly storage rent for the TTL; both vary by model | Yes (REST / SDK) | Only when the harness integrates the Gemini API | Large stable shared context when storage rent fits the workload duration |
| **xAI Grok** *(Grok 4.6)* | Provider-managed cached input | No guaranteed cache horizon established on the linked pricing page | Not documented on the linked rate card | \$2/M input, \$0.50/M cached input, \$6/M output | Provider-managed | Depends on provider integration | Treat cache reuse as opportunistic unless a TTL contract is documented |

### Matching Worker Duration Bands to Cache Horizons

```
                  What is the wall-clock duration of your workers?
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
     < 5 Minutes                   5 – 25 Minutes                  20 – 60 Minutes
  (Fast Lanes / Tight)         (Asynchronous Sweet Spot)       (Deep Work / Heavy Suites)
         │                               │                               │
         ▼                               ▼                               ▼
  Standard 5m TTL                 GPT 6 Family                    Claude 1h TTL
  (1.25× write rate)            (30m minimum floor)             (or Gemini CachedContent)
  • Rapid interactive loops       • 1.25× write / 0.1× read       • 2.0× write surcharge
  • Do NOT pay 2.0× 1h fee        • No keepalives under 30m       • Break-even on Turn 2 (>5m)
  • If slow lanes exist on 5m,    • Sol root ($2/M in) +          • Leaf subagents stay on 5m
    add 1 fast lane (<4m) or        Luna workers ($0.10/M in)
    in-flight root work                                                  │
                                                                         ▼
                                                                   > 60 Minutes
                                                                (Multi-Hour Epics)
                                                                         │
                                                                         ▼
                                                                Barrier Aggregation &
                                                                  Pointer Manifests
                                                                • Detached workers write disk
                                                                • Fresh root session (<20k)
```

- **Band 1 — Under 5 Minutes (Interactive Loops & Fast Lanes):** Keep standard **5-minute TTL** (1.25× write). Paying Anthropic's 2.0× 1-hour write fee when turns arrive every 1–4 minutes wastes money. **If you are locked into a 5-minute TTL while running a slower worker**, keep the root cache warm either by giving the coordinator productive in-flight work (drafting PR notes, reviewing diffs) or by pairing the slow lane with one genuine fast lane (<4 minutes, e.g., fast symbol/schema inspection) so its return refreshes the sliding 5-minute lease.
- **Band 2 — 5 to 25 Minutes (Mid-Length Asynchronous Work):** Fits **OpenAI GPT 6's 30-minute minimum eligibility** (1.25× write, 0.1× read; `prompt_cache_key` is not required on GPT 6) or a 1-hour Claude/Gemini horizon. No artificial 3-minute fast lanes or synthetic heartbeats are needed when worker gaps stay comfortably below 30 minutes.
- **Band 3 — 20 to 60 Minutes (Deep Suites & Heavy Subagents):** Configure **Anthropic Claude `ttl: '1h'`** on the root coordinator or **Google Gemini `CachedContent`**, while keeping ephemeral leaf subagents on standard 5-minute caching.
- **Band 4 — Over 60 Minutes (Multi-Hour Epics):** Do not hold a live coordinator session across multi-hour pauses. Run detached workers that write disk manifests, wait for the completion barrier deterministically, and start a **fresh coordinator session** initialized from compact pointer manifests (<15,000–20,000 tokens).

---

## Claude: Configure a 1-Hour Root Cache

When coordinating asynchronous workers on Anthropic Claude (Opus 5.5 or Sonnet 5) across 5–55 minute gaps, configuring a 1-hour root cache (`ttl: '1h'`) eliminates cold-cache re-entry penalties.

### Break-Even Arithmetic: 5-Minute vs. 1-Hour TTL

| Metric | Standard 5-Minute TTL | Extended 1-Hour TTL (`ttl: '1h'`) |
| :--- | :---: | :---: |
| **Initial Cache Write Surcharge** | **1.25×** base input tokens | **2.00×** base input tokens (+60% over 5m write) |
| **Subsequent Cache Read (Hit)** | Sonnet 5 **0.10×** · Opus 5.5 **0.05×** | Sonnet 5 **0.10×** · Opus 5.5 **0.05×** |
| **Sliding Retention Window** | 5 minutes from last hit | 60 minutes from last hit |

Let $$P_{\text{in}}$$ be base input price and $$L = 0.1\text{M}$$ (100,000 tokens) on **Claude Sonnet 5** ($$P_{\text{in}} = 2.00\text{ USD/M}$$, cached read rate $$= 0.10 \times P_{\text{in}} = 0.20\text{ USD/M}$$):

- **Case 1 — A Single Pause $>5$ Minutes (2 Turns):**
  - *5-minute TTL (expires during an 8-minute worker run):* Two cold writes $$= (1.25 + 1.25) \times P_{\text{in}} L = \mathbf{2.50 \times P_{\text{in}} L}$$.
  - *1-hour TTL (stays warm):* One 1h write + one warm hit $$= (2.00 + 0.10) \times P_{\text{in}} L = \mathbf{2.10 \times P_{\text{in}} L}$$.
  - **Result:** Avoiding a **single** cold eviction saves **16.0%** on Turn 2 ($$\frac{2.50 - 2.10}{2.50} = 0.160$$).
- **Case 2 — 8-Turn Swarm Across Seven 7.5-Minute Gaps (52.5m Total):**
  - *5-minute TTL (every wakeup misses):* $$8 \times (1.25 \times 2.00 \times 0.1) = 2.00\text{ USD}$$ (or **$2.000**).
  - *5-minute TTL + 270s synthetic heartbeats (21 pings across seven 15m gaps):* $$0.25 + 0.42 + 0.14 = 0.81\text{ USD}$$ (or **$0.810** total, plus extra network/failure surface).
  - *Native 1-hour TTL:* $$(2.00 \times 2.00 \times 0.1) + 7 \times (0.10 \times 2.00 \times 0.1) = 0.400 + 0.140 = 0.54\text{ USD}$$ (or **$0.540** total, **73% less prefill spend** than cold 5m writes, and one-third cheaper than synthetic heartbeats; on Opus 5.5, the same heartbeat comparison is $0.94 native 1h vs. $1.06 with pings) ([#247](https://github.com/gaia-research/gaia-research/issues/247), [#256](https://github.com/gaia-research/gaia-research/issues/256)).

### Verified Anthropic API & Claude Code Setup

Place static instructions, repo maps, and tool schemas **above** the `cache_control` breakpoint (minimum 1,024 tokens for Sonnet 5 / Opus 5.5; 2,048 for Haiku) and append compact worker receipts below it:

```python
import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

response = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=2048,
    system=[
        {
            "type": "text",
            "text": "You are the root coordinator...\n" + STABLE_REPO_SPEC,
            "cache_control": {"type": "ephemeral", "ttl": "1h"},
        }
    ],
    tools=ORCHESTRATION_TOOLS,
    messages=[{"role": "user", "content": "Plan independent lanes and verification gates."}],
)
```

In **Claude Code (v2.1.242+)**, there is **no `--prompt-cache-ttl=1h` CLI flag**. Configure root 1-hour caching while keeping leaf subagents on 5-minute caching via `.claude/settings.json` or environment variables:

```json
{
  "promptCacheTtl": "1h",
  "subagentPromptCacheTtl": "5m"
}
```

```bash
export CLAUDE_CODE_PROMPT_CACHE_TTL="1h"
export CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL="5m"
# Verify 1h lease creation in usage.cache_creation.ephemeral_1h_input_tokens:
claude -p "ping" --output-format json
```

- **Subscription vs. API billing:** On Claude Pro, Team, and Max within included plan usage, Claude Code defaults the main conversation to 1-hour caching and subagents to 5 minutes; once overage credits or direct API / Bedrock / Vertex keys apply, the default reverts to 5 minutes unless configured explicitly.
- **What invalidates a cached prefix (even inside a 1h TTL):** Switching models mid-session, changing `/effort`, adding/removing/reordering MCP tool schemas, running mid-session `/compact`, or mutating system instructions before the breakpoint ([#251](https://github.com/gaia-research/gaia-research/issues/251), [#256](https://github.com/gaia-research/gaia-research/issues/256)).

---

## Task Envelopes, Pointer Manifests, and Gap Telemetry

Whether you use lightweight subagents (**Level B**) or a deterministic dispatcher (**Level D**), keep token transport minimal in both directions and log economic telemetry.

### 1. Outbound: Structured Task Envelopes (Don't Prose-Rebrief)

Do not paste your full conversation history into every worker prompt. Dispatch each worker with a compact, self-contained **Task Envelope** that references repo files and skills by path:

```json
{
  "taskId": "migrate-billing-endpoints",
  "goal": "Migrate src/api/billing/*.ts to the v2 Prisma schema and pass unit tests.",
  "scopedFiles": ["src/api/billing/", "prisma/schema.prisma"],
  "skillRef": ".agents/skills/prisma-migration/SKILL.md",
  "authority": "edit-scoped-files-only",
  "verificationCmd": "npx vitest run src/api/billing",
  "outputManifest": "/tmp/results/migrate-billing-endpoints.json"
}
```

### 2. Inbound: The Pointer Manifest (< 200 Tokens)

**Every token a worker returns to the root coordinator becomes permanent prefix baggage re-billed on every subsequent turn.** Workers must write verbose logs, test output, and diffs to disk and return only a compact **Pointer Manifest**:

```json
{
  "task": "migrate-billing-endpoints",
  "status": "PASSED",
  "durationSec": 412,
  "verification": { "cmd": "npx vitest run src/api/billing", "passed": true },
  "artifacts": {
    "logFile": "/tmp/results/billing-test.log",
    "diffFile": "/tmp/results/billing-patch.diff"
  },
  "summary": "4 endpoints migrated; 142 tests passed, 0 failed.",
  "requiresAction": false
}
```

**Target: Keep root coordinator context under 15,000–20,000 tokens.** At 15k context, even eight cold 5-minute writes cost **\$0.60 instead of \$4.00** on Opus 5.5, or **\$0.30 instead of \$2.00** on GPT 6 Sol (excluding output tokens). Read `/tmp/results/billing-test.log` only when `status` is `"FAILED"`.

### 3. Observability: Gap & Verification Telemetry

Aggregate invoice totals hide whether money was spent on productive worker generation or cold-cache coordinator wakeups. Record four signals per run (and record missing fields as `unknown`, never `0`):

1. **Inter-turn idle gaps ($$\Delta t$$):** Compare time between coordinator turns against the configured cache horizon (5m, 30m, or 1h).
2. **Cache read vs. write tokens:** Check `cache_read_input_tokens` and `cache_creation_input_tokens` (Anthropic), `usage.cache_creation.ephemeral_1h_input_tokens` (Claude Code JSON), or `usage.input_tokens_details.cached_tokens` and `cache_write_tokens` (OpenAI Responses API).
3. **Coordination vs. execution share:** Track coordinator tokens separately from worker tokens.
4. **Verified outcome & retry count:** Record whether the deterministic verification command passed and how many attempts were required.

---

## A worked example, start to finish

**Task:** *"Migrate database queries across 16 independent API endpoints to the new Prisma schema, with unit tests."*

1. **Coordination Ladder Assessment ([Decision Framework](#the-coordination-decision-framework)):**
   - **Why not Level A (Single Agent)?** 16 endpoints plus test suites span ~120,000 tokens—large enough to bloat a single context window.
   - **Why Level B (Lightweight Orchestration) over Levels C/D?** The 16 endpoints partition cleanly into 4 disjoint directory groups with zero cross-lane dependencies and a fast deterministic verifier (`vitest`). Existing harness subagents and pointer manifests suffice; no new workflow engine or scheduler install is needed.
2. **Model & Cache-Horizon Selection:**
   - Expected worker duration: 12–20 minutes per lane.
   - *Practitioner Option 1 (GPT 6):* **GPT 6 Sol** root coordinator (\$2.00/M in, \$2.50/M write, \$0.20/M cached read; 30m minimum floor) + 4 **GPT 6 Luna** workers (\$0.10/M in, \$0.50/M out). Because 12–20m fits inside the 30m floor, no keepalive pings are needed.
   - *Practitioner Option 2 (Claude):* **Claude Sonnet 5** root with `ttl: '1h'` (\$2.00/M in, \$4.00/M 1h write, \$0.20/M read) + 5m subagent cache.
3. **Lane Partitioning & Envelopes:**
   ```
   LANE 1 → src/api/users/*    (verify: npx vitest run src/api/users)
   LANE 2 → src/api/billing/*  (verify: npx vitest run src/api/billing)
   LANE 3 → src/api/projects/* (verify: npx vitest run src/api/projects)
   LANE 4 → src/api/reports/*  (verify: npx vitest run src/api/reports)
   ```
4. **Pointer Manifests & Rate-Card Bill Verification:**
   - Root coordinator context stays at **18,000 tokens** (0.018M) because each worker writes logs/diffs to `/tmp/results/lane-N.json` and returns a 6-line JSON receipt.
   - **Sol root cache spend:** Turn 1 write: $$2.50 \times 0.018 = 0.045\text{ USD}$$ (**$0.045**); four warm reads: $$4 \times (0.20 \times 0.018) = 0.0144\text{ USD}$$ (**$0.0144**); root cache subtotal: **$0.0594** (or **$0.0864** on Sonnet 5 with a 1h write).
   - **Four Luna workers (illustrative 50k in / 10k out each):** $$4 \times ((0.05 \times 0.10) + (0.01 \times 0.50)) = 0.0400\text{ USD}$$ (**$0.0400**).
   - **Illustrative token subtotal:** **~\$0.10** (excluding output tokens on the coordinator and any retry turns), with every lane verified by `vitest`.

---

## Mistakes we keep making

| Mistake | Economic Consequence | Fix |
| :--- | :--- | :--- |
| **Orchestrating a tightly coupled task ("Ticket Trap")** | Quadratic handoff chatter, merge conflicts, and broken context across micro-tickets | Keep unified tasks in **Level A** (one agent loop + progressive skills) ([#304](https://github.com/gaia-research/gaia-research/issues/304)) |
| **Using a frontier LLM for deterministic polling & state** | Pays frontier token and reasoning prices for work a script, queue, or SQLite state file does for free | Move queues, worktrees, retries, and test gates to deterministic software ([#306](https://github.com/gaia-research/gaia-research/issues/306)) |
| **Installing a custom scheduler for one-off tasks** | Adds maintenance, configuration drift, and complexity without recurring payoff | Default to **Level A** or **Level B**; require explicit owner consent before installing tooling ([#308](https://github.com/gaia-research/gaia-research/issues/308)) |
| **Worker duration exceeds root cache horizon** | Evicts root KV cache during worker runs; forces cold re-writes on wakeup (up to 25× read cost on Opus 5.5 5m) | Match horizon to worker duration: GPT 6 30m floor, Claude `ttl: '1h'`, or barrier aggregation >60m ([#255](https://github.com/gaia-research/gaia-research/issues/255)) |
| **Enabling 1h TTL on ephemeral leaf subagents** | Pays 2.0× write surcharge on short-lived workers that never reuse the 1-hour lease | Keep leaf subagents on standard 5-minute sliding cache (`subagentPromptCacheTtl: "5m"`) ([#254](https://github.com/gaia-research/gaia-research/issues/254)) |
| **Workers paste raw stdout, logs, or full diffs** | Permanently bloats root coordinator context on every subsequent turn | Enforce disk-based Pointer Manifests (<200 tokens) and keep root context <15k–20k ([#242](https://github.com/gaia-research/gaia-research/issues/242)) |
| **Mutating tools, model, or prefix mid-session** | Alters prefix hash and invalidates warm cache regardless of remaining TTL | Freeze system prompt, model, and MCP tool schemas before dispatching lanes ([#251](https://github.com/gaia-research/gaia-research/issues/251), [#256](https://github.com/gaia-research/gaia-research/issues/256)) |
| **Selecting an orchestrator for token speed over reasoning** | Pays throughput premiums for a coordinator that spends most of its wall-clock time waiting | Choose strong decomposition and favorable input/cache economics; respect user model preferences ([#245](https://github.com/gaia-research/gaia-research/issues/245)) |

---

## Agent-Consumable Assessment Contract

> **Explicit Non-Authorization Rule:** Reading, fetching, or copying this guide is **not** permission to modify a repository, alter `.claude/settings.json` or `.pi` configuration, override the user's preferred models, install packages, or launch paid multi-agent runs. An agent must inspect first, recommend the smallest sufficient option (including **doing nothing**), and wait for explicit owner approval.

When an agent in **Pi**, **Claude Code**, or another harness is given this guide, it must execute this 10-step assessment protocol:

1. **Inspect repository & harness (read-only):** Read `CLAUDE.md`, `AGENTS.md`, `package.json`, CI workflows, and active harness directories (`.agents/skills/`, `.claude/`, `.pi/`).
2. **Identify native coordination primitives:** Check what the active harness already provides (e.g., Pi `subagent`, `codemode`, and background tasks; Claude Code subagents and Dynamic Workflows).
3. **Catalog existing skills & workflow tools:** Check for reusable skills (`SKILL.md`), test runners, linters, or workflow engines already in the repository to avoid duplicate tooling.
4. **Assess recurring workloads & coordination overhead:** Determine whether current tasks are tightly coupled or genuinely parallel, whether fast deterministic verifiers exist, and whether cold-cache wakeups or context bloat actually occur.
5. **Determine owner priorities & model preferences:** Confirm whether the owner optimizes for API cost, \$20-tier subscription quota preservation, wall-clock latency, simplicity, or human review—and preserve their chosen models.
6. **Evaluate suitability across Levels A–E:** Classify the workload into **Level A** (No orchestration), **Level B** (Existing skills/subagents), **Level C** (Existing workflow runtime), **Level D** (Thin economic scheduler adapter), or **Level E** (Human-controlled execution).
7. **Recommend the smallest appropriate solution:** Default to **Level A** or **Level B**. Recommend **no changes at all** if current workflows are already appropriate.
8. **Explain costs, tradeoffs, and evidence boundaries:** State expected benefits, cache-horizon mechanics, what would be measured, and how to revert—clearly separating published rate-card math from unverified hypotheses.
9. **Request explicit owner consent:** Present the suitability verdict and proposed changes (if any) and pause for explicit approval before editing files or running commands with side effects.
10. **Implement within repository governance (only if authorized):** Follow repo-native conventions, preserve user model selection, enforce <200-token pointer manifests and <15k–20k root context targets, apply verified cache settings for the active model, and respect all safety and permission boundaries.

### Copyable Universal Assessment Prompt

Use the buttons at the top of this page to copy a harness-specific prompt for **Claude Code** or **Pi**, or use this portable assessment prompt directly:

```text
Review this repository using the Gaia Research Orchestration Guide (read-only assessment first):
1. Inspect CLAUDE.md/AGENTS.md, existing skills (.agents/skills, .claude, .pi), test verifiers, and native harness subagent/workflow capabilities. Do not modify any files or settings yet.
2. Ask or confirm my model preferences and primary priority (API cost, subscription quota preservation, latency, simplicity, or human review). Never hardcode or override my model choice.
3. Classify my workload on the A–E Coordination Ladder:
   - Level A: Single agent loop + existing skills/verifiers (default; recommend doing nothing if sufficient)
   - Level B: Lightweight orchestration using existing subagents, task envelopes, and disk pointer manifests (<200 tokens)
   - Level C: Reuse existing workflow/CI infrastructure
   - Level D: Optional thin economic scheduler adapter (only if recurring multi-model overhead and fast verifiers justify it)
   - Level E: Human-controlled execution for sensitive or unverified actions
4. Present a concise suitability verdict, cache-horizon recommendations for my active model, tradeoffs, and reversible scope, then ask for my explicit consent before making any changes.
```

---

## What is verified vs. hypothesized

To keep engineering decisions grounded, this guide strictly separates five epistemic categories:

1. **Established Technical Capabilities & Sourced Rate Cards (Verified September 24, 2026):**
   - **Anthropic:** [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [Claude Code Prompt Caching](https://code.claude.com/docs/en/prompt-caching), and [Claude Dynamic Workflows](https://code.claude.com/docs/en/workflows).
   - **OpenAI:** [API Pricing](https://developers.openai.com/api/docs/pricing) and [Prompt Caching](https://developers.openai.com/api/docs/guides/prompt-caching).
   - **Google Gemini:** [Context Caching](https://ai.google.dev/gemini-api/docs/generate-content/caching) and [API Pricing](https://ai.google.dev/gemini-api/docs/pricing).
   - **DeepSeek & xAI:** [DeepSeek Pricing](https://api-docs.deepseek.com/quick_start/pricing/) and [xAI Grok 4.6 Pricing](https://docs.x.ai/developers/models/grok-4.6).
   - **Coordination Runtimes:** [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview), [Temporal](https://docs.temporal.io/), [Ray](https://docs.ray.io/), and [Rico's Auto Office (`Hikari9/auto-office`)](https://github.com/Hikari9/auto-office).
2. **Published Research & Systems Precedents:**
   - Parallel & organizational bounds: Gene Amdahl ([1967](https://doi.org/10.1145/1465482.1465560)), Fred Brooks (*The Mythical Man-Month*, 1975), Melvin Conway (1967), and Toby Ord (*Swarm Scaling*, $$\\lambda \\approx 0.57$$).
   - Tail latency, routing & compute scaling: Jeffrey Dean & Luiz André Barroso ([*The Tail at Scale*, 2013](https://research.google/pubs/the-tail-at-scale/)), Lingjiao Chen et al. ([*FrugalGPT*, arXiv:2305.05176](https://arxiv.org/abs/2305.05176)), and Charlie Snell et al. ([*Scaling LLM Test-Time Compute*, arXiv:2408.03314](https://arxiv.org/abs/2408.03314)).
   - KV cache serving systems: Kwon et al. ([*PagedAttention*, SOSP '23](https://doi.org/10.1145/3600006.3613165)), Zheng et al. ([*SGLang RadixAttention*, arXiv:2312.07104](https://arxiv.org/abs/2312.07104)), and Qin et al. (*Mooncake*, USENIX FAST '24).
   - Agent architecture guidance: Anthropic ([*Building Effective Agents*](https://www.anthropic.com/research/building-effective-agents) and [*How We Built Our Multi-Agent Research System*](https://www.anthropic.com/engineering/multi-agent-research-system)).
3. **Practitioner Observations & Rate-Card Arithmetic:**
   - Ray Amjad's analysis of Conway's Law and the "Ticket Trap" in [*Anthropic's New Subagent Rules Will Change How You Build*](https://youtu.be/ybx0mmd22pQ) (18:33).
   - The 16% single-pause break-even and 73% eight-turn prefill reduction on Claude Sonnet 5, the Opus 5.5 25× 5m write/read ratio, and the 16-endpoint worked example are exact arithmetic under stated rate-card assumptions, not measured trial averages ([#247](https://github.com/gaia-research/gaia-research/issues/247), [#256](https://github.com/gaia-research/gaia-research/issues/256)).
   - Model pairings (such as GPT 6 Sol coordinating Luna workers, or Sonnet 5 with `ttl: '1h'`) and the 15k–20k token root context ceiling are practitioner heuristics.
4. **Gaia Architectural Hypotheses & Exploratory Pilots:**
   - The Expected Cost per Verified Deliverable ($$C_{\text{verified}}$$) formulation, the Domain Harness Multiplier, and the four-regime execution model ([#304](https://github.com/gaia-research/gaia-research/issues/304)).
   - The Economic Scheduler objective ($$\\min_{\\pi}\\mathbb{E}[C_{\\text{total}}\\mid\\text{verified}]$$) ([#306](https://github.com/gaia-research/gaia-research/issues/306)) and the Pi-first exploratory pilot in [`gaia-research/gaia-skill-tree#2158`](https://github.com/gaia-research/gaia-skill-tree/issues/2158). No empirical cost-reduction claims are made for the pilot prior to completed trials.
5. **Future Validation Opportunities & Tracking Issues:**
   - Controlled benchmarks comparing single frontier runs, bounded cheap retries, speculative worktree racing, and adaptive cascades on held-out repository issues are tracked alongside cache-horizon and telemetry studies in [#242](https://github.com/gaia-research/gaia-research/issues/242), [#245](https://github.com/gaia-research/gaia-research/issues/245), [#247](https://github.com/gaia-research/gaia-research/issues/247), [#251](https://github.com/gaia-research/gaia-research/issues/251), [#252](https://github.com/gaia-research/gaia-research/issues/252), [#254](https://github.com/gaia-research/gaia-research/issues/254), [#255](https://github.com/gaia-research/gaia-research/issues/255), [#256](https://github.com/gaia-research/gaia-research/issues/256), [#304](https://github.com/gaia-research/gaia-research/issues/304), [#306](https://github.com/gaia-research/gaia-research/issues/306), [#308](https://github.com/gaia-research/gaia-research/issues/308), and [`gaia-skill-tree#2158`](https://github.com/gaia-research/gaia-skill-tree/issues/2158).
