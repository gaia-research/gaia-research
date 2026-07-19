export function createFrameLoop({ core, renderer, scheduler, visibility }) {
  let desiredRunning = true;
  let desiredSceneRunning = true;
  // The scene follows the character running state until the first
  // setSceneRunning call; afterwards the two lifecycles are independent.
  let sceneControlled = false;
  let contextActive = true;
  let pageActive = visibility ? !visibility.hidden : true;
  let destroyed = false;
  let frameId = null;
  let previousTimestamp = null;

  const onVisibilityChange = () => {
    pageActive = !visibility.hidden;
    previousTimestamp = null;
    synchronize();
  };
  visibility?.addEventListener?.("visibilitychange", onVisibilityChange);

  return {
    start() { synchronize(); },
    setRunning(running) {
      if (destroyed) return;
      desiredRunning = Boolean(running);
      if (!sceneControlled) desiredSceneRunning = desiredRunning;
      core.api.setRunning(desiredRunning);
      previousTimestamp = null;
      synchronize();
    },
    setSceneRunning(running) {
      if (destroyed) return;
      sceneControlled = true;
      desiredSceneRunning = Boolean(running);
      core.api.setSceneRunning(desiredSceneRunning);
      previousTimestamp = null;
      synchronize();
    },
    setContextActive(active) {
      if (destroyed) return;
      contextActive = Boolean(active);
      previousTimestamp = null;
      synchronize();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelPending();
      visibility?.removeEventListener?.("visibilitychange", onVisibilityChange);
    },
  };

  function active() {
    return !destroyed && (desiredRunning || desiredSceneRunning) && contextActive && pageActive;
  }

  function synchronize() {
    if (!active()) {
      cancelPending();
      return;
    }
    if (frameId === null) frameId = scheduler.request(onFrame);
  }

  function cancelPending() {
    if (frameId === null) return;
    scheduler.cancel(frameId);
    frameId = null;
  }

  function onFrame(timestamp) {
    frameId = null;
    if (!active()) return;
    const deltaMs = previousTimestamp === null
      ? 0
      : Math.max(0, Math.min(100, timestamp - previousTimestamp));
    previousTimestamp = timestamp;
    renderer.draw(core.advance(deltaMs));
    synchronize();
  }
}
