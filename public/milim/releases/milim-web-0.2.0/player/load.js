import { ERROR_CODES, milimError } from "./errors.js";
import { validateModel, validateRelease, validateScene, validationDetail } from "./validate.js";

export async function loadBundle(src, runtime, emitStatus = () => {}) {
  const releaseURL = absoluteURL(src, runtime.baseURL);
  emitStatus({ type: "loading", phase: "release", url: releaseURL });
  const release = await fetchValidatedJSON(
    releaseURL,
    runtime.fetch,
    validateRelease,
    ERROR_CODES.RELEASE_LOAD_FAILED,
    "Milim release could not be loaded",
  );

  if (![1, 2].includes(release.compatibility.major)) {
    throw milimError(
      ERROR_CODES.RELEASE_INCOMPATIBLE,
      `Milim release compatibility major ${release.compatibility.major} is not supported`,
      { supportedMajors: [1, 2], actualMajor: release.compatibility.major },
    );
  }

  const releaseRoot = new URL(".", releaseURL);
  const resolvedRelease = resolveReleaseURLs(release, releaseURL, releaseRoot);
  const inventory = new Set(release.files.map(({ path }) => path));
  assertResourcesListed([
    resolvedRelease.player.entry,
    resolvedRelease.model.url,
    ...resolvedRelease.scenes.map(({ url }) => url),
    ...Object.values(resolvedRelease.fallbacks),
  ], releaseRoot, inventory);
  const selected = resolvedRelease.scenes.find(({ id }) => id === resolvedRelease.defaults.scene);
  if (!selected) {
    throw milimError(
      ERROR_CODES.RELEASE_LOAD_FAILED,
      "Milim release default scene is not in the scene catalog",
      { scene: resolvedRelease.defaults.scene },
    );
  }

  emitStatus({ type: "loading", phase: "model", url: resolvedRelease.model.url });
  emitStatus({ type: "loading", phase: "scene", url: selected.url });
  const [modelValue, sceneValue] = await Promise.all([
    fetchValidatedJSON(
      resolvedRelease.model.url,
      runtime.fetch,
      validateModel,
      ERROR_CODES.MODEL_INVALID,
      "Milim model is invalid",
    ),
    fetchValidatedJSON(
      selected.url,
      runtime.fetch,
      validateScene,
      ERROR_CODES.SCENE_INVALID,
      "Milim scene is invalid",
    ),
  ]);

  assertDocumentCompatibility(modelValue, sceneValue, release.compatibility.major);

  assertCatalogMatch(modelValue, resolvedRelease.model, ERROR_CODES.MODEL_INVALID, "model");
  assertCatalogMatch(sceneValue, selected, ERROR_CODES.SCENE_INVALID, "scene");
  assertModelReferences(modelValue);
  assertDefaultsSupported(resolvedRelease.defaults, modelValue);

  const model = resolveModelURLs(modelValue, resolvedRelease.model.url, releaseRoot);
  const scene = resolveSceneURLs(sceneValue, selected.url, releaseRoot);
  assertResourcesListed([
    ...model.textures.map(({ url }) => url),
    ...scene.layers.map(({ url }) => url),
    scene.reducedMotion,
  ], releaseRoot, inventory);
  return { release: resolvedRelease, releaseURL, releaseRoot, model, scene };
}

export async function loadScene(entry, runtime, releaseRoot, files) {
  const value = await fetchValidatedJSON(
    entry.url,
    runtime.fetch,
    validateScene,
    ERROR_CODES.SCENE_INVALID,
    "Milim scene is invalid",
  );
  assertCatalogMatch(value, entry, ERROR_CODES.SCENE_INVALID, "scene");
  const scene = resolveSceneURLs(value, entry.url, releaseRoot);
  if (files) {
    assertResourcesListed(
      [...scene.layers.map(({ url }) => url), scene.reducedMotion],
      releaseRoot,
      new Set(files.map(({ path }) => path)),
    );
  }
  return scene;
}

function absoluteURL(src, baseURL) {
  if (typeof src !== "string" || src.length === 0) {
    throw milimError(ERROR_CODES.RELEASE_LOAD_FAILED, "Milim release URL is invalid", { reason: "options.src is required" });
  }
  try {
    return new URL(src, baseURL).href;
  } catch (cause) {
    throw milimError(ERROR_CODES.RELEASE_LOAD_FAILED, "Milim release URL is invalid", { cause: cause.message });
  }
}

async function fetchValidatedJSON(url, fetcher, validate, code, message) {
  if (typeof fetcher !== "function") throw milimError(code, message, { url, reason: "fetch is unavailable" });
  let response;
  try {
    response = await fetcher(url, { credentials: "same-origin", redirect: "error" });
  } catch (cause) {
    throw milimError(code, message, { url, reason: cause instanceof Error ? cause.message : String(cause) });
  }
  if (!response?.ok) throw milimError(code, message, { url, status: response?.status ?? null });
  let value;
  try {
    value = await response.json();
  } catch (cause) {
    throw milimError(code, message, { url, reason: "response is not valid JSON" });
  }
  try {
    validate(value);
  } catch (cause) {
    throw milimError(code, message, { url, ...validationDetail(cause) });
  }
  return value;
}

function resolveReleaseURLs(release, ownerURL, releaseRoot) {
  return {
    ...release,
    player: { ...release.player, entry: resolveOwnedURL(release.player.entry, ownerURL, releaseRoot, "$.player.entry") },
    model: { ...release.model, url: resolveOwnedURL(release.model.url, ownerURL, releaseRoot, "$.model.url") },
    scenes: release.scenes.map((entry, index) => ({
      ...entry,
      url: resolveOwnedURL(entry.url, ownerURL, releaseRoot, `$.scenes[${index}].url`),
    })),
    fallbacks: Object.fromEntries(Object.entries(release.fallbacks).map(([key, url]) => [
      key,
      resolveOwnedURL(url, ownerURL, releaseRoot, `$.fallbacks.${key}`),
    ])),
  };
}

function resolveModelURLs(model, ownerURL, releaseRoot) {
  return {
    ...model,
    textures: model.textures.map((texture, index) => ({
      ...texture,
      url: resolveOwnedURL(texture.url, ownerURL, releaseRoot, `$.textures[${index}].url`, ERROR_CODES.MODEL_INVALID),
    })),
  };
}

function resolveSceneURLs(scene, ownerURL, releaseRoot) {
  return {
    ...scene,
    layers: scene.layers.map((layer, index) => ({
      ...layer,
      url: resolveOwnedURL(layer.url, ownerURL, releaseRoot, `$.layers[${index}].url`, ERROR_CODES.SCENE_INVALID),
    })),
    reducedMotion: resolveOwnedURL(scene.reducedMotion, ownerURL, releaseRoot, "$.reducedMotion", ERROR_CODES.SCENE_INVALID),
  };
}

function resolveOwnedURL(reference, ownerURL, releaseRoot, path, code = ERROR_CODES.RELEASE_LOAD_FAILED) {
  let resolved;
  try {
    resolved = new URL(reference, ownerURL);
  } catch (cause) {
    throw milimError(code, "Milim resource URL is invalid", { path, reference });
  }
  const rootPath = releaseRoot.pathname.endsWith("/") ? releaseRoot.pathname : `${releaseRoot.pathname}/`;
  if (resolved.origin !== releaseRoot.origin || !resolved.pathname.startsWith(rootPath)) {
    throw milimError(code, "Milim resource URL leaves the release directory", { path, reference });
  }
  return resolved.href;
}

function assertCatalogMatch(value, entry, code, kind) {
  if (value.id !== entry.id || value.version !== entry.version) {
    throw milimError(code, `Milim ${kind} does not match its release catalog entry`, {
      expected: { id: entry.id, version: entry.version },
      actual: { id: value.id, version: value.version },
    });
  }
}

function assertDefaultsSupported(defaults, model) {
  for (const key of ["hair", "outfit", "pose"]) {
    const ids = model.appearances[key].map((entry) => typeof entry === "string" ? entry : entry.id);
    if (!ids.includes(defaults[key])) {
      throw milimError(ERROR_CODES.MODEL_INVALID, `Milim default ${key} is unsupported by the model`, { key, value: defaults[key] });
    }
  }
  if (!model.expressions.some(({ id }) => id === defaults.expression)) {
    throw milimError(ERROR_CODES.MODEL_INVALID, "Milim default expression is unsupported by the model", { value: defaults.expression });
  }
}

function assertModelReferences(model) {
  if (model.formatVersion === 2) return;
  const textures = new Set(model.textures.map(({ id }) => id));
  for (const expression of model.expressions) {
    if (!textures.has(expression.texture)) {
      throw milimError(ERROR_CODES.MODEL_INVALID, "Milim expression references an unknown texture", {
        expression: expression.id,
        texture: expression.texture,
      });
    }
  }
}

function assertDocumentCompatibility(model, scene, compatibilityMajor) {
  if (model.formatVersion !== compatibilityMajor) {
    throw milimError(ERROR_CODES.MODEL_INVALID, "Milim model format does not match the release compatibility major", {
      expectedFormatVersion: compatibilityMajor,
      actualFormatVersion: model.formatVersion,
    });
  }
  if (scene.formatVersion !== compatibilityMajor) {
    throw milimError(ERROR_CODES.SCENE_INVALID, "Milim scene format does not match the release compatibility major", {
      expectedFormatVersion: compatibilityMajor,
      actualFormatVersion: scene.formatVersion,
    });
  }
}

function assertResourcesListed(urls, releaseRoot, inventory) {
  for (const url of urls) {
    const resolved = new URL(url);
    const relative = resolved.search || resolved.hash
      ? null
      : `./${resolved.pathname.slice(releaseRoot.pathname.length)}`;
    if (!relative || !inventory.has(relative)) {
      throw milimError(ERROR_CODES.RELEASE_LOAD_FAILED, "Milim resource is not listed in the release inventory", {
        url,
        path: relative,
      });
    }
  }
}
