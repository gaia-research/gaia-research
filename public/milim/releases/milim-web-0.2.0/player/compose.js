export const COMPOSITION_ORDER = Object.freeze([
  "neutral",
  "durable",
  "drive",
  "idle-blink",
  "expression",
  "one-shot",
  "secondary",
  "draw",
]);

export function composeFrame({
  model,
  durable,
  live,
  clockMs,
  motion,
  expressionTransition = null,
  reducedMotion = false,
}) {
  const frame = neutralFrame(model, clockMs);
  applyDurable(frame, model, durable);
  applyDrive(frame, live);
  if (!reducedMotion) applyIdleAndBlink(frame, model, clockMs);
  applyExpression(frame, model, durable.expression, expressionTransition, clockMs);
  if (!reducedMotion && motion) applyOneShot(frame, motion);
  applySecondary(frame);
  return frame;
}

function neutralFrame(model, clockMs) {
  return {
    clockMs,
    scene: null,
    appearance: { hair: null, outfit: null, pose: null },
    expression: null,
    expressionTexture: null,
    expressionLayers: [],
    motionTexture: null,
    motionOpacity: 0,
    gaze: { x: 0, y: 0 },
    head: { x: 0, y: 0, z: 0 },
    mouthOpen: 0,
    blink: 0,
    transform: { x: 0, y: 0, rotation: 0, scale: 1 },
    channels: Object.fromEntries(model.channels.map((channel) => [channel, 0])),
    partOpacities: Object.fromEntries((model.parts ?? []).map((part) => [
      part.id,
      part.slot === "expression" ? 0 : 1,
    ])),
    motionPartOpacities: {},
    secondary: { hairSway: 0, parallax: { x: 0, y: 0 }, reflection: 0 },
  };
}

function applyDurable(frame, model, durable) {
  frame.scene = durable.scene;
  frame.appearance = { hair: durable.hair, outfit: durable.outfit, pose: durable.pose };
  if (model.formatVersion !== 2) return;
  for (const part of model.parts) {
    if (["hair", "outfit", "pose"].includes(part.slot)) frame.partOpacities[part.id] = 0;
  }
  for (const kind of ["hair", "outfit", "pose"]) {
    const pack = model.appearances[kind].find(({ id }) => id === durable[kind]);
    for (const partId of pack?.parts ?? []) frame.partOpacities[partId] = 1;
  }
}

function applyDrive(frame, live) {
  frame.gaze = { ...live.gaze };
  frame.head = { ...live.head };
  frame.mouthOpen = live.mouthOpen;
  for (const [path, value] of [
    ["eyes.look.x", live.gaze.x], ["eyes.look.y", live.gaze.y],
    ["head.turn", live.head.x], ["head.nod", live.head.y], ["head.tilt", live.head.z],
    ["mouth.open", live.mouthOpen],
  ]) setChannel(frame, path, value);
}

function applyIdleAndBlink(frame, model, clockMs) {
  const idleMotions = model.motions.filter(({ id, loop }) => loop && (id === "idle" || id.startsWith("idle-")));
  for (const idle of idleMotions) {
    const localMs = idle.durationMs === 0 ? 0 : clockMs % idle.durationMs;
    applyTracks(frame, idle.tracks, localMs, idle.durationMs, 1);
    applyPartTracks(frame, idle.parts, localMs, idle.durationMs, 1);
  }
  const blinkPhase = clockMs % 3600;
  frame.blink = blinkPhase >= 3200 && blinkPhase < 3360
    ? 1 - Math.abs((blinkPhase - 3280) / 80)
    : 0;
  setChannel(frame, "blink", frame.blink);
  setChannel(frame, "eyes.open.left", 1 - frame.blink);
  setChannel(frame, "eyes.open.right", 1 - frame.blink);
}

function applyExpression(frame, model, expressionId, transition, clockMs) {
  if (model.formatVersion === 2) {
    applyProductionExpression(frame, model, expressionId, transition, clockMs);
    return;
  }
  const expression = model.expressions.find(({ id }) => id === expressionId);
  frame.expression = expressionId;
  frame.expressionTexture = expression?.texture ?? null;
  frame.expressionLayers = expressionLayersAt(model, expressionId, transition, clockMs);
}

function applyProductionExpression(frame, model, expressionId, transition, clockMs) {
  frame.expression = expressionId;
  frame.expressionTexture = null;
  frame.expressionLayers = [];
  const state = productionExpressionStateAt(model, expressionId, transition, clockMs);
  for (const [channel, value] of Object.entries(state.channels)) setChannel(frame, channel, value);
  for (const [partId, opacity] of Object.entries(state.parts)) {
    frame.partOpacities[partId] = clamp(opacity, 0, 1);
  }
}

export function productionExpressionStateAt(model, expressionId, transition, clockMs) {
  const expression = model.expressions.find(({ id }) => id === expressionId);
  const target = expressionState(expression);
  if (!transition || transition.kind !== "production" || transition.toExpression !== expressionId) return target;
  const elapsedMs = Math.max(0, clockMs - transition.startedAtMs);
  const progress = transition.durationMs > 0 ? clamp(elapsedMs / transition.durationMs, 0, 1) : 1;
  return {
    channels: interpolateRecord(transition.from.channels, transition.to.channels, progress),
    parts: interpolateRecord(transition.from.parts, transition.to.parts, progress),
  };
}

function expressionState(expression) {
  return {
    channels: { ...(expression?.channels ?? {}) },
    parts: { ...(expression?.parts ?? {}) },
  };
}

function interpolateRecord(from, to, progress) {
  const keys = new Set([...Object.keys(from), ...Object.keys(to)]);
  return Object.fromEntries([...keys].map((key) => [
    key,
    lerp(from[key] ?? 0, to[key] ?? 0, progress),
  ]));
}

export function expressionLayersAt(model, expressionId, transition, clockMs) {
  if (!transition || transition.incoming.expression !== expressionId) {
    const expression = model.expressions.find(({ id }) => id === expressionId);
    return expression ? [expressionLayer(expression.id, expression.texture, 1)] : [];
  }

  const elapsedMs = Math.max(0, clockMs - transition.startedAtMs);
  const layers = transition.outgoing.map((layer) => {
    const progress = layer.blendOutMs > 0 ? clamp(elapsedMs / layer.blendOutMs, 0, 1) : 1;
    return expressionLayer(layer.expression, layer.texture, layer.startOpacity * (1 - progress));
  });
  const incomingProgress = transition.incoming.blendInMs > 0
    ? clamp(elapsedMs / transition.incoming.blendInMs, 0, 1)
    : 1;
  layers.push(expressionLayer(
    transition.incoming.expression,
    transition.incoming.texture,
    transition.incoming.startOpacity
      + (1 - transition.incoming.startOpacity) * incomingProgress,
  ));
  return layers.filter(({ opacity }) => opacity > 0);
}

function expressionLayer(expression, texture, opacity) {
  return { expression, texture, opacity };
}

function applyOneShot(frame, active) {
  const { definition, elapsedMs } = active;
  const sampleMs = Math.min(elapsedMs, definition.durationMs);
  const returnElapsed = Math.max(0, elapsedMs - definition.durationMs);
  const weight = definition.returnMs > 0 ? 1 - Math.min(1, returnElapsed / definition.returnMs) : 1;
  if (typeof definition.texture === "string") {
    frame.motionTexture = definition.texture;
    frame.motionOpacity = weight;
  }
  applyTracks(frame, definition.tracks, sampleMs, definition.durationMs, weight);
  applyPartTracks(frame, definition.parts, sampleMs, definition.durationMs, weight);
  applyMotionInterruption(frame, active);
}

function applyMotionInterruption(frame, active) {
  if (!active.interruptedFrom || active.interruptionMs <= 0 || active.elapsedMs >= active.interruptionMs) return;
  const progress = clamp(active.elapsedMs / active.interruptionMs, 0, 1);
  for (const channel of active.interruptionChannels) {
    const from = active.interruptedFrom.channels[channel] ?? 0;
    const to = frame.channels[channel] ?? 0;
    setChannel(frame, channel, lerp(from, to, progress));
  }
  for (const partId of active.interruptionParts) {
    const from = active.interruptedFrom.partOpacities[partId] ?? 0;
    const to = frame.partOpacities[partId] ?? 0;
    const opacity = lerp(from, to, progress);
    frame.partOpacities[partId] = opacity;
    frame.motionPartOpacities[partId] = opacity;
  }
}

function applySecondary(frame) {
  frame.secondary.hairSway = clamp(frame.head.x * 0.18 + frame.transform.rotation * 0.08, -1, 1);
  frame.secondary.parallax = {
    x: clamp(frame.gaze.x * 0.7 + frame.head.x * 0.3, -1, 1),
    y: clamp(frame.gaze.y * 0.7 + frame.head.y * 0.3, -1, 1),
  };
  frame.secondary.reflection = clamp(frame.mouthOpen * 0.15 + Math.abs(frame.head.z) * 0.1, 0, 1);
}

function applyTracks(frame, tracks, timeMs, durationMs, weight) {
  for (const [path, track] of Object.entries(tracks)) {
    const sampled = sampleTrack(track, timeMs, durationMs);
    if (typeof sampled !== "number" || !Number.isFinite(sampled)) continue;
    const base = readChannel(frame, path);
    setChannel(frame, path, base + (sampled - base) * weight);
  }
}

function applyPartTracks(frame, tracks, timeMs, durationMs, weight) {
  for (const [partId, track] of Object.entries(tracks ?? {})) {
    const sampled = sampleTrack(track, timeMs, durationMs);
    if (typeof sampled !== "number" || !Number.isFinite(sampled)) continue;
    const base = frame.partOpacities[partId] ?? 0;
    const opacity = base + (sampled - base) * weight;
    frame.partOpacities[partId] = opacity;
    frame.motionPartOpacities[partId] = opacity;
  }
}

export function sampleTrack(track, timeMs, durationMs) {
  const keyframes = Array.isArray(track) ? track : track?.keyframes;
  if (!Array.isArray(keyframes) || keyframes.length === 0) return typeof track === "number" ? track : 0;
  if (keyframes.every((value) => typeof value === "number")) {
    if (keyframes.length === 1) return keyframes[0];
    const scaled = clamp(timeMs / durationMs, 0, 1) * (keyframes.length - 1);
    const before = Math.floor(scaled);
    const after = Math.min(keyframes.length - 1, before + 1);
    return lerp(keyframes[before], keyframes[after], scaled - before);
  }
  if (keyframes.every((keyframe) => (
    Array.isArray(keyframe)
    && keyframe.length >= 2
    && Number.isFinite(keyframe[0])
    && Number.isFinite(keyframe[1])
  ))) {
    return interpolateKeyframes(
      keyframes.map(([time, value]) => ({ time, value })),
      timeMs,
    );
  }
  const normalized = keyframes
    .map((keyframe) => ({
      time: Number.isFinite(keyframe?.timeMs) ? keyframe.timeMs : (keyframe?.time ?? 0) * durationMs,
      value: keyframe?.value,
    }))
    .filter(({ time, value }) => Number.isFinite(time) && Number.isFinite(value))
    .sort((a, b) => a.time - b.time);
  return interpolateKeyframes(normalized, timeMs);
}

function interpolateKeyframes(keyframes, timeMs) {
  if (keyframes.length === 0) return 0;
  const normalized = [...keyframes].sort((a, b) => a.time - b.time);
  if (timeMs <= normalized[0].time) return normalized[0].value;
  const nextIndex = normalized.findIndex(({ time }) => time >= timeMs);
  if (nextIndex < 0) return normalized.at(-1).value;
  const before = normalized[nextIndex - 1];
  const after = normalized[nextIndex];
  const span = after.time - before.time;
  return lerp(before.value, after.value, span === 0 ? 1 : (timeMs - before.time) / span);
}

function readChannel(frame, path) {
  const target = path.split(".").reduce((value, key) => value?.[key], frame);
  if (typeof target === "number") return target;
  return typeof frame.channels[path] === "number" ? frame.channels[path] : 0;
}

function setChannel(frame, path, value) {
  frame.channels[path] = value;
  if (applySemanticChannel(frame, path, value)) return;
  const keys = path.split(".");
  let target = frame;
  for (let index = 0; index < keys.length - 1; index += 1) {
    if (target[keys[index]] === undefined || target[keys[index]] === null) return;
    target = target[keys[index]];
  }
  const finalKey = keys.at(-1);
  if (typeof target?.[finalKey] === "number") target[finalKey] = value;
}

export function applyChannelValues(frame, values) {
  for (const [path, value] of Object.entries(values)) {
    if (typeof value === "number" && Number.isFinite(value)) setChannel(frame, path, value);
  }
  return frame;
}

function applySemanticChannel(frame, path, value) {
  const semantic = {
    "head.turn": ["head", "x"],
    "head.nod": ["head", "y"],
    "head.tilt": ["head", "z"],
    "eyes.look.x": ["gaze", "x"],
    "eyes.look.y": ["gaze", "y"],
    "mouth.open": [null, "mouthOpen"],
    "base.x": ["transform", "x"],
    "base.y": ["transform", "y"],
    "body.tilt": ["transform", "rotation"],
  }[path];
  if (semantic) {
    const [group, key] = semantic;
    if (group) frame[group][key] = value;
    else frame[key] = value;
    return true;
  }
  if (path === "breath") {
    frame.transform.scale = 1 + value * 0.012;
    frame.transform.y += value * 0.006;
    return true;
  }
  return false;
}

function lerp(from, to, progress) {
  return from + (to - from) * progress;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
