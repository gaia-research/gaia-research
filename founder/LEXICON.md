# LEXICON — vocabulary of record

<!-- GENERATED FROM founder/lexicon.json — DO NOT EDIT BY HAND. -->
<!-- Regenerate: npx tsx scripts/lexicon/check-lexicon.ts --emit -->
<!-- lexicon-allow -->

> Schema `1` · namespace `core` · updated **2026-07-24**.
>
> A term is defined in **exactly one** lexicon file, ever. Extensions (e.g.
> `marketing-tasks/founder/lexicon.brand.json`) **add** terms in their own
> namespace and may never redefine a core term.

| State | Meaning | Where allowed |
|---|---|---|
| ✅ `canonical` | The word. Use this. | everywhere |
| ⛔ `banned` | The oracle retired it. CI fails. | nowhere (except `**/archived/**`) |
| 🅿️ `parked` | Coined but unchosen. | `docs/` only — never user-facing copy or code |
| 🧊 `frozen` | Meant something specific once. | `**/archived/**` only |

**A term is `banned` only when `RATIFICATION.md` already retired it.** A term
this project is still arguing about is `parked`. Writing a linter is not a way
to make a decision.

## posture

| Term | State | Oracle | Definition |
|---|---|---|---|
| `posture` | ✅ canonical | P1 | A named position on the resident-context ladder. P1 ratifies four: floor, curated, native, hell lane. |
| `native` | ✅ canonical | P1 | The user's own setup, untouched — no eviction, no summoning. The default posture. |
| `curated` | ✅ canonical | P1 | A hand-gated few skills, source-agnostic (the user's own custom skills first). The allowlist as human-selected fixed state, chosen at launch. |
| `floor` | ✅ canonical | P1 | Evict all skills, bare prompt profile, zero server — the benchmark's placebo-of-record, at level `off`. Whether the PRODUCT floor and the BENCHMARK floor are the same posture is an open shaping question (the `--disable-slash-commands` finding). Do not assume one term covers both until that closes. |
| `hell lane` | ✅ canonical | P1 | Evidenced flood — the whole evidenced pool, firebreak on, honesty-gated. Sits above native. Its mapping onto levels is OPEN. |
| `clean-room` | ✅ canonical | D12 | The fully-subtractive composition: bundled skills, user/global skills, MCP and non-project settings all evicted. Reachable only at boot, via the launcher. |
| `scalpel` | ✅ canonical | D12, N8 | The in-session control. Upward-only from the launched floor; carries conversation history; cannot descend below its launch posture. |
| `lean` | 🅿️ parked | — | Coined in matrix gate (a) as a slider stop for `--setting-sources project`. Not one of P1's four postures — this is the naming collision the PR #4 review flagged. Proposed: `project-only` (unratified). UNRATIFIED both ways. Scoped narrowly on purpose: `lean` appears in 111 files, nearly all innocent (`clean`, `lean bundle`). Only flagged in user-facing copy and code. |
| `project-only` | 🅿️ parked | — | Proposed name for the `--setting-sources project` stop: sheds project/settings weight, does NOT remove the user's personal skills. Unratified. |
| `add-ons` | 🅿️ parked | — | Coined in matrix gate (a) as a slider stop. Proposal on the table: this is an ACTION available at any posture (route G shows `--plugin-dir` stacks even at the floor), not a position on the ladder. Unratified. |
| `notch` | 🅿️ parked | — | One of three unchosen synonyms for a selectable position — notch / rung / stop. Pick one before any of them reaches user-facing copy. |
| `rung` | 🅿️ parked | — | Synonym cluster with notch / stop. Unchosen. |
| `slider` | 🅿️ parked | — | Contested. N1 (LOCKED) says 'Modes, not a slider' and supersedes the slider framing; D12/D13 (LOCKED, later) mandate 'the posture slider'. Neither acknowledges the other. CONFLICT — recorded, not resolved. This is the vocabulary drift PR #4's review identified. Resolution belongs in the oracle rewrite, not here. |
| `picker` | 🅿️ parked | — | Candidate replacement for the contested `slider` — a discrete chooser with locked entries, which is what the product actually renders. Unratified. |
| `mode` | ✅ canonical | N1, N2 | Discrete mode switching — the interaction model. Same mode, same semantics, any door. N2 leans 'Skill Heaven mode' / 'Skill Hell mode'. |
| `level` | ✅ canonical | N3 | Agentic-coding level terms: off · low · med · high · xhigh · max. No celestial level names. |
| `Heaven-0` | ⛔ banned | N3 | Retired as a level name. Historical shorthand in archived docs only. **Use `level`.** |
| `Heaven-1` | ⛔ banned | N3 | Retired as a level name. Historical shorthand in archived docs only. **Use `level`.** |
| `ultra` | 🅿️ parked | N4 (OPEN) | Whether the term survives, and where it sits, is an OPEN oracle item. Do not invent a placement. |

## mechanism

| Term | State | Oracle | Definition |
|---|---|---|---|
| `purge` | ✅ canonical | D13 | Physical subtractive removal of context. Launcher-locked — gate (a) proved it cannot happen in-session. |
| `restraint` | ✅ canonical | D13 | Behavioral suppression of skill USE while the skills remain physically in context. UNVERIFIED — research track, behind matrix gate (e), no load-bearing copy until it passes. |
| `resident` | 🅿️ parked | — | Proposed set model (PR #4 comment): a skill is resident (in context), summonable (indexed, free until invoked), or absent. Heaven shrinks resident; Hell grows summonable. Unratified. |
| `summonable` | 🅿️ parked | — | Part of the proposed resident/summonable/absent set model. Unratified. |
| `eviction` | ✅ canonical | D2 | Removal of a skill from context. Always harness-side, never an MCP operation — MCP is additive-only in every target harness. |
| `summon` | ✅ canonical | D4 | One of gaia-mcp's two tools (with `search_skills`). Additive-only. The server keeps a ≤2-tool surface and its own footprint is priced in every claim. |
| `router` | ✅ canonical | D5 | Deterministic nearest-neighbour over a build-time frozen embedding index. No model call ever decides a loadout. |
| `firebreak` | 🅿️ parked | — | Appears in P1's hell-lane definition AND in the archived RFC-68 ACI research with a different sense. Meaning not pinned; do not build on it. |

## measurement

| Term | State | Oracle | Definition |
|---|---|---|---|
| `standing dose` | ✅ canonical | B1 | The per-skill listing-line cost — what a skill costs just by existing in context. |
| `invocation dose` | ✅ canonical | B1 | The per-skill full-body cost — what a skill costs when actually invoked. |
| `harness dose` | ✅ canonical | B1 | `tokens.system` — the harness's own prompt weight. Priced in the ledger and reports only, never in the Ygg II schema. |
| `dose` | ✅ canonical | B1 | Always qualified — standing, invocation, or harness. B1 forbids collapsing them into one number in any public claim. |
| `gauge` | 🅿️ parked | — | COLLISION — currently used both for per-skill HH Index stamps and for session spend meters. Two different things wearing one word; flagged in the PR #4 review. Unresolved. |
| `meter` | 🅿️ parked | — | Candidate name for the ambient statusline readout of standing dose. Unratified. |
| `budget` | 🅿️ parked | — | Proposed unifying primitive: a resident-token cap that Heaven lowers and Hell fills. Shaping-stage only — no oracle entry, no code. |
| `heat` | 🅿️ parked | — | Proposed name for Hell's budget dimension. Shaping-stage only. |
| `HH Index` | ✅ canonical | N6 | The Hell Heaven Index. Schema key `hellHeaven`. |
| `stamp` | ✅ canonical | G2 | Discrete set-membership: `heaven-native` / `auto@tier` / `hell-safe@tier`. Routing is lookup, no arithmetic. |
| `tier` | ✅ canonical | G2 | The effort tier inside a stamp — `auto@tier`, `hell-safe@tier`. Routing is lookup over discrete set-membership, no arithmetic. The archived RFC-68 '5-Tier ACI' sense is a DIFFERENT meaning and is not ratified vocabulary. It survives only in `**/archived/**`, which the gate excludes, so no enforcement is needed — but do not import that sense back into live docs. |
| `seed` | ⛔ banned | B3 | Determinism does not exist in any target harness. The ledger validator rejects a `seed` field; seed-framing in benchmark copy is a retired claim. **Use `N repeats + confidence intervals`.** |
| `own-placebo` | ✅ canonical | B2 | The baseline is our own same-harness no-skill run. Published benchmark scores are calibration only, never the baseline. |

## names

| Term | State | Oracle | Definition |
|---|---|---|---|
| `launcher` | ✅ canonical | D6, D12 | The boot-time composer. Owns the launcher-locked subtractive floor — the only path to the deepest Heaven. |
| `door` | ✅ canonical | N9 | A per-harness installable — `claude-heaven`, `pi-heaven`, `codex-heaven`. The doors are the user-facing product. |
| `skill-heaven` | ✅ canonical | N9 | The product monorepo (`gaia-research/skill-heaven`), which doubles as the Claude Code plugin marketplace. Its core bin is the research driver, not the user-facing install. |
| `claude-heaven` | ✅ canonical | N9, D11 | The flagship door. Claude Code is the reference harness and marketing weight sits here. |
| `pi-heaven` | ✅ canonical | N9, D11 | The R&D vanguard door — interaction design is proven on pi first, then ported down to Claude Code's more restrictive plugin surface. |
| `hh-launcher` | ⛔ banned | N9 | Retired working name for the launcher repo. **Use `skill-heaven`.** |
| `skill-heaven-hell` | ⛔ banned | N9 | Retired fallback repo name. **Use `skill-heaven`.** |
| `Milim` | ✅ canonical | N7 | The Hell-mode persona. The Heaven persona's name is RESERVED and undecided — nothing may hard-code one; it lives in the marketing-tasks brand extension when it closes. |

## status

| Term | State | Oracle | Definition |
|---|---|---|---|
| `INVARIANT` | 🅿️ parked | — | Proposed oracle status: breaking it costs credibility, money, or another repo. Violating one is a bug, not a decision. Unratified — pends the oracle rewrite. |
| `CURRENT` | 🅿️ parked | — | Proposed oracle status: the working answer, held until the build says otherwise. A failing test is sufficient to change it. Unratified — pends the oracle rewrite. Matched case-sensitively: the lowercase word is ordinary English and matched 184 innocent lines before this was scoped. |

