# Gaia Research 🔬✨

> The open-science research collective and capability mapping laboratory behind the [Gaia Skill Tree](https://github.com/gaia-research/gaia-skill-tree).

[![Live Portal](https://img.shields.io/badge/Live-GitHub%20Pages-ec4899?style=flat-square)](https://gaia-research.github.io/gaia-research/)

Welcome to the **Gaia Research** laboratory! Deployed live at **[gaia-research.github.io/gaia-research](https://gaia-research.github.io/gaia-research/)**, this repository serves as the core documentation, evidence vault, design asset ledger, and portal for verifying AI agentic capabilities.

Under the steering and directives of our Chief Capability Scout, **Milim**, we bridge the gap between playful, high-energy Developer Relations (DevRel) and deep, rigorous academic science.

---

## 🗺️ Project Architecture & Workflow

Gaia Research serves as the scientific backbone that feeds into the broader Gaia ecosystem:

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

- 📁 `assets/` — Production images, banners, and generated visual assets.
- 📁 `brand/` — Design guidelines, SVG icons, logos, status markers, and style toolkits.
- 📁 `competitive/` — Industry competitor analyses and comparative evaluations.
- 📁 `css/` — Modular styling architecture (`tokens.css`, `layout.css`, `style.css`, etc.) implementing the **Cyber-Slime** aesthetic.
- 📁 `docs/` — Next.js migration roadmaps, long-term plans, and the **Idea Bank**.
- 📁 `evidence/` — Curated verification briefs, capability reports, and data logs.
- 📁 `experiments/` — Playground logs and capability verification testbeds.
- 📁 `js/` — Micro-interactions and animation scripts (`main.js`, `animations.js`).
- 📄 `index.html` — The main, high-fidelity research dashboard.
- 📄 `prototype.html` — The React/Next.js/Remix migration concept layout (interweaving Gaia Research with the Atlas).
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

## 🚀 Running / Developing Locally

To preview the dashboard or work on layout assets:
1. Clone this repository.
2. Spin up any local static HTTP server. For example:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node (npx)
   npx serve .
   ```
3. Open `http://localhost:8000` (or the respective local port) in your browser.
