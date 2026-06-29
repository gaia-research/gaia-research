# DESIGN.md (Variation 2 — Light Mode Academic Journal)

> Brand personality, mascot guidelines, and the accessibility baseline live in [`PRODUCT.md`](PRODUCT.md).

## Core Metaphor
**The Prestige Journal:** A crisp, light-mode publication layout mimicking physical scientific paper, using slab-serif headers, graph-paper grids, cobalt and crimson accents, and monospaced metadata borders.

---

## Color Palette

The color strategy is strictly Light Mode, optimizing for print-like contrast and readability.

### CSS Tokens (`tokens.css`)

```css
:root {
  /* ── Core Backgrounds & Surfaces ───────────────────────── */
  --bg: #fdfdfd;               /* Crisp Book Paper White */
  --surface: #f8fafc;          /* Muted Paper Gray */
  --border: #0f172a;           /* Deep Ink Black border */
  --border-muted: #e2e8f0;     /* Faint graph paper line */
  
  /* ── Typography & Ink ──────────────────────────────────── */
  --text: #0f172a;             /* Deep Ink Black */
  --text-muted: #475569;       /* Slate Slate Ink */
  --text-dim: #94a3b8;         /* Faint border ink */
  
  /* ── Brand Colors (Milim Crimson & Rimuru Cobalt) ────────── */
  --milim-pink: #be123c;       /* Crimson Red */
  --milim-pink-rgb: 190,18,60;
  --milim-pink-bg: rgba(190,18,60, 0.05);
  --milim-pink-border: rgba(190,18,60, 0.3);
  
  --rimuru-blue: #1d4ed8;      /* Deep Cobalt Blue */
  --rimuru-blue-rgb: 29,78,216;
  --rimuru-blue-bg: rgba(29,78,216, 0.05);
  --rimuru-blue-border: rgba(29,78,216, 0.3);
  
  /* ── Status Accents ── */
  --status-proposed: #64748b;
  --status-active: var(--rimuru-blue);
  --status-review: #b45309;    /* Copper */
  --status-verified: var(--milim-pink);
}
```

---

## Typography (Scholar's Slab)

Typography features a prestigious expanded slab-serif paired with a precise technical mono.

| Context | Font Stack | Vibe |
|---|---|---|
| **Display (H1, H2)** | `Bitter, Georgia, serif` | Editorial slab serif, heavy weight |
| **Body Copy** | `DM Sans, Inter, sans-serif` | Highly legible, structured grotesque |
| **Monospace / HUD** | `Space Mono, Courier New, monospace` | Precise, typewriter-like monospaced |

### Typographic Hierarchy
- **Hero Title (H1):** `clamp(2.5rem, 6vw, 4.5rem)`, `font-family: 'Bitter', serif`, weight 700, letter-spacing `-0.02em`.
- **Section Heading (H2):** `clamp(1.6rem, 4vw, 2.5rem)`, `font-family: 'Bitter', serif`, weight 600, border-bottom: `2px solid var(--border)`.
- **Metadata / HUD:** `0.75rem`, `font-family: 'Space Mono', monospace`.

---

## Key UI Patterns

### 1. The Journal Cover Header
- Sits on a thick `2px` solid black ink line. 
- Features the wordmark `GAIA / RESEARCH` in clean `Space Mono` tracking `0.15em`.
- Includes issue details: `VOLUME 01 // ISSUE 02 // JUNE 2026`.

### 2. Graph Paper Layout Grid
- Background features a faint blue graph paper coordinate grid: `background-image: linear-gradient(var(--border-muted) 1px, transparent 1px); background-size: 24px 24px;`.
- Sections are divided by solid horizontal rules.

### 3. Footnote LED Indicators
- Research items use a tiny red or blue square indicator (`.led-verified` is crimson, `.led-active` is cobalt) next to footnote numbers to signify state changes.

### 4. Technical Cards (`.ledger-card`)
- **Background:** `var(--surface)`.
- **Border:** `1px` solid `var(--border)`. Corners are completely square (`0px`).
- **Accent:** Features a top horizontal color line in `var(--milim-pink)` or `var(--rimuru-blue)`.
