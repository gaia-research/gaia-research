import { describe, expect, it } from "vitest";
import { projectTarget } from "./target";

describe("Context Diet target projection", () => {
  it("updates projected chars and tokens from the requested target", () => {
    expect(projectTarget(10_000, 40)).toMatchObject({ appliedPct: 40, projectedChars: 6_000, projectedTokens: 1_500, tokensSaved: 1_000, clamped: false });
  });

  it("clamps 100% at the estimated protected floor", () => {
    expect(projectTarget(10_000, 100)).toMatchObject({ requestedPct: 100, appliedPct: 80, projectedChars: 2_000, projectedTokens: 500, clamped: true });
  });
});
