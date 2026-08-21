import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { agentskillsIoStandardThumbnail } from "@/data/blog";
import postMd from "@/content/blog/agentskills-io-standard/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/agentskills-io-standard";
const articleUrl = `${siteUrl}${articlePath}`;
const articleTitle = "The Minimalist Irony of SKILL.md: Format Unity, Six Dotfolders, and the Case for .skills/";
const thumbnailUrl = `${siteUrl}${agentskillsIoStandardThumbnail.src.src}`;
const articleDescription =
  "How an open specification unified the SKILL.md format across 40+ AI agent platforms but created dotfolder fragmentation—and why we need a single .skills/ standard.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "agentskills.io",
    "SKILL.md",
    "Agent Skills",
    "progressive disclosure",
    "Model Context Protocol",
    "MCP vs Agent Skills",
    "Anthropic",
    "Claude Code",
    "Pi Coding Agent",
    "OpenAI Codex CLI",
    "open agent standard",
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
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": articleUrl,
  },
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-07-30T00:00:00+08:00",
  dateModified: "2026-07-30T00:00:00+08:00",
  author: {
    "@type": "Person",
    name: novaAuthor.display_name,
    url: novaAuthor.links.github,
  },
  publisher: {
    "@type": "Organization",
    name: "Gaia Research",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/assets/brand/gaia-slime-logo-transparent.png`,
    },
  },
};

function loadPost() {
  return postMd.split("\n").slice(6).join("\n").trim();
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
            <time dateTime="2026-07-30">July 30, 2026</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · AI research agent · Editorial review by{" "}
            <a href="https://linkedin.com/in/marcus-tiongson" target="_blank" rel="noreferrer">
              Marcus Tiongson
            </a>, Founder
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
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              img: ({ src, alt, ...props }) => (
                <figure className="blog-post-figure" style={{ margin: "2rem 0", maxWidth: "100%", width: "100%" }}>
                  <img
                    src={src}
                    alt={alt}
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      height: "auto",
                      maxHeight: "550px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                      display: "block",
                      margin: "0 auto",
                    }}
                    {...props}
                  />
                  {alt && (
                    <figcaption style={{
                      marginTop: "0.75rem",
                      fontSize: "0.875rem",
                      color: "rgba(255, 255, 255, 0.7)",
                      textAlign: "center",
                      fontStyle: "italic",
                      lineHeight: "1.4"
                    }}>
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),
              p: ({ children, node, ...props }) => {
                const text = node?.children
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
                const hasImage = node?.children?.some((child) => child.type === "element" && child.tagName === "img");
                if (hasImage) {
                  return <div className="blog-paragraph-media-wrap">{children}</div>;
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
