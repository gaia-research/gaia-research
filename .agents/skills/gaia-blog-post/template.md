# Gaia Blog Post Templates

This file provides the canonical boilerplate templates for authoring a Gaia Research blog post (`/blog/*`).

---

## 1. Markdown Source Template (`content/blog/<slug>/post.md`)

```markdown
# [Title of the Post]

**By Nova — Head Researcher, Gaia Research**
*Referencing [Source / Context if applicable]*

---

## 1. Context & The Core Issue

[State the problem directly. Show, don't tell — why manual confirmation/vibe-checks fail.]

> Watch the primary reference source talk:
> [Talk Title on YouTube](https://youtu.be/0vphxNt4wyk).

[[YOUTUBE_EMBED]]

---

## 2. Practical Framework / Disclosure Model

[Provide a structured breakdown. Use a native SVG diagram or compact disclosure model.]

1. **Layer 1: Title & Description** — [Scope and trigger guidance]
2. **Layer 2: Core Body Instructions** — [Direct, testable procedure]
3. **Layer 3: Reference Files** — [Loaded on demand]

---

## 3. Concrete Pattern: Broad Advice vs. Lean Directive

Compare patterns directly using stacked code blocks without wall-of-text explanations:

### Broad advice (Anti-Pattern)

\`\`\`markdown
# Anti-Pattern
Please use this skill whenever working on web code. Write clean, high-quality code.
\`\`\`

### Lean directive (Clean Pattern)

\`\`\`markdown
# Clean Pattern
Use this skill ONLY when creating React components in `src/components/`.
Do NOT use for backend API routes (`src/api/`).
\`\`\`

---

## 4. Visual Evidence & SVG Graphs

[Prefer SVG graphs, timelines, or decision charts over long text explanations.]

[[SVG_GRAPH_PLACEHOLDER]]

---

## 5. Work in Progress / Next Steps

> **Work in progress.** State what is currently in progress vs. what is shipped.
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
const articleDescription = "[1-2 sentence description]";

export const metadata = {
  title: "[Post Title]",
  description: articleDescription,
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: "[Post Title]",
    description: articleDescription,
    publishedTime: "[YYYY-MM-DD]T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{ url: [slug]EditorialThumbnail.src.src, width: 1600, height: 900, alt: [slug]EditorialThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "[Post Title]",
    description: articleDescription,
    images: [[slug]EditorialThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "[Post Title]",
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
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="[YYYY-MM-DD]">[Date String]</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>
          </p>
          <h1>[Post Title]</h1>
          <p className="blog-post-summary">[Subtitle / Summary]</p>
        </header>

        {/* Milim Editorial Thumbnail */}
        <figure className="blog-post-illustration">
          <img
            src={[slug]EditorialThumbnail.src.src}
            width={[slug]EditorialThumbnail.src.width}
            height={[slug]EditorialThumbnail.src.height}
            alt={[slug]EditorialThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children, ...props }) => {
                const text = Array.isArray(children) ? children.join("") : children;
                if (text === "[[YOUTUBE_EMBED]]") {
                  return (
                    <figure className="blog-video">
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/[YOUTUBE_ID]"
                        title="[Video Title]"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <figcaption>Source talk / evidence video.</figcaption>
                    </figure>
                  );
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

---

## 3. Data Registry Boilerplate (`data/blog.ts`)

```ts
import type { StaticImageData } from "next/image";
import [slug]EditorialThumbnailSrc from "@/assets/generated/[slug]-editorial-thumbnail.webp";

export const [slug]EditorialThumbnail = {
  src: [slug]EditorialThumbnailSrc,
  alt: "[Detailed alt text describing quiet Milim slice-of-life thumbnail scene]",
} as const;

export const blogPosts: readonly BlogPost[] = [
  {
    href: "/blog/[slug]",
    category: "[Category]",
    date: "[Date String]",
    readTime: "[X min read]",
    title: "[Post Title]",
    description: "[Short description]",
    author: "Nova · Head Researcher, Gaia Research",
    image: [slug]EditorialThumbnail,
  },
];
```
