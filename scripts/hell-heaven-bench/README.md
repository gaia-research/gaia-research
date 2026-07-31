# hell-heaven-bench — benchmark-of-record (TypeScript)

The Hell Heaven Benchmark's code-of-record, per the master RFC
(`marketing-tasks/deliverables/proposal/skill-heaven-hell-mvp-rfc.md`, Appendix A). The
Python scaffold in `marketing-tasks/scripts/hell-heaven-bench/` is the superseded H1
registry-proxy prototype — leave it alone.

| File | Milestone | What |
|---|---|---|
| `census.ts` | **M1 / R0** | Two-part-dose census: standing (listing line) vs invocation (full `SKILL.md`) — never one number. Artifact: `content/reports/hh-benchmark/r0-census.md` + `data/r0-census.json`. |
| `ledger.ts` | **M3 / R2 plumbing** | JSONL run ledger (methodology §6 + two-dose token categories). Always on: every run, manual or fleet, appends here. |
| `check-claims.ts` | **provenance gate** | Binds prose to committed evidence: every token number / sha in the gated docs must trace to a committed `ledger.jsonl` / `r0-census.json` record, or carry the `‡` sigil (= declared uncommitted context). Run before any docs PR. |
| `demo-kc9-live.sh` | **KC9** | The three-minute demo: one task asked three ways (native / floor / curated) with a byte-identical prompt and a single shared objective endpoint. Emits `kc9-demo-transcript/v1` beats beside the `hh-ledger/v1` records; prints the append commands, never mutates the ledger. |
| `render-kc9-replay.mjs` | **KC9** | Transcript -> one self-contained offline HTML replay page (no CDN, no build step). Output: `public/reports/hh-benchmark/kc9-demo-replay.html`. The page has two modes: the manual stepper, and `?autoplay=1` ("cinema") — a fixed 1080p stage that plays the run on a 180-second caption timeline. |
| `record-kc9-video.mjs` | **KC9** | Records the replay page's cinema mode with Playwright and encodes it with ffmpeg. Outputs: `public/reports/hh-benchmark/kc9-demo.mp4` + `kc9-demo-poster.jpg`, embedded on `/research/hh-benchmark`. |
| `data/ledger.jsonl` | — | The ledger. Checked in; append-only. Includes the `hh-m2-smoke` launcher smoke records (B4 — flagged for easy owner veto). |

### Claims-provenance gate (why it exists)

Two review passes on the M2 deliverables failed the **same class** — *provenance
overclaim* (prose asserting committed/measured status the artifacts don't back: a
false census-sha "match", an "unmeasured enumeration", "every quantitative claim
is committed" when the native pole / delta / invocation live only in gitignored
`.hh-demo/`). The honesty discipline (M0 / B1–B5) was enforced **only by human
review**, so the review *was* the missing linter. `check-claims.ts` is that
linter, so a machine catches it first:

```bash
# gate the ledger-backed docs (see the scan set below):
npx tsx scripts/hell-heaven-bench/check-claims.ts
# self-tests (fixtures in __fixtures__/check-claims/):
npx tsx scripts/hell-heaven-bench/check-claims.test.ts
```

A doc opts its ledger-backed region in with `<!-- ledger-claims:begin -->` …
`<!-- ledger-claims:end -->` fences (a fence-free doc is scanned whole); numbers
that are genuinely uncommitted must be tagged `‡`. The demo runner
(`demo-m2-floor-live.sh`) tags its own native/delta output with `‡` so writeups
inherit the marker. Exits non-zero on any untraceable claim — wire it into CI /
pre-PR alongside `ledger.ts validate`. Two red-team passes hardened it; the
`__fixtures__/check-claims/` suite pins each class it catches, and the test file
additionally asserts the scan set below actually covers every report.

**Scan set** (`defaultDocs()` in `check-claims.ts`) — **derived, not hand-listed**:

| Doc | How it gets in |
|---|---|
| `content/reports/hh-benchmark/*.md` | **every** `.md` in that directory, read at run time |
| `docs/labs/harness-capability-matrix.md` | named explicitly |
| `content/blog/claude-5-system-prompt-shrink/post.md` | named explicitly — it ships the published standing-dose claim on the live site |

Deriving the report list is deliberate. The list used to be hard-coded and held
**one** of the three reports while this README, the source header and the CI step
all said "the hh-benchmark reports" — a provenance gate whose own scope statement
overclaimed its coverage, which is the defect class it exists to catch. Now a new
report is gated the moment it lands in the directory; adding one requires no gate
change, and none can be forgotten.

**Declared scope limits** (the gate's honest edges, enumerated in the source
header — not silent gaps): only fenced regions are gated (put every ledger-backed
claim *inside* the fence); markdown pipe tables only (no HTML `<table>`);
magnitude-existence, not record-binding (a real committed number reused in an
unrelated sentence passes); per-line sha match; ASCII digits only; **integers
only** — a k-suffixed or decimal magnitude (`≈17.0k tok`, `~6k tok`) is skipped,
not checked, and the capability matrix carries 18 of them (measured 2026-07-30).
Closing that one means teaching the parser the `k` suffix and then `‡`-tagging or
backing all 18; it is an owner scope call, not a quiet edit.

**M2 (launcher):** the launcher-shaped profile compiler lives in
**[`gaia-research/skill-heaven`](https://github.com/gaia-research/skill-heaven)**
per RATIFICATION D6/N9 (the `hh-launcher` working name is retired; item 8 closed
2026-07-20). Its core `skill-heaven` bin is the research driver; the per-harness
doors (`claude-heaven`, `pi-heaven`, …) are the user-facing product. It vendors
this directory's pure helpers (chars4 tokenizer,
listing-line format, `sha256(SKILL.md)` refs, `hh-ledger/v1` type) with a parity
fixture generated by `census.ts`, and every record it emits must pass
`ledger.ts validate` here before being appended. See
`docs/plans/archived/2026-07-24-m2-heaven-launcher-plan.md` and the M2 re-check table in
`docs/labs/harness-capability-matrix.md`.

## Census

```bash
# Canon (gaia-skill-tree checkout as sibling — read-only; regenerates the R0 artifact):
npx tsx scripts/hell-heaven-bench/census.ts --canon ../gaia-skill-tree \
  --json content/reports/hh-benchmark/data/r0-census.json

# Any repo's local skill dirs (.claude/skills, .agents/skills, .pi/skills, .codex/skills).
# This is what Heaven's below-vanilla delta is computed from:
npx tsx scripts/hell-heaven-bench/census.ts --repo /path/to/repo
```

Tokenizer: `chars4` (`max(1, floor(chars/4))`) — H1-prototype parity, recorded in every
artifact, pluggable when a counted backend lands.

## Ledger

```bash
# Append (record JSON on stdin or via --record):
npx tsx scripts/hell-heaven-bench/ledger.ts append --record '<json>'
# Validate the whole file:
npx tsx scripts/hell-heaven-bench/ledger.ts validate
```

Record shape (`hh-ledger/v1`): benchmarkId, task, arm (`placebo|heaven|hell|ultra`),
skillsLoaded (id + `sha256(SKILL.md)`), model, harness {name, version}, repeatIndex,
tokens {system, skillStanding, skillInvocation, perTurn} (number or `null` = unmeasured —
never 0 for "didn't measure"), wallClockMs, objectiveEndpoint, judgeVerdict (Tier 3 only).

**There is no seed field, deliberately.** No target harness offers seed control; the design
is N repeats + confidence intervals. The validator rejects any record carrying `seed`.
The placebo arm is always our own same-harness no-skill run (`skillsLoaded: []`) —
published benchmark scores are calibration only.

## First real paired run (M3 exit criterion)

`hh-manual-001 / house-format-summary`, Claude Code 2.1.211 headless (`-p`), haiku, run
2026-07-18: same one-line-summary task with and without a single convention skill
(`gaia-house-format`), objective endpoint `^GAIA:` regex.

- **placebo × 2:** endpoint **fail** both repeats (model asks what the house format is).
- **heaven (1 skill) × 1:** skill invoked, endpoint **pass**, byte-exact format.
- Honest wrinkles, recorded in the ledger notes: the with-skill run cost *more* total
  tokens than placebo (multi-turn + invocation dose) — the skill bought task success, not
  token savings; net-save is an R2 question. A second with-skill repeat hit the harness
  session usage limit and was discarded as invalid, not appended.

Repro recipe: project dir with exactly one skill under `.claude/skills/` vs an empty dir;
`echo "$TASK" | claude -p --model haiku --output-format stream-json --verbose
--allowedTools "Skill,Read"`; doses computed with `census.ts` helpers
(`makeListingLine`/`tokenize`), skill invocation confirmed by `"name":"Skill"` tool-use
events in the stream.

## KC9 — the three-minute demo

```bash
SKILL_HEAVEN_DIR=/path/to/skill-heaven bash scripts/hell-heaven-bench/demo-kc9-live.sh
node scripts/hell-heaven-bench/render-kc9-replay.mjs \
     scripts/.hh-demo/kc9-transcript.jsonl \
     public/reports/hh-benchmark/kc9-demo-replay.html
# then, to re-cut the video the site serves (~3 min: it plays the real timeline):
node scripts/hell-heaven-bench/record-kc9-video.mjs
```

The video is a **screen capture of that replay page**, not a second artifact with
its own numbers: `record-kc9-video.mjs` opens the page with `?autoplay=1`, records
it at 1920x1080 with Playwright, and encodes H.264 with ffmpeg. Because the
renderer interpolates every caption figure out of the transcript, the video
cannot state a number the committed records do not — and it is still not a
terminal recording, for the reasons under *The artifacts* in the writeup.
Playwright is deliberately **not** a project dependency (it would fatten the
Cloudflare bundle); the script resolves it from `PW_PATH`, a plain import, or the
npx cache, exactly as `scripts/visual-audit.mjs` does. ffmpeg must be on `PATH`.
The script fails loud if the MP4 exceeds Cloudflare's 25 MiB per-asset limit.

One task, three loadouts, **one** objective endpoint — the loadout is the only
variable, so "curated succeeds" is a result rather than a definition. Writeup:
[`content/reports/hh-benchmark/kc9-three-minute-demo.md`](../../content/reports/hh-benchmark/kc9-three-minute-demo.md),
rendered at `/research/hh-benchmark/demo`.

**Two things to know before reading its numbers.**

1. **`perTurn` is a whole-run total, not a standing dose.** It sums usage across
   every turn, so an arm that takes more turns accumulates cache-read on each
   one. The first KC9 run left tools open, the floor went hunting for skills it
   did not have, and the floor came back *more expensive than native* — the
   native−floor difference had silently started pricing turn count. Every arm is
   now gated identically to `--allowedTools Skill`. This is the same shape as the
   M3 paired-run wrinkle recorded below (the with-skill run costing more total
   tokens than placebo): whenever you difference two `perTurn` values, check the
   two runs took a comparable number of turns first.
2. **The demo does not touch F7 or cursor.** F7 (+515 tok, the product floor's
   door cost) is locked by founder ruling and is never re-derived here; cursor is
   deferred for lack of availability, so there is no cursor arm and no cursor
   figure anywhere in the KC9 artifacts.
