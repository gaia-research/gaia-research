# BRAND.md — Gaia Research Geometric Brand System

> This document specifies the construction rules, color tokens, and export
> conventions for every brand asset in this directory. All SVGs are
> hand-authored to pixel-grid precision — no raster exports, no Figma
> dependencies.

---

## 1. Construction Grid

All icons and marks are built on a **24 × 24 base grid**.

| Property | Value |
|---|---|
| Base grid | 24 × 24 |
| Grid unit | 1 px = 1 grid unit at 24 × 24 |
| Center point | (12, 12) |
| Scale ladder | 24 → 32 → 48 → 64 → 128 |
| Hex vertex alignment | Vertices land on grid intersections |
| Stroke scaling | Strokes are absolute at each target size (not scaled proportionally) |

The 64 × 64 logo mark uses an **expanded grid** where 1 grid unit = 2.667 px,
keeping the same proportional relationships as the 24 × 24 base.

---

## 2. Color Tokens

All brand colors are drawn directly from [DESIGN.md](../DESIGN.md) `tokens.css`.

### Brand Colors

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `--milim-pink` | `#ec4899` | 236, 72, 153 | Primary accent, hero states, sparks, verified status |
| `--milim-pink-rgb` | — | 236, 72, 153 | For `rgba()` compositions |
| `--rimuru-blue` | `#38bdf8` | 56, 189, 248 | Crosshairs, navigation, stable borders, active status |
| `--rimuru-blue-rgb` | — | 56, 189, 248 | For `rgba()` compositions |

### Surface & Text Colors

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#05060a` | Deep obsidian background |
| `--surface` | `#0b0c13` | Card / panel surface |
| `--border` | `#141624` | Structural grid lines |
| `--text` | `#f0f1f5` | Primary text (Ice White) |
| `--text-muted` | `#8c90aa` | Secondary text (Steel Slate) |

### Research Status Colors

| Token | Hex | Status |
|---|---|---|
| `--status-proposed` | `#545770` | Proposed (muted slate) |
| `--status-active` | `#38bdf8` | Active (Rimuru Blue) |
| `--status-review` | `#fbbf24` | In Review (amber) |
| `--status-verified` | `#ec4899` | Verified (Milim Pink) |

---

## 3. SVG Style Guide

### UI Icons (default)

All general-purpose UI icons follow the **Lucide-compatible** convention:

```
viewBox="0 0 24 24"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
fill="none"
stroke="currentColor"
```

These icons inherit color from their parent element via `currentColor` and
contain **no hard-coded colors, no gradients, no brand fills**.

### Logo Mark & Brand Illustrations (exception)

The logo mark (`logo-mark.svg`), brand illustrations, and the slime mascot
are the **only** assets that use hard-coded brand fills and gradients:

- `#ec4899` (Milim Pink) for hex outlines and spark fills
- `#38bdf8` (Rimuru Blue) for crosshair strokes and accent dots
- Opacity layering for depth (0.4–0.5 on secondary elements)

### Monochrome / Utility Variants

`logo-monochrome.svg`, `logo-white.svg`, `logo-black.svg`, and
`logo-outline.svg` replace all colors with a single value
(`currentColor`, `#FFFFFF`, `#000000`, or stroke-only `currentColor`
respectively) for use on varied backgrounds.

---

## 4. Logo System — Resolution-Dependent Identity

The Gaia Research identity adapts across sizes. Each resolution tier shows
a progressively richer version of the mark.

### 16 px — Favicon Glyph

```
brand/icon/favicon.svg
```

- Simplified hexagon outline (pointy-top, circumradius 7)
- Two eye dots (Rimuru-inspired presence)
- One highlight dot at reduced opacity
- No crosshair, no spark — too small to resolve

### 48 px+ — Icon Mark

```
brand/logo/logo-mark.svg
brand/icon/icon-primary.svg
```

- Full hexagon (outer + dashed inner)
- Crosshair lines + dashed crosshair circle
- 4-point spark at top-left with center dot
- This is the **core brand symbol**

### 96 px+ — Full Mark with Mascot

- Icon mark + stylized slime mascot illustration
- Used in hero sections and splash screens
- *(Not yet implemented — reserved for future illustration work)*

### Full Lockup

- Mark + **GAIA** wordmark (Syne, expanded, bold)
- + **[RESEARCH]** subtitle (Bebas Neue, condensed, tracked)
- *(Not yet implemented — requires font embedding or outline conversion)*

---

## 5. File Naming & Export Sizes

### Directory Structure

```
brand/
├── BRAND.md              ← This file
├── README.md             ← Quick-start guide
├── logo/
│   ├── logo-mark.svg     ← Full-color brand mark (64×64)
│   ├── logo-monochrome.svg  ← currentColor variant
│   ├── logo-white.svg    ← White-on-dark variant
│   ├── logo-black.svg    ← Black-on-light variant
│   └── logo-outline.svg  ← Stroke-only variant
├── icon/
│   ├── favicon.svg       ← 16×16 simplified glyph
│   ├── icon-primary.svg  ← 64×64 app icon (= logo-mark)
│   └── mask-icon.svg     ← Safari pinned tab (16×16, filled black)
├── ui/                   ← UI icons (24×24, currentColor)
│   ├── decorations/
│   └── status/
├── illustrations/        ← Brand illustrations (future)
└── figma/                ← Reference PNGs (mood board only)
```

### Export Size Ladder

| Target | Grid | Stroke adjustment |
|---|---|---|
| 16 × 16 | Favicon grid | 1.5 px strokes |
| 24 × 24 | Base UI grid | 2 px strokes |
| 32 × 32 | 1.333× base | 2 px strokes |
| 48 × 48 | 2× base | 2 px strokes |
| 64 × 64 | Logo mark grid | 2 px outer, 1 px inner, 0.75 px crosshair |
| 128 × 128 | 2× logo grid | Scale all strokes 2× |

### Naming Conventions

| Pattern | Meaning |
|---|---|
| `logo-*` | Brand mark variants |
| `icon-*` | App and system icons |
| `favicon.*` | Browser tab icon |
| `mask-icon.*` | Safari pinned tab (monochrome, filled) |
| `ui/<category>/<name>.svg` | Interface icons |

---

## 6. Construction Notes

### Hexagon Geometry (Pointy-Top)

For a pointy-top regular hexagon centered at (cx, cy) with circumradius R,
the six vertices (starting at top, clockwise) are:

```
vertex(k) = (
  cx + R × cos(−90° + k × 60°),
  cy + R × sin(−90° + k × 60°)
)
```

For k = 0..5:

| Vertex | Angle | 64×64 (R=28) | 16×16 (R=7) |
|---|---|---|---|
| 0 (top) | −90° | (32.00, 4.00) | (8.00, 1.00) |
| 1 (top-right) | −30° | (56.25, 18.00) | (14.06, 4.50) |
| 2 (bottom-right) | 30° | (56.25, 46.00) | (14.06, 11.50) |
| 3 (bottom) | 90° | (32.00, 60.00) | (8.00, 15.00) |
| 4 (bottom-left) | 150° | (7.75, 46.00) | (1.94, 11.50) |
| 5 (top-left) | 210° | (7.75, 18.00) | (1.94, 4.50) |

### 4-Point Spark Construction

The spark is an 8-vertex star polygon centered at (12, 12) in the 64×64 space:

```
M12,4 L13.5,10.5 L20,12 L13.5,13.5 L12,20 L10.5,13.5 L4,12 L10.5,10.5 Z
```

Cardinal points extend 8 units from center; diagonal points sit 1.5 units out.

---

## 7. Usage Rules

1. **Minimum clear space:** 25% of mark width on all sides.
2. **Minimum size:** 16 px (use favicon variant below 32 px).
3. **Do not** rotate, stretch, recolor with non-brand colors, or add effects.
4. **Dark backgrounds only** for the full-color mark. Use monochrome/white/black
   variants on other backgrounds.
5. **The figma/ directory** contains reference PNGs from mood boarding. They are
   not production assets and must not be shipped.
