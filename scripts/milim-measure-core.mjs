export const FRAME_INTERVAL_BUDGET_MS = Object.freeze({ desktop: 18.4, mobile: 36.7 });

export function summarize(samples) {
  const ordered = [...samples].filter(Number.isFinite).sort((a, b) => a - b);
  if (ordered.length === 0) return { count: 0, p50: null, p95: null };
  return {
    count: ordered.length,
    p50: quantile(ordered, 0.5),
    p95: quantile(ordered, 0.95),
  };
}

/** A frame result can only pass when it has a complete sample and both percentiles are within budget. */
export function evaluateFrameBudget(samples, budgetMs) {
  const summary = summarize(samples);
  return {
    ...summary,
    budgetMs,
    ok: summary.count > 0 && summary.p50 !== null && summary.p95 !== null && summary.p50 <= budgetMs && summary.p95 <= budgetMs,
  };
}

function quantile(sorted, percentile) {
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * percentile) - 1)];
}
