/*
 * milim-live2d-model — framework-agnostic WebGL2 runtime for the Milim "Live"
 * model. (c) 2026 Gaia Research, MIT. Built on Stretchy Studio's renderer &
 * playback engine (MIT, © 2026 Nguyen Phan) — see NOTICE. Please star & support
 * Stretchy Studio: https://github.com/MangoLion/stretchystudio
 *
 * Public surface:
 *   createMilimStage(canvas, { scene, textures, ... }) → imperative stage handle
 *   loadSceneBundle(url) → { scene, textures }   (fetch scene JSON + textures)
 *   fetchScene / loadTextures / loadImage / normalizeScene — granular loaders
 *   resolvePose — the pure deformation function (advanced / testing)
 *   PlaybackClock, ScenePass — lower-level building blocks
 */
export { createMilimStage } from './stage.js';
export {
  loadSceneBundle,
  fetchScene,
  normalizeScene,
  loadTextures,
  loadImage,
} from './loader.js';
export { resolvePose } from './playback/resolvePose.js';
export { PlaybackClock } from './playback/clock.js';
export { ScenePass } from './renderer/scenePass.js';

export const VERSION = '0.1.0';
