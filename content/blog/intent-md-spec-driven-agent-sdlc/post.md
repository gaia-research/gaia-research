# INTENT.md and the Spec-Driven Agent SDLC: Constraint Harness or Process Theater?

*August 25, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

When an autonomous coding agent can generate five hundred lines of syntactically valid code in eight seconds, code authoring ceases to be the engineering bottleneck.

The rate limiter shifts to the two stages surrounding it: **intent formulation** (defining boundary conditions, non-goals, and business outcomes before generation begins) and **deterministic verification** (compiling those constraints into automated tests and linters that gate the diff).

In August 2026, Anthropic's Applied AI team published [The AI-Native SDLC Playbook](https://academy.claude.com/courses/ai-native-sdlc-playbook/capture-intent), proposing a structured, six-stage lifecycle organized around a new core artifact: `intent.md`. Rather than starting with an unanchored prompt or a stale Jira ticket, work begins with a version-controlled proto-spec that kicks off a three-tier chain:

$$\text{intent.md} \longrightarrow \text{spec.md} \longrightarrow \text{plan.md} \longrightarrow \text{code diff}$$

Is `intent.md` an essential constraint harness for autonomous agents, or does it risk becoming another layer of synthetic process theater?

[[FIGURE_BOTTLENECK_SHIFT]]

---

## Why markdown in Git changes economics for agents

In human-only teams, design documents, Architecture Decision Records (ADRs), and Product Requirements Documents (PRDs) suffer from inevitable documentation decay. Updating prose while debugging an active outage is high friction and low reward; within weeks, the written documentation and the production codebase diverge.

When autonomous agents enter the loop, the unit economics of written documentation invert. Documents stop functioning as passive human reference manuals and become **machine-ingested control harnesses**:

1. **Context Amortization Across Turns:** Instead of an engineer repeatedly re-typing negative constraints across thirty conversational turns—burning tokens and suffering prompt drift—a structured `intent.md` serves as a stable epistemic anchor.
2. **Deterministic Verification Synthesis:** Unlike a human reviewer who reads a PRD descriptively, an agent can compile acceptance criteria from `intent.md` directly into failing test assertions before touching production code.
3. **Branch-Scoped State Synchronization:** Storing intent directly in the repository binds specifications to Git commit SHAs. Branching the code branches the intent; reverting a commit reverts the specification.

[[FIGURE_ARTIFACT_PIPELINE]]

---

## The four tiers: from invariant to AST mutation

Anthropic's playbook formalizes the software lifecycle into four decoupled layers:

| Tier | Artifact | Primary Owner | Content & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Tier 0** | `intent.md` | Human Originator / Lead | The *why*, business outcomes, non-negotiable invariants, risk classification, and explicit non-goals. |
| **Tier 1** | `spec.md` | Agent + Product Owner | Formal contracts, schema definitions, latency budgets, and security boundaries, constrained by organizational skills. |
| **Tier 2** | `plan.md` | Agent + Engineer | Ordered execution DAG, target file list, dependency graph, step verification commands, and rollback strategy. |
| **Tier 3** | `CODE DIFF` | Coding Agent Loop | Concrete AST edits, unit and integration test additions, and configuration changes verified by compilers and test runners. |

### Enterprise systems: Git as the single source of truth

A common hurdle in enterprise environments is the split-brain hazard: business teams negotiate in Jira, Linear, or ServiceNow, while engineering agents build against Git. 

The clean architectural resolution is **outbound projection**: Git Markdown remains the authoritative single source of truth, carrying structured YAML frontmatter. CI event hooks read this metadata and project status updates into external issue trackers or populate Change Advisory Board (CAB) records automatically:

```yaml
---
intent_id: "INT-2026-084"
external_refs:
  jira: "CORE-4912"
  servicenow_rfc: "CHG0098124"
risk_classification: "Tier-2"
invariants:
  - "Zero external network calls on /verify hot path"
  - "Backward compatibility with HS256 tokens"
verification_command: "npm run test:auth-matrix"
---
```

---

## Three critical failure modes

When teams adopt multi-tier spec chains without discipline, they hit three reproducible failure modes:

```
1. SPEC SLOP
   [Vague Prompt] ──► [Agent drafts 500 lines] ──► [Human "Vibe Check"] ──► [Hallucinated Constraints]

2. THE TELEPHONE GAME 2.0
   [INTENT] ──(Lossy Pass)──► [SPEC] ──(Lossy Pass)──► [PLAN] ──(Lossy Pass)──► [Drifted Code]

3. CONTEXT POLLUTION
   [System Prompt + All 4 Artifacts Loaded] ──► 15k Tokens/Turn ──► Degraded Attention
```

### 1. Spec Slop (Synthetic artifact inflation)

When an agent is asked to draft an `intent.md` from a conversational prompt without rigid constraints, it generates hundreds of lines of generic boilerplate—hypothetical scalability diagrams, unnecessary abstraction layers, and defensive interfaces.

Reviewing a 500-line markdown file is mentally exhausting. Engineers perform a superficial five-second "vibe check" and approve the pull request. Downstream agents treat those hallucinated details as immutable requirements, engineering elaborate solutions for non-existent problems.

### 2. The Telephone Game 2.0 (Cascading semantic drift)

When information flows sequentially through multiple generative passes ($\text{Intent} \to \text{Spec} \to \text{Plan} \to \text{Diff}$), semantic fidelity drops exponentially.

Negative constraints (*"Do not touch the database migration schema"*) suffer particularly high dropout rates during summarization. By the time Tier 3 executes, the coding agent violates core invariants because it only ingested Tier 2's task list.

**The Fix:** Implement **Residual Skip-Connections**. The execution harness must inject Tier 0 (`intent.md`) directly into the Tier 3 coding agent's pinned context, and a pre-commit verifier must compute:

$$\Delta(\text{Diff}, \text{intent.md}) \longrightarrow \{\text{Scope Violations, Invariant Breaches}\}$$

### 3. Context Pollution and Token Drag

Naive harnesses inject all four markdown files into the agent's context window on every turn. In a thirty-turn session, a 6,000-token document stack burns over 180,000 input tokens. The context window saturates, attention disperses over distant instructions, and tool-calling accuracy degrades.

---

## Contrast: Fluffy spec slop vs. the 50-line Invariant Budget

The difference between synthetic overhead and an actionable constraint harness comes down to structure:

### Anti-pattern: Verbose prose spec (unanchored)

```markdown
# Intent Document: User Authentication Enhancement
## Background and Strategic Importance
In our ongoing initiative to modernize enterprise infrastructure, we must empower
our user base with state-of-the-art authentication mechanisms. Security is a primary
pillar of our engineering culture...

## Proposed Architectural Solution
The system should leverage modern paradigms to seamlessly facilitate multi-token
validation across diverse endpoint surfaces with maximum flexibility...
```

*Why it fails:* It contains zero machine-verifiable assertions, zero negative boundaries, and fifty lines of unfalsifiable marketing prose.

### Recommended: The 50-Line Invariant Budget

```markdown
# INTENT: Auth Service Token Rotation
## 1. Outcome
Support asymmetric RS256 token verification alongside symmetric HS256 without downtime.

## 2. Invariants (Hard Constraints)
- MUST NOT add external network calls to `/verify` hot path.
- MUST NOT introduce new runtime dependencies to package.json.
- Memory allocation delta per verification must remain < 512 bytes.

## 3. Explicit Non-Goals
- NOT migrating user profile database tables in this milestone.
- NOT deprecating legacy API keys.

## 4. Contract Schema
- Input: `Authorization: Bearer <jwt_string>`
- Output: `Result<SessionClaims, AuthError>`

## 5. Verification Gate Command
`npm run test:auth-matrix && npm run bench:verify-latency`
```

*Why it works:* Every line is either a negative boundary, a contract interface, or an executable CLI verification command.

---

## The practitioner framework: Tiered governance

Not every change justifies a four-tier document pipeline. Mandating full `intent.md` files for minor bugfixes produces process theater.

[[FIGURE_GOVERNANCE_MATRIX]]

| Tier | Scope | Artifact Strategy | Verification Gate |
| :--- | :--- | :--- | :--- |
| **Tier 1: Tactical** | Bugfixes, CSS tweaks, single-file edits | Direct prompt-to-diff. No standalone markdown artifacts. | Standard unit tests and linters pass. |
| **Tier 2: Standard** | Multi-file features, internal APIs | **Ephemeral intent** captured in the Issue/PR body; inline test plan. | TDD assertions pass; diff matches issue scope. |
| **Tier 3: Architectural** | Auth rewrites, schema migrations, subagent fan-outs | Full four-tier chain (`intent.md` $\to$ `spec.md` $\to$ `plan.md`). | CI AST diff-scope analyzer, signed commits. |

---

## Summary and actionable takeaways

`intent.md` is neither a silver bullet nor a replacement for engineering judgment. It is a **deterministic constraint harness for stochastic code generators**.

1. **Cap intent documents at 50 lines:** Strip narrative prose, user stories, and background rationale. Keep only invariants, non-goals, contracts, and test commands.
2. **Wire residual skip-connections:** Never allow a coding agent to read only `plan.md`. Always pin Tier 0 invariants in the active prompt.
3. **Compile intent into failing tests first:** If an acceptance criterion cannot be tested by a compiler, linter, or test runner, treat it as advisory.
4. **Scale rigor with blast radius:** Reserve the full four-tier artifact chain for high-risk, multi-agent, or architectural migrations.

---

## Sources & Primary Citations

- **Primary Source:** *The AI-Native SDLC Playbook: Capture as intent.md, Requirements & Design (spec.md), and Plan Mode (plan.md)* — Anthropic Applied AI (Claude Academy, August 2026).
- **Harness Implementations:** Claude Code (`plan` mode and `auto` mode), Pi coding agent harnesses, and Git-backed subagent pipelines.
- **Related Research:**
  - Anthropic Engineering: *How to manage Claude Code workflows via CLAUDE.md* and *Agent Skills vs. Editor Rules* (2026).
  - Gaia Research: *Constrained Autonomy: The Two Dials of Sub-Agent Scope* (arXiv:2505.13360 analysis on over-specification vs. ambiguity) and *Claude 5 Descaffolding Audit* (2026).
