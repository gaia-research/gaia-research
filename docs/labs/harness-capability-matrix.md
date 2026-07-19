# M0 — Harness Capability Matrix (verified)

- **Milestone:** M0 (pre-R0) of the Skill Heaven/Hell MVP —
  [`docs/plans/skill-heaven-hell-mvp-plan.md`](../plans/skill-heaven-hell-mvp-plan.md) §1,
  master RFC `marketing-tasks/deliverables/proposal/skill-heaven-hell-mvp-rfc.md` §1.2 row 1.
- **Date:** 2026-07-18
- **Method:** Claude Code cells were verified **empirically** on the version installed in this
  lab container (repro commands + observed output inline below). Codex CLI, Cursor, and pi
  cells are **doc-verified** against current vendor/maintainer documentation (citations per
  cell); their binaries were not runnable in this container, so every doc-verified cell that
  is load-bearing for M2 is flagged for a 10-minute local re-check before the pi port starts.
- **Verdict legend:** ✅ verified empirically · 📄 doc-verified (citation) · ✏️ **corrected**
  (the plan §1 working assumption was wrong or stale) · ❓ unverified / needs local re-check.

## Versions checked

| Harness | Version checked | How |
|---|---|---|
| Claude Code | **2.1.211** (`claude --version`) | empirical, headless `-p` runs in a throwaway project |
| Codex CLI | current docs (July 2026) | [developers.openai.com/codex/skills](https://developers.openai.com/codex/skills) |
| Cursor (cursor-agent CLI) | current docs (July 2026, CLI stable) | [cursor.com/docs/cli](https://cursor.com/docs/cli/using) |
| pi (badlogic/pi-mono coding agent) | current docs (July 2026) | [pi coding-agent skills docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md) |

## The checked matrix

| Capability | Claude Code | Codex CLI | Cursor | pi |
|---|---|---|---|---|
| Skill discovery | ✅ `~/.claude/skills` (user), `.claude/skills` (project), plugins, bundled CLI skills | ✏️📄 **native skills now**: `.agents/skills` (repo, scanned cwd→root), `~/.agents/skills` (user), `/etc/codex/skills`, bundled system skills — no longer `AGENTS.md`-only | ✏️📄 `.cursor/rules/` + `AGENTS.md`; docs now also list **Skills** alongside rules/MCP in the CLI surface | ✅(in-the-wild)+📄 `~/.pi/agent/skills/`, `~/.agents/skills/`, `.pi/skills/`, `.agents/skills/`, `package.json` `pi.skills`, plus arbitrary dirs via settings `skills` array |
| Discovery time | ✅ session start | 📄 session start (auto-detects changes; restart to force) | 📄 session start | 📄 session start (startup scan → names+descriptions into system prompt) |
| Session-scoped config | ✅ `CLAUDE_CONFIG_DIR` env + `--settings <file-or-json>` + `--setting-sources user,project,local` | ✏️📄 `$CODEX_HOME` env (default `~/.codex`) + per-invocation `-c key=value` overrides | ✏️📄 **`CURSOR_CONFIG_DIR` env** (default `~/.cursor/cli-config.json`) — plan said "none known" | ✅(in-the-wild)+📄 dir-based: `.pi/settings.json` paths resolve relative to `.pi`; per-session `--skill <path>` additive flags |
| Skills listing suppressible per-session? | ✅ **yes, three ways**: `--disable-slash-commands` (disables all skills), `--safe-mode` (all customizations off), `--bare`; suppression composes with `--plugin-dir` for curated re-admission | 📄 per-skill `[[skills.config]] path/enabled` in `config.toml` (restart required); ❓ whether `-c` overrides reach `skills.config` per-session — re-check locally | ❓ no documented per-session rules/skills kill-switch; config-dir scoping via `CURSOR_CONFIG_DIR` is the workaround | 📄 **yes**: `--no-skills` (disables discovery; explicit `--skill` paths still load) — exactly Heaven's evict+readmit shape |
| Eviction dirties git? | ✅ **no** via flags/env route (nothing on disk is touched; verified: suppression runs left the fixture repo byte-identical) | 📄 no for config-route (config.toml is user-level); yes if you delete tracked `.agents/skills` — so use the config route | 📄 **yes** for `.cursor/rules` (tracked); config-dir scoping avoids mutating them but cannot suppress them | 📄 no via `--no-skills`; yes only if deleting tracked `.pi/skills`/`.agents/skills` |
| MCP support | ✅ full (`--mcp-config`, `--strict-mcp-config`) | 📄 tools | 📄 tools | 📄 yes |
| Headless automation | ✅ `-p` / `--output-format json` / SDK (all M0 tests ran this way) | 📄 `codex exec` | ✏️📄 `agent -p` headless mode is now stable (plan said "weakest") | 📄 scriptable + SDK (`docs/sdk.md`) |
| Context/token introspection | ✅ `/context` (interactive); `--output-format json` returns full `usage` (input/output/cache tokens, cost) per run; OTEL `claude_code.token.usage` metric verified with console exporter | 📄 limited (`codex exec` JSON events carry token counts) — ❓ verify shape locally | ✏️📄 `/usage` + per-agent context meter in CLI (plan said "~none") — no documented machine-readable per-run usage; ❓ | 📄 limited; SDK exposes usage — ❓ verify locally |
| SessionStart-hook semantics | ✅ fires in `-p` mode, runs commands, injects `additionalContext`, loadable from a session-only `--settings` file (no shared state touched) | 📄 `.codex/hooks.json` exists in the wild (PostToolUse observed in `gaia-skill-tree@f07a057`); SessionStart equivalent ❓ | 📄 hooks for session start/end shipped in CLI ([changelog Jan 2026](https://cursor.com/changelog/cli-jan-16-2026)); config shape ❓ | ❓ no hook docs found; `--skill`/`--no-skills` flags make hooks unnecessary for Heaven |

## Empirical evidence — Claude Code 2.1.211 (repro commands)

All tests ran headless in a throwaway project `proj-a/` containing exactly one project skill,
`.claude/skills/test-echo-skill/SKILL.md`. Model: haiku (cheapest; the cells under test are
harness semantics, not model behavior). The listing-probe prompt used throughout:

```
Look at the list of available skills/slash-commands in your context. Reply with ONLY a
comma-separated list of their names, or NONE if no skills are listed.
```

| # | Command | Observed | Cell verified |
|---|---|---|---|
| T1b | `echo "$Q" \| claude -p --model haiku --output-format json` | `test-echo-skill` **listed** alongside user-dir + bundled skills (31 total) | project + user discovery at session start |
| T1 | same, plus `--tools ""` | listing gone (only built-in `help, fast`) | the skills listing rides with the Skill tool — disabling the tool drops the standing dose |
| T2 | same as T1b, plus `--disable-slash-commands` | **`NONE`** | full per-session skills suppression, in-harness, no files touched |
| T3 | same as T1b, with `CLAUDE_CONFIG_DIR=<fresh dir>` (credentials copied in) | user-dir-only skills (e.g. `session-start-hook`) **gone**; project skill still listed; fresh dir auto-seeded with bundled `skills/` copy; `~/.claude` untouched | session-scoped config dir; concurrent-session isolation is by construction (env-scoped, no shared mutation) |
| T4 | `--settings hook-settings.json` where the settings define a `SessionStart` command hook that touches a marker file and emits `additionalContext` | marker file created; model answered `YES` to seeing the injected context string | SessionStart hooks fire in `-p` mode, can inject context, and load from session-only settings |
| T5 | `CLAUDE_CODE_ENABLE_TELEMETRY=1 OTEL_METRICS_EXPORTER=console claude -p …` | `claude_code.token.usage` metric emitted (66 datapoint/descriptor lines) | OTEL token introspection works headless |

Also load-bearing from `claude --help` (2.1.211): `--effort <low|medium|high|xhigh|max>` — the
effort axis the postures map onto (`Heaven · Auto · Ultra · Hell`) already exists as a
per-session CLI dial; and `--plugin-dir <path>` loads a plugin **for this session only**,
which is the curated re-admission mechanism Heaven needs after suppression.

### Corrections to the plan §1 working assumptions

1. **Codex CLI has native skills** (`.agents/skills` + user/admin/system locations, per-skill
   enable/disable in `config.toml`) — the matrix row "Skill discovery: `AGENTS.md`" is stale.
   Codex is now a first-class skills harness for census purposes.
2. **Cursor has `CURSOR_CONFIG_DIR`** (plan said session-scoped config "none known") and its
   CLI gained session start/end hooks and a stable headless mode (plan said "weakest").
   Rules remain tracked files, so the "eviction dirties git" cell stays **yes** — Cursor
   stays on the documented-manual-recipe track for v1.
3. **pi ships the Heaven primitive natively**: `--no-skills` + repeatable additive `--skill`
   is evict-all + curated-readmit as two flags. The pi port (M2 second target) may need *no*
   custom mechanism at all.
4. **Claude Code needs no launcher**: suppression (`--disable-slash-commands`), scoping
   (`CLAUDE_CONFIG_DIR`, `--settings`, `--setting-sources`), re-admission (`--plugin-dir`),
   hooks (SessionStart in `-p` mode), and telemetry (`usage` JSON, OTEL) are all in-harness,
   per-session, and touch no shared state.

## Go/no-go for M2 (decision A)

**GO — hooks/flags in-harness route.** The thin-launcher route is demoted to fallback-only.

Rationale, tied to the acceptance tests (RFC §2):

- **AT-H1 (concurrent sessions):** flags/env are process-scoped; nothing shared is mutated —
  verified in T2/T3 (fixture repo and `~/.claude` byte-identical across suppressed + vanilla
  runs). A launcher that stashes/restores skill dirs would have to fight this property.
- **AT-H2 (crash-safe):** passes **by construction** on the flags route — there is no evicted
  state to restore. The launcher route would need journal + `doctor` repair for parity.
- **AT-H3 (measured below-vanilla):** `--output-format json` usage + OTEL
  `claude_code.token.usage` (both verified) give the measured side; `census.ts` (M1) gives
  the by-construction cross-check.
- **AT-H4 (repeatability):** no writes → no drift. T3's only side effect was inside the
  session-scoped config dir, which is disposable per session.
- **AT-H5 (zero-server):** the whole route uses no MCP server.

Shape for the M2 spike (not started here): `claude --disable-slash-commands` +
`--plugin-dir <heaven-set>` (or a `SessionStart` hook in a `--settings` profile that curates
the listing), spiked against the thin launcher only to record the evidence gap, per the RFC
"both spikes run, winner picked by evidence." pi port: `pi --no-skills --skill <heaven-set>`.

**Caveats the M2 spike must clear** (kept honest): whether `--disable-slash-commands`
suppresses *plugin*-provided skills alongside user/project ones in every configuration
(observed: yes, all 31 listed skills went to NONE); whether `--plugin-dir` re-admission
works *while* `--disable-slash-commands` is active (if not, the `CLAUDE_CONFIG_DIR` +
curated `skills/` dir route from T3 is the fallback — still in-harness, still zero shared
state); and the two ❓ Codex cells before its manual recipe is written.

## Sources

- Claude Code 2.1.211 `--help` + empirical runs above (this container, 2026-07-18).
- Codex skills: [developers.openai.com/codex/skills](https://developers.openai.com/codex/skills);
  [Skills in OpenAI Codex (fsck.com)](https://blog.fsck.com/2025/12/19/codex-skills/);
  [Codex CLI skills install guide (agensi.io)](https://www.agensi.io/learn/codex-cli-skills-install-skill-md).
- Cursor CLI: [Using Agent in CLI](https://cursor.com/docs/cli/using);
  [Headless CLI](https://cursor.com/docs/cli/headless);
  [CLI configuration (`CURSOR_CONFIG_DIR`, `cli-config.json`)](https://cursor.com/docs/cli/reference/configuration);
  [CLI changelog Jan 2026 (hooks, /usage)](https://cursor.com/changelog/cli-jan-16-2026);
  [Rules](https://cursor.com/docs/rules).
- pi: [coding-agent skills docs (`--no-skills`, `--skill`, discovery paths)](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md);
  [settings docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md);
  [pi-skills README](https://github.com/badlogic/pi-skills/blob/main/README.md).
- In-the-wild configs: `gaia-skill-tree@f07a057` `.codex/hooks.json` (PostToolUse hook),
  `.pi/settings.json` (`"skills": [".claude/skills"]` cross-harness reuse), `.claude/skills/`
  + `.agents/skills/` dual skill dirs.
