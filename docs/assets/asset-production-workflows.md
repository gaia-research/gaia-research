# Gaia Research Asset Production Workflows

This document outlines the standard workflows, helper scripts, and design rules for managing visual assets (illustrations, avatars, logos, icons) within the Gaia Research ecosystem.

---

## Guidelines: Reference vs. Production Assets

To maintain repository cleanliness and avoid bloating git history, we distinguish between two types of assets:

1. **Reference Assets (`status: "reference"`)**:
   - Visual direction, mockups, or design concepts (e.g., North Star comps).
   - Saved under `assets/` or `assets/brand/figma/`.
   - **Never** referenced directly in production code or UI pages (a warning will trigger during ledger checks).

2. **Production/Candidate Assets (`status: "approved"` or `"candidate"`)**:
   - Assets intended to be served on the website.
   - Saved under `assets/brand/`, `assets/generated/`, etc.
   - Checked strictly for metadata completeness (alt text, license, credit) before approval.

---

## 1. Synchronizing the Asset Ledger

The **Asset Ledger** (`content/assets/asset-ledger.json`) is the single source of truth for all source assets in the repo.

### Workflow
When you add, rename, or remove asset files in `assets/`, you must sync the ledger:

```bash
npx tsx scripts/assets/sync-asset-ledger.ts
```

- This script scans all images in the `assets/` directory (excluding ignored `assets/workbench/`).
- It extracts dimensions, formats, byte sizes, and SHA256 hashes using `sharp`.
- It registers new assets using a stable ID and preserves manually edited metadata fields like `status`, `license`, `credit`, `alt`, and `notes`.
- Obvious design mockups (e.g. filenames starting with `North Star` or in `figma/` directories) are automatically marked with `status: "reference"`.

---

## 2. Validating the Asset Ledger

Before publishing or committing changes, run validation to ensure integrity and prevent broken references:

```bash
# Basic check
npx tsx scripts/assets/check-asset-ledger.ts

# Strict check (requires alt text, licenses, and derivatives for approved assets)
npx tsx scripts/assets/check-asset-ledger.ts --strict
```

### Checks Performed
- **Duplicate IDs & Path Collisions**: Fails if multiple files resolve to the same ID.
- **Missing Files**: Fails if a ledger entry points to a file that does not exist on disk.
- **Hash & Dimension Drift**: Fails if a file has been modified on disk without updating the ledger.
- **Reference Asset Leakage**: Warns if any `reference` status asset is referenced inside source files (e.g., `.ts`, `.tsx`, `.md`, `.html`, `.css`).
- **Social Dimensions Warning**: Warns if OG/social images deviate from the standard `1200x630` dimensions.

---

## 3. Exporting Responsive Crops & Derivatives

We use deterministic export recipes (`content/assets/export-recipes.json`) to crop and compress source assets into responsive formats (`avif`, `webp`, `png`).

### Recipe Mode
To export using a predefined recipe:

```bash
npx tsx scripts/assets/export-responsive.ts \
  --recipe content/assets/export-recipes.json \
  --asset chief-scout-hero
```

This generates all responsive files defined under the `chief-scout-hero` recipe block, writes a sidecar manifest detailing the crop details, and registers the output paths as `derivatives` under the source asset in the ledger.

### Direct Mode (Ad hoc Crops)
To execute a custom crop directly from the CLI:

```bash
npx tsx scripts/assets/export-responsive.ts \
  --input assets/generated/research-og.png \
  --out assets/workbench/exports/custom-og \
  --width 1200 \
  --height 630 \
  --fit cover \
  --position attention \
  --formats avif,webp,png
```

- `--position attention`: Uses sharp's saliency-detection to crop around the most interesting region of the image.
- `--force`: Required if the output files already exist.

---

## 4. Preparing Cutouts & Chroma-Key Masks

For graphics requiring transparent backgrounds (like character overlays or status badges), we use `prep-cutout.ts` to key out backgrounds.

### Workflow

```bash
npx tsx scripts/assets/prep-cutout.ts \
  --input assets/brand/Milim-avatar.png \
  --sample-corners \
  --tolerance 34 \
  --feather 2 \
  --despill \
  --out assets/workbench/cutouts/milim-avatar
```

- `--sample-corners`: Samples the four corners of the image to estimate the background key color automatically.
- `--key "#00ff00"`: Key out a specific color (hex format).
- `--tolerance`: Cutoff distance for the chroma-key algorithm (0-255).
- `--feather`: Adds alpha feathering (anti-aliased edges) at the boundary (default 2px).
- `--despill`: Removes only the dominant chroma channel from surviving edge pixels. Use it for generated isolation plates when the matte is correct but a green/blue/red fringe remains; inspect the checkerboard preview before promotion.

### Generated Outputs
1. `*-cutout.png`: Transparent PNG of the subject.
2. `*-mask.png`: Grayscale alpha matte mask (useful for debugging or external mask-based blending).
3. `*-preview.png`: The cutout composited onto a diagnostic grey/white checkerboard pattern.
4. `*-normalized.png`: Standardized source PNG format.

---

## 5. AI Upscaling Hook & Accept Flow

We support AI/local upscaling pipelines using a job manifest system. This prevents un-reviewed images from cluttering the repository.

### Step 1: Create a Job (Dry-Run / Noop)
Generate a job manifest without running any command:

```bash
npx tsx scripts/assets/upscale-hook.ts \
  --provider noop \
  --input assets/generated/research-og.png \
  --scale 2 \
  --dry-run
```

### Step 2: Execute Upscaling
You can run an upscale process using a local CLI or Replicate:

**Using Local CLI (e.g. Upscayl):**
```bash
npx tsx scripts/assets/upscale-hook.ts \
  --provider local-cli \
  --input assets/generated/research-og.png \
  --scale 2 \
  --command 'upscayl -i {input} -o {output} -s {scale}'
```

**Using Replicate (Real-ESRGAN):**
Ensure your `REPLICATE_API_TOKEN` environment variable is set. The script polls Replicate's API, downloads the completed result, and stores it in the workbench folder.
```bash
export REPLICATE_API_TOKEN="your_replicate_token"
npx tsx scripts/assets/upscale-hook.ts \
  --provider replicate \
  --input assets/generated/research-og.png \
  --scale 2
```

### Step 3: Visual Review & Accept Flow
Once you have reviewed the upscaled output in `assets/workbench/upscale/outputs/`, promote it to a production asset:

```bash
npx tsx scripts/assets/upscale-hook.ts \
  --accept \
  --input assets/workbench/upscale/outputs/research-og-2x.png \
  --output assets/generated/upscaled/research-og-2x.png
```

This copies the file to the target production-facing directory and registers the new upscaled asset in the ledger.

---

## 6. Visual Review via Contact Sheets

To review bulk candidate assets or commissions:

```bash
npx tsx scripts/assets/generate-contact-sheet.ts \
  --status candidate,approved \
  --out assets/workbench/contact-sheets/candidates.png \
  --force
```

This creates a high-density, multi-column contact sheet laying out the assets in a clean grid showing:
- Visual thumbnail centered on a dark theme.
- Asset ID, filename, format, dimensions, size, and current status.

---

## Standard Dimensions Reference

When preparing final production crops, adhere to these standard dimensions:

| Category | Standard Size (px) | Recommended Formats | Notes |
| :--- | :--- | :--- | :--- |
| **Open Graph (OG) / Facebook** | 1200 x 630 | PNG, WebP | Essential for links preview (1.91:1 ratio) |
| **Twitter / X Card (Large)** | 1200 x 675 | PNG, WebP | 16:9 ratio |
| **GitHub Repository Social Preview** | 1280 x 640 | PNG | 2:1 ratio (displays cleanly on repository headers) |
| **Reddit Community Banner** | 1920 x 384 | WebP, PNG | 5:1 ratio (large) |
| **User Avatar (Milim/Nova)** | 512x512, 256x256 | WebP, PNG | Squared crops |
| **Hero Image (Desktop)** | 1920 x 1080 | AVIF, WebP | 16:9 ratio |
| **Hero Image (Tablet)** | 1024 x 768 | AVIF, WebP | 4:3 ratio |
| **Hero Image (Mobile)** | 768 x 1024 | AVIF, WebP | 3:4 portrait ratio |
