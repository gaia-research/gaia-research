# DESIGN.md (Variation 4 — Neo-Brutalist Grid Board)

> Brand personality, mascot guidelines, and the accessibility baseline live in [`PRODUCT.md`](PRODUCT.md).

## Core Metaphor
**The Industrial Grid Board:** A tactile, high-impact dashboard system built with chunky physical structures, thick 3px solid black dividers, solid offset shadows, and high-visibility neon purple and slime green accents. It acts as an uncompromised developer ledger, stripping away all smooth gradients and soft blurs in favor of raw, geometric confidence.

---

## Color Palette

The color strategy relies on a high-contrast light gray canvas paired with absolute black borders, bright white surfaces, and intense neon accents to highlight key research actions and data nodes.

### CSS Tokens (`tokens.css`)

```css
:root {
  /* ── Core Backgrounds & Surfaces ───────────────────────── */
  --bg: #f3f4f6;               /* Light Gray Canvas background */
  --surface: #ffffff;          /* Pure White card surface */
  --border: #000000;           /* Absolute Black */
  
  /* ── Typography & Ink ──────────────────────────────────── */
  --text: #000000;             /* Absolute Black Text */
  --text-muted: #374151;       /* Dark Slate/Charcoal for paragraph copy */
  --text-dim: #6b7280;         /* Slate Gray for secondary descriptors */
  
  /* ── Neo-Brutalist Brand Accents ───────────────────────── */
  --neon-purple: #d946ef;      /* Neon Purple (Milim Primary Accent) */
  --neon-purple-rgb: 217,70,239;
  --neon-purple-bg: rgba(217, 70, 239, 0.15);
  
  --neon-green: #22c55e;       /* Neon Slime Green (Systems Accent) */
  --neon-green-rgb: 34,197,94;
  --neon-green-bg: rgba(34, 197, 94, 0.15);
  
  /* ── Layout & Borders ──────────────────────────────────── */
  --border-width: 3px;
  --border-style: solid;
  --border-thick: var(--border-width) var(--border-style) var(--border);
  
  /* ── Shadows (Solid Offset, No Blur) ───────────────────── */
  --shadow-sm: 3px 3px 0px #000000;
  --shadow-md: 6px 6px 0px #000000;
  --shadow-lg: 10px 10px 0px #000000;
}
```

---

## Typography (Wide, Tall & Mono)

The typographic language creates absolute hierarchy by pairing highly expanded display headings with ultra-condensed sub-labels and monospaced technical readouts.

| Context | Font Stack | Vibe | Style |
|---|---|---|---|
| **Display (H1, Brand)** | `Syne, sans-serif` | Wide, geometric, aggressive | Heavy expanded, weight 800 |
| **Subheadings / Labels (H2, H3)** | `Bebas Neue, sans-serif` | Tall, compressed, clean | Condensed, all-caps, weight 400 |
| **HUD / Metrics / Tables** | `Space Mono, monospace` | Technical, structured, typewriter | Monospace, weight 400/700 |
| **Body Paragraphs** | `Space Mono, monospace` | Raw hacker log | Readable monospace or crisp sans fallback |

### Typographic Hierarchy
- **Hero Title (H1):** `clamp(2.5rem, 8vw, 5.5rem)`, `font-family: 'Syne', sans-serif`, weight 800, text-transform uppercase, line-height 0.9.
- **Section Heading (H2):** `clamp(1.8rem, 5vw, 3rem)`, `font-family: 'Bebas Neue', sans-serif`, text-transform uppercase, letter-spacing `0.05em`, line-height 0.95.
- **Subsection Heading (H3):** `clamp(1.2rem, 3vw, 1.8rem)`, `font-family: 'Bebas Neue', sans-serif`, text-transform uppercase, letter-spacing `0.05em`.
- **HUD Numbers & Stat Blocks:** `font-family: 'Space Mono', monospace`, weight 700.

---

## Key UI Patterns

### 1. The Chunky Grid Header
- Features a thick `3px` solid black bottom border (`var(--border-thick)`).
- Brand mark: `GAIA // RESEARCH` rendered in wide `Syne` (uppercase, bold).
- Nav links: Set in tall `Bebas Neue` (uppercase).
- **Hover interaction:** Hovering over a nav item wraps it in a solid `3px` black border and gives it a `--neon-purple` or `--neon-green` background.

### 2. Neo-Brutalist Cards (`.brutalist-card`)
- **Background:** White (`var(--surface)`).
- **Border:** `3px` solid black (`var(--border-thick)`).
- **Border Radius:** Completely square (`0px`).
- **Shadow:** Solid black offset box shadow: `box-shadow: var(--shadow-md);`.
- **Active / Press Effect:** On click or active focus, the card translates down and right: `transform: translate(6px, 6px); box-shadow: 0px 0px 0px #000000;`.

### 3. Tactile Action Buttons (`.btn-brutalist`)
- **Primary (Purple):** Background `var(--neon-purple)`, border `var(--border-thick)`, color `#000000`, shadow `var(--shadow-sm)`.
- **Secondary (Green):** Background `var(--neon-green)`, border `var(--border-thick)`, color `#000000`, shadow `var(--shadow-sm)`.
- **Interaction:** Hover increases the shadow depth (`box-shadow: var(--shadow-md)`), and pressing shifts the button to the offset position (`transform: translate(3px, 3px); box-shadow: 0px 0px 0px #000000;`).

### 4. Technical Status Labels
Research items and benchmarks are categorized with stark solid tags:
- `VRF` (Verified): Background `var(--neon-green)`, border `var(--border-thick)`, text `#000000`.
- `ACT` (Active) / `REV` (Review): Background `var(--neon-purple)`, border `var(--border-thick)`, text `#000000`.
- `PRP` (Proposed): Background `var(--surface)` (white), border `var(--border-thick)`, text `#000000`.

### 5. Dot Matrix Background
The main light gray layout canvas features an optional retro-technical dot grid:
```css
body {
  background-color: var(--bg);
  background-image: radial-gradient(var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
}
```
All columns, sidebars, and rows align perfectly to this matrix, bound by thick vertical and horizontal `3px` black rules.
