import { describe, expect, it, vi } from "vitest";
import { loadMilimRelease, MilimAdapterError } from "./milim-player-loader";

const release = {
  format: "milim-release",
  formatVersion: 1,
  compatibility: { major: 1 },
  player: { version: "0.1.0", entry: "./player/index.js" },
};

describe("loadMilimRelease", () => {
  it("loads the manifest entry relative to the pinned release URL", async () => {
    const mountMilim = vi.fn();
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => release,
    })) as unknown as typeof fetch;
    const importer = vi.fn(async () => ({ mountMilim }));

    const loaded = await loadMilimRelease(
      "/milim/releases/milim-web-0.1.0/release.json",
      {
        baseUrl: "https://research.example/",
        fetcher,
        importer,
      },
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://research.example/milim/releases/milim-web-0.1.0/release.json",
      { cache: "force-cache" },
    );
    expect(importer).toHaveBeenCalledWith(
      "https://research.example/milim/releases/milim-web-0.1.0/player/index.js",
    );
    expect(loaded.mountMilim).toBe(mountMilim);
    expect(loaded.manifest).toEqual(release);
  });

  it("loads the promoted compatibility 2 player through the same semantic adapter", async () => {
    const compatibilityTwo = {
      ...release,
      compatibility: { major: 2 },
      player: { version: "0.2.0", entry: "./player/index.js" },
    };
    const mountMilim = vi.fn();
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => compatibilityTwo,
    })) as unknown as typeof fetch;

    const loaded = await loadMilimRelease(
      "/milim/releases/milim-web-0.2.0/release.json",
      {
        baseUrl: "https://research.example/",
        fetcher,
        importer: async () => ({ mountMilim }),
      },
    );

    expect(loaded.manifest.compatibility.major).toBe(2);
    expect(loaded.mountMilim).toBe(mountMilim);
  });

  it("rejects compatibility majors outside the exact supported set", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ...release, compatibility: { major: 3 } }),
    })) as unknown as typeof fetch;

    await expect(
      loadMilimRelease("/milim/releases/future/release.json", {
        baseUrl: "https://research.example/",
        fetcher,
        importer: vi.fn(),
      }),
    ).rejects.toMatchObject({ code: "MILIM_RELEASE_INVALID" });
  });

  it.each(["../escape.js", "/global.js", "https://evil.example/player.js"])(
    "rejects an unsafe player entry: %s",
    async (entry) => {
      const fetcher = vi.fn(async () => ({
        ok: true,
        json: async () => ({ ...release, player: { ...release.player, entry } }),
      })) as unknown as typeof fetch;

      await expect(
        loadMilimRelease("/milim/releases/v/release.json", {
          baseUrl: "https://research.example/",
          fetcher,
          importer: vi.fn(),
        }),
      ).rejects.toMatchObject({ code: "MILIM_RELEASE_INVALID" });
    },
  );

  it("rejects a module that does not expose the semantic mount function", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => release,
    })) as unknown as typeof fetch;

    await expect(
      loadMilimRelease("/milim/releases/v/release.json", {
        baseUrl: "https://research.example/",
        fetcher,
        importer: async () => ({}),
      }),
    ).rejects.toEqual(
      new MilimAdapterError(
        "MILIM_PLAYER_INVALID",
        "The promoted Milim module does not export mountMilim().",
      ),
    );
  });

  it("reports an HTTP manifest failure without importing code", async () => {
    const importer = vi.fn();
    const fetcher = vi.fn(async () => ({ ok: false, status: 404 })) as unknown as typeof fetch;

    await expect(
      loadMilimRelease("/milim/releases/missing/release.json", {
        baseUrl: "https://research.example/",
        fetcher,
        importer,
      }),
    ).rejects.toMatchObject({
      code: "MILIM_RELEASE_LOAD_FAILED",
      detail: { status: 404 },
    });
    expect(importer).not.toHaveBeenCalled();
  });
});
