# Supabase submissions layer

The Gaia Research site uses one Supabase table, `submissions`, as a generic
backend for every lab/benchmark/skill-evidence submission. **Context Diet — Lab
001** is the first consumer (its opt-in "beat 41.6%" leaderboard). Future labs
add a new `kind` and payload type in the app with **no schema migration**.

## One-time setup

1. Create a Supabase project (free tier is fine).
2. In the SQL editor, run [`supabase/migrations/0001_submissions.sql`](../supabase/migrations/0001_submissions.sql).
3. Copy the project URL and the **publishable (anon)** key from Project Settings → API.
4. Set these as environment variables where the site is built/deployed:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<key>
   ```

   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is the preferred name (Supabase's newer
   `sb_publishable_…` key); the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` also works.

   - **Local (Next dev):** copy `.env.local.example` → `.env.local`.
   - **Local (Wrangler/OpenNext preview):** copy `.dev.vars.example` → `.dev.vars`
     — Wrangler does **not** read `.env.local`.
   - **Cloudflare deploy:** set them as build-time env / repo secrets and pass
     them into `wrangler deploy`. Because they are `NEXT_PUBLIC_`, they inline
     into the client bundle at build time and the browser talks to Supabase
     directly — no server runtime or adapter is required.

If the vars are absent, the analyzer still works fully (it is client-side and
needs no backend); only the leaderboard shows an "offline" state.

## Data model

| column          | type          | notes                                            |
| --------------- | ------------- | ------------------------------------------------ |
| `id`            | uuid          | `gen_random_uuid()`                              |
| `kind`          | text          | `context-diet` \| `benchmark-result` \| `skill-evidence` |
| `created_at`    | timestamptz   | `now()`                                          |
| `reduction_pct` | numeric(5,2)  | promoted from payload for leaderboard sorting    |
| `handle`        | text ≤32      | optional, opt-in display name                    |
| `payload`       | jsonb         | full typed payload (see `lib/submissions/types.ts`) |

## Security model

- The **anon key is publishable** — it is meant to ship to browsers. Security
  comes from **Row Level Security**, not from hiding the key.
- Policies allow anon `INSERT` + `SELECT` only. `UPDATE`/`DELETE` have no policy
  and are denied by default. No service-role key is ever used client-side.
- **No PII / no prompt text.** Context Diet analysis runs entirely in the
  browser; only anonymized metrics (token counts, reduction %, optional handle)
  are ever submitted, and only when the user opts in. `validateContextDiet`
  builds the payload from a field whitelist, so raw text cannot be attached.

## Optional hardening (future)

- Add a Postgres `check`/trigger validating `payload` shape server-side per kind.
- Rate-limit inserts (Supabase edge function or a per-IP counter) if abuse appears.
