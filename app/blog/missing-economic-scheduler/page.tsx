import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import PostShareBar from "@/components/PostShareBar";
import marcusAuthor from "@/content/authors/marcus.json";
import { missingEconomicSchedulerThumbnail } from "@/data/blog";
import postMd from "@/content/blog/missing-economic-scheduler/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/missing-economic-scheduler";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${missingEconomicSchedulerThumbnail.src.src}`;
const articleTitle = "Beyond Orchestration: The Missing Economic Scheduler for AI Agents";
const articleDescription =
  "Why are we paying reasoning prices for bookkeeping? How deterministic runtimes, global memory, and predictive economic scheduling replace expensive conversational orchestration.";
const publishedTime = "2026-10-26T00:00:00+08:00";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "economic scheduler",
    "agent orchestration",
    "dynamic workflows",
    "shared memory",
    "Temporal",
    "LangGraph",
    "Ray",
    "Auto Office",
    "context reentry tax",
    "Gaia Research",
  ],
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: articleTitle,
    description: articleDescription,
    publishedTime,
    authors: [marcusAuthor.display_name],
    images: [
      {
        url: missingEconomicSchedulerThumbnail.src.src,
        width: 1600,
        height: 900,
        alt: missingEconomicSchedulerThumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [missingEconomicSchedulerThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: articleTitle,
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: publishedTime,
  author: {
    "@type": "Person",
    name: marcusAuthor.display_name,
    url: marcusAuthor.links.github,
  },
  publisher: {
    "@type": "Organization",
    name: "Gaia Research",
    url: siteUrl,
  },
};

function loadPost() {
  // Strip the title and byline; the header below renders them.
  return postMd.split("\n").slice(4).join("\n").trim();
}

const figureStyle = { width: "100%", maxWidth: 560, margin: "2rem auto" };
const svgStyle = { display: "block", width: "100%", height: "auto" };

function EconomicSchedulerArchitectureSvg() {
  return (
    <figure className="blog-post-figure" style={figureStyle}>
      <svg
        viewBox="0 0 600 450"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="scheduler-arch-title scheduler-arch-desc"
        style={svgStyle}
      >
        <title id="scheduler-arch-title">Architectural Shift: Conversational Swarm vs. Economic Scheduler</title>
        <desc id="scheduler-arch-desc">
          System diagram contrasting conversational LLM orchestrators that suffer from cold cache re-entries and bookkeeping overhead against an economic scheduler with global shared memory and deterministic verification.
        </desc>

        {/* Card Canvas */}
        <rect width="600" height="450" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        {/* Header */}
        <text x="300" y="34" textAnchor="middle" fill="#f8fafc" fontSize="21" fontWeight="700">
          The Missing Systems Abstraction
        </text>
        <text x="300" y="56" textAnchor="middle" fill="#94a3b8" fontSize="13">
          Replacing conversational LLM management with deterministic scheduling
        </text>

        {/* Pattern A: Conversational Orchestration */}
        <g transform="translate(35, 75)">
          <rect width="530" height="135" rx="10" fill="#0f172a" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />
          <text x="20" y="24" fill="#f87171" fontSize="15" fontWeight="700">
            Current Pattern: Conversational Orchestrator
          </text>
          <text x="20" y="44" fill="#94a3b8" fontSize="13">
            High reasoning model burns tokens on status meetings, routing, and summaries
          </text>

          {/* Flow Nodes */}
          <rect x="20" y="60" width="130" height="52" rx="6" fill="#1e293b" stroke="#334155" />
          <text x="85" y="84" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="600">Task Intake</text>
          <text x="85" y="100" textAnchor="middle" fill="#64748b" fontSize="13">Raw Issue</text>

          <path d="M 155 86 L 185 86" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />

          <rect x="190" y="60" width="150" height="52" rx="6" fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" />
          <text x="265" y="84" textAnchor="middle" fill="#fca5a5" fontSize="14" fontWeight="600">Frontier Lead LLM</text>
          <text x="265" y="100" textAnchor="middle" fill="#f87171" fontSize="13">Continuous Prefill</text>

          <path d="M 345 86 L 375 86" stroke="#ef4444" strokeWidth="2" />

          <rect x="380" y="60" width="130" height="52" rx="6" fill="#1e293b" stroke="#334155" />
          <text x="445" y="84" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="600">Chatty Workers</text>
          <text x="445" y="100" textAnchor="middle" fill="#94a3b8" fontSize="13">Ad-hoc Prompts</text>
        </g>

        {/* Pattern B: Deterministic Economic Scheduler */}
        <g transform="translate(35, 230)">
          <rect width="530" height="175" rx="10" fill="#0b1329" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="20" y="24" fill="#38bdf8" fontSize="15" fontWeight="700">
            Proposed Architecture: Economic Runtime &amp; Scheduler
          </text>
          <text x="20" y="44" fill="#94a3b8" fontSize="13">
            Shared state, zero-token queues, bounded execution, and deterministic gates
          </text>

          {/* Node 1: Structured Intake */}
          <rect x="20" y="60" width="115" height="52" rx="6" fill="#1e293b" stroke="#38bdf8" />
          <text x="77" y="84" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="600">Envelope</text>
          <text x="77" y="100" textAnchor="middle" fill="#38bdf8" fontSize="13">Context Pointers</text>

          {/* Arrow */}
          <path d="M 140 86 L 160 86" stroke="#38bdf8" strokeWidth="2" />

          {/* Node 2: Policy Scheduler */}
          <rect x="165" y="60" width="125" height="52" rx="6" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" />
          <text x="227" y="84" textAnchor="middle" fill="#e0f2fe" fontSize="14" fontWeight="600">Policy Scheduler</text>
          <text x="227" y="100" textAnchor="middle" fill="#7dd3fc" fontSize="13">Queue &amp; Quota</text>

          {/* Arrow */}
          <path d="M 295 86 L 315 86" stroke="#38bdf8" strokeWidth="2" />

          {/* Node 3: Leaf Workers */}
          <rect x="320" y="60" width="105" height="52" rx="6" fill="#1e293b" stroke="#10b981" />
          <text x="372" y="84" textAnchor="middle" fill="#6ee7b7" fontSize="14" fontWeight="600">Leaf Workers</text>
          <text x="372" y="100" textAnchor="middle" fill="#94a3b8" fontSize="13">Luna / Flash</text>

          {/* Arrow */}
          <path d="M 430 86 L 450 86" stroke="#38bdf8" strokeWidth="2" />

          {/* Node 4: Verifier */}
          <rect x="455" y="60" width="85" height="52" rx="6" fill="#1e293b" stroke="#a855f7" />
          <text x="497" y="84" textAnchor="middle" fill="#d8b4fe" fontSize="14" fontWeight="600">Verifier</text>
          <text x="497" y="100" textAnchor="middle" fill="#94a3b8" fontSize="13">Pass / Retry</text>

          {/* Shared Memory Bus */}
          <rect x="20" y="125" width="500" height="34" rx="6" fill="#111827" stroke="#475569" />
          <text x="270" y="147" textAnchor="middle" fill="#94a3b8" fontSize="13">
            Logical Shared State Bus (Durable Evidence, Skills, Git Worktrees, Object Refs)
          </text>
        </g>

        {/* Provenance note */}
        <text x="300" y="430" textAnchor="middle" fill="#64748b" fontSize="13">
          Systems architecture model · not benchmark data
        </text>
      </svg>
    </figure>
  );
}

export default function BlogPostPage() {
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
            <time dateTime="2026-10-26">October 26, 2026</time> ·{" "}
            <a href={marcusAuthor.links.github} target="_blank" rel="noreferrer">
              {marcusAuthor.display_name}
            </a>{" "}
            · Founder, Gaia Research
          </p>
          <h1>{articleTitle}</h1>
          <p className="blog-post-summary">
            Why are we paying reasoning prices for bookkeeping? How deterministic runtimes, global memory, and predictive economic scheduling replace expensive conversational orchestration.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={missingEconomicSchedulerThumbnail.src.src}
            width={missingEconomicSchedulerThumbnail.src.width}
            height={missingEconomicSchedulerThumbnail.src.height}
            alt={missingEconomicSchedulerThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children, ...props }) => {
                const childArray = Array.isArray(children) ? children : [children];
                const text =
                  childArray.length === 1 && typeof childArray[0] === "string" ? childArray[0] : null;

                if (text === "[[ECONOMIC_SCHEDULER_ARCHITECTURE_SVG]]") {
                  return <EconomicSchedulerArchitectureSvg />;
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
