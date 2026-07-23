import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import { dailyAgentRadarThumbnail } from "@/data/blog";
import postMd from "@/content/blog/daily-agent-radar-2026-07-24/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/daily-agent-radar-2026-07-24";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${dailyAgentRadarThumbnail.src.src}`;
const articleDescription =
  "SkillOpt applies Zeroth-Order optimization to agent SKILL.md files, replacing manual prompt tuning with evidence-backed evaluation loops. A field note by Gaia Research.";

export const metadata = {
  title: "SkillOpt: Zeroth-Order Parameter Tuning for Agent Skills — Gaia Research",
  description: articleDescription,
  keywords: [
    "SkillOpt",
    "agent skill optimization",
    "SKILL.md",
    "zeroth-order optimization",
    "prompt tuning",
    "agent evaluation",
    "LLM prompt engineering",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: "SkillOpt: Zeroth-Order Parameter Tuning for Agent Skills",
    description: articleDescription,
    publishedTime: "2026-07-24T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{ url: dailyAgentRadarThumbnail.src.src, width: 1600, height: 900, alt: dailyAgentRadarThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillOpt: Zeroth-Order Parameter Tuning for Agent Skills",
    description: articleDescription,
    images: [dailyAgentRadarThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "SkillOpt: Zeroth-Order Parameter Tuning for Agent Skills",
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-07-24T00:00:00+08:00",
  author: {
    "@type": "Person",
    name: novaAuthor.display_name,
    url: novaAuthor.links.github,
  },
  publisher: {
    "@type": "Organization",
    name: "Gaia Research",
    url: siteUrl,
  },
};

function ParameterPerturbationFlowchart() {
  return (
    <figure className="blog-figure my-8 p-6 rounded-xl border border-slate-800 bg-slate-950/80 shadow-lg">
      <figcaption className="text-sm font-semibold text-slate-300 mb-4">
        Figure 1. Zeroth-Order Directive Perturbation & Loss Evaluation Loop
      </figcaption>
      <svg viewBox="0 0 640 180" role="img" aria-label="Zeroth-Order Perturbation Loop" className="w-full h-auto">
        <rect x="20" y="55" width="160" height="70" rx="6" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
        <text x="100" y="86" textAnchor="middle" fill="#f0f1f5" fontSize="12" fontWeight="bold" fontFamily="monospace">Candidate Spec</text>
        <text x="100" y="105" textAnchor="middle" fill="#ec4899" fontSize="11" fontFamily="monospace">θ ± βu</text>

        <path d="M 180,90 L 250,90" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" />

        <rect x="250" y="55" width="170" height="70" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="335" y="86" textAnchor="middle" fill="#f0f1f5" fontSize="12" fontWeight="bold" fontFamily="monospace">Sandboxed Trials</text>
        <text x="335" y="105" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace">N Evaluation Runs</text>

        <path d="M 420,90 L 490,90" stroke="#38bdf8" strokeWidth="2" />

        <rect x="490" y="55" width="130" height="70" rx="6" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="555" y="86" textAnchor="middle" fill="#f0f1f5" fontSize="12" fontWeight="bold" fontFamily="monospace">Loss L(θ)</text>
        <text x="555" y="105" textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace">Gradient Step</text>

        <path d="M 555,125 C 555,165 100,165 100,125" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
      <p className="text-xs text-slate-500 mt-2">
        Iterative feedback loop updating instruction parameter vector θ using scalar loss values L(θ).
      </p>
    </figure>
  );
}

function LossVsPrecisionConvergenceCurve() {
  return (
    <figure className="blog-figure my-8 p-6 rounded-xl border border-slate-800 bg-slate-950/80 shadow-lg">
      <figcaption className="text-sm font-semibold text-slate-300 mb-4">
        Figure 2. Loss L(θ) Reduction vs Precision Improvement (20 Steps)
      </figcaption>
      <svg viewBox="0 0 640 220" role="img" aria-label="SkillOpt Loss Convergence" className="w-full h-auto">
        <line x1="60" y1="30" x2="600" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
        <line x1="60" y1="80" x2="600" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
        <line x1="60" y1="130" x2="600" y2="130" stroke="#1e293b" strokeDasharray="4 4" />
        <line x1="60" y1="180" x2="600" y2="180" stroke="#334155" />
        
        <text x="20" y="34" fill="#64748b" fontSize="11" fontFamily="monospace">1.0 (High Loss)</text>
        <text x="20" y="84" fill="#64748b" fontSize="11" fontFamily="monospace">0.6</text>
        <text x="20" y="134" fill="#64748b" fontSize="11" fontFamily="monospace">0.3</text>
        <text x="20" y="184" fill="#64748b" fontSize="11" fontFamily="monospace">0.0 (Optimal)</text>
        
        <path
          d="M 80,45 C 160,140 220,110 320,145 C 420,158 500,165 580,168"
          fill="none"
          stroke="#ec4899"
          strokeWidth="3"
        />

        <path
          d="M 80,150 C 160,110 220,70 320,55 C 420,42 500,38 580,35"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeDasharray="6 3"
        />

        <circle cx="80" cy="45" r="4" fill="#ec4899" />
        <circle cx="320" cy="145" r="4" fill="#ec4899" />
        <circle cx="580" cy="168" r="5" fill="#ec4899" stroke="#38bdf8" strokeWidth="2" />

        <g transform="translate(420, 70)">
          <rect x="0" y="0" width="160" height="50" rx="4" fill="#0f172a" stroke="#1e293b" />
          <line x1="12" y1="18" x2="35" y2="18" stroke="#ec4899" strokeWidth="3" />
          <text x="42" y="22" fill="#e2e8f0" fontSize="10" fontFamily="monospace">Loss L(θ)</text>

          <line x1="12" y1="34" x2="35" y2="34" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
          <text x="42" y="38" fill="#e2e8f0" fontSize="10" fontFamily="monospace">Precision Score</text>
        </g>
      </svg>
      <p className="text-xs text-slate-500 mt-3">
        Loss score drops from 0.88 to 0.12 while precision converges to 94.8% over 20 Zeroth-Order perturbation steps.
      </p>
    </figure>
  );
}

function loadPost() {
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function BlogPostPage() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page max-w-4xl mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }}
        />
        <header className="blog-post-head border-b border-slate-800/60 pb-8 mb-8">
          <p className="blog-post-meta text-sm text-slate-400 mb-2">
            <time dateTime="2026-07-24">July 24, 2026</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer" className="text-sky-400 font-medium hover:underline">
              {novaAuthor.display_name}
            </a>
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 my-3">
            SkillOpt: Zeroth-Order Parameter Tuning for Agent Skills
          </h1>
          <p className="blog-post-summary text-lg text-slate-400">
            Ever wondered why adding &quot;IMPORTANT&quot; to your SKILL.md file makes the model stray? A field note on SkillOpt.
          </p>
        </header>

        <figure className="blog-post-illustration my-8 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
          <img
            src={dailyAgentRadarThumbnail.src.src}
            width={dailyAgentRadarThumbnail.src.width}
            height={dailyAgentRadarThumbnail.src.height}
            alt={dailyAgentRadarThumbnail.alt}
            className="w-full h-auto object-cover"
          />
        </figure>

        <article className="blog-post-body report-body prose prose-invert prose-slate max-w-3xl leading-relaxed">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children, ...props }) => {
                const text = Array.isArray(children) ? children.join("") : typeof children === "string" ? children : "";
                if (text === "[[PARAMETER_PERTURBATION_FLOWCHART]]") {
                  return <ParameterPerturbationFlowchart />;
                }
                if (text === "[[ZO_OPTIMIZATION_LOOP_GRAPH]]") {
                  return <LossVsPrecisionConvergenceCurve />;
                }
                return <p {...props}>{children}</p>;
              },
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot mt-16 pt-8 border-t border-slate-800">
          <Link href="/blog" className="text-sky-400 font-medium hover:underline flex items-center gap-2">
            ← Back to Blog
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
