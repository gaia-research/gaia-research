#!/usr/bin/env node
// KC9 — generate the Milim voice-over track for the demo video.
//
// WHY THE AUDIO IS THE TIMELINE. Each line is synthesised on its own, then the
// track is assembled as line + silence(gap) + line + silence(gap) … So the
// absolute start time of caption N is *by construction* the sum of everything
// before it. There is no hand-tuned offset anywhere and no way for the captions
// to drift out of sync with the voice, however long a take runs.
//
// WHAT IS COMMITTED. The concatenated track (`kc9-narration.m4a`) and the
// manifest (`kc9-narration.json`: exact text, per-line duration, sha256 of the
// audio bytes). Per-line MP3s stay in the gitignored working directory. That
// keeps the video rebuildable from committed inputs with **no API key** —
// `record-kc9-video.mjs` needs the track, not the credential — while the
// manifest records what was said and how long each line ran.
//
// TTS is not deterministic: re-running this produces a different take, new
// durations, and therefore a new (self-consistent) timeline. That is why the
// durations are committed rather than assumed.
//
// Usage:
//   node scripts/hell-heaven-bench/narrate-kc9.mjs
//   node scripts/hell-heaven-bench/narrate-kc9.mjs --dry-run   # no API calls
//
// Options via env:
//   ELEVENLABS_API_KEY   required (or put it in .env.local)
//   VOICE_ID             ElevenLabs voice (default: the Milim voice)
//   MODEL_ID             default eleven_multilingual_v2
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCues, caption, estimateMs } from "./kc9-script.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TRANSCRIPT = join(REPO_ROOT, "content/reports/hh-benchmark/data/kc9-demo-transcript.jsonl");
const DATA_DIR = join(REPO_ROOT, "content/reports/hh-benchmark/data");
const MANIFEST = join(DATA_DIR, "kc9-narration.json");
const TRACK = join(DATA_DIR, "kc9-narration.m4a");
const WORK = join(REPO_ROOT, "scripts/.hh-demo/narration");

// v3 is the model that honours the inline performance tags in the script; the
// older multilingual_v2 reads the same lines flat and noticeably older.
// Stability 0.5 ("Natural") over 0.0 ("Creative"): with the v2 voice the owner
// asked to lean natural — the tags still land, but the read stops swinging
// between takes, which matters across 21 lines that have to sound like one
// person in one sitting.
const VOICE_ID = process.env.VOICE_ID || "0mEHhncrwNcxHPYG8b63"; // "Little Dragon Girl V2"
const MODEL_ID = process.env.MODEL_ID || "eleven_v3";
const STABILITY = process.env.STABILITY ? Number(process.env.STABILITY) : 0.5;
const DRY = process.argv.includes("--dry-run");

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const envFile = join(REPO_ROOT, ".env.local");
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, "utf8").match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  throw new Error(
    "No ELEVENLABS_API_KEY. Put it in .env.local (gitignored) as ELEVENLABS_API_KEY=sk_... " +
      "or export it in your shell. Run with --dry-run to lay out the timeline without calling the API."
  );
}

function ff(args, label) {
  const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
  if (r.error?.code === "ENOENT") throw new Error("ffmpeg not found on PATH (brew install ffmpeg).");
  if (r.status !== 0) throw new Error(`ffmpeg ${label} failed (${r.status}):\n${String(r.stderr).slice(-1500)}`);
}

function durationMs(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration",
                                  "-of", "default=nw=1:nk=1", file], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffprobe failed on ${file}`);
  return Math.round(Number(r.stdout.trim()) * 1000);
}

const beats = readFileSync(TRANSCRIPT, "utf8").split("\n").filter((l) => l.trim()).map(JSON.parse);
const t = {
  beats,
  native: beats.find((b) => b.posture === "native"),
  floor: beats.find((b) => b.posture === "floor"),
  curated: beats.find((b) => b.posture === "curated"),
};
t.derived = {
  bloat: t.native.tokens.perTurn - t.floor.tokens.perTurn,
  totalWallMs: beats.reduce((a, b) => a + b.wallClockMs, 0),
};

const cues = buildCues(t);
console.log(`${cues.length} lines, ${cues.reduce((a, c) => a + c.say.split(/\s+/).length, 0)} words`);

if (DRY) {
  let total = 0;
  for (const c of cues) total += estimateMs(c.say) + c.gapMs;
  console.log(`--dry-run: no audio generated. Estimated runtime ${(total / 1000).toFixed(1)}s.`);
  for (const c of cues) console.log(`  ${c.id.padEnd(16)} ~${(estimateMs(c.say) / 1000).toFixed(1)}s  +${c.gapMs}ms`);
  process.exit(0);
}

const key = apiKey();
rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

const lines = [];
for (const c of cues) {
  const out = join(WORK, `${c.id}.mp3`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({
      text: c.say,
      model_id: MODEL_ID,
      voice_settings: { stability: STABILITY, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status} on "${c.id}": ${(await res.text()).slice(0, 400)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  const ms = durationMs(out);
  // `text` is what was sent to the model (tags and all); `caption` is what the
  // page shows. Recording both makes the stripping auditable rather than implied.
  lines.push({ id: c.id, text: c.say, caption: caption(c.say), durationMs: ms, gapMs: c.gapMs,
               sha256: createHash("sha256").update(buf).digest("hex") });
  console.log(`  ${c.id.padEnd(16)} ${(ms / 1000).toFixed(1)}s`);
}

// Assemble: line, silence(gap), line, silence(gap) … The concat demuxer keeps
// this exact and makes the running sum in the manifest the literal truth.
const listPath = join(WORK, "concat.txt");
const parts = [];
for (const l of lines) {
  parts.push(join(WORK, `${l.id}.mp3`));
  const sil = join(WORK, `sil-${l.id}.mp3`);
  ff(["-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(l.gapMs / 1000),
      "-c:a", "libmp3lame", "-b:a", "128k", sil], `silence ${l.id}`);
  parts.push(sil);
}
writeFileSync(listPath, parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n"));
ff(["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c:a", "aac", "-b:a", "96k", "-ar", "44100", "-ac", "1", TRACK], "concat");

let at = 0;
for (const l of lines) { l.at = at; at += l.durationMs + l.gapMs; }

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(MANIFEST, JSON.stringify({
  schema: "kc9-narration/v1",
  voiceId: VOICE_ID,
  modelId: MODEL_ID,
  stability: STABILITY,
  track: "kc9-narration.m4a",
  trackSha256: createHash("sha256").update(readFileSync(TRACK)).digest("hex"),
  totalMs: at,
  lines,
}, null, 2) + "\n");

console.log(`\nwrote ${TRACK} (${(durationMs(TRACK) / 1000).toFixed(1)}s)`);
console.log(`wrote ${MANIFEST} (${lines.length} lines, timeline ${(at / 1000).toFixed(1)}s)`);
console.log(`\nnext:\n  node scripts/hell-heaven-bench/render-kc9-replay.mjs ${TRANSCRIPT} public/reports/hh-benchmark/kc9-demo-replay.html\n  node scripts/hell-heaven-bench/record-kc9-video.mjs`);
