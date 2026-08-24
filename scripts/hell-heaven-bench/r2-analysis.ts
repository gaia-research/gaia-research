import { readFileSync } from "node:fs";
import { validateRecord, type LedgerRecord } from "./ledger.ts";
const RUNGS = ["zero", "low", "med", "high", "xhigh", "max"] as const;
const entropy: Record<string, number> = { zero: 0, low: 1, med: 2, high: 3, xhigh: 4, max: 5 };
const avg = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
/** Wilson score interval, bounded to [0,1], for binary endpoint proportions. */
export function binomialCi(successes: number, n: number): [number, number] { if (!n) return [null as any, null as any]; const z = 1.96, p = successes / n, d = 1 + z * z / n; const c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; return [Math.max(0, c - h), Math.min(1, c + h)]; }
const deltaCi = (xs: number[]): [number, number] => { if (!xs.length) return [null as any, null as any]; const m = avg(xs)!; if (xs.length === 1) return [m, m]; const s = Math.sqrt(xs.reduce((x, y) => x + (y - m) ** 2, 0) / (xs.length - 1)); const h = 1.96 * s / Math.sqrt(xs.length); return [m - h, m + h]; };
function rungOf(r: LedgerRecord, metadata: Record<string, string> | undefined) { return (r as any).rung ?? metadata?.[`${r.task}:${r.arm}:${r.repeatIndex}`] ?? ({ placebo: "zero", heaven: "low", hell: "high", ultra: "max" } as any)[r.arm]; }
export function analyse(rs: LedgerRecord[], predictions: Record<string, boolean> = {}, metadata?: { rungs?: Record<string, string> }) {
  rs.forEach(validateRecord); const groups: Record<string, LedgerRecord[]> = {}; for (const r of rs) (groups[r.arm] ??= []).push(r);
  const out: any = { schema: "hh-r2-analysis/v1", groups: {}, pairedDeltas: {}, entropyCurve: RUNGS.map(rung => ({ rung, entropy: entropy[rung], quality: null, qualityCi95: [null, null], n: 0 })), correlation: { n: 0, pearson: null }, confusionMatrix: { tp: 0, fp: 0, tn: 0, fn: 0 } };
  for (const [arm, rows] of Object.entries(groups)) { const q = rows.flatMap(r => r.objectiveEndpoint.pass === null ? [] : [r.objectiveEndpoint.pass ? 1 : 0]); out.groups[arm] = { n: rows.length, quality: avg(q), qualityCi95: binomialCi(q.reduce((a, b) => a + b, 0), q.length), standing: avg(rows.flatMap(r => r.tokens.skillStanding === null ? [] : [r.tokens.skillStanding])), invocation: avg(rows.flatMap(r => r.tokens.skillInvocation === null ? [] : [r.tokens.skillInvocation])), wholeSession: avg(rows.flatMap(r => r.tokens.perTurn === null ? [] : [r.tokens.perTurn])), wallClockMs: avg(rows.map(r => r.wallClockMs)) }; }
  for (const rung of RUNGS) { const rows = rs.filter(r => rungOf(r, metadata?.rungs) === rung), q = rows.flatMap(r => r.objectiveEndpoint.pass === null ? [] : [r.objectiveEndpoint.pass ? 1 : 0]); const e = out.entropyCurve.find((x: any) => x.rung === rung); e.n = q.length; e.quality = avg(q); e.qualityCi95 = binomialCi(q.reduce((a, b) => a + b, 0), q.length); }
  const byPair = new Map<string, LedgerRecord[]>(); for (const r of rs) (byPair.get(`${r.task}:${r.repeatIndex}`) ?? (byPair.set(`${r.task}:${r.repeatIndex}`, []), byPair.get(`${r.task}:${r.repeatIndex}`)!)).push(r);
  for (const [, rows] of byPair) {
    const p = rows.find(r => r.arm === "placebo" && r.objectiveEndpoint.pass !== null);
    if (!p) continue;
    for (const t of rows.filter(r => r.arm !== "placebo" && r.objectiveEndpoint.pass !== null)) {
      const rung = rungOf(t, metadata?.rungs);
      (out.pairedDeltas[rung] ??= []).push((t.objectiveEndpoint.pass ? 1 : 0) - (p.objectiveEndpoint.pass ? 1 : 0));
    }
  }
  for (const rung of Object.keys(out.pairedDeltas)) { const d = out.pairedDeltas[rung]; out.pairedDeltas[rung] = { n: d.length, mean: avg(d), ci95: deltaCi(d) }; }
  const taskOutcomes = new Map<string, number[]>(); for (const r of rs) if (r.arm !== "placebo" && r.objectiveEndpoint.pass !== null) (taskOutcomes.get(r.task) ?? (taskOutcomes.set(r.task, []), taskOutcomes.get(r.task)!)).push(r.objectiveEndpoint.pass ? 1 : 0);
  const pairs = [...taskOutcomes].filter(([task]) => predictions[task] !== undefined).map(([task, ys]) => [predictions[task] ? 1 : 0, avg(ys)!]); out.correlation.n = pairs.length;
  if (pairs.length > 1) { const ma = avg(pairs.map(x => x[0]))!, mb = avg(pairs.map(x => x[1]))!, da = Math.sqrt(pairs.reduce((s, x) => s + (x[0] - ma) ** 2, 0)), db = Math.sqrt(pairs.reduce((s, x) => s + (x[1] - mb) ** 2, 0)); out.correlation.pearson = da && db ? pairs.reduce((s, x) => s + (x[0] - ma) * (x[1] - mb), 0) / (da * db) : null; }
  return out;
}
export const readLedger = (p: string) => readFileSync(p, "utf8").split("\n").filter(Boolean).map(x => JSON.parse(x) as LedgerRecord);
