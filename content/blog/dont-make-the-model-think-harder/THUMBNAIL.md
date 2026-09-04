# Thumbnail — `/blog/dont-make-the-model-think-harder`

Generate via the **`milim-editorial-thumbnail`** skill
(`.agents/skills/milim-editorial-thumbnail/SKILL.md`) — its prompt skeleton,
scale and negative-space rules, and character guardrails are the authority.
Model is **`gpt-image-2`** / Antigravity image generation.

- **Asset Filename:** `dont-make-the-model-think-harder-editorial-thumbnail.webp`
- **Aspect Ratio:** 16:9 (1600×900)
- **Output Targets:** `assets/generated/dont-make-the-model-think-harder-editorial-thumbnail.webp`, `public/assets/dont-make-the-model-think-harder-editorial-thumbnail.webp`
- **Workbench Source:** `assets/workbench/generated/milim-no-twintail-candidate-3.png`

Topic: **Vast sunlit horology archive and drafting cathedral**. Palette: warm oak wood, parchment cream, brass gold, morning sunlight, single Milim-pink accent `#ec4899`.

## Prompt

```text
Extreme wide shot, grand architectural perspective.
A colossal, vast neoclassical horology archive and architectural drafting cathedral: soaring three-story high neoclassical arched windows fill the background with warm morning sunlight streaming across the monumental hall in soft dusty rays. Towering wooden blueprint cabinets and drafting shelves reach up toward the distant ceiling. In the high vaulted air, giant polished brass pendulum discs hang from long slender wires. Rolls of drafting paper and architectural vellum sit on wooden workbenches. The monumental, serene architectural hall fills 95% of the frame, creating enormous calm negative space.

Far away in the hall, sitting peacefully on a wooden bench on the lower-right side, is a truly microscopic, tiny 8-year-old anime chibi girl (occupying only 5% of the vertical frame height). She is holding a tiny brass magnifying glass.

Her appearance: she has very long, perfectly straight, completely loose bright pink hair flowing down her back in a single unbroken drape, completely untied and flat against her back. She has neat straight bangs with two small yellow star clips, blue eyes, an oversized black hoodie with a cute white baby dragon doodle, striped black-and-pink thigh-high socks, and sneakers.

Art style: Flat editorial screenprint illustration with clean graphic silhouettes and subtle paper grain texture. Harmonious palette of warm parchment, honey amber, brass gold, and charcoal gray, with a single bright pink accent on the tiny girl's hair. Serene, quiet, dramatic sense of scale. No twintails, no pigtails, no text, no watermark.
```

## Pipeline

1. Candidate → `assets/workbench/generated/milim-no-twintail-candidate-3.png`.
2. Export **1600×900 WebP, quality 90, fit cover, position attention** to
   **both** `assets/generated/dont-make-the-model-think-harder-editorial-thumbnail.webp` and
   `public/assets/dont-make-the-model-think-harder-editorial-thumbnail.webp`.
3. `npx tsx scripts/assets/sync-asset-ledger.ts`
4. `npx tsx scripts/assets/check-asset-ledger.ts --strict`
