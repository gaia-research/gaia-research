/*
 * Deformation pipeline — extracted and reimplemented from Stretchy Studio's
 * per-frame tick in src/components/canvas/CanvasViewport.jsx (the React/rAF loop),
 * Copyright (c) 2026 Nguyen Phan, MIT. Reframed as pure functions (no React) for
 * milim-live2d-model, (c) 2026 Gaia Research. See NOTICE at repo root.
 *
 * resolvePose() takes a scene + playback clock + interactive parameter values and
 * returns the Map<nodeId, override> that ScenePass.draw consumes. It layers, in
 * order (matching the original priority):
 *   1. keyframe pose overrides from the active clip
 *   2. parameter-driven overrides (interactive sliders), where not already set
 *   3. blend shapes → mesh_verts (rest + Σ delta*influence)
 *   4. warp deformers → bilinear grid deformation of descendant meshes
 */
import {
  computePoseOverrides,
  computeParameterDrivenOverrides,
} from './animationEngine.js';

/**
 * @param {Object} scene   - { nodes, animations, parameters }
 * @param {PlaybackClock} clock
 * @param {Object} paramValues - { [paramId]: number }
 * @returns {Map<string, Object>|null}
 */
export function resolvePose(scene, clock, paramValues) {
  const activeAnim = scene.animations?.find(a => a.id === clock.activeAnimationId) ?? null;

  // 1. Keyframe pose overrides for the active clip.
  const endMs = (clock.endFrame / clock.fps) * 1000;
  let poseOverrides = activeAnim
    ? computePoseOverrides(activeAnim, clock.currentTime, clock.loopKeyframes, endMs)
    : new Map();

  // 2. Parameter-driven overrides (interactive), only where not already set.
  if (scene.parameters?.length > 0) {
    const paramOverrides = computeParameterDrivenOverrides(
      scene.animations,
      scene.parameters,
      paramValues,
    );
    for (const [nodeId, ov] of paramOverrides) {
      const existing = poseOverrides.get(nodeId) ?? {};
      for (const [prop, val] of Object.entries(ov)) {
        if (!(prop in existing)) existing[prop] = val;
      }
      poseOverrides.set(nodeId, existing);
    }
  }

  // 3. Blend shapes → mesh_verts.
  for (const node of scene.nodes) {
    if (node.type !== 'part' || !node.mesh || !node.blendShapes?.length) continue;
    const kfOv = poseOverrides.get(node.id);

    let hasInfluence = false;
    const influences = node.blendShapes.map(shape => {
      const prop = `blendShape:${shape.id}`;
      const v = kfOv?.[prop] ?? node.blendShapeValues?.[shape.id] ?? 0;
      if (v !== 0) hasInfluence = true;
      return v;
    });
    if (!hasInfluence) continue;

    const blendedVerts = node.mesh.vertices.map((v, i) => {
      let bx = v.restX, by = v.restY;
      for (let j = 0; j < node.blendShapes.length; j++) {
        const d = node.blendShapes[j].deltas[i];
        if (d) { bx += d.dx * influences[j]; by += d.dy * influences[j]; }
      }
      return { x: bx, y: by };
    });

    const existing = poseOverrides.get(node.id) ?? {};
    if (!existing.mesh_verts) poseOverrides.set(node.id, { ...existing, mesh_verts: blendedVerts });
  }

  // 4. Warp deformers: bilinear grid deformation of descendant meshes.
  for (const wd of scene.nodes) {
    if (wd.type !== 'warpDeformer') continue;
    const gridPts = poseOverrides.get(wd.id)?.mesh_verts;
    if (!gridPts?.length) continue;

    const { col = 2, row = 2, gridX = 0, gridY = 0, gridW = 1, gridH = 1 } = wd;
    const safeW = gridW || 1, safeH = gridH || 1;

    const collectDescendants = (parentId) => {
      const result = [];
      for (const n of scene.nodes) {
        if (n.parent !== parentId) continue;
        if (n.type === 'part' && n.mesh) result.push(n);
        else if ((n.type === 'group' || n.type === 'warpDeformer') && n.visible !== false)
          result.push(...collectDescendants(n.id));
      }
      return result;
    };

    for (const child of collectDescendants(wd.id)) {
      const restVerts = child.mesh.vertices;
      const curVerts = poseOverrides.get(child.id)?.mesh_verts ?? restVerts;
      const warped = restVerts.map((rv, vi) => {
        const px = rv.x ?? rv.restX, py = rv.y ?? rv.restY;
        const s = Math.max(0, Math.min(1, (px - gridX) / safeW));
        const t = Math.max(0, Math.min(1, (py - gridY) / safeH));
        const ci = Math.min(Math.floor(s * col), col - 1);
        const ri = Math.min(Math.floor(t * row), row - 1);
        const u = s * col - ci;
        const vv = t * row - ri;
        const p00 = gridPts[ri * (col + 1) + ci];
        const p10 = gridPts[ri * (col + 1) + ci + 1];
        const p01 = gridPts[(ri + 1) * (col + 1) + ci];
        const p11 = gridPts[(ri + 1) * (col + 1) + ci + 1];
        const cv = curVerts[vi];
        if (!p00 || !p10 || !p01 || !p11) return { x: cv.x ?? px, y: cv.y ?? py };
        const tx = (1 - u) * (1 - vv) * p00.x + u * (1 - vv) * p10.x + (1 - u) * vv * p01.x + u * vv * p11.x;
        const ty = (1 - u) * (1 - vv) * p00.y + u * (1 - vv) * p10.y + (1 - u) * vv * p01.y + u * vv * p11.y;
        return { x: (cv.x ?? px) + (tx - px), y: (cv.y ?? py) + (ty - py) };
      });
      const ex = poseOverrides.get(child.id) ?? {};
      poseOverrides.set(child.id, { ...ex, mesh_verts: warped });
    }
  }

  return poseOverrides.size > 0 ? poseOverrides : null;
}
