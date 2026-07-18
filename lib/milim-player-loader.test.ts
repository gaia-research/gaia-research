import { describe, expect, it, vi } from "vitest";
import { loadMilimRelease } from "./milim-player-loader";

const PLAYER_COMMIT = "105e244e48fd773f699eef98d89d7f575956bf2c";
const DIFFERENT_FULL_COMMIT = "cccccccccccccccccccccccccccccccccccccccc";

function validManifest() {
  return {
    release: "milim-web-0.2.0",
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
    })).rejects.toThrow(/approved Phase 1 player commit/);
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
