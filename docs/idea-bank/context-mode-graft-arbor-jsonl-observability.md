# Research idea: Context-efficient skill orchestration via offline JSONL and Arbor

- **Status:** Research proposal / unbenchmarked (2026-10-10)
- **Scope:** Gaia Research idea-bank; Gaia Skill Tree Arbor behavioral evidence; future Skill Heaven skill-ultra consumption
- **Source skills:** [Context Mode](https://github.com/mksglu/context-mode) (`mksglu/context-mode`), [Graft](https://github.com/trailhq/Graft) (`trailhq/graft`)
- **Candidate case:** October 15 rock-dashboards marathon, Opus orchestrator, conditional Context Mode activation
- **Not a release dependency.** No claim of demonstrated token savings or reliability improvements.

## Research question

Does opt-in Context Mode improve *total cost per correct completed orchestration* and recovery in lengthy multi-agent sessions, particularly when Graft already retrieves compact source spans? When does stacking Graft and Context Mode increase cost, latency or evidence loss?

Anecdote, not evidence: Rico uses Context Mode for Favor Church office automation; the owner's coding/orchestration flow is reportedly cheaper without it. Different workload distributions are a leading hypothesis.

## Approach: locally analyze existing session JSONL first

1. Obtain explicit owner authorization for local, read-only analysis of selected Pi/Claude orchestration-session JSONL; never indiscriminately scan home folders, private projects or unrelated users' sessions.
2. Parse sessions **offline** with Context Mode's local processing capabilities where supported; use low-cost models (e.g. Gemini 3.5 Flash Lite) for *bounded interpretation of sanitized extracts*, not blanket ingestion of raw prompts/logs.
3. Identify observed skill invocations and content hashes where available; loaded is not invoked, and proximity does not establish causality. Detect Graft retrieval, Context Mode activation/processing, plain tool output, compaction, re-search, retry and durable-handoff events. Record unknowns explicitly.
4. Emit a minimal local evidence ledger: source-session pseudonym, log digest, parser/schema version, event offsets or opaque references, timestamp buckets, skill ID/hash if verifiable, actor/harness/model, workload category, activation status, output bytes/tokens before/after where actually observed, usage/cost/cache accounting, repeats, outcome and missing-data flags.
5. Redact secrets, email addresses, people, absolute paths, prompts, raw model responses, and unneeded file contents **before any model call**. Raw JSONL stays local; no upload, remote API transmission of raw rows, background sender or automatic repository commit.
6. Preserve independent, code-readable provenance for summaries: deterministic parser computes numerical measurements; cheap models can suggest candidate patterns but cannot silently invent, overwrite, certify, or classify them.
7. Compare **A** Graft baseline; **B** Graft + selective Context Mode for high-volume outputs; optionally **C** full Context Mode routing in a disposable run. Pin task/fixture/environment/model/pricing where possible. Do not infer counterfactual savings from observational logs alone; replay matched read-only tasks when feasible.
8. Report total provider input/output/cache read/cache write and reasoning usage, monetary cost, tool calls, wall time, compactions, task quality, missed evidence and intervention overhead. Distinguish tool-output byte reduction from API bill reduction.
9. Stop or fall back if parsing is incomplete, output filtering hides evidence, context hooks cannot genuinely deactivate, or overhead swamps savings. Do not endanger marathon release gates.

## Gaia ownership and stamping

**Arbor (gaia-skill-tree)** owns conditional behavioral declarations and future narrow controlled receipts for Context Mode alone and the ordered Graft → Context Mode interaction. Existing Arbor contracts have `compresses-after`, `duplicates`, and `amplifies` edge relationships. Determine correct relation from evidence rather than presupposing synergy. Use canonical IDs and SHA-256 pins; retain the declaration → observation → focused receipt → governed interpretation separation. Runtime observational material is not automatically an Arbor benchmark or confirmation.

**Skill Ultra (gaia-skill-heaven)** is the eventual skill-usage stamping/consumer lane: make skill *loaded*, *invoked*, *active*, *material to behavior*, and *verified* distinguishable; propose a narrow interoperability contract after examining its actual terminology and owner. Do not put new Skill Ultra authority in Skill Tree, or confuse behavioral stamps with rank/Trust Magnitude.

**Gaia Research** houses study design, privacy rules and durable findings. Do not publish raw JSONL, private paths or nonconsensual telemetry.

## Deliverables / acceptance

- An explicit session-selection, consent, sanitation and provenance protocol.
- Read-only offline JSONL scout with bounded extraction, stable parser tests and unsupported-format reporting.
- Independent cost/accounting calculations and honest missing-data labels, with optional low-cost model interpretation after redaction.
- At least one reproducible A/B focused receipt with pinned inputs, environment and evaluator, or a documented inconclusive result.
- Arbor declaration/edge proposal and governed interpretation only when warranted.
- A Skill Ultra stamping integration proposal in its actual owning repository; no cross-repo schema duplication.
- A negative-results path showing conditions where Graft alone wins.

## Related foundations

- [Arbor registry and contracts](https://github.com/gaia-research/gaia-skill-tree/blob/main/registry/arbor/README.md)
- [Arbor review launch](https://github.com/gaia-research/gaia-skill-tree/blob/main/docs/meta/2026-08-24-arbor-review-launch.md)
- [Graft skill in Gaia Skill Tree](https://github.com/gaia-research/gaia-skill-tree/blob/main/.agents/skills/graft/SKILL.md)
- [Orchestrator tax research](./blog-idea-orchestrator-tax-cold-cache-reentry.md)
