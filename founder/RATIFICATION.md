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
| N7 | **INVARIANT** | **Milim is Gaia Research's lab mascot, not the Skill Heaven / Skill Hell persona.** The line's design is final; its public persona name remains reserved, and `Lucy` is only a parked internal working name. Credit Matt Pocock for naming Skill Hell; the frame is "Stop installing. Start summoning." |
| N8 | **CURRENT** | **Positioning: scalpel, not door.** The user lives in a bare harness and reaches for this when it hurts. Pain vocabulary is **context bloat**; the name carries the brand, the tagline carries the symptom. Mental model is **harness-first** — never a `sudo`-style wrapper identity. **After the reach, the in-session surface is a truthful map, bound by one rule: never claim a transition the harness cannot perform.** Four readings of that rule: **capability discovery** — the surface states where the session sits and what it costs, claimed from the launch record and never guessed; a session with no record gets no readout. **Posture adjustment** — the surface explains the moves and offers only those the harness can perform, upward in-session, downward only at boot (D12); every command it prints must be one the tool accepts. **Clean-room access** — the clean room and the product floor are one posture under two names, and neither name retires the other; it is unlocked only for a session that launched there, and everywhere else a visibly locked upsell that states its reason and never a command the tool then refuses (which mechanism opens it is OPEN 11). **Refusal transparency** — a gated target gets an explicit, honest refusal that names the gate (P2), and a posture name the engine knows is answered honestly, never rendered as an unknown word. |
| N9 | **INVARIANT — AMENDED BY N11** | **Original door/repo split is superseded by the Skill Zero split.** The `skill-heaven` monorepo direction became the `gaia-skill-heaven` umbrella repo; per-harness door names moved from `*-heaven` to `*-zero`; `/skill-hell` remains the explore summon command. |
| N10 | **CURRENT** | <!-- lexicon-allow --> **A ban retires a word, not the method it named.** Two terms coined in matrix gate (a) are retired as vocabulary: `lean` and `add-ons`. The mechanisms they described are untouched — `--setting-sources project` still composes, and stacking still works at every posture (route G) — but neither keeps its name. **Naming stays open:** no successor is ratified for either, and `project-only` was the standing proposal for `lean` and is **not** adopted by this entry. A banned term with no successor must declare `"naming": "open"` in the lexicon rather than leave `replacement` empty, so an omission can never read as a ruling. Consequence for writers: **rephrase, do not substitute.** |
| N11 | **CURRENT** | <!-- lexicon-allow --> **Skill Zero split (2026-08-11).** Amends N8/N9 and narrows P2/P4. "Skill Heaven" was doing triple duty — umbrella brand, clean-slate **launcher**, and one pole of the behavioral axis. This entry separates them. **(1) Launcher named.** The clean-slate launcher is **Skill Zero** — a deep, standalone, now-complete prototype module living inside the umbrella repo. It is what severs the skill catalogue to zero and restores the user's own skills. **(2) Repo/brand.** `gaia-research/skill-heaven` → **`gaia-research/gaia-skill-heaven`**, the umbrella runtime brand (ecosystem `gaia-*` prefix; brand preserved). The launcher engine (`packages/core`) publishes as npm **`skill-zero`** (bin `skill-zero`). **(3) Doors.** `claude-heaven`/`pi-heaven`/`codex-heaven`/`hermes-heaven`/`grok-heaven` → **`claude-zero`/`pi-zero`/`codex-zero`/`hermes-zero`/`grok-zero`**. User-facing door commands stay short; only repos carry `gaia-`. **(4) Axis freed.** **Heaven and Hell are summon directions** on the behavioral axis — Heaven = converge/curated summon, Hell = explore/expand summon — and **Ultra is the auto-switch** between them; the **HH Index** over that axis stays in `gaia-research`, marked **WIP**. Never again a launcher or repo name. **(5) Inversion fixed.** The doc's "Heaven is subtraction / strips context / evicts / clean floor" framing (P2, P4) describes **Skill Zero**, not Heaven — subtraction / strip / evict / floor / clean-room is the launcher; Heaven-mode is the converge summon. **(6) `skill-hell` unchanged.** It stays the explore-direction summon CLI in `gaia-mcp`; only outward references to the old `skill-heaven` name/URL are fixed. A future `skill-heaven` (converge) summon that makes summon bidirectional is noted, not built. **(7) Lexicon.** `gaia.zero` is carved out of `gaia.heaven` (both owned by this HQ; `gaia-skill-heaven` consumes). **Tracking:** see the Skill Zero rename RFC and [`gaia-research/gaia-skill-tree#1509`](https://github.com/gaia-research/gaia-skill-tree/issues/1509), plus [`../docs/plans/2026-08-11-skill-zero-rename-rfc-issue-draft.md`](../docs/plans/2026-08-11-skill-zero-rename-rfc-issue-draft.md); operational plan in `gaia-skill-tree/founder/handovers/2026-08-11-skill-zero-rename.md`. Ships with the first implementation PR (D9). |

## 2. Posture semantics

| # | Status | Decision |
|---|---|---|
| P1 | **CURRENT** | Four postures: **floor** (evict everything, zero server — the benchmark's placebo-of-record), **curated** (a hand-gated few, source-agnostic, the user's own skills first), **native** (untouched; the default), and the **hell lane** above native. ⚠️ The shipped set diverges from this; see OPEN 1. `curated` is refined by **P6**; the floor vocabulary by **P7**, and the two floors' KINDS by **P8**. |
| P2 | **INVARIANT — AMENDED BY N11** | **Skill Zero ships first** — the complete subtractive launcher prototype, no registry, no gate. **Hell and ultra are gated** behind benchmark stamps, a trust-coverage threshold, and owner ratification that Hell is safe to enable; Heaven is now the converge summon direction, not the subtractive launcher. |
| P3 | **INVARIANT** | **Modes are per-session, never a config mutation.** Compiled per invocation; project defaults with session overrides; nothing writes to shared config; exiting a mode is switching modes, never a restore. |
| P5 | **CURRENT** | **Hell is summonable skills, per session only.** A summoned skill is a **proxy that enters context on demand, once** — it does **not** survive a compact or a new session, and **nothing is installed**, so the user's default configuration is never touched. The **ladder** sets how much may be summoned per task and how much of the choosing is automated; the **router** picks which (D5), and the user may summon their own favourites directly. At the top rung the largest suites enter and **cannot be removed for the rest of the session** — a one-way door inside the session, never outside it (P3). The aim is outstanding per-session skill intake for the hardest tasks, which is why it demands a capable agent to navigate. ⚠️ "Does not survive a compact" is a behaviour claim with no probe behind it yet; see OPEN 3. |
| P4 | **CURRENT — AMENDED BY N11** | **Heaven's deliverable is context authorship** — the empowerment lane for converge/curated summon. The subtractive floor/clean-slate is **Skill Zero**, the launcher; do not define Heaven as stripping, evicting, or floor-reaching. |
| P6 | **CURRENT** | **`curated` is a personal-profile posture, not a measured arm.** A clean base plus a hand-picked **fraction of the user's own skills**, named explicitly at launch. Intended to be **onboardable and personalizable**, with skills optionally sourced via **gaia mcp**, and **saved as a personal profile**. **Because it is personalized, it is not measured** — the measured arms are three and curated is not among them (see P7). Refines P1's "a hand-gated few, source-agnostic, the user's own skills first": *"the user's own skills first"* means **explicit selection** via `--skill <path>`, NOT ambient project scope. Composition therefore passes `--setting-sources ''` — an **empty value, not the flag omitted** (omitting it restores the full listing). `doctor` is the single disclosed residual, an upstream harness limitation ruled acceptable. **NOT LOCKED** — amendable as the product shape settles. Arc I ships the composition only; onboarding, profile persistence and MCP-sourced skills belong to later arcs (gaia mcp is Program 4, Arc III). |
| P7 | **CURRENT — NARROWED BY P8** | **The floor names are equivalent terms within error margin.** `floor`, `product-floor` and `clean-room` name one region, not three: the door is **+515 tok on ~20k (F7), about 2.6%**. This extends N8's "clean room and product floor are one posture under two names" to include the benchmark `floor` **for vocabulary purposes**. ⚠️ **SCOPE — vocabulary only, and B2 is NOT amended.** B2 (INVARIANT) requires the baseline be *"our own same-harness **no-skill** run"*, and measurement on claude 2.1.220 (2/2 byte-identical, 2026-07-30) shows only the doorless `floor` reaches `skills=[]`; `product-floor` reaches `["doctor"]` plus any project-scope skills in cwd. **The doorless floor therefore remains the placebo-of-record and the two are not interchangeable as arms.** Why two exist at all is mechanical, not a design choice: `--disable-slash-commands` is simultaneously what empties the listing and what removes the door (F6), so *"zero skills plus a door"* is not a state the harness can produce. The doorless floor also cannot be retired once measured — `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` is undocumented and version-pinned, so +515 must stay re-derivable. **Open consequence:** `product-floor` currently inherits project scope, so `clean-room` is not yet an accurate name for it, and that leak is **not** coverable by an error margin — it scales with the user's repo rather than being a constant. Fixing it re-derives F7 and is a pending founder call. |
| P8 | **CURRENT** | **Two floors, two KINDS — and the probe's job is to FIND the nearest zero, not to ratify a felt one.** `floor` is **absolute zero**: the theoretical bottom, a **ruler**, not a product state. `product-floor` is **"off"**: *whatever the harness can actually be launched at, nearest to zero.* **"Off" is therefore a MEASURED, PER-HARNESS quantity, not a fixed composition** — each harness has its own nearest-achievable zero and it must be discovered by probing downward until nothing further can be evicted, then recording what remains. **Consequences.** (1) A launchable floor composition that is NOT the nearest achievable zero is a **defect by definition**, not a judgment call — if a nearer state is measurable, the current one is disqualified. (2) On claude, "off" is empirically **`["doctor"]`**: `--setting-sources ''` reaches it, and `doctor` is irreducible while slash commands remain, since the flag that evicts it (`--disable-slash-commands`) is the flag that removes the door (F6). That is a *finding*, not a concession. (3) The `floor`→`product-floor` delta is **the price of being launchable at all**, which is what F7's +515 actually measures. (4) `LEVEL_ALIASES` currently maps `off`→`floor`; under this entry `off` belongs on `product-floor`, and the present mapping points at the one posture the door refuses to launch. (5) A cell asserted rather than probed is the exact error this entry forbids — `compileCodex` claimed `$CODEX_HOME` yields an empty skills surface and the probe found **74 skills**; cursor's composition has never been probed at all. **AUDIENCE SPLIT (founder, 2026-07-30) — the two live on opposite sides of the product line.** **`off` is PRODUCT vocabulary**: it is the word for the lowest point a user can actually launch at, and it is the name that belongs on user-facing surfaces. **Absolute zero (`floor`) is OURS — internal and benchmarking only, and NOT a product concept.** It must never be offered as a row, named in public copy, or presented as something a user can choose; it exists so we have a ruler. This is already partly honored — `render-posture.mjs` deliberately gives the benchmark floor no row, and `LAUNCHABLE_POSTURES` omits it — and `LEVEL_ALIASES` is the outstanding contradiction, since it points the product word `off` at the internal instrument. **Narrows P7:** the two floors are equivalent in MAGNITUDE (2.6%) but different in KIND, and P7's "equivalent terms" must not be read as making them interchangeable. B2 is untouched: the placebo-of-record stays absolute zero. |

## 3. Delivery & mechanism

| # | Status | Decision |
|---|---|---|
| D1 | **CURRENT** | M2 ships the **launcher-shaped profile compiler** over verified in-harness flags, with zero shared-state mutation. A native in-harness mode is a future iteration. Claude Code is the reference harness; pi second; other harnesses get documented recipes. |
| D2 | **INVARIANT** | **Eviction is harness-side, never an MCP operation** — MCP is additive-only in every target harness. Building on the opposite wastes everything downstream. |
| D3 | **CURRENT** | **Managed surfaces carry the summon side only** for the MVP — no session-boot control there. The full mode ladder on every surface remains the north star; each surface climbs as its capabilities allow. |
| D4 | **CURRENT** | The thin Heaven/Summon profile uses `search_skills` and `summon`; its own schema footprint is measured and subtracted in every claim. This profile does not retire or describe the separately published Registry/Bond package surface. Heaven's purest form uses no server at all. |
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

1. <!-- lexicon-allow --> **Posture-set collision.** The shipped set does not match P1's four. Proposal on the table: two of the shipped stops are not rungs but **axes** — stacking add-ons is an action available at *any* posture, and behavioral restraint is behavioral, not positional. (The word `add-ons` is retired by N10; the action it names is what this open item is about, and stays open.)
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
10. **Completing N8 — closed 2026-07-29.** The four post-reach scenarios
    surfaced in skill-heaven#4 (posture adjustment, capability discovery,
    clean-room access, refusal transparency) are ruled into N8's cell. The one
    fork this item surfaced that remains undecided is item 11. Closed inline,
    keeping its number: renumbering this list is what left N8 pointing at a
    phantom "OPEN 12" — item numbers are never reused or shifted from here on.
11. **Clean-room access mechanism.** The clean room is positioned as a locked
    upsell that states its reason and carries no command — nothing composes it
    yet. Two honest resolutions surfaced in the implementation: **stop offering
    it on the control surface**, or **widen what the launcher accepts** so a
    door exists.
    Widening is a product decision, not a copy edit; until ruled, no surface
    may print a relaunch to it (N8's binding rule).
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

- **2026-08-09 — N7's Milim-as-line-persona ruling is reversed.** Milim remains Gaia Research's lab mascot; the Skill Heaven / Skill Hell line retains its own final design with a reserved public name and parked internal working name `Lucy`.
- **2026-07-22 — D12's "fork recomposes subtractively" claim was falsified.**
  The original finding came from an unreliable probe method; a deterministic
  re-probe reversed it. Subtractive recomposition and conversation-history
  survival are mutually exclusive, so the floor is launcher-locked. The claim
  had reached planning docs before it was caught. Evidence and full audit
  trail: matrix gate (a).
