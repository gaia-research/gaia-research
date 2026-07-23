# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Orient before you build (branch & merge state)

**Always confirm which line / branch you are actually on before building on top of it, and sync `main` first.** Two recurring traps in this repo:

1. **Stale local `main`.** Work here moves fast across many small PRs — a local `main` can be *dozens* of commits behind `origin/main`, so infrastructure the task assumes (CI workflows, gate scripts, ledger data) looks "missing" when it is really just un-pulled. **Always `git fetch` + fast-forward `main` before you start**, and branch off the fresh `main`.
2. **A "merged" PR may have merged into another open PR branch, not `main`.** Verify the base before treating a merge as live.

Orientation check before starting:

```bash
git fetch origin main && git merge --ff-only origin/main    # never build on a stale main
gh pr list --state all --limit 20 --json number,title,headRefName,state,baseRefName
git log --oneline --first-parent origin/main -15
# For any PR that claims to be "merged", verify it actually reached main:
gh pr view <n> --json baseRefName,mergeCommit -q '.baseRefName'
git merge-base --is-ancestor <mergeCommitSha> origin/main && echo "on main" || echo "NOT on main"
```

**Decisions are ratified, not inferred.** [`founder/RATIFICATION.md`](founder/RATIFICATION.md) is the single source of truth — where any other doc (including `VISION.md` or older plans) disagrees, that doc wins and the other is pending rewrite. Read the relevant LOCKED/LEANING/OPEN entries before designing on top of a question; do not invent an answer to an OPEN item — flag it.

**Current active line (as of 2026-07):** the **Skill Heaven / Skill Hell** MVP. Research, benchmarks (census / ledger / capability matrix under `scripts/hell-heaven-bench/` + `content/reports/hh-benchmark/` + `docs/labs/harness-capability-matrix.md`), and the site live **here**; the shippable product — the shared engine + per-harness doors (`claude-heaven`, `pi-heaven`, …) — lives in the **separate `gaia-research/skill-heaven` monorepo**, which doubles as the Claude Code plugin marketplace (RATIFICATION N9). The homepage north-star question is settled: the Next.js site on `main` **is** the live site at `research.gaiaskilltree.com`. When in doubt about the current direction, confirm with the user.

## Repository Purpose

`gaia-research` is the public-facing lab/portal for the Gaia ecosystem. It is:

1. A **Next.js App Router site** (deployed to Cloudflare) that ships the landing page at `https://research.gaiaskilltree.com`.
2. A **Skill Benchmark Ingest Layer** — standalone TypeScript scripts under `scripts/` that fetch benchmark schemas from the sibling `gaia-skill-tree` repo and validate contributor submissions.

## Common Commands

Everything runnable today is a one-off `tsx` script. There is no build, no test suite, and no lint config in-tree.

```bash
# Refresh benchmark-result schema (from sibling gaia-skill-tree checkout or raw GitHub)
# and regenerate content/templates/{gsb,benchmark}-submission.json boilerplates.
npx tsx scripts/generate-templates.ts

# Ingest tool docs (skill-fuse, gaia-operator) into content/tools/.
npx tsx scripts/ingest-tool-docs.ts

# Validate a submission JSON. The script auto-detects GSB vs. general benchmark
# from the top-level "benchmark" field ("GSB" / "Gaia Skill Bench" -> GSB schema).
npx tsx scripts/validate-submissions.ts content/templates/gsb-submission.json
npx tsx scripts/validate-submissions.ts content/templates/benchmark-submission.json
```

`generate-templates.ts` looks for `../gaia-skill-tree` as a sibling working copy first (via `git show dev/sprint-d-benchmark-leaderboard:...`), then falls back to the raw GitHub URL, then to a hardcoded fallback schema. If you are offline and the sibling repo is missing, the fallback still produces valid output — but the schema may be out of date relative to upstream.

### Visual / mobile audit (before & after UI work)

Run the `visual-audit` skill (`.agents/skills/visual-audit/SKILL.md`) whenever you touch layout, CSS, or responsive code. It screenshots every key page across phone→desktop widths and **detects horizontal cut-off** (content pushed off-screen), naming the offending element — the failure mode plain screenshots hide.

```bash
npx playwright install chromium          # once per machine
npx next dev -p 3010 &                    # dev server in background
BASE_URL=http://localhost:3010 LABEL=after node scripts/visual-audit.mjs
```

Playwright is deliberately not a dependency (keeps the Cloudflare bundle lean); the script auto-resolves it from the npx cache. Output goes to the gitignored `scripts/.visual-audit/`. Exits non-zero on any cut-off or console error, so it doubles as a gate.

## Ecosystem Context (why this matters for edits)

There is a strict repository boundary enforced by convention (see `README.md`, `ARCHITECTURE.md`, `CONSOLIDATION_PRD.md`):

```
gaia-research  ──►  marketing-tasks  ──►  gaia-skill-tree
```

- **Nothing from `gaia-research` is committed directly into `gaia-skill-tree`.** Changes flow through `marketing-tasks` first.
- `gaia-skill-tree` owns the ground-truth `registry.json` and the canonical JSON schemas. `content/schemas/` in this repo is a **derived cache** — treat it as regenerable output, not source. If you need to change a schema's shape, change it upstream in `gaia-skill-tree` and re-run `generate-templates.ts` here.
- The long-term plan (`CONSOLIDATION_PRD.md`) is to move all HTML/UI out of `gaia-skill-tree` into this repo as a Next.js app, leaving `gaia-skill-tree` as a headless "Gaia-Lite" toolkit. When adding UI, prefer landing it here rather than in `gaia-skill-tree`.

## Content & Data Model

- `content/schemas/` — cached JSON Schemas (`gsb-submission.schema.json`, `benchmark-result.schema.json`). Regenerated by `generate-templates.ts`.
- `content/templates/` — sample submissions matching each schema; hand-written in `generate-templates.ts` and used as validator fixtures.
- `content/reports/`, `content/tools/` — long-form markdown consumed by the future Next.js site.
- `docs/idea-bank/`, `docs/plans/` — planning notes; not shipped as pages.
- `experiments/` — playground/testbed concepts; expect these to be prototype-quality and not wired into any build.
- `assets/brand/` — mascot art (Milim avatar) and brand vectors referenced from `README.md` and the future site's OG image (`_config.yml` `social.og_image`).

### Submission validation semantics

`scripts/validate-submissions.ts` is a hand-rolled validator, **not** a generic JSON Schema library — the schema files in `content/schemas/` are documentation for contributors and the upstream registry, but the validator hardcodes the rules it actually enforces. Notable specifics:

- GSB pillar weights are locked: `performance 0.40 / reliability 0.30 / triggering 0.20 / efficiency 0.10`. `overallScore`, if present, must equal the weighted average within 0.01.
- `containerSha` must match `^sha256:[a-f0-9]{64}$` in both schemas.
- GSB accepts `version` values `"1.0"`, `"1"`, or `"v1"` only.

If you change the schema JSON files, mirror the change in the validator (or vice versa) — they can silently drift.

## Node / npm version contract (CI & local must match)

The CI workflow (`.github/workflows/craft-ci.yml`) pins **Node 22** (`node-version: '22'`). Keep it there.

**Why this matters — burned once (2026-07-13):**
- `wrangler@4.x` requires `node >=22`. Running CI on Node 20 triggers `EBADENGINE` warnings and breaks `npm ci`.
- The local dev environment runs **Node 24 / npm 11**. npm 11 silently accepts unresolved peer deps; npm 10 (shipped with Node 20 & 22) does not — it aborts `npm ci` with `Missing: <pkg>@<ver> from lock file`.
- Specifically: `vitest@4` bundles `vite@8` which declares `esbuild: "^0.27.0 || ^0.28.0"` as a peer dep. If the top-level esbuild in the lockfile is below that range (e.g. `0.25.4`), npm 10 flags it as a lockfile sync error.

**Rules going forward:**
1. **Always keep `esbuild` as an explicit `devDependency`** pinned to `^0.28.0` (or whatever satisfies `vite`'s current peer dep range). This ensures the lockfile carries a top-level entry that both npm 10 and npm 11 can resolve.
2. **If you upgrade `vitest` or `vite`**, re-check the `esbuild` peer dep range in `node_modules/vitest/node_modules/vite/package.json` and update the pinned `esbuild` devDep accordingly.
3. **If `npm ci` fails locally** with `Missing: X from lock file`, the lockfile was likely generated with a different npm major. Run `npm install` (don't use `npm ci`) to regenerate it, then commit the updated `package-lock.json`.
4. **Do not downgrade CI below Node 22** — wrangler will break.

## Slash skill commands

- **When a user explicitly invokes a slash skill command** (for example, `/impeccable`), **never substitute an alternative skill, workflow, tool, or manual method.** Load and execute the exact named skill command.
- If that exact skill is unavailable, not installed, or blocked, report the specific blocker and ask the user before taking any alternative action.
- Do not infer that permission to use a related capability is permission to replace an explicitly requested slash skill.

## Brand & Voice

`PRODUCT.md` and `DESIGN.md` define the mascot voice (Milim — high-energy, playful-rigorous) and the visual system (Milim Pink `#ec4899`, Rimuru Blue `#38bdf8`, obsidian dark canvas, Bebas Neue + Syne typography). Copy and UI work in this repo should match that register; the ledger-side (`/atlas` in the future app) uses a more solemn palette per `CONSOLIDATION_PRD.md`.

## Image Generation & Asset Production

When generating or refining images for this repo, use the project skill/playbook and helper scripts:

- Skill: `.agents/skills/gaia-image-production/SKILL.md`
- Playbook: `docs/assets/pi-image-gen-playbook.md`
- Helper scripts: `scripts/assets/`
- Workflow docs: `docs/assets/asset-production-workflows.md`
- Asset ledger: `content/assets/asset-ledger.json`
- Export recipes: `content/assets/export-recipes.json`

Hard rule: **always use image gen 2 / `gpt-image-2`; never use `nano-banana` or `nano-banana-2` for Gaia Research production assets.** If using `omniflash`, set `model_id: "gpt-image-2"`. If using pi-image-gen / `image_generate`, confirm the active default model is image gen 2 before generating; if it cannot be confirmed, ask before proceeding.

Generated experiments and intermediate variants should go in `assets/workbench/` first. Promote reviewed outputs to `assets/generated/` or `assets/brand/`, then run the asset ledger sync/check scripts.

## GitHub Pages (Deprecated)

The site used to be served by Jekyll. It is now a Next.js App deployed to Cloudflare at `research.gaiaskilltree.com`.

## Blog Post Reviews

When reviewing a PR that adds or modifies a blog post (`/blog/*`), skill files (`SKILL.md`, `template.md`), or thumbnail assets, check **all three** of the following dimensions — not just code correctness:

### 1. Content nuance — does the post earn the reader's trust?

- **Fabricated specificity**: Does the post describe tools, configs, file paths, CLI commands, or metrics that don't exist in the repo? (e.g. a `skillopt.yaml` file, `tests/evals/` paths, loss convergence numbers). Flag it — a reader who tries to use it will feel misled. Conceptual frameworks must be clearly labelled as such.
- **Unratified claims**: Check `founder/RATIFICATION.md`. Any roadmap promise or product claim that isn't LOCKED there must be explicitly hedged in the post.
- **Evidence gap**: Does the post cite results (precision %, token counts, convergence curves) without stating how they were measured or noting they are illustrative? Fabricated numbers presented as real data undermine reader trust.
- **Internal consistency**: Do the numbers in tables, graphs, and prose agree with each other? (e.g. a table row for Step 20 at 94.8% precision must match the graph caption and body text.)

### 2. Skill file integrity — will a dev following this get the right output?

- **Skill ↔ template contradictions**: If `SKILL.md` bans a pattern (e.g. cookie-cutter section headers like "Work in Progress / Next Steps"), `template.md` must not use that exact pattern. Both files travel together — a dev reads both.
- **Cross-file policy drift**: If this PR modifies `gaia-image-production/SKILL.md` or `milim-editorial-thumbnail/SKILL.md`, verify the changes don't silently contradict `CLAUDE.md` hard rules (e.g. model selection policy). The skill file is not the source of truth — `CLAUDE.md` is.
- **Broken references**: Skill files that point to `../marketing-tasks/...` paths assume a sibling repo checkout exists. Flag any reference that will silently 404 in CI or a fresh clone.
- **Omissions from rewrites**: If a skill file is partially rewritten, check what was deleted. Operational procedures (cutout workflow, upscale hook, output standards table) should not disappear without an explicit replacement or stated reason.

### 3. Readability — will a real reader skim past it or stop and read?

This is the most important dimension and the easiest to overlook in a code review. Ask:

- **Does the opening hook earn 10 more seconds?** The first two sentences decide whether a newcomer keeps reading. A hook that answers a question the reader already has ("why does adding IMPORTANT make it worse?") works. A hook that summarizes what the post will cover does not.
- **Is there a skimmable backbone?** A reader who skims should still get the core idea from headers + bold text + code block labels alone. If every header is a vague noun phrase ("Optimization", "Results", "Takeaway"), skimmers get nothing.
- **Do code comparisons show contrast clearly?** Side-by-side before/after blocks are the most-read part of any technical post. The "bad" example must be recognizably bad — not just longer — and the "good" must be concisely better.
- **Does the post end with something actionable or memorable?** A "Takeaway" section that restates the intro in different words gives the reader no reason to share or return. A post should leave the reader with one thing they can do differently tomorrow.
- **Is the reading level right?** Posts are read by practitioners (devs who write `SKILL.md` files) and curious newcomers alike. Assume the newcomer: if a term (ZO gradient, θ vector, perturbation scale) appears without a one-line plain-English anchor, that reader is lost before the second section.
