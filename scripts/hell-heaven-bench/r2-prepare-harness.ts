import { createHash } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { hashBundle } from "./r2-bundle/runtime/src/provision.ts";

async function main() {
  const manifest = JSON.parse(readFileSync(new URL("./data/r2/execution-manifest.json", import.meta.url), "utf8"));
  const destination = resolve(process.argv[2] ?? ".r2-local/claude-2.1.165");
  const archive = `${destination}.tgz`;
  if (existsSync(destination)) rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  const response = await fetch(manifest.harness.tarball);
  if (!response.ok || !response.body) throw new Error(`harness acquisition failed: HTTP ${response.status}`);
  await pipeline(Readable.fromWeb(response.body as never), createWriteStream(archive));
  const bytes = readFileSync(archive);
  const observedIntegrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
  if (observedIntegrity !== manifest.harness.tarballIntegritySha512) throw new Error(`tarball integrity mismatch: ${observedIntegrity}`);
  const tar = spawnSync("tar", ["-xzf", archive, "--strip-components=1", "-C", destination], { encoding: "utf8" });
  rmSync(archive, { force: true });
  if (tar.status !== 0) throw new Error(`tar extraction failed: ${tar.stderr}`);
  const observedTree = hashBundle(destination);
  if (observedTree !== manifest.harness.bundleTreeSha256) throw new Error(`harness tree mismatch: ${observedTree}`);
  console.log(JSON.stringify({ ready: true, destination, bundleTreeSha256: observedTree, entry: manifest.harness.entry }, null, 2));
}
main().catch(error => { console.error(`r2-prepare-harness: ${(error as Error).message}`); process.exit(2); });
