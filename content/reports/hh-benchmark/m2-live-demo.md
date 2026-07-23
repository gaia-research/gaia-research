# M2 live demo — vanilla vs. floor vs. curated (the tool in action)

> **Smoke/demo evidence, 2026-07-22.** Workstation run on Claude Code
> **2.1.216**, model **`sonnet` at `--effort low`**. Per **B5** this is *smoke
> evidence*, not a benchmark arm (benchmark arms run on clean sandboxed
> installs). It exists to show the `skill-heaven` bin actually composing the
> floor and curated postures live, and to **re-verify the T9/T9b routes on
> 2.1.216** (the `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` knob is undocumented and
> version-pinned — re-verify on every CLI upgrade).
>
> **Model note:** probes use Sonnet at low reasoning, not haiku. Haiku
> under-reports its own skill listing — during an earlier haiku pass it answered
> "NO" to a skill that was demonstrably loaded, the same self-report flake that
> falsified the 2026-07-21 gate-(a) pass. Sonnet-low self-reports reliably here;
> tokens remain authoritative regardless (**D12**).
>
> **The load-bearing figures — the floor and curated `perTurn` counts — are
> drawn from committed `hh-ledger/v1` records:** the floor **placebo** (30,661)
> + curated **heaven** (31,624) pair this run appended to
> [`data/ledger.jsonl`](../../../scripts/hell-heaven-bench/data/ledger.jsonl)
> (its **last two** records; `skillStanding 227` on the curated one is committed
> too). The **native** `perTurn` (46,849 ‡), the vanilla→floor **delta**
> (−16,188 ‡), and the `chars4` **invocation** dose (5,917 ‡) are **not
> committed** — the demo emits them to the gitignored `scripts/.hh-demo/` and
> they are marked **‡ = uncommitted workstation context** at each use below.
> They corroborate; the committed floor/curated numbers (and the +963 delta
> between them) are the claims. Reproduce with
> [`scripts/hell-heaven-bench/demo-m2-floor-live.sh`](../../../scripts/hell-heaven-bench/demo-m2-floor-live.sh).

## Method (why tokens, not self-reports)

The hard signal is the **token count** from `--output-format json` usage. A
model's own "is X listed?" answer is *corroborating only*. Where the two
disagree, **tokens win.** The token figure recorded per run is `perTurn`
(`input + cache_creation + cache_read + output`); because each probe answer is a
1–3 token reply, `perTurn` is dominated by the standing context (system + skill
listings), so the `perTurn` **delta** between postures is, to within a few
tokens, the standing-dose delta.

Doses are priced separately per **B1** (standing = the one-line listing a skill
costs every session; invocation = the full body, loaded on use). The floor is
the **own-placebo** anchor (**B2**) — our own same-harness no-skill run, never a
borrowed baseline.

## Result 1 — vanilla vs. floor: the probed skill drops out of the listing

Same repo, same probe (*"Is a skill named exactly `firecrawl-crawl` listed?
YES/NO"*), one flag-profile apart. `skill-heaven --posture floor` composes the
T9b route the bin prints for itself:

```
claude --disable-slash-commands --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
       --setting-sources project        # env: CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1
```

| Posture (record) | `firecrawl-crawl` listed? | `perTurn` tokens |
|---|:---:|---:|
| **native** (vanilla claude) | **YES** (`^YES` ✓) | **46,849 ‡** |
| **floor** (`--posture floor`) | **NO** (`^NO` ✓) | **30,661** (committed) |

**Live per-turn delta: −16,188 ‡ tokens** between vanilla and floor, on this
workstation's loadout (‡ = uncommitted workstation context; only the floor
30,661 is a committed record — the native pole and delta corroborate). The `firecrawl-crawl` probe flips **YES → NO** — the skill
is gone from the listing — corroborating the token drop. (Context, not a
measurement: this workstation has 67 skills installed under `~/.claude/skills`,
which is why vanilla carries so much standing weight; the floor evicts all of
them plus the bundled CLI skills.)

## Result 2 — curated re-admission of one real skill

`skill-heaven --posture curated --skill .agents/skills/impeccable` composes the
T9 route (`--setting-sources project` + `--plugin-dir` + the bundled-skills
knob) and copies the skill into a session-scoped plugin dir. Asked to enumerate
all available skills, the model returns **exactly one line**:

```
heaven-set:impeccable
```

| Posture (record) | enumerated listing | `perTurn` tokens |
|---|---|---:|
| floor | (`firecrawl-crawl` = NO above) | 30,661 |
| **curated (impeccable)** | **`heaven-set:impeccable` only** (`/impeccable/` ✓) | **31,624** |

**Floor → curated: +963 per-turn tokens** — one skill re-admitted, nothing else.
The tool's own `chars4` dose summary prices the skill independently:
`standing=227` (committed on the curated record) `invocation=5917 ‡` — an order-of-magnitude cross-check on the
re-admission (a different tokenizer over the skill's listing line vs. the live
harness prompt, so not expected to match the +963 to the token; both recorded,
neither collapsed into one number, **B1**).

## Result 3 — validator-clean ledger append

Three `hh-ledger/v1` records were emitted by the bin (validated at emit by
`record.ts`), and the floor **placebo** + curated **heaven** pair were appended
to the ledger-of-record and re-validated:

```
$ npx tsx scripts/hell-heaven-bench/ledger.ts validate
OK — 10 valid record(s)   # 8 → 10
```

| task | arm | `perTurn` | endpoint | model / harness | in ledger? |
|---|---|---:|---|---|---|
| `listing-probe-native` | heaven | 46,849 ‡ | `^YES` ✓ (listed) | sonnet·low / 2.1.216 | **no** — emitted to gitignored `.hh-demo/`, not appended |
| `listing-probe` | **placebo** | 30,661 | `^NO` ✓ (dropped) | sonnet·low / 2.1.216 | **yes** (appended) |
| `readmit-probe` | heaven | 31,624 | `/impeccable/` ✓ | sonnet·low / 2.1.216 | **yes** (appended) |

`skillsLoaded` for the curated record pins `impeccable`
`sha256:14c4642…` — the exact bytes of the SKILL.md loaded **this run**. Note
this differs from the 2026-07-18 R0 census sha (`2bc172…`, invocation 5548): the
skill file has been edited since the census, so the record pins the file as-run,
*not* the census artifact. (Re-running `census.ts` to refresh the R0 sha is
follow-up work, tracked separately.)

## What this does and does not prove

- **Does:** the `skill-heaven` bin composes floor and curated live on 2.1.216
  with zero shared-state mutation (`git status` clean in both repos, `~/.claude`
  untouched, temp dirs disposable); the T9/T9b routes survive the 2.1.215 →
  2.1.216 upgrade; the single-skill re-admission (**+963 per-turn** between the
  two **committed** records, floor 30,661 → curated 31,624, `heaven-set:impeccable`
  only) is real and token-measured; the standing-dose eviction (−16k per-turn vs.
  the native pole) is corroborating **uncommitted** workstation context (‡); the
  ledger round-trips clean.
- **Does not:** price any skill's *worth* (that needs paired task arms with N
  repeats + CIs, **B3**, on clean installs, **B5**), nor measure invocation dose
  live (stream-json instrumentation is a follow-up — `skillInvocation` stays
  honestly `null` for curated). The absolute `perTurn` levels are this
  workstation's 67-skill loadout in one session and drift with cache/cwd between
  runs (the eviction/re-admission **deltas** are the load-bearing claims, not the
  absolute levels); they are not a clean-install census. No claim here ships
  ahead of its benchmark (**B4**).
