import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
// loaded as raw text by webpack asset/source
import claimIndexMd from "@/content/reports/hh-benchmark/claim-index.md";

export const metadata = {
  title: "Claim index — every public Arc I number and the record behind it",
  description:
    "Every public Skill Heaven / Hell claim, listed with the committed record it traces to: a ledger line, a census field, a harness-probe run record — or an explicit uncommitted / not-probed marker. An index, not a measurement.",
};

// Render while the Markdown source is present at build time; Cloudflare Workers
// cannot read the deployed filesystem during a request.
export const dynamic = "force-static";
export const revalidate = false;

// Strip the H1 (the page header renders its own) and every HTML-comment line —
// which conveniently also hides the ledger-claims fences the gate reads.
function loadClaimIndex() {
  return claimIndexMd
    .split("\n")
    .filter((line: string) => !line.startsWith("# ") && !line.trim().startsWith("<!--"))
    .join("\n")
    .trim();
}

export default function HhBenchmarkClaimsPage() {
  const body = loadClaimIndex();
  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · LEDGER · CLAIM INDEX</p>
          <h1>Claim index</h1>
          <p className="report-sub">
            Every public number we have shipped, and the committed record it traces to &mdash;
            or an explicit mark saying it traces to none.
          </p>
          <dl className="report-meta">
            <div><dt>Binds</dt><dd>B4 &middot; no claim ships ahead of its benchmark</dd></div>
            <div><dt>Scope</dt><dd>Arc I &middot; Skill Heaven / Hell</dd></div>
            <div><dt>Status</dt><dd><span className="chip">MACHINE-GATED</span></dd></div>
          </dl>
          <div className="report-links">
            <Link href="/research/hh-benchmark">The method &rarr;</Link>
            <a href="https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/data/ledger.jsonl" target="_blank" rel="noreferrer">The ledger ↗</a>
            <a href="https://github.com/gaia-research/gaia-research/blob/main/scripts/hell-heaven-bench/check-claims.ts" target="_blank" rel="noreferrer">The gate ↗</a>
          </div>
        </header>

        <article className="report-body">
          <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
        </article>

        <footer className="report-foot">
          <p>A declared gap is first-class evidence. A silent one is a defect.</p>
          <Link className="button secondary" href="/research/hh-benchmark">Back to the method <span>→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
