import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
// loaded as raw text by webpack asset/source
import demoMd from "@/content/reports/hh-benchmark/kc9-three-minute-demo.md";

export const metadata = {
  title: "KC9 — the three-minute demo",
  description:
    "One task, three loadouts, one objective endpoint: vanilla Claude Code, the doorless floor, and a curated single-skill launch. A live measured run — every load-bearing number is a committed benchmark record, every uncommitted one is marked.",
};

// Render while the Markdown source is present at build time; Cloudflare Workers
// cannot read the deployed filesystem during a request.
export const dynamic = "force-static";
export const revalidate = false;

function loadDemo() {
  return demoMd
    .split("\n")
    .filter((line: string) => !line.startsWith("# ") && !line.trim().startsWith("<!--"))
    .join("\n")
    .trim();
}

export default function HhBenchmarkDemoPage() {
  const body = loadDemo();
  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · DEMO · MEASURED</p>
          <h1>The three-minute<br />demo</h1>
          <p className="report-sub">
            One task, three loadouts, one endpoint. Native pays the most and cannot answer;
            the floor pays the least and cannot answer; one curated skill answers.
          </p>
          <dl className="report-meta">
            <div><dt>Harness</dt><dd>Claude Code 2.1.220 · sonnet</dd></div>
            <div><dt>Run</dt><dd>2026-07-30 · one repeat</dd></div>
            <div><dt>Status</dt><dd><span className="chip wip">SMOKE EVIDENCE · NOT A BENCHMARK ARM</span></dd></div>
          </dl>
          <div className="report-links">
            <a href="/reports/hh-benchmark/kc9-demo-replay.html">Replay the run ↗</a>
            <a href="https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/demo-kc9-live.sh" target="_blank" rel="noreferrer">Demo runner ↗</a>
            <a href="https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl" target="_blank" rel="noreferrer">Ledger ↗</a>
          </div>
        </header>

        <article className="report-body">
          <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{body}</Markdown>
        </article>

        <footer className="report-foot">
          <p>
            Every load-bearing figure on this page is a committed <code>hh-ledger/v1</code> record.
            Figures marked ‡ are real workstation measurements whose artifact was never committed —
            they corroborate and are never load-bearing.
          </p>
          <Link className="button secondary" href="/research/hh-benchmark">Back to the method <span>→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
