# Are We Building the Future of Software Factories, or Just Scaffolding for Today's Agents?

- **Status:** Gaia Research Idea Bank / Unranked Editorial Idea / Founder Essay Candidate
- **Recorded:** November 9, 2026 (Asia/Manila)
- **Type:** Open research question, not a technical decision or prediction
- **Owner's voice:** First-person founder perspective, lightly edited from spoken remarks
- **Tracking:** [gaia-research #331](https://github.com/gaia-research/gaia-research/issues/331)
- **Starting reference:** [User-shared YouTube video](https://youtu.be/pz74r-4dGfQ?si=NHvTRAhcLkrnvLCb) (contents **not independently verified**; do not attribute specific ideas to the video until reviewed)
- **Boundaries:** Idea bank only; not a published blog post, approved roadmap, or direction to retire Gaia orchestration.

## The question

**Are we building the future of software factories, or are we building temporary scaffolding around what today's agents cannot yet do?**

A second question follows: **What parts of the autonomous software factory will become native, ordinary platform capabilities, and what parts of engineering will still need to be deliberately designed and governed?**

I think the wave of people building their own software factories makes sense. They are experimenting with autonomous pipelines, self-improving agent workflows, long-running jobs, multi-agent teams, schedulers, routers, monitoring agents, test generation, and infrastructure that can keep working when a human steps away. We are doing a version of this ourselves with Steward. It is a natural progression of AI engineering.

But I wonder whether we are also solving a rapidly moving problem with increasingly elaborate infrastructure.

We are calling it *meta-engineering*: instead of just engineering software, we are engineering the system that engineers software. And because the capabilities are still new, we are spending an enormous amount of effort figuring out what the harness should do, how workers should cooperate, how much testing is enough, how to monitor a model, how to persist work, and when to restart or retry. That experimentation matters. It helps us discover both genuine reliability problems and limitations that may vanish with the next generation of agents.

My hesitation is not about the value of learning. It is about whether everyone actually needs to build and maintain a whole software factory of their own.

## Founder perspective: a moving capability frontier

This section is a **clean paraphrase of the November 9 conversation**, not a verified set of empirical claims or a word-for-word quote.

- Today's elaborate software factories can be educational and operationally useful, especially while long-running agents and coordination patterns are immature.
- Sometimes a layer of agent roles, monitors, schedulers, prompts, retries, and routing is compensating for a weakness of a specific model or harness, rather than solving a permanent systems problem.
- As models get better at planning, executing, checking their own work, coordinating, and sustaining long tasks, providers may package these functions into the agent runtime. The software-factory experience could become a default feature rather than a custom project.
- It is plausible that work that once needed a large coordinated team could become tractable for a single stronger model in one bounded run. The founder's comparison of older versus newer Opus generations is an **illustration**, not a controlled model evaluation.
- Excess coordination can create a token tax: reading context again, repeated routing, agent-to-agent summaries, duplicated checks, monitor overhead, and recoveries. However, a smaller inference bill for one run is not the same thing as lower total cost per *verified* outcome.
- Gaia's Steward is part of the experiment, not an exemption from it. Its orchestration should remain open to simplification as the underlying agent and platform improve.
- **I may be wrong.** A real software factory may contain essential institutional controls that don't disappear when the model becomes more capable.

The point is to ask whether some meta-engineering is **transitional engineering**: valuable now, eventually absorbed into platforms, and perhaps later regarded as infrastructure that once had to be built by hand.

## What the November 2026 landscape suggests

These are dated research references, not claims of an exhaustive industry census.

| Perspective | What the source actually supports | How it bears on the question |
| --- | --- | --- |
| **Anthropic, Managed Agents** (Apr 8, 2026) | Anthropic describes a harness workaround for Sonnet 4.5 that became unnecessary for Opus 4.5, and argues for stable interfaces that let the internal harness change as models improve. | Particularly strong evidence that **some harness assumptions expire**, and that capabilities can be abstracted behind durable interfaces. |
| **Anthropic, effective harnesses** (Nov 26, 2025) | Long-running autonomous work still needed explicit initialization, durable artifacts, and incremental sessions. Anthropic left single-agent vs. multi-agent architectures an open question. | Some coordination is needed now, but the optimal topology is unsettled. |
| **Anthropic, long-running application harnesses** (Mar 24, 2026) | Reports that earlier harness and prompting strategies hit performance ceilings and were redesigned. | Harness evolution remains active; neither one fixed recipe nor model-only execution is settled. |
| **OpenAI, harness engineering** (Feb 11, 2026) | Describes an agent-written product, an agent-friendly repository, verification and feedback loops, and an end-to-end agent workflow dependent on infrastructure. | High autonomy has been achieved, but *because of* environmental and verification investments. |
| **OpenAI, Symphony** (Apr 27, 2026) | Defines an orchestrator that turns a project-management board into a control plane for ongoing Codex work. | Some previously custom integration work is already becoming a standardized, reusable orchestration product or specification. |
| **OpenAI, Codex app** (2026) | Built-in Automations schedule repetitive agent work and return results for review. | Scheduling is an example of factory functionality moving into a standard agent interface. |
| **Steve Yegge, Gas Town / Gas City** (2026) | Beads, Gas Town and Gas City articulate durable work ledgers, many-agent orchestration, and composable factories. | Serious practitioners are building the factory layer rather than treating it as incidental. Their experience is a counterweight to early obsolescence claims. |
| **Uber, software factory** (Aug 27, 2026) | Uber documents managed agent workflows across development and delivery, including humans reviewing or escalating agent work. | At enterprise scale, coordination and organizational integration can have value independent of whether the model can write the code. |

### A potentially important convergence

Anthropic's discussion of **stale harness assumptions** is unusually close to the founder's intuition. It is not evidence that *all* orchestration will disappear. It is evidence that the layers we invent to compensate for model limitations should have an expiration date, a measurement method, and a willingness to be removed. Meanwhile, OpenAI's work and Uber's deployment suggest that observability, reliable execution, and institutional feedback loops remain substantive engineering problems.

## The strongest opposing case

Perhaps the factory is not mainly there because today's models are weak. Perhaps it is there because even excellent agents should not be granted uncontrolled autonomy in a real organization.

A future model that can complete a project alone still needs to know which changes were authorized, which repository is canonical, how secrets are kept out of untrusted code, what counts as a passing acceptance check, who can merge or deploy, and where an audit trail lives. The enterprise version has multiple teams, jurisdictions, tenants, repositories, spending limits, and failure domains. Increased intelligence does not erase these external obligations.

It is also possible that better models **increase** demand for orchestration: as task throughput rises, human review capacity, governance, and cross-system coordination become the bottlenecks. The factory might evolve from instructing weak workers to managing powerful, mostly independent ones.

There are at least three distinct futures worth comparing:

1. **Absorption:** Custom agent monitors, schedulers, routers, and retries gradually become standard provider/runtime features. Bespoke orchestration shrinks.
2. **Specialization:** Generic orchestration becomes native, while domain-specific verification, compliance, permissions, repository conventions and durable company knowledge remain external.
3. **Expansion:** Smarter models increase the scale of autonomous work and make more sophisticated factories useful, even as individual tasks require less guidance.

These are hypotheses, not a forecast of inevitability.

## What could we measure instead of guessing?

A focused Gaia Research experiment could test whether increasing model capability makes the marginal value of custom orchestration smaller, larger, or merely different.

**Compare three setups on the same portfolio of realistic repository tasks:** (A) one agent with standard native tools; (B) the same agent with a minimal state-and-verification harness; (C) a full custom software-factory workflow with routing, monitoring, coordination and recovery. Repeat with newer model generations without silently changing the work, success criteria, task permissions or review policy.

Measure:

- **Verified completion:** correctness, robustness, review quality, and reliability under re-runs.
- **API-equivalent inference cost:** input, output, reasoning and orchestration tokens, including failures and retries. This is an **estimate**, not a claim about what a subscription user paid out of pocket.
- **End-to-end cost and latency:** wall time, test execution, infrastructure, human intervention and operational maintenance.
- **Orchestration tax:** handoff count, unnecessary restarts, duplicated tests, context reprocessing, and work performed solely to coordinate agents.
- **Safety and governance:** unauthorized writes, secret exposure risk, recoverability, auditability, and compliance with approval boundaries.
- **Ablation after model upgrades:** remove one custom harness mechanism at a time. Does success fall? If not, that mechanism may have become redundant.

Define the primary decision measure as **total cost per independently verified, authorized completion**. Do not confuse cheaper tokens, faster demos, or larger agent teams with better software outcomes.

**Evidence that would favor the founder's hypothesis:** A newer model with native features reaches comparable verified quality and acceptable safety without a complex custom factory, and its saved orchestration cost exceeds any new recovery or review burden.

**Evidence against it:** Factory-specific mechanisms keep producing clear, reproducible gains across newer models and realistic failure conditions, especially in high-impact governance, reliability, or enterprise coordination.

## Questions for a future essay

- Are we engineering durable capabilities, or documenting the limitations of today's agents in executable form?
- Which parts are **intrinsic to software organizations** and which are only temporary compensation for model weaknesses?
- Is the emerging agent software factory analogous to hand-built deployment scripts before managed CI/CD, or is it becoming a new durable operating layer?
- Will tomorrow's engineer design agents, design the environment around agents, or primarily define outcomes and governance?
- How should Gaia decide when Steward needs another capability, and when it needs *less* machinery?
- Is the *real* meta-engineering skill designing systems that can be **deleted gracefully** when the next generation no longer needs them?

## Editorial direction and status

**Possible opening line:** *What if the software factories we are so busy building today are teaching us how to build something that tomorrow's agents will simply do by default?*

Write this as a curious, first-person Gaia Research essay, not a dismissive critique of developers building factories. Attribute the founder's intuition as opinion and give technically credible counterarguments. A compelling answer may be **both**: custom factories are a necessary discovery phase, and the best pieces are gradually absorbed by models and stable runtimes.

**Before publication:** Review the linked video directly, verify any quotations, expand the source ledger with contrary positions, select experiments, and get independent editorial/technical review. This draft does not authorize implementation, public blog publication or merging.

## Sources and adjacent Gaia work

**Primary practitioner and engineering references**
- [Anthropic: Scaling Managed Agents, Apr 8, 2026](https://www.anthropic.com/research/managed-agents)
- [Anthropic: Effective harnesses for long-running agents, Nov 26, 2025](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
- [Anthropic: Harness design for long-running application development, Mar 24, 2026](https://www.anthropic.com/research/harness-design-long-running-apps)
- [OpenAI: Harness engineering, Feb 11, 2026](https://openai.com/index/harness-engineering/)
- [OpenAI: Open-source Codex orchestration: Symphony, Apr 27, 2026](https://openai.com/index/open-source-codex-orchestration-symphony/)
- [OpenAI: Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/)
- [Steve Yegge: Gas Town](https://yegge.ai/gastown)
- [Steve Yegge: Welcome to Gas City, Apr 24, 2026](https://yegge.ai/essays/welcome-to-gas-city/)
- [Uber: Running a Software Factory Efficiently at Uber Scale, Aug 27, 2026](https://www.uber.com/ph/en/blog/efficient-software-factory/)

**User-shared reference (contents not yet reviewed)**
- [YouTube: pz74r-4dGfQ](https://youtu.be/pz74r-4dGfQ?si=NHvTRAhcLkrnvLCb)

**Adjacent Gaia Research investigations (distinct, do not collapse into this one)**
- [#304: Economics of agentic work](https://github.com/gaia-research/gaia-research/issues/304)
- [#306: Economic scheduler](https://github.com/gaia-research/gaia-research/issues/306)
- [#323: Router economics](https://github.com/gaia-research/gaia-research/issues/323)
- [#331: This research question](https://github.com/gaia-research/gaia-research/issues/331)
