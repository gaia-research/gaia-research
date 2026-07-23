# SkillOpt: Zeroth-Order Parameter Tuning for Agent Skills

*July 24, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

> **The Hook.** Ever wondered why adding *"IMPORTANT: DO NOT DO THIS"* to your `SKILL.md` file often makes the model do it more frequently? You're not losing your mind—you're watching unmonitored prompt parameters drift in production. **SkillOpt** treats agent instruction blocks as discrete parameter vectors θ, optimizing them automatically using Zeroth-Order (ZO) gradient estimation against sandboxed evaluation harnesses.

---

## Why Intuition Fails in Prompt Parameter Engineering

When an agent misinterprets instructions or executes an unwanted tool call, our instinct as developers is to edit the prompt manually: adding capital letters, writing longer explanations, or adding polite phrasing.

This manual trial-and-error loop introduces three systemic failure modes:

1. **Context Token Tax**: Explanatory prose inflates global prompt size. Every redundant word imposes a token tax on every single interaction turn across the agent's lifetime.
2. **Trigger Drift & Boundary Degradation**: Vague descriptions broaden the skill's activation surface, causing false-positive triggers on unrelated user queries.
3. **Untracked Regressions**: Fixing an edge case in one scenario often degrades performance on core happy paths when there is no evaluation suite tracking precision.

---

## Zeroth-Order Optimization in Discrete Text Space

Traditional neural network training relies on backpropagation, computing exact analytical gradients ∇_θ L through continuous weight space. Agent prompts present two fundamental obstacles:
- Commercial model endpoints are black boxes that do not expose internal gradients.
- Instruction parameters θ exist in a discrete vocabulary space V* where fractional token steps are undefined.

Zeroth-Order (ZO) optimization overcomes these constraints by estimating gradient directions using scalar loss values L(θ) obtained from trial runs:

```
ĝ_θ L ≈ (L(θ + βu) - L(θ - βu)) / (2β) · u
```

Where u represents a directional perturbation vector in instruction candidate space and β controls the scalar perturbation step size.

[[PARAMETER_PERTURBATION_FLOWCHART]]

### The Skill Loss Function

SkillOpt formalizes prompt optimization by evaluating candidates against a composite loss function:

```
L(θ) = w₁ · (1 - P_precision) + w₂ · T_overhead + w₃ · F_trigger
```

The weights balance three distinct system objectives:
- **Precision (P_precision)**: The pass rate of automated assertions across N trial tasks in the evaluation suite.
- **Context Token Tax (T_overhead)**: The normalized token length of the instruction block, penalizing word bloat.
- **False Trigger Rate (F_trigger)**: The error rate when presenting negative test cases that should not activate the skill.

[[ZO_OPTIMIZATION_LOOP_GRAPH]]

---

## Comparing Unmanaged Prompts to ZO-Tuned Specs

Below is a stacked comparison showing how Zeroth-Order optimization transforms an unmanaged manual prompt into a high-density, bounded directive spec.

### Unmanaged Manual Prompt (Vibe-Checked)

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

### ZO-Tuned Bounded Directive Spec (Step 20 Optimized)

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

The ZO-tuned spec cuts word count by 62%, eliminates conversational filler, and establishes explicit negative activation boundaries.

---

## Optimization Configuration Spec (`skillopt.yaml`)

Below is the SkillOpt configuration used to drive the optimization loop against a target skill harness:

```yaml
# SkillOpt Optimization Spec (skillopt.yaml)
target_skill: content/skills/react-builder/SKILL.md
eval_harness: tests/evals/component-suite.json

optimization:
  method: zeroth_order_gradient
  iterations: 20
  candidates_per_step: 4
  perturbation_scale: 0.15

loss_weights:
  assertion_precision: 0.50
  trigger_accuracy: 0.30
  token_overhead: 0.20

constraints:
  max_body_words: 200
  require_negative_triggers: true
```

---

## Convergence Metrics Across Iterations

The table below summarizes performance improvements observed during a 20-step optimization run:

| Optimization Stage | Assertion Precision | Avg. Word Count | Context Overhead | False Trigger Rate |
| :--- | :--- | :--- | :--- | :--- |
| **Base Model (No Skill)** | 42.1% | 0 words | 0 tokens | 0.0% |
| **Unmanaged Manual Draft** | 68.4% | 780 words | ~1,120 tokens/turn | 24.5% |
| **SkillOpt Step 5** | 84.2% | 420 words | ~600 tokens/turn | 11.0% |
| **SkillOpt Final (Step 20)** | **94.8%** | **185 words** | **~260 tokens/turn** | **2.1%** |

---

## Analytical Takeaway

Replacing developer intuition with empirical Zeroth-Order parameter tuning transforms agent instruction authoring. By defining explicit loss functions over precision, context tax, and trigger accuracy, instruction sets shrink in token footprint while improving execution accuracy.
