/**
 * app/labs/infinite-skill-craft/api/fuse/route.ts
 *
 * POST /labs/infinite-skill-craft/api/fuse
 *
 * The fusion engine for Infinite Skill Craft. Given two skill slugs it returns
 * a single `FusionResult`, resolving on a cache miss through this priority order:
 *
 *   1. canonical (recipe)   — a real Gaia Skill Tree recipe (deep-links to the skill page)
 *   2. canonical (starter)  — the hand-authored "aha" tech tree (starter-recipes.ts):
 *                             seed combos deterministically hit recognisable skills,
 *                             carrying a factual `description` and a skill-tree link
 *                             whenever the result maps to a real named skill.
 *   3. easteregg            — a hand-authored surprise combo (may be cursed)
 *   4. emergent             — Workers AI invents one in Milim Nova's voice
 *
 * EMERGENT→CANONICAL PROMOTION: after the LLM names a fusion, we normalise the
 * name to a slug and look it up in `data/craft/named-index.json`. If it matches a
 * real Gaia Skill Tree skill we PROMOTE the result to `canonical`, keep the model's
 * description, and attach the derived deep-link — the aha + funnel payoff.
 *
 * Results are cached forever in Cloudflare KV keyed by an order-independent
 * `pairKey(a, b)`, so the first discoverer's answer becomes canon for that pair.
 *
 * ── Design guarantees ──────────────────────────────────────────────────────
 *  • NEVER 500s on LLM problems. A malformed / refused / missing model response
 *    is coerced into a safe fallback with `passesSkillCheck:false` so the UI
 *    just shows the "experimental" badge.
 *  • FULLY PLAYABLE ON LOCALHOST with zero Cloudflare credentials. `next dev`
 *    has no bindings, so every binding access is guarded: KV degrades to an
 *    in-memory Map shim and AI degrades to a deterministic local mock fusion.
 * Bindings (wrangler.jsonc): AI (Workers AI) · CRAFT_KV (KV)
 */

import { NextResponse } from 'next/server';
import { recordFusionEvent } from '@/lib/craft/telemetry';
import { pairKey } from '@/lib/craft/types';
import type { FusionResult, FusionTier } from '@/lib/craft/types';
import { findRecipe, skillTreeUrl } from '@/lib/craft/recipes';
import { findStarterRecipe } from '@/lib/craft/starter-recipes';
import {
  getAllNamedSkillSlugs,
  lookupNamedSkill,
  namedContributor,
} from '@/lib/craft/named-index';
import { findTopCandidateSlugs } from '@/lib/craft/similarity-shim';
import {
  buildFusionPrompt,
  FUSION_MODEL,
  FUSION_TEMPERATURE,
  type RawFusionJson,
} from '@/lib/craft/prompt';

// This route uses Cloudflare bindings; the OpenNext adapter runs it on the edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Loosely-typed binding surface
// ---------------------------------------------------------------------------
//
// We deliberately describe the bindings we touch with narrow local interfaces
// rather than leaning on the generated CloudflareEnv, because on localhost the
// whole `env` object may be undefined or partially populated. Everything here
// is treated as "might not exist".

interface KvLike {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    opts?: { expirationTtl?: number }
  ): Promise<void>;
}

interface AiLike {
  run(
    model: string,
    input: { messages: unknown; temperature?: number }
  ): Promise<unknown>;
}

interface CraftBindings {
  CRAFT_KV?: KvLike;
  AI?: AiLike;
}

// ---------------------------------------------------------------------------
// Local dev KV shim — module-scoped, DISK-BACKED so it survives across requests
// AND across `next dev` hot-reloads/restarts.
// ---------------------------------------------------------------------------
//
// This shim is ONLY ever used when the real CRAFT_KV binding is absent (i.e.
// local `next dev` with no Cloudflare auth). It lazily persists to a gitignored
// JSON file so that any pair we compute during a dev/testing session is cached
// forever locally — we never recompute (and, once real Workers AI is wired,
// never re-pay) a cache miss we already spent. All fs access is dynamically
// imported and wrapped in try/catch so it can NEVER break the Cloudflare Worker
// build/runtime (where this shim is not used anyway).

const DEV_CACHE_FILE = '.craft-dev-cache.json';
const memoryKv = new Map<string, string>();
let diskLoaded = false;

async function loadDiskCacheOnce(): Promise<void> {
  if (diskLoaded) return;
  diskLoaded = true;
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const file = path.join(process.cwd(), DEV_CACHE_FILE);
    const raw = await fs.readFile(file, 'utf8');
    const obj = JSON.parse(raw) as Record<string, string>;
    for (const [k, v] of Object.entries(obj)) memoryKv.set(k, v);
  } catch {
    // No file yet / no fs / bad JSON — start empty. Non-fatal.
  }
}

async function saveDiskCache(): Promise<void> {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const file = path.join(process.cwd(), DEV_CACHE_FILE);
    const obj = Object.fromEntries(memoryKv.entries());
    await fs.writeFile(file, JSON.stringify(obj, null, 0), 'utf8');
  } catch {
    // fs unavailable (Worker runtime) or write failed — non-fatal.
  }
}

const memoryKvShim: KvLike = {
  async get(key) {
    await loadDiskCacheOnce();
    return memoryKv.has(key) ? (memoryKv.get(key) as string) : null;
  },
  async put(key, value) {
    await loadDiskCacheOnce();
    memoryKv.set(key, value);
    void saveDiskCache();
  },
};

// ---------------------------------------------------------------------------
// Binding resolution (Cloudflare-first, degrade gracefully on localhost)
// ---------------------------------------------------------------------------

/**
 * Resolves the Cloudflare bindings, tolerating the local-dev case where
 * `getCloudflareContext` is unavailable, throws, or returns a bare env.
 *
 * Returns whatever subset of bindings actually exists; callers null-check.
 */
async function resolveBindings(): Promise<CraftBindings> {
  try {
    // Dynamic import so a plain `next dev` without the adapter never hard-fails
    // at module-load time if the package resolution is odd.
    const mod = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext();
    const env = (ctx?.env ?? {}) as Partial<CraftBindings>;
    return {
      CRAFT_KV: env.CRAFT_KV,
      AI: env.AI,
    };
  } catch {
    // No Cloudflare context (localhost `next dev`, tests, etc.) — return empty.
    return {};
  }
}

/** Returns the real KV binding when present, else the in-memory dev shim. */
function kvOrShim(bindings: CraftBindings): KvLike {
  return bindings.CRAFT_KV ?? memoryKvShim;
}

// ---------------------------------------------------------------------------
// Easter-egg lookup — imported DEFENSIVELY.
// ---------------------------------------------------------------------------
//
// The easter-egg module is authored by a parallel worker and may not export
// `findEasterEgg` yet (or at all) at build time. We dynamic-import it and guard
// the call so this route compiles and runs regardless of that module's state.

interface EggLike {
  name: string;
  emoji: string;
  blurb: string;
  cursed?: boolean;
  curseId?: string;
}

async function lookupEasterEgg(a: string, b: string): Promise<EggLike | undefined> {
  try {
    const mod: Record<string, unknown> = await import('@/lib/craft/easter-eggs');
    const fn = mod.findEasterEgg;
    if (typeof fn !== 'function') return undefined;
    const egg = (fn as (x: string, y: string) => EggLike | undefined)(a, b);
    return egg ?? undefined;
  } catch {
    // Module not ready / no such export — treat as "no egg".
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Result construction helpers
// ---------------------------------------------------------------------------

/** Ensures a display name is slash-prefixed, lowercase, and kebab-ish. */
function normaliseName(raw: string): string {
  const cleaned = String(raw)
    .trim()
    .toLowerCase()
    .replace(/^\/+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `/${cleaned || 'mystery-fusion'}`;
}

/**
 * Strips any leading `experimental-` prefix from a slug so fallback names
 * never compound the prefix when fusing skills that were themselves fallbacks.
 * e.g. "experimental-crawler-x" → "crawler-x"
 */
function deExperimentalise(slug: string): string {
  return slug.replace(/^experimental-/, '');
}

/** Picks the first grapheme-ish emoji, defaulting to a sparkle. */
function safeEmoji(raw: unknown): string {
  if (typeof raw === 'string' && raw.trim().length > 0) {
    // Take the first "character" (covers most single emoji + variation selectors).
    return Array.from(raw.trim())[0] ?? '✨';
  }
  return '✨';
}

/** Clamps a blurb to a sane length and strips control noise. */
function safeBlurb(raw: unknown, fallback: string): string {
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().slice(0, 160);
  }
  return fallback;
}

/**
 * Clamps a factual description to a sane length. Returns `undefined` when the
 * input is empty so callers can decide whether to synthesise a fallback.
 */
function safeDescription(raw: unknown): string | undefined {
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().slice(0, 220);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Emergent → canonical promotion (the aha + funnel payoff)
// ---------------------------------------------------------------------------
//
// `named-index.json` is the ground-truth map of every REAL Gaia Skill Tree slug
// to its registry record (contributor + real title/description). Access goes
// through lib/craft/named-index.ts (`lookupNamedSkill` / `namedContributor`) so
// this route never touches the JSON's short-key shape. When a fusion name
// normalises to a slug that lives in that index, the result is a genuine named
// skill — so we PROMOTE it to canonical, attach the derived deep-link, and swap
// in the real registry title + description. Storing only slug+contributor
// (never full URLs) keeps derivation in one place (`skillTreeUrl`).

/** Normalises a slash/display name to a bare lowercase slug for index lookup. */
function nameToSlug(name: string): string {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/^\/+/, '');
}

/**
 * If the given result name maps to a real named skill in the index, returns the
 * `{ slug, contributor }` so the caller can promote to canonical + deep-link.
 * Returns `undefined` for names with no real match (stays emergent).
 */
function resolvePromotion(
  name: string
): { slug: string; contributor: string } | undefined {
  const slug = nameToSlug(name);
  const contributor = namedContributor(slug);
  return contributor ? { slug, contributor } : undefined;
}

// ---------------------------------------------------------------------------
// Compact KV storage (anti-bloat): store the minimal fields only.
// ---------------------------------------------------------------------------
//
// We never persist derivable data. `skillTreeUrl` is reconstructed on read from
// the stored slug+contributor (present only when canonical). `experimental` is
// derived from `passesSkillCheck`, and `isFirstDiscovery` is forced false on
// read (a cache hit is by definition a re-craft), so none of the three are
// stored either.

interface StoredFusion {
  name: string;
  emoji: string;
  blurb: string;
  description?: string;
  /** Real registry title — ground truth, present only on canonical hits. */
  skillTitle?: string;
  tier: FusionTier;
  passesSkillCheck: boolean;
  /** Only present for canonical results that map to a real named skill. */
  slug?: string;
  contributor?: string;
  source?: 'anthropic' | 'mattpocock' | 'addyosmani' | 'superpowers' | 'skillkit' | 'glincker' | 'registry';
  sourceUrl?: string;
  /** Curse metadata (rare easter-egg outcome). */
  cursed?: boolean;
  curseId?: string;
}

/** Projects a resolved result + optional link ref into the compact stored shape. */
function toStored(
  result: FusionResult,
  ref: { slug: string; contributor: string } | undefined
): StoredFusion {
  const stored: StoredFusion = {
    name: result.name,
    emoji: result.emoji,
    blurb: result.blurb,
    tier: result.tier,
    passesSkillCheck: result.passesSkillCheck,
  };
  if (result.description) stored.description = result.description;
  if (result.skillTitle) stored.skillTitle = result.skillTitle;
  if (result.source) stored.source = result.source;
  if (result.sourceUrl) stored.sourceUrl = result.sourceUrl;
  if (ref) {
    stored.slug = ref.slug;
    stored.contributor = ref.contributor;
  } else if (result.contributor) {
    // Preserve the Builders-collection handle even when we have no slug/link
    // (e.g. a canonical starter bridge with a contributor but no deep-link).
    stored.contributor = result.contributor;
  }
  if (result.cursed) {
    stored.cursed = true;
    if (result.curseId) stored.curseId = result.curseId;
  }
  return stored;
}

/** Rehydrates a compact stored value into a full FusionResult (derives the URL). */
function rehydrate(stored: StoredFusion): FusionResult {
  return {
    name: stored.name,
    emoji: stored.emoji,
    blurb: stored.blurb,
    description: stored.description,
    skillTitle: stored.skillTitle,
    tier: stored.tier,
    isFirstDiscovery: false,
    passesSkillCheck: stored.passesSkillCheck,
    contributor: stored.contributor,
    source: stored.source,
    sourceUrl: stored.sourceUrl,
    skillTreeUrl: skillTreeUrl(stored.contributor, stored.slug),
    experimental: !stored.passesSkillCheck,
    cursed: stored.cursed || undefined,
    curseId: stored.cursed ? stored.curseId : undefined,
  };
}

/**
 * Deterministic local mock fusion for when Workers AI is unavailable
 * (localhost / no CF auth). Combines the two slugs into a plausible
 * `/kebab-name` with a canned-but-fun Milim blurb. Always passes the skill
 * check so the game plays smoothly offline.
 */
function localMockFusion(a: string, b: string): RawFusionJson {
  const clean = (s: string) => s.trim().replace(/^\/+/, '').toLowerCase();
  const [x, y] = [clean(a), clean(b)];
  const head = (x.split('-')[0] || x || 'skill').slice(0, 12);
  const tail = (y.split('-').slice(-1)[0] || y || 'craft').slice(0, 14);
  const name = normaliseName(`${head}-${tail}`);
  const emojis = ['⚡', '🧪', '🛠️', '🚀', '🧠', '🔮', '🎛️', '✨'];
  // Deterministic emoji pick from the pair key so the same pair always matches.
  const seed = pairKey(a, b);
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum = (sum + seed.charCodeAt(i)) % emojis.length;
  return {
    name,
    emoji: emojis[sum],
    blurb: `Fused /${x} with /${y} — a shiny offline prototype, boss.`,
    description: `Combines the ${x} and ${y} capabilities into a single composite skill an agent can invoke.`,
    passesSkillCheck: true,
  };
}

/**
 * Defensively coerces an arbitrary model response into `RawFusionJson`.
 * On ANY problem (non-JSON, missing fields, wrong types) returns a safe
 * fallback flagged `passesSkillCheck:false` so the UI shows the experimental
 * badge instead of the route throwing.
 */
function parseModelResponse(
  response: unknown,
  a: string,
  b: string
): RawFusionJson {
  const fallback = (): RawFusionJson => {
    const ca = deExperimentalise(a);
    const cb = deExperimentalise(b);
    return {
      name: normaliseName(`${ca}-${cb}`),
      emoji: '🧪',
      blurb: 'The fusion fizzled, boss — but something sparked.',
      description: `A fusion of ${ca} and ${cb}; capability not yet verified against the registry.`,
      passesSkillCheck: false,
    };
  };

  try {
    // Workers AI chat responses commonly surface text under `.response`.
    let text: string | undefined;
    if (typeof response === 'string') {
      text = response;
    } else if (response && typeof response === 'object') {
      const obj = response as Record<string, unknown>;
      if (typeof obj.response === 'string') text = obj.response;
      else if (typeof obj.result === 'string') text = obj.result;
      else if (
        obj.result &&
        typeof obj.result === 'object' &&
        typeof (obj.result as Record<string, unknown>).response === 'string'
      ) {
        text = (obj.result as Record<string, unknown>).response as string;
      }
    }
    if (!text) return fallback();

    // The model is told to return bare JSON, but tolerate stray fences/prose:
    // grab the first {...} block.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallback();
    const parsed = JSON.parse(match[0]) as Partial<RawFusionJson>;

    if (typeof parsed.name !== 'string' || parsed.name.trim() === '') {
      return fallback();
    }
    return {
      name: normaliseName(parsed.name),
      emoji: safeEmoji(parsed.emoji),
      blurb: safeBlurb(parsed.blurb, 'A fresh fusion, hot off the forge, boss.'),
      description: safeDescription(parsed.description),
      // Default to false (experimental) unless the model explicitly asserts true.
      passesSkillCheck: parsed.passesSkillCheck === true,
    };
  } catch {
    return fallback();
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  // ── a. Parse & validate input ────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const a = (body as { a?: unknown })?.a;
  const b = (body as { b?: unknown })?.b;
  if (
    typeof a !== 'string' ||
    typeof b !== 'string' ||
    a.trim() === '' ||
    b.trim() === ''
  ) {
    return NextResponse.json(
      { error: 'Both "a" and "b" must be non-empty strings.' },
      { status: 400 }
    );
  }

  // Normalise slugs to a canonical form BEFORE any keying/lookup. `pairKey`
  // only lowercases+trims — it does NOT strip the slash-command prefix — so
  // "/api-call" and "api-call" would otherwise key (and cache) differently.
  // Stripping here makes fuse("/A","B") and fuse("B","a") fully order- and
  // prefix-independent across cache hits, recipes, and eggs.
  const slug = (s: string) => s.trim().replace(/^\/+/, '').toLowerCase();
  const na = slug(a);
  const nb = slug(b);

  const bindings = await resolveBindings();
  const kv = kvOrShim(bindings);
  const key = pairKey(na, nb);

  // Cloudflare execution context — used to register fire-and-forget promises
  // with waitUntil() so they aren't killed when the response is sent.
  // Absent on localhost (next dev); telemetry degrades gracefully without it.
  let cfCtx: { waitUntil(p: Promise<unknown>): void } | undefined;
  try {
    const mod = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext();
    cfCtx = ctx?.ctx ?? undefined;
  } catch {
    // No CF context on localhost — fine.
  }

  // ── b. Cache lookup ──────────────────────────────────────────────────────
  try {
    const cached = await kv.get(key);
    if (cached) {
      // Values are stored COMPACT (StoredFusion): minimal fields plus
      // slug/contributor when canonical. Rehydrate to a full FusionResult and
      // DERIVE skillTreeUrl on read — never store the derivable URL string.
      const result = rehydrate(JSON.parse(cached) as StoredFusion);
      // A returning player: this is no longer a first discovery.
      result.isFirstDiscovery = false;
      recordFusionEvent(result.tier, true, key, cfCtx);
      return NextResponse.json(result);
    }
  } catch {
    // Cache read failure is non-fatal — fall through to compute a fresh result.
  }

  // ── c. Resolve tier: canonical(recipe) → canonical(starter) → egg → emergent ─
  let result: FusionResult;
  // The verified {slug, contributor} behind a canonical link, when one exists.
  // Stored compactly so `skillTreeUrl` can be DERIVED on read (never stored).
  let canonicalRef: { slug: string; contributor: string } | undefined;

  const recipe = findRecipe(na, nb);
  if (recipe) {
    if (recipe.contributor && recipe.slug) {
      canonicalRef = { slug: recipe.slug, contributor: recipe.contributor };
    }
    // GROUND TRUTH: when the mapped slug is a real named skill, prefer the
    // registry's real title + description over the recipe blurb.
    const named = recipe.slug ? lookupNamedSkill(recipe.slug) : undefined;
    result = {
      name: recipe.result.startsWith('/') ? recipe.result : `/${recipe.result}`,
      emoji: recipe.emoji || '✨',
      blurb: recipe.blurb,
      // Registry recipes carry no separate description — use the real registry
      // description when the slug is a named skill, else fall back to the blurb
      // as the closest factual "what it does" line we have.
      description: named?.description || recipe.blurb,
      skillTitle: named?.title,
      tier: 'canonical',
      isFirstDiscovery: true,
      passesSkillCheck: true,
      contributor: recipe.contributor,
      skillTreeUrl: skillTreeUrl(recipe.contributor, recipe.slug),
      experimental: false,
    };
  } else if (
    // Starter tech tree: the seed primitives (/prompt /code /web /data) and their
    // results are authored slash-prefixed, so feed slash-form names to match the
    // pairKey the tree is keyed by. Inserted BEFORE easter eggs so curated seed
    // combos deterministically land on recognisable skills.
    findStarterRecipe(`/${na}`, `/${nb}`)
  ) {
    const starter = findStarterRecipe(`/${na}`, `/${nb}`)!;
    if (starter.contributor && starter.slug) {
      canonicalRef = { slug: starter.slug, contributor: starter.contributor };
    }
    const link = skillTreeUrl(starter.contributor, starter.slug);
    // GROUND TRUTH: when a starter maps to a real named slug, prefer the
    // registry's real title + description over the starter's authored copy.
    const named = starter.slug ? lookupNamedSkill(starter.slug) : undefined;
    result = {
      name: starter.name.startsWith('/') ? starter.name : `/${starter.name}`,
      emoji: starter.emoji || '✨',
      blurb: starter.blurb,
      // Real registry description when the slug is a named skill; else the
      // starter's own factual capability description.
      description: named?.description || starter.description,
      skillTitle: named?.title,
      // These are curated REAL skills. Canonical whether or not they deep-link:
      // some tech-tree bridges are chainable-but-unlinked; that's still canonical.
      tier: 'canonical',
      isFirstDiscovery: true,
      passesSkillCheck: true,
      contributor: starter.contributor,
      skillTreeUrl: link,
      experimental: false,
    };
  } else {
    const egg = await lookupEasterEgg(na, nb);
    if (egg) {
      result = {
        name: egg.name.startsWith('/') ? egg.name : `/${egg.name}`,
        emoji: egg.emoji || '✨',
        blurb: egg.blurb,
        // Synthesise a short factual line from the egg's blurb (eggs carry no
        // separate description). Left undefined if the blurb is empty.
        description: egg.blurb?.trim() ? egg.blurb.trim().slice(0, 220) : undefined,
        tier: 'easteregg',
        isFirstDiscovery: true,
        passesSkillCheck: true,
        cursed: egg.cursed === true ? true : undefined,
        curseId: egg.cursed === true ? egg.curseId : undefined,
        experimental: false,
      };
    } else {
      // ── Emergent: Workers AI, or deterministic local mock when unavailable ──
      let raw: RawFusionJson;
      if (bindings.AI) {
        try {
          // Fast candidate targeting via top similarity candidates (reduces context size & TTFT latency)
          const candidateSlugs = findTopCandidateSlugs(na, nb, 5);
          const messages = buildFusionPrompt(na, nb, candidateSlugs);
          const response = await bindings.AI.run(FUSION_MODEL, {
            messages,
            temperature: FUSION_TEMPERATURE,
          });
          raw = parseModelResponse(response, na, nb);
        } catch {
          // Any AI failure → safe experimental fallback (never a 500).
          raw = {
            name: normaliseName(`${deExperimentalise(na)}-${deExperimentalise(nb)}`),
            emoji: '🧪',
            blurb: 'The forge sputtered, boss — but something sparked.',
            description: `A fusion of ${deExperimentalise(na)} and ${deExperimentalise(nb)}; capability not yet verified.`,
            passesSkillCheck: false,
          };
        }
      } else {
        // No AI binding (localhost / no CF auth) → deterministic playable mock.
        raw = localMockFusion(na, nb);
      }

      // EMERGENT → CANONICAL PROMOTION: if the model's name matches a real named
      // skill, promote to canonical + attach the derived deep-link, keeping the
      // model's own description. This is the aha + funnel payoff for organic combos.
      const promotion = resolvePromotion(raw.name);
      const description =
        raw.description ??
        `A fresh fusion of ${na} and ${nb} an agent can invoke as a single skill.`;

      if (promotion) {
        canonicalRef = { slug: promotion.slug, contributor: promotion.contributor };
        // GROUND TRUTH: swap in the real registry title + description for the
        // promoted slug so the promoted skill reads as unmistakably real.
        const named = lookupNamedSkill(promotion.slug);
        result = {
          name: raw.name,
          emoji: raw.emoji,
          blurb: raw.blurb,
          description: named?.description || description,
          skillTitle: named?.title,
          tier: 'canonical',
          isFirstDiscovery: true,
          passesSkillCheck: true,
          contributor: promotion.contributor,
          source: named?.source,
          sourceUrl: named?.sourceUrl,
          skillTreeUrl: skillTreeUrl(promotion.contributor, promotion.slug),
          experimental: false,
        };
      } else {
        result = {
          name: raw.name,
          emoji: raw.emoji,
          blurb: raw.blurb,
          description,
          tier: 'emergent',
          isFirstDiscovery: true,
          passesSkillCheck: raw.passesSkillCheck,
          experimental: !raw.passesSkillCheck,
        };
      }
    }
  }

  // ── d. Persist to KV (fire-and-forget) ───────────────────────────────────
  // Store the COMPACT shape only — minimal fields plus slug/contributor when
  // canonical. skillTreeUrl / experimental / isFirstDiscovery are all derivable
  // on read, so we never persist them (anti-bloat).
  try {
    const toStore = toStored(result, canonicalRef);
    // Not awaited — a slow/failed write must not delay the player's result.
    void kv.put(key, JSON.stringify(toStore)).catch(() => {});
  } catch {
    // put() itself threw synchronously (shouldn't happen) — ignore.
  }

  // ── e. Respond ────────────────────────────────────────────────────────────
  recordFusionEvent(result.tier, false, key, cfCtx);
  return NextResponse.json(result);
}
