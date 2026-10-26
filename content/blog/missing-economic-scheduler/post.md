# Beyond Orchestration: The Missing Economic Scheduler for AI Agents

*October 26, 2026 · Field Note by Marcus Tiongson · Founder, Gaia Research*

---

A strange thing happens when I ask a powerful AI to manage cheaper AIs: sometimes the manager spends more time, money, and tokens explaining the job than the worker spends doing it.

The worker might need one small instruction and a repository tool. But the orchestrator needs the original request, the plan, the history of previous attempts, summaries from workers, tool outputs, revised prompts, and another round of reasoning just to decide what happens next. We have built an expensive office around inexpensive compute.

That was my starting complaint about **the orchestrator tax**. But I no longer think the interesting question is simply whether a single agent beats a team. I think there is an abstraction missing between them.

What if the expensive part isn't delegation itself? What if it is our habit of using language-model intelligence to carry out jobs that ordinary systems software already knows how to do?

## We are asking a reasoning model to be a scheduler

Consider a coding issue with clear acceptance tests. A frontier model reads the issue, constructs a dispatch prompt, selects a worker, waits, reads a progress update, decides whether the worker is finished, requests another test, and finally summarizes the result.

Some of these operations require judgment. Many do not.

A scheduler can select an idle worker. A database can preserve task state. A queue can wake a process when work finishes. A state machine can enforce a retry limit. A test runner can mark whether an assertion passed. Artifact storage can hold the full logs while a controller passes around a small reference.

We would never ask a high-performance CPU core to write an eloquent memo every time it hands a thread to another core. We designed runtimes, schedulers, memory systems, and synchronization primitives instead.

AI agents are different from CPU threads: context is not automatically coherent, model outputs are probabilistic, and tools mutate a real world that cannot always be rolled back. Still, the analogy exposes a design problem. **Why are we paying reasoning prices for bookkeeping?**

## The shared-memory intuition, and its limits

I was thinking about GPUs. They coordinate vast amounts of comparatively simple parallel work with carefully managed memory and scheduling. In our agent ecosystems, relevant information is scattered across chats, repository docs, local skills, context stores, issue trackers, and tool outputs:

> “there's a shared memory There's a global memory”

> “there are these skills scattered all around that's trying to do the same thing.”

We have skills that preserve procedure. We have context-management layers that compress or retrieve prior work. We have source-control systems that hold durable artifacts. Yet each new agent can still be asked to reconstruct the same world from a lengthy briefing.

What we need is not necessarily one giant shared prompt. That would introduce its own cost, stale state, privacy risks, and conflicts. We need **a common state model with selective context access**: small, versioned task descriptions; discoverable skills; immutable evidence receipts; artifact references; and clearly scoped permissions.

The runtime should know *where* the knowledge is. The agent should receive only the knowledge it needs. Crucially, this is logical shared state, not an assertion that distributed agents literally share an LLM's KV cache or internal working memory.

And this has to respect task boundaries: one agent's unreviewed observation must not quietly become another agent's authoritative fact.

## Existing systems already solve important pieces

This is not a claim that we have invented durable execution.

**Temporal** provides durable workflows, task queues, retries, and recovery from crashes and long waits. Its AI documentation explicitly discusses agent loops and shared runtimes for agent workloads. Those capabilities mean a model does not need to remember how to restart a failed task. [1]

**LangGraph** provides stateful workflows with checkpoints and persistent stores. A checkpointer saves execution state within a thread; stores can hold application-defined knowledge across threads. It can support conditional routing and human review without requiring each transition to be narrated conversationally. [2]

**Ray** offers distributed tasks, stateful actors, scheduling, and object references. Its object store supports passing references to distributed data instead of stuffing every artifact into an agent's next prompt. That is a useful systems precedent, though Ray by itself is not an AI economic optimizer. [3]

**Anthropic's agent patterns** separately describe predefined workflows and dynamic orchestrator-worker delegation. Dynamic planning is genuinely valuable when we cannot know the work graph in advance. But not every status update is a new planning problem. [4]

**Hikari9's Auto Office**, which prompted this line of inquiry, is a particularly relevant implementation to compare:

> “someone else made some sort of tool like this.”

I am keeping its exact dispatcher and durability mechanisms out of this draft until a repository review can establish them line by line. A useful comparative article should not treat an attractive README description as a verified architecture. [5]

The important correction is this: **we already have coordination runtimes. The unresolved research question is when and how those runtimes should spend intelligence:**

> “orchestration not yet being solved right now”

## From workflow scheduler to economic scheduler

A normal scheduler asks which worker is available and which job is next. An *economic scheduler for AI agents* would ask a harder question:

> Given this task, what execution policy offers the best expected verified outcome within our money, time, risk, and attention budgets?

Its choices might include one Luna attempt, two independent Luna attempts, a delayed hedge after a stall, a stronger Sol planning pass, or an Opus review of a high-risk change.

The scheduler would need some evidence about task characteristics, model performance, verification quality, tool availability, and prior failures. Without that evidence, an elaborate optimizer becomes another guesser, only with a fancier name.

Here is the conceptual split I would use:

`Task intake → structured task + evidence pointers → policy scheduler → worker(s) → verifier → accept / retry / escalate`

[[ECONOMIC_SCHEDULER_ARCHITECTURE_SVG]]

The *policy scheduler* is code for the routine cases: queue, resource limits, retry budgets, stop conditions, and escalation thresholds. It may use an inexpensive classifier or historical estimates where deterministic rules are insufficient. A capable reasoning agent comes in when the system detects real uncertainty: ambiguous intent, contradictory evidence, architectural conflict, unsafe actions, or repeated correlated failure.

Notice what changed. The expensive model is no longer the always-on project manager. It is an **exception handler and specialist**.

## A measurable decision, not an elegant diagram

The objective could be written as:

`Choose policy π to minimize E[total execution + coordination + verification + recovery cost]`

subject to:

`P(verified acceptable outcome | π) ≥ required reliability`

`Expected or tail latency ≤ deadline`

`Safety and authorization constraints are satisfied`

For subscription-based users, 'cost' must include more than API dollars. Daily or weekly quotas, throttling, session availability, time spent waiting, and a developer's own attention may be the binding constraints. A scheduler optimized only for token billing could be terrible for someone on a fixed monthly plan.

And there is no universal winner. A bounded documentation repair with exact checks might route to Flash immediately. A small backend patch with focused tests might start with Luna and allow one retry. A change to the invariants of a financial ledger may require a stronger designer and human approval from the outset. In some cases the cheapest possible option is not to launch another agent at all, but to improve the task specification.

This is why I resist the idea of designing one mandatory hierarchy for every job.

*(For our companion piece on comparing individual small models against frontier scale, see [The Economics of Agentic Work: When Small Agents Beat Frontier Models](/blog/economics-of-agentic-work).)*

## The overlooked tax: context reentry

There is a narrower systems cost worth treating separately. When an orchestration agent waits for a worker, its long prompt prefix may not remain cached under a provider's effective cache policy. On reentry, context can be expensive to reconstruct or process. Repeated large-context wakeups may erode the savings of cheap leaf workers.

Gaia Research already has an Idea Bank proposal exploring cold-cache reentries and cache lifetime mismatch. That deserves its own measured study, not an unverified cost multiplier inserted here. Provider cache policies, actual cache hit rates, and model pricing vary. The broader economic scheduler could use measured cache behavior as **one feature among many**, rather than treating caching as the entire explanation for orchestration overhead.

There are at least three distinct taxes: **control-plane work** (planning and routing), **context movement** (briefing, summarizing, cache misses), and **integration risk** (merging conflicting outputs and assessing correctness). Reducing one does not automatically remove the others.

## Why dynamic workflows are not the end of the story

A workflow can be dynamic without being economical. It can decide the next step intelligently while still invoking an expensive model for every minor transition. It can parallelize work without knowing whether duplicate attempts are correlated. It can resume after a crash without knowing whether another attempt is worth purchasing.

Existing tooling gives us essential primitives. The missing *product-level behavior*, at least as a general portable design target, is the disciplined selection of the least costly reliable execution policy for the current task. Some systems may already implement pieces of this; our claim should be framed as a comparative research agenda, not an industry-wide assertion that no one has solved it.

That distinction matters. There is less value in announcing an imaginary invention than in identifying the exact boundary where available systems leave builders to hand-tune their economics.

## What I would build first

Not an operating system for agents. Not a new model-management bureaucracy. Start smaller.

Put each candidate coding task into a structured envelope containing outcome, constraints, acceptance checks, permissions, and context pointers. Record each run's model, prompt-and-tool costs where available, quota consumption, latency, tests, intervention, and result. Add a handful of policies: cheap-first, bounded retry, delayed hedge, and escalate-on-uncertainty. Compare them on real issues. Make failures inspectable.

If the cheap-first policy repeatedly succeeds, keep using it. If it fails on specific kinds of tasks, route those tasks differently. If the scheduler's own inference and infrastructure costs consume the savings, simplify it. The substrate should make decisions cheaper, not simply move the ceremony into another service.

I suspect the next gain in AI productivity may not come from inventing a more impressive fictional organization of agents. It may come from giving agents the mundane infrastructure that distributed computing learned to build long ago, and then adding a careful economic policy for when intelligence is actually needed.

**Scheduling compute is a solved discipline. Scheduling intelligence under uncertainty is the problem I want to work on.**

## Sources and reading

1. Temporal. *Durable AI*. https://docs.temporal.io/ai
2. LangGraph. *Persistence*. https://docs.langchain.com/oss/python/langgraph/persistence
3. Ray. *Core concepts and distributed objects*. https://docs.ray.io/en/latest/ray-core/key-concepts.html
4. Anthropic. *Building effective agents*. https://www.anthropic.com/research/building-effective-agents
5. Hikari9. *Auto Office* (comparison target; implementation details pending direct code review). https://github.com/Hikari9/auto-office
6. Chen, L., Zaharia, M., & Zou, J. (2023). *FrugalGPT*. https://arxiv.org/abs/2305.05176
7. Hadfield, J., Zhang, B., Lien, K., et al. (2025). *How we built our multi-agent research system*. https://www.anthropic.com/research/multi-agent-research-system
8. Gaia Research Idea Bank. *The Orchestrator Tax: Cold-Cache Reentries* (internal, unratified research hypothesis). `docs/idea-bank/blog-idea-orchestrator-tax-cold-cache-reentry.md`
