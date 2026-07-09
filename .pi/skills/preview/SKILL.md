---
name: preview
description: Start, check, stop, restart, or inspect logs for the Gaia Research local Next.js preview server. Use when the user asks for a localhost preview, /preview, dev server, or wants to open/check the WIP website locally.
compatibility: Gaia Research repository with Next.js App Router; uses npm, curl, bash, and .asset-cache/preview for pid/log files.
---

# Preview Skill

Manage the Gaia Research local preview server from the repository root.

## When to use

Use this skill when the user asks to:

- open a localhost preview
- start the website/dev server
- check whether the preview is live
- stop/restart the preview
- show preview logs
- use `/preview` or `/skill:preview`

## Safety rules

- Do **not** use `/tmp` for logs or PID files in this Termux environment; it may be unwritable.
- Use `.asset-cache/preview/`, which is gitignored.
- Do not kill arbitrary processes. Only stop a PID tracked by the preview PID files unless the user explicitly asks for deeper cleanup.
- If port `3000` is already serving HTTP, report it instead of forcibly replacing it.
- Do not generate images for preview work.

## Commands

From the repository root:

```bash
.pi/skills/preview/scripts/preview.sh start    # default; start/check preview
.pi/skills/preview/scripts/preview.sh status   # health check and URLs
.pi/skills/preview/scripts/preview.sh logs     # tail recent logs
.pi/skills/preview/scripts/preview.sh logs 120 # tail 120 lines
.pi/skills/preview/scripts/preview.sh restart  # stop tracked PID, then start
.pi/skills/preview/scripts/preview.sh stop     # stop tracked preview PID
```

The script defaults to:

```text
HOST=0.0.0.0
PORT=3000
```

Override if needed:

```bash
PORT=3001 .pi/skills/preview/scripts/preview.sh start
```

## Standard response

After `start` or `status`, report:

```text
Homepage: http://127.0.0.1:3000/
Context Diet: http://127.0.0.1:3000/labs/context-diet
Logs: .asset-cache/preview/next-dev.log
PID: .asset-cache/preview/next-dev.pid
```

If the script detects the legacy PID/log path from earlier manual starts, also mention that it is tracking the existing legacy server rather than starting a duplicate.
