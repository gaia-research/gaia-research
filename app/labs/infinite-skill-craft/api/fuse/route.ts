/**
 * app/labs/infinite-skill-craft/api/fuse/route.ts
 *
 * POST /labs/infinite-skill-craft/api/fuse
 *
 * The fusion engine for Infinite Skill Craft. Given two skill slugs it returns
 * a single `FusionResult`, resolving through three tiers in priority order:
 *
 *   1. canonical  — a real Gaia Skill Tree recipe (deep-links to the skill page)
 *   2. easteregg  — a hand-authored surprise combo (may be cursed)
 *   3. emergent   — Workers AI invents one in Milim Nova's voice
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
 *  • NO PII. The one Analytics Engine row we write carries only the tier, a
 *    cache-hit flag, and a truncated hash of the pair key.
 *
 * Bindings (wrangler.jsonc):  AI (Workers AI) · CRAFT_KV (KV) · CRAFT_FUSIONS (Analytics Engine)
 */

import { NextResponse } from 'next/server';
import { pairKey } from '@/lib/craft/types';
import type { FusionResult, FusionTier } from '@/lib/craft/types';
import { findRecipe, skillTreeUrl } from '@/lib/craft/recipes';
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

interface AnalyticsLike {
  writeDataPoint(event: {
    blobs?: (string | ArrayBuffer)[];
    doubles?: number[];
    indexes?: (string | ArrayBuffer)[];
  }): void;
}

interface CraftBindings {
  CRAFT_KV?: KvLike;
  AI?: AiLike;
  CRAFT_FUSIONS?: AnalyticsLike;
}

// ---------------------------------------------------------------------------
// Local dev KV shim — module-scoped so it survives across requests in `next dev`
// ---------------------------------------------------------------------------

const memoryKv = new Map<string, string>();

const memoryKvShim: KvLike = {
  async get(key) {
    return memoryKv.has(key) ? (memoryKv.get(key) as string) : null;
  },
  async put(key, value) {
    memoryKv.set(key, value);
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
      CRAFT_FUSIONS: env.CRAFT_FUSIONS,
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
  const fallback = (): RawFusionJson => ({
    name: normaliseName(`experimental-${a}-${b}`),
    emoji: '🧪',
    blurb: 'The fusion fizzled, boss — labelling it experimental for now.',
    passesSkillCheck: false,
  });

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
      // Default to false (experimental) unless the model explicitly asserts true.
      passesSkillCheck: parsed.passesSkillCheck === true,
    };
  } catch {
    return fallback();
  }
}

// ---------------------------------------------------------------------------
// Analytics — one row, no PII, never throws
// ---------------------------------------------------------------------------

function recordFusion(
  bindings: CraftBindings,
  tier: FusionTier,
  cacheHit: boolean,
  key: string
): void {
  try {
    bindings.CRAFT_FUSIONS?.writeDataPoint({
      blobs: [tier],
      doubles: [cacheHit ? 1 : 0],
      indexes: [key.slice(0, 32)],
    });
  } catch {
    // A missing/misbehaving Analytics binding must never affect the response.
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

  // ── b. Cache lookup ──────────────────────────────────────────────────────
  try {
    const cached = await kv.get(key);
    if (cached) {
      const result = JSON.parse(cached) as FusionResult;
      // A returning player: this is no longer a first discovery.
      result.isFirstDiscovery = false;
      recordFusion(bindings, result.tier, true, key);
      return NextResponse.json(result);
    }
  } catch {
    // Cache read failure is non-fatal — fall through to compute a fresh result.
  }

  // ── c. Resolve tier: canonical → easteregg → emergent ────────────────────
  let result: FusionResult;

  const recipe = findRecipe(na, nb);
  if (recipe) {
    result = {
      name: recipe.result.startsWith('/') ? recipe.result : `/${recipe.result}`,
      emoji: recipe.emoji || '✨',
      blurb: recipe.blurb,
      tier: 'canonical',
      isFirstDiscovery: true,
      passesSkillCheck: true,
      skillTreeUrl: skillTreeUrl(recipe.contributor, recipe.slug),
      experimental: false,
    };
  } else {
    const egg = await lookupEasterEgg(na, nb);
    if (egg) {
      result = {
        name: egg.name.startsWith('/') ? egg.name : `/${egg.name}`,
        emoji: egg.emoji || '✨',
        blurb: egg.blurb,
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
          const messages = buildFusionPrompt(na, nb);
          const response = await bindings.AI.run(FUSION_MODEL, {
            messages,
            temperature: FUSION_TEMPERATURE,
          });
          raw = parseModelResponse(response, na, nb);
        } catch {
          // Any AI failure → safe experimental fallback (never a 500).
          raw = {
            name: normaliseName(`experimental-${na}-${nb}`),
            emoji: '🧪',
            blurb: 'The forge sputtered, boss — marking this one experimental.',
            passesSkillCheck: false,
          };
        }
      } else {
        // No AI binding (localhost / no CF auth) → deterministic playable mock.
        raw = localMockFusion(na, nb);
      }

      result = {
        name: raw.name,
        emoji: raw.emoji,
        blurb: raw.blurb,
        tier: 'emergent',
        isFirstDiscovery: true,
        passesSkillCheck: raw.passesSkillCheck,
        experimental: !raw.passesSkillCheck,
      };
    }
  }

  // ── d. Persist to KV (fire-and-forget) ───────────────────────────────────
  // Store with isFirstDiscovery:false so any *future* read reports a re-craft.
  try {
    const toStore: FusionResult = { ...result, isFirstDiscovery: false };
    // Not awaited — a slow/failed write must not delay the player's result.
    void kv.put(key, JSON.stringify(toStore)).catch(() => {});
  } catch {
    // put() itself threw synchronously (shouldn't happen) — ignore.
  }

  // ── e. Analytics: one row, no PII ─────────────────────────────────────────
  recordFusion(bindings, result.tier, false, key);

  // ── f. Respond ────────────────────────────────────────────────────────────
  return NextResponse.json(result);
}
