/**
 * app/labs/infinite-skill-craft/api/stats/route.ts
 *
 * GET /labs/infinite-skill-craft/api/stats
 *
 * Returns an approximate global fusion count: { count: number }
 *
 * Primary source: Supabase craft_stats table (`total_fusions`).
 * Fallback source: Cloudflare KV (CRAFT_KV) under key "stats:total-fusions".
 *
 * Design guarantees (matches the fuse route pattern):
 *  • NEVER 500s — every error path returns a valid { count: N } JSON response.
 *  • FULLY PLAYABLE ON LOCALHOST — missing bindings/credentials fall back gracefully.
 *  • NO PII — count only, no pair keys, no user data.
 *
 * Binding required in wrangler.jsonc: CRAFT_KV (same namespace as fuse route).
 * Env required for Supabase: SUPABASE_URL + SUPABASE_SECRET_KEY.
 */

import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

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

// ---------------------------------------------------------------------------
// Supabase count lookup
// ---------------------------------------------------------------------------

async function getSupabaseFusionCount(): Promise<number | null> {
  try {
    const sb = getSupabaseServiceClient();
    if (!sb) return null;

    const { data, error } = await sb
      .from("craft_stats")
      .select("value")
      .eq("key", "total_fusions")
      .maybeSingle();

    if (error || !data || typeof data.value !== "number") {
      return null;
    }

    return Number(data.value);
  } catch {
    return null;
  }
}

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
    // 1. Try Supabase live telemetry count first
    const sbCount = await getSupabaseFusionCount();
    if (sbCount !== null) {
      return NextResponse.json({ count: sbCount });
    }

    // 2. Fall back to Cloudflare KV counter
    const bindings = await resolveBindings();
    if (bindings.CRAFT_KV) {
      const raw = await bindings.CRAFT_KV.get(STATS_KEY);
      if (raw !== null) {
        const count = parseInt(raw, 10);
        if (!isNaN(count)) {
          return NextResponse.json({ count });
        }
      }
    }

    // 3. Fallback when neither Supabase nor KV are available
    return NextResponse.json({ count: 0 });
  } catch {
    // Any unexpected error — return 0 count rather than 500.
    return NextResponse.json({ count: 0 });
  }
}
