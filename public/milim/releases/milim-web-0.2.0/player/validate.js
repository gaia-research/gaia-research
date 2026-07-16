class ValidationFailure extends Error {
  constructor(path, reason) {
    super(`${path}: ${reason}`);
    this.path = path;
    this.reason = reason;
  }
}

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const V2_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
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
  if (value?.formatVersion === 2) return validateModelV2(value);
  return validateModelV1(value);
}

function validateModelV1(value) {
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
  if (value?.formatVersion === 2) return validateSceneV2(value);
  return validateSceneV1(value);
}

function validateSceneV1(value) {
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

function validateModelV2(value) {
  object(value, "$", [
    "format", "formatVersion", "id", "version", "canvas", "textures", "anchors",
    "masks", "parts", "deformers", "appearances", "expressions", "motions",
    "physics", "channels", "framing",
  ]);
  equal(value.format, "milim-model", "$.format");
  equal(value.formatVersion, 2, "$.formatVersion");
  equal(value.id, "milim-v1", "$.id");
  stringPattern(value.version, VERSION, "$.version");
  object(value.canvas, "$.canvas", ["width", "height"]);
  integer(value.canvas.width, "$.canvas.width", 2048);
  integer(value.canvas.height, "$.canvas.height", 2048);

  array(value.textures, "$.textures", 1);
  value.textures.forEach((texture, index) => {
    const path = `$.textures[${index}]`;
    object(texture, path, ["id", "url", "width", "height"]);
    v2Id(texture.id, `${path}.id`);
    releasePath(texture.url, `${path}.url`);
    integer(texture.width, `${path}.width`, 1);
    integer(texture.height, `${path}.height`, 1);
  });
  unique(value.textures.map(({ id }) => id), "$.textures", "texture id");

  array(value.anchors, "$.anchors", 1);
  value.anchors.forEach((anchor, index) => {
    const path = `$.anchors[${index}]`;
    object(anchor, path, ["id", "x", "y"]);
    v2Id(anchor.id, `${path}.id`);
    finite(anchor.x, `${path}.x`);
    finite(anchor.y, `${path}.y`);
  });
  unique(value.anchors.map(({ id }) => id), "$.anchors", "anchor id");

  array(value.masks, "$.masks", 0);
  value.masks.forEach((mask, index) => {
    const path = `$.masks[${index}]`;
    object(mask, path, ["id", "mode", "sourcePart"]);
    v2Id(mask.id, `${path}.id`);
    oneOf(mask.mode, ["include", "exclude"], `${path}.mode`);
    v2Id(mask.sourcePart, `${path}.sourcePart`);
  });
  unique(value.masks.map(({ id }) => id), "$.masks", "mask id");

  array(value.parts, "$.parts", 1);
  value.parts.forEach((part, index) => validatePartV2(part, `$.parts[${index}]`));
  unique(value.parts.map(({ id }) => id), "$.parts", "part id");

  array(value.deformers, "$.deformers", 1);
  value.deformers.forEach((deformer, index) => validateDeformerV2(deformer, `$.deformers[${index}]`));
  unique(value.deformers.map(({ id }) => id), "$.deformers", "deformer id");

  object(value.appearances, "$.appearances", ["hair", "outfit", "pose"]);
  for (const kind of ["hair", "outfit", "pose"]) {
    const path = `$.appearances.${kind}`;
    array(value.appearances[kind], path, 1);
    value.appearances[kind].forEach((pack, index) => validateAppearancePackV2(pack, `${path}[${index}]`));
    unique(value.appearances[kind].map(({ id }) => id), path, "appearance id");
  }

  array(value.expressions, "$.expressions", 4);
  value.expressions.forEach((expression, index) => {
    const path = `$.expressions[${index}]`;
    object(expression, path, ["id", "channels", "parts", "blendInMs", "blendOutMs", "reset"]);
    v2Id(expression.id, `${path}.id`);
    numericRecord(expression.channels, `${path}.channels`);
    rangedRecord(expression.parts, `${path}.parts`, 0, 1);
    number(expression.blendInMs, `${path}.blendInMs`, 0);
    number(expression.blendOutMs, `${path}.blendOutMs`, 0);
    equal(expression.reset, "neutral", `${path}.reset`);
  });
  unique(value.expressions.map(({ id }) => id), "$.expressions", "expression id");

  array(value.motions, "$.motions", 4);
  value.motions.forEach((motion, index) => {
    const path = `$.motions[${index}]`;
    object(motion, path, ["id", "durationMs", "loop", "tracks", "parts", "returnMs"]);
    v2Id(motion.id, `${path}.id`);
    number(motion.durationMs, `${path}.durationMs`, 0, true);
    boolean(motion.loop, `${path}.loop`);
    trackRecord(motion.tracks, `${path}.tracks`);
    trackRecord(motion.parts, `${path}.parts`);
    number(motion.returnMs, `${path}.returnMs`, 0);
  });
  unique(value.motions.map(({ id }) => id), "$.motions", "motion id");

  array(value.physics, "$.physics", 1);
  value.physics.forEach((chain, index) => {
    const path = `$.physics[${index}]`;
    object(chain, path, ["id", "inputs", "output", "mass", "stiffness", "damping", "gravity", "gain", "limit", "rest"]);
    v2Id(chain.id, `${path}.id`);
    idArray(chain.inputs, `${path}.inputs`, 1);
    v2Id(chain.output, `${path}.output`);
    number(chain.mass, `${path}.mass`, 0, true);
    number(chain.stiffness, `${path}.stiffness`, 0);
    number(chain.damping, `${path}.damping`, 0);
    finite(chain.gravity, `${path}.gravity`);
    finite(chain.gain, `${path}.gain`);
    numberRange(chain.limit, `${path}.limit`, 0, 1);
    numberRange(chain.rest, `${path}.rest`, -1, 1);
  });
  unique(value.physics.map(({ id }) => id), "$.physics", "physics id");

  idArray(value.channels, "$.channels", 1);
  object(value.framing, "$.framing", ["desktop", "tablet", "mobile"]);
  for (const viewport of ["desktop", "tablet", "mobile"]) {
    const path = `$.framing.${viewport}`;
    const frame = value.framing[viewport];
    object(frame, path, ["x", "y", "scale", "safeZone"]);
    numberRange(frame.x, `${path}.x`, 0, 1);
    numberRange(frame.y, `${path}.y`, 0, 1);
    number(frame.scale, `${path}.scale`, 0, true);
    numericTuple(frame.safeZone, `${path}.safeZone`, 4);
  }
  const textureIds = new Set(value.textures.map(({ id }) => id));
  const anchorIds = new Set(value.anchors.map(({ id }) => id));
  const maskIds = new Set(value.masks.map(({ id }) => id));
  const partIds = new Set(value.parts.map(({ id }) => id));
  const deformerIds = new Set(value.deformers.map(({ id }) => id));
  const expressionIds = new Set(value.expressions.map(({ id }) => id));
  const poseIds = new Set(value.appearances.pose.map(({ id }) => id));
  const channelIds = new Set(value.channels);
  value.parts.forEach((part, index) => {
    if (!textureIds.has(part.texture)) fail(`$.parts[${index}].texture`, "must reference a declared texture");
    if (!anchorIds.has(part.anchor)) fail(`$.parts[${index}].anchor`, "must reference a declared anchor");
    part.mesh.triangles.forEach((triangle, triangleIndex) => {
      triangle.forEach((vertexIndex, itemIndex) => {
        if (vertexIndex >= part.mesh.vertices.length) {
          fail(`$.parts[${index}].mesh.triangles[${triangleIndex}][${itemIndex}]`, "must reference a mesh vertex");
        }
      });
      const [a, b, c] = triangle.map((vertexIndex) => part.mesh.vertices[vertexIndex]);
      const area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if (area === 0) fail(`$.parts[${index}].mesh.triangles[${triangleIndex}]`, "must not be degenerate");
      if (area < 0) fail(`$.parts[${index}].mesh.triangles[${triangleIndex}]`, "must use counter-clockwise winding");
    });
    part.masks.forEach((maskId, maskIndex) => {
      if (!maskIds.has(maskId)) fail(`$.parts[${index}].masks[${maskIndex}]`, "must reference a declared mask");
    });
    part.deformers.forEach((deformerId, deformerIndex) => {
      if (!deformerIds.has(deformerId)) fail(`$.parts[${index}].deformers[${deformerIndex}]`, "must reference a declared deformer");
    });
  });
  value.masks.forEach((mask, index) => {
    if (!partIds.has(mask.sourcePart)) fail(`$.masks[${index}].sourcePart`, "must reference a declared part");
  });
  const partsById = new Map(value.parts.map((part) => [part.id, part]));
  value.deformers.forEach((deformer, deformerIndex) => {
    if (!channelIds.has(deformer.channel)) fail(`$.deformers[${deformerIndex}].channel`, "must reference a declared semantic channel");
    deformer.parts.forEach((partId, partIndex) => {
      if (!partIds.has(partId)) fail(`$.deformers[${deformerIndex}].parts[${partIndex}]`, "must reference a declared part");
    });
    if (!deformer.keyforms.some(({ at }) => at === 0)) {
      fail(`$.deformers[${deformerIndex}].keyforms`, "must contain a neutral keyform at zero");
    }
    if (deformer.kind !== "warp") return;
    const vertexCounts = deformer.parts
      .map((partId) => partsById.get(partId)?.mesh.vertices.length)
      .filter((count) => count !== undefined);
    deformer.keyforms.forEach((keyform, keyformIndex) => {
      if (vertexCounts.some((count) => keyform.offsets.length !== count)) {
        fail(`$.deformers[${deformerIndex}].keyforms[${keyformIndex}].offsets`, "must contain one offset per part mesh vertex");
      }
    });
  });
  for (const kind of ["hair", "outfit", "pose"]) {
    value.appearances[kind].forEach((pack, packIndex) => {
      const path = `$.appearances.${kind}[${packIndex}]`;
      pack.parts.forEach((partId, index) => {
        if (!partIds.has(partId)) fail(`${path}.parts[${index}]`, "must reference a declared part");
      });
      pack.requiredAnchors.forEach((anchorId, index) => {
        if (!anchorIds.has(anchorId)) fail(`${path}.requiredAnchors[${index}]`, "must reference a declared anchor");
      });
      pack.compatibleExpressions.forEach((expressionId, index) => {
        if (!expressionIds.has(expressionId)) fail(`${path}.compatibleExpressions[${index}]`, "must reference a declared expression");
      });
      pack.compatiblePoses.forEach((poseId, index) => {
        if (!poseIds.has(poseId)) fail(`${path}.compatiblePoses[${index}]`, "must reference a declared pose pack");
      });
    });
  }
  value.expressions.forEach((expression, expressionIndex) => {
    for (const channel of Object.keys(expression.channels)) {
      if (!channelIds.has(channel)) fail(`$.expressions[${expressionIndex}].channels.${channel}`, "must reference a declared semantic channel");
    }
    for (const partId of Object.keys(expression.parts)) {
      if (!partIds.has(partId)) fail(`$.expressions[${expressionIndex}].parts.${partId}`, "must reference a declared part");
    }
  });
  value.motions.forEach((motion, motionIndex) => {
    for (const channel of Object.keys(motion.tracks)) {
      if (!channelIds.has(channel)) fail(`$.motions[${motionIndex}].tracks.${channel}`, "must reference a declared semantic channel");
    }
    for (const partId of Object.keys(motion.parts)) {
      if (!partIds.has(partId)) fail(`$.motions[${motionIndex}].parts.${partId}`, "must reference a declared part");
    }
    for (const [group, tracks] of [["tracks", motion.tracks], ["parts", motion.parts]]) {
      for (const [key, track] of Object.entries(tracks)) {
        let previousTime = -Infinity;
        track.forEach(([time], pointIndex) => {
          if (time < previousTime || time > motion.durationMs) {
            fail(`$.motions[${motionIndex}].${group}.${key}[${pointIndex}][0]`, "must be ordered within the motion duration");
          }
          previousTime = time;
        });
      }
    }
  });
  value.physics.forEach((chain, physicsIndex) => {
    chain.inputs.forEach((channel, inputIndex) => {
      if (!channelIds.has(channel)) fail(`$.physics[${physicsIndex}].inputs[${inputIndex}]`, "must reference a declared semantic channel");
    });
    if (!channelIds.has(chain.output)) fail(`$.physics[${physicsIndex}].output`, "must reference a declared semantic channel");
  });
  return value;
}

function validatePartV2(part, path) {
  object(part, path, ["id", "slot", "texture", "drawOrder", "anchor", "mesh", "masks", "deformers", "protected"]);
  v2Id(part.id, `${path}.id`);
  oneOf(part.slot, ["base", "hair", "outfit", "pose", "expression", "accessory"], `${path}.slot`);
  v2Id(part.texture, `${path}.texture`);
  integer(part.drawOrder, `${path}.drawOrder`);
  v2Id(part.anchor, `${path}.anchor`);
  object(part.mesh, `${path}.mesh`, ["vertices", "triangles"]);
  array(part.mesh.vertices, `${path}.mesh.vertices`, 4);
  part.mesh.vertices.forEach((vertex, index) => {
    const vertexPath = `${path}.mesh.vertices[${index}]`;
    object(vertex, vertexPath, ["x", "y", "u", "v"]);
    finite(vertex.x, `${vertexPath}.x`);
    finite(vertex.y, `${vertexPath}.y`);
    numberRange(vertex.u, `${vertexPath}.u`, 0, 1);
    numberRange(vertex.v, `${vertexPath}.v`, 0, 1);
  });
  array(part.mesh.triangles, `${path}.mesh.triangles`, 2);
  part.mesh.triangles.forEach((triangle, index) => {
    numericTuple(triangle, `${path}.mesh.triangles[${index}]`, 3, (value, itemPath) => integer(value, itemPath, 0));
  });
  idArray(part.masks, `${path}.masks`, 0);
  idArray(part.deformers, `${path}.deformers`, 0);
  boolean(part.protected, `${path}.protected`);
}

function validateDeformerV2(deformer, path) {
  object(deformer, path, ["id", "kind", "channel", "parts", "keyforms"]);
  v2Id(deformer.id, `${path}.id`);
  oneOf(deformer.kind, ["transform", "warp"], `${path}.kind`);
  v2Id(deformer.channel, `${path}.channel`);
  idArray(deformer.parts, `${path}.parts`, 1);
  array(deformer.keyforms, `${path}.keyforms`, 3);
  deformer.keyforms.forEach((keyform, index) => {
    const keyformPath = `${path}.keyforms[${index}]`;
    if (deformer.kind === "transform") {
      object(keyform, keyformPath, ["at", "value"]);
      numberRange(keyform.at, `${keyformPath}.at`, -1, 1);
      object(keyform.value, `${keyformPath}.value`, ["translate", "scale", "rotation", "opacity"]);
      numericTuple(keyform.value.translate, `${keyformPath}.value.translate`, 2);
      numericTuple(keyform.value.scale, `${keyformPath}.value.scale`, 2);
      finite(keyform.value.rotation, `${keyformPath}.value.rotation`);
      numberRange(keyform.value.opacity, `${keyformPath}.value.opacity`, 0, 1);
    } else {
      object(keyform, keyformPath, ["at", "offsets"]);
      numberRange(keyform.at, `${keyformPath}.at`, -1, 1);
      array(keyform.offsets, `${keyformPath}.offsets`, 4);
      keyform.offsets.forEach((offset, offsetIndex) => numericTuple(offset, `${keyformPath}.offsets[${offsetIndex}]`, 2));
    }
  });
}

function validateAppearancePackV2(pack, path) {
  object(pack, path, ["id", "parts", "requiredAnchors", "compatibleExpressions", "compatiblePoses"]);
  v2Id(pack.id, `${path}.id`);
  idArray(pack.parts, `${path}.parts`, 1);
  idArray(pack.requiredAnchors, `${path}.requiredAnchors`, 0);
  idArray(pack.compatibleExpressions, `${path}.compatibleExpressions`, 1);
  idArray(pack.compatiblePoses, `${path}.compatiblePoses`, 1);
}

function validateSceneV2(value) {
  object(value, "$", ["format", "formatVersion", "id", "version", "layers", "effects", "crops", "safeZones", "reducedMotion"]);
  equal(value.format, "milim-scene", "$.format");
  equal(value.formatVersion, 2, "$.formatVersion");
  v2Id(value.id, "$.id");
  stringPattern(value.version, VERSION, "$.version");
  array(value.layers, "$.layers", 3);
  value.layers.forEach((layer, index) => {
    const path = `$.layers[${index}]`;
    object(layer, path, ["id", "role", "url", "depth", "opacity", "blend"]);
    v2Id(layer.id, `${path}.id`);
    oneOf(layer.role, ["background", "midground", "foreground", "light", "particle-mask", "reflection-mask"], `${path}.role`);
    releasePath(layer.url, `${path}.url`);
    numberRange(layer.depth, `${path}.depth`, 0, 1);
    numberRange(layer.opacity, `${path}.opacity`, 0, 1);
    oneOf(layer.blend, ["normal", "screen", "add", "multiply"], `${path}.blend`);
  });
  unique(value.layers.map(({ id }) => id), "$.layers", "layer id");
  object(value.effects, "$.effects", ["parallax", "lightSweep", "particles", "reflection", "pointer"]);
  numberRange(value.effects.parallax, "$.effects.parallax", 0, 1);
  numberRange(value.effects.lightSweep, "$.effects.lightSweep", 0, 1);
  integer(value.effects.particles, "$.effects.particles", 0, 64);
  numberRange(value.effects.reflection, "$.effects.reflection", 0, 1);
  numberRange(value.effects.pointer, "$.effects.pointer", 0, 0.5);
  for (const group of ["crops", "safeZones"]) {
    object(value[group], `$.${group}`, ["desktop", "tablet", "mobile"]);
    for (const viewport of ["desktop", "tablet", "mobile"]) {
      const path = `$.${group}.${viewport}`;
      const frame = value[group][viewport];
      object(frame, path, ["x", "y", "scale"]);
      numberRange(frame.x, `${path}.x`, 0, 1);
      numberRange(frame.y, `${path}.y`, 0, 1);
      number(frame.scale, `${path}.scale`, 0, true);
    }
  }
  releasePath(value.reducedMotion, "$.reducedMotion");
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

function v2Id(value, path) {
  stringPattern(value, V2_ID, path);
}

function idArray(value, path, minimum) {
  array(value, path, minimum);
  value.forEach((item, index) => v2Id(item, `${path}[${index}]`));
  unique(value, path, "value");
}

function numericRecord(value, path) {
  object(value, path, null);
  for (const [key, item] of Object.entries(value)) {
    v2Id(key, `${path}.${key}`);
    finite(item, `${path}.${key}`);
  }
}

function rangedRecord(value, path, minimum, maximum) {
  object(value, path, null);
  for (const [key, item] of Object.entries(value)) {
    v2Id(key, `${path}.${key}`);
    numberRange(item, `${path}.${key}`, minimum, maximum);
  }
}

function trackRecord(value, path) {
  object(value, path, null);
  for (const [key, track] of Object.entries(value)) {
    v2Id(key, `${path}.${key}`);
    array(track, `${path}.${key}`, 2);
    track.forEach((point, index) => {
      numericTuple(point, `${path}.${key}[${index}]`, 2);
      number(point[0], `${path}.${key}[${index}][0]`, 0);
    });
  }
}

function numericTuple(value, path, length, validateItem = finite) {
  if (!Array.isArray(value) || value.length !== length) fail(path, `must contain exactly ${length} items`);
  value.forEach((item, index) => validateItem(item, `${path}[${index}]`));
}

function oneOf(value, choices, path) {
  if (!choices.includes(value)) fail(path, `must be one of ${choices.map((choice) => JSON.stringify(choice)).join(", ")}`);
}

function releasePath(value, path) {
  stringPattern(value, RELEASE_PATH, path);
  if (value.split("/").includes("..")) fail(path, "must stay inside the release directory");
}

function number(value, path, minimum, exclusive = false) {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(path, "must be a finite number");
  if (exclusive ? value <= minimum : value < minimum) fail(path, `must be ${exclusive ? "greater than" : "at least"} ${minimum}`);
}

function finite(value, path) {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(path, "must be a finite number");
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
