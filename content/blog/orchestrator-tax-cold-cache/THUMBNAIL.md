# Thumbnail — `/blog/orchestrator-tax-cold-cache`

Generate via the **`milim-thumbnail`** skill
(`.pi/skills/milim-thumbnail/SKILL.md`) — its prompt skeleton,
scale and negative-space rules, and character guardrails are the authority.
Model is **`gpt-image-2`** only (CLAUDE.md hard rule; never `nano-banana`,
`nano-banana-2`, or `omniflash`).

Topic: **The Orchestrator Tax, cold-cache reentries, and long-idle execution gaps.**
Setting: A vast, quiet vintage railway dispatch and telegraph concourse with soaring
cast-iron arched windows and high vaulted ceilings.
Palette: Warm golden amber sunbeams, weathered slate blue ironwork, warm honey oak,
and a single Milim-pink accent `#ec4899`.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: A vast, quiet vintage railway dispatch concourse with towering cast-iron arched windows, soaring vaulted ceilings, and a monumental brass wall clock mounted high on the far wall. A microscopic, tiny 8-year-old chibi girl (Milim Nova) sits patiently on the edge of an enormous polished dark-oak bench on the lower right, peacefully cradling a warm ceramic tea mug between both hands with a relaxed, content smile, watching soft golden dust motes drift in the morning sunbeams. Scale directive: Milim is extremely small, about 5% of total image height; the surrounding vaulted concourse occupies 90% of the frame with expansive, calm negative space. Character details: very long, unbound bright pink hair (NO TWINTAILS), blue eyes, two yellow star hairpins in her bangs, black oversized hoodie with a cute white baby dragon print, thigh-high socks with pink stripes, chunky sneakers.
Style: flat editorial screenprint illustration; warm golden amber sunbeams, weathered slate blue ironwork, warm honey oak, and single Milim-pink accent #ec4899; broad flat shapes, subtle paper texture.
Constraints: no tree-derived imagery, roots, branches, or forests; no readable text, letters, numbers, labels, logos, watermarks, UI, code, charts, graphs, or diagrams; not hyper-detailed rendering.
```

## Pipeline

1. Candidate → `assets/workbench/generated/orchestrator-tax-cold-cache-thumbnail-candidate.png`.
2. Export **1600×900 WebP, quality 90, fit cover, position attention** to
   **both** `assets/generated/orchestrator-tax-cold-cache-editorial-thumbnail.webp` and
   `public/assets/orchestrator-tax-cold-cache-editorial-thumbnail.webp`.
3. `npx tsx scripts/assets/sync-asset-ledger.ts`
4. `npx tsx scripts/assets/check-asset-ledger.ts --strict`
