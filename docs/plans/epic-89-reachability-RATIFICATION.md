# ⭐ RATIFICATION — Epic #89 / #86 fusion reachability

**Status: LOCKED (founder-ratified 2026-07-23 by mbtiongson1).** Source of truth for the reachability approach in Infinite Skill Craft. Where any plan, PR body, or code comment disagrees, this wins.

> This is the epic-89 line's ratification record. It is **separate** from `founder/RATIFICATION.md` (which governs the Skill Heaven / Skill Hell product line). Do not conflate them.

---

## R1 — LOCKED — Reachability metric is honest and two-headed

The `bridges.json` report MUST carry two distinctly-labelled numbers, never one conflated "reachable %":
- `internalConnectivityPct` — reachability seeding all basic nodes as free roots (proves the registry graph is self-contained). Currently **100% (243/243)**.
- `gameSeedReachablePct` — reachability from ONLY the 4 game seeds (`/prompt /code /web /data`). This is the **#86 DoD metric**. Deterministically **0%** before bridges (the 4 UI seeds match no registry id).

The historical "17% → 100%" framing is retired as misleading (apples-to-oranges). Any PR quoting a single reachability number is non-conforming.

## R2 — LOCKED — A′ ("A-star ⭐"): bridge only named-backed fusions

For the genuine-gap decision (#86's founder gate), the choice is **A′**, not blanket-A or blanket-B:

- **Synthesize minimal derived seed→graph bridges ONLY toward fusions that have a real named implementation** — a fusion node whose id is a named-skill slug (direct) OR is referenced by some named skill's `genericSkillRef`. This is **84 of 130 fusions**, surfacing **153 distinct named skills** deterministically reachable from the game seeds.
- **The 46 purely-generic starless fusions are NOT bridged deterministically.** They fall to the emergent/LLM path (#87) and/or remain flavor overlay, documented as a deliberate, human-approved boundary.

**Rationale:** the fuse game is the trustworthy entry point into gaia-skill-tree (#89) — deterministic paths must land devs on named, attributed, deep-linkable skills, not auto-generated filler to starless generic nodes. Blanket-A hits 100% but 35% of it is generic filler (the "optimizing the wrong thing" trap #89 exists to avoid). Blanket-B accepts 0% deterministic delight. A′ is the principled hybrid.

**Rejected:** A (bridge everything), B (accept 0%, emergent-only).

## R3 — LOCKED — Bridges are DERIVED, never hand-authored

Bridge synthesis is a build-time computation over the synced registry graph (auto-generated shortest missing path per named-backed target), regenerated every sync. `starter-recipes.ts` stays a flavor/copy overlay only — never the reachability mechanism. A newly-added named skill in the synced registry MUST become reachable on the next sync with zero code changes (proven by fixture test, not asserted).

## R4 — LOCKED — Numbers are hand-reviewed; no faked coverage

The reachability report is reviewed by a human before merge. A script reporting inflated coverage by synthesizing nonsense bridges is worse than an honest partial. The A′ target (**153 named skills / 84 fusions**) is the number to verify against — if an implementation reports materially more, suspect over-bridging into generic nodes and reject.

---

## Provenance
- Metric-honesty (R1) surfaced in epic-89 review, issue #89 comment 5058546016 / #86 comment 5058546349.
- A′ decision (R2) ratified by founder 2026-07-23 after the named-vs-generic breakdown (20 named-by-id + 64 via genericSkillRef + 46 purely-generic = 130 fusions).
- Related: [[skill-heaven-hell-vision]] (#87 emergent path is the complement to A′'s deterministic layer).
