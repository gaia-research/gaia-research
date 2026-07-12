/**
 * lib/craft/starter-recipes.test.ts
 *
 * Unit tests for the hand-authored "aha" TECH TREE (lib/craft/starter-recipes.ts).
 *
 * The starter tree is what makes the four one-word seed primitives
 * (/prompt /code /web /data) fuse into skills devs instantly recognise, so it
 * carries the game's early delight. These tests lock down the properties the
 * fusion route relies on:
 *   - the tree is dense enough to matter (≥40 recipes),
 *   - keys are unique (a duplicate pairKey would silently shadow a recipe),
 *   - lookup is order-independent (fuse(A,B) === fuse(B,A)),
 *   - the tier-1 seed combos resolve (the very first fusions must land), and
 *   - every recipe with a slug also has a contributor (link integrity — a slug
 *     without a contributor cannot derive a skill-tree URL).
 */

import { describe, it, expect } from 'vitest';
import { STARTER_RECIPES, findStarterRecipe, type StarterRecipe } from './starter-recipes';
import { pairKey } from './types';

describe('STARTER_RECIPES', () => {
  const entries = Object.entries(STARTER_RECIPES);

  it('defines a dense tech tree (≥40 recipes)', () => {
    expect(entries.length).toBeGreaterThanOrEqual(40);
  });

  it('has no duplicate pairKeys (record keys are unique by construction)', () => {
    const keys = Object.keys(STARTER_RECIPES);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keys every entry with a canonical pairKey (order-independent)', () => {
    for (const key of Object.keys(STARTER_RECIPES)) {
      const [a, b] = key.split('+');
      expect(pairKey(a, b)).toBe(key);
    }
  });

  it('gives every recipe a name, emoji, blurb, and factual description', () => {
    for (const recipe of Object.values(STARTER_RECIPES)) {
      expect(recipe.name.startsWith('/')).toBe(true);
      expect(recipe.emoji.length).toBeGreaterThan(0);
      expect(recipe.blurb.trim().length).toBeGreaterThan(0);
      expect(recipe.description.trim().length).toBeGreaterThan(0);
      // Description is factual — must not address the reader as "boss".
      expect(recipe.description.toLowerCase()).not.toContain('boss');
    }
  });

  it('keeps link integrity: every recipe with a slug also has a contributor', () => {
    const withSlug = Object.values(STARTER_RECIPES).filter((r) => r.slug);
    // Sanity: at least some recipes deep-link to real named skills.
    expect(withSlug.length).toBeGreaterThan(0);
    for (const recipe of withSlug) {
      expect(recipe.contributor, `${recipe.name} has a slug but no contributor`).toBeTruthy();
    }
  });
});

describe('findStarterRecipe', () => {
  it('resolves the tier-1 seed combos (the very first fusions must land)', () => {
    const cases: Array<[string, string, string]> = [
      ['/prompt', '/code', '/codegen'],
      ['/code', '/web', '/scraper'],
      ['/prompt', '/data', '/rag'],
    ];
    for (const [a, b, expected] of cases) {
      const r = findStarterRecipe(a, b);
      expect(r, `${a} + ${b} should resolve`).toBeDefined();
      expect(r?.name).toBe(expected);
    }
  });

  it('is order-independent', () => {
    const forward = findStarterRecipe('/prompt', '/code');
    const reverse = findStarterRecipe('/code', '/prompt');
    expect(forward).toBeDefined();
    expect(reverse).toEqual(forward);
  });

  it('is case- and whitespace-tolerant (delegates to pairKey)', () => {
    const norm = findStarterRecipe('/prompt', '/code');
    const messy = findStarterRecipe('  /PROMPT ', '/Code');
    expect(messy).toEqual(norm);
  });

  it('returns undefined for pairs with no authored recipe', () => {
    expect(findStarterRecipe('/prompt', '/nonexistent-skill-xyz')).toBeUndefined();
  });

  it('threads a factual description onto every resolvable seed combo', () => {
    const seeds = ['/prompt', '/code', '/web', '/data'];
    let resolved = 0;
    for (let i = 0; i < seeds.length; i++) {
      for (let j = i; j < seeds.length; j++) {
        const r: StarterRecipe | undefined = findStarterRecipe(seeds[i], seeds[j]);
        if (r) {
          resolved++;
          expect(r.description.trim().length).toBeGreaterThan(0);
        }
      }
    }
    // All ten seed-pair combinations (incl. self-pairs) are authored.
    expect(resolved).toBe(10);
  });
});
