---
name: gaia-image-production
description: Gaia Research image-generation harness for pi-image-gen/gpt-image-2 and Termux Antigravity OAuth workflows. Use when generating, iterating, refining, cropping, upscaling, making transparent cutouts, compressing, or ledgering visual assets for Gaia Research, especially Context Diet, Milim/Nova, hero, OG, social images, and blog editorial thumbnails.
---

# Gaia Image Production Harness

Use this skill whenever the user asks for generated images, image iteration, asset production, responsive crops, transparency/cutouts, upscaling, social cards, or final production exports in this repository.

## Hard rule: model selection

- **Use `gpt-image-2` or `gemini-3.1-flash-image` (`nano-banana-2`).**
- For Milim Editorial Thumbnails, follow `.agents/skills/milim-editorial-thumbnail/SKILL.md` with full character prompt injection from `../marketing-tasks/MILIM.md`.
- For Termux harness OAuth generation, use the Antigravity OAuth Bearer API invocation detailed below.

## Native Termux Antigravity OAuth Image Generation Harness

In this Termux environment, AI image generation can be executed directly using the active `google-antigravity` OAuth credentials in `~/.pi/agent/auth.json` targeting `gemini-3.1-flash-image` (`nano-banana-2`):

```js
import fs from 'fs';
import sharp from 'sharp';

// 1. Load active Antigravity OAuth credentials
const auth = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/.pi/agent/auth.json', 'utf8'));
const antigravityCreds = auth['google-antigravity'];
const token = antigravityCreds.access;
const projectId = antigravityCreds.projectId;

const url = 'https://daily-cloudcode-pa.sandbox.googleapis.com/v1internal:streamGenerateContent?alt=sse';

// 2. Build model payload with prompt and MILIM.md character injection
const payload = {
  project: projectId,
  model: 'gemini-3.1-flash-image', // nano-banana-2
  request: {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  }
};

// 3. Stream SSE request to Cloud Code Assist endpoint
const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'User-Agent': 'antigravity/1.21.9',
    'Accept': 'text/event-stream'
  },
  body: JSON.stringify(payload)
});

// 4. Parse SSE inlineData base64 image bytes
const text = await res.text();
for (const line of text.split('\n')) {
  if (line.startsWith('data: ')) {
    try {
      const data = JSON.parse(line.slice(6));
      const candidates = data.response?.candidates || [];
      for (const cand of candidates) {
        for (const part of (cand.content?.parts || [])) {
          if (part.inlineData?.data) {
            const rawBuf = Buffer.from(part.inlineData.data, 'base64');
            // Export 16:9 WebP at 90% quality via Sharp
            const processedBuf = await sharp(rawBuf)
              .resize(1600, 900, { fit: 'cover', position: 'attention' })
              .webp({ quality: 90 })
              .toBuffer();
            fs.writeFileSync(outputPath, processedBuf);
          }
        }
      }
    } catch (e) {}
  }
}
```

## Canonical repo paths

- Asset helper scripts: `scripts/assets/`
- Asset workflow docs: `docs/assets/asset-production-workflows.md`
- Asset ledger: `content/assets/asset-ledger.json`
- Export recipes: `content/assets/export-recipes.json`
- Workbench outputs: `assets/workbench/` (gitignored)
- Approved/generated masters: `assets/generated/`
- Brand/avatar assets: `assets/brand/`

## Standard workflow

### 1. Read the current brief and references

Check the relevant docs before generating:

- `DESIGN.md` — Cyber-Slime Laboratory visual system.
- `PRODUCT.md` — Milim voice and brand personality.
- `../marketing-tasks/MILIM.md` — mascot character design authority (pink hair, blue eyes, NO twintails, black dragonoid hoodie, thigh-high socks, high-top sneakers).
- `docs/plans/north-star-decisions-and-asset-commission.md` — locked decisions and asset backlog.
- `docs/assets/asset-production-workflows.md` — helper script usage.

### 2. Plan the asset batch

Before generation, specify:
- asset purpose: hero, OG, social, badge, icon, cutout, UI panel, blog thumbnail, empty state, etc.
- target route/surface: homepage, blog, Context Diet, Twitter/X, Reddit, GitHub, docs.
- required aspect ratios and final dimensions (16:9 for blog thumbnails).
- character consistency rules from `MILIM.md`.

### 3. Generate with image gen 2 or nano-banana-2

Prompt rules:
- Ask for **original characters only**; no direct anime/IP copying.
- Inject full `MILIM.md` character traits when depicting Milim (no twintails, long pink hair, blue eyes, star hairpins, dragonoid hoodie).
- Do not request rasterized UI text unless it is a one-off social graphic.
- Use Gaia colors: Milim Pink `#ec4899`, Rimuru Blue `#38bdf8`, obsidian dark canvas.

### 4. Sync the asset ledger

After adding any generated or curated image under `assets/`, run:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/sync-asset-ledger.ts
```

### 5. Create crops and responsive exports

Direct mode:

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/export-responsive.ts \
  --input assets/workbench/generated/context-diet-hero-v01.png \
  --out assets/workbench/exports/context-diet-hero \
  --width 1200 \
  --height 630 \
  --fit cover \
  --position attention \
  --formats avif,webp,png
```

### 6. Validate before final handoff

```bash
npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 \
  tsx scripts/assets/check-asset-ledger.ts --strict
```
