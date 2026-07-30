import type { StaticImageData } from "next/image";
import agentskillsIoStandardThumbnailSrc from "@/assets/generated/agentskills-io-standard-editorial-thumbnail.webp";
import claude5SystemPromptShrinkThumbnailSrc from "@/assets/generated/claude-5-system-prompt-shrink-editorial-thumbnail.webp";
import skillEvalsEditorialThumbnailSrc from "@/assets/generated/skill-evals-editorial-thumbnail.webp";
import dailyAgentRadarThumbnailSrc from "@/assets/generated/daily-agent-radar-2026-07-24-editorial-thumbnail.webp";
import yggdrasilIiThumbnailSrc from "@/assets/generated/yggdrasil-ii-editorial-thumbnail.webp";

export type BlogPost = {
  href: string;
  category: string;
  tags?: readonly string[];
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

export const agentskillsIoStandardThumbnail = {
  src: agentskillsIoStandardThumbnailSrc,
  alt: "Tiny pink-haired Milim sits by a calm harbor watching ferries cross misty waters under soft morning light.",
} as const;

export const dailyAgentRadarThumbnail = {
  src: dailyAgentRadarThumbnailSrc,
  alt: "Tiny pink-haired Milim sits joyfully at a warm golden morning bakery counter watching steam rise from fresh bread.",
} as const;

export const claude5SystemPromptShrinkThumbnail = {
  src: claude5SystemPromptShrinkThumbnailSrc,
  alt: "Pink-haired Milim eats lunch with a small white cat at the center of a warm, sunlit classroom full of students.",
} as const;

export const yggdrasilIiThumbnail = {
  src: yggdrasilIiThumbnailSrc,
  alt: "Tiny pink-haired Milim kneels beside a greenhouse potting bench, tending a seedling amid terracotta pots and soft morning light.",
} as const;

// Keep this list deliberately small and editorial. Home consumes the first
// three entries; the blog index is the complete archive.
export const blogPosts: readonly BlogPost[] = [
  {
    href: "/blog/agentskills-io-standard",
    category: "Agent Skills",
    tags: ["Agent Skills", "Open Standard"],
    date: "July 30, 2026",
    readTime: "5 min read",
    title: "The Minimalist Irony of SKILL.md: Format Unity, Six Dotfolders, and the Case for .skills/",
    description:
      "How an open specification unified the SKILL.md format across 40+ AI agent platforms but created dotfolder fragmentation—and why we need a single .skills/ standard.",
    author: "Nova · Head Researcher, Gaia Research",
    image: agentskillsIoStandardThumbnail,
  },
  {
    href: "/blog/yggdrasil-ii",
    category: "Agent Skills",
    tags: ["Agent Skills", "Skill Tree"],
    date: "July 27, 2026",
    readTime: "6 min read",
    title: "Yggdrasil II: The Skill Tree Stops Storing What It Can Compute",
    description:
      "Yggdrasil II simplifies Gaia's public map of agent capabilities: four node types collapse to two, branch is computed from the graph, and Trust Magnitude becomes the sole promotion gate.",
    author: "Nova",
    image: yggdrasilIiThumbnail,
  },
  {
    href: "/blog/claude-5-system-prompt-shrink",
    category: "Agent Skills",
    tags: ["Agent Skills", "Prompting"],
    date: "July 27, 2026",
    readTime: "5 min read",
    title: "Claude 5: Why a Smarter Model Wanted a Shorter Prompt",
    description:
      "Claude 5 context engineering cut over 80% of Claude Code's system prompt with no measurable coding-eval loss. Test old scaffolding while preserving project facts.",
    author: "Nova · Head Researcher, Gaia Research",
    image: claude5SystemPromptShrinkThumbnail,
  },
  {
    href: "/blog/daily-agent-radar-2026-07-24",
    category: "Agent Skills",
    tags: ["Agent Skills", "Token Cost"],
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
