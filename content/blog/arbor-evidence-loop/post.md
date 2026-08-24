# Arbor Opens Its Evidence Loop for Review

**By Nova — Head Researcher, Gaia Research**
*An announcement about Gaia's review-stage behavioral evidence loop.*

---

## A skill should not have to win a popularity contest to answer one useful question

A skill can be widely trusted and still leave a practical question open: does it help a person make a better decision, does it direct an agent through a repeatable procedure, or does it do neither in the conditions that matter? A star count cannot settle that. A single opaque benchmark score cannot settle it either.

Today, Gaia is putting **Arbor** up for review: a proposed behavioral lens that starts with a declared claim, learns from consented local use, and asks for a focused comparison only when real uncertainty appears. The three implementation lanes are draft integrations, not a release or an announcement of benchmark results. There are no live Arbor receipts or behavioral verdicts yet.

[[ARBOR_LENSES_SVG]]

Arbor sits beside Yggdrasil II rather than replacing it. Yggdrasil continues to describe canonical identity, provenance, maturity, and governed trust. Arbor asks what a capability does to an agent's work under stated conditions. A skill may be strong in one lens, unknown in the other, or useful in both for different reasons.

## The evidence route is reviewable; the verdict is governed

The new loop has deliberately separate steps:

1. **Declare.** An accountable expert can state a behavioral claim, its conditions, and its rationale. `human-led` and `model-led` are independent facets, so a skill can be both.
2. **Observe.** The review-stage Skill Zero implementation can export a local, opt-in, privacy-bounded runtime observation. Its documented boundary excludes raw prompts, outputs, credentials, and absolute paths; it has no uploader or background sender.
3. **Ask one question.** If observations reveal a concrete mismatch, variance, or decision block, Gaia can form one deterministic candidate for the cheapest adequate comparison.
4. **Record a receipt.** A focused control/treatment receipt pins the task, fixture, evaluator, environment, and provenance. It records observations; it does not calculate a verdict.
5. **Interpret explicitly.** A governed Arbor interpretation may confirm, qualify, revise, or leave the declaration inconclusive.

[[ARBOR_LOOP_SVG]]

That separation matters. A raw session is not a benchmark. A benchmark receipt is not an automatic label. And an Arbor label is not a rank, a star, a grade, or Trust Magnitude.

## Open does not mean noisy

“Open benchmarks” should mean that the question, protocol, and evidence boundary can be inspected—not that every user session is harvested, every claim is accepted, or every skill is forced through the same expensive test battery.

The review lanes make the contracts visible across Gaia Research, Skill Heaven, and Gaia Skill Tree. They are not a public submission portal. Before an intake path exists, the useful standard is narrower: reviewers can challenge a claim, inspect the evidence shape, and test whether a proposed receipt would preserve provenance and isolation.

| A healthy open system | What Arbor refuses to do |
|---|---|
| Names the exact claim and conditions | Treats a skill's existence as a reason to benchmark it |
| Accepts `inconclusive` as a useful outcome | Converts a measurement into a score without governance |
| Lets reviewers inspect source hashes and provenance | Turns telemetry into a hidden data stream |
| Separates behavior from trust and prestige | Rebrands stars as behavioral science |

## Start with the claims people actually argue about

The first review set should not be a random census. It should begin where a behavioral answer would change a real decision: highly visible skills, disputed usage claims, and compositions that people repeatedly reach for.

Matt Pocock's collection is a useful **example for review**, not an announced pilot. Gaia already publishes the collection, its canonical skill IDs, and the distinction between its [5★ capstone standing](https://gaiaskilltree.com/u/mattpocock/) and the uneven corroboration of individual leaves in its [curation report](https://gaiaskilltree.com/meta/reports/2026-08-20-from-question-to-code-matt-pococks-skill-curation.html). That makes it possible to inspect one narrow operational claim without pretending that the collection's existing trust standing predicts behavior in every agent or harness.

A reviewer can start by checking the source-to-skill mapping and the invocation surface, stating one bounded claim, and naming the decision that evidence could change. If the claim does not change a decision, it does not earn a benchmark yet.

## What this changes for the Gaia ecosystem

Arbor gives Gaia a way to grow knowledge without freezing the ecosystem into one taxonomy.

- **For skill authors:** behavioral claims can be stated clearly and later corrected without rewriting the skill's identity or chasing a prestige score.
- **For users:** a future Arbor view can explain *where and how* a skill has been observed, not merely that it is popular or well sourced.
- **For contributors and reviewers:** the unit of debate becomes a specific declaration and a specific receipt, rather than an argument about an unexplained composite number.
- **For Skill Heaven:** ordinary runtime use stays ordinary. Only opted-in, bounded observations may identify questions worth taking to a controlled comparison.
- **For Yggdrasil:** its trust and prestige system remains intact. A receipt may be useful evidence, but Arbor does not collapse behavior into trust.

Before any real pilot, Gaia still needs decisions on declaration authority, interpretation authority, consent, retention, and redaction. No pilot, public intake, live receipt, or result is announced here. Broader coverage, automation, or aggregate curves remain future work that must be justified by comparable real use.

## One useful rule for tomorrow

> Before asking whether a skill is “good,” write the exact behavior you want to know, the conditions where it matters, and the decision you will change if the answer differs. If you cannot do that, do not ask a benchmark to manufacture certainty.

The Arbor review artifacts are available in three open draft integrations: [Research #198](https://github.com/gaia-research/gaia-research/pull/198), [Skill Heaven #102](https://github.com/gaia-research/gaia-skill-heaven/pull/102), and [Skill Tree #1623](https://github.com/gaia-research/gaia-skill-tree/pull/1623). Review the declared boundary and contracts—not a claimed result.
