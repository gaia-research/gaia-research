import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyCommand from "@/components/CopyCommand";
import ReportCharts from "@/components/ReportCharts";
import { installCmd, repoUrl, treeUrl } from "@/data/research";
// loaded as raw text by webpack asset/source
import postmortemMd from "@/content/reports/ci-churn/postmortem.md";

// This page must be rendered while the Markdown source is available at build
// time. Cloudflare Workers cannot read the deployed filesystem at request time.
export const dynamic = "force-static";
export const revalidate = false;

export const metadata = {
  title: "The Compounding Cost of CI Failures",
  description:
    "A postmortem of Epic #780 introducing CI Churn — a failure mode that is structurally more damaging when the development actor is a walled autonomous agent than a human engineer.",
};

const GIST_URL =
  "https://gist.github.com/mbtiongson1/a77f8089b1e72f1ac4c537b64f111cdf";
const SKILL_SLUG = "skill-ci-churn";

// The postmortem is authored markdown committed alongside the site. Read it at
// build time (this is a static, server-rendered route) and drop the first two
// lines — the H1 title and the H2 subtitle are rendered by the page header
// below, so we don't want react-markdown to repeat them.
function loadPostmortem() {
  return postmortemMd.split("\n").slice(2).join("\n").trim();
}

export default function CiChurnReportPage() {
  const body = loadPostmortem();
  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · POSTMORTEM</p>
          <h1>The Compounding Cost of<br />CI Failures in Walled Agent Systems</h1>
          <p className="report-sub">A postmortem of Epic #780 — Codebase Modernization.</p>
          <dl className="report-meta">
            <div><dt>Origin</dt><dd>Gaia Skill Tree · Sessions 17–19</dd></div>
            <div><dt>Skill</dt><dd><Link href="/#skills">ci-churn</Link></dd></div>
            <div><dt>Status</dt><dd><span className="chip vrf">VRF VERIFIED</span></dd></div>
          </dl>
          <div className="report-links">
            <a href={GIST_URL} target="_blank" rel="noreferrer">Source gist ↗</a>
            <a href={repoUrl(SKILL_SLUG)} target="_blank" rel="noreferrer">Skill repo ↗</a>
            <a href={treeUrl(SKILL_SLUG)} target="_blank" rel="noreferrer">In the Skill Tree ↗</a>
          </div>
        </header>

        <ReportCharts />

        <article className="report-body">
          <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
        </article>

        <footer className="report-foot">
          <p>This postmortem is the research behind the <Link href="/#skills">ci-churn</Link> skill. Install it with the Gaia CLI:</p>
          <CopyCommand className="report-install" command={installCmd(SKILL_SLUG)} />
          <Link className="button secondary" href="/#ledger">Back to the ledger <span>→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
