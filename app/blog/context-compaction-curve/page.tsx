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
  "The Context Compaction Curve: Why Your Agent Pays Double After 272k Tokens";
const articleDescription =
  "OpenAI's 272k pricing cliff doubles input costs. Anthropic's 5-minute cache TTL silently expires. Reasoning tokens inflate with context noise. The compaction sweet spot is 40k–65k tokens — here's the math.";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "context compaction",
    "token economics",
    "272k pricing cliff",
    "prompt caching TTL",
    "reasoning tokens",
    "LLM cost optimization",
    "Codex CLI",
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
          <title id="curve-desk-title">The Context Compaction Curve — Cost per Turn vs. Compaction Threshold</title>
          <desc id="curve-desk-desc">
            Dual-panel chart. Left: turn cost rising with context length, showing a steep red cache-miss line and a shallow blue cache-hit line, with a green sweet-spot band at 40k–65k tokens and a sharp step at 272k. Right: reasoning token count inflating super-linearly with context length.
          </desc>
          <rect width="960" height="480" rx="12" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

          {/* ── Panel A: Cost per Turn ── */}
          <text x="250" y="36" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">
            Effective Turn Cost vs. Context Length
          </text>

          {/* Axes */}
          <line x1="80" y1="60" x2="80" y2="400" stroke="#334155" strokeWidth="1.5" />
          <line x1="80" y1="400" x2="440" y2="400" stroke="#334155" strokeWidth="1.5" />
          {/* X axis labels */}
          <text x="80" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">0</text>
          <text x="152" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">50k</text>
          <text x="224" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">100k</text>
          <text x="296" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">150k</text>
          <text x="368" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">200k</text>
          <text x="440" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">300k</text>
          <text x="260" y="455" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="system-ui">Context Length (tokens)</text>
          {/* Y axis label */}
          <text x="25" y="230" fill="#94a3b8" fontSize="11" textAnchor="middle" transform="rotate(-90, 25, 230)" fontFamily="system-ui">Cost per Turn ($)</text>
          {/* Y axis ticks */}
          <text x="70" y="400" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$0</text>
          <text x="70" y="315" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$0.25</text>
          <text x="70" y="230" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$0.50</text>
          <text x="70" y="145" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$0.75</text>
          <text x="70" y="65" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">$1.00</text>

          {/* Sweet Spot Zone (green band 40k–65k) */}
          <rect x="138" y="60" width="36" height="340" fill="#10b981" fillOpacity="0.12" />
          <line x1="138" y1="60" x2="138" y2="400" stroke="#10b981" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.5" />
          <line x1="174" y1="60" x2="174" y2="400" stroke="#10b981" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.5" />
          <text x="156" y="55" fill="#34d399" fontSize="9" textAnchor="middle" fontFamily="system-ui" fontWeight="600">SWEET SPOT</text>

          {/* 272k cliff marker */}
          <line x1="392" y1="60" x2="392" y2="400" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6,3" />
          <text x="392" y="55" fill="#f43f5e" fontSize="9" textAnchor="middle" fontFamily="system-ui" fontWeight="600">272k CLIFF</text>

          {/* Cache miss line (red) — steep curve with step at 272k */}
          <path
            d="M 80 395 C 120 388, 150 370, 180 350 C 220 320, 260 280, 300 240 C 340 200, 370 170, 390 150 L 392 150 L 392 95 C 410 85, 430 78, 440 75"
            fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Cache hit line (blue) — shallow slope */}
          <path
            d="M 80 395 C 120 392, 150 385, 180 375 C 220 360, 260 345, 300 325 C 340 305, 370 290, 390 280 L 392 280 L 392 250 C 410 240, 430 235, 440 230"
            fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* Legend */}
          <line x1="100" y1="445" x2="125" y2="445" stroke="#f43f5e" strokeWidth="2.5" />
          <text x="130" y="449" fill="#fca5a5" fontSize="10" fontFamily="system-ui">Cache Miss (Δt &gt; 5 min)</text>
          <line x1="280" y1="445" x2="305" y2="445" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="310" y="449" fill="#7dd3fc" fontSize="10" fontFamily="system-ui">Cache Hit (Δt &lt; 5 min)</text>

          {/* ── Panel B: Reasoning Token Inflation ── */}
          <text x="720" y="36" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">
            Reasoning Tokens vs. Context Length
          </text>

          {/* Axes */}
          <line x1="540" y1="60" x2="540" y2="400" stroke="#334155" strokeWidth="1.5" />
          <line x1="540" y1="400" x2="900" y2="400" stroke="#334155" strokeWidth="1.5" />
          {/* X axis labels */}
          <text x="540" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">0</text>
          <text x="630" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">50k</text>
          <text x="720" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">100k</text>
          <text x="810" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">200k</text>
          <text x="900" y="425" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="system-ui">300k</text>
          <text x="720" y="455" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="system-ui">Context Length (tokens)</text>
          {/* Y axis label */}
          <text x="505" y="230" fill="#94a3b8" fontSize="11" textAnchor="middle" transform="rotate(-90, 505, 230)" fontFamily="system-ui">Thinking Tokens / Turn</text>
          {/* Y axis ticks */}
          <text x="530" y="400" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">0</text>
          <text x="530" y="315" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">3k</text>
          <text x="530" y="230" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">6k</text>
          <text x="530" y="145" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">9k</text>
          <text x="530" y="65" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="system-ui">12k</text>

          {/* Sweet spot zone on panel B */}
          <rect x="598" y="60" width="36" height="340" fill="#10b981" fillOpacity="0.12" />

          {/* Thinking tokens curve (amber) — super-linear growth */}
          <path
            d="M 540 388 C 580 385, 620 370, 660 350 C 700 320, 740 270, 780 200 C 810 150, 850 105, 900 75"
            fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* Reference points */}
          <circle cx="630" cy="370" r="4" fill="#f59e0b" />
          <text x="635" y="365" fill="#fbbf24" fontSize="9" fontFamily="system-ui">~1.5k</text>
          <circle cx="810" cy="150" r="4" fill="#f59e0b" />
          <text x="815" y="145" fill="#fbbf24" fontSize="9" fontFamily="system-ui">~8k</text>
          <circle cx="900" cy="75" r="4" fill="#f59e0b" />
          <text x="880" y="68" fill="#fbbf24" fontSize="9" fontFamily="system-ui">~12k</text>

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
            Stacked vertical chart. Top panel: turn cost vs. context length with cache-miss and cache-hit lines plus sweet-spot band. Bottom panel: reasoning token inflation.
          </desc>
          <rect width="420" height="900" rx="12" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

          {/* ── Panel A (top half) ── */}
          <text x="210" y="36" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="700" fontFamily="system-ui, sans-serif">
            Cost per Turn vs. Context
          </text>

          <line x1="60" y1="60" x2="60" y2="370" stroke="#334155" strokeWidth="1.5" />
          <line x1="60" y1="370" x2="390" y2="370" stroke="#334155" strokeWidth="1.5" />

          {/* X labels */}
          <text x="60" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">0</text>
          <text x="126" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">50k</text>
          <text x="192" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">100k</text>
          <text x="258" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">150k</text>
          <text x="324" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">200k</text>
          <text x="390" y="390" fill="#94a3b8" fontSize="11" textAnchor="middle">300k</text>
          <text x="225" y="415" fill="#94a3b8" fontSize="11" textAnchor="middle">Context Length (tokens)</text>

          {/* Y labels */}
          <text x="50" y="370" fill="#94a3b8" fontSize="10" textAnchor="end">$0</text>
          <text x="50" y="290" fill="#94a3b8" fontSize="10" textAnchor="end">$0.25</text>
          <text x="50" y="215" fill="#94a3b8" fontSize="10" textAnchor="end">$0.50</text>
          <text x="50" y="140" fill="#94a3b8" fontSize="10" textAnchor="end">$0.75</text>
          <text x="50" y="65" fill="#94a3b8" fontSize="10" textAnchor="end">$1.00</text>

          {/* Sweet spot band */}
          <rect x="113" y="60" width="30" height="310" fill="#10b981" fillOpacity="0.12" />
          <text x="128" y="55" fill="#34d399" fontSize="10" textAnchor="middle" fontWeight="600">SWEET SPOT</text>

          {/* 272k cliff */}
          <line x1="348" y1="60" x2="348" y2="370" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6,3" />
          <text x="348" y="55" fill="#f43f5e" fontSize="10" textAnchor="middle" fontWeight="600">272k</text>

          {/* Cache miss (red) */}
          <path
            d="M 60 365 C 100 355, 130 340, 160 310 C 200 270, 240 230, 280 190 C 320 155, 340 140, 346 130 L 348 130 L 348 85 C 360 78, 380 72, 390 68"
            fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Cache hit (blue) */}
          <path
            d="M 60 365 C 100 360, 130 350, 160 340 C 200 320, 240 300, 280 278 C 320 258, 340 248, 346 242 L 348 242 L 348 218 C 360 210, 380 204, 390 200"
            fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* Legend */}
          <line x1="70" y1="432" x2="95" y2="432" stroke="#f43f5e" strokeWidth="2.5" />
          <text x="100" y="436" fill="#fca5a5" fontSize="11">Cache Miss (Δt &gt; 5 min)</text>
          <line x1="70" y1="450" x2="95" y2="450" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="100" y="454" fill="#7dd3fc" fontSize="11">Cache Hit (Δt &lt; 5 min)</text>

          {/* ── Panel B (bottom half) ── */}
          <text x="210" y="505" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="700" fontFamily="system-ui, sans-serif">
            Reasoning Tokens vs. Context
          </text>

          <line x1="60" y1="530" x2="60" y2="820" stroke="#334155" strokeWidth="1.5" />
          <line x1="60" y1="820" x2="390" y2="820" stroke="#334155" strokeWidth="1.5" />

          {/* X labels */}
          <text x="60" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">0</text>
          <text x="126" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">50k</text>
          <text x="225" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">100k</text>
          <text x="324" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">200k</text>
          <text x="390" y="840" fill="#94a3b8" fontSize="11" textAnchor="middle">300k</text>
          <text x="225" y="865" fill="#94a3b8" fontSize="11" textAnchor="middle">Context Length (tokens)</text>

          {/* Y labels */}
          <text x="50" y="820" fill="#94a3b8" fontSize="10" textAnchor="end">0</text>
          <text x="50" y="745" fill="#94a3b8" fontSize="10" textAnchor="end">3k</text>
          <text x="50" y="675" fill="#94a3b8" fontSize="10" textAnchor="end">6k</text>
          <text x="50" y="603" fill="#94a3b8" fontSize="10" textAnchor="end">9k</text>
          <text x="50" y="535" fill="#94a3b8" fontSize="10" textAnchor="end">12k</text>

          {/* Sweet spot on panel B */}
          <rect x="113" y="530" width="30" height="290" fill="#10b981" fillOpacity="0.12" />

          {/* Thinking tokens curve (amber) */}
          <path
            d="M 60 810 C 100 805, 130 790, 160 770 C 200 740, 240 695, 280 630 C 320 570, 360 530, 390 540"
            fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* Reference dots */}
          <circle cx="126" cy="790" r="4" fill="#f59e0b" />
          <text x="132" y="786" fill="#fbbf24" fontSize="10">~1.5k</text>
          <circle cx="324" cy="580" r="4" fill="#f59e0b" />
          <text x="330" y="576" fill="#fbbf24" fontSize="10">~8k</text>

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
        The Compaction Curve: total turn cost forms an asymmetric U, with the sweet spot at 40k–65k tokens. All figures calculated from published pricing, not empirical measurements.
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
            OpenAI&apos;s 272k pricing cliff doubles input costs. Anthropic&apos;s 5-minute cache TTL silently expires.
            Reasoning tokens inflate with context noise. The compaction sweet spot is 40k–65k tokens.
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
