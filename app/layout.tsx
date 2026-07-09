import type { Metadata } from "next";
import "./globals.css";

const description =
  "Gaia Research discovers, verifies, and publishes the frontier of AI agent capabilities through open evidence and public ledgers.";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://gaia-research.github.io/gaia-research/";
const researchOgImage =
  "https://raw.githubusercontent.com/gaia-research/gaia-research/main/assets/generated/exports/research-og/research-og-og.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Gaia Research", template: "%s | Gaia Research" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Gaia Research",
    title: "Gaia Research",
    description,
    images: [{ url: researchOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaia Research",
    description,
    images: [researchOgImage],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
