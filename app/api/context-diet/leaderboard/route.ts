import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { validateContextDietEvidence } from "@/lib/submissions/validate";
import { fetchPublicGitHubContext } from "@/lib/context-diet/github";
import { approxTokens } from "@/lib/context-diet/analyze";
import type { ContextDietPayload } from "@/lib/submissions/types";

const TABLE = "submissions";
const MAX_BODY_BYTES = 2_048;
const MAX_ROWS = 50;
const ALLOWED_ORIGINS = new Set([
  "https://research.gaiaskilltree.com",
  "http://localhost:3000",
  "http://localhost:3010",
  "http://localhost:3117",
]);

function rejectCrossOriginBrowser(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ ok: false, error: "origin not allowed" }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  const blocked = rejectCrossOriginBrowser(request);
  if (blocked) return blocked;

  const url = new URL(request.url);
  const requested = Number(url.searchParams.get("limit") ?? 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(Math.round(requested), 1), MAX_ROWS) : 10;
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "leaderboard unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, kind, created_at, reduction_pct, handle, payload")
    .eq("kind", "context-diet")
    .order("reduction_pct", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ ok: false, error: "leaderboard query failed" }, { status: 500 });
  return NextResponse.json({ ok: true, rows: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const blocked = rejectCrossOriginBrowser(request);
  if (blocked) return blocked;

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload too large" }, { status: 413 });
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid request body" }, { status: 400 });
  }
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload too large" }, { status: 413 });
  }

  let evidence;
  try {
    evidence = validateContextDietEvidence(JSON.parse(raw));
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "invalid payload" },
      { status: 400 },
    );
  }

  let before;
  let after;
  try {
    [before, after] = await Promise.all([
      fetchPublicGitHubContext(evidence.beforeUrl),
      fetchPublicGitHubContext(evidence.afterUrl),
    ]);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "public evidence could not be verified" },
      { status: 422 },
    );
  }
  const beforeChars = before.content.replace(/\r\n?/g, "\n").length;
  const afterChars = after.content.replace(/\r\n?/g, "\n").length;
  if (afterChars >= beforeChars) {
    return NextResponse.json({ ok: false, error: "after evidence must be smaller than before evidence" }, { status: 422 });
  }
  const tokensBefore = approxTokens(beforeChars);
  const tokensAfter = approxTokens(afterChars);
  const reductionPct = Math.round(((beforeChars - afterChars) / beforeChars) * 1_000) / 10;
  const payload: ContextDietPayload = {
    kind: "context-diet",
    labId: "lab-001",
    tokensBefore,
    tokensAfter,
    reductionPct,
    strategyKey: "verified-public-git",
    verified: true,
    evidence: { beforeUrl: evidence.beforeUrl, afterUrl: evidence.afterUrl },
    ...(evidence.handle ? { handle: evidence.handle } : {}),
  };

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "leaderboard unavailable" }, { status: 503 });
  }
  const { error } = await supabase.from(TABLE).insert({
    kind: payload.kind,
    reduction_pct: payload.reductionPct,
    handle: payload.handle ?? null,
    payload,
  });
  if (error) return NextResponse.json({ ok: false, error: "submission failed" }, { status: 500 });
  return NextResponse.json({ ok: true, payload }, { status: 201 });
}
