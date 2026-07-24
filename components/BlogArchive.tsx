"use client";

import { useMemo, useState } from "react";
import { BlogPostCard } from "@/components/BlogPostCard";
import { blogPosts } from "@/data/blog";

type View = "grid" | "list";
type Sort = "newest" | "oldest";

const categories = [
  "All",
  "Agent Skills",
  "AI Image Production",
  "AI Video Production",
  "Token Cost",
] as const;

const sorts: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

function fuzzyMatches(value: string, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;

  const haystack = value.toLocaleLowerCase();
  if (haystack.includes(needle)) return true;

  let cursor = 0;
  for (const character of haystack) {
    if (character === needle[cursor]) cursor += 1;
    if (cursor === needle.length) return true;
  }
  return false;
}

export function BlogArchive() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [view, setView] = useState<View>("grid");
  const posts = useMemo(
    () =>
      blogPosts
        .filter((post) => {
          const searchable = [post.title, post.description, post.author, post.category, ...(post.tags ?? [])].join(" ");
          const tags = post.tags ?? [post.category];
          return (category === "All" || tags.includes(category)) && fuzzyMatches(searchable, query);
        })
        .slice()
        .sort((a, b) => {
          const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
          return sort === "newest" ? -diff : diff;
        }),
    [category, query, sort],
  );

  return (
    <section className="blog-archive" aria-labelledby="blog-list-title">
      <h2 id="blog-list-title" className="sr-only">Blog posts</h2>

      <aside className="blog-sidebar" aria-label="Filter and sort">
        <div className="blog-sidebar-group">
          <h3>Sort by</h3>
          <div className="blog-sidebar-list">
            {sorts.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={sort === item.value}
                onClick={() => setSort(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="blog-sidebar-group">
          <h3>Category</h3>
          <div className="blog-sidebar-list">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="blog-main">
        <div className="blog-controls">
          <label className="blog-search">
            <span className="sr-only">Search posts</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts"
            />
          </label>
          <div className="blog-view" aria-label="View posts as">
            <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}>Grid</button>
            <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>List</button>
          </div>
        </div>

        {posts.length ? (
          <div className="blog-list" data-view={view}>
            {posts.map((post) => <BlogPostCard key={post.href} post={post} />)}
          </div>
        ) : (
          <p className="blog-empty">No posts match that search.</p>
        )}
      </div>
    </section>
  );
}
