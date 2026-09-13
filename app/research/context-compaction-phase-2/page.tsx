import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import marcusAuthor from "@/content/authors/marcus.json";
import novaAuthor from "@/content/authors/nova.json";
import ContextCompactionBenchClient from "@/components/ContextCompactionBenchClient";
// loaded as raw text by webpack asset/source
import methodologyMd from "@/content/reports/context-compaction-phase-2/methodology.md";
import receiptsMd from "@/content/reports/context-compaction-phase-2/receipts.md";

export const metadata = {
  title: "Context Compaction Phase 2 Empirical Benchmark",
  description:
    "Empirical study across 37 live agent sessions (25 across S1/S2/S4/S6 + 12 across S3) and 8 autocompaction thresholds on Gemini 3.8 Flash: Pareto frontier, prompt-cache amplification, reacquisition thrashing, and super-linear reasoning scaling.",
  authors: [
    { name: marcusAuthor.display_name, url: marcusAuthor.links.github },
    { name: novaAuthor.display_name, url: novaAuthor.links.github },
  ],
};

export const dynamic = "force-static";
export const revalidate = false;

function cleanMarkdown(raw: string) {
  return raw
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
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · RECEIPT · BENCHMARK</p>
          <h1>Context Compaction<br />Empirical Benchmark</h1>
          <p className="report-sub">
            Empirical study across 37 live agent sessions (25 across S1/S2/S4/S6 + 12 across S3) and 8 autocompaction thresholds on Gemini 3.8 Flash: Pareto frontier, prompt-cache amplification, reacquisition thrashing, and super-linear reasoning scaling.
          </p>
          <dl className="report-meta">
            <div>
              <dt>Authors</dt>
              <dd>
                <a href={marcusAuthor.links.github} target="_blank" rel="noreferrer">
                  {marcusAuthor.display_name}
                </a>{" "}
                &amp;{" "}
                <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
                  {novaAuthor.display_name}
                </a>
              </dd>
            </div>
            <div><dt>Origin</dt><dd>Gaia Research · Issue #222</dd></div>
            <div><dt>Model</dt><dd>Gemini 3.8 Flash (<code>:high</code>)</dd></div>
            <div><dt>Runs</dt><dd>37 live sessions (25 across S1/S2/S4/S6 + 12 across S3)</dd></div>
            <div><dt>Status</dt><dd><span className="chip vrf">VRF · EMPIRICALLY VERIFIED</span></dd></div>
          </dl>
          <div className="report-links">
            <Link href="/blog/context-compaction-phase-2">Read the blog post →</Link>
            <Link href="/research">← Back to Research</Link>
            <a
              href="https://github.com/gaia-research/gaia-research/issues/222"
              target="_blank"
              rel="noreferrer"
            >
              Issue #222 ↗
            </a>
            <a
              href="https://github.com/gaia-research/gaia-research/pull/237"
              target="_blank"
              rel="noreferrer"
            >
              PR #237 ↗
            </a>
            <a
              href="https://github.com/gaia-research/gaia-research/blob/main/scripts/compaction-bench/data/summary/consolidated-receipts.json"
              target="_blank"
              rel="noreferrer"
            >
              Consolidated Receipts JSON ↗
            </a>
          </div>
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
