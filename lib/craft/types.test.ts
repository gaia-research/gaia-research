/**
 * lib/craft/types.test.ts
 *
 * Unit tests for the pairKey helper from lib/craft/types.ts.
 *
 * pairKey contract (from JSDoc):
 *   - Lowercases and trims both inputs.
 *   - Sorts alphabetically so pairKey("B","A") === pairKey("A","B").
 *   - Joins with "+".
 *   - Does NOT strip leading slashes — "/" is preserved and sorted as a character.
 */

import { describe, it, expect } from 'vitest';
import { pairKey } from './types';

describe('pairKey', () => {
  it('is order-independent (symmetric)', () => {
    expect(pairKey('api-call', 'tool-use')).toBe(pairKey('tool-use', 'api-call'));
  });

  it('lowercases both inputs', () => {
    expect(pairKey('API-Call', 'Tool-Use')).toBe('api-call+tool-use');
  });

  it('trims surrounding whitespace', () => {
    expect(pairKey('  api-call  ', '  tool-use  ')).toBe('api-call+tool-use');
  });

  it('combines lowercase + trim + order-independence', () => {
    expect(pairKey('  Tool-Use  ', '  API-Call  ')).toBe('api-call+tool-use');
  });

  it('sorts alphabetically — "a" before "b"', () => {
    expect(pairKey('zebra', 'apple')).toBe('apple+zebra');
  });

  it('joins with "+"', () => {
    const key = pairKey('x', 'y');
    expect(key).toContain('+');
    expect(key.split('+')).toHaveLength(2);
  });

  it('handles identical inputs', () => {
    expect(pairKey('self', 'self')).toBe('self+self');
  });

  it('does NOT strip leading slashes — slash is preserved in key', () => {
    // pairKey has no slash-stripping logic; "/" is a character like any other.
    // "/" sorts before letters (ASCII 47 < 97), so "/a" < "b" alphabetically.
    const key = pairKey('/A', 'B');
    // Lowercased: "/a" and "b". Sorted: "/a" < "b". Result: "/a+b"
    expect(key).toBe('/a+b');
  });

  it('pairKey("/A","B") !== pairKey("b","a") because slash is preserved', () => {
    // pairKey('/A','B') => '/a+b'
    // pairKey('b','a')  => 'a+b'
    expect(pairKey('/A', 'B')).not.toBe(pairKey('b', 'a'));
  });

  it('produces a known stable key for a real recipe pair', () => {
    // From data/craft/recipes.json: pairKey "api-call+tool-use"
    expect(pairKey('api-call', 'tool-use')).toBe('api-call+tool-use');
    expect(pairKey('tool-use', 'api-call')).toBe('api-call+tool-use');
  });

  it('produces a known stable key for an easter-egg pair', () => {
    // code-execution + browser-control => /works-on-my-machine
    expect(pairKey('code-execution', 'browser-control')).toBe(
      'browser-control+code-execution'
    );
    expect(pairKey('browser-control', 'code-execution')).toBe(
      'browser-control+code-execution'
    );
  });
});
