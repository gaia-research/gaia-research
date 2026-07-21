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

  // --- Discoverability: real registry skills should be "easy" to surface ----
  // These pin down the actual point of the attractor system — a dev fusing
  // two plainly-named ingredients should see the matching ground-truth slug
  // show up as a top candidate, not just "some non-empty array".

  it('surfaces the real "scrape" slug for a web+scrape fusion', () => {
    const candidates = findTopCandidateSlugs('web', 'scrape', 5);
    expect(candidates).toContain('scrape');
  });

  it('surfaces the real "make-pdf" slug for a make+pdf fusion', () => {
    const candidates = findTopCandidateSlugs('make', 'pdf', 5);
    expect(candidates).toContain('make-pdf');
  });

  it('surfaces a real test-authoring slug for a unit+test fusion', () => {
    const candidates = findTopCandidateSlugs('unit', 'test', 5);
    expect(
      candidates.some((c) => c === 'unittest-generator' || c === 'test-driven-development')
    ).toBe(true);
  });

  it('surfaces a real deploy slug for a land+deploy fusion', () => {
    const candidates = findTopCandidateSlugs('land', 'deploy', 5);
    expect(candidates.some((c) => c.includes('deploy'))).toBe(true);
  });
});
