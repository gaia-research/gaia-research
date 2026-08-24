# R2 HH Benchmark trial protocol — pre-registration

**Status: PRE-REGISTERED METHOD; no R2 matrix runs or stamp results are recorded here.**
This protocol freezes Workstream A's research inputs before paid execution. The
machine-readable contract is under `scripts/hell-heaven-bench/data/r2/`.
`hh-ledger/v1` and its parity fixture remain unchanged.

## 1. Research question and unit of analysis

For each of the twenty R1 slots, does a pinned skill contract change endpoint
success and cost relative to our own same-model, same-harness, no-skill placebo as
skill entropy rises? A run is one task × exact loadout × repeat index. The planned
indices are committed in `task-matrix.json`; they provide the issue-required N ≥ 5,
not a claim of deterministic model seeds. <!-- lexicon-allow: B3 audit trail; this explicitly rejects the retired run field. --> Confidence intervals are computed over
valid repeats, never over retry attempts.

The primary outcome is the task's binary objective endpoint. Tier-3 tasks also have
a blind paired preference outcome. Secondary outcomes are frozen-ledger token doses,
whole-session tokens, and wall clock. Published model benchmarks are calibration
context only and never an arm.

## 2. Exact content and task identities

`content-identities.json` pins every `SKILL.md` by repository, full commit, path,
immutable raw URL, byte length, and SHA-256 of the exact response bytes (no newline
normalization). Four R1 TBD slots are honestly replaced by live contracts:

- 05 → `lgbarn/terraform-plan-review`
- 07 → `microsoft/tradeoff-analysis`
- 09 → `mattpocock/diagnosing-bugs`
- 12 → `alirezarezvani/chaos-engineering`

Slots 10 and 11 are also replaced because their R1 identities had no retrievable
`SKILL.md`: `mattpocock/migrate-to-shoehorn` and
`curiouslearner/test-generator`. Slots 16 and 20 retain their identity but repair
the source path. These are selection/input corrections, not outcomes. Prior R1
labels remain predictions and cannot become stamps without this trial.

Each task in `task-matrix.json` fixes its prompt, fixture id, endpoint tier, endpoint
kind, network policy, evaluator command, target identity, and exact per-arm loadout.
Fixture/evaluator material is implemented by the execution workstream at the named
paths; its bytes must be pinned in the execution bundle before the control pilot.
Workstream A's validator deliberately fails unknown identities, missing arms, malformed
endpoints, nonempty placebo loadouts, or treatment loadouts missing the target.

## 3. Arms and exact rung metadata

The frozen ledger records only `placebo|heaven|hell|ultra`. Exact rung metadata stays
in the R2 attempt companion record and task matrix, outside frozen ledger fields.
The required matrix is `placebo@zero`, `heaven@low`, `heaven@med`, `hell@high`,
`hell@xhigh`, and `hell@max` for every task.

The listed skills are **exact task-specific experimental treatments**. Their lengths
are not global rung counts, product defaults, or caps. The contract rejects fields
such as `skillCount`, `maxSkills`, or `cap`; no count is inferred as rung semantics.
Execution must materialize exactly the listed content hashes in a clean sandbox and
must not substitute a newer upstream body.

## 4. Run order, sandbox, and endpoint execution

1. Before paid execution, pin harness name/version, model id, model snapshot where the
   provider exposes one, container SHA, fixture-tree SHA, evaluator-tree SHA, and the
   task matrix SHA in an execution manifest. Any unavailable pin is a blocker, not a
   free-text approximation.
2. Build a fresh sandbox for every attempt. Network is denied during the task and
   evaluator. Source acquisition happens before the run and is hash-checked.
3. Generate the complete run list, then randomize its order once with a cryptographic
   shuffle. Commit the ordered list and its SHA before the first run. This randomizes
   order; it is not a model seed and must never enter `hh-ledger/v1`. <!-- lexicon-allow: B3 audit trail; rejects the retired field. -->
4. Give every arm the byte-identical task prompt and fixture tree. Only the exact
   loadout differs. Persist raw harness logs, output tree, evaluator stdout/stderr,
   and hashes before classification.
5. Run the declared evaluator once. A completed model answer that fails the endpoint
   is a **valid negative result**, never retryable. Tier-3 objective fields record the
   mechanical gate; judging is separate.
6. A valid attempt appends exactly one frozen `hh-ledger/v1` record. Its `task` is the
   task id, coarse `arm` is mapped from the loadout, `skillsLoaded` is materialized from
   the pin manifest, and `repeatIndex` is the planned slot. Rung/attempt metadata never
   leaks into new ledger fields.

## 5. Invalid attempts and retries

Every launch, including pre-model failures, writes `hh-r2-attempt/v1`. Invalid reasons
are closed enums: harness crash, provider outage, rate limit, sandbox setup, corrupt
capture, endpoint infrastructure, or protocol deviation. Invalid attempts never append
a ledger record and never enter confidence intervals. Their artifacts remain retained.

A repeat slot may be retried only for an enumerated invalid reason, with incremented
`attemptIndex` and the previous attempt retained. Endpoint failure, low quality, high
cost, refusal, or an inconvenient judge outcome are valid outcomes and may not be
retried. Repeated infrastructure failure pauses that cell for an amendment; operators
must not silently keep sampling until a favorable result appears. There is exactly one
accepted valid attempt per task/loadout/repeat slot; duplicates fail analysis ingestion.

## 6. Blind judging

Tier-3 outputs are paired placebo-versus-treatment only after mechanical validation.
A separate allocator randomizes artifact placement as A/B and retains the concealed
mapping outside the judge packet. `hh-r2-blind-judge/v1` contains artifact hashes,
rubric version, 1–5 rubric scores, `A|B|tie|invalid`, rationale, and a pseudonymous judge
id. It rejects `arm`, `loadoutId`, and `skillId`, preventing treatment leakage.

Judges see normalized artifacts with run metadata, paths, timestamps, and skill names
removed. An invalid judgment is reallocated; it does not invalidate a run. The analysis
reports agreement and ties, and never coerces ties into treatment wins.

## 7. Analysis and stamp decision rule

For each task/rung, report endpoint pass proportion and a 95% interval, mean cost with
an interval, and the treatment-minus-placebo effect with an interval. The analysis code
and interval method must be committed before unblinding; changing method requires a
numbered protocol amendment and a sensitivity analysis using the original method.

A predicted stamp/rung is **accepted** only when all apply:

1. every pre-registered repeat slot for the relevant placebo and treatment cell has one
   valid record;
2. the lower 95% confidence bound for objective endpoint improvement is above zero, or
   for Tier-3-only quality the pre-registered blind-preference interval excludes parity
   in favor of treatment;
3. no valid run triggers a deny-list action, safety endpoint, or undisclosed environment
   dependency; and
4. all cost and judge fields required by the endpoint tier are measured and provenance-
   bound.

It is **rejected** when the upper 95% bound is at or below zero, or any valid treatment
run triggers a pre-registered safety/deny endpoint. Otherwise the result is
**no-stamp / inconclusive**. Missing, invalid-only, underpowered, mixed, or unavailable
cells are no-stamp—not rejection and never acceptance. Negative findings remain in the
attempt log and ledger with equal rigor. No result edits the R1 prediction files in place.

## 8. Control pilot and stop rule

Run only tasks 02 and 11 first, at the exact pilot loadouts and repeat indices in the
matrix. This is a pipeline/control pilot, not permission to publish stamps. Stop before
the remaining matrix if any identity hash drifts, a placebo loads a skill, a valid failure
is retried, judge concealment leaks, duplicate repeat slots appear, evaluator results are
non-reproducible, or either R1 positive control fails its integrity expectation. Record
the failure and amend the protocol before proceeding.

## 9. CI and cross-repository boundary

Research CI runs, without model/provider calls:

```bash
npx tsx scripts/hell-heaven-bench/ledger.ts validate
npx tsx scripts/hell-heaven-bench/validate-r2.ts
npx vitest run scripts/hell-heaven-bench/r2-contract.test.ts
```

`validate-r2.ts --verify-sources` is the acquisition-time/live-source check and is not a
routine CI dependency. Immutable commit URLs plus committed hashes make ordinary CI
deterministic even if GitHub is unavailable.

This repository owns trial inputs, attempt/judge companions, validation, and receipts.
A later `gaia-skill-tree` change may ingest accepted stamp receipts through the documented
repository flow; this PR does not modify that repository or its schema. `gaia-skill-heaven`
execution must vendor/parity-check these new R2 companion contracts separately while
continuing to emit byte-compatible `hh-ledger/v1` records.

## 10. Amendments and blockers

Any change after the first paid pilot attempt requires `r2-amendments/<NN>.md` stating
what changed, why, which cells were exposed, and whether old/new analyses are both shown.
Before the pilot, the execution workstream must still provide the pinned fixture/evaluator
bundle, sandbox image, harness/model pin, run-order artifact, allocator, and analysis code.
Until those land, this protocol authorizes **no paid matrix run and no stamp claim**.
