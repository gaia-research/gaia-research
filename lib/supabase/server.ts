// Server-only Supabase admin client using @supabase/server/core.
//
// NEVER import this in browser code or any file that gets bundled client-side.
// createAdminClient bypasses RLS — it reads SUPABASE_SECRET_KEY from env, which
// is a Cloudflare Worker secret and must never reach the browser.
//
// Returns null when the secret key is missing so callers degrade gracefully.

import { createAdminClient } from "@supabase/server/core";
import type { SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseServiceClient(): SupabaseClient | null {
  try {
    return createAdminClient() as SupabaseClient;
  } catch {
    // EnvError — SUPABASE_SECRET_KEY or SUPABASE_URL not set.
    return null;
  }
}
