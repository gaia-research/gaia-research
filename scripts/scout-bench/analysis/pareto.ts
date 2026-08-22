// Scout Benchmark Analysis: Pareto Frontier Computation & SVG Chart Generation
//
// Computes the Cost vs. F2 Quality Pareto Frontier across architectures A, B, C, D.
// Generates self-contained, responsive SVG visualization for blog and reports.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_LEDGER_FILE, readLedger, type ScoutBenchRecord } from "../ledger";
import { type AggregateStats, computeSummary } from "./summary";

export interface ParetoPoint {
  configLabel: string;
  architecture: string;
  k: number;
  costUSD: number;
  f2Score: number;
  recall: number;
  precision: number;
  isParetoOptimal: boolean;
}

export function computeParetoFrontier(stats: AggregateStats[]): ParetoPoint[] {
  const points: ParetoPoint[] = stats.map((s) => ({
    configLabel: `${s.architecture} (K=${s.k})`,
    architecture: s.architecture,
    k: s.k,
    costUSD: s.costTotalMean,
    f2Score: s.f2Mean,
    recall: s.recallMean,
    precision: s.precisionMean,
    isParetoOptimal: true,
  }));

  // Determine Pareto optimality: a point is dominated if another point has <= cost AND >= F2 (with at least one strict inequality)
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const pi = points[i];
      const pj = points[j];

      // If pj strictly dominates pi
      if (
        (pj.costUSD < pi.costUSD && pj.f2Score >= pi.f2Score) ||
        (pj.costUSD <= pi.costUSD && pj.f2Score > pi.f2Score)
      ) {
        pi.isParetoOptimal = false;
        break;
      }
    }
  }

  return points;
}

export function generateParetoSVG(points: ParetoPoint[], width = 800, height = 480): string {
  const padding = { top: 60, right: 60, bottom: 60, left: 80 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Extents
  const minCost = 0;
  const maxCost = Math.max(...points.map((p) => p.costUSD)) * 1.15 || 0.03;
  const minF2 = 0.4;
  const maxF2 = 1.0;

  const scaleX = (val: number) => padding.left + ((val - minCost) / (maxCost - minCost)) * chartW;
  const scaleY = (val: number) => padding.top + chartH - ((val - minF2) / (maxF2 - minF2)) * chartH;

  // Color mapping by architecture
  const colors: Record<string, string> = {
    A: "#38bdf8", // Rimuru Blue
    B: "#94a3b8", // Slate
    C: "#ec4899", // Milim Pink
    D: "#a855f7", // Purple
  };

  // Pareto frontier line path
  const paretoPoints = points
    .filter((p) => p.isParetoOptimal)
    .sort((a, b) => a.costUSD - b.costUSD);

  let paretoPathD = "";
  paretoPoints.forEach((p, idx) => {
    const x = scaleX(p.costUSD).toFixed(1);
    const y = scaleY(p.f2Score).toFixed(1);
    paretoPathD += `${idx === 0 ? "M" : "L"} ${x} ${y} `;
  });

  // Grid lines
  let gridLines = "";
  for (let f = 0.4; f <= 1.01; f += 0.1) {
    const y = scaleY(f).toFixed(1);
    gridLines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />`;
    gridLines += `<text x="${padding.left - 12}" y="${(Number(y) + 4).toFixed(1)}" fill="#94a3b8" font-size="11" text-anchor="end" font-family="monospace">${f.toFixed(1)}</text>`;
  }

  for (let c = 0; c <= maxCost; c += maxCost / 5) {
    const x = scaleX(c).toFixed(1);
    gridLines += `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />`;
    gridLines += `<text x="${x}" y="${height - padding.bottom + 20}" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="monospace">$${c.toFixed(4)}</text>`;
  }

  // Render points
  const pointsSVG = points
    .map((p) => {
      const cx = scaleX(p.costUSD).toFixed(1);
      const cy = scaleY(p.f2Score).toFixed(1);
      const col = colors[p.architecture] || "#fff";
      const r = p.isParetoOptimal ? 7 : 5;
      const stroke = p.isParetoOptimal ? "#ffffff" : "#475569";
      const strokeWidth = p.isParetoOptimal ? "2" : "1";
      const opacity = p.isParetoOptimal ? "1" : "0.5";

      return `
      <g opacity="${opacity}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" stroke="${stroke}" stroke-width="${strokeWidth}">
          <title>${p.configLabel}: F2=${p.f2Score.toFixed(3)}, Cost=$${p.costUSD.toFixed(5)} (${p.isParetoOptimal ? "Pareto Frontier" : "Dominated"})</title>
        </circle>
        <text x="${cx}" y="${(Number(cy) - 10).toFixed(1)}" fill="${col}" font-size="11" font-weight="${p.isParetoOptimal ? "bold" : "normal"}" text-anchor="middle" font-family="system-ui, sans-serif">${p.configLabel}</text>
      </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: #0f172a; border-radius: 8px; font-family: system-ui, sans-serif;">
  <style>
    .title { font-weight: bold; fill: #f8fafc; font-size: 16px; }
    .subtitle { fill: #94a3b8; font-size: 12px; }
    .axis-label { fill: #cbd5e1; font-size: 12px; font-weight: 500; }
  </style>

  <!-- Title & Subtitle -->
  <text x="${width / 2}" y="30" class="title" text-anchor="middle">Scout Fan-Out Cost vs. F2 Quality Pareto Frontier</text>
  <text x="${width / 2}" y="48" class="subtitle" text-anchor="middle">Gold Opus-4 Evaluated · 9 Tasks × N Repeats</text>

  <!-- Grid -->
  ${gridLines}

  <!-- Axes -->
  <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#64748b" stroke-width="2" />
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#64748b" stroke-width="2" />

  <!-- Axis Labels -->
  <text x="${width / 2}" y="${height - 15}" class="axis-label" text-anchor="middle">Total Cost (USD / Task Run)</text>
  <text x="25" y="${height / 2}" class="axis-label" text-anchor="middle" transform="rotate(-90 25 ${height / 2})">Quality (F2 Score)</text>

  <!-- Pareto Frontier Path -->
  ${
    paretoPathD
      ? `<path d="${paretoPathD}" fill="none" stroke="#ec4899" stroke-width="2.5" stroke-dasharray="4,4" opacity="0.8" />`
      : ""
  }

  <!-- Data Points -->
  ${pointsSVG}

  <!-- Legend -->
  <g transform="translate(${width - padding.right - 220}, ${padding.top + 10})">
    <rect width="210" height="90" fill="#1e293b" rx="6" stroke="#334155" />
    <circle cx="15" cy="18" r="5" fill="#38bdf8" />
    <text x="28" y="22" fill="#cbd5e1" font-size="11">Arch A: Single Flash 3.7</text>
    <circle cx="15" cy="38" r="5" fill="#94a3b8" />
    <text x="28" y="42" fill="#cbd5e1" font-size="11">Arch B: Single Lite 3.5</text>
    <circle cx="15" cy="58" r="5" fill="#ec4899" />
    <text x="28" y="62" fill="#cbd5e1" font-size="11">Arch C: Parallel Lite (K=3..6)</text>
    <circle cx="15" cy="78" r="5" fill="#a855f7" />
    <text x="28" y="82" fill="#cbd5e1" font-size="11">Arch D: Cascaded Funnel</text>
  </g>
</svg>`;
}

function runCli(): void {
  const args = process.argv.slice(2);
  let file = DEFAULT_LEDGER_FILE;
  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    file = args[fileIdx + 1];
  }

  const records = readLedger(file);
  if (records.length === 0) {
    console.log(`No records found in ${file}`);
    process.exit(0);
  }

  const stats = computeSummary(records);
  const points = computeParetoFrontier(stats);

  console.log("\n### Pareto Frontier Analysis\n");
  console.table(
    points.map((p) => ({
      Architecture: p.architecture,
      K: p.k,
      "Cost ($)": `$${p.costUSD.toFixed(5)}`,
      F2: p.f2Score.toFixed(4),
      Recall: `${(p.recall * 100).toFixed(1)}%`,
      Precision: `${(p.precision * 100).toFixed(1)}%`,
      "Pareto Optimal": p.isParetoOptimal ? "★ YES" : "no",
    })),
  );

  const outSvgIdx = args.indexOf("--svg");
  if (outSvgIdx !== -1 && args[outSvgIdx + 1]) {
    const svgPath = args[outSvgIdx + 1];
    const svg = generateParetoSVG(points);
    writeFileSync(svgPath, svg, "utf-8");
    console.log(`\n✓ Exported Pareto chart SVG to ${svgPath}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli();
}
