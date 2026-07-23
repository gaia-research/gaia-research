---
name: gaia-blog-post
description: Standardized playbook for authoring high-signal, low-noise blog posts for Gaia Research. Enforces show-don't-tell evidence embedding, SVG graphs over long text, Nova's writing persona in marketing-tasks, Milim thumbnail generation via milim-editorial-thumbnail skill, and local template.md boilerplates.
---

# Gaia Blog Post Authoring & Production Skill

Use this skill whenever an agent is tasked with writing, illustrating, or publishing a **blog post** for **Gaia Research** (`/blog/*`).

> **Note on Research Papers:** Blog posts (`/blog/*`) are Nova-authored field notes, explainers, and editorial posts. Formal empirical papers and postmortems (`/research/*`) are handled separately.

---

## 1. Show-Don't-Tell & Visual Signal Standards

Every Gaia blog post MUST follow the **Show-Don't-Tell** evidence principle:

- **Embedded Primary Evidence**: Embed YouTube talks, video clips (`[[YOUTUBE_EMBED]]`), or interactive terminal output boxes instead of describing them in prose.
- **SVG Graphs Over Long Text**: Prefer native React SVG graphs, visual flowcharts, or timeline diagrams over long walls of explanatory text. Communicate data, decision trees, and lifecycle stages visually.
- **Stacked Code Comparisons**: Compare patterns directly using stacked **❌ Broad advice (Anti-Pattern)** vs **✅ Lean directive (Clean Pattern)** code blocks rather than abstract paragraphs.

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
- **Pipeline**: Workbench generation (`assets/workbench/generated/`) → responsive export (1600×900 WebP) → ledger sync (`scripts/assets/sync-asset-ledger.ts`).

---

## 4. Template & Code Routing

Boilerplate code and file structures are maintained in the separate `template.md` file inside this skill directory:

- Read `./template.md` for:
  1. **Markdown Source Template** (`content/blog/<slug>/post.md`) with video embed tokens (`[[YOUTUBE_EMBED]]`)
  2. **Next.js Edge Page Template** (`app/blog/[slug]/page.tsx`) with Schema.org `BlogPosting` JSON-LD & video render component
  3. **Data Registry Boilerplate** (`data/blog.ts`)

---

## 5. Pre-Publishing Quality Checklist

- [ ] **Show-Don't-Tell Verification**: Primary evidence embedded (YouTube video / terminal trace) and SVG graphs used in place of long text paragraphs.
- [ ] **Nova Persona Verified**: Followed `../marketing-tasks/.agents/skills/nova/SKILL.md` (low-ego, direct, zero hype) and referenced `content/authors/nova.json`.
- [ ] **Editorial Thumbnail Link**: Delegated thumbnail generation directly to `.agents/skills/milim-editorial-thumbnail/SKILL.md` (never using `omniflash`).
- [ ] **Templates Followed**: Structured according to `./template.md` (Broad advice vs Lean directive comparison, explicit work-in-progress scope).
- [ ] **Static Edge & SEO**: Pinned `export const dynamic = "force-static"; export const revalidate = false;` and valid Schema.org JSON-LD included.
- [ ] **Visual Cut-off Audit**: Passed `node scripts/visual-audit.mjs` with zero mobile horizontal cut-off or console errors.
