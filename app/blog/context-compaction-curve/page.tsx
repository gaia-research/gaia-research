import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
// import { contextCompactionCurveThumbnail } from "@/data/blog";
import postMd from "@/content/blog/context-compaction-curve/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/context-compaction-curve";
const articleUrl = `${siteUrl}${articlePath}`;
// const thumbnailUrl = `${siteUrl}${contextCompactionCurveThumbnail.src.src}`;
const articleTitle =
  "The Context Compaction Curve";
const articleDescription =
  "You're at 100k tokens cold. Compact now or keep going? The cache-TTL economics, the reasoning token multiplier, and the rule of thumb that should replace gut feel.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "context compaction",
    "token economics",
    "prompt caching TTL",
    "cache cold return",
    "reasoning tokens",
    "LLM cost optimization",
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
    publishedTime: "2026-09-08T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    // images: [{ url: contextCompactionCurveThumbnail.src.src, width: 1600, height: 900, alt: contextCompactionCurveThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    // images: [contextCompactionCurveThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  // image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-09-08T00:00:00+08:00",
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

function CompactionCurveSvg() {
  return (
    <figure className="blog-post-figure" style={{ margin: "32px 0" }}>
      {/* Desktop & Tablet: Wide dual-panel */}
      <div className="blog-svg-desktop">
        <svg
          viewBox="0 0 960 480"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-labelledby="curve-desk-title curve-desk-desc"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="curve-desk-title">The Context Compaction Curve — Cost per Turn vs. Context Length</title>
          <desc id="curve-desk-desc">
            Dual-panel chart. Left: turn cost rising with context length, showing a steep red cache-miss line and a shallow blue cache-hit line, with a green sweet-spot band at 40k–65k and an amber callout at the 100k cold-return scenario. Right: reasoning token count inflating super-linearly with context length.
          </desc>
          <rect width="960" height="480" rx="12" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

          {/* ── Panel A: Cache Cost per Turn ── */}
          <text x="250" y="36" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">
            Cache Cost per Turn vs. Context Length
          </text>

          {/* Axes */}
          <line x1="80" y1="60" x2="80" y2="400" stroke="#334155" strokeWidth="1.5" />
          <line x1="80" y1="400" x2="440" y2="400" stroke="#334155" strokeWidth="1.5" />
          {/* X axis labels — 0 to 250k */}
          <text x="80" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">0</text>
          <text x="152" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">50k</text>
          <text x="224" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">100k</text>
          <text x="296" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">150k</text>
          <text x="368" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">200k</text>
          <text x="440" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">250k</text>
          <text x="260" y="455" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="system-ui">Context Length (tokens)</text>
          {/* Y axis label */}
          <text x="25" y="230" fill="#94a3b8" fontSize="11" textAnchor="middle" transform="rotate(-90, 25, 230)" fontFamily="system-ui">Cost per Turn ($)</text>
          {/* Y axis ticks */}
          <text x="70" y="400" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$0</text>
          <text x="70" y="315" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$0.20</text>
          <text x="70" y="230" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$0.40</text>
          <text x="70" y="145" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$0.60</text>
          <text x="70" y="65" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$0.80</text>

          {/* Sweet Spot Zone (green band 40k–65k) */}
          <rect x="138" y="60" width="36" height="340" fill="#10b981" fillOpacity="0.12" />
          <line x1="138" y1="60" x2="138" y2="400" stroke="#10b981" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.5" />
          <line x1="174" y1="60" x2="174" y2="400" stroke="#10b981" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.5" />
          <text x="156" y="55" fill="#34d399" fontSize="9" textAnchor="middle" fontFamily="system-ui" fontWeight="600">SWEET SPOT</text>

          {/* Cache miss line (red) — linear growth with context size */}
          <path
            d="M 80 395 C 120 388, 150 372, 180 355 C 220 325, 260 290, 300 250 C 340 210, 380 170, 440 110"
            fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Cache hit line (blue) — shallow slope */}
          <path
            d="M 80 395 C 120 392, 150 387, 180 380 C 220 368, 260 355, 300 340 C 340 322, 380 305, 440 275"
            fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* 100k cold-return callout */}
          <circle cx="224" cy="290" r="5" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <text x="234" y="283" fill="#fbbf24" fontSize="9" fontFamily="system-ui" fontWeight="600">← 100k cold</text>
          <text x="234" y="296" fill="#fbbf24" fontSize="8" fontFamily="system-ui">$0.39/miss</text>

          {/* Legend */}
          <line x1="100" y1="445" x2="125" y2="445" stroke="#f43f5e" strokeWidth="2.5" />
          <text x="130" y="449" fill="#fca5a5" fontSize="10" fontFamily="system-ui">Cache Miss (1.25× write, Δt &gt; 5 min)</text>
          <line x1="290" y1="445" x2="315" y2="445" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="320" y="449" fill="#7dd3fc" fontSize="10" fontFamily="system-ui">Cache Hit (0.10× read, Δt &lt; 5 min)</text>

          {/* ── Panel B: Reasoning Token Inflation ── */}
          <text x="720" y="36" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">
            Reasoning Tokens vs. Context Length
          </text>

          {/* Axes */}
          <line x1="540" y1="60" x2="540" y2="400" stroke="#334155" strokeWidth="1.5" />
          <line x1="540" y1="400" x2="900" y2="400" stroke="#334155" strokeWidth="1.5" />
          {/* X axis labels — 0 to 250k */}
          <text x="540" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">0</text>
          <text x="612" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">50k</text>
          <text x="684" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">100k</text>
          <text x="756" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">150k</text>
          <text x="828" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">200k</text>
          <text x="900" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">250k</text>
          <text x="720" y="455" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="system-ui">Context Length (tokens)</text>
          {/* Y axis label */}
          <text x="505" y="230" fill="#94a3b8" fontSize="11" textAnchor="middle" transform="rotate(-90, 505, 230)" fontFamily="system-ui">Thinking Tokens / Turn</text>
          {/* Y axis ticks */}
          <text x="530" y="400" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">0</text>
          <text x="530" y="315" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">2k</text>
          <text x="530" y="230" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">4k</text>
          <text x="530" y="145" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">6k</text>
          <text x="530" y="65" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">8k</text>

          {/* Sweet spot zone on panel B */}
          <rect x="580" y="60" width="36" height="340" fill="#10b981" fillOpacity="0.12" />

          {/* Thinking tokens curve (amber) — super-linear growth */}
          <path
            d="M 540 388 C 580 382, 620 368, 660 340 C 700 305, 740 260, 780 200 C 820 140, 860 95, 900 75"
            fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* Reference points */}
          <circle cx="612" cy="375" r="4" fill="#f59e0b" />
          <text x="617" y="370" fill="#fbbf24" fontSize="9" fontFamily="system-ui">~1.5k</text>
          <circle cx="684" cy="310" r="4" fill="#f59e0b" />
          <text x="689" y="305" fill="#fbbf24" fontSize="9" fontFamily="system-ui">~4k</text>
          <circle cx="900" cy="75" r="4" fill="#f59e0b" />
          <text x="875" y="68" fill="#fbbf24" fontSize="9" fontFamily="system-ui">~8k</text>

          {/* Legend */}
          <line x1="600" y1="445" x2="625" y2="445" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="630" y="449" fill="#fde68a" fontSize="10" fontFamily="system-ui">Thinking Tokens (billed as output)</text>

          {/* Provenance */}
          <text x="480" y="475" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="system-ui">
            Model-derived from published pricing · not measured data
          </text>
        </svg>
      </div>

      {/* Mobile: Stacked vertical panels */}
      <div className="blog-svg-mobile">
        <svg
          viewBox="0 0 420 900"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-labelledby="curve-mob-title curve-mob-desc"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <title id="curve-mob-title">The Context Compaction Curve — Mobile View</title>
          <desc id="curve-mob-desc">
            Stacked vertical chart. Top panel: cache cost per turn vs. context length with cache-miss and cache-hit lines, sweet-spot band, and 100k cold-return callout. Bottom panel: reasoning token inflation.
          </desc>
          <rect width="420" height="900" rx="12" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

          {/* ── Panel A (top half) ── */}
          <text x="210" y="36" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="700" fontFamily="system-ui, sans-serif">
            Cache Cost per Turn vs. Context
          </text>

          <line x1="60" y1="60" x2="60" y2="370" stroke="#334155" strokeWidth="1.5" />
          <line x1="60" y1="370" x2="390" y2="370" stroke="#334155" strokeWidth="1.5" />

          {/* X labels — 0 to 250k */}
          <text x="60" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">0</text>
          <text x="126" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">50k</text>
          <text x="192" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">100k</text>
          <text x="258" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">150k</text>
          <text x="324" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">200k</text>
          <text x="390" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">250k</text>
          <text x="225" y="415" fill="#94a3b8" fontSize="11" textAnchor="middle">Context Length (tokens)</text>

          {/* Y labels */}
          <text x="50" y="370" fill="#94a3b8" fontSize="10" textAnchor="end">$0</text>
          <text x="50" y="290" fill="#94a3b8" fontSize="10" textAnchor="end">$0.20</text>
          <text x="50" y="215" fill="#94a3b8" fontSize="10" textAnchor="end">$0.40</text>
          <text x="50" y="140" fill="#94a3b8" fontSize="10" textAnchor="end">$0.60</text>
          <text x="50" y="65" fill="#94a3b8" fontSize="10" textAnchor="end">$0.80</text>

          {/* Sweet spot band */}
          <rect x="113" y="60" width="30" height="310" fill="#10b981" fillOpacity="0.12" />
          <text x="128" y="55" fill="#34d399" fontSize="10" textAnchor="middle" fontWeight="600">SWEET SPOT</text>

          {/* Cache miss (red) — linear */}
          <path
            d="M 60 365 C 100 355, 130 340, 160 318 C 200 285, 240 250, 280 215 C 320 180, 360 145, 390 115"
            fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Cache hit (blue) — shallow */}
          <path
            d="M 60 365 C 100 362, 130 355, 160 345 C 200 330, 240 315, 280 298 C 320 280, 360 262, 390 245"
            fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* 100k cold callout */}
          <circle cx="192" cy="250" r="5" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <text x="200" y="245" fill="#fbbf24" fontSize="10" fontWeight="600">← 100k cold</text>

          {/* Legend */}
          <line x1="70" y1="432" x2="95" y2="432" stroke="#f43f5e" strokeWidth="2.5" />
          <text x="100" y="436" fill="#fca5a5" fontSize="11">Cache Miss (1.25× write)</text>
          <line x1="70" y1="450" x2="95" y2="450" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="100" y="454" fill="#7dd3fc" fontSize="11">Cache Hit (0.10× read)</text>

          {/* ── Panel B (bottom half) ── */}
          <text x="210" y="505" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="700" fontFamily="system-ui, sans-serif">
            Reasoning Tokens vs. Context
          </text>

          <line x1="60" y1="530" x2="60" y2="820" stroke="#334155" strokeWidth="1.5" />
          <line x1="60" y1="820" x2="390" y2="820" stroke="#334155" strokeWidth="1.5" />

          {/* X labels — 0 to 250k */}
          <text x="60" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">0</text>
          <text x="126" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">50k</text>
          <text x="192" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">100k</text>
          <text x="258" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">150k</text>
          <text x="324" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">200k</text>
          <text x="390" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">250k</text>
          <text x="225" y="865" fill="#94a3b8" fontSize="11" textAnchor="middle">Context Length (tokens)</text>

          {/* Y labels */}
          <text x="50" y="820" fill="#94a3b8" fontSize="10" textAnchor="end">0</text>
          <text x="50" y="745" fill="#94a3b8" fontSize="10" textAnchor="end">2k</text>
          <text x="50" y="675" fill="#94a3b8" fontSize="10" textAnchor="end">4k</text>
          <text x="50" y="603" fill="#94a3b8" fontSize="10" textAnchor="end">6k</text>
          <text x="50" y="535" fill="#94a3b8" fontSize="10" textAnchor="end">8k</text>

          {/* Sweet spot on panel B */}
          <rect x="113" y="530" width="30" height="290" fill="#10b981" fillOpacity="0.12" />

          {/* Thinking tokens curve (amber) */}
          <path
            d="M 60 810 C 100 802, 130 790, 160 770 C 200 738, 240 695, 280 640 C 320 580, 360 540, 390 530"
            fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* Reference dots */}
          <circle cx="126" cy="792" r="4" fill="#f59e0b" />
          <text x="132" y="788" fill="#fbbf24" fontSize="10">~1.5k</text>
          <circle cx="192" cy="735" r="4" fill="#f59e0b" />
          <text x="198" y="731" fill="#fbbf24" fontSize="10">~4k</text>

          {/* Legend */}
          <line x1="70" y1="878" x2="95" y2="878" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="100" y="882" fill="#fde68a" fontSize="11">Thinking Tokens (billed as output)</text>

          {/* Provenance */}
          <text x="210" y="898" textAnchor="middle" fill="#64748b" fontSize="10">
            Model-derived from published pricing · not measured data
          </text>
        </svg>
      </div>
      <figcaption style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px", textAlign: "center" }}>
        The Compaction Curve: cache cost and reasoning tokens both rise with context length. The sweet spot at 40k–65k balances cache-miss blast radius against reacquisition thrashing. All figures from published pricing.
      </figcaption>
    </figure>
  );
}

function loadPost() {
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function ContextCompactionCurvePage() {
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
            <time dateTime="2026-09-08">September 08, 2026</time> ·{" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            You&apos;re at 100k tokens cold. Compact now or keep going? The cache-TTL economics,
            the reasoning token multiplier, and the rule of thumb that should replace gut feel.
          </p>
        </header>

        {/* TODO: Uncomment when thumbnail is generated
        <figure className="blog-post-illustration">
          <img
            src={contextCompactionCurveThumbnail.src.src}
            width={1600}
            height={900}
            alt={contextCompactionCurveThumbnail.alt}
          />
        </figure>
        */}

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
                  childArray.length === 1 && typeof childArray[0] === "string" ? childArray[0] : null;

                if (text === "[[COMPACTION_CURVE]]") return <CompactionCurveSvg />;

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
