/**
 * lib/craft/recipes.test.ts
 *
 * Unit tests for findRecipe, loadRecipes, and skillTreeUrl from lib/craft/recipes.ts,
 * PLUS tests for findDerivedRecipe from lib/craft/bridges.ts (the new source of truth
 * for registry-derived 2-prereq fusions on Yggdrasil II).
 *
 * ## Why both modules are tested here
 *
 * On Yggdrasil II, `combinations.md` is intentionally empty — all fusion edges
 * migrated to inline `prerequisites` on fusion nodes in `registry/nodes/fusion/`.
 * This means `data/craft/recipes.json` is `[]`, so `loadRecipes()` returns an
 * empty array and `findRecipe()` always returns undefined for real pairs.
 *
 * The derived path (Plan B / Issue #86) is `findDerivedRecipe()` in bridges.ts,
 * which is keyed against the build-time AND-reachability closure over skills.json.
 * The two registry pairs the original tests asserted against are real 2-prereq
 * fusions on ygg2 — they now live in bridges.json reachableEdges, not recipes.json.
 *
 * Fix chosen: option (a) — point the "known pair resolves" assertions at
 * `findDerivedRecipe` (the new source of truth for ygg2 canonical fusions).
 * `findRecipe`'s own contract tests are updated to reflect its honest ygg2 state:
 * it returns nothing (recipes.json is empty) but its invariants (shape/pairKey
 * format/undefined-for-nonsense) still hold for any entries present. This keeps
 * both contracts meaningful without deleting guarantees or faking data.
 *
 * Rationale for not changing findRecipe to fall through to bridges:
 * - lib/craft/recipes.ts is a pure data loader for recipes.json. Making it aware
 *   of bridges.json would create a cross-module coupling between two independent
 *   data consumers and obscure the derivation chain.
 * - The fuse route already has the correct priority order: findRecipe → findDerivedRecipe
 *   → findStarterRecipe. The test file mirrors that contract.
 *
 * Real ygg2 data for the known-pair assertions:
 *   "api-call" + "tool-use"                        → "cloud-platform-management" (findDerivedRecipe)
 *   "multi-agent-debate" + "swarm-topology-management" → "advanced-swarm-coordination" (findDerivedRecipe)
 */

import { describe, it, expect } from 'vitest';
import { findRecipe, skillTreeUrl, loadRecipes } from './recipes';
import { findDerivedRecipe } from './bridges';

// ---------------------------------------------------------------------------
// loadRecipes — shape guarantees (valid for any non-empty recipes.json)
// ---------------------------------------------------------------------------

describe('loadRecipes', () => {
  it('returns an array (empty on Yggdrasil II where combinations.md is empty)', () => {
    const recipes = loadRecipes();
    expect(Array.isArray(recipes)).toBe(true);
    // On ygg2, recipes.json is [] — that is the correct honest state.
    // This test pins the shape contract without requiring non-empty data.
  });

  it('every present recipe has a non-empty pairKey, result, emoji, and blurb', () => {
    const recipes = loadRecipes();
    for (const r of recipes) {
      expect(r.pairKey).toBeTruthy();
      expect(r.result).toBeTruthy();
      expect(r.emoji).toBeTruthy();
      expect(r.blurb).toBeTruthy();
    }
  });

  it('excludes multi-prereq entries (pairKey === "")', () => {
    const recipes = loadRecipes();
    for (const r of recipes) {
      expect(r.pairKey).not.toBe('');
    }
  });

  it('each present pairKey contains exactly one "+" separator', () => {
    const recipes = loadRecipes();
    for (const r of recipes) {
      expect(r.pairKey.split('+').length).toBe(2);
    }
  });
});

// ---------------------------------------------------------------------------
// findRecipe — contract: returns undefined when recipes.json is empty (ygg2)
// ---------------------------------------------------------------------------

describe('findRecipe', () => {
  it('returns undefined for any pair when recipes.json is empty (ygg2 state)', () => {
    // On Yggdrasil II, combinations.md is intentionally empty.
    // Known registry fusions (api-call+tool-use, multi-agent-debate+swarm-*) now
    // resolve through findDerivedRecipe (bridges.json), not findRecipe (recipes.json).
    // This test pins the honest ygg2 behaviour — do NOT change findRecipe to
    // fall through to bridges; keep the two sources separate and transparent.
    expect(findRecipe('api-call', 'tool-use')).toBeUndefined();
    expect(findRecipe('multi-agent-debate', 'swarm-topology-management')).toBeUndefined();
  });

  it('is order-independent — (tool-use, api-call) returns same as (api-call, tool-use)', () => {
    // Both undefined on ygg2; order-independence of the pairKey is still tested.
    const a = findRecipe('api-call', 'tool-use');
    const b = findRecipe('tool-use', 'api-call');
    expect(a).toEqual(b);
  });

  it('returns undefined for a nonsense pair', () => {
    expect(findRecipe('unicorn-dust', 'time-travel')).toBeUndefined();
  });

  it('returns undefined for empty strings', () => {
    expect(findRecipe('', '')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// findDerivedRecipe — the NEW source of truth for registry 2-prereq fusions
//
// On Yggdrasil II, these are the pairs that previously lived in recipes.json
// (via combinations.md rows) and now live in bridges.json reachableEdges
// (via inline fusion-node prerequisites). The pairs' existence and result
// IDs are asserted here to prevent silent regressions on registry changes.
// ---------------------------------------------------------------------------

describe('findDerivedRecipe', () => {
  it('resolves api-call + tool-use → cloud-platform-management (ygg2 canonical fusion)', () => {
    const result = findDerivedRecipe('api-call', 'tool-use');
    expect(result).toBe('cloud-platform-management');
  });

  it('is order-independent for api-call + tool-use', () => {
    expect(findDerivedRecipe('api-call', 'tool-use')).toBe(
      findDerivedRecipe('tool-use', 'api-call'),
    );
  });

  it('resolves multi-agent-debate + swarm-topology-management → advanced-swarm-coordination', () => {
    const result = findDerivedRecipe('multi-agent-debate', 'swarm-topology-management');
    expect(result).toBe('advanced-swarm-coordination');
  });

  it('is order-independent for multi-agent-debate + swarm-topology-management', () => {
    expect(findDerivedRecipe('multi-agent-debate', 'swarm-topology-management')).toBe(
      findDerivedRecipe('swarm-topology-management', 'multi-agent-debate'),
    );
  });

  it('returns undefined for a nonsense pair', () => {
    expect(findDerivedRecipe('unicorn-dust', 'time-travel')).toBeUndefined();
  });

  it('returns undefined for empty strings', () => {
    expect(findDerivedRecipe('', '')).toBeUndefined();
  });

  it('resolves at least one known 2-prereq fusion (registry non-empty check)', () => {
    // agent-environment-setup: prereqs = [document-editing, tool-use] — both basic on ygg2
    const result = findDerivedRecipe('document-editing', 'tool-use');
    expect(result).toBe('agent-environment-setup');
  });
});

// ---------------------------------------------------------------------------
// skillTreeUrl — pure function, unaffected by data source changes
// ---------------------------------------------------------------------------

describe('skillTreeUrl', () => {
  it('builds the correct URL for a known contributor + slug', () => {
    expect(skillTreeUrl('ruvnet', 'swarm-advanced')).toBe(
      'https://gaiaskilltree.com/named/#explorer/ruvnet/swarm-advanced'
    );
  });

  it('builds the correct URL for another contributor', () => {
    expect(skillTreeUrl('mattpocock', 'setup-matt-pocock-skills')).toBe(
      'https://gaiaskilltree.com/named/#explorer/mattpocock/setup-matt-pocock-skills'
    );
  });

  it('returns undefined when contributor is undefined', () => {
    expect(skillTreeUrl(undefined, 'some-skill')).toBeUndefined();
  });

  it('returns undefined when slug is undefined', () => {
    expect(skillTreeUrl('ruvnet', undefined)).toBeUndefined();
  });

  it('returns undefined when both are undefined', () => {
    expect(skillTreeUrl(undefined, undefined)).toBeUndefined();
  });

  it('returns undefined when contributor is empty string', () => {
    expect(skillTreeUrl('', 'some-skill')).toBeUndefined();
  });

  it('returns undefined when slug is empty string', () => {
    expect(skillTreeUrl('ruvnet', '')).toBeUndefined();
  });

  it('URL format is correct: starts with https://gaiaskilltree.com/named/#explorer/', () => {
    const url = skillTreeUrl('testcontrib', 'test-slug');
    expect(url).toMatch(/^https:\/\/gaiaskilltree\.com\/named\/#explorer\//);
  });

  it('URL encodes contributor and slug exactly (no extra encoding)', () => {
    const url = skillTreeUrl('ruvnet', 'swarm-advanced');
    expect(url).toContain('/ruvnet/swarm-advanced');
  });
});
