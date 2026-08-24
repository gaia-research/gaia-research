# R2 execution runbook

No R2 attempt may launch unless `r2-preflight.ts` exits zero. The committed
manifest pins the fixture, evaluator, skills, matrix, run order, sandbox base
image, model snapshot, harness package, and the exact `skill-heaven` runtime
revision. The vendored runtime source is an auditable copy of that revision;
`runtime-dist/skill-zero.mjs` is the pinned executable bundle.

## Prepare and gate

```bash
npx tsx scripts/hell-heaven-bench/r2-prepare-harness.ts "$PWD/.r2-local/claude-2.1.165"
export R2_HARNESS_BUNDLE="$PWD/.r2-local/claude-2.1.165"
export R2_DOCKER_PROVIDER_NETWORK='<operator-created provider-only network>'
export R2_PROVIDER_EGRESS_ENFORCED=1
npx tsx scripts/hell-heaven-bench/r2-preflight.ts
```

The network assertion is not a bypass. It may be set only after the named Docker
network has been verified to block general egress while permitting Claude's
provider control plane. Evaluators always run under Docker `--network none`.
Credentials are mounted read-only from `~/.claude/.credentials.json`; the gate
reports presence only and never prints the file.

## Execute mechanically

```bash
npx tsx scripts/hell-heaven-bench/r2-run.ts --pilot "$PWD/.r2-local/runs"
# Allocate and complete the 10 blinded task-02 control pairs, preserving the
# concealed mapping separately, then run the promotion gate:
npx tsx scripts/hell-heaven-bench/r2-promote-pilot.ts \
  "$PWD/.r2-local/runs" "$PWD/.r2-local/completed-pilot-judges.jsonl" \
  "$PWD/.r2-local/private/pilot-concealed.jsonl"
# Only after that gate writes PILOT-PROMOTED:
npx tsx scripts/hell-heaven-bench/r2-run.ts --full "$PWD/.r2-local/runs"
```

The pilot is the randomized-order subset for tasks 02 and 11, loadouts placebo,
heaven-low, and hell-high, at repeats 0–4: 30 cells. The runner first writes
`PILOT-ENDPOINTS-PASSED`; only the separate gate can promote it after all 10
blind task-02 pairs have completed judgments and preserved mappings. The
remaining run is 570 cells; pilot cells are not repeated. Every launch gets a new append-only attempt
directory. Harness logs, runtime receipt, output tree, evaluator log, attempt
companion, and validated ledger record are retained. Endpoint failure is a valid
negative and is never retried. Infrastructure failures append an invalid attempt
and do not append a ledger record.

Tier-3 packets and concealed mappings are written to different, create-only
files:

```bash
npx tsx scripts/hell-heaven-bench/r2-allocate-blind.ts \
  .r2-local/runs/attempts-pilot.jsonl .r2-local/runs/attempts-full.jsonl \
  .r2-local/judge-packets.jsonl .r2-local/private/concealed-mapping.jsonl
```

Only validated genuine run artifacts may be promoted into tracked result shards.
Never commit `.r2-local`, credentials, a prepared harness binary, or an
operator-only concealed mapping.
