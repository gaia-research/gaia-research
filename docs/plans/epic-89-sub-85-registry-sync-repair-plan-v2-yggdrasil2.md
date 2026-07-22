# Epic #89 · Sub-issue #85 — Registry sync repair **v2 (Yggdrasil II schema)**

> Supersedes `docs/plans/epic-89-sub-85-registry-sync-repair-plan.md` (kept as historical
> record — still accurate for gaia-skill-tree's *current* `main`). This v2 plan retargets the
> sync at the **post-migration Yggdrasil II schema** shipped by gaia-skill-tree PR **#1185**
> (`dev/yggdrasil-ii-staging`), which the epic will now deliberately land *after*.

## 0. TL;DR — what changed and the one key decision

The parked v1 fix (PR #91, branch `epic-89/85-repair-registry-sync`) was correct against today's
`main`, but gaia-skill-tree's open draft PR **#1185 ("Yggdrasil II — staging integration")**
changes the registry shape again:

- `registry/nodes/{extra,ultimate}` → consolidated into **`registry/nodes/fusion/`**; node
  `type` becomes `"fusion"` (was `"extra"` / `"ultimate"`). `basic/` is unchanged.
- **`registry/combinations.md` is emptied** — on `dev/yggdrasil-ii-staging` it is a 95-byte stub
  with only the table header and no rows. The file our v1 sync parses for fusion recipes no
  longer carries data (and per PR #1185 will eventually be deleted outright).

**The key technical decision (verified, not assumed):** every node JSON — on *both* today's
`main` **and** `dev/yggdrasil-ii-staging` — already carries a `"prerequisites": [...]` array of
the slugs it fuses from (e.g. `nodes/fusion/prototype.json` → `["code-generation",
"code-execution"]`). `combinations.md` was always a *redundant, derived projection* of this
per-node data. **We will derive recipes directly from `node.prerequisites`** instead of parsing
`combinations.md`. This is (a) immune to `combinations.md`'s emptying/deletion, (b) identical in
result on both the old and new schema, and (c) more correct than markdown-table-parsing ever was.

Everything else the v1 plan established about the **named-skill index** (the actual `235 → 0`
bug the issue is really about) carries forward almost unchanged and was re-verified against
`dev/yggdrasil-ii-staging`.

---

## 1. Ground-truth sources used for this plan

- `/workspace/gaia-skill-tree` — gaia-skill-tree current `main` (extra/ultimate layout, populated
  `combinations.md`).
- `/workspace/gaia-skill-tree-yggdrasil-ii` — worktree at `origin/dev/yggdrasil-ii-staging`
  (commit `b572c7d`) — **primary target schema**.
- Parked v1 script: `git show origin/epic-89/85-repair-registry-sync:scripts/craft/sync-skill-tree.ts`.
- Consumers: `lib/craft/{types,recipes,named-index}.ts`, `app/labs/infinite-skill-craft/api/fuse/route.ts`.

All counts below were measured directly against the two checkouts on 2026-07-22.

---

## 2. Schema mapping table — old `main` vs Yggdrasil II vs what we target

| Concern | Current `main` | Yggdrasil II (`dev/yggdrasil-ii-staging`) | What our sync targets |
|---|---|---|---|
| Fusion node dirs | `nodes/extra/` (125) + `nodes/ultimate/` (5) | **`nodes/fusion/`** (130) | read `nodes/fusion/` |
| Basic node dir | `nodes/basic/` (113) | `nodes/basic/` (113, unchanged) | read `nodes/basic/` |
| Node `type` value | `"extra"` / `"ultimate"` | **`"fusion"`** | store `type: 'fusion'` \| `'basic'` |
| `node.prerequisites` | present (slugs) | **present, identical field** | **THE recipe source** |
| `registry/combinations.md` | populated table (~130 rows) | **95-byte header-only stub** (deleted later) | **not read at all** |
| `registry/named/**` frontmatter | id/name/contributor/genericSkillRef/description/level/title/status/origin | same top-level fields; timeline entries gain additive `metaEpoch`, `migrationBatch` | read the same top-level fields; ignore timeline |
| `schema/skill.schema.json` | `type` enum `[basic,extra,unique,ultimate]`; per-type prereq `minItems` (extra≥2, ultimate≥3) | `type` enum **`[basic,fusion]`**; rule: basic = 0 prereqs, fusion = ≥1 prereq; timeline adds `metaEpoch`/`migrationBatch` | not read (informational only) |
| `schema/namedSkill.schema.json` | — | **additive only**: `metaEpoch`, `migrationBatch` on changelog/timeline entries | not read; additive → non-breaking |
| `schema/meta.json` | `levelLabels` 4★=Hardened/5★=Transcendent; `types` incl. extra/unique/ultimate; `evidenceFloors` block; typeLabels/Symbols/Colors per old tiers | `levelLabels` 4★=Extra/5★=Ultimate; `types=[basic,fusion]`; `evidenceFloors` **removed**; new `metaEpochs` block; typeLabels/Symbols/Colors collapsed to basic/fusion | **not read** — cosmetic to us |

### 2a. Verified: `node.prerequisites` exists identically on both schemas

`nodes/fusion/prototype.json` (Ygg II) and `nodes/extra/prototype.json` (`main`) are byte-for-byte
identical except `type` (`fusion` vs `extra`), `updatedAt`, and one **additive** timeline entry
(`type_change … metaEpoch: yggdrasil-ii, migrationBatch: yggdrasil-ii@2026-07-16`). Both carry
`"prerequisites": ["code-generation","code-execution"]`. Sampled across tiers: **0 of 113 basic
nodes have any prerequisites; all 130 fusion nodes have ≥2** (see §5 distribution). This confirms
`prerequisites` is not new to Yggdrasil II and is a faithful, native recipe source.

### 2b. Verified: schema/meta diffs are irrelevant or additive for our reader

- `skill.schema.json`: only breaking change to us is the `type` enum + dir consolidation (already
  handled by reading `nodes/fusion/`). The prereq-count conditionals changed shape but we never
  validated against them. Timeline `metaEpoch`/`migrationBatch` are additive and unread.
- `namedSkill.schema.json`: **purely additive** (`metaEpoch`/`migrationBatch` inside timeline
  entries). Our frontmatter reader picks only specific top-level keys, so extra nested keys are
  ignored. **Confirmed non-breaking.**
- `meta.json`: `levelLabels` renames, `evidenceFloors` removal, `types`/`typeLabels`/`typeColors`
  reshape, new `metaEpochs`. **We do not read `meta.json` at all** → zero impact. Noted only so a
  future reader isn't surprised.
- `metaEpoch`/`migrationBatch` were confirmed to appear **only inside timeline/changelog array
  entries**, never as top-level node or named-skill frontmatter fields we consume.

---

## 3. The `prerequisites`-derived recipe design (the heart of v2)

### 3a. What `combinations.md` uniquely provided, and whether anything is lost

The v1 parser used exactly four things from each `combinations.md` row:
`result slug`, `contributor`, `named slug`, and `prereq display-names`. Columns it **ignored**:
`Class`, `Top ★`, `Conditions`. The recipe `emoji` came from `emoji-map.json` / `EMOJI_DEFAULTS`;
the `blurb` was generated (`"Fuse /a + /b to unlock /c."`). So:

| combinations.md column | Used by v1? | Recovered in v2? |
|---|---|---|
| Prerequisites (display names) | yes (resolved to slugs) | **yes — directly, already slugs** in `node.prerequisites` (no name→slug resolution needed) |
| Result contributor + named slug | yes | **yes — via genericSkillRef reverse-map** (§3c) |
| `Class` (Extra/Ultimate) | no | n/a (node `type` available anyway) |
| `Top ★` (level) | no | available via named-index `lvl` if ever wanted |
| `Conditions` (free text) | no | not in node JSON; unused → no loss |
| emoji / blurb | not from md | unchanged (emoji-map + generated blurb) |

**Conclusion: nothing the sync actually consumed is lost.** v2 even *removes* a fragile step —
the v1 name→slug fuzzy resolution of prereq display strings — because `node.prerequisites` is
already canonical slugs.

### 3b. Recipe result/slug/contributor — the faithful mapping (decision: reverse-map)

Downstream contract (`app/labs/infinite-skill-craft/api/fuse/route.ts` L530–551):

- `recipe.result` → the displayed fused-skill name.
- `recipe.slug` → passed to `lookupNamedSkill(recipe.slug)` (named-index is keyed by **named
  slug**) **and** to `skillTreeUrl(contributor, slug)`.
- `recipe.contributor` → the deep-link handle.

So `slug`/`contributor` must be the **named skill's** slug/handle, not the generic node id, or the
deep-link + named lookup break. The generic fusion node has **no** contributor of its own
(`prototype.json` has no contributor field). We recover the named linkage that `combinations.md`
used to spell out, via the **`genericSkillRef` reverse-map**.

Two design options were considered:

- **Option A — `result = node.id`** (honest generic id, e.g. `advanced-swarm-coordination`).
  Rejected as primary: it changes every `result` value, breaks the hardcoded `recipes.test.ts`
  assertions, and shows players a generic id instead of the attributed skill.
- **Option B — `result = reverse-mapped named slug when one exists, else `node.id`** (chosen).
  Reproduces the current `recipes.json` `result` values, keeps `recipes.test.ts` green, and
  matches the old `combinations.md` semantics (result = the attributed named skill when there is
  one). This is the design v2 adopts.

Per fusion node `N` with `prereqs = N.prerequisites`:

```
named = reverseMap(N.id)              // §3c — the named skill whose genericSkillRef === N.id
result      = named ? named.slug : N.id
slug        = named ? named.slug : N.id
contributor = named ? named.contributor : undefined   // omitted when absent
emoji       = getEmoji(slug)          // emoji-map.json → EMOJI_DEFAULTS → ✨  (unchanged)
blurb       = `Fuse /${p0} + /${p1} … to unlock /${result}.`  (unchanged generator)
if prereqs.length === 2 → Recipe    { pairKey: pairKey(p0,p1), result, emoji, blurb, contributor?, slug? }
if prereqs.length >= 3  → MultiPrereqRecipe { pairKey:'', result, emoji, blurb, prereqs, contributor?, slug? }
if prereqs.length <  2  → skip + warn (0 such nodes today; Ygg II schema now permits fusion w/ 1 prereq)
```

**Verified against the two `recipes.test.ts` fixtures (both `origin:true`, single-ref → stable):**

| Fused pair | Fusion node id | Reverse-map pick | v2 `result` / `contributor` / `slug` | test |
|---|---|---|---|---|
| `api-call + tool-use` | `cloud-platform-management` | `ruvnet/flow-nexus-platform` [origin] | `flow-nexus-platform` / `ruvnet` / `flow-nexus-platform` | **passes** |
| `multi-agent-debate + swarm-topology-management` | `advanced-swarm-coordination` | `ruvnet/swarm-advanced` [origin] | `swarm-advanced` / `ruvnet` / (slug `swarm-advanced`) | **passes** |

Note the fusion node id (`cloud-platform-management`) differs from the result (`flow-nexus-platform`):
that is exactly why Option A would break the test and Option B does not.

### 3c. The `genericSkillRef` reverse-map (recovers contributor/slug)

Named skills declare `genericSkillRef: <fusion-node-id>` in frontmatter (verified:
`mattpocock/handoff → agent-handoff`, `ruvnet/swarm-advanced → advanced-swarm-coordination`,
`ruvnet/flow-nexus-platform → cloud-platform-management`). Build a map
`genericSkillRef → {contributor, slug}` by walking the **same** deterministic `named/` file list
already produced for the named index (contributor asc, then slug asc). **Collision tie-break
(38 fusion nodes have ≥2 named refs): prefer `origin: true`, then first in walk order** — identical
policy to `buildNamedIndex`'s slug-collision rule, so the two can never disagree.

Measured coverage on `dev/yggdrasil-ii-staging`:

- 280 named `.md` files → 153 distinct `genericSkillRef` values, **0 dangling**.
- **84 / 130** fusion nodes have ≥1 named ref (→ get a contributor); 46 are pure-generic (contributor omitted, `slug = node.id`).
- 38 of the 84 have multiple named refs → resolved deterministically by the tie-break.
- 69 `genericSkillRef`s point at **basic** nodes (named skills mapping to basic tier) — correctly
  irrelevant to recipes since basic nodes have no prerequisites.

### 3d. pairKey collisions among 2-prereq fusion nodes

57 fusion nodes have exactly 2 prerequisites → **55 distinct pairKeys; 2 collisions**:

- `api-call+data-visualize` → `collaborative-diagramming`, `generative-media`
- `context-compression+retrieve` → `memory-manage`, `personal-knowledge-management`

`getRecipeMap()` already dedupes by pairKey (last-write-wins). To make the winner **deterministic**,
emit 2-input recipes in sorted node-id order and document that the alphabetically-later node id
loses the pairKey. (This mirrors v1, where duplicate `combinations.md` rows also collapsed at map
build.) All 57 are still written to the array; only the in-memory lookup dedupes.

---

## 4. `sync-skill-tree.ts` — function-by-function redesign

| Function | v1 (combinations.md) | v2 (Yggdrasil II / prerequisites) |
|---|---|---|
| `loadNodes()` | iterate `basic, extra, unique, ultimate` | iterate **`basic, fusion`**; `SkillEntry.type: 'basic' \| 'fusion'`; still `{id, name:'/'+id, displayName, type}`. See §4a on adaptive vs hardcoded. |
| `parseCombinations()` | parse `combinations.md` table rows | **deleted.** |
| new `buildGenericRefMap(namedFiles)` | — | build `genericSkillRef → {contributor, slug}` from the shared named walk with origin/alpha tie-break (§3c). |
| new `deriveRecipes(nodes, genericRefMap)` | — | iterate fusion nodes; emit `Recipe` (2 prereqs) / `MultiPrereqRecipe` (≥3); result/slug/contributor per §3b; skip <2 with warn. |
| `buildNameIndex` / `toSlug` | resolve prereq display-names → slugs | **deleted** — `node.prerequisites` are already slugs. |
| `loadEmojiMap` / `getEmoji` / `makeBlurb` | as-is | **unchanged.** |
| `listNamedSkillFiles` / `parseFrontmatter` / `buildNamedIndex` / `buildContributorRoster` | as-is | **unchanged** (re-verified §5). |
| `assertRegistryShape()` | old floors + combinations floor | **redesigned** — §6. |
| `main()` | load → parseCombinations → nameIndex → recipes | load → namedFiles → genericRefMap → deriveRecipes → namedIndex/roster → assert → write. Same 4 output files, same shapes. |

Header comment block ("Registry schema assumptions") must be rewritten for the Yggdrasil II layout
and the `combinations.md`-independence noted prominently.

### 4a. `loadNodes()` — adaptive vs hardcoded

Recommendation: **hardcode the new `basic + fusion` layout**, with a small **defensive touch**: if
`nodes/fusion/` is absent but `nodes/extra/` exists, `assertRegistryShape()` should abort with an
explicit "pre-Yggdrasil-II layout detected — this branch targets the post-#1185 schema; do not run
against old `main`" message rather than silently producing 113-node output. Given the explicit
"don't merge until #1185 lands" gate, a *dual-layout* loader (reading extra/ultimate **and** fusion)
is not worth the complexity — but the **guard** that names the mismatch loudly is worth the ~3 lines
(it prevents a confusing near-empty regen if the workflow runs a beat too early). Optionally the
loader may also read `unique/` if it ever materializes (0 files today, absent in Ygg II).

---

## 5. Named-skill index remap — carried forward, re-verified on Yggdrasil II

The named-index build is the actual fix for the `235 → 0` regression and is **unchanged** from v1.
Re-verified against `/workspace/gaia-skill-tree-yggdrasil-ii`:

- `registry/named/<contributor>/<slug>.md` frontmatter contract intact (id, name, contributor,
  genericSkillRef, description, level, title, status, origin). **280 `.md` files** across 51
  contributor dirs.
- Canaries hold: `named/garrytan/scrape.md` → `contributor: garrytan`, `genericSkillRef: web-scrape`;
  `named/garrytan/design-html.md` → `contributor: garrytan`.
- The additive `metaEpoch`/`migrationBatch` fields live only inside timeline entries and do not
  perturb the top-level frontmatter our reader consumes.

`buildContributorRoster` (Builders "Pokédex") is likewise unchanged — same `named/` walk, 280 files.

---

## 6. Sanity gate (`assertRegistryShape`) — redesigned with observed numbers

All floors below are re-derived from `dev/yggdrasil-ii-staging` observations (with margin), **not**
carried over blindly:

| Assertion | Observed (Ygg II) | Floor to enforce | Rationale |
|---|---|---|---|
| total nodes (basic+fusion) | 243 | `>= 220` | basic 113 + fusion 130; catches a dropped dir |
| fusion nodes present | 130 | `>= 100` | catches `nodes/fusion/` vanishing/renaming |
| basic nodes present | 113 | `>= 100` | catches basic dir loss |
| 2-input recipes | 57 (55 distinct pairKeys) | `>= 45` | catches prerequisites read breaking |
| multi (≥3) recipes | 73 | `>= 50` | catches multi-prereq loss |
| fusion nodes with a named ref | 84 | `>= 60` | catches genericSkillRef reverse-map breaking |
| named `.md` files | 280 | `>= 250` (v1 used ≥200) | catches named/ layout change |
| pre-migration layout guard | `nodes/fusion/` present | abort if only `extra/ultimate` found | §4a — names the mismatch loudly |
| canary `scrape` | contributor `garrytan` | must hold | named schema canary |
| canary `design-html` | contributor `garrytan` | must hold | named schema canary |
| **new** recipe canary A | `api-call+tool-use` → result `flow-nexus-platform`, contributor `ruvnet` | must hold | proves reverse-map + prereq read end-to-end |
| **new** recipe canary B | `multi-agent-debate+swarm-topology-management` → result `swarm-advanced`, contributor `ruvnet` | must hold | second end-to-end canary |
| named-count regression | prev committed count | abort on >50% drop unless `FORCE_RESYNC=1` | carried from v1 (the `235 → 0` trap) |

The gate still runs **before any `writeFileSync`** and throws (non-zero exit) so a broken read never
silently regenerates near-empty data.

---

## 7. Scheduled resync workflow — re-verified, no special-casing needed

The v1 GitHub Actions resync workflow (checks out the sibling gaia-skill-tree registry, runs the
sync via `GAIA_SKILL_TREE_REGISTRY`, opens a PR on drift) remains valid. **Flag:** it checks out
gaia-skill-tree's default branch. Today that is old-schema `main` — so if this workflow ran against
`main` *before* #1185 merges, the §4a pre-migration guard would (correctly) abort. **Once
gaia-skill-tree PR #1185 merges into `main`, the checkout naturally starts pulling the Yggdrasil II
schema with no workflow change required.** No branch pinning or special-casing should be added; the
guard is the safety net during the interim. (If desired, the workflow can be left disabled or
pinned to `dev/yggdrasil-ii-staging` purely for pre-merge dry-runs, but that pin **must be reverted
to the default branch** as part of landing.)

---

## 8. Landing sequence — GATED, do not merge early

This branch (`epic-89/85-repair-registry-sync-yggdrasil2`) targets the epic integration branch
**`epic-89/full-registry-discoverability`** (not `staging` directly, not the old parked branch). Its
PR **must stay in DRAFT** and **must not merge** until **both**:

1. **gaia-skill-tree PR #1185 has actually merged into gaia-skill-tree `main`** (the new, additional
   gate introduced by this pivot — the epic's final landing into gaia-research `staging` is gated on
   this), **and**
2. **A human has reviewed the regenerated data diff** against the **real post-merge** registry
   (`data/craft/{skills,recipes,named-index,contributors}.json`) — the original #85 gate, now checked
   against the Yggdrasil II output rather than the old schema's.

**Provisional-testing caveat:** everything in this plan was measured against
`dev/yggdrasil-ii-staging` at commit `b572c7d`, which is **still a draft** and per PR #1185's own
description "still hosts the second half of the sprint" — it can change before it lands. Therefore
the implementation must be **re-run and re-verified against gaia-skill-tree's actual `main`** once
#1185 merges; the numbers in §3/§5/§6 are pre-merge estimates to be reconfirmed, not final truth.
The sanity-gate floors were deliberately set with margin so minor pre-merge churn does not falsely
trip them, but the canaries (§6) must be re-checked against the merged registry.

Order of operations at landing time:
1. gaia-skill-tree #1185 merges → gaia-skill-tree `main` is Yggdrasil II.
2. Re-run `npx tsx scripts/craft/sync-skill-tree.ts` against the real merged `main`.
3. Confirm §6 canaries + counts on the real output; run `lib/craft` tests + `visual-audit` if UI-touching.
4. Human reviews the `data/craft/*.json` diff.
5. Mark the PR ready, merge into `epic-89/full-registry-discoverability`; the epic then lands into `staging`.

---

## 9. Test impact — `lib/craft/*.test.ts`

| Suite | Coupled to registry data? | v2 outcome |
|---|---|---|
| `recipes.test.ts` | yes — `api-call+tool-use → flow-nexus-platform/ruvnet`; `multi-agent-debate+swarm-topology-management → swarm-advanced/ruvnet`; `skillTreeUrl` cases | **green** — both fixtures verified to reproduce under the reverse-map (§3b). `skillTreeUrl`/`loadRecipes` shape tests are data-agnostic. |
| `named-index.test.ts` | yes — `scrape`/`design-html → garrytan` + fields | **green** — canaries re-verified on Ygg II (§5). |
| `types.test.ts` | line 62 references pairKey `api-call+tool-use` from recipes.json | **green** — that pairKey still exists (node `cloud-platform-management`). |
| `contributors.test.ts` | roster invariants (`keys === total`), no hardcoded handle counts | **green** — same `named/` walk, 280 files. |
| `curses.test.ts`, `easter-eggs.test.ts`, `prompt.test.ts`, `telemetry.test.ts`, `similarity-shim.test.ts`, `starter-recipes.test.ts` | no / structural only | **green** — independent of registry sync content. |

No test edits are expected to be *required* by v2 (the chosen Option B preserves the two hardcoded
result values). If the human data-diff review after #1185 merges reveals the real merged registry
shifted a fixture (e.g. the origin flag on `ruvnet/flow-nexus-platform` changed), update the two
`recipes.test.ts` expectations and the header docstring to the new ground truth — but that is a
re-verification contingency, not a planned change.

---

## 10. Before → after counts (spot-checkable)

| Output | Current committed | v2 against Ygg II (estimated) |
|---|---|---|
| `skills.json` node entries | 243 (113 basic + 130 fusion, via v1 already) | 243 (113 basic + 130 fusion) |
| `recipes.json` total | 129 | ~130 (57 two-input + 73 multi) |
| — 2-input | 57 | 57 (55 distinct pairKeys) |
| — multi (≥3) | 72 | 73 |
| recipes with contributor | 68 | ~84-max (fusion nodes with a named ref) |
| `named-index.json` skills | ~ derived from 280 files | derived from 280 files |
| `contributors.json` total | — | derived from 280-file walk |

---

## 11. Implementation checklist (maps to DoD)

- [ ] Rewrite header "Registry schema assumptions" block for Yggdrasil II; note `combinations.md`-independence.
- [ ] `loadNodes()` → `basic + fusion`; `type: 'basic' | 'fusion'`.
- [ ] Delete `parseCombinations`, `buildNameIndex`, `toSlug`.
- [ ] Add `buildGenericRefMap()` (origin/alpha tie-break) sharing the `listNamedSkillFiles()` walk.
- [ ] Add `deriveRecipes()` from `node.prerequisites` (Option B result/slug/contributor; skip <2 with warn; deterministic 2-input ordering for pairKey collisions).
- [ ] Keep `loadEmojiMap`/`getEmoji`/`makeBlurb`, named-index + roster builders unchanged.
- [ ] Redesign `assertRegistryShape()` with §6 floors, the pre-migration layout guard, and the two new recipe canaries.
- [ ] Re-verify resync workflow needs no change post-merge; keep §4a guard as interim safety.
- [ ] Keep PR **draft**; do not merge until gaia-skill-tree #1185 merges **and** human reviews the real data diff (§8).
- [ ] After #1185 merges: re-run sync against real `main`, reconfirm §6 canaries/counts, run `lib/craft` tests.
