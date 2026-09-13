# Editorial Readability Review Brief for Claude Opus

## Context & Objectives
You are reviewing the technical blog post for Gaia Research:
- File: `content/blog/context-compaction-phase-2/post.md`
- Next.js Component: `app/blog/context-compaction-phase-2/page.tsx`
- Target URL: `http://localhost:3000/blog/context-compaction-phase-2`

## Target Audience & Register
This blog post is intended for **practicing software developers, AI engineers, and tech leads** running AI coding agents (Claude Code, Pi, Codex, Cursor).
The formal academic methodology, mathematical proofs, and exhaustive telemetry tables belong in the formal research lane (`http://localhost:3000/research`), NOT cluttering the casual reading experience of the blog post.

## Core Directives
1. **Answer "What's In It For Me?":**
   - The reader needs immediate, actionable clarity: What should I set my autocompact threshold to tomorrow morning? How much money or wasted turns will I save? Why does compacting at 50k hurt my workflow?
   - Make the "takeaway / rules of thumb" punchy, intuitive, and prominently highlighted early and in the conclusion.

2. **Fix Rendering Mistakes:**
   - Eliminate awkward HTML entities like `&#36;` (e.g. `&#36;2.48 vs. &#36;1.60`).
   - Ensure currencies render as clean, natural `$2.48` and `$1.60`. In Next.js markdown, KaTeX math blocks only trigger on math symbols like `$T = ...$` or `$$...$$`. If currency symbols need protection from KaTeX math parsers, ensure they render cleanly without showing literal `&#36;` or escaped backslashes in the rendered browser view.

3. **Readability & Flow:**
   - Keep the voice in Nova's register: curious, rigorous, high-signal, zero fluff.
   - Clear contrast in comparisons and scannable subheadings.
   - Offload heavy mathematical proofs and formal taxonomy to the `/research` lane with clear callout links.

4. **Deliverables:**
   - Edit `content/blog/context-compaction-phase-2/post.md` (and `app/blog/context-compaction-phase-2/page.tsx` if necessary) with your improvements.
   - When finished, summarize what you improved and report.
