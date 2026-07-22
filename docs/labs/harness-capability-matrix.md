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
| Claude Code | **2.1.211** (`claude --version`); M2 re-check on **2.1.215** (macOS, 2026-07-19); **WS3 gate (a) on 2.1.216** (macOS, 2026-07-21, corrected 2026-07-22); **M2 floor/curated (T9/T9b) re-verified on 2.1.216** (sonnet·low, macOS, 2026-07-22) | empirical, headless `-p` runs in a throwaway project |
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
| Skills listing suppressible per-session? | ✏️✅ `--disable-slash-commands` suppresses all skills **including `--plugin-dir` ones — T6 NEGATIVE, see below**; curated route is `--setting-sources project` + `--plugin-dir` + `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1` (T9, zero residual; supersedes T8) | 📄 per-skill `[[skills.config]] path/enabled` in `config.toml` (restart required); ❓-deferred whether `-c` overrides reach `skills.config` per-session — **quota until 2026-07-25, repro in G1** | ❓ no documented per-session rules/skills kill-switch; config-dir scoping via `CURSOR_CONFIG_DIR` is the workaround; **binary not installed locally — ❓-deferred (G4)** | ✏️✅ `--no-skills` verified live **but intermittent**: 2 of ~9 floor runs still listed all skills (discovery race, P1 below); curated `--no-skills --skill <dir>` was clean in every run | ❓ **no suppression flag found** (`--help`, `inspect`); `--tools`/`--disallowed-tools` govern tools, not the skills listing |
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
| T8 | `echo "$Q" \| claude -p --model haiku --setting-sources project --plugin-dir <heaven-set>` | `heaven-set:impeccable` + 12 bundled CLI skills; **all user-dir skills AND user CLAUDE.md gone** | ~~the working curated route~~ **SUPERSEDED by T9** (owner vetoed the bundled-skills residual, PR #67): `--setting-sources project` evicts user-level customization while `--plugin-dir` re-admission stays live, but bundled CLI skills remained on this route |
| T9 | T8 command + `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1` | `heaven-set:impeccable` **only** — zero residual, 2/2 runs (+2 more via the launcher, incl. one recorded) | **the frozen curated route on 2.1.215**: the env knob removes the bundled-CLI-skills listing while `--plugin-dir` re-admission stays live. ⚠️ knob is **undocumented** — found by string-probing the 2.1.215 binary (alongside `disableBundledSkills`/`getBundledSkillsRoot` symbols); version-pinned, re-verify on every CLI upgrade |
| T9b | `echo "$Q" \| CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --model haiku --disable-slash-commands --setting-sources project --strict-mcp-config --mcp-config '{"mcpServers":{}}'` | **`NONE`**, 4/4 unrecorded runs + 1/2 recorded runs (see T10 for the miss) | **the frozen floor route**: stacking `--setting-sources project` + the env knob on the T2 floor also kills this workstation's `graphify` user-CLAUDE.md residual — first zero-residual floor observed outside the lab container |
| T10 | T9b command with the probe asking for built-in commands too; also with `CLAUDE_CODE_DISABLE_POLICY_SKILLS=1` added | `/help, /code-review, /ultrareview, /fast, /loop` listed **in both cases**; under the standard `$Q` probe the model intermittently volunteers them (1 of 6 T9b-route runs) | **NEGATIVE**: built-in CLI slash commands are not skills, survive full suppression, and `CLAUDE_CODE_DISABLE_POLICY_SKILLS` does **not** remove them. Present in every arm (incl. vanilla) so they cancel across arms; floor probes assert `^NONE$` and keep intermittent-listing runs as honest endpoint failures |
| P1 | `pi … --no-skills` floor probes, 9 runs, orders varied | 7× `NONE`, **2× full 54-skill listing** (one early hang >8 min also observed) | ✏️ `--no-skills` works but has an **intermittent discovery race** on 0.80.10 — floor runs must assert the probe and discard leak runs; not yet safe as an unattended benchmark floor |
| P2 | `pi -p "$Q" --no-skills --skill <impeccable dir>` (launcher demo d2) | `impeccable` only, every run | pi curated evict+readmit verified live end-to-end |
| G1 | `CODEX_HOME=<fresh + auth.json> codex exec --json --skip-git-repo-check "$Q"` | `thread.started`/`turn.started` JSONL, then **usage-limit error (quota until 2026-07-25)** | auth propagates into a fresh `$CODEX_HOME`; JSONL event stream confirmed; skills-scoping + usage-shape cells ❓-deferred with this exact repro |
| G2 | `grok inspect` (clean project) + `GROK_CONFIG_DIR=<bogus> grok inspect` | 90 skills listed (bundled + user from `~/.claude/skills`), identical under the env var | grok skill discovery ✅ empirical; `GROK_CONFIG_DIR` is not a scoping mechanism; no suppression flag exists in `--help` |
| G4 | `which cursor cursor-agent` | not found | every Cursor cell ❓-deferred locally: install `cursor-agent`, then rerun the T-series probes |
| G5 | `which agent && agent --version` (owner ruling said Cursor "runs as `agent`") | `/Users/…/.local/bin/agent` → **`grok 0.2.103 (Grok Build TUI)`** | **NEGATIVE**: `agent` is grok's binary, not Cursor's — **owner confirmed** (PR #67): the tool believed to be Cursor here is grok; no Cursor CLI is installed, G4 stands |
| G6 | `which agent cursor-agent && agent --version && cursor-agent --version` (2026-07-20) | `agent` → symlink to `~/.local/share/cursor-agent/versions/2026.07.16-899851b/cursor-agent`; both report **`2026.07.16-899851b`** (Cursor CLI); `grok` is its own binary at **0.2.103** | **Supersedes G4/G5** (owner reinstalled Cursor CLI 2026-07-19 evening): `agent` == `cursor-agent` == Cursor CLI now. Cursor column probes unblocked; **audit any prior cursor-column evidence sourced via `agent` for grok contamination** before trusting it — see `docs/plans/skill-heaven-continuation-plan.md` WS6 |

Also load-bearing from `claude --help` (2.1.211): `--effort <low|medium|high|xhigh|max>` — the
effort axis the postures map onto (`Heaven · Auto · Ultra · Hell`) already exists as a
per-session CLI dial; and `--plugin-dir <path>` loads a plugin **for this session only**,
which is the curated re-admission mechanism Heaven needs after suppression.

### 2026-07-22 — M2 floor/curated (T9/T9b) re-verification on 2.1.216 (sonnet·low)

**Smoke evidence (B5), not a benchmark arm.** Workstation run on Claude Code
**2.1.216 (Claude Code)**, model **`sonnet` at `--effort low`** (haiku
under-reports its own skill listing — the self-report flake that falsified the
2026-07-21 gate-(a) pass; **D12**). Per **D12** the `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS`
knob is undocumented and version-pinned, so the T9/T9b routes are **re-verified on
every CLI upgrade — this row is that re-verification** for the 2.1.215→2.1.216
step. Driver: [`scripts/hell-heaven-bench/demo-m2-floor-live.sh`](../../scripts/hell-heaven-bench/demo-m2-floor-live.sh)
(the `skill-heaven` bin composes each route). Every number below is drawn from a
**committed `hh-ledger/v1` record**
([`data/ledger.jsonl`](../../scripts/hell-heaven-bench/data/ledger.jsonl),
`benchmarkId: hh-m2-smoke`, `recordedAt 2026-07-22T07:23Z`). The absolute
`perTurn` levels are this workstation's 67-skill loadout in one session and drift
with cache/cwd — the **eviction / re-admission** is the load-bearing fact, not the
absolute level (see the live-demo writeup for the native pole and the −16k delta,
which are workstation-only, uncommitted context).

| # | Command (composed by `skill-heaven`, model sonnet·low) | Observed (committed record) | Cell verified |
|---|---|---|---|
| T9b·216 | floor: `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --disable-slash-commands --setting-sources project --strict-mcp-config --mcp-config '{"mcpServers":{}}'`; probe = `firecrawl-crawl` listed? YES/NO | `firecrawl-crawl` = **NO** (endpoint `/^NO/` ✓); **perTurn 30,661** tok, `skillStanding 0` (`listing-probe`/**placebo**) | **T9b floor route survives 2.1.215→2.1.216**: `firecrawl-crawl` evicted from the listing (**YES→NO**; the native-pole YES is the gate-(a) fresh pole above, uncommitted here). Token count is the hard signal (**D12**) |
| T9·216 | curated: `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --setting-sources project --strict-mcp-config --mcp-config '{"mcpServers":{}}' --plugin-dir <heaven-set:impeccable>`; probe = enumerate all skills | `impeccable` re-admitted (endpoint `/impeccable/` ✓); **perTurn 31,624** tok, `skillStanding 227` (`readmit-probe`/**heaven**); enumeration self-report = `heaven-set:impeccable` only (corroborating, per the record note — **not** the hard signal) | **T9 curated route survives the upgrade**: env knob still honored on 2.1.216 (cross-check: gate-(a) row GA0 string-probed the knob **present** on this build), single real skill re-admitted. `skillsLoaded` pins `impeccable sha256:14c4642…` = the SKILL.md bytes loaded **this run** (differs from the R0 census sha `2bc172…` — file edited since census, not the census artifact) |

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

**Caveats — resolved by the M2 spike (2026-07-19, Claude Code 2.1.215, macOS; T9 revision
same day after the owner vetoed the T8 residual):**
`--plugin-dir` re-admission does **not** work while `--disable-slash-commands` is active —
T6 came back NEGATIVE (the suppression eats the plugin's skills too). The plan's designated
fallback (T7, `CLAUDE_CONFIG_DIR` + curated `skills/`) is **auth-blocked on macOS** (Keychain-
scoped credentials; verified working only in the Linux container, T3). The interim T8 route
left bundled CLI skills as a residual; the owner vetoed that, and the residual fell to
**T9**: `--setting-sources project` + `--plugin-dir` + zero-server MCP flags +
`CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1` — curated set listed with **zero residual**. Floor is
the matching **T9b** composition (T2 suppression + `--setting-sources project` + the env
knob), observed `NONE` with zero residual. Two standing caveats: the env knob is
**undocumented** (string-probed from the 2.1.215 binary — re-verify on every CLI upgrade),
and built-in CLI slash commands (`/help`, `/code-review`, …) survive suppression in every
arm (T10 negative — `CLAUDE_CODE_DISABLE_POLICY_SKILLS` does not remove them); they cancel
across arms but intermittently fail a strict `^NONE$` floor endpoint. `DEFAULT_CLAUDE_MECHANISM`
is frozen to `plugin-dir` *meaning the T9 composition*; `--mechanism config-dir` stays
available so the T7 route remains reproducible where file-based credentials exist. Still
open: the two ❓ Codex cells (quota-deferred to 2026-07-25, repro in G1) and every Cursor
cell (no local binary at probe time — and `agent` on this workstation was grok,
not Cursor; G4/G5. **Superseded 2026-07-20 by G6**: Cursor CLI 2026.07.16 is now
installed as both `agent` and `cursor-agent`; column re-probe pending, WS6 of
`docs/plans/skill-heaven-continuation-plan.md`).

## WS3 verification gates — gate (a): in-session profile recomposition (the posture slider)

**Milestone:** WS3 of
[`docs/plans/skill-heaven-continuation-plan.md`](../plans/skill-heaven-continuation-plan.md)
(gate table). **Date:** 2026-07-22 (corrected). **Version:** Claude Code
**2.1.216** (macOS, this workstation). Model: haiku for every run. Clean throwaway
project (no project skills).

> ⚠️ **Correction of the 2026-07-21 first pass.** The original gate-(a) writeup
> (and the D12 lock it drove) claimed `--resume --fork-session` **recomposes the
> curated posture subtractively with zero residual**. That was **falsified**: it
> came from the "ask the model to list its skills" method, which haiku
> **under-reports** — a freshly-added marker plugin *looks* like the whole
> listing was replaced when it was not. Re-probed **deterministically** below and
> the verdict flips. See RATIFICATION.md D12 (corrected) + supersession log.

**Method (deterministic).** Ground truth = **prompt-token count** from
`claude -p --output-format json`, summing
`usage.(input_tokens + cache_creation_input_tokens + cache_read_input_tokens)`.
The one trusted binary signal is **`firecrawl-crawl`** — a real *user-scope* skill
(`~/.claude/skills/firecrawl-crawl`) probed YES/NO; reliably YES at native, NO at
the clean-room floor, so it is the proxy for "user/global-scope skills present."
Marker-plugin self-listing is **never** trusted (that is what fooled the first
pass); additive-plugin presence is inferred from token deltas only. **Curated /
T9 argv:** `--setting-sources project --strict-mcp-config --mcp-config
'{"mcpServers":{}}' --plugin-dir <heaven-set>` + `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1`.

**Gate question (plan):** can an in-session relaunch (`--resume` /
`--resume --fork-session`) with a *new* profile compose the **picked** posture —
in particular, can it *subtractively* recompose while preserving history?
**Verdict: ❌ NEGATIVE for subtractive recomposition.** On a **continued session**,
**no flag or flag-combination — plain `--resume`, `--resume --fork-session`, or
any tested mix — evicts user/global-scope skills**: `firecrawl-crawl` survives
every resume/fork (confirmed across 3 flag combos + reruns). The additive half
works (new `--plugin-dir` composes) and restrictive flags shed ~6k tok of
*non-skill* weight, but the user-scope skill listing is resolved at a point in the
resume pathway the subtractive flags never reach. **`--fork-session` behaves
identically to plain `--resume` on composition** — it only forks the session id;
it does **not** recompose. History carries forward on both (codeword recalled).

**Consequence:** subtractive recomposition and conversation-history survival are
**mutually exclusive** on Claude Code 2.1.216. The fully-subtractive floor is
reachable **only at boot** (fresh session, T9 route) → **`claude-heaven` launcher
is the only path to the floor** (launcher-locked). The in-session `/skill-heaven`
scalpel can move **upward** (additive) and shed some non-skill weight, but cannot
descend below its launch floor. This is the **posture slider** the product ships.

**Poles (this run):** native fresh **≈25.2k tok (firecrawl YES)** · clean-room
fresh T9 **≈17.0k tok (firecrawl NO)**.

**The slider (continued-session sweep — each flag applied on resume, both
`--resume` and `--resume --fork-session`; tokens + firecrawl):**

| Route | On a continued session | Tokens | firecrawl | Read |
|---|---|---|---|---|
| GA0 env knob | — | — | — | `strings <bin>` → `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` **present** on 2.1.216 (+ siblings `…_CLAUDE_API_SKILL`, `…_CLAUDE_CODE_SKILL`, `…_POLICY_SKILLS`); T9 route survives the 2.1.215→.216 upgrade |
| A · `--plugin-dir` alone | **Honored** (additive) | ≈25.3k | YES | new skill admitted cleanly, fork or resume |
| B · `DISABLE_BUNDLED=1` alone | **Negligible weight here** (~50 tok) | ≈25.3k | YES | can't distinguish ignored-vs-low-impact in this env |
| C · `--setting-sources project` alone | **Partially honored** | ≈19.2–19.5k | **YES** | sheds ~6k *non-skill* tok, but user-scope skills **survive** |
| D · `--strict-mcp-config` + empty MCP | **No observable effect** | ≈25.5k | YES | no MCP servers present to evict in this env |
| E · full curated combo (A+B+C+D) | **Does NOT evict user-scope** | ≈19.2k (fork & resume; reruns 19.24k ×2) | **YES** | one initial resume run showed NO → **re-tested 2×, both YES**; treated as a haiku self-report flake, not a real mechanism |
| J1 · `--safe-mode` on resume | **Not honored** (fresh: honored) | ≈22.2k | **YES** (fresh: NO) | same signature as C/E — evicts fresh, silently fails to evict on any continued session |
| F · clean-room seed, resume with **no** flags (climb UP) | **Fully honored** | ≈25.8k | YES | omitting restrictive flags on resume restores native — the upward climb is instant/unconditional |
| G · clean-room seed **+ new `--plugin-dir`** (add at floor) | **Honored, stable** | ≈17.2k (×3) | NO | additive-from-floor = clean +233 tok delta, reproduced ×3 |
| H · `CLAUDE_CONFIG_DIR=<empty>` on resume | **Breaks resume** | ERROR | — | `"No conversation found…"` (session index is config-dir-scoped); copying the `.jsonl` in gets past that → `"Not logged in"` (Keychain auth). **Two-layer dead end** |
| J2 · `HOME=<empty>` on resume | **Breaks resume** | ERROR | — | same structural failure as H (HOME sets default config dir) |
| I · transcript re-inject via `--append-system-prompt` into a **fresh** clean-room session | N/A (new session, not a resume) | +68 tok (trivial history) … +1,745 tok (~1,400-word) over floor | NO | the one viable "subtractive + keep context" path, but it is a **new session** with **flattened text** history (no tool/turn state). Cheap; stays well below native |

> **Versioning policy (corrected 2026-07-22).** The 2026-07-21 "assume
> forward-stable, don't re-verify" relaxation is **reverted** as premature (a
> symptom surfaced on the *same* pinned version). The T9 knob and resume/fork
> behavior are **undocumented and version-pinned** → **re-run this sweep on every
> Claude Code upgrade**; always record the exact `claude --version`.

**Slider map (authoritative):**
- **Launcher-only floor** ≈17.0k, firecrawl NO — evicts bundled *and* user/global
  skills + MCP + non-project settings. Reachable **only** via `claude-heaven` at boot.
- **Scalpel floor (in-session)** ≈19.2–19.6k, firecrawl **YES** — can shed the top
  ~⅓ of the gap (via `--setting-sources project` / `--safe-mode`) but **cannot**
  evict user/global skills on any continued session.
- **Scalpel ceiling** — unbounded upward: omit flags to restore native (F);
  stack `--plugin-dir` freely (G), cheap and fully reliable.
- **Honored on a continued session:** `--plugin-dir` (additive) · omitting flags to
  climb up · adding `--plugin-dir` from a floor.
- **NOT honored (works fresh, fails on resume/fork):** `--setting-sources project`
  (partial — non-skill weight only) · `--safe-mode`. User-scope skill eviction: none.

**Escape-route verdict:** in-session user-scope eviction is **not achievable by
any route tested**. Config-dir/HOME swaps break `--resume` structurally, then hit
Keychain auth (G3). **Transcript re-inject (I) is the only viable "clean-room +
keep context" path** — but it is a *new* session with flattened text, suited to
handoff-notes continuity, **not** exact tool/turn-state resume. Net cost is cheap
(+68…+1,745 tok). **KEEP** as a clearly-labeled escape hatch, not as "resume."

**Recommended `/skill-heaven` slider stops (feeds WS4):**
1. **Native (default)** — no flags.
2. **Lean** — `--setting-sources project` (or `--safe-mode`): same-session ~25% cut;
   label honestly *"trims project/settings weight; does not remove your personal skills."*
3. **Add-ons** — `--plugin-dir` stacks, cheap, reliable in either direction.
4. **Clean-room = LAUNCHER-LOCKED** — labeled explicitly out of scalpel reach:
   *"True clean-room (evicts personal skills, MCP, bundled skills) requires
   restarting via `claude-heaven`; it cannot be reached mid-session."* Optional
   escape hatch: the transcript re-inject path, labeled *"new session, notes
   carried over."*

**Zero-mutation check:** `~/.claude/skills` = 67 entries, names diffed clean
before/after; `~/.claude/settings.json` SHA-256 unchanged; no
`settings.local.json` in either snapshot; only expected session-transcript files
written under `~/.claude/projects/`.

**Ruling — D12, CORRECTED & RATIFIED 2026-07-22 (supersedes the falsified
2026-07-21 lock; amends D10; rides this PR per D9).** Skill Heaven ships **both
surfaces in the MVP**: (1) **`claude-heaven` clean-room launcher** owns the
launcher-locked subtractive floor — the *only* path to the deepest Heaven, and
that scarcity is the enticement (clean-room-first); (2) **`/skill-heaven` upward
scalpel** moves posture in-session from the launched floor **upward**, carrying
history, and **must present the lowest heaven-mode as visibly locked to launcher
mode** (lock affordance in the picker/statusline). Every fork that changes the
session id discloses it. Full decision text in RATIFICATION.md D12.

## WS3 verification gates — gate (b): statusline API

**Date:** 2026-07-21. **Version:** Claude Code **2.1.216**. **Method note:** the
statusline renders only in the interactive TUI — it does **not** fire in headless
`-p`, so the settings shape and the input-JSON field set were confirmed by
**string-probing the 2.1.216 build** (`strings <bin>`) plus Claude Code's own
in-binary help text; a live stdin capture needs an interactive session (deferred,
repro below). Field *names* are authoritative from the binary; the nested
grouping follows Claude Code's documented statusLine schema.

**Gate question (plan):** the segment mechanism, its input JSON, and **where the
standing-dose number comes from** (census over the composed loadout at compile
time vs. live introspection). **Verdict:** the dose readout is
**census-derived, not live-introspected** — the statusline input **does** carry
live token counts (a `context_window` object: `total_input_tokens`,
`context_window_size`, `used_percentage`, …), but those are **running-session
usage** (whole conversation: system + skills + messages + tool results),
**not the loadout's isolated *standing* dose**. No field isolates the skills-only
standing number, so it must still come from `census.ts` over the active profile.
This resolves D10's "compile-time census vs. live introspection" sub-question in
favor of **census** for the *standing* number (consistent with B1/D4) — while the
`context_window` counts are available for a separate *running-usage* readout later
(invocation side, B1).

| # | Probe | Observed | Cell verified |
|---|---|---|---|
| GB-1 | `strings <bin> \| grep -A2 '"statusLine"'`; `--help` | settings block `"statusLine": { "type": "command", "command": "<path>" }`; convention `~/.claude/statusline-command.sh`; `/statusline` slash-command + `statusline-setup` subagent present | statusline is a **user-supplied command segment**, per-session settings — a shell command Claude pipes JSON to and renders the stdout of |
| GB-2 | `strings <bin>` field-name probe (2.1.216) | input JSON fields present: `session_id`, `transcript_path`, `cwd`, model `display_name`, workspace `current_dir`/`project_dir`, `output_style`, cost `total_cost_usd` / `total_duration_ms` / `total_lines_added` / `total_lines_removed`, `exceeds_200k_tokens`, `version`; **plus a nested `context_window` object** (`context_window_size`, `total_input_tokens`, `total_output_tokens`, `used_percentage`, `remaining_percentage`) **and a `rate_limits` object** (`five_hour` / `seven_day` `.used_percentage`) | the command receives **session + model + cost + live context-window token counts + rate-limit usage** on stdin (richer than the boolean threshold alone) |
| GB-3 | inspect GB-2 for a per-loadout *standing*-token field | `context_window.total_input_tokens` **is** a live token count, but it is **whole-session running usage** (system + skills + messages + tool results), **not** the skills-only *standing* dose; **no field isolates the standing number** | **dose-source = census over the composed loadout at (re)compile time**, NOT live introspection. The `⚡ native · 14.2k standing` number must come from `census.ts` over the active profile; `context_window.total_input_tokens` (or `transcript_path`) yields a *running-usage* readout later (invocation side, B1), but **never** the isolated **standing** dose. Correction: the earlier "only `exceeds_200k_tokens`, boolean not a count" claim understated the input — counts exist; they're just the wrong *scope* for the standing readout |

**Blocks:** WS4 step-1 statusline segment. The segment computes its standing-dose
number by censusing the profile it launched with (`claude-heaven` launcher floor,
or the posture the upward scalpel composed — D12), never from Claude's statusline
input. The `context_window` counts are usable for a **second, distinct** readout
(live running usage), clearly labeled apart from the standing dose.
**Deferred (needs interactive session):** a live stdin capture to confirm the
exact nested JSON shape at runtime (the field set above is from the 2.1.216
binary + in-binary help text; not yet observed live) — repro: set
`statusLine.command` to a script that appends stdin to a file, open an
interactive `claude`, read the file.

## WS3 verification gates — gate (c): plugin self-dose (D4)

**Date:** 2026-07-21. **Method:** the ratified census method — `makeListingLine`
(`- <id>: <description>`, whitespace-collapsed) + `tokenize` (chars4) from
`scripts/hell-heaven-bench/census.ts`, the same proxy every R0 number uses.
`/skill-heaven` and `/skill-hell` have no committed command definitions yet
(WS4), so **representative draft descriptions** are priced; final WS4 copy
re-prices with the same method and must stay under the budget this sets.

**Gate question (plan):** the standing tokens the `/skill-heaven` + `/skill-hell`
commands themselves add to every session (the tool must not be its own bloat).
**Verdict:** combined **≈57 tok/session** (chars4) with tight draft copy —
**negligible** (~0.4 % of the 14.2k native standing dose in the D10 mock). The
tool is not its own bloat, and the number is disclosed.

| Command | Listing line (chars) | Standing dose (chars4) |
|---|---|---|
| `/skill-heaven` | `- skill-heaven: Switch skill posture — floor, curated, or native; composes the profile and prints the fork-relaunch command.` (124) | ≈31 tok |
| `/skill-hell` | `- skill-hell: Locked door: Hell-mode benchmark status and ledger link; opens only when Hell is proven safe.` (107) | ≈26 tok |
| **combined self-dose** | | **≈57 tok / session** |

**Caveats:** chars4 is a proxy, not the Claude tokenizer (as everywhere in R0 —
recorded, swappable when a counted backend lands); descriptions are **draft** —
WS4 re-prices; if the listed id carries a plugin-name prefix
(`heaven-set:skill-heaven`), add ~4 chars/line (≈1 tok, negligible). **Discipline
(D4/B1):** this self-dose is disclosed and subtracted in every claim — it is the
only standing cost `claude-heaven`'s doors add (Heaven's purest form uses no
server). **Blocks:** WS4 steps 2–3 copy + README claims; the final command
descriptions must price at or below this budget.

## WS3 verification gates — gate (e): behavioral restraint (D13) — ❓ UNVERIFIED, research-pending

**Status:** ❓ **NOT YET RUN — research track (gaia-skill-tree).** Load-bearing
copy must not rely on this cell until it passes. Recorded here per D13 so the
claim is disclosed as unverified rather than assumed (M0 discipline; D8's
"will-not-work ledger is first-class").

**What D13 needs verified.** The physical posture slider (gate (a)) is
launcher-gated below the launch floor. D13 posits a **second, ungated downward
track**: a *heaven-native skill* (the `grilling` / "grill-me" class) that reaches
a posture **a notch below vanilla behaviorally** by **restraining the model's
*use* of skills that remain physically in context** — an intentional shift, not a
context purge. This is a **behavioral / prompt-adherence claim**, not a
context-composition one, so tokens won't measure it.

**Gate question:** does a heaven-native restraint skill **reliably suppress
invocation of other in-context skills** (and hold under adversarial "please use
skill X" pressure), across models (esp. the cheap tier), without a physical
purge? **Proposed method (when run):** compose a session with N known skills in
context + a restraint skill; issue tasks that would normally trigger those skills;
measure invocation rate with vs. without the restraint skill (objective:
suppression rate, false-restraint rate); repeat ×runs, report CIs (no
determinism). **Depends on:** gaia-skill-tree producing the heaven-native skill
set first (repo boundary: authored upstream, flows through marketing-tasks).
**Blocks:** any WS4 copy that promises "below-vanilla in-session" behavior; the
behavioral notch in the `/skill-heaven` slider UI. Until green, the MVP slider
ships **physical-only** (gate (a)); the behavioral notch renders as
"coming — research" and never as a working stop.

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
