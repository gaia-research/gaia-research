# E — Gaia memory-layer proposal: routing knowledge as a first-class record

- **Date:** 2026-10-22
- **Status:** **proposal.** This document does **not** modify `founder/MEMORY.md`, `~/.pi/agent/settings.json`, `pi-config/agents/*`, `~/.pi/workflows/model-tiers.json`, or any active dispatch. It proposes a shape and a *candidate* payload for review.
- **Governance preserved:** tier-first model governance · explicit supported reasoning effort on every invocation · no unauthorized higher-tier escalation · Pi subagents without `max_turns` limits · existing approval and security boundaries · separation of model / role / harness / provider / reasoning effort.

---

## 1. What "the memory layer" actually is here (inspected)

There is no single file called the Gaia model layer. The relevant native surfaces are:

| Native surface | Shape | What it is good at | What it cannot hold |
|---|---|---|---|
| `gaia-skill-tree/founder/MEMORY.md` | dated, additive, newest-first prose snapshots | session state, decisions, what changed | structured per-role routing evidence with validity windows |
| `gaia-research/docs/labs/harness-capability-matrix.md` | version-pinned, dated, **method + verdict legend + corrections section** | "what was measured, and what it does not decide" | a queryable, per-role record with confidence and refresh rules |
| `pi-config/agents/*.md` | one persona per role with a pinned `provider/model:effort` | the *decision* (which route runs) | the *reason* and its evidence |
| `~/.pi/workflows/projects/*/runs/*.json` | per-run token usage, per-agent model/status/phase | raw observations | role-level outcomes, review quality |

**The gap this proposal closes:** today the *decision* lives in `pi-config/agents/*.md` with no recorded reason and no validity window, and the *evidence* lives in prose that no dispatcher can read. A routing change made from a hunch and a routing change made from a measured result look identical in the config.

---

## 2. The three information types must stay separate

The mission asks for three kinds of information, kept apart. Here is how they map onto native surfaces, and where each may and may not be written.

### 2.1 Stable governance — user-authorised policy and hard boundaries
- **Lives in:** `pi-config/agents/*.md` (the route pins), `pi-config/docs/subagent-thinking-levels.md` (effort rules), `~/.pi/subagent.json` (execution policy), and `founder/MEMORY.md` (the founder's ruling text).
- **May change only by:** explicit user authorisation. Never by a research result.
- **This mission changed none of it.**

### 2.2 Evidence-backed routing knowledge — versioned observations with confidence and applicability
- **New, small, reviewable.** Proposed location: `gaia-research/docs/labs/role-intelligence/routing-knowledge.jsonl` (the repo this package lives in) with a *pointer* in `founder/MEMORY.md` via the additive `memory-snapshot` skill, **only after the owner ratifies it**.
- **Holds:** the record schema in §3, populated from the evidence dataset.
- **May change by:** a new validated measurement, or an explicit invalidation.
- **Never** consulted automatically by a dispatcher in this first step. It is *knowledge*, not *policy*.

### 2.3 Working hypotheses — candidate rules awaiting local validation
- **Lives in:** this package's §6 and `06-local-experiments.md`, each hypothesis carrying the experiment that would settle it.
- **May not** be cited as a reason for a routing change until its experiment returns.

---

## 3. The record schema

One JSON object per line, matching the evidence-dataset shape but narrowed to what a *dispatcher* would eventually need. The field list is the mission's, plus the fields our own governance needs (validation, invalidation, and an explicit "unknown is unknown").

```jsonc
{
  "id": "RK-0042",
  "role": "code_reviewer",              // the role this is about
  "task_class": "bounded_repo_change",  // the class of work
  "model": "gpt-6-luna",
  "effort": "high",                     // a level the provider advertises
  "provider": "openai",
  "harness": "pi-subagent",             // the harness it was measured under
  "evidence_source": ["E-AO-02", "E-AO-03", "E-CR-02"],  // ids in 02-evidence-dataset.jsonl
  "quality": {"metric": "defect_recall", "value": null, "unit": "rate", "n": 0},
  "cost": {"kind": "usd_per_1m_tokens", "input": 0.10, "output": 0.50,
           "billing": "api", "measured": false},
  "confidence": "medium",
  "applicability": "task-scoped lanes only; not hard seams; requires a deterministic acceptance check upstream",
  "last_validated": "2026-10-22",
  "valid_until": null,                  // set when a model version or provider change lands
  "status": "hypothesis",                // governance | evidence | hypothesis | invalidated
  "notes": "Eligible and repeatedly used by a third party; no recall or precision measured."
}
```

**Invariants the store must enforce (this is the part that makes it safe):**
1. `effort` must be a level the provider's `thinkingLevelMap` advertises for that model — checked mechanically by [`data/audit_agent_pins.py`](data/audit_agent_pins.py). One of our own agents already violates this (E-LF-06).
2. `provider` and `harness` are mandatory, and **a record for one provider never transfers to another** (auto-office's rule: "never share runtime reliability, quota, dispatch-form, or adapter-trust evidence automatically across harnesses", E-AO-05 note in the same file). Provider price varies 2.7× for the same model (E-LF-08).
3. `quality.value` may be `null` **only** when `status` is `hypothesis`. A record that claims a measurement must carry `n` and a `grading_method`.
4. `confidence` is never raised by a *count*; a record's confidence changes only when its underlying evidence is re-graded or invalidated.
5. `billing` distinguishes `api` from `subscription`/`quota`; a subscription route's `cost` carries tokens and quota, never a fabricated dollar figure (E-LF-01).

---

## 4. Candidate records (the smallest reviewable change)

Six records, each traceable to the evidence dataset, each with the confidence and applicability that the evidence actually supports. **These are the proposed contents of `routing-knowledge.jsonl`.** They are candidates, not installed knowledge.

```jsonl
{"id":"RK-0001","role":"code_reviewer","task_class":"bounded_repo_change","model":"gpt-6-luna","effort":"high","provider":"openai","harness":"pi-subagent","evidence_source":["E-AO-02","E-AO-03","E-CR-02"],"quality":{"metric":"defect_recall","value":null,"unit":"rate","n":0},"cost":{"kind":"usd_per_1m_tokens","input":0.10,"output":0.50,"billing":"api","measured":false},"confidence":"medium","applicability":"task-scoped review lanes with a deterministic acceptance check; excludes hard seams","last_validated":"2026-10-22","valid_until":null,"status":"hypothesis","notes":"Eligible: a third party routes both reviewer roles to this route first, trust-granted it, and closed two live review gates with it; a ground-truth reviewer benchmark ships it in its own README. Superiority unmeasured: no recall, no precision, n=2 trivial defects."}
{"id":"RK-0002","role":"code_reviewer","task_class":"bounded_repo_change","model":"gpt-6-luna","effort":"high","provider":"openai","harness":"pi-subagent","evidence_source":["E-CR-05","E-CR-03"],"quality":{"metric":"review_comment_acceptance","value":null,"unit":"rate","n":0},"cost":{"kind":"usd_per_1m_tokens","input":0.10,"output":0.50,"billing":"api","measured":false},"confidence":"low","applicability":"any review route, any model: a precision floor is required before recall is optimised","last_validated":"2026-10-22","valid_until":null,"status":"hypothesis","notes":"In the wild 36.4% of agentic review comments were accepted and 56.3% rejected. Any reviewer, at any tier, needs a precision gate."}
{"id":"RK-0003","role":"worker","task_class":"bounded_with_deterministic_check","model":"gpt-6-luna","effort":"medium","provider":"openai","harness":"pi-subagent","evidence_source":["E-MA-05","E-AO-11","E-MA-06"],"quality":{"metric":"pass_rate","value":null,"unit":"rate","n":0},"cost":{"kind":"usd_per_1m_tokens","input":0.10,"output":0.50,"billing":"api","measured":false},"confidence":"low","applicability":"only where a deterministic acceptance check exists; never selected by a difficulty estimate alone","last_validated":"2026-10-22","valid_until":null,"status":"hypothesis","notes":"The transferable law is the capability floor, not cheapness: removing the too-weak tier recovered +9.8 points and halved escalations. Escalation pass rates decay 100% -> 62.3% -> 10.7%."}
{"id":"RK-0004","role":"code_reviewer","task_class":"hard_seam_change","model":"gpt-6.1-sol","effort":"high","provider":"openai","harness":"pi-subagent","evidence_source":["E-AO-14","E-CR-04"],"quality":{"metric":"defect_recall","value":null,"unit":"rate","n":0},"cost":{"kind":"usd_per_1m_tokens","input":2.00,"output":10.00,"billing":"api","measured":false},"confidence":"low","applicability":"changes touching requirements, authority, ownership, dependency, interface or acceptance seams","last_validated":"2026-10-22","valid_until":null,"status":"hypothesis","notes":"Escalation condition, not a preference. No measurement either way; the asymmetry of harm decides it."}
{"id":"RK-0005","role":"scout","task_class":"codebase_recon","model":"gemini-3.5-flash-lite","effort":"minimal","provider":"google","harness":"pi-subagent","evidence_source":["E-LF-02","E-LF-05"],"quality":{"metric":"discovery_completeness","value":null,"unit":"rate","n":0},"cost":{"kind":"usd_per_1m_tokens","input":0.30,"output":2.50,"billing":"api","measured":false},"confidence":"low","applicability":"file discovery and location; not judgement","last_validated":"2026-10-22","valid_until":null,"status":"hypothesis","notes":"Our fleet's dominant discovery model family; the only delegated lane that completed under provider quota pressure. No published measurement of scout quality."}
{"id":"RK-0006","role":"any","task_class":"any","model":"any","effort":"any","provider":"any","harness":"any","evidence_source":["E-LF-01","E-LF-04","E-LF-05","E-LF-08"],"quality":{"metric":null,"value":null,"unit":null,"n":0},"cost":{"kind":"billing_mode","value":null,"unit":null,"billing":"mixed","measured":false},"confidence":"high","applicability":"every routing record in this store","last_validated":"2026-10-22","valid_until":null,"status":"governance","notes":"Subscription-billed routes report tokens and quota, never a dollar figure. Provider is a cost axis (2.7x for the same model name) and a reliability axis (two routes failed 100% of assignments). Quota exhaustion on a cheap tier converts into lost work, so a fallback route must exist and be authorised in advance."}
```

`RK-0006` is the only one with `status: governance`, and it is the one that changes nothing about routing — it constrains *how records are written*. It is included because the mission's own instruction ("do not invent dollars for subscription-based runs") is a governance rule about record shape, and because it is the piece most likely to be forgotten.

---

## 5. Refresh and invalidation

The mission asks for a lightweight mechanism when new model versions arrive or local runs contradict earlier evidence. Proposed rules, reusing existing machinery:

**Refresh triggers**
| Trigger | Action |
|---|---|
| a model id disappears from `pi --offline --list-models`, or its `thinkingLevelMap` changes | every record for that model is marked `status: invalidated` with `valid_until` set, and a re-measurement task is opened. *This is checkable today with [`data/audit_agent_pins.py`](data/audit_agent_pins.py).* |
| a provider's price or availability changes | `cost` is recomputed from the Pi catalog; the record is re-dated, not re-graded |
| a local experiment returns a result | the record's `quality` is set from that result and `confidence` moves — **one step at a time**, never directly to `high` from a single run |
| a local run *contradicts* a record | the record is **not** silently edited. A new record is appended with `status: invalidated` on the old one, and both are kept. The store is append-only, like `founder/MEMORY.md` and like auto-office's trust-act log. |

**Invalidation is one-directional in spirit.** auto-office's trust model can be lowered by a query but only raised by an explicit, attributed act (E-AO-04). The same shape applies here: a measurement can *demote* a record; only a re-validated measurement can *promote* it, and promotion always requires naming the experiment that did it.

**Half-life.** auto-office's learner uses a 120-day half-life and a prior strength of 8 pseudo-outcomes for local evidence. We adopt the same numbers as *defaults*, flagged as un-tuned: they are engineering choices, not fitted values, and the mission's own warning ("not published empirical thresholds") applies to them too.

**Ceiling.** The record store stays small. A record that has not been re-validated in two half-lives and carries no live experiment is archived rather than deleted (the store is append-only; archived records move to `archived/` and are never edited).

---

## 6. Working hypotheses (not records)

Each is a candidate routing rule awaiting a local experiment. **None may be used as the stated reason for a dispatch change until its experiment returns.** These live in [`06-local-experiments.md`](06-local-experiments.md).

| # | Hypothesis | Settled by | Falsified by |
|---|---|---|---|
| H1 | `gpt-6-luna` at high is a *code reviewer* whose precision is at least equal to a premium reviewer on task-scoped lanes, at ~5-20× lower token cost | E-1 | precision below the premium reviewer by more than the cost difference justifies |
| H2 | A cheap reviewer *plus* a deterministic precheck beats repeated premium review on cost per verified defect | E-2 | the cheap reviewer's misses are not caught upstream and cost a full premium re-review |
| H3 | `gpt-6-luna` at xhigh is a viable routine orchestrator for bounded, multi-role work | E-4 | handoff loss or scope drift exceeds the saving |
| H4 | A `gpt-6-luna` worker clears the same acceptance rate as a `gpt-6.1-sol` worker on tasks with a deterministic check | E-3 | acceptance rate or maintainability drops materially at equal token spend |
| H5 | Fresh-context retries beat resumed retries at an equal token ceiling | E-5 (cheap, no model cost) | no measurable difference |

**H2 is the one the mission names as most valuable, and it is also the one the external evidence most directly threatens** (E-MA-03/04/05). It must be run with a *precision* metric, not a recall metric, or it will reproduce the mistake the field keeps making.

---

## 7. What this proposal explicitly does not do

- It does **not** change any `model:` or `effort:` pin in `pi-config/agents/*.md`.
- It does **not** change `~/.pi/workflows/model-tiers.json`, even though the ladder is degenerate (E-LF-07).
- It does **not** touch `~/.pi/agent/settings.json`, the Bunny router, the subagent execution policy, or any approval boundary.
- It does **not** write to `founder/MEMORY.md` — a pointer there is proposed *after* owner review, via the additive `memory-snapshot` skill only.
- It does **not** introduce a dispatcher. The store is knowledge; nothing reads it at runtime in this step. Building a reader before there is validated content would be an orchestration framework, which the mission forbids.
- It does **not** claim that any cheap route is *better* than a premium route. Six of the seven routing hypotheses remain unproven, and the record format above is built to keep that visible rather than to hide it.
