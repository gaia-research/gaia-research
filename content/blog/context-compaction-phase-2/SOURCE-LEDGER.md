# Source Ledger — The Empirical Compaction Curve (Phase 2)

Empirical benchmark execution completed: 2026-09-13.
Model under test: `antigravity/gemini-3.8-flash:high`
Harness: `pi` v0.85.1
Orchestration: Herdr workspace `w7:t3` / `w7:t8`
PR: [#237](https://github.com/gaia-research/gaia-research/pull/237) (`bench/context-compaction-phase-2`)
Parent Issue: [#222](https://github.com/gaia-research/gaia-research/issues/222)
Billing Basis: Introductory rates ($0.75 input, $3.75 output, $0.075 cache read per 1M tokens) from `skill-cost` (`/Users/marcotiongson/skill-cost/prices.json` via BerriAI/litellm).

---

## 1. Primary Source: Scenario 4 — Compaction Curve / Pareto Frontier

- **Workload:** `scripts/compaction-bench/workloads/feature.md` (25 turns, forced cold cache idles at turns 8 and 16 via `sleep 420`).
- **Data File:** `scripts/compaction-bench/data/summary/cost-curve.json` and `scripts/compaction-bench/data/summary/consolidated-receipts.json`.

| Arm | Window | Compactions | Input Tokens | Cache Read Tokens | Output Tokens | Total Tokens | Cost (USD) | Session ID | Run Ticks Log |
|---|---|---|---|---|---|---|---|---|---|
| A-50k | 50,000 | 37 | 2,413,759 | 4,559,911 | 87,054 | 7,060,724 | $2.478765 | `01a08ed6-3470-720a-9fd6-b12a5104ad26` | `scripts/compaction-bench/data/runs/run-2026-09-11-A-50k-scenario-4.jsonl` |
| A-100k | 100,000 | 6 | 1,772,538 | 10,288,027 | 58,947 | 12,119,512 | $2.322057 | `01a08efb-1ebd-75f8-816e-5296bf385143` | `scripts/compaction-bench/data/runs/run-2026-09-11-A-100k-scenario-4.jsonl` |
| A-150k | 150,000 | 1 | 1,734,450 | 13,349,952 | 68,057 | 15,152,459 | $2.557298 | `01a08f27-ea2b-70be-a391-25f39c26c425` | `scripts/compaction-bench/data/runs/run-2026-09-11-A-150k-scenario-4.jsonl` |
| A-200k | 200,000 | 1 | 2,163,235 | 20,645,266 | 122,418 | 22,930,919 | $3.629889 | `01a08f62-f75e-749f-8f56-9db496f8c85e` | `scripts/compaction-bench/data/runs/run-2026-09-11-A-200k-scenario-4.jsonl` |
| A-272k | 272,000 | 0 | 1,397,777 | 11,062,786 | 56,438 | 12,517,001 | $2.089684 | `01a08f8f-5745-73bf-82fe-568b5a057a8f` | `scripts/compaction-bench/data/runs/run-2026-09-11-A-272k-scenario-4.jsonl` |
| A-500k | 500,000 | 0 | 856,586 | 10,248,390 | 75,788 | 11,180,764 | $1.695274 | `01a08fb1-e3b0-7765-9189-9e6c8be219f8` | `scripts/compaction-bench/data/runs/run-2026-09-11-A-500k-scenario-4.jsonl` |
| A-1M | 1,048,576 | 0 | 2,664,051 | 60,339,166 | 98,909 | 63,102,126 | $6.894384 | `01a08fe9-9642-7354-a54d-ce4d53e1627f` | `scripts/compaction-bench/data/runs/run-2026-09-11-A-1M-scenario-4.jsonl` |
| A-disabled | 1,048,576 | 0 | 939,983 | 8,795,826 | 62,216 | 9,798,025 | $1.597984 | `01a09012-409e-7475-aea2-a63e9be30154` | `scripts/compaction-bench/data/runs/run-2026-09-11-A-disabled-scenario-4.jsonl` |

**Derived Math:**
- A-50k cost ($2.478765) vs A-disabled cost ($1.597984):
  $$\frac{2.478765 - 1.597984}{1.597984} = +55.118\% \approx +55\%$$
- A-50k incurred 37 compactions; A-disabled incurred 0.

---

## 2. Primary Source: Scenario 2 — Always-Warm Execution

- **Workload:** `scripts/compaction-bench/workloads/feature.md` (30 turns, 0s delay between turns, warm KV prefix throughout).
- **Data File:** `scripts/compaction-bench/data/summary/scenario-2-summary.json`, `scripts/compaction-bench/data/summary/A-50k-s2-cost.json`, `scripts/compaction-bench/data/summary/A-200k-s2-cost.json`, `scripts/compaction-bench/data/summary/A-disabled-s2-cost.json`.

| Arm | Window | Compactions | Input Tokens | Cache Read Tokens | Output Tokens | Total Tokens | Cost (USD) | Session ID |
|---|---|---|---|---|---|---|---|---|
| A-50k | 50,000 | **101** | 4,430,693 | 8,991,907 | 130,370 | 13,552,970 | **$4.486300** | `01a090f3-d342-75e2-bd12-b21fc21c3913` |
| A-100k | 100,000 | 11 | 1,929,675 | 12,767,509 | 78,073 | 14,775,257 | $2.697593 | `01a09118-b7e6-76a5-8d3b-1f3faf8a3ca0` |
| A-150k | 150,000 | 3 | 1,813,191 | 21,019,137 | 121,646 | 22,953,974 | $3.392501 | `01a0912f-dfdf-75a4-8553-6440b0a64eb1` |
| A-200k | 200,000 | **1** | 968,159 | 17,443,858 | 62,649 | 18,474,666 | **$2.269342** | `01a09149-0f0d-716b-b238-0d0cd80affc6` |
| A-272k | 272,000 | 0 | 1,369,994 | 24,432,292 | 72,056 | 25,874,342 | $3.130127 | `01a0915c-1817-713d-b8b4-226154c5944c` |
| A-500k | 500,000 | 0 | 908,690 | 21,644,573 | 75,669 | 22,628,932 | $2.588619 | `01a09202-5d41-77ca-9b2a-ed93ac0dabf9` |
| A-1M | 1,048,576 | 0 | 1,031,066 | 35,909,721 | 65,022 | 37,005,809 | $3.710361 | `01a09230-634b-71a7-9627-bb3016d7135d` |
| A-disabled | 1,048,576 | **0** | 948,004 | 19,556,807 | 96,160 | 20,600,971 | **$2.538364** | `01a09242-fd6b-74a5-9595-e0a2692c945b` |

**Derived Math:**
- A-50k ($4.486300) vs A-200k ($2.269342):
  $$\frac{4.486300 - 2.269342}{2.269342} = +97.691\% \approx +98\%$$
- 101 compactions on A-50k across 30 turns = 3.37 compactions/turn.

---

## 3. Primary Source: Scenario 5 — Reacquisition Multipliers & Code Quality

- **Evaluation Script:** `scripts/compaction-bench/analyze_quality.py`
- **Data File:** `scripts/compaction-bench/data/summary/quality-scores.json`

**Reacquisition Tool Call Surge (read, grep, find in 3 turns post-compaction vs baseline):**
- Scenario 4, Arm A-50k:
  - Baseline reads per turn: `0.65`
  - Post-compaction reads per turn: `3.22`
  - Reacquisition multiplier: `4.95×`
  - Peak single-window multiplier: `6.08×` (`quality-scores.json` line 380: `"peak_multiplier_s4": 6.08`)
- Scenario 2, Arm A-50k:
  - Baseline reads per turn: `1.71`
  - Post-compaction reads per turn: `4.54`
  - Reacquisition multiplier: `2.65×`
  - Peak single-window multiplier: `3.03×` (`quality-scores.json` line 381: `"peak_multiplier_s2": 3.03`)
- Higher ceiling arms (A-200k, A-272k, A-disabled):
  - Multipliers $\le 1.00$ (no thrashing).

**Directive Retention & Test Suite Pass Rate:**
- Planted constraint: strict TypeScript mode, zero `any` types.
- Directive violations across all arms in Scenarios 2, 4, 6: `0` (100.0% adherence rate).
- Final test suite status: 100.0% passing (zero unhandled regressions across completed tasks).

---

## 4. Primary Source: Scenario 3 — Reasoning Token Scaling

- **Workload:** `scripts/compaction-bench/workloads/refactor.md` across 4 context history sizes (20k, 80k, 180k, 272k) × 3 repetitions (12 runs).
- **Data File:** `scripts/compaction-bench/data/summary/reasoning-tokens.json`
- **Power Law Fit:**
  $$T = a \cdot L^\beta$$
  - $a = 2.5249302994651033 \times 10^{-6}$
  - $\beta = 1.4896730060639713 \approx 1.49$
  - Equation: $T = 2.525 \times 10^{-6} \cdot L^{1.49}$

**All 12 Empirical Run Receipts:**

| Run Label | Context Size | Rep | Context Tokens ($L$) | Reasoning Tokens ($T$) | Output Tokens | Turn Cost | Duration (s) | Session / Log File |
|---|---|---|---|---|---|---|---|---|
| 20k-rep1 | 20k | 1 | 90,744 | 47 | 548 | $0.109 | 188.63 | `run-2026-09-13-s3-20k-rep1.json` |
| 20k-rep2 | 20k | 2 | 60,511 | 27 | 467 | $0.063 | 93.07 | `run-2026-09-13-s3-20k-rep2.json` |
| 20k-rep3 | 20k | 3 | 111,808 | 295 | 776 | $0.075 | 83.53 | `run-2026-09-13-s3-20k-rep3.json` |
| 80k-rep1 | 80k | 1 | 80,201 | 127 | 1,123 | $0.111 | 45.23 | `run-2026-09-13-s3-80k-rep1.json` |
| 80k-rep2 | 80k | 2 | 55,823 | 22 | 292 | $0.084 | 47.54 | `run-2026-09-13-s3-80k-rep2.json` |
| 80k-rep3 | 80k | 3 | 81,958 | 19 | 409 | $0.111 | 52.40 | `run-2026-09-13-s3-80k-rep3.json` |
| 180k-rep1 | 180k | 1 | 152,357 | 242 | 1,337 | $0.334 | 36.68 | `run-2026-09-13-s3-180k-rep1.json` |
| 180k-rep2 | 180k | 2 | 171,275 | 287 | 1,362 | $0.373 | 48.02 | `run-2026-09-13-s3-180k-rep2.json` |
| 180k-rep3 | 180k | 3 | 169,394 | 38 | 1,549 | $0.444 | 40.72 | `run-2026-09-13-s3-180k-rep3.json` |
| 272k-rep1 | 272k | 1 | 254,829 | 224 | 2,335 | $0.661 | 33.86 | `run-2026-09-13-s3-272k-rep1.json` |
| 272k-rep2 | 272k | 2 | 145,926 | 170 | 1,739 | $0.427 | 17.00 | `run-2026-09-13-s3-272k-rep2.json` |
| 272k-rep3 | 272k | 3 | 219,482 | 183 | 2,151 | $0.551 | 15.57 | `run-2026-09-13-s3-272k-rep3.json` |

---

## 5. Primary Source: Scenario 6 — 1M Window Endurance Test

- **Workload:** `scripts/compaction-bench/workloads/endurance.md` (50 turns full feature lifecycle).
- **Arm:** `A-disabled` (`contextWindow: 1048576`, `compaction.enabled: false`).
- **Data Files:**
  - Cost Summary: `scripts/compaction-bench/data/summary/A-disabled-s6-cost.json`
  - Fast-Log Run Ticks: `scripts/compaction-bench/data/runs/run-2026-09-13-A-disabled-scenario-6.jsonl`
  - Session JSONL: `scripts/compaction-bench/data/sessions/session-A-disabled-s6.jsonl`
  - Cron Log: `scripts/compaction-bench/scenario6-cron.log`
- **Session ID:** `01a097fd-31a0-757a-9f60-561c5f687975`
- **Execution Timestamp:** `2026-09-12T23:39:08.065Z` to `2026-09-12T23:57:50.617Z` (~18.7 minutes).
- **Exact Measurements:**
  - Input tokens: `1,252,275`
  - Cache read tokens: `42,446,862`
  - Output tokens: `171,652`
  - Total tokens: `43,870,789`
  - Cache Read Percentage: `42,446,862 / 43,870,789 = 96.75%`
  - Authoritative cost: `$4.766416` (~$4.77)
  - Compactions: `0`
  - Test Suite Result: 17/17 vitest unit tests passing, strict `tsc --noEmit` 0 errors.
  - Context window utilization: reached 25.9% of 1,048,576 tokens (~260k tokens) by turn 50.
