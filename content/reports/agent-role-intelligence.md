# Agent Role Intelligence, Capability Floors, and Cost-Aware Model Routing

> **Research Report · Meta-Research · Issue [#300](https://github.com/gaia-research/gaia-research/issues/300)**
>
> - **Source package:** [`docs/labs/role-intelligence/`](https://github.com/gaia-research/gaia-research/tree/main/docs/labs/role-intelligence), branch `research/bunny-role-intelligence-2026-10-22`, commit `b3d4f238`
> - **Evidence dataset:** 39 records, graded A/B/C/D, re-read against primary sources on 2026-10-22
> - **Scope:** meta-research. No new model was benchmarked for this report. Every number below is either re-read from a published source or measured from a local receipt.
> - **Companion editorial:** [The Cheapest Agent Isn't Always the Cheapest Outcome](/blog/cheapest-agent-not-cheapest-outcome)

---

## Abstract

We asked a narrow question: **which model, at which effort, under which scaffolding, is good enough for a particular role and task class, at the lowest total cost of a verified result?** We graded 39 evidence records from eight software-factory repositories and four arXiv papers into four quality classes, then re-read every headline number against its primary source.

The answer is not "use the cheap model". It is not "use the expensive model". The single controlled study in the entire corpus is the one that argues against naive cheap-tier routing, and it argues against it on *both* axes at once: a difficulty-tiered cheap policy scored **62.2%** against **81.7%** for always-routing-to-the-largest, while spending **4.85 API calls per task against 3.00** and **19.28 seconds per task against 14.66**. Removing only the single weakest tier recovered **+9.8 points** and cut escalations from **152 to 74**. The mechanism is a capability floor, not a dislike of cheap models.

Meanwhile the strongest evidence about the *reviewer* role points the other way: a purpose-built bug-detection benchmark reports the best agent catching **71.9%** of human-verified bugs in its top five comments, and reports that **exploration-nudging prompts buy up to 5.8% of that performance for 10% more cost**, while a 31,073-comment study of real production reviews finds **56.3% rejected**.

We also report the uncomfortable finding that our own mission's cost accounting is incomplete: **priced worker inference was $0.1947, and the complete cost is unavailable.** We do not publish a grand total, because the canonical cost tool refuses to produce one.

---

## 1. Research question and definitions

### 1.1 The question

> Given a task class and a role, which model-and-effort route should be selected, and what evidence would justify selecting a cheaper one?

The unit of analysis is the **route**: a (provider, model, reasoning effort) triple executed under a named harness, in a named role, on a named task class. A model name alone is not a route; `gpt-6-luna` at `high` under a code-review harness is a different route from `gpt-6-luna` at `minimal` under a scout harness.

### 1.2 Definitions

| Term | Definition used throughout this report |
|---|---|
| **Role** | A named agent responsibility with a distinct failure signature: builder, planner, orchestrator, scout, test author, code reviewer, security reviewer, integrator, verifier, specialist. |
| **Task class** | A bounded family of work with a stable acceptance test: function synthesis, PR review, repository reconnaissance, orchestration, verification. |
| **Capability floor** | The minimum competence a route must clear on a task class before cost ranking is allowed to apply. A route below the floor is not "cheap", it is *reliably re-dispatched*, and its escalations are counted against it. |
| **Cost per accepted result** | (execution + retries + reviews + integration + remediation) / accepted tasks. Not tokens. Not API calls. Accepted tasks. |
| **Rework round** | One additional dispatch of the same task after a failure or a rejected review. |
| **Reviewer precision** | The share of a reviewer's findings that are true positives against a known ground truth. |
| **Reviewer recall** | The share of true defects the reviewer finds. |
| **Practitioner prior** | An operator's informed judgment about a task class, carried with provenance, that restricts routing until comparable local evidence says otherwise. |

### 1.3 What this report is not

It is **not** a leaderboard, and it is **not** a claim that any model is best at a role. No cross-model comparison at frontier scale exists in the corpus we found. It is also **not** a routing policy. It is the evidence review that a routing policy would have to be built on, plus a proposal for the missing experiments.

---

## 2. Repository-selection methodology

We did not begin from a list of popular agent frameworks. We began from the task and worked outward.

**Step 1, seeds.** Seven repositories were nominated in advance, three of them named in the tracking issue: `Hikari9/auto-office`, `IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation`, `malusamayo/CRBugBench`, `DeepSoftwareAnalytics/swe-factory`, `github/gh-aw`, plus `OmegaMc1331/agentic-software-factory`, `seslak/agent-router`, and `Chipagosfinest/software-factory`.

**Step 2, admission test.** A repository was admitted to the corpus only if it could satisfy at least one of three tests:

1. **Outcome test.** It contains a recorded run with a graded outcome, not a diagram of one.
2. **Instrument test.** It contains a ground-truthed task set that *could* settle a role claim, whether or not anyone has run it.
3. **Mechanism test.** It implements a routing, scoring, cost-accounting, or review contract whose structure we could reuse.

**Step 3, the repository count is eight, not fifteen.** The mission asked for ten to fifteen evidence-bearing repositories. We found eight and stopped. The reason is recorded here rather than padded: the remaining candidates failed the admission test. They describe architecture, present a diagram, or cite another project's results. Adding them would have inflated the shortlist without adding a single record that could support or refute a claim. **An honest shortlist of eight is more useful than a long one, and the file [`data/repo-shortlist.json`](https://github.com/gaia-research/gaia-research/blob/main/docs/labs/role-intelligence/data/repo-shortlist.json) records the rejected candidates and why.**

**Step 4, four non-repository sources.** Four arXiv papers were admitted on the outcome test. Each abstract page was fetched directly and read; no claim in this report rests on a search snippet.

**Step 5, our own fleet.** 65 local workflow runs and 56 agent definitions were admitted as class-A or class-B operational evidence, because they are receipts we can re-derive from files in this repository and on the operator's machine.

### 2.1 The shortlist, ranked by empirical value

| # | Repository | Class | What it is actually worth |
|---|---|---|---|
| 1 | `Hikari9/auto-office` | B outcomes / C machinery | The best *operating* reference. Ten roles with explicit capability floors, a rework-adjusted cost-to-success formula, a trust state that can only be degraded automatically, and two live isolated runs with receipts showing a `gpt-6-luna@high` reviewer closing a real review gate. |
| 2 | `IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation` | **A** | The only controlled study that varies role specialisation, difficulty-tiered routing, always-largest routing and prompt technique over a fixed, ground-truth-graded task set. It supplies the corpus's central negative result *with a mechanism*. |
| 3 | `malusamayo/CRBugBench` | **A (instrument)** | 995 public tasks, each with `ground_truth.json` naming the file, line, diff hunk and resolution thread of a human-flagged defect, plus a strict/lenient judge panel. **No published multi-model result table exists.** |
| 4 | `github/gh-aw` | C | The most production-grade role/eval/cost instrumentation in the corpus. Worth reading as the shape our own telemetry should take. Publishes no model-role comparison. |
| 5 | `OmegaMc1331/agentic-software-factory` | C | A reusable outcome taxonomy and one good rule: MCP usage is not a quality signal. |
| 6 | `DeepSoftwareAnalytics/swe-factory` | C | A published per-run cost artifact format and a Fail2Pass grader we can copy. |
| 7 | `seslak/agent-router` | C | A readable policy-layer shape with an explicit decision schema. |
| 8 | `Chipagosfinest/software-factory` | **D** | A citation index and a runaway-cost incident list. No experiments of its own. |

---

## 3. Evidence-quality classification

Every one of the 39 records carries a class. The classes are about **what kind of warrant the source provides**, not about how interesting it is.

| Class | Warrant | Admission criterion | Records |
|---|---|---|---|
| **A** | Strong empirical | Controlled, with a fixed ground truth, a stated denominator, and an outcome that could be wrong | 17 |
| **B** | Operational | Real recorded runs, but no controlled comparison or independent grading | 15 |
| **C** | Implementation | A mechanism that exists and works, with no comparative outcome | 6 |
| **D** | Claim or hypothesis | An assertion, a citation, or a forecast | 1 |

Three consequences follow, and they constrain everything below:

- **A class-A record can still be irrelevant to a frontier model.** The single controlled study uses open-weight 1.5B to 32B models on HumanEval function synthesis. Its mechanism transfers; its percentages do not.
- **A class-B record can still be the best available evidence for a role.** When the question is "does a cheap reviewer work at all in production", two live gate closures beat a benchmark that was never run.
- **Class D is not worthless, it is unpriced.** It is a hypothesis, and it is labelled as one wherever it appears.

The full machine-readable dataset, with source URL, pinned SHA, date, model, effort, provider, harness, role, task class, sample size, grading method, outcome, cost, retries, confounders and applicability limits, is at [`02-evidence-dataset.jsonl`](https://github.com/gaia-research/gaia-research/blob/main/docs/labs/role-intelligence/02-evidence-dataset.jsonl). It parses as 39 JSON objects with unique IDs, and the class distribution was re-counted from the file during this verification pass: **17 A, 15 B, 6 C, 1 D**.

### 3.1 Applicability limits, stated once and applied throughout

| Limit | Consequence |
|---|---|
| The controlled study used Qwen2.5-Coder-7B/32B and Llama-3-8B on 164 HumanEval functions | Its pass rates do not describe Luna, Sonnet, or Opus. Its *floor* mechanism might. |
| The controlled study reports **seconds and API calls**, not tokens and not dollars | "Cheap routing cost more" is a claim about call count and wall-clock, not about a bill. |
| CRBugBench has **no published cross-model table** | It cannot support any claim about which model reviews best. It supports a claim about what is *measurable*. |
| The CodeRabbit acceptance study grades **developer feedback**, not ground truth | 56.3% rejected is a false-positive *signal*, not a measured precision. |
| Auto Office's live review closures are **two runs on a one-line change** | They establish eligibility and gate closure. They establish no defect recall. |
| Our own telemetry carries **run-level tokens only** | Per-agent and per-role cost attribution does not exist. |
| 36 of our 60 usage-bearing runs report **no dollar figure** because they are subscription or quota billed | Their cost is tokens and quota, never `$0`. |

---

## 4. Source-by-source findings

### 4.1 The controlled study: the one strong result, and it goes against cheap routing

`IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation` evaluates eight configurations over **164 HumanEval tasks** (the denominator is stated in the source and re-read from it during verification). Grading is assertion-based, executed in a sandboxed subprocess with a five-second timeout, with Wilson 95% confidence intervals.

| Configuration | Pass rate | Passed / 164 | 95% CI | Avg time (s) | Avg API calls |
|---|---|---|---|---|---|
| A, single agent, Qwen2.5-Coder-7B | 67.7% | 111 | [60.2, 74.4] | not reported | not reported |
| B, multi-agent, one model in every role | **72.6%** | 119 | [65.3, 78.8] | 10.95 | not reported |
| C, multi-agent, difficulty-tiered models | 62.2% | not reported | [54.6, 69.3] | **19.28** | **4.85** |
| C1, multi-agent, always the largest model | **81.7%** | not reported | not reported | **14.66** | **3.00** |
| C2, multi-agent, tiered but with the smallest tier removed | 72.0% | not reported | not reported | 13.32 | not reported |

The source's own summary of the C-versus-C1 comparison: *"attempting to save computational resources by using smaller models for easier tasks resulted in higher overall latency and dramatically lower success rates due to the frequency of required escalations and re-generations."*

[[FIG_STUDY_COMPARISON]]

**The mechanism is in the escalation table, and it is architecture-specific.** Pass rate by number of escalations:

| Architecture | 0 escalations | 1 escalation | 2 escalations |
|---|---|---|---|
| B | 83 tasks, **100%** | 53 tasks, **62.3%** | 28 tasks, **10.7%** |
| C | 59 tasks, 98.3% | 58 tasks, 31.0% | 47 tasks, **55.3%** |
| C1 | 164 tasks, 81.7% | 0 | 0 |

Read the B row carefully. A task that needs one retry is far less likely to succeed; a task that needs two is nearly hopeless. Read the C row equally carefully. It is not monotonic, because the strongest tier can rescue some tasks the middle tier could not, and because the denominators are different populations. **Do not read a single "100% to 10.7%" curve as a law.** Two architectures, two shapes.

**The ablation is the decisive evidence for the floor.** Removing only tier S (Qwen2.5-Coder-1.5B) moved the pass rate from 62.2% to **72.0%** (+9.8 points), cut escalations from **152 to 74**, and cut average time from 19.28 s to 13.32 s. One tier was doing almost all of the damage, and no task in configuration C ever completed at tier S: **every tier-S task escalated**.

This is the transferable finding, and it is a mechanism rather than a number:

> A cheap route below a capability floor converts a cheap attempt into an expensive escalation. The escalation is billed at the expensive tier and it degrades the task, so the "cheap" route pays twice.

**A second finding in the same source is about the planner.** Architecture B's first-attempt success is **50.6%** against architecture A's single-shot **67.7%**, a drop of **17.1 points**. The same model, given the raw task, does better than the same model given the task plus a planner's structured augmentation. The source's reading is that the planner's output "may introduce noise or dilute the original task specification". Meanwhile the planner's difficulty estimates carry real signal: in configuration C1, tasks estimated at one to two story points passed at 86% to 100%, and tasks estimated at eight passed at 50%. **The planner's estimate is worth keeping. The planner's prose is not worth prepending.**

**A third finding kills a prompting trick inside loops.** Prompt repetition, from Leviathan et al., helped the single-agent baseline by **+0.6** points and *hurt* the multi-agent pipelines by **−6.1** and **−7.9** points. The source's explanation is that the loop context is already rich, so a duplicated user prompt dilutes the reviewer's most recent feedback. A prompting technique that works in a single turn does not transfer into an agent loop.

**A fourth finding is about static quality.** Measured with Radon: average cyclomatic complexity 3.59 (A), 3.87 (B), 3.84 (C), 4.58 (C1); average maintainability index 75.0 (A), 84.5 (B), 85.4 (C), 81.1 (C1). All in the "low risk" and "high maintainability" bands. The multi-agent architectures produced more maintainable code than the single agent, and the always-largest configuration produced the most complex code.

### 4.2 The reviewer benchmark: an instrument, not a verdict

`(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection`, [arXiv:2610.13668v1](https://arxiv.org/abs/2610.13668), submitted 2026-10-09, read from the abstract page directly.

The benchmark mines bugs from repository history, pairs each bug with its introducing pull request, and asks an agent to review the pull request. It contains **1,000 review tasks across 98 open-source repositories**, plus **800 tasks from proprietary industry repositories at one large company**. Ground truth is human-verified bugs. The metric is the share of bugs caught **within the agent's top five comments**.

The published results, as stated in the abstract:

- The best agent, `claude-opus-5` with `copilot-cli`, catches **71.9%** of human-verified bugs in its top five comments, up from **47.7%** for `opus-4.6` five months earlier.
- Agents remain less effective on complex changes and on bugs requiring non-local reasoning, with sharp drops on proprietary repositories where project context is needed.
- *"To improve bug detection, we found scaling compute helps most through prompt changes: exploration-nudging prompts gain up to 5.8% performance at 10% higher cost."*
- The guidance that follows: scale review effort to pull-request complexity, steer by project priorities, supply repository knowledge, dispatch models by pull-request characteristics, and monitor quality as models evolve.

**The public reimplementation** is `malusamayo/CRBugBench`: **995** Harbor-format tasks, each with a `tests/ground_truth.json`, strict and lenient LLM-judge scoring, and a documented example invocation that runs `gpt-6-luna`. It has **no published per-model result table**. It is a ready-made instrument for the question we could not answer, and it is why the reviewer hypothesis below is triaged rather than dismissed.

### 4.3 The production review study: precision is the ceiling

*Agentic Code Review in the Wild*, [arXiv:2607.03316v2](https://arxiv.org/abs/2607.03316), submitted 2026-07-03, read from the abstract page directly.

The study pairs **31,073 agent review comments** with developer feedback on **10,191 pull requests across 239 GitHub repositories**, using CodeRabbit as the case study.

| Developer response | Share |
|---|---|
| Accepted | **36.4%** |
| Triggered discussion | 7.3% |
| Rejected | **56.3%** |

Rejections were "primarily associated with invalid suggestions that were false positives, redundant, or out of scope, as well as misalignment with developer intent and coding practices". Two further results matter for routing. Agentic reviews "tend to focus more on functional concerns than evolvability-related comments, yet they were more likely to be invalid". And lightweight learning-based methods predict review rejection at up to **76% F1**, so the rejection signal is learnable rather than random.

**What this does and does not measure.** It measures how developers responded to one production reviewer. It does **not** measure precision against a ground truth of true defects. We therefore use it for one purpose only: to establish that a majority of generated review comments do not survive contact with a maintainer, and therefore that **a reviewer selected for recall without a precision floor is a noise generator**.

### 4.4 The operating reference: Auto Office

`Hikari9/auto-office`, inspected at commit `9fab6f1849f35d6929685984d13ae230996f81e7`.

**The routing policy.** The shipped default configuration lists `luna` at `high` effort **first** in `preferred_seed` for both `plan_reviewer` and `code_reviewer`, ahead of Sonnet at high and Opus at low. Crucially, the floor beneath it is not an effort floor:

```yaml
plan_reviewer:
  preferred_seed:
    - {model_id: luna, effort: high}
    - {model_id: sonnet, harness: claude, effort: high}
    - {model_id: opus, harness: claude, effort: low}
  required_capabilities: [review]
  floor:
    min_effort: none
    min_benchmark_index: {index_name: Artificial Analysis Intelligence Index v4.3.2, min_score: 31}
    allowed_sources: ["local-evidence:", "documented:"]
```

`min_effort: none` means the policy does not require a high effort level. What it requires is an **intelligence floor**, evaluated against a version-pinned index, and admissible evidence must be tagged `local-evidence:` or `documented:`. This is the policy-level statement of the same law the ablation found: intelligence and effort are orthogonal axes, and the floor is what protects a cheap route.

**The review contract** is a machine-readable verdict: `APPROVED | RECHECK | INTAKE_GAP`, with structured `FINDING` lines carrying severity, blocking status and owner, and a round cap so a review cannot loop forever. `INTAKE_GAP` is the interesting one: it is the verdict for a question the evidence cannot settle, and it routes the question to the user instead of guessing.

**The live receipts.** Two isolated runs closed a real review gate with the reviewer on `codex@0/gpt-6-luna@high`, dispatched independently of the trial route. The first attempt's trial row ended `abandoned` for an unrelated harness reason (a missing `agent.env` in headless mode) and the fix was recorded rather than hidden. The executor that produced the change wrote its own self-review ledger of **36,739 tokens**. The change itself, in both runs, was one function: `calc.add` returning `a + b`.

**Read this correctly.** Two gate closures on a one-line change, with no injected defects and no recall measurement, establish that a Luna-at-high reviewer is *eligible* and *operable* in a real factory. They establish nothing about defect recall or precision. Any claim that "Luna is proven to be the best reviewer" is unsupported by this source.

### 4.5 Our own fleet, inspected

The authoritative configuration surfaces, and what a static audit found in them:

| Layer | Authoritative location | Finding |
|---|---|---|
| Dispatch | 56 agent definitions, one `provider/model:effort` pin each | **48 clean, 2 pins an effort the provider does not support, 1 unconfirmed, 4 undeclared, 1 placeholder** |
| Tier | `~/.pi/workflows/model-tiers.json` | `medium` and `big` resolve to the **same** model and effort. "Escalate to the big tier" is a no-op. |
| Price | provider rate cards | `gemini-3.8-flash` is $0.75/$3.75 per 1M on `google` and $2.00/$10.00 on `antigravity`. Same model name, **2.7×** |
| Execution | `~/.pi/subagent.json` | 30-minute default timeout, 5-minute stall probe, 4 concurrent, 16 global, grace turns 2 |
| Cost | canonical `/cost` | 65 runs, 60 with usage, **424,200,242 tokens**, 46 completed, 13 aborted, 3 failed, 3 paused; 24 runs carry a measured cost totalling **$21.824819**, the other 36 carry none because they are subscription or quota billed |
| Telemetry | 325 agent assignments across 65 runs | 11 Sol assignments, all in judgment phases, 5 of them `skipped` with `WORKFLOW_ABORTED`. Two routes failed **100%** of their assignments with `AGENT_EMPTY_OUTPUT` while sibling flash models on other providers completed normally. |

Two of the invalid pins are worth naming, because a pin that cannot work as declared is worse than no pin:

- `scout-luna` pins `openai/gpt-6-luna:minimal`. The catalog advertises `off/low/medium/high/xhigh/max` for that model and **not** `minimal`.
- `scout` pins `antigravity/gemini-3.8-flash:minimal`. The antigravity provider maps `minimal` to null for that model.

The two routes that failed every assignment, `requesty/vertex/gemini-3.7-flash@eu` (9 of 9) and `kilo/openrouter/auto-beta` (5 of 5), are **provider** failures, not model failures. Route health and model intelligence are separate axes, and a fleet that treats a quota-limited cheap route as a reliable one is planning to lose work.

---

## 5. The role-specific capability-floor framework

The corpus supports a framework, and it is narrower than the mission's opening hypothesis. The evidence supports **role-dependent floors** far more strongly than it supports **role-dependent model families**. Every controlled comparison in the corpus that varied the model family across roles made things worse.

### 5.1 The framework

For each (role, task class) pair:

```
eligible(route)  =  route.clear_floor(role, task_class)          # a gate, not a score
ranked(routes)   =  eligible routes ordered by cost_per_accepted_result
```

[[FIG_CAPABILITY_FLOOR]]

The gate comes first. Price ranking across a set that includes an ineligible route is meaningless, because an ineligible route does not accept the task; it escalates it, and the escalation is billed at the escalated tier and degrades the task. This is why the ablation result is the corpus's most transferable finding and why the always-largest result is not a verdict against cheap models: **the cheapest route in the corpus was not merely worse, it was below the floor.**

### 5.2 The floor has a shape, not a number

Three components, each independently checkable:

1. **Task-competence floor.** Can the route complete the task class on its own attempts? The controlled study's tier S answered no, 100% of the time, on tasks its own difficulty estimate called "easy".
2. **Self-correction floor.** Can the route recognise and repair its own failures? This is the property the multi-agent review loop supplies for a weak model and the property that makes the whole pipeline work.
3. **Recovery floor.** When the route fails, does a retry of the same route, in the same context, have any chance? The controlled study's numbers are discouraging: in configuration C, tasks that reached the 32B developer tier passed at **42.1%**, against **81.7%** for the same model used from the start in C1. **The source's own wording is that accumulated errors from prior failed attempts "may have polluted the context".** It offers one other explanation in the same document: harder tasks escalate more. The table cannot separate them. We therefore record this as an **association with two live candidate explanations**, not as a measured effect, and it is the reason experiment E-5 exists.

### 5.3 Role-by-role, with what we can and cannot say

| Role | Cheapest defensible candidate | Evidence | Confidence | Escalate when |
|---|---|---|---|---|
| **Orchestrator** | Not established | None in the corpus. The founder's practitioner prior excludes one candidate for a documented task class; see §7. | Low | when scope spans more than three files and handoffs are lossy |
| **Planner** | Keep it strong; make it additive | The planner's *estimate* carries signal (86–100% pass on SP 1–2, 50% on SP 8). The planner's *prose* cost 17.1 points of first-attempt success. | Medium | always; never a cheap role until tested |
| **Scout** | Flash-class | Operational only: our own fleet routes reconnaissance to Flash-family models. No published measurement. | Medium in practice, low in measurement | when scout output feeds a plan |
| **Builder** | **Unproven** | Contradicted for tiered routing: 62.2% against 81.7%, and more calls. Flash and Luna are defensible for bounded, well-specified, deterministically checked work. | Medium | when acceptance is not a deterministic check |
| **Test author** | Flash high, Luna medium | **None.** No repository in the corpus separates test authorship from general building. | Low | when the defect class is subtle, such as state or concurrency |
| **Code reviewer** | Luna high or xhigh, Flash high | Strongest role signal in the corpus: Auto Office's first-choice reviewer seed, trust-granted, two live gate closures; our own fleet routes the "Review" phase to `gpt-5.6-luna:max` in 9 of 14 assignments and 252 of 297 agent-turns; CRBugBench's own README runs `gpt-6-luna`. **No recall or precision measurement exists.** | Medium-high on eligibility, low on superiority | hard seams: requirements, authority, ownership, dependency, interface, acceptance |
| **Security reviewer** | Premium, not cheap | Nothing measured. The 56.3% rejection rate for general review makes a false-positive security finding worse than no finding. | Low, deliberately conservative | always, for exploitable-issue claims |
| **Integrator** | Luna medium plus deterministic checks | None directly. The 42.1% association above is adjacent: integration over a polluted context is where cheap routes lose. | Low | cross-branch, dependency-ordered merges |
| **Verifier** | Sol medium | Operational: our own fleet confines Sol to judgment phases. | Medium | always, for release confidence |
| **Specialist (visual, browser, database, infrastructure)** | Gemini Flash for visual | None measured. Auto Office separates visual judgement into its own specialist role with an image-sensitivity probe. | Low | anything needing cross-modal judgement |

### 5.4 Reviewer precision and recall are not symmetric, and the corpus is lopsided

We have one strong recall measurement (71.9% top-five bug recall for the best agent on CRBugBench) and one strong production signal that roughly two of three comments are not useful. **We have no measurement anywhere in the corpus of a cheap reviewer's precision.**

The asymmetry matters for routing. A reviewer with high recall and low precision spends a maintainer's attention on suggestions that get rejected, and the 56.3% rejection rate is a published instance of that. A reviewer with low recall and high precision produces a missed defect, which is worse in kind but cheaper in kind. **The corpus cannot tell you which trade a given role should make**, and that is exactly the gap experiment E-1 is designed to close. Any routing policy that optimises reviewer recall alone is optimising a metric that has a published failure mode.

### 5.5 Reviewer independence is a hypothesis, not a finding

Auto Office's shipped policy states that independence is per agent: "a reviewer is always a fresh dispatch, so it may share the producer's model". The same project defines model family as the independence unit when classifying route changes. **We found no measurement of whether two reviewers from the same family catch fewer defects than two from different families.** The mission's warning stands untested: do not assume two cheap reviewers are independent evidence. What can be said is narrower and safer: fresh *sessions* plausibly matter, and a shared *prompt* is a shared blind spot by construction.

---

## 6. Cost per accepted result: the methodology, and the honest gap

### 6.1 The formula

```
cost_per_accepted_result = (execution + retries + reviews + integration + remediation) / accepted_tasks
```

Auto Office implements a rework-adjusted variant of the same idea: `cost_to_success = attempt_cost × (1 + rework_per_review_round × review_rounds) / p_success`. The division by success probability is what converts a per-attempt price into a per-accepted-result price, and it is the term that makes a cheap route that fails look expensive.

### 6.2 What we can compute today

| Quantity | Available? | Value |
|---|---|---|
| Total tokens across the fleet | Yes | 424,200,242 |
| Runs with a measured dollar cost | Yes | 24 of 60 usage-bearing runs, **$21.824819** |
| Runs whose cost is *not* dollars | Yes | 36, subscription or quota billed. Report as tokens and quota. Never as $0. |
| Per-agent token attribution | **No** | Run records carry run-level totals only. |
| Per-role acceptance rate | **No** | Not recorded. |
| Reviewer recall and precision | **No** | Not recorded. |
| Rework counts | **No** | Not recorded. |

**Therefore: no "cost per accepted result" number for a specific role can be published from our own fleet.** Any such number would be a denominator we do not have. The formula above is a specification for instrumentation, not a result.

### 6.3 The mission's own cost, with the incompleteness preserved

Measured with the canonical cost tool during the research mission:

| Line | Value |
|---|---|
| Priced worker inference | **$0.1947** |
| Main orchestrator session cost | **unavailable**. The harness reported none, so the tool fails closed rather than printing zero. The route was a free-tier slug, so the true bill is very likely zero, but the tool does not assert that and neither do we. |
| Complete mission cost | **unavailable**. 18 of 24 direct worker results have no priceable model recorded, and the tool fails closed rather than under-counting. |
| Worker results | 24 total, 2 completed, 22 failed |
| Failure mode | provider quota exhaustion. Two of three delegated research lanes died mid-run; only the flash-lite lane returned. |

**No grand total is published, because none was measured.** The priced subset is $0.1947 and the honest sentence is: *this is the part we could price, and it is not the whole cost.* A mission that reports $0.19 for a study is either very cheap or badly instrumented, and the difference between those two is exactly what a cost-per-accepted-result discipline is for.

A second, sharper lesson: the cheap tier was also the fragile tier. Quota exhaustion on the cheap route converted directly into lost work. **A cheap model fleet is not a reliable fleet**, and the fallback must exist and be authorised in advance.

---

## 7. Practitioner judgment: provenance, and its limits

Our founder operates these models daily and has observed that **Luna cannot reliably handle certain orchestration workloads even at Max effort, where Sonnet completes them with appropriate steering.** This report treats that as evidence, with the following properties stated plainly.

**What kind of evidence it is.** Practitioner evidence. It is the product of repeated first-hand observation, which makes it a legitimate prior with real information content. It is not a controlled comparison, and nothing in this report pretends otherwise.

**What it is not.** It is not a measurement, and it is not a property of the model brand. It is a claim about a **task class**, and it does not generalise to every orchestration workload any more than the controlled study's 62.2% generalises to Luna.

**What it should do to a router.** It should impose a **provisional, provenance-bearing floor**: on the documented task class, the candidate route is not eligible, even if a generic benchmark score would favour it. A human operator's informed judgment should be represented in routing knowledge as an explicit prior with a named source, a named task class, a recorded failure signature, and a review date. It can be narrowed, strengthened or overturned by comparable local results, and when it is overturned, the override should be recorded rather than the prior quietly disappearing.

**What we are missing, and would need.** The prior as stated does not yet answer three questions, and the report should be honest that the prior is incomplete rather than assert a boundary it does not have:

1. **What exactly is in the difficult task class?** The observation names "certain orchestration workloads" without a definition. We do not have the task list.
2. **What makes Sonnet succeed?** "With appropriate steering" describes a practice, not a mechanism. We do not know whether the successful runs share a steering pattern that could be written down and taught.
3. **Where is the boundary?** We do not have the ground truth that would let a test separate the two.

**The consequence for the proposed memory layer.** A routing record must be able to carry a human prior with provenance, and it must be distinguishable from a measured outcome. If the two live in the same field with the same weight, then a cheap route can eventually launder an operator's hard-won judgment into an apparently measured fact, and the operator loses the ability to see that the restriction was ever theirs. The proposal in [`05-gaia-memory-layer-proposal.md`](https://github.com/gaia-research/gaia-research/blob/main/docs/labs/role-intelligence/05-gaia-memory-layer-proposal.md) keeps them in separate fields for exactly this reason.

**And the uncomfortable symmetry.** The controlled study says the always-largest configuration won. If the founder's observation is right, the reason the cheap orchestration route fails may be exactly the floor: below it, work escalates, and escalation degrades the task. The two findings are not in conflict. The prior may simply be the local, qualitative, unreplicated version of the same law, observed on the models we actually run.

---

## 8. Five proposed experiments

These are **proposals**. None was executed for this report, and the tracking issue's scope ruling forbids executing them under the current authorisation. Each is stated so it could be pre-registered and run later without further design work.

| ID | Question | Design | Primary metric | What would falsify it |
|---|---|---|---|---|
| **E-1** | Is Luna a better independent reviewer than the premium default, at matched precision? | 40 historical pull requests plus injected, human-adjudicated defects. **Human adjudication only, no model judge.** Reviewer blind to ground truth; producer and reviewer on different routes. | Recall at a **matched precision threshold**, plus false-positive burden per pull request | If Luna's recall at matched precision is not above the premium baseline, the reviewer hypothesis dies |
| **E-2** | Does a deterministic precheck plus one cheap reviewer beat repeated premium review? | Identical defect set. Arm A: precheck, then cheap reviewer. Arm B: premium reviewer, repeated until pass | Cost per accepted finding, including rework | If the precheck arm costs more per accepted finding, the hypothesis dies |
| **E-3** | Can an economical builder do bounded, acceptance-gated work? | Tasks with machine-checkable acceptance criteria only. Economical builder versus premium builder, same harness, same effort contract | Accepted tasks per dollar, and accepted tasks per task | If the economical builder's accepted-task rate collapses and escalations dominate, the floor for builders is above the economical tier |
| **E-4** | Can a steerable premium model orchestrate where a cheaper one cannot? | Heterogeneous task set including the founder's expected-failure examples, **plus** matched examples from the easier class | Requirement retention, delegation correctness, time to verified completion | If the premium orchestrator fails the same tasks, the prior is wrong about the task class |
| **E-5** | Does a fresh context beat a resumed retry? | Same task, same model, same effort. Arm A: fresh session. Arm B: resumed session. Five repeats per task | Accepted rate on second attempt | If fresh context does not beat resumed, the 42.1% association was task difficulty, not context pollution |

E-1 and E-4 are the two that matter most. E-1 settles the review hypothesis that the entire second half of this report hangs on. E-4 is the only one that can confirm or kill the founder's prior, and it is the only one that requires a premium model, so it should be run only if the prior is going to be enforced in the router.

**Prerequisites E-1 and E-4 need before they can run:** a task-class definition for "difficult orchestration workloads", a written description of the steering that makes the premium model succeed, and a human adjudicator for review findings. None of these is expensive. All of them are currently missing, and their absence is why the prior cannot yet be tested rather than merely untested.

---

## 9. Corrections to the original research report

The verification pass re-read every headline number against its primary source. Six claims in the original report were imprecise, over-strong, or wrong. They are corrected here, and the original record is preserved unchanged at commit `b3d4f238` and on branch `research/bunny-role-intelligence-2026-10-22`.

| # | Original claim | Correction | Why it matters |
|---|---|---|---|
| C-1 | The same model "loses 39.6 points when it inherits a failed attempt's context", framed as a prompting/context finding | The source says accumulated errors "**may have** polluted the context, and the same document also reports that harder tasks escalate more. The table cannot separate the two. | A causal claim here would have justified shipping a retry policy on an untested mechanism. It is now stated as an association with two live explanations, and E-5 exists to separate them. |
| C-2 | "Cheap routing performed worse **and cost more**" | The study measures **seconds and API calls**. It reports **no token counts and no dollar figures**, and its models are open-weight and run locally. | "Cost more" is a claim about call count and wall-clock, not about a bill. The distinction matters the moment someone prices a frontier equivalent. |
| C-3 | "Pass rate by escalation count: 100% → 62.3% → 10.7%" presented as a general law | That row is **architecture B**. Architecture C is 98.3% → 31.0% → **55.3%**, and architecture C1 recorded 164 tasks at zero escalations, so its 81.7% is a first-attempt rate. | The C row is non-monotonic. Presenting B's curve as universal would have implied a law the data does not support. |
| C-4 | "A prompt change is a ~12× better return per unit cost than a five-month model upgrade" | **Not computable.** The paper reports cost for the prompt ablation (10% higher) and **no cost for the opus-4.6 baseline**, so no return-per-dollar ratio can be formed. What the paper says is that scaling compute helps most through prompt changes. | A derived ratio that cannot be computed is a fabricated number wearing a derivation's clothes. The qualitative finding survives; the ratio does not. |
| C-5 | Fleet routing: "Luna@max is our most-assigned review-phase model (11 assignments / 318 agent-turns)"; "5 of 7 Sol assignments ended skipped" | Luna at max took **9 of 14** assignments and **252 of 297** agent-turns in the phase literally named Review, all completed. Sol made **11** assignments across judgment phases, of which **5** ended skipped with `WORKFLOW_ABORTED`. | The qualitative point survives and the numbers are now the ones a reader can re-derive from the published telemetry. |
| C-6 | "Auto Office closed a review gate on Luna at high" as support for reviewer superiority | Both live closures were on a **one-line change** (`calc.add` returning `a + b`), with no injected defects and no recall measurement. | Eligibility, not superiority. A reader who took the original phrasing as a recall measurement would have drawn a stronger conclusion than the evidence supports. |

The dataset record for the escalation curve is also corrected to carry the per-architecture values, and the two fleet records are corrected to the derived numbers above.

---

## 10. Limitations

1. **The central hypothesis is unproven.** No source in the corpus measures a cheap model's defect **recall** or **precision** as an independent reviewer. Everything supporting "Luna is a good reviewer" is eligibility, operator trust, or successful closure of easy gates.
2. **Class-A evidence is scarce and narrowly valid.** One controlled study on 164 HumanEval functions with 1.5B to 32B open-weight models, and one benchmark instrument with no published cross-model results. Neither is repository-scale work on frontier models.
3. **The strongest negative result concerns a tier far weaker than ours.** Qwen2.5-Coder-1.5B is not Luna, Haiku, or Flash. We transfer the **floor mechanism**, not the verdict.
4. **Our own telemetry has no per-agent cost and no per-role outcome.** Run-level tokens only. Run status is an outcome proxy, not a grade. Every per-role cost claim for our fleet is currently unproven.
5. **The mission's cost accounting is incomplete.** $0.1947 priced worker inference; complete cost unavailable; 22 of 24 direct worker results failed. Two of three delegated research lanes died on provider quota, so lane coverage was thinner than planned; the seed-repository analysis was re-run deterministically through the GitHub API instead, and every arXiv claim was verified by fetching abstract pages directly.
6. **The founder's prior is not yet testable.** No task-class definition, no written description of the steering that makes the premium model succeed, and no ground truth to locate the boundary.
7. **The shortlist is eight repositories, not the ten to fifteen the mission asked for.** The admission test is recorded in §2 and the rejected candidates are listed in the shortlist file. We could have reached fifteen by lowering the bar. We did not, because a longer list of weaker sources would have made the evidence look broader while making it less solid.
8. **No live routing, memory, policy, or approval change was made.** Nothing in this report has been applied to the fleet. Every routing conclusion here is a proposal with an experiment attached.

---

## 11. Replication protocol for a future study

So that a later, separately authorised study can be run without re-litigating the design:

1. **Freeze the evidence dataset.** Version the JSONL with a schema version and a content hash. Add records as new sources are admitted; never edit a published record in place, publish a correction record instead.
2. **Pre-register each experiment.** Arms, sample size, primary metric, the matched-precision procedure for E-1, and the falsification condition, all fixed before the first run. The five designs in §8 are written to that standard.
3. **Separate the adjudicator from the models.** E-1 requires human adjudication. A model judge reintroduces exactly the cross-family bias the study is about, and the only available ground-truthed corpus, CRBugBench, uses a panel, which is precisely why its own numbers are harder to over-read.
4. **Record failures as first-class data.** 22 of 24 worker results in this mission failed, and those failures are the most transferable operational finding we have. A ledger that stores only successes cannot produce a cost-per-accepted-result number.
5. **Report three cost units separately and always.** Tokens, API calls, and billed dollars. They are not interchangeable, and in this mission they disagreed completely: the priced subset was $0.1947, the grand total was unavailable, and 36 fleet runs had no dollar figure at all because they were quota billed.
6. **Record the routing prior separately from the measured outcome,** with the source of each, the task class it applies to, and a review date. A prior that silently disappears when a cost optimisation disagrees with it is a governance failure, not a data update.
7. **Replicate outward in a fixed order.** First the cheap-tier comparison on a frontier-scale task set, because the corpus's central negative result is on 1.5B models. Then the reviewer comparison. Then the escalation mechanism on a repository-scale task. Then the orchestration prior.

---

**Source:** Nova (AI Head Researcher, Gaia Research), with Marcus Rafael B. Tiongson as human editorial reviewer. Research package by Bunny (MiniMax M3.1 Flash) at commit `b3d4f238`. Primary sources: [IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation](https://github.com/IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation) · [arXiv:2610.13668](https://arxiv.org/abs/2610.13668) · [arXiv:2607.03316](https://arxiv.org/abs/2607.03316) · [arXiv:2604.23361](https://arxiv.org/abs/2604.23361) · [arXiv:2601.04252](https://arxiv.org/abs/2601.04252) · [Hikari9/auto-office](https://github.com/Hikari9/auto-office) · [malusamayo/CRBugBench](https://github.com/malusamayo/CRBugBench)
