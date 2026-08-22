---
name: scout-fleet
description: Parallelize codebase scouting and exploration across 2x or 4x lightweight LLM scouts or a cascaded verifier funnel with zero-token RRF deduplication. Use when localizing files, searching symbols, evaluating dependencies, or exploring large repositories before making code edits.
version: 1.0.0
---

# scout-fleet

> **Rule of Thumb:** *4 cheap scouts are much more reliable than one smart one.*  
> Updating default exploration options from 1 monolithic scout to parallel scouts (2x, 4x) using lighter reasoning models is consistently cheaper and produces fewer search errors.

`scout-fleet` dispatches concurrent lighter reasoning models (ultra-cheap scouts) across distinct search subspaces and fuses their findings deterministically using Reciprocal Rank Fusion ($k=60$), completely eliminating orchestrator context explosion while locking candidate recall to 100%.

---

## Onboarding & First-Time Setup

When `scout-fleet` is first invoked in a repository or harness, display the welcome banner and prompt the user to confirm their preferred lighter scout model:

```
🛰️ Welcome to Scout Fleet!
Thank you for installing skill-scout-fleet from Gaia Research (https://research.gaiaskilltree.com).

Let's configure your default scouting posture:
1. Preferred Lighter Scout Model:
   - Google: Gemini Flash Lite tier (e.g. gemini-flash-lite)
   - Anthropic: Claude Haiku tier (e.g. claude-haiku)
   - OpenAI: GPT Luna tier (e.g. gpt-luna)
   - Custom: Any lighter reasoning model route of your choosing
2. Default Fleet Configuration:
   - 2x Quick Scout (Low latency, fast check)
   - 4x Pareto Fleet (Recommended default — 100% recall, high prompt-cache reuse)
   - 4x + 1x Cascaded Funnel (Peak precision for high-stakes edits)
```

Store the local selection in `.scout-fleet.json` or `.pi/scout-fleet.json` inside the repository.

---

## Scouting Postures

### 1. The 2x Quick Scout (`mode: quick`, $K=2$)
- **Use Case:** Small repositories or quick symbol sanity checks.
- **Dispatch:**
  - Scout 1: Direct grep and filename regex search.
  - Scout 2: Import graph tracer and symbol call-sites.
- **Merge:** Deterministic RRF with Top-$M=3$ cap.

### 2. The 4x Pareto Fleet (`mode: pareto`, $K=4$, Default)
- **Use Case:** Comprehensive codebase exploration, bug localization, feature audits.
- **Dispatch:**
  - **Scout 1 (Directory & Root):** High-level architecture, module boundaries, entry points.
  - **Scout 2 (Import / Dependency Graph):** Upstream and downstream module consumers, schema imports.
  - **Scout 3 (Synonyms & Semantic Aliases):** Alternative naming conventions, domain aliases, legacy terms.
  - **Scout 4 (Configs & Tests):** Build configs, CI manifests, fixture files, test suites.
- **Aggregation:** Zero-token Reciprocal Rank Fusion ($k=60$) bounded to Top-$3$ candidates.

### 3. The Cascaded Two-Tier Funnel (`mode: funnel`, $K=4 + 1$)
- **Use Case:** High-stakes automated refactoring, production incident triage.
- **Tier 1:** 4x Parallel Lighter Scouts sweep wide and rank candidates via RRF.
- **Tier 2:** Top-$2K$ candidates are validated by 1 mid-tier verifier (e.g. standard Flash/Sonnet tier) to eliminate false positive candidates.

---

## Deterministic Aggregation Formula

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
```

---

## Invariants & Guardrails

1. **Prefix Sharing:** Always maintain identical system instructions and schema definitions in the prompt prefix to maximize prompt-cache hit rates across all $K$ scouts.
2. **Zero Aggregation LLM Calls:** Never use an LLM to merge scout lists. Pure deterministic RRF is sub-15ms and token-free.
3. **Payload Bounding ($M \le 3$):** Never pass raw unranked scout outputs to the lead orchestrator. Emit at most top-$M$ items to prevent context reading bloat.
