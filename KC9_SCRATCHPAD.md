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

*(Stage 1 — Fable, high effort. Investigation-only; no scripts written, no
real `claude` session run, ledger untouched. This is the written plan Stage 2
executes against.)*

### 0. What I read before writing this

`scripts/hell-heaven-bench/demo-m2-floor-live.sh` (full), `ledger.ts` (schema
+ CLI), `check-claims.ts` (the provenance gate + its own header rationale),
`README.md` for the bench dir, `content/reports/hh-benchmark/m2-live-demo.md`,
the `claim-index.md` that exists only on the unmerged `origin/docs/kc8-benchmark-ledger`
branch (KC8, PR #139), the local `skill-heaven` checkout's `packages/core/src/cli.ts`
(full `parseArgs`/`main` — the actual flag surface: `--posture`, `--harness`,
`--skill`, `-p`, `--model`, `--effort`, `--record`, `--benchmark-id`, `--task`,
`--arm`, `--endpoint-regex`, `--record-out`, `--note`, `--print`), and
`.agents/skills/impeccable/SKILL.md` in this repo (the fixture M2 already uses
for curated). Confirmed this repo has **no** `.claude/skills/` dir (only
`.agents/skills/`), so `impeccable` is not auto-loaded into a vanilla native
`claude` session launched from this repo's cwd — the native/floor/curated
contrast is driven entirely by skill-heaven's compiled flags, exactly as M2
already relies on. Also confirmed (network + `brew info`) that `asciinema` is
an installable bottled formula on this machine — the earlier "no recording
tool installed" note is about *presence*, not *feasibility*; see §3, I'm
recommending against it anyway, for reasons unrelated to installability.

### 1. The demo task

**One question, asked twice (native, then curated), not two different
probes.** This unifies the four requested beats (native → bloat → curated →
successful task) into a single coherent story instead of M2's two-track
eviction/re-admission structure, which is what "a complete task" in the issue
text seems to want.

**The fixture skill:** reuse `.agents/skills/impeccable` — already the
proven T9 curated fixture (KC8 claim-index B1/C1), zero new integration risk.
Its very first "Absolute ban" is a coined, non-generic term: **"side-stripe
borders"** (`border-left`/`border-right` > 1px as a colored accent). Nobody
spontaneously produces this exact term; it only comes from having that exact
skill text in context. That's the load-bearing property the check leans on —
same design principle M2 used (`/impeccable/`, `^YES`/`^NO`): pick a signal a
model can't fake by chance.

**The prompt** (same string sent to native, floor, and curated — the arm is
the only variable):

```
A teammate proposes this CSS rule for a card component:
`.card { border-left: 4px solid var(--accent); }`
Using ONLY what is already in your context right now — do not run any
tools, scripts, or file reads — does any currently-loaded skill's guidance
flag a specific named anti-pattern that this rule violates? Reply with
EXACTLY one line, no other text: if yes, `SIDE-STRIPE: <one-sentence reason,
citing the skill's own term for this pattern>`; if no skill in your context
says anything about it, reply exactly `NONE`.
```

The "do not run any tools/scripts" clause is deliberate and matches the M2
precedent's own risk-avoidance: `impeccable`'s Setup section says agents
**MUST** run `context.mjs` / read `PRODUCT.md` before "proceeding" on a
design task, which would inject nondeterministic tool-call turns (missing
PRODUCT.md handling, extra latency, extra uncontrolled token cost) into what
needs to be a tight, repeatable, single-turn headless call. M2 sidestepped
this the same way, by asking an enumeration question instead of asking the
model to actually *do* impeccable's job. This prompt goes one step further
than pure enumeration (it's a real judgment call with a real answer), while
still not tripping the Setup section's triggers.

**objectiveEndpoint per arm** (`kind: "regex-match"`, matching M2's style):

| Arm | Expected reply | `--endpoint-regex` | Committed? |
|---|---|---|---|
| native (vanilla) | uncertain — see below | *(no regex asserted as guaranteed; run with `--record` for the local, gitignored, ‡ artifact only, `--arm heaven` following the M2/C3 precedent of disclosing the schema has no `native` arm)* | **No** — same as every native pole in this project |
| floor (`--posture floor`, `--arm placebo`) | `NONE` (truthfully correct — nothing is loaded) | `^NONE$` | **Yes** |
| curated (`--posture curated --skill impeccable`, `--arm heaven`) | `SIDE-STRIPE: ...` | `^SIDE-STRIPE:` | **Yes** — the "successful task" beat |

**Honesty check on what this does and doesn't prove (important — flagging
this myself rather than letting Stage 2 discover it under time pressure):**
the *content-correct* answer to this question is `NONE` under **both** native
and floor — neither has `impeccable` loaded, so there's genuinely nothing to
cite. That means I am **not** claiming native will get the *content* wrong.
What native visibly struggles with, and what the demo should show as the
native "failure/bloat" beat, is:

- **cost/latency** — the same measured-bloat signal M2 already established
  (native's `perTurn`, ‡, driven by this workstation's real ~67-skill
  `~/.claude/skills` pile plus bundled/plugin skills, vs. floor's near-zero
  standing dose), shown live as the second beat, exactly like M2's Result 1;
- **format compliance under a strict single-line contract** — worth piloting
  empirically at the top of Stage 2 (a real native run, before committing to
  the exact regex): does 40k+ tokens of unrelated skill-listing noise push
  the model to hedge/ramble past the requested one-line format even when the
  underlying content answer is right? If yes, the native run's `--endpoint-regex`
  becomes `^NONE$` too and the demo shows it **failing that strict regex**
  despite being "right" in spirit — a legitimate, honestly-described struggle.
  If the pilot shows native *does* hit the one-line format cleanly, that's
  also a fine, honestly-reported outcome (a negative finding is first-class
  here per B4/C2) — the demo then leans on cost/latency alone as the visible
  native struggle, and the write-up says so plainly rather than forcing a
  content-failure claim the data doesn't support.

I'm flagging this rather than picking a regex I can't verify from Stage 1: it
is a **one-command pilot** (`node "$SH_BIN" --posture native ... --record`)
that Stage 2 should run *first*, before finalizing the script's asserted
regexes — cheap, and it's exactly the kind of thing this project's culture
(check-claims.ts, the ‡ sigil, verified-negative-findings-are-first-class)
insists get checked rather than assumed.

### 2. The script shape

New file: `scripts/hell-heaven-bench/demo-kc9-live.sh`, structurally a direct
descendant of `demo-m2-floor-live.sh` (same `SKILL_HEAVEN_DIR`/`SH_BIN`
resolution, same `MODEL=sonnet EFFORT=low` default with env overrides, same
`$OUT="$REPO_ROOT/scripts/.hh-demo"` gitignored scratch dir, same "the script
PRINTS the ledger-append commands, it does not mutate the ledger itself"
discipline, same `‡`-tagged summary convention):

```
0. compile-print of floor + curated profiles (--print, free, no quota)
   — unchanged from M2, shows the real composed commands before spending any.

1. [1/3] NATIVE — the one prompt above, --record (local-only, --arm heaven,
   --record-out $OUT/rec-native.json). Prints perTurn live, tagged ‡.
   This is beat 1 (native) + beat 2 (measured bloat) in one step — the bloat
   number IS this run's perTurn, shown immediately after the native reply.

2. [2/3] FLOOR — same prompt, --posture floor --arm placebo
   --endpoint-regex '^NONE$', --record --record-out $OUT/rec-floor.json.
   Committed-candidate record (floor placebo of record).

3. [3/3] CURATED — same prompt, --posture curated --skill impeccable
   --arm heaven --endpoint-regex '^SIDE-STRIPE:', --record
   --record-out $OUT/rec-curated.json. This is beat 3 (curated launch) +
   beat 4 (successful task) — capture skill-heaven's own doseSummary stderr
   line same as M2's DOSE_LINE grep.

4. SUMMARY — perTurn native (‡) vs floor (committed) vs curated (committed),
   the floor→curated delta (committed, signed), pass/fail per arm, and the
   printed (not executed) ledger.ts append + validate commands for the
   floor+curated pair — identical shape to M2's summary block.
```

Nothing here needs a new skill-heaven capability; every flag used already
exists in `cli.ts`. Runtime budget: the `--print` step is free; three
headless calls (native's context is the heaviest — M2's precedent put its
`perTurn` around 46.8k tokens, likely tens of seconds; floor and curated are
both small/fast). Comfortably fits inside "about three minutes" including a
human narrating each step live, matching M2's own precedent runtime.

### 3. The recording problem — decision + flagged alternative

**Environment check done (not assumed):** `asciinema` is not installed, but
*is* installable — `brew info asciinema` resolves a bottled 3.2.1 formula,
and `formulae.brew.sh`/`registry.npmjs.org` are both reachable from this
machine. So "no recording tool" was a presence gap, not a feasibility wall.
I'm recommending against it anyway, on task-fit grounds:

**Recommendation: a structured JSONL run-transcript + a small, self-contained
static HTML replay page. No new installs.**

Why: the actual mechanics here are three **headless** `claude --output-format
json` calls (`-p`, blocking, one prompt → one JSON blob), not an interactive
TTY session with something worth watching scroll by in real time. A literal
terminal recording (asciinema `.cast`, or `script(1)` raw bytes) of this
script would mostly show long silent pauses punctuated by a single JSON dump
per step — not more legible than the tool's own formatted stdout, and it adds
a real dependency (asciinema itself, or a raw-ANSI replay/player for `script`
output, which macOS BSD `script` doesn't even timestamp the way GNU
`script -T` does) for less legibility than the alternative.

The alternative fits this project's own existing habits instead of importing
a new one: every artifact this bench already produces is structured JSON/JSONL
(`hh-ledger/v1` records, `r0-census.json`). Concretely:

- The demo script emits one JSONL line per beat (`kc9-demo-transcript/v1`:
  `{beat, posture, arm, command, tokens.perTurn, replyText, objectiveEndpoint,
  committed: bool}`) to `$OUT/kc9-transcript.jsonl` as it runs — a strict
  superset of what's already being captured in the `rec-*.json` files, just
  sequenced for replay.
- A single self-contained HTML file (inline CSS/JS, the transcript JSONL
  embedded as a `<script type="application/json">` block, **no CDN**, no
  build step) renders it as a step-through monospace "terminal" — one
  "Next ▸" per beat, showing the composed command, the reply, the token
  count, and a pass/fail badge. Opens in any browser, no server, works
  offline — a stronger *durable, shareable* property than a `.cast` file,
  which still needs either asciinema.org (external hosting) or a bundled
  player to view.
- This page is genuinely more legible than a raw recording would be *for
  this specific pipeline* (headless request/response, not a live TUI) — it
  can show the three arms side-by-side once all three have run, which a
  linear recording can't do without editing.

**Flagged as a real decision point, not silently resolved:** this repo
already has one precedent for a *richer*, CDN-based static HTML report
(`content/reports/skill-heaven/aci-diagram-preview.html` — Tailwind CDN +
Mermaid CDN, clearly fine to author since it's served on a real site with
internet, not run through a locked-down sandbox). If Stage 2 or Marco wants
nicer visual polish over strict offline/zero-dependency durability, that
precedent is the faster path and is a legitimate alternative to the
stdlib-only version above. And separately: if the actual use case is Marco
*live-narrating and typing this himself* in front of someone (rather than
someone opening a pre-built page async), a literal terminal capture has real
value that a replay page can't substitute for — in which case `asciinema`
(now confirmed installable) is worth the one dependency. I'm not resolving
that tradeoff here since it depends on how KC9 actually gets shown to
people, which I don't have visibility into from Stage 1.

### 4. Tying into KC8's claim-index

`content/reports/hh-benchmark/claim-index.md` only exists on
`origin/docs/kc8-benchmark-ledger` (PR #139, open, not merged) — it is not on
`main` yet. **Sequencing dependency for Stage 2, not resolved here:** either
(a) wait for #139 to land before adding KC9's row, or (b) branch/rebase KC9's
work on top of `docs/kc8-benchmark-ledger` so the file exists to extend, and
flag the resulting PR as depending on #139 merging first. Don't recreate
`claim-index.md` from scratch on `main` — that would fork the exact
single-source-of-truth page KC8 was built to be.

Once available, KC9 adds one row (or a new `D —` section, matching the
existing `A/B/C` lettering) using the page's own status vocabulary:

- floor `NONE`-pass + curated `SIDE-STRIPE:`-pass pair → **RECORD** (ledger
  lines, committed, gate-bound — `check-claims.ts` will bind their `perTurn`
  numbers automatically once the write-up doc sits in
  `content/reports/hh-benchmark/`, same derived-scan mechanism KC8 built).
- native `perTurn` and any native format-regex result → **‡ UNCOMMITTED**,
  same as B3's "the reference use of the sigil."
- the replay HTML page → cited by path, same treatment as C1/C4's run-record
  citations (committed and reproducible, but not itself gate-bound — it's not
  a markdown doc with token numbers in prose, it's the artifact the numbers
  point at).

The write-up doc itself (`content/reports/hh-benchmark/kc9-three-minute-demo.md`)
lands in the same auto-scanned directory KC8's gate already covers, so it's
gated from the moment it's added — no extra wiring needed on `check-claims.ts`.

### 5. Explicitly out of scope for Stage 2 per the orchestrator's brief

No re-derivation of F7 (+515 tok, locked). No cursor arm (deferred, no
availability — this demo is `claude`/`claude-heaven` only). No edits inside
the `skill-heaven` checkout (read-only dependency; if the pilot in §1 reveals
a genuine launcher gap, that's a separately-scoped issue in that repo, not an
inline patch here). No merge — PR only, same human gate as KC8.

### 6. What Stage 2 should do, in order

1. Pilot the native-arm prompt for real (one `--record` call, no script yet)
   to settle the native `--endpoint-regex` question in §1 before writing it
   into the script.
2. Write `scripts/hell-heaven-bench/demo-kc9-live.sh` per §2, run it for
   real, commit the gitignored-scratch confirmation (nothing to commit there
   — it's gitignored by design) and the script itself. Push.
3. Emit the `kc9-demo-transcript/v1` JSONL + the static replay HTML per §3
   (or the asciinema alternative, if Marco weighs in preferring that). Push.
4. `npx tsx scripts/hell-heaven-bench/ledger.ts append` the floor + curated
   records, `ledger.ts validate`. Push.
5. Write `content/reports/hh-benchmark/kc9-three-minute-demo.md`, resolve the
   KC8-branch sequencing from §4, extend `claim-index.md`. Run
   `check-claims.ts` before pushing — must exit 0.
6. Open the PR (human-gated, same as KC8). Do not merge.

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
- 2026-07-31 — Stage 1 (planner), model **Fable, high effort** — no fallback
  to Opus needed, Fable completed the plan directly. Read
  `demo-m2-floor-live.sh`, `ledger.ts`, `check-claims.ts`, the bench
  `README.md`, `m2-live-demo.md`, `origin/docs/kc8-benchmark-ledger`'s
  `claim-index.md` (KC8 PR #139, still unmerged), the local `skill-heaven`
  checkout's `packages/core/src/cli.ts` (full flag surface), and this repo's
  `.agents/skills/impeccable/SKILL.md`. Confirmed no `.claude/skills/` dir
  here (only `.agents/skills/`), so native `claude` genuinely doesn't
  auto-load `impeccable` — the contrast stays flag-driven, matching M2.
  Confirmed `asciinema` is installable (bottled formula, network reachable)
  but recommended against it anyway — wrote the reasoning into the plan.
  Wrote the full plan under `## Plan`: task = one prompt (CSS side-stripe
  lookup against `.agents/skills/impeccable`'s first absolute-ban) asked
  native/floor/curated, `objectiveEndpoint` regex `^NONE$` (floor, committed)
  / `^SIDE-STRIPE:` (curated, committed) / native's regex left as an open,
  pilot-first question (flagged explicitly, not guessed) since the
  content-correct native answer is also `NONE` — native's demoable
  "struggle" beat is cost/latency (M2's proven signal) plus a
  to-be-piloted format-compliance check, not a fabricated content failure.
  Script shape: `demo-kc9-live.sh`, direct descendant of
  `demo-m2-floor-live.sh`, one prompt run three ways instead of M2's two
  separate probes. Recording decision: structured JSONL transcript + a
  self-contained (no-CDN) static HTML replay page, over asciinema — reasoned
  from the pipeline being headless request/response, not an interactive TTY
  worth recording live; flagged the CDN-based `aci-diagram-preview.html`
  precedent and the "Marco live-narrates it himself" case as real
  alternatives Stage 1 isn't positioned to close off. KC8 tie-in: flagged the
  sequencing dependency (`claim-index.md` only exists on the unmerged KC8
  branch) rather than forking a second copy on `main`. No code, no ledger
  writes, no real `claude` session run this stage — investigation +
  plan only, per the brief. **Next: Stage 2 (Opus, extra-high/max effort)**
  starts at Plan §6 step 1 — pilot the native-arm prompt for real before
  writing `demo-kc9-live.sh`.
