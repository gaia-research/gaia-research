import type { Metadata } from "next";
import { packageName, version } from "@/data/mcp";

export const metadata: Metadata = {
  title: "Gaia MCP — Model Context Protocol Server",
  description: `Integrate the Gaia Skill Tree directly into your AI assistant via stdio. Discover, inspect, and status public skills using ${packageName}@${version}.`,
  openGraph: {
    title: "Gaia MCP — Model Context Protocol Server",
    description: `Integrate the Gaia Skill Tree directly into your AI assistant via stdio. Discover, inspect, and status public skills using ${packageName}@${version}.`,
    type: "website",
  },
};

export default function McpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
