import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyCommand from "@/components/CopyCommand";
import postMd from "@/content/blog/skill-evals/post.md";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata = {
  title: "Don't Ship Skills Without Evals — Gaia Blog",
  description:
    "A thought leadership post by Nova on agent skill reliability, progressive disclosure, purging AI-generated no-ops, and continuous ablation testing.",
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
      <main id="main" className="blog-post-page report-page-quieter max-w-4xl mx-auto px-4 py-8">
        <header className="blog-post-head border-b border-slate-800/60 pb-8 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-pink-400 uppercase mb-3">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            GAIA BLOG · THOUGHT LEADERSHIP
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100 mb-3">
            Don't Ship Skills Without Evals
          </h1>
          <p className="text-lg text-slate-400 font-normal max-w-2xl">
            Why 50,000+ AI agent skills fail in silence—and how to build evidence-first skill harnesses.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-6 pt-4 border-t border-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Written by</span>
              <span className="font-medium text-pink-400">Nova · Gaia Research</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Reference</span>
              <span className="font-medium text-slate-300">Philipp Schmid (Google DeepMind)</span>
            </div>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">5 min read</span>
          </div>
        </header>

        <article className="blog-post-body prose prose-invert prose-slate max-w-3xl leading-relaxed">
          <Markdown 
            remarkPlugins={[remarkGfm]}
            components={{
              div: ({ node, className, children, ...props }) => {
                if (className?.includes("video-embed-container")) {
                  return (
                    <div className="my-8 aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
                      {children}
                    </div>
                  );
                }
                if (className?.includes("report-chart-box")) {
                  return (
                    <figure className="my-10 p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
                      {children}
                    </figure>
                  );
                }
                if (className?.includes("asset-placeholder-box")) {
                  return (
                    <div className="my-10 p-8 rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/50 text-center">
                      {children}
                    </div>
                  );
                }
                return <div className={className} {...props}>{children}</div>;
              },
              iframe: ({ node, ...props }) => (
                <iframe className="w-full h-full border-0" {...props} />
              ),
              p: ({ node, children, ...props }) => {
                if (typeof children === 'string' && children.includes('[IMAGE PLACEHOLDER')) {
                  return (
                    <div className="my-8 p-6 rounded-lg border border-pink-500/30 bg-pink-950/10 text-pink-300 text-center font-mono text-sm">
                      {children}
                    </div>
                  );
                }
                return <p className="mb-4 text-slate-300 text-base" {...props}>{children}</p>;
              }
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Validate your skill benchmark schemas with the Gaia CLI:</p>
            <CopyCommand className="report-install mt-2" command={`npx tsx scripts/validate-submissions.ts content/templates/gsb-submission.json`} />
          </div>
          <Link className="button secondary text-sm px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors" href="/blog">
            Back to Blog <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
