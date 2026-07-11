---
target: /labs/context-diet
total_score: 29
p0_count: 0
p1_count: 1
timestamp: 2026-07-10T19-33-51Z
slug: app-labs-context-diet-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Console header + `.led` + charcount + submit states strong; no busy state on Analyze (synchronous, fine); truncation warning only post-analyze. |
| 2 | Match System / Real World | 3 | "faithfulness / reduction band / $X per 1M input reads" assume the reader models cost-per-read. |
| 3 | User Control and Freedom | 3 | No explicit clear/reset; re-analyze overwrites. Disclosures give control; no destructive actions. |
| 4 | Consistency and Standards | 2 | `.button primary` (hero) vs `.button button-primary` (analyzer); three eyebrow treatments incl. an unstyled `<p>THE LAB QUESTION` (page.tsx:94). |
| 5 | Error Prevention | 3 | 200k paste guard, maxLength on handle, disabled Analyze/Submit. Export-is-skeleton only clear in fine print. |
| 6 | Recognition Rather Than Recall | 3 | All on-screen; rates carry price inline. Strategy names assume recall of what each does. |
| 7 | Flexibility and Efficiency | 3 | Rate switcher, focus jump, disclosure. No permalink/share, no keyboard shortcut to analyze. |
| 8 | Aesthetic and Minimalist Design | 4 | Progressive disclosure keeps first paint calm; single confident readout; no chartjunk. Best axis. |
| 9 | Error Recovery | 3 | `.cd-err` uses `--danger`; submit errors surface; offline explained. Failed submit shows raw error, no retry guidance. |
| 10 | Help and Documentation | 2 | No inline "how does the projection work"; the evidence table is the docs but nothing links the estimator to it. |
| **Total** | | **29/40** | **Good — ships; consistency + explanatory gaps** |

## Anti-Patterns Verdict

**LLM assessment:** Not AI slop. Coherent authored "cyber-slime laboratory instrument" register — ANALYZER LIVE console + pulsing `.led`, the before→after `.analyzer-readout` (Bebas numerals, pink target, `→` arrow), custom `+`/`–` disclosure markers, 2px blueprint frames. Faint tells survive only in the editorial zones: the closing `.lab-method` "What can leave without changing the job?" + restated 3-bullet list is generic filler; the hero image alt text is AI-caption-phrased; three different section-label treatments compete.

**Deterministic scan:** `detect.mjs` exit 0 / `[]` on all three files. This is a **false all-clear** — the detector reads JSX heuristically and cannot resolve styling in external `globals.css`, where all a11y-relevant properties live. Non-evidentiary; superseded by manual corroboration.

**Manual corroboration (Assessment B):** All 7 text/bg token pairs PASS WCAG AA at both thresholds — thinnest is `--dim` on `--surface` at 5.79:1 (used at small mono sizes, body bar is correct, passes). Touch targets: `.reduction-cost select`, `.cd-handle`, `.cd-optin` wrapper, `.button`, `.cd-disclosure>summary` all ≥44px; the raw 20px checkbox is mitigated by its 44px-min label wrapper. HTTP 200. Client-gated readout confirmed absent from server GET (expected).

**Visual overlays:** None — no browser automation/script injection in this session; the client-gated readout block could not be rendered or computed via getComputedStyle. Flagged for the user's own eyes.

## Overall Impression

The interactive instrument is the personality and it's strong; the surrounding editorial sections are where the authored voice thins. The privacy/trust handling at the submit moment is textbook peak-end design. Biggest single opportunity: connect the projection number to its methodology at point of use so the tool's central claim doesn't float.

## What's Working

1. **Privacy reassurance is textbook peak-end trust design** — PrivacyNote at top, opt-in copy restating exact data sent, "handle (optional)", export fine print. The anxiety moment is de-risked at every touchpoint.
2. **The `.analyzer-readout` instrument is a genuine peak** — collapsing the result to one before→after token pair beats the twin-tile pattern it replaced.
3. **Progressive-disclosure discipline + real a11y** — calm first paint; focus-to-results on Analyze, `role="status"`, `tabIndex={-1}`, `scope` on every `th`, `sr-only` caption.

## Priority Issues

- **[P1] Projection floats without its methodology at point of use.** The `.reduction-band` shows "target 41% via {strategy}" but never explains what a strategy is or why to trust it; the Lab 001 evidence table is a separate section with no link. Erodes the tool's central claim (cognitive checklist items 4 & 8). *Fix:* inline "How is this projected?" anchor to `#evidence-title`; gloss "strategy" on first use. *Command:* `$impeccable clarify`
- **[P2] Button + eyebrow class conventions are internally inconsistent.** Hero `.button primary` vs analyzer `.button button-primary`; three section-label treatments incl. unstyled `<p>THE LAB QUESTION` (page.tsx:94). The exact drift that reads as machine-assembled. *Fix:* normalize button modifier; make THE LAB QUESTION a real `.section-kicker`. *Command:* `$impeccable polish`
- **[P3] No empty-state on-ramp / example.** Pre-analyze, the only guidance is the placeholder; a first-timer with no file stalls (the one real emotional valley). *Fix:* "Try this repo's CLAUDE.md" link that loads sample text. *Command:* `$impeccable onboard`
- **[P3] Closing `.lab-method` is the slop-adjacent weak end.** Decorative image + 3-bullet list restating the intro; page ends on its most generic block, wasting the readout peak. *Fix:* cut, or replace bullets with a concrete before/after prompt diff. *Command:* `$impeccable distill`
- **[P3] Cost unit is unexplained jargon.** "$X saved / 1M input reads" assumes cost-per-read modeling. *Fix:* one-line gloss. *Command:* `$impeccable clarify`

## Persona Red Flags

- **Jordan (first-timer):** Hits the empty-state valley (no example to click); if they paste, "faithfulness/strategy/reduction band" arrive undefined. Gets the peak, may not understand the number. **Medium risk.**
- **Riley (stress-tester):** Well defended — 200k guard truncates *and tells*, maxLength on handle, disabled states with explicit offline messaging. Gap: no clear/re-analyze affordance; failed submit shows raw error string. **Low risk.**
- **Casey (mobile):** 760px breakpoint collapses band + export to single column, drops borders; targets ≥44px. Watch: disclosure tables `min-width:700px` → horizontal scroll feels cramped on phones. **Low-medium risk.**
- **Sam (a11y):** Strongest coverage — skip link, focus-visible everywhere, `role="status"` + focus move, `scope` on all `th`, `prefers-reduced-motion` honored. **Low risk.**

## Minor Observations

- Leaderboard `<details>` advertises "beat Lab 001 · 41.6%" but opens to "Leaderboard offline" when Supabase is unconfigured — enticing badge → dead end. Soften the summary meta while offline.
- Hero image alt text ("A glowing laboratory visualization of compressed context streams") is generic-AI-phrased; the `.lab-method` decorative image correctly uses `alt=""`.
- `.reduction-band` `grid-template-columns:1fr .5fr` — cost column can get tight for the `$` figure + wrap on mid-width viewports before 760px.
- `MODEL_RATES[1]` index fallback for the default rate silently changes if the array is reordered (maintainability smell, not UX).

## Questions to Consider

1. Is a precise "41%" more honest than leading with the band "25%–48%"? Does the point estimate over-claim against a modeled (not live-rewritten) projection?
2. Should the tool ship with its own CLAUDE.md pre-analyzed, so the instrument is already "on" when you arrive and pasting becomes personalization, not a prerequisite?
3. The leaderboard invites "beat 41.6%" — but the estimator can't lower your % below what its four strategies model. Are users being invited to a game they can only win by pasting a fatter file?
