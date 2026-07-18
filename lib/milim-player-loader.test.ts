import { describe, expect, it, vi } from "vitest";
import { loadMilimRelease } from "./milim-player-loader";

const PLAYER_COMMIT = "105e244e48fd773f699eef98d89d7f575956bf2c";
const DIFFERENT_FULL_COMMIT = "cccccccccccccccccccccccccccccccccccccccc";

function validManifest() {
  return {
    format: "milim-release",
    formatVersion: 1,
    release: "milim-web-0.2.0",
    compatibility: { major: 1 },
    player: {
      repository: "gaia-research/milim-player",
      version: "0.2.0",
      commit: PLAYER_COMMIT,
      entry: "./player/index.js",
      license: "Apache-2.0",
    },
  };
}

describe("loadMilimRelease", () => {
  it("resolves a browser-relative promoted release and player entry", async () => {
    vi.stubGlobal("window", { location: { href: "https://research.example/milim/qa" } });
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => validManifest(),
    }));
    const importModule = vi.fn(async () => ({ mountMilim: vi.fn() }));

    try {
      await loadMilimRelease("/milim/releases/milim-web-0.2.0/release.json", {
        fetchImpl,
        importModule,
      });
    } finally {
      vi.unstubAllGlobals();
    }

    expect(fetchImpl).toHaveBeenCalledWith("https://research.example/milim/releases/milim-web-0.2.0/release.json");
    expect(importModule).toHaveBeenCalledWith("https://research.example/milim/releases/milim-web-0.2.0/player/index.js");
  });

  it("loads the exact pinned player and exposes only mountMilim", async () => {
    const mountMilim = vi.fn();
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => validManifest(),
    }));
    const importModule = vi.fn(async () => ({ mountMilim, internalRenderer: {} }));

    const player = await loadMilimRelease("./release.json", {
      baseUrl: "https://research.example/milim/releases/milim-web-0.2.0/",
      fetchImpl,
      importModule,
    });

    expect(fetchImpl).toHaveBeenCalledWith("https://research.example/milim/releases/milim-web-0.2.0/release.json");
    expect(importModule).toHaveBeenCalledWith("https://research.example/milim/releases/milim-web-0.2.0/player/index.js");
    expect(Object.keys(player)).toEqual(["mountMilim"]);
    expect(player.mountMilim).toBe(mountMilim);
  });

  it("preserves absolute file URLs for fixture-based release tests", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => validManifest(),
    }));
    const importModule = vi.fn(async () => ({ mountMilim: vi.fn() }));

    await loadMilimRelease("file:///tmp/milim-fixture/release.json", { fetchImpl, importModule });

    expect(fetchImpl).toHaveBeenCalledWith("file:///tmp/milim-fixture/release.json");
    expect(importModule).toHaveBeenCalledWith("file:///tmp/milim-fixture/player/index.js");
  });

  it("rejects an unsupported compatibility major before importing code", async () => {
    const manifest = validManifest();
    manifest.compatibility.major = 3;
    const importModule = vi.fn();

    await expect(loadMilimRelease("https://research.example/release.json", {
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => manifest }),
      importModule,
    })).rejects.toThrow(/compatibility\.major must be 1 or 2/);
    expect(importModule).not.toHaveBeenCalled();
  });

  it("loads compatibility major 2 through the same pinned player seam", async () => {
    const manifest = validManifest();
    manifest.compatibility.major = 2;
    const mountMilim = vi.fn();

    const player = await loadMilimRelease("https://research.example/release.json", {
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => manifest }),
      importModule: async () => ({ mountMilim }),
    });

    expect(player.mountMilim).toBe(mountMilim);
  });

  it("rejects compatibility shape drift before importing code", async () => {
    const manifest = validManifest();
    (manifest.compatibility as { major: number; minor?: number }).minor = 0;
    const importModule = vi.fn();

    await expect(loadMilimRelease("https://research.example/release.json", {
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => manifest }),
      importModule,
    })).rejects.toThrow(/compatibility fields do not match the frozen release format/);
    expect(importModule).not.toHaveBeenCalled();
  });

  it("rejects abbreviated player provenance before importing code", async () => {
    const manifest = validManifest();
    manifest.player.commit = "abcdef0";
    const importModule = vi.fn();

    await expect(loadMilimRelease("https://research.example/release.json", {
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => manifest }),
      importModule,
    })).rejects.toThrow(/40-character commit/);
    expect(importModule).not.toHaveBeenCalled();
  });

  it("rejects a different full player commit before importing code", async () => {
    const manifest = validManifest();
    manifest.player.commit = DIFFERENT_FULL_COMMIT;
    const importModule = vi.fn(async () => ({ mountMilim: vi.fn() }));

    await expect(loadMilimRelease("https://research.example/release.json", {
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => manifest }),
      importModule,
    })).rejects.toThrow(/frozen 0\.2\.0 player commit/);
    expect(importModule).not.toHaveBeenCalled();
  });

  it("rejects player provenance from a mismatched repository", async () => {
    const manifest = validManifest();
    manifest.player.repository = "gaia-research/not-milim-player";

    await expect(loadMilimRelease("https://research.example/release.json", {
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => manifest }),
      importModule: vi.fn(),
    })).rejects.toThrow(/repository/);
  });

  it("rejects missing player provenance", async () => {
    await expect(loadMilimRelease("https://research.example/release.json", {
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ release: "milim-web-0.2.0" }) }),
      importModule: vi.fn(),
    })).rejects.toThrow(/missing player provenance/);
  });

  it("rejects an unsafe player entry before URL resolution or import", async () => {
    const manifest = validManifest();
    manifest.player.entry = "../../attacker.js";
    const importModule = vi.fn();

    await expect(loadMilimRelease("https://research.example/milim/releases/milim-web-0.2.0/release.json", {
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => manifest }),
      importModule,
    })).rejects.toThrow(/entry/);
    expect(importModule).not.toHaveBeenCalled();
  });
});
