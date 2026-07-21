"use client";

/**
 * components/labs/supabase/SupabaseConsole.tsx
 *
 * Developer hub & interactive schema sampler for Supabase integrations.
 * Features:
 *  - Real-time diagnostic ping query against Supabase endpoints
 *  - Interactive schema inspector for Live (craft_stats, craft_fusion_events, submissions)
 *    and Planned/Disabled schemas (user_profiles, benchmark_leaderboards, realtime_telemetry_broadcast)
 *  - Copyable migration SQL & @supabase/server code snippets
 *  - Feature status matrix adhering to DESIGN.md tokens & visual style
 */

import { useEffect, useState } from "react";
import type { SupabaseHealthResponse } from "@/app/labs/supabase/api/health/route";

interface SchemaSpec {
  id: string;
  title: string;
  status: "ACT" | "VRF" | "PRP" | "REV";
  statusText: string;
  category: "Telemetry" | "Analytics" | "Ledger" | "Auth (Planned)" | "Verification (Planned)" | "Realtime (Planned)";
  authMode: "secret" | "publishable" | "user" | "none";
  migrationFile: string;
  description: string;
  sql: string;
  tsSnippet: string;
  columns: Array<{ name: string; type: string; constraints: string; description: string }>;
  rlsPolicies: Array<{ name: string; role: string; action: string; definition: string }>;
  enabled: boolean;
}

const SCHEMAS: SchemaSpec[] = [
  {
    id: "craft_stats",
    title: "craft_stats",
    status: "VRF",
    statusText: "LIVE & VERIFIED",
    category: "Analytics",
    authMode: "secret",
    migrationFile: "supabase/migrations/0003_craft_stats.sql",
    description: "High-performance aggregated stats table updated atomically via trigger on fusion insert. Powers live fusion traffic counter.",
    enabled: true,
    sql: `-- Migration: 0003_craft_stats.sql
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

create trigger on_fusion_insert
after insert on public.craft_fusion_events
for each row execute function increment_craft_stats();

alter table public.craft_stats enable row level security;
create policy "anon select craft_stats" on public.craft_stats
  for select to anon, authenticated using (true);`,
    tsSnippet: `import { getSupabaseServiceClient } from "@/lib/supabase/server";

// Reads total_fusions counter atomically
const sb = getSupabaseServiceClient();
const { data, error } = await sb
  .from("craft_stats")
  .select("value")
  .eq("key", "total_fusions")
  .maybeSingle();

const totalFusions = data?.value ?? 0;`,
    columns: [
      { name: "key", type: "text", constraints: "PRIMARY KEY", description: "Unique counter identifier ('total_fusions', 'cache_hits')" },
      { name: "value", type: "bigint", constraints: "NOT NULL DEFAULT 0", description: "Atomic integer total" },
    ],
    rlsPolicies: [
      { name: "anon select craft_stats", role: "anon, authenticated", action: "SELECT", definition: "using (true)" },
    ],
  },
  {
    id: "craft_fusion_events",
    title: "craft_fusion_events",
    status: "VRF",
    statusText: "LIVE & VERIFIED",
    category: "Telemetry",
    authMode: "secret",
    migrationFile: "supabase/migrations/0002_craft_fusion_events.sql",
    description: "Privacy-preserving telemetry stream logging every Infinite Skill Craft fusion attempt (tier, cache-hit, pair_key).",
    enabled: true,
    sql: `-- Migration: 0002_craft_fusion_events.sql
create table if not exists public.craft_fusion_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  tier        text not null check (tier in ('canonical', 'easteregg', 'emergent')),
  cache_hit   boolean not null,
  pair_key    text not null check (char_length(pair_key) <= 128)
);

create index if not exists craft_fusion_events_created_idx
  on public.craft_fusion_events (created_at desc);

-- RLS enabled with zero policies = publishable key has NO access.
-- Only Cloudflare Worker with SUPABASE_SECRET_KEY can insert.
alter table public.craft_fusion_events enable row level security;`,
    tsSnippet: `import { getSupabaseServiceClient } from "@/lib/supabase/server";

// Fire-and-forget fusion telemetry event
const sb = getSupabaseServiceClient();
await sb.from("craft_fusion_events").insert({
  tier: "canonical",
  cache_hit: false,
  pair_key: "prompt+code",
});`,
    columns: [
      { name: "id", type: "uuid", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique event ID" },
      { name: "created_at", type: "timestamptz", constraints: "NOT NULL DEFAULT now()", description: "Event timestamp" },
      { name: "tier", type: "text", constraints: "CHECK (canonical/easteregg/emergent)", description: "Result tier classification" },
      { name: "cache_hit", type: "boolean", constraints: "NOT NULL", description: "Whether result was served from cache" },
      { name: "pair_key", type: "text", constraints: "CHECK (char_length <= 128)", description: "Order-independent sorted pair key" },
    ],
    rlsPolicies: [
      { name: "No public policies", role: "none", action: "ALL", definition: "Denied by default under RLS; secret key access only" },
    ],
  },
  {
    id: "submissions",
    title: "submissions",
    status: "ACT",
    statusText: "LIVE & ACTIVE",
    category: "Ledger",
    authMode: "publishable",
    migrationFile: "supabase/migrations/0001_submissions.sql",
    description: "Universal lab submission ledger storing benchmark results, Context Diet prompt reductions, and skill evidence.",
    enabled: true,
    sql: `-- Migration: 0001_submissions.sql
create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (char_length(kind) <= 40),
  created_at    timestamptz not null default now(),
  reduction_pct numeric(5,2),
  handle        text check (handle is null or char_length(handle) <= 32),
  payload       jsonb not null
);

alter table public.submissions enable row level security;

create policy "anon insert" on public.submissions
  for insert to anon with check (true);

create policy "anon select" on public.submissions
  for select to anon using (true);`,
    tsSnippet: `import { createClient } from "@supabase/supabase-js";

// Public submission using publishable key
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
const { data, error } = await sb.from("submissions").insert({
  kind: "context-diet",
  reduction_pct: 42.50,
  handle: "milim_scout",
  payload: { originalTokens: 1000, compressedTokens: 575 },
});`,
    columns: [
      { name: "id", type: "uuid", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Submission ID" },
      { name: "kind", type: "text", constraints: "NOT NULL", description: "Submission kind (e.g. 'context-diet', 'gsb-bench')" },
      { name: "created_at", type: "timestamptz", constraints: "NOT NULL DEFAULT now()", description: "Submission timestamp" },
      { name: "reduction_pct", type: "numeric(5,2)", constraints: "INDEXED", description: "Promoted sorting metric for leaderboards" },
      { name: "handle", type: "text", constraints: "CHECK (length <= 32)", description: "Optional contributor handle" },
      { name: "payload", type: "jsonb", constraints: "NOT NULL", description: "Structured JSON submission body" },
    ],
    rlsPolicies: [
      { name: "anon insert", role: "anon", action: "INSERT", definition: "with check (true)" },
      { name: "anon select", role: "anon", action: "SELECT", definition: "using (true)" },
    ],
  },
  {
    id: "user_profiles",
    title: "user_profiles",
    status: "PRP",
    statusText: "PLANNED (DISABLED)",
    category: "Auth (Planned)",
    authMode: "user",
    migrationFile: "supabase/migrations/0004_user_profiles.sql (Proposed)",
    description: "GitHub OAuth identity mapping for verified contributor badges, research karma, and lab submission ownership.",
    enabled: false,
    sql: `-- Migration: 0004_user_profiles.sql (PLANNED / DISABLED)
create table if not exists public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  github_handle text unique not null,
  avatar_url    text,
  role          text not null default 'researcher' check (role in ('researcher', 'maintainer', 'core')),
  created_at    timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can read all profiles" on public.user_profiles
  for select to authenticated using (true);

create policy "Users can update own profile" on public.user_profiles
  for update to authenticated using (auth.uid() = id);`,
    tsSnippet: `import { withSupabase } from "@supabase/server";

// Authenticated GitHub OAuth user endpoint
export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    const { data } = await ctx.supabase.from("user_profiles").select("*").single();
    return Response.json(data);
  }),
};`,
    columns: [
      { name: "id", type: "uuid", constraints: "PRIMARY KEY FK auth.users(id)", description: "Supabase Auth user UUID" },
      { name: "github_handle", type: "text", constraints: "UNIQUE NOT NULL", description: "GitHub username" },
      { name: "avatar_url", type: "text", constraints: "NULLABLE", description: "Profile avatar image URL" },
      { name: "role", type: "text", constraints: "DEFAULT 'researcher'", description: "Role within Gaia research ecosystem" },
    ],
    rlsPolicies: [
      { name: "Users can read all profiles", role: "authenticated", action: "SELECT", definition: "using (true)" },
      { name: "Users can update own profile", role: "authenticated", action: "UPDATE", definition: "using (auth.uid() = id)" },
    ],
  },
  {
    id: "benchmark_leaderboards",
    title: "benchmark_leaderboards",
    status: "PRP",
    statusText: "PLANNED (DISABLED)",
    category: "Verification (Planned)",
    authMode: "publishable",
    migrationFile: "supabase/migrations/0005_benchmark_leaderboards.sql (Proposed)",
    description: "Cryptographically verified benchmark leaderboard records with SHA256 container verification.",
    enabled: false,
    sql: `-- Migration: 0005_benchmark_leaderboards.sql (PLANNED / DISABLED)
create table if not exists public.benchmark_leaderboards (
  id            uuid primary key default gen_random_uuid(),
  benchmark_id  text not null,
  model_name    text not null,
  overall_score numeric(5,4) not null,
  container_sha text not null check (container_sha ~ '^sha256:[a-f0-9]{64}$'),
  verified_at   timestamptz not null default now()
);

alter table public.benchmark_leaderboards enable row level security;
create policy "Public read benchmark leaderboards" on public.benchmark_leaderboards
  for select to anon, authenticated using (true);`,
    tsSnippet: `// Query top benchmark submissions
const { data } = await supabase
  .from("benchmark_leaderboards")
  .select("*")
  .order("overall_score", { ascending: false })
  .limit(10);`,
    columns: [
      { name: "id", type: "uuid", constraints: "PRIMARY KEY", description: "Entry ID" },
      { name: "benchmark_id", type: "text", constraints: "NOT NULL", description: "Benchmark ID (e.g. GSB-v1)" },
      { name: "overall_score", type: "numeric(5,4)", constraints: "NOT NULL", description: "Weighted aggregate score (0.0000 - 1.0000)" },
      { name: "container_sha", type: "text", constraints: "CHECK ^sha256:[a-f0-9]{64}$", description: "Cryptographic runtime container hash" },
    ],
    rlsPolicies: [
      { name: "Public read benchmark leaderboards", role: "anon, authenticated", action: "SELECT", definition: "using (true)" },
    ],
  },
  {
    id: "realtime_telemetry_broadcast",
    title: "realtime_telemetry_broadcast",
    status: "PRP",
    statusText: "PLANNED (DISABLED)",
    category: "Realtime (Planned)",
    authMode: "publishable",
    migrationFile: "Supabase Realtime Channel (Proposed)",
    description: "WebSocket streaming channel for live fusion visualizers and real-time laboratory activity feeds.",
    enabled: false,
    sql: `-- Supabase Realtime Publication (PLANNED / DISABLED)
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.craft_fusion_events;`,
    tsSnippet: `// Browser WebSocket subscription to fusion stream
const channel = supabase
  .channel("craft_events_stream")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "craft_fusion_events" }, payload => {
    console.log("New fusion live event:", payload.new);
  })
  .subscribe();`,
    columns: [
      { name: "channel", type: "string", constraints: "craft_events_stream", description: "Realtime broadcast topic" },
      { name: "event_type", type: "string", constraints: "postgres_changes (INSERT)", description: "Postgres change data capture filter" },
    ],
    rlsPolicies: [
      { name: "Realtime subscription policy", role: "anon", action: "LISTEN", definition: "Topic craft_events_stream" },
    ],
  },
];

export function SupabaseConsole() {
  const [activeSchemaId, setActiveSchemaId] = useState<string>("craft_stats");
  const [healthData, setHealthData] = useState<SupabaseHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rawLogOpen, setRawLogOpen] = useState<boolean>(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/labs/supabase/api/health", { cache: "no-store" });
      const data = (await res.json()) as SupabaseHealthResponse;
      setHealthData(data);
    } catch (err) {
      setHealthData({
        status: "OFFLINE",
        timestamp: new Date().toISOString(),
        latencyMs: 0,
        env: { supabaseUrlConfigured: false, supabaseSecretKeyConfigured: false, hasServiceClient: false },
        tables: {},
        message: err instanceof Error ? err.message : "Failed to contact diagnostic endpoint",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHealth();
  }, []);

  const activeSchema = SCHEMAS.find((s) => s.id === activeSchemaId) ?? SCHEMAS[0];

  const copyToClipboard = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="supabase-console" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ── Diagnostic Ping Monitor Header ───────────────────────────────────── */}
      <div
        className="ledger-card"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          padding: "1.5rem",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, right: 0, width: 6, height: 6, background: "var(--pink)" }} />
        
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.2rem" }}>
          <div>
            <span className="signal" style={{ margin: 0 }}>
              <span className={healthData?.status === "ONLINE" ? "led-verified" : ""} />
              LIVE TELEMETRY &amp; SCHEMA MONITOR
            </span>
            <h2 style={{ font: "1.8rem var(--display)", margin: ".3rem 0 0", textTransform: "uppercase" }}>
              Supabase Diagnostics Console
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              className={`chip ${
                healthData?.status === "ONLINE" ? "vrf" : healthData?.status === "DEGRADED" ? "rev" : "wip"
              }`}
              style={{ padding: ".4rem .8rem", font: "bold .85rem var(--mono)" }}
            >
              STATUS: {loading ? "PINGING..." : healthData?.status ?? "UNKNOWN"}
            </span>

            <button
              type="button"
              className="button secondary"
              onClick={fetchHealth}
              disabled={loading}
              style={{ minHeight: 38, padding: ".4rem .9rem", fontSize: ".9rem" }}
            >
              {loading ? "CHECKING..." : "RUN DIAGNOSTIC QUERY"} <span>⚡</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px",
            background: "var(--line)",
            border: "1px solid var(--line)",
          }}
        >
          <div style={{ background: "var(--bg)", padding: "1rem" }}>
            <span style={{ font: ".7rem var(--mono)", color: "var(--dim)", textTransform: "uppercase", display: "block" }}>
              Diagnostic Latency
            </span>
            <span style={{ font: "1.4rem var(--mono)", color: "var(--pink)", fontWeight: 700 }}>
              {healthData?.latencyMs ?? 0} <small style={{ fontSize: ".75rem", color: "var(--dim)" }}>ms</small>
            </span>
          </div>

          <div style={{ background: "var(--bg)", padding: "1rem" }}>
            <span style={{ font: ".7rem var(--mono)", color: "var(--dim)", textTransform: "uppercase", display: "block" }}>
              Service Key Config
            </span>
            <span
              style={{
                font: "1.1rem var(--mono)",
                color: healthData?.env.supabaseSecretKeyConfigured ? "var(--blue)" : "var(--amber)",
                fontWeight: 700,
              }}
            >
              {healthData?.env.supabaseSecretKeyConfigured ? "CONFIGURED" : "MISSING"}
            </span>
          </div>

          <div style={{ background: "var(--bg)", padding: "1rem" }}>
            <span style={{ font: ".7rem var(--mono)", color: "var(--dim)", textTransform: "uppercase", display: "block" }}>
              craft_stats (fusions)
            </span>
            <span style={{ font: "1.4rem var(--mono)", color: "var(--blue)", fontWeight: 700 }}>
              {healthData?.tables.craft_stats?.accessible
                ? (healthData.tables.craft_stats.count ?? 0).toLocaleString("en-US")
                : "ERR"}
            </span>
          </div>

          <div style={{ background: "var(--bg)", padding: "1rem" }}>
            <span style={{ font: ".7rem var(--mono)", color: "var(--dim)", textTransform: "uppercase", display: "block" }}>
              fusion_events rows
            </span>
            <span style={{ font: "1.4rem var(--mono)", color: "var(--ink)", fontWeight: 700 }}>
              {healthData?.tables.craft_fusion_events?.accessible
                ? (healthData.tables.craft_fusion_events.count ?? 0).toLocaleString("en-US")
                : "ERR"}
            </span>
          </div>

          <div style={{ background: "var(--bg)", padding: "1rem" }}>
            <span style={{ font: ".7rem var(--mono)", color: "var(--dim)", textTransform: "uppercase", display: "block" }}>
              submissions rows
            </span>
            <span style={{ font: "1.4rem var(--mono)", color: "var(--ink)", fontWeight: 700 }}>
              {healthData?.tables.submissions?.accessible
                ? (healthData.tables.submissions.count ?? 0).toLocaleString("en-US")
                : "ERR"}
            </span>
          </div>
        </div>

        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ font: ".8rem var(--mono)", color: "var(--muted)", margin: 0 }}>
            <span style={{ color: "var(--dim)" }}>[DIAGNOSTIC LOG]:</span> {healthData?.message ?? "Initializing query..."}
          </p>
          <button
            type="button"
            onClick={() => setRawLogOpen(!rawLogOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--blue)",
              font: ".75rem var(--mono)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {rawLogOpen ? "Hide Raw JSON" : "View Raw JSON Payload"}
          </button>
        </div>

        {rawLogOpen && healthData && (
          <pre
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#030407",
              border: "1px solid var(--line)",
              color: "var(--blue)",
              font: ".75rem var(--mono)",
              overflowX: "auto",
              maxHeight: 220,
            }}
          >
            {JSON.stringify(healthData, null, 2)}
          </pre>
        )}
      </div>

      {/* ── Feature Status Matrix Table ────────────────────────────────────── */}
      <section>
        <div style={{ marginBottom: "1rem" }}>
          <span className="section-kicker">FEATURE SUMMARY &amp; AUDIT</span>
          <h2 style={{ font: "var(--type-display-3) var(--display)", margin: ".2rem 0" }}>
            Integration Feature Matrix
          </h2>
          <p style={{ color: "var(--muted)", font: ".9rem var(--body)", margin: 0 }}>
            Complete ledger of live and planned Supabase features across telemetry, submissions, authentication, and verification.
          </p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>FEATURE / SCHEMA</th>
                <th>CATEGORY</th>
                <th>AUTH MODE</th>
                <th>STATUS</th>
                <th>MIGRATION SOURCE</th>
                <th>INSPECT</th>
              </tr>
            </thead>
            <tbody>
              {SCHEMAS.map((s) => (
                <tr key={s.id} style={{ background: s.id === activeSchemaId ? "rgba(56, 189, 248, 0.05)" : undefined }}>
                  <th style={{ font: "bold .9rem var(--mono)" }}>
                    <span style={{ color: s.enabled ? "var(--pink)" : "var(--dim)" }}>{s.title}</span>
                  </th>
                  <td>
                    <span style={{ font: ".8rem var(--mono)", color: "var(--muted)" }}>{s.category}</span>
                  </td>
                  <td>
                    <span className="chip" style={{ fontSize: ".7rem", borderColor: "var(--line)" }}>
                      auth: &apos;{s.authMode}&apos;
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${s.status === "VRF" ? "vrf" : s.status === "ACT" ? "act" : "rev"}`}>
                      {s.status} · {s.enabled ? "LIVE" : "PLANNED"}
                    </span>
                  </td>
                  <td style={{ font: ".75rem var(--mono)", color: "var(--dim)" }}>{s.migrationFile}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setActiveSchemaId(s.id)}
                      className="button secondary"
                      style={{ minHeight: 28, padding: ".2rem .6rem", fontSize: ".75rem" }}
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Interactive Schema Inspector ─────────────────────────────────── */}
      <section style={{ border: "1px solid var(--line)", background: "var(--surface)", padding: "1.5rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--line)", paddingBottom: "1rem" }}>
          {SCHEMAS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSchemaId(s.id)}
              style={{
                font: ".8rem var(--mono)",
                padding: ".5rem 1rem",
                background: s.id === activeSchemaId ? "var(--pink)" : "var(--bg)",
                color: s.id === activeSchemaId ? "var(--bg)" : "var(--ink)",
                border: `1px solid ${s.id === activeSchemaId ? "var(--pink)" : "var(--line)"}`,
                cursor: "pointer",
                fontWeight: 700,
                letterSpacing: ".04em",
              }}
            >
              {s.enabled ? "●" : "○"} {s.title}
            </button>
          ))}
        </div>

        {/* Selected Schema Inspector Body */}
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <span className={`chip ${activeSchema.status === "VRF" ? "vrf" : activeSchema.status === "ACT" ? "act" : "rev"}`}>
                {activeSchema.statusText}
              </span>
              <h3 style={{ font: "1.8rem var(--display)", margin: ".5rem 0 .2rem", textTransform: "uppercase" }}>
                {activeSchema.title}
              </h3>
              <p style={{ color: "var(--muted)", font: ".95rem var(--body)", maxWidth: "70ch", margin: 0 }}>
                {activeSchema.description}
              </p>
            </div>

            <div style={{ font: ".8rem var(--mono)", textAlign: "right" }}>
              <span style={{ color: "var(--dim)", display: "block" }}>AUTH REQUIREMENT:</span>
              <span style={{ color: "var(--blue)", fontWeight: 700 }}>auth: &apos;{activeSchema.authMode}&apos;</span>
            </div>
          </div>

          {/* Column Spec Table */}
          <div style={{ marginTop: "1.5rem" }}>
            <h4 style={{ font: ".8rem var(--mono)", color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              SCHEMA COLUMNS &amp; CONSTRAINTS
            </h4>
            <div className="table-wrap" style={{ marginTop: ".5rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>COLUMN</th>
                    <th>DATA TYPE</th>
                    <th>CONSTRAINTS</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSchema.columns.map((col) => (
                    <tr key={col.name}>
                      <th style={{ font: "bold .85rem var(--mono)", color: "var(--pink)" }}>{col.name}</th>
                      <td style={{ font: ".8rem var(--mono)", color: "var(--blue)" }}>{col.type}</td>
                      <td style={{ font: ".75rem var(--mono)", color: "var(--dim)" }}>{col.constraints}</td>
                      <td style={{ font: ".85rem var(--body)", color: "var(--muted)" }}>{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RLS Policies */}
          <div style={{ marginTop: "1.5rem" }}>
            <h4 style={{ font: ".8rem var(--mono)", color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              ROW LEVEL SECURITY (RLS) POLICIES
            </h4>
            <div className="table-wrap" style={{ marginTop: ".5rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>POLICY NAME</th>
                    <th>TARGET ROLE</th>
                    <th>ACTION</th>
                    <th>SQL DEFINITION</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSchema.rlsPolicies.map((pol) => (
                    <tr key={pol.name}>
                      <th style={{ font: "bold .85rem var(--mono)", color: "var(--ink)" }}>{pol.name}</th>
                      <td style={{ font: ".8rem var(--mono)", color: "var(--muted)" }}>{pol.role}</td>
                      <td>
                        <span className="chip act" style={{ fontSize: ".7rem" }}>
                          {pol.action}
                        </span>
                      </td>
                      <td style={{ font: ".8rem var(--mono)", color: "var(--blue)" }}>{pol.definition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SQL Migration Code Block */}
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".5rem" }}>
              <h4 style={{ font: ".8rem var(--mono)", color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".08em", margin: 0 }}>
                POSTGRES MIGRATION DDL ({activeSchema.migrationFile})
              </h4>
              <button
                type="button"
                className="button secondary"
                onClick={() => copyToClipboard(activeSchema.sql, `sql-${activeSchema.id}`)}
                style={{ minHeight: 28, padding: ".2rem .7rem", fontSize: ".75rem" }}
              >
                {copiedId === `sql-${activeSchema.id}` ? "COPIED!" : "COPY SQL"}
              </button>
            </div>

            <pre
              style={{
                background: "var(--bg)",
                border: "1px solid var(--line)",
                padding: "1rem",
                color: "#e2e8f0",
                font: ".8rem/1.5 var(--mono)",
                overflowX: "auto",
                margin: 0,
              }}
            >
              <code>{activeSchema.sql}</code>
            </pre>
          </div>

          {/* TS Integration Snippet */}
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".5rem" }}>
              <h4 style={{ font: ".8rem var(--mono)", color: "var(--pink)", textTransform: "uppercase", letterSpacing: ".08em", margin: 0 }}>
                SERVER INTEGRATION CODE snippet (@supabase/server)
              </h4>
              <button
                type="button"
                className="button secondary"
                onClick={() => copyToClipboard(activeSchema.tsSnippet, `ts-${activeSchema.id}`)}
                style={{ minHeight: 28, padding: ".2rem .7rem", fontSize: ".75rem" }}
              >
                {copiedId === `ts-${activeSchema.id}` ? "COPIED!" : "COPY SNIPPET"}
              </button>
            </div>

            <pre
              style={{
                background: "var(--bg)",
                border: "1px solid var(--line)",
                padding: "1rem",
                color: "var(--blue)",
                font: ".8rem/1.5 var(--mono)",
                overflowX: "auto",
                margin: 0,
              }}
            >
              <code>{activeSchema.tsSnippet}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ── CLI & Deployment Quick Reference ────────────────────────────────── */}
      <section style={{ border: "1px solid var(--line)", background: "var(--surface)", padding: "1.5rem" }}>
        <h3 style={{ font: "1.4rem var(--display)", margin: "0 0 1rem", textTransform: "uppercase" }}>
          Developer CLI Quick Commands
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
          <div>
            <span style={{ font: ".75rem var(--mono)", color: "var(--dim)", textTransform: "uppercase" }}>Push Migrations to Database</span>
            <div className="copy-command" style={{ marginTop: ".3rem" }}>
              <div className="copy-command-text">
                supabase db push
              </div>
              <button
                type="button"
                className="copy-command-btn"
                onClick={() => copyToClipboard("npx supabase db push", "cli-push")}
              >
                {copiedId === "cli-push" ? "COPIED" : "COPY"}
              </button>
            </div>
          </div>

          <div>
            <span style={{ font: ".75rem var(--mono)", color: "var(--dim)", textTransform: "uppercase" }}>Validate Submission Schemas</span>
            <div className="copy-command" style={{ marginTop: ".3rem" }}>
              <div className="copy-command-text">
                npx tsx scripts/validate-submissions.ts
              </div>
              <button
                type="button"
                className="copy-command-btn"
                onClick={() => copyToClipboard("npx tsx scripts/validate-submissions.ts content/templates/gsb-submission.json", "cli-val")}
              >
                {copiedId === "cli-val" ? "COPIED" : "COPY"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
