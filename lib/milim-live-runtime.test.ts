import { describe, expect, it, vi } from "vitest";
import {
  createCoalescedMilimPointerDriver,
  isHeroVisibleAtThreshold,
  shouldMountMilimPlayer,
  resetMilimSceneState,
  reconcileMilimSceneStatus,
  requestMilimScene,
  type MilimSceneState,
} from "./milim-live-runtime";

describe("Milim runtime eligibility", () => {
  it("mounts only live mode when the operating system allows motion", () => {
    expect(shouldMountMilimPlayer("live", false)).toBe(true);
    expect(shouldMountMilimPlayer("live", true)).toBe(false);
    expect(shouldMountMilimPlayer("fallback", false)).toBe(false);
    expect(shouldMountMilimPlayer("reduced-motion", false)).toBe(false);
    expect(shouldMountMilimPlayer("missing-release", false)).toBe(false);
  });
});

const initialScene: MilimSceneState<"cyber-slime-lab-v2" | "slime-reactor-halo-v2"> = {
  activeScene: "cyber-slime-lab-v2",
  pendingScene: null,
  sceneError: null,
};

describe("Milim scene confirmation", () => {
  it("resets to the release default before a replacement player mounts", () => {
    expect(resetMilimSceneState(initialScene, "cyber-slime-lab-v2")).toEqual(initialScene);
    expect(
      resetMilimSceneState(
        { activeScene: "slime-reactor-halo-v2", pendingScene: null, sceneError: null },
        "cyber-slime-lab-v2",
      ),
    ).toEqual(initialScene);
  });

  it("keeps the confirmed scene selected until the player confirms the pending scene", () => {
    const pending = requestMilimScene(initialScene, "slime-reactor-halo-v2", { ok: true });

    expect(pending).toEqual({
      activeScene: "cyber-slime-lab-v2",
      pendingScene: "slime-reactor-halo-v2",
      sceneError: null,
    });
    expect(reconcileMilimSceneStatus(pending, { type: "scene", scene: "slime-reactor-halo-v2" })).toEqual({
      activeScene: "slime-reactor-halo-v2",
      pendingScene: null,
      sceneError: null,
    });
  });

  it("clears a pending scene and preserves the last confirmed scene on player error", () => {
    const pending = requestMilimScene(initialScene, "slime-reactor-halo-v2", { ok: true });

    expect(reconcileMilimSceneStatus(pending, { type: "error", error: { code: "MILIM_SCENE_INVALID" } })).toEqual({
      activeScene: "cyber-slime-lab-v2",
      pendingScene: null,
      sceneError: "Could not load Slime Reactor Halo.",
    });
  });
});

describe("Milim pointer driver", () => {
  it("does not read layout or drive the player while the hero is inactive", () => {
    const getBoundingClientRect = vi.fn();
    const drive = vi.fn();
    const requestFrame = vi.fn();
    const driver = createCoalescedMilimPointerDriver({
      element: { getBoundingClientRect } as never,
      drive,
      isActive: () => false,
      requestFrame,
      cancelFrame: vi.fn(),
    });

    driver.onPointerMove({ clientX: 25, clientY: 40 } as PointerEvent);

    expect(getBoundingClientRect).not.toHaveBeenCalled();
    expect(drive).not.toHaveBeenCalled();
    expect(requestFrame).not.toHaveBeenCalled();
  });

  it("coalesces pointer events to one animation frame and cancels outstanding work", () => {
    let frame: FrameRequestCallback | undefined;
    const cancelFrame = vi.fn();
    const drive = vi.fn();
    const getBoundingClientRect = vi.fn(() => ({ left: 10, top: 20, width: 100, height: 200 }));
    const driver = createCoalescedMilimPointerDriver({
      element: { getBoundingClientRect } as never,
      drive,
      isActive: () => true,
      requestFrame(callback) {
        frame = callback;
        return 7;
      },
      cancelFrame,
    });

    driver.onPointerMove({ clientX: 30, clientY: 40 } as PointerEvent);
    driver.onPointerMove({ clientX: 90, clientY: 180 } as PointerEvent);
    expect(getBoundingClientRect).not.toHaveBeenCalled();

    frame?.(0);
    expect(drive).toHaveBeenCalledOnce();
    expect(drive.mock.calls[0][0].gaze.x).toBeCloseTo(0.6);
    expect(drive.mock.calls[0][0].gaze.y).toBeCloseTo(0.6);

    driver.onPointerMove({ clientX: 50, clientY: 70 } as PointerEvent);
    driver.destroy();
    expect(cancelFrame).toHaveBeenCalledWith(7);
  });
});

describe("Milim hero handoff threshold", () => {
  it("uses the declared 30 percent intersection threshold", () => {
    expect(isHeroVisibleAtThreshold({ isIntersecting: true, intersectionRatio: 0.3 })).toBe(true);
    expect(isHeroVisibleAtThreshold({ isIntersecting: true, intersectionRatio: 0.29 })).toBe(false);
    expect(isHeroVisibleAtThreshold({ isIntersecting: false, intersectionRatio: 0.9 })).toBe(false);
  });
});
