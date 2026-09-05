# Context Compaction Curve & 272k Window Benchmark Suite

**Tracking Issue:** [#214](https://github.com/gaia-research/gaia-research/issues/214)  
**Plan Specification:** [`docs/plans/issue-context-compaction-curve-bench.md`](../../docs/plans/issue-context-compaction-curve-bench.md)  
**Idea Bank Entry:** [`docs/idea-bank/blog-idea-context-compaction-curve-economics.md`](../../docs/idea-bank/blog-idea-context-compaction-curve-economics.md)

---

## Overview

This directory houses the empirical benchmark harness, telemetry collector, and ledger for investigating the cost dynamics of context growth, the OpenAI 272k billing cliff, prompt caching TTL expiration penalties, and reasoning token inflation.

### Scenarios Measured
1. **Breached 5-Min Grace Period:** Quantifying the 1.25x rewrite penalty when turn delays exceed $300$s.
2. **In-Grace Cache Hits:** Cumulative cost floors of continuous 90% discounted cached reads across 30+ turns.
3. **Long-Context Hidden Costs:** Distractor-induced reasoning token inflation and crossing OpenAI's 272k 2.0x input / 1.5x output surcharge.
4. **The Sweet Spot Zone:** Mapping the empirical minimum of the cost-per-turn U-curve ($40\text{k} - 65\text{k}$ tokens).
5. **Harness Recipes:** Verified configurations for Codex CLI (`model_auto_compact_token_limit`), Claude Code, and Pi.

### Components
- `types.ts` — Typed data models for runs, turns, and pricing tiers.
- `run-matrix.ts` — Matrix runner across models, delays, and compaction thresholds.
- `data/` — Append-only JSONL run telemetry.
- `analysis/` — Pareto curve generator and SVG line graph exporter.
