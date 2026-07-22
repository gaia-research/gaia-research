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
          <Image
            src={skillEvalsEditorialThumbnail.src}
            alt={skillEvalsEditorialThumbnail.alt}
            priority
            sizes="(max-width: 760px) 100vw, 56rem"
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
