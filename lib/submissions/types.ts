// Generic submission layer — shared contract.
//
// One table, many kinds. context-diet is the first consumer; benchmark-result
// and skill-evidence are reserved so future labs can add a `kind` + a payload
// type WITHOUT a schema migration (payload is stored as jsonb; only a few
// columns are promoted for indexing/leaderboards). See
// supabase/migrations/0001_submissions.sql.

export type SubmissionKind = "context-diet" | "benchmark-result" | "skill-evidence";

/** Fields common to every submission payload. */
interface BasePayload {
  kind: SubmissionKind;
}

/** The only implemented payload today. Anonymized metrics only — never text. */
export interface ContextDietPayload extends BasePayload {
  kind: "context-diet";
  labId: "lab-001";
  tokensBefore: number;
  tokensAfter: number;
  /** 0..100 — promoted to a column for leaderboard sorting. */
  reductionPct: number;
  /** which Lab 001 strategy the projection targeted. */
  strategyKey?: string;
  /** optional, opt-in, sanitized display handle. */
  handle?: string;
}

// Reserved for future consumers — declared for the union but not yet built.
// export interface BenchmarkResultPayload extends BasePayload { kind: "benchmark-result"; ... }
// export interface SkillEvidencePayload extends BasePayload { kind: "skill-evidence"; ... }

export type SubmissionPayload = ContextDietPayload;

/** A row as stored/returned from the `submissions` table. */
export interface SubmissionRow {
  id: string;
  kind: SubmissionKind;
  created_at: string;
  reduction_pct: number | null;
  handle: string | null;
  payload: SubmissionPayload;
}

export interface SubmitResult {
  ok: boolean;
  /** true when Supabase is unconfigured — the caller should show an offline state. */
  offline?: boolean;
  error?: string;
}

export interface LeaderboardOpts {
  limit?: number;
  orderBy?: "reduction_pct" | "created_at";
  minReductionPct?: number;
}
