---
name: {{skill_name}}
description: >-
  {{skill_description}}
  Triggers: "{{invoke_trigger}}", {{skill_name}}.
version: 1.0.0
---

# {{skill_name}} — {{skill_display_name}}

> {{skill_tagline}}

## Install

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/gaia-research/{{repo_slug}}/main/install.sh)
```

See [README.md](./README.md) for `gaia`, `npx skills`, and manual alternatives.

## When to use

<!-- Replace with concrete situations that should trigger this skill -->
- Situation one
- Situation two
- Situation three

## How it works

<!-- Short walk-through: inputs → transformations → outputs -->
1. Step one — reads ...
2. Step two — computes ...
3. Step three — outputs ...

## Run it

```bash
# Basic
python3 {{script_name}} <args>

# JSON output
python3 {{script_name}} <args> --json

# Help
python3 {{script_name}} --help
```

## Reading the output

<!-- Replace with sample output and interpretation guide -->

```
example output here
```

## Notes

- Requirements: {{requirements}}
- Repo: https://github.com/gaia-research/{{repo_slug}}
- Issues: https://github.com/gaia-research/{{repo_slug}}/issues
