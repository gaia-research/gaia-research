import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/blog";

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="blog-card">
      {post.image ? (
        <Link className="blog-card-media" href={post.href} tabIndex={-1} aria-hidden="true">
          <Image src={post.image.src} alt={post.image.alt} fill sizes="(max-width: 700px) 100vw, 33vw" />
        </Link>
      ) : null}
      <div className="blog-card-copy">
        <div className="blog-card-meta">
          <span>{post.category}</span>
          <span>{post.date}</span>
          <span>{post.readTime}</span>
        </div>
        <h3><Link href={post.href}>{post.title}</Link></h3>
        <p>{post.description}</p>
        <div className="blog-card-foot">
          <span>{post.author}</span>
          <Link href={post.href}>Read post <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  );
}
