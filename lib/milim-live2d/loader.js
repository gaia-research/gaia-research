/*
 * Scene loader — fetches a milim-live2d-model scene bundle and resolves its
 * textures into GPU-ready image sources. (c) 2026 Gaia Research, MIT.
 *
 * A "scene bundle" is a JSON document in Stretchy's native project shape
 * (nodes / parameters / animations / canvas / textures), optionally wrapped with
 * an `expressions` map for setExpression(). Textures are referenced by URL
 * (relative to the scene URL) or embedded as data URIs. This avoids the .moc3
 * exporter gap entirely: we ship the full-fidelity native scene, not a lossy
 * compiled rig. A .moc3 export path stays a separate future deliverable.
 */

/** Fetch + parse a scene JSON from a URL. */
export async function fetchScene(url) {
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) throw new Error(`[milim] failed to fetch scene ${url}: ${res.status}`);
  const scene = await res.json();
  return normalizeScene(scene);
}

/** Coerce loosely-typed fields (uvs → Float32Array) so the runtime can trust them. */
export function normalizeScene(scene) {
  for (const node of scene.nodes ?? []) {
    if (node.type === 'part' && node.mesh && node.mesh.uvs && !(node.mesh.uvs instanceof Float32Array)) {
      node.mesh.uvs = new Float32Array(node.mesh.uvs);
    }
  }
  return scene;
}

/** Load one image URL into an ImageBitmap (fast, off-main-thread decode) or HTMLImageElement. */
export async function loadImage(url) {
  if (typeof createImageBitmap === 'function') {
    const res = await fetch(url, { credentials: 'omit' });
    if (!res.ok) throw new Error(`[milim] failed to fetch texture ${url}: ${res.status}`);
    const blob = await res.blob();
    return createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`[milim] failed to load texture ${url}`));
    img.src = url;
  });
}

/**
 * Resolve every texture a scene references into a Map keyed by texture id.
 * Texture sources are resolved relative to `baseUrl` (usually the scene URL).
 */
export async function loadTextures(scene, baseUrl) {
  const base = baseUrl ? new URL(baseUrl, globalThis.location?.href ?? 'http://localhost/') : null;
  const entries = await Promise.all(
    (scene.textures ?? []).map(async (tex) => {
      const src = tex.source ?? tex.url ?? tex.href;
      if (!src) return null;
      const abs = base ? new URL(src, base).href : src;
      const img = await loadImage(abs);
      return [tex.id, img];
    }),
  );
  return new Map(entries.filter(Boolean));
}

/** Convenience: fetch scene + all textures in one call. Returns { scene, textures }. */
export async function loadSceneBundle(sceneUrl) {
  const scene = await fetchScene(sceneUrl);
  const textures = await loadTextures(scene, sceneUrl);
  return { scene, textures };
}
