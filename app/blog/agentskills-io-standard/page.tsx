import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import { agentskillsIoStandardThumbnail } from "@/data/blog";
import postMd from "@/content/blog/agentskills-io-standard/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/agentskills-io-standard";
const articleUrl = `${siteUrl}${articlePath}`;
const articleTitle = "The agentskills.io Standard and Its Story";
const thumbnailUrl = `${siteUrl}${agentskillsIoStandardThumbnail.src.src}`;
const articleDescription =
  "How an open, file-system-native specification unified skill discovery across 40+ AI agent platforms and established 3-level progressive disclosure.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "agentskills.io",
    "Agent Skills",
    "SKILL.md",
    "progressive disclosure",
    "Anthropic",
    "Claude Code",
    "open standard",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-07-30T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{
      url: agentskillsIoStandardThumbnail.src.src,
      width: 1600,
      height: 900,
      alt: agentskillsIoStandardThumbnail.alt,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [agentskillsIoStandardThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-07-30T00:00:00+08:00",
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
            <time dateTime="2026-07-30">July 30, 2026</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            How a minimalist file-system specification solved context window bloat and brought portability to 40+ AI agent platforms.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={agentskillsIoStandardThumbnail.src.src}
            width={agentskillsIoStandardThumbnail.src.width}
            height={agentskillsIoStandardThumbnail.src.height}
            alt={agentskillsIoStandardThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children, ...props }) => {
                const text = props.node?.children
                  ?.map((child) => (child.type === "text" ? child.value : ""))
                  .join("")
                  ?? (Array.isArray(children) ? children.join("") : typeof children === "string" ? children : "");
                if (text === "[[YOUTUBE_EMBED]]") {
                  return (
                    <figure className="blog-video">
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/CEvIs9y1uog"
                        title="Don't Build Agents, Build Skills Instead – Barry Zhang & Mahesh Murag, Anthropic"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <figcaption>
                        Barry Zhang and Mahesh Murag of Anthropic presenting &ldquo;Don&apos;t Build Agents, Build Skills Instead&rdquo;.
                      </figcaption>
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
