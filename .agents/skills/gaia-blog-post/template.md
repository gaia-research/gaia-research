# Gaia Blog Post — Templates

Boilerplate for a Gaia Research blog post (`/blog/*`). **Phase 1 of `SKILL.md`
must be complete before any of this is filled** — the source ledger comes first.

These skeletons are transcribed from the eleven live pages, not idealized. Where
this file and a shipped page disagree, the shipped page wins and this file is the
bug — fix it in the PR that found it.

---

## 1. `content/blog/<slug>/post.md`

**Lines 1–4 are load-bearing.** `page.tsx` strips them with `.slice(4)`. An extra
or missing blank line silently eats the first paragraph or duplicates the title.

````markdown
# [Title of the Post]

*[Month DD, YYYY] · Field Note by Nova — Head Researcher, Gaia Research*

---

> [Hook — one observation the reader has personally hit. Not a summary.
>  Not "In this post, we will explore…". The first sentence earns the second.]

[[YOUTUBE_EMBED]]

---

## [Section title specific to this topic — never "Introduction" or "Background"]

[The mechanism, directly. Numbered steps for processes. Plain English first,
 then the technical term. Every jargon term anchored in one line before it is
 used alone.]

[[SVG_FLOWCHART]]

---

## [Contrast section title — what the reader recognises vs. what changes]

### [Label for the anti-pattern]

```[language]
[anti-pattern code — recognisably bad, not merely longer]
```

### [Label for the better pattern]

```[language]
[better pattern code — concisely better]
```

---

## [Results or evidence section title]

[Real numbers from the ledger, cited to task and baseline. Anything illustrative
 is labelled illustrative inside the figure itself.]

[[BAR_CHART]]

| [Column] | [Column] | [Column] |
| :--- | :--- | :--- |
| [from source] | [from source] | [from source] |

---

## [Closing section title — specific to this topic]

[One concrete thing to do differently today. Not a restatement. Not "Time will
 tell." No hedging disclaimer.]

---

**Source:** [Authors], *[Title]*, [Institution], [Year]. [[arXiv:XXXXXXX](https://arxiv.org/abs/XXXXXXX)] · [[GitHub](URL)]
````

---

## 2. `app/blog/<slug>/page.tsx`

The real skeleton. Note what the previous version of this template got wrong and
what every live page actually does:

- **`remarkMath` + `rehypeKatex` are in 11/11 pages.** Keep them even with no math.
- **`PostShareBar` is in 10/11 pages.** Keep it.
- **Semantic class names, not Tailwind utilities.** Only 2/11 pages use utility
  classes like `text-3xl font-extrabold text-slate-100`; the house style is
  `blog-post-head`, `blog-post-meta`, `blog-post-summary`,
  `blog-post-illustration`, `blog-post-body report-body`, `blog-post-foot`,
  styled in `app/globals.css`.
- **`keywords[]` is in 7/11 pages.** Include it; it is the SEO surface.

```tsx
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { <camel>Thumbnail } from "@/data/blog";
import postMd from "@/content/blog/<slug>/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/<slug>";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${<camel>Thumbnail.src.src}`;
const articleTitle = "[Primary keyword]: [Subtitle]";
// Opens with the primary keyword. One or two sentences. No hedging.
const articleDescription =
  "[Primary keyword] [what it does in one sentence]. [The most interesting result].";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "[primary keyword]",
    "[secondary keyword]",
    "[technique name]",
    "[author or institution if notable]",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "[YYYY-MM-DD]T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{ url: <camel>Thumbnail.src.src, width: 1600, height: 900, alt: <camel>Thumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [<camel>Thumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "[YYYY-MM-DD]T00:00:00+08:00",
  author: {
    "@type": "Person",
    name: novaAuthor.display_name,
    url: novaAuthor.links.github,
  },
  publisher: {
    "@type": "Organization",
    name: "Gaia Research",
    url: siteUrl,
  },
};

function loadPost() {
  // Strip H1 title & byline — the header below renders them.
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function BlogPostPage() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page">
        <PostShareBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }}
        />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="[YYYY-MM-DD]">[Month DD, YYYY]</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            [One sentence — the most interesting thing, stated directly.]
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={<camel>Thumbnail.src.src}
            width={<camel>Thumbnail.src.width}
            height={<camel>Thumbnail.src.height}
            alt={<camel>Thumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children, ...props }) => {
                const childArray = Array.isArray(children) ? children : [children];
                const text =
                  childArray.length === 1 && typeof childArray[0] === "string" ? childArray[0] : null;

                // One branch per [[TOKEN]] used in post.md.
                if (text === "[[SVG_FLOWCHART]]") {
                  return <SvgFlowchart />;
                }
                if (text === "[[YOUTUBE_EMBED]]") {
                  return <YoutubeEmbed />;
                }

                return <p {...props}>{children}</p>;
              },
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot">
          <Link href="/blog">Back to Blog <span aria-hidden="true">→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
```

### 2a. Inline SVG figure

Figures live inside `page.tsx`, not in separate component files. Every figure must provide
**two responsive versions** (desktop wide vs mobile tall):

```tsx
function SvgFlowchart() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      {/* Desktop & Tablet: Wide horizontal layout */}
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 960 480"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-labelledby="flow-desk-title flow-desk-desc"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="flow-desk-title">[Figure Name]</title>
          <desc id="flow-desk-desc">[What the desktop figure shows.]</desc>

          <rect width="960" height="480" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />
          {/* Provenance line */}
          <text x="480" y="460" textAnchor="middle" fill="#64748b" fontSize="11">
            Illustrative · not measured data
          </text>
        </svg>
      </div>

      {/* Mobile: Tall vertical layout (<= 640px) */}
      <div className="blog-svg-mobile">
        <svg
          viewBox="0 0 420 840"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-labelledby="flow-mob-title flow-mob-desc"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="flow-mob-title">[Figure Name - Mobile]</title>
          <desc id="flow-mob-desc">[What the mobile figure shows.]</desc>

          <rect width="420" height="840" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />
          {/* Stacked cards, larger typography, downward connectors */}
          <text x="210" y="820" textAnchor="middle" fill="#64748b" fontSize="11">
            Illustrative · not measured data
          </text>
        </svg>
      </div>
    </figure>
  );
}
```

Check before committing: both desktop and mobile versions are rendered, labels do not collide at 320px, the `viewBox` scales cleanly with `style={{ width: "100%", height: "auto", display: "block" }}`,
`<title>`/`<desc>` are wired to `aria-labelledby`, and any non-measured chart
says so *inside the figure*.

### 2b. YouTube embed

Only after the ID is oEmbed-verified (`SKILL.md` Phase 1.6). Delete the function
entirely if there is no verified video — a filler embed is worse than none.

```tsx
function YoutubeEmbed() {
  return (
    <figure className="blog-video" style={{ margin: "20px 0" }}>
      <iframe
        src="https://www.youtube-nocookie.com/embed/[VERIFIED_ID]"
        title="[Exact title returned by oEmbed]"
        width="960"
        height="540"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", aspectRatio: "16 / 9", height: "auto" }}
      />
    </figure>
  );
}
```

---

## 3. `data/blog.ts` — three edits

Use `<camel>Thumbnail`, not `<camel>EditorialThumbnail`. Both forms exist (7 vs
4); the short one is the majority. Do not rename the existing four.

```ts
// a) with the other imports at the top.
//    The asset basename need not equal the slug — match what you actually wrote.
import <camel>ThumbnailSrc from "@/assets/generated/<asset>-editorial-thumbnail.webp";

// b) exported thumbnail object
export const <camel>Thumbnail = {
  src: <camel>ThumbnailSrc,
  alt: "[The Milim scene specifically: setting, her position and emotion, dominant colours]",
} as const;

// c) newest-first in the blogPosts array
{
  href: "/blog/<slug>",
  category: "[Category]",
  tags: ["[Tag]", "[Tag]"],
  date: "[Month DD, YYYY]",
  readTime: "[N min read]",
  title: "[Primary keyword]: [Subtitle]",
  description: "[identical to articleDescription in page.tsx]",
  author: "Nova · Head Researcher, Gaia Research",
  image: <camel>Thumbnail,
},
```

The blog index picks this up automatically via `<BlogArchive />`. Nothing else
to edit there.

---

## 4. `content/blog/<slug>/THUMBNAIL.md`

Current convention (`thumbnail-prompt.md` is the older handoff format, frozen).

````markdown
# Thumbnail — `/blog/<slug>`

Generate via the **`milim-editorial-thumbnail`** skill
(`.agents/skills/milim-editorial-thumbnail/SKILL.md`) — its prompt skeleton,
scale and negative-space rules, and character guardrails are the authority.
Model is **`gpt-image-2`** only (CLAUDE.md hard rule; never `nano-banana`,
`nano-banana-2`, or `omniflash`).

Topic: **[slice-of-life setting]**. Palette: [setting palette], single
Milim-pink accent `#ec4899`.

## Prompt

```text
Use case: illustration-story.
Asset type: 16:9 Gaia Research blog thumbnail.
Primary request: [Vast calm setting in detail]. A microscopic, tiny 8-year-old
chibi girl (Milim Nova) placed [position], [quiet action]. Scale directive:
Milim is about 5% of total image height; the setting occupies about 90% of the
frame with huge calm negative space.
Character details: very long, unbound bright pink hair (NO TWINTAILS), blue
eyes, two yellow star hairpins in her bangs, black oversized hoodie with a cute
white baby dragon print, thigh-high socks with pink stripes, chunky high-top
sneakers.
Style: flat editorial screenprint illustration; [palette] with a single
Milim-pink accent #ec4899; broad flat shapes, subtle paper texture.
Constraints: no world-trees, roots, branches, canopies, or forests; no readable
text, letters, numbers, labels, logos, watermarks, UI, code, charts, graphs, or
diagrams; not hyper-detailed rendering.
```

## Pipeline

1. Candidate → `assets/workbench/generated/` (gitignored).
2. Export **1600×900 WebP, quality 90, fit cover, position attention** to
   **both** `assets/generated/<asset>-editorial-thumbnail.webp` and
   `public/assets/<asset>-editorial-thumbnail.webp`.
3. `npx tsx scripts/assets/sync-asset-ledger.ts`
4. `npx tsx scripts/assets/check-asset-ledger.ts --strict`
````

---

## 5. Sitemap & redirect

```ts
// app/sitemap.ts — add deliberately (see SKILL.md: 4 of 11 posts have one)
{ url: `${siteUrl}/blog/<slug>`, lastModified: new Date("[YYYY-MM-DD]"), changeFrequency: "monthly", priority: 0.7 },

// next.config.mjs redirects() — only when the slug ≠ the primary keyword
{ source: "/blog/[primary-keyword]", destination: "/blog/<slug>", permanent: true },
```

---

## 6. PR body

```markdown
## What
[One to three sentences on the post's claim.]

## Files
- `content/blog/<slug>/post.md` — [purpose]
- `app/blog/<slug>/page.tsx` — route, metadata, JSON-LD, [N] inline SVG figures
- `data/blog.ts` — thumbnail import/export + registry entry
- `assets/generated/…` + `public/assets/…` — 1600×900 editorial thumbnail
- `content/assets/asset-ledger.json` — ledger sync

## Draft status
- [ ] [anything still missing, or "complete"]

## Verification
- `npm run lint` — [result]
- `npm run build:next` — [result]
- `check-asset-ledger.ts --strict` — [result]
- `check-lexicon.ts` — [result]
- `visual-audit.mjs` with `PAGES=/blog,/blog/<slug>` — [result]

## Source ledger
[pasted from SKILL.md Phase 1.2]

## Review dimensions
Content nuance · skill-file integrity · readability (CLAUDE.md § Blog Post Reviews)
```
