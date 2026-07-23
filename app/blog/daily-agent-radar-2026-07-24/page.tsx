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
  "SkillOpt (Microsoft Research, 2026) optimizes agent SKILL.md files automatically: a frozen agent runs tasks, an optimizer model proposes structured edits, and only edits that clear a validation gate land in the skill file.";

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

function YoutubeEmbed() {
  return (
    <figure className="blog-figure my-8 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube-nocookie.com/embed/JUBMDTCiM0M"
          title="SkillOpt — Controllable Text-Space Optimization for Agent Skills"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <figcaption className="text-xs text-slate-500 px-4 py-2">
        Official presentation by Zisu Huang (co-author) — SkillOpt: Controllable Text-Space Optimization for Agent Skills. Microsoft Research, 2026.
      </figcaption>
    </figure>
  );
}

function ParameterPerturbationFlowchart() {
  return (
    <figure className="blog-figure my-8 p-4 sm:p-6 rounded-xl border border-slate-800 bg-slate-950/80 shadow-lg overflow-hidden">
      <figcaption className="text-sm font-semibold text-slate-300 mb-4">
        Figure 1. SkillOpt Optimization Loop: Rollouts → Optimizer Model → Validation Gate
      </figcaption>
      <svg viewBox="0 0 640 180" role="img" aria-label="SkillOpt Optimization Loop" className="w-full h-auto">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" />
          </marker>
        </defs>
        <rect x="20" y="55" width="160" height="70" rx="6" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
        <text x="100" y="86" textAnchor="middle" fill="#f0f1f5" fontSize="13" fontWeight="bold" fontFamily="monospace">Task Rollouts</text>
        <text x="100" y="105" textAnchor="middle" fill="#ec4899" fontSize="11" fontFamily="monospace">pass / fail scored</text>

        <path d="M 180,90 L 250,90" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" />

        <rect x="250" y="55" width="170" height="70" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="335" y="86" textAnchor="middle" fill="#f0f1f5" fontSize="13" fontWeight="bold" fontFamily="monospace">Optimizer Model</text>
        <text x="335" y="105" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace">proposes edits</text>

        <path d="M 420,90 L 490,90" stroke="#38bdf8" strokeWidth="2" />

        <rect x="490" y="55" width="130" height="70" rx="6" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="555" y="86" textAnchor="middle" fill="#f0f1f5" fontSize="13" fontWeight="bold" fontFamily="monospace">Validation</text>
        <text x="555" y="105" textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace">gate: score &gt; cur</text>

        <path d="M 555,125 C 555,165 100,165 100,125" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
      <p className="text-xs text-slate-400 mt-3">
        Frozen agent runs task rollouts. Optimizer model proposes structured edits. Only candidate edits that beat the validation baseline (<code className="text-sky-300">score_candidate &gt; score_current</code>) are written to the skill file.
      </p>
    </figure>
  );
}

function LossVsPrecisionConvergenceCurve() {
  return (
    <figure className="blog-figure my-8 p-4 sm:p-6 rounded-xl border border-slate-800 bg-slate-950/80 shadow-lg overflow-hidden">
      <figcaption className="text-sm font-semibold text-slate-300 mb-2">
        Figure 2. SkillOpt Task Accuracy — Baseline vs. Optimized (GPT-5.5, Direct Chat)
      </figcaption>
      
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono my-3 text-slate-300">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-pink-500/70 inline-block border border-pink-400/80" /> Baseline (Direct Chat)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-sky-400 inline-block border border-sky-300" /> SkillOpt (GPT-5.5)
        </span>
      </div>

      <svg viewBox="0 0 640 225" role="img" aria-label="SkillOpt Benchmark Results" className="w-full h-auto">
        {/* Grid lines */}
        <line x1="60" y1="30" x2="600" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
        <line x1="60" y1="80" x2="600" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
        <line x1="60" y1="130" x2="600" y2="130" stroke="#1e293b" strokeDasharray="4 4" />
        <line x1="60" y1="180" x2="600" y2="180" stroke="#334155" />

        {/* Y-axis labels */}
        <text x="20" y="34" fill="#64748b" fontSize="11" fontFamily="monospace">100%</text>
        <text x="20" y="84" fill="#64748b" fontSize="11" fontFamily="monospace">75%</text>
        <text x="20" y="134" fill="#64748b" fontSize="11" fontFamily="monospace">50%</text>
        <text x="20" y="184" fill="#64748b" fontSize="11" fontFamily="monospace">25%</text>

        {/* Baseline bars (pink) */}
        <rect x="75"  y="155" width="22" height="25" fill="#ec4899" opacity="0.6" rx="2" />
        <rect x="165" y="147" width="22" height="33" fill="#ec4899" opacity="0.6" rx="2" />
        <rect x="255" y="153" width="22" height="27" fill="#ec4899" opacity="0.6" rx="2" />
        <rect x="345" y="113" width="22" height="67" fill="#ec4899" opacity="0.6" rx="2" />
        <rect x="435" y="111" width="22" height="69" fill="#ec4899" opacity="0.6" rx="2" />
        <rect x="525" y="118" width="22" height="62" fill="#ec4899" opacity="0.6" rx="2" />

        {/* Baseline numeric labels */}
        <text x="86"  y="150" textAnchor="middle" fill="#ec4899" fontSize="9.5" fontFamily="monospace">41.8%</text>
        <text x="176" y="142" textAnchor="middle" fill="#ec4899" fontSize="9.5" fontFamily="monospace">33.1%</text>
        <text x="266" y="148" textAnchor="middle" fill="#ec4899" fontSize="9.5" fontFamily="monospace">37.6%</text>
        <text x="356" y="108" textAnchor="middle" fill="#ec4899" fontSize="9.5" fontFamily="monospace">83.6%</text>
        <text x="446" y="106" textAnchor="middle" fill="#ec4899" fontSize="9.5" fontFamily="monospace">78.8%</text>
        <text x="536" y="113" textAnchor="middle" fill="#ec4899" fontSize="9.5" fontFamily="monospace">77.7%</text>

        {/* SkillOpt bars (sky blue) */}
        <rect x="100" y="44"  width="22" height="136" fill="#38bdf8" opacity="0.85" rx="2" />
        <rect x="190" y="38"  width="22" height="142" fill="#38bdf8" opacity="0.85" rx="2" />
        <rect x="280" y="47"  width="22" height="133" fill="#38bdf8" opacity="0.85" rx="2" />
        <rect x="370" y="36"  width="22" height="144" fill="#38bdf8" opacity="0.85" rx="2" />
        <rect x="460" y="34"  width="22" height="146" fill="#38bdf8" opacity="0.85" rx="2" />
        <rect x="550" y="42"  width="22" height="138" fill="#38bdf8" opacity="0.85" rx="2" />

        {/* SkillOpt numeric labels */}
        <text x="111" y="39"  textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">80.7%</text>
        <text x="201" y="33"  textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">72.1%</text>
        <text x="291" y="42"  textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">66.9%</text>
        <text x="381" y="31"  textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">95.5%</text>
        <text x="471" y="29"  textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">91.2%</text>
        <text x="561" y="37"  textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace">87.3%</text>

        {/* X-axis task labels (centered under bar pairs) */}
        <text x="98"  y="202" textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">Spreadsheet</text>
        <text x="188" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">OfficeQA</text>
        <text x="278" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">LiveMath</text>
        <text x="368" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">ALFWorld</text>
        <text x="458" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">DocVQA</text>
        <text x="548" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">SearchQA</text>
      </svg>
      <p className="text-xs text-slate-400 mt-3">
        Real benchmark results from the SkillOpt paper (Yang et al., Microsoft Research, 2026). Average lift of +23.5 points across six tasks in direct-chat mode.
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
            A frozen agent runs tasks. An optimizer model reads what failed. Only edits that beat a validation gate land in the skill file. That&apos;s SkillOpt.
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
              table: ({ children, ...props }) => (
                <div className="overflow-x-auto my-6 border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-sm" {...props}>
                    {children}
                  </table>
                </div>
              ),
              pre: ({ children, ...props }) => (
                <pre className="overflow-x-auto my-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-mono text-slate-200" {...props}>
                  {children}
                </pre>
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote className="border-l-2 border-sky-400 bg-slate-900/50 px-4 py-3 rounded-r-lg my-6 text-slate-300 italic" {...props}>
                  {children}
                </blockquote>
              ),
              code: ({ children, ...props }) => {
                const text = Array.isArray(children) ? children.join("") : typeof children === "string" ? children : "";
                // If inside a pre block, react-markdown renders pre > code. Let's pass through if raw code block:
                if (text.includes("\n")) {
                  return <code {...props}>{children}</code>;
                }
                return <code className="bg-slate-900 border border-slate-800 text-sky-300 rounded px-1.5 py-0.5 text-xs font-mono" {...props}>{children}</code>;
              },
              p: ({ children, ...props }) => {
                const text = Array.isArray(children) ? children.join("") : typeof children === "string" ? children : "";
                if (text === "[[YOUTUBE_EMBED]]") {
                  return <YoutubeEmbed />;
                }
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
          <Link href="/blog" className="text-sky-400 font-medium hover:underline inline-flex items-center gap-2 min-h-[44px] px-2 py-1">
            ← Back to Blog
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
