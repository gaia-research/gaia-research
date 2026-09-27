/*
 * Adapted from Stretchy Studio — https://github.com/MangoLion/stretchystudio
 * Original source: src/renderer/transforms.js
 * Copyright (c) 2026 Nguyen Phan. MIT License. See NOTICE at repo root.
 * Adapted for milim-live2d-model (framework-agnostic runtime), (c) 2026 Gaia Research.
 */

/**
 * 2D transform utilities — shared between the renderer and UI components.
 *
 * All matrices are 3×3 column-major Float32Array(9).
 * Index convention: m[col*3 + row]
 *
 *  col0  col1  col2
 *  [0]   [3]   [6]   row 0
 *  [1]   [4]   [7]   row 1
 *  [2]   [5]   [8]   row 2
 */

/** Identity matrix */
export function mat3Identity() {
  return new Float32Array([1, 0, 0,  0, 1, 0,  0, 0, 1]);
}

/**
 * Multiply two column-major 3×3 matrices: C = A × B
 */
export function mat3Mul(a, b) {
  const c = new Float32Array(9);
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      c[col * 3 + row] =
        a[row]     * b[col * 3]     +
        a[3 + row] * b[col * 3 + 1] +
        a[6 + row] * b[col * 3 + 2];
    }
  }
  return c;
}

/**
 * Invert a 2D affine 3×3 column-major matrix.
 * Assumes no perspective (last row is [0, 0, 1]).
 */
export function mat3Inverse(m) {
  const a = m[0], b = m[1];   // col 0
  const c = m[3], d = m[4];   // col 1
  const tx = m[6], ty = m[7]; // col 2
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-10) return mat3Identity();
  const inv = 1 / det;
  return new Float32Array([
     d  * inv,              // [0]
    -b  * inv,              // [1]
     0,                     // [2]
    -c  * inv,              // [3]
     a  * inv,              // [4]
     0,                     // [5]
    (c * ty - d * tx) * inv, // [6]
    (b * tx - a * ty) * inv, // [7]
     1,                     // [8]
  ]);
}

/**
 * Build a local 3×3 matrix from a node's transform properties.
 *
 * Applies (right to left):
 *   T(x+pivotX, y+pivotY) × R(rotation°) × S(scaleX, scaleY) × T(-pivotX, -pivotY)
 *
 * @param {{ x?, y?, rotation?, scaleX?, scaleY?, pivotX?, pivotY? }|null|undefined} t
 */
export function makeLocalMatrix(t) {
  const {
    x = 0, y = 0,
    rotation = 0,
    scaleX = 1, scaleY = 1,
    pivotX = 0, pivotY = 0,
  } = t ?? {};

  const θ = rotation * (Math.PI / 180);
  const c = Math.cos(θ);
  const s = Math.sin(θ);

  const m0 = scaleX * c;
  const m1 = scaleX * s;
  const m3 = -scaleY * s;
  const m4 = scaleY * c;

  return new Float32Array([
     m0,                                        // [0]
     m1,                                        // [1]
     0,                                         // [2]
     m3,                                        // [3]
     m4,                                        // [4]
     0,                                         // [5]
    (x + pivotX) - m0 * pivotX - m3 * pivotY,   // [6]
    (y + pivotY) - m1 * pivotX - m4 * pivotY,   // [7]
     1,                                         // [8]
  ]);
}

/**
 * Compute world matrices for every node in a flat array.
 * world = parentWorld × local  (depth-first, memoised).
 *
 * @param {Array} nodes  Flat node array from projectStore
 * @returns {Map<string, Float32Array>}  nodeId → column-major 3×3
 */
export function computeWorldMatrices(nodes) {
  const worldMap = new Map();
  const nodeMap  = new Map(nodes.map(n => [n.id, n]));

  function resolve(node) {
    if (worldMap.has(node.id)) return worldMap.get(node.id);
    const local = makeLocalMatrix(node.transform);
    const world = (node.parent && nodeMap.has(node.parent))
      ? mat3Mul(resolve(nodeMap.get(node.parent)), local)
      : local;
    worldMap.set(node.id, world);
    return world;
  }

  for (const node of nodes) resolve(node);
  return worldMap;
}

/**
 * Compute effective visibility and opacity for every node by walking the
 * parent chain and accumulating values (depth-first, memoised).
 *
 * A node is effectively visible only when it AND all ancestors are visible.
 * Effective opacity is the product of a node's own opacity with all ancestor
 * opacities (mirrors how Photoshop / After Effects layer groups behave).
 *
 * @param {Array} nodes  Flat node array from projectStore
 * @returns {{ visMap: Map<string,boolean>, opMap: Map<string,number> }}
 */
export function computeEffectiveProps(nodes) {
  const visMap  = new Map();
  const opMap   = new Map();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  function resolve(node) {
    if (visMap.has(node.id)) return;
    const parentId = node.parent;
    if (parentId && nodeMap.has(parentId)) {
      resolve(nodeMap.get(parentId));
      visMap.set(node.id, visMap.get(parentId) && (node.visible !== false));
      opMap.set(node.id, opMap.get(parentId) * (node.opacity ?? 1));
    } else {
      visMap.set(node.id, node.visible !== false);
      opMap.set(node.id, node.opacity ?? 1);
    }
  }

  for (const node of nodes) resolve(node);
  return { visMap, opMap };
}
