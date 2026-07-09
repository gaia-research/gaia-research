# Gaia Research Next.js North Star Site Plan

## Purpose

Build the next Gaia Research website as the public laboratory wing of the Gaia ecosystem, using the visualized North Star direction as the production target. Gaia Research should feel like the Cyber-Slime Laboratory: dark, high-voltage, credible, joyful, and evidence-first. Gaia Skill Tree remains the secondary registry wing: the Hunter's Atlas, ceremonial, ivory/gold, archival, and permanent.

Final creative line: **the lab discovers, the registry remembers, and every verified capability leaves a permanent trace.**

## Stack

Use **Next.js App Router + React + TypeScript + Node.js scripts**.

Reasons:
- Next.js gives us SEO metadata, Open Graph support, static generation, and future API routes.
- React lets us componentize the North Star visual system cleanly.
- Node scripts can ingest Gaia Skill Tree JSON files at build time without shipping large raw registries to the homepage.
- The stack supports future routes such as `/atlas`, `/ledger`, `/benchmarks`, `/foundation`, and `/api/*`.

## Source repositories

This repository is the new web surface.

Use an adjacent clone for registry data during development:

```text
../gaia-skill-tree
```

Do not vendor the full `gaia-skill-tree` repository into this repo. Build scripts should read selected JSON files from the adjacent clone or from a configured source path.

## Data ingestion plan

Read from Gaia Skill Tree:

```text
../gaia-skill-tree/docs/graph/gaia.json
../gaia-skill-tree/docs/api/v1/leaderboard.json
../gaia-skill-tree/docs/graph/named/index.json
../gaia-skill-tree/docs/api/v1/evidence-types.json
```

Generate a small site-safe summary:

```text
src/data/gaia-data.json
```

The summary should include:
- total skills
- graph edges
- named skills
- unique contributors
- evidence row totals
- evidence grade distribution
- top trust records
- selected research ledger rows
- selected named skill highlights

The homepage should not import the full registry directly unless the section needs it.

## App structure

Initial structure:

```text
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── api/
│   └── gaia/
│       └── summary/route.ts
└── opengraph-image.tsx

components/
├── BrandMark.tsx
├── StatusChip.tsx
├── FoundationFooter.tsx
├── research/
│   ├── ResearchHero.tsx
│   ├── ResearchLedgerTable.tsx
│   ├── BenchmarkSuites.tsx
│   ├── ProjectGateways.tsx
│   ├── MilimDirectives.tsx
│   └── LabGridBackground.tsx
└── skill-tree/
    ├── AtlasPreview.tsx
    ├── HeroPlaque.tsx
    └── TrustRecordList.tsx
```

Future routes:

```text
/atlas
/foundation
/ledger
/benchmarks
/community
/docs
/labs/context-diet
```

## Homepage sections

### 1. Mission Control Hero

Content:
- Headline: `Pushing the Limits of AI Agent Capabilities`
- Subheadline: `Gaia Research is the open research collective defining, verifying, and publishing the frontier of AI agent skills.`
- Primary CTA: `Explore research`
- Secondary CTA: `View the ledger`

Visual requirements:
- Chief Scout / blue slime hero art on the right.
- Strong semantic HTML text on the left, not raster text.
- Dark obsidian lab grid.
- Pink for high-energy actions.
- Blue for navigation, stable verification, and wayfinding.
- Status band using real synced counts where possible.

### 2. Project Gateways

Gateway cells:
- Gaia Skill Tree
- Benchmarks
- Ledger
- Community
- Docs and specs

Use varied panel structure, not identical generic cards.

### 3. Research Ledger

Use a real semantic table for:
- papers
- specs
- datasets
- APIs
- protocols

Status chips:
- `PRP` Proposed
- `ACT` Active
- `REV` In review
- `VRF` Verified

Every row should have a source link or clearly indicate that a source is pending.

### 4. Benchmark Suites

Show compact benchmark panels for:
- G-Bench generalist suite
- Safety alignment eval set
- Memory architecture analysis
- Protocol fusion work

Use radar/HUD motifs sparingly. The data and labels must remain readable.

### 5. Open Science Protocol

Narrative path:

```text
Observe → Benchmark → Verify → Publish → Register
```

Research owns discovery and verification. Skill Tree owns inscription and permanence.

### 6. Gaia Skill Tree Preview

Secondary bridge section.

Visual mode:
- ivory/gold Hunter's Atlas preview
- Raphael-sama archive art if confirmed
- top trust records from synced data
- named skill plaques

This section should feel related by purpose but visually distinct from Gaia Research.

### 7. Milim Directives

Short directive console, not long blog copy.

Directive examples:
- Share your research. Open science is the way.
- Verify before you flex. Data beats hype.
- Fuse ideas. Break silos.
- Build safe, robust agents.

### 8. Community CTA

Primary action:
- `Contribute on GitHub`

Secondary action:
- `Read the Codex`

## Generated assets currently available

Generated assets created through the image-generation worker:

```text
assets/generated/chief-scout-hero.png
assets/generated/raphael-archive-preview.png
assets/generated/research-og.png
```

Before shipping, confirm:
- character direction
- originality and no direct copying of existing characters
- no unwanted text, logos, or watermarks
- composition works at desktop and mobile crops
- file size and responsive image strategy
- whether the Raphael preview belongs on the Research homepage or should wait for the Skill Tree route

## SEO and metadata

Next.js should define:
- title template
- default description
- canonical URL
- Open Graph image
- Twitter card metadata
- structured data where useful
- robots policy
- sitemap generation

Important homepage description:

```text
Gaia Research discovers, verifies, and publishes the frontier of AI agent capabilities through open evidence and public ledgers.
```

## Hosting recommendation

Primary recommendation: **Vercel**.

Why:
- easiest Next.js deployment
- GitHub integration
- preview deployments on PRs
- native support for App Router, metadata, and API routes

Basic flow:

```bash
npm install
npm run build
```

Then connect the GitHub repository in Vercel and deploy from `main`.

Secondary option: Cloudflare Pages. This is possible, but Vercel is simpler for a first Next.js site and better for learning the framework.

## Quality gates

Before shipping:
- production build passes
- homepage has semantic landmarks and headings
- tables are semantic and keyboard accessible
- mobile, tablet, desktop layouts are checked
- body text meets WCAG AA contrast
- reduced motion support is present
- images have useful alt text or are decorative with empty alt text
- no gradient text
- no generic SaaS card grid takeover
- no beige AI startup warmth on Gaia Research
- no rasterized UI copy

## Implementation issue outline

Parent issue: **Create the new Gaia Research Next.js site with Impeccable Craft over the visualized North Star**

Sub-issues:
1. Confirm generated North Star assets.
2. Migrate important Gaia Skill Tree JSON data cleanly into a Next.js build pipeline.
3. Address Gaia Skill Tree API/data gaps needed by the new Gaia Research site.
4. Build the Next.js App Router homepage and SEO foundation.
5. Build the Context Diet prompt analyzer lab at `/labs/context-diet` to showcase real-time token reduction and export GAIA-compatible SKILL.md specs.

