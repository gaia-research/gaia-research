import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promoteMilimRelease } from "../scripts/promote-milim-release.mjs";

const SOURCE_COMMIT = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const PLAYER_COMMIT = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const PLAYER = {
  repository: "gaia-research/milim-player",
  version: "0.2.0",
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
    const promotion = JSON.parse(await readFile(join(fixture.promotionsDirectory, "milim-web-0.2.0.json"), "utf8"));
    assert.equal(result.release, "milim-web-0.2.0");
    assert.deepEqual(current.source, {
      repository: "gaia-research/milim",
      commit: SOURCE_COMMIT,
      releasedAt: "2026-07-17T00:00:00.000Z",
    });
    assert.deepEqual(current.player, PLAYER);
    assert.deepEqual(promotion.source, current.source);
    assert.deepEqual(promotion.player, PLAYER);
    assert.equal(await readFile(join(fixture.publicDirectory, "releases/milim-web-0.2.0/player/index.js"), "utf8"), "export const mountMilim = () => {};\n");
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

test("rejects checksum drift before copying the release", async () => {
  const fixture = await createFixture();
  try {
    await writeFile(join(fixture.sourceDirectory, "model.bin"), "tampered\n");
    await assert.rejects(promote(fixture), /checksum drift/);
    await assert.rejects(readFile(join(fixture.publicDirectory, "releases/milim-web-0.2.0/release.json")), { code: "ENOENT" });
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("refuses to overwrite an immutable destination", async () => {
  const fixture = await createFixture();
  try {
    const destination = join(fixture.publicDirectory, "releases/milim-web-0.2.0");
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
  const sourceDirectory = join(root, "private", "milim-web-0.2.0");
  const publicDirectory = join(root, "public", "milim");
  const promotionsDirectory = join(root, "docs", "promotions");
  await mkdir(join(sourceDirectory, "player"), { recursive: true });
  const files = {
    "player/index.js": "export const mountMilim = () => {};\n",
    "model.bin": "verified-model-payload\n",
  };
  for (const [relativePath, contents] of Object.entries(files)) {
    await writeFile(join(sourceDirectory, relativePath), contents);
  }
  const manifest = {
    schemaVersion: 1,
    release: "milim-web-0.2.0",
    compatibility: { major: 2 },
    source: {
      repository: "gaia-research/milim",
      commit: SOURCE_COMMIT,
      releasedAt: "2026-07-17T00:00:00.000Z",
    },
    player: { ...PLAYER },
    checksums: Object.fromEntries(Object.entries(files).map(([path, contents]) => [path, sha256(contents)])),
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
