# Context Ablation: Press Delete Without Losing the Experiment

*August 7, 2026 · Field Note by Marcus Tiongson — Founder, Gaia Research*

---

Most agent context files grow by accretion. A model misses once, so a new rule goes in. A tool changes, so another paragraph follows. Six months later, the file is carrying instructions for several generations of models at once.

Boris Cherny's advice is deliberately uncomfortable: delete the scaffolding and see what the current model can do. The useful part is not the deletion by itself. It is **context ablation** — removing a controlled piece of context, running the same task, and measuring the difference.

Delete the live file and you have a risky edit. Delete one known unit, keep the original, and compare both versions under the same test, and you have an experiment.

## The sentence worth replaying

In the [Y Combinator talk](https://youtu.be/qyPCVqFUyDo), Boris first describes simple mode as “a sort of ablation” at about [05:02](https://youtu.be/qyPCVqFUyDo?t=302). The more complete definition starts at [06:01](https://youtu.be/qyPCVqFUyDo?t=361), before the video's “Press Delete on Your AI Product” chapter at 06:37:

> “Every time there's a new model, we try — in research, we call this ablation. And so what this means is you delete the entire system prompt, and then you bring it back line by line to figure out what is the impact of each individual line.”

The question is not whether a shorter prompt feels cleaner. It is whether a particular instruction changes behavior for a particular model on a particular task. That is a much narrower claim, and it is one you can test.

[[YOUTUBE_EMBED]]

*The clip starts at 06:01, where Boris defines ablation and describes restoring the prompt line by line. The chapter list places the surrounding “Press Delete” discussion at 06:37.*

## What the deletion is allowed to mean

An ablation candidate is an omission, not a rewrite. The experiment should change one independent variable at a time:

- **Candidate:** one controller-derived block from the context file, such as a model-compensating reminder.
- **Control:** the accepted checkpoint with that block still present.
- **Test:** the same task prompts, sealed cases, repetition count, and exact model route.
- **Decision:** a paired result, not a feeling that the candidate “seems fine.”

That boundary matters because not every line is model scaffolding. A permission boundary, CI contract, credential rule, or project fact may be load-bearing even when a capable model can often infer it. Removing it and seeing no failure in one short suite does not make it unnecessary.

The ablation mode in [Context Diet](https://github.com/gaia-research/skill-context-diet) therefore protects structural, safety, authorization, CI, exact-literal, bootstrap, and preference units by default. The controller — not a model's proposed patch — owns the byte offsets and the mutation path.

## A reversible experiment has a shape

The safe sequence is less dramatic than “press delete,” but more useful:

1. **Checkpoint the original bytes.** Record the source hash and file mode before model work.
2. **Inventory the file locally.** Derive stable Markdown units and mark protected blocks.
3. **Seal the suite.** Approve the exact designer/judge model, subject model routes, cases, repetitions, and provider disclosure.
4. **Record fresh baselines.** Every configured exact model must pass the same suite before a candidate is staged.
5. **Stage one omission.** Build a candidate from the controller's inventory. The live file remains unchanged.
6. **Run paired evaluations.** Keep parent and candidate outputs, including missing or inconclusive coverage.
7. **Accept by hash.** Only an explicit trial ID plus its exact candidate SHA can authorize the atomic write.
8. **Rollback when needed.** Restore a recorded revision without discarding the intervening history.

[[ABLATION_LOOP]]

This is the distinction between a deletion tool and an ablation tool: the latter makes the destructive part the final, smallest step. Measurement, staging, rejection, and review do not modify the target.

## “No regression” is not “safe to delete”

A finite suite can only support a finite statement. Context Diet uses three experiment-scoped outcomes for each exact model route:

- **`no_regression_observed`** — every locked parent and candidate run passed.
- **`regression_observed`** — the candidate failed where the control passed.
- **`inconclusive`** — a route, baseline, case, judgment, or repetition is missing or uncertain.

The honest conclusion after a passing trial is: **no regression was observed for this exact model and sealed suite; this route may tolerate this omission under those conditions.** It is not proof that the rule is universally unnecessary, and it does not transfer automatically to another model version, harness, repository, or context-loading order.

That modest language is a feature. A context file is an interface between a harness and a changing model. The result can go stale when either side changes.

## Keep the evidence, not the old reflex

Boris's advice points at a real maintenance problem: instructions tuned for one model generation can become noise for the next. But the answer is not to make context disposable. It is to separate **facts that must survive** from **behavioral hints that deserve a trial**.

If you want to run that trial, install Gaia's Context Diet skill:

```bash
bash <(curl -sL https://raw.githubusercontent.com/gaia-research/skill-context-diet/main/install.sh)
```

The installed skill has a separate guided ablation mode for intentional context removal. In Pi, invoke it as `/skill:context-diet`; other hosts may expose the `/context-diet` alias. Read the repository's [ablation guide](https://github.com/gaia-research/skill-context-diet/blob/main/ABLATION.md) before starting: the checkpoint, exact-model disclosure, evidence gate, candidate hash, and rollback history are the experiment.

Start with one block. Keep the original. Let the comparison, not the urge to tidy, tell you what belongs back.

---

**Sources:** [Boris Cherny: We Cut 80% of Claude Code's Prompt](https://youtu.be/qyPCVqFUyDo) — ablation definition at [06:01](https://youtu.be/qyPCVqFUyDo?t=361); [Root Access transcript](https://www.ycrootaccess.com/p/boris-cherny-building-claude-code); [Context Diet](https://github.com/gaia-research/skill-context-diet), including its [ablation methodology](https://github.com/gaia-research/skill-context-diet/blob/main/ABLATION.md).
