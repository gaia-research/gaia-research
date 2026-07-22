import type { Metadata } from "next";
import "./globals.css";
import "../components/MilimPet/milim-pet.css";
import { MilimPet } from "@/components/MilimPet";

export const metadata: Metadata = {
  title: { default: "Gaia Research — Open Agent Research", template: "%s | Gaia Research" },
  description: "Gaia Research discovers, verifies, and publishes the frontier of AI agent capabilities through open evidence and public ledgers.",
  metadataBase: new URL("https://research.gaiaskilltree.com"),
  openGraph: { type: "website", title: "Gaia Research — Open Agent Research", description: "Open evidence for capable agents." },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/brand/icon/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/assets/brand/gaia-slime-logo-transparent.png", type: "image/png" },
      { url: "/assets/brand/logo-mark.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/assets/brand/icon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<MilimPet /></body></html>;
}
