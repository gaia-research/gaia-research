# Agent Playbook as the memory layer for prompting and orchestration

**Status:** Proposed / unranked, not an implementation commitment  
**Idea owner:** Gaia Research  
**Recorded:** 2026-11-08  
**Canonical source:** [gaia-research/agent-playbook](https://github.com/gaia-research/agent-playbook)  
**Tracking:** [Orchestrator guide #2380](https://github.com/gaia-research/gaia-skill-tree/issues/2380) · [Content and dedicated page #318](https://github.com/gaia-research/gaia-research/issues/318) · [Front-page design #319](https://github.com/gaia-research/gaia-research/issues/319)

## The idea

Most agent advice arrives as disposable prompts or a harness-specific settings bundle. A user should also have **portable memory about how their agents should work**: intent, authority, model economics, delegation, evidence, review, and handoffs. The public Agent Playbook is that source-of-truth layer, without becoming an agent runtime or requiring any one vendor.

Three linked outcomes:

1. **Reconcile the Gaia Founder Orchestrator guide** with actual cost-aware, evidence-backed practice.
2. **Introduce the Agent Playbook publicly** through a dedicated page, a technical blog story, and a separately governed marketing campaign.
3. **Give it a distinctive discovery surface** on the Gaia Research front page, alongside or integrated with orchestration skills. The design agent decides whether this is a tandem feature, dedicated block, or existing skill-grid integration.

**Framing:** *Read it as context. Adopt it as memory when your platform and consent allow. Install only the skills you choose.*

## Separate three layers

| Layer | Source of truth | What it does | What it is not |
| --- | --- | --- | --- |
| Portable philosophy | [`PLAYBOOK.md`](https://github.com/gaia-research/agent-playbook/blob/main/PLAYBOOK.md) | Mission, delegation, authority, evidence, and GitHub delivery rules | Another orchestration engine |
| Conversational ingestion | [`MEMORY.md`](https://github.com/gaia-research/agent-playbook/blob/main/MEMORY.md) | Explains how an AI can interpret, reconcile, and organize durable preferences | Guaranteed ChatGPT memory writing or continuous sync |
| Optional executable guidance | [`skills/orchestrate`](https://github.com/gaia-research/agent-playbook/tree/main/skills/orchestrate) and [`skills/prompting`](https://github.com/gaia-research/agent-playbook/tree/main/skills/prompting) | Harness-discoverable procedures installed only after consent | A universal one-click installer or hidden hooks |

Personal settings live in [`profiles/marco/`](https://github.com/gaia-research/agent-playbook/tree/main/profiles/marco), with a [template](https://github.com/gaia-research/agent-playbook/tree/main/profiles/template) for other users. A profile is opt-in, not a silently adopted global default. `pi-config` remains independent and is **not** required to read the playbook.

## Workstream A: Founder Orchestrator guide

**Owner / issue:** [gaia-skill-tree #2380](https://github.com/gaia-research/gaia-skill-tree/issues/2380)

The canonical [`founder/ORCHESTRATOR.md`](https://github.com/gaia-research/gaia-skill-tree/blob/main/founder/ORCHESTRATOR.md) and [`gaia-orchestrator` skill](https://github.com/gaia-research/gaia-skill-tree/blob/main/.agents/skills/gaia-orchestrator/SKILL.md) contain older broad-delegation and 3–8 fan-out heuristics. Reconcile them against actual practice: smallest effective coordination, explicit role/model/effort/permissions preflight, four-agent personal concurrency preference, no unauthorized fallbacks or escalations, and independent evidence verification.

**Important distinction:** Preserve true founder-specific *project authority* (including deliberate code delegation and documentation powers) unless explicitly changed by the operator. The portable playbook does not override Gaia Skill Tree governance. Existing [economic orchestration RFC #2158](https://github.com/gaia-research/gaia-skill-tree/issues/2158) owns runtime/scheduler exploration; this workstream must not duplicate it.

Acceptance: guide and entry points reference canonical playbook where appropriate; conflicting rules are identified and resolved through operator decisions; no new orchestration runtime.

## Workstream B: Public explanation and adoption

**Owner / issue:** [gaia-research #318](https://github.com/gaia-research/gaia-research/issues/318)

- **Dedicated page:** Explain the two user paths, show the memory/profile/skill relationship, link the public repository, and make permission and persistence limits truthful. The page should help a fresh user choose without assuming Pi or ChatGPT memory features.
- **Blog:** Produce a genuinely useful, technically grounded essay under the canonical `.agents/skills/gaia-blog-post/SKILL.md` pipeline. Explain the difference between a durable prompting philosophy, memory ingestion, and optional SKILL.md procedures. Show the GitHub four-line handoff and independent review as an inspectable example; do not invent outcomes or compatibility tests.
- **Marketing:** Route to Gaia Research's existing `marketing-tasks` `/auto` editorial workflow, with its own reviewer and distribution gates. Plan evidence-first LinkedIn and X angles with an original point of view, not a generic launch announcement. Publication is a later separately authorized action.

Public benefits should be presented as a design and documentation proposition, not empirically measured cost savings or universal memory persistence.

## Workstream C: Designer-led front-page identity

**Owner / issue:** [gaia-research #319](https://github.com/gaia-research/gaia-research/issues/319)

The current [homepage](https://github.com/gaia-research/gaia-research/blob/main/app/page.tsx) already has a `#skills` grid sourced from `data/research.ts`. The design agent should evaluate a *new identity* for Orchestration Guide + Agent Playbook, including a tandem feature, distinct front-page module, or existing card pattern. Do **not** prescribe the final treatment in this idea-bank brief.

Design must clarify **Read as memory/context** versus **Install chosen skills with consent**. A feature slot, a full installation treatment, and a dual CTA are candidate design decisions, not preapproved implementation. Validate any claimed installer command against actual supported skill-directory semantics. Preserve responsive accessibility, homepage hierarchy, and existing Skill Heaven positioning.

## Boundaries and sequence

1. **Now:** issues first, then this docs-only idea-bank PR. Keep unranked, change no product code, content registry, marketing runtime, public site or installation.
2. **Next, when authorized:** owners/designers investigate and propose specific implementations; the design agent owns front-page identity. Coordinate page, blog, and marketing with the canonical editorial workflow.
3. **Later:** individual reviewed implementation/publication PRs with tested claims, accessibility proof, full handoff, and explicit merge/deploy/publish authorization.

Do not install skills, write anyone's memory, infer provider/model availability, publish marketing, or merge/deploy anything from this document alone.

## Success criteria

A new reader understands where the portable rules live, how to make them personal, how conversational ingestion differs from harness installation, and what requires consent. A Gaia founder session gains a clearer orchestration guide without duplicated policy or runtime. The public website introduces both sides in a design-led, useful, non-generic way.
