import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { BlogPostCard } from "@/components/BlogPostCard";
import { blogPosts } from "@/data/blog";

export const metadata = {
  title: "Blog · Gaia Research",
  description:
    "Thought leadership, engineering essays, and AI agent dispatches from Nova and the Gaia Research team.",
};

export default function BlogIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-index" aria-labelledby="blog-title">
        <header className="blog-index-head">
          <p className="signal"><span /> THE GAIA BLOG</p>
          <h1 id="blog-title">Notes from the edge of the lab.</h1>
          <p>
            Field notes, explainers, and thoughtful detours from Nova and the Gaia Research team.
          </p>
        </header>

        <section aria-labelledby="blog-list-title">
          <h2 id="blog-list-title" className="sr-only">Blog posts</h2>
          <div className="blog-list">
            {blogPosts.map((post) => <BlogPostCard key={post.href} post={post} />)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
