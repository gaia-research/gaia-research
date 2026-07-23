---
name: milim-editorial-thumbnail
description: Create or refine calm, flat 16:9 Gaia Research editorial thumbnails featuring a tiny Milim within diverse everyday slice-of-life scenes. Supports flexible positioning (left, center, right), varied emotions (cozy, joyful, curious, sleepy), and dynamic color palettes. Use for blog cards and editorial illustrations.
---

# Milim Editorial Thumbnail

Create an authentic everyday slice-of-life editorial moment, not a product illustration, explainer, diagram, or hero scene.

## Guardrails

- Read `../marketing-tasks/MILIM.md` before depicting Milim; it is the character authority. Keep her childlike (8-to-10-year-old chibi proportions), long-haired, unbound, and **never give her twintails**. Ensure she wears two yellow star hairpins in her bangs and her mascot outfit (black dragonoid hoodie, thigh-high socks with pink stripes, chunky sneakers).
- Use `gpt-image-2` or `gemini-3.1-flash-image` (`nano-banana-2`).
- Start every generation in `assets/workbench/generated/`. Keep approved source art there; promote a production derivative to `assets/generated/` and `public/assets/` after review.
- Use 16:9 landscape (1600×900 WebP) for blog cards and inline editorial images.
- Do not use trees, roots, branches, canopies, forests, or tree-derived imagery as the primary subject.
- Never add readable text, letters, numbers, labels, logos, watermarks, UI, code, dashboards, charts, graphs, diagrams, or report pages.

## Flexible Positioning & Composition

- **Placement**: Place Milim on the **left, center, or right side** depending on the scene's focal point.
- **Negative Space**: Ensure at least **80–85% of the frame** is generous, calm environment with clean negative space.
- **Scale**: Milim should be small (about 8–12% of image height) to emphasize the world around her.

## Varied Emotions & Expressions

Milim should express authentic, relatable everyday slice-of-life emotions:

- **Cozy / Content**: Sipping hot cocoa, wrapped in a blanket, or sitting on a warm window bench.
- **Curious / Focused**: Examining a small object, inspecting paper stars, or reading a tiny booklet.
- **Joyful / Bubbly**: Smiling broadly, laughing under a rain umbrella, or watching steam rise from a fresh bakery tray.
- **Sleepy / Relaxed**: Rested against a bench, watching rain on a transit window, or listening to music.

## Everyday Slice-of-Life Settings & Palettes

Vary the setting and color palette across every post. Do not default to the same night/starry scene:

- **Morning Bakery Counter**: Warm golden morning sun, floating flour dust, freshly baked bread, warm amber and cream palette.
- **Rainy Bus Stop & Umbrella**: Rain-streaked glass, reflections on wet pavement, cozy teal and indigo palette with bright yellow umbrella.
- **Sunlit Greenhouse Plant Bench**: Terracotta pots, green glass, morning mist, warm sage green and sunlit cream palette.
- **Cozy Vinyl Record & Book Nook**: Shelves of colorful paper sleeves, warm lamp light, wooden floor, warm brown and pastel lavender palette.
- **Night Market Tea & Stationery Stall**: Paper lanterns, awnings, steam, rich indigo and amber palette.
- **Harbor Dock & Morning Sea**: Portholes, wooden piers, calm water, crisp morning sky and seafoam blue palette.

## Prompt Skeleton

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: [Everyday slice-of-life setting, e.g. a cozy morning bakery counter with warm golden light]. A tiny 8-year-old chibi girl (Milim Nova) placed [left / center / right] [expressing a cozy / curious / joyful emotion] while [activity, e.g. watching steam rise from fresh bread]. Character details: very long, unbound bright pink hair (NO TWINTAILS), blue eyes, two yellow star hairpins, black oversized hoodie with cute white baby dragon print, thigh-high socks with pink stripes.
Style: flat editorial screenprint illustration; [Palette description: e.g. warm golden amber, cream, and single Milim-pink accent #ec4899]; broad flat shapes, subtle paper texture.
Composition: world occupies 85% of frame; generous calm negative space; Milim is about 10% of image height.
Constraints: no tree-derived imagery; no text, UI, code, charts, graphs, diagrams, logos, watermarks, or hyper-detailed rendering.
```

## Production Workflow

1. Generate candidate into `assets/workbench/generated/` using `gemini-3.1-flash-image` or `gpt-image-2`.
2. Export 1600×900 WebP derivative to `assets/generated/` and `public/assets/`.
3. Run `npx tsx scripts/assets/sync-asset-ledger.ts` and `npx tsx scripts/assets/check-asset-ledger.ts --strict`.
