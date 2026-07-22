"use client";

import { useMemo, useState } from "react";
import { BlogPostCard } from "@/components/BlogPostCard";
import { blogPosts } from "@/data/blog";

type View = "grid" | "list";

const categories = [
  "All",
  "Agent Skills",
  "AI Image Production",
  "AI Video Production",
  "Token Cost",
] as const;

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
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<View>("grid");
  const posts = useMemo(
    () =>
      blogPosts.filter((post) => {
        const searchable = [post.title, post.description, post.author, post.category].join(" ");
        return (category === "All" || post.category === category) && fuzzyMatches(searchable, query);
      }),
    [category, query],
  );

  return (
    <section className="blog-archive" aria-labelledby="blog-list-title">
      <h2 id="blog-list-title" className="sr-only">Blog posts</h2>
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
        <label className="blog-filter">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
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
    </section>
  );
}
