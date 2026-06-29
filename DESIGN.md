# DESIGN.md — Gaia Research Visual Design Language

> Brand personality, mascot guidelines, and the accessibility baseline live in [`PRODUCT.md`](PRODUCT.md). This document acts as the visual-token, layout, and styling specification.

## Core Metaphor
While `gaia-skill-tree` uses **The Hunter's Atlas** (scholarly serif meet retro pixel), `gaia-research` uses **The Cyber-Slime Laboratory**—a high-energy, technical research aesthetic inspired by Chief Scout Milim and the tactical fluid wisdom of Rimuru. It features sharp hairline grids, monospaced ledger tables, and high-impact color strikes.

---

## Color Palette

The color strategy uses a deep obsidian-midnight background, highlighted by **Milim Pink** (for high-energy callouts, hero states, and active items) and **Rimuru Blue** (for stable borders, standard navigation, and verification signals).

### CSS Tokens (`tokens.css`)

```css
:root {
  /* ── Core Backgrounds & Surfaces ───────────────────────── */
  --bg: #05060a;               /* Deep Obsidian Midnight */
  --surface: #0b0c13;          /* Dark Slate surface */
  --border: #141624;           /* Tech Slate border */
  --border-muted: #0d0f1a;     /* Faint grid line border */
  
  /* ── Typography & Ink ──────────────────────────────────── */
  --text: #f0f1f5;             /* Ice White text */
  --text-muted: #8c90aa;       /* Muted Steel Slate */
  --text-dim: #545770;         /* Dim text for tabular headers */
  
  /* ── Milim Pink & Rimuru Blue Brand Colors ───────────────── */
  --milim-pink: #ec4899;       /* Vibrant Hot Pink */
  --milim-pink-rgb: 236,72,153;
  --milim-pink-bg: rgba(236, 72, 153, 0.12);
  --milim-pink-border: rgba(236, 72, 153, 0.35);
  
  --rimuru-blue: #38bdf8;      /* Slime / Sky Blue */
  --rimuru-blue-rgb: 56,189,248;
  --rimuru-blue-bg: rgba(56, 189, 248, 0.12);
  --rimuru-blue-border: rgba(56, 189, 248, 0.35);
  
  /* ── Research Status Accents ───────────────────────────── */
  --status-proposed: #545770;  /* Muted Slate */
  --status-active: var(--rimuru-blue);
  --status-review: #fbbf24;    /* Amber */
  --status-verified: var(--milim-pink);
}
```

---

## Typography (Condensed & Expanded Play)

The typography creates a striking contrast by mixing ultra-condensed and wide, expanded font styles, reflecting both technical structure and high-energy personality.

| Context | Font Stack | Style | Vibe |
|---|---|---|---|
| **Hero Display / Brand** | `Syne, Impact, sans-serif` | Expanded, bold, geometric | Expressive, wide, modern |
| **Section Titles / Labels** | `Bebas Neue, sans-serif` | Ultra-condensed, tall | Impactful, structured, punchy |
| **Body Copy / Prose** | `Plus Jakarta Sans, Inter, sans-serif` | Geometric sans, neutral | High readability, clean |
| **Monospace / HUD** | `Departure Mono, Geist Mono, monospace` | Retro-pixel / clean mono | Technical data logs |

### Typographic Hierarchy
- **Hero Title (H1):** `clamp(3rem, 7vw, 6rem)`, `font-family: var(--font-display-wide)`, font-weight 800, line-height 0.95. Play with text capitalization and wide spacing.
- **Section Heading (H2):** `clamp(2rem, 5vw, 3.5rem)`, `font-family: var(--font-display-condensed)`, letter-spacing `0.06em`, line-height 1.0.
- **Sub-headings (H3):** `1.1rem`, `font-family: var(--font-mono)`, text-transform uppercase, tracking `0.1em`, color: `var(--rimuru-blue)`.
- **Body Text:** `0.95rem`, line-height `1.6`, `font-family: var(--font-body)`.
- **HUD Numbers / Stats:** `1.5rem` or higher, `font-family: var(--font-mono)`, color: `var(--milim-pink)`.

---

## Research Status & Verification Chips

Papers, releases, and specifications use technical status badges with the following styles:

| Status | Code | Color Token | Visual Styling |
|---|---|---|---|
| **Proposed** | `PRP` | `var(--status-proposed)` | Muted gray border, transparent background |
| **Active** | `ACT` | `var(--rimuru-blue)` | Rimuru Blue border and subtle background glow |
| **In Review** | `REV` | `var(--status-review)` | Amber border, high-visibility warning |
| **Verified** | `VRF` | `var(--milim-pink)` | Milim Pink border, solid background, high-energy glow |

---

## Key UI Patterns

### 1. The Slime & Spark Nav Bar
- Sits on a `1px` horizontal border of `var(--border)`. 
- Features a stylized hexagonal lens mark in `var(--milim-pink)` and the wordmark in expanded `Syne`.
- Left-to-right destination links are separated by thin vertical dividers.
- Hovering over a nav item triggers a Rimuru Blue bottom slide-line, with a tiny spark icon or marker appearing next to the text.

### 2. High-Contrast Layout Grid
- Layouts are bounded by `1px` solid `var(--border-muted)` lines that form a structural canvas.
- Sections utilize horizontal or vertical offset lines to emphasize asymmetry and energy.
- Background features a faint grid paper pattern styled with `rgba(56, 189, 248, 0.02)` lines.

### 3. LED Spark Lights
- Inline circular lights (`.led`) are used to display research status or test verification.
- Instead of simple static dots, verified items (`.led-verified`) pulse with a fast `1.2s` animation using `var(--milim-pink)` drop-shadows.

### 4. Cyber-Slime Cards (`.ledger-card`)
- **Background:** `var(--surface)`.
- **Border:** `1px` solid `var(--border)`. Corner radius is a sharp `2px` or completely square `0px` to maintain a rigid blueprint layout.
- **Accent Corner:** A small `4px x 4px` solid square in the top-right corner, colored in `var(--milim-pink)` or `var(--rimuru-blue)`, acting as a status stamp.
- **Hover:** The border transitions to solid `var(--rimuru-blue)` and activates a soft back-glow.

### 5. Tactical Action Buttons
- **Milim Action (Primary):** Solid `var(--milim-pink)` background, `var(--bg)` text, bold condensed `Bebas Neue`. Hover triggers a Rimuru Blue offset shadow: `box-shadow: 4px 4px 0px var(--rimuru-blue); transform: translate(-2px, -2px);`.
- **Rimuru Outline (Secondary):** Transparent background, `1px` solid `var(--rimuru-blue)` border, `var(--text)` text. Hover fills the button with a soft `var(--rimuru-blue-bg)` tint.
