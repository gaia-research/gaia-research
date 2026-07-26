# Why a Smarter Model Wanted a Shorter Prompt

*July 27, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

You add one rule after every bad agent run. Six months later, the agent is
negotiating with a fossil record of failures that its current model may no
longer have.

Anthropic tested the reverse move. For advanced Claude 5-generation models
such as **Opus 5 and Fable 5**, the Claude Code team removed **over 80% of the
system prompt with no measurable loss on its coding evaluations**. That is
Anthropic's result on Anthropic's harness—not a universal target—but its
[account of what changed](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models)
gives us a better question than “How short should my prompt be?”

**Which instructions still earn their place?**

---

## Four old rules stopped paying rent

Anthropic did not merely compress the same instructions. It changed how Claude
Code supplies context:

[[CONTEXT_SHIFTS]]

The examples point to one mechanism: **old scaffolding can overconstrain a new
model**. A blanket rule forces the model to obey a past tradeoff even when the
current task calls for judgment. A worked example can narrow the model's search
to the demonstrated path. Repeated instructions can conflict across the system
prompt, skills, `CLAUDE.md`, and the user's request.

Anthropic calls the result “unhobbling”: the capability already exists, but the
harness keeps steering around it. Its reported evidence is precise and narrow:
**over 80% less system-prompt text, with no measurable loss on its coding
evaluations**. It does not establish that every agent can delete the same
fraction.

## The prompt is only one layer

The official post makes a broader point than the original talk alone: a user's
message is only one part of the model's context. Claude Code also assembles
system instructions, skills, `CLAUDE.md`, memory, tool definitions, and
references. Anthropic calls the work of shaping that full input
[context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

This changes the optimization target. The goal is not the shortest
`CLAUDE.md`. The goal is to put each instruction where it is useful:

- Keep the system prompt focused on the product and operating environment.
- Keep `CLAUDE.md` lightweight, with repository-specific gotchas the model
  cannot infer from the tree.
- Move conditional procedures into skills that load only when needed.
- Put tool-specific behavior beside the tool instead of repeating it globally.

That is [progressive disclosure](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code):
the agent can reach detailed guidance without paying for every detail on every
turn.

## The boundary Anthropic cannot draw for your repository

“The model is smarter, so delete the rules” fails because two different things
often share the same file:

[[KEEP_OR_TEST]]

A capable model may already know how to review code. It cannot infer that this
repository pins Node 22 in CI, keeps three documents as separate sources of
truth, or applies a vocabulary rule only to selected directories. Those are
facts about the project, not gaps in model capability.

Project facts can still move. A prose rule may become an executable check, a
discoverable config value, or an obsolete convention. Until then, removing it
does not unhobble the model; it removes information.

## A three-step descaffolding test

Take one instruction file you own—a `SKILL.md`, a section of `CLAUDE.md`, or a
system prompt—and review one block at a time:

1. **Classify it.** Does this compensate for an older model, or does it encode
   project information the model cannot reliably discover?
2. **Relocate before deleting.** If the rule only matters during verification,
   move it into a verification skill. If it describes one tool, put it with
   that tool.
3. **Measure the candidate cut.** Run the same task with and without the block.
   Keep it if removal makes the result worse. Report the answer per model and
   harness.

Anthropic has also placed these checks in Claude Code's `/doctor` command for
rightsizing skills and `CLAUDE.md` files. Automation can find bulk and
duplication; the project owner still has to decide which facts are non-obvious.

This distinction connects directly to Gaia's
[Context Diet](/labs/context-diet), which audits standing context, and
[Skill Heaven](/#skill-heaven-hell), which investigates loading only the skills
a task reaches. The current
[Skill Heaven benchmark](/research/hh-benchmark) and
[product repository](https://github.com/gaia-research/skill-heaven) document
what Gaia has actually built and measured. Neither claims Gaia reproduced
Anthropic's 80% result.

## Watch the source talk

[[YOUTUBE_EMBED]]

The talk supplies the original “examples become a ceiling” framing. Anthropic's
later article supplies the operational details and evaluation claim used here.

## One thing to do today

Find the oldest worked example in your standing context. Ask what fact it
contains that the model cannot discover elsewhere. Preserve that fact, then
test the task without the example.

Do not target 80%. Target the first block that no longer earns its tokens.

---

**Sources:** Thariq Shihipar, Anthropic,
[*The new rules of context engineering for Claude 5 generation models*](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models),
July 24, 2026 ·
[*Field Guide to Fable*](https://www.youtube.com/watch?v=9fubhllmsBU),
AI Engineer World's Fair · Anthropic,
[*Effective context engineering for AI agents*](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).
