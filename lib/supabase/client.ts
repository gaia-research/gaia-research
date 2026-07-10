// Supabase browser client for the Gaia Research site.
//
// Anonymous, publishable-key access only — the anon key is safe to ship to the
// browser; Row Level Security (see supabase/migrations/0001_submissions.sql) is
// what actually protects the table. No service-role key is ever used here.
//
// Graceful degradation: when the env vars are absent (e.g. local dev without a
// .env.local, or a deploy without the vars set), getSupabase() returns null and
// callers fall back to an "offline" state instead of throwing. The analyzer
// itself never needs Supabase — only the opt-in leaderboard does.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase's newer publishable key (sb_publishable_…) is the preferred name;
// fall back to the legacy anon key so either env var works.
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (cached) return cached;
  cached = createClient(url as string, publishableKey as string, {
    auth: { persistSession: false },
  });
  return cached;
}
