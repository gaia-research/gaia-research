# Architecture & Ecosystem Blueprint (ARCHITECTURE.md)

> This document defines the high-level architecture, repository roles, tool pathways, persistence strategies, and folder structures for the **Gaia Research** ecosystem. It serves as the primary context for developers and agent workflows.

---

## 🗺️ 1. Ecosystem Overview

The Gaia ecosystem is structured into four distinct repositories, each serving a modular role. We follow **Option A (The Portal & Ledger)** model, separating the public presentation layer from the core developer tools.

```
                  ┌──────────────────────────────┐
                  │   gaia-research (The Lab)    │◄─── Public Website
                  │   - Portal, News, & Reports  │     GitHub OAuth & Supabase
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐    ┌──────────────────┐
│ gaia-skill-tree  │   │    skill-fuse    │    │  gaia-operator   │
│ (The Monorepo)   │   │ (Ecosystem Entry)│    │ (Internal CUA)   │
│ - Registry DB    │   │ - Light Composer │    │ - Safe Runtime   │
│ - CLI & Schemas  │   │ - Upgrade Path   │    │ - Task Traces    │
└──────────────────┘   └──────────────────┘    └──────────────────┘
```

| Repository | Role | Access | Core Technologies |
| :--- | :--- | :--- | :--- |
| **`gaia-research`** | Intermediary portal, reports ledger, news feed, and labs playground. | Public | Next.js, React, Tailwind, Supabase |
| **`gaia-skill-tree`** | The central database monorepo. Houses the registry, CLI, and schemas. | Public | Python, Node.js, JSON schema |
| **`skill-fuse`** | Light/first-touch developer tool for skill composition. | Public | Bash, Markdown (Zero-dependency) |
| **`gaia-operator`**| Platform interaction agent (CUA runtime). | Internal | Node.js, Playwright |

---

## 🛠️ 2. Developer Tool Pathways (`skill-fuse`)

`skill-fuse` serves as the public entry-point for developers. It supports two usage tiers:

### Path 1: Standalone Light Composition (Zero-Dependency)
*   **Target Audience:** General AI agent developers (Claude Code, Cursor, Windsurf, etc.) who just want to compose two local skills.
*   **Workflow:** Run `/fuse skillA + skillB`. It reads local markdown, compositions them, and registers them in the local `.agents/skills/` folder without external requirements.

### Path 2: CLI Upgrade Path (Registry Integration)
*   **Target Audience:** Contributors wanting to push their custom skills to the official public tree.
*   **Workflow:** The developer installs `gaia-cli` (from `gaia-skill-tree`). This links `skill-fuse` with the local `.gaia/` logs, enabling `gaia validate` and `gaia push` to propose their fused skills to the central ledger.

---

## 💾 3. Database & Authentication Strategy (Supabase & OAuth)

To transition from static pages to an interactive portal, we lay down a future-proof decoupled persistence layer:

*   **GitHub OAuth:** Integrated on the `gaia-research` frontend (Next.js) for user verification, allowing developers to authenticate using their GitHub credentials.
*   **Supabase (Persistence layer):** Houses user sessions, credentials, developer profiles, and transient or draft submissions.
*   **Ecosystem Separation:** Raw live data and temporary submissions reside in Supabase to keep the website fast and interactive. The main registry (`gaia-skill-tree/registry.json`) remains a Git-backed, strictly validated database. Once a community submission is approved, a PR or automated commit writes it permanently to the repository.

---

## 📊 4. Epic 1002 Naming Conventions & TM Index

Epic 1002 formalizes metadata naming conventions to enforce clarity and alignment across all tools and rendering scripts.

### Naming Conventions
*   **IDs:** Must be strict `kebab-case` (e.g., `literature-search`, `requesting-code-review`).
*   **Prefixes & Suffixes:** Modifiers on variants and compositions must be standardized.
*   **File Headers:** All skills require frontmatter specifying `trustMagnitudeInputHash`, `suiteComponents`, and `genericSkillRef`.

### Trust Magnitude (TM) Index
`TM` is the aggregate evidence score calculated from the closed 10-type evidence taxonomy. The visual portal renders this on two tiers:
*   **Trust Grade:** Prominent letter chips (S $\ge$ 250, A $\ge$ 100, B $\ge$ 50, C $\ge$ 20, < 20 = Ungraded).
*   **Raw Magnitude:** Monospaced HUD readout (e.g. `TM 248.5`) to display precise traction.

---

## 📂 5. Repository Folder Structure (`gaia-research`)

```text
/
├── index.html              # Legacy static portal (to be deprecated)
├── prototype.html          # Next.js visual prototype
├── PRODUCT.md              # Brand voice (Milim's high-energy), target audience
├── DESIGN.md               # Visual styling tokens (Milim Pink, Rimuru Blue)
├── ARCHITECTURE.md         # This ecosystem blueprint
│
├── content/                # Next.js dynamic markdown content & ingest layer
│   ├── news/               # Portal updates, release blogs, Milim Directives
│   ├── reports/            # Lab-produced capability reports & briefs
│   ├── schemas/            # JSON schemas for benchmark submissions
│   ├── templates/          # Standard boilerplate JSON templates
│   └── tools/              # User-facing landing documents for skill-fuse/gaia-operator
│
├── benchmarks/             
│   ├── specs/              # Definitions of benchmarks (TM Index details)
│   └── runs/               # Temporary/historical benchmark result files (cached)
│
├── experiments/            
│   ├── playground/         # Interactive labs concepts (Google Labs style widgets)
│   └── logs/               # Testing/sandbox execution logs
│
├── assets/                 # Unified asset ledger
│   ├── brand/              # Logos, typography styles, layout decorations
│   ├── tools/              # Diagram SVGs and tool mockups
│   └── benchmarks/         # Visual representations of TM formulas
│
└── css/ & js/              # Modular styling and interactive scripts (to be migrated)
```

---

## 🗃️ 6. Skill Benchmark Ingest Layer

The Skill Benchmark Ingest Layer facilitates the ingestion, verification, and standardization of AI agent benchmark results (specifically Gaia Skill Bench (GSB) and other approved external benchmarks).

### 6.1 GSB Submission Pathway (GSB v1)
Submissions targeting the **Gaia Skill Bench (GSB)** must conform to the v1 specification schema (`gsb-submission.schema.json`). This requires evaluating models across four weighted pillars:
1.  **Performance** (40% weight)
2.  **Reliability** (30% weight)
3.  **Triggering** (20% weight)
4.  **Efficiency** (10% weight)

Each pillar has its own score (0-100), and an optional `overallScore` that must match the weighted average of the pillars.

Additionally, GSB submissions must contain a **Reproducible Run Manifest** detailing:
*   `seeds`: Array of random seeds used for the runs.
*   `modelRevision`: Commit hash or version of the evaluated model weights/definition.
*   `containerSha`: SHA256 digest of the container/OCI image representing the runtime environment.
*   `envHash`: Cryptographic hash representing the configuration/dependencies of the environment.
*   `rawScores`: Key-value map of task/scenario scores.
*   `signature`: Cryptographic signature verifying the authenticity of the test run registry.

### 6.2 General Benchmark Ingestion
For general benchmark results (e.g. GAIA, SWE-bench, WebArena), submissions conform to `benchmark-result.schema.json`. This schema is fetched dynamically from the `gaia-skill-tree` repository (`dev/sprint-d-benchmark-leaderboard` branch) or falling back to the raw GitHub URL, ensuring synchronization across the codebase.

### 6.3 Ingestion & Verification Tooling
*   **Template Generator (`scripts/generate-templates.ts`):** Automatically pulls the latest benchmark schemas and writes them locally to `content/schemas/`. It then generates sample boilerplates (`content/templates/gsb-submission.json` and `content/templates/benchmark-submission.json`) for contributors to copy and fill out.
*   **Validator Script (`scripts/validate-submissions.ts`):** Validates any JSON file against the GSB schema or the general benchmark result schema. It performs strict type, pattern (e.g., SHA formats), and property validations, as well as checking GSB weighted score consistency.

