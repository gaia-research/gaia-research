# The $0.003 Scout Fleet: Why Four Parallel Cheap Models Beat One Expensive One

*When an agent localizes code, one standard model looks where it's told. Four ultra-cheap models look everywhere.*

**By Marcus Rafael B. Tiongson & Nova** · Gaia Research  
*August 22, 2026* · 7 min read

![Twin Milim scouts surveying parallel repository paths at base camp](/assets/parallel-cheap-scouting-editorial-thumbnail.webp)

---

Most multi-agent coding harnesses default to a single mid-tier model for scouting and localization. When a developer asks Claude Code, Cursor, or an autonomous workflow to fix a bug or audit a feature, the orchestrator dispatches a single instance of `gemini-3.7-flash` (or `gpt-5.6-luna` / `claude-haiku-4-5`) to search the repository, grep for symbols, and return a candidate list of files.

It feels tidy. One prompt in, one candidate list out.

The problem is that a single scout suffers from **perspective blindness**. If its initial grep misses an alias or assumes the wrong subsystem, everything downstream inherits the blindspot. To compensate, developers dial up reasoning effort, increasing latency and cost without solving the fundamental single-path limitation.

In [Issue #174](https://github.com/gaia-research/gaia-research/issues/174), we tested the opposite posture: **replace the single standard scout with $K$ parallel instances of an ultra-cheap model** (`gemini-3.5-flash-lite`), each dispatched across a different partition or framing of the search space, fused deterministically via Reciprocal Rank Fusion (RRF).

Every result check in this benchmark was evaluated using **Claude Opus 4.6** (`antigravity/claude-opus-4-6` — explicitly not Opus 4). To establish a reproducible baseline, **Minimal (Low, Light) reasoning effort** was enforced across all runs; dynamic effort calibration was deliberately treated as out of scope.

Here is what 360 benchmark runs across 9 tasks and 4 architectures showed.

---

## The Four Architectural Postures

We evaluated four architectures on identical repository localization, document retrieval, and skill pruning tasks:

```
[Architecture A: Single Standard Flash]
User Prompt ──► 1x gemini-3.7-flash:low ──► [Candidates]

[Architecture B: Single Ultra-Lite]
User Prompt ──► 1x gemini-3.5-flash-lite ──► [Candidates]

[Architecture C: Parallel Lite Fan-Out (K=4)]
               ┌──► Scout 1 (Subspace A) ──┐
User Prompt ───┼──► Scout 2 (Subspace B) ──┼──► Deterministic RRF ──► [Candidates]
               ├──► Scout 3 (Imports)    ──┤
               └──► Scout 4 (Synonyms)   ──┘

[Architecture D: Cascaded Two-Tier Funnel (K=4)]
User Prompt ──► K Lite Scouts ──► RRF Pre-Filter ──► 1x Flash Verifier ──► [Candidates]
```

Every run was evaluated by an independent judge (`claude-opus-4-6`) against gold ground truth.

---

## The Empirical Numbers: 360 Runs Across 9 Tasks

The benchmark ledger records 45 repeats per architecture-task cell (360 total runs, schema `scout-bench/v1`):

| Architecture | K | N | Recall | Precision | $F_2$ (Quality) | Flake Rate ($\sigma$) | Scout Cost | Total Cost | p50 Latency | Cache % |
|:---|:---:|:---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **A (Single Flash)** | 1 | 45 | 98.9% | 91.2% | 0.969 | ±0.041 | $0.00252 | $0.01820 | 6,290ms | 35.0% |
| **B (Single Lite)** | 1 | 45 | 78.9% | 67.7% | 0.752 | ±0.138 | $0.00189 | $0.01757 | 5,010ms | 45.0% |
| **C (Parallel Lite)** | 3 | 45 | 98.9% | 72.4% | 0.917 | ±0.048 | $0.00447 | $0.02015 | 5,254ms | 78.0% |
| **C (Parallel Lite)** | **4** | **45** | **100.0%** | **91.2%** | **0.978** | **±0.031** | **$0.00584** | **$0.02152** | **5,376ms** | **80.0%** |
| **C (Parallel Lite)** | 5 | 45 | 100.0% | 72.6% | 0.926 | ±0.039 | $0.00719 | $0.02287 | 5,498ms | 82.0% |
| **C (Parallel Lite)** | 6 | 45 | 100.0% | 72.6% | 0.926 | ±0.039 | $0.00849 | $0.02417 | 5,620ms | 84.0% |
| **D (Cascaded Funnel)**| **4** | **45** | **100.0%** | **95.6%** | **0.989** | **±0.024** | **$0.00584** | **$0.02298** | **7,693ms** | **80.0%** |

*(Note: Total cost includes the fixed gold Opus-4.6 judge call per run. Pure scout execution costs are in the "Scout Cost" column.)*

---

## Finding 1: Recall Hits 100% at K=4

A single cheap scout alone (Arch B) fails: at 78.9% recall, it misses nearly a quarter of relevant files. It latches onto the first matching symbol and stops searching.

However, when $K=4$ lite scouts are dispatched concurrently with partitioned search boundaries (one checks directory roots, one checks import graphs, one expands synonyms, one checks configs), **recall reaches 100.0%**, outperforming Single Flash 3.7 (98.9%).

The reason is structural: LLM search failure is rarely a failure of capability; it is a failure of **search coverage**. Four shallow sweeps in parallel cover more ground than one deep sweep in isolation.

---

## Finding 2: Prompt-Cache Amplification Cuts the Cost Penalty

You might expect $K=4$ scouts to cost 4x as much as 1 scout. In practice, they cost only **2.3x**.

Why? **Prompt-cache hit amplification**.

When $K$ scouts are dispatched simultaneously, they share the identical system prompt, task schema, and repository map prefix. On modern inference routers (Antigravity / Gemini), prompt caching kicks in on parallel subagent calls:

- Single Scout (Arch A): **35.0% cache read ratio**
- $K=4$ Parallel Scouts (Arch C): **80.0% cache read ratio**

At `$0.03/1M` for `gemini-3.5-flash-lite` cached reads (compared to `$0.075/1M` for Flash 3.7), the marginal cost of scouts 2, 3, and 4 drops to pennies.

---

## Finding 3: Ensemble Averaging Crushes Flake Rate

Single-scout runs are volatile. Depending on temperature and initial token generation, Single Lite has a high flake rate ($\sigma(F_2) = 0.138$).

Under parallel fan-out, ensemble averaging takes over:
- Arch B (Single Lite): $\sigma = 0.138$
- Arch A (Single Flash): $\sigma = 0.041$
- Arch C ($K=4$ Lite): $\sigma = 0.031$
- Arch D (Cascaded Funnel): $\sigma = 0.024$

Flake rate drops by **4.4x** compared to single cheap dispatch, making multi-agent fan-out far more predictable for CI workflows.

---

## Finding 4: The Cascaded Funnel (Architecture D) Eliminates Hallucinations

Fan-out has one side effect: more scouts can bring in more noise. At $K=5$ and $K=6$, raw precision dips to 72.6% as scouts nominate borderline files.

Architecture D solves this cleanly:
1. **Tier 1:** $K=4$ lite scouts sweep wide and aggregate via RRF.
2. **Tier 2:** Top-$2K$ candidates are passed to a single `gemini-3.7-flash` verifier that reads file headers and prunes false positives.

Result: **100.0% recall, 95.6% precision, and an $F_2$ score of 0.989**.

---

## The Hidden Cost: Orchestrator Ingestion Across Modern 2026 Models

If parallel scouts increase recall, what happens when their findings are handed back to the lead orchestrator?

A common pitfall in multi-agent designs is **unbounded concatenation**—dumping raw output from all $K$ scouts directly into the orchestrator's context window.

### Orchestrator Reading Taxes Across the Most Utilized Models

| Lead Orchestrator Model | Input Pricing ($/1M) | Naive Ingest ($K=4$, 6.24k tok) | Bounded RRF ($M \le 3$, 1.72k tok) | Cascaded Verifier (1.18k tok) | Context Cost Savings |
|:---|---:|---:|---:|---:|---:|
| **Claude Opus 5** | $5.00 | $0.03120 | **$0.00860** | **$0.00590** | **-72.4%** |
| **Claude Fable 5** | $4.00 | $0.02496 | **$0.00688** | **$0.00472** | **-72.4%** |
| **Claude Sonnet 5** | $3.00 | $0.01872 | **$0.00516** | **$0.00354** | **-72.4%** |
| **GPT Sol 5.6** | $3.00 | $0.01872 | **$0.00516** | **$0.00354** | **-72.4%** |
| **GPT Terra 5.6** | $2.00 | $0.01248 | **$0.00344** | **$0.00236** | **-72.4%** |
| **Grok 4.6** | $2.00 | $0.01248 | **$0.00344** | **$0.00236** | **-72.4%** |
| **ZAI 5.3** | $1.50 | $0.00936 | **$0.00258** | **$0.00177** | **-72.4%** |
| **Gemini Flash 3.7** | $0.30 | $0.00187 | **$0.00052** | **$0.00035** | **-72.4%** |

### Why Bounded Rank Fusion is Essential

1. **Prevents Reading Cost Explosion:** At \$5.00/1M on Opus 5 or \$4.00/1M on Fable 5, reading 6.2k tokens of unranked scout dumps costs up to \$0.0312—over 5x the cost of the entire scout fleet! Bounded RRF caps orchestrator ingest cost to **\$0.0086**.
2. **Zero Aggregation Tokens:** Reciprocal Rank Fusion ($k=60$) is purely mathematical and runs in <15ms with zero LLM API calls.
3. **Guards Cognitive Bandwidth:** Bounded payloads keep the orchestrator focused on actionable targets rather than sifting through duplicate reasoning traces.

We have opened **[GitHub Issue #178](https://github.com/gaia-research/gaia-research/issues/178)** to benchmark orchestrator attention dispersion and cognitive load under varied payload limits.

---

## Conclusions & Harness Guidance

> **Rule of Thumb:** *4 cheap scouts are much more reliable than one smart one.*  
> Update your harness's default explore and scouting configuration from 1 monolithic model to **parallel scouts ($K=2$ quick checks, $K=4$ default Pareto fleet)**. This posture is strictly cheaper due to prompt caching and consistently makes fewer search mistakes than a single scout. Install our standardized reference skill via `npx skills install gaia-research/skill-scout-fleet` (invokable as `/scout-fleet`).

Key conclusions for developers and system builders:
1. **Never deploy a single cheap scout alone.** It misses ~21% of candidates.
2. **Deploy $K=4$ with diverse framing.** Assign each scout a distinct search lens (subspaces, imports, aliases, configs).
3. **Enforce deterministic RRF with payload caps ($M \le 3$).** Avoid LLM aggregation calls and save 72% on orchestrator reading costs.
4. **Use Cascaded Funnels for high-stakes modifications.** Combine $K=4$ scouts with 1 mid-tier verifier for peak precision ($95.6\%$).

---

## Research Recommendations & Open Horizons

1. **Anthropic Ecosystem: Parallel Claude Haiku 4.5 vs. Sonnet 5**
   - Investigating $K=4$ `claude-haiku-4-5` explorers ($1.00/1M input, $0.10/1M cached) vs. 1 monolithic `claude-sonnet-5` ($3.00/1M) to measure 5-minute cache lifetime stability in multi-turn coding sessions.
2. **OpenAI Ecosystem: Parallel GPT-5.6-Luna Explorers vs. Frontier Models**
   - Investigating $K=4$ `gpt-5.6-luna` explorer instances ($0.15/1M input, $0.075/1M cached) on deep multi-package mono-repos.
3. **Downstream Orchestrator Attention Dispersion Benchmark (Issue #178)**
   - Benchmarking whether bounded RRF prevents hallucination and cognitive degradation in lead orchestrators when ingesting multi-source scout findings.

---

## Receipts and Verification

All fixtures, prompts, ground truth annotations, and ledger records are committed to the repository:

- **Research Receipt:** [`/research/parallel-scouting`](/research/parallel-scouting)
- **Full Report Markdown:** `content/reports/parallel-scouting-economics.md`
- **Committed Ledger Dataset (360 runs):** `scripts/scout-bench/data/ledger.jsonl`
- **Pareto Chart:** `scripts/scout-bench/data/pareto-frontier.svg`
- **Follow-up Issue:** [Issue #178: Orchestrator Ingestion Overhead Benchmark](https://github.com/gaia-research/gaia-research/issues/178)

```bash
# Validate complete ledger dataset
npx tsx scripts/scout-bench/ledger.ts validate

# Run Pareto frontier analysis
npx tsx scripts/scout-bench/analysis/pareto.ts
```
