# Where harnesses hide their skills

**A four-class taxonomy, from building five doors in one day.**

- **Date:** 2026-08-07
- **Programme:** Skill Heaven, Program 3 (prototypes) — `gaia-skill-tree#1336`
- **Harnesses probed:** Claude Code · pi 0.83.0 · codex-cli 0.146.0 · Hermes Agent 0.20.0 · grok 0.2.118
- **Status:** prototype findings. Doses are pinned to the versions above and are not standing guarantees.

---

## The question

A **door** is a launcher that boots an AI coding harness into a chosen posture — most usefully, a
posture where almost nothing is loaded. The premise is that a model does not need the bloat: if a
session's standing context can be cut by two-thirds without losing the ability to work, that is a
cost saving on every turn of every session.

Building one door is a product. Building five in a day turned out to be a research question,
because **every harness hides its skills somewhere different, and the differences are not
cosmetic.** Two of the five required abandoning the approach that worked on the others.

This note records the taxonomy, the measurement traps, and two findings that generalise beyond
Skill Heaven.

---

## The four classes

Across five harnesses, every suppression mechanism fell into one of four classes. Identifying the
class is most of the work; guessing wrong costs a probe campaign.

### Class 1 — Allowlist flags that read like suppression flags

The flag takes a list of scopes to **load**. Naming a scope *keeps it alive*. The instinct — name
the thing you want gone — is exactly backwards, and the resulting code looks correct in review.

| harness | flag |
|---|---|
| Claude Code | `--setting-sources` |
| Hermes | `--toolsets` |

This class produced the only defect that shipped. Claude's `curated` posture was fixed to use an
empty allowlist; its sibling `product-floor` kept naming `project` and therefore kept loading
project-scope skills. The two postures share a mechanism, and the fix was applied to one of them.

**Generalisation: when you fix an allowlist, grep for every other caller of the same flag.** A
per-posture fix on a shared mechanism is a per-posture bug.

### Class 2 — Native evict / readmit

One flag clears skills; another admits specific ones by path. The cleanest class to build
against — a curated posture falls out almost for free.

| harness | evict | readmit |
|---|---|---|
| pi | `--no-skills` | `--skill <path>`, repeatable |

### Class 3 — Config-home scoping

An environment variable relocates the harness's entire configuration root. Point it at a
session-scoped temporary directory and the harness sees an empty world.

| harness | variable |
|---|---|
| codex | `CODEX_HOME` |
| Hermes | `HERMES_HOME` |
| grok | `GROK_HOME` |

**The trap in this class is authentication.** A scoped config home contains no credentials, so
every probe fails — and it fails in a way that reads as "the suppression broke something" rather
than "the session cannot log in". Copy the auth file in before concluding anything.

### Class 4 — Skills already seeded onto disk

The skills are **files in the profile before the process starts**. No runtime flag can remove a
file. Flags that promise to suppress "preloaded skills" will not, because by the time the session
begins there is nothing to preload — there is only a directory.

| harness | what is on disk |
|---|---|
| Hermes | 108 bundled skills seeded into the profile |
| grok | 110 skills, including ones discovered from a **project-scope `.claude/skills` directory** |

This is the class that wastes a campaign, because the flags look right and the documentation says
they work.

**Heuristic: if suppression flags appear to do nothing, stop probing flags and go look at the
filesystem.**

---

## Measurement: three ways to be lied to

### 1. Models confabulate about their own skills

The obvious probe — *"list every skill you have available; if none, say NONE"* — is unreliable.
On pi, identical argv produced different answers across runs, including **skill names that appear
nowhere in the real listing**. A model whose skills have genuinely been removed will often invent
a plausible list rather than report an absence.

Free-text self-report is acceptable as a smoke test. It must never be the load-bearing
measurement.

Hard signals, in preference order:

1. **A disk-enumerating subcommand.** `grok inspect` reports what the harness discovers from
   disk, with per-source attribution. The best available instrument — look for one first.
2. **A cache or snapshot file.** Hermes writes `.skills_prompt_snapshot.json`; counting its
   entries returned exactly the 108 the CLI reported.
3. **Token counts.** pi's `--mode json` emits a real usage object. The input/cache split varies
   run to run, but `totalTokens` is stable across repeats of identical argv.
4. **A canary.** Place a skill containing a unique marker string, then ask for the marker. A model
   can invent a skill *name*; it cannot invent `HERMES_PATH_SKILL_LOADED`. This technique
   converted a presumed limitation into a working curated posture on two harnesses.

### 2. Documentation can be wrong about its own implementation

Hermes' `--ignore-rules` documents itself as skipping *"AGENTS.md, SOUL.md, .cursorrules, memory,
and preloaded skills"*. It does not skip preloaded skills.

Tracing the implementation: `--safe-mode` sets three environment variables; `ignore_rules` maps
to `skip_context_files` and `skip_memory` and nothing else. It never touches the toolset
configuration. Meanwhile the skills index is constructed **only** when `skills_list`, `skill_view`
or `skill_manage` are present in the resolved tool set — otherwise the skills prompt is the empty
string.

So the working lever was `--toolsets`, naming a set that omits `skills`. No filesystem work, no
scoped home, no auth trap. **No amount of black-box flag probing would have revealed why the
documented flag failed.** One grep of the harness's own source did.

### 3. An account limit is not a harness limit

grok was probed on a free-tier account. Several behaviours could not be verified, and the door
was left recipe-only for that reason. A finding that says *"this harness cannot do X"* when the
evidence only supports *"this account could not do X"* is a false negative that will be inherited
by everyone who reads it.

---

## Measured doses

Pinned to the versions in the header. Priced separately by posture; **never averaged**, because
the gap between the doorless and doorful floors *is* the cost of the door.

### pi 0.83.0

Ground truth is `totalTokens` from `--mode json`, each cell repeated.

| composition | totalTokens |
|---|---|
| baseline | 11,271 |
| `--no-skills` | 4,371 |
| `+ --no-prompt-templates` | 4,371 |
| `+ --no-context-files` | 2,831 |
| `+ --no-context-files --no-prompt-templates` (launchable floor) | 2,831 |
| `+ --no-extensions` (doorless) | 1,069 |

Note that `--no-prompt-templates` contributes **nothing** on this machine — measured alone it
leaves the total unchanged. It is retained in the composed floor because it suppresses a context
source that could be non-empty elsewhere, not because it was observed to save anything here.

Standing context falls **74.9%** from baseline to the launchable floor (11,271 → 2,831). The
door — the surface that keeps the launcher reachable — costs **1,762 tokens** (2,831 − 1,069).

**These savings are a property of the working directory, not of pi.** The ~6,900 tokens
`--no-skills` removes is *this* repository's ~53-skill project listing; the further ~1,540 from
`--no-context-files` is *this* repository's tracked `CLAUDE.md` (5,608 bytes). A different repo
would produce different absolute numbers. What generalises is the mechanism and the ordering
result, not the magnitudes.

A previously recorded ordering quirk on pi 0.80.10, where `--no-skills` adjacent to `-p` silently
lost suppression, **does not reproduce on 0.83.0**. Order-independent, measured both ways.

### Claude Code

From the prior F7 probe on 2.1.216: native 28,379 · doorless floor 19,661 · doorful floor 20,176.
The door costs **515 tokens**, and the product floor sits **28.9% below native**.

### Hermes 0.20.0

The skill count is a **hard** figure: `~/.hermes/.skills_prompt_snapshot.json` contains exactly
108 entries, matching `hermes skills list`.

The dose is measured as stable prompt-side usage (`input_tokens + cache_read_tokens`), each cell
repeated:

| composition | prompt-side usage |
|---|---|
| default toolset | 22,089 |
| `--toolsets terminal,web,file` | 7,938 |
| `+ --safe-mode` (floor) | 7,938 |
| `--toolsets …` `--ignore-user-config --ignore-rules` (product floor) | 7,938 |

A **64% reduction**, identical across repeats. Note that `--safe-mode` adds nothing on top of the
toolset allowlist — consistent with the source analysis above, since it never touches toolsets.
These are diagnostic usage fields, not a priced Skill Heaven dose.

This harness also produced the cleanest illustration of the confabulation problem: a free-text
floor listing, run against the composed floor, **invented four skill names**. The load-bearing
evidence here is the implementation gate plus the stable usage figures, not anything the model
said about itself.

### grok 0.2.118

`grok inspect` reports 110 skills — 75 user, 16 bundled, and 19 across three plugins. A scoped
`GROK_HOME` reduces this to 79 with authentication intact; a curated scoped home reports 1, with
the planted canary loading. No dose is claimed: the route is recipe-only pending a portable
mechanism for plugin and external-root suppression.

---

## Two findings that generalise

### A door does not suppress "skills"

The initial framing cost real time. What a harness loads is a set of **context sources**:

skills · rule and instruction files · memory · prompt templates · toolsets · plugins and MCP
servers · subagents

Skills are one class among several. Framing the problem as *skills* is precisely why the Hermes
and grok cases were missed on the first pass — Hermes' were files already on disk, grok's were
arriving from another harness's directories, and neither is visible if you are only looking for a
skills flag.

A posture is properly defined as **a statement about which context sources are admitted.** Under
that framing, Cursor's `.cursorrules` is not a special case; it is a rule-file source that slots
into the same matrix.

### A harness's context is not necessarily its own

grok's 110 skills are not all grok's. Verified by planting a marker skill in a disposable repo's
`.claude/skills/` directory: grok discovered it and attributed it as `project [claude]`. Its user
skills, meanwhile, come from `~/.agents/skills` — a shared agent-skills location — and one of its
loaded plugins is itself Claude-tagged.

So a single harness's session can be assembled from directories belonging to a *different*
product, a shared convention, and its own plugin system simultaneously. A "clean room" for one
harness is therefore not achievable by reasoning about that harness alone.

The correct operation is to **enumerate the sources**, not to assume they are self-contained.
`grok inspect`'s per-source attribution is what made this visible; a harness without such a
command would have hidden it entirely.

The suppression consequence is specific and worth recording: a scoped config home removed the
bundled and Cloudflare-plugin skills but left project scope untouched. Project-scope skills were
only evicted by writing an **exact discovered-path** ignore entry — a compatibility toggle alone
left them listed as `[disabled]` rather than removed, and no generic wildcard was demonstrated
that safely covers arbitrary external roots. That gap is why the grok door ships recipe-only.

---

## What this predicts

The taxonomy exists to make the sixth door cheap. Two data points, both from the same day:

- **Hermes** was probed without the taxonomy, from scratch, including a full negative-result
  campaign against the documented flags. Worker cost: **$8.32**.
- **grok** was probed after its mechanism class had been identified by hand in advance. Worker
  cost: **$0.59**.

These are not controlled measurements — different harnesses, different scopes, one model tier
apart — and should not be read as a 14× claim. They are recorded because the direction is large
enough to be worth testing properly, and because the mechanism is plausible: most of a probe
campaign is spent discovering *which class you are in*.

The falsifiable version: **adding a harness should require filling one row of a quirks table and
writing one probe record, with no change to the shared compiler beyond a new switch case.** If a
future door requires more, the abstraction is wrong and this taxonomy is the thing to revise.

---

## Limits

- Single-machine, single-operator. No cross-platform verification.
- grok findings are bounded by a free-tier account.
- Hermes' and grok's figures are diagnostic usage and disk counts, not doses priced under the
  Index protocol. They are directionally sound and not comparable with the pi and Claude numbers.
- Doses are pinned to specific harness versions. Delivery is via `npx` against whatever harness
  the user has installed, so **the harness version is the user's and can change without notice.**
  A dose is a statement about a version, never a standing guarantee — a door should report the
  version it actually launched.
- Nothing here is a benchmark result. These are engineering probes taken while building; the
  Hell/Heaven Index prices arms under a protocol this note does not follow.
