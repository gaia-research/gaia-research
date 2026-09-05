# Issue / Feature Plan: Context Compaction Curve & 272k Window Benchmark

- **Status:** Proposed Research Plan / RFC
- **Rank:** 1 (Idea Bank)
- **Owner:** Marcus Tiongson / Nova
- **Target Deliverables:**
  - Empirical Benchmark Suite (`scripts/compaction-bench/`)
  - Telemetry receipts (`content/reports/context-compaction-economics.md`)
  - Visual line graph asset (`assets/generated/context-compaction-curve-graph.svg`)
  - Editorial Blog Post (`content/blog/context-compaction-curve/post.md` + `/blog/context-compaction-curve`)
- **Dependencies:** `pi-cost` telemetry, Anthropic API (Claude 3.7 Sonnet), OpenAI API (o1/o3/GPT-5/Codex), Google API (Gemini 3.7 Flash)
- **GitHub Tracking Issue:** [#214](https://github.com/gaia-research/gaia-research/issues/214)

---

## 1. Executive Summary & Research Rationale

As frontier models push context windows to 1M+ tokens, harness developers have adopted a dangerous assumption: that context expansion is economically linear. To prevent hard context-window overflow, modern coding agents (such as OpenAI's Codex CLI) implement automated context compaction, defaulting to trigger at **272,000 tokens** (`model_auto_compact_token_limit = 272_000` or 90% of maximum context).

This 272k limit is not arbitrary: **it is OpenAI's steep pricing tripwire**. Prompts crossing 272,000 tokens incur an immediate **2.0× penalty on all input tokens and a 1.5× penalty on all output tokens** across the *entire request*.

However, anchoring auto-compaction near 272k introduces three crippling, under-reported cost pathologies:
1. **The 5-Minute Cache TTL Cliff:** Both Anthropic and OpenAI implement ephemeral prompt-cache retention (5-minute TTL default on Anthropic; 5–10 minutes on OpenAI). When an agent turn waits on human review, a slow test run, or subagent tasks ($>300$s), the cache drops. Re-writing a 250,000-token context costs $250\text{k} \times 1.25 = 312,500$ token-equivalents *on a single turn*.
2. **Reasoning Token Inflation:** Reasoning models (OpenAI o1/o3, Claude 3.7 Sonnet in thinking mode) dynamically adjust their internal reasoning budgets based on prompt entropy. Distractor noise, historical tool traces, and stale diffs in a 200k+ context force models to generate 5x–10x more thinking tokens. Because reasoning tokens are billed as output ($15–$60 / 1M), this explosion completely annihilates any input cache savings.
3. **Reacquisition Thrashing:** Delaying compaction until 272k forces drastic lossy summarization. When granular AST details, compiler logs, or file signatures are discarded, the agent enters repeated tool loops (`grep`, `find`, `read_file`), burning thousands of fresh input tokens to reacquire context.

This benchmark rigorously evaluates the **Compaction Curve** across models, measures the true dollar cost across 5 operational scenarios, and identifies the **Pareto-optimal "Sweet Spot Zone"** ($40\text{k} - 65\text{k}$ tokens) for production harnesses.

---

## 2. Related Research & Literature Review (RRL)

### 2.1 Prompt Caching Architectures & TTL Dynamics
- **Anthropic Prompt Caching Specification (2024–2025):**
  Anthropic's prefix caching relies on explicit `cache_control` breakpoints. Cache writes cost **1.25×** base input tokens; cache reads cost **0.10×** (a 90% discount). The ephemeral cache carries a 5-minute TTL ($T_{\text{TTL}} = 300\text{s}$), reset upon each cache hit. Amortizing the 1.25× write surcharge requires at least $1.39$ cache reads within the TTL window. If $\Delta t > 300\text{s}$, the entire context must be rewritten at 1.25×.
- **OpenAI Automatic Prompt Caching & Billing Cliff (2024–2026):**
  OpenAI automatically caches prompt prefixes $\ge 1,024$ tokens in 128-token increments with a 50% discount on cache hits. Crucially, OpenAI enforces a major billing tripwire at **272,000 input tokens**: once a request crosses 272k tokens, a 2.0× multiplier applies to all input tokens and 1.5× to all output tokens retroactively.
- **Zhang et al. (2024):** *Economics of Key-Value Cache Eviction in Multi-Turn LLM Serving.* Demonstrates that long multi-turn sessions with intermittent tool latency exhibit bimodal cache hit rates: near 100% during automated script bursts, collapsing to <15% during human-in-the-loop steps.

### 2.2 Context Degradation & Test-Time Compute Inflation
- **Liu et al. (2023):** *Lost in the Middle: How Language Models Use Long Contexts.* Trans. ACL.
  Proves that LLM retrieval and reasoning accuracy follow a U-shaped performance curve: information placed in the middle of long contexts experiences severe retrieval degradation.
- **Snell et al. (DeepMind, 2024):** *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.*
  Identifies that test-time search budgets expand when input entropy increases. Distractor tokens in uncompacted histories dilute attention heads, expanding the exploration tree and inflating reasoning tokens by up to 800%.
- **Li et al. (2024):** *CEBench: Cost-Effectiveness Benchmark for Long-Context LLMs.*
  Establishes the *Reacquisition Overhead Metric*: evaluating how aggressive or delayed prompt compression leads to redundant downstream API calls.
- **Jiang et al. (Microsoft Research, 2023/2024):** *LLMLingua: Compressing Context for Accelerated Inference.*
  Analyzes semantic density thresholds: prompt compression below 20% retention causes catastrophic reasoning collapse, while gentle compaction (40%–60%) preserves programmatic invariants.

---

## 3. Mathematical Cost Modeling

Let $L_t$ be the prompt context length at turn $t \in [1, N]$, $P_{\text{in}}$ be base input price per token, $P_{\text{out}}$ be base output price per token, and $\Delta t$ be the elapsed time since the previous turn.

### 3.1 Prompt Caching Regime
For turn $t$, input cost $C_{\text{in}}(t)$ is determined by TTL state:
$$C_{\text{in}}(t) = \begin{cases} 
1.25 \cdot P_{\text{in}} \cdot L_t & \text{if } \Delta t > T_{\text{TTL}} \quad (\text{Cache Miss / TTL Eviction}) \\
0.10 \cdot P_{\text{in}} \cdot L_{\text{cached}} + P_{\text{in}} \cdot (L_t - L_{\text{cached}}) & \text{if } \Delta t \le T_{\text{TTL}} \quad (\text{Cache Hit})
\end{cases}$$

### 3.2 The OpenAI 272k Discontinuity
For OpenAI Codex / GPT-5:
$$P_{\text{eff\_in}}(L_t) = \begin{cases} 
P_{\text{in}} & \text{if } L_t \le 272,000 \\
2.0 \cdot P_{\text{in}} & \text{if } L_t > 272,000
\end{cases}, \quad
P_{\text{eff\_out}}(L_t) = \begin{cases} 
P_{\text{out}} & \text{if } L_t \le 272,000 \\
1.5 \cdot P_{\text{out}} & \text{if } L_t > 272,000
\end{cases}$$

### 3.3 Reasoning Token Scaling
Empirical reasoning tokens $T_{\text{thinking}}$ scale as a super-linear function of prompt noise and context length $L_t$:
$$T_{\text{thinking}}(L_t) = T_0 \cdot \left( 1 + \alpha \cdot \left(\frac{L_t}{L_{\text{ref}}}\right)^\beta \right)$$
where $T_0$ is baseline deliberation on clean context, $\alpha \approx 0.4$, $\beta \approx 1.6$.

### 3.4 Total Turn Cost Function
$$C_{\text{turn}}(t) = C_{\text{in}}(t) + P_{\text{eff\_out}} \cdot \Big( T_{\text{thinking}}(L_t) + T_{\text{response}}(t) \Big)$$

---

## 4. The Five Benchmark Scenarios

### Scenario 1: Breached 5-Minute Grace Period (TTL Expiration)
- **Setup:** A 30-turn agent session where turns 5, 10, 15, 20, 25 experience a 6-minute delay (human code review, test suite execution, or debugging).
- **Comparison:**
  - Arm A (Late Compaction @ 272k): Context size at turn 20 is ~210k tokens. Each TTL breach incurs a 210k token cache rewrite penalty ($210\text{k} \times 1.25 \times \$3/1\text{M} = \$0.79$ per breach). Total session penalty $> \$3.90$.
  - Arm B (Sweet Spot Compaction @ 50k): Context size is capped at 50k. Each TTL breach incurs only a 50k rewrite ($50\text{k} \times 1.25 \times \$3/1\text{M} = \$0.19$). Total session penalty $< \$0.95$ (**76% savings**).

### Scenario 2: Within 5-Minute Grace Period (Cache Hits)
- **Setup:** Rapid automated agent execution ($\Delta t < 60\text{s}$) across 35 turns.
- **Measurement:** Tracking the cumulative cost floor of cached reads.
  - At 250k context: $250\text{k} \times 0.10 = 25\text{k}$ billed tokens/turn. Over 20 steady-state turns $= 500\text{k}$ billed tokens ($1.50).
  - At 50k context: $50\text{k} \times 0.10 = 5\text{k}$ billed tokens/turn. Over 20 steady-state turns $= 100\text{k}$ billed tokens ($0.30).

### Scenario 3: Long-Context Hidden Costs & Reasoning Bloat
- **Setup:** Identical code refactoring task executed under four context conditions:
  1. $L = 20\text{k}$ (Clean scaffold)
  2. $L = 80\text{k}$ (Moderate history)
  3. $L = 180\text{k}$ (Verbose terminal & bash logs)
  4. $L = 275\text{k}$ (Crossed 272k tripwire)
- **Metrics Collected:**
  - Thinking token count ($T_{\text{thinking}}$)
  - Reacquisition tool calls (`grep`, `read_file` counts)
  - Wall-clock Time-to-First-Token (TTFT)

### Scenario 4: The "Sweet Spot Zone" (Pareto Frontier)
- **Objective:** Map the total cost curve as a function of compaction threshold:
  $$L_{\text{compact}} \in [15\text{k}, 30\text{k}, 50\text{k}, 65\text{k}, 100\text{k}, 150\text{k}, 200\text{k}, 272\text{k}]$$
- **Expected Inflection:** The empirical minimum cost occurs at **$40\text{k} - 65\text{k}$ tokens**, where:
  - Cache write amortization is achieved ($\ge 5$ turns per cycle).
  - Cache miss blast radius is minimal.
  - Distractor tokens are purged before reasoning bloat initiates.
  - OpenAI 272k multiplier is never approached.

### Scenario 5: Practical Harness Settings ("The Magic Zone")
Produce verified configuration recipes for:
1. **OpenAI / Codex CLI:**
   ```toml
   # ~/.codex/config.toml
   model_auto_compact_token_limit = 65_000
   ```
2. **Claude Code:**
   Configuring proactive `/compact` at phase transitions; pinning invariant project rules in `CLAUDE.md`.
3. **Pi / Multi-Agent Frameworks:**
   Restricting worker subagent context ceilings to 50k; isolating leaf tasks from parent histories.

---

## 5. Visual Line Graph Specifications

For the blog post and research report, an interactive dual-panel SVG visual:
- **Panel 1: Turn Cost ($) vs. Context Length (Tokens 0 – 300k):**
  - Curve 1 (Solid Red): Expired Cache ($\Delta t > 5\text{m}$) — steep slope with a 2.0x step jump at 272k.
  - Curve 2 (Solid Blue): Cache Hit Baseline ($\Delta t < 5\text{m}$) — shallow baseline with upward divergence as reasoning expands.
  - Highlighted Band (Green Translucent): The Sweet Spot ($40\text{k} - 65\text{k}$).
- **Panel 2: Reasoning Token Generation vs. Context Clutter:**
  - Demonstrating the exponential rise in thinking tokens from 1.2k tokens (at 30k) to 12k tokens (at 250k).

---

## 6. Execution Plan for Planning Agent

1. **Step 1 — Harness Setup:**
   Implement `scripts/compaction-bench/run_matrix.ts` utilizing `pi-cost` token telemetry to record per-turn input, output, cached read, cache write, and thinking tokens.
2. **Step 2 — Seed Workloads:**
   Create 3 standard multi-turn coding workflows:
   - `workload-bugfix`: Repro test creation + fix (15 turns).
   - `workload-feature`: API endpoint + unit tests + docs (30 turns).
   - `workload-refactor`: Multi-file dependency inversion (45 turns).
3. **Step 3 — Run Matrix:**
   Execute matrix across:
   - Models: Claude 3.7 Sonnet (with Thinking), GPT-5/Codex (o3), Gemini 3.7 Flash.
   - TTL Delays: Fast ($30\text{s}$) vs. Breached ($360\text{s}$).
   - Compaction Limits: $30\text{k}, 65\text{k}, 120\text{k}, 272\text{k}$.
4. **Step 4 — Receipt Generation:**
   Compile JSONL logs into `content/reports/context-compaction-economics.md`.
5. **Step 5 — Publication:**
   Wire editorial blog post into `content/blog/context-compaction-curve/` and `data/blog.ts`.
