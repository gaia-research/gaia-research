import { describe, expect, it } from "vitest";
import { summarizeMilimSamples } from "./milim-measurements";

describe("summarizeMilimSamples", () => {
  it("reports deterministic p50 and p95 values without rendering reads", () => {
    expect(summarizeMilimSamples([1, 2, 3, 4, 100])).toEqual({ count: 5, p50: 3, p95: 100 });
  });

  it("handles a single frame interval", () => {
    expect(summarizeMilimSamples([16.7])).toEqual({ count: 1, p50: 16.7, p95: 16.7 });
  });
});
