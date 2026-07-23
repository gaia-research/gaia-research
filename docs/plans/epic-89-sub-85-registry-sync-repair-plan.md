# Epic #89 · Sub-issue #85 — Repair `gaia-skill-tree` registry sync

**Status:** PLAN (implementation not started)
**Target branch:** `epic-89/85-repair-registry-sync` → PR into **`staging`** (never `main`).
**Author:** planning pass (step 1 of 4)
**Grounded against:** live `gaia-skill-tree` @ `v6.8.16` (commit `61867a3`), read-only checkout at `/workspace/gaia-skill-tree`.

---

## 0. TL;DR — the issue's premise is only 1/3 correct

The issue describes three severed reads. **I verified all three against the live registry, and only one is actually broken.** Do not implement blindly from the issue text — implement from what the registry actually is today.

| Issue #85 claim | Reality on the live checkout (`v6.8.16`) | Verdict |
|---|---|---|
| `nodes/{basic,extra,ultimate}` migrated to `{basic,fusion}` under "Yggdrasil II" | `registry/nodes/` still holds `basic/` (113), `extra/` (125), `ultimate/` (5). The skill-type enum in `registry/schema/skill.schema.json` is `basic \| extra \| unique \| ultimate`. **There is no `fusion` type anywhere.** The string "Yggdrasil" does not appear in `META.md`. `loadNodes()` still works. | **FALSE** |
| `combinations.md` reshaped/empty → parser returns 0 rows | `registry/combinations.md` is intact (130 data rows), same table shape the parser already expects: `\| ◇ [contrib](../docs/u/contrib/)/slug \| Extra Skill \| Prereq A, Prereq B \| ★ \| Conditions \|`. `parseCombinations()` still works. | **FALSE** |
| `registry/named-skills.json` deleted; skill data moved to `registry/named/<contributor>/<slug>.md` (+ `registry/real-skills.json`) | Correct. `named-skills.json` is **gone**. `registry/named/` now holds **280 `.md` files across 50 contributor dirs**. `registry/real-skills.json` also exists but is a *different, staler* artifact (see §2). | **TRUE** |

**So the only genuinely severed pipe is the named-skill reader.** `buildNamedIndex()` and `buildContributorRoster()` both open `REGISTRY_ROOT/named-skills.json`, hit the `fs.existsSync(...) === false` guard, print a `⚠` warning, and **return empty** — which is exactly the silent near-empty regeneration the issue warns about:

- `data/craft/named-index.json`: **213 skills → 0**
- `data/craft/contributors.json`: **37 contributors → 0**

`skills.json` and `recipes.json` would still regenerate fine on this checkout (they'd even grow slightly), so the "235 → 113" number in the issue is not what happens here. The real damage is a **total wipe of the named-skill and contributor data**, not a partial shrink.

> **Implementer: re-verify §0 with a fresh read of `/workspace/gaia-skill-tree/registry` before you start.** The checkout may advance between planning and implementation. The sanity assertions in §5 are designed so that *whichever* of these three ever breaks fails loudly instead of silently.

---

## 1. Files in play

**gaia-research (this repo):**
- `scripts/craft/sync-skill-tree.ts` — the sync script. The thing we fix.
- `data/craft/{skills,recipes,named-index,contributors}.json` — generated output (cached snapshot, `generatedAt: 2026-07-12`).
- `data/craft/emoji-map.json` — hand-maintained; **not** regenerated. Leave as-is.
- `lib/craft/named-index.ts` + `.test.ts` — consumer + tests over `named-index.json`.
- `lib/craft/contributors.ts` + `.test.ts` — consumer + tests over `contributors.json`.
- `lib/craft/recipes.ts` + `.test.ts` — consumer + tests over `recipes.json`.
- `lib/craft/types.ts` — frozen `Recipe` type + `pairKey()`.
- `lib/craft/starter-recipes.ts` — hand-authored, does NOT dynamically consume `skills.json`'s `type` field (safe).
- `.github/workflows/craft-ci.yml` — existing PR-triggered test workflow (Node 22).

**gaia-skill-tree (sibling, READ-ONLY — never write here, ecosystem boundary per CLAUDE.md):**
- `registry/named/<contributor>/<slug>.md` — **NEW authoritative named-skill source** (YAML frontmatter).
- `registry/schema/namedSkill.schema.json` — the frontmatter contract.
- `registry/nodes/{basic,extra,ultimate}/*.json` — generic skill nodes (unchanged).
- `registry/combinations.md` — fusion recipes (unchanged shape).
- `registry/real-skills.json` — secondary source catalog (see §2 — do NOT use as primary).

---

## 2. Authoritative source decision (the single most important call)

**Named skills come from `registry/named/<contributor>/<slug>.md` frontmatter — NOT from `real-skills.json`.**

Rationale, grounded in direct reads:

| Candidate | Count | `generatedAt` / freshness | What it actually is |
|---|---|---|---|
| `registry/named/**/*.md` | **280 files / 50 contributors** | frontmatter `updatedAt` up to `2026-06-21` and later | The live named-skill registry. Each file's frontmatter *is* the record. |
| `registry/real-skills.json` | 196 `items` | `generatedAt: 2026-05-19` | A **source-repo catalog** (`items[].promotedNamedSkillId`, `mapsToGaia`, `sourceRepo`). Staler, fewer entries, and a *provenance* index rather than the named registry. |

Using `real-skills.json` would ship **84 fewer** named skills and month-old data — re-introducing the exact staleness this issue exists to kill. The `.md` frontmatter is fresher, complete, and schema-validated (`namedSkill.schema.json`).

### Frontmatter contract (from `namedSkill.schema.json`, confirmed against real files)

Required: `id` (`contributor/slug`), `name`, `contributor`, `origin` (bool), `genericSkillRef`, `status` (`awakened|named`), `level` (`1★..6★`), `description`, `createdAt`, `updatedAt`.
Optional: `title` (reviewer epithet; only on `status: named`), `catalogRef`, `links`, `tags`, `suiteRef`, `suiteComponents`, `evidence`, `timeline`, …

Sample (`named/garrytan/scrape.md`):
```yaml
id: garrytan/scrape
name: Scrape
contributor: garrytan
genericSkillRef: web-scrape
status: named
title: Gstack Scrape — Structured Web Extraction
level: 2★
description: Fetches target URLs with a headless browser, parses structured data …
```

---

## 3. Old → new schema mapping

### 3a. Named-skill record (the actual fix)

Emitted record shape in `named-index.json` is **unchanged** (`{ c, t, g?, d, lvl? }` keyed by bare slug). Only the *source read* changes.

| `named-index.json` field | OLD source (`named-skills.json`) | NEW source (`named/<c>/<slug>.md` frontmatter) |
|---|---|---|
| *(map key)* slug | `entry.id.split('/')[1]` | filename basename **or** `fm.id.split('/')[1]` (must agree; assert) |
| `c` (contributor) | `entry.contributor ?? id-prefix` | `fm.contributor` (fallback: dir name / id-prefix) |
| `t` (title) | `entry.title` → clamp 120 | `fm.title` → fallback `fm.name` → fallback slug, clamp 120 |
| `d` (description) | `entry.description` → clamp 260 | `fm.description` → clamp 260 |
| `g` (genericSkillRef) | `entry.genericSkillRef` → clamp 60 | `fm.genericSkillRef` → clamp 60 |
| `lvl` (level) | `entry.level` → clamp 8 | `fm.level` (`"2★"`) → clamp 8 |
| `slugToContributor[slug]` | derived | derived (same) |
| `unlinkedSlugs[]` | redacted `████████` entries | none from `.md` (no redacted dirs exist); keep the field, emit `[]` |

**Iteration source:** OLD = `parsed.buckets[bucket][]` (bucketed by generic skill). NEW = walk `registry/named/`, sorted contributor dirs, then sorted `*.md` files (deterministic), parse YAML frontmatter of each.

### 3b. Nodes & combinations (NOT broken — leave the reads, harden the guards)

- `loadNodes()`: keep reading `basic`/`extra`/`ultimate`. **Add `unique`** to the tier list and to `SkillEntry['type']` for forward-compat (no `unique/` dir exists yet, so it's a no-op today but future-proof; the `unique` type IS in the upstream schema enum). Do **not** invent a `fusion` tier — it does not exist upstream.
- `parseCombinations()`: no change needed. Shape is intact.

---

## 4. `sync-skill-tree.ts` remap — function by function

> Keep it a single `tsx` script (repo convention). No new deps beyond a YAML parser.

1. **Config block (top of file)**
   - Replace the hardcoded 6-levels-up `REGISTRY_ROOT` with an **env-overridable** resolver so CI can point at an arbitrary sibling clone:
     ```
     const REGISTRY_ROOT = process.env.GAIA_SKILL_TREE_REGISTRY
       ?? path.resolve(__dirname, '../../../../../../gaia-skill-tree/registry');
     ```
   - This is required for the scheduled workflow (§6) — the CI clone will not sit at the same relative depth as a local worktree.

2. **YAML parsing** — add a frontmatter parser. `js-yaml` is the low-risk choice. Per this repo's Node contract (CLAUDE.md), add it as an explicit `dependency` (or `devDependency`) and regenerate `package-lock.json` with `npm install` (npm 11 local) so both npm 10/11 resolve it. Helper: `parseFrontmatter(raw): Record<string, unknown>` that slices the `---` … `---` block and `yaml.load`s it.

3. **`loadNodes()`** — add `'unique'` to the `tiers` array and widen `SkillEntry['type']` to `'basic' | 'extra' | 'unique' | 'ultimate'`. Otherwise unchanged. Add a post-load assertion (see §5).

4. **`parseCombinations()`** — unchanged logic. Add a post-parse assertion (see §5).

5. **`buildNamedIndex()`** — **rewrite the source read only**:
   - Replace `named-skills.json` open with a directory walk of `REGISTRY_ROOT/named`.
   - For each `<contributor>/<slug>.md`: parse frontmatter → build the `{ c, t, g?, d, lvl? }` record exactly as today via the existing `cleanText()` clamps.
   - `slug` = filename basename; assert it equals `fm.id.split('/')[1]` when `fm.id` present.
   - Keep `cleanText`, `isRedacted`, first-write-wins-on-slug-collision, and the `unlinkedSlugs` field.
   - **Collision policy:** deterministic sort (contributor asc, then slug asc). On the 2 known collisions (`ship` → garrytan/gsd-build, `gaia-triage` → mbtiongson1/gaiabot) prefer `origin: true`, else first alphabetically. Loser still appears in the index under its other slugs, so no contributor is lost (verified — see §7).

6. **`buildContributorRoster()`** — same source swap: walk `named/`, count **one per `.md` file** per contributor (matches the old "every authored entry" semantic → `sum(count) === file count`). Skip redacted (none exist in dirs, but keep the guard). Do **not** dedupe by slug here (the index dedupes; the roster counts authored files — the contributors test relies on `sum ≥ distinct-slug count`).

7. **Factor the walk** — both `buildNamedIndex` and `buildContributorRoster` should share one `listNamedSkillFiles(): {contributor, slug, frontmatter}[]` helper so they can't drift.

8. **`main()`** — unchanged control flow; add the sanity gate (§5) *before* any `writeFileSync`, so a broken read aborts with a non-zero exit instead of writing empty files.

Everything else (`buildNameIndex`, `toSlug`, emoji, `makeBlurb`, recipe assembly, output writers) is untouched.

---

## 5. Sanity assertions — fail loudly, never write near-empty (DoD item 4)

Add a `assertRegistryShape()` gate in `main()` that runs after loading and **throws (exit ≠ 0) before writing** if any assumption is violated. This is the core anti-silent-drift mechanism.

```
// Node layout still present
assert(nodes.length >= 200, 'node layout changed: expected ≥200 nodes, got N — check registry/nodes/*');
// Combinations still parseable
assert(twoInputRecipes >= 30, 'combinations.md shape changed: <30 2-input recipes parsed');
// Named-skill source still present & non-trivial
assert(namedFiles.length >= 200, 'named/ layout changed or missing: expected ≥200 .md, got N');
// Canary fixtures the tests depend on
assert(index.skills['scrape']?.c === 'garrytan', 'canary "scrape" missing — named schema changed');
assert(index.skills['design-html']?.c === 'garrytan', 'canary "design-html" missing');
// Regression guard vs the currently-cached snapshot (the "235→113" trap)
//   read existing data/craft/named-index.json count; refuse if the new count
//   drops below 50% of it, unless FORCE_RESYNC=1.
assert(newNamedCount >= 0.5 * prevNamedCount || process.env.FORCE_RESYNC, 'named count collapsed …');
```

Thresholds are floors, not exact counts (upstream grows). The **delta guard** (last assertion) is what would have caught the original wipe: it compares against the committed snapshot and aborts on a cliff. Document these assumptions in a header comment block in `sync-skill-tree.ts` (DoD item 4) **and** add a short "Registry schema assumptions (as of gaia-skill-tree vX)" note to this repo's `CLAUDE.md` so the next migration is easy to spot.

---

## 6. Scheduled resync workflow (DoD item 2)

New file: `.github/workflows/craft-registry-resync.yml`. **Opens a PR, never commits to a protected branch.**

```yaml
name: craft-registry-resync
on:
  schedule:
    - cron: '17 6 * * *'      # daily 06:17 UTC (off the top of the hour)
  workflow_dispatch: {}        # manual trigger for the first human-reviewed run
permissions:
  contents: write              # push the resync branch
  pull-requests: write         # open the PR
jobs:
  resync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { ref: staging }                     # base the diff on staging, not main
      - name: Checkout gaia-skill-tree (read-only)
        uses: actions/checkout@v4
        with:
          repository: <org>/gaia-skill-tree
          ref: main
          path: _skilltree
          token: ${{ secrets.GAIA_SKILL_TREE_RO_TOKEN }}   # PAT/App with READ on the sibling
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - name: Regenerate craft data
        env:
          GAIA_SKILL_TREE_REGISTRY: ${{ github.workspace }}/_skilltree/registry
        run: npx tsx scripts/craft/sync-skill-tree.ts     # sanity gate aborts the job on drift
      - name: Gate — tests must pass on regenerated data
        run: npm run test
      - name: Open PR if data drifted
        uses: peter-evans/create-pull-request@v6
        with:
          base: staging
          branch: chore/registry-resync
          add-paths: data/craft/**
          commit-message: 'chore(craft): resync skill-tree registry snapshot'
          title: 'chore(craft): registry resync (automated)'
          body: |
            Automated resync of data/craft/* from the live gaia-skill-tree registry.
            ⚠️ HUMAN GATE: review the data diff by hand before merge (see epic #89 / #85).
          labels: automated, registry-sync
```

Design notes for the implementer:
- **PR not commit:** `peter-evans/create-pull-request` pushes to a side branch and opens/updates a PR. If `data/craft/**` is unchanged the action no-ops (no PR) — so it only surfaces real drift. This satisfies "never auto-commit to main."
- **Sibling access:** `gaia-skill-tree` is a separate repo; the default `GITHUB_TOKEN` can't read it. Needs a read-only PAT or GitHub App install stored as `GAIA_SKILL_TREE_RO_TOKEN`. If that secret can't be provisioned, fallback = `gh api` tarball or `git clone` of the public registry path; document whichever is chosen. **Never push to the sibling** (ecosystem boundary).
- **Fill in `<org>`** — confirm the sibling's actual owner/name at implementation time.
- **CI-on-PR caveat:** PRs opened by `GITHUB_TOKEN` don't themselves trigger `craft-ci.yml`. Either use a PAT as the create-pull-request `token:` so `craft-ci` runs on the resync PR, or note that the human reviewer must re-run CI. Recommend the PAT.
- **Test gate before PR:** running `npm run test` in the job means a resync that breaks the fixtures fails the job loudly rather than opening a green-looking PR with bad data.

---

## 7. Test impact — all four data-coupled suites survive (DoD item 3)

Verified the fixtures against the live `.md` frontmatter and `combinations.md`:

| Suite | Fixture it hardcodes | Live-registry reality | Result |
|---|---|---|---|
| `named-index.test.ts` | `scrape` → garrytan, title **"Gstack Scrape — Structured Web Extraction"**, `genericSkillRef: web-scrape`, level set | `named/garrytan/scrape.md` frontmatter matches **exactly** | ✅ pass |
| `named-index.test.ts` | `design-html` → garrytan, title **"Design to Production HTML"** | `named/garrytan/design-html.md` matches exactly | ✅ pass |
| `recipes.test.ts` | `api-call+tool-use` → `flow-nexus-platform` / ruvnet; `multi-agent-debate+swarm-topology-management` → `swarm-advanced` / ruvnet | both rows present in `combinations.md` (2-input) | ✅ pass |
| `contributors.test.ts` | ruvnet is the **most prolific** builder, count > 1; garrytan count > 1; `sum(counts) ≥ distinct slugs` | ruvnet = **48 files** (max), garrytan = 47; 280 files ≥ 278 distinct slugs | ✅ pass |
| `contributors.test.ts` | every roster handle ∈ named-index contributors; no redacted handles | only 2 slug collisions, neither fully shadows a contributor; no `████████` dirs | ✅ pass |

Non-data suites (`starter-recipes`, `easter-eggs`, `curses`, `prompt`, `telemetry`, `similarity-shim`, `types`) are not coupled to the regenerated JSON. Implementer must still run the **full** `npm run test` + `npx tsc --noEmit` (widening `SkillEntry['type']` to include `unique` is the only type change).

---

## 8. Expected before → after counts (grounded, spot-checkable — DoD item 1)

| File | Before (cached, 2026-07-12) | After (this checkout, computed from live registry) |
|---|---|---|
| `skills.json` | 235 entries | **243** (113 basic + 125 extra + 5 ultimate) — *grows*, not "→113" |
| `recipes.json` | 129 total entries | **130 total** = 57 canonical 2-input (`pairKey`) + 73 multi (`pairKey: ""`) |
| `named-index.json` `.skills` | 213 | **278** distinct slugs (280 files − 2 collisions) |
| `contributors.json` `.total` | 37 | **50** contributors; `sum(count) === 280` |

Spot-checks the reviewer should run (not "didn't crash"):
- `named-index.json`: `scrape` and `design-html` present with the exact titles above.
- `contributors.json`: `ruvnet: 48`, `garrytan: 47`, `google-deepmind: 37`, `mattpocock: 34`.
- `skills.json`: 243 entries, all `type ∈ {basic,extra,ultimate}`.
- `recipes.json`: `api-call+tool-use` → `flow-nexus-platform`.

If the live checkout has advanced past `v6.8.16`, these exact numbers will shift — re-derive them, but they should move **up**, and the delta guard (§5) must not trip.

---

## 9. Human gate — DO NOT SKIP (non-negotiable)

This is the riskiest step in epic #89: a wrong schema mapping silently ships fake "verified real skills" to players. Two hard checkpoints the implementer must honor:

1. **First regenerated data diff is reviewed by a human, by hand, before merge.** Green CI is necessary but **not sufficient**. The PR into `staging` must be read by a person who eyeballs the `data/craft/*` diff (counts + a sample of named records) against the live registry. Call this out explicitly in the PR description.
2. **The scheduled workflow produces a PR, never a direct commit.** No unattended writes to `main`, `staging`, or the sibling registry. The `workflow_dispatch` manual trigger exists so the *first* automated run is human-initiated and human-reviewed before the daily cron is trusted.

---

## 10. Implementation checklist (maps to DoD)

- [ ] Re-verify §0 against a fresh read of `/workspace/gaia-skill-tree/registry` (checkout may have advanced).
- [ ] Add `js-yaml` dep; regenerate `package-lock.json` via `npm install`; keep `esbuild` pin per CLAUDE.md.
- [ ] `REGISTRY_ROOT` env-overridable (`GAIA_SKILL_TREE_REGISTRY`).
- [ ] Rewrite `buildNamedIndex()` + `buildContributorRoster()` to read `named/<c>/<slug>.md` frontmatter via a shared `listNamedSkillFiles()` walk.
- [ ] Widen node tiers/type to include `unique`.
- [ ] Add `assertRegistryShape()` gate (floors + canaries + delta guard) before any write.
- [ ] Document registry-schema assumptions in `sync-skill-tree.ts` header + a `CLAUDE.md` note.
- [ ] Run the script against `/workspace/gaia-skill-tree`; confirm counts ≈ §8.
- [ ] `npx tsc --noEmit` + `npm run test` green.
- [ ] Add `.github/workflows/craft-registry-resync.yml` (schedule + dispatch, PR-not-commit, read-only sibling token, test gate).
- [ ] Open PR into **`staging`** with the data diff; flag the **human review gate** (§9) in the PR body. Do **not** merge on green alone.
