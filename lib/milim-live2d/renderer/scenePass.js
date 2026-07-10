/*
 * ScenePass — adapted from Stretchy Studio src/renderer/scenePass.js
 * https://github.com/MangoLion/stretchystudio — Copyright (c) 2026 Nguyen Phan, MIT.
 * Adapted for milim-live2d-model, (c) 2026 Gaia Research. See NOTICE at repo root.
 *
 * Changes from the original:
 *   - Dropped BackgroundRenderer (transparent player, no editor checkerboard).
 *   - Dropped the wireframe / vertices / edge-outline overlay pass (editor-only).
 *   - Dropped selection / meshEditMode dimming.
 *   - `view` is a plain { zoom, panX, panY }; iris clipping is always on.
 *   - Optional external DPR-aware sizing via `skipResize`.
 * The textured mesh pass and iris→eyewhite stencil clipping are unchanged.
 */
import { createProgram } from './program.js';
import { MESH_VERT, MESH_FRAG } from './shaders/mesh.js';
import { PartRenderer } from './partRenderer.js';
import { computeWorldMatrices, computeEffectiveProps, mat3Mul } from './transforms.js';
import { matchTag } from './tags.js';

/** Returns stencil info for iris/eyewhite clipping (match by side suffix). */
function getIrisStencilInfo(name) {
  const tag = matchTag(name);
  if (tag !== 'irides' && tag !== 'eyewhite') return null;
  const lower = String(name ?? '').toLowerCase();
  let sideId = 1; // Default/Center
  if (lower.includes('-l') || lower.includes('_l') || lower.includes(' l') || lower.endsWith(' l')) sideId = 2;
  else if (lower.includes('-r') || lower.includes('_r') || lower.includes(' r') || lower.endsWith(' r')) sideId = 3;
  return { type: tag, id: sideId };
}

/** Build the camera mat3: image-pixel world coords → NDC (Y flipped). */
function buildCameraMatrix(canvasW, canvasH, zoom, panX, panY) {
  const sx = (2 * zoom) / canvasW;
  const sy = -(2 * zoom) / canvasH;
  const tx = (panX / canvasW) * 2 - 1;
  const ty = 1 - (panY / canvasH) * 2;
  return new Float32Array([sx, 0, 0, 0, sy, 0, tx, ty, 1]);
}

export class ScenePass {
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl) {
    this.gl = gl;
    const meshProg = createProgram(gl, MESH_VERT, MESH_FRAG);
    this.meshProgram = meshProg.program;
    this.meshUniforms = meshProg.uniforms;
    this.partRenderer = new PartRenderer(gl, this.meshProgram, null);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied alpha
  }

  /**
   * Draw one frame.
   * @param {Object} project        - scene { nodes, canvas, ... }
   * @param {Object} view           - { zoom, panX, panY }
   * @param {Map|null} poseOverrides - Map<nodeId, {x?,y?,rotation?,scaleX?,scaleY?,opacity?,visible?}>
   * @param {Object} opts            - { skipResize }
   */
  draw(project, view, poseOverrides = null, { skipResize = false } = {}) {
    const { gl } = this;
    const { canvas } = gl;

    if (!skipResize) {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.stencilMask(0xFF);
    gl.clearStencil(0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    if (!project || !project.nodes || project.nodes.length === 0) return;

    const { zoom, panX, panY } = view;
    const camera = buildCameraMatrix(canvas.width, canvas.height, zoom, panX, panY);

    // Merge pose overrides into an effective node list (no scene mutation).
    const effectiveNodes = (poseOverrides && poseOverrides.size > 0)
      ? project.nodes.map(node => {
          const ov = poseOverrides.get(node.id);
          if (!ov) return node;
          const transformOv = { ...node.transform };
          for (const k of ['x', 'y', 'rotation', 'scaleX', 'scaleY']) {
            if (ov[k] !== undefined) transformOv[k] = ov[k];
          }
          return {
            ...node,
            transform: transformOv,
            opacity: ov.opacity !== undefined ? ov.opacity : node.opacity,
            visible: ov.visible !== undefined ? ov.visible : node.visible,
          };
        })
      : project.nodes;

    const worldMatrices = computeWorldMatrices(effectiveNodes);
    const { visMap, opMap } = computeEffectiveProps(effectiveNodes);

    const parts = effectiveNodes
      .filter(n => n.type === 'part')
      .sort((a, b) => a.draw_order - b.draw_order);

    gl.useProgram(this.meshProgram);
    const uMvp = this.meshUniforms('u_mvp');
    const uTexture = this.meshUniforms('u_texture');
    const uOpacity = this.meshUniforms('u_opacity');

    for (const part of parts) {
      if (!visMap.get(part.id)) continue;

      const sInfo = getIrisStencilInfo(part.name);
      if (sInfo) {
        gl.enable(gl.STENCIL_TEST);
        if (sInfo.type === 'eyewhite') {
          gl.stencilFunc(gl.ALWAYS, sInfo.id, 0xFF);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
          gl.stencilMask(0xFF);
        } else {
          gl.stencilFunc(gl.EQUAL, sInfo.id, 0xFF);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
          gl.stencilMask(0x00);
        }
      } else {
        gl.disable(gl.STENCIL_TEST);
      }

      const worldMatrix = worldMatrices.get(part.id);
      const partMvp = worldMatrix ? mat3Mul(camera, worldMatrix) : camera;
      const opacity = opMap.get(part.id) ?? 1;
      this.partRenderer.drawPart(part.id, partMvp, opacity, uMvp, uTexture, uOpacity);
    }
    gl.disable(gl.STENCIL_TEST);
  }

  get parts() { return this.partRenderer; }

  destroy() {
    this.partRenderer.destroyAll();
    this.gl.deleteProgram(this.meshProgram);
  }
}
