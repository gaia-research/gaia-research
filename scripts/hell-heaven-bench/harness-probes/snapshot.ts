// snapshot.ts — read-only config-state + fixture-skill snapshot for harness capability
// trials (docs/labs/harness-capability-matrix.md). Part of the reproducibility
// requirement: pin the INPUT side (fixture skill hashes + what a real discovery path
// contained at probe time) while harness *version* drift is expected and simply recorded.
//
// Hashing matches scripts/hell-heaven-bench/census.ts exactly (sha256 hex digest of the
// full file content) — do not invent a second hashing scheme.
//
// This script only READS from the paths it is given. It never writes into a real
// harness config dir (~/.codex, ~/.pi, ~/.claude, ~/.grok are read-only to the trial).
//
// Usage:
//   npx tsx scripts/hell-heaven-bench/harness-probes/snapshot.ts \
//     --label codex-real-config --paths ~/.codex/config.toml,~/.agents/skills \
//     --out scripts/hell-heaven-bench/harness-probes/runs/<name>.snapshot.json
//
//   npx tsx scripts/hell-heaven-bench/harness-probes/snapshot.ts \
//     --label fixture-skill --paths scripts/hell-heaven-bench/harness-probes/fixtures \
//     --out scripts/hell-heaven-bench/harness-probes/runs/<name>.fixtures.json

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

interface FileEntry {
  path: string; // absolute path, as read
  sizeBytes: number;
  sha256: string;
}

interface SnapshotOutput {
  label: string;
  capturedAtUtc: string;
  requestedPaths: string[];
  files: FileEntry[];
  note: string;
}

function expandHome(p: string): string {
  if (p.startsWith("~/")) return join(homedir(), p.slice(2));
  return p;
}

function sha256File(path: string): { sizeBytes: number; sha256: string } {
  const buf = readFileSync(path);
  return { sizeBytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") };
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function collect(path: string): FileEntry[] {
  const abs = resolve(expandHome(path));
  if (!existsSync(abs)) return [];
  const st = statSync(abs);
  const out: FileEntry[] = [];
  if (st.isDirectory()) {
    for (const f of walk(abs)) {
      const { sizeBytes, sha256 } = sha256File(f);
      out.push({ path: f, sizeBytes, sha256 });
    }
  } else {
    const { sizeBytes, sha256 } = sha256File(abs);
    out.push({ path: abs, sizeBytes, sha256 });
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

function parseArgs(argv: string[]): { label: string; paths: string[]; out: string } {
  const get = (flag: string): string => {
    const i = argv.indexOf(flag);
    if (i === -1 || i + 1 >= argv.length) throw new Error(`missing ${flag}`);
    return argv[i + 1];
  };
  return {
    label: get("--label"),
    paths: get("--paths").split(",").map((p) => p.trim()).filter(Boolean),
    out: get("--out"),
  };
}

function main() {
  const { label, paths, out } = parseArgs(process.argv.slice(2));
  const files = paths.flatMap(collect);
  const snapshot: SnapshotOutput = {
    label,
    capturedAtUtc: new Date().toISOString(),
    requestedPaths: paths,
    files,
    note:
      "Read-only capture: paths + sizes + sha256 content hashes only, no file contents. " +
      "Real harness config dirs (~/.codex, ~/.pi, ~/.claude, ~/.grok) were never written to " +
      "by this script or by any probe in this directory.",
  };
  writeFileSync(out, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`wrote ${files.length} file record(s) to ${out}`);
}

main();
