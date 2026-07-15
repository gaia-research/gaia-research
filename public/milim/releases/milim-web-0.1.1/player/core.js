import { composeFrame } from "./compose.js";
import { ERROR_CODES, errorResult, milimError } from "./errors.js";

const DURABLE_KEYS = Object.freeze(["expression", "hair", "outfit", "pose", "scene"]);
const CONTROL_KEYS = Object.freeze(["gaze", "head", "mouthOpen"]);
const MOTION_NAMES = Object.freeze(["greet", "point"]);

export function createMilimCore({ model, release, reducedMotion = false, onStateApplied = () => {} }) {
  const supported = {
    expression: new Set(model.expressions.map(({ id }) => id)),
    hair: new Set(model.appearances.hair),
    outfit: new Set(model.appearances.outfit),
    pose: new Set(model.appearances.pose),
    scene: new Set(release.scenes.map(({ id }) => id)),
  };
  let projectedDurable = durableFromDefaults(release.defaults);
  let appliedDurable = { ...projectedDurable };
  let projectedLive = neutralLive();
  let appliedLive = neutralLive();
  let ready = false;
  let running = true;
  let destroyed = false;
  let clockMs = 0;
  let queue = [];
  let activeMotion = null;
  let latestMotionRequest = null;

  const api = {
    set(partial) {
      if (destroyed) return destroyedResult();
      const validation = validateState(partial, supported);
      if (validation) return errorResult(validation);
      const next = { ...projectedDurable, ...partial };
      projectedDurable = next;
      enqueue(() => applyDurable(next));
      return { ok: true, value: { ...projectedDurable } };
    },

    drive(partial) {
      if (destroyed) return destroyedResult();
      const parsed = parseControls(partial, projectedLive, reducedMotion);
      if (!parsed.ok) return errorResult(parsed.error);
      projectedLive = parsed.value;
      const next = cloneLive(projectedLive);
      enqueue(() => { appliedLive = next; });
      return { ok: true, value: cloneLive(projectedLive) };
    },

    perform(name) {
      if (destroyed) return Promise.reject(destroyedError());
      const definition = model.motions.find((motion) => motion.id === name);
      if (!MOTION_NAMES.includes(name) || !definition) {
        return Promise.reject(milimError(
          ERROR_CODES.UNSUPPORTED_MOTION,
          "Milim motion is unsupported",
          { motion: name },
        ));
      }
      if (reducedMotion) return Promise.resolve({ status: "completed" });

      if (latestMotionRequest && !latestMotionRequest.settled) settle(latestMotionRequest, "interrupted");
      const request = motionRequest(definition);
      latestMotionRequest = request;
      enqueue(() => startMotion(request));
      return request.promise;
    },

    setRunning(value) {
      if (destroyed) return;
      running = Boolean(value);
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      running = false;
      if (activeMotion) settle(activeMotion.request, "interrupted");
      if (latestMotionRequest) settle(latestMotionRequest, "interrupted");
      for (const operation of queue) operation.cancel?.();
      queue = [];
      activeMotion = null;
      latestMotionRequest = null;
    },
  };

  return {
    api: Object.freeze(api),
    setReady() {
      if (ready || destroyed) return;
      ready = true;
      const pending = queue;
      queue = [];
      for (const operation of pending) operation();
    },
    advance(deltaMs) {
      if (!destroyed && ready && running) {
        const elapsed = Number.isFinite(deltaMs) ? Math.max(0, deltaMs) : 0;
        clockMs += elapsed;
        if (activeMotion) {
          activeMotion.elapsedMs += elapsed;
          const total = activeMotion.definition.durationMs + activeMotion.definition.returnMs;
          if (activeMotion.elapsedMs >= total) {
            settle(activeMotion.request, "completed");
            activeMotion = null;
            latestMotionRequest = null;
          }
        }
      }
      return frame();
    },
    frame,
    get destroyed() { return destroyed; },
    get running() { return running; },
  };

  function frame() {
    return composeFrame({
      model,
      durable: appliedDurable,
      live: appliedLive,
      clockMs,
      motion: activeMotion,
      reducedMotion,
    });
  }

  function enqueue(operation) {
    if (ready) operation();
    else queue.push(operation);
  }

  function applyDurable(next) {
    const previous = appliedDurable;
    appliedDurable = { ...next };
    onStateApplied(previous, appliedDurable);
  }

  function startMotion(request) {
    if (request.settled) return;
    if (activeMotion) settle(activeMotion.request, "interrupted");
    activeMotion = { definition: request.definition, elapsedMs: 0, request };
  }
}

function durableFromDefaults(defaults) {
  return {
    expression: defaults.expression,
    hair: defaults.hair,
    outfit: defaults.outfit,
    pose: defaults.pose,
    scene: defaults.scene,
  };
}

function neutralLive() {
  return { gaze: { x: 0, y: 0 }, head: { x: 0, y: 0, z: 0 }, mouthOpen: 0 };
}

function cloneLive(live) {
  return { gaze: { ...live.gaze }, head: { ...live.head }, mouthOpen: live.mouthOpen };
}

function validateState(partial, supported) {
  if (!plainObject(partial)) return unsupportedState("state", partial);
  for (const key of Object.keys(partial)) {
    if (!DURABLE_KEYS.includes(key)) return unsupportedState(key, partial[key]);
    if (typeof partial[key] !== "string" || !supported[key].has(partial[key])) return unsupportedState(key, partial[key]);
  }
  return null;
}

function unsupportedState(key, value) {
  return milimError(ERROR_CODES.UNSUPPORTED_STATE, "Milim state value is unsupported", { key, value });
}

function parseControls(partial, current, reducedMotion) {
  if (!plainObject(partial)) return unsupportedControl("controls", partial);
  const next = cloneLive(current);
  for (const key of Object.keys(partial)) {
    if (!CONTROL_KEYS.includes(key)) return unsupportedControl(key, partial[key]);
    if (key === "mouthOpen") {
      if (!finiteNumber(partial[key])) return unsupportedControl(key, partial[key]);
      next.mouthOpen = clamp(partial[key], 0, 1);
      continue;
    }
    if (!plainObject(partial[key])) return unsupportedControl(key, partial[key]);
    const axes = key === "gaze" ? ["x", "y"] : ["x", "y", "z"];
    for (const axis of Object.keys(partial[key])) {
      if (!axes.includes(axis) || !finiteNumber(partial[key][axis])) return unsupportedControl(`${key}.${axis}`, partial[key][axis]);
      next[key][axis] = clamp(partial[key][axis], -1, 1);
    }
  }
  return { ok: true, value: reducedMotion ? neutralLive() : next };
}

function unsupportedControl(key, value) {
  return {
    ok: false,
    error: milimError(ERROR_CODES.UNSUPPORTED_CONTROL, "Milim live control is unsupported", { key, value }),
  };
}

function motionRequest(definition) {
  let resolve;
  const promise = new Promise((yes) => { resolve = yes; });
  return { definition, promise, resolve, settled: false };
}

function settle(request, status) {
  if (!request || request.settled) return;
  request.settled = true;
  request.resolve({ status });
}

function destroyedError() {
  return milimError(ERROR_CODES.DESTROYED, "Milim player has been destroyed");
}

function destroyedResult() {
  return errorResult(destroyedError());
}

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
