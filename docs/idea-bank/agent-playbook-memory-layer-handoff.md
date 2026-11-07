# Agent Playbook Idea Bank: delivery handoff

**Status:** READY FOR REVIEW  
**Prepared:** 2026-11-08  
**Repository:** `gaia-research/gaia-research`  
**Pull request:** [#320](https://github.com/gaia-research/gaia-research/pull/320)  
**Scope:** Documentation-only Idea Bank proposal. No site, blog, skill, agent configuration, marketing runtime, merge, or deployment changes.

## Implementation

Original issues #2380, #318 and #319 were filed **before** opening the documentation PR. The operator clarified the actual guide owner after PR creation: #2380 was [closed as not planned](https://github.com/gaia-research/gaia-skill-tree/issues/2380), and replacement [gaia-research #321](https://github.com/gaia-research/gaia-research/issues/321) was filed. Current issue ownership:

1. [gaia-research #321](https://github.com/gaia-research/gaia-research/issues/321): improve **Gaia Research's public Orchestration Guide**, using real verification-backed execution practice and Agent Playbook as a companion. The separate Gaia Skill Tree Founder Orchestrator is explicitly out of scope.
2. [gaia-research #318](https://github.com/gaia-research/gaia-research/issues/318): dedicated Agent Playbook page, canonical blog pipeline, and gated marketing team campaign.
3. [gaia-research #319](https://github.com/gaia-research/gaia-research/issues/319): designer-owned front-page identity and placement for the Orchestration Guide / Agent Playbook, including optional skills discovery with truthful install semantics.

Changes on the proposal branch:
- `docs/idea-bank/agent-playbook-memory-layer.md`: the concept, memory/skill/profile boundaries, three owner-specific workstreams, and explicit implementation gates.
- `docs/idea-bank/README.md`: one **unranked** Product & Experience entry, leaving the ranked idea list untouched.
- This self-contained review handoff.

The canonical [Agent Playbook](https://github.com/gaia-research/agent-playbook) remains the memory-first source of truth. The Idea Bank only proposes public explanation and presentation; it does not fork those files or require `pi-config`.

## Findings and validation evidence

Read directly from GitHub: `gaia-research/gaia-research` `content/reports/orchestration-guide/guide.md` (public Orchestration Guide), `app/research/orchestration-guide/page.tsx`, homepage `app/page.tsx` / `data/research.ts`, canonical `gaia-blog-post` skill, `marketing-tasks/docs/autonomous-marketing.md` (read-only), and Agent Playbook's `MEMORY.md`, `PLAYBOOK.md`, skills, and opt-in profile. The separate Gaia Skill Tree Founder Orchestrator and [economic scheduler RFC #2158](https://github.com/gaia-research/gaia-skill-tree/issues/2158) were inspected historically but are not workstream A's target.

Re-fetched the committed brief and index from the feature branch. Structural checks passed:
- Idea Bank index addition occurs **exactly once**.
- Removing only that added section reconstructs the `main` index **byte-for-byte**, preserving all original rankings and prior content.
- All three issue URLs are present in both the brief and its index entry.
- Brief distinguishes memory/context ingestion from optional consent-based skill installs, and leaves design authority to the design agent.
- The proposal PR changes only `docs/idea-bank/*.md` files, including this handoff. No runtime or site code was changed by this correction.
- Corrected the Idea Bank brief/index and issues #318/#319 to link new Gaia Research issue #321, not closed Gaia Skill Tree issue #2380.

These are source/documentation checks, not browser design, real skill installation, marketing execution, or persistence tests. No CI or deployment success is asserted.

## Outstanding issues and boundaries

- Design agent to select final front-page identity, location, CTAs, and interaction semantics under issue #319; no option is preapproved.
- Site/page/blog/marketing owners must perform fresh verification and review under issue #318, including appropriate creative/editorial/publication gates.
- Public Orchestration Guide improvements belong to issue #321 and must preserve the guide's source-backed economic decision framework. Gaia Skill Tree's Founder Orchestrator is a different document and is **not planned** under this initiative.
- The portable playbook cannot guarantee that ChatGPT or another client writes persistent memory; the adoption flow requires supported features and consent.
- A single automatic installer for the whole playbook is **not** claimed; any skill install must be inspected and approved.
- No marketing publishing, runtime changes, code authoring, or PR merge authorized by this Idea Bank entry.

**Review request:** Independently inspect the latest pushed PR HEAD, the three changed Markdown files, and the source/issue links. Recommend approval or corrections. **Do not merge without explicit operator authorization.**
