import { ERROR_CODES, milimError, structuredError } from "./errors.js";

const CROSSFADE_MS = 360;
const MAX_PARTICLES = 64;

const PLANE_VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec2 a_uv;
uniform vec2 u_translation;
uniform vec2 u_scale;
uniform float u_rotation;
out vec2 v_uv;
void main() {
  float c = cos(u_rotation);
  float s = sin(u_rotation);
  vec2 scaled = a_position * u_scale;
  vec2 rotated = vec2(scaled.x * c - scaled.y * s, scaled.x * s + scaled.y * c);
  gl_Position = vec4(rotated + u_translation, 0.0, 1.0);
  v_uv = a_uv;
}`;

const PLANE_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
uniform sampler2D u_texture;
uniform float u_opacity;
uniform float u_light;
uniform float u_time;
uniform float u_reflection;
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec4 color = texture(u_texture, v_uv);
  if (color.a <= 0.001) discard;
  float sweepAt = fract(u_time * 0.00008) * 1.8 - 0.4;
  float sweep = smoothstep(0.16, 0.0, abs(v_uv.x - sweepAt)) * u_light;
  color.rgb += sweep * color.a;
  color.rgb = mix(color.rgb, color.rgb * vec3(0.35, 0.52, 0.7), u_reflection);
  outColor = vec4(color.rgb, color.a * u_opacity);
}`;

const PARTICLE_VERTEX_SHADER = `#version 300 es
in vec2 a_particle;
uniform float u_time;
uniform vec2 u_parallax;
void main() {
  float drift = fract(a_particle.y + u_time * 0.000035);
  vec2 position = vec2(a_particle.x + sin(u_time * 0.001 + a_particle.y * 17.0) * 0.018, drift * 2.0 - 1.0);
  position += u_parallax * 0.025;
  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 2.0 + fract(a_particle.x * 19.0) * 3.0;
}`;

const PARTICLE_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
uniform float u_opacity;
out vec4 outColor;
void main() {
  float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
  float alpha = smoothstep(0.5, 0.12, distanceFromCenter) * u_opacity;
  outColor = vec4(0.45, 0.9, 1.0, alpha);
}`;

export function createWebGL2Renderer(canvas, options = {}) {
  if (!canvas || typeof canvas.getContext !== "function") throw unavailable("A canvas element is required");
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    depth: false,
    stencil: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  });
  if (!gl) throw unavailable("WebGL2 is not supported");

  const platform = options.platform ?? defaultPlatform();
  const emitStatus = typeof options.emitStatus === "function" ? options.emitStatus : () => {};
  const onContextState = typeof options.onContextState === "function" ? options.onContextState : () => {};
  const reducedMotion = options.reducedMotion === true;
  const decodedImages = new Map();
  const textures = new Map();
  const textureLoads = new Map();
  let model = null;
  let currentScene = null;
  let previousScene = null;
  let transitionStartedAt = 0;
  let lastSceneClockMs = 0;
  let gpu = null;
  let resizeObserver = null;
  let contextLost = false;
  let destroyed = false;

  try {
    gpu = createGPU(gl);
  } catch (cause) {
    throw unavailable(cause instanceof Error ? cause.message : String(cause));
  }

  const onContextLost = (event) => {
    event.preventDefault?.();
    if (destroyed) return;
    contextLost = true;
    gpu = null;
    textures.clear();
    onContextState(false);
    emitStatus({ type: "renderer", state: "context-lost" });
  };
  const onContextRestored = () => {
    if (destroyed) return;
    try {
      gpu = createGPU(gl);
      textures.clear();
      for (const [url, image] of decodedImages) uploadTexture(url, image);
      contextLost = false;
      resize();
      onContextState(true);
      emitStatus({ type: "renderer", state: "context-restored" });
    } catch (cause) {
      contextLost = true;
      onContextState(false);
      emitStatus({ type: "error", error: structuredError(unavailable(cause instanceof Error ? cause.message : String(cause))) });
    }
  };
  const onWindowResize = () => resize();
  canvas.addEventListener("webglcontextlost", onContextLost, false);
  canvas.addEventListener("webglcontextrestored", onContextRestored, false);
  if (platform.ResizeObserver) {
    resizeObserver = new platform.ResizeObserver(() => resize());
    resizeObserver.observe(canvas);
  } else {
    platform.window?.addEventListener?.("resize", onWindowResize);
  }
  resize();

  return {
    async initialize(nextModel, scene, initial = {}) {
      ensureAlive();
      model = nextModel;
      currentScene = scene;
      const modelJobs = model.textures.map((texture) => ({
        texture,
        promise: loadTexture(texture.url, "model", texture.id),
      }));
      const sceneJobs = sceneLayers(scene).map((layer) => loadTexture(layer.url, "scene", layer.id));
      const minimumModelIds = selectedTextureIds(model, initial.defaults);
      const minimumModelJobs = modelJobs
        .filter(({ texture }, index) => index === 0 || minimumModelIds.has(texture.id))
        .map(({ promise }) => promise);
      await Promise.all([...minimumModelJobs, sceneJobs[0]]);
      const allReady = settleOptional([...modelJobs.map(({ promise }) => promise), ...sceneJobs]);
      return { allReady };
    },

    async setScene(scene) {
      ensureAlive();
      const jobs = sceneLayers(scene).map((layer) => loadTexture(layer.url, "scene", layer.id));
      await jobs[0];
      settleOptional(jobs);
      previousScene = currentScene;
      currentScene = scene;
      transitionStartedAt = lastSceneClockMs;
    },

    draw(frame) {
      if (destroyed || contextLost || !gpu || !model || !currentScene) return;
      lastSceneClockMs = frame.sceneClockMs;
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const progress = reducedMotion
        ? 1
        : clamp((frame.sceneClockMs - transitionStartedAt) / CROSSFADE_MS, 0, 1);
      if (previousScene && progress < 1) drawScene(previousScene, frame, 1 - progress);
      drawScene(currentScene, frame, previousScene ? progress : 1);
      if (progress >= 1) previousScene = null;
      drawParticles(currentScene, frame, previousScene ? progress : 1);
      drawModel(frame, currentScene.effects.reflection);
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
      canvas.removeEventListener("webglcontextrestored", onContextRestored, false);
      resizeObserver?.disconnect();
      platform.window?.removeEventListener?.("resize", onWindowResize);
      if (!contextLost && gpu) deleteGPU(gl, gpu, textures);
      for (const image of decodedImages.values()) image.close?.();
      decodedImages.clear();
      textures.clear();
      textureLoads.clear();
      gpu = null;
      model = null;
      currentScene = null;
      previousScene = null;
    },
  };

  async function settleOptional(jobs) {
    const results = await Promise.allSettled(jobs);
    for (const result of results) {
      if (result.status === "rejected") emitStatus({ type: "error", error: errorShape(result.reason) });
    }
  }

  function loadTexture(url, owner, id) {
    if (decodedImages.has(url)) {
      if (!textures.has(url) && !contextLost) uploadTexture(url, decodedImages.get(url));
      return Promise.resolve();
    }
    if (textureLoads.has(url)) return textureLoads.get(url);
    const job = decodeTexture(url, owner, id).finally(() => {
      if (textureLoads.get(url) === job) textureLoads.delete(url);
    });
    textureLoads.set(url, job);
    return job;
  }

  async function decodeTexture(url, owner, id) {
    let image;
    try {
      image = await platform.decodeImage(url);
    } catch (cause) {
      const code = owner === "model" ? ERROR_CODES.MODEL_INVALID : ERROR_CODES.SCENE_INVALID;
      throw milimError(code, `Milim ${owner} texture could not be decoded`, {
        id,
        url,
        reason: cause instanceof Error ? cause.message : String(cause),
      });
    }
    if (destroyed) {
      image.close?.();
      return;
    }
    decodedImages.set(url, image);
    if (!contextLost) uploadTexture(url, image);
  }

  function uploadTexture(url, image) {
    const texture = gl.createTexture();
    if (!texture) throw new Error("Could not allocate a WebGL texture");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    textures.set(url, texture);
  }

  function drawScene(scene, frame, opacity) {
    const crop = scene.crops[viewportClass(canvas.clientWidth || canvas.width)];
    for (const layer of sceneLayers(scene)) {
      const texture = textures.get(layer.url);
      if (!texture) continue;
      const parallax = reducedMotion ? 0 : scene.effects.parallax * layer.depth * 0.045;
      const transform = sceneCropTransform(crop, {
        x: frame.secondary.parallax.x * parallax,
        y: frame.secondary.parallax.y * parallax,
      });
      drawPlane(texture, {
        translation: transform.translation,
        scale: transform.scale,
        rotation: 0,
        opacity: opacity * layer.opacity,
        light: reducedMotion ? 0 : scene.effects.lightSweep,
        reflection: 0,
        time: frame.sceneClockMs,
      });
    }
  }

  function sceneLayers(scene) {
    return reducedMotion
      ? [{ id: "reduced-motion", url: scene.reducedMotion, depth: 0, opacity: 1 }]
      : scene.layers;
  }

  function drawModel(frame, reflection) {
    if (model.formatVersion === 2) {
      drawProductionModel(frame, reflection);
      return;
    }
    const layers = modelTextureLayers(frame);
    const spriteScale = containScale(model.canvas.width / model.canvas.height, canvas.width / canvas.height);
    const translation = [
      frame.transform.x + frame.head.x * 0.035 + frame.gaze.x * 0.012,
      frame.transform.y - frame.head.y * 0.025,
    ];
    const rotation = frame.transform.rotation + frame.head.z * 0.08;
    if (reflection > 0 && layers[0]) {
      const texture = textures.get(layers[0].url);
      if (texture) drawPlane(texture, {
        translation: [translation[0], translation[1] - spriteScale[1] * 1.5],
        scale: [spriteScale[0] * frame.transform.scale, -spriteScale[1] * frame.transform.scale * 0.48],
        rotation,
        opacity: reflection * 0.22,
        light: 0,
        reflection: 0.7,
        time: frame.clockMs,
      });
    }
    for (const layer of layers) {
      const texture = textures.get(layer.url);
      if (!texture) continue;
      drawPlane(texture, {
        translation,
        scale: [spriteScale[0] * frame.transform.scale, spriteScale[1] * frame.transform.scale],
        rotation,
        opacity: layer.opacity,
        light: 0,
        reflection: 0,
        time: frame.clockMs,
      });
    }
  }

  function drawProductionModel(frame, reflection) {
    const parts = productionParts(frame);
    const byTexture = new Map(model.textures.map((texture) => [texture.id, texture]));
    const spriteScale = containScale(model.canvas.width / model.canvas.height, canvas.width / canvas.height);
    const translation = [frame.transform.x, frame.transform.y];
    const rotation = frame.transform.rotation;
    if (reflection > 0 && parts[0]) {
      const texture = textures.get(byTexture.get(parts[0].texture)?.url);
      if (texture) drawPlane(texture, {
        translation: [translation[0], translation[1] - spriteScale[1] * 1.5],
        scale: [spriteScale[0] * frame.transform.scale, -spriteScale[1] * frame.transform.scale * 0.48],
        rotation,
        opacity: reflection * 0.22,
        light: 0,
        reflection: 0.7,
        time: frame.clockMs,
      });
    }
    for (const part of parts) {
      const texture = textures.get(byTexture.get(part.texture)?.url);
      if (!texture) continue;
      drawProductionPart(part, texture, frame, {
        translation,
        scale: [spriteScale[0] * frame.transform.scale, spriteScale[1] * frame.transform.scale],
        rotation,
        light: 0,
        reflection: 0,
        time: frame.clockMs,
      });
    }
  }

  function drawProductionPart(part, texture, frame, uniforms) {
    const evaluated = evaluateProductionPart(part, frame);
    const opacity = clamp((frame.partOpacities?.[part.id] ?? 1) * evaluated.opacity, 0, 1);
    const masks = part.masks
      .map((maskId) => model.masks.find(({ id }) => id === maskId))
      .filter(Boolean);
    if (masks.length === 0) {
      drawMesh(texture, evaluated.vertices, { ...uniforms, opacity });
      return;
    }

    const include = masks.filter(({ mode }) => mode === "include");
    const exclude = masks.filter(({ mode }) => mode === "exclude");
    gl.enable(gl.STENCIL_TEST);
    gl.stencilMask(0xff);
    gl.clearStencil(include.length > 0 ? 0 : 1);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.colorMask(false, false, false, false);

    include.forEach((mask, index) => {
      gl.stencilFunc(gl.EQUAL, index, 0xff);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
      drawMaskSource(mask.sourcePart, frame, uniforms);
    });
    for (const mask of exclude) {
      gl.stencilFunc(gl.ALWAYS, 0, 0xff);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
      drawMaskSource(mask.sourcePart, frame, uniforms);
    }

    gl.colorMask(true, true, true, true);
    gl.stencilMask(0);
    gl.stencilFunc(gl.EQUAL, include.length > 0 ? include.length : 1, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    drawMesh(texture, evaluated.vertices, { ...uniforms, opacity });
    gl.stencilMask(0xff);
    gl.disable(gl.STENCIL_TEST);
  }

  function drawMaskSource(partId, frame, uniforms) {
    const part = model.parts.find(({ id }) => id === partId);
    const textureDefinition = model.textures.find(({ id }) => id === part?.texture);
    const texture = textures.get(textureDefinition?.url);
    if (!part || !texture) return;
    const evaluated = evaluateProductionPart(part, frame);
    drawMesh(texture, evaluated.vertices, { ...uniforms, opacity: 1 });
  }

  function evaluateProductionPart(part, frame) {
    const anchor = model.anchors.find(({ id }) => id === part.anchor) ?? { x: 0, y: 0 };
    const positions = part.mesh.vertices.map(({ x, y }) => [x, y]);
    let opacity = 1;
    for (const deformer of model.deformers) {
      if (!part.deformers.includes(deformer.id) || !deformer.parts.includes(part.id)) continue;
      const channel = Number.isFinite(frame.channels?.[deformer.channel]) ? frame.channels[deformer.channel] : 0;
      const sampled = sampleDeformer(deformer, channel);
      if (deformer.kind === "warp") {
        sampled.offsets.forEach(([dx, dy], index) => {
          positions[index][0] += dx;
          positions[index][1] += dy;
        });
        continue;
      }
      const cosine = Math.cos(sampled.rotation);
      const sine = Math.sin(sampled.rotation);
      for (const position of positions) {
        const x = (position[0] - anchor.x) * sampled.scale[0];
        const y = (position[1] - anchor.y) * sampled.scale[1];
        position[0] = anchor.x + x * cosine - y * sine + sampled.translate[0];
        position[1] = anchor.y + x * sine + y * cosine + sampled.translate[1];
      }
      opacity *= sampled.opacity;
    }
    const vertices = [];
    for (const triangle of part.mesh.triangles) {
      for (const index of triangle) {
        const [x, y] = positions[index];
        const source = part.mesh.vertices[index];
        vertices.push(
          x / model.canvas.width * 2 - 1,
          1 - y / model.canvas.height * 2,
          source.u,
          source.v,
        );
      }
    }
    return { vertices: new Float32Array(vertices), opacity };
  }

  function productionParts(frame) {
    const selected = new Set();
    for (const kind of ["hair", "outfit", "pose"]) {
      const pack = model.appearances[kind].find(({ id }) => id === frame.appearance[kind]);
      for (const partId of pack?.parts ?? []) selected.add(partId);
    }
    return model.parts
      .filter((part) => {
        if (["hair", "outfit", "pose"].includes(part.slot)) {
          return selected.has(part.id) || (frame.motionPartOpacities?.[part.id] ?? 0) > 0;
        }
        if (part.slot === "expression") return (frame.partOpacities?.[part.id] ?? 0) > 0;
        return (frame.partOpacities?.[part.id] ?? 1) > 0;
      })
      .sort((a, b) => a.drawOrder - b.drawOrder);
  }

  function modelTextureLayers(frame) {
    const byId = new Map(model.textures.map((texture) => [texture.id, texture.url]));
    const candidates = [
      model.textures[0]?.id,
      frame.appearance.hair,
      `hair-${frame.appearance.hair}`,
      `milim-hair-${frame.appearance.hair}`,
      frame.appearance.outfit,
      `outfit-${frame.appearance.outfit}`,
      `milim-outfit-${frame.appearance.outfit}`,
      frame.appearance.pose,
      `pose-${frame.appearance.pose}`,
      `milim-pose-${frame.appearance.pose}`,
    ];
    const layers = [...new Set(candidates.map((id) => byId.get(id)).filter(Boolean))]
      .map((url) => ({ url, opacity: 1 }));
    const expressionLayers = Array.isArray(frame.expressionLayers)
      ? frame.expressionLayers
      : [{ texture: frame.expressionTexture, opacity: 1 }];
    for (const expression of expressionLayers) {
      const url = byId.get(expression.texture);
      if (!url || expression.opacity <= 0) continue;
      const opacity = clamp(expression.opacity, 0, 1);
      const existing = layers.find((layer) => layer.url === url);
      if (existing) existing.opacity = Math.max(existing.opacity, opacity);
      else layers.push({ url, opacity });
    }
    const motionURL = byId.get(frame.motionTexture);
    if (motionURL) layers.push({ url: motionURL, opacity: frame.motionOpacity });
    return layers;
  }

  function drawPlane(texture, uniforms) {
    gl.useProgram(gpu.plane.program);
    gl.bindVertexArray(gpu.plane.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gpu.plane.uniform.texture, 0);
    gl.uniform2fv(gpu.plane.uniform.translation, uniforms.translation);
    gl.uniform2fv(gpu.plane.uniform.scale, uniforms.scale);
    gl.uniform1f(gpu.plane.uniform.rotation, uniforms.rotation);
    gl.uniform1f(gpu.plane.uniform.opacity, uniforms.opacity);
    gl.uniform1f(gpu.plane.uniform.light, uniforms.light);
    gl.uniform1f(gpu.plane.uniform.time, uniforms.time);
    gl.uniform1f(gpu.plane.uniform.reflection, uniforms.reflection);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function drawMesh(texture, vertices, uniforms) {
    gl.useProgram(gpu.mesh.program);
    gl.bindVertexArray(gpu.mesh.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.mesh.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gpu.mesh.uniform.texture, 0);
    gl.uniform2fv(gpu.mesh.uniform.translation, uniforms.translation);
    gl.uniform2fv(gpu.mesh.uniform.scale, uniforms.scale);
    gl.uniform1f(gpu.mesh.uniform.rotation, uniforms.rotation);
    gl.uniform1f(gpu.mesh.uniform.opacity, uniforms.opacity);
    gl.uniform1f(gpu.mesh.uniform.light, uniforms.light);
    gl.uniform1f(gpu.mesh.uniform.time, uniforms.time);
    gl.uniform1f(gpu.mesh.uniform.reflection, uniforms.reflection);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 4);
  }

  function drawParticles(scene, frame, opacity) {
    const count = reducedMotion ? 0 : Math.min(MAX_PARTICLES, scene.effects.particles);
    if (count === 0) return;
    gl.useProgram(gpu.particles.program);
    gl.bindVertexArray(gpu.particles.vao);
    gl.uniform1f(gpu.particles.uniform.time, frame.sceneClockMs);
    gl.uniform2fv(gpu.particles.uniform.parallax, [
      frame.secondary.parallax.x * scene.effects.parallax,
      frame.secondary.parallax.y * scene.effects.parallax,
    ]);
    gl.uniform1f(gpu.particles.uniform.opacity, opacity * 0.65);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  function resize() {
    if (destroyed || contextLost) return;
    const bounds = canvas.getBoundingClientRect?.();
    const cssWidth = bounds?.width || canvas.clientWidth || 1;
    const cssHeight = bounds?.height || canvas.clientHeight || 1;
    const size = renderSize(cssWidth, cssHeight, platform.devicePixelRatio());
    if (canvas.width !== size.width) canvas.width = size.width;
    if (canvas.height !== size.height) canvas.height = size.height;
  }

  function ensureAlive() {
    if (destroyed) throw milimError(ERROR_CODES.DESTROYED, "Milim player has been destroyed");
  }
}

export function renderSize(cssWidth, cssHeight, devicePixelRatio) {
  const dpr = Math.min(2, Math.max(1, Number.isFinite(devicePixelRatio) ? devicePixelRatio : 1));
  return {
    width: Math.max(1, Math.round(cssWidth * dpr)),
    height: Math.max(1, Math.round(cssHeight * dpr)),
    dpr,
  };
}

export function sceneCropTransform(crop, parallax = { x: 0, y: 0 }) {
  const translation = [
    (0.5 - crop.x) * 2 + parallax.x,
    (crop.y - 0.5) * 2 + parallax.y,
  ];
  const scale = Math.max(
    crop.scale,
    1 + Math.abs(translation[0]),
    1 + Math.abs(translation[1]),
  );
  return { translation, scale: [scale, scale] };
}

function createGPU(gl) {
  const planeProgram = createProgram(gl, PLANE_VERTEX_SHADER, PLANE_FRAGMENT_SHADER);
  const meshProgram = createProgram(gl, PLANE_VERTEX_SHADER, PLANE_FRAGMENT_SHADER);
  const particleProgram = createProgram(gl, PARTICLE_VERTEX_SHADER, PARTICLE_FRAGMENT_SHADER);
  const plane = createPlane(gl, planeProgram);
  const mesh = createMesh(gl, meshProgram);
  const particles = createParticles(gl, particleProgram);
  return { plane, mesh, particles };
}

function createPlane(gl, program) {
  const vertices = new Float32Array([
    -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0,
    -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1, 0,
  ]);
  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  bindAttribute(gl, program, "a_position", 2, 16, 0);
  bindAttribute(gl, program, "a_uv", 2, 16, 8);
  return {
    program,
    vao,
    buffer,
    uniform: {
      texture: uniform(gl, program, "u_texture"),
      translation: uniform(gl, program, "u_translation"),
      scale: uniform(gl, program, "u_scale"),
      rotation: uniform(gl, program, "u_rotation"),
      opacity: uniform(gl, program, "u_opacity"),
      light: uniform(gl, program, "u_light"),
      time: uniform(gl, program, "u_time"),
      reflection: uniform(gl, program, "u_reflection"),
    },
  };
}

function createParticles(gl, program) {
  const values = new Float32Array(MAX_PARTICLES * 2);
  for (let index = 0; index < MAX_PARTICLES; index += 1) {
    values[index * 2] = fract(index * 0.61803398875) * 2 - 1;
    values[index * 2 + 1] = fract(index * 0.38196601125);
  }
  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
  bindAttribute(gl, program, "a_particle", 2, 8, 0);
  return {
    program,
    vao,
    buffer,
    uniform: {
      time: uniform(gl, program, "u_time"),
      parallax: uniform(gl, program, "u_parallax"),
      opacity: uniform(gl, program, "u_opacity"),
    },
  };
}

function createMesh(gl, program) {
  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.DYNAMIC_DRAW);
  bindAttribute(gl, program, "a_position", 2, 16, 0);
  bindAttribute(gl, program, "a_uv", 2, 16, 8);
  return {
    program,
    vao,
    buffer,
    uniform: {
      texture: uniform(gl, program, "u_texture"),
      translation: uniform(gl, program, "u_translation"),
      scale: uniform(gl, program, "u_scale"),
      rotation: uniform(gl, program, "u_rotation"),
      opacity: uniform(gl, program, "u_opacity"),
      light: uniform(gl, program, "u_light"),
      time: uniform(gl, program, "u_time"),
      reflection: uniform(gl, program, "u_reflection"),
    },
  };
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not allocate a WebGL program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const detail = gl.getProgramInfoLog(program) || "unknown link error";
    gl.deleteProgram(program);
    throw new Error(`WebGL program link failed: ${detail}`);
  }
  return program;
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not allocate a WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const detail = gl.getShaderInfoLog(shader) || "unknown compile error";
    gl.deleteShader(shader);
    throw new Error(`WebGL shader compile failed: ${detail}`);
  }
  return shader;
}

function bindAttribute(gl, program, name, size, stride, offset) {
  const location = gl.getAttribLocation(program, name);
  if (location < 0) throw new Error(`WebGL attribute ${name} is unavailable`);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
}

function uniform(gl, program, name) {
  const location = gl.getUniformLocation(program, name);
  if (location === null) throw new Error(`WebGL uniform ${name} is unavailable`);
  return location;
}

function deleteGPU(gl, gpu, textures) {
  for (const texture of textures.values()) gl.deleteTexture(texture);
  gl.deleteBuffer(gpu.plane.buffer);
  gl.deleteVertexArray(gpu.plane.vao);
  gl.deleteProgram(gpu.plane.program);
  gl.deleteBuffer(gpu.mesh.buffer);
  gl.deleteVertexArray(gpu.mesh.vao);
  gl.deleteProgram(gpu.mesh.program);
  gl.deleteBuffer(gpu.particles.buffer);
  gl.deleteVertexArray(gpu.particles.vao);
  gl.deleteProgram(gpu.particles.program);
}

function sampleDeformer(deformer, channel) {
  const keyforms = [...deformer.keyforms].sort((a, b) => a.at - b.at);
  if (channel <= keyforms[0].at) return cloneKeyformValue(deformer.kind, keyforms[0]);
  if (channel >= keyforms.at(-1).at) return cloneKeyformValue(deformer.kind, keyforms.at(-1));
  const afterIndex = keyforms.findIndex(({ at }) => at >= channel);
  const before = keyforms[afterIndex - 1];
  const after = keyforms[afterIndex];
  const amount = (channel - before.at) / (after.at - before.at);
  if (deformer.kind === "warp") {
    return {
      offsets: before.offsets.map(([x, y], index) => [
        lerp(x, after.offsets[index][0], amount),
        lerp(y, after.offsets[index][1], amount),
      ]),
    };
  }
  return {
    translate: lerpPoint(before.value.translate, after.value.translate, amount),
    scale: lerpPoint(before.value.scale, after.value.scale, amount),
    rotation: lerp(before.value.rotation, after.value.rotation, amount),
    opacity: lerp(before.value.opacity, after.value.opacity, amount),
  };
}

function cloneKeyformValue(kind, keyform) {
  if (kind === "warp") return { offsets: keyform.offsets.map((point) => [...point]) };
  return {
    translate: [...keyform.value.translate],
    scale: [...keyform.value.scale],
    rotation: keyform.value.rotation,
    opacity: keyform.value.opacity,
  };
}

function lerpPoint(from, to, amount) {
  return [lerp(from[0], to[0], amount), lerp(from[1], to[1], amount)];
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function viewportClass(width) {
  if (width <= 640) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function containScale(contentAspect, viewportAspect) {
  const maximum = 0.9;
  if (contentAspect > viewportAspect) return [maximum, maximum * viewportAspect / contentAspect];
  return [maximum * contentAspect / viewportAspect, maximum];
}

function selectedTextureIds(model, defaults) {
  const available = new Set(model.textures.map(({ id }) => id));
  const selected = new Set();
  const expression = model.expressions.find(({ id }) => id === defaults?.expression);
  if (expression) selected.add(expression.texture);
  for (const key of ["hair", "outfit", "pose"]) {
    const value = defaults?.[key];
    if (!value) continue;
    if (available.has(value)) selected.add(value);
    if (available.has(`${key}-${value}`)) selected.add(`${key}-${value}`);
  }
  return selected;
}

function defaultPlatform() {
  return {
    decodeImage: nativeDecodeImage,
    devicePixelRatio: () => globalThis.devicePixelRatio ?? 1,
    ResizeObserver: globalThis.ResizeObserver,
    window: globalThis.window,
  };
}

async function nativeDecodeImage(url) {
  const response = await globalThis.fetch(url, { credentials: "same-origin", redirect: "error" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  if (typeof globalThis.createImageBitmap === "function") return globalThis.createImageBitmap(blob);
  if (typeof globalThis.Image !== "function" || typeof globalThis.URL?.createObjectURL !== "function") {
    throw new Error("No browser-native image decoder is available");
  }
  const objectURL = globalThis.URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const image = new globalThis.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image decode failed"));
      image.src = objectURL;
    });
  } finally {
    globalThis.URL.revokeObjectURL(objectURL);
  }
}

function errorShape(error) {
  if (error?.code && error?.message) return structuredError(error);
  return structuredError(unavailable(error instanceof Error ? error.message : String(error)));
}

function unavailable(reason) {
  return milimError(ERROR_CODES.RENDERER_UNAVAILABLE, "Milim WebGL2 renderer is unavailable", { reason });
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function fract(value) {
  return value - Math.floor(value);
}
