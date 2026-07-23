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

The coverage floors are game-design guardrails, not arbitrary numbers. `gameSeedReachablePct ≥ 65%` guarantees that roughly two-thirds of the registry is reachable from the starting seeds, so a new player is never staring at a mostly-locked tree — the sense of an open, explorable space is preserved. The reachable-contributor floor stays at 38 of 47 (not 47) because the 9 blocked contributors sit behind basic nodes outside the A′ closure; forcing 47 would misrepresent the game's actual reachable surface and create a false regression signal. `internalConnectivityPct = 100` guarantees the internal graph never fragments, so no fusion the player can see is a dead end. Together the floors say: the game must always offer an abundant, connected, mostly-open collection space that rewards a first session and tapers into a ~20-hour completionist chase — and CI will fire the moment a registry change silently erodes that promise.

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

### 3.1 Assertions (floor values — founder-ratified)

```typescript
const FLOOR_NAMED_SKILL_COUNT         = 150; // ratified
const FLOOR_NAMED_BACKED_FUSION_COUNT  = 82;  // ratified
const FLOOR_DETERMINISTIC_FUSION_COUNT = 87;  // ratified
const FLOOR_GAME_SEED_REACHABLE_PCT    = 65;  // ratified
const FLOOR_INTERNAL_CONNECTIVITY_PCT  = 100; // hard invariant — all basics reach all fusions
```

**Note on `gameSeedReachablePct` floor precision:** The floor of 65 is applied after `Math.floor` on the raw percentage. This means a regression from 160 to 157 reachable skills (157/243 = 64.6%, floors to 64) fails CI, while a loss of 1-2 skills (158/243 = 65.0%, floors to 65) passes silently. This is intentional — the buffer absorbs 1-2 benign upstream slug renames while still firing on any loss of ≥3 seed-reachable skills. Future maintainers: do not change the floor to the raw observed value (65.8) without understanding that Math.floor means a drop to 65.0% still passes.

**Note on `deterministicFusionReachCount` derived identity:** The ratified floor of 87 = 82 + 5 preserves the derived identity `deterministicFusionReachCount = namedBackedFusionCount + genericIntermediateFusions.length`. This identity is asserted in the gate (see Section 4.1) as defense-in-depth against a `deriveReachability` bug that inflates one count without the other.

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
 * Runs deriveReachability() against the committed data/craft/ snapshot and
 * asserts that coverage metrics have not regressed below agreed floors.
 *
 * FLOOR VALUES are founder-ratified product decisions — do NOT change without
 * explicit sign-off. See docs/plans/epic-89-sub-88-ci-coverage-gate-plan.md
 * and the #88 issue thread.
 *
 * ESCAPE HATCH: Because every count metric uses >= semantics, legitimate registry
 * EXPANSION never needs an escape hatch. If you need to LOWER a floor (a reviewed
 * prune of named skills, or an upstream Yggdrasil rename that drops a count below
 * the buffered floor), lower it in the SAME COMMIT that lands the corresponding
 * data/craft/ change, with human data-diff review sign-off — mirroring the
 * FORCE_RESYNC=1 pattern in assertRegistryShape. Do NOT add a blanket env-var skip.
 *
 * On failure the test prints the actual value, the floor, and a diff-friendly
 * list of newly-missing slugs so the regression is immediately actionable.
 */

import { describe, it, expect } from 'vitest';
import { deriveReachability } from '../../scripts/craft/derive-reachability';

// ---------------------------------------------------------------------------
// FOUNDER-RATIFIED FLOORS — do NOT change without explicit sign-off on #88
// To lower a floor: do so in the same commit as the corresponding data/craft/
// change, with data-diff review sign-off. See escape hatch note above.
// ---------------------------------------------------------------------------
const FLOOR_NAMED_SKILL_COUNT         = 150; // ratified
const FLOOR_NAMED_BACKED_FUSION_COUNT  = 82;  // ratified
const FLOOR_DETERMINISTIC_FUSION_COUNT = 87;  // ratified (= 82 named-backed + 5 intermediates)
const FLOOR_GAME_SEED_REACHABLE_PCT    = 65;  // ratified (Math.floor applied; absorbs 1-2 benign renames)
const FLOOR_INTERNAL_CONNECTIVITY_PCT  = 100; // hard invariant — all basics reach all fusions

// ---------------------------------------------------------------------------
// Known slugs used in diff output (these are the expected values; a missing slug
// will appear in the failure message as an actionable regression indicator)
// ---------------------------------------------------------------------------
const EXPECTED_GENERIC_INTERMEDIATES = [
  'agent-eval',
  'ghostwrite',
  'knowledge-harvest',
  'plan-and-execute',
  'research',
] as const;

describe('CI reachability-coverage gate (#88)', () => {
  // Run once, share across assertions
  const out = deriveReachability({ write: false });
  const r = out.report;

  it(`named skill count ≥ ${FLOOR_NAMED_SKILL_COUNT} (primary DoD metric)`, () => {
    if (r.reachableNamedSkillCount < FLOOR_NAMED_SKILL_COUNT) {
      // Diff: show what number we got and the shortfall
      throw new Error(
        `[coverage-gate] reachableNamedSkillCount REGRESSED\n` +
        `  actual:  ${r.reachableNamedSkillCount}\n` +
        `  floor:   ${FLOOR_NAMED_SKILL_COUNT}\n` +
        `  shortfall: ${FLOOR_NAMED_SKILL_COUNT - r.reachableNamedSkillCount} named skill(s) lost\n` +
        `  Action: run 'npx tsx scripts/craft/sync-skill-tree.ts' and re-derive, or investigate lost named skills.`
      );
    }
    expect(r.reachableNamedSkillCount).toBeGreaterThanOrEqual(FLOOR_NAMED_SKILL_COUNT);
  });

  it(`named-backed fusion count ≥ ${FLOOR_NAMED_BACKED_FUSION_COUNT}`, () => {
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

  it(`deterministic fusion reach ≥ ${FLOOR_DETERMINISTIC_FUSION_COUNT} (82 named-backed + 5 intermediates)`, () => {
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

  it('deterministicFusionReachCount === namedBackedFusionCount + genericIntermediateFusions.length (derived identity)', () => {
    // Defense-in-depth: catches a deriveReachability bug that inflates one count without the other.
    // Floors are calibrated to preserve this identity: 87 = 82 + 5.
    expect(r.deterministicFusionReachCount).toBe(
      r.namedBackedFusionCount + r.genericIntermediateFusions.length
    );
  });

  it(`game-seed reachable % ≥ ${FLOOR_GAME_SEED_REACHABLE_PCT}% (Metric B)`, () => {
    const pct = Math.floor(r.gameSeedReachablePct);
    if (pct < FLOOR_GAME_SEED_REACHABLE_PCT) {
      throw new Error(
        `[coverage-gate] gameSeedReachablePct REGRESSED\n` +
        `  actual:  ${r.gameSeedReachablePct.toFixed(1)}%\n` +
        `  floor:   ${FLOOR_GAME_SEED_REACHABLE_PCT}%\n` +
        `  Action: check that A′ seed bridges are present in bridges.json (run derive-reachability.ts).`
      );
    }
    expect(pct).toBeGreaterThanOrEqual(FLOOR_GAME_SEED_REACHABLE_PCT);
  });

  it(`internal connectivity = ${FLOOR_INTERNAL_CONNECTIVITY_PCT}% (Metric A hard invariant)`, () => {
    expect(r.internalConnectivityPct).toBe(FLOOR_INTERNAL_CONNECTIVITY_PCT);
  });

  it('genericIntermediateFusions exactly matches the known 5 unavoidable intermediates', () => {
    // This list is structural — a change here means a registry topology change.
    // If this fires: update EXPECTED_GENERIC_INTERMEDIATES and surface on #88 for founder ack.
    const actual = [...r.genericIntermediateFusions].sort();
    const expected = [...EXPECTED_GENERIC_INTERMEDIATES].sort();
    expect(actual).toEqual(expected);
  });

  it('reachable + unreachable === totalRegistrySkills (accounting invariant)', () => {
    expect(out.reachable.length + out.unreachable.length).toBe(r.totalRegistrySkills);
  });

  it('gameSeedReachableCount === seedBridgesCount + deterministicFusionReachCount (composite accounting invariant)', () => {
    // If the target-scoped closure accidentally admits extra basics, individual floors could all
    // pass while the composite is wrong. This sum check makes the gate self-auditing.
    expect(r.gameSeedReachableCount).toBe(out.seedBridges.length + r.deterministicFusionReachCount);
  });

  it('seedBridges count ≥ 71 (one per root basic in named-backed closure)', () => {
    // Uses >= semantics: a strict toBe(71) would false-break CI the moment upstream adds a named
    // skill backed by a new root basic (the intended growth path). The point-in-time snapshot
    // proof in reachability.test.ts (toHaveLength(71)) may stay strict as it proves a snapshot,
    // not a forward gate. If upstream growth adds bridges: CI passes freely; only contraction fires.
    if (out.seedBridges.length < 71) {
      throw new Error(
        `[coverage-gate] seedBridges count REGRESSED\n` +
        `  actual: ${out.seedBridges.length}\n` +
        `  floor: 71\n` +
        `  If a registry sync removed basic nodes from the named-backed closure, update this floor after founder ack.`
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
