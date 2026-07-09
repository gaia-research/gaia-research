# Pi Image Gen Production Playbook

_Last updated: 2026-07-09_

This playbook explains how to use pi-image-gen / image generation together with the Gaia Research asset helper scripts to reach the desired look, resolution, transparency, and file size for generated or commissioned assets.

## Mandatory model rule

- **Always use image gen 2 / `gpt-image-2`.**
- **Never use `nano-banana` or `nano-banana-2` for Gaia Research production assets.**
- If using `omniflash`, set `model_id: "gpt-image-2"`.
- If using pi-image-gen / `image_generate`, confirm the active default model is image gen 2 / `gpt-image-2` before generating. If the model cannot be confirmed, pause and ask for confirmation.

## Related files

- Skill: `.agents/skills/gaia-image-production/SKILL.md`
- Helper scripts: `scripts/assets/`
- Workflow docs: `docs/assets/asset-production-workflows.md`
- Asset ledger: `content/assets/asset-ledger.json`
- Export recipes: `content/assets/export-recipes.json`
- Workbench: `assets/workbench/` — ignored, use for experiments
- Production generated assets: `assets/generated/`

## Harness workflow

### 1. Define the asset target

Capture:

```text
Asset name:
Surface:
Purpose:
Aspect ratio:
Final dimensions:
Transparent background needed? yes/no
Reference images:
Desired mood:
File size goal:
Acceptance criteria:
```

Example:

```text
Asset name: context-diet-og
Surface: Context Diet Lab / social preview
Purpose: OG card background with safe text area
Aspect ratio: 1.91:1
Final dimensions: 1200×630
Transparent background: no
Mood: Cyber-Slime Laboratory, token-compression HUD, Milim Pink + Rimuru Blue
File size goal: < 500 KB WebP, PNG fallback acceptable
Acceptance: no rasterized small text, clear center/left safe area, original characters only
```

### 2. Generate concepts in parallel

Use parallel generation when exploring directions. Each prompt should vary composition, not brand fundamentals.

Branches:

1. Hero with left text-safe negative space.
2. Close-up mascot/operator energy.
3. Abstract Context Diet token-compression dashboard.
4. Chroma-key/cutout-friendly character or mascot.

`omniflash` example:

```json
{
  "model_id": "gpt-image-2",
  "aspect_ratio": "16:9",
  "prompt": "Original Gaia Research Cyber-Slime Laboratory hero illustration for Context Diet Lab 001. Obsidian dark research lab, Milim Pink #ec4899 and Rimuru Blue #38bdf8 HUD lines, token streams compressing into a clean SKILL.md export module, generous empty space on the left for semantic HTML heading, no readable UI text, no logos, no watermark, original characters only."
}
```

`image_generate` example after confirming active model is image gen 2:

```json
{
  "prompt": "Original Gaia Research Cyber-Slime Laboratory hero illustration for Context Diet Lab 001...",
  "size": "1536x1024",
  "filename": "context-diet-hero-v01",
  "outputDir": "assets/workbench/generated"
}
```

### 3. Select and refine in a chain

Once a candidate is chosen:

1. Feed the chosen image back as reference.
2. Keep the same composition if it works.
3. Change one or two things per pass.
4. Save versions as `v01`, `v02`, `v03`.

Refinement prompt example:

```text
Use the reference image as the base. Keep the same original character and cyber lab composition. Increase the empty dark space on the left by 20%, reduce tiny unreadable UI glyphs, make token-compression streams clearer, preserve Milim Pink and Rimuru Blue accents, no text, no watermark.
```

### 4. Sync ledger after adding assets

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/sync-asset-ledger.ts
```

### 5. Crop and export production variants

Recipe mode:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/export-responsive.ts \
  --recipe content/assets/export-recipes.json \
  --asset chief-scout-hero
```

Direct social export:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/export-responsive.ts \
  --input assets/workbench/generated/context-diet-og-v01.png \
  --out assets/workbench/exports/context-diet-og \
  --width 1200 \
  --height 630 \
  --fit cover \
  --position attention \
  --formats avif,webp,png \
  --force
```

### 6. Make transparent cutouts when needed

Generate or commission the subject on a clean matte/chroma background, then run:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/prep-cutout.ts \
  --input assets/workbench/generated/context-diet-mascot-v01.png \
  --sample-corners \
  --tolerance 34 \
  --feather 2 \
  --out assets/workbench/cutouts/context-diet-mascot-v01
```

Review the checkerboard preview before accepting the cutout.

### 7. Upscale through the review-gated hook

Dry-run job:

```bash
npx -y --package=tsx tsx scripts/assets/upscale-hook.ts \
  --provider noop \
  --input assets/workbench/generated/context-diet-hero-v01.png \
  --scale 2 \
  --dry-run
```

Accept reviewed output:

```bash
npx -y --package=tsx tsx scripts/assets/upscale-hook.ts \
  --accept \
  --input assets/workbench/upscale/outputs/context-diet-hero-v01-2x.png \
  --output assets/generated/upscaled/context-diet-hero-v01-2x.png
```

### 8. Review with a contact sheet

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/generate-contact-sheet.ts \
  --status candidate,approved \
  --out assets/workbench/contact-sheets/candidates.png \
  --force
```

### 9. Validate final state

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/check-asset-ledger.ts
```

Use strict mode before production merge:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/check-asset-ledger.ts --strict
```

## Prompt checklist

Include:

- Original Gaia Research mascots/characters only.
- Cyber-Slime Laboratory.
- Obsidian dark lab canvas.
- Milim Pink `#ec4899`.
- Rimuru Blue `#38bdf8`.
- Sharp HUD/grid geometry.
- Text-safe empty space if UI copy will be HTML.
- No watermark, no logos, no direct IP copying.
- No rasterized small UI text.

For Context Diet, add:

- token streams being compressed
- prompt analyzer panes
- context window shrink/compression metaphor
- benchmark meter
- SKILL.md export motif
- rigorous but playful research feel

## Final handoff checklist

- [ ] Source master saved under appropriate `assets/` path or workbench.
- [ ] Ledger synced.
- [ ] Crops/exports generated.
- [ ] Cutout preview reviewed if transparency is needed.
- [ ] Upscale output reviewed before acceptance.
- [ ] Contact sheet generated for batches.
- [ ] Basic ledger check passes.
- [ ] Final paths and markdown previews shared.
