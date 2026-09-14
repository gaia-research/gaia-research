# The Orchestration Guide
## How to run more than one agent without setting money on fire.

**Read this first.** Everything below is written from hands-on experience running multi-agent sessions, not from a controlled benchmark. The pricing is real and sourced. The *advice* is judgement. Nothing here has been measured against a control, so treat it as a strong starting point rather than a finding. Where a claim is a hunch, it says so.

---

## Who this is for

You have used an AI coding agent. It worked. Then you read that you can run *several* agents at once — one "manager" that plans and a few "workers" that do the work — and you want that.

You do not need to know what a KV cache is. You do not need to have written a scheduler. If you can describe a task in a sentence and open two terminal tabs, you can follow this.

One piece of vocabulary, used throughout:

- **Orchestrator** (also: planner, manager, lead). The agent that holds the plan and hands out jobs. **One per session.**
- **Worker** (also: subagent, task, lane). An agent that gets one job, does it, and reports back.

That is the whole glossary.

---

## The one thing you have to understand

Skip this and nothing else in the guide will make sense.

**Your orchestrator pays rent on its own memory, and the meter resets every five minutes.**

Here is what that means in practice. Your orchestrator is holding a lot in its head: your repo layout, the plan, what each worker is doing, the conventions you told it about. Call it 100,000 tokens. Every time it takes a turn, the model provider has to load all of that back in.

The provider is smart about this. It keeps a warm copy — a **cache** — so the second turn is cheap. On Claude Opus 5, that warm copy costs **\$0.50 per million tokens**. Reading it cold, from scratch, costs **\$6.25 per million**.

> **That is a 12.5× difference for the exact same text.** Not a rounding error. The whole guide is about staying on the right side of it.

And here is the trap: **the warm copy is thrown away after five minutes of the orchestrator doing nothing.**

So the sequence that ruins your bill is boringly simple:

1. Orchestrator hands out four jobs. Cache is warm.
2. All four workers go away and think hard for eight minutes.
3. Minute five: the cache is dropped. Nobody noticed.
4. Worker one comes back with a two-line summary.
5. Orchestrator wakes up and re-reads all 100,000 tokens at the cold price. **\$0.625.**
6. Repeat seven more times. **\$5.00 — for reading eight short status messages.**

The workers did all the real work and cost less than the manager spent waiting for them. That is the *orchestrator tax*, and it is the reason multi-agent setups so often cost more than just using one good agent.

📖 The full cost breakdown, with rate-card sources and the worked arithmetic, is in the field note: [**Why Your Multi-Agent Setup Costs More Than a Single Heavy Agent**](/blog/orchestrator-tax-cold-cache).

---

## Step 0 — First, decide not to orchestrate

**This is the most valuable step in the guide, and it is the one everyone skips.**

Most tasks should be given to one capable agent, end to end. Not because orchestration is hard to set up, but because splitting a task into pieces means every piece loses sight of the whole. The agent writing your API route no longer knows what the agent writing your database layer decided. You pay for coordination *and* you get worse code.

Run this checklist. **Orchestrate only if you can honestly say yes to all four.**

| # | Question | If no… |
| :--- | :--- | :--- |
| 1 | Does the work genuinely split into pieces that don't need to talk to each other? | One agent. |
| 2 | Is it too big to fit in one agent's context window? | One agent. |
| 3 | Would you actually run these in parallel if they were humans? | One agent. |
| 4 | Can at least one piece finish in under four minutes? | Fix that first — see Step 3. |

**Good candidates:** "translate this UI into six languages," "write tests for these nine independent modules," "audit every route for a missing auth check."

**Bad candidates — do these with one agent:** "build the login feature," "fix this bug," "refactor this file," "add dark mode." These sound big. They are one coherent job, and one agent will do them better and cheaper.

> **The honest default.** One strong agent, followed by a separate review pass, beats a manager-plus-workers setup for most of what you will actually build. Reach for orchestration when the work is genuinely wide, not when it merely feels big.

---

## Step 1 — Pick your orchestrator: smart, not fast

The instinct is to put your fastest model in charge. That is backwards.

**Your orchestrator's speed does not matter.** It spends almost all of its life waiting for workers. What matters is:

1. **Can it reason well?** It is deciding what to build and who builds it. Bad decisions here are expensive everywhere else.
2. **Is its input cheap?** It re-reads its own context on every single turn. That price gets multiplied by every turn in the session.

Which is why the obvious pick is often not the best one:

| Tier | Models | When to use it |
| :--- | :--- | :--- |
| **Sweet spot** ⭐ | **Sonnet 5**, **GPT-5.6 Terra** | Your default. Plans and routes well, and the cheap input price means a cold wakeup does not hurt. |
| **Heavy** | **Opus 5**, **Fable 5.1**, **Sol**, **Astra 6** | Genuinely hard architectural planning. Worth it — but only if you follow Step 4 and keep the cache warm. |
| **Never** | Anything picked for raw speed | The orchestrator is idle by design. You are paying for a property you will not use. |

**The layman's version:** you want a thoughtful project manager with a cheap hourly rate, not a sprinter. They are going to sit in the room re-reading the same brief all day.

> ⚠️ **Experience, not measurement.** "Sonnet 5 and Terra are the sweet spot" is our read from running these sessions, not a benchmark result. The input prices behind the reasoning are published and real; the quality call is a judgement you should test on your own work.

---

## Step 2 — Cut the work into lanes

A **lane** is one worker doing one job. Write them out before you start. Literally, in a text file:

```
LANE 1  →  Write unit tests for src/auth/*.ts
LANE 2  →  Write unit tests for src/billing/*.ts
LANE 3  →  Update the API reference docs
LANE 4  →  Run the full type-check and list every error
```

Two rules for a good lane:

**Rule 1 — a lane must not need another lane's answer.** If Lane 2 is blocked until Lane 1 finishes, they are not two lanes. They are one job in two parts, and the orchestrator will sit there burning cold wakeups waiting for the handoff.

**Rule 2 — a lane produces one small report, not a pile of output.** More on this in Step 5.

**How to know you got it wrong:** if you find yourself writing "…and then pass that to the other agent," collapse those lanes into one.

---

## Step 3 — Make sure at least one lane is fast

**This is the rule that makes everything else affordable.** It is also the one that is easiest to get wrong, because the obvious reading of Step 0 is "make every worker fast," and that is not it.

> ### The lane rule
> **At least one lane must report back in under four minutes.** That lane's job is to wake the orchestrator up before the five-minute cache timer expires. Every *other* lane can take as long as it likes.

Why this works, in plain terms: when the fast lane reports back, the orchestrator takes a turn. Taking a turn touches its memory. Touching its memory resets the five-minute timer — **at the cheap warm price**. A slow worker that finishes twenty minutes later then arrives to a warm orchestrator, because the fast lane has been quietly keeping the lights on the whole time.

So your lanes come in two flavours:

**🏃 The fast lane — you need at least one.** Bounded, small, quick. Models that genuinely return fast:

- **Gemini 3.8 Flash** — usually under two minutes on a small task
- **DeepSeek V4.1 Flash** — fast, and cheap on the input side
- **Opus 5 `/fast`** — full Opus quality on a low-latency route, when the fast lane's job still needs to be *good*
- **GPT-5.6 Sol `/ultrafast`** — heavy reasoning that still comes back quickly

**🐢 The slow lanes — as many as you want.** This is where the cheap models and the genuinely big jobs go, and **none of it costs the orchestrator anything**, because the orchestrator is not waiting on them.

- The twenty-minute cross-file refactor
- The full test matrix
- **GPT-5.6 Luna** at \$0.20 per million input tokens, grinding away at something long and low-stakes

**The thing people get wrong about Luna:** Luna is cheap but genuinely slow — its wall-clock time regularly goes past five minutes. That makes it a bad choice for the fast lane and a *perfectly good* choice for a slow one. The mistake is not "using a slow model." The mistake is **having nothing fast in flight at all**, so nobody wakes the orchestrator and it drifts past the timer into a cold, expensive re-read.

**If you have no naturally fast lane, manufacture one.** Split something small off the front of a big job:

```
LANE 1 (fast)  →  List every file that imports `auth.ts`. Just the list. ~30 seconds.
LANE 2 (slow)  →  Refactor all of them. Takes as long as it takes.
```

Lane 1 is almost free, and it buys you a warm cache going into the expensive part.

---

## Step 4 — Never let the orchestrator sit idle

Three strategies. Use whichever fits; they stack.

> **Recommendation.** If nothing is due back within four minutes, you need at least one of these.

### A. Keep one lane bounded to under four minutes
This is Step 3 restated as a scheduling rule. One file, one check, one short report. The slow lanes stay unbounded — something just has to be due back soon.

### B. Give the orchestrator its own small job — the best option
While workers are out, have the orchestrator do something genuinely useful: draft the integration plan, write the changelog entry, sketch the README section, review the spec.

Any work at all keeps the cache warm — and unlike a ping, **you get something for the money**. This is not a workaround. It is what a good manager does while waiting on a team.

In practice, that is as simple as saying:

```
While the workers run, draft the PR description from the plan.
Don't wait idle — check in on the lanes between paragraphs.
```

### C. A 270-second heartbeat — the fallback
When neither A nor B works, have the orchestrator ping itself every **270 seconds** (four and a half minutes — just inside the five-minute window). It does not have to produce anything meaningful. A status check is enough to reset the clock.

```
Cost check (Opus 5, 100k context):
  Cold wakeup (cache expired):   $0.625
  Warm keep-alive (cache hit):   $0.050
  2 pings during a 12-min job:   $0.100
  → You save:                    $0.525 per wakeup
```

Ten cents to avoid a sixty-two-cent charge. The only real cost is an extra request slot.

---

## Step 5 — Make workers report back small

Here is a mistake that costs real money and looks completely innocent: a worker finishes and dumps its entire output — the full test log, the whole diff, every line of stdout — back to the orchestrator.

That output does not just cost tokens once. **It is now permanently part of the orchestrator's context**, so you re-read it on every turn for the rest of the session. An 8,000-token test log pasted at turn two gets paid for again at turns three through twenty.

**The fix: workers write to disk and report a receipt.**

```ts
// ❌ Don't send this to the orchestrator:
//    [1,847 lines of jest output]

// ✅ Send this instead:
{
  task: "test-auth-module",
  status: "PASSED",
  durationSec: 214,
  file: "/tmp/results/auth-tests.json",   // full output lives here
  summary: "43 passed, 0 failed, 2 skipped"
}
```

The orchestrator does not need the log to decide what happens next. It needs to know whether it passed and where to look if it didn't. If it later needs the detail, it can read the file — once, deliberately.

**Target: keep the orchestrator under 15,000–20,000 tokens.** At that size, even a cold wakeup only costs about \$0.094 on Opus 5 — versus \$0.625 at 100k. Across eight dispatches that is **\$0.75 instead of \$5.00**, and it holds up even when you do everything else wrong.

**Say it like this in your prompt:**

```
Workers: write full output to /tmp/results/<task>.json.
Report back ONLY: status, duration, file path, one-line summary.
Never paste logs, diffs, or stack traces into your reply.
```

If you take one thing from this guide, take this one. It is the cheapest fix and the largest saving.

---

## Step 6 — Look at the bill

You cannot manage what you cannot see, and most tools show you one total at the end — which quietly teaches you to blame the workers.

Track two numbers:

1. **The gap between your orchestrator's turns.** Not how long a worker took — how long the *orchestrator* sat doing nothing. Any gap over 300 seconds means the next wakeup was a full-price cold read. This is also your direct read on whether your fast lane is doing its job.
2. **The orchestrator's input tokens per turn.** Multiply by your model's cold rate (\$6.25/M on Opus 5). That is what each wakeup actually costs you.

In pi, this is in the session telemetry — you can watch the cache go `warm → cold → cache write` in the log. In other harnesses you may have to log it yourself. It is worth the ten minutes.

---

## A worked example, start to finish

**The job:** "Add input validation to all twelve API routes, with tests."

**Step 0 — should I orchestrate?** Twelve routes that don't depend on each other, too much for one context window, I'd parallelise this across humans. ✅ Yes.

**Step 1 — orchestrator:** Sonnet 5. Good planning, cheap input, and this is routing work rather than deep architecture.

**Step 2 — lanes:**
```
LANE 1 (fast)  →  List all 12 routes + their current validation state. ~40s.
LANE 2 (slow)  →  Routes 1–4:  add validation + tests
LANE 3 (slow)  →  Routes 5–8:  add validation + tests
LANE 4 (slow)  →  Routes 9–12: add validation + tests
```

**Step 3 — is a lane fast?** Lane 1 lands in well under a minute on Gemini 3.8 Flash. ✅ And it is genuinely useful: it tells the orchestrator what it is dealing with. Lanes 2–4 can take fifteen minutes each; nobody is waiting on them.

**Step 4 — idle time:** while 2–4 run, the orchestrator drafts the PR description and the migration note. Cache never goes cold, and two deliverables get written for free.

**Step 5 — receipts:** each lane writes its diff summary to `/tmp/results/routes-N.json` and replies with four fields.

**Step 6 — the bill:** orchestrator holds ~12k tokens. Even if every wakeup went cold, that is about \$0.075 a turn. It won't — Lane 1 and the PR-drafting keep it warm.

**Result:** the orchestrator costs cents. The money goes to the workers, which is exactly where you wanted it.

---

## Mistakes we keep making

| Mistake | What it actually costs | Fix |
| :--- | :--- | :--- |
| Every worker is slow | Cold re-read on every wakeup | Manufacture one fast lane (Step 3) |
| Workers paste full logs back | Paid again on *every* later turn | Receipts, not output (Step 5) |
| Fastest model as orchestrator | Paying for speed you never use | Smart + cheap input (Step 1) |
| Orchestrating a single coherent feature | Coordination cost *and* worse code | Use one agent (Step 0) |
| Lanes that depend on each other | Orchestrator idles waiting on a handoff | Merge them into one lane |
| Compacting aggressively to save money | Compaction has its own re-read tax | Stay small from the start (Step 5) |

That last one deserves a sentence. Compaction — having the agent summarise its own history to free up room — is not free: you pay to re-read the context on every compaction boundary. Our read is that **a slim orchestrator that never needs compacting usually beats a fat one that compacts well**. Flagged as a hunch, not a measurement.

---

## The short version

1. **Don't orchestrate.** Most of the time, one good agent wins.
2. If you must: **smart, cheap-input orchestrator** — not a fast one.
3. **At least one lane finishes in under four minutes.** The rest can crawl.
4. **Never let the orchestrator idle** past five minutes. Give it real work.
5. **Workers report receipts, not output.** Keep the orchestrator under 20k tokens.
6. **Log the orchestrator's idle gaps.** That is where the money goes.

---

## Take this page and make it yours

**Seriously — steal it.** There is a *Copy this page as Markdown* button at the top. Use it.

The fastest way to make a guide stick is to stop reading it and turn it into something that runs. Paste the whole thing into your agent and ask for exactly that:

```
Here's an orchestration guide. Turn it into a skill I can invoke
before any multi-agent session. It should:
  - run the Step 0 checklist and tell me honestly if I should
    just use one agent
  - help me write my lanes, and refuse to continue until at
    least one lane is under 4 minutes
  - enforce the receipts rule on every worker prompt
  - warn me if my orchestrator context goes over 20k tokens
```

Then change it. **Your version should not match ours**, because ours does not know your stack:

- You know which models you actually have access to, and what they cost you.
- You know whether your harness can even run lanes in parallel.
- You know if your tasks are five-minute jobs or forty-minute ones.
- You may find our model picks are wrong for your work. Ours is a judgement call, not a measurement — see the section below.

Some directions worth taking it:

| Make it… | By adding |
| :--- | :--- |
| **Yours** | Your real model list and your real prices, in place of ours |
| **Automatic** | A pre-flight check that runs before every orchestration session |
| **Honest** | A logger for orchestrator idle gaps, so you find out what it really costs |
| **Opinionated** | A hard refusal to orchestrate anything failing the Step 0 checklist |

If you build one and it works, we want to hear what you changed — especially if you measured something that contradicts this page. That is more useful to us than agreement.

---

## What is unverified here

Being straight about it, because this page is marked experimental:

- **The pricing is real.** Every rate is from a published provider card, checked against the `skill-cost` catalog on September 15, 2026. The arithmetic is in the [field note](/blog/orchestrator-tax-cold-cache).
- **The cache mechanics are documented.** The five-minute TTL and the cold/warm price split come from Anthropic's prompt-caching docs; OpenAI's LRU eviction from theirs.
- **The advice is experience.** The lane rule, the model picks, the 270-second figure, and the under-20k target come from running these sessions, not from a controlled study. We have not run an A/B with a held-out control.
- **What would make this verified:** matched orchestration sessions — one following this guide, one not — with per-turn cache-state telemetry, across enough tasks to separate signal from variance. That study is not scheduled yet.

Use this as a strong prior. If you measure something that contradicts it, we would rather know.
