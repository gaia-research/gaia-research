# Idea Bank

Ranked by combined **viability** and **potential** (active, unbuilt ideas).

## Rank 1 — Founder Essay: If Everything Can Be Recreated, Who Gets Remembered?
- **Status:** In Publication / Active Draft
- **Viability:** Very High
- **Potential:** Exceptional
- **Why now:** AI-driven reverse engineering harnesses (`morluto/rea`) allow coding agents to inspect assembly and bytecodes to recreate complex features in minutes. This makes implementation reproducible, raising fundamental questions about software authorship, open-source lineage, and the role of Gaia Skill Tree and Yggdrasil in recognizing original thinkers alongside trusted improvers.
- **Doc:** [`blog-idea-if-everything-can-be-recreated.md`](./blog-idea-if-everything-can-be-recreated.md) · Tracking issue: [#297](https://github.com/gaia-research/gaia-research/issues/297)

## Rank 2 — Blog Idea: How Hermes Skills Autonomously Improve Themselves
- **Status:** In Ideation
- **Viability:** High
- **Potential:** Exceptional
- **Why now:** Autonomous skill self-evolution is widely touted but rarely explained at an architectural level. Unpacking Hermes Agent's `/learn` trajectory capture, 3-tier progressive disclosure, and isolated background Curator process (`curator.py`) delivers rare, high-signal technical content genuinely not easily available elsewhere.
- **Doc:** [`blog-idea-hermes-skills-autonomous-self-improvement.md`](./blog-idea-hermes-skills-autonomous-self-improvement.md)

## Rank 3 — Blast-Radius Metrics for Agent Harness Evaluation
- **Status:** In Ideation / Proposed Research
- **Viability:** High
- **Potential:** Very High
- **Why now:** Task success is not enough to evaluate agent harnesses. Two agents can reach the same correct answer while consuming radically different authority, infrastructure, money, and irreversible world changes. Evaluates the *shape of the run* (peak privilege, systems touched, irreversible actions, rollback burden).
- **Doc:** [`agent-harness-blast-radius-metrics.md`](./agent-harness-blast-radius-metrics.md) · Tracking issue: [#262](https://github.com/gaia-research/gaia-research/issues/262)

## Rank 4 — Agent Plugin Discoverability: Problem Statement → First Use
- **Status:** In Ideation / Proposed Research
- **Viability:** High
- **Potential:** Very High
- **Why now:** Skill Heaven already ships a portable Agent Plugin, so the next distribution question is measurable: can a fresh agent find it from an ordinary problem statement, choose it for the right reason, and reach first use without being told the brand name? The study separates marketplace metadata, machine retrieval, trust/selection, and activation rather than treating discoverability as generic SEO.
- **Doc:** [`agent-plugin-discoverability.md`](./agent-plugin-discoverability.md) · Tracking issue: [#280](https://github.com/gaia-research/gaia-research/issues/280)

## Rank 5 — Flight Digest Telemetry Adapter
- **Status:** In Ideation / Architecture Plan
- **Viability:** Very High
- **Potential:** Very High
- **Why now:** Works with existing agent stacks without replacing them; privacy-aware structural telemetry is cheap to collect and easy for Skill Tree to ingest later.
- **Doc:** [`flight-digest-telemetry-adapter.md`](./flight-digest-telemetry-adapter.md)

## Rank 6 — Blog Subscriber Email Pipeline & Mailing MCP Integration
- **Status:** Proposed Issue / RFC Plan
- **Viability:** Very High
- **Potential:** High
- **Why now:** Establishes an automated subscriber growth loop by pairing a sleek dark-themed Subscribe UI on the Next.js site with a Mailing MCP Server (Resend/Loops) connected directly to the `gaia-blog-post` skill for zero-friction post-publish broadcasts.
- **Doc:** [`../plans/issue-blog-subscriber-email-pipeline.md`](../plans/issue-blog-subscriber-email-pipeline.md)

## Rank 7 — Proof-of-Skill Badges
- **Status:** In Ideation
- **Viability:** Very High
- **Potential:** High
- **Why now:** Lightweight, public-facing, and immediately useful for adoption, sharing, and credibility loops across skill repositories.
- **Doc:** [`proof-of-skill-badges.md`](./proof-of-skill-badges.md)

## Rank 8 — Milim HUD Terminal Overlay
- **Status:** In Ideation / Prototype Plan
- **Viability:** High
- **Potential:** High
- **Why now:** Adds delight on top of existing logs and telemetry without demanding infrastructure migration.
- **Doc:** [`milim-hud-terminal-overlay.md`](./milim-hud-terminal-overlay.md)

## Rank 9 — Chaos-Buster Resilience Injector
- **Status:** In Ideation / Benchmark Plan
- **Viability:** High
- **Potential:** High
- **Why now:** Strong fit with verification, containment, and robustness research already present in the repo.
- **Doc:** [`chaos-buster-resilience-injector.md`](./chaos-buster-resilience-injector.md)

## Rank 10 — Claude Code Hooks as the Skill Heaven Runtime
- **Status:** In Ideation / Door Runtime Study
- **Viability:** High (Claude door only)
- **Potential:** High
- **Why now:** Explores whether the Claude Code hook lifecycle (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`) can carry rung state and gap-driven summoning inside a marketplace install without editing user global config.
- **Doc:** [`claude-hooks-skill-heaven-runtime.md`](./claude-hooks-skill-heaven-runtime.md)

## Rank 11 — Capability Lineage for Agent Harness Authorization
- **Status:** In Ideation / Security Framework
- **Viability:** Medium-High
- **Potential:** High
- **Why now:** A top-level goal should not transitively authorize every action an agent invents while pursuing it. Authority should narrow across `principal → planner → worker → skill → tool`, preventing unmonitored capability escalation.
- **Doc:** [`capability-lineage-agent-harness-authorization.md`](./capability-lineage-agent-harness-authorization.md) · Tracking issue: [#260](https://github.com/gaia-research/gaia-research/issues/260)

## Rank 12 — MCP Trust Should Be Capability-Scoped, Not Server-Scoped
- **Status:** In Ideation / Tool Governance RFC
- **Viability:** Medium-High
- **Potential:** High
- **Why now:** Trusting an entire MCP server is too coarse. Durable approval should authorize narrow capabilities under explicit provenance and parameter assumptions rather than granting ambient authority to whatever a server may induce an agent to do.
- **Doc:** [`mcp-capability-scoped-trust.md`](./mcp-capability-scoped-trust.md) · Tracking issue: [#261](https://github.com/gaia-research/gaia-research/issues/261)

## Rank 13 — End-to-End Principal Authenticity Across the Agent Security Chain
- **Status:** In Ideation / Security Chain Study
- **Viability:** Medium-High
- **Potential:** High
- **Why now:** Hardened tool sandboxes fail if an attacker can manipulate instructions upstream before reaching the planner. Evaluates principal identity, action bindings, capability envelopes, and freshness nonces across the entire input-to-mutation chain.
- **Doc:** [`end-to-end-principal-authenticity.md`](./end-to-end-principal-authenticity.md) · Tracking issue: [#263](https://github.com/gaia-research/gaia-research/issues/263)

## Rank 14 — Antigravity Cache Reuse & Pi Cache-Warmer Effectiveness
- **Status:** In Ideation / Proposed Research (Unverified)
- **Viability:** Medium (provider metadata is observable, but gateway or billing ground truth may not be)
- **Potential:** High
- **Why now:** Sanitized Pi probes show reported cache reads after early missing telemetry, while a Pi warmer pilot confirms only that a background replay ran—not that it hit. This model-by-model study separates Antigravity gateway behavior from Gemini API / Vertex documentation and tests whether warming is measurable and worthwhile.
- **Doc:** [`antigravity-cache-reuse-and-warmer-effectiveness.md`](./antigravity-cache-reuse-and-warmer-effectiveness.md) · Tracking issue: [#276](https://github.com/gaia-research/gaia-research/issues/276)

## Rank 15 — Raphael Prober MCP Server
- **Status:** In Ideation
- **Viability:** Medium-High
- **Potential:** Very High
- **Why now:** A sharp bridge between benchmarking, MCP tooling, and shareable capability reports.
- **Doc:** [`raphael-prober-mcp-server.md`](./raphael-prober-mcp-server.md)

## Rank 16 — Dynamic Agent Evolution Tracking
- **Status:** In Ideation
- **Viability:** Medium
- **Potential:** Very High
- **Why now:** Big strategic upside as a living capability graph, but needs careful trust, replay, and anti-gaming design.
- **Doc:** [`dynamic-agent-evolution-tracking.md`](./dynamic-agent-evolution-tracking.md)

## Rank 17 — Random Forest + SHAP/LIME Trust-Appraisal Explainability Model
- **Status:** RFC / research — unratified, decoupled v-next study
- **Viability:** Medium-High
- **Potential:** High
- **Why now:** The `gaia-skill-tree` registry's Trust Magnitude signals (`src/gaia_cli/trustMagnitude.py`) form a genuine feature vector; the curated registry's (skill → assigned star rank) pairs are an implicit labeled corpus. A Random Forest wrapped in SHAP/LIME could predict and explain a skill's star rank — surfacing mis-calibrated skills and explaining assignments to contributors — while TM stays the sole transparent promotion gate per `META.md`.
- **Doc:** [`rf-shap-trust-appraisal.md`](./rf-shap-trust-appraisal.md)

## Rank 18 — Per-Model × Per-Harness Token-Savings Matrix
- **Status:** In Ideation / Gated Methodology
- **Viability:** Medium (depends on an unratified frozen-skill-set snapshot mechanism, and on N4/N5 closing)
- **Potential:** High
- **Why now:** Directly seeded by the 2026-07-22 M2 live demo, where switching the probe model from haiku to Sonnet-low changed both probe reliability and the measured token numbers — proof that token savings must be locked per-model-per-level, not reported as one cross-model figure.
- **Doc:** [`per-model-harness-token-savings-matrix.md`](./per-model-harness-token-savings-matrix.md)

## Rank 19 — Gaia-Lite Headless Toolkit Extraction
- **Status:** In Ideation / PRD Alignment
- **Viability:** High
- **Potential:** Medium-High
- **Why now:** Already aligned with the consolidation PRD and unlocks cleaner packaging of future telemetry and verification tools.
- **Doc:** [`gaia-lite-headless-toolkit-extraction.md`](./gaia-lite-headless-toolkit-extraction.md)

## Rank 20 — Gaia Production Team & Native Asset Pipelines
- **Status:** In Ideation / Asset Workflow
- **Viability:** High
- **Potential:** Very High
- **Why now:** Dedicated end-to-end production home for Milim Player, 2.5D animation pipelines, and native image generation skills (`image-gen-2.5`), elevating brand asset craft.
- **Doc:** [`gaia-production-team.md`](./gaia-production-team.md)

## Rank 21 — Automated Change Management Team & Infrastructure
- **Status:** In Ideation / Tooling RFC
- **Viability:** High
- **Potential:** Very High
- **Why now:** Hermes Agent cron-scheduled engine for automated changelog hunting, epic merge signal ingestion from `gaia-skill-tree` & `gaia-research`, auto `docs/en` updates, and frontend UI/marketing triggers.
- **Doc:** [`change-management-team.md`](./change-management-team.md)

---

## Unranked Editorial Ideas (not yet prioritized)

### The Economics of Agentic Work: When Small Agents Beat Frontier Models
- **Status:** In Ideation / Thought Leadership Draft (Unranked)
- **Viability:** High
- **Potential:** Exceptional
- **Why now:** The cost floor of agentic software work depends on retries, verification, subscription quotas, and domain harnesses, not simply frontier model capability. Formulates where bounded cheap retries and speculative racing outperform costly orchestration ceremony, backed by the founder's verbatim observations, Ray Amjad's primary video analysis, and foundational systems precedents.
- **Doc:** [`economics-of-agentic-work-small-agents.md`](./economics-of-agentic-work-small-agents.md) · Tracking issue: [#304](https://github.com/gaia-research/gaia-research/issues/304)

### Beyond Orchestration: The Missing Economic Scheduler for AI Agents
- **Status:** In Ideation / Architectural RFC (Unranked)
- **Viability:** High
- **Potential:** Exceptional
- **Why now:** Existing runtimes (Auto Office, LangGraph, Temporal) and dynamic workflows already reduce conversational orchestration overhead. The next systems-level opportunity is an economic scheduler that optimizes expected cost, latency, and probability of verified success across heterogeneous models, shared memory, and canonical skill catalogs.
- **Doc:** [`economic-scheduler-ai-agents.md`](./economic-scheduler-ai-agents.md) · Tracking issue: [#306](https://github.com/gaia-research/gaia-research/issues/306) · Precedent: [#304](https://github.com/gaia-research/gaia-research/issues/304)

---

## Active Meta-Research (Unranked) — Agent Role Intelligence & Capability Floors

- **Status:** Bunny research package collected locally; publication and independent audit pending.
- **Viability:** High for a source-ledger and research/lab publication; cross-model conclusions remain unproven.
- **Potential:** Very High — tests where economical reviewers/builders are genuinely strong, where Luna Max cannot replace a steerable Sonnet orchestrator, and when cheap-first routing costs more after failures.
- **Doc:** [`empirical-agent-roles-and-capability-floors.md`](./empirical-agent-roles-and-capability-floors.md) · Tracking issue: [#300](https://github.com/gaia-research/gaia-research/issues/300)
- **Publication:** Full `/gaia-blog-post` plus independent `/research/*` or lab study, Baker Milim thumbnail; not yet published.

---

## Parked Ideas (not ranked)

The following ideas are preserved for possible future reconsideration, **not** active work or roadmap commitments.

### Scion-inspired source control for Gaia agent workspaces
- **Status:** Not now / Parked
- **Why parked:** No demonstrated Git bottleneck justifies replacing Gaia's GitHub-native PR, CI, and approval workflows. A central service adds migration, security, recovery, and ongoing infrastructure costs.
- **Doc:** [`scion-inspired-agent-source-control.md`](./scion-inspired-agent-source-control.md)
- **Tracking:** Idea only; no issue or implementation work.

---

## Archived Ideas & Shipped Posts

The following briefs have completed their lifecycles, shipped as published blog posts under [`/blog/*`](../../content/blog), or landed in production code. They are frozen and archived in [`archived/`](./archived/):

- **Skill Heaven / Skill Hell MVP** → Ratified in [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md) · [`archived/2026-07-24-skill-heaven-hell-mvp.md`](./archived/2026-07-24-skill-heaven-hell-mvp.md)
- **Skill Eval Harness & Continuous Lifecycle** → Shipped as [`/blog/skill-evals`](../../content/blog/skill-evals/post.md) · [`archived/2026-07-22-skill-eval-harness-and-lifecycle.md`](./archived/2026-07-22-skill-eval-harness-and-lifecycle.md)
- **Claude 5 System-Prompt Shrink Audit** → Shipped as [`/blog/claude-5-system-prompt-shrink`](../../content/blog/claude-5-system-prompt-shrink/post.md) · [`archived/2026-07-27-claude-5-system-prompt-shrink-audit.md`](./archived/2026-07-27-claude-5-system-prompt-shrink-audit.md)
- **agentskills.io Standard and Story** → Shipped as [`/blog/agentskills-io-standard`](../../content/blog/agentskills-io-standard/post.md) · [`archived/2026-07-30-blog-idea-agentskills-io-standard-and-story.md`](./archived/2026-07-30-blog-idea-agentskills-io-standard-and-story.md)
- **Deterministic Evidence Pipelines** → Merged in PR #1383 · [`archived/2026-07-30-ev-pipeline-determinism.md`](./archived/2026-07-30-ev-pipeline-determinism.md)
- **Agentic-EQ Discipline / Rumination Guard** → Shipped as [`/blog/rumination-index`](../../content/blog/rumination-index/post.md) · [`archived/2026-08-01-agentic-discipline-eq-matrix.md`](./archived/2026-08-01-agentic-discipline-eq-matrix.md)
- **Under-Scoping Sub-Agents for Agency** → Shipped as [`/blog/constrained-autonomy`](../../content/blog/constrained-autonomy/post.md) · [`archived/2026-08-03-blog-idea-subagent-agency-underscoped-prompts.md`](./archived/2026-08-03-blog-idea-subagent-agency-underscoped-prompts.md)
- **SkillOpt Potential Index** → Shipped as [`/blog/skill-evaluator-vs-skillopt`](../../content/blog/skill-evaluator-vs-skillopt/post.md) · [`archived/2026-08-22-skillopt-potential-index.md`](./archived/2026-08-22-skillopt-potential-index.md)
- **Skills API Adoption** → Shipped as [`/blog/skills-api-adoption`](../../content/blog/skills-api-adoption/post.md) · [`archived/2026-08-22-blog-idea-skills-api-adoption-installable-procedural-intelligence.md`](./archived/2026-08-22-blog-idea-skills-api-adoption-installable-procedural-intelligence.md)
- **Parallel Cheap-Scout Fan-Out** → Shipped as [`/blog/parallel-cheap-scouting-frontier`](../../content/blog/parallel-cheap-scouting-frontier/post.md) & report · [`archived/2026-08-22-parallel-cheap-scouting-cost-performance.md`](./archived/2026-08-22-parallel-cheap-scouting-cost-performance.md)
- **INTENT.md Spec-Driven SDLC** → Shipped as [`/blog/intent-md-spec-driven-agent-sdlc`](../../content/blog/intent-md-spec-driven-agent-sdlc/post.md) · [`archived/2026-08-25-blog-idea-intent-md-spec-driven-agent-sdlc.md`](./archived/2026-08-25-blog-idea-intent-md-spec-driven-agent-sdlc.md)
- **The Context Compaction Curve & The 272k Tripwire** → Shipped as [`/blog/context-compaction-curve`](../../content/blog/context-compaction-curve/post.md) & [`/blog/context-compaction-phase-2`](../../content/blog/context-compaction-phase-2/post.md) · Report: [`content/reports/context-compaction-phase-2/`](../../content/reports/context-compaction-phase-2/paper.tex) · Issue: [#214](https://github.com/gaia-research/gaia-research/issues/214)
- **The Orchestrator Tax: Cold-Cache Reentries & 30-Minute KV Caching** → Shipped as [`/blog/orchestrator-tax-cold-cache`](../../content/blog/orchestrator-tax-cold-cache/post.md) · Report: [`content/reports/orchestration-guide/`](../../content/reports/orchestration-guide/harness-wiring.md) · Issue: [#242](https://github.com/gaia-research/gaia-research/issues/242)
- **Cache TTL Economics: 5-Hour vs. 1-Hour on Claude (Cache Horizon)** → Shipped as [`/blog/cache-horizon-orchestration`](../../content/blog/cache-horizon-orchestration/post.md) · Issue: [#247](https://github.com/gaia-research/gaia-research/issues/247)
- **The Reflex Agent Tax: Actual TypeSafe Jev vs. Gemini 3.8 Flash & GPT-6 Luna Mimics** → Shipped as [`/blog/reflex-agents-and-classifiers`](../../content/blog/reflex-agents-and-classifiers/post.md) · Receipt: [`content/reports/reflex-agents-eval/receipt-jev-vs-mimic-benchmarks.md`](../../content/reports/reflex-agents-eval/receipt-jev-vs-mimic-benchmarks.md) · Issue: [#278](https://github.com/gaia-research/gaia-research/issues/278)
- **Capability Amplification: When Scaffolding Beats Model Scale** → Shipped as [`/blog/capability-amplification`](../../content/blog/capability-amplification/post.md) · Issue: [#282](https://github.com/gaia-research/gaia-research/issues/282)
- **Next.js Registry Sync Build Pipeline** → Landed in production code as [`scripts/craft/sync-skill-tree.ts`](../../scripts/craft/sync-skill-tree.ts)

See [`archived/README.md`](./archived/README.md) for archival rules.
