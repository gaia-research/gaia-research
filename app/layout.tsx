import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Gaia Research — Cyber-Slime Laboratory", template: "%s | Gaia Research" },
  description: "Gaia Research discovers, verifies, and publishes the frontier of AI agent capabilities through open evidence and public ledgers.",
  metadataBase: new URL("https://gaia-research.github.io/gaia-research/"),
  openGraph: { type: "website", title: "Gaia Research", description: "Open evidence for capable agents." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
