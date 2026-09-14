# Context Compaction Phase 2 — Empirical Benchmark Plan

**Status:** Plan (pending triage)
**Owner:** Marcus Tiongson / Nova
**Phase 1 artifact:** `content/blog/context-compaction-curve/post.md` (published 2026-09-08)
**Phase 1 issue:** #214 (closed) · Phase 1 blog teased: #220 (272k Tripwire, open)
**Umbrella issue:** #222
**Sub-issues:** #223–#235
**Date:** 2026-09-10

---

## 1. Why Phase 2 Exists

Phase 1 published a **theoretical cost model** — the compaction curve, the cache-cold return problem, the reasoning token multiplier. Every number was derived from published pricing, not measured. The SOURCE-LEDGER explicitly flags five fabrication risks, all of the form "model-derived projection, not empirical measurement."

Phase 2 **replaces projection with receipt.** We run real coding sessions in a controlled harness, observe compaction and cache-miss events as they happen, and produce the empirical cost curve that Phase 1 could only sketch.

### What makes this unique

No public benchmark does this. The LangWatch study (Aug 2026, 2,451 sessions) is the closest — but it analyzed Claude Code sessions *after the fact* from traced API calls. We will:

1. **Observe compaction live** through herdr pane scraping — the orchestrator watches the agent's TUI in real-time
2. **Simulate warm/cold caches deliberately** by controlling idle time between turns
3. **Vary the autocompact threshold** by modifying `models.json` `contextWindow` per arm
4. **Capture the cost curve tick-by-tick** from pi's session JSONL, which logs `cacheRead`, `cacheWrite`, `input`, `output`, and `cost` per turn
5. **Discover code quality effects** — does compacting too early or too late change the agent's output quality?

That last point is gold. Only a lab that controls the harness, the model, the task, AND the compaction threshold can measure it. Frontier labs have the infrastructure; indie researchers don't. We do.


---

## 2. The Scapegoat: pi → antigravity/gemini-3.8-flash:high

### Why this harness + model

| Property | Value |
|---|---|
| Harness | pi (v0.83.0+) |
| Provider | antigravity (Google OAuth) |
| Model | gemini-3.8-flash |
| Thinking level | high (fixed across all arms) |
| Native context window | 1,048,576 tokens (1M) |
| Overridden context window | 272,000 tokens (current `models.json`) |
| Introductory pricing | $0.75/1M input · $3.75/1M output (through Dec 2026) |
| Standard pricing (Jan 2027+) | $1.50/1M input · $7.50/1M output (2× intro) |
| Cache read | $0.075/1M (10× discount on input) |
| Context surcharge (>128k) | **None** — flat pricing unlike Gemini 1.5 |

**Why Gemini 3.8 Flash, not Claude?**
- Antigravity tokens are quota-metered (free), so runs don't cost real money during development
- The 1M native window lets us test thresholds from 50k to 1M by simply changing `contextWindow` in `models.json`
- Flat pricing (no 128k surcharge) isolates the compaction effect from pricing discontinuities
- Pi's TUI shows compaction events, cache misses, and context utilization in real-time — all scrapable via herdr

**Why pi, not Claude Code?**
- Pi exposes `compaction.enabled`, `reserveTokens`, `keepRecentTokens` in `settings.json`
- Pi's `models.json` `contextWindow` override controls when autocompact fires — the independent variable
- Pi's session JSONL has per-turn `usage.cacheRead`, `usage.cacheWrite`, `usage.cost` — the dependent variable
- `showCacheMissNotices: true` surfaces cache-miss events with idle duration and re-bill cost in the TUI
- Pi runs in herdr panes where the orchestrator can scrape all of this live

### The observable signals (what the orchestrator scrapes)

```
CONTEXT METER (bottom bar):
  Normal:       "45.2%/272k (auto)"
  Post-compact: "(?%/xxxk)"               ← percentage unknown temporarily

COMPACTION EVENT (above input bar):
  "[compaction]"
  "Compacted from 130,850 tokens (ctrl+o to expand)"
  "Compaction: 54k tokens billed (~$0.95)"

CACHE MISS EVENT (above input bar, after idle):
  "Cache miss after 6m idle: 46k tokens re-billed (~$0.41)"

SESSION JSONL (per-message, machine-readable):
  { "usage": {
      "input": N, "output": N,
      "cacheRead": N, "cacheWrite": N,
      "totalTokens": N,
      "cost": { "input": $, "output": $, "cacheRead": $, "cacheWrite": $, "total": $ }
  }}
```

### Scraping patterns for `herdr agent read`

| Signal | grep pattern | Extract |
|---|---|---|
| Context % | `\d+\.\d+%/` or `(?%/` | current fill + window size |
| Compaction event | `Compacted from` | pre-compaction token count |
| Compaction cost | `tokens billed` | billed tokens + cost |
| Cache miss | `Cache miss after` | idle duration + re-bill cost |
| Model line | `gemini-3.8-flash` | confirm correct model active |


---

## 3. The Autocompact Lever

The key independent variable is pi's `contextWindow` setting in `~/.pi/agent/models.json`. Pi autocompacts when the context approaches this ceiling.

**Current production setting:**
```json
{
  "providers": {
    "antigravity": {
      "modelOverrides": {
        "gemini-3.8-flash": {
          "contextWindow": 272000
        }
      }
    }
  }
}
```

**Compaction settings in `~/.pi/agent/settings.json`:**
```json
{
  "compaction": {
    "enabled": true,
    "reserveTokens": 16384,
    "keepRecentTokens": 20000
  },
  "showCacheMissNotices": true
}
```

### The arms — what we vary

Each arm changes ONLY `contextWindow`. All other settings (model, thinking level, compaction.enabled, reserveTokens, keepRecentTokens) stay fixed.

| Arm | `contextWindow` | What it tests |
|---|---|---|
| A-50k | 50,000 | Aggressive compaction — thrashing zone? |
| A-100k | 100,000 | Moderate early compaction |
| A-150k | 150,000 | Mid-range |
| A-200k | 200,000 | Conservative |
| A-272k | 272,000 | Current production default |
| A-500k | 500,000 | Extended window (Gemini native) |
| A-1M | 1,048,576 | Full 1M window — no compaction until extreme |
| A-disabled | 1,048,576 + `compaction.enabled: false` | Control: what if we never compact? |

**The orchestrator must:**
1. Create an isolated sandbox via `create-sandbox.sh` (jq-patches `models.json`, preserves all other providers)
2. Start the benchmark pi agent with `PI_CODING_AGENT_DIR` pointing to the sandbox
3. Verify the change took effect by reading the context meter in the TUI (`X.X%/XXXk`)
4. Remove the sandbox after each arm (production `~/.pi/agent` is never modified)

### Pricing research note — the 2027 cliff

Gemini 3.8 Flash introductory pricing ($0.75/$3.75) doubles to standard ($1.50/$7.50) on Jan 1 2027. This means:
- Every cost number we collect is at introductory rates
- Phase 2 receipts should include a "projected at standard pricing" column (simple 2× multiplier on input, 2× on output)
- This makes the compaction decision **more consequential** at standard pricing — a follow-up data point worth calling out in the blog


---

## 4. The Six Benchmark Scenarios

Each scenario isolates one compaction variable. Scenarios run sequentially, not in parallel — we need clean, isolated sessions.

### Scenario 1: The Cache-Cold Return (TTL Expiration)

**Question:** How much does compaction save when the cache goes cold?

**Setup:**
- 20-turn coding session (bugfix workload — see §5)
- Turns 1–5: rapid-fire (< 60s between turns) — warm cache
- Turn 6: **deliberate 7-minute idle** (orchestrator uses `sleep 420`)
- Turns 7–10: rapid-fire again
- Turn 11: **deliberate 7-minute idle**
- Turns 12–20: rapid-fire to completion

**Run for each arm** (A-50k through A-1M). Record per-turn: context %, cache read/write tokens, cost, and whether a compaction or cache-miss event fired.

**Expected finding:** Arms with lower `contextWindow` compact before the idle, so the cache miss re-bills fewer tokens. Arms with high `contextWindow` carry the full bloated context into the cold return.

### Scenario 2: Always-Warm Cache (Rapid Execution)

**Question:** When the cache never goes cold, does compaction help or hurt?

**Setup:**
- 30-turn coding session (feature workload)
- All turns < 60s apart — cache stays warm throughout
- No deliberate idles

**Expected finding:** Low-threshold arms (50k, 100k) compact unnecessarily, paying compaction cost + reacquisition cost with no cache-miss savings. High-threshold arms (272k, 500k) should win on total cost. This validates the "don't compact when warm" rule from Phase 1.

### Scenario 3: Reasoning Token Inflation

**Question:** Do bloated contexts make the model think harder (and more expensively)?

**Setup:**
- Same refactoring task at four fixed context sizes:
  - 20k (clean scaffold — session just started)
  - 80k (moderate history — ~10 prior turns)
  - 180k (verbose — lots of terminal output accumulated)
  - 272k+ (approaching ceiling)
- Measure `output` tokens per turn (includes thinking tokens at `:high`)
- Run 3 repetitions per size for statistical stability

**Expected finding:** Thinking tokens scale super-linearly with context size. The Phase 1 model predicted ~1,500 at 50k vs ~8,000 at 200k. This scenario validates or refutes those projections.

### Scenario 4: The Compaction Curve (Pareto Frontier)

**Question:** What is the empirically optimal compaction threshold?

**Setup:**
- Same 25-turn subset of the 30-turn feature workload across ALL arms (A-50k through A-1M)
- The orchestrator runs turns 1–25 only; turns 26–30 are skipped for this scenario
- Mix of warm and cold turns: turns 8, 16 have 7-minute idles
- Record cumulative cost at each turn for every arm

**Output:** The actual compaction curve — total session cost ($) vs compaction threshold (tokens). This replaces the Phase 1 theoretical curve with empirical data.

**Expected shape:** Asymmetric U — too-low thresholds thrash, too-high thresholds bleed on cache misses. The valley should be between 60k–150k (Phase 1 predicted 40k–65k for Anthropic; Gemini's flat pricing may shift the valley rightward).

### Scenario 5: Code Quality vs. Compaction Timing

**Question:** Does the agent write better or worse code depending on when compaction fires?

This is the "discoverable" gold. Three sub-measurements:

**5a: Task completion accuracy.** Does the agent successfully complete the task? Measure by running the test suite after each arm.

**5b: Reacquisition thrashing.** After compaction fires, how many tool calls does the agent make to re-read files it just discarded? Count `read`, `grep`, `find` calls in the 3 turns following each compaction event.

**5c: Instruction adherence.** Plant a specific instruction early in the session (e.g., "always use TypeScript strict mode" or "never import from lodash"). After compaction discards the turn where that instruction was given, does the agent still follow it? This directly tests the "lost in the middle" effect — and more critically, whether compaction summary retains or drops directive-class information.

**Expected finding:** There is a timing effect. Compaction mid-derivation (while the agent is actively working through a multi-step refactor) is worse than compaction at a phase boundary. This is the Blake Crosley / Self-Compacting Agents result — decision-based compaction > threshold-based.

### Scenario 6: The 1M Window Endurance Test

**Question:** What happens if you just... never compact? Does the session eventually degrade?

**Setup:**
- 50-turn extended session with `compaction.enabled: false` and `contextWindow: 1048576`
- Workload: full feature build (scaffold → implement → test → debug → document)
- Record: cost per turn, output token count, task quality at turns 10, 20, 30, 40, 50

**Expected finding:** Cost-per-turn grows linearly (no compaction to reset it). Quality may degrade after ~200k tokens as "lost in the middle" effect kicks in. Or it may not — Gemini 3.8 Flash may handle 1M better than older models. Either outcome is publishable.


---

## 5. Workloads (Reproducible Task Definitions)

Each workload is a scripted coding task the orchestrator sends to the agent turn by turn. Workloads live in `scripts/compaction-bench/workloads/`.

### Workload A: Bugfix (20 turns)

A pre-broken TypeScript file with a failing test. The agent must:
1. Read the failing test output
2. Locate the bug
3. Fix it
4. Run tests to confirm
5. Write a brief commit message

**Why this workload:** Short, deterministic, has a clear pass/fail gate. Good for Scenarios 1, 2.

### Workload B: Feature Build (30 turns)

Build a small Express API endpoint from scratch:
1. Scaffold route + handler + types
2. Write request validation
3. Implement business logic
4. Write unit tests
5. Run tests, fix failures
6. Add JSDoc comments

**Why this workload:** Long enough to trigger compaction at lower thresholds. Has multiple distinct phases (scaffold → implement → test → document) that create natural compaction boundaries. Good for Scenarios 2, 4, 5.

### Workload C: Refactor (25 turns)

Take an existing 4-file module and refactor it:
1. Extract shared types to a new file
2. Replace callback-based code with async/await
3. Add error handling
4. Update all imports
5. Run existing tests

**Why this workload:** Multi-file dependency tracking. Compaction that discards the dependency graph forces reacquisition. Good for Scenarios 3, 4, 5.

### Workload D: Endurance (50 turns)

Full feature lifecycle:
1. Read a feature spec (planted in the repo)
2. Plan the implementation
3. Scaffold files
4. Implement core logic
5. Write tests
6. Debug failures
7. Add documentation
8. Refactor for clarity

**Why this workload:** Only used for Scenario 6 (1M endurance). Must be long enough to push context past 200k+ without artificial padding.

### Workload repo setup

All workloads run against a **disposable git worktree** of this repo (or a dedicated fixture repo). The orchestrator creates a fresh worktree per arm so results don't contaminate each other:

```bash
git worktree add /tmp/compaction-bench-arm-50k -b bench/arm-50k
```


---

## 6. Herdr Orchestration — How the Benchmark Runs

The orchestrator is a pi (or claude) agent running in the **controlling pane** of a herdr workspace. It dispatches benchmark arms into **worker panes**.

### Layout

```
┌─────────────────────────┬──────────────────────────┐
│                         │                          │
│   ORCHESTRATOR          │   BENCHMARK ARM          │
│   (this agent)          │   pi → gemini-3.8-flash  │
│                         │   :high                  │
│   - creates sandbox     │                          │
│   - sends workload      │   (observable TUI:       │
│     turns               │    context meter,        │
│   - scrapes signals     │    compaction events,    │
│   - controls timing     │    cache miss notices)   │
│   - records data        │                          │
│                         │                          │
└─────────────────────────┴──────────────────────────┘
```

**Only one arm runs at a time.** Arms run sequentially to prevent Gemini API quota throttling and to ensure cache isolation (preventing cross-arm cache contamination).

### Orchestrator loop (per arm)

```
1. CREATE sandbox: source create-sandbox.sh $ARM $CONTEXT_WINDOW → PI_CODING_AGENT_DIR
2. CREATE worktree: git worktree add /tmp/bench-arm-XXk --detach HEAD
3. SPLIT pane: herdr pane split --current --direction right --cwd /tmp/bench-arm-XXk
4. START agent: export PI_CODING_AGENT_DIR="$SANDBOX_DIR" in pane, then herdr agent start arm-XXk --kind pi ...
5. VERIFY: herdr agent read arm-XXk → confirm context meter shows "X.X%/XXXk"
6. FOR each turn T from 1 to MAX_TURNS:
   a. herdr agent prompt arm-XXk "<turn prompt>" --wait --timeout 300000
   b. herdr agent read arm-XXk → scrape signals (context %, compaction?, cache miss?)
   c. RECORD: { turn, timestamp, context_pct, tokens, cost, compaction_event, cache_miss }
   d. IF scenario requires idle: sleep $IDLE_SECONDS
7. COLLECT session JSONL from agent metadata path and archive to data/sessions/
8. RUN: python3 ~/skill-cost/cost.py --session <uuid> --json → authoritative cost
9. ARCHIVE pane: herdr pane move $PANE --tab $ARCHIVE_TAB --split down
10. CLEANUP worktree: git worktree remove /tmp/bench-arm-XXk
11. CLEANUP sandbox: rm -rf $SANDBOX_DIR (production ~/.pi/agent untouched)
```

### Timing control — simulating warm/cold caches

The orchestrator controls cache state by controlling **how long it waits between prompts**:

| Cache state | Method | Duration |
|---|---|---|
| Warm | No delay between prompt and next prompt | < 60s (agent turn time) |
| Cold | `sleep 420` (7 minutes) between turns | > 5min TTL |
| Tepid | `sleep 240` (4 minutes) — near-miss | Just under TTL |

For Scenario 1, the orchestrator inserts `sleep 420` at specific turn numbers to create deliberate cache expirations. The pi TUI will confirm with "Cache miss after Xm idle" — the orchestrator scrapes this as ground truth.

### Cron-based long-running execution

For the full matrix (8 arms × 6 scenarios = up to 48 runs), the benchmark should run as a **long-running background task** using cron or a persistent herdr workspace:

```bash
# Option A: cron entry that kicks off the next arm every 2 hours
# (allows cache to fully expire between arms)
*/120 * * * * /path/to/scripts/compaction-bench/run-next-arm.sh >> /tmp/bench.log 2>&1

# Option B: herdr workspace that stays open
herdr workspace create --label "compaction-bench"
# orchestrator runs inside this workspace, progressing through arms
```

**Option B is preferred** because the orchestrator needs to read pane output interactively. The "cron" aspect is the orchestrator's internal timer — it sleeps between arms to ensure cache isolation.

### Data collection cadence

The orchestrator emits a **tick** after every turn. Each tick is a JSON line appended to `scripts/compaction-bench/data/run-YYYY-MM-DD-arm-XXk-scenario-N.jsonl`:

```json
{
  "arm": "A-100k",
  "scenario": 1,
  "turn": 7,
  "timestamp": "2026-09-12T14:23:01Z",
  "context_pct": "38.2%/100k",
  "context_tokens_approx": 38200,
  "compaction_event": null,
  "cache_miss_event": { "idle_duration": "6m12s", "rebilled_tokens": 38200, "rebill_cost": 0.029 },
  "session_usage": {
    "input": 1250,
    "output": 890,
    "cacheRead": 37500,
    "cacheWrite": 0,
    "cost": { "input": 0.0009, "output": 0.0033, "cacheRead": 0.0028, "cacheWrite": 0, "total": 0.007 }
  },
  "cumulative_cost": 0.142
}
```

This tick-by-tick JSONL is the raw receipt. The final report reads from it.


---

## 7. Cost Curve — Live Observation Protocol

The cost curve is the headline deliverable. It plots **cumulative session cost ($) vs compaction threshold (tokens)** for a fixed workload.

### How the orchestrator "ticks" the curve

After each turn, the orchestrator:

1. Reads the session JSONL to get cumulative cost so far
2. Reads the TUI to get current context fill percentage
3. Logs both to the tick JSONL
4. Optionally prints a live summary:

```
[TICK] Arm=A-100k Scenario=4 Turn=12/25
  Context: 67.3%/100k (~67,300 tokens)
  Turn cost: $0.008 (cache hit)
  Cumulative: $0.142
  Compactions so far: 2
  Cache misses so far: 1
  ──────────────────────────
```

This gives the operator (watching in herdr) a live cost curve building in real-time.

### Post-hoc cost analysis

After all arms complete, run skill-cost for the authoritative totals:

```bash
for session in scripts/compaction-bench/data/sessions/*.jsonl; do
  ARM=$(basename "$session" | sed 's/.*-arm-//' | sed 's/-.*//')
  SESSION_ID=$(basename "$session" .jsonl | sed 's/.*_//')
  echo "=== Arm $ARM ==="
  python3 ~/skill-cost/cost.py --session "$SESSION_ID" --json
done
```

### Projected standard-pricing column

Every cost figure gets a `cost_standard` field = `cost_introductory × 2` (since standard pricing is exactly 2× introductory for both input and output on Gemini 3.8 Flash). This makes the receipts future-proof.

---

## 8. Discoverable Outcomes — Follow-Up Research Hooks

These are outcomes we don't know the answer to yet. Designing the benchmark to capture them is what makes it research, not just cost accounting.

### 8a. The Compaction Timing Effect

**Hypothesis:** Compaction that fires mid-derivation (while the agent is actively reasoning through a multi-step change) produces worse outcomes than compaction at a phase boundary.

**How we detect it:** Cross-reference compaction events with task phase. If compaction fires during "implement" and the agent immediately re-reads files it just discarded (reacquisition thrashing), that's a mid-derivation compaction. If it fires between "implement" and "test," that's a boundary compaction. Compare task completion rate and tool-call count post-compaction.

**Why this matters:** If true, it validates the "Self-Compacting Agents" paper (June 2026) and suggests harnesses should let the model decide when to compact rather than using a fixed threshold.

### 8b. The Quality Inversion Point

**Hypothesis:** There exists a context size where code quality actually *improves* — the agent has enough history to make informed decisions but not so much that it gets confused.

**How we detect it:** Score each arm's final code output on a rubric (tests pass, types correct, no lint errors, follows the planted style instruction). Plot quality score vs compaction threshold. If there's a peak in the middle, that's the inversion point.

**Why this matters:** If quality peaks at 100k–150k (not at "as much context as possible"), that directly contradicts the "bigger context = better" assumption that drives 1M-window marketing.

### 8c. The Cache Hit Rate Cliff

**Hypothesis:** Real-world cache hit rates drop dramatically when sessions involve human pauses, but are near-perfect during automated bursts.

**How we detect it:** Scenario 1 gives us the cold-return data. Scenario 2 gives us the always-warm data. Compare cache hit rates. The Requesty study found 86% overall; Zhang et al. (2024) found bimodal (100% during bursts, <15% during human-in-the-loop). Our controlled idles should reproduce the bimodal pattern.

### 8d. The Reasoning Token Scaling Exponent

**Hypothesis:** Phase 1 predicted thinking tokens scale as T₀ × (1 + 0.4 × (L/L_ref)^1.6). Scenario 3 measures the actual exponent.

**How we detect it:** Plot output tokens (which include thinking tokens at `:high`) vs context size at the moment of generation. Fit a power curve. If β ≈ 1.6, Phase 1's model was right. If β < 1.0, bloated contexts don't inflate reasoning as much as predicted. If β > 2.0, it's worse than we thought.

### 8e. Gemini vs. Anthropic Compaction Economics

**Follow-up (not in Phase 2 scope):** Run the same benchmark matrix against Claude Sonnet 4.6 and compare. Gemini has flat pricing; Claude has the 1.25× cache write / 0.10× cache read asymmetry. The optimal compaction threshold likely differs between them. This is Phase 3 material.


---

## 9. File Tree — What Gets Created

```
scripts/compaction-bench/
├── README.md                          # How to run the benchmark
├── workloads/
│   ├── bugfix.md                      # Workload A prompts (turn-by-turn)
│   ├── feature.md                     # Workload B prompts
│   ├── refactor.md                    # Workload C prompts
│   └── endurance.md                   # Workload D prompts
├── fixtures/
│   ├── bugfix-repo/                   # Pre-broken code + failing test
│   ├── feature-repo/                  # Scaffold for feature build
│   └── refactor-repo/                 # 4-file module to refactor
├── orchestrator-brief.md              # THE dispatch brief for the orchestrator agent
├── config/
│   ├── models-arm-50k.json            # Reference: models.json for each arm (documentation)
│   ├── models-arm-100k.json
│   ├── models-arm-150k.json
│   ├── models-arm-200k.json
│   ├── models-arm-272k.json
│   ├── models-arm-500k.json
│   ├── models-arm-1M.json
│   └── models-arm-disabled.json
├── sandbox/
│   └── create-sandbox.sh              # Creates isolated PI_CODING_AGENT_DIR per arm (jq patch)
├── data/
│   ├── runs/                          # Per-run tick JSONL
│   │   └── run-YYYY-MM-DD-arm-XXk-scenario-N.jsonl
│   ├── sessions/                      # Copied pi session JSONLs
│   └── summary/                       # Aggregated results
│       ├── cost-curve.json            # The curve data points
│       ├── quality-scores.json        # Scenario 5 quality rubric
│       └── reasoning-tokens.json      # Scenario 3 thinking token data
└── analyze.ts                         # Script to compile data/ → summary/

content/reports/
└── context-compaction-phase-2/
    ├── methodology.md                 # Full methodology writeup
    ├── receipts.md                    # Raw receipt tables
    └── data/                          # Archived run data

content/blog/
└── context-compaction-phase-2/
    ├── post.md                        # The Phase 2 blog post
    ├── SOURCE-LEDGER.md               # Every claim traced to data
    └── THUMBNAIL.md                   # Editorial thumbnail spec

docs/plans/context-compaction-phase-2/
└── PLAN.md                            # This document
```

---

## 10. The Orchestrator Brief (Summary)

The orchestrator agent picks up `scripts/compaction-bench/orchestrator-brief.md`. That document is the **executable dispatch brief** — it contains:

1. Pre-flight checklist (verify herdr, verify pi version, verify sandbox creation)
2. For each scenario × arm combination:
   - Exact sandbox contextWindow to set
   - Exact workload file to use
   - Exact timing (which turns get idle delays)
   - Exact scraping commands to run after each turn
   - Exact JSONL format for tick output
3. Post-run analysis commands
4. Success criteria

The brief is designed so the orchestrator can execute it **without asking questions**. Every decision is pre-made in the brief.


---

## 11. Deliverables & Publication Plan

### 11a. The Final Report

**Location:** `content/reports/context-compaction-phase-2/`

**Structure:**
1. **Executive Summary** — One paragraph: "We ran N sessions across M compaction thresholds on Gemini 3.8 Flash and found the empirical sweet spot at Xk–Yk tokens, saving Z% vs the 272k default."
2. **Methodology** — Scenarios, workloads, arms, timing control, data collection
3. **Results** — The cost curve (with error bars from repetitions), reasoning token scaling plot, quality scores, cache hit rate comparison
4. **Discussion** — How empirical results compare to Phase 1 projections, what surprised us
5. **Raw Receipts** — Every run's tick JSONL linked, every session log archived

### 11b. The Blog Post (Phase 2)

**Location:** `content/blog/context-compaction-phase-2/post.md`
**URL:** `/blog/context-compaction-phase-2`
**Working title:** "We Ran 48 Coding Sessions to Find the Real Compaction Sweet Spot"

**Structure:**
1. **Hook:** "Phase 1 predicted the sweet spot was 40k–65k. We ran the actual benchmark. Here's what happened."
2. **The Experiment:** Brief methodology (link to full report for details)
3. **The Curve:** THE graph — empirical cost vs compaction threshold, with Phase 1 prediction overlaid
4. **The Surprises:** Discoverable outcomes (§8) that materialized
5. **The Updated Rule:** Revised "when to compact" guidance based on empirical data
6. **Receipts:** Links to raw data, session logs, reproducibility instructions

**Dependencies:**
- Phase 1 blog is already live → Phase 2 blog links back to it
- #220 (272k Tripwire) may be folded into Phase 2 or kept separate depending on findings
- Editorial thumbnail via milim-thumbnail skill

### 11c. The LinkedIn Post

**Target:** Gaia Research org page on LinkedIn
**Timing:** After the blog post is live on research.gaiaskilltree.com

**Template:**

```
We just ran 48 controlled coding sessions to answer a question 
no one had empirical data for:

"When should a coding agent compact its context?"

Phase 1 (published last week) built the theoretical model.
Phase 2 replaced theory with receipts.

Key findings:
📊 The empirical sweet spot is [X]k–[Y]k tokens (Phase 1 predicted 40k–65k)
💰 Compacting at [X]k saves [Z]% vs the common 272k default
🧠 Reasoning tokens scale as [exponent] with context size
🎯 Code quality [increases/peaks/drops] at [threshold]

The full benchmark: [link]
Raw data + reproducibility: [link]

Harness: pi · Model: Gemini 3.8 Flash · Orchestration: Herdr
Built at Gaia Research — research.gaiaskilltree.com

#ContextCompaction #CodingAgents #AIEngineering #LLMCost
```

**Adaptation rules:**
- Fill in [X], [Y], [Z] only from actual receipts — never projected numbers
- The "Key findings" bullets come from the report's executive summary
- Include the graph image as a LinkedIn post image
- If a discoverable outcome (§8) materialized, lead with it — it's the hook

---

## 12. Issue Structure

### Umbrella Issue

**Title:** `PLAN: Context Compaction Phase 2 — Empirical Benchmark (Herdr + Pi + Gemini 3.8 Flash)`
**Labels:** `plan`, `research`
**Body:** Links to this document, lists all sub-issues, states success criteria

### Sub-Issues

| # | Title | Depends on | Estimate |
|---|---|---|---|
| # | Title | Issue | Depends on | Estimate |
|---|---|---|---|---|
| S1 | Benchmark fixtures: workload repos + turn-by-turn prompts | #223 | — | 1 day |
| S2 | Orchestrator brief: executable dispatch document | #224 | S1 | 1 day |
| S3 | Config matrix: models.json overrides for each arm | #225 | — | 0.5 day |
| S4 | Run Scenario 1: Cache-Cold Return (8 arms × 20 turns) | #226 | S1, S2, S3 | 2 days |
| S5 | Run Scenario 2: Always-Warm Cache (8 arms × 30 turns) | #227 | S1, S2, S3 | 2 days |
| S6 | Run Scenario 3: Reasoning Token Inflation (4 sizes × 3 reps) | #228 | S1, S2, S3 | 1 day |
| S7 | Run Scenario 4: Compaction Curve (8 arms × 25 turns) | #229 | S1, S2, S3 | 3 days |
| S8 | Run Scenario 5: Code Quality vs Compaction Timing | #230 | S4–S7 data | 2 days |
| S9 | Run Scenario 6: 1M Window Endurance (50 turns) | #231 | S1, S2 | 1 day |
| S10 | Analysis: compile receipts → cost curve + quality scores | #232 | S4–S9 | 1 day |
| S11 | Report: write `content/reports/context-compaction-phase-2/` | #233 | S10 | 1 day |
| S12 | Blog post: write + thumbnail + SOURCE-LEDGER | #234 | S10, S11 | 1 day |
| S13 | LinkedIn post: draft + publish after blog is live | #235 | S12 | 0.5 day |

**Total estimated effort:** ~17 days of benchmark runtime (most of it is idle time during deliberate cache expirations + agent execution time). Active human/agent work: ~5 days.

---

## 13. Success Criteria

Phase 2 is done when:

1. ✅ At least 6 of 8 arms have completed runs for Scenarios 1, 2, and 4
2. ✅ The cost curve has ≥6 data points with real dollar amounts from skill-cost
3. ✅ Every number in the blog post traces back to a session JSONL via the SOURCE-LEDGER
4. ✅ The blog post is deployed to research.gaiaskilltree.com
5. ✅ The LinkedIn post is published with at least one graph and receipts link
6. ✅ At least one "discoverable outcome" from §8 has a definitive answer (confirmed or refuted)

### Stretch goals

- All 8 arms × all 6 scenarios completed (48 runs)
- Reproducibility: a third party can clone the repo and re-run the benchmark
- The reasoning token scaling exponent (§8d) is measured to two significant figures
- Phase 1 blog post updated with a "Phase 2 validated/refuted this" annotation

---

## 14. References

### Primary (used in Phase 1, carried forward)
- Anthropic. *Prompt Caching.* Claude Platform Docs.
- Liu et al. (2024). *Lost in the Middle.* Trans. ACL, 12, 157–173.
- Snell et al. (2024). *Scaling LLM Test-Time Compute.* arXiv:2408.03314.

### New for Phase 2
- Xu et al. (2026). *TokenPilot: Cache-Efficient Context Management for LLM Agents.* arXiv:2606.17016.
- Dadhich (2026). *Agentic Context Management.* arXiv:2607.21503.
- LangWatch / Chaves (2026). *The Context Tax: When to Compact Your Coding Agent.* 2,451 sessions, 287,748 API calls.
- Requesty / Jaigu (2026). *The Coding Agent Economy.* 12-month production data, 9 agents.
- Bouchard (2026). *Context Engineering in 2026: Why We Stopped Compacting.* Production AI tutor eval.
- Crosley (2026). *Context Compaction Is a Decision, Not a Threshold.* + ref to *Self-Compacting Language Model Agents* (June 2026).
- Google. *Gemini 3.8 Flash pricing.* Introductory $0.75/$3.75, standard $1.50/$7.50 (Jan 2027).

