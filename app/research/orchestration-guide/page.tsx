import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyPage from "@/components/CopyPage";
// loaded as raw text by webpack asset/source
import guideMd from "@/content/reports/orchestration-guide/guide.md";

// This page must be rendered while the Markdown source is available at build
// time. Cloudflare Workers cannot read the deployed filesystem at request time.
export const dynamic = "force-static";
export const revalidate = false;

export const metadata = {
  title: "The Orchestration Guide",
  description:
    "A step-by-step, plain-English guide to running multi-agent orchestration without burning your budget on cold-cache wakeups. Experience-based and unverified.",
};

// The guide is authored markdown committed alongside the site. Drop the first
// two lines — the H1 title and the H2 subtitle are rendered by the page header
// below, so we don't want react-markdown to repeat them.
function loadGuide() {
  return guideMd.split("\n").slice(2).join("\n").trim();
}

export default function OrchestrationGuidePage() {
  const body = loadGuide();
  return (
    <>
      <SiteHeader />
      <aside className="wip-banner" aria-label="Orchestration Guide status">
        <div>
          <span className="wip-tag">WIP · Unverified</span>
          <p>
            Written from hands-on orchestration sessions, not a controlled study. Pricing and cache
            mechanics are sourced; the advice is judgement. Treat it as a strong prior, not a finding.
          </p>
          <Link href="/blog/orchestrator-tax-cold-cache">Read the cost field note ↗</Link>
        </div>
      </aside>
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · GUIDE</p>
          <h1>The Orchestration<br />Guide</h1>
          <p className="report-sub">
            How to run more than one agent without setting money on fire.
          </p>
          <dl className="report-meta">
            <div><dt>Origin</dt><dd>Gaia Research · Practitioner notes</dd></div>
            <div><dt>Basis</dt><dd>Experience — no control study</dd></div>
            <div><dt>Status</dt><dd><span className="chip wip">WIP EXPERIMENTAL</span></dd></div>
          </dl>
          <div className="report-links">
            <Link href="/blog/orchestrator-tax-cold-cache">The cost field note →</Link>
            <Link href="/research/context-compaction-phase-2">Compaction benchmark →</Link>
          </div>

          <CopyPage
            markdown={guideMd}
            label="Copy this page as Markdown"
            copiedLabel="Copied — now paste it into your agent"
            hint="Take it. Paste the whole guide into Claude Code, pi, Codex, or Cursor and say “turn this into a skill I can run.” You know your stack and your budget better than we do — the version you build for yourself will beat ours. If it works, tell us what you changed."
          />
        </header>

        <article className="report-body">
          <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{body}</Markdown>
        </article>

        <footer className="report-foot">
          <p>
            The cost arithmetic behind this guide — rate cards, the 12.5× cold/warm gap, and the
            worked eight-dispatch table — is in the field note{" "}
            <Link href="/blog/orchestrator-tax-cold-cache">
              Why Your Multi-Agent Setup Costs More Than a Single Heavy Agent
            </Link>
            .
          </p>
          <Link className="button secondary" href="/research">Back to the ledger <span>→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
