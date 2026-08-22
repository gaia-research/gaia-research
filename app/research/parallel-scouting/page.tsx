import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import marcusAuthor from "@/content/authors/marcus.json";
import novaAuthor from "@/content/authors/nova.json";
// loaded as raw text by webpack asset/source
import reportMd from "@/content/reports/parallel-scouting-economics.md";

export const metadata = {
  title: "Parallel Cheap-Scout Fan-Out: Cost-Performance Pareto Frontier",
  description:
    "Empirical study of parallel cheap-scout fan-out vs single mid-tier scouts: Pareto frontier, prompt-cache amplification, and flake rate reduction across 360 runs.",
  authors: [
    { name: marcusAuthor.display_name, url: marcusAuthor.links.github },
    { name: novaAuthor.display_name, url: novaAuthor.links.github },
  ],
};

export const dynamic = "force-static";
export const revalidate = false;

function loadReport() {
  return reportMd
    .split("\n")
    .filter((line: string) => !line.startsWith("# ") && !line.trim().startsWith("<!--"))
    .join("\n")
    .trim();
}

export default function ParallelScoutingResearchPage() {
  const body = loadReport();
  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · RECEIPT · BENCHMARK</p>
          <h1>Parallel Cheap-Scout<br />Fan-Out Benchmark</h1>
          <p className="report-sub">
            Can $K$ parallel ultra-cheap scouts match or beat a single expensive scout? An empirical study of cost, recall, and prompt-cache amplification.
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
            <div><dt>Origin</dt><dd>Gaia Research · Issue #174</dd></div>
            <div><dt>Evaluator</dt><dd>Claude Opus 4.6 (Minimal effort)</dd></div>
            <div><dt>Runs</dt><dd>360 evaluated runs (9 tasks × 8 configs × 5 repeats)</dd></div>
            <div><dt>Status</dt><dd><span className="chip vrf">VRF · EMPIRICALLY VERIFIED</span></dd></div>
          </dl>
          <div className="report-links">
            <Link href="/blog/parallel-cheap-scouting-frontier">Read the blog post →</Link>
            <a
              href="https://github.com/gaia-research/gaia-research/blob/main/scripts/scout-bench/data/ledger.jsonl"
              target="_blank"
              rel="noreferrer"
            >
              Committed ledger.jsonl ↗
            </a>
            <a
              href="https://github.com/gaia-research/gaia-research/issues/174"
              target="_blank"
              rel="noreferrer"
            >
              Issue #174 ↗
            </a>
            <a
              href="https://github.com/gaia-research/gaia-research/issues/178"
              target="_blank"
              rel="noreferrer"
            >
              Follow-up Issue #178 ↗
            </a>
          </div>
        </header>

        <article className="report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              table: ({ children }) => (
                <div className="table-scroll-container">
                  <table className="report-table">{children}</table>
                </div>
              ),
            }}
          >
            {body}
          </Markdown>

          {/* Orchestrator Reading Overhead Tradeoff Diagram */}
          <div style={{ margin: "40px 0", background: "#0b0f19", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#f8fafc", fontSize: "1.2rem", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
              Figure 1: Orchestrator Ingestion Overhead vs. Recall Retention
            </h3>
            <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "0.9rem" }}>
              Lead orchestrator context reading costs across 360 benchmark runs. Bounded RRF aggregation eliminates 72.4% of context overhead.
            </p>
            <div style={{ overflowX: "auto", width: "100%" }}>
              <img
                src="/assets/orchestrator-reading-cost-tradeoff.svg"
                alt="Orchestrator Context Reading Overhead vs. Recall Retention"
                style={{ width: "100%", minWidth: "540px", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </article>

        <section className="report-directives section-shell" aria-labelledby="reproduce-title">
          <header className="report-directives-intro">
            <p className="signal"><span /> REPRODUCIBILITY</p>
            <h2 id="reproduce-title">Reproduce from the repo.</h2>
            <p>All fixtures, ground truth candidates, and ledger appenders are committed in tree.</p>
          </header>
          <div className="cost-terminal-output" style={{ margin: "24px 0" }}>
            <pre><code>{`# Validate complete 360-record dataset
npx tsx scripts/scout-bench/ledger.ts validate

# Compute aggregate metrics table
npx tsx scripts/scout-bench/analysis/summary.ts

# Compute Pareto optimal points and export SVG chart
npx tsx scripts/scout-bench/analysis/pareto.ts --svg scripts/scout-bench/data/pareto-frontier.svg`}</code></pre>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
