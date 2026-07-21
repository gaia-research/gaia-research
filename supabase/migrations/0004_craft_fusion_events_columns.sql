-- Migration: 0004_craft_fusion_events_columns.sql
-- Guard migration: ensures pair_key, cache_hit, and tier columns exist on craft_fusion_events,
-- and drops legacy NOT NULL constraint on pair_hash.

alter table public.craft_fusion_events add column if not exists tier text check (tier in ('canonical', 'easteregg', 'emergent'));
alter table public.craft_fusion_events add column if not exists cache_hit boolean not null default false;
alter table public.craft_fusion_events add column if not exists pair_key text check (char_length(pair_key) <= 128);

-- Handle legacy table schema from early prototypes
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_name = 'craft_fusion_events' and column_name = 'pair_hash'
  ) then
    alter table public.craft_fusion_events alter column pair_hash drop not null;
  end if;
end $$;
