R1 PREDICTION WORKSHEET - not a benchmark record (B4)

# Seed 16: Env-repro/get-it-running skill

> Everything below is a hand-label PREDICTION to be tested by the R2 procedure.
> This is not a benchmark record. Numbers trace to committed records or carry the
> dagger-sigil mark; none appear here. Labels live OUTSIDE hh-ledger.

## Metadata

seed-id: 16
skill-id: firecrawl/firecrawl-build-onboarding
sha256-skill-md: NOT-RESOLVED (canon checkout at gaia-skill-tree carries registry metadata only; hash to be computed from upstream SKILL.md at R2 pinning)
upstream: https://github.com/firecrawl (agent-environment-setup bucket)
band: hell
audit-class: no

## Dimension scores (binary predictions; pass condition/evidence per r1-stamp-rubric.md S2)

| dim | prediction |
|-----|------------|
| H1 | pass |
| H2 | fail |
| H3 | pass |
| H4 | fail |
| H5 | fail |
| S1 | pass |
| S2 | pass |
| S3 | pass |
| S4 | fail |
| S5 | fail |
## Stamps (T9 multiplicative; exactly ONE primary)

primary-stamp: hell-safe@high
secondary-stamps: none

## Hell-safe tier

hell-safe-tier: high
deny-list-status: no

## Environment qualifiers

- tier-cap qualifier MANDATORY (T3): install-script/environment-mutation class gets ceiling-not-blanket; ceiling here set by the S4+S5 fails (S-prefix S1-S3 => high under R1a), never a blanket verdict

## Notes

> Cell T3 anchor. H5 predicted fail: running install scripts writes the environment; core function is not deliverable read-only.

## Notes (labeling pass)

> S4 fail (landing-zone automation for .env/config unknown at label time) and S5 fail (API credit spend, no stated ceilings verifiable) each cap at med per rubric S3.2 — independently consistent with the T3 tier-cap prior of med. S1 pass: writes are the declared config step itself, scoped; H5 fail per template note (install/env mutation not deliverable read-only). S3 information-flow clause passes (user-supplied key placed in sanctioned client config is intended function, not egress); stack clause uncertifiable -> composition-unverified qualifier.
>
> TIER RE-DERIVED UNDER R1a: med -> high because the S-prefix is S1–S3 (S4 and S5 both fail and stop the run at three passing rows) and the R1a bijection derives @high directly — the old-grammar cap steps are abolished; two trailing fails land the skill exactly one rung below the xhigh ceiling.

## Known-miss cases

- (none - not audit-class)

## Labeling (next phase - leave EMPTY)

labeler:
confidence:
