/**
 * lib/craft/recipes.test.ts
 *
 * Unit tests for findRecipe, loadRecipes, and skillTreeUrl from lib/craft/recipes.ts.
 *
 * Real data used:
 *   - "api-call+tool-use" → result: "flow-nexus-platform", contributor: "ruvnet", slug: "flow-nexus-platform"
 *   - "multi-agent-debate+swarm-topology-management" → result: "swarm-advanced", contributor: "ruvnet"
 */

import { describe, it, expect } from 'vitest';
import { findRecipe, skillTreeUrl, loadRecipes } from './recipes';

describe('loadRecipes', () => {
  it('returns an array with at least one recipe', () => {
    const recipes = loadRecipes();
    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes.length).toBeGreaterThan(0);
  });

  it('every recipe has a non-empty pairKey, result, emoji, and blurb', () => {
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

  it('each pairKey contains exactly one "+" separator', () => {
    const recipes = loadRecipes();
    for (const r of recipes) {
      expect(r.pairKey.split('+').length).toBe(2);
    }
  });
});

describe('findRecipe', () => {
  it('returns the canonical recipe for a known pair (api-call + tool-use)', () => {
    const recipe = findRecipe('api-call', 'tool-use');
    expect(recipe).toBeDefined();
    expect(recipe!.result).toBe('flow-nexus-platform');
    expect(recipe!.contributor).toBe('ruvnet');
    expect(recipe!.slug).toBe('flow-nexus-platform');
    expect(recipe!.pairKey).toBe('api-call+tool-use');
  });

  it('is order-independent — (tool-use, api-call) finds the same recipe', () => {
    const a = findRecipe('api-call', 'tool-use');
    const b = findRecipe('tool-use', 'api-call');
    expect(a).toEqual(b);
  });

  it('returns canonical recipe for multi-agent-debate + swarm-topology-management', () => {
    const recipe = findRecipe('multi-agent-debate', 'swarm-topology-management');
    expect(recipe).toBeDefined();
    expect(recipe!.result).toBe('swarm-advanced');
    expect(recipe!.contributor).toBe('ruvnet');
  });

  it('returns undefined for a nonsense pair', () => {
    expect(findRecipe('unicorn-dust', 'time-travel')).toBeUndefined();
  });

  it('returns undefined for empty strings', () => {
    expect(findRecipe('', '')).toBeUndefined();
  });

  it('is case-insensitive (delegates to pairKey normalisation)', () => {
    const lower = findRecipe('api-call', 'tool-use');
    const mixed = findRecipe('API-Call', 'Tool-Use');
    expect(mixed).toEqual(lower);
  });
});

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
