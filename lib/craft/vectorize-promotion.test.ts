/**
 * lib/craft/vectorize-promotion.test.ts
 *
 * Unit tests for the Vectorize fuzzy promotion tier (Epic #89 / #87).
 *
 * All Cloudflare bindings are mocked — these run under plain vitest with no
 * live Cloudflare credentials, proving the fallback chain (missing binding /
 * timeout / API error / low score / stale slug) always degrades to
 * `undefined` and never throws, per the plan's stability guarantee.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  resolveVectorizePromotion,
  VECTORIZE_THRESHOLD,
  VECTORIZE_TIMEOUT_MS,
} from './vectorize-promotion';
import type { AiLike, VectorizeLike } from './vectorize-promotion';

/** A known real named-skill slug (see data/craft/named-index.json). */
const KNOWN_SLUG = 'scrape';
const KNOWN_CONTRIBUTOR = 'garrytan';

function mockAi(vector: number[] = new Array(768).fill(0.1)): AiLike {
  return { run: vi.fn().mockResolvedValue({ data: [vector] }) };
}

function mockVectorize(matches: Array<{ score: number; metadata?: Record<string, string> }>): VectorizeLike {
  return { query: vi.fn().mockResolvedValue({ matches }) };
}

describe('resolveVectorizePromotion', () => {
  it('returns undefined immediately when the VECTORIZE binding is absent (no AI call made)', async () => {
    const ai = mockAi();
    const result = await resolveVectorizePromotion('Scraping the Web', { AI: ai });
    expect(result).toBeUndefined();
    expect(ai.run).not.toHaveBeenCalled();
  });

  it('returns undefined immediately when the AI binding is absent (no Vectorize call made)', async () => {
    const vectorize = mockVectorize([{ score: 0.95, metadata: { slug: KNOWN_SLUG } }]);
    const result = await resolveVectorizePromotion('Scraping the Web', { VECTORIZE: vectorize });
    expect(result).toBeUndefined();
    expect(vectorize.query).not.toHaveBeenCalled();
  });

  it('returns undefined when the AI embed call hangs past VECTORIZE_TIMEOUT_MS', async () => {
    const hangingAi: AiLike = { run: vi.fn(() => new Promise(() => {})) };
    const vectorize = mockVectorize([{ score: 0.95, metadata: { slug: KNOWN_SLUG } }]);

    const start = Date.now();
    const result = await resolveVectorizePromotion('Scraping the Web', {
      AI: hangingAi,
      VECTORIZE: vectorize,
    });
    const elapsed = Date.now() - start;

    expect(result).toBeUndefined();
    expect(elapsed).toBeLessThan(VECTORIZE_TIMEOUT_MS + 200);
  });

  it('returns undefined when the Vectorize query throws', async () => {
    const ai = mockAi();
    const vectorize: VectorizeLike = { query: vi.fn().mockRejectedValue(new Error('vectorize down')) };
    const result = await resolveVectorizePromotion('Scraping the Web', { AI: ai, VECTORIZE: vectorize });
    expect(result).toBeUndefined();
  });

  it('returns undefined when the top match score is below VECTORIZE_THRESHOLD', async () => {
    const ai = mockAi();
    const vectorize = mockVectorize([{ score: 0.7, metadata: { slug: KNOWN_SLUG } }]);
    expect(0.7).toBeLessThan(VECTORIZE_THRESHOLD);
    const result = await resolveVectorizePromotion('Something vaguely related', {
      AI: ai,
      VECTORIZE: vectorize,
    });
    expect(result).toBeUndefined();
  });

  it('promotes when the top match score is at/above VECTORIZE_THRESHOLD and the slug is known', async () => {
    const ai = mockAi();
    const vectorize = mockVectorize([{ score: 0.85, metadata: { slug: KNOWN_SLUG } }]);
    expect(0.85).toBeGreaterThanOrEqual(VECTORIZE_THRESHOLD);
    const result = await resolveVectorizePromotion('Scraping the Web', { AI: ai, VECTORIZE: vectorize });
    expect(result).toEqual({ slug: KNOWN_SLUG, contributor: KNOWN_CONTRIBUTOR });
  });

  it('does not promote when the matched slug is unknown (stale Vectorize index)', async () => {
    const ai = mockAi();
    const vectorize = mockVectorize([{ score: 0.9, metadata: { slug: 'deleted-skill-slug' } }]);
    const result = await resolveVectorizePromotion('Some fusion name', { AI: ai, VECTORIZE: vectorize });
    expect(result).toBeUndefined();
  });

  it('returns undefined when the AI embed response has no usable vector', async () => {
    const ai: AiLike = { run: vi.fn().mockResolvedValue({ data: [] }) };
    const vectorize = mockVectorize([{ score: 0.95, metadata: { slug: KNOWN_SLUG } }]);
    const result = await resolveVectorizePromotion('Scraping the Web', { AI: ai, VECTORIZE: vectorize });
    expect(result).toBeUndefined();
    expect(vectorize.query).not.toHaveBeenCalled();
  });

  it('returns undefined when Vectorize returns no matches', async () => {
    const ai = mockAi();
    const vectorize = mockVectorize([]);
    const result = await resolveVectorizePromotion('Scraping the Web', { AI: ai, VECTORIZE: vectorize });
    expect(result).toBeUndefined();
  });
});
