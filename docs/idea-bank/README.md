# Idea Bank

Ranked by combined **viability** and **potential**.

## Rank 1 — Skill Heaven / Skill Hell MVP (Ratified)
- **Viability:** High (Skill Zero), Medium-High (Hell)
- **Potential:** Very High
- **Why now:** The current North Star (VISION/MISSION); Skill Zero is a complete subtractive launcher prototype, Heaven/Hell are summon directions, and the HH Index work keeps the gate evidence-first.
- **Doc:** [`skill-heaven-hell-mvp.md`](./archived/2026-07-24-skill-heaven-hell-mvp.md) · Plan: [`../plans/skill-heaven-hell-mvp-plan.md`](../plans/skill-heaven-hell-mvp-plan.md) · **Decisions: [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md)**

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

## Rank 12 — Skill Eval Harness & Continuous Lifecycle Management
- **Viability:** Very High
- **Potential:** Exceptional
- **Why now:** Derived from DeepMind Staff Engineer Philipp Schmid's research ("Don't Ship Skills Without Evals"); establishes standardized JSON/YAML test harnesses, progressive disclosure budgeting (<500 words, no-op removal), capability vs. preference skill separation, and ablation testing for skill retirement.
- **Doc:** [`skill-eval-harness-and-lifecycle.md`](./skill-eval-harness-and-lifecycle.md)

## Rank 13 — SkillOpt Potential Index (PLN)
- **Status:** PLN — unratified, in ideation
- **Viability:** Medium-High
- **Potential:** Very High
- **Why now:** SkillOpt (Microsoft Research, 2026) shows that skill improvement under optimization is not uniform — some skills lift +39 pts, others +9. A static pre-flight index that scores a `SKILL.md` for optimization potential (trigger vagueness, filler density, missing negative boundaries, directive density ratio) would let practitioners know which skills are worth running through a full optimization loop before committing the token budget.
- **Doc:** [`skillopt-potential-index.md`](./skillopt-potential-index.md)

## Rank 14 — Claude 5 System-Prompt Shrink (Harness Descaffolding Audit)
- **Status:** LEANING — unratified, in ideation
- **Viability:** Medium-High
- **Potential:** High
- **Why now:** Anthropic's Thariq Shihipar described cutting over 80% of Claude Code's system prompt for advanced Claude 5-generation models such as Opus 5 and Fable 5, with no measurable loss on Anthropic's coding evaluations. The audit separates model-compensating scaffolding (candidate to cut, measured) from repo-invariant policy (keep: Node 22 CI contract, the three-doc system, the lexicon gate) — and rides on the per-model measurement discipline (D12, Rank 2) we already run. The result is Anthropic's for Anthropic's harness, not a Gaia measurement.
- **Doc:** [`claude-5-system-prompt-shrink-audit.md`](./claude-5-system-prompt-shrink-audit.md)

## Rank 15 — Agentic-EQ-Aware Descaffolding — The Rumination Guard
- **Status:** IDEA — unratified, in ideation
- **Viability:** Medium-High
- **Potential:** High
- **Why now:** Anthropic's descaffolding finding (>80% prompt cut for Claude 5-gen models) may be a function of model EQ, not a universal constant. Fable 5/Mythos is described as having higher EQ than Opus 5 — meaning Opus 5 ruminate without discipline, while Fable 5 self-regulates. Testing this with our existing D12 infrastructure turns "prompt shrink" from hygiene into a per-model calibration problem.
- **Doc:** [`agentic-discipline-eq-matrix.md`](./agentic-discipline-eq-matrix.md)

## Rank 15 — Random Forest + SHAP/LIME Trust-Appraisal Explainability Model
- **Status:** RFC / research — unratified, decoupled v-next study
- **Viability:** Medium-High
- **Potential:** High
- **Why now:** The `gaia-skill-tree` registry's Trust Magnitude signals (`src/gaia_cli/trustMagnitude.py`) form a genuine feature vector; the curated registry's (skill → assigned star rank) pairs are an implicit labeled corpus. A Random Forest wrapped in SHAP/LIME could predict and *explain* a skill's star rank — surfacing mis-calibrated skills and explaining assignments to contributors — while TM stays the sole transparent promotion gate per `META.md`. Explicitly a trust-appraisal study, NOT the gaia-curate v2 mapping classifier (that ships first, independently).
- **Doc:** [`rf-shap-trust-appraisal.md`](./rf-shap-trust-appraisal.md)

## Rank 16 — Blog Idea: The agentskills.io Standard and Its Story
- **Status:** In Ideation
- **Viability:** Very High
- **Potential:** High
- **Why now:** The `agentskills.io` standard has quietly become the open specification adopted across 40+ AI agent platforms; documenting its origin, anatomy, 3-level progressive disclosure model, and ecosystem momentum positions Gaia Research at the center of skill standardisation.
- **Doc:** [`blog-idea-agentskills-io-standard-and-story.md`](./blog-idea-agentskills-io-standard-and-story.md)

## Rank 17 — Blog Idea: How Hermes Skills Autonomously Improve Themselves
- **Status:** In Ideation
- **Viability:** High
- **Potential:** Exceptional
- **Why now:** Autonomous skill self-evolution is widely touted but rarely explained at an architectural level. Unpacking Hermes Agent's `/learn` trajectory capture, 3-tier progressive disclosure, and isolated background Curator process (`curator.py`) delivers rare, high-signal technical content genuinely not easily available elsewhere.
- **Doc:** [`blog-idea-hermes-skills-autonomous-self-improvement.md`](./blog-idea-hermes-skills-autonomous-self-improvement.md)

## Rank 18 — Blog Idea: The "Perfect Prompt" Trap — Under-Scoping Sub-Agents for Agency
- **Status:** In Ideation (unratified)
- **Viability:** High
- **Potential:** High
- **Why now:** A well-sourced essay on a real, non-obvious tension: over-specified sub-agent prompts degrade reasoning (arXiv:2505.13360 — up to 41% accuracy drop from requirement conflicts), yet Anthropic found *vague* sub-agent prompts cause chaos (drift, duplication). The resolution — **scope the boundary tightly, under-scope the trajectory** ("constrained autonomy") — reframes delegation-prompt craft and rhymes with the current Skill Heaven descaffolding line. Ships with a small `delegate-with-agency` orchestrator skill/custom-instruction artifact.
- **Doc:** [`blog-idea-subagent-agency-underscoped-prompts.md`](./blog-idea-subagent-agency-underscoped-prompts.md)

## Rank 19 — Blog Subscriber Email Pipeline & Mailing MCP Integration
- **Status:** Proposed Issue / RFC Plan
- **Viability:** Very High
- **Potential:** High
- **Why now:** Establishes an automated subscriber growth loop by pairing a sleek dark-themed Subscribe UI on the Next.js site with a Mailing MCP Server (Resend/Loops) connected directly to the `gaia-blog-post` skill for zero-friction post-publish broadcasts.
- **Doc:** [`../plans/issue-blog-subscriber-email-pipeline.md`](../plans/issue-blog-subscriber-email-pipeline.md)

## Rank 20 — Parallel Cheap-Scout Fan-Out: Cost-Performance Pareto Frontier
- **Status:** Proposed Research / RFC -- **not ratified**
- **Viability:** High (all models already accessible via Antigravity routing; pi-dynamic-workflows provides parallel dispatch; pi-cost provides telemetry)
- **Potential:** Very High (directly applicable to every multi-agent orchestration pattern in the Gaia ecosystem)
- **Why now:** The cost gap between `gemini-3.5-flash-lite` (~$0.03/1M cache-read) and `gemini-3.7-flash` (~$0.075/1M cache-read) is 2.5x. For orchestration-heavy workflows where scouts are the highest-volume component, testing whether $K$ parallel cheap scouts can match or beat a single expensive scout's recall at lower total cost is the largest cost lever available. All infrastructure exists: pi-dynamic-workflows provides `parallel()` dispatch, pi-cost provides token/cost telemetry, and the HH Benchmark ledger pattern provides a proven append-only JSONL recording discipline.
- **Doc:** [`parallel-cheap-scouting-cost-performance.md`](./parallel-cheap-scouting-cost-performance.md) · Plan: [`../plans/issue-parallel-cheap-scouting-bench.md`](../plans/issue-parallel-cheap-scouting-bench.md) · Receipt: [`../../content/reports/parallel-scouting-economics.md`](../../content/reports/parallel-scouting-economics.md)
