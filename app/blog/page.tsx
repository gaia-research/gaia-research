import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { BlogArchive } from "@/components/BlogArchive";

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
          <h1 id="blog-title">Blog</h1>
        </header>
        <BlogArchive />
      </main>
      <SiteFooter />
    </>
  );
}
