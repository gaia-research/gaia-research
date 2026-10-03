# review-provenance v4 — committed run records

`results.json` is the exact artifact the Tree receipt `c0b1f8e4` pins
(sha256 `0bcee59e63697a5d7e09984579d922f215d746619f6fb64753214861efb88ebf`).
It was produced on 2026-09-29 and left untracked in the experiment worktree;
it is committed here byte-for-byte so the receipt's
`gaia-research:experiments/review-provenance/results/v4/results.json` URI resolves.

Each `v4-run-*` directory carries the same per-arm files earlier variants
committed (`eval.json`, `launch.json`, `prompt.txt`, `record.json`, `result.ts`)
plus `ABORTED.md` / `RUNNER-NOTE.md` where the runner wrote one. Raw session
transcripts and runner `.state` are not committed.

One sanitization, disclosed: in the per-run records only, the operator's local
state prefix `/Users/<operator>/.local/state/skill-heaven/issue-116/` is
replaced with `$RAGSEX_STATE/`. No other byte was changed; `results.json` is
untouched.

`rep3` and `rep5` are infrastructure aborts under the preregistered rule
(see `plan.json`), kept as records and excluded from scoring; `rep3b` / `rep5b`
are their reruns.

These are observations, not interpretations. The governed reading lives in
gaia-skill-tree as a separate curator record.
