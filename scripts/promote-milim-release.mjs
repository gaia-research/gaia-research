#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { cp, lstat, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PRIVATE_REPOSITORY = "gaia-research/milim";
const PLAYER_RECORD = Object.freeze({
  repository: "gaia-research/milim-player",
  version: "0.2.0",
  commit: "105e244e48fd773f699eef98d89d7f575956bf2c",
  entry: "./player/index.js",
  license: "Apache-2.0",
});
const FULL_COMMIT = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;

export async function promoteMilimRelease({
  sourceDirectory,
  publicDirectory,
  promotionsDirectory,
  expectedSourceCommit,
  expectedPlayerCommit,
  promotedAt = new Date().toISOString(),
}) {
  requireFullCommit(expectedSourceCommit, "expected private source");
  requireFullCommit(expectedPlayerCommit, "expected public player");
  if (expectedPlayerCommit !== PLAYER_RECORD.commit) {
    throw new Error("Milim promotion requires the frozen 0.2.0 player commit");
  }
  const sourceRoot = resolve(sourceDirectory);
  const manifest = JSON.parse(await readFile(join(sourceRoot, "release.json"), "utf8"));
  validateReleaseManifest(manifest, expectedSourceCommit, expectedPlayerCommit);
  await verifyFilesAndInventory(sourceRoot, manifest.files);

  const releasesRoot = join(resolve(publicDirectory), "releases");
  const destination = join(releasesRoot, manifest.release);
  if (await exists(destination)) throw new Error(`Immutable Milim destination already exists: ${destination}`);

  const staging = `${destination}.tmp-${process.pid}-${randomUUID()}`;
  await mkdir(releasesRoot, { recursive: true });
  try {
    await cp(sourceRoot, staging, { recursive: true, errorOnExist: true, force: false });
    await rename(staging, destination);
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }

  const source = { ...manifest.source };
  const player = {
    repository: manifest.player.repository,
    version: manifest.player.version,
    commit: manifest.player.commit,
    entry: manifest.player.entry,
    license: manifest.player.license,
  };
  const current = {
    schemaVersion: 1,
    release: manifest.release,
    manifest: `./releases/${manifest.release}/release.json`,
    source,
    player,
  };
  const promotion = {
    schemaVersion: 1,
    promotedAt,
    release: manifest.release,
    manifest: `public/milim/releases/${manifest.release}/release.json`,
    source,
    player,
    files: manifest.files,
  };
  await writeJson(join(resolve(publicDirectory), "current.json"), current);
  const promotionPath = join(resolve(promotionsDirectory), `${manifest.release}.json`);
  await writeJson(promotionPath, promotion);

  return { release: manifest.release, destination, current, promotion, promotionPath };
}

function validateReleaseManifest(manifest, expectedSourceCommit, expectedPlayerCommit) {
  if (!isRecord(manifest)) throw new Error("Milim release manifest must be an object");
  if (!isRecord(manifest.player)) throw new Error("Milim release is missing public player provenance");
  requireExactKeys(manifest, ["compatibility", "defaults", "fallbacks", "files", "format", "formatVersion", "model", "player", "release", "scenes", "source"], "release manifest");
  if (manifest.format !== "milim-release" || manifest.formatVersion !== 1) {
    throw new Error("Milim release must use milim-release formatVersion 1");
  }
  if (!isRecord(manifest.compatibility)) {
    throw new Error("Milim release compatibility must be an object");
  }
  requireExactKeys(manifest.compatibility, ["major"], "compatibility");
  if (![1, 2].includes(manifest.compatibility.major)) {
    throw new Error("Milim release compatibility.major must be 1 or 2");
  }
  if (typeof manifest.release !== "string" || !/^milim-web-\d+\.\d+\.\d+$/.test(manifest.release)) {
    throw new Error("Milim release manifest has an invalid release identifier");
  }
  if (!isRecord(manifest.source) || manifest.source.repository !== PRIVATE_REPOSITORY) {
    throw new Error(`Milim release source repository must be ${PRIVATE_REPOSITORY}`);
  }
  requireFullCommit(manifest.source.commit, "private source");
  if (manifest.source.commit !== expectedSourceCommit) throw new Error("Milim private source commit does not match the reviewed commit");

  requireExactKeys(manifest.player, ["commit", "entry", "license", "repository", "version"], "player");
  requireFullCommit(manifest.player.commit, "public player");
  if (manifest.player.commit !== PLAYER_RECORD.commit) throw new Error("Milim release does not use the frozen 0.2.0 player commit");
  if (manifest.player.commit !== expectedPlayerCommit) throw new Error("Milim public player commit does not match the reviewed commit");
  for (const field of ["repository", "version", "entry", "license"]) {
    if (manifest.player[field] !== PLAYER_RECORD[field]) {
      throw new Error(`Milim public player ${field} does not match the frozen 0.2.0 record`);
    }
  }
  if (!isRecord(manifest.model)) throw new Error("Milim release model must be an object");
  if (!Array.isArray(manifest.scenes) || manifest.scenes.length === 0 || manifest.scenes.some((scene) => !isRecord(scene))) {
    throw new Error("Milim release scenes must be a non-empty array");
  }
  if (!isRecord(manifest.defaults)) throw new Error("Milim release defaults must be an object");
  if (!isRecord(manifest.fallbacks)) throw new Error("Milim release fallbacks must be an object");
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) throw new Error("Milim release files must be a non-empty array");
}

async function verifyFilesAndInventory(sourceRoot, files) {
  const payloadFiles = (await listPayloadFiles(sourceRoot))
    .filter((path) => path !== "release.json")
    .map((path) => `./${path}`)
    .sort();
  const listedPaths = [];
  const seen = new Set();
  for (const file of files) {
    if (!isRecord(file)) throw new Error("Milim release files entries must be objects");
    requireExactKeys(file, ["bytes", "path", "sha256"], "files entry");
    if (!isSafeReleasePath(file.path)) throw new Error(`Milim release files path must be a safe ./ path: ${file.path}`);
    if (file.path === "./release.json") throw new Error("Milim release.json must be excluded from files");
    if (seen.has(file.path)) throw new Error(`Milim release files contains a duplicate path: ${file.path}`);
    seen.add(file.path);
    listedPaths.push(file.path);
    if (!Number.isInteger(file.bytes) || file.bytes < 0) throw new Error(`Invalid byte count for ${file.path}`);
    if (typeof file.sha256 !== "string" || !SHA256.test(file.sha256)) throw new Error(`Invalid SHA-256 checksum for ${file.path}`);
  }
  listedPaths.sort();
  if (payloadFiles.length !== listedPaths.length || payloadFiles.some((path, index) => path !== listedPaths[index])) {
    throw new Error("Milim files inventory does not exactly match the release payload");
  }
  for (const file of files) {
    const relativePath = file.path.slice(2);
    const contents = await readFile(join(sourceRoot, ...relativePath.split("/")));
    if (contents.byteLength !== file.bytes) throw new Error(`Milim byte count drift detected for ${file.path}`);
    const actual = createHash("sha256").update(contents).digest("hex");
    if (actual !== file.sha256) throw new Error(`Milim checksum drift detected for ${file.path}`);
  }
}

async function listPayloadFiles(root, relative = "") {
  const directory = join(root, relative);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = relative ? `${relative}/${entry.name}` : entry.name;
    const metadata = await lstat(join(root, relativePath));
    if (metadata.isSymbolicLink()) throw new Error(`Milim release payload cannot contain symbolic links: ${relativePath}`);
    if (metadata.isDirectory()) files.push(...await listPayloadFiles(root, relativePath));
    else if (metadata.isFile()) files.push(relativePath);
    else throw new Error(`Milim release payload contains an unsupported entry: ${relativePath}`);
  }
  return files;
}

function isSafeReleasePath(path) {
  return typeof path === "string"
    && path.startsWith("./")
    && path.length > 2
    && !path.includes("\\")
    && posix.normalize(path.slice(2)) === path.slice(2)
    && !path.slice(2).startsWith("../");
}

function requireExactKeys(value, expected, label) {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (actual.length !== sortedExpected.length || actual.some((key, index) => key !== sortedExpected[index])) {
    throw new Error(`Milim ${label} fields do not match the frozen release format`);
  }
}

function requireFullCommit(value, label) {
  if (typeof value !== "string" || !FULL_COMMIT.test(value)) {
    throw new Error(`Milim ${label} provenance requires a full lowercase 40-character commit`);
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}-${randomUUID()}`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  await rename(temporary, path);
}

async function exists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) throw new Error(`Invalid promotion argument: ${key ?? "<missing>"}`);
    args[key.slice(2)] = value;
    index += 1;
  }
  return args;
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  for (const required of ["source", "source-commit", "player-commit"]) {
    if (!args[required]) throw new Error(`Missing --${required}`);
  }
  const result = await promoteMilimRelease({
    sourceDirectory: args.source,
    publicDirectory: args["public-directory"] ?? "public/milim",
    promotionsDirectory: args["promotions-directory"] ?? "docs/promotions",
    expectedSourceCommit: args["source-commit"],
    expectedPlayerCommit: args["player-commit"],
  });
  console.log(JSON.stringify({ ok: true, release: result.release, destination: result.destination, promotionPath: result.promotionPath }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
