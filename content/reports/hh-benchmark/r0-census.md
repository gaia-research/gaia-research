# R0 — Two-Part-Dose Census (M1 ledger artifact)

- **Milestone:** M1 of the Skill Heaven/Hell MVP (RFC §1.2 row 2, maps to **R0**).
- **Generated:** 2026-07-18, by [`scripts/hell-heaven-bench/census.ts`](../../../scripts/hell-heaven-bench/census.ts)
  against canon checkout `gaia-skill-tree@f07a057`.
- **Data:** [`data/r0-census.json`](data/r0-census.json) (per-contract records + distributions).
- **Tokenizer:** `chars4` — `max(1, floor(chars/4))`, byte-for-byte the proxy the H1
  registry-proxy prototype used, so every number here is directly comparable with the H1
  standing-dose result. It is a proxy, not the Claude tokenizer; the backend is recorded in
  the artifact and pluggable.

## The rule this artifact enforces (ratified finding 2)

A skill's `contextCost` is **never one number**:

- **Standing dose** — the one-line listing (`- name: description`) an installed skill costs
  *every* session, invoked or not.
- **Invocation dose** — the full `SKILL.md` body, paid only when the skill is invoked.

Every table below prices them separately. Tokenizing whole files as "the cost" overstates
standing cost — on this corpus, by **11× at the mean and up to 41×** (measured below, not
assumed).

## Census: canon in-tree skill contracts (both doses)

97 `SKILL.md` contracts scanned across `.claude/skills` + `.agents/skills`;
**65 unique** by content hash (the same contract exposed to two harnesses is one compound,
listed twice — dedup is by `sha256(SKILL.md)`, the same hash shape the Ygg II hash-binding
ask reuses).

| Dose (tokens) | n | sum | mean | min | p25 | median | p75 | p90 | max |
|---|---|---|---|---|---|---|---|---|---|
| **Standing** (listing line) | 65 | 8,919 | 137.2 | 15 | 73 | 160 | 190 | 222 | 280 |
| **Invocation** (full body) | 65 | 88,416 | 1,360.3 | 36 | 924 | 1,128 | 1,548 | 2,401 | 5,548 |
| **Overstatement factor** (inv ÷ standing) | 65 | — | 11.1× | 2.4× | 6.6× | 8.8× | 13.2× | 23.2× | 40.8× |

Read: a fully-loaded "tokenize the file" census would price this skill set at ~88k tokens;
its actual always-on cost is ~8.9k. The ~10–50× overstatement range in the ratified findings
is empirically confirmed on canon (mean 11.1×, p90 23.2×, max 40.8×).

## Census: canon registry listings (standing dose only)

Registry entries whose bodies live upstream (hash-pinned in `skills-lock.json`) have a
standing dose here and an **unpriced** invocation dose — reported as `null`, never zero.

| Listing surface | n | standing sum | mean | median | p90 | max |
|---|---|---|---|---|---|---|
| Graph nodes (`registry/nodes/`, desc+summary — the H1 surface) | 243 | 9,384 | 38.6 | 36 | 56 | 129 |
| Named skills (`registry/named/`, frontmatter description) | 280 | 14,498 | 51.8 | 46 | 87 | 147 |

## H1 −97.4%, restated in two-dose terms (binding wording)

The H1 result (`marketing-tasks/research/hell-heaven-h1/ledger.md`) tokenized desc/summary
listings from the live graph — that **is** the standing dose. So:

- **The −97.4% is a *standing-dose* claim and survives as one:** top-5 evidenced skills
  carried **249 standing tokens vs 9,453** for all 243 graph-node listings (live-graph
  snapshot of 2026-07-16). This census recomputes the same surface on checkout `f07a057` at
  **9,384** standing tokens — agreement within 0.8% (snapshot drift, not method drift).
- It is **not** a total-token or invocation-dose claim. Copy must never phrase it as
  "97% cheaper overall" (claim-discipline table, RFC §6.3 row 1).
- **Invocation dose was unpriced in H1** and remains unpriced for upstream-hosted registry
  bodies; for canon's in-tree contracts it is priced above.
- **Net total saving remains PENDING** the R2 paired benchmark; the pivot trigger applies.

## Re-running

```bash
# Canon census (R0 artifact):
npx tsx scripts/hell-heaven-bench/census.ts --canon ../gaia-skill-tree \
  --json content/reports/hh-benchmark/data/r0-census.json

# Any repo's local skill dirs (.claude/skills, .agents/skills, .pi/skills, .codex/skills)
# — this is the mode Heaven's below-vanilla delta is computed from:
npx tsx scripts/hell-heaven-bench/census.ts --repo /path/to/repo
```

Sanity check, this repo: 6 contracts, standing 597 vs invocation 10,376 tokens
(overstatement mean 13.8×) — the two-dose split holds at small n too.
