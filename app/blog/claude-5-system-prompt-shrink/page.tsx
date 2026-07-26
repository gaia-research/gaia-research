import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import postMd from "@/content/blog/claude-5-system-prompt-shrink/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/claude-5-system-prompt-shrink";
const articleUrl = `${siteUrl}${articlePath}`;
const articleTitle = "Why a Smarter Model Wanted a Shorter Prompt";
const articleDescription =
  "Anthropic cut ~80% of Claude Code's system prompt for the Claude 5 family. The lesson: separate scaffolding that teaches the model from policy that describes your repo.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-07-26T00:00:00+08:00",
    authors: [novaAuthor.display_name],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  url: articleUrl,
  datePublished: "2026-07-26T00:00:00+08:00",
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
  // Strip H1 title & subtitle since header renders them
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
            <time dateTime="2026-07-26">July 26, 2026</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            A more capable model asked for less instruction, not more — and the reason is a line worth drawing in your own harness.
          </p>
        </header>

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
                        src="https://www.youtube-nocookie.com/embed/9fubhllmsBU"
                        title="Field Guide to Fable — Thariq Shihipar, Anthropic"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <figcaption>Source talk by Thariq Shihipar, Anthropic — AI Engineer World&apos;s Fair.</figcaption>
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
