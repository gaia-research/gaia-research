import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import CopyCommand from "@/components/CopyCommand";
import { TriggerAccuracyChart, RetirementCurveChart } from "@/components/SkillEvalCharts";
import postMd from "@/content/reports/skill-evals/post.md";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata = {
  title: "Don't Ship Skills Without Evals — Marcus Tiongson | Gaia Research",
  description:
    "A Gaia Research analysis by Marcus Tiongson referencing DeepMind Staff Engineer Philipp Schmid's talk on agent skill reliability, progressive disclosure, no-op purging, and continuous ablation testing.",
};

function loadPost() {
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function SkillEvalsReportPage() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="report-page report-page-quieter max-w-4xl mx-auto px-4 py-8">
        <header className="report-head border-b border-slate-800/60 pb-8 mb-8">
          <p className="signal text-xs font-semibold tracking-wider text-pink-400 uppercase mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            RESEARCH · GAIA EDUCATION
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100 my-3">
            Don't Ship Skills Without Evals
          </h1>
          <p className="report-sub text-lg text-slate-400 font-normal max-w-2xl">
            Why 50,000+ AI agent skills fail in silence—and how to build evidence-first skill harnesses.
          </p>
          <dl className="report-meta flex flex-wrap gap-6 text-sm text-slate-400 mt-6 pt-4 border-t border-slate-800/40">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">Author</dt>
              <dd className="font-medium text-pink-400">Marcus Tiongson · Gaia Research</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">Reference</dt>
              <dd className="font-medium text-slate-300">Philipp Schmid (Google DeepMind)</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">Status</dt>
              <dd><span className="chip vrf">PLN PLANNED</span></dd>
            </div>
          </dl>
        </header>

        <article className="report-body prose prose-invert prose-slate max-w-3xl leading-relaxed">
          <Markdown 
            remarkPlugins={[remarkGfm]}
            components={{
              div: ({ node, className, children, ...props }) => {
                if (className?.includes("video-embed-container")) {
                  return (
                    <div className="my-8 aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
                      {children}
                    </div>
                  );
                }
                return <div className={className} {...props}>{children}</div>;
              },
              iframe: ({ node, ...props }) => (
                <iframe className="w-full h-full border-0" {...props} />
              ),
              p: ({ node, children, ...props }) => {
                const text = typeof children === "string" ? children : "";
                if (text.includes("[CHART_TRIGGER_ACCURACY]")) {
                  return <TriggerAccuracyChart />;
                }
                if (text.includes("[CHART_RETIREMENT_CURVE]")) {
                  return <RetirementCurveChart />;
                }
                if (text.includes("[IMAGE_PLACEHOLDER_SKILL_ARCH]")) {
                  return (
                    <div className="my-10 p-8 rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/50 text-center">
                      <div className="text-3xl mb-2">🎨</div>
                      <p className="font-semibold text-slate-200">[IMAGE PLACEHOLDER: Skill Eval Architecture & Lifecycle Diagram]</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Visual flowchart illustrating prompt inputs → isolated sandboxed evaluation → regex/LLM assertions → ablation score report → retirement check.
                      </p>
                    </div>
                  );
                }
                return <p className="mb-4 text-slate-300 text-base" {...props}>{children}</p>;
              }
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="report-foot mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Validate local benchmark submission JSONs with the repo ingest script:</p>
            <CopyCommand className="report-install mt-2" command={`npx tsx scripts/validate-submissions.ts content/templates/gsb-submission.json`} />
          </div>
          <Link className="button secondary text-sm px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors" href="/research">
            Back to research <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
