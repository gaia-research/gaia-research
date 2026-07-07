# Gaia Research 🔬✨

> The open-science research collective and capability mapping laboratory behind the [Gaia Skill Tree](https://github.com/gaia-research/gaia-skill-tree).

[![Live Portal](https://img.shields.io/badge/Live-GitHub%20Pages-ec4899?style=flat-square)](https://gaia-research.github.io/gaia-research/)

Welcome to the **Gaia Research** laboratory! Deployed live at **[gaia-research.github.io/gaia-research](https://gaia-research.github.io/gaia-research/)**, this repository serves as the core documentation, evidence vault, design asset ledger, and portal for verifying AI agentic capabilities.

<p align="center">
  <img src="./assets/brand/Milim-avatar.png" width="180" alt="Milim — Chief Capability Scout" />
</p>

Under the steering and directives of our Chief Capability Scout, **Milim**, we bridge the gap between playful, high-energy Developer Relations (DevRel) and deep, rigorous academic science.

---

## 🗺️ Project Architecture & Workflow

Gaia Research serves as the scientific backbone that feeds into the broader Gaia ecosystem. For the comprehensive technical and structural details, see [ARCHITECTURE.md](ARCHITECTURE.md).

```
[gaia-research] (This Repo)
       │
       ▼ (Research Ledger, Evidence Briefs, Competitor Analysis)
[marketing-tasks] 
       │
       ▼ (Marketing Claims & Ground-Truth Verification)
[gaia-skill-tree] (The Atlas & Headless Toolkit)
```

### Core Rule
> **Nothing from `gaia-research` is committed directly into `gaia-skill-tree`.**   
> Always follow the standard flow: `gaia-research` ➡️ `marketing-tasks` ➡️ `gaia-skill-tree`.

---

## 📂 Repository Structure

- 📄 `ARCHITECTURE.md` — The complete system architecture, tool pathways, and OAuth/Supabase blueprint.
- 📁 `assets/` — Production images, banners, generated visual assets, brand vectors, and tool mockups.
- 📁 `benchmarks/` — Definitions of benchmarks (specs) and historical execution cached results (runs).
- 📁 `content/` — Dynamic Next.js markdown content, including news updates, release blogs, capability reports, competitor analyses, tool landing docs, and the **Skill Benchmark Ingest Layer** (schemas and templates).
- 📁 `docs/` — Next.js migration roadmaps, long-term plans, and the **Idea Bank**.
- 📁 `experiments/` — Interactive playground concepts, capability verification testbeds, and execution logs.
- 📁 `scripts/` — Build-time ingestion and template generation scripts.
- 📁 `src/` — Next.js application source code, components, layout files, and infrastructure integrations.
- 📄 `PRODUCT.md` — Strategic goals, brand voice (Milim's high-energy academic style), and target audience profiles.
- 📄 `DESIGN.md` — Complete visual system tokens, colors, custom typography rules, and interactive patterns.
- 📄 `CONSOLIDATION_PRD.md` — Phased roadmap for merging the Gaia Research web interface and the Gaia Skill Tree ledger.

---

## 🎨 Visual Design: The Cyber-Slime Laboratory

Gaia Research embraces a high-impact, technical aesthetic featuring:
*   **The Slate-to-Obsidian Canvas:** Sleek, high-contrast dark surfaces.
*   **Brand Highlights:** Vibrant **Milim Pink** (`#ec4899`) for actions and verified states, contrasted with **Rimuru Blue** (`#38bdf8`) for borders and stable navigation.
*   **Bold Typography:** Punchy, ultra-condensed Bebas Neue headings balanced by geometric body text and monospaced HUD readouts.

For detailed design implementation details, see [DESIGN.md](DESIGN.md) and [PRODUCT.md](PRODUCT.md).

---

## 🚀 Running Scripts / Developing Locally

This repository is prepared for Next.js App Router and utilizes Node.js scripts for dynamic build-time content generation:

### 1. Ingestion & Template Generation

To generate JSON templates from benchmark schemas (specifically fetching the benchmark-result schema dynamically from the `gaia-skill-tree` repository or falling back to raw GitHub URLs):

```bash
# Generate dynamic JSON templates from benchmark schemas
npx tsx scripts/generate-templates.ts

# Ingest and prep tool documentation (skill-fuse, gaia-operator)
npx tsx scripts/ingest-tool-docs.ts
```

### 2. Submission Validation

The ingest layer provides a validation script to verify user submission JSON files against either the Gaia Skill Bench (GSB) schema or the general benchmark-result schema:

```bash
# Validate a submission file (detects schema automatically)
npx tsx scripts/validate-submissions.ts content/templates/gsb-submission.json
npx tsx scripts/validate-submissions.ts content/templates/benchmark-submission.json
```

### 2. Next.js App setup (Future)
Future routes and UI elements are componentized under `src/` and read from `content/` and `benchmarks/` data. Set up env variables for GitHub OAuth & Supabase in `.env.local` to connect standard database stubs.
