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
//   * ?autoplay=1    — "cinema": a fixed-height stage that plays the run on a
//                      180-second timeline with an on-screen caption track, and
//                      sets `<body data-replay-done="1">` when it finishes.
// Cinema exists so the demo can be captured as a real video without a second
// artifact and without hand-editing: `record-kc9-video.mjs` opens this page with
// `?autoplay=1`, records it with Playwright, and encodes it with ffmpeg. The
// video is therefore a screen capture of THIS page — still not a terminal
// recording, and still carrying no figure that is not read from the transcript.
// The caption strings below are written here in Node and interpolate the beats,
// so a caption that states a number states the transcript's number by
// construction.
//
// Usage:
//   node render-kc9-replay.mjs <transcript.jsonl> <out.html>
import { readFileSync, writeFileSync } from "node:fs";

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
// The cinema timeline. 180 s — the "three minutes" of KC9's own sentence.
//
// Every cue is [atSeconds, stage, stepsRevealed, revealedIds[], caption].
// `stage` swaps which act is on the stage; `stepsRevealed` is the same beat
// counter the manual stepper uses, so cinema and manual render from one code
// path. Any figure inside a caption is interpolated from the transcript here —
// there is no number in this file that was typed rather than read.
// ---------------------------------------------------------------------------
const END_S = 180;
const num = (x) => Number(x).toLocaleString("en-US");
const P_ALL = ["p-prompt", "p-endpoint"];

const CUES = [
  [0, "setup", 0, [],
    "Three runs of one task. The prompt is byte-identical. The pass/fail test is the same regex. Only the loadout changes."],
  [6, "setup", 0, ["p-prompt"],
    "The task: a teammate proposes a side-border on a card. Does any skill you have explicitly name that as an anti-pattern it must refuse?"],
  [18, "setup", 0, ["p-prompt"],
    "The answer is a term coined by exactly one skill contract — and it is deliberately not in the prompt. A guess does not pass."],
  [28, "setup", 0, P_ALL,
    "One objective endpoint, identical on all three arms. It is the task, not a per-arm goalpost."],
  [36, "setup", 0, P_ALL,
    `Arm one: ${native.label}. Vanilla ${native.harness.name} carrying this workstation's entire default loadout.`],

  [43, "replay", 1, P_ALL,
    `${native.label} answers in a single turn — and the answer is ${native.reply}. It cannot name the anti-pattern.`],
  [52, "replay", 1, P_ALL,
    `It paid ${num(native.tokens.perTurn)} per-turn tokens for a loadout that did not contain the one contract this task needed.`],
  [61, "replay", 1, P_ALL,
    "It is not answering wrongly. It answers correctly for what it holds. That is the narrower and truer claim."],
  [70, "replay", 1, P_ALL,
    `Arm two: the ${floor.label}. Every door shut — zero skills loaded.`],

  [77, "replay", 2, P_ALL,
    `The ${floor.label} replies in a sentence, not the contract format. It fails the same endpoint.`],
  [86, "replay", 2, P_ALL,
    `${num(floor.tokens.perTurn)} per-turn tokens. A verified negative: with no skills there is no term to name, and the model says so instead of inventing one.`],
  [97, "replay", 2, P_ALL,
    `${native.label} minus ${floor.label}: ${num(derived.bloat)} tokens of standing context. Both arms failed the task — one paid ${num(derived.bloat)} more to fail.`, "bloat"],
  [108, "replay", 2, P_ALL,
    "That is the measured bloat. Not rhetoric — a subtraction between two live runs, gated identically.", "bloat"],
  [116, "replay", 2, P_ALL,
    `Arm three: ${curated.label}. One skill — the one that holds the contract.`],

  [123, "replay", 3, P_ALL,
    `${curated.label} carries a ${num(curated.tokens.skillStanding)}-token standing listing, opens that one contract, and answers.`],
  [133, "replay", 3, P_ALL,
    `"${curated.reply}" — the coined term, exactly as the contract writes it. The endpoint passes.`],
  [143, "replay", 3, P_ALL,
    `Its ${num(curated.tokens.perTurn)} per-turn includes the skill body being read during the run. That is work done, not weight carried.`],
  [153, "replay", 3, P_ALL,
    `Three arms. One task. Only the ${curated.label} arm solved it.`],

  [160, "verdict", 3, P_ALL,
    "The largest loadout failed. The smallest loadout failed. The chosen loadout passed."],
  [168, "verdict", 3, P_ALL,
    `All three arms cost ${num(derived.totalWallMs)} ms of harness time. The three minutes is the explaining.`],
  [174, "verdict", 3, P_ALL,
    "Every figure here is read from the run transcript. \u2021 marks the one pole that was measured but never committed."],
];

const timeline = CUES.map(([at, stage, step, shown, cap, emphasis]) => ({
  at: at * 1000,
  stage,
  step,
  shown,
  cap,
  emphasis: emphasis || null,
}));

for (let i = 1; i < timeline.length; i++) {
  if (timeline[i].at <= timeline[i - 1].at) throw new Error(`timeline cue ${i} is not after its predecessor`);
}
if (timeline[timeline.length - 1].at >= END_S * 1000) throw new Error("last cue must land before the end mark");
const maxStep = Math.max(...timeline.map((c) => c.step));
if (maxStep !== beats.length) throw new Error(`timeline reveals ${maxStep} beats but the transcript has ${beats.length}`);

const payload = JSON.stringify({ beats, derived, timeline, endMs: END_S * 1000 }).replace(/</g, "\\u003c");
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
  body.cinema .prog { display: block; position: fixed; top: 0; left: 0; right: 0; height: 3px;
                      background: var(--line); z-index: 3; }
  body.cinema .prog i { display: block; height: 100%; width: 0; background: var(--accent); }
  body.cinema .cap { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 2;
                     min-height: 10.5rem; align-items: center; justify-content: center;
                     padding: 1.5rem 3rem 2.2rem;
                     background: linear-gradient(to top, var(--bg) 62%, rgba(13,16,20,0)); }
  body.cinema .cap p { margin: 0; max-width: 62rem; text-align: center;
                       font-size: 1.6rem; line-height: 1.45; letter-spacing: -0.01em; color: #f2f6fa;
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
    <div class="panel reveal" id="p-prompt">
      <div class="label">The one prompt — byte-identical on all three arms. The answer term is not in it.</div>
      <div class="prompt-box">${esc(beats[0].prompt)}</div>
    </div>
    <div class="panel reveal" id="p-endpoint">
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
      h += line("dim", "== [" + b.beat + "/" + beats.length + "] " + b.label.toUpperCase() + "  (posture: " + b.posture + ", arm: " + b.arm + ") ==");
      h += line("cmd", "$ " + envStr(b.env) + b.command + " '<the one prompt>'");
      h += line("dim", "  skillsLoaded: [" + b.skillsLoaded.map(function (s) { return s.id; }).join(", ") + "]"
        + (b.doseSummary ? "   dose(chars4): " + b.doseSummary : ""));
      h += line("", "  reply: " + b.reply);
      h += line(b.objectiveEndpoint.pass ? "ok" : "no",
        "  endpoint /" + b.objectiveEndpoint.regex + "/  ->  " + (b.objectiveEndpoint.pass ? "PASS - task solved" : "FAIL - task not solved"));
      h += line(b.committed ? "dim" : "warn",
        "  perTurn: " + n(b.tokens.perTurn) + " tok" + (b.committed ? "   (committed to the ledger)" : " \\u2021 (uncommitted pole, never appended)")
        + "   wall: " + n(b.wallClockMs) + " ms");
      h += "\\n";
      if (b.posture === "floor") {
        h += '<span class="bloat ' + (derived.bloat > 0 ? "warn" : "no") + (emphasis === "bloat" ? " hot" : "") + '">'
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

  function applyCue(cue) {
    for (var k in ACTS) {
      document.getElementById(ACTS[k]).classList.toggle("live", k === cue.stage);
    }
    ["p-prompt", "p-endpoint"].forEach(function (id) {
      document.getElementById(id).classList.toggle("shown", cue.shown.indexOf(id) !== -1);
    });
    if (step !== cue.step || emphasis !== cue.emphasis) {
      step = cue.step;
      emphasis = cue.emphasis;
      draw();
      var term = document.querySelector(".term");
      term.scrollTop = term.scrollHeight;
    }
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
console.log(`wrote ${outPath} (${beats.length} beats, ${timeline.length} cues over ${END_S}s, ${html.length} bytes, self-contained)`);
