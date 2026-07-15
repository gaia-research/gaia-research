import { describe, expect, it, vi } from "vitest";
import { captureHeroTransitionFrame } from "./milim-transition";

describe("captureHeroTransitionFrame", () => {
  it("uses a player-supplied character-only frame for the pet handoff", () => {
    const canvas = {
      dataset: {
        live: "shown",
        transitionFrame: "data:image/png;base64,character-only",
      },
      width: 940,
      height: 1360,
    };
    const stage = { querySelector: vi.fn(() => canvas) };

    expect(
      captureHeroTransitionFrame(stage as never, "/fallback.webp"),
    ).toBe("data:image/png;base64,character-only");
  });

  it("keeps the static source while the player canvas is hidden", () => {
    const canvas = {
      dataset: { live: "hidden" },
      width: 940,
      height: 1360,
    };
    const stage = { querySelector: vi.fn(() => canvas) };

    expect(
      captureHeroTransitionFrame(stage as never, "/fallback.webp"),
    ).toBe("/fallback.webp");
  });

  it("falls back rather than flying the composed scene canvas", () => {
    const canvas = {
      dataset: { live: "shown" },
      width: 940,
      height: 1360,
    };
    const stage = { querySelector: vi.fn(() => canvas) };

    expect(
      captureHeroTransitionFrame(stage as never, "/fallback.webp"),
    ).toBe("/fallback.webp");
  });
});
