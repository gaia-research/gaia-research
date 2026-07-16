export type MilimSampleSummary = { count: number; p50: number; p95: number };

/** Nearest-rank summaries for frame/startup samples collected outside WebGL. */
export function summarizeMilimSamples(samples: readonly number[]): MilimSampleSummary {
  if (samples.length === 0) return { count: 0, p50: 0, p95: 0 };
  const sorted = [...samples].sort((left, right) => left - right);
  const at = (percentile: number) => sorted[Math.min(sorted.length - 1, Math.ceil(percentile * sorted.length) - 1)];
  return { count: sorted.length, p50: at(0.5), p95: at(0.95) };
}
