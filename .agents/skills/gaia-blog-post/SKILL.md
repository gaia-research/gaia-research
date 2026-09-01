---
name: gaia-blog-post
description: End-to-end playbook for authoring and shipping a Gaia Research blog post (/blog/*). Covers the idea-bank entry, research-first source ledger, the six-file wiring set, the Milim thumbnail pipeline, three adversarial reviewer passes, the real CI gates, and the branch/commit/PR conventions this repo actually uses. Use whenever writing, illustrating, wiring, reviewing, or publishing a post under /blog/.
---

# Gaia Blog Post — Authoring & Shipping

Use this skill whenever an agent writes, illustrates, wires, reviews, or ships a
**blog post** for Gaia Research (`/blog/*`).

> **Scope.** `/blog/*` is Nova-authored (occasionally founder-authored) field
> notes, explainers, and editorial posts. Formal empirical papers and
> postmortems live under `/research/*` and are out of scope here.

## Canonical location

**This file — `.agents/skills/gaia-blog-post/SKILL.md` — is the skill.**

A second tracked copy exists at `.pi/skills/gaia-blog-post/`. It is a **pointer
only**. It has silently diverged before: on 2026-08-22 a blog PR re-committed a
stale pre-research-first copy there, so any agent that loaded `.pi/` got the
playbook from before the source-ledger fix.

Two rules, and they are enforced by nothing but you reading them:

- **Never edit `.pi/skills/gaia-blog-post/`.** Edit this file.
- **When you change this file, confirm `.pi/` is still a pointer** and has not
  been re-forked:

  ```bash
  head -5 .pi/skills/gaia-blog-post/SKILL.md
  ```

  If it contains playbook content instead of the pointer stub, it has drifted
  again — restore the stub and say so in the PR body.

---

## The shape of the work

A post is six always-touched files plus a thumbnail. Everything else is
conditional. This is measured from the last twelve blog PRs, not aspirational:

| # | File | Frequency |
|---|---|---|
| 1 | `content/blog/<slug>/post.md` | always |
| 2 | `app/blog/<slug>/page.tsx` | always |
| 3 | `data/blog.ts` (import + export + array entry) | always |
| 4 | `assets/generated/<asset>-editorial-thumbnail.webp` | always |
| 5 | `public/assets/<asset>-editorial-thumbnail.webp` | always |
| 6 | `content/assets/asset-ledger.json` | always |
| — | `app/globals.css` (figure styles) | ~60% |
| — | `content/blog/<slug>/THUMBNAIL.md` | conditional |
| — | `docs/idea-bank/blog-idea-<topic>.md` + README row | if the idea was ranked |
| — | `app/sitemap.ts` | see the honest note below |
| — | `next.config.mjs` redirect | only for a vanity slug |

**There is no dynamic `app/blog/[slug]/page.tsx`.** Every post is its own
hand-written route. Roughly 80% of that file is boilerplate; budget for it.

**The blog index needs nothing.** `app/blog/page.tsx` renders `<BlogArchive />`,
which reads `blogPosts` from `data/blog.ts` and sorts/filters automatically. Add
the registry entry and the post appears. Never hand-edit the index.

### Honest note on the sitemap

The checklist in the previous version of this skill demanded a sitemap entry.
In practice **4 of 11 routed posts are in `app/sitemap.ts`**. The step is real,
it is manual, and it is the single most-skipped item in the whole pipeline —
precisely because a checkbox that an agent ticks by assertion is not a gate.
Nothing fails when you forget it. Add the entry deliberately, or decide out loud
in the PR body that you are not adding one. Do not tick it without opening the file.

---

## Phase 0 — Orient

Do this before anything else. This repo moves fast across many small PRs and a
stale local `main` is the most common cause of "the infrastructure is missing."

```bash
git fetch origin main && git merge --ff-only origin/main
```

If the post came from a ranked idea, it needs its idea-bank trail:
`docs/idea-bank/blog-idea-<topic>.md` plus a row in `docs/idea-bank/README.md`.
Check whether one already exists before writing a new one.

Branch off fresh `main`:

```bash
git checkout -b blog/<slug>
```

**Branch naming, as actually used:** `blog/<slug>` is the default and the
majority. `feat/blog-<slug>` when the PR also touches site infrastructure.
`fix/blog-<issue>` for repairs to a shipped post. Real examples:
`blog/context-ablation`, `blog/rumination-index`,
`blog/nvidia-evaluator-vs-microsoft-skillopt`, `feat/blog-yggdrasil-ii`.

---

## Phase 1 — Research first

**Never write content before this phase is complete.** The SkillOpt post was
originally wrong because writing started before the paper was read, and it
described MeZO's mechanism as SkillOpt's. They are different papers.

### 1.1 Source acquisition

For any post about a named technique, tool, paper, or product:

1. **Search for the primary source.** Find the real paper (arXiv ID), GitHub
   repo, or official docs. Do not write from training memory — search now.
2. **Verify authorship and affiliation.** Who made this, which institution,
   what year.
3. **Read the abstract *and the methods section*.** What the method does
   mechanically, not what the title implies.
4. **Copy the real benchmark numbers.** What tasks, what baselines, what exact
   figures. Do not invent them or round them from memory.
5. **Prefer an official or co-author video.** Search
   `"[topic] [authors] site:youtube.com"` and `"[paper title] presentation"`.
   A co-author talk always beats an explainer channel.
6. **Verify every YouTube ID via oEmbed before embedding:**

   ```bash
   curl -s "https://www.youtube.com/oembed?url=https://youtu.be/<ID>&format=json"
   ```

   A 404 or a wrong title means it does not go in the post.

### 1.2 Source ledger

Fill this before writing a word. Paste it into the PR body later — it is the
evidence that Phase 1 happened.

```
Primary source: [title · authors · institution · year · arXiv/DOI URL]
GitHub:         [URL or "none found"]
Official video: [YouTube ID · title · oEmbed-verified — or "none found"]
Real numbers:   [task names and exact figures copied from the source]
Mechanism:      [2-3 sentences from the methods section, not the abstract]
Fabrication risks: [what this post might be tempted to invent]
```

Do not proceed until every line is filled with verified information.

---

## Phase 2 — Write `post.md`

### 2.1 The invisible line contract

`page.tsx` renders the title and byline from its own header, then strips them
from the markdown with:

```ts
postMd.split("\n").slice(4).join("\n").trim()
```

So **the first four lines of `post.md` are load-bearing and must be exactly**:

```markdown
# [Title of the Post]
                                  ← line 2 blank
*[Month DD, YYYY] · Field Note by Nova — Head Researcher, Gaia Research*
                                  ← line 4 blank
---

[body starts here]
```

Get this wrong and the page renders a duplicated title or eats the first
paragraph — silently, with no build error. Nothing checks it. Count the lines.

**Byline, as actually used** (8 of 12 posts): the form above. Authors are defined
in `content/authors/` — currently `nova.json` and `marcus.json`. A founder-authored
post uses `*[Date] · Field Note by Marcus Tiongson — Founder, Gaia Research*`.
Three older posts use other shapes (`**By Nova — …**`, bare `*Date · Nova*`);
those are frozen, not precedent. Use the canonical form.

### 2.2 Anti-slop directives

- ❌ **No fabricated specificity.** Never invent file paths, config keys, CLI
  flags, YAML schemas, or metrics that do not exist in the source. If the paper
  describes a concept, say it describes a concept — do not invent an
  implementation to make it feel concrete.
- ❌ **No unratified roadmap claims.** Check `founder/RATIFICATION.md`. Anything
  not LOCKED there must be explicitly hedged.
- ❌ **No cookie-cutter headers.** No "Executive Summary", "Signals",
  "Bad vs Good", "Next Steps". Write topic-specific titles.
- ❌ **No hype.** Ban "game-changing", "paradigm shift", "seamless",
  "unlocking the future".
- ❌ **No misattributed techniques.** If the post cites Technique X as the
  method, verify X is what the source actually uses — not an ancestor or
  inspiration.
- ✅ **One topic, in depth.** No bundles of unrelated news.
- ✅ **Real numbers only**, from the ledger. Anything illustrative is labelled
  illustrative *in the figure itself*.
- ✅ **Show, don't tell.** An oEmbed-verified official video, a real terminal
  trace, or a linked paper section. Never a tangentially related video as filler.
- ✅ **SVG figures over walls of text**, using real numbers.

### 2.3 Structure

- **A hook that earns ten more seconds** — one observation the reader has
  personally hit. Not a summary of the post.
- **The mechanism, plainly** — step by step, every jargon term anchored in one
  line of English before it is used alone.
- **At least one before/after contrast** — the most-read part of any post. The
  "bad" example must be recognisably bad, not merely longer.
- **Real numbers, cited to task and baseline.**
- **One actionable close** — something to do differently tomorrow.
- **A source block** — authors, title, institution, year, arXiv/DOI, GitHub.

---

## Phase 3 — Figures

Figures are inlined directly in `page.tsx` as `[[TOKEN]]` handlers in the
`Markdown` `components.p` override, not as separate component files. The post
body contains a bare `[[TOKEN]]` paragraph; the page swaps in the SVG.

Every inline SVG must carry, because reviewers have caught all four repeatedly:

- `viewBox` plus `style={{ width: "100%", height: "auto" }}` — responsive, or it
  cuts off on a phone
- `role="img"` and `aria-labelledby` pointing at `<title>` and `<desc>`
- labels that do not collide at 320px width
- an **in-figure** provenance line when the chart is not measured data, e.g.
  `Illustrative · not measured data` or `Architecture diagram · not benchmark data`

Math renders through `remarkMath` + `rehypeKatex`, which are wired in **all 11**
existing pages. Keep them even if this post has no math; dropping them is a
silent divergence from every other page.

---

## Phase 4 — Thumbnail

Every post ships a 16:9 Milim editorial thumbnail. **A missing or placeholder
thumbnail is the single most common merge blocker** — it held roughly ten of the
last twelve blog PRs.

Write the spec to `content/blog/<slug>/THUMBNAIL.md` (the current convention;
`thumbnail-prompt.md` is the older handoff format and is frozen), then follow
`.agents/skills/milim-editorial-thumbnail/SKILL.md` — its prompt skeleton,
scale and negative-space rules, and character guardrails are the authority.

**Model: `gpt-image-2` only.** `CLAUDE.md` is the source of truth and it
overrides any alternate-model line in a downstream skill: never `nano-banana`,
`nano-banana-2`, or `omniflash` for a production asset.

> **Known conflict, unresolved.** `scripts/assets/generate-scout-fleet-thumbnail.mjs`
> pins `model: 'gemini-3.1-flash-image' // nano-banana-2` and writes straight to
> `assets/generated/` and `public/assets/` (lines 106–113) — production paths,
> not the workbench. It contradicts the rule above. Do not copy that script as a
> pattern, and do not "fix" it as a side effect of shipping a post; it needs a
> founder ruling of its own.

Pipeline:

1. Generate the candidate into `assets/workbench/generated/` (gitignored).
2. Export **1600×900 WebP, quality 90, fit cover, position attention** to
   **both** `assets/generated/` and `public/assets/`.
3. Sync and validate the ledger:

   ```bash
   npx tsx scripts/assets/sync-asset-ledger.ts
   npx tsx scripts/assets/check-asset-ledger.ts --strict
   ```

**The asset basename does not have to equal the slug**, and sometimes does not:
`parallel-cheap-scouting-frontier` ships
`parallel-cheap-scouting-editorial-thumbnail.webp`. Match the name you actually
wrote to the name you import — do not assume `<slug>-editorial-thumbnail.webp`.

Both copies matter and drift: two thumbnails currently exist in
`assets/generated/` with no `public/assets/` counterpart. `assets/generated/` is
the import path used by `data/blog.ts`; `public/assets/` is the static copy.
Write both.

---

## Phase 5 — Wire it up

Order matters — `data/blog.ts` must export the thumbnail before `page.tsx` can
import it.

**1. `data/blog.ts`** — three edits in one file:

```ts
// a) import, at the top with the others
import <camel>ThumbnailSrc from "@/assets/generated/<asset>-editorial-thumbnail.webp";

// b) exported thumbnail object
export const <camel>Thumbnail = {
  src: <camel>ThumbnailSrc,
  alt: "[describe the scene specifically: setting, Milim's position and emotion, dominant colours]",
} as const;

// c) newest-first entry in the blogPosts array
{
  href: "/blog/<slug>",
  category: "[Category]",
  tags: ["...", "..."],
  date: "[Month DD, YYYY]",
  readTime: "[N min read]",
  title: "[Title: Subtitle]",
  description: "[same string as articleDescription in page.tsx]",
  author: "Nova · Head Researcher, Gaia Research",
  image: <camel>Thumbnail,
}
```

**Naming:** use `<camel>Thumbnail`. Both `<camel>Thumbnail` (7 posts) and
`<camel>EditorialThumbnail` (4 posts) exist in the file; the shorter form is the
majority and is the one to write. Do not rename the existing four.

**2. `app/blog/<slug>/page.tsx`** — copy the skeleton from `./template.md`.

**3. `app/sitemap.ts`** — add the entry, or say in the PR why you did not:

```ts
{ url: `${siteUrl}/blog/<slug>`, lastModified: new Date("YYYY-MM-DD"), changeFrequency: "monthly", priority: 0.7 },
```

**4. `next.config.mjs`** — only if the slug does not match the primary keyword:

```ts
{ source: "/blog/<keyword>", destination: "/blog/<slug>", permanent: true },
```

---

## Phase 6 — Three adversarial passes

All three are required. Each is a distinct role catching a distinct failure mode.
Run them on the finished draft, before the gates.

### Pass 1 — Factual correctness

*A researcher who has read the source and will fact-check every claim.*

- Is every factual statement supported by the Phase 1 ledger?
- Does the mechanism description match the **methods section**?
- Do the numbers match — same task, same baseline, same harness?
- Does any claim go beyond what the source itself claims?
- Is every institution, author, and year correct?

**Output:** claims that pass, and claims that fail *with the correction*.

### Pass 2 — Fabrication detector

*A hostile reader hunting for anything unverifiable.*

For every file path, config key, YAML block, CLI flag, metric, iteration count,
model name, and cost figure: could I find this right now if I searched for it?

Special checks — every one of these has shipped wrong before:

- Any config block: does it exist in the repo, or was it invented to illustrate?
- Any percentage or count: is it in the ledger?
- Any YouTube embed: was the ID oEmbed-verified?
- Any script or CLI path: does the file exist?

**Output:** every fabricated or unverifiable detail, each with a fix — remove,
label illustrative, or replace with the real value.

### Pass 3 — Readability & voice

*A newcomer who knows what a `SKILL.md` is but has never heard of the paper.*

- **Skim test:** headers and bold text alone — is the core message there?
- **First-jargon test:** mark the first sentence where a newcomer loses the
  thread. Is there a plain-English anchor before it?
- **Hook verdict:** does the opening sentence earn the second one, or summarise?
- **Contrast clarity:** is the "bad" example recognisably bad?
- **Closing test:** one thing to do today, or a restatement?
- **Voice check:** any sentence that reads corporate, hedged, or committee-written?

**Output:** specific sentences to revise, with the reason.

---

## Phase 7 — Nova voice

Nova is Gaia Research's AI Head Researcher. Nova does not perform expertise —
Nova shows the thing and trusts the reader to follow.

**Direct without terse.** "The validation gate rejects most proposed edits" —
not "appears to reject many edits in some configurations."

**Curious without breathless.** Interesting things get said once, briefly, then
the post moves on. No exclamation marks. No "fascinating!".

**Peer-to-peer.** The reader is a fellow practitioner who will catch a mistake.
Cite sources, show numbers, skip what they already know.

**Low ego.** If the paper is the interesting thing, the paper leads. Nova's name
is in the byline; it does not belong in the prose.

**Concrete nouns, active verbs.** "The optimizer reads failure batches and
proposes patches" — not "the optimization process involves the leveraging of
failure signal."

### Never

- "delve", "dive deep", "unpack", "explore", "journey", "exciting", "powerful",
  "robust", "seamless", "game-changing", "paradigm shift", "unlock", or
  "leverage" as a verb
- "It's worth noting that…"
- A rhetorical section opener that goes unanswered
- "Time will tell" / "The future is bright"
- A closing disclaimer paragraph hedging everything just said
- Passive voice dodging attribution: "It was found that…" → "Yang et al. found…"
- Opening with the paper's abstract — the post starts at the reader's problem

### Patterns

| Instead of | Write |
|---|---|
| "This paper introduces a novel approach to…" | "SkillOpt treats the skill file as the trainable parameter." |
| "It is interesting to note that the results show…" | "The surprising result: cross-harness transfer works. A skill tuned under Codex transferred to Claude Code at +59.7 points." |
| "In order to better understand this, we must first…" | "The mechanism has five steps. Here they are." |
| "The implications are significant for…" | "One concrete thing to do differently: write the validation assertion before editing, not after." |
| "As we can see from the above table…" | *(let the table speak)* |

---

## Phase 8 — Gates

Run these locally before opening the PR. Every one of them runs in CI anyway;
finding it here costs a minute instead of a round trip.

```bash
npm run lint                                              # tsc --noEmit + edge fs-usage check
npm run build:next                                        # what website-ci actually runs
npx tsx scripts/assets/check-asset-ledger.ts --strict     # thumbnail registered + hashed
npx tsx scripts/lexicon/check-lexicon.ts                  # vocabulary gate
```

Visual cut-off audit — **note the `PAGES` override**, because the default page
list does not include `/blog/*` and will silently audit the wrong pages:

```bash
npx next dev -p 3010 &
BASE_URL=http://localhost:3010 PAGES=/blog,/blog/<slug> LABEL=after node scripts/visual-audit.mjs
```

It exits non-zero on horizontal cut-off or console errors, and names the
offending element — the failure mode plain screenshots hide.

On the **lexicon gate**: the lexicon serves the work, not the reverse. If it
fires on a word you meant in a different sense, that is the gate over-reaching —
fix it with an `except` pattern or a narrower scope in `lexicon.json`, never by
sprinkling `lexicon-allow` markers. If it fires on something genuinely
unsettled, say so in one line in the PR and keep moving. Do not convene a
vocabulary review to ship a blog post.

CI checks that will run on the PR: **Build & Edge Compatibility**, **Cloudflare
Workers Builds**, **Vocabulary gate + self-tests**, **Ledger validate +
claims-provenance**, **Type-check + Vitest**.

---

## Phase 9 — Commit, PR, ship

**Commit authorship.** Only `mbtiongson1 <marco.tngsn@gmail.com>` commits here.
Never append `Co-Authored-By`, `pi-Session`, or any AI-attribution trailer. The
repo-local identity is already set; do not override it.

**Commit subjects, as actually used:**

```
draft(blog): Skills API adoption — installable procedural intelligence
blog: add Evaluator vs. SkillOpt comparative analysis
blog(draft): constrained autonomy — the two dials of sub-agent scope
feat(blog): add Yggdrasil II post — derived, not declared
blog: why a smarter model wanted a shorter prompt (Claude 5 descaffolding)
```

Prefix `draft(blog):` or `blog(draft):` while the thumbnail or figures are still
missing; `blog:` or `feat(blog):` when complete. Headline and subheadline are
separated by an em-dash or a colon.

**PR title** follows the commit subject. **PR body** carries these sections —
this is the observed house shape, not an invention:

- **What** — one to three sentences on the post's claim
- **Files** — each file touched and why
- **Draft status** — an explicit list of what is still missing, if anything
- **Verification** — which gates were run and their result
- **Source ledger** — pasted from Phase 1; this is the citation trail
- **Review dimensions** — the three axes from `CLAUDE.md` § Blog Post Reviews

**Reviewers block on these, ranked by how often they actually did:**

1. Thumbnail missing or placeholder (~10 of 12 PRs)
2. Visual-audit cut-off failure (~6)
3. SVG geometry or label collision at mobile widths (~5)
4. Asset-ledger not synced or not `--strict` clean (~4)
5. Citations unverified in the PR body (~3)
6. `BlogPosting` JSON-LD missing or malformed (~5, implicit)
7. Missing idea-bank entry for a ranked post (~4)

Front-load 1 through 4 and most review rounds disappear.

---

## Phase 10 — Improving this skill

When a post ships and something in this file was wrong, fix it **in the PR that
found it**, the same way `RATIFICATION.md` entries are revised. Two standing rules:

- **Encode what the repo does, not what it should do.** If eleven pages wire
  `rehypeKatex` and this file omits it, this file is the thing that is wrong.
  Where actual practice splits, say the split out loud with the counts and name
  the one to follow — that is what the naming and byline sections above do.
- **Do not add a checkbox that nothing can check.** The sitemap step was a
  ticked box on 11 posts and present in 4. An unenforceable step gets stated as
  a deliberate decision with its real compliance rate, not as a checkbox.

Shipped posts are **frozen**. Their inconsistencies are evidence about what the
pipeline actually does, not defects to go fix.

---

## Templates

`./template.md` carries the `post.md` skeleton, the full `page.tsx` route
skeleton matching what the eleven live pages actually contain, and the
`data/blog.ts` / sitemap / redirect snippets.
