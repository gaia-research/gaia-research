# Yggdrasil II: The Skill Tree Stops Storing What It Can Compute

*July 27, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

> A stored field is a promise a curator makes and then has to keep. Every skill in the Gaia Skill Tree used to carry a `branch` label that a human typed in and a human had to maintain. Yggdrasil II deletes that field — and two others — and recomputes them from structure. The registry got smaller and more correct at the same time.

---

## What changed, in one line

The Skill Tree is Gaia Research's flagship: a public registry that grades real agent skills by evidence, not stars. Its classification model just went through its second full rebuild — codenamed **Yggdrasil II** (`v7.0.0`, EPIC #1002, released 2026-07-26). Four structural cuts landed together. Three of them are deletions.

The through-line: **stop storing what you can derive.** A value the registry can recompute from other fields is not data — it is a second copy that can disagree with the first. Yggdrasil II removes the second copies, and with them the states where the two disagreed.

---

## Cut 1 — Four node types collapse to two

Every non-named node in the tree had a `type` drawn from `{basic, extra, ultimate, unique}`. Those four values tried to encode two unrelated things at once: whether a node has prerequisites, and how prestigious it is. That conflation is exactly what let a stored label drift from reality.

Yggdrasil II collapses the axis to what it actually measures — prerequisite structure — with two values:

- **`basic`** — zero prerequisites. A root primitive.
- **`fusion`** — one or more prerequisites. Everything that is built on something else.

`extra`, `ultimate`, and `unique` are gone from the schema, the CLI, and every read-time consumer. The migration was a hard cutover, not a soft alias. Live result after the rewrite:

| Node type | Count | Share |
| :--- | ---: | ---: |
| `basic` | 113 | 46.5% |
| `fusion` | 130 | 53.5% |
| **Total starless nodes** | **243** | **100%** |

Residue left in the retired values: zero.

---

## Cut 2 — The branch axis is derived, never declared

This is the load-bearing change. A named skill belongs to one of three **branches** — `suite`, `standard`, or `unique`. Under the old model, `branch` was a field a curator wrote down. Under Yggdrasil II it is a function, evaluated at read time and stored nowhere:

[[BRANCH_DERIVATION_FLOWCHART]]

The rule reads the two things that actually determine standing — does the skill compose other skills (`suiteComponents` present?), and how high has it ranked — and returns the branch:

- **`suite`** — has `suiteComponents`, at any rank. It is built out of other named skills.
- **`standard`** — no `suiteComponents`, rank 1–3.
- **`unique`** — no `suiteComponents`, rank 4 or higher. It climbed on its own.

### The failure the old model allowed

Consider `obra/writing-plans`: a 4★ skill with no `suiteComponents`, hanging off a `fusion` parent node. Under Yggdrasil I, a curator eyeballing that `fusion`-adjacent legacy `ultimate` type could reasonably store its branch as **suite** — and nothing would catch it. The label was an assertion, and assertions go stale.

Under Yggdrasil II there is no label to get wrong. `computeBranch(suiteComponents: none, rank: 4)` returns **`unique`**, every time it is read, on every surface. The curator's earlier mistake is not corrected — it is made impossible to express.

That is the whole thesis: **derived, not declared.** The change does not add machinery. It removes it.

---

## Cut 3 — "Ultimate" stops being a type and becomes a rank

With `ultimate` gone from the type axis, the word was freed to do one job well. It is now the universal name for **5★** across both branches (Suite skills reach *Ultimate*; Unique skills reach *Unique Ultimate*). This is a deliberate gacha-anchor collision — a reader should associate "Ultimate" with "5★" and nothing else. One word, one meaning, one axis.

---

## Cut 4 — Trust Magnitude is the sole promotion gate

Promotion used to require clearing a per-star **Evidence Floor** *and* — for a 5★ Suite skill — a hard **≥10,000 repository stars** requirement. Both are retired. **Trust Magnitude** (TM) is now the only gate on both branches:

| Grade | Trust Magnitude |
| :--- | :--- |
| S | ≥ 250 |
| A | ≥ 100 |
| B | ≥ 50 |
| C | ≥ 20 |
| ungraded | < 20 |

TM sums per-artifact evidence scores, weighted by type: a human `verifier-attestation` and a `fusion-recipe` count 1.5×, a `benchmark-result` 1.4×, a self-produced `repo-own` row only 0.6×. An S grade additionally needs at least three distinct evidence types, one of which cannot be self-produced. The effect is that no automated pass can mint its own way to the top grade — which is why S is scarce.

[[TRUST_GRADE_CHART]]

The retired stars requirement rewarded a repository's fame. TM rewards a skill's demonstrated trust. Three live A-grade skills carry **no GitHub-stars evidence row at all** and still clear the gate on other evidence: `obra/writing-plans` (TM 110.2), `obra/subagent-driven-development` (TM 117.7), and `stanfordnlp/dspy` (TM 100.0, sourced from an arXiv paper). Under the old floor, at least one of them would have been held back for a metric that has nothing to do with whether the skill works.

---

## The frontend moved in lockstep: Ascension Overdrive

A taxonomy this different needs a surface that renders it. The site was rebuilt in the same release under the codename **Ascension Overdrive** — one antique medallion chassis, two paired stellar cosmologies. Suite skills *emit outward* through stellar ascension (4★ dwarf star → 5★ burning sun → 6★ supernova); Unique skills *collapse inward* through gravitational failure (rooted void → accretion ring → singularity). Rank sets the color; the branch — the derived one — sets the material: Suite leans gold, Unique runs a darker amethyst-to-ember plaque. The frontend reads the emitted `branch` and no longer recomputes it client-side, so the site and the registry can no longer disagree about what a skill is.

[[RANK_LADDER]]

The two 6★ pinnacles have names now: **Apex** (the Suite summit — extreme ecosystem impact, guarded by a six-predicate gate) and **Unique Impossible** (the Unique summit — reached through depth alone, with its gate provisional pending Yggdrasil III). Four skills currently sit at S grade; none has cleared a 6★ gate yet. The Hall of Heroes is built and waiting for its first ascension.

---

## What to take from it if you maintain a schema

The reusable move here is not specific to skill registries. It is a test you can run against any record you store:

**If a field can be recomputed from other fields in the same record, storing it does not save you a computation — it buys you a way to be wrong.** The stored copy and the computed value are two sources of truth for one fact, and the day they disagree, every consumer has to guess which one to believe.

Before adding the next column, ask whether it is data or a derivation. If it is a derivation, write the function instead of the field. Yggdrasil II deleted three fields that way and the registry came out smaller, and — for 243 nodes and 249 skills, checked against the live data — internally consistent by construction.

---

**Source:** Gaia Skill Tree `v7.0.0` — *Yggdrasil II* (EPIC #1002), ratified 2026-07-07, released 2026-07-26. Live figures verified against the registry graph. Founder meta-post: *["Yggdrasil II: Two Types, One Trust Gate, and a Branch Axis That Is Never Declared"](https://gaiaskilltree.com/meta/reports/2026-07-26-yggdrasil-ii-two-types-one-trust-gate-and-a-branch-axis-that-is-never-declared.html)*.
