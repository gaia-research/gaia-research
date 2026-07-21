-- Migration: 0003_craft_stats.sql
-- Live fusion stats counter table and trigger for Infinite Skill Craft.

create table if not exists public.craft_stats (
  key   text primary key,
  value bigint not null default 0
);

insert into craft_stats (key, value) values ('total_fusions', 0) on conflict do nothing;
insert into craft_stats (key, value) values ('cache_hits', 0) on conflict do nothing;

create or replace function increment_craft_stats()
returns trigger language plpgsql as $$
begin
  update craft_stats set value = value + 1 where key = 'total_fusions';
  if NEW.cache_hit then
    update craft_stats set value = value + 1 where key = 'cache_hits';
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_fusion_insert on public.craft_fusion_events;
create trigger on_fusion_insert
after insert on public.craft_fusion_events
for each row execute function increment_craft_stats();

-- Row Level Security
alter table public.craft_stats enable row level security;

-- Allow public read access to stats
drop policy if exists "anon select craft_stats" on public.craft_stats;
create policy "anon select craft_stats" on public.craft_stats
  for select to anon, authenticated using (true);
