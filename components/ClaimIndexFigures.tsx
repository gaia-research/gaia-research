import { Fragment } from "react";

// Static, server-rendered visual aids for the Arc I claim index. No client JS —
// the page stays a static prerender, and every plotted value is printed directly
// on its mark, so nothing is gated behind hover (this is a report, not a
// dashboard). Same convention as components/ReportCharts.tsx.
//
// NOTHING HERE IS A NEW CLAIM.
//   · Figure 1 replots three already-committed values: `hh-ledger/v1` records 11
//     and 12 (perTurn 19,661 and 20,176) and the signed delta between them. They
//     live in the .tsx rather than the scanned markdown on purpose — check-claims
//     reads content/reports/**.md, and an axis label is not a claim.
//   · Figure 2 is a tally of the claim index's own rows. It measures the page,
//     not the harness.
//
// Color: the site's committed brand pair (Rimuru Blue / Milim Pink) plus the
// muted token for "not ours to measure". Blue↔pink validates at CVD ΔE 14.0
// (deutan) on the --surface backdrop; the third family also carries a 45° hatch
// so the split never rests on hue alone. Fills come from CSS classes bound to
// design tokens, so the figures follow the theme rather than pinning hexes.

/* ── Figure 1 — the door, priced ─────────────────────────────────────────── */

const BENCHMARK_FLOOR = 19_661; // ledger record 11 · placebo · floor=benchmark
const PRODUCT_FLOOR = 20_176; // ledger record 12 · heaven  · floor=product
const DOOR = PRODUCT_FLOOR - BENCHMARK_FLOOR; // signed delta, needs no record

const F1_W = 440;
const F1_H = 182;
const F1_PLOT = 372;
const F1_BAR = 20;
const f1x = (v: number) => (v / PRODUCT_FLOOR) * F1_PLOT;
const num = (v: number) => v.toLocaleString("en-US");

function DoorCostFigure() {
  const xFloor = f1x(BENCHMARK_FLOOR);
  const rows = [
    { label: "benchmark floor · doorless", value: BENCHMARK_FLOOR, y: 28 },
    { label: "product floor · door open", value: PRODUCT_FLOOR, y: 90 },
  ];
  return (
    <svg viewBox={`0 0 ${F1_W} ${F1_H}`} role="img" aria-labelledby="fig-door fig-door-desc" className="fig-svg">
      <desc id="fig-door-desc">
        Two horizontal bars on a common zero baseline. The doorless benchmark floor is
        {` ${num(BENCHMARK_FLOOR)}`} tokens per turn; the product floor, which keeps the slash-command
        door open, is {num(PRODUCT_FLOOR)}. The bars are nearly the same length: the door accounts for
        the {num(DOOR)}-token sliver highlighted at their right-hand ends.
      </desc>

      {/* the delta band: the whole subject of the figure, drawn to scale */}
      <rect x={xFloor} y={14} width={F1_PLOT - xFloor} height={100} className="fig-band" />
      <line x1={xFloor} y1={14} x2={xFloor} y2={140} className="fig-band-edge" />

      {rows.map((r) => (
        <Fragment key={r.label}>
          <text x={0} y={r.y - 8} className="fig-xlabel">{r.label}</text>
          <rect x={0} y={r.y} width={xFloor} height={F1_BAR} className="fig-mark-bound" />
          {r.value === PRODUCT_FLOOR && (
            <rect x={xFloor + 2} y={r.y} width={F1_PLOT - xFloor - 2} height={F1_BAR} className="fig-mark-gap" />
          )}
          <text x={F1_PLOT + 8} y={r.y + 15} className="fig-val strong">{num(r.value)}</text>
        </Fragment>
      ))}

      {/* zero baseline, stated so nobody has to wonder whether the axis is cut */}
      <line x1={0} y1={14} x2={0} y2={122} className="fig-axis" />
      <text x={0} y={136} className="fig-tick">0</text>

      <text x={F1_PLOT} y={144} className="fig-val emph" textAnchor="end">+{num(DOOR)}</text>
      <text x={F1_PLOT} y={166} className="fig-xnote" textAnchor="end">
        the entire cost of keeping the door open
      </text>
    </svg>
  );
}

/* ── Figure 2 — where the evidence sits ──────────────────────────────────── */

type Family = "bound" | "gap" | "outside";

const TALLY: { status: string; rows: number; family: Family }[] = [
  { status: "RECORD", rows: 8, family: "bound" },
  { status: "‡ UNCOMMITTED", rows: 6, family: "gap" },
  { status: "RUN RECORD", rows: 2, family: "bound" },
  { status: "OUT OF SCOPE", rows: 2, family: "outside" },
  { status: "NOT COMMITTED", rows: 1, family: "gap" },
  { status: "NOT PROBED", rows: 1, family: "gap" },
  { status: "SOFTENED", rows: 1, family: "gap" },
];

const FAMILY_LABEL: Record<Family, string> = {
  bound: "traces to a committed record",
  gap: "declared gap",
  outside: "another program",
};

const F2_W = 440;
const F2_ROW = 26;
const F2_TOP = 10;
const F2_LABEL_W = 128;
const F2_PLOT = F2_W - F2_LABEL_W - 30;
const F2_MAX = 8;
const F2_ROWS_END = F2_TOP + TALLY.length * F2_ROW;
const F2_H = F2_ROWS_END + 8;

function markClass(f: Family) {
  return f === "bound" ? "fig-mark-bound" : f === "gap" ? "fig-mark-gap" : "fig-mark-outside";
}

function EvidenceShapeFigure() {
  return (
    <svg viewBox={`0 0 ${F2_W} ${F2_H}`} role="img" aria-labelledby="fig-shape fig-shape-desc" className="fig-svg">
      <defs>
        <pattern id="fig-hatch-outside" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="6" className="fig-hatch-line" />
        </pattern>
      </defs>
      <desc id="fig-shape-desc">
        A horizontal bar chart tallying the claim index by status:
        {TALLY.map((t) => ` ${t.status}, ${t.rows} row${t.rows === 1 ? "" : "s"};`)} Bars are grouped
        into three families by fill and repeated in the legend: traces to a committed record, declared
        gap, and another program&rsquo;s claim.
      </desc>

      {TALLY.map((t, i) => {
        const y = F2_TOP + i * F2_ROW;
        const w = (t.rows / F2_MAX) * F2_PLOT;
        return (
          <Fragment key={t.status}>
            <text x={F2_LABEL_W - 10} y={y + 17} className="fig-xlabel" textAnchor="end">{t.status}</text>
            <rect x={F2_LABEL_W} y={y + 6} width={w} height={14} className={markClass(t.family)} />
            <text x={F2_LABEL_W + w + 7} y={y + 17} className="fig-val">{t.rows}</text>
          </Fragment>
        );
      })}

      <line x1={F2_LABEL_W} y1={F2_TOP} x2={F2_LABEL_W} y2={F2_ROWS_END} className="fig-axis" />
    </svg>
  );
}

// The legend lives in HTML, not in the SVG: three variable-length labels laid out
// at fixed viewBox coordinates collide the moment the copy changes.
function EvidenceLegend() {
  return (
    <ul className="fig-legend">
      {(["bound", "gap", "outside"] as Family[]).map((f) => (
        <li key={f}>
          <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
            <defs>
              <pattern id={`fig-legend-hatch-${f}`} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill="transparent" />
                <line x1="0" y1="0" x2="0" y2="6" className="fig-hatch-line" />
              </pattern>
            </defs>
            <rect
              width="12"
              height="12"
              className={f === "outside" ? "fig-mark-outside-legend" : markClass(f)}
              fill={f === "outside" ? `url(#fig-legend-hatch-${f})` : undefined}
            />
          </svg>
          {FAMILY_LABEL[f]}
        </li>
      ))}
    </ul>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export default function ClaimIndexFigures() {
  return (
    <section className="report-figs claim-figs" aria-label="Arc I claim index — the door cost and the shape of the evidence">
      <h2 className="report-figs-title">Two pictures of the same ledger</h2>
      <p className="claim-figs-lede">
        Both figures replot values that already appear below. The first is the most-cited
        number Arc I has shipped; the second counts how the rest of the inventory actually
        landed. Neither introduces a measurement.
      </p>

      <div className="fig-charts fig-charts-stack">
        <figure className="fig-card">
          <figcaption id="fig-door">What the door costs · tokens per turn</figcaption>
          <DoorCostFigure />
          <p className="fig-foot">
            Drawn from zero, so the honest reading comes first: the two floors are
            <b> almost the same bar</b>. Ledger records 11 and 12, claude 2.1.216, probed
            2026-07-24. The pink sliver is the signed delta between them &mdash; it needs no
            record of its own.
          </p>
        </figure>

        <figure className="fig-card">
          <figcaption id="fig-shape">Where the evidence sits · claim rows by status</figcaption>
          <EvidenceShapeFigure />
          <EvidenceLegend />
          <p className="fig-foot">
            Twenty-one of the twenty-two rows below carry a figure and are tallied here; A6
            carries none. Ten trace to a committed record, nine are <b>declared gaps</b>, two
            belong to another program. A page whose gaps outnumbered its records would still
            be honest &mdash; that is the point of counting them in public.
          </p>
        </figure>
      </div>
    </section>
  );
}
