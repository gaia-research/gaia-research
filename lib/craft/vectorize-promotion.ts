/**
 * lib/craft/vectorize-promotion.ts
 *
 * Emergent → canonical promotion, TIER 2: Vectorize fuzzy match (Epic #89 / #87).
 *
 * `route.ts`'s exact-match gate (`resolvePromotion` / `nameToSlug`) only catches
 * a fusion name that normalises to the EXACT slug of a real named skill. A
 * player whose fusion the model names "Scraping the Web" or "Web Content
 * Extraction" doesn't match that gate — but its embedding lands close to the
 * `web-scraper` named skill's embedding. This module supplements (never
 * replaces) the exact-match gate with that fuzzy tier.
 *
 * Stability guarantee: a Vectorize outage/timeout must NEVER slow down or
 * break a fuse response. Every failure mode here (missing binding, timeout,
 * API error, malformed response, stale/unknown slug) degrades to `undefined`,
 * which the caller treats identically to "no promotion" (stays emergent).
 *
 * Named skills are embedded at sync time — see
 * scripts/craft/sync-skill-tree.ts's `embedAndUpsertNamedSkills`.
 */

import { namedContributor } from './named-index';

// ---------------------------------------------------------------------------
// Narrow binding surface (mirrors the pattern in route.ts's KvLike/AiLike —
// bindings might not exist at all on localhost / in tests).
// ---------------------------------------------------------------------------

export interface AiLike {
  run(model: string, input: { text: string[] }): Promise<unknown>;
}

/** Narrow surface of Cloudflare Vectorize we touch here (query-only — upsert lives in sync-skill-tree.ts). */
export interface VectorizeLike {
  query(
    vector: number[],
    opts: { topK: number; returnMetadata?: 'all' | 'indexed' | 'none' }
  ): Promise<{ matches: Array<{ score: number; metadata?: Record<string, string> }> }>;
}

export interface VectorizeBindings {
  AI?: AiLike;
  VECTORIZE?: VectorizeLike;
}

/**
 * Cosine similarity threshold for Vectorize fuzzy promotion.
 * FOUNDER GATE — this is a placeholder pending live measurement against a
 * hand-curated paraphrase set (see PR body for the evidence table). Do not
 * treat 0.82 as final; the founder sets the ratified value.
 */
export const VECTORIZE_THRESHOLD = 0.82;

/** Vectorize query timeout in ms — covers the embed call + the query round-trip. */
export const VECTORIZE_TIMEOUT_MS = 800;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('vectorize timeout')), ms)
    ),
  ]);
}

/**
 * Embeds the given text and queries Vectorize for the closest named skill.
 * Returns `{ slug, contributor }` if the top match exceeds `VECTORIZE_THRESHOLD`
 * and resolves to a still-known named skill, `undefined` otherwise.
 *
 * Never throws: any failure (missing binding, timeout, API error, parse
 * error, stale/unknown slug) resolves to `undefined` so the caller falls back
 * to the plain emergent result.
 */
export async function resolveVectorizePromotion(
  text: string,
  bindings: VectorizeBindings
): Promise<{ slug: string; contributor: string } | undefined> {
  if (!bindings.AI || !bindings.VECTORIZE) return undefined;
  try {
    const embedResult = await withTimeout(
      bindings.AI.run('@cf/baai/bge-base-en-v1.5', { text: [text] }),
      VECTORIZE_TIMEOUT_MS
    );
    const vector = (embedResult as { data?: number[][] })?.data?.[0];
    if (!vector || vector.length === 0) return undefined;

    const queryResult = await withTimeout(
      bindings.VECTORIZE.query(vector, { topK: 1, returnMetadata: 'all' }),
      VECTORIZE_TIMEOUT_MS
    );
    const top = queryResult.matches[0];
    if (!top || top.score < VECTORIZE_THRESHOLD) return undefined;

    const slug = top.metadata?.slug;
    if (!slug) return undefined;
    // Guards against a stale Vectorize index returning a slug that has since
    // been removed/renamed out of named-index.json.
    const contributor = namedContributor(slug);
    return contributor ? { slug, contributor } : undefined;
  } catch {
    // Any failure (timeout, API error, parse error) → undefined; never throw.
    return undefined;
  }
}
