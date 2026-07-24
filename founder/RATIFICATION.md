# RATIFICATION — Skill Heaven / Skill Hell (the oracle)

> **Decisions only.** What the words mean lives in
> [`lexicon.json`](./lexicon.json); what was measured lives in
> [`../docs/labs/harness-capability-matrix.md`](../docs/labs/harness-capability-matrix.md).
> Where any other doc disagrees with this one, **this doc wins**.
>
> **This doc contains no number, no version, and no method.** If a cell needs
> one it is citing evidence, and the evidence belongs in the matrix. That rule
> exists because the previous revision fused the two: D12 carried token counts,
> a pinned CLI version and probe methodology inside its ruling, so it had to be
> rewritten every time the evidence moved — and each rewrite coined new words.
> The supersession log had grown 2.9× longer than the section defining what the
> product is.
>
> **Statuses.** **INVARIANT** — breaking it costs credibility, money, or another
> repo; violating one is a bug, not a decision. **CURRENT** — **decided on
> tradeoffs, with or without evidence.** Deciding early is the point: a CURRENT
> entry does not wait for proof, it commits so the work can proceed, and it is
> revised when evidence is *strongly* against it — in the PR that found the
> evidence, no session required. **OPEN** — undecided; do not invent an answer,
> flag it.
>
> **Entries that did not survive contact are deleted outright**, not annotated
> into permanent hedging. Re-deciding later is cheap and expected; a long
> qualification is what makes a doc unreadable. **Ids are never reused** — a
> deleted id stays dead so old references resolve to nothing rather than to
> something new.
>
> ⚠️ **The status column is proposed, not ratified** (2026-07-24). **Owner
> ratifies it.** Until then, treat CURRENT as the prior LOCKED.
>
> **Retired ids — never reused:** **D7** (grok in harness scope — coverage, not
> a decision; the matrix owns it) · **D10** (awareness-first surface — its
> relaunch mechanism was falsified by D12) · **D11** (pi-vanguard sequencing —
> a preference with no reversal cost) · **D13** (one-ladder-two-controls — half
> of it sat behind a gate that has never run). Deleted 2026-07-24 after review;
> the reasoning is in git and in the archived plans. Any of them may be
> re-decided at any time, and would take a new id.

## 1. Naming & interaction model

| # | Status | Decision |
|---|---|---|
| N1 | **CURRENT** | **Modes plus a ladder.** The product is discrete **mode switching**, and within a mode a **ladder** sets how much enters context. The entry mechanism never changes what a mode means. The control is a ladder with discrete rungs — never a continuous fader. |
| N2 | **CURRENT** | Mode names are **"Skill Heaven mode"** and **"Skill Hell mode"** — the skill terms lead even where a mode also touches context or prompt. |
| N3 | **CURRENT** | Levels use agentic-coding terms: `off · low · med · high · xhigh · max`. No celestial level names. |
| N4 | **CURRENT** | **`ultra` survives**, as the arm above Hell — a **mode**, not a rung (the ladder's top rung is `max`). This is also what the ledger's frozen arm key already assumes, so nothing migrates. ⚠️ The mode-not-rung placement is inferred from P5, not ruled outright; correct freely. |
| N5 | **CURRENT** | **Two dials, not one scale**: mode (Heaven · Hell · Ultra) × ladder rung (`off…max`). ⚠️ Inferred from P5 rather than ruled on directly; correct freely. |
| N6 | **CURRENT** | The index is the **Hell Heaven (HH) Index**; schema key `hellHeaven`. Becomes INVARIANT once the canon ask lands upstream. |
| N7 | **INVARIANT** | **Milim is the Hell-mode persona.** The Heaven persona's name is reserved and undecided — **nothing may hard-code one**. Credit Matt Pocock for naming Skill Hell; the frame is "Stop installing. Start summoning." |
| N8 | **CURRENT — INCOMPLETE** | **Positioning: scalpel, not door.** The user lives in a bare harness and reaches for this when it hurts. Pain vocabulary is **context bloat**; the name carries the brand, the tagline carries the symptom. Mental model is **harness-first** — never a `sudo`-style wrapper identity. ⚠️ **Covers the moment of reach only.** It says nothing about what the user does once inside, how they learn where they are, or what an honest refusal feels like — scenarios that surfaced in skill-heaven#4. See OPEN 12. |
| N9 | **INVARIANT** | **Names are settled**: the `skill-heaven` monorepo doubles as the plugin marketplace; user-facing installables are the **per-harness doors**; the core bin survives as the research driver. In-session commands `/skill-heaven` and `/skill-hell`. The extensions are the product and the core is the engine — not the inverse. Invariant because the repo exists and reversing it now costs more than it buys. |

## 2. Posture semantics

| # | Status | Decision |
|---|---|---|
| P1 | **CURRENT** | Four postures: **floor** (evict everything, zero server — the benchmark's placebo-of-record), **curated** (a hand-gated few, source-agnostic, the user's own skills first), **native** (untouched; the default), and the **hell lane** above native. ⚠️ The shipped set diverges from this; see OPEN 2. |
| P2 | **INVARIANT** | **Heaven ships first** — pure subtraction, no registry, no gate. **Hell and ultra are gated** behind benchmark stamps, a trust-coverage threshold, and owner ratification that Hell is safe to enable. |
| P3 | **INVARIANT** | **Modes are per-session, never a config mutation.** Compiled per invocation; project defaults with session overrides; nothing writes to shared config; exiting a mode is switching modes, never a restore. |
| P5 | **CURRENT** | **Hell is summonable skills, per session only.** A summoned skill is a **proxy that enters context on demand, once** — it does **not** survive a compact or a new session, and **nothing is installed**, so the user's default configuration is never touched. The **ladder** sets how much may be summoned per task and how much of the choosing is automated; the **router** picks which (D5), and the user may summon their own favourites directly. At the top rung the largest suites enter and **cannot be removed for the rest of the session** — a one-way door inside the session, never outside it (P3). The aim is outstanding per-session skill intake for the hardest tasks, which is why it demands a capable agent to navigate. ⚠️ "Does not survive a compact" is a behaviour claim with no probe behind it yet; see OPEN 3. |
| P4 | **CURRENT** | **Heaven's deliverable is context authorship** — the empowerment lane. Subtraction is Heaven's floor, not its ceiling. |

## 3. Delivery & mechanism

| # | Status | Decision |
|---|---|---|
| D1 | **CURRENT** | M2 ships the **launcher-shaped profile compiler** over verified in-harness flags, with zero shared-state mutation. A native in-harness mode is a future iteration. Claude Code is the reference harness; pi second; other harnesses get documented recipes. |
| D2 | **INVARIANT** | **Eviction is harness-side, never an MCP operation** — MCP is additive-only in every target harness. Building on the opposite wastes everything downstream. |
| D3 | **CURRENT** | **Managed surfaces carry the summon side only** for the MVP — no session-boot control there. The full mode ladder on every surface remains the north star; each surface climbs as its capabilities allow. |
| D4 | **CURRENT** | `gaia-mcp` keeps a **≤2-tool surface** (`search_skills`, `summon`); its own schema footprint is measured and subtracted in every claim. Heaven's purest form uses no server at all. |
| D5 | **INVARIANT** | **Routing is deterministic and performance-first** — nearest-neighbour over a build-time frozen, versioned index with a version handshake; ranked and origin skills sort first; **no model call ever decides a loadout**. ⚠️ Its boundary is contested; see OPEN 8. |
| D6 | **INVARIANT** | **The ledger-of-record and its validator never move.** Research, benchmarks, the capability matrix and the site stay in `gaia-research`; the product repo consumes the record shapes and the pricing discipline. Cross-repo contract. |
| D8 | **CURRENT** | **Implementation differs per harness; the outcome must be the same.** |
| D9 | **INVARIANT** | **Ratification and implementation land in the same PR** — decisions are made as the work proceeds, so the decision record and the code embodying it travel together. This is the mechanism that keeps the two from drifting apart. |
| D12 | **CURRENT** | **The subtractive floor is reachable only at boot.** An in-session control can move posture upward (additive) and carry conversation history, but cannot descend below its launch composition — subtractive recomposition and history survival are mutually exclusive. Evidence: matrix gate (a). **Re-verify on every harness upgrade** — the mechanism is undocumented and version-pinned. |

## 4. Measurement & claims

| # | Status | Decision |
|---|---|---|
| B1 | **INVARIANT** | **Doses are priced separately, never one number** — standing, invocation and harness dose each stated on its own. The harness dose is priced in the ledger and reports only, never in the canon schema. |
| B2 | **INVARIANT** | **Own-placebo anchoring.** The baseline is our own same-harness no-skill run; published benchmark scores are calibration only, never the baseline. |
| B3 | **INVARIANT** | **Determinism does not exist** in any target harness: N repeats plus confidence intervals. The ledger validator rejects a fixed-run field. |
| B4 | **INVARIANT** | **The ledger is always on**, the claim-discipline table binds all public copy, and **no claim ships ahead of its benchmark**. A **"will not work" ledger is as first-class as a "will work" one** — verified negative findings are recorded with the same rigor. If Hell does not net-save, Heaven becomes the hero. |
| B5 | **INVARIANT** | **Benchmark arms run on clean sandboxed harness installs.** A user-configured local install is native-posture evidence at best; workstation runs are smoke evidence and must say so. |

## 5. Governance & structure

| # | Status | Decision |
|---|---|---|
| G1 | **INVARIANT** | **Canon is read-only.** Schema changes route through the private lane as reviewable proposals. Stamps land after the benchmark. |
| G2 | **CURRENT** | **Stamps are discrete set-membership**; routing is lookup, no arithmetic. The numeric float stays provisional until the research shows signal beyond the stamps. |
| G3 | **INVARIANT** | **This decision system**: one accepted ratification doc per repo in `founder/`, everything else archived. Public decisions here, enterprise decisions in the private lane. An RFC closes only when all its decisions close here. |

## 6. Open items — do not improvise these

1. **Posture-set collision.** The shipped set does not match P1's four. Proposal on the table: two of the shipped stops are not rungs but **axes** — stacking add-ons is an action available at *any* posture, and behavioral restraint is behavioral, not positional.
2. **Compaction survival (needs a probe).** P5 asserts a summoned skill does
   not survive a compact or a new session. That is the honesty claim the whole
   per-session promise rests on, and nothing has measured it. Needs its own
   matrix gate before any load-bearing copy.
3. **Hell-lane rung mapping** — which rungs the hell lane occupies, now that
   N5 fixes the axes. Encoding a provisional mapping in a constant is a
   decision made by omission; do not.
4. **Product floor vs. benchmark floor.** Suppressing slash commands at the deepest floor leaves it with no controls at all. Proposal: keep the doorless floor as the benchmark's placebo-of-record and ship a *doorful* product floor, priced as a separate arm.
5. **Heaven's definition** — deliberately reopened.
6. **Heaven-native dose budgets** · **necessity-map lane taxonomy** · **Heaven persona name** · **shaping-doc deltas** — each awaiting ratify/reject.
7. **D5's boundary.** Does a model-issued `summon` after a deterministic search breach "no model decides a loadout"? P5 narrows it usefully — the **ladder** is deterministic and sets *how much*, the router sets *which*, so the enforceable rule may simply be **no model decides how much**. Not yet ruled.
8. **`gauge` collision** — one word doing duty for both per-skill stamps and the session meter.
9. **Eager vs. on-demand** — likely a toggle orthogonal to the ladder, not a rung on it.
10. **Completing N8.** The positioning covers the moment of reach and nothing
    after it. Four scenarios surfaced in skill-heaven#4 that it does not
    address: **posture adjustment** (moving between postures mid-work),
    **capability discovery** (learning where this session sits and what moves
    it), **clean-room access** (launcher-unlocked vs. the vanilla locked
    upsell), and **refusal transparency** (an explicit, honest refusal at gated
    levels rather than a false sense of access). N8 is not wrong; it is
    unfinished.
(Closed 2026-07-24: modes-or-a-ladder → N1 · `ultra` survives → N4 · one scale
or two → N5 · `ultra` in the frozen ledger key — no longer a conflict, N4 keeps
the arm name the ledger already uses.)

## 7. Pointer map

| Doc | Role |
|---|---|
| `founder/RATIFICATION.md` | **Decisions (this doc).** |
| `founder/lexicon.json` · `founder/LEXICON.md` | **Vocabulary of record**, enforced in CI. |
| `docs/labs/harness-capability-matrix.md` | **Evidence** — verified cells, probe routes, gates (a)–(e). |
| `content/reports/hh-benchmark/` | Methodology, census, data. |
| `scripts/hell-heaven-bench/` | Benchmark code of record + append-only run ledger. |
| `docs/plans/skill-heaven-hell-mvp-plan.md` | M0–M5 implementation frame. |
| `docs/plans/archived/` · `docs/idea-bank/archived/` · `content/reports/skill-heaven/archived/` | Frozen records. Never edited; excluded from the vocabulary gate. |
| Issue #62 | Public help-wanted sign. |

The private lane (ideas, undecided RFCs, enterprise decisions, the persona
board) and canon (read-only; the stamp-schema target) sit outside this repo per
G1/G3.

## 8. Supersession log

**`git log -p founder/RATIFICATION.md` is the supersession log.** Only reversals
of a **publicly shipped claim** are written here — those need an audit trail a
reader can find. Internal changes of mind do not, and writing them all down is
what made the previous log longer than the decisions themselves.

- **2026-07-22 — D12's "fork recomposes subtractively" claim was falsified.**
  The original finding came from an unreliable probe method; a deterministic
  re-probe reversed it. Subtractive recomposition and conversation-history
  survival are mutually exclusive, so the floor is launcher-locked. The claim
  had reached planning docs before it was caught. Evidence and full audit
  trail: matrix gate (a).
