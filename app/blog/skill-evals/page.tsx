import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import { skillEvalsEditorialThumbnail } from "@/data/blog";
import postMd from "@/content/blog/skill-evals/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/skill-evals";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${skillEvalsEditorialThumbnail.src.src}`;
const articleDescription =
  "Repeatable agent skill evaluations: how to test SKILL.md instructions, failure cases, and progressive disclosure.";

export const metadata = {
  title: "Don't Ship Skills Without Evals",
  description: articleDescription,
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: "Don't Ship Skills Without Evals",
    description: articleDescription,
    publishedTime: "2026-07-22T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{ url: skillEvalsEditorialThumbnail.src.src, width: 1600, height: 900, alt: skillEvalsEditorialThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Don't Ship Skills Without Evals",
    description: articleDescription,
    images: [skillEvalsEditorialThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Don't Ship Skills Without Evals",
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-07-22T00:00:00+08:00",
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
            <time dateTime="2026-07-22">July 22, 2026</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>
          </p>
          <h1>Don't Ship Skills Without Evals</h1>
          <p className="blog-post-summary">
            How to design repeatable, evidence-first evaluations for agent skills.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={skillEvalsEditorialThumbnail.src.src}
            width={skillEvalsEditorialThumbnail.src.width}
            height={skillEvalsEditorialThumbnail.src.height}
            alt={skillEvalsEditorialThumbnail.alt}
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
                        src="https://www.youtube-nocookie.com/embed/0vphxNt4wyk"
                        title="Don't Ship Skills Without Evals — Philipp Schmid, Google DeepMind"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <figcaption>Source talk by Philipp Schmid, Google DeepMind.</figcaption>
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
