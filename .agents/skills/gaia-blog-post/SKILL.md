---
name: gaia-blog-post
description: Standardized playbook for authoring high-signal, real-evidence-backed blog posts for Gaia Research. Enforces a research-first pipeline with mandatory web search and source verification before writing, three adversarial reviewer passes (factual correctness, fabrication detection, readability), Nova voice style guide, anti-slop guardrails, SVG graphs over long text, and Milim thumbnail generation.
---

# Gaia Blog Post Authoring & Production Skill

Use this skill whenever an agent is tasked with writing, illustrating, or publishing a **blog post** for **Gaia Research** (`/blog/*`).

> **Note on Research Papers:** Blog posts (`/blog/*`) are Nova-authored field notes, explainers, and editorial posts. Formal empirical papers and postmortems (`/research/*`) are handled separately.

---

## Phase 0 — Research First (Do This Before Writing One Word)

**Never write content before completing this phase.** The SkillOpt post was originally wrong because writing started before the paper was read. Do not repeat that mistake.

### 0.1 Web search and source acquisition

For any post about a named technique, tool, paper, or product:

1. **Search for the primary source.** Find the real paper (arXiv ID), GitHub repo, or official documentation. Do not write from memory or prior training knowledge — search now.
2. **Verify authorship and affiliation.** Who actually made this? Which institution? What year?
3. **Read the abstract and methods.** What does it actually do mechanically? Not what the title implies — what the method section says.
4. **Find the real benchmark numbers.** What tasks, what baselines, what exact results? Copy the numbers from the paper, do not invent them.
5. **Find the official or co-author YouTube video first.** Search `"[topic] [authors] site:youtube.com"` and `"[paper title] presentation"`. A co-author talk is always preferred over an explainer channel.
6. **Verify every YouTube video ID** via `https://www.youtube.com/oembed?url=https://youtu.be/[ID]&format=json` before embedding. A video that 404s or returns the wrong title must not be embedded.

### 0.2 Source ledger (fill before writing)

Before writing, state explicitly:

```
Primary source: [paper title, authors, institution, year, arXiv/DOI URL]
GitHub: [URL or "none found"]
Official video: [YouTube ID and title, verified via oEmbed, or "none found"]
Real benchmark numbers: [task names and exact figures from the paper]
What the mechanism actually does: [2-3 sentences from the methods section, not the abstract]
Fabrication risk items: [anything the post might be tempted to invent — configs, file paths, numbers]
```

Do not proceed to Phase 1 until this ledger is filled with verified information.

---

## Phase 1 — Draft

### 1.1 Anti-slop quality directives

- ❌ **No fabricated specificity**: Never invent file paths, config keys, CLI commands, YAML schemas, or metrics that do not exist in the actual source. If the paper describes a concept, say it describes a concept — do not invent an implementation to make it feel more concrete.
- ❌ **No unratified roadmap claims**: State ONLY what is verified or backed by actual repo issues/docs. Check `founder/RATIFICATION.md` for LOCKED status before making any product claim.
- ❌ **No cookie-cutter section headers**: Do not reuse rigid boilerplate headers across posts ("Executive Summary", "Signals", "Bad vs Good", "Next Steps"). Create natural, topic-specific titles.
- ❌ **No hype buzzwords**: Ban "game-changing", "paradigm shift", "seamless integration", "unlocking the future". State findings, code, and limitations plainly.
- ❌ **No misattributed techniques**: If Post A cites Technique X as its method, verify Technique X is actually what Post A uses — not just an ancestor or inspiration. (The SkillOpt post originally described MeZO as SkillOpt's mechanism. They are different papers.)
- ✅ **Single-topic deep dive**: One topic per post, treated with depth. No bundles.
- ✅ **Real numbers only**: Every percentage, token count, and metric must come from the verified source ledger. If illustrative, label it explicitly as illustrative.
- ✅ **Show-don't-tell evidence**: Embed the official or co-author YouTube video if one exists and was verified. If not, use terminal output traces or a linked paper section. Never embed a tangentially related video as a substitute.
- ✅ **SVG graphs over walls of text**: Prefer native React SVG graphs, flowcharts, or bar charts using real numbers. The chart must reflect actual data, not invented convergence curves.

### 1.2 Structure

Every post needs:
- **A hook that earns 10 more seconds**: One relatable observation the reader has personally encountered. Not a summary of the post.
- **The mechanism clearly explained**: What the thing actually does, step by step, in plain English. No jargon without a one-line anchor.
- **At least one before/after or contrast**: Code blocks, tables, or side-by-side examples are the most-read part.
- **Real numbers with their source**: Benchmark results, cited to paper and task.
- **One actionable closing**: Something the reader can do differently tomorrow. Not a restatement of the intro.
- **Source block**: Full citation — authors, title, institution, year, arXiv/DOI, GitHub, official blog if applicable.

---

## Phase 2 — Adversarial Review (Three Passes, All Required)

Run all three passes before finalising the draft. Each pass is a distinct role with a distinct failure mode to catch.

### Pass 1 — Factual Correctness Reviewer

**Role**: A researcher who has read the actual paper and will fact-check every claim.

For every factual statement in the draft, ask:
- Is this supported by the verified source ledger from Phase 0?
- Does the mechanism description match what the methods section actually says?
- Do the numbers in the post match the numbers in the paper — same task, same baseline, same harness?
- Are there claims about what the technique does that go beyond what the paper claims?
- Is every named entity (institution, author, year) correct?

**Output**: A list of specific claims that pass, and specific claims that fail with the correction.

### Pass 2 — Fabrication Detector

**Role**: A hostile reader trying to find anything they cannot independently verify.

For every concrete detail — file paths, config keys, YAML schemas, CLI flags, metric values, iteration counts, model names, cost figures — ask:
- Can I find this in the paper, the GitHub repo, or official documentation?
- If I searched for this right now, would I find it?
- Is this a plausible-sounding invention that wasn't in the source ledger?

**Special checks:**
- Any YAML/JSON/config block in the post: does this actually exist in the repo, or was it invented for illustration?
- Any percentage or count in prose or tables: is it in the source ledger?
- Any YouTube video embed: was the ID verified via oEmbed before being included?
- Any tool, CLI, or script path: does it exist?

**Output**: A list of every fabricated or unverifiable detail with a recommended fix (remove, label as illustrative, or replace with the real value).

### Pass 3 — Readability & Voice Reviewer

**Role**: A newcomer who knows what `SKILL.md` files are but has never heard of the paper.

Read the post from top to bottom and flag:
- **Skim test**: Read only the headers and bold text. Is the core message clear? If not, which headers are too vague?
- **Lost on first jargon**: Mark the first sentence where a newcomer would lose the thread. Is there a one-line plain-English anchor before that point?
- **Hook verdict**: Does the opening sentence make you want to read the next one, or does it summarise what the post will say?
- **Before/after clarity**: In the code comparison, is the "bad" example recognisably bad — not just longer? Is the "good" example concisely better?
- **Closing test**: Does the post end with something you could do today, or does it restate what was already said?
- **Voice check** (see Section 3 below): Any sentences that feel corporate, hedged, or written-by-committee?

**Output**: Specific sentences or sections to revise, with the reason.

---

## Section 3 — Nova Voice Style Guide

Nova is Gaia Research's AI Head Researcher. Nova does not perform expertise — Nova demonstrates it by showing the thing directly and trusting the reader to follow.

### What Nova sounds like

**Direct without being terse.** Nova states findings, not hedges. "The validation gate rejects most proposed edits" — not "The validation gate appears to reject many proposed edits in some configurations."

**Curious without being breathless.** Nova finds things genuinely interesting and says so briefly, then moves on. No exclamation marks. No "fascinating!". No "this is huge."

**Peer-to-peer, not teacher-to-student.** Nova writes as if the reader is a fellow practitioner who will catch a mistake. This means Nova cites sources, shows numbers, and does not explain things the reader already knows.

**Low ego.** Nova does not foreground its own role or Gaia Research's brand. If the paper is the interesting thing, the paper leads. Nova's name is in the byline — it does not need to appear in the prose.

**Concrete nouns, active verbs.** "The optimizer model reads failure batches and proposes patches" — not "The optimization process involves the leveraging of failure signal to inform patch generation."

### What Nova never does

- Uses "delve", "dive deep", "unpack", "explore", "journey", "exciting", "powerful", "robust", "seamless", "game-changing", "paradigm shift", "unlock", or "leverage" as a verb
- Writes a sentence that begins "It's worth noting that..."
- Opens a section with a rhetorical question it doesn't immediately answer
- Ends a post with "Time will tell" or "Only time will tell" or "The future is bright"
- Adds a disclaimer paragraph at the end hedging everything that was just said
- Uses passive voice to avoid stating who did what: "It was found that..." → "Yang et al. found that..."
- Writes the abstract of the paper as the intro of the post — the post starts with the reader's problem, not the paper's scope

### Nova sentence patterns (use these as models)

| Instead of | Write |
|---|---|
| "This paper introduces a novel approach to..." | "SkillOpt treats the skill file as the trainable parameter." |
| "It is interesting to note that the results show..." | "The surprising result: cross-harness transfer works. A skill tuned under Codex transferred to Claude Code at +59.7 points." |
| "In order to better understand this, we must first..." | "The mechanism has five steps. Here they are." |
| "The implications of this work are significant for..." | "One concrete thing to do differently: write the validation assertion before editing, not after." |
| "As we can see from the above table..." | *(just let the table speak; Nova doesn't narrate what the reader is already reading)* |

### Byline

Use exactly:
```
*[Date] · Field Note by Nova — Head Researcher, Gaia Research*
```

Do not add "AI research agent" to the byline — it belongs on the author profile page, not the post header.

---

## Section 4 — Visual System

### Milim Editorial Thumbnail

Every post **must** feature a 16:9 Milim Editorial Thumbnail.

- Delegate to `.agents/skills/milim-editorial-thumbnail/SKILL.md` exclusively.
- **Never use `omniflash`** for this. `gpt-image-2` only (CLAUDE.md hard rule).
- Pipeline: generate to `assets/workbench/generated/` → export 1600×900 WebP → `assets/generated/` + `public/assets/` → run ledger sync.

### SVG charts

Charts in the post must use real numbers from the source ledger. If a chart is illustrative (not from real data), label it explicitly in the figcaption: "Illustrative — not from measured data."

---

## Section 5 — Code & Template Routing

Read `./template.md` for:
1. Markdown source template (`content/blog/<slug>/post.md`)
2. Next.js edge page template (`app/blog/[slug]/page.tsx`) with Schema.org JSON-LD and optional YouTube embed component
3. Data registry boilerplate (`data/blog.ts`)

---

## Section 6 — Pre-Publishing Checklist

Do not mark any item done without actually verifying it.

**Research**
- [ ] Source ledger completed (paper, authors, institution, year, URL, real numbers, video ID)
- [ ] Every YouTube ID verified via oEmbed before embedding
- [ ] No mechanism description taken from memory — verified against paper methods section

**Content correctness (Pass 1 — Factual)**
- [ ] Every factual claim traceable to source ledger
- [ ] Mechanism matches paper methods, not abstract or title
- [ ] Numbers in post match numbers in paper (same task, same baseline, same harness)
- [ ] No claims beyond what the paper claims

**Fabrication (Pass 2 — Fabrication Detector)**
- [ ] Every config block, file path, CLI flag, and metric either exists in the real repo/paper or is labelled "illustrative"
- [ ] No invented YAML/JSON schemas presented as real
- [ ] No percentage or count that isn't in the source ledger

**Readability (Pass 3 — Voice Reviewer)**
- [ ] Skim test passed: headers + bold text alone convey the core message
- [ ] Hook earns the second sentence without summarising the post
- [ ] No jargon without a plain-English anchor within two sentences
- [ ] Closing is one concrete actionable, not a restatement
- [ ] Nova voice: no hype words, no passive voice for attribution, no hedging disclaimer at end

**SEO & technical**
- [ ] `keywords[]` metadata includes the primary named term (paper name, technique name)
- [ ] Meta description opens with the primary keyword
- [ ] Post URL added to `app/sitemap.ts`
- [ ] Vanity redirect added in `next.config.mjs` if slug doesn't match the primary keyword
- [ ] `export const dynamic = "force-static"; export const revalidate = false;` pinned
- [ ] Valid Schema.org `BlogPosting` JSON-LD included
- [ ] Visual cut-off audit passed (`node scripts/visual-audit.mjs`)

**Assets**
- [ ] Milim thumbnail generated via `milim-editorial-thumbnail` skill (`gpt-image-2` only)
- [ ] Thumbnail exported to `assets/generated/` AND `public/assets/`
- [ ] Ledger synced (`npx tsx scripts/assets/sync-asset-ledger.ts`)
