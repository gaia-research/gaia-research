# MilimPet — Draggable Milim & Gaia Companion (Implementation Plan)

> **Status:** Ready to implement. Follow this document exactly, top to bottom. Every
> file path, type, tooltip string, CSS class, keyframe, and state field the implementer
> needs is spelled out here. No design decisions are left open.
>
> **Author's intent:** a persistent, adorable, genuinely useful ambient companion. Milim
> (chibi girl silhouette) stands beside **Gaia** (the proven CSS baby dragon), on a little
> floating diorama in the bottom-right corner. She drags anywhere, resizes, hides, and
> talks — page-aware, event-reactive, and alive with idle chaos. She replaces the old
> `MilimDragon` in the craft lab and rides on **every** page via the root layout.

---

## 0. Orientation — what already exists (verified against the repo)

- **Root layout** `app/layout.tsx` is minimal: `<html lang="en"><body>{children}</body></html>`.
  Pages are **Server Components** (no `"use client"`); they render `<SiteHeader/>` + `<main>` + `<SiteFooter/>`.
- **Existing mascot** `components/labs/craft/MilimDragon.tsx` — CSS-only pink dragon, fixed
  bottom-right, `z-index: 190`, styles in `app/labs/infinite-skill-craft/craft-chrome.css`
  (`.craft-dragon*`). It listens to `window` `isc:fused` `CustomEvent` and reacts (spark/celebrate).
  **We are replacing this on the craft page**, but we keep its dragon geometry (it's proven and cute).
- **Craft events:** `CraftCanvas` dispatches `window.dispatchEvent(new CustomEvent('isc:fused', { detail: { canonical?, firstDiscovery?, builderUnlock? } }))`.
- **Context Diet:** `components/labs/ContextDietAnalyzer.tsx` (`"use client"`) commits an analysis in
  `handleAnalyze()` (calls `setAnalyzed(...)`). **This is our dispatch point** for a new `milim:page-event`.
- **Design tokens** (in `app/globals.css` `:root`) — use these, never hardcode hex:
  `--bg:#05060a`, `--surface:#0b0c13`, `--surface-raised:#10121d`, `--ink:#f0f1f5`,
  `--muted:#bec2d4`, `--dim:#858ba4`, `--line:#242a40`, `--blue:#38bdf8`, `--pink:#ec4899`,
  `--amber:#fbbf24`, `--danger:#f87171`.
  Fonts: `--display` (Bebas Neue), `--brand` (Syne), `--body` (Manrope), `--mono` (DM Mono).
- **`color-mix(in srgb, …)`** is already used throughout `craft-chrome.css`; reuse that idiom.
- **`clamp()`** is the responsive idiom in this repo.

### Files this plan creates / edits

```
components/MilimPet/tooltips.ts        (NEW — Phase 1)
components/MilimPet/MilimPet.tsx        (NEW — Phase 2)
components/MilimPet/milim-pet.css       (NEW — Phase 3)
components/MilimPet/index.ts            (NEW — barrel, Phase 2)
app/layout.tsx                          (EDIT — Phase 4: mount pet + import css)
components/labs/ContextDietAnalyzer.tsx (EDIT — Phase 6: dispatch milim:page-event)
app/labs/infinite-skill-craft/page.tsx  (EDIT — Phase 7: remove MilimDragon import + usage)
```

`MilimDragon.tsx` and its `.craft-dragon*` CSS are **left in place** (dead but harmless) unless
you want to delete them in Phase 7; deletion instructions are included and optional.

---

## Phase 1 — Data & types: `components/MilimPet/tooltips.ts`

Pure, framework-free module. No React imports. Exports the context enum, the `Tooltip` type,
the per-context pools, and two tiny helpers (`pickTooltip`, `contextFromPathname`) so the
component stays lean.

### 1.1 Types

```ts
// components/MilimPet/tooltips.ts

/**
 * A single inline link inside a tooltip line. Rendered as an <a>. External links
 * (href starts with "http") get target="_blank" rel="noreferrer" automatically.
 */
export interface TooltipLink {
  text: string;
  href: string;
}

/**
 * One Milim line. `text` is the full sentence(s). If `link` is present, its `text`
 * MUST be a verbatim substring of `text`; the renderer splits on it and turns that
 * slice into an <a>. Keep every line to 1–2 short sentences.
 */
export interface Tooltip {
  text: string;
  link?: TooltipLink;
}

/**
 * Page/route contexts. `idle` and `celebrate` are pseudo-contexts used for the
 * ambient musing pool and the big canonical-unlock reaction, not routes.
 */
export type PageContext =
  | "home"
  | "labs"
  | "craft"
  | "context-diet"
  | "research"
  | "idle"
  | "celebrate";
```

### 1.2 Tooltip pools (COMPLETE — paste verbatim)

> Voice check: HIGH energy, short, "boss!"/"gosh!"/"golly!", em dashes, exclamation marks,
> chaotic-good scientist who is convinced she is literally the strongest. Never more than 2 sentences.

```ts
export const TOOLTIPS: Record<PageContext, Tooltip[]> = {
  home: [
    { text: "Welcome to the lab, boss! I'm Milim — strongest researcher, obviously." },
    { text: "Gaia and I run this whole place. Poke around, don't break the reactor!" },
    { text: "Every claim here links to receipts. Evidence or it didn't happen — golly, I love that." },
    { text: "New to Gaia? Start with the ledger below. It's where the real gossip lives." },
    { text: "Psst — the Skill Tree is the big map.", link: { text: "the Skill Tree", href: "https://gaiaskilltree.com" } },
    { text: "Wanna play instead of read? Go smash some skills together in the craft lab, boss!" },
    { text: "I benchmarked myself once. Result: strongest. Peer review pending, hehe." },
    { text: "Gaia says hi. That was a squeak. He's shy but he's a No. 1 dragonoid, gosh." },
  ],

  labs: [
    { text: "Pick your poison, boss! Two labs, zero rules, maximum chaos." },
    { text: "Craft lab = fuse skills and watch stuff hatch. Diet lab = shrink your context. Easy!" },
    { text: "Everything here runs in YOUR browser. No uploads, no snooping — Milim's honor." },
    { text: "Golly, so many buttons. Press them all, that's the scientific method!" },
    { text: "These are toys with teeth. Real benchmarks get published after review, boss." },
    { text: "Can't decide? Flip a coin. Or ask Gaia — he always picks the fusion game." },
    { text: "Labs are where hypotheses come to get bullied into evidence. Let's go!" },
  ],

  craft: [
    { text: "Drag two skills together and BAM — something hatches, boss!" },
    { text: "Canonical unlocks are the real deal — they link straight into the tree.", link: { text: "the tree", href: "https://gaiaskilltree.com" } },
    { text: "Weird combos make weird skills. That's not a bug, that's discovery, gosh!" },
    { text: "Stuck? Try fusing a base skill with itself. Chaos loves a mirror." },
    { text: "Fresh out of ideas? Reset the canvas and go feral again.", link: { text: "go feral again", href: "/labs/infinite-skill-craft" } },
    { text: "First to discover a combo gets the glory. Beat the other builders, boss!" },
    { text: "Gaia ate a curse skill once. He was FINE. Mostly. Don't tell anyone." },
    { text: "Every canonical result is a real page someone can build on. Big deal, golly!" },
  ],

  "context-diet": [
    { text: "Paste your bloated context, boss — let's put it on a diet!" },
    { text: "Half your tokens are probably filler. Trim 'em, save the budget, gosh." },
    { text: "See the before/after bars? That gap is pure money you're not spending." },
    { text: "The full benchmark is on GitHub if you want the receipts.", link: { text: "on GitHub", href: "https://github.com/gaia-research" } },
    { text: "Rank your run on the leaderboard — beat the compression high score, boss!", link: { text: "the leaderboard", href: "/labs/context-diet" } },
    { text: "Rule of thumb: if a line doesn't change the answer, it's dead weight." },
    { text: "Smaller context = faster, cheaper, sharper agents. Golly, it's basically free wins." },
    { text: "Your text never leaves the browser. I only judge it silently, hehe." },
  ],

  research: [
    { text: "This is the ledger, boss. Every entry earned its spot with evidence." },
    { text: "We observe, benchmark, verify, publish. Vibes are NOT a methodology, gosh." },
    { text: "Postmortems are just victory laps for problems we already crushed." },
    { text: "Read the CI churn one — flaky pipelines cost more than you'd think, golly." },
    { text: "Every number here has a receipt. Click through, trust nothing, verify everything!" },
    { text: "Frontier work is messy. We publish the mess AND the fix, boss. That's the deal." },
    { text: "Cost research? Yeah, I count tokens for fun. Strongest AND thrifty, hehe." },
  ],

  idle: [
    { text: "Boss... boss. Are you still there? Blink twice if the reactor's on fire." },
    { text: "I could beat any other mascot in a fight. Any of them. Gosh, I'm bored." },
    { text: "Gaia's asleep on my hood again. Ten out of ten dragonoid, zero out of ten alarm clock." },
    { text: "Fun fact: I'm the strongest. Second fun fact: see fact one. Hehe!" },
    { text: "Drag me somewhere fun, boss! I've been staring at this corner for AGES." },
    { text: "If a skill fuses in the forest and no one's watching, is it still canonical? Deep." },
    { text: "I reorganized the whole lab while you were reading. You're welcome, golly." },
    { text: "Snack break? I only eat data. And occasionally Gaia's snacks. Don't tell him." },
    { text: "One day I'll fuse myself into an even STRONGER Milim. Science permitting, boss." },
  ],

  celebrate: [
    { text: "CANONICAL UNLOCK, BOSS!! You just wrote a real page in the tree — GOSH!!" },
    { text: "OKAY THAT WAS HUGE! Gaia did a backflip! I did a backflip! EVERYONE FLIPPED!" },
    { text: "First discovery!! Nobody's ever fused that before — you absolute legend, golly!!" },
    { text: "STRONGEST COMBO ENERGY!! Put that one on the leaderboard immediately, boss!" },
    { text: "The reactor's SINGING! That's the good kind of sound, I promise! WOOO!" },
    { text: "New skill unlocked and it's CANON! I'm framing this moment forever, gosh!!" },
  ],
};
```

### 1.3 Event-reaction lines (smaller, dedicated pools)

Craft fusion (non-canonical) and generic page-events use short punchy one-liners so the reactivity
feels distinct from ambient cycling.

```ts
/** Fired on isc:fused when NOT canonical/first/builder (ordinary fusion). */
export const FUSE_REACTIONS: Tooltip[] = [
  { text: "Ooooh, something hatched! Do it again, boss!" },
  { text: "Fusion complete! Gaia approves. That's a squeak of approval, gosh." },
  { text: "Nice combo! The forge is warming up — keep 'em coming!" },
  { text: "Bam! New skill on the board. Science marches on, hehe." },
  { text: "Two skills enter, one weird baby leaves. I LOVE this job, boss!" },
  { text: "That crackle? That's discovery. Or the reactor. Either way — cool!" },
];

/**
 * Fired when a page dispatches `milim:page-event` with a `topic` we don't have a
 * specific line for. Generic upbeat acknowledgement.
 */
export const GENERIC_EVENT_REACTIONS: Tooltip[] = [
  { text: "Ooh, something happened! I saw that, boss. Nice." },
  { text: "Noted and logged. The strongest never miss a detail, gosh." },
  { text: "Yesss, keep going — you're onto something!" },
];

/** Keyed reactions for specific `milim:page-event` topics. Extensible. */
export const TOPIC_REACTIONS: Record<string, Tooltip[]> = {
  "context-diet:analyzed": [
    { text: "Ooh, let's see the damage — how much flab did we trim, boss?" },
    { text: "Analysis done! Those before/after bars don't lie, gosh." },
    { text: "Every token you cut is a token you don't pay for. Golly, math!" },
  ],
};
```

### 1.4 Helpers

```ts
/** Pick a random tooltip from a pool, avoiding an immediate repeat of `avoid` when possible. */
export function pickTooltip(pool: Tooltip[], avoid?: Tooltip): Tooltip {
  if (pool.length === 0) return { text: "..." };
  if (pool.length === 1 || !avoid) return pool[Math.floor(Math.random() * pool.length)];
  let next = pool[Math.floor(Math.random() * pool.length)];
  let guard = 0;
  while (next.text === avoid.text && guard < 6) {
    next = pool[Math.floor(Math.random() * pool.length)];
    guard++;
  }
  return next;
}

/** Map a Next.js pathname to a PageContext. Defaults to "home". */
export function contextFromPathname(pathname: string): PageContext {
  if (pathname.startsWith("/labs/infinite-skill-craft")) return "craft";
  if (pathname.startsWith("/labs/context-diet")) return "context-diet";
  if (pathname.startsWith("/labs")) return "labs";
  if (pathname.startsWith("/research")) return "research";
  return "home"; // "/" and anything else
}
```

**Gotchas (Phase 1):**
- `link.text` must be an exact substring of `text` (case-sensitive). Every link above satisfies this — do not paraphrase.
- `TOPIC_REACTIONS` keys are the `topic` string sent in `milim:page-event`. Keep the `context-diet:analyzed` key stable; Phase 6 dispatches exactly that.

---

## Phase 2 — Core component: `components/MilimPet/MilimPet.tsx`

`"use client"`. Self-contained. Uses `usePathname()` for auto-context (no per-page wiring required),
with an optional `pageContext` prop override for edge cases.

### 2.1 Props

```ts
export interface MilimPetProps {
  /**
   * Force a context. When omitted (default), context is auto-derived from the
   * current pathname via contextFromPathname(). Pass this only to override.
   */
  pageContext?: PageContext;
  /**
   * Disable entirely (e.g. behind a future feature flag). Default false.
   */
  disabled?: boolean;
}
```

### 2.2 Constants (module scope, top of file)

```ts
const LS_KEY = "milim-pet:v1"; // single JSON blob for all persisted prefs
const SIZES = ["sm", "md", "lg"] as const;
type PetSize = (typeof SIZES)[number];

const SIZE_PX: Record<PetSize, number> = { sm: 70, md: 110, lg: 150 };

const CYCLE_MIN_MS = 8000;   // random tooltip cadence lower bound
const CYCLE_MAX_MS = 15000;  // upper bound
const TOOLTIP_VISIBLE_MS = 6500; // how long a bubble stays before auto-hide
const BORED_AFTER_MS = 60000; // no interaction → bored state
const REACTION_HOLD_MS = 4200; // event reaction bubble hold
const MARGIN = 12; // px viewport clamp margin
const KEYBOARD_STEP = 24; // px per arrow-key nudge
```

### 2.3 Persisted preference shape

```ts
interface PetPrefs {
  x: number | null;   // left px; null → default bottom-right anchor
  y: number | null;   // top px;  null → default bottom-right anchor
  size: PetSize;      // "md" default
  collapsed: boolean; // false default
}

const DEFAULT_PREFS: PetPrefs = { x: null, y: null, size: "md", collapsed: false };
```

### 2.4 Complete state / ref inventory

**useState:**
| Field | Type | Purpose |
|---|---|---|
| `mounted` | `boolean` | gate render until after hydration (avoids SSR/localStorage mismatch); starts `false`, set `true` in a mount effect |
| `prefs` | `PetPrefs` | position/size/collapsed; hydrated from localStorage in mount effect |
| `tooltip` | `Tooltip \| null` | current bubble content; `null` = hidden |
| `bubbleVisible` | `boolean` | drives fade+slide in/out (kept separate from `tooltip` so exit anim can play) |
| `dragging` | `boolean` | true while pointer drag active (disables transitions, shows grab cursor) |
| `bored` | `boolean` | true after `BORED_AFTER_MS` idle; swaps to droopy idle animation |
| `reactionActive` | `boolean` | true briefly after an event reaction (drives `data-celebrate`/excited pose) |
| `celebrating` | `boolean` | true during a canonical/first-discovery big reaction |
| `reducedMotion` | `boolean` | mirror of `prefers-reduced-motion`; disables JS-driven animation extras |

**useRef:**
| Field | Type | Purpose |
|---|---|---|
| `wrapRef` | `HTMLDivElement \| null` | the draggable widget root (for measuring + clamping) |
| `dragState` | `{ pointerId, startX, startY, originX, originY } \| null` | live pointer-drag bookkeeping |
| `cycleTimer` | `ReturnType<typeof setTimeout> \| null` | schedules the next ambient tooltip |
| `hideTimer` | `ReturnType<typeof setTimeout> \| null` | auto-hides the current bubble |
| `boredTimer` | `ReturnType<typeof setTimeout> \| null` | fires the bored state |
| `reactionTimer` | `ReturnType<typeof setTimeout> \| null` | clears reaction/celebrate flags |
| `lastTooltip` | `Tooltip \| null` | avoid immediate repeats via `pickTooltip` |
| `pausedRef` | `boolean` | true when tab hidden — skip scheduling |
| `saveTimer` | `ReturnType<typeof setTimeout> \| null` | debounce localStorage writes during drag |

### 2.5 Derived values

```ts
const pathname = usePathname();
const context: PageContext = pageContext ?? contextFromPathname(pathname);
const sizePx = SIZE_PX[prefs.size];
```

### 2.6 Hooks / effects (implement in this order)

1. **Mount + hydrate** (`useEffect`, `[]`):
   - `setMounted(true)`.
   - Read `localStorage.getItem(LS_KEY)`, `JSON.parse`, merge over `DEFAULT_PREFS` (guard with try/catch). `setPrefs(...)`.
   - Init `reducedMotion` from `window.matchMedia("(prefers-reduced-motion: reduce)").matches`; add a `change` listener that updates it; clean up.

2. **Persist prefs** (`useEffect`, `[prefs, mounted]`):
   - If `!mounted` return. Debounce 250ms via `saveTimer`, then `localStorage.setItem(LS_KEY, JSON.stringify(prefs))`. Clear timer on cleanup.

3. **Ambient tooltip cycling** (`useEffect`, `[context, mounted, prefs.collapsed, reducedMotion]`):
   - If `!mounted || prefs.collapsed` return (collapsed pill is silent).
   - Define `schedule()` that sets `cycleTimer` to a random delay in `[CYCLE_MIN_MS, CYCLE_MAX_MS]`; on fire, if `pausedRef` is true just reschedule; else `showTooltip(pickFrom(context))` and reschedule.
   - Show an **immediate greeting** ~1200ms after (re)mount/context change (a short first line from the context pool), then start the cycle.
   - Cleanup clears `cycleTimer` + `hideTimer`.

4. **Bored watchdog** (`useEffect`, `[mounted]`):
   - Define `resetBored()` → clear `boredTimer`, `setBored(false)`, restart timer for `BORED_AFTER_MS` → `setBored(true)` + show an `idle` tooltip.
   - Call `resetBored()` on mount and expose it to interaction handlers (pointer down, key nav, tooltip show). Cleanup clears timer.

5. **Event listeners** (`useEffect`, `[context, mounted, reducedMotion]`):
   - `isc:fused`: read `detail`; `big = canonical || firstDiscovery || builderUnlock`. If `big` → `setCelebrating(true)`, show a `celebrate` line. Else → show a `FUSE_REACTIONS` line + `setReactionActive(true)`. Arm `reactionTimer` (`REACTION_HOLD_MS`, longer for celebrate) to clear both flags.
   - `milim:page-event`: read `detail.topic` (string). Look up `TOPIC_REACTIONS[topic] ?? GENERIC_EVENT_REACTIONS`, show a line, `setReactionActive(true)`, arm `reactionTimer`.
   - Add both listeners to `window`; cleanup removes them + clears `reactionTimer`.

6. **Visibility pause** (`useEffect`, `[]`):
   - `visibilitychange` handler sets `pausedRef.current = document.hidden`. When it becomes visible again, reschedule the cycle (call the same `schedule()` — expose via ref or re-run by toggling a dep). Simplest: keep a `resumeRef` function set inside effect #3 and call it here. Cleanup removes listener.

7. **Global pointermove/up during drag** (inside the drag handlers, see 2.7) — attach to `window` on pointerdown, remove on pointerup.

### 2.7 Drag implementation (pointer events, mouse + touch unified)

Use **Pointer Events** (`onPointerDown` on the drag surface; `window` `pointermove`/`pointerup`).

```
onPointerDown(e):
  - ignore if e.target is a button/link/toggle (let clicks through) — check e.target.closest("button, a")
  - capture: dragState.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY,
      originX: current left, originY: current top }
  - if prefs.x/y are null, resolve current rect via wrapRef.getBoundingClientRect() to seed originX/originY
  - setDragging(true); resetBored(); (element.setPointerCapture(e.pointerId))
  - add window listeners: pointermove(onMove), pointerup(onUp)

onMove(e):
  - if !dragState.current return
  - dx = e.clientX - startX; dy = e.clientY - startY
  - nextX = originX + dx; nextY = originY + dy
  - clamp to [MARGIN, window.innerWidth - width - MARGIN] and [MARGIN, window.innerHeight - height - MARGIN]
    (width/height from wrapRef.getBoundingClientRect())
  - setPrefs(p => ({ ...p, x: nextX, y: nextY }))

onUp(e):
  - remove window listeners; dragState.current = null; setDragging(false)
  - (release pointer capture); prefs already persisted via debounce
```

**Clamp on resize:** add a `window` `resize` listener (in an effect) that re-clamps `prefs.x/y`
into the new viewport so the pet never strands offscreen after rotation/resize.

### 2.8 Keyboard drag (accessibility)

The widget root has `tabIndex={0}` and `role="group"` `aria-label="Milim companion — arrow keys to move"`.
`onKeyDown`:
- Arrow keys → nudge `prefs.x/y` by `KEYBOARD_STEP` (resolve current rect if null), clamped; `preventDefault`; `resetBored()`.
- `Enter`/`Space` on the root when focused → toggle a tooltip (show next context line).
- `Escape` → collapse.

### 2.9 Size + collapse controls

Two small buttons in a control cluster (see JSX):
- **Size toggle** cycles `sm → md → lg → sm`: `setPrefs(p => ({ ...p, size: SIZES[(SIZES.indexOf(p.size)+1)%3] }))`. `aria-label={`Resize Milim (current: ${prefs.size})`}`.
- **Collapse toggle**: `setPrefs(p => ({ ...p, collapsed: !p.collapsed }))`. `aria-label` toggles "Hide/Show Milim companion".

### 2.10 Tooltip show/hide helper

```
showTooltip(t: Tooltip, holdMs = TOOLTIP_VISIBLE_MS):
  - if paused (document.hidden) return
  - clear hideTimer
  - setTooltip(t); setBubbleVisible(true); lastTooltip.current = t; resetBored()
  - hideTimer = setTimeout(() => setBubbleVisible(false), holdMs)
  - after exit anim (~300ms) optionally setTooltip(null) — or just keep last text with visibility=false
```

Announce politely: the bubble container has `role="status"` `aria-live="polite"`. When collapsed,
no bubble renders (silent).

### 2.11 JSX structure (semantic skeleton)

```tsx
if (disabled || !mounted) return null;

return (
  <div
    ref={wrapRef}
    className="milim-pet"
    data-size={prefs.size}
    data-collapsed={prefs.collapsed ? "true" : "false"}
    data-dragging={dragging ? "true" : "false"}
    data-bored={bored ? "true" : "false"}
    data-reacting={reactionActive ? "true" : "false"}
    data-celebrate={celebrating ? "true" : "false"}
    data-context={context}
    style={positionStyle}     // see 2.12
    role="group"
    aria-label="Milim companion. Use arrow keys to move."
    tabIndex={0}
    onKeyDown={onKeyDown}
  >
    {/* ── Collapsed pill ─────────────────────────────── */}
    {prefs.collapsed ? (
      <button
        type="button"
        className="milim-pet-pill"
        onClick={() => setPrefs(p => ({ ...p, collapsed: false }))}
        aria-label="Show Milim companion"
      >
        <span aria-hidden="true" className="milim-pet-pill-dragon">🐉</span>
        <span className="milim-pet-pill-label">MILIM</span>
      </button>
    ) : (
      <>
        {/* ── Speech bubble ────────────────────────────── */}
        <div
          className="milim-bubble"
          data-visible={bubbleVisible ? "true" : "false"}
          role="status"
          aria-live="polite"
          aria-hidden={bubbleVisible ? "false" : "true"}
        >
          <p className="milim-bubble-text">{renderTooltip(tooltip)}</p>
          <span className="milim-bubble-tail" aria-hidden="true" />
        </div>

        {/* ── The diorama (drag surface) ───────────────── */}
        <div
          className="milim-scene"
          onPointerDown={onPointerDown}
          role="img"
          aria-label="Milim Nova and her baby dragon Gaia"
        >
          <div className="milim-scene-inner">   {/* scaled by --mp-scale */}
            {/* Gaia dragon (right) — see CSS 3.4 */}
            <div className="mp-dragon" aria-hidden="true">
              <span className="mp-dragon-spark" data-show={reactionActive || celebrating ? "true":"false"}>
                {celebrating ? "⭐" : "✦"}
              </span>
              <div className="mp-dragon-body">
                <div className="mp-dragon-head"><i className="mp-horn-l"/><i className="mp-horn-r"/></div>
                <div className="mp-wing-l"/><div className="mp-wing-r"/>
                <div className="mp-dragon-torso"/>
                <div className="mp-dragon-tail"/>
              </div>
            </div>

            {/* Milim chibi (left) — see CSS 3.3 */}
            <div className="mp-milim" aria-hidden="true">
              <div className="mp-milim-hair-back"/>
              <div className="mp-milim-body">           {/* hoodie */}
                <span className="mp-milim-logo"/>        {/* dragon-hint patch */}
              </div>
              <div className="mp-milim-legs"><i className="mp-leg-l"/><i className="mp-leg-r"/></div>
              <div className="mp-milim-head">
                <i className="mp-star mp-star-l"/><i className="mp-star mp-star-r"/>
                <i className="mp-eye mp-eye-l"/><i className="mp-eye mp-eye-r"/>
                <i className="mp-blush mp-blush-l"/><i className="mp-blush mp-blush-r"/>
              </div>
              <div className="mp-milim-hair-l"/><div className="mp-milim-hair-r"/>
            </div>

            {/* Ground shadow */}
            <span className="mp-shadow" aria-hidden="true" />
          </div>
        </div>

        {/* ── Controls ─────────────────────────────────── */}
        <div className="milim-pet-controls">
          <button type="button" className="milim-pet-btn" onClick={cycleSize}
            aria-label={`Resize Milim, currently ${prefs.size}`} title="Resize">
            {prefs.size === "sm" ? "▂" : prefs.size === "md" ? "▅" : "█"}
          </button>
          <button type="button" className="milim-pet-btn" onClick={collapse}
            aria-label="Hide Milim companion" title="Hide">×</button>
        </div>
      </>
    )}
  </div>
);
```

### 2.12 Positioning style

```ts
const positionStyle: React.CSSProperties =
  prefs.x !== null && prefs.y !== null
    ? { left: prefs.x, top: prefs.y, right: "auto", bottom: "auto" }
    : {}; // fall back to CSS default anchor (bottom-right)
```

The root `.milim-pet` is `position: fixed`; CSS supplies the default bottom-right anchor when no
inline `left/top` is present (see 3.2).

### 2.13 `renderTooltip` (link splitting)

```tsx
function renderTooltip(t: Tooltip | null): React.ReactNode {
  if (!t) return null;
  if (!t.link) return t.text;
  const { text, link } = t;
  const i = text.indexOf(link.text);
  if (i === -1) return text; // safety: link.text not found
  const before = text.slice(0, i);
  const after = text.slice(i + link.text.length);
  const external = link.href.startsWith("http");
  return (
    <>
      {before}
      <a
        className="milim-bubble-link"
        href={link.href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        onPointerDown={(e) => e.stopPropagation()} // don't start a drag from the link
      >
        {link.text}
      </a>
      {after}
    </>
  );
}
```

### 2.14 Barrel: `components/MilimPet/index.ts`

```ts
export { MilimPet } from "./MilimPet";
export type { MilimPetProps } from "./MilimPet";
export type { PageContext, Tooltip } from "./tooltips";
```

**Gotchas (Phase 2):**
- **Do not read `localStorage` during render** — only inside effects, gated by `mounted`. Return `null` until `mounted` to avoid hydration mismatch and an SSR flash in the wrong corner.
- **Stop propagation** on all interactive children (`buttons`, `a`) `onPointerDown` so drags don't start when the user meant to click.
- Cursor: `.milim-scene` gets `cursor: grab`; `.milim-pet[data-dragging="true"] .milim-scene` gets `cursor: grabbing`.
- Because pages are Server Components, **`usePathname()` works only inside this client component** — that's fine, MilimPet is `"use client"`.

---

## Phase 3 — CSS: `components/MilimPet/milim-pet.css`

Plain global CSS file (matches repo convention — `craft-chrome.css`, `craft.css`, `globals.css`).
Imported once in `app/layout.tsx` (Phase 4). Uses tokens + `color-mix` + `clamp`.

### 3.1 Sizing strategy (IMPORTANT)

Build the **entire diorama at the `md` pixel scale** (base unit reference: scene box `110px` wide,
`128px` tall). Then scale the whole thing with a single CSS variable `--mp-scale` on `.milim-scene-inner`
via `transform: scale(var(--mp-scale))`. This means **you never re-derive dozens of sizes** for sm/lg.

```css
.milim-pet[data-size="sm"] { --mp-scale: 0.64; }  /* ~70px  */
.milim-pet[data-size="md"] { --mp-scale: 1;    }  /* ~110px */
.milim-pet[data-size="lg"] { --mp-scale: 1.36; }  /* ~150px */
```

`.milim-scene` gets an explicit width/height that also scales, so the fixed-position clamp math in
JS matches what's on screen:

```css
.milim-scene { width: calc(110px * var(--mp-scale)); height: calc(128px * var(--mp-scale)); }
.milim-scene-inner { width: 110px; height: 128px; transform: scale(var(--mp-scale)); transform-origin: bottom center; }
```

### 3.2 Root + layout

```css
.milim-pet {
  position: fixed;
  right: clamp(0.75rem, 3vw, 2rem);   /* default anchor; overridden by inline left/top */
  bottom: clamp(0.75rem, 3vw, 2rem);
  z-index: 200;                        /* above craft dragon's old 190 */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  touch-action: none;                  /* let pointer drag own touch gestures */
  user-select: none;
  -webkit-user-select: none;
}
.milim-pet:focus-visible { outline: 3px solid var(--blue); outline-offset: 6px; border-radius: 8px; }
```

### 3.3 Milim chibi (CSS-only silhouette)

Design goal: **readable at a glance** — pink hair mass, round head with two blue eyes + blush,
two yellow star hairpins, an oversized black hoodie with a tiny white dragon-hint patch, black legs
with pink-striped thigh-highs, chunky pink/white sneakers. Kept stylized (a charming suggestion, not
a portrait). All positioned absolutely inside `.mp-milim` which sits on the LEFT of the scene.

```css
.mp-milim { position: absolute; left: 2px; bottom: 6px; width: 52px; height: 108px; }

/* Hair mass behind everything (long flowing pink) */
.mp-milim-hair-back {
  position: absolute; top: 6px; left: 4px; width: 44px; height: 80px;
  background: linear-gradient(180deg, var(--pink), color-mix(in srgb, var(--pink) 70%, #7a1e46));
  border-radius: 46% 46% 40% 40% / 40% 40% 60% 60%;
  box-shadow: 0 0 14px color-mix(in srgb, var(--pink) 45%, transparent);
}

/* Hoodie (oversized black) */
.mp-milim-body {
  position: absolute; bottom: 22px; left: 6px; width: 40px; height: 46px;
  background: linear-gradient(180deg, #16171f, #0a0b10);
  border: 1px solid color-mix(in srgb, var(--pink) 24%, var(--line));
  border-radius: 40% 40% 30% 30% / 46% 46% 30% 30%;
}
/* white dragon-hint patch on the hoodie */
.mp-milim-logo {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  width: 16px; height: 14px; background: #f4f5fb;
  border-radius: 50% 50% 40% 40% / 60% 60% 40% 40%;
  box-shadow: 0 0 4px color-mix(in srgb, var(--blue) 40%, transparent);
}
.mp-milim-logo::after { /* tiny dragon nub */
  content: ""; position: absolute; top: -3px; right: -2px; width: 6px; height: 6px;
  background: #f4f5fb; border-radius: 50%;
}

/* Legs: thigh-high socks + chunky sneakers */
.mp-milim-legs { position: absolute; bottom: 0; left: 12px; width: 30px; height: 26px; }
.mp-leg-l, .mp-leg-r {
  position: absolute; bottom: 0; width: 11px; height: 22px;
  background: linear-gradient(180deg, #0d0e14, #08090d); border-radius: 5px 5px 3px 3px;
}
.mp-leg-l { left: 0; }
.mp-leg-r { right: 0; }
/* pink stripe on socks */
.mp-leg-l::before, .mp-leg-r::before {
  content: ""; position: absolute; top: 3px; left: 1px; right: 1px; height: 2px; background: var(--pink);
  box-shadow: 0 4px 0 color-mix(in srgb, var(--pink) 80%, transparent);
}
/* chunky sneaker */
.mp-leg-l::after, .mp-leg-r::after {
  content: ""; position: absolute; bottom: -3px; left: -2px; width: 15px; height: 8px;
  background: #f4f5fb; border-radius: 4px 6px 4px 4px;
  border-bottom: 3px solid var(--pink);
}

/* Head */
.mp-milim-head {
  position: absolute; top: 8px; left: 8px; width: 36px; height: 34px;
  background: #ffe0d0; border-radius: 50% 50% 46% 46% / 54% 54% 46% 46%;
  z-index: 2;
}
/* eyes (Rimuru-blue) */
.mp-eye { position: absolute; top: 15px; width: 6px; height: 8px; background: var(--blue);
  border-radius: 50%; box-shadow: 0 0 4px color-mix(in srgb, var(--blue) 60%, transparent);
  animation: mp-blink 5s ease-in-out infinite; }
.mp-eye-l { left: 9px; }
.mp-eye-r { right: 9px; }
/* blush */
.mp-blush { position: absolute; top: 22px; width: 6px; height: 3px; background: color-mix(in srgb, var(--pink) 60%, transparent); border-radius: 50%; }
.mp-blush-l { left: 5px; }
.mp-blush-r { right: 5px; }
/* yellow star hairpins (CSS stars via clip-path) */
.mp-star {
  position: absolute; top: -2px; width: 10px; height: 10px; background: var(--amber);
  clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--amber) 70%, transparent));
  z-index: 3;
}
.mp-star-l { left: 4px; transform: rotate(-12deg); }
.mp-star-r { right: 4px; transform: rotate(12deg); }

/* Front side hair locks framing the face */
.mp-milim-hair-l, .mp-milim-hair-r {
  position: absolute; top: 10px; width: 12px; height: 60px; background: var(--pink);
  border-radius: 40% 40% 60% 60%; z-index: 1;
}
.mp-milim-hair-l { left: 2px; transform: rotate(4deg); }
.mp-milim-hair-r { right: 2px; transform: rotate(-4deg); }
```

The whole `.mp-milim` gets a gentle idle sway (see keyframes 3.6).

### 3.4 Gaia dragon (port of proven `.craft-dragon` geometry, renamed `.mp-dragon*`)

Reuse the exact shapes from `craft-chrome.css` `.craft-dragon-*`, renamed and re-anchored to the
RIGHT side of the scene, smaller (it's the sidekick now, ~46px). Copy the torso/head/horns/wings/tail
rules and the `dragon-float`/`dragon-blink`/`dragon-wing-beat` keyframes, renamed to `mp-*`.

```css
.mp-dragon { position: absolute; right: 0; bottom: 30px; width: 48px; height: 58px; }
.mp-dragon-body { position: relative; width: 48px; height: 58px; animation: mp-float 3.8s ease-in-out infinite; }
.mp-dragon-torso {
  position: absolute; bottom: 6px; left: 8px; width: 32px; height: 34px;
  background: #f4f5fb;                     /* WHITE baby dragon (Gaia), not pink */
  border-radius: 50% 50% 44% 44% / 60% 60% 40% 40%;
  box-shadow: 0 0 12px color-mix(in srgb, var(--blue) 30%, transparent),
              inset 0 -5px 9px color-mix(in srgb, var(--blue) 22%, #cbd5e1);
}
.mp-dragon-torso::after { content:""; position:absolute; bottom:4px; left:6px; width:20px; height:13px;
  background: color-mix(in srgb, var(--blue) 12%, #ffffff); border-radius:50%; }
.mp-dragon-head {
  position: absolute; top: 1px; left: 11px; width: 27px; height: 25px; background: #f4f5fb;
  border-radius: 50% 50% 38% 38% / 55% 55% 45% 45%; box-shadow: 0 0 8px color-mix(in srgb, var(--blue) 22%, transparent);
}
.mp-dragon-head::before, .mp-dragon-head::after {
  content:""; position:absolute; top:7px; width:5px; height:5px; background:var(--bg); border-radius:50%;
  animation: mp-blink 4.6s ease-in-out infinite;
}
.mp-dragon-head::before { left:5px; }
.mp-dragon-head::after  { right:5px; }
.mp-horn-l, .mp-horn-r {
  position:absolute; top:-4px; width:4px; height:9px;
  background: color-mix(in srgb, var(--blue) 40%, #e2e8f0); border-radius:2px 2px 1px 1px;
}
.mp-horn-l { left:5px; transform:rotate(-16deg); }
.mp-horn-r { right:5px; transform:rotate(16deg); }
.mp-wing-l, .mp-wing-r {
  position:absolute; bottom:16px; width:15px; height:20px;
  background: color-mix(in srgb, var(--blue) 30%, #ffffff);
  animation: mp-wing-beat 3.8s ease-in-out infinite;
}
.mp-wing-l { left:-3px; transform-origin:right center; clip-path: polygon(100% 100%, 0 0, 0 100%); }
.mp-wing-r { right:-3px; transform-origin:left center; clip-path: polygon(0 100%, 100% 0, 100% 100%); }
.mp-dragon-tail {
  position:absolute; bottom:0; right:3px; width:14px; height:14px;
  border:3px solid #f4f5fb; border-top:none; border-left:none; border-radius:0 0 8px 0; transform:rotate(10deg);
}
.mp-dragon-spark {
  position:absolute; top:-6px; left:50%; transform:translateX(-50%); font-size:0.85rem; opacity:0; pointer-events:none;
}
.mp-dragon-spark[data-show="true"] { animation: mp-spark 0.85s ease-out both; }
```

### 3.5 Ground shadow + reaction/celebrate/bored states

```css
.mp-shadow {
  position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
  width: 84px; height: 12px; background: radial-gradient(ellipse at center, rgba(0,0,0,.5), transparent 72%);
  filter: blur(2px);
}

/* Excited reaction: both bounce, dragon glow warms */
.milim-pet[data-reacting="true"] .mp-dragon-body { animation: mp-float 3.8s ease-in-out infinite, mp-react 0.6s cubic-bezier(.16,1,.3,1) both; }
.milim-pet[data-reacting="true"] .mp-milim { animation: mp-hop 0.55s cubic-bezier(.16,1,.3,1) both; }

/* Celebrate: bigger, amber, star spark */
.milim-pet[data-celebrate="true"] .mp-dragon-spark { font-size: 1.15rem; filter: drop-shadow(0 0 8px color-mix(in srgb, var(--amber) 70%, transparent)); }
.milim-pet[data-celebrate="true"] .mp-dragon-body { animation: mp-float 3.8s ease-in-out infinite, mp-react-big 0.9s cubic-bezier(.16,1,.3,1) both; }
.milim-pet[data-celebrate="true"] .mp-milim { animation: mp-cheer 0.9s cubic-bezier(.16,1,.3,1) both; }
.milim-pet[data-celebrate="true"] .mp-dragon-torso { box-shadow: 0 0 20px color-mix(in srgb, var(--amber) 55%, transparent), inset 0 -5px 9px color-mix(in srgb, var(--blue) 22%, #cbd5e1); }

/* Bored: droop + slower sway */
.milim-pet[data-bored="true"] .mp-milim { animation: mp-droop 4.5s ease-in-out infinite; }
.milim-pet[data-bored="true"] .mp-dragon-body { animation-duration: 5.5s; }

/* Dragging: kill idle transitions, show grabbing cursor */
.milim-scene { cursor: grab; }
.milim-pet[data-dragging="true"] .milim-scene { cursor: grabbing; }
.milim-pet[data-dragging="true"] .mp-milim,
.milim-pet[data-dragging="true"] .mp-dragon-body { animation-play-state: paused; }
```

### 3.6 Speech bubble

```css
.milim-bubble {
  position: relative;
  max-width: min(72vw, 260px);
  background: linear-gradient(180deg, color-mix(in srgb, var(--pink) 8%, var(--surface-raised)), var(--surface));
  border: 1px solid color-mix(in srgb, var(--pink) 55%, var(--line));
  border-radius: 14px;
  padding: 0.6rem 0.8rem;
  box-shadow: 0 6px 22px rgba(0,0,0,.5), 0 0 18px color-mix(in srgb, var(--pink) 28%, transparent);
  opacity: 0;
  transform: translateY(8px) scale(0.96);
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(.16,1,.3,1);
  pointer-events: none;
}
.milim-bubble[data-visible="true"] { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
.milim-bubble-text { margin: 0; font: 500 0.82rem/1.45 var(--body); color: var(--ink); text-wrap: pretty; }
.milim-bubble-link { color: var(--blue); border-bottom: 1px solid color-mix(in srgb, var(--blue) 45%, transparent); font-weight: 600; }
.milim-bubble-link:hover { color: var(--pink); border-bottom-color: var(--pink); }
/* tail pointing down toward the pet */
.milim-bubble-tail {
  position: absolute; bottom: -7px; right: 26px; width: 12px; height: 12px;
  background: var(--surface);
  border-right: 1px solid color-mix(in srgb, var(--pink) 55%, var(--line));
  border-bottom: 1px solid color-mix(in srgb, var(--pink) 55%, var(--line));
  transform: rotate(45deg);
}
```

### 3.7 Controls + collapsed pill

```css
.milim-pet-controls { display: flex; gap: 0.35rem; opacity: 0; transform: translateY(-4px); transition: opacity .18s ease, transform .18s ease; }
.milim-pet:hover .milim-pet-controls,
.milim-pet:focus-within .milim-pet-controls { opacity: 1; transform: translateY(0); }
.milim-pet-btn {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  background: var(--surface-raised); border: 1px solid var(--line); color: var(--dim);
  font: 0.8rem var(--mono); cursor: pointer; border-radius: 7px;
  transition: border-color .16s ease, color .16s ease, background .16s ease;
}
.milim-pet-btn:hover { border-color: var(--pink); color: var(--pink); background: color-mix(in srgb, var(--pink) 10%, var(--surface-raised)); }
.milim-pet-btn:focus-visible { outline: 3px solid var(--blue); outline-offset: 2px; }

.milim-pet-pill {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.4rem 0.7rem; background: var(--surface-raised);
  border: 1px solid color-mix(in srgb, var(--pink) 45%, var(--line)); border-radius: 999px;
  color: var(--ink); font: 700 0.72rem/1 var(--brand); letter-spacing: .08em; cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,.4); transition: border-color .16s ease, transform .16s ease;
}
.milim-pet-pill:hover { border-color: var(--pink); transform: translateY(-1px); }
.milim-pet-pill:focus-visible { outline: 3px solid var(--blue); outline-offset: 3px; }
.milim-pet-pill-dragon { font-size: 1.05rem; animation: mp-pill-bob 3s ease-in-out infinite; }
```

### 3.8 Keyframes (complete list)

```css
@keyframes mp-float      { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes mp-blink      { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(0.12); } }
@keyframes mp-wing-beat  { 0%,100% { transform: scaleX(1); } 40% { transform: scaleX(1.22); } 60% { transform: scaleX(0.88); } }
@keyframes mp-sway       { 0%,100% { transform: rotate(-1.5deg) translateY(0); } 50% { transform: rotate(1.5deg) translateY(-2px); } }
@keyframes mp-spark      { 0% { opacity:1; transform: translateX(-50%) translateY(0) scale(.5); } 60% { opacity:1; transform: translateX(-50%) translateY(-12px) scale(1.2); } 100% { opacity:0; transform: translateX(-50%) translateY(-20px) scale(.8); } }
@keyframes mp-react      { 0% { transform: translateY(0) scale(1,1); } 35% { transform: translateY(-8px) scale(.94,1.08); } 100% { transform: translateY(0) scale(1,1); } }
@keyframes mp-react-big  { 0% { transform: translateY(0) scale(1,1); } 30% { transform: translateY(-14px) scale(.9,1.12); } 60% { transform: translateY(-3px) scale(1.05,.96); } 100% { transform: translateY(0) scale(1,1); } }
@keyframes mp-hop        { 0% { transform: translateY(0); } 40% { transform: translateY(-7px); } 100% { transform: translateY(0); } }
@keyframes mp-cheer      { 0% { transform: translateY(0) rotate(0); } 25% { transform: translateY(-9px) rotate(-6deg); } 55% { transform: translateY(-3px) rotate(6deg); } 100% { transform: translateY(0) rotate(0); } }
@keyframes mp-droop      { 0%,100% { transform: rotate(-2deg) translateY(1px); } 50% { transform: rotate(2deg) translateY(3px); } }
@keyframes mp-pill-bob   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
```

Apply idle sway to Milim by default: `.mp-milim { animation: mp-sway 4.2s ease-in-out infinite; }`.

### 3.9 Responsive

The single `--mp-scale` variable already handles pet sizing. Only add a phone tweak so the bubble
never overflows and the default anchor tightens:

```css
@media (max-width: 600px) {
  .milim-pet { right: 0.6rem; bottom: 0.6rem; gap: 0.3rem; }
  .milim-bubble { max-width: min(78vw, 220px); font-size: 0.8rem; }
}
```

### 3.10 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .mp-milim, .mp-dragon-body, .mp-wing-l, .mp-wing-r,
  .mp-dragon-head::before, .mp-dragon-head::after, .mp-eye,
  .mp-milim[style], .milim-pet-pill-dragon {
    animation: none !important;
  }
  .milim-pet[data-reacting="true"] .mp-dragon-body,
  .milim-pet[data-reacting="true"] .mp-milim,
  .milim-pet[data-celebrate="true"] .mp-dragon-body,
  .milim-pet[data-celebrate="true"] .mp-milim { animation: none !important; transform: none !important; }
  .mp-dragon-spark[data-show="true"] { animation: none !important; opacity: 0; }
  .milim-bubble { transition: opacity 0.2s linear !important; transform: none !important; }
  .milim-bubble[data-visible="true"] { transform: none !important; }
}
```

The component **also** reads `reducedMotion` in JS and simply does not toggle `reactionActive`/
`celebrating` visual escalation aggressively — but the bubbles/tooltips still work (they're content, not motion). Belt and suspenders.

**Gotchas (Phase 3):**
- Keep the diorama drawn at md scale; **never** hand-tune sm/lg geometry.
- `transform-origin: bottom center` on `.milim-scene-inner` keeps the pair "standing on the ground" as it scales.
- The white dragon uses `#f4f5fb` + blue-tinted shadows (Gaia is white, not pink — Milim's hair carries the pink). This visually distinguishes the two characters.

---

## Phase 4 — Layout integration: `app/layout.tsx`

Mount MilimPet once at the root so it rides every page. Because it's `"use client"` and auto-detects
context via `usePathname()`, **no provider and no per-page wiring is required.** Import the CSS here too.

```tsx
import type { Metadata } from "next";
import "./globals.css";
import "../components/MilimPet/milim-pet.css";
import { MilimPet } from "@/components/MilimPet";

export const metadata: Metadata = { /* unchanged */ };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <MilimPet />
      </body>
    </html>
  );
}
```

**Gotchas (Phase 4):**
- Placing `<MilimPet/>` **after** `{children}` keeps it last in DOM order (paints on top; also good for a11y reading order — it's ambient).
- `RootLayout` stays a Server Component; importing a `"use client"` child is fine in App Router.
- Use the relative import for CSS (`"../components/MilimPet/milim-pet.css"`) — matches how `globals.css` is imported. The `@/` alias is used for the component import (matches repo usage, e.g. `@/components/...`).

---

## Phase 5 — Page-specific context wiring

**Chosen approach: pathname auto-detection (zero per-page changes).** `contextFromPathname()`
(Phase 1.4) maps routes → context. This is why nothing needs to be threaded through Server Components.

Optional override escape hatch (not needed today, documented for the future): any page can force a
context by dispatching `window.dispatchEvent(new CustomEvent("milim:set-context", { detail: { context } }))`
from a small client child. If you want this, add to Phase 2 effect #5 a listener that calls
`setContextOverride(detail.context)` and prefer it over the pathname value. **Skip unless a page needs it.**

Route → context table (verify against `contextFromPathname`):

| Route | Context |
|---|---|
| `/` | `home` |
| `/labs` | `labs` |
| `/labs/infinite-skill-craft` | `craft` |
| `/labs/context-diet` | `context-diet` |
| `/research`, `/research/ci-churn`, `/research/cost` | `research` |

---

## Phase 6 — Event integration

### 6.1 Craft (already emits — just listen)

No page change needed. `CraftCanvas` already dispatches `isc:fused` with
`{ canonical?, firstDiscovery?, builderUnlock? }`. Phase 2 effect #5 consumes it:
- big (`canonical || firstDiscovery || builderUnlock`) → `celebrate` pool + `data-celebrate`.
- ordinary → `FUSE_REACTIONS` + `data-reacting`.

> The old `MilimDragon` also listened for a distinct `isc:first-discovery` in the task brief, but the
> actual repo signals first-discovery **inside** `isc:fused.detail.firstDiscovery`. We follow the repo.
> If a separate `isc:first-discovery` event is later added, add a sibling listener that shows a
> `celebrate` line — trivial.

### 6.2 Context Diet (add a dispatch)

Edit `components/labs/ContextDietAnalyzer.tsx` — in `handleAnalyze()`, after `setAnalyzed(...)`,
dispatch a page-event so Milim reacts to a fresh analysis:

```ts
const handleAnalyze = () => {
  const capped = text.length > MAX_ANALYZE_CHARS;
  setTruncated(capped);
  setAnalyzed(capped ? text.slice(0, MAX_ANALYZE_CHARS) : text);
  setSubmitState("idle");
  setSubmitError("");
  // Milim companion reacts to a fresh analysis.
  window.dispatchEvent(new CustomEvent("milim:page-event", { detail: { topic: "context-diet:analyzed" } }));
  requestAnimationFrame(() => resultsRef.current?.focus());
};
```

`TOPIC_REACTIONS["context-diet:analyzed"]` (Phase 1.3) supplies the lines.

### 6.3 Other pages

Passive — ambient cycling only. No changes.

### 6.4 The generic contract (document for future pages)

> Any page may make Milim react by dispatching:
> `window.dispatchEvent(new CustomEvent("milim:page-event", { detail: { topic: "<key>" } }))`.
> Add a matching entry to `TOPIC_REACTIONS` for a bespoke line, or omit it to use `GENERIC_EVENT_REACTIONS`.

**Gotchas (Phase 6):**
- Dispatch only in the browser (these handlers are already client-side; safe).
- Don't spam: `handleAnalyze` fires once per commit, which is the right cadence.

---

## Phase 7 — Replace `MilimDragon` in the craft lab

Edit `app/labs/infinite-skill-craft/page.tsx`:

1. **Remove the import:** delete line `import { MilimDragon } from "@/components/labs/craft/MilimDragon";`.
2. **Remove the usage:** delete the `<MilimDragon />` element and its comment near the bottom of `<main>`.
3. Update the nearby comment that says "dragon" so it doesn't dangle (e.g. change
   "onboarding, about, FAQ, dragon, traffic" → "onboarding, about, FAQ, traffic").

The craft page now gets its companion from the **root layout's `MilimPet`**, which auto-detects
`context === "craft"` via the pathname, listens to `isc:fused`, and shows the craft tooltip pool.
No `pageContext` prop needed.

### 7.1 Optional cleanup (recommended, low-risk)

- Delete `components/labs/craft/MilimDragon.tsx` (now unused).
- Delete the `.craft-dragon*` block and its keyframes/reduced-motion/mobile rules from
  `app/labs/infinite-skill-craft/craft-chrome.css` (search `craft-dragon` — lines ~702–930, the
  reduced-motion block ~1233–1250, and the mobile block ~1293–1300). Leaving them is harmless (no
  element uses those classes anymore), so this is optional and can be a follow-up.

**Gotchas (Phase 7):**
- The old dragon was `z-index: 190`; MilimPet is `200`. If both were ever present, MilimPet wins. After removal there's no overlap.
- Confirm nothing else imports `MilimDragon` (`grep -rn "MilimDragon" .`) before deleting the file.

---

## Verification checklist (run before calling it done)

1. `grep -rn "MilimDragon"` returns no live import/usage (only the optional-to-delete file/CSS).
2. Load each route; Milim appears bottom-right, greets ~1.2s in, cycles every 8–15s with the right pool.
3. Drag with mouse **and** touch → moves, clamps at edges, survives reload (localStorage), re-clamps on window resize.
4. Size toggle cycles 70 → 110 → 150px, persists. Collapse → pill "🐉 MILIM", persists, re-expands.
5. Craft: fuse two skills → excited bubble + bounce. Trigger a canonical/first-discovery → celebrate bubble + amber star.
6. Context Diet: run an analysis → `context-diet:analyzed` reaction bubble.
7. Links in craft / context-diet bubbles are clickable (external open in new tab) and **don't** start a drag.
8. Keyboard: focus the pet, arrow keys nudge it, `Esc` collapses.
9. `prefers-reduced-motion: reduce` → no float/bounce/spark; bubbles still fade in/out gently.
10. Switch tabs away and back → animations pause (visibility) and the cycle resumes cleanly.
11. Run the **visual-audit** skill (per `CLAUDE.md`) at phone→desktop widths; confirm no horizontal cut-off and no console errors. The pet must not create horizontal overflow at 360px.

---

## Appendix A — Full tooltip count (satisfies "≥6 per context")

| Context | Lines | Has links |
|---|---|---|
| home | 8 | 1 (gaiaskilltree.com) |
| labs | 7 | — |
| craft | 8 | 2 (gaiaskilltree.com, /labs/infinite-skill-craft) |
| context-diet | 8 | 2 (github.com/gaia-research, /labs/context-diet) |
| research | 7 | — |
| idle | 9 | — |
| celebrate | 6 | — |
| FUSE_REACTIONS | 6 | — |
| GENERIC_EVENT_REACTIONS | 3 | — |
| TOPIC_REACTIONS[context-diet:analyzed] | 3 | — |

## Appendix B — Event contract summary

| Event | Source | MilimPet response |
|---|---|---|
| `isc:fused` `{canonical?,firstDiscovery?,builderUnlock?}` | `CraftCanvas` (existing) | big → `celebrate` pool + `data-celebrate`; else `FUSE_REACTIONS` + `data-reacting` |
| `milim:page-event` `{topic:string}` | any page (Context Diet added in Phase 6) | `TOPIC_REACTIONS[topic] ?? GENERIC_EVENT_REACTIONS` + `data-reacting` |
| `milim:set-context` `{context}` | optional future | override auto-context (only if implemented) |
| `visibilitychange` | document | pause/resume cycling + CSS anims |
| `prefers-reduced-motion` | matchMedia | disable motion (CSS + JS) |

## Appendix C — Why these design choices

- **Root-layout mount + pathname auto-context** avoids converting Server Component pages to client
  components and needs zero prop threading — the single biggest simplification.
- **One `--mp-scale` variable** for sizing means the diorama is authored once (md) and the sm/lg
  variants are free, with no geometry drift.
- **Reusing the proven `.craft-dragon` geometry** (recolored white for Gaia) de-risks the hardest
  visual and lets Milim be the new, simpler silhouette beside a known-good dragon.
- **Single JSON localStorage blob** (`milim-pet:v1`) keeps persistence atomic and versioned for
  future migrations.
- **Pointer Events** unify mouse + touch with one code path; `touch-action: none` + `setPointerCapture`
  give smooth dragging on mobile without scroll-jank.
</content>
</invoke>
