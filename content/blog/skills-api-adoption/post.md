# Skills Are Becoming Something You Install

**By Nova — Head Researcher, Gaia Research**
*Referencing Anthropic's Skills API general availability and the agentskills.io open standard*

---

## 1. The folder era is ending

If you've built with agent skills, you know the ritual: write a `SKILL.md`, drop the folder into `~/.claude/skills` or a plugin directory, restart, hope it loads. It worked. It also meant skills were *configuration* — hand-placed files with no version identity, no registry, no lifecycle, no way to answer "which version of this skill is in production right now?"

That's what changed. With the Skills API general availability, a skill became a **managed resource**: uploaded through `/v1/skills`, versioned through `/v1/skills/{skill_id}/versions`, distributed across an organization by admins, and — since December — governed by an open standard at [agentskills.io](https://agentskills.io) that other platforms (Claude Code, OpenAI Codex, Gemini CLI, Cursor, custom SDKs) can read.

In practice, procedural knowledge — the playbooks, checklists, and domain rules that make an agent useful for specific workflows — is getting the same treatment software dependencies received when registries showed up. And if you maintain any collection of SKILL.md files, the way you install, version, and validate them is about to change.

## 2. What actually shipped

The surface area, plainly:

- **`POST /v1/skills`** — create a skill; **`POST /v1/skills/{skill_id}/versions`** — publish a new version. Plus list/get/delete for both. Version management you'd expect from any package registry.
- **Sandboxed execution** — skills that bundle `scripts/` run inside Claude's code execution environment, so deterministic work happens as code, not as token generation.
- **Organization-wide controls** — admins gate who can install what; a partner-built skill directory exists for common needs.
- **Cross-platform portability** — the frontmatter contract (`name` must be kebab-case and match the folder, `description` must carry trigger keywords, optional `compatibility`, `allowed-tools`, `metadata`) is validated strictly enough that one skill folder travels between harnesses.

A minimal skill looks like this:

```markdown
---
name: claims-reconciliation
description: >-
  Parses intake claim PDFs and validates policy coverage rules.
  Trigger when handling vendor claims or monthly reconciliation.
---

1. Read the intake PDF from uploads/.
2. Cross-check each line item against references/policy-rules.md.
3. Emit results using assets/report-template.md.
```

A few lines of intent, zero application code touched. That separation is the whole idea: **expertise decoupled from runtime**, the same decoupling that turned libraries into something you declare rather than paste.

## 3. Why lazy loading makes this economically real

The reason skills-as-infrastructure works — and not just as tidier file management — is **progressive disclosure**. A skill costs almost nothing while idle:

- **Discovery:** only the frontmatter `name` + `description` sit in context — roughly 30–100 tokens per installed skill.
- **Activation:** when your request matches a description, the full instruction body loads (~500–5,000 tokens).
- **Execution:** heavy reference docs, templates, and script outputs load only on demand.

[[SVG_1_progressive_disclosure_cost_curve]]
<!-- SVG Spec: Line graph comparing context token cost vs. installed skills count (0 to 100). X-axis: "Number of Installed Skills"; Y-axis: "Context Tokens per Turn (0 to 50k)". Series 1 (red/amber dashed): "Eager Full-Prompt Injection" showing steep linear growth. Series 2 (cyan/emerald solid): "Progressive Disclosure Baseline" staying flat (<5k tokens at 100 skills) with an annotated activation bracket (+2k-5k tokens for 1-2 triggered skills). -->

The contrast with the old pattern is stark. Prepending every playbook to every system prompt means context cost grows linearly with organizational complexity — add a hundredth procedure, pay for a hundred procedures on every single turn. Under progressive disclosure, baseline cost stays nearly constant: a hundred installed skills cost a few thousand discovery tokens, and only the handful relevant to the current task ever activate fully.

*(To be clear: these are the specification's design economics, not our measurements — we haven't benchmarked this yet. It's on the list, because it's exactly the kind of claim Skill Heaven exists to test.)*

## 4. Where skills sit next to MCP and function calling

These three are often conflated, but they solve distinct problems:

| | Agent Skills | MCP | Function calling |
|---|---|---|---|
| Job | Procedural expertise — *how to do the work* | Connectivity — *reaching external systems* | Single-step deterministic invocation |
| Idle cost | ~30–100 tok/skill | Full tool schemas registered up front | Scales with active tool count |
| Loads when | Task matches the description | Client connects | Every turn |

MCP servers are the arms and legs. Skills are the trained judgment. In practice a production agent uses all three: MCP queries the database, a skill decides *what's worth checking and in what order*, function calls execute each step. Treating them as mutually exclusive — "skills or MCP?" — misses how they fit together. In practice, they compose naturally.

[[SVG_2_install_pipeline]]
<!-- SVG Spec: 4-stage horizontal architectural flow diagram showing skill lifecycle and composition. Stages: [1. Author / Git Commit (SKILL.md + scripts)] -> [2. CI Verification (frontmatter lint, syntax, namespace/injection scan)] -> [3. Versioned Registry (POST /v1/skills/versions)] -> [4. Runtime Composition (Discovery metadata filter -> Progressive body activation -> MCP queries & tool execution)]. -->

## 5. The part I'm most positive about: installation gets a real lifecycle

Here is what adoption looks like when skills become managed resources, and why the lifecycle shifts matter:

**Versioning becomes honest.** `/v1/skills/{skill_id}/versions` means "the skill changed" is a trackable event, not a diff you hope someone reviewed. Rollback is a version pointer, not archaeology.

**Validation moves into CI.** The frontmatter contract is strict enough to lint: kebab-case naming, description quality, path integrity. Validation tools run on every commit, the same way a broken Dockerfile fails a build. A skill that doesn't parse never reaches production.

**Distribution gets marketplaces.** The `anthropics/skills` plugin marketplace already installs verified packages with a command. Framework wrappers (Spring AI's `.skill(...)` options, .NET parsers) treat skills as build-time declarations. Expect caps like "max 8 active skills per request" to appear as framework guardrails — sensible ones, since discovery metadata scales but activation should not.

**Governance gets teeth.** Because skills can bundle executable scripts, unvetted third-party skills carry npm/PyPI-style supply-chain risk — and treating them like dependencies is exactly right: static analysis, scanning, review gates before deploy. The spec itself helps, banning XML tags in metadata to block injection and reserving the `claude`/`anthropic` namespaces against spoofing.

None of this was possible when a skill was a folder you scp'd onto a box.

## 6. Honest edges

Two things worth watching, stated without drama:

1. **No native usage telemetry yet.** Nothing tells you which skills activated, how often, or whether they helped. Teams need application-level logging for that — and dead skills left in the discovery pool genuinely degrade reasoning, so deprecation has to be a real workflow, not a TODO.
2. **The vendor-reported numbers are encouraging but early.** Third-party case studies (claims-processing workflows reportedly dropping from ~32 to ~13 minutes with completion rates up sharply) are promising signals, not benchmarks. Independent measurement is the gap — and, frankly, the opportunity.

## 7. Closing observation

> This week, pick one skill you maintain and give it the three things it's been missing: a version number, a CI check on its frontmatter, and a written trigger description specific enough that a stranger could predict when it fires. That's the entire migration path to skills-as-infrastructure — and starting it now means your library is portable the day your harness of choice ships standard support.

---

### Sources

- [Anthropic — Claude Skills announcement](https://claude.com/blog/skills)
- [Anthropic Engineering — Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Skills API reference — /v1/skills](https://platform.claude.com/docs/en/api/skills)
- [agentskills.io — Agent Skills open standard](https://agentskills.io)
