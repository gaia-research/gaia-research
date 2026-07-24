# founder/ — the decision system (public repo)

**One accepted ratification doc at a time. Everything else is archived.**

- [`RATIFICATION.md`](./RATIFICATION.md) — **the oracle.** The single source of
  truth for every ratified Skill Heaven / Skill Hell decision. If any other doc
  in this repo (or in `marketing-tasks`) disagrees with it, **this doc wins** and
  the other doc is pending rewrite.
- [`lexicon.json`](./lexicon.json) — **the vocabulary of record**, and
  [`LEXICON.md`](./LEXICON.md), its generated human-readable rendering. The
  oracle decides *what is true*; the lexicon decides *what the words mean*.
  Enforced by `scripts/lexicon/check-lexicon.ts` in CI.
- [`archived/`](./archived/) — superseded ratification docs. When a new
  ratification doc is accepted, the old one moves here as
  `YYYY-MM-DD-<name>.md`. Never edit archived docs.

## Rules

1. **Exactly one live doc.** `founder/` contains one accepted ratification doc
   (plus this README, the lexicon and `archived/`). No drafts live here —
   drafts are PRs that edit `RATIFICATION.md`.
1b. **A term is defined in exactly one lexicon file, ever.** Extensions add
   terms in their own namespace; they may never redefine a core term. The
   planned extension is `marketing-tasks/founder/lexicon.brand.json` (persona,
   brand and enterprise vocabulary — private per rule 4, and per N7 the Heaven
   persona name is reserved and must not be hard-coded anywhere). Consumers
   pin the schema version (`"lexicon": "1"`), not a commit — the same shape as
   the ledger validator, which by D6 never moves either.
1c. **Only the oracle retires a word.** A term is `banned` in the lexicon when
   `RATIFICATION.md` already retired it; a term still being argued about is
   `parked` — legal in `docs/`, illegal in user-facing copy and shipped code.
   Writing a linter is not a way to make a decision.
2. **Decisions only.** Research, benchmarks, reports, plans, and WIP live in
   `docs/`, `content/`, and `scripts/` — they explain and propose; they never
   decide. The oracle records decisions and points at the evidence.
3. **Owner ratifies.** Changes to `RATIFICATION.md` land only with founder
   approval (the 5% lane per `MISSION.md` §2 — humans decide *whether*, never
   *how*).
4. **Enterprise decisions live elsewhere.** Private/enterprise decisions are in
   `marketing-tasks/founder/ENTERPRISE.md` (same system, private repo). This
   repo's oracle covers everything public.
5. **Issues.** GitHub issues are for finalized sprints and not-yet-final RFCs.
   An RFC closes only when **all** of its decisions are closed in the oracle.

## For agents

Point here first. Read `RATIFICATION.md` before acting on anything Skill
Heaven / Skill Hell related; treat every other doc's decision language as
historical unless the oracle confirms it. Public help-wanted surface:
issue [#62](https://github.com/gaia-research/gaia-research/issues/62) and
[research.gaiaskilltree.com/research/hh-benchmark](https://research.gaiaskilltree.com/research/hh-benchmark).
