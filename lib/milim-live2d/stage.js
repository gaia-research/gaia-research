/*
 * createMilimStage — the framework-agnostic imperative API for milim-live2d-model.
 * (c) 2026 Gaia Research, MIT. Renders a Stretchy Studio scene (see NOTICE for
 * attribution) via a self-contained WebGL2 player — no React, no Next, no DOM
 * framework. Drive it from anything: vanilla JS, React, Vue, Svelte.
 *
 * The per-frame loop mirrors Stretchy's CanvasViewport tick, but reframed as an
 * imperative object:
 *   clock.tick → resolvePose (keyframes → params → blendShapes → warps)
 *              → upload deformed positions → ScenePass.draw
 *
 * GL context flags are load-bearing (see the runtime notes): premultipliedAlpha
 * false + our ONE/ONE_MINUS_SRC_ALPHA blend = correct transparent compositing;
 * stencil true = iris→eyewhite clipping; preserveDrawingBuffer true = stable
 * screenshots / no flicker on some drivers.
 */
import { ScenePass } from './renderer/scenePass.js';
import { PlaybackClock } from './playback/clock.js';
import { resolvePose } from './playback/resolvePose.js';

const GL_FLAGS = {
  alpha: true,
  premultipliedAlpha: false,
  stencil: true,
  preserveDrawingBuffer: true,
  antialias: true,
  desynchronized: true,
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {Object} opts
 * @param {Object} opts.scene       - the parsed scene { nodes, canvas, textures, parameters, animations, expressions? }
 * @param {Map<string,TexImageSource>|Object} [opts.textures] - resolved images keyed by texture id / part id
 * @param {boolean} [opts.autoplay=true]
 * @param {boolean} [opts.transparent=true]
 * @param {number}  [opts.dpr]       - device pixel ratio override (defaults to window.devicePixelRatio, capped at 2)
 * @param {string}  [opts.initialAnimation] - clip id/name to start on (defaults to first clip)
 * @param {Object}  [opts.view]      - { zoom, panX, panY } to override the auto-fit camera
 * @param {Object}  [opts.pointerParams] - { angleX, angleY, eyeX, eyeY } param-id map for look-at
 */
export function createMilimStage(canvas, opts = {}) {
  const {
    scene,
    textures = new Map(),
    autoplay = true,
    dpr: dprOpt,
    initialAnimation,
    view: viewOpt,
    pointerParams,
  } = opts;

  if (!scene) throw new Error('[milim] createMilimStage: opts.scene is required');

  const gl = canvas.getContext('webgl2', GL_FLAGS);
  if (!gl) throw new Error('[milim] WebGL2 is not available in this context');

  const scenePass = new ScenePass(gl);
  const clock = new PlaybackClock();

  // Interactive state.
  const paramValues = Object.create(null);
  for (const p of scene.parameters ?? []) paramValues[p.id] = p.default ?? 0;

  const texMap = textures instanceof Map
    ? textures
    : new Map(Object.entries(textures ?? {}));

  // Camera: honour an explicit view, else auto-fit the scene canvas and keep it fitted on resize.
  let view = viewOpt ? { ...viewOpt } : { zoom: 1, panX: 0, panY: 0 };
  const autoFit = !viewOpt;

  let dpr = dprOpt ?? Math.min(globalThis.devicePixelRatio || 1, 2);
  let rafId = null;
  let dirty = true;               // force at least one draw
  let destroyed = false;
  const overriddenLastFrame = new Set();

  // ── Setup: upload every part's texture + mesh to the GPU once. ──────────────
  function resolveTexture(node) {
    return (
      texMap.get(node.textureId) ??
      texMap.get(node.texture) ??
      texMap.get(node.id) ??
      texMap.get(node.name) ??
      null
    );
  }

  for (const node of scene.nodes) {
    if (node.type !== 'part') continue;
    const img = resolveTexture(node);
    if (img) scenePass.parts.uploadTexture(node.id, img);

    if (node.mesh && node.mesh.vertices?.length && node.mesh.triangles?.length) {
      scenePass.parts.uploadMesh(node.id, {
        vertices: node.mesh.vertices,
        uvs: node.mesh.uvs instanceof Float32Array ? node.mesh.uvs : new Float32Array(node.mesh.uvs ?? []),
        triangles: node.mesh.triangles,
        edgeIndices: node.mesh.edgeIndices,
      });
    } else if (img || node.imageWidth) {
      // No mesh — draw the full texture rect so the part still renders.
      scenePass.parts.uploadQuadFallback(node.id, node.imageWidth ?? 1, node.imageHeight ?? 1);
    }
  }

  // ── Camera fit. ─────────────────────────────────────────────────────────────
  function computeFitView() {
    const c = scene.canvas ?? { width: 1024, height: 1024, x: 0, y: 0 };
    const sw = c.width || 1, sh = c.height || 1;
    const cx = (c.x ?? 0) + sw / 2;
    const cy = (c.y ?? 0) + sh / 2;
    const W = canvas.width, H = canvas.height;
    const zoom = Math.min(W / sw, H / sh) * 0.92; // small padding
    return { zoom, panX: W / 2 - zoom * cx, panY: H / 2 - zoom * cy };
  }

  function resize() {
    const w = Math.max(1, Math.round((canvas.clientWidth || canvas.width) * dpr));
    const h = Math.max(1, Math.round((canvas.clientHeight || canvas.height) * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (autoFit) view = computeFitView();
    dirty = true;
  }

  // ── Mesh-deformation upload (positions only; transforms handled in draw). ───
  function applyMeshOverrides(pose) {
    const nowOverridden = new Set();
    if (pose) {
      for (const [nodeId, ov] of pose) {
        if (!ov.mesh_verts) continue;
        const node = scene.nodes.find(n => n.id === nodeId);
        if (!node || node.type !== 'part' || !node.mesh) continue;
        const uvs = node.mesh.uvs instanceof Float32Array
          ? node.mesh.uvs
          : new Float32Array(node.mesh.uvs ?? []);
        scenePass.parts.uploadPositions(nodeId, ov.mesh_verts, uvs);
        nowOverridden.add(nodeId);
      }
    }
    // Restore parts that were deformed last frame but not this one.
    for (const id of overriddenLastFrame) {
      if (nowOverridden.has(id)) continue;
      const node = scene.nodes.find(n => n.id === id);
      if (!node?.mesh?.vertices) continue;
      const uvs = node.mesh.uvs instanceof Float32Array
        ? node.mesh.uvs
        : new Float32Array(node.mesh.uvs ?? []);
      scenePass.parts.uploadPositions(id, node.mesh.vertices, uvs);
    }
    overriddenLastFrame.clear();
    for (const id of nowOverridden) overriddenLastFrame.add(id);
  }

  function renderOnce() {
    const pose = resolvePose(scene, clock, paramValues);
    applyMeshOverrides(pose);
    scenePass.draw(scene, view, pose, { skipResize: true });
  }

  function frame(ts) {
    if (destroyed) return;
    rafId = requestAnimationFrame(frame);
    const moved = clock.tick(ts);
    if (!moved && !dirty) return; // idle: nothing changed, skip the draw
    dirty = false;
    renderOnce();
  }

  // ── Public API ──────────────────────────────────────────────────────────────
  function play() {
    if (destroyed) return;
    clock.play();
    if (rafId === null) rafId = requestAnimationFrame(frame);
  }
  function pause() { clock.pause(); }
  function stop() { clock.stop(); dirty = true; }
  function seek(ms) { clock.seekTime(ms); dirty = true; }

  function setAnimation(idOrName) {
    const anim = scene.animations?.find(a => a.id === idOrName || a.name === idOrName);
    if (!anim) return false;
    clock.switchAnimation(anim);
    dirty = true;
    return true;
  }

  function setParam(id, value) { paramValues[id] = value; dirty = true; }

  function setExpression(idOrName) {
    const exp = scene.expressions?.find(e => e.id === idOrName || e.name === idOrName);
    if (!exp) return false;
    for (const [pid, val] of Object.entries(exp.params ?? {})) paramValues[pid] = val;
    if (exp.blendShapes) {
      for (const node of scene.nodes) {
        if (node.type !== 'part' || !node.blendShapes?.length) continue;
        node.blendShapeValues = node.blendShapeValues ?? {};
        for (const [sid, val] of Object.entries(exp.blendShapes)) {
          if (node.blendShapes.some(s => s.id === sid)) node.blendShapeValues[sid] = val;
        }
      }
    }
    dirty = true;
    return true;
  }

  /** Point look-at: nx/ny are normalized (-1..1). Maps to look-at params if present. */
  function setPointer(nx, ny) {
    const pp = pointerParams ?? { angleX: 'ParamAngleX', angleY: 'ParamAngleY', eyeX: 'ParamEyeBallX', eyeY: 'ParamEyeBallY' };
    const set = (pid, norm) => {
      if (!pid) return;
      const def = scene.parameters?.find(p => p.id === pid);
      if (!def) return;
      const mid = (def.min + def.max) / 2;
      const half = (def.max - def.min) / 2;
      paramValues[pid] = mid + norm * half;
    };
    set(pp.angleX, nx); set(pp.angleY, -ny);
    set(pp.eyeX, nx); set(pp.eyeY, -ny);
    dirty = true;
  }

  function setView(v) { view = { ...view, ...v }; dirty = true; }
  function render() { resize(); renderOnce(); }

  function destroy() {
    destroyed = true;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    scenePass.destroy();
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  resize();
  const first = initialAnimation
    ? scene.animations?.find(a => a.id === initialAnimation || a.name === initialAnimation)
    : scene.animations?.[0];
  if (first) clock.switchAnimation(first);
  if (autoplay) play(); else renderOnce();

  return {
    play, pause, stop, seek,
    setAnimation, setParam, setExpression, setPointer, setView,
    resize, render, destroy,
    get clock() { return clock; },
    get scene() { return scene; },
  };
}
