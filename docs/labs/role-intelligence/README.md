# Role intelligence, agent orchestration and cost-aware model routing

**A research package. Nothing in it changes active dispatch, global memory, or approval policy.**

- **Date:** 2026-10-22
- **Branch:** `research/bunny-role-intelligence-2026-10-22` in `gaia-research/gaia-research` — **local only**: not pushed, not merged, not deployed.
- **Lead:** Bunny / MiniMax
- **Thesis under test:** we route too much work to expensive models because we confuse overall intelligence with *role suitability*. The question is which model and which reasoning effort is genuinely effective **for a specific role**, and what the whole task costs per **verified** successful completion.

---

## Contents

| File | What it is |
|---|---|
| [`01-research-report.md`](01-research-report.md) | **Deliverable A** — the research report: what our own system actually is, the ranked repository shortlist, the most surprising observations, the role-by-role adjudication of the seven hypotheses, and the six answers to the mission's definition of done. |
| [`02-evidence-dataset.jsonl`](02-evidence-dataset.jsonl) | **Deliverable B** — 39 machine-readable evidence records (17 class A, 15 B, 6 C, 1 D) with source URL, SHA, date, model, effort, provider, harness, role, task class, sample size, grading method, outcome, cost, retries, human intervention, confounders and applicability. |
| [`03-role-routing-matrix.md`](03-role-routing-matrix.md) | **Deliverable C** — the role-routing matrix: economy-first candidate, capability floor, verified effort levels, price, confidence and escalation trigger for every major role; plus the seven configuration defects found in the live fleet. |
| [`04-prompting-playbook.md`](04-prompting-playbook.md) | **Deliverable D** — the seven prompting patterns the evidence supports, each with its measurement context and the condition under which it was *not* supported; the patterns that looked promising and did not survive. |
| [`05-gaia-memory-layer-proposal.md`](05-gaia-memory-layer-proposal.md) | **Deliverable E** — the memory-layer proposal: the three information types, the record schema, six candidate routing-knowledge records, the refresh/invalidation mechanism, and an explicit list of what it does not do. |
| [`06-local-experiments.md`](06-local-experiments.md) | **Deliverable F** — the five highest-value local experiments, with ground truth, arms, metrics, stop conditions, falsifiers, and the deterministic prerequisites that make them affordable. |
| [`07-corrections-and-verification.md`](07-corrections-and-verification.md) | The verification pass: every headline number re-read against its primary source, the six corrections applied to `01` and `02`, and what the verification did **not** change. |
| [`data/repo-shortlist.json`](data/repo-shortlist.json) | The ranked repository shortlist with evidence paths, grading method, cost accounting, evidence class, value and limits — plus the four non-repository sources and what was *rejected* as evidence. |
| [`data/fleet-telemetry.json`](data/fleet-telemetry.json) | Our own 65-run fleet telemetry (run-level tokens, cost, and per-agent model/status/phase/turns for 325 agent assignments), extracted deterministically. Per-agent rows carry no prompt, transcript or result content. |
| [`data/extract_fleet_telemetry.py`](data/extract_fleet_telemetry.py) | The extractor. Re-runnable; no sampling, no inference, absent fields stay `null`. |
| [`data/agent-pin-audit.json`](data/agent-pin-audit.json) | The 56-agent effort-pin audit result. |
| [`data/audit_agent_pins.py`](data/audit_agent_pins.py) | The auditor: model existence from the live catalog, effort support from the provider `thinkingLevelMap` and the antigravity provider map. |
| [`data/mission-cost.json`](data/mission-cost.json) | Measured consumption of this mission, from the canonical `/cost` skill: priced worker inference $0.1947; main-orchestrator cost **unavailable** (the harness reported none); grand total **unavailable** because 18 of 24 worker results have no priceable model and the skill fails closed rather than under-count. |

---

## Evidence classes used throughout

| Class | Meaning | Count here |
|---|---|---|
| **A** | Controlled or replayed runs with ground-truth grading, reproducible artifacts, meaningful sample size | 17 |
| **B** | Real production or development trajectories with recorded results, incomplete controls | 15 |
| **C** | Working routing / orchestration / grading machinery with no proven comparative outcome | 6 |
| **D** | Claims, hypotheses, README assertions, conceptual designs, promotional examples | 1 |

C is never promoted to A, and D is never promoted to C. A benchmark catalog or an evaluation script is **not** an experiment that completed.

---

## The short version

1. **Only three of the eight repositories are worth copying from.** `IvanNece/Multi-Agent-Architectures` (class A, 164 tasks × 8 configurations), `malusamayo/CRBugBench` (class A instrument, 995 ground-truthed tasks, no published multi-model results), and `Hikari9/auto-office` (class B outcomes — the only source with live run receipts). The rest are machinery or synthesis.
2. **The strongest evidence we found argues *against* naive cheap-tier routing** — and the reason is not that cheap models are bad, it is that a route below a capability floor converts a cheap attempt into an expensive escalation. Pass rate by escalation count: 100% → 62.3% → 10.7%.
3. **The reviewer role is where a cheap, high-effort model has the strongest support** — third-party routing policy, third-party trust grants, two live review gates closed by `gpt-6-luna@high`, and a ground-truth benchmark whose own README runs that exact role+model. It is still **unproven on recall and precision**, and that gap is what the experiments are for.
4. **Prompting beats model upgrades on the reviewer role by roughly 12× per unit cost** (+5.8 points recall for +10% cost, versus a five-month model evolution worth +24.2 points).
5. **Four things are wrong in our own fleet right now**, all fixable at zero cost: a degenerate tier ladder, two invalid effort pins on approved scouts, a stale reviewer description, and a provider price asymmetry of 2.7× for the same model name.
6. **The smallest evidence-backed change** is additive: fix the invalid pin, add a `reviewer-luna-high` agent, give the reviewer a machine-readable verdict contract — and change nothing about dispatch until a measurement exists.

---

## Reproducing the local artifacts

```bash
# our own fleet telemetry (deterministic; no inference, no network)
python3 data/extract_fleet_telemetry.py --out data/fleet-telemetry.json

# the 56-agent effort-pin audit (reads the live Pi catalog and model list)
python3 data/audit_agent_pins.py
```

Both scripts are read-only with respect to every repository and to the agent configuration. Neither writes to `~/.pi`, `pi-config`, or any dispatch surface.

---

## Boundaries honoured

- No change to active dispatch, `pi-config/agents/*`, `~/.pi/workflows/model-tiers.json`, `~/.pi/agent/settings.json`, the Bunny router, or any approval boundary.
- No write to `founder/MEMORY.md` — a pointer is *proposed* for owner review only.
- No modification to any external repository.
- No provider switching, no unapproved inference spend, no premium-model fanout. The two delegated research lanes that died on provider quota mid-run were replaced with deterministic GitHub API reads, and every arXiv claim was verified by fetching the abstract pages directly.
- No `max_turns` limit was set on any Pi subagent.
- This branch is local: not pushed, not merged, not deployed.
