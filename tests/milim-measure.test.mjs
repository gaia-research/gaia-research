import assert from "node:assert/strict";
import test from "node:test";
import { FRAME_INTERVAL_BUDGET_MS, evaluateFrameBudget, summarize } from "../scripts/milim-measure-core.mjs";

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
