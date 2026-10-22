# 07 — Verification pass and corrections log

- **Date:** 2026-10-22
- **Scope:** every headline number in [`01`](01-research-report.md) and every record in [`02`](02-evidence-dataset.jsonl) re-read against its primary source.
- **Original record preserved:** the unmodified package is commit `b3d4f238` on branch `research/bunny-role-intelligence-2026-10-22`, which is not modified by this pass. This file and the edits listed below are the corrections layer on top of it.
- **No new model was benchmarked.** Verification used primary-source files already fetched or already public: the study's LaTeX results section, two arXiv abstract pages, and the repository's own run records.

## What was verified, and how

| Source | Method | Result |
|---|---|---|
| `IvanNece/…/report/sections/04_experimental_results.tex` | The file was re-fetched and read line by line. Every table in the report was compared against the LaTeX tables. | All pass rates, denominators, seconds, API-call counts, escalation counts, tier distributions and Radon metrics confirmed. The study reports **no token counts and no dollar figures**. |
| `arxiv.org/abs/2610.13668` | Abstract page fetched and read directly. | 1,000 tasks / 98 repositories + 800 proprietary; 71.9% top-5 for `claude-opus-5` with `copilot-cli`; 47.7% for `opus-4.6` five months earlier; "exploration-nudging prompts gain up to 5.8% performance at 10% higher cost". Confirmed. |
| `arxiv.org/abs/2607.03316` | Abstract page fetched and read directly. | 31,073 comment/feedback pairs, 10,191 pull requests, 239 repositories; 36.4% accepted, 7.3% discussion, 56.3% rejected; rejections primarily false positives, redundancy, out-of-scope; 76% F1 on rejection prediction. Confirmed. |
| `Hikari9/auto-office` @ `9fab6f1` | `config/config.default.yaml`, `docs/benchmarks/issue-494-evidence.md`, `docs/review-convergence.md` read directly. | `luna@high` first for `plan_reviewer` and `code_reviewer`; floor is `min_effort: none` plus `Artificial Analysis Intelligence Index v4.3.2 >= 31`; verdict tokens `APPROVED | RECHECK | INTAKE_GAP`; two live gate closures on `codex@0/gpt-6-luna@high`; the change in both was `calc.add` returning `a + b`; executor self-review ledger 36,739 tokens. Confirmed. |
| Own fleet telemetry | All 325 agent assignments across 65 runs re-tabulated by phase, model, terminal status, error code and turns. | Three records corrected (E-LF-02, E-LF-03, E-LF-04). The qualitative findings held; three counts did not. |
| Own agent-pin audit | The auditor was re-run after fixing a truthiness bug in the parser that had treated the string `"null"` as true. | Result changed from "50 clean, 1 unsupported" to **48 clean, 2 unsupported, 1 unconfirmed, 4 undeclared, 1 placeholder**. The bug was in the audit, not in the fleet. |
| Evidence dataset | All 39 records re-parsed; IDs checked unique; required fields checked present. | 39 records, unique IDs, no missing required fields, class distribution **17 A / 15 B / 6 C / 1 D** confirmed. |

## The six corrections

| # | Where | Was | Now | Why it matters |
|---|---|---|---|---|
| C-1 | E-MA-07, §3.2 | "The same model, arriving via a failed attempt, is far worse, and that is a prompting/context finding." | An **association** with two live explanations. The source says accumulated errors "**may have**" polluted the context, and the same document reports that harder tasks escalate more. The tables cannot separate them. | A causal claim would have justified shipping a retry policy on a mechanism nobody isolated. It now motivates E-5 instead of assuming E-5's answer. |
| C-2 | §3.1, E-MA-03/04 | "Cheap routing performed worse **and cost more**." | The study measures **seconds and API calls**. It reports **no tokens and no dollars**, and its models are open-weight and run locally. | "Cost more" is a claim about call count and wall-clock. It must not be restated as a bill. |
| C-3 | §3.1, E-MA-06 | "Pass rate by escalation count: 100% → 62.3% → 10.7%", presented as a general law. | That row is **architecture B**. Architecture C is 98.3% → 31.0% → **55.3%**, and architecture C1 recorded 164 tasks at zero escalations, so its 81.7% is a first-attempt rate. | The C row is non-monotonic. Presenting B's curve as universal implied a law the data does not support. |
| C-4 | §3.4, E-CR-03 | "A prompt change is a ~12× better return per unit cost than a five-month model upgrade." | **Not computable.** The paper reports cost for the prompt ablation (10% higher) and **no cost for the `opus-4.6` baseline**, so no ratio can be formed. What the paper says is that scaling compute helps most through prompt changes. | A ratio that cannot be computed is a fabricated number wearing a derivation's clothes. The qualitative finding survives; the ratio does not. |
| C-5 | E-LF-02, E-LF-03, §1, §5 | "Luna@max is our most-assigned review-phase model (11 assignments / 318 agent-turns)"; "5 of 7 Sol assignments ended skipped". | Luna@max took **9 of 14** assignments and **252 of 297** agent-turns in the phase literally named `Review`, all completed. Plain Luna ran **88 assignments / 650 turns** across the build phases. Sol made **11** assignments, all in judgment phases, of which **5** ended `skipped`. | The qualitative point holds. The numbers are now the ones a reader can re-derive from the published telemetry. |
| C-6 | §4, E-AO-01/02/03 | "Auto Office closed a review gate on Luna at high" as support for reviewer superiority. | Both closures were on a **one-line change** (`calc.add` returning `a + b`), with no injected defects and no recall or precision measurement. | Eligibility, not superiority. |

## Two additions to the record

- **E-LF-04 now states the failure code.** Both 100%-failure routes recorded the terminal error `AGENT_EMPTY_OUTPUT`, which is an *agent* error, not a provider error code. The run files do not carry the underlying cause, so "provider" is an inference from the fact that sibling flash models on other providers completed normally. The record now says that.
- **The escalation record E-MA-06 now carries both architecture rows** rather than one, so the dataset cannot be read as if the curve were universal.

## What the verification did not change

- The central negative result. Configuration C at 62.2% against C1 at 81.7%, with more calls and more seconds, and the tier-S ablation recovering +9.8 points and halving escalations, is exactly as reported.
- The reviewer finding. 71.9% top-5 recall for the best agent, the prompt ablation at +5.8% for +10% cost, and the 56.3% rejection rate are all confirmed verbatim from the abstracts.
- The conclusion that Luna-as-reviewer is **eligible but unproven**.
- The conclusion that the mission's total cost is **unavailable** and that only $0.1947 of worker inference was priced.
- Every one of the five proposed experiments, all of which remain proposals.
