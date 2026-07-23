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
 *
 * RATIFIED 0.80 (2026-07-24, founder sign-off — see PR #111). Founder gate
 * closed. Value is the output of four independent live probes against the
 * production Vectorize index (278 named skills, real BGE embeddings),
 * reviewed and accepted by the founder rather than auto-resolved:
 *  - Recall sweep (n=20 realistic creative-name paraphrases): true-positive
 *    floor 0.763, median 0.819. 0.80 captures 63% of these vs 47% at 0.82.
 *  - Adversarial false-positive hunt (n=63): worst *clean* false positive is a
 *    flat generic dev description ("fixing bugs + reviewing PRs") at 0.757, with
 *    a dense generic/ambiguous cluster at 0.69–0.76. 0.80 sits above that cluster
 *    with ~0.04 margin.
 *  - Margin (top1−top2) analysis (n=15): margin is a NOISIER separator than raw
 *    score (near-duplicate corpus skills produce small gaps on correct hits) —
 *    do not gate on margin; keep the absolute-threshold mechanism.
 * Product asymmetry drove the choice: a wrong promotion to the wrong canonical
 * skill damages trust more than staying emergent, so the threshold sits above
 * the known false-positive ceiling rather than chasing maximum recall.
 * RISK: true/false-positive scores genuinely overlap in the 0.75-0.82 band in
 * this register (see PR #111 discussion) — 0.80 is a trade-off point, not a
 * clean boundary. Recommend logging real promotion scores for a week before
 * treating this as final.
 */
export const VECTORIZE_THRESHOLD = 0.8;

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
