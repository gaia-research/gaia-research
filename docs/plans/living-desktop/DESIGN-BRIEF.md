# Design brief — B Living Tree in Claude Desktop

**For the creative lead (Opus 5.5, high) and the Sonnet makers working under them.** This page is meant
to be enough on its own; the short must-read list at the end is for depth, not prerequisite. Gate: G2
(founder approves a direction; the orchestrator confirms every interaction maps to a feasible primitive).

## The product

Open **My Tree** in Claude Desktop and a pane docks beside the conversation. It shows *the user's
Agent Skills* — not their human abilities — as one Gaia-style directed acyclic graph. Skills that Gaia's
canon recognises sit on their real branches with their real prerequisite and fusion edges. Skills Gaia
does not know sit as honest, unconnected local satellites. Canon structure the user does not have
appears only as quiet context. When Skill Heaven summons a skill the user already has, that node gets a
brief halo; when it summons one from outside their inventory — even from a Skill Zero start — a clearly
different **visitor** arrives with its source and commit and never grows edges. "Card returned" and
"body read" look different. Everything opens its receipt. One control hides the live layer; closing the
pane hides everything; neither changes what the agent does.

**Two views (founder, FD-1, 2026-10-09).** **My Tree** is local-first: every skill the person has is a
first-class node, whether or not Gaia's canon knows it, and canon edges appear only between their own
verified skills. A switch opens the **Gaia view**: Gaia's canon tree, with the person's skills marked on
it and canon context (missing prerequisites, eligible fusions) shown there. The live layer works in both.
Design the switch, and the moment of switching, as part of the product; it is not a settings toggle.
The planning prototype predates this decision and draws context inside My Tree.

**The tree is the hero.** Design one coherent experience, not a set of widgets. Make it calm enough to
leave open and alive enough to be worth opening.

## Not in scope

- **C, the cockpit** (Lens near the prompt, Flow of agents, Receipt/Trust inspector, Scope and loadouts) —
  sketch where it would attach (one frame), do not design it out.
- The CLI statusline (`◇ entropy ‹‹ [HIGH] ›› · 9 skills`) — it exists and stays one line.
- A canon explorer. The public Gaia World Tree already exists; this is a personal projection.
- Saving visitors, editing edges, accepting proposals, sync, sharing, ranks for personal skills.

## The canvas you actually have

Design on what the host can paint. These are Claude Code 2.1.294's declared desktop primitives; the
**desktop paint itself is not yet probed** (B-ACCEPTANCE §6), so mark anything that leans on an unprobed
behaviour.

| Primitive | What it gives you | Limits that shape the design |
|---|---|---|
| **Pane** | a framed region docked beside the transcript (or inline above the prompt); several panes show as tabs | width varies — design for **420 px** and **900 px**, legible at 360 px; it opens only when the person asks |
| **`Svg`** | your graph: any SVG you generate, as an image or — with `isInteractive` — in a sandboxed frame where `:hover`, CSS animation, SMIL and `<title>` tooltips work | **no script, no per-node click reported back**, ≤131,072 characters — the engine refuses one more (design for ≤110,000), no external references, no shipped fonts (system stack inside the SVG); colours are yours, the host theme is not readable from inside |
| **Native controls** | `Box`, `Text`, `Button` (hotkeys, primary/secondary), `Select`, `Input`, `Link`, `Markdown`, `Code`; absolutely positioned `Box` (a Button placed over the graph is engine-legal and pressable) | host-drawn in the host font and theme; this is where selection, search, filters, the inspector and the screen-reader path live; whether an overlaid Button lines up with a drawn node is unprobed |
| **`Client`** | an optional pointer and keyboard surface (drag, hover, keys, a frame clock) | draws text-cell elements only, **not `Svg`** |
| **Status entry, Lens band** | already exist in the console (one line under the prompt; a band above it) | do not duplicate them; when the tree is open it is the primary home for live marks |

Consequence (planner's default, AD-4): **the graph is drawn; it is not clicked.** Pair the SVG with a
native **rail** — a keyboard-friendly list grouped by what matters (live now · your skills · canon
context · local · history) — and an **inspector**. Selecting in the rail focuses and rings the node in
the drawing. Pan and zoom are focus / fit / zoom controls that redraw the view. If probes show hit-targets
over nodes or a drag surface work well, they become enhancements.

## What the marks must say

Every distinction below must survive **grayscale** and be readable by **shape and words**. Colour may
reinforce, never decide.

| # | Thing | Meaning you must express |
|---|---|---|
| 1 | Your canon capability | possessed, and Gaia's canon knows it — Basic ○ or Fusion ◇; the best implementation's canon rank appears **only** for a verified match, with provenance ("Gaia canon · 3★ Evolved · via ⟨named skill⟩") |
| 2 | Your local skill | possessed, no canon match — no rank, no edges, plainly "local" |
| 3 | Possibly canon | local styling plus words in the inspector ("possibly ⟨capability⟩ — not verified"); never an edge |
| 4 | Canon context | structure you do not have: a missing prerequisite of your fusion, or a fusion you are eligible for — quiet, clearly "not installed"; **drawn in the Gaia view** |
| 5 | On disk, not in this session | after a consented scan: present but not listed to the model now |
| 6 | Halo — summoned | on a node you have: *card returned* (open) → *body read* (settled); "read not observed on this host" when the host cannot tell |
| 7 | Visitor — Gaia canon | summoned, canon knows it, you do not have it — not installed, no edges into your graph |
| 8 | Visitor — external | summoned from outside canon: "Summoned · external", repo and commit when known; it may point at the agent that summoned it, never at a skill |
| 9 | Agents | which agent (main or a subagent) caused a mark, when the host reported it; "agent not reported" otherwise |
| 10 | History | what happened earlier this session, after marks fade |
| 11 | Live layer hidden | the calm base tree, plus a quiet count of what is hidden |
| 12 | Honesty notices | listing cut short; reads not observable; agent ids not reported; canon revision mismatch |
| 13 | Source provenance | this repo · personal · plugins · synced · bundled — a filter and an inspector fact, **never a branch** |
| 14 | Collisions | two skills with one name; which one the host resolves, when known |

## Required frames

My Tree ↔ Gaia view switch (both directions, with a live mark on screen) · the same summon seen in each
view · Remember for hide/live preferences, and forgetting it · first open (no consent yet) · consent card · scan diff · empty tree · sparse tree · many skills (300,
level-of-detail) · a canon Basic → Fusion branch · a fusion with a missing prerequisite · unmapped local
skills · possibly-canon in the inspector · known-node halo: card returned → body read · canon visitor ·
external visitor from a Skill Zero start · concurrent subagents (three agents, four summons, one repeat)
· click-through provenance: node → instances → receipt · live layer hidden · pane closed and reopened ·
session end → history · degraded host (no reads, no agent ids) · reduced motion · grayscale · light and
dark · 360 px, 420 px and 900 px.

## Directions to explore — two or three, then recommend one

Starting points from #2046; replace any of them if you find better:

- **World Tree** — Gaia-native: Basics toward the roots, Fusions toward the crown, one structural parent
  line per node with quieter grafts (the World Tree's own rule); visitors arrive in a band of sky above
  the crown. Strongest family resemblance to Gaia.
- **Atlas Plate** — the ledger: canonical branches as quiet horizontal plates, skills as glyph chips,
  edges as hairlines; visitors in an "arrivals" margin. Densest and calmest at 420 px.
- **Constellation** — exploratory: capabilities clustered by branch around a core, canon context as faint
  points, visitors entering from the edge. Most alive; hardest to keep calm.

Judge each against: legibility at 420 px, calm with five agents active, family resemblance to Gaia,
scaling to 300 skills inside the character limit, keyboard and screen-reader path, and how obviously a
visitor is *not* yours.

## Visual inheritance

- **From Gaia** (`gaia-skill-tree/DESIGN.md`, `PRODUCT.md`): the glyph grammar ○ ◇ ◉ ◆ ★; type colours
  Basic `#38bdf8`, Fusion `#f59e0b`; the rank ladders (only for verified nodes); starless generics in
  muted italic (`#64748b`); the personality *Evidence · Permanence · Craft*; the anti-references — no SaaS
  KPI tiles, no gamification, no decorative glass, no gradient text.
- **From Skill Heaven** (`docs/CONTROL-PLANE.md` §4): the live layer's instrument hues — summon umbrella
  violet `#a58ae0`, Heaven `#6f96d8` (converge `‹`), Hell `#e094c8` (explore `›`, **never red**), Ultra
  `#d9b25c` (controller only, never prestige). Arbor green `#55c878` is reserved for canonical Arbor
  evidence and nothing today qualifies — do not draw it. Red only for real failures.
- **Reconcile one conflict:** Gaia's DESIGN.md names "Heaven Violet `#c084fc`" for cross-brand links;
  Skill Heaven's design of record uses `#a58ae0`. Pick one for the live layer and say why.
- **Personal is not prestige.** No rank colour on unverified skills; no level-ups, XP, streaks or mastery
  words. Canon numbers only with their provenance.

## Motion and choreography

- Arrival: one short pulse (≤1.2 s), once per subject. Body read: the halo settles; an optional, very slow,
  low-amplitude glow. Session end: a quick fade to history.
- Many agents: arrivals within a quarter second share one pulse; at most seven visitors drawn, then
  "+N more".
- Reduced motion: no animation at all; every state still readable.
- Never animate continuously for attention. The tree should be easy to ignore.

## Words

Truthful primary labels; no ceremony inside the instrument. Use: "Summoned · external", "Summoned · Gaia
canon · not installed", "card returned · body not read", "in context · body read by main agent", "read
not observed on this host", "local · no canon match", "possibly ⟨capability⟩ — not verified", "agent not
reported", "earlier this session". Never: "used", "active", "working", "mastered", "unlocked", "level up".

## What to hand back

1. Two or three directions: a paragraph each, the mark vocabulary, six key frames (first open, populated,
   halo, external visitor, many agents, hidden), and a one-line feasibility note per interaction naming
   the primitive that draws it.
2. **One recommendation** and why it feels like a complete product, not half of a control plane.
3. The full frame set above for the recommendation.
4. An interactive prototype of the recommendation whose graph is a pure function from fixture data to an
   `Svg` string — no script inside the SVG, a live character count beside it — so B1 can build on it
   instead of throwing it away.
5. The first-use → actual-use storyboard.
6. One C sketch: where Lens, Flow, Receipt/Trust and Scope would attach without crowding B.
7. A copy deck for every state.
8. At most three open questions for the founder.

**Accepted at G2 when:** the founder approves a direction; the grayscale ten-second test passes with at
least three people new to Gaia (B-ACCEPTANCE Q6); and every interaction maps to a probe cell that is
green, or to a stated in-desktop alternative.

## Must-read (short)

1. [`README.md`](README.md) §2 (the product) and §5 rows L5–L9 (what not to do).
2. [`CONTRACT.md`](CONTRACT.md) §2–§5 — what can be known about a skill and an event.
3. [`B-ACCEPTANCE.md`](B-ACCEPTANCE.md) §3 (what each signal may show) and §4 (thresholds).
4. `gaia-skill-tree/DESIGN.md` — Skill Types, Rank System, Starless references, World Tree colour and
   glyph re-axis, Typography; `PRODUCT.md` — anti-references and accessibility.
5. `gaia-skill-heaven/docs/CONTROL-PLANE.md` §2.3 (card versus context), §4 (visual system), §5.2–§5.3
   (Lens band and console pane).
6. [`prototype/living-tree.html`](prototype/living-tree.html) — illustrates the semantics on the feasible
   primitives. **It is not a direction**; do not anchor on its look.
