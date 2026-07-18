import { describe, expect, it } from "vitest";
import { parseMilimQaQuery } from "./milim-qa";

describe("Phase 2 Milim QA query", () => {
  it("uses the compatibility-2 tracer and neutral expression by default", () => {
    expect(parseMilimQaQuery(new URLSearchParams())).toEqual({ scene: "cyber-slime-lab-v2", expression: "neutral", motion: "idle", mode: "live" });
  });

  it("admits only the Phase 2 tracer vocabulary", () => {
    expect(parseMilimQaQuery(new URLSearchParams("expression=joyful-winker&mode=fallback"))).toEqual({ scene: "cyber-slime-lab-v2", expression: "joyful-winker", motion: "idle", mode: "fallback" });
    expect(parseMilimQaQuery(new URLSearchParams("scene=unpromoted&expression=starry-awe&motion=greet&mode=debug"))).toEqual({ scene: "cyber-slime-lab-v2", expression: "neutral", motion: "idle", mode: "live" });
  });
});
