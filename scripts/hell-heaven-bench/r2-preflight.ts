import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative, resolve, sep } from "node:path";
import { validateIdentityManifest, validateTaskMatrix } from "./r2-contract.ts";

const ROOT = resolve(import.meta.dirname, "../..");
const DATA = join(import.meta.dirname, "data/r2");
const BUNDLE = join(import.meta.dirname, "r2-bundle");
const manifest = JSON.parse(readFileSync(join(DATA, "execution-manifest.json"), "utf8"));
const failures: Array<{ gate: string; detail: string }> = [];
const passes: string[] = [];
const fail = (gate: string, detail: string) => failures.push({ gate, detail });
const pass = (gate: string) => passes.push(gate);

function fileHash(path: string): string { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function treeHash(root: string): string {
  const absolute = resolve(root); const hash = createHash("sha256"); let files = 0;
  const walk = (dir: string) => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name); const stat = lstatSync(path);
      if (stat.isDirectory()) walk(path);
      else if (stat.isFile()) { hash.update(relative(absolute, path).split(sep).join("/")); hash.update("\0"); hash.update(readFileSync(path)); hash.update("\0"); files++; }
      else fail("bundle-entry", `${relative(absolute, path)} is not a regular file or directory`);
    }
  };
  walk(absolute); if (!files) throw new Error(`${root}: empty tree`); return hash.digest("hex");
}
function expectHash(gate: string, observed: string, expected: string) { observed === expected ? pass(gate) : fail(gate, `expected ${expected}, observed ${observed}`); }

try {
  const identitiesRaw = JSON.parse(readFileSync(join(DATA, "content-identities.json"), "utf8"));
  const identities = validateIdentityManifest(identitiesRaw);
  const matrix = JSON.parse(readFileSync(join(DATA, "task-matrix.json"), "utf8"));
  validateTaskMatrix(matrix, identities); pass("contracts");
  expectHash("identity-manifest-pin", fileHash(join(DATA, "content-identities.json")), manifest.bundle.identityManifestSha256);
  expectHash("task-matrix-pin", fileHash(join(DATA, "task-matrix.json")), manifest.bundle.taskMatrixSha256);
  expectHash("fixture-tree-pin", treeHash(join(BUNDLE, "fixtures")), manifest.bundle.fixtureTreeSha256);
  expectHash("evaluator-tree-pin", treeHash(join(BUNDLE, "evaluators")), manifest.bundle.evaluatorTreeSha256);
  expectHash("skill-tree-pin", treeHash(join(BUNDLE, "skills")), manifest.bundle.skillTreeSha256);
  expectHash("runtime-source-pin", treeHash(join(BUNDLE, "runtime")), manifest.runtime.sourceTreeSha256);
  expectHash("runtime-entry-pin", fileHash(join(ROOT, relative(ROOT, resolve(ROOT, manifest.runtime.compiledEntry)))), manifest.runtime.compiledEntrySha256);
  expectHash("run-order-pin", fileHash(join(DATA, "run-order.json")), manifest.bundle.runOrderSha256);

  for (const skill of identities.skills as Array<any>) {
    const body = join(BUNDLE, "skills", skill.slot as string, "SKILL.md");
    expectHash(`skill-${skill.slot}`, fileHash(body), skill.contentSha256 as string);
  }
  const expected = new Set<string>();
  for (const task of matrix.tasks) {
    const fixture = resolve(BUNDLE, task.fixture); if (!statSync(fixture).isDirectory()) fail("fixture-wiring", `${task.taskId}: missing ${fixture}`);
    const matches = [...String(task.endpoint.command).matchAll(/(?:^|&&\s*)node\s+([^\s]+)/g)];
    const evaluator = matches.at(-1)?.[1];
    if (evaluator) { if (!statSync(resolve(BUNDLE, evaluator)).isFile()) fail("evaluator-wiring", `${task.taskId}: missing ${evaluator}`); }
    else if (!String(task.endpoint.command).startsWith("npm test")) fail("evaluator-wiring", `${task.taskId}: unsupported command ${task.endpoint.command}`);
    for (const loadout of task.loadouts) for (const repeatIndex of matrix.repeatIndices) expected.add(`${task.taskId}\0${loadout.id}\0${repeatIndex}`);
  }
  const order = JSON.parse(readFileSync(join(DATA, "run-order.json"), "utf8")); const seen = new Set<string>();
  for (const [i, cell] of order.cells.entries()) { const key = `${cell.taskId}\0${cell.loadoutId}\0${cell.repeatIndex}`; if (cell.order !== i || seen.has(key) || !expected.has(key)) fail("run-order-coverage", `bad cell at order ${i}`); seen.add(key); }
  seen.size === expected.size && seen.size === 600 ? pass("run-order-coverage") : fail("run-order-coverage", `expected 600 unique cells, observed ${seen.size}`);
} catch (error) { fail("repository-contract", (error as Error).message); }

const docker = spawnSync("docker", ["version", "--format", "{{.Server.Version}}"], { encoding: "utf8" });
if (docker.error || docker.status !== 0) fail("container-runtime", `command: docker version --format {{.Server.Version}}; status=${docker.status ?? "spawn-error"}; ${docker.error?.message ?? docker.stderr.trim()}`);
else pass("container-runtime");
const harnessBundle = process.env.R2_HARNESS_BUNDLE;
if (!harnessBundle) fail("harness-bundle", "R2_HARNESS_BUNDLE is absent; run r2-prepare-harness.ts and export its absolute destination");
else try {
  expectHash("harness-bundle", treeHash(harnessBundle), manifest.harness.bundleTreeSha256);
  expectHash("harness-entry", fileHash(join(harnessBundle, manifest.harness.entry)), manifest.harness.entrySha256);
} catch (error) { fail("harness-bundle", `${harnessBundle}: ${(error as Error).message}`); }
const credentials = join(process.env.HOME ?? "", ".claude/.credentials.json");
try { statSync(credentials).isFile() && statSync(credentials).size > 0 ? pass("provider-credentials") : fail("provider-credentials", `${credentials}: empty`); }
catch (error) { fail("provider-credentials", `${credentials}: ${(error as Error).message}`); }
if (process.env.R2_PROVIDER_EGRESS_ENFORCED === "1" && process.env.R2_DOCKER_PROVIDER_NETWORK) pass("provider-egress-allowlist");
else fail("provider-egress-allowlist", "R2_PROVIDER_EGRESS_ENFORCED=1 and R2_DOCKER_PROVIDER_NETWORK are required; do not run unless that Docker network blocks general egress and allows only the provider control plane");

const report = { schema: "hh-r2-preflight-report/v1", ready: failures.length === 0, checkedManifest: relative(ROOT, join(DATA, "execution-manifest.json")), passes, failures };
console.log(JSON.stringify(report, null, 2));
process.exit(failures.length ? 2 : 0);
