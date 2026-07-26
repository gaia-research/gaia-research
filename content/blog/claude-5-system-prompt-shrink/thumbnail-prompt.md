# Thumbnail prompt — "Claude 5: Why a Smarter Model Wanted a Shorter Prompt"

**For image-gen agents.** No image is generated in this repo/session; this
spec is handed off. Follow `.agents/skills/milim-editorial-thumbnail/SKILL.md`
and `MILIM.md` (the character authority) exactly.

## Hard rules (do not deviate)

- **Model: `gpt-image-2` only.** Per `CLAUDE.md`, Gaia Research production
  assets never use `nano-banana` / `nano-banana-2` — this overrides the
  skill's alternate-model line.
- 16:9 landscape, export **1600×900 WebP** to `assets/generated/` and
  `public/assets/`; start the candidate in `assets/workbench/generated/`.
- Milim is **tiny — ~5% of frame height**; the classroom/world owns **~90%**
  of the frame in calm negative space. This is an everyday slice-of-life
  moment, not a product/explainer/diagram scene.
- **No text, UI, code, charts, diagrams, logos, watermarks**, and **no
  tree-derived imagery** as the subject.
- Milim: very long unbound bright-pink hair (**NO twintails**), blue eyes, two
  yellow star hairpins in her bangs, black oversized dragonoid hoodie with a
  cute white baby-dragon print, pink-striped thigh-high socks, chunky sneakers,
  8–10-year-old chibi proportions.

## Scene (user brief)

Early morning in a school classroom — the "school for Milim and Gaia." Quiet
first-light-of-day mood: low golden sun through tall classroom windows, dust
motes in the light, empty desks in neat rows, a chalkboard wall (blank — no
readable text), a single desk near the window catching the sun. Tiny Milim
alone at that desk, small and content, just arrived before class — the vast
calm room around her carries the "start lean, before the day fills up" feeling
that matches the post about a shorter prompt.

> **Note on "Gaia" as a character:** if Gaia is a distinct named character with
> a canonical design, consult the character authority (`MILIM.md` / marketing
> `MILIM.md` and any Gaia sheet) before adding a second figure — do not invent
> a design. If Gaia refers to the world/school itself (Gaia Research's setting),
> keep Milim as the sole figure and let the classroom *be* Gaia.

## Prompt skeleton (fill for `gpt-image-2`)

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: A vast, quiet school classroom at early morning — tall windows
along one wall pouring low golden first-light across neat rows of empty wooden
desks, soft dust motes drifting in the sunbeams, a blank chalkboard wall, calm
and expectant before the school day begins. A microscopic, tiny 8-year-old
chibi girl (Milim Nova) placed at a single sunlit desk near the windows on the
[left / lower-third], content and settled-in, having arrived early. Scale
directive: Milim is extremely small, about 5% of total image height; the
classroom occupies about 90% of the frame with huge calm negative space.
Character details: very long, unbound bright pink hair (NO TWINTAILS), blue
eyes, two yellow star hairpins, black oversized hoodie with a cute white baby
dragon print, thigh-high socks with pink stripes, chunky sneakers.
Style: flat editorial screenprint illustration; warm golden-amber morning light,
soft cream and chalk-grey classroom tones, with a single Milim-pink accent
(#ec4899); broad flat shapes, subtle paper texture.
Constraints: no tree-derived imagery; no readable text, letters, numbers, UI,
code, charts, graphs, diagrams, logos, watermarks, or hyper-detailed rendering.
```

## After generation (wiring, not done here)

Once the WebP exists at `assets/generated/claude-5-system-prompt-shrink-editorial-thumbnail.webp`:

1. In `data/blog.ts`: import the src, add a `claude5SystemPromptShrinkThumbnail`
   `{ src, alt } as const`, and set `image:` on the
   `/blog/claude-5-system-prompt-shrink` entry (currently omitted).
2. In `app/blog/claude-5-system-prompt-shrink/page.tsx`: import the thumbnail,
   set `thumbnailUrl`, add the `openGraph.images` / `twitter.images` entries and
   the JSON-LD `image`, and add the `<figure className="blog-post-illustration">`
   block (see `app/blog/skill-evals/page.tsx` for the exact shape).
3. Run `npx tsx scripts/assets/sync-asset-ledger.ts` and
   `npx tsx scripts/assets/check-asset-ledger.ts --strict`.

Suggested alt text: *"Tiny pink-haired Milim sits at a sunlit desk in a vast,
quiet classroom filled with early-morning golden light before the school day
begins."*
