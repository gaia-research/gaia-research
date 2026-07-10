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
| **Display Headings (H1/H2)** | `Bebas Neue, Impact, sans-serif` | Ultra-condensed, tall, uppercase | Impactful, structured, punchy |
| **Brand Wordmark** | `Syne, Arial, sans-serif` | Expanded, bold, geometric | Expressive, wide, modern |
| **Body Copy / Prose** | `Manrope, Arial, sans-serif` | Geometric humanist sans, neutral | High readability, clean |
| **Monospace / HUD** | `DM Mono, monospace` | Clean technical mono | Technical data logs |

> **Shipped reality (July 2026).** The loaded stack in `app/globals.css` is the source of truth above: **Bebas Neue** carries display headings (`h1`/`h2`), **Syne** is reserved for the brand wordmark and the registry CTA, body copy is **Manrope**, and mono is **DM Mono**. This is a deliberate register split — the condensed Bebas display against the wide Syne wordmark is the "contrast is king" play from `PRODUCT.md`, and Manrope was chosen over Plus Jakarta Sans / Inter for its humanist warmth at body sizes. Earlier drafts of this table listed Syne as the hero display and Plus Jakarta Sans as body; those were exploratory. Do not "fix" the CSS back to them.

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

---

## Locked North Star Decisions — July 2026

These decisions supersede older exploratory planning notes where they conflict.

1. **Context Diet is the priority Lab / Benchmark.** Treat Context Diet as Lab 001 / Benchmark 001 and the first flagship interactive proof point for the Next.js site.
2. **Gaia Skill Tree is considered complete for this planning phase.** The previous `/atlas` framing is no longer the main product priority; Gaia Skill Tree supersedes Atlas as the canonical registry/product destination.
3. **Vercel is locked for deployment.** Design and implementation should assume Next.js App Router hosted on Vercel with preview deployments.
4. **GitHub OAuth and Supabase are locked platform decisions.** Exact callback routes, profile schema, auth copy, and persistence details will land in future PRs.
5. **Production social surfaces are Twitter/X, Reddit, and GitHub only.** Do not include Discord as a production CTA, footer link, or community icon.
6. **Milim and Nova avatars are done.** Existing avatar assets should be treated as approved brand assets unless a later explicit art-direction pass requests variants.
7. **Context Diet assets are mostly done.** Remaining design work should focus on production exports, responsive crops, UI integration pieces, and any missing commission-quality supporting assets.

## Asset Production & Commission Backlog

Canonical working list: [`docs/plans/north-star-decisions-and-asset-commission.md`](docs/plans/north-star-decisions-and-asset-commission.md).

Priority asset groups:

- Context Diet hero, Lab 001 / Benchmark 001 badge, token-compression motif, prompt analyzer UI support art, benchmark result icons, OG/social card, and empty/loading/error-state illustrations.
- Production exports for existing hero, OG, avatar, favicon, app icon, and PWA assets.
- Production Gaia Research logo lockup as vector SVG.
- Homepage support assets: reusable hero overlays, lab grid layers, gateway art, ledger icons, and Milim Directive console accents.
- Social assets for Twitter/X, Reddit, and GitHub only.

All commission work must preserve originality, avoid direct character/IP copying, avoid rasterized UI text for core site content, and provide responsive production-ready exports.
