# Per-Model × Per-Harness Token-Savings Matrix

- **Rank:** 2
- **Status:** Idea / LEANING — **not ratified**. Nothing below overrides `founder/RATIFICATION.md`.
- **Viability:** Medium (depends on an unratified frozen-skill-set snapshot mechanism, and on N4/N5 closing)
- **Potential:** High

## HARD constraint — read this first

**This per-model locked benchmarking is for AFTER-PRODUCTION tests and
benchmarks ONLY. It is never a gate.** Verification gates (capability-matrix
gates, e.g. WS3 gate (a)) keep the deterministic in-session method locked by
**D12**: prompt/per-turn token count via `--output-format json` is the hard
signal, and model self-listing is corroborating only. This matrix is a
**reporting/plotting surface built on top of already-gated behavior** — it
does not decide whether a posture is safe or real, it measures how much a
*proven* posture saves, broken out by model and harness. Do not blur the two:
a cell in this matrix passing does not open, close, or substitute for any
gate in the capability matrix.

## What to research

A post-MVP benchmark surface that reports Skill Heaven's token savings
**locked per model and per reasoning level** (e.g. Sonnet 5 at low / medium /
high, plus Opus, Haiku, and non-Claude harness models) **× per harness**
(Claude Code, pi, codex, cursor, grok) **× posture** (native / floor /
curated, per **P1**).

For each cell, record — measured the same way every time:
- **Standing-dose** token savings (floor vs. native), per **B1** (standing
  and invocation priced separately, never collapsed into one number).
- **Per-turn** token savings (floor vs. native; curated re-admission delta).

Gaia publishes its own **verified "official" results** for every cell it
runs. **Outside contributors may submit their own results** in a community
lane, but Gaia's verified numbers stay the reference the community lane is
checked against — same shape as the existing GSB submission-vs.-canon split
in `content/schemas/`.

A **sandboxed environment is created for this exact task for
`claude-heaven`** — the **B5** clean-install fixture (built for the
benchmark, not the workstation's growing `~/.claude`) doubles as the harness
this matrix runs on.

## Why per-model

Both **probe reliability** and **absolute token levels** are model-dependent
— this is not a hypothetical, it happened. See the origin story below: a
haiku probe under-reported a skill that was demonstrably loaded, and the
absolute per-turn numbers differ materially between models even holding the
harness and posture fixed. That means **you cannot mix models into one
savings number** — a single cross-model figure would average over a
reliability difference and a magnitude difference at once, hiding both. Each
matrix cell must lock the exact model **and** reasoning level; a Sonnet-high
cell and a Sonnet-low cell are different cells, not two samples of the same
one.

## Ties to existing B-discipline (all LOCKED, none reopened here)

- **B1** — standing vs. invocation are priced separately in every cell;
  this idea does not introduce a third collapsed number.
- **B2** — each cell's floor is that harness+model's own no-skill run
  (own-placebo anchoring), never a borrowed baseline across models or
  harnesses.
- **B3** — no seeds; every cell is N repeats with confidence intervals, not
  a single run. (The origin-story numbers below are single smoke-evidence
  runs, not matrix cells — see Status.)
- **B5** — matrix cells are measured on **clean sandboxed harness installs**,
  never the workstation. A workstation run is smoke/demo evidence at best,
  same distinction the M2 live demo report draws for itself.

## Dependency / open question — frozen skill-set snapshot

Matrix cells are only comparable across models, harnesses, and time if the
skill set under test is **frozen** (a census snapshot), because the
workstation's live `~/.claude` grows as skills are added and makes absolute
per-turn numbers drift run to run. This idea **depends on** that
census-snapshot mechanism; it does not solve it here. Tracked as an open
dependency, not a decision — see `scripts/hell-heaven-bench/census.ts` and
the R0 census work already in `content/reports/hh-benchmark/`.

## Status: OPEN items this does not resolve

- **N4/N5** (level-vocabulary questions — `ultra`'s survival, one scale or
  two) stay **OPEN**. This idea does not invent a unified level scale; it
  slots into whatever level vocabulary `founder/RATIFICATION.md` eventually
  ratifies.
- This whole idea is **LEANING/idea, not ratified**. It proposes a shape for
  a future reporting surface; it is not a commitment to build it, and it
  does not change P1, P2, D12, or any other LOCKED item.

## Why now — origin story

Born from the 2026-07-22 M2 live demo (Claude Code 2.1.216,
`content/reports/hh-benchmark/m2-live-demo.md`). The first probe pass used
**haiku** and hit a self-report flake — haiku answered "NO" to a skill
(`impeccable`) that was demonstrably loaded, the same kind of under-reporting
that had already falsified the 2026-07-21 gate-(a) pass. The owner directed
switching probes to **Sonnet at low reasoning**; the re-run was clean:
native **46,849** → floor **30,661** per-turn tokens (**−16,188**;
`firecrawl-crawl` listing flipped YES → NO), and curated posture re-admitted
exactly `heaven-set:impeccable` (**+963** per-turn; `chars4` standing dose
227). A Sonnet-High review pass then caught and removed two overstated
claims from the writeup before it shipped.

**Lesson:** model choice materially changes both probe reliability and the
measured numbers themselves — so token savings must be locked and plotted
per-model-per-level, never reported as one cross-model figure. That
realization is what this idea captures. The real evidence underneath it is
committed: `content/reports/hh-benchmark/m2-live-demo.md` and the three
`hh-ledger/v1` records appended on branch `demo/hh-m2-floor-live`
(`scripts/hell-heaven-bench/data/ledger.jsonl`, `benchmarkId: hh-m2-smoke`) —
smoke/demo evidence per **B5**, not benchmark-arm evidence, which is exactly
why a clean sandboxed per-model matrix is the natural next step.
