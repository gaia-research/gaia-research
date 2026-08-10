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
  `claude-zero` CLI (package at `packages/claude-zero/`) does genuine
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
  scoped to `claude`/`claude-zero` only; do not fabricate or imply a cursor
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
availability — this demo is `claude`/`claude-zero` only). No edits inside
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
- 2026-07-30/31 — Stage 2 (executor), model **Opus 5, extra-high effort**.
  **KC9 is BUILT, RUN FOR REAL, AND OPENED AS A PR: <https://github.com/gaia-research/gaia-research/pull/142>
  (open, human-gated, NOT merged).** Six commits, each pushed individually to
  `origin/feat/kc9-three-minute-demo`; final SHA `4e13aeb`. All identity checks
  passed (`Marcus Rafael B. Tiongson <153011150+mbtiongson1@users.noreply.github.com>`).

  **Plan deviation, deliberate and load-bearing — read this before reusing the plan.**
  Stage 1's prompt forbade all tool use. That is unsatisfiable for the curated
  arm: curated only puts the skill's *listing line* in context (M2's +963 proves
  it), so the body must be pulled with the Skill tool to answer the question at
  all. The pilot (native, no-tools) confirmed it: native replied `NONE` in one
  turn at 46,498 tok ‡. Prompt was reworked to permit skill consultation, and —
  more importantly — the per-arm endpoint table was collapsed into **ONE endpoint
  for all three arms** (`^FLAGGED:.*[Ss]ide-[Ss]tripe`). The answer term is not in
  the prompt. Rationale: with a per-arm endpoint, "curated succeeds" is a
  definition; with one shared endpoint it is a result. Stage 1's `^NONE$`-for-floor
  idea would have scored the floor as *passing* for correctly reporting it had
  nothing, which reads as success in a table and is not.

  **Real measured run (claude 2.1.220, sonnet/low, 2026-07-30):** native
  46,490 ‡ / `NONE` / endpoint FAIL; floor 30,601 (committed placebo) / verbose
  refusal / FAIL; curated 55,924 (committed heaven, standing 227) /
  `FLAGGED: Side-stripe borders` / **PASS**. Measured bloat native−floor =
  **15,889 ‡**. Harness time 13,940 ms total — the "three minutes" is narration,
  the compute is ~14 s.

  **The first live run inverted and is reported, not discarded.** Tools left open
  → floor 64,658 ‡ vs native 46,463 ‡, i.e. the floor costing MORE than vanilla.
  Cause: `perTurn` sums usage across the whole headless run, so an arm burning
  extra turns hunting for absent skills accumulates cache-read every turn and the
  delta silently prices *turn count*. Fix: `-- --allowedTools Skill` applied
  IDENTICALLY to all three arms. Same trap the M3 paired run already hit from the
  other direction (2026-07-18, with-skill arm costing more than placebo, already
  using `--allowedTools "Skill,Read"`) — cited in the report so it reads as a
  known trap re-encountered.

  **Recording decision: Stage 1's recommendation was followed** — structured
  `kc9-demo-transcript/v1` JSONL + a self-contained no-CDN HTML replay page, over
  asciinema. Rendered from the real run, verified headless (Playwright, zero page
  errors, all three beats + side-by-side table + step controls live).

  **Rendered version: ACHIEVED, not just markdown.** `/research/hh-benchmark/demo`
  built from the existing method page's exact pattern; replay page served at
  `/reports/hh-benchmark/kc9-demo-replay.html`. `npm ci` + `tsc --noEmit` + `next
  build` all clean, both routes prerendered, all three URLs 200 on a served build.

  **Verification (all green):** `ledger.ts validate` → OK, 12 records (10→12);
  `check-claims.ts` → 3/3 docs OK **including the new report**, plus a negative
  test (strip one ‡ → fails at the exact line, so it is genuinely bound);
  `check-claims.test.ts` 17/17; lexicon clean (55 terms, 29 files) + 51/51 lexicon
  assertions; `check-fs-usage.mjs` clean.

  **KC8 sequencing handled per Plan §4:** `claim-index.md` was NOT forked. The
  report carries the five rows KC9 owes it (D1–D5) and cites the ledger by
  `benchmarkId`/`task` rather than line number, so the citation survives both
  branches landing. `check-claims.ts`'s `DEFAULT_DOCS` gained the new report with
  a comment saying to drop the redundant entries once #139's derived listing
  lands — do NOT keep both.

  **Disciplines held:** F7 untouched and never re-derived (the demo never launches
  the product floor); no cursor arm and no cursor figure anywhere; the
  `skill-heaven` checkout was not modified (every flag used already existed in its
  CLI); nothing merged.

  **What is left (all human, none blocking):**
  1. Marco reviews PR #142 — it is frontend-gated (new `/research/hh-benchmark/demo`
     page + a link added to `/research/hh-benchmark`). Do not merge on green CI.
  2. After **#139** merges: delete the two now-redundant
     `content/reports/hh-benchmark/*.md` entries from `DEFAULT_DOCS` in favour of
     its derived listing, and add rows **D1–D5** (already written, verbatim, in the
     report's "Rows owed to the KC8 claim index" section) to `claim-index.md`.
  3. Optional follow-up, deliberately NOT done here: N repeats + confidence
     intervals. This is one repeat of one task on one workstation (B3/B5) and the
     report says so.
- 2026-07-31 — Stage 2 addendum (same Opus 5 session): **KC8 landed on `main`
  mid-build.** `origin/main` moved `f904049 → eb28d12` (PRs #139 → #140 → #141)
  while the demo was being run. Branch merged with the new `main`
  (`dba73ff`), three conflicts resolved deliberately, none auto-taken:
  * **`check-claims.ts`** — took KC8's DERIVED directory listing and **deleted**
    KC9's hand-listed `DEFAULT_DOCS` entry entirely (it only ever existed because
    the list was hand-maintained; keeping both is the duplication its own comment
    warned against). The report is now gated by *where it sits*.
  * **`ledger.jsonl`** — both branches appended 2 records to a 10-record file.
    Resolved append-only in timestamp order: KC8's F7 backfill stays at **11–12**
    (its deep-links did NOT move), KC9's land at **13–14**. 14 valid records.
  * **`app/research/hh-benchmark/page.tsx`** — kept BOTH links (KC8's "Claim
    index", then "The three-minute demo"), not one.
  Then `claim-index.md` gained **section D** (six rows, D1–D6) rather than the
  report describing rows it was "owed" — the plan's §4 sequencing question
  resolved itself. D6 explicitly states F7 and cursor are unchanged by KC9, so
  their absence reads as a decision.

  **Final state: PR #142 open, CI green on the merged head** — Vocabulary gate
  PASS, Ledger validate + claims-provenance gate PASS, Build & Edge Compatibility
  Check PASS. (Cloudflare "Workers Builds" was still pending at hand-off; it is
  the deploy preview, not a gate this branch controls.) Final SHA `3c3c5d5`.
  Working tree clean. Nothing merged.

  **Truly remaining — one item, human only:** Marco reviews and merges PR #142.
  It is frontend-gated (new `/research/hh-benchmark/demo` page + a link added to
  `/research/hh-benchmark`). Do not merge on green CI. Everything else the plan
  listed is done, including the rendered route, which the brief had marked
  optional.

- 2026-07-31 — Stage 3 (Opus 5 session): **the demo is now a real video**, on
  Marco's call that KC9's deliverable is a three-minute MP4 on the site, not a
  page you click through. No generative video (Runway/Higgsfield would be a
  literal simulation, against everything this report says about itself) and no
  asciinema (rejected in Stage 1 for reasons that still hold — three headless
  JSON calls have no interactive TTY). Instead the **replay page grew a second
  mode**, and the video is a screen recording of it:
  * `render-kc9-replay.mjs` — `?autoplay=1` ("cinema"): a fixed 1080p stage that
    plays the same beats over a 180-second timeline with an on-screen caption
    track. 21 cues, three acts (setup → replay → verdict), one rAF clock off
    `performance.now()` rather than a `setTimeout` chain, so timer coalescing
    under the recorder cannot desync captions from beats. **Caption strings are
    written in Node and interpolate the beats**, so a caption that states a
    number states the transcript's number by construction. Manual mode is
    unchanged and gains a "Play the 3-minute walkthrough" button.
  * `record-kc9-video.mjs` (new) — Playwright records that page at 1920×1080,
    ffmpeg encodes H.264/yuv420p + faststart and cuts a poster at 137 s (the
    frame where the curated arm passes). Playwright stays a non-dependency,
    resolved from the npx cache exactly as `visual-audit.mjs` does. Fails loud
    over Cloudflare's 25 MiB per-asset limit. Result: **181.9 s, 4.84 MiB.**
  * Video embedded on **`/research/hh-benchmark`**, not the `/demo` sub-page —
    Marco's call that `/demo` sits too deep for the thing that sells the method.
    New `.report-video` block in `globals.css`. No audio track: the narration is
    on-screen text, and the same run stays readable as the replay page and the
    report.
  * `claim-index.md` gains **D7** — the video as **cited by path**, stating that
    it introduces no figure of its own; every number it shows is one D1/D3
    already place. Ledger untouched (14 records), F7 untouched, no cursor arm.
  Verified: 7/7 claims gate · lexicon clean · 25/25 + 51/51 gate self-tests ·
  264/264 vitest · typecheck · `build:next` (all 3 hh-benchmark routes
  prerender) · no illegal fs usage · visual audit clean at 390/1280 (the 768 px
  `nav-links` overflow is pre-existing site-wide — an untouched page shows it
  identically) · MP4 frames spot-checked against the transcript.
  **Still human-gated: do not merge on green CI.**

- 2026-07-31 — Stage 4 (same Opus 5 session): **the video is narrated.** Marco's
  call after reviewing Stage 3: the walkthrough needed a voice, in Milim's
  register per `marketing-tasks/MILIM.md`, not just burned-in captions.
  * **`kc9-script.mjs` (new)** — the words and the camera plan, shared by the
    renderer and the narrator so the spoken line and the on-screen caption are
    one authored string. Performance tags (`[excited]`/`[curious]`/
    `[mischievously]`) mean the two are no longer byte-identical, so the caption
    is now **derived** from the spoken line by stripping tags: one regex, one
    direction, no second copy to drift. Manifest records both, so the stripping
    is auditable. Every figure still interpolates from the transcript.
  * **`narrate-kc9.mjs` (new)** — ElevenLabs per line, then assembles
    `line + silence(gap) + line + silence(gap)`. **The audio IS the timeline:**
    cue `at` is the running sum, so captions cannot drift from the voice however
    long a take runs. Committed: the assembled `kc9-narration.m4a` + manifest.
    NOT committed: per-line MP3s. So the video rebuilds from committed inputs
    **with no API key**, while the manifest records exact text, duration, sha256.
  * **Camerawork** — the "camera" is attention, not cropping: the block being
    narrated stays lit (opacity 1) while every other focusable block recedes to
    0.26. Verified by measuring computed opacity per cue, not by eye. Plus act
    cross-fades, a push-in on the verdict table, and a pop on the focused block.
  * **Voice, decided by ear over two rounds.** `eleven_multilingual_v2` reads
    flat and too mature — rejected. Landed on **`eleven_v3`**, voice
    **`0mEHhncrwNcxHPYG8b63` ("Little Dragon Girl V2")** at **stability 0.5
    (Natural)**; `d8x5JlMZFAGFxrfm0WkG` was the prototype and is superseded.
    Only three tags are used — an unverified tag risks being read aloud as a
    literal word.
  * **`/milim-voice-production` skill (new)**, `.agents/skills/`, registered in
    CLAUDE.md. Leads with secure key handling because Marco rotates keys often:
    **open `.env.local`, never print the key** — no `cat`, no `echo`, no argv;
    verify with a status code and a last-4 fingerprint. A key that reaches chat,
    a commit, or command output is burned.
  Result: **190.7 s · 1920×1080 · H.264 + AAC mono · 9.66 MiB**, poster
  auto-derived at the `curated-pass` beat. Verified: video 190.70 s / audio
  190.73 s; captions sampled at four cue midpoints land on the right line and
  are bracket-free; claims 7/7 · lexicon clean · 25/25 + 51/51 · 264/264 vitest
  · typecheck · `build:next` (3 routes prerender) · no illegal fs usage ·
  visual audit clean at 390/1280.
  **Still human-gated: do not merge on green CI.**
