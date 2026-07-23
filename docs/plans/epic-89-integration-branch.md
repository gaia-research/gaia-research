# Epic #89 integration branch tracker

Branch: `epic-89/full-registry-discoverability` (base: `staging`)

This branch is the shared integration point for the four sequenced sub-issues of
[epic #89](https://github.com/gaia-research/gaia-research/issues/89) ("Full-registry
discoverability for Infinite Skill Craft"). Each sub-issue PRs into **this branch**,
not directly into `staging`. Once all four have landed here and been verified
together, this branch merges into `staging`, and `staging` → `main` per the epic's
own delivery plan.

## Sub-issues (sequenced, each depends on the last)

- [ ] #85 — repair the registry sync (PR #91)
- [ ] #86 — derive fusion reachability at build time (blocked on #85)
- [ ] #87 — Cloudflare Vectorize fuzzy promotion matching (blocked on #85, #86)
- [ ] #88 — CI reachability-coverage gate (blocked on #85, #86, #87)

## Human gates called out in the epic (non-negotiable, per-issue)

- **#85** — a human must hand-review the first regenerated registry data diff;
  do not merge on green CI alone.
- **#86** — "accept a genuine reachability gap vs. synthesize a bridge" is a
  founder product call.
- **#87** — Vectorize similarity threshold + measured latency must be shown
  and signed off explicitly.
- **#88** — coverage floor is set by the founder, not picked arbitrarily.
