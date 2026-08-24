# Arbor evidence loop: local research tools

This is the `gaia-research` lane for [#196](https://github.com/gaia-research/gaia-research/issues/196), following the A1/A2 founder rulings and the Tree contracts on `dev/arbor-evidence-loop`.

## Boundary

`uncertainty-candidate.ts` consumes exported Skill Zero runtime observations and one declaration claim. It validates the privacy-bounded `gaia.skill-zero-runtime-observation/v1` shape, requires the exact declared skill content digest, and canonicalizes observations before hashing their source set. It emits either `null` or **one** deterministic candidate. A candidate is emitted only for a concrete mismatch, repeated-condition variance, or explicitly supplied decision-block signal. It names the exact claim/question, affected runtime conditions, telemetry source digest, and a cheapest adequate one-question control/treatment benchmark.

It does not make a queue, scheduler, score, coverage matrix, run-count policy, entropy curve, or claim verdict. It never reads prompts, outputs, secrets, or local paths from telemetry.

`targeted-receipt.ts` consumes a declaration claim, explicit control and treatment arm observations, explicit measurement observations, and explicit artifact/provenance digests. It validates and emits the Tree `gaia.arbor-benchmark-receipt/v1` contract. Control and treatment must pin the same task, fixture, and evaluator artifact digests. Measurements are copied as observations; the tool does not calculate a difference, infer a threshold, invoke a model, or declare/confirm/revise a claim. It does not require a run count.

The fixture test is deliberately not a benchmark: it walks a declaration-compatible claim through two checked-in telemetry exports, emits one candidate, and builds one conclusion-free receipt from fixture inputs. No harness, model, network, or real receipt run is involved.

## Usage

```bash
npx tsx scripts/arbor-evidence-loop/uncertainty-candidate.ts \
  --declaration declaration.json --claim-id diagnose-human-led \
  --telemetry observation-a.json --telemetry observation-b.json

npx tsx scripts/arbor-evidence-loop/targeted-receipt.ts \
  --declaration declaration.json --claim-id diagnose-human-led \
  --benchmark-id arbor-debugging --benchmark-version v0 \
  --control control-arm.json --treatment treatment-arm.json \
  --measurement measurement.json --provenance provenance.json
```

The output is canonical JSON with a trailing newline, so the same inputs produce the same candidate and exact digests. The Tree curator remains the only place that interprets a receipt: telemetry identifies questions, a targeted receipt records controlled observations, and governed Tree interpretation may later confirm, qualify, revise, or leave the declaration inconclusive.
