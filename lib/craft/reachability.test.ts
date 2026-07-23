/**
 * lib/craft/reachability.test.ts
 *
 * Fixture-driven unit tests for the build-time reachability derivation
 * (scripts/craft/derive-reachability.ts — computeReachability + deriveReachability).
 *
 * Strategy: tiny in-memory fixtures, no file I/O for the core closure tests.
 * The "fixture proof" test (DoD headline) demonstrates that adding a new skill
 * + fusion edge to the fixture makes it reachable with ZERO code changes.
 *
 * Tests:
 *  1. Core closure — seeds + basics + reachable fusion + unreachable fusion →
 *     closure includes/excludes correctly, report counts exact.
 *  2. Order-independent / deterministic — same result regardless of edge order.
 *  3. Multi-prereq AND-logic — fusion with 3 prereqs fires only when all 3 reachable.
 *  4. Fixture proof (DoD headline) — add a new skill+edge to fixture → becomes
 *     reachable with zero code change. Proven by calling deriveReachability()
 *     with skillsOverride; no modifications to any source file.
 *  5. Report shape — required fields present, counts consistent, sorted ordering.
 *  6. Determinism — running twice with identical input produces identical output.
 *  7. Unreachable list — accurately lists skills with broken/missing prereq chains.
 */

import { describe, it, expect } from 'vitest';
import { computeReachability, deriveReachability, GAME_SEED_SLUGS } from '../../scripts/craft/derive-reachability';

// ---------------------------------------------------------------------------
// Tiny fixture helpers
// ---------------------------------------------------------------------------

interface FixtureSkill {
  id: string;
  name: string;
  type: 'basic' | 'fusion';
  prerequisites?: string[];
}

/** Build a basic skill with no prerequisites. */
function basic(id: string): FixtureSkill {
  return { id, name: `/${id}`, type: 'basic' };
}

/** Build a fusion skill with the given prerequisites. */
function fusion(id: string, ...prereqs: string[]): FixtureSkill {
  return { id, name: `/${id}`, type: 'fusion', prerequisites: prereqs };
}

// ---------------------------------------------------------------------------
// 1. Core closure correctness
// ---------------------------------------------------------------------------

describe('computeReachability — core closure', () => {
  it('seeds alone are reachable with no hyperedges', () => {
    const reachable = computeReachability(['a', 'b'], []);
    expect(reachable.has('a')).toBe(true);
    expect(reachable.has('b')).toBe(true);
    expect(reachable.size).toBe(2);
  });

  it('fires a 2-prereq edge when both prereqs are in seed set', () => {
    const reachable = computeReachability(
      ['alpha', 'beta'],
      [{ result: 'gamma', prereqs: ['alpha', 'beta'] }],
    );
    expect(reachable.has('gamma')).toBe(true);
  });

  it('does NOT fire when only one of two prereqs is reachable', () => {
    const reachable = computeReachability(
      ['alpha'],
      [{ result: 'gamma', prereqs: ['alpha', 'beta'] }],
    );
    expect(reachable.has('gamma')).toBe(false);
  });

  it('fires transitively: a+b→c, then c+a→d', () => {
    const reachable = computeReachability(
      ['a', 'b'],
      [
        { result: 'c', prereqs: ['a', 'b'] },
        { result: 'd', prereqs: ['c', 'a'] },
      ],
    );
    expect(reachable.has('c')).toBe(true);
    expect(reachable.has('d')).toBe(true);
  });

  it('does NOT fire transitively when an intermediate is unreachable', () => {
    const reachable = computeReachability(
      ['a', 'b'],
      [
        // c requires 'x' which is not reachable
        { result: 'c', prereqs: ['a', 'x'] },
        { result: 'd', prereqs: ['c', 'b'] },
      ],
    );
    expect(reachable.has('c')).toBe(false);
    expect(reachable.has('d')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. AND-logic for multi-prereq fusions
// ---------------------------------------------------------------------------

describe('computeReachability — multi-prereq AND-logic', () => {
  it('fires a 3-prereq edge only when ALL 3 prereqs are reachable', () => {
    const reachable = computeReachability(
      ['p1', 'p2'],
      [{ result: 'target', prereqs: ['p1', 'p2', 'p3'] }],
    );
    // p3 is missing from seeds → target must NOT fire
    expect(reachable.has('target')).toBe(false);
  });

  it('fires a 3-prereq edge when the third prereq is itself derived', () => {
    const reachable = computeReachability(
      ['p1', 'p2', 'p3_base'],
      [
        { result: 'p3', prereqs: ['p3_base', 'p1'] }, // p3 derived first
        { result: 'target', prereqs: ['p1', 'p2', 'p3'] },
      ],
    );
    expect(reachable.has('p3')).toBe(true);
    expect(reachable.has('target')).toBe(true);
  });

  it('handles up to 5-prereq fusions correctly', () => {
    const seeds = ['s1', 's2', 's3', 's4', 's5'];
    const reachable = computeReachability(seeds, [
      { result: 'big-fusion', prereqs: seeds },
    ]);
    expect(reachable.has('big-fusion')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Determinism
// ---------------------------------------------------------------------------

describe('computeReachability — determinism', () => {
  it('produces identical output for identical inputs regardless of edge order', () => {
    const edges = [
      { result: 'c', prereqs: ['a', 'b'] },
      { result: 'd', prereqs: ['c', 'b'] },
      { result: 'e', prereqs: ['d', 'a'] },
    ];
    const shuffled = [edges[2], edges[0], edges[1]];

    const r1 = computeReachability(['a', 'b'], edges);
    const r2 = computeReachability(['a', 'b'], shuffled);

    expect([...r1].sort()).toEqual([...r2].sort());
  });
});

// ---------------------------------------------------------------------------
// 4. deriveReachability with tiny fixture (write: false = no I/O)
// ---------------------------------------------------------------------------

describe('deriveReachability — fixture (no file I/O)', () => {
  // A minimal fixture: 2 basic skills, 1 reachable fusion, 1 unreachable fusion.
  //
  //   basic-a, basic-b  — roots (no prereqs)
  //   fusion-ab         — prereqs: [basic-a, basic-b]  → reachable
  //   fusion-orphan     — prereqs: [missing-x, basic-a] → NOT reachable
  //   (game seeds from GAME_SEED_SLUGS are also injected as roots automatically)

  const fixtureSkills = [
    basic('basic-a'),
    basic('basic-b'),
    fusion('fusion-ab', 'basic-a', 'basic-b'),
    fusion('fusion-orphan', 'missing-x', 'basic-a'),
  ];

  it('includes the reachable fusion in the reachable list', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    expect(out.reachable).toContain('fusion-ab');
    expect(out.reachable).toContain('basic-a');
    expect(out.reachable).toContain('basic-b');
  });

  it('excludes the unreachable fusion from the reachable list', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    expect(out.reachable).not.toContain('fusion-orphan');
    expect(out.unreachable).toContain('fusion-orphan');
  });

  it('report counts are exact', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    const r = out.report;
    // 4 registry skills total; 3 reachable (basic-a, basic-b, fusion-ab); 1 unreachable
    expect(r.totalRegistrySkills).toBe(4);
    expect(r.reachableCount).toBe(3);
    expect(r.unreachableCount).toBe(1);
    expect(r.reachableCount + r.unreachableCount).toBe(r.totalRegistrySkills);
  });

  it('internalConnectivityPct is correct (3/4 = 75%)', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    expect(out.report.internalConnectivityPct).toBe(75);
    // back-compat alias
    expect(out.report.reachablePct).toBe(75);
  });

  it('reachableEdges contains the fusion-ab edge with correct prereqs', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    const edge = out.reachableEdges.find((e) => e.result === 'fusion-ab');
    expect(edge).toBeDefined();
    expect(edge!.prereqs.sort()).toEqual(['basic-a', 'basic-b']);
  });

  it('reachable list is sorted deterministically', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    expect(out.reachable).toEqual([...out.reachable].sort());
  });

  it('unreachable list is sorted deterministically', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    expect(out.unreachable).toEqual([...out.unreachable].sort());
  });

  it('reachableEdges are sorted by result id', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    const ids = out.reachableEdges.map((e) => e.result);
    expect(ids).toEqual([...ids].sort());
  });

  it('report includes gameSeedSlugs (the 4 UI primitives)', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    expect(out.report.gameSeedSlugs).toEqual([...GAME_SEED_SLUGS].sort());
  });

  it('gameSeedReachable list is empty (game seeds not in fixture ids)', () => {
    // Game seeds (prompt/code/web/data) are not fixture skill ids, so no fusion
    // can fire from them alone — gameSeedReachable is empty.
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    expect(out.gameSeedReachable).toEqual([]);
    expect(out.report.gameSeedReachableCount).toBe(0);
    expect(out.report.gameSeedReachablePct).toBe(0);
  });

  it('generatedAt is a YYYY-MM-DD date string (not a sort key, but a field)', () => {
    const out = deriveReachability({ skillsOverride: fixtureSkills, write: false });
    expect(out.report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ---------------------------------------------------------------------------
// 5. DoD HEADLINE PROOF: adding a new skill+edge to fixture → auto-reachable,
//    zero code change. This is the definition-of-done fixture proof from Plan B.
// ---------------------------------------------------------------------------

describe('DoD fixture proof — new registry skill auto-reaches with zero code change', () => {
  it('skill added to fixture becomes reachable on next run without any code change', () => {
    // BEFORE: baseline fixture — 3 reachable skills (basic-a, basic-b, fusion-ab)
    const baselineSkills = [
      basic('basic-a'),
      basic('basic-b'),
      fusion('fusion-ab', 'basic-a', 'basic-b'),
    ];
    const before = deriveReachability({ skillsOverride: baselineSkills, write: false });
    expect(before.reachable).not.toContain('new-skill-xyz');
    expect(before.report.reachableCount).toBe(3);

    // AFTER: add new-skill-xyz + its fusion edge to the fixture.
    // NO code was changed — only the data (skillsOverride) changes.
    const extendedSkills = [
      ...baselineSkills,
      // new basic skill (unconditionally reachable as a basic node)
      basic('new-basic'),
      // new fusion that combines basic-a + new-basic
      fusion('new-skill-xyz', 'basic-a', 'new-basic'),
    ];
    const after = deriveReachability({ skillsOverride: extendedSkills, write: false });

    // new-skill-xyz is NOW reachable — purely because the data changed
    expect(after.reachable).toContain('new-skill-xyz');
    expect(after.reachable).toContain('new-basic');
    expect(after.report.reachableCount).toBe(5); // 3 original + 2 new
    expect(after.report.totalRegistrySkills).toBe(5);
    expect(after.report.internalConnectivityPct).toBe(100);

    // And the edge is in reachableEdges
    const edge = after.reachableEdges.find((e) => e.result === 'new-skill-xyz');
    expect(edge).toBeDefined();
    expect(edge!.prereqs.sort()).toEqual(['basic-a', 'new-basic']);
  });
});

// ---------------------------------------------------------------------------
// 6. Real data smoke test (reads actual data/craft/skills.json)
// ---------------------------------------------------------------------------

describe('deriveReachability — real data smoke test', () => {
  it('returns > 0% internal connectivity on the real skills.json', () => {
    const out = deriveReachability({ write: false });
    expect(out.report.totalRegistrySkills).toBeGreaterThan(0);
    expect(out.report.reachableCount).toBeGreaterThan(0);
    expect(out.report.internalConnectivityPct).toBeGreaterThan(0);
  });

  it('reports both Metric A and Metric B separately', () => {
    const out = deriveReachability({ write: false });
    const r = out.report;
    // Both metrics are present
    expect(typeof r.internalConnectivityPct).toBe('number');
    expect(typeof r.gameSeedReachablePct).toBe('number');
    // gameSeedReachable list exists
    expect(Array.isArray(out.gameSeedReachable)).toBe(true);
    // On ygg2: game seeds (prompt/code/web/data) don't match registry ids,
    // so Metric B = 0%. This is the honest number that surfaces the founder gate.
    expect(r.gameSeedReachableCount).toBe(0);
    expect(r.gameSeedReachablePct).toBe(0);
    expect(out.gameSeedReachable).toHaveLength(0);
  });

  it('reachable + unreachable = totalRegistrySkills', () => {
    const out = deriveReachability({ write: false });
    expect(out.reachable.length + out.unreachable.length).toBe(
      out.report.totalRegistrySkills,
    );
  });

  it('reachable list contains known basic nodes (unconditionally reachable)', () => {
    const out = deriveReachability({ write: false });
    // api-call and chain-of-thought are basic nodes on ygg2 — always reachable
    expect(out.reachable).toContain('api-call');
    expect(out.reachable).toContain('chain-of-thought');
  });

  it('reachable list contains known fusion nodes reachable from basics', () => {
    const out = deriveReachability({ write: false });
    // agent-eval: prereqs = [evaluate-output, score-relevance] — both basic
    expect(out.reachable).toContain('agent-eval');
    // agent-environment-setup: prereqs = [document-editing, tool-use] — both basic
    expect(out.reachable).toContain('agent-environment-setup');
  });
});
