import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  promoteMilimRelease,
  PromotionError,
} from "../scripts/promote-milim-release.mjs";

const root = await mkdtemp(path.join(os.tmpdir(), "milim-promotion-test-"));
const CATALOGS = {
  1: [
    "cyber-slime-lab-v1",
    "slime-reactor-halo-v1",
    "dragon-signal-observatory-v1",
  ],
  2: [
    "cyber-slime-lab-v2",
    "slime-reactor-halo-v2",
    "dragon-signal-observatory-v2",
  ],
};

function digest(value) {
  return {
    bytes: Buffer.byteLength(value),
    sha256: createHash("sha256").update(value).digest("hex"),
  };
}

async function inventory(directory, relative = "") {
  const entries = await readdir(path.join(directory, relative), { withFileTypes: true });
  const result = {};
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      Object.assign(result, await inventory(directory, child));
    } else {
      result[child] = digest(await readFile(path.join(directory, child)));
    }
  }
  return result;
}

async function fixture({
  release = "milim-web-0.1.0",
  compatibility = 1,
  scenes = CATALOGS[compatibility] ?? CATALOGS[1],
  sourceCommit = "abcdef1",
} = {}) {
  const nonce = Math.random().toString(16).slice(2);
  const source = path.join(root, `release-${nonce}`);
  const web = path.join(root, `web-${nonce}`);
  await mkdir(path.join(source, "player"), { recursive: true });
  await mkdir(path.join(source, "previews"), { recursive: true });

  const payload = {
    "./player/index.js": "export const mountMilim = async () => ({});\n",
    "./previews/desktop.webp": "d",
    "./previews/tablet.webp": "t",
    "./previews/mobile.webp": "m",
    "./previews/reduced.webp": "r",
  };
  for (const [file, contents] of Object.entries(payload)) {
    await writeFile(path.join(source, file.slice(2)), contents);
  }

  const files = Object.entries(payload).map(([file, contents]) => ({
    path: file,
    ...digest(contents),
  }));
  const sceneVersion = `${compatibility}.0.0`;
  const manifest = {
    format: "milim-release",
    formatVersion: 1,
    release,
    compatibility: { major: compatibility },
    player: { version: release.replace("milim-web-", ""), entry: "./player/index.js" },
    model: { id: "milim-v1", version: sceneVersion, url: "./player/index.js" },
    scenes: scenes.map((id) => ({ id, version: sceneVersion, url: "./player/index.js" })),
    defaults: {
      hair: "classic-long-pink",
      outfit: "dragonoid-hoodie-v1",
      pose: "confident-neutral-v1",
      expression: "neutral",
      scene: scenes[0],
    },
    fallbacks: {
      desktop: "./previews/desktop.webp",
      tablet: "./previews/tablet.webp",
      mobile: "./previews/mobile.webp",
      reducedMotion: "./previews/reduced.webp",
    },
    files,
    source: {
      repository: "gaia-research/milim",
      commit: sourceCommit,
      releasedAt: "2026-07-16T00:00:00.000Z",
    },
  };
  await writeFile(path.join(source, "release.json"), JSON.stringify(manifest));
  return { source, web, manifest };
}

test("promotes compatibility 1 history and keeps its destination immutable", async () => {
  const { source, web } = await fixture();
  const result = await promoteMilimRelease({
    source,
    release: "milim-web-0.1.0",
    sourceCommit: "abcdef1",
    websiteRoot: web,
  });

  assert.equal(JSON.parse(await readFile(result.currentPath)).release, "milim-web-0.1.0");
  assert.equal(JSON.parse(await readFile(result.recordPath)).source.commit, "abcdef1");
  await assert.rejects(
    () => promoteMilimRelease({ source, release: "milim-web-0.1.0", sourceCommit: "abcdef1", websiteRoot: web }),
    PromotionError,
  );
});

test("promotes the exact compatibility 2 scene catalog", async () => {
  const release = "milim-web-0.2.0";
  const sourceCommit = "3e95f74db2869b8e638ce9cddc425987aec86983";
  const { source, web } = await fixture({ release, compatibility: 2, sourceCommit });
  const legacyMarker = path.join(web, "public", "milim", "releases", "milim-web-0.1.2", "release.json");
  await mkdir(path.dirname(legacyMarker), { recursive: true });
  await writeFile(legacyMarker, "v1-history");
  const sourceInventory = await inventory(source);

  const result = await promoteMilimRelease({ source, release, sourceCommit, websiteRoot: web });
  const promoted = JSON.parse(await readFile(path.join(result.target, "release.json")));

  assert.equal(promoted.compatibility.major, 2);
  assert.deepEqual(promoted.scenes.map(({ id }) => id), CATALOGS[2]);
  assert.deepEqual(await inventory(result.target), sourceInventory);
  assert.equal(await readFile(legacyMarker, "utf8"), "v1-history");
});

test("rejects compatibility 2 catalog drift", async () => {
  const release = "milim-web-0.2.0";
  const sourceCommit = "3e95f74db2869b8e638ce9cddc425987aec86983";
  const { source, web } = await fixture({
    release,
    compatibility: 2,
    scenes: [...CATALOGS[2], "unreviewed-scene-v2"],
    sourceCommit,
  });

  await assert.rejects(
    () => promoteMilimRelease({ source, release, sourceCommit, websiteRoot: web }),
    /scene catalog does not match/,
  );
});

test("refuses a mismatched checksum or commit", async () => {
  const { source, web } = await fixture();
  await writeFile(path.join(source, "player/index.js"), "tampered");
  await assert.rejects(
    () => promoteMilimRelease({ source, release: "milim-web-0.1.0", sourceCommit: "abcdef1", websiteRoot: web }),
    PromotionError,
  );

  const other = await fixture();
  await assert.rejects(
    () => promoteMilimRelease({ source: other.source, release: "milim-web-0.1.0", sourceCommit: "deadbee", websiteRoot: other.web }),
    PromotionError,
  );
});

test("refuses payload files missing from the checksummed inventory", async () => {
  const { source, web } = await fixture();
  await writeFile(path.join(source, "unlisted.bin"), "not-in-manifest");

  await assert.rejects(
    () => promoteMilimRelease({ source, release: "milim-web-0.1.0", sourceCommit: "abcdef1", websiteRoot: web }),
    /unlisted or missing payload files/,
  );
});
