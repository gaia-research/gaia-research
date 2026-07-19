import { mountMilimWithRuntime } from "./mount.js";
import { createWebGL2Renderer } from "./webgl2-renderer.js";

export function mountMilim(canvas, options = {}) {
  const globalObject = globalThis;
  return mountMilimWithRuntime(canvas, options, {
    baseURL: globalObject.document?.baseURI,
    fetch: globalObject.fetch?.bind(globalObject),
    createRenderer: createWebGL2Renderer,
    scheduler: {
      request: globalObject.requestAnimationFrame?.bind(globalObject),
      cancel: globalObject.cancelAnimationFrame?.bind(globalObject),
    },
    visibility: globalObject.document,
  });
}
