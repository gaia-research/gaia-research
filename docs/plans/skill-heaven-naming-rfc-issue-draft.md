# RFC: Skill Heaven — name, doors, and product surface (closes RATIFICATION open item 8)

> **Draft issue for `gaia-research/gaia-research`.** Decision authority remains
> [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md); per G3 this issue
> holds the RFC, and it closes only when its decisions land there. Rulings below
> were made by the owner in the 2026-07-19 product-shaping session; per D9 the
> RATIFICATION deltas ship in the same PR as the first implementation.

## 1. The product question we actually answered

Open item 8 asked for a repo name and a binary name. Working the question as a
product question — *how does the user think in the moment before invoking?* —
produced rulings that reshape the surface, not just the label:

| Ruling | Owner decision (2026-07-19) |
|---|---|
| **Moment of use** | A **scalpel, not a door**. The user lives in bare `claude`/`pi` and reaches for this when it hurts: *"this task needs a clean room."* Not a habitual launcher. |
| **Pain vocabulary** | The pain is **context bloat** ("my agent wastes context on 40 skills I'm not using") — the H1 result's own language. |
| **Brand vs symptom** | **Brand name, symptom tagline.** The name is Skill Heaven; the one-liner does the pain work: *"Strip your agent's context bloat — run clean."* (No collision with the Context Diet lab, which owns CLAUDE.md-prose trimming.) |
| **Mental model** | **Harness-first.** Users think "claude" (or "codex") *first*, then remember heaven. Neither a `sudo`-style prefix wrapper nor a `--harness` flag matches how the user thinks — the product must live where the harness name lives. |

## 2. Names (proposed to close item 8)

| Thing | Name | Notes |
|---|---|---|
| Repo | **`gaia-research/skill-heaven`** | **Monorepo**: shared engine + per-harness packages + plugin dirs. The repo doubles as the **Claude Code plugin marketplace** ("add `gaia-research/skill-heaven`, install `claude-heaven`"). |
| User-facing installables | **`claude-heaven`**, then `pi-heaven`, `codex-heaven`, … | Per-harness bins/plugins are **the product**. Discovery is the mental model: type `claude<tab>`, see `claude-heaven`. |
| Core bin | **`skill-heaven`** | Survives as the **research driver**: `--print` recipes, `--record`, benchmark-arm orchestration (issue #62 contributors). Civilians get `claude-heaven`; researchers get `skill-heaven`. |
| In-session commands | **`/skill-heaven`** and **`/skill-hell`** | Mirrors N2's two mode names. |
| Fallback single-repo name | *(retired)* | The monorepo ruling makes `skill-heaven-hell` unnecessary. |

This **inverts the prior LEANING** (core self-fork as the user-facing thing,
extensions secondary): extensions are now the user-facing product; the core is
the engine plus the research instrument. Ratify the inversion explicitly.

**Availability (checked 2026-07-19):** npm `skill-heaven`, `claude-heaven`,
`pi-heaven`, `skill-heaven-hell`, `skill-hell` all unclaimed (404). GitHub
names are org-internal.

**Explicit decoupling:** the name pends **neither N4 (ultra) nor N5 (one scale
or two)** — those govern flag/level vocabulary inside the CLI, not the
repo/installable name — nor the Heaven persona lane (#119–#121), which governs
marketing copy. Repo creation unblocks now; N4/N5 stay OPEN.

## 3. The surface (what ships, per the rulings)

**Direction: awareness-first, honest switch.**

1. **`claude-heaven`** = claude, **native posture by default** (untouched — no
   eviction, no summoning), plus a **statusline segment** showing posture and
   standing dose: `⚡ native · 14.2k standing`. The ambient readout is the
   daily hook that creates the pain moment the scalpel serves.
2. **`/skill-heaven`** (in-session) = heaven posture picker
   (floor / curated / native). Physics is boot-time (D2): the command composes
   the new profile and hands the user the **exact relaunch command with
   `--resume` baked in**, so the conversation survives the mode switch. No
   magic respawn — no harness verifiably lets a slash command replace its own
   process, and we don't bet the flagship interaction on an unverified cell.
3. **`/skill-hell`** = **the locked door.** Shows the gate: current benchmark
   status, the ledger, "opens when Hell is proven safe," the summoning teaser.
   Not a claim — the honesty discipline (B4) made visible; converts the Skill
   Hell name's pull into benchmark attention (#62). Becomes the hell activator
   only when P2's gate opens.
4. Postures, levels, gating: **unchanged** (P1/P2/N3). The launcher still
   hard-errors on `med…max`.

## 4. Engineering caveats (M0 discipline — verify before load-bearing)

- [ ] **`--resume` across profile switch**: does a resumed session compose the
  *new* `--plugin-dir`/settings profile at boot? Needs a matrix cell on a
  pinned version before the honest-switch copy ships.
- [ ] **Statusline API**: segment mechanism + where the standing-dose number
  comes from per session. Matrix cell per harness.
- [ ] **Plugin self-dose**: `/skill-heaven`+`/skill-hell` add standing tokens
  to every session; price and publish it (D4 discipline — the tool must not be
  its own bloat).
- [ ] **Marketplace-from-monorepo**: verify multi-plugin subdirectory layout on
  the pinned Claude Code version.

## 5. RATIFICATION deltas (same PR as first implementation, per D9)

- Close **open item 8** with §2's names; log the LEANING inversion.
- New decisions to enter: scalpel positioning + symptom tagline; harness-first
  doors (per-harness installables as product); awareness-first surface
  (statusline dose readout); honest switch via relaunch-with-resume; hell as
  locked door; monorepo-as-marketplace.
- Update pointer map: launcher repo row gets its name; `hh-launcher` working
  name retires.

## 6. Rollout

1. Create `gaia-research/skill-heaven`; migrate `hh-launcher` history; rename
   bin; restructure to packages (`core`, `claude-heaven`); keep the census
   parity test and the ledger-validator gate (records still validate against
   `gaia-research`'s `ledger.ts` — the ledger-of-record never moves, D6).
2. `claude-heaven` first slice: native door + statusline segment.
3. `/skill-heaven` picker + honest switch (after the `--resume` cell verifies).
4. `/skill-hell` locked door.
5. `pi-heaven` after the B5 clean-sandbox work lands.
