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

Evaluating skills systematically across model generations and test sets yields clear performance boundaries:

### Skill Trigger Accuracy & Token Overhead vs. Skill Length

<div className="report-chart-box">
  <div className="chart-legend">
    <span className="legend-item"><span className="dot pink"></span> Trigger Accuracy (%)</span>
    <span className="legend-item"><span className="dot blue"></span> Context Cost Overhead (Tokens)</span>
  </div>
  <svg viewBox="0 0 600 240" className="w-full h-auto text-slate-100">
    <line x1="50" y1="30" x2="550" y2="30" stroke="#334155" strokeDasharray="4 4" />
    <line x1="50" y1="80" x2="550" y2="80" stroke="#334155" strokeDasharray="4 4" />
    <line x1="50" y1="130" x2="550" y2="130" stroke="#334155" strokeDasharray="4 4" />
    <line x1="50" y1="180" x2="550" y2="180" stroke="#334155" strokeDasharray="4 4" />

    <line x1="50" y1="180" x2="550" y2="180" stroke="#94a3b8" strokeWidth="2" />
    <line x1="50" y1="30" x2="50" y2="180" stroke="#94a3b8" strokeWidth="2" />

    <text x="70" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">100w (Lean)</text>
    <text x="190" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">300w</text>
    <text x="310" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">500w (Cap)</text>
    <text x="430" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">800w (Bloated)</text>
    <text x="530" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">1200w+</text>

    <path d="M 70 120 Q 190 40, 310 50 T 430 110 T 530 160" fill="none" stroke="#ec4899" strokeWidth="3" />
    <circle cx="70" cy="120" r="4" fill="#ec4899" />
    <circle cx="190" cy="45" r="4" fill="#ec4899" />
    <circle cx="310" cy="50" r="4" fill="#ec4899" />
    <circle cx="430" cy="110" r="4" fill="#ec4899" />
    <circle cx="530" cy="160" r="4" fill="#ec4899" />

    <path d="M 70 170 L 190 140 L 310 100 L 430 60 L 530 35" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 3" />
    <circle cx="70" cy="170" r="4" fill="#38bdf8" />
    <circle cx="190" cy="140" r="4" fill="#38bdf8" />
    <circle cx="310" cy="100" r="4" fill="#38bdf8" />
    <circle cx="430" cy="60" r="4" fill="#38bdf8" />
    <circle cx="530" cy="35" r="4" fill="#38bdf8" />
  </svg>
  <p className="chart-caption">Figure 1: Skills exceeding 500 words experience severe triggering degradation due to context confusion, while token overhead scales linearly.</p>
</div>

### Capability Skill Retirement vs. Base Model Intelligence

<div className="report-chart-box">
  <div className="chart-legend">
    <span className="legend-item"><span className="dot green"></span> Base Model Alone (%)</span>
    <span className="legend-item"><span className="dot pink"></span> Model + Capability Skill (%)</span>
  </div>
  <svg viewBox="0 0 600 240" className="w-full h-auto text-slate-100">
    <line x1="50" y1="30" x2="550" y2="30" stroke="#334155" strokeDasharray="4 4" />
    <line x1="50" y1="100" x2="550" y2="100" stroke="#334155" strokeDasharray="4 4" />
    <line x1="50" y1="170" x2="550" y2="170" stroke="#334155" strokeDasharray="4 4" />

    <line x1="50" y1="170" x2="550" y2="170" stroke="#94a3b8" strokeWidth="2" />
    <line x1="50" y1="30" x2="50" y2="170" stroke="#94a3b8" strokeWidth="2" />

    <text x="100" y="195" fill="#94a3b8" fontSize="11" textAnchor="middle">Gemini 1.5</text>
    <text x="250" y="195" fill="#94a3b8" fontSize="11" textAnchor="middle">Gemini 2.0</text>
    <text x="400" y="195" fill="#94a3b8" fontSize="11" textAnchor="middle">Gemini 3.0</text>
    <text x="500" y="195" fill="#94a3b8" fontSize="11" textAnchor="middle">Gemini 3.5+</text>

    <path d="M 100 150 L 250 110 L 400 55 L 500 45" fill="none" stroke="#22c55e" strokeWidth="3" />
    <path d="M 100 70 L 250 55 L 400 48 L 500 45" fill="none" stroke="#ec4899" strokeWidth="3" />

    <line x1="380" y1="30" x2="380" y2="170" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
    <text x="385" y="42" fill="#f59e0b" fontSize="10" fontWeight="bold">RETIREMENT POINT</text>
  </svg>
  <p className="chart-caption">Figure 2: Capability skills provide significant uplifts on earlier model generations (+40%), but performance converges as base models mature. Continuous ablation testing identifies the exact point where a skill can be safely retired.</p>
</div>

---

## 5. Visual Asset Placeholder

<!-- PLACEHOLDER FOR IMAGE: Skilled Eval Architecture & Automated Lifecycle Loop -->
<div className="asset-placeholder-box">
  <div className="placeholder-icon">🎨</div>
  <p className="placeholder-title">[IMAGE PLACEHOLDER: Skill Eval Architecture & Lifecycle Diagram]</p>
  <p className="placeholder-desc">Visual flowchart illustrating prompt inputs → isolated sandboxed evaluation → regex/LLM assertions → ablation score report → retirement check.</p>
</div>

---

## 6. How Gaia Research is Building the Next-Gen Skill Benchmark

At **Gaia Research**, our work focuses on evidence-based agent verification rather than developer intuition.

We are updating our benchmark ingest engine (`content/schemas/gsb-submission.schema.json`) for the **Gaia Skill Bench (GSB)** to integrate automated evaluation suites into the skill registry.

The GSB benchmark specification enforces:
* **Weighted Evaluation Metrics:** Performance (40%), Reliability (30%), Triggering Accuracy (20%), and Efficiency (10%).
* **Automated No-Op Purging:** Detecting and flagging non-functional instructions prior to registry indexation.
* **Ablation Baseline Scorecards:** Verifying whether a skill provides a net capability gain over base model zero-shot performance across foundation model families.

Moving beyond unverified skill deployments requires structured eval suites, systematic ablation testing, and open benchmark standards.

---
*To benchmark your skills against our open schemas, inspect our submission templates in `content/templates/gsb-submission.json`.*
