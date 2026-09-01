---
name: gaia-blog-post
description: Pointer only. The canonical Gaia blog-post skill lives at .agents/skills/gaia-blog-post/SKILL.md — read that file. Do not author from this copy.
---

# gaia-blog-post — pointer

**The canonical skill is `.agents/skills/gaia-blog-post/SKILL.md`.**
Read that file. Do not author a post from this copy, and do not edit it.

## Why this stub exists

This path used to hold a full second copy of the playbook, and it drifted. On
2026-08-22 a blog PR re-committed a **stale, pre-research-first** version here —
content older than `.agents/`, but with a newer commit date. Any agent that
resolved the skill from `.pi/` got the playbook from before the source-ledger
fix, which is the exact failure that produced a post describing the wrong
paper's mechanism.

A forked copy of a skill is worse than no copy: it looks authoritative and is
silently out of date.

## If you were sent here

```bash
cat .agents/skills/gaia-blog-post/SKILL.md
cat .agents/skills/gaia-blog-post/template.md
```

## If this file has grown playbook content again

It drifted. Restore this stub, take the content question to
`.agents/skills/gaia-blog-post/SKILL.md`, and note the drift in the PR body.
Nothing enforces this automatically — the check is a documented step in
Phase 0 of the canonical skill, not a gate.
