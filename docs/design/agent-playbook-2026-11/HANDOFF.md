# Handoff: homepage "Field manual" feature + Agent Playbook page

Prepared 2026-11-07. PR: [#322](https://github.com/gaia-research/gaia-research/pull/322) (draft). Scope: issues #319 (front-page design and discovery) and the
dedicated-page part of #318. Feature branch and preview evidence only. Nothing was
merged or deployed. No blog, marketing, social or `/auto` work was done. #321
(Orchestration Guide content) was left alone: the guide page is unchanged.

## What shipped on this branch

| Surface | Files |
| --- | --- |
| Homepage feature `#field-manual` (between Skill Heaven and "Skills you can install today") | `components/FieldManual.tsx`, `components/field-manual.css`, one import and one line in `app/page.tsx` |
| Dedicated page `/research/agent-playbook` | `app/research/agent-playbook/page.tsx`, `app/research/agent-playbook/playbook.css` |
| Copyable multi-line prompt (prose, no `$` prefix) | `components/CopyPrompt.tsx` |
| Discovery | `data/research.ts` gains one entry. That entry also shows on `/research` and as a row in the homepage ledger. `app/sitemap.ts` gains one URL. |
| Evidence | `docs/design/agent-playbook-2026-11/screens/*.jpg`, this report |

There are no new dependencies, runtime packages, analytics or shared abstractions.
Both stylesheets are scoped by prefix (`fm-`, `apb-`) and reuse the global tokens.

## Design rationale

**Information hierarchy.** Today the homepage runs: hero, blog, labs, Skill Heaven
("stop installing, start summoning"), installable skills, ledger, registry,
directives. The new feature sits between Skill Heaven and the skills grid. There it
works as the hinge between *philosophy* (Skill Heaven) and *install* (the grid), and
the read-versus-install distinction is the reason it exists. Placing it above the
blog would have pushed the lab's identity down. Merging it into the skills grid
would have made the playbook look like one more `npx skills` card, which it is not:
it has no one-line installer.

**Concept: a two-page "field manual" spread.** The page on the left is *01 Understand*:
the Orchestration Guide, its central question, and a miniature of its real A–E
ladder with A marked as the default. The page on the right is *02 Preserve*: the
Agent Playbook, its actual file layout, and two clearly separate adoption doors. A
closing line ties them together: "The guide teaches the decision. The playbook
remembers yours." I chose a tandem layout over a merged module because the two are
different kinds of object: a page you read versus a repository you adopt. Facing
pages keep them equal while showing that difference.

**New visual identity, same site.** The feature introduces an emerald "field ink"
register (`#34d399`, already the site's "systems nominal" green), Syne 800 in
sentence case for headings (the brand font, little used until now) and faint ruled
page lines. It deliberately differs from the Bebas uppercase used in every other
section, Skill Heaven's pink and blue, and the registry handoff's amber serif. The
grid background, mono kickers, hairline borders and button motion are unchanged, so
it still reads as Gaia Research. There is no decorative animation.

**Reading versus installing has its own visual code everywhere.** Emerald plus ◇
means *read, nothing installed*. Amber plus ◆ means *install, needs your consent*.
The code is the same on the homepage path cards, the page's hero buttons, the
path-A and path-B sections, step numbers, prompt frames and callout notes. Each
door also says it in words ("No install" / "Needs your consent"), so the meaning
never depends on colour alone.

**The dedicated page** is ordered by the questions a visitor asks:

1. Hero: the promise, and a clickable repository map in which each file is labelled
   with its layer.
2. *Why it exists*: four questions a fresh session otherwise has to ask again, each
   paired with what the playbook says and its source section. Then the real
   four-line delivery receipt, and a "not a prompt template" comparison table.
3. *Three layers, adopted separately*: memory and context, optional skills, personal
   configuration.
4. *Path A, Read as memory*: steps, raw-file fallback links, and a copyable chat
   prompt. The prompt asks for proposed entries, withholds the personal profile until
   the visitor opts in, and saves nothing without approval.
5. *Path B, Install optional skills*: an inspect, consent, copy, verify sequence, the
   documented discovery-location table, and a copyable coding-agent prompt. No
   executable install command is shown, because the repository has no installer
   (verified below).
6. *Personal profile*: a plain-English reading of Marco's real roster, a verbatim
   YAML excerpt, a `runtime_verified: false` caveat, and the template's actual
   fields with "make it yours" steps.
7. *What it does not do*: no memory sync, no installer, no runtime, no performance
   claim, no universal model ranking.
8. Pairing back to the Orchestration Guide, and a source line pinned to the
   agent-playbook revision.

The homepage and the page tell one story without repeating each other. The
homepage gives the one-line version of each door; the page holds the procedure.

## Source fidelity: claims checked against agent-playbook @ `9346fc1` (main)

| Page claim | Source |
| --- | --- |
| Two skills, `orchestrate` and `prompting`; handoff and review are conventions | README.md, HANDOFF.md |
| No installation needed to read; reading does not save memory | README.md "Read conversationally" |
| Propose entries, separate defaults from profile, ask before adopting Marco's profile, keep availability, prices and credentials out, never claim persistence | MEMORY.md steps 2–6 |
| A memory request grants no install, exec or deploy permission | MEMORY.md (final paragraph) |
| Preview, merge and deploy are distinct; no silent fallback; bounded concurrency; four-line receipt | PLAYBOOK.md, skills/orchestrate |
| Inspect, show plan, consent, copy intact, verify, roll back only own files; no hooks, deps or extensions | README.md, profiles/marco/harnesses.md |
| Discovery-location table, "checked 2026-11-08", no live install tested | profiles/marco/harnesses.md, HANDOFF.md |
| Four subagents, MAX-then-HIGH planners, fail closed, no implicit credential changes, reviewer preferences, workers not assumed to be reviewers | profiles/marco/PROFILE.md, roster.yaml |
| `runtime_verified: false` | profiles/marco/models.yaml |
| Template fields | profiles/template/PROFILE.md |
| "Never install integrations or widen merge/deployment authority merely to finish a task" | skills/orchestrate/SKILL.md |

The page deliberately leaves out a few things. It names no concrete model IDs and
makes no model-quality ranking. The profile section describes model *roles*, not the
private aliases. It mentions no Pi-specific dispatch syntax. It makes no performance
claim, and the limits section says outright that the playbook has not been
benchmarked.

## Validation evidence

All checks ran locally against `next build` + `next start`. The "before" captures
came from an `origin/main` worktree.

| Check | Result |
| --- | --- |
| `npm run lint` (tsc + fs-usage guard) | PASS |
| `npm test` (vitest) | PASS: 30 files, 299 tests |
| `npm run build:next` | PASS; `/research/agent-playbook` is statically prerendered (○) |
| `npx tsx scripts/lexicon/check-lexicon.ts` | PASS: 0 new findings |
| `git diff --check` | PASS |
| `scripts/visual-audit.mjs`, PAGES `/,/research,/research/agent-playbook,/research/orchestration-guide,/blog`, widths 320/360/390/414/768/1280 | PASS: 30 checks, 0 cut-off, 0 HTTP or console errors. Earlier runs caught grid-item `min-width` and wide Syne headline overflow at ≤414px; both are fixed. Baseline on `main` was also 0. |
| Keyboard | Tabbing reaches all 5 feature links on the homepage and 51 focusable elements on the page; each shows a 3px solid focus outline (`screens/home-focus-read-as-memory.jpg`). The prompt `<pre>` blocks are focusable for scrolling and selection. |
| Copy button | Clicked in Chromium; the clipboard held the exact prompt and the button showed "Copied ✓". A polite live region announces it. |
| Links | Every `href` on both rendered pages was resolved: internal routes return 200, in-page anchors exist, and every `github.com/gaia-research/agent-playbook` and raw URL returns 200 (the repo is public). Harness doc URLs return 200. |
| Accessibility semantics | Landmarks and labelled sections, `h1` → `h2` → `h3` order, table captions and scoped headers, "(opens in a new tab)" for external links, decorative glyphs `aria-hidden`, meaning never carried by colour alone, `prefers-reduced-motion` removes hover motion. |

### Screenshots (committed in `screens/`)

- `home-desktop-field-manual.jpg`: the homepage feature at 1440px
- `home-mobile-field-manual.jpg`: the homepage feature at 390px (2×)
- `home-focus-read-as-memory.jpg`: keyboard focus on the "Read as memory" door
- `before-home-desktop-skill-heaven-to-skills.jpg`: the section the feature now follows, on `main`
- `playbook-desktop-fold.jpg`, `playbook-desktop-full.jpg`: the page at 1440px
- `playbook-mobile-fold.jpg` (2×), `playbook-mobile-full.jpg`: the page at 390px
- `research-index-desktop.jpg`: the new entry on `/research`

## Preview

No preview deployment exists. This repository has no preview-deploy workflow (only
`website-ci`, which builds and runs a browser audit without publishing), and the
brief forbids production deployment. Reviewers can run it locally:
`npm ci && npm run build:next && npm run start -- -p 3010`, then open `/` and
`/research/agent-playbook`. The committed screenshots are the visual evidence.

## Known limitations and remaining work

- **Commit authorship.** The first commit on this branch was made under the cloud
  container's default git identity, before the repo-local `mbtiongson1` identity was
  set. Rewriting it needs a force-push, which was blocked in this session. Later
  commits use the correct identity.

- **Human design review is still required.** This is a frontend change, so the
  operator must look at it before merge. #319 stays open until that review accepts it.
- The site-wide Milim pet (a fixed overlay) floats over part of whatever is in view,
  including the new sections in some screenshots. That is existing behaviour and
  was not changed.
- The page restates parts of the playbook. If the repository changes materially
  (new skills, a renamed file or a different install guidance), the copy needs a
  re-check. The source revision is pinned in the page footer for that reason.
- The harness table is documentation-derived; the repository records no live
  installation test. The page says so.
- The homepage ledger now has an "Agent Playbook · PLAYBOOK · WIP" row, because the
  ledger derives from `researchEntries`. Remove the entry if the operator wants
  `/research` only.
- Still open on #318: the technical blog post (canonical `gaia-blog-post` skill) and
  the marketing campaign via `marketing-tasks`. Neither was started.
- The nav and footer are unchanged; discovery is through the homepage feature,
  `/research` and the sitemap. Adding a top-level nav item was out of scope.
