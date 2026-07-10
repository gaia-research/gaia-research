import Image from "next/image";
import Link from "next/link";
import { ContextDietAnalyzer } from "@/components/labs/ContextDietAnalyzer";
import { ContextDietEvidence } from "@/components/labs/ContextDietEvidence";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata = {
  title: "Context Diet — Lab 001",
  description:
    "An in-browser estimator for useful context reduction in agent prompts, backed by the completed Lab 001 benchmark. The community leaderboard is coming online.",
};

export default function ContextDietPage() {
  return (
    <>
      <SiteHeader />
      <aside className="wip-banner" aria-label="Context Diet Lab 001 leaderboard status">
        <div>
          <span className="wip-tag">Lab 001 · benchmark complete</span>
          <p>The estimator and Lab 001 results are live. The community leaderboard is still coming online.</p>
          <a href="https://github.com/gaia-research">Follow the lab source ↗</a>
        </div>
      </aside>
      <main id="main" className="lab-page">
        <section className="lab-hero">
          <div>
            <p className="signal"><span /> LAB 001 / CONTEXT DIET BENCHMARK</p>
            <h1>Context <em>Diet.</em></h1>
            <p>See how lean a prompt can become while preserving its operating constraints. The estimator projects a reduction band in your browser; Lab 001 is the measured benchmark behind it.</p>
            <a className="button primary" href="#analyzer">Try the estimator <span>↓</span></a>
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
            Recorded results from a completed run on this repo&apos;s own
            <code> CLAUDE.md</code>. The estimator above projects a band from the four strategies
            below; the winning strategy is highlighted.
          </p>
          <ContextDietEvidence />
        </section>

        <section className="lab-method section-shell">
          <Image src="/assets/context-diet-token-compression-motif.webp" alt="" width={1200} height={800} sizes="(max-width: 800px) 100vw, 45vw" />
          <div>
            <span className="section-kicker">THE LAB QUESTION</span>
            <h2>What can leave without changing the job?</h2>
            <p>Context Diet measures useful reduction across objective fidelity, constraint retention, output validity, latency, and token cost. A smaller prompt is not a win if it quietly drops a requirement.</p>
            <ul>
              <li>Keep explicit objectives and safety constraints.</li>
              <li>Collapse redundant framing into a compact brief.</li>
              <li>Record the reduction method alongside every result.</li>
            </ul>
            <Link className="button secondary" href="/">Return to research <span>→</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
