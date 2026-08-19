# LEXICON — vocabulary of record

<!-- GENERATED FROM founder/lexicon.json and its namespace files — DO NOT EDIT BY HAND. -->
<!-- Regenerate: npx tsx scripts/lexicon/check-lexicon.ts --emit -->
<!-- lexicon-allow -->

> Schema `2` · HQ `gaia-research` · 77 terms across 6 namespace(s) · updated **2026-08-11**.
>
> **One term, one owner.** A term is defined in **exactly one** file, ever. A
> namespace file **adds** terms in its own namespace and may never redefine a
> term another namespace owns — inside this HQ the merge rejects it, across HQs
> the name-only foreign mirror does.

| Namespace | Owned by | File | Terms |
|---|---|---|---|
| `core` | `gaia-research` | `founder/lexicon.json` | 2 |
| `gaia.research` | `gaia-research` | `founder/lexicon.gaia.research.json` | 13 |
| `gaia.brand` | `gaia-research` | `founder/lexicon.gaia.brand.json` | 2 |
| `gaia.heaven` | `gaia-research` | `founder/lexicon.gaia.heaven.json` | 34 |
| `gaia.zero` | `gaia-research` | `founder/lexicon.gaia.zero.json` | 22 |
| `gaia.mcp` | `gaia-research` | `founder/lexicon.gaia.mcp.json` | 4 |

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
| `Milim` | ✅ canonical | N7 | Gaia Research's lab mascot. Not the Skill Heaven / Skill Hell persona. |
| `Lucy` | 🅿️ parked | N7 | Internal working name for the Skill Heaven / Skill Hell persona. Its design is final, but the public name is reserved and undecided; do not hard-code Lucy in user-facing copy or shipped code. |

## `gaia.heaven`

### posture

| Term | State | Oracle | Definition |
|---|---|---|---|
| `skill entropy` | ✅ canonical | N13, N3, N11, D5 | What the ladder measures: how much skill variety and volume enters a session. Every rung is a skill-entropy level — `zero` is zero skills and therefore zero skill entropy, and `low → med → high → xhigh → max` is rising skill entropy. Heaven converges (the lower-entropy direction); Hell explores (the higher-entropy direction); `ultra` picks the entropy per gap. This is what makes Heaven and Hell one line rather than two products. Ratified N13 (2026-08-19) as the ladder's subject. PRODUCT CONCEPT, NOT AN INFORMATION-THEORETIC ONE: no formula, no unit, no threshold and no number is ratified, and none may be invented downstream to make it look measurable. IT IS NOT MEASURED TODAY. What the benchmark is being built to find is the ENTROPY CURVE — how quality and cost move together as skill entropy rises — not a token-savings headline. The curve is expected to rise and then turn, because Hell routes its summons through gaia mcp as a mixture-of-agents for skills (D5): more experts in context, better until it isn't. THE BENCHMARK IS NOT BUILT, so the curve is a target and never a result; no surface may render it as one (B4). |
| `ladder` | ✅ canonical | N13, N12, N11, N1, N3, N5, P5 | The one line the whole product reads from: `zero · low · med · high · xhigh · max · ultra`, a single global scale rather than one per direction. A rung is a skill-entropy level — it names a DIRECTION (converge toward Heaven, explore toward Hell) and a POSITION along that band. It carries no count and caps no summon. N13 (2026-08-15, consolidated 2026-08-19) withdrew two readings. (1) The per-direction ladder N12(3) introduced: a session sits at exactly one rung and the surface is READ from it — there is no Heaven-position and Hell-position held at once. (2) The count model: N12(3)'s 'how many skills the agent may auto-summon per capability gap' and N12(5)'s per-rung counts are withdrawn outright. No rung carries a count and no summon is capped; how far to reach on a given gap is the agent's call, worked out in use while the benchmark is built. What stays PROVISIONAL is only the representative rung per band — Heaven's `low`, Hell's `high` — and every surface rendering one must say so. A count encoded in a constant is a decision made by omission; do not. |
| `hell lane` | ✅ canonical | N13, N11, P1 | The explore/expand summon direction: the higher-entropy half of the one line, occupying `high · xhigh · max` (N13-2). The evidenced pool, honesty-gated. The rung names how far along the explore band the session sits; it does not bound intake by count. |
| `scalpel` | 🅿️ parked | D12, N8 | The in-session control. Upward-only from the launched floor; carries conversation history; cannot descend below its launch posture. Names the in-session control from D12's former product design; that framing was cut back to physics 2026-07-24. Parked until the control exists. |
| `lean` | ⛔ banned | N10 | Coined in matrix gate (a) as a rung for `--setting-sources project`. Not one of P1's four postures — this is the naming collision the PR #4 review flagged. Retired as a WORD 2026-07-29 (N10); the `--setting-sources project` composition it named is untouched and stays available. No successor: `project-only` was the standing proposal and was NOT adopted, so nothing replaces this — rephrase instead of substituting. Scope is load-bearing, not a softening: `lean` appears in 111 files, nearly all innocent (`clean`, `lean bundle`), and `banned` is not auto-narrowed the way `parked` was. |
| `project-only` | 🅿️ parked | — | Proposed name for the `--setting-sources project` stop: sheds project/settings weight, does NOT remove the user's personal skills. Unratified. |
| `add-ons` | ⛔ banned | N10 | Coined in matrix gate (a) as a rung. It never was one: this is an ACTION available at any posture (route G shows `--plugin-dir` stacks even at the floor), not a position on the ladder. Retired as a WORD 2026-07-29 (N10). The stacking it named is real and stays available at every posture — only the name is withdrawn, and no successor is chosen. Unscoped on purpose: unlike `lean` it has no innocent sense in this line's docs, so the ban is enforced everywhere and the two historical mentions that must survive carry `lexicon-allow`. |
| `notch` | ⛔ banned | N1, N5 | Retired 2026-07-24 in favour of `rung`. **Use `rung`.** |
| `rung` | ✅ canonical | N13, N3, N1, N5 | One selectable position on the ladder (`zero · low · med · high · xhigh · max · ultra`) — a skill-entropy level. The chosen word of the notch/rung/stop cluster: a ladder has rungs. Promoted 2026-07-24 for consistency with the oracle, which uses `rung` throughout after the ladder ruling. Correct freely if `notch` or `stop` reads better. N13 (2026-08-19): the floor rung is spelled `zero`, not `off`, and `ultra` is the seventh rung on the same line. A rung carries no count. |
| `slider` | ⛔ banned | N1 | Retired 2026-07-24. The control is a ladder with discrete rungs, not a continuous fader. **Use `ladder`.** This was the longest-running vocabulary conflict on the line — N1 superseded the slider framing while later entries mandated a slider, and neither acknowledged the other. Closed by choosing the ladder. The in-session posture surface ships with NO noun for the control (2026-07-29): `ladder`/`rung` name the off…max ladder — a different control — and the mode-control name is open. Do not substitute `ladder` into copy about the posture surface, and do not coin a replacement. |
| `picker` | 🅿️ parked | — | Candidate replacement for the contested `slider` — a discrete chooser with locked entries, which is what the product actually renders. Unratified. WITHDRAWN as a candidate 2026-07-29 (founder): the control name remains open and the method is locked — the method is already implied by Skill Heaven / Skill Hell. Do not ratify; do not propose a noun for the control surface. |
| `mode` | ✅ canonical | N13, N12, N11, N1, N2 | The band a rung falls in, READ from the rung rather than chosen on a second dial (N13-2): Skill Zero at `zero`, Heaven (converge) at `low · med`, Hell (explore) at `high · xhigh · max`, Ultra at `ultra`. N13 (2026-08-19) collapsed N5's two dials into one. Selecting a surface selects into its band; selecting a rung fine-tunes within it. A session sits at exactly one rung, so it is in exactly one mode. |
| `Heaven-0` | ⛔ banned | N3 | Retired as a level name. Historical shorthand in archived docs only. **Use `level`.** |
| `Heaven-1` | ⛔ banned | N3 | Retired as a level name. Historical shorthand in archived docs only. **Use `level`.** |
| `ultra` | ✅ canonical | N13, N12, N11, N4 | The top of the one line. It picks the skill entropy per capability gap — direction and depth both. Invoked by `/skill-ultra`. Never a fader (N1). N13(3) (2026-08-19) places `ultra` on the line as its last position; N12(4)'s off-the-line placement is withdrawn. It has no sub-ladder because it is the top of this one. THE CONTROLLER'S HEURISTICS ARE NOT BUILT — today the agent at `ultra` picks direction and depth unaided, and no surface may present a shipped controller. |

### mechanism

| Term | State | Oracle | Definition |
|---|---|---|---|
| `purge` | 🅿️ parked | — | Physical subtractive removal of context. Launcher-locked — gate (a) proved it cannot happen in-session. Names a real mechanism split — gate (a) proved purge cannot happen in-session — but the product framing that named it (D13) was deleted 2026-07-24. Parked until a surface using it ships. |
| `restraint` | 🅿️ parked | — | Behavioral suppression of skill USE while the skills remain physically in context. UNVERIFIED — research track, behind matrix gate (e), no load-bearing copy until it passes. Behind matrix gate (e), which has never run. Its backing entry (D13) was deleted 2026-07-24. It was canonical on that entry's authority while the entry itself said UNVERIFIED — it should never have been canonical. |
| `resident` | 🅿️ parked | — | Proposed name for a skill currently in context. Not the founder's word for it; kept parked rather than promoted alongside `summonable`. Proposed name for a skill currently in context; not the founder's word for it, so it stays parked beside the canonical `summonable`. The ordinary-English sense ("a permanent resident of your config") is exempted by pattern — the fifth time a one-word rule met a second meaning. |
| `summonable` | ✅ canonical | N11, P5 | A skill that is indexed and reachable but costs nothing until summoned. Hell expands this set; Heaven converges it. A summon brings a proxy into context for this session only. |
| `summon` | ✅ canonical | N11, D4 | A per-session operation that brings a skill into context once, without installing it. Hell is the explore/expand summon direction; Heaven is the converge/curated summon direction. |
| `auto-summon` | ✅ canonical | N13, N12 | A summon the agent issues itself at a capability gap, rather than one the user types. The rung sets the direction and how far along its band the session sits — not a number: nothing is permitted-per-gap and no summon is capped. At `zero` none are automatic and `/summon` still works by hand. N13(4) (2026-08-19) withdrew the count model N12(3)/N12(5) carried. How far to reach on a given gap is the agent's call, worked out in use while the benchmark is built. |
| `router` | ✅ canonical | D5 | Deterministic nearest-neighbour over a build-time frozen embedding index. No model call ever decides a loadout. |
| `firebreak` | ⛔ banned | N1, P5, N13 | Retired 2026-07-24. It named a token ceiling on the summon flood — the thing the ladder now sets and the meter now shows. **Use `ladder`.** Two senses ran side by side: the live 'token-ceiling firebreak' and the archived RFC-68 sense (an architectural boundary against tool-exposure degradation). Neither survives: a cap with a control and a readout does not need a third name. N13 (2026-08-19): the sentence explaining this ban no longer holds either — the ladder does NOT set a ceiling, because no rung carries a count and no summon is capped. The ban stands on stronger ground: there is no ceiling to name. |

### names

| Term | State | Oracle | Definition |
|---|---|---|---|
| `skill-heaven` | ✅ canonical | N11, N9 | The umbrella runtime brand and repo: `gaia-research/gaia-skill-heaven`. It contains the Skill Zero launcher module and the Heaven/Hell/Ultra runtime direction work; it is not the launcher bin. |
| `claude-heaven` | ⛔ banned | N11, N9 | Retired door product name. Use `claude-zero` for the Skill Zero door. **Use `claude-zero`.** Retired by the Skill Zero split (2026-08-11): Heaven is a summon direction and umbrella brand, not a per-harness launcher name. |
| `pi-heaven` | ⛔ banned | N11, N9 | Retired door product name. Use `pi-zero` for the Skill Zero door. **Use `pi-zero`.** Retired by the Skill Zero split (2026-08-11): Heaven is a summon direction and umbrella brand, not a per-harness launcher name. |
| `hh-launcher` | ⛔ banned | N9 | Retired working name for the launcher repo. **Use `skill-zero`.** |
| `skill-heaven-hell` | ⛔ banned | N9 | Retired fallback repo name. **Use `gaia-skill-heaven`.** Retired as a NAME for the repo/installable. The hyphenated string is also the natural URL slug of the line's own name, 'Skill Heaven / Skill Hell', which is fully canonical (this oracle's title uses it) — see the homepage anchor `#skill-heaven-hell`. A slug of the line name is not an instance of the retired name; mark such lines `lexicon-allow` rather than renaming public URL fragments. |
| `codex-heaven` | ⛔ banned | N11, N9 | Retired door product name. Use `codex-zero` for the Skill Zero door. **Use `codex-zero`.** Retired by the Skill Zero split (2026-08-11): Heaven is a summon direction and umbrella brand, not a per-harness launcher name. |
| `hermes-heaven` | ⛔ banned | N11, N9 | Retired door product name. Use `hermes-zero` for the Skill Zero door. **Use `hermes-zero`.** Retired by the Skill Zero split (2026-08-11): Heaven is a summon direction and umbrella brand, not a per-harness launcher name. |
| `grok-heaven` | ⛔ banned | N11, N9 | Retired door product name. Use `grok-zero` for the Skill Zero door. **Use `grok-zero`.** Retired by the Skill Zero split (2026-08-11): Heaven is a summon direction and umbrella brand, not a per-harness launcher name. |

### axis

| Term | State | Oracle | Definition |
|---|---|---|---|
| `heaven` | ✅ canonical | N13, N11 | The converge/curated summon direction — the LOWER-entropy direction of the one line, occupying the band `low · med` (N13-2). Heaven is not subtraction and not the launcher; Skill Zero owns clean-slate launch. Representative rung `low`, PROVISIONAL until the benchmark lands. |
| `hell` | ✅ canonical | N13, N11 | The explore/expand summon direction — the HIGHER-entropy direction of the one line, occupying the band `high · xhigh · max` (N13-2). `skill-hell` remains the standalone explore-direction summon tool. Representative rung `high`, PROVISIONAL until the benchmark lands. N13(5) (2026-08-19): nothing on the line refuses. Hell is not gated, locked or sealed — P2's gate was SATISFIED by owner ratification, the condition P2 itself named. What is outstanding on this band is implementation, not permission. |
| `polarity` | ✅ canonical | N13, N11 | The Heaven↔Hell direction of a summon along skill entropy: converge/curate toward Heaven (lower), explore/expand toward Hell (higher). `ultra` picks the direction per gap. |

## `gaia.zero`

### launcher

| Term | State | Oracle | Definition |
|---|---|---|---|
| `posture` | ✅ canonical | N11, P1 | A Skill Zero launch position: which context sources the harness admits at boot. |
| `native` | ✅ canonical | N11, P1 | A Skill Zero posture: the user's own setup, untouched — no eviction, no summoning. The default posture. |
| `curated` | ✅ canonical | N11, P1, P6 | A Skill Zero posture: a clean base plus a hand-picked fraction of the user's own skills, named explicitly at launch. Onboardable and personalizable; skills may be sourced externally via gaia mcp; saved as a personal profile. Because it is personalized it is not a measured arm. Ratified P6 (2026-07-30), NOT LOCKED — amendable as the product shape settles. The measured arms are three and curated is not among them: clean room / door / native. Arc I ships the composition only; onboarding, profile persistence and MCP-sourced skills are later arcs (gaia mcp is Program 4, Arc III). KC4 (2026-07-30): composed with `--setting-sources ''` (empty value, NOT the flag omitted) so no ambient project scope is inherited; `doctor` is the single disclosed residual, an upstream harness limitation ruled acceptable. |
| `floor` | ✅ canonical | N11, P1, B1, B2, P7, P8 | The Skill Zero doorless benchmark floor: evict all skills, bare prompt profile, zero server, slash commands off — the benchmark placebo-of-record, reachable only as `--posture floor`. Composed by Skill Zero for measurement runs; it keeps no door, so it is never offered on the in-session surface. It is NOT on the product line and has no rung. N13(6)/P8 (2026-08-19): the old 'at level `off`' pointer is WITHDRAWN — it was the LEVEL_ALIASES contradiction P8 named, and `LEVEL_ALIASES` no longer points the product word at this instrument. The AUDIENCE split is unchanged: this is INTERNAL / benchmarking only. LEXICAL ADJACENCY RISK: the product rung is now spelled `zero` and this term is 'absolute zero'. THE GUARD — `zero` is only ever a rung on the line; `floor` is only ever the posture name of the ruler, and the ruler has no rung. Never call the benchmark floor 'zero' in copy. The product/benchmark question this entry used to park is CLOSED — V5-5 split the floors and skill-heaven PR #14 landed it: the doorful launchable posture is `product-floor` (synonym: `clean-room`), priced as its own arm, never pooled with this one (B1). Ratified P7 (2026-07-30): `floor`, `product-floor` and `clean-room` are EQUIVALENT TERMS WITHIN ERROR MARGIN — the door is +515 tok on ~20k (F7), about 2.6%. The three names no longer carry three separate stories. SCOPE OF THIS RULING: vocabulary only. B1's discipline that the arms are priced separately and never averaged is NOT amended here — if that was intended it needs its own explicit line. Verified 2026-07-30 (2/2): this is the ONLY posture reaching a genuinely empty listing — `skills=[]`, `doctor` included — because `--disable-slash-commands` suppresses everything. That same flag is what removes the door (F6), so "zero skills plus a door" is not a state the harness can produce. That is why two floors exist at all: it is one flag doing two jobs, not a design choice. P8 (2026-07-30): this is ABSOLUTE ZERO — a ruler, not a product state. It stays the placebo-of-record (B2) and is deliberately not launchable. AUDIENCE (P8): INTERNAL / benchmarking only — absolute zero is OURS, not a product concept. Never offer it as a row, never name it in public copy, never present it as a user choice. It exists so we have a ruler. |
| `product-floor` | ✅ canonical | N11, D12, B1, P7, P8 | The Skill Zero doorful clean floor — the cleanest launchable posture: bundled skills, user/global skills, MCP and non-project settings evicted; the door (slash commands) kept. Composed only at boot, via Skill Zero; priced as its own arm, never pooled with the benchmark `floor` (B1). Synonym: `clean-room` — two names for one posture; neither retires the other. Ratified by V5-5 and landed in core's posture set (skill-heaven PR #14). Fully clean is not possible because the bare minimum stays — the door is the bare minimum. Ratified P7 (2026-07-30): `floor`, `product-floor` and `clean-room` are EQUIVALENT TERMS WITHIN ERROR MARGIN — the door is +515 tok on ~20k (F7), about 2.6%. The three names no longer carry three separate stories. SCOPE OF THIS RULING: vocabulary only. B1's discipline that the arms are priced separately and never averaged is NOT amended here — if that was intended it needs its own explicit line. MEASURED CAVEAT (2026-07-30, claude 2.1.220, 2/2 byte-identical): this posture composes `--setting-sources project` WITHOUT `--disable-slash-commands`, so it INHERITS project-scope skills from cwd — probed as `skills=["pf-project-marker","doctor"]` with a planted marker vs `["doctor"]` in a clean dir. So `clean-room` is not yet an accurate name for it, and this arm's token figure is cwd-dependent. `--setting-sources ''` fixes it (probed: `["doctor"]`). An error margin cannot cover this: the leak scales with the user's repo, it is not a constant. Fix pending a founder call because re-composing a measured arm re-derives F7. P8 (2026-07-30): this is "OFF" — whatever the harness can actually be launched at, NEAREST to zero. "Off" is a MEASURED per-harness quantity, not a fixed composition: probe downward until nothing further evicts, then record what remains. A launchable floor that is not the nearest achievable zero is a DEFECT BY DEFINITION — which is what the project-scope leak above now is. On claude, "off" is empirically ["doctor"]. AUDIENCE (P8): this is the PRODUCT-LINE floor, and its user-facing word is the lowest point a user can actually launch at. N13(6) (2026-08-19): that word is now `zero`, not `off` — `off` named a switch position, `zero` names a quantity. P8's clause (4) is CLOSED: `LEVEL_ALIASES` resolves the product word to this posture, not to the internal instrument, which is where P8 ruled it belonged. |
| `clean-room` | ✅ canonical | N11, D12, P7, P8 | The cleanest launchable Skill Zero posture: bundled skills, user/global skills, MCP and non-project settings all evicted; the door stays. Reachable only at boot, via Skill Zero. Synonym of `product-floor` — two names for one posture; neither retires the other. Promotion RATIFIED 2026-07-30 (R7); it had been demoted 2026-07-24 as unshipped and the posture has since shipped: the posture has now shipped as `product-floor` in core (V5-5, skill-heaven PR #14). The earlier "fully-subtractive" adjective overreached — the enumerated list never included slash commands; fully clean is not possible because the bare minimum stays. Ratified P7 (2026-07-30): `floor`, `product-floor` and `clean-room` are EQUIVALENT TERMS WITHIN ERROR MARGIN — the door is +515 tok on ~20k (F7), about 2.6%. The three names no longer carry three separate stories. SCOPE OF THIS RULING: vocabulary only. B1's discipline that the arms are priced separately and never averaged is NOT amended here — if that was intended it needs its own explicit line. P8 (2026-07-30): as a synonym of `product-floor` this names "off" — the nearest ACHIEVABLE zero — not absolute zero. It becomes an accurate name once the project-scope leak is fixed and the posture actually reaches ["doctor"]. |
| `level` | ✅ canonical | N13, N11, N3 | Skill Zero launch level terms: zero · low · med · high · xhigh · max · ultra. No celestial level names. N13(6) (2026-08-19): the floor level is spelled `zero`, not `off` — `off` named a switch position, `zero` names a quantity, and every level is a reading of that quantity (see `skill entropy`, gaia.heaven). N13(3): `ultra` joins as the seventh level on the same line. CAUTION — TWO DIALS SHARE THE `zero\|low\|med` SPELLINGS AND MUST NOT BE FUSED: the launcher's BOOT dial (`--level zero\|low\|med` -> `product-floor \| curated \| native`) is subtractive and decidable only at boot (D12); the global summon line is additive and runs `zero` through `ultra`. The collision of names is historical. |
| `eviction` | ✅ canonical | N11, D2 | Skill Zero removal of a skill or context source at launch. Always harness-side, never an MCP operation — MCP is additive-only in every target harness. |
| `launcher` | ✅ canonical | N11, D6, D12 | Skill Zero: the boot-time composer that severs the skill catalogue to zero and can restore selected user skills. It owns the launcher-locked subtractive floor. |
| `door` | ✅ canonical | N11, N9 | A per-harness Skill Zero installable — `claude-zero`, `pi-zero`, `codex-zero`, `hermes-zero`, `grok-zero`. Doors are the user-facing launch identities. |
| `context source` | ✅ canonical | N11, N9 | A class of material a harness loads into a session: skills, rule and instruction files, memory, prompt templates, toolsets, plugins and MCP servers, subagents. A Skill Zero posture is a statement about which context sources are admitted — skills are one class among several. |

### names

| Term | State | Oracle | Definition |
|---|---|---|---|
| `skill-zero` | ✅ canonical | N11 | The Skill Zero launcher engine and npm/bin name: the clean-slate module inside `gaia-skill-heaven` that composes zero-skill and selected-skill launch postures. |
| `claude-zero` | ✅ canonical | N11 | The Claude Code Skill Zero door and short user-facing launcher identity. |
| `pi-zero` | ✅ canonical | N11 | The pi Skill Zero door and short user-facing launcher identity. |
| `codex-zero` | ✅ canonical | N11 | The Codex CLI Skill Zero door and short user-facing launcher identity. |
| `hermes-zero` | ✅ canonical | N11 | The Hermes Agent Skill Zero door and short user-facing launcher identity. |
| `grok-zero` | ✅ canonical | N11 | The grok Skill Zero door and short user-facing launcher identity. |

### commands

| Term | State | Oracle | Definition |
|---|---|---|---|
| `/skill-zero` | ✅ canonical | N11 | The in-session Skill Zero command, meaningful inside a zero-launched session. |
| `/summon` | ✅ canonical | N12 | The single summon: one skill into context, one session, nothing installed. Present in every implementation, at every rung, on every door; Skill Zero ships it by default as the product floor. |
| `/skill-heaven` | ✅ canonical | N13, N12, N11 | The in-session command for the converge summon direction — the `low · med` band of the one line, the lower-entropy direction of the same summon. It carries no count and caps no summon. |
| `/skill-hell` | ✅ canonical | N13, N12, N11, N9 | The in-session command for the explore summon direction — the `high · xhigh · max` band of the one line, the higher-entropy direction of the same summon over the same MCP. It carries no count and caps no summon. Also the standalone summon CLI in gaia-mcp. |
| `/skill-ultra` | ✅ canonical | N13, N12, N11 | The in-session command for Skill Ultra, the top of the one line. It picks the skill entropy per capability gap — direction and depth both. N13(3) (2026-08-19). The controller's heuristics are NOT BUILT: today the agent picks direction and depth unaided. |

## `gaia.mcp`

### names

| Term | State | Oracle | Definition |
|---|---|---|---|
| `gaia_search` | ✅ canonical | D4 | Search tool in the published rich Registry/Bond package (@gaia-research/mcp). It is distinct from `search_skills`, the proposed search name for D4's thin Heaven/Summon profile; that profile distinction does not retire this published name. The published package's four-tool surface is a live compatibility obligation. No local-checkout capability is implied by the package's Registry/Bond label. |
| `gaia_inspect` | ✅ canonical | D4 | Inspection tool in the published rich Registry/Bond package (@gaia-research/mcp). It is not a tool in D4's distinct thin Heaven/Summon profile, but that profile constraint does not deprecate this published name. Keep this spelling when documenting or integrating the published package; do not substitute the future profile's proposed `search_skills` name. |
| `gaia_status` | ✅ canonical | D4 | Status tool in the published rich Registry/Bond package (@gaia-research/mcp). It is not a tool in D4's distinct thin Heaven/Summon profile, but that profile constraint does not deprecate this published name. Keep this spelling when documenting or integrating the published package; do not infer a two-tool limit for the package total from D4. |
| `search_skills` | 🅿️ parked | D4 | Proposed search tool name for D4's distinct thin Heaven/Summon profile, paired with `summon`. The profile is future work; this name does not describe or rename the published rich package's `gaia_search` tool. Parked because the thin profile has not shipped. D4's <=2-tool/schema-dose constraint remains a separate profile decision, not a ban on the published package's four names. |

