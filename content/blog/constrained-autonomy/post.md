# Constrained Autonomy: Why a Flawless Brief Can Make Your Sub-Agent Dumber

*August 3, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

Your sub-agent keeps missing the mark. So you do the obvious thing: you write it a better brief. More steps. More constraints. Every edge case spelled out in advance.

Then it gets *worse*.

Why does handing your sub-agent a flawless, step-by-step brief sometimes make it dumber? Because "scope" is not one dial. It is two — and most teams turn the wrong one.

![Anthropic's multi-agent research system architecture: a lead agent orchestrator delegating to search subagents](/assets/constrained-autonomy-anthropic-architecture.webp)
*Anthropic's multi-agent research system: a lead agent (orchestrator) delegates to search subagents, giving each an objective, tools, and boundaries — not a script. The orchestrator draws the box; the subagent chooses the path. Source: [anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system)*

---

## The instinct that backfires

When a sub-agent underperforms, the reflex is to specify harder. Spell out step 1, step 2, step 3. Add a rule for every failure you've seen. Stack constraints until nothing can go wrong.

Past a point, the stacking *is* the failure.

The paper *"What Prompts Don't Say"* (arXiv:2505.13360) ran ~1.5M evaluations across seven models and found **requirement conflicts**: about **11.4% of requirement pairs conflicted**, and specifying both sides of a conflict dropped accuracy by up to **41.1%**. "Make it accessible to a non-coder" fights "describe the error handling." Each rule is reasonable. Together they collide, and reasoning degrades.

It gets subtler. The MLOps Community's write-up on prompt bloat names a failure it calls **"identification without exclusion"**: a model can *recognize* that a piece of context is irrelevant and still be unable to stop it from biasing the output. Reasoning starts to slip around ~3000 tokens — well under any context limit — and chain-of-thought doesn't rescue it. The practical consequence is blunt: an irrelevant rule inherited from the parent agent has to be *physically removed* from the sub-agent's prompt, not merely flagged as "ignore this."

So more specification is not free. Every line you add is a line the model must reconcile — and some of them fight each other.

## But vagueness is its own disaster

Here is where an honest post has to stop and admit the opposite is also true.

Anthropic tried the minimal version. From *"How we built our multi-agent research system"*:

> "We started by allowing the lead agent to give simple, short instructions like 'research the semiconductor shortage,' but found these … were vague enough that subagents misinterpreted the task or performed the exact same searches as other agents."

The fix was *more* detail, not less:

> "Each subagent needs an objective, an output format, guidance on the tools and sources to use, and clear task boundaries."

Unscoped agency didn't just misfire — it duplicated work and drifted. And it was expensive: Anthropic notes multi-agent systems burn roughly **15x the tokens** of a chat interaction. Vague delegation is a cost problem, not just a quality one.

So the evidence points in two directions. Over-specify and reasoning collapses. Under-specify and the agents wander. Both are real. The resolution is not a compromise in the middle.

## Scope is two dials, not one

The trick is to notice that a delegation prompt is really two separate budgets:

- **The boundary budget** — the *objective* (one sentence), the *output contract*, the *negative constraints* ("don't do X, that's another agent's job"), and the *allowed tools and sources*. This draws the box.
- **The trajectory budget** — the step-by-step *how*. First do this, then that, verify twice, use this exact phrasing. This scripts the path inside the box.

Anthropic's failure was an under-spent **boundary** budget: no crisp objective, no output contract, no "don't overlap with the other agents." The 41% accuracy paper is an over-spent **trajectory** (and constraint) budget: too many colliding instructions about the how.

Most teams get this exactly backwards. They spend their whole specification budget scripting the trajectory and barely draw the boundary. The rule that falls out:

[[TWO_DIALS]]

> **Scope the boundary tightly. Under-scope the trajectory.**
> Draw a crisp box — objective, output contract, negative constraints, tools — then say as little as possible about how to move inside it.

That is **constrained autonomy**: maximal freedom *inside* a well-drawn box. The orchestrator's job is not to write the sub-agent's solution. It's to draw the box and get out of the way.

## Why over-scoped paths rot

A tightly scripted trajectory looks safe. It isn't. Three things go wrong:

1. **Identification without exclusion.** Every scripted step is context the model has to carry, and irrelevant steps bias the output even when the model "knows" they don't apply.
2. **Context drift.** As the run grows, mid-prompt instructions lose the attention fight — the failure mode one practitioner post calls giving your agent *"ADHD."* The model doesn't need better instructions; it needs less to hold.
3. **Brittleness at the first unscripted step.** A path assumes the world matches the script. The moment reality deviates — a tool returns something unexpected, a search comes back empty — a scripted agent has no move. An agent that owns its trajectory just picks another route to the same objective.

The tighter you script the how, the more places the chain can snap.

## What the two prompts actually look like

Illustrative — not a measured A/B run. Same task, two scoping styles.

**Trajectory-scoped (the perfect-prompt trap):**

```text
Task: Research the semiconductor shortage.
Step 1: Search for "semiconductor shortage 2021".
Step 2: Open the first five results and summarize each.
Step 3: Then search "TSMC capacity" and "auto chip supply".
Step 4: Cross-check every number against your step-2 summaries.
Step 5: Write three paragraphs, formal tone, and verify each figure twice.
```

Every line is a place to drift, collide, or snap — and nowhere does it say what "done" means or what *not* to touch.

**Boundary-scoped (constrained autonomy):**

```text
Objective: Explain what caused the 2021–2023 semiconductor shortage.
Output:    3–5 bullet causes, each with one cited source URL. <= 400 words.
Boundaries: Supply-side causes only — another agent owns demand-side.
            Nothing past 2023. Don't re-run searches other agents have logged.
Tools:     web search + citations tool. Stop once you have 3 sourced causes.
```

The second prompt is *shorter* and *more constraining* — because the constraint is on the box, not the path.

## The sweetspot moves with the model

Here is the part that stops "just under-scope everything" from being wrong advice: **there is no universal right amount of freedom.** The correct boundary tightness is a *function of the sub-agent itself.*

Think of a sub-agent's capability profile as three things multiplied together: **reasoning × effective context capacity × self-regulation.** Plot that on one axis, and the freedom you can safely grant on the other. A diagonal appears — a **safe agency frontier.** The more capable and self-regulating the worker, the more freedom it productively absorbs.

[[SAFE_FRONTIER]]

The two failure zones are the whole point:

- **Above the frontier — too loose for this model.** Freedom the worker can't hold. This is the semiconductor-shortage failure: drift, duplication, hallucination, loops, going off the rails.
- **Below the frontier — too tight for this model.** Anthropic's *"Measuring AI agent autonomy in practice"* calls this **deployment overhang**: "existing models are capable of more autonomy than they exercise in practice," and "smarter models require less prescriptive engineering." Under-use a capable model and you get wasted agency — plus the brittle scripted chains that snap at the first unscripted step.

This is a conceptual model, not a measured curve. But it reframes the whole debate: the question was never "how much should I scope?" It's "how much can *this* worker hold?"

## Smart is not the same as self-regulating

The most expensive mistake here is treating raw intelligence as the whole X-axis. It isn't. **Self-regulation moves the frontier, not IQ.**

A model can be brilliant and still be a poor candidate for a loose leash. In [an earlier field note](/blog/rumination-index) I described Opus 5's tendency to *ruminate* — re-reading context, re-verifying settled facts, looping instead of committing. A high-capability, low-self-regulation model like that will spend loose boundaries badly: handed room to roam, it roams in circles. Give it the freedom you'd give a frontier model and it lands *above* its own frontier — smart, and off the rails.

So a high-IQ, rumination-prone worker stays tightly bounded *despite* being smart. A drift-prone small model gets a short leash and more trajectory structure. Only a frontier model that actually self-regulates earns loose boundaries and almost no trajectory at all.

## Set the leash per model

The practical version of all this is a single question to ask before you delegate:

> **How much context can this sub-agent hold, and how well does it self-regulate?**

Then set the leash accordingly. The consequence is uncomfortable but correct: **the same task should be scoped differently for different models.** Loose boundaries and a bare objective for a frontier self-regulating model. A short leash and more trajectory scaffolding for a small, drift-prone one. A single "ideal prompt" reused across every model is a prompt that is wrong for most of them.

And this is exactly why per-model measurement beats guessing: if the frontier is real, you'd want to *measure* each model's safe band rather than eyeball it. That's a principle, not a promise — but it's where the two-dial model points.

## One rule to take with you

Before you write your next sub-agent prompt, look at what you've written and sort every line into two piles: **the box** (objective, output, boundaries, tools) and **the path** (the steps). Then:

> **Spend on the box. Starve the path. And size the box to the worker, not the task.**

If the pile scripting the path is bigger than the pile drawing the box, you've built the perfect prompt — and that's the problem.

---

**Sources:** *"What Prompts Don't Say: Understanding and Managing Underspecification in LLM Prompts"* (arXiv:2505.13360); S. Chatterjee (ScaleDown), *"The Impact of Prompt Bloat on LLM Output Quality"* (MLOps Community); *"Your AI Agent Isn't Dumb. It Has ADHD"* (AI in Plain English); Anthropic, *"How we built our multi-agent research system"* (Jun 2025) and *"Measuring AI agent autonomy in practice"* (Feb 2026); Anthropic Cookbook, *"Orchestrator–workers"* (Dec 2024); Feng, McDonald & Zhang, *"Levels of Autonomy for AI Agents"* (Knight First Amendment Institute / University of Washington, Jul 2025); Promptfoo, *"Autonomy and agency in AI"* (Sep 2025).
