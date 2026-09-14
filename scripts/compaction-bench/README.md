# Context Compaction Phase 2 — Benchmark Suite

Empirical benchmark measuring the cost and quality effects of context
compaction at different thresholds in coding agent sessions.

**Umbrella issue:** [#222](https://github.com/gaia-research/gaia-research/issues/222)
**Plan:** [`docs/plans/context-compaction-phase-2/PLAN.md`](../../docs/plans/context-compaction-phase-2/PLAN.md)

## Quick Start

1. Read `orchestrator-brief.md` — the complete dispatch brief
2. Run the pre-flight checklist
3. Execute arms in the recommended order

## Structure

```
config/              models.json overrides for each autocompact threshold
workloads/           Turn-by-turn prompts for each workload type
fixtures/            Pre-built repos the agent works against
data/runs/           Per-turn tick JSONL (raw telemetry)
data/sessions/       Archived pi session JSONLs
data/summary/        Compiled results (cost curve, quality scores)
orchestrator-brief.md  THE dispatch document — read this first
```

## Harness

- **pi** → `antigravity/gemini-3.8-flash:high`
- Orchestrated via **herdr** pane dispatch
- Cost measured by **gaia-research/skill-cost**
