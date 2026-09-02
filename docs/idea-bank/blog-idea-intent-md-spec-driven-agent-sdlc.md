# Blog Idea: INTENT.md: Harness or Process Theater?

- **Type:** Technical Analysis / Architecture & Engineering Governance
- **Status:** In Progress / Shipping
- **Target Audience:** Agent Engineers, Harness Authors, Platform Architects, Engineering Leads
- **Viability:** Very High (Anthropic AI-Native SDLC Playbook primary source, verified mechanics, in-tree applicability)
- **Potential:** Exceptional

## The Idea

Anthropic's Applied AI team published *The AI-Native SDLC Playbook* (August 2026), introducing a 6-stage lifecycle centered around a new core artifact: `intent.md`. In this model, the software development bottleneck has permanently moved: code authoring is no longer the rate limiter, so the constraint shifts upstream to **intent formulation** and downstream to **continuous verification**.

The playbook proposes an explicit artifact chain in Git:
`intent.md` (proto-spec / invariants) $\rightarrow$ `spec.md` (requirements, architecture, and design) $\rightarrow$ `plan.md` (task DAG, touched files, test plan) $\rightarrow$ `code diff`.

This post analyzes `intent.md` through an empirical, adversarial lens:
1. **The Real Shift:** Why documents in Git change economic value when they become machine-ingested control harnesses rather than human-read prose that quickly rots.
2. **The 3-Tier Artifact Pipeline:** How `intent.md`, `spec.md`, and `plan.md` establish cryptographic provenance and bi-directional traceability without split-brain Jira/Linear drift.
3. **The 3 Critical Failure Modes:**
   - **Spec Slop:** Synthetic artifact inflation where agents write 500-line pseudo-specs and humans perform 5-second "vibe checks."
   - **The Telephone Game 2.0:** Multi-tier translation loss where negative constraints evaporate before the coding agent executes.
   - **Context Pollution:** Monolithic multi-document injection saturating token budgets and degrading attention.
4. **The Gaia Practitioner Framework:** The **50-Line Invariant Budget**, Tiered Governance matrix (T-shirt sizing blast radius), Residual Skip-Connections directly from `intent.md` to code verification, and Test-Driven Grounding.

## Primary Sources & Evidence

- **Primary Source:** *The AI-Native SDLC Playbook: Capture as intent.md, Requirements & Design (spec.md), and Plan Mode (plan.md)* — Anthropic Applied AI (Claude Academy, August 2026).
- **Harness Implementations:** Claude Code (`plan` mode and `auto` mode), Pi coding agent harnesses, and Git-backed subagent pipelines.
- **Related Research:**
  - Anthropic Engineering: *How to manage Claude Code workflows via CLAUDE.md* and *Agent Skills vs. Editor Rules*.
  - Gaia Research: *Constrained Autonomy* (arXiv:2505.13360 requirement conflicts vs. over-scoping) and *Claude 5 Descaffolding Audit*.

## Artifact Deliverables

- Blog post: `content/blog/intent-md-spec-driven-agent-sdlc/post.md`
- Next.js route: `app/blog/intent-md-spec-driven-agent-sdlc/page.tsx`
- Registered in `data/blog.ts`
- Spec in `content/blog/intent-md-spec-driven-agent-sdlc/THUMBNAIL.md`
- 16:9 Milim Editorial Thumbnail in `assets/generated/` and `public/assets/`
- Tracked in `content/assets/asset-ledger.json`
