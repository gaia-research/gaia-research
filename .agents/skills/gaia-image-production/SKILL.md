---
name: gaia-image-production
description: Gaia Research image-generation harness for pi-image-gen/gpt-image-2 workflows. Use when generating, iterating, refining, cropping, upscaling, making transparent cutouts, compressing, or ledgering visual assets for Gaia Research, especially Context Diet, Milim/Nova, hero, OG, and social images. Always use image gen 2 / gpt-image-2 and never nano-banana.
---

# Gaia Image Production Harness

Use this skill whenever the user asks for generated images, image iteration, asset production, responsive crops, transparency/cutouts, upscaling, social cards, or final production exports in this repository.

## Hard rule: model selection

- **Always use image gen 2 / `gpt-image-2`.**
- **Never use `nano-banana`, `nano-banana-2`, or any cheap/fast image model for Gaia production assets.**
- If using the `omniflash` tool for image generation, pass `model_id: "gpt-image-2"`.
- If using the `image_generate` / pi-image-gen tool, first ensure the configured default model is image gen 2 / `gpt-image-2`. If unsure, stop and ask the user to confirm the active pi-image-gen model rather than generating with an unknown model.

## Canonical repo paths

- Asset helper scripts: `scripts/assets/`
- Asset workflow docs: `docs/assets/asset-production-workflows.md`
- Asset ledger: `content/assets/asset-ledger.json`
- Export recipes: `content/assets/export-recipes.json`
- Workbench outputs: `assets/workbench/` (gitignored)
- Approved/generated masters: `assets/generated/`
- Brand/avatar assets: `assets/brand/`

## Standard workflow

### 1. Read the current brief and references

Check the relevant docs before generating:

```bash
# Read only as needed, do not dump huge files to the user.
```

Use these references:

- `DESIGN.md` — Cyber-Slime Laboratory visual system.
- `PRODUCT.md` — Milim voice and brand personality.
- `docs/plans/north-star-decisions-and-asset-commission.md` — locked decisions and asset backlog.
- `docs/assets/asset-production-workflows.md` — helper script usage.

### 2. Plan the asset batch

Before generation, specify:

- asset purpose: hero, OG, social, badge, icon, cutout, UI panel, empty state, etc.
- target route/surface: homepage, Context Diet, Twitter/X, Reddit, GitHub, docs.
- required aspect ratios and final dimensions.
- whether transparent background is needed.
- source references to preserve.
- acceptance criteria: look, resolution, transparency, file size, alt text.

### 3. Generate with image gen 2 only

Preferred `omniflash` example:

```ts
omniflash({
  model_id: "gpt-image-2",
  aspect_ratio: "16:9",
  prompt: "Cyber-Slime Laboratory hero art for Gaia Research..."
})
```

Preferred `image_generate` example when the default is confirmed as image gen 2:

```ts
image_generate({
  prompt: "Cyber-Slime Laboratory hero art for Gaia Research...",
  size: "1536x1024",
  filename: "context-diet-hero-v01",
  outputDir: "assets/workbench/generated"
})
```

Prompt rules:

- Ask for **original characters only**; no direct anime/IP copying.
- Do not request rasterized UI text unless it is a one-off social graphic.
- Leave negative/quiet space where semantic HTML text will sit.
- Use Gaia colors: Milim Pink `#ec4899`, Rimuru Blue `#38bdf8`, obsidian dark canvas.
- For Context Diet, emphasize token streams, compressed context windows, prompt analysis, benchmark meters, and SKILL.md export motifs.
- For transparency/cutouts, request a clean solid background or high-contrast matte to make cutout prep easier.

### 4. Iterate in parallel when exploring concepts

For concept exploration, run multiple independent generations with varied prompts/aspect ratios. Keep each output in `assets/workbench/generated/` until reviewed.

Example prompt branches:

1. Hero composition with left negative space.
2. Badge/icon composition with centered symbol.
3. Social/OG composition with safe title area.
4. Transparent cutout subject on solid chroma background.

After generation, compare outputs and select the strongest candidate before doing expensive upscale/export work.

### 5. Iterate in a chain when refining one image

For a selected candidate:

1. Feed the selected image back as a reference.
2. Ask for targeted changes only.
3. Keep filename versions: `context-diet-hero-v01`, `v02`, `v03`.
4. Stop when composition, style, and crop safety are correct.

### 6. Sync the asset ledger

After adding any generated or curated image under `assets/`, run:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/sync-asset-ledger.ts
```

### 7. Create crops and responsive exports

Recipe mode:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/export-responsive.ts \
  --recipe content/assets/export-recipes.json \
  --asset chief-scout-hero
```

Direct mode:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/export-responsive.ts \
  --input assets/workbench/generated/context-diet-hero-v01.png \
  --out assets/workbench/exports/context-diet-hero \
  --width 1200 \
  --height 630 \
  --fit cover \
  --position attention \
  --formats avif,webp,png
```

### 8. Prepare transparency or chroma-key cutouts

Use this when the asset needs transparent background:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/prep-cutout.ts \
  --input assets/workbench/generated/context-diet-character-v01.png \
  --sample-corners \
  --tolerance 34 \
  --feather 2 \
  --out assets/workbench/cutouts/context-diet-character-v01
```

Review:

- `*-cutout.png`
- `*-mask.png`
- `*-preview.png`
- `*-normalized.png`

Only promote reviewed cutouts to `assets/generated/` or `assets/brand/`.

### 9. Upscale through review-gated hook

Dry run first:

```bash
npx -y --package=tsx tsx scripts/assets/upscale-hook.ts \
  --provider noop \
  --input assets/workbench/generated/context-diet-hero-v01.png \
  --scale 2 \
  --dry-run
```

Local CLI example:

```bash
npx -y --package=tsx tsx scripts/assets/upscale-hook.ts \
  --provider local-cli \
  --input assets/workbench/generated/context-diet-hero-v01.png \
  --scale 2 \
  --command 'upscayl -i {input} -o {output} -s {scale}'
```

Accept only after visual review:

```bash
npx -y --package=tsx tsx scripts/assets/upscale-hook.ts \
  --accept \
  --input assets/workbench/upscale/outputs/context-diet-hero-v01-2x.png \
  --output assets/generated/upscaled/context-diet-hero-v01-2x.png
```

### 10. Generate contact sheets for review

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/generate-contact-sheet.ts \
  --status candidate,approved \
  --out assets/workbench/contact-sheets/candidates.png \
  --force
```

### 11. Validate before final handoff

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/check-asset-ledger.ts
```

Use strict mode before production commits:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/check-asset-ledger.ts --strict
```

## Output standards

- Hero desktop: 1920×1080 AVIF/WebP preferred.
- Hero tablet: 1024×768 AVIF/WebP.
- Hero mobile: 768×1024 AVIF/WebP.
- OG: 1200×630 PNG/WebP.
- Twitter/X: 1200×675 or 1600×900.
- GitHub social: 1280×640 PNG.
- Reddit banner: 1920×384 PNG/WebP.
- Avatars: 512, 256, 128 PNG/WebP.
- Transparent overlays: PNG with alpha, plus preview on checkerboard.

## Final response checklist

When handing off image work, report:

- source generation path(s)
- selected final path(s)
- derivative path(s)
- whether ledger was synced
- validation result
- remaining manual review needs
- markdown image previews for generated images when useful
