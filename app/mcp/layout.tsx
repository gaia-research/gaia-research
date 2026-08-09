import type { Metadata } from "next";
import { packageName, packageSelector, version } from "@/data/mcp";

const mcpDescription = `Integrate the Gaia Skill Tree directly into your AI assistant via stdio. Discover, inspect, summon, and check status for public skills using ${packageSelector}. The observed published release is ${packageName}@${version}.`;

export const metadata: Metadata = {
  title: "Gaia MCP — Model Context Protocol Server",
  description: mcpDescription,
  openGraph: {
    title: "Gaia MCP — Model Context Protocol Server",
    description: mcpDescription,
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
