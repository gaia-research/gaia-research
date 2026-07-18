export const MILIM_PLAYER_RECORD = Object.freeze({
  repository: "gaia-research/milim-player",
  version: "0.2.0",
  commit: "105e244e48fd773f699eef98d89d7f575956bf2c",
  entry: "./player/index.js",
  license: "Apache-2.0",
} as const);

export type MilimExpression =
  | "neutral"
  | "joyful-winker"
  | "demon-lord-smirk"
  | "starry-awe"
  | "chaos-gremlin";

export type MilimDurableState = {
  expression: MilimExpression;
  hair: string;
  outfit: string;
  pose: string;
  scene: string;
};

/** The public player controller is the only runtime surface React may use. */
export type MilimController = {
  set(state: Partial<MilimDurableState>): unknown;
  drive(controls: {
    gaze?: { x: number; y: number };
    head?: { x: number; y: number; z: number };
    mouthOpen?: number;
  }): unknown;
  perform(motion: "greet" | "point"): Promise<unknown>;
  setRunning(running: boolean): void;
  destroy(): void;
};

export type MountMilim = (
  canvas: HTMLCanvasElement,
  options: {
    src: string;
    reducedMotion?: boolean;
    onStatus?(status: unknown): void;
  },
) => Promise<MilimController>;

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
  if (manifest.format !== "milim-release" || manifest.formatVersion !== 1) {
    throw new Error("Milim release must use the frozen milim-release formatVersion 1");
  }
  if (!isRecord(manifest.compatibility)) {
    throw new Error("Milim release compatibility must be an object");
  }
  if (!hasExactKeys(manifest.compatibility, ["major"])) {
    throw new Error("Milim compatibility fields do not match the frozen release format");
  }
  if (![1, 2].includes(manifest.compatibility.major as number)) {
    throw new Error("Milim release compatibility.major must be 1 or 2");
  }
  const player = manifest.player;
  if (typeof player.commit !== "string" || !/^[a-f0-9]{40}$/.test(player.commit)) {
    throw new Error("Milim release player provenance requires a full lowercase 40-character commit");
  }
  if (player.commit !== MILIM_PLAYER_RECORD.commit) {
    throw new Error("Milim release does not use the frozen 0.2.0 player commit");
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

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length
    && actual.every((key, index) => key === sortedExpected[index]);
}
