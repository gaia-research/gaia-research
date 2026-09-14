# Thumbnail — `/blog/context-compaction-curve`

Generate via the **`milim-editorial-thumbnail`** skill
(`.agents/skills/milim-editorial-thumbnail/SKILL.md`) — its prompt skeleton,
scale and negative-space rules, and character guardrails are the authority.
Model is **`gpt-image-2`** only (CLAUDE.md hard rule; never `nano-banana`,
`nano-banana-2`, or `omniflash`).

Topic: **Token economics and the cost of bloated context.** Palette: warm amber
and cool slate with a single Milim-pink accent `#ec4899`.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: A vast, calm overhead view of a giant coin-operated electricity
meter or utility meter on a wall in a quiet industrial hallway, with warm amber
indicator lights glowing along its face and a large analog dial ticking upward.
A microscopic, tiny 8-year-old chibi girl (Milim Nova) stands at the base of the
meter looking up at the climbing dial, one hand reaching toward it as if trying
to slow the needle. Scale directive: Milim is about 5% of total image height;
the meter and hallway occupy about 90% of the frame with huge calm negative space.
Character details: very long, unbound bright pink hair (NO TWINTAILS), blue eyes,
two yellow star hairpins in her bangs, black oversized hoodie with a cute white
baby dragon print, thigh-high socks with pink stripes, chunky high-top sneakers.
Style: flat editorial screenprint illustration; warm amber and cool slate palette
with a single Milim-pink accent #ec4899; broad flat shapes, subtle paper texture.
Constraints: no world-trees, roots, branches, canopies, or forests; no readable
text, letters, numbers, labels, logos, watermarks, UI, code, charts, graphs, or
diagrams; not hyper-detailed rendering.
```

## Pipeline

1. Candidate → `assets/workbench/generated/` (gitignored).
2. Export **1600×900 WebP, quality 90, fit cover, position attention** to
   **both** `assets/generated/context-compaction-curve-editorial-thumbnail.webp` and
   `public/assets/context-compaction-curve-editorial-thumbnail.webp`.
3. `npx tsx scripts/assets/sync-asset-ledger.ts`
4. `npx tsx scripts/assets/check-asset-ledger.ts --strict`
