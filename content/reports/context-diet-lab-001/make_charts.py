#!/usr/bin/env python3
"""
make_charts.py — render the Context Diet Lab 001 before/after charts.

Privacy-safe: consumes only aggregate metrics (char counts, faithfulness %,
section sizes). No handles, no incident text, no private paths in any chart.

Inputs (JSON):
  --baseline  tools/context-diet/baseline.json   (from context_diet.py --json, BEFORE)
  --after     tools/context-diet/after.json       (from context_diet.py --json, AFTER)
  --bakeoff   tools/context-diet/bakeoff.json      (workflow comparison array)
Output:
  --outdir    directory for the three PNGs

Charts:
  1. size-before-after.png   — total chars before/after vs the 40k limit
  2. section-histogram.png    — top-N section sizes before vs after
  3. bakeoff-scatter.png       — reduction% (x) vs faithfulness% (y), winner starred
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# Gaia Research brand palette (from DESIGN.md): Milim Pink / Rimuru Blue on obsidian.
PINK = "#ec4899"
BLUE = "#38bdf8"
GOLD = "#f5c451"
INK = "#0b0e14"
PANEL = "#141922"
GRID = "#2a323f"
TEXT = "#e6edf3"
MUTED = "#8b97a7"
LIMIT = 40_000


def styleAxes(ax):
    ax.set_facecolor(PANEL)
    for spine in ax.spines.values():
        spine.set_color(GRID)
    ax.tick_params(colors=MUTED)
    ax.yaxis.label.set_color(TEXT)
    ax.xaxis.label.set_color(TEXT)
    ax.title.set_color(TEXT)
    ax.grid(True, color=GRID, linewidth=0.6, alpha=0.5)


def newFig(w=8, h=5):
    fig, ax = plt.subplots(figsize=(w, h))
    fig.patch.set_facecolor(INK)
    styleAxes(ax)
    return fig, ax


def chartSize(baseline, after, out):
    fig, ax = newFig(6.5, 5)
    before = baseline["totalChars"]
    aft = after["totalChars"]
    bars = ax.bar(["Before", "After"], [before, aft], color=[MUTED, PINK], width=0.55, zorder=3)
    ax.axhline(LIMIT, color=GOLD, linestyle="--", linewidth=1.6, zorder=4,
               label=f"Limit {LIMIT:,}")
    for b, v in zip(bars, [before, aft]):
        ax.text(b.get_x() + b.get_width() / 2, v + 600, f"{v:,}",
                ha="center", color=TEXT, fontsize=11, fontweight="bold")
    ax.set_ylabel("Characters")
    ax.set_title("CLAUDE.md size — before vs after Context Diet", fontweight="bold")
    ax.legend(facecolor=PANEL, edgecolor=GRID, labelcolor=TEXT)
    ax.set_ylim(0, max(before, LIMIT) * 1.12)
    fig.tight_layout()
    fig.savefig(out, dpi=150, facecolor=INK)
    plt.close(fig)


def chartHistogram(baseline, after, out, topn=12):
    beforeMap = {s["title"]: s["chars"] for s in baseline["sections"]}
    afterMap = {s["title"]: s["chars"] for s in after["sections"]}
    top = sorted(beforeMap.items(), key=lambda kv: kv[1], reverse=True)[:topn]
    labels = [t[:26] + ("…" if len(t) > 26 else "") for t, _ in top]
    beforeV = [v for _, v in top]
    afterV = [afterMap.get(t, 0) for t, _ in top]
    y = range(len(labels))
    fig, ax = newFig(9, 6.5)
    h = 0.4
    ax.barh([i + h / 2 for i in y], beforeV, height=h, color=MUTED, label="Before", zorder=3)
    ax.barh([i - h / 2 for i in y], afterV, height=h, color=BLUE, label="After", zorder=3)
    ax.set_yticks(list(y))
    ax.set_yticklabels(labels, fontsize=9)
    ax.invert_yaxis()
    ax.set_xlabel("Characters")
    ax.set_title("Per-section size — before vs after", fontweight="bold")
    ax.legend(facecolor=PANEL, edgecolor=GRID, labelcolor=TEXT)
    fig.tight_layout()
    fig.savefig(out, dpi=150, facecolor=INK)
    plt.close(fig)


def chartBakeoff(bakeoff, winnerKey, out):
    fig, ax = newFig(7.5, 5.5)
    for r in bakeoff:
        isWin = r["key"] == winnerKey
        qualified = r.get("qualified", False)
        color = GOLD if isWin else (BLUE if qualified else MUTED)
        marker = "*" if isWin else ("o" if qualified else "x")
        size = 460 if isWin else 160
        ax.scatter(r["reductionPct"], r["faithfulness"], s=size, c=color,
                   marker=marker, edgecolors=TEXT, linewidths=0.8, zorder=4)
        ax.annotate(r["title"], (r["reductionPct"], r["faithfulness"]),
                    textcoords="offset points", xytext=(8, 6),
                    color=TEXT, fontsize=9)
    ax.set_xlabel("Size reduction (%)")
    ax.set_ylabel("Faithfulness — rules retained (%)")
    ax.set_title("Strategy bake-off: reduction vs faithfulness", fontweight="bold")
    ax.axhline(100, color=GRID, linewidth=0.8)
    fig.tight_layout()
    fig.savefig(out, dpi=150, facecolor=INK)
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--baseline", required=True)
    ap.add_argument("--after", required=True)
    ap.add_argument("--bakeoff", required=True)
    ap.add_argument("--outdir", required=True)
    args = ap.parse_args()

    baseline = json.loads(Path(args.baseline).read_text(encoding="utf-8"))
    after = json.loads(Path(args.after).read_text(encoding="utf-8"))
    bk = json.loads(Path(args.bakeoff).read_text(encoding="utf-8"))
    comparison = bk["comparison"] if isinstance(bk, dict) else bk
    winnerKey = bk.get("winnerKey") if isinstance(bk, dict) else None

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    chartSize(baseline, after, outdir / "size-before-after.png")
    chartHistogram(baseline, after, outdir / "section-histogram.png")
    chartBakeoff(comparison, winnerKey, outdir / "bakeoff-scatter.png")
    print(f"wrote 3 charts to {outdir}")


if __name__ == "__main__":
    main()
