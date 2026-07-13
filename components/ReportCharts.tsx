import { Fragment } from "react";

// Static, server-rendered visual aids for the CI-Churn postmortem. No client
// JS — the page stays a static prerender. Every plotted value is also printed
// directly on the mark and stated in the prose, so nothing is gated behind
// interaction (this is a report, not a dashboard).
//
// All figures are drawn verbatim from the postmortem's own tables:
//   §2 / Figure 5  — CI rounds and estimated token cost per failure wave
//   §2.3 / §7      — ~24h of site-served 404s; Wave 2 has 0 billable rounds
// Palette is the site's committed brand set (Rimuru Blue / Milim Pink); the
// blue↔pink pair validates at CVD ΔE 29.3 (dataviz validator, dark surface).

const BLUE = "#38bdf8";
const PINK = "#ec4899";

type Bar = { label: string; value: number | null; note?: string; emphasis?: boolean };

const stats = [
  { value: "10", label: "counted CI failure rounds", sub: "across four waves" },
  { value: "~24h", label: "site served 404s", sub: "silent — no red in the UI" },
  { value: "~$3.60–4.00", label: "direct token spend", sub: "excl. unmeasured Mode 3" },
  { value: "0", label: "billable rounds", sub: "for the most damaging wave", emphasis: true },
];

const rounds: Bar[] = [
  { label: "Wave 0", value: 7, note: "pre-merge" },
  { label: "Wave 1", value: 2, note: "PR #793" },
  { label: "Wave 2", value: 0, note: "silent", emphasis: true },
  { label: "Wave 3", value: 1, note: "PR #800" },
];

const costs: Bar[] = [
  { label: "Wave 0", value: 1.9 },
  { label: "Wave 1", value: 3.35 },
  { label: "Wave 2", value: null, note: "unmeasured", emphasis: true },
  { label: "Wave 3", value: 0.25 },
];

// ── Column chart ────────────────────────────────────────────────────────────
// viewBox space; container scales it responsively.
const W = 440;
const H = 300;
const PL = 40;
const PR = 20;
const PT = 26;
const PB = 64;
const plotW = W - PL - PR;
const plotH = H - PT - PB;
const baseY = PT + plotH;
const BAR = 26;

function colPath(x: number, y: number, w: number, r: number) {
  // Rounded top corners, square at the baseline.
  return `M${x},${baseY} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${baseY} Z`;
}

function ColumnChart({
  data,
  axisMax,
  ticks,
  fmt,
  fmtTick,
  captionId,
}: {
  data: Bar[];
  axisMax: number;
  ticks: number[];
  fmt: (v: number) => string;
  fmtTick: (v: number) => string;
  captionId: string;
}) {
  const slot = plotW / data.length;
  const y = (v: number) => baseY - (v / axisMax) * plotH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={captionId} className="fig-svg">
      <defs>
        <pattern id={`hatch-${captionId}`} width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="7" stroke={PINK} strokeWidth="2" strokeOpacity="0.55" />
        </pattern>
      </defs>

      {/* gridlines + y ticks (hairline, solid, recessive) */}
      {ticks.map((t) => (
        <Fragment key={t}>
          <line x1={PL} y1={y(t)} x2={W - PR} y2={y(t)} className="fig-grid" />
          <text x={PL - 8} y={y(t)} className="fig-tick" textAnchor="end" dominantBaseline="middle">{fmtTick(t)}</text>
        </Fragment>
      ))}

      {data.map((d, i) => {
        const cx = PL + slot * i + slot / 2;
        const x = cx - BAR / 2;
        const color = d.emphasis ? PINK : BLUE;
        return (
          <Fragment key={d.label}>
            {d.value === null ? (
              // Unmeasured: a full-height hatched ghost column topped with "?"
              <>
                <path d={colPath(x, y(axisMax), BAR, 4)} fill={`url(#hatch-${captionId})`} stroke={PINK} strokeOpacity="0.7" strokeWidth="1" />
                <text x={cx} y={y(axisMax) - 8} className="fig-val emph" textAnchor="middle">?</text>
              </>
            ) : d.value === 0 ? (
              // Silent / zero: a baseline tick + label instead of an invisible bar
              <>
                <line x1={x} y1={baseY} x2={x + BAR} y2={baseY} stroke={color} strokeWidth="3" strokeLinecap="round" />
                <text x={cx} y={baseY - 10} className="fig-val emph" textAnchor="middle">0</text>
              </>
            ) : (
              <>
                <path d={colPath(x, y(d.value), BAR, 4)} fill={color} />
                <text x={cx} y={y(d.value) - 9} className={`fig-val${d.emphasis ? " emph" : ""}`} textAnchor="middle">{fmt(d.value)}</text>
              </>
            )}
            <text x={cx} y={baseY + 22} className="fig-xlabel" textAnchor="middle">{d.label}</text>
            {d.note && <text x={cx} y={baseY + 40} className="fig-xnote" textAnchor="middle">{d.note}</text>}
          </Fragment>
        );
      })}

      {/* baseline / axis */}
      <line x1={PL} y1={baseY} x2={W - PR} y2={baseY} className="fig-axis" />
    </svg>
  );
}

export default function ReportCharts() {
  return (
    <section className="report-figs" aria-label="Epic #780 CI Churn — by the numbers">
      <h2 className="report-figs-title">By the numbers</h2>

      <div className="fig-stats">
        {stats.map((s) => (
          <div className={`fig-stat${s.emphasis ? " emph" : ""}`} key={s.label}>
            <span className="fig-stat-val">{s.value}</span>
            <span className="fig-stat-label">{s.label}</span>
            <span className="fig-stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="fig-charts">
        <figure className="fig-card">
          <figcaption id="fig-rounds">CI failure rounds by wave</figcaption>
          <ColumnChart
            data={rounds}
            axisMax={8}
            ticks={[0, 2, 4, 6, 8]}
            fmt={(v) => `${v}`}
            fmtTick={(v) => `${v}`}
            captionId="fig-rounds"
          />
          <p className="fig-foot">Wave 2 failed silently — it produced <b>no billable round at all</b>, yet caused the most damage.</p>
        </figure>

        <figure className="fig-card">
          <figcaption id="fig-cost">Estimated direct token cost by wave</figcaption>
          <ColumnChart
            data={costs}
            axisMax={4}
            ticks={[0, 1, 2, 3, 4]}
            fmt={(v) => `$${v.toFixed(2)}`}
            fmtTick={(v) => `$${v}`}
            captionId="fig-cost"
          />
          <p className="fig-foot">Wave 2 (Mode 3) carries <b>no token cost the ledger can see</b> — the measurement gap this postmortem is about.</p>
        </figure>
      </div>
    </section>
  );
}
