# Fast-workers diagram — generation provenance

**Shipped asset:** `assets/generated/fast-workers-diagram.png` → `public/assets/fast-workers-diagram.png`
**Rendered in:** `app/blog/orchestrator-tax-cold-cache/page.tsx` (`FastWorkersDiagram`), at the
`[[FAST_WORKERS_DIAGRAM]]` marker in `content/blog/orchestrator-tax-cold-cache/post.md`.

| Field | Value |
| :--- | :--- |
| Model | `nano-banana-2` |
| Aspect ratio | 3:4 |
| Generated | 2026-09-14 |
| Working file | `assets/workbench/fast-workers-diagram-v3.png` (v1 and v2 superseded) |

## Model-policy note

`gpt-image-2.5` was attempted first for this diagram and the generation call failed
outright (`codex exec failed with code 1` — the image never rendered). The founder
directed a `nano-banana-2` fallback in-session on 2026-09-14.

Under the current `CLAUDE.md` rule (founder ruling, 2026-09-15: prefer `image-gen-2.5`,
fall back to `nano-banana-2` or `gemini-3-pro-image`, never `nano-banana` v1) this is a
**permitted fallback, not an exception** — the unreliable `gpt-image-2.5` path is part of
why that rule was rewritten. It is recorded here because the fallback is permitted, not
invisible: the model actually used belongs in the record.

## Prompt (verbatim, v3 — the one that produced the shipped image)

```text
Dark-mode technical architecture diagram on near-black (#0c1222) background. Clean, flat, developer-facing. No characters, no illustration. Pure technical diagram like an architecture doc.

TITLE at top center: "What Actually Works" in large bold white sans-serif.
Subtitle: "Smart Planners · Fast Workers" in muted slate gray.
Small italic note below: "fast = worker wall-clock latency, not the planner" in muted monospace.

TWO-COLUMN layout connected by arrows:

LEFT COLUMN — label "ORCHESTRATOR" in Rimuru Blue (#38bdf8) bold monospace caps.
Subtitle in muted text: "smart · multi-context · stays in session"
Below: one tall dark rounded card with a subtle blue glow border.
Inside the card, two sections divided by a thin muted line:

Top section header "Heavy / Quality" in muted amber:
Four small model pills in a 2x2 grid: "Opus 5", "Fable 5.1", "Sol", "Astra 6"

Bottom section header "Sweet Spot ★" in green (#10b981):
Two larger highlighted pills side by side: "Sonnet 5" with subtext "cheap input + great orchestration" and "GPT-5.6 Terra" with subtext "strong routing, low cost"

Footer inside card: "~15–20k context · pointer manifests only · no raw diffs"

RIGHT COLUMN — label "FAST WORKERS" in amber (#fbbf24) bold monospace caps.
Subtitle in green monospace: "< 4 min wall-clock"
Four stacked dark pill cards, each with a lightning bolt ⚡ icon:
Card 1: "Gemini 3.8 Flash" — "sub-2 min"
Card 2: "DeepSeek V4.1 Flash" — "fast + cheap cache"
Card 3: "Opus 5 /fast" — "quality, low latency route"
Card 4: "Sol /ultrafast" — "heavy but snappy"

Below cards: small red crossed-out pill: "✗ Luna — cheap but slow, wrong lane"

ARROWS between columns:
Left to Right: thin arrow labeled "dispatch bounded tasks →"
Right to Left (curved at bottom): thin arrow labeled "← JSON receipt · cache hit · $0.050/turn"

BOTTOM STRIP — dark card two rows:
Red row: "✗ Cold  > 5 min  →  $0.625/turn × 8 = $5.00"
Green row: "✓ Warm  < 5 min  →  $0.050/turn × 8 = $0.40"
Right-aligned badge: "12.5× savings"

Footnote below strip in muted small text: "Compaction also has a tax — a slim-context planner that stays warm often wins."

Visual style: monospace labels, muted slate grid lines in background, obsidian dark palette, clean generous spacing. No gradients, no decorative elements.
```

