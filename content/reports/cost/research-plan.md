# When Agents Report Their Own Cost
## A Research Plan for Measuring Estimate-versus-Invoice Gaps

*Gaia Research · Planned study · No measurements reported yet*

---

> **Abstract.** Agents are routinely asked what a session cost, yet their answer can omit cache-read tokens, rely on a stale rate card, or lose pre-compaction turns from view. This planned study will compare each agent self-estimate with a complete rate-card total and the matching vendor invoice. It is a research plan, not a completed result: no measurements, distributions, or conclusions are reported here.

## 1. Research question

**Agents systematically under-report their own token cost. How much, and why?**

The study will measure the signed delta between an agent’s stated USD estimate and invoice truth,
then determine whether the direction and size of the gap are systematic across sampled
orchestration sessions.

## 2. Planned comparison

| Comparison | Planned source | Recorded value |
|---|---|---|
| Agent self-estimate | Session response after the cost question | Reported USD and stated assumptions |
| Rate-card total | Complete JSONL trace priced by `skill-cost` | Per-session USD, model mix, cache reads, and pricing snapshot |
| Invoice truth | Vendor invoice for the matching billing window | Actual billed USD and reconciliation notes |

## 3. Planned failure-mode attribution

For every under-reported session, the analysis will separate the gap into:

1. cache-read tokens omitted from the estimate;
2. price changes after the agent’s training cutoff or a stale local rate card; and
3. pre-compaction turns invisible to the post-compaction agent.

The pricing catalog will be pinned for every run. LiteLLM’s
[`model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)
is the intended canonical catalog; its exact revision will be recorded with the dataset.

## 4. Planned artifacts

| Artifact | Location | Status |
|---|---|---|
| Sampling and reconciliation protocol | `METHODOLOGY.md` | Placeholder |
| Redacted session snapshots and comparison rows | `data/` | Not collected |
| Estimate-versus-truth charts | `charts/` | Not generated |
| Deterministic analysis and chart scripts | `scripts/` | Not written |

---

*Privacy: the eventual dataset will contain only redacted, consented snapshots. It will not include
session contents, credentials, or invoice account details.*
