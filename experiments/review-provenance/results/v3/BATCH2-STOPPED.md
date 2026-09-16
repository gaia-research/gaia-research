# v3 batch 2 (rep2 rerun + rep3–rep5): stopped by owner, NOT scored

- 8 arms ran concurrently in visible panes w7:p44–p4B (now archived in tab w7:tE).
- The owner stopped the batch, suspecting Antigravity provider instability.
- Observed before stopping: most panes showed "Response was truncated before completion". Every arm checked ended with stopReason=length at exactly 65532 output tokens in one turn. Two arms (rep2-treatment, rep3-control) reached idle and were evaluated (exit 1, file unedited); the other six were killed before evaluation.
- Pair 1 of v3, run earlier with two concurrent panes, had no length stops.
- Classification is an OWNER decision: under the committed rules a length stop is a model-ended outcome, but provider degradation under 8-way concurrency cannot be ruled out. Until ruled, these runs are excluded from all tallies and must not be rerun under the same ids.
