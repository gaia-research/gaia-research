# harness-probes — reproducible-sandbox tooling for the capability matrix

Supports `docs/labs/harness-capability-matrix.md`. Tooling that captures **inputs** for a
harness capability trial so a later reader can reconstruct byte-for-byte what a probe saw,
even though the harness **version** itself is expected to drift run to run.

Per the reproducibility requirement: harness version drift is fine and simply recorded;
the fixture skill set, the discovery-path config state, the exact prompt/argv/env, and the
observed output must all be pinned in a committed artifact.

## Contents

| Path | What |
|---|---|
| `snapshot.ts` | Read-only capture of a set of paths (files or dirs): sha256 content hash + size per file, no file contents. Hashing matches `census.ts`'s `scanContracts()` exactly (`sha256(file bytes)`) — do not invent a second hashing scheme. Never writes into the paths it reads; only ever pointed at real harness config dirs (`~/.codex`, `~/.pi`, …) in read mode. |
| `fixtures/test-echo-skill/SKILL.md` | The one fixture skill used across probes — content-hashed, so any probe artifact that references it by hash is reproducible independent of where it's copied to. |
| `runs/*.snapshot.json` | Output of `snapshot.ts` — what a real discovery path contained at probe time (paths + hashes only). |
| `runs/*.run.json` | Structured run records (`schema: "harness-probe/v1"`): harness + version, exact argv/env, the verbatim listing-probe prompt, observed output, model, run count, findings. |
| `runs/*.txt` / `*.jsonl` | Raw harness output, copied verbatim from the sandbox before it was discarded. |

## Usage

```bash
# Read-only snapshot of a harness's real discovery paths (never mutates them):
npx tsx scripts/hell-heaven-bench/harness-probes/snapshot.ts \
  --label codex-real-discovery-paths \
  --paths "~/.codex/config.toml,~/.agents/skills,~/.codex/skills" \
  --out scripts/hell-heaven-bench/harness-probes/runs/codex-real-discovery.snapshot.json
```

## Sandbox discipline

Every probe run in this directory follows the same shape:

1. A throwaway `$(mktemp -d)`-style sandbox (project dir + fresh harness home dir), never
   the real `~/.codex` / `~/.pi` / `~/.claude` / `~/.grok`.
2. Auth/credentials are **copied out** of the real config dir into the fresh one (read-only
   on the source) — never generated fresh, never written back.
3. The fixture skill (`fixtures/test-echo-skill/SKILL.md`) is copied into the sandbox
   project, not the real skill dirs.
4. Raw output is redirected to a file and copied into `runs/` before the sandbox is
   discarded; nothing here reproduces by re-running against a live, uncaptured environment.
5. Zero-mutation is checked after the fact (e.g. confirming a fresh `$CODEX_HOME` never
   grew a `config.toml` from a `-c` override) and recorded in the run's `.run.json`.

See `docs/labs/harness-capability-matrix.md` G1 (codex) and P1/argv-order (pi) rows for the
methodology each run record answers, and the 2026-07-29 run records in `runs/` for worked
examples.
