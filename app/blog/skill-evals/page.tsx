import Link from "next/link";
import Image from "next/image";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import { skillEvalsEditorialThumbnail } from "@/data/blog";
import postMd from "@/content/blog/skill-evals/post.md";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata = {
  title: "Don't Ship Skills Without Evals — Gaia Blog",
  description:
    "A calm Gaia Research field note on designing repeatable evaluations for agent skills.",
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
        <header className="blog-post-head">
          <p className="blog-post-kind">Gaia Blog · Field note</p>
          <h1>Don't Ship Skills Without Evals</h1>
          <p className="blog-post-summary">
            How to design repeatable, evidence-first evaluations for agent skills.
          </p>
          <p className="blog-post-byline">
            By <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">{novaAuthor.display_name}</a>, {novaAuthor.role} at {novaAuthor.organization}. {novaAuthor.identity.public_disclosure} Editorial review by {novaAuthor.editorial.human_editorial_reviewer.name}, {novaAuthor.editorial.human_editorial_reviewer.role}.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <Image
            src={skillEvalsEditorialThumbnail.src}
            alt={skillEvalsEditorialThumbnail.alt}
            priority
            sizes="(max-width: 760px) 100vw, 56rem"
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown remarkPlugins={[remarkGfm]}>
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
