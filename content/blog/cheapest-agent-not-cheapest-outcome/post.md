# The Cheapest Agent Isn't Always the Cheapest Outcome

*October 22, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

> The cheap model did the job. Then it did it again. Then it did it a third time, and by the time the work was accepted, the three cheap attempts had cost more than the one expensive attempt that would have finished it the first time.
>
> We spent a month looking for a way to avoid that sentence. What we found instead was a law about *where* a cheap model is allowed to run, and the law is stricter than the one we went looking for.

---

## We went looking for a way to pay less

The hypothesis was simple and, for a while, looked obviously right. Take the cheap models, turn their reasoning effort up, give them a retry when they fail, and put an independent reviewer on the result. The premium tier is expensive per token. A cheap model at high effort is not. Ergo: route the cheap model, and let the harness make the premium tier the exception rather than the default.

That hypothesis is not silly. It is how a lot of cost engineering actually works, and it is the direction a lot of published work points. The reason it is wrong in its strong form is more interesting than the reason it is right.

To test it we did what we should have done first: we read the source material, and we graded it. Thirty-nine evidence records from eight software factories and four arXiv papers, each sorted by what kind of warrant it actually provides. Controlled experiment with a fixed task set and a ground truth. Recorded runs with a real outcome but no controlled comparison. Implementation with no comparative result. Claim with nothing behind it. Seventeen in the first class, fifteen in the second, six in the third, one in the fourth.

Then we went back and re-read every headline number against its primary source, because the numbers were the last thing to check and the first thing to be wrong.

Exactly one source in that corpus is a controlled experiment. Everything else is either a mechanism, a set of fixtures, or somebody's operating notes. Hold onto that; it is the shape of the whole problem.

## The one controlled study pointed the other way

The study is [IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation](https://github.com/IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation). It runs **164 HumanEval tasks** through eight configurations, grades each solution by executing its assertions, and reports Wilson confidence intervals, average seconds per task, and average API calls per task.

Five of the configurations matter here.

| Configuration | Pass rate | Avg seconds | Avg API calls |
| :--- | :--- | :--- | :--- |
| A, single agent | 67.7% | not reported | not reported |
| B, multi-agent, one model in every role | 72.6% | 10.95 | not reported |
| C, multi-agent, difficulty-tiered cheap models | 62.2% | 19.28 | 4.85 |
| C1, multi-agent, always the largest model | **81.7%** | **14.66** | **3.00** |
| C2, multi-agent, tiered, smallest tier removed | 72.0% | 13.32 | not reported |

Read the C row and then the C1 row again. The "save money" configuration was **19.5 points worse** and made **1.85 more API calls per task** and took **4.62 more seconds per task**. The configuration that always reached for the biggest model won on quality *and* on call count. The authors' summary is blunt: *"attempting to save computational resources by using smaller models for easier tasks resulted in higher overall latency and dramatically lower success rates due to the frequency of required escalations and re-generations."*

[[FIG_STUDY_COMPARISON]]

Now the part that should have stopped us, if we had been paying attention, and that we initially did not. Look at configuration C2. It is configuration C with exactly one tier deleted, the 1.5B model. It scored **72.0%** against C's 62.2%, cut escalations from **152 to 74**, and cut time from 19.28 s to 13.32 s.

**One weak tier was causing most of the damage.** And the tier distribution table shows that not a single task in configuration C ever completed on that tier. Every task it touched escalated.

So the finding is not "small models are bad". The finding is that **a cheap route below a competence threshold does not accept the work; it escalates the work.** And an escalation is billed at the escalated tier, on a task that is now harder than it was when it started.

## The bill for three attempts

The escalation table is where the mechanism becomes visible. Pass rate by number of escalations, architecture B:

| Escalations | Tasks | Pass rate |
| :--- | :--- | :--- |
| 0 | 83 | 100% |
| 1 | 53 | 62.3% |
| 2 | 28 | 10.7% |

A task that needs one retry is far less likely to succeed. A task that needs two is close to hopeless. Architecture C behaves differently, 98.3% then 31.0% then 55.3%, because the biggest tier can rescue some tasks the middle tier could not, and because the two architectures escalate different populations.

There is a second number in the same study that gets quoted as if it proved something it does not prove. In configuration C, tasks that reached the 32B developer model passed at 42.1%, against 81.7% for the same model used from the start in C1. The tempting conclusion is that the failed attempt's context poisons the retry, so retries should run in a fresh session. We published that framing in our first pass, and it is stronger than the evidence supports. The source says accumulated errors from failed attempts *may have* polluted the context, and the same document also reports that harder tasks escalate more often. The table cannot separate those two explanations.

So the honest statement is: **the same model, arriving after a failure, did much worse, and we do not know whether that is contamination or difficulty.** It is worth a test either way, because a fresh context is free, but it is not a measured effect and we will not pretend otherwise.

There is a third number here, and it is the one that killed a trick we liked. Prompt repetition, a published technique for making models attend to complex instructions, gained **+0.6** points on the single-agent baseline and lost **6.1** and **7.9** points in the two multi-agent pipelines. The explanation the authors offer is that the loop context is already dense, so a duplicated prompt dilutes the reviewer's most recent feedback. A prompting trick that works in one turn does not transfer into a loop, and "the paper said it works" is not a routing input.

## Builder, reviewer, orchestrator are three different jobs

If the controlled study is the only strong evidence we have, and it is about a 1.5B model writing HumanEval functions, what can it tell us about Luna reviewing a pull request, or Sonnet driving a ten-file refactor?

Less than people would like, and something more useful than nothing: **a mechanism, and a warning about generalising.**

The mechanism is the floor. Configuration C2 says a route has to clear a competence bar before its price means anything. A router that ranks by price first and checks competence later will keep selecting a route that cannot finish, pay for the escalation, and hand back a degraded task.

The warning is about which study transfers. Qwen2.5-Coder-1.5B is not Luna, Haiku, or Flash. The 62.2% and 81.7% numbers describe 1.5B to 32B open-weight models on function synthesis. **What transfers is the shape of the failure, not the percentages.** And the shape of the failure is role-shaped, which is why the framework that survived our review is not "cheap for cheap things" but "eligible for a role, then ranked by cost".

The framework is two steps, and the order is the whole point:

```
eligible(route) = route.clears_floor(role, task_class)      # a gate, not a score
ranked(routes)  = eligible routes ordered by cost_per_accepted_result
```

The gate comes first because an ineligible route does not accept the task, so including it in a price ranking is comparing a price against a refusal.

[[FIG_CAPABILITY_FLOOR]]

Here is the bad version, and it is not a caricature. It is the tier file in our own fleet, read straight off disk:

```json
{
  "tiers": {
    "small":  "kilo/stepfun/step-3.7-flash:free:medium",
    "medium": "google-antigravity/gemini-3.8-flash:high",
    "big":    "google-antigravity/gemini-3.8-flash:high"
  }
}
```

"Escalate to the big tier" resolves to the same model and the same effort as the medium tier. The ladder has no rungs above the second one. And `gemini-3.8-flash` is priced at $0.75 / $3.75 per million on the `google` route and $2.00 / $10.00 on `antigravity`, so the same model name costs **2.7× more** on the route we actually use.

Here is the good version, and it is real. It is the reviewer policy from [Hikari9/auto-office](https://github.com/Hikari9/auto-office), shipped at commit `9fab6f1`:

```yaml
code_reviewer:
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

Two things to notice. The cheap model is first in the list, at high effort. And the floor is not an effort floor at all: `min_effort: none`. The floor is an **intelligence** floor, evaluated against a version-pinned index, and the evidence backing it has to be tagged `local-evidence:` or `documented:`. Intelligence and effort are separate axes, and the floor is what protects the cheap route from being used where it cannot do the job.

We also found a defect in our own fleet that is worth one sentence here, because it is the same failure in miniature. Fifty-six agent definitions, each pinning one provider, model, and effort. A static audit against the live model catalog: **48 clean, 2 pinning an effort the provider does not support, 1 unconfirmed, 4 with undeclared support, 1 placeholder.** One of the two is `scout-luna` at `gpt-6-luna:minimal`, and that model advertises `off, low, medium, high, xhigh, max` and not `minimal`. A pin that cannot work as declared is worse than no pin, and it costs nothing to fix.

## The reviewer we cannot crown yet

If the cheap models mostly fail at building, the reviewer is the interesting role, because the evidence points the other way there. The strongest published result we found is [arXiv:2610.13668](https://arxiv.org/abs/2610.13668), "(When) Should a Software Factory be Lights-off?", submitted on 9 October 2026. It mines bugs from repository history, pairs each with the pull request that introduced it, and asks review agents to find them. **1,000 review tasks across 98 open-source repositories**, plus 800 from proprietary repositories at one company, with human-verified bugs as ground truth.

The best agent, `claude-opus-5` with `copilot-cli`, catches **71.9%** of the human-verified bugs in its top five comments, up from **47.7%** for `opus-4.6` five months earlier. That is a 24.2 point swing from model evolution, and it is the strongest argument for paying for the top tier.

The same paper also says something more useful: *"scaling compute helps most through prompt changes: exploration-nudging prompts gain up to 5.8% performance at 10% higher cost."* Ten percent more compute, bought with a better prompt, instead of five months of model evolution.

And it says the good review agent is not a universal one. Performance drops sharply on complex changes and on bugs that need non-local reasoning, and drops again on proprietary repositories where project context matters. Which means the routing decision is not "premium reviewer" or "cheap reviewer", it is "which reviewer, for which change", and the paper's own guidance is to scale review effort to pull-request complexity.

Now the honest part, which is the part our first report got wrong.

We looked for evidence that Luna is a good reviewer, and we found a lot of it. Auto Office lists `luna` at high effort first for both its reviewer roles, granted it trust after real runs, and closed two live review gates with it. There is a public reimplementation of the benchmark at [malusamayo/CRBugBench](https://github.com/malusamayo/CRBugBench), 995 tasks with per-task ground truth, and its own README runs `gpt-6-luna`. Our own fleet routes the phase literally named Review to `gpt-5.6-luna:max` in 9 of 14 assignments and 252 of 297 agent-turns.

And all of it establishes the same thing: **eligibility.** Read the Auto Office receipts closely. Both live gate closures were on a one-line change, a function called `add` that returns `a + b`. There were no injected defects. Nobody measured recall. Nobody measured precision. "Luna is a proven superior reviewer" is not a sentence the evidence supports, and we are not going to publish it.

What would settle it is a benchmark that has not been run. And that is where the second study earns its place. [arXiv:2607.03316](https://arxiv.org/abs/2607.03316) pairs **31,073 agent review comments** with developer feedback across **10,191 pull requests in 239 repositories**. Accepted: **36.4%**. Triggered discussion: **7.3%**. Rejected: **56.3%**.

More than half of the comments a production reviewer generates do not survive contact with a maintainer. The rejections came mostly from invalid suggestions that were false positives, redundant, or out of scope, plus misalignment with developer intent and coding practices. That is not a precision measurement, because it grades developer reaction rather than ground truth. It is something arguably more useful for routing: a published failure mode for recall-only optimisation. A reviewer with no precision floor spends a maintainer's attention on work they are going to throw away.

So the two halves of the reviewer story pull in opposite directions. Recall is where the premium tier's advantage is biggest. Precision is where we have the least measurement and the most evidence of harm. The corpus cannot tell you which trade your role should make, and pretending otherwise is how people ship a reviewer that generates work.

## When the operator knows more than the benchmark

One more thing belongs in this story, and it is the part we did not expect to publish.

Our founder operates these models every day, and he has observed that **Luna cannot reliably handle certain orchestration workloads even at Max effort, where Sonnet completes the same work with appropriate steering.** That is practitioner evidence. It is not a controlled measurement, and it is not a property of a model brand; it is a claim about a task class.

It is also the kind of thing that usually gets thrown away, and throwing it away is a mistake.

A generic benchmark score is a prior. An operator who has watched a route fail the same way six times holds a different kind of knowledge: it is local, it is specific, and it is about the *task*, not the brand. When a cost optimiser proposes that route, the operator is not being superstitious. They are looking at a measured failure rate in their own workload that the leaderboard does not have.

The way to keep that knowledge is to make it a first-class object with provenance. A routing record that says "this route is not eligible for long-horizon orchestration, source: operator observation, six failures, task class: multi-file coordination with lossy handoffs, review on: 2026-11-22" is a legitimate, checkable, revisable piece of routing knowledge. It is not a rule, and it is not a law. But it should not evaporate because a cost model disagreed with it, and it should not be laundered into a "measured" outcome either. Those are different claims and they need different fields.

We are also honest about what the prior does not yet contain. It does not define the task class. It does not describe the steering that makes the premium model succeed. It has no ground truth to locate the boundary. Until it does, it is a restriction we are choosing to honour, not a finding we are publishing, and we have written it down in those terms.

The one thing we will not do is pretend the two findings are in conflict. If the founder is right, the reason a cheap orchestration route fails may be exactly the floor: below it, work escalates, and escalation degrades the task. The prior may be the local, qualitative version of the same law, observed on the models we actually run.

## The levers that are cheaper than a model upgrade

Before you go shopping for a bigger model, four cheaper levers are sitting in the corpus.

**Prompt the review, do not just upgrade it.** Exploration-nudging prompts bought up to 5.8% of review performance for 10% more cost, in the same benchmark where five months of model evolution bought 24.2 points. We could not compute a return-per-dollar ratio from that, because the paper reports a cost for the prompt ablation and none for the older model baseline, and we would rather leave the number out than invent it. The qualitative claim stands on its own: the prompt is the cheapest lever in the room.

**Make retries fresh.** Same model, same task, same effort, new session. The evidence that context pollution is the cause is suggestive and not conclusive, and the fix costs nothing but some tokens. That is a good ratio for an experiment you have not run yet.

**Use deterministic checks before you use a model.** A precheck either passes, in which case no reviewer effort is spent, or fails, in which case the reviewer has a real finding to work on. This is the one hypothesis in the whole set that respects the rework arithmetic, and it is the cheapest of the five experiments we have designed.

**Make the reviewer output parseable.** Auto Office's contract is three tokens and a structured finding line: `APPROVED`, `RECHECK`, or `INTAKE_GAP`, where the third means the evidence cannot settle the question and a human should be asked once, now, instead of the agent guessing. A cheap reviewer needs a cheap-to-parse output. A review that a human has to interpret is a review a human will not do.

## How to pick an agent this afternoon

Here is the whole thing, reduced to what you can act on.

**Rank by cost per accepted result, not by cost per call.** Execution plus retries plus reviews plus integration plus remediation, divided by tasks that were actually accepted. If you cannot compute the denominator, you do not have this metric, and the honest number is tokens and quota, not dollars. We have fleet runs reporting a cost of zero that are really subscription-billed; calling those free is how a cost report lies to you.

**Gate on competence before you rank on price.** One cheap tier being present in a router is not a saving. It is a future escalation, billed at the expensive tier, on a task that is already degraded.

**Separate the roles before you separate the models.** Builder, reviewer, orchestrator, scout, verifier. Our evidence supports role-dependent *floors* much more strongly than role-dependent *model families*. Every controlled comparison we found that varied the model family across roles made things worse.

**Treat a reviewer's precision as a first-class requirement.** A majority of production review comments get rejected. A reviewer with no precision floor is a noise generator with good recall.

**Keep the operator's judgement, labelled.** A named task class, a named source, a failure signature, a review date. It loses to comparable evidence when comparable evidence arrives, and it does not lose to a spreadsheet.

**One thing to do differently tomorrow:** write down the floor for one of your roles, in one line, with the failure that motivated it. You almost certainly have a route you keep routing around because you know it cannot finish the job. That knowledge is worth more than any benchmark score, and right now it lives in your head instead of in your router.

---

**Sources:** [IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation](https://github.com/IvanNece/Multi-Agent-Architectures-for-LLM-Based-Code-Generation) · [(When) Should a Software Factory be Lights-off?](https://arxiv.org/abs/2610.13668) (arXiv:2610.13668, 9 October 2026) · [Agentic Code Review in the Wild](https://arxiv.org/abs/2607.03316) (arXiv:2607.03316, 3 July 2026) · [Hikari9/auto-office](https://github.com/Hikari9/auto-office) (commit `9fab6f1`) · [malusamayo/CRBugBench](https://github.com/malusamayo/CRBugBench)

**Companion:** the full source-audited report, the 39-record evidence dataset, the corrections log, and the five proposed experiments are in the [research report](/research/agent-role-intelligence). Nothing in this post changed the live fleet.
