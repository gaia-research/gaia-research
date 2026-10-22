#!/usr/bin/env python3
"""Extract Gaia fleet telemetry from Pi workflow run records.

Source of truth: ~/.pi/workflows/projects/<project>/runs/*.json
(one JSON per workflow run; *.bak are byte-identical backups and are skipped).

Output: a JSON summary used as local class-B operational evidence for the
role-intelligence research package. Deterministic: no sampling, no inference.
Fields that the harness did not report stay null (never 0).

Usage:
  python3 extract_fleet_telemetry.py [--root ~/.pi/workflows/projects] [--out fleet-telemetry.json]
"""
from __future__ import annotations

import argparse
import collections
import glob
import json
import os
from datetime import datetime, timezone


def iso_days_ago(ts: str | None) -> str | None:
    if not ts:
        return None
    try:
        d = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return None
    return (datetime.now(timezone.utc) - d).days


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.expanduser("~/.pi/workflows/projects"))
    ap.add_argument("--out", default="fleet-telemetry.json")
    ap.add_argument("--full", action="store_true",
                    help="keep per-agent rows (they contain no prompts, but the "
                         "artifact gets large); default is aggregated")
    args = ap.parse_args()

    runs = []
    for path in sorted(glob.glob(os.path.join(args.root, "*", "runs", "*.json"))):
        if path.endswith(".bak"):
            continue
        try:
            with open(path, encoding="utf-8") as fh:
                d = json.load(fh)
        except (OSError, ValueError):
            continue

        usage = d.get("tokenUsage") or {}
        agents = []
        for a in d.get("agents") or []:
            agents.append(
                {
                    "label": a.get("label"),
                    "phase": a.get("phase"),
                    "model": a.get("model"),
                    "status": a.get("status"),
                    "error_code": a.get("errorCode"),
                    "recoverable": a.get("recoverable"),
                    "started_at": a.get("startedAt"),
                    "ended_at": a.get("endedAt"),
                    "turns": len(a.get("history") or []),
                }
            )

        # Per-agent rows are aggregated, not stored verbatim: the full run
        # records contain prompts and transcript content, which do not belong
        # in a reviewable research artifact. Re-run with --full to keep them.
        agent_rows = agents if args.full else []
        runs.append(
            {
                "run_id": d.get("runId"),
                "workflow": d.get("workflowName"),
                "project": path.split(os.sep)[-3],
                "status": d.get("status"),
                "phases": d.get("phases") or [],
                "n_agents": len(agents),
                "agent_models": sorted({a["model"] for a in agents if a.get("model")}),
                "agent_statuses": dict(collections.Counter(a.get("status") or "unknown" for a in agents)),
                "agent_phases": sorted({a["phase"] for a in agents if a.get("phase")}),
                "concurrency": d.get("concurrency"),
                "token_budget": d.get("tokenBudget"),
                "usage": {
                    "input": usage.get("input"),
                    "output": usage.get("output"),
                    "cache_read": usage.get("cacheRead"),
                    "cache_write": usage.get("cacheWrite"),
                    "total": usage.get("total"),
                    "cost_usd": usage.get("cost"),
                },
                "started_at": d.get("startedAt"),
                "completed_at": d.get("completedAt"),
                "duration_ms": d.get("durationMs"),
                "age_days": iso_days_ago(d.get("startedAt")),
                "agents": agent_rows,
            }
        )

    # ---- aggregates -------------------------------------------------------
    def agg(keyfn, label):
        out = collections.defaultdict(lambda: {"runs": 0, "completed": 0, "aborted": 0,
                                               "failed": 0, "tokens_total": 0, "cost_usd": 0.0,
                                               "cost_measured_runs": 0})
        for r in runs:
            k = keyfn(r)
            if k is None:
                continue
            b = out[k]
            b["runs"] += 1
            st = r.get("status")
            if st == "completed":
                b["completed"] += 1
            elif st == "aborted":
                b["aborted"] += 1
            elif st == "failed":
                b["failed"] += 1
            t = (r.get("usage") or {}).get("total")
            if isinstance(t, (int, float)):
                b["tokens_total"] += t
            c = (r.get("usage") or {}).get("cost_usd")
            if isinstance(c, (int, float)) and c > 0:
                b["cost_usd"] += c
                b["cost_measured_runs"] += 1
        return {label: {k: dict(v) for k, v in sorted(out.items())}}

    model_usage = collections.Counter()
    model_agent_runs = collections.Counter()
    model_status = collections.defaultdict(collections.Counter)
    phase_model = collections.defaultdict(collections.Counter)
    for r in runs:
        for a in r["agents"]:
            m = a.get("model")
            if not m:
                continue
            model_agent_runs[m] += 1
            model_status[m][a.get("status") or "unknown"] += 1
            model_usage[m] += a.get("turns") or 0
            if a.get("phase"):
                phase_model[a["phase"]][m] += 1

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": os.path.expanduser("~/.pi/workflows/projects/*/runs/*.json"),
        "note": (
            "Local class-B operational evidence. cost_usd is the harness-reported "
            "figure; 0 means the run was subscription/quota-billed, not free. "
            "Fields the harness did not report are null, never 0. "
            "Runs are not comparable across workflows: task difficulty, grader and "
            "harness differ. Status is an outcome proxy, not a quality grade."
        ),
        "totals": {
            "runs": len(runs),
            "with_usage": sum(1 for r in runs if r.get("usage", {}).get("total") is not None),
            "completed": sum(1 for r in runs if r.get("status") == "completed"),
            "aborted": sum(1 for r in runs if r.get("status") == "aborted"),
            "failed": sum(1 for r in runs if r.get("status") == "failed"),
            "paused": sum(1 for r in runs if r.get("status") == "paused"),
            "runs_with_measured_cost": sum(
                1 for r in runs if (r.get("usage", {}).get("cost_usd") or 0) > 0
            ),
            "total_tokens": sum(
                (r.get("usage", {}).get("total") or 0) for r in runs
            ),
            "total_measured_cost_usd": round(
                sum((r.get("usage", {}).get("cost_usd") or 0) for r in runs), 6
            ),
        },
        "by_workflow": agg(lambda r: r.get("workflow"), "by_workflow"),
        "by_project": agg(lambda r: r.get("project"), "by_project"),
        "by_status": dict(collections.Counter(r.get("status") for r in runs)),
        "agent_model_usage": {
            "note": "counts of agent assignments (a run may assign the same model to several agents)",
            "assignments": dict(model_agent_runs.most_common()),
            "status_by_model": {k: dict(v) for k, v in model_status.items()},
        },
        "phase_model_matrix": {
            phase: dict(counter.most_common()) for phase, counter in phase_model.items()
        },
    }

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump({"summary": summary, "runs": runs}, fh, indent=2, sort_keys=True)

    print(json.dumps(summary["totals"], indent=2))
    print("\nphase -> model (top 3 per phase):")
    for phase, counter in sorted(phase_model.items()):
        print(f"  {phase:28s} {dict(counter.most_common(3))}")
    print("\nmodel -> agent assignments / statuses:")
    for m, c in model_agent_runs.most_common():
        print(f"  {c:3d}  {m:48s} {dict(model_status[m])}")


if __name__ == "__main__":
    main()
