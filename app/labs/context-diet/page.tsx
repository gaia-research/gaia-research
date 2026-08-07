import type { Metadata } from "next";
import Image from "next/image";
import { ContextDietAnalyzer } from "@/components/labs/ContextDietAnalyzer";
import { ContextDietEvidence } from "@/components/labs/ContextDietEvidence";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const pagePath = "/labs/context-diet";
const pageUrl = `https://research.gaiaskilltree.com${pagePath}`;
const pageTitle = "Context Diet v1.2 — Agent Context Audit";
const pageDescription =
  "Measure and compact agent-context files without losing rules, or use guided ablation to test intentional omissions with checkpoints, evidence gates, explicit acceptance, and rollback.";
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
          <span className="wip-tag">Context Diet v1.2 · now live</span>
          <p>Preserve every rule in normal compaction—or enter a separate, reversible ablation flow for intentional removal.</p>
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
            <p>Every context file pays rent on every run—even when it is nowhere near a hard limit. Measure the drag, then compact toward a target while keeping every inventoried rule recoverable. Intentional rule loss belongs to the separate guided ablation mode below.</p>
            <a className="button primary" href="#analyzer">Estimate the diet <span>↓</span></a>
          </div>
          <Image src="/assets/context-diet-hero.webp" alt="Milim and Gaia sharing an oversized basket of fried chicken at a midnight diner counter." width={1600} height={900} priority sizes="(max-width: 800px) 100vw, 50vw" />
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

        <section className="cd-mode-guide section-shell" aria-labelledby="mode-guide-title">
          <div className="cd-mode-guide-head">
            <p className="signal"><span /> TWO MODES · DIFFERENT CLAIMS</p>
            <h2 id="mode-guide-title">Compaction preserves. Ablation tests an omission.</h2>
            <p>
              Context Diet does not treat a smaller file as proof of a better one. Choose the path
              that matches the change you are actually making.
            </p>
          </div>

          <div className="cd-mode-compare">
            <article>
              <p className="cd-mode-label">Normal mode</p>
              <h3>Rule-preserving compaction</h3>
              <p>
                The default path inventories the original rules, generates review-only candidates,
                and adversarially checks the complete result—including linked files. A candidate
                with a weakened or missing load-bearing rule is disqualified.
              </p>
              <ul>
                <li>Measures exact characters and estimates tokens.</li>
                <li>Compares externalize, condense, telegraphic, and hybrid strategies.</li>
                <li>Targets 100% recoverable rules; externalization is movement, not deletion.</li>
                <li>Leaves application to user review through the host&apos;s normal edit flow.</li>
              </ul>
              <a className="cd-mode-link" href="https://github.com/gaia-research/skill-context-diet/blob/main/METHODOLOGY.md">
                Read the compaction methodology <span>↗</span>
              </a>
            </article>

            <article className="cd-mode-ablation">
              <p className="cd-mode-label">Experimental mode</p>
              <h3>Guided, reversible ablation</h3>
              <p>
                Use ablation when the goal intentionally removes context. The controller checkpoints
                the original, derives deletion units locally, protects sensitive blocks, and stages
                a bounded omission without editing the live target.
              </p>
              <ul>
                <li>Tests exact configured model routes against a sealed behavioral suite.</li>
                <li>Blocks acceptance on regression, missing coverage, uncertain judgment, or stale evidence.</li>
                <li>Requires an explicit trial ID and candidate SHA before the only candidate-apply path.</li>
                <li>Journals atomic writes and supports exact, reversible rollback.</li>
              </ul>
              <p className="cd-mode-caveat">
                “No regression observed” applies only to that exact route, snapshot, and sealed suite.
                It does not prove a rule is universally safe to delete.
              </p>
              <a className="button secondary" href="https://github.com/gaia-research/skill-context-diet/blob/main/ABLATION.md">
                Open the guided ablation protocol <span>↗</span>
              </a>
            </article>
          </div>
        </section>

        <section className="lab-method section-shell">
          <Image src="/assets/context-diet-token-compression-motif.webp" alt="A happy Milim trying on an outfit in a sunny mall fitting-room mirror." width={1600} height={900} sizes="(max-width: 800px) 100vw, 45vw" />
          <div>
            <span className="section-kicker">NORMAL MODE · RULES STAY RECOVERABLE</span>
            <h2>Measure. Bake off. Audit every rule.</h2>
            <p>For ordinary compaction, Context Diet measures the file before proposing any rewrite. It then compares four strategies and qualifies only candidates that remain under the target without weakening or losing a load-bearing rule.</p>
            <ul>
              <li><strong>Measure:</strong> map exact character cost by section.</li>
              <li><strong>Inventory:</strong> extract atomic rules and identify protected constraints.</li>
              <li><strong>Compare:</strong> generate multiple review-only compaction candidates.</li>
              <li><strong>Audit:</strong> score the full candidate corpus against every original rule.</li>
            </ul>
            <a className="button secondary" href="https://github.com/gaia-research/skill-context-diet">
              Inspect the source <span>↗</span>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
