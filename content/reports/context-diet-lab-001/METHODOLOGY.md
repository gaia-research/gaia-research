# Context Diet — Methodology (Lab 001)

**Reproducible protocol for compacting an oversized agent-context file without losing rules.**

This document is written so a second run — on a *different* context type (a `.cursorrules`,
an `AGENTS.md`, a raw system prompt, a different repo's `CLAUDE.md`) — can replay the experiment
and produce a comparable before/after result. It is the "Methods" section of the Lab 001 report.

---

## 1. Problem statement

An agent-context file has a hard budget. Claude Code warns past **40,000 characters** and may
**truncate** beyond it, silently disabling whatever rules fell past the cutoff. The naive fix —
"delete the least important paragraphs" — is unsafe when most of the file is incident-codified
guardrails (any one of which, dropped, lets an agent ship a CI-breaking state).

**Goal:** get the file under the limit (target = limit − headroom) while provably retaining
**every rule**. This is a two-objective optimization: **maximize size reduction** subject to
**faithfulness = 100% of rules recoverable**.

## 2. Metrics (the five Context Diet / Benchmark 001 signals)

| Metric | Definition | How measured |
|---|---|---|
| **Token reduction** | Δ chars (and ~tokens = chars/4) vs original | `context_diet.py --json`, exact char count |
| **Faithfulness retained** | fraction of the original rule inventory still recoverable from the result (incl. linked files) | adversarial auditor vs ground-truth inventory (§4) |
| **Latency saved** | est. per-turn context-read reduction | proportional to token reduction; reported as method-level estimate |
| **Cost saved** | est. input-token savings per turn | tokens saved × input rate; method-level estimate |
| **Export validity** | result is valid Markdown, headings intact, links resolve | structural check + `context_diet.py` re-parse |

Char count is **authoritative** (the limit is defined in chars; tiktoken not assumed present).

## 3. Procedure

### Phase A — Baseline
```
python3 context_diet.py <FILE> --json > baseline.json
```
Records total chars, per-`##`-section chars, ranked compaction targets, and Δ to `--limit`
(default 40000). Byte accounting is exact: Σ section chars == total (verified by test).

### Phase B — Bake-off (the experiment)
Run **N candidate strategies in parallel**, each producing a *proposed* rewrite (never touching
the live file). Strategies used in Lab 001:

1. **Externalize + link** — move largest playbooks to `docs/agents/*.md`; leave stub =
   invariant + pointer. (Repo's existing pattern.)
2. **Condense in place** — strip retro/anecdote prose, bullet-ify, keep every rule; no new files.
3. **Telegraphic / caveman** — aggressive lexical compression of non-load-bearing prose to terse
   imperatives; preserve all literals. (Tests the faithfulness floor of pure compression.)
4. **Hybrid route** — externalize top-3, condense mid-size, keep enforced sections verbatim.

Each strategy honors **hard constraints**: no rule lost; a fixed set of CI-enforced sections stay
fully inline; exact literals preserved; valid Markdown; under target size.

### Phase C — Adversarial faithfulness scoring (the control)
Independently of compaction, extract a **ground-truth rule inventory** from the original: an
exhaustive list of atomic, testable directives, each tagged `loadBearing` if CI-enforced or
incident-codified. Then, per candidate, an **adversarial auditor** (prompted to *find dropped
rules*, default-to-missing under doubt) classifies every inventory rule as
**present / weakened / missing** against the candidate corpus (its `CLAUDE.md` **plus** any
linked files — a rule moved to a linked file counts as present).

- **Faithfulness** = present / total.
- **Disqualification gates:** (a) over the hard char limit, or (b) any load-bearing rule
  missing/weakened.

### Phase D — Winner selection
Among **qualified** candidates: **max faithfulness**, tie-break on **larger reduction**. The
winner's proposed `CLAUDE.md` + new files are applied to a branch; `context_diet.py` re-run
confirms `< limit` (the **after** measurement).

### Phase E — Report + charts
`make_charts.py` renders three privacy-safe PNGs (size before/after, per-section histogram,
bake-off scatter). The report is structured on the five metrics and cites the winning method.

## 4. Reproducing on a different context type

The protocol is file-agnostic. To replay:

1. **Point Phase A at the new file:** `python3 context_diet.py <NEWFILE> --json`. Adjust
   `--limit` if the target harness differs (Cursor, Windsurf, a raw API system prompt).
2. **Re-scope the do-not-touch set.** The "keep fully inline" list (Redaction Exemptions, Branch
   Scope, Class P/S, Authorization, Versioning hard rules — see `SKILL.md` §Constraints) is
   specific to `gaia-skill-tree`'s CLAUDE.md. For a new file, re-derive it: which sections are
   CI-enforced or incident-codified? Pass them as the protected set.
3. **Re-run the bake-off** (`context-diet-bakeoff` workflow / `/context-diet`) — the strategies
   generalize; only the inventory and protected set are file-specific.
4. **Report against the same five metrics** so runs are comparable across context types.

**Determinism note:** LLM compaction is stochastic. The *inventory* and *scoring* are the
reproducible control — re-scoring the same candidate corpus yields a stable faithfulness figure.
Re-generating candidates will vary in wording but not in which rules must survive. For a strict
replay, cache the winning candidate corpus and re-score it; report faithfulness as the stable
metric and size reduction as the achieved (run-specific) figure.

## 5. Threats to validity

- **Inventory completeness.** Faithfulness is only as good as the ground-truth rule list. Mitigate
  with a high-effort extraction pass aiming for over-completeness (60–120 atomic rules here) and a
  spot-check of load-bearing sections against the original.
- **Auditor leniency.** The auditor is prompted adversarially (default-to-missing) to bias against
  false "present" verdicts. A rule marked present must be *substantively* recoverable, not just
  keyword-matched.
- **Externalization ≠ deletion.** Moving detail to a linked file reduces the *in-context* size but
  the rule is still one hop away. Faithfulness counts it present; the report notes in-context vs
  total-corpus size separately so the trade-off is explicit.
