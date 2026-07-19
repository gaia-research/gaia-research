# M2 — Skill Heaven launcher (profile compiler): handover plan

> **CLOSED 2026-07-20 — naming ratified, plan superseded.** Open item 8 closed
> via **N8/N9/D10/D11** (RFC
> [#68](https://github.com/gaia-research/gaia-research/issues/68), PR #69): the
> repo is **`gaia-research/skill-heaven`** (monorepo + Claude plugin
> marketplace); the **per-harness installables (`claude-heaven`, `pi-heaven`,
> …) are the user-facing product**; the core `skill-heaven` bin is the research
> driver. The `hh-launcher` working name is retired — its checkout was seeded
> into the new repo. Build items 1–8 below are complete; everything still open
> continues in
> [`skill-heaven-continuation-plan.md`](./skill-heaven-continuation-plan.md).
> The body below is kept as the historical handover record — read `hh-launcher`
> / `<launcher-repo>` / `<launcher-bin>` as `skill-heaven`.
>
> **Status: approved by the owner 2026-07-19; first implementation pass landed
> the same day** (sibling `hh-launcher/` checkout + this repo's matrix/ledger
> updates — see the M2 status block in
> [`skill-heaven-hell-mvp-plan.md`](./skill-heaven-hell-mvp-plan.md)).
> **Deviation history:** T6 resolved *negative* and the T7 config-dir fallback
> is auth-blocked on macOS (Keychain credentials), so the first pass shipped
> the **T8 composition** (`--setting-sources project` + `--plugin-dir`) with
> bundled CLI skills as a recorded residual. **The owner vetoed that residual
> (PR #67 rulings)**; the veto was resolved the same day by **T9**: T8 +
> `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1` — curated listing = the curated set
> only, zero residual. Floor is the matching **T9b** composition (T2
> suppression + `--setting-sources project` + the env knob → `NONE`). The env
> knob is undocumented (string-probed from the 2.1.215 binary) — version-pinned,
> re-verified on every CLI upgrade. Details + repro rows:
> [`../labs/harness-capability-matrix.md`](../labs/harness-capability-matrix.md)
> (M2 re-check table, T6–T10).
>
> This is the
> handover plan for the implementing agent. **Decision authority:
> [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md)** — this plan
> implements D1/D6/D7; the founder doc decides. Companions:
> [`skill-heaven-hell-mvp-plan.md`](./skill-heaven-hell-mvp-plan.md) (M0–M5
> frame), [`../labs/harness-capability-matrix.md`](../labs/harness-capability-matrix.md)
> (M0 evidence), `scripts/hell-heaven-bench/` (M1 census, M3 ledger).

## 1. Context

M0 (harness capability matrix), M1 (two-dose census) and M3 (run ledger) are
done. Per the milestone table and **D1 (LOCKED)**, the next milestone is **M2:
the launcher-shaped profile compiler** — launcher UX outside, M0-verified
in-harness mechanics inside. It **composes flags and execs; it never stashes,
restores, or mutates shared state** (P3). It is the project's first
user-runnable tool.

Owner amendments ratified 2026-07-19 (now RATIFICATION D6/D7):

- **D6 — repo split.** The launcher ships as a **user-facing installable in its
  own repo** (named `gaia-research/skill-heaven` when item 8 closed,
  2026-07-20). Research, benchmarks (census / ledger /
  matrix / reports) and the site **stay in `gaia-research`**. The ledger-of-record
  (`scripts/hell-heaven-bench/data/ledger.jsonl`) and its validator never move.
- **D7 — grok joins the harness scope**, alongside Claude Code (reference), pi
  (second), Codex, Cursor. M0 discipline: empirical matrix column on a pinned
  version; no cell load-bearing until verified.

**Execution environment for the implementing agent (per owner):** full harness
authorizations — **claude, pi, codex, cursor (agent), grok — logged in and
ready**, possibly quota-limited on some. Quota discipline per harness:
(1) `--version` / `--help` flag-existence probes (free), (2) one cheapest-model
listing probe per load-bearing cell, (3) full demo runs on Claude Code only.
If quota is exhausted, record the cell **❓-deferred with the exact repro
command** in the matrix and fall back to `--print` verification — never guess a
cell. Quota-free side work: flag-existence checks for the M2a prompt-control
cells (`--system-prompt` / `--append-system-prompt` and per-harness
equivalents) go into the matrix as prep — flags only, **no prompt-eviction
claims ship** (M2b unratified).

Ratified constraints obeyed, not re-litigated:

- **P1/P2**: only heaven postures ship — `floor` (level `off`), `curated`
  (level `low`), `native` (default). Hell lane is gated; the launcher
  hard-errors on `med…max` (level mapping is OPEN item 3).
- **N3**: level vocabulary `off·low·med·high·xhigh·max`; N4/N5 OPEN → no
  invented unified scale; the flag surface is documented as provisional.
- **B1–B4**: doses priced separately; own-placebo anchoring; no seeds; ledger
  always on; token `null` = unmeasured, never 0 (by-construction zeros are
  legitimate, per existing ledger records).

## 2. Repo split (D6): what lands where

| Artifact | Repo |
|---|---|
| Installable CLI (profile compiler + exec + record emission), its tests, its README | **`gaia-research/skill-heaven`** (created 2026-07-19; item 8 closed 2026-07-20) |
| Capability-matrix updates (T6/T7 spike, pi/codex/cursor re-checks, **new grok column**) | `gaia-research` — `docs/labs/harness-capability-matrix.md` |
| Ledger of record + validator (`ledger.ts`, `data/ledger.jsonl`) | `gaia-research` (unchanged) |
| Census + dose discipline (`census.ts`) | `gaia-research` (unchanged) |
| Benchmark reports, site | `gaia-research` (unchanged) |

**Cross-repo contract (keep it thin):** the launcher repo does not import
`gaia-research` code. It **vendors the small pure pieces** with a parity test:
the `chars4` tokenizer (`max(1, floor(chars/4))`), the listing-line format
(`- ${id}: ${description}`, whitespace-collapsed), `sha256(SKILL.md)` skill
refs, and the `hh-ledger/v1` record type. Parity is enforced two ways:
a fixture-based parity test in the launcher repo (same input → same hash/token
numbers as a checked-in fixture generated by `census.ts`), and the hard gate
that every emitted record must pass `gaia-research`'s
`npx tsx scripts/hell-heaven-bench/ledger.ts validate`. Launcher `--record`
writes the record JSON (`--record-out <file>` and stdout); appending to the
ledger-of-record happens in `gaia-research` via its own appender (B4: the
ledger is always on — benchmark runs get appended, and the append is part of
the demo below).

## 3. CLI surface (provisional pending N4/N5 — mechanics fixed, spelling may change)

```
<launcher-bin>
  --posture floor|curated|native        # default floor. P1 vocabulary.
  [--level off|low]                     # alias: off→floor, low→curated; contradiction = error;
                                        # med|high|xhigh|max = hard error (hell gated, P2; mapping OPEN)
  [--harness claude|pi|codex|cursor|grok]  # default claude; exec only where verified cells allow,
                                        # else --print recipe
  [--skill <path>]...                   # repeatable, SKILL.md or its dir; required for curated, rejected otherwise
  [--mechanism plugin-dir|config-dir]   # claude curated re-admission route; default frozen by the T6 spike
  [--print]                             # compile-only: JSON {command, argv, env, fsPlan, notes, doseSummary}
  [-p <text>]                           # headless; omit → interactive (inherited stdio)
  [--model <m>] [--effort <lvl>] [-- <passthrough>]
  [--record --benchmark-id <id> --task <id> [--arm heaven|placebo] [--repeat <n>]
     [--endpoint-regex <re>] [--record-out <file>]]
  [--keep-temp]
```

## 4. Design

**Pure `compile()` separated from `exec()`.**
`compile(posture, harness, mechanism, skills, …) → {command, argv, env(additions
only), fsPlan, notes, doseSummary}` does zero I/O; `fsPlan` paths use a
`"$SESSION"` placeholder that `exec()` substitutes after
`mkdtemp(os.tmpdir()/hh-heaven-…)`. Fully unit-testable without disk or spawn.

**Claude Code mappings (M0-verified flags, v2.1.211):**

- **floor** → `--disable-slash-commands` (T2) + `--strict-mcp-config
  --mcp-config '{"mcpServers":{}}'` (zero server, AT-H5). Empty fsPlan. Note
  recorded: user settings/hooks still apply — floor is a *skills+server* floor;
  prompt eviction is M2b (unratified, out of scope).
- **curated, `plugin-dir` route (primary)** → floor argv +
  `--plugin-dir $SESSION/heaven-set`; fsPlan writes a minimal
  `.claude-plugin/plugin.json` manifest and copies each skill dir into
  `heaven-set/skills/<id>/`.
- **curated, `config-dir` route (fallback)** → `CLAUDE_CONFIG_DIR=$SESSION/config`
  + credentials copy + skills copied into `config/skills/`; **no** suppression
  flag (it would eat the curated set). Known leaks (bundled-skill auto-seed,
  project skills) recorded in notes.
- **native** → no flags, no env, no fsPlan (P3: exiting = switching, literally).

**pi** → floor `--no-skills`; curated `--no-skills --skill <dir>…`; native →
nothing. **Live target**: first re-verify the M0 doc-verified pi cells
empirically (the "10-minute local re-check" the matrix demands), then exec for
real. `--print` fallback if quota is out.

**codex** → recipe compiled from the matrix cells (`$CODEX_HOME` scoping,
per-skill `config.toml` toggles); empirically clear the two M0 ❓ cells (do `-c`
overrides reach `skills.config` per-session; `codex exec` JSON usage shape) via
cheap probes, then decide: if per-session config-scoping verifies, `exec()`
supports codex; otherwise codex stays `--print` recipe with the evidence
recorded.

**cursor (agent CLI)** → verify `CURSOR_CONFIG_DIR` scoping + headless listing
probe empirically; rules are tracked files (eviction dirties git — ratified
posture), so cursor stays on the documented-recipe track regardless, with
empirical citations replacing doc-only ones.

**grok (in scope per D7)** → start from zero: pin the installed version, probe
skill-discovery / suppression / session-scoped-config / headless / usage
introspection flags, and add a **new column to the capability matrix** (M0
method: empirical or cited, else ❓). Launcher support (`exec` vs `--print`
recipe) follows what the verified cells allow — do not guess a mechanism.

**`exec()` semantics:** materialize fsPlan in the temp dir, spawn (interactive:
inherited stdio; headless: prompt on stdin, JSON captured), delete the temp dir
unless `--keep-temp`. Crash-safe by construction — the only writes are inside a
disposable tmp dir; no journal, no doctor (AT-H2).

**Curated skill resolution:** id from frontmatter `name` (fallback dir name);
`contentSha256 = sha256(exact SKILL.md bytes)` — byte-identical shape to the
census artifact and `ledger.SkillRef`. Every curated launch prints the
loadout's standing/invocation dose (chars4 backend named) — the by-construction
cross-check for the below-vanilla claim.

**The caveat spike (T6), dogfooded through the launcher.** M0's open caveat:
does `--plugin-dir` re-admission work *while* `--disable-slash-commands` is
active? Resolve empirically with the M0 listing-probe prompt and
`--posture curated --mechanism plugin-dir --skill <fixture skill> --model haiku -p "$Q"`
(fixture: `gaia-research/.agents/skills/impeccable`):

- curated skill listed → freeze `DEFAULT_CLAUDE_MECHANISM = "plugin-dir"`.
- `NONE` → run **T7** on the `config-dir` route, record the residual listing,
  freeze `"config-dir"`.

Either way: append T6/T7 rows to the matrix's empirical table (repro command +
observed output), rewrite the caveat paragraph (dated, version-pinned).
`--mechanism` stays a flag so the losing route remains reproducible.

**`--record` (opt-in, headless-only):** wraps the run, parses
`--output-format json` usage, assembles an `hh-ledger/v1` record. Field
discipline: `tokens.system` = **null** (M2a unratified); floor →
`skillStanding`/`skillInvocation` **0** by construction (matches existing
placebo records); curated → standing = chars4 sum, invocation = **null** with a
note (stream-json instrumentation is a follow-up); `perTurn` from usage
(summation formula documented in the launcher README); `arm` default `heaven`,
`--arm placebo` allowed only for floor; endpoint from `--endpoint-regex` else
`{kind:"unscored", pass:null}`; harness `{name, version}` captured at run time.

## 5. Verification / demo (the "tool in action" bar)

```bash
# 0. unit tests — pure compiler: posture×harness mappings, level aliases,
#    hell-lane rejection, error paths, dose math, ledger-record parity fixture.

# a. vanilla vs floor — same repo, same M0 listing-probe prompt Q
echo "$Q" | claude -p --model haiku --output-format json     # vanilla: skills listed + usage
<launcher-bin> --posture floor --model haiku -p "$Q"         # → "NONE" + token delta, live

# b. curated re-admission of one real skill (this IS the T6 spike)
<launcher-bin> --posture curated --skill <gaia-research>/.agents/skills/impeccable \
  --model haiku -p "$Q"                                      # → listing = impeccable only + dose summary

# c. recorded run → validator-clean record → appended to the ledger of record
<launcher-bin> --posture floor --arm placebo --record \
  --benchmark-id hh-m2-smoke --task listing-probe --endpoint-regex '^NONE$' \
  --model haiku -p "$Q" --record-out /tmp/rec.json
# in gaia-research:
npx tsx scripts/hell-heaven-bench/ledger.ts append --record "$(cat /tmp/rec.json)"
npx tsx scripts/hell-heaven-bench/ledger.ts validate         # OK — n+1 records

# d. pi port, live (quota permitting; else --print)
<launcher-bin> --harness pi --posture floor -p "$Q"          # → NONE
<launcher-bin> --harness pi --posture curated --skill …/impeccable -p "$Q"

# e. codex / cursor / grok probes (cheap) + compiled recipes
codex --version && codex exec --help                         # flag existence, free
grok --help                                                  # discovery/suppression flags → matrix column
<launcher-bin> --harness codex --posture floor --print
<launcher-bin> --harness cursor --posture floor --print
```

Zero-mutation check after every exec: `git status` clean in both repos,
`~/.claude` (and each harness's shared config) untouched, temp dir gone.

## 6. Build order

1. Create `<launcher-repo>` scaffold (TypeScript ESM package, bin entry,
   vitest; minimal deps). Vendor the pure helpers + parity fixture (§2).
2. Types, skill resolver, pure `compile()` (claude both mechanisms, pi, codex /
   cursor / grok recipe notes), dose summary.
3. Unit tests green.
4. `exec()` + temp lifecycle + `--print`.
5. Spike T6 (T7 if needed) → freeze default mechanism → matrix update in
   `gaia-research`.
6. `--record` emission + parity gate against `ledger.ts validate`.
7. Demo runs a–c (Claude Code); append + validate in `gaia-research`.
8. pi port live (d); matrix cells ✅'d.
9. Codex / cursor probes; **grok column** (e) — quota permitting, leftovers
   last.
10. READMEs (launcher repo + `scripts/hell-heaven-bench/` cross-reference),
    matrix additions for every harness actually probed, one M2 status line in
    `skill-heaven-hell-mvp-plan.md`.
11. Draft PRs in both repos.

## 7. Out of scope (deliberately)

Hell/Ultra postures & level mapping (OPEN 1–3); MCP summon / `gaia-mcp` (M5);
harness-dose census M2a, necessity map M2b, any prompt eviction
(`tokens.system` stays null); ledger `v2` fields (`promptProfile`, `packHash`);
context-pack seed skills; native `--heaven-mode`; counted (non-chars4)
tokenizer backend; skill-invocation instrumentation via stream-json (noted
follow-up); publishing/branding the installable (naming closed 2026-07-20; npm
publish remains a separate owner decision).

## 8. Flagged for the owner (not blocking)

1. ~~**Launcher repo + binary name**~~ — closed 2026-07-20 (N9): repo
   `gaia-research/skill-heaven`, core bin `skill-heaven`, doors
   `claude-heaven`/`pi-heaven`/…. Historical text: (OPEN item 8) —
   scaffold under a working name, no branding.
2. **CLI flag vocabulary** (`--posture` + `--level` alias) provisional until N5
   closes; launcher README says so.
3. **Project-default posture file** (P3 promises "project defaults") — format
   unratified; M2 ships session flags only; proposal to be staged, not
   invented.
4. **Smoke records** land in the checked-in ledger under `hh-m2-smoke` per B4 —
   called out in the PR for easy veto.
