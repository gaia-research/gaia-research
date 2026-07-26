/**
 * lib/craft/coverage-gate.test.ts
 *
 * CI reachability-coverage gate (Epic #89 sub-issue #88).
 *
 * FLOOR VALUES RATIFIED 2026-07-24 (founder sign-off — see PR #111): the
 * proportional primaries, absolute watermarks, and structural invariants
 * below (originally plan-recommended, not yet founder-reviewed) are now the
 * accepted floors. Founder gate closed.
 *
 * TWO-TIER DESIGN (see docs/plans/epic-89-sub-88-ci-coverage-gate-plan.md §3.1
 * for full rationale):
 *   Tier 1 — Proportional primaries: self-scaling, primary quality signal.
 *   Tier 2 — Absolute watermarks: catastrophic-loss backstop only.
 *   Structural invariants: exact, never buffered.
 *
 * ESCAPE HATCH: Registry EXPANSION always passes (>= semantics). To LOWER a
 * floor (reviewed prune or upstream rename), do so in the SAME COMMIT that
 * lands the corresponding data/craft/ change, with data-diff review sign-off.
 * Do NOT add a blanket env-var skip — if it leaks into craft-ci.yml it removes
 * all teeth. If a scheduled resync workflow (craft-registry-resync.yml)
 * genuinely needs to land a new upstream named skill before a bridge is
 * authored, scope any skip strictly to that workflow — never to craft-ci.yml.
 *
 * This runs `deriveReachability({ write: false })` against the real committed
 * data/craft/*.json (same approach as the "real data smoke test" / "A′
 * integration" tests in reachability.test.ts), but with the explicit intent of
 * failing CI on regression. Rides the existing `Type-check + Vitest (craft
 * lib)` job in .github/workflows/craft-ci.yml — no new workflow, no new job.
 */

import { describe, it, expect } from 'vitest';
import { deriveReachability } from '../../scripts/craft/derive-reachability';

// ---------------------------------------------------------------------------
// TIER 1 — Proportional primaries (self-scaling quality signal)
// Both sides of each ratio grow together on normal contribution.
// ---------------------------------------------------------------------------
const FLOOR_GAME_SEED_REACHABLE_PCT = 65; // ratified: >= 65% of all skills reachable from seeds
//                                            Math.floor applied; absorbs 1-2 benign renames
const FLOOR_NAMED_BACKED_FUSION_PCT = 60; // ratified: >= 60% of all fusions have named backing
//                                            current 84/130 = 64.6%; 4.6pt buffer
const TOTAL_FUSION_NODES = 130; // total fusion nodes on ygg2 — denominator for the named-backed-fusion %

// NOTE: reachableNamed/totalNamed is NOT used as a proportional floor.
// Denominator-drift: totalNamed grows when a contributor adds a named skill,
// but the new skill is unreachable until a fusion+bridge is authored. Normal
// contribution pushes the ratio down. Use the absolute watermark below instead.

// ---------------------------------------------------------------------------
// TIER 2 — Absolute watermarks (catastrophic-loss backstop, not quality target)
// Trivially satisfied by a healthy registry. Exist to catch near-empty sync
// slippage that somehow passed assertRegistryShape.
// ---------------------------------------------------------------------------
const FLOOR_NAMED_SKILL_COUNT = 150; // ratified backstop (current 153, buffer 3)
const FLOOR_NAMED_BACKED_FUSION_COUNT = 82; // ratified backstop (current 84, buffer 2)
const FLOOR_DETERMINISTIC_FUSION_COUNT = 87; // ratified backstop (current 89; = 82 + 5)

// ---------------------------------------------------------------------------
// STRUCTURAL INVARIANTS — exact, never buffered
// ---------------------------------------------------------------------------
const FLOOR_INTERNAL_CONNECTIVITY_PCT = 100; // hard invariant
const FLOOR_SEED_BRIDGES_COUNT = 71; // structural >=; growth increases this, only contraction fires
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

  it(`game-seed reachable % >= ${FLOOR_GAME_SEED_REACHABLE_PCT}% (proportional primary — Metric B)`, () => {
    const pct = Math.floor(r.gameSeedReachablePct);
    if (pct < FLOOR_GAME_SEED_REACHABLE_PCT) {
      throw new Error(
        `[coverage-gate] gameSeedReachablePct REGRESSED\n` +
          `  actual:  ${r.gameSeedReachablePct.toFixed(1)}%\n` +
          `  floor:   ${FLOOR_GAME_SEED_REACHABLE_PCT}%\n` +
          `  Action: check A′ seed bridges are present in bridges.json (run derive-reachability.ts).`,
      );
    }
    expect(pct).toBeGreaterThanOrEqual(FLOOR_GAME_SEED_REACHABLE_PCT);
  });

  it(`named-backed fusion % >= ${FLOOR_NAMED_BACKED_FUSION_PCT}% of total fusions (proportional primary)`, () => {
    const exactPct = (r.namedBackedFusionCount / TOTAL_FUSION_NODES) * 100;
    if (exactPct < FLOOR_NAMED_BACKED_FUSION_PCT) {
      throw new Error(
        `[coverage-gate] namedBackedFusion% REGRESSED\n` +
          `  actual:  ${exactPct.toFixed(1)}% (${r.namedBackedFusionCount}/${TOTAL_FUSION_NODES})\n` +
          `  floor:   ${FLOOR_NAMED_BACKED_FUSION_PCT}%\n` +
          `  Action: check fusion nodes in data/craft/skills.json still have named-skill backing.`,
      );
    }
    expect(exactPct).toBeGreaterThanOrEqual(FLOOR_NAMED_BACKED_FUSION_PCT);
  });

  // --- Tier 2: Absolute watermarks ---

  it(`named skill count >= ${FLOOR_NAMED_SKILL_COUNT} (watermark — catastrophic-loss backstop)`, () => {
    if (r.reachableNamedSkillCount < FLOOR_NAMED_SKILL_COUNT) {
      throw new Error(
        `[coverage-gate] reachableNamedSkillCount REGRESSED\n` +
          `  actual:  ${r.reachableNamedSkillCount}\n` +
          `  floor:   ${FLOOR_NAMED_SKILL_COUNT}\n` +
          `  shortfall: ${FLOOR_NAMED_SKILL_COUNT - r.reachableNamedSkillCount} named skill(s) lost\n` +
          `  Action: run sync-skill-tree.ts and re-derive, or investigate lost named skills.`,
      );
    }
    expect(r.reachableNamedSkillCount).toBeGreaterThanOrEqual(FLOOR_NAMED_SKILL_COUNT);
  });

  it(`named-backed fusion count >= ${FLOOR_NAMED_BACKED_FUSION_COUNT} (watermark)`, () => {
    if (r.namedBackedFusionCount < FLOOR_NAMED_BACKED_FUSION_COUNT) {
      throw new Error(
        `[coverage-gate] namedBackedFusionCount REGRESSED\n` +
          `  actual:  ${r.namedBackedFusionCount}\n` +
          `  floor:   ${FLOOR_NAMED_BACKED_FUSION_COUNT}\n` +
          `  shortfall: ${FLOOR_NAMED_BACKED_FUSION_COUNT - r.namedBackedFusionCount} fusion(s) lost\n` +
          `  Action: check that fusion nodes in data/craft/skills.json still have named-skill backing.`,
      );
    }
    expect(r.namedBackedFusionCount).toBeGreaterThanOrEqual(FLOOR_NAMED_BACKED_FUSION_COUNT);
  });

  it(`deterministic fusion reach >= ${FLOOR_DETERMINISTIC_FUSION_COUNT} (watermark)`, () => {
    if (r.deterministicFusionReachCount < FLOOR_DETERMINISTIC_FUSION_COUNT) {
      throw new Error(
        `[coverage-gate] deterministicFusionReachCount REGRESSED\n` +
          `  actual:  ${r.deterministicFusionReachCount}\n` +
          `  floor:   ${FLOOR_DETERMINISTIC_FUSION_COUNT}\n` +
          `  Action: run derive-reachability and verify genericIntermediateFusions list.`,
      );
    }
    expect(r.deterministicFusionReachCount).toBeGreaterThanOrEqual(FLOOR_DETERMINISTIC_FUSION_COUNT);
  });

  // --- Structural invariants ---

  it(`internal connectivity === ${FLOOR_INTERNAL_CONNECTIVITY_PCT}% (hard invariant)`, () => {
    expect(r.internalConnectivityPct).toBe(FLOOR_INTERNAL_CONNECTIVITY_PCT);
  });

  it('deterministicFusionReachCount === namedBackedFusionCount + genericIntermediateFusions.length', () => {
    // Derived identity: 89 = 84 + 5 (87 = 82 + 5 at floor). Catches algorithm
    // bugs that inflate one count without the other.
    expect(r.deterministicFusionReachCount).toBe(
      r.namedBackedFusionCount + r.genericIntermediateFusions.length,
    );
  });

  it('genericIntermediateFusions exactly matches the 5 known unavoidable intermediates', () => {
    // Topology signal — fires on fusion graph changes, not renames.
    // If this fires: update EXPECTED_GENERIC_INTERMEDIATES and surface on #88 for founder ack.
    expect([...r.genericIntermediateFusions].sort()).toEqual(
      [...EXPECTED_GENERIC_INTERMEDIATES].sort(),
    );
  });

  it('reachable + unreachable === totalRegistrySkills (accounting invariant)', () => {
    expect(out.reachable.length + out.unreachable.length).toBe(r.totalRegistrySkills);
  });

  it('gameSeedReachableCount === seedBridges.length + deterministicFusionReachCount (composite check)', () => {
    // Makes the gate self-auditing: individual floors could all pass while the
    // composite is wrong if the target-scoped closure accidentally admits
    // extra basics.
    expect(r.gameSeedReachableCount).toBe(out.seedBridges.length + r.deterministicFusionReachCount);
  });

  it(`seedBridges count >= ${FLOOR_SEED_BRIDGES_COUNT} (structural >=; growth increases this, only contraction fires)`, () => {
    // NOT a catastrophic-loss watermark — this is a structural >= invariant.
    // A strict toBe(71) would false-break CI the moment upstream adds a named
    // skill backed by a new root basic (the intended growth path). >= lets the
    // registry grow freely.
    if (out.seedBridges.length < FLOOR_SEED_BRIDGES_COUNT) {
      throw new Error(
        `[coverage-gate] seedBridges count REGRESSED\n` +
          `  actual: ${out.seedBridges.length}\n` +
          `  floor: ${FLOOR_SEED_BRIDGES_COUNT}\n` +
          `  If a registry sync removed basic nodes from the named-backed closure, update after founder ack.`,
      );
    }
    expect(out.seedBridges.length).toBeGreaterThanOrEqual(FLOOR_SEED_BRIDGES_COUNT);
  });
});
