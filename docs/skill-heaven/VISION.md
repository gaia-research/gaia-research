# VISION — Skill Heaven & Skill Hell

> The strategic north star for the **Skill Heaven / Skill Hell** line. This is a
> line doc, not an org doc: `gaia-research` is the lab, and this is one of the
> things the lab is building.
> Voice per [`PRODUCT.md`](../../PRODUCT.md): High-Energy Academic — Joy. Rigor. Spark.
>
> **Decision authority:** [`founder/RATIFICATION.md`](../../founder/RATIFICATION.md).
> Vocabulary: [`founder/LEXICON.md`](../../founder/LEXICON.md).

---

## 0. One sentence

**Gaia is a Mixture-of-Agents, but for skills.** The Skill Tree is the evidenced
pool of experts; a **door** — `claude-heaven`, `pi-heaven`, one per harness —
decides how many of them are in the room for *this* session. Heaven clears the
room. Hell fills it.

You never install a skill again. You summon them. Boss, that's the whole thing.

---

## 1. The enemy: install debt

Today you *install* skills. From a marketplace. Permanently — global, or pinned
to a repo. And marketplaces ship what's **hyped**, not what you need. So every
install bolts another plugin, another suite, another twelve `SKILL.md` contracts
onto your agent's context. Forever. Across every repo. Whether this task needs
them or not.

That's **install debt**, and it only ever grows. Matt Pocock named the symptom —
*Framework Hell, Tutorial Hell… now **Skill Hell*** — the bloat that drowns your
agent in skills it isn't using. He's right about the disease. He split skills
into *user-invoked* vs *model-invoked* to cope. We think the fix is deeper:

> **Stop installing. Start summoning.** Skills should be a *per-session* call,
> composed on demand from an evidenced pool and gone when you're done — never a
> permanent resident of your config or your repo.

---

## 2. Mixture-of-Agents, for skills

The analogy is exact, and we make it load-bearing:

| Mixture-of-Agents | Gaia |
|---|---|
| A layer of proposer agents | The skills in this session's loadout |
| The aggregator that synthesizes them | Your agent's own context — the skills co-inhabit and compose |
| *More proposers → better, but costlier* | **The ladder** — Hell adds proposers, Heaven removes them |
| The gating / router | `gaia-mcp`, reading the Skill Tree's `hellHeaven` stamps |
| Proposer-pool quality caps the ceiling | **Registry evidence-coverage caps the payoff** — the honesty gate, §5 |

More skills is literally more experts in the mixture — and MoA says that helps
*until it doesn't*. The ladder is where "doesn't" lives. Gaia's edge over a naive
mixture: the pool is an **evidence-backed registry**, not a pile of hyped
plugins. Better experts, provable.

---

## 3. Two dials, not one

You pick a **mode** — Heaven, Hell, or Ultra — and a **rung** on the ladder:
`off · low · med · high · xhigh · max`. The mode says *which direction*. The rung
says *how much*.

```
 mode:   ☁️ HEAVEN ────────── NATIVE ────────── 🔥 HELL ── ⚡ ULTRA
 rung:   off ── low ── med ── high ── xhigh ── max
```

This page used to claim the two were one axis — that skill breadth simply *was*
your effort setting, one dial you already knew. It reads well and it isn't true:
how hard your agent should think and how much it should carry are different
questions. **Native is the default**, and staying there is a perfectly good
answer.

---

## 4. The two modes

### ☁️ Skill Heaven — a room you cleared on purpose

Heaven is **subtraction**. It strips what your agent is carrying so a design
session runs in a quiet context.

- **Who it's for:** intentional programming, architecting, shaping a feature,
  office hours, grilling sessions. The lane where a clean, quiet room *is* the
  feature.
- **The promise:** token-efficient, sharper results from a handful of the right
  skills, with **zero registry dependency** — pure subtraction, no server. The
  context diet in its purest form: not "load the good ones," but "clear the room
  first."
- **The honest bit — the deepest rung is boot-only.** Evicting your *personal*
  skills is something the harness will only do when a session starts. So the
  cleanest room is reached by **launching through the door**; a mid-session
  control can walk you back up but never further down. We measured that rather
  than assumed it, and it is why the launcher exists at all.

### 🔥 Skill Hell — the whole evidenced world, for one session

Hell is **summoning**. A summoned skill is a proxy that enters context on
demand, once. The rung sets how much may come in and how much of the choosing is
automated; the router picks *which*; you can always summon your own favourites
by hand.

- **Who it's for:** autonomous fleets, long loops, goal-runners — the agent that
  does not stop until the task is finished. It still wants tokens *saved* and
  quality *up*, because burning context on unused skills helps nobody.
- **At `max`,** the biggest suites come in and **stay** for the rest of the
  session. A one-way door *inside* a session — never outside one.
- **Nothing is installed.** No global config is touched, nothing pins to your
  repo, and a summon does not outlive the session. Hell asks a lot of the agent
  driving it; what it will never do is rot the setup you come back to tomorrow.

### ⚡ Ultra

The arm above Hell. Gated exactly like it.

---

## 5. The honesty gate

The payoff scales with how good the pool is, so we refuse to let Hell run on a
weak one. **Hell and Ultra do not unlock until registry trust-coverage clears a
measured threshold.** No vibes. Each skill's `hellHeaven` stamp comes from a
pre-registered benchmark, not a marketing hunch. If the pool can't earn the
stamp, the mode stays dark.

That is what separates "summon the world" from "yolo into chaos." **Heaven ships
first** — it needs no gate, because it is subtraction. Hell ships when the
evidence says it is safe.

Two claims on this page are decided but not yet measured, and we would rather
say so than have you find out: that a summon leaves no trace after a compact,
and what the whole-pool flood actually costs. Both have open probes. Neither
appears in a public claim before its number does.

---

## 6. The ecosystem

The **doors are the product**. `claude-heaven`, `pi-heaven`, one per harness —
you think "claude" first, then heaven. Behind them sits a shared engine, and
beside them a router that never decides a loadout by asking a model.

```
        CANON                         PRIVATE (enterprise)
   gaia-skill-tree   ◄── grades against ──   your-skill-tree
   (evidenced, public)                       (fusion mapping, curated)
          │                                          │
          └──────────────► gaia-mcp ◄────────────────┘
                    router · per-session · summon
                              │
                       the door you launch
                   ☁️ heaven ── 🔥 hell ── ⚡ ultra
```

- **`gaia-skill-tree` is the canon** — the public, evidence-backed registry, and
  read-only from here. The `hellHeaven` stamps live in *its* schema, so routing
  is a lookup rather than a guess.
- **`your-skill-tree` lets an org bring its own canon**, graded against the
  public one so it inherits a real yardstick. **RAG for agentic skills.**
- **`skill-heaven`** is the product monorepo and the plugin marketplace — the
  doors, and the engine underneath them.
- **`gaia-research` (this repo)** is where the science lives: the benchmark that
  sets the stamps, the honesty gate, the public story.

---

## 7. Why this wins

- **No install debt.** Nothing pins to your repo. Change posture across ten
  repos without editing a single config file.
- **Evidence, not hype.** The pool is graded, the stamps are benchmarked, the
  gate is measured.
- **Per-session, always.** The room you work in tonight is not the room you
  inherit tomorrow.
- **It is the thing we want for ourselves.** Full-gas autopilot when we are
  looping; a clean, quiet room when we are architecting. Your call.

> One registry. Your call. Stop installing. Start summoning. 🔥☁️

---

*See [`MISSION.md`](MISSION.md) for what we are building, in what order, and how
we keep it honest.*
