# Context Compaction Phase 2 — Orchestrator State & Protocol Checkpoint

**Document Purpose:** Durable, compaction-resilient operational ledger for the Phase 2 empirical benchmark. If this orchestrator session undergoes context compaction, this file guarantees instant, zero-loss state recovery.

**Active PR:** [#237](https://github.com/gaia-research/gaia-research/pull/237) (`bench/context-compaction-phase-2`)
**Umbrella Issue:** [#222](https://github.com/gaia-research/gaia-research/issues/222)
**Sub-Issues:** [#223–#235](https://github.com/gaia-research/gaia-research/issues)
**Merged Precursor:** [#236](https://github.com/gaia-research/gaia-research/pull/236) (merged into `main` at `d1aea2f`)

---

## 1. Verified Infrastructure & Handles

- **Orchestrator Pane:** `w7:p3` in Workspace `w7`, Tab `w7:t3` ("Research")
- **Archive Tab:** `w7:t8` ("Archive")
- **Harness & Model:** `pi` (v0.85.1) running `antigravity/gemini-3.8-flash:high`
- **Sandbox Generator:** `scripts/compaction-bench/sandbox/create-sandbox.sh`
- **Pricing:** Introductory rate ($0.75/$3.75/1M), Cache read $0.075/1M. Projected standard pricing = 2× introductory.

---

## 2. Fast-Logging & Archival Protocol (Ratified)

### Per-Turn Fast Logging (<10ms latency)
During active workload turns, do **NOT** invoke `cost.py` (which scans disk across hundreds of historical sessions). Instead:
1. Prompt agent: `herdr agent prompt <NAME> "<PROMPT>" --wait --timeout 300000`
2. Scrape status bar immediately:
   ```bash
   herdr agent read <NAME> --source recent-unwrapped --lines 12
   ```
3. Parse regex tokens directly from TUI status line:
   - `context_pct`: `([0-9.]+%/[0-9]+[kM]?|\(\?%/[0-9]+[kM]?\))` (e.g. `11.3%/100k`)
   - `tokens_in`: `[↑^]([0-9.]+[kM]?)` (e.g. `↑11k`)
   - `tokens_out`: `[↓v]([0-9.]+[kM]?)` (e.g. `↓246`)
   - `turn_cost`: `\$([0-9.]+)` (e.g. `$0.001`)
   - `compaction`: `Compacted from [0-9,]+ tokens`
   - `cache_miss`: `Cache miss after [^\n]+`
4. Append tick JSON to `scripts/compaction-bench/data/runs/run-YYYY-MM-DD-${ARM}-scenario-${SCENARIO}.jsonl`.

### Arm Completion ("Done" State)
Only when all turns of an arm are finished:
1. Extract `SESSION_ID` from the agent session path:
   `SESSION_ID=$(basename "$SESSION_PATH" .jsonl | sed 's/.*_//')`
   **Safety invariant:** Assert `[ -n "$SESSION_ID" ]` before querying `cost.py`.
2. Copy session JSONL to `scripts/compaction-bench/data/sessions/session-${ARM}-s${SCENARIO}.jsonl`.
3. Run `skill-cost` once for authoritative billing totals:
   `python3 ~/skill-cost/cost.py --session "$SESSION_ID" --json > scripts/compaction-bench/data/summary/${ARM}-s${SCENARIO}-cost.json`
4. **Archive Pane:** Move the finished pane into Archive tab `w7:t8`:
   `herdr pane move "$ARM_PANE" --tab "w7:t8" --split down --no-focus`
   Never close finished benchmark panes — they are primary evidence.
5. Clean up temporary worktree and sandbox.

---

## 3. The 8 Arms (Independent Variable)

| Arm | `contextWindow` | Config Override |
|---|---|---|
| A-50k | 50,000 | `scripts/compaction-bench/config/models-arm-50k.json` |
| A-100k | 100,000 | `scripts/compaction-bench/config/models-arm-100k.json` |
| A-150k | 150,000 | `scripts/compaction-bench/config/models-arm-150k.json` |
| A-200k | 200,000 | `scripts/compaction-bench/config/models-arm-200k.json` |
| A-272k | 272,000 | `scripts/compaction-bench/config/models-arm-272k.json` (baseline) |
| A-500k | 500,000 | `scripts/compaction-bench/config/models-arm-500k.json` |
| A-1M | 1,048,576 | `scripts/compaction-bench/config/models-arm-1M.json` |
| A-disabled | 1,048,576 | `compaction.enabled = false` |

---

## 4. The 6 Benchmark Scenarios

1. **Scenario 1 (Cache-Cold Return):** Workload `bugfix.md` (20 turns). Turns 6 and 11 have 7-min idles (`sleep 420`) to force cache TTL expiration.
2. **Scenario 2 (Always-Warm):** Workload `feature.md` (30 turns). Zero idle delays between turns.
3. **Scenario 3 (Reasoning Token Inflation):** Workload `refactor.md` across 4 context history sizes (20k, 80k, 180k, 272k) × 3 reps.
4. **Scenario 4 (Compaction Curve / Headline):** Workload `feature.md` (first 25 turns). Deliberate idles at turns 8 and 16 (`sleep 420`). All 8 arms.
5. **Scenario 5 (Code Quality vs Timing):** Post-hoc evaluation of test suites, reacquisition tool calls, and instruction retention.
6. **Scenario 6 (1M Endurance):** Workload `endurance.md` (50 turns) on `A-disabled` arm.

---

## 5. Execution State Tracker

- [x] Preflights verified (Herdr status, pi version, sandbox isolation, status-bar regex scraping, archive pane move).
- [x] Draft PR #237 created and synchronized.
- [x] Fixture repos prepared (`fixtures/bugfix-repo`, `fixtures/feature-repo`, `fixtures/refactor-repo`).
- [x] Headline Scenario 4: Arms A-50k through A-disabled (8 runs):
  - [x] **A-50k**: COMPLETED (25 turns). Cost: $2.478765 | Tokens: 7,060,724 | Compactions: 37 | Cache Read: 4.56M | Session: `01a08ed6-3470-720a-9fd6-b12a5104ad26`
  - [x] **A-100k**: COMPLETED (25 turns). Cost: $2.322057 | Tokens: 12,119,512 | Compactions: 6 | Cache Read: 10.29M | Session: `01a08efb-1ebd-75f8-816e-5296bf385143`
  - [x] **A-150k**: COMPLETED (25 turns). Cost: $2.557298 | Tokens: 15,152,459 | Compactions: 1 | Cache Read: 13.35M | Session: `01a08f27-ea2b-70be-a391-25f39c26c425`
  - [x] **A-200k**: COMPLETED (25 turns). Cost: $3.629889 | Tokens: 22,930,919 | Compactions: 1 | Cache Read: 20.65M | Session: `01a08f62-f75e-749f-8f56-9db496f8c85e`
  - [x] **A-272k**: COMPLETED (25 turns). Cost: $2.089684 | Tokens: 12,517,001 | Compactions: 0 | Cache Read: 11.06M | Session: `01a08f8f-5745-73bf-82fe-568b5a057a8f`
  - [x] **A-500k**: COMPLETED (25 turns). Cost: $1.695274 | Tokens: 11,180,764 | Compactions: 0 | Cache Read: 10.25M | Session: `01a08fb1-e3b0-7765-9189-9e6c8be219f8`
  - [x] **A-1M**: COMPLETED (25 turns). Cost: $6.894384 | Tokens: 63,102,126 | Compactions: 0 | Cache Read: 60.34M | Session: `01a08fe9-9642-7354-a54d-ce4d53e1627f`
  - [x] **A-disabled**: COMPLETED (25 turns). Cost: $1.597984 | Tokens: 9,798,025 | Compactions: 0 | Cache Read: 8.80M | Session: `01a09012-409e-7475-aea2-a63e9be30154`
- [x] Scenario 2: Always-Warm (8 runs):
  - [x] **A-50k**: COMPLETED (30 turns). Cost: $4.486300 | Tokens: 13,552,970 | Compactions: 101 | Cache Read: 8.99M | Session: `01a090f3-d342-75e2-bd12-b21fc21c3913`
  - [x] **A-100k**: COMPLETED (30 turns). Cost: $2.697593 | Tokens: 14,775,257 | Compactions: 11 | Cache Read: 12.77M | Session: `01a09118-b7e6-76a5-8d3b-1f3faf8a3ca0`
  - [x] **A-150k**: COMPLETED (30 turns). Cost: $3.392501 | Tokens: 22,953,974 | Compactions: 3 | Cache Read: 21.02M | Session: `01a0912f-dfdf-75a4-8553-6440b0a64eb1`
  - [x] **A-200k**: COMPLETED (30 turns). Cost: $2.269342 | Tokens: 18,474,666 | Compactions: 1 | Cache Read: 17.44M | Session: `01a09149-0f0d-716b-b238-0d0cd80affc6`
  - [x] **A-272k**: COMPLETED (30 turns). Cost: $3.130127 | Tokens: 25,874,342 | Compactions: 0 | Cache Read: 24.43M | Session: `01a0915c-1817-713d-b8b4-226154c5944c`
  - [x] **A-500k**: COMPLETED (30 turns). Cost: $2.588619 | Tokens: 22,628,932 | Compactions: 0 | Cache Read: 21.64M | Session: `01a09202-5d41-77ca-9b2a-ed93ac0dabf9`
  - [x] **A-1M**: COMPLETED (30 turns). Cost: $3.710361 | Tokens: 37,005,809 | Compactions: 0 | Cache Read: 35.91M | Session: `01a09230-634b-71a7-9627-bb3016d7135d`
  - [x] **A-disabled**: COMPLETED (30 turns). Cost: $2.538364 | Tokens: 20,600,971 | Compactions: 0 | Cache Read: 19.56M | Session: `01a09242-fd6b-74a5-9595-e0a2692c945b`
- [x] Scenario 1: Cache-Cold Return (8 runs):
  - [x] **A-50k**: COMPLETED (20 turns). Cost: $1.253571 | Tokens: 3,774,556 | Compactions: 15 | Cache Read: 2.52M | Session: `01a094cb-5a6f-7096-9cc5-51457135d5e0`
  - [x] **A-100k**: COMPLETED (20 turns). Cost: $0.847080 | Tokens: 3,957,431 | Compactions: 1 | Cache Read: 3.28M | Session: `01a094f8-36e8-76b5-ac3e-96510db0aac2`
  - [x] **A-150k**: COMPLETED (20 turns). Cost: $0.806749 | Tokens: 3,915,425 | Compactions: 0 | Cache Read: 3.25M | Session: `01a09524-c9cd-72bd-b61a-cad1ac281691`
  - [x] **A-200k**: COMPLETED (20 turns). Cost: $0.690534 | Tokens: 3,272,386 | Compactions: 0 | Cache Read: 2.71M | Session: `01a09550-7ce0-7344-91eb-1cf334762723`
  - [x] **A-272k**: COMPLETED (20 turns). Cost: $0.764701 | Tokens: 3,864,491 | Compactions: 0 | Cache Read: 3.26M | Session: `01a0957c-0483-76d7-beaf-de97bfd88863`
  - [x] **A-500k**: COMPLETED (20 turns). Cost: $0.912749 | Tokens: 4,104,948 | Compactions: 0 | Cache Read: 3.33M | Session: `01a095a8-62ef-71b5-a006-86198adcb860`
  - [x] **A-1M**: COMPLETED (20 turns). Cost: $0.814173 | Tokens: 3,903,396 | Compactions: 0 | Cache Read: 3.26M | Session: `01a095d4-9f41-7581-aa2f-db6c4441b3d3`
  - [x] **A-disabled**: COMPLETED (20 turns). Cost: $0.788504 | Tokens: 4,425,631 | Compactions: 0 | Cache Read: 3.92M | Session: `01a09601-5985-7108-9e30-412286dd9ccb`
- [ ] Scenario 3: Reasoning Token Inflation (12 runs: 4 sizes × 3 reps):
  - [x] **20k-rep1**: COMPLETED. Context: 90.7k | Reasoning Tokens: 47 | Total Output: 548
  - [ ] **20k-rep2**: NEXT (Ready to launch)
  - [ ] 20k-rep3
  - [ ] 80k-rep1
  - [ ] 80k-rep2
  - [ ] 80k-rep3
  - [ ] 180k-rep1
  - [ ] 180k-rep2
  - [ ] 180k-rep3
  - [ ] 272k-rep1
  - [ ] 272k-rep2
  - [ ] 272k-rep3
- [ ] Scenario 6: 1M Endurance (1 run).
- [ ] Post-hoc Scenario 5 & Analysis (`analyze.ts`).
