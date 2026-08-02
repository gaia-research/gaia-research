import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ClaimIndexFigures from "@/components/ClaimIndexFigures";
import ClaimIndexClient from "@/components/ClaimIndexClient";
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

function parseClaimIndex(md: string) {
  // Extract reference links defined at the end of claim-index.md
  const linksMatch = md.match(/(\n\[[^\]]+\]:\s*https?:[\s\S]*)/);
  const linksBlock = linksMatch ? linksMatch[1] : "";

  const cleanLines = md
    .split("\n")
    .filter((line: string) => !line.startsWith("# ") && !line.trim().startsWith("<!--"));
  const cleanMd = cleanLines.join("\n");

  const whatAndWhyMatch = cleanMd.match(/> \*\*What this page is\.\*\*[\s\S]*?(?=\n## The three evidence classes|$)/);
  const methodMatch = cleanMd.match(/## The three evidence classes[\s\S]*?(?=\n## A —|$)/);
  const secAMatch = cleanMd.match(/## A — the live site[\s\S]*?(?=\n## B —|$)/);
  const secBMatch = cleanMd.match(/## B — gaia-research markdown[\s\S]*?(?=\n## C —|$)/);
  const secCMatch = cleanMd.match(/## C — the `skill-heaven` repo[\s\S]*?(?=\n## D —|$)/);
  const secDMatch = cleanMd.match(/## D — the KC9 three-minute demo[\s\S]*?(?=\n## What this index|$)/);
  const settleMatch = cleanMd.match(/## What this index does and does not settle[\s\S]*/);

  const withLinks = (text: string) => (text ? `${text.trim()}\n\n${linksBlock}` : "");

  return {
    whatAndWhy: withLinks(whatAndWhyMatch ? whatAndWhyMatch[0] : ""),
    method: withLinks(methodMatch ? methodMatch[0] : ""),
    secA: withLinks(secAMatch ? secAMatch[0] : ""),
    secB: withLinks(secBMatch ? secBMatch[0] : ""),
    secC: withLinks(secCMatch ? secCMatch[0] : ""),
    secD: withLinks(secDMatch ? secDMatch[0] : ""),
    settle: withLinks(settleMatch ? settleMatch[0] : ""),
  };
}

export default function HhBenchmarkClaimsPage() {
  const sections = parseClaimIndex(claimIndexMd);

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

        <ClaimIndexFigures />

        <article className="report-body claim-body">
          <ClaimIndexClient sections={sections} />
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
