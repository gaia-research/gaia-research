#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { cp, lstat, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PRIVATE_REPOSITORY = "gaia-research/milim";
const PLAYER_RECORD = Object.freeze({
  repository: "gaia-research/milim-player",
  version: "0.2.0",
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
  const sourceRoot = resolve(sourceDirectory);
  const manifest = JSON.parse(await readFile(join(sourceRoot, "release.json"), "utf8"));
  validateReleaseManifest(manifest, expectedSourceCommit, expectedPlayerCommit);
  await verifyChecksumsAndInventory(sourceRoot, manifest.checksums);

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
    checksums: manifest.checksums,
  };
  await writeJson(join(resolve(publicDirectory), "current.json"), current);
  const promotionPath = join(resolve(promotionsDirectory), `${manifest.release}.json`);
  await writeJson(promotionPath, promotion);

  return { release: manifest.release, destination, current, promotion, promotionPath };
}

function validateReleaseManifest(manifest, expectedSourceCommit, expectedPlayerCommit) {
  if (!isRecord(manifest) || typeof manifest.release !== "string" || !/^milim-web-\d+\.\d+\.\d+$/.test(manifest.release)) {
    throw new Error("Milim release manifest has an invalid release identifier");
  }
  if (!isRecord(manifest.source) || manifest.source.repository !== PRIVATE_REPOSITORY) {
    throw new Error(`Milim release source repository must be ${PRIVATE_REPOSITORY}`);
  }
  requireFullCommit(manifest.source.commit, "private source");
  if (manifest.source.commit !== expectedSourceCommit) throw new Error("Milim private source commit does not match the reviewed commit");

  if (!isRecord(manifest.player)) throw new Error("Milim release is missing public player provenance");
  requireFullCommit(manifest.player.commit, "public player");
  if (manifest.player.commit !== expectedPlayerCommit) throw new Error("Milim public player commit does not match the reviewed commit");
  for (const field of ["repository", "version", "entry", "license"]) {
    if (manifest.player[field] !== PLAYER_RECORD[field]) {
      throw new Error(`Milim public player ${field} does not match the frozen 0.2.0 record`);
    }
  }
  if (!isRecord(manifest.checksums)) throw new Error("Milim release checksums must be an object");
}

async function verifyChecksumsAndInventory(sourceRoot, checksums) {
  const payloadFiles = (await listPayloadFiles(sourceRoot)).filter((path) => path !== "release.json").sort();
  const checksumFiles = Object.keys(checksums).sort();
  for (const path of checksumFiles) {
    if (!isSafeRelativePath(path)) throw new Error(`Unsafe checksum path: ${path}`);
    if (typeof checksums[path] !== "string" || !SHA256.test(checksums[path])) throw new Error(`Invalid SHA-256 checksum for ${path}`);
  }
  if (payloadFiles.length !== checksumFiles.length || payloadFiles.some((path, index) => path !== checksumFiles[index])) {
    throw new Error("Milim checksum inventory does not exactly match the release payload");
  }
  for (const path of checksumFiles) {
    const contents = await readFile(join(sourceRoot, ...path.split("/")));
    const actual = createHash("sha256").update(contents).digest("hex");
    if (actual !== checksums[path]) throw new Error(`Milim checksum drift detected for ${path}`);
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

function isSafeRelativePath(path) {
  return typeof path === "string"
    && path.length > 0
    && !path.includes("\\")
    && !path.startsWith("/")
    && posix.normalize(path) === path
    && path !== ".."
    && !path.startsWith("../");
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
