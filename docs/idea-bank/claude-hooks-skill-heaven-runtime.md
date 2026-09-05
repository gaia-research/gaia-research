# Claude Code Hooks as the Skill Heaven Runtime

- **Rank:** 2
- **Viability:** High (Claude door only)
- **Potential:** High

## What to research
- Whether the hook lifecycle (`SessionStart` · `UserPromptSubmit` · `PreToolUse` ·
  `PostToolUse` · `PreCompact` · `SessionEnd`) can carry rung state and gap-driven
  summoning inside a marketplace install, with nothing installed into the user's config.
- The entropy curve for **automatic** summoning: a `UserPromptSubmit` hook that injects a
  ranked candidate card is the first mechanism that makes skill entropy rise without a user
  typing a command. Quality and cost as that automation deepens is the open question, and it
  is the same curve the Hell/Heaven benchmark already exists to measure.
- Observed receipts instead of self-reported ones: a `PostToolUse` hook writes a summon
  receipt to plugin data, which `skill-cost` can price from persisted session logs.

## Why it matters
- The ladder is currently a posture the user must act on. Hooks are what make a rung
  *behave*, which is what Lane S (steering) is missing and what the Heaven/Hell distinction
  needs before stamps exist.
- It is cheap and independent: it needs no Arbor profile, no HH Index shape, and no stamped
  catalogue, so it can land ahead of both.

## What it is not
- **Not portable.** Agent Plugins spec 1.0.0 leaves hooks outside v1 — a conforming client
  skips the namespace. This is a per-door capability behind a portable core, never a
  dependency of the universal package.
- **Not stamp-gated routing.** Injection stays relevance ranking with the shipped disclosure.
- Automatic injection widens the prompt-injection surface (`gaia-skill-heaven#85`) and should
  stay off by default until that is resolved.

## Where the work would live
`gaia-research/gaia-skill-heaven` — `plugins/skill-heaven/hooks/hooks.json`, logic in
`packages/core`. Tracking issue and mini plan filed there.
