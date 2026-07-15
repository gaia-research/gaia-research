class ValidationFailure extends Error {
  constructor(path, reason) {
    super(`${path}: ${reason}`);
    this.path = path;
    this.reason = reason;
  }
}

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const RELEASE = /^milim-web-[0-9]+\.[0-9]+\.[0-9]+$/;
const RELEASE_PATH = /^\.\/[A-Za-z0-9._/-]+$/;
const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{7,40}$/;

export function validateRelease(value) {
  object(value, "$", [
    "format", "formatVersion", "release", "compatibility", "player", "model",
    "scenes", "defaults", "fallbacks", "files", "source",
  ]);
  equal(value.format, "milim-release", "$.format");
  equal(value.formatVersion, 1, "$.formatVersion");
  stringPattern(value.release, RELEASE, "$.release");

  object(value.compatibility, "$.compatibility", ["major"]);
  integer(value.compatibility.major, "$.compatibility.major");
  versionedEntry(value.player, "$.player", "entry");
  catalogEntry(value.model, "$.model");
  array(value.scenes, "$.scenes", 1);
  value.scenes.forEach((entry, index) => catalogEntry(entry, `$.scenes[${index}]`));
  unique(value.scenes.map(({ id }) => id), "$.scenes", "scene id");

  object(value.defaults, "$.defaults", ["hair", "outfit", "pose", "expression", "scene"]);
  for (const key of ["hair", "outfit", "pose", "expression", "scene"]) {
    stringPattern(value.defaults[key], ID, `$.defaults.${key}`);
  }

  object(value.fallbacks, "$.fallbacks", ["desktop", "tablet", "mobile", "reducedMotion"]);
  for (const key of ["desktop", "tablet", "mobile", "reducedMotion"]) {
    releasePath(value.fallbacks[key], `$.fallbacks.${key}`);
  }

  array(value.files, "$.files", 1);
  const paths = [];
  value.files.forEach((file, index) => {
    const path = `$.files[${index}]`;
    object(file, path, ["path", "bytes", "sha256"]);
    releasePath(file.path, `${path}.path`);
    integer(file.bytes, `${path}.bytes`, 0);
    stringPattern(file.sha256, SHA256, `${path}.sha256`);
    paths.push(file.path);
  });
  unique(paths, "$.files", "file path");
  if (paths.includes("./release.json")) fail("$.files", "must not list release.json");

  object(value.source, "$.source", ["repository", "commit", "releasedAt"]);
  equal(value.source.repository, "gaia-research/milim", "$.source.repository");
  stringPattern(value.source.commit, COMMIT, "$.source.commit");
  string(value.source.releasedAt, "$.source.releasedAt");
  if (Number.isNaN(Date.parse(value.source.releasedAt))) fail("$.source.releasedAt", "must be a date-time");

  return value;
}

export function validateModel(value) {
  object(value, "$", [
    "format", "formatVersion", "id", "version", "canvas", "textures",
    "appearances", "expressions", "motions", "channels",
  ]);
  equal(value.format, "milim-model", "$.format");
  equal(value.formatVersion, 1, "$.formatVersion");
  equal(value.id, "milim-v1", "$.id");
  stringPattern(value.version, VERSION, "$.version");
  object(value.canvas, "$.canvas", ["width", "height"]);
  integer(value.canvas.width, "$.canvas.width", 1);
  integer(value.canvas.height, "$.canvas.height", 1);

  array(value.textures, "$.textures", 1);
  value.textures.forEach((texture, index) => {
    const path = `$.textures[${index}]`;
    object(texture, path, ["id", "url"]);
    nonemptyString(texture.id, `${path}.id`);
    nonemptyString(texture.url, `${path}.url`);
  });
  unique(value.textures.map(({ id }) => id), "$.textures", "texture id");
  const textureIds = new Set(value.textures.map(({ id }) => id));

  object(value.appearances, "$.appearances", ["hair", "outfit", "pose"]);
  for (const key of ["hair", "outfit", "pose"]) stringArray(value.appearances[key], `$.appearances.${key}`);

  array(value.expressions, "$.expressions", 1);
  value.expressions.forEach((expression, index) => {
    const path = `$.expressions[${index}]`;
    object(expression, path, ["id", "texture", "blendInMs", "blendOutMs", "reset"]);
    nonemptyString(expression.id, `${path}.id`);
    nonemptyString(expression.texture, `${path}.texture`);
    number(expression.blendInMs, `${path}.blendInMs`, 0);
    number(expression.blendOutMs, `${path}.blendOutMs`, 0);
    equal(expression.reset, "neutral", `${path}.reset`);
  });
  unique(value.expressions.map(({ id }) => id), "$.expressions", "expression id");

  stringArray(value.channels, "$.channels");
  unique(value.channels, "$.channels", "channel");
  const channels = new Set(value.channels);

  array(value.motions, "$.motions", 1);
  value.motions.forEach((motion, index) => {
    const path = `$.motions[${index}]`;
    object(motion, path, ["id", "durationMs", "loop", "tracks", "returnMs"], ["texture"]);
    nonemptyString(motion.id, `${path}.id`);
    number(motion.durationMs, `${path}.durationMs`, 0, true);
    boolean(motion.loop, `${path}.loop`);
    object(motion.tracks, `${path}.tracks`, null);
    for (const channel of Object.keys(motion.tracks)) {
      if (!channels.has(channel)) fail(`${path}.tracks.${channel}`, "must reference a declared semantic channel");
    }
    if ("texture" in motion) {
      nonemptyString(motion.texture, `${path}.texture`);
      if (!textureIds.has(motion.texture)) fail(`${path}.texture`, "must reference a declared texture");
    }
    number(motion.returnMs, `${path}.returnMs`, 0);
  });
  unique(value.motions.map(({ id }) => id), "$.motions", "motion id");
  return value;
}

export function validateScene(value) {
  object(value, "$", ["format", "formatVersion", "id", "version", "layers", "effects", "crops", "reducedMotion"]);
  equal(value.format, "milim-scene", "$.format");
  equal(value.formatVersion, 1, "$.formatVersion");
  stringPattern(value.id, ID, "$.id");
  stringPattern(value.version, VERSION, "$.version");
  array(value.layers, "$.layers", 1);
  value.layers.forEach((layer, index) => {
    const path = `$.layers[${index}]`;
    object(layer, path, ["id", "url", "depth", "opacity"]);
    nonemptyString(layer.id, `${path}.id`);
    nonemptyString(layer.url, `${path}.url`);
    numberRange(layer.depth, `${path}.depth`, 0, 1);
    numberRange(layer.opacity, `${path}.opacity`, 0, 1);
  });
  unique(value.layers.map(({ id }) => id), "$.layers", "layer id");

  object(value.effects, "$.effects", ["parallax", "lightSweep", "particles", "reflection"]);
  numberRange(value.effects.parallax, "$.effects.parallax", 0, 1);
  numberRange(value.effects.lightSweep, "$.effects.lightSweep", 0, 1);
  integer(value.effects.particles, "$.effects.particles", 0, 64);
  numberRange(value.effects.reflection, "$.effects.reflection", 0, 1);

  object(value.crops, "$.crops", ["desktop", "tablet", "mobile"]);
  for (const key of ["desktop", "tablet", "mobile"]) {
    const path = `$.crops.${key}`;
    const crop = value.crops[key];
    object(crop, path, ["x", "y", "scale"]);
    numberRange(crop.x, `${path}.x`, 0, 1);
    numberRange(crop.y, `${path}.y`, 0, 1);
    number(crop.scale, `${path}.scale`, 0, true);
  }
  nonemptyString(value.reducedMotion, "$.reducedMotion");
  return value;
}

export function validationDetail(error) {
  return error instanceof ValidationFailure
    ? { path: error.path, reason: error.reason }
    : { reason: error instanceof Error ? error.message : String(error) };
}

function versionedEntry(value, path, pathKey) {
  object(value, path, ["version", pathKey]);
  stringPattern(value.version, VERSION, `${path}.version`);
  releasePath(value[pathKey], `${path}.${pathKey}`);
}

function catalogEntry(value, path) {
  object(value, path, ["id", "version", "url"]);
  stringPattern(value.id, ID, `${path}.id`);
  stringPattern(value.version, VERSION, `${path}.version`);
  releasePath(value.url, `${path}.url`);
}

function object(value, path, keys, optionalKeys = []) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail(path, "must be an object");
  if (keys === null) return;
  const allowed = new Set([...keys, ...optionalKeys]);
  for (const key of keys) if (!(key in value)) fail(`${path}.${key}`, "is required");
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail(`${path}.${key}`, "is not supported");
}

function array(value, path, minimum) {
  if (!Array.isArray(value)) fail(path, "must be an array");
  if (value.length < minimum) fail(path, `must contain at least ${minimum} item`);
}

function stringArray(value, path) {
  array(value, path, 1);
  value.forEach((item, index) => nonemptyString(item, `${path}[${index}]`));
  unique(value, path, "value");
}

function string(value, path) {
  if (typeof value !== "string") fail(path, "must be a string");
}

function nonemptyString(value, path) {
  string(value, path);
  if (value.length === 0) fail(path, "must not be empty");
}

function stringPattern(value, pattern, path) {
  string(value, path);
  if (!pattern.test(value)) fail(path, `must match ${pattern}`);
}

function releasePath(value, path) {
  stringPattern(value, RELEASE_PATH, path);
  if (value.split("/").includes("..")) fail(path, "must stay inside the release directory");
}

function number(value, path, minimum, exclusive = false) {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(path, "must be a finite number");
  if (exclusive ? value <= minimum : value < minimum) fail(path, `must be ${exclusive ? "greater than" : "at least"} ${minimum}`);
}

function numberRange(value, path, minimum, maximum) {
  number(value, path, minimum);
  if (value > maximum) fail(path, `must be at most ${maximum}`);
}

function integer(value, path, minimum, maximum) {
  if (!Number.isInteger(value)) fail(path, "must be an integer");
  if (minimum !== undefined && value < minimum) fail(path, `must be at least ${minimum}`);
  if (maximum !== undefined && value > maximum) fail(path, `must be at most ${maximum}`);
}

function boolean(value, path) {
  if (typeof value !== "boolean") fail(path, "must be a boolean");
}

function equal(value, expected, path) {
  if (value !== expected) fail(path, `must equal ${JSON.stringify(expected)}`);
}

function unique(values, path, label) {
  if (new Set(values).size !== values.length) fail(path, `must not contain duplicate ${label}s`);
}

function fail(path, reason) {
  throw new ValidationFailure(path, reason);
}
