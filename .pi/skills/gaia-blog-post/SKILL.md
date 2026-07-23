---
name: gaia-blog-post
description: Standardized playbook for authoring high-signal, low-noise blog posts for Gaia Research. Enforces single-topic deep dives, anti-slop guardrails, no unratified roadmap claims, show-don't-tell evidence, SVG graphs over long text, Nova's writing persona, and Milim thumbnail generation via milim-editorial-thumbnail skill.
---

# Gaia Blog Post Authoring & Production Skill

Use this skill whenever an agent is tasked with writing, illustrating, or publishing a **blog post** for **Gaia Research** (`/blog/*`).

> **Note on Research Papers:** Blog posts (`/blog/*`) are Nova-authored field notes, explainers, and editorial posts. Formal empirical papers and postmortems (`/research/*`) are handled separately.

---

## 1. Anti-Slop & Quality Directives

To keep posts high-signal, low-noise, and distinct:

- ❌ **No Unratified Roadmap Claims**: NEVER invent fake roadmap promises or unratified claims (e.g. *"Work in progress... evaluating for GSB inclusion"*). State ONLY what is verified or backed by actual repo issues/docs.
- ❌ **No Cookie-Cutter Section Headers**: Do NOT reuse rigid boilerplate headers ("1. Executive Summary", "2. Signals", "3. Bad vs Good", "5. Next Steps") across posts. Create natural, topic-specific section titles for each post.
- ❌ **No Corporate Hype Buzzwords**: Ban fluff ("game-changing", "paradigm shift", "seamless integration", "unlocking the future"). State findings, code, and limitations plainly.
- ✅ **Single-Topic Deep Dive**: Focus each post on **ONE single topic** in depth. Do not bundle multiple unrelated news items into a single post.
- ✅ **Show-Don't-Tell Evidence**: Embed at least one form of primary evidence. In order of preference: a real YouTube talk (`[[YOUTUBE_EMBED]]`) when a directly relevant source exists, terminal output traces showing actual agent behaviour, or a linked paper/issue. **Do not embed a YouTube video if no directly relevant talk exists** — a forced embed with a tangentially related video is worse than no embed. Conceptual posts with no external source must be clearly labelled as conceptual frameworks, not presented as measured results.
- ✅ **SVG Graphs Over Walls of Text**: Prefer native React SVG graphs, visual flowcharts, or timeline diagrams over long paragraphs of explanatory text.

---

## 2. External Persona & Identity Routing

Do not duplicate or hardcode persona definitions in this skill file. Route to the canonical external sources:

- **Nova Writing Style & Persona Skill**: Read `../marketing-tasks/.agents/skills/nova/SKILL.md` for Nova's low-ego, demure, peer-focused writing style, tone, and fact-first auditing rules.
- **Nova Canonical Author Record**: Read `content/authors/nova.json` for structured author metadata (`display_name: "Nova"`, `role: "Head Researcher"`).
- **Editorial Authority Contract**: Read `docs/authorship/nova-editorial-authority.md` for public AI disclosures and human review requirements by Marcus Tiongson (Founder).
- **Milim Character Authority**: Read `../marketing-tasks/MILIM.md` before depicting Milim in any visual asset.

---

## 3. Visual System: Milim Editorial Thumbnail Routing

Every blog post **MUST** feature a 16:9 flat screenprint **Milim Editorial Thumbnail** illustration.

- **Thumbnail Harness Link**: Delegate all thumbnail generation directly to `.agents/skills/milim-editorial-thumbnail/SKILL.md`.
- **Tool Rule**: **NEVER use `omniflash`.** Use `.agents/skills/milim-editorial-thumbnail/SKILL.md` exclusively.
- **Guardrails**: Tiny Milim (≤8% frame height, no twintails, lower-right) in quiet slice-of-life scenes (e.g. moonlit observatory archive). **NO text, UI, code, graphs, diagrams, or tree imagery.**
- **Pipeline**: Workbench generation (`assets/workbench/generated/`) → responsive export (1600×900 WebP) → ledger sync (`scripts/assets/sync-asset-ledger.ts`) → copy to `public/assets/`.

---

## 4. Template & Code Routing

Boilerplate code and file structures are maintained in the separate `template.md` file inside this skill directory:

- Read `./template.md` for:
  1. **Markdown Source Template** (`content/blog/<slug>/post.md`) with optional video embed tokens (`[[YOUTUBE_EMBED]]` — only include if a real relevant video exists)
  2. **Next.js Edge Page Template** (`app/blog/[slug]/page.tsx`) with Schema.org `BlogPosting` JSON-LD & optional video render component
  3. **Data Registry Boilerplate** (`data/blog.ts`)

---

## 5. Pre-Publishing Quality Checklist

- [ ] **Anti-Slop Check**: Zero unratified roadmap claims, zero boilerplate headers, zero corporate hype buzzwords. Single-topic deep dive.
- [ ] **Show-Don't-Tell Verification**: At least one form of primary evidence is embedded — a real YouTube talk (only if directly relevant), terminal output trace, or linked paper. If the post describes a conceptual framework with no external source, it is clearly labelled as such. SVG graphs used in place of long text paragraphs.
- [ ] **Nova Persona Verified**: Followed `../marketing-tasks/.agents/skills/nova/SKILL.md` (low-ego, direct, zero hype) and referenced `content/authors/nova.json`.
- [ ] **Editorial Thumbnail Built & Deployed**: Delegated thumbnail generation directly to `.agents/skills/milim-editorial-thumbnail/SKILL.md` (never using `omniflash`), exported WebP to `assets/generated/` AND `public/assets/`.
- [ ] **Templates Followed**: Structured according to `./template.md`.
- [ ] **Static Edge & SEO**: Pinned `export const dynamic = "force-static"; export const revalidate = false;` and valid Schema.org JSON-LD included.
- [ ] **Visual Cut-off Audit**: Passed `node scripts/visual-audit.mjs` with zero mobile horizontal cut-off or console errors.
