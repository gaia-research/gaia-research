# Thumbnail — `/blog/cheapest-agent-not-cheapest-outcome`

Generate via the **`milim-editorial-thumbnail`** skill
(`.agents/skills/milim-editorial-thumbnail/SKILL.md`) — its prompt skeleton,
scale and negative-space rules, and character guardrails are the authority.
Model is **`image-gen-2.5`** preferred, with `nano-banana-2` or
`gemini-3-pro-image` as fallbacks (CLAUDE.md hard rule; never `nano-banana` v1).

Topic: **Vast Morning Bakery Conservatory**. Palette: warm golden amber, cream,
and a single Milim-pink accent `#ec4899`.

The article is about a cheap agent that looked cheapest per call and turned out
to be the most expensive way to finish the job. The image is a baker at work
who is *about to find out* how the tray turns out. It stays an everyday
slice-of-life illustration: no charts, no tiers, no conveyor belt of agents, no
visual metaphor that has to be explained.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: A vast sunlit bakery conservatory with soaring glass arches and a high timbered roof, enormous golden bread racks filling the left and rear of the hall, warm brick ovens glowing softly at the back, morning light pouring through the arches, and fine flour dust hanging in the sunbeams. The setting occupies about 90% of the frame with huge calm negative space. A microscopic, tiny 8-year-old chibi girl (Milim Nova) placed lower-right at a small wooden workbench, focused and cheerful, gently arranging a small tray of freshly baked pastries, the pastries varying subtly in golden doneness. Scale directive: Milim is extremely small, about 5% of total image height; the surrounding bakery hall occupies 90% of the frame with huge calm negative space.
Character details: chibi 8-to-10-year-old child proportions, very long flowing unbound bright pink hair down her back (NO TWINTAILS), neat choppy bangs, two small yellow star hairpins clipping back the left side of her bangs, large expressive bright blue eyes, a tiny cute fang peeking out as she smiles. Outfit: her canonical oversized pitch-black hoodie with a small cute white baby-dragon print and neon pink drawstrings, over which she wears a simple small cream baker's apron; black thigh-high socks with two thin pink stripes and chunky black-and-white high-top sneakers.
Mood: focused, cheerful, gently curious.
Style: flat editorial screenprint illustration; warm golden amber, cream and soft flour-white palette with a single Milim-pink accent #ec4899; broad flat shapes, subtle paper texture.
Constraints: no text, letters, numbers, labels, logos, watermarks, UI, code, charts, graphs, diagrams, report pages, or dashboards anywhere; no hyper-detailed rendering; no tree-derived imagery as the primary subject.
```

## Production note: the shipped frame does not meet the scale rule

The asset currently shipped for this post is a **real generated thumbnail**, not a placeholder, and
it is on brief for scene, character, palette, style and framing. It is **off-brief on one
point: scale.**

| Rule | Required | Shipped frame |
| :--- | :--- | :--- |
| Milim's share of frame height | 4 to 6% | ~48% standing figure (~38% by hair-pixel extent) |
| Environment share of frame | 88 to 92% | ~52% |
| Hair | unbound, no ponytail, no twintails, no ahoge | unbound, but a small curl renders on top of the head |

Three candidates were generated before the provider routes ran out
(`gemini-3.1-flash-image` and `gemini-3-pro-image`, both `QUOTA_EXHAUSTED`; `gpt-image-2.5`
returned HTTP 401 on an expired credential snapshot). In every one, the model placed the
character as the subject of the frame regardless of the scale wording, and two of the three
introduced a hair defect the prompt explicitly forbade.

The correction is tracked as **issue #302**, with the full prompt, a scale-measurement snippet
and the deterministic composite fallback. The shipped frame stays in place until that fix lands.

## Pipeline

1. Candidate → `assets/workbench/generated/` (gitignored).
2. Export **1600×900 WebP, quality 90, fit cover, position attention** to
   **both** `assets/generated/cheapest-agent-not-cheapest-outcome-editorial-thumbnail.webp`
   and `public/assets/cheapest-agent-not-cheapest-outcome-editorial-thumbnail.webp`.
3. `npx tsx scripts/assets/sync-asset-ledger.ts`
4. `npx tsx scripts/assets/check-asset-ledger.ts --strict`

## Character note

`MILIM.md` specifies the hoodie print as a baby-dragon graphic over the words
"DRAGONOID No. 1". The no-readable-text rule for editorial thumbnails wins for
this asset, so the print is described as the dragon graphic only, with no
lettering. This matches the shipped `capability-amplification` thumbnail.
