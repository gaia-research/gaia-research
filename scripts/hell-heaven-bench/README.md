# hell-heaven-bench — benchmark-of-record (TypeScript)

The Hell Heaven Benchmark's code-of-record, per the master RFC
(`marketing-tasks/deliverables/proposal/skill-heaven-hell-mvp-rfc.md`, Appendix A). The
Python scaffold in `marketing-tasks/scripts/hell-heaven-bench/` is the superseded H1
registry-proxy prototype — leave it alone.

| File | Milestone | What |
|---|---|---|
| `census.ts` | **M1 / R0** | Two-part-dose census: standing (listing line) vs invocation (full `SKILL.md`) — never one number. Artifact: `content/reports/hh-benchmark/r0-census.md` + `data/r0-census.json`. |
| `ledger.ts` | **M3 / R2 plumbing** | JSONL run ledger (methodology §6 + two-dose token categories). Always on: every run, manual or fleet, appends here. |
| `data/ledger.jsonl` | — | The ledger. Checked in; append-only. |

## Census

```bash
# Canon (gaia-skill-tree checkout as sibling — read-only; regenerates the R0 artifact):
npx tsx scripts/hell-heaven-bench/census.ts --canon ../gaia-skill-tree \
  --json content/reports/hh-benchmark/data/r0-census.json

# Any repo's local skill dirs (.claude/skills, .agents/skills, .pi/skills, .codex/skills).
# This is what Heaven's below-vanilla delta is computed from:
npx tsx scripts/hell-heaven-bench/census.ts --repo /path/to/repo
```

Tokenizer: `chars4` (`max(1, floor(chars/4))`) — H1-prototype parity, recorded in every
artifact, pluggable when a counted backend lands.

## Ledger

```bash
# Append (record JSON on stdin or via --record):
npx tsx scripts/hell-heaven-bench/ledger.ts append --record '<json>'
# Validate the whole file:
npx tsx scripts/hell-heaven-bench/ledger.ts validate
```

Record shape (`hh-ledger/v1`): benchmarkId, task, arm (`placebo|heaven|hell|ultra`),
skillsLoaded (id + `sha256(SKILL.md)`), model, harness {name, version}, repeatIndex,
tokens {system, skillStanding, skillInvocation, perTurn} (number or `null` = unmeasured —
never 0 for "didn't measure"), wallClockMs, objectiveEndpoint, judgeVerdict (Tier 3 only).

**There is no seed field, deliberately.** No target harness offers seed control; the design
is N repeats + confidence intervals. The validator rejects any record carrying `seed`.
The placebo arm is always our own same-harness no-skill run (`skillsLoaded: []`) —
published benchmark scores are calibration only.

## First real paired run (M3 exit criterion)

`hh-manual-001 / house-format-summary`, Claude Code 2.1.211 headless (`-p`), haiku, run
2026-07-18: same one-line-summary task with and without a single convention skill
(`gaia-house-format`), objective endpoint `^GAIA:` regex.

- **placebo × 2:** endpoint **fail** both repeats (model asks what the house format is).
- **heaven (1 skill) × 1:** skill invoked, endpoint **pass**, byte-exact format.
- Honest wrinkles, recorded in the ledger notes: the with-skill run cost *more* total
  tokens than placebo (multi-turn + invocation dose) — the skill bought task success, not
  token savings; net-save is an R2 question. A second with-skill repeat hit the harness
  session usage limit and was discarded as invalid, not appended.

Repro recipe: project dir with exactly one skill under `.claude/skills/` vs an empty dir;
`echo "$TASK" | claude -p --model haiku --output-format stream-json --verbose
--allowedTools "Skill,Read"`; doses computed with `census.ts` helpers
(`makeListingLine`/`tokenize`), skill invocation confirmed by `"name":"Skill"` tool-use
events in the stream.
