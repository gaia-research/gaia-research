# Parallel Cheap-Scout Fan-Out: Cost-Performance Pareto Frontier

- **Rank:** 20
- **Status:** Proposed Research / RFC -- **not ratified**. Nothing below overrides `founder/RATIFICATION.md`.
- **Viability:** High (all models already accessible via Antigravity routing; pi-dynamic-workflows provides parallel dispatch; pi-cost provides telemetry)
- **Potential:** Very High (directly applicable to every multi-agent orchestration pattern in the Gaia ecosystem)
- **GitHub Issue:** [#174](https://github.com/gaia-research/gaia-research/issues/174)

## What to research

Whether **parallel fan-out of ultra-cheap scout models** (`gemini-3.5-flash-lite`,
~$0.03/1M cache-read) can match or exceed the recall of a **single standard flash
scout** (`gemini-3.7-flash:low`, ~$0.075/1M cache-read) at lower total cost --
and where the **Pareto frontier** between cost and quality sits across four
architectural postures:

| Architecture | Description | Expected Cost |
|---|---|---|
| **A** (Single Standard) | 1x `gemini-3.7-flash:low` | Baseline |
| **B** (Single Ultra-Lite) | 1x `gemini-3.5-flash-lite` | ~3-10x cheaper |
| **C** (Parallel Fan-Out) | $K$ concurrent `flash-lite` scouts | $K \times$ Arch B |
| **D** (Cascaded Funnel) | $K$ lite scouts + 1 flash verifier | Arch C + verifier |

The aggregation layer is **deterministic** (Reciprocal Rank Fusion, quorum
voting, set union with structural dedup) -- no LLM call in the merge step.

## Core research questions

1. **Recall dominance:** Does parallel fan-out ($K=3\dots6$) achieve recall parity with the expensive single scout?
2. **Cost-to-performance Pareto frontier:** What is the optimal (cost, $F_2$) trade-off curve?
3. **Cascaded funnel value:** Does adding a Tier-2 precision verifier dominate both single-model architectures?
4. **Prompt-cache amplification:** Do $K$ scouts sharing a system-prompt prefix amplify cache-hit rates?
5. **Stability:** Does ensemble averaging reduce flake rate ($\sigma(F_2)$ across repeats)?
6. **Latency:** Does parallel dispatch stay within 2x of single-scout latency?

## Why now

- **All infrastructure exists:** pi-dynamic-workflows provides `parallel()` dispatch, pi-cost provides token/cost telemetry with `gemini-3.5-flash-lite` already priced in the table, and the HH Benchmark ledger pattern provides a proven append-only JSONL recording discipline.
- **The cost gap is real and growing:** `flash-lite` cache-reads are 2.5x cheaper than standard flash ($0.03 vs $0.075 per 1M tokens). For orchestration-heavy workflows where scouts are the highest-volume component, this is the largest cost lever available.
- **Multi-agent fan-out is the natural next step** after the single-scout baseline work in Skill Zero's codebase localization patterns. The question is not "should we fan out?" but "what is the optimal K and architecture?"
- **Directly informs Skill Hell's mixture-of-agents design** (D5: routing is deterministic and performance-first). The entropy curve (N13's "how quality and cost move together as skill entropy rises") needs a calibrated cost model for scout dispatch.

## What this is NOT

- **Not a gate.** This is a measurement and reporting surface, never a decision gate. Same discipline as Rank 2 (Per-Model Token-Savings Matrix).
- **Not a model comparison benchmark.** This compares **architectural patterns** (single vs. parallel vs. cascaded), not model quality in isolation.
- **Not a replacement for the HH Benchmark.** The HH Benchmark measures skill efficacy (marginal value of adding a skill). This measures scout dispatch economics (optimal cost-quality trade-off for the scouting step itself).

## Connections

- **Rank 2 (Per-Model Token-Savings Matrix):** shares the per-model measurement discipline and the "never one cross-model figure" principle.
- **D5 (Routing is deterministic):** the aggregation layer here is deterministic, same principle.
- **N13 (skill entropy curve):** this study produces one dimension of the cost side of the entropy curve.
- **HH Benchmark methodology:** the ledger schema, SHA receipt protocol, and claims-provenance gate are all inherited.
- **pi-cost skill:** provides the token accounting and cost computation infrastructure.
- **pi-dynamic-workflows:** provides the parallel dispatch mechanism for Architecture C/D.

## Deliverables

1. **Research plan:** `docs/plans/issue-parallel-cheap-scouting-bench.md` (exhaustive methodology, model cards, workflow architecture, ledger schema, task fixtures, aggregation algorithms, publication plan).
2. **Benchmark scripts:** `scripts/scout-bench/` (runner, aggregator, ledger, analysis).
3. **Research receipt:** `content/reports/parallel-scouting-economics.md` (full results, ledger-fenced claims).
4. **Blog post:** via `/gaia-blog-post` (Nova persona, Milim thumbnail, interactive SVG Pareto curves).
5. **Committed ledger:** `scripts/scout-bench/data/ledger.jsonl` (append-only, validated).

## Open questions

- **Is `flash-lite` strong enough for codebase localization?** A pilot run on 1 task will answer this before committing to the full matrix.
- **Can we measure prompt-cache hits reliably?** If `cacheRead` is consistently 0 in harness logs, RQ4 becomes unanswerable.
- **What is the right $N$ for repeats?** Starting with 5; may increase if variance is high.
- **Should the aggregator also test learned fusion?** Explicitly deferred to v2 -- v1 is deterministic algorithms only.
