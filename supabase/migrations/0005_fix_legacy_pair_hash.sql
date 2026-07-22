-- Migration: 0005_fix_legacy_pair_hash.sql
-- Relaxes legacy pair_hash NOT NULL constraint if present.

do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_name = 'craft_fusion_events' and column_name = 'pair_hash'
  ) then
    alter table public.craft_fusion_events alter column pair_hash drop not null;
  end if;
end $$;
