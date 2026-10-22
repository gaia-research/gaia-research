# F — Five highest-value local experiments

- **Date:** 2026-10-22
- **Status:** **proposal.** No experiment below has been run. No live expensive inference is authorised by this document.
- **Selection criterion, in the mission's order:** reduce **Sol/Opus quota consumption** while **maintaining verified completion quality**. An experiment that only measures a cheap model against a cheap model is not in this list.

---

## 0. Design constraints we adopted from the evidence and from our own discipline

| Constraint | Source | Why it binds |
|---|---|---|
| Grading must be **ground truth**, not a model judge | CRBugBench's `ground_truth.json` carries the exact file, line, diff hunk and resolution thread of a human-flagged defect (E-CR-02) | A model judge grading a cheap reviewer measures the judge, not the reviewer |
| **Recall and precision are separate metrics** | 36.4% of agentic review comments were accepted, 56.3% rejected (E-CR-05) | Optimising recall alone ships noise |
| **One model×effort per cell** | our own lab rule: "you cannot mix models into one savings number" (`docs/idea-bank/per-model-harness-token-savings-matrix.md`) | Cross-model averages hide reliability and magnitude differences at once |
| **N repeats with CIs, never a single run** | same rule (B3) | A single run is a smoke test, not a cell |
| **A failed attempt must not be silently rescored** | CRBugBench counts unscored/error trials as *not detected* (`scripts/summarize.py`) | Otherwise agent errors silently improve a model's score |
| **The cheap route must clear a floor** | E-MA-05 | Otherwise we re-run the study that already failed |
| **Cost is tokens + quota unless actually billed** | E-LF-01 | 36 of our 60 usage-bearing runs are subscription-billed and report $0 |
| **Task set must be historical** | mission | Replayable, no live risk |

**The host constraint that shapes everything:** this machine has **no Docker**, **51 GB free disk**, 8 cores and 11 GB RAM. CRBugBench cannot run here (it needs Docker, 19 GB per repository of git history, ~650 GB for the full set). So E-1 and E-2 are designed to run on **our own historical repository tasks**, with CRBugBench named as the *external replication target* for anyone with a Docker host.

---

## E-1 — Luna as reviewer: precision-matched against a premium reviewer  ★★★★★

**Hypothesis (H1).** `gpt-6-luna` at high, given the P1 verdict contract, achieves review *precision* at least equal to `gpt-6.1-sol` at medium on task-scoped lanes, at a materially lower token cost.

**Why this is first.** It is the mission's central question, it is the hypothesis with the most third-party corroboration (auto-office pins it first for both reviewer roles, trust-granted it, and closed two live gates with it — E-AO-01/02/03/04; CRBugBench's own README runs it — E-CR-02), and it is the one where our fleet is currently *most* exposed: we already route reviews to a cheap model (E-LF-02) **without ever measuring whether it catches anything**.

**Task set.** 40 historical merged PRs from `gaia-skill-tree` and `gaia-research`, sampled across a difficulty band:
- 10 small (≤30 changed lines, single file)
- 20 medium (30–200 lines, ≤4 files)
- 10 large (>200 lines or ≥5 files) — **this band is the point**: E-CR-04 found agents are weakest on complex changes.

**Ground truth.** For each PR, the set of defects that were *actually* fixed later (a follow-up commit mentioning the PR, a revert, or a later fix commit touching the same lines). Build `ground_truth.json` in CRBugBench's shape: `path`, `line`, `summary`, `description`, `attached_diff_hunk`, `provenance`, plus a `non_defect` set drawn from the *comments that were rejected* in the original PR review. The `non_defect` set is what makes precision measurable, and it is the half of the metric that the field usually omits.

**Arms (3, matched, same fixtures, same seed, same diff scope, same brief):**

| Arm | Reviewer | Effort | Notes |
|---|---|---|---|
| A | `openai/gpt-6-luna` | high | the candidate |
| B | `openai/gpt-6.1-sol` | medium | the current premium reviewer-ish comparator |
| C | `openai/gpt-6-luna` | high **+ P5 nudges** | isolates the prompting lever from the model lever |

**Metrics (per arm, with 95% CIs):**
- `precision` = confirmed true positives / (confirmed TPs + confirmed FPs) — a finding is a TP if it matches a ground-truth defect (same file + overlapping line/semantic match), an FP if a human confirms it is not a defect
- `recall` = ground-truth defects found / ground-truth defects present
- `true_positive_rate` = confirmed TPs / all reported findings (the "cost of confirming findings" the mission asks for)
- `severity_weighted_recall` = critical/high defects found / present
- `tokens_per_confirmed_true_positive` — the cost-adjusted headline
- `tokens_per_task`, `latency_p50`, `retries`, `human_intervention_count`

**Grading.** Human adjudication by a rubric-blind second reader, **not** a model judge. Each finding is confirmed true, confirmed false, or unresolvable; unresolvable counts as a false positive (conservative). A sampled second reader adjudicates disagreements to estimate inter-rater agreement.

**Stop conditions.** Each arm is capped at 40 tasks × 1 run; if the candidate arm's first 10 tasks show a precision below 0.4, stop and report the failure rather than spending the remaining token allowance.

**Falsified if.** Arm A's precision is below Arm B's by more than the cost difference justifies (i.e. `tokens_per_confirmed_TP` is not lower for A), or A's severity-weighted recall on the large band is more than 15 points below B's.

**Extension (needs a Docker host, separately authorised).** Replay the same 40 tasks on CRBugBench's 995-task public set for an external check, with the `codex` agent and `gpt-6-luna` — the README's own example command.

**Estimated cost.** 120 review runs of historical diffs. Dominated by Arm B (Sol at $2/$10 per 1M). This is the *one* experiment where spending premium tokens is the point: it buys a defensible answer, not a routing change.

---

## E-2 — Cheap reviewer + deterministic precheck vs repeated premium review  ★★★★☆

**Hypothesis (H2).** Running deterministic prechecks first (tests, lint, typecheck, dependency-audit, diff-scope assertions) and then **one** cheap reviewer produces a lower cost per *verified* defect than running a premium reviewer repeatedly.

**Why second.** This is the mission's hypothesis 6 and 7 combined, and it is the one the external evidence most threatens (E-MA-03/04/05: cheap components that miss create rework). It is also the highest-leverage *policy* if it holds, because it removes the premium reviewer from the common path entirely.

**Arms:**
- **A** — precheck → one `gpt-6-luna`@high review → if RECHECK, one `gpt-6-luna`@high re-review (fresh context per P3)
- **B** — precheck → one `gpt-6.1-sol`@medium review → if RECHECK, one `gpt-6.1-sol`@medium re-review
- **C** — precheck → `gpt-6-luna`@high review → if RECHECK, escalate to `gpt-6.1-sol`@medium re-review (the hybrid)

**Task set.** The same 40 PRs, plus a synthetic *injected-defect* subset: take 20 of the 40 PRs and inject one plausible defect each (off-by-one, wrong branch, missing null check, stale cache read) at a location the original review did not flag. This is what makes the *miss* rate measurable — with only historical real defects, a reviewer that finds nothing is indistinguishable from a reviewer that looked.

**Metrics.** `cost_per_accepted_task` in the mission's exact form — `(execution + retries + reviews + integration + remediation) / accepted tasks` — expressed in **tokens** (and dollars only where a route is actually billed). Plus: `defects_escaped_to_merge` (the headline), `review_rounds`, `rework_events`, and the precheck's own `true_positive_defects_caught_before_review`.

**Falsified if.** Arm A's `defects_escaped_to_merge` is materially above Arm B's, or Arm C (the hybrid) is not cheaper than Arm B — meaning the cheap reviewer's misses cost more downstream than they saved.

**Note.** This is also the experiment that tests auto-office's own model in our setting: `cost_to_success = attempt_cost × (1 + rework_per_review_round × review_rounds) / p_success` (E-AO-12), with its priors (`rework_per_review_round 0.35`, `review_rounds 0.6`, `attempts 1.3`) as the starting point and a local re-fit as the output.

---

## E-3 — Cheap worker vs premium worker on tasks with a deterministic check  ★★★☆☆

**Hypothesis (H4).** `gpt-6-luna`@medium clears the same acceptance rate as `gpt-6.1-sol`@medium on bounded tasks that have a deterministic acceptance check.

**Why third.** The external evidence is *negative* for tiered routing (E-MA-03: 62.2% vs 72.6%, and more API calls), and the mechanism is the capability floor. This experiment tests whether our cheap tier sits *above* the floor for bounded work — which is the single most load-bearing unknown in our fleet, since we already route most builds to Luna-family routes (E-LF-02) without measuring it.

**Design.** 20 historical tasks with a *machine-checkable* acceptance test (a repo test that must go from red to green, or a lint/typecheck gate). Two arms, same fixtures, same acceptance harness, 2 repeats per task (N=40 per arm) for a CI. Metrics: `acceptance_rate`, `iterations_to_green`, `tokens_to_green`, `rework_after_review` (the E-MA-06 decay curve, measured on our own tasks), and a static-quality delta (cyclomatic complexity, maintainability index) because quality is not one-dimensional (E-MA-10).

**Falsified if.** The cheap arm's acceptance rate is more than 10 points below the premium arm at equal task count, **or** its rework-after-review rate is higher — the second half is the important half, because that is the mechanism that erases the cost advantage.

**Why not first.** It is the most likely to be *negative*, and a negative result here is a policy input rather than a capability unlock. It also consumes premium tokens for the comparison arm.

---

## E-4 — Luna at xhigh as a routine orchestrator  ★★★☆☆

**Hypothesis (H3).** `gpt-6-luna`@xhigh can orchestrate a bounded multi-role task (scout → plan → build → review → integrate) at a materially lower quota cost than the current parent-session orchestrator, without losing requirements.

**Why fourth.** Zero evidence exists for this role in any source we found (E-AO-01 is config, not an outcome). The mission names it as a top hypothesis, and our own tier file has no working escalation ladder anyway (E-LF-07) — so there is a real question of what the orchestrator should be.

**Design.** 10 synthetic-but-realistic multi-role tasks over a scratch repo. Metric of record: **requirement retention** — a rubric that lists every requirement from the brief and marks each one as present in the plan, the implementation, and the review; the score is the fraction retained. This is a hand-graded, ground-truth-style metric, and it is the thing E-MA-02 says gets lost.

**Secondary metrics.** `handoffs_dropped_context` (count of requirements lost at a handoff), `orchestrator_overhead_tokens`, `wall_clock`, `tool_calls`.

**Falsified if.** Requirement retention falls more than 10 points below the parent-session orchestrator, or the orchestrator's own token overhead exceeds the saving.

**Cost warning.** A 10-task run at xhigh on Luna is not free but is small; a 10-task run at the *current* parent settings is the comparator. No premium model is needed in this experiment, which is why it is cheap to run — but its *external* validity is weak (single agent family, small n). Treat it as a go/no-go, not a measurement.

---

## E-5 — Fresh-context retry vs resumed retry  ★★★☆☆

**Hypothesis (H5).** A retry that starts a fresh context and carries (goal + acceptance + the previous failure) beats a retry that resumes the failed session, at an equal token ceiling.

**Why fifth — and why it is still worth running.** E-MA-07 measured a 39.6-point gap for the same model depending on whether it arrived fresh or via escalation (42.1% vs 81.7%). Some of that is task difficulty; the experiment is cheap and can separate the mechanism, because it can hold the task constant and vary only the context. It is a **harness change, not a model change**, so it costs no premium quota at all — which is why it belongs on a list whose purpose is to cut Sol/Opus consumption.

**Design.** 20 tasks that are known to fail on the first attempt (from E-3's failure set, or a small injected-defect set). Two arms: resume vs fresh-context retry. 2 repeats per task per arm. Metrics: `second_attempt_acceptance`, `tokens_to_second_attempt`, `context_tokens_replayed`, and the same static-quality delta.

**Falsified if.** No measurable difference in second-attempt acceptance at an equal token ceiling.

**Cost.** Low. No premium model required. Run this one first if the token ceiling is tight — it is the only experiment here that requires no premium spend at all.

---

## 1. Priority, cost and what each buys

| Order | Experiment | Premium spend | Quota saved if it holds | Decision it unlocks |
|---|---|---|---|---|
| (a) | **E-5** fresh-context retry | none | indirect (fewer rounds × premium) | a harness change we can adopt regardless of E-1's outcome |
| 1 | **E-1** Luna reviewer | Sol comparator only | large: moves the common review path off the premium tier | whether `reviewer-luna-high` becomes the default reviewer |
| 2 | **E-2** precheck + cheap reviewer | Sol comparator | large: removes repeated premium review | the two-lane review policy |
| 3 | **E-3** cheap worker | Sol comparator | medium: frees the build path | whether Luna is admissible for bounded builds |
| 4 | **E-4** Luna orchestrator | none | medium | whether the orchestrator role can be demoted |

**If only one experiment is authorised: E-1.** It is the mission's named priority, it is the only one that turns an *assumption currently in production* (we already route reviews to cheap models) into a measurement, and its result is directly actionable: either we keep the premium reviewer, or we demote it for task-scoped lanes with a measured precision floor.

**If no premium spend is authorised at all: E-5 then E-4.** Both run entirely on routes we already use.

---

## 2. Prerequisites that must be built first (and are reusable)

| Prerequisite | Why | Cost |
|---|---|---|
| `ground_truth.json` builder over historical PRs (the CRBugBench shape) | E-1, E-2, E-3 all need it | one script, no inference |
| a defect-matching function (file + line + semantic overlap) | recall needs a *matcher*, not a human, for candidate generation | one script, no inference |
| per-agent token attribution in the workflow run records | today only run-level tokens are recorded (E-LF-01); per-role cost is the deliverable | one extension change |
| a reviewer output parser for the P1 contract | a machine-readable verdict is what makes precision automatable | one script |
| a defect-injection utility for the synthetic subset | without it, "found nothing" is indistinguishable from "looked" | one script |

**None of these requires an LLM.** They are the same deterministic-first discipline the mission asks for, and they are the reason the five experiments are affordable.

---

## 3. What we will not do

- No live change to dispatch, to `pi-config/agents/*`, to `model-tiers.json`, or to any memory file before an experiment returns and the owner ratifies.
- No inference on premium models beyond the comparator arms named above, and no inference at all on Astras, Fable, or Opus without a separate authorisation.
- No "quick check" runs counted as cells: an N=1 measurement is a smoke test and is labelled as one.
- No cross-cell averaging that mixes models, efforts, or task bands into a single savings number.
- No model judge as the primary grader anywhere in these five experiments. A judge grades the judge.
- No CRBugBench run on this host — it has no Docker and 51 GB free. The CRBugBench replication is proposed for a Docker host under a separate authorisation, and it is *not* claimed here as done.
