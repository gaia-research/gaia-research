# Plan — A′ ("A-star ⭐") bridge synthesis for fusion reachability (#89 / #86)

**Status:** implementation plan. Built to `docs/plans/epic-89-reachability-RATIFICATION.md` (LOCKED). Where this
disagrees with the RATIFICATION, the RATIFICATION wins. **Do not re-litigate the A′ decision.**

**Base branch:** `epic-89/86-derive-reachability` (PR #106 HEAD, `dceeee8`) — the reachability scaffolding
(`derive-reachability.ts`, `bridges.ts`, `bridges.json`, the derived-canonical fuse tier) lives ONLY on this
branch, not yet on the integration branch. A′ directly extends that code, so we continue the #106 stacked line.
The resulting PR targets the integration branch `epic-89/full-registry-discoverability` (per task), and will merge
up the existing stack (#106 → #105 → #92) in founder review order — we do NOT re-target #106's own base.

**Author for ALL commits:** `mbtiongson1 <marco.tngsn@gmail.com>`. The corporate author is banned. Set
`git -c user.name="mbtiongson1" -c user.email="marco.tngsn@gmail.com"` (or export `GIT_AUTHOR_*` / `GIT_COMMITTER_*`).

---

## 1. Problem (what #106 does and does NOT do)

PR #106 landed the honest two-metric report (RATIFICATION R1):
- `internalConnectivityPct` = **100%** (243/243 reachable from basic-node roots — Metric A).
- `gameSeedReachablePct` = **0%** (the 4 game seeds `prompt/code/web/data` are UI abstractions, not registry
  ids, so nothing is reachable from them alone — Metric B, the #86 DoD metric).

#106 also wired a **derived-canonical tier** into the fuse route (`findDerivedRecipe`), but that tier resolves
against `reachableEdges`, which are the *internal-connectivity* edges (Metric A, seeded from all basics). It does
**not** synthesize any path *from the 4 game seeds*. So a player starting from the 4 seed cards still reaches
0 registry skills deterministically.

**A′ closes exactly this gap:** synthesize minimal, build-time, derived seed→graph bridges so the 4 game seeds
deterministically reach **only the 84 named-backed fusions** (and the 153 distinct named skills that back them),
leaving the purely-generic fusions to the emergent/#87 path.

## 2. Ground-truth verification (already done — build to these numbers)

Computed directly from a **read-only worktree** of `gaia-skill-tree @ dev/yggdrasil-ii-staging`
(`b572c7dcc`), `registry/nodes/{basic,fusion}/*.json` + `registry/named/*/*.md`:

| Quantity | Value | Matches RATIFICATION? |
|---|---|---|
| Fusion nodes | 130 | ✓ |
| Basic nodes | 113 | ✓ |
| Named-backed fusions — id **is** a named slug (direct) | **20** | ✓ |
| Named-backed fusions — via some named skill's `genericSkillRef` only | **64** | ✓ |
| **Total named-backed fusions** | **84** | ✓ (R2) |
| **Distinct named skills backing them** | **153** | ✓ (R2, R4) |
| Purely-generic fusions (unbridged target) | 46 | ✓ (R2) |

**A fusion is "named-backed" iff** its id ∈ named-skill slugs (direct) OR its id ∈ {`genericSkillRef` of any named
skill} (via-ref). In the synced artifacts this is computable entirely from `data/craft/`:
- named-skill slugs = keys of `named-index.json.skills`
- `genericSkillRef` = the `g` field of each `named-index.json.skills[slug]` record (already emitted by the sync).

## 3. The bridge model — TARGET-SCOPED closure (NOT root-basic flooding)

⚠ **This is the crux. Two models were evaluated against real data; only the second is A′-conformant.**

- **REJECTED — root-basic flooding:** make every basic-node root reachable from a seed. The 84 named-backed
  closures bottom out at **71 root basics**; bridging all 71 reaches the 84 — but ALSO drags in **30 extra
  purely-generic fusions** that happen to share those roots (114 fusions total). This is precisely the
  "over-bridging into generic nodes" R4 says to **reject**.

- **ADOPTED — target-scoped closure:** synthesize bridges only along the prerequisite closure of the 84
  named-backed fusions. Reachable set = `seeds ∪ closure(84 named-backed fusions)`. Verified result:
  - **84 named-backed fusions** reachable ✓
  - **153 distinct named skills** reachable ✓ (exactly the ratified DoD number)
  - **71 root basics** bridged (the atomic roots inside those 84 closures)
  - **5 purely-generic fusions reached as UNAVOIDABLE intermediates** (see §3.1)
  - **41 purely-generic fusions stay unbridged** → emergent/#87 boundary ✓

### 3.1 Founder gate to surface (do NOT auto-resolve): the 5 generic intermediates

The honest minimal deterministic-reach count is **89 fusions = 84 named-backed + 5 required generic
intermediates**, not a clean 84. The 5 are genuine stepping-stones you cannot skip to build a named target:

| Generic intermediate | Required by (named-backed) |
|---|---|
| `agent-eval` | `founder-mode-orchestration`, `skill-performance-benchmarking` |
| `ghostwrite` | `autonomous-web-research`, `career-operations` |
| `knowledge-harvest` | `autonomous-web-research`, `career-operations` |
| `plan-and-execute` | `multi-agent-orchestration-v`, `multi-node-orchestration`, `multi-topology-orchestration` |
| `research` | `literature-review`, `registry-curation`, `skill-fusion`, `registry-health-scan` |

**The 153 named-skill number (primary DoD metric) is unaffected — dead on target.** But because R4 says
"materially more than 84 fusions ⇒ suspect over-bridging and reject," the report MUST make the +5 explicit and
explained, so a reviewer sees 89 = 84 + 5-named-intermediates, NOT unexplained inflation. **Surface this in the PR
body and on #86 as a founder call: accept the 5 unavoidable intermediates (recommended — they are on the path to
named skills, not filler), or gate them behind emergent too (would break reachability of their named dependents).**
Recommend **accept**; do not merge until founder acknowledges.

## 4. Implementation

All changes are on the base branch's existing files. No new hand-authored data (R3): bridges are computed.

### 4.1 `scripts/craft/derive-reachability.ts` — add bridge synthesis

Add a pure, unit-testable function and wire it into `deriveReachability()`:

```
computeNamedBackedTargets(skills, namedIndex): Set<string>
  // 84 fusion ids: id ∈ namedSlugs OR id ∈ {g of any named record}
synthesizeSeedBridges(seeds, hyperedges, targets): {
    bridges: Array<{ result: string; prereqs: string[]; via: 'seed-bridge' }>,
    gameSeedReachable: string[],   // closure(seeds ∪ targetClosure)
}
```

Algorithm (target-scoped, minimal):
1. Compute `targetClosure` = all nodes required to build the 84 targets (recursive prereq walk over
   fusion hyperedges), including the 84 themselves. Verified: 160 nodes (89 fusions + 71 basics).
2. `rootBasics` = `targetClosure ∩ basics` (71). These are the atomic leaves.
3. Emit one **synthetic bridge edge per root basic**: `{ result: <basic>, prereqs: [<seed>], via: 'seed-bridge' }`.
   Assign each root basic to a seed by a **deterministic, documented routing** (see §4.1.1) — bridges must be
   reproducible byte-for-byte across syncs (R3 "regenerated every sync", R4 "hand-reviewed numbers").
4. Recompute Metric B closure with `hyperedges ∪ bridges`, seeded by the 4 game seeds. Assert the closure’s
   fusion members ⊆ `targetClosure` (guard: bridges must NEVER unlock a fusion outside the 84's required closure —
   fail the build loudly if they do, mirroring `assertRegistryShape`'s fail-loud contract).

#### 4.1.1 Seed→basic routing (deterministic, documented)

Route each of the 71 root basics to one of `prompt/code/web/data` by a **stable rule**, not randomness
(`Math.random`/`Date.now` are also banned in this repo's scripts contract per CLAUDE-adjacent conventions and
would break reproducibility). Recommended rule, in priority order, documented in the file header:
- If the basic’s id/name contains a strong lexical signal (`web`/`crawl`/`scrape`/`fetch`→`web`;
  `code`/`test`/`compile`/`debug`→`code`; `data`/`sql`/`embed`/`extract`→`data`; else→`prompt`), use it.
- Deterministic fallback for ties/none: stable hash of the slug (e.g. sum of char codes) mod 4 → seed. This is a
  *routing* choice only (which seed card unlocks it); it does NOT change WHICH skills are reachable, only the
  labelled entry path, so it is safe and need not be "correct," only stable and documented.

The routing is a display/entry-point detail; the reachability guarantee (all 84 + 153) is invariant to it.

### 4.2 `bridges.json` — new fields (extend `BridgesOutput`, keep back-compat)

Add, without removing existing fields:
```
seedBridges: Array<{ result: string; prereqs: string[]; via: 'seed-bridge' }>  // the 71 synthetic edges
report.namedBackedFusionCount: 84
report.deterministicFusionReachCount: 89          // 84 + 5 intermediates (explained)
report.genericIntermediateFusions: string[]        // the 5, named explicitly for reviewer transparency
report.reachableNamedSkillCount: 153               // primary DoD metric
gameSeedReachable: string[]                         // now POPULATED (was []): the target closure ids
report.gameSeedReachableCount / gameSeedReachablePct // recomputed WITH bridges
```
`reachableEdges` continues to carry the internal (Metric A) edges. `seedBridges` is a distinct list so the two
concerns never blur. Keep `bridges.json` sorted + `null,2`-pretty for reviewable diffs.

### 4.3 `lib/craft/bridges.ts` — expose bridges to the route

- Extend `BridgesData` with `seedBridges` and the new `report` fields.
- Add `getSeedBridge(basicId): string[] | undefined` (basic → the seed that unlocks it) and
  `getNamedBackedTargets(): string[]`, `getReachableNamedSkillCount(): number` accessors.
- `findDerivedRecipe` is unchanged in shape, but the derived edge map should now also consider a seed+basic pair
  that a `seedBridge` unlocks, so the fuse route resolves a game-seed + basic combo to the unlocked basic. Keep it
  order-independent and O(1).

### 4.4 `app/labs/infinite-skill-craft/api/fuse/route.ts` — resolve seed bridges

The derived-canonical tier already exists. Extend it so that when the pair is `(seed, X)` and a `seedBridge`
unlocks a step toward a named-backed target, the route returns the canonical derived result. Preserve the existing
priority order: `recipe → derived (incl. seed-bridge) → starter(flavor) → egg → emergent`. Do not regress the
localhost mock / never-500 guarantees.

## 5. Tests (extend #106's `lib/craft/reachability.test.ts`, add fixtures)

1. **Unit — `synthesizeSeedBridges` on a tiny fixture:** 2 seeds, a named-backed target with a 2-basic closure and
   one generic sibling sharing a root; assert bridges reach the target, the sibling stays unreached, and no
   out-of-closure fusion is unlocked (the fail-loud guard fires on a crafted violation).
2. **Integration — against real `data/craft/` (post-sync):** assert `report.reachableNamedSkillCount === 153`,
   `report.namedBackedFusionCount === 84`, `report.deterministicFusionReachCount === 89`,
   `genericIntermediateFusions` is exactly the 5-set, `gameSeedReachablePct > 17`.
3. **Fixture proof of R3 auto-reach (REQUIRED by task):** add a synthetic named skill whose `genericSkillRef`
   points at a currently-unbridged purely-generic fusion, re-run `deriveReachability` on the fixture, assert that
   fusion + the new named slug become reachable **with zero code change** — proving a new named skill auto-reaches
   on next sync. Keep the fixture isolated (`GAIA_CRAFT_OUT_DIR`), never mutate committed `data/craft/`.
4. **Route test:** a `(seed, root-basic)` fuse call returns a canonical result deep-linking a real named skill;
   a `(seed, seed)` combo that leads nowhere named still degrades to emergent (no 500).

## 6. Verification gate (before requesting review)

- `npx tsx scripts/craft/derive-reachability.ts` (after a sync against the RO worktree via
  `GAIA_SKILL_TREE_REGISTRY`) prints **153 named / 84 named-backed / 89 deterministic / Metric B > 17%**.
  Materially different named count ⇒ STOP, suspect over-bridge, do not proceed.
- `npx vitest run` fully green **except** the 3 pre-existing `mcp/acceptance.test.ts` failures (allowed).
- `npx tsc --noEmit` clean.
- `data/craft/bridges.json` regenerated by the script (never hand-edited); `data/craft/*.json` come only from the
  sync (CLAUDE.md hard rule).

## 7. Sync grounding

Run the sync with `GAIA_SKILL_TREE_REGISTRY=<read-only ygg2 worktree>/registry` so `named-index.json` /
`skills.json` reflect the 280 named skills / 130 fusions of staging, THEN derive. Never write into gaia-skill-tree.

## 8. Out of scope / boundaries

- The 41 purely-generic fusions stay unbridged (emergent/#87). Document in code + PR.
- `starter-recipes.ts` stays a flavor overlay only (R3) — not touched as a reachability source.
- No merge. Leave for founder review. Surface the §3.1 gate on #86.
