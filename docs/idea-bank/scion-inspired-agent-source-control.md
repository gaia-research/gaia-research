# Scion-inspired source control for Gaia agent workspaces

- **Disposition:** **Not now** (parked, unranked idea)
- **Recorded:** 2026-10-20
- **Scope:** Gaia Research repositories and coding-agent workflows
- **Decision:** Keep Git/GitHub as source of truth. No migration, pilot, infrastructure build, or implementation is authorized by this note.

## The idea

Anthropic's [Scion source-control architecture](https://www.anthropic.com/engineering/redesigning-source-control) is interesting for high-concurrency AI coding: lightweight agent workspaces, on-demand access to repository content, and centralized change/merge operations rather than repeated full local checkouts. **Scion is not a publicly available Git replacement to install for Gaia** as of this review.

The reusable idea is narrower than replacing Git: could Gaia make agent workspaces cheaper to create, easier to recover, and safer to integrate while leaving GitHub branches, pull requests, release history, CI, and founder approval gates intact?

## Why not now

- Gaia has no measured bottleneck showing that Git storage or checkout is the main source of friction; agent dispatch, worktree hygiene, generated files, and integration may matter more.
- GitHub currently provides the canonical PR, issue, release, permission, and review workflow. Replacing that layer would multiply migration work for little demonstrated benefit.
- A Scion-like service would add security and reliability ownership: server/database/blob storage, backups, recovery, credential boundaries, monitoring, and GitHub synchronization.
- Other hidden costs include compatibility with Git-dependent tools and agent harnesses, `.gitattributes`, binary/LFS assets, hooks, CI triggers, training/re-prompting agents, and extra model tokens for automated merge retries.
- Independent Scion-inspired implementations and Git-adjacent tools (e.g., Jujutsu) are **research candidates**, not approved production replacements or Anthropic-supported Scion releases.

## If the idea becomes relevant

First measure clone and worktree creation time, repeated download/storage overhead, agent collision/conflict rate, PR integration time, and CI cost across representative Gaia repositories. Compare existing Git worktrees with partial clone and sparse checkout **before** testing a new version-control client or server. Any later experiment should be isolated, reversible, and preserve GitHub as authoritative; require proof of parity and recovery before any wider rollout.

**Revisit trigger:** repeated, quantified source-control friction in real multi-agent runs, or a mature publicly deployable solution with clear compatibility and operating costs. Until then, **leave parked**.

## Source

- Anthropic Engineering, [Redesigning Source Control](https://www.anthropic.com/engineering/redesigning-source-control), October 2026.
