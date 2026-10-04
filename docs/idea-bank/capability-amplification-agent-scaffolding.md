# Capability Amplification: When Agent Scaffolding Lets Cheaper Models Punch Above Their Weight

**Status:** idea bank  
**Tracking:** #282  
**Theme:** agent economics, model routing, scaffolding, reliability, cost-performance

## Thesis

Agent scaffolding can act as a form of **inference-time capability amplification**.

The claim is deliberately narrower than “small models become frontier models.” The research question is whether structured skills, decomposition, deterministic checks, independent review, checkpoints, retries, and selective escalation can let a cheaper model complete some real agent tasks reliably enough that the **system-level cost per successful task** beats using a stronger model end to end.

That distinction matters because procedural structure is not always prompt debt. Sometimes it is an economic instrument.

A Flash- or Luna-class model with the right scaffold may occupy a better point on the cost/reliability frontier than either:

1. the same model operating with a lean prompt and little structure; or
2. a stronger model used for every step of the workflow.

The interesting unit of analysis is therefore not raw model capability. It is **effective task capability per unit cost**.

## Why investigate this

Modern prompting guidance increasingly favors objective-first instructions and gives stronger models more freedom to choose their own route. That is directionally useful, but it creates a risk of over-correcting: removing procedural scaffolding that was intentionally built to make cheaper models dependable.

Gaia already has concrete examples. A workflow such as Skill Tree's `feature-pipeline` may be overly ceremonial for a strong autonomous model while still being an efficient way to conduct a Flash-only audit with explicit decomposition, state, reviewer separation, and bounded stopping rules.

This suggests a useful distinction among four kinds of structure:

- **Governance-critical scaffolding** — required regardless of model because it protects authority, safety, provenance, or irreversible actions.
- **Reliability-critical scaffolding** — useful because the task itself benefits from deterministic structure.
- **Cost-amplifying scaffolding** — useful because it lets cheaper models perform above their unaided reliability.
- **Legacy ceremony** — token and latency overhead that no longer improves terminal correctness.

The goal is not to make every skill shorter. It is to know which structure is still buying capability.

## Initial related literature

### 1. AutoMix: Automatically Mixing Language Models

Aggarwal et al. (2023) route uncertain outputs from a smaller model to a larger one and report more than 50% computational-cost reduction at comparable performance in their evaluated settings.

- Paper: https://arxiv.org/abs/2310.12963
- Relevance: establishes that heterogeneous model use can dominate an all-frontier strategy and provides a routing baseline against which scaffolding can be compared.

### 2. RouteLLM: Learning to Route LLMs with Preference Data

Ong et al. (2024) learn when to route between a weaker and stronger model using preference data, reporting cost reductions greater than 2x in some benchmark settings without degrading response quality.

- Paper: https://arxiv.org/abs/2406.18665
- Relevance: frames model choice as a cost-quality frontier rather than a single best-model decision.

### 3. AgentRouter: Heterogeneous Model Routing for Cost-Optimal Multi-Step Agentic Workflows

Paul & Nandy (2026) move routing inside multi-step agent trajectories, assigning different steps to different model tiers. Their reported results show substantial savings relative to frontier-only execution while retaining most of the quality.

- Paper: https://arxiv.org/abs/2609.22951
- Relevance: especially close to Gaia because the unit of work is a trajectory rather than a single prompt. It motivates asking whether **workflow structure plus routing** can shift even more work toward cheaper tiers.

### 4. Sub-Goal Distillation: A Method to Improve Small Language Agents

Hashemzadeh et al. (CoLLAs 2024) study transferring planning structure from a larger language model into a much smaller language agent for long-horizon interactive tasks.

- Paper: https://arxiv.org/abs/2405.02749
- Relevance: direct evidence that decomposed planning structure can improve the effective performance of a much smaller agent.

### 5. The Energy Cost of Reasoning: Analyzing Energy Usage in LLMs with Test-time Compute

Jin, Wei & Brooks (2025) investigate whether allocating extra inference-time compute can outperform simply increasing model size on accuracy-energy tradeoffs, finding favorable regimes for test-time compute.

- Paper: https://arxiv.org/abs/2505.14733
- Relevance: useful conceptual support for treating scaffolding as a compute-allocation strategy rather than assuming that model scale is always the most efficient way to buy capability.

### 6. Learning When to Sample: Confidence-Aware Self-Consistency for Efficient LLM Chain-of-Thought Reasoning

Xiong et al. (2026) adaptively decide when to spend extra reasoning effort and report large token savings while maintaining accuracy close to multi-path baselines.

- Paper: https://arxiv.org/abs/2603.08999
- Relevance: supports **adaptive scaffolding**. Extra structure should be invoked when uncertainty justifies it, not imposed uniformly.

### 7. Self-Consistency Improves Chain of Thought Reasoning in Language Models

Wang et al. (2022) show that sampling and aggregating multiple reasoning paths can materially improve reasoning accuracy.

- Paper: https://arxiv.org/abs/2203.11171
- Relevance: foundational evidence that orchestration around a fixed base model can change effective task capability, though at added inference cost.

## Research questions

1. For which agent task classes does structured scaffolding let a cheap model beat a stronger model on **cost per successful completion**?
2. Where does scaffolding overhead erase the cost advantage?
3. Which primitives provide the largest lift per token or dollar: decomposition, checklists, independent review, deterministic validators, retries, state checkpoints, or escalation?
4. Does a **Flash worker + Flash reviewer** produce a better economic outcome than one stronger model on audits and bounded coding tasks?
5. When does **Luna + structured skill** become competitive with stronger-model lean execution?
6. How much of the measured lift comes from better structure versus simply spending more test-time tokens?
7. Can the system learn when to switch among:
   - lean autonomous mode;
   - structured economy mode;
   - frontier escalation?
8. Which failure modes resist amplification, especially correlated reviewer error, shallow ritual compliance, or semantic mistakes that pass deterministic checks?

## Candidate benchmark

Use 3–5 repeatable agent tasks with objective terminal checks, such as:

- repository audit → hidden injected defects + issue-quality rubric;
- bounded coding repair → tests + diff review;
- instruction/documentation audit → known policy conflicts;
- browser/API research → source recall + citation correctness;
- workflow triage → gold-labeled decisions.

Compare at least five arms:

| Arm | Execution |
|---|---|
| A | cheap model, lean prompt |
| B | cheap model, structured skill |
| C | cheap worker + cheap independent reviewer |
| D | stronger model, lean objective-first prompt |
| E | adaptive route: cheap first, escalate only on trigger |

Measure:

- end-to-end task success;
- severe-error / escape rate;
- total input, output, and reasoning tokens;
- provider cost;
- wall-clock latency;
- number of model calls;
- human interventions;
- **cost per successful completion**;
- reliability/cost Pareto frontier.

## Methodological guardrail

Do not define capability amplification as “the model followed more steps.”

More scaffolding can easily become theater: extra tokens, extra latency, and correlated mistakes spread across multiple calls.

The target variable is **terminal task quality per unit cost**. A scaffold earns its place only if it measurably improves that frontier, or if it enforces a real governance boundary that should not be optimized away.

## Expected contribution

A useful result would produce a practical authoring rule for agent skills:

> Use the least scaffolding that preserves the desired reliability and authority envelope at the cheapest viable model tier.

That could lead to a three-mode design pattern:

1. **Lean autonomous mode** — stronger models receive the objective, constraints, authority boundaries, and proof requirements with minimal choreography.
2. **Structured economy mode** — cheaper models receive stronger decomposition, deterministic checks, reviewer separation, or state machinery because those structures measurably amplify capability.
3. **Hard-gated mode** — explicit stops remain mandatory because governance or irreversible actions require them.

## Possible artifacts

- A literature synthesis defining capability amplification as a systems property.
- A reproducible benchmark suite for scaffold-vs-model cost tradeoffs.
- A cost/reliability matrix across Flash/Luna-like and stronger model tiers.
- A decomposition of which scaffolding primitives actually create lift.
- Guidance for Skill Tree and Skill Heaven skill authors.
- Gaia Research editorial: **Capability Amplification: When Better Scaffolding Beats a Bigger Model**.
- Alternative framing: **The Scaffold Dividend: How Cheap Models Become Useful Agents**.

## Related

- #282
- `gaia-research/gaia-skill-tree#2039` — audit of skills and cached instructions for newer model behavior
- Parallel Cheap-Scout Fan-Out research — prior Gaia work on cheaper-model orchestration economics
