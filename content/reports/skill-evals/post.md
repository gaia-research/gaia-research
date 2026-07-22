# Don't Ship Skills Without Evals: A Guide to Agent Skill Reliability

**By Marcus Tiongson · Gaia Research**  
*Referencing Philipp Schmid (Staff Engineer, Google DeepMind) — "Don't Ship Skills Without Evals"*

---

## 1. The "Vibe Check" Trap

Let me start with the actual telemetry of AI agent skills in production.

When building an agent skill, it's easy to write a `SKILL.md` file, test it manually twice, watch it succeed, and merge it. But manual confirmation on two happy-path runs is not verification.

As Philipp Schmid (Staff Engineer at Google DeepMind working on Gemini and Gemma) highlighted in his talk, indexing benchmarks like *Skillsbench* evaluated over **50,000 skills published on GitHub**—and almost **none of them carried automated evals**. They were vibe-checked over two manual runs, received informal peer approval, and shipped.

> *"You wouldn't merge code without tests—so why are we shipping skills without evals?"*

Agents are non-deterministic systems. When a task execution fails in production, you cannot tell without evals whether the failure was caused by an ambiguous skill description or an intrinsically over-complex prompt. Evals turn educated guesses into actionable telemetry.

<div className="video-embed-container">
  <iframe 
    src="https://www.youtube-nocookie.com/embed/0vphxNt4wyk" 
    title="Don't Ship Skills Without Evals — Philipp Schmid, Google DeepMind"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowFullScreen
  />
</div>

---

## 2. Architecture Breakdown: The 3 Layers of Progressive Disclosure

Skills are structured around **progressive disclosure**. Forcing long instructions into global system prompts wastes context budget and degrades reasoning focus.

DeepMind structures skill context into three discrete layers:

1. **Layer 1: Title & Description (~100–200 tokens)**
   * *Scope:* Ingested into system instructions on every turn.
   * *Context Tax:* Paid continuously, even when the skill is idle.
   * *Directive:* Explicitly define **WHY**, **WHEN**, and **HOW**—including negative cases (when *NOT* to trigger). Ambiguous descriptions account for ~50% of skill invocation failures.
2. **Layer 2: Core `SKILL.md` Body (<500 Words)**
   * *Scope:* Read into context only when the agent selects the skill.
   * *Directive:* Enforce a strict ceiling under 500 words. Use clear directives (*"Use the Interactions API when building chat features"*), avoiding passive phrasing.
3. **Layer 3: Reference Files (Loaded On-Demand)**
   * *Scope:* Auxiliary documentation (`references/aws.md`, `references/gcp.md`).
   * *Directive:* Allow the agent to navigate specific sub-paths only when domain context demands it.

---

## 3. Concrete Pattern: AI-Generated Bloat vs. Lean Directive Skill

A primary failure mode in modern agent setups is **AI-generated skill bloat**. LLMs tasked with writing skill files routinely introduce **no-ops**—instructions that consume token budget without altering agent execution paths.

### ❌ Bloated "Vibe-Checked" Skill (AI-Generated Anti-Pattern)

```markdown
<!-- Bad: 800 words, passive instructions, no-ops, missing negative triggers -->
# React Helper Skill

Please use this skill whenever working on web code. 

## Instructions
- Ensure you write clean, maintainable, high-quality code.
- Make sure implementations are easy to read and well-structured.
- Think step-by-step before answering the prompt.
- Consider user preferences when generating components.
- Step 1: Read the project files.
- Step 2: Identify React components.
- Step 3: Edit the component file.
- Step 4: Verify that there are no syntax errors.
```

### ✅ Clean Gaia Skill (Lean, Directive, No-Op Free)

```markdown
<!-- Good: 120 words, directive, explicit negative triggers, zero no-ops -->
# react-component-builder

Use this skill ONLY when creating or refactoring React components in `src/components/`. 
Do NOT use this skill for backend API routes (`src/api/`) or raw CSS/Tailwind configuration files.

## Constraints & Directives
- Export components as named functional components (`export function MyComponent()`).
- Use TypeScript interfaces for props (name format: `[ComponentName]Props`).
- If state is shared across 3+ levels, reference `references/state-management.md`.
```

---

## 4. Visual Skill Evaluation & Lifecycle Telemetry

Evaluating skills systematically across model generations and test sets yields clear performance boundaries.

[CHART_TRIGGER_ACCURACY]

[CHART_RETIREMENT_CURVE]

---

## 5. Visual Asset Placeholder

[IMAGE_PLACEHOLDER_SKILL_ARCH]

---

## 6. How Gaia Research is Building the Planned Skill Benchmark (GSB)

*Note: The **Gaia Skill Bench (GSB)** is an upcoming, planned benchmark framework currently in design and schema specification.*

At **Gaia Research**, our work focuses on evidence-based agent verification rather than developer intuition.

We are designing our planned benchmark ingest engine (`content/schemas/gsb-submission.schema.json`) for the **Gaia Skill Bench (GSB)** to integrate automated evaluation suites directly into the skill registry once GSB goes live.

The planned GSB benchmark specification enforces:
* **Weighted Evaluation Metrics:** Performance (40%), Reliability (30%), Triggering Accuracy (20%), and Efficiency (10%).
* **Automated No-Op Purging:** Detecting and flagging non-functional instructions prior to registry indexation.
* **Ablation Baseline Scorecards:** Verifying whether a skill provides a net capability gain over base model zero-shot performance across foundation model families.

Moving beyond unverified skill deployments requires structured eval suites, systematic ablation testing, and open benchmark standards.

---
*To inspect our candidate schemas, view our submission templates in `content/templates/gsb-submission.json`.*
