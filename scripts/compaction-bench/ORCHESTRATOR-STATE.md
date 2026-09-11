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
- [ ] Fixture repos prepared (`fixtures/bugfix-repo`, `fixtures/feature-repo`, `fixtures/refactor-repo`).
- [ ] Headline Scenario 4: Arms A-50k through A-disabled (8 runs).
- [ ] Scenario 1: Cache-Cold Return (8 runs).
- [ ] Scenario 2: Always-Warm (8 runs).
- [ ] Scenario 3: Reasoning Token Inflation (12 runs).
- [ ] Scenario 6: 1M Endurance (1 run).
- [ ] Post-hoc Scenario 5 & Analysis (`analyze.ts`).
