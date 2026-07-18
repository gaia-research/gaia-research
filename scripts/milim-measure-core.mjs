export function installMilimFrameProbe() {
  const probe = {
    requested: 0,
    executed: 0,
    cancelled: 0,
    lastTimestamp: null,
    intervals: [],
  };
  Object.defineProperty(window, "__MILIM_FRAME_PROBE__", { value: probe, configurable: true });
  const originalRequest = window.requestAnimationFrame.bind(window);
  const originalCancel = window.cancelAnimationFrame.bind(window);
  const ownedFrames = new Set();

  window.requestAnimationFrame = (callback) => {
    const ownedByMilim = (new Error().stack ?? "").includes("/milim/releases/");
    let frameId = 0;
    frameId = originalRequest((timestamp) => {
      if (ownedByMilim) {
        ownedFrames.delete(frameId);
        probe.executed += 1;
        if (probe.lastTimestamp !== null) probe.intervals.push(timestamp - probe.lastTimestamp);
        probe.lastTimestamp = timestamp;
      }
      callback(timestamp);
    });
    if (ownedByMilim) {
      ownedFrames.add(frameId);
      probe.requested += 1;
    }
    return frameId;
  };

  window.cancelAnimationFrame = (frameId) => {
    if (ownedFrames.delete(frameId)) probe.cancelled += 1;
    originalCancel(frameId);
  };
}

export function installMilimLongTaskProbe() {
  window.__MILIM_LONG_TASKS__ = [];
  if (typeof PerformanceObserver !== "function") return;
  try {
    const observer = new PerformanceObserver((list) => {
      window.__MILIM_LONG_TASKS__.push(...list.getEntries().map((entry) => entry.duration));
    });
    observer.observe({ type: "longtask", buffered: true });
  } catch {}
}

export function describeInactiveFrames(before, after, observationMs) {
  const playerFramesExecuted = Math.max(0, after.executed - before.executed);
  return { observationMs, playerFramesExecuted, inactive: playerFramesExecuted === 0 };
}

export function summarize(values) {
  if (values.length === 0) return { count: 0, p50: 0, p95: 0 };
  const sorted = [...values].sort((left, right) => left - right);
  const percentile = (fraction) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
  return { count: sorted.length, p50: percentile(0.5), p95: percentile(0.95) };
}
