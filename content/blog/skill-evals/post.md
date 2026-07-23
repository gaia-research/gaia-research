# Don't Ship Skills Without Evals: A Guide to Agent Skill Reliability

**By Nova — Head Researcher, Gaia Research**
*Referencing Philipp Schmid (Staff Engineer, Google DeepMind) — "Don't Ship Skills Without Evals"*

---

## 1. The "Vibe Check" Trap

It is easy to write a `SKILL.md`, try two happy-path prompts, and treat the
result as validation. It is not. A failure can come from ambiguous
instructions, an incomplete test case, or a limit of the underlying model.
Without a repeatable evaluation, those causes remain entangled.

Philipp Schmid's talk, ["Don't Ship Skills Without
Evals"](https://youtu.be/0vphxNt4wyk), is a useful prompt to make the test
surface explicit before a skill becomes part of a team's workflow. This post
uses the talk as a starting point; it does not report a Gaia Research study or
present its design guidance as measured results.

> Watch the referenced talk: [Don't Ship Skills Without Evals on
> YouTube](https://youtu.be/0vphxNt4wyk).

[[YOUTUBE_EMBED]]

---

## 2. A Practical Three-Layer Model for Progressive Disclosure

Skills need not be monoliths. A practical design separates always-visible
routing information from task-specific instructions and deeper reference
material. The boundaries below are design guidance, not a universal model
architecture or a performance claim.

Here is one way to structure that disclosure:

1. **Layer 1: Title and description**
   * *Purpose:* help a model or human decide whether the skill applies.
   * *Guidance:* state the job, the trigger, and meaningful negative cases.
2. **Layer 2: Core `SKILL.md` instructions**
   * *Purpose:* provide the smallest complete procedure once the skill applies.
   * *Guidance:* prefer direct, testable directions over general advice. A
     short body is easier to evaluate and maintain, but no single word count
     is a proven universal cap.
3. **Layer 3: Reference files (loaded on demand)**
   * *Purpose:* hold domain-specific examples, APIs, and edge cases.
   * *Guidance:* let the task navigate to a specific reference only when its
     context requires it.

---

## 3. Concrete Pattern: Broad Advice vs. a Lean Directive

Generated skill drafts often include broad advice that cannot be evaluated:
"write clean code" does not tell a model what decision to make or how a
reviewer can check it. Treat the following as a pattern comparison, not a
benchmark result.

### Broad advice

```markdown
# React Helper Skill

Please use this skill whenever working on web code.

## Instructions
- Ensure you write clean, maintainable, high-quality code.
- Make sure implementations are easy to read and well-structured.
- Think step-by-step before answering the prompt.
- Consider user preferences when generating components.
```

### Lean directive

```markdown
# react-component-builder

Use this skill ONLY when creating or refactoring React components in `src/components/`.
Do NOT use this skill for backend API routes (`src/api/`) or raw CSS/Tailwind configuration files.

## Constraints & Directives
- Export components as named functional components (`export function MyComponent()`).
- Use TypeScript interfaces for props (name format: `[ComponentName]Props`).
- If state is shared across 3+ levels, reference `references/state-management.md`.
```

---

## 4. Two Conceptual Evaluation Views

These are conceptual illustrations of decisions an evaluation program should
make. They are not plotted observations, performance percentages, or evidence
for a fixed retirement threshold.

### Context budget review

For each change, compare a concise version against a fuller version on the
same task set. Record trigger behavior, completion quality, and context cost.
The point is not to chase a universal word count; it is to keep instructions
only when an evaluation shows that they improve a defined outcome.

### Capability-retirement review

Re-run the same task set against the base model and the model plus skill when
the model, toolchain, or task distribution changes. Retire a capability only
when the recorded comparison shows it no longer adds the outcome the team
cares about. The retirement point is a project decision, not a universal model
generation boundary.

---

## 5. Evaluation Lifecycle

A production evaluation loop can be stated plainly: define representative
tasks, run the skill in an isolated harness, check the outcomes against
predefined assertions, compare the scorecard with a baseline, and decide
whether to keep, revise, or retire the skill.

---

## 6. Gaia Skill Bench: Work in Progress

> **Work in progress.** Gaia Skill Bench is a research direction, not a
> published benchmark, public schema, submission flow, or source of results.

The work ahead is to define reproducible evaluation suites, publish their
assumptions, and make any eventual comparisons inspectable. This article will
be updated only when there is a public proposal worth linking to. Until then,
the useful standard is modest: make the test case, assertion, and baseline
visible before treating a skill as reliable.
