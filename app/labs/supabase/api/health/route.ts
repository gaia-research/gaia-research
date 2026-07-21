/**
 * app/labs/supabase/api/health/route.ts
 *
 * GET /labs/supabase/api/health
 *
 * Developer health check & diagnostic route for Supabase integrations.
 * Queries live status of `craft_stats`, `craft_fusion_events`, and `submissions`
 * tables and checks environment configuration without throwing 500 errors.
 */

import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface SupabaseTableStatus {
  name: string;
  accessible: boolean;
  count?: number | null;
  error?: string | null;
  details?: Record<string, unknown>;
}

export interface SupabaseHealthResponse {
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  timestamp: string;
  latencyMs: number;
  env: {
    supabaseUrlConfigured: boolean;
    supabaseSecretKeyConfigured: boolean;
    hasServiceClient: boolean;
  };
  tables: Record<string, SupabaseTableStatus>;
  message: string;
}

export async function GET(): Promise<Response> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  const supabaseUrlConfigured = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseSecretKeyConfigured = Boolean(process.env.SUPABASE_SECRET_KEY);
  
  const sb = getSupabaseServiceClient();

  if (!sb) {
    return NextResponse.json<SupabaseHealthResponse>({
      status: "OFFLINE",
      timestamp,
      latencyMs: Date.now() - startTime,
      env: {
        supabaseUrlConfigured,
        supabaseSecretKeyConfigured,
        hasServiceClient: false,
      },
      tables: {
        craft_stats: { name: "craft_stats", accessible: false, error: "ServiceClient unavailable (SUPABASE_SECRET_KEY missing)" },
        craft_fusion_events: { name: "craft_fusion_events", accessible: false, error: "ServiceClient unavailable" },
        submissions: { name: "submissions", accessible: false, error: "ServiceClient unavailable" },
      },
      message: "Supabase service client could not be initialized. Missing SUPABASE_SECRET_KEY or SUPABASE_URL.",
    });
  }

  const tableResults: Record<string, SupabaseTableStatus> = {};
  let totalErrors = 0;
  let totalSuccess = 0;

  // 1. Check craft_stats
  try {
    const { data, error } = await sb
      .from("craft_stats")
      .select("key, value");

    if (error) {
      tableResults.craft_stats = {
        name: "craft_stats",
        accessible: false,
        error: error.message,
      };
      totalErrors++;
    } else {
      const statsMap = Object.fromEntries(
        (data ?? []).map((row: { key: string; value: number }) => [row.key, Number(row.value)])
      );
      tableResults.craft_stats = {
        name: "craft_stats",
        accessible: true,
        details: statsMap,
        count: statsMap.total_fusions ?? 0,
      };
      totalSuccess++;
    }
  } catch (err) {
    tableResults.craft_stats = {
      name: "craft_stats",
      accessible: false,
      error: err instanceof Error ? err.message : String(err),
    };
    totalErrors++;
  }

  // 2. Check craft_fusion_events
  try {
    const { count, error } = await sb
      .from("craft_fusion_events")
      .select("*", { count: "exact", head: true });

    if (error) {
      tableResults.craft_fusion_events = {
        name: "craft_fusion_events",
        accessible: false,
        error: error.message,
      };
      totalErrors++;
    } else {
      tableResults.craft_fusion_events = {
        name: "craft_fusion_events",
        accessible: true,
        count: count ?? 0,
      };
      totalSuccess++;
    }
  } catch (err) {
    tableResults.craft_fusion_events = {
      name: "craft_fusion_events",
      accessible: false,
      error: err instanceof Error ? err.message : String(err),
    };
    totalErrors++;
  }

  // 3. Check submissions
  try {
    const { count, error } = await sb
      .from("submissions")
      .select("*", { count: "exact", head: true });

    if (error) {
      tableResults.submissions = {
        name: "submissions",
        accessible: false,
        error: error.message,
      };
      totalErrors++;
    } else {
      tableResults.submissions = {
        name: "submissions",
        accessible: true,
        count: count ?? 0,
      };
      totalSuccess++;
    }
  } catch (err) {
    tableResults.submissions = {
      name: "submissions",
      accessible: false,
      error: err instanceof Error ? err.message : String(err),
    };
    totalErrors++;
  }

  const latencyMs = Date.now() - startTime;
  let status: "ONLINE" | "DEGRADED" | "OFFLINE" = "ONLINE";

  if (totalErrors === 3) {
    status = "OFFLINE";
  } else if (totalErrors > 0) {
    status = "DEGRADED";
  }

  return NextResponse.json<SupabaseHealthResponse>({
    status,
    timestamp,
    latencyMs,
    env: {
      supabaseUrlConfigured,
      supabaseSecretKeyConfigured,
      hasServiceClient: true,
    },
    tables: tableResults,
    message:
      status === "ONLINE"
        ? "All live Supabase tables and triggers are accessible and operational."
        : status === "DEGRADED"
        ? "Some Supabase tables returned errors during query."
        : "Failed to query any live Supabase tables.",
  });
}
