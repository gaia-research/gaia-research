# Thumbnail — `/blog/reflex-agents-and-classifiers`

Generate via the **`milim-thumbnail`** skill (`.agents/skills/milim-thumbnail/SKILL.md`) using dramatic scale (Milim 4–6% frame height), vast negative space (88–92%), and character guardrails. Model used: `image-gen-2.5` via Codex CLI.

Topic: **Simple reflex agents, classifiers, fast reactive inference, and system-one decision loops.**
Palette: Warm golden brass, vellum cream, charcoal, slate blue, and a single Milim-pink accent `#ec4899`.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: A vast, quiet horology archive and mechanical drafting hall with soaring double-height arched windows, suspended brass pendulum discs, towering drafting tables, and giant quiet clockwork escapement wheels. A microscopic, tiny 8-year-old chibi girl (Milim Nova) placed on the lower right seated on a tall wooden drafting stool, curiously examining a tiny brass gear through a magnifying lens. Scale directive: Milim is extremely small, about 5% of total image height; the surrounding vast architectural archive occupies 90% of the frame with huge calm negative space. Character details: very long, unbound bright pink hair (NO TWINTAILS), blue eyes, two yellow star hairpins, black oversized hoodie with cute white baby dragon print, thigh-high socks with pink stripes.
Style: flat editorial screenprint illustration; warm golden brass, vellum cream, charcoal, slate blue, and single Milim-pink accent #ec4899; broad flat shapes, subtle paper texture.
Constraints: no tree-derived imagery; no text, UI, code, charts, graphs, diagrams, logos, watermarks, or hyper-detailed rendering.
```

## Production Pipeline

1. Candidate generated into `assets/workbench/generated/reflex-agents-classifiers-thumbnail-candidate.png` using `image-gen-2.5`.
2. Export 1600×900 WebP (quality 90, fit cover, position attention) to both:
   - `assets/generated/reflex-agents-classifiers-editorial-thumbnail.webp`
   - `public/assets/reflex-agents-classifiers-editorial-thumbnail.webp`
3. Ledger synchronization and validation:
   ```bash
   npx tsx scripts/assets/sync-asset-ledger.ts
   npx tsx scripts/assets/check-asset-ledger.ts --strict
   ```
