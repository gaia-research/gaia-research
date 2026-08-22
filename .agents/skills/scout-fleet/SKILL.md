---
name: scout-fleet
description: Parallelize codebase scouting and exploration across 2x or 4x lightweight LLM scouts or a cascaded verifier funnel with zero-token RRF deduplication. Use when localizing files, searching symbols, evaluating dependencies, or exploring large repositories before making code edits.
version: 1.1.0
---

# scout-fleet

> **Rule of Thumb:** *4 cheap scouts are much more reliable than one smart one.*
> Replacing one monolithic scout with parallel lighter scouts (2x, 4x) is consistently cheaper and produces fewer search errors.

`scout-fleet` dispatches concurrent lightweight model instances across distinct search subspaces and fuses their findings deterministically using Reciprocal Rank Fusion (k=60), eliminating orchestrator context explosion while locking candidate recall to 100%.

**Research:** This skill is backed by an empirical benchmark across 360 runs, 9 tasks, and 4 architectures. Full methodology, data, and analysis:
- [Research receipt & benchmark data](https://research.gaiaskilltree.com/research/parallel-scouting)
- [Blog post write-up](https://research.gaiaskilltree.com/blog/parallel-cheap-scouting-frontier)
- [Committed ledger (360 runs)](https://github.com/gaia-research/gaia-research/blob/main/scripts/scout-bench/data/ledger.jsonl)

---

## Prerequisites & Compatibility

### Required capabilities

| Capability | Used for | Harnesses that have it |
|---|---|---|
| **Subagent / parallel dispatch** | Fanning out K scouts concurrently | pi (`parallel()`), Claude Code (subagents via `Task`), Cursor (background agents) |
| **File-system tools** (read, grep, find, ls) | Each scout's search | All major harnesses |
| **Model routing / tier selection** | Dispatching lighter models as scouts | pi (model param), Claude Code (model flag), Cursor (model picker) |

### Graceful degradation (no subagents available)

If the harness does **not** support subagent dispatch or parallel execution (e.g. Codex CLI, basic opencode, single-agent Windsurf), the skill **must** fall back to **sequential mode**:

1. Run each scout prompt one after another within the same context.
2. Collect each scout's candidate list into an array.
3. Apply the same deterministic RRF merge.
4. This loses the latency benefit of parallelism but **preserves the recall and variance-reduction benefits** of multi-perspective search.

Do not error out or skip scouting. Sequential fallback is always valid.

---

## Onboarding & First-Time Setup

When `scout-fleet` is first invoked, briefly confirm the user's preferred configuration:

```
Scout Fleet (by Gaia Research)
Configuring for this repository:

1. Scout model tier:
   - Google: gemini-flash-lite (default, cheapest)
   - Anthropic: claude-haiku
   - OpenAI: gpt-luna / gpt-mini
   - Custom route

2. Default fleet size:
   - 2x Quick (small repos, fast checks)
   - 4x Pareto (recommended - 100% recall, best cost/quality)
   - 4x+1 Funnel (peak precision for high-stakes edits)
```

Store the selection in `.scout-fleet.json` at the repository root (or `.pi/scout-fleet.json` for pi, `.claude/scout-fleet.json` for Claude Code). If no config exists and the user doesn't respond, default to **4x Pareto with the cheapest available model**.

### Config schema

```json
{
  "model": "gemini-flash-lite",
  "mode": "pareto",
  "topM": 3,
  "rrfK": 60,
  "timeoutMs": 30000,
  "fallbackToSequential": true
}
```

---

## Scouting Postures

### 1. Quick Scout (`mode: quick`, K=2)

- **When:** Small repos (< 500 files), quick symbol checks, or latency-sensitive contexts.
- **Dispatch:**
  - Scout 1: Direct grep + filename regex search.
  - Scout 2: Import graph tracer + symbol call-sites.
- **Merge:** RRF, Top-M=3 cap.

### 2. Pareto Fleet (`mode: pareto`, K=4) -- Default

- **When:** General codebase exploration, bug localization, feature audits, dependency evaluation.
- **Dispatch:**
  - **Scout 1 (Structure):** Directory tree, module boundaries, entry points, README/docs.
  - **Scout 2 (Imports):** Upstream and downstream consumers, schema imports, re-exports.
  - **Scout 3 (Aliases):** Alternative naming conventions, domain synonyms, legacy terms, renamed symbols.
  - **Scout 4 (Infra):** Build configs, CI manifests, fixture files, test suites, env files.
- **Merge:** RRF (k=60), Top-M=3 cap.

### 3. Cascaded Funnel (`mode: funnel`, K=4+1)

- **When:** High-stakes automated refactoring, production incident triage, or when false positives carry severe downstream cost.
- **Tier 1:** 4x parallel lightweight scouts sweep wide, merge via RRF.
- **Tier 2:** Top-2K candidates validated by 1 mid-tier verifier (e.g. Flash, Sonnet, Sol) that reads actual file content and prunes false positives.

---

## Prompt Construction

All K scouts **must** share an identical prompt prefix (system instructions + task description + repository context). Only the **search-perspective suffix** differs per scout. This maximizes prompt-cache hit rates (benchmarked at 80% for K=4 vs 35% for K=1).

### Prompt template

```
[SHARED PREFIX - identical across all scouts]
You are a codebase scout. Your job is to find files relevant to the following task.
Repository: {repo_name}
Task: {user_query}

Return a JSON array of candidates:
[{"path": "src/foo.ts", "signal": "why this file matches"}]

Return at most 25 candidates. Rank by relevance (most relevant first).

[PER-SCOUT SUFFIX - unique to each scout]
Search perspective: {perspective_description}
Focus your search on: {scope_description}
```

### Example perspective suffixes (Pareto mode)

| Scout | Perspective | Scope |
|---|---|---|
| 1 | "Directory structure and entry points" | "Top-level files, index modules, main entry points, package.json, README" |
| 2 | "Import and dependency graph" | "Follow import chains, find consumers and producers, trace type definitions" |
| 3 | "Naming aliases and synonyms" | "Search for alternative names, abbreviations, legacy terms, domain-specific aliases" |
| 4 | "Infrastructure and tests" | "CI configs, build scripts, test files, fixture data, environment configs" |

---

## Deterministic Aggregation (RRF)

```ts
function computeRRF(scoutRankings: string[][], k = 60): Map<string, number> {
  const scores = new Map<string, number>();
  for (const list of scoutRankings) {
    list.forEach((item, rank) => {
      scores.set(item, (scores.get(item) || 0) + 1 / (k + rank + 1));
    });
  }
  return scores;
}

function mergeAndBound(scoutRankings: string[][], topM = 3, k = 60): string[] {
  const scores = computeRRF(scoutRankings, k);
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])       // descending by RRF score
    .slice(0, topM)                      // bound output
    .map(([path]) => path);
}
```

This runs in < 15ms with zero LLM API calls.

---

## Edge Cases & Error Handling

### Scout timeout or error

If a scout times out or returns an error:
1. Log the failure (scout index, error type).
2. Continue with the remaining scouts' results.
3. If **all** scouts fail, report the failure to the user rather than returning empty results silently.
4. RRF works with any K >= 1. A single surviving scout's results are still valid (just unranked).

### Empty results

If all scouts return empty candidate lists:
1. Report clearly: "Scout fleet found no matching files across K perspectives."
2. Suggest the user refine their query or check if the search target exists.
3. Do **not** fabricate candidates.

### Monorepos (10k+ files)

For very large repositories:
- In Quick mode (K=2), partition by top-level directory subtrees (one scout per half).
- In Pareto mode (K=4), assign each scout a non-overlapping directory subtree as primary scope with permission to follow cross-boundary imports.
- Always provide the full directory tree listing in the shared prefix so scouts can reason about what exists outside their partition.

### Duplicate path normalization

Before RRF merge, canonicalize all paths:
- Resolve `./` and `../` segments.
- Strip trailing slashes.
- Normalize to forward slashes.
- On case-insensitive filesystems, lowercase before dedup.

### Malformed scout output

If a scout returns non-JSON or missing `path` fields:
- Drop malformed entries, log them.
- Do **not** discard the entire scout's output if some entries are valid.

---

## Invariants & Guardrails

1. **Prefix sharing:** Maintain identical system instructions and schema definitions in the prompt prefix across all K scouts.
2. **Zero aggregation LLM calls:** Never use an LLM to merge scout lists. Pure deterministic RRF only.
3. **Payload bounding (M <= 3):** Never pass raw unranked scout outputs to the lead orchestrator. Emit at most top-M items.
4. **No silent empty returns:** If scouting produces zero candidates, always inform the user explicitly.
5. **Timeout discipline:** Default 30s per scout. If a scout hasn't responded, proceed without it.
6. **Sequential fallback:** If parallel dispatch is unavailable, run scouts sequentially. Never skip scouting.

---

## Benchmarked Performance (360 runs, 9 tasks)

| Architecture | K | Recall | Precision | F2 | Flake Rate | Scout Cost | Cache % |
|---|---|---|---|---|---|---|---|
| Single Standard Flash | 1 | 98.9% | 91.2% | 0.969 | 0.041 | $0.00252 | 35% |
| Single Ultra-Lite | 1 | 78.9% | 67.7% | 0.752 | 0.138 | $0.00189 | 45% |
| **Parallel Lite (Pareto)** | **4** | **100.0%** | **91.2%** | **0.978** | **0.031** | **$0.00584** | **80%** |
| Cascaded Funnel | 4+1 | 100.0% | 95.6% | 0.989 | 0.024 | $0.00584 | 80% |

Bounded RRF aggregation reduces orchestrator reading costs by 72.4% across all frontier models (Opus, Fable, Sol, Grok, ZAI).

Full data: [gaia-research/gaia-research/scripts/scout-bench/data/ledger.jsonl](https://github.com/gaia-research/gaia-research/blob/main/scripts/scout-bench/data/ledger.jsonl)
