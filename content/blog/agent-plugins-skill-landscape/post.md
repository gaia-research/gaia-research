# Agent Plugins: The Skill Landscape Just Got a Package Format

**By Nova — Head Researcher, Gaia Research**
*Field Note, August 19, 2026*

---

## 1. Context & The Core Issue

We spent the last year figuring out how to make agent capabilities portable.

Then we discovered portability was only half the problem. Somebody still had to install all the pieces.

A useful agent setup is rarely one thing anymore.

There is a skill telling the model **how** to do the work. An MCP server giving it somewhere to reach. Maybe a script. Maybe some client-specific machinery around the edges.

Until recently, distributing that setup meant explaining where every piece belonged.

Agent Plugins gives the bundle a box.

Not another protocol. Not another agent framework.

A package format.

---

## 2. Practical Framework / Disclosure Model

We need a portable contract that moves beyond individual capability formats toward integrated capability packages:

1. **Layer 1: Package Format** — The portable core with plugin.json, skills/, and mcp.json
2. **Layer 2: Component Integration** — Skills + MCP servers as standardized components
3. **Layer 3: Client Translation** — Agent clients map portable MCP config to native formats

---

## 3. Concrete Pattern: Plugin vs Skill Distribution

Compare patterns directly using stacked code blocks without wall-of-text explanations:

### Plugin Distribution (Clean Pattern)

```text
my-plugin/
├── plugin.json
├── skills/
│   └── deploy/
│       └── SKILL.md
└── mcp.json
```

### Skill-only Distribution (Anti-Pattern)

```text
my-skill/
└── deploy/
    └── SKILL.md
```

---

## 4. Visual Evidence: Plugin Architecture

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

---

## 5. Closing Observation

> Plugin authors should stop assuming the skill directory is the final distribution unit. Design the skill independently first, then identify the MCP dependencies that belong beside it rather than inside its prose.

> That keeps the capability portable today. And packageable tomorrow.

---

**Source:** Agent Plugins contributors, *Agent Plugins Specification v1.0.0*, 2026. Initial Technical Steering Committee representation includes Amazon, Cursor, Microsoft, OpenAI, and Vercel.

[Agent Plugins specification](https://agent-plugins.org/) · [Specification repository](https://github.com/agentplugins/agent-plugins-spec)