import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyCommand from "@/components/CopyCommand";
import { installCmd, repoUrl, treeUrl } from "@/data/research";

export const metadata = {
  title: "When Agents Report Their Own Cost",
  description:
    "A Gaia Research plan to measure the gap between agent cost estimates, rate-card totals, and invoices.",
};

// Render while Markdown sources are present at build time; Cloudflare Workers
// cannot read the deployed filesystem during a request.
export const dynamic = "force-static";
export const revalidate = false;

const SKILL_SLUG = "skill-cost";

function loadResearchPlan() {
  const file = path.join(process.cwd(), "content/reports/cost/research-plan.md");
  const raw = fs.readFileSync(file, "utf8");
  return raw.split("\n").slice(2).join("\n").trim();
}

export default function CostResearchPage() {
  const body = loadResearchPlan();
  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page">
        <header className="report-head">
          <p className="signal"><span /> RESEARCH · PLAN</p>
          <h1>When Agents Report<br />Their Own Cost</h1>
          <p className="report-sub">A planned study of the gap between self-estimates, rate-card totals, and invoices.</p>
          <dl className="report-meta">
            <div><dt>Origin</dt><dd>Gaia Research · Open study</dd></div>
            <div><dt>Skill</dt><dd><Link href="/#skills">cost</Link></dd></div>
            <div><dt>Status</dt><dd><span className="chip prp">PRP PROPOSED</span></dd></div>
          </dl>
          <div className="report-links">
            <a href={repoUrl(SKILL_SLUG)} target="_blank" rel="noreferrer">Skill repo ↗</a>
            <a href={treeUrl(SKILL_SLUG)} target="_blank" rel="noreferrer">In the Skill Tree ↗</a>
          </div>
        </header>

        <section className="cost-terminal" aria-labelledby="cost-terminal-title">
          <div className="cost-terminal-head">
            <div>
              <p className="signal"><span /> SIMULATED LOCAL RUN</p>
              <h2 id="cost-terminal-title">Trace the tokens. Price every turn.</h2>
            </div>
            <span className="cost-terminal-badge">EXAMPLE DATA</span>
          </div>
          <p>
            A documented `cost` run reads a local JSONL session, includes cache reads and writes,
            and recomputes USD from the pinned LiteLLM rate card. Nothing is executed or uploaded
            from this page.
          </p>
          <div className="cost-terminal-output">
            <pre><code>{`$ /cost --latest --offline

-- pi  019f4e66-4216-74cc-834b-6633b275a278
   cwd:    C:\\Users\\me\\projects\\web
   time:   2026-07-10T23:39:12.278Z  ->  2026-07-10T23:57:10.128Z
   tokens: in=3,552 out=19,986 cache_r=843,710 cache_w=72,737 total=939,985
   cost:   $1.6104

------------------------------------------------------
1 session(s)   tokens=939,985   cost=$1.6104`}</code></pre>
          </div>
          <p className="cost-terminal-note">Example output format and values are drawn from the public `skill-cost` documentation.</p>
        </section>

        <article className="report-body">
          <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
        </article>

        <footer className="report-foot">
          <p>This research plan supports the <Link href="/#skills">cost</Link> skill. Install it with the Gaia CLI:</p>
          <CopyCommand className="report-install" command={installCmd(SKILL_SLUG)} />
          <Link className="button secondary" href="/research">Back to research <span>→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
