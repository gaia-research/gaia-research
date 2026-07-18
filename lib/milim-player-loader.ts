export const MILIM_PLAYER_RECORD = Object.freeze({
  repository: "gaia-research/milim-player",
  version: "0.2.0",
  commit: "105e244e48fd773f699eef98d89d7f575956bf2c",
  entry: "./player/index.js",
  license: "Apache-2.0",
} as const);

export type MountMilim = (...args: unknown[]) => unknown;

type FetchResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};

type LoaderDependencies = {
  baseUrl?: string;
  fetchImpl?: (url: string) => Promise<FetchResponse>;
  importModule?: (url: string) => Promise<unknown>;
};

type MilimPlayerModule = Readonly<{ mountMilim: MountMilim }>;

export async function loadMilimRelease(
  releaseUrl: string,
  dependencies: LoaderDependencies = {},
): Promise<MilimPlayerModule> {
  const manifestUrl = resolveUrl(releaseUrl, dependencies.baseUrl);
  const fetchImpl = dependencies.fetchImpl ?? (async (url) => fetch(url));
  const response = await fetchImpl(manifestUrl.href);
  if (!response.ok) throw new Error(`Milim release request failed with HTTP ${response.status}`);

  const manifest = await response.json();
  const player = validatePlayerRecord(manifest);
  const entryUrl = resolvePlayerEntry(manifestUrl, player.entry);
  const importModule = dependencies.importModule
    ?? ((url: string) => import(/* webpackIgnore: true */ url));
  const loaded = await importModule(entryUrl.href);
  if (!isRecord(loaded) || typeof loaded.mountMilim !== "function") {
    throw new Error("Milim player entry must export mountMilim");
  }

  return Object.freeze({ mountMilim: loaded.mountMilim as MountMilim });
}

function validatePlayerRecord(manifest: unknown) {
  if (!isRecord(manifest) || !isRecord(manifest.player)) {
    throw new Error("Milim release is missing player provenance");
  }
  const player = manifest.player;
  if (typeof player.commit !== "string" || !/^[a-f0-9]{40}$/.test(player.commit)) {
    throw new Error("Milim release player provenance requires a full lowercase 40-character commit");
  }
  if (player.commit !== MILIM_PLAYER_RECORD.commit) {
    throw new Error("Milim release does not use the approved Phase 1 player commit");
  }
  for (const field of ["repository", "version", "entry", "license"] as const) {
    if (player[field] !== MILIM_PLAYER_RECORD[field]) {
      throw new Error(`Milim release player ${field} does not match the frozen 0.2.0 contract`);
    }
  }
  return player as {
    repository: typeof MILIM_PLAYER_RECORD.repository;
    version: typeof MILIM_PLAYER_RECORD.version;
    commit: typeof MILIM_PLAYER_RECORD.commit;
    entry: typeof MILIM_PLAYER_RECORD.entry;
    license: typeof MILIM_PLAYER_RECORD.license;
  };
}

function resolvePlayerEntry(manifestUrl: URL, entry: string): URL {
  const releaseRoot = new URL("./", manifestUrl);
  const entryUrl = new URL(entry, releaseRoot);
  if (entryUrl.origin !== releaseRoot.origin || !entryUrl.pathname.startsWith(releaseRoot.pathname)) {
    throw new Error("Milim player entry escapes the immutable release directory");
  }
  return entryUrl;
}

function resolveUrl(value: string, baseUrl?: string): URL {
  if (baseUrl) return new URL(value, baseUrl);
  return new URL(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
