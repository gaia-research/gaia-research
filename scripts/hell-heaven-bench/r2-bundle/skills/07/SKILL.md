---
name: tradeoff-analysis
description: "Structured tradeoff analysis methodology — the 8-dimension comparison frame, tradeoff matrix template, and common tradeoff patterns. Use when evaluating design alternatives, comparing technology choices, or when the answer is 'it depends.'"
---

# Tradeoff Analysis

## The Central Question

Every design decision answers this:

> **"What does this optimize for, and what does it sacrifice?"**

If you cannot answer this clearly for a design, the design is not yet understood.

## The 8-Dimension Comparison Frame

Evaluate every design alternative against these fixed dimensions. Do not invent new dimensions — force the analysis into this frame so alternatives are comparable.

| Dimension | Key Question | Watch For |
|-----------|-------------|-----------|
| **Latency** | How fast must it respond? | P50 vs P99 distinction; latency budgets per hop |
| **Complexity** | How many concepts must be held in mind? | Operational complexity vs code complexity — they diverge |
| **Reliability** | What is the acceptable failure rate? | Partial degradation vs total failure; blast radius |
| **Cost** | What are the resource costs now and at scale? | Cost curves that are linear now but exponential later |
| **Security** | What is the attack surface? | Authentication, authorization, data exposure, supply chain |
| **Scalability** | What grows with usage, time, and org size? | The thing that scales worst is the bottleneck |
| **Reversibility** | How hard is it to undo this decision? | Data model choices are least reversible; API contracts are hard; implementation details are easy |
| **Organizational fit** | Does this match the team's actual ability? | A design the team cannot operate is a failed design |

## Tradeoff Matrix Template

For comparing N alternatives, fill this matrix:

| Dimension | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Latency | [rating + note] | [rating + note] | [rating + note] |
| Complexity | ... | ... | ... |
| Reliability | ... | ... | ... |
| Cost | ... | ... | ... |
| Security | ... | ... | ... |
| Scalability | ... | ... | ... |
| Reversibility | ... | ... | ... |
| Org fit | ... | ... | ... |
| **Optimizes for** | [1-line summary] | [1-line summary] | [1-line summary] |
| **Sacrifices** | [1-line summary] | [1-line summary] | [1-line summary] |

Ratings: use qualitative assessments (good/adequate/poor) with a concrete note explaining why. Numeric scores create false precision.

## Common Tradeoff Patterns

These pairs recur across system design. Recognizing the pattern accelerates analysis.

**Consistency vs. Availability** — CAP theorem and its practical implications. Strong consistency requires coordination; eventual consistency allows independent operation. Most systems need consistency for some data and availability for other data — the design question is where to draw the line.

**Simplicity vs. Flexibility** — Simple systems are easy to understand but hard to extend. Flexible systems handle change but are harder to reason about. Prefer simplicity unless you have concrete evidence that flexibility will be needed — not hypothetical future requirements.

**Latency vs. Throughput** — Optimizing for individual request speed often reduces total system throughput (and vice versa). Batching improves throughput but hurts latency. Streaming can sometimes improve both.

**Build vs. Buy** — Building gives control and fit; buying gives speed and maintained infrastructure. The hidden cost of "buy" is operational dependency. The hidden cost of "build" is maintenance burden.

**Centralization vs. Distribution** — Centralized systems are simpler to reason about but create single points of failure and scaling bottlenecks. Distributed systems are resilient but introduce coordination complexity.

**Optimization vs. Observability** — Aggressive optimization (caching, denormalization, precomputation) makes systems faster but harder to debug. Ensure every optimization comes with the monitoring needed to verify it works.

**Safety vs. Speed** — Guardrails (validation, type checking, review processes) slow development but prevent failures. The cost of skipping them is paid later, with interest.

**Present Cost vs. Future Cost** — Technical debt is borrowing from the future. Sometimes that's the right tradeoff — but name it explicitly and track the repayment plan.

## How to Use This Framework

1. **Identify the alternatives.** If you have fewer than 2, you haven't explored enough. If you have more than 5, narrow first.
2. **Fill the matrix.** Force every cell to have a rating and a note. Empty cells mean unexamined risk.
3. **Identify the dominant tradeoff.** Which 1-2 dimensions most differentiate the options? That is where the real decision lies.
4. **State what you are sacrificing.** The recommendation is incomplete without this.
5. **Ask: "What would have to be true for this to be the wrong choice?"** This is the most powerful question in tradeoff analysis. It surfaces hidden assumptions and identifies monitoring signals.
