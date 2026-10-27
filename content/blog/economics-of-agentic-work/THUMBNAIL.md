# Thumbnail: `/blog/economics-of-agentic-work`

Generated via the **`milim-editorial-thumbnail`** skill (`.agents/skills/milim-editorial-thumbnail/SKILL.md`) and the permitted fallback model `gemini-3.1-flash-image` (nano-banana-2 per `CLAUDE.md`).

Topic: **The Economics of Agentic Work: When Small Agents Beat Frontier Models. Four chibi expedition scouts plan a coordinated route around a large map table in a monumental cartography cathedral.**
Palette: Deep archive indigo, classical marble stone arches, warm brass gold, glowing lantern amber, with cheerful Milim-pink accents `#ec4899`.

## Prompt

```text
Wide architectural shot of a monumental, colossal neoclassical map archive and vaulted cartography cathedral. Soaring three-tier colonnades and high arched clerestory windows stream golden morning light across vast polished stone floors. In the background across the grand archive, distant scholars browse tall oak map drawers and study large globes under soft dusty sunbeams.

In the midground around a wide circular low oak table, a cooperative expedition team of four tiny 8-year-old anime chibi scouts work together happily planning a route on a vast spread-out parchment chart:
- In the center, a tiny anime chibi girl with very long, perfectly straight, completely loose bright pink hair flowing down her back in a single unbroken drape, completely untied and flat against her back. She has neat straight bangs with two small yellow star clips, blue eyes, an oversized black hoodie with a cute white baby dragon doodle, striped black-and-pink thigh-high socks, and sneakers. She places a small brass compass marker onto the map.
- On her left, a cheerful chibi friend in a navy hoodie holds a magnifying glass.
- On her right, a chibi friend in an ochre sweater points at the chart.
- Beside them, a third chibi friend holds a tiny glowing brass lantern.

Art style: Flat editorial screenprint illustration with clean graphic silhouettes and subtle paper grain texture. Harmonious palette of deep indigo archive tones, warm golden sunlight, honey oak wood, brass gold. Grand scale, adventurous teamwork. No twintails, no pigtails, no ahoge, no text, no watermark.
```

## Approved scene

The approved candidate (Option 1C: The Cartography Cathedral) depicts four tiny chibi scouts collaborating around a circular oak table in an immense vaulted map hall with soaring classical archways and streaming morning sunbeams. Milim places a brass compass marker on the chart while her fellow scouts examine with a magnifying glass, point to coordinates, and illuminate the parchment with a warm lantern. Distant scholars and towering globes populate the background. Milim's hair flows straight and completely loose down her back with neat bangs and yellow star clips, strictly free of twintails or ahoge.

## Production Pipeline

1. Candidate generated into `assets/workbench/generated/economics-var-1c-scouts.png` via `gemini-3.1-flash-image` (nano-banana-2).
2. Export 1600×900 WebP (quality 90, fit cover, position attention) to both:
   - `assets/generated/economics-of-agentic-work-editorial-thumbnail.webp`
   - `public/assets/economics-of-agentic-work-editorial-thumbnail.webp`
3. Ledger synchronization and validation:
   ```bash
   npx tsx scripts/assets/sync-asset-ledger.ts
   npx tsx scripts/assets/check-asset-ledger.ts --strict
   ```
