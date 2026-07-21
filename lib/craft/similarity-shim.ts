/**
 * lib/craft/similarity-shim.ts
 *
 * Fast, zero-latency local fallback candidate selector for Infinite Skill Craft.
 *
 * Computes character trigram + word overlap similarity against `named-index.json`
 * to return the Top 3-5 candidate target skills for any pair (a, b).
 *
 * Used in local dev (`next dev`) and test environments where Cloudflare Vectorize
 * is absent, ensuring 100% offline playability with sub-millisecond candidate targeting.
 */

import { lookupNamedSkill, getAllNamedSkillSlugs } from './named-index';

/** Clean token string for matching */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/** Extract character trigrams from text */
function trigrams(text: string): Set<string> {
  const set = new Set<string>();
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i <= clean.length - 3; i++) {
    set.add(clean.slice(i, i + 3));
  }
  return set;
}

/** Jaccard similarity between two trigram sets */
function trigramSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) {
    if (b.has(t)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Finds the top N candidate target skill slugs from `named-index.json` that best match
 * the input pair (a, b).
 *
 * @param a First skill slug or name
 * @param b Second skill slug or name
 * @param topK Number of candidate target skills to return (default 5)
 * @returns Array of candidate skill slugs
 */
export function findTopCandidateSlugs(a: string, b: string, topK = 5): string[] {
  const queryText = `${a} ${b}`;
  const queryTokens = new Set(tokenize(queryText));
  const queryTrigrams = trigrams(queryText);
  const allSlugs = getAllNamedSkillSlugs();

  if (allSlugs.length === 0) return [];

  const scored: Array<{ slug: string; score: number }> = [];

  for (const slug of allSlugs) {
    const named = lookupNamedSkill(slug);
    const targetText = `${slug} ${named?.title ?? ''} ${named?.description ?? ''}`;
    const targetTokens = tokenize(targetText);
    const targetTrigrams = trigrams(targetText);

    // Calculate word token overlap
    let tokenOverlap = 0;
    for (const t of targetTokens) {
      if (queryTokens.has(t)) tokenOverlap++;
    }
    const tokenScore = queryTokens.size > 0 ? tokenOverlap / queryTokens.size : 0;

    // Calculate trigram similarity
    const triScore = trigramSimilarity(queryTrigrams, targetTrigrams);

    // Combined weighted score
    const totalScore = tokenScore * 0.6 + triScore * 0.4;
    scored.push({ slug, score: totalScore });
  }

  // Sort descending by score
  scored.sort((x, y) => y.score - x.score);

  // Return top K slugs
  return scored.slice(0, topK).map((item) => item.slug);
}
