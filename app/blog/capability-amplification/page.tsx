import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import PostShareBar from "@/components/PostShareBar";
import novaAuthor from "@/content/authors/nova.json";
import { capabilityAmplificationThumbnail } from "@/data/blog";
import postMd from "@/content/blog/capability-amplification/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/capability-amplification";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${capabilityAmplificationThumbnail.src.src}`;
const articleTitle = "Capability Amplification: When Better Scaffolding Beats a Bigger Model";
const articleDescription =
  "Structured agent scaffolding can buy task-level reliability more cheaply than buying a larger model. Why procedural skills are an economic instrument rather than prompt debt.";
const publishedTime = "2026-10-05T00:00:00+08:00";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: ["capability amplification", "agent scaffolding", "procedural skills", "token economics", "Gaia Research"],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime,
    authors: [novaAuthor.display_name],
    images: [{ url: capabilityAmplificationThumbnail.src.src, width: 1600, height: 900, alt: capabilityAmplificationThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [capabilityAmplificationThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: publishedTime,
  author: { "@type": "Person", name: novaAuthor.display_name, url: novaAuthor.links.github },
  publisher: { "@type": "Organization", name: "Gaia Research", url: siteUrl },
};

function loadPost() {
  // Strip the title and byline; the header below renders them.
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function CapabilityAmplificationPage() {
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
            <time dateTime="2026-10-05">October 5, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">{articleDescription}</p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={capabilityAmplificationThumbnail.src.src}
            width={capabilityAmplificationThumbnail.src.width}
            height={capabilityAmplificationThumbnail.src.height}
            alt={capabilityAmplificationThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {loadPost()}
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
