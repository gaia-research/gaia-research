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

export type MilimController = {
  set: (state: Partial<MilimDurableState>) => unknown;
  drive: (controls: {
    gaze?: { x: number; y: number };
    head?: { x: number; y: number; z: number };
    mouthOpen?: number;
  }) => unknown;
  perform: (motion: "greet" | "point") => Promise<unknown>;
  setRunning: (running: boolean) => void;
  destroy: () => void;
};

export type MountMilim = (
  canvas: HTMLCanvasElement,
  options: {
    src: string;
    reducedMotion?: boolean;
    onStatus?: (event: unknown) => void;
  },
) => Promise<MilimController>;

type MilimReleaseManifest = {
  format: "milim-release";
  formatVersion: 1;
  compatibility: { major: 1 | 2 };
  player: { version: string; entry: string };
};

type LoaderOptions = {
  baseUrl?: string;
  fetcher?: typeof fetch;
  importer?: (url: string) => Promise<unknown>;
};

export class MilimAdapterError extends Error {
  readonly code: string;
  readonly detail?: Record<string, unknown>;

  constructor(code: string, message: string, detail?: Record<string, unknown>) {
    super(message);
    this.name = "MilimAdapterError";
    this.code = code;
    this.detail = detail;
  }
}

function browserBaseUrl(): string {
  if (typeof window === "undefined") {
    throw new MilimAdapterError(
      "MILIM_RELEASE_LOAD_FAILED",
      "Milim Player can only load inside a browser.",
    );
  }
  return window.location.href;
}

function isSafeRelativeEntry(entry: unknown): entry is string {
  if (typeof entry !== "string" || !entry.startsWith("./") || entry.includes("\\")) {
    return false;
  }
  return !entry.split("/").includes("..");
}

function assertManifest(value: unknown): asserts value is MilimReleaseManifest {
  const manifest = value as Partial<MilimReleaseManifest> | null;
  if (
    !manifest ||
    manifest.format !== "milim-release" ||
    manifest.formatVersion !== 1 ||
    (manifest.compatibility?.major !== 1 && manifest.compatibility?.major !== 2) ||
    !isSafeRelativeEntry(manifest.player?.entry)
  ) {
    throw new MilimAdapterError(
      "MILIM_RELEASE_INVALID",
      "The pinned Milim release manifest is invalid or incompatible.",
    );
  }
}

async function importBrowserModule(url: string): Promise<unknown> {
  return import(/* webpackIgnore: true */ url);
}

/**
 * Resolve the promoted release entry without exposing model, scene, renderer,
 * or animation internals to React. The player validates the complete manifest
 * again when mounted; this small read exists only to locate its native module.
 */
export async function loadMilimRelease(
  src: string,
  options: LoaderOptions = {},
): Promise<{ manifest: MilimReleaseManifest; mountMilim: MountMilim }> {
  const baseUrl = options.baseUrl ?? browserBaseUrl();
  const manifestUrl = new URL(src, baseUrl);
  const fetcher = options.fetcher ?? fetch;
  const importer = options.importer ?? importBrowserModule;
  const response = await fetcher(manifestUrl.href, { cache: "force-cache" });

  if (!response.ok) {
    throw new MilimAdapterError(
      "MILIM_RELEASE_LOAD_FAILED",
      "The pinned Milim release could not be loaded.",
      { status: response.status },
    );
  }

  const manifest = (await response.json()) as unknown;
  assertManifest(manifest);

  const entryUrl = new URL(manifest.player.entry, manifestUrl);
  if (entryUrl.origin !== manifestUrl.origin) {
    throw new MilimAdapterError(
      "MILIM_RELEASE_INVALID",
      "The Milim player entry must remain inside the promoted release origin.",
    );
  }

  const loaded = (await importer(entryUrl.href)) as { mountMilim?: unknown };
  if (typeof loaded?.mountMilim !== "function") {
    throw new MilimAdapterError(
      "MILIM_PLAYER_INVALID",
      "The promoted Milim module does not export mountMilim().",
    );
  }

  return { manifest, mountMilim: loaded.mountMilim as MountMilim };
}
