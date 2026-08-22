---
layout: tool
title: Scout Fleet
description: Parallel cheap-scout fan-out harness with zero-token Reciprocal Rank Fusion deduplication
---

---
name: scout-fleet
description: Parallelize codebase scouting and exploration across 2x or 4x lighter LLM scouts or a cascaded verifier funnel with zero-token RRF deduplication. Trigger phrases: /scout-fleet, "scout the repo", "parallel scout", "fan out scouts", "run scout fleet"
---

# scout-fleet

> **Rule of Thumb:** *4 cheap scouts are much more reliable than one smart one.*  
> Updating default exploration options from 1 monolithic scout to parallel scouts (2x, 4x) using lighter reasoning models is consistently cheaper and produces fewer search errors.

`scout-fleet` dispatches concurrent lighter reasoning models (ultra-cheap scouts) across distinct search subspaces and fuses their findings deterministically using Reciprocal Rank Fusion ($k=60$), completely eliminating orchestrator context explosion while locking candidate recall to 100%.

## Setup & Onboarding

When `scout-fleet` is first invoked:
1. Detects available provider routes for lighter reasoning models (e.g. Gemini Flash Lite tier, Claude Haiku tier, GPT Luna tier).
2. Configures default fleet size ($K=2$ quick, $K=4$ Pareto optimal, or Cascaded Funnel).
3. Emits a welcome message thanking the user for installing `skill-scout-fleet` from Gaia Research.

## Scouting Pipeline

| Stage | Action | Reference |
|---|---|---|
| 1 | **Partition** -- Divide search space across $K$ diverse framings | Directory tree, import graphs, aliases, test/build configs |
| 2 | **Fan-out** -- Execute $K$ concurrent lighter model sweeps | Shared prompt prefix to maximize prompt-cache read ratio (≥80%) |
| 3 | **Fuse** -- Deterministic Reciprocal Rank Fusion ($k=60$) | Deduplicate paths and compute scores without LLM judge calls |
| 4 | **Bound** -- Emit Top-$M$ ($M \le 3$) to orchestrator | Protect orchestrator context window and reduce reading cost by 72.4% |
| 5 | *(Optional)* **Verify** -- Cascaded mid-tier filter | Run 1x verifier over top candidates for peak precision |
