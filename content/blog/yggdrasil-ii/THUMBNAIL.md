# Thumbnail — `/blog/yggdrasil-ii`

Generate via the **`milim-editorial-thumbnail`** skill
(`.agents/skills/milim-editorial-thumbnail/SKILL.md`) — its prompt skeleton,
scale/negative-space rules, and character guardrails are the peg. Model is
**`gpt-image-2`** only (CLAUDE.md hard rule; never `nano-banana` / `omniflash`).

Topic: **gardening slice-of-life**. Palette: the skill's *Sunlit Greenhouse
Plant Bench* setting (warm sage green + sunlit cream + terracotta), single
Milim-pink accent `#ec4899`.

## Prompt (fills the skill's Prompt Skeleton)

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: A vast, sunlit greenhouse conservatory — towering terracotta pots, high green-glass arches, long wooden potting benches, soft drifting morning mist and floating dust motes catching the light. A microscopic, tiny 8-year-old chibi girl (Milim Nova) placed on the lower-right of a potting bench, kneeling contentedly as she tends one single small seedling in a little clay pot. Scale directive: Milim is extremely small, about 5% of total image height; the surrounding greenhouse occupies about 90% of the frame with huge calm negative space above and to the left.
Character details: very long, unbound bright pink hair (NO TWINTAILS), blue eyes, two yellow star hairpins in her bangs, black oversized hoodie with a cute white baby dragon print, thigh-high socks with pink stripes, chunky high-top sneakers.
Style: flat editorial screenprint illustration; warm sage-green, sunlit cream, and terracotta palette with a single Milim-pink accent #ec4899; broad flat shapes, subtle paper texture.
Constraints: no tree-derived imagery as the primary subject (no world-trees, roots, branches, canopies, or forests); no readable text, letters, numbers, labels, logos, watermarks, UI, code, charts, graphs, diagrams, or report pages; not hyper-detailed rendering.
```

> The "no tree-derived imagery" constraint matters extra here: the post is
> *about* the Yggdrasil world-tree taxonomy, so the temptation to draw a tree
> is real. Keep the scene a greenhouse — Milim tending one seedling is the
> quiet gardening beat, not a world-tree hero shot.

Alt text (already wired in `data/blog.ts`):
*"Tiny pink-haired Milim kneels contentedly on a sunlit greenhouse potting
bench among towering terracotta pots and drifting morning mist, tending one
small seedling."*

## Pipeline (from the skill's Production Workflow)

1. Generate candidate → `assets/workbench/generated/` (gitignored).
2. Export **1600×900 WebP, quality 90, fit cover, position attention** to
   **both** `assets/generated/yggdrasil-ii-editorial-thumbnail.webp` and
   `public/assets/yggdrasil-ii-editorial-thumbnail.webp`.
3. `npx tsx scripts/assets/sync-asset-ledger.ts` (writes the
   `*.manifest.json` sidecar with real source/export sha256s + byte counts).
4. `npx tsx scripts/assets/check-asset-ledger.ts --strict`
5. `node scripts/visual-audit.mjs` (cut-off gate) before merge.
