// Scout Benchmark Analysis: Summary & Aggregate Statistics
//
// Calculates aggregate performance metrics, cost efficiency, flake rates,
// and cache hit ratios across experimental runs in the ledger.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_LEDGER_FILE,
  type Architecture,
  readLedger,
  type ScoutBenchRecord,
} from "../ledger";

export interface AggregateStats {
  architecture: Architecture;
  k: number;
  count: number;
  recallMean: number;
  recallStd: number;
  precisionMean: number;
  precisionStd: number;
  f2Mean: number;
  f2Std: number; // Flake rate
  costScoutsMean: number;
  costTotalMean: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  cacheHitRatio: number;
  costEfficiency: number; // F2 / costTotalMean
}

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function stdDev(arr: number[], m?: number): number {
  if (arr.length <= 1) return 0;
  const avg = m ?? mean(arr);
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  const weight = idx - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function computeSummary(records: ScoutBenchRecord[]): AggregateStats[] {
  // Group by (architecture, K)
  const groups = new Map<string, ScoutBenchRecord[]>();

  for (const r of records) {
    const key = `${r.architecture}-K${r.archConfig.K}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  }

  const results: AggregateStats[] = [];

  for (const [key, group] of groups.entries()) {
    const arch = group[0].architecture;
    const k = group[0].archConfig.K;
    const count = group.length;

    const recalls = group.map((g) => g.results.recall);
    const precisions = group.map((g) => g.results.precision);
    const f2s = group.map((g) => g.results.f2Score);
    const costsScout = group.map((g) => g.costUSD.scouts);
    const costsTotal = group.map((g) => g.costUSD.total);
    const latencies = group.map((g) => g.wallClockMs.totalE2E);

    const rMean = mean(recalls);
    const pMean = mean(precisions);
    const f2Mean = mean(f2s);
    const f2Std = stdDev(f2s, f2Mean);
    const scoutCostMean = mean(costsScout);
    const totalCostMean = mean(costsTotal);

    let totalScoutInput = 0;
    let totalScoutCacheRead = 0;
    for (const g of group) {
      totalScoutInput += g.tokens.scoutInputTotal;
      totalScoutCacheRead += g.tokens.scoutCacheReadTotal;
    }
    const cacheHitRatio = totalScoutInput > 0 ? totalScoutCacheRead / totalScoutInput : 0;
    const costEfficiency = totalCostMean > 0 ? f2Mean / totalCostMean : 0;

    results.push({
      architecture: arch,
      k,
      count,
      recallMean: Number(rMean.toFixed(4)),
      recallStd: Number(stdDev(recalls, rMean).toFixed(4)),
      precisionMean: Number(pMean.toFixed(4)),
      precisionStd: Number(stdDev(precisions, pMean).toFixed(4)),
      f2Mean: Number(f2Mean.toFixed(4)),
      f2Std: Number(f2Std.toFixed(4)),
      costScoutsMean: Number(scoutCostMean.toFixed(6)),
      costTotalMean: Number(totalCostMean.toFixed(6)),
      latencyP50Ms: Math.round(percentile(latencies, 50)),
      latencyP95Ms: Math.round(percentile(latencies, 95)),
      cacheHitRatio: Number(cacheHitRatio.toFixed(4)),
      costEfficiency: Number(costEfficiency.toFixed(2)),
    });
  }

  // Sort by architecture order, then K
  const archOrder = ["A", "B", "C", "D"];
  results.sort((a, b) => {
    const aOrder = archOrder.indexOf(a.architecture);
    const bOrder = archOrder.indexOf(b.architecture);
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.k - b.k;
  });

  return results;
}

export function formatMarkdownTable(stats: AggregateStats[]): string {
  const headers = [
    "Arch",
    "K",
    "N",
    "Recall (std)",
    "Precision (std)",
    "F2 (flake σ)",
    "Scout Cost ($)",
    "Total Cost ($)",
    "p50 (ms)",
    "Cache %",
    "F2/$",
  ];
  const divider = [
    ":---",
    ":---:",
    ":---:",
    "---:",
    "---:",
    "---:",
    "---:",
    "---:",
    "---:",
    "---:",
    "---:",
  ];

  const rows = stats.map((s) => [
    s.architecture,
    s.k.toString(),
    s.count.toString(),
    `${(s.recallMean * 100).toFixed(1)}% (±${(s.recallStd * 100).toFixed(1)})`,
    `${(s.precisionMean * 100).toFixed(1)}% (±${(s.precisionStd * 100).toFixed(1)})`,
    `${s.f2Mean.toFixed(3)} (±${s.f2Std.toFixed(3)})`,
    `$${s.costScoutsMean.toFixed(5)}`,
    `$${s.costTotalMean.toFixed(5)}`,
    `${s.latencyP50Ms}ms`,
    `${(s.cacheHitRatio * 100).toFixed(1)}%`,
    `${s.costEfficiency.toFixed(0)}`,
  ]);

  const all = [headers, divider, ...rows];
  return all.map((r) => `| ${r.join(" | ")} |`).join("\n");
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
  console.log(`\n### Scout Benchmark Summary (${records.length} runs)\n`);
  console.log(formatMarkdownTable(stats));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli();
}
