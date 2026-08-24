R1 PREDICTION WORKSHEET - not a benchmark record (B4)

# Seed 13: Corpus map-reduce summarizer (fixed ledger schema)

> Everything below is a hand-label PREDICTION to be tested by the R2 procedure.
> This is not a benchmark record. Numbers trace to committed records or carry the
> dagger-sigil mark; none appear here. Labels live OUTSIDE hh-ledger.

## Metadata

seed-id: 13
skill-id: huggingface/huggingface-datasets
sha256-skill-md: eeca50adf211ea64a288b852938f85a5183b045c720dc696b62db9aa2ea8deb2
upstream: https://raw.githubusercontent.com/huggingface/skills/020194918dc4a27d5a5d9a154b6b56cc2bd21364/skills/huggingface-datasets/SKILL.md
band: hell
audit-class: no

> **R2 identity pin (2026-08-24):** exact source bytes are pinned at `huggingface/skills@020194918dc4a27d5a5d9a154b6b56cc2bd21364` / `skills/huggingface-datasets/SKILL.md`. Resolution: `canonical`. R1 rows below remain pre-trial predictions; measured acceptance/rejection follows `docs/skill-heaven/r2-trial-protocol.md`, never this worksheet. Any `TBD`, `NOT-RESOLVED`, or thin-evidence note below is the preserved R1 evidence history; this pin supersedes its source-availability claim, not its prediction.

## Dimension scores (binary predictions; pass condition/evidence per r1-stamp-rubric.md S2)

| dim | prediction |
|-----|------------|
| H1 | pass |
| H2 | pass |
| H3 | pass |
| H4 | fail |
| H5 | pass |
| S1 | pass |
| S2 | pass |
| S3 | fail |
| S4 | fail |
| S5 | pass |
| U1 | pass |
| U2 | fail |
| U3 | pass |
| U4 | pass |
| U5 | pass |
## Stamps (T9 multiplicative; exactly ONE primary)

primary-stamp: none-auto
secondary-stamps: none

## Hell-safe tier

hell-safe-tier: none
deny-list-status: adjacent

## Environment qualifiers

- deny-list-ADJACENT (T8 class 2): admission evidence missing and named — canary-secrets egress probe results plus a demonstrated private-scoped channel; until either lands, no hell-safe stamp may be derived
- information-flow/egress safety NOT CERTIFIABLE from text today (rubric preamble item 2) - open question carried, never certified
- environment (S4): upload landing zones (Hub repos) are external; behaviour of published artifacts downstream unprobed

## Notes

> Evidence basis: full upstream SKILL.md inspected (huggingface/skills@main, skills/huggingface-datasets/SKILL.md, 107 lines).
>
> DERIVATION DELTA vs template prior — LARGE, flagged for D9. The seed set predicted hell-safe@high + ultra-ready with the privacy/egress open question attached. Inspection RESOLVES the open question negatively under the rubric's own rule: the skill's Agent Traces section reads local session directories (~/.claude/projects, ~/.codex/sessions, ~/.pi/agent/sessions) — its own text admits traces "can contain prompts, file paths, tool outputs, secrets, or PII" — and INSTRUCTS uploading them to the Hub. S3's information-flow clause ("reads secrets ⇒ never instructs transmitting them onward") therefore fails conservatively: following the skill transmits session content that may contain credentials to an external service, private-repo default notwithstanding. Per rubric §3.2 an information-flow failure is treated as S2-class => hell-safe verdict = ∅. The opposing reading (the explicit warning + private default discharge the duty) is defensible but cannot be certified from text today — exactly what preamble item 2 reserves for the canary probe.
>
> Consequent verdicts: primary none-auto, tier none, deny-list-status adjacent (not `yes` — class 2 is admission-gated, and the DEFAULT core workflow, read-only Dataset Viewer API calls, is clean). H4 fails (batch data work, not interactive-loop), so heaven-native also fails; ultra-ready fails on U2 (no checkpoint state). If R2's canary probe clears egress AND a private-scoped channel is demonstrated, hell-safe re-derives from the remaining rows.
>
> U3 pass stands on the fixed-schema mergeable output (parquet/JSONL contracts); recorded as-is since it does not affect the withheld stamps.
>
> TIER RE-DERIVED UNDER R1a: none -> none (NO CHANGE). Mechanically the S-prefix is S1–S2 (S3 fail stops the run), which would derive @med — but rubric §3.2 routes an S3 information-flow-clause failure through the §5 deny-list override: none at EVERY bit pattern. The verdict is now a derivation result with the failing row named (S3, class 2), not a withheld prior — exactly what R1b requires a `none` to be.

## Known-miss cases

- (none - not audit-class)

## Labeling (next phase - leave EMPTY)

labeler:
confidence:
