// Fusion telemetry — fire-and-forget write to craft_fusion_events.
//
// Extracted from the fuse route so it can be tested independently without
// spinning up the full Next.js route handler.
//
// SERVER ONLY — never import this in browser/client code.
// Requires SUPABASE_URL + SUPABASE_SECRET_KEY in env (Cloudflare Worker secrets).
// nodejs_compat must be enabled in wrangler.jsonc for process.env to be visible.

import { getSupabaseServiceClient } from '@/lib/supabase/server';

export interface CfCtxLike {
  waitUntil(p: Promise<unknown>): void;
}

/**
 * Records a fusion event to Supabase.
 * Always returns void immediately — a Supabase failure must never affect
 * the caller's response. When a Cloudflare execution context is provided,
 * the write promise is registered with waitUntil() so it isn't killed the
 * moment the Worker sends its response.
 */
export function recordFusionEvent(
  tier: string,
  cacheHit: boolean,
  pairKey: string,
  cfCtx?: CfCtxLike
): void {
  const write = (async () => {
    try {
      const sb = getSupabaseServiceClient();
      if (!sb) return;
      await sb.from('craft_fusion_events').insert({
        tier,
        cache_hit: cacheHit,
        pair_key: pairKey,
      });
    } catch {
      // Supabase unavailable or misconfigured — silently ignored.
    }
  })();
  if (cfCtx) {
    cfCtx.waitUntil(write);
  }
}
