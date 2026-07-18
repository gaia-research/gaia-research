import assert from "node:assert/strict";
import test from "node:test";
import { describeInactiveFrames, summarize } from "../scripts/milim-measure-core.mjs";

test("summarize reports deterministic p50 and p95 values", () => {
  assert.deepEqual(summarize([5, 1, 4, 2, 3]), { count: 5, p50: 3, p95: 5 });
});

test("inactive frame evidence uses player-owned executed frame deltas", () => {
  assert.deepEqual(describeInactiveFrames({ executed: 81 }, { executed: 81 }, 500), {
    observationMs: 500,
    playerFramesExecuted: 0,
    inactive: true,
  });
  assert.equal(describeInactiveFrames({ executed: 81 }, { executed: 82 }, 500).inactive, false);
});
