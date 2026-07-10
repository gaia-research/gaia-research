# Gaia Research 🔬✨

> The open-science research collective and capability mapping laboratory behind the [Gaia Skill Tree](https://github.com/gaia-research/gaia-skill-tree).

[![Live Portal](https://img.shields.io/badge/Live-GitHub%20Pages-ec4899?style=flat-square)](https://gaia-research.github.io/gaia-research/)

Welcome to the **Gaia Research** laboratory! Deployed live at **[gaia-research.github.io/gaia-research](https://gaia-research.github.io/gaia-research/)**, this repository serves as the core documentation, evidence vault, design asset ledger, and portal for verifying AI agentic capabilities.

<p align="center">
  <img src="./assets/brand/Milim-avatar.png" width="120" alt="Milim — Chief Capability Scout" />
</p>

Under the steering and directives of our Chief Capability Scout, **Milim**, we bridge the gap between playful, high-energy Developer Relations (DevRel) and deep, rigorous academic science.

---

## 🚦 What This Repo Is (Right Now)

Gaia Research is in the middle of a migration. Three things live here today:

1. **A Jekyll-served GitHub Pages site.** The landing page at [gaia-research.github.io/gaia-research](https://gaia-research.github.io/gaia-research/) is rendered from this README via Jekyll (`_config.yml`, `jekyll-seo-tag`). `baseurl` is `/gaia-research` — factor that into absolute paths.
2. **A staging ground for a future Next.js App Router site.** `src/`, `content/`, and `docs/` are being populated for the consolidation described in [`CONSOLIDATION_PRD.md`](CONSOLIDATION_PRD.md). **There is no `package.json` yet** — `npm run dev` will not work. The Next.js surface is planned, not shipped.
3. **The Skill Benchmark Ingest Layer.** Standalone TypeScript scripts under `scripts/` fetch benchmark schemas from the sibling `gaia-skill-tree` repo and validate contributor submissions. This part is runnable today (see [Running Scripts](#-running-scripts) below).

If you're an agent working in this repo, also read [`CLAUDE.md`](CLAUDE.md) — it captures the non-obvious constraints (schema-vs-validator drift, ecosystem boundary rules, the ingest fetch chain).

---

## 🗺️ Project Architecture & Workflow

Gaia Research serves as the scientific backbone that feeds into the broader Gaia ecosystem. For the comprehensive technical and structural details, see [`ARCHITECTURE.md`](ARCHITECTURE.md).

```
[gaia-research] (This Repo — the lab & future portal)
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

Schemas cached in `content/schemas/` are **derived output** from upstream `gaia-skill-tree`, not source. If you need to change a schema's shape, change it upstream and regenerate here.

---

## 🧰 Official Skills

Installable Claude Code / Cursor / Windsurf skills published by Gaia Research. Each is a single-purpose tool with a one-line `curl` install and no config. All are **local-first** — they run against your files and never upload their contents.

| Skill | What it does | Repo |
| :--- | :--- | :--- |
| **context-diet** | Measure + compact an oversized agent-context file (`CLAUDE.md`, `.cursorrules`, `AGENTS.md`, a system prompt) under the harness char limit **without losing a rule**. Runs a compaction bake-off scored on rule faithfulness. Output of [Context Diet — Lab 001](content/reports/context-diet-lab-001). | [gaia-research/skill-context-diet](https://github.com/gaia-research/skill-context-diet) |
| **ci-churn** | GitHub Actions cost analyzer & flaky-test detector for PRs. Measures wasted CI compute, classifies commits as feature vs ci-fix, and generates pre-push checks that would have prevented retry-push churn. | [gaia-research/skill-ci-churn](https://github.com/gaia-research/skill-ci-churn) |
| **fuse** | AI agent command consolidator. Merge overlapping `/commands` into one unified `SKILL.md` — reduce slash-command clutter, combine Cursor rules, dedupe Windsurf cascades. | [gaia-research/skill-fuse](https://github.com/gaia-research/skill-fuse) |

Install any of them with the one-liner from its repo, e.g.:

```bash
bash <(curl -sL https://raw.githubusercontent.com/gaia-research/skill-context-diet/main/install.sh)
```

---

## 📂 Repository Structure

| Path | Purpose |
| :--- | :--- |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Complete system architecture, tool pathways, OAuth/Supabase blueprint. |
| [`PRODUCT.md`](PRODUCT.md) | Strategic goals, brand voice (Milim's high-energy academic style), audience profiles. |
| [`DESIGN.md`](DESIGN.md) | Visual system tokens, colors, typography, interactive patterns. |
| [`CONSOLIDATION_PRD.md`](CONSOLIDATION_PRD.md) | Phased roadmap for merging the Research web interface with the Skill Tree ledger. |
| [`CLAUDE.md`](CLAUDE.md) | Guidance for Claude Code / agent sessions working in this repo. |
| `assets/` | Brand images, tool mockups, generated visuals. |
| `content/schemas/` | **Derived** cache of benchmark JSON schemas (regenerated by `generate-templates.ts`). |
| `content/templates/` | Sample submissions matching each schema. |
| `content/reports/`, `content/tools/` | Long-form markdown for the future Next.js site. |
| `docs/idea-bank/`, `docs/plans/` | Planning notes; not shipped as pages. |
| `experiments/` | Playground and testbed concepts (prototype-quality). |
| `scripts/` | Build-time ingestion, template generation, and validation scripts. |
| `src/lib/` | Infrastructure integrations (e.g. `supabaseClient.ts`) staged for the Next.js migration. |

`benchmarks/` is referenced in `ARCHITECTURE.md` as a planned folder for benchmark specs and cached runs — it does not exist in the tree yet.

---

## 🎨 Visual Design: The Cyber-Slime Laboratory

Gaia Research embraces a high-impact, technical aesthetic featuring:
*   **The Slate-to-Obsidian Canvas:** Sleek, high-contrast dark surfaces.
*   **Brand Highlights:** Vibrant **Milim Pink** (`#ec4899`) for actions and verified states, contrasted with **Rimuru Blue** (`#38bdf8`) for borders and stable navigation.
*   **Bold Typography:** Punchy, ultra-condensed Bebas Neue headings balanced by geometric body text and monospaced HUD readouts.

For implementation details, see [`DESIGN.md`](DESIGN.md) and [`PRODUCT.md`](PRODUCT.md).

---

## 🚀 Running Scripts

Every command below uses `npx tsx` — no install step, no `package.json` required.

### 1. Ingestion & Template Generation

Regenerate JSON schemas and boilerplate templates. `generate-templates.ts` looks for a sibling `../gaia-skill-tree` working copy first (via `git show dev/sprint-d-benchmark-leaderboard:...`), then falls back to the raw GitHub URL, then to a hardcoded fallback schema:

```bash
# Generate dynamic JSON templates from benchmark schemas
npx tsx scripts/generate-templates.ts

# Ingest and prep tool documentation (skill-fuse, gaia-operator)
npx tsx scripts/ingest-tool-docs.ts
```

### 2. Submission Validation

Validates a JSON file against the GSB or general-benchmark schema. The script auto-detects which schema to use from the top-level `benchmark` field — `"GSB"` or `"Gaia Skill Bench"` routes to the GSB validator; anything else uses the general benchmark validator.

```bash
npx tsx scripts/validate-submissions.ts content/templates/gsb-submission.json
npx tsx scripts/validate-submissions.ts content/templates/benchmark-submission.json
```

> **Note:** `validate-submissions.ts` is a hand-rolled validator, not a generic JSON Schema library. The schema files in `content/schemas/` document the contract for contributors and upstream, but the runtime rules are hardcoded in the script (pillar weights, `sha256:` regex, accepted GSB `version` strings). If you change one, mirror the change in the other — they can silently drift.

### 3. Next.js App (Future)

Once the migration in [`CONSOLIDATION_PRD.md`](CONSOLIDATION_PRD.md) lands, routes and UI will live under `src/` and read from `content/`. Environment variables for GitHub OAuth and Supabase will be configured in `.env.local`. Not wired up yet.
