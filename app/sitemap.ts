import type { MetadataRoute } from "next";

const siteUrl = "https://research.gaiaskilltree.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date("2026-07-22"), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date("2026-07-22"), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/blog/skill-evals`, lastModified: new Date("2026-07-22"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/blog/daily-agent-radar-2026-07-24`, lastModified: new Date("2026-07-24"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/labs/context-diet`, lastModified: new Date("2026-07-22"), changeFrequency: "monthly", priority: 0.9 },
  ];
}
