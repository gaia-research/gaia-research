# LEXICON — vocabulary of record

<!-- GENERATED FROM founder/lexicon.json and its namespace files — DO NOT EDIT BY HAND. -->
<!-- Regenerate: npx tsx scripts/lexicon/check-lexicon.ts --emit -->
<!-- lexicon-allow -->

> Schema `2` · HQ `gaia-research` · 55 terms across 5 namespace(s) · updated **2026-07-28**.
>
> **One term, one owner.** A term is defined in **exactly one** file, ever. A
> namespace file **adds** terms in its own namespace and may never redefine a
> term another namespace owns — inside this HQ the merge rejects it, across HQs
> the name-only foreign mirror does.

| Namespace | Owned by | File | Terms |
|---|---|---|---|
| `core` | `gaia-research` | `founder/lexicon.json` | 2 |
| `gaia.research` | `gaia-research` | `founder/lexicon.gaia.research.json` | 13 |
| `gaia.brand` | `gaia-research` | `founder/lexicon.gaia.brand.json` | 1 |
| `gaia.heaven` | `gaia-research` | `founder/lexicon.gaia.heaven.json` | 36 |
| `gaia.mcp` | `gaia-research` | `founder/lexicon.gaia.mcp.json` | 3 |

Terms owned by **gaia-research/gaia-skill-tree** are listed name-only in `founder/lexicon.foreign.json` and are
defined there, never here:

- `Atomic skill` → `gaia.skills`
- `Evidence Class` → `gaia.trust`
- `Evidence Floor` → `gaia.trust`
- `Evidence Grade` → `gaia.trust`
- `Extra skill` → `gaia.skills`
- `Fusion` → `gaia.skills`
- `Gaia Registry` → `gaia.skills`
- `Gaia Skill Tree` → `gaia.skills`
- `generic skill` → `gaia.skills`
- `mythic` → `gaia.skills`
- `named skill` → `gaia.skills`
- `rank up` → `gaia.trust`
- `slot` → `gaia.skills`
- `star bar` → `gaia.trust`
- `TM Index` → `gaia.trust`
- `top-tier skill` → `gaia.skills`
- `Trust Magnitude` → `gaia.trust`

| State | Meaning | Where allowed |
|---|---|---|
| ✅ `canonical` | The word. Use this. | everywhere |
| ⛔ `banned` | The oracle retired it. CI fails. | nowhere (except `**/archived/**`) |
| 🅿️ `parked` | Coined but unchosen. | `docs/` only — never user-facing copy or code |
| 🧊 `frozen` | Meant something specific once. | `**/archived/**` only |

**A term is `banned` only when founder/RATIFICATION.md already retired it.** A term
this project is still arguing about is `parked`. Writing a linter is not a way
to make a decision.

## `core`

### status

| Term | State | Oracle | Definition |
|---|---|---|---|
| `INVARIANT` | 🅿️ parked | — | Proposed oracle status: breaking it costs credibility, money, or another repo. Violating one is a bug, not a decision. Unratified — pends the oracle rewrite. |
| `CURRENT` | 🅿️ parked | — | Proposed oracle status: the working answer, held until the build says otherwise. A failing test is sufficient to change it. Unratified — pends the oracle rewrite. Matched case-sensitively: the lowercase word is ordinary English and matched 184 innocent lines before this was scoped. |

## `gaia.research`

### measurement

| Term | State | Oracle | Definition |
|---|---|---|---|
| `standing dose` | ✅ canonical | B1 | The per-skill listing-line cost — what a skill costs just by existing in context. |
| `invocation dose` | ✅ canonical | B1 | The per-skill full-body cost — what a skill costs when actually invoked. |
| `harness dose` | ✅ canonical | B1 | `tokens.system` — the harness's own prompt weight. Priced in the ledger and reports only, never in the Ygg II schema. |
| `dose` | ✅ canonical | B1 | Always qualified — standing, invocation, or harness. B1 forbids collapsing them into one number in any public claim. |
| `gauge` | 🅿️ parked | — | COLLISION — currently used both for per-skill HH Index stamps and for session spend meters. Two different things wearing one word; flagged in the PR #4 review. Unresolved. |
| `meter` | ✅ canonical | P5 | The readout of what a session has spent. A gauge on the context the ladder governs — it displays, it does not cap. |
| `budget` | ⛔ banned | P5 | Retired 2026-07-24. There is no separate budget to model — the context window already is one. What ships is a meter. **Use `meter`.** Reverses a proposal made during this consolidation, which had budget as the unifying primitive across Heaven and Hell. The ladder is the control; the meter is the readout. For unrelated engineering caps (latency, description size, CI spend) write **ceiling** — one word, one meaning, and the gate stays quiet. |
| `heat` | 🅿️ parked | — | Proposed name for Hell's budget dimension. Shaping-stage only. |
| `HH Index` | ✅ canonical | N6 | The Hell Heaven Index. Schema key `hellHeaven`. |
| `stamp` | ✅ canonical | G2 | Discrete set-membership: `heaven-native` / `auto@tier` / `hell-safe@tier`. Routing is lookup, no arithmetic. |
| `tier` | ✅ canonical | G2 | The effort tier inside a stamp — `auto@tier`, `hell-safe@tier`. Routing is lookup over discrete set-membership, no arithmetic. The archived RFC-68 '5-Tier ACI' sense is a DIFFERENT meaning and is not ratified vocabulary. It survives only in `**/archived/**`, which the gate excludes, so no enforcement is needed — but do not import that sense back into live docs. |
| `seed` | ⛔ banned | B3 | Determinism does not exist in any target harness. The ledger validator rejects a `seed` field; seed-framing in benchmark copy is a retired claim. **Use `N repeats + confidence intervals`.** Retired in the DETERMINISM sense only (B3). A `seed set` of skills to hand-label, and the seed rubric that grades it, are a different thing and are exempted by pattern — the third case in this lexicon where a one-word ban hit the wrong sense (see also `lean`, `tier`). |
| `own-placebo` | ✅ canonical | B2 | The baseline is our own same-harness no-skill run. Published benchmark scores are calibration only, never the baseline. |

## `gaia.brand`

### names

| Term | State | Oracle | Definition |
|---|---|---|---|
| `Milim` | ✅ canonical | N7 | The Hell-mode persona. The Heaven persona's name is RESERVED and undecided — nothing may hard-code one; it lives in the marketing-tasks brand extension when it closes. |

## `gaia.heaven`

### posture

| Term | State | Oracle | Definition |
|---|---|---|---|
| `ladder` | ✅ canonical | N1, N5, P5 | The rung axis (`off…max`) that sets how much may be summoned per task and how much of the choosing is automated. One of two dials, with mode as the other. |
| `posture` | ✅ canonical | P1 | A named position in the mode dial (P1's four). Distinct from a ladder rung, which is how much enters. |
| `native` | ✅ canonical | P1 | The user's own setup, untouched — no eviction, no summoning. The default posture. |
| `curated` | ✅ canonical | P1 | A hand-gated few skills, source-agnostic (the user's own custom skills first). The allowlist as human-selected fixed state, chosen at launch. |
| `floor` | ✅ canonical | P1, B1, B2 | The DOORLESS BENCHMARK floor: evict all skills, bare prompt profile, zero server, slash commands off — the benchmark's placebo-of-record, at level `off`. Composed by core for measurement runs; it keeps no door, so it is never offered on the in-session surface. The product/benchmark question this entry used to park is CLOSED — V5-5 split the floors and skill-heaven PR #14 landed it: the doorful launchable posture is `product-floor` (synonym: `clean-room`), priced as its own arm, never pooled with this one (B1). |
| `product-floor` | ✅ canonical | D12, B1 | The DOORFUL clean floor — the cleanest launchable posture: bundled skills, user/global skills, MCP and non-project settings evicted; the door (slash commands) kept. Composed only at boot, via a launcher (D12); priced as its own arm, never pooled with the benchmark `floor` (B1). Synonym: `clean-room` — two names for one posture; neither retires the other. Ratified by V5-5 and landed in core's posture set (skill-heaven PR #14). Fully clean is not possible because the bare minimum stays — the door is the bare minimum. |
| `hell lane` | ✅ canonical | P1 | The evidenced pool, honesty-gated, above native — how much of it enters is the ladder's rung. |
| `clean-room` | ✅ canonical | D12 | The cleanest launchable posture: bundled skills, user/global skills, MCP and non-project settings all evicted; the door stays. Reachable only at boot, via the launcher. Synonym of `product-floor` — two names for one posture; neither retires the other. PROPOSED promotion 2026-07-29 (awaits founder ratification; demoted from canonical 2026-07-24 as unshipped): the posture has now shipped as `product-floor` in core (V5-5, skill-heaven PR #14). The earlier "fully-subtractive" adjective overreached — the enumerated list never included slash commands; fully clean is not possible because the bare minimum stays. |
| `scalpel` | 🅿️ parked | D12, N8 | The in-session control. Upward-only from the launched floor; carries conversation history; cannot descend below its launch posture. Names the in-session control from D12's former product design; that framing was cut back to physics 2026-07-24. Parked until the control exists. |
| `lean` | ⛔ banned | N10 | Coined in matrix gate (a) as a rung for `--setting-sources project`. Not one of P1's four postures — this is the naming collision the PR #4 review flagged. Retired as a WORD 2026-07-29 (N10); the `--setting-sources project` composition it named is untouched and stays available. No successor: `project-only` was the standing proposal and was NOT adopted, so nothing replaces this — rephrase instead of substituting. Scope is load-bearing, not a softening: `lean` appears in 111 files, nearly all innocent (`clean`, `lean bundle`), and `banned` is not auto-narrowed the way `parked` was. |
| `project-only` | 🅿️ parked | — | Proposed name for the `--setting-sources project` stop: sheds project/settings weight, does NOT remove the user's personal skills. Unratified. |
| `add-ons` | ⛔ banned | N10 | Coined in matrix gate (a) as a rung. It never was one: this is an ACTION available at any posture (route G shows `--plugin-dir` stacks even at the floor), not a position on the ladder. Retired as a WORD 2026-07-29 (N10). The stacking it named is real and stays available at every posture — only the name is withdrawn, and no successor is chosen. Unscoped on purpose: unlike `lean` it has no innocent sense in this line's docs, so the ban is enforced everywhere and the two historical mentions that must survive carry `lexicon-allow`. |
| `notch` | ⛔ banned | N1, N5 | Retired 2026-07-24 in favour of `rung`. **Use `rung`.** |
| `rung` | ✅ canonical | N1, N5 | One selectable position on the ladder (`off…max`). The chosen word of the notch/rung/stop cluster — a ladder has rungs. Promoted 2026-07-24 for consistency with the oracle, which uses `rung` throughout after the ladder ruling. Correct freely if `notch` or `stop` reads better. |
| `slider` | ⛔ banned | N1 | Retired 2026-07-24. The control is a ladder with discrete rungs, not a continuous fader. **Use `ladder`.** This was the longest-running vocabulary conflict on the line — N1 superseded the slider framing while later entries mandated a slider, and neither acknowledged the other. Closed by choosing the ladder. The in-session posture surface ships with NO noun for the control (2026-07-29): `ladder`/`rung` name the off…max ladder — a different control — and the mode-control name is open. Do not substitute `ladder` into copy about the posture surface, and do not coin a replacement. |
| `picker` | 🅿️ parked | — | Candidate replacement for the contested `slider` — a discrete chooser with locked entries, which is what the product actually renders. Unratified. WITHDRAWN as a candidate 2026-07-29 (founder): the control name remains open and the method is locked — the method is already implied by Skill Heaven / Skill Hell. Do not ratify; do not propose a noun for the control surface. |
| `mode` | ✅ canonical | N1, N2 | Discrete mode switching — the interaction model. Same mode, same semantics, any door. N2 leans 'Skill Heaven mode' / 'Skill Hell mode'. |
| `level` | ✅ canonical | N3 | Agentic-coding level terms: off · low · med · high · xhigh · max. No celestial level names. |
| `Heaven-0` | ⛔ banned | N3 | Retired as a level name. Historical shorthand in archived docs only. **Use `level`.** |
| `Heaven-1` | ⛔ banned | N3 | Retired as a level name. Historical shorthand in archived docs only. **Use `level`.** |
| `ultra` | ✅ canonical | N4 | The arm above Hell — a mode, not a rung. The ladder's top rung is `max`. |

### mechanism

| Term | State | Oracle | Definition |
|---|---|---|---|
| `purge` | 🅿️ parked | — | Physical subtractive removal of context. Launcher-locked — gate (a) proved it cannot happen in-session. Names a real mechanism split — gate (a) proved purge cannot happen in-session — but the product framing that named it (D13) was deleted 2026-07-24. Parked until a surface using it ships. |
| `restraint` | 🅿️ parked | — | Behavioral suppression of skill USE while the skills remain physically in context. UNVERIFIED — research track, behind matrix gate (e), no load-bearing copy until it passes. Behind matrix gate (e), which has never run. Its backing entry (D13) was deleted 2026-07-24. It was canonical on that entry's authority while the entry itself said UNVERIFIED — it should never have been canonical. |
| `resident` | 🅿️ parked | — | Proposed name for a skill currently in context. Not the founder's word for it; kept parked rather than promoted alongside `summonable`. Proposed name for a skill currently in context; not the founder's word for it, so it stays parked beside the canonical `summonable`. The ordinary-English sense ("a permanent resident of your config") is exempted by pattern — the fifth time a one-word rule met a second meaning. |
| `summonable` | ✅ canonical | P5 | A skill that is indexed and reachable but costs nothing until summoned. Hell grows this set; a summon brings a proxy into context for this session only. |
| `eviction` | ✅ canonical | D2 | Removal of a skill from context. Always harness-side, never an MCP operation — MCP is additive-only in every target harness. |
| `summon` | ✅ canonical | D4 | One of gaia-mcp's two tools (with `search_skills`). Additive-only. A summon brings a skill into context once, for this session only — it does not survive a compact or a new session, and installs nothing. |
| `router` | ✅ canonical | D5 | Deterministic nearest-neighbour over a build-time frozen embedding index. No model call ever decides a loadout. |
| `firebreak` | ⛔ banned | N1, P5 | Retired 2026-07-24. It named a token ceiling on the summon flood — the thing the ladder now sets and the meter now shows. **Use `ladder`.** Two senses ran side by side: the live 'token-ceiling firebreak' and the archived RFC-68 sense (an architectural boundary against tool-exposure degradation). Neither survives: a cap with a control and a readout does not need a third name. |

### names

| Term | State | Oracle | Definition |
|---|---|---|---|
| `launcher` | ✅ canonical | D6, D12 | The boot-time composer. Owns the launcher-locked subtractive floor — the only path to the deepest Heaven. |
| `door` | ✅ canonical | N9 | A per-harness installable — `claude-heaven`, `pi-heaven`, `codex-heaven`. The doors are the user-facing product. |
| `skill-heaven` | ✅ canonical | N9 | The product monorepo (`gaia-research/skill-heaven`), which doubles as the Claude Code plugin marketplace. Its core bin is the research driver, not the user-facing install. |
| `claude-heaven` | ✅ canonical | N9 | The flagship door. Claude Code is the reference harness and marketing weight sits here. |
| `pi-heaven` | ✅ canonical | N9 | The R&D vanguard door — interaction design is proven on pi first, then ported down to Claude Code's more restrictive plugin surface. |
| `hh-launcher` | ⛔ banned | N9 | Retired working name for the launcher repo. **Use `skill-heaven`.** |
| `skill-heaven-hell` | ⛔ banned | N9 | Retired fallback repo name. **Use `skill-heaven`.** Retired as a NAME for the repo/installable. The hyphenated string is also the natural URL slug of the line's own name, 'Skill Heaven / Skill Hell', which is fully canonical (this oracle's title uses it) — see the homepage anchor `#skill-heaven-hell`. A slug of the line name is not an instance of the retired name; mark such lines `lexicon-allow` rather than renaming public URL fragments. |

## `gaia.mcp`

### names

| Term | State | Oracle | Definition |
|---|---|---|---|
| `gaia_search` | ⛔ banned | D4 | Prototype MCP tool name. Retired 2026-07-28: D4 fixes gaia-mcp's surface at two tools named `search_skills` and `summon`, and `summon`'s own entry already names `search_skills` as its partner. Nothing is published yet, so the prototype spelling never becomes a compatibility obligation. **Use `search_skills`.** Banned before Program 4 writes its first tool definition — the ordering is available exactly once. The prototype server's own copy (`data/mcp.ts`, the Milim pet tooltips) is outside every lexicon scope and is not what this ban is aimed at; it is aimed at the tool definition Program 4 has not written yet. |
| `gaia_inspect` | ⛔ banned | D4 | Prototype MCP tool name. Retired 2026-07-28: D4 caps gaia-mcp at two tools (`search_skills`, `summon`), so a third read verb has no ratified home — evidence retrieval belongs to `search_skills`. **Use `search_skills`.** |
| `gaia_status` | ⛔ banned | D4 | Prototype MCP tool name. Retired 2026-07-28: D4 caps gaia-mcp at two tools (`search_skills`, `summon`), so a freshness verb has no ratified home — data freshness is reported by `search_skills`, not by a tool of its own. **Use `search_skills`.** |

