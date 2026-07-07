---
layout: tool
title: Gaia Operator
description: Platform interaction agent (CUA runtime) and task trace processor
---

# Gaia Operator

Gaia Operator is the browser and platform interaction runtime for Gaia Research agents.

It helps agents safely research communities, inspect platform context, draft useful replies, collect evidence, and hand off approval-ready outputs to marketing workflows.

It is not a spam bot.  
It is not an evasion harness.  
It is not the marketing brain.  

It is the interaction layer between agent intent and public platforms.

---

## Operating Model

```
Task from marketing-tasks
  ↓
Gaia Operator
  ↓
Platform policy + guardrail check
  ↓
API / structured interface first
  ↓
Playwright or browser MCP if needed
  ↓
Hermes CUA fallback only when visual/native interaction is required
  ↓
Evidence artifact + recommendation
  ↓
Human approval before posting, messaging, or irreversible interaction
  ↓
Sync results back to marketing-tasks
```

## Features

- **CLI Tooling**: Load, validate, run, and replay tasks.
- **Safety Policy Engine**: Enforces risk ceilings (L0-L5) and halts execution on CAPTCHA/login walls.
- **Adaptive Execution**: API-first searches with seamless fallback to automated browser browsing when needed.
- **Nova Voice Drafting**: Generates helpful, low-ego, non-promotional responses to community issues.
- **Complete Evidence Logs**: Emits trace steps, jsonl findings, csv opportunities, draft markdowns, and screenshots.

---

## Installation

Ensure you have Node.js (>= 18) and `pnpm` installed.

```bash
# Clone the repository
git clone https://github.com/gaia-research/gaia-operator.git
cd gaia-operator

# Install dependencies
pnpm install
```

---

## CLI Usage

Run environmental diagnostics:
```bash
pnpm operator doctor
```

Validate task file schema:
```bash
pnpm operator validate-task templates/task.reddit-research.yaml
```

Run task:
```bash
pnpm operator run-task templates/task.reddit-research.yaml
```

Replay trace step-by-step:
```bash
pnpm operator replay-trace .gaia-operator/artifacts/mt-2026-07-reddit-browser-agents-001/trace.json
```

Export report markdown:
```bash
pnpm operator export-report .gaia-operator/artifacts/mt-2026-07-reddit-browser-agents-001/ extracted_report.md
```

List registered harnesses & platforms:
```bash
pnpm operator list-harnesses
pnpm operator list-platforms
```

---

## Hermes + Marketing Tasks Workflow

Gaia Operator can be driven by Hermes Agent as the execution layer for queue entries from `marketing-tasks`.

The intended flow is:
```text
marketing-tasks queue entry
  ↓
Hermes Agent selects the task
  ↓
Gaia Operator validates the queue markdown
  ↓
Gaia Operator derives an OperatorTask JSON
  ↓
Gaia Operator runs the task under policy gates
  ↓
Artifacts are written for review
  ↓
marketing-tasks receives the status/evidence update
```

### Recommended Hermes Loop

From a workspace containing both repositories:

```text
../marketing-tasks/
../gaia-operator/
```

Run:

```bash
cd ../gaia-operator
pnpm operator doctor
pnpm operator validate-queue-entry ../marketing-tasks/queue/<task>.md
pnpm operator export-derived-task ../marketing-tasks/queue/<task>.md
pnpm operator run-queue-entry ../marketing-tasks/queue/<task>.md
```

Hermes should treat `validate-queue-entry` as the preflight step. If validation fails, do not run the task. Fix the queue entry or report the blocker back to `marketing-tasks`.

### What Hermes May Do

Hermes may:

* Select a queue entry from `marketing-tasks`
* Validate queue markdown
* Derive an `OperatorTask`
* Run research and draft-only tasks
* Inspect generated artifacts
* Summarize findings back to `marketing-tasks`
* Create or update a status note with report links
* Stop and report blocked states

### What Hermes Must Not Do

Hermes must not:

* Auto-post
* Auto-comment
* Auto-DM
* Auto-like or upvote
* Join communities
* Create accounts
* Bypass login, CAPTCHA, 2FA, rate limits, or platform warnings
* Use CUA to sneak around browser or platform restrictions

The MVP rule is:
> **Gaia Operator may observe, extract, draft, and prepare evidence. A human approves public action.**

### Expected Artifacts

A successful run writes artifacts under:

```text
.gaia-operator/artifacts/<task-id>/
```

Expected files may include:

* `<task-id>.derived.json`
* `report.md`
* `findings.jsonl`
* `opportunities.csv`
* `draft-replies.md`
* `trace.json`
* `approval-request.md`
* `blocked-state.md`
* `screenshots/`

Hermes should always inspect:

1. `report.md`
2. `trace.json`
3. `approval-request.md`, if present
4. `blocked-state.md`, if present

### Status Sync Back to Marketing Tasks

After a run, Hermes should update the originating queue entry or create a nearby status note with:

```markdown
## Gaia Operator Result
- Status:
- Task ID:
- Public actions taken: 0
- Approval required:
- Blocked:
- Report:
- Trace:
- Draft replies:
- Recommended next action:
```

Do not paste draft replies into public platforms from automation. Keep them in `marketing-tasks` for human review.

---

## Safety Guidelines (Fail-Closed)

The runtime prioritizes platform compliance and terms of service integrity. Evasion methods (like proxy rotations, fingerprint spoofing, or captcha auto-solving) are strictly disabled. When a roadblock (like CAPTCHA or Login Challenge) is detected, the run finishes immediately and writes a `blocked-state.md` report requiring human intervention.

---

## Termux + Android Mobile Handoff

Gaia Operator supports a mobile handoff flow for Android devices using Termux, Termux:API, and Android intents.

This mode is designed for human-in-the-loop platform interaction. The agent can prepare a reply, copy it to your clipboard, open the target URL, send a notification, and record the result. The human still performs the final public action.

```
Agent prepares the draft
  ↓
Draft is copied to clipboard
  ↓
Target URL opens on Android
  ↓
Human reviews, edits, posts, rejects, or saves
  ↓
Gaia Operator records the result
```

The core rule is simple:
> **Gaia Operator may prepare, route, remind, and document. The human taps publish.**

### What Mobile Handoff Can Do
* Validate a mobile handoff task.
* Generate or load a draft reply.
* Run guardrail checks.
* Create a handoff review card.
* Copy the draft to the Android clipboard.
* Open the target URL in the browser or app.
* Send a Termux/Android notification.
* Optionally open the Android share sheet.
* Record the human outcome after review.

### What Mobile Handoff Will Not Do
* Auto-post.
* Auto-comment.
* Auto-DM.
* Auto-like or upvote.
* Join communities.
* Tap buttons inside Android apps.
* Bypass login, CAPTCHA, 2FA, rate limits, or platform warnings.
* Replace human judgment.

This is not Android CUA. It is a safe handoff layer.

---

### Termux Setup

Install both apps from F-Droid:
1. **Termux**
2. **Termux:API**

*Both apps should come from the same source so Android permissions work correctly.*

Inside Termux:
```bash
pkg update && pkg upgrade -y
pkg install nodejs git jq termux-api -y
```

Clone and install Gaia Operator:
```bash
git clone https://github.com/gaia-research/gaia-operator.git
cd gaia-operator
pnpm install
pnpm build
```

Run the mobile doctor:
```bash
pnpm gaia-mobile doctor
```
or, after linking/installing binaries:
```bash
gaia-mobile doctor
gmh doctor
```

The doctor checks for:
- `termux-clipboard-set`
- `termux-clipboard-get`
- `termux-notification`
- `termux-open-url`
- `termux-share`
- `termux-info`
- `am`

---

### Mobile Handoff Task Example

Create a task file such as `tasks/reddit-reply.yaml`:
```yaml
id: mh-2026-07-reddit-001
type: mobile_handoff
platform: reddit
mode: prepare_for_manual_reply
risk_ceiling: L3
target:
  url: "https://www.reddit.com/r/example/comments/123456/how_to_avoid_browser_blocking"
  community: "r/example"
  context_summary: "Developer is asking about browser agent blocking."
voice:
  persona_ref: "personas/nova.md"
  soul_ref: "Soul.md"
guardrails:
  source: "marketing-tasks"
  refs:
    - "guardrails/community-interaction.md"
    - "guardrails/no-spam.md"
    - "guardrails/nova-voice.md"
draft:
  mode: generate
  instruction: "Write a concise, helpful reply. No hard sell. Link only if genuinely useful."
constraints:
  auto_post: false
  auto_dm: false
  require_manual_publish: true
  copy_to_clipboard: true
  open_url: true
  notify_user: true
  share_payload: false
outputs:
  - handoff_card
  - draft_text
  - trace
  - result_capture
```

The maximum allowed mobile handoff risk is **L3**. Public-write levels such as **L4** and **L5** are rejected.

---

### Common Commands

Validate a task:
```bash
pnpm gaia-mobile validate tasks/reddit-reply.yaml
```

Prepare the handoff artifacts:
```bash
pnpm gaia-mobile prepare tasks/reddit-reply.yaml
```

Execute the handoff:
```bash
pnpm gaia-mobile handoff tasks/reddit-reply.yaml
```
This will:
- Copy the draft to clipboard
- Open the target URL
- Send a notification
- Write trace/result artifacts

Record the human outcome:
```bash
pnpm gaia-mobile result mh-2026-07-reddit-001 --status posted --notes "Edited intro before posting"
```

Shortcut commands:
```bash
pnpm gmh posted mh-2026-07-reddit-001 --notes "Posted after edits"
pnpm gmh rejected mh-2026-07-reddit-001 --notes "Community rules did not allow this"
pnpm gmh saved mh-2026-07-reddit-001 --notes "Saved for later review"
```

Allowed result statuses include:
- `posted`
- `posted_with_edits`
- `rejected`
- `saved_for_later`
- `needs_research`
- `blocked_by_platform`
- `blocked_by_rules`

---

### Artifacts

Mobile handoff writes artifacts to:
- `.gaia-operator/mobile/handoffs/<task-id>/`
- `artifacts/mobile-handoff/<task-id>/`

Typical files:
- `handoff-card.md`
- `blocked-handoff.md`
- `draft.txt`
- `guardrail-check.md`
- `target.json`
- `task.yaml`
- `trace.json`
- `result.json`

Use `handoff-card.md` as the human review card. It contains the target, draft, safety checklist, and result-capture commands.

---

### Safety Notes

Mobile handoff is intentionally conservative.

Before posting anything, the human reviewer should confirm:
* The reply is specific to the thread.
* The reply is useful without a Gaia link.
* The community rules allow this kind of participation.
* The draft does not look templated or promotional.
* There is no login challenge, CAPTCHA, rate-limit warning, or account warning.
* The final text and target URL are correct.

When in doubt, reject or save for later.

*The agent prepares the scroll. The human decides whether it leaves the tower.* 🜁
