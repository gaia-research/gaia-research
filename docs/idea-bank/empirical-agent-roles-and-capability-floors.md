# Meta-Research Idea: Agent Role Intelligence, Capability Floors, and Cost-Aware Model Routing

- **Status:** Active research and publication candidate; **unranked** (do not displace curated priority ranks without a separate ranking pass)
- **Date captured:** 2026-10-22
- **Tracking:** [#300](https://github.com/gaia-research/gaia-research/issues/300)
- **Publication target:** A fully sourced Gaia field note at `/blog/*` **and** a substantive empirical `/research/*` page or lab, using canonical authoring skills
- **Theme:** Multi-agent software factories; role-based capability; reviewer/builder asymmetry; cheap model routing; evidence quality; prompting; cost per accepted result
- **Research seed:** Bunny's reported local `gaia-research/docs/labs/role-intelligence/` package, branch `research/bunny-role-intelligence-2026-10-22`, commit `b3d4f238`. **Not pushed to remote at capture time.** The report below is an intake summary, not a reproduction of its uninspected files.

## Central question

**Which model, at which effort and with which scaffolding, is good enough for a particular role and task class at the lowest total cost of a *verified* result?** Routing on model reputation or generic intelligence scores alone obscures role-specific weaknesses, retries, false-positive review noise, quota consumption, and the cost of integration.

This research specifically investigates planning, orchestration, scouting, implementation, testing, code/security review, integration, and verification as **different capability distributions**, not interchangeable kinds of “coding.” A strong builder need not be an efficient reviewer, and a sharp reviewer need not coordinate a long autonomous program reliably.

This study is distinct from the shipped [Capability Amplification field note](../../content/blog/capability-amplification/post.md): the earlier article asks when *scaffolding* helps cheaper agents; this study asks **where capability floors actually lie by role**, how to measure them, and when cheaper routing **fails** despite added effort.

## Important practitioner prior: human judgment is evidence, not a leaderboard

The founder's direct operational judgment is that **Luna, even at Max effort, cannot reliably lead certain orchestration workloads that Sonnet can complete with appropriate steering**. At the same time, Luna may be unusually strong at bounded independent review. These are valuable, directional observations from operating the fleet, **not controlled cross-model measurements**.

Preserve that distinction:

- A human who has seen repeated failures may impose a **provisional capability-floor exclusion** for a documented task class. Do not override a known dangerous or costly mismatch merely because a generic benchmark score is attractive.
- Record task boundaries, why Sonnet succeeds, failure signatures, and steering requirements. Turn the prior into a testable claim using replay or independent grading, not a universal brand rule.
- Use local comparable outcomes to strengthen, narrow, or overturn the prior. Maintain a way to correct the router.
- Prefer cheaper models **only above the role/task capability floor**. “Retry the cheap model indefinitely” is not a valid strategy when the failure is structural.

## Preliminary Bunny findings to replicate, not present as certified

The supplied mission summary says the research package contains **39 evidence records**, classified **17 A / 15 B / 6 C / 1 D**, but these figures were not independently reproduced at idea-bank intake. The remote does not yet contain the local research package.

1. **Naive cheap-first can lose on cost and quality.** A reported controlled HumanEval study across 164 tasks and eight configurations found tiered-cheap at 62.2% versus one-model routing at 72.6% and always-largest at 81.7%, with cheap routing also taking more calls/time. Before publication verify the exact dataset, tasks, denominators, calls versus billed dollars, and the 1.5B–32B model range. Transfer the **capability-floor mechanism**, not these numerical success rates, to Luna/Sonnet/Opus.
2. **Escalation is not automatically recovery.** Reported pass rate falls steeply with escalation count, but selection effects matter: escalated jobs are likely harder. The reported 42.1% same-model post-failure success versus 81.7% direct is an observational signal for fresh-context retries, **not** causal proof that context pollution alone explains failure.
3. **Review prompts may matter more than model upgrades on particular review datasets.** Bunny reports an exploration-oriented prompt improved recall by 5.8 percentage points for ~10% cost and that real-world PR review suggestions had only 36.4% accepted versus 56.3% rejected. Verify study methods, review acceptance meaning, class balance, precision/recall, and confounders; accepted comment rate is **not equivalent** to grader-measured review precision.
4. **Luna review quality remains an open hypothesis.** `Hikari9/auto-office` reportedly closed two isolated reviewer gates using `codex@0/gpt-6-luna@high`; `CRBugBench` offers 995 ground-truthed bug-review cases but no cross-model table. These establish feasibility/fixtures, **not proof** of superior Luna defect recall or precision.
5. **Real economics are incomplete.** Reported priced-worker inference is $0.1947, but the total mission cost is **unavailable**: main-session dollars are not measured and 22/24 direct worker results failed. Do not turn a small priced subset into an all-in cost claim. Quota-failed runs and provider availability are routing evidence, not model reasoning failures.
6. **Prompt repetition can be harmful in agent loops.** Bunny cites reported multi-agent negative deltas. Recheck exact prompt conditions and study provenance before quoting.

## Sources for the follow-up source ledger

- [Hikari9/auto-office](https://github.com/Hikari9/auto-office): role-specific routing, local trust and acceptance records, runtime gates. Inspect actual receipts, not just architecture.
- [IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation](https://github.com/IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation): benchmark setup, grading and cost comparisons.
- [malusamayo/CRBugBench](https://github.com/malusamayo/CRBugBench): ground-truth review fixture and independent judge specification; instrument, not cross-model verdict.
- [DeepSoftwareAnalytics/swe-factory](https://github.com/DeepSoftwareAnalytics/swe-factory): real-world software-factory and environment-building evaluation claims, methods to verify.
- [github/gh-aw](https://github.com/github/gh-aw): agent workflow and router implementation, where available.
- Four literature leads as reported by Bunny: [arXiv:2610.13668](https://arxiv.org/abs/2610.13668), [2607.03316](https://arxiv.org/abs/2607.03316), [2601.04252](https://arxiv.org/abs/2601.04252), [2604.23361](https://arxiv.org/abs/2604.23361). Independently check author/date/method/results.

The source ledger must distinguish controlled trials (A), observational operations (B), implementation-only systems (C), and unverified claims (D). For each recorded model-route outcome capture **role, task class, harness, model/version, effort, measured quality, verified cost/latency, retries, adjudicator, independent source, and applicability caveats**.

## Primary research questions

1. Which task subclasses require a Sonnet-capable orchestrator even when Luna has Max effort? What steering converts a Sonnet failure into a successful run, and can objective acceptance tests describe that boundary?
2. Does **Luna-as-independent-reviewer** have a cost-adjusted advantage under precision-matched defect grading, compared with its performance as a builder and compared with Sonnet/Sol review?
3. What are the lowest viable models by role and difficulty, rather than by general model tier alone?
4. Does better prompting, larger effort, deterministic tooling, or fresh-context retry beat a model-tier jump in this class of task?
5. How should a router combine **human operator expertise as a calibrated prior**, external public benchmark cold-start priors, and local independently graded outcomes without laundering one into another?

## Evaluation sketch

Prioritize the following pre-registered pilots, keeping the original five experiments from Bunny's source package authoritative once recovered:

- **E-1:** Luna review quality on 40 historical PRs plus injected, human-adjudicated defects. Measure recall *and* precision; compare at a matched precision threshold and record false positive review burden.
- **E-2:** Cheap reviewer with deterministic prechecks versus repeated premium review.
- **E-3:** Economical builder versus premium builder on deterministic, acceptance-gated tasks.
- **E-4:** Luna Xhigh/Max orchestration versus steerable Sonnet on a heterogeneous task set, including examples the founder already expects Luna to fail. Measure requirement retention, delegation, integration, and time-to-verified-completion.
- **E-5:** Fresh context versus resumed retry, holding task and model fixed.

Use chronological held-out samples, exact agent-route IDs, independent acceptance criteria, and unsuccessful outcomes. Report confidence intervals when sample sizes support them. Prevent accidental escalation and contamination between reviewer and producer. Measure **attempted and accepted tasks**, not just successful demos.

## Candidate routing implications, **not authorized policy changes**

- Capability-floor eligibility before price ranking.
- Separate builder, reviewer, and orchestrator capability profiles at each model/effort/harness.
- Track false-positive reviewer cost and remediation cost, not only recall or raw token spend.
- Introduce explicit human prior and evidence-update fields in the *proposal* for the Gaia memory layer; keep stable authorization policy separate.
- Record a failed cheap route as a cost and learning event, not a mandate to spend more on the same model.
- Preserve hard model-escalation approval and explicit effort settings.

This entry authorizes **research documentation and publication planning only**. Do not mutate the live model roster, global memory, dispatch governance, or production harness settings from these preliminary claims.

## Publication plan

Produce **both** a full `/gaia-blog-post` story and an associated `/research/*` paper or meaningful lab page, with independent citations, measured versus inferred figures, methodology, reproducibility limits, and reproducibility artifacts or explicit unavailability. Use the canonical `.agents/skills/gaia-blog-post/SKILL.md` and the applicable research/lab publishing contract. Thumbnail concept: **Baker Milim**, experimenting with several role-labeled recipes, rejecting underbaked agents below the capability floor, and presenting only verified results; follow the canonical editorial thumbnail skill and asset ledger pipeline.

**Editorial tension:** The economical route that costs *more* because it failed, versus the expensive model that was the cheaper *completed result*. An equally important twist is that a model may be an excellent reviewer but an unsuitable orchestrator.

**Exit criteria:** Audited source ledger, distinctions between A/B/C/D evidence, explicit user judgment as a falsifiable prior, role matrix with unknowns intact, lab methodology and limits, independent review, real assets, visual/build checks, PR receipts, and links in [issue #300](https://github.com/gaia-research/gaia-research/issues/300). Keep the issue open through this idea-bank merge; publication remains pending.
