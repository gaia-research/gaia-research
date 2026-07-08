# Skill Repo Template

Every file needed to bootstrap a new standalone skill repo under `gaia-research/`.

| File | Purpose | Parameterised? |
|---|---|---|
| `README.template.md` | Repo landing page | ✅ yes |
| `SKILL.template.md` | Agent skill spec | ✅ yes |
| `install.template.sh` | One-liner installer | ✅ yes |
| `.gitignore` | Python/Node/editor ignores | ❌ static |
| `LICENSE.template` | MIT license | ✅ `{{year}}` `{{org}}` |
| `powered-by-gaia.svg` | Brand badge for README footer | ❌ static |
| `TEMPLATE_README.md` | This file — not shipped into new repos | — |

## Placeholders

| Placeholder | Example | Notes |
|---|---|---|
| `{{skill_name}}` | `ci-churn` | kebab-case; used as directory name |
| `{{skill_display_name}}` | `CI Churn` | Title Case; used in headings |
| `{{skill_tagline}}` | `Measure the CI cost of avoidable pushes.` | One sentence, the pain point |
| `{{skill_description}}` | `Classifies commits…` | 2–3 sentences |
| `{{repo_slug}}` | `skill-ci-churn` | GitHub repo name |
| `{{invoke_trigger}}` | `/ci-churn` | The `/`-command |
| `{{install_path}}` | `.agents/skills/ci-churn` | Canonical install path shown in README |
| `{{example_output}}` | Fenced code block | Real terminal output |
| `{{requirements}}` | `gh CLI (authenticated), Python 3.8+` | Shown in Requirements section |
| `{{year}}` | `2026` | Copyright year |
| `{{org}}` | `gaia-research` | For LICENSE |
| `{{script_name}}` | `ci_churn.py` | Main runnable filename |
| `{{files_to_fetch}}` | `"ci_churn.py" "SKILL.md"` | Bash array literal for install.sh |

## Quick-start (human maintainer)

Fill in the variables below, then run the block. Uses Python for substitution
(safer than sed for multi-line values like `{{example_output}}`):

```bash
export SKILL_NAME="my-thing"
export SKILL_DISPLAY_NAME="My Thing"
export SKILL_TAGLINE="Do the thing, faster."
export SKILL_DESCRIPTION="A 2–3 sentence description of what this skill does and when to use it."
export REPO_SLUG="skill-${SKILL_NAME}"
export INVOKE_TRIGGER="/${SKILL_NAME}"
export INSTALL_PATH=".agents/skills/${SKILL_NAME}"
export SCRIPT_NAME="my_thing.py"
export REQUIREMENTS="Python 3.8+, gh CLI"
export FILES_TO_FETCH='"my_thing.py" "SKILL.md"'
export YEAR="$(date +%Y)"
export ORG="gaia-research"
export EXAMPLE_OUTPUT='```
example output here
```'

# Clone templates
TEMPLATES="$(pwd)/templates/skill-repo" # adjust if running from outside this repo
mkdir -p "/tmp/${REPO_SLUG}" && cd "/tmp/${REPO_SLUG}"

python3 - <<'PY'
import os, pathlib, shutil

subs = {
    "{{skill_name}}": os.environ["SKILL_NAME"],
    "{{skill_display_name}}": os.environ["SKILL_DISPLAY_NAME"],
    "{{skill_tagline}}": os.environ["SKILL_TAGLINE"],
    "{{skill_description}}": os.environ["SKILL_DESCRIPTION"],
    "{{repo_slug}}": os.environ["REPO_SLUG"],
    "{{invoke_trigger}}": os.environ["INVOKE_TRIGGER"],
    "{{install_path}}": os.environ["INSTALL_PATH"],
    "{{example_output}}": os.environ["EXAMPLE_OUTPUT"],
    "{{requirements}}": os.environ["REQUIREMENTS"],
    "{{year}}": os.environ["YEAR"],
    "{{org}}": os.environ["ORG"],
    "{{script_name}}": os.environ["SCRIPT_NAME"],
    "{{files_to_fetch}}": os.environ["FILES_TO_FETCH"],
}

templates = pathlib.Path(os.environ["TEMPLATES"])
out = pathlib.Path(".").resolve()

mapping = [
    ("README.template.md", "README.md"),
    ("SKILL.template.md", "SKILL.md"),
    ("install.template.sh", "install.sh"),
    ("LICENSE.template", "LICENSE"),
]
for src, dst in mapping:
    text = (templates / src).read_text(encoding="utf-8")
    for k, v in subs.items():
        text = text.replace(k, v)
    (out / dst).write_text(text, encoding="utf-8")

for static in [".gitignore", "powered-by-gaia.svg"]:
    shutil.copy(templates / static, out / static)

print("Done. Files written to:", out)
PY

chmod +x install.sh
git init -b main
git add .
git commit -m "chore: bootstrap ${REPO_SLUG} from templates/skill-repo"
gh repo create "gaia-research/${REPO_SLUG}" --public --source=. --remote=origin --push \
  --description "${SKILL_TAGLINE}"
echo "✓ https://github.com/gaia-research/${REPO_SLUG}"
```

## Agent-driven bootstrap

If you have the `gaia-skill-tree` skills loaded in your agent:

```
/skill-template <skill-name>
```

The `/skill-template` skill fetches these templates via the GitHub API, prompts for
all placeholder values interactively, writes the substituted files, and pushes a new
repo to `gaia-research/skill-<name>` in one go.

## Update mode

To align an existing skill repo (e.g. `skill-fuse`) to this template:

```
/skill-template update skill-fuse
```

The agent diffs current files against freshly rendered templates, lets you
review each change, and opens a draft PR with only the accepted drift.

## Version policy

The `version:` field in `SKILL.template.md` frontmatter is the template version.
Bump it on any breaking structural change (renamed placeholder, dropped section).
Existing repos don't need to rebase — the template is not a runtime dependency.
