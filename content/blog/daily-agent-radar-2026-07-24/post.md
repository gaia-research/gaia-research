# SkillOpt: Zeroth-Order Parameter Tuning for Agent Skills

*July 24, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

> **The Hook.** You edit your `SKILL.md`. The agent gets a little better. You edit it again. Maybe worse. You add a warning. Somehow it triggers more often now. This is not bad luck — it's unmonitored text-space drift. **SkillOpt** (Microsoft Research, 2026) turns that loop into a real optimization procedure: a frozen agent runs tasks, a separate optimizer model reads what went wrong, and only edits that clear a strict validation gate make it into the skill file.

[[YOUTUBE_EMBED]]

---

## What SkillOpt Actually Does

SkillOpt treats the skill file as the *trainable parameter* of a frozen agent. The agent model itself is never touched. Instead:

1. **Forward pass — collect rollouts.** The frozen agent runs a batch of tasks using the current skill file. Each trajectory is scored pass/fail.
2. **Backward pass — minibatch reflection.** A high-capacity optimizer model (a separate LLM) reads the failure and success batches, consults a buffer of previously rejected edits, and proposes structured patches: additions, deletions, replacements.
3. **Validation gate.** The candidate skill is evaluated on a held-out selection split. It only replaces the current skill if `score_candidate > score_current`. Most proposed edits are rejected here.
4. **Rejected-edit buffer.** Failed edits feed back into the next optimizer prompt as negative constraints — the optimizer learns what not to try again within the epoch.
5. **Slow/meta update.** At the end of each epoch, a longitudinal review inserts durable lessons into a protected region of the skill file and updates an optimizer-only meta-prompt that refines search direction across epochs.

[[PARAMETER_PERTURBATION_FLOWCHART]]

There is no differentiable loss function. The validation split accuracy — a plain scalar score averaged over held-out tasks — is the only signal that gates updates. This is what makes it gradient-free: the optimizer model proposes edits using natural language reasoning over trajectories, not numerical gradients.

---

## What a SkillOpt Loop Looks Like in Practice

The before/after contrast tells the story better than any diagram. A manually vibe-checked skill accumulates polite hedging. A SkillOpt-tuned skill compresses toward bounded directives.

### Unmanaged Manual Skill (Vibe-Checked)

```markdown
# Component Builder Skill

Please use this skill whenever you need to build React components.

Instructions:
- Make sure to carefully create clean, well-structured, maintainable TypeScript React code.
- Always try your best to export named functional components.
- Please ensure you check whether props need interfaces. If so, create a prop interface.
- Think step-by-step before implementing any component logic.
- Avoid placing styling in separate CSS files if Tailwind CSS can be used instead.
- If you run into state issues, please refer to our internal state guidelines.
```

### SkillOpt-Tuned Skill (After Optimization)

```markdown
# react-component-builder

Trigger ONLY when creating or modifying React components in `src/components/`.
Do NOT trigger for API routes (`src/api/`), Tailwind configs, or unit tests.

## Directives
- Export named components: `export function ComponentName(props: ComponentNameProps)`.
- Enforce explicit TypeScript prop interfaces; do NOT use `any` or inline types.
- For shared state spanning >2 components, load `references/state-management.md`.
- Keep component files under 150 lines; split sub-views into `src/components/ui/`.
```

The optimized version cuts word count, eliminates conversational filler, and adds explicit negative trigger boundaries — all patterns the optimizer model learns to prefer because they reduce false-trigger failures in rollouts.

---

## The Numbers From the Paper

These are real benchmark results from the SkillOpt paper across six tasks, three harnesses:

[[ZO_OPTIMIZATION_LOOP_GRAPH]]

| Task | Baseline | SkillOpt (GPT-5.5) | Lift |
| :--- | :--- | :--- | :--- |
| SpreadsheetBench | 41.8% | **80.7%** | +38.9 pts |
| OfficeQA | 33.1% | **72.1%** | +39.0 pts |
| LiveMath | 37.6% | **66.9%** | +29.3 pts |
| ALFWorld | 83.6% | **95.5%** | +11.9 pts |
| DocVQA | 78.8% | **91.2%** | +12.4 pts |
| SearchQA | 77.7% | **87.3%** | +9.6 pts |

Average lift: **+23.5 points** across all tasks in direct-chat mode. Cross-harness transfer is the surprising result: a skill optimized under Codex transferred to Claude Code with a **+59.7 point** improvement on SpreadsheetBench (22.1% → 81.8%).

The optimization is strict. The median accepted-edit count is **2.5 edits per run** — the validation gate rejects the bulk of what the optimizer proposes. Final skill files land at roughly 380–2,000 tokens depending on task complexity.

---

## One Thing to Do Differently

Before you next edit a `SKILL.md` by intuition, write down one measurable assertion first: *"after this edit, the agent should pass X on task Y."* Run it. That single step — defining a validation criterion before editing — is the minimum viable version of what SkillOpt formalizes at scale.

---

**Source:** Yang et al., *SkillOpt: Executive Strategy for Self-Evolving Agent Skills*, Microsoft Research, 2026. [arXiv:2605.23904](https://arxiv.org/abs/2605.23904) · [GitHub](https://github.com/microsoft/SkillOpt) · [Microsoft Research Blog](https://www.microsoft.com/en-us/research/blog/skillopt-agent-skills-as-trainable-parameters/)
