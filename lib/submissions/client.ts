// Generic submission client.
//
// submit()/fetchLeaderboard() are the reusable primitives every lab/benchmark
// uses. submitContextDiet() is the first typed consumer wrapping submit().
// All calls degrade gracefully to an offline result when Supabase is
// unconfigured — nothing throws on the network path.

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
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
  return submit("context-diet", payload);
}

export { isSupabaseConfigured };
