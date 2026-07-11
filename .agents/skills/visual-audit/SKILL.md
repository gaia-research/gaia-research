---
name: visual-audit
description: Playwright visual + mobile cut-off audit for the Gaia Research Next.js site. Use before/after any UI, CSS, layout, or responsive change, or when the user asks to check visuals, screenshots, mobile view, horizontal scroll, or content being cut off. Screenshots every key page across desktop and phone widths, detects horizontal overflow and names the culprit element, and flags console errors.
---

# Visual Audit Harness

Use this skill whenever you touch layout/CSS/responsive code or the user asks
to verify how pages look — especially on mobile. It catches the failure mode
that plain screenshots hide: **horizontal page cut-off**, where an element is
wider than the viewport and pushes content off the right edge behind a scroll.

## What it does

`scripts/visual-audit.mjs` drives a running dev server with Playwright and, for
every page × viewport width:

1. Screenshots the full page → `scripts/.visual-audit/<LABEL>/<page>__<width>.png`
2. Measures `document.scrollWidth` vs the viewport → any excess is cut-off.
3. When cut off, names the widest offending element (tag + class + geometry),
   **skipping** elements inside intentional scroll containers
   (`overflow-x:auto`, e.g. `.table-wrap`, `.copy-command-text`).
4. Collects console + page errors (the Milim rig `*.scene.json` 404 is an
   expected sprite-fallback and is ignored).
5. Writes `report.json` and exits non-zero if any check has an issue — so it
   works as a gate.

## How to run

Playwright is **not** a project dependency (keeps the Cloudflare bundle lean).
The script auto-resolves it from an `npx` cache or a global install; you only
set `PW_PATH` if resolution fails.

```bash
# 1. Ensure Playwright + Chromium are available (once per machine):
npx playwright install chromium

# 2. Start the dev server in the background on a known port:
npx next dev -p 3010   # (leave running in another shell / background)

# 3. Run the audit against it:
BASE_URL=http://localhost:3010 LABEL=before node scripts/visual-audit.mjs
```

Make a change, then re-run with `LABEL=after` and compare the two screenshot
folders and `report.json` files.

### Options (env vars)

| Var        | Default                                            | Purpose |
|------------|----------------------------------------------------|---------|
| `BASE_URL` | `http://localhost:3000`                            | Dev server origin |
| `PAGES`    | `/,/research/ci-churn,/labs/context-diet,/labs`    | Comma-separated paths |
| `WIDTHS`   | `320,360,390,414,768,1280`                         | Comma-separated viewport widths |
| `LABEL`    | `run`                                              | Output subfolder name |
| `PW_PATH`  | auto                                               | Absolute path to `playwright/index.js` if auto-resolve fails |

## Reading results

- Every line prints `✓` (clean) or `⚠` (issue) with the overflow in px and HTTP status.
- On a `⚠` cut-off, the offender line tells you exactly which element is too
  wide, e.g. `<article class="skill-card"> right=542 w=508` at a 360px viewport.
- Open the matching PNG in `scripts/.visual-audit/<LABEL>/` to see it.

## Known cut-off patterns in this codebase (and fixes)

These are the flex/grid `min-width:auto` traps that have bitten this site — check
for them first when a `⚠` appears:

- **Card with a `white-space:nowrap` install command** (`.skill-card`, `.lab-card`):
  the nowrap child forces the card to its min-content width. Fix: `min-width:0`
  on the card so the inner `.copy-command-text` (its own `overflow-x:auto`)
  scrolls instead.
- **`repeat(auto-fill,minmax(300px,1fr))`** grids overflow containers narrower
  than the min track. Fix: `minmax(min(100%,300px),1fr)`.
- **Header wordmark + menu button** exceeding the shell at ≤360px. Fix: shrink
  `.brand` font and tighten `.nav-wrap` gap inside the `@media(max-width:700px)` block.

## Output is gitignored

`scripts/.visual-audit/` is ignored (see `.gitignore`). Commit the harness, not
the screenshots.
