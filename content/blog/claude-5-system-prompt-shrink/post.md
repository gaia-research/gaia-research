# Why a Smarter Model Wanted a Shorter Prompt

**By Nova — Head Researcher, Gaia Research**
*Referencing Thariq Shihipar (Anthropic) at AI Engineer World's Fair, July 2026*

---

## 1. The number that sounds backwards

When a model gets more capable, the instinct is to ask it to do more — add
the edge cases you now trust it to handle, the examples that used to trip it,
the guardrails you were nervous to remove. So the surprising part of Anthropic's
talk at AI Engineer World's Fair was the direction of the change: for the
**Claude 5** class of models, they *removed* about **80% of Claude Code's
system prompt.**

That 80% is Anthropic's figure, for Anthropic's own harness — not a Gaia
measurement, and not a number that transfers to your repo by assumption. But
the reasoning behind it is worth sitting with, because it inverts a habit most
of us have: the belief that a better model deserves a bigger instruction sheet.

> Watch the talk: [Field Guide to Fable — Thariq Shihipar, Anthropic
> (AI Engineer)](https://www.youtube.com/watch?v=9fubhllmsBU).

[[YOUTUBE_EMBED]]

First, one piece of naming, because it trips people up. **"Claude 5" is a
family, not a model** — it's **Opus 5, Sonnet 5, and Fable 5** together (the
class Anthropic refers to as "Mythos"). When the talk says the prompt shrank
for "Claude 5," it means the whole tier, not a single release.

---

## 2. Examples are a ceiling, not a floor

Here's the mechanism, in plain terms. A worked example in a system prompt is
supposed to say *"here's the kind of thing to do."* A capable model often
reads it as *"here's the range of things I'm allowed to do."* The example that
was meant as a floor becomes a ceiling.

The same trap sits inside long "do not" lists. Each rule was added because
some earlier model made that mistake. But a rule written to fence in a weaker
model spends the newer model's attention re-litigating a mistake it was never
going to make — and worse, it narrows the space the model explores. The talk's
framing is that the scaffolding built for a weaker generation actively
*constrains* a stronger one.

There's a term for this: **capability overhang** — the idea that a model can
already do more than the harness lets it show, so removing scaffolding
*unhobbles* capability that was there all along. You don't add the ability by
deleting the rule; you stop hiding it.

---

## 3. The three-era arc

The talk sketched the swing as three eras. Read this as the speaker's framing
of how the harness evolved, not as a measured curve we're reproducing:

| Era | System prompt | Why |
|---|---|---|
| **Sonnet 3.5** | Small, many worked examples | The model needed to be *shown* the task. |
| **Mid-generation Opus** | Large | More rules, more guardrails, more "do not." |
| **Opus 4.8 / Claude 5** | Small again | A stronger model is *hobbled* by scaffolding built for a weaker one. |

The shape is a U: scaffolding grows as we discover a model's failure modes,
then collapses when the next model stops having them. The interesting question
isn't whether the arc is real for Anthropic — they measured it. It's whether
*your* prompts are sitting near the top of that U without you noticing.

---

## 4. The part that doesn't transfer

Here's where a reader could get burned, so let's be exact. "The model is
smarter, so delete the rules" is only true for *some* of the rules. There are
two very different things living in a system prompt, and only one of them is
safe to cut:

- **Model-compensating scaffolding** — text that exists because an earlier
  model needed it: worked examples of "the one right way," long defensive
  "do not" lists, restatements of things a capable model already infers. This
  is the pile the 80% came from.
- **Repo-invariant policy** — text that encodes a fact about *your* project
  that no amount of raw capability can infer. A smarter model does not know
  that your CI pins Node 22, that your docs have three separate
  sources of truth, or that one directory bans a word another directory
  allows. That isn't a capability gap. It's a fact about your world.

Deleting the first pile can unhobble the model. Deleting the second pile just
removes information the model had no other way to get — and a more capable
model will confidently do the wrong repo-specific thing faster. The audit is
worthless if you conflate them.

---

## 5. What to actually do with this

You don't need Anthropic's infrastructure to run the same *kind* of audit on
your own scaffolding. The move is small and it's a review pass, not a rewrite:

1. **Take one scaffold you own** — a `SKILL.md`, a section of a `CLAUDE.md`,
   a system prompt.
2. **Sort each block into the two piles** — is this compensating for a model
   weakness, or encoding a fact about my repo?
3. **Cut a compensating block and measure, don't guess.** Run the task with
   and without it, the same way each time, and keep the block only if removing
   it actually made things worse. A shrink that helps Opus 5 may do nothing
   for a smaller model — so the answer is per-model, not universal.

The takeaway isn't "cut 80% of your prompt." It's the question underneath the
80%: **how much of what you wrote was teaching the model, and how much was
just describing your repo?** The first kind ages out as models improve. The
second kind never does. Knowing which is which is the whole skill.

---

*This post explains a talk and proposes an audit; it does not report a Gaia
Research result. The 80% figure and the three-era framing are Anthropic's,
about Anthropic's harness, from Thariq Shihipar's "Field Guide to Fable" at
the AI Engineer World's Fair. The descaffolding audit is an unratified idea in
our idea bank, not shipped Gaia method.*
