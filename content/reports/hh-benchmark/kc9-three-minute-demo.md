# KC9 — the three-minute demo: native → measured bloat → curated launch → successful task

> **Live demo evidence, 2026-07-30.** Workstation run on Claude Code
> **2.1.220**, model **`sonnet` at `--effort low`**. Per **B5** this is *smoke
> evidence*, not a benchmark arm (benchmark arms run on clean sandboxed
> installs). It exists to satisfy **KC9** — *"a complete three-minute demo runs
> native → measured bloat → curated launch → successful task"* — with a run
> that is actually measured rather than described.
>
> **The load-bearing figures are committed `hh-ledger/v1` records:** the floor
> **placebo** (30,601) and curated **heaven** (55,924, `skillStanding` 227)
> pair this run appended to
> [`data/ledger.jsonl`](https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl)
> under benchmark id `hh-kc9-demo`, task `side-stripe-review`. The **native**
> pole and every figure derived from it are **not committed** — they are marked
> **‡ = uncommitted workstation context** at each use below, exactly as in
> [`m2-live-demo.md`](https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/m2-live-demo.md).
>
> **Reproduce:**
> [`scripts/hell-heaven-bench/demo-kc9-live.sh`](https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/demo-kc9-live.sh).
> **Replay:** [`/reports/hh-benchmark/kc9-demo-replay.html`](/reports/hh-benchmark/kc9-demo-replay.html) — one
> self-contained offline HTML file, rendered from
> [`kc9-demo-transcript.jsonl`](https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/data/kc9-demo-transcript.jsonl) by
> [`render-kc9-replay.mjs`](https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/render-kc9-replay.mjs).

## The design: one task, three loadouts, one endpoint

The prompt is **byte-identical** on all three arms and the objective endpoint is
the **same regex** on all three. The loadout is the only variable. That matters:
if the endpoint moved per arm, "curated succeeds" would be a definition rather
than a result.

The task, sent verbatim to each arm:

```
A teammate proposes this CSS for a card component:
`.card { border-left: 4px solid var(--accent); }`. Does any skill currently
available to you explicitly name this as an anti-pattern you must refuse and
rewrite? The Skill tool is your only tool; consult a skill if you have one worth
consulting. Reply with EXACTLY one line and nothing else:
`FLAGGED: <the exact term that skill uses for this anti-pattern>` if an
available skill names it, or `NONE` if no available skill names it.
```

The endpoint, applied to the final reply of each arm:

```
/^FLAGGED:.*[Ss]ide-[Ss]tripe/
```

**Why that term is the right endpoint.** "Side-stripe borders" is a **coinage**
of exactly one contract — this repo's
[`.agents/skills/impeccable`](https://github.com/gaia-research/gaia-research/blob/main/.agents/skills/impeccable/SKILL.md),
the first entry under its *Absolute bans*. It is not a phrase a model produces
by chance for a `border-left` accent (the ordinary vocabulary is "accent
border", "left border", "colored bar"), and it is **deliberately absent from the
prompt**. An arm that answers it has read the contract the term came from. This
is the same design principle M2 used (`/impeccable/`, `^YES`/`^NO`): pick a
signal the model cannot fake by chance.

**Why the contrast is real and not staged.** `impeccable` is **not installed**
under this workstation's `~/.claude/skills` — that directory holds 67 other
skills, none of them this one. `impeccable` exists here only inside the repo's
`.agents/skills/`, which a vanilla `claude` does not load. So the native arm
genuinely pays for a large standing loadout that does not contain the one
contract the task needs, and the curated arm is the only one that admits it.

**One tool, on every arm.** Every arm runs with `-- --allowedTools Skill`
appended identically. This is not a per-arm handicap — it is part of the shared
environment, and the reason for it is a measured failure, [reported in full
below](#what-the-first-run-got-wrong-and-why-it-is-in-this-report).

## The run

### Beat 1 — native: the largest loadout, and it cannot do the task

```
$ claude --model sonnet --effort low -p '<the one prompt>' --allowedTools Skill
  reply: NONE
  endpoint /^FLAGGED:.*[Ss]ide-[Ss]tripe/  →  FAIL
```

Vanilla `claude`, no flags, the workstation's own setup untouched. It answers
`NONE` — format-compliant, and *content-correct for what it was given*: nothing
in its loadout names this pattern. It spent **46,490 ‡** per-turn tokens
reaching that conclusion.

### Beat 2 — the measured bloat

```
$ CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude --disable-slash-commands \
    --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
    --setting-sources project --model sonnet --effort low \
    -p '<the one prompt>' --allowedTools Skill
  reply: I don't have a skill loaded that addresses CSS anti-patterns,
         and I have no available skill worth consulting for this.
  endpoint /^FLAGGED:.*[Ss]ide-[Ss]tripe/  →  FAIL
```

The doorless benchmark floor — the **own-placebo** anchor (**B2**), our own
same-harness no-skill run. It costs **30,601** per-turn tokens (committed), and
the difference from the native pole is the demo's second beat:

> **native − floor = 15,889 ‡ per-turn tokens** of standing context on this
> workstation — and on this task it solved nothing. Both arms failed the
> endpoint; one of them paid 15,889 ‡ extra to fail.

That is what "bloat" means here operationally: not that the context is large,
but that the *large part of it was not the part the task needed*.

Two honest observations from this arm rather than one:

1. Its `false` is a **verified negative** and is recorded with the same rigor as
   a positive (**B4**). With zero skills loaded there is no term to name, and
   the model says so instead of inventing one — the failure mode you want.
2. It is also the only arm that **broke the one-line output contract**, answering
   in a sentence rather than the requested bare `NONE`. Native, with a large
   loadout, complied with the format; the floor, with none, did not. That is a
   single observation from a single run, not a finding — noted because it is the
   kind of thing that becomes a real question at N repeats, not because one run
   settles it.

### Beat 3 — curated launch, and the task is solved

```
$ CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude --setting-sources '' \
    --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
    --plugin-dir $SESSION/heaven-set --model sonnet --effort low \
    -p '<the one prompt>' --allowedTools Skill
  skillsLoaded: [impeccable]
  reply: FLAGGED: Side-stripe borders
  endpoint /^FLAGGED:.*[Ss]ide-[Ss]tripe/  →  PASS
```

`skill-zero --posture curated --skill .agents/skills/impeccable` composes the
T9 route and copies exactly one contract into a session-scoped plugin dir. The
model consults it and returns the coined term. **This is the "successful task"
beat, and it is the only arm that passes the endpoint.**

The tool prices that one contract independently of the harness:
`standing=227` (committed on the curated record) and a `chars4` invocation of
`5,917 ‡` for the body.

## Results

| Arm (record) | Loadout | `perTurn` tokens | Reply | Endpoint | In ledger |
|---|---|---:|---|:---:|---|
| **native** (vanilla) | workstation default; the tool does not enumerate it | **46,490 ‡** | `NONE` | fail | no — gitignored |
| **floor** (`--posture floor`) | none | **30,601** | a sentence, not the contract format | fail | **yes** (placebo) |
| **curated** (`--skill impeccable`) | `impeccable` only | **55,924** | `FLAGGED: Side-stripe borders` | **pass** | **yes** (heaven) |

Wall-clock, from the same records: 3,845 ms / 3,998 ms / 6,097 ms — 13,940 ms of
harness time for the whole run. **The "three minutes" is the narrated
walkthrough, not the compute**: the machine part takes about fourteen seconds,
which is what leaves room to explain each beat while it runs.

The **floor → curated** difference is **+25,323** — a signed delta between two
committed records. It is stated here **only** as a per-turn cost difference
between two whole runs, and specifically **not** as a standing dose: the curated
arm actually read the contract body during its run, so its `perTurn` carries
invocation cost that the floor's does not. Standing and invocation are priced
separately, always (**B1**); the curated standing figure is the 227 above, and
`skillInvocation` on the record stays honestly `null` because live invocation
instrumentation is still a follow-up.

## What the first run got wrong, and why it is in this report

The first live execution of this demo, the same evening, produced an
**inverted** result: floor **64,658 ‡** per-turn tokens against native
**46,463 ‡** — the floor costing *more* than vanilla, which would have made the
whole "measured bloat" beat a negative number.

The cause is real and worth writing down, because it changes how `perTurn` may
be read. `perTurn` sums usage across the **whole headless run**, so an arm that
takes extra turns accumulates cache-read on every one of them. With tools left
open, the floor arm — given a question about skills and no skills — went looking
through the filesystem for them, burning turns; the native arm, which had a
plausible answer available immediately, did not. The delta then prices **turn
count**, not standing dose, and it can invert.

The fix was to gate every arm identically to the single tool the task
legitimately needs (`--allowedTools Skill`, which curated still requires to read
its one contract) — the same gate the project's **M3 first paired run** already
used (`--allowedTools "Skill,Read"`, 2026-07-18). That run recorded the matching
wrinkle from the other direction: its with-skill arm cost *more* total tokens
than its placebo, because of multi-turn plus invocation dose. So this is not a
new caveat, it is the same one arriving again — whenever two `perTurn` values are
differenced, check first that the two runs took a comparable number of turns.

Both figures above are ‡ and are reported rather than discarded: a demo that quietly re-runs until the number comes out the right way
is not a measurement, and the failure mode — *a difference of totals silently
pricing turn count* — applies to anyone else reading `perTurn` deltas in this
ledger.

## Cross-check against M2

The floor route was last measured live for
[M2](https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/m2-live-demo.md) on Claude Code 2.1.216; this run is on 2.1.220. The two
floor records — same repo, same posture, different CLI versions eight patches
apart — are **30,661** (M2) and **30,601** (KC9): the doorless floor did not
move materially across the version bump. That is a useful independent signal
about the undocumented `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` route, which the
project re-verifies on every CLI upgrade precisely because it is undocumented.

The curated record pins the fixture at `sha256:14c4642…`, the same bytes M2's
curated record pinned — so the contrast above is not an artifact of the skill
file having been edited between the two demos.

**Not touched by this run:** **F7** (+515 tok, the product floor's door cost) is
locked by founder ruling and is neither re-derived nor implied here — this demo
never launches the product floor. **cursor** is deferred for lack of
availability, so there is no cursor arm and no cursor figure, here or anywhere
in this report.

## The artifacts

| Artifact | Path | What it is |
|---|---|---|
| Demo runner | [`scripts/hell-heaven-bench/demo-kc9-live.sh`](https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/demo-kc9-live.sh) | Runs the three arms; prints the ledger-append commands, never mutates the ledger |
| Transcript | [`content/reports/hh-benchmark/data/kc9-demo-transcript.jsonl`](https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/data/kc9-demo-transcript.jsonl) | `kc9-demo-transcript/v1`, one line per beat: composed command, env, loadout, reply, endpoint, doses, wall-clock |
| Replay page | [`/reports/hh-benchmark/kc9-demo-replay.html`](/reports/hh-benchmark/kc9-demo-replay.html) | One self-contained offline HTML file, served live and openable straight off disk — no CDN, no build step, no server. Step through the run beat by beat, then see all three arms side by side |
| Video | [`/reports/hh-benchmark/kc9-demo.mp4`](/reports/hh-benchmark/kc9-demo.mp4) | The three minutes, actually three minutes long: a narrated screen capture of the replay page in its `?autoplay=1` mode, embedded on [the method page](/research/hh-benchmark). Every spoken line is also on screen |
| Script | [`scripts/hell-heaven-bench/kc9-script.mjs`](https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/kc9-script.mjs) | The words and the camera plan. One string per beat is **both** the spoken line and the on-screen caption; every figure in it is interpolated from the transcript |
| Narration | [`kc9-narration.m4a`](https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/data/kc9-narration.m4a) + [`.json`](https://github.com/gaia-research/gaia-research/blob/main/content/reports/hh-benchmark/data/kc9-narration.json) | The voice-over and its manifest: exact text, per-line duration, per-line sha256. The track is the timeline |
| Renderer | [`scripts/hell-heaven-bench/render-kc9-replay.mjs`](https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/render-kc9-replay.mjs) | Transcript → replay page. Every figure on the page is read from the transcript at render time; none is typed in |
| Recorder | [`scripts/hell-heaven-bench/record-kc9-video.mjs`](https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/record-kc9-video.mjs) | Replay page → MP4 + poster, via Playwright and ffmpeg. One command, no editing step, no API key |
| Ledger | [`scripts/hell-heaven-bench/data/ledger.jsonl`](https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl) | The two committed records (`hh-kc9-demo` / `side-stripe-review`) |

**Why a replay page and not a terminal recording.** This run is three *headless*
`claude --output-format json` calls: one prompt in, one JSON blob out, no
interactive TTY. An `asciinema` cast or a `script(1)` capture of that is mostly
silent pauses around a JSON dump, needs a player (or third-party hosting) to
view, and cannot show three arms side by side without editing. The transcript is
structured data — this project's existing habit — so the durable artifact is the
data plus a renderer for it, and the page inherits the same honesty discipline as
the prose: every number on it comes out of the transcript, and uncommitted ones
carry ‡.

**And why there is nonetheless a video.** KC9's own sentence promises *three
minutes*, and the compute is fourteen seconds; the missing three minutes were
always the explaining. So the explaining was written down as a timeline rather
than performed: the replay page gained an `?autoplay=1` mode that plays the same
beats over 180 seconds with an on-screen caption track, and `record-kc9-video.mjs`
captures that page with Playwright and encodes it with ffmpeg. The video is
therefore **a screen recording of this report's own artifact**, not a second
telling of it — no editor, no re-enactment, no generated footage, and no frame
that could carry a figure the transcript does not. Its caption strings are
written in the renderer and interpolate the beats, so a caption that states a
number states the transcript's number by construction; re-running the recorder
against the same transcript produces the same walkthrough. It is still not a
terminal recording, for every reason in the paragraph above.

**The audio is the timeline.** The walkthrough is narrated in the mascot's
voice, and each line is synthesised on its own before the track is assembled as
`line + silence + line + silence`. So the moment a caption appears is, by
construction, the sum of every line and pause before it — nothing is
hand-aligned, and the captions cannot drift out of sync with the voice however
long a take runs. The same string is spoken and shown, which means the caption
track *is* the transcript of the audio rather than a paraphrase of it. The
committed manifest records each line's exact text, duration and a sha256 of its
audio; the committed track means anyone can rebuild the video without an API
key. Text-to-speech is not deterministic, so a re-take produces a different
read, different durations, and a new self-consistent timeline — which is exactly
why the durations are committed rather than assumed.

The replay page itself stays silent. It remains one self-contained offline file,
and a reader who cannot play audio loses nothing: the captions are the words.

## Where these claims are indexed

**KC8 (PR #139) landed on `main` while this demo was being built**, so the
sequencing question resolved itself: `claim-index.md` exists, and KC9's figures
are indexed there rather than described as owed to it. This report did **not**
fork a second copy of that page — it extends it with one section, **D**, in the
page's own status vocabulary:

| # | Claim | Status on the index |
|---|---|---|
| D1 | the two committed per-turn figures, the curated standing figure, and the signed floor→curated delta | **RECORD** |
| D2 | only the curated arm solves the shared endpoint | **RECORD (negative + positive)** |
| D3 | the native pole and the difference derived from it | **‡ UNCOMMITTED** |
| D4 | the inverted first run | **‡ UNCOMMITTED — method caveat** |
| D5 | the replay page and the transcript | **cited by path** |
| D6 | F7 and cursor | **unchanged by KC9** — neither appears in these artifacts |

Two consequences of that merge are worth stating rather than leaving implicit.
KC8 also replaced the claims gate's hand-maintained document list with a
**derived listing** of this directory, so this report is gated automatically by
sitting where it sits — nothing had to be registered. And KC8's own ledger
deep-links point at records **11–12**; KC9's records were appended *after* them,
at **13–14**, so no existing citation on that page moved.

## What this does and does not prove

- **Does:** run the complete KC9 sequence live and end to end — native, a
  measured bloat figure, a curated launch, and a task that only the curated arm
  completes; hold the prompt and the objective endpoint **identical** across all
  three arms so the loadout is the only variable; bind both committed poles to
  `hh-ledger/v1` records that `ledger.ts validate` accepts; produce a shareable
  offline artifact of the actual run rather than a mock-up; and re-verify the
  doorless floor route on 2.1.220 against M2's 2.1.216 figure.
- **Does not:** price any skill's *worth* (that needs paired task arms with N
  repeats and confidence intervals, **B3**, on clean installs, **B5** — this is
  one repeat of one task on one workstation); measure invocation dose live
  (`skillInvocation` stays `null`); or say anything about a harness other than
  `claude`. The absolute `perTurn` levels are this workstation's loadout in one
  session and drift with cache and cwd between runs. And it does not show native
  answering *wrongly* — native answers correctly for what it holds. What it shows
  is native paying **15,889 ‡** more than the floor for a loadout that could not
  answer the question, while a single deliberately-chosen contract could.
