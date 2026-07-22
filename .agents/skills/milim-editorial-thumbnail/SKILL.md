---
name: milim-editorial-thumbnail
description: Create or refine calm, flat 16:9 Gaia Research editorial thumbnails featuring a tiny, curious Milim within a large slice-of-life world. Use for blog cards and inline editorial art that needs the approved screenprint palette, workbench-first production, and asset-ledger promotion.
---

# Milim Editorial Thumbnail

Create an editorial moment, not a product illustration, explainer, diagram, or hero scene.

## Guardrails

- Read `../marketing-tasks/MILIM.md` before depicting Milim; it is the character authority. Keep her childlike, long-haired, unbound, and never give her twintails.
- Generate only with image gen 2 / `gpt-image-2`. Never use nano-banana variants.
- Start every generation in `assets/workbench/generated/`. Keep approved source art there; promote a production derivative only after review.
- Use 16:9 landscape, usually 1600×900 WebP for a blog card or inline image.
- Do not use trees, roots, branches, canopies, forests, or tree-derived imagery as the subject. The scale reference is composition only.
- Never add readable text, letters, numbers, labels, logos, watermarks, UI, code, dashboards, charts, graphs, diagrams, or report pages.

## Visual language

- Use a restrained flat screenprint/editorial treatment: deep navy and ink, warm paper/cream, and a single Milim-pink accent. Cyan is sparing, never a neon interface glow.
- Prefer broad color planes, a small amount of paper grain, simple silhouettes, and calm negative space over cinematic detail, dense linework, or glossy realism.
- Let the world own at least 85% of the frame. Place Milim small—about 8% of image height—usually at lower-right, looking at an object rather than addressing the reader.
- Make her curious, slightly tentative, and absorbed in discovery. She is not an authoritative presenter, a report author, or a mascot posing for the camera.

## Scene prompts

Choose one quiet, non-research slice-of-life setting and vary it across posts:

- Moonlit observatory archive: circular shelves, blank paper constellations, simple orrery rings, and a reading stool.
- Rainy transit conservatory: tiled platforms, paper tickets without text, distant lamps, and a tiny found object under a loupe.
- Night market stationery stall: oversized blank notebooks, folded paper stars, awnings, and a small paper fragment being inspected.
- Harbor map room: calm portholes, unlabeled folded charts kept abstract, brass lenses, and a tiny bottle with a glowing pebble.
- Desert planetarium rest stop: broad moon, soft geometric shelters, specimen jars, and a small constellation card with no marks.

Do not turn any setting into a lab, office, library stock photo, or technical demonstration.

## Prompt skeleton

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail and optional inline editorial image.
Primary request: [one scene from the list] with a huge calm environment and tiny Milim lower-right, quietly examining [small object] with a magnifying glass.
Style: flat editorial screenprint; navy/ink + warm paper + one Milim-pink accent; broad shapes, light paper grain, restrained detail.
Composition: world occupies at least 85%; calm upper-left negative space; Milim is about 8% of image height and does not look at the viewer.
Constraints: original character only; no tree-derived imagery; no text, UI, code, charts, graphs, diagrams, logos, watermarks, or hyper-detailed cinematic rendering.
```

## Production workflow

1. Generate the candidate with `gpt-image-2` into `assets/workbench/generated/` and inspect it at full size. Reject output that makes Milim dominant or introduces chart-like, textual, or UI elements.
2. Preserve the approved source in workbench. Export the reviewed image to `assets/generated/` with the Gaia helper at quality 90:

   ```bash
   npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
     tsx scripts/assets/export-responsive.ts \
     --input assets/workbench/generated/<source>.png \
     --out assets/generated/<asset-id> \
     --width 1600 --height 900 --fit cover --position attention \
     --formats webp --quality 90
   ```

3. Run `sync-asset-ledger.ts`, then set the generated asset to `candidate` or `approved` only with a meaningful alt text, license, credit, and notes that identify the approved workbench source.
4. Run `check-asset-ledger.ts --strict`. Do not wire the image into a page unless that integration is separately requested.
