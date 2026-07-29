# Pattern Overfitting in AI Coding Agents Caused by Codebase Noise

- **Rank:** 16
- **Status:** Idea / LEANING — **not ratified**. Nothing here overrides `founder/RATIFICATION.md` or repository validation gates.
- **Viability:** High (identifying and removing obsolete comments, template examples, and superseded field placeholders is immediately actionable)
- **Potential:** Very High (directly targets agent hallucination, validation CLI bypass, and structural schema drift across ecosystem repos)

## Observation & Problem Statement

LLM coding agents suffer from a systemic failure mode: **pattern overfitting to codebase noise**. When working in complex repositories, models heavily weight contextual cues found in neighboring files, outdated template comments, legacy YAML placeholders, and superseded schema examples over explicit task instructions, canonical CLI adapter APIs, or domain invariants.

Because LLMs function via token probability prediction over context windows, passive codebase artifacts act as accidental "few-shot prompt injections". Even when an architecture moves forward (e.g. Yggdrasil II making Trust Magnitude the sole gate for skill promotion), leftover example fields in issue templates or comments lead agents to invent superseded properties, hand-write raw files using primitive file-write tools, and bypass canonical Python CLI wrappers (`intakeAdapter.py`, `pushFromFile.py`).

## Prime Worked Examples

### Example 1: Intake Template Star Declaration Overfit
- **Observation:** The GitHub issue template `.github/ISSUE_TEMPLATE/new_skill_intake.yml` retained a legacy placeholder `level: "2★"`.
- **Consequence:** LLM intake agents overfitted on this placeholder and began manually declaring star ranks like `level: "3★"` directly in issue bodies and YAML intake proposals.
- **Systemic Root Cause:** The agents copied the exact structural shape of the issue template example, ignoring the Yggdrasil II invariant which established Trust Magnitude (`trustMagnitude.py`) as the sole, automated gate for star rank determination.

### Example 2: Generic ID Copying vs Upstream SKILL.md Frontmatter
- **Observation:** Agents processing skill intake proposals copied generic candidate IDs (such as `agentic-seo-audit`) from placeholder examples or target directory names into named entry fields.
- **Consequence:** Agents failed to parse the authoritative `frontmatter.name` (`seo`) from the upstream `SKILL.md` file.
- **Systemic Root Cause:** Nearest-neighbor context (filename/placeholder ID) overpowered upstream frontmatter parsing logic because candidate examples in comments provided a stronger superficial match pattern than programmatically inspecting frontmatter.

### Example 3: Manual YAML Crafting Bypass vs CLI Adapter
- **Observation:** Agents repeatedly hand-crafted raw YAML files using primitive file-write tools instead of piping data programmatically through the canonical CLI adapter `intakeAdapter.py` (and commands like `pushFromFile.py`).
- **Consequence:** Bypassed schema validation, field normalization, and gate checks built into the CLI adapter suite, leading to malformed payload structures entering the pipeline.
- **Systemic Root Cause:** Agents saw raw YAML snippets in historical commits and issue templates, prompting them to emit raw YAML directly rather than discovering and invoking the programmatic CLI tool path.

## Research Rationale & Proposed Audit / Postmortem Paper Structure

Codebase noise acts as passive adversarial prompt injection. A structured postmortem and research paper will analyze this phenomenon and propose systemic mitigations for agent harness design.

### Proposed Paper Structure

1. **Taxonomy of Codebase Noise:**
   - Deprecated template placeholders and example values (e.g. `level: "2★"`).
   - Obsolete YAML header blocks in issue templates.
   - Outdated comments and dead code paths in legacy adapters.
   - Hand-written YAML snippets in documentation instead of CLI invocation commands.

2. **Empirically Observed Failure Modes:**
   - *Hallucinated Fields:* Inventing superseded attributes based on template examples.
   - *Adapter Bypass:* Preferring file manipulation tools over domain CLI wrappers.
   - *Identifier Collisions:* Copying generic placeholder strings instead of parsing upstream metadata.

3. **Harness & Repository Mitigation Strategies:**
   - *Context Scrubbing:* Automated pre-commit linting to scrub obsolete fields and placeholders from issue templates and markdown docs.
   - *Adapter Enforcement:* Hardening CLI tools to reject direct file writes unless passed through `intakeAdapter.py` validation pipelines.
   - *Negative Fencing:* Explicitly identifying common overfitting targets in agent system prompts and SKILL definitions.

4. **Measurement & Audit Suite:**
   - Evaluating agent task completion accuracy and compliance before and after eliminating codebase noise.

## Open Questions

- Can static analysis tools automatically flag "context traps" (placeholders that conflict with current schemas) in documentation and issue templates?
- Should CLI adapters actively fail with actionable error messages when agents attempt to submit manually crafted YAML containing deprecated fields?
- What is the minimal set of negative constraints required in `.agents/skills/` to prevent agents from bypassing CLI adapters without causing prompt bloat?

## Commit & PR Body Markers / Metadata Context

*This metadata context is provided for downstream `gaia-research` and `gaia-skill-tree` agents consuming this idea-bank entry.*

- **Target Repo:** `gaia-skill-tree`
- **Key PRs:** `#1373`, `#1374`, `#1355`
- **Relevant Files:**
  - `.github/ISSUE_TEMPLATE/new_skill_intake.yml`
  - `src/gaia_cli/commands/pushFromFile.py`
  - `src/gaia_cli/intakeAdapter.py`
  - `.agents/skills/gaia-draft-curate/SKILL.md`
