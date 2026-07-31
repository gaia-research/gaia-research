#!/usr/bin/env node
// KC9 — render a kc9-demo-transcript/v1 JSONL into ONE self-contained HTML
// replay page. No CDN, no build step, no server, no external font: the page is
// a single file that opens offline and renders identically on any machine.
//
// WHY A REPLAY PAGE AND NOT A TERMINAL RECORDING. The demo is three *headless*
// `claude --output-format json` calls — one prompt in, one JSON blob out. An
// asciinema `.cast` or `script(1)` capture of that is mostly silent pauses
// punctuated by a JSON dump, needs a player (or asciinema.org) to view, and
// cannot show the three arms side by side without editing. The transcript is
// already structured — this project's own habit — so the durable artifact is
// the data plus a renderer for it, and every number on the page is read out of
// the same JSONL the ledger records came from. Nothing is typed into the page
// by hand; there is no figure here that exists nowhere else as data.
//
// THE PAGE HAS TWO MODES.
//   * default        — the manual stepper. Next / Run all / Reset.
//   * ?autoplay=1    — "cinema": a fixed-height stage that plays the run on the
//                      narration's own timeline, with an on-screen caption
//                      track and a camera that focuses each beat as it lands.
//                      Sets `<body data-replay-done="1">` when it finishes.
// Cinema exists so the demo can be captured as a real video without a second
// artifact and without hand-editing: `record-kc9-video.mjs` opens this page with
// `?autoplay=1`, records it with Playwright, and muxes the narration track. The
// video is therefore a screen capture of THIS page — still not a terminal
// recording, and still carrying no figure that is not read from the transcript.
// The script lives in `kc9-script.mjs` and interpolates the beats, so a caption
// that states a number states the transcript's number by construction.
//
// The page itself is always SILENT. The voice-over exists only in the MP4; the
// caption track is the same string that was spoken, so the page loses nothing
// by staying a single self-contained file with no audio payload.
//
// Usage:
//   node render-kc9-replay.mjs <transcript.jsonl> <out.html>
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCues, layout } from "./kc9-script.mjs";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("usage: render-kc9-replay.mjs <transcript.jsonl> <out.html>");
  process.exit(2);
}

const beats = readFileSync(inPath, "utf8")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l));

if (!beats.length) throw new Error(`no beats in ${inPath}`);
for (const b of beats) {
  if (b.schema !== "kc9-demo-transcript/v1") throw new Error(`beat ${b.beat}: unexpected schema ${b.schema}`);
}

const native = beats.find((b) => b.posture === "native");
const floor = beats.find((b) => b.posture === "floor");
const curated = beats.find((b) => b.posture === "curated");
if (!native || !floor || !curated) throw new Error("transcript must carry a native, a floor and a curated beat");

// Derived on the render side so the page never carries a hand-typed figure.
const derived = {
  bloat: native.tokens.perTurn - floor.tokens.perTurn, // uncommitted: native pole is not a ledger record
  totalWallMs: beats.reduce((a, b) => a + b.wallClockMs, 0),
  solved: beats.filter((b) => b.objectiveEndpoint.pass).map((b) => b.label),
};

// ---------------------------------------------------------------------------
// The cinema timeline.
//
// The script (words + camera plan) lives in `kc9-script.mjs`, shared with
// `narrate-kc9.mjs` so the spoken line and the on-screen caption are literally
// the same string. Absolute start times come from the REAL narration
// durations recorded in `kc9-narration.json` — the track is assembled as
// line + gap + line + gap, so a caption's start time is the running sum of
// everything before it and cannot drift from the voice.
//
// With no manifest yet the page still plays, on estimated durations, silent
// and captioned. The manifest is what makes it exact.
// ---------------------------------------------------------------------------
const HERE = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(HERE, "..", "..", "content/reports/hh-benchmark/data/kc9-narration.json");
let durations = null;
let narration = null;
if (existsSync(manifestPath)) {
  narration = JSON.parse(readFileSync(manifestPath, "utf8"));
  durations = Object.fromEntries(narration.lines.map((l) => [l.id, l.durationMs]));
}

const cues = buildCues({ beats, native, floor, curated, derived });
const { timeline, endMs } = layout(cues, durations);

if (durations) {
  const missing = cues.filter((c) => durations[c.id] === undefined).map((c) => c.id);
  if (missing.length) throw new Error(`narration manifest is stale — no audio for: ${missing.join(", ")}. Re-run narrate-kc9.mjs.`);
}
const maxStep = Math.max(...timeline.map((c) => c.step));
if (maxStep !== beats.length) throw new Error(`timeline reveals ${maxStep} beats but the transcript has ${beats.length}`);


const payload = JSON.stringify({ beats, derived, timeline, endMs }).replace(/</g, "\\u003c");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KC9 — the three-minute demo, replayed</title>
<style>
  :root {
    --bg: #0d1014; --surface: #141920; --surface-2: #1b222b; --line: #2b3440;
    --ink: #dfe6ee; --ink-dim: #93a1b1; --ink-faint: #6b7a8a;
    --ok: #6ee7a8; --no: #ff8f7a; --warn: #f0c674; --accent: #7fb8ff;
    --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font-family: var(--mono); font-size: 14px; line-height: 1.6;
    padding: 2rem 1.25rem 5rem;
  }
  .wrap { max-width: 68rem; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin: 0 0 .35rem; letter-spacing: -0.02em; font-weight: 600; }
  h2 { font-size: .95rem; margin: 2.5rem 0 .75rem; color: var(--ink-dim);
       text-transform: none; font-weight: 600; }
  .meta { color: var(--ink-dim); font-size: 12.5px; margin-bottom: 1.5rem; }
  .meta span { white-space: nowrap; }
  .sep { color: var(--line); padding: 0 .5rem; }
  .panel { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 1rem 1.15rem; }
  .panel + .panel { margin-top: .85rem; }
  .label { color: var(--ink-dim); font-size: 12px; margin-bottom: .3rem; }
  .prompt-box { background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px;
                padding: .8rem .95rem; white-space: pre-wrap; word-break: break-word;
                font-size: 13px; color: var(--ink); }
  .term { background: #0a0d11; border: 1px solid var(--line); border-radius: 10px;
          min-height: 19rem; padding: 1rem 1.15rem; overflow-x: auto; }
  .term pre { margin: 0; white-space: pre-wrap; word-break: break-word; font: inherit; }
  .dim { color: var(--ink-dim); }
  .cmd { color: var(--accent); }
  .ok { color: var(--ok); }
  .no { color: var(--no); }
  .warn { color: var(--warn); }
  .ctl { display: flex; gap: .6rem; align-items: center; margin: 1rem 0 0; flex-wrap: wrap; }
  button { font: inherit; background: var(--surface-2); color: var(--ink);
           border: 1px solid var(--line); border-radius: 7px; padding: .45rem 1rem; cursor: pointer;
           transition: background 140ms cubic-bezier(.16,1,.3,1), border-color 140ms cubic-bezier(.16,1,.3,1); }
  button:hover:not(:disabled) { background: #232c37; border-color: #3a4756; }
  button:disabled { opacity: .4; cursor: default; }
  button.play { border-color: #3a4756; color: var(--accent); }
  .step-dots { display: flex; gap: .4rem; margin-left: auto; align-items: center; color: var(--ink-dim); font-size: 12px; }
  .dot { width: 9px; height: 9px; border-radius: 50%; border: 1px solid var(--line); background: transparent; }
  .dot.done { background: var(--ink-dim); border-color: var(--ink-dim); }
  .dot.now { background: var(--accent); border-color: var(--accent); }
  table { width: 100%; border-collapse: collapse; margin-top: .5rem; font-size: 13px; }
  th, td { border: 1px solid var(--line); padding: .5rem .7rem; text-align: left; vertical-align: top; }
  th { background: var(--surface-2); color: var(--ink-dim); font-weight: 600; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .tbl-scroll { overflow-x: auto; }
  .badge { display: inline-block; border: 1px solid var(--line); border-radius: 999px;
           padding: .05rem .55rem; font-size: 11.5px; }
  .badge.ok { border-color: var(--ok); color: var(--ok); }
  .badge.no { border-color: var(--no); color: var(--no); }
  .footnote { color: var(--ink-dim); font-size: 12.5px; margin-top: 1.75rem; }
  .footnote code { color: var(--ink); }
  a { color: var(--accent); }

  /* --- cinema: the ?autoplay=1 stage the video is captured from ----------- */
  .prog, .cap { display: none; }
  body.cinema { padding: 0; height: 100vh; overflow: hidden; font-size: 18px; }
  /* Bottom padding reserves the caption bar's band, so no act ever renders
     underneath it. Keep it >= .cap min-height. */
  body.cinema .wrap { max-width: 92rem; height: 100vh; padding: 2.4rem 3rem 11.5rem;
                      display: flex; flex-direction: column; }
  body.cinema h1 { font-size: 2rem; }
  body.cinema .meta { font-size: .8rem; margin-bottom: 1.6rem; }
  body.cinema h2 { font-size: 1rem; margin: 1.4rem 0 .6rem; }
  body.cinema .prompt-box { font-size: 1rem; }
  body.cinema table { font-size: .95rem; }
  body.cinema .footnote { font-size: .85rem; }
  body.cinema .ctl button, body.cinema .play-row { display: none; }
  body.cinema .act { display: none; }
  body.cinema .act.live { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
  body.cinema #act-setup.live { justify-content: center; }
  body.cinema #act-verdict.live { justify-content: flex-start; }
  /* The stage is a fixed height, so a third beat can outgrow the terminal.
     Let it scroll (driven to the bottom on every beat) rather than clip the
     newest arm, and hide the bar so the capture stays clean. */
  body.cinema .term { flex: 1 1 auto; min-height: 0; overflow-y: auto; scrollbar-width: none;
                      font-size: .92rem; }
  body.cinema .term::-webkit-scrollbar { display: none; }
  body.cinema .reveal { opacity: 0; transform: translateY(8px);
                        transition: opacity 520ms cubic-bezier(.16,1,.3,1), transform 520ms cubic-bezier(.16,1,.3,1); }
  body.cinema .reveal.shown { opacity: 1; transform: none; }
  body.cinema .bloat.hot { background: rgba(240,198,116,.13); border-radius: 4px;
                           box-shadow: 0 0 0 .35rem rgba(240,198,116,.13); }

  /* --- the camera --------------------------------------------------------
     There is no cropping or panning here: the "camera" is attention. The block
     the narration is talking about stays lit; everything else recedes. On a
     terminal dump that reads far better than a zoom, because the reader keeps
     the full context on screen and is simply told where to look. */
  body.cinema .focusable { transition: opacity 460ms cubic-bezier(.16,1,.3,1),
                                       filter 460ms cubic-bezier(.16,1,.3,1); }
  body.cinema .focusable.away { opacity: .26; filter: saturate(.45); }
  body.cinema .focusable.near { opacity: 1; }
  body.cinema .beat { display: block; }
  body.cinema .pop { animation: pop 620ms cubic-bezier(.16,1,.3,1) both; }
  @keyframes pop { 0% { transform: scale(1); } 38% { transform: scale(1.045); } 100% { transform: scale(1); } }
  .beat, .bloat { transform-origin: left center; }
  /* Act entries breathe in rather than cutting. Fires only on stage change,
     since toggle() with an explicit boolean will not re-add a present class. */
  body.cinema .act.live { animation: actIn 560ms cubic-bezier(.16,1,.3,1) both; }
  @keyframes actIn { from { opacity: 0; transform: translateY(12px) scale(.994); }
                     to   { opacity: 1; transform: none; } }
  body.cinema #tbl.near { animation: pushIn 780ms cubic-bezier(.16,1,.3,1) both; }
  @keyframes pushIn { from { transform: scale(.985); opacity: .6; } to { transform: none; opacity: 1; } }
  body.cinema .prog { display: block; position: fixed; top: 0; left: 0; right: 0; height: 3px;
                      background: var(--line); z-index: 3; }
  body.cinema .prog i { display: block; height: 100%; width: 0; background: var(--accent); }
  body.cinema .cap { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 2;
                     min-height: 11rem; align-items: center; justify-content: center;
                     padding: 1.4rem 3rem 2rem;
                     background: linear-gradient(to top, var(--bg) 62%, rgba(13,16,20,0)); }
  body.cinema .cap p { margin: 0; max-width: 64rem; text-align: center;
                       font-size: 1.5rem; line-height: 1.45; letter-spacing: -0.01em; color: #f2f6fa;
                       transition: opacity 260ms ease; }
  body.cinema .cap p.swap { opacity: 0; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
  @media (max-width: 640px) { body { padding: 1.25rem .75rem 4rem; } .term { min-height: 24rem; } }
</style>
</head>
<body>
<div class="prog"><i id="progbar"></i></div>
<div class="wrap">
  <h1>KC9 — the three-minute demo, replayed</h1>
  <div class="meta">
    <span>${esc(curated.harness.name)} ${esc(curated.harness.version)}</span><span class="sep">|</span>
    <span>model ${esc(curated.model)}</span><span class="sep">|</span>
    <span>${esc(curated.recordedAt.slice(0, 10))}</span><span class="sep">|</span>
    <span>benchmark <code>${esc(curated.benchmarkId)}</code> / task <code>${esc(curated.taskId)}</code></span>
  </div>

  <div class="act live" id="act-setup">
    <div class="panel reveal focusable" id="p-prompt">
      <div class="label">The one prompt — byte-identical on all three arms. The answer term is not in it.</div>
      <div class="prompt-box">${esc(beats[0].prompt)}</div>
    </div>
    <div class="panel reveal focusable" id="p-endpoint">
      <div class="label">The one objective endpoint — identical on all three arms. It is the task, not a per-arm goalpost.</div>
      <div class="prompt-box"><span class="cmd">/${esc(beats[0].objectiveEndpoint.regex)}/</span> against the final reply</div>
    </div>
  </div>

  <div class="act live" id="act-replay">
    <h2>Replay</h2>
    <div class="term"><pre id="out"></pre></div>
    <div class="ctl">
      <button id="next">Next &#9656;</button>
      <button id="all">Run all</button>
      <button id="reset">Reset</button>
      <div class="step-dots" id="dots"></div>
    </div>
    <div class="ctl play-row">
      <button class="play" id="play">&#9654;&#65039; Play the 3-minute walkthrough</button>
    </div>
  </div>

  <div class="act live" id="act-verdict">
    <h2>All three arms, side by side</h2>
    <div class="tbl-scroll"><table id="tbl">
      <thead><tr>
        <th>Arm</th><th>Loadout</th><th class="num">perTurn tokens</th><th class="num">wall ms</th>
        <th>Reply</th><th>Task solved</th><th>In ledger</th>
      </tr></thead>
      <tbody></tbody>
    </table></div>

    <div class="footnote" id="verdict"></div>
  </div>
</div>
<div class="cap"><p id="capline"></p></div>

<script type="application/json" id="transcript">${payload}</script>
<script>
(function () {
  var data = JSON.parse(document.getElementById("transcript").textContent);
  var beats = data.beats, derived = data.derived, timeline = data.timeline, endMs = data.endMs;
  var out = document.getElementById("out");
  var dots = document.getElementById("dots");
  var tbody = document.querySelector("#tbl tbody");
  var verdict = document.getElementById("verdict");
  var capline = document.getElementById("capline");
  var progbar = document.getElementById("progbar");
  var step = 0;
  var emphasis = null;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function n(x) { return Number(x).toLocaleString("en-US"); }
  function envStr(env) {
    var ks = Object.keys(env || {});
    return ks.length ? ks.map(function (k) { return k + "=" + env[k]; }).join(" ") + " " : "";
  }
  function line(cls, text) { return '<span class="' + cls + '">' + esc(text) + "</span>\\n"; }

  function renderDots() {
    var h = "";
    for (var i = 0; i < beats.length; i++) {
      var c = i < step ? "dot done" : (i === step ? "dot now" : "dot");
      h += '<span class="' + c + '"></span>';
    }
    dots.innerHTML = h + "<span>&nbsp;" + step + "/" + beats.length + "</span>";
  }

  function renderRows() {
    var h = "";
    for (var i = 0; i < step; i++) {
      var b = beats[i];
      var loadout = b.skillsLoaded.length
        ? b.skillsLoaded.map(function (s) { return s.id; }).join(", ")
        : (b.posture === "native" ? "workstation default (not enumerated by the tool)" : "none");
      var sup = b.committed ? "" : " \\u2021";
      h += "<tr>"
        + "<td><strong>" + esc(b.label) + "</strong><br><span class=dim>" + esc(b.arm) + "</span></td>"
        + "<td>" + esc(loadout) + "</td>"
        + '<td class="num">' + n(b.tokens.perTurn) + sup + "</td>"
        + '<td class="num">' + n(b.wallClockMs) + "</td>"
        + "<td>" + esc(b.reply) + "</td>"
        + '<td><span class="badge ' + (b.objectiveEndpoint.pass ? "ok" : "no") + '">'
        + (b.objectiveEndpoint.pass ? "solved" : "not solved") + "</span></td>"
        + "<td>" + (b.committed ? "yes" : "no \\u2021") + "</td>"
        + "</tr>";
    }
    tbody.innerHTML = h;
  }

  function renderVerdict() {
    if (step < beats.length) { verdict.innerHTML = ""; return; }
    verdict.innerHTML =
      "<p><strong>Measured bloat</strong> (native &minus; floor) = <strong>" + n(derived.bloat)
      + " \\u2021</strong> tokens of standing context that solved nothing on this task. "
      + "The whole run took " + n(derived.totalWallMs) + " ms of harness time across three arms.</p>"
      + "<p>\\u2021 = declared uncommitted workstation context. <code>hh-ledger/v1</code> has no <code>native</code> arm, "
      + "and <code>arm: heaven</code> with an empty loadout would misrepresent the vanilla pole, so the native record is "
      + "emitted to a gitignored directory and never appended. The floor (placebo) and curated (heaven) records are "
      + "committed to the ledger-of-record; every number in this page is read out of the same transcript those records "
      + "came from.</p>"
      + "<p>Curated <code>perTurn</code> includes the skill body actually being read during the run \\u2014 it is not a "
      + "standing-dose figure and is deliberately not differenced against the floor as if it were. The curated standing "
      + "dose is priced separately by the tool: <code>" + esc(beats[2].doseSummary || "") + "</code> (chars4).</p>";
  }

  function renderTerm() {
    var h = "";
    for (var i = 0; i < step; i++) {
      var b = beats[i];
      var g = "";
      g += line("dim", "== [" + b.beat + "/" + beats.length + "] " + b.label.toUpperCase() + "  (posture: " + b.posture + ", arm: " + b.arm + ") ==");
      g += line("cmd", "$ " + envStr(b.env) + b.command + " '<the one prompt>'");
      g += line("dim", "  skillsLoaded: [" + b.skillsLoaded.map(function (s) { return s.id; }).join(", ") + "]"
        + (b.doseSummary ? "   dose(chars4): " + b.doseSummary : ""));
      g += '<span class="focusable" data-focus="beat' + b.beat + '-reply">' + esc("  reply: " + b.reply) + "</span>\\n";
      g += line(b.objectiveEndpoint.pass ? "ok" : "no",
        "  endpoint /" + b.objectiveEndpoint.regex + "/  ->  " + (b.objectiveEndpoint.pass ? "PASS - task solved" : "FAIL - task not solved"));
      g += line(b.committed ? "dim" : "warn",
        "  perTurn: " + n(b.tokens.perTurn) + " tok" + (b.committed ? "   (committed to the ledger)" : " \\u2021 (uncommitted pole, never appended)")
        + "   wall: " + n(b.wallClockMs) + " ms");
      h += '<span class="beat focusable" data-focus="beat' + b.beat + '">' + g + "</span>\\n";
      if (b.posture === "floor") {
        h += '<span class="bloat focusable ' + (derived.bloat > 0 ? "warn" : "no") + (emphasis === "bloat" ? " hot" : "")
          + '" data-focus="bloat">'
          + esc(">> MEASURED BLOAT (native - floor) = " + n(derived.bloat) + " tok \\u2021 - and it solved nothing")
          + "</span>\\n\\n";
      }
    }
    if (!step) h = line("dim", "(press Next to replay the run, beat by beat)");
    out.innerHTML = h;
  }

  function draw() { renderTerm(); renderRows(); renderDots(); renderVerdict();
    document.getElementById("next").disabled = step >= beats.length;
    document.getElementById("all").disabled = step >= beats.length; }

  document.getElementById("next").addEventListener("click", function () { if (step < beats.length) { step++; draw(); } });
  document.getElementById("all").addEventListener("click", function () { step = beats.length; draw(); });
  document.getElementById("reset").addEventListener("click", function () { step = 0; draw(); });
  draw();

  // --- cinema -------------------------------------------------------------
  // One rAF clock off performance.now(), not a chain of setTimeouts: timer
  // coalescing under a headless recorder would drift a chain and desync the
  // captions from the beats. Cues are idempotent, so a dropped frame costs
  // nothing.
  var ACTS = { setup: "act-setup", replay: "act-replay", verdict: "act-verdict" };
  var FOCUS = {
    "p-prompt": ["#p-prompt"],
    "p-endpoint": ["#p-endpoint"],
    beat1: ['[data-focus="beat1"]'],
    beat2: ['[data-focus="beat2"]'],
    beat3: ['[data-focus="beat3"]'],
    "beat3-reply": ['[data-focus="beat3"]', '[data-focus="beat3-reply"]'],
    bloat: ['[data-focus="bloat"]'],
    table: ["#tbl"],
  };

  // The lit block, its ancestors and its descendants stay near; every other
  // focusable block recedes. Nesting matters — the reply line lives inside its
  // beat, and dimming the parent would dim the thing being pointed at.
  function applyFocus(f) {
    var sels = FOCUS[f] || [];
    var targets = [];
    for (var i = 0; i < sels.length; i++) {
      var el = document.querySelector(sels[i]);
      if (el) targets.push(el);
    }
    var all = document.querySelectorAll(".focusable");
    for (var j = 0; j < all.length; j++) {
      var e = all[j];
      e.classList.remove("near", "away", "pop");
      if (!targets.length) continue;
      var hit = false;
      for (var k = 0; k < targets.length; k++) {
        if (targets[k] === e || targets[k].contains(e) || e.contains(targets[k])) { hit = true; break; }
      }
      e.classList.add(hit ? "near" : "away");
    }
    for (var m = 0; m < targets.length; m++) targets[m].classList.add("pop");
  }

  function applyCue(cue) {
    for (var k in ACTS) {
      document.getElementById(ACTS[k]).classList.toggle("live", k === cue.stage);
    }
    ["p-prompt", "p-endpoint"].forEach(function (id) {
      document.getElementById(id).classList.toggle("shown", cue.shown.indexOf(id) !== -1);
    });
    if (step !== cue.step || emphasis !== cue.emphasis) {
      step = cue.step;
      emphasis = cue.emphasis || null;
      draw();
      var term = document.querySelector(".term");
      term.scrollTop = term.scrollHeight;
    }
    applyFocus(cue.focus);
    if (capline.textContent !== cue.cap) {
      capline.classList.add("swap");
      setTimeout(function () { capline.textContent = cue.cap; capline.classList.remove("swap"); }, 180);
    }
  }

  function play() {
    document.body.classList.add("cinema");
    // Cinema owns the acts from here: clear the all-visible manual layout.
    document.getElementById(ACTS.replay).classList.remove("live");
    document.getElementById(ACTS.verdict).classList.remove("live");
    step = 0; emphasis = null; draw();
    var t0 = performance.now();
    var at = -1;
    (function frame() {
      var t = performance.now() - t0;
      progbar.style.width = Math.min(100, (t / endMs) * 100) + "%";
      var i = -1;
      for (var j = 0; j < timeline.length; j++) if (timeline[j].at <= t) i = j;
      if (i !== at && i >= 0) { at = i; applyCue(timeline[i]); }
      if (t >= endMs) { document.body.setAttribute("data-replay-done", "1"); return; }
      requestAnimationFrame(frame);
    })();
  }

  document.getElementById("play").addEventListener("click", play);
  if (/[?&]autoplay=1\\b/.test(location.search)) play();
})();
</script>
</body>
</html>
`;

writeFileSync(outPath, html);
console.log(
  `wrote ${outPath} (${beats.length} beats, ${timeline.length} cues over ${(endMs / 1000).toFixed(1)}s, ` +
  `${html.length} bytes, self-contained)\n` +
  (narration
    ? `  timing: real narration durations from kc9-narration.json (voice ${narration.voiceId})`
    : `  timing: ESTIMATED — no kc9-narration.json yet. Run narrate-kc9.mjs, then re-render.`)
);
