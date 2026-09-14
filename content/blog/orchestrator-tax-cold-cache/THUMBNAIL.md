# Thumbnail — `/blog/orchestrator-tax-cold-cache`

Generate via the **`milim-editorial-thumbnail`** skill
(`.agents/skills/milim-editorial-thumbnail/SKILL.md`) — its prompt skeleton,
scale and negative-space rules, and character guardrails are the authority.

**Model:** `gpt-image-2` (or `gemini-3-pro-image`), per the CLAUDE.md hard rule.
`nano-banana` / `nano-banana-2` are not permitted for Gaia Research production
assets. CLAUDE.md is the source of truth here — a skill file or a page note
cannot relax it; only a founder ruling recorded in CLAUDE.md can.

Topic: **The Orchestrator Tax, cold-cache reentries, and long-idle execution gaps.**
Setting: A vast, calm alpine mountain meadow on a high ridge, with layered
blue-green peaks, distant snow caps, broad open sky, and sunlit grass.
Palette: Alpine cobalt blue, sage green, warm cream, sunlit yellow, and a single
Milim-pink accent `#ec4899`.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: A vast, calm alpine mountain meadow on a high ridge, with enormous layered blue-green peaks, distant snow caps, broad open sky, sunlit grass, and huge quiet negative space. In the visual center of the meadow, five extremely tiny original chibi friends play a gentle mountain ring-toss game with oversized woven hoops and bright fabric ribbons. Milim Nova is the leftmost player within the centered group, smiling and reaching toward a hoop; four distinct original chibi friends gather around her with varied silhouettes and colorful simple outdoor clothes. Keep the five-player group cohesive and small, not scattered across the frame. Scale directive: Milim is extremely small, about 5% of total image height; the five-person group is small and the surrounding mountain world occupies about 90% of the frame. Character details: very long, unbound bright pink hair (NO TWINTAILS), blue eyes, two yellow star hairpins in her bangs, black oversized hoodie with a cute white baby dragon print, thigh-high socks with pink stripes, chunky sneakers.
Style: calm flat editorial screenprint illustration; alpine cobalt blue, sage green, warm cream, sunlit yellow, and single Milim-pink accent #ec4899; broad flat shapes, subtle paper texture.
Constraints: no tree-derived imagery, roots, branches, or forests; no readable text, letters, numbers, labels, logos, watermarks, UI, code, charts, graphs, or diagrams; not hyper-detailed rendering.
```

## Pipeline

1. Candidate → `assets/workbench/generated/orchestrator-tax-cold-cache-mountain-friends-candidate.png`.
2. Export **1600×900 WebP, quality 90, fit cover, position attention** to
   **both** `assets/generated/orchestrator-tax-cold-cache-editorial-thumbnail.webp` and
   `public/assets/orchestrator-tax-cold-cache-editorial-thumbnail.webp`.
3. `npx tsx scripts/assets/sync-asset-ledger.ts`
4. `npx tsx scripts/assets/check-asset-ledger.ts --strict`
