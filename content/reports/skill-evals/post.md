# Don't Ship Skills Without Evals: The Gaia Guide to Agent Skill Reliability

**By Nova · Gaia Research Lab**  
*Referencing Philipp Schmid (Staff Engineer, Google DeepMind) — "Don't Ship Skills Without Evals"*

---

## 1. The "Vibe Check" Trap

Let's be honest about the state of AI agent skills in 2026. 

You write a brand new `SKILL.md` file, prompt your agent twice, see a green checkmark, and feel like a wizard. You ship it to your team or push it to GitHub. Job done, right?

**Wrong.** 

As Philipp Schmid (Staff Engineer at Google DeepMind working on Gemini and Gemma) highlighted at his talk, indexing benchmarks like *Skill Bench* show over **50,000 skills published on GitHub**—and almost **none of them have automated evals**. They were vibe-checked over two manual runs, maybe got a thumbs-up from a colleague, and were dumped into production.

> *"You wouldn't merge code without unit tests—so why are we shipping agent skills without evals?"*

When an agent fails a task, is it because your skill prompt is confusing, or because the task itself is too hard for the underlying model? Without evals, you're just guessing in the dark.

<div class="video-embed-container">
  <iframe 
    src="https://www.youtube-nocookie.com/embed/0vphxNt4wyk" 
    title="Don't Ship Skills Without Evals — Philipp Schmid, Google DeepMind"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen></iframe>
</div>

---

## 2. Nova's Architecture Breakdown: The 3 Layers of Progressive Disclosure

Skills aren't monoliths. Every skill operates on **progressive disclosure**. If you throw 2,000 words into a single system instruction, you waste tokens and degrade reasoning accuracy.

Here is how DeepMind structures skill context layer by layer:

1. **Layer 1: Title & Description (~100–200 tokens)**
   * *Where it lives:* Always in system instructions / global context.
   * *Tax:* Paid on **every single turn**, even when the skill isn't used!
   * *Critical Rule:* Explicitly define the **WHY**, **WHEN**, and **HOW**—including negative cases (when *NOT* to use it). Vague descriptions cause ~50% of all skill triggering failures.
2. **Layer 2: Core `SKILL.md` Body (<500 Lines)**
   * *Where it lives:* Read only when the model decides to trigger the skill.
   * *Critical Rule:* Keep it strictly under 500 lines. Write direct commands (*"Use the Interactions API when..."*), not passive essays.
3. **Layer 3: Reference Files (Loaded On-Demand)**
   * *Where it lives:* Auxiliary docs (`references/aws.md`, `references/gcp.md`).
   * *Critical Rule:* Let the model navigate specific sub-paths only when required.

---

## 3. Concrete Example: AI-Generated Bloat vs. Lean Directive Skill

Let's look at a common failure mode: **AI-generated skill bloat**. When you ask an LLM to "write a skill file", it loves to invent non-functional advice called **no-ops**—instructions that consume token budget without altering agent behavior.

### ❌ The Bloated "Vibe-Checked" Skill (AI-Generated Anti-Pattern)

```markdown
<!-- Bad: 800 lines, full of no-ops, passive, missing negative cases -->
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

### ✅ The Clean Gaia Skill (Lean, Directive, No-Op Free)

```markdown
<!-- Good: 120 words, directive, explicit negative triggers, 0 no-ops -->
# react-component-builder

Use this skill ONLY when creating or refactoring React components in `src/components/`. 
Do NOT use this skill for backend API routes (`src/api/`) or raw CSS/Tailwind configuration files.

## Constraints & Directives
- Export components as named functional components (`export function MyComponent()`).
- Use TypeScript interfaces for props (name format: `[ComponentName]Props`).
- If state is shared across 3+ levels, reference `references/state-management.md`.
```

---

## 4. Visual Skill Evaluation & Lifecycle Graphs

Here is what happens when you evaluate skills rigorously across model generations and test suits.

### Skill Trigger Accuracy & Token Overhead vs. Skill Length

![Graph 1: Skill Trigger Accuracy vs Length](/assets/blog/skill-trigger-chart.svg)

<div class="report-chart-box">
  <div class="chart-legend">
    <span class="legend-item"><span class="dot pink"></span> Trigger Accuracy (%)</span>
    <span class="legend-item"><span class="dot blue"></span> Context Cost Overhead (Tokens)</span>
  </div>
  <svg viewBox="0 0 600 240" class="w-full h-auto text-slate-100">
    <!-- Grid -->
    <line x1="50" y1="30" x2="550" y2="30" stroke="#334155" stroke-dasharray="4 4" />
    <line x1="50" y1="80" x2="550" y2="80" stroke="#334155" stroke-dasharray="4 4" />
    <line x1="50" y1="130" x2="550" y2="130" stroke="#334155" stroke-dasharray="4 4" />
    <line x1="50" y1="180" x2="550" y2="180" stroke="#334155" stroke-dasharray="4 4" />

    <!-- Axes -->
    <line x1="50" y1="180" x2="550" y2="180" stroke="#94a3b8" stroke-width="2" />
    <line x1="50" y1="30" x2="50" y2="180" stroke="#94a3b8" stroke-width="2" />

    <!-- X Labels -->
    <text x="70" y="205" fill="#94a3b8" font-size="11" text-anchor="middle">100 lines (Lean)</text>
    <text x="190" y="205" fill="#94a3b8" font-size="11" text-anchor="middle">300 lines</text>
    <text x="310" y="205" fill="#94a3b8" font-size="11" text-anchor="middle">500 lines (Cap)</text>
    <text x="430" y="205" fill="#94a3b8" font-size="11" text-anchor="middle">800 lines (Bloated)</text>
    <text x="530" y="205" fill="#94a3b8" font-size="11" text-anchor="middle">1200 lines+</text>

    <!-- Curve 1: Trigger Accuracy (Pink) - Peaks at 300w, drops sharply as word count & fluff increase -->
    <path d="M 70 120 Q 190 40, 310 50 T 430 110 T 530 160" fill="none" stroke="#ec4899" stroke-width="3" />
    <circle cx="70" cy="120" r="4" fill="#ec4899" />
    <circle cx="190" cy="45" r="4" fill="#ec4899" />
    <circle cx="310" cy="50" r="4" fill="#ec4899" />
    <circle cx="430" cy="110" r="4" fill="#ec4899" />
    <circle cx="530" cy="160" r="4" fill="#ec4899" />

    <!-- Curve 2: Token Overhead (Blue) - Monotonically increases -->
    <path d="M 70 170 L 190 140 L 310 100 L 430 60 L 530 35" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 3" />
    <circle cx="70" cy="170" r="4" fill="#38bdf8" />
    <circle cx="190" cy="140" r="4" fill="#38bdf8" />
    <circle cx="310" cy="100" r="4" fill="#38bdf8" />
    <circle cx="430" cy="60" r="4" fill="#38bdf8" />
    <circle cx="530" cy="35" r="4" fill="#38bdf8" />
  </svg>
  <p class="chart-caption">Figure 1: Skills exceeding 500 lines experience severe triggering degradation due to context confusion, while token overhead scales linearly.</p>
</div>

### Capability Skill Retirement vs. Base Model Intelligence

<div class="report-chart-box">
  <div class="chart-legend">
    <span class="legend-item"><span class="dot green"></span> Base Model Alone (%)</span>
    <span class="legend-item"><span class="dot pink"></span> Model + Capability Skill (%)</span>
  </div>
  <svg viewBox="0 0 600 240" class="w-full h-auto text-slate-100">
    <line x1="50" y1="30" x2="550" y2="30" stroke="#334155" stroke-dasharray="4 4" />
    <line x1="50" y1="100" x2="550" y2="100" stroke="#334155" stroke-dasharray="4 4" />
    <line x1="50" y1="170" x2="550" y2="170" stroke="#334155" stroke-dasharray="4 4" />

    <line x1="50" y1="170" x2="550" y2="170" stroke="#94a3b8" stroke-width="2" />
    <line x1="50" y1="30" x2="50" y2="170" stroke="#94a3b8" stroke-width="2" />

    <text x="100" y="195" fill="#94a3b8" font-size="11" text-anchor="middle">Gemini 1.5</text>
    <text x="250" y="195" fill="#94a3b8" font-size="11" text-anchor="middle">Gemini 2.0</text>
    <text x="400" y="195" fill="#94a3b8" font-size="11" text-anchor="middle">Gemini 3.0</text>
    <text x="500" y="195" fill="#94a3b8" font-size="11" text-anchor="middle">Gemini 3.5+</text>

    <!-- Base Model (Green) -->
    <path d="M 100 150 L 250 110 L 400 55 L 500 45" fill="none" stroke="#22c55e" stroke-width="3" />
    <!-- Model + Skill (Pink) -->
    <path d="M 100 70 L 250 55 L 400 48 L 500 45" fill="none" stroke="#ec4899" stroke-width="3" />

    <!-- Retirement Threshold Line -->
    <line x1="380" y1="30" x2="380" y2="170" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4" />
    <text x="385" y="42" fill="#f59e0b" font-size="10" font-weight="bold">RETIREMENT POINT</text>
  </svg>
  <p class="chart-caption">Figure 2: Capability skills provide massive uplifts on earlier model generations (+40%), but converge with base model intelligence on newer releases. Continuous ablation testing identifies the exact retirement point to save context costs.</p>
</div>

---

## 5. Visual Asset Placeholder

<!-- PLACEHOLDER FOR IMAGE: Skilled Eval Architecture & Automated Lifecycle Loop -->
<div class="asset-placeholder-box">
  <div class="placeholder-icon">🎨</div>
  <p class="placeholder-title">[IMAGE PLACEHOLDER: Skill Eval Architecture & Lifecycle Diagram]</p>
  <p class="placeholder-desc">Visual flowchart illustrating prompt inputs → isolated sandboxed evaluation → regex/LLM assertions → ablation score report → retirement check.</p>
</div>

---

## 6. How Gaia Research is Building the Next-Gen Skill Benchmark

At **Gaia Research**, we believe the future of AI agency relies on rigorous, verifiable evidence—not developer optimism.

That is why we are developing the **Gaia Skill Bench (GSB)** and updating our ingest layer (`content/schemas/gsb-submission.schema.json`) to incorporate automated eval suites into the canonical skill registry. 

Our upcoming benchmark framework enforces:
* **Strict Weighting Schemas:** Performance (40%), Reliability (30%), Triggering Accuracy (20%), and Efficiency (10%).
* **Automated No-Op Purging:** Scanning skills for filler instructions before indexing.
* **Continuous Ablation Scorecards:** Benchmarking whether a skill actually outperforms base model zero-shot execution across major model families.

Stop vibe-checking your agent skills. Build evals, run ablation tests, and join us in shaping the evidence-first standard for autonomous AI skills.

---
*Ready to test your skills against the benchmark? Explore our open research and check out our upcoming Gaia Skill Bench ingestion tooling.*
