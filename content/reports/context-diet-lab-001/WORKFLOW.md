# Bake-off Workflow (reproducibility artifact)

The four-strategy compaction bake-off is a Claude Code **dynamic workflow**. The exact script
that produced Context Diet — Lab 001 is preserved here so the experiment can be replayed.

## What it does

1. **Inventory** — extract an exhaustive, atomic rule inventory from the original file (the
   scientific control). Each rule tagged `loadBearing` if CI-enforced/incident-codified.
2. **Compact** — run 4 candidate strategies in parallel (externalize, condense, telegraphic,
   hybrid), each producing a proposed rewrite + any linked files.
3. **Verify** — adversarially audit each candidate against the inventory: every rule
   present / weakened / missing (a rule moved to a linked file counts as present).
4. **Score** — disqualify candidates over the hard limit or that drop a load-bearing rule;
   winner = max faithfulness, tie-break on larger reduction.

## How to replay on a different context file

1. Edit the constants at the top of `bakeoff.workflow.js`:
   - `CLAUDE` → absolute path to the target file.
   - `LIMIT` / `TARGET` → the harness char budget and your headroom target.
   - The `CONSTRAINTS` string's "must stay fully inline" list → re-derive the do-not-touch set
     for *your* file (which sections are CI-enforced or incident-codified?).
2. In a Claude Code session in the target repo, invoke the workflow with that script.
3. Feed the returned `winner.claudeMd` + `winner.newFiles` to Phase C (apply), then run
   `context_diet.py <file> --json` for the after-measurement and `make_charts.py` for the charts.

See [METHODOLOGY.md](./METHODOLOGY.md) §4 for the full reproduction protocol and §5 for threats
to validity. The workflow is stochastic in candidate *wording* but deterministic in *which rules
must survive* — cache the winning corpus and re-score it for a strict replay.

> The canonical script is committed alongside this note as `bakeoff.workflow.js`.
