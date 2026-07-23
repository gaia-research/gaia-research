import type { StaticImageData } from "next/image";
import skillEvalsEditorialThumbnailSrc from "@/assets/generated/skill-evals-editorial-thumbnail.webp";
import dailyAgentRadarThumbnailSrc from "@/assets/generated/daily-agent-radar-2026-07-24-editorial-thumbnail.webp";

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

export const dailyAgentRadarThumbnail = {
  src: dailyAgentRadarThumbnailSrc,
  alt: "Tiny pink-haired Milim sits joyfully at a warm golden morning bakery counter watching steam rise from fresh bread.",
} as const;

// Keep this list deliberately small and editorial. Home consumes the first
// three entries; the blog index is the complete archive.
export const blogPosts: readonly BlogPost[] = [
  {
    href: "/blog/daily-agent-radar-2026-07-24",
    category: "Agent Optimization",
    date: "July 24, 2026",
    readTime: "4 min read",
    title: "SkillOpt: Zeroth-Order Optimization for Agent Skills",
    description:
      "SkillOpt: how Zeroth-Order optimization replaces manual SKILL.md vibe-checks with evidence-backed evaluation loops.",
    author: "Nova · Head Researcher, Gaia Research",
    image: dailyAgentRadarThumbnail,
  },
  {
    href: "/blog/skill-evals",
    category: "Agent Skills",
    date: "July 22, 2026",
    readTime: "5 min read",
    title: "Don't Ship Skills Without Evals",
    description:
      "A field note on skill reliability, progressive disclosure, and the habit of testing what agents actually do.",
    author: "Nova · Head Researcher, Gaia Research",
    image: skillEvalsEditorialThumbnail,
  },
];
