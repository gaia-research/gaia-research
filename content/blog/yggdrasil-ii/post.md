# Yggdrasil II: The Skill Tree Stops Storing What It Can Compute

*July 27, 2026 · Nova*

---

> AI agents can do thousands of useful things, but those capabilities are scattered across repositories with no shared record of what works. Gaia Skill Tree maps those capabilities, links each implementation to its maker, and ranks it by evidence.

---

## What changed, in one line

**In plain English:** Gaia Skill Tree is a public map of what AI agents can do, who demonstrated each capability, and what evidence supports it.

Its second full rebuild — **Yggdrasil II** (`v7.0.0`, EPIC #1002, released 2026-07-26) — makes four structural cuts. The rule underneath all four: **stop storing what you can derive.**

### In this post

1. [Four node types collapse to two](#cut-1-four-node-types-collapse-to-two)
2. [Branch becomes a computed view](#cut-2-branch-is-computed-never-declared)
3. ["Ultimate" becomes a rank](#cut-3-ultimate-stops-being-a-type-and-becomes-a-rank)
4. [Trust Magnitude replaces the popularity gate](#cut-4-trust-magnitude-puts-different-evidence-on-one-scale)

---

## Cut 1 — Four node types collapse to two

Every starless node had a `type` drawn from `{basic, extra, ultimate, unique}`. Those values mixed prerequisite structure with prestige. Yggdrasil II makes the field answer one question instead:

- **`basic`** — zero prerequisites. A root primitive.
- **`fusion`** — one or more prerequisites. Everything that is built on something else.

`extra`, `ultimate`, and `unique` are gone from the schema, CLI, and read-time consumers. Live result:

| Node type | Count | Share |
| :--- | ---: | ---: |
| `basic` | 113 | 46.5% |
| `fusion` | 130 | 53.5% |
| **Total starless nodes** | **243** | **100%** |

Residue left in the retired values: zero.

---

## Cut 2 — Branch is computed, never declared

This is the load-bearing change. Before the rule, here is the map:

| Term | What it tells you |
| :--- | :--- |
| **Type** | Whether a capability has prerequisites: `basic` or `fusion` |
| **Branch** | How a named skill progresses: `suite`, `standard`, or `unique` |
| **Rank** | How far that skill has advanced, from 1★ to 6★ |
| **Trust Magnitude** | How much weighted evidence supports its standing |

Yggdrasil II introduces the three-way branch view without adding a `branch` field. The registry computes it when the skill is read:

[[BRANCH_DERIVATION_FLOWCHART]]

The rule reads the two things that actually determine standing — does the skill compose other skills (`suiteComponents` present?), and how high has it ranked — and returns the branch:

- **`suite`** — has `suiteComponents`, at any rank. It is built out of other named skills.
- **`standard`** — no `suiteComponents`, rank 1–3.
- **`unique`** — no `suiteComponents`, rank 4 or higher. It climbed on its own.

### Type and branch answer different questions

Consider `obra/writing-plans`: a 4★ skill with no `suiteComponents`, hanging off a `fusion` parent node. The word `fusion` may sound suite-like, but the two axes describe different things. `type` describes the generic capability's prerequisites. Branch describes how a named implementation progresses.

For `obra/writing-plans`, `computeBranch(suiteComponents: none, rank: 4)` returns **`unique`**. The resolver never consults its parent's `fusion` type.

## Cut 3 — "Ultimate" stops being a type and becomes a rank

With `ultimate` gone from the type axis, it now means **5★** everywhere: Suite skills reach *Ultimate*; Unique skills reach *Unique Ultimate*. One word, one meaning, one axis.

---

## Cut 4 — Trust Magnitude puts different evidence on one scale

Promotion used to require clearing a per-star **Evidence Floor** *and* — for a 5★ Suite skill — a hard **≥10,000 repository stars** requirement. Both are retired.

Why? Repository stars measure attention on one platform. They do not tell you whether a method has been reproduced, cited, benchmarked, or independently verified.

**Trust Magnitude** (TM) is now the only gate on both branches:

| Grade | Trust Magnitude |
| :--- | :--- |
| S | ≥ 250 |
| A | ≥ 100 |
| B | ≥ 50 |
| C | ≥ 20 |
| ungraded | < 20 |

TM does not pretend that every kind of evidence means the same thing. It gives each one a tuned weight, then places them on a common scoring surface: a human `verifier-attestation` and a `fusion-recipe` count 1.5×, a reproducible `benchmark-result` 1.4×, and a self-produced `repo-own` row only 0.6×. An S grade additionally needs at least three distinct evidence types, including one the skill owner could not produce alone.

[[TRUST_GRADE_CHART]]

Consider Google DeepMind's `alphagenome_single_variant_analysis` skill. Gaia's evidence record contains no GitHub-stars row for it. The repository implementation contributed **10.82 TM**. The peer-reviewed AlphaGenome paper contributed **90 TM**, bringing the skill to **100.82 — Grade A**. Nature reported **225 citations** for that paper on July 27, 2026.

| Evidence attached to the skill | TM contribution |
| :--- | ---: |
| Google DeepMind Science Skills implementation | 10.82 |
| Avsec et al., *Nature* — AlphaGenome | 90.00 |
| **Total** | **100.82 — Grade A** |

A stars-only gate sees a repository counter. Trust Magnitude sees two claims: the implementation exists, and its scientific method has survived independent use and scrutiny. The registry weights each kind of evidence, applies freshness and duplication rules, then lets both contribute.

---

## The frontend moved in lockstep: Ascension Overdrive

The site moved with the taxonomy under the codename **Ascension Overdrive**. Suite skills *emit outward* (4★ dwarf star → 5★ burning sun → 6★ supernova). Unique skills *collapse inward* (rooted void → accretion ring → singularity).

Rank sets the color. The derived branch sets the material: Suite leans gold; Unique runs amethyst to ember. The frontend reads the emitted `branch` instead of recomputing it client-side.

[[RANK_LADDER]]

The two 6★ pinnacles have names now: **Apex** (the Suite summit — extreme ecosystem impact, guarded by a six-predicate gate) and **Unique Impossible** (the Unique summit — reached through depth alone, with its gate provisional pending Yggdrasil III). Four skills currently sit at S grade; none has cleared a 6★ gate yet. The Hall of Heroes is built and waiting for its first ascension.

---

## What to take from it if you maintain a schema

**If a field can be recomputed from other fields in the same record, storing it does not save you a computation — it buys you a way to be wrong.** The stored copy and the computed value are two sources of truth for one fact, and the day they disagree, every consumer has to guess which one to believe.

Before adding the next column, ask whether it is data or a derivation. If it is a derivation, write the function. Then inspect your gates: if one proxy stands in for several kinds of evidence, keep the evidence types separate long enough to weight them properly.

---

## Inspect the live tree

[Open Gaia Skill Tree →](https://gaiaskilltree.com) to explore capabilities, implementations, and their evidence. For the full taxonomy decision record, read the [Yggdrasil II release report](https://gaiaskilltree.com/meta/reports/2026-07-26-yggdrasil-ii-two-types-one-trust-gate-and-a-branch-axis-that-is-never-declared.html).

---

## Sources

- **Taxonomy and release:** Gaia Skill Tree `v7.0.0`, *Yggdrasil II* (EPIC #1002), ratified July 7 and released July 26, 2026. The [release report](https://gaiaskilltree.com/meta/reports/2026-07-26-yggdrasil-ii-two-types-one-trust-gate-and-a-branch-axis-that-is-never-declared.html) documents the type collapse, computed branch rule, Trust Magnitude gate, and rank names.
- **Live registry figures:** node counts, current S-grade count, and AlphaGenome evidence contributions were verified against the Gaia Skill Tree graph and named-skill record.
- **Peer-reviewed evidence:** Žiga Avsec et al., [“Advancing regulatory variant effect prediction with AlphaGenome”](https://www.nature.com/articles/s41586-025-10014-0), *Nature* 649, 2026.
- **Implementation:** [Google DeepMind Science Skills](https://github.com/google-deepmind/science-skills).
