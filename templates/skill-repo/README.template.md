# {{skill_display_name}}

> {{skill_tagline}}

{{skill_description}}

Invoke as `{{invoke_trigger}}` inside any agent that reads SKILL.md files: Claude Code, pi, Codex CLI, Cursor, Gemini CLI.

---

## Install

**One-liner (recommended):**

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/gaia-research/{{repo_slug}}/main/install.sh)
```

Auto-detects your agent skills directory (`.claude/skills/`, `.agents/skills/`, `.codex/skills/`, `.cursor/skills/`) and installs to `{{install_path}}/`. Prompts if multiple are found.

**Via Gaia CLI:**
```bash
gaia skills install https://github.com/gaia-research/{{repo_slug}}
```

**Via npx:**
```bash
npx skills install gaia-research/{{repo_slug}}
```

**Manual clone:**
```bash
git clone --depth 1 https://github.com/gaia-research/{{repo_slug}} {{install_path}}
rm -rf {{install_path}}/.git
```

**Script only (no agent wiring):**
```bash
curl -fsSL https://raw.githubusercontent.com/gaia-research/{{repo_slug}}/main/{{script_name}} -o {{script_name}}
```

---

## Requirements

{{requirements}}

---

## Example

{{example_output}}

---

## How it classifies work

<!-- Replace with the skill's domain-specific classification or analysis logic -->

---

## Usage

```bash
# Basic — repo auto-detected from git remote
python3 {{script_name}} <args>

# JSON output
python3 {{script_name}} <args> --json

# Help
python3 {{script_name}} --help
```

---

## As an agent skill

Once installed, invoke from any agent conversation:

```
{{invoke_trigger}} <args>
```

---

## Compatibility

| Agent | Install path | Notes |
|---|---|---|
| Claude Code | `.claude/skills/{{skill_name}}/` | Native `/`-command |
| pi | `.agents/skills/{{skill_name}}/` | Native `/`-command |
| Codex CLI | `.agents/skills/{{skill_name}}/` | Invoke via prompt |
| Cursor | `.cursor/skills/{{skill_name}}/` | Invoke via prompt |
| Gemini CLI | any skills dir | Call via shell tool |

---

## Gaia integration (optional)

`{{skill_name}}` is part of the [Gaia Skill Registry](https://gaiaskilltree.com). Install via `gaia skills install`, track it in your tree with `gaia scan`, and push improvements with `gaia push`.

You don't need Gaia to use this. The installer is plain bash and the skill files are portable Markdown + shell/Python.

---

## License

MIT — see [LICENSE](./LICENSE).

---

<a href="https://gaiaskilltree.com"><img src="./powered-by-gaia.svg" alt="Powered by Gaia" height="28"></a>
