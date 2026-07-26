# ⭐ RATIFICATION — Epic #89 / #87 Vectorize fuzzy promotion + #88 CI coverage gate

**Status: LOCKED (founder-ratified 2026-07-24 by mbtiongson1, via PR #111).** Source of truth for the Vectorize threshold/mechanism and CI coverage-gate floors in Infinite Skill Craft. Where any plan, PR body, or code comment disagrees, this wins.

> This is the epic-89 line's ratification record, same lineage as
> `docs/plans/epic-89-reachability-RATIFICATION.md` (#86). It is **separate**
> from `founder/RATIFICATION.md`, which governs the Skill Heaven / Skill Hell
> product line only — do not conflate them.

---

## V1 — LOCKED — Vectorize query text: factual description, not blurb

`resolveVectorizePromotion`'s query text MUST be built from the fusion's factual
`description` field (`RawFusionJson.description`, per `lib/craft/prompt.ts`),
never the playful `blurb` field. This was a real bug, not a style choice: the
corpus (named-skill embeddings, `sync-skill-tree.ts`'s `embedAndUpsertNamedSkills`)
is embedded from `title. description` (factual register). Embedding `name. blurb`
instead measurably deflated scores — on the prompt's own `/scraper` few-shot,
blurb text scored **0.716** against the correct target (never promotes),
description text scored **0.861** (promotes). Same fusion, same target, ~0.15
gap purely from which field was embedded. Fixed at
`app/labs/infinite-skill-craft/api/fuse/route.ts`.

## V2 — LOCKED — Fusion name is de-slugged before embedding

The fusion name is naturalized (`/api-orchestration` → `api orchestration`,
strip leading slash + hyphens→spaces) before being embedded, on top of V1's
description fix. Validated against the live index: beat raw-slug composition
on 7/9 probed targets, +0.013 avg cosine, never lost by >0.002. A systematic,
low-risk lift — not chasing the false-positive/true-positive overlap on its
own, but it does raise both distributions together (see V3).

## V3 — LOCKED — `VECTORIZE_THRESHOLD = 0.80`, absolute-threshold mechanism (not margin)

Ratified value: **0.80** (down from the `0.82` plan placeholder). Rejected
alternatives and why:

- **0.82 (original placeholder):** defensible on pure false-positive avoidance
  alone, but needlessly kills recall — post-fix (V1/V2) it captures only 47%
  (9/19) of a realistic 20-skill paraphrase sweep vs 63% (12/19) at 0.80.
- **0.72–0.75 (max-recall probe recommendation):** rejected — fires on the
  worst known clean false positive (0.757, "a tool for fixing bugs in my code
  and reviewing pull requests before merge" → `github-code-review`) and most
  of a dense generic/ambiguous cluster at 0.69–0.76.
- **Margin-based rule (top1 − top2 gap) instead of absolute threshold:**
  rejected — tested directly and found *noisier* than raw score. Near-duplicate
  corpus skills (`test-driven-development` vs `tdd`, `investigate` vs
  `systematic-debugging`) produce small gaps on genuinely correct hits,
  which a margin gate would false-negate. Keep the absolute-threshold
  mechanism (`topK: 1`, no change to `vectorize-promotion.ts`'s shape).

**Rationale:** true-positive and false-positive scores genuinely overlap in
the 0.75–0.82 band for the *realistic* query register (creative fusion names +
factual description, not clean reworded titles). No flat threshold cleanly
separates them there. Given the product asymmetry — a wrong promotion to the
wrong canonical skill damages trust more than staying emergent — 0.80 was
chosen to sit ~0.04 above the worst known clean false positive rather than
chasing maximum recall.

**Evidence basis:** four independent live probes (Sonnet, effort=medium)
against the real, populated production Vectorize index (`gaia-craft-skills`,
768-dim/cosine, 278 real named-skill embeddings via `@cf/baai/bge-base-en-v1.5`),
synthesized by an Opus agent — recall sweep (n=20), adversarial false-positive
hunt (n=63), margin analysis (n=15), composition experiments (n≈9×4 variants).
Full tables: PR #111 discussion, issue #87 comment (2026-07-24).

**Known residual risk, accepted knowingly:** 0.80 is a trade-off point, not a
clean boundary — it will still miss some real creative-name paraphrases in the
0.76–0.80 band, and remains only ~0.04 from the nastiest false-positive class
(flat, generic dev descriptions). **Action item, not yet done:** log real
promotion scores for a week post-deploy and review the 0.80–0.85 band for
correctness before treating 0.80 as permanent.

**Not fixed by this ratification, flagged separately:** `investigate` vs
`systematic-debugging` are near-duplicate corpus entries (same capability,
different slugs) — a corpus-hygiene item, independent of threshold/mechanism.

## C1 — LOCKED — CI coverage-gate floors (#88), unchanged from plan

Floor values confirmed as originally plan-recommended, no changes:

| Tier | Metric | Floor |
|---|---|---|
| Proportional primary | `gameSeedReachablePct` (Math.floor) | ≥ 65% |
| Proportional primary | `namedBackedFusionCount / 130` | ≥ 60% |
| Watermark | `reachableNamedSkillCount` | ≥ 150 |
| Watermark | `namedBackedFusionCount` | ≥ 82 |
| Watermark | `deterministicFusionReachCount` | ≥ 87 |
| Structural (exact) | `internalConnectivityPct` | === 100 |
| Structural (exact) | `genericIntermediateFusions` | `[agent-eval, ghostwrite, knowledge-harvest, plan-and-execute, research]` |
| Structural (≥) | `seedBridges.length` | ≥ 71 |

Confirmed explicitly: the buffered watermarks (≥150/≥82/≥87 vs current
153/84/89) are the right call, not the raw current values — enough headroom
to absorb 1-2 benign upstream renames without false-firing. `gameSeedReachablePct`
stays hard at 65%, not loosened to 60%. The 38-of-47 reachable-contributor
stance (9 out-of-closure contributors accepted, not a regression) stays
accepted per the already-locked A′ decision (`epic-89-reachability-RATIFICATION.md`
R2) — not reopened here.

## C2 — LOCKED — No blanket coverage-gate skip

No `SKIP_COVERAGE_GATE`-style env var exists or may be added to `craft-ci.yml`.
The only sanctioned way to lower a floor is the same-commit, data-diff-reviewed
change already documented in `coverage-gate.test.ts`'s header comment. If a
scheduled resync (`craft-registry-resync.yml`) needs a skip, it is scoped
strictly to that workflow, never to `craft-ci.yml`.

## M1 — LOCKED — Merge sequence: up to `staging` only, `main` held for Yggdrasil II

PR #111 → `epic-89/full-registry-discoverability` (merge commit `bc547bc`) and
PR #92 → `staging` (merge commit `88cd058`) are both merged and verified green
(all required checks pass pre-merge; Cloudflare Workers Build re-confirmed
green on the resulting `staging` HEAD). `staging` → `main` is **intentionally
deferred** — owner call, 2026-07-24 — held until Yggdrasil II drops. Do not
merge `staging` → `main` without an explicit, separate instruction.

---

## Provenance
- V1/V2/V3 evidence: PR #111 body + discussion, live-Vectorize-index probes
  (this environment had live Cloudflare credentials; index provisioned and
  populated with real embeddings for the first time in this run).
- Founder sign-off: this document, plus matching comments on issue #87
  (2026-07-24) and issue #88 (2026-07-24), plus updated code comments in
  `lib/craft/vectorize-promotion.ts` and `lib/craft/coverage-gate.test.ts`.
- M1: PR #92 comment (2026-07-24, proof-of-work), issue #89 checklist update
  (2026-07-24).
- Related: `docs/plans/epic-89-reachability-RATIFICATION.md` (#86, the
  deterministic layer #87's emergent path complements).
