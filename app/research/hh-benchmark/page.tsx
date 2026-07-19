import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
// @ts-expect-error - loaded as raw text by webpack asset/source
import methodologyMd from "@/content/reports/hh-benchmark/methodology.md";

export const metadata = {
  title: "The Hell Heaven Benchmark — Methodology",
  description:
    "How Gaia Research plans to benchmark agent skills: marginal efficacy against established model baselines, a heaven/hell trial split, and stamps earned by the trial. Draft method, not yet executed. Help wanted.",
};

// Render while the Markdown source is present at build time; Cloudflare Workers
// cannot read the deployed filesystem during a request.
export const dynamic = "force-static";
export const revalidate = false;

function loadMethodology() {
  return methodologyMd
    .split("\n")
    .filter((line: string) => !line.startsWith("# ") && !line.trim().startsWith("<!--"))
    .join("\n")
    .trim();
}

export default function HhBenchmarkPage() {
  const body = loadMethodology();
  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · METHOD · WIP</p>
          <h1>The Hell Heaven<br />Benchmark</h1>
          <p className="report-sub">
            How do you benchmark a <em>skill</em>? A drug-trial method, drafted in public &mdash;
            receipts before results.
          </p>
          <dl className="report-meta">
            <div><dt>Origin</dt><dd>Gaia Research · Open method</dd></div>
            <div><dt>Scope</dt><dd>v1 marginal efficacy</dd></div>
            <div><dt>Status</dt><dd><span className="chip wip">WIP · NOT YET EXECUTED</span></dd></div>
          </dl>
          <div className="report-links">
            <a href="https://github.com/gaia-research/gaia-research/blob/main/VISION.md" target="_blank" rel="noreferrer">Vision ↗</a>
            <a href="https://github.com/gaia-research/gaia-research/blob/main/MISSION.md" target="_blank" rel="noreferrer">Mission ↗</a>
            <a href="https://github.com/gaia-research/gaia-research/issues/62" target="_blank" rel="noreferrer">Help wanted ↗</a>
          </div>
        </header>

        <article className="report-body">
          <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
        </article>

        <footer className="report-foot">
          <p>This method is a draft, published before execution. If you benchmark models or skills, come build it with us.</p>
          <Link className="button secondary" href="/#skill-heaven-hell">Back to Skill Heaven/Hell <span>→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
