# Idea Bank

Ranked by combined **viability** and **potential**.

## Rank 1 — The Context Compaction Curve & The 272k Tripwire
- **Status:** Priority Benchmark & Blog Post (In Ideation)
- **Viability:** Very High (telemetry via `pi-cost` and API harnesses already supported)
- **Potential:** Exceptional
- **Why now:** OpenAI's default 272k compaction limit anchors coding harnesses to a severe billing tripwire (2x input / 1.5x output surcharge). Meanwhile, Anthropic's 5-minute prompt-cache TTL cliff turns long-context cache misses into catastrophic $0.90+ re-write penalties, and uncompacted session noise inflates reasoning tokens by up to 10x. Identifying and benchmarking the empirical "Sweet Spot Zone" (40k–65k tokens) yields immediate, high-impact guidance for configuring Claude Code, Codex, and Pi.
- **Doc:** [`blog-idea-context-compaction-curve-economics.md`](./blog-idea-context-compaction-curve-economics.md) · Plan: [`../plans/issue-context-compaction-curve-bench.md`](../plans/issue-context-compaction-curve-bench.md) · Issue: [#214](https://github.com/gaia-research/gaia-research/issues/214)

## Rank 2 — Per-Model × Per-Harness Token-Savings Matrix
- **Viability:** Medium (depends on an unratified frozen-skill-set snapshot mechanism, and on N4/N5 closing)
- **Potential:** High
- **Why now:** Directly seeded by the 2026-07-22 M2 live demo, where switching the probe model from haiku to Sonnet-low changed both probe reliability and the measured token numbers — proof that token savings must be locked per-model-per-level, not reported as one cross-model figure. Strictly a post-MVP reporting surface built on top of the already-gated D12 method, never a gate itself.
- **Doc:** [`per-model-harness-token-savings-matrix.md`](./per-model-harness-token-savings-matrix.md)

## Rank 3 — Flight Digest Telemetry Adapter
- **Viability:** Very High
- **Potential:** Very High
- **Why now:** Works with existing agent stacks without replacing them; privacy-aware structural telemetry is cheap to collect and easy for Skill Tree to ingest later.
- **Doc:** [`flight-digest-telemetry-adapter.md`](./flight-digest-telemetry-adapter.md)

## Rank 4 — Proof-of-Skill Badges
- **Viability:** Very High
- **Potential:** High
- **Why now:** Lightweight, public-facing, and immediately useful for adoption, sharing, and credibility loops.
- **Doc:** [`proof-of-skill-badges.md`](./proof-of-skill-badges.md)

## Rank 5 — Milim HUD Terminal Overlay
- **Viability:** High
- **Potential:** High
- **Why now:** Adds delight on top of existing logs and telemetry without demanding infrastructure migration.
- **Doc:** [`milim-hud-terminal-overlay.md`](./milim-hud-terminal-overlay.md)

## Rank 6 — Chaos-Buster Resilience Injector
- **Viability:** High
- **Potential:** High
- **Why now:** Strong fit with verification, containment, and robustness research already present in the repo.
- **Doc:** [`chaos-buster-resilience-injector.md`](./chaos-buster-resilience-injector.md)

## Rank 7 — Raphael Prober MCP Server
- **Viability:** Medium-High
- **Potential:** Very High
- **Why now:** A sharp bridge between benchmarking, MCP tooling, and shareable capability reports.
- **Doc:** [`raphael-prober-mcp-server.md`](./raphael-prober-mcp-server.md)

## Rank 8 — Dynamic Agent Evolution Tracking
- **Viability:** Medium
- **Potential:** Very High
- **Why now:** Big strategic upside as a living capability graph, but needs careful trust, replay, and anti-gaming design.
- **Doc:** [`dynamic-agent-evolution-tracking.md`](./dynamic-agent-evolution-tracking.md)

## Rank 9 — Gaia-Lite Headless Toolkit Extraction
- **Viability:** High
- **Potential:** Medium-High
- **Why now:** Already aligned with the consolidation PRD and unlocks cleaner packaging of future telemetry and verification tools.
- **Doc:** [`gaia-lite-headless-toolkit-extraction.md`](./gaia-lite-headless-toolkit-extraction.md)

## Rank 10 — Next.js Registry Sync Build Pipeline
- **Viability:** High
- **Potential:** Medium
- **Why now:** Practical enabling work from the site plan that can evolve into reusable registry ingestion tooling.
- **Doc:** [`nextjs-registry-sync-build-pipeline.md`](./nextjs-registry-sync-build-pipeline.md)

## Rank 11 — Gaia Production Team & Native Asset Pipelines
- **Viability:** High
- **Potential:** Very High
- **Why now:** Dedicated end-to-end production home for Milim Player, 2.5D animation pipelines, and native image generation skills (`gpt-image-2`), elevating brand asset craft.
- **Doc:** [`gaia-production-team.md`](./gaia-production-team.md)

## Rank 12 — Automated Change Management Team & Infrastructure
- **Viability:** High
- **Potential:** Very High
- **Why now:** Hermes Agent cron-scheduled engine for automated changelog hunting, epic merge signal ingestion from `gaia-skill-tree` & `gaia-research`, auto `docs/en` updates, and frontend UI/marketing triggers.
- **Doc:** [`change-management-team.md`](./change-management-team.md)

## Rank 13 — Blog Idea: How Hermes Skills Autonomously Improve Themselves
- **Status:** In Ideation
- **Viability:** High
- **Potential:** Exceptional
- **Why now:** Autonomous skill self-evolution is widely touted but rarely explained at an architectural level. Unpacking Hermes Agent's `/learn` trajectory capture, 3-tier progressive disclosure, and isolated background Curator process (`curator.py`) delivers rare, high-signal technical content genuinely not easily available elsewhere.
- **Doc:** [`blog-idea-hermes-skills-autonomous-self-improvement.md`](./blog-idea-hermes-skills-autonomous-self-improvement.md)

## Rank 14 — Random Forest + SHAP/LIME Trust-Appraisal Explainability Model
- **Status:** RFC / research — unratified, decoupled v-next study
- **Viability:** Medium-High
- **Potential:** High
- **Why now:** The `gaia-skill-tree` registry's Trust Magnitude signals (`src/gaia_cli/trustMagnitude.py`) form a genuine feature vector; the curated registry's (skill → assigned star rank) pairs are an implicit labeled corpus. A Random Forest wrapped in SHAP/LIME could predict and *explain* a skill's star rank — surfacing mis-calibrated skills and explaining assignments to contributors — while TM stays the sole transparent promotion gate per `META.md`. Explicitly a trust-appraisal study, NOT the gaia-curate v2 mapping classifier (that ships first, independently).
- **Doc:** [`rf-shap-trust-appraisal.md`](./rf-shap-trust-appraisal.md)

## Rank 15 — Blog Subscriber Email Pipeline & Mailing MCP Integration
- **Status:** Proposed Issue / RFC Plan
- **Viability:** Very High
- **Potential:** High
- **Why now:** Establishes an automated subscriber growth loop by pairing a sleek dark-themed Subscribe UI on the Next.js site with a Mailing MCP Server (Resend/Loops) connected directly to the `gaia-blog-post` skill for zero-friction post-publish broadcasts.
- **Doc:** [`../plans/issue-blog-subscriber-email-pipeline.md`](../plans/issue-blog-subscriber-email-pipeline.md)

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

See [`archived/README.md`](./archived/README.md) for archival rules.
