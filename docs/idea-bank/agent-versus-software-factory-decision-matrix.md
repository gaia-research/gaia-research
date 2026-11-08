# When Does a General Agent Need a Software Factory?

- **Status:** Idea Bank / Unranked / Working research draft for Astra High panel adjudication
- **Recorded:** November 9, 2026 (Asia/Manila)
- **Purpose:** Form a decision model for selecting a general-purpose agent, a minimally governed agent, a lean specialized factory, or a governed software factory.
- **Confidence:** Conceptual framework, **not yet benchmark-calibrated** or ratified.
- **Companion but separate:** [Software-factories-as-scaffolding founder essay, draft PR #332](https://github.com/gaia-research/gaia-research/pull/332). The Astra panel for **this entry only** must not edit that essay or its PR.
- **Scope:** Docs-only proposal; not a production architecture mandate, policy change, or approval for autonomous execution.

## The central question

**When is a sufficiently capable general-purpose agent enough, and when does dedicated software-factory architecture deliver lasting value?**

AI capability is increasing and native platform features may subsume much of the scheduling, routing, recovery, and subagent coordination built by hand today. Yet repeatable domain-specific work, independent authority boundaries, durable organizational state, verification, and integration might still make specialized systems preferable.

**Core distinction:** *Could the model perform the work?* is a different question from *Should this work be operated through an enduring, independently governed system?* A more intelligent agent does not automatically acquire deployment authority or make compliance checks unnecessary.

A “software factory” here means a repeatable, deliberately engineered system for turning authorized work requests into verified changes through tools, workflows, persistent state, and possibly multiple agents. It **does not require** a large multi-agent hierarchy. A single powerful model inside a dependable specialized workflow may itself be a factory.

## A first-pass 2×2 decision matrix

| | **Low specialization demand** | **High specialization demand** |
| --- | --- | --- |
| **High independent governance need** | **General agent + independently enforced approval gates.** Example: a one-off production hotfix. Reasoning need not be specialized just because the outcome is risky; approval, test evidence, rollback and permissions still matter. | **Governed specialized factory.** Example: recurring production changes across tightly controlled services. Integrates domain rules, state, independent test evidence, policy enforcement, audits, controlled releases and recovery. |
| **Low independent governance need** | **General-purpose agent.** Example: a bounded, reversible one-off feature. Light tools and acceptance tests are more proportionate than a permanent factory. | **Lean specialized factory.** Example: thousands of routine, stable-format updates. Deterministic domain tooling, efficient repetition and cheap verification can justify specialized automation without elaborate agent teams. |

**Borderline cases:** Prefer a configurable *minimal harness* and measure its incremental value before adding persistent orchestration. A quadrant suggests what to test, not what must be purchased or built.

## Decision inputs and illustrative formula

Use 0–3 ordinal ratings (0 = negligible, 3 = strong):

| Variable | Meaning | Why it matters |
| --- | --- | --- |
| `R` | Repetition / throughput | Reusable factory engineering pays back over repeated work. |
| `D` | Domain specificity | Unique rules, APIs, acceptance tests and organizational semantics reward specialized tools. |
| `C` | Coordination complexity | Cross-system dependencies and long-running tasks may need state and dispatch beyond an agent session. |
| `N` | Coverage by native platform capabilities | Existing provider scheduling, routing, persistence, retries and tooling can make **custom** coordination redundant. |
| `I` | Consequence and reversibility of failure | Risk increases the need for independently controlled actions, even for a one-off task. |
| `A` | Assurance / audit requirement | Independent evidence, compliance and organizational accountability are distinct from the model's skill. |

**Candidate specialization score:** `S = R + D + max(0, C − N)`, ranging 0–9.

**Candidate governance score:** `G = I + A`, ranging 0–6.

For illustration **only**, treat `S ≥ 5` and `G ≥ 3` as the high sides of the matrix. The exact weights, aggregation, and thresholds are not measured. Adding ordinal values assumes independence and substitutability that may not hold. A panel should critically test whether hard constraints, decision trees, expected-value models, Pareto frontiers, or uncertainty bands produce better decisions.

### Separate autonomy and permission gate

**Never equate “choose a software factory” with “authorize unattended action.”** Independently establish:

1. **Verifiable outcomes:** objectively checkable acceptance criteria the acting agent cannot redefine to declare itself successful.
2. **Bounded authority:** scoped credentials, action limits, blast-radius containment, protection of secrets and controls independent of the model's own promises.
3. **Recovery and observability:** reversible operations where feasible, incident reporting, durable audit trail and ability to interrupt/reconcile a failed run.
4. **Explicit human approval:** required wherever deployment, destructive, high-consequence, legal, or other sensitive actions lie outside preauthorized bounds.

When these are missing, the recommended mode is **proposal-only or human-led**, even if a sophisticated factory architecture exists.

## Cases to test, not predetermined answers

| Scenario | Hypothetical quadrant | What would change the answer? |
| --- | --- | --- |
| One-off ordinary feature, safe sandbox, standard tests | General-purpose agent | Repeated production pattern, domain constraints or poorly verifiable outcomes. |
| Repeatable routine PR updates, thousands per month, limited blast radius | Lean specialized factory | Native workflows perform as well at lower total cost; then a general agent + small reusable tools may win. |
| Rare production security hotfix | General agent + gates | Recurring structured incidents and complex integrations could justify a specialized governed system. |
| Gaia Steward preventive maintenance across repositories | Governed specialized factory candidate | Prove the incremental value of watchers, durable state, policy, evidence and repair orchestration; prune redundant inference ceremony when native model capabilities improve. |
| Future highly capable native agent with scheduling, memory, routing and self-checks | General agent or governed general agent where domain needs are low | Neither raw intelligence nor built-in automation removes independent authorization; specific repeatable workflows may still favor a factory. |
| Regulated, high-throughput multi-repository production delivery | Governed specialized factory | Evaluate whether standardized managed platforms implement policy sufficiently well without custom factory maintenance. |

The best outcome might be **a powerful single agent inside a thin governed environment**. Do not misclassify this as “no factory” merely because only one model executes tasks.

## How to compare options empirically

Test at least three arms on the same representative workload:

- **A: General agent:** current native capabilities and ordinary repository tools.
- **B: General agent + thin harness:** durable state, deterministic verification and independent approval/permission gates, no unnecessary orchestration.
- **C: Specialized factory:** workflow-specific tools, coordination, monitoring/recovery, policies, versioned procedures and measurable evidence.

Control for model version, task distribution, context access, approval limits, tool access, cache conditions, team expertise, and acceptance criteria. Include easy tasks, long-running work, cross-system changes, failure injection, and genuinely consequential production-like scenarios in safe test environments. Re-run ablations following major model or platform upgrades.

Measure:
- Independently **verified authorized completions** and severity-weighted defects, not just PR count or generated lines.
- Full end-to-end cost per verified deliverable: inference, API-equivalent orchestration tokens, retries, human review, testing, infrastructure and amortized factory engineering. **API-equivalent spend must be labeled an estimate, not a user's out-of-pocket charge.**
- Wall time, intervention count, operational reliability and context/handoff overhead.
- Security boundary violations, unintended writes, irreversibility, rollback quality and audit completeness.
- Sensitivity to workflow volume, model improvements, native feature maturity, and the cost of maintaining bespoke infrastructure.

Where possible, compute observed **cost per verified outcome** from summed costs across a cohort divided by independently verified authorized successes. Do not conceal correlated failures behind a simplistic assumed success probability.

### Falsifiable predictions

- **Absorption hypothesis:** As native agent capability improves, custom orchestration's incremental benefit decreases on routine, bounded work.
- **Specialization hypothesis:** For high-volume workflows with stable, domain-specific requirements, dedicated tools and procedures continue to outperform unconfigured general-purpose operation on cost per verified result.
- **Governance hypothesis:** Independent authorization, auditing, and safety limits remain necessary irrespective of model IQ; this does **not** prove the need for a giant factory.
- **Expansion hypothesis:** Better agents increase the total volume of concurrent changes, making cross-system coordination valuable even as single-task reasoning costs fall.

## Critical objections for the Astra High panel to adjudicate

- The scoring model may create **false precision** and weight volume too heavily relative to safety or domain dependence.
- Governance and specialization may be correlated; the matrix can misclassify a one-off catastrophic action or a repetitive low-risk workflow.
- “Factory versus general agent” may be a **false binary** because managed agents, enterprise platforms and programmable minimal harnesses blur the boundary.
- A vendor's built-in orchestrator is itself a factory; what changes is **who maintains it**, not whether coordination exists.
- More powerful models may increase the throughput of harmful actions; guardrails need to be *outside* the model rather than just instructions in its prompt.
- Some problems are simply not suitable for unattended automation regardless of apparent cost advantages.
- Local optimization of inference tokens can increase failed deliveries, human recovery and future maintenance. Optimize verified outcome economics.
- Claiming that a superintelligent agent could substitute for a factory is speculative; future capability deserves scenarios, not a numerical forecast dressed as fact.

## Research and editorial standards

This is a **seed draft**, intended for Astra High to rewrite into a complete, self-contained, intellectually rigorous idea-bank document **after adjudicating multiple independent Astra advisor perspectives**. The final article should include a legible matrix, explicit decision procedure, examples, sensitivity analysis, tradeoffs, uncertainties, and a falsifiable research plan. It must distinguish empirical evidence, theoretical reasoning, practical heuristics and speculative forecasting.

Relevant starting references and Gaia context:
- [Companion question-led essay (separate draft PR #332)](https://github.com/gaia-research/gaia-research/pull/332)
- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/)
- [Anthropic: Scaling Managed Agents](https://www.anthropic.com/research/managed-agents)
- [OpenAI: Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/)
- [Uber: Running a Software Factory Efficiently at Uber Scale](https://www.uber.com/ph/en/blog/efficient-software-factory/)

Source references are research leads; dated and quantitative claims require independent verification prior to publication. The first companion essay is context, **not a panel editing target**.

**Delivery boundary:** docs-only PR, no product code, interactive web deployment, model automation, governance policy ratification, production action or merge. Founder reviews and merges only after satisfactory review.
