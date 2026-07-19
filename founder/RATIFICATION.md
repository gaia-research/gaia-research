# RATIFICATION — Skill Heaven / Skill Hell (the oracle)

> **This is the single source of truth for decisions.** Last ratified:
> **2026-07-20** (owner). One live doc at a time; superseded versions move to
> [`archived/`](./archived/). Where any other doc disagrees — including
> `VISION.md`, the marketing-tasks master RFC, or older decision logs — **this
> doc wins** and the other doc is pending rewrite.
>
> Statuses: **LOCKED** (decided — do not re-litigate) · **LEANING** (owner
> default — act on it unless the owner reverses) · **OPEN** (undecided — do not
> invent an answer; flag it).

## 1. Naming & interaction model

| # | Status | Decision |
|---|---|---|
| N1 | **LOCKED** | **Modes, not a slider.** The product is discrete **mode switching**. The entry mechanism (launcher or in-harness) never changes what a mode means — same mode, same semantics, any door. Supersedes the "slider" framing in `VISION.md` §3, IDEAS-2026-020, and the HH Index RFC §1 (all pending rewrite). |
| N2 | **LEANING** | Mode names: **"Skill Heaven mode"** and **"Skill Hell mode."** Gaia is about skills — the skill terms lead even where a mode also touches context/prompt. |
| N3 | **LOCKED** | **Levels use agentic-coding terms:** `off · low · med · high · xhigh · max`. No celestial level names — "Heaven-0 / Heaven-1" are retired as level names (historical shorthand in older docs only). |
| N4 | **OPEN** | **`ultra`** — whether the term survives, and where it sits. |
| N5 | **OPEN** | **One scale or two** — a single mode×level scale spanning heaven→hell, or two dials (mode + level). |
| N6 | **LOCKED** | The index is the **Hell Heaven (HH) Index**; schema key `hellHeaven` (reconciled 2026-07-18). |
| N7 | **LOCKED** | **Milim is the Hell-mode persona.** The Heaven persona's name is reserved and undecided (marketing-tasks #119/#120/#121); nothing may hard-code one. Credit Matt Pocock for naming Skill Hell; the frame is "Stop installing. Start summoning." |
| N8 | **LOCKED** | **Product positioning: scalpel, not door** (ratified 2026-07-20, RFC #68). The user lives in bare `claude`/`pi` and reaches for this when it hurts — *"this task needs a clean room."* The pain vocabulary is **context bloat**; the name carries the **brand**, the tagline carries the **symptom** ("Strip your agent's context bloat — run clean"). Mental model is **harness-first**: users think "claude" first, then heaven — the product lives where the harness name lives, never as a `sudo`-style wrapper identity. |
| N9 | **LOCKED** | **Names ratified; open item 8 closed** (2026-07-20, RFC #68). Repo: **`gaia-research/skill-heaven`** — a **monorepo** (shared engine + per-harness packages) that doubles as the Claude Code plugin marketplace. User-facing installables are **per-harness**: `claude-heaven`, `pi-heaven`, `codex-heaven`, …; the core **`skill-heaven` bin survives as the research driver** (`--print`/`--record`, benchmark-arm orchestration). In-session commands: `/skill-heaven` and `/skill-hell`. The `skill-heaven-hell` fallback name is retired. **LEANING inversion ratified**: extensions are the user-facing product; the core is the engine + research instrument — the "flagship agentic tool" title belongs to the family of harness doors, not the core bin. **N4/N5 are explicitly decoupled from naming** (they govern flag/level vocabulary, not repo/installable names) and stay OPEN; the persona lane (#119–#121) governs marketing copy only. |

## 2. Posture semantics (what the modes mean)

| # | Status | Decision |
|---|---|---|
| P1 | **LOCKED** | Four postures, substance ratified 2026-07-19: **floor** (evict all skills, bare prompt profile, zero server — the benchmark's placebo-of-record) at level `off`; **curated loadout** (a hand-gated few; source-agnostic — user's own custom skills first, heaven-native canon via the librarian optional) at level `low`; **native** (user-custom setup, untouched — no eviction, no summoning) as the default; the **hell lane** (evidenced flood → whole evidenced pool, firebreak on, honesty-gated) above native. Mapping of the hell lane onto upper levels: **OPEN** (pends N4/N5). |
| P2 | **LOCKED** | **Heaven ships first** (pure subtraction, no registry, no gate). **Hell/Ultra are gated**: benchmark stamps + trust-coverage threshold + owner ratification ("Hell is safe to enable"). |
| P3 | **LOCKED** | **Modes are per-session, never a config mutation.** Compiled per invocation; project defaults with session overrides; nothing writes to shared config; exiting a mode = switching modes, never a restore operation. |
| P4 | **LOCKED** | **Heaven's deliverable is context authorship** — the empowerment lane (PRDs, context docs, decision logs; the context-pack direction). Heaven is more than subtraction; subtraction is its floor. Spec WIP in `docs/plans/skill-heaven-native-shaping.md`. |

## 3. Delivery & mechanism

| # | Status | Decision |
|---|---|---|
| D1 | **LOCKED** | **M2 ships the launcher-shaped profile compiler** over the M0-verified in-harness flags (suppression + curated re-admission + session-scoped config; zero shared-state mutation). A native in-harness mode (`--heaven-mode` shape) is a **future iteration** once the open engineering caveats clear. Claude Code is the reference harness; pi second; Codex/Cursor get documented recipes. |
| D2 | **LOCKED** | **Eviction is harness-side, never an MCP operation** (MCP is additive-only in every target harness). |
| D3 | **LOCKED** | **Managed surfaces (claude.ai connector) carry the summon side only** for the MVP — no session-boot control there. The **full mode ladder on every surface remains the north star**; each surface climbs as its capabilities allow. |
| D4 | **LOCKED** | `gaia-mcp` keeps a **≤2-tool surface** (`search_skills`, `summon`); its own schema footprint is measured and subtracted in every claim. Heaven's purest form uses no server. |
| D5 | **LOCKED** | **Hell routing is deterministic and performance-first**: nearest-neighbor over a build-time frozen embedding index (pinned model, versioned artifact, version handshake); ranked/origin skills sort first; no model call ever decides a loadout; stress bar = hundreds of skills. |
| D6 | **LOCKED** | **The launcher ships as a user-facing installable in its own repo** (ratified 2026-07-19). Research, benchmarks (census / ledger / capability matrix / reports), and the site stay in `gaia-research`. The launcher repo consumes `hh-ledger`-compatible record shapes and the two-dose pricing discipline from here; the ledger-of-record and its validator never move. Repo name and installable/binary name: **OPEN** (pend N4/N5 and the persona lane #119–#121). |
| D7 | **LOCKED** | **Grok is in the harness scope** (ratified 2026-07-19), joining Claude Code (reference), pi (second), Codex, and Cursor. M0 discipline applies unchanged: grok gets an empirical capability-matrix column on a pinned version, and no cell is load-bearing until verified; launcher support follows what its verified cells allow. |
| D8 | **LOCKED** | **Implementation differs per harness; the outcome must be the same** (ratified 2026-07-19, PR #67). `pi-heaven` is an extension; codex may be launcher or plugin; **preference goes to in-harness plugins** unless proven not to work. Corollary: **a "will not work" ledger is as important as a "will work" one** — verified negative findings are first-class evidence, recorded with the same rigor (matrix ❓/NEGATIVE rows, honest endpoint-FALSE ledger records). |
| D9 | **LOCKED** | **Ratification and implementation land in the same PR** (ratified 2026-07-19, PR #67) — decisions are made as the work proceeds, so the decision record and the code embodying it travel together. |
| D10 | **LOCKED** | **Awareness-first surface, honest switch** (ratified 2026-07-20, RFC #68). `claude-heaven` = claude at **native posture by default** + a **statusline segment** showing posture and standing dose (the ambient readout that creates the pain moment). `/skill-heaven` = heaven posture picker; physics is boot-time (D2), so it composes the new profile and hands the user the exact **relaunch command with `--resume` baked in** — the conversation survives the switch. **No magic respawn**: no harness verifiably lets a slash command replace its own process; the flagship interaction never rides an unverified cell. `/skill-hell` = **the locked door**: benchmark status, ledger link, "opens when Hell is proven safe" — B4's honesty discipline made visible; it becomes the hell activator only when P2's gate opens. Verification gates before load-bearing copy: `--resume`-recomposes-profile cell, statusline API cells, plugin self-dose priced (D4), marketplace-from-monorepo layout. |
| D11 | **LOCKED** | **pi-heaven is the R&D vanguard; claude-heaven stays the flagship** (ratified 2026-07-20, RFC #68 addendum). pi's extension API can plausibly deliver the D10 surface at full fidelity (native widget, first-class commands, possibly extension-driven restart — the "magic switch" rung), so the interaction design is proven on pi first and ported down to Claude Code's restrictive plugin surface (D3 ladder; D1 unchanged: Claude Code remains reference harness, and marketing weight stays on `claude-heaven`). The B5 clean sandboxed pi doubles as pi-heaven's dev/test fixture. Caveats pending matrix rows on pinned 0.80.10: extension-API cells unverified; the `--no-skills` discovery race still blocks pi floor. |

## 4. Measurement & claims

| # | Status | Decision |
|---|---|---|
| B1 | **LOCKED** | **Doses are priced separately, never one number.** Per skill: standing (listing line) + invocation (full body). Per harness: the **harness dose** (`tokens.system`) — priced in the ledger and reports only, **never** in the Ygg II schema. |
| B2 | **LOCKED** | **Own-placebo anchoring.** The baseline is our own same-harness no-skill run; published benchmark scores are calibration only. (Issue #62's early "borrowed baseline / same seed" copy predates this — the methodology page and this doc win.) |
| B3 | **LOCKED** | **Determinism does not exist** in any target harness: N repeats + confidence intervals; the ledger validator rejects `seed`. |
| B4 | **LOCKED** | **The ledger is always on**; the claim-discipline table (master RFC §6.3) binds all public copy; **no claim ships ahead of its benchmark**; pivot trigger per MISSION §3 (if Hell doesn't net-save, Heaven becomes the hero). |
| B5 | **LOCKED** | **Benchmark arms run on clean sandboxed harness installs** (ratified 2026-07-19, PR #67, on the pi floor race): a user-configured local install is *not* the benchmark — it is native-posture evidence at best. Workstation runs (e.g. the `hh-m2-smoke` records) are smoke/demo evidence and say so in their notes. |

## 5. Governance & structure

| # | Status | Decision |
|---|---|---|
| G1 | **LOCKED** | **Canon (`gaia-skill-tree`) is read-only.** Schema changes route `gaia-research → marketing-tasks → gaia-skill-tree` as `needs-review` proposals. Stamps land **after** the benchmark and **after** epic #1002 (Ygg II). Four schema asks staged: marketing-tasks #126–#129; HH Index routing: #118. |
| G2 | **LOCKED** | **Stamps are discrete set-membership** (`heaven-native` / `auto@tier` / `hell-safe@tier`); routing is lookup, no arithmetic. The 0–100 `slider` float stays provisional until R2 shows signal beyond the stamps. |
| G3 | **LOCKED** | **This decision system** (2026-07-19): one accepted ratification doc per repo in `founder/`, everything else archived; public decisions here, **enterprise decisions in `marketing-tasks/founder/ENTERPRISE.md`**. Issues hold finalized sprints and not-yet-final RFCs; an RFC closes only when all its decisions close here. |

## 6. Open items (decide next — do not improvise these)

1. **N5 — one scale or two** (mode×level structure).
2. **N4 — ultra**: term survival + placement.
3. **Hell-lane level mapping** (which of `med…max` the hell lane occupies).
4. **Heaven-native dose budgets** (proposed: standing ≤120 / invocation ≤1,200 tokens — census-derived, unratified).
5. **Necessity-map lane taxonomy** (two lanes or three).
6. **Heaven persona name** (#120; candidates on the brand board).
7. **Shaping-doc §9 deltas** (M2 three-dose clause, M2a harness-dose census, M2b necessity map, ledger v2 fields, R1 rubric input, context-pack seed skills, harness-dose leaderboard) — each awaiting ratify/reject.
8. ~~Launcher repo name + installable/binary name~~ — **CLOSED 2026-07-20** by N8/N9/D10/D11 (RFC #68). The prior LEANING's hierarchy was inverted; see the supersession log.

## 7. Pointer map (where everything lives)

### gaia-research (public — research, benchmarks, launcher, site)

| Doc | Role |
|---|---|
| `founder/RATIFICATION.md` | **Decisions (this doc).** |
| `VISION.md` / `MISSION.md` | Public story + mission/roadmap (R0–R4). Slider language in VISION §3 pending rewrite per N1. |
| `docs/idea-bank/skill-heaven-hell-mvp.md` | Engineering findings record (eviction, doses, placebo, summoning). Its decision log is historical. |
| `docs/plans/skill-heaven-hell-mvp-plan.md` | M0–M5 implementation plan. |
| `docs/plans/m2-heaven-launcher-plan.md` | M2 handover plan (launcher profile compiler; implements D1/D6/D7). Closed 2026-07-20; historical record. |
| `docs/plans/skill-heaven-continuation-plan.md` | Post-naming continuation plan of record (consolidation sweep, monorepo restructure, D10 verification gates, claude-heaven slice 1, pi-heaven vanguard, session debts). |
| `docs/plans/skill-heaven-native-shaping.md` | WIP proposals for the next slice (third dose, necessity map, context pack). Proposals only. |
| `docs/labs/harness-capability-matrix.md` | M0 evidence: verified harness cells + GO verdict. |
| `content/reports/hh-benchmark/` | Methodology, R0 two-dose census, data. |
| `scripts/hell-heaven-bench/` | Benchmark code of record (`census.ts`, `ledger.ts`) + append-only run ledger. |
| Issue #62 | Public help-wanted sign (sprint container — stays open through the benchmark sprint). |

### marketing-tasks (private — ideas, assets WIP, undecided RFCs; chaotic allowed, never decisive)

| Doc | Role |
|---|---|
| `founder/ENTERPRISE.md` | **Enterprise decisions** (private lane oracle). |
| `deliverables/proposal/skill-heaven-hell-mvp-rfc.md` | Master RFC — consolidated plan of record; non-decisive where it lags this doc. |
| `deliverables/proposal/hell-heaven-meter-rfc.md` | HH Index schema RFC (stamps + provisional float). |
| `deliverables/proposal/ygg2-schema-asks/` + #126–#129, #118 | Staged canon asks (governance path). |
| `deliverables/ideas/IDEAS-2026-020.md` | Origin idea brief (slider language + seed language superseded; see its reconciliation note). |
| `research/hell-heaven-h1/` | H1 −97.4% standing-dose result. |
| `deliverables/proposal/byo-skill-tree-enterprise-brief.md` + personas board, #119–#121 | Enterprise brief; persona lane. |

### `gaia-research/skill-heaven` (named per N9 — the product monorepo)

Shared engine + per-harness installables (`claude-heaven`, `pi-heaven`, …) +
plugin marketplace; core `skill-heaven` bin is the research driver. Seeded from
the `hh-launcher` working checkout (working name retired). The M2 handover plan
(`docs/plans/m2-heaven-launcher-plan.md`) specifies what lands there vs. what
stays in `gaia-research`; naming RFC:
[gaia-research#68](https://github.com/gaia-research/gaia-research/issues/68)
(draft archived at `docs/plans/skill-heaven-naming-rfc-issue-draft.md`).

### Canon

`gaia-skill-tree` — read-only; epic **#1002 (Yggdrasil II)** is the stamp schema
target.

## 8. Supersession log

- **2026-07-20 (naming RFC #68 rulings)** — **N8** (scalpel positioning,
  context-bloat pain vocabulary, brand-name + symptom-tagline, harness-first
  mental model), **N9** (names: `gaia-research/skill-heaven` monorepo-as-
  marketplace; per-harness installables `claude-heaven`/`pi-heaven`/…; core bin
  = research driver; `/skill-heaven` + `/skill-hell`; `skill-heaven-hell`
  fallback retired), **D10** (awareness-first surface: native default +
  statusline dose readout; honest switch via relaunch-with-`--resume`; hell as
  locked door) and **D11** (pi-heaven vanguard / claude-heaven flagship)
  ratified from the owner's grilling-session rulings. **Open item 8 closed.**
  **Supersedes the prior item-8 LEANING's hierarchy**: the old framing made
  `skill-heaven` the flagship product with per-harness *extensions*; the
  harness-first ruling inverts it — the extensions ARE the user-facing product,
  `skill-heaven` is the engine, marketplace, and research instrument. Every
  name in the old leaning survives; what each name *denotes* changed. N4/N5
  explicitly decoupled from naming and remain OPEN. npm availability verified
  2026-07-19 (all five candidate names unclaimed).
- **2026-07-19 (evening, PR #67 rulings)** — **D8** (per-harness implementation,
  same outcome; in-harness plugins preferred; negative-findings ledger is
  first-class), **D9** (ratification + implementation share a PR) and **B5**
  (benchmark arms = clean sandboxed installs) ratified from the owner's PR #67
  blocker rulings. The T8 curated route's bundled-skills residual was **vetoed**
  and resolved the same day by the T9/T9b compositions
  (`CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1`; matrix M2 re-check table). Open
  item 8 gained the owner's LEANING naming direction (`skill-heaven` core +
  per-harness `*-heaven` extensions). Grok deferred pending research (beta;
  possibly SuperGrok-gated); owner confirmed the local `agent` binary is grok,
  not Cursor (G5).
- **2026-07-19 (later same day)** — **D6** (launcher = user-facing installable
  in its own repo; research/benchmarks/site stay in `gaia-research`) and **D7**
  (grok joins the harness scope) ratified by the owner. Open item 8 (launcher
  repo/binary name) added. M2 handover plan recorded at
  `docs/plans/m2-heaven-launcher-plan.md`.
- **2026-07-19** — Doc established. Consolidates and supersedes the decision
  logs in `docs/idea-bank/skill-heaven-hell-mvp.md` (owner decisions A/B/C),
  `docs/plans/skill-heaven-native-shaping.md` §1 (D1–D3), and the slider
  framing everywhere (N1). No prior ratification doc exists; `archived/` starts
  empty.
