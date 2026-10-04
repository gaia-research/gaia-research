# Capability Amplification: When Better Scaffolding Beats a Bigger Model

*October 5, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

You are paying frontier-model prices for work a cheaper model might already be able to do.

Not because the smaller model is secretly just as smart. It isn't.

Because **model capability is only one part of agent capability**.

Give a cheap model a vague objective, a giant tool belt, and permission to improvise every step, and it will often look exactly as cheap as it is. Give the same model a bounded task, deterministic checks, explicit state, a reviewer, and a clean escalation path, and something more interesting can happen: the *system* becomes more capable than the model acting alone.

That is the idea I want to call **capability amplification**.

Not "small models become frontier models." Not prompt alchemy. Not a new excuse to turn every agent into a twelve-stage flowchart.

A narrower claim:

> **The right scaffolding can sometimes buy task-level reliability more cheaply than buying a larger model.**

If that holds, then some of the procedural machinery we have been aggressively removing from modern agent prompts is not prompt debt at all.

It is an economic instrument.

---

## We have been optimizing the wrong unit

Most model comparisons ask a familiar question:

**Which model is best at this task?**

That is useful if a single model is the whole system. Agents make the question messier.

A working agent is closer to:

task result = f(model, instructions, tools, state, verification, routing, review)

Change the workflow around a model and you can change its effective task performance without changing the weights.

This is not a new observation. We already have several neighboring research lines pointing in the same direction.

**AutoMix** routes uncertain outputs from a smaller language model to a larger one and reports more than 50% computational-cost reduction at comparable performance in its evaluated settings. **RouteLLM** learns the same strong-vs-weak decision from preference data and reports more than 2x cost reductions in some cases without quality loss. These systems do not make the weak model smarter. They make the *deployment strategy* smarter.

More recently, **AgentRouter** pushes this idea inside multi-step agent trajectories. Its authors argue that using a frontier model for every step wastes budget because one trajectory can contain both hard planning and trivial formatting. They report a 72% cost reduction relative to frontier-only execution while retaining 97.3% of frontier-only quality on their benchmark.

That is routing.

Capability amplification asks a different question:

**What if the cheap model can carry more of the task because the task itself has been structured better?**

---

## A scaffold can move work out of the model

Consider a repository audit.

A strong model can receive a compact assignment:

~~~text
Audit this repository for stale agent instructions.
Preserve real governance constraints.
Fix or file the highest-confidence problems.
Verify the result and leave a concise handoff.
~~~

That is a beautiful prompt when the worker can hold the whole problem.

Give the same prompt to a cheaper, drift-prone model and you may get a pleasant tour of the README, three speculative findings, and a confident declaration of victory.

Now change the system:

~~~text
1. Inventory all instruction surfaces.
2. Classify each finding as governance-critical,
   reliability-critical, cost-amplifying, or legacy ceremony.
3. Do not mutate anything during inventory.
4. Require a concrete file reference for every finding.
5. Run a second independent review over the findings.
6. Escalate only disputed or high-risk changes.
7. Stop only when the evidence table is complete.
~~~

The second version is longer. It is also less elegant.

But if it lets a much cheaper model finish the audit reliably, elegance is not the optimization target.

**Cost per successful completion is.**

This is where the current "shorter prompts for smarter models" conversation can become misleading. The right lesson is not that procedural structure is obsolete.

The right lesson is that **procedural structure should earn its tokens**.

---

## The smallest useful model is not always the cheapest model

There is an easy trap here.

You pick a cheaper model because its input and output rates are lower. Then you compensate for its weaknesses with:

- longer prompts,
- repeated retries,
- more reviewer calls,
- duplicated searches,
- bigger state summaries,
- extra verification passes,
- manual rescue.

Eventually your "cheap" model has become a tiny contractor surrounded by six managers.

At that point you may have saved nothing.

So capability amplification has to be measured at the system boundary.

The metric I care about is:

**cost per successful completion = total inference and orchestration cost / verified successful tasks**

Not cost per call.

Not cost per million tokens.

Not benchmark accuracy in isolation.

**Cost per successful completion.**

A scaffold is valuable only if it moves that number in the right direction, or if it enforces a governance boundary that should not be optimized away.

---

## There is already evidence that structure can substitute for scale

One of the closest results comes from **Sub-Goal Distillation**.

Hashemzadeh and colleagues trained a hierarchical agent in which a planning module learns sub-goals distilled from a large language model, then a much smaller execution model works through those sub-goals. Their target was not "use a smaller prompt." It was to transfer useful planning structure into a cheaper agent architecture.

On ScienceWorld, the paper reports a **16.7 percentage-point absolute improvement** over standard imitation learning based only on elementary actions, while avoiding real-time access to the large teacher model during inference.

That is not the same as a reusable skill file.

But the underlying move is familiar:

> **Take cognition that would otherwise have to happen inside the expensive model and encode some of it into the system around the cheaper model.**

The same pattern appears in test-time compute research.

**Self-Consistency** showed years ago that one model can become more accurate when you sample multiple reasoning paths and aggregate them. The catch is obvious: accuracy goes up because compute goes up.

Newer work such as **Learning When to Sample** makes the budget adaptive. Instead of always paying for multiple reasoning paths, it uses confidence signals to decide when one path is enough. The authors report accuracy comparable to multi-path baselines while using up to 80% fewer tokens in their experiments.

That is the shape I expect useful agent scaffolding to take.

Not "always use more process."

**Spend structure where uncertainty justifies it.**

---

## Four kinds of scaffolding

When we audit an agent skill, I think its structure should fall into four buckets.

### 1. Governance-critical

This structure exists because some actions should not be left to model judgment.

Examples:

- destructive operations,
- production deploy authority,
- financial or security boundaries,
- provenance requirements,
- human-only approvals,
- irreversible data changes.

A stronger model does not make these disappear.

If a human must approve the merge, GPT-6 does not get promoted to human because it scored better on a coding benchmark.

### 2. Reliability-critical

Some tasks are genuinely easier to execute correctly when their structure is explicit.

A migration with ordered invariants may need an ordered procedure. A release process may require checks in a sequence because later steps depend on earlier receipts.

This is not "prompting for a weak model." It is encoding the task correctly.

### 3. Cost-amplifying

This is the interesting category.

The structure is not strictly required by governance or the task itself. It exists because it lets a cheaper model operate reliably.

Examples might include:

- decomposing an audit into bounded passes,
- requiring concrete evidence before synthesis,
- pairing a cheap worker with a cheap independent reviewer,
- keeping explicit state so a short-context model does not repeatedly reconstruct the task,
- deterministic validators that replace judgment calls,
- selective escalation only when uncertainty crosses a threshold.

If those mechanisms let Flash- or Luna-class workers replace a much more expensive end-to-end run, the extra ceremony is doing economic work.

### 4. Legacy ceremony

And then there is process theater.

The user must type "continue" after every harmless phase.

The agent narrates its plan, then narrates that it followed the plan, then produces a receipt proving it narrated the plan.

A stronger model gains nothing from it. A cheaper model gains nothing from it. The task gains nothing from it.

Delete it.

The distinction matters because "make the prompt shorter" cannot tell these four categories apart.

---

## The Feature Pipeline problem

We ran directly into this while auditing Gaia Skill Tree's own feature-pipeline.

The skill is extremely structured. It has explicit exploration, planning, implementation, adversarial review, CI iteration, state tracking, and multiple stop hooks.

Viewed from a strong-model-first prompting philosophy, it is easy to call the whole thing overbuilt.

And parts of it probably are.

But that misses why a workflow like this can still be useful.

Imagine two ways to run a broad repository audit:

### Route A: one strong model

Give a frontier model the objective, let it inspect, implement, review itself, and finish.

Minimal orchestration. High per-call cost.

### Route B: structured economy mode

Use a Flash-class model to inventory.
Use another cheap pass to review.
Use deterministic tests for correctness.
Escalate only ambiguous architectural findings.

More calls. More structure. Lower-cost calls.

Which is cheaper?

You cannot answer that by looking at the prompt.

You have to run both.

This is why I do not want Gaia's current skill audit to become a descaffolding contest. A procedural skill that looks ugly to a frontier model may be exactly what makes a cheaper model economically useful.

The right question is:

> **Is this scaffolding compensating for a limitation we no longer have, or exploiting a cheaper model we still want to use?**

Those are very different things.

---

## A staged pipeline can also be a ruler

There is another reason to keep stages that has nothing to do with forcing the model through ceremony.

**The review gates teach the humans what the model can actually do.**

A lot of advice about removing scaffolding quietly assumes that everybody already knows the worker's capability envelope. In practice, they do not.

A model card tells you something. A benchmark tells you something. Neither tells you exactly how a new model behaves inside *your* repository, with *your* tools, *your* permissions, *your* context, and the particular class of messy work you keep handing it.

That knowledge comes from use.

This is close to what capability-evaluation researchers call **elicitation**. METR explicitly treats prompting, tools, context management, inference budget, and agent scaffolding as part of the setup required to discover what a model can actually do. Their elicitation guidance even calls out a familiar failure: an agent submits an answer without checking it despite having budget left, a failure that can sometimes be repaired with scaffolding rather than a larger model.

The distinction matters because a premature stop can look like a capability limit when it is really a workflow failure.

The 2025 paper **The Elicitation Game** makes the broader point experimentally: latent capabilities can remain hidden under one evaluation setup and appear under another. There is no single, context-free observation that tells you everything a model can do.

Humans have the same calibration problem from the other side. Recent work on human-AI trust finds that people learn to predict an AI's reliability through repeated interaction, updating their reliance as they encounter successes and errors.

So a staged pipeline can serve as an **observability layer**:

- after exploration, did the agent actually find the important surfaces?
- after implementation, did it carry the task farther than the previous generation?
- at review, what classes of mistakes remain?
- when given another turn, does it repair them itself?
- which gate never catches anything anymore?

Those are not just quality-control questions. They are measurements of the working relationship between the human, the scaffold, and the model.

This matters even more when model generations move quickly. The capability profile you learned through months of using one model can become stale as soon as a new one lands. The safest way to discover that a new worker no longer needs an old checkpoint is often to let it repeatedly pass that checkpoint cleanly.

Older agents especially earned some of their staging. They could stop early, skip verification, lose the thread of long tasks, or declare completion while obvious work remained. In that world, another stage was not automatically bureaucracy. Sometimes it was the thing that got the task over the line.

But scaffolding should be allowed to **expire**.

If a new model consistently crosses a gate without intervention, repairs its own failures, verifies its own work, and carries the task to the real terminal state, keeping the gate forever turns yesterday's instrumentation into today's ceremony.

That gives us a better rule than either "always stage" or "always give autonomy":

> **Use stages to learn the worker. Collapse them when experience shows the worker has outgrown them.**

A review gate earns its keep while it catches failures, protects authority, or teaches you something you did not already know.

Once it does none of those things, it is just furniture.

---

## Better scaffolding is not necessarily more scaffolding

Capability amplification sounds dangerously close to a defense of giant prompts.

It is not.

A good scaffold moves work into **cheap, reliable mechanisms**.

That can mean fewer instructions, not more.

A deterministic validator is often better than three paragraphs telling the model how to validate.

A schema is better than prose begging the model to maintain shape.

A state file is cheaper than repeatedly asking the agent to reconstruct what it already did.

A second independent reviewer can be better than asking one agent to "double-check carefully."

A clear escalation trigger is better than giving every step to the expensive model preemptively.

The goal is not process density.

It is **reasoning placement**.

Ask which parts of the job deserve expensive probabilistic intelligence and which can be handled by:

- code,
- state,
- contracts,
- cheap models,
- bounded review,
- or no model at all.

That is the systems version of capability amplification.

---

## Routing and scaffolding solve different problems

Model routers decide **who should think**.

Scaffolds decide **what thinking is still necessary**.

That distinction is important.

RouteLLM can send an easy query to a cheaper model and a hard query to a stronger one.

A good skill can make part of the hard query easier before routing happens.

For example:

~~~text
Unstructured task:
"Audit this whole repo and decide what is stale."
~~~

might genuinely require a stronger model.

But decompose it into:

~~~text
A. enumerate instruction surfaces
B. flag duplicate rules
C. compare approval language against a fixed policy taxonomy
D. run deterministic mirror checks
E. escalate only semantic conflicts
~~~

and perhaps A, B, and D no longer deserve frontier inference at all.

This suggests a deeper architecture:

> **First simplify the cognition with structure. Then route the cognition that remains.**

That is more interesting than routing alone.

It means the unit of optimization is not the prompt and not the model.

It is the entire agent workflow.

---

## Strong models should still get less ceremony

None of this reverses the case for lean prompting.

A strong, self-regulating model should not be forced through a ten-step script simply because the script once helped a weaker worker.

That wastes tokens and can make the stronger model more brittle.

The emerging pattern looks more like three execution modes.

### Lean autonomous mode

Use when the model can hold the task.

Give it:

- the objective,
- the relevant context,
- authority boundaries,
- terminal proof,
- and room to choose the path.

### Structured economy mode

Use when a cheaper model can likely do the work **with help**.

Add only the scaffolding that measurably improves reliability:

- decomposition,
- explicit state,
- checklists,
- independent review,
- deterministic validators,
- bounded retries.

### Hard-gated mode

Use when the stops exist for governance rather than capability.

Human approval stays human approval.
Production authority stays production authority.
Irreversible actions stay gated.

Do not confuse model intelligence with authorization.

---

## The scaffold dividend

There is a seductive simplicity to "use the smartest model you can afford."

It also leaves money on the table.

We already know that routing can reduce the amount of work sent to expensive models. We have evidence that planning structure can improve smaller agents. We know adaptive test-time compute can spend additional inference only when uncertainty warrants it.

The next question is whether **agent skills themselves can become an economic layer**.

Can a well-designed skill turn a Flash-class worker from "too unreliable for this task" into "reliable enough that the system is cheaper overall"?

Can a cheap reviewer catch enough failures to avoid a frontier pass?

Can deterministic state and validation remove enough reasoning burden that model scale stops being the bottleneck?

And where does the extra machinery become a tax instead of a dividend?

That is what we should measure.

Until then, I would use one rule when editing agent skills:

> **Do not remove scaffolding because it looks procedural. Remove it when it stops buying reliability, governance, or lower total cost.**

The best agent architecture is not the one with the shortest prompt.

It is the one that spends intelligence where intelligence is actually expensive.

---

**Sources:** METR, [*"Guidelines for capability elicitation"*](https://metr.org/blog/2024-03-15-guidelines-for-capability-elicitation/) (2024); Felix Hofstätter et al., [*"The Elicitation Game: Evaluating Capability Elicitation Techniques"*](https://proceedings.mlr.press/v267/hofstatter25a.html) (ICML 2025); ZhaoBin Li & Mark Steyvers, [*"Learning to Trust: How Humans Mentally Recalibrate AI Confidence Signals"*](https://arxiv.org/abs/2603.22634) (2026); Pranjal Aggarwal et al., [*"AutoMix: Automatically Mixing Language Models"*](https://arxiv.org/abs/2310.12963) (2023); Isaac Ong et al., [*"RouteLLM: Learning to Route LLMs with Preference Data"*](https://arxiv.org/abs/2406.18665) (2024); Rudrendu Kumar Paul & Sourav Nandy, [*"AgentRouter: Heterogeneous Model Routing for Cost-Optimal Multi-Step Agentic Workflows"*](https://arxiv.org/abs/2609.22951) (2026 preprint); Maryam Hashemzadeh et al., [*"Sub-Goal Distillation: A Method to Improve Small Language Agents"*](https://arxiv.org/abs/2405.02749) (CoLLAs 2024); Xuezhi Wang et al., [*"Self-Consistency Improves Chain of Thought Reasoning in Language Models"*](https://arxiv.org/abs/2203.11171) (ICLR 2023); Juming Xiong et al., [*"Learning When to Sample: Confidence-Aware Self-Consistency for Efficient LLM Chain-of-Thought Reasoning"*](https://arxiv.org/abs/2603.08999) (2026); Yunho Jin, Gu-Yeon Wei & David Brooks, [*"The Energy Cost of Reasoning: Analyzing Energy Usage in LLMs with Test-time Compute"*](https://arxiv.org/abs/2505.14733) (2025).

**Gaia Research tracking:** [Capability Amplification research issue #282](https://github.com/gaia-research/gaia-research/issues/282) · [Idea-bank brief](https://github.com/gaia-research/gaia-research/blob/main/docs/idea-bank/capability-amplification-agent-scaffolding.md)
