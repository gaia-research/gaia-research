export type MilimSceneState<Scene extends string> = {
  activeScene: Scene;
  pendingScene: Scene | null;
  sceneError: string | null;
};

type MilimSetResult = { ok?: boolean } | undefined;
type MilimSceneStatus = { type?: unknown; scene?: unknown; error?: unknown };

const SCENE_LABELS: Record<string, string> = {
  "cyber-slime-lab-v2": "Cyber-Slime Laboratory",
  "slime-reactor-halo-v2": "Slime Reactor Halo",
  "dragon-signal-observatory-v2": "Dragon Signal Observatory",
};

export function requestMilimScene<Scene extends string>(
  state: MilimSceneState<Scene>,
  scene: Scene,
  result: MilimSetResult,
): MilimSceneState<Scene> {
  if (result?.ok !== true) return state;
  return { ...state, pendingScene: scene, sceneError: null };
}

export function resetMilimSceneState<Scene extends string>(
  _state: MilimSceneState<Scene>,
  defaultScene: Scene,
): MilimSceneState<Scene> {
  return { activeScene: defaultScene, pendingScene: null, sceneError: null };
}

export function reconcileMilimSceneStatus<Scene extends string>(
  state: MilimSceneState<Scene>,
  status: MilimSceneStatus,
): MilimSceneState<Scene> {
  if (status.type === "scene" && status.scene === state.pendingScene) {
    return { activeScene: status.scene as Scene, pendingScene: null, sceneError: null };
  }
  if (status.type === "error" && state.pendingScene) {
    const label = SCENE_LABELS[state.pendingScene] ?? state.pendingScene;
    return {
      ...state,
      pendingScene: null,
      sceneError: `Could not load ${label}.`,
    };
  }
  return state;
}

type PointerPosition = Pick<PointerEvent, "clientX" | "clientY">;
type PointerElement = Pick<HTMLElement, "getBoundingClientRect">;

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

export function isHeroVisibleAtThreshold(
  entry: Pick<IntersectionObserverEntry, "isIntersecting" | "intersectionRatio">,
  threshold = 0.3,
): boolean {
  return entry.isIntersecting && entry.intersectionRatio >= threshold;
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
