# Thumbnail — `/blog/cheapest-agent-not-cheapest-outcome`

Generated via Codex CLI using `gpt-image-2.5` (`imagegen` tool) following the **`milim-thumbnail`** skill
(`.agents/skills/milim-thumbnail/SKILL.md`) and `MILIM.md` — its prompt skeleton,
dramatic architectural scale (Milim ~5% frame height), negative-space rules (>90%),
and character guardrails are the authority.

Topic: **The Cheapest Agent Isn't Always the Cheapest Outcome**.
Setting: A vast, soaring glass elevator shaft ascending through an enormous minimalist architectural atrium with soaring geometric arches and warm golden amber sunlight.
Palette: Warm golden amber, soft sunlit cream, architectural warm slate, and a single Milim-pink accent `#ec4899`.

The article is about how cheap-tier routing below a competence floor converts a cheap attempt into an expensive escalation, and why respecting the capability floor matters. The image shows a calm everyday slice-of-life moment: a cheerful chibi Milim in a vast glass elevator beside her small grocery cart, smiling and waving in the quiet morning light.

## Prompt

```text
Distant extreme wide shot, pulled far back across an immense minimalist architectural atrium. A towering monumental glass elevator structure rises through soaring geometric arches, filling the entire vertical expanse. In the lower-right foreground within the lower glass cabin of the elevator, a tiny cheerful chibi girl stands happily beside a small metal grocery cart filled with groceries.
Strict scale requirement: The chibi girl is very small, exactly 5% of total image height. Over 90% of the entire frame is clean architectural negative space, giving a profound sense of grand, serene scale.
Character details: Milim Nova, very long straight flowing bright pink hair hanging completely loose and unbound down her back in a single clean flat drape, no twintails, no pigtails, neat choppy bangs with two small yellow star clips on the left, cheerful winking smile with tiny fang, oversized black hoodie with cute chubby white baby dragon illustration on the chest and neon pink drawstrings, black thigh-high socks with two thin pink stripes at the top, chunky black-and-white high-top sneakers with pink laces.
Style: Strict 2D editorial screenprint illustration, flat silkscreen printmaking aesthetic, broad flat clean color shapes, subtle matte paper texture, minimalist graphic poster art, risograph print feel. Flat tone fills, no 3D rendering, no raytraced lighting, no soft airbrushed gradients, no photographic realism.
Color palette: Warm golden amber, soft sunlit cream, architectural warm slate, and a single Milim-pink accent #ec4899.
Strict negative constraints: No text, no letters, no words, no numbers, no labels, no watermarks, no signatures, no UI elements.
```

## Production Pipeline

1. Candidate generated via `codex exec` with built-in `imagegen` (`gpt-image-2.5`) into `assets/workbench/generated/cheapest-agent-not-cheapest-outcome-candidate.png`.
2. Export **1600×900 WebP, quality 90, fit cover** to:
   - `assets/generated/cheapest-agent-not-cheapest-outcome-editorial-thumbnail.webp`
   - `public/assets/cheapest-agent-not-cheapest-outcome-editorial-thumbnail.webp`
3. Synced in `data/blog.ts` with descriptive accessibility alt text.
