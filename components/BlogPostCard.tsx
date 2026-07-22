import Link from "next/link";
import type { BlogPost } from "@/data/blog";

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="blog-card">
      <Link className="blog-card-link" href={post.href}>
        {post.image ? (
          <figure className="blog-card-media">
            <img
              src={post.image.src.src}
              width={post.image.src.width}
              height={post.image.src.height}
              alt={post.image.alt}
            />
          </figure>
        ) : null}
        <div className="blog-card-copy">
          <div className="blog-card-meta">
            <span>{post.date}</span>
            <span>{post.category}</span>
          </div>
          <h3>{post.title}</h3>
          <p>{post.description}</p>
        </div>
      </Link>
    </article>
  );
}
