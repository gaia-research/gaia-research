import assert from "node:assert/strict";
import test from "node:test";
import { FRAME_INTERVAL_BUDGET_MS, MEASUREMENT_PROFILES, evaluateFrameBudget, summarize } from "../scripts/milim-measure-core.mjs";

test("summarize reports deterministic p50 and p95 values", () => {
  assert.deepEqual(summarize([5, 1, 4, 2, 3]), { count: 5, p50: 3, p95: 5 });
});

test("frame budgets reject the previously recorded six-fps interval", () => {
  const failed = evaluateFrameBudget([166.7, 200.1, 166.7], FRAME_INTERVAL_BUDGET_MS.desktop);
  assert.equal(failed.ok, false);
  assert.equal(failed.p95, 200.1);
});

test("frame budgets require a complete in-budget sample", () => {
  assert.equal(evaluateFrameBudget([], FRAME_INTERVAL_BUDGET_MS.mobile).ok, false);
  assert.equal(evaluateFrameBudget([16, 17, 18], FRAME_INTERVAL_BUDGET_MS.desktop).ok, true);
});

test("measurement profiles distinguish desktop from emulated mobile truthfully", () => {
  assert.equal(MEASUREMENT_PROFILES.desktop.targetFps, 60);
  assert.equal(MEASUREMENT_PROFILES.desktop.context.isMobile, false);
  assert.equal(MEASUREMENT_PROFILES.mobile.targetFps, 30);
  assert.equal(MEASUREMENT_PROFILES.mobile.context.isMobile, true);
  assert.equal(MEASUREMENT_PROFILES.mobile.context.hasTouch, true);
  assert.ok(MEASUREMENT_PROFILES.mobile.context.deviceScaleFactor > 1);
  assert.equal(MEASUREMENT_PROFILES.mobile.realDevice, false);
  assert.match(MEASUREMENT_PROFILES.mobile.environment, /emulat/i);
  assert.match(MEASUREMENT_PROFILES.mobile.environment, /not a physical device/i);
});
