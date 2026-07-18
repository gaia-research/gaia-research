import { describe, expect, it } from "vitest";
import { parseMilimQaQuery, resolveMilimQaRuntimeMode } from "./milim-qa";

describe("Phase 2 Milim QA query", () => {
  it("uses the compatibility-2 tracer and neutral expression by default", () => {
    expect(parseMilimQaQuery(new URLSearchParams())).toEqual({ scene: "milim-splash-v1", expression: "neutral", motion: "idle", mode: "live" });
  });

  it("admits only the Phase 2 tracer vocabulary", () => {
    expect(parseMilimQaQuery(new URLSearchParams("expression=joyful-winker&mode=fallback"))).toEqual({ scene: "milim-splash-v1", expression: "joyful-winker", motion: "idle", mode: "fallback" });
    expect(parseMilimQaQuery(new URLSearchParams("scene=unpromoted&expression=starry-awe&motion=greet&mode=debug"))).toEqual({ scene: "milim-splash-v1", expression: "neutral", motion: "idle", mode: "live" });
  });

  it("runs the missing-release probe through the live loader path", () => {
    expect(resolveMilimQaRuntimeMode("missing-release")).toBe("live");
    expect(resolveMilimQaRuntimeMode("fallback")).toBe("fallback");
  });
});
