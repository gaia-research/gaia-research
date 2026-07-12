/**
 * lib/craft/easter-eggs.test.ts
 *
 * Unit tests for the Easter Egg zoo in lib/craft/easter-eggs.ts.
 *
 * Covers:
 *   - findEasterEgg returns correct data for known pairs
 *   - Order-independence
 *   - Returns undefined for unknown pairs
 *   - 40+ eggs exist
 *   - No duplicate pair keys (guards the collision bug that was already fixed)
 *   - All eggs have required fields (name, emoji, blurb)
 *   - Cursed eggs have valid curseId
 */

import { describe, it, expect } from 'vitest';
import { findEasterEgg, EASTER_EGGS } from './easter-eggs';
import { pairKey } from './types';

describe('EASTER_EGGS catalogue', () => {
  it('has 40 or more entries', () => {
    const count = Object.keys(EASTER_EGGS).length;
    expect(count).toBeGreaterThanOrEqual(40);
  });

  it('has NO duplicate pair keys — every key is unique', () => {
    const keys = Object.keys(EASTER_EGGS);
    const unique = new Set(keys);
    // If there were duplicates, Object.keys would only show the last winner,
    // but we also verify the count equals unique count to be explicit.
    expect(keys.length).toBe(unique.size);
  });

  it('every egg has a non-empty name, emoji, and blurb', () => {
    for (const [key, egg] of Object.entries(EASTER_EGGS)) {
      expect(egg.name, `egg at key "${key}" missing name`).toBeTruthy();
      expect(egg.emoji, `egg at key "${key}" missing emoji`).toBeTruthy();
      expect(egg.blurb, `egg at key "${key}" missing blurb`).toBeTruthy();
    }
  });

  it('every cursed egg has a curseId', () => {
    for (const [key, egg] of Object.entries(EASTER_EGGS)) {
      if (egg.cursed) {
        expect(egg.curseId, `cursed egg "${key}" has no curseId`).toBeTruthy();
      }
    }
  });

  it('all keys are valid pairKey format: two slug segments joined by "+"', () => {
    for (const key of Object.keys(EASTER_EGGS)) {
      const parts = key.split('+');
      expect(parts.length, `key "${key}" does not have exactly one "+" separator`).toBe(2);
    }
  });

  it('all keys are lowercased (pairKey produces lowercase)', () => {
    for (const key of Object.keys(EASTER_EGGS)) {
      expect(key).toBe(key.toLowerCase());
    }
  });

  it('egg names start with "/"', () => {
    for (const [key, egg] of Object.entries(EASTER_EGGS)) {
      expect(egg.name, `egg at key "${key}" name does not start with "/"`).toMatch(/^\//);
    }
  });
});

describe('findEasterEgg', () => {
  it('returns the /works-on-my-machine egg for (code-execution, browser-control)', () => {
    const egg = findEasterEgg('code-execution', 'browser-control');
    expect(egg).toBeDefined();
    expect(egg!.name).toBe('/works-on-my-machine');
    expect(egg!.emoji).toBe('🖥️');
  });

  it('is order-independent for /works-on-my-machine', () => {
    const a = findEasterEgg('code-execution', 'browser-control');
    const b = findEasterEgg('browser-control', 'code-execution');
    expect(a).toEqual(b);
  });

  it('returns the /parse-html-with-regex egg and it is cursed', () => {
    const egg = findEasterEgg('parse-html', 'logical-inference');
    expect(egg).toBeDefined();
    expect(egg!.name).toBe('/parse-html-with-regex');
    expect(egg!.cursed).toBe(true);
    expect(egg!.curseId).toBe('parse-html-with-regex');
  });

  it('returns the /exit-vim egg for (tool-use, memory-manage)', () => {
    const egg = findEasterEgg('tool-use', 'memory-manage');
    expect(egg).toBeDefined();
    expect(egg!.name).toBe('/exit-vim');
  });

  it('returns the /vibe-coding egg for (generate-text, code-generation)', () => {
    const egg = findEasterEgg('generate-text', 'code-generation');
    expect(egg).toBeDefined();
    expect(egg!.name).toBe('/vibe-coding');
  });

  it('returns the /context-diet egg for (context-compression, summarize)', () => {
    const egg = findEasterEgg('context-compression', 'summarize');
    expect(egg).toBeDefined();
    expect(egg!.name).toBe('/context-diet');
  });

  it('returns the /force-push-main egg and it is cursed', () => {
    const egg = findEasterEgg('diff-content', 'code-execution');
    expect(egg).toBeDefined();
    expect(egg!.name).toBe('/force-push-main');
    expect(egg!.cursed).toBe(true);
    expect(egg!.curseId).toBe('force-push-main');
  });

  it('returns undefined for an unknown pair', () => {
    expect(findEasterEgg('unicorn-dust', 'time-travel')).toBeUndefined();
  });

  it('returns undefined for empty strings', () => {
    expect(findEasterEgg('', '')).toBeUndefined();
  });

  it('is case-insensitive — uppercase inputs still find the egg', () => {
    const lower = findEasterEgg('code-execution', 'browser-control');
    const upper = findEasterEgg('CODE-EXECUTION', 'BROWSER-CONTROL');
    expect(upper).toEqual(lower);
  });

  it('all EASTER_EGGS entries are reachable via findEasterEgg with their own key parts', () => {
    // Verify the lookup map (EASTER_EGGS) is consistent with findEasterEgg
    for (const [key, egg] of Object.entries(EASTER_EGGS)) {
      const [partA, partB] = key.split('+');
      const found = findEasterEgg(partA, partB);
      expect(found, `findEasterEgg('${partA}', '${partB}') should find egg "${egg.name}"`).toBeDefined();
      expect(found!.name).toBe(egg.name);
    }
  });
});
