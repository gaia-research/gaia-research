import Image from "next/image";
import Link from "next/link";
import ContextDietAnalyzer from "@/components/ContextDietAnalyzer";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata = {
  title: "Context Diet — Lab 001 (WIP)",
  description: "An experimental local sandbox for exploring useful context reduction in agent prompts. Benchmark results are not yet published.",
};

export default function ContextDietPage() {
  return (
    <>
      <SiteHeader />
      <aside className="wip-banner" aria-label="Context Diet Lab 001 work in progress">
        <div>
          <span className="wip-tag">Lab 001 · experimental sandbox</span>
          <p>Method and interaction are live; benchmark results and comparative claims are still pending.</p>
          <a href="https://github.com/gaia-research">Follow the lab source ↗</a>
        </div>
      </aside>
      <main id="main" className="lab-page">
        <section className="lab-hero">
          <div>
            <p className="signal"><span /> LAB 001 / EXPERIMENTAL SANDBOX</p>
            <h1>Context <em>Diet.</em></h1>
            <p>Explore how lean a prompt can become while preserving its operating constraints. This local prototype is not a published benchmark or comparative result.</p>
            <a className="button primary" href="#analyzer">Try the local estimator <span>↓</span></a>
          </div>
          <Image src="/assets/context-diet-hero.webp" alt="A glowing laboratory visualization of compressed context streams." width={1600} height={900} priority sizes="(max-width: 800px) 100vw, 50vw" />
        </section>
        <section id="analyzer" className="section-shell"><ContextDietAnalyzer /></section>
        <section className="lab-method section-shell">
          <Image src="/assets/context-diet-token-compression-motif.webp" alt="" width={1200} height={800} sizes="(max-width: 800px) 100vw, 45vw" />
          <div>
            <p>THE LAB QUESTION</p>
            <h2>What can leave without changing the job?</h2>
            <p>Context Diet is an early prototype for exploring useful reduction: objective fidelity, constraint retention, output validity, latency, and token cost. A smaller prompt is not a win if it quietly drops a requirement.</p>
            <ul>
              <li>Keep explicit objectives and safety constraints.</li>
              <li>Collapse redundant framing into a compact brief.</li>
              <li>Record the reduction method before drawing conclusions.</li>
            </ul>
            <Link className="button secondary" href="/">Return to research <span>→</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
