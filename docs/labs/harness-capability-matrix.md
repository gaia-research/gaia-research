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
| Claude Code | **2.1.211** (`claude --version`); M2 re-check on **2.1.215** (macOS, 2026-07-19) | empirical, headless `-p` runs in a throwaway project |
| Codex CLI | current docs (July 2026); **0.144.6 local** (2026-07-19, quota-limited) | [developers.openai.com/codex/skills](https://developers.openai.com/codex/skills) + local probes |
| Cursor (cursor-agent CLI) | current docs (July 2026, CLI stable); **binary not installed locally** (2026-07-19) | [cursor.com/docs/cli](https://cursor.com/docs/cli/using) |
| pi (badlogic/pi-mono coding agent) | current docs (July 2026); **0.80.10 local, empirical** (2026-07-19) | [pi coding-agent skills docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md) + live runs |
| grok (Grok Build TUI, per D7) | **0.2.103 local, empirical** (2026-07-19) | `grok --help`, `grok inspect`, env probes — see grok column notes |

## The checked matrix

| Capability | Claude Code | Codex CLI | Cursor | pi | grok |
|---|---|---|---|---|---|
| Skill discovery | ✅ `~/.claude/skills` (user), `.claude/skills` (project), plugins, bundled CLI skills | ✏️📄 **native skills now**: `.agents/skills` (repo, scanned cwd→root), `~/.agents/skills` (user), `/etc/codex/skills`, bundled system skills — no longer `AGENTS.md`-only | ✏️📄 `.cursor/rules/` + `AGENTS.md`; docs now also list **Skills** alongside rules/MCP in the CLI surface | ✅ (0.80.10 live) `~/.pi/agent/skills/`, `~/.agents/skills/`, `.pi/skills/`, `.agents/skills/`, `package.json` `pi.skills`, plus arbitrary dirs via settings `skills` array | ✅ (0.2.103) **yes — Claude-compat**: `grok inspect` lists 90 skills (bundled + user), user set read from `~/.claude/skills`; also loads `~/.claude/CLAUDE.md` + `~/.claude/settings.json` |
| Discovery time | ✅ session start | 📄 session start (auto-detects changes; restart to force) | 📄 session start | 📄 session start (startup scan → names+descriptions into system prompt) | ✅ session start (`grok inspect` resolves per-cwd without a model call) |
| Session-scoped config | ✅ `CLAUDE_CONFIG_DIR` env + `--settings <file-or-json>` + `--setting-sources user,project,local` — **macOS caveat (2.1.215): fresh `CLAUDE_CONFIG_DIR` = "Not logged in"; credentials are Keychain-held, `.claude.json` copy is not enough (G3)** | ✏️📄 `$CODEX_HOME` env (default `~/.codex`) + per-invocation `-c key=value` overrides; ✅ auth propagates via `auth.json` copy into a fresh `$CODEX_HOME` (G1) | ✏️📄 **`CURSOR_CONFIG_DIR` env** (default `~/.cursor/cli-config.json`) — plan said "none known" | ✅(in-the-wild)+📄 dir-based: `.pi/settings.json` paths resolve relative to `.pi`; per-session `--skill <path>` additive flags | ❓ none found: `GROK_CONFIG_DIR` env probe had no effect (G2); config is `~/.grok/config.toml`; no scoping flag in `--help` |
| Skills listing suppressible per-session? | ✏️✅ `--disable-slash-commands` suppresses all skills **including `--plugin-dir` ones — T6 NEGATIVE, see below**; curated route is `--setting-sources project` + `--plugin-dir` (T8) | 📄 per-skill `[[skills.config]] path/enabled` in `config.toml` (restart required); ❓-deferred whether `-c` overrides reach `skills.config` per-session — **quota until 2026-07-25, repro in G1** | ❓ no documented per-session rules/skills kill-switch; config-dir scoping via `CURSOR_CONFIG_DIR` is the workaround; **binary not installed locally — ❓-deferred (G4)** | ✏️✅ `--no-skills` verified live **but intermittent**: 2 of ~9 floor runs still listed all skills (discovery race, P1 below); curated `--no-skills --skill <dir>` was clean in every run | ❓ **no suppression flag found** (`--help`, `inspect`); `--tools`/`--disallowed-tools` govern tools, not the skills listing |
| Eviction dirties git? | ✅ **no** via flags/env route (nothing on disk is touched; verified: suppression runs left the fixture repo byte-identical) | 📄 no for config-route (config.toml is user-level); yes if you delete tracked `.agents/skills` — so use the config route | 📄 **yes** for `.cursor/rules` (tracked); config-dir scoping avoids mutating them but cannot suppress them | 📄 no via `--no-skills`; yes only if deleting tracked `.pi/skills`/`.agents/skills` | ✅ no for any flags-only route; ❓ no eviction mechanism exists yet to evaluate |
| MCP support | ✅ full (`--mcp-config`, `--strict-mcp-config`) | 📄 tools | 📄 tools | 📄 yes | 📄 `grok mcp` subcommand (management CLI present; semantics unprobed) |
| Headless automation | ✅ `-p` / `--output-format json` / SDK — **note (2.1.215): `--output-format json` now emits an event array; final `type:"result"` event carries `result` + `usage`** | 📄 `codex exec`; ✅ `--json` emits JSONL events (`thread.started`/`turn.started`/… observed live, G1) | ✏️📄 `agent -p` headless mode is now stable (plan said "weakest") | ✅ `-p`/`--print` + `--mode json` live; **argv-order/race caveat P1** | ✅ flags exist: `-p/--single`, `--output-format plain\|json\|streaming-json`, `--json-schema` (existence-probed only; no model run) |
| Context/token introspection | ✅ `/context` (interactive); `--output-format json` returns full `usage` (input/output/cache tokens, cost) per run; OTEL `claude_code.token.usage` metric verified with console exporter | 📄 limited (`codex exec` JSON events carry token counts) — ❓-deferred: no completed turn observed (quota, G1) | ✏️📄 `/usage` + per-agent context meter in CLI (plan said "~none") — no documented machine-readable per-run usage; ❓ | 📄 limited; SDK exposes usage — ❓ verify locally | ❓ `--output-format json` may carry usage — unverified (no model run spent) |
| SessionStart-hook semantics | ✅ fires in `-p` mode, runs commands, injects `additionalContext`, loadable from a session-only `--settings` file (no shared state touched) | 📄 `.codex/hooks.json` exists in the wild (PostToolUse observed in `gaia-skill-tree@f07a057`); SessionStart equivalent ❓ | 📄 hooks for session start/end shipped in CLI ([changelog Jan 2026](https://cursor.com/changelog/cli-jan-16-2026)); config shape ❓ | ❓ no hook docs found; `--skill`/`--no-skills` flags make hooks unnecessary for Heaven | ❓ no hook surface found in `--help` |
| M2a prep: prompt-control flags (existence only — **no eviction claims, M2b unratified**) | ✅ `--system-prompt`, `--append-system-prompt`, `--system-prompt-file`, `--exclude-dynamic-system-prompt-sections` exist (2.1.215 `--help`) | ❓-deferred (quota) | ❓-deferred (no binary) | ✅ `--system-prompt`, `--append-system-prompt` exist (0.80.10 `--help`) | ✅ `--system-prompt-override` (alias `--system-prompt`), `--rules` exist (0.2.103 `--help`) |

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

## Empirical evidence — M2 re-checks (2026-07-19, macOS, this workstation)

Claude Code **2.1.215**, pi **0.80.10**, codex **0.144.6**, grok **0.2.103**; `cursor-agent` not
installed. Same listing-probe prompt `$Q` as above; clean throwaway project (no project skills)
unless noted. Model: haiku for every Claude run. **Environment difference vs the M0 container:**
this machine's user `~/.claude/CLAUDE.md` names the `graphify` skill, so even a fully suppressed
skills listing can still answer `graphify` from memory-file text — that residual is a *prompt
content* leak, not a skills-listing leak (prompt eviction is M2b, unratified).

| # | Command | Observed | Cell verified |
|---|---|---|---|
| T6 | `echo "$Q" \| claude -p --model haiku --disable-slash-commands --plugin-dir <heaven-set>` | curated skill **NOT listed** (answer = `graphify` residual, twice, incl. clean room) | **NEGATIVE**: `--disable-slash-commands` suppresses plugin-provided skills too — plugin re-admission does NOT survive it (contradicts the M0 "composes with `--plugin-dir`" note, which had only been tested without a plugin loaded) |
| T6-pre | same minus `--disable-slash-commands` | `impeccable` listed | `--plugin-dir` re-admission itself works |
| T7 | `CLAUDE_CONFIG_DIR=<fresh dir + skills/ + ~/.claude.json copy> claude -p --model haiku …` | **`Not logged in`** | ❓-deferred on macOS: credentials are Keychain-held and scoped away from fresh config dirs; the container T3 result stands for Linux. Repro above; needs a credential-export or `claude setup-token` route (G3) |
| T8 | `echo "$Q" \| claude -p --model haiku --setting-sources project --plugin-dir <heaven-set>` | `heaven-set:impeccable` + 12 bundled CLI skills; **all user-dir skills AND user CLAUDE.md gone** | **the working curated route on 2.1.215**: `--setting-sources project` evicts user-level customization while `--plugin-dir` re-admission stays live. Residual = bundled CLI skills (recorded; not evictable on this route) |
| P1 | `pi … --no-skills` floor probes, 9 runs, orders varied | 7× `NONE`, **2× full 54-skill listing** (one early hang >8 min also observed) | ✏️ `--no-skills` works but has an **intermittent discovery race** on 0.80.10 — floor runs must assert the probe and discard leak runs; not yet safe as an unattended benchmark floor |
| P2 | `pi -p "$Q" --no-skills --skill <impeccable dir>` (launcher demo d2) | `impeccable` only, every run | pi curated evict+readmit verified live end-to-end |
| G1 | `CODEX_HOME=<fresh + auth.json> codex exec --json --skip-git-repo-check "$Q"` | `thread.started`/`turn.started` JSONL, then **usage-limit error (quota until 2026-07-25)** | auth propagates into a fresh `$CODEX_HOME`; JSONL event stream confirmed; skills-scoping + usage-shape cells ❓-deferred with this exact repro |
| G2 | `grok inspect` (clean project) + `GROK_CONFIG_DIR=<bogus> grok inspect` | 90 skills listed (bundled + user from `~/.claude/skills`), identical under the env var | grok skill discovery ✅ empirical; `GROK_CONFIG_DIR` is not a scoping mechanism; no suppression flag exists in `--help` |
| G4 | `which cursor cursor-agent` | not found | every Cursor cell ❓-deferred locally: install `cursor-agent`, then rerun the T-series probes |

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

**Caveats — resolved by the M2 spike (2026-07-19, Claude Code 2.1.215, macOS):**
`--plugin-dir` re-admission does **not** work while `--disable-slash-commands` is active —
T6 came back NEGATIVE (the suppression eats the plugin's skills too). The plan's designated
fallback (T7, `CLAUDE_CONFIG_DIR` + curated `skills/`) is **auth-blocked on macOS** (Keychain-
scoped credentials; verified working only in the Linux container, T3). The route that shipped
in the launcher is **T8**: `--setting-sources project` + `--plugin-dir` + zero-server MCP flags —
user-dir skills and user CLAUDE.md evicted, curated set listed, bundled CLI skills remain as a
recorded residual. `DEFAULT_CLAUDE_MECHANISM` is frozen to `plugin-dir` *meaning the T8
composition*; `--mechanism config-dir` stays available so the T7 route remains reproducible
where file-based credentials exist. Still open: the two ❓ Codex cells (quota-deferred to
2026-07-25, repro in G1) and every Cursor cell (no local binary, G4).

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
