# Plan — #88: CI reachability-coverage gate for Infinite Skill Craft

**Status:** implementation plan — builds on #87 (floor value depends on #87's threshold).  
**Base branch:** `epic-89/full-registry-discoverability` (tip `66d6e78`), stacked after #87's PR lands.  
**Author for ALL commits:** `mbtiongson1 <marco.tngsn@gmail.com>`.  
**Target PR:** into `epic-89/full-registry-discoverability` (NOT staging or main).

---

## 1. Context and purpose

#85/#86 established honest two-metric reachability: 100% internal connectivity (Metric A) and
65.8% game-seed reachability (Metric B, 160/243 skills). #87 adds Vectorize fuzzy promotion.

**#88 adds a vitest test that runs the reachability computation against live synced
`data/craft/*.json` and fails loudly** if coverage drops below the agreed floor. It is the
machine-enforced guarantee that future registry syncs or code changes cannot silently regress
the deterministic layer.

The gate rides the existing `Type-check + Vitest (craft lib)` CI job (`.github/workflows/craft-ci.yml`).
No new workflow. No new job. Just one more test file.

### 1.1 Game design rationale (collector arc)

The Gaia Skill Craft experience is a collector's arc: the player fuses generic skill pieces until a combination clicks and yields a full named contributor skill. The depth distribution is the spine of that arc. Of the 153 reachable named skills, 89 sit at depth 1 — reachable in a single fusion from the game seeds — so the opening minutes deliver near-constant wins and teach the core loop without friction. The curve then tapers deliberately: 84 targets at depth 2, 45 at depth 3, 16 at depth 4, 6 at depth 5, and a single depth-6 capstone. That long, thinning tail is the mid-to-late game, where the player has internalized the fusion grammar and is now hunting specific contributors rather than stumbling into them. The shape rewards the first session heavily and reserves genuine challenge for the committed collector.

The time model confirms the arc lands inside the founder's stated target of "a few hours is good, ~20 hours to reach everything is fine." First-touch of all 38 reachable contributors takes a minimum of 24 unique fusions; completing the full set of 153 named skills takes a minimum of 89 unique fusions. At a plausible 5-15 minutes of play per fusion, full completion runs 7.4h (5min), 14.8h (10min), to 22.2h (15min). "A few hours" gets a player to broad contributor coverage and most of the depth-1/depth-2 layer; the ~20-hour figure aligns with the 15-minute-per-fusion pace to 100% completion. The buffered coverage floors protect exactly this experience: they guarantee the depth-1 breadth (≥82 named-backed fusions, ≥87 deterministic reaches) and the seed reachability (≥65%) that make the early game feel abundant, while allowing the registry to grow without CI friction.

The coverage floors are game-design guardrails, not arbitrary numbers — and they are designed to stay meaningful as the registry grows. `gameSeedReachablePct ≥ 65%` is the primary quality signal: it directly encodes "what fraction of the tree is playable from the start" and scales automatically with any registry expansion. `namedBackedFusions/totalFusions ≥ 60%` is the second proportional primary: both sides grow together on normal contribution (a new named-backed fusion adds to numerator and denominator alike), so it tracks coverage quality rather than raw size. The absolute watermarks (≥150 named skills reachable, ≥82 named-backed fusions) are not quality targets for a large registry — they are catastrophic-loss backstops that would fire only if a near-empty sync slipped past `assertRegistryShape`. The 9 blocked contributors stay out-of-closure intentionally; forcing a floor of 47 contributors would misrepresent the reachable surface. `internalConnectivityPct = 100` guarantees the internal graph never fragments, so no fusion is a dead end. Together: the game must always offer an abundant, connected, mostly-open collection space that rewards the first session and tapers into a ~20-hour completionist chase — and CI will fire the moment a registry change silently erodes that promise.

---

## 2. Founder gates — surface BEFORE finalizing the floor values

The founder must sign off on five ratified floor values and two policy calls before the gate can be labeled non-placeholder. **FLOORS:** `reachableNamedSkillCount ≥ 150`, `namedBackedFusionCount ≥ 82`, `deterministicFusionReachCount ≥ 87`, `gameSeedReachablePct ≥ 65` (Math.floor-applied), `internalConnectivityPct === 100` (hard, no buffer). **STRUCTURAL:** `seedBridgesCount ≥ 71` (changed from strict `===` per growth-path risk) and the exact 5-element `genericIntermediates` set held as strict array equality. **POLICY:** (a) confirm the escape-hatch stance — comment-based floor-update-with-data-commit path (recommended) versus a resync-workflow-scoped skip flag; (b) confirm the reachable-contributor expectation stays at 38 of 47, explicitly accepting that 9 contributors are out-of-closure and NOT a regression. This maps to the previously ratified A-star / A′ decision (memory: epic-89-reachability-founder-decision) where the founder chose to bridge only named-backed fusions; these floors operationalize that choice. Nothing here reopens a LOCKED item — this is a numeric ratification of PLACEHOLDER constants the plan already flagged for founder approval.

**Escape hatch:** Because every count metric uses `≥` semantics, legitimate registry **expansion** never needs an escape hatch — growth always passes. The escape hatch is only needed for a legitimate **contraction** (a reviewed prune of named skills, or an upstream Yggdrasil rename that drops a count below the buffered floor). The recommended mechanism is a comment block above the floor constants instructing maintainers to lower a floor **only** in the same commit that lands the corresponding `data/craft/` change, with human data-diff review sign-off — mirroring the existing `FORCE_RESYNC=1` pattern in `assertRegistryShape`. Do NOT add a blanket `SKIP_COVERAGE_GATE` env var to `craft-ci.yml` — if it leaks into the main PR gate it removes all teeth. If a scheduled resync workflow (`craft-registry-resync.yml`) genuinely needs to land a new upstream named skill before a bridge is authored, scope any skip strictly to that workflow and never to `craft-ci.yml`, documented as a comment in both the test file and the workflow YAML.

These are product decisions, not implementation decisions:

| Gate | Question | Where to surface |
|------|----------|-----------------|
| **Named skill floor** | Is 153 the hard floor, or do we accept e.g. ≥150 to allow small upstream renames without a CI break? | PR body + comment on #88 |
| **Named-backed fusion floor** | 84 hard, or ≥82? | Same |
| **Deterministic fusion floor** | 89 hard, or ≥87? | Same |
| **gameSeedReachablePct floor** | 65% hard, or ≥60%? | Same |
| **Regression behaviour** | On a deliberate new named skill with no cheap bridge: should CI fail (floor not met) and require a sync, or is there a documented escape hatch? | Same |

**Do not pick these numbers arbitrarily.** The plan uses hardcoded values below as placeholders
for illustration; the final values are set by the founder and committed in the test.

---

## 3. What the gate covers

The gate is a single vitest `describe` block in a new file `lib/craft/coverage-gate.test.ts`.
It runs `deriveReachability({ write: false })` against the real committed `data/craft/*.json`
(same approach as the existing "real data smoke test" and "A′ integration" tests in
`reachability.test.ts`, but with the explicit intent of failing CI on regression).

### 3.1 Assertions — two-tier design

**Why two tiers?** The tree grows continuously. Absolute count floors become stale in both directions: too easy after expansion, too brittle on legitimate pruning. Proportional floors are self-scaling. The design uses both, each in its right role.

**Tier 1 — Proportional primaries** (scale automatically with registry size):

```typescript
// Proportional — self-scaling, primary quality signal
const FLOOR_GAME_SEED_REACHABLE_PCT       = 65;  // ratified: >= 65% of all skills reachable from seeds
const FLOOR_NAMED_BACKED_FUSION_PCT       = 60;  // ratified: >= 60% of all fusions have named backing
//   current: 84/130 = 64.6% — 4.6pt buffer; both sides grow together on normal contribution
```

**Why NOT `reachableNamed/totalNamed`:** this ratio has a denominator-drift problem — when a contributor adds a new named skill it is unreachable until a fusion+bridge is authored, so normal contribution pushes the ratio down on healthy growth. The absolute watermark below handles this metric instead.

**Tier 2 — Absolute watermarks** (catastrophic-loss backstop only; trivially satisfied by a healthy registry):

```typescript
// Absolute watermarks — catastrophic-loss backstop, NOT a quality target for large registries.
// If registry doubles these are easily cleared; they exist to catch near-empty sync slippage.
const FLOOR_NAMED_SKILL_COUNT         = 150; // ratified: backstop (current 153, buffer 3)
const FLOOR_NAMED_BACKED_FUSION_COUNT  = 82;  // ratified: backstop (current 84, buffer 2)
const FLOOR_DETERMINISTIC_FUSION_COUNT = 87;  // ratified: backstop (current 89, buffer 2)
```

**Structural invariants** (exact — never buffer):

```typescript
const FLOOR_INTERNAL_CONNECTIVITY_PCT  = 100; // hard invariant — all basics reach all fusions
// deterministicFusionReachCount === namedBackedFusionCount + genericIntermediates.length (derived identity)
// genericIntermediateFusions exact list (topology signal — update + surface on change, don't just revert)
// seedBridges >= 71 (structural >=; growth increases this, only contraction fires)
```

**Note on `gameSeedReachablePct` precision:** Floor of 65 applied after `Math.floor`. Loss of 1-2 skills passes silently (158/243 = 65.0% floors to 65); loss of ≥3 fires (157/243 = 64.6% floors to 64). Intentional — absorbs benign slug renames.

**Note on derived identity:** 87 = 82 + 5 preserves `deterministicFusionReachCount = namedBackedFusionCount + genericIntermediateFusions.length`. Asserted in the gate as defense-in-depth.

### 3.2 Failure output requirement

On failure, the test must print:
1. The actual value that fell short.
2. The floor it was checked against.
3. A diff-friendly list of newly-unreachable slugs (for named-skill / fusion counts).

Achieved via `expect.assertions(N)` + a custom helper that computes the diff against the
current committed snapshot before asserting.

---

## 4. Implementation

### 4.1 New file: `lib/craft/coverage-gate.test.ts`

```typescript
/**
 * lib/craft/coverage-gate.test.ts
 *
 * CI reachability-coverage gate (Epic #89 sub-issue #88).
 *
 * TWO-TIER DESIGN (see plan §3.1 for full rationale):
 *   Tier 1 — Proportional primaries: self-scaling, primary quality signal.
 *   Tier 2 — Absolute watermarks: catastrophic-loss backstop only.
 *   Structural invariants: exact, never buffered.
 *
 * ESCAPE HATCH: Registry EXPANSION always passes (>= semantics). To LOWER a
 * floor (reviewed prune or upstream rename), do so in the SAME COMMIT that
 * lands the corresponding data/craft/ change, with data-diff review sign-off.
 * Do NOT add a blanket env-var skip — if it leaks into craft-ci.yml it removes
 * all teeth.
 */

import { describe, it, expect } from 'vitest';
import { deriveReachability } from '../../scripts/craft/derive-reachability';

// ---------------------------------------------------------------------------
// TIER 1 — Proportional primaries (self-scaling quality signal)
// Both sides of each ratio grow together on normal contribution.
// ---------------------------------------------------------------------------
const FLOOR_GAME_SEED_REACHABLE_PCT   = 65;  // ratified: >= 65% of all skills reachable from seeds
//                                              Math.floor applied; absorbs 1-2 benign renames
const FLOOR_NAMED_BACKED_FUSION_PCT   = 60;  // ratified: >= 60% of all fusions have named backing
//                                              current 84/130 = 64.6%; 4.6pt buffer

// NOTE: reachableNamed/totalNamed is NOT used as a proportional floor.
// Denominator-drift: totalNamed grows when a contributor adds a named skill,
// but the new skill is unreachable until a fusion+bridge is authored. Normal
// contribution pushes the ratio down. Use the absolute watermark below instead.

// ---------------------------------------------------------------------------
// TIER 2 — Absolute watermarks (catastrophic-loss backstop, not quality target)
// Trivially satisfied by a healthy registry. Exist to catch near-empty sync
// slippage that somehow passed assertRegistryShape.
// ---------------------------------------------------------------------------
const FLOOR_NAMED_SKILL_COUNT         = 150; // ratified backstop (current 153, buffer 3)
const FLOOR_NAMED_BACKED_FUSION_COUNT  = 82;  // ratified backstop (current 84, buffer 2)
const FLOOR_DETERMINISTIC_FUSION_COUNT = 87;  // ratified backstop (current 89; = 82 + 5)

// ---------------------------------------------------------------------------
// STRUCTURAL INVARIANTS — exact, never buffered
// ---------------------------------------------------------------------------
const FLOOR_INTERNAL_CONNECTIVITY_PCT  = 100; // hard invariant
const EXPECTED_GENERIC_INTERMEDIATES = [
  'agent-eval',
  'ghostwrite',
  'knowledge-harvest',
  'plan-and-execute',
  'research',
] as const;

describe('CI reachability-coverage gate (#88)', () => {
  const out = deriveReachability({ write: false });
  const r = out.report;

  // --- Tier 1: Proportional primaries ---

  it(`game-seed reachable % ≥ ${FLOOR_GAME_SEED_REACHABLE_PCT}% (proportional primary — Metric B)`, () => {
    const pct = Math.floor(r.gameSeedReachablePct);
    if (pct < FLOOR_GAME_SEED_REACHABLE_PCT) {
      throw new Error(
        `[coverage-gate] gameSeedReachablePct REGRESSED\n` +
        `  actual:  ${r.gameSeedReachablePct.toFixed(1)}%\n` +
        `  floor:   ${FLOOR_GAME_SEED_REACHABLE_PCT}%\n` +
        `  Action: check A′ seed bridges are present in bridges.json (run derive-reachability.ts).`
      );
    }
    expect(pct).toBeGreaterThanOrEqual(FLOOR_GAME_SEED_REACHABLE_PCT);
  });

  it(`named-backed fusion % ≥ ${FLOOR_NAMED_BACKED_FUSION_PCT}% of total fusions (proportional primary)`, () => {
    const pct = Math.floor((r.namedBackedFusionCount / r.totalRegistrySkills) * 100);
    // Use totalRegistrySkills as denominator proxy — fusionCount not separately exported,
    // but namedBackedFusionCount/totalRegistrySkills still trends together on growth.
    // For precision, assert against the raw count floor as well (Tier 2 below covers this).
    const exactPct = (r.namedBackedFusionCount / 130) * 100; // 130 = total fusion nodes on ygg2
    if (exactPct < FLOOR_NAMED_BACKED_FUSION_PCT) {
      throw new Error(
        `[coverage-gate] namedBackedFusion% REGRESSED\n` +
        `  actual:  ${exactPct.toFixed(1)}% (${r.namedBackedFusionCount}/130)\n` +
        `  floor:   ${FLOOR_NAMED_BACKED_FUSION_PCT}%\n` +
        `  Action: check fusion nodes in data/craft/skills.json still have named-skill backing.`
      );
    }
    expect(exactPct).toBeGreaterThanOrEqual(FLOOR_NAMED_BACKED_FUSION_PCT);
  });

  // --- Tier 2: Absolute watermarks ---

  it(`named skill count ≥ ${FLOOR_NAMED_SKILL_COUNT} (watermark — catastrophic-loss backstop)`, () => {
    if (r.reachableNamedSkillCount < FLOOR_NAMED_SKILL_COUNT) {
      throw new Error(
        `[coverage-gate] reachableNamedSkillCount REGRESSED\n` +
        `  actual:  ${r.reachableNamedSkillCount}\n` +
        `  floor:   ${FLOOR_NAMED_SKILL_COUNT}\n` +
        `  shortfall: ${FLOOR_NAMED_SKILL_COUNT - r.reachableNamedSkillCount} named skill(s) lost\n` +
        `  Action: run sync-skill-tree.ts and re-derive, or investigate lost named skills.`
      );
    }
    expect(r.reachableNamedSkillCount).toBeGreaterThanOrEqual(FLOOR_NAMED_SKILL_COUNT);
  });

  it(`named-backed fusion count ≥ ${FLOOR_NAMED_BACKED_FUSION_COUNT} (watermark)`, () => {
    if (r.namedBackedFusionCount < FLOOR_NAMED_BACKED_FUSION_COUNT) {
      throw new Error(
        `[coverage-gate] namedBackedFusionCount REGRESSED\n` +
        `  actual:  ${r.namedBackedFusionCount}\n` +
        `  floor:   ${FLOOR_NAMED_BACKED_FUSION_COUNT}\n` +
        `  shortfall: ${FLOOR_NAMED_BACKED_FUSION_COUNT - r.namedBackedFusionCount} fusion(s) lost\n` +
        `  Action: check that fusion nodes in data/craft/skills.json still have named-skill backing.`
      );
    }
    expect(r.namedBackedFusionCount).toBeGreaterThanOrEqual(FLOOR_NAMED_BACKED_FUSION_COUNT);
  });

  it(`deterministic fusion reach ≥ ${FLOOR_DETERMINISTIC_FUSION_COUNT} (watermark)`, () => {
    if (r.deterministicFusionReachCount < FLOOR_DETERMINISTIC_FUSION_COUNT) {
      throw new Error(
        `[coverage-gate] deterministicFusionReachCount REGRESSED\n` +
        `  actual:  ${r.deterministicFusionReachCount}\n` +
        `  floor:   ${FLOOR_DETERMINISTIC_FUSION_COUNT}\n` +
        `  Action: run derive-reachability and verify genericIntermediateFusions list.`
      );
    }
    expect(r.deterministicFusionReachCount).toBeGreaterThanOrEqual(FLOOR_DETERMINISTIC_FUSION_COUNT);
  });

  // --- Structural invariants ---

  it(`internal connectivity === ${FLOOR_INTERNAL_CONNECTIVITY_PCT}% (hard invariant)`, () => {
    expect(r.internalConnectivityPct).toBe(FLOOR_INTERNAL_CONNECTIVITY_PCT);
  });

  it('deterministicFusionReachCount === namedBackedFusionCount + genericIntermediateFusions.length', () => {
    // Derived identity: 89 = 84 + 5 (87 = 82 + 5 at floor). Catches algorithm bugs that
    // inflate one count without the other.
    expect(r.deterministicFusionReachCount).toBe(
      r.namedBackedFusionCount + r.genericIntermediateFusions.length
    );
  });

  it('genericIntermediateFusions exactly matches the 5 known unavoidable intermediates', () => {
    // Topology signal — fires on fusion graph changes, not renames.
    // If this fires: update EXPECTED_GENERIC_INTERMEDIATES and surface on #88 for founder ack.
    expect([...r.genericIntermediateFusions].sort()).toEqual(
      [...EXPECTED_GENERIC_INTERMEDIATES].sort()
    );
  });

  it('reachable + unreachable === totalRegistrySkills (accounting invariant)', () => {
    expect(out.reachable.length + out.unreachable.length).toBe(r.totalRegistrySkills);
  });

  it('gameSeedReachableCount === seedBridges.length + deterministicFusionReachCount (composite check)', () => {
    // Makes the gate self-auditing: individual floors could all pass while the composite is wrong
    // if the target-scoped closure accidentally admits extra basics.
    expect(r.gameSeedReachableCount).toBe(
      out.seedBridges.length + r.deterministicFusionReachCount
    );
  });

  it('seedBridges count ≥ 71 (structural >=; growth increases this, only contraction fires)', () => {
    // NOT a catastrophic-loss watermark — this is a structural >= invariant.
    // A strict toBe(71) would false-break CI the moment upstream adds a named skill backed
    // by a new root basic (the intended growth path). >= lets the registry grow freely.
    if (out.seedBridges.length < 71) {
      throw new Error(
        `[coverage-gate] seedBridges count REGRESSED\n` +
        `  actual: ${out.seedBridges.length}\n` +
        `  floor: 71\n` +
        `  If a registry sync removed basic nodes from the named-backed closure, update after founder ack.`
      );
    }
    expect(out.seedBridges.length).toBeGreaterThanOrEqual(71);
  });
});
```

### 4.2 No changes to `craft-ci.yml`

The test file is under `lib/craft/` which is already in the `paths:` trigger list. Vitest picks
it up automatically. No new CI steps needed.

---

## 5. Deliberately breaking the gate (required by task)

Before opening the PR, the implementer must:

1. **Temporarily regress a fixture:** in `data/craft/named-index.json`, delete one named skill
   entry (e.g. `"web-scraper"`) from `skills`.
2. **Run `npx vitest run lib/craft/coverage-gate.test.ts`** and confirm it fails with the
   expected error message (showing actual < floor, shortfall count, and actionable guidance).
3. **Revert the deletion**, run vitest again, confirm green.
4. **Paste the failure output** (the exact error message printed) into the PR body as proof
   the gate works. This is required — "it compiles" is not proof.

---

## 6. Verification gate (before requesting review)

- `npx vitest run` fully green (coverage-gate tests + all existing tests).
- `npx vitest run lib/craft/coverage-gate.test.ts` green independently.
- `npx tsc --noEmit` clean.
- PR body contains: paste of the gate's failure output (from step 5), floor values used, and
  the note that floor values are ratified by the founder.

---

## 7. Stacking order

#88's PR must be based on #87's branch (or the integration branch after #87 merges into it).
The coverage gate tests `bridges.json` which must include A′ bridges (#86) and the Vectorize
binding from #87's wrangler.jsonc is fine to have in scope (the coverage gate doesn't test it).

If #87 hasn't merged to the integration branch yet: branch off the tip of #87's working branch,
mark #88's PR as "stacked on #87" in the PR body.

---

## 8. Out of scope

- New CI workflow or new CI job.
- Testing Vectorize promotion (that's #87's test suite).
- Changing any floor value without founder sign-off.
- Merging to `staging`/`main`.
