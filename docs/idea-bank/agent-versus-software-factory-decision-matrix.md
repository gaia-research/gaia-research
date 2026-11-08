# When Does a General Agent Need a Software Factory?

- **Status:** Idea Bank / Unranked / Unratified research proposal; advisory-reviewed and lead-adjudicated, awaiting founder review. Founder retains final approval.
- **Recorded:** November 9, 2026 (Asia/Manila)
- **Research question:** When does a general-purpose AI agent suffice, and when is a specialized software factory justified?
- **Confidence:** Source-informed conceptual framework, **not benchmark-calibrated**. No comparative experiment was performed for this document.
- **Scope:** Documentation only. Not an approved architecture, commissioned benchmark, published article, operational mandate, or policy ratification.
- **Related but independent:** [PR #332](https://github.com/gaia-research/gaia-research/pull/332) contains the separate founder essay about temporary agent scaffolding. This document stands alone and does not revise that essay.

## 1. The question is about obligations, not agent count

A one-off production hotfix can need strict approval without needing a software factory. A thousand routine updates can justify specialized automation without needing a team of agents. **Importance, repetition, intelligence, and authority are different decision inputs.**

The useful question is not whether a model could produce the code. It is whether the whole operating arrangement can deliver the required outcome, within its authority, at an acceptable cost and level of assurance—and continue doing so through failures and upgrades.

Our proposed answer is:

> Choose the simplest arrangement that demonstrably meets the requirements. Add persistent workflow specialization when it satisfies an otherwise unmet requirement or earns its lifecycle cost. Enforce authority and acceptance independently of the acting agent wherever the task requires those boundaries.

“Simplest” means the fewest operational obligations needed to meet the contract, not the fewest lines of code or lowest token count. Existing CI, a managed execution service, and a human reviewer can make a general agent’s environment substantial without making its workflow specialized. Conversely, **one sufficiently capable agent inside a maintained, domain-specific governed workflow can be a software factory**.

### How to read the claims

- **Evidence:** attributed observations or documented mechanisms in the source ledger below. Vendor and practitioner accounts are not independent comparative trials.
- **Engineering judgment:** recommendations derived from failure modes and operational constraints, not measured universal laws.
- **Heuristic:** a provisional starting rule that local evidence can overturn.
- **Speculation:** conditional future scenarios, not capability forecasts or promised release dates.

The framework and case classifications are engineering judgments and heuristics unless explicitly attributed. Intelligence alone does not confer organizational authority; that is a distinction about permission, not an empirical prediction about model accuracy.

## 2. Four operating arrangements—and three separate choices

A **general-purpose agent** is a model-driven system that can plan, use tools, and adapt its actions across varied tasks. It is not a bare language model: ordinary repository documentation, tests, CI, and native runtime features are part of its usable environment.

A **specialized software factory** is a maintained operating process for a named family of software work, with reusable workflow-specific rules, integrations, progression, or verification beyond the general execution environment. It may be configured on a managed platform rather than built as bespoke infrastructure. A saved prompt or isolated utility does not, by itself, establish a factory.

| Arrangement | What distinguishes it | What it does **not** imply |
| --- | --- | --- |
| **General-purpose agent** | Handles varied, bounded work with ordinary tools, native services, and proportionate existing safeguards. Little persistent workflow-specific machinery is justified. | Unrestricted credentials, self-certified success, or absence of human acceptance. |
| **General agent with independent governance** | General reasoning remains flexible, while required permissions, acceptance, approval, and evidence controls are enforced outside the executor’s unilateral control. | A bespoke orchestrator, another model, or a human click for every preauthorized action. |
| **Lean specialized software factory** | A deliberately small, reusable process for a workflow family. Domain tooling, repeatable verification, or structured progression supplies value; baseline safeguards suffice for its permitted effects. | “Lean” means no unnecessary machinery—not no governance. Deterministic steps may perform most work. |
| **Governed specialized software factory** | Maintained workflow specialization plus elevated independent assurance, authority separation, recovery, and accountability requirements. | Automatic permission to merge, deploy, publish, or operate unattended; nor a large multi-agent hierarchy. |

Three choices must remain separate:

1. **Workflow specialization:** how much persistent, task-family-specific engineering is needed?
2. **Assurance and authority:** what evidence, independent controls, and accountable decisions are required?
3. **Implementation ownership and topology:** who operates the machinery—existing internal services, a vendor, or a new custom system—and does execution use one agent, several, deterministic automation, or a mixture?

The boundary between a configured general agent and a small factory is deliberately descriptive. If changing the label changes the recommendation while capabilities and costs stay identical, the framework is being misused.

## 3. Decision matrix: orient first, do not calculate a verdict

Every cell presupposes valid authorization and proportionate verification. The rows describe **additional independent assurance needs**, not permission versus no permission. The columns describe the case for **maintained workflow specialization**, not how impressive the task sounds.

| Required assurance | Little demonstrated need for maintained workflow specialization | Material need for maintained workflow specialization |
| --- | --- | --- |
| **Baseline safeguards are sufficient for the allowed effects** | **General-purpose agent.** Start with existing tools and acceptance checks for bounded, varied work. | **Lean specialized software factory.** Reusable domain tooling or procedures meet a requirement or improve lifecycle economics. Consider deterministic automation first. |
| **Elevated independent assurance or authority separation is required** | **General agent with independent governance.** Keep reasoning general; protect credentials, approval, verification, and consequential actions. | **Governed specialized software factory.** Combine domain-specific workflow machinery with the required independent controls and accountable operation. |

These are candidate arrangements, not a maturity ladder. Human-led delivery, deterministic automation, proposal-only assistance, and **no action** remain alternatives outside the four agent-centered cells.

### Inputs that can change the answer

| Input | Evidence or question to examine | Decision implication |
| --- | --- | --- |
| **Repetition and workflow stability** | Useful authorized demand, task mix, exception rate, and likely useful life—not the number of tasks a watcher could invent. | Stable reuse can amortize specialization. High volume also multiplies correlated mistakes. |
| **Domain and institutional knowledge** | Specialized APIs, business invariants, ownership, provenance, and maintained acceptance criteria. Are these stable and agreed? | Encode durable knowledge when useful; do not turn contested or stale practices into automatic rules. |
| **Coordination and duration** | Concurrent writers, cross-system dependencies, interruptions, delayed approvals, and ambiguous external effects. | Require the necessary execution contracts; do not assume they require custom infrastructure or multiple agents. |
| **Consequence, exposure, and reversibility** | Data access, cumulative blast radius, external effects, and what cannot actually be undone. | Determine required controls. A rare catastrophic action is not averaged down by low repetition. |
| **Assurance and accountability** | Who defines acceptance, who can change the checks, who accepts residual risk, and what evidence must survive? | May require independent governance without workflow specialization. |
| **Native model/platform adequacy** | Capability and service terms verified for the exact workflow, permissions, failure cases, and version. | Remove a custom component only when its required behavior is covered—not when a feature name matches. |
| **Cost, reliability, and operational complexity** | Fully loaded cost, completion and defect rates, review queues, recovery work, maintenance ownership, and exit costs. | Compare feasible options over a useful horizon; cheaper inference alone is insufficient. |

**Why there is no score:** the initial draft added ordinal ratings into `S = R + D + max(0, C − N)` and `G = I + A`, with illustrative thresholds. These are removed. Their weights and cutoffs had no calibration; native capabilities are not interchangeable units that can be subtracted from complexity; mandatory constraints cannot be traded against favorable ratings. Qualitative intake ratings may help discussion, but are not an architecture selector.

## 4. A practical decision procedure

### Step 1 — Define a useful outcome and its owner

Write down the eligible request family, required workload coverage, acceptance evidence, latency needs, and permitted effects. Decide the outcome unit before comparison: one accepted migration is not made into many successes by splitting it into PRs. Specify whether a justified “no change needed” or safe abstention is a valid outcome.

Identify who owns acceptance and authorization. For discretionary work, ask whether the outcome is worth pursuing at all. A factory manufacturing low-value activity is not economical because each task is cheap.

### Step 2 — Establish non-negotiable requirements

Determine the applicable authority, data, correctness, safety, recovery, and audit requirements. Unknown critical requirements remain unknown; do not assign them a low score.

Exclude candidates unable to meet these requirements to the agreed evidence standard. This can eliminate every unattended option. Human-led work is not automatically safe either: it still needs a credible acceptance and authority process. Narrow, defer, or decline work when no feasible route exists.

### Step 3 — Compare credible baselines

Include an existing deterministic tool or conventional workflow where applicable. Then evaluate a competently configured general agent using available native services and existing organizational controls. Do not handicap that baseline to justify a factory.

Conversely, do not give the general-agent baseline expensive custom domain tooling for free. Record shared infrastructure separately from each candidate’s incremental requirements.

### Step 4 — Identify the residual gap, component by component

For every proposed addition, state the unmet requirement or expected improvement. Examples include a domain validator, protected approval service, recovery record, or workflow-specific integration. Distinguish:

- **Model-compensating scaffolding:** workarounds for current reasoning, planning, or context limitations.
- **Reusable domain machinery:** business constraints, integrations, organizational knowledge, and acceptance procedures.
- **Execution and control infrastructure:** durable state, permissions, interruption, reconciliation, and evidence handling.

All three categories can become native or managed. Native availability changes implementation ownership; it does not prove adequacy for the local contract.

### Step 5 — Select the smallest feasible increment

Use the matrix to describe the candidate, then compare lifecycle economics and service requirements. A managed workflow plus one general model and a protected domain verifier may be the right hybrid. A one-off migration may justify specialized tooling because ordinary methods cannot establish correctness, even without future repetition.

**Borderline heuristic:** when costs or demand are uncertain and no requirement forces a larger design, prefer a reversible, bounded pilot or existing process over permanent bespoke machinery. Strategic learning or sovereignty can justify another choice, but name that objective rather than disguising it as proven savings.

Choose multiple agents only for an identifiable capability, latency, capacity, or isolation benefit. Separable tasks can benefit from parallelism; tightly coupled changes can lose through context duplication, conflicting edits, and integration work. Review capacity can remain the bottleneck regardless of generation speed. Anthropic’s agent-design guidance describes such patterns, but does not calibrate their software-delivery economics [E5].

### Step 6 — Decide authority separately, at the action boundary

Architecture selection never grants execution permission. Before unattended or consequential action, establish:

- **Valid scope:** an authorized principal, allowed actions and targets, resource limits, and validity conditions. Readable tickets, retrieved text, and repository instructions are not automatically approval.
- **Protected boundaries:** the executor cannot enlarge its own permissions, approve its own exception, or silently weaken decisive acceptance checks. Treat untrusted repository and tool content as possible prompt-injection inputs.
- **Usable acceptance:** evidence adequate to the task, protected from unilateral redefinition. Judgment-heavy work may require accountable human evaluation rather than a fictional objective oracle.
- **Operational control:** interruption and revocation, external-state reconciliation, and a responsible escalation owner. Recheck relevant authority and target state before consequential actions; changed requests or stale approvals may invalidate a run.
- **Explicit release authority:** human approval where required by the applicable mandate; bounded standing authorization may cover routine actions where legitimately granted. Approval must be informed and review capacity realistic, not ceremonial.

Independence has several meanings: **authority independence**, **evaluation independence**, and **operational separation** when the executor fails. A second model does not automatically provide any of them. Separation within a provider may address agent-level compromise but not provider compromise; the threat model determines the boundary. Agent-authored tests can be useful proposals without automatically becoming protected acceptance evidence.

### Step 7 — Record a reassessment trigger

Name an owner and the evidence that would justify keeping, simplifying, expanding, or retiring the arrangement. Revisit after material model/platform changes, workflow drift, incidents, altered demand, or maintenance burden. A working incumbent need not be replaced merely because a simpler greenfield design now exists.

**Decision record:** outcome and owner → hard requirements → feasible alternatives → residual capability gaps → cost/quality evidence and uncertainty → selected arrangement and action authority → reconsideration trigger. This record documents a decision; it does not create a mandate.

## 5. Native capability is a contract, not a checkbox

Long-running autonomy is partly a distributed-systems problem. A model cannot recover a lost acknowledgement by reasoning alone about whether a remote write committed. AWS’s idempotency account explains this ambiguity and the value of explicit request identity and side-effect semantics [E6].

Whether supplied by a platform or a custom system, assess:

| Advertised capability | Required question |
| --- | --- |
| Memory or persistent sessions | What survives a crash? Is authoritative execution state distinguishable from a model’s summary? |
| Retries or durable execution | What happens when the side effect succeeds but its response is lost? Which operations are safe to retry, and which need reconciliation? |
| Scheduling, leases, or cancellation | Can a stale or canceled worker still write? How are duplicate events and changed target state handled? A lease alone is not proof of write exclusion. |
| Approval and sandboxing | Can the executor bypass the boundary, access privileged credentials, or alter its own checks? What happens after authorization is withdrawn? |
| Logs and recovery | Are records complete, integrity-protected, access-controlled, and retained appropriately? Can the operator establish what happened externally? |

Logs do not prove correctness; a receipt does not by itself prove an external effect occurred. Rollback cannot undo disclosure, and a compensating action need not restore the original state. Evidence retention must also respect privacy and deletion obligations.

Anthropic’s Managed Agents account separates session history, harness execution, and sandbox resources, and describes security benefits of isolating credentials from generated code [E2]. This supports the importance of interfaces and separation, **not** the claim that a vendor platform automatically satisfies every organization’s controls.

## 6. Worked cases: recommendations depend on the missing capability

| Scenario and assumptions | Starting candidate | What would change the answer? | Separate authority boundary |
| --- | --- | --- | --- |
| **One-off feature development:** reversible branch changes, ordinary repository tests, no production access. | General-purpose agent with normal review and CI. | Hard domain invariants or recurring workflow-specific work may justify specialized tools. Poor acceptance criteria may require human-led exploration, not more agents. | Permission to draft code is not permission to merge or release it. |
| **Recurring PR maintenance:** stable dependency or compatibility updates, bounded edits, known checks. | Deterministic tooling first; lean specialized factory if agent reasoning plus reusable workflow machinery adds value. | Native automation may dominate custom orchestration. Aggregate exposure, supply-chain changes, or release coupling can require elevated governance. | Authorized repositories, allowed update classes, aggregate action limits, and merge rules remain explicit. |
| **Production hotfix:** rare urgent incident, substantial consequences, credible service-specific verification. | General agent with independent governance inside the existing incident process. | A specialized diagnostic/validation tool may be necessary even once. Frequent structured incidents may justify a maintained factory. No credible verification means no automatic release. | Incident authority, artifact-specific approval, controlled rollout, and recovery or escalation—not urgency alone. |
| **Gaia Steward / Gaia Autonomous Operations:** preventive maintenance and cross-repository contract work. | Governed specialized factory **candidate**, evaluated against reuse of existing Steward primitives and a thin adapter. | Quiet deterministic observation may suffice for some duties. Domain boundaries, onboarding, and recovery may justify specialization; redundant inference orchestration should be tested for removal. | [Issue #311][E8] is an open umbrella/RFC, not proof of end-to-end success or authority to widen scope, run models, merge, publish, or enroll repositories. |
| **Regulated enterprise workflow:** recurring delivery with traceability, segregation of duties, and domain-specific evidence obligations. | Governed specialized factory where those requirements need maintained workflow specialization; managed implementation is a serious option. | A standard enterprise platform plus governed general agent may meet the requirements with less custom maintenance. “Regulated” does not establish a universal legal checklist. | Accountable owners identify the actual applicable obligations and authorized release process. A platform badge or extra reviewer agent is insufficient. |
| **Hypothetical future highly capable agent:** strong planning and self-checking, native scheduling, durable sessions, and useful domain tools. | General or independently governed general agent where residual specialization has disappeared. | Persistent domain contracts or throughput coordination can still justify a specialized workflow operated by that same single agent. | Better intelligence does not create authority; native controls must still demonstrate the required behavior. |

**Adversarial counterexample:** a sophisticated factory that can edit its verifier and reuse unrestricted credentials may be less trustworthy than a general agent confined to proposing a patch. **Waste counterexample:** stable format-only transformations already handled by a validated deterministic tool need neither an agent nor an agent factory.

## 7. Economics: pay for verified outcomes, not impressive activity

### A cohort measure, not a success-story average

For a declared workload and observation window:

```text
Observed cost per verified authorized outcome
  = all attributable cohort costs
    / distinct independently verified authorized outcomes
```

Include failed, abandoned, rejected, and retried work in costs. Report zero-success cohorts explicitly; the ratio is undefined, not zero. Include human fallback in delivery costs where it completes the required workload, and report autonomous versus assisted completion separately.

A valid comparison also reports workload coverage, completion rate, latency, defects found after acceptance, abstentions, and unmet demand. Otherwise, refusing difficult requests or counting tiny PRs can manufacture a favorable ratio. Unauthorized intermediate actions are constraint violations, not erased by a correct final artifact. Severe risks must not disappear inside an average cost or weighted defect score.

### What belongs in the numerator

- Inference and orchestration: input/output usage, context reprocessing, repeated tool schemas, routing, handoffs, duplicate investigations, speculative work, and retries.
- Tool execution, test environments, infrastructure, platform charges, and storage.
- Human specification, review, approval, intervention, repair, and incident recovery.
- Attributable setup, integration, maintained domain knowledge, upgrade testing, and eventual migration or retirement.

Orchestration is not pure waste: extra calls may reduce failures or latency. The question is their **incremental outcome value**. Uber describes context/tool overhead and cost-management mechanisms in its environment [E4]; that does not supply a universal orchestration-tax percentage.

Keep three views separate:

| View | Meaning and limit |
| --- | --- |
| **Actual spending** | Invoices and actual charges, with an explicit allocation method for subscriptions or shared services. A run under a flat subscription may have no incremental invoice charge without being resource-free. |
| **API-equivalent estimate** | Usage priced at stated public API rates, with model, date, cache, and missing-telemetry assumptions. A comparison proxy, **not what a subscription user paid**. Any future Gaia estimate must use canonical `gaia-research/skill-cost` provenance. |
| **Economic/resource cost** | Human time, opportunity cost, scarce quota, and operational capacity, reported with valuation assumptions. Saved minutes are not automatically cash savings. |

Do not add actual spending and an API-equivalent estimate for the same inference as two expenses. Unknown usage is not zero. Present realized costs separately from forecast amortization, and allocate shared enabling infrastructure transparently.

### Repetition only helps within a useful lifetime

A limited break-even illustration can aid planning without pretending to calibrate the matrix:

```text
N × Δc > ΔF + H × ΔM + ΔX
```

Here `N` is the number of comparable verified outcomes over horizon `H`; `Δc` is the alternative’s variable cost per outcome minus the factory’s, including failed attempts and fallback; `ΔF` is incremental setup/transition cost; `ΔM` is additional upkeep per period; and `ΔX` is net exit cost over the horizon. Both alternatives must satisfy the same required coverage, quality, latency, and authority constraints.

This simplified illustration assumes constant unit savings and upkeep, consistent cost units, and ignores discounting. It is **not a measured threshold or universal investment rule**. If the factory has positive additional fixed costs and no positive unit saving, more repetition cannot rescue its cost case. Specialization can nevertheless be necessary to satisfy a requirement that the alternative cannot meet—in which case this break-even comparison is inapplicable.

For real investment decisions, vary demand, workflow stability, maintenance, native progress, pricing, reviewer capacity, and migration costs together. Use plausible useful life, not indefinite amortization over hoped-for volume. Both the factory and its baseline may improve; freezing today’s general agent while forecasting an improving factory biases the comparison.

### Building, keeping, and retiring are different decisions

- **Build:** include new engineering, time to usable operation, transition, and foregone alternatives. A bounded pilot can buy information before commitment.
- **Keep:** compare avoidable future costs. Past engineering expenditure is sunk; an existing factory can be worth retaining even if building it today would not pay.
- **Retire:** include migration, revalidation, parallel operation, evidence retention, disruption, and decommissioning. Remove obsolete components selectively; domain tests or protected contracts may outlive orchestration workarounds.

Specialization becomes economically unjustified when its remaining benefit cannot cover its avoidable lifecycle cost relative to a feasible alternative. Falling demand, frequent workflow change, absorbed native capabilities, persistent reviewer queues, and costly maintenance can all produce that outcome. None establishes it without local evidence.

## 8. Futures: what could become native, and what persists?

**Evidence for selective obsolescence:** Anthropic reports that context-reset machinery used for Sonnet 4.5 became unnecessary when the relevant behavior was absent in Opus 4.5 [E2]. This is a concrete example of an expiring workaround, not proof that every harness will disappear. OpenAI’s Symphony illustrates reusable orchestration around a work queue [E3]; standardization shifts maintenance boundaries without eliminating coordination.

| Conditional future | What may become ordinary platform functionality | What may remain locally specified | What would challenge it? |
| --- | --- | --- | --- |
| **Absorption** | Scheduling, session persistence, context handling, sandbox provisioning, generic retries, routing, and common integrations. | Required semantics, local acceptance, credentials, data rules, and authority. | Native features fail local contracts, cost more, or impose unacceptable dependence. |
| **Persistent specialization** | General execution infrastructure improves while local configuration supplies domain workflows. | Business invariants, unusual integrations, domain verification, institutional ownership, and exception handling. | General platforms reliably infer or configure these with lower lifecycle cost and equivalent controls. |
| **Expansion** | Stronger agents complete more work with less per-task guidance. | Coordination across concurrent changes, review capacity, scarce resources, and shared failure domains. | Useful authorized demand does not grow, concurrency stays low, or native services absorb coordination adequately. |

These scenarios can coexist. Less orchestration per task and more total organizational coordination are not contradictory if demand or task difficulty changes. Better models may substitute for agent teams while complementing specialized tools.

What persists is not necessarily **custom code**. Organizations must still determine desired outcomes, legitimate authority, evidence standards, and accepted risk; managed services may implement much of their enforcement. Predictions that these functions must remain in a bespoke Gaia runtime go beyond the evidence.

**When would this matrix become obsolete?** If a common platform supplies adequate workflow adaptation and governance for the relevant workload range, all practical choices may collapse into configuration, procurement, and policy ownership rather than distinct architectural cells. If specialization and assurance cease to explain observed tradeoffs, or another factor dominates, replace the axes. The distinction between capability and permission would survive even if this taxonomy did not.

## 9. Counterarguments and unresolved tensions

1. **“This is ordinary build-versus-buy analysis with an AI label.”** Partly true. Lifecycle economics and distributed-systems obligations are established concerns. The useful contribution is separating model-compensating scaffolding from durable workflow knowledge and authority, then testing their changing value—not claiming a new universal law.
2. **“A native-first default creates vendor lock-in.”** It can. Data residency, sovereignty, predictable service, portability, and mature internal infrastructure can justify custom operation. Prefer the smallest *feasible* arrangement, not a vendor by definition.
3. **“A factory institutionalizes expertise even before it saves money.”** Knowledge preservation, learning, consistency, and strategic capacity can be legitimate objectives. State and evaluate them separately; do not present them as demonstrated operating savings. Encoding bad or contested practices also institutionalizes mistakes.
4. **“More reviewers provide independence.”** They may improve detection but can share assumptions, sources, tests, and incentives. Human review can also become overloaded or ceremonial. Independence is a boundary and an evaluation property, not a headcount.
5. **“A general agent will eventually configure its own factory.”** Plausible. Generation of workflow machinery does not eliminate its validation, maintenance, or authority requirements. The distinction may shift from authoring infrastructure to accepting and operating it.
6. **“Cost per outcome undervalues catastrophic risk or valuable hard tasks.”** Correct if used alone. Feasibility constraints, fixed demand mix, coverage, delayed-quality measures, and separate severe-event reporting are necessary. Where value varies substantially, stratify outcomes or use an explicitly justified value model rather than pooling counts.

The unresolved empirical questions are the useful lifetime of specialization, adequacy of native controls, verification error, correlated failure, human-review capacity, and whether capability gains substitute for or complement orchestration. The panel does not settle them.

## 10. Testable hypotheses and a validation plan

**This is a proposed study, not authorization to run it.** Define and approve the protocol, resources, privacy handling, and sandbox boundaries separately.

### Two comparisons, not one confounded tournament

1. **Architecture decision comparison:** evaluate the best feasible configurations for a representative workload—deterministic/human-led baselines where relevant, general agent, independently governed general agent, and specialized workflows. All arms must satisfy the same required authority and acceptance standards. Do not test an intentionally unsafe production baseline.
2. **Mechanism comparison:** hold model version/effort and relevant context constant while removing or replacing one component at a time: domain tools, model handoffs, context workaround, or coordination mechanism. Keep mandatory controls intact. Study control effectiveness separately with synthetic adversarial tests in an isolated environment.

Do not accidentally control away the treatment: workflow-specific tooling is precisely what some comparisons test. In realistic whole-system comparisons, allow sensible model selection and routing but charge their development and operational costs. State differences in tools, information, configurations, and tuning effort.

For topology-specific claims, distinguish per-call reasoning effort from aggregate inference resources. Include a compute-matched serial comparison where feasible, or explicitly limit causal attribution when resource allowances differ. Keep realistic whole-system cost and latency comparisons separate.

### Protocol and measurement

- Predeclare workload strata, outcome units, coverage requirements, acceptance rules, practical-effect margins, observation horizon, and stopping criteria. Use held-out tasks, matched or randomized assignment where possible, repeated trials, and blinded evaluation where feasible.
- Pin or record model, effort, harness/platform versions, source revisions, tool permissions, cache conditions, and pricing provenance. Report missing metadata and platform changes rather than implying perfect reproducibility.
- Include interruptions, duplicated events, stale workers, changed or revoked authorization, ambiguous writes, prompt injection, corrupted evidence, and shared-dependency failure in safe simulations. Measure control false positives as well as violations.
- Record all eligible requests, failed and abandoned attempts, justified abstentions, human fallback, queueing delay, delayed defects, recovery effort, and complete cost cohorts. Independently audit the verifier for false acceptance and false rejection; passing its checks is not ground truth by definition.
- Report uncertainty and clustering by repository, batch, dependency, and platform incident. Many PRs from one shared workflow are not independent observations. Small trials with no severe incident do not establish negligible tail risk.
- Stop or suspend a candidate on predefined unacceptable violations; do not average them away. Keep private data and secrets out of study artifacts and public reports.

### Hypotheses that can lose

| Scoped hypothesis | Comparison and possible disconfirmation |
| --- | --- |
| **Native absorption reduces specified scaffolding’s value.** | On fixed workloads across declared upgrades, ablate the workaround. Stable or increasing lifecycle benefit challenges absorption for that component. |
| **Stable workflow specialization pays back over its forecast useful life.** | Compare fully loaded cost at realized eligible demand and equivalent service requirements. Maintenance or unmet demand erasing savings rejects that investment case, even if tokens fall. |
| **Extra agents help mainly when work is separable and integration/review capacity is adequate.** | Compare single- and multi-agent configurations across predefined coupling strata. Gains on tightly sequential work or losses on separable work challenge the proposed mechanism. |
| **Protected control boundaries outperform self-checking on defined attacks.** | In isolated tests, measure successful boundary violations, false blocking, and latency. No meaningful protection gain or unacceptable operational burden challenges the particular control design—not the legitimacy of authorization requirements. |
| **Explicit reconciliation improves ambiguous-write recovery.** | Inject lost acknowledgements and interrupted actions; compare duplicate effects and unresolved states against eligible retry-only behavior. No improvement challenges the mechanism. |
| **On the declared workload, at fixed review capacity and over a predeclared offered-work range, increased generation throughput will increase queue delay without a practically meaningful increase in accepted-outcome throughput.** | Predeclare the range and practical-effect margin; measure accepted outcomes and queue delay, not generated PRs. Delivery scaling without the predicted bottleneck disconfirms this scoped claim. |

For Steward, a particularly useful future comparison is deterministic quiet observation versus model-driven monitoring under the same detection requirements, including missed events and operational upkeep. Issue #311 supplies the proposed direction, not a measured result. Re-run relevant comparisons after upgrades and publish negative and inconclusive outcomes as well as favorable ones.

## 11. Source ledger: what the evidence can carry

Sources checked for this revision on November 9, 2026 (Asia/Manila). These are selected primary engineering accounts, guidance, and Gaia context—not an exhaustive literature review. They do not establish universal defect rates, savings, optimal agent counts, or quadrant cutoffs.

| Reference | Supported use in this document | Important limit |
| --- | --- | --- |
| **[E1 — OpenAI, Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)** | Repository preparation, feedback, verification, and environmental infrastructure matter in the reported agent-driven development setting. | Internal engineering account, not a controlled general-agent-versus-factory comparison. |
| **[E2 — Anthropic, Scaling Managed Agents with stable interfaces](https://www.anthropic.com/research/managed-agents)** | Separates session/harness/sandbox; discusses credential isolation and an obsolete context-reset workaround. | Vendor architecture and experience; neither universal platform adequacy nor wholesale harness obsolescence follows. |
| **[E3 — OpenAI, An open-source spec for Codex orchestration: Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/)** | Reusable orchestration can turn an issue board into a control plane for ongoing agent work. | A queue is not authorization, and a specification is not comparative economic validation. |
| **[E4 — Uber, Running a Software Factory Efficiently at Uber Scale](https://www.uber.com/gb/en/blog/efficient-software-factory/)** | Enterprise experience with model selection, context/tool overhead, and operational cost management. | Organization-specific account; no savings figure is transferred to Gaia or asserted here. |
| **[E5 — Anthropic, Building effective agents](https://www.anthropic.com/research/building-effective-agents)** | Simpler starting points, structured workflows versus dynamic agents, and conditional parallelization/orchestrator patterns. | Practitioner design guidance, not a calibrated architecture selection rule. |
| **[E6 — AWS Builders’ Library, Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)** | Request identity, retry semantics, and ambiguity after lost responses to side-effecting calls. | Engineering guidance does not confer general exactly-once execution or reversibility. |
| **[E7 — NIST, AI Risk Management Framework 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)** | GOVERN 2/2.1 address accountability; MEASURE §5.3 discusses independent review and bias/conflicts of interest. | Voluntary guidance, not a legal mandate for every workflow or empirical proof that controls suffice. |
| **[E8 — Gaia Research #311, Gaia Autonomous Operations umbrella/RFC](https://github.com/gaia-research/gaia-research/issues/311)** | Proposed reuse of Steward primitives, quiet observation, domain boundaries, verification, and pending mandates. | Open proposal; neither end-to-end operating evidence nor expanded authorization. |

[E8]: https://github.com/gaia-research/gaia-research/issues/311

NIST’s accountability and review guidance [E7] informs the questions asked here; the specific decision procedure is this document’s engineering judgment. The practitioner accounts [E1–E5] establish plausible mechanisms and contextual experience, not the superiority of an architecture family.

## 12. Final synthesis and research directions

**Use a general agent when the required work fits its verified capabilities and existing controls, and maintained workflow specialization adds no sufficient benefit. Use a specialized factory when reusable domain machinery satisfies a real requirement or earns its lifecycle cost. Choose independent governance according to authority and assurance obligations—not the number of agents or the importance of the marketing label.**

The most promising research is component-level: distinguish scaffolding that compensates for current model weaknesses from domain knowledge and control mechanisms that retain value across upgrades. Compare deletion as seriously as addition. Measure review and recovery burdens, not just generation speed. Treat Gaia Steward as a candidate for this scrutiny, not an exception.

### Editorial adjudication and remaining dissent

Three independent Astra MAX advisors assessed economics, systems/futures, and governance/adversarial critique; an Astra HIGH lead adjudicated their first-pass analyses. They shared the draft and source brief, not each other’s conclusions. This is independent deliberation within one model family, **not independent empirical replication or proof from consensus**.

The lead accepted their common objections to uncalibrated scores, weak baselines, confounded experiments, and authority inferred from capability. The matrix survives as a map, while feasibility and lifecycle comparison perform the actual selection.

Important tensions remain explicit. A native general-agent starting point is a rebuttable greenfield heuristic, not a reason to discard a useful incumbent; migration and sunk-cost distinctions matter. Lightweight scoring might help intake, but no evidence justifies publishing a numeric architecture threshold here. Strategic learning, sovereignty, or a rare hard requirement may justify specialization without operating savings. The evidence does not yet determine whether future capability gains predominantly absorb custom orchestration or expand its useful scope.

**Next decision belongs to the founder:** review the research framing and decide whether any bounded validation study is worth commissioning. This document grants no implementation, unattended operation, publication, deployment, policy ratification, or merge authority.
