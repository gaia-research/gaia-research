# Status LED System

## One Primitive, Many Colors

Instead of 40+ individual status icons, Gaia Research uses a single LED primitive (`led.svg`) colored entirely through CSS custom properties.

## Usage

### Inline SVG (recommended)
```html
<svg class="led led-active" ...><!-- led.svg contents --></svg>
```

### As image with CSS override
```html
<img src="led.svg" class="led led-verified" />
```

### Pulsing verified state
```html
<svg class="led led-verified led-pulse"><!-- led-pulse.svg contents --></svg>
```

## Status Classes

| Class | Color | Token |
|-------|-------|-------|
| `.led-proposed` | Gray #545770 | `--status-proposed` |
| `.led-active` / `.led-act` | Blue #38bdf8 | `--status-active` |
| `.led-review` / `.led-rev` | Amber #fbbf24 | `--status-review` |
| `.led-verified` / `.led-vrf` | Pink #ec4899 | `--status-verified` |
| `.led-success` | Green #22c55e | - |
| `.led-error` | Red #ef4444 | - |
| `.led-warning` | Amber #fbbf24 | - |
| `.led-pending` | Gray #545770 | - |

## Badges

`badge.svg` and `badge-pill.svg` are reusable chip shapes. Text overlaid in HTML.
