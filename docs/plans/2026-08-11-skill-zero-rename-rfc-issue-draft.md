# RFC: Skill Zero — split the launcher out of "Skill Heaven"; ratify the cross-repo rename

> **Draft issue for `gaia-research/gaia-research`.** Decision authority remains
> [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md); per G3 this issue
> holds the RFC and closes only when its rulings land there. This RFC **amends
> the naming settled in [#68](https://github.com/gaia-research/gaia-research/issues/68)
> (RATIFICATION N8/N9)** — it does not discard it; it evolves it toward
> [`ENDGAME.md`](https://github.com/gaia-research/gaia-skill-tree/blob/main/founder/ENDGAME.md).
> Low risk: nothing under the launcher names is published or adopted (see §7).

## 1. The question we are actually answering

`#68` settled the launcher's names when "Skill Heaven" meant *both* the umbrella
product **and** the clean-slate launcher **and** one pole of the behavioral axis.
ENDGAME separates those into three things (Yggdrasil, Arbor, and the runtime).
Working the question against ENDGAME surfaces one structural bug:

> **Most of what today's `skill-heaven` prototype does is the launcher.** The
> `--posture floor|product-floor|curated|native` machinery, eviction, "strip
> your agent's context bloat — run clean," the per-harness doors, the compiler
> engine, the `/skill-heaven` posture command — that is a *launcher with zero
> skills*. It is not the behavioral Heaven pole, and it is not the umbrella.

The launcher never had its own name, so it wore "Skill Heaven." This RFC gives
it one — **Skill Zero** — and frees "Heaven" to be what ENDGAME §5/§7 already
says it is: a behavioral **axis direction**, not a launcher.

## 2. Locked model (founder rulings, this session)

| Concept | Ruling |
|---|---|
| **Skill Heaven** | The **umbrella runtime brand** — what users associate with everything we do at runtime. Repo renamed `skill-heaven` → **`gaia-skill-heaven`** (ecosystem `gaia-*` prefix; brand preserved). |
| **Skill Zero** | The **launcher with zero skills** — a deep, standalone, *now-complete* prototype module living inside `gaia-skill-heaven`. Not a peer brand; a tool under the umbrella. It severs the skill catalogue to zero and can restore the user's own skills — the same *ephemeral-skills* mechanic as summon, in the subtractive direction. |
| **Heaven / Hell** | Two **summon directions** on the behavioral axis (Arbor). Heaven = converge/curated summon; Hell = explore/expand summon. Both are summons — this is why heaven-native curated skills finally have a home. Never again a launcher or repo name. |
| **Ultra** | The **automated Heaven↔Hell switch** (ENDGAME's long-horizon governor). Axis, not launcher. |
| **HH Index** | The behavioral index over that axis. Status: **in the works** (WIP), lives in `gaia-research`. |
| **skill-hell** | The explore-direction **summon** CLI/alias. **Unchanged**, stays in `gaia-mcp`. A **heaven-direction summon** (`skill-heaven` summon) is a *future* addition that makes summon bidirectional. |
| **Prefix taxonomy (ratified as a side effect)** | `gaia-*` = ecosystem repos/modules; `skill-*` = standalone skill tools. Moving the launcher off `skill-heaven` → `gaia-skill-heaven` fixes the mislabel; `skill-hell` legitimately *keeps* `skill-*` as a standalone summon tool. |

## 3. Names (amends #68 §2)

| Thing | #68 name | This RFC |
|---|---|---|
| Repo / umbrella brand | `gaia-research/skill-heaven` | **`gaia-research/gaia-skill-heaven`** |
| Monorepo package | `skill-heaven-monorepo` | `gaia-skill-heaven-monorepo` |
| Launcher engine (`packages/core`) | `skill-heaven` (bin `skill-heaven`) | **`skill-zero`** (bin `skill-zero`) |
| Claude door | `claude-heaven` | **`claude-zero`** (plugin/marketplace/`plugin.json` identity; bins `claude-zero`, `claude-zero-statusline`) | <!-- lexicon-allow -->
| pi door | `pi-heaven` | **`pi-zero`** (pi-extension identity) | <!-- lexicon-allow -->
| Future doors | `codex/hermes/grok-heaven` | **`codex/hermes/grok-zero`** | <!-- lexicon-allow -->
| In-session commands | `/skill-heaven`, `/skill-hell` | **`/skill-heaven`, `/skill-hell`, `/skill-ultra`, `/skill-zero`** — all ship with the launcher; `/skill-zero` is **gated** (only meaningful inside the zero launcher) |
| Core bin role | research driver | unchanged (still `--print`/`--record`), now spelled `skill-zero` |

**User-facing commands are deliberately short** (`claude-zero`, not
`gaia-claude-zero`): the launch moment is *"I want claude with zero skills → I
run `claude-zero`."* Only **repos** carry the `gaia-` prefix.

## 4. The Heaven semantic inversion to fix everywhere

Today's docs *define Heaven as subtraction* — VISION.md *"Heaven clears the
room… Heaven is subtraction, it strips what your agent is carrying"*;
MISSION.md *"Heaven ships first — pure subtraction"* / *"done when launching
through the door provably evicts installed skills."* **Under this RFC that
behavior is Skill Zero, not Heaven.** Every such surface must be reassigned:

- subtraction / clean-slate / strip / evict / floor / clean-room / posture → **Skill Zero**
- Heaven (axis mode) → **redefined** as the converge/curated **summon** direction

## 5. Lexicon ratification (the `gaia.zero` carve-out)

`gaia.heaven` currently bundles the launcher **and** the axis. Split it — both
namespaces stay in the **gaia-research HQ**; `gaia-skill-heaven` *consumes*
(no third HQ this pass):

- **Keep `gaia.heaven`** as the umbrella + axis namespace. Rewrite `about`:
  umbrella = Skill Heaven (runtime brand); axis = heaven/hell/ultra summon
  directions + governor; the launcher is Skill Zero. Retains `mode`, `ladder`,
  `rung`, `ultra`, `summon`, `summonable`, `router`, `hell lane`, +new
  `heaven`/`hell`/`polarity` as axis directions.
- **New `gaia.zero`** for the launcher module: `launcher`, `door`, `floor`,
  `product-floor`, `clean-room`, `native`, `curated`, `level`, `posture`,
  `eviction`, `context source`, and the `*-zero` names.
- **Retire → replacement**: `skill-heaven`→`gaia-skill-heaven` (repo term
  redefined to the umbrella); `claude-heaven`→`claude-zero`; <!-- lexicon-allow -->
  `pi-heaven`→`pi-zero`; `codex/hermes/grok-heaven`→`…-zero`. Add `skill-zero`, <!-- lexicon-allow -->
  `/skill-zero`, `/skill-ultra`.
- `gaia.research` (doses / HH Index / stamp) and `gaia.mcp` (tool surface)
  unchanged. Regenerate `founder/LEXICON.md` in **both** HQs + the name-only
  foreign mirrors, keep `lexicon-ci` green.
- **Deferred (recorded, not done):** promote `gaia.zero` to its own HQ once
  `gaia-skill-heaven` stabilizes; migrate the axis vocab to the
  `gaia-skill-tree` HQ when Arbor I ratifies (ENDGAME MIGRATION §13: the axis is
  a Tree index). Not now — no cross-HQ churn before the receiving Tree exists.

## 6. Cross-repo status (this issue tracks all of it)

| Repo | Change | Status |
|---|---|---|
| `gaia-skill-heaven` (was `skill-heaven`) | repo rename; `packages/*` → `*-zero`; README rewrite (launcher = Skill Zero, **now a complete usable prototype**; keep HH Index para as axis/research); marketplace/plugin/commands; all code + tests | ☐ proposed |
| `gaia-research` | VISION/MISSION Heaven-inversion fix; reports + hh-benchmark demos (`skill-heaven --posture` → `skill-zero`); site copy (`app/page.tsx` "Heaven clears the room" → axis); lexicon split; RATIFICATION amendment; CI paths | ☐ proposed |
| `gaia-mcp` | outward refs only: `alias/skill-hell` homepage/README, `docs/SKILL-HELL.md` ("additive/subtractive half of the Skill Heaven ladder" → summon/axis + Skill Zero), `VERSIONING.md`, `README.md`. **skill-hell itself unchanged.** | ☐ proposed |
| `gaia-skill-tree` | ENDGAME §9/§10/§11 + MIGRATION §11-§14 + SCHEMA; GAIA_ROADMAP; STEWARD §13; MEMORY four-name story; ARC_I; foreign-mirror regen | ☐ proposed |

## 7. Availability + risk (checked 2026-08-11)

- **npm:** launcher packages (`skill-heaven`, `claude-heaven`, `pi-heaven`) are <!-- lexicon-allow -->
  `private`, `0.0.0`, **never published** → zero migration risk. `skill-hell@0.4.0`
  and `@gaia-research/mcp@0.4.0` are **live and stay**. Target names
  `skill-zero`, `claude-zero`, `codex/hermes/grok-zero`, `gaia-skill-heaven`
  are **free**. `pi-zero@1.0.0` is squatted by an unrelated party — **moot**:
  the pi door ships as a pi *extension* (git / scoped `@gaia-research/pi-zero`,
  free), never the bare npm global.
- **Only ordering hazard:** the GitHub repo rename breaks
  `raw.githubusercontent.com/gaia-research/skill-heaven/...` asset paths and the
  published `skill-hell` homepage URL until fixed. Mitigation: rename **last**,
  then fix gaia-mcp outward URLs (+ optional `skill-hell` patch) immediately.

## 8. Governance

- **Amends** `#68` and RATIFICATION **N8/N9**; adds a RATIFICATION delta entry
  ("Skill Zero split") shipped in the same PR as the first implementation (D9).
- **Comment + link** from connected issues: `skill-heaven` #25, #29, #30, #31,
  #32 (door-named), `gaia-mcp` #15 (`skill-hell` publish guard). No behavior
  change requested there — just the rename context + this issue as the tracker.
- Full operational plan:
  `gaia-skill-tree/founder/handovers/2026-08-11-skill-zero-rename.md`.
