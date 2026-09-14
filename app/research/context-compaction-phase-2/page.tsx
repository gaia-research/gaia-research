import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import marcusAuthor from "@/content/authors/marcus.json";
import novaAuthor from "@/content/authors/nova.json";
import ContextCompactionBenchClient from "@/components/ContextCompactionBenchClient";
// loaded as raw text by webpack asset/source
import methodologyMd from "@/content/reports/context-compaction-phase-2/methodology.md";
import receiptsMd from "@/content/reports/context-compaction-phase-2/receipts.md";

export const metadata = {
  title: "Context Compaction in Autonomous Coding Agents: Empirical Benchmark (GAIA-TR-2026-09-02) | Gaia Research",
  description:
    "Empirical study of autocompaction in coding agents across 37 live developer sessions on Gemini 3.8 Flash. Pareto frontier, prompt cache economics, reacquisition thrashing, and super-linear reasoning scaling.",
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
        {/* ── Canonical Gaia Research Masthead ── */}
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · RECEIPT · BENCHMARK</p>
          <h1>Empirical Context Compaction<br />in Autonomous Coding Agents</h1>
          <p className="report-sub">
            Architectural dynamics, cache economics, and the Pareto frontier: an empirical evaluation of 37 live sessions across 8 autocompaction thresholds on Gemini 3.8 Flash.
          </p>
          <dl className="report-meta">
            <div>
              <dt>Authors</dt>
              <dd>
                <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
                  {novaAuthor.display_name}
                </a>{" "}
                &amp;{" "}
                <a href={marcusAuthor.links.github} target="_blank" rel="noreferrer">
                  {marcusAuthor.display_name}
                </a>
              </dd>
            </div>
            <div><dt>Report ID</dt><dd><code>GAIA-TR-2026-09-02</code></dd></div>
            <div><dt>Origin</dt><dd>Gaia Research · Issue #222</dd></div>
            <div><dt>Target Architecture</dt><dd>Gemini 3.8 Flash (<code>:high</code>)</dd></div>
            <div><dt>Empirical Scale</dt><dd>37 evaluated sessions across 6 scenarios</dd></div>
            <div><dt>Verification</dt><dd><span className="chip vrf">VRF · EMPIRICALLY VERIFIED</span></dd></div>
          </dl>
          <div className="report-links">
            <Link href="/blog/context-compaction-phase-2">Read Executive Blog Post →</Link>
            <Link href="/research">← Back to Research Ledger</Link>
            <a
              href="/reports/context-compaction-phase-2/gaia-tr-2026-09-02.pdf"
              download="GAIA-TR-2026-09-02-Context-Compaction.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Download PDF ↓
            </a>
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
          </div>
        </header>

        <ContextCompactionBenchClient
          methodology={cleanMethodology}
          receipts={cleanReceipts}
        />
      </main>
      <SiteFooter />
    </>
  );
}
