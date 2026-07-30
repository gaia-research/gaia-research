# Blog Idea: How Hermes Skills Autonomously Improve Themselves

- **Type:** Technical Research / Architecture Breakdown
- **Status:** In Ideation
- **Target Audience:** AI Researchers, Agent Infrastructure Engineers, Systems Developers
- **Viability:** High
- **Potential:** Exceptional

## The Idea

A technical post dissecting the inner mechanics of autonomous skill self-improvement in Nous Research's **Hermes Agent** (`hermes-agent`). While many AI platforms claim "self-learning", the concrete architectural details of how an agent creates, refines, consolidates, and retires its own skills without human intervention are rarely documented or explained in detail.

This post exposes the closed-loop learning architecture in Hermes Agent: from trajectory extraction via `/learn` and `skill_manage`, to progressive disclosure token management, and the background **Curator** process (`curator.py`) that periodically reorganizes, patches, and archives skills.

## The Architectural Mechanisms (Genuinely Rare Insights)

### 1. Interactive Trajectory Capture & Agent-Managed Writes
- **The `/learn` Mechanism:** Rather than requiring developers to hand-author `SKILL.md` files, Hermes allows users or the agent itself to turn live workflows, web documentation, or past session logs into skills via natural language prompts.
- **The `skill_manage` Tool:** Hermes arms the LLM with a dedicated tool to create, update, or patch skills. Agent skill writes can be optionally gated (`skills.write_approval`), creating a human-in-the-loop safety buffer when desired.

### 2. Token-Efficient 3-Level Progressive Disclosure
- To prevent dynamic skill proliferation from exploding prompt context, Hermes implements a strict 3-tier loading hierarchy:
  - **Level 0 (`skills_list()`):** Scans `~/.hermes/skills/` (and external directories) and injects only `{name, description, category}` (~3k tokens base overhead).
  - **Level 1 (`skill_view(name)`):** Loads the full `SKILL.md` body only when a trigger condition or slash command matches.
  - **Level 2 (`skill_view(name, path)`):** Lazily fetches specific sub-files (`references/`, `scripts/`, `assets/`) on demand.

### 3. The Isolated Background Curator (`curator.py`)
- **Inactivity Triggering (No Daemon):** The Curator pass runs lazily during agent idle periods (e.g. `min_idle_hours: 2`, `interval_hours: 168`), avoiding active session interruption.
- **Isolated Context:** Spawns a background fork of `AIAgent` using an auxiliary model. It operates in a separate prompt cache, ensuring zero pollution of main conversation context or token budgets.
- **Deterministic Lifecycle Transitions:**
  - `active` → `stale` (after 30 days of non-use).
  - `stale` → `archived` (after 90 days of non-use; moved to `~/.hermes/skills/.archive/`).
  - Safe Invariant: Never auto-deletes — archival is fully recoverable.
- **LLM-Driven Consolidation & Umbrella Skills:**
  - When enabled (`curator.consolidate: true`), the auxiliary model reviews agent-created skills to merge overlapping near-duplicates into umbrella skills.
  - **Package Integrity Preservation:** The Curator treats skills as complete packages — if a skill contains relative paths to `references/`, `scripts/`, or `assets/`, it either re-homes all support assets and updates path pointers, or keeps the package intact rather than flattening `SKILL.md` into plain text.

### 4. Cross-Session Memory & User Modeling Integration
- Skill self-improvement connects directly to Hermes' memory substrate: FTS5 full-text session search, Honcho dialectic user modeling, and memory nudges feed performance feedback back into skill descriptions and trigger conditions.

## Proposed Outline for the Blog Post

1. **Beyond Prompt Engineering:** Why static prompts fail for long-running autonomous agents.
2. **The Hermes Closed Learning Loop:** Overview of the complete lifecycle (Capture → Store → Retrieve → Curate → Retire).
3. **Under the Hood of `curator.py`:** Code-level breakdown of inactivity passes, auxiliary agent isolation, and package-aware skill consolidation.
4. **Token Economics:** How 3-level progressive disclosure keeps 100+ learned skills cheap to maintain.
5. **Practical Takeaways for Agent Builders:** How to implement closed-loop skill curation in your own agent harnesses.

## Why This Matters for Gaia Research

- **High-Signal Content:** Provides deep technical insights into one of the most advanced open-source agent learning architectures.
- **Ecosystem Alignment:** Enhances understanding of Hermes Agent (which powers automated workflows across Gaia Research and `marketing-tasks`).
- **Research Value:** Informs our own harness design and skill lifecycle evaluations in Skill Heaven / Skill Hell.

## Research & Writing Checklist

- [ ] Inspect `curator.py` and `tools/skill_manage.py` in `NousResearch/hermes-agent` for exact state transition logic and prompt templates.
- [ ] Diagram the isolated auxiliary agent execution loop during curator passes.
- [ ] Draft article following `gaia-blog-post` guidelines and Nova persona.
