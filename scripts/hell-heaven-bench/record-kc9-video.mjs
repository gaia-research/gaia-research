#!/usr/bin/env node
// KC9 — record the replay page's cinema mode into the MP4 the site serves.
//
// WHAT THIS IS, AND WHAT IT IS NOT. It is a screen capture of
// `public/reports/hh-benchmark/kc9-demo-replay.html` opened with `?autoplay=1`,
// which plays the committed transcript on a 180-second timeline. It is NOT a
// re-enactment, an animation of numbers someone typed, or a terminal recording
// of a run that did not happen: every figure on every frame is read out of
// `kc9-demo-transcript/v1` by the renderer, so the video cannot say a number the
// ledger records do not. Re-running this script against the same transcript
// produces the same walkthrough.
//
// Playwright is intentionally NOT a project dependency (keeps the Cloudflare
// bundle lean) — resolved the same three ways as `scripts/visual-audit.mjs`:
// (1) PW_PATH, (2) a normal import, (3) the newest npx cache under $HOME.
// ffmpeg must be on PATH.
//
// Usage:
//   node scripts/hell-heaven-bench/record-kc9-video.mjs
//
// Options via env:
//   PAGE       replay page to record   (default public/reports/hh-benchmark/kc9-demo-replay.html)
//   OUT        mp4 to write            (default public/reports/hh-benchmark/kc9-demo.mp4)
//   POSTER     jpg to write            (default public/reports/hh-benchmark/kc9-demo-poster.jpg)
//   POSTER_AT  poster timestamp (s)    (default 137 — just after the curated arm passes)
//   PW_PATH    absolute path to a playwright module
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, tmpdir } from "node:os";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PAGE = resolve(REPO_ROOT, process.env.PAGE || "public/reports/hh-benchmark/kc9-demo-replay.html");
const OUT = resolve(REPO_ROOT, process.env.OUT || "public/reports/hh-benchmark/kc9-demo.mp4");
const POSTER = resolve(REPO_ROOT, process.env.POSTER || "public/reports/hh-benchmark/kc9-demo-poster.jpg");
const NARRATION = resolve(REPO_ROOT, process.env.NARRATION || "content/reports/hh-benchmark/data/kc9-narration.m4a");
// Default poster: the frame where the curated arm passes. Derived from the
// script's own cue times when a narration manifest exists, so it keeps landing
// on that beat after a re-take changes every timestamp.
const MANIFEST = resolve(REPO_ROOT, "content/reports/hh-benchmark/data/kc9-narration.json");
function posterAt() {
  if (process.env.POSTER_AT) return Number(process.env.POSTER_AT);
  if (existsSync(MANIFEST)) {
    const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
    const i = m.lines.findIndex((l) => l.id === "curated-pass");
    if (i >= 0) return (m.lines[i].at + m.lines[i].durationMs * 0.75) / 1000;
  }
  return 126;
}
const POSTER_AT = posterAt();

// Cloudflare Workers static assets reject any single file over 25 MiB. A flat
// dark UI at CRF 23 lands far under it; assert rather than discover it on deploy.
const MAX_BYTES = 25 * 1024 * 1024;
const W = 1920;
const H = 1080;

async function resolveChromium() {
  if (process.env.PW_PATH) {
    const m = await import(pathToFileURL(process.env.PW_PATH).href);
    return m.chromium ?? m.default?.chromium;
  }
  try {
    const m = await import("playwright");
    if (m.chromium ?? m.default?.chromium) return m.chromium ?? m.default?.chromium;
  } catch { /* fall through */ }
  for (const base of [join(homedir(), "AppData", "Local", "npm-cache", "_npx"), join(homedir(), ".npm", "_npx")]) {
    if (!existsSync(base)) continue;
    const candidates = readdirSync(base)
      .map((d) => join(base, d, "node_modules", "playwright", "index.js"))
      .filter((p) => existsSync(p))
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    if (candidates.length) {
      const m = await import(pathToFileURL(candidates[0]).href);
      return m.chromium ?? m.default?.chromium;
    }
  }
  throw new Error(
    "Could not resolve Playwright. Install it (npx playwright install chromium) or set PW_PATH " +
      "to an absolute path to a playwright/index.js."
  );
}

function ffmpeg(args, label) {
  const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
  if (r.error && r.error.code === "ENOENT") throw new Error("ffmpeg not found on PATH — install it (brew install ffmpeg).");
  if (r.status !== 0) throw new Error(`ffmpeg ${label} failed (exit ${r.status}):\n${String(r.stderr).slice(-2000)}`);
}

if (!existsSync(PAGE)) {
  throw new Error(`replay page not found: ${PAGE}\nRender it first:\n  node scripts/hell-heaven-bench/render-kc9-replay.mjs content/reports/hh-benchmark/data/kc9-demo-transcript.jsonl ${PAGE}`);
}

const chromium = await resolveChromium();
const work = mkdtempSync(join(tmpdir(), "kc9-video-"));
const errors = [];

// The page plays in real time, so the capture costs exactly what the walkthrough
// runs. Read that from the manifest rather than restating a number that moves
// with every re-take.
const runtimeS = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")).totalMs / 1000 : null;
console.log(`recording ${PAGE} @ ${W}x${H}` +
  (runtimeS ? ` — plays its own ${runtimeS.toFixed(0)} s timeline in real time` : " — real-time playback"));
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
  recordVideo: { dir: work, size: { width: W, height: H } },
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto(`${pathToFileURL(PAGE).href}?autoplay=1`);
await page.waitForSelector('body[data-replay-done="1"]', { timeout: 240_000 });
await page.waitForTimeout(1500); // hold on the closing frame
await context.close();
await browser.close();

if (errors.length) throw new Error(`page errors during capture:\n${errors.join("\n")}`);

const webm = readdirSync(work).filter((f) => f.endsWith(".webm")).map((f) => join(work, f))[0];
if (!webm) throw new Error(`Playwright wrote no video into ${work}`);

mkdirSync(dirname(OUT), { recursive: true });
// -r 30 normalises Playwright's variable-rate webm; yuv420p + faststart are what
// Safari and in-page playback need.
//
// The narration track starts at t=0 alongside the page's own clock, and the
// page's cue times were derived from this track's line durations — so a plain
// mux is already in sync. No offset to tune, and none to get wrong.
const hasNarration = existsSync(NARRATION);
if (!hasNarration) {
  console.log(`no narration track at ${NARRATION} — encoding SILENT (captions only).`);
  console.log("  To add the voice-over: node scripts/hell-heaven-bench/narrate-kc9.mjs");
}
ffmpeg([
  "-y", "-i", webm,
  ...(hasNarration ? ["-i", NARRATION] : []),
  "-c:v", "libx264", "-preset", "slow", "-crf", "23",
  "-r", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
  "-vf", `scale=${W}:${H}:flags=lanczos`,
  ...(hasNarration
    ? ["-map", "0:v:0", "-map", "1:a:0", "-c:a", "aac", "-b:a", "96k", "-shortest"]
    : ["-an"]),
  OUT,
], "encode");
ffmpeg(["-y", "-ss", String(POSTER_AT), "-i", OUT, "-frames:v", "1", "-q:v", "3", POSTER], "poster");

rmSync(work, { recursive: true, force: true });

const bytes = statSync(OUT).size;
const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration",
                                    "-of", "default=nw=1:nk=1", OUT], { encoding: "utf8" });
const secs = probe.status === 0 ? Number(probe.stdout.trim()).toFixed(1) : "?";

console.log(`wrote ${OUT}  ${(bytes / 1024 / 1024).toFixed(2)} MiB  ${secs}s`);
console.log(`wrote ${POSTER} (frame at ${POSTER_AT}s)`);
if (bytes > MAX_BYTES) {
  throw new Error(`${OUT} is ${(bytes / 1024 / 1024).toFixed(2)} MiB — over Cloudflare's 25 MiB per-asset limit. Raise -crf or drop the frame rate.`);
}
