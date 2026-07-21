/**
 * lib/craft/similarity-shim.test.ts
 */
import { describe, it, expect } from 'vitest';
import { findTopCandidateSlugs } from './similarity-shim';

describe('findTopCandidateSlugs', () => {
  it('returns candidate slugs for web and scrape query', () => {
    const candidates = findTopCandidateSlugs('web', 'scrape', 3);
    expect(candidates).toBeDefined();
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.length).toBeLessThanOrEqual(3);
  });

  it('returns candidate slugs for code and review query', () => {
    const candidates = findTopCandidateSlugs('code', 'review', 3);
    expect(candidates).toBeDefined();
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.some((c) => c.includes('code') || c.includes('review'))).toBe(true);
  });

  it('returns default fallback candidates for arbitrary inputs', () => {
    const candidates = findTopCandidateSlugs('foo', 'bar', 5);
    expect(candidates).toBeDefined();
    expect(candidates.length).toBeGreaterThan(0);
  });
});
