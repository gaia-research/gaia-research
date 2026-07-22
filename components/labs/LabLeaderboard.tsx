"use client";

// Generic, reusable leaderboard. Any lab passes its `kind`; context-diet is the
// first consumer. Reads anonymized rows via fetchLeaderboard and marks entries
// that beat a threshold (Lab 001's 41.6%). Degrades to an offline placeholder
// when Supabase is unconfigured.

import { useEffect, useState } from "react";
import { fetchLeaderboard } from "@/lib/submissions/client";
import type { SubmissionKind, SubmissionRow } from "@/lib/submissions/types";
import { InfoTip } from "./InfoTip";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
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
      <div className="lb-heading">
        <span className="section-kicker">COMMUNITY RESULTS</span>
        <InfoTip label="About leaderboard results">
          Server-calculated results from public GitHub before/after revisions, ranked against Lab
          001&apos;s {beatThreshold}% result.
        </InfoTip>
      </div>
      {loading ? (
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
                    <td>{r.payload.verified ? "Verified public" : "Legacy"}</td>
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
