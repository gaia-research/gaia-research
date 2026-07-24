# Skill Heaven / Skill Hell MVP — Ratified Engineering Findings

- **Rank:** 1
- **Viability:** High (Heaven), Medium-High (Hell — gated by benchmark + Ygg II)
- **Potential:** Very High
- **Status:** Ratified 2026-07-18 (brainstorm findings + owner decisions logged below)
- **Decision authority (2026-07-19):** decisions consolidated into
  [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md) — the decision log
  below is **historical**; the findings remain the engineering reference.
- **Companion plan:** [`../plans/skill-heaven-hell-mvp-plan.md`](../plans/skill-heaven-hell-mvp-plan.md)
- **Source docs:** `VISION.md` / `MISSION.md` / `content/reports/hh-benchmark/methodology.md`
  (branch `feat/skill-heaven-hell-vision`), tracking issue
  [#62](https://github.com/gaia-research/gaia-research/issues/62)

## The four load-bearing findings

1. **Eviction is not an MCP operation.** MCP servers are additive — they can only put
   things *into* a session. Heaven's core move (evict all project and global skills)
   has no MCP primitive in any target harness (Claude Code, Codex CLI, Cursor, pi).
   It is a filesystem/config operation that must happen at or before session start,
   per harness. Heaven's MVP is therefore a harness-side mechanism, not a server.

2. **`contextCost` is two-part, not one number.** Skills-native harnesses do
   progressive disclosure: the *standing dose* of an installed skill is its one-line
   listing (~20–50 tokens); the full `SKILL.md` body (*invocation dose*) only lands on
   invoke. Tokenizing whole `SKILL.md` files overstates standing cost by ~10–50×.
   Every census, firebreak ceiling, and "below vanilla" claim must price the two
   doses separately, or the first careful reviewer breaks the headline number.

3. **The borrowed baseline confounds harness with skill.** A published benchmark score
   was earned under a specific scaffold; our with-skill runs happen inside a
   particular harness. The honest placebo arm is *our own same-harness no-skill run*;
   the published number only sanity-checks that the placebo is in range. Report
   `score(harness + skill) − score(harness, placebo)`, anchored — never
   `score(harness + skill) − published`.

4. **Summoning has no uniform cross-harness primitive, and discoverability fights the
   zero-footprint goal.** No harness hot-loads a native skill mid-session. "Summon"
   is either an MCP tool result carrying the skill body (works everywhere, weaker
   instruction weight) or launch-time loadout composition (native semantics, fleet
   lane). And an agent cannot summon a skill it has never heard of — some catalog or
   retrieval surface must exist, and it has a standing cost of its own.

## Secondary findings (all carried into the plan)

- **Restore is the hard half of evict:** crash recovery (journal + repair), concurrent
  sessions sharing global skill dirs (prefer session-scoped config over mutating
  shared state), and tracked-file harnesses (Cursor/Codex) where eviction dirties git.
- **Firebreak is admission control only.** Context cannot be un-spent mid-session; the
  firebreak is a per-session token ledger that refuses summons past the ceiling.
- **Compaction × firebreak is unmodeled.** Long Hell loops compact summoned skill
  bodies into mush; summon must be idempotent and cheap to re-issue, and the ledger
  needs a policy for whether re-summons count against the ceiling.
- **The effort-axis overload has no API.** No harness exposes its effort dial to an
  MCP server. MVP posture is an explicit signal (flag/env/first tool call); the
  one-dial story is UX layered on top later.
- **gaia-mcp's own tool schemas are standing dose.** Keep the surface to 1–2 tools and
  subtract its footprint in every measurement. Heaven's purest form uses no server.
- **Hell is a supply chain.** Summoning registry content into unsupervised fleets is a
  prompt-injection vector; `hell-safe@tier` needs a security dimension in the rubric
  and hash-pinned enforcement.
- **Determinism doesn't exist.** No harness gives seed control; paired trials need
  N repeats + confidence intervals, multiplying benchmark cost ~5–10×.

## Decision log (owner-ratified, 2026-07-18)

- **(A) Heaven delivery: in-harness preferred.** Target shape: `claude --heaven-mode`
  / `claude-heaven` or equivalent. Still being shaped — a wrapper/launcher is an
  acceptable alternative only if proven better. Plan spikes both (hooks/plugin route
  vs. thin launcher) on Claude Code first, pi second.
- **(B) Hell routing: performance first.** Hell serves autonomous operations; latency
  matters. Embedding-based retrieval over stamped skills is ratified *if* it is the
  lowest-latency option that holds quality — with determinism preserved by building
  the index at build time (pinned embedding model, frozen vectors) so retrieval is
  deterministic nearest-neighbor, never a per-session model decision. Stress-test
  target: Hell must hold up with **hundreds of hell-max-compatible skills** in a repo,
  even though realistically only a handful will qualify. Ranked / origin skills sort
  first in the candidate list, ahead of similarity order.
- **(C) Ygg II (epic 1002, `gaia-skill-tree`) is still being finalized.** Stamps land
  *after* benchmarks and after the epic. `gaia-research` stays on top of the schema:
  track the epic, and stage schema asks (hash-binding, provenance, tier
  set-membership) as `needs-review` proposals through the governance path — never
  direct commits to canon.

## Why it matters

- Converts the VISION/MISSION north star into the first buildable slice with the
  failure modes named before they are hit.
- Protects the benchmark's credibility (two-part dose, own-placebo anchoring) before
  any public claim ships.
- Locks the routing posture (deterministic, build-time index) so Hell's performance
  goal and MISSION §2's "no model call decides your loadout" stop being in tension.
