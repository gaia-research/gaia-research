# A — Research report: role intelligence, agent orchestration and cost-aware model routing

- **Date:** 2026-10-22
- **Branch:** `research/bunny-role-intelligence-2026-10-22` (local; not merged, not pushed, not deployed)
- **Lead:** Bunny / MiniMax · **Companion artifacts:** [`02-evidence-dataset.jsonl`](02-evidence-dataset.jsonl) (39 records) · [`03-role-routing-matrix.md`](03-role-routing-matrix.md) · [`04-prompting-playbook.md`](04-prompting-playbook.md) · [`05-gaia-memory-layer-proposal.md`](05-gaia-memory-layer-proposal.md) · [`06-local-experiments.md`](06-local-experiments.md)
- **Verdict class:** this is a *research* record. Nothing in it changes active dispatch, global memory, or approval policy. Every routing change is a **proposal** with a local experiment attached.

---

## 0. Answering the six questions, first

| # | Question | Shortest honest answer |
|---|---|---|
| 1 | Which repositories give genuine empirical evidence? | Three: **IvanNece/Multi-Agent-Architectures** (class A, controlled + ground-truth, n=164×8 configs), **malusamayo/CRBugBench** (class A, ground-truth reviewer instrument, 995 tasks, *no published multi-model results*), and **Hikari9/auto-office** (class B for outcomes, C for machinery — the only one with live run receipts). The other four seeds are class C machinery or class D synthesis. |
| 2 | Which inexpensive models suit which roles? | The only role where a cheap model is *institutionally* trusted by a third party is **reviewer** (auto-office pins `gpt-6-luna@high` first for both plan_review and code_review, and shipped it in its trust baseline). For **builders**, the evidence is a warning, not a recommendation: cheap-tier routing lost 10.4 points *and* cost more (E-MA-03). For **scouts**, the only measured evidence is that Flash-class models do the job — but that is our own practice, not a measured result. |
| 3 | Where does higher effort beat a higher tier? | On the **reviewer** role, prompting beat both: exploration-nudging prompts gave +5.8 points recall for +10% cost (E-CR-03). auto-office answers the policy version the same way — role floors use *intelligence*, not effort, and effort is a separate axis (E-AO-11). For **builders**, effort is untested in our evidence base; the one controlled study varied *model*, not effort. |
| 4 | Is Luna a disproportionately good reviewer? | **Unproven but triaged.** Evidence for: auto-office routes both reviewer roles to Luna@high and granted it `proven` trust after real runs (E-AO-01, E-AO-04); two of its live runs closed a review gate on Luna@high (E-AO-02/03); our own fleet already routes its most review assignments to Luna@max (E-LF-02). Evidence against / missing: **no defect-recall measurement anywhere**, no precision measurement, n=2 external real runs on trivial defects. CRBugBench is purpose-built and its README runs `gpt-6-luna` — that is the experiment. |
| 5 | Which practices to adopt? | Six, all cheap: a machine-readable reviewer verdict contract (E-AO-14); a capability floor for every cheap route (E-MA-05 shows the floor, not the cheapness, is what matters); fresh-context retries (E-MA-07); no prompt-repetition tricks inside agent loops (E-MA-08); report all blocking findings in one pass; treat diff content as data, not instructions. |
| 6 | Smallest evidence-backed change? | Add a **`reviewer-luna-high`** agent and make the review role a *two-lane* choice (cheap reviewer for standard lanes, premium reviewer for hard seams) — plus fix the two invalid effort pins the audit found (`scout-luna` → `gpt-6-luna:minimal` and `scout` → `antigravity/gemini-3.8-flash:minimal`, both unsupported). Detail in §6 and [`05`](05-gaia-memory-layer-proposal.md). |

---

## 1. What our own system actually is (inspected, not assumed)

The mission said to discover the authoritative configuration rather than assume a filename. There is no single "Gaia model layer" file. The authoritative surfaces are:

| Layer | Authoritative location | What it holds |
|---|---|---|
| **Dispatch (role → model)** | `pi-config/agents/*.md` → installed verbatim to `~/.pi/agent/agents/*.md` (56 files) | one persona per role, each pinning `model: provider/model:effort` |
| **Tier** | `~/.pi/workflows/model-tiers.json` | `small` / `medium` / `big` → model strings |
| **Provider routing** | `~/.pi/agent/extensions/bunny-route.mjs` + `bunny-router.ts` | the `bunny/minimax-m3.1-flash` virtual model; OpenRouter-free → Vercel-AI-Gateway schedule, spend cap, no paid fallback without authorisation |
| **Effort governance** | `pi-config/docs/subagent-thinking-levels.md` | every invocation pins an explicit level; `off`/`minimal` excluded from the Bunny family; no Bunny agent sets `max_turns`/`max_cost` |
| **Execution policy** | `~/.pi/subagent.json` | 30-min default timeout, 5-min stall probe, stall-kill disabled, 4 concurrent / 16 global, `graceTurns: 2` |
| **Cost** | `~/.pi/agent/skills/pi-cost/` (the canonical `/cost`) | session + nested-worker cost, repriced from the public LiteLLM catalogue, missing prices fail closed |
| **Memory** | `gaia-skill-tree/founder/MEMORY.md` (additive snapshots) and `gaia-research/docs/labs/harness-capability-matrix.md` (the version-pinned evidence record) | the two native shapes a routing record should imitate |
| **Telemetry** | `~/.pi/workflows/projects/*/runs/*.json` (65 runs) | per-run token usage + per-agent model/status/phase |

**Findings from the inspection, in order of cost:**

1. **`~/.pi/workflows/model-tiers.json` is a degenerate ladder.** `medium` and `big` both resolve to `google-antigravity/gemini-3.8-flash:high`. "Escalate to the big tier" is currently a no-op in that layer (E-LF-07).
2. **Two agents pin an effort the provider does not support.** `scout-luna` → `openai/gpt-6-luna:minimal` (the catalog maps `gpt-6-luna` to `off/low/medium/high/xhigh/max` and **not** `minimal`), and `scout` → `antigravity/gemini-3.8-flash:minimal` (the antigravity provider maps `minimal → null` for that model). A deterministic audit of all 56 agents: **48 clean, 2 unsupported, 1 unconfirmed, 4 with undeclared support, 1 placeholder** (E-LF-06). Reproducible via [`data/audit_agent_pins.py`](data/audit_agent_pins.py).
3. **Provider is a cost axis, not only an availability axis.** `gemini-3.8-flash` is $0.75/$3.75 per 1M on `google` and $2.00/$10.00 on `antigravity` — the same model name, 2.7× (E-LF-08). On antigravity, `xhigh` and `max` also collapse to the same runtime id, so those two effort labels are not distinct there.
4. **Our single `reviewer` agent is `antigravity/gemini-3.8-flash:high`, and its description still says "powered by GPT 5.6 Sol Low"** — configuration drift in the only role the mission cares most about.
5. **The fleet already routes the way the hypothesis predicts.** In the phase literally named `Review`, Luna@max took 9 of 14 assignments and 252 of 297 agent-turns, all completed. Plain Luna is the most-assigned build-phase model (88 assignments / 650 turns across the SEO, repair-and-apply and record phases). Sol is confined to judgment phases: all 11 Sol assignments sit in Architecture Judgment, Decision and Implementation, Independent Designs, Individual Checks or Review, and 5 of the 11 ended `skipped` with `WORKFLOW_ABORTED` (E-LF-02, E-LF-03).
6. **Two fleet routes failed 100% of the time** (`requesty/vertex/gemini-3.7-flash@eu` 9/9, `kilo/openrouter/auto-beta` 5/5), both with the terminal error code `AGENT_EMPTY_OUTPUT`, while the same flash family on other providers completed normally (E-LF-04). The run files do not record the underlying cause, so "provider" is an inference from the sibling comparison, not a recorded diagnosis. Model intelligence and route health are separate axes either way.
7. **Dollars are not our unit of account.** 24 of 60 usage-bearing runs report a measured cost ($21.82 total); the rest are subscription/quota-billed and report $0. Reporting "cost" as $0 for a subscription run is a false cheapness. Our unit must be tokens + quota burn, with dollars only where actually billed (E-LF-01).

Nothing above was changed. The fleet is untouched.

---

## 2. Ranked repositories and their actual empirical value

Full detail, evidence paths and limits: [`data/repo-shortlist.json`](data/repo-shortlist.json). Ranked by **empirical value**, not stars.

| # | Repository | Role separation? | Real run evidence? | Cost/token accounting? | Class | What it is actually worth |
|---|---|---|---|---|---|---|
| 1 | `Hikari9/auto-office` | 10 roles with capability floors | **yes** — two live isolated runs, receipts, token counts, trust grants | yes (`money_actual`, `economics.py` ledger, routing evidence report) | **B** outcomes / **C** machinery | The best *operating* reference: a routing policy that gates on intelligence, a cost-to-success formula, a trust state that can only be degraded automatically, and live receipts showing a `gpt-6-luna@high` reviewer closing a real gate twice. |
| 2 | `IvanNece/Multi-Agent-Architectures-…` | Planner/Router/Developer/Tester/Reviewer, plus difficulty-tiered model pools | **yes** — 164 HumanEval tasks × 8 configurations, Wilson CIs | yes (tokens, API calls/task, wall-clock, retries, escalations) | **A** | The only controlled study that varies role-specialisation and difficulty-tiered routing. It supplies the mission's central **negative** result with a mechanism. |
| 3 | `malusamayo/CRBugBench` | single agent + 3-model judge panel | **instrument, not results** — 995 tasks with `ground_truth.json` | no | **A** (instrument) | The purpose-built tester for "is Luna a good reviewer". Its own README runs `gpt-6-luna`. No public multi-model comparison has been run. |
| 4 | `github/gh-aw` | role-scoped graders, eval manifests, experiment provenance | machinery only | yes (usage artifacts, AI credits, OTEL grader results) | **C** | The most production-grade role/eval/cost instrumentation we found — worth reading as the shape our own telemetry should take. Publishes no model-role comparison. |
| 5 | `OmegaMc1331/agentic-software-factory` | `performance(agent, role, operation, language)` from local history | machinery only | explicit refusal to invent token/cost numbers | **C** | Its outcome taxonomy and its "MCP usage is not a quality signal" rule are directly reusable. |
| 6 | `DeepSoftwareAnalytics/swe-factory` | named context-retrieval / eval-script agents | machinery only | yes (`scripts/compute_cost.py` over `cost.json`) | **C** | A published per-run cost artifact format and a Fail2Pass grader we can copy. |
| 7 | `seslak/agent-router` | task classes, specialists, cost-aware policy | none | yes (pricing module) | **C** | A readable shape reference for a policy layer with an explicit decision schema. |
| 8 | `Chipagosfinest/software-factory` | topology patterns, case studies | **no** | cited vendor pricing only | **D** | A citation index and a runaway-cost incident list. No experiments of its own. |

Four non-repository sources were verified by fetching the arXiv abstract pages directly (title, authors, date, abstract read, not a search snippet): **arXiv:2610.13668** (CRBugBench, 2026-10-09), **arXiv:2607.03316** (CodeRabbit in the wild, 2026-07-03), **arXiv:2601.04252** (Sphinx, 2026-01-06), **arXiv:2604.23361** (locally deployed LLMs on BugsInPy, 2026-04-25).

**What these repos do NOT prove.** None of them compares a *frontier* cheap model (Luna/Haiku/Flash) against a *frontier* premium model on *repository-scale* work with independent grading. The best controlled study uses 1.5B–32B open models on function synthesis. The best reviewer benchmark has not been run across models in public. **The gap between "what we have measured" and "what we want to know" is exactly the local experiment list in [`06`](06-local-experiments.md).**

---

## 3. The most surprising observations

**3.1 The study that argues *against* cheap-model routing is the strongest evidence we found.**
`IvanNece` ran eight configurations over 164 ground-truth-graded tasks. The difficulty-tiered cheap model policy scored **62.2%**, *below* the single-model-everywhere policy at **72.6%**, while spending **more**: 19.28 s/task and 4.85 API calls/task versus 10.95 s. The study reports seconds and API calls; it reports **no token counts and no dollar figures**, and its models are open-weight and run locally, so "costing more" here means calls and wall-clock, not a bill. Always-largest scored **81.7%** with **3.00** API calls and 14.66 s — best quality *and* cheapest in calls. The authors' own summary: "attempting to save computational resources by using smaller models for easier tasks resulted in higher overall latency and dramatically lower success rates due to the frequency of required escalations and re-generations" (E-MA-03, E-MA-04).

The mechanism is in the escalation table: in architecture B, pass rate by number of escalations was **100% → 62.3% → 10.7%** (E-MA-06). A task that needs a second attempt is roughly twice as likely to fail; a third attempt is nearly hopeless. Architecture C is **not** monotonic (98.3% → 31.0% → 55.3%), because the largest tier can rescue some tasks the middle tier could not, and the two architectures escalate different populations. Read either row as a property of that architecture, not as a law. The ablation isolating the cause is decisive: **removing only the cheapest tier** (Qwen-1.5B) recovered **+9.8 points**, cut escalations **152 → 74**, and cut time **19.28 → 13.32 s** (E-MA-05).

The correct reading is *not* "cheap models are bad". It is: **a cheap route below a capability floor destroys the economics, because it converts a cheap attempt into an expensive escalation.** Our expensive tier must be protected by a *floor*, not merely by a cheaper alternative existing.

**3.2 The same model, arriving via a failed attempt, scored much worse. The cause is not identified.**
In the adaptive pipeline, the identical Qwen-32B developer achieved **42.1%** on tasks that reached it through an escalation, versus **81.7%** for the same model used directly from the start in the always-large configuration (E-MA-07). Two explanations are live and the reported tables cannot separate them. The authors' wording is that accumulated errors from prior failed attempts **may have** polluted the context; the same document separately reports that harder tasks escalate more often, and harder tasks are exactly the population that escalated. This is an **association with two candidate explanations**, not a measured context-pollution effect, and the difference matters: a causal claim here would justify shipping a retry policy on a mechanism nobody has isolated. A fresh context is nearly free, so the hypothesis is worth testing (E-5). It is not yet a finding.

**3.3 A published prompting trick is net-negative inside agent loops.**
Prompt repetition (duplicating the user prompt) helped the single-agent baseline by **+0.6** points and *hurt* the multi-agent pipelines by **−6.1** and **−7.9** points (E-MA-08). Inside a loop, the context is already rich; duplication dilutes the reviewer's latest feedback. Prompting techniques do not transfer across contexts, and "the paper said it works" is not a routing input.

**3.4 The reviewer role is where prompting beats the model upgrade, by a lot.**
CRBugBench: the best agent (claude-opus-5 + copilot-cli) catches **71.9%** of human-verified bugs in its top-5 comments, up from **47.7%** for opus-4.6 five months earlier — a **+24.2 point** swing from model evolution alone. In the same study, **exploration-nudging prompts gained up to 5.8% of performance for 10% more cost** (E-CR-01, E-CR-03). The paper's own summary is that scaling compute helps most through prompt changes, and it reports a cost figure for the prompt ablation **but none for the older model baseline**, so no return-per-dollar ratio can be computed from it. The qualitative claim survives on its own: the prompt is the cheapest lever in the room.

**3.5 Reviewer precision is the real ceiling, and it is low.**
In 31,073 real PR review comments from 239 repositories, **36.4% were accepted, 7.3% triggered discussion, 56.3% were rejected** — rejections dominated by invalid suggestions, redundancy, and out-of-scope comments (E-CR-05). A majority of generated review comments do not survive contact with a maintainer. Reviewer *recall* without a *precision* floor is not value, and any local experiment that measures only recall will produce a routing policy that ships noise.

**3.6 The benchmark that would settle the Luna question runs Luna in its own README.**
CRBugBench's public reimplementation ships 995 Harbor tasks with `ground_truth.json` (exact file, line, diff hunk, and resolution thread of each human-flagged defect) and a judge panel; its documented example is `python scripts/run.py --agent codex --model gpt-6-luna --sample 10` (E-CR-02). The instrument is purpose-built for our question and currently has **no published multi-model result table**. On our host it cannot run: no Docker, 51 GB free, and the benchmark itself warns 19 GB per repository and ~650 GB for the full set.

**3.7 Our own "cheap tier" is a single model whose two top tiers are the same model.**
The tier file maps `medium` and `big` to the same `gemini-3.8-flash:high` (E-LF-07), and that model is priced 2.7× higher on the antigravity route than on google (E-LF-08). So the fleet's *declared* escalation path is (a) not a ladder and (b) expensive per token on the route we use.

**3.8 Cheap routes fail on quota, not on intelligence.**
During this mission two of three parallel scout lanes died mid-run on provider quota exhaustion (`gpt-6-luna` and `gemini-3.8-flash`); only the `gemini-3.5-flash-lite` lane returned (E-LF-05). A "cheap model fleet" is not a "reliable fleet": quota exhaustion on the cheap tier converts directly into lost work, and the fallback must exist *and be authorised in advance*.

---

## 4. Role-specific intelligence: what the evidence supports

The mission's premise — "strong general intelligence is not required for every part of an automated software factory" — is **half supported and half contradicted** by what we found.

**Supported:** the *reviewer* role can be staffed by a cheap, high-effort model (auto-office's shipped policy, twice corroborated by live runs) and reviewer quality responds strongly to prompting (E-CR-03).

**Contradicted, at least in the studied regime:** the *builder* role does not benefit from difficulty-tiered cheap routing, and the study that tested it found the cheap route made the *whole pipeline* slower and less successful. The regime matters: their cheapest tier was a 1.5B model, far below Luna/Haiku/Flash. The transferable law is the **floor**, not the verdict on cheapness.

Role-by-role, with what we can and cannot say:

| Role | Cheapest defensible candidate | Evidence | Confidence | Escalate when |
|---|---|---|---|---|
| **Orchestrator** | Luna Xhigh/Max (ours: `worker-luna-xhigh/max`) | **None directly.** Our own practice: the orchestrator is the parent session, not a routed agent. | Low — untested | when scope spans >3 files and handoffs are lossy |
| **Planner** | Sol medium (ours: `planner-sol` = `gpt-6.1-sol:max`; `planner-argon` = `gemini-4-argon:max`) | **Negative-adjacent:** the Planner's augmentation *lowered* first-attempt success by 17.1 points in E-MA-02, while its difficulty estimate carried real signal (E-MA-09). | Medium — keep the planner strong, but make its output *additive*, not substitutive | always; the planner is not a cheap role until tested |
| **Scout / Researcher** | Flash-Lite minimal, Flash medium, Luna low (ours: `scout-fast`, `scout`, `scout-luna`) | **Operational only:** our own fleet uses Flash-family for the majority of review-phase and discovery work. No published measurement. | Medium (practice), Low (measurement) | when the scout's output feeds a plan (E-MA-02's dilution risk) |
| **Worker / Builder** | **Unproven.** Flash high / Luna medium are defensible for bounded, well-specified tasks. | **Contradicted for tiered routing:** E-MA-03/04/05. | Medium | when the task's acceptance is not a deterministic check |
| **Test author** | Flash high, Luna medium | **None.** No repo we found separates test authorship from general building. | Low | when the defect class is subtle (state, concurrency) |
| **Code reviewer** | **Luna high/xhigh; Flash high.** | **Strongest role signal.** auto-office pins it first (E-AO-01), grants it trust (E-AO-04), and closed two live gates with it (E-AO-02/03) — on a one-line change, with no recall or precision measurement. Our own fleet routes the phase named `Review` to `gpt-5.6-luna:max` in 9 of 14 assignments (E-LF-02). CRBugBench's README runs Luna (E-CR-02). | Medium-high on *eligibility*, **Low on *superiority*** | hard seams (requirements, authority, ownership, dependency, interface, acceptance) |
| **Security reviewer** | Premium, not cheap | **None measured.** E-CR-05 shows a >56% rejection rate for general review; a security reviewer that invents findings is worse than none. | Low — deliberately conservative | always for exploitable-issue claims |
| **Integrator** | Luna medium + deterministic checks | **None directly.** E-MA-07's context-pollution finding is adjacent: integration over polluted context is where cheap routes lose. | Low | cross-branch, dependency-ordered merges |
| **Verifier** | Sol medium (ours: `worker-sol`) | **Operational:** our fleet confines Sol to judgment phases. All 11 Sol assignments sit in Architecture Judgment, Decision and Implementation, Independent Designs, Individual Checks or Review, and 5 of the 11 ended `skipped` with `WORKFLOW_ABORTED` (E-LF-03). | Medium | always for release confidence |
| **Specialist (UI/visual, browser, DB, infra)** | Gemini Flash for visual (ours: `antigravity/gemini-3.8-flash` — auto-office's first visual preference is the same) | **None measured.** auto-office separates visual judgment as a distinct specialist role with an image-sensitivity conformance probe. | Low | anything requiring cross-modal judgement |

**The answer to "do not assume the same model is best at every role":** the evidence supports *role-dependent effort* and *role-dependent capability floors* far more strongly than it supports *role-dependent model families*. Every controlled comparison we found that varied the model family across roles made things **worse** (E-MA-03). What varied successfully was the **floor** (E-MA-05), the **prompt** (E-CR-03, E-MA-08), and the **context** (E-MA-07).

**On reviewer independence (the mission's explicit question):** auto-office's shipped policy says independence is *per agent* — "a reviewer is always a fresh dispatch, so it may share the producer's model" — while separately defining `model_family()` as "the independence unit for review" for classifying route changes (E-AO-13). We found **no measurement** of whether two reviewers of the same family catch fewer defects than two of different families. The mission's warning stands untested: **do not assume two cheap reviewers are independent evidence.** The one thing we can say is that fresh *sessions* matter (E-MA-07), and that a shared *prompt* is a shared blind spot by construction.

---

## 5. Cost-adjusted routing: what can and cannot be computed

**The formula** (mission-specified, and implemented in auto-office as `cost_to_success = attempt_cost × (1 + rework_per_review_round × review_rounds) / p_success`, E-AO-12):

```
Expected cost per accepted task
  = (execution + retries + reviews + integration + remediation) / accepted tasks
```

**What we can measure in our own fleet (E-LF-01):** 65 runs, 60 with token usage, 424.2M total tokens, 46 completed / 13 aborted / 3 failed / 3 paused, 24 runs with a measured cost totalling **$21.82**. For the remaining 36, dollars are *unavailable* (subscription/quota-billed) — they must be reported as tokens and quota burn, never as $0.

**What we cannot measure yet, and must not pretend to:** per-agent token attribution (the run records carry run-level totals only), per-role acceptance rate, reviewer recall/precision, and rework counts. Until those land, every "cost per accepted task" number for a *specific role* is **unproven**.

**The seven routing hypotheses, adjudicated:**

| # | Hypothesis | Verdict | Basis |
|---|---|---|---|
| 1 | Luna Xhigh/Max as routine lead vs Sol Medium | **Unproven.** No head-to-head exists. Note the counter-pressure: E-MA-03/04 say always-strong won in the studied regime, and auto-office records Sol "using far more tokens in practice than its advertised cost suggests" (E-AO-06). | no data |
| 2 | Luna High/Xhigh/Max as reviewer vs Sonnet et al. | **Plausible and partially corroborated, not proven.** auto-office's shipped first choice + two live runs + our own routing practice + a purpose-built benchmark whose README runs Luna. No recall/precision measurement. | E-AO-01/02/03/04, E-LF-02, E-CR-02 |
| 3 | Haiku High/Xhigh worker vs Sonnet Medium | **Unproven and untested in our fleet.** Haiku 5.5 is enabled in `settings.json` but has **no agent persona at all**. Note the pricing coincidence: Haiku 5.5 and GPT-6 Luna are both **$0.10/$0.50** per 1M, and Haiku 5.5 is 5× more expensive above 100k prompt tokens. | no data; fleet gap |
| 4 | Bunny High vs alternative economy workers | **Unproven.** The Bunny family exists, has explicit effort governance and a no-paid-fallback rule — but the free window is `2026-10-22T12:00:00Z`, i.e. **today**. | no data; deadline |
| 5 | Flash/Flash-Lite scouting vs stronger research agents | **Operationally true in our fleet, never measured.** | E-LF-02 |
| 6 | Cheap independent reviewer + cheap worker vs premium worker alone | **Unproven, and the risky one.** E-MA-03 is the direct warning: a cheap worker that misses produces rework that the premium reviewer then has to find — and the architecture-B escalation curve (100% → 62.3% → 10.7%) says the *whole task* degrades. This is hypothesis 1's failure mode: two cheap components can be more expensive than one premium component. | E-MA-03/04/05/06 |
| 7 | Deterministic prechecks + one cheap reviewer vs repeated premium review | **Most promising untested hypothesis.** It is the one that respects the rework economics: a deterministic check either passes (cheap reviewer runs) or fails (no reviewer effort wasted). | proposal, E-06 |

**Where higher reasoning effort beats moving up a tier — the direct answer:**
- *Reviewer role:* the benchmark's own guidance is that scaling compute helps most through **prompt changes** (E-CR-03, +up to 5.8% at 10% higher cost), and its recommendation is "scaling review effort to PR complexity" (E-CR-04). A return-per-dollar ratio against model evolution cannot be computed, because the paper reports no cost for the older model baseline. Effort escalation inside a fixed model is untested in the corpus.
- *Builder role:* effort was never varied in any controlled study we found. Our own effort axis is wide open for measurement, which is an opportunity, not a finding.
- *Policy-level:* auto-office's answer is that intelligence and effort are **orthogonal axes** — the reviewer floor is `min_effort: none` plus an intelligence index ≥ 31, so a cheap model at high effort and a strong model at low effort are both admissible, and the *floor* is what protects the cheap route (E-AO-11, E-MA-05).

---

## 6. The smallest evidence-backed change to the fleet

Ordered by evidence strength ÷ risk. Each is a **proposal**; none was applied.

| # | Change | Why it is evidence-backed | Risk | Cost |
|---|---|---|---|---|
| **1** | **Fix two invalid effort pins**: `scout-luna` → `gpt-6-luna:low`, and `scout` → `antigravity/gemini-3.8-flash:low`. | Static audit of all 56 agents; `gpt-6-luna` advertises `off/low/medium/high/xhigh/max` and not `minimal`, and antigravity maps `minimal → null` for `gemini-3.8-flash` (E-LF-06). | None — neither pin can work as declared. | zero |
| **2** | **Add `reviewer-luna-high`** (`openai/gpt-6-luna:high`, tools `read, grep, find, ls, bash`) alongside the existing `reviewer`. Do **not** repoint `reviewer` yet. | auto-office's shipped first-choice reviewer seed, trust-granted, and closing two live review gates; CRBugBench's README runs exactly this model+role (E-AO-01/02/03/04, E-CR-02). | Low: additive, no dispatch change, no escalation. | zero until used |
| **3** | **Give the reviewer a machine-readable verdict contract** (APPROVED / RECHECK / INTAKE_GAP + FINDING lines with severity, blocking, owner), instead of free prose. | auto-office's contract is the most transferable artifact found; the reviewer is a cheap model and cheap models need cheap-to-parse outputs (E-AO-14). And the ground truth for a local review task must be machine-checkable anyway (E-CR-05's 56% rejection rate is partly an output-shape failure). | Low. | zero |
| **4** | **Add a capability floor to every cheap route** (a cheap route must clear a named bar before it is selected). | The single most transferable experimental result we found: removing the too-weak tier recovered +9.8 points and halved escalations (E-MA-05). auto-office encodes the same thing (E-AO-11). | Low–medium: a floor excludes routes that currently work. | zero |
| **5** | **Make retries fresh-context** where a retry currently resumes. | Same model, 42.1% on escalated tasks vs 81.7% direct (E-MA-07). An **association**, with task difficulty and context accumulation both live; the change is cheap enough to test before it is believed. | Medium: loses warm context. | may raise tokens |
| **6** | **Fix the tier ladder** — give `big` a genuinely stronger model, and note that antigravity's `max` ≡ `high`. | The ladder is currently a no-op (E-LF-07), and effort labels are not distinct on that provider (E-LF-08). | Medium: changes routing. | depends on the model chosen |
| **7** | **Do not ship a review→build routing rule yet.** | The only controlled study of role-tiered routing lost on both quality and cost (E-MA-03). | — | — |

Changes 1–3 are zero-risk, zero-cost, and evidence-backed. Change 4 is the highest-leverage policy change. Changes 5–6 need a local experiment first ([`06`](06-local-experiments.md)).

---

## 7. Honest limits of this report

- **The central hypothesis is unproven.** No source we found measures a cheap model's defect **recall** or **precision** as an independent reviewer. Everything supporting "Luna is a good reviewer" is eligibility, operator trust, or successful closure of easy gates.
- **Class A evidence is scarce and externally valid only narrowly.** One controlled study (HumanEval, small open models) and one benchmark instrument (CRBugBench, no published multi-model results). Neither is repository-scale work on frontier models.
- **The strongest negative result is about a tier far weaker than ours.** Qwen-1.5B is not Luna. We transfer the *floor* mechanism, not the verdict.
- **Our own telemetry has no per-agent cost or outcome.** Run-level tokens only, and run status is an outcome proxy, not a grade. Every per-role cost claim for our fleet is currently unproven.
- **Two of three delegated research lanes died on provider quota** during this mission, so lane coverage is thinner than planned; I re-ran the seed-repo analysis deterministically via the GitHub API instead, and verified every arXiv claim by fetching the abstract pages directly.
- **The Bunny free window expires `2026-10-22T12:00:00Z`** — the day of this report. Hypothesis 4's economics change that day regardless of this research.
- **No live routing, memory, policy, or approval change was made.** The branch `research/bunny-role-intelligence-2026-10-22` in `gaia-research` is local only: not pushed, not merged, not deployed.
