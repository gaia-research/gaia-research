export type MilimLiveMode = "live" | "fallback" | "reduced-motion" | "missing-release";

type PointerPosition = Pick<PointerEvent, "clientX" | "clientY">;
type PointerElement = Pick<HTMLElement, "getBoundingClientRect">;

export function shouldMountMilimPlayer(
  mode: MilimLiveMode,
  prefersReducedMotion: boolean,
): boolean {
  return mode === "live" && !prefersReducedMotion;
}

export function resolveMilimRunning(visible: boolean, documentHidden: boolean): boolean {
  return visible && !documentHidden;
}

/** Coalesce pointer movement so the semantic gaze drive can run at most once per frame. */
export function createCoalescedMilimPointerDriver({
  element,
  drive,
  isActive,
  requestFrame,
  cancelFrame,
}: {
  element: PointerElement;
  drive: (controls: { gaze: { x: number; y: number } }) => unknown;
  isActive: () => boolean;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
}) {
  let frameId: number | null = null;
  let latest: PointerPosition | null = null;

  const onPointerMove = (event: PointerPosition) => {
    if (!isActive()) return;
    latest = { clientX: event.clientX, clientY: event.clientY };
    if (frameId !== null) return;
    frameId = requestFrame(() => {
      frameId = null;
      const pointer = latest;
      latest = null;
      if (!pointer || !isActive()) return;
      const rect = element.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      drive({
        gaze: {
          x: clamp(((pointer.clientX - rect.left) / rect.width) * 2 - 1),
          y: clamp(((pointer.clientY - rect.top) / rect.height) * 2 - 1),
        },
      });
    });
  };

  return {
    onPointerMove,
    destroy() {
      latest = null;
      if (frameId !== null) cancelFrame(frameId);
      frameId = null;
    },
  };
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
