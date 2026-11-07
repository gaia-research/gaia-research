# Router Economics: Human Intuition vs Automated Agent Routing

- **Status:** Unranked / formal research idea; **not yet a commissioned study**
- **Tracking:** [#323](https://github.com/gaia-research/gaia-research/issues/323)
- **Related, distinct:** [#300](https://github.com/gaia-research/gaia-research/issues/300) (role-intelligence, source-only publication restrictions), [#306](https://github.com/gaia-research/gaia-research/issues/306) (economic scheduler architecture), [#278](https://github.com/gaia-research/gaia-research/issues/278) (prior JEV evaluation)
- **Motivation:** Generic JEV task-classification may save against expensive defaults, but is not proven superior to a knowledgeable human, informed orchestrator, fixed rules, retrieval-based policy or stage-aware routing.

## Research holes to validate, not presumed discoveries

1. **Human judgment as a white-box baseline:** Human picks the worker/model/effort and logs rationale *before* outcome; compare against cold-start classifiers and account for human labor separately.
2. **Added value of a dedicated router:** Compare an orchestrator using its full workflow context versus external task-only classification. Measure incremental decision tokens/latency.
3. **True workflow economics:** API dollars versus subscription/quota consumption, cache invalidation, tool calls, retries, delegation, independent review and cost per *verified completion*.
4. **Capability floors and safety:** Model/effort/tool/permission eligibility; avoid optimizing into failed or unauthorized executions.
5. **Task-only vs stage-aware:** Decide upfront versus change model at investigation, implementation, and verification stages; count switch costs.
6. **Generalizability & time drift:** Different repositories, languages, task sizes, periods, model availability, changing pricing and router versions. Report calibration and uncertainty, not a single universal champion.
7. **Causal identification:** Balanced matched tasks with identical acceptance checks; blinded, preregistered human and router choices; avoid post-hoc cherry-picking.
8. **Router quality vs worker quality:** Control model roster and benchmark for availability and distinct algorithmic decision quality.

## Candidate experimental arms

Human intuition; no-router fixed economical and fixed strong baselines; Pi orchestrator-only; explicit deterministic capability matrix; TypeSafe JEV; semantic embedding router; learned performance router; OpenRouter Auto/Auto Code; NVIDIA NeMo Switchyard stage/escalation policy. Eligibility and context fairness must be reported when not comparable. No experiments yet authorized.

## Research ledger: starting points (verify exact versions, dates and claims before citations)

### Timely managed routing
- **OpenRouter Auto + Auto Code, announced November 6, 2026:** https://openrouter.ai/blog/announcements/auto-and-auto-code-routers/ . Capture dated announcement and technical details, model/effort support, eligibility filtering, real-time price/cache signals, reproducibility limits and vendor-reported vs independent benchmarks. This announcement is a **fresh research lead**, not peer-reviewed validation.
- OpenRouter routing benchmark: https://openrouter.ai/benchmarks/routers . Snapshot date, test set and evaluation methodology before quoting any percentages.
- OpenRouter Pareto Code: https://openrouter.ai/openrouter/pareto-code/api . Capability-threshold approach to compare.

### Implementations and systems
- TypeSafe JEV: https://help.typesafe.ai/articles/5187202169-how-much-does-jev-cost
- JEV coding router: https://github.com/0xNatoshi/jev-codex-router (historical replay, not proof of live completion savings).
- Cache-aware JEV routing: https://github.com/moelahmady/jev-model-router
- JEV subagent routing: https://github.com/guilhem/codex-subagent-router
- NVIDIA NeMo Switchyard: https://github.com/NVIDIA-NeMo/Switchyard (stage, escalation and fixed policies; assess maturity).
- Aurelio Semantic Router: https://github.com/aurelio-labs/semantic-router
- RouteLLM: https://github.com/lm-sys/RouteLLM
- LiteLLM Router: https://docs.litellm.ai/docs/router/learn/strategies
- Not Diamond: https://docs.notdiamond.ai/docs/what-is-model-routing

### Academic methods and evidence
- FrugalGPT: https://arxiv.org/abs/2305.05176
- Hybrid LLM: https://proceedings.iclr.cc/paper_files/paper/2024/hash/b47d93c99fa22ac0b377578af0a1f63a-Abstract-Conference.html
- RouteLLM: https://proceedings.iclr.cc/paper_files/paper/2025/hash/5503a7c69d48a2f86fc00b3dc09de686-Abstract-Conference.html
- RouterBench: https://arxiv.org/abs/2403.12031
- Systematic survey (2026): https://aclanthology.org/2026.findings-emnlp.2072/

### Early benchmark and negative-result leads requiring independent audit
- https://github.com/suenot/codex-jev-router-benchmarks
- https://github.com/TokenTrim/jev-routing-experiment
- https://www.datallmlab.com/blog/llm-router-benchmark.html
These are **leads**, not endorsed quantitative claims. Review original raw data, sample size, confounding, model/version provenance and billing evidence before quoting.

## Proposed analysis

Primary estimand: **total cost per independently verified completion**, with success-rate quality floors, latency, human-time sensitivity, per-task variance, failure and retry costs, quota use, cache invalidation, and optional carbon/compute estimates. Compare paired outcomes with uncertainty intervals; publish all failed trials and missing metrics. Distinguish exploratory matches from preregistered formal trials.

## Boundaries

No new tests, paid inference, production routing, model-policy change, publication or claims of benchmark results are authorized by this brief. Keep founder's “no universal best router” view as a **hypothesis about workload dependence**, not an assumed finding. Work toward a paper only after separately approved protocol, budget, sampling, and independent review.
