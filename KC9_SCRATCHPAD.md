# KC9 Scratchpad — recoverability anchor

**Read this file top to bottom before doing anything if you are resuming after
a cutoff or credit exhaustion.** Then check `git log --oneline -20` on this
branch for the actual committed state — git is ground truth, this file is a
log of intent and handoff notes.

Marco's own words entering this task: *"We will likely lose creds, let's see
how this will go."* Treat every unit of work as possibly the last one that
lands. Commit + push after every logical step. Never batch.

## The task (skill-heaven issue #13, KC9 half — verbatim)

> KC9: A complete three-minute demo runs native → measured bloat → curated
> launch → successful task.

Issue #13's framing: *"A complete, repeatable three-minute demonstration.
Every public claim it makes must link to a reproducible benchmark record
(B4). This is the Arc I gate artifact."* KC8 (the claim-provenance gate) just
shipped as `gaia-research` PR #139 (branch `docs/kc8-benchmark-ledger`,
open, not merged, awaiting Marco's human-gate review) — KC9's demo should
produce claims that flow into that same claim-index page once both land, not
sit as an unlinked island.

## What already exists — read before reinventing anything

- **`scripts/hell-heaven-bench/demo-m2-floor-live.sh`** (this repo,
  gaia-research) — a WORKING precedent for exactly this shape: drives a real
  `claude` session via a sibling `skill-heaven` checkout's built CLI
  (`$SKILL_HEAVEN_DIR/packages/core/bin/skill-heaven.mjs`), captures per-turn
  token deltas (the hard signal — RATIFICATION D12), and prints (does not
  auto-append) `hh-ledger/v1` records for a human-reviewed follow-up commit.
  Read this file in FULL before writing anything new — KC9 is substantially
  "the same shape, native vs curated, with a task chosen for 3-minute-demo
  legibility," not new infrastructure.
- **The launcher itself is real and tested.** `skill-heaven`'s
  `claude-heaven` CLI (package at `packages/claude-heaven/`) does genuine
  native/curated/product-floor launches: `planLaunch` → `materialize(fsPlan)`
  → writes manifest+settings → invokes real `claude`. This was just
  independently re-verified in Arc I's A1 work (213/213 tests, `tsc` clean,
  merged to `integration/arc-i-lane-a` as PR #21).
- **A local skill-heaven checkout exists** at
  `/Users/marcotiongson/Documents/skill-heaven`, currently detached at
  `integration/arc-i-lane-a` tip `f0e9a27` (includes A1). Point
  `SKILL_HEAVEN_DIR` there. **Do not modify this checkout's committed
  files** — it's a read-only dependency for this task, not something KC9
  edits. If the demo needs a change to skill-heaven itself, that's a
  separate, explicitly-scoped PR in that repo — flag it, don't silently
  patch it inline.
- **`scripts/hell-heaven-bench/ledger.ts`** — append/validate `hh-ledger/v1`
  records. **`scripts/hell-heaven-bench/check-claims.ts`** — the provenance
  gate (now scans `content/reports/hh-benchmark/*.md` by derived directory
  listing, per KC8). Any new report this task writes into that directory is
  automatically gated.
- **No terminal-recording tool is installed on this machine** — confirmed:
  `asciinema`, `asciicast2gif`, `ttygif` all absent. If the demo's
  deliverable requires a durable, shareable recording (not just "runs live on
  someone's laptop"), that's a real tooling gap to solve, not paper over.
  Options to weigh: `asciinema` (terminal session → `.cast` JSON, tiny,
  replayable, can convert to SVG/GIF), plain `script(1)` + a replay tool
  (stdlib, no install), or a structured JSONL transcript (matches this
  project's existing `stream-json` habit) rendered into a static HTML/SVG
  player — the site already has React/Next.js and an SVG-friendly design
  system from the KC8 craft pass. Prefer whatever needs the least new
  infrastructure and is itself gate-compatible (no claim in the recording
  should exist nowhere else as data).

## F7 lock / cursor deferral — same discipline as every other Arc I task

- **F7** (+515 tok, product-floor's door cost) is **locked** by founder
  ruling. Do not re-derive it against a newer `claude` version. If KC9's demo
  independently touches product-floor's cost, that's a *new*, separately
  labeled measurement — never framed as "re-deriving F7."
- **Cursor** is **deferred** — no availability to test it. KC9's demo is
  scoped to `claude`/`claude-heaven` only; do not fabricate or imply a cursor
  arm.

## Pipeline (Marco's design, 2026-07-31)

1. **Plan** (Fable, high effort) — design the demo: exact task chosen, why it
   demos well in <3 min, the native-vs-curated script shape, and specifically
   how the terminal-recording/transcript problem gets solved. Write the plan
   under `## Plan` below. **Marco flagged a credit budget concern for this
   stage** — if Fable errors out, dies, or clearly can't complete a usable
   plan, **fall back to Opus** for the same planning job rather than leaving
   a gap. Whichever model actually produces the plan, say so explicitly in
   the Progress Log.
2. **Execute** (Opus, extra-high/max effort) — build it: the demo script,
   the real recording/transcript mechanism, run it for real against live
   `claude`, produce real `hh-ledger/v1` records (append + validate), and
   (if time/credits allow) a rendered page under `content/reports/hh-benchmark/`
   analogous to KC8's, or at minimum a markdown writeup + linked artifact.
   **Does not merge anything** — PR only, human gate applies same as KC8.

## Recoverability rules — non-negotiable given the stated credit risk

- **Commit + push after every logical unit — never batch.** A pushed commit
  survives a credit cutoff; a local one does not.
- **Update this scratchpad's Progress Log before you stop**, even mid-task —
  what's done, what's next, the EXACT next command to run. Assume whoever
  reads this next has zero memory of this session.
- Branch: `feat/kc9-three-minute-demo`, off `gaia-research` `main` (`f904049`).
  Push to `origin/feat/kc9-three-minute-demo`.
- Before pushing, check `git log --format='%an <%ae>' -3` — must be a real
  Marcus Tiongson identity (`marco.tngsn@gmail.com` or
  `153011150+mbtiongson1@users.noreply.github.com`); set repo-local
  `user.name`/`user.email` if not.
- gaia-research **forbids squash merges** — merge commit, when Marco says so.

---

## Plan

*(Stage 1 fills this in.)*

---

## Progress Log

*(Newest entries at the bottom.)*

- 2026-07-31 — orchestrator: scratchpad created. Worktree at
  `/Users/marcotiongson/Documents/gaia-research-kc9`, branch
  `feat/kc9-three-minute-demo` off `main` @ `f904049`. `skill-heaven` local
  checkout at `/Users/marcotiongson/Documents/skill-heaven` pointed to
  `integration/arc-i-lane-a` tip `f0e9a27` (detached HEAD, read-only
  dependency). Confirmed no terminal-recording tool installed
  (`asciinema`/`asciicast2gif`/`ttygif` all absent) — flagged as a real
  decision point for Stage 1, not assumed away. Handing off to Stage 1
  (planner).
