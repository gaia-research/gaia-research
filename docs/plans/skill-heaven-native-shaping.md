# Heaven-Native — Shaping Draft (third dose, the ladder, the context pack)

> **Status: WIP proposals only. Decision authority:
> [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md)** — §1 below is a
> mirror of decisions now consolidated there; §9's deltas are open items
> (oracle §6.7). Naming note: this doc's "Heaven-0/Heaven-1" shorthand predates
> oracle N3 (levels use agentic terms `off·low·med·high·xhigh·max`; modes lean
> "Skill Heaven / Skill Hell mode" per N2; slider framing superseded by mode
> switching per N1). Brainstorm output (2026-07-19, continued same day),
> shaped against the ratified corpus after Slice 1 (PR #64) and now **reconciled
> against the marketing-tasks side**: master RFC
> (`marketing-tasks/deliverables/proposal/skill-heaven-hell-mvp-rfc.md`), the
> originating idea brief (`marketing-tasks/deliverables/ideas/IDEAS-2026-020.md`),
> and the HH Index RFC (`hell-heaven-meter-rfc.md`). Reconciliation verdicts in §10.
> Companions: [`skill-heaven-hell-mvp-plan.md`](./skill-heaven-hell-mvp-plan.md),
> [`../idea-bank/skill-heaven-hell-mvp.md`](../idea-bank/skill-heaven-hell-mvp.md),
> `VISION.md` / `MISSION.md`, [`../labs/harness-capability-matrix.md`](../labs/harness-capability-matrix.md).
> This doc edits no ratified text; RFC amendments are staged asks (§10.2), routed
> via marketing-tasks per governance.

## 0. What this shapes, in one breath

Slice 1 proved Heaven's *skill* story: eviction is in-harness, per-session, and
measurable. This draft extends the same discipline to the thing Slice 1 left as
`null` in every ledger record — **`tokens.system`, the harness's own prompt** —
and it turns out that was the original scope all along: IDEA-2026-020's Phase 0
instrumentation lists "system-prompt tokens" first. The draft proposes (a) the
**harness dose** as a third priced dose, (b) a **necessity map** that makes "bare
necessities" a measured set instead of a vibe, (c) the owner-ratified
**four-position ladder** (§1/§5), (d) **heaven-native = context-contributing** as
the testable rubric input for the HH Index `heaven-native` stamp, and (e) the
**context pack** as Heaven's deliverable — the artifact that makes Heaven the
authoring half of Hell's autonomy, not just a quieter room.

## 1. Decision log — 2026-07-19 (mirror — authority: [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md))

- **(D1) The launcher ships M2; in-harness-native is a future iteration.** The M2
  vehicle is the `claude-heaven`-shaped **profile compiler**: launcher UX on the
  outside, M0-verified in-harness mechanics on the inside (`--disable-slash-commands`,
  `--plugin-dir` / scoped `CLAUDE_CONFIG_DIR`, session-only `--settings`; pi:
  `--no-skills --skill`). It composes flags and execs — it never stashes, restores,
  or mutates shared state, so AT-H1/AT-H2 still pass by construction. A true
  `--heaven-mode` inside the harness waits until the open engineering caveats
  clear (plugin-suppression interplay, prompt-control cells §2). This refines
  decision A and matches RFC §6.1 ("final flag name follows the M2 winner").
- **(D2) The ladder.** Postures are four positions, bottom half pinned to the
  effort dial: **Heaven-0 (`off`) → Heaven-1 (`low`) → Native (user-custom,
  as-is) → the Hell lane** (Ultra and Hell, gated, upper tiers). Details §5.
- **(D3) Connector catch accepted — with the full slider as north star.** For the
  MVP, managed surfaces (claude.ai connector) carry the **summon side only**
  (finding 1: eviction is not an MCP operation; no session-boot control there).
  The VISION remains a full slider on every surface — each surface climbs to the
  full ladder as its boot-time capabilities allow. MVP scoping, not a vision cut.

## 2. The third dose: harness dose

Ratified finding 2 split `contextCost` into standing + invocation doses. Both
price *skills*. But every session pays a third dose before the first user word:
the harness system prompt, tool schemas, env preamble, feature documentation.
Ledger schema v1 already reserves the slot (`tokens.system`) — every real record
to date carries `null`, honestly, because nothing measures or targets it yet.

- **Provenance.** This is not new scope: IDEA-2026-020 Phase 0 ("token-accounting
  wrapper: **system-prompt tokens**, per-turn tokens, skill-load tokens, $/task")
  had it from the start; the ratified corpus later narrowed to skill doses. The
  third dose *restores* Phase 0, now under Slice-1 discipline.
- **Definition.** `harness dose` = input tokens a `harness@version` charges on a
  null task with zero skills loaded — decomposable (tool schemas vs. prose) by
  toggling verified flags (e.g. T1's `--tools ""` drops the Skill listing).
- **Where it lives.** In the **ledger and reports only** — never in the Ygg II
  schema. Skills own their two-dose `contextCost` (HH Index RFC §2a); no skill
  owns the harness's prompt. No new canon ask is created by this dose.
- **Why now.** The design-lane pain is real and reported (Codex prompt weight
  during design work) — but per claim discipline it enters as a **hypothesis to
  measure**, never an adjective. The harness-dose census turns "slop" into a
  version-pinned number per harness.
- **Below-vanilla ladder v2.** Today's AT-H3 is *standing-dose below vanilla*
  (skills evicted). The extended claim is *harness dose reduced toward the
  necessity floor* — strictly per-harness, strictly behind the necessity map
  (§3), because unlike skill eviction, prompt eviction can break the harness.
- **Measurement is already verified.** `--output-format json` `usage` + OTEL
  token metrics (M0 T5) give the numbers headless. M2a below needs no new
  capability on the reference harness.

**Prompt-control cells to verify (M2a opens with a T-series, matrix method):**

| Capability | Claude Code | Codex CLI | Cursor | pi |
|---|---|---|---|---|
| Replace/trim system prompt per-session | ❓ expected in headless/SDK (`--system-prompt`, `--append-system-prompt`); interactive ❓ | ❓ config override reported (`experimental_instructions_file`-shaped) — verify | ❓ none documented | ❓ prompt template configurable per docs — verify |
| Prompt content introspectable | ❓ (bracket via usage accounting if not) | ❓ | ❓ | ❓ |

Same rule as M0: no cell is load-bearing until empirically checked on a pinned
version; doc-verified cells get citations or stay ❓.

## 3. Bare ≠ zero: the necessity map

"Strip to bare necessities" only works if *necessities* is a measured set. The
system prompt is not slop-by-default — the tool-use contract, safety text, and
env context are load-bearing; removing them breaks tool-call parsing or worse.
So: segment, ablate, price.

1. **Segment** the vanilla prompt of `harness@version` into functional blocks:
   tool contract · safety/policy · env context · identity/branding · output-style
   mandates · feature docs · workflow heuristics · examples.
2. **Ablate** in paired trials — arms: vanilla → single-block-out → bare-candidate
   → zero. The placebo generalizes ratified finding 3: **the anchor is our own
   same-harness vanilla run.** Zero is expected to fail; *its failure modes define
   the floor.* N repeats + CIs (no determinism, per corpus).
3. **Endpoints** must include harness-contract integrity, not just task quality:
   tool-call parse/success rate, malformed-call rate, endpoint regex, then
   grilling-lane quality (Tier 3 judge where needed).
4. **The map is signed.** Each block lands in one of three classes, *per lane*:
   - **load-bearing** — removal degrades integrity/quality beyond CI;
   - **inert** — no measurable effect; pure token tax (the actual "slop");
   - **adverse-for-lane** — presence *hurts* the lane. Candidate: brevity/output
     mandates that are correct CLI ergonomics but plausibly suppress the
     discursive reasoning a grilling/design session exists for. This class is the
     measured version of "prompt slop *especially in design*."
5. **Artifact + drift.** `necessity-map/<harness>@<version>.json` under
   `content/reports/hh-benchmark/`; harness prompts churn every release, so the
   map is version-pinned like the M0 matrix and re-checked on version bump.

`bare(harness, lane)` = load-bearing blocks only. That is the whole definition of
"bare necessities," and it is empirical, per-harness, per-lane, and re-derivable.

## 4. Heaven-native, made testable (rubric input for the `heaven-native` stamp)

MISSION §1.1 defines the stamp's *spirit* ("a clean-context grilling session is
where it does its best work"); the HH Index RFC confirms the stamp vocabulary
(`heaven-native`, `auto@tier`, `hell-safe@tier`, set-membership). The sharpening:
**heaven-native skills are context-contributing, not behavior-injecting.** They
help the human author the session's context — PRDs, context docs, decision logs,
task-critical conventions — rather than mandating agent behavior. (Behavior
injection is Hell's business: capability on demand, mid-loop.) This keeps
`autonomyAffinity` vs `grillingNeed` honestly distinct: same skill can be both;
the axes never collapse.

A skill earns `heaven-native` when, on a pinned content hash:

1. **Contributes context.** Its output is a human-ratifiable context artifact
   (brief/PRD, context doc, decision log, convention contract) — not a standing
   behavior mandate.
2. **Doses under budget.** Starting lines from the R0 census, tuned by R2:
   standing ≤ **120** tokens (canon p25=73, median=160), invocation ≤ **1,200**
   (canon median=1,128). Rationale: a 3–5 skill Heaven-1 loadout stays under
   ~600 standing even worst-case. Feeds the stamp's `contextCost` dimension.
3. **Beats the floor.** Paired-trial evidence: Heaven-1-with-it > Heaven-0 on
   grilling-lane endpoints, own-placebo anchored, CIs reported. (`hh-manual-001`
   is the shape: the convention skill bought endpoint success — and we recorded
   that it did *not* buy token savings. Same honesty here.)
4. **Composes clean.** No global mutation, no cross-skill mandate conflicts;
   summonable hash-pinned via the librarian without extra scaffolding.

## 5. The ladder (D2): four positions, dose-monotone

```
 signal:   off          low            (default)        high / xhigh / max  ← upper-half mapping: proposed, confirm
 posture:  HEAVEN-0     HEAVEN-1       NATIVE           HELL LANE (Ultra · Hell — gated)
 loadout:  none         curated few    your setup as-is your base + evidenced flood → whole evidenced world
 prompt:   bare(lane)   bare(lane)     vanilla          vanilla (+ firebreak on context)
 server:   none         optional pull  none required    required (summon/router)
```

- **Heaven-0 (`off`) — the floor.** Evict all skills, bare prompt profile, no MCP
  server (AT-H5 posture). Zero registry dependency. The design-session default
  *and* the benchmark's placebo-of-record — the cleanest control any arm anchors to.
- **Heaven-1 (`low`) — the grilled loadout.** Floor + a hand-gated handful.
  **Source-agnostic, per IDEA-2026-020:** your own most-used custom skills first
  ("Heaven works standalone — it gates your most-used custom skills, no
  registry"), heaven-native canon via `gaia-mcp` in **pull-only librarian mode**
  optional (≤2 tools; its schema footprint subtracted in every claim). This is
  the "light, one notch above pure heaven" rung.
- **Native — user-custom, as-is.** Your installed setup untouched: no eviction,
  no summoning, no management. The harness as the user configured it. This is
  the position vanilla users already occupy — the ladder must contain it, both
  so "Heaven is below vanilla" has its referent and so *exiting* Heaven is one
  rung, not a restore operation (§7).
- **The Hell lane — above Native, gated.** Ultra (curated/native base + evidenced
  flood) and Hell (whole evidenced pool + firebreak), unchanged from
  VISION §4/§6 and RFC §3: honesty-gated, deterministic routing, explicit
  posture signal. Upper-tier mapping (Ultra at `high/xhigh`, Hell at `max`) is
  **proposed here, needs owner confirm** — D2 pinned only the bottom half.
- **The ladder is monotone in standing dose.** Each rung strictly adds standing
  context: 0-skill bare floor → few curated listings → your full listing set →
  flood under firebreak. (Set-inclusion is *not* strict — Heaven-1 may summon a
  canon skill you never installed — the monotone claim is about dose, and it is
  what AT-H3-style measurements verify rung-to-rung.)
- **Auto is a policy, not a position.** RFC §6.1's Auto ("reads the task, picks
  the posture") selects a rung on this ladder; it is the needle, not a notch.
  Needs owner confirm as a §6.1 wording amendment (§10.2).
- **Ledger encoding** (additive, `hh-ledger/v2`): rung falls out of existing
  fields (`arm: heaven` + `skillsLoaded` empty ⇒ Heaven-0; non-empty ⇒ Heaven-1;
  `arm: placebo` maps to Native); add optional `promptProfile: {id, sha256}` —
  hash-bound, v1 records imply `vanilla`. Validator change is additive.

## 6. The context pack: Heaven's deliverable

This is the "Heaven is MORE than subtraction" thesis, made concrete. A Heaven
session doesn't just run quieter — it **produces an artifact**: the context pack.

- **Shape (sketch):** `pack/` = `brief.md` (PRD/task brief) + `context.md`
  (constraints, architecture, pointers) + `decisions.md` (ratification log) —
  hash-stamped as a unit.
- **The pack is the Heaven→Hell interface.** Grill in Heaven → ratify the pack →
  hand it to an auto/Hell loop as the task input. The poles stop being two modes
  and become one loop: **Heaven authors what Hell consumes.** Ledger gains an
  optional `packHash` so paired trials can attribute autonomous-run quality to
  the pack that briefed it — "does grilling help autonomy?" becomes a measurable
  R-track question instead of a belief.
- **Provenance.** IDEA-2026-020 already frames Heaven as *session-first,
  project-defaulted, user-gated* — the user authoring their loadout. The pack
  extends the same authorship from *loadout* to *task context*: the
  PRD/context-doc empowerment design, now with a measurable artifact.
- **Seed skills are our own house formats.** The idea-bank entry format
  (rank/viability/status/decision log), the plan-doc format, and this repo's
  ratification flow *are* a grilling loop run by hand — the vision→ratify→slice
  PR chain (#61→#63→#64) is the existence proof. First heaven-native candidates:
  `context-pack`, `grill-ratify`, `decision-log`. Dogfood before canon: they
  live here, get census'd and paired-tested here, and only then go through the
  governance path as registry candidates.
- **This is the 5%-human lane getting tooling** (MISSION §2): the human decides
  *whether*; heaven-native skills make the deciding cheaper and the record
  durable. Empowerment = the user authors context with power tools, on a floor
  with nothing else on it.

## 7. Per-session law (the stuck ascetic)

The anti-story this design must prevent: a user hard-strips their global config
to bare, wins their design sessions, then can't do implementation work — the
posture was a *mutation*, so switching costs a restore they never journaled.
Slice 1 proved the cure for skills (AT-H1/AT-H2 pass by construction on the
flags route; fixture repo byte-identical). The law extends to prompts:

- Posture (rung + prompt profile + loadout) is **compiled per invocation** by the
  D1 profile compiler; nothing writes to `~/.claude`, `$CODEX_HOME`, or any
  shared config. Exiting Heaven = launching Native — one rung, zero restore.
- **Project defaults, session overrides** (IDEA-2026-020's "session-first,
  project-defaulted"): a project may declare a default rung; every session
  inherits it and may override it for itself only.
- Vanilla/Native stays available concurrently, same repo, always.
- Harnesses where only tracked-file mutation works (Cursor rules) stay on the
  documented-manual-recipe track — same as ratified.

## 8. Surface map (experiment → production)

One profile format, compiled per harness by the D1 launcher. Surfaces sort by
what finding 1 allows (eviction is harness-side; MCP is additive-only):

| Surface | Role | Mechanism | Status / caveat |
|---|---|---|---|
| Claude Code | reference | `claude-heaven` profile compiler over verified flags (D1); native `--heaven-mode` future | M2 spike next; plugin-suppression interplay caveat open |
| pi extension | second port | `--no-skills` + `--skill` native; extension = profile + prompt template | Heaven primitive ships native; prompt cell ❓ |
| Codex | highest reported prompt pain | config-route recipe first (`$CODEX_HOME`, per-skill toggles); plugin when surface allows | two ❓ cells + prompt cell to clear before recipe |
| claude.ai connector | **summon-side only (MVP, per D3)** | `gaia-mcp` librarian (search + summon) | no session-boot control on managed surfaces today; **full slider stays the north star** — surface climbs the ladder as boot-time control appears |
| Cursor | trailing | `CURSOR_CONFIG_DIR` scoping; manual recipe | rules are tracked files; unchanged from ratified posture |

Sequencing stays corpus-true: Claude Code spike → pi port → Codex recipe →
connector rides the librarian track until D3's condition changes.

## 9. Proposed deltas (ratify/reject each; D-items in §1 already ratified)

1. **M2 acceptance grows one clause:** every spike run prices all three doses —
   `tokens.system` measured on the reference harness (mechanism verified in M0),
   never `null` where measurable.
2. **M2a — harness-dose census.** Null-task input-token floor per
   `harness@version`, decomposed where flags allow; publishable R0-style artifact
   (`harness-dose.md`). Opens with the §2 T-series to clear the ❓ cells.
3. **M2b — necessity map v0** on the reference harness: block segmentation +
   signed ablation (§3), artifact + version-bump re-check. Blocks M2's *prompt*
   claims; does not block M2's skill-eviction spike (D1 vehicle ships on skill
   eviction alone).
4. **Ledger `hh-ledger/v2`:** additive `promptProfile {id, sha256}` +
   optional `packHash`; v1 records remain valid (imply vanilla / no pack).
5. **R1 rubric input:** §4's four heaven-native criteria + starting budgets.
6. **Context-pack spec + seed skills** (`context-pack`, `grill-ratify`,
   `decision-log`) as in-repo dogfood, pre-governance.
7. **Public artifact:** harness-dose leaderboard ("tokens on the meter before
   your first word"), claim-disciplined: version-pinned, method published, no
   adjectives without numbers.

## 10. Reconciliation — master RFC + IDEA-2026-020 + HH Index RFC (done 2026-07-19)

### 10.1 Verdicts

**No conflicts found.** Every §9 delta is an extension of the RFC, not a
contradiction. Specific alignments:

- **Third dose ← IDEA-2026-020 Phase 0** ("system-prompt tokens" in the
  instrumentation list): original scope restored, provenance clean (§2).
- **Heaven-1's source-agnostic loadout ← IDEA-2026-020** ("gates your most-used
  custom skills, no registry") + owner's light-rung intent: folded in §5.
- **Per-session law ← IDEA-2026-020** ("session-first, project-defaulted"): §7.
- **Stamp vocabulary ← HH Index RFC** (`heaven-native` / `auto@tier` /
  `hell-safe@tier`, set-membership confirmed; 0–100 slider float provisional):
  §4 is rubric input for the `heaven-native` stamp; harness dose deliberately
  stays **out** of the Ygg II schema (§2), so no fifth schema ask is created.
- **Superseded idea-doc language:** IDEA-2026-020's "multiple seeds" / "seed
  control" (Phase 1 / Rigor ops) predates ratified finding — determinism does
  not exist in any target harness; the ledger validator rejects `seed`. N
  repeats + CIs stands. The idea brief should get a one-line reconciliation
  note when next touched (marketing-tasks side).
- **D1 vs RFC §1.2 row 5** ("both spikes run, winner picked by evidence"): M0's
  T-series is the evidence; the owner has picked the launcher-shaped compiler
  over those verified flags. The in-harness *mechanics* the GO verdict preferred
  are exactly what the launcher composes — the two decisions are the same
  decision at different layers.

### 10.2 Staged RFC amendments (route via marketing-tasks, per governance)

1. **§7.1** "two-part dose, everywhere" → "three doses: harness / standing /
   invocation; skill schema carries two (contextCost), the ledger carries all
   three."
2. **§2** add AT-H6 (Heaven-0 and Heaven-1 both runnable; Heaven-0 is the
   placebo-of-record for grilling-lane trials) and AT-H7 (bare profile passes
   harness-contract integrity probes before any prompt claim ships).
3. **§6.1** canonical names: add **Native** (user-custom as-is) as the middle
   posture; record rung ids Heaven-0/Heaven-1; note Auto = rung-selection
   policy, not a rung (pending owner confirm).
4. **§6.3** claim-discipline rows: harness-dose numbers (allowed when the census
   artifact lands; version-pinned, method cited) and "bare prompt" claims
   (allowed only after AT-H7 + necessity-map artifact).
5. **§1.2** row 5 exit criteria: reflect D1 (compiler ships M2; `--heaven-mode`
   tracked as future upstream iteration).

## 11. Open questions (owner)

- **Upper-half mapping:** Ultra at `high/xhigh`, Hell at `max` — confirm or
  re-pin (D2 fixed only off/low/native).
- **Auto wording:** ratify "policy, not position" for the §6.1 amendment.
- **Budget lines** (§4.2): ratify 120/1,200 as provisional now, or wait for R2.
- **Lane taxonomy for the signed map:** two lanes (grilling, autonomous) or
  three (+ implementation)?
- **Persona note:** none of this names the Heaven persona (reserved per RFC
  §6.2/#120) — confirm the rung names Heaven-0/Heaven-1/Native are safe interim
  vocabulary for internal docs.
