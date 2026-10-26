# Thumbnail: `/blog/economics-of-agentic-work`

Generated via the **`milim-editorial-thumbnail`** skill (`.agents/skills/milim-editorial-thumbnail/SKILL.md`) and the permitted fallback model `gemini-3.1-flash-image` (nano-banana-2 per `CLAUDE.md`).

Topic: **The Economics of Agentic Work: When Small Agents Beat Frontier Models. Tiny Milim arranges miniature pastel paper cubes in a vast, sunlit neoclassical library hall.**
Palette: Warm honey-toned oak floor, sunlit cream daylight, soft slate blue shadows, with subtle Milim-pink accents `#ec4899`.

## Prompt

```text
Extreme wide shot, grand architectural perspective.
A colossal, vast neoclassical library hall and book cathedral: soaring multi-tiered balconies, three-story high arched neoclassical windows fill the background with warm golden morning sunlight streaming across the monumental hall in soft dusty rays. Endless towering wooden bookshelves and book-lined walls reach up toward the distant ceiling. Down in the vast hall, polished wooden parquet floors with soft morning light reflections. The monumental, serene architectural library hall fills 95% of the frame, creating enormous calm negative space.

Far away in the hall, sitting peacefully at a polished wooden reading table on the lower-left side, is a truly microscopic, tiny 8-year-old anime chibi girl (occupying only 4-5% of the vertical frame height). She is quietly arranging tiny pastel-colored wooden cubes on the table.

Her appearance: she has very long, perfectly straight, completely loose bright pink hair flowing down her back in a single unbroken drape, completely untied and flat against her back. She has neat straight bangs with two small yellow star clips, blue eyes, an oversized black hoodie with a cute white baby dragon doodle, striped black-and-pink thigh-high socks, and sneakers.

Art style: Flat editorial screenprint illustration with clean graphic silhouettes and subtle paper grain texture. Harmonious palette of warm golden sunlight, honey oak wood, soft slate blue shadows, with a single bright pink accent on the tiny girl's hair. Serene, quiet, dramatic sense of scale. No twintails, no pigtails, no text, no watermark.
```

## Approved scene

The approved candidate depicts a microscopic chibi girl seated peacefully at an oak table in an immense, soaring multi-tiered neoclassical library cathedral with sunlight pouring through triple-height arched windows. She arranges small pastel-colored cubes on the table. Her hair flows straight and completely loose down her back with neat bangs and yellow star hairclips, strictly free of twintails or ahoge. The architecture and tranquil negative space occupy over 90% of the frame.

## Production Pipeline

1. Candidate generated into `assets/workbench/generated/economics-of-agentic-work-raw-v5.png` via `gemini-3.1-flash-image` (nano-banana-2).
2. Export 1600×900 WebP (quality 90, fit cover, position attention) to both:
   - `assets/generated/economics-of-agentic-work-editorial-thumbnail.webp`
   - `public/assets/economics-of-agentic-work-editorial-thumbnail.webp`
3. Ledger synchronization and validation:
   ```bash
   npx tsx scripts/assets/sync-asset-ledger.ts
   npx tsx scripts/assets/check-asset-ledger.ts --strict
   ```
