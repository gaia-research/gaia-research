export const ERROR_CODES = Object.freeze({
  RELEASE_LOAD_FAILED: "MILIM_RELEASE_LOAD_FAILED",
  RELEASE_INCOMPATIBLE: "MILIM_RELEASE_INCOMPATIBLE",
  MODEL_INVALID: "MILIM_MODEL_INVALID",
  SCENE_INVALID: "MILIM_SCENE_INVALID",
  RENDERER_UNAVAILABLE: "MILIM_RENDERER_UNAVAILABLE",
  UNSUPPORTED_STATE: "MILIM_UNSUPPORTED_STATE",
  UNSUPPORTED_CONTROL: "MILIM_UNSUPPORTED_CONTROL",
  UNSUPPORTED_MOTION: "MILIM_UNSUPPORTED_MOTION",
  DESTROYED: "MILIM_DESTROYED",
});

export class MilimError extends Error {
  constructor(code, message, detail) {
    super(message);
    this.name = "MilimError";
    this.code = code;
    if (detail !== undefined) this.detail = detail;
  }

  toJSON() {
    return structuredError(this);
  }
}

export function milimError(code, message, detail) {
  return new MilimError(code, message, detail);
}

export function structuredError(error) {
  const result = { code: error.code, message: error.message };
  if (error.detail !== undefined) result.detail = error.detail;
  return Object.freeze(result);
}

export function errorResult(error) {
  return { ok: false, error: structuredError(error) };
}
