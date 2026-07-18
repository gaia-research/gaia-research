export const FRAME_INTERVAL_BUDGET_MS = Object.freeze({ desktop: 18.4, mobile: 36.7 });

export const MEASUREMENT_PROFILES = Object.freeze({
  desktop: Object.freeze({
    name: "desktop-browser",
    environment: "headless Chromium desktop browser",
    realDevice: false,
    targetFps: 60,
    budgetMs: FRAME_INTERVAL_BUDGET_MS.desktop,
    context: Object.freeze({
      viewport: Object.freeze({ width: 1280, height: 900 }),
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
    }),
  }),
  mobile: Object.freeze({
    name: "emulated-mobile-browser",
    environment: "headless Chromium mobile emulation, not a physical device",
    realDevice: false,
    targetFps: 30,
    budgetMs: FRAME_INTERVAL_BUDGET_MS.mobile,
    context: Object.freeze({
      viewport: Object.freeze({ width: 390, height: 844 }),
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    }),
  }),
});

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
