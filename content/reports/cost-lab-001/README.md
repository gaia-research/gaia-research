# Cost — Lab 001 / Research slot

**Agents systematically under-report their own token cost. How much, and why?**

*A Gaia Research lab. This is a research slot, not a completed report.*

---

## Abstract

When an agent is asked what a session cost, its answer may omit cache-read tokens, use a rate card
that has gone stale since its training cutoff, or lose pre-compaction turns from view. This lab will
measure the resulting gap between an agent's self-estimate, the vendor rate-card cost computed from
the complete session trace, and the invoice amount for the same window.

The goal is to establish whether under-reporting is systematic, quantify its size and direction,
and attribute each gap to a concrete failure mode. The study will use redacted, consented session
snapshots and deterministic re-runs so that every reported comparison can be audited.

> **Will be filled by a lab run.** No measurements, distributions, or conclusions are reported in
> this scaffold. The sections below define the planned evidence and reproduction surface.

---

## Planned setup

| Comparison | Planned source | Recorded value |
|---|---|---|
| Agent self-estimate | Session response after the cost question | Reported USD and stated assumptions |
| Rate-card truth | Complete JSONL trace priced by [`skill-cost`](https://github.com/gaia-research/skill-cost) | Per-session USD, model mix, cache reads, and pricing snapshot |
| Invoice truth | Vendor invoice for the matching billing window | Actual billed USD and reconciliation notes |

The sampling protocol, invoice matching rules, privacy treatment, and signed-delta calculation will
be specified in [`METHODOLOGY.md`](./METHODOLOGY.md) before data collection begins.

## Planned result headline

The completed report will state the signed delta between agent self-estimate and invoice truth,
show its distribution across sampled orchestration sessions, and distinguish rate-card estimates
from invoice-reconciled totals. Charts will be added to [`charts/`](./charts/) once measured data is
available.

## Planned failure-mode attribution

For every under-reported session, the lab will decompose the gap into:

1. cache-read tokens omitted from the estimate;
2. price changes after the agent's training cutoff or a stale local rate card; and
3. pre-compaction turns that are invisible to the post-compaction agent.

The pricing catalog will be pinned for every run. LiteLLM's
[`model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)
is the intended canonical catalog; its revision will be recorded with the data.

## Planned artifacts

| Artifact | Location | Status |
|---|---|---|
| Sampling and reconciliation protocol | `METHODOLOGY.md` | Placeholder |
| Redacted session snapshots and comparison rows | `data/` | Not collected |
| Estimate-versus-truth charts | `charts/` | Not generated |
| Deterministic analysis and chart scripts | `scripts/` | Not written |

---

*Privacy: the eventual dataset will contain only redacted, consented snapshots. It will not include
session contents, credentials, or invoice account details.*
