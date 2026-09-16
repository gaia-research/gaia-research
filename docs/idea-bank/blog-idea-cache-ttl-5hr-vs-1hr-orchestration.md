# Blog Idea: Cache TTL Economics — 5-Hour vs. 1-Hour TTL on Claude, The 2× Write Multiplier, and Orchestration Swarms

- **Status:** In Ideation / Proposed Research
- **Rank:** 3 (Idea Bank)
- **Viability:** Very High (telemetry via `pi-cost`, multi-agent trace logs, and provider API cache control headers already operational)
- **Potential:** Exceptional (direct bottom-line impact on AI agent budgets, coding CLI session economics, and multi-agent system design)
- **Primary Deliverable:** Mathematical break-even model + cross-CLI caching matrix + Gaia Research editorial post (`/blog/cache-ttl-5hr-vs-1hr-orchestration`)
- **Owner:** Marcus Tiongson / Nova
- **Tracking Issue:** [#247](https://github.com/gaia-research/gaia-research/issues/247)

---

## 1. Executive Summary & Why Now

In API billing and coding CLI operations, prompt caching has become the single largest determinant of token economics. On Claude, caching yields up to a **90% discount ($0.10\times$ base input)** on cache hits. However, providers impose strict ephemeral time-to-live (TTL) limits.

Anthropic offers two distinct caching durations:
1. **Standard 5-minute TTL:** Cache writes cost **$1.25\times$ base input tokens**.
2. **Extended 1-hour TTL (`ttl: '1h'`):** Cache writes cost **$2.0\times$ base input tokens** — literally double the base input rate, and a 60% premium over the 5-minute write rate.

At first glance, paying double the base price ($2.0\times P_{\text{in}}$) to write to the cache sounds exorbitant. For interactive human developers typing prompts every 30 to 90 seconds, it is indeed pure financial waste: consecutive turns keep the 5-minute sliding TTL alive for free.

However, two major phenomena upend this calculation:
1. **The Human Work Cycle & Claude's 5-Hour Window:** When developers pause to inspect code, run a test suite, take a 10-minute break, or attend a meeting, the 5-minute cache silently evaporates. When they resume, the CLI re-writes the entire 50k–150k context at full write rates. On Claude Pro, Team, and Max subscription plans, usage is tracked against a rolling **5-hour rate limit window**. Repeated cold re-writes rapidly exhaust the 5-hour quota, leading to the infamous "rate limit exceeded" wall during an active coding day.
2. **Multi-Agent Orchestration Swarms:** In modern coding harnesses (Claude Code subagents, Pi workflows, OpenAI Codex fleets, and Herdr worker panes), an orchestrator coordinates long-running sub-tasks. A subagent exploring a codebase, running builds, or executing unit tests routinely takes **6 to 45 minutes**. Because subagent latency breaches the 5-minute TTL, every single orchestrator wakeup is a completely cold cache reentry.

This paper addresses the central questions:
- **Is paying double the write price for a 1-hour TTL worth it?**
- **When is the mathematical break-even point for interactive coding vs. multi-agent orchestration?**
- **What would an extended 5-hour TTL look like (matching the 5-hour rolling session window), and how does it compare to 1-hour TTL and synthetic keepalive heartbeats?**
- **How do competing coding agent CLIs (Claude Code, OpenAI Codex, Google Antigravity/AGY, and xAI Grok) approach cache TTLs, retention, and eviction?**

---

## 2. Cross-CLI & Cross-Provider Caching Landscape

Different providers and their corresponding coding agent CLIs employ radically different cache architectures, TTL rules, and pricing models:

```
┌─────────────────┬──────────────────┬──────────────────┬─────────────────┬──────────────────┐
│ Feature / Spec  │ Anthropic Claude │ OpenAI Codex CLI │ Google AGY CLI  │ xAI Grok CLI     │
│                 │   (Claude Code)  │                  │   (Gemini CLI)  │                  │
├─────────────────┼──────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ Default TTL     │ 5 minutes        │ ~5–10 minutes    │ 1 hour (default │ Sliding LRU      │
│                 │ (sliding window) │ (sliding LRU)    │ min billing)    │ (cluster memory) │
├─────────────────┼──────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ Extended TTL    │ 1 hour (`1h`)    │ 24 hours (select │ Configurable    │ N/A (sticky via  │
│                 │ (explicit beta)  │ models/cache_key)│ (hours / days)  │ conv-id header)  │
├─────────────────┼──────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ Write Surcharge │ 5m: 1.25× base   │ 1.0× base        │ 1.0× base +     │ 1.0× base        │
│                 │ 1h: 2.00× base   │ (zero surcharge) │ Storage Rent    │ (zero surcharge) │
├─────────────────┼──────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ Read Cost (Hit) │ 0.10× base       │ 0.50× base       │ 0.10×–0.25× base│ 0.25× base       │
│                 │ (90% discount)   │ (50% discount)   │ (75–90% disc.)  │ (75% discount)   │
├─────────────────┼──────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ Minimum Prefix  │ 1,024 tok (Sonnet/Opus)│ 1,024 tokens     │ 32,768 tokens   │ Unspecified      │
│                 │ 2,048 tok (Haiku)      │ (128-tok blocks) │ (Pro / Flash)   │ (prefix match)   │
├─────────────────┼──────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ Quota / Billing │ 5-hour rolling   │ Per-token /      │ Storage rent    │ Per-token /      │
│ Interaction     │ window (Claude)  │ Rate tiers       │ ($1.00/M/hr)    │ Rate tiers       │
└─────────────────┴──────────────────┴──────────────────┴─────────────────┴──────────────────┘
```

### 1. Anthropic Claude & Claude Code
- **Mechanics:** Explicit breakpoints via `cache_control: {"type": "ephemeral"}` or extended `cache_control: {"type": "ephemeral", "ttl": "1h"}`.
- **Cost Differential:** Standard 5m writes cost $1.25\times P_{\text{in}}$; 1h writes cost $2.00\times P_{\text{in}}$. Read hits cost $0.10\times P_{\text{in}}$.
- **Claude Code Dynamic:** Claude Code manages context prefixes automatically. On API billing, cold misses bill at $1.25\times$. On Claude Pro/Team/Max subscriptions, cache creation tokens count heavily against the 5-hour rolling usage limit, while cache read tokens consume minimal quota. A developer whose cache constantly expires after 5 minutes hits their 5-hour subscription limit 3× to 5× faster than one whose cache remains warm.

### 2. OpenAI & Codex CLI
- **Mechanics:** Fully automatic prefix caching on all prompts $\ge 1,024$ tokens, evaluated in 128-token increments. No manual breakpoint declaration required.
- **Cost Differential:** No cache write surcharge ($1.0\times P_{\text{in}}$). Cache reads are discounted by 50% ($0.50\times P_{\text{in}}$).
- **TTL Behavior:** Caches are held in GPU memory on an LRU eviction basis, typically lasting 5 to 10 minutes of inactivity. For select models (e.g., GPT-5.1/5.6-codex via the Responses API and batch endpoints), OpenAI introduced `prompt_cache_key` with up to 24-hour retention.
- **Codex CLI Impact:** In Codex CLI, a cache eviction does not incur a write price penalty (since write price is $1.0\times$), but it does forfeit the 50% read discount and dramatically inflates Time-to-First-Token (TTFT) latency while the model re-prefills the context. Explicit cache key partitioning prevents cache churn across disjoint project sessions.

### 3. Google Gemini & Antigravity (AGY) CLI
- **Mechanics:** Explicit Context Caching (with implicit caching added in Gemini 2.5). Requires a minimum prompt length of 32,768 tokens.
- **Cost Differential:** Decoupled storage rent model! Developers do not pay an inflated token write multiplier. Instead, they pay base input price + a flat hourly storage fee ($1.00 per million tokens per hour on Gemini 1.5 Pro). Cache reads receive a 75% to 90% discount ($0.25\times$ to $0.10\times$ base input).
- **TTL Behavior:** Defaults to a minimum 1-hour TTL. Configurable to arbitrary durations (minutes, hours, days).
- **AGY CLI Impact:** AGY CLI excels when operating against massive monolithic reference contexts (entire repos, 200k token docs). However, the 1-hour minimum billing means spinning up disposable subagents with ephemeral context gets billed for a full hour of storage even if active for only 2 minutes.

### 4. xAI Grok & Grok CLI
- **Mechanics:** Automatic prefix caching. Grok API utilizes the `x-grok-conv-id` HTTP header to route sequential turns to the specific physical server/GPU cluster holding the cached KV activations.
- **Cost Differential:** No write premium ($1.0\times$). Cache hits receive a 75% discount ($0.25\times$ base input).
- **Grok CLI Impact:** As long as the CLI client preserves conversation headers, cache hit rates remain high during active sessions. Like OpenAI, cold reentries do not penalize write price, but sacrifice the 75% hit discount and increase latency.

---

## 3. Mathematical Break-Even Analysis: Is Double the Write Price Worth It?

Let:
- $P_{\text{in}}$: Base input token price per million tokens.
- $L$: Context length in tokens (e.g., $100\text{k} = 0.1\text{M}$).
- $C_{5\text{m, write}} = 1.25 \cdot P_{\text{in}} \cdot L$: Cost of writing to a 5-minute cache.
- $C_{1\text{h, write}} = 2.00 \cdot P_{\text{in}} \cdot L$: Cost of writing to a 1-hour cache.
- $C_{\text{read}} = 0.10 \cdot P_{\text{in}} \cdot L$: Cost of reading from cache (both 5m and 1h).
- $\Delta t$: Idle time elapsed between consecutive model turns.

### Scenario A: The Single Pause / Intermittent Turn

Suppose a user issues Turn 1, then pauses for $\Delta t$, and then issues Turn 2 on the same prefix.

#### Case 1: Active Chatter ($\Delta t \le 5\text{ minutes}$)
Both caches remain warm.
- Total 5m Cost: $C_{5\text{m}} = 1.25 \cdot P_{\text{in}} \cdot L + 0.10 \cdot P_{\text{in}} \cdot L = \mathbf{1.35 \cdot P_{\text{in}} \cdot L}$
- Total 1h Cost: $C_{1\text{h}} = 2.00 \cdot P_{\text{in}} \cdot L + 0.10 \cdot P_{\text{in}} \cdot L = \mathbf{2.10 \cdot P_{\text{in}} \cdot L}$
- **Verdict:** 1-hour TTL is **$0.75 \cdot P_{\text{in}} \cdot L$ more expensive (+55%)**. It is completely wasted money.

#### Case 2: Thinking Pause / Local Test Run ($5\text{m} < \Delta t \le 60\text{m}$)
The 5-minute cache expires; the 1-hour cache survives.
- Total 5m Cost: Turn 1 is a write ($1.25$), Turn 2 is an eviction and cold re-write ($1.25$).
  $$C_{5\text{m}} = 1.25 \cdot P_{\text{in}} \cdot L + 1.25 \cdot P_{\text{in}} \cdot L = \mathbf{2.50 \cdot P_{\text{in}} \cdot L}$$
- Total 1h Cost: Turn 1 is an extended write ($2.00$), Turn 2 is a cache hit ($0.10$).
  $$C_{1\text{h}} = 2.00 \cdot P_{\text{in}} \cdot L + 0.10 \cdot P_{\text{in}} \cdot L = \mathbf{2.10 \cdot P_{\text{in}} \cdot L}$$
- **Verdict:** **1-hour TTL is cheaper by $0.40 \cdot P_{\text{in}} \cdot L$ (a 16% net savings on Turn 2)**!
- **Key Insight:** **A single pause $> 5$ minutes during a 1-hour session completely justifies the 2× write price.** You do not need dozens of turns to break even; a single cold eviction avoided makes the 1-hour TTL profitable.

---

## 4. The Orchestration Multiplier: Why 1-Hour Slashes Orchestrator Tax

In multi-agent orchestration, the orchestrator delegates tasks to subagents and sleeps. Because subagent tasks (repo map generation, test executions, multi-file refactors) typically run between **6 and 25 minutes**, every turn satisfies:

$$5\text{ minutes} < \Delta t_{\text{subagent}} < 60\text{ minutes}$$

### Worked Example: 8-Stage Build & Test Orchestrator
- Orchestrator Context: $L_{\text{orch}} = 100\text{k}$ tokens.
- Number of worker dispatches: $K = 8$.
- Average worker execution time: $\Delta t = 7.5\text{ minutes}$ (Total flight duration: 60 minutes).
- Model: Claude 3.5 / 3.7 Sonnet ($P_{\text{in}} = \$3.00/\text{M}$).

*(Note on context growth: In production harnesses, each worker returns a concise receipt or summary adding $\Delta L \approx 500\text{--}1,500$ tokens per turn. The stable prefix $L_{\text{orch}}$ remains warm at the $0.10\times$ read rate, while only the newly appended delta tokens incur standard write rates. For simplicity in illustrating the prefill eviction penalty, we hold the base prefix constant at $100\text{k}$ tokens).*

```
Timeline (60 minutes):
Turn 1 ────[7.5m worker]────► Turn 2 ────[7.5m worker]────► Turn 3 ────...────► Turn 8
```

#### Under 5-Minute TTL (Default):
Every single worker return occurs after the 5-minute mark. The orchestrator experiences **0 cache hits** across the entire 60-minute session. It pays the $1.25\times$ write surcharge 8 separate times:
$$C_{\text{orch, 5m}} = 8 \times (1.25 \times \$3.00 \times 0.1\text{M}) = 8 \times \$0.375 = \mathbf{\$3.000}$$

#### Under 1-Hour Extended TTL:
The orchestrator pays the $2.0\times$ write premium on Turn 1. Because all subsequent 7 dispatches occur within the 60-minute window, every subsequent wakeup is a **warm cache hit** ($0.10\times$):
$$C_{\text{orch, 1h}} = (2.00 \times \$3.00 \times 0.1\text{M}) + 7 \times (0.10 \times \$3.00 \times 0.1\text{M})$$
$$C_{\text{orch, 1h}} = \$0.600 + 7 \times \$0.030 = \$0.600 + \$0.210 = \mathbf{\$0.810}$$

#### Comparison:
- **Cost under 5-minute TTL:** $3.000
- **Cost under 1-hour TTL:** $0.810
- **Net Dollar Savings:** **$2.190 saved (73.0% discount)**!
- **Effective Price Multiplier:** 5-minute TTL costs **$3.70\times$ more** than 1-hour TTL on the exact same multi-agent workflow.

```
Orchestrator Prefill Cost (8 Dispatches, 100k Context)
┌─────────────────────────────────────────────────────────────┐
│ 5-Min TTL:  ████████████████████████████████████████ $3.00  │
│ 1-Hour TTL: ███████████ $0.81 (-73%)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. The 5-Hour Question: 5-Hour TTL vs. 1-Hour TTL vs. Keepalives

Why is a 5-hour TTL specifically significant?

1. **The Claude Subscription Window:** Claude Code Pro, Team, and Max plans enforce a **5-hour rolling usage limit**. When prompts expire every 5 minutes or 1 hour, forced re-writes burn through subscription tokens at $1.25\times$ to $2.0\times$ rate, prematurely exhausting user quotas.
2. **Deep Work & Long-Flight Workflows:** Complex enterprise refactoring, benchmark evaluations (like Gaia's Hell Heaven Benchmark suites), and multi-agent code audits frequently run for **2 to 5 hours**. In a 3-hour flight, a 1-hour TTL will expire at least twice, forcing repeated $2.0\times$ writes.

### Option 1: Hypothetical 5-Hour Provider TTL Tier
If Anthropic offered a native 5-hour TTL tier, how high could the write multiplier be before it ceases to be economical?

Let $M_{5\text{h}}$ be the write multiplier for a 5-hour cache.
Consider a 4-hour orchestration flight with $K = 16$ dispatches (one every 15 minutes).
- Under 1-hour TTL, the cache expires 3 times (4 separate 1-hour write leases):
  $$C_{1\text{h, 4hr}} = 4 \times (2.00 \times P_{\text{in}} \cdot L) + 12 \times (0.10 \times P_{\text{in}} \cdot L) = 8.00 + 1.20 = \mathbf{9.20 \cdot P_{\text{in}} \cdot L}$$
- Under a 5-hour TTL with multiplier $M_{5\text{h}}$:
  $$C_{5\text{h, 4hr}} = M_{5\text{h}} \cdot P_{\text{in}} \cdot L + 15 \times (0.10 \cdot P_{\text{in}} \cdot L) = M_{5\text{h}} + 1.50$$
- Break-even condition ($C_{5\text{h}} \le C_{1\text{h}}$):
  $$M_{5\text{h}} + 1.50 \le 9.20 \implies M_{5\text{h}} \le 7.70$$
- **Finding:** A provider could price a 5-hour cache write at **$3.5\times$ to $4.0\times$ base input**, and an orchestrator running a 4-hour flight would *still* save over 50% compared to 1-hour TTL re-writes, and save over 75% compared to 5-minute re-writes.

### Option 2: The Synthetic Keepalive Heartbeat
Today, developers who only have access to 5-minute or 1-hour TTLs often consider "heartbeat pings": issuing a synthetic 1-token request every 4.5 minutes (to keep 5m warm) or every 58 minutes (to keep 1h warm).

#### The 5-Minute Heartbeat Math:
- Cost per heartbeat on 100k context: 1 cache read = $0.10 \times \$3.00 \times 0.1\text{M} = \$0.030$.
- In an 8-dispatch run where workers take 15 minutes each:
  - 3 heartbeats per worker turn $\times 8$ turns = 24 heartbeats = $24 \times \$0.030 = \mathbf{\$0.720}$.
  - Plus initial 5m write ($1.25\times = \$0.375$) + 7 legitimate reads ($7 \times \$0.030 = \$0.210$).
  - Total Heartbeat Cost: $\$0.375 + \$0.720 + \$0.210 = \mathbf{\$1.305}$.
- Compare with native 1-Hour TTL:
  - Total 1h Cost: $\$0.600 + \$0.210 = \mathbf{\$0.810}$.
- **Verdict:** **Native 1-hour TTL is 38% cheaper than running 5-minute synthetic heartbeats!** Furthermore, heartbeats introduce network failure modes, clutter API telemetry, and waste provider GPU scheduling slots.

### Option 3: Google Gemini's Storage-Rent Architecture (The True Solution)
The root flaw with Anthropic's model is coupling **cache retention time** to an **upfront token write surcharge** ($2.0\times$).
- If a developer pays $2.0\times$ for a 1-hour cache but finishes their task in 12 minutes, they overpaid.
- If a developer pays $1.25\times$ for 5 minutes and runs for 6 minutes, they are punished by a full cold re-write.

Google Gemini's model decouples them:
- Input tokens are prefilled at regular cost.
- KV cache is retained in memory for an explicit hourly rental fee ($\approx \$1.00/\text{M tokens/hr}$).
- For a 100k context held for 2 hours, storage rent is:
  $$\text{Rent} = 0.1\text{M} \times \$1.00 \times 2 = \mathbf{\$0.200}$$
- Comparing storage rent ($0.20) to Anthropic's write premiums ($0.60 per write), Gemini's storage-rent architecture is structurally far superior for agent swarms and long orchestrators.

---

## 6. Strategic Recommendations for Agent Harnesses & Practitioners

### Rule 1: Always Use 1-Hour TTL on Root Orchestrators
If an agent harness runs an orchestrator that dispatches asynchronous subagents (Pi workflows, Claude Code subagents, Herdr panes), configure the root orchestrator's system prompt and core context with `ttl: '1h'`.
- As demonstrated, a single subagent running $> 5$ minutes completely offsets the 2× write surcharge on the subsequent turn.

### Rule 2: Keep Subagents on Standard 5-Minute TTL (or Zero-Write CLI)
Subagents (workers) are ephemeral and fast-cycling. They converse in tight feedback loops ($\Delta t < 60\text{s}$) with tools and compilers. Subagents should **never** use 1-hour TTL; standard 5-minute TTL provides full cache hits without paying the $2.0\times$ write penalty.

### Rule 3: For OpenAI Codex CLI, Leverage `prompt_cache_key`
When driving Codex CLI on long-running multi-file tasks, supply an explicit `prompt_cache_key`. This guarantees prefix affinity and avoids cache evictions during extended lulls without paying any write penalty.

### Rule 4: For AGY CLI / Gemini, Aggregate Tasks to Exceed 1 Hour
Because Gemini charges a 1-hour minimum storage fee on cached contexts, never create temporary context caches for one-off tasks. Group related audits, test runs, and reviews into a single 1-hour work block to amortize the storage lease.

### Rule 5: For Grok CLI, Preserve the `x-grok-conv-id` Header
When implementing wrappers around xAI models or Grok CLI, always thread the session conversation identifier through to ensure request affinity to the warm GPU cluster.

---

## 7. Next Steps & Proposed Deliverables

1. **Benchmark Telemetry Harness (`scripts/cache-bench/`):**
   - Implement an automated telemetry script using `pi-cost` that executes an 8-stage synthetic workflow under three configurations:
     1. Standard 5-minute TTL (baseline cold reentries).
     2. Extended 1-hour TTL (`ttl: '1h'`).
     3. 5-minute TTL with synthetic 4.5-minute keepalive pings.
   - Record exact cache creation tokens, cache read tokens, latency (TTFT), and USD cost.
2. **Editorial Blog Post:**
   - Author `/blog/cache-ttl-5hr-vs-1hr-orchestration` documenting empirical receipts, worked math tables, and recommendations for the agent engineering community.
3. **Upstream Recommendations:**
   - Submit field observations to Anthropic regarding a dedicated 5-hour orchestration tier or transition toward decoupled storage-rent billing.
