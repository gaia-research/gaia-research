# Skill Heaven — continuation plan (post-naming: consolidation → claude-heaven slice 1 → pi-heaven vanguard)

> **Status: plan of record for the M2 continuation, drafted 2026-07-20.**
> Successor to [`m2-heaven-launcher-plan.md`](./m2-heaven-launcher-plan.md)
> (build items 1–8 complete; its leftovers are absorbed into WS6 below).
> **Decision authority:
> [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md)** — nothing LOCKED
> is re-litigated here. The naming question closed 2026-07-20 (**N8/N9/D10/D11**,
> RFC [#68](https://github.com/gaia-research/gaia-research/issues/68), PR #69):
> the product monorepo is **`gaia-research/skill-heaven`**; **per-harness
> installables (`claude-heaven`, `pi-heaven`, …) are the user-facing product**;
> the core `skill-heaven` bin is the research driver. Companions:
> [`skill-heaven-hell-mvp-plan.md`](./skill-heaven-hell-mvp-plan.md) (M0–M5
> frame), [`../labs/harness-capability-matrix.md`](../labs/harness-capability-matrix.md)
> (evidence), `scripts/hell-heaven-bench/` (census + ledger of record).

## 0. State snapshot (2026-07-20)

- **`gaia-research/skill-heaven` exists** (created 2026-07-19), seeded from the
  retired `hh-launcher` working checkout (`~/Documents/hh-launcher`, now
  remoted there). Engine at repo root (`src/{cli,compile,exec,record,skills}.ts`
  + `src/vendor`), bin renamed `skill-heaven`, 30/30 unit tests + census parity
  fixture green. Package restructure to `packages/` **not yet done**.
- `package.json` is `private: true`; npm names (`skill-heaven`,
  `claude-heaven`, `pi-heaven`, …) verified unclaimed 2026-07-19. **npm publish
  is a separate owner decision — not scheduled by this plan.**
- Frozen mechanics unchanged: **T9** curated route
  (`--setting-sources project` + `--plugin-dir` +
  `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1`, zero residual) and **T9b** floor, on
  Claude Code 2.1.215; the env knob is undocumented — re-verify per CLI
  upgrade.
- Binary map correction, **empirically probed 2026-07-20** (free flag probes):
  `agent` → symlink to `cursor-agent` **2026.07.16-899851b (Cursor CLI)** —
  both binaries report the same version; `grok` is its own binary at
  **0.2.103**. The matrix's G5 finding ("`agent` is grok") is **stale** as of
  the owner's 2026-07-19 reinstall; supersession is WS6 work.

## 1. Constraints (obeyed, not re-litigated)

- **D9** — ratification deltas ride the implementing PR. This plan PR carries
  no new decisions; if any workstream below forces a ruling, that ruling and
  its implementation land together.
- **B1–B5 claim discipline** — no claim ships ahead of its benchmark; doses
  priced separately (standing / invocation / harness), never one number; no
  seeds (N repeats + CIs); the ledger is always on; benchmark arms run on
  **clean sandboxed installs** (B5) — workstation runs are smoke evidence and
  say so.
- **P2** — hell is gated. Every user-facing surface (core bin and every
  `*-heaven` door) **hard-errors on `med…max`**; `/skill-hell` is a locked
  door, not an activator, until P2's gate opens.
- **D6** — the ledger-of-record and its validator never move. Every record any
  package emits must pass `gaia-research`'s
  `npx tsx scripts/hell-heaven-bench/ledger.ts validate`.
- **Quota discipline** (per the M2 plan): flag-existence probes are free; one
  cheapest-model listing probe per load-bearing cell; full demo runs on Claude
  Code only; exhausted quota → record the cell ❓-deferred with the exact repro
  command, never guess.
- **N4/N5 stay OPEN** — CLI level/flag vocabulary remains provisional; no
  unified scale is invented anywhere below.

## 2. Workstreams

### WS1 — Consolidation sweep (rides this PR where in-repo; rest flagged)

Every doc that still says `hh-launcher`, "name is OPEN item 8", or presents
`skill-heaven` as the thing users install gets reconciled to N8/N9. The
**marketing-weight rule** applies everywhere: per the N9 inversion,
`claude-heaven` (and siblings) are the product; `skill-heaven` is the engine,
marketplace, and research instrument — copy that pitches an installable pitches
`claude-heaven` first.

| Doc | Stale copy | Action | Status |
|---|---|---|---|
| `docs/plans/m2-heaven-launcher-plan.md` | `hh-launcher`, `<launcher-repo>`/`<launcher-bin>`, "name OPEN item 8" (×5) | Closing banner + surgical name fixes; body kept as historical record | **this PR** |
| `docs/plans/skill-heaven-hell-mvp-plan.md` (M2 status block) | "working name `hh-launcher` … pends OPEN item 8" | Status block updated: repo created, naming closed, pointer here | **this PR** |
| `scripts/hell-heaven-bench/README.md` | "sibling checkout `hh-launcher/` … real name is OPEN item 8" | Name the monorepo; restate the D6 validator gate | **this PR** |
| `docs/labs/harness-capability-matrix.md` | G5 "`agent` is grok" (now false); cursor column G4-deferred | **Dated supersession note only** (probe result recorded); cell rewrites are WS6 evidence work, not a copy edit | **this PR** (note) |
| `content/reports/hh-benchmark/methodology.md` | §1 "same seed", §2 "baseline is borrowed" (published score = placebo arm), §6 ledger `seed` field | Reconciliation banner deferring to B2/B3 now; full §1/§2/§6 rewrite (own-placebo anchoring; published scores = calibration only; no seeds) as its own doc PR | banner **this PR**; rewrite **pending** |
| Issue #62 body | "same seed", "the baseline is borrowed", "seed set" framing predating B2/B3; no post-naming pointers | Apply the replacement copy drafted in **Appendix A** (issue edit, not a PR — owner or implementing agent applies) | **pending** |
| `VISION.md` | §3 slider framing (N1) + pre-inversion product framing | Full rewrite — flag only; also pends N1 slider language and the persona lane | **flagged pending** |
| marketing-tasks master RFC (`deliverables/proposal/skill-heaven-hell-mvp-rfc.md`) | Pre-naming plan of record; `skill-heaven`-as-installable framing | Full rewrite in marketing-tasks — flag only (private lane; non-decisive where it lags RATIFICATION) | **flagged pending** |

### WS2 — Monorepo restructure (`gaia-research/skill-heaven`)

Target layout (npm workspaces, engine moves down, doors move up):

```
skill-heaven/
  package.json                  # workspaces root; still private
  packages/core/                # compile()/exec()/record()/skills resolver,
                                #   src/vendor (chars4, listing-line, sha256
                                #   refs, hh-ledger/v1 type) + parity fixture
  packages/claude-heaven/       # bin: claude-heaven (native-default door),
                                #   Claude plugin dir (/skill-heaven,
                                #   /skill-hell, statusline assets as WS3
                                #   gates verify)
  packages/pi-heaven/           # stub: name + README pointing at WS5;
                                #   no code claims
  .claude-plugin/               # marketplace manifest — lands only after
                                #   gate (d) verifies the layout
```

- The core **`skill-heaven` bin survives in `packages/core`** as the research
  driver: `--print` recipes, `--record`, benchmark-arm orchestration (issue
  #62 contributors).
- **Ledger-validator gate kept, both ways** (unchanged from M2 §2): the
  fixture-based census parity test moves into `packages/core`; CI runs every
  emitted-record fixture through `gaia-research`'s
  `scripts/hell-heaven-bench/ledger.ts validate` (pinned `gaia-research`
  checkout in CI; the validator itself never moves, D6).
- Acceptance: all existing tests green post-move; parity fixture byte-identical;
  one validator-clean record produced end-to-end; zero-mutation check intact.
- Out of scope: npm publish (owner decision), any new posture/flag surface.

### WS3 — Verification gates (M0 discipline; all four before any D10 copy ships)

Each gate becomes a **matrix row on a pinned Claude Code version** (repro
command + observed output), landing in `gaia-research` via its implementing PR
(D9). Flag probes free; at most one haiku listing probe per load-bearing cell.
**A negative result is a first-class finding (D8)** — recorded, and the D10
copy it blocks changes rather than ships anyway.

| Gate | Question | Status | Blocks |
|---|---|---|---|
| **(a) in-session recomposition** | Can `--resume`/`--fork-session` with a new profile recompose *subtractively* at boot? | ✅ **RESOLVED NEGATIVE (2026-07-22, 2.1.216)** — subtractive is launcher-locked; user-scope survives every continued session. Matrix gate (a); **D12**. | (unblocked) `/skill-heaven` copy; WS4 step 2 |
| **(b) statusline API** | Segment mechanism, input JSON, and **where the standing-dose number comes from** (census vs. live) | ✅ **RESOLVED (2026-07-22)** — census-derived; `context_window` counts are running-usage, not standing. Matrix gate (b). | WS4 step 1 statusline segment |
| **(c) plugin self-dose (D4)** | Standing tokens the `/skill-heaven` + `/skill-hell` commands themselves add | ✅ ≈57 tok/session (matrix gate (c)) | WS4 steps 2–3 copy; README claims |
| **(d) marketplace-from-monorepo** | Multi-plugin subdirectory + marketplace manifest layout; `claude-heaven` installable from the repo | ⏳ pending WS2 | WS2 marketplace claim; install docs |
| **(e) behavioral restraint (D13)** | Does a heaven-native skill (`grill-me` class) reliably suppress *use* of in-context skills without a physical purge? | ❓ **UNVERIFIED — research track (gaia-skill-tree)**. Matrix gate (e). | the below-vanilla behavioral notch in WS4 slider copy |

Gates (a)–(c) are **resolved** (matrix rows landed). Gate (a) came back
**NEGATIVE for subtractive in-session recomposition** — this did **not** collapse
to "honest-new-session copy"; it produced the **two-dose design** (D12) and the
**one-slider surface** (D13): `claude-heaven` launcher owns the subtractive floor,
`/skill-heaven` is the in-session upward scalpel with a launcher-locked lower
bound. Gate (d) rides WS2; gate (e) is research-pending (D13) and blocks only the
behavioral notch, not the MVP physical slider.

### WS4 — claude-heaven slice 1 (flagship, D10)

Strict order, each step gated:

1. **Native-default door + statusline segment** (needs gates b, c):
   `claude-heaven` = claude at native posture by default — no eviction, no
   summoning, no flags injected beyond the statusline wiring — plus the
   posture/standing-dose readout (shape per RFC #68: `⚡ native · 14.2k
   standing`). The ambient number is the pain moment the scalpel serves.
2. **`/skill-heaven` posture slider** (gate a resolved; **D12/D13**): the active
   **downward** control, summonable anytime. It renders the posture slider and
   moves the session **upward** from the launch floor (additive `--plugin-dir`,
   bundled toggle) — it **cannot** physically descend below the launch floor.
   Therefore:
   - Under **`claude-heaven`** (launched at the floor) the slider is fully
     unlocked downward.
   - Under **vanilla claude** the lower notches render **visibly locked** —
     *"relaunch via `claude-heaven` to unlock the clean room"* (locked-notch
     upsell). No magic respawn; the flagship never rides an unverified cell.
   - The **below-vanilla behavioral notch** (heaven-native restraint, D13) renders
     as "coming — research" until **gate (e)** passes; MVP ships the physical
     slider only.
3. **`/skill-hell` locked door** (D13: **shown in ALL modes**): benchmark status,
   ledger link, "opens when Hell is proven safe" (B4 made visible; converts pull
   into #62 attention). Stays the consistent locked gate across vanilla /
   `claude-heaven` / `pi-heaven`; the additive upward capability is not exposed as
   an active control until P2 opens it. Copy bound by the claim-discipline table;
   needs gate (c) pricing only.

Acceptance per step: zero-mutation check (`git status` clean, `~/.claude`
untouched, temp dirs gone); statusline number cross-checks `census.ts` on the
same loadout; every level `med…max` still hard-errors (P2); copy reviewed
against the claim table before merge.

### WS5 — pi-heaven vanguard (D11)

pi proves the interaction at full fidelity first; findings port **down** to
Claude Code's restrictive plugin surface. Marketing weight stays on
`claude-heaven` throughout (D11 corollary of N9).

1. **Extension-API matrix cells on pinned pi 0.80.10**: widget rendering (the
   statusline-equivalent), first-class command registration
   (`/skill-heaven`-equivalent), and **session-restart control** (the "magic
   switch" rung Claude Code can't verifiably reach). Each cell empirical or
   ❓-with-repro; nothing load-bearing until verified.
2. **Re-characterize the `--no-skills` discovery race on the B5 clean
   sandbox** (`PI_CODING_AGENT_DIR` + isolated `--session-dir`; N runs, argv
   orders varied). Two honest outcomes: race reproduces on a clean install →
   upstream issue + floor stays assert-probe-and-discard; or race is a
   workstation-config artifact → pi floor unblocks for benchmark arms, matrix
   P1 row superseded with the clean-install evidence.
3. **Prototype the full-fidelity D10 surface on the sandbox** (widget +
   commands + extension-driven restart if its cell verifies), then write the
   port-down notes for WS4 steps 2–3. The B5 sandbox doubles as pi-heaven's
   dev/test fixture.

### WS6 — Leftover session debts

- **Cursor matrix column** via free flag probes: `agent` == `cursor-agent`
  **2026.07.16-899851b (Cursor CLI)** now — G5's "agent is grok" gets a dated
  supersession row. **Audit existing cursor-column cells for grok
  contamination**: any cell whose evidence came from the `agent` binary before
  the 2026-07-19 reinstall was actually probing grok 0.2.103 and must be
  re-sourced or ❓'d. Then fill the G4-deferred cells (discovery, suppression,
  `CURSOR_CONFIG_DIR` scoping, headless) — flag probes first, at most one
  cheap listing probe for load-bearing cells.
- **B5 clean-sandbox script** lands in
  `gaia-research/scripts/hell-heaven-bench/` (pi first:
  `PI_CODING_AGENT_DIR` + `--session-dir`; the Claude Code sandbox still pends
  the macOS Keychain caveat G3 — record, don't work around).
- **codex + grok columns stay deferred**: grok is native-posture-only (no
  suppression mechanism exists, matrix G2); codex cells remain ❓-deferred with
  repro commands until quota allows.

## 3. Sequencing & PR map

```
WS1 (this PR)
  └─► WS3 gates a+b+c        (probes; matrix rows → gaia-research PR)
        ├─► WS2 restructure + gate d   (skill-heaven PR; marketplace claim)
        │     └─► WS4 step 1 → step 2 (gate a) → step 3
        └─► WS5 vanguard      (parallel lane; informs WS4 steps 2–3)
WS6 quota-free parts (cursor probes, sandbox script) — anytime, background
```

| PR | Repo | Carries |
|---|---|---|
| This PR | `gaia-research` | WS1 in-repo sweep + this plan + RATIFICATION pointer-map row |
| Gates a–c | `gaia-research` (+ `skill-heaven` if code needed) | Matrix rows; any forced ruling rides along (D9) |
| Restructure | `skill-heaven` | WS2 + gate (d) matrix row in a paired `gaia-research` PR |
| Slice-1 steps | `skill-heaven` | WS4; copy PRs reviewed against the claim table |
| Vanguard | `skill-heaven` (+ matrix PRs in `gaia-research`) | WS5 cells + sandbox findings |
| Debts | `gaia-research` | WS6 matrix column + sandbox script |

## 4. Out of scope (deliberately)

N4/N5 and hell-lane level mapping (OPEN 1–3); heaven-native dose budgets
(OPEN 4); persona name (#120); npm publish; prompt eviction / M2a harness-dose
census / M2b necessity map; context-pack seed skills; native `--heaven-mode`;
codex/grok column completion; ledger v2 fields.

## 5. Flagged for the owner (not blocking)

1. **npm publish timing** — names unclaimed as of 2026-07-19; squatting risk
   grows with public copy. Owner decision, deliberately not scheduled here.
2. **Issue #62 copy edit** — Appendix A draft ready to apply.
3. **VISION.md + master RFC rewrite scheduling** — both flagged pending; VISION
   also pends the N1 slider-language rewrite, so it may warrant one combined
   pass.
4. ~~**Gate (a) negative contingency**~~ — **RESOLVED 2026-07-22.** Gate (a)
   came back NEGATIVE for subtractive in-session recomposition; owner ratified the
   two-dose design (D12) + one-slider surface (D13) rather than an
   honest-new-session climbdown. See the WS3 gate table above and matrix gate (a).

## Appendix A — issue #62 replacement copy (draft)

Replace the "borrowed baseline / same seed" paragraphs with:

> Treat it like a **drug trial**, not an exam. A skill is a *compound*; the
> agent-in-context is the *patient*; tokens are the *dose* — priced as two
> numbers, standing (listing line) and invocation (full body), never one. You
> never score a skill in a vacuum — you measure the **marginal effect**: same
> task, same model, run **with** the skill and **without**. The delta is the
> skill's worth.
>
> The placebo arm is **our own same-harness no-skill run** — not a borrowed
> number. Published benchmark scores are used for *calibration only*.
> Determinism doesn't exist in real agent harnesses, so there are no seeds:
> we run **N repeats and report confidence intervals**, and the run ledger
> (`scripts/hell-heaven-bench/`) rejects `seed` by design.

And append a naming pointer:

> The tooling side now lives in
> [`gaia-research/skill-heaven`](https://github.com/gaia-research/skill-heaven)
> — contributors drive benchmark arms with the **`skill-heaven`** research CLI
> (`--print`/`--record`); the user-facing doors (`claude-heaven`, `pi-heaven`,
> …) are the product built on it.
