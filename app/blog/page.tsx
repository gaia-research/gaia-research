import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { BlogArchive } from "@/components/BlogArchive";
import { skillEvalsEditorialThumbnail } from "@/data/blog";

export const metadata = {
  title: "Blog",
  description:
    "Gaia Research field notes on agent skills, AI image and video production, and token cost.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    title: "Blog | Gaia Research",
    description:
      "Gaia Research field notes on agent skills, AI image and video production, and token cost.",
    images: [skillEvalsEditorialThumbnail.src.src],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Gaia Research",
    description:
      "Gaia Research field notes on agent skills, AI image and video production, and token cost.",
    images: [skillEvalsEditorialThumbnail.src.src],
  },
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
