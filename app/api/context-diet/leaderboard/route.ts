import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { validateContextDiet } from "@/lib/submissions/validate";

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

  let payload;
  try {
    payload = validateContextDiet(JSON.parse(raw));
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "invalid payload" },
      { status: 400 },
    );
  }

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
  return NextResponse.json({ ok: true }, { status: 201 });
}
