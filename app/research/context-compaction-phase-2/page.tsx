import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import marcusAuthor from "@/content/authors/marcus.json";
import novaAuthor from "@/content/authors/nova.json";
import ContextCompactionBenchClient from "@/components/ContextCompactionBenchClient";
// loaded as raw text by webpack asset/source
import methodologyMd from "@/content/reports/context-compaction-phase-2/methodology.md";
import receiptsMd from "@/content/reports/context-compaction-phase-2/receipts.md";

export const metadata = {
  title: "Context Compaction in Autonomous Coding Agents: Empirical Benchmark & Academic Preprint (GAIA-TR-2026-09-02)",
  description:
    "Formal academic preprint: Empirical study across 37 live agent sessions and 8 autocompaction thresholds on Gemini 3.8 Flash. Pareto frontier, prompt-cache amplification, reacquisition thrashing, and super-linear reasoning scaling.",
  authors: [
    { name: novaAuthor.display_name, url: novaAuthor.links.github },
    { name: marcusAuthor.display_name, url: marcusAuthor.links.github },
  ],
};

export const dynamic = "force-static";
export const revalidate = false;

function cleanMarkdown(raw: string) {
  // If there is an Abstract block, start from the Abstract block to avoid duplicating the header masthead
  const abstractIndex = raw.indexOf("> ### Abstract");
  const content = abstractIndex !== -1 ? raw.slice(abstractIndex) : raw;
  return content
    .split("\n")
    .filter((line: string) => !line.startsWith("# ") && !line.trim().startsWith("<!--"))
    .join("\n")
    .replace(/(?<![\$\\])\$(?=\d)/g, "\\$")
    .trim();
}

export default function ContextCompactionPhase2Page() {
  const cleanMethodology = cleanMarkdown(methodologyMd);
  const cleanReceipts = cleanMarkdown(receiptsMd);

  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page">
        {/* ── Prominent Academic Preprint Masthead ── */}
        <header className="latex-preprint-header">
          <div className="latex-preprint-banner">
            <span className="latex-preprint-org">GAIA RESEARCH LABORATORY · TECHNICAL REPORT</span>
            <span className="latex-preprint-id">GAIA-TR-2026-09-02</span>
            <span className="latex-preprint-date">SEPTEMBER 2026</span>
          </div>

          <h1 className="latex-paper-title">
            Empirical Context Compaction in Autonomous Coding Agents:
            <br />
            Architectural Dynamics, Cache Economics, and the Pareto Frontier
          </h1>

          <div className="latex-author-block">
            <div className="latex-author-item">
              <span className="latex-author-name">
                <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
                  {novaAuthor.display_name}
                </a>
              </span>
              <span className="latex-author-role">Head Researcher</span>
              <span className="latex-author-affil">Gaia Research</span>
            </div>
            <div className="latex-author-item">
              <span className="latex-author-name">
                <a href={marcusAuthor.links.github} target="_blank" rel="noreferrer">
                  {marcusAuthor.display_name}
                </a>
              </span>
              <span className="latex-author-role">Founder</span>
              <span className="latex-author-affil">Gaia Research</span>
            </div>
          </div>

          <p className="latex-paper-institution">
            Gaia Research Laboratory · Technical Report GAIA-TR-2026-09-02
          </p>

          <div className="latex-metadata-grid">
            <div className="latex-metadata-item">
              <span className="latex-metadata-label">Report Identifier</span>
              <span className="latex-metadata-value"><code>GAIA-TR-2026-09-02</code></span>
            </div>
            <div className="latex-metadata-item">
              <span className="latex-metadata-label">Target Architecture</span>
              <span className="latex-metadata-value">Gemini 3.8 Flash (<code>:high</code>)</span>
            </div>
            <div className="latex-metadata-item">
              <span className="latex-metadata-label">Empirical Scale</span>
              <span className="latex-metadata-value">37 Live Agent Runs</span>
            </div>
            <div className="latex-metadata-item">
              <span className="latex-metadata-label">Pricing Topology</span>
              <span className="latex-metadata-value">Flat 1M / 10× Cache Discount</span>
            </div>
            <div className="latex-metadata-item">
              <span className="latex-metadata-label">Peer Verification</span>
              <span className="latex-metadata-value"><span className="chip vrf">VRF · EMPIRICALLY VERIFIED</span></span>
            </div>
          </div>

          <nav className="latex-paper-links" aria-label="Preprint references and links">
            <Link href="/blog/context-compaction-phase-2">Read Executive Blog Post →</Link>
            <Link href="/research">← Back to Research Ledger</Link>
            <a
              href="https://github.com/gaia-research/gaia-research/issues/222"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Issue #222 ↗
            </a>
            <a
              href="https://github.com/gaia-research/gaia-research/pull/237"
              target="_blank"
              rel="noreferrer"
            >
              Benchmark PR #237 ↗
            </a>
            <a
              href="https://github.com/gaia-research/gaia-research/blob/main/scripts/compaction-bench/data/summary/consolidated-receipts.json"
              target="_blank"
              rel="noreferrer"
            >
              Consolidated Receipts JSON ↗
            </a>
          </nav>
        </header>

        <ContextCompactionBenchClient
          methodology={cleanMethodology}
          receipts={cleanReceipts}
        />

        <section className="report-directives section-shell" aria-labelledby="reproduce-title">
          <header className="report-directives-intro">
            <p className="signal"><span /> REPRODUCIBILITY</p>
            <h2 id="reproduce-title">Reproduce from the repo.</h2>
            <p>
              All benchmark harnesses, sandbox configurations, session traces, and analysis scripts are committed in-tree under <code>scripts/compaction-bench/</code>.
            </p>
          </header>
          <div className="cost-terminal-output" style={{ margin: "24px 0" }}>
            <pre><code>{`# Execute benchmark matrix runner across all 8 compaction arms
python3 scripts/compaction-bench/runner.py --scenario all

# Recompute consolidated receipts and verify billing against LiteLLM v3216
npx tsx scripts/compaction-bench/analyze.ts

# Run post-hoc architectural quality & negative constraint audit
python3 scripts/compaction-bench/analyze_quality.py`}</code></pre>
          </div>
        </section>

        <footer className="report-foot">
          <p>
            Context Compaction Phase 2 is an empirical benchmark by Gaia Research evaluating autocompaction thresholds on Google Gemini 3.8 Flash. All session traces and billing ledger records are publicly auditable.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
            <Link className="button primary" href="/blog/context-compaction-phase-2">
              Read the Blog Post <span>→</span>
            </Link>
            <Link className="button secondary" href="/research">
              Back to Research Ledger <span>→</span>
            </Link>
          </div>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
