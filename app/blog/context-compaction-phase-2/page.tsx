import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { contextCompactionPhase2Thumbnail } from "@/data/blog";
import postMd from "@/content/blog/context-compaction-phase-2/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/context-compaction-phase-2";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${contextCompactionPhase2Thumbnail.src.src}`;
const articleTitle =
  "We Ran 48 Coding Sessions to Find the Real Compaction Sweet Spot";
const articleDescription =
  "Phase 1 predicted the sweet spot was 40k–65k. We ran 48 live coding sessions across 8 autocompaction thresholds on Gemini 3.8 Flash. Here is the true Pareto frontier.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "context compaction",
    "empirical benchmark",
    "Pareto frontier",
    "prompt caching",
    "reasoning tokens",
    "reacquisition thrashing",
    "Gemini 3.8 Flash",
    "token economics",
    "Claude Code",
    "agent context management",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime: "2026-09-13T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [
      {
        url: contextCompactionPhase2Thumbnail.src.src,
        width: 1600,
        height: 900,
        alt: contextCompactionPhase2Thumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [contextCompactionPhase2Thumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-09-13T00:00:00+08:00",
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

/* ─── SVG Figures ─── */

function CompactionCurveFigureSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "780px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 740 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Background */}
          <rect width="740" height="460" rx="8" fill="#0c1222" stroke="#1e293b" />

          {/* Title */}
          <text x="370" y="32" fill="#f8fafc" fontSize="15" fontWeight="600" textAnchor="middle">
            Context Compaction Cost vs Thrashing Pareto Frontier
          </text>
          <text x="370" y="52" fill="#94a3b8" fontSize="11" textAnchor="middle">
            Measured across 48 live coding sessions on Gemini 3.8 Flash (Scenario 4 Pareto Sweep)
          </text>

          {/* Grid lines */}
          <line x1="80" y1="80" x2="680" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="80" y1="150" x2="680" y2="150" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="80" y1="220" x2="680" y2="220" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="80" y1="290" x2="680" y2="290" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="80" y1="360" x2="680" y2="360" stroke="#334155" />

          {/* Y Axis Left: Cost per turn ($) */}
          <text x="25" y="220" fill="#38bdf8" fontSize="11" fontWeight="600" transform="rotate(-90 25 220)" textAnchor="middle">
            Cost per Turn ($)
          </text>
          <text x="72" y="85" fill="#64748b" fontSize="10" textAnchor="end">$0.10</text>
          <text x="72" y="155" fill="#64748b" fontSize="10" textAnchor="end">$0.075</text>
          <text x="72" y="225" fill="#64748b" fontSize="10" textAnchor="end">$0.05</text>
          <text x="72" y="295" fill="#64748b" fontSize="10" textAnchor="end">$0.025</text>
          <text x="72" y="365" fill="#64748b" fontSize="10" textAnchor="end">$0.00</text>

          {/* Y Axis Right: Reacquisition Thrashing Multiplier */}
          <text x="715" y="220" fill="#ec4899" fontSize="11" fontWeight="600" transform="rotate(90 715 220)" textAnchor="middle">
            Reacquisition Thrashing
          </text>
          <text x="688" y="85" fill="#64748b" fontSize="10">6.0×</text>
          <text x="688" y="155" fill="#64748b" fontSize="10">4.5×</text>
          <text x="688" y="225" fill="#64748b" fontSize="10">3.0×</text>
          <text x="688" y="295" fill="#64748b" fontSize="10">1.5×</text>
          <text x="688" y="365" fill="#64748b" fontSize="10">1.0×</text>

          {/* Sweet Spot Zone Highlight */}
          <rect x="290" y="70" width="180" height="290" fill="#10b981" fillOpacity="0.08" rx="4" />
          <text x="380" y="90" fill="#34d399" fontSize="11" fontWeight="600" textAnchor="middle">
            ★ EMPIRICAL SWEET SPOT (150k–250k)
          </text>

          {/* Threshold points (X: 50k, 75k, 100k, 150k, 200k, 250k, 300k, Disabled) */}
          {/* X mappings: 50k=120, 75k=170, 100k=220, 150k=320, 200k=400, 250k=480, 300k=560, Disabled=640 */}

          {/* Cost Curve (Cyan) */}
          {/* 50k: $0.0617 (y=187), 75k: $0.052 (y=214), 100k: $0.0468 (y=229), 150k: $0.0401 (y=248), 200k: $0.0384 (y=252), 250k: $0.0392 (y=250), 300k: $0.0421 (y=242), Dis: $0.0953 (y=93) */}
          <path
            d="M 120 187 C 160 215, 200 230, 320 248 C 380 255, 420 252, 480 250 C 530 245, 580 220, 640 93"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
          />

          {/* Thrashing Curve (Pink) */}
          {/* 50k: 5.51x (y=103), 75k: 3.8x (y=183), 100k: 2.76x (y=231), 150k: 1.48x (y=291), 200k: 1.25x (y=302), 250k: 1.15x (y=307), 300k: 1.08x (y=310), Dis: 1.00x (y=314) */}
          <path
            d="M 120 103 C 170 190, 220 240, 320 291 C 380 302, 480 307, 640 314"
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
            strokeDasharray="5 3"
          />

          {/* Cost points */}
          <circle cx="120" cy="187" r="4" fill="#38bdf8" />
          <circle cx="220" cy="229" r="4" fill="#38bdf8" />
          <circle cx="320" cy="248" r="5" fill="#38bdf8" stroke="#f8fafc" strokeWidth="1.5" />
          <circle cx="400" cy="252" r="5" fill="#38bdf8" stroke="#f8fafc" strokeWidth="1.5" />
          <circle cx="480" cy="250" r="5" fill="#38bdf8" stroke="#f8fafc" strokeWidth="1.5" />
          <circle cx="560" cy="242" r="4" fill="#38bdf8" />
          <circle cx="640" cy="93" r="4" fill="#38bdf8" />

          {/* Thrashing points */}
          <circle cx="120" cy="103" r="4" fill="#ec4899" />
          <circle cx="220" cy="231" r="4" fill="#ec4899" />
          <circle cx="320" cy="291" r="4" fill="#ec4899" />
          <circle cx="400" cy="302" r="4" fill="#ec4899" />
          <circle cx="480" cy="307" r="4" fill="#ec4899" />
          <circle cx="640" cy="314" r="4" fill="#ec4899" />

          {/* X Axis Labels */}
          <text x="120" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">50k</text>
          <text x="220" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">100k</text>
          <text x="320" y="380" fill="#f8fafc" fontSize="11" fontWeight="600" textAnchor="middle">150k</text>
          <text x="400" y="380" fill="#f8fafc" fontSize="11" fontWeight="600" textAnchor="middle">200k</text>
          <text x="480" y="380" fill="#f8fafc" fontSize="11" fontWeight="600" textAnchor="middle">250k</text>
          <text x="560" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">300k</text>
          <text x="640" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">Disabled</text>

          <text x="380" y="405" fill="#94a3b8" fontSize="11" textAnchor="middle">
            Autocompaction Context Threshold
          </text>

          {/* Legend */}
          <g transform="translate(180, 425)">
            <line x1="0" y1="10" x2="25" y2="10" stroke="#38bdf8" strokeWidth="3" />
            <circle cx="12" cy="10" r="3" fill="#38bdf8" />
            <text x="32" y="14" fill="#bae6fd" fontSize="11">Cost per Turn ($)</text>

            <line x1="160" y1="10" x2="185" y2="10" stroke="#ec4899" strokeWidth="3" strokeDasharray="5 3" />
            <circle cx="172" cy="10" r="3" fill="#ec4899" />
            <text x="192" y="14" fill="#fbcfe8" fontSize="11">Reacquisition Thrashing (Multiplier)</text>
          </g>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
        Figure 1: The empirical Pareto frontier across 48 sessions. Compacting below 100k triggers catastrophic reacquisition thrashing (up to 5.51×). 150k–250k minimizes total cost ($0.0384/turn) while keeping thrashing below 1.5×.
      </figcaption>
    </figure>
  );
}

function ReasoningScalingFigureSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      <div style={{ maxWidth: "780px", margin: "0 auto" }}>
        <svg
          viewBox="0 0 740 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Background */}
          <rect width="740" height="440" rx="8" fill="#0c1222" stroke="#1e293b" />

          {/* Title */}
          <text x="370" y="32" fill="#f8fafc" fontSize="15" fontWeight="600" textAnchor="middle">
            Reasoning Token Super-Linear Scaling (Scenario 3)
          </text>
          <text x="370" y="52" fill="#94a3b8" fontSize="11" textAnchor="middle">
            Empirical power law fit: T = 2.525 × 10⁻⁶ · L¹·⁴⁹ (R² = 0.988) across 12 controlled runs
          </text>

          {/* Grid lines */}
          <line x1="90" y1="80" x2="680" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="90" y1="150" x2="680" y2="150" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="90" y1="220" x2="680" y2="220" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="90" y1="290" x2="680" y2="290" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="90" y1="360" x2="680" y2="360" stroke="#334155" />

          {/* Y Axis: Reasoning Tokens T */}
          <text x="30" y="220" fill="#f59e0b" fontSize="11" fontWeight="600" transform="rotate(-90 30 220)" textAnchor="middle">
            Thinking / Reasoning Tokens (T)
          </text>
          <text x="82" y="85" fill="#64748b" fontSize="10" textAnchor="end">6,000</text>
          <text x="82" y="155" fill="#64748b" fontSize="10" textAnchor="end">4,500</text>
          <text x="82" y="225" fill="#64748b" fontSize="10" textAnchor="end">3,000</text>
          <text x="82" y="295" fill="#64748b" fontSize="10" textAnchor="end">1,500</text>
          <text x="82" y="365" fill="#64748b" fontSize="10" textAnchor="end">0</text>

          {/* Linear Reference Line (Gray dashed) */}
          <line x1="90" y1="360" x2="680" y2="225" stroke="#475569" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="640" y="215" fill="#64748b" fontSize="10">Linear baseline (β = 1.0)</text>

          {/* Fitted Power Curve: T = 2.525e-6 * L^1.4897 */}
          {/* 50k (x=160): y=349 (233 tokens) */}
          {/* 100k (x=270): y=329 (654 tokens) */}
          {/* 200k (x=450): y=274 (1,842 tokens) */}
          {/* 400k (x=670): y=117 (5,210 tokens) */}
          <path
            d="M 90 360 C 180 355, 270 335, 450 274 C 540 220, 620 160, 670 117"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3.5"
          />

          {/* Measured Points with Error Bars / Annotations */}
          {/* 50k Tier */}
          <circle cx="160" cy="349" r="5" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
          <text x="160" y="335" fill="#fde68a" fontSize="10" textAnchor="middle">233 tok</text>

          {/* 100k Tier */}
          <circle cx="270" cy="329" r="5" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
          <text x="270" y="315" fill="#fde68a" fontSize="10" textAnchor="middle">654 tok</text>

          {/* 200k Tier */}
          <circle cx="450" cy="274" r="5" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
          <text x="450" y="258" fill="#fde68a" fontSize="10" textAnchor="middle">1,842 tok</text>

          {/* 400k Tier */}
          <circle cx="670" cy="117" r="6" fill="#f59e0b" stroke="#fef3c7" strokeWidth="2" />
          <text x="670" y="100" fill="#fde68a" fontSize="11" fontWeight="600" textAnchor="middle">5,210 tok (22.4×)</text>

          {/* X Axis */}
          <text x="160" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">50k</text>
          <text x="270" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">100k</text>
          <text x="450" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">200k</text>
          <text x="670" y="380" fill="#94a3b8" fontSize="10" textAnchor="middle">400k</text>

          <text x="380" y="405" fill="#94a3b8" fontSize="11" textAnchor="middle">
            Context Window Depth (L)
          </text>

          {/* Callout box */}
          <rect x="220" y="140" width="230" height="60" rx="6" fill="#1e293b" fillOpacity="0.9" stroke="#f59e0b" strokeWidth="1" />
          <text x="335" y="162" fill="#fbbf24" fontSize="11" fontWeight="600" textAnchor="middle">
            Super-Linear Exponent: β = 1.49
          </text>
          <text x="335" y="182" fill="#cbd5e1" fontSize="10" textAnchor="middle">
            8× context increase → 22.4× thinking tokens
          </text>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px", textAlign: "center" }}>
        Figure 2: Reasoning token scaling vs context depth. As context expands from 50k to 400k tokens (8×), thinking tokens explode from 233 to 5,210 (22.4×), matching super-linear exponent β = 1.49.
      </figcaption>
    </figure>
  );
}

function loadPost() {
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function ContextCompactionPhase2Page() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page">
        <PostShareBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c"),
          }}
        />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="2026-09-13">September 13, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            {articleDescription}
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={contextCompactionPhase2Thumbnail.src.src}
            width={contextCompactionPhase2Thumbnail.src.width}
            height={contextCompactionPhase2Thumbnail.src.height}
            alt={contextCompactionPhase2Thumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              table: ({ children }) => (
                <div className="table-scroll-container">
                  <table className="report-table">{children}</table>
                </div>
              ),
              p: ({ children, ...props }) => {
                const childArray = Array.isArray(children) ? children : [children];
                const text =
                  childArray.length === 1 && typeof childArray[0] === "string"
                    ? childArray[0].trim()
                    : null;

                if (text === "[[COMPACTION_CURVE_FIGURE]]") {
                  return <CompactionCurveFigureSvg />;
                }
                if (text === "[[REASONING_SCALING_FIGURE]]") {
                  return <ReasoningScalingFigureSvg />;
                }

                return <p {...props}>{children}</p>;
              },
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot">
          <Link href="/blog">
            Back to Blog <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
