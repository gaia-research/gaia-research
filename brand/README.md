# brand/

Geometric brand assets for **Gaia Research**.

## What's here

| Directory | Contents |
|---|---|
| `logo/` | Logo mark SVGs: full-color, monochrome, white, black, outline |
| `icon/` | Favicon (16 px), app icon (64 px), Safari mask icon |
| `ui/` | UI icons (24 px base, `currentColor` strokes) |
| `illustrations/` | Brand illustrations (future) |
| `figma/` | Reference PNGs from mood boarding — **not production assets** |

## Full specification

See **[BRAND.md](BRAND.md)** for:

- Construction grid and vertex math
- Color tokens and their usage
- SVG style guide (UI icons vs. brand marks)
- Export size ladder and naming conventions

## Resolution-dependent identity

The logo adapts based on display size:

| Size | Variant | File |
|---|---|---|
| **16 px** | Simplified hex + eyes | `icon/favicon.svg` |
| **48 px+** | Full mark (hex + crosshair + spark) | `logo/logo-mark.svg` |
| **96 px+** | Full mark + slime mascot | *(future)* |
| **Lockup** | Mark + GAIA wordmark + [RESEARCH] | *(future)* |

## Note on figma/

The `figma/` directory contains exported PNGs used during mood boarding and
visual direction exploration. They are **reference material only** and must
not be used as production assets. All shipping assets are the hand-authored
SVGs in `logo/` and `icon/`.
