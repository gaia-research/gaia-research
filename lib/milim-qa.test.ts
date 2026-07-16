import { describe, expect, it } from "vitest";
import { parseMilimQaQuery } from "./milim-qa";

describe("parseMilimQaQuery", () => {
  it("uses the approved public scene and neutral review defaults", () => {
    expect(parseMilimQaQuery(new URLSearchParams())).toEqual({
      scene: "cyber-slime-lab-v1",
      expression: "neutral",
      motion: "idle",
      mode: "live",
      autoplay: false,
      measure: false,
    });
  });

  it("accepts only the declared QA query vocabulary", () => {
    expect(
      parseMilimQaQuery(new URLSearchParams("scene=slime-reactor-halo-v1&expression=starry-awe&motion=point&mode=fallback&autoplay=1&measure=1")),
    ).toEqual({
      scene: "slime-reactor-halo-v1",
      expression: "starry-awe",
      motion: "point",
      mode: "fallback",
      autoplay: true,
      measure: true,
    });
  });

  it("discards unknown keys and invalid values deterministically", () => {
    expect(
      parseMilimQaQuery(new URLSearchParams("scene=unpromoted&expression=oops&motion=wave&mode=debug&autoplay=yes&measure=true&unsafe=1")),
    ).toEqual({
      scene: "cyber-slime-lab-v1",
      expression: "neutral",
      motion: "idle",
      mode: "live",
      autoplay: false,
      measure: false,
    });
  });
});
