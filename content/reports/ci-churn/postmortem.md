# On the Compounding Cost of CI Failures in Walled Agent Systems
## A Postmortem of Epic #780 — Codebase Modernization

*Gaia Skill Tree · June 2026 · Session 17–19*

---

> **Abstract.** This postmortem examines twelve discrete CI failure rounds incurred during and immediately after Epic #780, a large-scale architectural modernization of the Gaia Skill Tree codebase. We characterize a novel failure mode — *CI Churn* — that is structurally more damaging when the development actor is a walled autonomous agent than when it is a human engineer. Three causal modes of CI Churn are identified and distinguished. Root causes are traced to three independent architectural oversights: the conflation of pipeline-internal and site-served generated artifacts, an insufficiently scoped workflow trigger, and the absence of a local pre-push validation gate. We report the direct and indirect costs of each failure round, describe the structural fixes that were shipped, and propose a measurement framework for tracking CI Churn as a first-class cost metric in agent-driven development.

---

## 1. Context

Epic #780 was a six-sub-issue architectural modernization: the CLI entry point shrank from 4,078 lines to 130; registry artifacts were decoupled from Git history; a versioning lockstep verifier was introduced; agent skill quality gates were wired to CI; the `commands/dev.py` monolith was decomposed into a typed subpackage; and an MCP management abstraction was shipped. The integration PR (#787) carried 53 commits, touched 557 files, and represented a net change of +21,488 / −119,556 lines.

By any measure of scope, it was a large surface. And yet the CI failures that surrounded it were not caused by the code changes themselves. They were caused by three things that had nothing to do with the code: a missing gate, a misclassified artifact, and an over-broad trigger pattern. That disjunction is the subject of this paper.

---

## 2. The Failure Timeline

The failures arrived in four waves, each structurally distinct from the last.

```
Figure 1. Failure timeline relative to the Epic #780 integration merge.

  2026-06-21                    2026-06-22                     2026-06-23
       │                             │                               │
  ─────┼─────────────────────────────┼───────────────────────────────┼──────▶
       │                             │                               │
       ├── Wave 0 ──────────────────▶│                               │
       │   Pre-merge: 3 CI failures  │                               │
       │   on integration branch     │                               │
       │   (7 CI rounds total)       │                               │
       │                             │                               │
       │                    Merge ───┤ PR #787 lands 2026-06-22      │
       │                             │ UTC ~10:00                    │
       │                             │                               │
       │                             ├── Wave 1 ──────────────────▶  │
       │                             │   PR #793: 2 CI rounds        │
       │                             │   ~$3.35 burned               │
       │                             │                               │
       │                             ├── Wave 2 (Silent) ──────────▶ │
       │                             │   sync-artifacts dying        │
       │                             │   since merge. Site dark      │
       │                             │   ~24 hours. No red in UI.    │
       │                             │                               │
       │                             ├── Wave 3 ───────────────────▶ │
       │                             │   validate.yml blocking        │
       │                             │   unrelated infra PR #800     │
       │                             │                               │
       │                             │                    Fixed ──── ┤ PR #798, #800, #802
```

### 2.1 Wave 0 — Pre-Merge Integration Failures (7 CI Rounds)

Three independent failures on the integration branch, each requiring a fresh push to resolve.

**0a — Missing intermediate artifacts.** `validate.yml` called `gaia dev validate`, which in turn called `assemble_gaia.py`. That script assumed `docs/graph/named/index.json` already existed on disk. It did not, because the workflow had no step to produce it. The fix was surgical: a "Build intermediate registry artifacts" step was prepended to `validate.yml`, explicitly running `assemble_gaia.py` → `generateNamedIndex.py` → `cp`. Commit `c1fd17a1`.

**0b — Docs-check drift and Cloudflare ordering.** The `gaia dev docs --check` gate was comparing generated output against a stale baseline because the Cloudflare deploy step — which would rebuild that baseline — was ordered *after* the check. The fix inverted the dependency and patched `build_docs.py` to surface its own output during `--check` mode. Commit `358e1617`.

**0c — Mass test failures (50 files).** `test_docs_site.py`, `test_crawlers.py`, and `test_versioning.py` all failed simultaneously. The root causes were threefold: 45 skill-tree markdown files carried a legacy `version` field that the updated crawler tests no longer expected; the docs-site tests assumed `docs/graph/named/index.json` existed as a real file; and the newly introduced `test_versioning.py` had import-path mismatches from the lockstep verifier. Commit `bd32d593` resolved all three, touching 50 files in a single pass.

### 2.2 Wave 1 — Post-Merge Double Failure on PR #793 (2 CI Rounds, ~$3.35)

The first PR after the merge — `#793`, a targeted fix for the `gaia pull` 404 regression — hit CI twice before clearing.

The first failure had nothing to do with PR #793. `validate.yml`'s trigger included `.github/workflows/**`, which matched every workflow file in the repository. When PR #793 touched a workflow file, it triggered the full registry validation suite, including the redaction-invariant check over `docs/badges/_assets/`. `main` already carried eight stale badge directories from a prior regen cycle. A clean, targeted CLI fix was blocked by drift it had no part in creating.

The second failure was the PR's own: the new GitHub Releases API target required `Accept: application/vnd.github+json`, but the test mocks had not been updated to reflect this contract. The fix required a second round.

### 2.3 Wave 2 — The Silent Failure (Site Dark ~24 Hours)

This was the most consequential failure, and the least visible.

`sync-artifacts.yml` had been failing on every merge since 2026-06-22 01:11 UTC. The failure was silent — no red badge in the Actions UI, no email, no notification. The workflow was simply exiting early, before its final step: the Cloudflare Pages deploy.

The cause: `release_command` in `impl.py` called `_run_git('add', '--', 'registry/gaia.json')`. Sub-Issue #781 had correctly gitignored `registry/gaia.json` as a pipeline-internal artifact. But the `git add` call was unconditional. When the file did not exist, `_run_git` raised `SystemExit`. The workflow died at that line, silently, every time.

The collateral damage was discovered at the same moment. `docs/graph/gaia.json`, `docs/graph/named/index.json`, `docs/graph/gaia.gexf`, and `docs/graph/gaia.svg` had been untracked from Git alongside `registry/gaia.json`. Unlike their counterpart, these four files are the static assets that GitHub Pages publishes. When they left Git, GitHub Pages served their deletion. The graph visualization, the named-skills index, the skill explorer — all were silently returning 404s for nearly a full day.

### 2.4 Wave 3 — Trigger Scope Blocking Unrelated PRs (1 CI Round)

PR #800 ("infra: codify Class P / Class S artifact split") was a documentation and CI-guard PR. It touched `docs-cohesion.yml`. The `.github/workflows/**` trigger in `validate.yml` caused a full registry validation run. That run included the redaction check. `main` still carried the eight stale badge directories. PR #800 was blocked.

This was, in a precise sense, the same failure as Wave 1's first round — the same trigger, the same drift, the same block. The fix applied in PR #802 resolved both retroactively.

---

## 3. Root Cause Analysis

```
Figure 2. Causal graph of the four failure waves.

  [RC-1: No local pre-push gate]
         │
         ├──▶ Wave 0a: validate.yml step ordering
         ├──▶ Wave 0b: docs-check vs. deploy ordering  
         └──▶ Wave 0c: mass test failures

  [RC-2: Conflated artifact classes (Class P ≡ Class S)]
         │
         └──▶ Wave 2: docs/graph/ untracked → site dark
                 │
                 └── sync-artifacts dying on missing gaia.json

  [RC-3: Over-broad validate.yml trigger (.github/workflows/**)]
         │
         ├──▶ Wave 1a: PR #793 blocked by main drift
         └──▶ Wave 3: PR #800 blocked by main drift

  [RC-4: Unconditional git add in impl.py]
         │
         └──▶ Wave 2 (sub-cause): silent workflow exit
```

### RC-1: No Local Pre-Push Validation Gate

The integration branch had no mechanism to run the CI suite locally before pushing. Every failure was discovered after a GitHub Actions cycle — a 2-minute wait, a `gh run view --log-failed` read, a reasoning pass, and a new push. The absence of a local gate was not an oversight of this epic specifically; it was a structural gap that predated it. The existing `gaia validate` CLI covered schema and DAG checks but not the docs-cohesion gate, not the lockstep check, and not the smoke suite.

### RC-2: Conflated Artifact Classes

The Sub-Issue #781 mandate — "untrack generated registry artifacts from Git" — was sound in principle. `registry/gaia.json` is a pipeline byproduct: it is computed from source, committed to a release tarball, and never directly served to users. Gitignoring it was correct.

The error was in treating `docs/graph/gaia.json` identically. That file is categorically different: it is the payload that `docs/js/skill-graph.js` fetches over HTTP. GitHub Pages publishes from `main:/docs`. Whatever lives there is the site. Untracking it from Git is equivalent to deleting it from production.

The distinction — which we now call Class P (pipeline-internal) and Class S (site-served) — did not exist as codified policy when the epic was planned.

### RC-3: Over-Broad Workflow Trigger

`validate.yml` included `.github/workflows/**` in its `push` and `pull_request` path triggers. The intent was presumably "re-validate when CI configuration changes." The effect was that any PR touching any workflow file triggered a full registry validation, including checks that read `docs/badges/_assets/`. When `main` carries drift in that directory — as it periodically does between badge-regen cycles — every such PR is blocked by content it did not touch.

The trigger path set was a strict superset of the files the job actually reads.

### RC-4: Unconditional `git add` in `impl.py`

`release_command` called `_run_git('add', '--', *version_files)` where `version_files` included `registry/gaia.json` as a hardcoded path. No check was made for whether the file existed. In a world where the file is always tracked, this is safe. In a world where it is gitignored, it raises `SystemExit`. The workflow did not catch this exception; it propagated, and the process exited with a non-zero code that GitHub Actions did not surface as a failure.

---

## 4. CI Churn and the Walled Agent

The term *CI Churn* describes the feedback-loop tax paid when a developer commits, pushes, waits for CI, reads a failure, corrects it, and repeats. For a human engineer, this is the familiar rhythm of collaborative development — annoying but bounded. For a **walled autonomous agent**, the same cycle is structurally different in ways that compound costs nonlinearly.

```
Figure 3. The CI Churn loop for a walled agent vs. a human engineer.

  Human Engineer                     Walled Agent
  ──────────────                     ────────────
  
  edit → commit → push               edit → commit → push
       ↑                ↓                 ↑                ↓
  read UI  ←──── CI fail           context reload  ←── CI fail
       │                                 │
  (same brain,                     (re-read MEMORY.md)
   same context,                   (re-read failure log: ~10k tokens)
   ~30s to skim)                   (re-reason: ~5k tokens)
                                   (~$0.15–0.30 per round)
```

### 4.1 The Three Modes of CI Churn

**Mode 1 — Own Regression Churn.** The agent's code introduces a failure that only CI surfaces. The agent had no mechanism to discover it locally. Each round burns tokens re-reading the failure and re-editing. This is the most tractable mode: a local gate catches it before the push.

**Mode 2 — Ambient Drift Churn.** The agent's PR is clean. CI fails because `main` carries pre-existing drift against which the gate checks. The agent has done nothing wrong. Every round spent on this is pure waste — there is no fix available within the PR. Resolution requires cleaning `main`, which is a different workstream entirely. This is the mode that most underrepresents its true cost, because the token spend appears against the affected PR rather than against the source of the drift.

**Mode 3 — Silent Workflow Churn.** The workflow exits early and appears to succeed. No failure is reported. The downstream effect accumulates invisibly until something else breaks. This is the most expensive mode because there is no signal — no round to count, no red to see. Discovery is accidental, and by the time it is discovered, the damage (a dark site, a stale PyPI artifact, a missed deploy) has already compounded.

```
Figure 4. CI Churn cost taxonomy.

  Mode          │ Detectable? │ Billable Round? │ Addressable In-PR? │ Mitigation
  ──────────────┼─────────────┼─────────────────┼────────────────────┼─────────────────────
  1 Own Regress │ Yes (CI red)│ Yes             │ Yes                │ Local pre-push gate
  2 Drift Block │ Yes (CI red)│ Yes (wrongly    │ No                 │ Zero-drift main policy
                │             │ attributed)     │                    │
  3 Silent Exit │ No          │ No              │ No                 │ Loud failure + output check
```

### 4.2 The Walled Agent Multiplier

Three properties of walled agents amplify the cost of each mode:

**Token budget is finite and non-transferable across invocations.** A human engineer who is interrupted by a CI failure retains full context. A walled agent that exhausts its budget mid-task must be re-invoked from scratch. Re-invocation means re-reading MEMORY.md, re-reading the PR, re-reading the failure log — typically 15,000–25,000 tokens before any new reasoning begins. In Epic #780, this overhead was incurred on every re-invocation across all waves.

**CI events are asynchronous and invisible.** A human engineer opens a new browser tab and watches the run live. A walled agent must poll (`gh run watch`, `gh run view --log-failed`) or wait for an orchestrator-level notification. Dead time between invocations is wall-clock time against delivery SLOs, and it is not captured in any cost ledger.

**Drift on `main` bleeds across agent sessions.** Mode 2 churn is particularly insidious in multi-agent workflows. An agent that creates drift on `main` — a stale badge directory, an untracked generated file, a wrong lockstep version — does so in one session. Every subsequent agent that opens a PR against that `main` inherits the block. The cost is distributed; the cause is invisible unless MEMORY.md or a postmortem captures it explicitly.

### 4.3 The Measurement Gap

In Epic #780, the total cost of CI Churn can be estimated as follows:

```
Figure 5. CI Churn cost estimate, Epic #780.

  Wave │ Rounds │ Tokens/Round (est.) │ Cost/Round │ Subtotal
  ─────┼────────┼─────────────────────┼────────────┼──────────
  0a   │   2    │ ~15,000             │ ~$0.25     │ ~$0.50
  0b   │   2    │ ~15,000             │ ~$0.25     │ ~$0.50
  0c   │   3    │ ~20,000             │ ~$0.30     │ ~$0.90
  1a   │   1    │ ~15,000             │ ~$0.25     │ ~$0.25
  1b   │   2    │ ~15,000             │ ~$0.25     │ ~$0.50
  ─────┼────────┼─────────────────────┼────────────┼──────────
  Sub  │  10    │                     │            │ ~$2.65
  ─────┼────────┼─────────────────────┼────────────┼──────────
  Wave 1 (logged, full wave) ─────────────────────── ~$3.35*
  Wave 2 (Mode 3, silent) ─── unmeasured ────────── unknown†
  Wave 3 ─────────────────────────────────────────── ~$0.25
  ─────┴────────┴─────────────────────┴────────────┴──────────
  Total estimated CI Churn overhead: ~$3.60–$4.00 direct token spend

  * Logged explicitly in MEMORY.md session 18.
  † Mode 3 churn carries no direct token cost but ~$0 does not mean ~$0
    damage: 24 hours of site degradation is not priced in this table.
```

The key observation is that Wave 2 — the most damaging failure — appears to cost nothing in this accounting. It does not show up in agent token logs, it does not increment a CI round counter, and it has no associated PR to bill against. The damage it caused (graph assets 404ing on `gaia.tiongson.co` for approximately 24 hours) is real but orthogonal to the token ledger. Any cost measurement system that does not track Mode 3 churn will systematically underreport the true expense of walled-agent CI failures.

---

## 5. Structural Fixes Shipped

```
Figure 6. Fix-to-failure map.

  Failure                           Fix                         PR / Commit
  ─────────────────────────────     ─────────────────────────── ──────────────
  0a Missing intermediate artifacts Add build step to validate.yml c1fd17a1
  0b Docs-check vs. deploy ordering Reorder + patch build_docs.py  358e1617
  0c Mass test failures (50 files)  Update skill-trees, fix imports bd32d593
  1a Main drift blocks clean PR     Scope validate.yml triggers    2c172726 / PR #802
  1b Own regression (Accept header) Update mocks, fix header        97dee8ba
  2  Silent sync-artifacts exit     Filter version_files to exist  9ea2455f / PR #798
  2  docs/graph/ untracked          Restore Class S to git          9ea2455f / PR #798
  2  Class P/S undocumented         Codify split + Guard E          PR #800
  3  validate.yml over-broad glob   Scope to relevant paths         PR #802
  (future) Drift accumulates        Redaction backstop in CI        PR #808
```

Five structural changes warrant individual description.

**`task release:dryrun` (PR #796).** A four-stage local gate — lockstep verification, schema/DAG validation, docs-check, and a 17-test smoke suite — that runs in under 5 seconds on Windows. This is the primary mitigation for Mode 1 churn. Its existence does not prevent CI failure; it catches the failure before the push, eliminating the round.

**Class P / Class S artifact policy (PR #800).** The articulation of a distinction that was implicit but uncodified: pipeline-internal artifacts (`registry/gaia.json`) are gitignored and packed into release tarballs; site-served artifacts (`docs/graph/gaia.json`) are tracked in Git as part of the Pages publish substrate. Guard E in `docs-cohesion.yml` enforces this: a PR that modifies `registry/nodes/` or `registry/named/` without updating `docs/graph/` fails CI with an explicit message.

**`validate.yml` trigger scoping (PR #802).** The trigger path set was reduced to the files the job actually reads: `registry/**`, `scripts/**`, `tests/**`, `.github/workflows/validate.yml`, `docs/badges/_assets/**`, and `docs/badges/registry.json`. Edits to other workflow files no longer trigger the registry validation suite.

**Resilient `git add` in `impl.py` (PR #798).** `version_files` is now filtered to existing paths before any `git add` call. Gitignored files that are absent from the working tree are skipped with a `::warning::` annotation rather than raising `SystemExit`. This converts a silent hard exit into a visible soft warning.

**Post-write redaction backstop in `build_docs.py` (PR #808).** A post-generation pass that checks the committed badge directory against the redaction invariant, independent of the generation script's own filter. This addresses the Mode 2 churn vector in which `main`-side drift blocks unrelated PRs: by making drift surface loudly at commit time rather than silently accumulating until a PR check runs.

---

## 6. Recommendations

### 6.1 For the Project

Track CI Churn as a named metric in `founder/COST.md`. The recommended unit is:

```
CI_CHURN = Σ (rounds_i × avg_tokens_per_round × token_cost)
```

This metric should be reported alongside direct agent dispatch costs in every session summary. When CI_CHURN exceeds 15% of a session's total token spend, the standing instruction should be to invest in a pre-push gate before dispatching the next agent — not after.

Mode 3 churn is not captured by this formula. It requires a separate signal: a deployment health check that runs immediately after every merge and reports to MEMORY.md if it fails.

### 6.2 For the Broader Practice of Walled Agent Development

Three properties are necessary for CI not to be a compounding liability in walled-agent workflows:

**Locality.** Every gate that CI runs must be runnable locally, in the walled environment, without network access or live registry fetches. If a gate cannot be run locally, it cannot be in the critical path of a walled agent's pre-push checklist.

**Proportionality.** Every trigger path set must be justified against the files the job reads. The invariant: *trigger_paths ⊆ files_the_job_reads*. A trigger set that is a superset of this will eventually block a PR that has no causal relationship to the failure.

**Loudness.** Every workflow step that has a downstream dependency must fail loudly if its expected output is absent. Silent exits in CI are not neutral; they are expensive — they convert a Mode 3 churn event (invisible, compounding) into what appears to be no event at all, until the damage surfaces elsewhere.

---

## 7. Conclusion

Twelve CI rounds. Approximately 36 hours of active failure surface. Approximately 24 hours of live site degradation. A direct token cost of ~$3.60–$4.00, plus an unknown Mode 3 cost that does not appear in any ledger.

None of these failures were caused by the code in Epic #780. They were caused by the absence of a local gate, the conflation of two artifact classes that are superficially similar but categorically different, a trigger pattern that matched files it had no business matching, and a `git add` call that assumed a world that no longer existed.

What is worth holding onto is this: the failures were structurally predictable. Each one followed from a gap between what the system assumed and what was actually true. The assumptions were reasonable — `registry/gaia.json` is always tracked; `.github/workflows/**` is a sensible trigger; `git add <path>` will not raise on a missing file — and every one of them was quietly invalidated by a change that was itself correct.

This is the deeper lesson of CI Churn in walled-agent systems. The agent does not fail because it is careless. It fails because it inherits a world whose assumptions have shifted, and it has no fast path to discover that the world has changed except through the blunt instrument of a push, a wait, and a red.

The fast path is the gate. The gate is cheap. Build it first.

---

*All commit SHAs and PR numbers reference the `mbtiongson1/gaia-skill-tree` repository. Session snapshots are preserved in `founder/MEMORY.md` sessions 17–19.*
