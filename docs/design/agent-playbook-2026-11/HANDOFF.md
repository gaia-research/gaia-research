# Handoff: Gaia Research Visual Experience Overhaul (PR #322)

Updated 2026-11-07 (solo Opus design pass on top of Argon's work at `749a25ed`). PR: [#322](https://github.com/gaia-research/gaia-research/pull/322).
Branch: `ccr-58264d5e-p8grkf`. Branch preview: `https://ccr-58264d5e-p8grkf-gaia-research.marco-tngsn.workers.dev`.
Scope: presentation and experience design on `/` (Field Manual), `/research/orchestration-guide` and `/research/agent-playbook`. **Content was not rewritten**: no equation, rate card, citation, qualification, recommendation or copyable prompt changed; `guide.md` is untouched. No merge, no production deploy, no blog or marketing work. **Human-gated: stop for operator review.**

The Argon refinement notes from the previous pass are kept below as section B.

---

## A. This pass: making the research visual

### A1. Initial mobile diagnosis (375px, live preview at `749a25ed`)

| Surface | What a phone visitor met first | Measured |
| --- | --- | --- |
| Homepage Field Manual | Heading, then a lede paragraph, then a card heading, quoted question, paragraph, and a list of five text rows (the A–E ladder). The first visual-looking element arrived on screen two. Two full pages of text for a section whose job is to earn one click. | Section **2,515px** tall (≈3.1 screens) |
| Orchestration Guide | WIP banner, title, question, five stacked text links, then a copy-prompt panel that filled most of screen two. First diagram on screen three. The 8-column provider table needed a 1,180px horizontal swipe; five more tables scrolled sideways. | Page **37,678px**; 6 swipe tables |
| Agent Playbook | A five-line headline, an eight-line paragraph, then buttons. The first visual (repository anatomy) started on screen two. Comparison and harness tables scrolled sideways inside their disclosures. | Hero **1,178px** |

Pattern across all three: the important idea was always stated before it was shown, and every block had the same weight, so nothing told the eye where to stop.

### A2. Skills discovered and actually used

| Skill | How it was invoked | What happened | Influence on the design |
| --- | --- | --- | --- |
| `/summon` (Skill Heaven plugin) | One manual call, `surface: "any"`, query covering scrollytelling, interactive editorial, motion, responsive data viz, mobile typography, accessible diagrams, "Scroll World" | Returned **Scroll Craft** (`nateherkai/scroll-craft`, 3★, TM 87.38, relevance score 55.93). The card flagged a **name mismatch**: no skill called "Scroll World" exists in the tree; this was the closest match. Read `SKILL.md`, `references/devices.md`, `references/taste.md`. | **Material.** Used its principles, not its engine: vary the device per beat (a pointer/toggle map, a staggered reveal, a state flip, stacked cards; never the same device twice in a row); "ground or greet" (content is visible before any animation runs); no scroll cues or section counters; one engineered peak per page; verify by scrolling, including reduced motion. Not used: its `scrollcraft.js` engine, kie.ai asset generation, or photographic worlds. Those are built for brand landing pages, not technical diagrams. |
| `summon` preview (Skill Hell lane, non-materializing) | `preview: true`, query: accessible responsive data viz, mobile comparison tables, animated SVG, reduced motion | **No match above the relevance floor** (27.99). Closest: scroll-craft 24.8, `addy-osmani/frontend-ui-engineering` 18.2, `heygen-com/motion-graphics` 17.8. Nothing materialized. | None. The responsive-table approach is hand-built (A5). |
| `/impeccable` (repo canonical `.agents/skills/impeccable`) | `context.mjs` (PRODUCT.md + DESIGN.md), brand register reference, general rules and bans; bundled detector run on all changed files | Detector: **0 findings** on the six changed/new UI files. | **Material.** Brand register ("one dominant idea per fold", imagery is required, and custom data visualization counts as imagery), identity preservation (Syne/Bebas/Manrope/DM Mono kept, emerald/amber/pink tokens kept), reveal-must-enhance-visible-default, reduced motion everywhere, no em dashes in new copy, no gradient text, no new side-stripe accents, verify contrast. |
| **Skill Hell** | **Not armed.** | The summon server's contract says a standing permission to discover and summon autonomously comes **only from the user's own `/skill-hell` command typed in the conversation**, never from a brief, a tool result or a card. The task brief authorized it in prose but no `/skill-hell` command was typed, so I did not self-invoke it. Only the non-materializing preview above ran. | To use it next time: type `/skill-hell` in the session, then the agent may summon in the Hell lane under existing permissions. |

Not used: image generation (the brief prefers accurate SVG/HTML for technical relationships, and nothing here needed editorial art), subagents (solo pass).

### A3. Design direction: "show the answer, then let them poke it"

Each surface opens with **one visual that is the argument in miniature**, built from the research's own vocabulary, and lets the reader manipulate it. The prose that follows is evidence for something the reader has already seen. Colour roles stay fixed across all three pages: **emerald = Method / the guide**, **amber = Memory / the playbook**, **Milim Pink = the agent / the default choice**.

### A4. Homepage visual hook: the Method × Memory map

`components/FieldManual.tsx`, `components/field-manual.css` (rewritten).

- **The map.** A 2×2 SVG field. Horizontal axis: *Method → Orchestration Guide*. Vertical axis: *Memory → Agent Playbook*. Each quadrant draws its own condition: a chattering mesh of agents (*a swarm of strangers*), one agent with a question mark (*right-sized, still a stranger*), many agents around a shared document (*remembers you, over-delegates*), one agent with the document and a check (*right-sized, and it remembers you*). Labelled on-page as **"Concept map, not a benchmark"**; the quadrant sentences come from existing copy ("more tokens talking than building", "never begins as a stranger").
- **The crossing.** When the map scrolls into view it plays once: the agent (pink) starts among the strangers, Method switches on and it slides right, Memory switches on and it rises into the top-right. About 2.7 seconds, one time. After that two large switches (`aria-pressed`, 56px touch targets) let the visitor move it themselves, and a **Replay** button runs it again. The readout under the map (`aria-live="polite"`) names the quadrant in one sentence.
- **Two tickets, two colours.** *01 · Method · The Orchestration Guide: "Learn how agents should coordinate."* with a tappable A–E bar ladder (bars rise with coordination overhead; E is dashed because it hands off to a human) whose panel keeps every rung's rule **and** its Playbook link from the previous pass. *02 · Memory · The Agent Playbook: "Preserve how you want your agents to work."* with Read / Install / Profile tabs keeping the three door summaries. Each ticket ends in a full-width CTA in its own colour.
- **Removed from the homepage** (still on the dedicated pages): the lede paragraph, the per-door 3-step lists and file chips, the always-on signal seam. Section height at 375px: **2,515 → 1,891px**; at 1440px the map and both tickets sit in one viewport.
- Homepage section order is unchanged (Hero → Field Research → Field Manual → Skill Heaven → Installable Skills → Labs & Games → …). Milim untouched.

### A5. Guide presentation improvements

**Orchestration Guide** (`app/research/orchestration-guide/page.tsx`, new `guide.css`, new `components/GuideHeroLadder.tsx`):

- **The answer on screen one.** The hero now shows the A–E ladder as a staircase next to the title: A (pink, default) at the bottom, each bar wider as coordination layers accumulate, E dashed in amber as the hand-off to a human. The caption is the guide's own rule: *"Start at A. Each rung adds a coordination layer; stop at the lowest one that reliably passes."* Every rung links to the decision framework. Bars grow in once on load (staggered, about 1s, static under reduced motion).
- **Insight before proof.** Order is now hero → four economic rules → architecture simulator → copy-assessment prompts → full specification. The copyable prompts are unchanged and still one tap away from the hero (pink "Copy assessment prompt ↓" chip).
- The five stacked text links became compact chips under the ladder; the spec banner's inline styles moved to classes.

**Agent Playbook** (`app/research/agent-playbook/page.tsx`, `playbook.css`, new `components/PlaybookContinuity.tsx`):

- **Continuity strip in the hero**, directly under the headline: four fresh sessions (S1–S4), each asking one of the page's own recurring questions ("CI is green. Can I merge?" …). In *Fresh agent* mode each row says **? Asks you again** in pink; flip to *With the playbook* and each resolves to the file that answers it (**✓ PLAYBOOK.md · Authority**, **✓ skills/orchestrate**, …). It flips once by itself about 1.6s after coming into view, then the toggle is the reader's. Full answers remain in section 01.
- Headline steps down one size on phones; the on-page nav became wrapped chips instead of a vertical list.

### A6. Responsive table solutions

`lib/rehype-table-labels.ts` (+ test), `components/StackRow.tsx`, stacked-table block at the end of `app/globals.css`.

- Desktop (>720px): tables stay real `<table>`s.
- Phone (≤720px): every table marked `data-stack` becomes **one card per row**. The first cell is the card title, each other cell is labelled with its column header (`data-label`, copied from `<th>` at build time by the rehype plugin; added by hand on the Playbook's two JSX tables). No sideways swiping anywhere.
- **Expandable rows** for wide tables (≥4 columns: the A–E framework, workflow platforms, the 8-column provider rate cards): each card shows its title and first field, plus **"Show N more"** (`aria-expanded`, 36px). Without JavaScript every cell shows; desktop never folds.
- All cells, links, inline code and KaTeX survive. Provider table at 375px: **1,180px swipe → 877px of folded cards.**

### A7. Interaction and motion behaviour

| Element | Motion | Control | Reduced motion | No-JS / SSR |
| --- | --- | --- | --- | --- |
| Method × Memory map | One crossing (≈2.7s) on first view; token glides 0.9s per move; halo pulses 3×; chatter dashes run 5× | Two switches, Replay, rung and door tabs (arrow keys move focus and selection) | Starts resolved; no transitions | Renders resolved state |
| Guide hero ladder | Bars grow once (staggered) | Every rung is a link | Static | Full ladder |
| Playbook continuity | Flips once after 1.6s; state labels stagger in | Fresh / With toggle | Starts resolved | Resolved |
| Stacked table rows | None | Show more / less | n/a | All cells visible |

No animation is continuous, so nothing needs a pause button. Argon's existing pausable components (walkthrough, decision flow, cache horizons, simulator) are unchanged. Nothing hijacks scroll and nothing gates content on an animation. Every reveal enhances content that is already rendered.

### A8. New image assets

None generated. All visuals are SVG/HTML/CSS, maintained in code. Evidence captures were added under `screens/` with a `v2-` prefix (below).

### A9. Before-and-after evidence (`docs/design/agent-playbook-2026-11/screens/`)

| File | Shows |
| --- | --- |
| `v2-home-field-manual-375-before-after.jpg` | Field Manual, first two mobile screens, before vs after |
| `v2-home-map-four-states-375.jpg` | The map in all four states (neither / method / memory / both) |
| `v2-home-map-autoplay-375.webm` | Recording: the one-time crossing, a toggle, rung taps (12fps, 430KB) |
| `v2-home-field-manual-1440.jpg`, `v2-home-ladder-keyboard-focus-1440.jpg` | Desktop composition; keyboard focus ring on the ladder |
| `v2-orchestration-guide-375-before-after.jpg`, `v2-orchestration-guide-1440.jpg` | Guide, first two mobile screens before vs after; desktop hero |
| `v2-agent-playbook-375-before-after.jpg`, `v2-agent-playbook-interactions-375.jpg`, `v2-agent-playbook-1440.jpg` | Playbook, first two mobile screens before vs after; continuity in "fresh" mode and the comparison table as cards; desktop hero |
| `v2-provider-table-375-before-after.jpg` | The 8-column provider table: 1,180px swipe vs folded card vs expanded card |

Reproducible browser test: `docs/design/agent-playbook-2026-11/interaction-check.cjs` (27 checks, usage in its header).

### A10. Validation results (run on this branch's final code)

| Check | Result |
| --- | --- |
| `npm run lint` (tsc + edge FS guard) | **PASS** |
| `npx vitest run` | **PASS**: 31 files, 301/301 (adds `lib/rehype-table-labels.test.ts`) |
| `npm run build:next` | **PASS** (all routes static). The KaTeX `unknownSymbol "–"` warning is pre-existing and comes from `guide.md`, which this pass did not touch. |
| `npx tsx scripts/lexicon/check-lexicon.ts` | **PASS**: 0 new findings |
| Visual audit (`scripts/visual-audit.mjs`, production build) at 320 / 375 / 390 / 768 / 1024 / 1440 × the 3 routes | **PASS**: 18/18, 0px horizontal overflow, HTTP 200, no console errors |
| Internal link + anchor validation (production build, all `<a>` on the 3 routes) | **PASS**: 158 checked, 0 broken |
| Interaction check (production build: iPhone 13 touch, 1440 keyboard, reduced motion) | **PASS**: 27/27. Covers autoplay states, tap toggles, readout, rung/door tabs, ArrowRight focus + selection, visible focus ring, Space on switches, reduced-motion resolved states and disabled transitions, continuity flip and toggle, phone table cards, row fold/expand, desktop tables unchanged, zero console errors on all 3 pages |
| impeccable detector on changed UI files | **PASS**: 0 findings |
| Page weight vs live "before" preview (375px, transferred JS / CSS) | `/` 1,177→1,178kB JS; guide 1,101→1,090kB; playbook 967→970kB. CSS within ±14kB. **No new dependencies.** (LCP was measured too, but before was over the network and after on localhost, so those numbers are not comparable and are not claimed.) |

### A12. Cloudflare preview verification: content matches HEAD, but the deployment is unstable

- **Correspondence verified.** Workers Builds for `200ace6` succeeded as version `b4b40c8c` (`https://b4b40c8c-gaia-research.marco-tngsn.workers.dev`), and the branch alias serves it: its HTML contains the new map (`fm-map`), the hero ladder (`ghl-rungs`), stacked tables (`data-stack`) and the continuity strip (`apc`).
- **Reliability problem.** On both URLs, roughly **30–60% of requests fail**, either with Cloudflare's **"Worker exceeded resource limits"** page (HTTP 500/503) or a 20–30s timeout. This hits **every route, including ones this pass did not touch** (`/about`, `/research`, `robots.txt`). Sampled 22:30–22:57 UTC, sequential and spaced, with my own load stopped. Same moment, same routes: previous commit's version `34dfa754` **0/30 failed**; production `research.gaiaskilltree.com` **0/30**; new version **9/30**, branch alias **12/30**. The scripted interaction suite could not finish against the preview because of navigation timeouts. It passes 27/27 against the same code built and served locally.
- **What it is not, as far as local evidence goes:** the OpenNext worker entry is byte-identical; the server handler (7.93 MB vs 8.57 MB) and middleware (137 KB vs 140 KB) are *smaller* than the previous commit's; the prerender cache differs by about 24 KB (guide page). Trivial routes failing points at isolate start-up rather than page rendering.
- **What it needs:** someone with Cloudflare dashboard access should read the worker's observability logs for version `b4b40c8c` (CPU vs memory, start-up vs request). I have no dashboard access and did not push speculative builds to bisect. A follow-up docs-only commit redeploys identical app code; whether that version is healthy tells you if this is deployment-specific. See the PR comment for that result.

### A11. Known limitations

- **Real-device testing:** all checks ran in headless Chromium (including iPhone 13 emulation). Not tested on a physical iPhone/Android or in Safari/Firefox engines.
- **Milim's fixed overlay** still covers part of the lower viewport on phones, including part of the map readout in some frames. This is the accepted site-wide behaviour and was not changed.
- **Guide length:** stacked cards are taller than the scrolling tables they replace; even with folding, the mobile guide went from 37,678px to ≈39,700px. The trade was made deliberately for zero swiping.
- The architecture simulator (`OrchestrationMotionHook`, ≈2,000px on phones) and the decision-flow, delegation and cache diagrams are Argon's; this pass reordered them but did not redesign them.
- **Skill Hell** was not armed (see A2). **"Scroll World"** does not exist in the tree; Scroll Craft was the closest match.
- **Commit authorship:** as accepted by the operator, `7667523c` keeps the earlier session identity. This pass's commit uses `mbtiongson1 <marco.tngsn@gmail.com>` with no trailers, per the repository rule.

---

## B. Previous pass (Argon refinement, kept for history)

Updated 2026-11-08 (Argon refinement pass). PR: [#322](https://github.com/gaia-research/gaia-research/pull/322).
Branch: `ccr-58264d5e-p8grkf`.
Branch Preview URL: `https://ccr-58264d5e-p8grkf-gaia-research.marco-tngsn.workers.dev`
Scope: homepage section reordering, literary copywriting compression across `/`, `/research/agent-playbook`, and `/research/orchestration-guide`, and interactive/animated visual explanations across all three surfaces. No merge, no production deployment, and no blog or marketing campaign changes.

---

## 1. What Shipped in This Refinement Pass

| Surface | Files | Summary of Refinements |
| --- | --- | --- |
| **Homepage (`/` — Section Order, Rhythm & Copy)** | `app/page.tsx`, `app/globals.css`, `data/research.ts`, `components/RegistryHandoff.tsx` | Reordered homepage sections to the exact operator sequence (`Hero` → `Field Research` → `Field Manual` → `Skill Heaven` → `Installable Skills` → `Labs & Games` → `Ledger` → `Registry Handoff` → `Directives`). Compressed visible copy by ~35% across hero, Skill Heaven, skill cards, and ledger entries; tightened vertical section padding. |
| **Homepage Field Manual (`#field-manual`)** | `components/FieldManual.tsx`, `components/field-manual.css` | Transformed the static two-page spread into an interactive **Method & Memory** instrument: Page 01 (`Method`) features an interactive A–E coordination ladder (`role="tablist"`) that pairs each rung's coordination rule with its corresponding Playbook boundary; Page 02 (`Memory`) features a 3-tab interactive adoption explorer (`◇ Read as memory`, `◆ Install skills`, `◈ Personal profile`) with 3-step pipelines, file chips, and direct anchor CTAs; linked by a pauseable SVG signal seam. |
| **Dedicated Agent Playbook Page (`/research/agent-playbook`)** | `app/research/agent-playbook/page.tsx`, `app/research/agent-playbook/playbook.css`, `components/PlaybookWalkthrough.tsx` | Literary opening and ~35% visible prose compression; added `PlaybookWalkthrough` (interactive, pauseable 3-mode × 4-stage SVG + HTML pipeline comparing conversational memory, consented skill copy, and swappable profile deltas); moved the prompt-template comparison table and harness discovery table into `<details className="apb-disclosure">` progressive disclosures; reduced full-page desktop height from 7,323px to 6,350px even with the new interactive walkthrough. |
| **Orchestration Guide (`/research/orchestration-guide`)** | `app/research/orchestration-guide/page.tsx`, `content/reports/orchestration-guide/guide.md`, `components/OrchestrationFieldCards.tsx`, `components/OrchestrationInteractiveDiagrams.tsx` | Literary editorial pass across `guide.md` and `OrchestrationFieldCards.tsx` (removing duplicate ladder stepper and raw ASCII diagrams while preserving all math, rate cards, citations, and test contracts); added three interactive diagrams (`InteractiveDecisionFlow`, `InteractiveDelegationLoop`, `InteractiveCacheHorizons`) and a companion cross-reference to `/research/agent-playbook`. |
| **Visual Evidence & Handoff** | `docs/design/agent-playbook-2026-11/HANDOFF.md`, `docs/design/agent-playbook-2026-11/screens/*.jpg` | Updated desktop (1440px) and mobile (390px) screenshots covering all three surfaces and interactive states. |

---

## 2. Homepage Section-Order Changes

Per operator direction, the homepage (`app/page.tsx`) now follows this exact sequence:

| Order | Section | DOM ID / Selector | Narrative Role |
| :---: | --- | --- | --- |
| **1** | **Homepage Introduction (Hero)** | `section.hero` | Introduces Gaia Research and Milim (preserving her approved live presentation and status rail). |
| **2** | **Field Research** | `section#blog.blog-home` | Presents recent empirical dispatches from the lab immediately below the hero. |
| **3** | **Field Manual: Orchestration Guide + Agent Playbook** | `section#field-manual.fm` | Immediately follows Field Research so visitors learn how to apply Gaia's coordination method (`01 Method`) and preserve their personal operating rules (`02 Memory`). |
| **4** | **Skill Heaven** | `section#skill-heaven-hell.hh` | Connects method and memory to the broader `Skill Zero` / `Hell Heaven (HH) Index` ecosystem. |
| **5** | **Installable Skills** | `section#skills.skills` | Standalone local-first skills installable today via `npx skills`. |
| **6** | **Labs & Games** | `section#labs.labs-play` | Interactive browser playgrounds (`Infinite Skill Craft` and `Context Diet`) placed after core research and tools. |
| **7–9** | **Ledger, Registry Handoff & Directives** | `#ledger`, `#skill-tree`, `#directives` | Preserves the public evidence trail, Gaia Skill Tree handoff, and Milim's closing directives. |

---

## 3. Editorial Decisions & Before-and-After Copy Examples

The editorial pass pursued maximum meaning per sentence—replacing multi-sentence procedural explanations and repeated framing with rhythmic, high-density prose while preserving every technical qualification, citation, and consent boundary.

| Surface | Before (Initial PR #322 / Main) | After (Argon Refinement) | Why It Improves Comprehension |
| --- | --- | --- | --- |
| **Homepage Field Manual Lede** (`components/FieldManual.tsx`) | *"Coordinating agents economically is something you can study. Getting a fresh agent to work the way you want, without re-explaining it every session, is a different problem. These two resources take one each."* (33 words) | *"One volume measures when multiple agents earn their keep; the other ensures a new session never begins as a stranger."* (20 words, **−39%**) | Replaces three flat declarative sentences with one balanced contrast between *Method* and *Memory*. |
| **Homepage Field Manual — Guide Summary** (`components/FieldManual.tsx`) | *"When one agent is enough, when a few bounded subagents earn their overhead, and when a human should keep the wheel. Experience-based, with its evidence gaps stated."* (27 words) | *"Most swarms spend more tokens talking than building. Start with one warm agent; climb the A–E ladder only when independent lanes pay for their own coordination tax."* (27 words + interactive per-rung inspector) | Names the core economic tension (*talking vs. building*) and lets the interactive A–E ladder carry the per-rung specifics. |
| **Homepage Skill Heaven Intro & Footer** (`app/page.tsx`) | *"Marketplaces make you install skills forever — bloat you never asked for, pinned to every repo. Skill Zero is the launcher that starts a harness with zero ambient skill debt. Heaven and Hell are the summon directions on the HH axis: Heaven converges toward the right few skills; Hell explores the evidenced world. New to Gaia? Start with the three names — Gaia Skill Tree, Gaia Research, and Gaia Skill Heaven (housing Skill Zero and Skill Hell). The HH Index is in the works."* (81 words across two paragraphs + 43-word footer) | *"Static marketplaces pin uninvited bloat to every repo. **Skill Zero** launches your harness with zero ambient skill debt; along the **Hell Heaven (HH) Index**, you summon only what the session earns."* (31 words, **−62%** in header; `/about` link folded cleanly into the single mono footer) | Eliminates triple-repetition of `Skill Zero`, `Heaven`, `Hell`, and `HH Index` within the same section while keeping every ratified term and link intact. |
| **Agent Playbook Hero Opening** (`app/research/agent-playbook/page.tsx`) | *"The Agent Playbook is a small public repository of plain documents: how you want AI work directed, written down once. A chat assistant can read it as context. A coding agent can install two of its skills, if you say yes. Your personal choices live in a profile you can swap out."* (52 words) | *"Every fresh session begins with a quiet tax: untangling whether 'done' means merged or merely pushed, whether a missing model may silently downgrade, and when five subagents are worse than one. The Agent Playbook writes those answers down once—a portable operating philosophy you can feed to any assistant as context, or adopt as consented skills in a coding harness."* (60 words; replaces generic inventory with concrete developer pain) | Opens like literature rather than a README directory listing, naming the exact ambiguities the playbook resolves before introducing the two adoption doors. |
| **Agent Playbook Section 01 Intro** (`app/research/agent-playbook/page.tsx`) | *"A new conversation starts with none of your conventions. The agent either asks again or guesses. The playbook gives those recurring decisions a written, versioned answer."* (26 words) | *"A blank context window remembers none of your standards. Without a shared text, the agent either interrupts for routine policy or guesses with your authority."* (25 words) | Sharpens *"guesses"* into *"guesses with your authority"*—the actual operational risk the playbook prevents. |
| **Orchestration Guide Opening** (`content/reports/orchestration-guide/guide.md`) | *"Most multi-agent setups fail an elementary economic test: they spend more tokens coordinating work than completing it. Before spawning subagents, tuning prompt caches, or adopting a workflow runtime, ask one question:"* | *"Most multi-agent setups fail an elementary economic test: they spend more tokens coordinating work than completing it. A fleet of chatty subagents is rarely a speedup; more often it is a distributed tax collector. Before spawning workers, tuning prompt caches, or adopting a workflow runtime, ask one question:"* | Establishes the guide's governing metaphor (*a distributed tax collector*) and compresses the 6 numbered rules below it by ~25%. |

---

## 4. Interactive & Animated Visuals

In accordance with the visual addendum, static lists and raw ASCII boxes were upgraded to lightweight, accessible, code-based SVG + React interactive explanations:

1. **Homepage Field Manual (`components/FieldManual.tsx`)**:
   - **Interactive A–E Ladder (`01 Method`)**: Visitors click, tap, or arrow-key through levels `A` through `E` to inspect both *When it wins* (from the Orchestration Guide) and *⇄ Playbook link* (how the Agent Playbook's authority/profile rules govern that exact rung).
   - **Interactive Adoption & Layer Explorer (`02 Memory`)**: Visitors switch between `◇ Read as memory` (`NO INSTALL`), `◆ Install skills` (`NEEDS CONSENT`), and `◈ Personal profile` (`SWAPPABLE`), revealing a 3-step sequence and clickable GitHub file chips alongside permanent quick-jump buttons for Path A and Path B.
   - **Animated Spine Signal Seam**: An SVG signal pulse links `01 Method` and `02 Memory`, with an explicit `Live signal / Signal paused` toggle button and automatic pause under `prefers-reduced-motion: reduce`.

2. **Dedicated Agent Playbook Page (`components/PlaybookWalkthrough.tsx`)**:
   - **Interactive 3-Mode × 4-Stage Pipeline Walkthrough**: Lets visitors compare **Door A (`◇ Read as Memory`)**, **Door B (`◆ Install Skills`)**, and **Layer 3 (`◈ Personal Profile`)** step by step (`01` → `02` → `03` → `04`).
   - Clicking any SVG node or stage tab displays the actor, boundary guardrail, and live artifact preview (e.g., `STATUS: AWAITING_OWNER_YES` at Door B Step 03), plus an explicit `Never implied:` footer line per mode.
   - Includes an `Auto-stepping · Pause / Paused · Resume` toggle and respects `prefers-reduced-motion: reduce`.

3. **Orchestration Guide (`components/OrchestrationInteractiveDiagrams.tsx`)**:
   - **`InteractiveDecisionFlow`** (at `#the-coordination-decision-framework`): Combines interactive **Step-0 Pre-Flight condition toggles** (`Disjoint lanes`, `Context >20k tok`, `Binary verifier ready`, `Irreversible / prod deploy`) with the 5-level A–E ladder and an animated SVG escalation strip.
   - **`InteractiveDelegationLoop`** (at `#separate-reasoning-from-deterministic-coordination`, replacing the static ASCII box diagram): A 5-node interactive pipeline (`01 Decompose & Scope` → `02 Outbound Task Envelope` → `03 Worktree & Test Gate` → `04 Inbound Pointer Manifest` → `05 Verify or Escalate`) with a live toggle comparing **`✓ Pointer Manifest (<200 tok · 18k pinned)`** against **`⚠ Anti-Pattern: Raw Dump (+45k tok · 100k+ bloat)`**.
   - **`InteractiveCacheHorizons`** (at `#the-provider-cache-horizon-matrix`, replacing the static duration ASCII tree): Lets visitors switch across 4 worker wall-clock duration bands (`< 5m Fast Lane`, `5–25m Async Sweet Spot`, `20–60m Deep Suite`, `> 60m Multi-Hour Epic`) and watch the SVG timeline and 3 provider cache cards (`5m Sliding TTL`, `GPT 6 · 30m Floor`, `Claude / Gemini · 1h`) compute `✓ WARM HIT` vs. `✗ COLD EVICTION` and rate-card break-even notes.

---

## 5. Source Fidelity: Claims Checked Against Canonical Sources

All claims on `/research/agent-playbook` remain verified against `gaia-research/agent-playbook @ 9346fc1`, and all claims on `/research/orchestration-guide` preserve the exact epistemic boundaries and issue links verified in `lib/orchestration-guide.test.ts`:

| Surface & Claim | Canonical Source | Preserved |
| --- | --- | :---: |
| Two skills (`orchestrate`, `prompting`); handoff and review are conventions | `agent-playbook`: `README.md`, `HANDOFF.md` | ✅ |
| Reading requires no installation and never auto-syncs persistent memory | `agent-playbook`: `README.md`, `MEMORY.md` | ✅ |
| Propose entries, separate defaults from profile, withhold `profiles/marco` unless requested, exclude live prices/secrets, save nothing without approval | `agent-playbook`: `MEMORY.md` steps 2–6 | ✅ |
| Preview, push, merge, and deploy are separate permissions; four-line receipt | `agent-playbook`: `PLAYBOOK.md`, `skills/orchestrate` | ✅ |
| Inspect harness, show copy plan & collisions, wait for explicit yes, copy intact, verify discovery; no hooks/deps/extensions | `agent-playbook`: `README.md`, `profiles/marco/harnesses.md` | ✅ |
| Discovery paths table (`Claude Code`, `Codex`, `Pi`), read `2026-11-08`, no live install tested | `agent-playbook`: `profiles/marco/harnesses.md`, `HANDOFF.md` | ✅ |
| Marco profile: max 4 subagents, MAX/HIGH planners, fail-closed specialists, dedicated reviewers, `runtime_verified: false` | `agent-playbook`: `profiles/marco/{PROFILE.md,roster.yaml,models.yaml}` | ✅ |
| Orchestration Guide A–E ladder, $$C_{\text{verified}}$$ equation, Step-0 checklist, 4 execution regimes, classical laws, provider cache matrix (verified Sept 24, 2026), Sonnet 5 16% / 73% and Opus 5.5 25× rate-card math, 16-endpoint worked example, 10-step assessment contract, and epistemic categories | `content/reports/orchestration-guide/guide.md`, `lib/orchestration-guide.test.ts` | ✅ |

---

## 6. Validation Results & Visual Evidence

| Check | Command / Method | Result |
| --- | --- | --- |
| **Lint & Edge FS Guard** | `npm run lint` (`tsc --noEmit && node scripts/check-fs-usage.mjs`) | **PASS** (0 errors) |
| **Unit & Contract Tests** | `npm test` (`vitest run`) | **PASS** (30 test files, 299/299 tests passed, including `lib/orchestration-guide.test.ts`) |
| **Next.js Static Build** | `npm run build:next` | **PASS** (49/49 static pages prerendered, including `/`, `/research/agent-playbook`, `/research/orchestration-guide`) |
| **Vocabulary Gate** | `npx tsx scripts/lexicon/check-lexicon.ts` | **PASS** (81 terms, 57 files scanned, 0 new findings) |
| **Visual & Overflow Audit** | `scripts/visual-audit.mjs` across `/,/research,/research/agent-playbook,/research/orchestration-guide,/blog` at widths `320,360,390,414,768,1280` | **PASS** (0px horizontal cut-off across all 30 route × width combinations; HTTP 200 on all routes) |
| **Browser Interaction & Accessibility Audit** | Headless Chromium Playwright script verifying section order, interactive tabs/rungs/gates, pause controls, `prefers-reduced-motion: reduce`, `<details>` disclosures, and `CopyPrompt` clipboard writes | **PASS** |

### Committed Screenshots (`docs/design/agent-playbook-2026-11/screens/`)

- `home-desktop-field-manual.jpg` — Refined interactive Field Manual spread at 1440px desktop
- `home-mobile-field-manual.jpg` — Refined Field Manual spread at 390px mobile (2×)
- `home-focus-read-as-memory.jpg` — Keyboard `:focus-visible` outline on the Playbook adoption controls
- `before-home-desktop-skill-heaven-to-skills.jpg` — Prior baseline comparison on `main`
- `playbook-desktop-fold.jpg`, `playbook-desktop-full.jpg` — `/research/agent-playbook` at 1440px (full-page height reduced from 7,323px to 6,350px)
- `playbook-walkthrough-desktop.jpg` — Interactive `PlaybookWalkthrough` component inspecting Door B (`Step 03 · Explicit Consent`) at 1440px
- `playbook-mobile-fold.jpg`, `playbook-mobile-full.jpg` — `/research/agent-playbook` at 390px mobile (2×)
- `orchestration-guide-interactive-desktop.jpg` — Interactive `InteractiveDecisionFlow` on `/research/orchestration-guide` at 1440px with Step-0 gates toggled to `Level B`
- `orchestration-guide-mobile.jpg` — `/research/orchestration-guide` interactive decision flowchart at 390px mobile (2×)
- `research-index-desktop.jpg` — `/research` index at 1440px with tightened ledger descriptions

---

## 7. Remaining Limitations

- **Historical commit authorship:** As accepted by the operator, the initial commit on this branch (`7667523c`) was created under the earlier cloud session's default git identity and was not force-rewritten. Subsequent commits use the repository's `mbtiongson1 <marco.tngsn@gmail.com>` identity with no trailers.
- **Broader issue scope (#318, #319, #321):** Issue #319 awaits final human design review of the refreshed preview before closure. Issue #318 still tracks a separate technical blog post and marketing campaign. Issue #321 remains open for any future empirical benchmark trials beyond this editorial and interactive pass.
- **Milim fixed overlay:** The site-wide Milim pet floats as a fixed overlay in the viewport corner across pages; this is existing site-wide behavior and was preserved unchanged.
