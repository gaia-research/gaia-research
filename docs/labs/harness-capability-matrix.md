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
| Claude Code | **2.1.211** (`claude --version`); M2 re-check on **2.1.215** (macOS, 2026-07-19); **WS3 gate (a) on 2.1.216** (macOS, 2026-07-21) | empirical, headless `-p` runs in a throwaway project |
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

## WS3 verification gates — gate (a): `--resume` profile recomposition

**Milestone:** WS3 of
[`docs/plans/skill-heaven-continuation-plan.md`](../plans/skill-heaven-continuation-plan.md)
(gate table). **Date:** 2026-07-21. **Version:** Claude Code **2.1.216** (macOS,
this workstation; env knob re-verified for this version — see GA0). Model: haiku
for every run. Same listing-probe prompt `$Q` as the M0/M2 sections. Clean
throwaway project (no project skills). **Curated argv** below is the frozen T9
route: `--setting-sources project --strict-mcp-config --mcp-config
'{"mcpServers":{}}' --plugin-dir <heaven-set>` with
`CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1`; `<heaven-set>` is a hand-built plugin dir
whose sole skill is the distinctively-named `gate-a-probe` (so its appearance in
the listing proves the *new* curated profile composed at boot). Sessions are
created with `--session-id <uuid>` and resumed with `-r/--resume <uuid>`.

**Gate question (plan):** does `claude --resume <id>` with a *new*
`--plugin-dir`/`--setting-sources` profile compose the **new** profile at boot?
**Verdict: ✅ YES — but only via `--fork-session`.** Plain `--resume` applies a
profile's *additive* half only (new `--plugin-dir` skills are admitted) and
silently drops its *subtractive* half (`--setting-sources project` +
`CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` do **not** evict); the resumed session
rehydrates its original standing skills listing and layers the new plugin on top
— a **superset** dose, not the picked posture. Adding **`--fork-session`**
(resume into a new session id) rebuilds the system prompt from the current flags,
so the curated profile composes with **zero residual** (identical to a fresh
session) **while carrying the conversation history forward**.

| # | Command | Observed | Cell verified |
|---|---|---|---|
| GA0 | `strings ~/.local/share/claude/versions/2.1.216 \| grep CLAUDE_CODE_DISABLE` | `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` **present** (+ new siblings `…_CLAUDE_API_SKILL`, `…_CLAUDE_CODE_SKILL`, `…_POLICY_SKILLS`) | the undocumented T9 env knob **survives the 2.1.215→2.1.216 upgrade** |

> **Versioning policy (owner ruling, 2026-07-21):** the T9 env knob and the
> resume/fork recomposition behavior are now **assumed forward-stable** across
> Claude Code upgrades — no longer a per-upgrade blocking re-verify. The only
> standing obligation is to **record the exact `claude --version` used at each
> test** (as every row here does). Re-run the repro only if a symptom surfaces.
| GA-C1 | `echo "$Q" \| claude -p --model haiku` | 64-skill listing (user-dir + bundled CLI skills; incl. `graphify` residual); `gate-a-probe` **absent** | vanilla-fresh baseline on 2.1.216 |
| GA-C2 | `echo "$Q" \| CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --model haiku <curated argv>` (fresh session) | **`heaven-set:gate-a-probe`** only, **2/2 runs** | **T9 curated route re-verified on 2.1.216** — zero residual on a fresh session |
| GA-1 | `echo "$Q" \| CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1 claude -p --model haiku --resume <vanilla id> <curated argv>` | full 64-skill vanilla listing **+ `heaven-set:gate-a-probe`** appended, **2/2 runs** | **NEGATIVE for plain resume**: `--resume` is *additive-only* — the new `--plugin-dir` composes but the subtractive flags are ignored; the original standing dose persists → superset, not recomposition |
| GA-2 | GA-1 command **+ `--fork-session`** | **`heaven-set:gate-a-probe`** only (zero residual, == GA-C2) | **`--fork-session` recomposes the new profile fully** at boot — the subtractive half now applies |
| GA-3 | seed session with codeword `ZEPHYR-7`, then `--resume <id> --fork-session <curated argv>` asking for the codeword | **`ZEPHYR-7`** | fork **carries conversation history forward** (recomposition is not a fresh-context reset) |
| GA-3b | control: plain `--resume <id>` asking for the codeword | **`ZEPHYR-7`** | history carries on plain resume too — the GA-1 vs GA-2 difference is **purely skill composition**, not context |

**Zero-mutation check:** all writes confined to the scratchpad fixture; `~/.claude`
skills/settings byte-identical across runs (67 user skill dirs before/after);
`gaia-research` working tree carried no new changes from the probe. Session
transcript files are created by design (`-p` persistence) and are the only
on-disk side effect.

**Ruling — D12, RATIFIED 2026-07-21 (amends D10, rides this PR per D9):** the
honest switch delivers the picked posture on the *same conversation*, and the
relaunch command `/skill-heaven` prints is
`claude --resume <id> --fork-session <profile argv>` — **not** the bare
`claude --resume` D10 originally worded. Plain `--resume` would keep the user's
old standing dose and merely add the curated set, i.e. the tool becoming its own
bloat — the precise failure the scalpel exists to prevent. Forking is *better*
than the plan's flagged negative contingency: it preserves history **and**
recomposes, so no honest-new-session climbdown is needed. **Owner condition
(binding on WS4):** the switch creates a **new session id**, so the
`/skill-heaven` picker output, the statusline, and any copy **must make the fork
explicit** (same history, new id, composed at the picked posture) — forking is
ratified precisely *because* it is disclosed. The WS4 slice-1 step-2
relaunch-command builder must emit `--fork-session`, and its acceptance test
must assert the fork is surfaced to the user.

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
