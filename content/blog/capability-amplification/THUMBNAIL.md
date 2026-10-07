# Thumbnail: `/blog/capability-amplification`

User-approved replacement for the earlier **`milim-thumbnail`** draft (`.agents/skills/milim-thumbnail/SKILL.md`). The bakery candidate supersedes the earlier microscopic-character and strict negative-space targets: its larger foreground characters and richly stocked conservatory are intentional owner-approved departures. Generation credit remains `image-gen-2.5` via Codex CLI.

Topic: **Capability amplification: when structured agent scaffolding enables cheaper models to punch above their weight.**
Palette: Golden morning light, toasted bread and timber browns, glass-sky blue, foliage green, and Milim-pink accents.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: Extreme wide shot, camera pulled far back across a vast sunlit morning artisanal bakery conservatory with soaring glass arches, towering bread shelves, and enormous serene open floors. In the lower-left foreground, two small chibi figures: tiny chibi girl Milim Nova gently lifting and boosting an even tinier miniature chibi twin Milim with both hands upward so she can reach a pastry on a high shelf. Scale directive: retain an expansive architectural setting while keeping the two figures clearly visible in the lower-left foreground; the conservatory, bread shelves, and soft morning daylight establish the overwhelming scale of the task. Character details for both: very long unbound vibrant pink hair (NO TWINTAILS), blue eyes, two yellow star hairpins, oversized black hoodie with cute white baby dragon print, black thigh-high socks with pink stripes.
Style: richly textured 2D editorial illustration, warm golden morning sunlight, toasted bread and timber browns, glass-sky blue, foliage green, and Milim-pink accents #ec4899; painterly architectural detail and soft matte texture, no 3D rendering.
Constraints: no tree-derived imagery; no text, letters, numbers, UI, code, charts, graphs, diagrams, logos, or watermarks.
```

## Approved scene

The approved replacement depicts a morning bakery conservatory, not the previous horology hall. Milim's physical boost illustrates how structure helps a smaller worker reach farther. The prompt above records the scene brief; the supplied candidate is the approved source of truth.

## Production Pipeline

1. User-approved bakery conservatory candidate copied into `assets/workbench/generated/capability-amplification-editorial-thumbnail.png` using `image-gen-2.5` via Codex CLI.
2. Export 1600×900 WebP (quality 90, fit cover, position center) to both:
   - `assets/generated/capability-amplification-editorial-thumbnail.webp`
   - `public/assets/capability-amplification-editorial-thumbnail.webp`
3. Ledger synchronization and validation:
   ```bash
   npx tsx scripts/assets/sync-asset-ledger.ts
   npx tsx scripts/assets/check-asset-ledger.ts --strict
   ```
