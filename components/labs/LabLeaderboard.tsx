"use client";

// Generic, reusable leaderboard. Any lab passes its `kind`; context-diet is the
// first consumer. Reads anonymized rows via fetchLeaderboard and marks entries
// that beat a threshold (Lab 001's 41.6%). Degrades to an offline placeholder
// when Supabase is unconfigured.

import { useEffect, useState } from "react";
import { fetchLeaderboard } from "@/lib/submissions/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { SubmissionKind, SubmissionRow } from "@/lib/submissions/types";

const num = (n: number) => n.toLocaleString("en-US");

function fmtDate(iso: string): string {
  // Stable, locale-independent YYYY-MM-DD (avoids hydration drift).
  return iso.slice(0, 10);
}

export function LabLeaderboard({
  kind,
  beatThreshold = 41.6,
  limit = 10,
  refreshKey = 0,
}: {
  kind: SubmissionKind;
  beatThreshold?: number;
  limit?: number;
  refreshKey?: number;
}) {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    let alive = true;
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchLeaderboard(kind, { orderBy: "reduction_pct", limit }).then((data) => {
      if (alive) {
        setRows(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [kind, limit, refreshKey]);

  return (
    <section className="lab-leaderboard">
      <span className="section-kicker">LEADERBOARD · BEAT LAB 001 ({beatThreshold}%)</span>
      <p className="lb-disclaimer">
        Community submissions · self-reported anonymized metrics from the local estimator, ranked
        against Lab 001&apos;s {beatThreshold}% result. Early days — the board is still filling up.
      </p>
      {!isSupabaseConfigured ? (
        <p className="pending">
          Leaderboard offline — no Supabase configured for this build. The analyzer runs fully
          without it.
        </p>
      ) : loading ? (
        <p className="pending">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="pending">No submissions yet. Be the first to beat {beatThreshold}%.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Handle</th>
                <th scope="col">Reduction</th>
                <th scope="col">Before → After</th>
                <th scope="col">Strategy</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const pct = r.reduction_pct ?? 0;
                const beat = pct >= beatThreshold;
                return (
                  <tr key={r.id} className={beat ? "lb-beat" : undefined}>
                    <td>{i + 1}</td>
                    <th scope="row">{r.handle || "anonymous"}</th>
                    <td>
                      {pct.toFixed(1)}%{beat && <span className="lb-badge"> ★ beat</span>}
                    </td>
                    <td>
                      {num(r.payload.tokensBefore)} → {num(r.payload.tokensAfter)}
                    </td>
                    <td>{r.payload.strategyKey ?? "—"}</td>
                    <td>{fmtDate(r.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
