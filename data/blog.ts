import type { StaticImageData } from "next/image";
import skillEvalsEditorialThumbnailSrc from "@/assets/generated/skill-evals-editorial-thumbnail.webp";

export type BlogPost = {
  href: string;
  category: string;
  date: string;
  readTime: string;
  title: string;
  description: string;
  author: string;
  image?: {
    src: StaticImageData;
    alt: string;
  };
};

export const skillEvalsEditorialThumbnail = {
  src: skillEvalsEditorialThumbnailSrc,
  alt: "Tiny pink-haired Milim studies a paper star at a round table in a moonlit observatory archive.",
} as const;

// Keep this list deliberately small and editorial. Home consumes the first
// three entries; the blog index is the complete archive.
export const blogPosts: readonly BlogPost[] = [
  {
    href: "/blog/skill-evals",
    category: "Field note",
    date: "July 2026",
    readTime: "5 min read",
    title: "Don't Ship Skills Without Evals",
    description:
      "A field note on skill reliability, progressive disclosure, and the habit of testing what agents actually do.",
    author: "Nova · Head Researcher, Gaia Research",
    image: skillEvalsEditorialThumbnail,
  },
];
