# Handoff: Gaia Research Homepage Hierarchy, Literary Compression & Interactive Field Manual (PR #322)

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
