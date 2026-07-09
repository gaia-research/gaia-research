# Asset Helper Scripts Plan

_Last updated: 2026-07-09_

## Purpose

Create a lightweight asset-production toolkit for Gaia Research generated and commissioned assets. The toolkit should support responsive crops, production exports, chroma-key/background-removal prep, AI upscaling hooks, asset ledger validation, and visual review workflows.

This repo does not have a `package.json` yet, so scripts should follow the current pattern: one-off `npx tsx` commands, with dependencies supplied at execution time.

## Design constraints

- Do not overwrite source/master assets by default.
- Keep transient work in ignored workbench folders.
- Preserve originals under `assets/generated/`, `assets/brand/`, and commission source folders.
- Treat North Star comps as direction/reference assets, not production UI.
- Prefer deterministic exports where possible.
- AI upscaling and background removal should produce job manifests and reviewed outputs, not silent replacements.
- Keep scripts small and composable.

## Proposed folders

```text
scripts/assets/
├── lib/
│   ├── args.ts
│   ├── hash.ts
│   ├── image.ts
│   ├── ledger.ts
│   └── paths.ts
├── check-asset-ledger.ts
├── export-responsive.ts
├── generate-contact-sheet.ts
├── prep-cutout.ts
├── sync-asset-ledger.ts
└── upscale-hook.ts

content/assets/
├── asset-ledger.json
├── asset-ledger.schema.json
└── export-recipes.json

docs/assets/
└── asset-production-workflows.md
```

Ignored local/transient outputs:

```text
assets/workbench/
.asset-cache/
```

## Shared helpers

### `scripts/assets/lib/args.ts`

Tiny dependency-free CLI parser.

Responsibilities:
- Parse `--key value`, `--flag`, and repeated options.
- Provide required-option assertions.
- Print compact usage errors.

### `scripts/assets/lib/paths.ts`

Repo path and safety utilities.

Responsibilities:
- Resolve repo root.
- Normalize relative paths.
- Prevent accidental writes outside the repo.
- Enforce workbench/output folder conventions.

### `scripts/assets/lib/hash.ts`

File metadata utilities.

Responsibilities:
- SHA256 hashes.
- Byte size.
- Modified timestamp.
- Stable metadata object for ledger entries and sidecar manifests.

### `scripts/assets/lib/image.ts`

`sharp` wrapper.

Responsibilities:
- Dynamic import of `sharp` so scripts fail with clear instructions if missing.
- Read dimensions and format.
- Resize/crop/export helpers.
- Contact-sheet composition helpers.

### `scripts/assets/lib/ledger.ts`

Asset ledger types and helpers.

Responsibilities:
- Load/save `content/assets/asset-ledger.json`.
- Upsert entries while preserving manual metadata.
- Validate duplicate IDs, missing files, and derivative references.
- Track status, license, credit, alt text, derivatives, and source metadata.

## Asset ledger

Path:

```text
content/assets/asset-ledger.json
```

Suggested entry shape:

```json
{
  "id": "chief-scout-hero",
  "path": "assets/generated/chief-scout-hero.png",
  "kind": "hero-illustration",
  "status": "candidate",
  "sourceType": "generated",
  "license": "internal-review-required",
  "credit": "Gaia Research generated asset workflow",
  "alt": "Milim and a blue slime advisor in a cyber research lab.",
  "sha256": "...",
  "bytes": 2021292,
  "dimensions": { "width": 1536, "height": 1024 },
  "derivatives": [],
  "notes": "Needs responsive WebP/AVIF exports."
}
```

Statuses:

- `reference` — visual direction only; not production UI.
- `candidate` — possible production asset; pending review/export.
- `approved` — production-approved.
- `deprecated` — kept for historical continuity only.

## Export recipes

Path:

```text
content/assets/export-recipes.json
```

Suggested recipe groups:

- `chief-scout-hero`
  - desktop 16:9 AVIF/WebP
  - tablet 4:3 AVIF/WebP
  - mobile 3:4 or 9:16 AVIF/WebP
- `research-og`
  - Open Graph 1200×630
  - Twitter/X 1200×675 or 1600×900
- `milim-avatar`
  - 512, 256, 128 square PNG/WebP
- `nova-avatar`
  - 512, 256, 128 square PNG/WebP
- `context-diet`
  - OG 1200×630
  - hero 16:9, 4:3, 3:4
  - social launch image

## Scripts

### 1. `scripts/assets/sync-asset-ledger.ts`

Scans assets and updates ledger metadata.

Responsibilities:
- Scan `assets/brand`, `assets/generated`, `assets/svg`, and top-level `assets/*.png`.
- Compute dimensions, format, byte size, and SHA256.
- Upsert records by stable ID.
- Preserve manually entered `status`, `license`, `credit`, `alt`, and `notes`.
- Mark obvious references, such as North Star comps and `assets/brand/figma/*`, as `reference`.

Example:

```bash
npx -y --package=tsx --package=sharp tsx scripts/assets/sync-asset-ledger.ts --scan assets
```

### 2. `scripts/assets/check-asset-ledger.ts`

Validates production readiness.

Responsibilities:
- Fail on missing files.
- Fail on duplicate IDs.
- Detect hash/dimension drift.
- In `--strict`, require approved assets to have alt text, credit/source, license, and expected derivatives.
- Warn if reference assets are used in production-facing files.
- Enforce special dimensions for OG/social/avatar/icon outputs.

Example:

```bash
npx -y --package=tsx --package=sharp tsx scripts/assets/check-asset-ledger.ts --strict
```

### 3. `scripts/assets/export-responsive.ts`

Creates deterministic crops and production exports.

Responsibilities:
- Read `content/assets/export-recipes.json`.
- Export AVIF/WebP/PNG derivatives.
- Support direct CLI mode for ad hoc crops.
- Write sidecar manifest containing source hash, dimensions, format, quality, crop options, and timestamp.
- Refuse overwrite unless `--force` is passed.

Recipe mode:

```bash
npx -y --package=tsx --package=sharp tsx scripts/assets/export-responsive.ts \
  --recipe content/assets/export-recipes.json \
  --asset chief-scout-hero
```

Direct mode:

```bash
npx -y --package=tsx --package=sharp tsx scripts/assets/export-responsive.ts \
  --input assets/generated/research-og.png \
  --out assets/generated/social/research-og \
  --width 1200 \
  --height 630 \
  --fit cover \
  --position attention \
  --formats avif,webp,png
```

### 4. `scripts/assets/prep-cutout.ts`

Prepares cutouts and chroma-key masks.

Responsibilities:
- Support explicit chroma key color via `--key "#00ff00"`.
- Support `--sample-corners` to estimate background color.
- Support tolerance, feathering, and spill controls.
- Output normalized PNG, alpha/cutout PNG when possible, matte mask, and checkerboard preview.
- Write to `assets/workbench/cutouts/...` by default.

Example:

```bash
npx -y --package=tsx --package=sharp tsx scripts/assets/prep-cutout.ts \
  --input assets/generated/chief-scout-hero.png \
  --sample-corners \
  --tolerance 34 \
  --feather 2 \
  --out assets/workbench/cutouts/chief-scout-hero
```

Notes:
- This is for chroma-key or simple matte cleanup, not full semantic subject segmentation.
- For full background removal, use this script as a prep/preview stage before external tools such as `rembg`, Photoshop, or commissioned designer cleanup.

### 5. `scripts/assets/upscale-hook.ts`

Creates AI/local upscaling jobs and imports reviewed outputs.

Provider modes:

- `noop` / `dry-run` — write job JSON only.
- `local-cli` — run a command template, e.g. `upscayl -i {input} -o {output} -s {scale}`.
- `replicate` — call Replicate via native `fetch` using `REPLICATE_API_TOKEN`.

Responsibilities:
- Write job manifests to `assets/workbench/upscale/jobs/`.
- Write candidate outputs to `assets/workbench/upscale/outputs/`.
- Move accepted outputs to `assets/generated/upscaled/` only through an explicit `--accept` flow.
- Never overwrite source images.

Dry run:

```bash
npx -y --package=tsx tsx scripts/assets/upscale-hook.ts \
  --provider noop \
  --input assets/generated/research-og.png \
  --scale 2 \
  --output assets/workbench/upscale/outputs/research-og-2x.png \
  --dry-run
```

Local CLI:

```bash
npx -y --package=tsx tsx scripts/assets/upscale-hook.ts \
  --provider local-cli \
  --input assets/generated/research-og.png \
  --scale 2 \
  --output assets/workbench/upscale/outputs/research-og-2x.png \
  --command 'upscayl -i {input} -o {output} -s {scale}'
```

### 6. `scripts/assets/generate-contact-sheet.ts`

Generates visual review sheets.

Responsibilities:
- Read the asset ledger.
- Filter by status, kind, path, or tag.
- Produce a PNG contact sheet with filename, dimensions, status, and ID.
- Useful for reviewing generated batches and commissions.

Example:

```bash
npx -y --package=tsx --package=sharp tsx scripts/assets/generate-contact-sheet.ts \
  --status candidate,approved \
  --out assets/workbench/contact-sheets/candidates.png
```

## Other useful helper ideas

### `scripts/assets/inspect-image.ts`

Quick metadata dump for one image.

```bash
npx -y --package=tsx --package=sharp tsx scripts/assets/inspect-image.ts assets/generated/research-og.png
```

### `scripts/assets/make-social-set.ts`

Convenience wrapper around `export-responsive.ts` for OG, Twitter/X, Reddit, and GitHub previews.

### `scripts/assets/compare-before-after.ts`

Creates side-by-side before/after images for upscaling, cutouts, and compression review.

### `scripts/assets/compress-lossless.ts`

Optional wrapper around external tools like `oxipng`, `pngquant`, `cwebp`, or `avifenc` if installed.

## `.gitignore` additions

```gitignore
# Asset production workbench
assets/workbench/
.asset-cache/
```

## Documentation page

Create:

```text
docs/assets/asset-production-workflows.md
```

Include:
- How to sync the ledger.
- How to export responsive crops.
- How to prep cutouts.
- How to run upscaling dry-runs.
- How to review/accept generated outputs.
- Rules for reference vs production assets.
- Social channel export dimensions for Twitter/X, Reddit, and GitHub.

## Implementation sequence

1. Add `.gitignore` workbench/cache entries.
2. Add `content/assets/asset-ledger.json` and `content/assets/export-recipes.json` seed files.
3. Implement shared helpers.
4. Implement `sync-asset-ledger.ts`.
5. Implement `check-asset-ledger.ts`.
6. Implement `export-responsive.ts`.
7. Implement `prep-cutout.ts`.
8. Implement `upscale-hook.ts`.
9. Implement `generate-contact-sheet.ts`.
10. Add docs and CLI examples.
11. Run sync/check once to establish the first committed ledger.

## Risks

- `sharp` native install can be slow or platform-sensitive, especially in Termux.
- AI upscaling/background removal is nondeterministic and should stay review-gated.
- Large generated assets can bloat Git history if workbench outputs are accidentally committed.
- Reference-only assets may be accidentally used as production UI unless validated.
- Once a future `package.json` is added, migrate `tsx`, `sharp`, and any image tooling into `devDependencies` and simplify commands.

---

# GitHub Issue Draft

## Title

Add asset-production helper scripts for responsive exports, cutouts, upscaling, and asset ledger checks

## Body

### Summary

Create a lightweight helper-script toolkit for Gaia Research asset production. This supports the Context Diet launch and future generated/commissioned assets by standardizing crops, responsive exports, background-removal prep, AI upscaling hooks, and asset metadata validation.

### Context

We have approved avatars, North Star reference comps, generated hero/OG assets, and mostly complete Context Diet assets. We need scripts that turn these into production-safe outputs without overwriting masters or committing transient workbench files.

The repo currently has no `package.json`; scripts should use the existing one-off `npx tsx` workflow.

### Proposed files

```text
scripts/assets/lib/args.ts
scripts/assets/lib/hash.ts
scripts/assets/lib/image.ts
scripts/assets/lib/ledger.ts
scripts/assets/lib/paths.ts
scripts/assets/sync-asset-ledger.ts
scripts/assets/check-asset-ledger.ts
scripts/assets/export-responsive.ts
scripts/assets/prep-cutout.ts
scripts/assets/upscale-hook.ts
scripts/assets/generate-contact-sheet.ts
content/assets/asset-ledger.json
content/assets/asset-ledger.schema.json
content/assets/export-recipes.json
docs/assets/asset-production-workflows.md
```

### Tasks

- [ ] Add ignored workbench/cache paths to `.gitignore`.
- [ ] Add asset ledger and export recipe seed files.
- [ ] Add shared TypeScript helper modules.
- [ ] Implement `sync-asset-ledger.ts`.
- [ ] Implement `check-asset-ledger.ts` with `--strict` mode.
- [ ] Implement `export-responsive.ts` for recipe and direct crop modes.
- [ ] Implement `prep-cutout.ts` for chroma-key/matte prep.
- [ ] Implement `upscale-hook.ts` with `noop`, `local-cli`, and optional `replicate` modes.
- [ ] Implement `generate-contact-sheet.ts` for visual review.
- [ ] Document workflows and CLI examples.
- [ ] Run initial ledger sync and check.

### Acceptance criteria

- Source/master assets are never overwritten unless `--force` is explicitly passed.
- Workbench outputs are ignored by Git.
- Responsive exports can be generated for `chief-scout-hero`, `research-og`, Milim avatar, Nova avatar, and Context Diet assets.
- The asset ledger records path, dimensions, byte size, SHA256, status, source type, license/credit, alt text, and derivatives.
- `check-asset-ledger.ts --strict` fails on missing approved-asset metadata or drift.
- Chroma-key prep produces at least a cutout candidate, mask, and checkerboard preview.
- Upscale hook supports dry-run job manifests before any external provider is used.
- Contact sheet generation works for candidate and approved assets.

### Example commands

```bash
npx -y --package=tsx --package=sharp tsx scripts/assets/sync-asset-ledger.ts --scan assets
npx -y --package=tsx --package=sharp tsx scripts/assets/check-asset-ledger.ts --strict
npx -y --package=tsx --package=sharp tsx scripts/assets/export-responsive.ts --recipe content/assets/export-recipes.json --asset chief-scout-hero
npx -y --package=tsx --package=sharp tsx scripts/assets/prep-cutout.ts --input assets/generated/chief-scout-hero.png --sample-corners --tolerance 34 --out assets/workbench/cutouts/chief-scout-hero
npx -y --package=tsx tsx scripts/assets/upscale-hook.ts --provider noop --input assets/generated/research-og.png --scale 2 --output assets/workbench/upscale/outputs/research-og-2x.png --dry-run
```
