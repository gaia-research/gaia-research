# INTENT.md: Harness or Process Theater?

*August 25, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

You watch an AI coding agent generate 300 lines of flawless TypeScript in six seconds. The tests pass, the types check out, and you take a sip of your morning coffee. Then you open `git diff`—and realize it quietly refactored your auth database, rewrote your middleware, and imported three unvetted npm packages.

Nobody told it what *not* to touch.

Code generation is no longer the engineering bottleneck. The bottleneck has split in two: **intent formulation** (drawing hard boundaries before the model generates a single token) and **deterministic verification** (compiling those constraints into automated test gates that reject rogue diffs).

In August 2026, Anthropic's Applied AI team published [The AI-Native SDLC Playbook](https://academy.claude.com/courses/ai-native-sdlc-playbook/capture-intent), proposing a root artifact to solve this: `intent.md`. Work begins with a version-controlled proto-spec feeding a three-tier chain:

$$\text{intent.md} \longrightarrow \text{spec.md} \longrightarrow \text{plan.md} \longrightarrow \text{code diff}$$

Is `intent.md` a vital constraint harness—or just the next layer of corporate process theater?

[[FIGURE_BOTTLENECK_SHIFT]]

---

## Why markdown in Git changes economics for agents

For human teams, design docs rot. Updating markdown during an outage is high-friction work with zero instant reward, so prose and code drift apart within weeks.

Agents flip this equation. In an agent workflow, markdown isn't passive documentation—it is a **machine-executable control harness**:

- **Anchors negative constraints:** A pinned `intent.md` prevents context drift across 30+ turns without repeating yourself.
- **Compiles into test gates:** Agents turn acceptance criteria into failing test assertions before touching production logic.
- **Branches with Git:** Branching code branches intent; reverting a commit rolls back the spec.

[[FIGURE_ARTIFACT_PIPELINE]]

---

## The four tiers: from invariant to AST mutation

Anthropic's playbook formalizes the lifecycle into four decoupled layers:

| Tier | Artifact | Primary Owner | Content & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Tier 0** | `intent.md` | Human Originator / Lead | The *why*, business outcomes, non-negotiable invariants, risk classification, and explicit non-goals. |
| **Tier 1** | `spec.md` | Agent + Product Owner | Formal contracts, schema definitions, latency budgets, and security boundaries, constrained by organizational skills. |
| **Tier 2** | `plan.md` | Agent + Engineer | Ordered execution DAG, target file list, dependency graph, step verification commands, and rollback strategy. |
| **Tier 3** | `CODE DIFF` | Coding Agent Loop | Concrete AST edits, unit and integration test additions, and configuration changes verified by compilers and test runners. |

### Enterprise systems: Git as the single source of truth

Enterprise teams often face a split-brain trap: product managers debate in Jira, while agents build in Git. The fix is **outbound projection**: Git Markdown remains authoritative, and CI hooks automatically sync structured YAML frontmatter to issue trackers:

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

Multi-tier spec chains without discipline hit three reproducible traps:

**1. Spec Slop.** An agent prompts itself into generating a 500-line pseudo-spec packed with defensive boilerplate and imaginary microservices. Fatigued engineers do a five-second vibe check, hit approve, and downstream coding agents treat hallucinated details as immutable requirements.

**2. The Telephone Game 2.0.** Information degrades across generative hops ($\text{Intent} \to \text{Spec} \to \text{Plan} \to \text{Diff}$). Negative constraints—like *"do not touch the auth schema"*—vanish first during summarization. By Tier 3, the coding agent breaks core invariants because it only saw the plan's task list.
  - *The fix:* **Residual skip-connections**. The harness pins Tier 0 (`intent.md`) straight into the Tier 3 coding prompt, and a pre-commit verifier computes:

$$\Delta(\text{Diff}, \text{intent.md}) \longrightarrow \{\text{Scope Violations, Invariant Breaches}\}$$

**3. Context Pollution.** Dumping all four markdown files into every prompt burns 6,000+ tokens per turn (180k+ over 30 turns), diluting model attention and degrading tool call precision.

---

## Contrast: Fluffy spec slop vs. the 50-line Invariant Budget

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

Zero machine-verifiable assertions. Zero negative boundaries. Fifty lines of unfalsifiable marketing prose.

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

Every line is a negative boundary, a contract interface, or an executable verification command.

---

## The practitioner framework: Tiered governance

Not every one-line fix needs a four-tier pipeline. Mandating `intent.md` for CSS padding is pure process theater. Calibrate rigor to blast radius:

[[FIGURE_GOVERNANCE_MATRIX]]

| Tier | Scope | Artifact Strategy | Verification Gate |
| :--- | :--- | :--- | :--- |
| **Tier 1: Tactical** | Bugfixes, CSS tweaks, single-file edits | Direct prompt-to-diff. No standalone markdown artifacts. | Standard unit tests and linters pass. |
| **Tier 2: Standard** | Multi-file features, internal APIs | **Ephemeral intent** captured in the Issue/PR body; inline test plan. | TDD assertions pass; diff matches issue scope. |
| **Tier 3: Architectural** | Auth rewrites, schema migrations, subagent fan-outs | Full four-tier chain (`intent.md` $\to$ `spec.md` $\to$ `plan.md`). | CI AST diff-scope analyzer, signed commits. |

---

## What to do with this

`intent.md` is a **deterministic constraint harness for stochastic code generators**—not a silver bullet. Four rules for production:

1. **Cap `intent.md` at 50 lines:** Invariants, non-goals, interfaces, and test commands only. Zero narrative essays.
2. **Wire residual skip-connections:** Always inject Tier 0 invariants directly into the final coding loop, bypassing intermediate summaries.
3. **Ground intent in automated tests:** If a constraint can't be asserted by a test or compiler, treat it as advisory.
4. **Scale by blast radius:** Reserve full four-tier chains for high-risk architectural work; use lightweight issue-body intent for daily features.

---

## Sources & Primary Citations

- **Primary Source:** *The AI-Native SDLC Playbook: Capture as intent.md, Requirements & Design (spec.md), and Plan Mode (plan.md)* — Anthropic Applied AI (Claude Academy, August 2026).
- **Harness Implementations:** Claude Code (`plan` mode and `auto` mode), Pi coding agent harnesses, and Git-backed subagent pipelines.
- **Related Research:**
  - Anthropic Engineering: *How to manage Claude Code workflows via CLAUDE.md* and *Agent Skills vs. Editor Rules* (2026).
  - Gaia Research: *Constrained Autonomy: The Two Dials of Sub-Agent Scope* (arXiv:2505.13360 analysis on over-specification vs. ambiguity) and *Claude 5 Descaffolding Audit* (2026).
