# Plan — #87: Cloudflare Vectorize fuzzy promotion for Infinite Skill Craft

**Status:** implementation plan — built to `docs/plans/epic-89-reachability-RATIFICATION.md` (LOCKED).  
**Base branch:** `epic-89/full-registry-discoverability` (tip `66d6e78`).  
**Author for ALL commits:** `mbtiongson1 <marco.tngsn@gmail.com>`.  
**Target PR:** into `epic-89/full-registry-discoverability` (NOT staging or main).

---

## 1. Context and purpose

#85/#86 landed a deterministic A′ layer that makes 153 named skills / 84 named-backed fusions
reachable from the 4 game seeds. The **41 purely-generic starless fusions are the deliberate
emergent boundary** — players who craft a combo the model names as a real skill "by accident"
deserve the canonical aha moment even if they didn't type the exact slug.

Today's promotion path (`resolvePromotion` in `route.ts`) does exact slug-normalisation only:
`nameToSlug(raw.name) → namedContributor(slug)`. A player whose fusion returns `"Web Scraping"`
correctly promotes to `web-scraper`. But `"Scraping the Web"` or `"Web Content Extraction"`
does not — even though both obviously intend the same named skill.

**#87 adds a Vectorize-backed fuzzy promotion tier** that closes this gap: embed every named
skill at sync time, query on every emergent result, and promote above a tuned threshold.
The exact-string gate is preserved and runs first; Vectorize *supplements* it.

The epic's primary stability constraint: **a Vectorize outage must never slow or break a fuse
response.** Tight timeout + fallback to existing `similarity-shim.ts` path.

### 1.1 Game design rationale (collector arc)

The Gaia Skill Craft experience is a collector's arc: the player fuses generic skill pieces until a combination clicks and yields a full named contributor skill. The depth distribution is the spine of that arc. Of the 153 reachable named skills, 89 sit at depth 1 — reachable in a single fusion from the game seeds — so the opening minutes deliver near-constant wins and teach the core loop without friction. The curve then tapers deliberately: 84 targets at depth 2, 45 at depth 3, 16 at depth 4, 6 at depth 5, and a single depth-6 capstone. That long, thinning tail is the mid-to-late game, where the player has internalized the fusion grammar and is now hunting specific contributors rather than stumbling into them. The shape rewards the first session heavily and reserves genuine challenge for the committed collector.

The time model confirms the arc lands inside the founder's stated target of "a few hours is good, ~20 hours to reach everything is fine." First-touch of all 38 reachable contributors takes a minimum of 24 unique fusions; completing the full set of 153 named skills takes a minimum of 89 unique fusions. At a plausible 5-15 minutes of play per fusion, full completion runs 7.4h (5min), 14.8h (10min), to 22.2h (15min). "A few hours" gets a player to broad contributor coverage and most of the depth-1/depth-2 layer; the ~20-hour figure aligns with the 15-minute-per-fusion pace to 100% completion. The buffered coverage floors protect exactly this experience: they guarantee the depth-1 breadth (≥82 named-backed fusions, ≥87 deterministic reaches) and the seed reachability (≥65%) that make the early game feel abundant, while allowing the registry to grow without CI friction.

The coverage floors are game-design guardrails, not arbitrary numbers. `gameSeedReachablePct ≥ 65%` guarantees that roughly two-thirds of the registry is reachable from the starting seeds, so a new player is never staring at a mostly-locked tree — the sense of an open, explorable space is preserved. The reachable-contributor floor stays at 38 of 47 (not 47) because the 9 blocked contributors sit behind basic nodes outside the A′ closure; forcing 47 would misrepresent the game's actual reachable surface and create a false regression signal. `internalConnectivityPct = 100` guarantees the internal graph never fragments, so no fusion the player can see is a dead end. Together the floors say: the game must always offer an abundant, connected, mostly-open collection space that rewards a first session and tapers into a ~20-hour completionist chase — and CI will fire the moment a registry change silently erodes that promise.

Note on `gameSeedReachablePct` precision: the gate applies `Math.floor` before comparing, so the effective threshold is 65 (not 65.8%). This means a loss of 1-2 seed-reachable skills can pass silently (e.g. 158/243 = 65.0% passes; 157/243 = 64.6% floors to 64 and fails). This is intentional — it absorbs 1-2 benign Yggdrasil II slug renames while still firing on any real loss of ≥3 seed-reachable skills.

---

## 2. Founder gates — surface BEFORE merging (non-negotiable)

These are trust/product calls, not implementation decisions. Present with evidence; do not pick.

| Gate | What to show | Where to surface |
|------|-------------|-----------------|
| **Similarity threshold** | Example matched pairs at the chosen value; example near-miss pairs that correctly do NOT promote; measured false-positive rate on a hand-curated set. `VECTORIZE_THRESHOLD = 0.82` is a placeholder pending live measurement — the founder sets the final value after reviewing the paraphrase evidence table in the PR body. | PR body + comment on #87 |
| **p95 latency budget** | Measured p95 added latency (warm + cold) for Vectorize query path vs. exact-match baseline. The 800ms timeout (`VECTORIZE_TIMEOUT_MS`) is kept as-is — confirmed decision. Any Vectorize failure or timeout falls back to exact-match + emergent with zero impact on fuse response. | PR body |
| **Fallback behaviour** | Evidence the fallback path (similarity-shim) is exercised correctly on Vectorize failure/timeout — confirmed: `similarity-shim.ts` stays unchanged and handles AI prompt candidate targeting regardless of Vectorize state. | Test output |

---

## 3. Scope boundaries

**In scope:**
- Provision Vectorize index via `wrangler` CLI (no dashboard).
- Embed every named skill (title + description) at sync time in `scripts/craft/sync-skill-tree.ts`.
- Add `resolveVectorizePromotion` in `route.ts` as a thin wrapper called after the exact-match gate fails.
- Bind `VECTORIZE` in `wrangler.jsonc`.
- Fallback: `similarity-shim.ts` stays as offline/test/timeout fallback. Never delete it.
- Tests: paraphrase set, false-positive rate, fallback path, latency measurement.

**Out of scope:**
- Re-embedding on every request (only at sync time / on registry change).
- Replacing the exact-match gate.
- Changing how A′ bridges work.
- Merging to staging or main.

---

## 4. Vectorize provisioning

### 4.1 Create the index

```bash
npx wrangler vectorize create gaia-craft-skills \
  --dimensions=768 \
  --metric=cosine
```

Dimensions = 768 matches Workers AI `@cf/baai/bge-base-en-v1.5` output (the same model used for
querying). Record the returned index name in `wrangler.jsonc`.

### 4.2 `wrangler.jsonc` — add binding

```jsonc
"vectorize": [
  {
    "binding": "VECTORIZE",
    "index_name": "gaia-craft-skills"
  }
]
```

### 4.3 `cloudflare-env.d.ts` — add type (regenerate with `npm run cf-typegen` after binding)

The generated type adds `VECTORIZE: VectorizeIndex` to `CloudflareEnv`. The fuse route accesses
it through a narrow local interface (same pattern as `KvLike` / `AiLike` already in the file):

```typescript
interface VectorizeLike {
  query(
    vector: number[],
    opts: { topK: number; returnMetadata?: 'all' | 'indexed' | 'none' }
  ): Promise<{ matches: Array<{ score: number; metadata?: Record<string, string> }> }>;
}
```

---

## 5. Embedding at sync time

### 5.1 Location: `scripts/craft/sync-skill-tree.ts`

After `named-index.json` is written, add an **optional** step:
`embedAndUpsertNamedSkills(namedIndex, vectorize)`.

This function:
1. Iterates all slugs in `named-index.json.skills`.
2. For each slug: constructs embed text = `"${title}. ${description}"` (capped at 512 chars).
3. Calls Workers AI `@cf/baai/bge-base-en-v1.5` to embed — batched in groups of 50 to stay
   within Workers AI batch limits.
4. Calls `vectorize.upsert([{ id: slug, values: embedding, metadata: { slug } }])`.

**The Vectorize upsert is fire-and-optional:** if the `VECTORIZE` binding is absent (local dev,
offline) the function exits early with a warning — it must never block the sync.

```typescript
async function embedAndUpsertNamedSkills(
  namedIndex: NamedIndex,
  env: { AI?: AiLike; VECTORIZE?: VectorizeLike }
): Promise<void> {
  if (!env.AI || !env.VECTORIZE) {
    console.warn('[sync] VECTORIZE or AI binding absent — skipping embedding upsert.');
    return;
  }
  // ... batched embed + upsert
}
```

The sync script already runs as a `tsx` script (`npx tsx scripts/craft/sync-skill-tree.ts`).
In CI it runs without Cloudflare bindings — the early-exit path keeps CI green.

### 5.2 Re-embed trigger

Re-embedding is needed whenever `named-index.json` changes (i.e., every registry sync).
The registry-resync workflow (`.github/workflows/craft-registry-resync.yml`) runs the sync
script — add the embed step after it. Because this requires live Cloudflare bindings, gate it
behind a `CLOUDFLARE_API_TOKEN` secret check; skip silently in PR/fork contexts.

---

## 6. Fuzzy promotion in `route.ts`

### 6.1 Interface extension

Add `VECTORIZE?: VectorizeLike` to `CraftBindings` (the existing narrow interface).

### 6.2 `resolveVectorizePromotion` — new async function

```typescript
/**
 * Embeds the given text and queries Vectorize for the closest named skill.
 * Returns { slug, contributor } if the top match exceeds VECTORIZE_THRESHOLD,
 * undefined otherwise.
 *
 * Falls back to undefined (not an error) on any failure/timeout, preserving
 * the stability guarantee: Vectorize unavailability must never affect the
 * fuse response.
 */
async function resolveVectorizePromotion(
  text: string,
  bindings: CraftBindings,
): Promise<{ slug: string; contributor: string } | undefined> {
  if (!bindings.AI || !bindings.VECTORIZE) return undefined;
  try {
    const embedResult = await Promise.race([
      bindings.AI.run('@cf/baai/bge-base-en-v1.5', { text: [text] }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('vectorize timeout')), VECTORIZE_TIMEOUT_MS)
      ),
    ]);
    const vector = (embedResult as { data: number[][] }).data?.[0];
    if (!vector) return undefined;

    const queryResult = await Promise.race([
      bindings.VECTORIZE.query(vector, { topK: 1, returnMetadata: 'all' }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('vectorize timeout')), VECTORIZE_TIMEOUT_MS)
      ),
    ]);
    const top = queryResult.matches[0];
    if (!top || top.score < VECTORIZE_THRESHOLD) return undefined;

    const slug = top.metadata?.slug ?? '';
    const contributor = namedContributor(slug);
    return contributor ? { slug, contributor } : undefined;
  } catch {
    // Any failure (timeout, API error, parse error) → undefined; never throw.
    return undefined;
  }
}
```

### 6.3 Constants (tune before founder sign-off)

```typescript
/** Cosine similarity threshold for Vectorize fuzzy promotion. FOUNDER GATE — requires sign-off. */
const VECTORIZE_THRESHOLD = 0.82; // placeholder; set after measuring paraphrase set

/** Vectorize query timeout in ms (covers embed + query round-trip). */
const VECTORIZE_TIMEOUT_MS = 800;
```

`VECTORIZE_THRESHOLD = 0.82` is explicitly a placeholder — it must not be treated as final. The
PR body must present the paraphrase evidence table and near-miss evidence, and the founder sets
the final value as part of the similarity threshold founder gate before this plan is considered
merged.

### 6.4 Call site in the emergent path

Existing priority order (from route.ts docstring):
```
1. canonical (recipe)
2. canonical (derived / seed-bridge)
3. canonical (starter)
4. easteregg
5. emergent → exact promotion → [NEW: Vectorize fuzzy promotion] → emergent
```

In the emergent block, after `resolvePromotion(raw.name)` returns undefined:

```typescript
// EMERGENT → CANONICAL PROMOTION (exact match)
let promotion = resolvePromotion(raw.name);

// EMERGENT → CANONICAL PROMOTION (Vectorize fuzzy — supplements exact, never replaces)
if (!promotion) {
  const queryText = `${raw.name}. ${raw.blurb ?? ''}`.slice(0, 512);
  promotion = await resolveVectorizePromotion(queryText, bindings);
}

// ... existing promotion handling (unchanged)
```

The fallback chain when Vectorize is absent or fails:
- `bindings.VECTORIZE` absent → `resolveVectorizePromotion` returns undefined immediately.
- Timeout or API error → returns undefined.
- Either way: result degrades to emergent (existing `similarity-shim.ts` candidate targeting
  for the AI prompt is still active). No path change for the non-promotion case.

### 6.5 `similarity-shim.ts` — kept, not touched

`findTopCandidateSlugs` continues to be called for AI prompt candidate targeting (the 8-slug
list). This is a distinct concern from promotion and remains the offline/local-dev path for
*candidate targeting*. `similarity-shim.ts` is never deleted.

---

## 7. Tests

### 7.1 `lib/craft/vectorize-promotion.test.ts` — new file

Unit tests that can run in vitest (no live Cloudflare bindings):

1. **Fallback when VECTORIZE absent** — `resolveVectorizePromotion` with no `VECTORIZE`
   binding returns undefined immediately (no AI call made).
2. **Fallback on AI timeout** — mock `AI.run` to hang past `VECTORIZE_TIMEOUT_MS`; assert
   undefined returned within `VECTORIZE_TIMEOUT_MS + 100ms`.
3. **Fallback on Vectorize error** — mock `VECTORIZE.query` to throw; assert undefined.
4. **Fallback when score below threshold** — mock returns score `0.70`; assert undefined.
5. **Promotes when score above threshold** — mock returns score `0.85` with `metadata.slug =
   'web-scraper'`; assert promotion returned with correct slug + contributor.
6. **Does not promote unknown slug** — score `0.90` but slug not in `named-index.json`; assert
   undefined (guards against stale Vectorize index returning deleted skills).

### 7.2 Paraphrase evidence (for founder gate — not a vitest test)

Hand-curated in the PR body (not automated — these require live embeddings):

| Input text | Expected promotion | Vectorize score | Outcome |
|---|---|---|---|
| `"Scraping the Web"` | `web-scraper` | TBD | promote |
| `"Web Content Extraction"` | `web-scraper` | TBD | promote |
| `"Make a PDF"` | `pdf-parser` | TBD | promote |
| `"Convert document to PDF"` | `pdf-parser` | TBD | promote |
| `"Completely Random Nonsense Skill"` | none | TBD | no-promote |
| `"Data Analysis"` (ambiguous) | TBD | TBD | measure false-pos risk |

Present actual scores. Founder sets the final threshold value.

### 7.3 Latency measurement (for founder gate)

Run against a Workers preview deployment:
- 10 warm Vectorize queries → p50, p95.
- 3 cold-start queries → p95.
- Baseline: same route without Vectorize (exact-match only).
- Present the delta. Target: p95 added latency ≤ 200ms.

---

## 8. Verification gate (before requesting review)

- `npx vitest run` fully green (all new tests pass; pre-existing `mcp/acceptance.test.ts`
  failures still the only allowed failures).
- `npx tsc --noEmit` clean.
- Vectorize index provisioned (`npx wrangler vectorize list` shows `gaia-craft-skills`).
- `wrangler.jsonc` has the `vectorize` binding entry.
- Paraphrase table + p95 latency written in PR body.
- `similarity-shim.ts` unchanged and still imported/used.

---

## 9. Out of scope

- Replacing the exact-match promotion gate.
- Changing A′ bridge synthesis or `bridges.json`.
- Modifying `similarity-shim.ts` beyond keeping it as fallback.
- Merging to `staging`/`main`. Leave for founder review after all four sub-issues land.
