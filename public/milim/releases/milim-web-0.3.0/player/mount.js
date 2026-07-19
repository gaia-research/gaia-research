import { createMilimCore } from "./core.js";
import { ERROR_CODES, MilimError, milimError, structuredError } from "./errors.js";
import { createFrameLoop } from "./lifecycle.js";
import { loadBundle, loadScene } from "./load.js";

export async function mountMilimWithRuntime(canvas, options = {}, runtime) {
  const emitStatus = safeStatusEmitter(options.onStatus);
  const bundle = await loadBundle(options.src, runtime, emitStatus);
  let frameLoop;
  let contextActive = true;
  let renderer;
  try {
    renderer = runtime.createRenderer(canvas, {
      emitStatus,
      reducedMotion: options.reducedMotion === true,
      onContextState(active) {
        contextActive = active;
        frameLoop?.setContextActive(active);
      },
    });
  } catch (cause) {
    throw rendererError(cause);
  }
  let initialized;
  try {
    initialized = await renderer.initialize(bundle.model, bundle.scene, { defaults: bundle.release.defaults });
  } catch (cause) {
    renderer.destroy?.();
    if (cause instanceof MilimError) throw cause;
    throw rendererError(cause);
  }
  let sceneGeneration = 0;
  const sceneCache = new Map([[bundle.scene.id, Promise.resolve(bundle.scene)]]);
  const core = createMilimCore({
    model: bundle.model,
    release: bundle.release,
    reducedMotion: options.reducedMotion === true,
    onStateApplied(previous, next) {
      if (previous.scene === next.scene) return;
      const entry = bundle.release.scenes.find(({ id }) => id === next.scene);
      const generation = ++sceneGeneration;
      emitStatus({ type: "loading", phase: "scene-change", scene: next.scene, url: entry.url });
      let pending = sceneCache.get(next.scene);
      if (!pending) {
        pending = loadScene(entry, runtime, bundle.releaseRoot, bundle.release.files);
        sceneCache.set(next.scene, pending);
      }
      pending.then(async (scene) => {
        if (core.destroyed || generation !== sceneGeneration) return;
        await renderer.setScene(scene);
        if (!core.destroyed && generation === sceneGeneration) emitStatus({ type: "scene", scene: next.scene });
      }).catch((error) => {
        sceneCache.delete(next.scene);
        if (!core.destroyed && generation === sceneGeneration) emitStatus({ type: "error", error: statusError(error) });
      });
    },
  });
  try {
    if (typeof runtime.scheduler?.request !== "function" || typeof runtime.scheduler?.cancel !== "function") {
      throw new Error("requestAnimationFrame is unavailable");
    }
    frameLoop = createFrameLoop({
      core,
      renderer,
      scheduler: runtime.scheduler,
      visibility: runtime.visibility,
    });
    frameLoop.setContextActive(contextActive);
    frameLoop.start();
  } catch (cause) {
    frameLoop?.destroy();
    core.api.destroy();
    renderer.destroy();
    throw rendererError(cause);
  }
  emitStatus({ type: "ready", release: bundle.release.release });
  Promise.resolve(initialized.allReady).then(() => {
    if (core.destroyed) return;
    core.setReady();
    emitStatus({ type: "decoded" });
  }, (error) => {
    if (core.destroyed) return;
    core.setReady();
    emitStatus({ type: "error", error: statusError(error) });
  });

  return Object.freeze({
    set: core.api.set,
    drive: core.api.drive,
    perform: core.api.perform,
    setRunning: frameLoop.setRunning,
    setSceneRunning: frameLoop.setSceneRunning,
    destroy() {
      if (core.destroyed) return;
      sceneGeneration += 1;
      frameLoop.destroy();
      core.api.destroy();
      renderer.destroy();
    },
  });
}

function statusError(error) {
  if (error instanceof MilimError) return structuredError(error);
  return structuredError(rendererError(error));
}

function rendererError(cause) {
  return milimError(
    ERROR_CODES.RENDERER_UNAVAILABLE,
    "Milim WebGL2 renderer is unavailable",
    { reason: cause instanceof Error ? cause.message : String(cause) },
  );
}

function safeStatusEmitter(callback) {
  if (typeof callback !== "function") return () => {};
  return (event) => {
    try { callback(event); } catch {}
  };
}
