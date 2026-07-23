---
name: milim-editorial-thumbnail
description: Create or refine calm, flat 16:9 Gaia Research editorial thumbnails featuring a tiny Milim within vast everyday slice-of-life scenes. Emphasizes dramatic scale (Milim 4-6% frame height), flexible positioning (left, center, right), expansive negative space (88-92%), varied emotions, and dynamic color palettes.
---

# Milim Editorial Thumbnail

Create an authentic everyday slice-of-life editorial moment, not a product illustration, explainer, diagram, or hero scene.

## Scale & Composition (Dramatic Scale & Negative Space)

- **Scale Ratio**: Milim MUST be **very small (about 4–6% of total image height)**. Her tiny size creates a dramatic sense of scale against the surrounding world.
- **World Ownership**: The environment MUST occupy **88–92% of the frame**, offering expansive, calm negative space.
- **Flexible Positioning**: Milim can be placed on the **left, center, or right side** depending on the focal point, framed by the surrounding atmosphere.

## Guardrails

- Read `../marketing-tasks/MILIM.md` before depicting Milim; it is the character authority. Keep her childlike (8-to-10-year-old chibi proportions), long-haired, unbound, and **never give her twintails**. Ensure she wears two yellow star hairpins in her bangs and her mascot outfit (black dragonoid hoodie, thigh-high socks with pink stripes, chunky sneakers).
- Use `gpt-image-2` or `gemini-3.1-flash-image` (`nano-banana-2`).
- Start every generation in `assets/workbench/generated/`. Keep approved source art there; promote a production derivative to `assets/generated/` and `public/assets/` after review.
- Use 16:9 landscape (1600×900 WebP) for blog cards and inline editorial images.
- Do not use trees, roots, branches, canopies, forests, or tree-derived imagery as the primary subject.
- Never add readable text, letters, numbers, labels, logos, watermarks, UI, code, dashboards, charts, graphs, diagrams, or report pages.

## Varied Emotions & Expressions

Milim should express authentic, relatable everyday slice-of-life emotions:

- **Cozy / Content**: Sipping hot cocoa, wrapped in a blanket, or sitting on a warm window bench.
- **Curious / Focused**: Examining a small object, inspecting paper stars, or reading a tiny booklet.
- **Joyful / Bubbly**: Smiling broadly, laughing under a rain umbrella, or watching steam rise from a fresh bakery tray.
- **Sleepy / Relaxed**: Rested against a bench, watching rain on a transit window, or listening to music.

## Everyday Slice-of-Life Settings & Palettes

Vary the setting and color palette across every post. Do not default to the same night/starry scene:

- **Vast Morning Bakery Conservatory**: High sunlit glass arches, floating flour dust, towering bread racks, warm golden amber and cream palette.
- **Rainy Bus Stop & Umbrella**: Rain-streaked glass, reflections on wet pavement, cozy teal and indigo palette with bright yellow umbrella.
- **Sunlit Greenhouse Plant Bench**: Terracotta pots, green glass, morning mist, warm sage green and sunlit cream palette.
- **Cozy Vinyl Record & Book Nook**: Towering shelves of colorful paper sleeves, warm lamp light, wooden floor, warm brown and pastel lavender palette.
- **Night Market Tea & Stationery Stall**: Paper lanterns, awnings, steam, rich indigo and amber palette.
- **Harbor Dock & Morning Sea**: Portholes, wooden piers, calm water, crisp morning sky and seafoam blue palette.

## Prompt Skeleton

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: [Vast everyday slice-of-life setting with huge architecture/environment]. A microscopic, tiny 8-year-old chibi girl (Milim Nova) placed [left / center / right] [expressing emotion] while [activity]. Scale directive: Milim is extremely small, about 5% of total image height; the surrounding world occupies 90% of the frame with huge calm negative space. Character details: very long, unbound bright pink hair (NO TWINTAILS), blue eyes, two yellow star hairpins, black oversized hoodie with cute white baby dragon print, thigh-high socks with pink stripes.
Style: flat editorial screenprint illustration; [Palette description: e.g. warm golden amber, cream, and single Milim-pink accent #ec4899]; broad flat shapes, subtle paper texture.
Constraints: no tree-derived imagery; no text, UI, code, charts, graphs, diagrams, logos, watermarks, or hyper-detailed rendering.
```

## Production Workflow

1. Generate candidate into `assets/workbench/generated/` using `gemini-3.1-flash-image` or `gpt-image-2`.
2. Export 1600×900 WebP derivative to `assets/generated/` and `public/assets/`.
3. Run `npx tsx scripts/assets/sync-asset-ledger.ts` and `npx tsx scripts/assets/check-asset-ledger.ts --strict`.
