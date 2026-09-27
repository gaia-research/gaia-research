/*
 * Adapted from Stretchy Studio — https://github.com/MangoLion/stretchystudio
 * Original source: src/renderer/program.js
 * Copyright (c) 2026 Nguyen Phan. MIT License. See NOTICE at repo root.
 * Adapted for milim-live2d-model (framework-agnostic runtime), (c) 2026 Gaia Research.
 */

/**
 * WebGL2 shader program helpers — compile, link, cache uniform locations.
 */

/**
 * Compile a single shader stage.
 * @param {WebGL2RenderingContext} gl
 * @param {number}                type   - gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
 * @param {string}                source
 * @returns {WebGLShader}
 */
export function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error:\n${log}`);
  }
  return shader;
}

/**
 * Link a vertex + fragment shader into a program.
 * @param {WebGL2RenderingContext} gl
 * @param {string}                vertSrc
 * @param {string}                fragSrc
 * @returns {{ program: WebGLProgram, uniforms: (name:string)=>WebGLUniformLocation }}
 */
export function createProgram(gl, vertSrc, fragSrc) {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);

  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  gl.deleteShader(vert);
  gl.deleteShader(frag);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error:\n${log}`);
  }

  const cache = {};
  const uniforms = (name) => {
    if (!(name in cache)) cache[name] = gl.getUniformLocation(program, name);
    return cache[name];
  };

  return { program, uniforms };
}
