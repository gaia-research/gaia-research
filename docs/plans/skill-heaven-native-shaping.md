# Heaven-Native — Shaping Draft (third dose, two rungs, the context pack)

> **Status: DRAFT for ratification — nothing here is decided.** Brainstorm output
> (2026-07-19), shaped against the ratified corpus after Slice 1 (PR #64) landed
> M0 + M1 + M3. Companions: [`skill-heaven-hell-mvp-plan.md`](./skill-heaven-hell-mvp-plan.md),
> [`../idea-bank/skill-heaven-hell-mvp.md`](../idea-bank/skill-heaven-hell-mvp.md),
> `VISION.md` / `MISSION.md`, M0 matrix in [`../labs/harness-capability-matrix.md`](../labs/harness-capability-matrix.md).
> **Pending reconciliation** with the master RFC
> (`marketing-tasks/deliverables/proposal/skill-heaven-hell-mvp-rfc.md`) — not
> readable from this session; see §10. This doc edits no ratified text and stages
> no canon asks; if ratified, its deltas fold into the plan + idea-bank decision log.

## 0. What this shapes, in one breath

Slice 1 proved Heaven's *skill* story: eviction is in-harness, per-session, and
measurable. This draft extends the same discipline to the thing Slice 1 left as
`null` in every ledger record: **`tokens.system` — the harness's own prompt**. It
proposes (a) the **harness dose** as a third priced dose, (b) a **necessity map**
that makes "bare necessities" a measured set instead of a vibe, (c) two explicit
**rungs inside Heaven** (floor vs. grilled loadout), (d) **heaven-native = 
context-contributing** as the testable R1 semantics, and (e) the **context pack**
as Heaven's deliverable — the artifact that makes Heaven the authoring half of
Hell's autonomy, not just a quieter room.

## 1. Framing correction: the "launcher" is a profile compiler

Post-M0, "Heaven = a launcher that strips Claude Code" is stale shorthand. The GO
verdict keeps the *mechanism* in-harness (flags/hooks/env: `--disable-slash-commands`,
`--plugin-dir`, `CLAUDE_CONFIG_DIR`, pi's `--no-skills --skill`); nothing stashes or
restores files. What survives of "launcher" is UX: a thin **profile compiler** —
one posture profile, compiled per harness into that harness's native flags, then
`exec`. It owns zero eviction logic. Keep saying "profile", stop saying "wrapper".

## 2. The third dose: harness dose

Ratified finding 2 split `contextCost` into standing + invocation doses. Both
price *skills*. But every session pays a third dose before the first user word:
the harness system prompt, tool schemas, env preamble, feature documentation.
Ledger schema v1 already reserves the slot (`tokens.system`) — every real record
to date carries `null`, honestly, because nothing measures or targets it yet.

- **Definition.** `harness dose` = input tokens a `harness@version` charges on a
  null task with zero skills loaded — decomposable (tool schemas vs. prose) by
  toggling verified flags (e.g. T1's `--tools ""` drops the Skill listing).
- **Why now.** The design-lane pain is real and reported (Codex prompt weight
  during design work) — but per claim discipline it enters as a **hypothesis to
  measure**, never an adjective. The harness-dose census turns "slop" into a
  version-pinned number per harness.
- **Below-vanilla ladder v2.** Heaven's claim grows a rung: today's AT-H3 is
  *standing-dose below vanilla* (skills evicted). The extended claim is *harness
  dose reduced toward the necessity floor* — strictly per-harness, strictly
  behind the necessity map (§3), because unlike skill eviction, prompt eviction
  can break the harness contract.
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

## 4. Two rungs inside Heaven

One pole publicly; two mechanism rungs internally (VISION naming untouched):

- **Heaven-0 — the floor.** Evict all skills, bare prompt profile, **no MCP
  server** (AT-H5 posture). Zero registry dependency. This is the design-session
  default *and* the benchmark's placebo-of-record for grilling-lane trials — the
  cleanest control any arm can be anchored to.
- **Heaven-1 — the grilled loadout.** Floor + a hand-picked heaven-native set
  re-admitted (session-only `--plugin-dir` / curated dir / pi `--skill`), and
  optionally `gaia-mcp` in **pull-only librarian mode** (≤2 tools, per the
  ratified footprint rule; its schema cost is subtracted in every claim). This is
  the "light, one notch above pure heaven" rung: skills that *contribute* context
  with the router on.

Ledger encoding (additive, `hh-ledger/v2`): rung falls out of existing fields
(`arm: heaven` + `skillsLoaded` empty ⇒ Heaven-0; non-empty ⇒ Heaven-1); add
optional `promptProfile: {id, sha256}` — hash-bound like everything else, `v1`
records imply `vanilla`. Validator change is additive; no old record breaks.

## 5. Heaven-native, made testable (input to R1 rubric)

MISSION §1.1 defines the stamp's *spirit* ("a clean-context grilling session is
where it does its best work"). The sharpening: **heaven-native skills are
context-contributing, not behavior-injecting.** They help the human author the
session's context — PRDs, context docs, decision logs, task-critical conventions
— rather than mandating agent behavior. (Behavior injection is Hell's business:
capability on demand, mid-loop.) This keeps `autonomyAffinity` vs `grillingNeed`
honestly distinct: same skill can be both; the *axes* never collapse.

A skill earns `heaven-native` when, on a pinned content hash:

1. **Contributes context.** Its output is a human-ratifiable context artifact
   (brief/PRD, context doc, decision log, convention contract) — not a standing
   behavior mandate.
2. **Doses under budget.** Starting lines from the R0 census, tuned by R2:
   standing ≤ **120** tokens (canon p25=73, median=160), invocation ≤ **1,200**
   (canon median=1,128). Rationale: a 3–5 skill grilled loadout stays under
   ~600 standing even worst-case.
3. **Beats the floor.** Paired-trial evidence: Heaven-1-with-it > Heaven-0 on
   grilling-lane endpoints, own-placebo anchored, CIs reported. (`hh-manual-001`
   is the shape: the convention skill bought endpoint success — and we recorded
   that it did *not* buy token savings. Same honesty here.)
4. **Composes clean.** No global mutation, no cross-skill mandate conflicts;
   summonable hash-pinned via the librarian without extra scaffolding.

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
  the pack that briefed it — which turns "does grilling help autonomy?" into a
  measurable R-track question instead of a belief.
- **Seed skills are our own house formats.** The idea-bank entry format
  (rank/viability/status/decision log), the plan-doc format, and this repo's
  ratification flow *are* a grilling loop run by hand — the
  vision→ratify→slice PR chain (#61→#63→#64) is the existence proof. First
  heaven-native candidates: `context-pack`, `grill-ratify`, `decision-log`.
  Dogfood before canon: they live here, get census'd and paired-tested here, and
  only then go through the governance path as registry candidates.
- **This is the 5%-human lane getting tooling** (MISSION §2): the human decides
  *whether*; heaven-native skills make the deciding cheaper and the record
  durable. Empowerment = the user authors context with power tools, on a floor
  with nothing else on it.

## 7. Per-session law (the stuck ascetic)

The anti-story this design must prevent: a user hard-strips their global config
to bare, wins their design sessions, then can't do implementation work — the
posture was a *mutation*, so switching costs a restore they never journaled.
Slice 1 already proved the cure for skills (AT-H1/AT-H2 pass by construction on
the flags route; fixture repo byte-identical). The law extends to prompts:

- Posture (rung + prompt profile + loadout) is **compiled per invocation**;
  nothing writes to `~/.claude`, `$CODEX_HOME`, or any shared config.
- Vanilla is always one command away, concurrently, same repo.
- Harnesses where only tracked-file mutation works (Cursor rules) stay on the
  documented-manual-recipe track — same as ratified.

## 8. Surface map (experiment → production)

One profile format, compiled per harness. The strategic surfaces sort by what
finding 1 allows (eviction is harness-side; MCP is additive-only):

| Surface | Role | Mechanism | Status / caveat |
|---|---|---|---|
| Claude Code | reference | flags/hooks route per M0 GO; package as session-only plugin (`--plugin-dir`) + settings profile | M2 spike next; plugin-suppression interplay caveat open |
| pi extension | second port | `--no-skills` + `--skill` native; extension = profile + prompt template | Heaven primitive ships native; prompt cell ❓ |
| Codex | highest reported prompt pain | config-route recipe first (`$CODEX_HOME`, per-skill toggles); plugin when surface allows | two ❓ cells + prompt cell to clear before recipe |
| claude.ai connector | **summon-side only** | `gaia-mcp` librarian (search + summon) | **not a Heaven vehicle** — no session-boot control on managed surfaces; connector distributes the librarian, never eviction |
| Cursor | trailing | `CURSOR_CONFIG_DIR` scoping; manual recipe | rules are tracked files; unchanged from ratified posture |

Sequencing stays corpus-true: Claude Code spike → pi port → Codex recipe →
connector rides the Hell/librarian track, not the Heaven track.

## 9. Proposed deltas (each needs a ratify/reject)

1. **M2 acceptance grows one clause:** every spike run prices all three doses —
   `tokens.system` measured on the reference harness (mechanism verified in M0),
   never `null` where measurable.
2. **M2a — harness-dose census.** Null-task input-token floor per
   `harness@version`, decomposed where flags allow; publishable R0-style artifact
   (`harness-dose.md`). Opens with the §2 T-series to clear the ❓ cells.
3. **M2b — necessity map v0** on the reference harness: block segmentation +
   signed ablation (§3), artifact + version-bump re-check. Blocks M2's *prompt*
   claims; does not block M2's skill-eviction spike.
4. **Ledger `hh-ledger/v2`:** additive `promptProfile {id, sha256}` +
   optional `packHash`; v1 records remain valid (imply vanilla / no pack).
5. **R1 rubric input:** §5's four heaven-native criteria + starting budgets.
6. **Context-pack spec + seed skills** (`context-pack`, `grill-ratify`,
   `decision-log`) as in-repo dogfood, pre-governance.
7. **Public artifact:** harness-dose leaderboard ("tokens on the meter before
   your first word"), claim-disciplined: version-pinned, method published, no
   adjectives without numbers.

## 10. Open questions (blocked on marketing-tasks + owner)

- **RFC reconciliation:** §1.2 milestone rows, §2 acceptance tests (AT-H*), §6.3
  claim-discipline table — do the deltas above conflict with anything already
  ratified in the master RFC? (Repo not readable from this session.)
- **The original heaven-empowerment idea doc** (marketing-tasks): fold its
  PRD/context-doc design into §6, or supersede it here — owner call after
  side-by-side.
- **Naming:** are Heaven-0/Heaven-1 internal-only (recommended), or does the
  public story ever surface the rungs?
- **Budget lines** (§5.2): 120/1,200 are census-derived starting points —
  ratify as provisional, or wait for R2 to set them?
- **Lane taxonomy for the signed map:** start with two lanes (grilling,
  autonomous) or three (+ implementation)?
