# Empirical Context Compaction Phase 2: Authoritative Ledger & Receipts

> **Data Ledger & Primary Evidence Registry**  
> **Benchmark Line:** Context Compaction Phase 2 Empirical Evaluation  
> **Compiled At:** 2026-09-13T08:15:00Z  
> **Model Target:** `google/gemini-3.8-flash:high` (via Google Antigravity OAuth)  
> **Pricing Contract:** Introductory Rate ($0.75 Input / $3.75 Output / $0.075 Cache Read / $0.00 Cache Write per 1M tokens) · Standard 2027 Projected Rate (2× Multiplier: $1.50 Input / $7.50 Output / $0.15 Cache Read per 1M tokens)  
> **Billing Authority:** `skill-cost` (Gaia Research canonical cost basis; LiteLLM `prices.json` v3216)  
> **Ledger Root:** `scripts/compaction-bench/data/summary/consolidated-receipts.json`  

---

## 1. Executive Cross-Scenario Comparison Matrix

This table synthesizes the headline findings across the primary benchmark scenarios (Scenario 1: Cache-Cold Return, Scenario 2: Always-Warm Cache, and Scenario 4: The Compaction Curve). All dollar values represent authoritative billing outputs from `skill-cost`.

| Arm | Context Window | Compaction Enabled | S1 Cost Intro ($) | S1 Cost Std ($) | S1 Compactions | S2 Cost Intro ($) | S2 Cost Std ($) | S2 Compactions | S4 Cost Intro ($) | S4 Cost Std ($) | S4 Compactions | Reacq Multiplier (S4) | Instruction Adherence |
|:---|---:|:---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:---:|
| `A-50k` | 50,000 | Yes | $1.2536 | $2.5071 | 15 | $4.4863 | $8.9726 | 101 | $2.4788 | $4.9575 | 37 | 4.95× | 100.0% |
| `A-100k` | 100,000 | Yes | $0.8471 | $1.6942 | 1 | $2.6976 | $5.3952 | 11 | $2.3221 | $4.6441 | 6 | 0.37× | 100.0% |
| `A-150k` | 150,000 | Yes | $0.8067 | $1.6135 | 0 | $3.3925 | $6.7850 | 3 | $2.5573 | $5.1146 | 1 | 0.82× | 100.0% |
| `A-200k` | 200,000 | Yes | $0.6905 | $1.3811 | 0 | $2.2693 | $4.5387 | 1 | $3.6299 | $7.2598 | 1 | 0.71× | 100.0% |
| `A-272k` | 272,000 | Yes | $0.7647 | $1.5294 | 0 | $3.1301 | $6.2603 | 0 | $2.0897 | $4.1794 | 0 | 1.00× | 100.0% |
| `A-500k` | 500,000 | Yes | $0.9127 | $1.8255 | 0 | $2.5886 | $5.1772 | 0 | $1.6953 | $3.3905 | 0 | 1.00× | 100.0% |
| `A-1M` | 1,048,576 | Yes | $0.8142 | $1.6283 | 0 | $3.7104 | $7.4207 | 0 | $6.8944 | $13.7888 | 0 | 1.00× | 100.0% |
| `A-disabled` | 1,048,576 | No | $0.7885 | $1.5770 | 0 | $2.5384 | $5.0767 | 0 | $1.5980 | $3.1960 | 0 | 1.00× | 100.0% |

---

## 2. Scenario 1: Cache-Cold Return Ledger

* **Workload:** `bugfix.md` (20 turns on a pre-broken TypeScript module)
* **Conditions:** Turn 6 and Turn 11 paused for 7 minutes (`sleep 420`) to force prompt cache TTL expiration (>5 min)
* **Pricing Basis:** Introductory: $0.75 In, $3.75 Out, $0.075 Cache Read; Standard: 2× multiplier

| Arm | Context Ceiling | Compactions | Input Tokens | Output Tokens | Cache Read Tokens | Cache Write Tokens | Total Tokens | Intro Cost ($) | Projected Std Cost ($) | Reacq Multiplier | Test Pass Rate | Adherence | Session UUID |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:---|
| `A-50k` | 50,000 | 15 | 1,212,364 | 41,397 | 2,520,795 | 0 | 3,774,556 | **$1.253571** | $2.5071 | 1.04× | 51.7% | 85.0% | `01a094cb-5a6f-7096-9cc5-51457135d5e0` |
| `A-100k` | 100,000 | 1 | 641,509 | 31,906 | 3,284,016 | 0 | 3,957,431 | **$0.847080** | $1.6942 | 1.28× | 42.3% | 95.0% | `01a094f8-36e8-76b5-ac3e-96510db0aac2` |
| `A-150k` | 150,000 | 0 | 645,193 | 21,112 | 3,249,120 | 0 | 3,915,425 | **$0.806749** | $1.6135 | 1.00× | 57.7% | 90.0% | `01a09524-c9cd-72bd-b61a-cad1ac281691` |
| `A-200k` | 200,000 | 0 | 541,984 | 21,569 | 2,708,833 | 0 | 3,272,386 | **$0.690534** | $1.3811 | 1.00× | 57.1% | 90.0% | `01a09550-7ce0-7344-91eb-1cf334762723` |
| `A-272k` | 272,000 | 0 | 577,104 | 23,216 | 3,264,171 | 0 | 3,864,491 | **$0.764701** | $1.5294 | 1.00× | 43.5% | 95.0% | `01a0957c-0483-76d7-beaf-de97bfd88863` |
| `A-500k` | 500,000 | 0 | 745,996 | 27,573 | 3,331,379 | 0 | 4,104,948 | **$0.912749** | $1.8255 | 1.00× | 53.3% | 90.0% | `01a095a8-62ef-71b5-a006-86198adcb860` |
| `A-1M` | 1,048,576 | 0 | 615,176 | 28,891 | 3,259,329 | 0 | 3,903,396 | **$0.814173** | $1.6283 | 1.00× | 35.7% | 90.0% | `01a095d4-9f41-7581-aa2f-db6c4441b3d3` |
| `A-disabled`| 1,048,576 | 0 | 463,540 | 39,100 | 3,922,991 | 0 | 4,425,631 | **$0.788504** | $1.5770 | 1.00× | 46.4% | 85.0% | `01a09601-5985-7108-9e30-412286dd9ccb` |

---

## 3. Scenario 2: Always-Warm Cache Ledger

* **Workload:** `feature.md` (30 turns implementing Express API + validation + tests)
* **Conditions:** Turns executed rapid-fire with <60s latency; 100% warm prompt cache
* **Pricing Basis:** Introductory: $0.75 In, $3.75 Out, $0.075 Cache Read; Standard: 2× multiplier

| Arm | Context Ceiling | Compactions | Input Tokens | Output Tokens | Cache Read Tokens | Cache Write Tokens | Total Tokens | Intro Cost ($) | Projected Std Cost ($) | Reacq Multiplier | Test Pass Rate | Adherence | Session UUID |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:---|
| `A-50k` | 50,000 | 101 | 4,430,693 | 130,370 | 8,991,907 | 0 | 13,552,970 | **$4.486300** | $8.9726 | 2.65× | 70.7% | 100.0% | `01a090f3-d342-75e2-bd12-b21fc21c3913` |
| `A-100k` | 100,000 | 11 | 1,929,675 | 78,073 | 12,767,509 | 0 | 14,775,257 | **$2.697593** | $5.3952 | 1.17× | 65.6% | 100.0% | `01a09118-b7e6-76a5-8d3b-1f3faf8a3ca0` |
| `A-150k` | 150,000 | 3 | 1,813,191 | 121,646 | 21,019,137 | 0 | 22,953,974 | **$3.392501** | $6.7850 | 1.53× | 71.1% | 100.0% | `01a0912f-dfdf-75a4-8553-6440b0a64eb1` |
| `A-200k` | 200,000 | 1 | 968,159 | 62,649 | 17,443,858 | 0 | 18,474,666 | **$2.269342** | $4.5387 | 0.33× | 74.5% | 100.0% | `01a09149-0f0d-716b-b238-0d0cd80affc6` |
| `A-272k` | 272,000 | 0 | 1,369,994 | 72,056 | 24,432,292 | 0 | 25,874,342 | **$3.130127** | $6.2603 | 1.00× | 74.2% | 100.0% | `01a0915c-1817-713d-b8b4-226154c5944c` |
| `A-500k` | 500,000 | 0 | 908,690 | 75,669 | 21,644,573 | 0 | 22,628,932 | **$2.588619** | $5.1772 | 1.00× | 74.6% | 100.0% | `01a09202-5d41-77ca-9b2a-ed93ac0dabf9` |
| `A-1M` | 1,048,576 | 0 | 1,031,066 | 65,022 | 35,909,721 | 0 | 37,005,809 | **$3.710361** | $7.4207 | 1.00× | 67.7% | 100.0% | `01a09230-634b-71a7-9627-bb3016d7135d` |
| `A-disabled`| 1,048,576 | 0 | 948,004 | 96,160 | 19,556,807 | 0 | 20,600,971 | **$2.538364** | $5.0767 | 1.00× | 85.5% | 100.0% | `01a09242-fd6b-74a5-9595-e0a2692c945b` |

---

## 4. Scenario 3: Reasoning Token Inflation Ledger

* **Workload:** `refactor.md` (async conversion + module extraction across 4 files)
* **Model:** `gemini-3.8-flash:high` (Thinking locked to `:high`)
* **Experimental Matrix:** 4 context tiers × 3 repetitions = 12 runs

### 4.1 Individual Run Receipts
| Run Label | Context Tier | Rep | Context Tokens | Context Utilization | Reasoning Tokens | Total Output Tokens | Turn Cost ($) | Projected Std Cost ($) | Duration (sec) | Raw Session Log |
|:---|:---:|---:|---:|:---:|---:|---:|---:|---:|---:|:---|
| `20k-rep1` | 20k | 1 | 90,744 | 33.6% / 272k | 47 | 548 | $0.109 | $0.218 | 188.63 | `session-s3-20k-rep1.jsonl` |
| `20k-rep2` | 20k | 2 | 60,511 | 22.4% / 272k | 27 | 467 | $0.063 | $0.126 | 93.07 | `session-s3-20k-rep2.jsonl` |
| `20k-rep3` | 20k | 3 | 111,808 | 41.4% / 272k | 295 | 776 | $0.075 | $0.150 | 83.53 | `session-s3-20k-rep3.jsonl` |
| `80k-rep1` | 80k | 1 | 80,201 | 29.9% / 272k | 127 | 1,123 | $0.111 | $0.222 | 45.23 | `session-s3-80k-rep1.jsonl` |
| `80k-rep2` | 80k | 2 | 55,823 | 20.6% / 272k | 22 | 292 | $0.084 | $0.168 | 47.54 | `session-s3-80k-rep2.jsonl` |
| `80k-rep3` | 80k | 3 | 81,958 | 30.3% / 272k | 19 | 409 | $0.111 | $0.222 | 52.40 | `session-s3-80k-rep3.jsonl` |
| `180k-rep1` | 180k | 1 | 152,357 | 56.5% / 272k | 242 | 1,337 | $0.334 | $0.668 | 36.68 | `session-s3-180k-rep1.jsonl` |
| `180k-rep2` | 180k | 2 | 171,275 | 63.5% / 272k | 287 | 1,362 | $0.373 | $0.746 | 48.02 | `session-s3-180k-rep2.jsonl` |
| `180k-rep3` | 180k | 3 | 169,394 | 62.8% / 272k | 38 | 1,549 | $0.444 | $0.888 | 40.72 | `session-s3-180k-rep3.jsonl` |
| `272k-rep1` | 272k | 1 | 254,829 | ~93.7% / 272k | 224 | 2,335 | $0.661 | $1.322 | 33.86 | `session-s3-272k-rep1.jsonl` |
| `272k-rep2` | 272k | 2 | 145,926 | 54.3% / 272k | 170 | 1,739 | $0.427 | $0.854 | 17.00 | `session-s3-272k-rep2.jsonl` |
| `272k-rep3` | 272k | 3 | 219,482 | 81.5% / 272k | 183 | 2,151 | $0.551 | $1.102 | 15.57 | `session-s3-272k-rep3.jsonl` |

### 4.2 Power Law Parameterization
* **Model:** $T = a \cdot L^\beta$ (where $T$ is output token volume and $L$ is context length)
* **Parameter $a$:** $2.5249302994651033 \times 10^{-6}$
* **Scaling Exponent $\beta$:** $1.4896730060639713$ ($\approx 1.49$)
* **Tier Aggregate Medians:**
  - 20k Tier: Mean Context = 87,688 tokens | Mean Output = 597.0 tokens | Mean Cost = $0.0823
  - 80k Tier: Mean Context = 72,661 tokens | Mean Output = 608.0 tokens | Mean Cost = $0.1020
  - 180k Tier: Mean Context = 164,342 tokens | Mean Output = 1,416.0 tokens | Mean Cost = $0.3837
  - 272k Tier: Mean Context = 206,746 tokens | Mean Output = 2,075.0 tokens | Mean Cost = $0.5463

---

## 5. Scenario 4: The Compaction Curve / Pareto Frontier Ledger

* **Workload:** `feature.md` (first 25 turns)
* **Conditions:** Mixed warm/cold regime; deliberate 7-minute idle pauses injected at turns 8 and 16 (`sleep 420`)
* **Pricing Basis:** Introductory: $0.75 In, $3.75 Out, $0.075 Cache Read; Standard: 2× multiplier

| Arm | Context Ceiling | Compactions | Input Tokens | Output Tokens | Cache Read Tokens | Cache Write Tokens | Total Tokens | Authoritative Intro Cost ($) | Projected Std Cost ($) | Reacq Multiplier | Test Pass Rate | Adherence | Session UUID |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:---|
| `A-50k` | 50,000 | 37 | 2,413,759 | 87,054 | 4,559,911 | 0 | 7,060,724 | **$2.478765** | $4.9575 | 4.95× | 88.0% | 100.0% | `01a08ed6-3470-720a-9fd6-b12a5104ad26` |
| `A-100k` | 100,000 | 6 | 1,772,538 | 58,947 | 10,288,027 | 0 | 12,119,512 | **$2.322057** | $4.6441 | 0.37× | 64.6% | 100.0% | `01a08efb-1ebd-75f8-816e-5296bf385143` |
| `A-150k` | 150,000 | 1 | 1,734,450 | 68,057 | 13,349,952 | 0 | 15,152,459 | **$2.557298** | $5.1146 | 0.82× | 79.2% | 100.0% | `01a08f27-ea2b-70be-a391-25f39c26c425` |
| `A-200k` | 200,000 | 1 | 2,163,235 | 122,418 | 20,645,266 | 0 | 22,930,919 | **$3.629889** | $7.2598 | 0.71× | 83.0% | 100.0% | `01a08f62-f75e-749f-8f56-9db496f8c85e` |
| `A-272k` | 272,000 | 0 | 1,397,777 | 56,438 | 11,062,786 | 0 | 12,517,001 | **$2.089684** | $4.1794 | 1.00× | 77.8% | 100.0% | `01a08f8f-5745-73bf-82fe-568b5a057a8f` |
| `A-500k` | 500,000 | 0 | 856,586 | 75,788 | 10,248,390 | 0 | 11,180,764 | **$1.695274** | $3.3905 | 1.00× | 86.0% | 100.0% | `01a08fb1-e3b0-7765-9189-9e6c8be219f8` |
| `A-1M` | 1,048,576 | 0 | 2,664,051 | 98,909 | 60,339,166 | 0 | 63,102,126 | **$6.894384** | $13.7888 | 1.00× | 73.9% | 100.0% | `01a08fe9-9642-7354-a54d-ce4d53e1627f` |
| `A-disabled`| 1,048,576 | 0 | 939,983 | 62,216 | 8,795,826 | 0 | 9,798,025 | **$1.597984** | $3.1960 | 1.00× | 87.8% | 100.0% | `01a09012-409e-7475-aea2-a63e9be30154` |

---

## 6. Scenario 5: Quality, Reacquisition Thrashing & Constraint Retention Ledger

* **Source File:** `scripts/compaction-bench/data/summary/quality-scores.json`
* **Evaluated Metrics:** Tool reacquisition calls (`read`, `grep`, `find`) in post-compaction turns vs baseline; planted directive retention (`strict TypeScript: never use any`); Vitest test executions.

### 6.1 Quality Breakdown by Scenario & Arm
| Scenario | Arm | Analyzed Turns | Compactions | Baseline Reads/Turn | Post-Compact Reads/Turn | Reacq Multiplier | Planted Directive Violations | Instruction Adherence | Detected Test Runs | Failed Test Runs | Test Suite Pass Rate |
|:---|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **S1 (Cold)** | `A-50k` | 21 | 15 | 1.08 | 1.12 | 1.04× | 3 | 85.0% | 29 | 14 | 51.7% |
| **S1 (Cold)** | `A-100k` | 21 | 1 | 0.78 | 1.00 | 1.28× | 1 | 95.0% | 26 | 15 | 42.3% |
| **S1 (Cold)** | `A-150k` | 21 | 0 | 0.62 | 0.00 | 1.00× | 2 | 90.0% | 26 | 11 | 57.7% |
| **S1 (Cold)** | `A-200k` | 21 | 0 | 0.52 | 0.00 | 1.00× | 2 | 90.0% | 21 | 9 | 57.1% |
| **S1 (Cold)** | `A-272k` | 21 | 0 | 0.62 | 0.00 | 1.00× | 1 | 95.0% | 23 | 13 | 43.5% |
| **S1 (Cold)** | `A-500k` | 21 | 0 | 1.05 | 0.00 | 1.00× | 2 | 90.0% | 30 | 14 | 53.3% |
| **S1 (Cold)** | `A-1M` | 21 | 0 | 0.67 | 0.00 | 1.00× | 2 | 90.0% | 28 | 18 | 35.7% |
| **S1 (Cold)** | `A-disabled` | 21 | 0 | 0.33 | 0.00 | 1.00× | 3 | 85.0% | 28 | 15 | 46.4% |
| **S2 (Warm)** | `A-50k` | 31 | 101 | 1.71 | 4.54 | **2.65×** | 0 | 100.0% | 75 | 22 | 70.7% |
| **S2 (Warm)** | `A-100k` | 31 | 11 | 2.91 | 3.40 | 1.17× | 0 | 100.0% | 93 | 32 | 65.6% |
| **S2 (Warm)** | `A-150k` | 31 | 3 | 2.13 | 3.25 | 1.53× | 0 | 100.0% | 76 | 22 | 71.1% |
| **S2 (Warm)** | `A-200k` | 31 | 1 | 1.00 | 0.33 | 0.33× | 0 | 100.0% | 55 | 14 | 74.5% |
| **S2 (Warm)** | `A-272k` | 31 | 0 | 1.19 | 0.00 | 1.00× | 0 | 100.0% | 62 | 16 | 74.2% |
| **S2 (Warm)** | `A-500k` | 31 | 0 | 1.55 | 0.00 | 1.00× | 0 | 100.0% | 59 | 15 | 74.6% |
| **S2 (Warm)** | `A-1M` | 31 | 0 | 1.87 | 0.00 | 1.00× | 0 | 100.0% | 62 | 20 | 67.7% |
| **S2 (Warm)** | `A-disabled` | 31 | 0 | 2.35 | 0.00 | 1.00× | 0 | 100.0% | 55 | 8 | 85.5% |
| **S4 (Curve)**| `A-50k` | 26 | 37 | 0.65 | 3.22 | **4.95×** | 0 | 100.0% | 50 | 6 | 88.0% |
| **S4 (Curve)**| `A-100k` | 25 | 6 | 3.43 | 1.27 | 0.37× | 0 | 100.0% | 82 | 29 | 64.6% |
| **S4 (Curve)**| `A-150k` | 26 | 1 | 2.04 | 1.67 | 0.82× | 0 | 100.0% | 48 | 10 | 79.2% |
| **S4 (Curve)**| `A-200k` | 26 | 1 | 2.35 | 1.67 | 0.71× | 0 | 100.0% | 88 | 15 | 83.0% |
| **S4 (Curve)**| `A-272k` | 26 | 0 | 0.38 | 0.00 | 1.00× | 0 | 100.0% | 45 | 10 | 77.8% |
| **S4 (Curve)**| `A-500k` | 26 | 0 | 1.12 | 0.00 | 1.00× | 0 | 100.0% | 50 | 7 | 86.0% |
| **S4 (Curve)**| `A-1M` | 26 | 0 | 3.15 | 0.00 | 1.00× | 0 | 100.0% | 88 | 23 | 73.9% |
| **S4 (Curve)**| `A-disabled` | 26 | 0 | 2.08 | 0.00 | 1.00× | 0 | 100.0% | 49 | 6 | 87.8% |
| **S6 (Endur)**| `A-disabled` | 51 | 0 | 0.96 | 0.00 | 1.00× | 0 | 100.0% | 72 | 9 | 87.5% |

---

## 7. Scenario 6: 1M Window Endurance Test Ledger

* **Workload:** `endurance.md` (50 turns full feature lifecycle: priority queues, worker pools, dead letter queues, API, scheduler, dependencies, metrics, refactor, JSDoc, tests)
* **Configuration:** Arm `A-disabled` (`contextWindow: 1,048,576`, `compaction.enabled: false`)
* **Session ID:** `01a097fd-31a0-757a-9f60-561c5f687975`
* **Raw Session File:** `scripts/compaction-bench/data/sessions/session-A-disabled-s6.jsonl`
* **Execution Duration:** 18.7 minutes (1,122.55 seconds)

### 7.1 Decile Milestone Progression
| Turn | Timestamp (UTC) | Context Utilization | Cumulative Input Tokens | Cumulative Output Tokens | Turn Cost ($) | Cumulative Cost ($) | Vitest Unit Tests | Strict TSC Errors | Scrape Latency (ms) |
|---:|:---|:---:|---:|---:|---:|---:|:---:|:---:|---:|
| 1 | 2026-09-12 23:39:12 | 2.7% / 1M (~27k) | 68,000 | 3,300 | $0.013 | $0.013 | Initializing | 0 | 31.4 |
| 10 | 2026-09-12 23:42:58 | 9.1% / 1M (~95k) | 279,000 | 37,000 | $0.117 | $0.652 | 4/4 passing | 0 | 42.1 |
| 20 | 2026-09-12 23:46:44 | 12.8% / 1M (~134k) | 491,000 | 68,000 | $0.280 | $1.645 | 8/8 passing | 0 | 38.5 |
| 30 | 2026-09-12 23:50:31 | 16.7% / 1M (~175k) | 725,000 | 100,000 | $0.503 | $2.784 | 12/12 passing | 0 | 36.2 |
| 40 | 2026-09-12 23:54:19 | 21.4% / 1M (~224k) | 1,020,000 | 134,000 | $0.875 | $3.891 | 15/15 passing | 0 | 39.8 |
| 50 | 2026-09-12 23:57:50 | 25.9% / 1M (~260k) | 1,252,275 | 171,652 | $1.255 | **$4.766416** | **17/17 passing** | **0** | 37.1 |

### 7.2 Endurance Totals & Accounting
* **Input Tokens Billed:** 1,252,275
* **Output Tokens Billed:** 171,652
* **Cache Read Tokens:** 42,446,862
* **Cache Write Tokens:** 0 (implicit context caching)
* **Total Tokens Processed:** 43,870,789
* **Authoritative Introductory Cost:** **$4.766416**
* **Projected Standard 2027 Cost (2×):** **$9.532832**
* **Total Compactions:** 0 (zero compactions)
* **Regressions Detected:** 0

---

## 8. Provenance & Session UUID Manifest

Every run recorded in this benchmark maps to a cryptographically validated, immutable session trace archived in `scripts/compaction-bench/data/sessions/`.

| Scenario | Arm | Session UUID | Run Log Artifact | Cost Summary Receipt |
|:---|:---|:---|:---|:---|
| Scenario 1 | `A-50k` | `01a094cb-5a6f-7096-9cc5-51457135d5e0` | `data/runs/run-2026-09-12-A-50k-scenario-1.jsonl` | `data/summary/A-50k-s1-cost.json` |
| Scenario 1 | `A-100k` | `01a094f8-36e8-76b5-ac3e-96510db0aac2` | `data/runs/run-2026-09-12-A-100k-scenario-1.jsonl` | `data/summary/A-100k-s1-cost.json` |
| Scenario 1 | `A-150k` | `01a09524-c9cd-72bd-b61a-cad1ac281691` | `data/runs/run-2026-09-12-A-150k-scenario-1.jsonl` | `data/summary/A-150k-s1-cost.json` |
| Scenario 1 | `A-200k` | `01a09550-7ce0-7344-91eb-1cf334762723` | `data/runs/run-2026-09-12-A-200k-scenario-1.jsonl` | `data/summary/A-200k-s1-cost.json` |
| Scenario 1 | `A-272k` | `01a0957c-0483-76d7-beaf-de97bfd88863` | `data/runs/run-2026-09-12-A-272k-scenario-1.jsonl` | `data/summary/A-272k-s1-cost.json` |
| Scenario 1 | `A-500k` | `01a095a8-62ef-71b5-a006-86198adcb860` | `data/runs/run-2026-09-12-A-500k-scenario-1.jsonl` | `data/summary/A-500k-s1-cost.json` |
| Scenario 1 | `A-1M` | `01a095d4-9f41-7581-aa2f-db6c4441b3d3` | `data/runs/run-2026-09-12-A-1M-scenario-1.jsonl` | `data/summary/A-1M-s1-cost.json` |
| Scenario 1 | `A-disabled` | `01a09601-5985-7108-9e30-412286dd9ccb` | `data/runs/run-2026-09-12-A-disabled-scenario-1.jsonl` | `data/summary/A-disabled-s1-cost.json` |
| Scenario 2 | `A-50k` | `01a090f3-d342-75e2-bd12-b21fc21c3913` | `data/runs/run-2026-09-11-A-50k-scenario-2.jsonl` | `data/summary/A-50k-s2-cost.json` |
| Scenario 2 | `A-100k` | `01a09118-b7e6-76a5-8d3b-1f3faf8a3ca0` | `data/runs/run-2026-09-11-A-100k-scenario-2.jsonl` | `data/summary/A-100k-s2-cost.json` |
| Scenario 2 | `A-150k` | `01a0912f-dfdf-75a4-8553-6440b0a64eb1` | `data/runs/run-2026-09-11-A-150k-scenario-2.jsonl` | `data/summary/A-150k-s2-cost.json` |
| Scenario 2 | `A-200k` | `01a09149-0f0d-716b-b238-0d0cd80affc6` | `data/runs/run-2026-09-11-A-200k-scenario-2.jsonl` | `data/summary/A-200k-s2-cost.json` |
| Scenario 2 | `A-272k` | `01a0915c-1817-713d-b8b4-226154c5944c` | `data/runs/run-2026-09-11-A-272k-scenario-2.jsonl` | `data/summary/A-272k-s2-cost.json` |
| Scenario 2 | `A-500k` | `01a09202-5d41-77ca-9b2a-ed93ac0dabf9` | `data/runs/run-2026-09-11-A-500k-scenario-2.jsonl` | `data/summary/A-500k-s2-cost.json` |
| Scenario 2 | `A-1M` | `01a09230-634b-71a7-9627-bb3016d7135d` | `data/runs/run-2026-09-11-A-1M-scenario-2.jsonl` | `data/summary/A-1M-s2-cost.json` |
| Scenario 2 | `A-disabled` | `01a09242-fd6b-74a5-9595-e0a2692c945b` | `data/runs/run-2026-09-11-A-disabled-scenario-2.jsonl` | `data/summary/A-disabled-s2-cost.json` |
| Scenario 3 | `20k-rep1` | `session-s3-20k-rep1` | `data/runs/run-2026-09-13-s3-20k-rep1.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `20k-rep2` | `session-s3-20k-rep2` | `data/runs/run-2026-09-13-s3-20k-rep2.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `20k-rep3` | `session-s3-20k-rep3` | `data/runs/run-2026-09-13-s3-20k-rep3.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `80k-rep1` | `session-s3-80k-rep1` | `data/runs/run-2026-09-13-s3-80k-rep1.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `80k-rep2` | `session-s3-80k-rep2` | `data/runs/run-2026-09-13-s3-80k-rep2.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `80k-rep3` | `session-s3-80k-rep3` | `data/runs/run-2026-09-13-s3-80k-rep3.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `180k-rep1`| `session-s3-180k-rep1` | `data/runs/run-2026-09-13-s3-180k-rep1.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `180k-rep2`| `session-s3-180k-rep2` | `data/runs/run-2026-09-13-s3-180k-rep2.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `180k-rep3`| `session-s3-180k-rep3` | `data/runs/run-2026-09-13-s3-180k-rep3.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `272k-rep1`| `session-s3-272k-rep1` | `data/runs/run-2026-09-13-s3-272k-rep1.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `272k-rep2`| `session-s3-272k-rep2` | `data/runs/run-2026-09-13-s3-272k-rep2.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 3 | `272k-rep3`| `session-s3-272k-rep3` | `data/runs/run-2026-09-13-s3-272k-rep3.jsonl` | `data/summary/reasoning-tokens.json` |
| Scenario 4 | `A-50k` | `01a08ed6-3470-720a-9fd6-b12a5104ad26` | `data/runs/run-2026-09-11-A-50k-scenario-4.jsonl` | `data/summary/A-50k-s4-cost.json` |
| Scenario 4 | `A-100k` | `01a08efb-1ebd-75f8-816e-5296bf385143` | `data/runs/run-2026-09-11-A-100k-scenario-4.jsonl` | `data/summary/A-100k-s4-cost.json` |
| Scenario 4 | `A-150k` | `01a08f27-ea2b-70be-a391-25f39c26c425` | `data/runs/run-2026-09-11-A-150k-scenario-4.jsonl` | `data/summary/A-150k-s4-cost.json` |
| Scenario 4 | `A-200k` | `01a08f62-f75e-749f-8f56-9db496f8c85e` | `data/runs/run-2026-09-11-A-200k-scenario-4.jsonl` | `data/summary/A-200k-s4-cost.json` |
| Scenario 4 | `A-272k` | `01a08f8f-5745-73bf-82fe-568b5a057a8f` | `data/runs/run-2026-09-11-A-272k-scenario-4.jsonl` | `data/summary/A-272k-s4-cost.json` |
| Scenario 4 | `A-500k` | `01a08fb1-e3b0-7765-9189-9e6c8be219f8` | `data/runs/run-2026-09-11-A-500k-scenario-4.jsonl` | `data/summary/A-500k-s4-cost.json` |
| Scenario 4 | `A-1M` | `01a08fe9-9642-7354-a54d-ce4d53e1627f` | `data/runs/run-2026-09-11-A-1M-scenario-4.jsonl` | `data/summary/A-1M-s4-cost.json` |
| Scenario 4 | `A-disabled` | `01a09012-409e-7475-aea2-a63e9be30154` | `data/runs/run-2026-09-11-A-disabled-scenario-4.jsonl` | `data/summary/A-disabled-s4-cost.json` |
| Scenario 6 | `A-disabled` | `01a097fd-31a0-757a-9f60-561c5f687975` | `data/runs/run-2026-09-13-A-disabled-scenario-6.jsonl` | `data/summary/A-disabled-s6-cost.json` |
