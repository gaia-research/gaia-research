# Gaia Blog Post Templates

This file provides the canonical boilerplate templates for authoring a Gaia Research blog post (`/blog/*`).

**Before filling any template:** Phase 0 of `SKILL.md` must be complete. The source ledger must be filled with verified information before a single word of post content is written.

---

## 0. Source Ledger (fill before writing)

```
Primary source: [paper title · authors · institution · year · arXiv/DOI URL]
GitHub:         [URL or "none found"]
Official video: [YouTube ID · title · verified via oEmbed — or "none found"]
Real numbers:   [task names and exact figures copied from the paper]
Mechanism:      [2-3 sentences from the methods section, not the abstract]
Fabrication risks: [anything the post might invent — configs, paths, counts]
```

---

## 1. Markdown Source Template (`content/blog/<slug>/post.md`)

```markdown
# [Title of the Post]

*[Month DD, YYYY] · Field Note by Nova — Head Researcher, Gaia Research*

---

> [Hook — one relatable observation the reader has personally encountered.
>  Not a summary of the post. Not "In this post, we will explore..."
>  The first sentence should make the reader want the second one.]

<!-- YouTube embed: only if a real relevant video was verified in the source ledger.
     Paste the verified ID below and uncomment. Never embed without oEmbed verification. -->
<!--
[[YOUTUBE_EMBED]]
-->

---

## [Section title specific to this topic — not "Introduction" or "Background"]

[State the mechanism directly. What does it actually do, step by step?
 Use numbered steps for processes. Use plain English first, then technical terms.
 Every jargon term gets a one-line anchor before it is used alone.]

[[SVG_FLOWCHART]]

---

## [Contrast section title — what the reader recognises vs. what this changes]

[Before/after code comparison. The "bad" example must be recognisably bad,
 not just longer. The "good" example must be concisely better.
 Let the code speak — do not narrate what the reader is already reading.]

### [Label for the anti-pattern]

```[language]
[anti-pattern code]
```

### [Label for the better pattern]

```[language]
[better pattern code]
```

---

## [Results or evidence section title]

[Real numbers from the source ledger. Cite the task name and baseline.
 If any number is illustrative and not from the paper, say so explicitly.]

[[BAR_CHART_OR_TABLE]]

| [Column] | [Column] | [Column] |
| :--- | :--- | :--- |
| [value from paper] | [value from paper] | [value from paper] |

---

## [Closing section title — specific to this topic]

[One concrete thing the reader can do differently today.
 Not a restatement of what the post said.
 Not "Time will tell." Not a hedging disclaimer.
 A specific next action.]

---

**Source:** [Authors], *[Paper Title]*, [Institution], [Year]. [[arXiv:XXXXXXX](https://arxiv.org/abs/XXXXXXX)] · [[GitHub](URL)] · [[Official Blog](URL)]
```

---

## 2. Next.js Page Route Template (`app/blog/[slug]/page.tsx`)

```tsx
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import { [slug]EditorialThumbnail } from "@/data/blog";
import postMd from "@/content/blog/[slug]/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/[slug]";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${[slug]EditorialThumbnail.src.src}`;
// Description: open with the primary keyword. 1-2 sentences, no hedging.
const articleDescription = "[Primary keyword] [what it does in one sentence]. [One sentence of most interesting result or implication].";

export const metadata = {
  title: "[Primary keyword]: [Subtitle] — Gaia Research",
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
    title: "[Primary keyword]: [Subtitle]",
    description: articleDescription,
    publishedTime: "[YYYY-MM-DD]T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{ url: [slug]EditorialThumbnail.src.src, width: 1600, height: 900, alt: [slug]EditorialThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "[Primary keyword]: [Subtitle]",
    description: articleDescription,
    images: [[slug]EditorialThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "[Primary keyword]: [Subtitle]",
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

// Only include if a real relevant video was verified via oEmbed.
// Delete this component entirely if no verified video exists.
function YoutubeEmbed() {
  return (
    <figure className="blog-figure my-8 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube-nocookie.com/embed/[YOUTUBE_ID]"
          title="[Video Title — exact title from oEmbed verification]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <figcaption className="text-xs text-slate-500 px-4 py-2">
        [Who made the video and what it covers — one sentence.]
      </figcaption>
    </figure>
  );
}

function loadPost() {
  // Slices the h1 title line, blank line, byline, and blank line (indices 0–3)
  // so the page <h1> renders from metadata, not duplicated from the markdown.
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function BlogPostPage() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }}
        />
        <header className="blog-post-head border-b border-slate-800/60 pb-8 mb-8">
          <p className="blog-post-meta text-sm text-slate-400 mb-2">
            <time dateTime="[YYYY-MM-DD]">[Month DD, YYYY]</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer" className="text-sky-400 font-medium hover:underline">
              {novaAuthor.display_name}
            </a>
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 my-3">
            [Primary keyword]: [Subtitle]
          </h1>
          <p className="blog-post-summary text-lg text-slate-400">
            [One sentence — the most interesting thing, stated directly. Not a summary of sections.]
          </p>
        </header>

        <figure className="blog-post-illustration my-8 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
          <img
            src={[slug]EditorialThumbnail.src.src}
            width={[slug]EditorialThumbnail.src.width}
            height={[slug]EditorialThumbnail.src.height}
            alt={[slug]EditorialThumbnail.alt}
            className="w-full h-auto object-cover"
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children, ...props }) => {
                const text = Array.isArray(children) ? children.join("") : typeof children === "string" ? children : "";
                // Add a case for each [[TOKEN]] used in the post.md
                if (text === "[[YOUTUBE_EMBED]]") {
                  return <YoutubeEmbed />;
                }
                // if (text === "[[SVG_FLOWCHART]]") { return <MyFlowchart />; }
                // if (text === "[[BAR_CHART]]") { return <MyBarChart />; }
                return <p {...props}>{children}</p>;
              },
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot mt-16 pt-8 border-t border-slate-800">
          <Link href="/blog" className="text-sky-400 font-medium hover:underline flex items-center gap-2">
            ← Back to Blog
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
```

---

## 3. Data Registry Entry (`data/blog.ts`)

```ts
import type { StaticImageData } from "next/image";
import [slug]EditorialThumbnailSrc from "@/assets/generated/[slug]-editorial-thumbnail.webp";

export const [slug]EditorialThumbnail = {
  src: [slug]EditorialThumbnailSrc,
  alt: "[Detailed alt text: describe the quiet Milim slice-of-life scene specifically — setting, Milim's position and emotion, dominant colours]",
} as const;

// Add to the top of the blogPosts array (newest first):
// {
//   href: "/blog/[slug]",
//   category: "[Category]",
//   date: "[Month DD, YYYY]",
//   readTime: "[X min read]",
//   title: "[Primary keyword]: [Subtitle]",
//   description: "[Same as articleDescription in page.tsx — opens with primary keyword]",
//   author: "Nova · Head Researcher, Gaia Research",
//   image: [slug]EditorialThumbnail,
// },
```

---

## 4. Sitemap & Redirect Entries

```ts
// app/sitemap.ts — add:
{ url: `${siteUrl}/blog/[slug]`, lastModified: new Date("[YYYY-MM-DD]"), changeFrequency: "monthly", priority: 0.7 },

// next.config.mjs redirects() — add if slug doesn't match the primary keyword:
{
  source: "/blog/[primary-keyword]",
  destination: "/blog/[slug]",
  permanent: true,
},
```
