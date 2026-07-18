import { describe, expect, it, vi } from "vitest";
import {
  createCoalescedMilimPointerDriver,
  resolveMilimRunning,
  shouldMountMilimPlayer,
} from "./milim-live-runtime";

describe("Milim website runtime eligibility", () => {
  it("never mounts the player for explicit or operating-system fallbacks", () => {
    expect(shouldMountMilimPlayer("live", false)).toBe(true);
    expect(shouldMountMilimPlayer("live", true)).toBe(false);
    expect(shouldMountMilimPlayer("fallback", false)).toBe(false);
    expect(shouldMountMilimPlayer("reduced-motion", false)).toBe(false);
    expect(shouldMountMilimPlayer("missing-release", false)).toBe(false);
  });

  it("only runs when visible and the document is active", () => {
    expect(resolveMilimRunning(true, false)).toBe(true);
    expect(resolveMilimRunning(false, false)).toBe(false);
    expect(resolveMilimRunning(true, true)).toBe(false);
  });
});

describe("Milim pointer driver", () => {
  it("coalesces pointer movement and cancels pending work on cleanup", () => {
    let frame: FrameRequestCallback | undefined;
    const drive = vi.fn();
    const cancelFrame = vi.fn();
    const driver = createCoalescedMilimPointerDriver({
      element: { getBoundingClientRect: () => ({ left: 10, top: 20, width: 100, height: 200 }) } as never,
      drive,
      isActive: () => true,
      requestFrame(callback) { frame = callback; return 7; },
      cancelFrame,
    });

    driver.onPointerMove({ clientX: 30, clientY: 40 } as PointerEvent);
    driver.onPointerMove({ clientX: 90, clientY: 180 } as PointerEvent);
    frame?.(0);
    expect(drive).toHaveBeenCalledOnce();
    expect(drive.mock.calls[0][0]).toEqual({ gaze: { x: 0.6, y: 0.6 } });

    driver.onPointerMove({ clientX: 50, clientY: 70 } as PointerEvent);
    driver.destroy();
    expect(cancelFrame).toHaveBeenCalledWith(7);
  });
});
