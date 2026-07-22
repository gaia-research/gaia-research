import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContextDietAnalyzer } from "@/components/labs/ContextDietAnalyzer";
import { ContextDietEvidence } from "@/components/labs/ContextDietEvidence";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const pagePath = "/labs/context-diet";
const pageUrl = `https://research.gaiaskilltree.com${pagePath}`;
const pageTitle = "Context Diet v1.1 — Agent Context Audit";
const pageDescription =
  "Audit CLAUDE.md, AGENTS.md, and other agent-context files of any size. Estimate safe, recommended, and aggressive reduction before explicitly approving destructive retirement.";
const socialImage = "/assets/context-diet-hero.webp";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: pagePath },
  openGraph: {
    type: "website",
    url: pagePath,
    title: pageTitle,
    description: pageDescription,
    siteName: "Gaia Research",
    images: [{ url: socialImage, width: 1536, height: 1024, alt: "Context streams being compressed inside the Gaia Research laboratory." }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [socialImage],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Context Diet",
  url: pageUrl,
  description: pageDescription,
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "Agent context analyzer",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  image: `https://research.gaiaskilltree.com${socialImage}`,
  author: {
    "@type": "Organization",
    name: "Gaia Research",
    url: "https://research.gaiaskilltree.com",
  },
};

export default function ContextDietPage() {
  return (
    <>
      <SiteHeader />
      <aside className="wip-banner" aria-label="Context Diet Lab 001 leaderboard status">
        <div>
          <span className="wip-tag">Context Diet v1.1 · now live</span>
          <p>Audit any context file now. Nothing is removed until you explicitly approve a later pass.</p>
          <a href="https://github.com/gaia-research/skill-context-diet">Follow the lab source ↗</a>
        </div>
      </aside>
      <main id="main" className="lab-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <section className="lab-hero">
          <div>
            <p className="signal"><span /> LAB 001 / CONTEXT DIET BENCHMARK</p>
            <h1>Context <em>Diet.</em></h1>
            <p>Every context file pays rent on every run—even when it is nowhere near a hard limit. Measure the drag, set a natural-language goal, and let Context Diet propose what to keep, compress, externalize, or retire.</p>
            <a className="button primary" href="#analyzer">Estimate the diet <span>↓</span></a>
          </div>
          <Image src="/assets/context-diet-hero.webp" alt="A glowing laboratory visualization of compressed context streams." width={1600} height={900} priority sizes="(max-width: 800px) 100vw, 50vw" />
        </section>

        <section id="analyzer" className="section-shell"><ContextDietAnalyzer /></section>

        <section className="section-shell" style={{ padding: "var(--space-dense) var(--gutter)" }} aria-labelledby="evidence-title">
          <span className="section-kicker">LAB 001 BENCHMARK · CONTEXT DIET</span>
          <h2 id="evidence-title" style={{ fontSize: "var(--type-display-3)", margin: ".5rem 0 0" }}>
            The measured run behind the projection.
          </h2>
          <p style={{ color: "var(--muted)", maxWidth: "60ch", margin: ".75rem 0 1.5rem" }}>
            Recorded results from the original Lab 001 benchmark. The estimator above uses those
            measured strategies as a screening band; the installed skill audits your actual file
            before recommending a safe, lean, or aggressive plan.
          </p>
          <ContextDietEvidence />
        </section>

        <section className="lab-method section-shell">
          <Image src="/assets/context-diet-token-compression-motif.webp" alt="" width={1200} height={800} sizes="(max-width: 800px) 100vw, 45vw" />
          <div>
            <span className="section-kicker">TWO PASSES · ONE NATURAL PROMPT</span>
            <h2>First diagnose. Then decide what leaves.</h2>
            <p>Call Context Diet anytime and describe the outcome you want. The first pass is read-only: it inventories protected context and estimates safe, recommended, and aggressive reduction. A later explicit “apply” authorizes retirement against a fresh, verified plan.</p>
            <ul>
              <li><strong>Audit:</strong> classify what stays inline, condenses, moves, or has expired.</li>
              <li><strong>Estimate:</strong> show the defensible floor before changing a byte.</li>
              <li><strong>Apply:</strong> require clear approval, verify the source hash, then preserve a recoverable diff.</li>
              <li><strong>80%:</strong> treat it as a stretch goal—not permission to cut protected rules.</li>
            </ul>
            <Link className="button secondary" href="/">Return to research <span>→</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
