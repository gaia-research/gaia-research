# Thumbnail — `/blog/context-compaction-curve`

Generate via the **`milim-thumbnail`** skill (`.agents/skills/milim-thumbnail/SKILL.md`) — its prompt skeleton, dramatic scale (Milim 4–6% frame height), vast negative space (88–92%), and character guardrails are the authority.
Model is **`gpt-image-2`** only (`CLAUDE.md` hard rule; never `nano-banana`, `nano-banana-2`, or `omniflash`).

Topic: **Empirical context compaction, KV prompt cache economics, and thermal equilibrium.**
Palette: Industrial slate teal, warm burnished brass amber, soft vellum cream, and a single Milim-pink accent `#ec4899`.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: A vast, quiet municipal thermal exchange and steam manifold hall with towering arched clerestory windows casting long geometric shafts of morning light across smooth concrete floors. Huge insulated brass steam pipes and copper equalization valves climb up soaring masonry walls into calm, expansive negative space. A microscopic, tiny 8-year-old chibi girl (Milim Nova) is seated calmly on a broad polished brass pipe flange in the lower right, holding a small insulated tin cup with two hands, looking thoughtfully across the quiet, cavernous hall toward a distant analog pressure dial. Scale directive: Milim is extremely small, about 5% of total image height; the soaring architecture and calm atmosphere occupy about 90% of the frame with huge serene negative space. Character details: very long, unbound bright pink hair (NO TWINTAILS), blue eyes, two yellow star hairpins in her bangs, black oversized hoodie with a cute white baby dragon print, thigh-high socks with pink stripes, chunky sneakers.
Style: flat editorial screenprint illustration; industrial slate teal, warm burnished brass amber, soft vellum cream palette with a single Milim-pink accent #ec4899; broad flat shapes, subtle paper texture.
Constraints: no world-trees, roots, branches, canopies, or forests; no readable text, letters, numbers, labels, logos, watermarks, UI, code, charts, graphs, or diagrams; not hyper-detailed rendering.
```

## Production Pipeline

1. Candidate generated into `assets/workbench/generated/context-compaction-curve-editorial-thumbnail.png` using `gpt-image-2`.
2. Export 1600×900 WebP (quality 90, fit cover, position attention) to both:
   - `assets/generated/context-compaction-curve-editorial-thumbnail.webp`
   - `public/assets/context-compaction-curve-editorial-thumbnail.webp`
3. Ledger synchronization and validation:
   ```bash
   npx tsx scripts/assets/sync-asset-ledger.ts
   npx tsx scripts/assets/check-asset-ledger.ts --strict
   ```
