---
name: gaia-image-production
description: Gaia Research image-production harness. Use when generating, iterating, refining, cropping, compositing, masking, diffing, upscaling, making transparent cutouts, compressing, auditing, or ledgering visual assets for Gaia Research — hero, OG, social images, blog editorial thumbnails, Milim/Nova art, rig layers, or any other image task in this repo. Catalogs the zero-cost local toolbelt (sharp, asset scripts, SVG/HTML rasterization, Playwright, Python pixel ops) alongside the paid generation path.
---

# Gaia Image Production Harness

Use this skill whenever the user asks for generated images, image iteration, asset production, responsive crops, transparency/cutouts, masking, pixel audits, upscaling, social cards, or final production exports in this repository. It is pipeline-agnostic: the Milim rig pipeline, blog thumbnails, and one-off graphics all use the same toolbelt. Individual pipelines may impose stricter rules in their own plan docs — those plans govern; this skill supplies the tools.

## Hard rule: model selection (CLAUDE.md is the source of truth)

- **Production assets: `gpt-image-2` only.** Never use `nano-banana` or `nano-banana-2` for Gaia Research production assets. If a tool's active default model cannot be confirmed as image gen 2, ask before generating.
- For Milim Editorial Thumbnails, follow `.agents/skills/milim-editorial-thumbnail/SKILL.md` with full character prompt injection from `../marketing-tasks/MILIM.md`.
- The Termux Antigravity harness below targets `nano-banana-2` and is therefore **non-production only**: throwaway workbench experiments and comparisons. Its outputs stay in `assets/workbench/` and must never be promoted, ledgered as masters, or shipped.

## Prefer the free path first

Most image tasks in this repo are not generation: they are cropping, compositing, masking, diffing, cutting out, rasterizing, auditing, exporting. All of that is free and deterministic. Reach for a paid generation call only when new raster content must exist that no local tool can produce. Free-first also serves reproducibility: deterministic steps can be re-run and hash-verified by any agent, on any model, at zero marginal cost.

## Free local toolbelt (no API cost)

| Tool | What it does | Invocation |
| --- | --- | --- |
| **sharp** | Resize, crop, extend, trim, rotate, flatten, tint, composite (with blend modes), channel/alpha ops, format conversion (PNG/WebP/AVIF), SVG rasterization, raw pixel buffers for custom math | `npx -y --package=tsx --package=sharp --package=@img/sharp-wasm32 tsx <script>` (repo-standard), or one-off `node -e` with sharp from the npx cache |
| **`scripts/assets/export-responsive.ts`** | Responsive crops/exports at exact dimensions, fit/position control, multi-format output | See "Create crops and responsive exports" below |
| **`scripts/assets/prep-cutout.ts`** | Transparent-cutout preparation from a generated or curated source | `npx … tsx scripts/assets/prep-cutout.ts --help` |
| **`scripts/assets/generate-contact-sheet.ts`** | Contact sheets for reviewing asset batches at a glance | `npx … tsx scripts/assets/generate-contact-sheet.ts` |
| **`scripts/assets/upscale-hook.ts`** | Upscale hook for promoting low-res candidates | `npx … tsx scripts/assets/upscale-hook.ts` |
| **`scripts/assets/sync-asset-ledger.ts` / `check-asset-ledger.ts`** | Ledger sync and strict validation — run after any asset lands, before handoff | See workflow steps 4 and 6 |
| **SVG authoring → rasterization** | Agents can *draw* badges, icons, diagrams, OG frames, and geometric art as hand-written SVG, then rasterize via sharp. A genuinely free generation path — use it before reaching for a model when the content is vector-friendly | Write `.svg`, then `sharp(svgBuffer).png()` at any density |
| **HTML/CSS → screenshot (Playwright + bundled Chromium)** | Render compositions with real, crisp text (cards, social graphics, annotated comparisons) in the browser and screenshot them; also powers page captures and the `visual-audit` skill | Chromium is pre-installed at `/opt/pw-browsers`; do not run `playwright install`. See `scripts/visual-audit.mjs` for the resolution pattern |
| **ffmpeg (bundled with Playwright browsers)** | Frame extraction, clip assembly, animated previews from capture sequences | `/opt/pw-browsers/ffmpeg-*` |
| **Python 3 + Pillow/numpy** | Pixel-exact work: masks, per-pixel diffs, alpha/seam audits, layer partitions, checkerboard previews, histogram checks. Install on demand (`pip install pillow numpy`) — precedent: the Milim partition tooling | `python3 <script>` |
| **Segmentation assistants (optional, heavyweight)** | Locally run Segment Anything-class checkpoints or classical matting/flood tools to *propose* masks. Committed masks are plain data; record tool, checkpoint hash, and prompts in provenance | Local install per task; outputs committed, tool disposable |
| **Hashing/provenance (`sha256sum`, ledger)** | Every promoted asset gets a SHA-256 and a ledger entry; run manifests make deterministic steps re-verifiable | `sha256sum <file>` + asset ledger |

## Free-tool recipes

- **Masked edit discipline (crop-patch-composite).** When a paid model must edit part of an image, never let it touch the full canvas: crop the mask's bounding box plus a context margin, send only that, composite the returned patch back under the mask locally with sharp/Pillow. Outside-mask pixels stay byte-identical by construction, drift is bounded, and the recipe works with any image model — pipelines that need hard guarantees (e.g. the Milim rig plan) rely on this.
- **Pixel-diff audit.** Compare candidate vs. reference with a per-pixel diff (Pillow/numpy or sharp raw buffers); report changed-pixel count and a visual diff image. Zero-diff outside a declared region is a scriptable acceptance gate.
- **Checkerboard/peel-away review.** Composite transparent layers over a checkerboard to expose holes and fringe; toggle layers off to review coverage underneath.
- **Contact sheets before review.** Batch candidates into a contact sheet so a human review is one look, not twenty file opens.

## Native Termux Antigravity OAuth harness (non-production experiments only)

In the Termux environment, `nano-banana-2` (`gemini-3.1-flash-image`) can be invoked directly with the active `google-antigravity` OAuth credentials in `~/.pi/agent/auth.json`. Per the hard rule above, use this only for workbench experiments that will never be promoted.

```js
import fs from 'fs';
import sharp from 'sharp';

// 1. Load active Antigravity OAuth credentials
const auth = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/.pi/agent/auth.json', 'utf8'));
const antigravityCreds = auth['google-antigravity'];
const token = antigravityCreds.access;
const projectId = antigravityCreds.projectId;

const url = 'https://daily-cloudcode-pa.sandbox.googleapis.com/v1internal:streamGenerateContent?alt=sse';

// 2. Build model payload
const payload = {
  project: projectId,
  model: 'gemini-3.1-flash-image', // nano-banana-2 — non-production only
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

### 1. Read the brief and references for the surface you're producing for

- `DESIGN.md` — visual system.
- `PRODUCT.md` — voice and brand personality.
- `../marketing-tasks/MILIM.md` — mascot character design authority (pink hair, blue eyes, NO twintails, black dragonoid hoodie, thigh-high socks, high-top sneakers). Required whenever Milim is depicted; irrelevant for non-character assets.
- `docs/plans/north-star-decisions-and-asset-commission.md` — locked decisions and asset backlog.
- `docs/assets/asset-production-workflows.md` — helper script usage.
- If the task belongs to a specific pipeline (e.g. the Milim rig), that pipeline's plan and asset-authority docs govern on top of this skill.

### 2. Plan the asset batch

Before producing anything, specify:
- asset purpose: hero, OG, social, badge, icon, cutout, UI panel, blog thumbnail, empty state, rig layer, audit artifact, etc.
- target route/surface: homepage, blog, Context Diet, Twitter/X, Reddit, GitHub, docs.
- required aspect ratios and final dimensions (16:9 for blog thumbnails).
- **whether generation is needed at all** — check the free toolbelt first.
- character consistency rules from `MILIM.md` when Milim appears.

### 3. Produce: free tools first, then image gen 2

Prompt rules when generation is required:
- Ask for **original characters only**; no direct anime/IP copying.
- Inject full `MILIM.md` character traits when depicting Milim (no twintails, long pink hair, blue eyes, star hairpins, dragonoid hoodie).
- Do not request rasterized UI text unless it is a one-off social graphic — prefer the HTML/CSS screenshot recipe for text-bearing compositions.
- Use Gaia colors: Milim Pink `#ec4899`, Rimuru Blue `#38bdf8`, obsidian dark canvas.
- For edits to existing approved art, use the masked-edit recipe; never regenerate the whole asset to change part of it.

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
