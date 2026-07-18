# Skill Heaven / Skill Hell — MVP Implementation Plan

> Companion to the ratified findings in
> [`../idea-bank/skill-heaven-hell-mvp.md`](../idea-bank/skill-heaven-hell-mvp.md).
> Scope: the R0–R3 slice of `MISSION.md` §3, Heaven first, Hell staged behind it.
> Baseline harnesses: **Claude Code, Codex CLI, Cursor, pi.**

## 0. Posture

- **Heaven ships first** — it is pure subtraction, needs no registry, no gate, and
  (in its purest form) no MCP server.
- **Hell follows** — it needs the Ygg II stamps (epic 1002, still being finalized),
  the benchmark to earn them, and the firebreak. We build its routing spike early
  because performance is its top priority, but nothing ships until the gate clears.
- **Claude Code is the reference harness** (best automation + telemetry + skills
  semantics); pi is the second dir-based target; Codex/Cursor are ports with
  documented recipes until proven.

## 1. Harness capability matrix (working assumptions — verify each in M0)

| Capability | Claude Code | Codex CLI | Cursor | pi |
|---|---|---|---|---|
| Skill discovery | `~/.claude/skills`, `.claude/skills`, plugins, `.agents/skills` | `AGENTS.md` | `.cursor/rules`, `.mdc` | `.pi/skills` |
| Discovery time | session start | session start | session start | session start |
| Session-scoped config | env-scoped config dir, settings profiles, hooks | partial | none known | dir-based |
| Eviction dirties git? | no (untracked dirs possible) | yes (`AGENTS.md` tracked) | yes (rules tracked) | no |
| MCP support | full | tools | tools (surface limits) | yes |
| Headless automation | `-p` / SDK | `exec` | weakest (agent CLI) | scriptable |
| Context introspection | `/context`, OTEL tokens | limited | ~none | limited |

**M0 (spike, 1–2 days): validate every cell above on current harness versions**
before building on it. Output: a checked matrix in `docs/labs/`.

## 2. Heaven MVP

### M1 — R0 census, two-part dose (`scripts/hell-heaven-bench/census.ts`)

Tokenize every canon skill contract **twice**: the listing line (standing dose) and
the full body (invocation dose). Publish the distribution as the R0 ledger artifact.
Pure Tier-1 measurement, no new schema, publishable immediately. Re-runnable against
any repo's local skill set (that is what Heaven's "below vanilla" delta is computed
from).

### M2 — Heaven mechanism, in-harness first (decision A)

Preferred shape: **inside the harness** — e.g. `claude --heaven-mode` semantics.
Two spikes on Claude Code, pick by evidence:

1. **Hooks/plugin route (preferred):** a SessionStart hook (or plugin) that scopes
   the session to a Heaven config — skills listing suppressed/replaced with the
   grilling-native set — and restores nothing because nothing shared was mutated.
2. **Thin launcher fallback (`claude-heaven`):** session-scoped config dir + curated
   skills dir, journaled stash/restore only where env-scoping is impossible.

Acceptance (either route):
- Vanilla session and Heaven session run **concurrently in the same repo** without
  interference (no shared-state mutation).
- Kill -9 mid-session leaves no evicted state behind (journal + `doctor` repair if
  the fallback route wins).
- Measured loaded-context tokens: Heaven < vanilla on the same repo, verified via
  `/context` / OTEL, with the census script as the by-construction cross-check.
- pi port lands second; Codex/Cursor get a documented manual recipe in v1 (tracked
  files make automated eviction dirty — overlay tricks are post-MVP).

### M3 — Ledger appender (`scripts/hell-heaven-bench/ledger.ts`)

JSONL appender matching methodology §6: benchmark id, task, arm
(placebo/heaven/hell/ultra), skills loaded (id + content hash), model, harness,
repeat index, tokens by category (system / skill-standing / skill-invocation /
per-turn), wall-clock, objective endpoint result, judge verdict (Tier 3 only).
Every run — including manual ones — appends from day one, so paired data accumulates
before the fleet exists. No seeds: N repeats + CIs is the design (determinism does
not exist in any harness).

## 3. Hell MVP (staged, performance-first per decision B)

### M4 — Routing spike: deterministic embedding retrieval

- Index built **at build time** from the stamped registry: pinned embedding model,
  frozen vectors, versioned artifact shipped with the index. Per-session retrieval
  is deterministic nearest-neighbor filtered by `hell-safe@tier` set-membership —
  no model call ever decides a loadout (keeps MISSION §2 honest while meeting the
  latency bar).
- **Ordering contract:** ranked / origin skills first, then similarity order within
  the remainder.
- **Stress harness:** synthetic corpus generator fabricates **hundreds of
  hell-max-compatible skills** (realistic distribution: only a handful genuinely
  qualify, the rest are plausible noise). Measure: retrieval latency (budget:
  single-digit ms lookup), catalog standing dose vs. pool size, precision@k against
  a hand-labeled relevance set, firebreak behavior at scale.

### M5 — Summon surface + firebreak

- `gaia-mcp` exposes **two tools max**: `search_skills` (over the frozen index) and
  `summon(skill_id)` (returns the hash-pinned skill body). Server's own schema
  footprint is measured and subtracted in every claim.
- Fleet lane: launch-time **loadout compiler** writes the summoned set into the
  session-scoped skills dir for native semantics; mid-loop additions go through
  `summon`.
- Firebreak = per-session token ledger, admission control only (context cannot be
  un-spent). Ranked drop policy: stamp tier × retrieval rank. `summon` is
  idempotent and cheap to re-issue; re-summons of an already-charged skill do not
  double-charge the ceiling (compaction recovery).
- Posture signal is explicit (flag / env / first tool call). Mapping to the harness
  effort dial is UX layered on later — no harness exposes that dial today.

## 4. Ygg II / epic 1002 tracking (decision C)

Stamps land after the benchmark and after the epic. Until then `gaia-research`:

- tracks the epic and keeps this plan aligned with the evolving schema;
- stages the schema asks as `needs-review` proposals via the governance path
  (`gaia-research → marketing-tasks → gaia-skill-tree`), never direct commits:
  1. **Hash-binding:** a `hellHeaven` stamp is valid only for a specific content
     hash of the skill contract (reuse the `containerSha` pattern);
  2. **Provenance:** each stamp carries benchmark run id, arm, CI, date — so
     trust-coverage is computable from the registry itself;
  3. **Tier set-membership:** discrete stamps per effort tier, routing =
     set-membership lookup, no arithmetic;
  4. **Security dimension:** `hell-safe@tier` rubric includes a supply-chain /
     prompt-injection review, enforced by hash-pinning at summon time.
- mirrors the `generate-templates.ts` triple-fallback discipline in the MCP's
  registry consumption (sibling checkout → raw GitHub → pinned cache) plus an index
  version handshake.

## 5. Order of work

| # | Milestone | Depends on | Maps to |
|---|---|---|---|
| M0 | Harness capability matrix verified | — | pre-R0 |
| M1 | Census, two-part dose | — | R0 |
| M2 | Heaven in-harness (Claude Code, then pi) | M0 | R3 (Heaven mechanism) |
| M3 | Ledger appender | M1 | R2 plumbing |
| M4 | Hell routing spike + stress harness | M1 | pre-R4 |
| M5 | Summon surface + firebreak | M4, Ygg II stamps | R4 |

Benchmark milestones R1 (rubric + seed labels) and R2 (paired trial) run alongside
per `MISSION.md`; M3 is their data plumbing. The plan's placebo arm is always the
**same-harness no-skill run**; published benchmark scores are calibration only.
