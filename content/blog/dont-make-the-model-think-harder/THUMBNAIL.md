# Thumbnail — `/blog/dont-make-the-model-think-harder`

Generate via the **`milim-editorial-thumbnail`** skill
(`.agents/skills/milim-editorial-thumbnail/SKILL.md`) — its prompt skeleton,
scale and negative-space rules, and character guardrails are the authority.
Model is **`gpt-image-2`** / Antigravity image generation.

- **Asset Filename:** `dont-make-the-model-think-harder-editorial-thumbnail.webp`
- **Aspect Ratio:** 16:9 (1600×900)
- **Output Targets:** `assets/generated/dont-make-the-model-think-harder-editorial-thumbnail.webp`, `public/assets/dont-make-the-model-think-harder-editorial-thumbnail.webp`
- **Workbench Source:** `assets/workbench/generated/dont-make-the-model-think-harder-candidate-3.png`

Topic: **Vast sunlit horology archive and drafting atelier**. Palette: warm oak wood, parchment cream, slate indigo shadows, morning sunlight, single Milim-pink accent `#ec4899`.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: A vast, monumental quiet sunlit drafting archive and horology atelier with enormous double-height arched glass windows casting soft morning sunlight across towering wooden blueprint racks, rolls of cream paper, and gigantic polished brass pendulum discs hanging in the peaceful distant background. In the lower-center foreground, a microscopic tiny 8-year-old chibi girl (Milim Nova) sits comfortably cross-legged on a massive oak drafting workbench, peacefully holding a small brass magnifying lens in her hands with a calm, curious smile. Scale directive: Milim is very small, approximately 5% of total image height; the expansive sunlit atelier occupies 90% of the frame with serene, vast uncluttered negative space and soft daylight.
Character details: very long, completely loose unbound bright magenta-pink hair #ec4899 falling straight down her back (STRICTLY NO TWINTAILS, NO PONYTAILS, NO PIGTAILS, HAIR IS 100% UNBOUND AND LOOSE), bright blue eyes, two yellow star hairpins in her front bangs, black oversized hoodie with cute white baby dragon print, thigh-high socks with pink stripes, chunky sneakers.
Style: flat editorial screenprint illustration; warm oak wood, soft parchment cream, slate indigo shadows, morning golden sunlight, and single Milim-pink accent (#ec4899); broad clean flat shapes, subtle print paper texture.
Constraints: no tree-derived imagery, no world-trees or roots; no text, letters, numbers, UI, code, blueprints, charts, graphs, diagrams, logos, watermarks, or hyper-detailed 3D rendering.
```

## Pipeline

1. Candidate → `assets/workbench/generated/dont-make-the-model-think-harder-candidate-3.png`.
2. Export **1600×900 WebP, quality 90, fit cover, position attention** to
   **both** `assets/generated/dont-make-the-model-think-harder-editorial-thumbnail.webp` and
   `public/assets/dont-make-the-model-think-harder-editorial-thumbnail.webp`.
3. `npx tsx scripts/assets/sync-asset-ledger.ts`
4. `npx tsx scripts/assets/check-asset-ledger.ts --strict`
