# Thumbnail — `/blog/capability-amplification`

Generated via the **`milim-thumbnail`** skill (`.agents/skills/milim-thumbnail/SKILL.md`) using dramatic scale (Milim 4–6% frame height), vast negative space (88–92%), and character guardrails. Model used: `image-gen-2.5` via Codex CLI.

Topic: **Capability amplification: when structured agent scaffolding enables cheaper models to punch above their weight.**
Palette: Warm golden brass, vellum cream, charcoal slate, and a single Milim-pink accent `#ec4899`.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: Extreme wide shot, camera pulled far back across a vast cavernous sunlit horology drafting hall with soaring floor-to-ceiling glass archways, massive suspended brass pendulum discs, towering drafting tables, and enormous empty polished parquet floors. In the far distance on the lower right floor, two microscopic tiny chibi figures: normal tiny 8-year-old chibi girl Milim Nova gently lifting and boosting an even tinier miniature chibi twin Milim with both hands upward toward a low wooden drawer handle. Scale directive: both characters are microscopic and tiny, occupying only 4% of the total frame height; the vast architectural hall occupies 94% of the frame with massive, serene, uncluttered negative space and soft morning daylight. Character details for both: very long unbound vibrant pink hair (NO TWINTAILS), blue eyes, two yellow star hairpins, oversized black hoodie with cute white baby dragon print, black thigh-high socks with pink stripes.
Style: flat 2D editorial screenprint illustration, risograph print texture, broad flat color shapes, matte paper finish, warm golden brass, vellum cream, charcoal slate, and single Milim-pink accent #ec4899; entirely flat art, no 3D rendering, no hyper-detailed anime shine.
Constraints: no tree-derived imagery; no text, letters, numbers, UI, code, charts, graphs, diagrams, logos, or watermarks.
```

## Production Pipeline

1. Candidate generated into `assets/workbench/generated/capability-amplification-editorial-thumbnail.png` using `image-gen-2.5` via Codex CLI.
2. Export 1600×900 WebP (quality 90, fit cover, position center) to both:
   - `assets/generated/capability-amplification-editorial-thumbnail.webp`
   - `public/assets/capability-amplification-editorial-thumbnail.webp`
3. Ledger synchronization and validation:
   ```bash
   npx tsx scripts/assets/sync-asset-ledger.ts
   npx tsx scripts/assets/check-asset-ledger.ts --strict
   ```
