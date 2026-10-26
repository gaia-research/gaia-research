# The Economics of Agentic Work: When Small Agents Beat Frontier Models

*October 26, 2026 · Field Note by Marcus Tiongson · Founder, Gaia Research*

---

I keep coming back to an uncomfortable question: **why does a task have to be expensive just because it is difficult?**

We have started treating the frontier model as the natural unit of serious work. If a task is complicated, give it to the smartest model. If that model struggles, give it more context, more reasoning time, perhaps a few subagents. Eventually we have a small organization of AIs working on something a much cheaper agent might have completed with the right tools.

What bothers me is the implied **cost floor**. If meaningful autonomous software work requires an expensive model supervising other models, what does that mean for the developer on a twenty-dollar subscription? Are we quietly designing an AI economy that only makes sense for people who can afford to run the management layer?

I don't think that is inevitable.

## We are asking the wrong first question

The usual comparison is about capability: Can a small model solve the task as reliably as a frontier model?

That matters, but it is not the economic question. What I want to know is: **Can we get a correct, verified outcome more cheaply, and fast enough, using a different allocation of intelligence?**

Those two questions produce different architectures.

Imagine an expensive agent completes a narrowly scoped repair in one attempt. Imagine a cheaper Luna-class agent needs two attempts but each costs a fraction as much. If the second attempt produces a passing patch, the inexpensive route may win. As I observed during our marathon testing:

> “I can fail a Luna three times ... but it's still much cheaper than an Opus that's perfectly doing it one time.”

That example is deliberately illustrative, not a benchmark. The actual answer depends on the cost of failed attempts, verification, context preparation, integration, latency, and the developer's time.

In other words, the denominator should not be *attempts*. It should be **verified successes**.

A useful accounting identity is:

`Total cost = execution + context preparation + coordination + verification + retries + human intervention`

And the objective becomes minimizing expected total cost **per verified result**, while respecting reliability, latency, and safety constraints. A run that looks cheap but leaves me manually untangling three speculative patches is not cheap.

[[AGENT_ECONOMICS_ALLOCATION_SVG]]

## Small models are not isolated brains

One frustration I have with model comparisons is that they often assume the model is the entire system. In software engineering, it never is.

A model inside a good harness has repository search, language servers, focused tests, typed tool outputs, reusable skills, prior failure receipts, and access to the precise files it needs. A model outside that harness is improvising with partial information. If the small agent fails, sometimes what failed was not intelligence:

> “Sometimes ... it's just ... a domain harness problem. We need to add more tooling so that the capability of small agents actually increase and the overall cost will be lower.”

This distinction matters because tooling can substitute for expensive reasoning. A compiler can tell us whether code parses. A test can reveal the regression. A structured repository map can spare an agent from rediscovering architecture. A skill can preserve hard-won procedure without hiring a stronger model to reconstruct it on every run.

That is not an argument that tools make every small model equally capable. Some tasks genuinely require broad judgment and long-range reasoning. But before escalating the model, we should ask whether we have failed to package the domain.

I want small agents to get more capable because the environment around them gets better, not only because the next model release gets bigger.

## The old science hiding inside the new one

This conversation sounds contemporary, but much of the mathematics is older than the agent boom.

> “I think this has been solved before. It's just that it looks different now and people are still figuring things out.”

Amdahl's Law asks how much parallel speedup is possible when some fraction of a job must remain serial. The same constraint appears when five coding agents finish quickly but an expensive lead must reconcile their competing edits. Parallel workers don't erase the serial integration step. Fred Brooks made a related organizational argument in *The Mythical Man-Month*: adding workers to coordination-heavy work can make it slower.

Neither law says agent teams are always bad. They say **parallel capacity is not the same as useful throughput**.

In 2023, Chen, Zaharia, and Zou introduced *FrugalGPT*, which studied adapting prompts and cascading among differently priced language models. Its published experiments reported matching a stronger individual model's performance on studied tasks with up to 98% lower inference cost. That figure is a result from their experimental settings, not a promise for today's autonomous coding agents. But the principle is fundamental: smarter routing can change the cost-performance frontier. [1]

More recently, Snell and colleagues studied how to allocate test-time compute adaptively across problem difficulty. They reported over 4x improved efficiency against a best-of-N baseline under their studied setting, illustrating why giving every problem the same reasoning budget is wasteful. [2]

And Anthropic itself distinguishes **sectioning**, where agents tackle different independent subtasks, from **voting**, where multiple attempts or perspectives address the same problem. These are not interchangeable. [3]

That distinction is especially useful for small-agent economics.

## Decomposition is not the only reason to run more than one agent

We have become fond of hierarchies: a strong planner decomposes a task, several cheaper workers implement fragments, and the planner recombines the result. For independent research questions, that can be excellent. For tightly coupled code changes, it can become an expensive meeting with itself:

> “When we ... do a marathon ... there's this ceremony that's happening with the Sol orchestrating a bunch of small agents and it's taking like forever ... It needs a number.”

There is another option: **competing solutions**.

Give two isolated Luna agents the same bounded bug report, the same acceptance criteria, and separate worktrees. Run the same tests. If one solution passes and the other fails, we may not need a sophisticated synthesis conversation. We need a trustworthy judge of the result. If both pass, we still need to inspect maintainability, safety, and side effects; passing tests are evidence, not proof of correctness.

Or don't launch two immediately. Start one. If it stalls, hedge with a second attempt. If both fail for the same reason, stop spending. Repair the specification, improve the harness, or escalate.

That is a very different idea of a fleet. Flash and Luna are not merely employees waiting for instructions from an executive model. They can be **a portfolio of independently verifiable solvers**, when the task permits it.

Independence is the catch. Three agents given the same misleading issue report can make the same mistake. Counting three attempts as three independent chances would exaggerate reliability. Verifier quality, failure correlation, and the ability to identify a genuinely successful solution all have to be part of the calculation.

## What the research proves, and what it does not

Anthropic reported that its multi-agent research system outperformed a single-agent baseline by 90.2% on an internal research evaluation, while also observing that multi-agent systems consumed roughly 15x the tokens of ordinary chat interactions in its setting. The authors explicitly caution that domains with tightly shared context and many dependencies, including much coding work, are less suited to broad parallelism. [4]

That is not a universal claim that multi-agent work costs 15x a single coding agent, nor is the performance improvement a general property of every agent team. Different workloads, baselines, and pricing models change the answer.

What the evidence does support is more interesting: **architecture choices change both performance and cost, and the winner depends on the task**.

We have not yet measured our own crossover point for Gaia Research. I don't want to manufacture one for a compelling graph. For now, my claim is a research hypothesis: on some bounded, well-instrumented coding tasks, a cheap agent with targeted tools and bounded retries may beat a stronger single agent, and both may beat a ceremonial multi-agent hierarchy.

## The experiment I want, eventually

Not another leaderboard where the answer is whatever model ranked first this week. I want to compare execution strategies on the same issues with the same acceptance criteria:

- One capable model acting alone.
- One cheap model with bounded sequential retries.
- Multiple cheap models solving independently in isolated worktrees.
- A strong orchestrator assigning work to cheap agents.
- A cheap-first route that escalates only on defined failure signals.

Track actual metered cost or accurately described subscription quota consumption, wall-clock time, verified success, recovery labor, and the amount of human attention required. Separate code that passes a test from code that is safe to merge or proven in production. Report correlations between failures, not just percentages.

The experiment comes later. First, I want us to change how we think.

*(See our companion piece on moving from conversational management to software-level coordination: [Beyond Orchestration: The Missing Economic Scheduler for AI Agents](/blog/missing-economic-scheduler).)*

## Intelligence should be an allocation decision

A developer on a modest plan should not have to rent a virtual executive team just to ship a small fix. Nor should we pretend a tiny model can reason through every architectural problem if we ask nicely enough.

We should start with the cheapest plausible executor, equip it with the strongest relevant tools, verify its output, and pay for stronger intelligence when the evidence justifies it.

The principle I want to test is simple: **the unit of optimization is not the subtask or the model call. It is the cheapest independently verifiable attempt at a useful outcome.**

That is where I think the economics of agentic work begins.

## Sources and reading

1. Chen, L., Zaharia, M., & Zou, J. (2023). *FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance*. https://arxiv.org/abs/2305.05176
2. Snell, C., Lee, J., Xu, K., & Kumar, A. (2024). *Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters*. https://arxiv.org/abs/2408.03314
3. Anthropic (2024). *Building effective agents*. https://www.anthropic.com/research/building-effective-agents
4. Hadfield, J., Zhang, B., Lien, K., et al. (2025). *How we built our multi-agent research system*. Anthropic. https://www.anthropic.com/research/multi-agent-research-system
5. Amdahl, G. M. (1967). *Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities*. AFIPS Spring Joint Computer Conference.
6. Brooks, F. P. (1975). *The Mythical Man-Month: Essays on Software Engineering*. Addison-Wesley.
7. Amjad, R. (2026). *Anthropic's New Subagent Rules Will Change How You Build*. https://youtu.be/ybx0mmd22pQ (analyzing Anthropic Applied AI guidance on folding subagents into a single loop, Conway's Law in agent design, and the Ticket Trap).
