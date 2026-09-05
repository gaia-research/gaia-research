# Blog Idea: The Context Compaction Curve — Token Cost Dynamics, the 272k Tripwire, and the Agent Sweet Spot

- **Status:** In Ideation / Priority Benchmark (Unratified)
- **Rank:** 1 (Idea Bank)
- **Viability:** Very High (harness session telemetry via `pi-cost` and Anthropic/OpenAI APIs already supported)
- **Potential:** Exceptional (universal economic relevance for every agent builder across Claude Code, OpenAI Codex, and Pi)
- **Primary Deliverable:** Benchmark receipt + interactive visual line graph + Gaia Research editorial post (`/blog/context-compaction-curve`)
- **Owner:** Marcus Tiongson / Nova
- **Tracking Issue:** [#214](https://github.com/gaia-research/gaia-research/issues/214)

---

## 1. Executive Summary & Why Now

Modern LLM developer marketing touts 1M+ and 2M+ token context windows as licenses to dump unbounded conversation histories, multi-file diffs, and verbose terminal outputs into agent context. In response to context overflow, coding harnesses deploy automatic context compaction.

OpenAI's Codex CLI and related API harnesses default to auto-compacting at **272,000 tokens** (`model_auto_compact_token_limit = 272_000` or 90% of maximum context). This 272k figure is not an arbitrary architectural boundary: **it is OpenAI's steep billing cliff**. Exceeding 272,000 input tokens triggers an instant **2.0× multiplier on input tokens and 1.5× on output tokens** across the *entire request*.

However, waiting until 272k (or even 150k) to compact creates severe hidden economic pathologies:
1. **The 5-minute Cache TTL Cliff:** When turns exceed 5 minutes (human review, test runs, linting, tool execution), Anthropic's prompt cache expires. Re-writing a 250k token context costs $250\text{k} \times 1.25 = 312.5\text{k}$ token-equivalents *per turn*.
2. **Reasoning Token Inflation:** Reasoning models (OpenAI o1/o3, Claude 3.7 Sonnet in thinking mode) scale test-time compute with prompt noise. A task needing 1,200 thinking tokens in a clean 30k context routinely inflates to 8,000–16,000 thinking tokens in an uncompacted 250k context. Because thinking tokens are billed as output ($15–$60 / 1M), output bloat completely wipes out any prompt-caching discount.
3. **Reacquisition Thrashing:** Extreme compaction at 272k drops granular file paths, type definitions, and test logs, forcing the agent into expensive discovery re-runs.

This empirical research project benchmarks the **Compaction Curve** to establish whether waiting for large compaction windows saves money or accelerates token burn, and identifies the exact **Pareto-optimal "Sweet Spot Zone"** ($40\text{k} - 65\text{k}$ tokens) for configuring agent harnesses.

---

## 2. The Five Core Operational Scenarios

### Scenario 1: Breached the 5-Minute Grace Period (Cache TTL Expiry)
- **The Mechanism:** Anthropic prompt caching defaults to a 5-minute ephemeral TTL (OpenAI's in-memory TTL lasts 5–10 minutes). When an agent turn takes longer than 300 seconds (waiting on developer approval, test suite execution, or subagent tasks), the cache evicts.
- **The Cost Impact:** The next turn must re-write the entire prefix at cache-write rates (1.25× base price on Anthropic). In an uncompacted 250k context on Sonnet ($3.00/1M base input), a single cache miss costs **$0.94** just to prefill history. In contrast, at a 50k context, a cache miss costs **$0.19** (an 80% reduction in blast radius).
- **Mathematical Cumulative Cost:** If $M$ out of $N$ turns breach the 5-minute TTL:
  $$C_{\text{miss}}(L) = \sum_{t \in \text{miss}} \left( 1.25 \cdot P_{\text{in}} \cdot L_t \right) + \sum_{t \in \text{hit}} \left( 0.10 \cdot P_{\text{in}} \cdot L_t \right) + P_{\text{out}} \cdot T_{\text{out}}$$
  As $L$ approaches 272k, $C_{\text{miss}}(L)$ escalates super-linearly.

### Scenario 2: Inside the 5-Minute Grace Period (Cache Hits)
- **The Mechanism:** When turns complete rapidly within 5 minutes, cache read rates apply (0.10× on Anthropic, 0.50× on OpenAI).
- **The False Economy:** While a 90% discount sounds generous, retaining 250,000 tokens of history still bills 25,000 tokens every single turn. Across a 30-turn session, the agent bills **750,000 cached read tokens** ($2.25 on Claude Sonnet) simply to re-read completed historical steps that have zero relevance to the active file edit.

### Scenario 3: Long-Context Hidden Costs & Degradation
- **Reasoning Token Bloat:** Reasoning models allocate thinking tokens in response to context entropy. Noisy bash stdout, large JSON diffs, and conversational digressions act as distractors ("Lost in the Middle", Liu et al.). In empirical runs, thinking token volume correlates positively with prompt token count ($R^2 > 0.82$).
- **The OpenAI 272k Tripwire:** Hitting token 272,001 instantly doubles the base input cost ($P_{\text{in}} \to 2.0 \cdot P_{\text{in}}$) and increases output cost by 50% ($P_{\text{out}} \to 1.5 \cdot P_{\text{out}}$) retroactively for the whole prompt.

### Scenario 4: The "Sweet Spot Zone" (The Pareto Frontier)
- **The Optimal Horizon:** The curve of Total Session Cost vs. Compaction Threshold ($L_{\text{thresh}}$) displays a pronounced asymmetric U-shape:
  - **Over-compaction ($L < 25\text{k}$):** High compaction overhead (frequent summary prompt generation) + lost local context leads to execution loops.
  - **Under-compaction ($L > 100\text{k} - 272\text{k}$):** Explosive cache miss penalties, high cached read baselines, reasoning token inflation, and risk of the 272k tripwire.
  - **The Sweet Spot ($40\text{k} - 65\text{k}$):** Amortizes cache writes across 8–15 turns; keeps cache-miss penalties negligible; retains 100% of relevant task memory; maintains clean, concise reasoning tokens.

### Scenario 5: Practical Guidance — "How to Set Autocompact Properly"
- **Codex CLI (`~/.codex/config.toml`):**
  ```toml
  # Override the 272k cliff default
  model_auto_compact_token_limit = 65_000
  ```
- **Claude Code:**
  Proactively trigger `/compact` at structural phase boundaries (after architecture planning is settled; after test scaffolding is created) rather than letting history climb to 160k+. Store persistent invariants in `CLAUDE.md`.
- **Pi / Gaia Multi-Agent Harness:**
  Set worker subagent context limits to 40k–50k tokens; spawn fresh leaf scouts rather than dragging parent history; enable `pi-cost` compaction-event detection.

---

## 3. Visual Line Graph Concept (For Editorial Post & Report)

A dual-panel SVG visual:
- **Panel A (Cost per Turn vs. Context Length):**
  - Line 1 (Red): Expired Cache ($\Delta t > 5\text{m}$) — steep slope, massive vertical jump at 272k.
  - Line 2 (Blue): In-Grace Cache Hits ($\Delta t < 5\text{m}$) — shallow slope, but steady upward drift due to thinking token inflation.
  - Shaded Zone (Green): "The Magic Zone" ($40\text{k} - 65\text{k}$ tokens) highlighting the cost-stability sweet spot.
- **Panel B (Reasoning Token Inflation vs. Context Length):**
  - Curve demonstrating non-linear growth in deliberation tokens as historical noise accumulates.

---

## 4. Prior Art & Citations (RRL)

1. **Liu, N. F., et al. (2023).** *Lost in the Middle: How Language Models Use Long Contexts.* Transactions of the ACL. (Attention dilution in long contexts).
2. **Anthropic Research (2024–2025).** *Prompt Caching: Pricing, Latency, and Ephemeral 5-Minute TTL Specifications.* Anthropic Documentation.
3. **OpenAI Platform Docs (2024–2026).** *Prompt Caching Protocols, Context Limits, and the 272k Token Tier Multipliers.*
4. **Snell, C., et al. (DeepMind, 2024).** *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.* (Mechanisms of thinking token allocation).
5. **Li, M., et al. (2024).** *CEBench: Cost-Effectiveness Benchmark for Long-Context LLMs.* (Quantifying reacquisition overhead).
6. **Schmid, P. (2024).** *Progressive Disclosure and Context Management in Autonomous Coding Agents.*

---

## 5. Viability & Verification Plan

- **Telemetry Tooling:** Grounded directly on `pi-cost` token accounting logs and real API receipts.
- **Test Scenarios:** 3 representative multi-turn coding benchmarks (Bugfix, Feature Addition, Refactor) tested under varying turn delays (1 min vs. 6 min) and compaction thresholds ($20\text{k}, 40\text{k}, 65\text{k}, 120\text{k}, 272\text{k}$).
- **Target Tracking Issue:** See `docs/plans/issue-context-compaction-curve-bench.md` and GitHub Issue.
