-- Gaia Research — generic submissions table.
--
-- One table serves every lab/benchmark/skill-evidence submission. New kinds add
-- a `kind` string and a payload shape in the app; no schema migration needed.
-- A few columns are promoted out of `payload` for indexing and leaderboards.
--
-- Apply manually in the Supabase SQL editor (deploy is manual). See
-- docs/supabase-submissions.md for setup + hardening notes.

create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (char_length(kind) <= 40),
  created_at    timestamptz not null default now(),
  reduction_pct numeric(5,2),                                   -- promoted for leaderboard sort
  handle        text check (handle is null or char_length(handle) <= 32),
  payload       jsonb not null
);

create index if not exists submissions_kind_reduction_idx
  on public.submissions (kind, reduction_pct desc);
create index if not exists submissions_kind_created_idx
  on public.submissions (kind, created_at desc);

-- Row Level Security is the real access control. The publishable anon key ships
-- to the browser; these policies scope what it can do.
alter table public.submissions enable row level security;

-- Anonymous visitors may INSERT (opt-in leaderboard writes)...
drop policy if exists "anon insert" on public.submissions;
create policy "anon insert" on public.submissions
  for insert to anon with check (true);

-- ...and SELECT (read the leaderboard).
drop policy if exists "anon select" on public.submissions;
create policy "anon select" on public.submissions
  for select to anon using (true);

-- No UPDATE or DELETE policy exists, so both are denied by default under RLS.
