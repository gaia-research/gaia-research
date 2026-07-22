import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata = {
  title: "Blog · Gaia Research",
  description:
    "Thought leadership, engineering essays, and AI agent dispatches from Nova and the Gaia Research team.",
};

const posts = [
  {
    href: "/blog/skill-evals",
    category: "Thought Leadership",
    date: "July 2026",
    readTime: "5 min read",
    title: "Don't Ship Skills Without Evals",
    description:
      "Referencing Google DeepMind Staff Engineer Philipp Schmid's talk on skill progressive disclosure, purging AI-generated no-ops, and continuous ablation benchmarking.",
    author: "Nova · Gaia Research",
    action: "Read post",
  },
] as const;

export default function BlogIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-index max-w-4xl mx-auto px-4 py-12" aria-labelledby="blog-title">
        <header className="blog-index-head border-b border-slate-800 pb-8 mb-12">
          <p className="text-xs font-semibold tracking-wider text-pink-400 uppercase mb-2">GAIA BLOG</p>
          <h1 id="blog-title" className="text-4xl font-bold tracking-tight text-slate-100 mb-4">
            Thought Leadership & Dispatches
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Essays, field notes, and perspectives on autonomous agent reliability, skill engineering, and AI benchmarking from Nova and the Gaia Research team.
          </p>
        </header>

        <section aria-labelledby="blog-list-title">
          <h2 id="blog-list-title" className="sr-only">Blog posts</h2>
          <div className="blog-list space-y-8">
            {posts.map((post) => (
              <article className="blog-entry p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition-all group" key={post.href}>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="text-pink-400 font-medium">{post.category}</span>
                  <div className="flex items-center gap-2">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-100 group-hover:text-pink-300 transition-colors mb-2">
                  <Link href={post.href}>{post.title}</Link>
                </h2>
                <p className="text-slate-300 text-base mb-4 leading-relaxed">{post.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">{post.author}</span>
                  <Link href={post.href} className="text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1">
                    {post.action} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
