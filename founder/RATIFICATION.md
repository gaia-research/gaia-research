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
> repo; violating one is a bug, not a decision. **CURRENT** — the working answer,
> held until the build says otherwise; **a failing test or a bad demo is
> sufficient to change it**, edited in the PR that discovered it, no session
> required. **OPEN** — undecided; do not invent an answer, flag it.
>
> ⚠️ **The status column is proposed, not ratified** (2026-07-24 rewrite). Every
> decision's *substance* below is preserved unchanged from the 2026-07-20
> revision — this was a compression, not a re-litigation. What is new is the
> INVARIANT/CURRENT split, which changes how easily an entry may be revised.
> **Owner ratifies the status column.** Until then, treat CURRENT as the prior
> LOCKED.

## 1. Naming & interaction model

| # | Status | Decision |
|---|---|---|
| N1 | **CURRENT** | **Modes, not a slider** — the product is discrete mode switching, and the entry mechanism never changes what a mode means. ⚠️ Conflicts with D12/D13, which mandate a posture slider; see OPEN 1. |
| N2 | **CURRENT** | Mode names are **"Skill Heaven mode"** and **"Skill Hell mode"** — the skill terms lead even where a mode also touches context or prompt. |
| N3 | **CURRENT** | Levels use agentic-coding terms: `off · low · med · high · xhigh · max`. No celestial level names. |
| N4 | **OPEN** | Whether **`ultra`** survives as a term, and where it sits. |
| N5 | **OPEN** | **One scale or two** — a single mode×level scale, or two independent dials. |
| N6 | **CURRENT** | The index is the **Hell Heaven (HH) Index**; schema key `hellHeaven`. Becomes INVARIANT once the canon ask lands upstream. |
| N7 | **INVARIANT** | **Milim is the Hell-mode persona.** The Heaven persona's name is reserved and undecided — **nothing may hard-code one**. Credit Matt Pocock for naming Skill Hell; the frame is "Stop installing. Start summoning." |
| N8 | **CURRENT** | **Positioning: scalpel, not door.** The user lives in a bare harness and reaches for this when it hurts. Pain vocabulary is **context bloat**; the name carries the brand, the tagline carries the symptom. Mental model is **harness-first** — never a `sudo`-style wrapper identity. |
| N9 | **INVARIANT** | **Names are settled**: the `skill-heaven` monorepo doubles as the plugin marketplace; user-facing installables are the **per-harness doors**; the core bin survives as the research driver. In-session commands `/skill-heaven` and `/skill-hell`. The extensions are the product and the core is the engine — not the inverse. Invariant because the repo exists and reversing it now costs more than it buys. |

## 2. Posture semantics

| # | Status | Decision |
|---|---|---|
| P1 | **CURRENT** | Four postures: **floor** (evict everything, zero server — the benchmark's placebo-of-record), **curated** (a hand-gated few, source-agnostic, the user's own skills first), **native** (untouched; the default), and the **hell lane** above native. ⚠️ The shipped set diverges from this; see OPEN 2. |
| P2 | **INVARIANT** | **Heaven ships first** — pure subtraction, no registry, no gate. **Hell and ultra are gated** behind benchmark stamps, a trust-coverage threshold, and owner ratification that Hell is safe to enable. |
| P3 | **INVARIANT** | **Modes are per-session, never a config mutation.** Compiled per invocation; project defaults with session overrides; nothing writes to shared config; exiting a mode is switching modes, never a restore. |
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
| D7 | **CURRENT** | **Grok is in the harness scope**, joining Claude Code, pi, Codex and Cursor. Every harness earns an empirical capability-matrix column on a pinned version; no cell is load-bearing until verified. |
| D8 | **CURRENT** | **Implementation differs per harness; the outcome must be the same.** Preference goes to in-harness plugins unless proven not to work. Corollary (rides B4): **a "will not work" ledger is as first-class as a "will work" one** — verified negative findings are recorded with the same rigor. |
| D9 | **INVARIANT** | **Ratification and implementation land in the same PR** — decisions are made as the work proceeds, so the decision record and the code embodying it travel together. This is the mechanism that keeps the two from drifting apart. |
| D10 | **CURRENT** | **Awareness-first surface, honest switch.** The flagship door boots at native posture and carries an ambient posture/dose readout — the readout is what creates the pain moment. `/skill-hell` is the **locked door**: status, ledger link, and "opens when Hell is proven safe." **No magic respawn** — the flagship interaction never rides an unverified capability. |
| D11 | **CURRENT** | **pi-heaven is the R&D vanguard; claude-heaven stays the flagship.** Interaction design is proven on pi's richer extension API first, then ported down to Claude Code's more restrictive plugin surface. Marketing weight stays on the flagship. |
| D12 | **CURRENT** | **Two doses, two mechanisms.** The **clean-room launcher** composes the fully-subtractive floor at boot and is the *only* path to it — that scarcity is the enticement. The **in-session scalpel** moves posture **upward only**, carrying conversation history, and cannot descend below its launch floor. **Binding UX honesty:** the lowest heaven-mode is presented **visibly locked to launcher mode**, and every fork that changes the session id discloses it. Evidence: matrix gate (a). **Re-verify on every harness upgrade** — the mechanism is undocumented and version-pinned. |
| D13 | **CURRENT** | **One ladder, two controls.** `/skill-heaven` is the active downward control, summonable anytime; `/skill-hell` stays the **locked door, shown in all modes**. Two downward mechanisms, kept architecturally separate: **physical purge is launcher-locked** (gate (a) proved it cannot happen in-session), while **behavioral restraint** suppresses skill *use* without purging — in-session, ungated, works even on a vanilla harness, but **UNVERIFIED**, behind matrix gate (e), with no load-bearing copy until it passes. On a vanilla harness the lower notches render **visibly locked** with an explicit route to the launcher. |

## 4. Measurement & claims

| # | Status | Decision |
|---|---|---|
| B1 | **INVARIANT** | **Doses are priced separately, never one number** — standing, invocation and harness dose each stated on its own. The harness dose is priced in the ledger and reports only, never in the canon schema. |
| B2 | **INVARIANT** | **Own-placebo anchoring.** The baseline is our own same-harness no-skill run; published benchmark scores are calibration only, never the baseline. |
| B3 | **INVARIANT** | **Determinism does not exist** in any target harness: N repeats plus confidence intervals. The ledger validator rejects a fixed-run field. |
| B4 | **INVARIANT** | **The ledger is always on**, the claim-discipline table binds all public copy, and **no claim ships ahead of its benchmark**. If Hell does not net-save, Heaven becomes the hero. |
| B5 | **INVARIANT** | **Benchmark arms run on clean sandboxed harness installs.** A user-configured local install is native-posture evidence at best; workstation runs are smoke evidence and must say so. |

## 5. Governance & structure

| # | Status | Decision |
|---|---|---|
| G1 | **INVARIANT** | **Canon is read-only.** Schema changes route through the private lane as reviewable proposals. Stamps land after the benchmark. |
| G2 | **CURRENT** | **Stamps are discrete set-membership**; routing is lookup, no arithmetic. The numeric float stays provisional until the research shows signal beyond the stamps. |
| G3 | **INVARIANT** | **This decision system**: one accepted ratification doc per repo in `founder/`, everything else archived. Public decisions here, enterprise decisions in the private lane. An RFC closes only when all its decisions close here. |

## 6. Open items — do not improvise these

1. **Vocabulary conflict: N1 vs. D12/D13.** N1 supersedes the slider framing; D12/D13 mandate a posture slider. Neither acknowledges the other. Recorded in the lexicon as a parked term.
2. **Posture-set collision.** The shipped set does not match P1's four. Proposal on the table: two of the shipped stops are not rungs but **axes** — stacking add-ons is an action available at *any* posture, and behavioral restraint is behavioral, not positional.
3. **N5** — one scale or two. **N4** — whether `ultra` survives, and where.
4. **Hell-lane level mapping** — which upper levels the hell lane occupies. Encoding a provisional mapping in a constant is a decision made by omission; do not.
5. **Product floor vs. benchmark floor.** Suppressing slash commands at the deepest floor leaves it with no controls at all. Proposal: keep the doorless floor as the benchmark's placebo-of-record and ship a *doorful* product floor, priced as a separate arm.
6. **Heaven's definition** — deliberately reopened.
7. **Heaven-native dose budgets** · **necessity-map lane taxonomy** · **Heaven persona name** · **shaping-doc deltas** — each awaiting ratify/reject.
8. **D5's boundary.** Does a model-issued `summon` after a deterministic search breach "no model decides a loadout"? Candidate reframe: make the budget deterministic, so the enforceable rule becomes *no model decides how much*.
9. **`gauge` collision** — one word doing duty for both per-skill stamps and session spend meters.
10. **Eager vs. on-demand** — likely a toggle orthogonal to the ladder, not a rung on it.
11. **`ultra` in a frozen ledger key.** N4 is OPEN, but the key is frozen by D6; renaming it would invalidate committed records.

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
