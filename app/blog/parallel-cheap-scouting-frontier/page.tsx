import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { parallelCheapScoutingThumbnail } from "@/data/blog";
import postMd from "@/content/blog/parallel-cheap-scouting-frontier/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/parallel-cheap-scouting-frontier";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${parallelCheapScoutingThumbnail.src.src}`;
const articleDescription =
  "Why four parallel cheap models (gemini-3.5-flash-lite) outperform a single expensive model (gemini-3.7-flash) in codebase localization and scouting: empirical Pareto frontier across 360 benchmark runs.";

export const metadata = {
  title: "The $0.003 Scout Fleet: Why Four Parallel Cheap Models Beat One Expensive One",
  description: articleDescription,
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: "The $0.003 Scout Fleet: Why Four Parallel Cheap Models Beat One Expensive One",
    description: articleDescription,
    publishedTime: "2026-08-22T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [
      {
        url: parallelCheapScoutingThumbnail.src.src,
        width: 1600,
        height: 900,
        alt: parallelCheapScoutingThumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The $0.003 Scout Fleet: Why Four Parallel Cheap Models Beat One Expensive One",
    description: articleDescription,
    images: [parallelCheapScoutingThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "The $0.003 Scout Fleet: Why Four Parallel Cheap Models Beat One Expensive One",
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-08-22T00:00:00+08:00",
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

function loadPost() {
  // Strip H1 title & subtitle since header renders them
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function ParallelScoutingBlogPostPage() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page">
        <PostShareBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }}
        />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="2026-08-22">August 22, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>The $0.003 Scout Fleet: Why Four Parallel Cheap Models Beat One Expensive One</h1>
          <p className="blog-post-summary">
            When an agent localizes code, one standard model looks where it's told. Four ultra-cheap models look everywhere. Empirical findings and the Pareto frontier across 360 benchmark runs in Issue #174.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={parallelCheapScoutingThumbnail.src.src}
            width={parallelCheapScoutingThumbnail.src.width}
            height={parallelCheapScoutingThumbnail.src.height}
            alt={parallelCheapScoutingThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              table: ({ children }) => (
                <div style={{ overflowX: "auto", margin: "24px 0" }}>
                  <table className="report-table">{children}</table>
                </div>
              ),
            }}
          >
            {body}
          </Markdown>

          {/* Interactive SVG Pareto Chart */}
          <div style={{ margin: "40px 0", background: "#0b0f19", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#f8fafc", fontSize: "1.2rem" }}>Pareto Frontier: Execution Cost vs. Quality (F2 Score)</h3>
            <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "0.9rem" }}>
              360 runs across 9 tasks. The pink dashed line represents the non-dominated Pareto Frontier.
            </p>
            <svg
              viewBox="0 0 800 480"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "auto" }}
            >
              <rect width="800" height="480" fill="#0f172a" rx="8" />
              {/* Grid Lines */}
              <line x1="80" y1="420" x2="740" y2="420" stroke="#64748b" strokeWidth="2" />
              <line x1="80" y1="60" x2="80" y2="420" stroke="#64748b" strokeWidth="2" />
              
              <line x1="80" y1="360" x2="740" y2="360" stroke="#334155" strokeDasharray="3,3" />
              <text x="68" y="364" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="monospace">0.5</text>
              <line x1="80" y1="300" x2="740" y2="300" stroke="#334155" strokeDasharray="3,3" />
              <text x="68" y="304" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="monospace">0.6</text>
              <line x1="80" y1="240" x2="740" y2="240" stroke="#334155" strokeDasharray="3,3" />
              <text x="68" y="244" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="monospace">0.7</text>
              <line x1="80" y1="180" x2="740" y2="180" stroke="#334155" strokeDasharray="3,3" />
              <text x="68" y="184" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="monospace">0.8</text>
              <line x1="80" y1="120" x2="740" y2="120" stroke="#334155" strokeDasharray="3,3" />
              <text x="68" y="124" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="monospace">0.9</text>
              <line x1="80" y1="60" x2="740" y2="60" stroke="#334155" strokeDasharray="3,3" />
              <text x="68" y="64" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="monospace">1.0</text>

              {/* X Axis labels */}
              <text x="80" y="440" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">$0.000</text>
              <text x="245" y="440" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">$0.006</text>
              <text x="410" y="440" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">$0.012</text>
              <text x="575" y="440" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">$0.018</text>
              <text x="740" y="440" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">$0.024</text>

              {/* Axis titles */}
              <text x="410" y="468" fill="#cbd5e1" fontSize="12" textAnchor="middle">Total Cost (USD / Task Run)</text>
              <text x="25" y="240" fill="#cbd5e1" fontSize="12" textAnchor="middle" transform="rotate(-90 25 240)">Quality (F2 Score)</text>

              {/* Pareto Frontier Path */}
              <path d="M 563 208 L 580 78 L 671 73 L 712 66" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="4,4" />

              {/* Points */}
              {/* B: K=1 (Cost 0.01757, F2 0.752) */}
              <circle cx="563" cy="208" r="7" fill="#94a3b8" stroke="#ffffff" strokeWidth="2" />
              <text x="563" y="196" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">B (K=1)</text>

              {/* A: K=1 (Cost 0.01820, F2 0.969) */}
              <circle cx="580" cy="78" r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              <text x="580" y="66" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">A (K=1)</text>

              {/* C: K=3 (Cost 0.02015, F2 0.917) -> Dominated */}
              <circle cx="634" cy="110" r="5" fill="#ec4899" stroke="#475569" strokeWidth="1" opacity="0.5" />
              <text x="634" y="98" fill="#ec4899" fontSize="10" textAnchor="middle" opacity="0.5">C (K=3)</text>

              {/* C: K=4 (Cost 0.02152, F2 0.978) -> Optimal */}
              <circle cx="671" cy="73" r="7" fill="#ec4899" stroke="#ffffff" strokeWidth="2" />
              <text x="671" y="60" fill="#ec4899" fontSize="11" fontWeight="bold" textAnchor="middle">C (K=4)</text>

              {/* C: K=5, K=6 -> Dominated */}
              <circle cx="708" cy="104" r="5" fill="#ec4899" stroke="#475569" strokeWidth="1" opacity="0.5" />
              <text x="708" y="94" fill="#ec4899" fontSize="10" textAnchor="middle" opacity="0.5">C (K=5,6)</text>

              {/* D: K=4 (Cost 0.02298, F2 0.989) -> Peak */}
              <circle cx="712" cy="66" r="7" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
              <text x="712" y="52" fill="#a855f7" fontSize="11" fontWeight="bold" textAnchor="middle">D (K=4)</text>

              {/* Legend */}
              <g transform="translate(100, 80)">
                <rect width="230" height="95" fill="#1e293b" rx="6" stroke="#334155" />
                <circle cx="15" cy="18" r="5" fill="#38bdf8" />
                <text x="28" y="22" fill="#cbd5e1" fontSize="11">Arch A: Single Flash 3.7</text>
                <circle cx="15" cy="38" r="5" fill="#94a3b8" />
                <text x="28" y="42" fill="#cbd5e1" fontSize="11">Arch B: Single Lite 3.5</text>
                <circle cx="15" cy="58" r="5" fill="#ec4899" />
                <text x="28" y="62" fill="#cbd5e1" fontSize="11">Arch C: Parallel Lite (K=3..6)</text>
                <circle cx="15" cy="78" r="5" fill="#a855f7" />
                <text x="28" y="82" fill="#cbd5e1" fontSize="11">Arch D: Cascaded Funnel</text>
              </g>
            </svg>
          </div>
        </article>

        <section className="report-directives section-shell" aria-labelledby="receipts-title">
          <header className="report-directives-intro">
            <p className="signal"><span /> EMPIRICAL PROVENANCE</p>
            <h2 id="receipts-title">The receipt is in the repo.</h2>
            <p>Every number in this post is backed by a committed JSONL ledger record.</p>
          </header>
          <div className="report-directives-grid">
            <article className="directive-card">
              <h3>Methodology &amp; Plan</h3>
              <p>Full research design, model cards, tasks, and hypotheses in Issue #174.</p>
              <Link href="/research/parallel-scouting" className="directive-link">
                Read the research receipt <span aria-hidden="true">→</span>
              </Link>
            </article>
            <article className="directive-card">
              <h3>Ledger Dataset</h3>
              <p>360 validated runs with token accounting, wall-clock latencies, and ground truth.</p>
              <a
                href="https://github.com/gaia-research/gaia-research/blob/main/scripts/scout-bench/data/ledger.jsonl"
                target="_blank"
                rel="noreferrer"
                className="directive-link"
              >
                Inspect ledger.jsonl <span aria-hidden="true">↗</span>
              </a>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
