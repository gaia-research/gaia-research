# KC8 Scratchpad — recoverability anchor

**Read this file top to bottom before doing anything if you are resuming after a
cutoff.** Then check `git log --oneline -20` on this branch for the actual
committed state — this file is a log of intent and progress, git is ground
truth for what's actually landed.

## The task (skill-heaven issue #13, KC8 half — verbatim)

> KC8: Every public claim links to a reproducible benchmark record (B4).

B4 (`gaia-research/founder/RATIFICATION.md:86`, INVARIANT): "The ledger is
always on, the claim-discipline table binds all public copy, and no claim
ships ahead of its benchmark. A 'will not work' ledger is as first-class as a
'will work' one — verified negative findings are recorded with the same
rigor."

**Deliverable (Marco's instruction):** a page in the gaia-research research
ledger — i.e. under `content/reports/hh-benchmark/` (the existing pattern:
`m2-live-demo.md`, `methodology.md`, `r0-census.md`), rendered publicly via
the Next.js `app/research` route. Marco will view it with a local `next dev`
before anything merges — nothing merges without that human look.

## Mechanism already in this repo (read before reinventing anything)

- `scripts/hell-heaven-bench/ledger.ts` — append/validate the `hh-ledger/v1`
  JSONL ledger at `scripts/hell-heaven-bench/data/ledger.jsonl`.
- `scripts/hell-heaven-bench/check-claims.ts` — the actual provenance gate.
  Binds every token-context number / sha in gated docs to a committed ledger
  or census record, or requires the `‡` sigil for declared-uncommitted
  numbers. Default-scans `docs/labs/harness-capability-matrix.md` +
  `content/reports/hh-benchmark/m2-live-demo.md` — **the new deliverable page
  needs to be added to its scan set (or fenced + passed explicitly) to
  actually gate KC8's own claims.**
  Run: `npx tsx scripts/hell-heaven-bench/check-claims.ts [--file <md> ...]`
  Self-tests: `npx tsx scripts/hell-heaven-bench/check-claims.test.ts`
- `scripts/hell-heaven-bench/census.ts` — two-part-dose census (standing vs
  invocation), produces `content/reports/hh-benchmark/data/r0-census.json`.
- `scripts/hell-heaven-bench/README.md` — full methodology writeup, read this.
- Fence convention: `<!-- ledger-claims:begin -->` … `<!-- ledger-claims:end -->`
  around any region making ledger-backed claims; `‡` sigil for
  declared-uncommitted numbers.

## Known Arc I figures that will likely need ledger backing (starting list —
verify and expand, don't just trust this list)

- **F7**: product-floor's door costs +515 tok (20,176 vs 19,661). Measured on
  `claude 2.1.216`; every later Arc I probe is on `2.1.220`. **Marco ruled
  2026-07-30: lock this number as final, do NOT re-derive against 2.1.220** —
  version drift is accepted as harmless/expected here. Cite as-is; do not
  attempt a fresh measurement.
- KC4's clean-room composition: empty `--setting-sources` gives `[]` (true
  zero) for `floor`; `product-floor` gives `["doctor"]` (accepted residual,
  upstream harness limitation).
- Native baseline listing size / token cost (whatever the current recorded
  native comparison is — verify from skill-heaven's actual test/probe output,
  don't assume a number).
- Any KC1–KC6 claims already made in skill-heaven's README or docs that assert
  a specific measured number publicly.

**This list is a starting point for Stage 1's inventory, not the final scope.**
Stage 1's job includes finding what this list is missing.

## Pipeline (Marco's design, 2026-07-30)

1. **Plan** (Opus, max effort) — investigate, write the plan below under
   `## Plan`, high-level. Does not implement.
2. **Implement** (Opus, medium effort) — do the actual claim inventory + ledger
   record generation/validation + gap-closing so `check-claims.ts` passes
   against the target doc set. **Stops before authoring the final deliverable
   page.**
3. **Review** (Sonnet, high effort) — re-verify (rerun check-claims.ts, don't
   trust), write a verdict under `## Review — round N`.
4. **Iterate**: if not satisfied, back to step 2 with the review's specific
   feedback, repeat. Capped at 3 rounds — if still unsatisfied after 3, stop
   and escalate rather than loop forever.
5. **Deliverable** (Opus, low effort) — author the actual page, wire it into
   check-claims.ts's scan set, confirm it gates clean, open a PR (not merged).
6. **Human gate** — Marco reviews locally (`next dev`) and merges himself.

## Recoverability rules for every stage

- **Commit + push after every logical unit.** Never batch. A pushed commit
  survives a credit cutoff; a local commit does not.
- **Update the Progress Log below before you stop**, even mid-task — what you
  did, what's left, exact next command to run.
- Branch: `docs/kc8-benchmark-ledger`, off `gaia-research` `main` (`6b8db3d`).
  Push to `origin/docs/kc8-benchmark-ledger`.
- gaia-research **forbids squash merges** — this branch will merge via a merge
  commit when Marco says so. Not your call to merge it.

---

## Plan

*(Stage 1 fills this in.)*

---

## Progress Log

*(Newest entries at the bottom. Each stage appends before stopping.)*

- 2026-07-30 — orchestrator: scratchpad created, worktree set up at
  `/Users/marcotiongson/Documents/gaia-research-kc8`, branch
  `docs/kc8-benchmark-ledger` off `main` @ `6b8db3d`. Handing off to Stage 1
  (planner).
