# KC8 Scratchpad — recoverability anchor

**Read this file top to bottom before doing anything if you are resuming after a
cutoff.** Then check `git log --oneline -20` on this branch for the actual
committed state — this file is a log of intent and progress, git is ground
truth for what's actually landed.

## The task (skill-heaven issue #13, KC8 half — verbatim)

> KC8: Every public claim links to a reproducible benchmark record (B4).

B4 (`gaia-research/founder/RATIFICATION.md:86`, INVARIANT): "The ledger is
always on, the claim-discipline table binds all public copy, and no claim
ships ahead of its benchmark. A 'will not work' ledger is as first-class as a
'will work' one — verified negative findings are recorded with the same
rigor."

**Deliverable (Marco's instruction):** a page in the gaia-research research
ledger — i.e. under `content/reports/hh-benchmark/` (the existing pattern:
`m2-live-demo.md`, `methodology.md`, `r0-census.md`), rendered publicly via
the Next.js `app/research` route. Marco will view it with a local `next dev`
before anything merges — nothing merges without that human look.

## Mechanism already in this repo (read before reinventing anything)

- `scripts/hell-heaven-bench/ledger.ts` — append/validate the `hh-ledger/v1`
  JSONL ledger at `scripts/hell-heaven-bench/data/ledger.jsonl`.
- `scripts/hell-heaven-bench/check-claims.ts` — the actual provenance gate.
  Binds every token-context number / sha in gated docs to a committed ledger
  or census record, or requires the `‡` sigil for declared-uncommitted
  numbers. Default-scans `docs/labs/harness-capability-matrix.md` +
  `content/reports/hh-benchmark/m2-live-demo.md` — **the new deliverable page
  needs to be added to its scan set (or fenced + passed explicitly) to
  actually gate KC8's own claims.**
  Run: `npx tsx scripts/hell-heaven-bench/check-claims.ts [--file <md> ...]`
  Self-tests: `npx tsx scripts/hell-heaven-bench/check-claims.test.ts`
- `scripts/hell-heaven-bench/census.ts` — two-part-dose census (standing vs
  invocation), produces `content/reports/hh-benchmark/data/r0-census.json`.
- `scripts/hell-heaven-bench/README.md` — full methodology writeup, read this.
- Fence convention: `<!-- ledger-claims:begin -->` … `<!-- ledger-claims:end -->`
  around any region making ledger-backed claims; `‡` sigil for
  declared-uncommitted numbers.

## Known Arc I figures that will likely need ledger backing (starting list —
verify and expand, don't just trust this list)

- **F7**: product-floor's door costs +515 tok (20,176 vs 19,661). Measured on
  `claude 2.1.216`; every later Arc I probe is on `2.1.220`. **Marco ruled
  2026-07-30: lock this number as final, do NOT re-derive against 2.1.220** —
  version drift is accepted as harmless/expected here. Cite as-is; do not
  attempt a fresh measurement.
- KC4's clean-room composition: empty `--setting-sources` gives `[]` (true
  zero) for `floor`; `product-floor` gives `["doctor"]` (accepted residual,
  upstream harness limitation).
- Native baseline listing size / token cost (whatever the current recorded
  native comparison is — verify from skill-heaven's actual test/probe output,
  don't assume a number).
- Any KC1–KC6 claims already made in skill-heaven's README or docs that assert
  a specific measured number publicly.

**This list is a starting point for Stage 1's inventory, not the final scope.**
Stage 1's job includes finding what this list is missing.

## Pipeline (Marco's design, 2026-07-30)

1. **Plan** (Opus, max effort) — investigate, write the plan below under
   `## Plan`, high-level. Does not implement.
2. **Implement** (Opus, medium effort) — do the actual claim inventory + ledger
   record generation/validation + gap-closing so `check-claims.ts` passes
   against the target doc set. **Stops before authoring the final deliverable
   page.**
3. **Review** (Sonnet, high effort) — re-verify (rerun check-claims.ts, don't
   trust), write a verdict under `## Review — round N`.
4. **Iterate**: if not satisfied, back to step 2 with the review's specific
   feedback, repeat. Capped at 3 rounds — if still unsatisfied after 3, stop
   and escalate rather than loop forever.
5. **Deliverable** (Opus, low effort) — author the actual page, wire it into
   check-claims.ts's scan set, confirm it gates clean, open a PR (not merged).
6. **Human gate** — Marco reviews locally (`next dev`) and merges himself.

## Recoverability rules for every stage

- **Commit + push after every logical unit.** Never batch. A pushed commit
  survives a credit cutoff; a local commit does not.
- **Update the Progress Log below before you stop**, even mid-task — what you
  did, what's left, exact next command to run.
- Branch: `docs/kc8-benchmark-ledger`, off `gaia-research` `main` (`6b8db3d`).
  Push to `origin/docs/kc8-benchmark-ledger`.
- gaia-research **forbids squash merges** — this branch will merge via a merge
  commit when Marco says so. Not your call to merge it.

---

## Plan

*(Stage 1 — investigation + plan. No implementation done in this stage.)*

### 0. Baseline, verified read-only (2026-07-30)

Everything below was run, not assumed:

| Check | Result |
|---|---|
| `npx tsx scripts/hell-heaven-bench/check-claims.ts` (default set) | **PASS** — 2 docs (matrix, m2-live-demo) |
| `npx tsx scripts/hell-heaven-bench/ledger.ts validate` | **PASS** — 10 records |
| `npx tsx scripts/hell-heaven-bench/check-claims.test.ts` | **PASS** — 17/17 fixtures |
| `check-claims --file content/reports/hh-benchmark/r0-census.md` | **FAIL — 5** (9,384 · 14,498 · 9,453 · 597 · 10,376) |
| `check-claims --file content/blog/claude-5-system-prompt-shrink/post.md` | **FAIL — 2** (9,453 · 249) |
| `check-claims --file content/reports/hh-benchmark/methodology.md` | PASS (but not in the scan set) |
| `check-claims --file docs/skill-heaven/{VISION,MISSION}.md` | PASS (no numbers) |

**Three findings that shape the whole plan:**

1. **The gate's declared scope overclaims its actual scope.** `check-claims.ts`'s
   header says it checks "docs/labs/harness-capability-matrix.md +
   content/reports/hh-benchmark/\*.md by default"; `scripts/hell-heaven-bench/README.md`
   says "the hh-benchmark reports" (plural); the CI step is named "matrix M2 rows +
   hh-benchmark reports". `DEFAULT_DOCS` actually contains **one** report. Adding the
   others is not a no-op — `r0-census.md` fails 5. A provenance gate whose own scope
   statement overclaims is the exact defect class it was built to catch.
2. **A live public blog post carries an untraceable measured claim.**
   `content/blog/claude-5-system-prompt-shrink/post.md:53` ships "reduced the standing
   dose from 9,453 to 249 tokens—**97.4%**" on the live site (plus `page.tsx:169`
   "−97.4% standing dose"). Both numbers *are* in the committed census JSON
   (`h1Restatement.publishedStandingTokens`), but `buildEvidence()` only reads
   `contracts.records[]`, so the gate cannot trace them. This is the single loudest
   B4 violation currently public.
3. **There are three evidence classes but the gate reads two.** `ledger.jsonl` and
   `r0-census.json` are read; `scripts/hell-heaven-bench/harness-probes/runs/*.run.json`
   (`harness-probe/v1`, the committed reproducible-sandbox records) are **not**. Every
   listing-shaped finding (KC4's `["doctor"]`, codex 74→73, pi 0/15) lives there or
   nowhere, and none of it is a token number, so `check-claims` structurally cannot
   gate it.

### 1. Claim inventory — every public Arc I / Program 1 claim, and its evidence status

Dispositions: **A** = already record-backed · **B** = backfill a record · **C** =
declared gap (‡ / softened / named as unmeasured) · **W** = fixed by widening the
gate's evidence set · **X** = out of KC8 scope, stated as such.

#### Surface A — the live site (`research.gaiaskilltree.com`, this repo's `app/`)

| # | Claim as a reader sees it | Where | Evidence status today | Disposition |
|---|---|---|---|---|
| A1 | "top-five loadout reduced the standing dose from **9,453 to 249** tokens—**97.4%**" | `content/blog/claude-5-system-prompt-shrink/post.md:53`, `app/blog/.../page.tsx:169` | numbers committed in `r0-census.json` → `h1Restatement.publishedStandingTokens` **but unreadable by the gate** (verified FAIL ×2) | **W** — widen `buildEvidence`, fence the paragraph, add the file to the scan set |
| A2 | "Invoking Heaven **evicts every installed skill** from context and admits back **only the grilling-native ones**" | `app/page.tsx:82` | **contradicted twice.** (i) KC4 re-probe (claude 2.1.220, 2/2 byte-identical, 2026-07-30) shows curated's listing is `["doctor"]`, not empty; RATIFICATION **P8** rules `doctor` irreducible while the door is open, and rules absolute zero **internal-only, never public copy**. (ii) "grilling-native ones" rides gate (e), still **❓ UNVERIFIED**, on the authority of **D13, retired 2026-07-24**. Shipped **P6** curated admits *the user's own named skills*. | **C — must be softened.** No number, so the gate can never catch it; only the KC8 page + a copy fix can |
| A3 | "One step below vanilla." / "Cleaner than vanilla." | `app/page.tsx:81–82` | directionally supported by F7 (−28.9% off native) — which has **no ledger record** | **B** — link to the F7 records once backfilled |
| A4 | Context Diet "49,687 → 29,040 chars, 41.6%, ~5,161 tokens, 124/124 rules" | same blog post, L47–49 | own committed artifacts under `content/reports/context-diet-lab-001/` | **X** — different program; the KC8 page states the scope boundary rather than silently omitting it |
| A5 | `/research/hh-benchmark` method page (`methodology.md`) | rendered route | passes today, but **only by luck** — not in the scan set | **W** — sweep into the derived scan set |
| A6 | `/about` Skill Heaven card | `app/about/page.tsx:148–197` | no numbers; "the dose measured rather than guessed" is a method statement | **A** — clean, no action |

#### Surface B — gaia-research markdown (GitHub-readable, linked from the site)

| # | Claim | Where | Evidence status today | Disposition |
|---|---|---|---|---|
| B1 | floor **30,661** / curated **31,624** / **+963** / standing **227** / sha `14c4642…` | `m2-live-demo.md` (whole doc scanned) | **ledger records 9 & 10**; gate PASSES | **A** — the model case the KC8 page holds up |
| B2 | same pair, matrix M2 2.1.216 rows | `harness-capability-matrix.md:134–137` (fenced) | same records; PASSES | **A** |
| B3 | native **46,849 ‡**, delta **−16,188 ‡**, invocation **5,917 ‡** | `m2-live-demo.md` | correctly ‡-tagged; lives in gitignored `scripts/.hh-demo/` | **C** — already honest; cite as the reference use of ‡ |
| B4 | gate (a) ladder: ≈**25.2k** native · ≈**17.0k** floor · ≈**19.2–19.6k** scalpel · **+233** · **+68** · **+1,745** · ~**6k** | `harness-capability-matrix.md:261–306` | **entirely OUTSIDE the fence → not gated at all**; no committed records | **C** — workstation smoke from `gate-a-resume-recomposition.sh`, never committed. Extend the fence and ‡-tag, or leave outside and say so on the KC8 page. **Recommend: ‡ inside an extended fence** |
| B5 | gate (c) self-dose ≈**57 tok** (31 + 26); door command **24 tok** (28 prefixed) | matrix L386–390; skill-heaven `claude-heaven/README.md` | chars4 over *draft* copy, never committed | **C** — ‡, and label "draft copy, re-priced at WS4" |
| B6 | census: **8,919** standing · **88,416** invocation · **11.1×**/**23.2×**/**40.8×** · **9,384** · **14,498** | `r0-census.md` | `contracts.records[]` values pass; `9,384`/`14,498` are `registryListings.*.standingTokens.sum` — committed but unread by the gate | **W** |
| B7 | census sanity check: "6 contracts, standing **597** vs invocation **10,376**" | `r0-census.md:78` | run over *this* repo; JSON never committed | **C — ‡.** Genuinely uncommitted; exactly what ‡ is for |
| B8 | oracle P7/P8 carry **+515**, **~20k**, **2.6%**, `["doctor"]`, `skills=[]`, **74 skills** | `founder/RATIFICATION.md` | oracle is out of every scan set; CLAUDE.md says it should "contain no number" | **X** — do **not** edit the oracle. The KC8 page names where each of those numbers' record lives |

#### Surface C — `gaia-research/skill-heaven` (public repo, badge-linked from the site)

| # | Claim | Where | Evidence status today | Disposition |
|---|---|---|---|---|
| C1 | **F7**: door **+515 tok** (**20,176** vs benchmark floor **19,661**), **−28.9%** off native **28,379**; claude **2.1.216**, probed **2026-07-24** | `README.md:113–115`, `claude-heaven/README.md:124,216`, `core/src/compile.ts` `FLOOR_EVIDENCE` (test-pinned), oracle P7/P8 | real measurement, pinned in source + a test — but **no ledger record, no run record, no raw output committed anywhere**. This is *the* shipped claim with no benchmark record. | **B — backfill (see §2).** F7 is **LOCKED**: cite as-is, do **not** re-derive against 2.1.220 |
| C2 | **KC4 clean room**: curated `skills` = `["heaven-set:kc4-curated-marker","doctor"]`, 2/2 byte-identical, claude **2.1.220**, 2026-07-30 | `README.md:163–186` | probe **script** committed (`packages/claude-heaven/scripts/probe-kc4-listing-residual.sh`); **observed output committed nowhere**; not a token number → gate structurally blind | **B/C** — wants a `harness-probe/v1` run record in this repo's `runs/`. If Marco won't authorize a re-run, the page states "script-reproducible, output not committed" |
| C3 | KC4 (superseded) 2026-07-29: project marker + `doctor`; "~**64**-entry", "~**68**-entry" listings | `README.md:150,172–173` | approximations, no artifact | **C** — the `~` figures must stay approximations and never become the page's numbers |
| C4 | codex "**74→73** entries, 2/2 byte-identical" | skill-heaven `README.md:85` | skill-heaven's own re-probe has no committed record; the **upstream** G1 rows do (`codex-g1-2026-07-29.run.json`, `input_tokens 18986` / `18925`) | **C** (skill-heaven side) / **A-via-run-record** (matrix side, but gate can't read run records) |
| C5 | pi "2 of ~9" · "**0/15**" · "95% CI ≈ **21.8%**" | matrix P1 rows (outside fence) | `pi-race-and-argv-order-2026-07-29.run.json` committed | same as C4 |
| C6 | **cursor** | — | **binary probes DEFERRED, no availability** | **C — hard rule: the page carries an explicit "not probed, no claim" row and never a cursor number.** Do not infer, do not borrow a doc-verified cell as a measurement |
| C7 | "−28.9% off native" | C1 | derived from 20,176 vs 28,379 | **B + C** — after backfill the two floors are records; **native 28,379 stays ‡** (see §2 decision D2) |

### 2. Ledger records to append (Stage 2)

**Append exactly two** `hh-ledger/v1` records — the F7 floor pair. Nothing else in the
inventory is a paired token measurement that the ledger schema can honestly carry.

| Field | Record 1 | Record 2 |
|---|---|---|
| `benchmarkId` / `task` | `hh-f7-floor-split` / `door-cost-probe` | same |
| `arm` | `placebo` | `heaven` |
| `skillsLoaded` | `[]` | `[]` |
| `tokens.perTurn` | **19661** | **20176** |
| `tokens.{system,skillStanding,skillInvocation}` | `null, 0, 0` | `null, 0, 0` |
| `harness` | `{claude, 2.1.216}` | same |
| `recordedAt` | `2026-07-24T00:00:00Z` (date-only known — disclosed in notes) | same |
| `notes` leading tag | `floor=benchmark` | `floor=product` |

`notes` on both must state plainly, in this order: (a) **backfill** of the 2026-07-24
F7 probe, transcribed from `skill-heaven packages/core/src/compile.ts` `FLOOR_EVIDENCE`
(arithmetic pinned by `packages/core/test/compile.test.ts`); (b) **locked by founder
ruling 2026-07-30 — not re-derived against 2.1.220**, version drift accepted;
(c) `model` and wall-clock were **not recorded at probe time**; (d) **B5 smoke
evidence**, workstation, not a benchmark arm; (e) the two floors are **separate arms
(B1), never averaged**, and only the doorless one is the placebo-of-record (B2).

Then `ledger.ts validate` (expect 12 records) and re-run the full gate.

**Two schema frictions this exposes — name them, do not paper over them:**

- **`wallClockMs` has no `null`.** The validator requires a non-negative number, so a
  backfill must write `0` — which contradicts the ledger's own "never write 0 for
  unmeasured" discipline (stated for token doses only, but the spirit is general).
  Ship `0` **with the note saying it means unmeasured**, and file the gap. Do not
  quietly normalize `0` as acceptable.
- **`model` must be a non-empty string.** F7 did not record one. Write
  `"unrecorded"`, not a guess.

**Decision D2 — the native pole.** `ARMS` has no `native`; `arm: "heaven"` with
`skillsLoaded: []` would misrepresent the vanilla pole. `m2-live-demo.md` set the
precedent (native 46,849 stays ‡, uncommitted). **Recommend: do not append 28,379;
carry it ‡ and name "no `native` arm in `hh-ledger/v1`" as a disclosed schema gap.**
Consequence: "−28.9% off native" is ‡ on the KC8 page, while "+515 (20,176 vs 19,661)"
is fully record-backed (the signed-delta rule blesses `+515` off the two committed
perTurns automatically).

**Decision D1 — backfill at all?** Alternative if Marco rejects a `wallClockMs: 0`
record: append nothing, and the KC8 page carries F7 as a first-class **declared gap**
(B4 explicitly makes a "will not work"/"not yet recorded" ledger first-class). Cheaper,
weaker — the flagship public number stays unbacked. **Recommend backfilling.**

### 3. The deliverable page

- **Content:** `content/reports/hh-benchmark/claim-index.md` — sibling of
  `methodology.md` / `m2-live-demo.md` / `r0-census.md`, already inside the lexicon
  `user-facing` scope and the `hh-benchmark-ci.yml` path filter.
- **Route:** `app/research/hh-benchmark/claims/page.tsx` → `/research/hh-benchmark/claims`.
  Copy the existing `app/research/hh-benchmark/page.tsx` shape exactly: raw `.md` import
  (webpack `asset/source`), `dynamic = "force-static"`, `revalidate = false`,
  `react-markdown` + `remarkGfm`, `SiteHeader`/`SiteFooter`, and the same
  `# `-title + `<!--`-line strip (which conveniently hides the ledger fences).
  **`page.tsx` restates no number** — every figure lives in the `.md` so the gate sees it.
- **Entrypoints** (this repo has no Guard-D equivalent, so it is on us): a
  `researchEntries` row in `data/research.ts` (type `LEDGER`, status `VRF` or `WIP`),
  plus a link from the existing hh-benchmark method page's `report-links`, plus the
  `m2-live-demo.md` / `r0-census.md` reports linking back to it. The PR body lists
  these under an **Entrypoints** heading.
- **Shape:** one row per claim from §1 — *claim as published · where a reader sees it ·
  the record (ledger line / census field / run record) · how to reproduce · status*.
  Statuses mirror the dispositions: `RECORD` · `‡ UNCOMMITTED` · `NOT PROBED` ·
  `SOFTENED` · `OUT OF SCOPE`.
- **Hard rule for the page:** it is an **index, not a measurement**. It introduces zero
  new numbers. Every number inside its fence either traces to a committed record or
  carries ‡. Quoting a *disproven* claim (A2) still trips the gate — handle those with
  the `differ`/`not` disclaimer wording or ‡, per the gate's own rules.

### 4. Gate wiring — so it is actually gated going forward, not written and forgotten

1. **Derive the scan set, do not hand-list it.** Replace `DEFAULT_DOCS`'s hard-coded
   `m2-live-demo.md` with `readdirSync(content/reports/hh-benchmark).filter(.md)` +
   `docs/labs/harness-capability-matrix.md` + the one explicitly-fenced blog post. Then
   *the next report added to that directory is gated automatically* — the
   "written and forgotten" failure mode becomes structurally impossible, and Stage 5's
   "wiring" reduces to putting the file in the right directory. (Same principle
   `skill-heaven` used for `RELAUNCH_OFFERS`: the affordance cannot outlive the capability.)
2. **Widen `buildEvidence()` — narrowly, and pin the narrowness with fixtures.** Add
   only `census.registryListings.*.standingTokens.{sum,count}` and
   `census.h1Restatement.publishedStandingTokens.*`. These are **measured per-surface
   doses**, not derived summary stats — the existing exclusion of `mean/min/p25/p90/max`
   stays, and a new fixture must prove a distribution's `mean` still blesses nothing.
   *Rationale for widening rather than ‡-tagging:* 9,384 / 14,498 / 9,453 / 249 **are**
   committed; tagging them ‡ ("declared uncommitted workstation context") would be false
   and would erode the sigil's meaning. Do **not** widen to run records in this pass
   (bigger change, no claim in scope needs it — note it as the next natural extension).
3. **Fix the declared scope.** Update the `check-claims.ts` header comment, the
   `scripts/hell-heaven-bench/README.md` table, and the CI step name so the stated scope
   matches the real one. The gate must not overclaim its own coverage.
4. **Widen `hh-benchmark-ci.yml` `paths:`** to include
   `content/blog/claude-5-system-prompt-shrink/**` — otherwise a future blog edit can
   break the gate with no CI run. (`app/research/hh-benchmark/**` too, cheaply.)
5. **Fixtures: 17 → ~21.** New cases: (a) census `sum` blesses a number; (b) census
   `publishedStandingTokens` blesses a number; (c) a distribution `mean`/`p90` still
   does **not**; (d) a report dropped into `content/reports/hh-benchmark/` is picked up
   by the derived scan set.

### 5. Stage-2 work breakdown (one commit + push each)

| # | Unit | Gate after |
|---|---|---|
| S2.1 | Widen `buildEvidence` (two census branches) + 3 new fixtures | `check-claims.test.ts` 20/20 |
| S2.2 | Append the two F7 ledger records | `ledger.ts validate` → 12 |
| S2.3 | `r0-census.md`: ‡ the sanity line (597 / 10,376) | `--file r0-census.md` clean |
| S2.4 | Blog post: fence the Skill-Heaven paragraph (HTML comments are inert — `react-markdown` renders no raw HTML) | `--file post.md` clean |
| S2.5 | Matrix: extend the fence over gate (a)/(c) + ‡ those figures **(confirm scope with review — this is the largest edit)** | `--file matrix` clean |
| S2.6 | Derived `DEFAULT_DOCS` + header/README/CI-step scope fix + CI `paths:` widening + 1 fixture | full gate green on the widened set |

S2.6 is deliberately pulled forward from Stage 5 so Stage 3 can verify the wiring;
Stage 5 then only authors `claim-index.md`, its route, and its entrypoints.

### 6. Decision points for Marco (do not improvise these)

- **D1** — backfill F7 into the ledger (recommended), or declare it a gap?
- **D2** — native 28,379: leave ‡ (recommended, m2-live-demo precedent) or invent an arm?
- **D3** — **A2's homepage copy is wrong on two counts** and it is the loudest public
  Arc I claim. Fixing it edits `app/page.tsx` — visitor-visible, so it needs the human
  gate regardless. Fix in this PR (recommended: KC8 is exactly this) or split it out?
- **D4** — S2.5's fence extension over gate (a)/(c) touches ~50 lines of the matrix.
  In scope, or leave those regions ungated and disclose on the KC8 page?
- **D5** — KC4's observed output exists nowhere committed. Authorize a
  `harness-probe/v1` record (needs a re-run of the committed probe script), or ship
  "script-reproducible, output not committed"?

### 7. Explicitly out of scope

- **Cursor.** Deferred, no availability. No number, no claim, no inference — it appears
  on the page only as "not probed".
- **Re-deriving F7** against 2.1.220. Locked by founder ruling; version drift accepted.
- **Editing `founder/RATIFICATION.md`.** The oracle carrying numbers is a known
  tension; not KC8's to resolve.
- **Context Diet / ci-churn / cost claims.** Other programs, own artifacts.
- **KC9** (the three-minute demo half of issue #13).
- **Widening the gate to read `harness-probe/v1` run records.** Named as the next
  extension; no in-scope claim requires it.

---

## Progress Log

*(Newest entries at the bottom. Each stage appends before stopping.)*

- 2026-07-30 — orchestrator: scratchpad created, worktree set up at
  `/Users/marcotiongson/Documents/gaia-research-kc8`, branch
  `docs/kc8-benchmark-ledger` off `main` @ `6b8db3d`. Handing off to Stage 1
  (planner).

- 2026-07-30 — **Stage 1 (plan) DONE.** Investigation + plan written above under
  `## Plan`. Nothing implemented: no ledger record written, no file under
  `content/reports/hh-benchmark/` touched, `check-claims.ts` unmodified.

  **What I ran (all read-only):** `check-claims.ts` on the default set (PASS, 2
  docs), on `r0-census.md` (**FAIL 5**), on `post.md` (**FAIL 2**), on
  `methodology.md` / `VISION.md` / `MISSION.md` (PASS); `ledger.ts validate`
  (PASS, 10 records); `check-claims.test.ts` (17/17). Read `README.md`,
  `check-claims.ts` (full header), `ledger.ts`, `census.ts` tail, all 10 ledger
  records, all four hh-benchmark docs, the full capability matrix,
  `harness-probes/README.md` + a run record, `hh-benchmark-ci.yml`,
  `lexicon-ci.yml` scopes, `founder/RATIFICATION.md` §2/§4, `data/research.ts`,
  the three research routes, `app/page.tsx` + `app/about/page.tsx`, and (read-only)
  `skill-heaven`'s `README.md`, `packages/claude-heaven/README.md`,
  `packages/core/src/compile.ts` `FLOOR_EVIDENCE`, plus issue #13.

  **Three headline findings:** (1) the gate's own declared scope overclaims —
  header/README/CI-step all say "the hh-benchmark reports", `DEFAULT_DOCS` has
  one; (2) a **live public blog post** ships 9,453→249 / −97.4% that the gate
  cannot trace, though both numbers are committed in `r0-census.json` under a
  branch `buildEvidence()` doesn't read; (3) `app/page.tsx:82` ("evicts **every**
  installed skill … only the **grilling-native** ones") is contradicted by KC4's
  `["doctor"]` + P8, and rides retired D13 / unverified gate (e).

  **Next (Stage 2, implement):** work S2.1 → S2.6 in §5, one commit + push each.
  Start with:
  `npx tsx scripts/hell-heaven-bench/check-claims.test.ts` (confirm 17/17 baseline),
  then widen `buildEvidence()` per §4.2 and add the three fixtures.
  **Get Marco's calls on D1–D5 (§6) before S2.2 (ledger append) and S2.5
  (matrix fence extension)** — those two are the ones with founder-decision
  surface. S2.1 / S2.3 / S2.4 / S2.6 are safe to proceed on.

- 2026-07-30 — **Stage 2 round 1 (implement) DONE.** Five commits, each pushed
  to `origin/docs/kc8-benchmark-ledger` as its own logical unit. **No deliverable
  page written** — `content/reports/hh-benchmark/claim-index.md` does not exist
  and was deliberately not created (Stage 5's job).

  | Commit | Unit |
  |---|---|
  | `17320b1` | S2.1 — widen `buildEvidence` to census per-surface standing doses; fixtures 17→20 |
  | `5f37a60` | S2.2 — append the F7 floor pair; ledger 10→12 records |
  | `3574ae5` | S2.3 — `‡` the r0-census sanity line (597 / 10,376 / 13.8×) |
  | `f8976cb` | S2.6 — derive the scan set, fix the gate's overclaimed coverage, widen CI `paths:` |
  | `8fcdad6` | S2.5 replacement — declare two measured gate holes (see below) |

  **Final verification, all re-run at `8fcdad6`:**
  `ledger.ts validate` → `OK — 12 valid record(s)` (exit 0, re-run after **each**
  append); `check-claims.ts` → **PASS over 5 docs** (was 2) — matrix, blog post,
  m2-live-demo, methodology, r0-census; `check-claims.test.ts` → **23/23**
  (20 fixtures + 3 scan-set coverage checks); `check-lexicon.ts` → clean.

  **D1 taken as recommended (backfill).** Two `hh-ledger/v1` records appended for
  F7, both via `ledger.ts append`, validated to exit 0 after each:
  `hh-f7-floor-split/door-cost-probe`, `placebo`/`floor=benchmark`
  **perTurn 19,661** with `objectiveEndpoint.pass: false` (F6's verified negative
  — `/skill-heaven` answers `Unknown command` at the doorless floor), and
  `heaven`/`floor=product` **perTurn 20,176** with `pass: true`. **+515 needs no
  record** — confirmed it is blessed automatically as a signed delta between the
  two committed perTurns. F7 cited as-is on **claude 2.1.216**, NOT re-derived
  against 2.1.220, per the founder ruling; both records say so in `notes`.
  **D2 taken as recommended:** native **28,379 stays uncommitted** (no `native`
  arm in `hh-ledger/v1`) — verified it traces to nothing, so it and the derived
  −28.9% carry `‡` on the page.

  **Two deviations from the plan, both deliberate, both verified:**

  1. **S2.4 dropped as a coverage regression.** After S2.1 the blog post passes
     **whole-doc** (0 findings). Adding a fence would have scanned one paragraph
     instead of the file — strictly *less* coverage. It is in the scan set
     **fence-free** instead.
  2. **S2.5 (matrix fence extension) not done; something better found.** Scanning
     the matrix with fences stripped yields **2** findings, not the ~7 estimated:
     `~1,400-word` (a WORD count misread as tokens) and `≈1 tok, negligible`. The
     reason it is that clean is the real defect — **`normalizeNum` accepts
     integers only, so every k-suffixed/decimal magnitude is skipped, not
     checked.** Verified directly: a file asserting `~17.0k tok` / `~25.2k tok`
     passes with zero findings while `99999 tok` in the same file fails. The
     matrix carries **18** such figures (counted) — the whole gate (a) ladder.
     **Fencing them would gate none of them.** Recorded as a declared KNOWN
     LIMITATION in the source header + README with the count and date, and left
     unfixed on purpose: closing it forces a `‡` or a record for all 18, which is
     D4 plus a new decision. **This supersedes D4 as written** — the question is
     no longer "fence or not" but "teach the parser `k`, then tag 18 figures?".

  **Claim-by-claim data status for Stage 5 (this is the deliverable's spine):**

  | Claim | Status now |
  |---|---|
  | A1 9,453 → 249 / −97.4% | **RECORD** — census `h1Restatement.publishedStandingTokens`, now gate-traceable; blog post PASSES |
  | A3 "one step below vanilla" | **RECORD** for the floors (ledger 11/12); the native comparison is `‡` |
  | A5 methodology.md | **RECORD** — now actually in the scan set, PASSES |
  | A6 /about card | clean, no numbers |
  | B1/B2 floor 30,661 · curated 31,624 · +963 · 227 · sha `14c4642…` | **RECORD** — ledger 9/10 |
  | B3 native 46,849 · −16,188 · 5,917 | **`‡`** — already correct, cite as the reference use |
  | B4 gate (a) ladder (≈25.2k, ≈17.0k, …) | **`‡` REQUIRED, and structurally ungated** — 18 k-suffixed figures the gate cannot see |
  | B5 gate (c) ≈57 tok / 24 tok | **`‡` REQUIRED** — chars4 over draft copy, never committed. NB 57 coincidentally exists as a committed magnitude, so the gate would wave it through — a live instance of the declared magnitude-existence-not-record-binding limit |
  | B6 census 8,919 · 88,416 · 9,384 · 14,498 | **RECORD** — r0-census.md PASSES |
  | B7 597 / 10,376 / 13.8× | **`‡` DONE** this stage |
  | C1 F7 +515 (20,176 vs 19,661) | **RECORD** — ledger 11/12, appended this stage |
  | C2 KC4 `["doctor"]`, 2/2 byte-identical | **NOT COMMITTED.** Verified: `runs/` holds no KC4 record; only skill-heaven's `probe-kc4-listing-residual.sh` exists. **D5 still open**, not fabricated. Page must say "script-reproducible, output not committed" |
  | C3 `~64` / `~68`-entry listings | approximations, `‡`, must stay approximate |
  | C4 codex "74→73" | **DOES NOT MATCH THE COMMITTED RECORD.** `codex-g1-2026-07-29.run.json` reports **67 skills total → 66**, `input_tokens` **18,986 → 18,925**, 2/2 byte-identical. skill-heaven's public 74→73 is a *different, uncommitted* probe. Do NOT present the committed record as backing it |
  | C5 pi "0/15", 95% upper bound 21.8% | **RUN RECORD** — `pi-race-and-argv-order-2026-07-29.run.json` (`n:15`, `leaksObserved:"0/15"`, `upperBound95pct:"21.8%"`). The gate cannot read `harness-probe/v1`, so cite the file path |
  | C6 cursor | **NOT PROBED.** No number, no inference. Explicit "not probed" row |
  | C7 −28.9% off native 28,379 | **`‡`** — verified 28,379 traces to nothing |
  | A4 Context Diet · B8 oracle | **OUT OF SCOPE**, stated as such |

  **Still open, NOT invented:** D3 (A2's homepage copy is wrong on two counts —
  needs a founder call + a visitor-visible `app/page.tsx` edit), D4-as-superseded
  (teach the parser `k` and tag 18 matrix figures?), D5 (authorize a KC4
  `harness-probe/v1` re-run, or ship "output not committed"?). C2 and the C4
  mismatch are the two places the page must be most careful.

  **Next (Stage 3, review):** re-verify — do not trust — with
  `npx tsx scripts/hell-heaven-bench/ledger.ts validate` (expect 12),
  `npx tsx scripts/hell-heaven-bench/check-claims.ts` (expect PASS, 5 docs),
  `npx tsx scripts/hell-heaven-bench/check-claims.test.ts` (expect 23/23), then
  read the two new ledger records and judge whether the `wallClockMs: 0` /
  `model: "unrecorded"` disclosure is honest enough to ship, and whether the C4
  mismatch above is stated strongly enough. Write the verdict under
  `## Review — round 1`.
