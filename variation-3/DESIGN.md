# DESIGN.md (Variation 3 — Tactical Terminal Mode)

> Brand personality, mascot guidelines, and the accessibility baseline live in [`PRODUCT.md`](PRODUCT.md).

## Core Metaphor
**The Root Mainframe:** A simulated holographic terminal console built entirely in monospace typography, using bracketed elements, ASCII borders, scanning scanlines, flashing cursor tags, and high-visibility phosphor green, cyan, and Milim pink alert overrides.

---

## Color Palette

The color palette represents a monochromatic phosphor terminal display.

### CSS Tokens (`tokens.css`)

```css
:root {
  /* ── Core Backgrounds & Surfaces ───────────────────────── */
  --bg: #000000;               /* Absolute Pitch Black */
  --surface: #050706;          /* Deep Phosphor Surface */
  --border: #22c55e;           /* Phosphor Terminal Green */
  --border-muted: #14532d;     /* Dim Green Divider */
  
  /* ── Typography & Ink ──────────────────────────────────── */
  --text: #22c55e;             /* Phosphor Green text */
  --text-muted: #15803d;       /* Subdued Dim Green */
  --text-dim: #166534;         /* Very Dim Green / Headers */
  
  /* ── Glowing Alert Highlights ──────────────────────────── */
  --milim-pink: #ec4899;       /* Alert / Admin Hot Pink */
  --milim-pink-rgb: 236,72,153;
  
  --rimuru-blue: #06b6d4;      /* Slime Cyan Glow */
  --rimuru-blue-rgb: 6,182,212;
  
  /* ── Status Accents ── */
  --status-proposed: #166534;
  --status-active: var(--rimuru-blue);
  --status-review: #eab308;    /* Yellow phosphor */
  --status-verified: var(--milim-pink);
}
```

---

## Typography (Hacker Monospace)

Typography is 100% monospaced. Sans and Serif fonts are prohibited.

| Context | Font Stack | Vibe |
|---|---|---|
| **All Surfaces** | `'Space Mono', 'Departure Mono', monospace` | Retro command-line mainframe |

### Typographic Hierarchy
- **Hero Title (H1):** `clamp(2rem, 5vw, 3.8rem)`, `font-family: var(--font-mono)`, font-weight 700. Use text shadows to create a phosphor glow: `text-shadow: 0 0 8px rgba(34, 197, 94, 0.6);`.
- **Section Heading (H2):** `clamp(1.4rem, 3.5vw, 2.2rem)`, `font-family: var(--font-mono)`, weight 700.
- **Body Copy:** `0.9rem`, line-height `1.5`, `font-family: var(--font-mono)`.

---

## Key UI Patterns

### 1. The Terminal Shell Header
- Uses an ASCII horizontal divider: `+============================================================+`.
- Wordmark: `ROOT@GAIA-RESEARCH:~$` and system status metrics.

### 2. CRT Scanline Overlay
- A subtle linear-gradient overlay simulating a retro CRT screen scanline sweep:
  `background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));`
  `background-size: 100% 4px, 6px 100%;`

### 3. Flashing Prompts & Brackets
- Navigation and items use bracketed borders: `[ PAPERS ]`, `[ TOOLS ]`.
- Active items use a blinking block cursor (`_` or `█` blinking every `0.8s`).

### 4. Technical Cards (`.ledger-card`)
- Styled to look like terminal block outputs:
  ```
  +-- [ VERIFIED ] -------------------------------------------+
  | Title: GAIA SKILL TREE PROTOCOL                           |
  | Status: VRF                                               |
  +-----------------------------------------------------------+
  ```
- Hover triggers a green or pink drop shadow glow: `box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);`.
