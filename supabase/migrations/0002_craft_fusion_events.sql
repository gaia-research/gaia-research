-- Fusion telemetry for Infinite Skill Craft.
--
-- Records only: timestamp, result tier, cache-hit flag, and the order-independent
-- pair key (sorted slug concatenation, e.g. "api-call+tool-use"). No player
-- identity, no fusion text.
--
-- Access model: RLS is enabled with NO policies, so the anon (publishable) key
-- has zero access. Only the service-role key held by the Cloudflare Worker can
-- write here. Writes are best-effort fire-and-forget — a Supabase outage never
-- affects a fusion response.
--
-- Retention: this table grows with every fusion. Recommended approach is a
-- scheduled pg_cron job to delete rows older than 90 days:
--
--   select cron.schedule(
--     'purge-craft-fusion-events',
--     '0 3 * * *',
--     $$delete from public.craft_fusion_events where created_at < now() - interval '90 days'$$
--   );
--
-- Enable pg_cron in the Supabase dashboard (Database → Extensions) before use.
--
-- Apply via: supabase db push

create table if not exists public.craft_fusion_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  tier        text not null check (tier in ('canonical', 'easteregg', 'emergent')),
  cache_hit   boolean not null,
  pair_key    text not null check (char_length(pair_key) <= 128)
);

create index if not exists craft_fusion_events_created_idx
  on public.craft_fusion_events (created_at desc);

create index if not exists craft_fusion_events_tier_idx
  on public.craft_fusion_events (tier, created_at desc);

-- RLS on, zero policies = anon role has no access whatsoever.
-- Only the service-role key (Cloudflare Worker secret) can insert.
alter table public.craft_fusion_events enable row level security;
