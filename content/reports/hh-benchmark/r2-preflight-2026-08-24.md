# R2 execution preflight — blocked before attempt 1

**Outcome:** fail-closed. **Model runs: 0. Valid records: 0. Invalid attempt
records: 0.** The #2/#11 pilot was not launched, so the remaining 570 cells were
not launched and R2 is not complete.

Repository-local inputs are now pinned in
`scripts/hell-heaven-bench/data/r2/execution-manifest.json`: all 20 exact skill
bodies, 20 fixtures, evaluator tree, 600-cell cryptographic run order, Claude
Code 2.1.165 harness bundle identity, model snapshot
`claude-sonnet-4-20250514`, OCI base image digest, and Skill Heaven runtime
revision `822081b7083448ba57ce93819fb2539c4ef84dde`. The append-only runner and
separate concealed blind allocator are wired but did not execute.

## Exact external blocker

The execution host has no container runtime. Commands run from the feature
worktree on 2026-08-24:

```text
$ command -v docker
# exit 127, no output
$ docker version --format '{{.Server.Version}}'
sh: 1: docker: not found
# exit 127
$ command -v podman
# exit 127, no output
```

The durable preflight gate independently reported:

```json
{
  "gate": "container-runtime",
  "detail": "command: docker version --format {{.Server.Version}}; status=spawn-error; spawnSync docker ENOENT"
}
```

This host also has no declared provider-only Docker network. The gate therefore
fails `provider-egress-allowlist` unless both an operator-verified network name
and the explicit enforcement assertion are present. Setting the assertion
without enforcing the network policy would be a protocol deviation.

The pinned harness tarball was acquired and independently verified before the
blocker check: its SHA-512 integrity, four-file bundle tree SHA-256
`7348de8d950b41929645f7622e444ca6c76a4d03b5d162ae80891e45e775e419`,
and entry SHA-256 all matched the manifest. The final runner invocation exited
1 at preflight and created no output directory, confirming zero launch records.

The cross-repository pin itself is available and unchanged:

```text
$ git ls-remote https://github.com/gaia-research/skill-heaven.git refs/heads/dev/r2-hh-benchmark-runtime
822081b7083448ba57ce93819fb2539c4ef84dde  refs/heads/dev/r2-hh-benchmark-runtime
# exit 0
```

No fixture response was used as model behavior, no endpoint result was inferred,
and no empirical claim follows from this preflight.
