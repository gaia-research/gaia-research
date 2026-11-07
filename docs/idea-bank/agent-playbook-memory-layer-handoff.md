# Agent Playbook Idea Bank: delivery handoff

**Status:** READY FOR REVIEW  
**Prepared:** 2026-11-08  
**Repository:** `gaia-research/gaia-research`  
**Pull request:** [#320](https://github.com/gaia-research/gaia-research/pull/320)  
**Scope:** Documentation-only Idea Bank proposal. No site, blog, skill, agent configuration, marketing runtime, merge, or deployment changes.

## Implementation

Filed issues **before** opening the documentation PR:

1. [gaia-skill-tree #2380](https://github.com/gaia-research/gaia-skill-tree/issues/2380): refresh the Founder Orchestrator guide to reflect recent cost-aware, verified delegation practice without replacing intentional founder-specific policies or duplicating economic orchestration [#2158](https://github.com/gaia-research/gaia-skill-tree/issues/2158).
2. [gaia-research #318](https://github.com/gaia-research/gaia-research/issues/318): dedicated Agent Playbook page, canonical blog pipeline, and gated marketing team campaign.
3. [gaia-research #319](https://github.com/gaia-research/gaia-research/issues/319): designer-owned front-page identity and placement for the Orchestration Guide / Agent Playbook, including optional skills discovery with truthful install semantics.

Changes on the proposal branch:
- `docs/idea-bank/agent-playbook-memory-layer.md`: the concept, memory/skill/profile boundaries, three owner-specific workstreams, and explicit implementation gates.
- `docs/idea-bank/README.md`: one **unranked** Product & Experience entry, leaving the ranked idea list untouched.
- This self-contained review handoff.

The canonical [Agent Playbook](https://github.com/gaia-research/agent-playbook) remains the memory-first source of truth. The Idea Bank only proposes public explanation and presentation; it does not fork those files or require `pi-config`.

## Findings and validation evidence

Read directly from GitHub: `gaia-research/gaia-skill-tree` Founder Orchestrator persona and skill, existing [economic orchestration RFC #2158](https://github.com/gaia-research/gaia-skill-tree/issues/2158), `gaia-research/gaia-research` `app/page.tsx` homepage skill grid and `data/research.ts`, the canonical `gaia-blog-post` skill, `marketing-tasks/docs/autonomous-marketing.md` (read-only), and Agent Playbook's `MEMORY.md`, `PLAYBOOK.md`, skills, and opt-in profile.

Re-fetched the committed brief and index from the feature branch. Structural checks passed:
- Idea Bank index addition occurs **exactly once**.
- Removing only that added section reconstructs the `main` index **byte-for-byte**, preserving all original rankings and prior content.
- All three issue URLs are present in both the brief and its index entry.
- Brief distinguishes memory/context ingestion from optional consent-based skill installs, and leaves design authority to the design agent.
- Before this handoff commit, the PR diff contained only the two intended `docs/idea-bank/*.md` documents.

These are source/documentation checks, not browser design, real skill installation, marketing execution, or persistence tests. No CI or deployment success is asserted.

## Outstanding issues and boundaries

- Design agent to select final front-page identity, location, CTAs, and interaction semantics under issue #319; no option is preapproved.
- Site/page/blog/marketing owners must perform fresh verification and review under issue #318, including appropriate creative/editorial/publication gates.
- Founder Orchestrator guide conflicts need a policy-aware reconciliation under issue #2380; do not silently erase the existing project-specific delegate-code rule.
- The portable playbook cannot guarantee that ChatGPT or another client writes persistent memory; the adoption flow requires supported features and consent.
- A single automatic installer for the whole playbook is **not** claimed; any skill install must be inspected and approved.
- No marketing publishing, runtime changes, code authoring, or PR merge authorized by this Idea Bank entry.

**Review request:** Independently inspect the latest pushed PR HEAD, the three changed Markdown files, and the source/issue links. Recommend approval or corrections. **Do not merge without explicit operator authorization.**
