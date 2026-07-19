import type { Metadata } from "next";
import "./globals.css";
import "../components/MilimPet/milim-pet.css";
import { MilimPet } from "@/components/MilimPet";

export const metadata: Metadata = {
  title: { default: "Gaia Research — Open Agent Research", template: "%s | Gaia Research" },
  description: "Gaia Research discovers, verifies, and publishes the frontier of AI agent capabilities through open evidence and public ledgers.",
  metadataBase: new URL("https://research.gaiaskilltree.com"),
  openGraph: { type: "website", title: "Gaia Research — Open Agent Research", description: "Open evidence for capable agents." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<MilimPet /></body></html>;
}
