# Thumbnail: `/blog/economics-of-agentic-work`

Generated via the **`milim-editorial-thumbnail`** skill (`.agents/skills/milim-editorial-thumbnail/SKILL.md`) and the permitted fallback model `gemini-3.1-flash-image` (nano-banana-2 per `CLAUDE.md`).

Topic: **The Economics of Agentic Work: When Small Agents Beat Frontier Models. Tiny Milim arranges miniature pastel paper cubes in a vast, sunlit neoclassical library hall.**
Palette: Warm honey-toned oak floor, sunlit cream daylight, soft slate blue shadows, with subtle Milim-pink accents `#ec4899`.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research editorial blog thumbnail.
Primary request: Extreme wide angle, bird's-eye or high-angle view of a monumental, colossal neoclassical library hall. Soaring multi-level balconies, vast three-story arched windows streaming golden morning sunlight, and endless rows of floor-to-ceiling wooden bookshelves occupy 95% of the frame. Down in the vast hall, far in the distance on one of the polished oak reading tables in the lower left, sits a truly microscopic, tiny chibi girl (Milim Nova), standing only 4% of the total image height. She is peacefully arranging small pastel paper cubes.
Scale directive: Milim is microscopic, barely 4-5% of frame height, a tiny speck of pink within an immense, quiet architectural cathedral of books. Massive negative space of 92% calm environment.
Character details: long flowing unbound pink hair resting straight down her back without any ties or twintails, two tiny yellow star clips in bangs, black oversized hoodie with white baby dragon icon, striped socks.
Style: flat editorial screenprint illustration; warm golden sunlight, honey oak wood, soft slate blue shadows, subtle paper grain texture.
Constraints: strictly no twintails, hair must be loose and unbound; no tree imagery; no text, letters, numbers, signs, UI, or watermarks.
```

## Approved scene

The candidate depicts a microscopic Milim seated peacefully at a massive oak table in an immense, soaring multi-tiered neoclassical library cathedral with sunlight pouring through triple-height arched windows. She arranges small pastel-colored cubes on the table. The architecture and tranquil negative space occupy over 90% of the frame.

## Production Pipeline

1. Candidate generated into `assets/workbench/generated/economics-of-agentic-work-raw-v2.png` via `gemini-3.1-flash-image` (nano-banana-2).
2. Export 1600×900 WebP (quality 90, fit cover, position attention) to both:
   - `assets/generated/economics-of-agentic-work-editorial-thumbnail.webp`
   - `public/assets/economics-of-agentic-work-editorial-thumbnail.webp`
3. Ledger synchronization and validation:
   ```bash
   npx tsx scripts/assets/sync-asset-ledger.ts
   npx tsx scripts/assets/check-asset-ledger.ts --strict
   ```
