# Claude 5: Why a Smarter Model Wanted a Shorter Prompt

*July 27, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

You add one rule after every bad agent run. Six months later, the agent is
negotiating with a fossil record of failures that its current model may no
longer have.

Anthropic tested the reverse move. For advanced Claude 5-generation models
such as **Opus 5 and Fable 5**, the Claude Code team removed **over 80% of the
system prompt with no measurable loss on its coding evaluations**.

That is Anthropic's result on Anthropic's harness, not a universal target. But
its [account of what changed](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models)
gives us the useful question: **which instructions still earn their place?**

---

## Four old rules stopped paying rent

Anthropic did not merely compress the same instructions. It changed how Claude
Code supplies context:

[[CONTEXT_SHIFTS]]

The common failure was overconstraint. A blanket rule preserves an old
tradeoff when the current task calls for judgment. A worked example can narrow
the model's search to the demonstrated path. Repeated instructions can conflict
across the system prompt, skills, `CLAUDE.md`, and the user's request.

Anthropic calls removing that drag “unhobbling.” The measured claim remains
narrow: **over 80% less system-prompt text, with no measurable coding-eval
loss**. It does not mean every agent can delete the same fraction.

## Three context layers, one harder question

A prompt is only one part of the input. Claude Code also assembles system
instructions, skills, `CLAUDE.md`, memory, tools, and references. Anthropic
calls shaping that full input
[context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

[[MEASUREMENT_LAYERS]]

[Context Diet](/labs/context-diet) tests the **`CLAUDE.md` layer**. Lab 001
reduced one file from 49,687 to 29,040 characters—**41.6% smaller, about 5,161
tokens**—while retaining **124 of 124 rules with zero load-bearing losses**.
That proves instruction faithfulness, not task equivalence. The next test asks
whether agents still complete the same tasks at the same rate.

[Skill Heaven](/#skill-heaven-hell) tests the **skill layer**. Its top-five
loadout reduced the standing dose from 9,453 to 249 tokens—**97.4%**. The
[paired benchmark](/research/hh-benchmark) must now test the other half of the
claim: did success hold?

That benchmark compares each reduced-context arm with Gaia's own same-harness
placebo, repeats the tasks, and reports outcome deltas with confidence
intervals. “Fewer tokens” is not enough. The target is **fewer tokens, no
measurable loss**.

The committed
[Context Diet report](https://github.com/gaia-research/gaia-research/tree/main/content/reports/context-diet-lab-001),
[Skill Heaven evidence](https://github.com/gaia-research/gaia-research/tree/main/content/reports/hh-benchmark),
and [product repository](https://github.com/gaia-research/gaia-skill-heaven) keep
those scopes separate. Gaia has measured compression at the `CLAUDE.md` and
skill layers; its task-equivalence trials are not complete.

## Keep facts the model cannot discover

“The model is smarter, so delete the rules” fails because two different things
often share the same file:

[[KEEP_OR_TEST]]

A capable model may already know how to review code. It cannot infer that this
repository pins Node 22 in CI or applies a vocabulary rule only to selected
directories. Those are project facts, not capability gaps.

A fact may later move into an executable check or discoverable config. Until
then, deleting it does not unhobble the model; it removes information.

## Test one block, not an arbitrary percentage

Take one instruction file—a `SKILL.md`, part of `CLAUDE.md`, or a system
prompt—and review one block:

1. **Classify it.** Older-model compensation, or non-discoverable project fact?
2. **Relocate it.** Put conditional procedures in a skill and tool-specific
   guidance beside the tool.
3. **Measure the cut.** Run the same task with and without the block. Keep it if
   removal makes the result worse.

Claude Code's `/doctor` command can find bulk and duplication. The project owner
still has to decide which facts are non-obvious.

## Watch the source talk

[[YOUTUBE_EMBED]]

The talk supplies the original “examples become a ceiling” framing. Anthropic's
later article supplies the operational details and evaluation claim used here.

## One thing to do today

Find the oldest worked example in your standing context. Preserve any fact the
model cannot discover elsewhere, then test the task without the example.

Do not target 80%. Target the first block that no longer earns its tokens.

---

**Sources:** Thariq Shihipar, Anthropic,
[*The new rules of context engineering for Claude 5 generation models*](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models),
July 24, 2026 ·
[*Field Guide to Fable*](https://www.youtube.com/watch?v=9fubhllmsBU),
AI Engineer World's Fair · Anthropic,
[*Effective context engineering for AI agents*](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) ·
Gaia Research,
[*Context Diet — Lab 001*](https://github.com/gaia-research/gaia-research/tree/main/content/reports/context-diet-lab-001) ·
[*Hell Heaven Benchmark evidence*](https://github.com/gaia-research/gaia-research/tree/main/content/reports/hh-benchmark).
