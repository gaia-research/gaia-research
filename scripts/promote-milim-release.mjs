import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const RELEASE = /^milim-web-\d+\.\d+\.\d+$/;
const SHA256 = /^[a-f0-9]{64}$/;
const REQUIRED_SCENES = new Map([
  [1, ["cyber-slime-lab-v1", "slime-reactor-halo-v1", "dragon-signal-observatory-v1"]],
  [2, ["cyber-slime-lab-v2", "slime-reactor-halo-v2", "dragon-signal-observatory-v2"]],
]);
export class PromotionError extends Error { constructor(message, detail) { super(message); this.name = "PromotionError"; this.detail = detail; } }
const fail = (condition, message, detail) => { if (!condition) throw new PromotionError(message, detail); };
const safePath = (value, label = "path") => { fail(typeof value === "string" && /^\.\/[A-Za-z0-9._/-]+$/.test(value) && !value.includes("..") && !value.includes("\\"), `${label} is unsafe`, { value }); return value.slice(2); };
const hash = async (file) => { const data = await readFile(file); return { bytes: data.byteLength, sha256: createHash("sha256").update(data).digest("hex") }; };
const exists = async (file) => { try { await stat(file); return true; } catch { return false; } };
async function files(root, relative = "") { const result=[]; for (const entry of (await readdir(path.join(root,relative),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) { const child=path.posix.join(relative,entry.name); if(entry.isDirectory()) result.push(...await files(root,child)); else if(entry.isFile()) result.push(`./${child}`); else throw new PromotionError("release contains a non-regular file",{path:child}); } return result; }
function sort(value) { if (Array.isArray(value)) return value.map(sort); if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, sort(value[key])])); return value; }
function stable(value) { return `${JSON.stringify(sort(value), null, 2)}\n`; }

export async function verifyRelease(source, expectedRelease) {
  const manifest = JSON.parse(await readFile(path.join(source,"release.json"),"utf8"));
  fail(manifest.format === "milim-release" && manifest.formatVersion === 1, "unsupported release format");
  fail(RELEASE.test(manifest.release) && manifest.release === expectedRelease, "release name does not match --release", { manifest: manifest.release, expectedRelease });
  const compatibility = manifest.compatibility?.major;
  const requiredScenes = REQUIRED_SCENES.get(compatibility);
  fail(requiredScenes, "unsupported compatibility major", { compatibility });
  fail(manifest.source?.repository === "gaia-research/milim" && /^[a-f0-9]{7,40}$/.test(manifest.source?.commit ?? "") && !Number.isNaN(Date.parse(manifest.source?.releasedAt ?? "")), "release source record is invalid");
  fail(Array.isArray(manifest.scenes), "release scene catalog is missing");
  const sceneIds = new Set(manifest.scenes.map(scene => scene?.id));
  fail(
    manifest.scenes.length === requiredScenes.length &&
      sceneIds.size === requiredScenes.length &&
      requiredScenes.every(scene => sceneIds.has(scene)),
    `release compatibility ${compatibility} scene catalog does not match`,
    { actual: [...sceneIds], required: requiredScenes },
  );
  fail(Array.isArray(manifest.files) && manifest.files.length > 0, "release files list is missing");
  const listed = new Set();
  for (const entry of manifest.files) { const relative=safePath(entry.path,"files.path"); fail(relative !== "release.json", "release.json cannot checksum itself"); fail(!listed.has(entry.path), "duplicate files entry", {path:entry.path}); listed.add(entry.path); fail(Number.isInteger(entry.bytes) && entry.bytes >= 0 && SHA256.test(entry.sha256), "invalid checksum entry", {path:entry.path}); const measured=await hash(path.join(source,relative)); fail(measured.bytes===entry.bytes && measured.sha256===entry.sha256, "checksum mismatch", {path:entry.path, expected:entry, actual:measured}); }
  const actual = (await files(source)).filter(file => file !== "./release.json");
  fail(actual.length === listed.size && actual.every(file => listed.has(file)), "release includes unlisted or missing payload files", {actual, listed:[...listed].sort()});
  for (const reference of [manifest.player?.entry, manifest.model?.url, ...(manifest.scenes || []).map(scene => scene.url), ...Object.values(manifest.fallbacks || {})]) fail(listed.has(reference), "release reference is not checksummed", {path:reference});
  return manifest;
}

export async function promoteMilimRelease({ source, release, sourceCommit, websiteRoot = process.cwd() }) {
  fail(/^[a-f0-9]{7,40}$/.test(sourceCommit ?? ""), "--source-commit must be a lowercase git hash");
  const sourceDirectory = path.resolve(source);
  const manifest = await verifyRelease(sourceDirectory, release);
  fail(manifest.source?.commit === sourceCommit, "--source-commit does not match release manifest", { manifest: manifest.source?.commit, sourceCommit });
  const target = path.join(websiteRoot, "public", "milim", "releases", release);
  fail(!(await exists(target)), "release destination already exists and is immutable", { target });
  await mkdir(path.dirname(target), { recursive: true });
  await cp(sourceDirectory, target, { recursive: true, force: false, errorOnExist: true, dereference: false });
  await verifyRelease(target, release);
  const current = { format: "milim-current", formatVersion: 1, release, manifest: `./releases/${release}/release.json`, source: { repository: manifest.source.repository, commit: sourceCommit, releasedAt: manifest.source.releasedAt } };
  const promotion = { format: "milim-public-promotion", formatVersion: 1, release, manifest: current.manifest, source: current.source };
  const currentPath = path.join(websiteRoot, "public", "milim", "current.json");
  const recordPath = path.join(websiteRoot, "docs", "promotions", `${release}.json`);
  await mkdir(path.dirname(currentPath), { recursive: true }); await mkdir(path.dirname(recordPath), { recursive: true });
  await writeFile(currentPath, stable(current)); await writeFile(recordPath, stable(promotion));
  return { target, currentPath, recordPath, release };
}

function readArgs(argv) { const result={}; for(let i=2;i<argv.length;i+=2) result[argv[i]?.replace(/^--/,"")]=argv[i+1]; return result; }
if (import.meta.url === `file://${process.argv[1]}`) { const args=readArgs(process.argv); if(!args.source || !args.release || !args["source-commit"]) { console.error("usage: node scripts/promote-milim-release.mjs --source <release directory> --release <milim-web-x.y.z> --source-commit <sha>"); process.exit(1); } console.log(JSON.stringify(await promoteMilimRelease({source:args.source,release:args.release,sourceCommit:args["source-commit"]}),null,2)); }
