# Agent Plugins: The Skill Landscape Just Got a Package Format

*August 19, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

> We spent the last year figuring out how to make agent capabilities portable.
>
> Then we discovered portability was only half the problem. Somebody still had to install all the pieces.

A useful agent setup is rarely one thing anymore.

There is a skill telling the model **how** to do the work. An MCP server giving it somewhere to reach. Maybe a script. Maybe some client-specific machinery around the edges.

Until recently, distributing that setup meant explaining where every piece belonged.

Agent Plugins gives the bundle a box.

Not another protocol. Not another agent framework.

A package format.

[[YOUTUBE_EMBED_AGENT_PLUGINS]]

---

## The missing layer was above the skill

Agent Plugins v1 defines a deliberately small portable core:

```text
my-plugin/
├── plugin.json
├── skills/
│   └── deploy/
│       └── SKILL.md
└── mcp.json
```

`plugin.json` identifies the package and the version of the Agent Plugins specification it targets.

`skills/` contains Agent Skills.

`mcp.json` describes MCP servers.

That is essentially the portable contract. Agent Plugins v1 defines exactly two standard component types: **Skills and MCP servers**. Client-specific additions can exist outside that core through namespaced extensions.

This distinction matters.

A **skill** packages capability.

An **MCP server** exposes tools or external systems.

An **Agent Plugin** packages the capabilities and connections together.

```text
SKILL.md
   │
   │  teaches
   ▼
 Agent
   │
   │  calls
   ▼
MCP server
```

becomes:

```text
┌──────────────────────┐
│    Agent Plugin      │
│                      │
│  ┌───────────────┐   │
│  │ Agent Skills  │   │
│  └───────────────┘   │
│          +           │
│  ┌───────────────┐   │
│  │ MCP servers   │   │
│  └───────────────┘   │
└──────────────────────┘
          │
          ▼
   compatible client
```

That sounds like a small organizational improvement.

It changes the shape of the ecosystem.

[[SVG_1_LAYER_CAKE]]

---

## MCP did not get replaced. It got packaged.

This is the part I expect people to misread.

Agent Plugins is **not an alternative to MCP**.

The Model Context Protocol still defines how MCP clients and servers communicate. Agent Plugins defines how an MCP server can be **described, discovered, and shipped as part of a portable agent extension**. The specification explicitly says clients map the portable MCP configuration into their own native configuration.

That moves MCP one layer down the stack.

Before:

```text
Find MCP server
      ↓
Read installation docs
      ↓
Translate config into client format
      ↓
Install related skills separately
      ↓
Hope the pieces agree
```

With a portable plugin:

```text
Install plugin
      ↓
Read plugin.json
      ↓
Discover skills/
      +
Discover mcp.json
      ↓
Client maps them into its runtime
```

The protocol still handles the wire.

The plugin handles the suitcase.

That is a much cleaner separation of responsibilities.

---

## `mcp.json` is more interesting than it looks

MCP configuration has historically been awkwardly client-shaped.

One agent expects one JSON structure. Another expects another. Transport inference can differ. Paths move. Installation guides acquire increasingly elaborate copy-paste sections.

Agent Plugins attacks that problem with a closed portable MCP configuration.

A plugin can declare servers using `stdio`, `streamable-http`, or legacy `sse`. The client then translates that declaration into whatever its runtime expects. MCP-capable Agent Plugins clients must support at least one of `stdio` or Streamable HTTP and are encouraged to support both.

The important idea is not the JSON syntax.

It is this:

**The server stops knowing which agent installed it.**

That is the MCP version of what Agent Skills already began doing for instructions.

A skill author increasingly does not want a "Claude skill," "Codex skill," and "Copilot skill."

They want a skill.

An MCP author increasingly should not want four installation guides describing the same server in four configuration dialects.

They want an MCP server that can ride inside a portable package.

Agent Plugins starts joining those two portability stories.

[[SVG_2_MCP_CHANGE]]

---

## The new stack is becoming easier to name

The agent customization landscape has accumulated overlapping nouns.

Instructions. Skills. Tools. MCP. Hooks. Agents. Plugins. Extensions.

The useful boundary is becoming clearer:

```text
┌─────────────────────────────────────────┐
│               AGENT CLIENT              │
│   permissions · UX · runtime · policy   │
├─────────────────────────────────────────┤
│              AGENT PLUGIN               │
│       distribution + packaging          │
├───────────────────┬─────────────────────┤
│      SKILLS       │         MCP         │
│  how to perform   │  what can be reached│
├───────────────────┴─────────────────────┤
│            MODELS + RUNTIME             │
└─────────────────────────────────────────┘
```

This also explains why "plugin versus skill" is the wrong comparison.

A plugin is not necessarily a better skill.

It is a **container that can carry skills**.

The analogy is closer to comparing a source file with a package.

One contains behavior. The other gives related behavior a distributable boundary.

---

## This changes what a skill marketplace eventually becomes

Today, many skill repositories behave approximately like prompt package registries.

Find a useful capability. Copy or install its folder. Let the agent discover it.

Agent Plugins makes a richer unit distributable.

Imagine a database migration capability.

A skill alone might contain:

```text
skills/
└── migrate-database/
    ├── SKILL.md
    ├── references/
    └── scripts/
```

Useful.

But the complete capability might also need a schema inspection server, deployment API, or organization-specific tool surface.

The plugin boundary can carry both:

```text
database-migration/
├── plugin.json
├── skills/
│   └── migrate-database/
│       ├── SKILL.md
│       ├── references/
│       └── scripts/
└── mcp.json
```

Now distribution can start describing **capability systems**, rather than isolated instruction folders.

That makes marketplaces more interesting, but also more dangerous.

A skill may influence model behavior.

An MCP server can introduce executable code, network access, credentials, external side effects, or all four.

Packaging them together raises the value of the unit and the blast radius of installing the wrong one.

---

## Portability is ahead of trust

Agent Plugins v1 intentionally does not solve everything.

The specification does **not** currently define a portable permission system, sandbox model, or trust framework. Its future-considerations document explicitly lists permission declarations and client-enforced capability restrictions as possible future work. OAuth configuration is also outside the v1 portable MCP format.

That leaves an important asymmetry:

[[SVG_3_PORTABILITY_TRUST]]

We are getting better at answering:

> "Can this plugin run on another agent?"

faster than:

> "What exactly am I authorizing when I install it?"

That second question becomes increasingly important as the package boundary grows.

A portable `SKILL.md` is mostly context.

A portable plugin may contain context **plus execution paths into other systems**.

Plugin registries will therefore need stronger provenance than skill directories alone: publisher identity, version history, declared capabilities, source inspection, dependency visibility, reproducible packaging, and eventually some shared vocabulary around permissions.

The specification gives us the box.

The ecosystem still has to design the tamper seal.

---

## Cross-agent distribution is now a realistic target

This is no longer only a paper-format exercise.

Microsoft documents support for Agent Plugins in VS Code and describes the open standard as a way to package Skills and MCP servers for use across compatible AI agents. VS Code still supports richer client-specific plugin capabilities such as agents, hooks, and commands alongside the portable core.

That hybrid model is probably the right one.

Standards usually become brittle when they attempt to standardize every useful feature immediately.

Agent Plugins instead defines an interoperability floor:

```text
          PORTABLE
             │
      ┌──────┴──────┐
      │             │
   Skills          MCP
      │             │
      └──────┬──────┘
             │
        plugin.json
             │
─────────────┼─────────────
             │
      CLIENT-SPECIFIC
             │
   hooks · agents · UX
   policy · permissions
```

A client can innovate above the line without forcing plugin authors to duplicate everything below it.

That is the design choice worth watching.

---

## Skills are becoming components

The biggest shift may be conceptual.

The first generation of agent skills looked a lot like enhanced prompts.

Then they acquired scripts, references, assets, routing behavior, evaluation, and distribution.

Agent Plugins pushes the ecosystem another step.

A skill becomes something that can live inside a larger **capability package**.

That changes the questions worth asking when evaluating a skill:

Not only:

> Is this instruction set good?

But:

> What other capabilities does it expect?

> Which MCP surfaces does it pair with?

> Is the combination portable?

> What does installing the package add to the agent's reachable world?

> Can those capabilities be activated selectively rather than dumped into every session?

The unit of competition moves upward.

Individual skills still matter.

But ecosystems increasingly compete on **composition**.

---

## The package manager moment

MCP standardized a connection boundary.

Agent Skills standardized a capability format.

Agent Plugins is trying to standardize how those pieces travel together.

That does not make the ecosystem finished. It makes the next problems easier to see.

Discovery.

Trust.

Permissions.

Capability routing.

Versioning.

Evaluation.

Selective loading.

Those become much more important once an agent can install a portable bundle containing both reasoning instructions and executable reach.

For skill authors, there is one concrete thing to do now:

**Stop assuming the skill directory is always the final distribution unit.**

Design the skill so it remains independently understandable, then identify the MCP dependencies that belong beside it rather than inside its prose.

That keeps the capability portable today.

And packageable tomorrow.

---

**Source:** Agent Plugins contributors, *Agent Plugins Specification v1.0.0*, 2026. Initial Technical Steering Committee representation includes Amazon, Cursor, Microsoft, OpenAI, and Vercel.

[Agent Plugins specification](https://agent-plugins.org/) · [Specification repository](https://github.com/agentplugins/agent-plugins-spec)
