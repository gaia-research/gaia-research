// Generic submission client.
//
// submit()/fetchLeaderboard() are the reusable primitives every lab/benchmark
// uses. submitContextDiet() is the first typed consumer wrapping submit().
// All calls degrade gracefully to an offline result when Supabase is
// unconfigured — nothing throws on the network path.

import { getSupabase, isSupabaseConfigured as isBrowserSupabaseConfigured } from "@/lib/supabase/client";
import { validateContextDiet } from "./validate";
import type {
  ContextDietPayload,
  LeaderboardOpts,
  SubmissionKind,
  SubmissionPayload,
  SubmissionRow,
  SubmitResult,
} from "./types";

const TABLE = "submissions";

/** Insert one submission. Promotes reduction_pct + handle to indexed columns. */
export async function submit(
  kind: SubmissionKind,
  payload: SubmissionPayload,
): Promise<SubmitResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, offline: true };

  const row = {
    kind,
    reduction_pct: "reductionPct" in payload ? payload.reductionPct : null,
    handle: "handle" in payload ? (payload.handle ?? null) : null,
    payload,
  };

  const { error } = await supabase.from(TABLE).insert(row);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Read a leaderboard for one kind. Returns [] when offline or on error. */
export async function fetchLeaderboard(
  kind: SubmissionKind,
  opts: LeaderboardOpts = {},
): Promise<SubmissionRow[]> {
  if (kind === "context-diet") {
    try {
      const limit = Math.min(Math.max(opts.limit ?? 10, 1), 50);
      const response = await fetch(`/api/context-diet/leaderboard?limit=${limit}`, { cache: "no-store" });
      if (!response.ok) return [];
      const result = (await response.json()) as { ok: boolean; rows?: SubmissionRow[] };
      return result.ok && Array.isArray(result.rows) ? result.rows : [];
    } catch {
      return [];
    }
  }
  const supabase = getSupabase();
  if (!supabase) return [];

  const { limit = 10, orderBy = "reduction_pct", minReductionPct } = opts;

  let query = supabase
    .from(TABLE)
    .select("id, kind, created_at, reduction_pct, handle, payload")
    .eq("kind", kind)
    .order(orderBy, { ascending: false })
    .limit(limit);

  if (typeof minReductionPct === "number") {
    query = query.gte("reduction_pct", minReductionPct);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as SubmissionRow[];
}

/** First typed consumer of the generic layer. Validates before sending. */
export async function submitContextDiet(
  metrics: Omit<ContextDietPayload, "kind" | "labId">,
): Promise<SubmitResult> {
  let payload: ContextDietPayload;
  try {
    payload = validateContextDiet(metrics);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  try {
    const response = await fetch("/api/context-diet/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, offline: response.status === 503, error: result?.error ?? "submission failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, offline: true };
  }
}

/** Context Diet uses the server route and does not require public browser keys. */
export const isSupabaseConfigured = true;
export { isBrowserSupabaseConfigured };
