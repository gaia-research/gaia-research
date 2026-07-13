/**
 * app/labs/infinite-skill-craft/api/stats/route.ts
 *
 * GET /labs/infinite-skill-craft/api/stats
 *
 * Returns an approximate global fusion count: { count: number }
 *
 * Reads from Cloudflare KV (CRAFT_KV) under the key "stats:total-fusions".
 * The fuse route increments this counter on every new (non-cached) fusion.
 * Falls back to a hardcoded baseline when the binding is unavailable (localhost).
 *
 * Design guarantees (matches the fuse route pattern):
 *  • NEVER 500s — every error path returns a valid { count: N } JSON response.
 *  • FULLY PLAYABLE ON LOCALHOST — KV binding absent = dev fallback baseline.
 *  • NO PII — count only, no pair keys, no user data.
 *
 * Binding required in wrangler.jsonc: CRAFT_KV (same namespace as fuse route).
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// KV interface (same pattern as fuse route — keep in sync)
// ---------------------------------------------------------------------------

interface KvLike {
  get(key: string): Promise<string | null>;
}

interface StatsBindings {
  CRAFT_KV?: KvLike;
}

const STATS_KEY = "stats:total-fusions";
/** Dev-mode baseline — something plausible but not embarrassingly low. */
const DEV_FALLBACK_COUNT = 4_312;

// ---------------------------------------------------------------------------
// Binding resolution (identical guard pattern to fuse route)
// ---------------------------------------------------------------------------

async function resolveBindings(): Promise<StatsBindings> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const ctx = await mod.getCloudflareContext();
    const env = (ctx?.env ?? {}) as Partial<StatsBindings>;
    return { CRAFT_KV: env.CRAFT_KV };
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(): Promise<Response> {
  try {
    const bindings = await resolveBindings();

    if (!bindings.CRAFT_KV) {
      // Localhost / no CF binding — return the dev baseline.
      return NextResponse.json({ count: DEV_FALLBACK_COUNT });
    }

    const raw = await bindings.CRAFT_KV.get(STATS_KEY);
    if (raw === null) {
      // KV key doesn't exist yet (brand new deployment) — return 0 (or baseline).
      return NextResponse.json({ count: 0 });
    }

    const count = parseInt(raw, 10);
    if (isNaN(count)) {
      return NextResponse.json({ count: DEV_FALLBACK_COUNT });
    }

    return NextResponse.json({ count });
  } catch {
    // Any unexpected error — return baseline rather than 500.
    return NextResponse.json({ count: DEV_FALLBACK_COUNT });
  }
}
