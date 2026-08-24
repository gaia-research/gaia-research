# R2 Workstream D: execution and analysis machinery

This machinery is deliberately receipt-first and does not run paid trials.

- `r2-execution.ts` expands only the preregistered task/loadout matrix and runs a pinned
  harness with `shell:false`; `--record` is mandatory. Sandboxes and inputs are disposable.
- `r2-collection.ts` appends validated attempt companions to JSONL shards, detects duplicate,
  incomplete, and unexpected cells, and creates **pending** blind assignments containing only
  artifact hashes. It never changes `hh-ledger/v1`.
- `r2-analysis.ts` emits deterministic quality confidence intervals, prediction correlation,
  confusion matrix, and entropy curve. Standing dose, invocation dose, whole-session tokens,
  and wall-clock remain separate fields.
- `r2-gates.ts` rejects incomplete collections and unreceipted claims, validates the frozen
  ledger, and hashes the exact matrix used.

Exact rungs and trial metadata remain companion data (`hh-r2-task-matrix/v1` and
`hh-r2-attempt/v1`) as specified by R2 Workstream A / PR #191. No ledger entries or results
are included here. A later execution change must vendor/parity-check those contracts rather
than inventing fields.
