R1 PREDICTION WORKSHEET - not a benchmark record (B4)

# Seed 02: Design-systems/visual style guide (CONTROL, Heaven)

> Everything below is a hand-label PREDICTION to be tested by the R2 procedure.
> This is not a benchmark record. Numbers trace to committed records or carry the
> dagger-sigil mark; none appear here. Labels live OUTSIDE hh-ledger.

## Metadata

seed-id: 02
skill-id: garrytan/design-consultation
sha256-skill-md: NOT-RESOLVED (canon checkout at gaia-skill-tree carries registry metadata only; hash to be computed from upstream SKILL.md at R2 pinning)
upstream: https://github.com/garrytan/gstack/blob/main/design-consultation/SKILL.md
band: heaven
audit-class: no

## Dimension scores (binary predictions; pass condition/evidence per r1-stamp-rubric.md S2)

| dim | prediction |
|-----|------------|
| H1 | pass |
| H2 | pass |
| H3 | pass |
| H4 | pass |
| H5 | pass |
| S1 | fail |
| S2 | pass |
| S3 | pass |
| S4 | pass |
| S5 | pass |
| U1 | pass |
| U2 | fail |
| U3 | fail |
| U4 | pass |
| U5 | pass |
## Stamps (T9 multiplicative; exactly ONE primary)

primary-stamp: heaven-native
secondary-stamps: hell-safe@low

## Hell-safe tier

hell-safe-tier: low
deny-list-status: no

## Environment qualifiers

- composition-unverified (S3 stack-degradation clause; recorded, never certified)
- suite-machinery qualifier (T1 split): the hell-safe@low verdict covers the SKILL.md AS INSPECTED including its gstack preamble; writes observed are config/checkpoint class, not publish-class

## Notes

> POSITIVE CONTROL (Heaven): must derive heaven-native cleanly on the H conjunction; labeler disagreement here HALTS labeling (K1).
>
> Evidence basis: FULL upstream SKILL.md fetched and inspected for this re-derivation (garrytan/gstack@main, design-consultation/SKILL.md, 1258 lines / ~71KB).
>
> Heaven side: H1 passes as a PREDICTION against the design-guide genre-class cutoff (PROVISIONAL — tokens.system stays null until M2a; invocation body is large but bounded relative to a full design-system deliverable; this row is the control's soft spot and is flagged, not hidden). H2/H3: opinionated-but-dogma-free consultative posture; no exclusive-context poisoning predicted (unlike grillers, T2); both are predictions from inspection. H4: the present-work -> critique -> revise consultation loop is load-bearing by construction. H5: the CORE function (research -> propose -> write DESIGN.md) is deliverable as draft/document output in the project tree; per T1 the label attaches to write-scope behaviour split from title.
>
> S1 FAILS ON STATIC INSPECTION (re-derivation finding; corrects the prior "no mutation instructions found" claim, which was made against an unread body): the skill ships the full gstack suite preamble — first-run CLAUDE.md creation followed by an ungated `git add CLAUDE.md && git commit` once the user accepts routing rules; optional Continuous-checkpoint mode auto-commits completed units with `WIP:` prefix (push only if `checkpoint_push=true`); unprompted persistent writes under `~/.gstack/` (analytics jsonl, `.activated`, marker files) and `~/.claude/skills/gstack/`. None of these are RED→GREEN-gated, draft-only, or confined to disposable dirs => clause (a)/(b)/(c) all unavailable for the suite machinery => S1 fail. This mirrors seed #08's identical treatment of the same gstack preamble (T1 consistency).
>
> S2/S3/S5 pass: no publish-class actions anywhere in the body (the AskUserQuestion gates plus typed-confirmation rule for one-way doors are genuinely strong); no secrets handling; cost is session-bound consultation with no metered external spend. S4 passes — DESIGN.md and checkpoint commits land in the user's own repo where landing automation is the repo's own CI, accounted by the WIP:/explicit-commit discipline.
>
> R1a derivation: S-prefix = 0 passing rows (S1 fails) => hell-safe@low. R1b: secondary hell-safe@low recorded (derivation non-empty => mandatory). Primary heaven-native STANDS — the H-conjunction is untouched by the S1 fail (rubric §3.1), so the control still derives its required verdict cleanly.
>
> CHANGED vs prior revision: S1 pass -> fail (grounded in actual upstream content); tier none -> low (R1a bijection on S1-fail); secondary hell-safe@low added (R1b mandatory). U rows unchanged: U2/U3 fail on inspection (no externalized checkpoint state; whole-design gap, not one mergeable artifact) => ultra-ready conjunction fails cleanly.

## Known-miss cases

- (none - not audit-class)

## Labeling (next phase - leave EMPTY)

labeler:
confidence:
