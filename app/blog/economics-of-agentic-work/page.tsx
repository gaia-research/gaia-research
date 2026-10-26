import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import PostShareBar from "@/components/PostShareBar";
import marcusAuthor from "@/content/authors/marcus.json";
import { economicsOfAgenticWorkThumbnail } from "@/data/blog";
import postMd from "@/content/blog/economics-of-agentic-work/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/economics-of-agentic-work";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${economicsOfAgenticWorkThumbnail.src.src}`;
const articleTitle = "The Economics of Agentic Work: When Small Agents Beat Frontier Models";
const articleDescription =
  "Why does a task have to be expensive just because it is difficult? Finding the break-even point where bounded retries, domain harnesses, and competitive cheap agents beat a single frontier model.";
const publishedTime = "2026-10-26T00:00:00+08:00";

export const metadata = {
  title: articleTitle,
  description: articleDescription,
  keywords: [
    "agent economics",
    "small language models",
    "frontier models",
    "FrugalGPT",
    "Amdahl's law",
    "Brooks's law",
    "domain harness",
    "test-time compute",
    "speculative execution",
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
        url: economicsOfAgenticWorkThumbnail.src.src,
        width: 1600,
        height: 900,
        alt: economicsOfAgenticWorkThumbnail.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [economicsOfAgenticWorkThumbnail.src.src],
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

function AgentEconomicsAllocationSvg() {
  return (
    <figure className="blog-post-figure" style={figureStyle}>
      <svg
        viewBox="0 0 600 450"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="agent-econ-title agent-econ-desc"
        style={svgStyle}
      >
        <title id="agent-econ-title">Comparing Allocation Strategies by Cost per Verified Result</title>
        <desc id="agent-econ-desc">
          Horizontal comparison of total expected cost across four execution strategies: Monolithic Frontier, Bounded Cheap Retries, Speculative Cheap Racing, and Ceremonial Orchestrator Swarms.
        </desc>

        {/* Card Canvas */}
        <rect width="600" height="450" rx="16" fill="#05060a" stroke="#1e293b" strokeWidth="1.5" />

        {/* Header */}
        <text x="300" y="36" textAnchor="middle" fill="#f8fafc" fontSize="21" fontWeight="700">
          The Unit Cost of a Verified Fix
        </text>
        <text x="300" y="58" textAnchor="middle" fill="#94a3b8" fontSize="13">
          Relative cost to produce one verified patch under deterministic tests
        </text>

        {/* Strategy 1: Monolithic Frontier */}
        <g transform="translate(40, 85)">
          <text x="0" y="16" fill="#f1f5f9" fontSize="15" fontWeight="600">
            Monolithic Frontier (Single Opus / Sol)
          </text>
          <text x="520" y="16" textAnchor="end" fill="#f87171" fontSize="14" fontWeight="700">
            ~100x base cost
          </text>
          <rect x="0" y="26" width="520" height="28" rx="6" fill="#1e293b" />
          <rect x="0" y="26" width="480" height="28" rx="6" fill="#ef4444" fillOpacity="0.85" />
          <text x="14" y="45" fill="#ffffff" fontSize="13" fontWeight="600">
            High reasoning depth, full context prefill ($1.50 to $4.00 per attempt)
          </text>
        </g>

        {/* Strategy 2: Bounded Cheap Retries */}
        <g transform="translate(40, 165)">
          <text x="0" y="16" fill="#f1f5f9" fontSize="15" fontWeight="600">
            Bounded Cheap Retries (Luna / Flash + Verifier)
          </text>
          <text x="520" y="16" textAnchor="end" fill="#34d399" fontSize="14" fontWeight="700">
            ~4x base cost
          </text>
          <rect x="0" y="26" width="520" height="28" rx="6" fill="#1e293b" />
          <rect x="0" y="26" width="60" height="28" rx="6" fill="#10b981" fillOpacity="0.9" />
          <text x="75" y="45" fill="#34d399" fontSize="13" fontWeight="600">
            3 attempts with compiler stdout ($0.09 total, 25x cheaper)
          </text>
        </g>

        {/* Strategy 3: Speculative Racing */}
        <g transform="translate(40, 245)">
          <text x="0" y="16" fill="#f1f5f9" fontSize="15" fontWeight="600">
            Speculative Racing (3 Parallel Cheap Worktrees)
          </text>
          <text x="520" y="16" textAnchor="end" fill="#38bdf8" fontSize="14" fontWeight="700">
            ~5x base cost
          </text>
          <rect x="0" y="26" width="520" height="28" rx="6" fill="#1e293b" />
          <rect x="0" y="26" width="75" height="28" rx="6" fill="#38bdf8" fillOpacity="0.85" />
          <text x="90" y="45" fill="#7dd3fc" fontSize="13" fontWeight="600">
            First verified patch wins; kills tail latency without high bills
          </text>
        </g>

        {/* Strategy 4: Conversational Orchestrator Swarm */}
        <g transform="translate(40, 325)">
          <text x="0" y="16" fill="#f1f5f9" fontSize="15" fontWeight="600">
            Orchestrator Swarm (Sol Lead + 4 Workers)
          </text>
          <text x="520" y="16" textAnchor="end" fill="#fbbf24" fontSize="14" fontWeight="700">
            ~65x base cost
          </text>
          <rect x="0" y="26" width="520" height="28" rx="6" fill="#1e293b" />
          <rect x="0" y="26" width="310" height="28" rx="6" fill="#f59e0b" fillOpacity="0.85" />
          <text x="14" y="45" fill="#ffffff" fontSize="13" fontWeight="600">
            Cold cache re-entries, ticket status summaries, and coordination tax
          </text>
        </g>

        {/* Provenance note */}
        <text x="300" y="420" textAnchor="middle" fill="#64748b" fontSize="13">
          Illustrative economics model · not benchmark data
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
            Why does a task have to be expensive just because it is difficult? Finding the break-even point where bounded retries, domain harnesses, and competitive cheap agents beat a single frontier model.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={economicsOfAgenticWorkThumbnail.src.src}
            width={economicsOfAgenticWorkThumbnail.src.width}
            height={economicsOfAgenticWorkThumbnail.src.height}
            alt={economicsOfAgenticWorkThumbnail.alt}
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

                if (text === "[[AGENT_ECONOMICS_ALLOCATION_SVG]]") {
                  return <AgentEconomicsAllocationSvg />;
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
