# Deterministic Evidence Pipelines: From Freehand Agent Instructions to Script-Backed Enforcement

- **Rank:** TBD (pending founder review)
- **Status:** Research finding — **not ratified**. Grounded in postmortem from a live pipeline run (2026-07-30); nothing here overrides gaia-skill-tree's `META.md` or `ev-pipeline` suite contracts.
- **Viability:** Very High (the pattern is already implemented — `ev_append.py` + `ev_stats_patch.py` land in PR #1383)
- **Potential:** High (generalises to any agent-written structured data, not just evidence collection)

## Core thesis

Any pipeline step where the specification is "produce output matching this format by
reading examples" is a **latent drift risk**. Format knowledge belongs in a script,
not agent memory. This pattern — discovered while running a Phase 0-4 evidence pass
against 11 named skills (`review/meta/intake-ev-seed`, PR #1383 in `gaia-skill-tree`)
— generalises beyond evidence collection to any pipeline where agents write structured
data consumed by a downstream compiler.

The compiler's permissiveness makes this invisible: `compile_data_lake.py` matches
by string containment and ingests whatever it finds verbatim. Format drift does not
fail loudly — it silently corrupts downstream signal (Trust Magnitude, in this case).
Once a malformed row is compiled and frozen with `<!-- injected: -->`, there is no
automated repair path.

## Key findings (source: postmortem 2026-07-30)

### 1 — ev_append.py: the "agent produces JSON, script owns format" pattern

Before the fix, agents hand-wrote markdown blocks directly into collector files,
recalling per-file delimiter rules, maintaining consistent field naming, computing
the correct section number by inspecting the file, and deduplicating against prior
runs. None of this was enforced mechanically.

**What broke:** field naming drifted (`Citations:` vs `citations` vs `Cited by`);
no URL dedup meant retries re-appended the same rows; TM-driving numeric fields
(`citations`, `reviewers`, `views`, `likes`, `comments`) were not in the skill
spec so agents did not scrape them; benchmark rows had no `provenance` field.

**The fix (`scripts/ev_append.py`):** the agent produces a **13-field typed JSON row**
(canonical field names, typed nulls for uncollected TM fields, explicit `provenance`
for benchmark rows). The script owns all formatting: block delimiters, section
numbering, date-stamping (`<!-- appended: YYYY-MM-DD -->`), URL dedup across both
file content and the current input batch. A retry is a no-op.

### 2 — ev_stats_patch.py: idempotent-by-key stats patching

Before the fix, agents hand-edited an HTML stats dashboard — opening the file,
reading cumulative `<td>` values by guessing cell identity, computing sums manually,
and appending a history row by mimicking prior output. No idempotency; double-runs
double-counted; format drift compounded across runs.

**The fix (`scripts/ev_stats_patch.py`):** five CLI flags (`--date`, `--skills-processed`,
`--new-rows`, `--live-urls`, `--dead-urls`), `--dry-run`, and strict idempotency by
date key. The script is the sole write path for the stats block. An agent never
touches the HTML directly.

### 3 — compile_data_lake.py is fully passive (no healing)

The compiler performs no validation, no dedup, and no format checking. It matches
collector blocks to skill IDs by string containment and appends whatever it finds
verbatim. Correctness is entirely determined by what goes in. There is no healing
step — `ev_append.py` is the enforcement point. This passivity is a feature (the
compiler is predictable), but it means the enforcement burden lives upstream.

### 4 — Curation worker determinism: the 6-rule checklist (Finding 7)

The same "recall-and-apply" failure mode appeared in the curation layer above the
evidence pipeline. Before the fix, curation workers re-ranked mapping options by
reading description text with no pre-stamped similarity scores. The same candidate
submitted twice could produce different MAP/DEFER decisions depending on worker and
option order.

**The lone-weak-match bug:** a candidate with exactly one option that was a weak
semantic match had no unambiguous rule. A Haiku-readiness audit (8 workers, 1 Opus
critic) confirmed: **6 of 8 workers chose MAP** for this case. Under the new
contract, all six correctly DEFER.

**The fix (6-rule exhaustive checklist):** `gaia dev prefill` pre-computes cosine
similarity via `all-MiniLM-L6-v2`, stamps `similarity` + `matchTier` (`strong` >= 0.72,
`weak` 0.45-0.72) into every `mappingOptions[]` entry before the worker sees anything.
The worker counts two integers (`nTotal`, `nStrong`) and applies first-matching rules:

| Rule | Condition | Decision |
|---|---|---|
| 1 | `artifactGate != "valid-skill"` | NOT_A_SKILL |
| 2 | `exactDedupe != null` | DUPLICATE |
| 3 | `ambiguity != null` | DEFER |
| 4 | `nTotal == 0` | NEW_GENERIC |
| 5 | `nStrong == 1` | MAP |
| 6 | all remaining | DEFER |

Rules 4/5/6 are exhaustive and mutually exclusive on integer inputs; no case falls
through. The lone-weak-match case (`nTotal == 1, nStrong == 0`) hits Rule 6: DEFER,
never MAP.

**Key design principle:** the worker counts integers from pre-stamped data — it does
not re-judge semantics. The semantic judgment happened once, offline, in `gaia dev
prefill`. A re-run produces the same integers and the same decision.

### 5 — Stage-1 evidence carve-out: real rows at curation time

Before the fix, all evidence collection was categorically forbidden during curation.
Three signals the crawler already held at fetch time (`github-stars-own`, `repo-own`,
`self-attestation`) were discarded and had to be re-fetched from scratch in the
downstream evidence pipeline.

**The fix:** exactly these three types are now permitted during discovery — from
already-fetched signals, no web search. These are **real canonical evidence rows**
in the same shape `gaia dev evidence` writes, not provisional estimates. TM is
computed at appraisal time; the curation worker does not declare it.

## Research questions this opens

1. **How far does the "script as enforcement point" pattern generalise?** Where in
   other AI-driven pipelines does agent-as-formatter create silent drift? What is
   the minimum set of properties a pipeline step must have for a script to fully
   replace the agent's formatting role?

2. **What is the minimum schema required for an evidence row to remain useful after
   the agent that created it is gone?** The 13-field JSON schema in `ev_append.py`
   is one answer for evidence collection — is there a general-purpose provenance
   model underneath it?

3. **Can the 6-rule checklist pattern be formalised as a design pattern for agent
   decision nodes?** The pattern is: pre-compute all inputs to integers/discrete
   labels offline; write exhaustive, mutually exclusive, first-match rules over
   those integers; the agent's job is counting, not judging. What is the class of
   decision problems where this pattern applies?

4. **Compiler passivity as a design choice vs. a risk.** `compile_data_lake.py`'s
   passivity is what makes it predictable and auditable — but it pushes all
   correctness upstream. Is there a principled way to add field-presence warnings
   without introducing healing that would mask upstream enforcement failures?

5. **Idempotency as a first-class pipeline property.** Both `ev_append.py` (URL
   dedup) and `ev_stats_patch.py` (date-key idempotency) make retries safe. What
   is the general formulation of idempotency for agent-written structured data?

## Connections

- **Yggdrasil II curate-v2 RFC1/RFC2/RFC3** (`gaia-skill-tree` — the curation
  determinism work that produced the 6-rule checklist and the Stage-1 carve-out)
- **Trust Magnitude computation** (`src/gaia_cli/trustMagnitude.py`) — why
  provenance invariants and numeric field completeness matter upstream of TM
- **PR #1383** (`review/meta/intake-ev-seed`, `gaia-skill-tree`) — the live run
  that surfaced all five findings above
- **gaia-curate-chain / gaia-draft-curate** — skill suite contracts affected by
  the curation determinism fix (stale `intakeAdapter.py` and `intake-approval.yml`
  references documented as open items in the postmortem)
- **Rank 15 (RF + SHAP/LIME Trust-Appraisal)** in this idea bank — a downstream
  consumer of well-formed evidence rows; benefits directly from the provenance and
  schema completeness enforced by `ev_append.py`

## Source material

- Postmortem: `founder/handovers/2026-07-30-POSTMORTEM-ev-pipeline-intake-seed.md`
  (in `gaia-skill-tree`)
- Branch: `review/meta/intake-ev-seed` / PR #1383 (`gaia-skill-tree`)
- Curate-v2 implementation: `dev/gaia-curate-v2-impl` (Finding 7 source branch)
