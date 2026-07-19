import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { promoteMilimRelease } from "../scripts/promote-milim-release.mjs";

const SOURCE_COMMIT = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const PLAYER_COMMIT = "4746bf59d7b4459df1a10011b9e20ff3596866cf";
const DIFFERENT_PLAYER_COMMIT = "cccccccccccccccccccccccccccccccccccccccc";
const PLAYER = {
  repository: "gaia-research/milim-player",
  version: "0.3.0",
  commit: PLAYER_COMMIT,
  entry: "./player/index.js",
  license: "Apache-2.0",
};

test("promotes a verified release and preserves both provenance chains", async () => {
  const fixture = await createFixture();
  try {
    const result = await promoteMilimRelease({
      sourceDirectory: fixture.sourceDirectory,
      publicDirectory: fixture.publicDirectory,
      promotionsDirectory: fixture.promotionsDirectory,
      expectedSourceCommit: SOURCE_COMMIT,
      expectedPlayerCommit: PLAYER_COMMIT,
      promotedAt: "2026-07-18T00:00:00.000Z",
    });

    const current = JSON.parse(await readFile(join(fixture.publicDirectory, "current.json"), "utf8"));
    const promotion = JSON.parse(await readFile(join(fixture.promotionsDirectory, "milim-web-0.3.0.json"), "utf8"));
    assert.equal(result.release, "milim-web-0.3.0");
    assert.deepEqual(current.source, {
      repository: "gaia-research/milim",
      commit: SOURCE_COMMIT,
      releasedAt: "2026-07-17T00:00:00.000Z",
    });
    assert.deepEqual(current.player, PLAYER);
    assert.deepEqual(promotion.source, current.source);
    assert.deepEqual(promotion.player, PLAYER);
    assert.equal(await readFile(join(fixture.publicDirectory, "releases/milim-web-0.3.0/player/index.js"), "utf8"), "export const mountMilim = () => {};\n");
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("rejects missing, abbreviated, or mismatched public player provenance", async () => {
  for (const mutate of [
    (manifest) => { delete manifest.player; },
    (manifest) => { manifest.player.commit = "abcdef0"; },
    (manifest) => { manifest.player.repository = "gaia-research/not-milim-player"; },
  ]) {
    const fixture = await createFixture();
    try {
      mutate(fixture.manifest);
      await writeManifest(fixture);
      await assert.rejects(promote(fixture), /player/i);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  }
});

test("rejects a different full player SHA even when the caller expects it", async () => {
  const fixture = await createFixture();
  try {
    fixture.manifest.player.commit = DIFFERENT_PLAYER_COMMIT;
    await writeManifest(fixture);
    await assert.rejects(promoteMilimRelease({
      sourceDirectory: fixture.sourceDirectory,
      publicDirectory: fixture.publicDirectory,
      promotionsDirectory: fixture.promotionsDirectory,
      expectedSourceCommit: SOURCE_COMMIT,
      expectedPlayerCommit: DIFFERENT_PLAYER_COMMIT,
    }), /frozen 0\.3\.0 player commit/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("rejects a mismatched private source commit", async () => {
  const fixture = await createFixture();
  try {
    fixture.manifest.source.commit = "cccccccccccccccccccccccccccccccccccccccc";
    await writeManifest(fixture);
    await assert.rejects(promote(fixture), /private source commit does not match/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("rejects an unsafe public player entry", async () => {
  const fixture = await createFixture();
  try {
    fixture.manifest.player.entry = "../../attacker.js";
    await writeManifest(fixture);
    await assert.rejects(promote(fixture), /player entry/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("promotes compatibility major 2 under the frozen release and player contract", async () => {
  const fixture = await createFixture();
  try {
    fixture.manifest.compatibility.major = 2;
    await writeManifest(fixture);
    const result = await promote(fixture);
    assert.equal(result.release, "milim-web-0.3.0");
    assert.equal(
      JSON.parse(await readFile(join(result.destination, "release.json"), "utf8")).compatibility.major,
      2,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("rejects compatibility shape drift", async () => {
  const fixture = await createFixture();
  try {
    fixture.manifest.compatibility = { major: 2, minor: 0 };
    await writeManifest(fixture);
    await assert.rejects(promote(fixture), /compatibility fields do not match the frozen release format/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("rejects unsupported compatibility majors", async () => {
  for (const major of [0, 3, 2.5, "2"]) {
    const fixture = await createFixture();
    try {
      fixture.manifest.compatibility.major = major;
      await writeManifest(fixture);
      await assert.rejects(promote(fixture), /compatibility\.major must be 1 or 2/);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  }
});

test("requires safe ./ files paths and excludes release.json from inventory", async () => {
  for (const path of ["player/index.js", "./release.json"]) {
    const fixture = await createFixture();
    try {
      fixture.manifest.files[0].path = path;
      await writeManifest(fixture);
      await assert.rejects(promote(fixture), /safe \.\/ path|release\.json must be excluded/);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  }
});

test("verifies files byte counts", async () => {
  const fixture = await createFixture();
  try {
    fixture.manifest.files[0].bytes += 1;
    await writeManifest(fixture);
    await assert.rejects(promote(fixture), /byte count drift/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("rejects checksum drift before copying the release", async () => {
  const fixture = await createFixture();
  try {
    const modelPath = join(fixture.sourceDirectory, "models/milim-v1/model.json");
    const original = await readFile(modelPath, "utf8");
    await writeFile(modelPath, `X${original.slice(1)}`);
    await assert.rejects(promote(fixture), /checksum drift/);
    await assert.rejects(readFile(join(fixture.publicDirectory, "releases/milim-web-0.3.0/release.json")), { code: "ENOENT" });
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("refuses to overwrite an immutable destination", async () => {
  const fixture = await createFixture();
  try {
    const destination = join(fixture.publicDirectory, "releases/milim-web-0.3.0");
    await mkdir(destination, { recursive: true });
    await writeFile(join(destination, "sentinel.txt"), "keep\n");
    await assert.rejects(promote(fixture), /Immutable Milim destination already exists/);
    assert.equal(await readFile(join(destination, "sentinel.txt"), "utf8"), "keep\n");
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "milim-phase1-promotion-"));
  const sourceDirectory = join(root, "private", "milim-web-0.3.0");
  const publicDirectory = join(root, "public", "milim");
  const promotionsDirectory = join(root, "docs", "promotions");
  const files = {
    "player/index.js": "export const mountMilim = () => {};\n",
    "models/milim-v1/model.json": "{\"format\":\"milim-model\",\"formatVersion\":1}\n",
    "scenes/milim-splash-v1/scene.json": "{\"format\":\"milim-scene\",\"formatVersion\":1}\n",
    "previews/desktop.webp": "desktop-fallback\n",
    "previews/tablet.webp": "tablet-fallback\n",
    "previews/mobile.webp": "mobile-fallback\n",
    "previews/reduced.webp": "reduced-fallback\n",
  };
  for (const [relativePath, contents] of Object.entries(files)) {
    const target = join(sourceDirectory, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  const manifest = {
    format: "milim-release",
    formatVersion: 1,
    release: "milim-web-0.3.0",
    compatibility: { major: 1 },
    source: {
      repository: "gaia-research/milim",
      commit: SOURCE_COMMIT,
      releasedAt: "2026-07-17T00:00:00.000Z",
    },
    player: { ...PLAYER },
    model: { id: "milim-v1", version: "1.0.0", url: "./models/milim-v1/model.json" },
    scenes: [{ id: "milim-splash-v1", version: "0.3.0", url: "./scenes/milim-splash-v1/scene.json" }],
    defaults: {
      expression: "neutral",
      hair: "classic-long-pink",
      outfit: "dragonoid-hoodie-v1",
      pose: "confident-neutral-v1",
      scene: "milim-splash-v1",
    },
    fallbacks: {
      desktop: "./previews/desktop.webp",
      tablet: "./previews/tablet.webp",
      mobile: "./previews/mobile.webp",
      reducedMotion: "./previews/reduced.webp",
    },
    files: Object.entries(files).map(([path, contents]) => ({
      path: `./${path}`,
      bytes: Buffer.byteLength(contents),
      sha256: sha256(contents),
    })),
  };
  await writeFile(join(sourceDirectory, "release.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return { root, sourceDirectory, publicDirectory, promotionsDirectory, manifest };
}

function promote(fixture) {
  return promoteMilimRelease({
    sourceDirectory: fixture.sourceDirectory,
    publicDirectory: fixture.publicDirectory,
    promotionsDirectory: fixture.promotionsDirectory,
    expectedSourceCommit: SOURCE_COMMIT,
    expectedPlayerCommit: PLAYER_COMMIT,
    promotedAt: "2026-07-18T00:00:00.000Z",
  });
}

async function writeManifest(fixture) {
  await writeFile(join(fixture.sourceDirectory, "release.json"), `${JSON.stringify(fixture.manifest, null, 2)}\n`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
