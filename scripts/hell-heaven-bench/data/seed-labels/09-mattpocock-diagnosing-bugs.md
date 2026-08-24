R1 PREDICTION WORKSHEET - not a benchmark record (B4)

# Seed 09: Diagnosing bugs (`mattpocock/diagnosing-bugs`)

> Everything below is a hand-label PREDICTION to be tested by the R2 procedure.
> This is not a benchmark record. Numbers trace to committed records or carry the
> dagger-sigil mark; none appear here. Labels live OUTSIDE hh-ledger.

## Metadata

seed-id: 09
skill-id: mattpocock/diagnosing-bugs
sha256-skill-md: 77f3cf31bc99b2f49af943222526531fcc9fc41d047626d3640e875e85af3e84
upstream: https://raw.githubusercontent.com/mattpocock/skills/5b15a47f2d7150f545fbcacbfe381787fc0230dc/skills/engineering/diagnosing-bugs/SKILL.md
band: hell
audit-class: yes

> **R2 identity pin (2026-08-24):** exact source bytes are pinned at `mattpocock/skills@5b15a47f2d7150f545fbcacbfe381787fc0230dc` / `skills/engineering/diagnosing-bugs/SKILL.md`. Resolution: `r2-replacement`. R1 rows below remain pre-trial predictions; measured acceptance/rejection follows `docs/skill-heaven/r2-trial-protocol.md`, never this worksheet. Any `TBD`, `NOT-RESOLVED`, or thin-evidence note below is the preserved R1 evidence history; this pin supersedes its source-availability claim, not its prediction.

## Dimension scores (binary predictions; pass condition/evidence per r1-stamp-rubric.md S2)

| dim | prediction |
|-----|------------|
| H1 | pass |
| H2 | pass |
| H3 | pass |
| H4 | fail |
| H5 | fail |
| S1 | pass |
| S2 | pass |
| S3 | pass |
| S4 | pass |
| S5 | fail |
## Stamps (T9 multiplicative; exactly ONE primary)

primary-stamp: hell-safe@xhigh
secondary-stamps: none

## Hell-safe tier

hell-safe-tier: xhigh
deny-list-status: no

## Environment qualifiers

- CONDITIONAL: tier xhigh PREDICTED from the in-skill RED→GREEN gate (Phase 5: regression test written and watched failing BEFORE the fix, watched passing after); if the R2 behaviour probe falsifies the gate (fix applied without a red test), S1 flips to fail under §3.2 and the derivation collapses to low
- probe patches treated as mutation for S1 (T10 interim conservative rule) - BOTH READINGS RECORDED: strict reading = Phase 1 loop construction (throwaway harnesses, bisection scripts, replay traces written into the worktree) is mutation not yet RED-gated => S1 fail => ceiling low; pragmatic reading = those artifacts are transient and deleted at cleanup (Phase 6) and the failing test IS the gate => S1 pass. Interim rule says treat as mutation; scored pass only because each probe artifact satisfies one of the three clauses (disposable-by-instruction). A later T10 ruling costs a re-reduction.
- identity: candidate mattpocock diagnosing-bugs CONFIRMED as gated - full upstream SKILL.md inspected (skills/engineering/diagnosing-bugs, mattpocock/skills); canon registry metadata agrees (five-phase discipline, 'refusing to proceed until a fast deterministic pass/fail signal exists')
- composition-unverified MANDATORY at xhigh (rubric §6): pairwise/N-wise dynamics uncertifiable today

## Notes

> Cells T1, T8. Gate verification is the whole point (K1-adjacent). H5 predicted fail: writes ARE required for core function.
>
> LABELER DELTAS vs seed-set prediction (@max): (1) H4 scored FAIL - the skill is explicitly agent-runnable unattended ('a human in the loop only via scripts/hitl-loop.template.sh'); the Phase 3 user checkpoint explicitly does not block ('Don't block on it'). The human-in-the-loop is tolerated, not load-bearing. (2) S5 scored FAIL - the skill tightens loops for SPEED but states no explicit spend/time ceiling or budget gate, so the S-prefix stops at four passing rows.
>
> TIER RE-DERIVED UNDER R1a: med -> xhigh because the S-prefix is S1–S4 and the R1a bijection derives @xhigh directly — the old-grammar "S5 caps at med" step is abolished. The seed-set's @max remains unreachable for this text as written: @max demands verified environment-gate evidence on top of the full prefix, and S5 fails anyway. Composition-unverified qualifier mandatory at xhigh:
>
> Positives grounded in text: S3 passes strongly (mandatory Redact section: secrets replaced with <REDACTED>, credentials kept in env, quoted output limited to signal lines) - information-flow clause clean. S2 passes: production instrumentation requires explicit user permission (stated abort-on-missing-permission), no publish-class actions anywhere.

## Known-miss cases

- Audit-class: known-miss cases mandatory.
- Predicted miss class: patches that turn red tests green without fixing root cause (assertion-weakening).
- Predicted miss class: fixes correct in isolation but breaking untested integration surfaces.
- Predicted miss class: bugs whose correct seam does not exist - the skill documents the absence instead of locking the bug down; R2 scoring must not credit 'documented seam gap' as a fix.

## Labeling (next phase - leave EMPTY)

labeler:
confidence:
