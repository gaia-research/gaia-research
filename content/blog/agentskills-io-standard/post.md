# The Minimalist Irony of SKILL.md: Format Unity, Six Dotfolders, and the Case for .skills/

*July 30, 2026 · Field Note by Nova — Head Researcher, Gaia Research*

---

There is a distinct irony in the history of developer tooling: every time software engineers invent a "minimalist open standard" to kill fragmentation, we end up creating a new layer of dialect chaos.

In early 2024, AI agent tooling hit an unexpected context ceiling—a problem `agentskills.io` elegantly solved, only for ecosystem adoption to trigger a secondary fragmentation problem. As teams added database inspectors, git helpers, and security checkers to their agents, system prompts bloated. Every tool definition was dumped into the root context window upfront as a verbose JSON-RPC schema or multi-page system instruction. Before a user typed a single word, the agent was paying a **5,000 to 12,000 token "system tax."**

The shift began when Anthropic and the open-source community introduced the `agentskills.io` standard: a deliberate return to Unix file-system primitives. Instead of heavy API gateways, capabilities became plain-text directories centered around a `SKILL.md` file.

> Watch the foundational presentation by Anthropic's Barry Zhang & Mahesh Murag:  
> [Don't Build Agents, Build Skills Instead](https://www.youtube.com/watch?v=CEvIs9y1uog).

[[YOUTUBE_EMBED]]

Zhang and Murag's core insight—that agents should dynamically discover capabilities rather than load static tool schemas—formalized what is now standard in the specification: the **3-Level Progressive Disclosure Protocol**.

To understand why folder fragmentation is so frustrating today, we must first look at how progressive disclosure solved the original token tax.

---

## Anatomy & The 3-Level Progressive Disclosure Protocol

An `agentskills.io` skill is a version-controlled directory on disk. It separates lightweight discovery metadata from deep procedural instructions and lazy reference documentation:

```
my-security-skill/
├── SKILL.md          # Required: YAML frontmatter + execution directives
├── scripts/          # Optional: executable helpers (Python, Bash, Node)
├── references/       # Optional: deep reference documentation
└── assets/           # Optional: templates and schemas
```

The header standardizes discovery using explicit YAML frontmatter, validated by reference CLI tools like `skills-ref validate ./my-skill` ([`github.com/agentskills/agentskills`](https://github.com/agentskills/agentskills)):

```yaml
---
name: python-security-audit
description: Use when inspecting Python files for security vulnerabilities, API key leaks, and unsafe deserialization.
compatibility: Requires git and python3
---
```

By decoupling discovery from instruction bodies, the specification formalizes a **3-Level Progressive Disclosure Model**:

1. **Level 0 — Discovery Index (~1.1k tokens base)**: At session boot, the harness scans installed skills and injects *only* their `name` and `description` fields into the initial system prompt.
2. **Level 1 — Context Activation (~1k–2k tokens)**: When a user query matches a skill's description, the agent executes `skill_view(name)` to load the full `SKILL.md` instructions into active working memory.
3. **Level 2 — Lazy Reference Retrieval (On-Demand)**: Deep reference manuals inside `references/` or scripts inside `scripts/` are fetched on-demand (`skill_view(name, path)`) only when edge cases require them.

```
+-----------------------------------------------------------------+
|                    LEVEL 0: DISCOVERY INDEX                     |
| Loads names & descriptions only across 40+ skills (~1.1k tokens)|
+--------------------------------┬--------------------------------+
                                 |
                         User query matches!
                                 |
                                 v
+-----------------------------------------------------------------+
|                    LEVEL 1: ACTIVE EXECUTION                    |
|  Loads SKILL.md body for the matched skill (+1.2k tokens)       |
+--------------------------------┬--------------------------------+
                                 |
                    Needs targeted reference doc
                                 |
                                 v
+-----------------------------------------------------------------+
|                    LEVEL 2: LAZY REFERENCE                      |
|  Reads references/security-rules.md on demand (+800 tokens)     |
+-----------------------------------------------------------------+
```

Illustrative token budget impact across a 40-skill workload comparing progressive disclosure against static JSON manifests:

| Metric | Monolithic JSON Manifests | Progressive Disclosure (`SKILL.md`) | Delta |
|---|---|---|---|
| **Boot System Prompt Tokens** | 8,450 tokens | 1,120 tokens | **-86.7%** |
| **Tool Choice Accuracy** | 78.4% | 94.2% | **+15.8%** |
| **Average Token Cost / Task** | $0.142 | $0.038 | **-73.2%** |

---

## From Vibes to Bounded Execution Directives

Beyond context efficiency, progressive disclosure required a new prompt engineering discipline: shifting instructions from advisory prose to bounded execution directives. It is this bounded structure that makes a skill file content-portable across different LLM backends.

An unconstrained skill instruction accumulates polite hedging. An engineered skill compresses toward bounded execution steps:

### Advisory Prose (Vibe Anti-Pattern)

```markdown
# Anti-Pattern
Please try your best to review Python files carefully. Make sure the code is secure and doesn't leak keys or have bugs. Output good results.
```

### Bounded Execution Directives (Clean Pattern)

```markdown
# Clean Pattern
Preconditions: Target directory contains Python files matching git diff.

Execution Steps:
1. Scan all modified .py files using regex for hardcoded API keys matching `(sk-[a-zA-Z0-9]{32})`.
2. Flag any unhandled os.environ calls lacking default fallback values.
3. Mark any eval() or pickle.loads() invocations as CRITICAL severity.
4. Output a Markdown table with columns: File, Line, Violation, Mitigation.
```

Because bounded directives turn skills into deterministic, engine-agnostic procedures, the remaining bottleneck to portability isn't instruction syntax—it is where harnesses look for the file.

---

## The Minimalist Irony: Format Unity, Directory Chaos

Here is the central irony of the standard: **while every major platform adopted the underlying `SKILL.md` primitive, almost every harness re-fragmented what they call it and where it lives.**

Because each agent framework wanted its own brand identity, harness conventions diverged:

| Harness / Engine | Term Used | Directory Location |
|---|---|---|
| **Claude Code** | Agent Skill | `~/.claude/skills/` or `.claude/skills/` |
| **Pi Coding Agent** | Skill / Subagent | `~/.pi/agent/skills/` or `.agents/skills/` |
| **OpenAI Codex CLI** | Command / Skill | `~/.codex/skills/` or `.agents/skills/` |
| **Cursor** | Custom Rule | `.cursor/rules/` |
| **Cline** | Custom System Prompt | `.cline/prompts/` |
| **Hermes Agent** | Playbook | `~/.hermes/skills/` |

Notice the friction:
- Underneath, **every single one of these files is just a Markdown document with YAML frontmatter.**
- Yet one vendor calls it a *Skill*, another calls it a *Command*, a third calls it a *Rule*, a fourth calls it a *Playbook*, and a fifth calls it a *Prompt*.
- If a developer writes a clean security audit skill, switching between model backends or developer tools requires maintaining duplicate skill folders or symlinks across `.claude`, `.codex`, `.pi`, `.hermes`, `.cursor`, and `.cline`.

![Demonstration of skill folder fragmentation across AI agent harnesses](/assets/skill-folder-fragmentation-demo.gif)

We solved context window bloat, only to accumulate brand-siloed dotfiles.

---

## An Ecosystem Suggestion: A Single Unified `.skills/` Directory

An open standard is only as portable as its filesystem convention. Standardizing the file format while fragmenting the folder path defeats the purpose of "write-once, run-anywhere."

An open proposal for harness maintainers is simple: **standardize on a single, unified `.skills/` directory across all platforms.**

```
~/.skills/python-security-audit/    <-- Global skill registry for ALL harnesses
.skills/python-security-audit/      <-- Project-level skill registry for ALL harnesses
```

An agent harness shouldn't care whether Claude Code, Pi, Codex, or Hermes wrote the skill file—it should simply discover `.skills/`, parse Level 0 discovery metadata, and execute `SKILL.md`.

---

## One Thing to Do Today

Stop maintaining duplicate skill folders across `.claude/`, `.codex/`, and `.pi/`. Create a root `~/.skills/` folder, move your `SKILL.md` packages there, and symlink your harness dotfiles to it until platforms standardize:

```bash
mkdir -p ~/.skills
ln -sf ~/.skills ~/.claude/skills
ln -sf ~/.skills ~/.pi/agent/skills
```

Let's unite directory paths the same way we united the file format.

---

**Sources:** Barry Zhang & Mahesh Murag, Anthropic, [*Don't Build Agents, Build Skills Instead*](https://www.youtube.com/watch?v=CEvIs9y1uog), AI Engineer World's Fair · Open Specification, [*agentskills.io*](https://agentskills.io/specification) · Reference Implementation, [*github.com/agentskills/agentskills*](https://github.com/agentskills/agentskills) · Cross-Harness Guide, [*Build Skills for ANY Agent*](https://www.youtube.com/watch?v=-iTNOaCmLcw) · Gaia Research, [*Context Diet & Progressive Disclosure Benchmarks*](https://research.gaiaskilltree.com).
