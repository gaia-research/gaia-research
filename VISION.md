# VISION.md — Skill Heaven & Skill Hell

> The strategic North Star for `gaia-mcp` and its consumption of the Gaia Skill Tree.
> Voice per [`PRODUCT.md`](PRODUCT.md): High-Energy Academic — Joy. Rigor. Spark.
> Public-facing. The enterprise operational playbook (Bring-Your-Own-Tree, private
> fusion, grade-against-canon) is staged in `marketing-tasks` — see §7.
>
> **Decision authority:** [`founder/RATIFICATION.md`](founder/RATIFICATION.md).
> Where this doc lags ratified decisions (e.g. §3's slider — ratified as discrete
> **mode switching**, N1), the founder doc wins pending rewrite.

---

## 0. One sentence

**Gaia is a Mixture-of-Agents, but for skills:** the flagship Skill Tree is the evidenced
pool of experts, and `gaia-mcp` is the router that *summons* them per-session — dialing from
**Hell** (summon the whole world, autopilot) to **Heaven** (evict everything, grill) along
the same effort axis your agent already speaks: `low → med → high → xhigh → max`.

You never install a skill again. You summon them. Boss, that's the whole thing.

---

## 1. The enemy: install debt

Today you *install* skills. From a marketplace. Permanently — global, or pinned to a repo.
And marketplaces ship what's **hyped**, not what you need. So every install bolts another
plugin, another suite, another twelve `SKILL.md` contracts onto your agent's context.
Forever. Across every repo. Whether this task needs them or not.

That's **install debt**, and it only ever grows. Matt Pocock named the symptom — *Framework
Hell, Tutorial Hell… now **Skill Hell*** — the bloat that drowns your agent (and you) in
skills you're not using. He's right about the disease. He split skills into *user-invoked* vs
*model-invoked* to cope. We think the fix is deeper than a split:

> **Stop installing. Start summoning.** Skills should be a *per-session* call, composed on
> demand from an evidenced pool and cleared when you're done — never a permanent resident of
> your `.gaia` or your repo.

The slider is *how much* you summon. That is why the slider exists.

---

## 2. Mixture-of-Agents, for skills

The analogy is exact, and we make it load-bearing:

| Mixture-of-Agents | Gaia |
|---|---|
| A layer of proposer agents | The skills summoned into a session's loadout |
| The aggregator that synthesizes them | Your agent's own context — the skills co-inhabit and compose |
| *More proposers → better, but costlier* | **The slider** — Hell adds proposers, Heaven prunes them |
| The gating / router | `gaia-mcp`, reading the skill tree's `hellHeaven` stamps |
| Proposer-pool quality caps the ceiling | **Registry evidence-coverage caps the payoff** (our honesty gate, §5) |

More skills is literally more experts in the mixture — and MoA says that helps *until it
doesn't*. The slider is where "doesn't" lives. Gaia's edge over a naive mixture: our pool is
an **evidence-backed registry**, not a pile of hyped plugins. Better experts, provable.

---

## 3. The slider IS your effort dial

We don't teach a new control. We overload the one you already trust. Skill breadth and
reasoning effort *should* move together — a `max` autonomous loop wants the whole evidenced
world; a `low` brainstorm wants three hand-picked skills.

```
 effort:   low ───── med ───── high ───── xhigh ───── max
 posture:  HEAVEN ◄──────────────── auto ────────────► HELL
 skills:   3–5 grilled       evidenced top-k        full evidenced pool
 human:    grilling / office-hours   iterate         hands-off · firebreak on
```

Heaven and Hell are not two products. They're not even two ends. **They're the same axis
your effort setting already rides.** `auto` is the default adaptive posture in the middle.

---

## 4. The two poles (per-session, zero-install)

### 🔥 Skill Hell — full gas, autopilot (the hero)

All hell breaks loose. Every good skill in the evidenced world, live in your `.gaia`, visible
to any harness, summoned on demand. This is the **Tesla-in-ludicrous-mode** lane: point it at
a goal and *go*.

- **Who it's for:** autonomous fleets, Hermes-native swarms, long `/loop` sessions, goal-runners,
  the **Sol-5.6-style agent that does not stop until the task is finished.** Unlimited budget —
  but it still wants tokens *saved* and quality *up*, because burning context on unused skills
  helps no one.
- **The promise:** summon from *all* good skills → sharper designs, backends, tests — while a
  **token-ceiling firebreak** caps the bloat so it nets *fewer* tokens than naively loading
  everything, and beats loading *nothing* (no re-deriving capability mid-loop).
- **The seatbelt is the story.** Hell is powerful *because* it only unlocks when the evidence
  pool has earned it (§5). Autopilot you can trust is autopilot that was gated. Ludicrous mode
  ships with a seatbelt, not without one.

### ☁️ Skill Heaven — one step *below* vanilla

Here is the claim we plant a flag on: **invoking Heaven evicts ALL your project and global
skills from context** and admits back only the *grilling-native* ones. So Heaven carries
*less* than vanilla claude — vanilla still drags your installed skills along; Heaven strips
even those.

- **Who it's for:** intentional programming, architecting, brainstorming and shaping a new
  feature, office hours, grilling sessions. The lane where a clean, quiet context *is* the
  feature.
- **The promise:** highly token-efficient, sharper results from a handful of the right skills.
  Works with **zero registry dependency** — it's pure subtraction. This is the context diet in
  its purest form: not "load the good ones," but "clear the room first."
- **Why below vanilla:** if a skill isn't grilling-native, it's noise during a design session.
  Heaven's job is to *remove* noise, and installed skills are noise until summoned.

---

## 5. The honesty gate (why you can trust Hell)

The slider's payoff scales with how good the skill-tree meta is — so we refuse to let Hell run
on a weak pool. **Hell and Ultra do not unlock until registry trust-coverage clears a measured
threshold.** No vibes. The `hellHeaven` stamp on each skill is set by a *pre-registered
benchmark*, not by a marketing hunch. If the pool can't earn the stamp, the pole stays dark.

This is what separates "summon the world" from "yolo into chaos." We ship Heaven now (it needs
no gate — it's subtraction). We ship Hell when the evidence says it's safe.

---

## 6. Ultra & Auto

- **Ultra = Heaven + Gaia.** Start from your grilled, evicted-clean base, then let the
  **highest-rated evidenced skills flood the gates.** Best of both: intentional core, world-class
  augmentation. Gated like Hell.
- **Auto.** The default. Reads the task and your budget, picks the posture, gets out of the way.

---

## 7. The ecosystem: canon, private trees, and the router

`gaia-mcp` is the universal adapter. It doesn't care *whose* tree it points at.

```
        CANON                         PRIVATE (enterprise)
   gaia-skill-tree   ◄── grades against ──   your-skill-tree
   (evidenced,                               (fusion mapping,
    public, Yggdrasil II)                     private, curated)
          │                                          │
          └──────────────► gaia-mcp ◄────────────────┘
                    router · per-session · slider
                              │
                heaven ◄──────┴──────► hell
```

- **`gaia-skill-tree` is the canon** — the public, evidence-backed registry. Yggdrasil II brings
  installable/summonable skills; the `hellHeaven` stamps live in *its* schema so routing is a
  lookup, not a guess.
- **`your-skill-tree` (in the works) lets anyone bring their own canon.** Point the MCP at a
  private, curated tree — graded *against* the public canon so the org inherits a real yardstick.
  This is **RAG for agentic skills**: every engineer's agent retrieves from the org's curated
  tree instead of hand-rolling a custom harness. (Enterprise mechanics: see the
  `marketing-tasks` brief — solemn, B2B, ledger-side.)
- **`gaia-research` (this repo)** is where the science lives: the benchmark that sets the stamps,
  the honesty gate, the public story.

**Three repos, three jobs — and the 80/15/5 split falls out naturally:**

| Share | Repo | What it owns |
|---|---|---|
| **80% infra** | `gaia-skill-tree` (+ `your-skill-tree`) | The `hellHeaven` stamps, persisted in-schema. Routing = deterministic lookup. |
| **15% agentic** | `gaia-mcp` + benchmark harness | Composing the loadout per session; the fleet that *earns* stamps by running skills. |
| **5% human** | `gaia-research` + grilling sessions | Judgment only: the grilling UX itself, and ratifying the honesty gate. Never mechanics. |

---

## 8. Why this wins

- **No install debt.** Nothing pins to your repo. Switch postures across ten repos with one dial.
- **Evidence, not hype.** The pool is graded; the stamps are benchmarked; the gate is measured.
- **One dial you already know.** `low → max` — the slider *is* your effort setting.
- **It's the thing we want for ourselves.** Full-gas autopilot when we're looping; a clean, quiet
  room when we're architecting. Same MCP. Your call.

> One registry. Your call. Stop installing. Start summoning. 🔥☁️

---

*See [`MISSION.md`](MISSION.md) for what we're building, in what order, and how we keep it honest.*
