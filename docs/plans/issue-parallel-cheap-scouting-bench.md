# Issue / Feature Plan: Parallel Cheap-Scout Fan-Out Benchmark (Issue #174)

- **Status:** Proposed Research Plan / RFC
- **Rank:** 20 (Idea Bank)
- **Owner:** Founder / Marcus Tiongson
- **Target Components:** `scripts/scout-bench/`, `content/reports/parallel-scouting-economics.md`, pi-cost telemetry, `gaia-blog-post` skill
- **Dependencies:** `pi-cost` skill (pi-cost pricing tables), `workflow` tool (pi-dynamic-workflows), `gaia-blog-post` skill, `milim-editorial-thumbnail` skill, Gemini API access (Antigravity router)
- **GitHub Issue:** [#174](https://github.com/gaia-research/gaia-research/issues/174)

---

## 1. Executive Summary

**Core question:** Can a parallel fan-out of ultra-cheap scouts match or exceed
the recall of a single expensive scout — and at what cost/latency trade-off?

Modern agentic orchestration typically dispatches a single mid-tier model as a
scout (e.g. `gemini-3.7-flash` at low reasoning). This study asks whether
replacing that single scout with $K$ concurrent instances of a dramatically
cheaper model (`gemini-3.5-flash-lite`, ~10x cheaper per input token) — each
given a different partition or perspective of the search space — produces a
Pareto-dominant cost-to-performance frontier.

### 1.1 Research Questions

| # | Question | Metric |
|---|---|---|
| RQ1 | Does parallel fan-out of $K$ lite scouts ($K = 3 \dots 6$) match the **recall** of a single standard flash scout? | $R$ (recall @ ground-truth candidate list) |
| RQ2 | What is the **cost-to-recall Pareto frontier** across architectures A-D? | USD vs. $F_2$ scatter, dominated-solution pruning |
| RQ3 | Does a **cascaded two-tier funnel** (K lite scouts sweep wide, 1 flash verifier prunes) dominate either single-model architecture? | $F_2$, cost, latency |
| RQ4 | How does **prompt-cache hit amplification** behave under fan-out? | `cacheRead` fraction (%) per architecture |
| RQ5 | What is the **flake rate** per architecture (variance across N repeats)? | $\sigma(F_2)$ across repeats |
| RQ6 | Does the **latency ceiling** of parallel fan-out stay within 2x of a single-scout baseline? | p50, p95 wall-clock ms |

### 1.2 Hypotheses

- **H1:** At $K \geq 4$, Architecture C (parallel lite) achieves recall parity
  with Architecture A (single standard flash) at < 50% of the cost.
- **H2:** Architecture D (cascaded funnel) achieves the highest $F_2$ at
  intermediate cost, dominating both single-model architectures.
- **H3:** Prompt-cache hit rates are higher under parallel fan-out because
  $K$ scouts share the same system prompt prefix, amplifying the cache window.
- **H4:** Flake rate decreases with $K$ (ensemble averaging effect).

---

## 2. Subagent Model Cards

### 2.1 `scout-flash-lite` — Ultra-Cheap Scout

```yaml
model_card:
  name: scout-flash-lite
  model_id: gemini-3.5-flash-lite
  antigravity_route: antigravity/gemini-3.5-flash-lite
  alternate_route: google-antigravity/gemini-3.5-flash-lite
  context_window: 1_048_576  # 1M tokens
  pricing:
    input_per_1M:  $0.30     # uncached
    output_per_1M: $2.50
    cache_read_per_1M: $0.03 # 10x cheaper cache-read than standard flash
  tools:
    - read          # file reading
    - grep          # pattern search
    - find          # file discovery
    - ls            # directory listing
  purpose: >
    Ultra-cheap, high-throughput scout for wide-sweep codebase localization,
    document retrieval, and candidate enumeration. Dispatched in parallel
    (K=3..6 instances) to cover partitioned search spaces. NOT used for
    synthesis, judgment, or precision verification.
  output_contract:
    format: JSON
    schema:
      candidates:
        type: array
        items:
          type: object
          properties:
            path: { type: string, description: "File path or URL" }
            relevance_signal: { type: string, description: "Why this candidate matches" }
            snippet: { type: string, description: "Key excerpt (<=200 chars)" }
            confidence: { type: string, enum: [high, medium, low] }
          required: [path, relevance_signal]
      search_strategy: { type: string, description: "What partition/perspective this scout covered" }
      wall_clock_ms: { type: number }
    max_candidates: 25
    dedup_key: path
  reasoning_effort: low
  max_turns: 8
  timeout_ms: 30000
```

### 2.2 `worker-flash-low` — Standard Flash Scout / Second-Tier Verifier

```yaml
model_card:
  name: worker-flash-low
  model_id: gemini-3.7-flash
  antigravity_route: antigravity/gemini-3.7-flash
  reasoning_effort: low
  context_window: 1_048_576
  pricing:
    input_per_1M:  $0.30     # uncached (note: :low reasoning tier)
    output_per_1M: $2.50
    cache_read_per_1M: $0.075
  tools:
    - read
    - grep
    - find
    - ls
  purpose: >
    Mid-tier scout used as: (a) the single-scout baseline in Architecture A,
    (b) the second-tier precision verifier in Architecture D's cascaded funnel.
    Higher per-token quality than flash-lite; ~2.5x more expensive on cache reads.
  output_contract:
    format: JSON
    schema:
      candidates:
        type: array
        items:
          type: object
          properties:
            path: { type: string }
            relevance_signal: { type: string }
            snippet: { type: string }
            confidence: { type: string, enum: [high, medium, low] }
            verified: { type: boolean, description: "Only in Arch D: did verifier confirm?" }
          required: [path, relevance_signal]
      search_strategy: { type: string }
      wall_clock_ms: { type: number }
    max_candidates: 25
    dedup_key: path
  max_turns: 12
  timeout_ms: 45000
```

### 2.3 `aggregator-lite` / `reducer` — Deterministic Fusion & Validation

```yaml
model_card:
  name: aggregator-lite
  type: deterministic  # NOT an LLM call
  implementation: scripts/scout-bench/aggregate.ts
  purpose: >
    Pure-function aggregator that fuses K scout result sets into a single
    ranked candidate list. No model call — deterministic, reproducible,
    auditable. Runs as a post-processing step, not a subagent.
  algorithms:
    - reciprocal_rank_fusion:
        k: 60  # RRF smoothing constant
        description: >
          For each candidate across K result lists, compute
          RRF_score = sum(1 / (k + rank_i)) for each list i where
          the candidate appears. Sort descending.
    - quorum_voting:
        threshold_m: null  # configurable; default ceil(K/2)
        description: >
          Retain only candidates that appear in >= m of K result lists.
          Applied as a filter before or after RRF.
    - set_union_dedup:
        dedup_key: path
        normalization: >
          Paths are canonicalized (resolve symlinks, strip trailing slashes,
          lowercase on case-insensitive FS) before dedup.
    - schema_validation:
        description: >
          Every candidate must pass the output_contract schema from §2.1/2.2.
          Malformed entries are logged and dropped, never silently passed.
  output_contract:
    format: JSON
    schema:
      merged_candidates:
        type: array
        items:
          type: object
          properties:
            path: { type: string }
            rrf_score: { type: number }
            source_count: { type: integer, description: "How many scouts found this" }
            relevance_signals: { type: array, items: { type: string } }
      algorithm_used: { type: string }
      input_list_count: { type: integer }
      pre_dedup_total: { type: integer }
      post_dedup_total: { type: integer }
```

### 2.4 `judge-opus` — Gold Evaluation & Automated Grading

```yaml
model_card:
  name: judge-opus
  model_id: claude-opus-4-6
  antigravity_route: antigravity/claude-opus-4-6
  context_window: 200_000
  pricing:
    input_per_1M:  $5.00
    output_per_1M: $25.00
    cache_read_per_1M: $0.50
  purpose: >
    Gold-standard evaluator. Receives: (a) the ground-truth candidate list,
    (b) the architecture's merged output, and (c) the original task prompt.
    Computes R, P, F2, and writes a structured verdict. Used ONLY for
    evaluation, never as a scout or aggregator. One judge call per
    architecture-per-task-per-repeat.
  output_contract:
    format: JSON
    schema:
      task_id: { type: string }
      architecture: { type: string, enum: [A, B, C, D] }
      repeat_index: { type: integer }
      ground_truth_size: { type: integer }
      predicted_size: { type: integer }
      true_positives: { type: integer }
      false_positives: { type: integer }
      false_negatives: { type: integer }
      recall: { type: number }
      precision: { type: number }
      f2_score: { type: number }
      verdict: { type: string, enum: [pass, marginal, fail] }
      notes: { type: string }
  max_turns: 3
  timeout_ms: 60000
  spend_guard: >
    Judge calls are the most expensive component. Cost ceiling:
    (4 architectures * 3 task suites * 3 tasks/suite * 5 repeats) = 180 calls.
    At ~2k input tokens per call: ~$1.80 total judge cost. Hard cap: $5.00.
```

---

## 3. Architectural Postures

### Architecture A — Single Standard Flash (`worker-flash-low`)

```
┌─────────────────────────┐
│   Task Prompt            │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  worker-flash-low        │
│  (single scout, K=1)     │
│  gemini-3.7-flash:low    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Schema Validator        │
│  (aggregator-lite)       │
└────────────┬────────────┘
             │
             ▼
        [Candidates]
```

- **Role:** Baseline. The "status quo" single-scout dispatch.
- **Expected cost:** ~$0.001-0.003 per task (depending on context size).
- **Expected latency:** 5-15s per task.

### Architecture B — Single Ultra-Lite Scout (`scout-flash-lite`)

```
┌─────────────────────────┐
│   Task Prompt            │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  scout-flash-lite        │
│  (single scout, K=1)     │
│  gemini-3.5-flash-lite   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Schema Validator        │
│  (aggregator-lite)       │
└────────────┬────────────┘
             │
             ▼
        [Candidates]
```

- **Role:** Cost floor. Tests whether the cheapest model alone is viable.
- **Expected cost:** ~$0.0003-0.001 per task.
- **Expected latency:** 3-10s per task.

### Architecture C — Parallel Fan-Out Ensemble (`K` x `scout-flash-lite`)

```
┌───────────────────────────────────────────────────┐
│                  Task Prompt                       │
└───────────────────────┬───────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │          ... (K instances)
          ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ scout-lite-1 │ │ scout-lite-2 │ │ scout-lite-K │
│ Subspace     │ │ Multi-Persp. │ │ Diverse Query│
│ Partition    │ │ Framing      │ │ Generation   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  aggregator-lite      │
            │  (RRF / Quorum /      │
            │   Union + Dedup)      │
            └───────────┬───────────┘
                        │
                        ▼
                   [Candidates]
```

- **Fan-out strategies (one per scout instance):**
  1. **Subspace Partitioning:** Each scout gets a disjoint file-tree partition
     (e.g. scout-1: `src/`, scout-2: `scripts/`, scout-3: `docs/`).
  2. **Multi-Perspective Framing:** Each scout gets the same search space but a
     different framing of the query (e.g. "find by function name", "find by
     import graph", "find by test coverage").
  3. **Diverse Query Generation:** Each scout gets the same space but a
     rephrased/expanded query variant (synonym expansion, specificity ladder).
- **Expected cost:** $K \times \text{Arch B cost}$ = ~$0.001-0.006 per task at $K=4$.
- **Expected latency:** Same as Arch B (parallel execution), +aggregation overhead.
- **Configurable $K$:** Tested at $K \in \{3, 4, 5, 6\}$.

### Architecture D — Cascaded Two-Tier Funnel

```
┌───────────────────────────────────────────────────┐
│                  Task Prompt                       │
└───────────────────────┬───────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼          (K lite scouts)
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ scout-lite-1 │ │ scout-lite-2 │ │ scout-lite-K │
│ (wide sweep) │ │ (wide sweep) │ │ (wide sweep) │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  aggregator-lite      │  ← Tier 1: union + RRF rank
            │  (pre-filter)         │
            └───────────┬───────────┘
                        │ top-N candidates
                        ▼
            ┌───────────────────────┐
            │  worker-flash-low     │  ← Tier 2: precision verifier
            │  (verify + prune)     │
            └───────────┬───────────┘
                        │
                        ▼
                   [Candidates]
```

- **Tier 1:** $K$ lite scouts sweep wide, aggregator merges via RRF, passes
  top-N (configurable, default $N = 2K$) to Tier 2.
- **Tier 2:** `worker-flash-low` receives the pre-filtered candidate set and
  verifies each: reads the actual file content, confirms relevance, and prunes
  false positives. Outputs only verified candidates.
- **Expected cost:** Arch C cost + ~$0.001-0.002 verifier cost = ~$0.002-0.008 per task.
- **Expected latency:** Arch C latency + verifier latency (sequential second tier).
- **Hypothesis:** Highest $F_2$ at moderate cost increase over Arch C.

---

## 4. Reproducible Experimental Tasks & SHA Receipts

All tasks are pinned to deterministic fixtures within the `gaia-research` repository.
Each task has:
- An exact **commit SHA** (or URL SHA256 checksum for external resources).
- A **frozen input prompt** (checked into `scripts/scout-bench/tasks/`).
- A **deterministic ground-truth candidate list** (hand-curated, reviewed, frozen).

### 4.1 Task Suite 1: Codebase Localization & Triage

Tasks that ask "find all files relevant to X" within a pinned commit of `gaia-research`.

| Task ID | Description | Commit Pin | Ground-Truth Size |
|---|---|---|---|
| `loc-1` | Find all files that define or configure the HH Benchmark ledger schema | `HEAD` of `main` at experiment start | ~5-8 files |
| `loc-2` | Identify every component and utility that handles craft registry sync | `HEAD` of `main` at experiment start | ~6-10 files |
| `loc-3` | Locate all visual-audit and screenshot-related scripts and configs | `HEAD` of `main` at experiment start | ~4-7 files |

**SHA receipt protocol:**
```bash
# Pin the exact commit before any experiment run
BENCH_COMMIT=$(git rev-parse HEAD)
echo "bench_commit: $BENCH_COMMIT" >> scripts/scout-bench/data/run-manifest.json
```

Ground-truth candidate lists are hand-curated by the founder, reviewed by a
second person (or Opus judge as tiebreaker), and checked into
`scripts/scout-bench/tasks/loc-{1,2,3}/ground-truth.json`.

### 4.2 Task Suite 2: Multi-Source Web & Doc Retrieval

Tasks that ask "find relevant information across a fixed set of cached documents."

| Task ID | Description | Source Fixture | Ground-Truth Size |
|---|---|---|---|
| `ret-1` | Given 5 cached skill SKILL.md files, identify which ones are relevant to a "visual audit" capability gap | `scripts/scout-bench/fixtures/cached-skills/` | ~2-3 files |
| `ret-2` | Given the HH Benchmark methodology doc + 3 blog posts, find all passages that discuss "placebo arm" design | `scripts/scout-bench/fixtures/cached-docs/` | ~4-6 passages |
| `ret-3` | Given a set of registry node JSON files (frozen snapshot), identify nodes whose `prerequisites` mention a specific skill ID | `scripts/scout-bench/fixtures/cached-registry/` | ~3-5 nodes |

**Fixture integrity:**
```bash
# SHA256 checksum of each fixture file, recorded in manifest
find scripts/scout-bench/fixtures/ -type f -exec sha256sum {} \; \
  > scripts/scout-bench/data/fixture-checksums.sha256
```

### 4.3 Task Suite 3: Context Diet / Skill Tree Pruning

Tasks that ask "given a capability gap description, select the minimal set of
active tools/skills from a registry snapshot."

| Task ID | Description | Registry Snapshot | Ground-Truth Size |
|---|---|---|---|
| `prune-1` | Select the minimal skill set for "mobile responsive layout audit" from a 20-skill registry snapshot | `scripts/scout-bench/fixtures/registry-20/` | ~3-4 skills |
| `prune-2` | Select the minimal tool set for "blog post publication with thumbnail" from a 15-tool manifest | `scripts/scout-bench/fixtures/tools-15/` | ~4-5 tools |
| `prune-3` | Given a frozen craft skills JSON (50 entries), identify the 5 most relevant to "fusion recipe validation" | `scripts/scout-bench/fixtures/craft-50/` | ~4-6 skills |

---

## 5. Aggregation & Fusion Algorithms

All aggregation is performed by the deterministic `aggregator-lite` (no LLM call).

### 5.1 Reciprocal Rank Fusion (RRF)

$$\text{RRF}(d) = \sum_{i=1}^{K} \frac{1}{k + r_i(d)}$$

where $r_i(d)$ is the rank of candidate $d$ in list $i$ (or $\infty$ if absent),
and $k = 60$ is the smoothing constant (standard RRF default from Cormack et al. 2009).

**Implementation:** `scripts/scout-bench/aggregate.ts :: computeRRF()`

### 5.2 Quorum / Majority Voting

Retain candidates appearing in $\geq m$ of $K$ result lists.

- **Default $m$:** $\lceil K/2 \rceil$ (strict majority).
- **Variants tested:** $m = 1$ (union), $m = \lceil K/2 \rceil$ (majority), $m = K$ (unanimous).
- **Applied as:** pre-filter before RRF ranking (Quorum-then-RRF) or post-filter
  after RRF ranking (RRF-then-Quorum). Both variants are tested.

### 5.3 Set Union with Deterministic Structural Deduplication

- **Dedup key:** Canonical file path (resolved, lowercased, trailing-slash-stripped).
- **Collision resolution:** When two scouts report the same path with different
  `relevance_signal` values, both signals are retained in the merged entry's
  `relevance_signals` array.
- **Normalization:** Relative paths are resolved against the repository root.

### 5.4 Schema & Path Validation Gate

Every candidate in every scout's output must pass:
1. **Schema validation:** Conforms to the `output_contract` from Section 2.
2. **Path existence:** The reported `path` must exist at the pinned commit SHA.
3. **Snippet verification:** If a `snippet` is provided, it must appear verbatim
   in the file at the reported path (substring match).

Failures are logged to `scripts/scout-bench/data/validation-failures.jsonl` with
the scout instance ID, task ID, and failure reason. Failed candidates are dropped
from aggregation but counted in the flake-rate metric.

---

## 6. Cost Monitoring & Telemetry

### 6.1 Harness Integration with `pi-cost`

Every experimental run is executed within a pi session. The `pi-cost` skill
parses the session JSONL log and extracts per-turn token usage and cost.

**Pricing table (from `pi_cost.py`, already configured):**

| Model Route | Input/1M | Output/1M | CacheRead/1M |
|---|---|---|---|
| `google-antigravity/gemini-3.5-flash-lite` | $0.30 | $2.50 | $0.03 |
| `antigravity/gemini-3.7-flash` | $0.30 | $2.50 | $0.075 |
| `antigravity/claude-opus-4-6` | $5.00 | $25.00 | $0.50 |

### 6.2 Structured JSONL Ledger Schema

Each experimental run appends a record to `scripts/scout-bench/data/ledger.jsonl`.

```typescript
interface ScoutBenchRecord {
  schema: "scout-bench/v1";
  recordedAt: string;           // ISO timestamp
  benchmarkId: string;          // "parallel-scout-v1"
  taskId: string;               // e.g. "loc-1", "ret-2", "prune-3"
  taskSuite: string;            // "localization" | "retrieval" | "pruning"
  architecture: "A" | "B" | "C" | "D";
  archConfig: {
    K: number;                  // fan-out count (1 for A/B)
    fanOutStrategy?: string;    // "subspace" | "perspective" | "diverse-query"
    aggregation?: string;       // "rrf" | "quorum-then-rrf" | "rrf-then-quorum"
    quorumM?: number;           // m threshold for quorum voting
    verifierEnabled?: boolean;  // true only for Arch D
    topNForVerifier?: number;   // candidates passed to Tier 2 (Arch D)
  };
  repeatIndex: number;          // 0-based; N repeats, no seeds
  scoutModel: string;           // model route used for scouts
  verifierModel?: string;       // model route for Tier 2 (Arch D only)
  judgeModel: string;           // always claude-opus-4-6

  // Token accounting (per-architecture totals, not per-scout)
  tokens: {
    scoutInputTotal: number;    // sum across all K scouts
    scoutOutputTotal: number;
    scoutCacheReadTotal: number;
    verifierInput?: number;     // Arch D only
    verifierOutput?: number;
    verifierCacheRead?: number;
    judgeInput: number;
    judgeOutput: number;
    aggregatorTokens: 0;        // deterministic, no LLM tokens
  };

  costUSD: {
    scouts: number;
    verifier: number | null;
    judge: number;
    total: number;
  };

  wallClockMs: {
    scoutsParallel: number;     // max(scout_i wall clock) for parallel
    scoutsSequential: number;   // sum(scout_i wall clock) for comparison
    verifier: number | null;
    judge: number;
    aggregator: number;
    totalE2E: number;
  };

  results: {
    groundTruthSize: number;
    predictedSize: number;
    truePositives: number;
    falsePositives: number;
    falseNegatives: number;
    recall: number;             // R = TP / (TP + FN)
    precision: number;          // P = TP / (TP + FP)
    f2Score: number;            // F2 = 5 * P * R / (4P + R)
    validationFailures: number; // schema/path failures dropped
  };

  notes?: string;
}
```

**Ledger discipline** (inherited from `hh-ledger/v1`):
- **No seed field.** Determinism does not exist; the design is N repeats + CIs.
- **Token values are number, never 0 for "unmeasured."** Use `null` only where
  the component genuinely does not apply (e.g. `verifierInput` for Arch A/B/C).
- **Append-only.** Records are never edited after commit.
- **Validator:** `scripts/scout-bench/ledger.ts validate` checks every record
  against the schema before appending.

### 6.3 Statistical Metrics

Computed across $N$ repeats per architecture-per-task cell:

| Metric | Formula | Notes |
|---|---|---|
| $R$ (Recall) | $\text{TP} / (\text{TP} + \text{FN})$ | Primary quality signal |
| $P$ (Precision) | $\text{TP} / (\text{TP} + \text{FP})$ | Secondary; penalizes noise |
| $F_2$ | $5PR / (4P + R)$ | Recall-weighted harmonic mean (recall matters 4x as much as precision for scouting) |
| $K^*$ | Optimal fan-out count on the Pareto frontier | The $K$ where adding another scout no longer improves $F_2$ enough to justify cost |
| p50, p95 latency | Percentile of `wallClockMs.totalE2E` | Across repeats |
| Flake rate | $\sigma(F_2)$ across repeats | Lower = more stable architecture |
| Cache hit ratio | `scoutCacheReadTotal / scoutInputTotal` | Higher under fan-out if scouts share system prefix |
| Cost efficiency | $F_2 / \text{costUSD.total}$ | "Quality per dollar" scalar |

---

## 7. Scripted Workflow Implementation

### 7.1 Workflow Orchestration

The experiment is driven by a `pi-dynamic-workflows` script that orchestrates
the full pipeline per architecture-per-task-per-repeat.

```
scripts/scout-bench/
  run-bench.mjs          # main workflow script (pi-dynamic-workflows)
  aggregate.ts           # deterministic RRF/quorum/union (no LLM)
  ledger.ts              # JSONL ledger appender + validator
  tasks/
    loc-1/               # task definition + ground truth
      prompt.md
      ground-truth.json
    loc-2/
    loc-3/
    ret-1/
    ret-2/
    ret-3/
    prune-1/
    prune-2/
    prune-3/
  fixtures/
    cached-skills/       # frozen SKILL.md files for ret-1
    cached-docs/         # frozen doc excerpts for ret-2
    cached-registry/     # frozen registry nodes for ret-3
    registry-20/         # 20-skill snapshot for prune-1
    tools-15/            # 15-tool manifest for prune-2
    craft-50/            # 50-entry craft snapshot for prune-3
  data/
    ledger.jsonl         # append-only run ledger
    run-manifest.json    # commit SHA, fixture checksums, run config
    validation-failures.jsonl  # dropped candidates log
    fixture-checksums.sha256
  analysis/
    pareto.ts            # Pareto frontier computation + SVG chart generation
    summary.ts           # aggregate statistics across runs
```

### 7.2 Workflow Script Skeleton (`run-bench.mjs`)

```javascript
// Pseudo-code structure — actual implementation uses pi-dynamic-workflows API
export default async function runBench({ workflow, agent, parallel }) {
  const ARCHITECTURES = ['A', 'B', 'C', 'D'];
  const TASKS = ['loc-1','loc-2','loc-3','ret-1','ret-2','ret-3','prune-1','prune-2','prune-3'];
  const K_VALUES = [3, 4, 5, 6];  // for Arch C/D
  const REPEATS = 5;

  for (const task of TASKS) {
    const prompt = readTaskPrompt(task);
    const groundTruth = readGroundTruth(task);

    // Architecture A: single standard flash
    for (let r = 0; r < REPEATS; r++) {
      const result = await agent({
        model: 'antigravity/gemini-3.7-flash',
        effort: 'low',
        prompt: formatScoutPrompt(prompt, { strategy: 'full' }),
        tools: ['read', 'grep', 'find', 'ls'],
      });
      const merged = aggregate([result], { algorithm: 'passthrough' });
      const verdict = await judgeResult(merged, groundTruth, task, 'A', r);
      appendLedger(verdict);
    }

    // Architecture B: single ultra-lite
    for (let r = 0; r < REPEATS; r++) {
      const result = await agent({
        model: 'google-antigravity/gemini-3.5-flash-lite',
        prompt: formatScoutPrompt(prompt, { strategy: 'full' }),
        tools: ['read', 'grep', 'find', 'ls'],
      });
      const merged = aggregate([result], { algorithm: 'passthrough' });
      const verdict = await judgeResult(merged, groundTruth, task, 'B', r);
      appendLedger(verdict);
    }

    // Architecture C: parallel fan-out (test each K)
    for (const K of K_VALUES) {
      const partitions = generatePartitions(task, K);
      for (let r = 0; r < REPEATS; r++) {
        const results = await parallel(
          partitions.map((partition, i) => () => agent({
            model: 'google-antigravity/gemini-3.5-flash-lite',
            prompt: formatScoutPrompt(prompt, {
              strategy: partition.strategy,
              partition: partition.scope,
            }),
            tools: ['read', 'grep', 'find', 'ls'],
          }))
        );
        const merged = aggregate(results, { algorithm: 'rrf', k: 60 });
        const verdict = await judgeResult(merged, groundTruth, task, 'C', r, { K });
        appendLedger(verdict);
      }
    }

    // Architecture D: cascaded funnel (test each K)
    for (const K of K_VALUES) {
      const partitions = generatePartitions(task, K);
      for (let r = 0; r < REPEATS; r++) {
        // Tier 1: parallel lite scouts
        const tier1Results = await parallel(
          partitions.map((partition) => () => agent({
            model: 'google-antigravity/gemini-3.5-flash-lite',
            prompt: formatScoutPrompt(prompt, {
              strategy: partition.strategy,
              partition: partition.scope,
            }),
            tools: ['read', 'grep', 'find', 'ls'],
          }))
        );
        const tier1Merged = aggregate(tier1Results, {
          algorithm: 'rrf', k: 60, topN: 2 * K
        });

        // Tier 2: precision verifier
        const verified = await agent({
          model: 'antigravity/gemini-3.7-flash',
          effort: 'low',
          prompt: formatVerifierPrompt(prompt, tier1Merged.candidates),
          tools: ['read', 'grep', 'find', 'ls'],
        });
        const verdict = await judgeResult(verified, groundTruth, task, 'D', r, { K });
        appendLedger(verdict);
      }
    }
  }
}
```

### 7.3 Judge Call Protocol

The Opus judge receives a structured evaluation prompt:

```markdown
You are evaluating a scout's output against ground truth.

## Task
{task_prompt}

## Ground Truth Candidates
{ground_truth_json}

## Scout Output
{merged_candidates_json}

## Instructions
1. For each ground-truth candidate, determine if it appears in the scout output
   (match by canonical path, allowing minor normalization differences).
2. For each scout output candidate NOT in ground truth, flag as false positive.
3. Compute: TP, FP, FN, R, P, F2.
4. Output ONLY the structured JSON verdict per the schema.
```

---

## 8. Research Dissemination & Publication Plan

### 8.1 Gaia Research Blog Post

Published via the `/gaia-blog-post` standard (Nova persona):

- **Title (working):** "The $0.003 Scout Fleet: When Cheap Models in Parallel Beat Expensive Ones Alone"
- **Hook:** Opens with the cost comparison ($0.003 for 4 cheap scouts vs. $0.003 for 1 expensive scout) and the counterintuitive result.
- **Milim editorial thumbnail:** Generated via `milim-editorial-thumbnail` skill. Scene concept: tiny Milim standing at the center of a radial fan-out of paper airplanes (scouts), each trailing a different colored path, against a vast twilight sky. Dramatic scale (Milim ~5% frame height), 16:9 aspect.
- **Interactive SVG Pareto curves:** `scripts/scout-bench/analysis/pareto.ts` generates self-contained SVG charts embedded in the blog post:
  - X-axis: Cost (USD), Y-axis: $F_2$ score, color: Architecture, size: $K$.
  - Pareto frontier highlighted; dominated solutions grayed.
  - Hover tooltips with exact values.
- **Anti-slop guardrails (per SKILL.md):** No unratified claims, no fabricated specificity, every number traces to a committed ledger record, `check-claims.ts`-compatible fencing.

### 8.2 Dedicated Research Receipt

`content/reports/parallel-scouting-economics.md` (or `content/reports/postmortems/parallel-scouting-economics.md`):

- Full methodology, raw results tables, statistical analysis.
- Every claim fenced with `<!-- ledger-claims:begin -->` / `<!-- ledger-claims:end -->`.
- Numbers that are uncommitted (e.g. from gitignored intermediate runs) carry the `‡` sigil.
- Links to committed ledger records by `benchmarkId` + `taskId` + `repeatIndex`.

---

## 9. Implementation Phases

### Phase 0: Fixture Preparation (1-2 days)

1. Create `scripts/scout-bench/` directory structure.
2. Hand-curate ground-truth candidate lists for all 9 tasks.
3. Freeze fixture files in `scripts/scout-bench/fixtures/`.
4. Record commit SHA + fixture checksums in `run-manifest.json`.
5. Write `ledger.ts` (adapt from `scripts/hell-heaven-bench/ledger.ts`).

### Phase 1: Single-Scout Baselines (1 day)

6. Implement Architecture A runner (single `worker-flash-low`).
7. Implement Architecture B runner (single `scout-flash-lite`).
8. Run 5 repeats per task per architecture (90 total runs).
9. Validate ledger records, compute initial R/P/F2 distributions.

### Phase 2: Parallel Fan-Out (2-3 days)

10. Implement `aggregate.ts` (RRF, quorum, union, schema validation).
11. Implement Architecture C runner with `parallel()` dispatch.
12. Test at $K \in \{3, 4, 5, 6\}$ x 9 tasks x 5 repeats = 720 runs.
13. Implement fan-out strategy variations (subspace, perspective, diverse query).

### Phase 3: Cascaded Funnel (1-2 days)

14. Implement Architecture D runner (Tier 1 parallel + Tier 2 verifier).
15. Test at $K \in \{3, 4, 5, 6\}$ x 9 tasks x 5 repeats = 720 runs.
16. Compare Tier 2 prune rate across configurations.

### Phase 4: Judge & Analysis (1-2 days)

17. Implement judge call protocol (Opus evaluation).
18. Run judge across all architecture outputs.
19. Implement `analysis/pareto.ts` for Pareto frontier computation.
20. Implement `analysis/summary.ts` for aggregate statistics.
21. Generate SVG charts.

### Phase 5: Publication (1-2 days)

22. Write `content/reports/parallel-scouting-economics.md` with full results.
23. Write blog post via `/gaia-blog-post` skill.
24. Generate Milim editorial thumbnail.
25. PR review, `check-claims.ts` gate (if wired), ledger validation.

---

## 10. Files to Modify

| File | Change |
|---|---|
| `docs/idea-bank/README.md` | Add Rank 20 entry for this idea |
| `docs/idea-bank/parallel-cheap-scouting-cost-performance.md` | New idea bank document |
| `scripts/scout-bench/run-bench.mjs` | New: main workflow orchestrator |
| `scripts/scout-bench/aggregate.ts` | New: deterministic RRF/quorum/union/validator |
| `scripts/scout-bench/ledger.ts` | New: JSONL ledger (adapted from hh-ledger) |
| `scripts/scout-bench/tasks/*/prompt.md` | New: task prompts (9 files) |
| `scripts/scout-bench/tasks/*/ground-truth.json` | New: ground truth (9 files) |
| `scripts/scout-bench/fixtures/**` | New: frozen fixture files |
| `scripts/scout-bench/data/ledger.jsonl` | New: append-only ledger |
| `scripts/scout-bench/data/run-manifest.json` | New: commit SHA + checksums |
| `scripts/scout-bench/analysis/pareto.ts` | New: Pareto frontier + SVG charts |
| `scripts/scout-bench/analysis/summary.ts` | New: aggregate statistics |
| `content/reports/parallel-scouting-economics.md` | New: research receipt |
| Blog post (path TBD via `/gaia-blog-post`) | New: blog post |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **`gemini-3.5-flash-lite` may be too weak** for codebase localization tasks, producing near-zero recall even at K=6 | Invalidates H1 | Pilot run: test Arch B on 1 task before committing to full matrix. If recall < 0.3, consider `gemini-3.5-flash` (non-lite) as the "cheap" model instead. |
| **Prompt-cache behavior is opaque** across Antigravity routing; cache hits may not be controllable or measurable | RQ4 becomes unanswerable | Record `cacheRead` tokens from harness logs; if consistently 0, note the limitation and drop RQ4 from conclusions. |
| **Fan-out latency variance** may be high due to API rate limits or Antigravity router queuing | p95 latency spikes | Implement exponential backoff + jitter; record both parallel and sequential wall-clock for fair comparison. |
| **Ground-truth curation bias** | Biased toward patterns the curator knows about | Mitigate with second-reviewer pass and Opus tiebreaker for disputed candidates. |
| **Judge cost overrun** | At 180 calls x ~$0.01 each = ~$1.80, within cost meter. But at 5 repeats x 4 K-values x 9 tasks x 4 architectures = 720 calls if fully crossed | Apply judge only to aggregated architecture outputs, not per-scout. Hard cap $5.00 total judge spend. |
| **Antigravity model routing changes** | `flash-lite` route may be renamed or pricing may change between experiment start and publication | Pin exact model route in `run-manifest.json`; record pricing snapshot at experiment start. |
| **Stale `pi-cost` pricing table** | `pi_cost.py` may not reflect latest pricing | Verify pricing against Antigravity dashboard before experiment; update `MODEL_PRICING` if needed. |
| **Lexicon gate flags** | Terms like `seed`, `meter`, `lean` may trigger `check-lexicon.ts` | Use only in their technical senses; add `except` patterns if needed per CLAUDE.md policy. |

---

## 12. Success Criteria

| Criterion | Threshold |
|---|---|
| At least one Architecture C configuration Pareto-dominates Architecture A | $F_2(C) \geq F_2(A)$ AND $\text{cost}(C) < \text{cost}(A)$ |
| All 9 tasks have completed ground-truth curation with second-reviewer sign-off | 9/9 |
| Full ledger with $\geq 5$ repeats per cell, all passing `ledger.ts validate` | 100% valid |
| Blog post passes anti-slop review per SKILL.md guardrails | 0 fabricated claims |
| Total experiment cost (scouts + verifiers + judge) under $20 | Actual < $20 |
| Research receipt (`parallel-scouting-economics.md`) committed with ledger fencing | Fenced, traceable |

---

*Plan drafted by Gaia Research. Not yet executed. Receipts before results.*
